#!/usr/bin/env python3
"""EMFD · Medien-Check: liest Dateien und Ordnerstruktur aus media/ und prüft sie auf Aktualität.

Aufruf (aus dem Repo-Wurzelordner):
    python3 tools/media_check.py              # lokal prüfen, Bericht schreiben
    python3 tools/media_check.py --server     # zusätzlich mit dem Live-Server vergleichen (nur lesen, HEAD)

Ergebnis:
    reports/media-bericht.md     lesbarer Bericht (Übersicht, Karten-Tabelle, Auffälligkeiten, Änderungen)
    reports/media-inventar.json  maschinenlesbares Inventar; dient beim nächsten Lauf als Vergleichsstand

Geprüft wird:
    1. Inventar     jede Datei mit Ordner, Größe, Bildmaß, SHA-256
    2. Echtheit     Hash-Teil im Dateinamen == Anfang der SHA-256 des Inhalts
    3. Konvention   Dateiname folgt MEDIEN-KONVENTION.md; Bildmaß passt zur Variante
    4. Aktualität   je Karte O01–O24 (+ T03): neueste Revision, ältere Revisionen, fehlende Varianten
    5. Änderungen   neu / geändert / entfernt seit dem letzten Inventar
    6. Server       (--server) liegt dieselbe Datei auf flowisaurus.de/wunderhaus/media/? (Größe, Last-Modified)

Ändert nichts in media/ und nichts am Server. Exit-Code 1 bei Fehlern (z. B. Hash passt nicht).
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import re
import struct
import sys
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_MEDIA = ROOT / "media"
DEFAULT_OUT = ROOT / "reports"
DEFAULT_SERVER = "https://flowisaurus.de/wunderhaus/media/"

CARD_IDS = [f"O{i:02d}" for i in range(1, 25)]
GROUPS = {"Ruhe": CARD_IDS[0:6], "Kraft": CARD_IDS[6:12], "Halt": CARD_IDS[12:18], "Freude": CARD_IDS[18:24]}
FRONT_VARIANTS = ["210x360", "630x1080", "896x1536"]          # overview · view · large
COVER_VARIANTS = ["160", "480", "1024"]                        # thumb · medium · large
FRONT_ORIGINAL_SIZE = (896, 1536)

ID = r"(?P<id>O(?:0[1-9]|1[0-9]|2[0-4])|T03)"
HASH = r"(?P<hash>[0-9a-f]{8,64})"
PATTERNS = [
    ("front",         re.compile(rf"^cards/fronts/{ID}-front-r(?P<rev>\d+)-{HASH}\.png$")),
    ("cover",         re.compile(rf"^covers/{ID}-cover-r(?P<rev>\d+)-{HASH}\.png$")),
    ("front-variant", re.compile(rf"^optimized/cards/{ID}-(?P<variant>\d+x\d+)-r(?P<rev>\d+)-{HASH}\.webp$")),
    ("cover-variant", re.compile(rf"^optimized/covers/{ID}-cover-(?P<variant>\d+)-r(?P<rev>\d+)-{HASH}\.webp$")),
]
SUPPORT_FILES = {".md", ".js", ".mjs", ".json", ".html", ".css", ".txt", ".csv", ".py"}
IGNORE = {".DS_Store", "Thumbs.db"}


# ---------------------------------------------------------------- Dateien lesen

def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def image_size(path: Path) -> tuple[int, int] | None:
    """Bildmaß aus dem Dateikopf (PNG, WebP, JPEG) – ohne Zusatzpakete."""
    try:
        with path.open("rb") as f:
            head = f.read(64)
            if head[:8] == b"\x89PNG\r\n\x1a\n":
                return struct.unpack(">II", head[16:24])
            if head[:4] == b"RIFF" and head[8:12] == b"WEBP":
                chunk = head[12:16]
                if chunk == b"VP8 ":
                    w, h = struct.unpack("<HH", head[26:30])
                    return w & 0x3FFF, h & 0x3FFF
                if chunk == b"VP8L":
                    b = head[21:25]
                    return 1 + (((b[1] & 0x3F) << 8) | b[0]), 1 + (((b[3] & 0x0F) << 10) | (b[2] << 2) | ((b[1] & 0xC0) >> 6))
                if chunk == b"VP8X":
                    return 1 + int.from_bytes(head[24:27], "little"), 1 + int.from_bytes(head[27:30], "little")
            if head[:2] == b"\xff\xd8":
                f.seek(2)
                while True:
                    marker = f.read(2)
                    if len(marker) < 2 or marker[0] != 0xFF:
                        return None
                    length = struct.unpack(">H", f.read(2))[0]
                    if marker[1] in (0xC0, 0xC1, 0xC2):
                        h, w = struct.unpack(">xHH", f.read(5))
                        return w, h
                    f.seek(length - 2, 1)
    except (OSError, struct.error):
        return None
    return None


def classify(rel: str) -> dict:
    for kind, rx in PATTERNS:
        m = rx.match(rel)
        if m:
            d = m.groupdict()
            return {"kind": kind, "id": d["id"], "rev": int(d["rev"]), "variant": d.get("variant"), "nameHash": d["hash"]}
    suffix = Path(rel).suffix.lower()
    if suffix in SUPPORT_FILES:
        return {"kind": "support"}
    if suffix in {".png", ".webp", ".jpg", ".jpeg", ".mp3", ".m4a", ".glb", ".svg"}:
        return {"kind": "unknown-media"}
    return {"kind": "other"}


def scan(media: Path) -> list[dict]:
    files = []
    for p in sorted(media.rglob("*")):
        if not p.is_file() or p.name in IGNORE:
            continue
        rel = p.relative_to(media).as_posix()
        info = {"path": rel, "folder": str(Path(rel).parent.as_posix()), "bytes": p.stat().st_size, "sha256": sha256(p)}
        size = image_size(p)
        if size:
            info["width"], info["height"] = size
        info.update(classify(rel))
        files.append(info)
    return files


# ---------------------------------------------------------------- Prüfungen

def check_files(files: list[dict]) -> list[dict]:
    issues = []

    def add(level, path, text):
        issues.append({"level": level, "path": path, "text": text})

    for f in files:
        k = f["kind"]
        if "nameHash" in f and not f["sha256"].startswith(f["nameHash"]):
            add("Fehler", f["path"], f"Hash im Namen ({f['nameHash']}) passt nicht zum Inhalt ({f['sha256'][:len(f['nameHash'])]}) – Datei verändert oder vertauscht.")
        if k == "unknown-media":
            add("Hinweis", f["path"], "Mediendatei folgt keiner bekannten Namenskonvention (Altbestand oder neuer Typ?).")
        if k == "other":
            add("Hinweis", f["path"], "Unerwarteter Dateityp im Medienordner.")
        w, h = f.get("width"), f.get("height")
        if k == "front-variant" and w:
            exp = tuple(map(int, f["variant"].split("x")))
            if (w, h) != exp:
                add("Fehler", f["path"], f"Bildmaß {w}×{h} passt nicht zur Variante {f['variant']}.")
        if k == "cover-variant" and w and w != int(f["variant"]):
            add("Fehler", f["path"], f"Breite {w} passt nicht zur Variante {f['variant']}.")
        if k == "front" and w and (w, h) != FRONT_ORIGINAL_SIZE:
            add("Warnung", f["path"], f"Vorderseite hat {w}×{h}, erwartet {FRONT_ORIGINAL_SIZE[0]}×{FRONT_ORIGINAL_SIZE[1]}.")
        if k == "front-variant" and f["variant"] not in FRONT_VARIANTS:
            add("Hinweis", f["path"], f"Unbekannte Kartenvariante {f['variant']}.")
        if k == "cover-variant" and f["variant"] not in COVER_VARIANTS:
            add("Hinweis", f["path"], f"Unbekannte Covervariante {f['variant']}.")
    return issues


def card_status(files: list[dict]) -> tuple[dict, list[dict]]:
    """Je Karte: neueste Revision von Vorderseite/Cover, vorhandene Varianten, ältere Revisionen."""
    by = {}
    for f in files:
        if "id" in f:
            by.setdefault(f["id"], {}).setdefault(f["kind"], []).append(f)

    issues, cards = [], {}
    for cid in CARD_IDS + ["T03"]:
        entry = by.get(cid, {})
        row = {}
        for base, var_kind, wanted in (("front", "front-variant", FRONT_VARIANTS), ("cover", "cover-variant", COVER_VARIANTS)):
            originals = entry.get(base, [])
            variants = entry.get(var_kind, [])
            revs = sorted({f["rev"] for f in originals + variants})
            if not revs:
                row[base] = None
                continue
            newest = revs[-1]
            orig_new = [f for f in originals if f["rev"] == newest]
            have = sorted({f["variant"] for f in variants if f["rev"] == newest}, key=lambda v: wanted.index(v) if v in wanted else 99)
            missing = [v for v in wanted if v not in have]
            older = sorted(f["path"] for f in originals + variants if f["rev"] < newest)
            dup = [v for v in wanted if sum(1 for f in variants if f["rev"] == newest and f["variant"] == v) > 1]
            row[base] = {"rev": newest, "original": orig_new[0]["path"] if orig_new else None,
                         "variants": have, "missing": missing, "older": older}
            label = "Vorderseite" if base == "front" else "Cover"
            if not orig_new:
                issues.append({"level": "Warnung", "path": cid, "text": f"{label} r{newest}: Varianten vorhanden, aber Original-PNG fehlt."})
            if missing:
                issues.append({"level": "Warnung", "path": cid, "text": f"{label} r{newest}: Varianten fehlen: {', '.join(missing)}."})
            if older:
                issues.append({"level": "Hinweis", "path": cid, "text": f"{label}: {len(older)} Datei(en) älterer Revision liegen noch (nur Fallback, nie überschreiben/löschen ohne Freigabe)."})
            if dup or len(orig_new) > 1:
                issues.append({"level": "Warnung", "path": cid, "text": f"{label} r{newest}: mehrere Dateien gleicher Revision – welche gilt?"})
        cards[cid] = row
    return cards, issues


def diff(old: dict | None, files: list[dict]) -> dict:
    if not old:
        return {"base": None, "added": [], "changed": [], "removed": []}
    prev = {f["path"]: f["sha256"] for f in old.get("files", [])}
    now = {f["path"]: f["sha256"] for f in files}
    return {
        "base": old.get("generatedAt"),
        "added": sorted(p for p in now if p not in prev),
        "changed": sorted(p for p in now if p in prev and prev[p] != now[p]),
        "removed": sorted(p for p in prev if p not in now),
    }


def server_check(files: list[dict], base: str, workers: int = 8) -> dict:
    """HEAD je Datei. Nur lesen. Liefert je Pfad: online, Größe gleich?, Last-Modified."""
    def head(f):
        url = base + urllib.request.quote(f["path"])
        req = urllib.request.Request(url, method="HEAD", headers={"User-Agent": "emfd-media-check/1.0", "Cache-Control": "no-cache"})
        try:
            with urllib.request.urlopen(req, timeout=20) as r:
                length = r.headers.get("Content-Length")
                ctype = (r.headers.get("Content-Type") or "").split(";")[0]
                res = {"status": r.status, "bytes": int(length) if length and length.isdigit() else None,
                       "lastModified": r.headers.get("Last-Modified"), "contentType": ctype}
        except urllib.error.HTTPError as e:
            res = {"status": e.code}
        except Exception as e:  # Netz gesperrt, Zeitüberschreitung …
            res = {"status": None, "error": str(e)[:120]}
        if res.get("status") == 200:
            if res.get("bytes") is None:
                res["state"] = "online (Größe unbekannt)"
            elif res["bytes"] == f["bytes"]:
                res["state"] = "aktuell"
            else:
                res["state"] = "abweichend"
            if f["path"].endswith((".png", ".webp")) and res.get("contentType", "").startswith("text/"):
                res["state"] = "abweichend"   # weiche 404-Seite statt Bild
        elif res.get("status") == 404:
            res["state"] = "fehlt online"
        else:
            res["state"] = "nicht prüfbar"
        return f["path"], res

    with ThreadPoolExecutor(max_workers=workers) as ex:
        return dict(ex.map(head, files))


# ---------------------------------------------------------------- Bericht

def human(n: int) -> str:
    for unit in ("B", "KB", "MB", "GB"):
        if n < 1024 or unit == "GB":
            return f"{n:.0f} {unit}" if unit == "B" else f"{n:.1f} {unit}"
        n /= 1024
    return str(n)


def tree(files: list[dict]) -> list[str]:
    """Ordnerbaum mit Dateizahl und Größe je Ordner (inkl. Unterordner)."""
    stats = {}
    for f in files:
        parts = Path(f["path"]).parent.parts
        for i in range(len(parts) + 1):
            key = "/".join(parts[:i])
            n, b, own = stats.get(key, (0, 0, 0))
            stats[key] = (n + 1, b + f["bytes"], own + (1 if i == len(parts) else 0))
    lines = [f"{'media/':<36} {stats[''][0]:>4} Dateien  {human(stats[''][1]):>9}"]
    for key in sorted(k for k in stats if k):
        depth = key.count("/") + 1
        n, b, _ = stats[key]
        name = "  " * depth + key.split("/")[-1] + "/"
        lines.append(f"{name:<36} {n:>4} Dateien  {human(b):>9}")
    return lines


def cell(info: dict | None) -> str:
    if not info:
        return "—"
    s = f"r{info['rev']}"
    s += " ✓" if not info["missing"] and info["original"] else " ⚠"
    if info["older"]:
        s += f" (+{len(info['older'])} alt)"
    return s


def report(inv: dict) -> str:
    files, cards, issues, changes, server = inv["files"], inv["cards"], inv["issues"], inv["changes"], inv.get("server")
    counts = {lvl: sum(1 for i in issues if i["level"] == lvl) for lvl in ("Fehler", "Warnung", "Hinweis")}
    fronts = sum(1 for c in CARD_IDS if cards[c]["front"])
    covers = sum(1 for c in CARD_IDS + ["T03"] if cards[c]["cover"])
    L = [
        "# Medien-Check · media/",
        "",
        f"Erstellt: {inv['generatedAt']} · Werkzeug `tools/media_check.py` · {len(files)} Dateien, {human(sum(f['bytes'] for f in files))}",
        "",
        "## Ergebnis",
        "",
        f"- Vorderseiten: **{fronts}/24** Karten · Cover: **{covers}/25** (O01–O24 + T03)",
        f"- Ohne Vorderseite: {', '.join(c for c in CARD_IDS if not cards[c]['front']) or 'keine'}",
        f"- Ohne Cover: {', '.join(c for c in CARD_IDS + ['T03'] if not cards[c]['cover']) or 'keine'}",
        f"- Fehler: **{counts['Fehler']}** · Warnungen: **{counts['Warnung']}** · Hinweise: **{counts['Hinweis']}**",
    ]
    if changes["base"]:
        L.append(f"- Seit {changes['base']}: {len(changes['added'])} neu, {len(changes['changed'])} geändert, {len(changes['removed'])} entfernt")
    else:
        L.append("- Erster Lauf: kein Vergleichsstand vorhanden.")
    if server:
        st = {}
        for r in server["files"].values():
            st[r["state"]] = st.get(r["state"], 0) + 1
        L.append(f"- Server ({server['base']}, {server['checkedAt']}): " + " · ".join(f"{k}: **{v}**" for k, v in sorted(st.items())))
    L += ["", "## Ordnerstruktur", "", "```", *tree(files), "```", "",
          "## Karten", "",
          "✓ = neueste Revision vollständig (Original + alle Varianten) · ⚠ = unvollständig · — = nicht vorhanden · (+n alt) = ältere Revisionen liegen noch", ""]
    L.append("| Gruppe | Karte | Vorderseite | fehlende Varianten | Cover | fehlende Varianten |")
    L.append("|---|---|---|---|---|---|")
    for group, ids in list(GROUPS.items()) + [("Theme", ["T03"])]:
        for cid in ids:
            fr, co = cards[cid]["front"], cards[cid]["cover"]
            fm = ", ".join(fr["missing"]) if fr and fr["missing"] else ""
            cm = ", ".join(co["missing"]) if co and co["missing"] else ""
            L.append(f"| {group} | {cid} | {'— (Theme)' if cid == 'T03' else cell(fr)} | {fm} | {cell(co)} | {cm} |")
    L += ["", "## Auffälligkeiten", ""]
    if issues:
        L += ["| Stufe | Datei / Karte | Befund |", "|---|---|---|"]
        order = {"Fehler": 0, "Warnung": 1, "Hinweis": 2}
        for i in sorted(issues, key=lambda i: (order[i["level"]], i["path"])):
            L.append(f"| {i['level']} | `{i['path']}` | {i['text']} |")
    else:
        L.append("Keine.")
    if changes["base"] and (changes["added"] or changes["changed"] or changes["removed"]):
        L += ["", f"## Änderungen seit {changes['base']}", ""]
        for title, key in (("Neu", "added"), ("Geändert (Inhalt anders – Konvention verbietet Überschreiben!)", "changed"), ("Entfernt", "removed")):
            if changes[key]:
                L += [f"**{title}**", ""] + [f"- `{p}`" for p in changes[key]] + [""]
    if server:
        bad = {p: r for p, r in server["files"].items() if r["state"] != "aktuell"}
        L += ["", "## Server-Abgleich", "", f"Quelle: {server['base']} (nur HEAD-Abfragen, nichts verändert).", ""]
        if bad:
            L += ["| Datei | Zustand | Server-Größe | lokal | Last-Modified |", "|---|---|---|---|---|"]
            local = {f["path"]: f["bytes"] for f in files}
            for p in sorted(bad):
                r = bad[p]
                L.append(f"| `{p}` | {r['state']}{' (HTTP ' + str(r['status']) + ')' if r.get('status') not in (200, 404) else ''} | {r.get('bytes') or '—'} | {local[p]} | {r.get('lastModified') or '—'} |")
        else:
            L.append("Alle Dateien liegen identisch (gleiche Größe) auf dem Server.")
    L += ["", "## Dateien", "", "| Datei | Typ | Rev | Maß | Größe | SHA-256 (Anfang) |", "|---|---|---|---|---|---|"]
    for f in files:
        dim = f"{f['width']}×{f['height']}" if "width" in f else ""
        L.append(f"| `{f['path']}` | {f['kind']} | {('r' + str(f['rev'])) if 'rev' in f else ''} | {dim} | {human(f['bytes'])} | `{f['sha256'][:12]}` |")
    return "\n".join(L) + "\n"


# ---------------------------------------------------------------- Ablauf

def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description="Dateien und Ordnerstruktur aus media/ auslesen und auf Aktualität prüfen.")
    ap.add_argument("--media", type=Path, default=DEFAULT_MEDIA, help="Medienordner (Standard: media/)")
    ap.add_argument("--out", type=Path, default=DEFAULT_OUT, help="Ausgabeordner (Standard: reports/)")
    ap.add_argument("--vergleich", type=Path, help="Altes Inventar zum Vergleich (Standard: vorhandenes reports/media-inventar.json)")
    ap.add_argument("--server", nargs="?", const=DEFAULT_SERVER, metavar="URL", help=f"Mit Server vergleichen (Standard: {DEFAULT_SERVER})")
    ap.add_argument("--nur-anzeigen", action="store_true", help="Nichts schreiben, nur Zusammenfassung ausgeben")
    args = ap.parse_args(argv)

    media = args.media.resolve()
    if not media.is_dir():
        print(f"Medienordner nicht gefunden: {media}", file=sys.stderr)
        return 2
    old_path = args.vergleich or (args.out / "media-inventar.json")
    old = json.loads(old_path.read_text(encoding="utf-8")) if old_path.is_file() else None

    files = scan(media)
    cards, card_issues = card_status(files)
    inv = {
        "tool": "emfd-media-check/1.0",
        "generatedAt": dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat(),
        "mediaRoot": media.relative_to(ROOT).as_posix() if media.is_relative_to(ROOT) else str(media),
        "files": files,
        "cards": cards,
        "issues": check_files(files) + card_issues,
        "changes": diff(old, files),
    }
    if args.server:
        base = args.server if args.server.endswith("/") else args.server + "/"
        inv["server"] = {"base": base, "checkedAt": inv["generatedAt"], "files": server_check(files, base)}

    errors = sum(1 for i in inv["issues"] if i["level"] == "Fehler")
    c = inv["changes"]
    print(f"{len(files)} Dateien · Vorderseiten {sum(1 for x in CARD_IDS if cards[x]['front'])}/24 · "
          f"Cover {sum(1 for x in CARD_IDS + ['T03'] if cards[x]['cover'])}/25 · "
          f"Fehler {errors} · Warnungen {sum(1 for i in inv['issues'] if i['level'] == 'Warnung')}")
    if c["base"]:
        print(f"Seit {c['base']}: {len(c['added'])} neu, {len(c['changed'])} geändert, {len(c['removed'])} entfernt")
    if "server" in inv:
        st = {}
        for r in inv["server"]["files"].values():
            st[r["state"]] = st.get(r["state"], 0) + 1
        print("Server: " + ", ".join(f"{k} {v}" for k, v in sorted(st.items())))

    if not args.nur_anzeigen:
        args.out.mkdir(parents=True, exist_ok=True)
        (args.out / "media-inventar.json").write_text(json.dumps(inv, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        (args.out / "media-bericht.md").write_text(report(inv), encoding="utf-8")
        print(f"Bericht: {(args.out / 'media-bericht.md').relative_to(ROOT) if args.out.resolve().is_relative_to(ROOT) else args.out / 'media-bericht.md'}")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())

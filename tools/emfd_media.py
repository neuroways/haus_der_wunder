#!/usr/bin/env python3
"""EMFD-MEDIA-CORE-01 · Werkzeug fuer die zentrale Medienverwaltung.

Alle Befehle arbeiten rein lesend gegenueber dem Server. Es gibt keinen Befehl,
der Dateien auf den Server schreibt, loescht oder ueberschreibt.

Befehle
  stage        Neue Nutzerdateien (Vorderseiten, Cover) in versionierte Upload-Dateien + Varianten ueberfuehren (lokal)
  build        Manifest v2 aus Uebergabedaten, Staging, optionalem Inventar und optionalem Live-Manifest erzeugen
  scan-dir     Lokale Kopie/Spiegel von /wunderhaus/media rekursiv pruefen (Signatur, Masse, Alpha, SHA-256)
  import-list  Server-Dateiliste (find/ls -lR/FTP-Liste/Textliste) als Inventar importieren
  http-check   Live-URLs per HTTP pruefen (HEAD + Range-GET, kein Schreiben)
  reconcile    Inventar gegen Manifest/Soll abgleichen -> Bestandsbericht (MD/CSV/JSON)
  validate     Manifest gegen Schema und Projektregeln pruefen (--release fuer Veroeffentlichungsfreigabe)

Nur Python-Standardbibliothek; Pillow optional (stage, tiefe Decodierpruefung), jsonschema optional.
"""
from __future__ import annotations

import argparse
import csv
import datetime as dt
import hashlib
import io
import json
import os
import re
import struct
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

TOOL_VERSION = "1.0.0"
SCHEMA_ID = "emfd-media-core"
SCHEMA_VERSION = "2.0.0"
DEFAULT_BASE = "https://flowisaurus.de/wunderhaus/media/"

AVAILABILITY = ["verified", "listed", "referenced", "staged", "archived", "missing", "broken"]
RELEASE = ["approved", "internal", "review", "test", "superseded", "archive"]

CARD_IDS = [f"O{i:02d}" for i in range(1, 25)]


# --------------------------------------------------------------------------- helpers

def now_iso() -> str:
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def sha256_bytes(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()


def sha256_file(p: Path) -> str:
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def load_json(p) -> dict:
    with open(p, encoding="utf-8-sig") as f:
        return json.load(f)


def write_json(p, data) -> None:
    p = Path(p)
    p.parent.mkdir(parents=True, exist_ok=True)
    tmp = p.with_suffix(p.suffix + ".tmp")
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
        f.write("\n")
    os.replace(tmp, p)  # atomar


def norm_media_path(p: str | None) -> str | None:
    """'/media/x', '../media/x', 'media/x', '/wunderhaus/media/x' -> 'x' (relativ zum Manifest)."""
    if not p:
        return None
    p = p.strip().replace("\\", "/")
    p = re.sub(r"^https?://[^/]+", "", p)
    for prefix in ("/wunderhaus/media/", "../media/", "/media/", "media/", "./"):
        if p.startswith(prefix):
            p = p[len(prefix):]
            break
    return p.lstrip("/")


# --------------------------------------------------------------------------- sniffing

def sniff(head: bytes, total_size: int | None = None) -> dict:
    """Erkennt Format aus den ersten Bytes. Liefert mime, width, height, alpha, note."""
    r = {"mime": None, "width": None, "height": None, "alpha": None, "kind": None, "note": None}
    if len(head) >= 24 and head[:8] == b"\x89PNG\r\n\x1a\n":
        w, h = struct.unpack(">II", head[16:24])
        ctype = head[25] if len(head) > 25 else None
        r.update(mime="image/png", kind="image", width=w, height=h)
        if ctype is not None:
            r["alpha"] = ctype in (4, 6)
            if ctype == 3 and b"tRNS" in head[:4096]:
                r["alpha"] = True
        return r
    if head[:3] == b"\xff\xd8\xff":
        r.update(mime="image/jpeg", kind="image", alpha=False)
        i = 2
        while i + 9 < len(head):
            if head[i] != 0xFF:
                i += 1
                continue
            marker = head[i + 1]
            if marker in (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF):
                h, w = struct.unpack(">HH", head[i + 5:i + 9])
                r.update(width=w, height=h)
                return r
            if marker in (0xD8, 0x01) or 0xD0 <= marker <= 0xD7:
                i += 2
                continue
            seg = struct.unpack(">H", head[i + 2:i + 4])[0]
            i += 2 + seg
        r["note"] = "JPEG-Masse nicht im gelesenen Kopfbereich"
        return r
    if len(head) >= 30 and head[:4] == b"RIFF" and head[8:12] == b"WEBP":
        r.update(mime="image/webp", kind="image")
        chunk = head[12:16]
        if chunk == b"VP8X":
            flags = head[20]
            r["alpha"] = bool(flags & 0x10)
            w = 1 + int.from_bytes(head[24:27], "little")
            h = 1 + int.from_bytes(head[27:30], "little")
            r.update(width=w, height=h)
        elif chunk == b"VP8L":
            b = head[21:25]
            bits = int.from_bytes(b, "little")
            r.update(width=(bits & 0x3FFF) + 1, height=((bits >> 14) & 0x3FFF) + 1, alpha=bool((bits >> 28) & 1))
        elif chunk == b"VP8 ":
            w, h = struct.unpack("<HH", head[26:30])
            r.update(width=w & 0x3FFF, height=h & 0x3FFF, alpha=False)
        return r
    if head[:3] == b"ID3" or (len(head) > 1 and head[0] == 0xFF and (head[1] & 0xE0) == 0xE0):
        r.update(mime="audio/mpeg", kind="audio")
        return r
    if head[:4] == b"glTF":
        r.update(mime="model/gltf-binary", kind="model")
        return r
    txt = head[:512].lstrip().lower()
    if txt.startswith(b"<!doctype html") or txt.startswith(b"<html") or b"<head" in txt[:200]:
        r.update(mime="text/html", kind="html", note="HTML statt Mediendatei")
        return r
    if txt.startswith(b"<svg") or (txt.startswith(b"<?xml") and b"<svg" in head[:2048].lower()):
        r.update(mime="image/svg+xml", kind="image")
        return r
    if txt[:1] in (b"{", b"["):
        r.update(mime="application/json", kind="data")
        return r
    r["note"] = "unbekannte Signatur"
    return r


EXT_MIME = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp",
            ".mp3": "audio/mpeg", ".glb": "model/gltf-binary", ".gltf": "model/gltf+json",
            ".svg": "image/svg+xml", ".json": "application/json", ".avif": "image/avif",
            ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css",
            ".md": "text/markdown", ".csv": "text/csv"}
TEXT_TYPES = {"text/javascript", "text/css", "text/markdown", "text/csv"}


def mime_from_ext(path: str) -> str | None:
    return EXT_MIME.get(Path(path).suffix.lower())


def deep_decode(path: Path) -> str | None:
    """Optionale Vollpruefung mit Pillow. Gibt Fehlertext oder None zurueck."""
    try:
        from PIL import Image  # type: ignore
    except Exception:
        return None
    try:
        with Image.open(path) as im:
            im.load()
    except Exception as e:  # noqa: BLE001
        return f"nicht decodierbar: {e}"
    return None


def mp3_duration_estimate(head: bytes, size: int) -> float | None:
    """Grobe Dauer aus erstem MPEG-Frame (CBR-Annahme bzw. Xing-Header)."""
    i = 0
    if head[:3] == b"ID3" and len(head) >= 10:
        sz = (head[6] << 21) | (head[7] << 14) | (head[8] << 7) | head[9]
        i = 10 + sz
    while i + 4 < len(head):
        if head[i] == 0xFF and (head[i + 1] & 0xE0) == 0xE0:
            b1, b2 = head[i + 1], head[i + 2]
            ver = (b1 >> 3) & 3
            layer = (b1 >> 1) & 3
            br_idx = (b2 >> 4) & 0xF
            sr_idx = (b2 >> 2) & 3
            if ver == 3 and layer == 1 and 0 < br_idx < 15 and sr_idx < 3:
                br = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320][br_idx] * 1000
                sr = [44100, 48000, 32000][sr_idx]
                xing = head.find(b"Xing", i, i + 64)
                if xing < 0:
                    xing = head.find(b"Info", i, i + 64)
                if xing > 0 and xing + 12 <= len(head):
                    flags = struct.unpack(">I", head[xing + 4:xing + 8])[0]
                    if flags & 1:
                        frames = struct.unpack(">I", head[xing + 8:xing + 12])[0]
                        return round(frames * 1152 / sr, 1)
                return round((size - i) * 8 / br, 1)
        i += 1
    return None


# --------------------------------------------------------------------------- stage

STAGE_MAP_DEFAULT = {
    # Projektdatei -> (Kartenkennung, Rolle). C024 ist laut Bildinhalt "Die schraege Tasse · O24".
    **{f"O{i:02d}.png": (f"O{i:02d}", "front") for i in range(1, 25)},
    **{f"C{i:02d}.png": (f"O{i:02d}", "cover") for i in range(1, 25)},
    "C024.png": ("O24", "cover"),
    "T03.png": ("T03", "cover"), "C25.png": ("T03", "cover"), "THEME.png": ("T03", "cover"),
}

FRONT_SIZES = [("overview", 210, 360), ("view", 630, 1080), ("large", 896, 1536)]
COVER_SIZES = [("thumb", 160, 160), ("medium", 480, 480), ("large", 1024, 1024)]


def cmd_stage(a) -> int:
    try:
        from PIL import Image  # type: ignore
    except Exception:
        print("stage benoetigt Pillow (pip install pillow)", file=sys.stderr)
        return 2
    src = Path(a.input)
    out = Path(a.out)
    staged = {"kind": "emfd-media-staging", "toolVersion": TOOL_VERSION, "createdAt": now_iso(),
              "source": str(src), "frontRevision": a.front_revision, "coverRevision": a.cover_revision,
              "items": [], "ignored": []}
    for f in sorted(src.iterdir()):
        if f.suffix.lower() not in (".png", ".jpg", ".jpeg", ".webp"):
            continue
        key = f.name if f.name in STAGE_MAP_DEFAULT else f.stem.upper() + ".png"
        if key not in STAGE_MAP_DEFAULT:
            staged["ignored"].append({"file": f.name, "reason": "Dateiname keiner Kennung zuordenbar"})
            continue
        owner, role = STAGE_MAP_DEFAULT[key]
        raw = f.read_bytes()
        h = sha256_bytes(raw)
        with Image.open(io.BytesIO(raw)) as im:
            im.load()
            w, hgt = im.size
            alpha = im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info)
            if role == "front" and (w, hgt) != (896, 1536):
                staged["ignored"].append({"file": f.name, "reason": f"Vorderseite erwartet 896x1536, ist {w}x{hgt}"})
                continue
            if role == "cover" and w != hgt:
                staged["ignored"].append({"file": f.name, "reason": f"Cover nicht quadratisch ({w}x{hgt})"})
                continue
            rev = a.front_revision if role == "front" else a.cover_revision
            ext = f.suffix.lower().replace(".jpeg", ".jpg")
            if role == "front":
                orig_rel = f"cards/fronts/{owner}-front-r{rev}-{h[:8]}{ext}"
                sizes = FRONT_SIZES
                opt_dir = "optimized/cards"
                stem = f"{owner}"
            else:
                orig_rel = f"covers/{owner}-cover-r{rev}-{h[:8]}{ext}"
                sizes = COVER_SIZES
                opt_dir = "optimized/covers"
                stem = f"{owner}-cover"
            item = {"owner": owner, "role": role, "revision": rev, "sourceFile": f.name, "sourceSha256": h,
                    "alpha": alpha, "variants": {}}
            dst = out / orig_rel
            dst.parent.mkdir(parents=True, exist_ok=True)
            dst.write_bytes(raw)
            item["variants"]["original"] = {"path": orig_rel, "mime": mime_from_ext(orig_rel), "width": w,
                                            "height": hgt, "bytes": len(raw), "sha256": h}
            base = im.convert("RGBA" if alpha else "RGB")
            for name, tw, th in sizes:
                if (tw, th) == (w, hgt) and name != "large":
                    continue
                if tw > w or th > hgt:  # nie hochskalieren
                    continue
                rs = base.resize((tw, th), Image.LANCZOS)
                buf = io.BytesIO()
                rs.save(buf, "WEBP", quality=88, method=6)
                vb = buf.getvalue()
                vh = sha256_bytes(vb)
                size_tag = f"{tw}x{th}" if role == "front" else f"{tw}"
                rel = f"{opt_dir}/{stem}-{size_tag}-r{rev}-{vh[:10]}.webp"
                (out / rel).parent.mkdir(parents=True, exist_ok=True)
                (out / rel).write_bytes(vb)
                item["variants"][name] = {"path": rel, "mime": "image/webp", "width": tw, "height": th,
                                          "bytes": len(vb), "sha256": vh, "derivedFrom": "original",
                                          "encoder": "Pillow WEBP q88 m6 LANCZOS"}
        staged["items"].append(item)
    write_json(a.staged_json, staged)
    print(f"{len(staged['items'])} Dateien vorbereitet, {len(staged['ignored'])} ignoriert -> {a.staged_json}")
    for ig in staged["ignored"]:
        print("  ignoriert:", ig["file"], "-", ig["reason"])
    return 0


# --------------------------------------------------------------------------- inventories

def inventory_doc(source: str, mode: str, files: dict, complete: bool) -> dict:
    return {"kind": "emfd-media-inventory", "toolVersion": TOOL_VERSION, "createdAt": now_iso(),
            "source": source, "mode": mode, "complete": complete, "files": files}


def cmd_scan_dir(a) -> int:
    root = Path(a.dir)
    files = {}
    for p in sorted(root.rglob("*")):
        if not p.is_file() or p.name.startswith("."):
            continue
        rel = p.relative_to(root).as_posix()
        with open(p, "rb") as f:
            head = f.read(65536)
        size = p.stat().st_size
        s = sniff(head, size)
        rec = {"bytes": size, "sha256": sha256_file(p), "mime": s["mime"], "width": s["width"],
               "height": s["height"], "alpha": s["alpha"], "signatureOk": None, "problems": []}
        exp = mime_from_ext(rel)
        if exp in TEXT_TYPES:
            s["mime"] = exp  # Textdateien haben keine Binaersignatur
        if exp and s["mime"] and exp != s["mime"]:
            rec["problems"].append(f"Endung {exp}, Inhalt {s['mime']}")
        if s["kind"] == "html" and exp != "text/html":
            rec["problems"].append("HTML-Inhalt")
        if s["mime"] == "audio/mpeg":
            rec["durationEstimate"] = mp3_duration_estimate(head, size)
        if a.deep and s["kind"] == "image" and s["mime"] != "image/svg+xml":
            err = deep_decode(p)
            if err:
                rec["problems"].append(err)
        if size == 0:
            rec["problems"].append("leere Datei")
        rec["signatureOk"] = not rec["problems"] and (exp is None or s["mime"] == exp)
        files[rel] = rec
    doc = inventory_doc(f"dir:{root}", "scan-dir", files, complete=True)
    write_json(a.out, doc)
    bad = sum(1 for r in files.values() if r["problems"])
    print(f"{len(files)} Dateien gescannt, {bad} mit Befund -> {a.out}")
    return 0


LS_RE = re.compile(r"^[-dlrwxsStT]{10}\S*\s+\d+\s+\S+\s+\S+\s+(\d+)\s+\S+\s+\S+\s+\S+\s+(.+)$")


def cmd_import_list(a) -> int:
    """Akzeptiert: 'pfad', 'groesse pfad', 'pfad;groesse', find -printf '%s %P\\n', ls -lR."""
    root_marker = a.strip_prefix
    files = {}
    cur_dir = ""
    for raw in Path(a.list).read_text(encoding="utf-8", errors="replace").splitlines():
        line = raw.rstrip()
        if not line or line.startswith("total "):
            continue
        if line.endswith(":") and not line.startswith("-"):
            cur_dir = line[:-1].rstrip("/")
            continue
        size = None
        m = LS_RE.match(line)
        if m:
            if line.startswith("d"):
                continue
            size, name = int(m.group(1)), m.group(2)
            path = f"{cur_dir}/{name}" if cur_dir else name
        elif ";" in line:
            parts = line.split(";")
            path = parts[0]
            size = int(parts[1]) if len(parts) > 1 and parts[1].strip().isdigit() else None
        else:
            parts = line.split(None, 1)
            if len(parts) == 2 and parts[0].isdigit():
                size, path = int(parts[0]), parts[1]
            else:
                path = line
        path = path.strip().replace("\\", "/")
        if root_marker and root_marker in path:
            path = path.split(root_marker, 1)[1]
        path = norm_media_path(path) or ""
        if not path or path.endswith("/") or Path(path).name.startswith("."):
            continue
        if not Path(path).suffix:
            continue  # Verzeichnisnamen ohne Endung
        files[path] = {"bytes": size, "sha256": None, "mime": mime_from_ext(path), "width": None,
                       "height": None, "alpha": None, "signatureOk": None, "problems": []}
    doc = inventory_doc(f"list:{a.list}", "import-list", files, complete=True)
    write_json(a.out, doc)
    print(f"{len(files)} Pfade importiert -> {a.out} (ohne Bytepruefung; fuer Signaturen http-check ausfuehren)")
    return 0


def http_probe(url: str, timeout: float, want_range: bool) -> dict:
    rec = {"url": url, "httpStatus": None, "finalUrl": None, "contentType": None, "bytes": None,
           "etag": None, "lastModified": None, "cacheControl": None, "acceptRanges": None,
           "rangeStatus": None, "mime": None, "width": None, "height": None, "alpha": None,
           "signatureOk": None, "problems": []}
    hdrs = {"User-Agent": f"emfd-media-check/{TOOL_VERSION} (read-only)"}
    try:
        req = urllib.request.Request(url, method="HEAD", headers=hdrs)
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            rec["httpStatus"] = resp.status
            rec["finalUrl"] = resp.geturl()
            h = resp.headers
            rec["contentType"] = h.get("Content-Type")
            rec["bytes"] = int(h["Content-Length"]) if h.get("Content-Length", "").isdigit() else None
            rec["etag"] = h.get("ETag")
            rec["lastModified"] = h.get("Last-Modified")
            rec["cacheControl"] = h.get("Cache-Control")
            rec["acceptRanges"] = h.get("Accept-Ranges")
    except urllib.error.HTTPError as e:
        rec["httpStatus"] = e.code
        rec["problems"].append(f"HTTP {e.code}")
        return rec
    except Exception as e:  # noqa: BLE001
        rec["problems"].append(f"Netzwerkfehler: {e}")
        return rec
    try:
        rh = dict(hdrs)
        rh["Range"] = "bytes=0-65535"
        req = urllib.request.Request(url, headers=rh)
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            rec["rangeStatus"] = resp.status
            head = resp.read(65536)
            cr = resp.headers.get("Content-Range", "")
            if rec["bytes"] is None and "/" in cr and cr.rsplit("/", 1)[1].isdigit():
                rec["bytes"] = int(cr.rsplit("/", 1)[1])
    except Exception as e:  # noqa: BLE001
        rec["problems"].append(f"Range-Abruf fehlgeschlagen: {e}")
        return rec
    s = sniff(head, rec["bytes"])
    rec.update(mime=s["mime"], width=s["width"], height=s["height"], alpha=s["alpha"])
    exp = mime_from_ext(urllib.parse.urlparse(url).path)
    ctype = (rec["contentType"] or "").split(";")[0].strip().lower()
    if s["kind"] == "html":
        rec["problems"].append("200 mit HTML-Inhalt (Fallback-Seite statt Medium)")
    if exp and s["mime"] and s["mime"] != exp:
        rec["problems"].append(f"Signatur {s['mime']} passt nicht zu Endung {exp}")
    if exp and ctype and ctype != exp and not (exp == "audio/mpeg" and ctype in ("audio/mp3",)):
        rec["problems"].append(f"Content-Type {ctype} statt {exp}")
    if want_range and rec["rangeStatus"] != 206:
        rec["problems"].append(f"Range-Anfrage liefert {rec['rangeStatus']} statt 206 (iOS-Audio braucht 206)")
    if rec["finalUrl"] and rec["finalUrl"] != url:
        rec["problems"].append(f"Umleitung auf {rec['finalUrl']}")
    if s["mime"] == "audio/mpeg" and rec["bytes"]:
        rec["durationEstimate"] = mp3_duration_estimate(head, rec["bytes"])
    rec["signatureOk"] = not [p for p in rec["problems"] if not p.startswith("Umleitung")]
    return rec


def collect_manifest_paths(manifest: dict) -> list[str]:
    core = manifest.get("mediaCore", manifest)
    paths = []
    for asset in core.get("assets", {}).values():
        for v in asset.get("variants", {}).values():
            if v.get("path"):
                paths.append(v["path"])
    return sorted(set(paths))


def cmd_http_check(a) -> int:
    base = a.base if a.base.endswith("/") else a.base + "/"
    paths: list[str] = []
    if a.manifest:
        paths += collect_manifest_paths(load_json(a.manifest))
    if a.paths:
        paths += [norm_media_path(l) for l in Path(a.paths).read_text(encoding="utf-8").splitlines() if l.strip()]
    if a.inventory_csv:
        with open(a.inventory_csv, encoding="utf-8-sig") as f:
            for row in csv.DictReader(f, delimiter=";"):
                paths.append(row["Pfad_relativ_zu_media"])
    paths = sorted(set(p for p in paths if p))
    if a.only:
        paths = [p for p in paths if re.search(a.only, p)]
    files = {}
    for i, p in enumerate(paths, 1):
        url = urllib.parse.urljoin(base, urllib.parse.quote(p))
        rec = http_probe(url, a.timeout, want_range=p.lower().endswith(".mp3"))
        files[p] = rec
        flag = "OK " if rec["signatureOk"] else "!! "
        print(f"[{i}/{len(paths)}] {flag}{rec['httpStatus']} {p} {'; '.join(rec['problems'])}")
    doc = inventory_doc(f"http:{base}", "http-check", files, complete=False)
    write_json(a.out, doc)
    print(f"-> {a.out}")
    return 0


# --------------------------------------------------------------------------- build

OPT_RE = re.compile(r"^optimized/(?P<dir>[a-z]+)/(?P<base>.+?)-(?P<size>\d+(?:x\d+)?)-v1-(?P<hash>[0-9a-f]{10})\.webp$")


# Lokaler Upload-Bestand: entspricht /wunderhaus/media/ (Repo-Ordner media/)
LOCAL_MEDIA = Path(__file__).resolve().parent.parent / "media"


class Builder:
    def __init__(self, handoff: Path, staged: dict | None, inventory: dict | None, live: dict | None,
                 assignments: list[dict] | None = None, room_music_map: Path | None = None):
        self.assignments = assignments or []
        # Live-Fassung der App-Zuordnung (z. B. live/home/room-music-map.json) hat Vorrang vor der Uebergabe
        self.room_music_map = room_music_map
        self.h = handoff
        self.q = handoff / "quellen"
        self.staged = staged
        self.inv = inventory
        self.live = live
        self.assets: dict[str, dict] = {}
        self.issues: list[dict] = []
        self.new_hashes = {v.get("sha256"): (i["owner"], i["role"]) for i in (staged or {}).get("items", [])
                           for v in i["variants"].values() if v.get("sha256")}
        self.live_paths = set()
        if live:
            self.live_paths = self._extract_live_paths(live)

    # -- sources
    @staticmethod
    def _extract_live_paths(live: dict) -> set:
        found = set()

        def walk(o):
            if isinstance(o, dict):
                for v in o.values():
                    walk(v)
            elif isinstance(o, list):
                for v in o:
                    walk(v)
            elif isinstance(o, str) and re.search(r"\.(png|jpe?g|webp|mp3|svg|glb|json|csv|md)$", o, re.I):
                if "/" in o:
                    found.add(norm_media_path(o))
        legacy = {k: v for k, v in live.items() if k != "mediaCore"}
        walk(legacy)
        return found

    def issue(self, level: str, code: str, msg: str, ref: str | None = None):
        self.issues.append({"level": level, "code": code, "message": msg, "ref": ref})

    def availability_for(self, path: str | None, default: str) -> tuple[str, dict]:
        """Verfuegbarkeit aus Inventar (hoechste Prioritaet), sonst Default/Live-Manifest."""
        evidence: dict = {}
        if not path:
            return "missing", evidence
        if self.inv:
            rec = self.inv["files"].get(path)
            if rec is not None:
                evidence = {"inventory": self.inv.get("mode"), "httpStatus": rec.get("httpStatus"),
                            "problems": rec.get("problems") or []}
                status = rec.get("httpStatus")
                if status is not None and status >= 400:
                    # Liegt die Datei im lokalen Upload-Bestand (Repo media/), ist sie vorbereitet, nicht verloren
                    if LOCAL_MEDIA.joinpath(path).is_file():
                        evidence["note"] = "lokal in media/ vorbereitet, auf dem Server noch nicht vorhanden"
                        return "staged", evidence
                    return "missing", evidence
                if rec.get("problems"):
                    return "broken", evidence
                if rec.get("signatureOk") or (self.inv.get("mode") == "scan-dir"):
                    return "verified", evidence
                return "listed", evidence
            if self.inv.get("complete"):
                if default in ("staged", "archived"):
                    return default, evidence
                return "missing", {"inventory": self.inv.get("mode"), "note": "nicht in vollstaendiger Liste"}
        if default in ("referenced",) and path in self.live_paths:
            return "listed", {"liveManifest": True}
        return default, evidence

    def add_asset(self, aid: str, role: str, release: str, variants: dict, origin: dict, owner: str | None = None,
                  notes: list[str] | None = None, **extra) -> str:
        if aid in self.assets:
            raise SystemExit(f"doppelte Asset-ID {aid}")
        vs = {}
        for name, v in variants.items():
            v = dict(v)
            v["path"] = norm_media_path(v.get("path"))
            default = v.pop("availability", "referenced")
            av, ev = self.availability_for(v["path"], default)
            v["availability"] = av
            if ev:
                v["evidence"] = ev
            if self.inv and v["path"] in self.inv["files"]:
                rec = self.inv["files"][v["path"]]
                # Andere Bildmaße als erwartet = Datei wurde am Altpfad durch ein anderes Bild ersetzt
                if (v.get("width") and v.get("height") and rec.get("width") and rec.get("height")
                        and (v["width"], v["height"]) != (rec["width"], rec["height"])
                        and v["availability"] in ("verified", "listed")):
                    v["availability"] = "broken"
                    v.setdefault("evidence", {})["problems"] = [
                        f"Maße auf dem Server {rec['width']}×{rec['height']} statt {v['width']}×{v['height']} (anderes Bild am Altpfad)"]
                    self.issue("error", "dimension-mismatch",
                               f"{v['path']}: Server {rec['width']}×{rec['height']}, erwartet {v['width']}×{v['height']}", aid)
                    v["width"], v["height"] = rec["width"], rec["height"]
                for k in ("bytes", "width", "height", "alpha"):
                    if v.get(k) is None and rec.get(k) is not None:
                        v[k] = rec[k]
                if rec.get("sha256"):
                    if v.get("sha256") and v["sha256"] != rec["sha256"]:
                        if rec["sha256"] in self.new_hashes:
                            owner_role = self.new_hashes[rec["sha256"]]
                            v.setdefault("evidence", {})["note"] = f"am Altpfad in-place durch neue Fassung {owner_role} ersetzt"
                            self.issue("warning", "in-place-update",
                                       f"{v['path']}: enthält bereits die neue Datei {owner_role}; Altpfad bleibt für Bestands-Apps, Manifest verweist auf versionierte Datei", aid)
                            v["sha256"] = rec["sha256"]
                        else:
                            v["availability"] = "broken"
                            v.setdefault("evidence", {})["problems"] = ["SHA-256 weicht vom erwarteten Wert ab"]
                            self.issue("error", "hash-mismatch", f"{v['path']}: SHA-256 abweichend (unbekannte Fassung)", aid)
                    v.setdefault("sha256", rec["sha256"])
                if rec.get("etag"):
                    v["etag"] = rec["etag"]
            if v.get("mime") is None and v["path"]:
                v["mime"] = mime_from_ext(v["path"])
            vs[name] = {k: v[k] for k in ("path", "mime", "width", "height", "alpha", "bytes", "sha256",
                                          "availability", "evidence", "derivedFrom", "etag", "durationSeconds")
                        if k in v and v[k] is not None}
        rec = {"role": role, "owner": owner, "release": release, "origin": origin, "variants": vs}
        if notes:
            rec["notes"] = notes
        rec.update({k: v for k, v in extra.items() if v is not None})
        self.assets[aid] = rec
        return aid

    # -- build
    def build(self, revision: int, label: str | None) -> dict:
        reg = load_json(self.h / "Soll-Medienregister.json")
        v1 = load_json(self.q / "altmedia__media__manifest.json")
        v1_by_path = {norm_media_path(x["path"]): x for x in v1["assets"]}
        profiles = self._read_image_profiles()
        music = load_json(self.q / "app__home__music-manifest.json")
        tracks = {t["assetId"]: t for t in music["tracks"]}
        room_music_src = self.room_music_map or (self.q / "app__home__room-music-map.json")
        room_music = load_json(room_music_src)
        objwebp = {x["id"]: x for x in load_json(self.q / "objektwebp__manifest.json")["items"]}
        story_media = {x["cardId"]: x for x in load_json(self.q / "app__home__composition-story-media.json")["illustrations"]}
        inventory_rows = self._read_inventory_csv()
        staged = {(i["owner"], i["role"]): i for i in (self.staged or {}).get("items", [])}
        # Zuordnungen bereits auf dem Server liegender Dateien haben Vorrang vor Staging (keine Doppelablage)
        for row in self.assignments:
            key = (row["owner"], row["role"])
            staged[key] = {"owner": row["owner"], "role": row["role"], "sourceFile": row["path"],
                           "fromServer": True, "variants": {row.get("variant") or "original": {"path": row["path"]}}}
            for extra in [r for r in self.assignments if (r["owner"], r["role"]) == key and r is not row]:
                staged[key]["variants"][extra.get("variant") or "original"] = {"path": extra["path"]}

        approved_objects = {"O20": "Objektidentität ausdrücklich freigegeben", "O21": "Objektidentität ausdrücklich freigegeben",
                            "O24": "verbindliche Objektidentität laut Objektregister"}
        card_notes = {
            "O01": ["Objektidentität: blauer Cord, nicht Samt."],
            "O06": ["Altbild r1 zeigt Ziffern und Zeiger (Bild-Text-Prüfung offen); neue Vorderseite r2 ohne Ziffern/Zeiger."],
            "O11": ["Redaktioneller Titel 'Der Werkzeugkasten' hat Vorrang vor historischem Audiotitel 'Das Werkzeug'."],
            "O12": ["Redaktioneller Titel 'Das bewegliche Mobile' hat Vorrang vor historischem Audiotitel 'Die Kurbel'."],
            "O16": ["Nutzerentscheidung: Variante A (loser Faden); alte A/B-Studie nicht aktuell."],
            "O22": ["Korrigierte Fensteridentität; historische Hofsicht überholt."],
        }

        # ---- card back, gift cover
        back_prof = profiles.get("__back__", {})
        self.add_asset("card.back.r1", "back", "internal", {
            "original": {"path": "cards/EMFD_Kartenrueckseite_v1.2.jpeg", "width": 896, "height": 1536},
            "overview": {"path": back_prof.get("card-overview"), "width": 210, "height": 360},
            "view": {"path": back_prof.get("card-view"), "width": 630, "height": 1080},
            "large": {"path": back_prof.get("card-detail-large"), "width": 896, "height": 1536},
        }, {"source": "App v0.6.56 image-profiles.js", "note": "nicht im Medienarchiv 29.10. enthalten"})
        self.add_asset("card.back.legacy-rueckseite", "back", "superseded", {
            "original": {"path": "cards/rueckseite.jpeg", "availability": "missing"},
        }, {"source": "App v0.6.18 (Altverweis); Live-App v0.6.66 media-catalog.json nennt sie als Rueckfall",
            "note": "Nur ausdruecklicher Ersatz, solange EMFD_Kartenrueckseite_v1.2 fehlt; ob Motiv = v1.2 ist, ist unbelegt"})
        self.add_asset("gift.cover.r1", "giftCover", "review", {
            "original": {"path": "cards/deckblatt.jpeg", "availability": "missing"},
        }, {"source": "playlist-catalog.json / Medienablage README", "note": "von App erwartet, Datei nicht geliefert"})

        cards = {}
        for c in reg["cards"]:
            cid = c["id"]
            v1a = v1_by_path.get(f"cards/{cid}.png", {})
            prof = profiles.get(cid, {})
            has_new_front = (cid, "front") in staged
            r1 = self.add_asset(f"card.{cid}.front.r1", "front", "superseded" if has_new_front else "internal", {
                "original": {"path": f"cards/{cid}.png", "width": v1a.get("width"), "height": v1a.get("height"),
                             "bytes": v1a.get("sizeBytes"), "sha256": v1a.get("sha256"), "mime": "image/png",
                             "availability": "listed"},
                **{k: {**prof[p], "availability": "listed"} for k, p in (("overview", "card-overview"), ("view", "card-view"), ("large", "card-detail-large")) if p in prof},
            }, {"source": "Medienablage v1.0 (29.10.2026) + PERF-01", "originalFile": f"_originale/karten/{cid}-original.jpeg"},
                owner=cid, revision=1, supersededBy=f"card.{cid}.front.r2" if has_new_front else None)
            front = r1
            front_state = "unconfirmed"
            if has_new_front:
                st = staged[(cid, "front")]
                front = self.add_asset(f"card.{cid}.front.r2", "front", "internal",
                                       self._staged_variants(st), {"source": f"Projekt 'Haus Der Wunder' · {st['sourceFile']}",
                                                                   "uploadedBy": "Nutzerin", "date": "2026-11-18"},
                                       owner=cid, revision=2, supersedes=r1)
                front_state = "current"
            # covers
            cover = None
            if (cid, "cover") in staged:
                st = staged[(cid, "cover")]
                cover = self.add_asset(f"card.{cid}.cover.r1", "cover", "internal", self._staged_variants(st),
                                       {"source": f"Projekt 'Haus Der Wunder' · {st['sourceFile']}", "uploadedBy": "Nutzerin",
                                        "date": "2026-11-18"}, owner=cid, revision=1)
            thumb_path = norm_media_path(c.get("legacyPlaylistThumbnail"))
            prof_thumb = prof.get("playlist-thumbnail")
            thumb = self.add_asset(f"card.{cid}.playlist-thumb.r1", "coverFallback", "superseded", {
                "thumb": {**(prof_thumb or {"path": thumb_path}), "width": 160, "height": 160, "availability": "listed"},
            }, {"source": "PERF-01 (Mittelausschnitt der alten Kartenvorderseite)",
                "note": "kein eigenständiges CD-Cover; nur Prüf-/Fallbackkandidat"}, owner=cid, revision=1)
            # audio
            t = tracks.get(cid, {})
            audio = self.add_asset(f"audio.{cid}", "audio", "review", {
                "original": {"path": f"audio/{cid}.mp3", "mime": "audio/mpeg", "sha256": t.get("sha256"),
                             "bytes": t.get("sizeBytes"), "durationSeconds": t.get("durationSeconds")},
            }, {"source": "App music-manifest.json (P0-U01)", "historicTitle": t.get("title"),
                "rightsStatus": "unknown", "publicationStatus": "pending"}, owner=cid)
            # objects
            ow = objwebp.get(cid, {})
            objref = self.add_asset(f"object.{cid}.reference.r1", "objectReference", "review", {
                "original": {"path": norm_media_path(ow.get("output")) or f"objects/reference/{cid}.webp",
                             "width": ow.get("width"), "height": ow.get("height"), "alpha": ow.get("alpha"),
                             "bytes": ow.get("bytes"), "sha256": ow.get("webp_sha256"), "availability": "archived"},
            }, {"source": "EMFD-MEDIA-OBJ-01 v0.1 (lokales Paket, nicht auf Server nachgewiesen)",
                "status": ow.get("status")}, owner=cid,
                notes=["Nicht freigestellt (kein Alpha). Nicht als Sprite verwenden."])
            objstudy = self.add_asset(f"object.{cid}.study.r1", "objectStudy",
                                      "approved" if cid in approved_objects else "review", {
                "original": {"path": None, "availability": "archived"},
            }, {"source": "EMFD-Objektstudien-O01-O24(2).zip", "archivePath": c.get("objectStudyArchive"),
                "sourceImage": c.get("objectSourceArchive"), "decision": approved_objects.get(cid)}, owner=cid)
            sprite = self.add_asset(f"object.{cid}.sprite", "objectSprite", "review", {
                "original": {"path": None, "availability": "missing"},
            }, {"note": "transparentes WebP noch nicht nachgewiesen; Eignung je Motiv prüfen"}, owner=cid)
            model = self.add_asset(f"object.{cid}.model", "model", "review", {
                "original": {"path": None, "availability": "missing"},
            }, {"note": "kein 3D-Modell nachgewiesen"}, owner=cid)
            sm = story_media.get(cid, {})
            story = self.add_asset(f"story.{c['storyId']}", "story", "review", {
                "original": {"path": norm_media_path(sm.get("webPath")), "availability": "missing"},
            }, {"source": "composition-story-media.json v0.4", "status": sm.get("status")}, owner=cid,
                notes=["Bildziel offen; Fallback ist die aktuelle Kartenvorderseite."])
            cards[cid] = {
                "title": c["title"], "category": c["category"], "order": CARD_IDS.index(cid) + 1,
                "front": front, "frontState": front_state,
                "fallbacks": {"front": r1 if front != r1 else None, "cover": thumb, "back": "card.back.legacy-rueckseite"},
                "back": "card.back.r1",
                "cover": cover, "audio": audio, "objectReference": objref, "objectStudy": objstudy,
                "objectSprite": sprite, "model": model, "story": story,
                "notes": card_notes.get(cid, []),
            }
            if front_state != "current":
                cards[cid]["notes"] = cards[cid]["notes"] + [
                    "Aktualisierte Vorderseite erwartet, aber nicht vorliegend; r1 bleibt bis zur Lieferung in Gebrauch."]

        # ---- main theme
        theme_cover = None
        if ("T03", "cover") in staged:
            st = staged[("T03", "cover")]
            theme_cover = self.add_asset("theme.T03.cover.r1", "cover", "internal", self._staged_variants(st),
                                         {"source": st["sourceFile"]}, owner="T03", revision=1)
        theme_thumb = self.add_asset("theme.T03.playlist-thumb.r1", "coverFallback", "superseded", {
            "thumb": {"path": reg["mainTheme"]["legacyPlaylistThumbnail"], "width": 160, "height": 160, "availability": "listed"},
        }, {"source": "PERF-01", "note": "kein eigenständiges Cover"}, owner="T03")
        t = tracks.get("T03", {})
        theme_audio = self.add_asset("audio.T03", "audio", "review", {
            "original": {"path": "audio/THEME.mp3", "mime": "audio/mpeg"},
        }, {"source": "App music-manifest.json", "title": t.get("title"), "rightsStatus": "unknown"}, owner="T03")
        themes = {"T03": {"title": "Das Haus der kleinen Wunder – Main Theme", "cover": theme_cover,
                          "fallbacks": {"cover": theme_thumb}, "audio": theme_audio}}

        # ---- internal stems
        internal = []
        for tid, t in tracks.items():
            if t.get("usageStatus") == "internal-test-only":
                aid = self.add_asset(f"audio.{tid}", "audio", "test", {
                    "original": {"path": norm_media_path(t["path"]), "mime": "audio/mpeg", "sha256": t.get("sha256"),
                                 "bytes": t.get("sizeBytes"), "durationSeconds": t.get("durationSeconds")},
                }, {"source": "App music-manifest.json", "family": t.get("family"), "familyTitle": t.get("familyTitle"),
                    "variant": t.get("variant"), "publicReleaseApproved": False}, owner=tid)
                internal.append(aid)

        # ---- rooms, backgrounds, portrait, references from file inventory
        rooms, other = self._rooms_and_misc(v1_by_path, inventory_rows)
        # Nutzerentscheidung 18.11.2026: Stilreferenz des Teezimmers (3D) ist die Variante "Rundtisch"
        if "room.P08-teezimmer-rundtisch-v1.r1" in self.assets:
            self.assets["room.P08-teezimmer-rundtisch-v1.r1"].setdefault("notes", []).append(
                "Nutzerentscheidung 18.11.2026: verbindliche Stilreferenz für das Teezimmer im 3D-Haus "
                "(Bogenfenster, runder Holztisch, Blau/Gold, Mondsichel-Motive). Variante 'Mond' gilt nicht als Stilvorgabe.")
        # Nutzerentscheidung 18.11.2026: Atelier-Hauptbild ist die Werkbank (Original 29.10.), nicht die Kartenauslage
        if "room.P04-atelier.r1" in self.assets:
            werkbank = sorted(LOCAL_MEDIA.glob("rooms/P04-atelier-r1-*.webp"))
            if werkbank:
                wp = werkbank[-1].relative_to(LOCAL_MEDIA).as_posix()
                av, ev = self.availability_for(wp, "staged")
                if self.inv and wp not in self.inv["files"]:
                    av, ev = "staged", {"note": "lokal in media/ vorbereitet"}
                self.assets["room.P04-atelier.r1"]["variants"]["original"] = {
                    "path": wp, "mime": "image/webp", "width": 1086, "height": 1448,
                    "bytes": werkbank[-1].stat().st_size,
                    "sha256": hashlib.sha256(werkbank[-1].read_bytes()).hexdigest(),
                    "availability": av, "evidence": ev}
            self.assets["room.P04-atelier.r1"].setdefault("notes", []).append(
                "Nutzerentscheidung 18.11.2026: Hauptbild = Werkbank (Original 29.10., 1086×1448). "
                "rooms/P04-atelier.webp zeigt live seit 05.11. die Kartenauslage und gilt nicht; "
                "die optimierten Varianten optimized/rooms/P04-atelier-* zeigen die Werkbank.")

        # ---- devices / music map
        devices = {}
        for pid, r in room_music["rooms"].items():
            d = {"kind": "roomMusicDevice", "cardIds": r["cardIds"],
                 "playlist": [f"audio.{x}" for x in r["cardIds"]]}
            if r.get("deviceName"):
                d["name"] = r["deviceName"]
            if r.get("deviceImage"):
                # Pfad aus der App ist relativ zu home/ ("../media/raumgeraete/P01.webp") -> relativ zu media/
                d["image"] = self.add_asset(f"device.{pid}.image", "deviceImage", "review", {
                    "original": {"path": r["deviceImage"]},
                }, {"source": f"App room-music-map.json {room_music.get('appVersion') or ''}".strip(),
                    "note": "von der Live-App verwendet; Erreichbarkeit ist keine Freigabe"}, owner=pid)
            devices[pid] = d

        playlist_primary = ["audio.T03"] + [f"audio.{c}" for c in CARD_IDS]
        core = {
            "schema": SCHEMA_ID,
            "schemaVersion": SCHEMA_VERSION,
            "revision": revision,
            "revisionLabel": label or f"{dt.date.today().isoformat()}.r{revision}",
            "updatedAt": now_iso(),
            "generator": f"emfd_media.py {TOOL_VERSION}",
            "mediaRoot": "./",
            "project": "Ein Moment für dich · Das Haus der kleinen Wunder",
            "policy": {
                "pathsRelativeTo": "manifest",
                "autoplay": False,
                "precacheAudio": False,
                "allowedOrigins": ["https://flowisaurus.de"],
                "channels": {"private": ["approved", "internal", "review"], "public": ["approved"]},
                "usableAvailability": ["verified", "listed", "referenced"],
                "fallbackRule": "Nur ausdrücklich unter cards.<id>.fallbacks genannte Assets; Anzeige als Fallback markieren.",
                "cache": {"manifest": "no-cache (ETag/Last-Modified-Revalidierung)",
                          "hashedFiles": "public, max-age=31536000, immutable",
                          "legacyFiles": "no-cache (Revalidierung)"},
            },
            "vocabulary": {"availability": {
                "verified": "Auf dem Server per Scanner geprüft (Status, Signatur, ggf. Hash)",
                "listed": "Im Live-Manifest oder in einer Server-Dateiliste geführt, Bytes nicht geprüft",
                "referenced": "Nur von App-Code referenziert, Existenz ungeprüft",
                "staged": "Im Upload-Bündel vorbereitet, noch nicht auf dem Server",
                "archived": "In einem benannten Archiv vorhanden, nicht auf dem Server",
                "missing": "Erwartet, aber keine Datei bekannt",
                "broken": "Vorhanden, aber fehlerhaft (HTML, falscher Typ, Hash abweichend)"},
                "release": {
                "approved": "freigegeben", "internal": "interne Nutzung, keine Veröffentlichungsfreigabe",
                "review": "zur Sichtung, nicht freigegeben", "test": "interne Testmedien, nie in Primär-Playlist",
                "superseded": "veraltet, nur als ausdrücklicher Fallback",
                "archive": "Archiv/Original/Mockup, nie produktiv"}},
            "cards": cards,
            "themes": themes,
            "playlists": {
                "primary": {"title": "Musikzimmer · vollständige Playlist", "items": playlist_primary,
                            "order": "T03, dann Ruhe O01–O06, Kraft O07–O12, Halt O13–O18, Freude O19–O24"},
                "internal": {"title": "Interne Klang-/Wintervarianten (Test)", "items": internal, "channel": "private",
                             "note": "nie in öffentlicher oder Primär-Playlist"},
            },
            "devices": devices,
            "placesMusic": {"flur": {"theme": "T03", "audio": "audio.T03"},
                            "musikzimmer": {"playlist": "primary", "expectedItems": 25}},
            "rooms": rooms,
            "shared": other,
            "assets": dict(sorted(self.assets.items())),
            "expectations": {
                "cards": 24, "covers": 25, "primaryAudio": 25, "internalAudio": 10, "audioPathsTotal": 35,
                "objectReferences": 24, "objectSprites": 24, "storyIllustrations": 24,
                "plannedNotPresent": {"roomWide": 26, "roomMobileCrops": 78, "playerCloseups": 9,
                                      "tableCloseup": 1, "exhibitionGroups": 4,
                                      "note": "Planung; keine Dateien nachgewiesen, daher keine Asset-Einträge"},
                "placeIds3d": reg["additionalExpected"]["roomPlanIds"],
            },
            "sources": {
                "handoff": "EMFD-MEDIA-CORE-01_Claude_Uebergabe.zip (18.11.2026)",
                "liveManifestMerged": bool(self.live),
                "inventory": (self.inv or {}).get("source"),
                "staging": (self.staged or {}).get("createdAt"),
            },
        }
        core["summary"] = summarize(core)
        return core

    def _staged_variants(self, st: dict) -> dict:
        out = {}
        for name, v in st["variants"].items():
            v = dict(v)
            v["availability"] = "listed" if st.get("fromServer") else "staged"
            v.pop("encoder", None)
            out[name] = v
        return out

    def _read_image_profiles(self) -> dict:
        txt = (self.q / "app__home__image-profiles.js").read_text(encoding="utf-8")
        m = re.search(r"const cards=(\{.*?\});\n", txt, re.S)
        data = json.loads(m.group(1)) if m else {}
        out = {}
        for cid, purposes in data.items():
            out[cid] = {}
            for purpose, rec in purposes.items():
                out[cid][purpose] = {"path": rec["path"], "width": rec["width"], "height": rec["height"],
                                     "bytes": rec.get("sizeBytes"), "sha256": rec.get("sha256"), "mime": "image/webp"}
        back = {}
        for purpose, url in re.findall(r"'([a-z-]+)':Object\.freeze\(\{url:'([^']+)'", txt):
            back[purpose] = url
        out["__back__"] = back
        return out

    def _read_inventory_csv(self) -> list[dict]:
        with open(self.h / "Dateipfad-Inventar.csv", encoding="utf-8-sig") as f:
            return list(csv.DictReader(f, delimiter=";"))

    def _rooms_and_misc(self, v1_by_path: dict, rows: list[dict]):
        rooms_manifest = load_json(self.q / "altmedia__media__rooms__manifest.json")["rooms"]
        paths = {r["Pfad_relativ_zu_media"]: r for r in rows}
        opt: dict[str, dict] = {}
        for p in paths:
            m = OPT_RE.match(p)
            if m and m.group("dir") in ("rooms", "backgrounds"):
                opt.setdefault(m.group("base"), {})[f"w{m.group('size')}"] = p

        def variants_for(path: str, stem: str, default: str) -> dict:
            v1a = v1_by_path.get(path, {})
            row = paths.get(path, {})
            vs = {"original": {"path": path, "width": v1a.get("width"), "height": v1a.get("height"),
                               "bytes": v1a.get("sizeBytes") or (int(row["Archiv_2026_10_29_bytes"]) if row.get("Archiv_2026_10_29_bytes") else None),
                               "sha256": v1a.get("sha256"), "availability": default}}
            for k, p in sorted(opt.get(stem, {}).items(), key=lambda kv: int(re.sub(r"\D.*", "", kv[0][1:]) or 0)):
                vs[k] = {"path": p, "availability": "listed"}
            thumb = f"rooms/thumbs/{stem}-thumb.webp"
            if thumb in paths:
                vs["thumb"] = {"path": thumb, "availability": "referenced"}
            return vs

        rooms = {}
        for r in rooms_manifest:
            path = norm_media_path(r["path"])
            stem = Path(path).stem
            aid = self.add_asset(f"room.{stem}.r1", "room", "internal", variants_for(path, stem, "listed"),
                                 {"source": "Medienablage v1.0", "status": r.get("status")}, owner=r["id"])
            rooms[r["id"]] = {"name": r["name"], "image": aid, "alternatives": []}
        legacy_flur = self.add_asset("room.flur.r1", "room", "superseded", variants_for("rooms/flur.webp", "flur", "listed"),
                                     {"source": "Medienablage v1.0", "status": "archived-variant"}, owner="HALL-LIT")
        rooms.setdefault("HALL-LIT", {"name": "Flur", "image": None, "alternatives": []})["alternatives"].append(legacy_flur)
        for p in sorted(paths):
            if p.startswith("rooms/varianten/"):
                stem = Path(p).stem
                pid = stem.split("-")[0]
                owner = pid if pid.startswith("P") else "HALL-LIT"
                aid = self.add_asset(f"room.{stem}.r1", "roomVariant", "review", variants_for(p, stem, "listed"),
                                     {"source": "Medienablage v1.0", "note": "ersetzt Raum-Hauptbild nicht automatisch"},
                                     owner=owner)
                rooms.setdefault(owner, {"name": owner, "image": None, "alternatives": []})["alternatives"].append(aid)
        aid = self.add_asset("room.teezimmer_p08_background.r1", "room", "internal", {
            "original": {"path": "rooms/teezimmer_p08_background.webp", "availability": "referenced"}},
            {"source": "App v0.6.56 teezimmer.js", "note": "nicht im Medienarchiv; Existenz ungeprüft"}, owner="P08")
        rooms["P08"].setdefault("scenes", {})["teezimmer"] = aid

        shared = {"backgrounds": {}, "portraits": {}, "references": {}, "originals": {}}
        for p in sorted(paths):
            if p.startswith("backgrounds/"):
                stem = Path(p).stem
                aid = self.add_asset(f"background.{stem}.r1", "background", "internal", variants_for(p, stem, "listed"),
                                     {"source": "Medienablage v1.0"})
                shared["backgrounds"][stem] = aid
        portrait_vs = variants_for("portraits/weltenweberin.jpeg", "weltenweberin", "listed")
        shared["portraits"]["weltenweberin"] = self.add_asset("portrait.weltenweberin.r1", "portrait", "internal", portrait_vs,
                                                              {"source": "Medienablage v1.0"})
        for p in sorted(paths):
            if p.startswith("_referenzen/mockups/") or p.startswith("_originale/") or p.startswith("_referenzen/button-bibliothek-v0.3/assets/"):
                stem = Path(p).stem
                grp = "references" if p.startswith("_referenzen") else "originals"
                aid = f"{'ref' if grp == 'references' else 'orig'}.{stem}"
                v1a = v1_by_path.get(p, {})
                self.add_asset(aid, "reference" if grp == "references" else "original", "archive", {
                    "original": {"path": p, "width": v1a.get("width"), "height": v1a.get("height"),
                                 "bytes": v1a.get("sizeBytes"), "sha256": v1a.get("sha256"), "availability": "listed"}},
                    {"source": "Medienablage v1.0", "note": "nicht produktiv verwenden"})
                shared[grp][stem] = aid
        return rooms, shared


def summarize(core: dict) -> dict:
    counts: dict = {"assets": len(core["assets"]), "byRole": {}, "byAvailability": {}, "byRelease": {}}
    for a in core["assets"].values():
        counts["byRole"][a["role"]] = counts["byRole"].get(a["role"], 0) + 1
        counts["byRelease"][a["release"]] = counts["byRelease"].get(a["release"], 0) + 1
        for v in a["variants"].values():
            counts["byAvailability"][v["availability"]] = counts["byAvailability"].get(v["availability"], 0) + 1
    cards = core["cards"]
    counts["cardsFrontCurrent"] = sum(1 for c in cards.values() if c["frontState"] == "current")
    counts["cardsFrontUnconfirmed"] = [k for k, c in cards.items() if c["frontState"] != "current"]
    counts["coversPresent"] = sorted([k for k, c in cards.items() if c["cover"]] + [k for k, t in core["themes"].items() if t["cover"]])
    counts["coversMissing"] = sorted([k for k, c in cards.items() if not c["cover"]] + [k for k, t in core["themes"].items() if not t["cover"]])
    return counts


def merge_inventories(docs: list[dict]) -> dict:
    """Mehrere Inventare zusammenfuehren: HTTP-/Byte-Befunde ergaenzen Listeneintraege."""
    files: dict = {}
    for d in docs:
        for p, rec in d["files"].items():
            base = files.get(p, {})
            merged = dict(base)
            merged.update({k: v for k, v in rec.items() if v not in (None, [], "")})
            merged["problems"] = rec.get("problems") or []
            files[p] = merged
    return {"kind": "emfd-media-inventory", "source": " + ".join(d.get("source", "?") for d in docs),
            "mode": "+".join(d.get("mode", "?") for d in docs), "complete": any(d.get("complete") for d in docs),
            "files": files}


def cmd_build(a) -> int:
    staged = load_json(a.staged) if a.staged else None
    inv = merge_inventories([load_json(x) for x in a.inventory]) if a.inventory else None
    live = load_json(a.live_manifest) if a.live_manifest else None
    if live and "mediaCore" in live:
        prev = live["mediaCore"].get("revision", 0)
        if a.revision <= prev:
            print(f"Revision {a.revision} muss groesser als Live-Revision {prev} sein", file=sys.stderr)
            return 2
    assignments = []
    if a.assign:
        with open(a.assign, encoding="utf-8-sig") as f:
            assignments = [r for r in csv.DictReader(f, delimiter=";") if r.get("path")]
        for r in assignments:
            r["path"] = norm_media_path(r["path"])
            if r["role"] not in ("front", "cover"):
                print(f"Zuordnung {r['path']}: Rolle {r['role']} nicht unterstuetzt (front|cover)", file=sys.stderr)
                return 2
    b = Builder(Path(a.handoff), staged, inv, live, assignments,
                room_music_map=Path(a.room_music_map) if a.room_music_map else None)
    core = b.build(a.revision, a.label)
    if a.mode == "merge":
        if not live:
            print("--mode merge benoetigt --live-manifest (aktuelle Live-Datei)", file=sys.stderr)
            return 2
        doc = {k: v for k, v in live.items() if k != "mediaCore"}
        doc["mediaCore"] = core
    else:
        doc = core
    write_json(a.out, doc)
    s = core["summary"]
    print(f"Manifest ({a.mode}) -> {a.out}: {s['assets']} Assets, Vorderseiten aktuell {s['cardsFrontCurrent']}/24, "
          f"Cover {len(s['coversPresent'])}/25")
    for i in b.issues:
        print(f"  {i['level']}: {i['code']} {i['message']}")
    return 0


# --------------------------------------------------------------------------- validate

def validate_manifest(doc: dict, schema: dict | None, release: bool, inventory: dict | None = None) -> list[dict]:
    out: list[dict] = []

    def e(code, msg, ref=None, level="error"):
        out.append({"level": level, "code": code, "message": msg, "ref": ref})

    core = doc.get("mediaCore", doc)
    if schema is not None:
        try:
            import jsonschema  # type: ignore
            v = jsonschema.Draft202012Validator(schema)
            for err in sorted(v.iter_errors(core), key=lambda x: list(x.path)):
                e("schema", f"{'/'.join(map(str, err.path))}: {err.message}")
        except ImportError:
            e("schema-skip", "jsonschema nicht installiert; nur Regelpruefung", level="warning")
    if core.get("schema") != SCHEMA_ID:
        e("schema-id", "schema != emfd-media-core")
        return out
    assets = core.get("assets", {})
    cards = core.get("cards", {})
    if sorted(cards) != CARD_IDS:
        e("cards", f"erwartet 24 Karten O01–O24, gefunden {len(cards)}: {sorted(set(cards) ^ set(CARD_IDS))}")
    if "O25" in cards:
        e("o25", "O25 darf nicht existieren")
    prim = core.get("playlists", {}).get("primary", {}).get("items", [])
    if len(prim) != 25 or len(set(prim)) != 25:
        e("playlist", f"Primaer-Playlist muss 25 eindeutige Eintraege haben (ist {len(prim)}/{len(set(prim))})")
    for aid in prim:
        if assets.get(aid, {}).get("release") == "test":
            e("test-in-primary", f"Testmedium {aid} in Primaer-Playlist", aid)
    audio_paths = sorted({v["path"] for a in assets.values() if a["role"] == "audio" for v in a["variants"].values() if v.get("path")})
    if len(audio_paths) < 35:
        e("audio-count", f"mindestens 35 Audio-Pfade erwartet, gefunden {len(audio_paths)}")
    if len(audio_paths) != len(set(p.lower() for p in audio_paths)):
        e("audio-dup", "doppelte Audio-Pfade (Gross/Klein)")

    def ref(aid, where, role=None, allow_none=True):
        if aid is None:
            if not allow_none:
                e("ref-null", f"{where}: Pflichtreferenz fehlt")
            return
        if aid not in assets:
            e("ref-missing", f"{where}: unbekannte Asset-ID {aid}", aid)
        elif role and assets[aid]["role"] != role:
            e("ref-role", f"{where}: {aid} hat Rolle {assets[aid]['role']}, erwartet {role}", aid)

    for cid, c in cards.items():
        ref(c["front"], f"cards.{cid}.front", "front", allow_none=False)
        ref(c["back"], f"cards.{cid}.back", "back", allow_none=False)
        ref(c["audio"], f"cards.{cid}.audio", "audio", allow_none=False)
        ref(c.get("cover"), f"cards.{cid}.cover", "cover")
        for k in ("objectReference", "objectStudy", "objectSprite", "model", "story"):
            ref(c.get(k), f"cards.{cid}.{k}")
        for k, fb in (c.get("fallbacks") or {}).items():
            ref(fb, f"cards.{cid}.fallbacks.{k}")
        fa = assets.get(c["front"], {})
        if fa.get("release") == "superseded":
            e("front-superseded", f"{cid}: Vorderseite verweist auf veraltetes Asset {c['front']}", cid)
        if fa.get("owner") not in (None, cid):
            e("front-owner", f"{cid}: Vorderseite gehoert zu {fa.get('owner')}", cid)
        aa = assets.get(c["audio"], {})
        if aa and not any(v.get("path") == f"audio/{cid}.mp3" for v in aa["variants"].values()):
            e("audio-map", f"{cid}: Audio-Pfad passt nicht zur Karten-ID", cid)
        ca = assets.get(c.get("cover") or "", {})
        if ca and ca.get("owner") != cid:
            e("cover-owner", f"{cid}: Cover gehoert zu {ca.get('owner')}", cid)
        if release:
            for slot in ("front", "back"):
                aid = c[slot]
                for vn, v in assets.get(aid, {}).get("variants", {}).items():
                    if v["availability"] not in ("verified",):
                        e("release-unverified", f"{cid}.{slot}.{vn}: Verfuegbarkeit {v['availability']} (vor Veroeffentlichung verifizieren)", aid)
            if c["frontState"] != "current":
                e("release-front", f"{cid}: aktualisierte Vorderseite fehlt (frontState={c['frontState']})", cid, level="warning")
    seen_paths: dict[str, str] = {}
    for aid, a in assets.items():
        if a["release"] not in RELEASE:
            e("release-vocab", f"{aid}: unbekannter Freigabestatus {a['release']}", aid)
        for vn, v in a["variants"].items():
            if v["availability"] not in AVAILABILITY:
                e("avail-vocab", f"{aid}.{vn}: unbekannte Verfuegbarkeit", aid)
            p = v.get("path")
            if p is None:
                if v["availability"] not in ("missing", "archived"):
                    e("path-null", f"{aid}.{vn}: Pfad null, aber Status {v['availability']}", aid)
                continue
            if p.startswith(("/", "http:", "https:")) or ".." in p.split("/"):
                e("path-form", f"{aid}.{vn}: Pfad muss relativ zum Manifest sein: {p}", aid)
            if p in seen_paths and seen_paths[p] != f"{aid}":
                e("path-dup", f"Pfad {p} in {seen_paths[p]} und {aid}", aid)
            seen_paths[p] = aid
            if v["availability"] == "broken":
                e("broken", f"{aid}.{vn}: fehlerhafte Datei {p}", aid, level="error" if release else "warning")
            if release and v["availability"] == "staged":
                e("release-staged", f"{aid}.{vn}: noch nicht hochgeladen ({p})", aid)
        if a.get("supersededBy") and a["supersededBy"] not in assets:
            e("superseded-ref", f"{aid}: supersededBy zeigt ins Leere", aid)
    return out


def cmd_validate(a) -> int:
    doc = load_json(a.manifest)
    schema = load_json(a.schema) if a.schema else None
    inv = load_json(a.inventory) if a.inventory else None
    res = validate_manifest(doc, schema, a.release, inv)
    errs = [r for r in res if r["level"] == "error"]
    warns = [r for r in res if r["level"] == "warning"]
    for r in res:
        print(f"{r['level'].upper():7} {r['code']:20} {r['message']}")
    print(f"\n{len(errs)} Fehler, {len(warns)} Warnungen ({'Release' if a.release else 'Entwicklung'}smodus)")
    if a.out:
        write_json(a.out, {"manifest": a.manifest, "release": a.release, "checkedAt": now_iso(), "results": res})
    return 1 if errs else 0


# --------------------------------------------------------------------------- reconcile

def cmd_reconcile(a) -> int:
    doc = load_json(a.manifest)
    core = doc.get("mediaCore", doc)
    inv = load_json(a.inventory) if a.inventory else None
    rows = []
    by_path: dict[str, list] = {}
    for aid, asset in core["assets"].items():
        for vn, v in asset["variants"].items():
            rows.append({"assetId": aid, "variant": vn, "role": asset["role"], "owner": asset.get("owner") or "",
                         "release": asset["release"], "availability": v["availability"], "path": v.get("path") or "",
                         "bytes": v.get("bytes") or "", "sha256": (v.get("sha256") or "")[:16]})
            if v.get("path"):
                by_path.setdefault(v["path"], []).append(f"{aid}#{vn}")
    unknown_on_server = []
    dup_hash: dict[str, list] = {}
    if inv:
        known = set(by_path)
        for p, rec in inv["files"].items():
            if p not in known:
                unknown_on_server.append(p)
            if rec.get("sha256"):
                dup_hash.setdefault(rec["sha256"], []).append(p)
    dups = {h: ps for h, ps in dup_hash.items() if len(ps) > 1}
    staged_hashes = {}
    for aid, asset in core["assets"].items():
        if asset["role"] in ("front", "cover") and str(asset.get("origin", {}).get("source", "")).startswith("Projekt"):
            for v in asset["variants"].values():
                if v.get("sha256"):
                    staged_hashes[v["sha256"]] = (aid, v["path"])
    already_on_server = []
    if inv:
        for p, rec in inv["files"].items():
            hit = staged_hashes.get(rec.get("sha256"))
            if hit and hit[1] != p:
                already_on_server.append({"serverPath": p, "sameBytesAs": hit[0], "plannedPath": hit[1],
                                          "hint": "Datei liegt bereits auf dem Server -> per --assign zuordnen statt erneut hochladen"})
    out = Path(a.out_dir)
    out.mkdir(parents=True, exist_ok=True)
    with open(out / "medienstatus.csv", "w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()), delimiter=";")
        w.writeheader()
        w.writerows(rows)
    report = {"manifestRevision": core.get("revision"), "createdAt": now_iso(), "inventory": (inv or {}).get("source"),
              "summary": core.get("summary"), "unknownOnServer": sorted(unknown_on_server),
              "duplicateFilesByHash": dups, "stagedAlreadyOnServer": already_on_server}
    write_json(out / "abgleich.json", report)
    print(f"{len(rows)} Varianten -> {out/'medienstatus.csv'}; unbekannt auf Server: {len(unknown_on_server)}; "
          f"Hash-Dubletten: {len(dups)}; bereits hochgeladene Staging-Dateien: {len(already_on_server)}")
    return 0


# --------------------------------------------------------------------------- cli

def main(argv=None) -> int:
    p = argparse.ArgumentParser(prog="emfd_media", description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("stage", help="neue Nutzerbilder in Upload-Dateien + Varianten ueberfuehren")
    s.add_argument("--input", required=True)
    s.add_argument("--out", required=True, help="lokales Abbild von /wunderhaus/media/")
    s.add_argument("--staged-json", required=True)
    s.add_argument("--front-revision", type=int, default=2)
    s.add_argument("--cover-revision", type=int, default=1)
    s.set_defaults(fn=cmd_stage)

    s = sub.add_parser("build", help="Manifest erzeugen")
    s.add_argument("--handoff", required=True, help="Verzeichnis mit Soll-Medienregister.json, Dateipfad-Inventar.csv, quellen/")
    s.add_argument("--staged")
    s.add_argument("--inventory", action="append", help="Ergebnis von scan-dir/import-list/http-check (mehrfach moeglich; spaetere ergaenzen fruehere)")
    s.add_argument("--live-manifest", help="aktuelle Live-Datei manifest.json (lokale Kopie)")
    s.add_argument("--assign", help="CSV path;owner;role;variant fuer bereits auf dem Server liegende neue Dateien")
    s.add_argument("--room-music-map", help="aktuelle room-music-map.json der Live-App (Vorrang vor quellen/; Geraetenamen und -bilder)")
    s.add_argument("--mode", choices=["clean", "merge"], default="clean",
                   help="clean: nur v2; merge: Live-Inhalt unveraendert + Schluessel mediaCore (additiv)")
    s.add_argument("--revision", type=int, required=True)
    s.add_argument("--label")
    s.add_argument("--out", required=True)
    s.set_defaults(fn=cmd_build)

    s = sub.add_parser("scan-dir", help="lokale Kopie von media/ pruefen")
    s.add_argument("dir")
    s.add_argument("--out", required=True)
    s.add_argument("--deep", action="store_true", help="Bilder vollstaendig decodieren (Pillow)")
    s.set_defaults(fn=cmd_scan_dir)

    s = sub.add_parser("import-list", help="Server-Dateiliste importieren")
    s.add_argument("list")
    s.add_argument("--strip-prefix", default="wunderhaus/media/")
    s.add_argument("--out", required=True)
    s.set_defaults(fn=cmd_import_list)

    s = sub.add_parser("http-check", help="Live-URLs lesend pruefen")
    s.add_argument("--base", default=DEFAULT_BASE)
    s.add_argument("--manifest")
    s.add_argument("--paths", help="Textdatei mit Pfaden relativ zu media/")
    s.add_argument("--inventory-csv", help="Dateipfad-Inventar.csv")
    s.add_argument("--only", help="Regex-Filter fuer Pfade")
    s.add_argument("--timeout", type=float, default=20)
    s.add_argument("--out", required=True)
    s.set_defaults(fn=cmd_http_check)

    s = sub.add_parser("reconcile", help="Bestandsabgleich")
    s.add_argument("--manifest", required=True)
    s.add_argument("--inventory")
    s.add_argument("--out-dir", required=True)
    s.set_defaults(fn=cmd_reconcile)

    s = sub.add_parser("validate", help="Manifest pruefen")
    s.add_argument("manifest")
    s.add_argument("--schema")
    s.add_argument("--inventory")
    s.add_argument("--release", action="store_true", help="strenge Pruefung vor Veroeffentlichung")
    s.add_argument("--out")
    s.set_defaults(fn=cmd_validate)

    a = p.parse_args(argv)
    return a.fn(a)


if __name__ == "__main__":
    sys.exit(main())

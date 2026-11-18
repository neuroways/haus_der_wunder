#!/usr/bin/env python3
"""Grundriss eines Raums aus dem 3D-Hausmodell zeichnen (Vorlage für Raum-Mockups).

Quelle ausschließlich: home_3d/assets/arch/Haus-v0.4.4.glb (Wände, Öffnungen, Glas),
home_3d/data/navigation-{eg,og}.json (Raumrechtecke), home_3d/data/einrichtung.json (Platzhalter),
home_3d/data/tueren.json (Türkennungen). Es wird nichts erfunden: Seiten ohne Wandgeometrie
heißen „offen“, Öffnungen werden aus Lücken bzw. Stürzen in der Wandgeometrie abgeleitet.

Aufruf:  python3 tools/grundriss.py Teezimmer --out docs/design-briefing/P08-teezimmer
Ausgabe: grundriss.png (Draufsicht, Norden oben, Raster 0,5 m) und raum.json (dieselben Daten maschinenlesbar,
         lokale Koordinaten: Ursprung = Südwest-Innenecke, x nach Osten, y nach Norden, Meter).
Nur Python-Standardbibliothek + Pillow.
"""
from __future__ import annotations

import argparse
import json
import struct
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
H3D = ROOT / "home_3d"
STEP = 0.05


def load_glb(path: Path) -> dict:
    b = path.read_bytes()
    n = struct.unpack("<I", b[12:16])[0]
    return json.loads(b[20:20 + n])


def node_boxes(g: dict) -> list[dict]:
    mats = [m.get("name", "") for m in g.get("materials", [])]
    out = []
    for n in g["nodes"]:
        if "mesh" not in n or n.get("name", "").startswith("ITEM"):
            continue
        mn, mx, ms = [1e9] * 3, [-1e9] * 3, set()
        for p in g["meshes"][n["mesh"]]["primitives"]:
            a = g["accessors"][p["attributes"]["POSITION"]]
            mn = [min(x, y) for x, y in zip(mn, a["min"])]
            mx = [max(x, y) for x, y in zip(mx, a["max"])]
            if "material" in p and mats:
                ms.add(mats[p["material"]])
        t = n.get("translation", [0, 0, 0])
        x0, h0, z0 = (v + o for v, o in zip(mn, t))
        x1, h1, z1 = (v + o for v, o in zip(mx, t))
        out.append({"name": n.get("name", ""), "x0": x0, "x1": x1, "y0": -z1, "y1": -z0, "h0": h0, "h1": h1,
                    "mat": ms})
    return out


def find_room(name: str) -> tuple[dict, float, str]:
    for lvl in ("eg", "og"):
        d = json.loads((H3D / f"data/navigation-{lvl}.json").read_text(encoding="utf-8"))
        for r in d["rooms"]:
            if r["id"].lower() == name.lower():
                return r, float(d.get("z", 0.0)), lvl.upper()
    raise SystemExit(f"Raum {name} nicht in navigation-eg/og.json")


def classify_side(boxes, side, rect, z):
    """Entlang einer Raumseite in 5-cm-Schritten: Wand / Öffnung mit Sturz / Glas / offen."""
    x0, x1, y0, y1 = rect
    segs = []
    if side in ("S", "N"):
        yy = y0 if side == "S" else y1
        rng = (x0, x1)
    else:
        xx = x0 if side == "W" else x1
        rng = (y0, y1)
    t = rng[0]
    while t < rng[1] - 1e-6:
        c = t + STEP / 2
        kind, sill = "offen", None
        for bx in boxes:
            if bx["h1"] <= z + 0.05 or bx["h0"] >= z + 2.95:
                continue
            if side in ("S", "N"):
                hit = bx["x0"] - 1e-6 <= c <= bx["x1"] + 1e-6 and bx["y0"] - 0.25 <= yy <= bx["y1"] + 0.25 \
                    and (bx["y1"] - bx["y0"]) < 0.5
            else:
                hit = bx["y0"] - 1e-6 <= c <= bx["y1"] + 1e-6 and bx["x0"] - 0.25 <= xx <= bx["x1"] + 0.25 \
                    and (bx["x1"] - bx["x0"]) < 0.5
            if not hit:
                continue
            if "glass" in bx["mat"]:
                kind = "glas" if kind != "wand" else kind
            elif "wall" in bx["mat"]:
                if bx["h0"] <= z + 0.05:
                    kind = "wand"
                elif kind != "wand":
                    kind, sill = "oeffnung", round(bx["h0"] - z, 2)
        if segs and segs[-1]["art"] == kind and segs[-1].get("sturz_m") == sill:
            segs[-1]["bis"] = round(c + STEP / 2 - rng[0], 2)
        else:
            s = {"art": kind, "von": round(t - rng[0], 2), "bis": round(t + STEP - rng[0], 2)}
            if sill is not None:
                s["sturz_m"] = sill
            segs.append(s)
        t += STEP
    for s in segs:
        s["breite_m"] = round(s["bis"] - s["von"], 2)
    return segs


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("raum")
    ap.add_argument("--out", required=True)
    a = ap.parse_args()
    room, z, lvl = find_room(a.raum)
    x0, x1, y0, y1 = room["rect"]
    g = load_glb(H3D / "assets/arch/Haus-v0.4.4.glb")
    boxes = node_boxes(g)
    ceiling = min((b["h0"] for b in boxes if b["h0"] > z + 1.5 and b["x0"] < x1 and b["x1"] > x0
                   and b["y0"] < y1 and b["y1"] > y0 and "wall" not in b["mat"] and "glass" not in b["mat"]),
                  default=None)
    sides = {s: classify_side(boxes, s, room["rect"], z) for s in "SNWE"}
    navrooms = [r for lv in ("eg", "og") for r in json.loads((H3D / f"data/navigation-{lv}.json").read_text(encoding="utf-8"))["rooms"]
                if (lv.upper() == lvl)]
    for sd, segs in sides.items():
        for sg in segs:
            if sg["art"] == "wand":
                continue
            m = (sg["von"] + sg["bis"]) / 2
            px, py = {"S": (x0 + m, y0 - 0.5), "N": (x0 + m, y1 + 0.5), "W": (x0 - 0.5, y0 + m), "E": (x1 + 0.5, y0 + m)}[sd]
            nb = next((r["id"] for r in navrooms if r["rect"][0] <= px <= r["rect"][1] and r["rect"][2] <= py <= r["rect"][3]), None)
            sg["fuehrt_zu"] = nb or "außen / unbekannt"
    reg = json.loads((H3D / "data/einrichtung.json").read_text(encoding="utf-8"))
    items = [i for i in reg["items"] if i.get("room") == room["id"]]
    doors = json.loads((H3D / "data/tueren.json").read_text(encoding="utf-8"))
    key = room["id"].lower().replace("ä", "ae").replace("ö", "oe").replace("ü", "ue")[:3]
    door_ids = [f"{d['id']} (Drehtür {d.get('width_m')} m)" for d in doors.get("swinging", [])
                if any(w.lower().startswith(key) for w in d["id"].split()[1:])]
    op = doors.get("open_passage")
    if isinstance(op, dict) and room["id"] in (op.get("room_a"), op.get("room_b")):
        door_ids.append(f"{op['id']} (offener Durchgang {op['room_a']}–{op['room_b']}, {op['width_m']} m)")

    W, H = round(x1 - x0, 2), round(y1 - y0, 2)
    data = {
        "raum": room["id"], "ebene": lvl, "quelle": "Haus-v0.4.4.glb + home_3d/data (v0.5.x)",
        "koordinaten": "lokal, Meter; Ursprung Südwest-Innenecke; x nach Osten, y nach Norden; Möbel: x,y = Südwest-Ecke, w = Ost-West, d = Nord-Süd",
        "innenmass_m": {"breite_ost_west": W, "tiefe_nord_sued": H},
        "lichte_hoehe_m": round(ceiling - z, 2) if ceiling else None,
        "waende": {"S": "Süd", "N": "Nord", "W": "West", "E": "Ost"},
        "seiten": sides,
        "tueren_laut_tueren_json": door_ids,
        "platzhalter": [{"id": i["id"], "name": i["name"], "x": round(i["x"] - x0, 2), "y": round(i["y"] - y0, 2),
                         "z": i["z"], "w": i["w"], "d": i["d"], "h": i["h"], "art": i["kind"],
                         "steht_auf": i.get("support"), "motiv": i.get("motif"), "status": i.get("status")}
                        for i in items],
    }
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    (out / "raum.json").write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")

    # ---- Zeichnung
    S, M = 150, 170  # px pro Meter, Rand
    PANEL = 520
    img = Image.new("RGB", (int(W * S + 2 * M + PANEL), int(max(H * S + 2 * M + 80, 900))), "#fbf8f2")
    d = ImageDraw.Draw(img)
    f = lambda sz, b=False: ImageFont.truetype(f"/usr/share/fonts/truetype/dejavu/DejaVuSans{'-Bold' if b else ''}.ttf", sz)
    X = lambda lx: M + lx * S
    Y = lambda ly: M + (H - ly) * S
    for i in range(int(W / 0.5) + 1):
        d.line([X(i * 0.5), Y(0), X(i * 0.5), Y(H)], fill="#e6dfd2", width=1)
    for i in range(int(H / 0.5) + 1):
        d.line([X(0), Y(i * 0.5), X(W), Y(i * 0.5)], fill="#e6dfd2", width=1)
    col = {"wand": "#3b3f4a", "oeffnung": "#c69b57", "glas": "#4aa3b0", "offen": "#c69b57"}
    T = 14
    for side, segs in sides.items():
        for s in segs:
            a0, a1 = s["von"], s["bis"]
            if side == "S":
                box = [X(a0), Y(0), X(a1), Y(0) + T]
            elif side == "N":
                box = [X(a0), Y(H) - T, X(a1), Y(H)]
            elif side == "W":
                box = [X(0) - T, Y(a1), X(0), Y(a0)]
            else:
                box = [X(W), Y(a1), X(W) + T, Y(a0)]
            if s["art"] == "wand":
                d.rectangle(box, fill=col["wand"])
            else:
                d.rectangle(box, outline=col[s["art"]], width=3)
                lab = {"oeffnung": f"Öffnung {s['breite_m']:.2f} m · Sturz {s.get('sturz_m')} m",
                       "offen": f"offen {s['breite_m']:.2f} m", "glas": f"Glas {s['breite_m']:.2f} m"}[s["art"]]
                lab += f" → {s.get('fuehrt_zu')}"
                cx, cy = (box[0] + box[2]) / 2, (box[1] + box[3]) / 2
                if side in ("S", "N"):
                    d.text((cx, cy + (34 if side == "S" else -34)), lab, fill="#8a6a35", font=f(18), anchor="mm")
                else:
                    tmp = Image.new("RGBA", (420, 30), (0, 0, 0, 0))
                    ImageDraw.Draw(tmp).text((210, 15), lab, fill="#8a6a35", font=f(18), anchor="mm")
                    tmp = tmp.rotate(90, expand=True)
                    img.paste(tmp, (int(cx + (-62 if side == "W" else 32)), int(cy - 210)), tmp)
    for it in sorted(data["platzhalter"], key=lambda i: bool(i["steht_auf"])):
        fill = {"moebel": "#e9dcc6", "musikgeraet": "#bfe0e3", "objekt": "#f3d9a4"}.get(it["art"], "#ddd")
        out_c = "#72513c" if it["art"] == "moebel" else "#17666c"
        bx = [X(it["x"]), Y(it["y"] + it["d"]), X(it["x"] + it["w"]), Y(it["y"])]
        d.rectangle(bx, fill=fill, outline=out_c, width=3 if not it["steht_auf"] else 2)
        d.text(((bx[0] + bx[2]) / 2, (bx[1] + bx[3]) / 2), it["id"], fill="#1d2a3a",
               font=f(14 if it["steht_auf"] else 18, True), anchor="mm")
    px0, py = int(W * S + 2 * M), M
    d.text((px0, py - 40), "Platzhalter (Entwurf)", fill="#142840", font=f(21, True))
    for it in data["platzhalter"]:
        line = f"{it['id']:<6} {it['name']}"
        d.text((px0, py), line, fill="#1d2a3a", font=f(17, True))
        sub = f"{it['w']:.2f}×{it['d']:.2f}×{it['h']:.2f} m" + (f" · auf {it['steht_auf']}" if it["steht_auf"] else "")
        d.text((px0 + 14, py + 22), sub, fill="#5a5f6a", font=f(15))
        py += 52
    py += 10
    d.text((px0, py), "Wände", fill="#142840", font=f(21, True)); py += 34
    nm = {"S": "Süd", "N": "Nord", "W": "West", "E": "Ost"}
    for sd in "NESW":
        txt = ", ".join(("Wand" if sg["art"] == "wand" else f"{ {'oeffnung': 'Öffnung', 'offen': 'offen', 'glas': 'Glas'}[sg['art']]} {sg['breite_m']:.2f} m → {sg.get('fuehrt_zu')}")
                        for sg in sides[sd])
        if all(sg["art"] == "wand" for sg in sides[sd]):
            txt = "geschlossen, kein Fenster"
        d.text((px0, py), f"{nm[sd]}: {txt}", fill="#1d2a3a", font=f(16)); py += 26
    # Maße, Titel, Nordpfeil, Maßstab
    d.text((M, 40), f"{room['id']} · Grundriss aus Hausmodell v0.4.4 ({lvl})", fill="#142840", font=f(30, True))
    d.text((M, 82), f"Innenmaß {W:.2f} × {H:.2f} m · lichte Höhe {data['lichte_hoehe_m']} m · Raster 0,5 m · Norden oben",
           fill="#142840", font=f(19))
    d.line([X(0), Y(0) + 70, X(W), Y(0) + 70], fill="#142840", width=2)
    d.text(((X(0) + X(W)) / 2, Y(0) + 88), f"{W:.2f} m", fill="#142840", font=f(19), anchor="mm")
    d.line([X(W) + 70, Y(0), X(W) + 70, Y(H)], fill="#142840", width=2)
    d.text((X(W) + 92, (Y(0) + Y(H)) / 2), f"{H:.2f} m", fill="#142840", font=f(19), anchor="lm")
    nx, ny = img.width - 70, 70
    d.polygon([(nx, ny - 30), (nx - 14, ny + 10), (nx + 14, ny + 10)], fill="#142840")
    d.text((nx, ny + 28), "N", fill="#142840", font=f(22, True), anchor="mm")
    ly = img.height - 50
    d.text((M, ly), "■ Wand   □ Öffnung (gold)   □ Glas (teal)   Möbel braun · Musikgerät/Objekt teal", fill="#3b3f4a", font=f(17))
    img.save(out / "grundriss.png")
    print(json.dumps({k: data[k] for k in ("raum", "innenmass_m", "lichte_hoehe_m", "tueren_laut_tueren_json")},
                     ensure_ascii=False))
    for sd, segs in sides.items():
        print(sd, [(s["art"], s["von"], s["bis"], s.get("sturz_m")) for s in segs])


if __name__ == "__main__":
    main()

# EMFD-3D v0.5.2 · Das Haus der kleinen Wunder · Modul `home/3d/`

Modulare Neuentwicklung der begehbaren 3D-Welt. Keine Musik, kein Audio, keine externen Laufzeitaufrufe.

## Voraussetzung: Three.js 0.164.1 lokal

```
vendor/three/build/three.module.js
vendor/three/examples/jsm/…        (vollständig, GLTFLoader importiert weitere Module)
vendor/three/LICENSE
```

Aus `npm pack three@0.164.1` → `package/build`, `package/examples/jsm`, `package/LICENSE`.
Fehlt der Ordner, zeigt die Seite eine klare Fehlermeldung statt endlos zu laden.

## Lokal starten

```
python3 -m http.server 8000 --directory web-3d
```
→ http://localhost:8000/ (nicht per Doppelklick öffnen).

## Steuerung

| | Basic (Voreinstellung) | Pro |
|---|---|---|
| Gehen | Tippen/Klicken auf Boden | W/S ↑/↓ · A/D seitwärts · Touch: Daumen-Stick |
| Umsehen | Wischen/Ziehen: waagerecht drehen, senkrecht neigen (±35°) · „⟳ Umsehen“ · „⟷ Blick gerade“ | ←/→ Q/E · Maus (Klick fängt sie) · Touch: Ziehen, mit Neigung |
| Benutzen | Tippen auf Objekt (Blick richtet sich darauf) | Leertaste/Eingabe/F (Bildmitte) · Tippen |
| Schneller | – | Umschalt |

Teezimmer: Kontextknöpfe „Kartentisch“ (hingehen, Platz nehmen) und „Spieluhr“ (hingehen, „♪ Musik öffnen“).

## Aufbau (Schichten getrennt)

| Schicht | Quelle | sichtbar | Kollision | Klick |
|---|---|---|---|---|
| Architektur | `assets/arch/Haus-v0.4.4.glb` (unverändert, verbindliche Geometrie) | ja | nein | nein |
| Platzhalter `ITEM …` im GLB | dasselbe GLB | **nie** (nur Option „Planungshüllen“) | nein | nein |
| Objekt-Assets | `assets/objects/*.glb` + `.asset.json` | ja | nein | nein |
| Formstudien Teezimmer (P2) | `src/world/teezimmer-studien.js` | ja, bis ein Asset sie ersetzt | nein | nein |
| Stellflächen | Bodenlinien aus Register | ja (Option) | nein | nein |
| Kollision | `data/navigation-eg.json`, `navigation-og.json` (Raster 5 cm) | nie | **ja** | nein |
| Interaktion | unsichtbare Boxen aus `data/einrichtung.json` | nie | nein | **ja** |

## Ordner

```
index.html            UI-Gerüst, lokale Importmap
src/boot.js           Startlader mit sichtbaren Fehlern
src/app.js            Szene, Steuerung, Ebenen
src/nav/              Raster, A*-Wegsuche, Ebenen/Treppen, Kamera (ohne Three.js testbar)
src/world/            Architektur, UV-Projektion, Assets, Klickflächen, Formstudien
src/ui/minimap.js     maßstäbliche Raumkarte
src/bridge/moments.js PWA-Brücke (Musiknachricht EMFD_P08_OPEN_MUSIC)
src/nav/walker.js     Geh-Controller (Tempo, Drehen, Schritte, Sitzen)
src/ui/controls.js    Steuerung Basic/Pro, Stick
assets/               arch/, objects/, materials/
data/                 Register, Navigation, Treppen, Materialien, Assets
```

## Upload (nur manuell, nach Freigabe)

1. Auf STRATO `/wunderhaus/home/3d/` vollständig sichern.
2. **Inhalt** des ZIP nach `/wunderhaus/home/3d/` kopieren (`index.html` direkt dort).
3. Safari: Seite neu laden bzw. privaten Tab nutzen.
4. Rückfall: `EMFD-3D-v0.4.3-Rueckfall-home-3d.zip` (unveränderter Ausgangsstand) zurückkopieren.

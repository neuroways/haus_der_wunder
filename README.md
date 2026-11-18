# Haus der kleinen Wunder · Ein Moment für dich

Zusammengeführtes Repository der Web-Anwendung und der zentralen Medien.
Die Ordnerstruktur entspricht dem Server-Pfad `/wunderhaus/`:

| Ordner | Server-Pfad | Inhalt |
|---|---|---|
| `home/` | `/wunderhaus/home/` (= `haus-der-wunder.de`) | PWA „Haus der kleinen Wunder“ (bindet `../media/media-loader.js` relativ ein) |
| `media/` | `/wunderhaus/media/` | Zentrale Medien (Karten O01–O18, Cover O04/O06/O24, WebP-Varianten), Loader, Manifest-Schema, Medienkatalog |

Übergabe und nächste Schritte: [`docs/UEBERGABE-EMFD-MEDIA-CORE-01.md`](docs/UEBERGABE-EMFD-MEDIA-CORE-01.md). Live-Momentaufnahmen: [`live/`](live/).

Regeln für Medien: siehe [`media/MEDIEN-KONVENTION.md`](media/MEDIEN-KONVENTION.md).

## Noch offen
- **Manifest v2 noch nicht gebaut.** Das Live-Manifest (v1, PERF-01) liegt als Momentaufnahme in `live/manifest.json`. Für den Merge fehlt das Paket `EMFD-MEDIA-CORE-01_v1.1.0.zip` (u. a. `tools/emfd_media.py`, `input/handoff`, `reports/staging.json`, Inventare, Tests).
- **`home/` ist unvollständig.** Hier liegen bisher nur `index.html` und `media-bridge.js`. Die übrigen in `index.html` eingebundenen Dateien (u. a. `app.js`, `data.js`, `style.css`, `shared/`, `library/`, `emfd-ui/`, `assets/icons/`, `manifest.webmanifest`) müssen noch ergänzt werden.
- Kartenvorderseiten O19–O24 sind noch nicht enthalten.

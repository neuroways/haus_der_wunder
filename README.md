# Haus der kleinen Wunder · Ein Moment für dich

Zusammengeführtes Repository der Web-Anwendung und der zentralen Medien.
Die Ordnerstruktur entspricht dem Server-Pfad `/wunderhaus/`:

| Ordner | Server-Pfad | Inhalt |
|---|---|---|
| `home/` | `/wunderhaus/home/` (= `haus-der-wunder.de`) | PWA „Haus der kleinen Wunder“ (bindet `../media/media-loader.js` relativ ein) |
| `media/` | `/wunderhaus/media/` | Zentrale Medien (Karten O01–O18, Cover O04/O06/O24, WebP-Varianten), Loader, Manifest-Schema, Medienkatalog |

Regeln für Medien: siehe [`media/MEDIEN-KONVENTION.md`](media/MEDIEN-KONVENTION.md).

## Noch offen
- **`media/manifest.json` fehlt.** Ohne Manifest liefert der Loader keine Medien; die App fällt auf ihre bisherigen Kartenbilder zurück.
- **`home/` ist unvollständig.** Hier liegen bisher nur `index.html` und `media-bridge.js`. Die übrigen in `index.html` eingebundenen Dateien (u. a. `app.js`, `data.js`, `style.css`, `shared/`, `library/`, `emfd-ui/`, `assets/icons/`, `manifest.webmanifest`) müssen noch ergänzt werden.
- Kartenvorderseiten O19–O24 sind noch nicht enthalten.

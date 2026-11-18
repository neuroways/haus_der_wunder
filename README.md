# Haus der kleinen Wunder · Ein Moment für dich

Zusammengeführtes Repository der Web-Anwendung und der zentralen Medien.
Die Ordnerstruktur entspricht dem Server-Pfad `/wunderhaus/`:

| Ordner | Server-Pfad | Inhalt |
|---|---|---|
| `home/` | `/wunderhaus/home/` (= `haus-der-wunder.de`) | PWA „Haus der kleinen Wunder“ (bindet `../media/media-loader.js` relativ ein) |
| `home_3d/` | `/wunderhaus/home_3d/` | Begehbare 3D-Welt EMFD-3D v0.5.2 (Three.js 0.164.1 lokal in `vendor/`). Auf dem Server liegt dort noch ein älterer Prototyp (v0.4.x). |
| `media/` | `/wunderhaus/media/` | Zentrale Medien (Karten O01–O18, Cover O04/O06/O24, WebP-Varianten), Loader, Manifest-Schema, Medienkatalog |

Übergabe und nächste Schritte: [`docs/UEBERGABE-EMFD-MEDIA-CORE-01.md`](docs/UEBERGABE-EMFD-MEDIA-CORE-01.md). Live-Momentaufnahmen: [`live/`](live/).

Regeln für Medien: siehe [`media/MEDIEN-KONVENTION.md`](media/MEDIEN-KONVENTION.md).

## Medien prüfen

```bash
python3 tools/media_check.py            # media/ auslesen und prüfen → reports/media-bericht.md
python3 tools/media_check.py --server   # zusätzlich mit flowisaurus.de/wunderhaus/media/ vergleichen (nur lesen)
```

Der Bericht zeigt die Ordnerstruktur, je Karte O01–O24 und T03 die neueste Revision mit fehlenden Varianten, Hash-Fehler (Dateiinhalt passt nicht zum Namen), Änderungen seit dem letzten Lauf und den Server-Abgleich. Außerdem prüft es, ob `home/` und `home_3d/` beide den gemeinsamen Loader `../media/media-loader.js` einbinden, keine absoluten Medienpfade nutzen und keine Medienkopien enthalten (mit `--server` auch die Live-Fassung). `reports/media-inventar.json` ist der Vergleichsstand für den nächsten Lauf. Nur Python 3, keine Zusatzpakete.

## Noch offen
- **Manifest v2 noch nicht gebaut.** Das Live-Manifest (v1, PERF-01) liegt als Momentaufnahme in `live/manifest.json`. Für den Merge fehlt das Paket `EMFD-MEDIA-CORE-01_v1.1.0.zip` (u. a. `tools/emfd_media.py`, `input/handoff`, `reports/staging.json`, Inventare, Tests).
- **`home/` ist unvollständig.** Hier liegen bisher nur `index.html` und `media-bridge.js`. Die übrigen in `index.html` eingebundenen Dateien (u. a. `app.js`, `data.js`, `style.css`, `shared/`, `library/`, `emfd-ui/`, `assets/icons/`, `manifest.webmanifest`) müssen noch ergänzt werden.
- **`home_3d/` nutzt `media/` noch nicht.** Die Karten im Teezimmer sind im Code erzeugte Platzhalter; die 3D-Brücke (`src/bridge/media.js` aus `EMFD-MEDIA-CORE-01_v1.1.0.zip`) fehlt.
- Kartenvorderseiten O19–O24 sind noch nicht enthalten.

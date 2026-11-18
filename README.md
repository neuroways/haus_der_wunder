# Haus der kleinen Wunder · Ein Moment für dich

Zusammengeführtes Repository der Web-Anwendung und der zentralen Medien.
Die Ordnerstruktur entspricht dem Server-Pfad `/wunderhaus/`:

| Ordner | Server-Pfad | Inhalt |
|---|---|---|
| `home/` | `/wunderhaus/home/` (= `haus-der-wunder.de`) | PWA „Haus der kleinen Wunder“ (bindet `../media/media-loader.js` relativ ein) |
| `home_3d/` | `/wunderhaus/home_3d/` | Begehbare 3D-Welt EMFD-3D v0.5.2 (Three.js 0.164.1 lokal in `vendor/`). Auf dem Server liegt dort noch ein älterer Prototyp (v0.4.x). |
| `media/` | `/wunderhaus/media/` | Zentrale Medien (Karten O01–O18, Cover O04/O06/O24, WebP-Varianten), Loader, Manifest-Schema, Medienkatalog |

Weitere Ordner:

| Ordner | Inhalt |
|---|---|
| `tools/` | `emfd_media.py` (Manifest bauen/prüfen, aus EMFD-MEDIA-CORE-01) · `media_check.py` (Bestand und Aktualität prüfen) |
| `tests/` | Loader-, Werkzeug- und Browsertests; `bash tests/run_tests.sh` führt alles ohne Server aus |
| `input/handoff/` | unveränderte Übergabedaten (Quelle für `build`) |
| `reports/` | `staging.json`, `medienstatus.csv`, `abgleich.json` (Paket) · `media-bericht.md`, `media-inventar.json` (Medien-Check) |
| `3d-integration/` | Original der 3D-Brücke aus dem Paket (v1.0.0); eingebaut ist die angepasste Fassung in `home_3d/src/bridge/media.js` |
| `docs/` | Übergabe, Paket-README, `01`–`08` (Bestand, Schnittstelle, Deployment/Rollback, PWA, 3D, Tests, Live-Bestand 18.11., Entscheidungen) |
| `live/` | Momentaufnahmen vom Server (nur gelesen): Manifest v1, `home/` (v0.6.66), `inventar/` (Serverprüfung) |
| `release/` | Manifest-Kandidat Revision 2 und `.htaccess`-Vorschlag – **nicht live** |

Übergabe und nächste Schritte: [`docs/UEBERGABE-EMFD-MEDIA-CORE-01.md`](docs/UEBERGABE-EMFD-MEDIA-CORE-01.md). Live-Bestand: [`docs/07_Live-Bestand-2026-11-18.md`](docs/07_Live-Bestand-2026-11-18.md). Live-Momentaufnahmen: [`live/`](live/).

Regeln für Medien: siehe [`media/MEDIEN-KONVENTION.md`](media/MEDIEN-KONVENTION.md).

## Medien prüfen

```bash
python3 tools/media_check.py            # media/ auslesen und prüfen → reports/media-bericht.md
python3 tools/media_check.py --server   # zusätzlich mit flowisaurus.de/wunderhaus/media/ vergleichen (nur lesen)
```

Der Bericht zeigt die Ordnerstruktur, je Karte O01–O24 und T03 die neueste Revision mit fehlenden Varianten, Hash-Fehler (Dateiinhalt passt nicht zum Namen), Änderungen seit dem letzten Lauf und den Server-Abgleich. Außerdem prüft es, ob `home/` und `home_3d/` beide den gemeinsamen Loader `../media/media-loader.js` einbinden, keine absoluten Medienpfade nutzen und keine Medienkopien enthalten (mit `--server` auch die Live-Fassung). `reports/media-inventar.json` ist der Vergleichsstand für den nächsten Lauf. Nur Python 3, keine Zusatzpakete.

## Noch offen
- **Manifest Revision 2 ist gebaut, aber nicht veröffentlicht:** [`release/manifest.json.neu`](release/manifest.json.neu). Es basiert auf der Serverprüfung vom 18.11.2026 ([`docs/07_Live-Bestand-2026-11-18.md`](docs/07_Live-Bestand-2026-11-18.md)). Die Release-Prüfung bleibt gesperrt, bis die 84 neuen Dateien hochgeladen sind. Reihenfolge und Freigabepunkte: [`release/README.md`](release/README.md).
- **Live fehlen:** alle 35 MP3, Vorderseiten O19–O24 (live noch Altstand), 22 Cover, Rückseite v1.2, Objektmedien, 18 Raumvarianten.
- **`home/` ist unvollständig.** Hier liegen bisher nur `index.html` und `media-bridge.js`. Die übrigen in `index.html` eingebundenen Dateien (u. a. `app.js`, `data.js`, `style.css`, `shared/`, `library/`, `emfd-ui/`, `assets/icons/`, `manifest.webmanifest`) müssen noch ergänzt werden.
- **`home_3d/` ist angeschlossen, zeigt aber noch keine Medien.** `index.html` setzt `emfd-media-base` auf `../media/`, die Brücke liegt in `src/bridge/media.js`. Die Karten im Teezimmer sind weiterhin bewusst neutrale Platzhalter; welche Karten dort echte Motive zeigen, ist noch zu entscheiden.
- **`deploy/` aus dem Paket fehlt im Repo.** Sein Inhalt entspricht `media/` – bis auf `manifest.json` (Revision 1, wird für Tests nach `work/` neu gebaut) und `htaccess-vorschlag.txt`.
- `pwa-migration/` aus dem Paket ist nicht übernommen: `home/media-bridge.js` ist bereits die neuere Fassung 1.1.0.

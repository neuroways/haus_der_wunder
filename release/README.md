# release/ · Kandidaten zur Veröffentlichung (nichts davon ist live)

| Datei | Inhalt | Ziel auf dem Server |
|---|---|---|
| `manifest.json.neu` | Manifest Revision 2: Live-Manifest v1 unverändert + `mediaCore` (Schema `emfd-media-core` 2.0.0). Gebaut aus dem Serverbestand vom 18.11.2026 | `/wunderhaus/media/manifest.json` (**zuletzt**, ⚠ Freigabe) |
| `htaccess-vorschlag.txt` | Cache-Regeln: Manifest/JSON und Altnamen `no-cache`, gehashte Dateien 1 Jahr `immutable` | `/wunderhaus/media/.htaccess` (⚠ Freigabe, vorher vorhandene Datei sichern) |

Befunde, die zu diesem Kandidaten führen: [`docs/07_Live-Bestand-2026-11-18.md`](../docs/07_Live-Bestand-2026-11-18.md).

## Stand der Prüfung

```bash
python3 tools/emfd_media.py validate release/manifest.json.neu
```
Ergebnis: 0 Fehler (Entwicklungsmodus). Eine Warnung betrifft das Deckblatt (PNG mit `.jpeg`-Endung).

```bash
python3 tools/emfd_media.py validate release/manifest.json.neu --release
```
Ergebnis: **gesperrt**, solange die 84 neuen Dateien nicht hochgeladen sind. Das ist gewollt: Das Manifest darf erst veröffentlicht werden, wenn alles, worauf es verweist, auf dem Server liegt.

## Reihenfolge (jeder ⚠-Schritt nur nach deiner ausdrücklichen Freigabe)

1. ⚠ **Sicherung** im STRATO-Dateimanager: `media/manifest.json` kopieren nach `media/manifest-v1-perf01-2026-11-18.json`.
2. ⚠ **Neue Dateien hochladen**: die Pakete `EMFD-Medien-Karten-Cover-Teil1von4.zip` … `Teil4von4.zip` (je < 20 MB, 89 Dateien) nacheinander in **`/wunderhaus/`** hochladen und dort entpacken (der Ordner `media/` steckt im ZIP). Es sind nur neue Namen, nichts wird überschrieben:
   `cards/fronts/` (18), `covers/` (3), `optimized/cards/*-r2-*` (54), `optimized/covers/` (9), `media-loader.js`, `media-loader.mjs`, `manifest.schema.json`, `MEDIEN-KONVENTION.md`, `katalog/index.html`.
3. **Prüfen** (lesend) und **neu bauen**:
   ```bash
   python3 tools/emfd_media.py http-check --base https://flowisaurus.de/wunderhaus/media/ --manifest release/manifest.json.neu --out work/http-nach-upload.json
   ```
   ```bash
   python3 tools/emfd_media.py build --handoff input/handoff --staged reports/staging.json --inventory live/inventar/server-2026-11-18.json --inventory work/http-nach-upload.json --live-manifest live/manifest.json --room-music-map live/home/room-music-map.json --mode merge --revision 2 --out release/manifest.json.neu
   ```
   ```bash
   python3 tools/emfd_media.py validate release/manifest.json.neu --release
   ```
4. ⚠ **Veröffentlichen**: `release/manifest.json.neu` als `media/manifest.json.neu` hochladen und im Dateimanager in `manifest.json` umbenennen. Das ersetzt die Datei in einem Schritt.
5. ⚠ **Cache-Regeln**: `htaccess-vorschlag.txt` als `.htaccess` in `/wunderhaus/media/` ablegen und mit `curl -sI` kontrollieren.
6. **Kontrolle**: `https://flowisaurus.de/wunderhaus/media/katalog/` auf dem iPhone öffnen und „Dateien auf dem Server prüfen“ tippen.
7. ⚠ 2D-Brücke einspielen (`home/index.html` + `home/media-bridge.js`, siehe `docs/04_PWA-Migration.md`).

Rollback: Sicherung aus Schritt 1 wieder als `manifest.json` einsetzen (hochladen als `.neu`, dann umbenennen). Die neuen Dateien schaden nicht, wenn sie liegen bleiben. Revisionen werden nur hochgezählt, nie zurück.

## Raum-Upload (freigegeben am 18.11.2026)

Paket `EMFD-Raeume-Upload-2026-11-18.zip` (8,4 MB, 19 Dateien): im STRATO-Dateimanager in **`/wunderhaus/`** entpacken. Der Ordner `media/` im ZIP landet dann richtig.

| Datei | Inhalt |
|---|---|
| `media/rooms/varianten/*.webp` (18) | Original-Raumvarianten vom 29.10., auf dem Server bisher 404: P01 abend/mond, P02 leseplatz/sessel, P03 brunnen/werkbank, P04 arbeitsflaeche/treppenblick, P05 brunnen/steinbruecke, P06 bruecke/langer-steg, P07 mond/stadt, P08 mond/rundtisch, flur dunkel-tisch/gang |
| `media/rooms/P04-atelier-r1-9b6f11cc.webp` | Atelier-Hauptbild **Werkbank** (Original 29.10.) unter neuem Namen |

**Es wird nichts überschrieben.** Alle 19 Namen sind auf dem Server frei (geprüft am 18.11.). Nicht enthalten ist `P04-atelier-kartenauslage-v1.webp`, weil der Server dort eine andere Fassung hat; sie bleibt gesperrt.
Der Altpfad `rooms/P04-atelier.webp` (Kartenauslage) bleibt unverändert; Apps mit Loader nutzen ihn nicht.

Kontrolle danach (lesend):
```bash
python3 tools/emfd_media.py http-check --base https://flowisaurus.de/wunderhaus/media/ --manifest release/manifest.json.neu --only "rooms/" --out work/http-raeume.json
```
Danach das Manifest neu bauen (Schritt 3 oben). Die 19 Dateien wechseln dann von `staged` auf `verified`.

## Wenn neue Medien kommen (Audio, O19–O24, Cover)

1. Die Dateien nach `input/neu/` legen und mit `tools/emfd_media.py stage` in versionierte Namen überführen. Das aktualisiert `reports/staging.json`.
2. Hochladen (⚠), dann Schritt 3 mit `--revision 3` usw.
3. Bei Audio gilt: genau die Pfade `audio/O01.mp3`–`O24.mp3` und `audio/THEME.mp3`, weil die Live-App sie so erwartet. Die Prüfung testet Range/206.

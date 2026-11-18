# EMFD-MEDIA-CORE-01 · Deployment und Rollback

**Nichts davon ist bisher ausgeführt.** Jeder Schritt mit ⚠ verändert den Server und braucht deine Freigabe. Grundsätze: nur neue Dateien hinzufügen, nichts überschreiben oder löschen, Manifest zuletzt und atomar.

Werkzeug: `python3 tools/emfd_media.py <befehl>` (Python 3.9+, Pillow nur für `stage`). Alle Prüfbefehle sind rein lesend.

## A. Vorbereiten (lesend)

1. **Sicherung der Live-Datei:** `https://flowisaurus.de/wunderhaus/media/manifest.json` im Browser öffnen und als `live/manifest.json` speichern. Zusätzlich im STRATO-Dateimanager eine Kopie anlegen: `manifest-v1-perf01-2026-11-18.json` ⚠ (reine Kopie, nichts ersetzt).
2. **Server-Dateiliste** von `/wunderhaus/media/` exportieren (Dateimanager, FTP-Client oder `ls -lR`) und importieren:
   ```
   python3 tools/emfd_media.py import-list live/dateiliste.txt --out live/inventar-liste.json
   ```
3. **HTTP-Prüfung** aller bekannten und geplanten Pfade (Status, endgültige URL, Content-Type, Signatur, Maße, Alpha, MP3-Range 206, HTML-Fehlerseiten):
   ```
   python3 tools/emfd_media.py http-check --manifest deploy/wunderhaus/media/manifest.json --inventory-csv input/handoff/Dateipfad-Inventar.csv --out live/inventar-http.json
   ```
4. **Abgleich** – findet Dateien, die schon auf dem Server liegen (gleiche Bytes) oder dort unbekannt sind:
   ```
   python3 tools/emfd_media.py reconcile --manifest deploy/wunderhaus/media/manifest.json --inventory live/inventar-liste.json --out-dir live/abgleich
   ```
   - `stagedAlreadyOnServer`: diese Datei **nicht** erneut hochladen, sondern in `live/zuordnung.csv` eintragen (`path;owner;role;variant`).
   - `unknownOnServer`: z. B. bereits hochgeladene Cover mit eigenem Namen → ebenfalls in `zuordnung.csv` (Rolle `cover` oder `front`).

## B. Neue Dateien hochladen ⚠

Upload-Bündel: `deploy/wunderhaus/media/` ohne `manifest.json`. Nur diese **neuen** Ordner/Dateien (84 Medien + 5 Schnittstellendateien):

```
cards/fronts/        18 neue Vorderseiten (PNG, Original)
covers/               3 neue CD-Cover (PNG, Original)
optimized/cards/     54 WebP (O01–O18 · 210×360, 630×1080, 896×1536, alle mit -r2-<hash>)
optimized/covers/     9 WebP (O04, O06, O24 · 160, 480, 1024)
media-loader.js, media-loader.mjs, manifest.schema.json, MEDIEN-KONVENTION.md, katalog/index.html
```

Keine dieser Dateien existiert bisher unter diesem Namen; es wird nichts überschrieben. `.htaccess` nur nach Abgleich mit einer vorhandenen Datei ergänzen (`htaccess-vorschlag.txt`).

## C. Prüfen und Manifest bauen

5. Hochgeladenes prüfen: `http-check --manifest deploy/wunderhaus/media/manifest.json --only "fronts|covers|r2-|cover-" --out live/inventar-neu.json`
6. Manifest Revision 2 **additiv** zur Live-Datei bauen:
   ```
   python3 tools/emfd_media.py build --handoff input/handoff --staged reports/staging.json \
     --inventory live/inventar-liste.json --inventory live/inventar-http.json --inventory live/inventar-neu.json --assign live/zuordnung.csv \
     --live-manifest live/manifest.json --mode merge --revision 2 --out live/manifest.json.neu
   ```
7. Freigabeprüfung:
   ```
   python3 tools/emfd_media.py validate live/manifest.json.neu --schema deploy/wunderhaus/media/manifest.schema.json --release
   ```
   Fehler blockieren (nicht hochgeladen, 404, HTML statt Datei, falscher Typ, Hash abweichend). Warnungen (O19–O24 ohne neue Vorderseite) sind bekannt und werden in Apps als „unbestätigt“ angezeigt.

## D. Manifest veröffentlichen ⚠ (zuletzt, atomar)

8. `live/manifest.json.neu` als `manifest.json.neu` in `/wunderhaus/media/` hochladen, dann im Dateimanager **umbenennen** zu `manifest.json` (Umbenennen ersetzt in einem Schritt; kein halb hochgeladenes Manifest ist je sichtbar).
9. Kontrolle: `https://flowisaurus.de/wunderhaus/media/katalog/` auf dem iPhone öffnen → Revision 2, 18/24 aktuell, 3/25 Cover; „Dateien auf dem Server prüfen“ tippen.
10. PWA-Brücke einbauen (separate Freigabe, `04_PWA-Migration.md`).

## E. Rollback

| Situation | Maßnahme | Wirkung |
|---|---|---|
| Neues Manifest fehlerhaft | Sicherung `manifest-v1-perf01-2026-11-18.json` wieder als `manifest.json` einsetzen (Upload als `.neu` + Umbenennen) | Loader erkennen kein `emfd-media-core` mehr → behalten ihren letzten guten Stand bzw. die PWA nutzt ihre eingebauten Profile; die PWA ist unabhängig vom Manifest |
| Einzelne neue Datei fehlerhaft | Manifest Revision 3 bauen, in dem die Karte wieder auf r1 zeigt (`--assign` weglassen bzw. Datei aus `staging.json` entfernen) | alle Apps zeigen beim nächsten Start r1; Revision steigt immer weiter (nie zurückzählen) |
| PWA-Brücke stört | `media-bridge.js`-Zeile aus `home/index.html` entfernen, oder sofort auf einem Gerät: `?emfd-media-bridge=off` bzw. `localStorage['emfd-media-bridge']='off'` | PWA exakt wie v0.6.56 |
| Neue Dateien wieder entfernen | erst nach Rollback des Manifests und nur mit deiner Zustimmung | – |

Bestehende Pfade (`cards/O01.png`, PERF-01-WebPs, `audio/*.mp3`) bleiben in jedem Fall unverändert erreichbar.

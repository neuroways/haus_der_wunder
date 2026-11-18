# EMFD-MEDIA-CORE-01 · Migration der bestehenden PWA (v0.6.56) – Vorschlag/Patch

Ziel: Die PWA unter `/wunderhaus/home/` zeigt aktualisierte Vorderseiten und Cover aus dem zentralen Manifest, **ohne** dass bestehende Funktionen, Routen, Dateien oder Medien wegfallen. Der Live-Code der PWA lag nicht vor; der Patch stützt sich auf `image-profiles.js` aus v0.6.56 (im Übergabepaket) und berührt keine bestehende Datei außer einer Zeile in `index.html`.

## Patch

Neue Datei: `home/media-bridge.js` (aus `pwa-migration/home/`).

`home/index.html` – direkt nach der bestehenden Zeile für `image-profiles.js` einfügen:

```diff
   <script src="image-profiles.js"></script>
+  <script src="/wunderhaus/media/media-loader.js"></script>
+  <script src="media-bridge.js"></script>
   <script src="app.js"></script>
```

(Falls die Skripte mit `defer` geladen werden: dieselben Attribute übernehmen, Reihenfolge beibehalten.)

## Verhalten

- Ohne Manifest-v2 oder bei jedem Fehler: **keine Änderung**, die PERF-01-Profile bleiben aktiv.
- Karte mit aktueller, nutzbarer neuer Vorderseite: `card.image`, `imageOverview`, `imageDetail`, `imageWidth/Height` zeigen auf die `-r2-`-Varianten; `EMFDImages.card(id, purpose)` liefert sie ebenfalls.
- Karten ohne neue Fassung (O19–O24) und alle anderen Medien: unverändert.
- Erster Start nach Veröffentlichung: Manifest lädt im Hintergrund, Ereignis `emfd-media-updated` (`detail.changed` = Karten-IDs). Ab dem zweiten Start wird der gespeicherte Stand **vor** `app.js` angewendet – auch offline und nach iPhone-Neustart.
- Neu verfügbar: `EMFDImages.cover(id)` → URL des eigenständigen Covers (O01–O24, T03) oder `''`.
- Audio: unverändert (`../media/audio/Oxx.mp3` zeigt bereits auf `/wunderhaus/media/audio/`). Kein Autoplay, kein Precache.
- Notbremse ohne Deployment: `?emfd-media-bridge=off` oder `localStorage['emfd-media-bridge']='off'`.

## Optionale Folgeschritte (eigene Freigabe, Code nicht im Paket)

1. Playlist-/Musikzimmer-Cover (`music-room.js`): an der Stelle, die `item.media.imagePath` setzt,
   `const src = (EMFDImages.cover && EMFDImages.cover(item.cardId || 'T03')) || item.media.imagePath;`
2. Sofortige Aktualisierung beim ersten Start: in `app.js` auf `emfd-media-updated` die aktuelle Ansicht neu zeichnen.
3. `image-service-worker.js`: prüfen, dass Bilder unter `/wunderhaus/media/optimized/cards/*-r2-*` und `/optimized/covers/` vom bestehenden Bildcache erfasst werden (Muster statt fester Liste) und dass `manifest.json` **nicht** gecacht wird. Scope bleibt `home/`.
4. `home/assets/weltenweberin.jpeg` später durch `portrait.weltenweberin.r1` ersetzen (Dublette).

## Abnahme

`tests/run_browser_smoke.sh` prüft mit einer PWA-Attrappe und der echten `image-profiles.js`: Vorher PERF-01-Pfade, nach Netzladen r2-URLs für O01–O18, O19 unverändert, zweiter Start synchron, Notbremse wirkt. Auf dem iPhone: PWA öffnen, schließen, erneut öffnen → O01 zeigt die neue Vorderseite; Flugmodus → Start funktioniert weiter.

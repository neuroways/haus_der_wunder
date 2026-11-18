# EMFD-CARD-BACK-01 – Umsetzung und Testprotokoll v0.6.53

Basis: ausschließlich die im Übergabepaket enthaltene v0.6.52  
Stand: 4. November 2026  
Status: lokale Testfassung, keine Veröffentlichungsfreigabe

## Umsetzung

- Eine gemeinsame Kartenrückseite v1.1 ist zentral in `image-profiles.js` registriert.
- Das unveränderte Original-JPEG wird durch drei proportional erzeugte WebP-Profile ergänzt: 240×360, 630×945 und 896×1344 Pixel.
- Zufallsziehungen auf der Startseite und im Teezimmer verwenden zunächst `#karte/verdeckt`.
- Die zufällig gewählte O-ID bleibt bis zur Enthüllung ausschließlich im Sitzungsspeicher.
- Vor der Enthüllung erscheinen weder Kartenname, Kategorie, O-ID, Begleittexte noch Kartenmusik in URL, Seitentitel oder zugänglichen Beschriftungen.
- Eine verdeckte Ziehung stoppt die bestehende zentrale Audio-Session und blockiert Karten- und Hintergrund-Autostarts.
- Das erste bewusste Umdrehen enthüllt genau einmal, ersetzt die URL ohne zweiten Routenwechsel und bietet die zugehörige Musik über die bestehende Audio-Session an.
- Ruhemodus, globale Stille, die Entscheidung „Ohne Hintergrundmusik“, Lautstärke 0 sowie ein vorheriges bewusstes Stoppen/Pausieren behalten Vorrang.
- Wenn Mapping, Audiodatei oder Browserfreigabe nicht rechtzeitig verfügbar sind, bleibt die Karte enthüllt und der vorhandene Player bietet den manuellen Start beziehungsweise eine Fehlermeldung.
- Weitere Drehungen starten keine Musik erneut.
- Galerie, Atelier und direkte Links `#karte/Oxx` öffnen weiterhin direkt die Vorderseite.
- Normale Ansicht und Nahansicht verwenden `object-fit: contain`; keine Seite wird gestreckt oder beschnitten.
- Das Teezimmer-Design wurde nicht verändert; nur die Tageskartenaktion wurde technisch angebunden.

## Geänderte Home-Dateien

- `app.js`
- `card-draw.js` (neu)
- `card-interaction.css`
- `card-interaction.js`
- `card-preload.js`
- `deployment-layout.json`
- `emfd-fe07.css`
- `experience.css`
- `image-profiles.js`
- `image-service-worker.js`
- `index.html`
- `manifest.webmanifest`
- `music-player.js`
- `package.json`
- `teezimmer.js`
- `tests/card-back-01.test.cjs` (neu)
- `tests/teezimmer-p08.test.cjs`
- `file-hashes.json`

## Neue Medien

- `/media/cards/EMFD_Kartenrueckseite_v1.1.jpeg`
- `/media/optimized/cards/EMFD_Kartenrueckseite-v1.1-240x360-23b4fc0986.webp`
- `/media/optimized/cards/EMFD_Kartenrueckseite-v1.1-630x945-b2aafed9d9.webp`
- `/media/optimized/cards/EMFD_Kartenrueckseite-v1.1-896x1344-3788a0bc87.webp`
- `/media/card-back-manifest.json`

Es wurden keine vorhandenen Vorderseiten, Räume, Lieder oder Texte verändert und keine bisherigen Medien gelöscht.

## Tests

### PASS

- ZIP-Quelle v0.6.52 unverändert als Basis verwendet.
- JavaScript-Syntaxprüfung aller lokalen Skripte.
- 6/6 neue CARD-BACK-01-Fachtests.
- Verdeckte Zufallsziehung mit neutraler URL und neutraler zugänglicher Beschriftung.
- Enthüllung wechselt erst nach Nutzeraktion auf O-ID, Titel und Texte.
- Direkte Kartenlinks bleiben direkt sichtbar.
- Teezimmer-Rückweg bleibt erhalten.
- Rückseite ist bei 390×844 px vollständig inklusive Außenrahmen sichtbar.
- `prefers-reduced-motion` und ruhige Ansicht behalten die vorhandene animationslose Umschaltung.
- Gesamtregression: 121 PASS.

### FAIL – aus der unveränderten v0.6.52-Basis übernommen

18 Tests schlagen weiterhin fehl. Ursachen sind fehlende externe Bestandsmedien im home-only-Paket, alte Pfad-/Versionsassertions aus v0.6.48–v0.6.51 sowie die bereits dokumentierte 20/64-MiB-Abweichung im PERF-01-Cachetest. Kein zusätzlicher CARD-BACK-01-Test schlägt fehl.

### SKIPPED / BLOCKED

- 1 Audio-Server-Test übersprungen, weil keine gemeinsame MP3-Datei im Übergabepaket enthalten ist.
- Echte iPhone-Safari- und Android-Chrome-Geräteprüfung nicht verfügbar.
- Vollständige Vorderseiten-, Raum-, Offline- und Hörprobe durch fehlende gemeinsame Projektmedien blockiert.

## Installation

1. Inhalt des Home-Pakets nach `Root/moments/home/` kopieren und vorhandene Dateien ersetzen.
2. Inhalt des Medienpakets nach `Root/moments/media/` kopieren. Das Paket enthält ausschließlich die fünf neuen Dateien.
3. Vorhandene Karten-, Raum- und Audiodateien nicht löschen oder überschreiben.
4. Service Worker/Browsercache nach Upload auf die neue Cachekennung `emfd-images-perf01-v3` prüfen.
5. Anschließend Staging-Abnahme auf iPhone Safari und Android Chrome durchführen.

Keine Live-Veröffentlichung wurde vorgenommen.

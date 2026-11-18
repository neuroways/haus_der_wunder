# EMFD-FE-08 – Musikentscheidung und Karten-Preloading

Version: 0.6.41  
Basis: PWA v0.6.39 mit Atelier-Galerie v0.6.40  
Datum: 03.11.2026

## Umsetzung

### Musikentscheidung

- Vor dem ersten Betreten wird ein modaler Musikentscheid angezeigt.
- „Mit Hintergrundmusik“ ist vorausgewählt.
- „Entscheidung merken“ speichert in `localStorage`; ohne Haken gilt die Auswahl nur für die aktuelle Browsersitzung.
- Die gespeicherte Auswahl wird beim nächsten Besuch wiederverwendet.
- Einstellungen erlauben Ändern, dauerhaftes Merken und vollständiges Zurücksetzen.
- Die Auswahl allein startet keine Wiedergabe. Erst der bewusste Klick auf „Die Tür öffnen“ ruft die vorhandene globale Audio-Session auf.
- Globale Stille und Ruhemodus haben Vorrang.
- Es wird keine zweite `Audio`-Instanzverwaltung erzeugt; FE-08 verwendet ausschließlich `EMFDAudioSession` aus `music-player.js`.

### Karten-Preloading

- `window.CARDS` wird direkt nach `data.js` an `card-preload.js` übergeben.
- Vorgeladen werden 24 Vorderseiten und `EMFD_Kartenrueckseite_v1.0.webp`.
- Maximal vier Downloads laufen parallel.
- Cache: `emfd-card-media-v0.6.41`.
- Bereits vorhandene Einträge werden über `cache.match()` wiederverwendet.
- Ein Service Worker liefert ausschließlich die kanonischen Kartenmedien Cache-First aus.
- Bei einem Versionswechsel werden nur ältere `emfd-card-media-*`-Caches entfernt.
- Bildfehler lösen genau eine gezielte Cache-Löschung und einen Reparaturdownload aus.
- Initialisierung erfolgt per `requestIdleCallback`, ersatzweise `setTimeout(0)`, und blockiert weder Startbild noch Navigation oder Audio.

## Abnahme

| Prüffall | Ergebnis | Hinweis |
| --- | --- | --- |
| Musikabfrage beim ersten Besuch | PASS | Browserprüfung |
| Vorauswahl „Mit Hintergrundmusik“ | PASS | Browserprüfung |
| „Entscheidung merken“ über Reload | PASS | Browserprüfung |
| Entscheidung ändern | PASS | Browserprüfung Einstellungen |
| Entscheidung zurücksetzen | PASS | Danach erneute Abfrage verifiziert |
| Keine Wiedergabe allein durch Auswahl | PASS | Code- und Regressionstest |
| Wiedergabestart nur nach Tür-Klick | PASS | Expliziter Eventpfad |
| Globale Stille und Ruhemodus bleiben vorrangig | PASS | automatisierter Test |
| Keine parallele Musikinstanz | PASS | bestehende einzelne `EMFDAudioSession` |
| 24 Vorderseiten plus Rückseite vorgeladen | PASS | 25 Cache-Einträge im Unit-Test |
| Begrenzung auf vier parallele Downloads | PASS | instrumentierter Unit-Test |
| Cache-Hit ohne erneuten Fetch | PASS | zweiter Lauf: 25 Hits, 0 Fetches |
| Gezielte Reparatur | PASS | Einzeldatei gelöscht und neu geladen |
| Kontrollierter Cache-Versionswechsel | PASS | alter Präfix-Cache entfernt |
| Start und Navigation nicht blockiert | PASS | Idle-Initialisierung und Browserprüfung |
| Kartendrehung, Textfenster, Navigation | PASS | vollständige Regression |
| Android-Chrome-nahe Mobile-Prüfung 390 × 844 | PASS | Chromium-In-App-Browser |
| Echtes iPhone Safari / WebKit | BLOCKED | Keine Safari-/WebKit-Instanz in der Testumgebung verfügbar |
| Tatsächliche hörbare Hintergrundmusik | BLOCKED | `media/audio/THEME.mp3` fehlt im gelieferten Medienpaket |

## Testergebnis

`node --test tests/*.test.cjs`

- PASS: 107
- FAIL: 0
- SKIPPED: 1
- BLOCKED: 2 externe Abnahmepunkte wie oben dokumentiert

Der übersprungene Test ist der bereits bekannte MP3-Range-Test, weil kein gemeinsames MP3-Testsample im Paket liegt.

## Geänderte Dateien

- `service-worker.js`
- `home/card-preload.js`
- `home/music-entry.js`
- `home/music-player.js`
- `home/music-player.css`
- `home/start-gate.js`
- `home/app.js`
- `home/atelier.js`
- `home/index.html`
- `home/manifest.webmanifest`
- `home/package.json`
- `home/tests/fe08-entry-preload.test.cjs`
- `home/tests/app-theme-t03.test.cjs`
- `home/tests/package-layout.test.cjs`

## Fehlendes Medium

Das Manifest enthält T03 mit dem Pfad `../media/audio/THEME.mp3`, das Medienpaket enthält diese Datei jedoch nicht. FE-08 zeigt deshalb weiterhin den bestehenden verständlichen Fehlerstatus, ohne Autoplay-Versuch, zweite Audioinstanz oder Eingriff in die globale Stille.

## Veröffentlichung

Keine Live-Veröffentlichung wurde vorgenommen.

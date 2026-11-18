# P04 Atelier-Galerie – Abnahme v0.6.40

Datum: 03.11.2026

## Umsetzung

- Die bisherige Kartenbrowser-/Tischansicht wurde durch einen zyklischen Wandrundgang ersetzt.
- O01 bis O24 verwenden weiterhin das gemeinsame `window.CARDS`-Register und die vorhandenen Bild- und Textpfade.
- Das aktive Bild wird priorisiert geladen; nur die beiden Nachbarn werden anschließend vorgeladen.
- Rahmen, Licht und Schatten bestehen ausschließlich aus CSS.
- Text- und Bilddialog kehren zur unveränderten aktuellen Kartenposition zurück.
- Das Atelier startet, stoppt oder ersetzt keine Audiowiedergabe.

## Ursache der ursprünglichen Bildverzerrung

Alle gelieferten Karten-PNGs O01–O24 haben 896 × 1536 px und damit das physische Kartenformat 7:12. Die alte mobile Tischansicht kombinierte einen Container mit `height:100%`, `width:auto`, einer erzwungenen Grid-/Flex-Höhe und `object-fit:cover`. Dadurch bestimmte die Resthöhe des Viewports die Kartengeometrie; das Bild wurde in einen abweichenden Container gezwungen und teilweise beschnitten beziehungsweise optisch überlang dargestellt.

Die Galerie verwendet für diese Assets verbindlich 896 × 1536, `aspect-ratio:7/12` und `object-fit:contain`. Das Bild kann sich nur innerhalb von `max-width` und `max-height` verkleinern; es wird weder gestreckt noch beschnitten.

## Automatisierte Prüfung

Ausgeführt mit `node --test tests/*.test.cjs`.

- PASS: 103
- FAIL: 0
- SKIPPED: 1
- BLOCKED: 0

Der übersprungene Test betrifft ausschließlich ein nicht mitgeliefertes gemeinsames MP3-Testsample. Die Audio-Unit-Tests und die Prüfung, dass das Atelier Audio nicht verändert, sind bestanden.

## Funktionsabnahme

| Fall | Ergebnis | Nachweis |
| --- | --- | --- |
| 24 Karten und stabile Reihenfolge O01–O24 | PASS | Registertest |
| Reale Kartenproportion 896 × 1536 / 7:12 | PASS | Medienprüfung und Galerietest |
| Kein Strecken oder unbeabsichtigter Beschnitt | PASS | `object-fit:contain`, visuelle Prüfung |
| Vorwärts- und Rückwärtsnavigation | PASS | automatisiert und im Browser |
| O24 → O01 | PASS | Browserprüfung |
| O01 → O24 | PASS | Browserprüfung |
| Begleittext öffnet/schließt und bleibt derselben ID zugeordnet | PASS | automatisiert und im Browser |
| Vergrößerte Bildansicht und Rückkehr | PASS | automatisiert und im Browser |
| Aktuelle Kartenposition bleibt erhalten | PASS | Session-State-Test |
| Kein Audiostart/-stopp | PASS | Quell- und Regressionstest |
| Safe Areas und dynamische Viewport-Höhe | PASS | CSS-Test und Browserprüfung |
| Reduced Motion | PASS | CSS-/JS-Test |
| Tastatursteuerung | PASS | Pfeiltasten und native Dialogsteuerung implementiert |
| Andere Räume und Navigation | PASS | vollständige Regressionstests |

## Visuelle Prüfung

- PASS: 390 × 844 px, iPhone-Hochformat
- PASS: 844 × 390 px, kleines Smartphone-Querformat
- PASS: 1280 × 800 px, Desktop
- PASS: Begleittextdialog auf 390 × 844 px
- PASS: Bildvergrößerung auf 390 × 844 px

Bei der ersten Querformatprüfung wurde eine stehen gebliebene Eintritts-Richtungsklasse entdeckt. Der Zustandsabbau und das durch eine spätere globale Media Query verursachte untere Padding wurden korrigiert; die erneute visuelle Prüfung war PASS.

## Geänderte Dateien

- `home/atelier.js` – Galerie, zyklische Navigation, Dialoge, Preloading, Tastatur und Positionsspeicher
- `home/atelier.css` – Wandbühne, Rahmen, responsive Layouts, Safe Areas und Animationen
- `home/index.html` – Versionierung und Cache-Busting v0.6.40
- `home/manifest.webmanifest` – Versionsstand v0.6.40
- `home/package.json` – Versionsstand v0.6.40
- `home/tests/atelier-gallery-v0.6.40.test.cjs` – neue Galerie-Abnahmetests
- `home/tests/atelier-p04.test.cjs` – bestehende P04-Tests an die Galerie-UX angepasst
- `home/tests/atelier-no-scroll.test.cjs` – Viewport-Assertions aktualisiert
- `home/tests/navigation-regression.test.cjs` – Positionsrückkehr aktualisiert
- `home/tests/package-layout.test.cjs` – Versionsassertion aktualisiert
- `home/qa/P04-ATELIER-GALERIE-v0.6.40.md` – dieser Bericht

## Medien- und Backend-Status

- Fehlende Kartenmedien: keine.
- Fehlende P04-Hintergrundmedien: keine.
- Zusätzliches leeres Wandmotiv: nicht erforderlich; `P04-atelier.webp` ist geeignet.
- Fehlende Kartendaten: keine. ID, Titel, Kategorie, Bildpfad, Begleittext und Reihenfolge sind im gemeinsamen Kartenregister vorhanden.
- Backend-Änderungsbedarf: keiner.
- Nicht im Medienpaket vorhanden: das bereits bekannte gemeinsame MP3-Testsample; für die Atelier-Galerie nicht erforderlich.

## Veröffentlichung

Keine Veröffentlichung oder Änderung einer Live-Seite wurde vorgenommen.

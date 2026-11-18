# EMFD-BIB-FE-01 – Bibliothek 2.0

Basis: vollständiger home/-Build v0.6.53 (bereitgestellt am 04.11.2026). Additive Erweiterung, keine Medienänderungen.

## Frontend
- P02 bleibt die vorhandene Raumseite und zeigt unverändert das Raumfoto. Ein CTA führt nach unten zum neuen Bücherregal.
- `library/catalog.js` enthält fünf Buchmetadaten und Kapitelstatus, aber keine kopierten/ersetzten Originaltexte.
- `library/library.js` zeigt das Bücherregal und rein redaktionelle Kapitelübersichten für nicht freigegebene Titel.
- `library/library-entry.js` verbindet den bestehenden Geschichten-Reader mit zwei vollständig lesbaren Büchern.
- `origin-story.js` behält alle 19 Originalabschnitte. Der vorhandene Einstieg „Hinter dem Haus“ öffnet weiterhin alle 19. Zusätzlich öffnet `EMFDOriginStory.open` selektiv „Weltenweberin“ (6) oder „Musik“ (13).
- `#karten` und `#musik/geschichten` bleiben die vorhandenen Routen; keine doppelte Karten-/Musikimplementierung.
- Keine automatische Musik, keine Änderungen an Musiksteuerung oder Karteninteraktion.
- Mobile Leserichtung: horizontales Wischen im vorhandenen Reader ergänzt die sichtbaren Tasten, vertikales Scrollen bleibt möglich.

## Grenzen
- Hausgeschichten und Achtsamkeitsbuch zeigen Kapitelübersichten, **keine als fertig ausgegebenen Texte**.
- Der aktuelle Raum verwendet bereits ein optimiertes P02-Bild aus dem bestehenden Medienbestand; es wurden keine neuen Bilder erstellt oder dupliziert.
- Die Versionsnummer der Ausgangsanwendung bleibt 0.6.53, um die vorhandene Paket-/Regressionstest-Baseline zu erhalten. Cache-Busting nur für modifizierte Ressourcen.
- `media/` ist nicht enthalten; auf dem Zielserver muss die vorhandene Medienablage unverändert liegen.

## Prüfung am 04.11.2026
- JavaScript-Syntax: `app.js`, `origin-story.js`, `library/catalog.js`, `library/library.js`, `library/library-entry.js` PASS.
- Fünf neue bibliotheksspezifische Node-Tests PASS.
- Die komplette bestehende Testsuite: 145 Tests, 126 PASS, 18 FAIL, 1 SKIP. **Dieselben 18 Tests waren bereits im unveränderten gelieferten Medien-freien Ausgangs-Build fehlgeschlagen**; keine zusätzlichen Regressionen festgestellt. Die Fehlschläge beziehen sich überwiegend auf nicht mitgelieferte `media/`-Pfade, ältere Pfad-/Paketannahmen oder die PERF01-API, nicht auf das neue Bücherregal.
- Isolierter Chromium-Browserlauf mit Original-Reader und Bibliotheksmodul bei 390 × 844 und 1280 × 900: Buchauswahl, sechs Weltenweberin-Kapitel, 13 Musikkapitel, Kapitelwechsel, Schließen und Entwurfsübersicht PASS; keine JS-Ausnahmen.
- In-Memory-Route mit realem App-HTML, app.js und P02: Regal zeigt fünf Bücher, Rückweg über `#raeume` nach `#ort/P02` bleibt funktional, `#musik/geschichten`-Link bleibt erhalten, keine JS-Ausnahmen.
- Wegen Browser-Sicherheitsbeschränkungen konnte kein vollständiger HTTP-/Live-Medientest der kompletten Anwendung erfolgen. iOS Safari, VoiceOver und Bereitstellung auf STRATO bleiben abzunehmen.

# EMFD BOOK-02 + NOTE-01 · Integrationsprotokoll v0.6.56

Basis: die bereitgestellte v0.6.55 home-Komplettfassung. Stand 04.11.2026. Nicht veröffentlicht.

## Architekturentscheidung vor Implementierung

- **Kartenansicht** enthält unverändert drei Aktionen Impuls, Vertiefung, Frage.
- **Buch** ist ein separater Lesedialog, hält nur Karten-ID und aktuell geöffnete Seite; links/rechts wischen, Reiter, Pfeile und Pfeiltasten. Keine automatische Änderung des Karten- oder Musikzustands beim Blättern.
- **Gedankenblatt** ist eine davon unabhängige Komponente mit flüchtigem Textzustand. Von der Frage öffnet `card` mit Karten-ID, Kartentitel, Gruppe und Originalfrage; P08 öffnet `free` ohne Kartenbezug.
- **Export** ist clientseitig: Canvas-basierte Seiten, PNG (lange Texte als langes PNG oder bei Browsergrößenlimits mehrere PNGs), JPEG-Bildseiten als lokal zusammengesetztes mehrseitiges PDF; letzteres hat eine anklickbare HTTPS-Verknüpfung auf jeder Seite. QR wird lokal aus der öffentlichen URL generiert. Keine Datenbank, kein Netzwerk für Texte.
- **Rückweg**: Karte `#karte/Oxx/frage` für einen direkten Einstieg in das Buch zur Frage; P08 `#teezimmer`. Keine Texte im Link.

## Neue Dateien

- `home/book-v2.css`
- `home/thought-paper.js`
- `home/thought-paper.css`
- `home/thought-qr.js` (MIT-lizenzierter QR-Code-Algorithmus von Kazuhiko Arase, aus qrcode-terminal adaptiert)
- `home/tests/thought-book-v0.6.56.test.cjs`

## Modifizierte Dateien

- `home/app.js`: dreiseitiges Buch mit Gesten, Pager und Gedankenblatt-Aktion; direkte Frage-Routen.
- `home/teezimmer.js`, `home/teezimmer.css`: papierähnlicher, zugänglicher Einstieg.
- `home/index.html`: eingebundene Module und Cache-Versionen.
- `home/package.json`, `home/manifest.webmanifest`, `home/deployment-layout.json`, `home/file-hashes.json`.
- Versionserwartungen im bestehenden `tests/card-back-01.test.cjs` aktualisiert.

## Datenschutz

Text und Titel stehen ausschließlich in einer flüchtigen JavaScript-Variable, werden nicht in LocalStorage/IndexedDB und nicht an Server geschrieben. Im erzeugten Dateiexport stehen sie bewusst als Nutzerinhalt; das spätere Speichern und Teilen unterliegt dem Gerät. Browserabbruch verliert die unexportierte Notiz. Verwerfen löscht den aktuellen Objektzustand.

## Prüfstand

- 19/19 gezielte automatisierte Tests bestanden: Buchstruktur, QR-Matrix, 24 Kartenkontexte, freie P08-Eingabe, Ressourcen, Rückseiten- und P08-Bestandstests.
- Gesamtsuite der alten home-only-Basis enthält 22 weitere fehlgeschlagene Legacy-/Medienabhängigkeitsprüfungen und einen übersprungenen Test. Diese wurden nicht als neuer Funktionsnachweis gewertet.
- Browser-End-to-End-Test war durch Umgebungssperre für Browser-Netzwerkzugriffe nicht ausführbar.
- iOS-Safari, Android-Chrome, PDF-QR-Scanning und mobile System-Download-Dialoge müssen vor Veröffentlichung praktisch getestet werden. PNG-Mehrfachdownload für extrem lange Notizen unterliegt Browserfreigaben.
- Die PDF-Textseiten werden grafisch ausgegeben (sichtbar, aber nicht volltextdurchsuchbar). Der QR-/Hyperlink ist anklickbar. Für eine spätere barrierefreie PDF-Ausgabe wäre eine Tagged-PDF-Engine nötig.
- Kein Upload, keine Veröffentlichung.

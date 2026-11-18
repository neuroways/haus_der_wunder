# EMFD-NOTE-03 · Korrektur mehrseitiger Gedankenblatt-Exporte

**Projekt:** Ein Moment für dich · Das Haus der kleinen Wunder  
**Stand:** 04.11.2026 · **Entwicklungsfassung:** v0.6.59  
**Ausgangsbasis:** `EMFD-v0.6.58-home-KOMPLETT-TEEZIMMER-TEA01.zip`  
**QA-Quelle:** `EMFD_NOTE_01_v0.6.57_QA_Uebergabepaket(1).zip`  
**Status:** Lokal korrigiert; keine Live-Veröffentlichung; keine vollständige iOS-/Android-Abnahme.

## Befund und Korrektur

Der vom QA-Bericht für v0.6.57 belegte P0-Fehler lag in `home/thought-paper.js`, `documentPages()`: Die vorherige Seitenberechnung nahm auf Folgeseiten weniger Kopfhöhe an, als die Zeichenfunktion tatsächlich verbrauchte. Bei langen Notizen erreichte Text deshalb den über dem QR-Code reservierten Footer.

Die Änderung verwendet **eine einzige Liste typisierter Textzeilen** für Titel, Frage, Zwischenräume und Notiz. Paginierung und tatsächliches Zeichnen verwenden nun dieselben Startpositionen für die erste Seite und Fortsetzungsseiten. Die letzte zulässige Text-Baseline liegt spätestens bei `qY - 45` vor der bei `qY - 22` beginnenden QR-Abtrennung. Lange freie Titel, mehrzeilige Kartenfragen, Absätze und lange Einzelwörter werden über weitere Seiten geführt. Es wird keine Notiz gekürzt und keine neue Medienproduktion benötigt.

Zusätzlich fällt die native Dateiweitergabe bei unerwarteten Share-Fehlern auf den Browser-Download zurück; ein bewusst abgebrochenes Teilen (`AbortError`) bleibt ein Abbruch. Ein Downloadversuch ist keine Speicherbestätigung. Die bestehende HTTPS-Anforderung für echte Rückkehr-QR-Codes bleibt bestehen.

## Verifizierung

| Prüfung | Ergebnis | Grenze |
| --- | --- | --- |
| Node-Regression mit produktiver `documentPages()`-Funktion und Canvas-Testkontext | **5/5 PASS** | Prüft 1, 2, 5, 10 Seiten und sehr lange Titel/Fragen, alle Zeichen, Baseline-Limit |
| Chromium: echter PDF-Download | **PASS** | Dateien mit **1, 2, 5, 10 Seiten** erzeugt und mit PyMuPDF geöffnet |
| Chromium: sehr langer Titel | **PASS** | Vierseitiger Export, keine Footerüberlagerung |
| PDF-QR und Rückkehrlink | **PASS** | QR von ersten/letzten geprüften Seiten per OpenCV gelesen, HTTPS-URI-Links auf allen Seiten geprüft |
| PNG im Kartenmodus | **PASS** | 794 × 1123 PNG, QR liest `https://example.org/home/#karte/O11/frage` |
| Simulierter Fehler im Browser-Share | **PASS** | Fehler wird als Downloadversuch behandelt; Text bleibt im Editor |
| Bestehende TEA-01/Buch-Regressionen | **PASS** | Keine Änderung an Teezimmer-Buttons, Rückkehr, Audio und vorhandenen Medien |
| Gesamtsuite | **141 PASS, 23 FAIL, 1 SKIP, 165 gesamt** | 23 bereits vor v0.6.59 vorhandene Fehler, kein Gesamt-PASS |

Das Chromium-Testdokument wurde lokal ohne vollständigen App-Router ausgeführt. Für das Exportieren wurde eine **ausschließlich im Testbrowser ersetzte Basisadresse** `https://example.org/home/` genutzt. Die produktive `url()`-Funktion und die Anwendungsdateien behalten ihre HTTPS-Prüfung. Browser-Downloads sind keine realen iPhone- oder Android-Systemdownloads.

Die Quellen und der QA-Nachweis des Ursprungsfehlers liegen im gelieferten Archiv `EMFD_NOTE_01_v0.6.57_QA_Uebergabepaket(1).zip`. Das neue QA-Archiv enthält erzeugte PDFs, ein PNG, Ausschnitte und die Node-/Browser-Testskripte.

## Geänderte Anwendungsdateien

- `home/thought-paper.js` – Pagination/Zeichnung synchronisiert; Share-Fallback.
- `home/tests/thought-paper-export-v0.6.59.test.cjs` – neue ausführbare Regressionstests.
- `home/index.html` – Versionsangabe und Cache-Busting für `thought-paper.js?v=0.6.59`.
- `home/package.json`, `home/deployment-layout.json`, `home/manifest.webmanifest` – Version v0.6.59.
- `home/tests/teezimmer-tea-01-v0.6.58.test.cjs`, `home/tests/thought-book-v0.6.56.test.cjs` – Versionsannahmen auf neue Buildfassung angehoben, Fachprüfungen unverändert.
- `home/README.md` – Änderungsübersicht.
- `home/qa/EMFD-NOTE-03-v0.6.59.md` – dieser Prüfbericht.
- `home/file-hashes.json` – vollständige SHA-256-Dateiliste aktualisiert.

**Nicht geändert:** `home/teezimmer.js`, `home/teezimmer.css`, Karten-/Haus-/Musikfunktionen, Bildmedien oder Audiobestand. `home/` ist vollständig verpackt, `media/` hat keine neuen Dateien.

## Offene Abnahme / fehlende Voraussetzungen

1. Auf echtem iPhone mit Safari: Hoch-/Querformat, Bildschirmtastatur, Abbruch, PNG nach Fotos, PDF nach Dateien und Dateifreigabe.
2. Auf Android Chrome: Dateien, natives Teilen und Rückkehr durch einen real gescannten QR-Code.
3. HTTPS-Adresse des tatsächlichen Zielsystems: QR-Links müssen unter der produktiven Domain funktionieren; lokales HTTP kann weiterhin nicht exportieren.
4. Vollständige Medieninstallation: Bilder, Audio und Raumdateien auf dem Zielserver; die vorhandenen gemeinsamen Medien wurden nicht ersetzt.
5. Weiterer separater UX-Auftrag: sichtbares Papier direkt auf dem illustrierten Teetisch. Der P08-Button aus v0.6.58 bleibt erreichbar.
6. Optionaler gesonderter Exportausbau: Kartenbild im mitgenommenen Dokument und selektierbarer/getaggter PDF-Text. Diese Qualitätsmerkmale waren im gelieferten Stand noch nicht umgesetzt.
7. Ältere 23 Gesamttestfehler müssen vor allgemeiner Veröffentlichungsfreigabe einzeln eingeordnet und ggf. beseitigt werden.

**Freigabe:** P0-Seitenumbruch in lokaler isolierter Browserprüfung behoben. Eine komplette PWA- oder Veröffentlichungsfreigabe ist **nicht** erfolgt.

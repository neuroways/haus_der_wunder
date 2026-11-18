# EMFD-BIB-FE-01 – Testprotokoll v0.6.60

Stand: 04.11.2026  
Prüfumgebung: lokaler statischer Server, Node-Testläufer und headless Google Chrome  
Veröffentlichung: nicht durchgeführt

## Bibliotheksabnahme

| Prüfung | Status | Ergebnis |
|---|---|---|
| Direkte Route `#ort/P02` | PASS | P02 und Regal werden geladen. |
| Regalbestand | PASS | Exakt fünf Bücher, kein doppeltes Mounting. |
| Weltenweberin | PASS | Sechs Originalkapitel. |
| Klangwelten | PASS | Dreizehn Originalkapitel. |
| Alter Einstieg „Hinter dem Haus“ | PASS | Neunzehn Originalkapitel. |
| Erneuter P02-Besuch | PASS | Regal wird erneut genau einmal eingebunden. |
| Reader-Schließen und Fokus | PASS | Schließen, Dialogkoordination und Fokus-Rückkehr sind implementiert. |
| Autoplay | PASS | Bibliotheksmodule erzeugen keine Wiedergabe. |
| Fehlendes Bibliotheksmodul | PASS | Verständlicher Status statt Anwendungsabbruch. |

## Responsive Browserprüfung

PASS für 390×844, 844×390, 768×1024 und 1440×900. In allen vier Ansichten: fünf Bücher, 6/13 Kapitel und keine JavaScript-Seitenfehler. Der zunächst sichtbare Umbruchfehler im Bibliothekskopf wurde durch eine gekapselte Überschreibung der globalen `header`-Regel behoben. Die Nachweisscreenshots liegen in `qa/library-*-v0.6.60.png`.

## Geschützte Regressionen

| Bereich | Status | Nachweis |
|---|---|---|
| Atelier-Gesten | PASS | Einzeltipp, Doppeltipp und horizontales Wischen. |
| Audiohoheit | PASS | Kein Autoplay, eine Sitzung, Stop/Pause/Wechsel geprüft. |
| Kartenrückseite | PASS mit Altfehler | Funktionsprüfungen bestanden; historische Versionsannahme bleibt Teil der Ausgangsfehler. |
| Kartenbuch | PASS | Drei Seiten, Pager, Gesten und Gedankenblattzugang. |
| Gedankenblatt NOTE-03 | PASS | 1-, 2-, 5-, 10-Seiten- und Langtextfälle ohne Inhaltsverlust. |
| Teezimmer TEA-01 | PASS | Vier Aktionen, Scrollbereich, Fallback und Audio-Trennung. |
| Geschichten-Reader | PASS | 19 Abschnitte, TOC, Navigation, Responsive-Regeln und Audio-Pause. |
| Navigation | PASS mit Altfehler | Fünf Navigationstests bestanden; eine ältere Beschriftungserwartung bleibt Teil der Ausgangsfehler. |

## Vollständige Testsuite

- 175 Tests insgesamt
- 151 PASS
- 23 FAIL
- 1 SKIP

Ausgangsbasis v0.6.59 laut Übergabe: 165 insgesamt, 141 PASS, 23 FAIL, 1 SKIP. Die Integration ergänzt zehn bestandene Bibliotheksprüfungen. Anzahl und Gruppe der 23 Fehler bleiben unverändert; es wurde kein neuer Fehler eingeführt.

Die bekannten Fehler betreffen überwiegend nicht mitgelieferte externe Medien, historische Versions-/Pfaderwartungen, bereits zuvor abweichende Navigationsbeschriftungen sowie lokale Serverprüfungen der ausgelagerten Medien. Sie sind keine durch BIB-FE-01 neu entstandenen Fehler.

## Offene Prüfungen

| Prüfung | Status | Begründung |
|---|---|---|
| Echtes iPhone Safari | NICHT GETESTET | Kein physisches Gerät in der lokalen Prüfumgebung. |
| Echtes Android Chrome | NICHT GETESTET | Kein physisches Gerät in der lokalen Prüfumgebung. |
| Textvergrößerung 200 % auf Geräten | NICHT GETESTET | Nur responsive Desktop-Browserprüfung erfolgt. |
| Reale HTTPS-QR-Rückkehrziele | NICHT GETESTET | Keine Produktivdomain verändert. |
| Vollständige externe Medieninstallation | BLOCKIERT | `media/` ist absichtlich nicht Bestandteil dieses App-ZIPs. |
| Veröffentlichung | NICHT GETESTET | Nicht freigegeben und nicht durchgeführt. |

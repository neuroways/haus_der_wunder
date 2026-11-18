# EMFD-START-02 · Testergebnisse v0.6.61

Stand: 05.11.2026

## START-02-Abnahme

| Prüfung | Status | Ergebnis |
|---|---|---|
| Fünf Ablaufzustände und getrennte Speicherstände | PASS | automatisiert geprüft |
| Erstbesuch bis Flur | PASS | lokaler Chromium-Ablauf 390 × 844 |
| Wiederkehrender Besuch ohne automatische Wiederholung | PASS | Browserprüfung |
| „Über dieses Geschenk“ öffnet Brief erneut | PASS | Browserprüfung |
| Einführung überspringen und erneut öffnen | PASS | Browserprüfung |
| Freiwillige Installationshilfe | PASS | Browserlogik geprüft |
| Kein Autoplay / keine zweite Audioinstanz | PASS | Quell- und Browserprüfung |
| Lichtzustand bleibt erhalten | PASS | inklusive fehlendem Bild-Fallback |
| Fehlende A01–A06 blockieren den Zugang nicht | PASS | Browser-Fallback geprüft |
| Smartphone-Hochformat | PASS | 390 × 844, Prüfbilder vorhanden |
| Smartphone-Querformat | PASS | 844 × 390, ohne horizontalen Überlauf |
| Reduzierte Bewegung | PASS | CSS und Ablaufregel geprüft |
| Tastatur-/Dialoggrundlagen | PASS | native Dialoge, Fokusziele und 44-px-Bedienflächen |
| Echtes iPhone Safari / Android Chrome | NICHT GETESTET | Geräte stehen lokal nicht zur Verfügung |
| Echte PWA-Installation und produktives HTTPS | NICHT GETESTET | erst auf Zielserver möglich |

Die gezielte automatisierte Prüfung von START-02, Bibliothek, Teezimmer und Bildvorladung umfasst 18 Tests: **18 PASS, 0 FAIL**. Die lokale Browserprüfung meldet für Erstbesuch, Wiederkehr, Briefwiederholung, Einführung, Installationshilfe und Licht jeweils **PASS** und keine JavaScript-Fehler.

## Vollständige vorhandene Testsuite

Gesamtergebnis: **183 Tests · 165 PASS · 17 FAIL · 1 SKIP**.

Zum Vergleich meldete die unveränderte Ausgangsbasis v0.6.60: **175 Tests · 151 PASS · 23 FAIL · 1 SKIP**. Alle acht neuen START-02-Tests bestehen; sechs bereits vorhandene Fehler wurden zusätzlich beseitigt. Es ist kein neuer START-02-Fehler verblieben.

Die 17 verbleibenden Bestandsfehler gliedern sich in:

- 6 Prüfungen, die ein separat installiertes `media/` voraussetzen, das im beauftragten vollständigen `home/`-Paket nicht enthalten ist;
- 7 historische Pfadtests, die noch unoptimierte Medienpfade oder den abgelösten Startseiten-Link erwarten, obwohl v0.6.60 bereits die optimierten Medienprofile und START-02 nun eine zustandsbasierte Tür verwendet;
- 4 historische Kartenbuchtests, die noch die ältere Sechs-Bereiche-Ansicht erwarten, obwohl die geschützte aktuelle Kartenansicht drei Seiten besitzt.

Diese Punkte wurden nicht durch Rückbau der neueren Funktionen „grün“ gemacht. Sie sind als Bestands- beziehungsweise Installationsgrenzen dokumentiert.

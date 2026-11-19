# EMFD-BOOK-01a · Register, Medienstatus, Routen und Aliase
Version 1.0 · 19.11.2026 · Teil von EMFD-DEV-BOOK-01 · erstellt von Claude Code auf Grundlage von D-13 und der technischen Vorplanung
Status: ⚪ OFFEN – Entwicklungsauftrag; Umsetzung nach Klärung K-18 (Ort/Rolle) und Freigabe durch die Nutzerin

## 1. Ziel und fachliche Anforderungen
Die App liest Räume, Szenen, Musikgeräte, Objekte und Medien **aus den gemeinsamen Registern** statt aus festem Code. Medien werden über **Medien-IDs** aufgelöst; fehlende Medien erscheinen als programmatisch gezeichnete Platzhalter mit Medien-ID und Seitenverhältnis. Neue Adressen `#raum/<RAUM>/<ANSICHT>` und `#geraet/<GERÄT>`; alle bisherigen Adressen bleiben als Aliase gültig (W5: `#flur` → H00). Medienstatus nach D-13/W7 konsolidieren.

## 2. Ausgangsstand und Versionsbasis
- App-Entwicklungsstand **v0.6.68** (= Live v0.6.66 + EMFD-NAV-01 + EMFD-PLAYER-01), Repository `neuroways/haus_der_wunder`, Branch `claude/modest-galileo-ifo41b`, Commit `b9073e6`. Live bleibt **v0.6.66** bis zur ausdrücklichen Freigabe. Ort und Rolle der Weiterentwicklung: offen (K-18, offen.md #11) – vor Beginn klären.
- Register in diesem Repository: `manifests/*.json` (Index `manifests/index.json`). Entscheidungen D-10, D-13.
- Technische Vorplanung: `EMFD-DEV-BOOK-01-vorplanung.md`, Gesamtauftrag `EMFD-DEV-BOOK-01.md`.

## 3. Umfang und Abgrenzung
- Registerzugriff (lesend) für `rooms.json`, `scenes.json`, `music-devices.json`, `objects.json`, `media.json`, `navigation.json`, `functions.json`; Auslieferung als App-Daten (Kopie beim Build oder gemeinsamer Ablageort – im Bericht festlegen).
- Ablösung der festen Daten: `ROOMS`/`EMFD_ROOM_PROFILES` (app.js), Raumnamen in `shared/navigation.js`, Geräteregister `shared/devices.js` → aus `music-devices.json` (Feld `anzeigename` ergänzen, K-19).
- Medien-ID-Auflösung (Medien-ID → Datei oder Platzhalter) in einem zentralen Dienst; Szenen kennen keine Dateinamen.
- Routen aus Register; Aliasliste (`#flur`, `#haus`, `#raeume`, `#ort/P0x`, `#atelier`, `#teezimmer`, `#musik…`, `#karte…`, Geräteadressen aus PLAYER-01).
- Medienstatus-Konsolidierung (K-16): Vorschlag für Felder in `media.json` und Abbildung auf `availability`/`release` von EMFD-MEDIA-CORE; keine zweite Statusdatei.
- Abgrenzung: keine sichtbare Änderung der Räume; keine Szenenkomponente (01b).

## 4. Betroffene Module und Register
- `manifests/*.json` (lesend; Änderungen nur an eigenen Feldern, AGENTS §3.4), `manifests/index.json#statusSkala`.
- App: `app.js`, `shared/navigation.js`, `shared/devices.js`, `feature-registry.js`, `image-profiles.js`/`media-bridge.js`, neue Datei für Registerzugriff und Medienauflösung.

## 5. Abhängigkeiten
- Vorher abgeschlossen: PLAYER-01. Entscheidungen D-10, D-13.

## 6. Technische Anforderungen
- Register werden beim Start geladen; App bleibt ohne Register mit bisherigem Stand lauffähig (Rückfall).
- Platzhalter: SVG/CSS im Code, beschriftet mit Medien-ID und Format, keine Bilddateien; vorhandene SVG-Platzhalter in `assets/placeholders/` dürfen genutzt werden.
- Aliase leiten ohne zusätzlichen Verlaufseintrag um (`EMFDNavigation.replace`).
- NAV-01-Verhalten bleibt erhalten (Rückwege, Ersatzziele).
- Keine Medien erzeugen; Platzhalter programmatisch; finale Medien ohne Codeänderung einsetzbar.
- Kein Autoplay; eine Audio-Engine; Musik läuft bei Raumwechsel weiter (W1).

## 7. Abnahmekriterien
- Alle bisherigen Adressen öffnen dieselbe Ansicht wie vorher (QR-Codes, Rückkehrlinks).
- `#flur` und `#raum/H00/C01` zeigen dieselbe Ansicht.
- Geräte, Räume und Namen stammen aus den Registern; keine festen Listen mehr im App-Code (Test).
- Austausch Platzhalter → Bild nur durch Registereintrag möglich (Test mit einem Szenenbild).
- Medienstatus-Vorschlag in `docs/decisions/konflikte.md` K-16 dokumentiert.
- `npm test` grün; neue Funktionen mit Verhaltenstests.

## 8. Testfälle
- Alias-Matrix: jede bisherige Route → erwartete Ansicht.
- Registerfehler (fehlende Datei, ungültige ID) → Rückfall, keine Fehlerseite.
- Medien-ID ohne Datei → Platzhalter mit ID und Seitenverhältnis.
- Regression: `npm test` grün, NAV-01- und PLAYER-01-Tests unverändert grün.

## 9. Erwartete Ergebnisse
- Umgesetzter Code, Tests, aktualisierte Register (nur eigene Felder), Rückmeldung, Liste fehlender Medien und offener Punkte.

## 10. Git-Übergabe
- Eigener Branch je Werkzeug (`claude/…` bzw. `codex/…`), Commits `<bereich>(<auftrag>): <was>`, Pull Request gegen `develop` (D-12); kein Merge durch Werkzeuge, kein Deploy.
- Rückmeldung als `EMFD-Rückmeldung · <ID>` (Format siehe `EMFD-PLAYER-01-rueckmeldung.md`) unter `docs/development/auftraege/<ID>-rueckmeldung.md`, dazu `TASKS.json`, `STATUS.json`, `CHANGELOG.md` (*Unveröffentlicht*) und betroffene Register aktualisieren.
- Nur Geprüftes als geprüft melden; nicht Getestetes ausdrücklich benennen.

# Arbeitsweise in diesem Repository

Planung und Gestaltung passieren in ChatGPT, die Umsetzung hier. ChatGPT liefert **Entwicklungsaufträge** (`EMFD-<BEREICH>-<NN>`), Claude Code setzt sie um und liefert eine **EMFD-Rückmeldung**. Der Prompt, mit dem ChatGPT arbeitet, liegt in `docs/CHATGPT-PLANUNG-PROMPT.md`. Ändert sich hier etwas, das ChatGPT wissen muss (Entscheidungen, Struktur, offene Punkte), wird der Prompt mit angepasst.

## Gemeinsames Projekt-Repository
Entscheidungen (D-xx), Aufträge, Register, `TASKS.json`, `STATUS.json` und `CHANGELOG.md` werden im gemeinsamen Repository `neuroways/haus-der-wunder` nach dessen `AGENTS.md` geführt (Entscheidungen W1–W7 dort als D-13, Aufträge unter `docs/development/auftraege/`). Die 2D-App wird hier weiterentwickelt, und zwar von Claude (dort D-14, 19.11.2026). Musik liegt nur auf STRATO (`/wunderhaus/media/audio/`) und nie im Repository.

## Orientierung
`docs/CODEKARTE.md` beschreibt Aufbau, Routen, Dienste, Speicher-Schlüssel, Ereignisse, Medien, Tests und typische Ansatzstellen der App. **Vor jedem Auftrag zuerst dort nachsehen** und dann gezielt die genannten Dateien lesen, statt den Code neu zu durchsuchen.

## Einen Auftrag bearbeiten
1. Auftrag unverändert unter `auftraege/EMFD-<BEREICH>-<NN>.md` ablegen.
2. Vor der Umsetzung den Code lesen. Offene Fragen des Auftrags beantworten; widerspricht der Auftrag dem Code oder einer Entscheidung unten, zuerst nachfragen.
3. Umsetzen in `home/` (2D-PWA). Bestehende Funktionen nicht stillschweigend entfernen. Gemeinsame Dienste (`shared/`, `feature-registry.js`, Audio, Kartenregister, Gedankenblatt) nutzen statt duplizieren.
4. Testen: `cd home && npm test` muss grün bleiben; neues Verhalten bekommt Tests, möglichst als Verhaltenstest statt Textsuche im Code. Bei Medienänderungen zusätzlich `python3 tools/media_check.py` und `bash tests/run_tests.sh`.
5. Cache-Busting: geänderte JS/CSS-Dateien bekommen in `home/index.html` einen neuen `?v=`-Parameter. Eine neue App-Version wird an allen Stellen gleich gesetzt: `package.json`, `manifest.webmanifest`, `deployment-layout.json`, `application-version` und `manifest.webmanifest?v=` in `index.html`, `app.js?v=`.
6. `docs/CODEKARTE.md` aktualisieren, wenn sich Routen, Dienste, Raumfunktionen, Speicher-Schlüssel, Ereignisse, Ladereihenfolge oder Medienwege geändert haben.
7. Commit mit der Auftrags-ID im Titel, push auf den Arbeitsbranch.
8. EMFD-Rückmeldung ausgeben (Format unten) und unter `auftraege/EMFD-<BEREICH>-<NN>-rueckmeldung.md` ablegen.

## Feste Regeln
- Kein Autoplay; Musik nur nach bewusster Auswahl. Keine dauerhafte Speicherung von Notizen.
- Keine Pflichtwege, Freischaltungen, Punkte, Fortschrittsanzeigen.
- Entscheidungen stehen in `docs/ENTSCHEIDUNGEN.md` (neuere ersetzen ältere). Kurz: Musik läuft bei Raum- und Blickwechsel weiter (W1); bisheriges Teezimmer genau zwei Aktionen, Gedankenblatt erst im Bilderbuch-Teezimmer über die Karte (W2); Begleiterkarte nur als Karten-ID lokal speichern (W6).
- Medien nur nach `media/MEDIEN-KONVENTION.md`; keine Medien erfinden oder generieren, keine neuen Kopien in `home/`.
- Texte aus Aufträgen wörtlich übernehmen.
- Nichts auf dem Live-Server veröffentlichen ohne ausdrückliche Freigabe.

## Format der EMFD-Rückmeldung
```
# EMFD-Rückmeldung · <Auftrags-ID> · <Kurztitel>
Datum: <…> · Ergebnis: umgesetzt | teilweise | blockiert · Commit: <hash> auf <branch>

## Was sich für die Person ändert
## Abweichungen vom Auftrag (mit Grund)
## Antworten auf die offenen Fragen
## Tests
<npm test: X bestanden, Y fehlgeschlagen, Z übersprungen; neue Tests>
## Neue offene Punkte / Fragen an die Planung
```

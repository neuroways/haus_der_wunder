# EMFD-Rückmeldung · EMFD-BOOK-01a · Register, Medienstatus, Routen und Aliase
Datum: 19.11.2026 · Ergebnis: umgesetzt · Commit: 3792448 auf claude/modest-galileo-ifo41b (Repository neuroways/haus_der_wunder); Register: d023595 auf claude/book-01a-register (neuroways/haus-der-wunder)
Ausgangsversion: v0.6.69 (live) · Zielversion: v0.6.70 · Live unverändert v0.6.69

## Was sich für die Person ändert
- **Sichtbar nichts** (wie im Auftrag vorgesehen): Flur, Raumübersicht, Räume, Atelier, Teezimmer, Musikzimmer und Gerätestationen sehen aus und verhalten sich wie in v0.6.69.
- **Neue Adressen funktionieren:** `#raum/H00/C01` zeigt den Flur, `#raum/P05/C01` den Innenhof, `#raum/P04/C02` das Atelier, `#raum/M01` das Musikzimmer, `#geraet/MP-P04` die Atelier-Spieluhr. Die Adresse wird dabei durch die bisherige ersetzt, ohne zusätzlichen Eintrag im Browserverlauf; der Rückweg verhält sich wie bei der bisherigen Adresse.
- **Alle bisherigen Adressen bleiben gültig** (`#flur`, `#haus`, `#ort/P01`–`#ort/P08`, `#atelier`, `#teezimmer`, `#musik…`, `#karte…`, Gerätestationen samt Aliasen). QR-Codes und Rückkehrlinks sind nicht betroffen.
- Räume, Raumnamen, Adressen, Raum- und Gerätebilder sowie die Geräte mit ihren Stücken kommen jetzt aus den Registern statt aus dem App-Code.

## Abweichungen vom Auftrag (mit Grund)
- **Richtung der Aliase:** Der Auftrag sieht `#flur` als Alias von `#raum/H00/C01` vor. Bis es die Szenenkomponente gibt (BOOK-01b/c), zeigen die neuen Adressen die bisherige Ansicht und werden auf deren Adresse umgeleitet. Das Ergebnis ist dasselbe (Abnahme „`#flur` und `#raum/H00/C01` zeigen dieselbe Ansicht“). Die Richtung dreht sich, sobald Szenen eigene Ansichten haben; die Auflösung (`resolveRoute().canonical`) kennt die neue Adresse bereits.
- **Räume ohne bisherige Ansicht** (EXT, KUE, SCH, BAD) und unbekannte Raum- oder Geräte-IDs führen in den Flur, nicht auf eine Fehlerseite. Eigene Ansichten folgen mit BOOK-01d/e.
- **Noch nicht abgelöst:** `feature-registry.js` `roomFeatures` (Funktionsregister, wird laut Vorplanung von den Szenen-Interaktionen abgelöst), die eigenen Renderer von Atelier und Teezimmer und die Kartenbilder (`image-profiles.js`, `media-bridge.js`; betreffen Karten, nicht Räume). `room-music-map.json` bleibt als bestätigte Zuordnung und Prüfmaßstab; der Test vergleicht sie mit dem Register.
- **`navigation.json` und `functions.json`** werden noch nicht gelesen; sie werden erst für Raumwechsel (01c) und Interaktionen (01b) gebraucht.
- **Platzhalter** werden im Code gezeichnet (SVG mit Medien-ID, Pixelmaß, Seitenverhältnis). Die SVG-Dateien aus `assets/placeholders/` liegen nicht auf dem Server und werden nicht gebraucht.
- **Anzeigename der Halle:** Das Register nennt H00 „Halle“. Die App zeigt weiter „Flur“ (App-Feld), weil die Umbenennung sichtbar wäre; sie gehört zu BOOK-01e.

## Antworten auf die offenen Fragen
- **Auslieferung der Register (Kopie beim Build oder gemeinsamer Ablageort):** **Kopie beim Build.** `tools/build-registry.mjs` liest die Register aus einem Checkout von `neuroways/haus-der-wunder` (Standard `../haus-der-wunder/manifests`) und erzeugt `home/data/registry.js`. Die Datei wird als Skript mit der App ausgeliefert, also kein Nachladen zur Laufzeit und keine Netzwerkfehler; Geräte- und Navigationsmodul können sie beim Laden synchron lesen. Mitgenommen wird nur, was die App braucht (keine Prüfsummen, Herkunft oder Notizen); die Datei ist 30 KB groß. Die erzeugte Datei hält den Commit der Register-Quelle fest.
- **App-eigene Felder:** `home/data/registry-app.json` enthält, was die Register nicht führen: Adressen und Aliase, Artikel und Präpositionen für Ansagen, Orientierungssätze und Alt-Texte der bisherigen Raumansichten, Stücklisten der Geräte und die auf dem Server ausgelieferten Mediendateien (jeweils mit Verweis auf die Medien-ID in `media.json`). Das Werkzeug bricht ab, wenn ein App-Feld auf einen unbekannten Raum, ein unbekanntes Gerät, Objekt oder Medium zeigt oder eine Adresse doppelt vergeben ist.
- **Rückfall:** Fehlt `data/registry.js` oder ist sie ungültig, gilt ein eingebauter Notfallbestand mit den Räumen und Geräten, die eine Adresse haben, und deren Bildern. Er wird vom selben Werkzeug erzeugt, ein Test prüft die Gleichheit. Ungültige Einzeleinträge werden übersprungen und als Warnung gemeldet. Im Browser geprüft: Bei gesperrter Registerdatei laufen Raumübersicht, Innenhof, Atelier-Spieluhr und `#raum/H00/C01` ohne Fehler.
- **Medienstatus (K-16):** Vorschlag in `docs/decisions/konflikte.md` K-16 (gemeinsames Repository). In der App bereits getrennt: `produktion` (Skala aus `media.json`), `verfuegbarkeit` (vorhanden/fehlt), `integration` (original/platzhalter).
- **Gerätenamen (K-19):** `music-devices.json` hat jetzt das Feld `anzeigename` für MP-P01–P08 (auch im Generator `tools/build_registers.py`). `name` bleibt die Objektbeschreibung. Die App zeigt `anzeigename`.
- **Vorlage für Bildlieferungen:** Je Bild liefert die Bildproduktion Medien-ID (z. B. `scene.H00-C01.kandidat`), Format (16:9), Pixelmaß, Status und Datei. Einsetzen: Datei nach `media/` (Server), in `registry-app.json` → `medien` die Medien-ID mit `datei`, `breite`, `hoehe` und `register` eintragen, Register neu erzeugen. Code ändert sich dabei nicht (Test mit `scene.H00-C01.kandidat`). Für Hotspots folgt das Format mit BOOK-01b.

## Tests
npm test: 339 bestanden, 0 fehlgeschlagen, 0 übersprungen (vorher 329).
Neu: `tests/book-01a-registry.test.cjs` mit 10 Tests:
- Alias-Matrix: 25 bisherige Adressen haben denselben Ort, dieselbe Station, dasselbe Ersatzziel und denselben Namen wie vorher.
- Neue Adressen und Umleitung.
- `#flur` und `#raum/H00/C01` rendern identisches Markup; die Adresse wird ersetzt, ohne Verlaufseintrag.
- Keine festen Raum-, Namens- oder Gerätelisten mehr im App-Code.
- Platzhalter mit Medien-ID und Seitenverhältnis.
- Austausch Platzhalter → Bild nur über einen Registereintrag.
- Rückfall bei fehlender oder fehlerhafter Registerdatei.
- Notfallbestand ist gleich der Registerdatei.
- Medienstatusfelder.
- Ladereihenfolge.

Angepasst wurden sieben bestehende Tests, die feste Adressen im Quelltext suchten. Sie prüfen jetzt die Registerdaten oder führen den Code aus; geprüft wird dasselbe Verhalten.
NAV-01- und PLAYER-01-Tests sind unverändert grün.
`node tools/build-registry.mjs --check`: aktuell. Im gemeinsamen Repository meldet `tools/quality_check.py`: 0 Fehler, 1 bekannte Warnung (LFS-Originale).
Browser (Chromium, 390 px): alte und neue Adressen, Raumübersicht (9 Kacheln, alle Bilder geladen), Rückweg nach einer neuen Adresse und der Rückfall ohne Registerdatei wurden geprüft, ohne Skriptfehler. Nicht geprüft: echtes iPhone.

## Neue offene Punkte / Fragen an die Planung
1. **Szenenbilder auf den Server:** Die 11 vorhandenen Szenenbilder (EXT-C01/02, H00-C01/02, KUE-C01/02, P05-C01/02, P08-C01/02 und die Referenz EXT-C00) liegen nur im gemeinsamen Repository, als PNG mit 1672×941 und 2–3 MB pro Bild. Für BOOK-01b brauchen sie eine Web-Fassung (z. B. WebP) und einen Zielpfad unter `media/`. Ohne die Bilder zeigt die Szenenkomponente Platzhalter. Frage: Sollen Web-Fassungen erzeugt werden, und wer gibt sie frei?
2. **K-16:** Felder für Freigabe und Verifikation in `media.json` entscheiden (Vorschlag liegt vor).
3. **Erzeugen braucht beide Repositories:** Wer die Register ändert, muss danach in der App `node tools/build-registry.mjs` laufen lassen. Ein automatischer Abgleich (z. B. eine Prüfung im PR) ist noch nicht eingerichtet.
4. Raumkacheln bei 390 px Breite: „Fensterzimmer“ und „Wintergarten“ brechen mitten im Wort um. Markup und CSS sind unverändert, das Verhalten bestand vermutlich schon vorher. Bei der Szenen- bzw. Hallengestaltung mit ansehen.

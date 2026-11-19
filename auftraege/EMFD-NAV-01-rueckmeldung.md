# EMFD-Rückmeldung · EMFD-NAV-01 · Rückwege und Navigation vereinheitlichen
Datum: 19.11.2026 · Ergebnis: umgesetzt (N09, N13 teilweise, N14 blockiert bis PLAYER-01) · Commit: 011ba36 auf claude/modest-galileo-ifo41b
Ausgangsversion: v0.6.66 · Zielversion: v0.6.67

## Was sich für die Person ändert
- Jede untergeordnete Ansicht hat oben links **genau einen Rückweg**: Pfeil nach links und der Name des Ziels, z. B. „← Flur“, „← Alle Räume“, „← Teezimmer“, „← Kartengalerie“, „← Der freie Sessel“. Screenreader hören „Zurück zum Flur“, „Zurück zur Bibliothek“, „Zurück zur Übersicht aller Räume“ usw.
- Der Rückweg führt dorthin, **woher man tatsächlich kam**: Ein Raum, der über „Alle Räume“ geöffnet wurde, führt zu „Alle Räume“ zurück; aus dem Flur geöffnet führt er zum Flur. Kartengalerie und Einzelkarte gehen Schritt für Schritt über die echte Herkunft zurück (z. B. Karte → Kartengalerie → Teezimmer → Flur).
- Ohne Herkunft (Direktlink, QR-Code, Lesezeichen) gilt die Matrix: Raum → Alle Räume → Flur; Einzelkarte → Kartengalerie → Flur; Plattensammlung und Geschichten → Musikzimmer → Flur. Der Rückweg führt nie aus der App heraus.
- **App-Rückweg und Browser-Zurück passen zusammen**: Ist das Ziel der vorherige Eintrag im Browserverlauf, geht die App im Verlauf zurück. Sonst wird der aktuelle Eintrag ersetzt, ohne einen neuen anzulegen. Browser-Zurück und -Vorwärts funktionieren danach wie erwartet, auch nach einem Neuladen.
- Beim Blättern durch die Atelier-Galerie bleibt der Rückweg der Galerie erhalten; ein Tipp führt direkt zur Herkunft, nicht durch alle durchgeblätterten Karten.
- Weggefallen sind die festen Doppel-Links auf den Raumseiten („Alle Räume“ und „Zum Flur“), „Atelier verlassen“, der zusätzliche „Zurück ins …“-Link über Kartengalerie und Musikzimmer und die Tür-Symbole an Rücklinks. Das Logo führt weiterhin in den Flur.
- Das Gedankenblatt ist unverändert ein Dialog über der Karte.

## Abweichungen vom Auftrag (mit Grund)
- **Lieferung:** statt ZIP-Übergabe per Chat liegt das vollständige Paket als `dist/EMFD-v0.6.67-home-NAV-01.zip` im Arbeitsverzeichnis (nicht im Git, ca. 16 MB). Die vollständige Änderung ist im Commit nachvollziehbar (`git show 011ba36`).
- **Atelier und Teezimmer** zählen als Räume (P04, P08) und haben daher den Ersatz „Alle Räume“ (früher fest „Flur“).
- **Herkunft nach einem Neuladen** wird aus dem Verlauf dieses Browser-Tabs übernommen (nur Adressen, sessionStorage `emfd.nav.history.v1`); dadurch zeigt ein neu geladener Raum weiter seinen echten Rückweg statt des Ersatzziels.
- **Tür-Symbol:** Es gibt in der 2D-App derzeit keine eigenen Tür-Übergänge mit Symbol; das Tür-Symbol ist damit vorerst nirgends mehr zu sehen. Es steht für spätere Raumverbindungen bereit.
- **Version:** App-Version auf 0.6.67 erhöht (alle Versionsstellen einheitlich), da sich das Verhalten sichtbar ändert. `file-hashes.json` neu berechnet.

## Antworten auf die offenen Fragen
- **Routen (konkrete Hashes):** `#flur` (`#haus`), `#raeume`, `#ort/P01`–`#ort/P07` (`#ort/P04` = `#atelier`, `#ort/P08` = `#teezimmer`), `#atelier/tisch/O01–O24`, `#karten`, `#karte/O01–O24`, `#karte/Oxx/frage`, `#karte/verdeckt`, `#musik`, `#musik/playlist`, `#musik/geschichten`, `#musik/geschichten/Oxx`, `#ankommen`. Unverändert, QR- und Geschichtenlinks bleiben gültig.
- **Routingmatrix (Fallback ohne Herkunft):** `#raeume`, `#karten`, `#musik` → `#flur` · `#ort/P0x`, `#atelier`, `#teezimmer` → `#raeume` · `#musik/playlist`, `#musik/geschichten(/Oxx)` → `#musik` · `#karte/Oxx`, `#karte/verdeckt` → `#karten` · ungültig → `#flur`. `#flur` und `#ankommen` haben keinen Rückweg.
- **Schnittstelle für PLAYER-01 (NAV-D09):** `EMFDNavigation.place(route)` liefert den Ort (P01–P08, flur, raeume, musik, ankommen; `null` für Karten, Galerie, Geschichten), `transition(from,to)` Tür/Station, `backLinkMarkup(fallback)` den Rückweg. Für die Geräteadressen sind in PLAYER-01 nur Route, Fallback („zugehöriger Raum“) und Name zu ergänzen.

## Tests
- `npm test`: **319 bestanden, 0 fehlgeschlagen, 1 übersprungen** (MP3-Test ohne Audiodatei). Repo-Tests (`tests/run_tests.sh`): bestanden.
- Neu: `tests/nav-01-back-navigation.test.cjs` mit simuliertem Browserverlauf: N01, N02/N03, N04 (P04, Atelier, Teezimmer, P05), N05, N06 (Teezimmer-Galerie-Karte, Atelier-Blättern), N07, N08, N10 (gefälschte, externe, zyklische Herkunft), N11 (Neuladen), Matrix, N12 (Name, Pfeil, keine Tür) – alle bestanden.
- 10 bestehende Tests an das neue Verhalten angepasst (feste Rücklinks, alte Versionsnummer).
- Im echten Browser (Chromium, 390 × 844) geprüft: Flur → Alle Räume → Bibliothek → App-Rückweg → Browser-Zurück → Vorwärts; Direktaufruf Teezimmer → Alle Räume → Flur ohne neue Verlaufseinträge; Teezimmer → Tageskarte → Rückweg Teezimmer; Plattensammlung. Keine JavaScript-Fehler.

| ID | Status |
|---|---|
| N01–N08, N10–N12 | bestanden |
| N09 Gedankenblatt | nicht getestet (Code unverändert, keine Route) |
| N13 Geräte/Screenreader | teilweise: Smartphone hoch im Browser geprüft; Tablet, Desktop, Querformat, Screenreader nicht getestet |
| N14 Geräteadresse | blockiert bis PLAYER-01 |

## Neue offene Punkte / Fragen an die Planung
1. **Tür-Symbol:** Soll es schon jetzt an räumlichen Wegen erscheinen (z. B. Raumkacheln in „Alle Räume“, Hotspots im Flur), oder erst mit den Raumverbindungen?
2. **Raumseite P01–P07:** Die frühere zweite Möglichkeit „Zum Flur“ entfällt (Logo bleibt). Falls ein sichtbarer Weg „Alle Räume“ zusätzlich zum Rückweg gewünscht ist, als eigenständige Navigation planen (nicht als zweiter Rückweg).
3. Prüfung auf dem iPhone (Home-Bildschirm-App, Wischgeste zurück) steht aus.

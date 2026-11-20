# EMFD-Rückmeldung · EMFD-MAEPPCHEN-02 · Mäppchen der Begleiterkarte v0.2 (Ansichten, Hörmoment, Rückgabe)
Datum: 20.11.2026 · Ergebnis: umgesetzt · Commit: 64cacc9 auf `claude/maeppchen-02` · App v0.6.86 (Testversion, Grundlage `claude/p03-01` v0.6.85 mit Wintergarten und D-16)

An Svenja.

## Was sich für die Person ändert
- **Eine Bühne mit Kopfzeile:**
  - Im Mäppchen steht links „Schließen“ (zurück zum Raum). In jedem Stück und im Hörmoment steht dort „Zurück zum Mäppchen“.
  - Kartentitel, „Sichern“ und „In die Schachtel zurücklegen“ bleiben immer erreichbar.
- **iPhone und schmale Fenster:**
  - Das offene Mäppchen füllt die Bühne.
  - Beim Antippen hebt sich das Stück kurz aus seinem Fach und ersetzt das Mäppchen. Der Inhalt beginnt direkt unter der Kopfzeile, in einem senkrechten Scrollbereich.
  - Nur der aktive Bereich ist bedien- und fokussierbar.
- **Wide (ab 960 × 560 px Platz):**
  - Mäppchen links (40 %), gewähltes Stück rechts (60 %) auf derselben Tischfläche. Ohne Auswahl bleibt rechts der Tisch frei.
  - Drehen und Fenstergröße wechseln den Aufbau, ohne Auswahl, Buchseite, Entwurf oder Wiedergabe zu verlieren.
- **Stücke:**
  - **Erkennen im Fach:** Auf Impuls (elfenbein), Frage (blaugrau), Gedankenbuch (petrol) und Geschichtenheft stehen Etiketten als echter Text. Das Heft zeigt zusätzlich einen kleinen runden Ausschnitt der Kartenillustration. Alle Flächen sind Schaltflächen mit Namen.
  - **Motivkarte:** aufrecht und vollständig, Titel einmal darunter, „Karte als Bild sichern“.
  - **Impuls:** groß als Text auf dem Papier.
  - **Frage:** eigener Lesemoment mit „Gedankenbuch öffnen“. Die Tastatur geht dabei nicht auf.
  - **Gedankenbuch:** Die Seite ist die Schreibfläche, die Tastatur erscheint erst beim Tippen auf die Seite. Die Frage steht als einklappbares Kärtchen darüber („Frage anzeigen“), Wide als Doppelseite mit der Frage links.
  - **Geschichtenheft:** warme Papieroptik der Leseansicht, Text oben, Leseschriftgröße, scrollbar.
- **Hörmoment** (eigene Szene):
  - **Aufbau:** oben das quadratische Cover, darunter die Begleiterkarte; Wide stehen beide nebeneinander auf der Nachtfläche.
  - **Start:** Die Hand kommt mit dem matten Papierfalter von unten. Die Berührung lässt ein kleines Licht erwachen.
  - **Flug und Landung:** Es folgt ein kurzer Flug; die Flügel schlagen nur dabei. Das Glühwürmchen setzt sich in die Sitzpose an der unteren rechten Kartenecke.
  - **Lied:** Erst dann startet das Lied über den bestehenden Player, und das Cover blendet ruhig ein.
  - **Während des Lieds:** gleichmäßiges Licht, keine Dauerschleife.
  - **Pausieren und Weiterhören:** „Pausieren“ dimmt den Schein einmal sanft. „Weiterhören“ setzt an derselben Stelle fort.
  - **Reduzierte Bewegung:** direkt in die Sitzpose überblenden, gleicher Ablauf.
  - **Blockierter Start:** Blockiert der Browser den Start, bleibt das Glühwürmchen sitzen und „Lied abspielen“ erscheint.
- **Musik beim Lesen und Schreiben:**
  - Unten erscheint eine kleine Zeile mit Liedtitel und „Pausieren“ bzw. „Weiterhören“.
  - Schmal macht sie beim Schreiben Platz. Wide liegt sie unter dem Lesebereich, ohne Text zu verdecken.
- **Zurücklegen:**
  - Ist der Hörmoment offen, wechselt die Bühne zuerst zum Mäppchen. Dann erscheint die Rückfrage im Vordergrund, alles dahinter ist gesperrt. Bei vorhandenem Text bietet sie freiwillig PDF und Sicherung an.
  - „Noch behalten“ lässt Begleitung, Entwurf und Lied unverändert.
  - Erst „Zurücklegen“ beendet die Begleitung und stoppt ihr Lied. Danach ist eine neue Ziehung möglich.

## Abweichungen vom Auftrag (mit Grund)
1. **Browser-Zurück aus dem Detail:** nicht umgesetzt. Das Mäppchen ist eine Ebene über der Ansicht und nutzt keine App-Adressen. Der Auftrag fordert das nur, „sofern die App-Navigation dafür verwendet wird“. Escape führt aus Detail und Hörmoment ins Mäppchen.
2. **Cover:**
   - Die Reihenfolge ist dieselbe wie im Musikzimmer (`EMFDDeviceStation.coverFor`): Katalogcover, dann Arbeitscover aus `music-manifest`, dann Kartenvorderseite.
   - Das Player-Gesamtpaket liegt mir nicht vor. Für O21 und O08 gibt es deshalb im Teststand kein quadratisches Cover; angezeigt wird ersatzweise die Vorderseite, vollständig in einem quadratischen Rahmen.
   - Sobald die Cover im Musikkatalog stehen, erscheinen sie ohne Codeänderung in Musikzimmer und Hörmoment.
3. **Papierfalter v0.1:** Die Teile `maeppchen.16`–`21` bleiben registriert, werden aber nicht mehr gezeigt. In der Lasche liegt jetzt der Papierfalter v0.2.
4. **Wide-Hintergründe:** Holztisch und Nachthimmel sind die vorhandenen Hochformate (`object-fit: cover`). Sichtprüfung: Am Desktop schneidet der Holztisch ohne Bruch. Der Himmel rechts zeigt Blätterränder, wirkt aber geschlossen. Ob eine 16:9-Fassung nötig ist, entscheidet ihr anhand der Bilder.

## Antworten auf die offenen Fragen
- **Glühwürmchen-Paket v0.2:** Die fünf PNGs liegen unverändert in `media/maeppchen/gluehwuermchen-v0.2/` und sind registriert als `gluehwuermchen.papierfalter`, `.flugkoerper`, `.fluegel-links`, `.fluegel-rechts` und `.sitzpose`. Die Anker kommen aus `asset-register.json`; die Bilder sind offline aufgenommen.
  - Flügel: Drehpunkt (`pivot`) auf dem Ansatzpunkt des Körpers (`leftWing`/`rightWing`), Deckkraft 0,82.
  - Sitzpose: `cardEdge` auf der unteren Kartenkante bei 80 % der Kartenbreite, `bellyLight` trägt den Schein.
  - Papier: `palm` auf dem Landepunkt der Hand (`maeppchen.15`).
- **Wide-Schwelle:** Der Bilderbuch-Build hatte für das Mäppchen keine Container-Schwelle (nur eine Media-Query ab 900 px quer). Umgesetzt ist der Startwert 960 × 560, gemessen am Dialog.
- **Szenenwahl und Wiedergabe:** Sie laufen unabhängig. Das Abo des gemeinsamen Players steuert Cover, Dimmen, Knöpfe und Musikzeile; die Bühne löst selbst nur bewusste Befehle aus.
- **Konkret fehlende Dateipfade:**
  - Cover O21 und O08 im Musikkatalog: `media/manifest.json` → Cover der Karte, Dateiordner `media/optimized/covers/`. Im Teststand gibt es Cover nur für 3 von 25 IDs. Das Player-Gesamtpaket mit den 25 Arbeitscovern ist nicht angekommen.
  - Lied O21: `media/audio/O21-M01.mp3`. Es liegt nicht im lokalen Teststand (Musik nur auf STRATO `/wunderhaus/media/audio/`). Getestet habe ich mit einer lokalen Test-MP3. O08 (`media/audio/O08-M01.mp3`) ist lokal vorhanden.
  - Glühwürmchen und Mäppchen-Medien: vollständig.

## Tests
- **`npm test`:** 422 bestanden, 0 fehlgeschlagen, 1 übersprungen.
  - Neu bzw. ersetzt in `tests/maeppchen.test.cjs`: Glühwürmchen-Geometrie aus den Ankern, Ablauf Hörmoment v0.2, Bühne v0.2 und Zurücklegen v0.2.
  - Der Medientest zählt zusätzlich die fünf Glühwürmchen-Dateien.
- `python3 tools/media_check.py`: keine neuen Fehler (32 wie bisher). `bash tests/run_tests.sh`: 0 Fehler.
- **Browser-Abnahme nach Abschnitt 5: 26 bestanden, 0 fehlgeschlagen, 2 nicht getestet.**
  - Umgebung: Chromium-Emulation iPhone 13 und 1440 × 900, echte Mäppchen- und Glühwürmchen-Medien, Test-MP3.

| Fall | Ergebnis |
|---|---|
| iPhone O21: Impuls, Frage, beide Bücher und Motivkarte unterscheidbar | PASS (Etiketten passen, Namen als Schaltflächen) |
| Nach jedem Antippen beginnt der Inhalt sichtbar unter der Kopfzeile, nur aktiver Bereich bedienbar | PASS (alle 5 Stücke) |
| Rückweg, Fokus beim auslösenden Stück | PASS |
| Frage → Gedankenbuch öffnen ohne Eingabefokus | PASS |
| Tippen auf die Seite → schreiben sichtbar, Kärtchen eingeklappt, Musikzeile frei, Zeile und Rückweg erreichbar | PASS |
| Zurück → erneut öffnen: Entwurf erhalten | PASS |
| Hörmoment O21: Hand → Flug → Sitzpose → richtiges Lied und Cover | PASS (etwa 2,5 s bis Wiedergabe) |
| Keine Dauerschleife während der Wiedergabe | PASS (0 Endlos-Animationen) |
| Pausieren dimmt, Fortsetzen an gleicher Position | PASS |
| Reduzierte Bewegung (O08): gleicher Ablauf | PASS (3 Fälle) |
| Laufendes Lied → Mäppchen und Text mit Musikzeile, Pausieren/Weiterhören | PASS |
| Rückgabe aus dem Hörmoment: Wechsel zum Mäppchen, Dialog vorn, Schaltflächen sichtbar und bedienbar, dahinter gesperrt | PASS |
| „Noch behalten“ erhält Begleitung und Wiedergabe | PASS |
| Bestätigung stoppt das Begleitlied, Begleitung leer | PASS |
| Wide O08: Mäppchen links, Tisch rechts frei; Hörmoment rechts | PASS |
| Wide → schmal → Wide mit offener Buchseite, Entwurf und Wiedergabe | PASS (Position läuft weiter) |
| Wide: Musikzeile ohne Überlagerung des Lesetexts | PASS |
| Keine JS-Fehler | PASS (3 Durchläufe) |
| iPhone-Bildschirmtastatur verkleinert den sichtbaren Bereich | **nicht getestet** (die Emulation hat keine Bildschirmtastatur; `visualViewport`-Anpassung ist eingebaut, bitte auf echtem iPhone prüfen) |
| Browser-Zurück aus dem Detail | **nicht getestet** (siehe Abweichung 1) |

## Neue offene Punkte / Fragen an die Planung
1. **Player-Gesamtpaket mit 25 Covern:** bitte liefern bzw. die freigegebenen Cover in den Musikkatalog übernehmen. O21 ist laut Stand noch offen.
2. **Echte iPhone-Prüfung des Schreibens mit Tastatur:** sichtbare Fläche, aktuelle Zeile, Rückweg.
3. **Browser-Zurück im Mäppchen:** Soll das Mäppchen eigene Verlaufseinträge bekommen? Dann führt Zurück aus dem Detail ins Mäppchen und von dort zum Raum.
4. **Wide-Hintergründe:** Sind 16:9-Fassungen für Holztisch und Himmel nötig? Vergleichsbilder liegen dem Testpaket bei.
5. **Musikpause beim Raumwechsel (D-16):** Sie gilt auch hier. Das Mäppchen ist kein Raum, deshalb läuft das Lied beim Öffnen und Schließen weiter. Wechselt man danach den Raum, pausiert es.

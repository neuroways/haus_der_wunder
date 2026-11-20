# EMFD-Rückmeldung · EMFD-H00 v0.3 (BOOK-01e) · Die Halle
Datum: 20.11.2026 · Ergebnis: umgesetzt als Testversion (nicht live) · Commit: 6f9a973 auf `claude/book-01e-halle` (neuroways/haus_der_wunder); Register: Branch `claude/book-01e-halle` (neuroways/haus-der-wunder)
Ausgangsversion: v0.6.72 (BOOK-01d, PR #2, noch nicht gemergt) · Zielversion: v0.6.73 · Live unverändert v0.6.69

## Was sich für die Person ändert
- **Eintreten:** Die Haustür in EXT-C01 führt jetzt in die Halle H00-C01: auf dem Smartphone mittlerer Ausschnitt mit Blick auf den Hof, am PC die ganze Illustration. Musik und Licht laufen unverändert weiter. Es gibt keine Starttour und keine Pflichtabfrage.
- **Erster Hallenbesuch:** Eine kleine, schließbare Begrüßung erscheint („Du bist angekommen. …“, Aktion „Das Haus entdecken“). Danach folgt je einmal ein Hinweis am Musiksymbol und einer an „Dein Moment“. Es ist immer nur ein Hinweis zu sehen. Ein Hinweis gilt als gesehen, sobald er erschienen ist; wer sofort weitergeht, bekommt ihn nicht noch einmal. Über die Hilfe kann man die Hinweise bewusst erneut zeigen lassen.
- **Gemeinsame Kopfzeile in allen Szenen** (auch im Eingang): Musik links, Raumlabel mittig („Die Halle“, „Der Eingang“, „Der Garten“), Hilfe rechts. Eine weitere Symbolreihe gibt es nicht. Aktionsliste, „Interaktive Gegenstände anzeigen“ und Einstellungen liegen in der Hilfe.
- **Musiksymbol:** öffnet den globalen Musikbereich mit Titel, Abspielen/Pause, Stopp, Stumm (getrennt von Pause), Lautstärke und Musikbibliothek. Beim Öffnen spielt nichts. Gibt es noch keine Auswahl, startet „Abspielen“ das Hauptthema.
- **„Dein Moment“:** kompakter Knopf unten mittig, standardmäßig geschlossen. Geöffnet zeigt er sechs Ziele: Karte ziehen, Musik hören, Geschichten, Begleiter, Gedankenblatt, Das Haus. Dazu kommt ein Link zur Hilfe. Während der Einführung im Eingang ist der Knopf zurückgenommen, aber voll nutzbar. Eine feste untere Leiste gibt es nicht.
- **Türen:**
  - Hof → Innenhof, Teezimmer (von beiden Seiten) → Teezimmer, Treppe (von beiden Seiten) → Galerie. Geöffnet werden jeweils die bisherigen Raumseiten, mit Rückweg in die Halle an dieselbe Stelle.
  - Küche: Ein Hinweis erklärt, dass sie gerade eingerichtet wird.
  - Haustür (C02): Beim ersten Mal erscheint „Schön, dass du mich besuchst. Meine Tür steht dir jederzeit offen.“ mit „Nach draußen gehen“ und „Noch ein wenig bleiben“. Danach geht es direkt hinaus in den Garten (EXT-C02). Über Umdrehen und die Tür kommt man wieder herein.
- **O08 „Die Laterne“** (C02, runder Tisch): Ein kleines Menü bietet „Licht ausschalten“/„Licht einschalten“ und „Die Laterne entdecken“ (vorhandene Karte O08). Es startet keine Musik und tauscht keine Karte.
- **Lampen** (Deckenlaterne, Bodenlaterne an der Treppe, Wandlaternen, Tischlampe) lassen sich direkt schalten. Deckenlaterne und Bodenlaterne sind in beiden Blickrichtungen dieselbe Lampe mit demselben Zustand. Ist das frühere Flurlicht aus, starten die Hallenlichter ebenfalls aus. Der alte Wert wird dabei nur gelesen. Der Aus-Zustand ist ein gekennzeichneter Platzhalter, bis Lichtmasken vorliegen.
- **Alte Adressen:** `#flur` und `#haus` zeigen die Halle, `#ankommen` führt Folgebesucher wie bisher in die Halle.

## Abweichungen vom Auftrag und offengelegte Widersprüche
1. **Begleiter:** Die Begleiterkarte (BOOK-01g, W6) ist noch nicht umgesetzt. Statt eine Funktion vorzutäuschen, erklärt der Eintrag: „Die Begleiterkarte wird gerade vorbereitet. Bis dahin kannst du über ‚Karte ziehen‘ eine Karte für dich finden.“ (eigener Text, bitte bestätigen).
2. **Gedankenblatt in „Dein Moment“** öffnet den freien Modus. Das widerspricht der älteren Festlegung „freier Modus ohne Einstieg“ und W2 („Gedankenblatt über die Karte“). Umgesetzt habe ich es, weil die neuere Übergabe es ausdrücklich nennt. **Bitte bestätigen.**
3. **Küche, Hof, Teezimmer, Galerie:** Die Zielszenen gibt es noch nicht. Hof, Teezimmer und Galerie öffnen die bisherigen Raumseiten; „Galerie“ ist dabei nicht als fertige v0.9-Galerie ausgegeben. Die Küche zeigt einen erklärenden Hinweis (eigener Text: „Die Küche wird gerade eingerichtet. Bald kannst du sie von hier aus betreten.“). Sobald eine Zielszene integriert ist, genügt ein Registereintrag.
4. **Szenenbilder (K-22):** Wie beim Eingang sind es die unveränderten Referenzbilder aus der Übergabe, verwendet als Testmedium (`freigabe: test`). Die Register-Kandidaten sind andere Dateien.
5. **Hotspots H00-C01** (Küche, Hof, Teezimmer, Treppe, Decken-, Wand- und Bodenlaterne, Tischlampe) habe ich aus dem Bild geschätzt; die Übergabe enthielt nur Seitenangaben. Die Werte für H00-C02 stammen aus TUT-02. Alle sind Entwurf und werden nach den finalen Bildern neu gemessen.
6. **Lichtidentität:** Deckenlaterne und Bodenlaterne sind als gemeinsame physische Lampe beider Ansichten vorgeschlagen. Die Wandlaternen habe ich nicht verbunden. Die angeschnittene Tischlaterne in C01 ist nicht interaktiv, also nicht mit O08 gleichgesetzt. Das muss die Bildpaar-QA bestätigen.
7. **Alte Flur-Seite:** `renderHall()` (Grammophon, Hotspots, Laternenschalter) ist nicht mehr erreichbar, die Funktionen gibt es weiter über „Dein Moment“, Türen und Hilfe. Den Code selbst entferne ich nach der Abnahme, damit kein Parallelmodell bleibt.
8. **Eingang angeglichen:** Die eigenen Einstellungs- und Listen-Symbole im Eingang sind entfallen; beides liegt jetzt in der Hilfe. „Hauptthema abspielen“ an der Glocke läuft jetzt über den Player. Vorher ging es über die Raumauswahl, und das hat das Thema nicht gestartet: Der Browsertest von BOOK-01d prüfte diese Taste nicht.

## Antworten auf die offenen Fragen
- **Routen:** `#raum/H00/C01` und `#raum/H00/C02`; `#flur`/`#haus` sind Aliase (Register: Route und Aliase der Halle).
- **Speicher:**
  - Neu ist `emfd.hall.v1` mit `hints{welcome,music,moment}` und `farewellSeen`. Das Zurücksetzen über die Hilfe setzt nur die drei Hinweise zurück.
  - Lichter stehen in `emfd.lights.v1`. Der alte Wert `emfd.house.light.v1` wird nur gelesen, nie verändert.
  - Geschenk-, Tutorial-, Installations- und Musikwerte sind unberührt; das hat der Browser mit Altdaten bestätigt.
- **Musik:** Es gibt eine einzige Engine. Glocke, Gegenstände und globaler Musikbereich nutzen sie gemeinsam. Mit echter Musik (THEME-M01) geprüft: Die Wiedergabe läuft über Eintritt, Umdrehen, Raumwechsel, Rückweg und Hinausgehen hinweg weiter.
- **Register:** Die Hotspots von H00-C01/C02, die Hallentexte, die Ziele von „Dein Moment“ und O08 stehen in `manifests/quellen/szenen-hotspots.json`. Der Generator überträgt sie nach `scenes.json`. Ein zweites Runtime-Manifest gibt es nicht.

## Tests
- `npm test`: 373 bestanden, 0 fehlgeschlagen, 1 übersprungen.
- Neu ist `tests/h00-hall.test.cjs` mit 8 Tests:
  - Routen und Aliase
  - Hinweise und Wortlaute
  - Türen und Ziele
  - O08, Lichter und Migration
  - „Dein Moment“
  - globale Musik
  - Hilfe
  - Ladereihenfolge und Offline
- 12 bestehende Tests habe ich auf die Halle umgestellt: Name „Halle“, `#flur` als Szene, Platzhaltertests auf KUE-C01.
- Browser-Protokoll `auftraege/EMFD-H00-testprotokoll.md`: 55 PASS, 0 FAIL, 1 NOT_RUN (H00-T33 Bildpaar-QA, Aufgabe von Work).
- Regression des TUT-02-Protokolls: 60 PASS.
- **Nicht geprüft:** echte Geräte, Screenreader, STRATO.

## Neue offene Punkte / Fragen an die Planung
1. Gedankenblatt in „Dein Moment“ (Widerspruch zu W2 und zur Festlegung zum freien Modus) bestätigen.
2. Die drei neuen Hilfstexte bestätigen: Begleiter, Küche, Hinweis „Hinweise der Halle erneut zeigen“.
3. K-22 Szenenmaster H00; Bildpaar-QA, O08-Bild und Lichtmasken liefert Work.
4. Zielszenen für Hof (P05-C01), Teezimmer (P08-C01), Galerie (P06) und Küche (KUE-C02) sind eigene Aufträge.
5. Reihenfolge der Merges: PR #1 (CACHE-01) → PR #2 (BOOK-01d) → dieser PR.

## Nachtrag 20.11.2026 · v0.6.74 (Fehler aus der iPhone-Prüfung)
- **Fehler:** Nach dem Antippen der Brücke (O15 fehlt auf STRATO) erschien „Leider ist die Platte verloren gegangen …“ immer wieder und ließ sich nicht schließen.
- **Ursachen:**
  - Der Player zeigte die Meldung bei jeder Zustandsänderung neu.
  - In Szenen war die Meldung für Klicks durchlässig gesetzt (Fehler aus v0.6.72), deshalb reagierten ihre Knöpfe nicht.
- **Behoben:**
  - In Szenen erscheint die Meldung nicht mehr; das auslösende Paneel zeigt den Zustand selbst.
  - Auf allen anderen Seiten lässt sie sich schließen und bleibt für dasselbe Stück geschlossen.
  - Ein anderes fehlendes Stück meldet sie wieder.
- **Im Browser geprüft:** Brücke mehrfach abspielen, Halle, Raumseite P05, Schließen, erneutes Abspielen.
- **Tests:** `npm test` 374/0/1.

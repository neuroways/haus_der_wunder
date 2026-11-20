# EMFD-Rückmeldung · EMFD-KUE-DEV-01 · Küche für Bilderbuch v0.7
Datum: 20.11.2026 · Ergebnis: teilweise (funktional umgesetzt; visuelle Freigabe blockiert, weil das Bildpaket EMFD-KUE-VIS-01 fehlt) · Commit: siehe unten auf `claude/kue-dev-01`

## Was sich für die Person ändert
- **Küche betreten:** Die Küchentür in der Halle (H00-C01) führt jetzt in die Küche. Man steht in KUE-C02 und blickt zum Röhrenradio auf der Kommode, auf dem Smartphone im mittleren Ausschnitt, am PC auf die ganze Szene. Es gibt keine Begrüßung, keine Tour und keine neue Musikfrage. Laufende Musik und Licht bleiben, wie sie sind.
- **Umschauen und zurück:** Am Rand dreht man sich um zu KUE-C01. Dort führt die Hallentür (T02) zurück in die Halle, und man steht links am Küchenanschluss. Andere Durchgänge gibt es nicht. Auch ein Direktaufruf (`#raum/KUE/C01` oder `#raum/KUE/C02`) hat immer diesen Ausgang.
- **O10 „Der Samen“ und O24 „Die schräge Tasse“:** Beide öffnen das bekannte Gegenstandspaneel mit den Wegen Karte, Musikstück und Geschichte. Nichts spielt von selbst, und die Begleiterkarte ändert sich nicht. Nach der Karte kommt man an dieselbe Stelle zurück.
- **Lichter:** Deckenleuchte, Laterne am Hoffenster, Laterne auf der Kommode und Arbeitslicht lassen sich einzeln schalten. Eine Leuchte, die in beiden Ansichten zu sehen ist, hat dort denselben Zustand, auch nach der Rückkehr.
- **Radio:**
  - Das Antippen öffnet die Radio-Nahansicht und spielt nichts. Beim ersten Öffnen erscheint einmal der Hinweis: „Dieses Radio spielt seine ganz eigene Mischung aus den Melodien des Hauses. Du weißt nie, welches Stück dich als Nächstes erwartet.“ Er lässt sich schließen und über die Hilfe erneut zeigen.
  - „Radio einschalten“ oder der rechte Drehknopf starten die 24 Kompositionen in zufälliger Reihenfolge. Jede kommt einmal, bevor eine neue Runde beginnt, und das Hauptthema ist nicht dabei.
  - Die Musik läuft weiter, wenn man die Nahansicht schließt, sich umdreht oder den Raum wechselt. Eine kleine Anzeige am Radio zeigt, dass es läuft.
  - „Radio ausschalten“, der globale Stopp oder eine andere bewusst gestartete Musik schalten das Radio samt Anzeige aus. Danach startet das Hauptthema nicht von selbst.
  - Die globale Pause hält das Radio an, Fortsetzen spielt an derselben Stelle weiter.
- **Hilfe in der Küche:** Dort stehen alle Aktionen der Ansicht, „Interaktive Gegenstände anzeigen“, „Ein Gedanke zur Küche“ (freiwilliger Raumimpuls) und „Radio-Hinweis erneut zeigen“.
- **Gemeinsame Bedienbibliothek:** Die Segmentpunkte Links/Mitte/Rechts sind jetzt 44 × 44 px groß. Das gilt auch in Eingang und Halle.

## Abweichungen vom Auftrag (mit Grund)
1. **Bildpaket EMFD-KUE-VIS-01 fehlt.** Angekommen ist nur das Entwicklungspaket, nicht das Bildpaket mit den sechs Ausschnitten, Hotspots sowie Radio- und Lichtebenen. Deshalb gilt:
   - Als Bestandsmedium dienen die **unveränderten Referenzbilder** aus dem Entwicklungspaket (`references/`, 1536×864). Sie liegen als `media/rooms/szenen/KUE-C0x-kue-ref-<sha8>.jpg` mit `freigabe:'test'` und Medien-ID `scene.KUE-C0x.kue-referenz` vor, über den Szenen-Override in `registry-app.json`, genau wie bei EXT und H00. Der offene Konflikt dazu ist K-24.
   - Die **Hotspots sind an den Referenzen geschätzt** und müssen nach dem Bildpaket neu gemessen werden.
   - Die **Radio-Nahansicht** ist vorerst ein Ausschnitt aus KUE-C02. Der Drehknopf ist ein markierter Kreis, die Leuchtebene ein gekennzeichneter Platzhalter (`data-placeholder="radio-leuchtebene"`). Für Lichter gibt es Maskenplatzhalter, aber keine echte Lichtanimation.
2. **O24 in der Referenz:** Auf dem Referenzbild steht die Tasse auf einer Untertasse. Der Auftrag sagt „ohne zusätzliche Untertasse“. Ich habe nichts am Bild geändert, das klärt Work im finalen Master.
3. **Tür am Bildrand von KUE-C02:** Sie ist bewusst kein Durchgang. Der Auftrag sagt „keine neue Tür aus Mockups ableiten“, und T02 ist nur in KUE-C01 bedienbar.
4. **Keine eigene Geräteroute `#geraet/MP-KUE`:** Die Nahansicht öffnet sich als Paneel über der Szene. Dadurch kehrt man exakt an Ansicht und Ausschnitt zurück, und die Musik läuft weiter. `#geraet/MP-KUE` führt weiterhin über das Register in die Küche.
5. **Gemeinsame Licht-IDs als Vorschlag:** `LIGHT-KUE-DECKENLEUCHTE` und `LIGHT-KUE-FENSTERLATERNE` gelten für beide Ansichten. Die Deckenleuchte sieht in den Referenzen unterschiedlich aus, das sollte Work bestätigen. `LIGHT-KUE-KOMMODENLATERNE` gibt es nur in C02, `LIGHT-KUE-ARBEITSFLAECHE` nur in C01. Standardmäßig sind alle an.
6. **Texte:** Raumimpuls und Radio-Hinweis sind wörtlich aus dem Auftrag übernommen und im Register als Vorschlag gekennzeichnet. Die Beschriftungen „Radio einschalten“, „Radio ausschalten“, „Radio fortsetzen“ (bei pausierter Radio-Session), „Rechter Drehknopf“ und die Zustandstexte („Das Radio spielt: …“, „Das Radio ist aus.“) sind meine Vorschläge.
7. **Hauptthema als „andere Quelle“:** Die Halle hat kein eigenes Musikgerät. Im Test ersetzt deshalb das Hauptthema über den globalen Musikbereich das Radio. Für Geräte in anderen Räumen gilt dieselbe Regel, weil alle über den gemeinsamen Player laufen.

## Antworten auf die offenen Fragen
- **Einstieg aus der Halle:** KUE-C02 im Ausschnitt M, wie vorgeschlagen. Am PC sieht man die ganze Szene.
- **Rückkehr in die Halle:** H00-C01 im Ausschnitt L, am Küchenanschluss. Mit den finalen Hotspots muss das noch einmal geprüft werden.
- **Shuffle-Bag:** wie vorgeschlagen umgesetzt.
  - Alle verfügbaren Titel O01–O24 genau einmal pro Runde, an der Rundengrenze nicht derselbe Titel, kein Hauptthema.
  - Fehlende Dateien werden ausgelassen. Gibt es gar keine verfügbare Datei, zeigt das Radio einen Fehlerzustand mit verständlichem Text, ohne Schleife und ohne falschen An-Zustand.
  - Ein Netzfehler beim Laden eines Titels führt ebenfalls in diesen Fehlerzustand. Neu starten lässt es sich nur durch erneutes bewusstes Einschalten.
- **Pause und Stumm:** Die globale Pause hält das Radio an, die Anzeige bleibt als „pausiert“ sichtbar. Der Schalter heißt dann „Radio fortsetzen“ und setzt fort, statt eine neue Runde zu beginnen. Stumm oder Lautstärke 0 ist kein Stopp: Das Radio läuft weiter und die Anzeige bleibt an. Die genaue Darstellung des Leuchtens wartet auf die Radio-Ebenen.
- **Globale Titelauswahl:** Wer bewusst eine andere Musik startet, wechselt die Quelle. Das Radio geht dabei aus, die Radiofolge wird nicht still verändert.
- **Reload:** Es gibt keine Wiedergabe ohne bewusste Aktion. Das Radio speichert nichts außer „Hinweis gesehen“ (`emfd.kitchen.v1`).
- **Knopfeffekt:** Einmalige Drehung um 25° beim Betätigen. Bei reduzierter Bewegung bleibt der Knopf statisch.

## Tests
- `npm test`: 385 bestanden, 0 fehlgeschlagen, 1 übersprungen. Neu ist `tests/kue-kitchen.test.cjs` mit 11 Verhaltenstests auf einem simulierten gemeinsamen Player. Sie prüfen:
  - Shuffle-Bag (200 Durchläufe)
  - keinen Autoplay und genau eine Quelle mit Gerätekontext
  - fehlende Dateien
  - Ende der Folge → neue Folge, nur solange das Radio an ist
  - Aus und globalen Stopp ohne Hauptthema, Pause mit Fortsetzen
  - andere Quelle → Radio aus
  - Szenen, T02 und Einstieg
  - O10/O24
  - gemeinsame Licht-IDs
  - Texte und Bedienung
  - Ladereihenfolge und Offline-Liste
- `book-01a-registry.test.cjs`: Die Platzhalterprüfungen nutzen jetzt P05-C01, weil KUE-C01 ein Testmedium hat.
- **Browser-Protokoll** `EMFD-KUE-DEV-01-testprotokoll.md`:
  - 42/42 funktional bestanden, die visuellen Teile sind BLOCKED (Bildpaket).
  - 69 von 69 Einzelprüfungen auf Telefon und PC bestanden, keine JS-Fehler.
  - Regression: Eingang/Einführung 60 PASS. Halle 53 PASS, H00-T23 ist erwartungsgemäß überholt (die Küche hat jetzt eine Ansicht).
- `node scripts/build-offline-precache.mjs --check` ist aktuell (124 Dateien), `node tools/build-registry.mjs --check` ebenfalls (Quelle `neuroways/haus-der-wunder` a8ee431).

## Neue offene Punkte / Fragen an die Planung
1. **Bildpaket EMFD-KUE-VIS-01 rc1 bitte (erneut) übergeben.** Danach messe ich die Hotspots neu, binde die Radio- und Lichtebenen ein und mache die visuellen Abnahmen.
2. **K-24:** Gelten die Referenzbilder bis zur Freigabe als Testmedium? Und welcher Master gilt danach?
3. **Texte bestätigen:** Raumimpuls, Radio-Hinweis sowie die Schalter- und Zustandstexte des Radios.
4. **Licht-IDs bestätigen:** Ist die Deckenleuchte in beiden Ansichten dieselbe Quelle? Ist das Arbeitslicht in C02 sichtbar?
5. **O24:** Untertasse im Referenzbild (Work).
6. **Hallenhinweis „Die Küche wird gerade eingerichtet“:** Er wird nicht mehr gezeigt und bleibt nur als Rückfall für Räume ohne Ansicht im Code. Er kann nach der Abnahme entfernt werden.

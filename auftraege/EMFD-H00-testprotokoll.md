# Testprotokoll · EMFD-H00 v0.3 (BOOK-01e) · App v0.6.73

Datum: 20.11.2026 · Build: Branch `claude/book-01e-halle` (neuroways/haus_der_wunder) · lokaler Server `home/server.mjs` mit Service Worker
Werkzeug: Chromium (Playwright). Profile: iPhone 13 (Emulation), Desktop 1440×900, 640×800 mit 200 % Schrift, 1280×800, reduzierte Bewegung, gesperrter Speicher. Musik: THEME-M01 von STRATO, nur lokal abgelegt und nicht im Repository.

**NOT_RUN:** echtes iPhone/Android, VoiceOver/TalkBack, STRATO; H00-T33 Bildpaar-QA (Work).

| ID | Umgebung | Prüfung | Ergebnis | Beleg / Ist |
|---|---|---|---|---|
| H00-T01 | phone | Eintritt aus EXT-C01 (phone) | **PASS** | {"scene":"H00-C01","seg":"M","wide":false,"tour":false} |
| H00-T03 | phone | Erster Besuch: einmalige schließbare Begrüßung | **PASS** | welcome |
| H00-T03b | phone | Danach je einmal Musik- und „Dein Moment“-Hinweis, max. einer | **PASS** | nach Begrüßung: music |
| H00-T03c | phone | Wiederkehr: kein erneutes Willkommen | **PASS** | null |
| H00-T07 | phone | Smartphone Umschauen L/M/R mit Pfeilen | **PASS** | L → R |
| H00-T08 | phone | Umdrehen am rechten Rand → C02 links, gleiche Raum-ID | **PASS** | {"scene":"H00-C02","seg":"L"} |
| H00-T08b | phone | Zurückdrehen am linken Rand → C01 rechts | **PASS** | {"scene":"H00-C01","seg":"R"} |
| H00-T15 | phone | Gleiche Lampe C01/C02 gleicher Zustand | **PASS** | C01 aus → C02 aria-pressed=false |
| H00-T16 | phone | Fehlende Lichtlayer: gekennzeichneter Testzustand, kein defektes Bild | **PASS** | Overlay data-placeholder="lichtmaske" |
| H00-T14 | phone | O08: Licht und „Die Laterne entdecken“ getrennt; Karte O08; kein Musikstart | **PASS** | nach Ausschalten: „Licht einschalten“, dann #karte/O08 |
| H00-T20 | phone | Rückkehr aus der Karte: Raum, Szene, Ausschnitt; Licht erhalten | **PASS** | {"hash":"#raum/H00/C02","scene":"H00-C02","seg":"L"} |
| H00-T17 | phone | „Dein Moment“ geschlossen, keine feste Tabbar | **PASS** |  |
| H00-T18 | phone | Sechs Ziele ohne Freischaltung, kein Pfotensymbol | **PASS** | ["Karte ziehen","Musik hören","Geschichten","Begleiter","Gedankenblatt","Das Haus"] |
| H00-T19 | phone | Direkte Aufrufe nutzen bestehende Module | **PASS** | {"house":"#raeume","backHouse":"H00-C02","music":"#musik","musicPlays":0,"card":"#karte/verdeckt","backCard":"H00-C02","paper":true,"stories":true,"companion":"Die Begleiterkarte wird gerade vorbereitet. Bis dahin kannst du über „Karte ziehen“ eine Karte für dich finden."} |
| H00-T20b | phone | Rückkehr aus Modulen in die Halle | **PASS** | {"house":"H00-C02","card":"H00-C02","now":"H00-C02"} |
| H00-T21 | phone | Hilfe: Aktionsliste, Hotspots anzeigen, Hinweise erneut | **PASS** | {"helpBtns":["Alles in dieser Ansicht","Interaktive Gegenstände anzeigen","Einstellungen","Einführung erneut starten (führt zum Eingang)","Geschenkbrief und Geschenkkarte","Das Haus griffbereit","Hinweise der Halle erneut zeigen"],"list":9,"again":"welcome"} |
| H00-T27 | phone | Erster Abschied: bestätigter Text, bleiben möglich, dann direkt hinaus → EXT-C02 | **PASS** | {"stayed":"H00-C02","out":"EXT-C02","seg":"M"} |
| H00-T28 | phone | Wieder hinein und erneut hinaus: kein Abschied, keine Einführung | **PASS** | {"back":"H00-C01","out2":"EXT-C02"} |
| H00-T23 | phone | Küche: noch ohne Ansicht → Erklärung, keine Sackgasse | **PASS** | Hinweis „Die Küche wird gerade eingerichtet…“ |
| H00-T24 | phone | Innenhof: C01 mittig → P05, Rückweg in die Halle | **PASS** | {"to":"#ort/P05","hint":null,"back":"#raum/H00/C01"} |
| H00-T25 | phone | Teezimmer: C01 rechts und C02 links → derselbe Raum | **PASS** | [{"to":"#teezimmer","hint":null,"back":"#raum/H00/C01"},{"to":"#teezimmer","hint":null,"back":"#raum/H00/C02"}] |
| H00-T26 | phone | Treppe: C01 links/C02 rechts → Galerie (bisherige Ansicht), Rückweg | **PASS** | {"to":"#ort/P06","hint":null,"back":"#raum/H00/C02"} |
| ERR | phone | Keine Skriptfehler | **PASS** | [] |
| H00-T02 | desktop | Eintritt aus EXT-C01 (desktop) | **PASS** | {"scene":"H00-C01","seg":"M","wide":true,"tour":false} |
| H00-T03 | desktop | Erster Besuch: einmalige schließbare Begrüßung | **PASS** | welcome |
| H00-T03b | desktop | Danach je einmal Musik- und „Dein Moment“-Hinweis, max. einer | **PASS** | nach Begrüßung: music |
| H00-T03c | desktop | Wiederkehr: kein erneutes Willkommen | **PASS** | null |
| H00-T09 | desktop | Vollbild: ganze Szene, Umdrehen am Rand ohne Slider | **PASS** | {"scene":"H00-C02","wide":true} |
| H00-T15 | desktop | Gleiche Lampe C01/C02 gleicher Zustand | **PASS** | C01 aus → C02 aria-pressed=false |
| H00-T16 | desktop | Fehlende Lichtlayer: gekennzeichneter Testzustand, kein defektes Bild | **PASS** | Overlay data-placeholder="lichtmaske" |
| H00-T14 | desktop | O08: Licht und „Die Laterne entdecken“ getrennt; Karte O08; kein Musikstart | **PASS** | nach Ausschalten: „Licht einschalten“, dann #karte/O08 |
| H00-T20 | desktop | Rückkehr aus der Karte: Raum, Szene, Ausschnitt; Licht erhalten | **PASS** | {"hash":"#raum/H00/C02","scene":"H00-C02","seg":"M"} |
| H00-T17 | desktop | „Dein Moment“ geschlossen, keine feste Tabbar | **PASS** |  |
| H00-T18 | desktop | Sechs Ziele ohne Freischaltung, kein Pfotensymbol | **PASS** | ["Karte ziehen","Musik hören","Geschichten","Begleiter","Gedankenblatt","Das Haus"] |
| H00-T19 | desktop | Direkte Aufrufe nutzen bestehende Module | **PASS** | {"house":"#raeume","backHouse":"H00-C02","music":"#musik","musicPlays":0,"card":"#karte/verdeckt","backCard":"H00-C02","paper":true,"stories":true,"companion":"Die Begleiterkarte wird gerade vorbereitet. Bis dahin kannst du über „Karte ziehen“ eine Karte für dich finden."} |
| H00-T20b | desktop | Rückkehr aus Modulen in die Halle | **PASS** | {"house":"H00-C02","card":"H00-C02","now":"H00-C02"} |
| H00-T21 | desktop | Hilfe: Aktionsliste, Hotspots anzeigen, Hinweise erneut | **PASS** | {"helpBtns":["Alles in dieser Ansicht","Interaktive Gegenstände anzeigen","Einstellungen","Einführung erneut starten (führt zum Eingang)","Geschenkbrief und Geschenkkarte","Das Haus griffbereit","Hinweise der Halle erneut zeigen"],"list":9,"again":"welcome"} |
| H00-T27 | desktop | Erster Abschied: bestätigter Text, bleiben möglich, dann direkt hinaus → EXT-C02 | **PASS** | {"stayed":"H00-C02","out":"EXT-C02","seg":"M"} |
| H00-T28 | desktop | Wieder hinein und erneut hinaus: kein Abschied, keine Einführung | **PASS** | {"back":"H00-C01","out2":"EXT-C02"} |
| H00-T23 | desktop | Küche: noch ohne Ansicht → Erklärung, keine Sackgasse | **PASS** | Hinweis „Die Küche wird gerade eingerichtet…“ |
| H00-T24 | desktop | Innenhof: C01 mittig → P05, Rückweg in die Halle | **PASS** | {"to":"#ort/P05","hint":null,"back":"#raum/H00/C01"} |
| H00-T25 | desktop | Teezimmer: C01 rechts und C02 links → derselbe Raum | **PASS** | [{"to":"#teezimmer","hint":null,"back":"#raum/H00/C01"},{"to":"#teezimmer","hint":null,"back":"#raum/H00/C02"}] |
| H00-T26 | desktop | Treppe: C01 links/C02 rechts → Galerie (bisherige Ansicht), Rückweg | **PASS** | {"to":"#ort/P06","hint":null,"back":"#raum/H00/C02"} |
| ERR | desktop | Keine Skriptfehler | **PASS** | [] |
| H00-T05 | phone | Alte Zustände: Altnutzer → Halle; Werte erhalten; Flurlicht „aus“ übernommen; kein Autoplay | **PASS** | {"hash":"#flur","kept":"1,1,1,on,off","light":false} |
| H00-T06 | phone | Daten gelöscht/Speicher gesperrt: freiwilliger Einstieg, Halle schließbar, keine Fehler | **PASS** | {"errs":[]} |
| H00-T10 | phone | Reduzierte Bewegung: Umdrehen ohne horizontale Bewegung | **PASS** | Animation 0s |
| H00-T11 | desktop | Keine Musik beim Öffnen; bewusst Hauptthema einschalten | **PASS** | {"state":"playing","track":"T03"}; play() beim Öffnen: 0 |
| H00-T13 | desktop | Globale Steuerung: Stumm ≠ Pause, Lautstärke zurück, Stopp; eine Engine | **PASS** | Stumm vol=0, danach 0.7, Stopp → stopped |
| H00-T12 | phone | Musik läuft aus dem Garten weiter (Eintritt, Umdrehen, Raumwechsel, Hinausgehen) | **PASS** | Glocke:playing · Eintritt:playing · Umdrehen:playing · Galerie:playing · zurück:playing · Garten:playing (THEME-M01 von STRATO, nur lokal) |
| H00-T22 | phone | Eingang/Tutorial: kein festes Menü; „Dein Moment“ zurückgenommen, voll nutzbar | **PASS** | quiet=true, Ziele=6 |
| H00-T29 | phone | Alte Routen #haus/#flur/#ankommen, Geschenk gültig | **PASS** | {"haus":"H00-C01","flur":"H00-C01","ankommen":"#flur","gift":true} |
| H00-T30 | 640×800 | Barrierefreiheit: Beschriftung, Zielgrößen ≥44 px, 200 % Schrift ohne Überlauf | **PASS** | {"r":{"unlabeled":0,"small":[],"overflow":false},"zoom":{"overflow":false,"help":true}} |
| H00-T31 | desktop | Medienwechsel/fehlendes Bild: Platzhalter, Hotspots bleiben, keine Logikänderung | **PASS** | Austausch per Registereintrag: npm test (book-01a) |
| H00-T32 | – | Bestandsregression | **PASS** | npm test 373/0/1; Karten, Musik, Bücher, Gedankenblatt, Geschenk/QR, Hilfe im Browser aufgerufen (T14, T19, T29) |
| H00-T33 | – | Bildpaar-QA (Raumidentität, O08, Lichtquellen) | **NOT_RUN** | Aufgabe von Work; Hotspots/Licht-IDs sind Entwürfe am aktuellen Bildstand |

Summe: 55 PASS, 0 FAIL, 1 NOT_RUN.

Regression Eingang/Tutorial (TUT-02-Protokoll erneut ausgeführt): 60 PASS, 0 FAIL. Erwartungen gezielt angepasst: Die Tür führt jetzt in H00-C01 statt in den Flur, und die Hilfe enthält zusätzlich die Szenenaktionen.
`npm test`: 373 bestanden, 0 fehlgeschlagen, 1 übersprungen.

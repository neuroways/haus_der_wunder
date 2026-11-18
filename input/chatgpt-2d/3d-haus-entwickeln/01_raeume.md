<!-- Quelle: ChatGPT-Chat „3D Haus entwickeln“, eingefügt am 18.11.2026, unverändert übernommen (Text so, wie er im Claude-Chat ankam; Markdown-Überschriften waren dort bereits als Fließtext dargestellt).
     Abgleich mit dem Live-Code v0.6.66 (18.11.2026, lesend): HOUSE_CONNECTIONS ist weiterhin leer; die Routen und die Speicherschlüssel emfd.atelier.* stimmen mit v0.6.56 überein. -->

01 · Räume und Stationen der 2D-PWA

Projekt: Ein Moment für dich · Das Haus der kleinen Wunder
Geltungsbereich: ausschließlich 2D-PWA /wunderhaus/home/
Übergabestand: letzter bekannter Testbuild v0.6.66 (13.–14.11.2026); nicht als Live-Stand bestätigt
Wichtige Quellbasis: vollständiges App-Archiv v0.6.56 (04.11.2026) mit home/app.js, home/atelier.js, home/teezimmer.js, home/music-room.js, home/room-music-map.json und QA-Berichten. Diese Quellen belegen den damaligen Codezustand, nicht automatisch den gesamten späteren Stand v0.6.66.

0. Leseregeln und Versionsgrenzen

• BESCHLOSSEN = ausdrückliche Nutzerentscheidung oder verbindliche Projektregel.
• UMGESETZT (vX.Y.Z) = in einer konkreten Quellfassung oder einem QA-Bericht nachgewiesen.
• IN ARBEIT = als konkreter Entwicklungsauftrag / Übergabe beschrieben, aber nicht vollständig abgenommen.
• IDEE = Konzept oder Vorschlag ohne nachgewiesene Umsetzung.
• VERWORFEN = ausdrücklich nicht weiterzuverfolgender Ansatz.
• [UNBEKANNT] = aus den verfügbaren 2D-Quellen nicht belastbar rekonstruierbar.
• [UNSICHER: …] = plausible, aber nicht belegte Zuordnung.

Versionsgrenze: Die vorliegende 2D-Quellarchivdatei ist v0.6.56. v0.6.66 ist der jüngere, im Projektverlauf genannte Testbuild. Die konkreten v0.6.66-Codeänderungen sind nur teilweise über einen späteren Prüfbericht bekannt. Deshalb werden ältere Codebelege nicht stillschweigend als vollständig aktueller Code ausgegeben.

Wichtige Abgrenzung: Das 3D-Haus home_3d/ ist ein paralleles Projekt. Seine zusätzlichen Räume, Geometrien, Türkennungen und Laufwege sind keine automatisch gültigen 2D-Routen.

1. 2D-Raumregister und Routen

1.1 Bestätigte Raumidentitäten

Die acht 2D-Raum-IDs und Namen sind seit dem UX-Stand vom 28.10.2026 stabil:

|ID |Raumname     |2D-Route im Quellstand v0.6.56                                            |Umsetzungsstatus im Quellstand v0.6.56                |
|---|-------------|--------------------------------------------------------------------------|------------------------------------------------------|
|P01|Fensterzimmer|`#ort/P01`                                                                |`UMGESETZT (v0.6.49)` – generische Raumdetailansicht  |
|P02|Bibliothek   |`#ort/P02`                                                                |`UMGESETZT (v0.6.49)` – generische Raumdetailansicht  |
|P03|Wintergarten |`#ort/P03`                                                                |`UMGESETZT (v0.6.49)` – generische Raumdetailansicht  |
|P04|Atelier      |`#atelier`; kompatibel `#ort/P04`; Galerie-Unterroute `#atelier/tisch/Oxx`|`UMGESETZT (v0.6.40)` – eigenständige Atelier-Galerie |
|P05|Innenhof     |`#ort/P05`                                                                |`UMGESETZT (v0.6.49)` – generische Raumdetailansicht  |
|P06|Galerie      |`#ort/P06`                                                                |`UMGESETZT (v0.6.49)` – generische Raumdetailansicht  |
|P07|Dachterrasse |`#ort/P07`                                                                |`UMGESETZT (v0.6.49)` – generische Raumdetailansicht  |
|P08|Teezimmer    |`#teezimmer`; kompatibel `#ort/P08`                                       |`UMGESETZT (v0.6.21)` – eigenständige Teezimmeransicht|

Die Routen sind durch home/app.js im Archiv v0.6.56 belegt. Für v0.6.66 ist nicht separat nachgewiesen, ob alle Aliase unverändert bestehen.

1.2 Weitere 2D-Stationen und Hauptrouten

|Station                          |Route                                                                                  |Status / Bedeutung                                                                                                                                        |
|---------------------------------|---------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
|Ankommensseite / Startbereich    |Standardroute ohne Hash; intern `ankommen`; `#ankommen` wird als Rückkehrziel verwendet|`UMGESETZT (v0.6.56)`; der genaue aktuelle v0.6.66-Aufbau weicht laut späterem Prüfvermerk ab                                                             |
|Flur                             |`#flur`; Alias `#haus`                                                                 |`UMGESETZT (v0.6.49)`; zentrale 2D-Orientierung mit Hotspots                                                                                              |
|Raumübersicht                    |`#raeume`                                                                              |`UMGESETZT (v0.6.49)`; acht Räume plus Musikzimmer-Kachel                                                                                                 |
|Musikzimmer                      |`#musik`                                                                               |`UMGESETZT (v0.6.50)`; Musikbereich/Funktion, nicht P09; spätere Ortsregister führen zusätzlich `M01` als räumliche Kennung, 2D-Code-Route bleibt `#musik`|
|Playlist                         |`#musik/playlist`                                                                      |`UMGESETZT (v0.6.50)`                                                                                                                                     |
|Kompositionsgeschichten-Übersicht|`#musik/geschichten`                                                                   |`UMGESETZT (v0.6.50)`                                                                                                                                     |
|Einzelne Kompositionsgeschichte  |`#musik/geschichten/Oxx`                                                               |`UMGESETZT (v0.6.50)`                                                                                                                                     |
|Kartenübersicht                  |`#karten`                                                                              |`UMGESETZT (v0.6.56)`                                                                                                                                     |
|Kartendetail                     |`#karte/O01` bis `#karte/O24`                                                          |`UMGESETZT (mindestens v0.6.50)`; stabile Kartenrouten laut README                                                                                        |
|Verdeckte Zufallskarte           |`#karte/verdeckt`                                                                      |`UMGESETZT (v0.6.53)`                                                                                                                                     |
|Direktaufruf Frage im Kartenbuch |`#karte/Oxx/frage`                                                                     |`UMGESETZT (v0.6.56)`                                                                                                                                     |
|Atelier-Kartenposition           |`#atelier/tisch/Oxx`                                                                   |`UMGESETZT (v0.6.40)`; trotz historischem Segment `tisch` rendert diese Route in v0.6.56 dieselbe Wandgalerie, keine echte Tischszene                     |

Hauptnavigation: Haus · Karten · Musik. Die aktive Hauptnavigation wird anhand der Route markiert. Der Flur ist der 2D-Einstieg in die Hausansichten; Karten und Musik bleiben eigenständige Hauptzugänge.

2. Startbereich / Ankommen

Name: Ankommen / Startseite
Interne ID: [UNBEKANNT]
Route: Standardansicht ohne Hash (ankommen intern); #ankommen wird als Rückkehrziel für eine gezogene Karte verwendet.
Status: UMGESETZT (v0.6.56) als Quellbeleg; UMGESETZT (v0.6.66) nur als Testbuild mit späteren Änderungen beschrieben, aktuelle vollständige Ansicht nicht im Quellarchiv.

Zweck und Stimmung

Die Startseite ist die Einladung in die Welt. Sie soll einen unmittelbaren, freiwilligen Einstieg ermöglichen und weder eine Pflichtreihenfolge noch einen Fortschrittsdruck erzeugen.

Aufbau und Inhalte – belegter Wortlaut aus v0.6.56

• Titel-/Eyebrow: Das Haus der kleinen Wunder
• Hauptüberschrift: Ein kleiner Moment / nur für dich.
• Leitsatz: Du darfst ankommen, ohne dich verändern zu müssen.
• Aktion: Eine zufällige Karte ziehen
• Hauszugang: Betrete dein Haus der Wunder
• Zusatz: Zufallsauswahl aus allen 24 Karten.
• Begrüßung:
  > Manchmal braucht es nicht viel.  
> Einen Augenblick zum Innehalten.  
> Einen Gedanken, der bleiben darf.  
> Oder eine kleine Entdeckung,  
> mit der du nicht gerechnet hast.
  > Hinter dieser Tür wartet ein besonderer Ort auf dich. Ein Haus voller kleiner Wunder, Geschichten und Möglichkeiten.
  > Du darfst dich umsehen, verweilen oder einfach nur da sein.  
> Ganz in deinem Tempo.
• Bild: Haustürmotiv; in v0.6.56 aus ../media/optimized/rooms/startseite-haustuer-v1-864-v1-6f7c1c2055.webp geladen. Frühere Medienbenennung: startseite-haustuer-v1.webp.

Abläufe

1. Startseite wird als Standardansicht geladen.
2. Eine zufällige Karte ziehen zieht eine Karte mit vorhandenem Bild und startet den verdeckten Ziehablauf mit Rückkehrziel #ankommen.
3. Betrete dein Haus der Wunder führt zum Flur #flur.
4. Spätere v0.6.66-Änderungen: altes Menü entfernt; Umschlag/Faltkante korrigiert; Karte durch bewusstes Tippen wenden; feste Briefaktion und Beschriftung Weiter. Diese Änderungen sind im Projektverlauf als Testbuild-Änderungen dokumentiert, der vollständige aktuelle Wortlaut und Codezustand sind [UNBEKANNT].

Speicherung, Verbindungen, offene Punkte

• Karten-Ziehzustand: verwaltet durch das Modul EMFDCardDraw; konkrete Speicherkeys [UNBEKANNT].
• Rückkehrziel kann #ankommen sein.
• Der Flur ist der Hauszugang; die Karten- und Musikbereiche sind separate Hauptzugänge.
• Dauer und genaue Animation des Umschlags in v0.6.66: [UNBEKANNT].
• Die frühere Startseite mit Menüelementen wurde in v0.6.66 entfernt (UMGESETZT (v0.6.66-Testbuild)). Nicht wieder einbauen, ohne den aktuellen Stand zu prüfen.

3D-Bezug

Die 3D-Welt besitzt einen Hauseingang / eine zentrale Halle. Eine 1:1-Übernahme der 2D-Ankommensseite in einen 3D-Raum ist nicht beschlossen. Die Startseite bleibt ein eigener digitaler Einstieg.

3. Flur / Hausorientierung

Name: Im Flur
2D-Routen: #flur, Alias #haus
Status: UMGESETZT (v0.6.49); in v0.6.56 weiterhin enthalten. Aktueller v0.6.66-Abgleich [UNBEKANNT].

Zweck und Stimmung

Zentrale Orientierung im Haus. Der Flur zeigt mehrere Zugänge, ohne einen verbindlichen Grundriss oder eine verpflichtende Rundgangsreihenfolge vorzutäuschen.

Aufbau

• Großes Flurbild mit zwei Lichtvarianten:
  • Licht an: flur-v2.webp / optimierte Variante flur-v2-864-v1-e7d3476528.webp
  • Licht aus: flur-v2-dim.webp / optimierte Variante flur-v2-dim-864-v1-5aba5b505b.webp
• Bildbeschreibung aus v0.6.56:
  > Blick durch den hohen Flur des Hauses: links das Atelier und ein Teetisch, rechts ein gemütlicher Musikbereich, in der Mitte führt ein Teppich zum großen Fenster. Vorne liegen ein aufgeschlagenes Buch und ein Brief.
• Caption:
  > Sieh dich um. Jede Tür steht dir offen.
• Sichtbare Hausfunktionen: Hilfe, Einstellungen.
• Hotspots:
  • Atelier – Kartenbilder ansehen
  • Teezimmer – Eine Karte im Alltag
  • Musik auswählen – Musik hören
  • Alle Räume ansehen
  • Über dieses Geschenk
• Lichtaktion: Licht ausschalten / Licht einschalten.

Abläufe und Interaktionen

• Atelier → #atelier.
• Teezimmer → #teezimmer.
• Musik auswählen → #musik.
• Alle Räume ansehen → #raeume.
• Über dieses Geschenk öffnet den vorhandenen Herkunfts-/Geschenkdialog.
• Hilfe öffnet den globalen Hilfedialog.
• Einstellungen öffnet die globalen Einstellungen.
• Lichtschalter tauscht die Flurillustration zwischen heller und gedimmter Fassung. Das ist in v0.6.56 ein clientseitiger Bildwechsel, keine nachgewiesene Änderung an einer realen Lichtsimulation.

Speicherung / Navigation

• hallLightOn ist in v0.6.56 ein flüchtiger JavaScript-Zustand; dauerhafte Speicherung ist dort nicht belegt.
• Flur führt in die Raumübersicht, Atelier, Teezimmer und Musik.
• Es gibt keine verbindlichen 2D-Tür-IDs oder einen räumlichen Verbindungsgraphen in der v0.6.56-Implementierung.
• Der Flur ist im Musikmodell dem Main Theme T03 zugeordnet; es wird keine zusätzliche T03-Schaltfläche im Flur gerendert.

3D-Bezug

Der Flur ist funktional ein Orientierungspunkt. Die 3D-Architektur verwendet später H00 für die zentrale Halle. Eine Gleichsetzung #flur = H00 ist [UNSICHER: funktional naheliegend, aber nicht als 2D/3D-Routenvertrag belegt].

4. Raumübersicht

Name: Alle Räume
Route: #raeume
Status: UMGESETZT (v0.6.49).

Aufbau und Wortlaut

• Zurücklink: Zurück zum Flur
• Eyebrow: Das Haus der kleinen Wunder
• Überschrift: Alle Räume
• Text:
  > Such dir einen Ort aus. Alle Zimmer sind erreichbar – auch die, in denen du vorerst einfach verweilen kannst.
• Acht Raumkacheln P01–P08 plus eine Musikzimmer-Kachel.
• Die Kacheln zeigen ID/Name und Vorschaubild.
• P04-Kachel öffnet #atelier, P08-Kachel öffnet #teezimmer, die übrigen Kacheln #ort/Pxx; Musikzimmer-Kachel öffnet #musik.

Navigation / Status

Die Übersicht bietet direkte Erreichbarkeit, aber kein verbindliches 2D-Grundrissmodell. Die in EMFD-HOUSE-01 eingeführten Hausregisterfelder für Kategorien und Verbindungen waren zunächst leer. Es gibt in dieser Quellfassung keinen Backend-Endpunkt für Raumverbindungen.

5. P01 Fensterzimmer

ID: P01
Route: #ort/P01
Status: UMGESETZT (v0.6.49) als generische Raumdetailseite; keine eigenständige Interaktionsimplementierung im v0.6.56-Quellstand nachgewiesen.

Zweck, Stimmung und Aufbau

Orientierungstext aus app.js:

> Ein geschützter Platz zum Beobachten.

Bild-Alttext aus app.js:

> Ein gepolsterter Sessel steht neben einer tiefen Fensternische mit Vorhängen. Links sind Regale und eine Katze auf dem Teppich zu sehen; draußen liegt eine nächtliche Landschaft.

Medienzuordnung: P01-fensterzimmer.webp; optimierte Fassung ../media/optimized/rooms/P01-fensterzimmer-1086-v1-6e8da968c9.webp; Vorschaubild ../media/rooms/thumbs/P01-fensterzimmer-thumb.webp.

Interaktionen und Inhalte

• In der generischen Raumansicht sind die vier allgemeinen Kartenkategorien Ruhe, Kraft, Halt, Freude erreichbar.
• Kategorien öffnen die bestehende Bildkartengalerie mit vorausgewählter Gruppe; es handelt sich ausdrücklich nicht um eine kuratierte Kategorie-P01-Zuordnung.
• Frühere UX-Texte / Aktionen aus dem 28.10-Konzept: Ausblick näher ansehen, Karten ansehen, Licht an/aus. Diese sind für den v0.6.56-Code nicht als implementiert belegt: IDEE bzw. [UNBEKANNT] für den späteren Stand.
• Frühere Konzeptidee: Abend-/Mondlicht als Lichtstimmung. Status IDEE, keine 2D-Codefreigabe nachgewiesen.

Karten und Musik

Nutzerfreigegebene Raum-Musik-Zuordnung vom 04.11.2026:

• O01
• O02
• O22

Die Zuordnung ist eine inhaltliche Zuordnung, keine Freigabe der konkreten MP3-Dateien oder Veröffentlichung.

Speicherung, Verbindungen, 3D-Bezug

• Eigene Speicherung oder Zustandswerte: [UNBEKANNT].
• 2D-Verbindungen/Tür-IDs: keine im v0.6.56-Hausregister implementiert.
• 3D-Entsprechung: P01 Fensterzimmer; Name und ID können als gemeinsame Raumidentität erhalten bleiben. Die 3D-Geometrie ist kein 2D-Routenvertrag.

6. P02 Bibliothek

ID: P02
Route: #ort/P02
Status: UMGESETZT (v0.6.49) als generische Raumdetailseite; keine spezifische Bibliotheksinteraktion im v0.6.56-Code belegt.

Zweck, Stimmung und Aufbau

Orientierungstext:

> Ein Raum zum Lesen, Nachdenken und Entdecken.

Bild-Alttext:

> Hohe Bücherregale umgeben ein Lesepult und einen grünen Sessel. Eine Leiter lehnt an den Regalen; mehrere Lampen beleuchten den Raum.

Medien: P02-bibliothek.webp; optimierte Fassung ../media/optimized/rooms/P02-bibliothek-1086-v1-c6cfb3d7be.webp; Vorschau ../media/rooms/thumbs/P02-bibliothek-thumb.webp.

Interaktionen und Inhalte

• Generische Kategorienavigation: Ruhe, Kraft, Halt, Freude.
• Frühere UX-Aktion Geschichten ansehen und Karten ansehen ist als Konzepttext belegt, aber in der v0.6.56-Generikansicht nicht als eigene Bibliotheksaktion implementiert.
• Das globale Musik-/Kompositionsgeschichtenbuch ist unter #musik/geschichten erreichbar; eine direkte Bibliotheks-Verknüpfung ist im Quellstand nicht belegt.
• Bücherbestand, konkrete Buchtitel und Bibliotheksleseablauf: [UNBEKANNT].

Karten und Musik

Nutzerfreigegebene Zuordnung vom 04.11.2026:

• O03
• O18
• O16

Speicherung, Verbindungen, 3D-Bezug

• Eigene Speicherung: [UNBEKANNT].
• 2D-Verbindungen/Tür-IDs: [UNBEKANNT]; im Quellstand kein Verbindungsgraph.
• 3D-Entsprechung: P02 Bibliothek. Die 3D-Bibliothek ist kein Nachweis einer bereits umgesetzten 2D-Buchfunktion.

7. P03 Wintergarten

ID: P03
Route: #ort/P03
Status: UMGESETZT (v0.6.49) als generische Raumdetailseite; konkrete Interaktionen in v0.6.56 nicht belegt.

Zweck, Stimmung und Aufbau

Orientierungstext:

> Ein heller, bepflanzter Übergang zwischen Innen und Außen.

Bild-Alttext:

> Hohe Glasflächen und ein Glasdach umgeben zahlreiche Pflanzen. Ein heller Steinweg führt durch den Raum; links steht ein Arbeitstisch.

Medien: P03-wintergarten.webp; optimierte Fassung ../media/optimized/rooms/P03-wintergarten-1086-v1-2c0a049ef6.webp; Vorschau ../media/rooms/thumbs/P03-wintergarten-thumb.webp.

Interaktionen und Inhalte

• Generische Kategoriennavigation Ruhe, Kraft, Halt, Freude.
• Frühere UX-Aktionen: Karten ansehen, Musik auswählen, Licht an/aus; für den v0.6.56-Code nicht als spezifische Wintergartenaktionen belegt.
• Objekte / Motivideen wie „Der Tanz der Blätter“ oder „Die Wurzel“ dürfen nicht ohne Prüfung als implementierte 2D-Hotspots behandelt werden. Konkreter Hotspot-Ablauf und 2D-Objektregister: [UNBEKANNT].

Karten und Musik

Nutzerfreigegebene Zuordnung vom 04.11.2026:

• O21
• O13
• O10
• O05

Speicherung, Verbindungen, 3D-Bezug

• Eigene Speicherung: [UNBEKANNT].
• Frühere Raumbeziehungsentwürfe sind nicht als 2D-Code umgesetzt belegt.
• 3D-Entsprechung: P03 Wintergarten; die 3D-Glaswand-/Türgeometrie darf nicht als 2D-Interaktionslogik vorausgesetzt werden.

8. P04 Atelier

ID: P04
Routen: #atelier; kompatibel #ort/P04; Kartenansicht #atelier/tisch/Oxx; zusätzlich Kartenübersicht #karten
Status: UMGESETZT (v0.6.40) als Wandgalerie; Gesten- und Bedienverbesserungen UMGESETZT (v0.6.54) im v0.6.56-Archiv nachgewiesen. v0.6.66-Änderungen speziell für P04: [UNBEKANNT].

Zweck, Stimmung und Aufbau

Orientierungstext aus dem Raumregister:

> Ein benutzbarer Werkraum für gestalterische Versuche.

Bild-Alttext:

> Eine große hölzerne Werkbank füllt den Vordergrund. Dahinter stehen Schubladenschränke und Werkzeuge; eine Arbeitsleuchte wirft warmes Licht auf die Tischfläche.

Die konkrete Atelier-Galerie verwendet als Hintergrund P04-atelier.webp bzw. optimierte Varianten. Eine zweite Auslageansicht nutzt P04-atelier-kartenauslage-v1.webp.

Wichtige Korrektur zur Benennung: Die Route #atelier/tisch/Oxx heißt historisch „Tisch“, rendert in atelier.js v0.6.56 aber dieselbe Wandgalerie (renderTable() ruft renderGallery() auf). Das ist keine nachgewiesene 3D-Tischszene.

Aufbau und antippbare Elemente

• Die Auswahlansicht mit Überschrift Wie möchtest du heute schauen?, dem Text Entdecke alle Kunstwerke oder wähle eine der vier Gruppen. Du kannst deine Auswahl jederzeit ändern. und den Aktionen Alle entdecken, Ruhe, Kraft, Halt, Freude gehört im v0.6.56-Code zur globalen Kartenübersicht #karten (renderGrid()), nicht zum Einstieg #atelier.
• #atelier öffnet die zuletzt verwendete Kartenposition in der Wandgalerie. #atelier/tisch/Oxx öffnet dieselbe Galerie an der angegebenen Karte.
• Die Gruppenansicht unter #karten zeigt alle passenden O-Karten.
• Die Galerie zeigt ein Hauptkunstwerk und zwei benachbarte Karten als Orientierung.
• Positionsanzeige Gruppe · NN / 24.
• Navigation Zurück, Text lesen, Weiter.
• Topbar: Atelier verlassen, Hilfe (?) und Musikschalter.
• Hauptmotiv: O01–O24; Kartenformat 896 × 1536 px (7:12), object-fit: contain, kein Strecken oder unbeabsichtigtes Beschneiden.
• Kartendetail-/Zoomdialog mit Mit Handybewegung; Hilfetext: Bewege die Karte leicht mit dem Finger.

Abläufe / Animationen / Ton

1. Atelier öffnet die zuletzt verwendete Kartenposition; Standardkarte O01, falls keine gültige Position gespeichert ist.
2. Die separate Kartenübersicht #karten zeigt ohne gespeicherte Gruppenauswahl die Einstiegsfrage Wie möchtest du heute schauen?.
3. Gruppenwahl in #karten zeigt die entsprechende Kartenmenge.
4. Eine Karte öffnet das zentrale Kartendetail.
5. In der Galerie: Einfachtippen auf das Motiv öffnet nach kurzer Tap-Unterscheidung die Nahansicht; Doppeltippen öffnet den Begleittext. Der explizite Button Text lesen öffnet ebenfalls den Text.
6. Horizontal wischen: links = nächste Karte, rechts = vorherige Karte. Vertikales Scrollen bleibt dem Browser überlassen.
7. Pfeiltasten links/rechts navigieren ebenfalls zwischen den Karten.
8. Vor-/Rückwärtswechsel verwendet eine CSS-Übergangszeit von 360 ms; bei prefers-reduced-motion oder ruhiger Ansicht wird ohne diese Übergangsanimation gewechselt.
9. Aktuelle Karte und Gruppen-/Scrollposition werden in sessionStorage gehalten.
10. Das Atelier startet, stoppt oder ersetzt keine Audiowiedergabe. Ein vorhandener Musikzugang öffnet die gemeinsame Musiksteuerung, aber es gibt keinen automatischen Musikstart.

Inhalte

• O01–O24 in stabiler zyklischer Reihenfolge.
• Gruppen: Ruhe, Kraft, Halt, Freude.
• Kartenbegleittexte stammen aus dem zentralen Kartenregister; sie werden hier nicht neu definiert.
• Zuordnung Musik/Kompositionen für P04: O07, O11, O12.

Speicherung

Im atelier.js-Quellstand v0.6.56:

• emfd.atelier.group – ausgewählte Gruppe in sessionStorage.
• emfd.atelier.gridScroll – Scrollposition der Galerie-/Rasteransicht.
• emfd.atelier.current – aktuelle Karten-ID.
• emfd.atelier.direction – letzte Navigationsrichtung für Eintrittsanimation.
• emfd.card.return – Rückkehrziel aus Kartendetail/Textansicht.

Diese Keys sind für den Archivstand belegt. Ob v0.6.66 sie unverändert verwendet, ist [UNBEKANNT].

Verbindungen, offene Punkte, 3D-Bezug

• Atelier verlassen führt zu #flur.
• Kartenauswahl / Gruppe führt in die gemeinsame Bildkartengalerie.
• Das Atelier ist ein 2D-Bildkartenraum; die spätere 3D-Objektausstellung ist ein separates Umsetzungsvorhaben.
• Die Galerie ist in v0.6.40 funktional abgenommen: 103 PASS, 0 FAIL, 1 SKIPPED, 0 BLOCKED; iPhone-Hochformat, kleines Smartphone-Querformat und Desktop wurden im Bericht geprüft.
• Eine physische Tischszene aus der 3D-Welt ist nicht Bestandteil des 2D-Ateliervertrags.

9. P05 Innenhof

ID: P05
Route: #ort/P05
Status: UMGESETZT (v0.6.49) als generische Raumdetailseite. Ein spezifischer UX-Übergabeauftrag EMFD-P05-UX-01 liegt als Konzept-/Integrationsstand vor; vollständige spätere Codeabnahme [UNBEKANNT].

Zweck, Stimmung und Aufbau

Orientierungstext:

> Ein geschützter Außenraum unter offenem Himmel.

Bild-Alttext:

> Ein gepflasterter Innenhof liegt zwischen beleuchteten Hausfassaden. In der Mitte steht ein Gartentor; daneben sind eine Bank, Pflanzen und ein steinerner Brunnen zu sehen.

Medien: P05-innenhof.webp; optimierte Fassung ../media/optimized/rooms/P05-innenhof-1086-v1-e2185806f0.webp; Vorschau ../media/rooms/thumbs/P05-innenhof-thumb.webp.

Objekte / Interaktionen

Im UX-Übergabestand EMFD-P05-UX-01 (04.11.2026) wurden folgende Objektbezüge festgehalten:

• Bank → O14.
• Gartentor → O09.
• Steinbrücke → O15.
• Brunnen → Detailbetrachtung.
• Drei freigegebene Kompositionen; Kategorien Halt/Kraft sollen hervorgehoben werden, alle vier Kategorien bleiben erreichbar.

Status dieser konkreten Objektinteraktionen: IN ARBEIT / Integrationsauftrag; nicht als vollständig implementiert oder abgenommen behaupten.

Frühere generische UX-Aktionen: Hof näher ansehen, Karten ansehen, Licht an/aus.

Karten und Musik

Nutzerfreigegebene Musikzuordnung:

• O09
• O14
• O15

Speicherung, Verbindungen, 3D-Bezug

• Eigene Speicherung: [UNBEKANNT].
• 2D-Raumgraph/Tür-IDs: [UNBEKANNT].
• 3D-Entsprechung: P05 Innenhof. Die 3D-Objekte/Geometrie sind nicht automatisch Beleg für 2D-Hotspots.

10. P06 Galerie

ID: P06
Route: #ort/P06
Status: UMGESETZT (v0.6.49) als generische Raumdetailseite; eigenständige Durchblick-Interaktionen im v0.6.56-Code nicht belegt.

Zweck, Stimmung und Aufbau

Orientierungstext:

> Ein erhöhter Durchgang mit mehreren Blicken in das Haus.

Bild-Alttext:

> Ein erhöhter Holzsteg mit Metallbrüstung führt an mehreren Bögen entlang. Durch die Brüstung sind beleuchtete Räume auf tieferen Ebenen sichtbar.

Medien: P06-galerie.webp; optimierte Fassung ../media/optimized/rooms/P06-galerie-1086-v1-5179cca5cf.webp; Vorschau ../media/rooms/thumbs/P06-galerie-thumb.webp.

Interaktionen und Inhalte

• Generische Kategoriennavigation Ruhe, Kraft, Halt, Freude.
• Frühere UX-Aktionen: Durchblicke ansehen, Zum Haus.
• Frühere Konzeptidee: mehrere Durchblicke und erhöhte Wege. Eine echte 2D-Perspektiv-/Blickwechselsteuerung ist im Quellstand v0.6.56 nicht nachgewiesen.

Karten und Musik

Nutzerfreigegebene Zuordnung:

• O08
• O15
• O16
• O19

Speicherung, Verbindungen, 3D-Bezug

• Eigene Speicherung: [UNBEKANNT].
• 2D-Verbindungen/Tür-IDs: [UNBEKANNT].
• 3D-Entsprechung: P06 Galerie; eine spätere 3D-Treppe/Glasgalerie ist keine automatische 2D-Navigation.

11. P07 Dachterrasse

ID: P07
Route: #ort/P07
Status: UMGESETZT (v0.6.49) als generische Raumdetailseite; besondere Himmels-/Windspiel-Interaktionen in v0.6.56 nicht nachgewiesen.

Zweck, Stimmung und Aufbau

Orientierungstext:

> Ein kleiner Außenraum mit weitem Horizont.

Bild-Alttext:

> Auf einer Dachterrasse stehen Sitzgelegenheiten, ein Tisch und Pflanzgefäße. Eine steinerne Brüstung rahmt den Blick auf eine beleuchtete Landschaft unter dem Abendhimmel.

Medien: P07-dachterrasse.webp; optimierte Fassung ../media/optimized/rooms/P07-dachterrasse-1086-v1-2f32fc0cfa.webp; Vorschau ../media/rooms/thumbs/P07-dachterrasse-thumb.webp.

Interaktionen und Inhalte

• Generische Kategoriennavigation Ruhe, Kraft, Halt, Freude.
• Frühere UX-Aktionen: Himmel betrachten, Musik auswählen, Licht an/aus.
• Windspiel, Mond-/Stadtansicht und konkrete Blickwechsel wurden als Motive/Interaktionsideen beschrieben; 2D-Codeumsetzung [UNBEKANNT].

Karten und Musik

Nutzerfreigegebene Zuordnung:

• O20
• O17
• O23

Speicherung, Verbindungen, 3D-Bezug

• Eigene Speicherung: [UNBEKANNT].
• 2D-Verbindungen/Tür-IDs: [UNBEKANNT].
• 3D-Entsprechung: P07 Dachterrasse. Die 3D-Treppenverbindung zur Galerie darf nicht als 2D-Route angenommen werden.

12. P08 Teezimmer

ID: P08
Routen: #teezimmer; kompatibel #ort/P08
Status: UMGESETZT (v0.6.21); Gedankenblatt-Erweiterung UMGESETZT (v0.6.56); spätere v0.6.66-Änderungen am Teezimmer sind nicht vollständig rekonstruierbar.

Zweck, Stimmung und Aufbau

Orientierungstext aus dem Raumregister:

> Ein wohnlicher Platz für eine kleine Pause oder Begegnung.

Bild-Alttext:

> Ein warmes Teezimmer mit rundem Holztisch, Teekanne, Tassen, Kartenstapel, blauen Sesseln und einem großen Bogenfenster zum nächtlichen Schloss.

Ansichtstext im Teezimmer:

• Eyebrow: P08 · Das Haus der kleinen Wunder
• Überschrift: Im Teezimmer
• Unterzeile: Ein ruhiger Platz für eine Karte im Alltag.
• Hintergrund: teezimmer_p08_background.webp (1024 × 1536 px); in v0.6.56 unter ../media/rooms/teezimmer_p08_background.webp.

Antippbare Elemente und Abläufe

• Eine Tageskarte ansehen – bewusster Tap löst die Zufallsauswahl aus und öffnet den verdeckten Kartenablauf. Die Auswahl wird nicht schon beim Betreten ausgelöst.
• Selbst eine Karte auswählen – führt zu #karten.
• Alle Bildkarten ansehen – führt ebenfalls zu #karten.
• Ein leeres Blatt nehmen – öffnet das gemeinsame Gedankenblatt im Modus free, ohne Kartenbezug.
• Hilfe – öffnet die globale Hilfe.
• Rückweg: Zurück zum Flur.
• Der Kartenrückweg ist kontextbezogen auf #teezimmer.

Karten, Texte und Musik

Nutzerfreigegebene Musikzuordnung:

• O24
• O04
• O06

Die Tageskarte zieht aus dem gemeinsamen window.CARDS-Register. Eine dauerhaft pro Kalendertag gespeicherte Tageskarte ist im verfügbaren Code nicht belegt: [UNBEKANNT].

Gedankenblatt

• Das Teezimmer verwendet dasselbe Gedankenblattmodul wie die Kartenfragen; kein zweites separates Modul.
• Freier Modus: EMFDThoughtPaper.open({mode:'free'}, ...).
• Der Textzustand ist flüchtig; keine dauerhafte Notizspeicherung in LocalStorage/IndexedDB oder auf dem Server im geprüften v0.6.56-Stand.
• Unexportierte Notizen gehen bei Browserabbruch verloren; bewusstes Verwerfen löscht den aktuellen Objektzustand.
• PNG- und PDF-Export sind implementiert. Der PDF-Export hatte im Test langer Notizen einen Seitenumbruchfehler: Text konnte ab Seite 2 in den QR-/Rückkehrbereich laufen. Kartenillustration wurde in der Schreibansicht angezeigt, aber nicht in den Export übernommen; PDF-Text war gerastert statt durchsuchbar.
• 19/19 gezielte automatisierte Tests für Buch-/Gedankenblattstruktur bestanden; iOS-Safari, Android-Chrome, QR-Scan und mobile Download-Dialoge waren noch praktisch zu testen.

Speicherung und offene Punkte

• Gedankenblatt: nur flüchtiger JS-Zustand; keine dauerhafte Speicherung im geprüften Stand.
• Rückkehrziel aus Kartenkontext #karte/Oxx/frage, aus dem freien Teezimmermodus #teezimmer.
• Ein auf dem Teetisch tatsächlich liegender Zettel war in der UX-Übergabe gewünscht, aber im Funktionsbericht noch nicht vollständig integriert.
• Exportfehler und Exportgestaltung müssen vor Freigabe korrigiert/geprüft werden.
• Ein späterer Begleiterkarten-/Inventar-/Tagebuchbereich wurde in Folgegesprächen geplant; dauerhafte Begleitphasen, Tagebuchspeicherung und globales Inventar waren in der v0.6.66-Prüfung nicht vorhanden. Spätere Umsetzung: [UNBEKANNT].

3D-Bezug

P08 entspricht dem 3D-Teezimmer. Die 3D-Kartentischszene ist keine automatische Entsprechung der 2D-Interaktion; in 2D bleibt die Karten-/Notizfunktion über UI-Module umgesetzt.

13. Musikzimmer / Musikbereich

2D-Route: #musik
Zusatzrouten: #musik/playlist, #musik/geschichten, #musik/geschichten/Oxx
Spätere räumliche Kennung: M01 im Ortsregister vom 07.11.2026; die 2D-App verwendet im v0.6.56-Code weiterhin #musik.
Status: UMGESETZT (v0.6.50) als eigener Musikbereich mit Playlist und Kompositionsgeschichten; tatsächliche Audio-Dateiverfügbarkeit und Veröffentlichungsfreigabe waren nicht bestätigt.

Zweck, Stimmung und Aufbau

Wortlaut aus music-room.js:

• Überschrift: Das Musikzimmer
• Text: Höre bewusst oder bleib bei der Stille. Du entscheidest, wann Musik beginnt.
• Aktionen: Playlist öffnen, Kompositionsgeschichten lesen
• Audioaktion: Musik einschalten
• Status: Musik ist bereit
• Option: Musik beim Betreten starten (im Quellstand standardmäßig nicht angehakt; automatische Wiedergabe ist global nicht der Standard)
• Playlistüberschrift: Musik auswählen
• Playlisttext: Tippe auf ein Stück und starte es, wenn du möchtest.
• Geschichtenübersicht: Kompositionsgeschichten
• Unterzeile: Vierundzwanzig kleine Reisen in die Klangwelt der Karten.

Hintergrundbild: musikzimmer-v1.webp / optimierte Datei ../media/optimized/rooms/musikzimmer-v1-865-v1-518f76f8bb.webp.

Abläufe / Inhalte

• Ein gemeinsamer zentraler Player wird wiederverwendet.
• Auswahl eines Titels stellt den Titel im Player ein; Auswahl allein startet die Wiedergabe nicht.
• Musik beginnt erst nach bewusster Aktion.
• Raumwechsel starten oder ersetzen keine Musik.
• T03 ist das eigenständige Main Theme der App, kein Kartensong.
• Playlist enthält 25 Katalogeinträge: O01–O24 plus T03.
• Kompositionsgeschichten: 24 Karten-/Musikgeschichten mit Übersicht und Einzelansicht.
• In v0.6.56 waren Playlist-Play-Buttons nur aktiviert, wenn playable und publicationStatus === 'approved'; andernfalls als nicht freigegeben deaktiviert. Die tatsächliche MP3-Verfügbarkeit war im Archiv nicht belegt.

Raum-Musik-Zuordnung (Nutzerfreigabe 04.11.2026)

|Raum             |Zugeordnete Karten-/Kompositions-IDs   |
|-----------------|---------------------------------------|
|P01 Fensterzimmer|O01, O02, O22                          |
|P02 Bibliothek   |O03, O18, O16                          |
|P03 Wintergarten |O21, O13, O10, O05                     |
|P04 Atelier      |O07, O11, O12                          |
|P05 Innenhof     |O09, O14, O15                          |
|P06 Galerie      |O08, O15, O16, O19                     |
|P07 Dachterrasse |O20, O17, O23                          |
|P08 Teezimmer    |O24, O04, O06                          |
|Flur             |T03, ohne zusätzliche Flur-Schaltfläche|
|Musikzimmer      |vollständiger Katalog mit 25 Einträgen |

Das sind 26 Raumzuordnungen für 24 eindeutige O-IDs; Mehrfachzuordnungen sind ausdrücklich erlaubt. Die Zuordnung ist nicht gleichbedeutend mit Freigabe aller Audio-Dateien.

Speicherung, Verbindungen, 3D-Bezug

• Gemeinsame Audio-Sitzung / zentraler Player; genaue Speicherkeys im verfügbaren Raumcode [UNBEKANNT].
• Für den v0.6.66-Testbuild sind zusätzlich Raumplaylists mit Wiederholungsfunktion (Repeat) und acht Raumgeräte über eine Grammophonsteuerung genannt. Die acht Geräte-IDs, genaue Bedienlogik und aktuelle Codeabnahme sind [UNBEKANNT]; diese Angabe ist als späterer Testbuild-Befund, nicht als v0.6.56-Quellcodebeleg zu lesen.
• Musik ist unabhängig von der Karte und vom Raum wählbar.
• 3D-Ortsregister verwendet M01; 2D bleibt #musik. Ein technischer 2D-Routenalias #ort/M01 ist nicht belegt.

14. Kartenraum und Kartendetail als raumübergreifende Stationen

Diese Stationen sind keine P-Räume, aber für den Raumrundgang wichtig.

Kartenraum

Route: #karten
Status: UMGESETZT (v0.6.56).

Wortlaut:

• Titel: Der Kartenraum
• Einleitung: Wähle eine Karte, die du ansehen möchtest. Du kannst einfach beim Bild bleiben.
• Filter: Alle, Ruhe, Kraft, Halt, Freude
• Filterzusatz: Nur Karten mit vorhandenem Bild zeigen
• Zurücklink: Zurück zum Flur

Die Karten werden aus dem gemeinsamen Kartenregister gerendert. Die Auswahl einer Karte führt zu #karte/Oxx.

Kartendetail

• Route #karte/Oxx.
• Verdeckter Ziehmodus #karte/verdeckt.
• Bei einer verdeckten Karte werden Identität, O-ID, Text und Musik erst durch das bewusste Umdrehen freigegeben (v0.6.53).
• Beschriftung für verdeckte Karte: Eine Karte wartet auf dich.
• Hinweis: Drehe die Karte bewusst um, wenn du bereit bist.
• Nach Offenlegung: Tippen zum Umdrehen · Bewegen zum Erkunden.
• Die Kartendetailseite besitzt Begleitaktionen Impuls, Vertiefung, Frage.
• Kartenbuch / Begleittexte und Gedankenblatt bleiben getrennte Module.

15. Raumverbindungen: Was ist tatsächlich beschlossen?

2D-Codezustand v0.6.56

• HOUSE_CONNECTIONS ist im Code ein leeres Array.
• window.EMFDHouse enthält Raumdatensätze mit leeren categories- und connections-Feldern.
• Die vier Kategorien sind für alle Räume erreichbar, aber nicht als feste Raum-Kategorie-Zuordnung modelliert.
• Der Raumübersichtszugang ist die verlässliche Möglichkeit, alle Räume direkt zu erreichen.
• Es gibt in der dokumentierten v0.6.49-Integration keinen Backend-API-Endpunkt und keine verbindliche Grundrissfestlegung.

Frühere Entwürfe – nicht als aktuelle 2D-Navigation übernehmen

• Am 04.11. wurden mehrere mögliche Raumbeziehungen diskutiert. Es handelte sich um Beziehungsentwürfe ohne festgelegte Türen, Etagen oder Raum-IDs.
• Ein weiterer Architekturstand vom 07.11. enthält H00, M01 und Türkennungen D01–D11 / S01 / S02. Dieser Stand gehört zum räumlichen Architektur-/3D-Kontext. Er ist kein Nachweis, dass diese Türkennungen in der 2D-PWA implementiert oder als Hashrouten freigegeben sind.
• Der ältere 2D-Wegeplan „Flur → mehrere Räume; Bibliothek → Fensterzimmer; Wintergarten → Innenhof; Galerie → Dachterrasse“ war ein Vorschlag und keine Implementierungsfreigabe.

Verbindliche Arbeitsregel für Claude Code

Keine Türen, Raumkanten, automatischen Übergänge oder Etagenverbindungen aus dem 3D-Modell in die 2D-PWA übertragen, ohne einen expliziten 2D-UX-/Routingauftrag. Raum-IDs P01–P08 und ihre Namen sind stabil; die tatsächlichen 2D-Routen sind die oben belegten Hashziele.

16. Bezug zur 3D-Welt

|2D-Identität     |3D-Entsprechung                         |Übertragbar                                |Nicht automatisch übertragbar                                 |
|-----------------|----------------------------------------|-------------------------------------------|--------------------------------------------------------------|
|P01 Fensterzimmer|P01 Fensterzimmer                       |Name, ID, Motividentität                   |3D-Geometrie, Kameras, Türverbindungen, Hotspots              |
|P02 Bibliothek   |P02 Bibliothek                          |Name, ID, Motividentität                   |3D-Regale/Objekte als 2D-Funktionen                           |
|P03 Wintergarten |P03 Wintergarten                        |Name, ID, Motividentität                   |Glas-/Türkollision und räumliche Navigation                   |
|P04 Atelier      |P04 Atelier                             |Name, ID, Kartenidentität O01–O24          |3D-Kartentisch und physische Objektplatzierung                |
|P05 Innenhof     |P05 Innenhof                            |Name, ID, Objekt-/Motivbezüge nach Abgleich|3D-Gartentor, Brunnen oder Brücke als 2D-Hotspots             |
|P06 Galerie      |P06 Galerie                             |Name, ID, Durchblick-Motiv                 |3D-Treppen und Laufwege                                       |
|P07 Dachterrasse |P07 Dachterrasse                        |Name, ID, Horizont-/Außenraumidentität     |3D-Treppenverbindung                                          |
|P08 Teezimmer    |P08 Teezimmer                           |Name, ID, Teekarten-/Gedankenblattfunktion |3D-Kartentisch als Ersatz der 2D-UI                           |
|`#musik`         |M01 Musikzimmer (späteres Raumregister) |Musikidentität, Musikobjekte nach Abgleich |3D-Geräte-/Instrumente als bereits implementierte 2D-Bedienung|
|`#flur` / `#haus`|H00 zentrale Halle (Architekturregister)|Orientierungsfunktion als Konzept          |technische Routengleichheit / 1:1-Grundriss                   |

Zusätzliche 3D-Räume wie Küche, Schlafzimmer, Bad oder Bewegungsraum sind nicht automatisch Teil des 2D-Raumregisters P01–P08. Ihr 2D-Status ist [UNBEKANNT].

17. Responsive Abnahmevorgaben für Räume

Der Planungsauftrag EMFD-UX-RESP-01 beschreibt für Flur und P01–P08 fünf Formatvarianten je Ort: Desktop, Tablet hoch, Tablet quer, Smartphone hoch und Smartphone quer. Es handelt sich um statische Planungs-Mockups, nicht um eine PWA-Änderung.

Verbindliche Abnahmepunkte aus dem Dokument:

1. Alle neun Bildorte (Flur plus P01–P08): Originalmotiv in voller Höhe und Breite zugänglich; kein verstecktes Abschneiden.
2. Desktop, Tablet hoch/quer, Smartphone hoch/quer sowie Zwischenbreiten und Zoom.
3. Rückweg zum Flur und zur Raumübersicht; Haus · Karten · Musik an allen Orten erreichbar.
4. Touchziele mindestens 44 × 44 CSS-Pixel; Tastaturbedienbarkeit und sichtbarer Fokusrahmen.
5. Hotspots müssen auf dem tatsächlich sichtbaren Bild liegen; zusätzlich ist stets eine alternative sichtbare Liste erforderlich.
6. Raum-Musik-Zuordnung aus v0.6.50 erhalten; keine automatische Wiedergabe.
7. Bereits separat bearbeitete Konzepte für Bibliothek, Wintergarten und Übergänge zusammenführen.
8. Flur, Atelier und Teezimmer nicht durch vereinfachte Referenz-Mockups ersetzen.
9. Keine neuen Raumillustrationen; vorhandene Originale und technisch optimierte Derivate nutzen.

Status: BESCHLOSSEN als Planungs-/Abnahmeregel; Umsetzung und vollständige Abnahme für v0.6.66 [UNBEKANNT].

18. Offene Punkte und bekannte Fehler für die Raumübergabe

1. Aktueller v0.6.66-Code je Raum: [UNBEKANNT]; der zugängliche vollständige Quellstand ist v0.6.56.
2. Vollständige 2D-Routenliste v0.6.66: Hashrouten aus v0.6.56 sind belegt, aber spätere Änderungen nicht vollständig abgeglichen. Die Navigation war laut späterem v0.6.66-Prüfvermerk nur teilweise vereinheitlicht; Rückwege und Musikzugänge unterschieden sich je Raum.
3. P01/P02/P03/P05/P06/P07: im v0.6.56-Code generische Ansichten; konkrete spätere Interaktionen, Objekt-Hotspots und Bildwechsel sind nicht vollständig nachgewiesen.
4. 2D-Verbindungsgraph: im v0.6.56-Code leer. Keine 3D-Türkennungen übernehmen.
5. P05-Objektinteraktionen: Übergabeauftrag dokumentiert, tatsächliche spätere Abnahme [UNBEKANNT].
6. P08-Gedankenblatt: mehrseitiger PDF-Export hatte einen nachgewiesenen Überlappungsfehler bei langen Notizen; Kartenbild fehlte im Export; PDF-Text war gerastert.
7. P08-Begleiterkarte / Inventar / Tagebuch: dauerhafte Begleitphasen, Tagebuchspeicherung und globales Inventar fehlten im Prüfstand v0.6.66 laut späterer Bestandsprüfung; spätere Umsetzung [UNBEKANNT].
8. Musikzimmer: Playlist-/Katalogdaten waren vorhanden; MP3-Verfügbarkeit und Hörfreigaben nicht vollständig bestätigt. Im v0.6.56-Code waren nicht freigegebene Playlist-Play-Buttons deaktiviert.
9. Mobile Abnahme: iPhone-Safari/VoiceOver und Android-Chrome waren bei mehreren früheren Prüfungen noch offen. Einzelne Atelieransichten wurden jedoch auf iPhone-Maßen und Desktop visuell geprüft.
10. Live-Stand: weder v0.6.56-Archiv noch v0.6.66-Testbuild beweisen, dass genau dieser Stand live auf der Domain liegt.

19. Nicht wieder tun

• Keine zusätzliche P09-Raum-ID für das Musikzimmer aus der älteren UX-Idee ableiten. Der 2D-Code führt Musik über #musik; ein späteres Ortsregister führt M01, aber nicht als P09.
• Keine vier exklusiven Bedürfnisräume bauen. Die vier Gruppen sind überall erreichbar und nicht fest an Räume gebunden.
• Keine Pflichtreihenfolge oder automatische Reise durch die Räume einführen.
• Keine Musik beim Betreten eines Raumes automatisch starten. Auswahl und Wiedergabe bleiben bewusst getrennt.
• Keine 3D-Tür-/Treppenbeziehungen als bereits bestehende 2D-Navigation ausgeben.
• Keine Mockup-Screenshots mit eingebetteter UI als finale Raumhintergrundbilder verwenden. UI-Texte, Buttons und Navigation müssen echte HTML-/CSS-Elemente bleiben.
• Keine Raumillustrationen erneut erzeugen, bevor vorhandene Assets und Varianten geprüft sind.
• Keine P04-Karten verzerren oder beschneiden; das physische Bildformat ist 7:12 und object-fit: contain ist der dokumentierte Schutz.
• Keine Gedankenblatttexte dauerhaft speichern, wenn die aktuelle Datenschutzentscheidung nicht ausdrücklich geändert wurde.

20. Quellenlage für diesen Abschnitt

Direkt geprüfte Projektdateien

• EMFD-v0.6.56-home-KOMPLETT-BOOK-NOTE(1).zip
  • home/app.js
  • home/atelier.js
  • home/teezimmer.js
  • home/music-room.js
  • home/room-music-map.json
  • home/card-music-map.json
  • home/README.md
  • home/qa/EMFD-HOUSE-01-INTEGRATION-v0.6.49.md
  • home/qa/EMFD-HOUSE-MUSIC-01-INTEGRATION-v0.6.50.md
  • home/qa/P04-ATELIER-GALERIE-v0.6.40.md
  • home/qa/P08-AENDERUNGSPROTOKOLL-v0.6.21.md
  • home/qa/P08-BESTANDSAUFNAHME-v0.6.21.md
  • home/qa/EMFD-BOOK-NOTE-01-v0.6.56.md
  • home/qa/NAVIGATION-TEST-v0.6.23.md
• 7️⃣ UX Design.txt – UI-/Raumoberflächenplan; Mockups sind keine Produktionsassets.
• EMFD-UX-RESP-01-Responsive-Raumdesign-Bibliothek(1).pdf – Responsive Raumplanung für Flur und P01–P08.
• 🚪Übergänge.txt – zentrale Integrationsregeln; Fachchats liefern Module, nur der Integrationschat verändert die gemeinsame Gesamtanwendung.
• 💭📃Funktion Gedankenblatt entwickeln.txt – Funktions- und QA-Prüfung des Gedankenblatts.
• 5️⃣ Musik & Klangwelten.txt – musikalische Grundhaltung und Klangraumkonzept.

Nicht im Quellstand enthalten / nicht verifiziert

• vollständiger Quellcode v0.6.66;
• aktuelle Live-Dateiliste und tatsächliche Live-Routen;
• alle 2D-Raumtexte und finalen Hotspot-Definitionen nach dem 04.11.2026;
• vollständige Liste der v0.6.66-Änderungen an einzelnen Räumen;
• vollständige tatsächliche MP3-Dateien und deren Veröffentlichungsstatus.

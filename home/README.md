# Aktualisierung v0.6.65 – ARRIVAL-01 reduzierter Ankommensbildschirm

Auf `#ankommen` wurde der Button „Über dieses Geschenk“ aus der Türansicht entfernt. Die globale untere Navigation wird während des Ankommensmodus zuverlässig ausgeblendet; der zuvor reservierte Platz steht wieder der Türansicht zur Verfügung. Im übrigen Haus bleibt die Hauptnavigation unverändert. Der Geschenkzugang im Flur und die bestehenden Wiederholungswege über die Hilfe bleiben erhalten. Keine Veröffentlichung und keine Medienänderung. Nachweis: `qa/EMFD-ARRIVAL-01-v0.6.65.md`.

# Aktualisierung v0.6.64 – einheitliche UI, wiederverwendbare Funktionen und START-02-Medien

Das neue Designsystem `design-system-v0.6.64.css` (als letztes geladen) legt eine einheitliche Größen- und Typografieskala für die Bedienoberfläche fest, ohne die **fünf gespeicherten Leseschriftgrößen** zu entfernen. `reading-preferences.js` setzt gespeicherte Größen vor dem ersten Paint, um Größenwechsel beim Start zu vermeiden.

`feature-registry.js` beschreibt die Funktionen pro Raum nur einmal. Räume P01–P08 können dieselbe Kartenübersicht, Tageskarte, Musikauswahl und Geschichte aufrufen, ohne zweite Kopien zu erstellen. Das Teezimmer behält genau zwei Buttons. Die Kartenbuch-API `EMFDReader`/`EMFDCardBook` in `app.js` öffnet dieselbe Lesefunktion aus unterschiedlichen Einstiegskontexten. Die unabhängigen bestehenden Bücherregale, das Kartenmodul und der Musikplayer bleiben erhalten.

START-02-A01–A06 sind als getrennte Medienidentitäten in `media-catalog.json` und `media-catalog.js` registriert. `start-gate.js` lädt die Motive kontrolliert vor, kann gleichnamige Varianten aus dem Medienregister verwenden und bietet bei Fehlschlag einen erneuten Ladeversuch. Es werden keine fremden Motive eingesetzt und keine Bilder generiert. **Die sechs Originaldateien liegen im hier bereitgestellten Medien-ZIP weiterhin nicht vor.**

Die Änderungen erfolgen nur im `home/`-Verzeichnis; `media/` bleibt unverändert. Keine Live-Veröffentlichung. Prüfstand und Abnahmelimitierungen: `qa/EMFD-UI-ARCH-01-v0.6.64.md`.

# Aktualisierung v0.6.63 – PWA-Installation und Home-Bildschirm

Der Installationsname lautet **Haus der kleinen Wunder**, das Startziel ist `https://flowisaurus.de/wunderhaus/home/` (ohne Hash-Fragment). Das PWA-Manifest, der iOS-Installationsname sowie die Deployment-Konfiguration sind entsprechend angepasst. Der interne Einstieg bei leerem Hash zeigt weiterhin die Ankunftsseite. Details in `qa/EMFD-PWA-INSTALL-01-v0.6.63.md`. Noch nicht live veröffentlicht.

# Aktualisierung v0.6.61 – EMFD-START-02

Der Ersteinstieg führt neue Besucherinnen und Besucher nun von der vorhandenen Haustür über einen freiwillig überspringbaren Geschenkbrief und eine Geschenkkarte in den Flur. Danach folgt einmalig eine ebenfalls überspringbare Einführung; die gerätespezifische Installationshilfe ist freiwillig und später über die Hilfe erneut erreichbar. Wiederkehrende Besuche öffnen direkt den Flur. „Über dieses Geschenk“ öffnet den Brief erneut.

Die fünf Ablaufzustände, die drei voneinander unabhängigen Speicherstände und der gespeicherte Lichtzustand sind integriert. Es gibt kein Autoplay und keine zweite Audioverwaltung. Bildvorladung ist auf höchstens zwei START-02-Dateien gleichzeitig begrenzt; die bisherige vollständige Kartenstapel-Vorladung wurde entfernt. Die sechs vorgesehenen START-02-Produktionsbilder A01–A06 wurden nicht mitgeliefert und daher weder erzeugt noch ersetzt. Die Anwendung zeigt dafür zugängliche Fehlerzustände und bleibt bedienbar. Details: `qa/EMFD-START-02-AENDERUNGSPROTOKOLL-v0.6.61.md`, `qa/EMFD-START-02-TESTERGEBNISSE-v0.6.61.md`, `qa/EMFD-START-02-MEDIENPFADE-v0.6.61.md` und `qa/EMFD-START-02-OFFENE-PUNKTE-v0.6.61.md`.

# Aktualisierung v0.6.60 – EMFD-BIB-FE-01 Bibliothek 2.0

Die Bibliothek P02 enthält nun ein eigenständiges Regal mit fünf Büchern. Der vorhandene Geschichten-Reader wird für die Weltenweberin mit sechs und für die Klangwelten mit dreizehn Originalkapiteln gefiltert; der bisherige Einstieg „Hinter dem Haus“ behält alle neunzehn Kapitel. Hausgeschichten und Achtsamkeit bleiben ausdrücklich als geplante Inhalte gekennzeichnet, das Kartenbuch führt in die bestehende Kartenroute.

Die Integration ist additiv auf v0.6.59 NOTE-03 erfolgt. Kartenbuch, Gedankenblatt-Export, Atelier-Gesten, Teezimmer, Musik und zentrale Audiohoheit bleiben getrennt und erhalten. Es wurden keine Medien oder redaktionellen Texte verändert und keine Veröffentlichung vorgenommen. Änderungs- und Testnachweise: `qa/EMFD-BIB-FE-01-AENDERUNGSBERICHT-v0.6.60.md` und `qa/EMFD-BIB-FE-01-TESTPROTOKOLL-v0.6.60.md`.

# Aktualisierung v0.6.59 – EMFD-NOTE-03 Exportkorrektur

Die gemeinsame Gedankenblatt-Paginierung wurde auf einen einheitlichen Layoutablauf umgestellt: Die Positionsberechnung berücksichtigt auch auf Folgeseiten die tatsächliche Fortsetzungsüberschrift, lange freie Titel und mehrzeilige Fragen. Der QR-/Linkblock bleibt frei. Fehler beim nativen Teilen (außer bewusster Abbruch) lösen einen Downloadversuch aus. Zusätzliche Export-Regressionstests und QA-Bericht unter `qa/EMFD-NOTE-03-v0.6.59.md`. Kein neues Media, keine Veröffentlichung.

# Aktualisierung v0.6.58 – EMFD-TEA-01 Teezimmer

Der freie Gedankenblatt-Einstieg ist als vierte reguläre Teezimmer-Aktion eingebunden. Die Raumansicht verwendet nun eine intern scrollbare Bedienebene, damit alle vier Aktionen auch bei wenig Bildschirmhöhe erreichbar bleiben. Für die vorhandene Raumszene ist ein Fallback auf das Bestandsbild `../media/rooms/P08-teezimmer.webp` ergänzt. Geänderte Styles/Scripts erhalten Cache-Version `0.6.58`. Keine neuen Medien, keine Veröffentlichung; Details und offene Geräteabnahme: `qa/EMFD-TEA-01-v0.6.58.md`.

# Aktualisierung v0.6.54 – Atelier-Gesten

Im Atelier O01–O24 sind horizontale Wischgesten aktiviert: links = Weiter, rechts = Zurück. Doppeltippen auf das Kartenmotiv öffnet den bestehenden Begleittext, Einfachtippen öffnet weiterhin die Bildvergrößerung. Alle drei sichtbaren Schaltflächen bleiben unverändert. Vertikale Touchbewegungen und reduzierte Animationen bleiben unterstützt. Keine Änderungen an media/.

# Aktualisierung v0.6.53 EMFD-CARD-BACK-01

Die gemeinsame Kartenrückseite v1.1 und der verdeckte Ablauf für Zufallsziehungen sind integriert. Startseite und Teezimmer zeigen eine zufällig gezogene Karte zunächst neutral auf der Rückseite; Name, O-ID, Texte und zugehörige Musik werden erst mit dem ersten bewussten Umdrehen freigegeben. Galerie, Atelier und direkte Kartenlinks bleiben unverändert direkt sichtbar. Details und Prüfgrenzen: `qa/EMFD-CARD-BACK-01-v0.6.53.md`.

# Aktualisierung v0.6.51 PERF-01

Bildoptimierung integriert. Aktuelle Installation und Prüfgrenzen: `../PERF01-INTEGRATION.md`. Die nachfolgende Dokumentation beschreibt die Vorgängerversion.

# Ein Moment für dich · Das Haus der kleinen Wunder · v0.6.50 (Basis v0.6.48)

**Interne UX-/Frontend-Testfassung. Keine Produkt-, finale Medien- oder Veröffentlichungsfreigabe.** Weiterentwicklung von v0.6.16 mit modularer EMFD-Button-Bibliothek v0.3 und responsive Shell-/Szenenregeln.

## Bereitstellung

Das App-ZIP enthält auf oberster Ebene ausschließlich `home/`. Entpacke es direkt in `Root/wunderhaus/`, nachdem der bisherige `Root/wunderhaus/home/`-Ordner entfernt wurde. Der Betriebsordner heißt weiterhin kleingeschrieben `home/`.

Die Anwendung liegt unter `/wunderhaus/home/`. Kartenrouten `#karte/O01` bis `#karte/O24` bleiben erhalten. Kartenbilder und Audio liegen als gemeinsame externe Medien unter `/wunderhaus/media/cards/` und `/wunderhaus/media/audio/`. Raumillustrationen liegen außerhalb des App-ZIPs unter `/wunderhaus/media/rooms/`; das separate Medienpaket muss dort vorhanden sein. Der Flur verwendet `flur-v2.webp` (Licht an) und `flur-v2-dim.webp` (Licht aus). Das Haustürmotiv `startseite-haustuer-v1.webp` liegt ebenfalls dort.

Das App-ZIP allein enthält keine großen Medien. T03 ist unter `/wunderhaus/media/audio/THEME.mp3` registriert. Die Audiodatei fehlte im lokalen Build, daher sind tatsächliche Wiedergabe und Fehlerzustand nach separatem Medienupload noch zu prüfen. Der zentrale Player startet niemals automatisch.

## Änderungen in v0.6.18

- EMFD Button-Bibliothek v0.3 liegt als eigenständiges Frontend-Modul unter `emfd-ui/` (CSS, SVG-Rahmen und wiederverwendbare SVG-Icons). `emfd-ui-runtime.js` bindet ihre Nav-, Raumkarten- und Button-Komponenten an die bestehende App an.
- Die Navigation Haus · Karten · Musik verwendet die Bibliothekskomponente; aktive Route wird mit `aria-current="page"` ausgewiesen. Bestehende Hash-Ziele und Ereignisfunktionen bleiben erhalten.
- Raumübersichtskacheln werden mit der Bibliotheks-Raumkarte gerendert und behalten ihre echten Links, Bildalternativen und Fehlerzustände. Bestehende Aktionen erhalten die modularen Rahmenvarianten, ohne ihre Beschriftung oder Funktion zu ändern.
- `emfd-shell.css` bündelt Seitenrahmen, sichere Bildschirmabstände, dynamische Viewport-Höhen, Hauptnavigation und flexible Button-/Kachelgruppen. `emfd-scene.css` hält Illustrationen unverzerrt und Hotspots im gleichen Seitenverhältnis wie das jeweilige Szenenbild.
- Ein Positionsfehler aus der v0.6.17-Integration ist behoben: Button-Grundregeln hatten die Bildpositionen der Flur-Hotspots, des Lichtschalters und der Startseitenaktionen überschrieben. Spezifische Szenenregeln verankern diese Bedienelemente wieder relativ zum Bild.
- Das App-Theme T03 bleibt unabhängig vom Kartenklang im zentralen Player. Es gibt keine Backend-, Datenmodell- oder Medienänderung.

## Architektur und Grenzen

`emfd-shell` steuert Seitenrahmen und Navigation, `emfd-scene` Szenenbilder und bildgebundene Ziele, `emfd-ui` Bibliothekskomponenten und Ornamentrahmen. Die neuen Dateien sind Frontend-only und liegen alle in `home/`. Das SVG-Ornament wird über neun Bereiche skaliert; es wird nicht als einzelnes gestrecktes Buttonbild gerendert. Kurze Hotspots verwenden den einfachen Rahmen.

Alle Aktionen bleiben sichtbare HTML-Links oder Buttons. Raumwechsel starten keine Musik. Backend, Datenmodell, Kartentexte, Karten-/Ortsidentitäten, zentrale Audiohoheit, Routen und externe Medien wurden nicht geändert.

## Prüfung

`npm test` prüft Komponentenpfade, App- und Medienpfade, Navigationserhalt, responsive CSS-Regeln, SVG-Rahmen, bildrelative Hotspot-Ebene, Playerregeln und ZIP-Konventionen. Browserdarstellung und die geforderten echten Gerätebrowser konnten in der verfügbaren Umgebung nicht ausgeführt werden; siehe `design-qa.md`. Die Bibliothek ist technisch integriert, die visuelle Endabnahme bleibt deshalb offen.

## EMFD-HOUSE-01 (v0.6.49)

Der Flur verlinkt wieder auf die Raumübersicht. Alle acht Räume und das Musikzimmer sind darüber erreichbar; sechs Raumgrundansichten sind für spätere Inhalte vorbereitet. Bilder aus `media/rooms/` sowie die neuen kleinen Vorschauen unter `media/rooms/thumbs/` liegen weiterhin außerhalb des `home/`-Pakets. Details und Uploadgrenzen siehe `qa/EMFD-HOUSE-01-INTEGRATION-v0.6.49.md`.

## EMFD-HOUSE-MUSIC-01 (v0.6.50)

- Nutzerfreigabe vom 04.11.2026: 24 Kartenkompositionen sind acht Zimmern zugeordnet; Mehrfachzuordnungen sind erlaubt. Quelle: `room-music-map.json`.
- Sechs Grundräume zeigen ihre Stücke unterhalb der Raumansicht; P04 Atelier und P08 Teezimmer erhalten einen kompakten Zugang, ohne die bestehende Raumansicht umzubauen.
- Der bestehende Player wird bei Auswahl eines Stücks geöffnet und auf dessen Titel eingestellt. **Keine automatische Wiedergabe**.
- Der Flur ist redaktionell dem bestehenden Main Theme T03 zugeordnet; keine zusätzliche Flur-Schaltfläche.
- Es werden **keine Audiodateien** mitgeliefert. Vorhandene Audiodateien und Veröffentlichungsrechte müssen separat geprüft werden.


## Zusammengeführte Fassung START02-DESKTOP-MUSIK

START-02 v0.6.61 mit den erhaltenen Desktop- und Musikkorrekturen. Integrationsprüfung und offene Medien: qa/START02-ZUSAMMENFUEHRUNG.md. Nicht veröffentlicht.


## EMFD-MUSIC-03 · Integration v0.3

Musikzimmer mit direkter Symbolsteuerung, leerem Startzustand, sanftem Auflegen/Abnehmen, separater Covergalerie, kombinierten Filtern, Fassungen, gefilterter Playlist und Wiederholungsmodi. Kompositionsgeschichten verwenden Bibliotheksregal und gemeinsamen Buchleser. Die Geräte-Medien unter ../media/music03/ bleiben erforderlich.

73 gezielte Prüfungen bestehen. Hörabnahme offen: Original-MP3s fehlen, zusätzliche Fassungen sind noch nicht eindeutig zugeordnet. Kein Live-Update und keine Veröffentlichungsfreigabe. Einzelheiten: design-qa.md und separates Übergabeprotokoll.


## BRIEF01 · Korrektur v0.3.1 (06.11.2026)

Das Briefpapier wächst mit dem vollständigen Text. Die Schriftgrößenwahl liegt oberhalb des Blatts; gescrollt wird auf der Seite statt innerhalb eines abgeschnittenen Briefs. Das vorhandene Papier wird in neun Bereiche geteilt dargestellt, damit seine floralen Ecken bei großer Schrift nicht in die Länge gezogen werden. Alle fünf gespeicherten Schriftgrößen und der genaue Brieftext bleiben erhalten.

Geprüft im lokalen In-App-Browser: 320×740 mit allen fünf Größen sowie 390×844, 844×390, 768×1024 und 1440×900 mit Normal. In allen neun Fällen fünf Absätze innerhalb des Papiers, keine horizontale Überbreite und kein innerer Brief-Scrollbereich. Erstmaliges Öffnen samt Umschlaganimation und Übergang zur Geschenkkarte funktionieren. Keine Prüfung auf einem echten iPhone.

73 Musikzimmer-Prüfungen erneut bestanden; sieben funktionale START-02-Prüfungen bestanden. Eine historische Versionsprüfung erwartet weiterhin v0.6.61 und schlägt bereits im unveränderten Vorgänger fehl. Keine Veröffentlichung. Teezimmer-Dateien und Musikmodule unverändert. In app.js ändert sich ausschließlich die Cachekennung des Briefmoduls; index.html lädt die betroffenen Dateien mit neuen Cachekennungen.


## ADVENTURE01 · Einstieg über die lebendige Karte (v0.4, 06.11.2026)

Der Umschlag öffnet sich direkt zur Geschenkkarte. Die Karte selbst ist der anklickbare Eingang. Sie wird sanft größer und geht mit Licht und Überblendung in die vorhandene Flurillustration über. Anschließend erscheint die Auswahl „In Stille“ / „Mit Musik“. Es gibt keinen zusätzlichen Knopf „Geschenkkarte entdecken“ oder „Das Haus betreten“ nach der Karte.

„In Stille“ stoppt Hintergrundmusik und verhindert automatische Starts beim Betreten des Flurs. „Mit Musik“ startet das vorhandene Main Theme T03 direkt im Klick über dieselbe zentrale AudioSession. Die neue bewusste Wahl kann eine frühere globale Stille aufheben; der separate Ruhemodus bleibt wirksam. Die Hintergrundaufnahme wiederholt sich bis zum Stopp. Auch „Überspringen“ führt zur Musikwahl. Zurück oder Escape kehrt ohne neue Entscheidung zur Karte zurück. Die Entscheidung wird nur auf ausdrücklichen Wunsch dauerhaft gespeichert, sonst für den laufenden Besuch. Bei späteren Besuchen mit vorhandener Entscheidung genügt das bewusste Öffnen der Haustür.

Der vollständige persönliche Brief bleibt unter „Über dieses Geschenk“ erhalten, einschließlich BRIEF01 und der fünf Schriftgrößen. Einführung und Installationshilfe bleiben über die vorhandene Hilfe erreichbar; sie unterbrechen den ersten Schritt in die Welt nicht automatisch.

Fehlende Aufnahmen werden schon in der Musikwahl mit „Leider ist die Platte verloren gegangen, sie wird gerade im Haus gesucht.“ erklärt. Der zentrale Player erzeugt dafür keine Audioinstanz. Eine technische Wiedergabesperre bleibt als Fehler erkennbar. Nach echtem Nachladen wird die Statusanzeige bei fortgesetzter Wiedergabe wieder auf „Musik läuft.“ gesetzt.

97 gezielte Prüfungen bestanden (einschließlich aller bisherigen 25 Standardstücke, Transport, Geschichten und neuer Einstiegsprüfungen). Lokaler Browser: vollständiger Umschlag-/Kartenablauf, Verwandlung, Stille, Zurück, Überspringen und fehlende Musik; Auswahl in 390×844 sowie 320×740, 844×390, 768×1024 und 1440×900 geprüft. Keine horizontale Überbreite. Ein separater, nicht ausgelieferter QA-Aufbau verwendet dieselben App-Module und eine stille WAV: Vor der Wahl „Stille“, nach „Mit Musik“ tatsächlich gestartete Browserwiedergabe und „Musik läuft.“. Dies ist keine Hörabnahme einer Originalkomposition und kein Test auf echtem iOS. Reduzierte Bewegung verwendet kurze Zustandsübergänge; Ablauf im Verhaltenstest geprüft.

Keine Veröffentlichung. Teezimmer-Dateien, bestehende Musikzimmer-Oberflächen, Metadaten, Covers, Geschichten und Audiozuordnungen unverändert. Weiterhin keine Original-MP3s im lokalen Paket; bestehende Medienverzeichnisse bleiben erforderlich.


## INTRO01 · Brief und Einführung zum Ausprobieren (v0.5, 06.11.2026)

Aktuelle Reihenfolge: Umschlag → anklickbare Geschenkkarte → Verwandlung → Musikwahl → vollständiger persönlicher Brief → interaktive Einführung → Flur. „Animation überspringen“ entfällt. Der unveränderte Brieftext bleibt mit allen fünf Schriftgrößen auf einem mitwachsenden Blatt. Die Seite samt Papier ist scrollbar. „Das Haus kennenlernen“ führt anschließend in die Einführung.

Die sechs Schritte sind Laterne, Grammophon, Türen, Geschenkkarte, Fragezeichen und Installation. Zwei neue transparente Laternenbilder zeigen an/aus; die Bedienung ändert denselben gespeicherten Lichtzustand wie im Flur. Das vorhandene Grammophon verwendet die zentrale AudioSession für Theme, Start, Stopp, Pause und Fortsetzen. Seine Bindung wird beim Weitergehen gelöst, ohne die Wiedergabe zu unterbrechen. Beim Ankommen startet das Theme nicht erneut von vorn. Im Flur stehen die illustrierte Laterne und ein Theme-Schalter bereit.

Die Tür führt mit einer Öffnungsbewegung zur Geschenkkarte. Sie zeigt die ursprüngliche Vorderseite, dreht sich einmal automatisch zur Rückseite und lässt sich manuell wenden. Die bestehende Rückseitenillustration bleibt unverändert. Das vorhandene QR-Modul erzeugt darauf ein echtes SVG mit vier Modulen Ruhezone. Ziel: https://flowisaurus.de/wunderhaus/home/#ankommen. Ruhige Ansicht erhält alle Zustände mit kurzen Übergängen.

Das Fragezeichen lässt sich ausprobieren. Die bestehende Installationshilfe öffnet sich auf Wunsch und installiert nichts automatisch. Ohne natives Installationsangebot bleibt der Installationsknopf verborgen. Am Ende kommt man im Flur an. Die Hilfe kann die Einführung erneut starten. Ein neuer Abschluss-Schlüssel zeigt die geänderte Einführung auch bestehenden Besuchern aus v0.4 einmal.

109 gezielte Tests bestanden, einschließlich aller bisherigen 25 Standardstücke. Alle sechs Schritte wurden im Browser auf 320×740, 390×844, 844×390 und 1440×1000 geprüft: 24 Messungen ohne horizontale Überbreite und mit sichtbarer Weiter-Taste. Der Brief wurde auf 320px mit allen fünf Größen geprüft. Vollständiger Ablauf mit Stille sowie mit einer separat gekennzeichneten stillen WAV: Musik vor dem Brief, Start/Stopp/Pause/Fortsetzen im Tutorial, fortlaufende Wiedergabe bei Ankunft und Theme-Schalter im Flur. Keine neuen JavaScript-Ausnahmen im geprüften Wiedergabeaufbau.

Nicht veröffentlicht. Teezimmer-Dateien und dessen Ansicht, Musikmetadaten, Covers, Kompositionsgeschichten und Audiozuordnungen unverändert. Original-MP3s fehlen weiterhin lokal; die technische Wiedergabeprüfung ist keine Hörabnahme. Eine tatsächliche Installation, ein QR-Scan mit Kamera und ein echter iPhone-/Safari-Test waren nicht Teil dieser Prüfung.


## LIBRARY02 · Kompaktes Regal und Buchrückseiten (v0.6, 06.11.2026)

In der Bibliothek P02 steht keine lange, automatisch ausgewählte Buchbeschreibung mehr unter dem Regal. Fünf kompakte Bücher zeigen ihre Titel direkt auf dem Cover; die doppelten Titelzeilen und zusätzlichen allgemeinen Auswahlkästen entfallen hier. Der Raumkopf ist kürzer. Die bestehende Zimmermusik-Auswahl bleibt erreichbar.

Ein Buchklick öffnet unmittelbar im Blickfeld eine gestaltete Buchrückseite mit Rückenrand, Titel, Untertitel, vorhandener Beschreibung und Lesestatus. Fertige Bücher bieten „Buch lesen“ und „Zurück ins Regal“. Lesen verwendet unverändert den vorhandenen Buchleser; nach dem Schließen bleibt die Buchrückseite für die Rückgabe geöffnet. Rückgabe und Escape stellen den Fokus auf das gewählte Cover zurück. Die Scrollposition des Regals wird erhalten. Bei wenig Bildschirmhöhe scrollt die Beschreibung im Buch, während beide Aktionen sichtbar bleiben.

Geplante Bücher bleiben ausdrücklich Inhaltsübersichten. „Die 24 kleinen Wunder“ führt wie bisher zu den Karten. Buchtexte und Katalogmetadaten sind unverändert. Der direkte Einstieg in die Kompositionsgeschichten bleibt unverändert. Der Buchrückseiten-Modus ist eine optionale Erweiterung des bestehenden Bibliotheksmoduls und wird nur in P02 aktiviert. Dialoge und Ereignisbindungen werden beim Raumwechsel bereinigt.

118 gezielte Tests bestanden. Alle fünf Buchrückseiten auf 320×740, 390×844, 844×390 und 1440×1000 geprüft (20 Fälle): keine horizontale Überbreite, beide Aktionen sichtbar, Titelfokus und Rückkehr zum jeweiligen Cover. Auf 390×844 endet das vollständige Regal bei etwa 606px, ohne Scrollen zur Buchauswahl. Zusätzlich mit direktem Antippen in einem gescrollten Bereich geprüft: Hauptbereich bei 173px vor Öffnen, während der Rückseite und nach Rückgabe. Beide vorhandenen Bücher mit sechs bzw. 13 Kapiteln öffnen im gemeinsamen Leser; Inhaltsübersicht, Kartenroute und direkte Kompositionsgeschichte ebenfalls geprüft. Keine neuen JavaScript-Ausnahmen im abschließenden Browserlauf.

Keine Veröffentlichung. Teezimmer, Musikzimmer, Audioplayer, Intro/Brief, Buchtexte und Musikmetadaten unverändert. Keine neuen Illustrationen oder Buchinhalte erzeugt. Das lokale P02-Raumbild liegt nicht im home-Archiv; die bestehende Medienreferenz bleibt bestehen. Fehlt das Bild, zeigt der kompakte Kopf Titel und Beschreibung auf ruhigem Hintergrund. Echte iPhone-/Safari-Prüfung bleibt offen.


## LIBRARY02a · Buchbeschreibung (v0.6.1, 06.11.2026)

Der Verweis auf die 24 Kompositionsgeschichten wurde aus der Beschreibung von „Wie ich Welten aus Klang erschaffe“ entfernt. Die Geschichten bleiben im Musikzimmer eigenständig zu entdecken. Keine neuen Bücher, Buchtexte oder Navigationswege; keine Veröffentlichung. 16 bestehende gezielte Prüfungen bestanden; die aktualisierte Rückseite wurde mobil im Browser geprüft.

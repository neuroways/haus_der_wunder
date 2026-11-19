EMFD-DEV-BOOK-01 · Begehbares Bilderbuch

1. Entwicklungsauftrag

Übernimm die technische Weiterentwicklung der bestehenden PWA „Ein Moment für dich · Das Haus der kleinen Wunder“.

Die Anwendung wird von einer komplexen räumlichen Rundgangslösung zu einem interaktiven, begehbaren Bilderbuch weiterentwickelt.

Die zentrale Botschaft bleibt:

Du darfst ankommen, ohne dich verändern zu müssen.

Das Haus ist ein freiwillig erkundbarer Rückzugsort. Es gibt keinen Spielzwang, keine verpflichtenden Aufgaben, keine Fortschrittspflicht und keine automatisch startende Musik.

2. Verbindliche Arbeitsgrundlage

Arbeite SERVER-FIRST.

* Ermittle zunächst den tatsächlich aktuellen produktiven Stand unter https://flowisaurus.de/wunderhaus/home/.
* Gleiche diesen mit dem verfügbaren Entwicklungsbestand ab.
* Verwende nicht automatisch das ältere Archiv v0.6.56 als Entwicklungsbasis.
* Inventarisiere bestehende Funktionen, Komponenten und Medien.
* Erhalte alle bestehenden Inhalte, Nutzerdaten und funktionsfähigen Module.
* Dokumentiere Abweichungen zwischen Produktivstand und Entwicklungsbestand.
* Entwickle zunächst in einer separaten Testversion.

3. Parallele Bildproduktion

Die vollständige Bildentwicklung wurde separat an ChatGPT Work übergeben.

Die neuen Raumillustrationen, Gegenansichten, Objektstudien und Animationsebenen befinden sich noch in Produktion.

Die technische Entwicklung darf dadurch nicht blockiert werden.

Verwende austauschbare Platzhalter für:

* Raumillustrationen
* Gegenansichten
* Objektbilder
* Player-Nahansichten
* Lichtmasken
* Animationsebenen
* Detailansichten
* Noch nicht verfügbare Raumdurchblicke

Platzhalter erhalten bereits die endgültig vorgesehenen Medien-IDs und Seitenverhältnisse.

Erzeuge keine konkurrierenden neuen Bildmaster. Die Bildproduktion bleibt Aufgabe des parallelen Medienprojekts.

Ein späterer Austausch von Platzhaltern gegen freigegebene Medien muss ohne Änderung des Anwendungscodes möglich sein.

4. Visuelles Grundkonzept

Jeder Raum besteht aus einer oder zwei festen malerischen Widescreen-Illustrationen.

Designrichtung:

* Scottish Enchanted Cottage
* Natural Magic
* Cozy Enchanted Fantasy
* Midnight Blue & Golden Teal
* Warmes goldfarbenes Licht
* Natürliche Materialien
* Ruhige, hochwertige Bedienoberfläche

Verwende die vorhandene Design-DNA und das bestehende Designsystem.

Die Illustration bildet die primäre interaktive Oberfläche des Raums.

Keine vollständige 3D-Simulation, keine künstlichen 360°-Panoramen und keine kontinuierliche Kameradrehung.

5. Responsive Bilddarstellung

Jeder Bildmaster verwendet grundsätzlich das Format 16:9.

Smartphone im Hochformat:

* Drei überlappende Bildabschnitte: links, Mitte, rechts.
* Horizontale Wischbewegung.
* Drei definierte Einrastpositionen.
* Alternative Steuerung über Pfeile.
* Sichtbare Orientierung über Positionsindikatoren.
* Vermeidung abgeschnittener wesentlicher Interaktionsflächen.

Tablet und PC:

* Vollständige Widescreen-Darstellung bei ausreichend verfügbarer Fläche.
* Responsiver Wechsel zur Ausschnittdarstellung, wenn erforderlich.
* Optional gespeicherte Darstellungspräferenz.

Die drei Ausschnitte verwenden denselben Bildmaster. Es werden keine separaten Smartphone-Bilddateien benötigt.

Alle Hotspots und Animationsebenen verwenden normalisierte Koordinaten des Masterbildes.

6. Drei unterschiedliche Navigationsarten

Umschauen

Horizontale Bewegung innerhalb einer einzelnen Illustration.

Umdrehen

Wechsel zwischen zwei festen Blickrichtungen desselben Raums.

* Sanfte Überblendung.
* Keine simulierte 360°-Rotation.
* Nur anzeigen, wenn eine Gegenansicht verfügbar oder im Test vorgesehen ist.
* Raumzustände bleiben erhalten.
* Passenden Bildabschnitt anhand der Szenenkonfiguration bestimmen.

Weitergehen

Interaktion mit einer Tür, einem Durchgang oder einer Treppe.

* Wechsel in die zugehörige Raumansicht.
* Herkunftsabhängige Wahl der Blickrichtung und des Bildabschnitts.
* Gegenseitige, nachvollziehbare Raumanschlüsse.
* Immer eine alternative Orientierung über die Hausübersicht anbieten.

7. Versionsplanung

v0.7 – Erste begehbare Hausgruppe

EXT – Eingang und Außengarten
H00 – Halle
KUE – Küche
P05 – Innenhof
P08 – Teezimmer

Zehn Haupt- und Gegenansichten sowie eine vorgesehene Kartentisch-Nahansicht.

v0.8 – Vollständiges Erdgeschoss

P03 – Wintergarten
M01 – Musikzimmer
P04 – Atelier

v0.9 – Obergeschoss und Rückzugsorte

P06 – Galerie
P07 – Dachterrasse
P02 – Bibliothek
P01 – Fensterzimmer
SCH – Schlafzimmer
BAD – Badezimmer

v1.0 – Vollständiges Haus

14 Erlebnisbereiche einschließlich Außengarten, 24 Orakelobjekte und 11 lokale Musikgeräte gemäß aktuellem Planungsregister.

Weitere Räume und Bildansichten müssen durch Konfiguration ergänzt werden können, ohne neue individuelle Raumkomponenten entwickeln zu müssen.

8. Szenenplanung v0.7

EXT-C01 – Eingangsfassade

Interaktionen:

* Haustür: Halle betreten.
* Außenlaterne: Licht ein- und ausschalten.
* Eingangsglocke: Läuten und Musikbereich öffnen.
* Grüner Brief: Bestehende Umschlaganimation öffnen.
* Bodenlaternen: Separate Lichtzustände.
* Umschauen.
* Umdrehen zu EXT-C02.
* Hilfe und freiwilliges Tutorial.

EXT-C02 – Gartenblick

Interaktionen:

* O09 Gartentor: Objekt und zugehörige Karte entdecken.
* O15 Brücke: Objekt und zugehörige Karte entdecken.
* Vorhandene Gartenlaternen: Lichtsteuerung.
* Umdrehen zu EXT-C01.
* Tutorialfunktion Umdrehen.

Die Eingangsglocke ist das gemeinsame Musikgerät des Außenbereichs. Die Musik läuft beim Blickrichtungswechsel weiter.

H00-C01 – Halle, Nordblick

Interaktionen:

* Küche betreten.
* Innenhof betreten.
* Teezimmer betreten.
* Treppe zur Galerie.
* O08 Laterne betrachten.
* Lichtquellen ein- und ausschalten.
* Umdrehen zu H00-C02.

H00-C02 – Halle, Südblick

Interaktionen:

* Haustür: Zum Außenbereich zurückkehren.
* Teezimmer betreten.
* Treppe zur Galerie.
* Lichtquellen ein- und ausschalten.
* Umdrehen zu H00-C01.

Die Halle besitzt einen gemeinsamen Raumzustand über beide Ansichten.

KUE-C01 – Küche, Blick zur Halle

Interaktionen:

* Hallentür.
* O10 Samen.
* O24 Schräge Tasse.
* Lichtquellen.
* Umdrehen zu KUE-C02.

KUE-C02 – Küche, Blick zum Radio

Interaktionen:

* Röhrenradio ein- und ausschalten.
* Sichtbare Orakelobjekte.
* Lichtquellen.
* Umdrehen zu KUE-C01.

Das Radio ist ein eigenständiger Wiedergabemodus der gemeinsamen Audio-Engine.

P05-C01 – Innenhof, Nordblick

Interaktionen:

* Musikzimmer betreten.
* Atelier betreten.
* Wintergarten betreten.
* Wendeltreppe zur oberen Ebene.
* O14 Holzbank.
* O21 Tanz der Blätter.
* Hofwindspiel.
* Lichtquellen.
* Umdrehen zu P05-C02.

P05-C02 – Innenhof, Südblick

Interaktionen:

* Hallenzugang.
* Wintergartenzugang, sofern sichtbar.
* Wendeltreppe.
* Hofbaum und weitere sichtbare Originalobjekte.
* Lichtquellen.
* Umdrehen zu P05-C01.

Die genaue Position der Hotspots richtet sich später nach den finalen Illustrationen. Maßgeblich ist die aktualisierte Hofplanung v0.5.

P08-C01 – Teezimmer, Kartentisch

Interaktionen:

* Hallenzugang.
* Wintergartenzugang.
* Kartenstapel.
* Aktuelle Begleiterkarte.
* Gedankenblatt.
* Porzellanspieluhr.
* Lichtquellen.
* Umdrehen zu P08-C02.

P08-C02 – Teezimmer, Sitzbereich

Interaktionen:

* O04 Originalkissen.
* Kachelofen mit Feuerzustand.
* Lichtquellen.
* Hallenzugang, sofern sichtbar.
* Sichtbare gemeinsame Gegenstände.
* Umdrehen zu P08-C01.

P08-D01 – Kartentisch-Nahansicht

Interaktionen:

* Zufällige Begleiterkarte ziehen.
* Vorhandene Karte erneut ansehen.
* Kartenanimation öffnen.
* Gedankenblatt öffnen.
* Kartenbezogene Inhalte und Reflexionsfragen öffnen.
* Zum Teezimmer zurückkehren.

9. Freiwilliges Tutorial

Das Tutorial wird vollständig in den Außenbereich integriert.

Die Benutzerin kann vor dem Betreten des Hauses sämtliche wesentlichen Navigationsprinzipien ausprobieren.

Tutorialfunktionen:

1. Links und rechts umschauen.
2. Außenlaterne ein- und ausschalten.
3. Eingangsglocke betätigen.
4. Musik bewusst starten und stoppen.
5. Grünen Brief öffnen.
6. Umdrehen zum Gartenblick.
7. Erneut umdrehen zur Eingangsfassade.
8. Hilfe aufrufen.
9. Haustür öffnen und Haus betreten.

Die Hinweise erscheinen kontextbezogen am jeweiligen Gegenstand.

Es gibt keine verpflichtende Reihenfolge und keinen erzwungenen Abschluss. Alle Funktionen bleiben unabhängig vom Tutorial erreichbar.

Der Tutorialzustand darf gespeichert werden. Eine Wiederholung muss über die Hilfe möglich bleiben.

10. Musik und gemeinsame Audio-Engine

Erhalte die vorhandenen Musikfunktionen.

Alle lokalen Musikgeräte verwenden eine gemeinsame Audio-Engine.

Es dürfen niemals unbeabsichtigt mehrere Musikstücke gleichzeitig laufen.

Für v0.7 sind vier Musikgeräte vorgesehen:

MP-EXT – Eingangsglocke

* Kurze Glockenanimation.
* Optionaler einzelner Glockenton.
* Musikbereich öffnen.
* Hauptthema und Kompositionen O09 und O15 anbieten.
* Kein automatischer Beginn der Kompositionen.

MP-KUE – Röhrenradio

* Ausschließlich ein- und ausschalten.
* Beim Einschalten zufällig ein Musikstück beginnen.
* Nach Ende automatisch ein weiteres Stück auswählen.
* Vorgeschlagen: alle 24 Kompositionen in gemischter Reihenfolge ohne unmittelbare Wiederholung.
* Keine Titelauswahl.
* Keine Vor- oder Zurückfunktion.
* Keine Playlistanzeige am Objekt.
* Frequenzskala im eingeschalteten Zustand beleuchten.
* Beim Ausschalten Musik beenden und Licht der Skala deaktivieren.
* Bestehende globale Lautstärke- und Stoppmöglichkeiten bleiben verfügbar.

MP-P05 – Hofwindspiel

* Vorhandene Originalebenen wiederverwenden.
* Sanfte Pendelanimation.
* Zugehörige Musik aus der bestätigten Raumzuordnung anbieten.

MP-P08 – Porzellanspieluhr

* Bestehende Geräteidentität erhalten.
* Vorhandene Playerfunktionen weiterverwenden.
* Fehlende Animationsebenen zunächst durch Platzhalter repräsentieren.

Laufende Musik bleibt grundsätzlich bei Raum- und Blickrichtungswechseln erhalten.

Die genaue Musikzuordnung der älteren Räume ist vor Änderungen mit der bestehenden Musikmap abzugleichen.

11. Bestehende Kartenfunktionen

Vorhandene Kartenmodule erhalten und wiederverwenden:

* Alle 24 Orakelkarten.
* Kartenrückseiten.
* Umdrehanimation.
* Neigebewegung.
* Vergrößerung.
* Kategorien.
* Impulse.
* Reflexionsfragen.
* Vertiefungstexte.
* Geschichten und Lesebuch.
* Zufällige Kartenauswahl.
* Gezielte Kartenauswahl.
* Zugehörige Musik und Kompositionsgeschichten.

Ein Orakelobjekt im Haus verweist auf die passende Karte.

Das Entdecken eines Gegenstands darf die aktuelle Begleiterkarte nicht automatisch ersetzen.

12. Begleiterbereich und Gedankenblatt

Die bisherige Tageskarte wird konzeptionell zur Begleiterkarte.

* Sie bleibt erhalten, bis bewusst eine andere Karte gewählt oder gezogen wird.
* Kein automatischer Wechsel um Mitternacht.
* Die aktuelle Karte ist aus jedem Raum erreichbar.
* Gedankenblatt frei oder kartenbezogen öffnen.
* Vorhandene Exportfunktionen für PNG und PDF erhalten.
* QR-Code und Rückkehrlink erhalten.
* Bestehende Notizen und gespeicherte Daten schützen.
* Bekannten Layoutfehler bei langen PDF-Exporten prüfen.

Keine vollständige Neuentwicklung des vorhandenen Gedankenblattmoduls.

13. Globale Navigation

Vorgesehene Hauptbereiche:

* Haus
* Karten
* Musik
* Begleiter

Ergänzend:

* Hilfe
* Einstellungen
* Raumübersicht
* Darstellungspräferenzen
* Reduzierte Animationen
* Ruhemodus

Beim Wechsel zu Karten, Musik oder Begleiter bleibt der zuletzt besuchte Raum einschließlich Blickrichtung und Bildabschnitt gespeichert.

14. Licht- und Animationssystem

Jede interaktive Lichtquelle erhält eine feste ID.

Dieselbe physische Lichtquelle muss in mehreren Ansichten denselben Zustand besitzen.

Unterstützte Medien:

* Statisches Grundbild.
* Lichtmaske.
* Glühebene.
* Ausgeschalteter Zustand.
* Animierter Gegenstand.
* Transformationsursprung und Bewegungskonfiguration.

Fehlende Ebenen werden durch klar gekennzeichnete Testplatzhalter oder eine reversible Testdarstellung repräsentiert.

Keine verpflichtenden Animationen, kein starkes Blinken und keine unkontrollierten Dauereffekte.

Systemeinstellung prefers-reduced-motion berücksichtigen.

15. Wiederverwendbare Szenenkomponente

Entwickle eine zentrale Szenenkomponente für sämtliche Räume.

Unterstützte Interaktionstypen:

* NAVIGATION
* PAN_VIEW
* VIEW_SWITCH
* LIGHT
* FIRE
* ORACLE_OBJECT
* MUSIC_DEVICE
* RADIO_TOGGLE
* CARD_DECK
* COMPANION_CARD
* NOTE
* LETTER
* DETAIL_VIEW
* HELP

Jede Szene wird über ein Datenregister konfiguriert.

Die Konfiguration definiert:

* Raum-ID.
* Ansichts-ID.
* Medien-ID.
* Bildseitenverhältnis.
* Platzhalter.
* Gegenansicht.
* Drei Bildabschnitte.
* Eingangsabhängige Startposition.
* Hotspot-Geometrie.
* Verknüpfte Objekt-ID.
* Zielszene.
* Licht-ID.
* Musikgeräte-ID.
* Tutorialzuordnung.
* Barrierefreie Beschriftung.
* Medienstatus.

Die konkreten Dateinamen der fertigen Bilder dürfen nicht fest in der Szenenlogik hinterlegt sein.

16. Medienstatus

Unterscheide verbindlich:

* PLACEHOLDER
* DRAFT
* REVIEW
* APPROVED
* INTEGRATED
* VERIFIED

Ein vorhandenes Bild ist nicht automatisch freigegeben.

Ein freigegebenes Bild ist nicht automatisch integriert.

Eine integrierte Funktion gilt erst nach einem tatsächlichen Test als verifiziert.

17. Barrierefreiheit

* Echte UI-Bedienelemente statt ausschließlich unsichtbarer Bildinteraktionen.
* Beschriftete Alternativen für alle wichtigen Hotspots.
* Ausreichend große Touchbereiche.
* Tastaturbedienbarkeit.
* Screenreader-Beschriftungen.
* Kein Zwang zur Wischgeste.
* Kein Zwang zu Animationen.
* Kein automatischer Musikbeginn.
* Kein verpflichtendes Tutorial.
* Ruhige, vorhersehbare Raumwechsel.

18. Entwicklungsreihenfolge

1. Ist-Stand und aktuelle Versionsbasis prüfen.
2. Bestehende Komponenten und Funktionen inventarisieren.
3. Datenregister für Räume, Szenen, Objekte und Medien anlegen.
4. Zentrale Szenenkomponente entwickeln.
5. Responsive Bildabschnitte umsetzen.
6. Umdrehen und Raumwechsel umsetzen.
7. Außenbereich und Tutorial entwickeln.
8. Halle, Küche, Innenhof und Teezimmer mit Platzhaltern integrieren.
9. Vorhandene Karten-, Musik- und Notizmodule anbinden.
10. Lichtzustände und Player-Schnittstellen integrieren.
11. Radiofunktion entwickeln.
12. Begleiterbereich vervollständigen.
13. Testversion erstellen.
14. Regressions- und Gerätetests durchführen.
15. Medienintegration für die später gelieferten Originalbilder vorbereiten.

19. Abnahmekriterien

Die erste technische Testversion muss bereits ohne finale Illustrationen funktionieren.

Folgende Funktionen müssen überprüfbar sein:

* Vollständige Navigation der verfügbaren Hausgruppe.
* Drei Smartphone-Bildabschnitte.
* Wechsel zwischen zwei festen Blickrichtungen.
* Herkunftsabhängiger Raumeinstieg.
* Funktionierendes freiwilliges Tutorial.
* Lichtzustände bleiben erhalten.
* Musik läuft kontrolliert über eine gemeinsame Audio-Engine.
* Radio spielt zufällig und besitzt nur Ein/Aus am Objekt.
* Briefanimation funktioniert.
* Kartenfunktionen bleiben vollständig erhalten.
* Begleiterkarte bleibt gespeichert.
* Gedankenblatt und Exportfunktionen bleiben verfügbar.
* Platzhalter sind zentral durch echte Medien ersetzbar.
* Noch nicht entwickelte Räume verursachen keine defekten Navigationselemente.
* Smartphone-, Tablet- und PC-Darstellung sind nutzbar.

20. Erwartete Entwicklungsübergabe

Liefere:

* Ist-Stand-Analyse.
* Technisches Umsetzungskonzept.
* Szenen- und Medienregister.
* Änderungsübersicht aller betroffenen Dateien.
* Eigenständig nutzbare Testversion.
* Vollständiges Änderungspaket.
* Testprotokoll.
* Liste tatsächlich getesteter Funktionen.
* Offene technische Aufgaben.
* Liste fehlender Medien.
* Schnittstellenbeschreibung für die Bildproduktion.
* Integrations- und Rückfallstrategie.

Keine Aufgaben lediglich als erledigt markieren, ohne sie tatsächlich umgesetzt und geprüft zu haben.

Keine eigenmächtige Veröffentlichung auf dem produktiven Server.

Die technische Entwicklung beginnt jetzt mit Platzhaltern. Die finale Bildproduktion und Medienfreigabe laufen unabhängig davon parallel.

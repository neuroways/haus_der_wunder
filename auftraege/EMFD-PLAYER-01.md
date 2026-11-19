EMFD-PLAYER-01 · Gemeinsamer Geräteplayer

Version 1.0 · 19.11.2026 · technische Basis v0.6.66 + abgenommener NAV-01
Status: Entwicklungsauftrag zur Masterfreigabe; Paket C enthält neue, ausdrücklich auszuweisende Planungsentscheidungen. Keine Implementierung oder Veröffentlichung in diesem Dokument.

1. Ziel und Quellen

Acht adressierbare Gerätestationen mit einheitlicher Bedienung, bewusster Musikauswahl, Titel/Cover, Geschichte und zugänglichen Wiedergabezuständen. Vorhandenen zentralen Audioplayer, Steuerung, Lautstärkedialog und Geschichtenleser wiederverwenden. Grundlage: Claude-Code-Rückmeldungen v0.6.66, Entscheidungsvorlage v1.2, EMFD-NAV-01 und EMFD-INT-01. Repository und gegebenenfalls neuere Integrationsbasis vor Umsetzung prüfen.

2. Geräte- und Playlistregister (unverändert, Reihenfolge erhalten)

|Raum             |Gerät           |Stationsadresse  |Stücke         |
|-----------------|----------------|-----------------|---------------|
|P01 Fensterzimmer|Fensterdose     |#ort/P01/geraet  |O01,O02,O22    |
|P02 Bibliothek   |Musikschatulle  |#ort/P02/geraet  |O03,O18,O16    |
|P03 Wintergarten |Klangschale     |#ort/P03/geraet  |O21,O13,O10,O05|
|P04 Atelier      |Atelier-Spieluhr|#atelier/geraet  |O07,O11,O12    |
|P05 Innenhof     |Windspiel       |#ort/P05/geraet  |O09,O14,O15    |
|P06 Galerie      |Klangkästchen   |#ort/P06/geraet  |O08,O15,O16,O19|
|P07 Dachterrasse |Windharfe       |#ort/P07/geraet  |O20,O17,O23    |
|P08 Teezimmer    |Teespieluhr     |#teezimmer/geraet|O24,O04,O06    |

26 Zuordnungen, 24 verschiedene Stücke; O15 und O16 bewusst doppelt. Keine Änderung an Titel, Kategorie, Audio oder Texten.

3. UX und Stationsrouting

• PLA-D01/11/14: Raumaktion „[Gerät] ansehen“ öffnet Station, ohne Wiedergabe zu starten, zu wechseln oder fortzusetzen. Direktlink und Reload liefern sichere stille/bereite Ansicht, kein Autoplay; laufendes Audio derselben Sitzung nicht allein durch erneutes Rendern stören. Separater expliziter Start einer Playlist/eines Stückes. Bestehende ausdrücklich als Abspielen bezeichnete Aktionen dürfen weiterhin bewusst Musik starten, sofern sie nicht mit der reinen Annäherung verwechselt werden.
• PLA-D02/09: ein Audioplayer, eine wiederverwendbare Steuerung (vorheriges Stück, Start/Pause, Stopp, nächstes Stück, Wiederholen; vorhandene Semantik erhalten). Lautstärke über gemeinsamen Dialog; Bedienung gerätenamenspezifisch beschriften (PLA-D13).
• PLA-D03/05/10/12: Cover, Titel, Kategorie, Textstatus, Steuerung und Stückliste zugänglich anzeigen. Vorhandener expliziter Coverpfad hat Vorrang, andernfalls Kartenvorderseite. Fehlende Bilder mit neutralem Platzhalter und Titel; kein erfundener Pfad. Bereits laufendes anderes Audio nicht als Aktivität des betrachteten Geräts ausgeben. Erst bewusster Start bindet die Wiedergabe an dieses Gerät.
• PLA-D04/15/16: „Geschichte lesen“ öffnet den bestehenden Leser als Buchdialog über der Gerätestation, unabhängig von Audio. Keine Navigation ins Musikzimmer, keine doppelte Textquelle. Schließen stellt Stationsansicht und Fokus wieder her. Bestehende #musik/geschichten/…-Adressen bleiben unverändert funktionsfähig. Dialog per Tastatur schließbar; Fokus sinnvoll begrenzen, Hintergrund nicht bedienbar, Rückkehr zum Auslöser.
• PLA-D06/08: lokale Ansichtswechsel unterbrechen Audio nicht. Funktion vollständig ohne Ton, Farbe und Animation verständlich. Responsiv: Bild und Steuerung auf kleinen Geräten untereinander, bei ausreichend Platz nebeneinander; nicht beschneiden oder strecken; keine neue Nahumgebung vortäuschen.

4. Architekturvertrag: räumlicher, Ansichts- und Wiedergabekontext

Räumlicher Kontext (Ort/Ordnungsbereich) unabhängig von Route und Audioquelle. Eigene Bereiche: P01–P08, Flur, Alle Räume, Musikzimmer, Ankommen. Gerätestationen und Musikzimmer-Unteransichten gehören zu ihren jeweiligen Orten; Galerie, Einzelkarte, Geschichten, Gedankenblatt, Hilfe und Musikdialog erben den letzten gültigen räumlichen Kontext, sofern kein ausdrücklicher Ortswechsel erfolgt. Ein ortsungebundener Direktaufruf ohne Herkunft erfindet keinen Raum. Neue Räume später über Register erweiterbar, nicht hardcodierte Sonderfälle für jedes Gerät.

Wiedergabekontext speichert mindestens Quellenart (Hintergrund, Karte, Raumgerät, Musikzimmer), Bindung (hausweit/raumgebunden), ggf. Ursprungsraum, Stück-ID, Playlist-Identität und bestehenden Playerzustand. Feldnamen sind Umsetzungsvorschläge, vorhandenes Datenmodell bevorzugen. Bei gleicher Stück-ID aus anderer Quelle muss eine bewusste Startaktion den neuen Kontext korrekt setzen. Route oder aktuell betrachtetes Gerät darf die Bindung nicht nachträglich überschreiben.

|Musikquelle                                    |Bindung      |tatsächlicher Ortswechsel|
|-----------------------------------------------|-------------|-------------------------|
|bewusst gewählte Hintergrundmusik beim Ankommen|hausweit     |weiter                   |
|bewusst auf einer Karte gestartetes Stück      |hausweit     |weiter                   |
|P01–P08-Geräte                                 |Ursprungsraum|Pause beim Verlassen     |
|Grammophon/Plattensammlung                     |Musikzimmer  |Pause beim Verlassen     |

PLA-D07a–i: Keine Übergangsgeräusche. Hausweite Musik läuft durch; raumgebundene Musik pausiert bei Wechsel vom Ursprungsraum in einen anderen Ort/Ordnungsbereich, auch über Logo, Übersicht, Browser-History oder eine zwischenzeitlich geöffnete Karte. Kein automatisches Fortsetzen bei Rückkehr. Kein paralleles Audio. Bewusster Start einer anderen Quelle ersetzt aktuelle Wiedergabe; Stopp startet keine frühere Hintergrundmusik. Lokale Navigation, Dialoge, Gerätebetrachtung und Geschichten ändern die Wiedergabe nicht. Globale Steuerung bleibt erreichbar; ein bewusstes Fortsetzen außerhalb des Ursprungsraums ist für diesen Auftrag als sichere Variante nicht vorgesehen (zur Freigabe: Rückkehr zum Ursprungsgerät anbieten; hausweite Musik bleibt überall steuerbar). Manuelles Pause/Stopp bleibt überall möglich. Bei unbekannten weiteren Startquellen keine stillschweigende Klassifizierung: im Integrationsbericht dokumentieren und klären.

5. Zustandsmodell

|Zustand        |Anzeige/Bedienung                                                        |
|---------------|-------------------------------------------------------------------------|
|Still          |Keine aktive Stückwahl für dieses Gerät; Auswahl möglich                 |
|Bereit         |Stück gewählt, Titel/Cover, Start verfügbar                              |
|Lädt           |Textstatus, Stopp möglich, keine falsche Spielanzeige                    |
|Spielt         |tatsächliche Playerwiedergabe dieses Geräts, Pause/Stopp                 |
|Pausiert       |Textstatus, bewusst fortsetzen, Position erhalten                        |
|Beendet        |Textstatus, erneut starten nach bestehender Playlist-/Repeat-Semantik    |
|Nicht verfügbar|verständlicher Text, andere Stücke weiterhin erreichbar, kein Endlosladen|

Zustand aus tatsächlichen Audioereignissen ableiten (auch Ladefehler/play()-Ablehnung); keine zweite unabhängige Audiozustandsmaschine pro Raum. Bei schnellen Quellenwechseln veraltete Ereignisse ignorieren. Automatischer Titelwechsel und Wiederholung nur im Rahmen bewusst gestarteter vorhandener Playlistregeln; keine durch Navigation ausgelöste Wiedergabe. In PLAYER-01 bleibt Gerätebild statisch; keine Bewegungsproduktion.

6. Medientabelle

|ID                      |Datei/Quelle                                                        |Status                        |Format/Geometrie                                            |
|------------------------|--------------------------------------------------------------------|------------------------------|------------------------------------------------------------|
|P01                     |media/raumgeraete/P01.webp                                          |vorhanden laut Claude         |WebP; Ist-Maße/Seitenverhältnis/Alpha prüfen                |
|P02                     |media/raumgeraete/P02.webp                                          |vorhanden laut Claude         |wie P01                                                     |
|P03                     |media/raumgeraete/P03.webp                                          |vorhanden laut Claude         |wie P01                                                     |
|P04                     |media/raumgeraete/P04.webp                                          |vorhanden laut Claude         |wie P01                                                     |
|P05                     |media/raumgeraete/P05.webp                                          |vorhanden laut Claude         |wie P01                                                     |
|P06                     |media/raumgeraete/P06.webp                                          |vorhanden laut Claude         |wie P01                                                     |
|P07                     |media/raumgeraete/P07.webp                                          |vorhanden laut Claude         |wie P01                                                     |
|P08                     |media/raumgeraete/P08.webp                                          |vorhanden laut Claude         |wie P01                                                     |
|O04,O06,O24             |vorhandene eigene Musikcover, konkrete Pfade aus Repository         |vorhanden laut Claude         |Ist-Format/Maße prüfen                                      |
|O01–O03,O05,O07–O23     |vorhandene Kartenvorderseiten, Pfade aus Kartenregister             |Ersatzcover                   |natives Format proportional anzeigen                        |
|P01–P08 Nahumgebung     |je ein wiedererkennbarer Ausschnitt desselben Gerätestandorts       |fehlt im Repository; PLAYER-02|WebP vorgesehen, Maße/Ratio nach Kameraplan und Assetprüfung|
|P01–P08 bewegliche Teile|gerätespezifische Ebenen mit Drehpunkt/Anker; keine Ersatzgeräte    |nicht nachgewiesen; PLAYER-02 |Transparenz, Maße/Ratio nach Originalstudie                 |
|21 weitere eigene Cover |quadratische Musikcover je Stück, externe Bestände zuerst abgleichen|fehlt im Repository; PLAYER-02|1:1, WebP vorgesehen; tatsächliche Maße offen               |

Die acht vorhandenen Gerätebilder in das zentrale Medienmanifest aufnehmen; vorhandene Cover-/Karteneinträge und Offline-/Cache-Verhalten prüfen, keine doppelten Assets oder erfundenen Pfade. Alle Maße und exakten Pfade im Umsetzungsbericht nachtragen. Keine neuen Mediendateien für PLAYER-01 erforderlich; Manifeständerung ist eine Code-/Metadatenänderung.

7. Abnahme und Regression

|ID |Test                                                                     |Erwartung                                                              |
|---|-------------------------------------------------------------------------|-----------------------------------------------------------------------|
|P01|alle acht Raumaktionen öffnen                                            |korrekte Station, kein Autoplay                                        |
|P02|alle acht Direktlinks und Reload                                         |korrekte Station, sicherer Rückweg zum Raum                            |
|P03|Raum → Gerät → App-Zurück → Browser-Zurück/Vorwärts                      |NAV-01-Verhalten, keine Schleife                                       |
|P04|Playlistregister vergleichen                                             |exakt 26 Einträge, O15/O16 doppelt, Reihenfolge unverändert            |
|P05|Hintergrundmusik → Flur → Räume/Übersicht                                |läuft weiter, keine Türgeräusche                                       |
|P06|Raumgerät starten → Raumansicht → Karte/Galerie/Dialog                   |spielt weiter                                                          |
|P07|P06 → anderer Ort über Übersicht/Logo/History                            |pausiert, Rückkehr startet nicht automatisch                           |
|P08|Grammophon und Plattensammlung je separat starten → Musikzimmer verlassen|pausiert, keine automatische Wiederaufnahme                            |
|P09|auf Karte starten → andere Räume                                         |läuft weiter                                                           |
|P10|dasselbe Stück über Karte und Gerät jeweils bewusst starten              |richtige neue Bindung, keine parallele Wiedergabe                      |
|P11|Hintergrund aktiv → Gerät ansehen → Gerät starten → Stopp                |erst weiter, dann ersetzt, anschließend still                          |
|P12|Geschichte bei laufender/pausierter/stiller Wiedergabe öffnen/schließen  |Buchdialog, keine Ortsänderung, unveränderter Audiostatus, Fokus zurück|
|P13|bestehende Geschichtenlinks im Musikzimmer                               |weiterhin nutzbar                                                      |
|P14|Start/Pause/Stopp/Weiter/Zurück/Repeat/Lautstärke                        |gemeinsame Steuerung konsistent, richtiger Gerätename                  |
|P15|fehlende Audiodatei, Ladefehler, abgelehnte Wiedergabe, schneller Wechsel|korrekter Status, kein Endlosladen, kein veralteter Zustand            |
|P16|drei eigene Cover und 21 Ersatzcover, fehlendes Bild                     |vorhandene Cover bevorzugt, sauberer Fallback                          |
|P17|reduzierte Bewegung, stumm, Graustufen, Screenreader, Tastatur           |vollständige Verständlichkeit und Bedienbarkeit                        |
|P18|Smartphone hoch/quer, Tablet, Desktop                                    |proportionales Bild, erreichbare Steuerung und Liste                   |
|P19|fremdes Gerät während anderer Wiedergabe betrachten                      |keine falsche Spielanzeige oder ungewollte Quellenänderung             |
|P20|tatsächliche neue Raumverbindung, sobald verfügbar                       |gleiche Ortswechselregel; bis dahin nicht getestet                     |
|P21|globaler Pause-/Stoppzugriff außerhalb Ursprungsraum                     |jederzeit möglich; Fortsetzen gemäß freigegebener Regel                |

8. Abgrenzung und Auslieferung

Keine Begleiterkarte, keine neuen Raumverbindungen, keine neuen Nahumgebungen, Animationen, Geräteidentitäten, Coverproduktionen oder Karteninhalte. Keine neue Audioengine. PLAYER-02 bleibt separate Medienintegration nach Bestandsabgleich. Zentral integrieren; vollständiges home/-ZIP, media/-ZIP nur bei tatsächlich neuen/geänderten Medien (sonst kein Archiv nötig), konkrete Dateiliste, Diffs, Versionsstand, Medienmanifest, Testbericht mit bestanden/fehlgeschlagen/nicht getestet/blockiert. Kein Deployment ohne gesonderte Freigabe. Regression von Ankommen, Karten, Atelier, Teezimmer, Musikzimmer, Geschichten, Gedankenblatt, QR-Links und Navigation nachweisen.

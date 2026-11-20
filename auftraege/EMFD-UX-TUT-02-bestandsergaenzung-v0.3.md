EMFD-UX-TUT-02 · Bestandsergänzung v0.3

Ergänzung zur vollständigen Tutorialübergabe v0.2 auf Grundlage von docs/BESTAND-EINGANG.md, App v0.6.70.

Umfang

Ersetze den gesamten bisherigen Einstieg einschließlich Haustür, Geschenkablauf, Musikfrage, Starttour und Installationshinweis.

Die fachlichen Funktionen und Inhalte bleiben erhalten. Verändert werden Frontend, Darstellung, Auslöser und Ablauf.

Geschenkbrief und Geschenkkarte

Der grüne Umschlag in EXT-C01 öffnet das vorhandene Briefmodul einschließlich seiner Animationen und Originaltexte.

Die Geschenkkarte mit QR-Rückkehrlink bleibt vollständig erhalten und ist innerhalb des Geschenkbereichs erreichbar.

Die Geschenkkarte ist nicht die Begleiterkarte.

Nach dem Schließen Rückkehr zur ursprünglichen Szene und zum vorherigen Bildabschnitt.

Der Geschenkbereich ist dauerhaft über die Hilfe und den Brief-Hotspot erreichbar.

Musik

Die bisherige Musikentscheidung wird in die Interaktion mit der Eingangsglocke MP-EXT integriert.

Texte:

„Dieses Haus hat seine eigene Musik. Du kannst es mit Musik oder in Stille entdecken.“

Aktionen:

* Hauptthema abspielen
* Mit Musik entdecken
* In Stille entdecken
* Meine Auswahl merken
* Schließen

Verwende die bestehende zentrale Audio-Engine und die bestehenden Musikeinstellungen.

Musikpräferenz und aktueller Wiedergabezustand sind getrennte Zustände.

Keine automatische Musikwiedergabe beim App-Aufruf, Betreten oder Wechseln eines Raums.

Die Brücke vermittelt weiterhin objektbezogene Musik; die Glocke vermittelt die Klangwelt eines Ortes einschließlich des Hauptthemas.

Die Musikentscheidung darf den Hauseintritt nicht blockieren.

Installationshinweis

Integriere die vorhandene Installationsfunktion in Hilfe und Orientierung unter „Das Haus griffbereit“.

Ein einmaliger dezenter Hinweis während der Hilfe-Erklärung ist möglich.

Bestehende Android-/Chrome-Installationsfunktion und iPhone-Anleitung erhalten.

Nach Ablehnung oder Auswahl „Später“ keine wiederholten automatischen Angebote.

Die Funktion bleibt manuell erreichbar.

Erstbesuch und Folgebesuch

Erstbesucher sehen EXT-C01 mit der Haustür im mittleren Ausschnitt beziehungsweise im vollständigen Desktopbild.

Die Einführung beginnt nur nach bewusster Auswahl.

Folgebesucher gelangen wie bisher direkt in den Flur beziehungsweise später in die Halle.

Die vorhandenen Speicherwerte sind rückwärtskompatibel zu übernehmen:

* emfd.start02.gift-completed.v1
* emfd.start02.tutorial-completed.v1
* emfd.start03.intro-completed.v1
* emfd.start02.install-dismissed.v1
* emfd.music.entryPreference
* emfd.house.light.v1

Geschenkstatus, Tutorialstatus, Installationsstatus, Lichtzustand und Musikpräferenz getrennt behandeln.

Ein übersprungenes Tutorial bedeutet nicht automatisch, dass der Brief gelesen wurde.

Keine ungewollte Rücksetzung vorhandener Einstellungen.

Bei fehlendem oder gelöschtem Speicher bleibt die Einführung freiwillig.

Der erneute Aufruf des Tutorials darf andere gespeicherte App-Zustände nicht verändern.

Alte Starttour

Die bisherige automatische Starttour im Flur wird durch das neue Außentutorial ersetzt.

Keine erneute Einführung beim Eintritt in das Haus.

Bestehende Hilfe-Einstiege und alte Verknüpfungen zum Geschenkbereich bleiben funktional.

Übergang ins Haus

Der neue Einstieg muss unabhängig von der Fertigstellung der neuen Halle funktionieren.

Zunächst führt die Haustür in den bestehenden Flur.

Sobald H00-C01 verfügbar und technisch integriert ist, wird das Navigationsziel über die Szenenkonfiguration umgestellt.

Keine parallelen konkurrierenden Flur- und Hallenmodule schaffen.

Bestehende Routen, QR-Links und Deep Links erhalten.

Gemeinsame Bedienbibliothek

Der neue Eingang dient als Referenz für die einheitlichen Bedienelemente des gesamten Hauses.

Erweitere die vorhandene EMFD-UI- und Buttonbibliothek. Erstelle keine zweite Bibliothek.

Definiere:

* Primäre Textbuttons
* Sekundäre Textbuttons
* Iconbuttons
* Bild-Hotspots
* Kontextbezogene Tutorialhinweise
* Umschaupfeile und Positionsindikatoren
* Umdrehen
* Zurück und Schließen
* Hilfe und Orientierung
* Lichtschalter
* Musiksteuerung
* Zustände und globale Navigationselemente

Mindestinteraktionsfläche 44 × 44 CSS-Pixel, bevorzugt 48 × 48.

Alle Komponenten benötigen konsistente Zustände, Beschriftungen, Fokusdarstellung, Tastaturbedienbarkeit und Screenreader-Unterstützung.

Verwende die vorhandene Design-DNA, Farben und Stilvorgaben.

Dokumentiere die Komponenten in einer gemeinsamen UI-Referenzseite für die spätere Wiederverwendung.

Medienschnittstelle

Verwende die referenzierten Originalillustrationen und das vorhandene Hotspot-Register aus v0.2.

Gleiche die Medien-IDs mit EMFD-MEDIA-CORE ab, insbesondere die vorhandenen Kandidaten-IDs.

Fehlende Medien werden durch programmatische Platzhalter dargestellt. Keine eigenständigen konkurrierenden Bildmaster erzeugen.

Brief- und Geschenkkartenmedien aus dem bestehenden Bestand erhalten. Vorhandene Medienpfade mit der Medienkonvention abgleichen.

Desktop

Die Desktop-Storyboard-Übersicht ist ausschließlich Entwicklungsdokumentation.

Die tatsächliche PC-Anwendung verwendet die vollständige Illustration nahezu bildschirmfüllend, mit dezenten kontextbezogenen Bedienelementen.

Keine Seitenleisten, Thumbnail-Reihen, Fortschrittsbalken oder Kursnavigation.

Abnahme

Ergänze den bestehenden Testkatalog insbesondere um:

* Migration der vorhandenen Speicherwerte
* Erstbesuch und Folgebesuch
* Überspringen ohne Verlust des Geschenkzugangs
* Geschenkkarte und funktionierenden QR-Rückkehrlink
* Gespeicherte und nicht gespeicherte Musikentscheidung
* Kein Autoplay nach Navigation oder erneutem App-Aufruf
* Installationsangebot und dauerhafte Ablehnung
* Keine doppelte Starttour im Flur
* Navigation vom neuen Eingang in den bisherigen Flur
* Wiederverwendbarkeit der gemeinsamen UI-Komponenten

Alle vorhandenen App-Funktionen bleiben erhalten.

Vor Umsetzung die fachlichen Ergänzungen gegen den aktuellen Bestand und die bestehenden Repository-Entscheidungen prüfen. Abweichungen dokumentieren und keine widersprüchlichen Funktionen eigenmächtig ersetzen.

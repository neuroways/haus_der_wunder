EMFD-P03-DEV-01 · Wintergarten integrieren

Projekt: Ein Moment für dich · Das Haus der kleinen Wunder
Raum: P03 · Wintergarten
Zielversion: v0.7
Auftrag: Technische Integration der beiden neuen Raumillustrationen einschließlich Navigation, Orakelobjekten, Musikgerät und responsiver Darstellung.

1. Ausgangsbasis

Arbeite auf der aktuellsten ausdrücklich bestätigten Anwendungsversion.

Prüfe vor Änderungen die vorhandene Implementierung von P03, das Raumregister, die gemeinsame Navigation, die Musikengine und die vorhandenen Medien.

Wichtig:

* Keine bestehende Funktion entfernen oder überschreiben.
* Keine parallele Musikengine entwickeln.
* Keine neuen Orakelobjekte erzeugen.
* Bereits vorhandene Komponenten wiederverwenden.
* Globale Änderungen für den zentralen Integrationschat dokumentieren.
* Keine Veröffentlichung ohne Freigabe.

2. Neue Raumillustrationen

Zwei neu erstellte Illustrationen sind als Bildquellen zu integrieren.

Medien-ID	Bildinhalt
P03-C01	Hauptansicht vom Teezimmer in den Wintergarten
P03-C02	Gegenansicht mit Blick zum Teezimmer

P03-C01

* Links: O05, die geschlossene violette Blüte.
* Links hinten: Hoföffnung mit Blick zur Bank O14.
* Mitte: O13, die Wurzel, vor der Natursteinwand.
* Rechts: Klangschale auf einem Holzmöbel.
* Gebogenes Glasdach mit dunkelpetrolfarbenen Metallprofilen.

P03-C02

* Links: Klangschale.
* Mitte: offener Durchgang zum Teezimmer.
* Rechts: Hoföffnung und Bepflanzung.
* Identische Material- und Architekturidentität wie C01.

Die neuen Bilder sind als freigegebene gestalterische Arbeitsgrundlage zu behandeln. Ihre technische und geometrische Konsistenz ist noch zu prüfen.

Die Originaldateien werden separat bereitgestellt. Verwende die tatsächlichen Dateinamen und trage ihre Pfade im Medienregister ein.

3. Raumgeometrie

Übernimm die aktuellen Modellwerte:

Eigenschaft	Wert
Raum-ID	P03
Innenmaß	4,00 × 4,00 m
Geschoss	Erdgeschoss
X	11,60–15,60 m
Y	4,80–8,80 m
Teezimmer	Südseite, offener Durchgang 2,80 m
Innenhof	Westseite, D16
Boden	Naturstein
Dach	Gebogene Glasdachkonstruktion

Die ältere Raumgröße von 4 × 6 m darf nicht wiederhergestellt werden.

Offener Architekturkonflikt: Das Hausmodell definiert D16 als 1,00 m breite Schiebetür. Die jüngere Hofplanung verwendet T05 mit 1,40 m Breite. Bis zur gemeinsamen Architekturfreigabe bleibt die bestehende Modellgeometrie maßgeblich.

Die Illustrationen dürfen diesen Konflikt nicht stillschweigend entscheiden.

4. Responsive Bildnavigation

Verwende die vorhandene Hausnavigation.

Aus den beiden 16:9-Quellen entstehen sechs Smartphoneausschnitte:

Ausschnitt	Schwerpunkt
C01-A1	O05 und Hofdurchblick
C01-A2	O13 und Raumzentrum
C01-A3	Klangschale und Gartenverglasung
C02-B1	Klangschale
C02-B2	Durchgang zum Teezimmer
C02-B3	Hoföffnung

Anforderungen:

* Smartphone: drei horizontale Ausschnitte je Blickrichtung.
* Tablet und Desktop: vollständige Wide-Ansicht, soweit das vorhandene Layout dies erlaubt.
* Wechsel zwischen C01 und C02 über die gemeinsame Raumsteuerung.
* Kein eigenständiges 360°-Panorama.
* Keine Verzerrung oder ungewollte Skalierung der Illustrationen.
* Interaktionsflächen bleiben beim Wechsel zwischen Bildausschnitten korrekt positioniert.
* Vorhandene Wide-Umschaltung weiterverwenden.

Die Eintrittsperspektive ist abhängig vom Herkunftsraum. Eine endgültige Zuordnung erst nach Abgleich der Türpositionen festlegen.

5. Orakelobjekte

O05 · Die geschlossene Blüte

Die Blüte erhält eine interaktive Fläche.

Beim Antippen öffnet sich die vorhandene Orakelkartenfunktion mit den Originalinhalten von O05.

O13 · Die Wurzel

Die Wurzel erhält ebenfalls eine interaktive Fläche.

Beim Antippen öffnet sich die vorhandene Orakelkartenfunktion mit den Originalinhalten von O13.

Für beide Objekte gelten:

* Vorhandene Kartenillustrationen verwenden.
* Bestehende Texte, Fragen und Affirmationen erhalten.
* Begleiterkartenfunktion übernehmen.
* Gedankenblattfunktion unverändert weiterverwenden.
* Keine neue Kartenmechanik implementieren.
* Hotspots an den tatsächlichen Bildpositionen ausrichten.

Die Illustrationen zeigen die Objekte bereits. Es dürfen keine zusätzlichen sichtbaren Objektdarstellungen darübergelegt werden.

6. Musikgerät · Klangschale

Die Klangschale ist der individuelle Musikzugang des Wintergartens.

Integriere sie über die zentrale Musikengine.

Verhalten:

1. Antippen der Klangschale öffnet die vorhandene Musikinteraktion.
2. Musik startet ausschließlich nach bewusster Bedienung.
3. Die vorhandenen finalen Musikcover werden verwendet.
4. Wiedergabe, Pause und Titelwechsel erfolgen über die gemeinsame Musiksteuerung.
5. Beim Raumwechsel pausiert die Musik.
6. Kein automatisches Fortsetzen nach dem Raumwechsel.

Die historische Zuordnung O21/O13/O10/O05 ist noch nicht als produktive Playlist bestätigt.

Prüfe die bestehende Musikzuordnung, bevor du sie veränderst.

Die Klangschale im Bild ist derzeit ein grafischer Platzhalter. Eine separate Geräteanimation oder neue Mechanik wird nicht ohne Originalreferenz entwickelt.

7. Licht und Atmosphäre

Der Wintergarten erhält eine vorbereitete Lichtsteuerung.

Berücksichtige bereits die geplanten Zustände:

* Tageslicht
* Abendlicht
* Nachtlicht

Die aktuelle Illustration stellt warmes Abendlicht dar.

Noch keine vollständige Tag-/Nachtfunktion aktivieren.

Lege lediglich die technische Erweiterungsmöglichkeit im bestehenden Lichtsystem an.

Spätere Interaktionen können beispielsweise das Licht verändern oder einen ruhigen Übergang zwischen den Lichtzuständen auslösen.

Keine automatischen, dauerhaft bewegten Lichteffekte.

8. Gemeinsame Hausfunktionen

Der Wintergarten muss die bereits vorhandenen Funktionen unterstützen:

* Begleiterkarte
* Mäppchen und Inventar
* Geschichtenbuch
* Gedankenblatt
* Zentrale Musiksteuerung
* Hilfe
* Raumnavigation

Diese Funktionen dürfen nicht raumspezifisch dupliziert werden.

Die Bilder selbst enthalten keine zusätzlichen UI-Elemente.

9. Architektur- und Bildprüfung

Prüfe vor Abschluss:

* Stimmen Glasdach, Rippen und Steinwand in beiden Bildern überein?
* Ist der Hofdurchblick plausibel?
* Steht O14 weiterhin ausschließlich im Innenhof?
* Bleibt der Hofbaum O21 auf der Hallenseite?
* Sind O05 und O13 korrekt zugeordnet?
* Bleiben Durchgänge und Bodenflächen frei?
* Ist die Verbindung zum Teezimmer nachvollziehbar?

Erkennbare Abweichungen im Bildmaterial dokumentieren. Keine stillschweigenden geometrischen Änderungen am Hausmodell vornehmen.

10. Technische Abnahme

Teste mindestens:

Test	Erwartetes Ergebnis
Eintritt aus Teezimmer	Wintergarten öffnet sich
Eintritt aus Innenhof	Wintergarten öffnet sich
C01/C02 wechseln	Richtige Ansicht
Smartphoneausschnitte	Alle sechs erreichbar
O05 antippen	Richtige Orakelkarte
O13 antippen	Richtige Orakelkarte
Klangschale antippen	Musikinteraktion öffnet
Musik starten	Nur nach Benutzeraktion
Raum verlassen	Musik pausiert
Begleiterkarte öffnen	Gemeinsame Funktion
Gedankenblatt öffnen	Gemeinsames Modul
Wide-Ansicht	Keine Bildverzerrung

Nicht ausführbare Tests als „nicht getestet“ dokumentieren, nicht als bestanden.

11. Lieferung

Erstelle ein integrationsfähiges Entwicklungspaket:

1. Aktualisierte P03-Raumkomponente und Konfiguration.
2. Medienmanifest mit den tatsächlichen Bildpfaden.
3. Responsive Ausschnittdefinitionen.
4. Hotspot-Koordinaten für O05, O13, Klangschale und Durchgänge.
5. Dokumentation der wiederverwendeten gemeinsamen Komponenten.
6. Prüfbericht mit offenen Architekturkonflikten.

Globale Änderungen nicht ungeprüft in die gemeinsame Anwendung übernehmen.

Für die zentrale Integration die geänderten Dateien und ihre Abhängigkeiten ausdrücklich benennen.

Keine Veröffentlichung und keine Änderung am Live-System.

12. Arbeitsreihenfolge

Arbeite in dieser Reihenfolge:

1. Bestehenden P03-Code und Medienbestand prüfen.
2. Beide neuen Illustrationen einbinden.
3. Responsive Ausschnitte definieren.
4. Raumübergänge und Blickrichtungswechsel anschließen.
5. O05 und O13 mit der Kartenengine verbinden.
6. Klangschale an die Musikengine anschließen.
7. Gemeinsame Funktionen testen.
8. Architekturabweichungen dokumentieren.
9. Integrationspaket erstellen.

Ziel: Ein vollständig bedienbarer Wintergarten, der sich wie ein natürlicher Bestandteil des bestehenden interaktiven Bilderbuchs verhält.

---
Beigefügte Bilder (unverändert abgelegt):
- P03-C01 → `media/rooms/szenen/P03-C01-p03-dev01-9d94bbc2.png` (1672 × 941, sha256 9d94bbc2…; Blüte links, Wurzel Mitte, Klangschale rechts)
- P03-C02 → `media/rooms/szenen/P03-C02-p03-dev01-e68c0cde.png` (1672 × 941, sha256 e68c0cde…; Klangschale links, Durchgang Teezimmer Mitte, Hoföffnung rechts)

Entscheidungen der Projektinhaberin zu Rückfragen (20.11.2026):
- Musik beim Raumwechsel: „Überall pausieren“ (W1 wird aufgehoben, neue Entscheidung D-16).
- `#ort/P03`: „Auf Szene umstellen“ – Raumverzeichnis, `#ort/P03` und Innenhof führen in die Szene.

EMFD-LIGHT-01 · Verbindliche hausweite Lichtsteuerung

1. Entwicklungsziel

Übernimm die Lichtsteuerung als zentrale, wiederverwendbare Funktion des interaktiven Bilderbuchs „Ein Moment für dich · Das Haus der kleinen Wunder“.

Stelle das visuelle Verhalten der ursprünglichen Applikation wieder her und erweitere es auf sämtliche Räume und Lichtquellen.

In v0.6.14 wurde zwischen einer beleuchteten und einer unbeleuchteten Raumillustration gewechselt. Die neue Architektur soll stattdessen einzelne Lichtquellen unabhängig voneinander steuern können.

Ein einfacher CSS-Helligkeitsfilter auf dem gesamten Raumbild ist als alleinige Lösung nicht ausreichend.

2. Verbindliches visuelles Verhalten

Beim Ausschalten einer Lichtquelle:

* Die Lichtquelle erlischt sichtbar.
* Flammen beziehungsweise leuchtende Leuchtmittel verschwinden oder wechseln in ihren ausgeschalteten Zustand.
* Der zugehörige Lichtschein auf Wänden, Möbeln und Boden verschwindet.
* Zugehörige Reflexionen und Leuchteffekte werden reduziert beziehungsweise entfernt.
* Der Raum wird entsprechend der verbleibenden Lichtquellen dunkler.
* Natürliches Fensterlicht, Mondlicht und andere eingeschaltete Lichtquellen bleiben erhalten.

Beim Einschalten wird dieser Zustand umgekehrt.

Das Ausschalten soll sich anfühlen, als würde tatsächlich das Licht innerhalb des illustrierten Raumes ausgeschaltet.

3. Zentrales Lichtmodul

Entwickle eine gemeinsame LightEngine innerhalb der bestehenden Anwendungsarchitektur.

Keine individuellen, voneinander unabhängigen Implementierungen pro Raum.

Unterstütze insbesondere:

* Deckenlampen
* Wandlampen
* Tischlampen
* Stehlampen
* Laternen
* Kerzen
* Kamine
* Lichterketten
* Magische Lichtquellen
* Außenbeleuchtung

Jede als interaktiv definierte Lichtquelle erhält eine stabile Licht-ID, einen Anfangszustand, einen aktuellen Zustand und perspektivabhängige Medienzuordnungen.

Natürliches Umgebungslicht und funktionale Anzeigen von Musikgeräten werden getrennt behandelt.

4. Darstellungsarchitektur

Unterstütze folgende Bildebenen:

Ebene	Funktion
Base	Raum ohne schaltbare künstliche Beleuchtung
Ambient	Natürliches Umgebungslicht
Source	Sichtbarer Zustand der Lichtquelle
Spill	Lichtschein auf der Umgebung
Glow	Weicher Leuchteffekt
Reflection	Zugehörige Lichtreflexionen

Die Ebenen müssen unabhängig steuerbar sein und sich geometrisch exakt überlagern.

Mehrere gleichzeitig eingeschaltete Lichtquellen müssen miteinander kombiniert werden können.

Unterstütze zusätzlich vorhandene vollständige An/Aus-Bildpaare als kompatible Übergangslösung.

5. Zustandsverwaltung

Der Lichtzustand gehört zur physischen Lichtquelle innerhalb des Hauses, nicht zur Kameraansicht.

Verbindlich:

* Kameradrehungen verändern keinen Lichtzustand.
* Smartphone-Ausschnitte verändern keinen Lichtzustand.
* Der Wechsel zwischen Smartphone und Wide verändert keinen Lichtzustand.
* Beim Verlassen und erneuten Betreten eines Raumes bleibt der Zustand erhalten.
* Lichtzustände werden lokal und dauerhaft gespeichert.
* Ein Neuladen der Anwendung setzt die Beleuchtung nicht zurück.
* Neue Lichtquellen erhalten einen konfigurierbaren Standardzustand.

Eine Lichtquelle, die aus mehreren Räumen oder Blickrichtungen sichtbar ist, verwendet dieselbe globale Licht-ID.

6. Bedienung

Unterstütze:

* Direktes Antippen einer Lichtquelle, sofern sie interaktiv ist.
* Vorhandene physische Lichtschalter innerhalb der Szene.
* Gruppenschaltung mehrerer zugeordneter Lichtquellen.
* Alle schaltbaren Lichter eines Raumes ein- und ausschalten.

Bestehende Bedienelemente bevorzugt wiederverwenden.

Keine zusätzlichen dauerhaft sichtbaren Schalter ohne gestalterische Freigabe. Die Bilderbuchoberfläche soll ruhig und immersiv bleiben.

7. Animationen

Lichtzustände sollen sanft ineinander übergehen.

Vorgeschlagener Standard:

* Elektrische Beleuchtung: 400 ms.
* Kerzen und Laternen: 600 ms.
* Kamin: bis zu 1000 ms.

Die Dauer muss pro Lichtquelle konfigurierbar sein.

Keine grellen Blitze, künstlichen Funken oder verpflichtenden Soundeffekte.

Bei aktivierter Einstellung für reduzierte Bewegung erfolgt ein unmittelbarer oder stark verkürzter Zustandswechsel.

8. Responsive Integration

Die LightEngine muss in sämtlichen bestehenden Darstellungsformen funktionieren:

* Smartphone-Hochformat
* Smartphone-Querformat
* Tablet
* Desktop
* Wide-Modus
* Beide Raumkamerarichtungen
* Sämtliche Smartphone-Ausschnitte
* Nahansichten und Detailinteraktionen

Lichtmasken verwenden dasselbe Koordinatensystem, dieselben Transformationen und denselben Zuschnitt wie das jeweilige Raumbild.

9. Unabhängigkeit anderer Funktionen

Die Lichtsteuerung darf folgende Funktionen weder zurücksetzen noch unterbrechen:

* Musik und Musikplayer
* Begleiterkarte
* Tagebuch
* Gedankenblatt
* Orakelobjekte
* Raumnavigation
* Türinteraktionen
* Geschichtenbuch
* Sonstige Animationen

Ein dunkler Raum bleibt vollständig nutzbar.

Navigation, Hilfe und Bedienelemente behalten ihre Lesbarkeit.

10. Integration bei fehlenden Medien

Die technische Integration darf nicht auf die vollständige Bildproduktion warten.

Wenn Lichtmasken fehlen:

1. Lichtquelle bereits im zentralen Register definieren.
2. Technische Zustandsverwaltung vollständig integrieren.
3. Vorhandene An/Aus-Bildpaare weiterverwenden.
4. Falls nötig, vorläufige programmatische Lichtmasken einsetzen.
5. Fehlende finale Medien dokumentieren und an Work übergeben.

Keine neuen Raumillustrationen eigenständig generieren oder akzeptierte Originalbilder verändern.

Provisorische Effekte gelten nicht als visuell freigegebene Endfassung.

11. Verbindlicher Entwicklungsstandard

Alle bestehenden und zukünftigen Raumimplementierungen müssen die zentrale LightEngine verwenden.

Ergänze diese Anforderung dauerhaft in:

* Entwicklungsrichtlinien
* Gemeinsamer Szenenkomponente
* Raumkonfiguration
* Medienregister
* Raum-Produktionsvorlage
* Integrationscheckliste
* Qualitätssicherung

12. Abnahmekriterien

Die Integration gilt technisch als abgeschlossen, wenn:

* Lichtquellen unabhängig schaltbar sind.
* Lichtquellen sichtbar erlöschen.
* Zugehörige Lichtscheine verschwinden.
* Nicht ausgeschaltete Lichtquellen erhalten bleiben.
* Lichtzustände perspektivübergreifend konsistent sind.
* Lichtzustände dauerhaft gespeichert werden.
* Smartphone und Wide dieselbe Logik verwenden.
* Fehlende Medien keine Anwendungsfehler erzeugen.
* Bestehende Funktionen unverändert funktionieren.

Die visuelle Abnahme erfolgt zusätzlich pro Raum und Lichtquelle.

13. Ausführung

Verwende die aktuellste integrierte Anwendungsversion als Ausgangsbasis.

Prüfe gezielt vorhandene Lichtsteuerungen, Szenenkomponenten und Raumregister. Verwende bestehende Architektur und Funktionen weiter.

Keine vollständige Neuanalyse des Projekts und kein unnötiges Refactoring.

Implementiere die gemeinsame Funktion und dokumentiere ausschließlich relevante Änderungen, fehlende Medien und Testergebnisse.

EMFD-LIGHT-01 ist ab sofort eine verbindliche hausweite Entwicklungsanforderung und keine optionale Erweiterung einzelner Räume.

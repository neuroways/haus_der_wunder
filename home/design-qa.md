# EMFD-MUSIC-03 · Visuelle und funktionale Prüfung v0.3

final result: passed

Dieser Status gilt für die implementierte Oberfläche und die beschriebenen Prüfungen. Die Hörabnahme mit Originalmusik bleibt offen: Keine der 25 MP3-Dateien ist im gelieferten Bestand vorhanden. Sieben zusätzlich beschriebene Fassungen haben noch keine eindeutige AudioAsset-ID.

## Visuelle Grundlage und Änderungen durch Nutzerprüfung

Aktuelle Gestaltungsreferenz: /var/folders/gw/t7_pc4g96yvflthhwq7k741c0000gn/T/codex-clipboard-6b768204-ef7c-45b7-b5f6-b92a93aeeb50.png (941 × 1672 Pixel).
Erste Referenz: /Users/svenja/Downloads/Musikzimmer_ Das Haus der kleinen Wunder.png (1086 × 1448 Pixel).
Vergleichsaufnahme: ../qa-music04/player-reference-size-941x1672.png (941 × 1672 CSS-/Bildpixel, 1:1, keine Dichtenormalisierung).

Der aktuelle Startzustand ist auf ausdrücklichen Nutzerwunsch leer; die Referenz zeigt dagegen eine aufgelegte Platte. Ebenfalls ausdrücklich geändert: Symbolsteuerung, separate Covergalerie, keine Titelliste, kein Betreten-Autostart, Buchauswahl und gemeinsamer Bibliotheksleser. Diese Unterschiede sind keine offenen Abweichungen vom aktuellen Auftrag.

## Iterationen und gelöste Befunde

1. Bisherige Play-Dreiecke wählten nur einen Titel und öffneten den Dialog. Ersetzt durch direkte Steuerung der vorhandenen zentralen Session. Keine zweite Produktions-Audioinstanz.
2. Gerätekörper, runde Platte und Tonarm getrennt aufgebaut. Neue Bildvorlage in cabinet-v2.png übernommen. Originalcover bleiben unverändert und werden vollständig im quadratischen Rahmen gezeigt.
3. Globale immersive Altstile sperrten das Raumscrollen. Nur für diese Bühne vertikales Scrollen freigegeben; keine horizontale Seitenverschiebung.
4. In der ersten Filteriteration war eine Positionsliste unvollständig. Ersetzt durch eindeutige O-ID-Zuordnung und Belegprüfung jedes Tags; nachfolgend alle 32 Einträge im Browser durchgeblättert.
5. Auf 320px überdeckten Bedienelemente die Titelplakette. Titelmaß, Abstand und 44px-Tasten korrigiert. Nachprüfung: player-320x740.png, kein Überdecken von Titel und Tasten.
6. Der lange Buchtitel brach auf kleinen Geräten an einer einzelnen Endsilbe um. Sinnvolle Trennstelle und passende Schriftgröße ergänzt. Buchillustrationen verkleinert, Text bereits auf Seite 1 sichtbar.
7. Main Theme verwendet T03 als Asset-ID und theme als UI-ID. Verfügbarkeitsanzeige auf dieselbe Asset-Auflösung wie die Wiedergabe umgestellt; eigener Regressionstest bestätigt den Hinweis bereits vor dem ersten Start.

## Fünf Prüfflächen

- Typografie: Georgia für Geräte-/Buchtitel, vorhandene Systemschrift für Bedienung und Status; bestehende fünf Buchschriftgrößen bleiben erhalten. Vollständige Namen bleiben zugänglich.
- Layout: Bühne zentriert, alle Cover 1:1 mit object-fit:contain; kein Verlust wichtiger Motivteile. Kompakte Buchcover verwenden vorhandene Bibliothekskomponenten. Rückweg und Hilfe bleiben in langen Auswahlen erreichbar.
- Farben: dunkles Walnuss-/Mahagoniholz, Teal und warmes Gold; vorhandene Raumkulisse abgedunkelt und leicht unscharf. Einheitliche lokale Lucide-Symbole mit Goldfarbe und 1,65px-Linie.
- Bilder: drei getrennte Geräte-PNGs; keine statische Mockup-Oberfläche. 25 vorhandene Originalmotive für 32 Einträge, da dokumentierte Fassungen das Cover wiederverwenden. PNG-/SVG-Dateien werden lokal ausgeliefert.
- Inhalt: keine sichtbaren Öffnen-/Einschalten-Textknöpfe am Player, keine Titelliste/zusätzliche Coverübersicht/Herkunfts-Fußnote, keine Stilfilter oder Betreten-Einstellung am Gerät. Kontextbezogene Hilfe erklärt die jeweilige Seite.

## Reale Bewegungsprüfung ohne Originalmusik

Die getrennte Prüfansicht qa-music04/animation-preview.html nutzt dieselbe EMFDAudioSession und dieselben Gerätekomponenten mit einer ausdrücklich stummen WAV-Datei. Sie gehört nicht zur Produktionsanwendung und ersetzt keine Originalaufnahme.

- Start: tatsächliche Browser-Audiowiedergabe; Platte blendet sanft ein, dreht kontinuierlich mit etwa 33⅓ U/min. Rotation erfolgt vor der perspektivischen Stauchung, dadurch kein eierndes Ellipsenbild.
- Tonarm: eigene Schwenkebene, Ruhe um 6–7 Uhr (−28° gegenüber der Ausgangsgrafik), Spielposition um 8–9 Uhr (+28°), nur 0,18° zusätzliche Mikrobewegung.
- Pause: Platte bleibt aufgelegt. Transformationsmatrix in zwei zeitlich getrennten Messungen identisch; animationPlayState=paused.
- Stopp: Platte blendet aus, opacity=0; Tonarm kehrt in die Ruheposition zurück. Keine Drehbewegung.
- Aufnahmen: animation-playing.png, animation-paused.png, animation-stopped.png. Die Spiel- und Ruheposition wurden im Detail geprüft.
- prefers-reduced-motion deaktiviert die Bewegung; die Zustandsanzeige bleibt erhalten. Prüfung dieser Regel per Code, keine Änderung der Betriebssystemeinstellung.

## Browser und Funktionen

In-App-Browser: 320×740, 390×844, 844×390, 768×1024, 1024×768, 1440×1000; zusätzlicher Referenzvergleich 941×1672. Daten in viewport-checks.json und browser-cover-audit.json. Keine horizontale Überbreite; 44px Mindestziele für die kleinen Transporttasten. Alle 32 sichtbaren Einträge durchgeblättert, 25 verschiedene Originalillustrationen und quadratische Cover bestätigt.

Geprüft: Wischen ohne unbeabsichtigten Start, Tastaturpfeile, kombinierte Filter, Leerzustand, Fassungsname bei identischem Cover, Playerwechsel, Playlist-Knopf, gesuchte Platten vor dem Audiostart, getrennte Hilfetexte, Bücherregal, Seitenblättern und Rückkehr zum Buch. Im abschließenden Browserlauf keine neuen JavaScript-Ausnahmen. Frühere Filterfehler sind als behobene Iterationsbefunde dokumentiert.

## Tests und Grenzen

73 gezielte Tests bestanden. Sie prüfen alle 25 Standard-Audiozuordnungen, Start/Pause/Stopp/Ende, eine zentrale Medieninstanz, Stille, Ausfälle, Wiederfinden, gefilterte Reihenfolge, Einzel-/Playlist-Wiederholung, dokumentierte und unzugeordnete Fassungen sowie den unveränderten Text aller 24 Geschichten und die bisherigen Bibliotheksbücher. Die Track-Verhaltenstests verwenden ausdrücklich simuliertes Audio; sie sind keine Hörprobe.

Bekannte ältere Gesamtsuite-Abweichungen wurden nicht als neue Musikzimmerfehler behandelt. Beispiel: zwei unveränderte Library-Integrationstests erwarten noch v0.6.61 bzw. alte Teezimmer-Cachekennungen; im Originalarchiv reproduziert (baseline-library-tests.txt). Ein historischer PNG-Pfadtest wurde an die bereits gelieferten optimierten Originalderivate mit Medienidentitätsnachweis angepasst.

Offen: Original-MP3s und sieben Fassungszuordnungen bereitstellen; anschließend alle realen Stücke abhören und auf echtem iOS/Safari und Android/Chrome prüfen. Kein Einsatz im Live-System und keine Veröffentlichung.

## Verbleibende Verfeinerungen

Keine offenen P0/P1/P2 im geprüften Layout. P3: Feinarbeit an Geräteornamenten und sehr kleinen Titelgrößen kann anhand weiterer visueller Rückmeldung erfolgen. Hörabnahme und reale Endgeräte bleiben ausdrücklich außerhalb dieses visuellen Bestehensstatus offen.


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

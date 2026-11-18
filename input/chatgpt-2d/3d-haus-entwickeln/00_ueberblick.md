<!-- Quelle: ChatGPT-Chat „3D Haus entwickeln“, eingefügt am 18.11.2026, unverändert übernommen -->

# 00 · Überblick
## Wissensübergabe der 2D-Welt „Haus der kleinen Wunder · Ein Moment für dich“

**Stand der Übergabe:** 18.11.2026  
**Geltungsbereich:** 2D-PWA, Weltkonzept, Erzählkanon, Begriffe und bekannte Entwicklungshistorie  
**Letzter bekannter App-Stand:** v0.6.66  
**Status:** Wissensdokumentation aus Projektquellen, früheren Chats und verfügbaren Projektunterlagen.

---

## 1. Statussystem und Quellenhierarchie

Für diese Übergabe gelten folgende Status:

- **BESCHLOSSEN:** ausdrücklich bestätigte Projekt- oder Masterentscheidung.
- **UMGESETZT (vX.Y.Z):** im betreffenden Entwicklungsstand nachweislich vorhanden. Das bedeutet nicht automatisch, dass die Funktion auf allen Geräten abgenommen oder veröffentlicht wurde.
- **IN ARBEIT:** begonnen, teilweise implementiert oder zur weiteren Entwicklung vorgesehen.
- **IDEE:** Vorschlag ohne verbindliche Freigabe.
- **VERWORFEN (Grund):** ausdrücklich überholter oder abgelehnter Ansatz.
- **[UNBEKANNT]:** in den verfügbaren Quellen nicht ausreichend dokumentiert.
- **[UNSICHER: ...]:** Hinweise sind vorhanden, aber nicht eindeutig bestätigt oder widerspruchsfrei.

### Vorrang bei widersprüchlichen Entscheidungen

1. Jüngere ausdrückliche Masterentscheidungen haben Vorrang.
2. Masterentscheidungen v1.3 vom 08.10.2026 ergänzen und bestätigen den Erzählkanon aus Weltbibel v1.2.
3. Ältere Vorschläge werden nicht automatisch zu Projektentscheidungen.
4. UX-Mockups und Konzeptpapiere sind keine Implementierungsfreigabe.
5. Ein vorhandener Codebestand beweist nicht automatisch, dass eine Funktion vollständig oder auf dem Live-System nutzbar ist.

---

## 2. Projektidentität

### 2.1 Name und Welt

**BESCHLOSSEN**

Projekttitel:
„Ein Moment für dich“

Name der fiktionalen Welt:
„Das Haus der kleinen Wunder“

Die beiden Bezeichnungen haben unterschiedliche Funktionen:

- „Ein Moment für dich“ bezeichnet das übergeordnete Projekt und das Nutzungserlebnis.
- „Das Haus der kleinen Wunder“ bezeichnet die fiktionale Welt, in der die digitale Erfahrung stattfindet.

**Namensstand der Anwendung:**

- Am 05.11.2026 wurde für die PWA ausdrücklich der Name „Haus der kleinen Wunder“ festgelegt.
- Der Projektname „Ein Moment für dich“ bleibt davon unberührt.
- Die aktuelle Projektübergabe verwendet die kombinierte Bezeichnung „Haus der kleinen Wunder · Ein Moment für dich“.

Die PWA liegt nach aktuellem Übergabestand unter `/wunderhaus/home/`. Als Domain ist `haus-der-wunder.de` angegeben.

Ältere Entwicklungsunterhaltungen verwendeten auch `flowisaurus.de/wunderhaus/home/`. Dieser ältere Verweis ist nicht als aktuelle Domainentscheidung zu übernehmen.

### 2.2 Zweck der Anwendung

**BESCHLOSSEN**

Die Anwendung ist eine zeitlose, ganzjährig zugängliche magische Klang- und Erfahrungswelt.

Sie verbindet:

- eine fiktionale, zusammenhängende Hauswelt;
- 24 unterschiedliche symbolische Orakelkarten;
- vier Kartengruppen: Ruhe, Kraft, Halt und Freude;
- Musik und veränderbare Klangräume;
- freiwillige Selbstreflexion;
- Geschichten und Leseangebote;
- die Möglichkeit, Bilder, Orte und Klänge unabhängig voneinander zu entdecken.

Die Anwendung soll einen selbstbestimmten Moment ermöglichen. Die Person entscheidet selbst, ob sie eine Karte betrachtet, einen Text liest, Musik hört, einen Ort besucht oder nichts davon tut.

Das Haus ist dabei nicht bloß ein Hintergrund für Karten und Musik. Es ist eine eigenständige fiktionale Welt mit wiedererkennbaren Orten und einer zusammenhängenden Atmosphäre.

### 2.3 Zielgruppe

**[UNBEKANNT]**

Eine verbindliche demografische Zielgruppendefinition ist in den verfügbaren Quellen nicht dokumentiert.

Insbesondere sind nicht festgelegt:

- eine Altersgrenze;
- eine bestimmte Geschlechtergruppe;
- eine bestimmte Diagnose oder gesundheitliche Voraussetzung;
- eine bestimmte religiöse oder spirituelle Zugehörigkeit;
- ein festgelegter Nutzungskontext.

**BESCHLOSSEN – Nutzungshaltung**

Die Anwendung setzt keine bestimmte Lebenssituation, Stimmung, Fähigkeit oder Bereitschaft zur Selbstreflexion voraus.

Ein Besuch ist auch dann vollständig, wenn jemand nur ein Bild anschaut, keine Musik hört, keine Frage beantwortet oder die Anwendung direkt wieder verlässt.

### 2.4 Gewünschte Wirkung

**BESCHLOSSEN**

Die Welt soll einen freiwilligen, persönlichen Aufenthalt ermöglichen.

Sie soll:

- Geborgenheit und räumliche Wiedererkennung vermitteln;
- kleine Momente des Staunens ermöglichen;
- verschiedene Zugänge zu Ruhe, Kraft, Halt und Freude anbieten;
- Musik als eigenständigen künstlerischen Zugang bereitstellen;
- eigene Deutungen zulassen;
- Stille und Nichtstun als vollständige Nutzung akzeptieren;
- jederzeit einen direkten Ausstieg ermöglichen.

Die Anwendung verspricht nicht, dass jemand nach einem Besuch ruhiger, stärker, sicherer oder fröhlicher ist.

---

## 3. Verbindlicher Erzählkanon

**BESCHLOSSEN – Masterentscheidungen v1.3, 08.10.2026**

### 3.1 Das Haus

Das Haus der kleinen Wunder ist ein fiktionales Haus, das auf keiner Landkarte steht.

Von außen wirkt es überschaubar. Innen eröffnet es überraschend weite, miteinander verbundene Orte.

Vertrautes und Unmögliches dürfen nebeneinander existieren.

Wiederkehrende Orte behalten erkennbare Details. Die Welt kann räumlich überraschend sein, ohne ihre Identität zu verlieren.

### 3.2 Emotionaler Leitsatz

**BESCHLOSSEN**

> Du darfst ankommen, ohne dich verändern zu müssen.

Dieser Wortlaut wurde zunächst in Weltbibel v1.2 als Vorschlag geführt und anschließend durch Masterentscheidung E02 am 08.10.2026 bestätigt.

### 3.3 Die Laterne

**BESCHLOSSEN – Leitmotiv**

Die Laterne ist ein wiederkehrendes Motiv der Welt.

Sie ist:

- ein Gegenstand;
- nicht sprechend;
- nicht zu pflegen;
- keine Figur mit eigenen Bedürfnissen;
- kein Fortschrittsanzeiger;
- kein Stimmungsindikator;
- keine Instanz, die den Weg vorgibt.

Ihre Helligkeit zeigt weder Stimmung noch Fortschritt.

Sie muss nicht in jeder Szene vorkommen.

Die Laterne verbindet die Welt visuell, ohne eine feste Bedeutung vorzuschreiben.

### 3.4 Die fünf Hausregeln

**BESCHLOSSEN – Masterentscheidungen v1.3**

1. **Verlässliche Magie:** Unmögliche Architektur ist erlaubt, aber wiederkehrende Orte behalten erkennbare Details.
2. **Freiwillige Entdeckung:** Überraschungen sind Angebote, keine Aufgaben.
3. **Ein vollständiges Haus:** Dunkelheit, Stille oder Unordnung müssen nicht behoben werden; nichts muss versorgt werden.
4. **Kein unsichtbarer Hausherr:** Die Erzählstimme beschreibt, ohne allwissend zu sein oder Menschen zu beurteilen.
5. **Keine Handlungspflicht:** Kein zentraler Konflikt, keine drohende Schließung und kein Rätsel, dessen Lösung Voraussetzung ist.

### 3.5 Erzählstimme

**BESCHLOSSEN**

- Zurückhaltende Du-Erzählstimme.
- Keine allwissende Stimme.
- Keine Bewertung der besuchenden Person.
- Keine Behauptung, Gefühle oder Bedürfnisse der Person zu kennen.

**BESCHLOSSEN – redaktioneller Szenenstil**

- Kurze konkrete Beobachtungen.
- Höchstens eine freiwillige Reflexionsfrage pro Ansicht.
- Keine obligatorische Handlungsabfolge.

---

## 4. Was die Anwendung bewusst nicht sein soll

### 4.1 Keine Vorhersage- oder Wahrheitsinstanz

**BESCHLOSSEN**

- Keine Vorhersagen.
- Keine esoterischen Wahrheitsbehauptungen.
- Keine Diagnosen.
- Keine garantierten Wirkungen.
- Keine Behauptung, eine gezogene Karte kenne die Person oder ihre Zukunft.
- Keine festgelegte richtige Interpretation eines Bildes.

Eine zufällige Karte bleibt eine zufällige Auswahl.

### 4.2 Kein Leistungssystem

**BESCHLOSSEN**

Es gibt keine verpflichtende Entwicklung und keinen Leistungsdruck.

Insbesondere nicht:

- keine Pflichtreisen;
- keine Freischaltungen;
- keine Pflichtreihenfolge;
- keine Abwesenheitsstrafen;
- keine verlorenen Serien;
- keine täglichen Nutzungspflichten;
- keine Fortschrittsanzeige;
- keine Aufgaben, die das Haus erst vollständig machen.

Alle Orte bleiben zugänglich.

### 4.3 Keine automatische Bedürfnisdeutung

**BESCHLOSSEN**

Ruhe, Kraft, Halt und Freude sind vier gleichwertige Kartengruppen.

Sie sind keine Entwicklungsstufen und keine festen Raumregionen.

Ein Ort kann mehrere Bedeutungen tragen. Ein Bedürfnis kann an mehreren Orten vorkommen.

Die Anwendung darf nicht aus einer Auswahl oder einem Text automatisch auf Gefühle, Persönlichkeit oder Bedürfnisse schließen.

### 4.4 Keine Pflicht zur Interaktion

**BESCHLOSSEN**

Bild, Musik, Frage und Notiz sind unabhängig und auslassbar.

Es gibt keine Pflicht:

- eine Karte zu ziehen;
- eine Karte zu behalten;
- einen Text zu lesen;
- eine Frage zu beantworten;
- Musik zu starten;
- etwas zu speichern;
- etwas zu teilen;
- einen Raum vollständig zu erkunden.

### 4.5 Keine automatische Musik

**BESCHLOSSEN**

Musik startet ausschließlich nach bewusster Auswahl.

Lautstärke, Pause und Stopp müssen erreichbar bleiben.

Sprache und Naturgeräusche sind getrennt steuerbar.

Ein Raumwechsel, das Betreten des Musikzimmers oder das Öffnen eines Plattenspielers darf nicht automatisch Audio starten.

### 4.6 Keine verpflichtende Hausreise

**BESCHLOSSEN**

Es gibt keinen vorgeschriebenen Ankunftsort.

Direkte Einstiege über Karte, Hausübersicht oder Musik bleiben möglich.

Die Welt muss nicht vollständig erkundet werden.

Ein Besuch darf bereits beim Ankommen enden.

### 4.7 Keine therapeutischen oder medizinischen Wirkversprechen

**BESCHLOSSEN**

Die Welt erhebt keinen Anspruch auf Heilung, Diagnose oder garantierte psychologische Wirkung.

**[UNBEKANNT]** Ob die Anwendung in einem formalen Produktkontext ausdrücklich als Nicht-Therapieprodukt bezeichnet werden soll, wurde nicht gesondert festgelegt.

---

## 5. Weltmodell und Grundstruktur

### 5.1 Orte und Bedürfnisse

**BESCHLOSSEN – W1 + O2**

- W1: Das Haus der kleinen Wunder.
- O2: Ein Netz aus stabilen Orten mit mehreren möglichen Bedeutungen.

Orte sind wiedererkennbare Schauplätze.

Bedürfnisse bilden eine davon unabhängige Ebene.

Es gibt keine vier exklusiven Bedürfnisflügel.

Die konkrete Architektur und die Anzahl der Orte wurden später in eigenen Arbeitsbereichen ausgearbeitet.

### 5.2 Musikmodell

**BESCHLOSSEN – M3**

Veränderbare Klangräume bestehen aus wenigen vorbereiteten, miteinander kombinierbaren musikalischen Ebenen.

Nutzbare Voreinstellungen ermöglichen das Hören ohne eigenes Mischen.

Musikalische Ebenen müssen innerhalb eines Klangraums zusammenpassen.

Es ist kein gemeinsames musikalisches Leitmotiv für das gesamte Haus erforderlich.

### 5.3 Drei unabhängige Zugänge

**BESCHLOSSEN – UX-Rahmen**

Die drei Hauptzugänge sind:

1. **Haus** – Räume und Orte entdecken.
2. **Karten** – Karten ansehen, zufällig auswählen oder selbst wählen.
3. **Musik** – Musik hören und Klangangebote auswählen.

Diese drei Zugänge sind gleichwertig und unabhängig nutzbar.

Der Raumzugang ist keine Voraussetzung für Karten oder Musik.

---

## 6. Glossar

### Ein Moment für dich
**BESCHLOSSEN**

Übergeordneter Projekttitel und Bezeichnung des persönlichen Nutzungserlebnisses.

### Das Haus der kleinen Wunder
**BESCHLOSSEN**

Name der fiktionalen Welt.

### 2D-Welt
**UMGESETZT (v0.6.66)**

Die bildbasierte PWA mit Hausansichten, Räumen, Karten, Leseangeboten und Musik.

Sie ist von der parallel entwickelten begehbaren 3D-Welt zu unterscheiden.

### 3D-Welt
**SEPARATER ENTWICKLUNGSSTRANG**

Eine zusätzliche begehbare Umsetzung des Hauses. Sie ersetzt nicht automatisch die 2D-PWA.

### Weltenweberin
**IN ARBEIT / [UNSICHER]**

Bezeichnung für die kreative Urheberin bzw. ihre künstlerische Darstellung im Projekt.

In einem früheren Projektgespräch wurde die Weltenweberin als künstlerische Darstellung der Urheberin beschrieben.

Wichtige Grenze:

Die Weltenweberin ist laut UX-Prüfung keine durch die Weltbibel definierte Hausbewohnerin oder allwissende Figur. Sie darf nicht ungeprüft als sprechende Instanz des Hauses dargestellt werden.

Eine vollständige redaktionelle Rollenbiografie und der endgültige öffentliche Wortlaut sind [UNBEKANNT].

### Orte / Räume
**BESCHLOSSEN**

Wiedererkennbare Schauplätze des Hauses.

Sie können verschiedene Bedeutungen tragen. Sie sind keine Bedürfnisstufen und keine Pflichtstationen.

### Stationen
**[UNBEKANNT]**

Der Begriff wird in der Aufgabenstellung als Projektbegriff genannt. Eine verbindliche technische oder redaktionelle Definition als eigenständiges System ist in den geprüften Quellen nicht eindeutig dokumentiert.

Nicht ungeprüft als Pflichtfolge oder Fortschrittsmechanik interpretieren.

### Atelier – P04
**KONZEPT / UX-DOKUMENTIERT**

Werkraum und Ort zur Betrachtung der 24 Bildkarten.

In den UX-Seitenplänen:
- Werkbank;
- Werkzeuge;
- Arbeitslicht;
- 24 sichtbare Bildkarten;
- Karten am Tisch ansehen;
- zufällige Bildkarte ansehen;
- alle Bildkarten öffnen.

Die Karten werden aus den vorhandenen O01–O24-Bildmedien verwendet. Es ist keine neue Kartenserie vorgesehen.

### Teezimmer – P08
**UMGESETZT (v0.6.66, mit offenen Funktionslücken)**

Wohnlicher Raum mit Kartenbezug.

In den UX-Plänen ist es der Ort für eine freiwillige Tageskartenauswahl.

Der Kartenbereich bietet:
- zufällige Karte ansehen;
- selbst eine Karte auswählen;
- alle Bildkarten ansehen.

Die zufällige Auswahl entsteht erst nach bewusster Aktion.

Der Raum darf keine Tageszeitpflicht, Erinnerungspflicht oder Gefühlsdeutung erzeugen.

### Musikzimmer
**KONZEPT / TEILWEISE UMGESETZT**

Ein architektonischer Ort für Musik.

Es ist vom musikalischen Klangraum zu unterscheiden.

Die UX-Pläne beschreiben:
- Plattenspieler;
- Platten;
- Lautsprecher;
- Sessel;
- Playlist öffnen;
- optional Hintergrundinformationen zu Kompositionen.

Das Betreten des Raums startet keine Musik.

Eine eigene P-ID innerhalb des Registers P01–P08 ist [UNBEKANNT].

### Klangraum
**BESCHLOSSEN – M3**

Musikalische Umgebung, die aus wenigen vorbereiteten musikalischen Ebenen bestehen kann.

Ein Klangraum ist nicht automatisch ein architektonischer Raum.

### Karten O01–O24
**BESCHLOSSEN**

24 unterschiedliche symbolische, von Tarot inspirierte Orakelkarten.

Die Karten sind in vier Gruppen mit je sechs Karten gegliedert:

- Ruhe
- Kraft
- Halt
- Freude

Die O-IDs sind interne Kennungen und keine vorgeschriebene Nutzungsreihenfolge.

Die Kartengruppen legen weder vier Räume noch 24 Orte oder 24 Kompositionen fest.

### T03 – Main Theme
**DOKUMENTIERT / TECHNISCH NICHT VOLLSTÄNDIG VERIFIZIERT**

T03 bezeichnet in den verfügbaren Medienunterlagen das Main Theme.

Es ist keine O-Orakelkarte.

Die Medienunterlagen führen dafür den Audiopfad `media/audio/THEME.mp3`.

Audio-Binärdatei und Rechte-/Produktionsstatus sind damit nicht automatisch bestätigt.

### QR-Geschenkkarten
**BESCHLOSSEN**

Das physische Geschenk besteht aus 24 identischen QR-Geschenkkarten.

Diese sind von den 24 unterschiedlichen Orakelkarten getrennt.

Eine Geschenkkarte entspricht nicht einer bestimmten Orakelkarte und keinem verpflichtenden Nutzungstag.

### Raumplayer
**UMGESETZT / ZENTRALE PLAYER-ARCHITEKTUR**

Raumbezogene Musikangebote sind Zugänge zu Musik bzw. Playlists.

Die UX-Unterlagen sehen einen gemeinsamen Player vor, nicht für jeden Raum einen unabhängigen Audioplayer.

Zentrale Bedienmöglichkeiten:
- Starten
- Pause
- Stopp
- Lautstärke

Ein Raumwechsel darf die Wiedergabe nicht neu initialisieren.

### Gedankenpapier / Gedankenblatt
**UMGESETZT (v0.6.57), in v0.6.66 mit Einschränkungen**

Das Modul trägt den Namen „Ein Gedanke zum Mitnehmen“.

Es ist ein wiederverwendbares Gedankenblatt für Kartenfragen und das Teezimmer.

Im dokumentierten Stand v0.6.57:
- Datum automatisch und änderbar;
- Kartenname und Reflexionsfrage übernehmbar;
- Kartenmotiv als Vorschau;
- PNG- und PDF-Export;
- QR-Code und Rückkehrlink;
- kein dauerhafter Notizspeicher.

Im geprüften Stand v0.6.66 wurde weiterhin keine dauerhafte Tagebuchspeicherung nachgewiesen. Der freie Zugang im Teezimmer fehlte in der geprüften Version.

### Begleiterkarte
**IN ARBEIT**

Bezeichnung für eine Karte, die eine Person über eine Begleitphase hinweg begleiten soll.

Die Karte soll nicht automatisch wechseln.

Eine dauerhafte Begleitphase mit Verlauf und Speicherung war im geprüften v0.6.66 noch nicht vollständig vorhanden.

### Kartenbuch
**[UNSICHER]**

In früheren Projektgesprächen als Entdeckungswerkzeug für die kleinen Wunder beschrieben.

Die genaue Abgrenzung zum Kartenkatalog und zur Kartenansicht muss anhand der aktuellen Texte und Oberfläche geprüft werden.

### Buch der Weltenweberin
**IN ARBEIT / DOKUMENTIERT**

Persönliches Lese- und Geschichtenerlebnis mit Texten zur Entstehung, Musik und Weltenweberin.

Im Stand v0.6.53 wurden drei Beiträge mit insgesamt 19 Abschnitten dokumentiert.

---

## 7. Bekannte Versionsgeschichte

Die folgende Liste enthält nur nachweisbare Meilensteine. Sie ist kein vollständiges Changelog aller Builds.

### 7.1 Welt- und Erzählkanon

| Version | Datum | Änderung | Status |
|---|---|---|---|
| Weltbibel v1.0 | 08.10.2026 | Erste kompakte Weltbibel. „Der Garten der Momente“ war noch ein Vorschlag. | DOKUMENTIERT |
| Entscheidungsvorlage v1.1 | 08.10.2026 | Laterne, Du-Stimme und vier Kartengruppen bestätigt; Weltform, Ortsstruktur und Musikmodell zur Entscheidung vorbereitet. | DOKUMENTIERT |
| Weltbibel v1.2 | 08.10.2026 | W1 Haus, O2 Ortsnetz und M3 veränderbare Klangräume beschlossen. | BESCHLOSSEN |
| Master v1.3 | 08.10.2026 | Grundgeschichte, emotionaler Leitsatz, fünf Hausregeln, Laternenrolle und Szenenstil freigegeben. | BESCHLOSSEN |

### 7.2 2D-PWA

#### v0.6.18
**Dokumentierter Stand: 29.10.2026**

**UMGESETZT / ARCHIV- UND MEDIENINVENTUR**

Eine Medienablage v1.0 wurde für diesen App-Stand dokumentiert.

Bekannte Bestände:
- 24 Karten O01–O24;
- acht Haupträume;
- Flur, Hauseingang, Musikzimmer und Halle als zusätzliche Bild-/Ortsbestände;
- Raumvarianten und Briefhintergründe;
- Porträt der Weltenweberin.

Bekannte Mängel im damaligen Medienbestand:
- acht Kartenpfade fehlerhaft;
- MP3-Dateien fehlten.

Dies ist ein dokumentierter Medien-/Archivstand, kein vollständiges Release-Changelog.

#### v0.6.53
**Dokumentierter Stand: 03.11.2026**

**UMGESETZT**

Geschichten-Reader mit:
- drei Beiträgen;
- 19 Abschnitten;
- Inhaltsverzeichnis;
- Kapitelwahl;
- Vor-/Zurücknavigation;
- Fortschrittsanzeige;
- Fokussteuerung.

Die drei dokumentierten Beiträge:
- Die Idee
- Die Musik
- Die Weltenweberin

#### v0.6.56
**Build-/Archivstand; Erstellungsdatum [UNBEKANNT]**

**UMGESETZT**

In der späteren Bestandsprüfung wurden folgende Funktionen diesem Stand zugeordnet:
- Zufallsziehen;
- verdeckte Karten;
- zentraler Musikplayer;
- exportierbares Gedankenblatt.

Die Kartenauswahl war nur während des geöffneten Besuchs gespeichert. Eine dauerhafte Begleitphase war nicht vorhanden.

Der Stand wurde am 14.11.2026 als ältere Prüfgrundlage diskutiert und anschließend durch v0.6.66 als neuere Prüfgrundlage ersetzt.

#### v0.6.57
**Erstellungsdatum [UNBEKANNT]**

**UMGESETZT / TEILWEISE ABGENOMMEN**

Das Modul „Ein Gedanke zum Mitnehmen“ war implementiert und sowohl aus den Kartenfragen als auch aus dem Teezimmer vorgesehen.

Nachgewiesene Funktionen:
- wiederverwendbares Gedankenblatt;
- freies und kartenbezogenes Schreiben;
- änderbares Datum;
- Kartenname und Frage übernehmen;
- Motivvorschau;
- PNG- und PDF-Erzeugung;
- QR-Code und Rückkehrlink.

Bekannter Fehler:
Bei langen Notizen reichte der PDF-Text ab Seite zwei teilweise in den reservierten Bereich für QR-Code und Rückkehrlink.

Eine vollständige Freigabe für Mobilgeräte war noch offen.

#### v0.6.62 – EMFD-FIX01
**05.11.2026**

**UMGESETZT – TESTPAKET, NICHT VERÖFFENTLICHT**

Fehleranalyse und Korrekturstand.

Bekannt:
- 26 Prüfpunkte bearbeitet;
- 14 neue Strukturtests bestanden;
- 31 ältere Tests fehlgeschlagen;
- sechs START-02-Illustrationen fehlten;
- Browser- und Mobilabnahme offen.

#### v0.6.63 – PWA-INSTALL-01
**05.11.2026**

**UMGESETZT – LOKAL GEPRÜFT, LIVE-ABNAHME OFFEN**

Installations- und PWA-Korrekturstand.

Bekannt:
- App-Name „Haus der kleinen Wunder“;
- Startpfad `/wunderhaus/home/`;
- Manifest korrigiert;
- iOS-Metadaten korrigiert;
- Deployment-Pfade korrigiert;
- Prüfsummen korrigiert.

Teststatus:
- 174 von 205 Tests bestanden;
- 30 fehlgeschlagen;
- ein Test übersprungen.

Live- und iPhone-Abnahme waren offen.

#### v0.6.66
**Testbuild und Bestandsprüfung: 13.–14.11.2026**

**UMGESETZT – LETZTER BEKANNTER APP-STAND**

Dokumentierte Änderungen:
- altes Menü entfernt;
- Original-Umschlag mit Faltkante;
- Karte durch Tippen wenden;
- feste Briefaktion;
- Raumplaylists;
- wiederholte Wiedergabe;
- acht Raumgeräte als Teil der Musik-/Raumgestaltung.

**[UNSICHER] Raumgeräte:** Eine frühere Übergabe beschreibt Grammophonsteuerung als integriert. Eine andere Prüfung beschreibt die Geräteinteraktionen noch als nicht vollständig umgesetzt; Karussell- und Klangschalenbewegungen seien Entwürfe. Den tatsächlichen Stand vor Weiterentwicklung im Code prüfen.

Teststatus aus einem Testbuild:
- 41 gezielte Tests bestanden;
- Gesamtlauf: 269 von 308 Tests bestanden;
- 38 fehlgeschlagen;
- ein Test übersprungen.

Zusätzliche Bestandsprüfung am 14.11.2026:
- 29 ausgewählte Tests;
- 21 bestanden;
- acht fehlgeschlagen.

Die acht Fehler betrafen unter anderem:
- veraltete Erwartungen an den Ziehhandler;
- fehlenden direkten Gedankenblattzugang im Teezimmer;
- fehlende freie Editoranbindung im Teezimmer;
- Versions-/Cache-Erwartungen;
- veraltete Versionsbindungen einzelner Tests.

Die Ergebnisse der beiden Testläufe sind unterschiedliche Prüfumfänge und dürfen nicht miteinander verrechnet werden.

Die Prüfung von v0.6.66 bestätigte außerdem:
- zentrale Karten-/Ziehlogik über die Feature-Registry;
- zentralen Musikplayer;
- Gedankenblattmodul ohne nachgewiesene dauerhafte Speicherung;
- keine vollständig implementierte dauerhafte Begleitphase;
- uneinheitliche Rückwege und Musikzugänge zwischen einzelnen Ansichten.

Der Stand v0.6.66 ist die letzte bekannte technische Referenz, aber keine Bestätigung, dass der Live-Server exakt diesen Stand ausliefert.

### 7.3 Weitere Entwicklungskennungen

| Kennung | Bekannter Inhalt | Status |
|---|---|---|
| EMFD-FIX01 | Fehleranalyse und Korrekturen, v0.6.62 | DOKUMENTIERT |
| PWA-INSTALL-01 | PWA-Installationskorrekturen, v0.6.63 | DOKUMENTIERT |
| EMFD-MEDIA-CORE-01 | Medienregeln und Loader für den zentralen Medienbestand | UMGESETZT laut aktuellem Übergabestand |
| arch01 | [UNBEKANNT] | [UNBEKANNT] |
| music04 | [UNBEKANNT] | [UNBEKANNT] |
| auto1 | [UNBEKANNT] | [UNBEKANNT] |
| intro01 | [UNBEKANNT] | [UNBEKANNT] |

Die Kürzel arch01, music04, auto1 und intro01 dürfen nicht anhand ihrer Namen interpretiert oder mit vermuteten Funktionen verknüpft werden.

### 7.4 Nicht dokumentierte Zwischenversionen

**[UNBEKANNT]**

Für die folgenden Bereiche liegt kein vollständiges, belastbares Changelog vor:
- v0.6.19 bis v0.6.52;
- v0.6.54 bis v0.6.55;
- v0.6.58 bis v0.6.61;
- v0.6.64 bis v0.6.65.

Es ist möglich, dass frühere Chats oder alte ZIP-Archive weitere Informationen enthalten. Diese müssen separat ausgewertet werden.

---

## 8. Überholte Entscheidungen und nicht wieder einführen

### Der Garten der Momente
**VERWORFEN als Weltname**

Der frühere Name wurde durch die Masterentscheidung „Das Haus der kleinen Wunder“ ersetzt.

Ein Garten darf weiterhin als einzelner Ort vorkommen, ist aber nicht mehr die übergeordnete Welt.

### Die Schwelle als Pflicht-Ankunftsort
**VERWORFEN**

Es gibt keinen vorgeschriebenen Einstieg und keine Tür, die erst geöffnet werden muss, bevor andere Inhalte zugänglich werden.

### Sechs frühere magische Orte als fester Kanon
**VERWORFEN / ÜBERHOLT**

Die früheren Ortsvorschläge wurden nicht automatisch übernommen. Maßgeblich ist das spätere Ortsnetz mit stabilen Orten und mehreren Bedeutungen.

### W2 + O2 + M2
**VERWORFEN als Entscheidungskombination**

Die frühere Empfehlung für eine Inselwelt mit freier Klangbibliothek wurde durch W1 + O2 + M3 ersetzt.

### Gemeinsamer musikalischer Klangfaden
**VERWORFEN**

Ein gemeinsames musikalisches Leitmotiv ist nicht vorgeschrieben. Die Klangräume dürfen eigenständige musikalische Identitäten haben.

### Vier Bedürfnisräume
**VERWORFEN**

Ruhe, Kraft, Halt und Freude sind Kartengruppen, keine vier exklusiven Hausbereiche.

### 24 Karten = 24 Orte oder 24 Musikstücke
**VERWORFEN**

Die Anzahl der Karten legt weder die Zahl der Orte noch die Zahl der Kompositionen fest.

### Weltenweberin als allwissende Hausfigur
**VERWORFEN / NICHT KANONISCH**

Die Weltenweberin ist nicht als sprechende, allwissende Hausbewohnerin festgelegt.

### Pflichtreisen, Freischaltungen und Fortschrittsmechaniken
**VERWORFEN**

Sie widersprechen der bestätigten Freiwilligkeit und dem freien Zugang.

---

## 9. Offene Wissenslücken für die weitere Übergabe

Folgende Themen konnten in dieser Überblicksdatei nicht vollständig geklärt werden und gehören in die nachfolgenden Detaildateien:

1. Vollständige Versionsgeschichte aller 2D-Builds.
2. Exakte Bedeutung und Herkunft von arch01, music04, auto1 und intro01.
3. Vollständige redaktionelle Rolle und öffentliche Texte der Weltenweberin.
4. Exakte Definition des Begriffs „Stationen“ in der Anwendung.
5. Vollständige Textbestände und Freigabestatus aller O01–O24-Karten.
6. Vollständige Zuordnung aller Karten zu Räumen und Musik.
7. Vollständiger Stand der Musikstücke, Kompositionsgeschichten und Raumplayer.
8. Exakter Implementierungsstand der acht Raumgeräte in v0.6.66.
9. Vollständiger Status von Startbereich, Begrüßung, Umschlag und Starttour.
10. Vollständiger Stand der lokalen Speicherung, Begleiterkarte und Tagebuchfunktion.
11. Vollständige Abnahme des Offline-Verhaltens auf iOS.
12. Aktueller Live-Stand gegenüber dem Archiv v0.6.66.

---

## 10. Maßgebliche Quellen für diese Übersicht

### Welt und Erzählkanon
- `Weltbibel v1.0 – kompakte Fassung.txt`, 08.10.2026
- `Ein Moment für dich — Entscheidungsvorlage v1.1.txt`, 08.10.2026
- `Weltbibel v1.2 — Das Haus der kleinen Wunder.txt`, 08.10.2026
- `❤️ Masterchat.txt`, Masterentscheidungsprotokoll v1.3, 08.10.2026

### UX und Raumverständnis
- `UX-Hausneugestaltung-Konzept-v0.1.md`, 27.10.2026
- `Oberflaechenplan-v0.1-Seiten-und-wiederverwendbare-Assets.md`, 28.10.2026
- `UX-Uebergabe-v0.2-Hausnavigation-und-Seitenmockups.md`, 28.10.2026
- `7️⃣ UX Design.txt`, 28.10.2026

Diese UX-Dokumente enthalten sowohl bestätigte Rahmenbedingungen als auch Vorschläge. Einzelne Mockup-Inhalte sind nicht automatisch redaktionell freigegeben.

### Funktions- und Versionsprüfungen
- `💭📃Funktion Gedankenblatt entwickeln.txt`, Prüfung v0.6.57
- `EMFD-P08-Inventar-Begleiterkarte-Tagebuch-Umsetzungsvorbereitung-v0.2.md`, 14.11.2026
- `EMFD-P08-Anforderungen-IST-Abgleich-v0.1.md`, 15.11.2026

### Projekt- und Gesprächsquellen
- Frühere Chats zu Welt & Geschichte, Karten, Musik, UX, PWA-Installation und Fehlerkorrekturen.
- Aktueller Übergabeprompt für Claude Code, Stand 18.11.2026.

---

## 11. Selbstprüfung dieser Datei

### Übergeben
- Grundidee und Zweck;
- bestätigter Erzählkanon;
- emotionale Leitlinie;
- Hausregeln;
- bewusste Nicht-Ziele;
- Begriffe und Grundmodell;
- bekannte Versionsmeilensteine;
- bekannte verworfene Ansätze;
- offene Wissenslücken.

### Nicht vollständig übergeben
- vollständige 24 Kartentexte;
- vollständige Raumtexte;
- Musik- und Kompositionsinhalte;
- technische Modul- und Schnittstellenbeschreibungen;
- vollständige 2D-Raumabläufe;
- konkrete Speicher- und Navigationszustände;
- alle historischen Versionsänderungen.

Diese Themen gehören in die Dateien 01 bis 06.

**Ende der Datei 00_ueberblick.md**

<!-- Nachsatz von ChatGPT: Quellenabgleich: Der bestätigte Erzählkanon stammt aus Weltbibel v1.2 und Masterentscheidungsprotokoll v1.3. Die Raum- und UX-Begriffe wurden gegen die UX-Unterlagen geprüft; die Aussagen zum Gedankenblatt und zu v0.6.66 gegen die späteren Bestandsprüfungen (Weltbibel v1.2, ❤️ Masterchat.txt, UX-Hausneugestaltung-Konzept-v0.1.md, UX-Uebergabe-v0.2-Hausnavigation-und-Seitenmockups.md, 💭📃Funktion Gedankenblatt entwickeln.txt, EMFD-P08-Inventar-Begleiterkarte-Tagebuch-Umsetzungsvorbereitung-v0.2.md). Die Definition der Weltenweberin als künstlerische Selbstrepräsentation stammt zusätzlich aus einem früheren Projektgespräch; ihre öffentliche Rollenbeschreibung bleibt ausdrücklich offen. Nächste Datei: `01_raeume.md`. -->

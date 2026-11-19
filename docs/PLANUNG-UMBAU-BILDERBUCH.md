# Umbauplanung · Begehbares Bilderbuch (EMFD-DEV-BOOK-01)

Stand 19.11.2026 · Basis v0.6.67 (= Live v0.6.66 + EMFD-NAV-01) · Verfasst von Claude Code als technische Vorplanung, bevor BOOK-01 in Entwicklungsaufträge zerlegt wird.

## 1. Ist-Stand (Server-first)

- **Live** (`flowisaurus.de/wunderhaus/home/`) ist v0.6.66. Alle 86 Code- und Datendateien sind byte-gleich mit dem Archiv `EMFD-v0.6.66-home-KOMPLETT.zip`, auf dem das Repository aufbaut (geprüft 19.11.2026). Das ältere Archiv v0.6.56 ist nicht Basis.
- **Repository** ist v0.6.67: v0.6.66 + Medien-Loader-Anschluss + korrigierte Tests + EMFD-NAV-01 (nicht veröffentlicht).
- **Gespeicherte Nutzerdaten** gibt es nur im Browser: Licht im Flur, Leseschriftgröße, Musikeinstellungen, Startabläufe/Tutorial, Atelier-Position. **Notizen werden nicht gespeichert** (Gedankenblatt ist bewusst flüchtig); es gibt also keine Notizdaten zu migrieren.

## 2. Wie modular ist der Code für diesen Umbau?

| Baustein | Zustand | Bedeutung für BOOK-01 |
|---|---|---|
| Navigation, Rückwege (`shared/navigation.js`) | modular, getestet | Bleibt. Routenliste und Orte sind aber **fest eingetragen** (`P0[1-8]`, Raumnamen) → auf Raumregister umstellen. |
| Ein Audioplayer (`music-player.js` + `shared/audio.js`) | zentral, aber großer Altbau | Bleibt einzige Audio-Engine. Braucht Wiedergabekontext (PLAYER-01) und einen **Radio-Modus**. |
| Stationen (`shared/stations.js`) | modular | Gerätestationen, Detailansichten, Kartentisch-Nahansicht passen direkt hinein. |
| Karten (Ziehen, Ansicht, Buch, Nahansicht) | modular | Unverändert wiederverwendbar für ORACLE_OBJECT, CARD_DECK, COMPANION_CARD. |
| Gedankenblatt | modular | Bleibt; NOTE-Interaktion öffnet es. |
| Brief/Umschlag (`start-gate.js`) | an `#ankommen` gebunden | LETTER-Interaktion muss den Brief aus einer Szene öffnen können → Aufruf entkoppeln. |
| Tutorial (`start-tour.js`) | fest auf den Flur zugeschnitten | Wird durch ein szenenbezogenes Tutorial (Hinweise am Gegenstand) ersetzt. |
| Hilfe-Register | modular | HELP-Interaktion nutzt es. |
| Licht | nur ein Schalter im Flur (`EMFDHallLight`) | Wird zu einem **Lichtregister** mit IDs und gemeinsamem Zustand. |
| Räume P01–P08, Flur | **nicht modular**: Raumliste, Bilder und Hotspots stehen in `app.js`; Atelier und Teezimmer haben eigene Renderer | Werden durch **eine Szenenkomponente + Datenregister** ersetzt. |
| Funktionsregister (`feature-registry.js`) | modular | Wird von den Szenen-Interaktionen abgelöst; bleibt für Übergangszeit. |
| Medien (Bildprofile, Katalog, Manifest) | modular, aber feste Pfade in Renderern | Szenen dürfen nur **Medien-IDs** kennen; Auflösung Medien-ID → Datei oder Platzhalter zentral. |

**Fazit:** Rund zwei Drittel der Funktionen (Karten, Audio, Gedankenblatt, Bücher, Hilfe, Navigation, Medien) sind bereits so gebaut, dass sie weiterverwendet werden. Neu zu bauen ist die **Raum-/Szenenebene**, die heute aus einzeln programmierten Seiten besteht. Genau dort setzt der Umbau an.

## 3. Zielarchitektur: Daten statt Einzelseiten

Neue Räume, Ansichten, Hotspots, Lichter und Geräte entstehen **nur über Register** (JSON), nicht über neuen Raumcode.

```
Register (JSON)                         Laufzeit
───────────────                         ────────
rooms.json      Räume, Namen, Ort       ─┐
scenes.json     Ansichten, Medien-ID,    │
                Bildabschnitte, Hotspots │──▶ Szenenkomponente ──▶ Interaktions-Handler
lights.json     Licht-IDs, Ansichten     │    (eine für alle)      (je Typ ein kleines Modul,
devices.json    Musikgeräte, Modus,      │                          delegiert an bestehende
                Stücke                   │                          Dienste)
objects.json    O01–O24 im Haus          │
media-register  Medien-ID → Status,     ─┘
                Platzhalter, Datei
```

- **Szenenkomponente:** zeigt ein 16:9-Bild (oder Platzhalter) mit normalisierten Hotspots (0–1 relativ zum Masterbild), drei Bildabschnitte mit Einrasten im Hochformat, Pfeile und Positionsanzeige, Umdrehen per Überblendung. Hotspots sind echte Buttons/Links mit Beschriftung; zusätzlich eine Liste aller Aktionen der Ansicht (Barrierefreiheit, kein Zwang zur Wischgeste).
- **Interaktions-Handler** (Typ → Modul): NAVIGATION → Navigation; VIEW_SWITCH/PAN_VIEW → Szene; LIGHT/FIRE → Lichtregister; ORACLE_OBJECT → Kartenansicht; CARD_DECK/COMPANION_CARD → Ziehen/Begleiterkarte; NOTE → Gedankenblatt; LETTER → Brief; MUSIC_DEVICE → Gerätestation (PLAYER-01); RADIO_TOGGLE → Radio-Modus; DETAIL_VIEW → Station; HELP → Hilfe-Register. Neuer Typ = ein neues kleines Modul, keine Änderung an Räumen.
- **Routen:** `#raum/<RAUM>/<ANSICHT>` (z. B. `#raum/H00/C01`), Detailansichten `#raum/P08/D01`, Geräte `#geraet/<GERÄT>`. Die heutigen Adressen (`#flur`, `#ort/P05`, `#teezimmer` …) bleiben als **Aliase** gültig (QR-Codes, Lesezeichen). Die Routenprüfung liest die erlaubten Räume/Ansichten aus dem Register.
- **Zustände:** Raumzustand je Raum (Blickrichtung, Bildabschnitt) für „zuletzt besuchter Raum“; Lichtzustand je Licht-ID (dieselbe Lampe in zwei Ansichten = ein Zustand); Begleiterkarte (nur Karten-ID, dauerhaft); Tutorialzustand.
- **Medien:** Szenen kennen nur Medien-IDs. Ein zentrales Medienregister liefert Status (PLACEHOLDER, DRAFT, REVIEW, APPROVED, INTEGRATED, VERIFIED), Seitenverhältnis und – sobald vorhanden – die Datei über das Medienmanifest. Platzhalter werden **im Code gezeichnet** (beschriftete Fläche mit Medien-ID und Format), es entstehen keine Ersatzbilder. Austausch gegen das fertige Bild = Eintrag im Manifest/Register, keine Codeänderung.

## 4. Was das für PLAYER-01 bedeutet

PLAYER-01 sollte **jetzt schon so gebaut werden, wie BOOK-01 es braucht**, sonst wird es kurz danach umgebaut:

1. **Geräteregister statt fester Raumgeräte:** `devices.json` mit Geräte-ID (z. B. `MP-P01`), Raum, Name (mit Artikel für Ansagen), Bild-Medien-ID, Modus (`playlist`, später `radio`, `menu` für die Glocke) und Stückliste. Die heutige `room-music-map.json` wird daraus abgeleitet bzw. ersetzt. Elf Geräte später = elf Einträge.
2. **Eine Gerätestation für alle Geräte** (Station `device`), aufgerufen über die Geräte-ID. Die im Auftrag festgelegten Adressen `#ort/P01/geraet`, `#atelier/geraet`, `#teezimmer/geraet` werden umgesetzt und intern auf `MP-P0x` abgebildet; später verlinkt die Szene (MUSIC_DEVICE) auf dieselbe Station.
3. **Wiedergabekontext im zentralen Player** (Quelle, Bindung, Ursprungsraum, Gerät) – genau die Stelle, an der später der Radio-Modus (zufällig, ohne direkte Wiederholung, nur Ein/Aus) andockt.
4. **Orte aus einem Register** statt fest in `shared/navigation.js`, damit EXT, H00, KUE, M01, SCH, BAD ohne Codeänderung dazukommen.

Damit ist PLAYER-01 kein Wegwerfschritt, sondern das Audio- und Gerätefundament des Bilderbuchs.

## 5. Widersprüche, die vor der Umsetzung entschieden werden müssen

| # | Thema | PLAYER-01 / bisherige Entscheidung | BOOK-01 | Empfehlung |
|---|---|---|---|---|
| W1 | Musik beim Raumwechsel | Gerätemusik und Musikzimmer **pausieren** beim Verlassen des Raums | „Laufende Musik bleibt grundsätzlich bei Raum- und Blickrichtungswechseln erhalten.“ | Entscheiden, bevor PLAYER-01 gebaut wird (betrifft den Kern des Wiedergabekontexts). |
| W2 | Teezimmer | Genau zwei Aktionen, **kein Gedankenblatt** (19.11.2026) | Kartentisch mit Begleiterkarte und Gedankenblatt | BOOK-01 ersetzt die Entscheidung für das neue Teezimmer; bis dahin bleibt das alte Teezimmer bei zwei Aktionen. Ausdrücklich bestätigen. |
| W3 | Globale Navigation | Untere Hauptnavigation in v0.6.66 entfernt; NAV-01: keine neue Hauptnavigation | Hauptbereiche Haus, Karten, Musik, Begleiter | Neue Hauptnavigation als eigener Auftrag; Rückweg-Logik aus NAV-01 bleibt. |
| W4 | Gerätename P08 | „Teespieluhr“ | „Porzellanspieluhr“ | Einen Namen festlegen. |
| W5 | Raum-IDs | P01–P08, Flur, Musikzimmer | EXT, H00 (statt Flur?), KUE, M01, SCH, BAD | Ist H00 der heutige Flur? Alias `#flur` → H00 festlegen. |
| W6 | Tageskarte → Begleiterkarte | Ziehen nur für die Sitzung | Dauerhaft gespeichert bis zur nächsten bewussten Wahl | Speicherung nur der Karten-ID auf dem Gerät; bestätigen. |
| W7 | Medienstatus | Manifest kennt `availability`/`release` | PLACEHOLDER … VERIFIED | Status im Medienregister ergänzen und mit der Medien-Konvention (EMFD-MEDIA-CORE) abstimmen. |

## 6. Vorgeschlagene Zerlegung in Entwicklungsaufträge

Jeder Auftrag ist in einer Arbeitssitzung umsetzbar, testbar und lässt die bestehende App funktionsfähig.

| Auftrag | Inhalt | Ergebnis |
|---|---|---|
| **PLAYER-01** (jetzt) | Geräteregister, generische Gerätestation, Wiedergabekontext, Orte aus Register | Fundament Audio/Geräte |
| BOOK-01a | Register (Räume, Szenen, Lichter, Objekte, Medienstatus), Medien-ID-Auflösung mit Platzhaltern, Routen aus Register mit Aliasen | Datenbasis, noch keine sichtbare Änderung |
| BOOK-01b | Szenenkomponente: 16:9, drei Abschnitte mit Einrasten, Pfeile, Positionsanzeige, Hotspots normalisiert, Aktionsliste, Umdrehen | Eine Testszene mit Platzhaltern |
| BOOK-01c | Raumwechsel mit herkunftsabhängiger Blickrichtung, Raumzustand, Hausübersicht | Begehbare Testgruppe |
| BOOK-01d | Außenbereich EXT-C01/C02, Brief aus der Szene, Glocke, szenenbezogenes Tutorial | Eingang wie geplant |
| BOOK-01e | Halle, Küche, Innenhof, Teezimmer (v0.7-Szenen), Lichtregister, Feuer | v0.7-Hausgruppe |
| BOOK-01f | Radio-Modus, Hofwindspiel, Porzellanspieluhr an den Szenen | Musikgeräte v0.7 |
| BOOK-01g | Begleiterkarte, Kartentisch-Nahansicht, Gedankenblatt im Teezimmer | Begleiterbereich |
| BOOK-01h | Globale Navigation (Haus, Karten, Musik, Begleiter), Darstellungspräferenzen | Hauptnavigation |
| BOOK-01i | Testversion, Regression, Gerätetests, Schnittstellenbeschreibung für die Bildproduktion | Abnahmefähige v0.7-Testversion |

## 7. Testversion und Rückfallstrategie

- Das Bilderbuch entsteht **im selben Code**, aber hinter eigenen Routen (`#raum/…`); die heutige App bleibt unverändert nutzbar. Für die Testversion wird ein eigener Ordner ausgeliefert (Vorschlag: `wunderhaus/home/test/` bzw. nach Medien-Konvention eine eigenständige Umgebung mit eigenem Medienordner). Live bleibt v0.6.66, bis eine Freigabe erfolgt.
- Umschalten von der alten auf die neue Startansicht ist eine Konfigurationsänderung; Rückfall = Umschalten zurück. Alte Adressen bleiben als Aliase gültig.

## 8. Schnittstelle zur Bildproduktion (Vorschau)

Für jedes Bild liefert die Bildproduktion: Medien-ID (z. B. `scene.H00-C01`), Format 16:9, Pixelmaße, Status, Datei. Für Hotspots, Lichter und bewegliche Teile: normalisierte Koordinaten (x, y, Breite, Höhe von 0 bis 1) bzw. Drehpunkt relativ zum Masterbild sowie Licht-/Objekt-/Geräte-ID. Die genaue Vorlage (Tabelle oder JSON) entsteht mit BOOK-01a.

# EMFD-Rückmeldung · EMFD-P03-DEV-01 · Wintergarten integrieren
Datum: 20.11.2026 · Ergebnis: umgesetzt (Architekturabweichungen dokumentiert, siehe unten) · Commit: COMMIT auf `claude/p03-01` · App v0.6.85 (Testversion, Grundlage `claude/p08-01` v0.6.84)

## Was sich für die Person ändert
- **Der Wintergarten ist ein begehbares Bild:**
  - P03-C01: vom Teezimmer in den Wintergarten, mit Blüte, Wurzel und Klangschale.
  - P03-C02: Blick zum Teezimmer, mit Klangschale, Durchgang und Hoföffnung.
  - Dazu die gemeinsame Kopfzeile (Musik, Hilfe) und „Dein Moment“.
  - `#ort/P03` und die Kachel im Raumverzeichnis führen jetzt in die Szene (Entscheidung vom 20.11.2026).
- **Einstiege:**
  - Aus dem Teezimmer (Wintergarten-Öffnung in P08-C01) und direkt: C01 Mitte, die Wurzel im Blick.
  - Aus dem Innenhof: Die bisherige Innenhofseite hat einen Link „In den Wintergarten“. Er führt **vorläufig** nach C01 links, mit der Hoföffnung im Blick.
- **Ausgänge:**
  - Durchgang in C02 → Teezimmer C02 Mitte (Blick nach Süden).
  - Hoföffnung (C01 links, C02 rechts) → bisherige Innenhofseite.
- **Smartphone:**
  - Je Blickrichtung drei Ausschnitte: A1 Blüte und Hof, A2 Wurzel, A3 Klangschale und Glaswand; B1 Klangschale, B2 Durchgang, B3 Hoföffnung.
  - Der mittlere Ausschnitt liegt auf seinem Schwerpunkt; in C02 ist der Durchgang ganz zu sehen.
  - Tablet quer und Desktop zeigen das ganze Bild.
- **O05 „Die geschlossene Blüte“ und O13 „Die Wurzel“:**
  - Antippen öffnet das gemeinsame Gegenstandspaneel, „Karte ansehen“ die vorhandene Karte mit Originalbild, Texten und Frage.
  - Von dort gibt es „Mitnehmen“ (Mäppchen) und das Gedankenblatt.
  - Die Blüte ist auch in C02 antippbar.
- **Klangschale:** Antippen öffnet die vorhandene Gerätestation der Klangschale.
  - Sie zeigt die finalen Cover und die Liste O21/O13/O10/O05.
  - Abspielen, Pause und Titelwechsel laufen über die gemeinsame Steuerung.
  - Das Öffnen startet nichts.
- **Musik im ganzen Haus (neue Entscheidung D-16):**
  - Beim Wechsel in einen anderen Raum pausiert die Musik und setzt nicht von selbst fort.
  - Umdrehen, Ausschnitte, die Gerätestation des Raums, Karten und die Rückkehr in denselben Raum unterbrechen nichts.
- **Auf allen Geräten:** Trefferflächen bleiben unsichtbar, es liegen keine zusätzlichen Objekte über dem Bild.

## Abweichungen vom Auftrag (mit Grund)
1. **Musik beim Raumwechsel (Auftrag 6.5/6.6):**
   - Das widersprach W1. Auf Rückfrage hat die Projektinhaberin entschieden: „Überall pausieren“.
   - Umgesetzt im gemeinsamen Player für alle Räume, nicht nur für die Klangschale.
   - Eingetragen als D-16 im gemeinsamen Register, W1 ist dort markiert.
2. **Bisherige Wintergartenseite:** Auf Rückfrage („Auf Szene umstellen“) ist `#ort/P03` jetzt ein Alias der Szene. Die bisherige Seite mit Raumbild und Kategorien entfällt. Gerätestation und Karten bleiben unverändert erreichbar.
3. **Dateinamen:** Die Illustrationen kamen als Chat-Anhang ohne Dateinamen. Sie liegen unverändert als `media/rooms/szenen/P03-C01-p03-dev01-9d94bbc2.png` und `…/P03-C02-p03-dev01-e68c0cde.png` (1672 × 941), wie die Küchen- und Hallenreferenzen. Liefert die Produktion andere Namen oder WebP-Fassungen, genügt ein Registereintrag.
4. **Musikinteraktion:** Die Klangschale öffnet die vorhandene Gerätestation (eigene Adresse `#ort/P03/geraet`) und kein neues Paneel. Nur dort gibt es Cover, Titelliste und Titelwechsel. Sie gilt als Teil des Raums, deshalb pausiert dort nichts.
5. **Ausschnitte:**
   - L und R bleiben an den Bildrändern, damit Umdrehen beim Weiterwischen am Rand gleich funktioniert.
   - Nur M wird auf den Schwerpunkt zentriert, über eine allgemeine, abwärtskompatible Erweiterung von `EMFDScene`.
   - Die Fenster A1/A3/B1/B3 entsprechen damit den Bildrändern.
6. **Blüte:** Die Trefferfläche umfasst Blüte, Pflanze und Topf. Auf dem iPhone liegt die Blütenmitte unter dem Knopf „Umdrehen“ (in der Abnahme gefunden).
7. **Licht:**
   - Die Stimmungen Tag, Abend und Nacht sind im Lichtregister angelegt (`lichtSzenen.P03-C0x.stimmungen`, `EMFDRegistry.lightMood`), aktiv ist nur Abend.
   - Es gibt keine Umschaltung und keine bewegten Effekte.
   - Schaltbare Lampen (Hängelaterne, Wandlaternen) sind nicht angelegt, weil Licht-Ebenen fehlen. Beides ist laut Auftrag noch nicht gefordert.
8. **Raumgeometrie:** Am Hausmodell ist nichts geändert. `rooms.json` führt weiter K-04 mit dem Vorschlag 4 × 6 m, den Wert 4,00 × 4,00 m habe ich nicht eingetragen. Das ist Sache der Architekturfreigabe, weil der Auftrag stillschweigende Modelländerungen ausschließt.

## Antworten auf die offenen Fragen
- **Bestehende Musikzuordnung:** MP-P03 „Klangschale“ hat im Register die Stücke O21, O13, O10, O05 (gleich der historischen Zuordnung). Ich habe sie unverändert gelassen; ihre Bestätigung als produktive Playlist steht aus.
- **Eintrittsperspektive:**
  - Aus dem Teezimmer: C01 Mitte, gleich der Blickrichtung Nord durch den Durchgang.
  - Aus dem Innenhof: C01 links, **vorläufig**. Die Westtür hat keine Blickrichtung nach Osten, deshalb soll die Hoföffnung zu sehen sein.
  - Ins Teezimmer: P08-C02 Mitte.
  - Alle Einträge stehen im Register und lassen sich ohne Code ändern.
- **Architektur- und Bildprüfung** (ausführlich im Paket `docs/development/auftraege/EMFD-P03-DEV-01/README.md` im gemeinsamen Repository):
  - Glasdach, Profile und Steinwand: stimmig. **Abweichung:** Die Ostseite ist in C01 eine Glaswand, in C02 eine Steinwand mit Bildern und Laterne.
  - Hofdurchblick: plausibel, im nördlichen Teil der Westseite in beiden Bildern. Die Türform entscheidet D16/T05 nicht; der Hotspot trägt `D16`.
  - O14: nur im Innenhof (Bank draußen).
  - O21: in keinem Bild. O13 ist als Baum mit Wurzelschale innen vor der Nordwand klar abgegrenzt.
  - O05/O13: korrekt zugeordnet und in beiden Bildern stimmig platziert.
  - **Abweichung Klangschale:** In C01 steht sie vorn rechts (Südost), in C02 vorn links (Nordost). Die Positionen widersprechen sich.
  - Durchgänge und Boden: frei.
  - Teezimmer: Die Verbindung ist erkennbar (Rundbogen, runder Tisch, blaue Stühle). **Abweichung:** Der Bogen wirkt schmaler als 2,80 m.
- **Wiederverwendete Komponenten:** `EMFDScene`, `EMFDSceneChrome` (Kopfzeile, Dein Moment, Gegenstandspaneel), Gerätestation, `EMFDAudio`/`EMFDMusic`, `EMFDRegistry`, `EMFDNavigation`, Lichtplan. Neu ist nur `home/winter-garden.js` als Verbindung zwischen ihnen.
- **Geänderte Dateien für die zentrale Integration:**
  - **Global:** `home/music-player.js` (D-16), `home/shared/scene.js` (Ausschnitt M, Lichtstimmung), `home/shared/registry.js` (`lightMood`, `winterGarden`), `tools/build-registry.mjs`, `home/app.js` (Router P03, Übergänge bisheriger Raumseiten).
  - **Raum:** `home/winter-garden.js`, `home/index.html`, `home/emfd-scene.css`, `home/data/registry-app.json`, `home/data/registry.js`.
  - **Gemeinsames Repository:** `manifests/quellen/szenen-hotspots.json`, `tools/build_registers.py`, `manifests/scenes.json`, `manifests/rooms.json`.
  - **Abhängigkeit:** Die Hotspots kommen über `scenes.json`. Erst den Commit im gemeinsamen Repository übernehmen, dann `node tools/build-registry.mjs`.

## Tests
- **`npm test`:** 421 bestanden, 0 fehlgeschlagen, 1 übersprungen. Neu ist `tests/p03-wintergarten.test.cjs` mit 8 Verhaltenstests:
  - Router mit Attrappen
  - Register und Hotspots
  - Wege mit sessionStorage
  - Objekt- und Gerätezugriff
  - Ausschnitte als Rechenmodell iPhone 13
  - Lichtstimmung
  - D-16 im echten Player-Code mit Audio-Attrappe
  - Offline-Liste
- **Angepasst:** Sieben bestehende Tests erwarteten `#ort/P03` als bisherige Seite. Sie erwarten jetzt die Szenenadresse; das Beispiel für Umleitungen ist auf den Innenhof umgestellt.
- `python3 tools/media_check.py`: keine neuen Fehler, 2 neue Hinweise (Dateinamen der Szenenreferenzen). `bash tests/run_tests.sh`: 0 Fehler.
- **Browser-Abnahme (iPhone 13 und 1440 × 900, echte Illustrationen, Test-MP3): 45/45**

| Test aus Abschnitt 10 | Ergebnis |
|---|---|
| Eintritt aus Teezimmer | PASS (C01 Mitte) |
| Eintritt aus Innenhof | PASS (Link auf der Innenhofseite → C01 links) |
| C01/C02 wechseln | PASS (Umdrehen, L→R) |
| Smartphoneausschnitte | PASS (alle sechs, Schwerpunkt jeweils im Bild) |
| O05 antippen | PASS (C01 und C02 → Karte O05) |
| O13 antippen | PASS (→ Karte O13) |
| Klangschale antippen | PASS (Gerätestation, 4 Cover) |
| Musik starten | PASS (Öffnen startet nichts, Start erst auf Tippen, Titelwechsel) |
| Raum verlassen | PASS (Durchgang → Teezimmer: pausiert; Rückkehr: bleibt pausiert) |
| Begleiterkarte öffnen | PASS (Mitnehmen über das Mäppchen) |
| Gedankenblatt öffnen | PASS (über „Dein Moment“) |
| Wide-Ansicht | PASS (Seitenverhältnis 1,777 = Datei; Tablet hochkant → Ausschnitte) |

  Zusätzlich: Hoföffnung → Innenhof, Hilfe und Aktionsliste, unsichtbare Trefferflächen, keine JS-Fehler.
- **Nicht getestet:**
  - Echte iOS-Hardware: abgedeckt nur durch die Chromium-Emulation.
  - Echte Musikdateien O21/O13/O10/O05: sie liegen nicht im Repository, im Test war es eine lokale Test-MP3.
- **Regression (Browser-Protokolle):** siehe Nachtrag.

## Neue offene Punkte / Fragen an die Planung
1. **Architekturfreigabe:** D16 (1,00 m Schiebetür) oder T05 (1,40 m); Raummaß 4,00 × 4,00 m in `rooms.json` (K-04).
2. **Bildkorrekturen:** Ostwand Glas (C01) oder Stein (C02)? Wo steht die Klangschale, Südost oder Nordost? Soll der Durchgang zum Teezimmer auf 2,80 m verbreitert werden?
3. **Endgültige Eintrittsperspektive aus dem Innenhof.** Sobald der Innenhof eine Szene ist, gilt die Hoföffnung auch umgekehrt.
4. **Playlist der Klangschale O21/O13/O10/O05:** als produktiv bestätigen oder ersetzen.
5. **Upload:** Die beiden PNG gehören nach STRATO `/wunderhaus/media/rooms/szenen/`. Liefert die Produktion WebP-Fassungen (je etwa 3,2 MB als PNG)?
6. **Lichtzustände:** Bilder für Tag und Nacht sowie Licht-Ebenen für Hängelaterne und Wandlaternen, um sie schaltbar zu machen (LIGHT-01).
7. **D-16 und andere Räume:** Eingang → Halle ist jetzt ein Raumwechsel, also pausiert dort die Musik. Ein älteres Hallenprotokoll (D-06) erwartete Weiterspielen. Soll der Übergang Eingang → Halle als ein Raum gelten?

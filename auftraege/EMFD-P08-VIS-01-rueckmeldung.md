# EMFD-Rückmeldung · EMFD-P08-VIS-01 · Teezimmer (Bildkandidaten v0.7-r1)
Datum: 20.11.2026 · Ergebnis: umgesetzt (Bildfreigaben offen, siehe unten) · Commit: ec3eac9 auf `claude/p08-01` · App v0.6.84 (Testversion, Grundlage `claude/integration-01` v0.6.83)

## Was sich für die Person ändert
- **Das Teezimmer ist ein begehbares Bild:** P08-C01 (Blick nach Norden zum Wintergarten) und P08-C02 (Süd, Sitzbank, Kachelofen), mit der gemeinsamen Kopfzeile und „Dein Moment“, das beim Eintreten geschlossen ist.
- **Einstiege:**
  - Aus der Halle (beide Teezimmertüren): C01 links.
  - Direkt `#raum/P08`: C01 Mitte.
  - Beim Umdrehen wechseln links und rechts, die Mitte bleibt Mitte.
- **Ausgänge:**
  - Tür T03 aus C01 → Halle H00-C01 rechts; aus C02 → H00-C02 links.
  - Der Wintergarten führt vorläufig in die bisherige Wintergartenseite.
- **Licht und Ofen:** Deckenlaterne, Wandlaternen, Sitzbanklampe, Windlicht am Kartentisch, Laterne am Spieluhrtisch und der Kachelofen sind einzeln schaltbar.
  - Sie erlöschen mit echtem Bild: Aus-Basis plus Ein-Ebene je Lampe.
  - Gleiche Lampen behalten ihren Zustand über beide Ansichten.
  - Der Ofen blendet in 1 s über.
  - „Alle Lichter im Raum“ gibt es über die Hilfe.
- **Kartentisch:** Die Nahansicht D01 zeigt den Stapel mit der Originalrückseite. Beim Öffnen wird nichts gezogen und keine Musik gestartet.
  - „Eine Karte ziehen“ startet die bisherige verdeckte Ziehung und führt danach ins Teezimmer zurück.
  - „Eine Karte aussuchen“ öffnet die Kartengalerie.
  - Die Begleitung bleibt unberührt.
- **Spieluhr:** Die Nahansicht zeigt die statische Walzenansicht. „Spieluhr spielen“ startet die Geräte-Playlist O24/O04/O06 über den gemeinsamen Player, nur auf Tippen.
  - Anhalten und Fortsetzen funktionieren.
  - Beim Schließen spielt sie weiter, „Beenden“ hält sie an.
- **O04 „Das Kissen“** (C02) öffnet das gemeinsame Gegenstandspaneel.
- **Dabei behoben (alle Räume):** Wird das Fenster von breit auf schmal verkleinert, wechselt die Szene jetzt wieder in die Ausschnitte. Vorher blieb sie in der Ganzbild-Darstellung hängen.

## Abweichungen vom Auftrag (mit Grund)
1. **Alte Teezimmerseite bleibt:** `#teezimmer` bleibt die bisherige Seite. Das neue Teezimmer hat im Register die Szenenadresse `#raum/P08/C01` (`raeume.P08.szene`). Hallentüren, direkter Einstieg und Szenenwege führen ins neue Teezimmer. Raumverzeichnis, Kartenrückwege und die zwei bisherigen Teezimmeraktionen hängen an `#teezimmer` (W2, 18 bestehende Tests). Sie werden ohne Freigabe nicht umgebogen.
2. **Hallendurchblicke nicht eingebunden:** Die T03-Durchblicke passen laut `visualSupplement.hall` nur zu H00-Mastern mit SHA `92852001…` (C01) und `6d91bd78…` (C02). Die App nutzt H00-C01 `0cd60aa4…` (PNG vom 20.11.) und H00-C02 `c4451a14…` (Referenz). Es gibt also keine exakte Übereinstimmung, deshalb habe ich sie nicht verwendet.
3. **Ausschnitte:** Die App nutzt ihre vorhandene Ausschnittlogik L/M/R über dieselbe Bühne. Die sechs Zuschnitte aus der JSON (je 624 × 936, 104 px Überlappung) entsprechen dem auf iPhone-Breite, `qa/crops/` dient als Vergleich. Ein festes Pixelfenster je Ausschnitt ist nicht eingebaut.
4. **Medien:** Die Raumbilder kommen als WebP 1280 × 720 (an/aus), die Licht-Ebenen als PNG 1664 × 936. Gleiche Bühne, normierte Koordinaten. Die verlustfreien Originale sind nicht eingebunden. Alle Dateien liegen auf STRATO `/wunderhaus/media/rooms/P08/` und nicht im Repository (`.gitignore`).
5. **Lampen-Trefferflächen:** Sie sind an den Quellbildern innerhalb der Lichtbereiche der Ebenen geschätzt. Die Zuordnung liefert Polygone nur für Türen, Objekte, Tisch, Spieluhr und Ofen.

## Antworten auf die offenen Fragen
- **Prüfsummen:** Alle 30 mitgesendeten Paketdateien und alle 67 Medien unter `media/rooms/P08/` stimmen mit `SHA256SUMS.txt` überein. Auf STRATO liegen alle 67 vollständig (HTTP 200, Größe gleich).
- **Lichtmischung:** Aus-Basis + Kartenstapel + je Lampe eine Ein-Ebene mit `mix-blend-mode: plus-lighter`. Das ist die sRGB-Addition aus `lighting.blend`. Mehrere Lampen addieren sich.
- **O04:** O04 ist im Raumbild enthalten. Die Ebene `P08-C02__O04.png` ist nicht verwendet, sonst wäre das Kissen doppelt.
- **Kartenrückseite:** Der Stapel nutzt die registrierten Stapel-Ebenen; diese zeigen die Rückseite v1.2. Den zentralen Pfad der Rückseite (404 auf dem Server) habe ich nicht verändert, siehe offene Punkte.
- **Eingebundene Medien-IDs (20):**
  - Raum: `scene.P08-C01.wide-ein`, `scene.P08-C01.wide-aus`, `scene.P08-C01.kartenstapel`, `scene.P08-C02.wide-ein`, `scene.P08-C02.wide-aus`, `scene.P08-C02.kartenstapel`
  - Licht C01: `light.LIGHT-P08-DECKE.P08-C01`, `light.LIGHT-P08-WAND-NORD.P08-C01`, `light.LIGHT-P08-KARTENTISCH.P08-C01`, `light.LIGHT-P08-SPIELUHRTISCH.P08-C01`
  - Licht C02: `light.LIGHT-P08-DECKE.P08-C02`, `light.LIGHT-P08-WAND-SUED-L.P08-C02`, `light.LIGHT-P08-WAND-SUED-R.P08-C02`, `light.LIGHT-P08-BANK.P08-C02`, `light.LIGHT-P08-KARTENTISCH.P08-C02`, `light.LIGHT-P08-SPIELUHRTISCH.P08-C02`, `light.LIGHT-P08-OFEN.P08-C02`
  - Nahansichten: `scene.P08-D01.detail`, `scene.P08-D01.kartenstapel`, `device.MP-P08.nahansicht`
- **Betroffene Dateien:**
  - neu: `home/tea-room.js`
  - geändert: `home/shared/scene.js` (Ebene `licht`, Auflagen, Wide-Erkennung), `home/shared/registry.js` (Szenenadresse neben bisheriger Seite), `home/app.js` (Router), `home/emfd-scene.css`, `home/emfd-ui/css/emfd-ui.css` (Nahansichten), `home/data/registry-app.json`, `tools/build-registry.mjs`
  - Tests: `home/tests/p08-tearoom.test.cjs`, Doku
  - gemeinsames Repository: `manifests/quellen/szenen-hotspots.json` (19 Trefferflächen, Hallentüren mit Einstieg L), `manifests/scenes.json`, Paketdokumente

## Tests
- **`npm test`:** 413 bestanden, 0 fehlgeschlagen, 1 übersprungen. Neu ist `tests/p08-tearoom.test.cjs` mit 6 Tests:
  - Adressen
  - Wege nach der Herkunftsmatrix
  - Zielbereiche gegen `Medienzuordnung.json`
  - Licht-Ebenen und Basis gegen die Zuordnung
  - Nahansichten ohne Ziehen und ohne Autoplay
  - Offline-Liste
  - Angepasst: drei Erwartungen, weil `#raum/P08/…` jetzt Szene ist und es die Lichtebene `licht` gibt.
- **Browser-Abnahme (iPhone 13 und 1440 × 900, echte Medien): 22/22.**
  - P-01: Einstieg aus der Halle → C01 L
  - P-02: direkt → C01 M
  - P-03: Umdrehen L→R, M→M (Wide: Gegenansicht)
  - P-04: sechs Ausschnitte bzw. Wide mit automatischem Rückfall
  - P-05: Licht und Ofen (7 additive Ebenen, einzeln, gleiche ID über Ansichten)
  - P-06: O04
  - P-07: Kartentisch D01 mit Originalstapel, ohne Ziehen beim Öffnen, Ziehung mit Rückweg
  - P-08: Spieluhr-Playlist nur auf Tippen, Pause, läuft nach Schließen weiter
  - P-09: Ausgänge zur Halle
  - P-10: Aktionsliste mit allen (auch abgeschnittenen) Zielen
  - keine JS-Fehler
- **Regression:** siehe Nachtrag.

## Neue offene Punkte / Fragen an die Planung
1. **Bildfreigaben** (Stand Produktionsbericht): Wintergarten-Gegenansicht P03 → P08, Spieluhrmechanik (Walze oder Figuren), Textilien (Läufer, Tartan – standardmäßig aus), native Wide-Zielauflösung.
2. **Hallendurchblicke:** Welche Hallenbilder gelten? Die App nutzt C01 `0cd60aa4…` und C02 `c4451a14…`. Die Durchblicke brauchen `92852001…` und `6d91bd78…` (Hallenproduktion VIS-01, liegt nicht vor).
3. **Soll `#teezimmer` (Raumverzeichnis, „Das Haus“, Kartenrückwege) auf das neue Teezimmer umgestellt werden?** Damit endet W2 („bisheriges Teezimmer genau zwei Aktionen“). Kartenziehen und -aussuchen liegen jetzt am Kartentisch.
4. **Kartenrückseite v1.2 (zentraler Pfad):** Sie liefert auf dem Server 404. Bitte `media/optimized/cards/EMFD_Kartenrueckseite-v1.2-630x1080-3d4d2cb907.webp` (liegt in `quellen/karten/`) nach `/wunderhaus/media/optimized/cards/` hochladen.

## Nachtrag · Regression (Browser-Protokolle, v0.6.84)
Eingang/Einführung 60/60 · Küche 69/0 · Licht 33/33 · Mäppchen 18/18 · Halle 48 PASS, 7 erwartete Abweichungen aus gewollten Änderungen: H00-T25 (2×, Teezimmertür führt jetzt ins neue Teezimmer `#raum/P08/C01` statt `#teezimmer`), H00-T23 (2×, Küche hat eine Ansicht), H00-T19 (2×, „Begleiter“ öffnet das Mäppchen), H00-T06 (Direkteintritt ohne Begrüßung).

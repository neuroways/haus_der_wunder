# EMFD-Rückmeldung · EMFD-LIGHT-01 · Verbindliche hausweite Lichtsteuerung
Datum: 20.11.2026 · Ergebnis: technisch umgesetzt; die visuelle Abnahme wartet auf die Lichtebenen von Work · Commit: siehe unten auf `claude/light-01` · App v0.6.81
Ausgangsbasis: aktuellster Teststand `claude/h00-direkt` (v0.6.80: Küche, Halle mit neuer C01-Fassung, Direkteintritt). Das Mäppchen (`claude/maeppchen-01`, v0.6.79) ist ein paralleler Stand und hier nicht enthalten; beim Zusammenführen ist kein Konflikt in der Lichtlogik zu erwarten.

## Was sich für die Person ändert
- **Eine Lampe antippen:** Genau diese Lampe geht aus. Flamme bzw. Leuchtmittel erlöschen, der Lichtschein ringsum verschwindet, und der Raum wird etwas dunkler. Die anderen Lampen leuchten weiter. Erneutes Antippen macht alles wieder hell.
- **Zustand bleibt:** Er gilt in beiden Blickrichtungen, in jedem Smartphone-Ausschnitt, im Wechsel zwischen Smartphone und Wide, beim Verlassen und Wiederkommen und nach dem Neuladen.
- **Alle Lichter eines Raumes:** Hilfe → „Alle Lichter im Raum ausschalten“ bzw. „einschalten“. Es gibt keinen zusätzlichen Schalter im Bild.
- **Radio-Nahansicht:** Sie zeigt die Lampen im selben Zustand wie der Raum, z. B. die Laterne auf der Kommode.
- **Übergänge:** sanft – elektrisch 400 ms, Laternen und Außenlicht 600 ms. Bei reduzierter Bewegung sofort.

## Abweichungen vom Auftrag (mit Grund)
1. **Keine finalen Lichtebenen vorhanden** (`assets/lighting/` ist leer). Kein vorhandenes An/Aus-Paar passt zu den heutigen Szenen: `flur-v2`/`flur-v2-dim` gehört zur früheren Flurseite. Deshalb laufen vorläufige, gekennzeichnete Platzhaltermasken:
   - Quelle erlischt (dunkler Kern)
   - Lichtschein verschwindet (weiter Hof)
   - Raumabdunklung je nach Anteil ausgeschalteter Quellen
   Sie gelten nicht als visuell freigegeben.
2. **Natürliches Licht:** Die vorläufige Raumabdunklung dämpft Fenster leicht mit (höchstens 28 %). Exakt erhalten bleibt natürliches Licht erst mit Base- bzw. Ambient-Ebene. Mit einer Base ersetzt die Engine den Master, und Platzhalter entfallen automatisch.
3. **Raumschaltung:** „Alle Lichter im Raum“ liegt in der Hilfe, weil kein dauerhafter Schalter ohne Gestaltungsfreigabe erlaubt ist. Physische Wandschalter gibt es in den Bildern bisher nicht. Der Hotspot-Typ `LIGHT_SWITCH` (Gruppe, Liste oder Raum) ist vorbereitet.
4. **Räume ohne Szene** (Innenhof, Teezimmer, Atelier …) haben noch keine Lichtquellen. Sie kommen mit ihrer Szene über dasselbe Register dazu; der Generator lässt keine Licht-ID ohne Registereintrag durch.

## Antworten auf die offenen Fragen
- **Vorhandene Lichtsteuerung:**
  - `EMFDLights` (Zustand je ID) ist zur LightEngine ausgebaut, mit derselben API plus `activate`, Gruppen und Raum, `duration` und Standard aus dem Register.
  - Der Flurlicht-Altwert `emfd.house.light.v1` wird weiter gelesen.
  - Die Raummodule (Eingang, Halle, Küche) rufen nur noch `EMFDLights.activate(hotspot)` auf. Ihre eigenen Lichtzeichnungen und Listener sind entfernt.
- **Szenenkomponente:**
  - `lightLayers()` baut den Stapel Base → Ambient → Source/Spill/Glow/Reflection → An/Aus-Paar → Platzhalter, in derselben Bühne wie das Raumbild, also mit gleichem Koordinatensystem, gleicher Transformation und gleichem Zuschnitt.
  - Die Szene abonniert die Engine selbst.
- **Raumregister:** `registry-app.json` → `lichter` (14 Quellen) und `lichtSzenen`. `build-registry` prüft jede Licht-ID aus den Szenen und jede Ebenen-Medien-ID.
- **Verbindlicher Standard:** Ergänzt sind Entwicklungsrichtlinien (`CLAUDE.md`), Szenenkomponente (Kopfkommentar), Raumkonfiguration und Medienregister (`lichtHinweis`), Produktionsvorlage, Checkliste und QA (`docs/LICHT-STANDARD.md`), Entscheidungsprotokoll, Codekarte und Planungs-Prompt.

## Tests
- **`npm test`:** 396 bestanden, 0 fehlgeschlagen, 1 übersprungen. Neu ist `tests/light-01.test.cjs` mit 6 Verhaltenstests:
  - Register
  - Zustand je Quelle, perspektivübergreifend, gespeichert
  - Antippen, Schalter, Gruppe, Raum
  - Dauer und reduzierte Bewegung
  - Ebenen mit und ohne Medien, An/Aus-Paar
  - Pflicht der Engine in allen Räumen
- **Browser-Abnahme** (Smartphone hoch, Smartphone quer, Tablet, Wide): **33 von 33 bestanden.**
  - L-01: Quelle aus, Schein weg, andere bleiben, Raum dunkler
  - L-02: Umdrehen und gleiche ID
  - L-03: Ausschnitt und Layoutwechsel; Ebenen deckungsgleich
  - L-04: Rückkehr und Reload
  - L-05: alle Lichter des Raumes
  - L-06: dunkler Raum bedienbar
  - L-07: Musik läuft weiter, Begleitung und Hinweise unverändert
  - L-08: Radio-Nahansicht folgt
  - L-09: Eingang und Halle (O08-Paneel)
  - L-10: reduzierte Bewegung
  - keine JS-Fehler
- **Regression Eingang, Halle, Küche:** siehe Nachtrag.

## Fehlende Medien (an Work)
Siehe `docs/LICHT-STANDARD.md` §7. Es fehlen:
- für alle 14 Lichtquellen in 18 Ansichten die Ebenen source, spill, glow, reflection
- je Szene (EXT-C01, H00-C01, H00-C02, KUE-C01, KUE-C02) die `licht-basis` (Raum ohne Kunstlicht), ggf. `ambient`
- Alternativ als Übergang je Szene ein vollständiges An/Aus-Paar im Mastergeometrieformat.

## Neue offene Punkte / Fragen an die Planung
1. Lichtebenen bei Work beauftragen (Produktionsvorlage in `docs/LICHT-STANDARD.md` §4), zuerst H00-C01 in der neuen Fassung.
2. Gibt es physische Wandschalter in kommenden Bildern? Wenn ja, als `LIGHT_SWITCH`-Hotspot mit Gruppe.
3. Soll die Raumschaltung „Alle Lichter“ zusätzlich eine sichtbare Gestaltung bekommen (BOOK-01h)?

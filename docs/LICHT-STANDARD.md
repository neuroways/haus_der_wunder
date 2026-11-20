# EMFD-LIGHT-01 · Verbindlicher Licht-Standard (hausweit)

Gilt für **alle bestehenden und künftigen Räume, Ansichten und Nahansichten**. Licht ist keine Raumfunktion, sondern eine gemeinsame Funktion des Bilderbuchs. Eigene Lichtlösungen pro Raum sind nicht zulässig.

## 1. Entwicklungsrichtlinie
- Schalten nur über die **LightEngine** `EMFDLights` (`home/shared/lights.js`): `get/set/toggle`, `activate(hotspot)`, `setRoom/toggleRoom`, `toggleMany`, `subscribe`, `duration`. Raum-Module rufen bei Licht-Hotspots ausschließlich `EMFDLights.activate(hotspot)` auf.
- Darstellen nur über die **Szenenkomponente** `EMFDScene` (`home/shared/scene.js`, `lightLayers()` und `applyLight()`). Die Szene folgt der Engine selbst; Räume rendern kein Licht.
- Nahansichten und Detailinteraktionen, die einen Ausschnitt eines Raumbildes zeigen, verwenden denselben Bühnenaufbau (Bild und `lightLayers()` im selben Koordinatensystem). Ein CSS-Hintergrundausschnitt ohne Lichtstapel ist nicht zulässig.
- Kein Helligkeitsfilter auf dem ganzen Raumbild als Lösung. Natürliches Licht (Fenster, Mond) und Geräteanzeigen (z. B. Radio-Leuchten) sind **keine** Lichtquellen der Engine.
- Kein dauerhaft sichtbarer zusätzlicher Schalter ohne gestalterische Freigabe. „Alle Lichter im Raum“ steht in der Hilfe; physische Schalter sind Hotspots im Bild.

## 2. Raumkonfiguration (Lichtregister)
`home/data/registry-app.json` → `lichter` (Pflicht für jede Licht-ID einer Szene; der Generator `tools/build-registry.mjs` bricht sonst ab) und `lichtSzenen`.

| Feld | Bedeutung |
|---|---|
| Licht-ID | `LIGHT-<RAUM>-<QUELLE>`, stabil. **Eine physische Quelle = eine ID** in allen Räumen und Blickrichtungen. |
| `art` | deckenlampe · wandlampe · tischlampe · stehlampe · unterbau · lichterkette (400 ms) · laterne · kerze · aussen · magisch (600 ms) · kamin (1000 ms) |
| `standard` | Anfangszustand (true = an) |
| `dauer` | Übergang in ms (sonst aus der Art); reduzierte Bewegung = 0 |
| `gruppen` | Gruppen-IDs für Gruppenschalter (`ziel.gruppe`) |
| `ansichten.<Szene>.ebenen` | `source`, `spill`, `glow`, `reflection` = Medien-IDs (Vollbild-Ebenen) |
| `lichtSzenen.<Szene>` | `basis` (Raum ohne schaltbares Kunstlicht), `ambient` (natürliches Licht), `paar` {`an`,`aus`,`lichter`} (vollständiges An/Aus-Bildpaar als Übergang) |

Hotspots: `typ:'LIGHT'` mit `ziel.licht` (Antippen der Quelle) · `typ:'LIGHT_SWITCH'` mit `ziel.lichter` [IDs], `ziel.gruppe` oder `ziel.raum` (physischer Schalter / Raum). Gruppe: Ist eine Quelle an, gehen alle aus, sonst alle an.

## 3. Medienregister (Ebenen)
Alle Ebenen sind Bilder **im exakten Format und Ausschnitt des Szenenmasters** (gleiche Pixelmaße, gleiche Geometrie, transparenter Rest), registriert als Medien-ID in `registry-app.json → medien` (Konvention `light.<Licht-ID>.<Szene>.<ebene>`, `scene.<Szene>.licht-basis`, `scene.<Szene>.ambient`), mit Quelle, Hash, Freigabe.
- Reihenfolge: Base → Ambient → je Quelle Source → Spill → Glow → Reflection → An/Aus-Paar.
- Spill, Glow, Reflection und Ambient werden aufhellend überlagert (screen); mehrere Quellen kombinieren sich.
- Mit `basis` ersetzt die Base den Master; ohne Base bleibt der beleuchtete Master und die Engine verwendet **gekennzeichnete Platzhalter** (`data-placeholder="lichtmaske"` / `"raumdunkel"`).
- Ein Master-Wechsel macht die Ebenen ungültig: Ebenen neu registrieren oder auf `null` setzen.

## 4. Raum-Produktionsvorlage (Work)
Je Ansicht (C01, C02 …) eines Raumes liefern:
1. Master mit allen Lichtern an (bisheriges Szenenbild).
2. `licht-basis`: derselbe Raum ohne schaltbares Kunstlicht; natürliches Licht wie im Master.
3. `ambient` (optional): nur natürliches Licht, falls nicht in der Base.
4. Je Lichtquelle: `source` (leuchtendes Leuchtmittel/Flamme), `spill` (Lichtschein auf Wand/Möbel/Boden), `glow` (weicher Schein), `reflection` (Reflexe), jeweils als Vollbild in Mastergröße mit Transparenz.
5. Liste der Lichtquellen mit Licht-ID, Art, Sichtbarkeit in weiteren Ansichten (gleiche ID), Standardzustand.
Übergangslösung: vollständiges An/Aus-Bildpaar je Ansicht.

## 5. Integrationscheckliste (je Raum)
- [ ] Jede sichtbare schaltbare Quelle im Lichtregister, gleiche ID in allen Ansichten
- [ ] Hotspots `LIGHT`/`LIGHT_SWITCH` mit `ziel.licht` bzw. Gruppe; Raum-Modul nutzt nur `EMFDLights.activate`
- [ ] Ebenen-Medien registriert oder bewusst `null` (Platzhalter) und in der Medienliste für Work vermerkt
- [ ] `node tools/build-registry.mjs --check` grün (prüft Licht-IDs und Medien)
- [ ] Nahansichten des Raumes mit `EMFDScene.lightLayers()`
- [ ] Offline-Liste neu erzeugt (`node scripts/build-offline-precache.mjs`)

## 6. Qualitätssicherung (Abnahme je Raum und Quelle)
Technisch: unabhängig schaltbar · Quelle erlischt sichtbar · Lichtschein verschwindet · andere bleiben an · gleicher Zustand in allen Ansichten · Ausschnitt und Smartphone/Wide ändern nichts · Verlassen, Rückkehr, Neuladen behalten den Zustand · reduzierte Bewegung unmittelbar · Musik, Begleitung, Gedankenblatt, Navigation, Türen, Bücher unverändert · dunkler Raum bleibt bedienbar · fehlende Medien ohne Fehler.
Visuell (nur mit finalen Ebenen): Flamme/Leuchtmittel im Aus-Zustand, kein Restschein, keine grellen Blitze, Kombination mehrerer Quellen stimmig. Platzhalter gelten **nicht** als visuell freigegeben.

## 7. Fehlende finale Medien (Stand v0.6.81) – an Work
Keine Lichtquelle hat bisher Ebenen; keine Szene hat Base/Ambient oder ein passendes An/Aus-Paar (das alte Flurpaar `flur-v2`/`flur-v2-dim` gehört zur früheren Flurseite und passt nicht auf H00-C01/C02).
Fehlend je Szene: `licht-basis` (und ggf. `ambient`) für EXT-C01, H00-C01 (neue Fassung 1672 × 941), H00-C02, KUE-C01, KUE-C02.

| Licht-ID | Quelle | Art | Dauer | Ansicht | fehlende Ebenen |
|---|---|---|---|---|---|
| `LIGHT-EXT-WANDLATERNE` | Wandlaterne am Eingang | aussen | 600 ms | EXT-C01 | source, spill, glow, reflection |
| `LIGHT-EXT-BODENLATERNE-L` | Linke Bodenlaterne | aussen | 600 ms | EXT-C01 | source, spill, glow, reflection |
| `LIGHT-EXT-BODENLATERNE-R` | Rechte Bodenlaterne | aussen | 600 ms | EXT-C01 | source, spill, glow, reflection |
| `LIGHT-H00-DECKENLATERNE` | Deckenlaterne der Halle | deckenlampe | 400 ms | H00-C01 | source, spill, glow, reflection |
| `LIGHT-H00-DECKENLATERNE` | Deckenlaterne der Halle | deckenlampe | 400 ms | H00-C02 | source, spill, glow, reflection |
| `LIGHT-H00-WANDLATERNE-C01` | Wandlaterne (Nordwand) | wandlampe | 400 ms | H00-C01 | source, spill, glow, reflection |
| `LIGHT-H00-WANDLATERNE-C02-L` | Linke Wandlaterne (Südwand) | wandlampe | 400 ms | H00-C02 | source, spill, glow, reflection |
| `LIGHT-H00-WANDLATERNE-C02-R` | Rechte Wandlaterne (Südwand) | wandlampe | 400 ms | H00-C02 | source, spill, glow, reflection |
| `LIGHT-H00-TISCHLAMPE` | Tischlampe | tischlampe | 400 ms | H00-C01 | source, spill, glow, reflection |
| `LIGHT-H00-BODENLATERNE-TREPPE` | Bodenlaterne an der Treppe | laterne | 600 ms | H00-C01 | source, spill, glow, reflection |
| `LIGHT-H00-BODENLATERNE-TREPPE` | Bodenlaterne an der Treppe | laterne | 600 ms | H00-C02 | source, spill, glow, reflection |
| `LIGHT-H00-O08` | Die Laterne (O08) | magisch | 600 ms | H00-C02 | source, spill, glow, reflection |
| `LIGHT-KUE-DECKENLEUCHTE` | Deckenleuchte der Küche | deckenlampe | 400 ms | KUE-C01 | source, spill, glow, reflection |
| `LIGHT-KUE-DECKENLEUCHTE` | Deckenleuchte der Küche | deckenlampe | 400 ms | KUE-C02 | source, spill, glow, reflection |
| `LIGHT-KUE-FENSTERLATERNE` | Laterne am Hoffenster | laterne | 600 ms | KUE-C01 | source, spill, glow, reflection |
| `LIGHT-KUE-FENSTERLATERNE` | Laterne am Hoffenster | laterne | 600 ms | KUE-C02 | source, spill, glow, reflection |
| `LIGHT-KUE-KOMMODENLATERNE` | Laterne auf der Kommode | laterne | 600 ms | KUE-C02 | source, spill, glow, reflection |
| `LIGHT-KUE-ARBEITSFLAECHE` | Licht über der Arbeitsfläche | unterbau | 400 ms | KUE-C01 | source, spill, glow, reflection |

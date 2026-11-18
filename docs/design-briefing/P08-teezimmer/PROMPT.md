# Prompt für ChatGPT · Raumdesign P08 Teezimmer (Pilot)

So geht es: Den Text unter der Linie komplett in den ChatGPT-Chat einfügen, in dem das Design entsteht. Dazu diese Dateien anhängen:

| Anhang | Datei (im Paket `EMFD-Design-Briefing-P08.zip`) |
|---|---|
| 1 | `grundriss.png`: Grundriss aus dem Hausmodell v0.4.4 |
| 2 | `raum.json`: dieselben Daten maschinenlesbar |
| 3 | `stil_rundtisch.webp`: verbindliche Stilreferenz (Variante „Rundtisch“) |
| 4 | `O04_objektstudie.png`: Objekt O04 Das Kissen |
| 5 | `O24_objektstudie.png`: Objekt O24 Die schräge Tasse |
| 6 | `P08_teespieluhr.webp`: Musikgerät P08 „Teespieluhr“ (Bild aus der 2D-App) |
| 7 | `nachbar_wintergarten.webp`: Wintergarten (Tagesraum, hinter dem offenen Durchgang) |

ChatGPTs Antwort kommt unverändert nach `input/chatgpt-design/P08-teezimmer/`: Text als `antwort.md`, JSON als `raum-design.json`, Bilder mit ihren Dateinamen. Claude setzt danach nur das um, was dort steht.

---

Du gestaltest einen Raum für die begehbare 3D-Welt von „Ein Moment für dich · Das Haus der kleinen Wunder“. Ein anderes Team (Claude Code) baut deinen Entwurf danach in Three.js nach. Es baut **nur** das, was in deiner Antwort steht, und rät nichts dazu. Deshalb brauche ich zwei Dinge von dir: Bilder, die die Stimmung zeigen, und eine exakte, maschinenlesbare Beschreibung.

## Raum: P08 Teezimmer (Erdgeschoss)

Feste Architektur aus dem Hausmodell v0.4.4. Sie ist **nicht** veränderbar (Anhang 1 und 2):
- Innenmaß **6,00 m (Ost–West) × 4,20 m (Nord–Süd)**, lichte Höhe **2,90 m**, Decke flach (darüber liegt die Dachterrasse).
- **Westwand:** Drehtür D02, 1,00 m breit, Sturz 2,20 m, bei y = 1,40–2,40 m → Halle.
- **Nordwand:** offener Durchgang O01, **2,80 m** breit, Sturz 2,60 m, bei x = 2,60–5,40 m → Wintergarten. Der Wintergarten ist bewusst ein **heller Tagesraum** (Anhang 7). Durch diesen Durchgang fällt Tageslicht ins Teezimmer.
- **Süd- und Ostwand: geschlossen, kein Fenster.**
- Koordinaten: Ursprung ist die Südwest-Innenecke, x nach Osten, y nach Norden, Meter. Bei Möbeln bezeichnen x/y die Südwest-Ecke, w die Breite (Ost–West), d die Tiefe (Nord–Süd), h die Höhe.

**Wichtig – Fenster:** Die Stilreferenz (Anhang 3) zeigt ein großes Bogenfenster. Der Raum hat aber keines. Erfinde **kein** Fenster, keine Tür und keine Öffnung im Entwurf. Wenn du ein Fenster für unverzichtbar hältst, schreibe es nur in den Abschnitt `architekturwuensche` (mit Wand, Position und Maß). Darüber entscheide ich gesondert. Gestalte den Raum vollständig so, dass er auch ohne dieses Fenster funktioniert.

## Stil (verbindlich)

- Stilreferenz: Variante „Rundtisch“ (Anhang 3). Das heißt: runder, geschnitzter Holztisch mit Läufer, Teeservice in Blau und Gold, Bodenkissen, gepolsterte Sitzbank mit Kissen (Mondsichel-Motiv), Regal in Bogennische, Messinglaternen, warmes Abendlicht.
- Gesamtlinie „Cozy Enchanted Fantasy – Midnight Blue & Golden Teal“. Wohnlich, ruhig, nicht überladen, keine Figuren, keine magischen Lichtpartikel, jede Lichtquelle muss sichtbar und nachvollziehbar sein.
- Farben, nur diese IDs verwenden: COL-01 Nachtblau `#142840`, COL-02 Teal `#17666C`, COL-03 Walnuss `#72513C`, COL-04 Elfenbein `#EADCC7`, COL-05 Antikgold `#C69B57`, COL-06 Lichtgold `#F2C879`, COL-07 Mitternachtsblau `#203B60`, COL-08 Amethyst `#49365D` (sehr sparsam), COL-09 Waldgrün `#294C46` (Pflanzen).
- Materialien, nur diese IDs verwenden: MAT-01 Walnussholz, MAT-02 Mineralputz, MAT-03 Naturstein, MAT-04 Glas, MAT-05 Messing, MAT-06 Textil/Cord, MAT-07 Keramik, MAT-10 Patina. Wenn eine Fläche etwas anderes braucht, schreib es in `offene_fragen`.

## Was im Raum vorkommen muss

| ID | Was | Vorgabe |
|---|---|---|
| O04 | Das Kissen | Identität laut Anhang 4. Liegt auf einer Sitzfläche (bisher die Sitzbank T02). |
| O24 | Die schräge Tasse | Identität und Maße laut Anhang 5 (Höhe ca. 8 cm, Breite mit Henkel ca. 10 cm). Steht auf dem Tisch. |
| P08 | Teespieluhr (Musikgerät) | Bild Anhang 6. Steht auf eigener Ablage. Sie spielt **nie** von selbst, nur nach Antippen. |
| CARDS | Stapel Begleiterkarten | Liegt auf dem Tisch. Rückseite Nachtblau mit goldenem Stern. |

Die übrigen Platzhalter (T01 Kartentisch, T02 Sitzbank, T03 Stuhl, T04 Geschirrschrank, T05 Kachelofen-Reserve, T06 Spieluhrtisch, T07 Lesesessel) darfst du behalten, verändern, verschieben oder streichen. **Behalte die IDs**, wenn ein Teil bleibt. Neue Teile bekommen T08, T09 usw.
**Zu klären:** Der Platzhalter T01 ist ein Kartentisch (0,76 m hoch) mit Stuhl T03. Die Stilreferenz zeigt einen niedrigen runden Tisch mit Bodenkissen. Entscheide dich und begründe es in einem Satz.

Regeln für die Bewegung im Raum: Zwischen Tür D02 und Durchgang O01 bleibt ein Laufweg von mindestens 0,90 m frei. Vor dem Durchgang O01 bleibt die volle Breite mindestens 1,0 m tief frei. Kein Möbel ragt in eine Öffnung.

## Was ich von dir zurückbekomme

**A. Bilder (3 Stück)**
1. Draufsicht als Skizze auf Basis von Anhang 1, gleicher Maßstab und gleiche Ausrichtung (Norden oben), mit allen Teilen und ihren IDs.
2. Blick von der Tür D02 (Westen) nach Osten, Augenhöhe 1,60 m.
3. Blick aus dem Durchgang O01 (Norden) nach Süden, Augenhöhe 1,60 m.
Bilder 2 und 3 zeigen nur Dinge, die auch im JSON stehen. Keine eingebetteten Texte, Buttons oder Beschriftungen in den Stimmungsbildern.

**B. Ein JSON-Block, genau in dieser Form** (Werte sind Beispiele):

```json
{
  "raum": "P08",
  "version": "design-v1",
  "entscheidungen": ["Niedriger Rundtisch statt Kartentisch, weil …"],
  "flaechen": {
    "boden": {"material": "MAT-01", "farbe": "COL-03", "hinweis": "Dielen längs Ost–West"},
    "waende": {"material": "MAT-02", "farbe": "COL-04"},
    "akzentwand": {"wand": "E", "material": "MAT-02", "farbe": "COL-02", "hinweis": "…"},
    "decke": {"material": "MAT-02", "farbe": "COL-04", "balken": false},
    "teppiche": [{"id": "T10", "form": "rund", "x": 2.5, "y": 1.2, "w": 2.2, "d": 2.2, "farben": ["COL-07", "COL-05"]}]
  },
  "teile": [
    {"id": "T01", "name": "Runder Teetisch", "status": "geändert",
     "x": 2.6, "y": 1.6, "z": 0, "w": 1.1, "d": 1.1, "h": 0.42, "drehung_grad": 0, "form": "rund",
     "material": "MAT-01", "farbe": "COL-03", "details": "geschnitzte Zarge, Läufer COL-07 mit Goldborte"},
    {"id": "O24", "name": "Die schräge Tasse", "status": "bleibt", "steht_auf": "T01",
     "x": 3.0, "y": 2.0, "z": 0.42, "w": 0.103, "d": 0.083, "h": 0.092, "drehung_grad": 30}
  ],
  "gestrichen": [{"id": "T03", "grund": "…"}],
  "licht": [
    {"id": "L01", "art": "haengelaterne", "x": 3.1, "y": 2.1, "z": 2.3, "farbe": "COL-06", "staerke": "mittel", "sichtbare_quelle": "T01 darüber"},
    {"id": "L02", "art": "tageslicht_durchgang", "von": "O01", "staerke": "hell"}
  ],
  "interaktion": [{"id": "P08", "aktion": "antippen startet Musik", "hinweis": "kein Autoplay"}],
  "architekturwuensche": [],
  "offene_fragen": []
}
```

Regeln für das JSON:
- Jedes Teil, das du malst, steht im JSON. Alles im JSON passt in den Raum (0–6,00 × 0–4,20 m) und überlappt nicht unbeabsichtigt.
- `status` ist eines von: `bleibt`, `geändert`, `neu`.
- Maße sind realistische Möbelmaße in Metern. Sitzhöhe ca. 0,45 m, Bodenkissen ca. 0,15 m.
- Wenn etwas aufeinander steht: `steht_auf` angeben, `z` = Höhe der Oberfläche.
- Unsichere Angaben gehören nach `offene_fragen` und werden nicht geraten.

**C. Drei bis fünf Sätze Text:** Stimmung, was sich gegenüber den Platzhaltern ändert, und wie das Tageslicht aus dem Wintergarten mit dem warmen Laternenlicht zusammenspielt.

# input/bilder/ · Bildordner der Nutzerin (Eingang, nicht produktiv)

Eingang 18.11.2026: fünf ZIP-Dateien (`kartenproduktion`, `portraets`, `mockups`, `aussen`, `uebersichten`). Die Dateien liegen **unverändert** unter ihrem Originalnamen. Nichts davon wird von einer App geladen; neue Medien kommen erst über `tools/emfd_media.py stage` nach `media/`.

Vollständige Liste mit Format, Maßen, Alpha, Bytes und SHA-256: [`bestand.csv`](bestand.csv). Die Spalte `bereits_vorhanden` nennt die byte-gleiche Datei auf dem Server.

## Übersicht

| Ordner | Dateien | Im Repo | Inhalt |
|---|---:|---:|---|
| `uebersichten/` | 1 | 1 | `objekte_O01-O24_studienuebersicht_v1.jpg` (17.11.): Kontaktbogen aller 24 Objektstudien („Ansichtsboard · Objektmaster v1.0“). Das ist die einzige Gesamtansicht der Objekte; die Einzelstudien fehlen noch. |
| `kartenproduktion/` | 9 | 9 | Kartenrahmen „b“ je Gruppe (Ruhe Mond, Kraft Sonne, Halt Blatt, Freude Stern) als 896×1536 PNG mit transparenter Mitte. Dazu der Arbeitsablauf am Beispiel **O02 Der Vorhang**: Original 1024×1536 → eingepasst → Verlängerungsmaske → Vorbereitung im 7:12-Format |
| `mockups/responsive/` | 45 | 45 | EMFD-UX-RESP-01 (04.11.): 9 Orte × 5 Formate (Desktop 1440×900, Tablet hoch/quer, Smartphone 390×844 hoch/quer). Orte: R-HALLE (Flur), R-FENSTER P01, R-BIBLIOTHEK P02, R-WINTERGARTEN P03, R-ATELIER P04, R-HOF P05, R-GALERIE P06, R-DACH P07, R-TEE P08 |
| `mockups/` (Hauptordner) | 21 | 0 | **Duplikate**: byte-gleich mit `media/_referenzen/mockups/*-ui.jpeg` auf dem Server (Namen dort mit Bindestrich statt Unterstrich, ohne `_v1`) |
| `portraets/` | 1 | 0 | **Duplikat**: `weltenweberin_v1.jpeg` = `media/portraits/weltenweberin.jpeg` auf dem Server |
| `aussen/` | 1 | 1 | `R-AUSSEN_architekturvorlage_v1.png`, siehe Hinweis unten |

78 Dateien geliefert, 56 im Repo, 22 Duplikate nur vermerkt.

## Hinweise

- **`aussen/` enthält keine Außenansicht.** Die Datei zeigt „Wintergarten · gemeinsame Architekturvorlage · P03 · Entwurf v0.1 · 15.11.2026“: Grundriss 4,00 × 6,00 m, Nordwand mit Tonnengewölbe (Scheitel 3,80 m), Glasraster, Objektplätze Wurzel, Blüte, Laterne, Klangschale und Bank. Nach der Optik-Übergabe sind die Architekturvorlagen v0.1 **kein Ersatz** für das Hausmodell v0.4.4. Abgleich: Der offene Durchgang Teezimmer ↔ Wintergarten mit 2,80 m Breite stimmt mit v0.4.4 überein. Die Glastür G-W02 zum Innenhof ist in `home_3d/data/tueren.json` (v0.4.4) nicht als eigene Tür verzeichnet. **[UNSICHER: Dateiname/Ordner vermutlich vertauscht; echte Außenansicht fehlt]**
- **Kartenrahmen:** Die Rahmen zeigen die vier Gruppensymbole und sind laut Dateiname Variante „b“. Ob sie für die neuen Vorderseiten verbindlich sind, ist **[UNBEKANNT]**.
- **Mockups sind keine Produktionsbilder** (Regel „Nicht wieder tun“ aus der ChatGPT-Übergabe zu den Räumen). Sie dienen nur als Referenz für Layout und Formate.

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
| `orakelkarten/` | 24 | 18 | `O01–O24_kartenbild_v1.png` (29.10.), 896×1536. Das sind die **alten Kartenbilder r1**, byte-gleich mit dem Medienarchiv vom 29.10. (`cards/Oxx.png`). **O01–O18**: Archiv der überholten Fassung. Auf dem Server sind sie seit 17.11. durch r2 überschrieben, nur Rückfall/Vergleich, **nie wieder produktiv**. **O19–O24**: byte-gleich mit dem heutigen Server (`cards/O19–O24.png`), nur vermerkt. |

| `objekte/` | 27 | 23 | Eingang 3+4 (als Chat-Bilder, nicht als ZIP; möglicherweise nicht die Originaldateien). Eingang 4 brachte 7 neue Dateien; 4 waren byte-gleich mit Eingang 3 und wurden nicht erneut abgelegt. **Studienblätter** (1536×1024 bzw. 1774×887): O01, O04, O07, O08, O09, O10, O11, O12, O13, O17, O21, O22. **Große Einzelbilder**: O08 (1024×1536), O13 (1254×1254), O16 (1774×887; **A loser Faden** verbindlich, B nur Vergleich). **Kleine Ausschnitte** (≤ 683 px, aus Studienblättern geschnitten, teils mit Bildunterschrift): O03, O06, O09, O10, O12, O20, O24. Sie dienen nur als Identitätsreferenz, nicht als Textur, Sprite oder Vorlage. Dazu `nachweis_historische_karten_v1.jpg` (Kontaktbogen der alten Karten r1). **Es fehlen 7 Objekte**: O02, O05, O14, O15, O18, O19, O23. **Ohne vollständiges Studienblatt** sind außerdem O03, O06, O16, O20 und O24. |

129 Dateien geliefert (Eingang 1: 78, Eingang 2 „orakelkarten“: 24, Eingang 3+4 „objekte“: 27), 97 im Repo, 32 Duplikate nur vermerkt.

**Neue Vorderseiten O19–O24 sind weiterhin nicht geliefert.**

## Hinweise

- **`aussen/` enthält keine Außenansicht.** Die Datei zeigt „Wintergarten · gemeinsame Architekturvorlage · P03 · Entwurf v0.1 · 15.11.2026“: Grundriss 4,00 × 6,00 m, Nordwand mit Tonnengewölbe (Scheitel 3,80 m), Glasraster, Objektplätze Wurzel, Blüte, Laterne, Klangschale und Bank. Nach der Optik-Übergabe sind die Architekturvorlagen v0.1 **kein Ersatz** für das Hausmodell v0.4.4. Abgleich: Der offene Durchgang Teezimmer ↔ Wintergarten mit 2,80 m Breite stimmt mit v0.4.4 überein. Die Glastür G-W02 zum Innenhof ist in `home_3d/data/tueren.json` (v0.4.4) nicht als eigene Tür verzeichnet. **[UNSICHER: Dateiname/Ordner vermutlich vertauscht; echte Außenansicht fehlt]**
- **Kartenrahmen:** Die Rahmen zeigen die vier Gruppensymbole und sind laut Dateiname Variante „b“. Ob sie für die neuen Vorderseiten verbindlich sind, ist **[UNBEKANNT]**.
- **Mockups sind keine Produktionsbilder** (Regel „Nicht wieder tun“ aus der ChatGPT-Übergabe zu den Räumen). Sie dienen nur als Referenz für Layout und Formate.

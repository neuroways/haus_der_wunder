# EMFD-MEDIA-CORE-01 · Live-Bestandsbericht (SERVER-FIRST)

Stand 18.11.2026, lesende Prüfung aus der Claude-Code-Sitzung · **am Server wurde nichts verändert**
Rohdaten: [`live/inventar/server-2026-11-18.json`](../live/inventar/server-2026-11-18.json) · je Variante: [`reports/medienstatus.csv`](../reports/medienstatus.csv) · Zusammenfassung: [`reports/abgleich.json`](../reports/abgleich.json)

## 1. Was geprüft wurde

| Quelle | Ergebnis |
|---|---|
| `media/manifest.json` | 200, unverändert seit 04.11.2026 (SHA-256 = `live/manifest.json`), kein `mediaCore` |
| `media/` Verzeichnisliste | **403** – kein Listing. Bestand außerhalb der geprüften Pfade ist unbekannt. |
| 429 Medienpfade | HEAD/Range-GET je Pfad: Status, Content-Type, Signatur, Maße, Alpha; MP3 mit Range. Quelle: alle 420 Pfade aus `Dateipfad-Inventar.csv`, `raumgeraete/P01–P08.webp`, jeder weitere Pfad des Manifest-Kandidaten |
| `cards/O01.png`–`O24.png` | vollständig geladen, SHA-256 berechnet |
| Live-App `home/` | v0.6.66; `index.html` und 7 JSON-Register als Momentaufnahme in `live/home/` |
| `media-loader.js` live | 404 – Loader und Manifest v2 sind noch nicht veröffentlicht |
| 84 vorbereitete neue Dateien (`cards/fronts`, `covers`, `*-r2-*`, `optimized/covers`) | alle 404 unter `media/`, `home/3d/wunderhaus/media/` und `home_3d/media/` |
| `haus-der-wunder.de` | aus dieser Umgebung nicht erreichbar (Netzwerkregel) – **offen** |

## 2. Wichtigste Befunde

1. **Neue Vorderseiten O01–O18 liegen schon live – unter dem alten Namen.** `cards/O01.png`–`O18.png` wurden am 17.11.2026 (20:08–20:42 GMT) ersetzt und sind byte-identisch mit `media/cards/fronts/Oxx-front-r2-*.png`. Die WebP-Varianten `optimized/cards/*-v1-*` (03.11.) zeigen weiter die **alten** Motive. Die Live-App nutzt vorrangig diese WebPs, sie zeigt also an den meisten Stellen noch alte Karten und nur dort neue, wo sie das PNG lädt.
2. **O19–O24 sind live weiterhin Altstand.** Die Dateien wurden am 17.11. 22:44 neu hochgeladen, haben aber exakt die Bytegröße des Archivs vom 29.10. Neue Vorderseiten O19–O24 sind nirgends nachgewiesen.
3. **Keine einzige Audiodatei ist live.** Alle 35 erwarteten MP3 (`audio/O01–O24.mp3`, `THEME.mp3`, 8× `S01-*`, `W01-A/B`) liefern 404. Unter `audio/` liegt nur `README_FEHLENDE_AUDIODATEIEN.txt`. Die Live-App ruft `../media/audio/…` auf und meldet die Stücke als fehlend, sie stürzt aber nicht ab.
4. **Kartenrückseite v1.2 fehlt live** (`cards/EMFD_Kartenrueckseite_v1.2.jpeg` und 3 WebPs: 404). Vorhanden ist `cards/rueckseite.jpeg` (958×1642, 05.11.), eine echte Kartenrückseite. Ob es dasselbe Motiv wie v1.2 ist, ist unbelegt. Das Manifest führt sie als **markierten Ersatz** (`fallbacks.back`).
5. **Deckblatt `cards/deckblatt.jpeg` ist eine PNG-Datei** mit falscher Endung. Browser zeigen sie trotzdem an, das Manifest führt sie aber als `broken`. Empfehlung: als `cards/deckblatt-r1-<hash>.png` neu ablegen.
6. **Gerätebilder `raumgeraete/P01–P08.webp` sind live** (verifiziert). Die Live-App v0.6.66 hat in `room-music-map.json` Gerätenamen und -bilder ergänzt. Das Manifest übernimmt jetzt diese Live-Fassung statt der älteren aus dem Paket (Kartenzuordnung unverändert).
7. **Objekte fehlen live vollständig.** `objects/reference/O01–O24.webp` liefern 404 (nur im lokalen Paket v0.1); es gibt keine Sprites und keine Modelle.
8. **18 Raumvarianten fehlen** (`rooms/varianten/*`, nur `P04-atelier-kartenauslage-v1.webp` ist da). Die Raumhauptbilder, `rooms/thumbs` und `optimized/rooms` sind vollständig vorhanden. Die 49 Originale unter `_originale/` sind wie vorgesehen nicht online.
9. **Cache: Der Server sendet kein `Cache-Control`**, nur ETag und Last-Modified. Browser behalten das Manifest dann heuristisch einige Stunden bis Tage, ohne nachzufragen. Vorschlag: [`release/htaccess-vorschlag.txt`](../release/htaccess-vorschlag.txt).
10. **`_referenzen/button-bibliothek-v0.3/demo.html`** liegt öffentlich im Medienordner (HTML, kein Medium). Das ist harmlos, gehört aber nicht dorthin.

## 3. Zahlen (Manifest-Kandidat Revision 2, Varianten)

| Rolle | verifiziert live | vorbereitet (staged) | fehlt | fehlerhaft |
|---|---:|---:|---:|---:|
| Vorderseiten (r1 alt + r2 neu, je 4 Größen) | 96 (r1-Pfade; O01–O18-PNG schon neuer Inhalt) | 72 (O01–O18 r2) | – | – |
| CD-Cover eigenständig | – | 12 (O04, O06, O24) | 22 IDs ohne Datei | – |
| Playlist-Thumbnails (Cover-Ersatz) | 25 | – | – | – |
| Rückseite | 1 (alte, als Ersatz) | – | 4 (v1.2) | – |
| Audio | – | – | 35 | – |
| Gerätebilder P01–P08 | 8 | – | – | – |
| Räume / Raumvarianten | 62 / 56 | – | – / 18 | – |
| Hintergründe, Porträt, Referenzen | 9 / 2 / 23 | – | – | – |
| Objektreferenz / -studie / -sprite / Modell | – | – | je 24 | – |
| Geschichten-Bilder KG-O01–O24 | – | – | 24 | – |
| Geschenk-Deckblatt | – | – | – | 1 |
| Originale/Archiv | – | – | 49 (gewollt offline) | – |

Gesamt: 346 Assets · 593 Varianten · 282 verifiziert · 84 vorbereitet · 226 fehlend · 1 fehlerhaft.

## 4. Je Karte (Kurzfassung)

| | Vorderseite | Cover | Audio | Objekt |
|---|---|---|---|---|
| O01–O18 | neu: live am Altpfad, versionierte r2-Dateien vorbereitet | O04, O06 vorbereitet; übrige fehlen | fehlt | fehlt |
| O19–O24 | **nur alt** (Update erwartet, Datei fehlt) | O24 vorbereitet; übrige fehlen | fehlt | fehlt |
| T03 | – | fehlt (Thumbnail `main-theme-house-160` vorhanden) | fehlt | – |

## 5. Was daraus folgt

- Der Manifest-Kandidat liegt in [`release/manifest.json.neu`](../release/manifest.json.neu): additiv, der Altinhalt ist byte-gleich übernommen, das Neue steht unter `mediaCore`, Revision 2. Er besteht die Entwicklungsprüfung, die **Release-Prüfung blockiert er bewusst**, bis die 84 vorbereiteten Dateien hochgeladen sind.
- Ohne deine Lieferung bleiben offen: Audio (35), Vorderseiten O19–O24, 22 Cover, Rückseite v1.2, Objektmedien. Das Manifest zeigt sie als „fehlt“ und rät keine Pfade.
- Reihenfolge und Freigabepunkte: [`release/README.md`](../release/README.md).

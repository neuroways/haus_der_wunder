# live/ · Momentaufnahmen vom Live-Server (nur gelesen)

| Datei | Quelle | Abgerufen | SHA-256 | Server-Stand |
|---|---|---|---|---|
| `manifest.json` | https://flowisaurus.de/wunderhaus/media/manifest.json | 2026-11-18 | `3f0c9a4e6494cbd967350f0af418bc369a4f201653d344fb9919b25782e25139` | Last-Modified 04.11.2026 00:02:20 GMT, ETag `41056-65f6817c09b00`, 266 326 Byte |

Inhalt: schemaVersion 1.0 + PERF-01-Overlay (`items` 62, `assets` 131, `assetInventory` 133), kein `mediaCore`.
Grundlage für den additiven Merge (Übergabe, Schritt 4). Datei nicht bearbeiten.

## Weitere Momentaufnahmen (18.11.2026, nur gelesen)

| Pfad | Inhalt |
|---|---|
| `home/index.html` | Live-App v0.6.66 (`/wunderhaus/home/index.html`), ohne `media-bridge.js` |
| `home/*.json` | `music-manifest`, `card-music-map`, `playlist-catalog`, `composition-story-media` (identisch mit Übergabe) · `room-music-map` (**neuer**: Gerätenamen + `deviceImage`), `deployment-layout` (v0.6.66), `media-catalog` |
| `inventar/server-2026-11-18.json` | HTTP-Prüfung von 429 Pfaden unter `/wunderhaus/media/` (Status, Typ, Signatur, Maße) + SHA-256 von `cards/O01–O24.png`. Kein Verzeichnislisting (403) → `complete: false` |

Auswertung: [`../docs/07_Live-Bestand-2026-11-18.md`](../docs/07_Live-Bestand-2026-11-18.md).

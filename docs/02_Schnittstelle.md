# EMFD-MEDIA-CORE-01 · Schnittstelle

Kurzfassung für Entwicklungschats: `deploy/wunderhaus/media/MEDIEN-KONVENTION.md` (wird neben dem Manifest veröffentlicht).

## 1. Manifest (Schema `emfd-media-core` 2.0.0)

Stabile URL: `https://flowisaurus.de/wunderhaus/media/manifest.json`. Zwei gleichwertige Formen, der Loader liest beide:

- **merge (empfohlen für die erste Veröffentlichung):** Der bisherige Live-Inhalt (v1.0 + PERF-01) bleibt unverändert; der neue Bestand steht unter dem Schlüssel `mediaCore`. Rein additiv, kein bestehender Schlüssel ändert sich.
- **clean:** nur der neue Bestand als Wurzelobjekt (die Datei im Paket). Für später, wenn die Altfelder archiviert sind (`manifest-v1-perf01.json`).

| Feld | Bedeutung |
|---|---|
| `schema`, `schemaVersion`, `revision`, `revisionLabel`, `updatedAt` | Kennung; `revision` steigt bei jeder Veröffentlichung (auch beim Rollback) |
| `mediaRoot` | `./` – alle Pfade relativ zur Manifest-URL (`new URL(path, manifestUrl)`) |
| `policy` | Kanäle, nutzbare Verfügbarkeiten, Autoplay aus, Cache-Regeln, erlaubte Origins |
| `cards.Oxx` | Titel, Gruppe, Slots `front`, `back`, `cover`, `audio`, `objectReference`, `objectStudy`, `objectSprite`, `model`, `story`, erklärte `fallbacks`, `frontState`, Hinweise |
| `themes.T03` | Main Theme: `audio`, `cover`, Fallback |
| `playlists.primary` | 25 Audio-Assets in fester Reihenfolge; `playlists.internal` 10 Testmedien |
| `devices.P01–P08` | Raum-Musikgeräte mit `cardIds` (Stand 04.11.) |
| `placesMusic` | Flur → T03, Musikzimmer → vollständige Playlist |
| `rooms`, `shared` | 2D-Räume, Varianten, Hintergründe, Portrait, Referenzen/Originale (Archiv) |
| `assets` | **zentraler Datensatz je Asset**: `role`, `owner`, `release`, `revision`, `origin`, `supersedes/supersededBy`, `variants{name:{path, mime, width, height, alpha, bytes, sha256, availability, evidence}}` |
| `expectations`, `summary` | Soll-Zahlen und aktuelle Zählung |

Regeln: fehlende Dateien haben `path: null` und `availability: missing|archived` – nie einen erfundenen Pfad. Neue Fassungen sind neue Assets (`r2`, `r3` …) unter neuen Dateinamen; die alte Fassung bleibt erreichbar und wird `superseded`.

Vollständiges Schema: `deploy/wunderhaus/media/manifest.schema.json` (JSON Schema 2020-12).

## 2. MediaLoader (`media-loader.js` 1.0.0)

```js
const media = EMFDMedia.create({
  manifestUrl,      // optional; sonst <meta name="emfd-media-manifest">, EMFD_MEDIA_CONFIG, ?emfd-media=, /wunderhaus/media/manifest.json derselben Origin
  channel: 'private',  // 'public' = nur approved
  allowStaged: false,  // Stage/lokal: vorbereitete Dateien zeigen
  allowedOrigins: [],  // zusätzliche Medien-Origins (z. B. Preview); Standard nur Manifest-Origin
});
await media.init({ waitForNetwork: true });   // false: sofort mit letztem guten Stand starten
```

| Methode | Rückgabe |
|---|---|
| `init()` / `refresh()` | lädt mit `cache:'no-cache'` (ETag-Revalidierung); parallele Aufrufe teilen eine Anfrage; ungültige Antworten (HTML, kein JSON, falsches Schema) verwerfen und letzten guten Stand behalten |
| `useCached()` | synchron den letzten guten Stand übernehmen (für Bestands-Apps vor dem ersten Rendern) |
| `getCard(id, {front, cover, back})` | Karte mit aufgelösten Slots; jeder Slot: `url`, `usable`, `state`, `reason`, `width`, `height`, `availability`, `release` |
| `getAsset(id, variant, opts)` | einzelnes Asset; `variant` = Name, `'auto'` oder `{width}` |
| `getPlaylist('primary'|'internal')` | Einträge mit `audio` und `cover`; `autoplay:false` |
| `getRoom(id, variant)` / `getDevice(id)` | Raumbild + Varianten / Gerät mit Tracks |
| `resolveUrl(assetIdOrPath, variant)` | absolute URL; wirft bei `../`, absoluten oder fremden Pfaden |
| `on('update'|'error'|'status', fn)` | Revisionswechsel, Fehler, Statusänderung |
| `status` | `source` network/cache, `revision`, `stale`, `error` |

Slot-Zustände: `current` (aktuelle Fassung), `unconfirmed` (Altfassung, Update angekündigt), `fallback` (veraltete Fassung als erklärter Ersatz – sichtbar markieren), `unavailable` (fehlt; `url:null`, `reason`).

## 3. Cache-Strategie (alle Apps gleich)

| Was | Header | Wirkung |
|---|---|---|
| `manifest.json` | `Cache-Control: no-cache` + ETag/Last-Modified | jede App fragt beim Start nach, meist 304 |
| Dateien mit Hash im Namen (`-r2-<hash>.webp`, `-v1-<hash>.webp`, `covers/…-<sha8>.png`) | `public, max-age=31536000, immutable` | nie erneut geladen; neue Fassung = neuer Name |
| Altdateien ohne Hash (`cards/O01.png`, `audio/*.mp3`, `rooms/*.webp`) | `no-cache` | Revalidierung, kein veralteter Stand |
| MP3 | `Accept-Ranges: bytes`, Antwort 206 auf Range | iOS-Wiedergabe und Spulen |

Vorschlag als `.htaccess`: `deploy/wunderhaus/media/htaccess-vorschlag.txt`. Service Worker: jede App nur mit eigenem Scope und eigenem Cache-Namen (`emfd-<app>-<version>`), Audio nicht vorladen, Manifest nie aus dem SW-Cache bedienen (nur Netz, Loader hat eigenen Offline-Stand).

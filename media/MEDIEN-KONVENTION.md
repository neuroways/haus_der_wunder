# EMFD · Medien-Konvention für alle Anwendungen (Claude · Codex · ChatGPT)

Gilt für jede 2D-/3D-Version von „Ein Moment für dich · Das Haus der kleinen Wunder“. Kurz genug, um sie jedem neuen Entwicklungschat voranzustellen.

## Die eine Regel
Alle Medien kommen über **eine** Schnittstelle:

```
https://flowisaurus.de/wunderhaus/media/manifest.json     (Manifest, Schema emfd-media-core 2.x)
https://flowisaurus.de/wunderhaus/media/media-loader.js   (klassisches Skript → globalThis.EMFDMedia)
https://flowisaurus.de/wunderhaus/media/media-loader.mjs  (ES-Modul)
```

## Umgebungen (Loader ≥ 1.1.0)
Der Loader nutzt immer das `manifest.json` **im selben Ordner wie das geladene Loader-Skript**. Die Umgebung wird also nur durch EINE Zeile in der `index.html` gewählt:

| Umgebung | App | Einbindung |
|---|---|---|
| Live | `/wunderhaus/home/` | `<script src="/wunderhaus/media/media-loader.js">` |
| Eigenständige neue Version | `flowisaurus.de/wunderhaus/home/3d/wunderhaus/home/` = `haus-der-wunder.de/3d/wunderhaus/home/` | `<script src="../media/media-loader.js">` (relativ, gilt unter beiden Domains) |
| ES-Module / 3D-Brücke | beliebig | `<meta name="emfd-media-base" content="../media/">` relativ zur Seite (ohne Meta: Live `/wunderhaus/media/`) |

`haus-der-wunder.de` zeigt auf `/wunderhaus/home/`. Absolute Pfade mit `/wunderhaus/...` funktionieren dort nicht; in Umgebungen unterhalb von `home/` deshalb immer relativ einbinden. Die Live-Medien `/wunderhaus/media/` liegen außerhalb dieser Domain-Wurzel.

Jede Umgebung hat ihren eigenen Medienordner mit eigenem `manifest.json`. Ein Manifest verweist nie in den Ordner einer anderen Umgebung.

## Verboten
- Mediendateien in App-Ordner kopieren (`home/3d/<team>/<version>/assets/…` nur für App-eigene Dinge wie GLB-Architektur, Code-Texturen).
- Medienpfade im Code (`../media/…`, `/wunderhaus/media/cards/O01.png`, Hash-Dateinamen).
- Dateinamen raten oder „passende“ URLs zusammensetzen. Fehlt etwas, ist `url === null` und `reason` erklärt warum.
- Alte Vorderseiten (`cards/Oxx.png`, PERF-01 `-v1-`) direkt verwenden. Der Loader liefert sie nur als markierten Fallback.
- Autoplay, Audio-Precache, Testmedien (S01/W01) in der Primär-Playlist, O25.

## So geht es
```js
import EMFDMedia from '/wunderhaus/media/media-loader.mjs';      // absoluter Pfad der Umgebung (Live-Beispiel)
const media = EMFDMedia.create();                                // nimmt das manifest.json neben dem Loader
await media.init();                                              // Last-known-good + Revalidierung
const card = media.getCard('O13');                               // { front, back, cover, audio, objectReference, objectSprite, model, story }
img.src = card.front.url;                                        // state: current | unconfirmed | fallback | unavailable
if (card.front.state === 'fallback') showHint(card.front.reason);
const list = media.getPlaylist('primary');                       // 25 Einträge: T03, O01–O24; autoplay:false
media.on('update', rerender);                                    // neue Manifest-Revision ohne Codeänderung
```

## IDs (stabil, nie umbenennen)
- Karten **O01–O24**, Main Theme **T03**. Gruppen: Ruhe O01–O06, Kraft O07–O12, Halt O13–O18, Freude O19–O24.
- Musikgeräte **P01–P08** (`getDevice`), 2D-Räume über `getRoom` (Legacy-IDs P01–P08, HALL-LIT, HALL-DIM, MUSIC, HOUSE-ENTRY, HOUSE-HUB). Raum- und Geräte-IDs sind getrennte Namensräume.
- Asset-IDs: `card.O01.front.r2`, `card.O04.cover.r1`, `audio.O01`, `audio.T03`, `object.O05.reference.r1`, `room.P08-teezimmer.r1` … Anwendungen brauchen Asset-IDs selten – sie fragen Karten, Playlists, Räume.

## Varianten
- Vorderseite/Rückseite: `overview` 210×360 · `view` 630×1080 · `large` 896×1536 · `original`
- Cover: `thumb` 160 · `medium` 480 · `large` 1024 · `original` 1254
- Räume/Hintergründe: `w480`, `w864/w865/w900`, `w1086`, `thumb`, `original`
- `getAsset(id, {width: 600})` wählt die kleinste nutzbare Variante ≥ 600 px.

## Status lesen
- `availability`: verified · listed · referenced (nutzbar) | staged · archived · missing · broken (nicht nutzbar)
- `release`: approved · internal · review (Kanal privat) | test (nur interne Playlist) | superseded (nur Fallback) | archive (nie)
- Kanal `public` erlaubt nur `approved`.

## Neue oder geänderte Medien
1. Datei unter **neuem, versioniertem Pfad** hochladen (`cards/fronts/O19-front-r2-<sha8>.png`, Varianten mit Hash). Nie überschreiben.
2. `python3 tools/emfd_media.py http-check …` → `build --mode merge --revision N+1` → `validate --release`.
3. Manifest zuletzt und atomar ersetzen. Alle Apps zeigen die neue Fassung beim nächsten Start – ohne Codeänderung.

3D-Hinweis: WebP/PNG sind Texturen oder Sprites, kein Mesh. Modelle erscheinen als `model`-Asset (GLB), sobald welche im Manifest stehen.

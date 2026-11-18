# EMFD-MEDIA-CORE-01 · Integration in die neue 3D-Anwendung

Die 3D-Anwendung v0.5.0 (modularer Aufbau `src/{boot,app}.js`, `src/bridge/*`, lokales Three.js 0.164.1) lag in dieser Sitzung nicht als Code vor. Geliefert wird daher das fertige Brückenmodul für deren `src/bridge/`-Ordner plus die drei Stellen, an denen es eingehängt wird. Getestet ist das Modul im Browser aus zwei Versionsordnern (`/home/3d/claude/v2/`, `/home/3d/codex/v1/`) mit einem Three-Ersatz (`tests/fixtures/3d-index.html`).

## Datei

`3d-integration/src/bridge/media.js` → `home/3d/claude/v2/src/bridge/media.js` (gleich für jede weitere Version).

## Einbau in `src/app.js`

```js
import * as THREE from '../vendor/three/build/three.module.js';
import { initMedia, createTextureProvider, createAudioController } from './bridge/media.js';

// 1) beim Start, parallel zum GLB-Laden (blockiert die Szene nicht)
const media = await initMedia();                 // optional: { allowStaged: true } nur auf Stage
const textures = createTextureProvider(THREE, media, { anisotropy: renderer.capabilities.getMaxAnisotropy() });
const audio = createAudioController(media);

// 2) Karten auf dem Kartentisch T01 (Teezimmer) / beim Öffnen einer Karte
const { texture, state, reason, aspect } = await textures.cardFront('O24', 'view');   // 'large' für Nahansicht
if (texture) cardMaterial.map = texture; else showMissing(reason);
if (state === 'fallback' || state === 'unconfirmed') markAsProvisional(reason);
cardBackMaterial.map = (await textures.cardBack()).texture;

// 3) Musikgeräte P01–P08 – nur auf Tippen
deviceMesh.userData.onTap = () => audio.playDevice('P08');      // Tee-Spieluhr
media.on('update', () => textures.clear());                       // neue Revision: Texturen neu anfordern
```

## Regeln für 3D

- Keine Medienkopien unter `assets/`; dort bleiben nur App-eigene Dateien (Architektur-GLB, Material-Texturen, `T01-kartentisch.glb`).
- Kartenbilder sind **Texturen**; Objekt-Referenz-WebPs sind nicht freigestellt und nur Modellier-Vorlage. Freigestellte Sprites (`objectSprite`) und Modelle (`model`) fehlen noch: `texture === null` mit Grund, Platzhalter bleibt die Registerhülle.
- Service Worker der 3D-App: Scope `./`, Cache-Name `emfd-3d-<team>-<version>`, Manifest nicht cachen, Audio nicht vorladen.
- Same-Origin: Kein CORS nötig. Für eine externe Vorschau-Origin `allowedOrigins` im Loader **und** CORS-Header auf dem Server setzen (`htaccess-vorschlag.txt`, Block 5).
- Raum-IDs der 3D-Welt (H00, P01–P08, M01, KUE, SCH, BAD) sind Orte, `devices.P01–P08` sind Musikgeräte; Medien für 3D-Räume gibt es noch nicht (Planung 26 Wide / 78 Crops).

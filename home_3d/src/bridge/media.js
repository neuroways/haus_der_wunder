// EMFD-3D · Medienbrücke · v1.1.0 (aus EMFD-MEDIA-CORE-01, angepasst an Loader/Konvention 1.1.0)
//
// Einzige Medienquelle: das gemeinsame Medienarchiv neben den Apps, /wunderhaus/media/
//   (dasselbe Archiv wie home/; Manifest + media-loader.mjs).
// Der Ort wird NICHT im Code festgelegt, sondern in index.html:
//   <meta name="emfd-media-base" content="../media/">     relativ zur Seite → /wunderhaus/media/
// Ohne Meta gilt der Live-Pfad /wunderhaus/media/ (Konvention 1.1.0).
// Keine Medienpfade im 3D-Code, keine Kopien unter assets/. Three.js wird injiziert (lokales vendor/three).
// Kein Audio: Das 3D-Modul spielt nichts ab (Musik öffnet die PWA über bridge/moments.js).
//
//   import * as THREE from 'three';
//   import { initMedia, createTextureProvider } from './bridge/media.js';
//   const media = await initMedia();                       // Manifest laden (Last-known-good, Revalidierung)
//   const tex = createTextureProvider(THREE, media);
//   const { texture, state, reason } = await tex.cardFront('O13');   // texture === null → Platzhalter behalten

const DEFAULT_BASE = '/wunderhaus/media/'; // emfd-media-check: erlaubter Rückfall (Konvention 1.1.0)

/** Absolute URL des Medienordners (aus <meta name="emfd-media-base">, relativ zur Seite). */
export function mediaBase(doc = globalThis.document) {
  const meta = doc && doc.querySelector('meta[name="emfd-media-base"]');
  const pageUrl = (doc && doc.baseURI) || (globalThis.location && globalThis.location.href);
  return new URL((meta && meta.content) || DEFAULT_BASE, pageUrl).href;
}

let loaderModule = null;
function loadLoaderModule() {
  // media-loader.mjs nimmt das manifest.json im selben Ordner – damit gilt automatisch dieselbe Umgebung wie für home/.
  if (!loaderModule) {
    loaderModule = import(new URL('media-loader.mjs', mediaBase()).href).then((m) => m.default);
    loaderModule.catch(() => { loaderModule = null; });
  }
  return loaderModule;
}

/** Lädt das zentrale Manifest. Optionen gehen an EMFDMedia.create (z. B. { allowStaged: true } nur zum Testen). */
export async function initMedia(options = {}) {
  const EMFDMedia = await loadLoaderModule();
  const loader = EMFDMedia.create(options);
  await loader.init({ waitForNetwork: options.waitForNetwork ?? false });
  return loader;
}

/**
 * Texturen nach Karten-/Asset-ID statt nach Dateipfad.
 * WebP/PNG sind Texturen bzw. Sprites – kein 3D-Mesh. Modelle (GLB) kommen über modelUrl(), sobald das Manifest welche führt.
 * Jede Methode liefert { texture, state, reason, … }; texture === null heißt: nicht verfügbar → App behält ihren Platzhalter.
 */
export function createTextureProvider(THREE, media, opts = {}) {
  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin?.('anonymous');
  const cache = new Map(); // url -> Promise<Texture>
  const anisotropy = opts.anisotropy ?? 4;

  function load(url) {
    if (!cache.has(url)) {
      const p = loader.loadAsync(url).then((t) => {
        if ('colorSpace' in t && THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = anisotropy;
        t.userData = Object.assign(t.userData || {}, { emfdUrl: url });
        return t;
      });
      p.catch(() => cache.delete(url)); // fehlgeschlagene Ladeversuche nicht festhalten
      cache.set(url, p);
    }
    return cache.get(url);
  }

  async function fromSlot(slot) {
    if (!slot || !slot.url) return { texture: null, state: slot ? slot.state : 'unknown', reason: slot ? slot.reason : 'kein Eintrag', assetId: slot && slot.id };
    try {
      const texture = await load(slot.url);
      return { texture, state: slot.state, reason: slot.reason || null, assetId: slot.id, width: slot.width, height: slot.height,
               aspect: slot.width && slot.height ? slot.width / slot.height : null };
    } catch (e) {
      return { texture: null, state: 'error', reason: `Textur nicht ladbar: ${slot.url}`, assetId: slot.id };
    }
  }

  return {
    /** Kartenvorderseite: 'view' (630×1080) für Tisch/Ablage, 'large' (896×1536) für Nahansicht. */
    cardFront: (id, variant = 'view') => fromSlot(media.getCard(id, { front: variant }).front),
    cardBack: (variant = 'view') => fromSlot(media.getCard('O01', { back: variant }).back),
    cover: (id, variant = 'medium') => fromSlot(id === 'T03' ? media.getPlaylist().items[0].cover : media.getCard(id, { cover: variant }).cover),
    objectReference: (id) => fromSlot(media.getCard(id).objectReference),
    objectSprite: (id) => fromSlot(media.getCard(id).objectSprite),
    room: (id, width = 1086) => fromSlot(media.getRoom(id, { width })?.image),
    /** GLB-URL eines Objektmodells oder null (noch keine Modelle im Bestand). */
    modelUrl: (id) => media.getCard(id).model.url,
    clear() { for (const p of cache.values()) p.then((t) => t.dispose?.()).catch(() => {}); cache.clear(); },
  };
}

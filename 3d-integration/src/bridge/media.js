// EMFD-3D · Medienbrücke (für v0.5.x und alle späteren Versionen unter /wunderhaus/home/3d/<team>/<version>/)
//
// Einzige Medienquelle: https://flowisaurus.de/wunderhaus/media/manifest.json
// Kein Medienpfad im 3D-Code, keine Kopien unter assets/, keine ../-Pfade.
// Three.js wird injiziert (lokales vendor/three), damit dieses Modul keine eigene Kopie lädt.
//
//   import { initMedia, createTextureProvider, createAudioController } from './bridge/media.js';
//   const media = await initMedia();                          // Manifest laden (LKG-Cache, Revalidierung)
//   const tex = createTextureProvider(THREE, media);
//   const { texture, state, reason } = await tex.cardFront('O24');
//   const audio = createAudioController(media);              // nur nach Nutzergeste abspielen
//   button.onclick = () => audio.playCard('O24');

import EMFDMedia from '/wunderhaus/media/media-loader.mjs';

/** Lädt das zentrale Manifest. Optionen werden an EMFDMedia.create durchgereicht (z. B. allowStaged für Stage). */
export async function initMedia(options = {}) {
  const loader = EMFDMedia.create(options);
  await loader.init({ waitForNetwork: options.waitForNetwork ?? false });
  return loader;
}

/**
 * Texturen nach Asset-ID statt nach Dateipfad.
 * WebP/PNG sind Texturen bzw. Sprites – kein 3D-Mesh. Modelle (GLB) kommen über model(), sobald das Manifest welche führt.
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
    /** Kartenvorderseite: 'large' (896×1536) für Nahansicht, 'view' (630×1080) für Tisch/Ablage. */
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

/** Ein gemeinsamer Audio-Ausgang. Keine automatische Wiedergabe, kein Vorladen. */
export function createAudioController(media, { element } = {}) {
  const audio = element || new Audio();
  audio.preload = 'none';
  let current = null;
  return {
    get current() { return current; },
    /** Muss aus einer Nutzergeste (Tippen/Klicken) aufgerufen werden – iOS blockiert sonst ohnehin. */
    async playCard(id) { return play(media.getCard(id).audio, id); },
    async playTheme() { return play(media.getPlaylist().items[0].audio, 'T03'); },
    async playDevice(deviceId, index = 0) {
      const d = media.getDevice(deviceId);
      if (!d) return { ok: false, reason: `Gerät ${deviceId} unbekannt` };
      return play(d.tracks[index % d.tracks.length], d.cardIds[index % d.cardIds.length]);
    },
    stop() { audio.pause(); current = null; },
  };
  async function play(asset, id) {
    if (!asset || !asset.usable) return { ok: false, reason: asset ? asset.reason : 'kein Audio zugeordnet' };
    if (audio.src !== asset.url) audio.src = asset.url;
    try { await audio.play(); current = id; return { ok: true }; }
    catch (e) { return { ok: false, reason: e && e.name === 'NotAllowedError' ? 'Wiedergabe braucht eine Nutzergeste' : `Audio nicht abspielbar (${asset.url})` }; }
  }
}

/*!
 * EMFD Media Loader 1.1.0 · Ein Moment für dich · Das Haus der kleinen Wunder
 * Einzige Schnittstelle aller 2D-/3D-Anwendungen zum zentralen Medienbestand.
 * Live-Manifest: https://flowisaurus.de/wunderhaus/media/manifest.json
 * Umgebungsregel: Der Loader nutzt das manifest.json im SELBEN Ordner, aus dem er geladen wurde.
 *   Live:          <script src="/wunderhaus/media/media-loader.js">
 *   Neue Version:  <script src="../media/media-loader.js">  (relativ: gilt unter haus-der-wunder.de und flowisaurus.de)
 *
 * Klassisches Skript (setzt globalThis.EMFDMedia) und CommonJS-kompatibel.
 * ES-Module: import EMFDMedia from '/wunderhaus/media/media-loader.mjs'.
 * Keine Abhängigkeiten, kein Framework, kein Autoplay, kein Precache.
 */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.EMFDMedia = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const VERSION = '1.1.0';
  // Ort dieses Skripts (nur während der Ausführung eines klassischen <script> verfügbar)
  let SCRIPT_SRC = null;
  try { SCRIPT_SRC = (globalThis.document && globalThis.document.currentScript && globalThis.document.currentScript.src) || null; } catch (_) { /* kein DOM */ }
  const SCHEMA = 'emfd-media-core';
  const SUPPORTED_MAJOR = 2;
  const DEFAULT_MANIFEST_PATH = '/wunderhaus/media/manifest.json';
  const PRODUCTION_MANIFEST = 'https://flowisaurus.de' + DEFAULT_MANIFEST_PATH;
  const DEFAULT_USABLE = ['verified', 'listed', 'referenced'];
  const DEFAULT_CHANNELS = { private: ['approved', 'internal', 'review'], public: ['approved'] };
  const IMAGE_VARIANT_ORDER = ['thumb', 'overview', 'medium', 'view', 'large', 'original'];

  class MediaError extends Error {
    constructor(code, message, detail) {
      super(message);
      this.name = 'EMFDMediaError';
      this.code = code;
      this.detail = detail || null;
    }
  }

  function safeStorage(custom) {
    if (custom) return custom;
    try {
      const s = globalThis.localStorage;
      const k = '__emfd_media_probe__';
      s.setItem(k, '1');
      s.removeItem(k);
      return s;
    } catch (_) {
      const mem = new Map();
      return { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) };
    }
  }

  /** Manifest-URL: explizit > Meta-Tag > globale Konfiguration > ?emfd-media= > neben dem Loader-Skript > /wunderhaus/media/ derselben Origin. */
  function detectManifestUrl(cfg) {
    if (cfg.manifestUrl) return String(cfg.manifestUrl);
    const g = globalThis;
    try {
      const meta = g.document && g.document.querySelector('meta[name="emfd-media-manifest"]');
      if (meta && meta.content) return new URL(meta.content, g.location.href).href;
      const baseMeta = g.document && g.document.querySelector('meta[name="emfd-media-base"]');
      if (baseMeta && baseMeta.content) return new URL('manifest.json', new URL(baseMeta.content, g.location.href)).href;
    } catch (_) { /* kein DOM */ }
    if (g.EMFD_MEDIA_CONFIG && g.EMFD_MEDIA_CONFIG.manifestUrl) return g.EMFD_MEDIA_CONFIG.manifestUrl;
    try {
      const q = new URL(g.location.href).searchParams.get('emfd-media');
      if (q && cfg.allowQueryOverride !== false) return new URL(q, g.location.href).href;
    } catch (_) { /* kein location */ }
    if (SCRIPT_SRC) return new URL('manifest.json', SCRIPT_SRC).href;
    if (g.location && /^https?:$/.test(g.location.protocol)) return new URL(DEFAULT_MANIFEST_PATH, g.location.origin).href;
    return PRODUCTION_MANIFEST;
  }

  /** Leichte Laufzeitprüfung (die vollständige Prüfung macht tools/emfd_media.py validate). */
  function checkCore(raw) {
    const core = raw && typeof raw === 'object' && raw.mediaCore ? raw.mediaCore : raw;
    const problems = [];
    if (!core || typeof core !== 'object') throw new MediaError('invalid', 'Manifest ist kein JSON-Objekt');
    if (core.schema !== SCHEMA) throw new MediaError('schema', 'Manifest ohne emfd-media-core-Kennung (alte Fassung?)');
    const major = parseInt(String(core.schemaVersion || '0').split('.')[0], 10);
    if (major !== SUPPORTED_MAJOR) throw new MediaError('schema-version', `Schema ${core.schemaVersion} wird nicht unterstützt (erwartet ${SUPPORTED_MAJOR}.x)`);
    for (const key of ['revision', 'assets', 'cards', 'playlists', 'policy']) if (!(key in core)) problems.push(`fehlt: ${key}`);
    if (problems.length) throw new MediaError('schema', 'Manifest unvollständig: ' + problems.join(', '));
    return core;
  }

  function createLoader(userConfig) {
    const cfg = Object.assign({
      channel: 'private',          // 'private' (Familien-App) oder 'public'
      allowStaged: false,          // nur Stage/lokal: vorbereitete, noch nicht hochgeladene Dateien nutzen
      allowedOrigins: [],          // zusätzliche Medien-Origins (z. B. Preview), sonst nur Manifest-Origin
      timeoutMs: 15000,
      storageKeyPrefix: 'emfd-media:lkg:',
      fetch: null,
      storage: null,
    }, userConfig || {});
    const manifestUrl = detectManifestUrl(cfg);
    const storage = safeStorage(cfg.storage);
    const storageKey = cfg.storageKeyPrefix + manifestUrl;
    const doFetch = cfg.fetch || (typeof fetch === 'function' ? fetch.bind(globalThis) : null);
    const listeners = { update: new Set(), error: new Set(), status: new Set() };

    let core = null;
    let mediaRoot = null;
    let inflight = null;
    const status = { source: 'none', revision: null, revisionLabel: null, fetchedAt: null, stale: false, error: null, manifestUrl };

    function emit(type, payload) {
      for (const fn of listeners[type]) { try { fn(payload); } catch (e) { /* Listenerfehler isolieren */ } }
    }
    function setStatus(patch) { Object.assign(status, patch); emit('status', Object.assign({}, status)); }

    function adopt(nextCore, source, fetchedAt) {
      const prevRevision = core ? core.revision : null;
      core = nextCore;
      mediaRoot = new URL(core.mediaRoot || './', manifestUrl).href;
      setStatus({ source, revision: core.revision, revisionLabel: core.revisionLabel || null, fetchedAt, error: source === 'network' ? null : status.error, stale: source !== 'network' });
      if (prevRevision !== null && prevRevision !== core.revision) emit('update', { from: prevRevision, to: core.revision });
    }

    function loadLastKnownGood() {
      try {
        const txt = storage.getItem(storageKey);
        if (!txt) return false;
        const saved = JSON.parse(txt);
        adopt(checkCore(saved.manifest), 'cache', saved.fetchedAt);
        return true;
      } catch (_) { return false; }
    }

    async function fetchManifest() {
      if (!doFetch) throw new MediaError('no-fetch', 'fetch ist nicht verfügbar');
      const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
      const timer = ctrl ? setTimeout(() => ctrl.abort(), cfg.timeoutMs) : null;
      try {
        // cache:'no-cache' = immer beim Server revalidieren (ETag/Last-Modified -> 304), nie blind aus HTTP-Cache.
        const res = await doFetch(manifestUrl, { cache: 'no-cache', credentials: 'same-origin', signal: ctrl ? ctrl.signal : undefined, headers: { Accept: 'application/json' } });
        if (!res.ok) throw new MediaError('http', `Manifest HTTP ${res.status}`, { status: res.status });
        const ct = (res.headers && res.headers.get && res.headers.get('content-type')) || '';
        const text = await res.text();
        if (/text\/html/i.test(ct) || /^\s*</.test(text)) throw new MediaError('html', 'Manifest-URL liefert HTML statt JSON');
        let raw;
        try { raw = JSON.parse(text); } catch (e) { throw new MediaError('json', 'Manifest ist kein gültiges JSON: ' + e.message); }
        const next = checkCore(raw);
        const fetchedAt = new Date().toISOString();
        try { storage.setItem(storageKey, JSON.stringify({ fetchedAt, manifest: next })); } catch (_) { /* Speicher voll: weiter ohne LKG */ }
        adopt(next, 'network', fetchedAt);
        return api;
      } finally { if (timer) clearTimeout(timer); }
    }

    /** Lädt das Manifest. Mehrfache gleichzeitige Aufrufe teilen eine Anfrage. */
    function refresh() {
      if (inflight) return inflight;
      inflight = fetchManifest().catch((err) => {
        const e = err instanceof MediaError ? err : new MediaError('network', err && err.message ? err.message : String(err));
        setStatus({ error: { code: e.code, message: e.message }, stale: !!core });
        emit('error', e);
        if (!core) throw e;
        return api;
      }).finally(() => { inflight = null; });
      return inflight;
    }

    /** init(): sofort letzten guten Stand nutzen (offline/iPhone-Neustart), dann revalidieren. */
    async function init(opts) {
      const o = Object.assign({ waitForNetwork: true }, opts || {});
      const hadCache = !core && loadLastKnownGood();
      const p = refresh();
      if (hadCache && !o.waitForNetwork) { p.catch(() => {}); return api; }
      await p;
      return api;
    }

    function requireCore() {
      if (!core) throw new MediaError('not-ready', 'Medienmanifest noch nicht geladen – zuerst init() aufrufen');
      return core;
    }

    function allowedOrigins() {
      const set = new Set([new URL(manifestUrl).origin]);
      for (const o of cfg.allowedOrigins) set.add(new URL(o).origin);
      return set;
    }

    /** Pfad (relativ zum Manifest) -> absolute URL. Erzwingt Origin + Medienwurzel. */
    function resolvePath(path) {
      requireCore();
      if (path == null || path === '') return null;
      if (/^[a-z]+:/i.test(path) || path.startsWith('/') || path.split('/').includes('..')) {
        throw new MediaError('path', `Unzulässiger Medienpfad (muss relativ zum Manifest sein): ${path}`);
      }
      const url = new URL(path, mediaRoot);
      if (!allowedOrigins().has(url.origin) || !url.href.startsWith(mediaRoot)) {
        throw new MediaError('origin', `Medien-URL außerhalb der Medienwurzel: ${url.href}`);
      }
      return url.href;
    }

    function channelReleases() {
      const ch = (core.policy && core.policy.channels) || DEFAULT_CHANNELS;
      return ch[cfg.channel] || DEFAULT_CHANNELS[cfg.channel] || DEFAULT_CHANNELS.public;
    }

    function usableAvailability() {
      const base = (core.policy && core.policy.usableAvailability) || DEFAULT_USABLE;
      return cfg.allowStaged ? base.concat(['staged']) : base;
    }

    function pickVariantName(asset, want) {
      const names = Object.keys(asset.variants || {});
      if (typeof want === 'string' && want !== 'auto') return names.includes(want) ? want : null;
      const minWidth = want && typeof want === 'object' && want.width ? want.width : 0;
      const candidates = names.filter((n) => asset.variants[n].path);
      const sorted = candidates.sort((a, b) => (asset.variants[a].width || 1e9) - (asset.variants[b].width || 1e9)
        || IMAGE_VARIANT_ORDER.indexOf(a) - IMAGE_VARIANT_ORDER.indexOf(b));
      const ok = (n) => usableAvailability().includes(asset.variants[n].availability);
      const fit = sorted.find((n) => ok(n) && (asset.variants[n].width || 1e9) >= minWidth);
      return fit || sorted.slice().reverse().find(ok) || (names.includes('original') ? 'original' : names[0] || null);
    }

    /**
     * getAsset(id, variant?, opts?) -> Beschreibung mit url (oder null) und lesbarem Grund.
     * variant: Name ('original','thumb','overview','view','large','medium','w480',…), 'auto' oder {width}.
     * opts.allowSuperseded / opts.allowTest: nur für ausdrückliche Fallbacks bzw. interne Playlist.
     */
    function getAsset(id, variant, opts) {
      const c = requireCore();
      const o = opts || {};
      const asset = id ? c.assets[id] : null;
      if (!asset) return { id: id || null, url: null, usable: false, state: 'unknown', reason: id ? `Unbekannte Asset-ID ${id}` : 'Kein Asset zugeordnet' };
      const vname = pickVariantName(asset, variant || 'auto');
      const v = vname ? asset.variants[vname] : null;
      const out = {
        id, variant: vname, role: asset.role, owner: asset.owner || null, release: asset.release,
        availability: v ? v.availability : 'missing', revision: asset.revision || null,
        width: v && v.width || null, height: v && v.height || null, mime: v && v.mime || null,
        bytes: v && v.bytes || null, sha256: v && v.sha256 || null, alpha: v ? (v.alpha ?? null) : null,
        url: null, usable: false, state: 'unavailable', reason: null, notes: asset.notes || [],
      };
      if (!v) { out.reason = `Variante ${variant} nicht vorhanden`; return out; }
      if (!v.path) { out.reason = v.availability === 'archived' ? 'Nur im Archiv vorhanden, nicht auf dem Server' : 'Datei fehlt (noch nicht geliefert)'; return out; }
      if (!usableAvailability().includes(v.availability)) {
        out.reason = { staged: 'Vorbereitet, noch nicht hochgeladen', archived: 'Nur im Archiv', missing: 'Datei fehlt', broken: 'Datei fehlerhaft' }[v.availability] || `Status ${v.availability}`;
        return out;
      }
      const rel = asset.release;
      const releaseOk = channelReleases().includes(rel) || (rel === 'superseded' && o.allowSuperseded) || (rel === 'test' && o.allowTest);
      if (!releaseOk) {
        out.reason = { superseded: 'Veraltet (durch neuere Fassung ersetzt)', archive: 'Archivmaterial, nicht produktiv', test: 'Internes Testmedium', review: 'Noch nicht freigegeben' }[rel] || `Freigabe ${rel} im Kanal ${cfg.channel} nicht erlaubt`;
        return out;
      }
      try { out.url = resolvePath(v.path); } catch (e) { out.reason = e.message; return out; }
      out.usable = true;
      out.state = rel === 'superseded' ? 'fallback' : 'available';
      return out;
    }

    /** Slot mit erklärtem Fallback auflösen (z. B. Vorderseite r2 -> r1). */
    function slot(card, key, variant) {
      const primary = getAsset(card[key], variant);
      if (primary.usable) return Object.assign(primary, { state: key === 'front' && card.frontState !== 'current' ? 'unconfirmed' : 'current' });
      const fbId = card.fallbacks && card.fallbacks[key];
      if (fbId) {
        const fb = getAsset(fbId, variant === 'auto' || typeof variant === 'object' ? variant : (key === 'cover' ? 'thumb' : variant), { allowSuperseded: true });
        if (fb.usable) return Object.assign(fb, { state: 'fallback', reason: `Ersatz für ${card[key] || key}: ${primary.reason}` });
      }
      return primary;
    }

    function getCard(id, opts) {
      const c = requireCore();
      const card = c.cards[id];
      if (!card) return null;
      const o = Object.assign({ front: 'view', cover: 'thumb', back: 'view' }, opts || {});
      return {
        id, title: card.title, category: card.category, order: card.order,
        front: slot(card, 'front', o.front),
        back: getAsset(card.back, o.back),
        cover: slot(card, 'cover', o.cover),
        audio: getAsset(card.audio, 'original'),
        objectReference: getAsset(card.objectReference, 'original'),
        objectSprite: getAsset(card.objectSprite, 'original'),
        model: getAsset(card.model, 'original'),
        story: card.story ? Object.assign(getAsset(card.story, 'original'), { fallback: 'front' }) : null,
        notes: card.notes || [],
      };
    }

    function listCards() { return Object.keys(requireCore().cards).sort(); }

    /** Playlist: 'primary' (25 Stücke) oder 'internal' (Testmedien, nur Kanal private). Nie Autoplay. */
    function getPlaylist(name, opts) {
      const c = requireCore();
      const pl = c.playlists[name || 'primary'];
      if (!pl) return null;
      const isInternal = (name || 'primary') !== 'primary';
      if (isInternal && cfg.channel !== 'private') return { name, title: pl.title, items: [], reason: 'Interne Playlist nur im privaten Kanal' };
      const o = Object.assign({ cover: 'thumb' }, opts || {});
      const items = pl.items.map((audioId, index) => {
        const audio = getAsset(audioId, 'original', { allowTest: isInternal });
        const owner = audio.owner;
        const card = owner && c.cards[owner];
        const theme = owner && c.themes[owner];
        const holder = card || theme || null;
        let cover = null;
        if (holder) cover = slot(Object.assign({ fallbacks: {} }, holder), 'cover', o.cover);
        return { index, id: owner || audioId, kind: card ? 'card' : theme ? 'theme' : 'internal', title: holder ? holder.title : (c.assets[audioId] && c.assets[audioId].origin && (c.assets[audioId].origin.familyTitle + ' ' + (c.assets[audioId].origin.variant || ''))) || audioId, category: card ? card.category : null, audio, cover };
      });
      return { name: name || 'primary', title: pl.title, autoplay: false, items };
    }

    function getRoom(id, variant) {
      const c = requireCore();
      const r = c.rooms && c.rooms[id];
      if (!r) return null;
      return { id, name: r.name, image: r.image ? getAsset(r.image, variant || 'auto') : null,
               alternatives: (r.alternatives || []).map((a) => getAsset(a, variant || 'auto')),
               scenes: Object.fromEntries(Object.entries(r.scenes || {}).map(([k, a]) => [k, getAsset(a, variant || 'auto')])) };
    }

    function getDevice(id) {
      const c = requireCore();
      const d = c.devices && c.devices[id];
      if (!d) return null;
      return { id, cardIds: d.cardIds.slice(), tracks: d.cardIds.map((cid) => getAsset(c.cards[cid].audio, 'original')) };
    }

    /** resolveUrl(assetIdOrRecord, variant?) – liefert absolute URL oder null (nie geratene URL). */
    function resolveUrl(asset, variant) {
      if (asset && typeof asset === 'object' && 'url' in asset) return asset.url;
      if (typeof asset === 'string' && requireCore().assets[asset]) return getAsset(asset, variant).url;
      if (typeof asset === 'string') return resolvePath(asset);
      return null;
    }

    /** Synchron den letzten guten Stand übernehmen (für Bestands-Apps vor dem ersten Rendern). */
    function useCached() { return core ? true : loadLastKnownGood(); }

    function on(type, fn) { listeners[type].add(fn); return () => listeners[type].delete(fn); }

    const api = {
      version: VERSION, manifestUrl, config: cfg, status,
      init, refresh, useCached, getCard, listCards, getAsset, getPlaylist, getRoom, getDevice, resolveUrl, on,
      get manifest() { return core; },
      get mediaRoot() { return mediaRoot; },
    };
    return api;
  }

  let defaultLoader = null;
  return {
    VERSION, MediaError, PRODUCTION_MANIFEST,
    create: createLoader,
    /** Gemeinsame Standardinstanz je Seite. */
    init(config, opts) { if (!defaultLoader) defaultLoader = createLoader(config); return defaultLoader.init(opts); },
    get default() { return defaultLoader; },
    _internal: { checkCore, detectManifestUrl },
  };
});

/* EMFD-CACHE-01 · Offline-Service-Worker der App (ersetzt den begrenzten PERF-01-Bildcache).
 *
 * Ziel: Nach dem ersten Start lädt die App keine Bilder und kein bereits gehörtes Musikstück erneut
 * über das Mobilnetz. Dateiname bleibt image-service-worker.js, damit installierte Apps den
 * bestehenden Worker nahtlos aktualisieren (gleiche Registrierung, gleicher Scope).
 *
 *  App-Dateien  : bei der Installation vollständig geladen (offline-precache.js), danach aus dem Cache,
 *                 Aktualisierung im Hintergrund.
 *  Bilder       : Stufe 1 (Start) bei der Installation, Stufe 2 (ganzes Haus) direkt nach dem Start im
 *                 Hintergrund. Cache zuerst; Dateien mit Hash im Namen werden nie erneut geladen.
 *                 Keine 20-MB-Grenze mehr: es wird nichts mehr verdrängt.
 *  Musik        : KEIN Vorab-Laden (MEDIEN-KONVENTION). Beim ersten Abspielen spielt die Musik direkt
 *                 aus dem Netz; parallel wird die Datei einmal vollständig gespeichert. Ab dann kommt sie
 *                 aus dem Cache, inkl. Teilanfragen (Range/206), die iOS für Audio verlangt.
 *                 Geänderte Dateien gleichen Namens erkennt eine kurze HEAD-Prüfung (ETag/Länge).
 *  Manifest     : Netz zuerst, sonst die letzte gute Fassung.
 */
'use strict';
importScripts('offline-policy.js', 'offline-precache.js', 'offline-images.js', 'media-core.js', 'media-catalog.js');
// Raum-, Szenen- und Gerätebilder aus dem Register (BOOK-01a). Fehlt die Datei, bleibt es bei der festen Liste.
try { importScripts('data/registry.js'); } catch (_) {}

const P = self.EMFDOfflinePolicy;
const CACHES = P.CACHES;
const SCOPE = self.location.href;
const abs = p => new URL(p, SCOPE).href;
const IMAGE_LIST = self.EMFDOfflineImages || { start: [], house: [] };
const REGISTER_IMAGES = P.registerImages(self.EMFD_REGISTRY);
const startImages = [...new Set([...IMAGE_LIST.start, ...REGISTER_IMAGES.start].map(abs))];
const allowed = new Set([...IMAGE_LIST.start, ...IMAGE_LIST.house, ...REGISTER_IMAGES.start, ...REGISTER_IMAGES.house].map(abs)); // Bilder, die die App nutzt
const shellFiles = (self.EMFDPrecache?.shell || []).map(abs);
const mediaGroups = self.EMFDMediaCatalog?.groups || [];
const mediaLookup = self.EMFDMediaCore?.index(mediaGroups);
const MAX_FILE_BYTES = 40 * 1024 * 1024;
const NETWORK_TIMEOUT_MS = 3500;
const AUDIO_STORE_DELAY_MS = Number(self.EMFD_AUDIO_STORE_DELAY_MS ?? 4000); // Wiedergabe zuerst, dann speichern (Tests: 0)
const WARM_CONCURRENCY = 3;

/* ---------- Hilfen ---------- */
function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(v => { clearTimeout(t); resolve(v); }, e => { clearTimeout(t); reject(e); });
  });
}
const wait = ms => new Promise(r => setTimeout(r, ms));
async function broadcast(message) {
  try { for (const client of await self.clients.matchAll({ includeUncontrolled: true })) client.postMessage(message); } catch (_) {}
}
async function pool(items, limit, worker) {
  let i = 0;
  const run = async () => { while (i < items.length) { const item = items[i++]; try { await worker(item); } catch (_) {} } };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
}

/* ---------- Bilder ---------- */
let imageWrites = Promise.resolve();
function storeImage(key, response) {
  imageWrites = imageWrites.catch(() => {}).then(async () => {
    const blob = await response.blob();
    if (!blob.size || blob.size > MAX_FILE_BYTES || !/^image\//.test(blob.type || response.headers.get('Content-Type') || '')) return false;
    const headers = new Headers(response.headers);
    headers.set('X-EMFD-Bytes', String(blob.size));
    headers.set('X-EMFD-Stored', String(Date.now()));
    await (await caches.open(CACHES.images)).put(key, new Response(blob, { status: 200, headers }));
    return true;
  });
  return imageWrites;
}
const revalidated = new Set();
async function imageResponse(event, retry) {
  const key = P.cacheKey(event.request.url, 'image');
  const cache = await caches.open(CACHES.images);
  const hit = retry ? null : await cache.match(key);
  if (hit) {
    // Dateien ohne Hash einmal pro Sitzung im Hintergrund prüfen (Server antwortet meist 304).
    if (!P.isImmutable(key) && !revalidated.has(key) && self.navigator?.onLine !== false) {
      revalidated.add(key);
      event.waitUntil(fetch(key, { cache: 'no-cache' }).then(r => r.ok ? storeImage(key, r) : null).catch(() => {}));
    }
    return hit;
  }
  // App-eigene Grafik (assets/…) liegt im App-Cache (offline-precache.js), nicht im Bildcache.
  if (!retry) {
    const own = await (await caches.open(CACHES.shell)).match(event.request, { ignoreSearch: true });
    if (own) return own;
  }
  try {
    const response = await fetch(event.request);
    if (response.ok) { event.waitUntil(storeImage(key, response.clone())); return response; }
  } catch (_) {}
  const stale = retry ? await cache.match(key) : null;
  if (stale) return stale;
  // Rückfall auf ein gleichwertiges Bild derselben Mediengruppe (wie bisher).
  const relative = mediaPath(key);
  const options = mediaLookup && self.EMFDMediaCore ? self.EMFDMediaCore.candidates(relative, mediaLookup).filter(p => p !== relative) : [];
  for (const option of options) {
    const alternative = abs(option);
    const cached = await cache.match(alternative);
    if (cached) return cached;
    try {
      const r = await fetch(alternative);
      if (r.ok && (r.headers.get('Content-Type') || '').startsWith('image/')) { event.waitUntil(storeImage(alternative, r.clone())); return r; }
    } catch (_) {}
  }
  return new Response('', { status: 503, statusText: 'Image unavailable' });
}
function mediaPath(url) {
  const u = new URL(url), base = new URL('../media/', SCOPE), assets = new URL('assets/', SCOPE);
  if (u.origin !== base.origin) return null;
  if (u.pathname.startsWith(base.pathname)) return '../media/' + u.pathname.slice(base.pathname.length);
  if (u.pathname.startsWith(assets.pathname)) return 'assets/' + u.pathname.slice(assets.pathname.length);
  return null;
}

/* Vorab-Laden (Stufe 1 bei Installation, Stufe 2 auf Nachricht der Seite). Wiederaufnehmbar:
 * bereits gespeicherte Dateien werden übersprungen, abgebrochene Läufe setzen beim nächsten Start fort. */
let warming = null;
async function warmImages(urls, stage) {
  const cache = await caches.open(CACHES.images);
  const keys = [...new Set(urls.map(u => P.cacheKey(u, 'image')))];
  const todo = [];
  for (const key of keys) if (!(await cache.match(key))) todo.push(key);
  const progress = { type: 'emfd-cache-progress', stage, total: keys.length, cached: keys.length - todo.length, failed: 0 };
  await broadcast(progress);
  await pool(todo, WARM_CONCURRENCY, async key => {
    try {
      const r = await withTimeout(fetch(key, { cache: 'no-cache' }), 30000);
      if (r.ok && (await storeImage(key, r))) progress.cached++; else progress.failed++;
    } catch (_) { progress.failed++; }
    if ((progress.cached + progress.failed) % 10 === 0) await broadcast(progress);
  });
  await broadcast({ ...progress, done: true });
  return progress;
}

/* ---------- Musik ---------- */
let audioIndex = null;                       // Set der gespeicherten Musik-URLs
const audioReady = caches.open(CACHES.audio).then(c => c.keys()).then(keys => { audioIndex = new Set(keys.map(k => k.url)); }).catch(() => { audioIndex = new Set(); });
const audioInFlight = new Map();
const audioChecked = new Set();
let audioQueue = Promise.resolve();

function storeAudio(key) {
  if (audioInFlight.has(key)) return audioInFlight.get(key);
  const job = audioQueue = audioQueue.catch(() => {}).then(async () => {
    await wait(AUDIO_STORE_DELAY_MS);
    const cache = await caches.open(CACHES.audio);
    if (await cache.match(key)) return true;
    const r = await fetch(key, { cache: 'no-cache' });           // vollständige Datei, ohne Range
    if (r.status !== 200) return false;
    const blob = await r.blob();
    const type = r.headers.get('Content-Type') || blob.type || 'audio/mpeg';
    if (!blob.size || blob.size > MAX_FILE_BYTES || !/^(audio\/|application\/octet-stream)/.test(type)) return false;
    const headers = new Headers({ 'Content-Type': /^audio\//.test(type) ? type : 'audio/mpeg', 'Content-Length': String(blob.size), 'Accept-Ranges': 'bytes', 'X-EMFD-Bytes': String(blob.size) });
    for (const h of ['ETag', 'Last-Modified']) if (r.headers.get(h)) headers.set('X-EMFD-' + h, r.headers.get(h));
    await cache.put(key, new Response(blob, { status: 200, headers }));
    audioIndex?.add(key);
    return true;
  }).catch(() => false).finally(() => audioInFlight.delete(key));
  audioInFlight.set(key, job);
  return job;
}

/* Gleicher Dateiname, neuer Inhalt? Einmal pro Worker-Laufzeit leichte HEAD-Prüfung. */
async function revalidateAudio(key, cached) {
  if (audioChecked.has(key)) return;
  audioChecked.add(key);
  try {
    const r = await withTimeout(fetch(key, { method: 'HEAD', cache: 'no-cache' }), 8000);
    if (!r.ok) return;
    const etag = r.headers.get('ETag'), modified = r.headers.get('Last-Modified'), length = r.headers.get('Content-Length');
    const changed = (etag && cached.headers.get('X-EMFD-ETag') && etag !== cached.headers.get('X-EMFD-ETag')) ||
      (!etag && modified && cached.headers.get('X-EMFD-Last-Modified') && modified !== cached.headers.get('X-EMFD-Last-Modified')) ||
      (length && cached.headers.get('X-EMFD-Bytes') && length !== cached.headers.get('X-EMFD-Bytes'));
    if (changed) { await (await caches.open(CACHES.audio)).delete(key); audioIndex?.delete(key); }
  } catch (_) {}
}

async function rangeResponse(request, cached) {
  const blob = await cached.blob();
  const type = cached.headers.get('Content-Type') || 'audio/mpeg';
  const header = request.headers.get('Range');
  if (!header) return new Response(blob, { status: 200, headers: { 'Content-Type': type, 'Content-Length': String(blob.size), 'Accept-Ranges': 'bytes' } });
  const range = P.parseRange(header, blob.size);
  if (!range) return new Response('', { status: 416, headers: { 'Content-Range': `bytes */${blob.size}` } });
  const part = blob.slice(range.start, range.end + 1);
  return new Response(part, { status: 206, statusText: 'Partial Content', headers: {
    'Content-Type': type, 'Content-Length': String(part.size), 'Accept-Ranges': 'bytes',
    'Content-Range': `bytes ${range.start}-${range.end}/${blob.size}` } });
}

function handleAudio(event) {
  const key = P.cacheKey(event.request.url, 'audio');
  if (audioIndex && !audioIndex.has(key)) {
    // Noch nicht gespeichert: Browser spielt direkt aus dem Netz (natives Streaming), wir speichern parallel.
    event.waitUntil(storeAudio(key));
    return;
  }
  event.respondWith((async () => {
    await audioReady;
    const cached = await (await caches.open(CACHES.audio)).match(key);
    if (cached) { event.waitUntil(revalidateAudio(key, cached)); return rangeResponse(event.request, cached); }
    event.waitUntil(storeAudio(key));
    return fetch(event.request);
  })());
}

/* ---------- App-Dateien und Manifest ---------- */
async function putShell(key, response) {
  if (!response || !response.ok || response.type === 'opaque') return;
  await (await caches.open(CACHES.shell)).put(key, response);
}
const refreshed = new Set();
async function shellResponse(event) {
  const req = event.request, cache = await caches.open(CACHES.shell);
  const hit = await cache.match(req);
  if (hit) {
    if (!refreshed.has(req.url)) {
      refreshed.add(req.url);
      event.waitUntil(fetch(req, { cache: 'no-cache' }).then(r => putShell(req, r)).catch(() => {}));
    }
    return hit;
  }
  try {
    const r = await fetch(req);
    if (r.ok) event.waitUntil(putShell(req, r.clone()));
    return r;
  } catch (error) {
    const older = await cache.match(req, { ignoreSearch: true });   // ältere Fassung derselben Datei
    if (older) return older;
    throw error;
  }
}
async function networkFirst(event, fallbackKeys) {
  const req = event.request, cache = await caches.open(CACHES.shell);
  try {
    const r = await withTimeout(fetch(req, { cache: 'no-cache' }), NETWORK_TIMEOUT_MS);
    if (r.ok) { event.waitUntil(putShell(req.mode === 'navigate' ? abs('./') : req, r.clone())); return r; }
    if (r.status < 500) return r;
  } catch (_) {}
  for (const key of [req, ...fallbackKeys]) {
    const hit = await cache.match(key, { ignoreSearch: true });
    if (hit) return hit;
  }
  return fetch(req);
}

async function precacheShell() {
  const cache = await caches.open(CACHES.shell);
  let missing = 0;
  await pool(shellFiles, 4, async url => {
    try {
      const r = await withTimeout(fetch(url, { cache: 'no-cache' }), 30000);
      if (r.ok) await cache.put(url, r); else missing++;
    } catch (_) { missing++; }
  });
  return missing;
}

/* Bisherige Bild-Caches übernehmen statt neu laden (spart beim Update das Datenvolumen). */
async function migrateLegacyCaches() {
  const target = await caches.open(CACHES.images);
  for (const name of await caches.keys()) {
    if (!P.LEGACY_CACHE.test(name)) continue;
    try {
      const old = await caches.open(name);
      for (const request of await old.keys()) {
        const key = P.cacheKey(request.url, 'image');
        if (P.classify(key, SCOPE) !== 'image' || await target.match(key)) continue;
        const response = await old.match(request);
        if (response && response.status === 200) await target.put(key, response);
      }
    } catch (_) {}
    await caches.delete(name);
  }
}

/* ---------- Lebenszyklus ---------- */
self.addEventListener('install', event => event.waitUntil((async () => {
  await precacheShell();
  await warmImages(startImages, 'start');
  await self.skipWaiting();
})()));

self.addEventListener('activate', event => event.waitUntil((async () => {
  await migrateLegacyCaches();
  const keep = new Set(Object.values(CACHES));
  for (const name of await caches.keys()) if (name.startsWith('emfd-shell-') && !keep.has(name)) await caches.delete(name);
  await self.clients.claim();
})()));

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const retry = url.searchParams.has('emfd_retry');
  const kind = P.classify(req.url, SCOPE);
  if (!kind) return;
  if (kind === 'audio') return handleAudio(event);
  if (kind === 'image') return event.respondWith(imageResponse(event, retry));
  if (kind === 'manifest') return event.respondWith(networkFirst(event, []));
  if (kind === 'document') return event.respondWith(networkFirst(event, [abs('./'), abs('index.html')]));
  if (kind === 'shell') return event.respondWith(shellResponse(event));
});

self.addEventListener('message', event => {
  const data = event.data || {};
  if (data.type === 'emfd-cache-warm') {
    const extra = Array.isArray(data.urls) ? data.urls.map(u => P.acceptWarmUrl(u, SCOPE)).filter(Boolean) : [];
    const urls = [...startImages, ...allowed, ...extra];
    if (!warming) warming = warmImages(urls, 'house').finally(() => { warming = null; });
    event.waitUntil(warming);
  } else if (data.type === 'emfd-cache-status') {
    event.waitUntil((async () => {
      const result = { type: 'emfd-cache-status', version: P.VERSION, caches: {} };
      for (const [name, cacheName] of Object.entries(CACHES)) {
        const cache = await caches.open(cacheName), keys = await cache.keys();
        let bytes = 0;
        for (const k of keys) bytes += Number((await cache.match(k))?.headers.get('X-EMFD-Bytes')) || 0;
        result.caches[name] = { files: keys.length, bytes };
      }
      result.imagesExpected = allowed.size;
      (event.ports?.[0] || event.source)?.postMessage(result);
    })());
  }
});

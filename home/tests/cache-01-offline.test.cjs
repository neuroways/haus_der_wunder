/* EMFD-CACHE-01 · Verhaltenstests für den Offline-Service-Worker (simulierte Worker-Umgebung). */
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), { execFileSync } = require('node:child_process');
const home = path.resolve(__dirname, '..'), read = f => fs.readFileSync(path.join(home, f), 'utf8');
const P = require('../offline-policy.js');
const ORIGIN = 'https://example.test', SW = ORIGIN + '/wunderhaus/home/image-service-worker.js';

function fakeCaches() {
  const store = new Map();
  const keyOf = r => (typeof r === 'string' ? r : r.url);
  const strip = u => u.split('?')[0];
  function cacheFor(name) {
    if (!store.has(name)) store.set(name, new Map());
    const map = store.get(name);
    return {
      async match(r, opts = {}) {
        const k = keyOf(r);
        let hit = map.get(k);
        if (!hit && opts.ignoreSearch) for (const [u, v] of map) if (strip(u) === strip(k)) { hit = v; break; }
        return hit ? hit.clone() : undefined;
      },
      async put(r, response) { map.set(keyOf(r), response.clone()); },
      async keys() { return [...map.keys()].map(url => ({ url })); },
      async delete(r) { return map.delete(keyOf(r)); }
    };
  }
  return { store, api: { async open(name) { return cacheFor(name); }, async keys() { return [...store.keys()]; }, async delete(name) { return store.delete(name); } } };
}

function worker({ network } = {}) {
  const { store, api } = fakeCaches();
  const handlers = {}, fetched = [];
  const context = {
    URL, Headers, Response, Request, Blob, console, setTimeout, clearTimeout,
    caches: api,
    EMFD_AUDIO_STORE_DELAY_MS: 0,
    location: { href: SW },
    navigator: { onLine: true },
    clients: { async claim() {}, async matchAll() { return []; } },
    async skipWaiting() {},
    addEventListener(type, fn) { handlers[type] = fn; },
    async fetch(input, init = {}) {
      const url = typeof input === 'string' ? input : input.url;
      const headers = input.headers || new Headers(init.headers || {});
      const method = init.method || input.method || 'GET';
      fetched.push({ url, method, range: headers.get ? headers.get('Range') : null });
      return network(url, method, headers);
    }
  };
  context.self = context;
  context.importScripts = (...files) => { for (const f of files) vm.runInContext(read(f), context, { filename: f }); };
  vm.createContext(context);
  vm.runInContext(read('image-service-worker.js'), context, { filename: 'image-service-worker.js' });
  async function dispatch(type, extra = {}) {
    const waits = []; let responded = null;
    const event = { waitUntil: p => waits.push(p), respondWith: p => { responded = p; }, ...extra };
    handlers[type](event);
    const response = responded ? await responded : null;
    for (let i = 0; i < waits.length; i++) await waits[i]; // waits kann während des Wartens wachsen
    return response;
  }
  const request = (url, init) => dispatch('fetch', { request: new Request(url, init) });
  return { context, store, fetched, dispatch, request, handlers };
}

const IMG = 'https://example.test/wunderhaus/media/optimized/cards/O01-630x1080-v1-47041d64df.webp';
const MP3 = 'https://example.test/wunderhaus/media/audio/O01-M01.mp3';
const bytes = n => Uint8Array.from({ length: n }, (_, i) => i % 251);
function okNetwork(url, method) {
  if (/\.mp3$/.test(url)) return new Response(method === 'HEAD' ? null : bytes(1000), { headers: { 'Content-Type': 'audio/mpeg', 'Content-Length': '1000', ETag: '"a1"' } });
  if (/\.(webp|png|jpe?g|svg)$/.test(url)) return new Response(bytes(400 * 1024), { headers: { 'Content-Type': 'image/webp' } });
  return new Response('ok:' + url, { headers: { 'Content-Type': 'text/plain' } });
}

test('CACHE-01 Regeln: Klassen, Hash-Erkennung, Range', () => {
  assert.equal(P.classify(IMG, SW), 'image');
  assert.equal(P.classify(MP3, SW), 'audio');
  assert.equal(P.classify(ORIGIN + '/wunderhaus/media/manifest.json', SW), 'manifest');
  assert.equal(P.classify(ORIGIN + '/wunderhaus/home/app.js?v=1', SW), 'shell');
  assert.equal(P.classify(ORIGIN + '/wunderhaus/home/', SW), 'document');
  assert.equal(P.classify(ORIGIN + '/wunderhaus/home/tests/x.js', SW), null);
  assert.equal(P.classify('https://other.test/wunderhaus/media/a.webp', SW), null);
  assert.equal(P.isImmutable(IMG), true);
  assert.equal(P.isImmutable(ORIGIN + '/wunderhaus/media/cards/fronts/O01-front-r2-21eca783.png'), true);
  assert.equal(P.isImmutable(ORIGIN + '/wunderhaus/media/cards/rueckseite.jpeg'), false);
  assert.deepEqual({ ...P.parseRange('bytes=0-1', 1000) }, { start: 0, end: 1 });
  assert.deepEqual({ ...P.parseRange('bytes=900-', 1000) }, { start: 900, end: 999 });
  assert.deepEqual({ ...P.parseRange('bytes=-100', 1000) }, { start: 900, end: 999 });
  assert.equal(P.parseRange('bytes=2000-', 1000), null);
  assert.equal(P.cacheKey(IMG + '?emfd_retry=1', 'image'), IMG);
});

test('CACHE-01 Installation lädt App-Dateien und Startbilder, aber keine Musik', async () => {
  const w = worker({ network: okNetwork });
  await w.dispatch('install');
  const shell = w.store.get(P.CACHES.shell), images = w.store.get(P.CACHES.images);
  const precache = vm.runInNewContext(read('offline-precache.js') + ';EMFDPrecache', {});
  assert.ok(precache.shell.length > 50);
  for (const f of ['./', 'index.html', 'app.js?v=0.6.70', 'offline-ready.js?v=cache01-v1', '../media/media-loader.js?v=1.1.0']) {
    assert.ok(shell.has(new URL(f, SW).href), 'fehlt im App-Cache: ' + f);
  }
  const start = vm.runInNewContext(read('offline-images.js') + ';EMFDOfflineImages', {}).start;
  for (const f of start) assert.ok(images.has(new URL(f, SW).href), 'Startbild fehlt: ' + f);
  assert.ok(w.fetched.every(f => !/\.mp3$/.test(f.url)), 'Installation darf keine Musik laden');
});

test('CACHE-01 Stufe 2 lädt alle Hausbilder ohne Verdrängung, Musik-URLs werden abgewiesen', async () => {
  const w = worker({ network: okNetwork });
  await w.dispatch('message', { data: { type: 'emfd-cache-warm', urls: [MP3, 'https://evil.test/x.webp', ORIGIN + '/wunderhaus/media/cards/fronts/O19-front-r2-0123abcd.webp'] } });
  const images = w.store.get(P.CACHES.images);
  const list = vm.runInNewContext(read('offline-images.js') + ';EMFDOfflineImages', {});
  const expected = new Set([...list.start, ...list.house].map(f => new URL(f, SW).href));
  for (const url of expected) assert.ok(images.has(url), 'nicht vorab geladen: ' + url);
  assert.ok(images.has(ORIGIN + '/wunderhaus/media/cards/fronts/O19-front-r2-0123abcd.webp'), 'neue Vorderseite aus dem Manifest');
  let total = 0; for (const r of images.values()) total += Number(r.headers.get('X-EMFD-Bytes'));
  assert.ok(total > 20 * 1024 * 1024, 'keine 20-MB-Grenze mehr: alles bleibt gespeichert');
  assert.ok(![...images.keys()].some(u => /evil|\.mp3/.test(u)));
  // Zweiter Lauf lädt nichts erneut.
  const before = w.fetched.length;
  await w.dispatch('message', { data: { type: 'emfd-cache-warm', urls: [] } });
  assert.equal(w.fetched.length, before);
});

test('CACHE-01 Bilder kommen nach dem ersten Laden aus dem Cache – auch offline', async () => {
  let online = true;
  const w = worker({ network: (u, m, h) => { if (!online) throw new TypeError('offline'); return okNetwork(u, m, h); } });
  const first = await w.request(IMG);
  assert.equal(first.status, 200);
  const n = w.fetched.length;
  online = false;
  const second = await w.request(IMG);
  assert.equal(second.status, 200);
  assert.equal(w.fetched.length, n, 'Hash-Datei wird nie erneut geladen');
});

test('CACHE-01 Musik: erstes Abspielen aus dem Netz, danach Teilanfragen (206) aus dem Cache', async () => {
  const w = worker({ network: okNetwork });
  await w.context.caches.open(P.CACHES.audio); // Index laden
  await new Promise(r => setTimeout(r, 0));
  const first = await w.request(MP3, { headers: { Range: 'bytes=0-1' } });
  assert.equal(first, null, 'erste Wiedergabe streamt nativ (kein Eingriff)');
  assert.ok(w.store.get(P.CACHES.audio).has(MP3), 'Datei wurde einmal vollständig gespeichert');
  assert.equal(w.fetched.filter(f => f.url === MP3 && f.method === 'GET').length, 1);
  const part = await w.request(MP3, { headers: { Range: 'bytes=10-19' } });
  assert.equal(part.status, 206);
  assert.equal(part.headers.get('Content-Range'), 'bytes 10-19/1000');
  assert.deepEqual([...new Uint8Array(await part.arrayBuffer())], [...bytes(1000).slice(10, 20)]);
  const whole = await w.request(MP3);
  assert.equal(whole.status, 200); assert.equal(whole.headers.get('Accept-Ranges'), 'bytes');
  assert.equal(w.fetched.filter(f => f.url === MP3 && f.method === 'GET').length, 1, 'kein erneuter Download');
  const bad = await w.request(MP3, { headers: { Range: 'bytes=5000-' } });
  assert.equal(bad.status, 416);
});

test('CACHE-01 Musik: geänderte Datei gleichen Namens wird erkannt und verworfen', async () => {
  let etag = '"a1"';
  const w = worker({ network: (u, m) => /\.mp3$/.test(u) ? new Response(m === 'HEAD' ? null : bytes(1000), { headers: { 'Content-Type': 'audio/mpeg', 'Content-Length': '1000', ETag: etag } }) : okNetwork(u, m) });
  await new Promise(r => setTimeout(r, 0));
  await w.request(MP3);
  assert.ok(w.store.get(P.CACHES.audio).has(MP3));
  etag = '"b2"';
  await w.request(MP3, { headers: { Range: 'bytes=0-1' } });
  assert.ok(!w.store.get(P.CACHES.audio).has(MP3), 'veraltete Fassung entfernt; nächstes Abspielen lädt neu');
});

test('CACHE-01 Update übernimmt den bisherigen Bildcache statt neu zu laden', async () => {
  const w = worker({ network: okNetwork });
  const legacy = await w.context.caches.open('emfd-images-recovery-v8');
  await legacy.put(IMG, new Response(bytes(10), { headers: { 'Content-Type': 'image/webp' } }));
  await w.dispatch('activate');
  assert.ok(!w.store.has('emfd-images-recovery-v8'));
  assert.ok(w.store.get(P.CACHES.images).has(IMG));
  const n = w.fetched.length;
  await w.request(IMG);
  assert.equal(w.fetched.length, n);
});

test('CACHE-01 App startet offline aus dem Cache', async () => {
  let online = true;
  const w = worker({ network: (u, m, h) => { if (!online) throw new TypeError('offline'); return okNetwork(u, m, h); } });
  await w.dispatch('install');
  online = false;
  const doc = await w.request(ORIGIN + '/wunderhaus/home/', { mode: 'same-origin' });
  assert.equal(doc.status, 200);
  const js = await w.request(ORIGIN + '/wunderhaus/home/app.js?v=0.6.70');
  assert.match(await js.text(), /app\.js/);
});

test('CACHE-01 Registrierung, Einbindung und erzeugte Liste sind aktuell', () => {
  assert.match(read('image-profiles.js'), /register\('image-service-worker\.js\?v=cache01-v1',\{scope:'\.\/',updateViaCache:'none'\}\)/);
  const html = read('index.html');
  assert.ok(html.indexOf('media-bridge.js') < html.indexOf('offline-ready.js'));
  execFileSync(process.execPath, [path.join(home, 'scripts/build-offline-precache.mjs'), '--check'], { stdio: 'pipe' });
  assert.doesNotMatch(read('offline-ready.js'), /createElement|innerHTML|progress-bar/, 'keine sichtbare Fortschrittsanzeige');
});

// Node-Tests für media-loader.js:  node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
// Repo-Aufbau: Loader aus media/, Testmanifest (Revision 1) aus work/ (erzeugt von tests/run_tests.sh)
const mediaDir = path.join(here, '..', 'media');
const manifestPath = process.env.EMFD_TEST_MANIFEST || path.join(here, '..', 'work', 'manifest.json');
const require = createRequire(import.meta.url);
const EMFDMedia = require(path.join(mediaDir, 'media-loader.js'));
const MANIFEST_TEXT = readFileSync(manifestPath, 'utf8');
const ORIGIN = 'https://flowisaurus.de';

function memStorage() { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }; }

function fakeFetch(bodyOrFn, { status = 200, type = 'application/json' } = {}) {
  const calls = [];
  const fn = async (url, init) => {
    calls.push({ url, init });
    const body = typeof bodyOrFn === 'function' ? bodyOrFn(calls.length) : bodyOrFn;
    if (body instanceof Error) throw body;
    return { ok: status < 400, status, headers: { get: (h) => (h.toLowerCase() === 'content-type' ? type : null) }, text: async () => body };
  };
  fn.calls = calls;
  return fn;
}

function withLocation(href, fn) {
  const prev = globalThis.location;
  globalThis.location = new URL(href);
  try { return fn(); } finally { if (prev === undefined) delete globalThis.location; else globalThis.location = prev; }
}

const APP_PAGES = [
  `${ORIGIN}/wunderhaus/home/`,
  `${ORIGIN}/wunderhaus/home/index.html#karte/O01`,
  `${ORIGIN}/wunderhaus/home/3d/claude/v1/`,
  `${ORIGIN}/wunderhaus/home/3d/claude/v2/index.html`,
  `${ORIGIN}/wunderhaus/home/3d/codex/v1/`,
  `${ORIGIN}/wunderhaus/home/3d/claude/v2/experimente/a/b/c/`,
];

test('identische aufgelöste URLs aus allen App-Verzeichnissen', async () => {
  const results = [];
  for (const page of APP_PAGES) {
    const loader = withLocation(page, () => EMFDMedia.create({ fetch: fakeFetch(MANIFEST_TEXT), storage: memStorage() }));
    await loader.init();
    const card = loader.getCard('O13');
    results.push({ manifest: loader.manifestUrl, front: card.front.url, audio: card.audio.url, back: card.back.url, root: loader.mediaRoot });
  }
  assert.equal(results[0].manifest, `${ORIGIN}/wunderhaus/media/manifest.json`);
  assert.equal(results[0].root, `${ORIGIN}/wunderhaus/media/`);
  for (const r of results) assert.deepEqual(r, results[0]);
  assert.ok(results[0].front.startsWith(`${ORIGIN}/wunderhaus/media/`));
  assert.ok(!results[0].front.includes('..'));
});

test('24 Karten, 25 Primär-Playlist-Einträge, 35 Audio-Pfade, keine O25', async () => {
  const l = EMFDMedia.create({ manifestUrl: `${ORIGIN}/wunderhaus/media/manifest.json`, fetch: fakeFetch(MANIFEST_TEXT), storage: memStorage() });
  await l.init();
  const ids = l.listCards();
  assert.equal(ids.length, 24);
  assert.equal(new Set(ids).size, 24);
  assert.ok(!ids.includes('O25'));
  const pl = l.getPlaylist('primary');
  assert.equal(pl.items.length, 25);
  assert.equal(new Set(pl.items.map((i) => i.id)).size, 25);
  assert.equal(pl.items[0].id, 'T03');
  assert.equal(pl.autoplay, false);
  const audioPaths = new Set();
  for (const a of Object.values(l.manifest.assets)) if (a.role === 'audio') for (const v of Object.values(a.variants)) audioPaths.add(v.path);
  assert.equal(audioPaths.size, 35);
  for (const item of pl.items) assert.notEqual(item.audio.release, 'test');
});

test('Motiv-, Song- und Cover-Zuordnung je ID', async () => {
  const l = EMFDMedia.create({ manifestUrl: `${ORIGIN}/wunderhaus/media/manifest.json`, fetch: fakeFetch(MANIFEST_TEXT), storage: memStorage(), allowStaged: true });
  await l.init();
  for (const id of l.listCards()) {
    const c = l.getCard(id);
    assert.equal(c.audio.url, `${ORIGIN}/wunderhaus/media/audio/${id}.mp3`, id);
    assert.equal(c.front.owner, id);
    if (c.cover.state !== 'fallback' && c.cover.usable) assert.equal(c.cover.owner, id);
  }
  assert.equal(l.getCard('O11').title, 'Der Werkzeugkasten');
  assert.equal(l.getCard('O12').title, 'Das bewegliche Mobile');
  assert.match(l.getCard('O24').cover.url, /covers\/O24-cover-160-r1-/);
  assert.equal(l.getPlaylist().items[0].audio.url, `${ORIGIN}/wunderhaus/media/audio/THEME.mp3`);
});

test('vor Upload: neue Vorderseite nicht nutzbar -> markierter Fallback; nach Upload: aktuelle Fassung', async () => {
  const pre = EMFDMedia.create({ manifestUrl: `${ORIGIN}/wunderhaus/media/manifest.json`, fetch: fakeFetch(MANIFEST_TEXT), storage: memStorage() });
  await pre.init();
  const f = pre.getCard('O01').front;
  assert.equal(f.state, 'fallback');
  assert.match(f.url, /optimized\/cards\/O01-630x1080-v1-/);
  assert.match(f.reason, /noch nicht hochgeladen/);
  const stage = EMFDMedia.create({ manifestUrl: `${ORIGIN}/wunderhaus/media/manifest.json`, fetch: fakeFetch(MANIFEST_TEXT), storage: memStorage(), allowStaged: true });
  await stage.init();
  const g = stage.getCard('O01').front;
  assert.equal(g.state, 'current');
  assert.match(g.url, /optimized\/cards\/O01-630x1080-r2-/);
  assert.equal(stage.getCard('O19').front.state, 'unconfirmed');
});

test('Veraltete Kartenbilder werden nie direkt als aktuell ausgegeben', async () => {
  const l = EMFDMedia.create({ manifestUrl: `${ORIGIN}/wunderhaus/media/manifest.json`, fetch: fakeFetch(MANIFEST_TEXT), storage: memStorage(), allowStaged: true });
  await l.init();
  const old = l.getAsset('card.O01.front.r1', 'view');
  assert.equal(old.usable, false);
  assert.match(old.reason, /Veraltet/);
});

test('fehlende Medien: lesbarer Grund und url null, keine synthetischen URLs', async () => {
  const l = EMFDMedia.create({ manifestUrl: `${ORIGIN}/wunderhaus/media/manifest.json`, fetch: fakeFetch(MANIFEST_TEXT), storage: memStorage() });
  await l.init();
  const c = l.getCard('O05');
  assert.equal(c.objectSprite.url, null);
  assert.equal(c.objectSprite.usable, false);
  assert.ok(c.objectSprite.reason);
  assert.equal(c.model.url, null);
  assert.equal(c.objectReference.url, null);
  assert.match(c.objectReference.reason, /Archiv/);
  assert.equal(l.getAsset('gift.cover.r1').url, null);
  assert.equal(l.getAsset('gibt-es-nicht').usable, false);
  assert.equal(c.cover.state, 'fallback');
});

test('Testmedien nur in interner Playlist und nur im privaten Kanal', async () => {
  const priv = EMFDMedia.create({ manifestUrl: `${ORIGIN}/wunderhaus/media/manifest.json`, fetch: fakeFetch(MANIFEST_TEXT), storage: memStorage() });
  await priv.init();
  const internal = priv.getPlaylist('internal');
  assert.equal(internal.items.length, 10);
  assert.ok(internal.items.every((i) => i.audio.usable));
  assert.equal(priv.getAsset('audio.S01-D-A').usable, false);
  const pub = EMFDMedia.create({ manifestUrl: `${ORIGIN}/wunderhaus/media/manifest.json`, fetch: fakeFetch(MANIFEST_TEXT), storage: memStorage(), channel: 'public' });
  await pub.init();
  assert.equal(pub.getPlaylist('internal').items.length, 0);
  assert.equal(pub.getCard('O01').audio.usable, false, 'nicht freigegebene Musik ist öffentlich nicht nutzbar');
});

test('Revalidierung: no-cache; parallele Aufrufe teilen eine Anfrage', async () => {
  const fx = fakeFetch(MANIFEST_TEXT);
  const l = EMFDMedia.create({ manifestUrl: `${ORIGIN}/wunderhaus/media/manifest.json`, fetch: fx, storage: memStorage() });
  await Promise.all([l.init(), l.refresh(), l.refresh()]);
  assert.equal(fx.calls.length, 1);
  assert.equal(fx.calls[0].init.cache, 'no-cache');
});

test('Last-known-good: offline startet aus Cache, Status stale', async () => {
  const storage = memStorage();
  const a = EMFDMedia.create({ manifestUrl: `${ORIGIN}/wunderhaus/media/manifest.json`, fetch: fakeFetch(MANIFEST_TEXT), storage });
  await a.init();
  const b = EMFDMedia.create({ manifestUrl: `${ORIGIN}/wunderhaus/media/manifest.json`, fetch: fakeFetch(new Error('offline')), storage });
  const errors = [];
  b.on('error', (e) => errors.push(e.code));
  await b.init();
  assert.equal(b.status.source, 'cache');
  assert.equal(b.status.stale, true);
  assert.equal(errors[0], 'network');
  assert.equal(b.getCard('O02').title, 'Der Vorhang');
});

test('HTML statt JSON wird erkannt; ohne Cache klarer Fehler', async () => {
  const l = EMFDMedia.create({ manifestUrl: `${ORIGIN}/wunderhaus/media/manifest.json`, fetch: fakeFetch('<!doctype html><html>404</html>', { type: 'text/html' }), storage: memStorage() });
  await assert.rejects(l.init(), (e) => e.code === 'html');
  assert.throws(() => l.getCard('O01'), (e) => e.code === 'not-ready');
});

test('neue Manifestrevision wird ohne Codeänderung sichtbar (update-Ereignis)', async () => {
  const next = JSON.parse(MANIFEST_TEXT);
  next.revision += 1;
  next.assets['card.O01.front.r2'].variants.view.availability = 'verified';
  const fx = fakeFetch((n) => (n === 1 ? MANIFEST_TEXT : JSON.stringify(next)));
  const l = EMFDMedia.create({ manifestUrl: `${ORIGIN}/wunderhaus/media/manifest.json`, fetch: fx, storage: memStorage() });
  await l.init();
  assert.equal(l.getCard('O01').front.state, 'fallback');
  const updates = [];
  l.on('update', (u) => updates.push(u));
  await l.refresh();
  assert.deepEqual(updates, [{ from: 1, to: 2 }]);
  assert.equal(l.getCard('O01').front.state, 'current');
  assert.match(l.getCard('O01').front.url, /O01-630x1080-r2-/);
});

test('Pfadschutz: keine ../-, absoluten oder fremden URLs', async () => {
  const bad = JSON.parse(MANIFEST_TEXT);
  bad.assets['card.O02.front.r2'].variants.view.path = '../home/evil.webp';
  const l = EMFDMedia.create({ manifestUrl: `${ORIGIN}/wunderhaus/media/manifest.json`, fetch: fakeFetch(JSON.stringify(bad)), storage: memStorage(), allowStaged: true });
  await l.init();
  const f = l.getCard('O02').front;
  assert.equal(f.state, 'fallback', 'unsicherer Pfad darf nicht ausgeliefert werden');
  assert.throws(() => l.resolveUrl('https://example.org/x.png'), (e) => e.code === 'path');
  assert.throws(() => l.resolveUrl('/wunderhaus/home/x.png'), (e) => e.code === 'path');
  assert.equal(l.resolveUrl('cards/O01.png'), `${ORIGIN}/wunderhaus/media/cards/O01.png`);
});

test('Merge-Modus: Altinhalt + mediaCore wird gelesen', async () => {
  const merged = { project: 'alt', schemaVersion: '1.0', assets: [{ path: '/media/cards/O01.png' }], mediaCore: JSON.parse(MANIFEST_TEXT) };
  const l = EMFDMedia.create({ manifestUrl: `${ORIGIN}/wunderhaus/media/manifest.json`, fetch: fakeFetch(JSON.stringify(merged)), storage: memStorage() });
  await l.init();
  assert.equal(l.listCards().length, 24);
});

test('falsches Schema (altes v1-Manifest ohne mediaCore) wird abgewiesen', async () => {
  const l = EMFDMedia.create({ manifestUrl: `${ORIGIN}/wunderhaus/media/manifest.json`, fetch: fakeFetch(JSON.stringify({ schemaVersion: '1.0', assets: [] })), storage: memStorage() });
  await assert.rejects(l.init(), (e) => e.code === 'schema');
});

test('Gerätezuordnung P01–P08 aus Live-Stand 04.11.', async () => {
  const l = EMFDMedia.create({ manifestUrl: `${ORIGIN}/wunderhaus/media/manifest.json`, fetch: fakeFetch(MANIFEST_TEXT), storage: memStorage() });
  await l.init();
  assert.deepEqual(l.getDevice('P03').cardIds, ['O21', 'O13', 'O10', 'O05']);
  assert.deepEqual(l.getDevice('P08').cardIds, ['O24', 'O04', 'O06']);
  assert.ok(l.getRoom('P08').image.url.endsWith('/wunderhaus/media/rooms/P08-teezimmer.webp') || l.getRoom('P08').image.url.includes('/optimized/rooms/P08-teezimmer-'));
});

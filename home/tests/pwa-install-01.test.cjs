const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const home = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(home, 'manifest.webmanifest'),'utf8'));
const html = fs.readFileSync(path.join(home, 'index.html'), 'utf8');
test('PWA install metadata points to the exact website root without hash', () => {
  for(const key of ['start_url','scope','id'])assert.equal(manifest[key],'/wunderhaus/home/');
  assert.equal(new URL(manifest.start_url,'https://flowisaurus.de').href, 'https://flowisaurus.de/wunderhaus/home/');
  assert.ok(!manifest.start_url.includes('#ankommen'));
  assert.ok(!manifest.start_url.includes('#flur'));
});
test('Android and iOS get the requested install name', () => {
  assert.equal(manifest.name,'Haus der kleinen Wunder');
  assert.equal(manifest.short_name,'Haus der kleinen Wunder');
  assert.match(html, /<meta name="apple-mobile-web-app-title" content="Haus der kleinen Wunder">/);
  assert.match(html, /<title>Haus der kleinen Wunder<\/title>/);
});
test('manifest link carries new cache revision and scope is internally consistent', () => {
  assert.ok(html.includes(`href="manifest.webmanifest?v=${manifest.version}"`),'manifest link is cache-busted with the manifest version');
  assert.ok(manifest.start_url.startsWith(manifest.scope));
});

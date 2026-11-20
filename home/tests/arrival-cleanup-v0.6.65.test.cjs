const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('ARRIVAL-01 / BOOK-01d: the arrival has no gift button; the gift opens from the letter in the scene, the hall and help',()=>{
  const start=read('start-gate.js'),entrance=read('entrance.js');
  const app=read('app.js');
  // Die frühere Haustür ist durch die Eingangsszene ersetzt (EMFD-UX-TUT-02 v0.3).
  assert.doesNotMatch(start,/function renderDoor/);
  assert.doesNotMatch(entrance,/data-start-gift-open|Über dieses Geschenk/);
  assert.match(entrance,/openGift\?\.\(false\)/);
  assert.match(app,/data-start-gift-open>Über dieses Geschenk/);
  assert.match(read('index.html'),/data-start-gift-open>Geschenkbrief und Geschenkkarte/);
});

test('The global navigation is absent on every route',()=>{
  assert.doesNotMatch(read('index.html'),/<nav class="global-nav/);
});
test('ARRIVAL-01 release metadata is consistent across all version markers',()=>{
  const version=JSON.parse(read('package.json')).version;
  assert.equal(JSON.parse(read('manifest.webmanifest')).version,version);
  assert.equal(JSON.parse(read('deployment-layout.json')).appVersion,version);
  assert.ok(read('index.html').includes(`application-version" content="${version}"`));
  assert.ok(read('app.js').includes(`start-gate.js?v=${version}`));
});

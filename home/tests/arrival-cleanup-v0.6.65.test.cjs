const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('ARRIVAL-01 removes the gift button only from the arrival door',()=>{
  const start=read('start-gate.js');
  const app=read('app.js');
  const door=start.slice(start.indexOf('function renderDoor'),start.indexOf('function giftMarkup'));
  assert.match(door,/data-start02-enter/);
  assert.doesNotMatch(door,/data-start-gift-open|Über dieses Geschenk/);
  assert.match(app,/data-start-gift-open>Über dieses Geschenk/);
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

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const js=read('teezimmer.js'),css=read('teezimmer.css'),html=read('index.html');

// Decision v0.6.64 (EMFD-UI-ARCH-01), confirmed 19.11.2026: the tea room keeps exactly two actions.
// The free thought paper from TEA-01 (v0.6.58) has no tea-room entry any more.
test('TEA-01: tea room offers exactly the two chosen actions and no paper button',()=>{
  const nav=js.match(/<nav class="teezimmer-actions"[^>]*>([\s\S]*?)<\/nav>/);
  assert.ok(nav,'Teezimmer action nav must exist');
  assert.equal((nav[1].match(/data-house-feature="/g)||[]).length,2);
  assert.match(nav[1],/data-card-overview>Eine Karte aussuchen</);
  assert.match(nav[1],/data-daily-card>Tageskarte ziehen</);
  assert.doesNotMatch(js,/data-teezimmer-paper|Ein leeres Blatt nehmen|teezimmer-note-access/);
});
test('TEA-02: single bounded scroll region inside immersive room, not viewport-height fixed-offset controls',()=>{
  assert.match(js,/class="teezimmer-content" role="region"[^>]*tabindex="0"/);
  assert.match(css,/\.teezimmer-content\s*\{[^}]*overflow-y:auto/);
  assert.match(css,/\.teezimmer-content\s*\{[^}]*overscroll-behavior-y:contain/);
  assert.match(css,/\.teezimmer-view\s*\{[^}]*height:100%/);
  assert.doesNotMatch(css,/margin-top:\s*(?:18|46)dvh|margin-top:\s*310px|\.teezimmer-view\s*\{[^}]*min-height:760px/);
  assert.match(css,/env\(safe-area-inset-bottom\)/);
  assert.match(css,/@media\(orientation:landscape\)/);
});
test('TEA-03: tea room opens no editor of its own; the shared thought paper keeps its free mode',()=>{
  assert.doesNotMatch(js,/EMFDThoughtPaper/);
  assert.match(js,/data-teezimmer-status role="status" hidden/);
  // Free mode stays in the shared module (currently without an entry point, see open points).
  assert.match(read('thought-paper.js'),/returnHash:'#teezimmer'/);
  assert.match(read('thought-paper.js'),/if\(old\?\.isConnected\)old\.focus/);
});
test('TEA-04: preserve daily-card return, existing routes, music entry, and unchanged illustration',()=>{
  assert.match(js,/data-house-feature="daily" data-feature-room="P08"/);
  assert.match(read('feature-registry.js'),/root\.EMFDCardDraw\?\.begin\?\.\(card\.id,origin\?roomRoute\(origin\):'#karten'\)/);
  assert.match(js,/href="#flur"/);
  assert.match(js,/href="#karten"/);
  assert.match(js,/media\/rooms\/teezimmer_p08_background\.webp/);
  assert.match(js,/media\/rooms\/P08-teezimmer\.webp/);
  assert.match(js,/image\?\.addEventListener\('error',failed\)/);
  assert.match(read('room-music.js'),/host\.querySelector\('\.teezimmer-topbar'\)/);
  assert.doesNotMatch(js,/new Audio|\.play\(\)|\.stop\(\)/);
});
test('TEA-05: changed JS and CSS are cache-busted; versions consistent',()=>{
  for(const asset of ['teezimmer.js','teezimmer.css','thought-paper.css'])
    assert.ok(new RegExp(asset.replace('.','\\.')+'\\?v=[\\w.-]+"').test(html),asset);
  const version=JSON.parse(read('package.json')).version;
  assert.ok(html.includes(`application-version" content="${version}"`));
  assert.equal(JSON.parse(read('deployment-layout.json')).appVersion,version);
});

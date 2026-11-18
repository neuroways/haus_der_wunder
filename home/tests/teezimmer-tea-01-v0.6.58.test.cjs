const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const js=read('teezimmer.js'),css=read('teezimmer.css'),html=read('index.html');

test('TEA-01: paper is fourth standard navigation action, not a standalone overlay',()=>{
  const nav=js.match(/<nav class="teezimmer-actions"[^>]*>([\s\S]*?)<\/nav>/);
  assert.ok(nav,'Teezimmer action nav must exist');
  assert.equal((nav[1].match(/data-(?:daily-card|card-overview|teezimmer-paper)/g)||[]).length,4);
  assert.match(nav[1],/data-teezimmer-paper/);
  assert.match(nav[1],/Ein leeres Blatt nehmen/);
  assert.doesNotMatch(js,/teezimmer-note-access/);
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
test('TEA-03: uses the one shared private free-mode editor and has a visible failure announcement',()=>{
  assert.match(js,/root\.EMFDThoughtPaper\.open\(\{mode:'free'\},e\.currentTarget\)/);
  assert.match(js,/data-teezimmer-status role="status" hidden/);
  assert.match(js,/Das Gedankenblatt konnte nicht geladen werden/);
  assert.match(read('thought-paper.js'),/returnHash:'#teezimmer'/);
  assert.match(read('thought-paper.js'),/if\(old\?\.isConnected\)old\.focus/);
});
test('TEA-04: preserve daily-card return, existing routes, music entry, and unchanged illustration',()=>{
  assert.match(js,/EMFDCardDraw\?\.begin\?\.\(card\.id,'#teezimmer'\)/);
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
    assert.ok(html.includes(asset+'?v=0.6.58'),asset);
  assert.match(html,/application-version" content="0\.6\.61"/);
  assert.equal(JSON.parse(read('package.json')).version,'0.6.61');
  assert.equal(JSON.parse(read('deployment-layout.json')).appVersion,'0.6.61');
});

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const cards=JSON.parse(read('data.js').replace(/^window\.CARDS=/,'').replace(/;\s*$/,''));
const tea=read('teezimmer.js');
const css=read('teezimmer.css');
const app=read('app.js');

test('P08-01/02: Teezimmer is reachable from Flur and room directory',()=>{
  assert.match(app,/href="#teezimmer"><strong>Teezimmer/);
  assert.match(app,/room\.id==='P08'\?'#teezimmer'/);
  assert.match(app,/route==='teezimmer'\|\|route==='ort\/P08'/);
});

test('P08-03/04: all card actions reuse the shared 24-card model',()=>{
  assert.equal(cards.length,24);
  assert.match(tea,/const cards=root\.CARDS\|\|\[\]/);
  assert.match(tea,/Eine Tageskarte ansehen/);
  assert.match(tea,/Selbst eine Karte auswählen/);
  assert.match(tea,/Alle Bildkarten ansehen/);
  assert.match(tea,/href="#karten"/);
});

test('P08-05: random card is selected only after deliberate activation',()=>{
  assert.match(tea,/addEventListener\('click',\(\)=>\{const card=randomCard\(\)/);
  assert.doesNotMatch(tea,/render\(host\)[\s\S]*?location\.hash=`karte\/\$\{randomCard/);
});

test('P08-06: card detail returns to Teezimmer',()=>{
  assert.match(tea,/rememberReturn\?\.\('#teezimmer'\)/);
  assert.match(tea,/EMFDCardDraw\?\.begin\?\.\(card\.id,'#teezimmer'\)/);
});

test('P08-07: Teezimmer does not create or reset audio and light state',()=>{
  assert.doesNotMatch(tea,/new Audio|EMFDAudioSession|hallLightOn|\.stop\(\)/);
});

test('P08-08/09: supplied room assets, fallback, responsive layout and reduced motion are present',()=>{
  assert.match(tea,/\/media\/rooms\/teezimmer_p08_background\.webp/);
  assert.match(tea,/is-missing/);
  assert.match(css,/@media\(max-width:620px\)/);
  assert.match(css,/@media\(orientation:landscape\)/);
  assert.match(css,/prefers-reduced-motion/);
});

test('P08-10: controls have semantic navigation and accessible names',()=>{
  assert.match(tea,/aria-labelledby="teezimmer-title"/);
  assert.match(tea,/aria-label="Auswahl im Teezimmer"/);
  assert.match(tea,/<button class="primary" type="button" data-daily-card>/);
  assert.match(tea,/alt="Ein warm beleuchtetes Teezimmer/);
});

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const cards=JSON.parse(read('data.js').replace(/^window\.CARDS=/,'').replace(/;\s*$/,''));
const atelier=read('atelier.js');
const app=read('app.js');

test('P04-01/02: Atelier and Flur navigation are wired',()=>{
  assert.match(app,/href="#atelier"><strong>Atelier/);
  assert.match(app,/route==='atelier'/);
  assert.match(atelier,/Atelier verlassen/);
});

test('P04-03/08: table route supports stable previous and next cards',()=>{
  assert.match(app,/atelier\/tisch/);
  assert.match(atelier,/data-gallery-move="previous"/);
  assert.match(atelier,/data-gallery-move="next"/);
  assert.match(atelier,/\(index\+1\)%registry\.length/);
});

test('P04-04/05: exactly 24 stable cards in four groups are shared',()=>{
  assert.equal(cards.length,24);
  assert.deepEqual(cards.map(card=>card.id),Array.from({length:24},(_,i)=>`O${String(i+1).padStart(2,'0')}`));
  for(const group of ['Ruhe','Kraft','Halt','Freude'])assert.equal(cards.filter(card=>card.group===group).length,6,group);
});

test('P04-06: Atelier remembers the current registered card',()=>{
  assert.match(atelier,/emfd\.atelier\.current/);
  assert.match(atelier,/rememberCard\(card\.id\)/);
});

test('P04-07/09: texts stay voluntary and direct card routes remain stable',()=>{
  assert.match(atelier,/data-atelier-text/);
  assert.match(atelier,/card\.impulse/);
  assert.ok(cards.every(card=>card.impulse&&card.depth&&card.question));
});

test('P04-10/11: light and audio state are not owned or reset by Atelier',()=>{
  assert.doesNotMatch(atelier,/hallLightOn\s*=/);
  assert.doesNotMatch(atelier,/new Audio|EMFDAudioSession|\.stop\(\)/);
});

test('P04-12/13: responsive and accessible controls are provided',()=>{
  const css=read('atelier.css');
  assert.match(css,/@media\(max-width:560px\)/);
  assert.match(css,/@media\(orientation:landscape\)/);
  assert.match(css,/prefers-reduced-motion/);
  assert.match(atelier,/aria-label="Zwischen Bildkarten blättern"/);
});

test('P04 media paths reference supplied UI-free assets',()=>{
  // PERF-01 (v0.6.51) replaced the original room files by their optimized variants.
  const paths=[...new Set(atelier.match(/\.\.\/media\/optimized\/rooms\/P04-atelier[^'"`\s,)]+\.webp/g)||[])];
  assert.ok(paths.some(p=>/\/P04-atelier-\d+-v1-[0-9a-f]+\.webp$/.test(p)),'P04 room image');
  assert.ok(paths.some(p=>/\/P04-atelier-kartenauslage-v1-\d+-v1-[0-9a-f]+\.webp$/.test(p)),'P04 card table variant');
  for(const p of paths)assert.ok(fs.existsSync(path.resolve(__dirname,'..',p)),p);
});

test('documented O-ID image swaps are corrected canonically',()=>{
  for(const card of cards){
    assert.equal(card.image,`../media/cards/${card.id}.png`);
    assert.equal(card.imageSourceId,card.id);
  }
});

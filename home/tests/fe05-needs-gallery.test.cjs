const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const home=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(home,file),'utf8');
const cards=JSON.parse(read('data.js').replace(/^window\.CARDS=/,'').replace(/;\s*$/,''));
const js=read('atelier.js');
const css=read('atelier.css');
const app=read('app.js');

test('register contains 24 stable cards and six cards in every need group',()=>{
  assert.deepEqual(cards.map(card=>card.id),Array.from({length:24},(_,index)=>`O${String(index+1).padStart(2,'0')}`));
  for(const group of ['Ruhe','Kraft','Halt','Freude'])assert.equal(cards.filter(card=>card.group===group).length,6,group);
  for(const card of cards){
    assert.equal(card.image,`../media/cards/${card.id}.png`);
    assert.equal(card.imageSourceId,card.id);
    assert.ok(card.name&&card.impulse,`${card.id} title and text`);
  }
});

test('first visit asks the voluntary viewing question without a default selection',()=>{
  assert.match(js,/let group=null/);
  assert.match(js,/if\(!GROUPS\.includes\(group\)\)group=null/);
  assert.match(js,/Wie möchtest du heute schauen\?/);
  for(const label of ['Alle entdecken','Ruhe','Kraft','Halt','Freude'])assert.ok(js.includes(label),label);
  assert.doesNotMatch(js,/Wie fühlst du dich|Wie geht es dir/);
});

test('chosen group can be changed and survives card-detail return',()=>{
  assert.match(js,/sessionStorage\.setItem\(GROUP_KEY,group\)/);
  assert.match(js,/aria-label="Kartengruppe wechseln"/);
  assert.match(js,/rememberGridScroll\(\);rememberReturn\('#karten'\)/);
  assert.match(js,/sessionStorage\.setItem\(SCROLL_KEY/);
  assert.match(js,/scrollTo\(\{top:scroll,left:0,behavior:'auto'\}\)/);
});

test('direct card routes remain available without the invitation',()=>{
  assert.match(app,/route\.startsWith\('karte\/'\)/);
  assert.match(app,/EMFDAtelier\.renderGrid/);
  assert.match(js,/href="#karte\/\$\{card\.id\}"/);
});

test('gallery is touch-friendly, two-column, overflow-safe and motion-aware',()=>{
  assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css,/\.atelier-choice button,\.atelier-filters button\{[^}]*min-height:48px/);
  assert.match(css,/\.atelier-overview\{[^}]*overflow-x:hidden/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css,/aspect-ratio:7\/12/);
  assert.match(css,/object-fit:contain/);
});

test('FE-05 does not introduce automatic or parallel audio',()=>{
  assert.doesNotMatch(js,/new Audio|\.play\(|autoplay/);
  assert.match(js,/data-music-toggle/);
});

test('existing Atelier media is used and no new image path is invented',()=>{
  assert.match(js,/\.\.\/media\/rooms\/varianten\/P04-atelier-kartenauslage-v1\.webp/);
  assert.doesNotMatch(js,/generated|placeholder.*atelier/i);
});

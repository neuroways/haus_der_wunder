const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const home=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(home,file),'utf8');
const cards=JSON.parse(read('data.js').replace(/^window\.CARDS=/,'').replace(/;\s*$/,''));
const js=read('atelier.js');
const css=read('atelier.css');

test('all 24 gallery assets use their verified 7:12 source dimensions',()=>{
  assert.equal(cards.length,24);
  for(const card of cards){
    assert.ok(fs.existsSync(path.resolve(home,card.image)),`${card.id} media exists`);
  }
  assert.match(js,/const width=896,height=1536/);
  assert.match(css,/object-fit:contain/);
  assert.doesNotMatch(css,/\.atelier-art img\{[^}]*object-fit:cover/);
  assert.match(css,/body\.atelier-home-view main\.emfd-shell__content,body\.atelier-table-view main\.emfd-shell__content\{[^}]*padding:0!important/);
});

test('cyclic navigation covers O24 to O01 and O01 to O24',()=>{
  assert.match(js,/registry\[\(index\+registry\.length-1\)%registry\.length\]/);
  assert.match(js,/registry\[\(index\+1\)%registry\.length\]/);
  assert.deepEqual(cards.map(card=>card.id),Array.from({length:24},(_,index)=>`O${String(index+1).padStart(2,'0')}`));
});

test('gallery has three primary actions and a clear exit',()=>{
  // EMFD-NAV-01: the exit is the shared context back link (fallback: all rooms).
  assert.ok(js.includes("backLinkMarkup?.('#raeume')"));
  assert.match(js,/>Zurück</);
  assert.match(js,/>Text lesen</);
  assert.match(js,/>Weiter</);
  assert.doesNotMatch(js,/Karten am Tisch ansehen|Zufällige Bildkarte|Alle Bildkarten öffnen/);
});

test('text and zoom dialogs preserve the current gallery card',()=>{
  assert.match(js,/data-atelier-text-dialog/);
  assert.match(js,/data-atelier-zoom-dialog/);
  assert.match(js,/dialog\._atelierOpener/);
  assert.match(js,/data-dialog-close/);
});

test('motion is directional, bounded and reduced-motion safe',()=>{
  assert.match(css,/transition:transform 380ms/);
  assert.match(css,/is-leaving-next/);
  assert.match(css,/is-entering-previous/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(js,/prefers-reduced-motion: reduce/);
  assert.match(js,/classList\.remove\('is-entering','is-entering-next','is-entering-previous'\)/);
});

test('Atelier does not start, stop, or replace global audio',()=>{
  assert.doesNotMatch(js,/new Audio|play\(|pause\(|stop\(|EMFDAudio/);
});

test('Atelier exposes the shared global music toggle beside help',()=>{
  assert.match(js,/atelier-topbar-controls/);
  assert.equal((js.match(/data-music-toggle/g)||[]).length,2);
  assert.equal((js.match(/data-atelier-help aria-label="Hilfe öffnen">\?<\/button>/g)||[]).length,2);
  assert.match(css,/\.atelier-topbar-controls\{[^}]*display:flex/);
  assert.match(css,/\.atelier-music-toggle\[aria-pressed="true"\]/);
});

test('current image is prioritized and only neighbors are preloaded',()=>{
  assert.match(js,/fetchpriority="high"/);
  assert.match(js,/loading="lazy"/);
  assert.match(js,/\[previous,next\]\.forEach/);
});

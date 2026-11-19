// EMFD-NAV-01 · Abnahmetests N01–N12 als Verhalten: echter Navigationsdienst + simulierter Browserverlauf.
const test=require('node:test'),assert=require('node:assert/strict');
const {createNavigation,createHistoryMirror,backLinkHTML,route,describe,fallbackFor}=require('../shared/navigation.js');

// Minimal browser history: push (location.hash=…), go (Back/Forward), replace (location.replace), per-entry state.
function createBrowser(start){
  const b={entries:[{hash:start,state:null}],idx:0,listeners:[],
    get hash(){return b.entries[b.idx].hash;},
    get state(){return b.entries[b.idx].state;},
    push(hash){if(hash===b.hash)return;b.entries.length=b.idx+1;b.entries.push({hash,state:null});b.idx++;b.fire();},
    go(delta){const next=b.idx+delta;if(next<0||next>=b.entries.length)throw Error('left the app');b.idx=next;b.fire();},
    replace(hash){b.entries[b.idx]={hash,state:null};b.fire();},
    fire(){for(const listener of b.listeners)listener(b.hash);}};
  return b;
}
// Wires navigation exactly like the browser branch of shared/navigation.js does.
function boot(browser,store={value:null}){
  const mirror=createHistoryMirror({getState:()=>browser.state,setState:state=>{browser.entries[browser.idx].state=state;},
    go:delta=>browser.go(delta),replace:hash=>browser.replace(hash),
    load:()=>store.value?JSON.parse(store.value):null,save:value=>{store.value=JSON.stringify(value);}});
  mirror.init(route(browser.hash)||'#ankommen');
  const nav=createNavigation({getHash:()=>browser.hash,setHash:hash=>browser.push(hash),
    initialReturn:()=>mirror.index>0?mirror.entries[mirror.index-1]:null,
    historyBack:target=>mirror.back(target),
    replaceHash:hash=>{browser.entries[browser.idx].hash=hash;mirror.replaceCurrent(hash);}});
  browser.listeners.length=0;
  browser.listeners.push(hash=>{const r=route(hash);if(r)mirror.track(r);nav.observe(hash);});
  return {nav,mirror,store,browser,open:hash=>assert.equal(nav.go(hash),true),back:fallback=>nav.back(fallback),
    target:fallback=>nav.backLink(fallback).target};
}
const start=hash=>boot(createBrowser(hash));

test('N01: Flur → P01 → App-Rückweg führt per history.back() zum Flur, ohne neuen Eintrag',()=>{
  const app=start('#flur');app.open('#ort/P01');
  assert.equal(app.target('#raeume'),'#flur');
  app.back('#raeume');
  assert.equal(app.browser.hash,'#flur');assert.equal(app.browser.idx,0);assert.equal(app.browser.entries.length,2);
});

test('N02/N03: App-Rückweg und Browser-Zurück/Vorwärts bleiben konsistent',()=>{
  const app=start('#flur');app.open('#raeume');app.open('#ort/P02');
  app.back('#raeume');assert.equal(app.browser.hash,'#raeume');
  app.browser.go(-1);assert.equal(app.browser.hash,'#flur');
  app.browser.go(1);assert.equal(app.browser.hash,'#raeume');
  app.browser.go(1);assert.equal(app.browser.hash,'#ort/P02');
  assert.deepEqual(app.browser.entries.map(entry=>entry.hash),['#flur','#raeume','#ort/P02'],'no duplicated entries');
  assert.equal(app.target('#raeume'),'#raeume','after forward, the real origin is known again');
});

test('N04: Direktaufruf eines Raums: Rückweg Alle Räume, dann Flur, ohne die App zu verlassen',()=>{
  for(const room of ['#ort/P04','#atelier','#teezimmer','#ort/P05']){
    const app=start(room);
    assert.equal(app.target('#raeume'),'#raeume',room);
    app.back('#raeume');assert.equal(app.browser.hash,'#raeume');
    app.back('#flur');assert.equal(app.browser.hash,'#flur');
    assert.equal(app.browser.entries.length,1,room+': replaced, never pushed');
  }
});

test('N05: QR-Direktaufruf einer Karte: Karte, dann Kartengalerie, dann Flur',()=>{
  const app=start('#karte/O05/frage');
  assert.equal(app.target('#karten'),'#karten');
  app.back('#karten');assert.equal(app.browser.hash,'#karten');
  app.back('#flur');assert.equal(app.browser.hash,'#flur');
});

test('N06: Kartengalerie aus Teezimmer und Flur, Einzelkarte: Rückweg schrittweise über die tatsächliche Herkunft',()=>{
  const app=start('#flur');app.open('#teezimmer');app.open('#karten');app.open('#karte/O12');
  app.back('#karten');assert.equal(app.browser.hash,'#karten');
  app.back('#flur');assert.equal(app.browser.hash,'#teezimmer');
  app.back('#raeume');assert.equal(app.browser.hash,'#flur');
  assert.equal(app.browser.entries.length,4,'only history.back(), no extra pushes');
});

test('N06: Blättern in der Atelier-Galerie behält den Rückweg der Galerie',()=>{
  const app=start('#flur');app.open('#atelier');app.open('#atelier/tisch/O02');app.open('#atelier/tisch/O03');
  assert.equal(app.target('#raeume'),'#flur');
  app.back('#raeume');
  assert.equal(app.browser.hash,'#flur');assert.equal(app.browser.idx,0,'jumps over the gallery steps');
});

test('N07: Gezogene Karte aus Ankommen behält den Rückweg zum Anfang, auch nach dem Umdrehen',()=>{
  const app=start('#ankommen');app.open('#karte/verdeckt');
  assert.equal(app.nav.replace('#karte/O07'),true);
  assert.equal(app.browser.hash,'#karte/O07');
  const link=app.nav.backLink('#karten');
  assert.deepEqual([link.target,link.name],['#ankommen','Anfang']);
  app.back('#karten');assert.equal(app.browser.hash,'#ankommen');assert.equal(app.browser.entries.length,2);
});

test('N10: ungültige, externe und zyklische Herkunft führt zu einem sicheren internen Ziel',()=>{
  const forged=start('#flur');
  assert.equal(forged.nav.go('#musik',{origin:'https://evil.test',returnTo:'javascript:evil()'}),true);
  assert.equal(forged.target(),'#flur');
  assert.equal(forged.target('https://evil.test'),'#flur');
  assert.equal(forged.nav.go('https://evil.test'),false);
  const cycle=start('#flur');cycle.open('#ort/P01');cycle.open('#raeume');cycle.open('#ort/P01');
  assert.equal(cycle.target('#raeume'),'#flur','no ping-pong between P01 and all rooms');
});

test('N11: Nach einem Reload ist die echte Herkunft bekannt; keine Schleifen, keine ungewollten Pushes',()=>{
  const app=start('#flur');app.open('#ort/P02');
  const reloaded=boot(app.browser,app.store);
  assert.equal(reloaded.target('#raeume'),'#flur','origin restored from this tab, not the fallback');
  reloaded.back('#raeume');
  assert.equal(reloaded.browser.hash,'#flur');assert.equal(reloaded.browser.entries.length,2);
  reloaded.browser.go(1);assert.equal(reloaded.browser.hash,'#ort/P02');
  assert.equal(reloaded.target('#raeume'),'#flur');
});

test('N08: Musik-Stationen behalten ihre bisherigen Rückwege',()=>{
  const app=start('#flur');app.open('#musik');app.open('#musik/playlist');
  assert.equal(app.target('#musik'),'#musik');
  app.open('#musik/geschichten');assert.equal(app.target('#musik'),'#musik/playlist');
  const direct=start('#musik/geschichten/O03');assert.equal(direct.target('#musik'),'#musik');
  const library=start('#ort/P02');library.nav.go('#musik/geschichten/O03',{origin:'#ort/P02',returnTo:'#ort/P02'});
  assert.equal(library.target('#musik'),'#ort/P02');
});

test('Ersatzziele entsprechen der Matrix EMFD-NAV-01',()=>{
  const expected={'#raeume':'#flur','#ort/P01':'#raeume','#atelier':'#raeume','#teezimmer':'#raeume','#musik':'#flur',
    '#musik/playlist':'#musik','#musik/geschichten/O01':'#musik','#karten':'#flur','#karte/O01':'#karten','#karte/verdeckt':'#karten'};
  for(const [view,fallback] of Object.entries(expected))assert.equal(fallbackFor(view),fallback,view);
});

test('N12/N13: sichtbarer Zielname mit Pfeil, grammatisch passender zugänglicher Name',()=>{
  const cards=[{id:'O01',name:'Der freie Sessel'}];
  assert.deepEqual(describe('#ort/P02',cards),['Bibliothek','Zurück zur Bibliothek']);
  assert.deepEqual(describe('#teezimmer',cards),['Teezimmer','Zurück zum Teezimmer']);
  assert.deepEqual(describe('#raeume',cards),['Alle Räume','Zurück zur Übersicht aller Räume']);
  assert.deepEqual(describe('#karten',cards),['Kartengalerie','Zurück zur Kartengalerie']);
  assert.deepEqual(describe('#karte/O01',cards),['Der freie Sessel','Zurück zur Karte „Der freie Sessel“']);
  assert.deepEqual(describe('#musik/geschichten',cards),['Kompositionsgeschichten','Zurück zu den Kompositionsgeschichten']);
  const app=start('#flur');app.open('#ort/P03');
  const html=backLinkHTML(app.nav,'#raeume');
  assert.match(html,/^<a class="back emfd-back" href="#flur" data-emfd-back data-emfd-back-fallback="#raeume" aria-label="Zurück zum Flur">/);
  assert.match(html,/arrow-left\.svg" alt="" aria-hidden="true"/);
  assert.match(html,/<span class="emfd-back-name">Flur<\/span><\/a>$/);
  assert.doesNotMatch(html,/door-open/);
});

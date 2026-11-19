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
const vm=require('node:vm');
// Runs the shared feature registry like the browser does and records what a tap on a P08 action triggers.
function teaRoom(){
  const calls=[];let clickHandler=null;
  const context={CARDS:cards,location:{hash:'#teezimmer'},crypto:require('node:crypto').webcrypto,
    document:{addEventListener:(type,fn)=>{if(type==='click')clickHandler=fn;}},
    EMFDCardDraw:{begin:(id,target)=>calls.push(['begin',id,target])},
    EMFDAtelier:{rememberReturn:target=>calls.push(['return',target])},
    EMFDNavigation:{go:(href,options)=>calls.push(['go',href,options.origin])},
    dispatchEvent(){},HashChangeEvent:class{}};
  context.globalThis=context;
  vm.runInNewContext(read('feature-registry.js'),context);
  const tap=(featureId)=>{let prevented=false;clickHandler({target:{closest:selector=>selector==='[data-house-feature]'?{dataset:{houseFeature:featureId,featureRoom:'P08'}}:null},preventDefault:()=>{prevented=true;}});return prevented;};
  return {calls,tap,features:context.EMFDFeatures};
}

test('P08-01/02: Teezimmer is reachable from Flur and room directory',()=>{
  assert.match(app,/href="#teezimmer"><strong>Teezimmer/);
  assert.match(app,/room\.id==='P08'\?'#teezimmer'/);
  assert.match(app,/route==='teezimmer'\|\|route==='ort\/P08'/);
});

test('P08-03/04: all card actions reuse the shared 24-card model',()=>{
  assert.equal(cards.length,24);
  // v0.6.64 decision: exactly two tea-room actions, both resolved by the shared registry.
  assert.match(tea,/<a href="#karten" data-house-feature="cards" data-feature-room="P08" data-card-overview>Eine Karte aussuchen<\/a>/);
  assert.match(tea,/data-house-feature="daily" data-feature-room="P08" data-daily-card>Tageskarte ziehen<\/button>/);
  const {features}=teaRoom();
  assert.deepEqual(Array.from(features.roomFeatures.P08),['cards','daily']);
  for(let i=0;i<50;i++)assert.ok(cards.includes(features.randomCard()));
});

test('P08-05: random card is selected only after deliberate activation',()=>{
  const room=teaRoom();
  assert.deepEqual(room.calls,[],'loading the room draws nothing');
  assert.equal(room.tap('daily'),true);
  assert.equal(room.calls.filter(call=>call[0]==='begin').length,1,'one draw per deliberate tap');
  assert.doesNotMatch(tea,/render\(host\)[\s\S]*?location\.hash=`karte\/\$\{randomCard/);
});

test('P08-06: card detail returns to Teezimmer',()=>{
  const room=teaRoom();room.tap('daily');
  const begin=room.calls.find(call=>call[0]==='begin');
  assert.ok(cards.some(card=>card.id===begin[1]));
  assert.equal(begin[2],'#teezimmer');
  assert.deepEqual(room.calls.find(call=>call[0]==='return'),['return','#teezimmer']);
  room.tap('cards');
  assert.deepEqual(room.calls.at(-1),['go','#karten','#teezimmer']);
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
  assert.match(tea,/<button type="button" class="primary" data-house-feature="daily" data-feature-room="P08" data-daily-card>/);
  assert.match(tea,/aria-label="Hilfe zum Teezimmer"/);
  assert.match(tea,/alt="Ein warm beleuchtetes Teezimmer/);
});

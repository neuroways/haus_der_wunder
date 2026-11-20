// EMFD-LIGHT-01 · Hausweite LightEngine: Register, Zustand je physischer Quelle, Gruppen, Dauer, Ebenen, Integration in alle Räume.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const home=path.resolve(__dirname,'..');const read=n=>fs.readFileSync(path.join(home,n),'utf8');
globalThis.window=globalThis;require('../emfd-ui/js/emfd-ui-kit.js');const registry=require('../shared/registry.js');
const {create,ART}=require('../shared/lights.js');
const memory=(init={})=>{const m=new Map(Object.entries(init));return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),dump:()=>Object.fromEntries(m)};};
const engine=(store=memory(),reduced=false)=>create(store,{registry:()=>registry,reducedMotion:()=>reduced});

test('Zentrales Lichtregister: jede Licht-ID aller Szenen definiert, mit Art, Standard, Dauer, Ansichten und Ebenen-Slots',()=>{
 const used=new Set(registry.scenes?.()?.flatMap?.(s=>s.hotspots.map(h=>h.ziel?.licht).filter(Boolean))||require('../data/registry.js').szenen.flatMap(s=>s.hotspots.map(h=>h.ziel?.licht).filter(Boolean)));
 const ids=new Set(registry.lights().map(l=>l.id));
 for(const id of used)assert.ok(ids.has(id),id);
 for(const l of registry.lights()){
  assert.match(l.id,/^LIGHT-[A-Z0-9-]+$/);assert.ok(ART[l.art],l.id);assert.equal(typeof l.standard,'boolean');assert.ok(l.dauer>0);
  for(const v of Object.values(l.ansichten))assert.deepEqual(Object.keys(v.ebenen).sort(),['glow','reflection','source','spill']);
 }
 const deck=registry.light('LIGHT-H00-DECKENLATERNE');assert.deepEqual(Object.keys(deck.ansichten).sort(),['H00-C01','H00-C02'],'eine globale ID für beide Blickrichtungen');
 assert.equal(registry.light('LIGHT-KUE-FENSTERLATERNE').dauer,600,'Laterne 600 ms');assert.equal(registry.light('LIGHT-KUE-DECKENLEUCHTE').dauer,400,'elektrisch 400 ms');
 assert.equal(ART.kamin,1000);assert.equal(ART.kerze,600);
});

test('Zustand gehört zur Lichtquelle: unabhängig, perspektivübergreifend, dauerhaft gespeichert, Standard aus dem Register',()=>{
 const store=memory();let L=engine(store);
 assert.equal(L.get('LIGHT-KUE-DECKENLEUCHTE'),true,'Standard an');
 L.set('LIGHT-KUE-DECKENLEUCHTE',false);
 assert.equal(L.get('LIGHT-KUE-FENSTERLATERNE'),true,'andere Quelle bleibt');
 assert.deepEqual(L.sceneLights('KUE-C01').filter(id=>!L.get(id)),['LIGHT-KUE-DECKENLEUCHTE']);
 assert.deepEqual(L.sceneLights('KUE-C02').filter(id=>!L.get(id)),['LIGHT-KUE-DECKENLEUCHTE'],'gleicher Zustand in der Gegenansicht');
 L=engine(store);assert.equal(L.get('LIGHT-KUE-DECKENLEUCHTE'),false,'nach Neuladen erhalten');
 assert.deepEqual(JSON.parse(store.dump()['emfd.lights.v1']),{'LIGHT-KUE-DECKENLEUCHTE':false});
 const legacy=engine(memory({'emfd.house.light.v1':'off'}));assert.equal(legacy.get('LIGHT-H00-TISCHLAMPE'),false,'Flurlicht-Altwert wird übernommen');
});

test('Bedienung: Antippen, physischer Schalter, Gruppe, alle Lichter eines Raumes; Ereignisse nur bei Änderung',()=>{
 const L=engine();const seen=[];L.subscribe((id,on)=>seen.push(`${id}:${on}`));
 L.activate({typ:'LIGHT',ziel:{licht:'LIGHT-H00-TISCHLAMPE'}});assert.equal(L.get('LIGHT-H00-TISCHLAMPE'),false);
 L.activate({typ:'LIGHT_SWITCH',ziel:{lichter:['LIGHT-H00-TISCHLAMPE','LIGHT-H00-DECKENLATERNE']}});
 assert.equal(L.get('LIGHT-H00-DECKENLATERNE'),false,'Gruppe: eine an → alle aus');
 L.activate({typ:'LIGHT_SWITCH',ziel:{lichter:['LIGHT-H00-TISCHLAMPE','LIGHT-H00-DECKENLATERNE']}});
 assert.equal(L.get('LIGHT-H00-TISCHLAMPE'),true,'alle aus → alle an');
 L.setRoom('KUE',false);assert.ok(L.roomLights('KUE').every(id=>!L.get(id)));assert.equal(L.get('LIGHT-H00-TISCHLAMPE'),true,'andere Räume unberührt');
 L.activate({typ:'LIGHT_SWITCH',ziel:{raum:'KUE'}});assert.ok(L.roomLights('KUE').every(id=>L.get(id)));
 assert.equal(L.roomLights('KUE').length,4);assert.equal(L.activate({typ:'ORACLE_OBJECT',ziel:{objekt:'O10'}}),null);
 const n=seen.length;L.set('LIGHT-H00-TISCHLAMPE',true);assert.equal(seen.length,n,'kein Ereignis ohne Änderung');
});

test('Übergänge: Dauer je Quelle konfigurierbar; reduzierte Bewegung = unmittelbar',()=>{
 assert.equal(engine().duration('LIGHT-KUE-KOMMODENLATERNE'),600);assert.equal(engine().duration('LIGHT-H00-TISCHLAMPE'),400);
 assert.equal(engine(memory(),true).duration('LIGHT-KUE-KOMMODENLATERNE'),0);
 const css=read('emfd-scene.css');assert.match(css,/transition:opacity var\(--light-ms,400ms\) ease/);assert.match(css,/\.emfd-light-layer,\.emfd-light-ph,\.emfd-light-dim\{transition:none\}/);
});

test('Ebenen: Base/Ambient/Source/Spill/Glow/Reflection und An/Aus-Paar aus dem Register; ohne Medien gekennzeichnete Platzhalter',()=>{
 const S=require('../shared/scene.js');const L=engine();
 // Bestand ohne finale Medien: Platzhalter je Quelle + Raumabdunklung, keine Fehler
 const ph=S.lightLayers('KUE-C02',L);
 assert.equal((ph.match(/data-layer="source"/g)||[]).length,3);assert.equal((ph.match(/data-layer="spill"/g)||[]).length,3);
 assert.match(ph,/data-placeholder="lichtmaske"/);assert.match(ph,/data-light-dim="[^"]*LIGHT-KUE-DECKENLEUCHTE/);assert.match(ph,/--light-ms:600ms/);
 // Mit Medien (simuliertes Register): echte Vollbild-Ebenen statt Platzhalter; Base ersetzt den Master; Paar für Szenen ohne Ebenen
 const files={'L.src':'s.png','L.glow':'g.png','B':'base.png','A':'amb.png','OFF':'aus.png'};
 const fake={...registry,lightsForScene:id=>id==='X'?[{id:'LIGHT-X-A',dauer:400,ansichten:{X:{rect:{x:.1,y:.1,w:.1,h:.1},ebenen:{source:'L.src',spill:null,glow:'L.glow',reflection:null}}}},{id:'LIGHT-X-B',dauer:600,ansichten:{X:{rect:{x:.5,y:.5,w:.1,h:.1},ebenen:{}}}}]:[],
  lightScene:id=>id==='X'?{basis:'B',ambient:'A'}:id==='Y'?{paar:{an:'B',aus:'OFF',lichter:['LIGHT-Y-1']}}:null,
  resolveMedia:id=>files[id]?{type:'file',id,src:files[id],width:10,height:10}:{type:'placeholder',id}};
 const keep=globalThis.EMFDRegistry;globalThis.EMFDRegistry=fake;
 try{
  const x=S.lightLayers('X',{get:()=>true,duration:()=>400});
  assert.match(x,/emfd-light-layer--ambient/);assert.match(x,/emfd-light-layer--source" src="s.png"/);assert.match(x,/emfd-light-layer--glow/);
  assert.doesNotMatch(x,/emfd-light-ph/,'mit Base keine Platzhalter');assert.equal(S.lightPlan('X').base.src,'base.png');
  fake.lightsForScene=id=>id==='Y'?[{id:'LIGHT-Y-1',dauer:400,ansichten:{Y:{rect:{x:.1,y:.1,w:.1,h:.1},ebenen:{}}}}]:[];
  const y=S.lightLayers('Y',{get:()=>false,duration:()=>400});
  assert.match(y,/emfd-light-layer--pair is-off" src="aus.png"/,'alle aus → Aus-Bild');assert.doesNotMatch(y,/emfd-light-ph/);
 }finally{globalThis.EMFDRegistry=keep;}
});

test('Verbindlich in allen Räumen: Szenen zeichnen Licht nur über die Engine; Räume schalten über activate(); keine Ganzbild-Filter',()=>{
 for(const f of ['entrance.js','hall.js','kitchen.js']){const s=read(f);
  assert.match(s,/EMFDLights\?\.activate\?\.\(h(otspot)?\)/,f);assert.doesNotMatch(s,/scene\?\.setLight\(/,`${f}: kein eigenes Lichtrendering`);assert.doesNotMatch(s,/emfd:light-change/,f);}
 const sc=read('shared/scene.js');assert.match(sc,/lights\?\.subscribe\?\.\(\(id,on\)=>\{if\(!destroyed\)setLight\(id,on\);\}\)/);assert.match(sc,/unsubscribeLights\?\.\(\)/);
 assert.doesNotMatch(read('emfd-scene.css'),/filter:\s*brightness/,'kein Helligkeitsfilter auf dem ganzen Raumbild');
 assert.match(read('kitchen.js'),/EMFDScene\?\.lightLayers\?\.\('KUE-C02'\)/,'Nahansicht nutzt denselben Lichtstapel');
 assert.match(read('shared/scene-chrome.js'),/Alle Lichter im Raum (ausschalten|einschalten)/);
 assert.match(read('../tools/build-registry.mjs'),/fehlt im Lichtregister/,'Generator erzwingt den Standard');
});

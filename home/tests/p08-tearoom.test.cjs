// EMFD-P08-VIS-01 · Teezimmer als Szene: Register (Medien, Lichter, Hotspots, Wege), additive Lichtebenen, Nahansichten.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const home=path.resolve(__dirname,'..');const read=n=>fs.readFileSync(path.join(home,n),'utf8');
globalThis.window=globalThis;require('../emfd-ui/js/emfd-ui-kit.js');const registry=require('../shared/registry.js');
const zuordnung=JSON.parse(fs.readFileSync(path.join(home,'..','auftraege','EMFD-P08-VIS-01-Medienzuordnung.json'),'utf8'));

test('Szenenadressen: #raum/P08/… ist das Teezimmer als Szene, #teezimmer bleibt die bisherige Seite',()=>{
 assert.equal(registry.isSceneRoute('#raum/P08/C01'),true);assert.equal(registry.isSceneRoute('#raum/P08/C02'),true);
 assert.equal(registry.isSceneRoute('#teezimmer'),false);assert.equal(registry.room('P08').route,'#teezimmer');
 assert.match(read('app.js'),/r\?\.roomId==='P08'&&window\.EMFDTeaRoom/);
 const html=read('index.html');assert.ok(html.indexOf('kitchen.js')<html.indexOf('tea-room.js')&&html.indexOf('tea-room.js')<html.indexOf('app.js?v'));
});

test('Wege: Halle → C01 links; T03 zurück nach Herkunft (C01 → H00-C01 rechts, C02 → H00-C02 links); Wintergarten vorläufig',()=>{
 for(const id of ['H00-C01-TEEZIMMER','H00-C02-TEEZIMMER'])assert.deepEqual(registry.scene(id.slice(0,7)).hotspots.find(h=>h.id===id).ziel,{szene:'P08-C01',segment:'L',uebergang:'T03'});
 assert.deepEqual(registry.scene('P08-C01').hotspots.find(h=>h.id==='P08-C01-HALLENTUER').ziel,{szene:'H00-C01',segment:'R',uebergang:'T03'});
 assert.deepEqual(registry.scene('P08-C02').hotspots.find(h=>h.id==='P08-C02-HALLENTUER').ziel,{szene:'H00-C02',segment:'L',uebergang:'T03'});
 assert.equal(registry.scene('P08-C01').hotspots.find(h=>h.id==='P08-C01-WINTERGARTEN').ziel.szene,'P03-C01');
 assert.equal(registry.scene('P08-C01').gegenansicht,'P08-C02');
});

test('Zielbereiche aus Medienzuordnung.json (Rechteck um das Polygon), O04 nur in C02',()=>{
 const bb=poly=>{const xs=poly.map(p=>p[0]),ys=poly.map(p=>p[1]);return [Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)];};
 const map={'P08-C01':{T03:'HALLENTUER',O01:'WINTERGARTEN','P08-KARTENTISCH':'KARTENTISCH','MP-P08':'SPIELUHR'},'P08-C02':{T03:'HALLENTUER',O04:'O04','P08-KARTENTISCH':'KARTENTISCH','MP-P08':'SPIELUHR','P08-L-OFEN':'L-OFEN'}};
 for(const [sid,ids] of Object.entries(map))for(const t of zuordnung.scenes[sid].targets){
  const h=registry.scene(sid).hotspots.find(x=>x.id===`${sid}-${ids[t.id]}`);assert.ok(h,`${sid} ${t.id}`);const [x0,y0,x1,y1]=bb(t.polygon);
  assert.ok(Math.abs(h.rect.x-x0)<0.001&&Math.abs(h.rect.y-y0)<0.001&&Math.abs(h.rect.x+h.rect.w-x1)<0.002&&Math.abs(h.rect.y+h.rect.h-y1)<0.002,h.id);}
 assert.ok(!registry.scene('P08-C01').hotspots.some(h=>h.ziel?.objekt==='O04'));
});

test('Licht: Aus-Basis + additive Ein-Ebene je Lampe/Ofen; gleiche Quelle in beiden Ansichten = gleiche ID; Ofen 1000 ms',()=>{
 for(const sid of ['P08-C01','P08-C02']){
  const ls=registry.lightScene(sid);assert.equal(registry.resolveMedia(ls.basis).src,'../'+zuordnung.scenes[sid].webp.off);
  assert.equal(registry.resolveMedia(ls.auflagen[0]).src,'../'+zuordnung.scenes[sid].registeredDeck);
  for(const l of zuordnung.scenes[sid].lights){const id='LIGHT-'+l.id.replace('P08-L-','P08-');const def=registry.light(id);assert.ok(def,id);
   assert.equal(registry.resolveMedia(def.ansichten[sid].ebenen.licht).src,'../'+l.file);}
 }
 const shared=['DECKE','KARTENTISCH','SPIELUHRTISCH'].map(k=>registry.light('LIGHT-P08-'+k));
 for(const l of shared)assert.deepEqual(Object.keys(l.ansichten).sort(),['P08-C01','P08-C02']);
 assert.equal(registry.light('LIGHT-P08-OFEN').dauer,1000);assert.equal(registry.light('LIGHT-P08-OFEN').art,'kamin');
 const S=require('../shared/scene.js');const html=S.lightLayers('P08-C02',{get:()=>true,duration:()=>400});
 assert.equal((html.match(/emfd-light-layer--licht["\s]/g)||[]).length,7);assert.match(html,/emfd-light-layer--auflage/);assert.doesNotMatch(html,/emfd-light-ph/,'echte Ebenen statt Platzhalter');
 assert.match(read('emfd-scene.css'),/\.emfd-light-layer--licht\{mix-blend-mode:plus-lighter\}/,'additiv wie lighting.blend');
});

test('Nahansichten: Kartentisch zieht beim Öffnen nichts und startet keine Musik; Spieluhr spielt nur auf Tippen über die Geräte-Playlist',()=>{
 const src=read('tea-room.js');
 const table=src.slice(src.indexOf('function openCardTable'),src.indexOf('/* ---------- Spieluhr'));
 const beforeBind=table.slice(0,table.indexOf(',d=>{'));
 assert.doesNotMatch(beforeBind,/begin|playlist|select|play\(/,'Öffnen ohne Ziehen und ohne Musik');
 assert.match(table,/addEventListener\('click',\(\)=>\{\n\s*d\.close\(\);const card=root\.EMFDFeatures\?\.randomCard/,'Ziehen erst auf „Eine Karte ziehen“');
 assert.match(table,/EMFDCardDraw\?\.begin\?\.\(card\.id,back\)/,'vorhandene Kartenziehung');
 const box=src.slice(src.indexOf('function openMusicBox'));
 assert.match(box,/audio\(\)\?\.playlist\?\.\(ids,\{explicit:true,startId:ids\[0\],context:\{source:'device',deviceId:DEVICE,roomId:'P08'\}\}\)/);
 assert.deepEqual(registry.device('MP-P08').stuecke,['O24','O04','O06']);
 assert.equal(registry.teaRoom().spieluhr.medium,'device.MP-P08.nahansicht');
 assert.match(registry.resolveMedia('device.MP-P08.nahansicht').src,/Ruhe-offener-Deckel\.webp$/,'vorläufig statische Walzenansicht');
 assert.match(registry.resolveMedia('scene.P08-D01.kartenstapel').src,/P08-D01__Kartenstapel\.png$/);
});

test('Offline: Teezimmer-Medien sind im Register als ausgeliefert und kommen in die Offline-Liste',()=>{
 const list=require('../offline-policy.js').registerImages(require('../data/registry.js'));
 for(const f of ['P08-C01-dim-wide-scene','P08-C02__P08-L-OFEN__ein','P08-D01__1280x720','P08-Spieluhr__Ruhe-offener-Deckel'])assert.ok(list.house.some(x=>x.includes(f)),f);
});

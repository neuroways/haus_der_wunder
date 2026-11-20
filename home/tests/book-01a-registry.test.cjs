// EMFD-BOOK-01a · Register, Medienstatus, Routen und Aliase.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const home=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(home,name),'utf8');
const registry=require('../shared/registry.js');
const data=require('../data/registry.js');
const nav=require('../shared/navigation.js');
const devices=require('../shared/devices.js');

// Ansicht einer Adresse vor BOOK-01a (v0.6.69): [Ort, Station, Rückweg-Ziel ohne Herkunft, sichtbarer Name].
const LEGACY=[
 ['#flur','flur','hall','#flur','Halle'],['#haus','flur','hall','#flur','Halle'],['#raeume','raeume','raeume','#flur','Alle Räume'],
 ['#musik','musik','gramophone','#flur','Musikzimmer'],['#atelier','P04','atelier','#raeume','Atelier'],['#ort/P04','P04','atelier','#raeume','Atelier'],
 ['#teezimmer','P08','teezimmer','#raeume','Teezimmer'],['#ort/P08','P08','teezimmer','#raeume','Teezimmer'],
 ['#ort/P01','P01','ort/P01','#raeume','Fensterzimmer'],['#ort/P02','P02','library','#raeume','Bibliothek'],['#ort/P03','P03','ort/P03','#raeume','Wintergarten'],
 ['#ort/P05','P05','ort/P05','#raeume','Innenhof'],['#ort/P06','P06','ort/P06','#raeume','Galerie'],['#ort/P07','P07','ort/P07','#raeume','Dachterrasse'],
 ['#atelier/tisch/O03','P04','atelier','#raeume','Atelier'],['#ort/P05/geraet','P05','ort/P05','#ort/P05','Windspiel'],
 ['#atelier/geraet','P04','atelier','#atelier','Atelier-Spieluhr'],['#ort/P04/geraet','P04','atelier','#atelier','Atelier-Spieluhr'],
 ['#teezimmer/geraet','P08','teezimmer','#teezimmer','Teespieluhr'],['#ort/P08/geraet','P08','teezimmer','#teezimmer','Teespieluhr'],
 ['#karten',null,'cards','#flur','Kartengalerie'],['#karte/O07',null,'cards','#karten',null],['#musik/playlist',null,'records','#musik','Plattensammlung'],
 ['#musik/geschichten/O05',null,'compositions','#musik','Kompositionsgeschichten'],['#ankommen','ankommen','ankommen','#flur','Anfang']
];

test('Alias-Matrix: jede bisherige Adresse führt zur selben Ansicht wie vor BOOK-01a',()=>{
 for(const [hash,place,station,fallback,name] of LEGACY){
  assert.equal(nav.route(hash),hash,hash);
  assert.equal(nav.place(hash),place,`${hash} Ort`);
  assert.equal(nav.station(hash),station,`${hash} Station`);
  assert.equal(nav.fallbackFor(hash),fallback,`${hash} Ersatzziel`);
  if(name)assert.equal(nav.describe(hash)[0],name,`${hash} Name`);
  assert.equal(registry.redirect(hash),null,`${hash} wird nicht umgeleitet`);
  // EMFD-H00: Halle (#flur/#haus) und Eingang sind seit v0.6.73 Szenenansichten; Namen aus dem Register („Halle“).
 }
});

test('neue Adressen #raum/<RAUM>/<ANSICHT> und #geraet/<GERÄT> zeigen die bisherige Ansicht',()=>{
 const cases={'#raum/P05/C01':'#ort/P05','#raum/P04/C02':'#atelier',
  '#raum/M01/C01':'#musik','#geraet/MP-P04':'#atelier/geraet','#geraet/MP-P05':'#ort/P05/geraet'};
 for(const [hash,target] of Object.entries(cases)){
  assert.equal(registry.redirect(hash),target,hash);
  assert.equal(nav.route(hash),hash,`${hash} ist eine gültige Adresse`);
  assert.equal(nav.place(hash),nav.place(target),`${hash} Ort`);
 }
 assert.equal(registry.resolveRoute('#flur').canonical,'#raum/H00/C01');
 for(const hash of ['#raum/H00/C01','#raum/H00','#raum/H00/C02','#flur','#haus'])assert.equal(registry.isSceneRoute(hash),true,`${hash} ist Hallen-Szene`);
 assert.equal(registry.resolveRoute('#ort/P04/geraet').canonical,'#geraet/MP-P04');
 // Räume ohne bisherige Ansicht (Küche, Außenbereich …) und unbekannte IDs werden nicht umgeleitet.
 for(const hash of ['#raum/KUE/C01','#raum/EXT','#raum/XYZ/C01','#raum/H00/C09','#geraet/MP-XXX','#geraet/MP-KUE'])assert.equal(registry.redirect(hash),null,hash);
 assert.equal(nav.route('#raum/XYZ/C01'),null);
});

test('#flur und #raum/H00/C01 zeigen dieselbe Ansicht; die Umleitung ersetzt die Adresse ohne Verlaufseintrag',()=>{
 const app=read('app.js'),cardContext={window:{}};vm.runInNewContext(read('data.js'),cardContext);const cards=cardContext.window.CARDS;
 const render=hash=>{
  const main={innerHTML:'',focus(){},querySelector(){return null;},querySelectorAll(){return [];}};
  const dialog={addEventListener(){},setAttribute(){},showModal(){},close(){},focus(){},querySelector(){return null;},className:'',innerHTML:'',open:false};
  const document={body:{classList:{toggle(){},add(){},remove(){},contains(){return false;}},appendChild(node){return node;}},head:{append(){}},title:'',
   querySelector(sel){return sel==='main'?main:sel==='#motion-settings'?{textContent:''}:sel==='.skip'||sel==='#quiet'?{onclick:null}:null;},querySelectorAll(){return [];},createElement(){return Object.assign({},dialog);},addEventListener(){}};
  const location={hash},replaced=[],pushed=[];
  let navHash=hash;const navigation=nav.createNavigation({getHash:()=>navHash,setHash:value=>{pushed.push(value);navHash=value;},replaceHash:value=>{replaced.push(value);navHash=value;location.hash=value;}});
  const window={EMFDHall:{render:(m,o)=>{m.innerHTML=`<section class="emfd-scene-view" data-scene="${o.sceneId}"><h1>Die Halle</h1></section>`;},leave(){}},EMFDEntrance:{leave(){},isReturning(){return true;},render(){}},EMFDRegistry:registry,EMFDNavigation:{...navigation,backLinkMarkup:(fallback,className)=>nav.backLinkHTML(navigation,fallback,className)},matchMedia(){return {matches:false,addEventListener(){}};},addEventListener(){},scrollTo(){}};
  location.replace=value=>{replaced.push(value);location.hash=value;};
  vm.runInNewContext(app,{document,window,location,CARDS:cards,console,ResizeObserver:undefined},{filename:'app.js'});
  return {html:main.innerHTML,hash:location.hash,replaced,pushed};
 };
 // EMFD-H00: beide Adressen zeigen die Hallen-Szene H00-C01 (keine Umleitung nötig, kein Verlaufseintrag).
 const before=render('#flur'),after=render('#raum/H00/C01');
 assert.match(before.html,/data-scene="H00-C01"/);
 assert.equal(after.html,before.html);
 assert.equal(after.hash,'#raum/H00/C01');
 assert.deepEqual(after.replaced,[]);assert.deepEqual(after.pushed,[]);
 // Räume ohne Szene führen weiter auf ihre bisherige Seite (P03 ist seit EMFD-P03-DEV-01 eine Szene, siehe p03-wintergarten.test.cjs).
 const room=render('#raum/P05/C01');assert.match(room.html,/Innenhof/);assert.equal(room.hash,'#ort/P05');
});

test('Räume, Geräte und Namen stammen aus den Registern; keine festen Listen im App-Code',()=>{
 const app=read('app.js'),navigation=read('shared/navigation.js'),deviceCode=read('shared/devices.js'),features=read('feature-registry.js');
 for(const name of ['Fensterzimmer','Wintergarten','Dachterrasse','Fensterdose','Klangkästchen','Windharfe'])
  for(const [file,text] of [['app.js',app],['shared/navigation.js',navigation],['shared/devices.js',deviceCode],['feature-registry.js',features]])
   assert.doesNotMatch(text,new RegExp(name),`${name} steht fest in ${file}`);
 assert.doesNotMatch(app,/EMFD_ROOM_PROFILES|const ROOMS=\[/);
 assert.doesNotMatch(navigation,/ROOM_NAMES|P0\[1-8\]/);
 assert.doesNotMatch(deviceCode,/MP-P0\d|raumgeraete/);
 assert.doesNotMatch(features,/'#teezimmer'|`#ort\/\$\{id\}`\?/);
 // Inhalt kommt aus den gemeinsamen Registern: Raumname = rooms.json, Objektbeschreibung = music-devices.json.
 assert.equal(registry.room('P05').name,'Innenhof');
 assert.equal(registry.device('MP-P08').name,'Porzellanspieluhr');
 assert.equal(devices.get('MP-P08').name,'Teespieluhr');assert.equal(devices.get('MP-P08').objectName,'Porzellanspieluhr');
 assert.deepEqual(registry.directory().map(room=>room.id),['P01','P02','P03','P04','P05','P06','P07','P08']);
 // EMFD-P08-VIS-01: Das Teezimmer hat zusätzlich eine Szenenadresse; #teezimmer bleibt die bisherige Seite.
 assert.equal(registry.redirect('#raum/P08/C01'),null);assert.equal(registry.isSceneRoute('#raum/P08/C01'),true);assert.equal(registry.isSceneRoute('#teezimmer'),false);
 assert.deepEqual(devices.list().map(device=>device.id),['MP-P01','MP-P02','MP-P03','MP-P04','MP-P05','MP-P06','MP-P07','MP-P08']);
 assert.equal(registry.rooms().length,14);assert.equal(registry.scenes().length,28);
});

test('Medien-ID ohne Datei wird als Platzhalter mit ID und Seitenverhältnis gezeichnet',()=>{
 const media=registry.sceneMedia('P05-C01');
 assert.equal(media.type,'placeholder');assert.equal(media.id,'scene.P05-C01.kandidat');assert.equal(media.ratio,'16:9');
 const markup=registry.mediaMarkup('scene.P05-C01.kandidat',{alt:'Innenhof, Blick nach Norden'});
 assert.match(markup,/data-media-id="scene\.P05-C01\.kandidat"/);assert.match(markup,/aspect-ratio:1672\/941/);
 assert.match(markup,/role="img" aria-label="Innenhof, Blick nach Norden"/);assert.match(markup,/1672 × 941 · 16:9/);
 assert.doesNotMatch(markup,/<img/,'kein Ersatzbild');
 const unknown=registry.resolveMedia('scene.GIBTS-NICHT');assert.equal(unknown.type,'placeholder');assert.equal(unknown.ratio,'16:9');
 // Szenen ohne Kandidat nutzen das Format des Platzhaltereintrags.
 assert.equal(registry.sceneMedia('P01-C01').id,'scene.P01-C01.placeholder');
 assert.match(registry.placeholderMarkup('a"<b'),/a&quot;&lt;b/);
});

test('Austausch Platzhalter → Bild nur durch einen Registereintrag (kein Code)',()=>{
 const changed=JSON.parse(JSON.stringify(data));
 changed.medien['scene.P05-C01.kandidat']={...changed.medien['scene.P05-C01.kandidat'],datei:'../media/rooms/P05-C01.webp',verfuegbarkeit:'vorhanden',integration:'original'};
 const reg=registry.create(changed);
 const media=reg.sceneMedia('P05-C01');
 assert.equal(media.type,'file');assert.equal(media.src,'../media/rooms/P05-C01.webp');
 assert.match(reg.mediaMarkup(media.id,{alt:'Innenhof'}),/<img src="\.\.\/media\/rooms\/P05-C01\.webp" alt="Innenhof" width="1672" height="941"/);
});

test('Registerfehler: fehlende Datei oder ungültige IDs führen zum Rückfall statt zu einer Fehlerseite',()=>{
 const missing=registry.create(undefined);
 assert.equal(missing.source,'notfall');
 assert.equal(missing.isSceneRoute('#raum/H00/C01'),true);assert.equal(missing.isSceneRoute('#flur'),true);
 assert.equal(missing.room('P04').route,'#atelier');assert.equal(missing.directory().length,8);
 assert.equal(missing.resolveMedia('app.room.P01').type,'file');
 const broken=registry.create({raeume:[{id:'kaputt'},{id:'P01',name:'Fensterzimmer',route:'#ort/P01',aliase:[]}],szenen:[{id:'X',raumId:'NIX',ansicht:'C01'}],
  geraete:[{id:'MP-P01',raumId:'P01',route:'#ort/P01/geraet',aliase:[],stuecke:['O01','O99']},{id:'falsch',raumId:'P01'}],medien:{}});
 assert.equal(broken.source,'register');
 assert.deepEqual(broken.rooms().map(room=>room.id),['P01']);assert.equal(broken.scenes().length,0);
 assert.deepEqual(broken.devices().map(device=>device.id),['MP-P01']);assert.deepEqual([...broken.device('MP-P01').stuecke],['O01']);
 assert.equal(broken.warnings.length,3);
 assert.equal(broken.resolveMedia('app.room.P01').type,'placeholder','fehlende Datei → Platzhalter');
 assert.equal(registry.create('kein Register').source,'notfall');
});

test('Notfallbestand und Registerdatei sind aus derselben Quelle erzeugt',()=>{
 const fb=registry.FALLBACK;assert.ok(fb&&fb.quelle.notfall);
 assert.deepEqual(fb.raeume,data.raeume.filter(room=>room.route));
 assert.deepEqual(fb.geraete,data.geraete.filter(device=>device.route));
 for(const [id,entry] of Object.entries(fb.medien))assert.deepEqual(entry,data.medien[id],id);
 // App-Felder verweisen nur auf vorhandene Dateien unter ../media/.
 for(const [id,entry] of Object.entries(data.medien).filter(([,entry])=>entry.datei)){
  assert.match(entry.datei,/^\.\.\/media\//,id);
  assert.ok(fs.existsSync(path.resolve(home,entry.datei)),`${id}: ${entry.datei}`);
 }
});

test('Medienstatus ist nach D-13/W7 in getrennte Felder aufgeteilt',()=>{
 for(const [id,entry] of Object.entries(data.medien)){
  assert.match(entry.produktion,/^(PLACEHOLDER|DRAFT|REVIEW|APPROVED|INTEGRATED|VERIFIED)$/,id);
  assert.ok(['vorhanden','fehlt'].includes(entry.verfuegbarkeit),id);
  assert.ok(['original','platzhalter'].includes(entry.integration),id);
  assert.equal(entry.verfuegbarkeit==='vorhanden',Boolean(entry.datei),id);
 }
});

test('Registerdateien werden vor Geräten und Navigation geladen',()=>{
 const html=read('index.html');
 const at=name=>html.indexOf(name);
 assert.ok(at('data/registry.js')>0&&at('data/registry.js')<at('shared/registry.js'));
 assert.ok(at('shared/registry.js')<at('shared/devices.js'));
 assert.ok(at('shared/devices.js')<at('shared/navigation.js'));
 assert.ok(at('shared/registry.js')<at('feature-registry.js')&&at('feature-registry.js')<at('app.js?v'));
});

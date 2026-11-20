// EMFD-P03-DEV-01 · Wintergarten als Szene: Adressen, Wege (Teezimmer, Innenhof), O05/O13, Klangschale, Ausschnitte, Lichtstimmung,
// Pause beim Raumwechsel (D-16, ersetzt W1).
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const home=path.resolve(__dirname,'..');const read=n=>fs.readFileSync(path.join(home,n),'utf8');
globalThis.window=globalThis;require('../emfd-ui/js/emfd-ui-kit.js');const registry=require('../shared/registry.js');
const S=require('../shared/scene.js');
const cards=JSON.parse(read('data.js').replace(/^window\.CARDS=/,'').replace(/;\s*$/,''));

/** app.js mit Attrappen ausführen; liefert gerenderten Inhalt und die Aufrufe der Szenenmodule. */
function renderApp(hash){
  const main={innerHTML:'',focus(){},querySelector(){return null;},querySelectorAll(){return [];}};
  const dialog={addEventListener(){},setAttribute(){},showModal(){},close(){},focus(){},querySelector(){return null;},className:'',innerHTML:'',open:false};
  const document={body:{classList:{toggle(){},add(){},remove(){},contains(){return false;}},appendChild(node){return node;}},head:{append(){}},title:'',
    querySelector(sel){return sel==='main'?main:sel==='#motion-settings'?{textContent:''}:sel==='.skip'||sel==='#quiet'?{onclick:null}:null;},querySelectorAll(){return [];},createElement(){return Object.assign({},dialog);},addEventListener(){}};
  const calls=[];const stub=name=>({render:(m,o)=>{calls.push([name,o.sceneId]);m.innerHTML=`<section class="emfd-scene-view" data-scene="${o.sceneId}"></section>`;},leave(){calls.push([name,'leave']);},isReturning(){return true;}});
  const window={EMFDHall:stub('hall'),EMFDEntrance:stub('entrance'),EMFDKitchen:stub('kitchen'),EMFDTeaRoom:stub('tea'),EMFDWinterGarden:stub('winter'),EMFDRegistry:registry,
    matchMedia(){return {matches:false,addEventListener(){}};},addEventListener(){},scrollTo(){}};
  const location={hash,replace(v){location.hash=v;}};
  vm.runInNewContext(read('app.js'),{document,window,location,CARDS:cards,console,ResizeObserver:undefined,sessionStorage:{setItem(){}}},{filename:'app.js'});
  return {html:main.innerHTML,calls,hash:location.hash,title:document.title};
}

test('Adressen: #raum/P03/… ist die Szene; #ort/P03 und Raumverzeichnis führen in die Szene; Gerätestation bleibt',()=>{
  assert.equal(registry.room('P03').route,'#raum/P03/C01');assert.deepEqual([...registry.room('P03').aliase],['#ort/P03']);
  for(const h of ['#ort/P03','#raum/P03','#raum/P03/C01','#raum/P03/C02'])assert.equal(registry.isSceneRoute(h),true,h);
  assert.equal(registry.redirect('#geraet/MP-P03'),'#ort/P03/geraet');
  assert.ok(registry.directory().some(r=>r.id==='P03'&&r.route==='#raum/P03/C01'),'Kachel im Raumverzeichnis');
  const direct=renderApp('#ort/P03');assert.deepEqual(direct.calls.find(c=>c[0]==='winter'),['winter','P03-C01']);assert.match(direct.title,/^Der Wintergarten/);
  assert.deepEqual(renderApp('#raum/P03/C02').calls.find(c=>c[0]==='winter'),['winter','P03-C02']);
  const tea=renderApp('#raum/P08/C01');assert.ok(tea.calls.some(c=>c[0]==='winter'&&c[1]==='leave'),'andere Szenen verlassen den Wintergarten');
  const html=read('index.html');assert.ok(html.indexOf('tea-room.js')<html.indexOf('winter-garden.js')&&html.indexOf('winter-garden.js')<html.indexOf('app.js?v'));
});

test('Szenen: neue Illustrationen C01/C02 im Register, Gegenansichten, Hotspots an den Bildpositionen',()=>{
  for(const [sid,file] of [['P03-C01','P03-C01-p03-dev01-9d94bbc2.png'],['P03-C02','P03-C02-p03-dev01-e68c0cde.png']]){
    const m=registry.sceneMedia(sid);assert.equal(m.type,'file');assert.ok(m.src.endsWith(file),m.src);assert.equal(m.width,1672);assert.equal(m.height,941);
    assert.ok(fs.existsSync(path.join(home,m.src)),m.src);
  }
  assert.equal(registry.scene('P03-C01').gegenansicht,'P03-C02');assert.equal(registry.scene('P03-C02').gegenansicht,'P03-C01');
  const by=sid=>Object.fromEntries(registry.scene(sid).hotspots.map(h=>[h.id.slice(8),h]));
  const c1=by('P03-C01'),c2=by('P03-C02');
  assert.deepEqual(c1.O05.ziel,{objekt:'O05'});assert.deepEqual(c1.O13.ziel,{objekt:'O13'});assert.deepEqual(c2.O05.ziel,{objekt:'O05'});
  assert.ok(!registry.scene('P03-C02').hotspots.some(h=>h.ziel?.objekt==='O13'),'Wurzel nur in C01 sichtbar');
  for(const h of [c1.KLANGSCHALE,c2.KLANGSCHALE])assert.deepEqual(h.ziel,{geraet:'MP-P03'});
  // Anordnung laut Auftrag: C01 Blüte links, Wurzel Mitte, Schale rechts; C02 Schale links, Durchgang Mitte, Hof rechts.
  const cx=h=>h.rect.x+h.rect.w/2;
  assert.ok(cx(c1.O05)<cx(c1.HOF)&&cx(c1.HOF)<cx(c1.O13)&&cx(c1.O13)<cx(c1.KLANGSCHALE));
  assert.ok(cx(c2.KLANGSCHALE)<cx(c2.TEEZIMMER)&&cx(c2.TEEZIMMER)<cx(c2.HOF));
  for(const h of [...Object.values(c1),...Object.values(c2)])assert.ok(h.rect.x>=0&&h.rect.y>=0&&h.rect.x+h.rect.w<=1.0001&&h.rect.y+h.rect.h<=1.0001,h.id);
});

test('Wege: Teezimmer → C01 Mitte, Durchgang → Teezimmer C02 Mitte, Hoföffnung → Innenhof, Innenhof → C01 links (vorläufig)',()=>{
  assert.deepEqual(registry.scene('P08-C01').hotspots.find(h=>h.id==='P08-C01-WINTERGARTEN').ziel,{szene:'P03-C01',segment:'M',uebergang:'NAV-06'});
  const store=new Map();const prev={hash:globalThis.location,ss:globalThis.sessionStorage};
  globalThis.location={hash:''};globalThis.sessionStorage={setItem:(k,v)=>store.set(k,v),getItem:k=>store.get(k)??null};
  try{
    // Ziel der Teezimmer-Tür über dieselbe Zielauflösung wie tea-room.js (redirect, sonst Szenenadresse).
    const W=require('../winter-garden.js');
    assert.equal(W.routeFor({szene:'P03-C01'}),'#raum/P03/C01','Teezimmer führt jetzt in die Szene statt auf die bisherige Seite');
    W.act(registry.scene('P03-C02').hotspots.find(h=>h.id==='P03-C02-TEEZIMMER'));
    assert.equal(globalThis.location.hash,'raum/P08/C02');assert.deepEqual(JSON.parse(store.get('emfd.scene.view.v1')),{sceneId:'P08-C02',segment:'M'});
    W.act(registry.scene('P03-C01').hotspots.find(h=>h.id==='P03-C01-HOF'));
    assert.equal(globalThis.location.hash,'ort/P05','Innenhof hat noch keine Szene: bisherige Seite');
  }finally{globalThis.location=prev.hash;globalThis.sessionStorage=prev.ss;}
  const court=renderApp('#ort/P05');
  assert.match(court.html,/<a class="room-passage" href="#raum\/P03\/C01" data-room-passage="0">In den Wintergarten<\/a>/);
  assert.deepEqual(registry.room('P05').uebergaenge.map(u=>[u.szene,u.segment]),[['P03-C01','L']]);
});

test('O05/O13 öffnen die vorhandene Karte; Klangschale öffnet die Gerätestation, ohne etwas zu starten',()=>{
  const opened=[],went=[];const prev={c:globalThis.EMFDSceneChrome,n:globalThis.EMFDNavigation,a:globalThis.EMFDAudio,d:globalThis.EMFDDevices};
  globalThis.EMFDSceneChrome={openObject:(id,o)=>opened.push([id,o.focus])};globalThis.EMFDNavigation={go:(r,o)=>went.push([r,o.kind])};
  const audio=[];globalThis.EMFDAudio={playlist:(...a)=>audio.push(a),command:(...a)=>audio.push(a),select:(...a)=>audio.push(a)};
  globalThis.EMFDDevices={get:id=>({id,route:registry.device(id).route})};
  try{
    const W=require('../winter-garden.js');
    for(const id of ['P03-C01-O05','P03-C01-O13'])W.act(registry.scene('P03-C01').hotspots.find(h=>h.id===id));
    W.act(registry.scene('P03-C02').hotspots.find(h=>h.id==='P03-C02-KLANGSCHALE'));
    assert.deepEqual(opened,[['O05','karte'],['O13','karte']]);
    assert.deepEqual(went,[['#ort/P03/geraet','device']]);assert.deepEqual(audio,[],'Antippen startet keine Musik');
  }finally{Object.assign(globalThis,{EMFDSceneChrome:prev.c,EMFDNavigation:prev.n,EMFDAudio:prev.a,EMFDDevices:prev.d});}
  // Gegenstandspaneel → Karte → Begleiter (Mäppchen) und Gedankenblatt sind die gemeinsamen Wege (keine eigene Kartenmechanik).
  assert.match(read('shared/scene-chrome.js'),/go\(`#karte\/\$\{id\}`\)/);
  assert.doesNotMatch(read('winter-garden.js'),/CARDS|EMFDCardDraw|new Audio|\.play\(|playlist\(/);
  // Bestehende Musikzuordnung unverändert (Auftrag: erst prüfen, nicht ändern).
  assert.deepEqual([...registry.device('MP-P03').stuecke],['O21','O13','O10','O05']);
});

test('Ausschnitte: sechs Smartphone-Ausschnitte; L/R an den Rändern, M auf dem Schwerpunkt; jedes Ziel ist in einem Ausschnitt',()=>{
  const ids=[];
  for(const sid of ['P03-C01','P03-C02']){
    const a=registry.scene(sid).ausschnitte;ids.push(...['L','M','R'].map(k=>a[k].id));
    assert.equal(a.L.x,0);assert.ok(Math.abs(a.R.x+a.R.w-1)<1e-9);
    // iPhone 13 (390 × 664 Bildfläche): Bühne in voller Höhe.
    const H=664,W=H*1672/941,vw=390,max=W-vw,mid=S.midFocus(registry.scene(sid))*W-vw/2;
    const windowOf=seg=>{const left=S.scrollFor(seg,max,mid);return [left/W,(left+vw)/W];};
    for(const seg of ['L','M','R'])assert.equal(S.segmentFor(S.scrollFor(seg,max,mid),max,mid),seg,`${sid} ${seg} Rundweg`);
    // Auftragsziele (O05/O13 in C01, Klangschale, Durchgänge) liegen in einem Ausschnitt. Die Blüte in C02 ist eine zusätzliche
    // Fläche zwischen B2 und B3: per freiem Wischen und über „Alles in dieser Ansicht“ erreichbar.
    for(const h of registry.scene(sid).hotspots.filter(x=>x.id!=='P03-C02-O05')){const c=h.rect.x+h.rect.w/2;assert.ok(['L','M','R'].some(seg=>{const [l,r]=windowOf(seg);return c>=l&&c<=r;}),`${h.id} erreichbar`);}
    const focus={'P03-C01':'P03-C01-O13','P03-C02':'P03-C02-TEEZIMMER'}[sid];const h=registry.scene(sid).hotspots.find(x=>x.id===focus);const [l,r]=windowOf('M');
    assert.ok(h.rect.x>=l-0.001&&h.rect.x+h.rect.w<=r+0.001,`${focus} ganz im Ausschnitt M`);
  }
  assert.deepEqual(ids,['C01-A1','C01-A2','C01-A3','C02-B1','C02-B2','C02-B3']);
  // Ohne Registerangabe bleibt alles wie bisher (Mitte = halbe Scrollbreite).
  assert.equal(S.scrollFor('M',600),300);assert.equal(S.segmentFor(140,600),'L');assert.equal(S.segmentFor(460,600),'R');assert.equal(S.midFocus(registry.scene('P08-C01')),null);
});

test('Licht: Stimmungen Tag/Abend/Nacht vorbereitet, nur Abend aktiv; keine zusätzlichen Ebenen, keine Bewegung',()=>{
  for(const sid of ['P03-C01','P03-C02']){
    const mood=registry.lightMood(sid);
    assert.deepEqual([...mood.states],['tag','abend','nacht']);assert.equal(mood.active,'abend');assert.deepEqual([...mood.available],['abend']);
    assert.equal(registry.resolveMedia(mood.medium).src,registry.sceneMedia(sid).src,'Abendlicht = die Illustration');
    assert.equal(S.lightLayers(sid,{get:()=>true,duration:()=>400}),'','keine Platzhalter, keine Ebenen');
    assert.equal(registry.lightsForScene(sid).length,0);
  }
  assert.equal(registry.lightMood('P08-C01'),null);
});

test('D-16: Musik pausiert beim Raumwechsel, setzt nicht selbst fort; Karten und Rückkehr in denselben Raum pausieren nicht',async()=>{
  const Session=require('../audio-session.js');
  class El{constructor(){this.value='';this.dataset={};this.attrs={};this.classList={toggle(){},add(){}};this.open=false;this.textContent='';}setAttribute(k,v){this.attrs[k]=v;}getAttribute(k){return this.attrs[k];}addEventListener(){}append(){}before(){}focus(){}querySelector(){return null;}querySelectorAll(){return [];}showModal(){this.open=true;}close(){this.open=false;}replaceChildren(){}click(){this.onclick?.();}}
  class Audio extends EventTarget{constructor(){super();this.paused=true;this.plays=0;}load(){}removeAttribute(){}pause(){this.paused=true;}play(){this.paused=false;this.plays++;return Promise.resolve();}}
  const nodes=new Map(),handlers={};const node=k=>{if(!nodes.has(k))nodes.set(k,new El());return nodes.get(k);};
  const tracks=[{assetId:'O21',cardId:'O21',path:'../media/audio/O21.mp3',family:'O21',variant:'A',title:'Blätter'},{assetId:'O13',cardId:'O13',path:'../media/audio/O13.mp3',family:'O13',variant:'A',title:'Wurzel'}];
  const context={EMFDAudioSession:Session,Audio,navigator:{userAgent:'Desktop',platform:'',maxTouchPoints:0},location:{hash:'#raum/P03/C01'},localStorage:{getItem:()=>null,setItem(){}},
    document:{querySelector:node,querySelectorAll:()=>[],createElement:()=>new El(),createTextNode:x=>x,body:new El(),addEventListener(){}},
    window:{addEventListener:(k,fn)=>handlers[k]=fn,EMFDRegistry:registry},fetch:async url=>({ok:true,json:async()=>url.startsWith('music-manifest')?{tracks}:{cards:{O21:'O21',O13:'O13'}}})};
  vm.runInNewContext(read('music-player.js'),context);await new Promise(r=>setImmediate(r));
  const player=context.window.EMFDMusic;const go=h=>{context.location.hash=h;handlers.hashchange();};
  assert.equal(player.roomOfRoute('#ort/P03/geraet'),'P03');assert.equal(player.roomOfRoute('#karte/O05'),null);assert.equal(player.roomOfRoute('#flur'),'H00');
  player.startRoomPlaylist(['O21','O13'],{explicit:true,context:{source:'device',deviceId:'MP-P03',roomId:'P03'}});await Promise.resolve();
  assert.equal(player.session.state,'playing');const plays=player.session.audio.plays;
  go('#ort/P03/geraet');go('#raum/P03/C02');go('#karte/O05');go('#raum/P03/C01');
  assert.equal(player.session.state,'playing','Gerätestation, Umdrehen, Karte und Rückkehr: kein Raumwechsel');
  go('#raum/P08/C02');
  assert.equal(player.session.state,'paused','Raumwechsel pausiert');
  go('#raum/P03/C01');go('#flur');await Promise.resolve();
  assert.equal(player.session.state,'paused','kein automatisches Fortsetzen');assert.equal(player.session.audio.plays,plays);
  assert.doesNotMatch(read('music-player.js'),/W1: music continues/);
});

test('Offline: beide Wintergarten-Illustrationen kommen über das Register in die Offline-Liste',()=>{
  const list=require('../offline-policy.js').registerImages(require('../data/registry.js'));
  for(const f of ['P03-C01-p03-dev01-9d94bbc2.png','P03-C02-p03-dev01-e68c0cde.png'])assert.ok(list.house.some(x=>x.endsWith(f)),f);
});

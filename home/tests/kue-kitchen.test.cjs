// EMFD-KUE-DEV-01 · Küche (Szenen, Türen, Objekte, Lichter) und Radio-Modus MP-KUE auf dem gemeinsamen Player.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const home=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(home,name),'utf8');
const R=require('../shared/radio.js');
const registry=require('../shared/registry.js');
const nav=require('../shared/navigation.js');

// Simulierter gemeinsamer Player: eine Quelle, Kontext, Zustände wie EMFDAudio.
function fakeAudio({missing=[]}={}){
  let snap={state:'silent',track:null,entryId:'theme',context:null};const subs=new Set(),calls=[];let queue=[];
  const emit=()=>{for(const fn of [...subs])fn(snap);};
  const api={
    snapshot:()=>snap,availability:id=>missing.includes(id)?'missing':'available',
    playlist(ids,{context}={}){calls.push(['playlist',[...ids],context]);queue=ids.filter(id=>!missing.includes(id));if(!queue.length)return false;snap={state:'playing',track:{assetId:queue[0],cardId:queue[0],title:'T'+queue[0]},entryId:queue[0],context};emit();return true;},
    select(id){calls.push(['select',id]);snap={state:'playing',track:{assetId:id,cardId:id},entryId:id,context:null};emit();return true;},
    command(name){calls.push(['command',name]);if(name==='stop')snap={...snap,state:'silent'};if(name==='pause')snap={...snap,state:'paused'};if(name==='play')snap={...snap,state:'playing'};emit();return true;},
    subscribe(fn){subs.add(fn);fn(snap);return ()=>subs.delete(fn);},
    end(){snap={...snap,state:'ended'};emit();},
    next(){const i=queue.indexOf(snap.entryId);snap={...snap,state:'playing',track:{assetId:queue[i+1],cardId:queue[i+1]},entryId:queue[i+1]};emit();}
  };
  return {api,calls,queue:()=>queue};
}
function radio(opts){const a=fakeAudio(opts);const r=R.create({audio:()=>a.api,deviceId:'MP-KUE',roomId:'KUE',rand:(()=>{let x=7;return ()=>{x=(x*9301+49297)%233280;return x/233280;};})()});a.api.subscribe(s=>r.observe(s));return {r,a};}
const tick=()=>new Promise(res=>setTimeout(res,5));

test('Shuffle-Bag: alle 24 Kompositionen genau einmal, kein Hauptthema, an der Zyklusgrenze nie derselbe Titel',()=>{
 assert.deepEqual([...R.IDS],Array.from({length:24},(_,i)=>`O${String(i+1).padStart(2,'0')}`));
 let x=1;const rand=()=>{x=(x*16807)%2147483647;return x/2147483647;};
 for(let n=0;n<200;n++){const a=R.shuffleBag(R.IDS,{rand}),b=R.shuffleBag(R.IDS,{rand,avoid:a[23]});
  assert.equal(new Set(a).size,24);assert.ok(!a.includes('T03'));assert.notEqual(b[0],a[23]);}
});

test('Radio: Öffnen/Beobachten startet nichts; Einschalten startet genau eine Quelle mit Gerätekontext',()=>{
 const {r,a}=radio();
 assert.equal(r.view().state,'off');assert.equal(a.calls.length,0,'kein Autoplay');
 r.on();
 const pl=a.calls.filter(c=>c[0]==='playlist');assert.equal(pl.length,1);
 assert.equal(new Set(pl[0][1]).size,24);assert.deepEqual(pl[0][2],{source:'device',deviceId:'MP-KUE',roomId:'KUE',mode:'radio'});
 assert.equal(r.view().state,'playing');assert.equal(r.view().on,true);
});

test('Radio: fehlende Dateien werden ausgelassen; ohne verfügbare Musik keine Schleife und kein falscher An-Zustand',()=>{
 const {r,a}=radio({missing:['O05','O07','O09','O12','O15']});r.on();
 const bag=a.calls.find(c=>c[0]==='playlist')[1];assert.equal(bag.length,19);assert.ok(!bag.includes('O15'));
 const none=radio({missing:[...R.IDS]});none.r.on();
 assert.equal(none.r.view().state,'error');assert.equal(none.r.view().on,false);assert.equal(none.a.calls.filter(c=>c[0]==='playlist').length,0);
});

test('Radio: Ende der Folge → neue Folge (nur solange an); Titelende innerhalb der Folge übernimmt der Player',async()=>{
 const {r,a}=radio();r.on();
 for(let i=0;i<23;i++)a.api.next();
 const lastId=a.api.snapshot().entryId;a.api.end();await tick();
 const pls=a.calls.filter(c=>c[0]==='playlist');assert.equal(pls.length,2,'neue Folge nach dem letzten Titel');
 assert.notEqual(pls[1][1][0],lastId,'nicht sofort derselbe Titel');
 r.off();const before=a.calls.filter(c=>c[0]==='playlist').length;a.api.end();await tick();
 assert.equal(a.calls.filter(c=>c[0]==='playlist').length,before,'aus: kein Weiterspielen');
});

test('Radio: Aus und globaler Stopp beenden die Session ohne Rückfall aufs Hauptthema; Pause erhält Kontext, Ein setzt fort',()=>{
 const {r,a}=radio();r.on();r.off();
 assert.equal(r.view().state,'off');assert.ok(a.calls.some(c=>c[0]==='command'&&c[1]==='stop'));assert.ok(!a.calls.some(c=>c[0]==='select'),'kein Main Theme');
 const b=radio();b.r.on();b.a.api.command('pause');assert.equal(b.r.view().state,'paused');assert.equal(b.r.view().on,true);
 b.r.on();assert.equal(b.a.calls.filter(c=>c[0]==='playlist').length,1,'Fortsetzen statt neuer Folge');assert.equal(b.r.view().state,'playing');
 b.a.api.command('stop');assert.equal(b.r.view().state,'off','globaler Stopp schaltet das Radio aus');
});

test('Radio: eine andere bewusst gestartete Quelle schaltet das Radio aus (keine Überlagerung)',()=>{
 const {r,a}=radio();r.on();a.api.select('O03');
 assert.equal(r.view().state,'off');assert.equal(a.api.snapshot().context,null);
});

test('Küche als Szene: Eintritt KUE-C02 Mitte, Umdrehen KUE-C01, Tür T02 → H00-C01 links; Hoffenster/Nordwand kein Durchgang',()=>{
 assert.equal(registry.isSceneRoute('#raum/KUE/C02'),true);assert.equal(registry.isSceneRoute('#raum/KUE/C01'),true);
 assert.equal(registry.room('KUE').route,'#raum/KUE/C02');assert.equal(registry.scene('KUE-C02').gegenansicht,'KUE-C01');
 const kueche=registry.scene('H00-C01').hotspots.find(h=>h.id==='H00-C01-KUECHE');assert.deepEqual(kueche.ziel,{szene:'KUE-C02',segment:'M'});
 const door=registry.scene('KUE-C01').hotspots.find(h=>h.typ==='NAVIGATION');assert.deepEqual(door.ziel,{szene:'H00-C01',segment:'L',uebergang:'T02'});
 assert.equal([...registry.scene('KUE-C01').hotspots,...registry.scene('KUE-C02').hotspots].filter(h=>h.typ==='NAVIGATION').length,1,'nur T02');
 assert.deepEqual(nav.describe('#raum/KUE/C01'),['Küche','Zurück zur Küche']);
 assert.equal(nav.viewKey('#raum/KUE/C01'),nav.viewKey('#raum/KUE/C02'));
 const app=read('app.js');assert.match(app,/r\?\.roomId==='KUE'&&window\.EMFDKitchen/);
});

test('O10 und O24: je ein logisches Objekt, gemeinsames Paneel, kein Autoplay, Begleiter unverändert',()=>{
 const all=[...registry.scene('KUE-C01').hotspots,...registry.scene('KUE-C02').hotspots].filter(h=>h.typ==='ORACLE_OBJECT');
 assert.deepEqual([...new Set(all.map(h=>h.ziel.objekt))].sort(),['O10','O24']);
 const c01=registry.scene('KUE-C01').hotspots,c02=registry.scene('KUE-C02').hotspots,x=(s,o)=>s.find(h=>h.ziel.objekt===o).rect.x;
 assert.ok(x(c01,'O10')<.5&&x(c01,'O24')>.5,'C01: O10 links, O24 rechts');assert.ok(x(c02,'O24')<.5&&x(c02,'O10')>.5,'C02: O24 links, O10 rechts');
 const k=read('kitchen.js');assert.match(k,/chrome\(\)\?\.openObject\(z\.objekt/);assert.doesNotMatch(k,/companion|Begleiter.*set|EMFDCompanion/);
 const chrome=read('shared/scene-chrome.js');assert.match(chrome,/function openObject\(id,\{focus\}=\{\}\)/);
});

test('Lichter: einzeln schaltbar, gleiche Leuchte in beiden Ansichten gleiche ID, keine O08 in der Küche, Radio getrennt',()=>{
 const ids=s=>new Set(registry.scene(s).hotspots.filter(h=>h.ziel.licht).map(h=>h.ziel.licht));
 const shared=[...ids('KUE-C01')].filter(i=>ids('KUE-C02').has(i)).sort();
 assert.deepEqual(shared,['LIGHT-KUE-DECKENLEUCHTE','LIGHT-KUE-FENSTERLATERNE']);
 assert.ok(![...ids('KUE-C01'),...ids('KUE-C02')].some(i=>/O08/.test(i)));
 assert.ok(!registry.scene('KUE-C02').hotspots.find(h=>h.typ==='MUSIC_DEVICE').ziel.licht,'Radioleuchten ist Gerätezustand');
});

test('Texte und Radio-Bedienung: nur Ein/Aus, kein Shuffle-/Skip-/Titelwahl-Knopf; Hinweise freiwillig',()=>{
 const k=registry.kitchen();
 assert.equal(k.anzeigename,'Die Küche');
 assert.equal(k.radioHinweis.text,'Dieses Radio spielt seine ganz eigene Mischung aus den Melodien des Hauses. Du weißt nie, welches Stück dich als Nächstes erwartet.');
 assert.equal(k.raumimpuls.text,'Manchmal braucht es gar nicht viel. Eine Melodie, ein vertrauter Ort oder eine kleine Besonderheit mitten im Alltag.');
 const src=read('kitchen.js');
 assert.doesNotMatch(src,/Shuffle|Zufall an|Weiter|Nächstes Stück|data-music="next"/);
 assert.match(src,/'Radio einschalten'/);assert.match(src,/Radio ausschalten/);assert.match(src,/Rechter Drehknopf/);
 assert.match(src,/const first=!state\.radioHintSeen;if\(first\)\{state\.radioHintSeen=true;save\(\);\}/,'Radio-Hinweis einmalig');
 assert.doesNotMatch(src.slice(src.indexOf('function render('),src.indexOf('function mountChrome')),/showHint\(/,'keine automatische Begrüßung');
 assert.doesNotMatch(src,/\.play\(\)|new Audio\(|EMFDAudio\?\.select/,'keine eigene Audiowiedergabe');
});

test('Ladereihenfolge und Offline-Liste enthalten Radio und Küche',()=>{
 const html=read('index.html'),at=n=>html.indexOf(n);
 assert.ok(at('hall.js')<at('shared/radio.js')&&at('shared/radio.js')<at('kitchen.js')&&at('kitchen.js')<at('app.js?v'));
 const pre=read('offline-precache.js');for(const f of ['kitchen.js','shared/radio.js'])assert.ok(pre.includes(`"${f}`),f);
 const P=require('../offline-policy.js');const list=P.registerImages(require('../data/registry.js'));
 assert.ok(list.house.some(f=>/KUE-C02-kue-ref/.test(f)));
});

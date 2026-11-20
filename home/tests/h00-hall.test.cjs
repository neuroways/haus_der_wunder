// EMFD-H00 v0.3 (BOOK-01e) · Halle als Szene, Hinweise, Abschied, O08, Lichter, „Dein Moment“, globale Musik.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const home=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(home,name),'utf8');
const hall=require('../hall.js');
const registry=require('../shared/registry.js');
const nav=require('../shared/navigation.js');
const lights=require('../shared/lights.js');
const chrome=require('../shared/scene-chrome.js');

test('Halle ist Szene H00-C01/C02; #flur und #haus bleiben Aliase; Name „Halle“ aus dem Register',()=>{
 for(const hash of ['#flur','#haus','#raum/H00/C01','#raum/H00/C02'])assert.equal(registry.isSceneRoute(hash),true,hash);
 assert.equal(registry.resolveRoute('#flur').sceneId,'H00-C01','Eintritt = Nordblick zum Hof');
 assert.equal(nav.place('#raum/H00/C02'),'flur');assert.deepEqual(nav.describe('#flur'),['Halle','Zurück zur Halle']);
 assert.equal(nav.viewKey('#raum/H00/C02'),nav.viewKey('#flur'),'Umdrehen bleibt dieselbe Ansicht');
 assert.equal(registry.scene('H00-C01').gegenansicht,'H00-C02');
 assert.equal(registry.room('H00').musikgeraet,null,'kein lokales Musikgerät');
 for(const id of ['H00-C01','H00-C02']){const m=registry.sceneMedia(id);assert.equal(m.type,'file');assert.ok(fs.existsSync(path.resolve(home,m.src)));assert.equal(registry.media(m.id).freigabe,'test');}
});

test('Hallenhinweise: Begrüßung, Musik, Dein Moment – jeder genau einmal, Wortlaut aus dem Register',()=>{
 assert.equal(hall.nextHint({}),'welcome');
 assert.equal(hall.nextHint({welcome:true}),'music');
 assert.equal(hall.nextHint({welcome:true,music:true}),'moment');
 assert.equal(hall.nextHint({welcome:true,music:true,moment:true}),null);
 const t=Object.fromEntries(registry.hall().hinweise.map(h=>[h.id,h]));
 assert.equal(t.welcome.text,'Du bist angekommen. Hinter jeder Tür wartet eine kleine Welt darauf, entdeckt zu werden. Welchen Weg du nimmst, entscheidest du selbst.');
 assert.equal(t.welcome.aktion,'Das Haus entdecken');
 assert.equal(t.music.text,'Über das Musiksymbol kannst du jederzeit Musik hören oder die Stille genießen. In vielen Räumen findest du besondere Musikgeräte. Jedes hat seine eigene Klangwelt und lässt sich auf seine eigene Weise bedienen.');
 assert.equal(t.moment.text,'Über „Dein Moment“ findest du jederzeit Musik, Karten, Geschichten und weitere Möglichkeiten – auch ohne durch das Haus zu gehen.');
 assert.equal(t.farewell.text,'Schön, dass du mich besuchst. Meine Tür steht dir jederzeit offen.');
 assert.deepEqual(t.farewell.aktionen,['Nach draußen gehen','Noch ein wenig bleiben']);
 const src=read('hall.js');
 assert.match(src,/if\(!keep&&ORDER\.includes\(id\)\)\{state\.hints\[id\]=true;save\(\);\}/,'gezeigt = gesehen (kein erneutes Willkommen bei Wiederkehr)');
 const reset=src.slice(src.indexOf('function resetHints'),src.indexOf('/* ---------- Aktionen'));
 assert.doesNotMatch(reset,/farewell|localStorage\.removeItem|emfd\.(?!hall)/,'Reset nur der Hallenhinweise');
 assert.deepEqual(hall.normalize({hints:'x'}),{hints:{welcome:false,music:false,moment:false},farewellSeen:false});
});

test('Türen: Ziele aus dem Register; Küche ohne Ansicht erklärt; Haustür mit einmaligem Abschied nach EXT-C02',()=>{
 const c01=registry.scene('H00-C01'),c02=registry.scene('H00-C02');
 const target=(scene,id)=>scene.hotspots.find(h=>h.id===id).ziel.szene;
 assert.equal(target(c01,'H00-C01-KUECHE'),'KUE-C02');assert.equal(target(c01,'H00-C01-HOF'),'P05-C01');
 assert.equal(target(c01,'H00-C01-TEEZIMMER'),'P08-C01');assert.equal(target(c02,'H00-C02-TEEZIMMER'),'P08-C01','beide Seiten → derselbe Raum');
 assert.equal(target(c01,'H00-C01-TREPPE'),'P06-C01');assert.equal(target(c02,'H00-C02-TREPPE'),'P06-C01');
 assert.equal(target(c02,'H00-C02-HAUSTUER'),'EXT-C02','Haustür führt hinaus');
 assert.equal(registry.redirect('#raum/P05/C01'),'#ort/P05');assert.equal(registry.redirect('#raum/P08/C01'),'#teezimmer');assert.equal(registry.redirect('#raum/P06/C01'),'#ort/P06');
 assert.equal(registry.redirect('#raum/KUE/C02'),null,'Küche: noch keine Ansicht');
 const src=read('hall.js');
 assert.match(src,/if\(!target\)\{showHint\('kitchen'\);return;\}/,'keine Sackgasse, Erklärung');
 assert.match(src,/if\(!state\.farewellSeen\)\{state\.farewellSeen=true;save\(\);showHint\('farewell'\);\}else goOutside\(\);/);
 assert.match(src,/segment:'M'\}\)\);\}catch\{\}\n    location\.hash='raum\/EXT\/C02'/);
 const entrance=read('entrance.js');assert.match(entrance,/sceneId:ziel\.szene,segment:'M'/,'Eintritt in H00-C01 Mitte');
});

test('O08 „Die Laterne“: Licht und Entdecken getrennt; normale Lampen ohne Orakelfunktion; gleiche Lampe = gleicher Zustand',()=>{
 const c01=registry.scene('H00-C01'),c02=registry.scene('H00-C02');
 const o08=c02.hotspots.find(h=>h.typ==='ORACLE_OBJECT');
 assert.equal(o08.ziel.objekt,'O08');assert.equal(o08.ziel.licht,'LIGHT-H00-O08');assert.equal(o08.label,'Die Laterne');
 assert.equal(c01.hotspots.filter(h=>h.typ==='ORACLE_OBJECT').length,0,'O08 nicht in C01 dupliziert');
 for(const h of [...c01.hotspots,...c02.hotspots].filter(h=>h.typ==='LIGHT'))assert.equal(h.ziel.objekt,undefined,h.id);
 const ids=s=>new Set(s.hotspots.filter(h=>h.ziel.licht).map(h=>h.ziel.licht));
 const shared=[...ids(c01)].filter(id=>ids(c02).has(id)).sort();
 assert.deepEqual(shared,['LIGHT-H00-BODENLATERNE-TREPPE','LIGHT-H00-DECKENLATERNE']);
 const src=read('hall.js');
 assert.match(src,/'Licht ausschalten':'Licht einschalten'/);assert.match(src,/label:'Die Laterne entdecken'/);assert.match(src,/go\('#karte\/O08'\)/);
 assert.doesNotMatch(src,/EMFDAudio|select\?\.\(/,'kein Musikbeginn durch die Laterne');
 // Migration des bisherigen Flurlichts: nur gelesen, nicht überschrieben.
 const m=new Map([['emfd.house.light.v1','off']]),st={getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v)};
 const l=lights.create(st);assert.equal(l.get('LIGHT-H00-DECKENLATERNE'),false);assert.equal(l.get('LIGHT-EXT-WANDLATERNE'),true);
 l.set('LIGHT-H00-DECKENLATERNE',true);assert.equal(m.get('emfd.house.light.v1'),'off');
});

test('„Dein Moment“: sechs Ziele, vorhandene Module, kein Pfotensymbol, keine feste untere Leiste',()=>{
 assert.deepEqual(chrome.MOMENT.map(m=>m.label),['Karte ziehen','Musik hören','Geschichten','Begleiter','Gedankenblatt','Das Haus']);
 assert.deepEqual(chrome.MOMENT.map(m=>m.label),registry.hall().deinMoment.ziele);
 assert.ok(!chrome.MOMENT.some(m=>/paw|pfote/i.test(m.icon)));
 const src=read('shared/scene-chrome.js');
 assert.match(src,/EMFDCardDraw\?\.begin\?\.\(card\.id,hash\)/);assert.match(src,/EMFDFeatures\?\.activate\?\.\('stories'/);
 assert.match(src,/EMFDThoughtPaper\?\.open\?\.\(\{mode:'free'\}/);assert.match(src,/case 'house':go\('#raeume'\)/);
 assert.match(src,/Die Begleiterkarte wird gerade vorbereitet/,'Begleiter erklärt statt vorgetäuscht');
 assert.match(src,/hidden>`\+/,'standardmäßig geschlossen');
 assert.doesNotMatch(read('index.html'),/<nav class="global-nav/);
});

test('Globale Musik: Kopfzeile Musik links, Hilfe rechts; Öffnen spielt nichts; ohne Auswahl Hauptthema; eine Engine',()=>{
 const src=read('shared/scene-chrome.js');
 const open=src.slice(src.indexOf('function openMusic'),src.indexOf('function syncMusicButton'));
 const beforeBind=open.slice(0,open.indexOf(',d=>{'));
 assert.doesNotMatch(beforeBind,/select|command/,'Öffnen startet keine Musik');
 assert.match(open,/else playTheme\(\);/);
 assert.match(open,/command\?\.\('volume',0\)/,'Stumm ≠ Pause');
 assert.doesNotMatch(src,/new Audio\(|\.play\(\)/);
 const scene=read('shared/scene.js');
 assert.ok(scene.indexOf('data-scene-bar-left')<scene.indexOf('data-scene-label')&&scene.indexOf('data-scene-label')<scene.indexOf('data-scene-bar-extra'));
 assert.doesNotMatch(read('hall.js'),/EMFDStations|'gramophone'|EMFDMusicDevice/,'kein Grammophon/Gerät in der Halle');
});

test('Hilfe: Aktionsliste, „Interaktive Gegenstände anzeigen“, Einstellungen, Hallenhinweise erneut zeigen',()=>{
 const src=read('shared/scene-chrome.js');
 for(const label of ['Alles in dieser Ansicht','Interaktive Gegenstände anzeigen','Einstellungen'])assert.ok(src.includes(label),label);
 assert.match(read('hall.js'),/label:'Hinweise der Halle erneut zeigen',run:resetHints/);
 assert.match(read('emfd-ui/css/emfd-ui.css'),/\.emfd-scene-view\.show-hotspots \.emfd-hotspot\{/);
});

test('Ladereihenfolge und Offline-Liste enthalten Halle und Szenenoberfläche',()=>{
 const html=read('index.html'),at=n=>html.indexOf(n);
 assert.ok(at('shared/scene.js')<at('shared/scene-chrome.js')&&at('shared/scene-chrome.js')<at('entrance.js')&&at('entrance.js')<at('hall.js')&&at('hall.js')<at('app.js?v'));
 const pre=read('offline-precache.js');for(const f of ['hall.js','shared/scene-chrome.js'])assert.ok(pre.includes(`"${f}`),f);
 const P=require('../offline-policy.js');const list=P.registerImages(require('../data/registry.js'));
 assert.ok(list.house.some(f=>/H00-C01-h00-ref/.test(f))&&list.house.some(f=>/H00-C02-h00-ref/.test(f)));
});

test('Fix v0.6.74: „Platte verloren“-Hinweis erscheint in Szenen nicht dauerhaft und bleibt nach dem Schließen geschlossen',()=>{
 const player=read('music-player.js'),css=read('emfd-scene.css');
 assert.match(player,/contains\?\.\('scene-mode'\)\)\|\|feedbackDismissed===feedbackKey\(s\)/);
 assert.match(player,/feedbackClose\.onclick=\(\)=>\{feedback\.hidden=true;feedbackDismissed=feedbackKey\(session\);\};/);
 assert.doesNotMatch(css,/\.music-feedback\{[^}]*pointer-events:none/,'Knöpfe des Hinweises bleiben bedienbar');
});

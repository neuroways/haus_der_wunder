// EMFD-BOOK-01d / EMFD-UX-TUT-02 v0.2 + v0.3 · Eingang, freiwillige Einführung, Szenenkomponente, gemeinsame Bedienelemente.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const home=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(home,name),'utf8');
const entrance=require('../entrance.js');
const scene=require('../shared/scene.js');
const kit=require('../emfd-ui/js/emfd-ui-kit.js');
const registry=require('../shared/registry.js');
const lights=require('../shared/lights.js');
const nav=require('../shared/navigation.js');

const active=(seen=[],gardenVisited=false)=>({active:true,seen,gardenVisited});
const ctx=(sceneId,{segment='M',wide=false,visible=[]}={})=>({sceneId,segment,wide,visible:id=>visible.includes(id)?1:0});

test('Erst- und Folgebesuch sind rückwärtskompatibel; ein übersprungenes Tutorial ist kein gelesener Brief',()=>{
 const empty=entrance.normalize(null);
 assert.equal(entrance.isReturningFor(empty,{gift:false,tutorial:false,intro:false}),false,'neuer Besuch');
 assert.equal(entrance.isReturningFor(empty,{gift:true,tutorial:false,intro:true}),true,'alter Ablauf abgeschlossen (Brief + Einführung)');
 assert.equal(entrance.isReturningFor(empty,{gift:false,tutorial:true,intro:false}),true,'alte Einführung erledigt');
 assert.equal(entrance.isReturningFor(empty,{gift:true,tutorial:false,intro:false}),false,'nur Brief: Einstieg bleibt freiwillig sichtbar');
 assert.equal(entrance.isReturningFor({...empty,entered:true},{gift:false,tutorial:false,intro:false}),true,'neu: Haus betreten');
 const src=read('entrance.js');
 // Das Beenden/Überspringen setzt nur Tutorialwerte, nie den Geschenkstatus.
 const end=src.slice(src.indexOf('function endTutorial'),src.indexOf('function goEntrance'));
 assert.doesNotMatch(end,/LEGACY\.gift|gift-completed/);
 assert.match(read('start-gate.js'),/if\(start==='letter-visible'\)write\(KEYS\.gift\)/,'Brief gilt erst beim Lesen als geöffnet');
 // Unbekannte oder kaputte Speicherwerte führen zum leeren Zustand, nicht zu einem Fehler.
 assert.deepEqual(entrance.normalize({tutorial:'kaputt',welcomeDismissed:1}),{welcomeDismissed:true,entered:false,tutorial:{active:false,seen:[],gardenVisited:false}});
});

test('Die Einführung startet nie von selbst; ohne aktive Einführung gibt es keinen Hinweis',()=>{
 assert.equal(entrance.nextHint({active:false,seen:[],gardenVisited:false},ctx('EXT-C01')),null);
 assert.equal(entrance.nextHint(null,ctx('EXT-C01')),null);
 const src=read('entrance.js');
 assert.doesNotMatch(src,/startTutorial\(\)\s*;?\s*\}\s*\)\s*;?\s*$/m);
 assert.doesNotMatch(src,/\.play\(\)|new Audio\(|\.autoplay\s*=/,'kein eigener Audioweg');
});

test('Ablauf am Eingang: Umschauen, Randhinweis erst am Rand bzw. breit sofort, kein automatisches Drehen',()=>{
 assert.equal(entrance.nextHint(active(['welcome']),ctx('EXT-C01')),'look');
 assert.equal(entrance.nextHint(active(['welcome','look']),ctx('EXT-C01',{segment:'M'})),null,'Mitte: noch kein Umdrehen-Hinweis');
 assert.equal(entrance.nextHint(active(['welcome','look']),ctx('EXT-C01',{segment:'L'})),'turn');
 assert.equal(entrance.nextHint(active(['welcome','look']),ctx('EXT-C01',{segment:'R'})),'turn');
 assert.equal(entrance.nextHint(active(['welcome','look']),ctx('EXT-C01',{wide:true})),'turn');
 assert.doesNotMatch(read('shared/scene.js'),/onSegment[^;]*turn\(/,'Erreichen des Rands dreht nicht');
});

test('Garten: Prinzip, Brücke/Tor in beliebiger Reihenfolge nur wenn sichtbar, dann Weiteres, Hilfe, Zurück',()=>{
 const g=(seen,o={})=>entrance.nextHint(active(seen,true),ctx('EXT-C02',o));
 assert.equal(g([]),'garden');
 assert.equal(g(['garden']),'principle');
 assert.equal(g(['garden','principle'],{visible:[]}),null,'keine selbsttätige Bildfahrt');
 assert.equal(g(['garden','principle'],{visible:['EXT-C02-GARTENTOR']}),'gate');
 assert.equal(g(['garden','principle'],{visible:['EXT-C02-BRUECKE']}),'bridge');
 assert.equal(g(['garden','principle','gate'],{visible:['EXT-C02-BRUECKE']}),'bridge');
 assert.equal(g(['garden','principle','gate','bridge']),'more');
 assert.equal(g(['garden','principle','gate','bridge','more']),'help');
 assert.equal(g(['garden','principle','gate','bridge','more','help']),'return');
 assert.equal(g(['garden','principle','gate','bridge','more','help','return']),null);
});

test('Zurück am Haus: Licht, Brief, Glocke je nach Ausschnitt in beliebiger Reihenfolge, dann Eintreten',()=>{
 const h=(seen,o={})=>entrance.nextHint(active(seen,true),ctx('EXT-C01',o));
 assert.equal(h([],{visible:['EXT-C01-BRIEF']}),'letter');
 assert.equal(h([],{visible:['EXT-C01-GLOCKE','EXT-C01-BRIEF']}),'letter');
 assert.equal(h(['letter'],{visible:['EXT-C01-GLOCKE']}),'music');
 assert.equal(h([],{visible:['EXT-C01-WANDLATERNE']}),'light');
 assert.equal(h(['light'],{visible:[]}),null,'nicht sichtbare Gegenstände werden nicht erzwungen');
 assert.equal(h(['light','letter','music']),'enter');
 assert.equal(h(['light','letter','music','enter']),null,'kein Abschlussdialog');
});

test('Texte aus TUT-02 kommen wörtlich aus dem Register; Glocke mit den Texten der Bestandsergänzung',()=>{
 const t=Object.fromEntries(registry.tutorial().hinweise.map(h=>[h.id,h]));
 assert.equal(t.welcome.text,'Du darfst ankommen, ohne dich verändern zu müssen.');
 assert.equal(t.look.text,'Links und rechts neben der Tür gibt es einiges zu entdecken. Wische über das Bild oder nutze die Pfeile.');
 assert.equal(t.turn.text,'Auch hinter dir gibt es etwas zu entdecken.');
 assert.equal(t.principle.text,'Überall im Haus und im Garten begegnen dir kleine Wunder. Zu jedem dieser besonderen Gegenstände gehören eine Karte, ein eigenes Musikstück und weitere Entdeckungen.');
 assert.equal(t.enter.text,'Durch Türen und Durchgänge gelangst du an neue Orte. Jeder Raum hält seine eigenen kleinen Wunder für dich bereit. Und jetzt steht dir das Haus offen.');
 assert.equal(Object.keys(t).length,14);
 assert.equal(registry.bell().text,'Dieses Haus hat seine eigene Musik. Du kannst es mit Musik oder in Stille entdecken.');
 assert.deepEqual(registry.bell().aktionen,['Hauptthema abspielen','Mit Musik entdecken','In Stille entdecken','Meine Auswahl merken','Schließen']);
 const src=read('entrance.js');for(const label of ['Hauptthema abspielen','Mit Musik entdecken','In Stille entdecken','Meine Auswahl merken','Schließen'])assert.ok(src.includes(label),label);
});

test('Szenen, Hotspots und Medien kommen aus dem Register; Platzhalter statt erfundener Bilder',()=>{
 const c01=registry.scene('EXT-C01'),c02=registry.scene('EXT-C02');
 assert.deepEqual(c01.hotspots.map(h=>h.id).sort(),['EXT-C01-BODENLATERNE-L','EXT-C01-BODENLATERNE-R','EXT-C01-BRIEF','EXT-C01-GLOCKE','EXT-C01-TUER','EXT-C01-WANDLATERNE']);
 assert.deepEqual(c02.hotspots.map(h=>h.ziel.objekt).sort(),['O09','O15']);
 assert.equal(c01.gegenansicht,'EXT-C02');assert.equal(c02.gegenansicht,'EXT-C01');
 for(const h of [...c01.hotspots,...c02.hotspots])for(const k of ['x','y','w','h'])assert.ok(h.rect[k]>=0&&h.rect[k]<=1,`${h.id}.${k}`);
 assert.equal(c01.hotspots.find(h=>h.typ==='MUSIC_DEVICE').ziel.geraet,'MP-EXT');
 // Die Tür führt über die Szenenkonfiguration zu H00-C01; bis die Halle integriert ist, in den Flur.
 assert.equal(c01.hotspots.find(h=>h.id==='EXT-C01-TUER').ziel.szene,'H00-C01');
 // Seit EMFD-H00 ist die Halle selbst eine Szene: die Tür führt direkt nach #raum/H00/C01 (Konfiguration, kein Code).
 assert.equal(registry.isSceneRoute('#raum/H00/C01'),true);
 const media=registry.sceneMedia('EXT-C01');
 assert.equal(media.type,'file');assert.match(media.src,/^\.\.\/media\/rooms\/szenen\/EXT-C01-tut02-ref-[0-9a-f]{8}\.jpeg$/);
 assert.ok(fs.existsSync(path.resolve(home,media.src)));
 assert.equal(registry.media(media.id).freigabe,'test','Referenzbild nur als Testmedium');
 const broken=registry.create({...require('../data/registry.js'),medien:{}});
 assert.equal(broken.sceneMedia('EXT-C01').type,'placeholder','fehlendes Medium → Platzhalter, keine Blockade');
});

test('Neue Adressen #raum/EXT/C01 und /C02 sind Szenenansichten; alte Routen bleiben unverändert',()=>{
 assert.equal(registry.isSceneRoute('#raum/EXT/C01'),true);assert.equal(registry.isSceneRoute('#raum/EXT/C02'),true);
 assert.equal(registry.redirect('#raum/EXT/C02'),null);
 assert.equal(nav.place('#raum/EXT/C02'),'EXT');assert.equal(nav.describe('#raum/EXT/C01')[1],'Zurück zum Eingang');
 assert.equal(nav.viewKey('#raum/EXT/C02'),nav.viewKey('#raum/EXT/C01'),'Umdrehen bleibt eine Ansicht (ein Rückweg)');
 for(const route of ['#flur','#haus','#raeume','#ort/P05','#atelier','#teezimmer','#musik','#karte/O09','#ankommen'])assert.equal(nav.route(route),route);
 assert.equal(registry.isSceneRoute('#ort/P05'),false);
});

test('Szenenkomponente: Drehrichtung L→R, R→L, M→M; Ausschnitt aus der Scrollposition',()=>{
 assert.equal(scene.turnTarget('L'),'R');assert.equal(scene.turnTarget('R'),'L');assert.equal(scene.turnTarget('M'),'M');
 assert.equal(scene.segmentFor(0,1000),'L');assert.equal(scene.segmentFor(500,1000),'M');assert.equal(scene.segmentFor(1000,1000),'R');
 assert.equal(scene.segmentFor(0,0),'M','breit: keine Ausschnitte');
 assert.equal(scene.scrollFor('M',800),400);assert.deepEqual(scene.SEGMENTS,['L','M','R']);
 assert.ok(scene.WIDE_MIN>=768);
});

test('Lichter: Zustand je physischer Licht-ID, getrennt vom Flurlicht; Speicherfehler blockieren nicht',()=>{
 const values=new Map(),storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
 const a=lights.create(storage);assert.equal(a.get('LIGHT-EXT-WANDLATERNE'),true,'Standard an');
 assert.equal(a.toggle('LIGHT-EXT-WANDLATERNE'),false);
 assert.equal(lights.create(storage).get('LIGHT-EXT-WANDLATERNE'),false,'bleibt erhalten');
 assert.equal(values.has('emfd.house.light.v1'),false,'Flurlicht unberührt');
 const failing=lights.create({getItem(){throw Error('denied');},setItem(){throw Error('denied');}});
 assert.equal(failing.set('LIGHT-EXT-WANDLATERNE',false),false);assert.equal(failing.get('LIGHT-EXT-WANDLATERNE'),false,'Sitzungszustand ohne Speicher');
 assert.equal(a.set('kein licht',true),false);
});

test('Gemeinsame Bedienbibliothek: echte Buttons, Beschriftungen, 48-px-Flächen, eine Icon-Quelle',()=>{
 assert.match(kit.button({label:'Haus betreten',variant:'primary'}),/^<button type="button" class="emfd-button emfd-button--primary emfd-button--compact/);
 assert.throws(()=>kit.iconButton({iconName:'help'}),/Beschriftung/);
 const icon=kit.iconButton({label:'Licht',iconName:'light',pressed:false});
 assert.match(icon,/aria-label="Licht"/);assert.match(icon,/aria-pressed="false"/);
 const hs=kit.hotspot({id:'x',label:'Brief öffnen',rect:{x:.5,y:.25,w:.1,h:.2}});
 assert.match(hs,/^<button type="button" class="emfd-hotspot"/);assert.match(hs,/left:50\.000%;top:25\.000%;width:10\.000%;height:20\.000%/);
 const hint=kit.hint({id:'look',title:'Umschauen',text:'<b>x</b>',actions:[]});
 assert.match(hint,/data-hint-close aria-label="Hinweis schließen"/);assert.match(hint,/&lt;b&gt;x&lt;\/b&gt;/,'Text wird maskiert');
 assert.match(kit.dots({current:1}),/aria-current="true"/);
 const css=read('emfd-ui/css/emfd-ui.css');
 assert.match(css,/--emfd-ui-touch:48px/);assert.match(css,/\.emfd-hotspot::before\{[^}]*max\(100%,48px\)/);
 assert.match(css,/\.emfd-hint__close\{[^}]*inline-size:44px;block-size:44px/);
 assert.match(read('emfd-ui/js/emfd-ui.js'),/globalThis\.EMFDUIKit\?\.icons/,'ES-Modul nutzt dieselben Icons');
 assert.ok(fs.existsSync(path.join(home,'emfd-ui/referenz.html')),'UI-Referenzseite');
 for(const id of ['primary','iconButton','hotspot','hint','turnButton','dots'])assert.ok(read('emfd-ui/referenz.html').includes(id==='primary'?"variant:'primary'":`ui.${id}`),id);
});

test('Alte Starttour läuft nicht mehr automatisch; Hilfe-Einstiege und Geschenk-Verknüpfungen bleiben',()=>{
 const start=read('start-gate.js'),html=read('index.html');
 assert.doesNotMatch(start,/EMFDStartTour\?\.start\(/);
 assert.doesNotMatch(start,/pendingTutorial/);
 assert.match(html,/data-start02-tutorial-replay>Einführung erneut starten/);
 assert.match(html,/data-start-gift-open>Geschenkbrief und Geschenkkarte/);
 assert.match(html,/data-start02-install-help>Das Haus griffbereit/);
 assert.match(read('shared/help-dialog.js'),/start02-help-actions/,'Aktionen bleiben in jedem Hilfekontext sichtbar');
 // Installation nur manuell; „Später“ wird dauerhaft gespeichert.
 assert.doesNotMatch(start+read('entrance.js'),/showInstallHelp\(true\)/);
 assert.match(start,/const close=\(\)=>\{write\(KEYS\.install\)/);
});

test('Musik: Glocke nutzt die bestehende Musikentscheidung; Eintritt startet nichts',()=>{
 const src=read('entrance.js');
 assert.match(src,/EMFDMusicEntry\?\.apply\?\.\(value,\{remember\}\)/);
 assert.match(src,/chrome\(\)\.playTheme\(\)/,'Hauptthema über die zentrale Engine');assert.match(read('shared/scene-chrome.js'),/EMFDMusic\?\.setBackgroundPreference\?\.\('on',\{start:true,explicit:true\}\)/);
 const enter=src.slice(src.indexOf('function enterHouse'),src.indexOf('/* ---------- Paneele'));
 assert.match(enter,/setBackgroundPreference\?\.\(pref\.value,\{start:false\}\)/);
 assert.doesNotMatch(enter,/start:true|select\?\.\(/,'kein Autoplay beim Betreten');
 // EMFDMusicEntry.apply: speichert nur auf Wunsch, startet nur bei „mit Musik“.
 const calls=[],local=new Map(),session=new Map();
 const st=m=>({getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)});
 const el=()=>({dataset:{},addEventListener(){},querySelector(){return {addEventListener(){},checked:false,textContent:'',hidden:false,disabled:false,focus(){}};},querySelectorAll(){return [];},append(){},setAttribute(){},showModal(){},close(){}});
 const root={localStorage:st(local),sessionStorage:st(session),document:{createElement:el,body:{append(){}},querySelector:()=>null},window:{EMFDMusic:{setBackgroundPreference:(...a)=>calls.push(a)},addEventListener(){}}};
 vm.runInNewContext(read('music-entry.js'),root);
 const api=root.window.EMFDMusicEntry;
 api.apply('off',{remember:false});assert.equal(local.get('emfd.music.entryPreference'),undefined);assert.equal(session.get('emfd.music.entryPreference.session'),'off');
 api.apply('on',{remember:true});assert.equal(local.get('emfd.music.entryPreference'),'on');
 assert.deepEqual(calls.map(c=>[c[0],c[1].start]),[['off',false],['on',true]]);
});

test('Offline: Eingangsbilder gehören zur ersten Stufe; Liste und Register sind aktuell',()=>{
 const P=require('../offline-policy.js');const list=P.registerImages(require('../data/registry.js'));
 assert.ok(list.start.some(f=>/EXT-C01-tut02-ref/.test(f))&&list.start.some(f=>/EXT-C02-tut02-ref/.test(f)));
 const pre=read('offline-precache.js');for(const f of ['entrance.js','shared/scene.js','shared/lights.js','emfd-ui/js/emfd-ui-kit.js'])assert.ok(pre.includes(`"${f}`),f);
});

// EMFD-MAEPPCHEN-01 · Mäppchen der Begleiterkarte: Zustand, Sicherung, Zuordnung über die Karten-ID, Falter-Anker, Einstiege, Medien.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const home=path.resolve(__dirname,'..');const read=n=>fs.readFileSync(path.join(home,n),'utf8');
globalThis.window=globalThis;require('../data.js');require('../shared/registry.js');require('../emfd-ui/js/emfd-ui-kit.js');
const M=require('../maeppchen.js');

test('Begleitung: genau eine aktive Karte ohne Ablaufdatum; derselben Karte erneut mitgenommen → frischer Entwurf',()=>{
 let s=M.take({version:1,active:null},'O08',new Date('2026-11-20T10:00:00Z'));
 assert.equal(s.active.cardId,'O08');assert.equal(s.active.draft,'');assert.ok(!('expires' in s.active)&&!('until' in s.active));
 s=M.withDraft(s,'Ein Gedanke');assert.equal(s.active.draft,'Ein Gedanke');
 const again=M.take(s,'O08');assert.equal(again.active.draft,'');assert.notEqual(again.active.instanceId,s.active.instanceId);
 assert.deepEqual(M.giveBack(),{version:1,active:null});
 assert.throws(()=>M.take(s,'O25'));assert.throws(()=>M.take(s,'T03'));
 assert.equal(M.normalize({active:{cardId:'X',instanceId:'a'}}).active,null,'ungültige Daten verwerfen');
});

test('Mäppchen-Sicherung: aktive Karte und editierbarer Entwurf; Import prüft das Schema',()=>{
 const s=M.withDraft(M.take({active:null},'O08'),'Klarer werden darf …\nZweite Zeile');
 const b=JSON.parse(JSON.stringify(M.backupOf(s)));
 assert.equal(b.schema,'emfd.maeppchen.backup/1');assert.equal(b.cardId,'O08');assert.equal(b.cardName,'Die Laterne');assert.equal(b.draft,'Klarer werden darf …\nZweite Zeile');
 const back=M.fromBackup(b);assert.equal(back.active.cardId,'O08');assert.equal(back.active.draft,b.draft);assert.equal(back.active.instanceId,b.instanceId);
 assert.throws(()=>M.fromBackup({schema:'x',cardId:'O08'}),/keine Mäppchen-Sicherung/);
 assert.throws(()=>M.fromBackup({...b,cardId:'O99'}));
});

test('Inhalte über die aktive Karten-ID (generisch für alle 24 Karten): Originalimpuls und Originalfrage',()=>{
 for(const c of globalThis.CARDS){const x=M.contentFor(c.id);assert.equal(x.impulse,c.impulse);assert.equal(x.question,c.question);assert.equal(x.story,c.houseStory);assert.ok(x.image,c.id);}
 const o08=M.contentFor('O08');assert.equal(o08.name,'Die Laterne');assert.equal(o08.question,'Was müsste gerade klarer werden – und was darf noch offenbleiben?');
});

test('Medien: alle 26 Mäppchen-Grafiken über Register-IDs, unverändert abgelegt, offline aufgenommen; keine Medienpfade im Code',()=>{
 const reg=globalThis.EMFDRegistry;
 assert.equal(M.ASSET_IDS.length,26);
 for(const nr of M.ASSET_IDS){const m=reg.resolveMedia(`maeppchen.${nr}`);assert.equal(m.type,'file',nr);assert.ok(fs.existsSync(path.join(home,m.src)),m.src);}
 assert.deepEqual(reg.media('maeppchen.15').anker,{landepunkt:[0.5,0.58]});
 const list=require('../offline-policy.js').registerImages(require('../data/registry.js'));
 assert.equal(list.house.filter(f=>/maeppchen\//.test(f)).length,26);
 const src=read('maeppchen.js');assert.doesNotMatch(src,/\.\.\/media\/|maeppchen\/[\w/-]+\.png/,'keine Mediendateipfade im Modul');
 assert.equal(M.missingFor('O08').filter(m=>/^maeppchen\./.test(m.id)).length,0);
});

test('Falter: Papier- und Käferteile über den gemeinsamen Flügelansatz ausgerichtet (Assetregister-Anker)',()=>{
 const g=M.falterGeometry();
 const at=(p,a)=>[p.left+a[0]*p.width,p.top+a[1]*p.height];
 const root=at(g.paperBody,[0.5,0.4]);
 for(const [p,a] of [[g.paperLeft,[0.94,0.48]],[g.paperRight,[0.06,0.48]],[g.liveBody,[0.5,0.43]],[g.liveLeft,[0.94,0.5]],[g.liveRight,[0.06,0.5]]]){
  const q=at(p,a);assert.ok(Math.abs(q[0]-root[0])<0.01&&Math.abs(q[1]-root[1])<0.01,JSON.stringify(q));}
 assert.deepEqual(g.glow,[0.5,0.78]);
 assert.equal(g.liveLeft.ox,94,'Drehpunkt am körperseitigen Ende');assert.equal(g.liveRight.ox,6);
});

test('Ablauf: Falter erst matt auf der Hand, Licht erst beim weiteren Tipp, Lied beim Abheben über den bestehenden Player; Pause → Landung',()=>{
 const src=read('maeppchen.js');
 const f=src.slice(src.indexOf('async function onFalter'),src.indexOf('async function land'));
 assert.ok(f.indexOf("setFalter('hand')")<f.indexOf("setFalter('lit')"));
 assert.ok(f.indexOf("setFalter('flying')")<f.indexOf("audio()?.select?.(id,{play:true,explicit:true})"),'Lied erst beim Abheben');
 assert.ok(f.indexOf("audio()?.select")<f.indexOf("is-covered"),'Cover nach dem Liedstart');
 assert.match(f,/audio\(\)\?\.command\?\.\('pause'\);await land\(\)/);
 assert.match(src,/if\(s\.state==='paused'\|\|s\.state==='stopped'/,'auch globale Pause lässt landen');
 assert.doesNotMatch(src,/new Audio\(|\.play\(\)/,'kein eigener Player');
});

test('Einstiege: „Mitnehmen“ im Karten-Dock, „Dein Moment“ → Begleiter, fester Begleiter-Knopf außerhalb der Szenen; Ziehen bleibt frei',()=>{
 assert.match(M.dockButton('O08'),/data-maeppchen-take="O08"[^>]*>.*Mitnehmen/);
 assert.equal(M.dockButton('T03'),'');
 assert.match(read('app.js'),/window\.EMFDMaeppchen\?\.dockButton\?\.\(c\.id\)/);
 const chrome=read('shared/scene-chrome.js');assert.match(chrome,/case 'companion':\{[\s\S]*EMFDMaeppchen\?\.openFromNavigation\?\.\(trigger\)/);
 const src=read('maeppchen.js');assert.match(src,/function mountFab\(\)/);assert.match(read('maeppchen.css'),/body\.scene-mode \.maeppchen-fab\{display:none\}/);
 assert.doesNotMatch(read('card-draw.js')+read('feature-registry.js'),/EMFDMaeppchen/,'Ziehen wird nicht gesperrt');
 assert.match(src,/function requestTake[\s\S]*swapDialog\(id,source\)/,'andere Karte: erst fragen');
 const html=read('index.html');assert.ok(html.indexOf('maeppchen.js')<html.indexOf('app.js?v'));
});

test('Zurücklegen: freiwilliger Export bei Text, erst Bestätigung löscht Begleitung und Entwurf; Schließen ändert die Adresse nicht',()=>{
 const src=read('maeppchen.js');
 const gb=src.slice(src.indexOf("case 'giveback':"),src.indexOf("    }\n    return '';"));
 assert.match(gb,/has\?`<div class="mp-panel__list">.*data-mp-export.*thought.*backup/s);
 assert.match(src,/if\(t\.matches\('\[data-mp-giveback\]'\)\)\{[\s\S]*giveBackNow\(\)/);
 const close=src.slice(src.indexOf('  function close(){'),src.indexOf('/* ---------- Lesen'));
 assert.doesNotMatch(close,/location\.hash|EMFDNavigation/,'Rückkehr an dieselbe Stelle');
 assert.match(src,/folderSupported=\(\)=>typeof root\.showDirectoryPicker==='function'/);
});

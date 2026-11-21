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
 assert.equal(list.house.filter(f=>/maeppchen\/(?!gluehwuermchen-v0\.2)/.test(f)).length,26);
 for(const id of M.FF_IDS){const m=reg.resolveMedia(id);assert.equal(m.type,'file',id);assert.ok(fs.existsSync(path.join(home,m.src)),m.src);assert.ok(list.house.some(f=>f.endsWith(m.src.split('/').pop())),id+' offline');}
 const src=read('maeppchen.js');assert.doesNotMatch(src,/\.\.\/media\/|maeppchen\/[\w/-]+\.png/,'keine Mediendateipfade im Modul');
 assert.equal(M.missingFor('O08').filter(m=>/^maeppchen\./.test(m.id)).length,0);
});

test('Glühwürmchen v0.2: Flügel-Drehpunkt auf dem Ansatzpunkt des Körpers, Sitzpose auf der oberen Coverkante (CARD-MUSIC-01), Papier auf der Handfläche',()=>{
 const reg=globalThis.EMFDRegistry;const anchor=id=>reg.media(id).anker;
 assert.deepEqual(anchor('gluehwuermchen.flugkoerper'),{leftWing:[0.33,0.60],rightWing:[0.69,0.61]});
 const g=M.flyerGeometry();
 for(const [w,key,pv] of [[g.left,'leftWing',[0.97,0.81]],[g.right,'rightWing',[0.03,0.81]]]){
  const x=(w.left+pv[0]*w.width)/100,y=(w.top+pv[1]*w.height)/100;const a=anchor('gluehwuermchen.flugkoerper')[key];
  assert.ok(Math.abs(x-a[0])<0.002&&Math.abs(y-a[1])<0.002,key);assert.equal(+w.ox.toFixed(1),pv[0]*100);}
 const cover={x:20,y:100,w:360,h:360};const p=M.perchGeometry(cover);
 assert.ok(Math.abs(p.x+0.49*p.w-(cover.x+cover.w*0.82))<1e-6&&Math.abs(p.y+0.86*p.h-(cover.y+cover.h*0.012))<1e-6,'cardEdge auf der oberen Rahmenkante nahe der rechten Ecke');
 assert.ok(Math.abs(p.glow.y-(p.y+0.75*p.h))<1e-6,'Leuchtbauch');
 const hand={x:0,y:400,w:240,h:330};const q=M.paperGeometry(hand);
 assert.ok(Math.abs(q.x+0.52*q.w-(hand.x+hand.w*0.5))<1e-6&&Math.abs(q.y+0.91*q.h-(hand.y+hand.h*0.58))<1e-6,'palm auf dem Landepunkt der Hand');
});

test('Hörmoment (CARD-MUSIC-01): Papier → Flug → Landung auf dem Coverrand, Karte wird Originalcover; Musik nur nach bewusstem Tippen',()=>{
 const src=read('maeppchen.js'),css=read('maeppchen.css');
 const f=src.slice(src.indexOf('async function onPaper'),src.indexOf('let songTimer'));
 assert.doesNotMatch(f,/startSong|select\?\.\(|command\?\.\('play'\)/,'Landung und Bildwechsel sind kein Play-Trigger');
 assert.ok(f.indexOf('showCover(true)')<f.indexOf('await landing'),'Cover steht bei der Landung');
 assert.match(f,/if\(reduced\(\)\|\|[\s\S]{0,120}?\{\s*\/\/[^\n]*\n\s*showCover\(true\);setFF\('perched'\)/,'reduzierte Bewegung: direkt in den Zielzustand');
 assert.match(src,/function flyFrom[\s\S]*?iterations:beats/);assert.doesNotMatch(src,/iterations:\s*Infinity/,'Flügel nur im kurzen Flug');
 // Einzige Endlosanimation: ruhiger Gold-Schein des Covers nur während der Wiedergabe, bei reduzierter Bewegung aus.
 assert.deepEqual(css.match(/[^\n]*infinite[^\n]*/g),['.mp-pane--listen.is-playing .mp-listen__cover{animation:mp-cover-glow 7s ease-in-out infinite}']);
 assert.match(css,/@keyframes mp-cover-glow\{0%,100%\{box-shadow:[^}]*\}50%\{box-shadow:[^}]*\}\}/,'nur Licht, keine Skalierung');
 assert.match(css,/\.mp-pane--listen\.is-playing \.mp-listen__cover\{animation:none\}/);
 assert.match(css,/\.mp-listen__cover img\{[^}]*aspect-ratio:1;object-fit:contain/,'quadratisch, nicht verzerrt, nicht beschnitten');
 const song=src.slice(src.indexOf('function startSong'),src.indexOf('function songCommand'));
 assert.match(song,/audio\(\)\?\.select\?\.\(id,\{play:true,explicit:true\}\)/,'bestehender Player');
 const cmd=src.slice(src.indexOf('function songCommand'),src.indexOf('function stopMine'));
 assert.match(cmd,/mine\(s\)&&s\.state==='paused'\)\{audio\(\)\?\.command\?\.\('play'\)/,'Fortsetzen an derselben Stelle');
 assert.match(css,/is-dimmed \.mp-ff__glow\{opacity:\.35\}/,'Pause dimmt einmal sanft');
 assert.doesNotMatch(src,/new Audio\(|\.play\(\)/,'kein eigener Player');
 assert.doesNotMatch(src,/missingRecordMessage|Platte/,'keine Platzhaltermeldung unter dem Cover');
});

test('Zurück ins Mäppchen (CARD-MUSIC-01): Audio sofort aus, eine Figur fliegt zurück, idempotent; zentraler Stopp bei Schließen, Zurücklegen, Browser-Zurück',()=>{
 const src=read('maeppchen.js');
 const r=src.slice(src.indexOf('async function returnToFolder'),src.indexOf('/** Szenenauswahl'));
 assert.match(r,/if\(!view\|\|view\.scene!=='listen'\|\|view\.returning\)return false;\s*view\.returning=true;/,'Doppel-Taps ignoriert');
 assert.ok(r.indexOf('stopMine()')<r.indexOf('flyFrom('),'erst Audio stoppen, dann Rückflug');
 assert.ok(r.indexOf('flyFrom(')<r.indexOf('backToFolder()'),'Mäppchen erscheint nach dem Rückflug');
 assert.match(r,/showCover\(false\)/,'Cover wird wieder Karte');
 const stop=src.slice(src.indexOf('function stopMine'),src.indexOf('/** Hörmoment ohne Animation'));
 assert.match(stop,/!\['stopped','silent','ended'\]\.includes\(s\.state\)\)audio\(\)\?\.command\?\.\('stop'\)/,'auch beim Laden und in der Pause');
 assert.match(src,/if\(view\?\.scene==='listen'\)endListen\(\);\n/,'Schließen');
 assert.match(src,/if\(view\.scene==='listen'\)endListen\(\);\s*if\(view\.scene!=='folder'\)backToFolder\(\);/,'Zurücklegen');
 assert.match(src,/addEventListener\?\.\('hashchange',\(\)=>\{if\(dialog\?\.open&&view\?\.scene==='listen'\)\{endListen\(\);backToFolder\(\);\}\}\)/,'Browser-Zurück/Raumwechsel');
 assert.match(src,/if\(view\?\.scene==='listen'\)returnToFolder\(\)/,'Escape');
 assert.match(src,/\$\('\[data-mp-back\]'\)\.hidden=view\.scene==='folder'\|\|view\.scene==='listen'/,'keine doppelte Zurück-Navigation');
 const ol=src.slice(src.indexOf('async function openListen'),src.indexOf('function detailMarkup'));
 assert.match(ol,/classList\.remove\('is-covered','is-playing','is-dimmed','is-returning'\)/,'jede Wahl im Ausgangszustand');
 // genau eine Figur: je ein Element für Papier, Flug, Sitzen – kein Glühwürmchen am Knopf
 assert.equal((src.match(/data-mp-perched/g)||[]).length,2);assert.match(src,/class="mp-return" data-mp-return>\$\{img\('01','mp-return__icon'\)\}<span>Zurück ins Mäppchen<\/span>/);
});

test('Originalcover über die Karten-ID (Katalog → Register cover.<ID> → Musikzimmer-Kette), auch in der Gerätestation',()=>{
 const reg=globalThis.EMFDRegistry;const m=reg.resolveMedia('cover.O20');
 assert.equal(m.type,'file');assert.equal(m.width,1254);assert.equal(m.height,1254);
 const file=path.join(home,m.src);assert.ok(fs.existsSync(file));
 assert.equal(require('node:crypto').createHash('sha256').update(fs.readFileSync(file)).digest('hex'),'bf9d76ee959e90efd73e45dac6b2ce51579a006d7a8265f85829a9520939e532','unverändertes Original');
 assert.equal(M.coverOf({id:'O20',name:'Das Windspiel',cover:''}).src,m.src);assert.equal(M.coverOf({id:'O20',name:'x'}).kind,'cover');
 assert.equal(M.coverOf({id:'O13',name:'Die Wurzel',cover:'card.webp'}).kind,'card','ohne Cover: Kartenvorderseite, keine O20-Hardcodierung');
 assert.doesNotMatch(read('maeppchen.js'),/O20/);
 assert.match(read('device-station.js'),/resolveMedia\?\.\(`cover\.\$\{item\.cardId\}`\)/);
 const list=require('../offline-policy.js').registerImages(require('../data/registry.js'));assert.ok(list.house.some(f=>f.endsWith('O20-cover-original-bf9d76ee.jpeg')),'offline');
});

test('Bühne v0.2: schmal genau ein aktiver Bereich (inert), Wide ab 960 × 560; Details fokussieren nie die Schreibfläche',()=>{
 assert.deepEqual({...M.WIDE},{w:960,h:560});
 const src=read('maeppchen.js');
 assert.match(src,/pane\.hidden=!on;pane\.inert=!on;/);
 const od=src.slice(src.indexOf('async function openDetail'),src.indexOf('function backToFolder'));
 assert.doesNotMatch(od,/data-mp-draft/,'Tastatur erst bei Berührung der Seite');assert.match(od,/read\.scrollTop=0/,'Inhalt beginnt oben');
 assert.match(src,/case 'question':[\s\S]*?Gedankenbuch öffnen/);assert.match(src,/data-mp-qchip/);
 assert.match(src,/visualViewport\?\.addEventListener\?\.\('resize',onViewport\)/,'sichtbare Fläche bei Tastatur');
 assert.match(src,/bar\.hidden=!active\|\|view\.scene==='listen'\|\|Boolean\(typing&&!isWide\(\)\)/,'Musikzeile weicht beim Schreiben (schmal)');
 for(const t of ['Impuls','Frage','Gedankenbuch','Geschichten'])assert.match(src,new RegExp(`class="mp-label[^"]*"[^>]*>${t}<`),t);
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

test('Zurücklegen v0.2: Bestätigung im Vordergrund nach Wechsel ins Mäppchen; „Noch behalten“ erhält alles; erst Bestätigung stoppt das Lied',()=>{
 const src=read('maeppchen.js');
 const ask=src.slice(src.indexOf('function askGiveBack'),src.indexOf('function keep()'));
 assert.ok(ask.indexOf("if(view.scene!=='folder')backToFolder()")<ask.indexOf('showModal()'),'zuerst zum Mäppchen');
 assert.match(ask,/has\?`<div class="mp-panel__list">.*data-mp-export.*thought.*backup/s);
 const keep=src.slice(src.indexOf('function keep()'),src.indexOf('function confirmGiveBack'));
 assert.doesNotMatch(keep,/command|giveBack|stop/,'Noch behalten ändert nichts');
 const conf=src.slice(src.indexOf('function confirmGiveBack'),src.indexOf('/* ---------- Exporte'));
 assert.ok(conf.indexOf("command?.('stop')")<conf.indexOf('giveBackNow()'));
 const close=src.slice(src.indexOf('  function close(){'),src.indexOf('/** Sichtbarkeit'));
 assert.doesNotMatch(close,/location\.hash|EMFDNavigation|command\?\.\(/,'Schließen: gleiche Stelle, Lied läuft weiter');
 assert.match(src,/folderSupported=\(\)=>typeof root\.showDirectoryPicker==='function'/);
});

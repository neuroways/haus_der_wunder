const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const app=read('app.js'),html=read('index.html');
test('FIX01: start buttons resist accidental grid stretching',()=>{
 const css=read('desktop-layout.css');
 assert.match(css,/\.start02-door-frame \.start02-door-actions\{grid-auto-rows:max-content/);
 assert.match(css,/max-height:76px/);
});
test('FIX01: images have registered same-motif recovery assets',()=>{
 const catalog=JSON.parse(read('media-catalog.json'));
 for(let index=1;index<=24;index++){
  const id=`card-O${String(index).padStart(2,'0')}`;
  const group=catalog.groups.find(g=>g.id===id);
  assert.ok(group,id);
  const local=group.paths.filter(p=>p.startsWith('assets/recovery/'));
  assert.equal(local.length,1,id);
  assert.ok(fs.existsSync(path.join(root,local[0])),local[0]);
 }
});
test('FIX01: explicit rear image and local fallback',()=>{
 assert.match(read('image-profiles.js'),/\.\.\/media\/cards\/rueckseite\.jpeg/);
 assert.ok(fs.existsSync(path.join(root,'assets/recovery/rueckseite.jpeg')));
});
test('FIX01: no separate motion mode button',()=>{
 assert.doesNotMatch(html,/Mit Handybewegung/);
 assert.match(read('card-motion.js'),/requestOnTouch/);
 assert.match(read('card-motion.js'),/requestPermission/);
});
test('FIX01: brief device hint auto-disappears',()=>{
 const motion=read('card-motion.js');
 assert.match(motion,/emfd\.card\.motionHint\.v1/);
 assert.match(motion,/setTimeout\(\(\)=>note\.remove\(\),350\)/);
});
test('FIX01: Teezimmer has exactly two choices and no new note',()=>{
 const tea=read('teezimmer.js');
 assert.match(tea,/>Eine Karte aussuchen</);
 assert.match(tea,/>Tageskarte ziehen</);
 assert.doesNotMatch(tea,/teezimmer-thoughtpaper|Ein leeres Blatt nehmen/);
 assert.match(read('desktop-layout.css'),/\.teezimmer-actions\{max-width:360px/);
});
test('FIX01: Teezimmer help explains choice and day card',()=>{
 assert.match(html,/id="teezimmer-help-content"/);
 assert.match(html,/Wozu eine Tageskarte\?/);
 assert.match(read('card-interaction.js'),/help\.dataset\.context=tea\?'tea':'card'/);
});
test('ARCH01 supersedes FIX01: route changes preserve playback and cannot start hall audio',()=>{
 const music=read('music-player.js');
 assert.match(music,/location\.hash==='#karten'/);
 assert.doesNotMatch(music,/location\.hash==='#flur'.*setBackgroundPreference/);
 assert.doesNotMatch(music,/location\.hash==='#karten'\)\{[^}]*session\.stop/);
 assert.match(music,/userPaused/);
 assert.match(music,/globalSilence/);
});
test('FIX01: one card book button plus music dock',()=>{
 assert.match(app,/aria-label="Kartenbuch öffnen"/);
 assert.match(read('music-player.js'),/data-music-toggle/);
 assert.doesNotMatch(app, /\[\['impulse','Impuls'\],\['depth','Vertiefung'\],\['question','Frage'\]\]/);
});
test('FIX01: card doubleclick opens the book and singleclick flips',()=>{
 assert.match(app,/const openBook=/);
 assert.match(app,/addEventListener\('dblclick',e=>\{e\.preventDefault\(\);cancelTap\(\);openBook\(\);\}\)/);
 assert.match(app,/singleTapTimer=setTimeout/);
});
test('FIX01: icon-only tabs accessible with labels',()=>{
 assert.match(app,/reading-choice-icon/);
 assert.match(app,/aria-label="\$\{escape\(textLabels\[key\]\)\}"/);
 assert.match(read('desktop-layout.css'),/\.reading-choice-label\{position:absolute!important/);
});
test('FIX01: five synchronized persistent reading sizes',()=>{
 const book=read('book-reading.js');
 assert.match(book,/const sizes=\[16,18,20,23,26\]/);
 assert.match(book,/localStorage\.setItem\(key,String\(selected\)\)/);
 assert.match(book,/MutationObserver/);
 assert.match(book,/'\.start02-letter'/);
 assert.match(book,/'\.story-reader'/);
});
test('FIX01: start image requests cannot block doorway indefinitely',()=>{
 const gate=read('start-gate.js');
 assert.match(gate,/softDeadline=root\.setTimeout\(releaseDoor,2500\)/);
 assert.match(gate,/loadOne\(url,timeout=10000\)/);
});
test('FIX01: release version and SW image cache are updated',()=>{
 assert.match(html,/application-version" content="0\.6\.63"/);
 assert.match(read('image-service-worker.js'),/CACHE='emfd-images-recovery-v7'/);
});

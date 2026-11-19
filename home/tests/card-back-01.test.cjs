const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const home=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(home,file),'utf8');

test('CARD-BACK-01 uses one v1.2 back profile and no v1.0 reference',()=>{
 const files=['app.js','image-profiles.js','card-preload.js','image-service-worker.js','offline-images.js','card-interaction.js'];
 const source=files.map(read).join('\n');
 assert.doesNotMatch(source,/EMFD_Kartenrueckseite_v1\.0/);
 for(const profile of ['210x360-adc3b9f4a1', '630x1080-3d4d2cb907', '896x1536-f5853026a0'])assert.match(source,new RegExp(profile));
 assert.match(read('image-profiles.js'),/cardBack/);
 assert.match(read('image-profiles.js'),/back\(purpose='card-view'\)/);
});

test('random draw stores identity privately and exposes only neutral route',()=>{
 const storage=new Map(),events=[];
 const context={sessionStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)},location:{hash:''},CustomEvent:class{constructor(type,init){this.type=type;this.detail=init?.detail}},dispatchEvent:event=>events.push(event.type),EMFDMusic:{concealCard(){events.push('music-stopped')}},globalThis:null};
 context.globalThis=context;
 vm.runInNewContext(read('card-draw.js'),context);
 assert.equal(context.EMFDCardDraw.begin('O07','#teezimmer'),true);
 assert.equal(context.location.hash,'karte/verdeckt');
 assert.deepEqual(JSON.parse(JSON.stringify(context.EMFDCardDraw.current())),{id:'O07',state:'concealed',returnTarget:'#teezimmer'});
 assert.deepEqual(events,['music-stopped','emfd:card-concealed']);
 assert.equal(context.EMFDCardDraw.reveal().id,'O07');
 assert.equal(context.EMFDCardDraw.current(),null);
});

test('start and tea random draws use concealed flow while direct cards remain direct',()=>{
 const app=read('app.js'),tea=read('teezimmer.js');
 assert.match(app,/EMFDCardDraw\?\.begin\(choices\[index\]\.id,'#ankommen'\)/);
 // Since ARCH-01 the tea room delegates its daily draw to the shared feature registry.
 const registry=read('feature-registry.js');
 assert.match(tea,/data-house-feature="daily" data-feature-room="P08"/);
 assert.match(registry,/root\.EMFDCardDraw\?\.begin\?\.\(card\.id,origin\?roomRoute\(origin\):'#karten'\)/);
 assert.match(registry,/registry\(\)\?\.room\?\.\(id\)\?\.route/);assert.equal(require('../shared/registry.js').room('P08').route,'#teezimmer');
 assert.match(app,/route==='karte\/verdeckt'/);
 // NAV-01: revealing replaces the URL but keeps the history entry and its back target.
 assert.match(app,/window\.EMFDNavigation\?\.replace\?\.\(`#karte\/\$\{c\.id\}`\)/);
 assert.match(app,/history\.replaceState\(history\.state,'',`#karte\/\$\{c\.id\}`\)/);
 assert.match(app,/href="#karte\/\$\{c\.id\}"/);
 assert.match(app,/Verdeckte Karte/);
});

test('concealed card stops route audio and reveal is single-shot and preference-aware',()=>{
 const music=read('music-player.js'),app=read('app.js');
 assert.match(music,/function concealCard\(\)/);
 assert.match(music,/concealedRoute\(\)\|\|!enabled/);
 assert.match(music,/entryMusicOff\(\)/);
 assert.match(music,/window\.addEventListener\('emfd:card-revealed'/);
 assert.match(app,/card\.dataset\.revealed==='true'/);
 assert.match(app,/EMFDCardDraw\?\.reveal/);
});

test('both faces remain proportional and uncropped in normal and close-up views',()=>{
 const css=read('experience.css')+'\n'+read('card-interaction.css')+'\n'+read('emfd-fe07.css');
 assert.doesNotMatch(css,/\.card-back img\{[^}]*object-fit:(?:fill|cover)!important/);
 assert.match(css,/\.card-back img\{[^}]*object-fit:contain!important/);
 assert.match(read('card-interaction.js'),/EMFDImages\.back\("card-detail-large"\)/);
 assert.match(read('card-interaction.js'),/EMFDImages\.back\("card-view"\)/);
 assert.match(css,/prefers-reduced-motion:reduce/);
});

test('build version and cache preserve the card back in the current build',()=>{
 const version=JSON.parse(read('package.json')).version;
 assert.equal(JSON.parse(read('manifest.webmanifest')).version,version);
 assert.ok(read('index.html').includes(`application-version" content="${version}"`));
 const sw=read('image-service-worker.js');
 assert.match(read('offline-policy.js'),/images: 'emfd-media-images-v\d+'/);
 // The card back is allowed through the shared media catalog group.
 assert.match(sw,/importScripts\([^)]*'media-core\.js', 'media-catalog\.js'\)/);
 assert.match(read('media-catalog.js'),/"id":"card-back","paths":\["\.\.\/media\/cards\/rueckseite\.jpeg"/);
});

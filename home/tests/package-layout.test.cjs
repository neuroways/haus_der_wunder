const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const home=path.resolve(__dirname,'..');
const read=(p)=>fs.readFileSync(path.join(home,p),'utf8');
test('PWA install paths are rooted under /wunderhaus/home/',()=>{
 const m=JSON.parse(read('manifest.webmanifest'));
 assert.equal(m.id,'/wunderhaus/home/');assert.equal(m.start_url,'/wunderhaus/home/');assert.equal(m.scope,'/wunderhaus/home/');
 const version=JSON.parse(read('package.json')).version;
 assert.ok(read('index.html').includes(`name="application-version" content="${version}"`));
});
test('all card media uses shared ../media/cards/ paths',()=>{
 const src=read('data.js');assert.equal((src.match(/"image":"\.\.\/media\/cards\/O\d\d\.png"/g)||[]).length,24);
 for(const c of JSON.parse(src.match(/window\.CARDS=(\[.*\]);/s)[1]))assert.ok(c.image.startsWith('../media/cards/'),c.id);
 for(const p of ['app.js','start-gate.js'])assert.doesNotMatch(read(p),/\.\.\/cards\//);
 // The card back comes from image-profiles.js (EMFDImages.cardBack); app.js only keeps a shared-media fallback.
 assert.match(read('image-profiles.js'),/'card-view':Object\.freeze\(\{url:'\.\.\/media\/cards\/rueckseite\.jpeg'/);
 assert.match(read('app.js'),/window\.EMFDImages\?\.cardBack\?\.\['card-view'\]\|\|\{url:'\.\.\/media\/cards\//);assert.match(read('app.js'),/card-back-placeholder/);
 assert.match(read('start-gate.js'),/assets\/rooms\/startseite-haustuer-v1\.webp/);
});
test('all audio manifest tracks use shared ../media/audio/ paths',()=>{
 const m=JSON.parse(read('music-manifest.json'));assert.ok(m.tracks.length>=24);for(const t of m.tracks)assert.ok(t.path.startsWith('../media/audio/'),t.path);
});
test('room scenes have stable, separate media records and accessible routes',()=>{
 const manifest=JSON.parse(fs.readFileSync(path.resolve(home,'../media/rooms/manifest.json'),'utf8'));
 const items=manifest.items||manifest.rooms;
 // The deployed rooms manifest lists the hall and P01–P08 (9 scenes).
 assert.ok(items.length>=9);
 for(const id of ['P01','P02','P03','P04','P05','P06','P07','P08'])assert.ok(items.some(item=>item.id===id),id);
 for(const item of items){const file=item.file||item.path.replace(/^\.?\.?(?:\/)?media\/rooms\//,'').replace(/^\/media\/rooms\//,'');assert.ok(fs.existsSync(path.resolve(home,'../media/rooms',file)),file);if(item.mime_type)assert.equal(item.mime_type,'image/webp');}
 const app=read('app.js');for(const route of ['#flur','#raeume'])assert.ok(app.includes(route),`missing ${route}`);
 for(const id of ['P01','P02','P05','P06','P07'])assert.equal(require('../shared/registry.js').room(id).route,`#ort/${id}`); // BOOK-01a: room addresses from the register
 assert.equal(require('../shared/registry.js').room('P03').route,'#raum/P03/C01'); // EMFD-P03-DEV-01: Wintergarten als Szene, #ort/P03 ist Alias
 // START-02 leads from the gift letter into the hall via enterHall() instead of a static link.
 assert.match(read('start-gate.js'),/function enterHall\(\)\{[\s\S]*?location\.hash='flur'/);
 // v0.6.66 removed the bottom main navigation (see arrival-cleanup test); the header brand always leads back to the hall.
 assert.match(read('index.html'),/<header><a class="brand" href="#flur">/);
});
test('all local runtime files are contained in home and present',()=>{
 const html=read('index.html');for(const [,file] of html.matchAll(/(?:src|href)="([^"#?]+\.(?:css|js|webmanifest|png))"/g))assert.ok(fs.existsSync(path.join(home,file)),file);
 for(const f of ['assets/weltenweberin.jpeg','assets/icons/icon-192.png','assets/icons/icon-512.png','assets/icons/icon-maskable-512.png','start-gate.js','music-player.js'])assert.ok(fs.existsSync(path.join(home,f)),f);
});

test('v0.6.15 integrates a text-free start image with real HTML navigation',()=>{
 const app=read('app.js'),css=read('experience.css')+'\n'+read('room-navigation.css');
 // BOOK-01d: Start ist die Eingangsszene EXT-C01 aus dem Register; die Tür ist ein echter Button (Hotspot + Aktionsliste).
 const registry=require('../shared/registry.js');
 assert.ok(registry.scene('EXT-C01').hotspots.some(h=>h.typ==='NAVIGATION'&&h.label==='Haus betreten'));
 assert.match(css,/start-scene-art/);assert.match(css,/start-door-action/);
 assert.match(app,/hall-light-toggle/);
});

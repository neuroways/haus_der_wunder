const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const home=path.join(__dirname,'..');
const read=(file)=>fs.readFileSync(path.join(home,file),'utf8');

test('v0.3 button library assets are integrated locally and remain backend-independent',()=>{
 for(const file of ['emfd-ui/css/emfd-ui.css','emfd-ui/js/emfd-ui.js','emfd-ui/assets/frames/ornate-nine-slice.svg','emfd-ui/assets/frames/simple-nine-slice.svg','emfd-ui-runtime.js'])assert.ok(fs.existsSync(path.join(home,file)),file);
 const html=read('index.html'),css=read('emfd-ui/css/emfd-ui.css');
 assert.match(html,/href="emfd-ui\/css\/emfd-ui\.css"/);assert.match(html,/type="module" src="emfd-ui-runtime\.js"/);
 assert.match(css,/border-image-source:url\('\.\.\/assets\/frames\/ornate-nine-slice\.svg'\)/);
 assert.match(css,/border-image-source:url\('\.\.\/assets\/frames\/simple-nine-slice\.svg'\)/);
 assert.doesNotMatch(css,/:root\{/,'the component stylesheet must not leak global custom properties');
});

test('responsive shell and scene use safe areas, dynamic viewport sizing, and image-relative hotspots',()=>{
 const html=read('index.html'),shell=read('emfd-shell.css'),scene=read('emfd-scene.css'),runtime=read('emfd-ui-runtime.js');
 assert.match(html,/class="emfd-shell"/);assert.match(html,/class="emfd-shell__content emfd-ui"/);
 assert.match(shell,/100dvh/);assert.match(shell,/env\(safe-area-inset-bottom\)/);assert.match(shell,/container-type:inline-size/);
 assert.match(shell,/repeat\(auto-fit,minmax/);assert.match(shell,/overflow-wrap:anywhere/);
 assert.match(scene,/object-fit:cover/);assert.match(scene,/hall-stage\.emfd-scene__frame[^}]*aspect-ratio:9\/16/);
 assert.match(scene,/\.hall-stage \.emfd-scene__hotspots\{position:absolute;inset:0/);
 assert.match(runtime,/bottomNav\(/);assert.match(runtime,/aria-current/);assert.match(runtime,/dataset\.tab/);
});

test('existing navigation targets and room image behavior are retained',()=>{
 const app=read('app.js'),player=read('music-player.js'),ui=read('emfd-ui-runtime.js');
 for(const route of ['#flur','#karten','#musik','#raeume','#ort/'])assert.ok(app.includes(route),route);
 assert.match(ui,/href:'#flur'/);assert.match(ui,/href:'#karten'/);assert.match(ui,/href:'#musik'/);
 assert.match(app,/function roomImage\(room,decorative=false\)/);
 assert.match(app,/window\.EMFDMusic/);assert.doesNotMatch(ui,/autoplay|\.play\s*\(/i);
 const audioSession=read('audio-session.js');assert.match(audioSession,/a\.autoplay=false/);assert.match(audioSession,/a\.loop=Boolean\(this\.track\?\.loop\)/);
});

test('button-library positioning cannot detach hall hotspots from their scene coordinates',()=>{
 const css=read('emfd-shell.css');
 assert.match(css,/\.emfd-shell__content \.hall-stage \.hall-hotspot\.emfd-button\{position:absolute\}/);
 assert.match(css,/\.emfd-shell__content \.hall-stage>\.hall-light-toggle\.emfd-button\{position:absolute\}/);
 assert.match(css,/\.emfd-shell__content \.start-scene>\.start-door-action\.emfd-button/);
 assert.match(css,/\.emfd-shell__content \.start-scene>\.origin-start-link\.emfd-button/);
});

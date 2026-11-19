const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const start=read('start-gate.js'),css=read('start-gate-v0.6.61.css'),app=read('app.js'),html=read('index.html');

test('START-02: all five sequence states and independent persistence keys exist',()=>{
  for(const state of ['closed','opening','letter-visible','gift-card-visible','completed'])assert.ok(start.includes(`'${state}'`),state);
  for(const key of ['emfd.start02.gift-completed.v1','emfd.start02.tutorial-completed.v1','emfd.start02.install-dismissed.v1'])assert.ok(start.includes(key),key);
});

test('START-02: six reserved assets are mapped without generated replacements',()=>{
  for(const id of ['A01','A02','A03','A05','A06'])assert.match(start,new RegExp(`EMFD-START-02-${id}-`));
  assert.match(start,/assets\/gift\/seal.webp/);
  assert.doesNotMatch(start,/data:image|blob:|canvas/i);
  assert.match(start,/data-start02-missing/);
});

test('START-02: first and returning visits use one gate with replay access',()=>{
  assert.match(start,/firstVisit=\(\)=>!read\(KEYS\.gift\)/);
  assert.match(start,/needsGift\?openGift\(false\):enterWithPreference\(\)/);
  assert.match(app,/data-start-gift-open/);
  const door=start.slice(start.indexOf('function renderDoor'),start.indexOf('function giftMarkup'));
  assert.doesNotMatch(door,/data-start-gift-open|Über dieses Geschenk/);
  assert.match(start,/const gift=event\.target\.closest\?\.\('\[data-start-gift-open\]'\)/);
});

test('START-02: tutorial and install help remain voluntary and reusable',()=>{
  const tour=read('start-tour.js');
  for(const label of ['Laterne','Grammophon','Türen','Deine Geschenkkarte','Das Fragezeichen'])assert.ok(tour.includes(`['${label}'`),label);
  assert.match(start,/EMFDStartTour\?\.start/);
  assert.match(start,/data-start02-tutorial-skip/);
  assert.match(start,/beforeinstallprompt/);
  assert.match(html,/data-start02-tutorial-replay/);
  assert.match(html,/data-start02-install-help/);
});

test('START-02: no autoplay or second audio architecture is introduced',()=>{
  assert.doesNotMatch(start,/new Audio|\.play\(|autoplay/i);
  assert.match(start,/EMFDMusicEntry\?\.show\(true,\{onChoose:showArrivalLetter/);
  assert.doesNotMatch(start,/Animation überspringen|data-start02-skip-animation/);
  const musicEntry=read('music-entry.js');
  assert.doesNotMatch(musicEntry,/emfd:start-gate-rendered|setTimeout\(maybeShow/);
  assert.match(musicEntry,/setBackgroundPreference\(value,\{start:false\}\)/);
  assert.match(html,/music-entry\.js\?v=0\.6\.61/);
});

test('START-02: light state persists and reduced motion is supported',()=>{
  assert.match(app,/emfd\.house\.light\.v1/);
  assert.match(app,/saveHallLight\(\)/);
  assert.match(start,/prefers-reduced-motion: reduce/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});

test('START-02: preloading is bounded and full-deck eager loading is removed',()=>{
  assert.match(start,/Math\.min\(2,urls\.length\)/);
  assert.doesNotMatch(start,/EMFDCardAssets\.ready/);
  const preload=read('card-preload.js');
  assert.match(preload,/downloaded:0/);
  assert.doesNotMatch(preload,/Object\.values\(root\.EMFDImages\.cards\)/);
  // EMFD-CACHE-01: die 20-MB-Verdrängung ist aufgehoben (Bilder sollen dauerhaft offline bleiben).
  assert.doesNotMatch(read('image-service-worker.js'),/MAX_BYTES=20\*1024\*1024/);
});

test('START-02: version and resources are wired',()=>{
  const version=JSON.parse(read('package.json')).version;
  assert.ok(html.includes(`application-version" content="${version}`));
  assert.match(html,/start-gate-v0\.6\.61\.css\?v=0\.6\.61/);
  assert.ok(app.includes(`start-gate.js?v=${version}`));
  assert.equal(JSON.parse(read('manifest.webmanifest')).version,version);
  assert.equal(JSON.parse(read('deployment-layout.json')).appVersion,version);
});

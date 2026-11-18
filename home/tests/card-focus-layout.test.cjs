const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const home=path.join(__dirname,'..');
const read=name=>fs.readFileSync(path.join(home,name),'utf8');

test('card detail keeps all four companion controls in one compact row',()=>{
  const css=read('card-text-v1.3.css');
  assert.match(css,/\.card-dock\{[^}]*grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(css,/\.card-dock button\{[^}]*min-height:54px/);
});

test('music control has a visible compact label',()=>{
  assert.match(read('music-player.js'),/dock-label\">Ton/);
});

test('O08 image path and case match the shared media file',()=>{
  assert.match(read('data.js'),/"id":"O08"[^}]*"image":"\.\.\/media\/cards\/O08\.png"/);
  assert.ok(fs.existsSync(path.resolve(home,'../media/cards/O08.png')));
});

test('card interaction exposes real-life gestures and explicit close-up access',()=>{
  const app=read('app.js'),interaction=read('card-interaction.js'),css=read('card-interaction.css');
  assert.match(app,/Tippen zum Umdrehen · Bewegen zum Erkunden/);
  assert.match(app,/data-card-enlarge/);
  assert.match(app,/EMFDCardView\?\.open\(card\)/);
  assert.match(app,/card\.dataset\.motionBound==='true'/);
  assert.match(app,/pointerup[^\n]*else\{flip\(\);suppressClick=true;\}/);
  assert.match(app,/const afterPaint=window\.requestAnimationFrame\|\|/);
  assert.match(app,/afterPaint\(\(\)=>afterPaint\(\(\)=>\{bindMotion\(\);fitActiveCard\(\);\}\)\)/);
  assert.match(interaction,/area\.append\(card\)/);
  assert.match(interaction,/sourceImage\?\.naturalWidth/);
  assert.match(interaction,/Math\.min\(availableWidth,availableHeight\*ratio\)/);
  assert.match(interaction,/--closeup-viewport-height/);
  assert.match(css,/\.card-enlarge\{position:absolute/);
  assert.match(css,/#card-closeup\[open\]\{grid-template-rows:auto minmax\(0,1fr\) auto\}/);
  assert.match(css,/\.closeup-stage\{[^}]*overflow:hidden/);
  assert.match(css,/\.closeup-stage \.held-card\{[^}]*max-width:100%[^}]*max-height:100%/);
});

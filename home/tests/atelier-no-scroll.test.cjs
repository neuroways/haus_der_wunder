const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');

test('Atelier start route receives its own viewport mode',()=>{
  const app=read('app.js');
  assert.match(app,/classList\.toggle\('atelier-home-view',route==='atelier'\)/);
});

test('mobile Atelier start view is bounded to the visible viewport',()=>{
  const shell=read('emfd-shell.css'),css=read('atelier.css');
  assert.match(shell,/body\.emfd-shell\.immersive-room-view\{[^}]*height:100dvh[^}]*overflow:hidden/);
  assert.match(css,/\.atelier-view\{[^}]*height:100%[^}]*min-height:0[^}]*overflow:hidden/);
  assert.match(css,/\.atelier-gallery-nav\{[^}]*env\(safe-area-inset-bottom\)/);
});

test('scroll lock does not apply to table and card overview routes',()=>{
  const app=read('app.js');
  assert.doesNotMatch(app,/atelier-home-view[^\n]*(atelier\/tisch|route==='karten')/);
  assert.doesNotMatch(app,/atelier-table-view[^\n]*route==='karten'/);
});

test('mobile Atelier table receives its own bounded viewport layout',()=>{
  const app=read('app.js'),css=read('atelier.css');
  assert.match(app,/classList\.toggle\('atelier-table-view',route\.startsWith\('atelier\/tisch\/'\)\)/);
  assert.match(css,/\.atelier-gallery-view\{[^}]*grid-template-rows:minmax\(0,1fr\) auto/);
  assert.match(css,/\.atelier-wall\{[^}]*min-height:0[^}]*overflow:hidden/);
  assert.match(css,/\.atelier-frame\{[^}]*min-height:0[^}]*max-width:100%/);
});

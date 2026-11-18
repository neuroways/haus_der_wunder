const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const home=path.resolve(__dirname,'..');
const js=fs.readFileSync(path.join(home,'atelier.js'),'utf8');
const css=fs.readFileSync(path.join(home,'atelier.css'),'utf8');
test('gallery keeps visible back, text and next buttons',()=>{
  for(const label of ['Zurück','Text lesen','Weiter'])assert.ok(js.includes(`>${label}</span>`));
  assert.match(js,/data-gallery-move="previous"/);assert.match(js,/data-gallery-move="next"/);
});
test('horizontal pointer swipe navigates in both directions with direction and distance thresholds',()=>{
  assert.match(js,/wall\?\.addEventListener\('pointerdown'/);
  assert.match(js,/wall\?\.addEventListener\('pointerup'/);
  assert.match(js,/Math\.abs\(dx\)<55\|\|Math\.abs\(dx\)<Math\.abs\(dy\)\*1\.3/);
  assert.match(js,/if\(dx<0\)move\('next',next\.id\)/);
  assert.match(js,/else move\('previous',previous\.id\)/);
  assert.match(css,/touch-action:pan-y/);
});
test('double tap opens text rather than the zoom and a single tap still zooms',()=>{
  assert.match(js,/const openText=\(\)=>/);
  assert.match(js,/event\.detail>=2\|\|tapTimer!==null/);
  assert.match(js,/tapTimer=root\.setTimeout\(\(\)=>\{tapTimer=null;openZoom\(\);\},340\)/);
  assert.match(js,/addEventListener\('dblclick',event=>\{event\.preventDefault\(\);openText\(\);\}\)/);
  assert.match(js,/cancelSingleTap\(\)/);
});

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');

test('Zimmer entfernen den globalen App-Rahmen und bleiben bildgeführt',()=>{
  const app=read('app.js'),shell=read('emfd-shell.css'),css=read('immersive-v0.6.32.css');
  assert.match(app,/classList\.toggle\('immersive-room-view'/);
  assert.match(shell,/immersive-room-view>\.global-nav\{display:none\}/);
  assert.match(shell,/body\.emfd-shell>header\{display:none\}/);
  assert.match(css,/teezimmer-view,body\.immersive-room-view \.atelier-view/);
  assert.match(css,/music-room--scene/);
});

test('Flur bleibt Zentrale und bietet genau einen Zugang zur Raumübersicht',()=>{
  const app=read('app.js');
  assert.match(app,/class="hall-utilities"/);
  assert.match(app,/data-hall-help/);
  assert.match(app,/data-hall-settings/);
  assert.match(app,/hall-hotspot--rooms/);
  assert.match(app,/href="#raeume">Alle Räume ansehen/);
});

test('Playlist ist eine kompakte bildgestützte Titelliste und Filter bleiben funktionsfähig',()=>{
  const room=read('music-room.js');
  assert.match(room,/music-catalog-background/);
  assert.match(room,/class="playlist-play"/);
  assert.match(room,/item\.hidden=!show/);
  assert.doesNotMatch(room,/\$\{tabs\('playlist'\)\}/);
});

test('Rückwege aus Karten und Übersicht berücksichtigen den Einstieg',()=>{
  const app=read('app.js'),atelier=read('atelier.js');
  assert.match(app,/Zurück ins Teezimmer/);
  assert.match(app,/Zurück zum Kartentisch/);
  assert.match(atelier,/gridBackTarget==='#teezimmer'/);
  assert.match(atelier,/remembered==='#karten'\?'#flur':remembered/);
  assert.match(app,/a\[href=\"#flur\"\]/);
});

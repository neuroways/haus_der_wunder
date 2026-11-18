const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('NAV-01: all primary and room routes remain wired',()=>{
  const app=read('app.js');
  for(const route of ['karten','atelier','teezimmer','flur','raeume','musik','musik/playlist','musik/geschichten']){
    assert.ok(app.includes(`route==='${route}'`),`route ${route} is missing`);
  }
  assert.match(app,/route\.startsWith\('atelier\/tisch\/'\)/);
  assert.match(app,/route\.startsWith\('ort\/'\)/);
  assert.match(app,/route\.startsWith\('karte\/'\)/);
});

test('NAV-02: every persistent dialog has an explicit close control',()=>{
  const html=read('index.html');
  assert.match(html,/class="settings-close" aria-label="Einstellungen schließen"/);
  assert.match(html,/id="music-close" aria-label="Musikauswahl schließen"/);
  assert.match(html,/aria-label="Hilfe schließen"/);
  assert.match(html,/class="closeup-close" aria-label="Nahansicht schließen"/);
  assert.match(read('origin-story.js'),/aria-label="Hinter dem Haus schließen"/);
  assert.match(read('app.js'),/aria-label="Leseansicht schließen"/);
});

test('NAV-03: route changes close every open overlay',()=>{
  assert.match(read('settings.js'),/hashchange[\s\S]*dialog\.open[\s\S]*dialog\.close/);
  assert.match(read('music-player.js'),/hashchange[\s\S]*if\(dialog\.open\)dialog\.close/);
  assert.match(read('card-interaction.js'),/hashchange[\s\S]*close\(false\)/);
  assert.match(read('card-interaction.js'),/hashchange[\s\S]*if\(help\.open\)help\.close/);
  assert.match(read('origin-story.js'),/hashchange[\s\S]*dialog\.open[\s\S]*dialog\.close/);
  assert.match(read('app.js'),/hashchange[\s\S]*readingDialog\.open[\s\S]*readingDialog\.close/);
});

test('NAV-04: start controls have separate bounded hit areas',()=>{
  const css=read('emfd-shell.css');
  assert.match(css,/start-door-action\{[^}]*top:68%;bottom:auto;[^}]*z-index:6/);
  assert.match(css,/origin-start-link\{[^}]*top:80%;bottom:auto;[^}]*height:46px[^}]*z-index:5/);
});

test('NAV-05: card detail returns to the entry context',()=>{
  assert.match(read('atelier.js'),/rememberCard\(card\.id\)/);
  assert.match(read('teezimmer.js'),/rememberReturn\(\)/);
  assert.match(read('music-room.js'),/data-story-card/);
  assert.match(read('music-room.js'),/rememberReturn\?\.\('#musik\/geschichten'\)/);
});

test('NAV-06: modal openers are idempotent',()=>{
  assert.match(read('settings.js'),/if\(!dialog\.open\)dialog\.showModal\(\)/);
  assert.doesNotMatch(read('music-player.js'),/dialog\.showModal\(/);
  assert.match(read('card-interaction.js'),/if\(!help\.open\)help\.showModal\(\)/);
});

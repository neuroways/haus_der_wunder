const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const home=path.join(__dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(home,'music-manifest.json'),'utf8'));
const player=fs.readFileSync(path.join(home,'music-player.js'),'utf8');
const app=fs.readFileSync(path.join(home,'app.js'),'utf8');
const session=fs.readFileSync(path.join(home,'audio-session.js'),'utf8');

test('T03 is an independent app-theme asset, separate from card songs',()=>{
 const themes=manifest.tracks.filter(track=>track.assetId==='T03');
 assert.equal(themes.length,1);
 assert.deepEqual({kind:themes[0].kind,path:themes[0].path,version:themes[0].version,loop:themes[0].loop,autoplay:themes[0].autoplay},
  {kind:'app-theme',path:'../media/audio/THEME-M01.mp3',version:'T03',loop:true,autoplay:false});
 assert.equal(themes[0].musicalStatus,'confirmed');
 assert.equal(themes[0].availability,'not-verified');
 assert.equal(themes[0].cardId,undefined);
});

test('T03 is selectable in the player and selection alone never plays it',()=>{
 assert.match(player,/appThemes\.label='App-Theme'/);
 assert.match(player,/function selectTheme\(assetId='T03'\)/);
 assert.match(player,/mode=setModeValue\('individual'\)/);
 assert.match(player,/session\.track\?\.kind!=='app-theme'/);
 const selector=player.match(/function selectTheme\(assetId='T03'\)\{([\s\S]*?)\}async function setBackgroundPreference/)?.[1];
 assert.ok(selector,'theme selection API exists');
 assert.doesNotMatch(selector,/\.play\s*\(/);
});

test('music page offers a labelled app-theme route without changing navigation',()=>{
 assert.match(app,/aria-labelledby="app-theme-title"/);
 assert.match(app,/Das Haus der kleinen Wunder – Main Theme/);
 assert.match(app,/Theme im Player auswählen/);
 assert.match(app,/selectTheme\('T03'\)/);
 assert.match(session,/a\.loop=Boolean\(this\.track\?\.loop\);a\.autoplay=false/);
});

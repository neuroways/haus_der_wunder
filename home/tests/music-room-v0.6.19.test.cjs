const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const catalog=JSON.parse(fs.readFileSync(path.join(root,'playlist-catalog.json'),'utf8'));
const items=catalog.items;
const cards=items.filter(item=>item.type==='card_song');

test('PLAY-01: catalog contains exactly 25 primary entries',()=>{
  assert.equal(items.length,25);
  assert.equal(cards.length,24);
});

test('PLAY-02: four categories contain six cards each',()=>{
  for(const group of ['Ruhe','Kraft','Halt','Freude']){
    assert.equal(cards.filter(item=>item.category===group).length,6,group);
  }
});

test('PLAY-03/04: every O-ID has the canonical image and audio path',()=>{
  cards.forEach((item,index)=>{
    const id=`O${String(index+1).padStart(2,'0')}`;
    assert.equal(item.cardId,id);
    assert.equal(item.media.imagePath,`../media/cards/${id}.png`);
    assert.equal(item.media.audioPath,`../media/audio/${id}.mp3`);
  });
});

test('PLAY-05: main theme has no card ID and uses THEME.mp3',()=>{
  const theme=items.find(item=>item.type==='app_theme');
  assert.equal(theme.cardId,null);
  assert.equal(theme.media.audioPath,'../media/audio/THEME.mp3');
});

test('PLAY-06: documented multi-variants are retained',()=>{
  const versions=id=>cards.find(item=>item.cardId===id).variants.map(item=>item.version);
  assert.deepEqual(versions('O16'),['T06','T07']);
  assert.deepEqual(versions('O22'),['T05','T06','T08']);
  assert.deepEqual(versions('O23'),['T04','T03']);
  assert.equal(items.reduce((sum,item)=>sum+item.variants.length,0),16);
});

test('PLAY-07/13: catalog starts silent and pending items are not playable',()=>{
  assert.equal(catalog.mediaPolicy.autoplay,false);
  assert.equal(catalog.mediaPolicy.initialSilence,true);
  assert.ok(items.every(item=>item.publicationStatus==='pending'&&item.playable===false));
});

test('PLAY-11/12: music routes and missing-asset fallbacks are present',()=>{
  const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
  const room=fs.readFileSync(path.join(root,'music-room.js'),'utf8');
  assert.match(app,/musik\/playlist/);
  assert.match(app,/musik\/geschichten/);
  assert.match(room,/Bild wird nachgeliefert/);
  assert.match(room,/Zurück zum Flur/);
});

test('PLAY-15: filters, status and storybook expose accessible semantics',()=>{
  const room=fs.readFileSync(path.join(root,'music-room.js'),'utf8');
  assert.match(room,/aria-label="Musikgruppe"/);
  assert.match(room,/role="status"/);
  assert.match(room,/aria-labelledby="stories-title"/);
  assert.match(room,/aria-labelledby="story-title"/);
  assert.match(room,/aria-label="Verknüpfungen dieser Geschichte"/);
});

test('PLAY-16: category filters visually remove hidden playlist cards',()=>{
  const room=fs.readFileSync(path.join(root,'music-room.js'),'utf8');
  const css=fs.readFileSync(path.join(root,'music-room.css'),'utf8');
  assert.match(room,/item\.hidden=!show/);
  assert.match(css,/\.playlist-card\[hidden\]\{display:none\}/);
});

test('PLAY-17: playlist UI hides technical variant numbers and media paths',()=>{
  const room=fs.readFileSync(path.join(root,'music-room.js'),'utf8');
  assert.doesNotMatch(room,/playlist-variants/);
  assert.doesNotMatch(room,/playlist-path/);
  assert.doesNotMatch(room,/ohne Karten-ID/);
  assert.ok(items.every(item=>Array.isArray(item.variants)&&item.media.audioPath));
});

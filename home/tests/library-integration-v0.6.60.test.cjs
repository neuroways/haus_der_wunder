const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');

test('BIB v0.6.61: application version advances while library cache keys stay consistent',()=>{
  const html=read('index.html');
  const version=JSON.parse(read('package.json')).version;
  assert.ok(html.includes(`application-version" content="${version}"`));
  assert.ok(html.includes(`app.js?v=${version}`));
  for(const asset of ['origin-story.js','origin-storybook.css','house-grundausbau.css','library/library.css','library/library-entry.js'])
    assert.ok(new RegExp(asset.replace(/[./]/g,'\\$&')+'\\?v=[\\w.-]+"').test(html),asset);
  assert.equal(JSON.parse(read('deployment-layout.json')).appVersion,version);
  assert.equal(JSON.parse(read('manifest.webmanifest')).version,version);
});

test('BIB v0.6.60: P02 has a recoverable single shelf mount',()=>{
  const app=read('app.js');
  assert.match(app,/const isLibrary=id==='P02'/);
  assert.match(app,/id="emfd-library-root"/);
  assert.match(app,/window\.EMFDLibrary\?\.mount\(shelf\)/);
  assert.match(app,/Das Bücherregal konnte gerade nicht geladen werden/);
  assert.match(app,/scrollIntoView/);
});

test('BIB v0.6.60: story reader stays separate and coordinates dialogs',()=>{
  const story=read('origin-story.js');
  const entry=read('library/library-entry.js');
  assert.match(story,/#thought-paper-dialog/);
  assert.match(story,/if\(thoughtDialog\?\.open\)thoughtDialog\.close\(\)/);
  assert.match(story,/activeChapters=bookIds\?\.length\?chapters\.filter/);
  assert.match(read('shared/readers.js'),/bookIds:\['idee','character_worldweaver'\]/);
  assert.match(read('shared/readers.js'),/bookIds:\['musik'\]/);
  assert.doesNotMatch(entry,/new Audio|\.play\(|autoplay/i);
});

test('BIB v0.6.60: protected NOTE-03, TEA and card-book resources remain wired',()=>{
  const html=read('index.html');
  assert.match(html,/thought-paper\.js\?v=0\.6\.(?:59|79|82)/); // v0.6.79/0.6.82: Werkzeuge für das Mäppchen ergänzt, Gedankenblatt unverändert
  assert.match(html,/teezimmer\.js\?v=[\w.-]+"/);
  assert.match(html,/book-v2\.css\?v=0\.6\.57/);
  assert.match(read('app.js'),/const readingKeys=\['impulse','depth','question'\]/);
  assert.doesNotMatch(read('teezimmer.js'),/data-teezimmer-paper/); // removed by decision in v0.6.64
  assert.match(read('thought-paper.js'),/documentPages/);
});

test('BIB v0.6.60: global library styles neutralize legacy header flex layout',()=>{
  const css=read('library/library.css');
  assert.match(css,/\.emfd-lib-heading\{display:block;width:auto;padding:0/);
  assert.match(css,/\.emfd-lib-reader-top\{display:flex;width:auto;max-width:none;padding:0/);
  assert.match(css,/@media\(max-width:420px\)/);
});

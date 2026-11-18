const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const dir=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(dir,f),'utf8');
const story=read('origin-story.js'),app=read('app.js'),html=read('index.html'),catalog=read('library/catalog.js');
const collection=JSON.parse(story.match(/const collection=(\{.*\});/)[1]);

test('BIB-FE-01: original 19 sections and exact original book order preserved',()=>{
 assert.deepEqual(collection.books.map(b=>b.id),['idee','musik','character_worldweaver']);
 assert.deepEqual(collection.books.map(b=>b.sections.length),[5,13,1]);
});
test('BIB-FE-01: P02 shelf additive and entry module wired',()=>{
 assert.match(app,/const isLibrary=id==='P02'/);
 assert.match(app,/id=\"emfd-library-root\"/);
 assert.match(app,/EMFDLibrary\?\.mount/);
 assert.match(html,/library\/library-entry\.js/);
 assert.match(html,/library\/library\.css/);
 assert.match(app,/data-library-jump/);
});
test('BIB-FE-01: existing reader can filter books without copying texts',()=>{
 assert.match(story,/activeChapters=bookIds\?\.length\?chapters\.filter/);
 assert.match(story,/window\.EMFDOriginStory=\{open/);
 assert.match(read('shared/readers.js'),/bookIds:\['idee','character_worldweaver'\]/);
 assert.match(read('shared/readers.js'),/bookIds:\['musik'\]/);
 assert.match(read('library/library-entry.js'),/EMFDNavigation\.go\('#karten'/);
});
test('BIB-FE-01: all 5 visual books; drafts are explicitly identified',()=>{
 for(const id of ['weltenweberin','klangwelten','hausgeschichten','karten','achtsamkeit'])assert.ok(catalog.includes(`id: '${id}'`),id);
 assert.match(catalog,/status: 'konzept'/);
 assert.match(read('library/library.js'),/onOpenBook\(book,trigger\)!==false/);
 assert.match(read('library/library.js'),/Inhaltsübersicht/);
 assert.match(read('library/library.css'),/emfd-lib-embedded/);
});
test('BIB-FE-01: no additional reader or autoplay; old origin entry stays',()=>{
 assert.match(story,/data-origin-open/);
 assert.match(story,/Hinter dem Haus schließen/);
 assert.match(story,/window\.EMFDHandy\?\.pause\(\)/);
 assert.doesNotMatch(read('library/library-entry.js'),/\.play\(|autoPlay|autoplay/);
 assert.doesNotMatch(read('library/catalog.js'),/autoplay/);
});

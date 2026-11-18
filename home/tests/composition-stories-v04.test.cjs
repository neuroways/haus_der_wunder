const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const data=JSON.parse(read('composition-stories.json'));
const media=JSON.parse(read('composition-story-media.json'));
const source=read('content/EMFD_Kompositionsgeschichten_v0.4.md').replace(/\r\n/g,'\n');
const room=read('music-room.js');
const css=read('music-room.css');

function sourceSections(){
  return [...source.matchAll(/^## (O\d{2}) · (.+)\n([\s\S]*?)(?=^## O\d{2} · |\n---\s*$)/gm)].map(match=>{
    const [,cardId,title,raw]=match;
    const subtitle=raw.match(/^\*([^*\n]+)\*$/m)[1].trim();
    const subtitleEnd=raw.indexOf(`*${subtitle}*`)+subtitle.length+2;
    return {cardId,title:title.trim(),subtitle,body:raw.slice(subtitleEnd).trim().replace(/\n---\s*$/,'').trim()};
  });
}

test('STORY-01: all 24 stories retain stable order and required fields',()=>{
  assert.equal(data.stories.length,24);
  data.stories.forEach((story,index)=>{
    const id=`O${String(index+1).padStart(2,'0')}`;
    assert.equal(story.cardId,id);
    for(const field of ['title','subtitle','category','body','textVersion','editorialStatus','publicationStatus','illustrationId','cardImageId','audioId','updatedAt'])assert.ok(story[field],`${id}.${field}`);
    assert.equal(story.publicationStatus,'draft');
    assert.equal(story.cardImageId,id);
    assert.equal(story.audioId,id);
  });
});

test('STORY-02: full titles, subtitles and bodies match the binding Markdown source',()=>{
  const sections=sourceSections();
  assert.equal(sections.length,24);
  sections.forEach((expected,index)=>{
    const actual=data.stories[index];
    assert.equal(actual.cardId,expected.cardId);
    assert.equal(actual.title,expected.title);
    assert.equal(actual.subtitle,expected.subtitle);
    assert.equal(actual.body,expected.body,expected.cardId);
  });
});

test('STORY-03: draft A and B assignments match the editorial handover',()=>{
  const draftA=new Set(['O13','O14','O15','O16','O17','O19','O20','O21','O22','O23','O24']);
  data.stories.forEach(story=>assert.equal(story.editorialStatus,draftA.has(story.cardId)?'draft_a':'draft_b',story.cardId));
});

test('STORY-04: illustration manifest uses original cards only as explicit fallbacks',()=>{
  assert.equal(media.illustrations.length,24);
  media.illustrations.forEach((item,index)=>{
    const id=`O${String(index+1).padStart(2,'0')}`;
    assert.equal(item.cardId,id);
    assert.equal(item.status,'pending');
    assert.equal(item.webPath,null);
    const groups=JSON.parse(read('media-catalog.json')).groups;
    assert.ok(groups.some(group=>group.paths.includes(item.fallbackPath)&&group.paths.some(path=>path.startsWith('assets/recovery/'+id+'-'))),id);
  });
});

test('STORY-05: music stories use the shared library selection and shared book reader',()=>{
  const app=read('app.js'),books=read('music-books.js');
  assert.ok(app.includes("route.startsWith('musik/geschichten')"));
  assert.ok(read('shared/content.js').includes('composition-stories.json'));
  assert.ok(room.includes('EMFDContent.compositions()'));
  assert.ok(room.includes('EMFDMusicBooks.mount'));
  assert.ok(books.includes("import('./library/library.js')"));
  assert.ok(books.includes('EMFDOriginStory?.open'));
  assert.ok(books.includes('pageNavigation:true'));
  assert.ok(!books.includes('new Audio'));
});

test('STORY-06: storybook layout is responsive and reduced-motion safe',()=>{
  assert.match(css,/grid-template-columns:repeat\(auto-fit/);
  assert.match(css,/@media\(max-width:600px\)/);
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.match(css,/min-height:48px/);
});

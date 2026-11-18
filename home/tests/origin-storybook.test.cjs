const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const js=read('origin-story.js');
const css=read('origin-storybook.css');
const legacy=read('origin-story.css');
const html=read('index.html');
const collection=JSON.parse(js.match(/const collection=(\{.*\});/)[1]);
const sections=collection.books.flatMap(book=>book.sections);

test('Storybook assets are wired and isolated from the card book',()=>{
  assert.match(html,/origin-storybook\.css/);
  assert.match(html,/origin-story\.js/);
  assert.doesNotMatch(css,/reading-dialog|reading-choice|bookmarks/);
});

test('All three existing contributions and 19 unchanged sections remain',()=>{
  assert.deepEqual(collection.books.map(book=>book.label),['Die Idee','Die Musik','Die Weltenweberin']);
  assert.equal(sections.length,19);
  assert.match(js,/Wenn Musik die Tür nach innen öffnet/);
  assert.match(js,/Wie ich Welten aus Klang erschaffe/);
  assert.match(js,/Du darfst ankommen, ohne dich verändern zu müssen/);
  assert.match(js,/Ich bin Svenja\. Ich mache Musik, fotografiere und entwickle Software\./);
});

test('Chapter chooser and previous-next navigation cross all section boundaries',()=>{
  assert.match(js,/origin-toc-toggle/);
  assert.match(js,/origin-prev/);
  assert.match(js,/origin-next/);
  assert.match(js,/collection\.books\.flatMap/);
  assert.match(js,/aria-current/);
  assert.match(js,/scroll\.scrollTop=0/);
});

test('Portrait is embedded without a visible duplicate caption',()=>{
  assert.match(js,/origin-portrait--spread/);
  assert.match(js,/origin-portrait--inline/);
  assert.match(js,/img\.alt=book\.image\.alt/);
  assert.match(js,/spreadImg\.alt=''/);
  assert.doesNotMatch(js,/createElement\('figcaption'\)/);
  assert.match(css,/mask-image:radial-gradient/);
  assert.doesNotMatch(css,/\.origin-portrait[^\n]*max-height:420px/);
  assert.doesNotMatch(css,/\.origin-portrait[^\n]*box-shadow/);
});

test('Missing portrait never removes the story text',()=>{
  assert.match(js,/img\.addEventListener\('error',\(\)=>\{figure\.remove\(\);\}\)/);
  assert.match(js,/for\(const paragraph of section\.paragraphs\)/);
});

test('Responsive single page, double spread and desktop contents are defined',()=>{
  assert.match(css,/@media\(max-width:1199px\)/);
  assert.match(css,/@media\(max-width:899px\)/);
  assert.match(css,/@media\(max-width:600px\)/);
  assert.match(css,/\.origin-portrait--inline\{display:block\}/);
  assert.match(css,/overflow-y:auto/);
  assert.match(css,/max-width:70ch/);
  assert.match(css,/100dvh/);
});

test('Focus, close, reduced motion and audio pause remain accessible',()=>{
  assert.match(js,/aria-label="Hinter dem Haus schließen"/);
  assert.match(js,/aria-label="Geschichte lesen"/);
  assert.match(js,/opener\.focus\(\{preventScroll:true\}\)/);
  assert.match(js,/window\.EMFDHandy\?\.pause\(\)/);
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.match(css,/min-height:44px/);
  assert.ok(legacy.length>0);
});

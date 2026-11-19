const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const home=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(home,file),'utf8');

test('all voluntary reading choices combine an accessible label with a visible icon',()=>{
 const app=read('app.js');
 assert.match(app,/reading-choice-icon/);
 assert.match(app,/reading-choice-label/);
 for(const key of ['impulse','interpretation','depth','houseStory','question','anchor']){
  assert.match(app,new RegExp(`${key}:'<svg`));
 }
 assert.match(app,/data-reading-switch/);
});

test('reading choice icons remain legible in the compact three-column layout',()=>{
 const css=read('card-text-v1.3.css');
 assert.match(css,/\.reading-choice-icon\{/);
 assert.match(css,/\.reading-choice-icon svg\{/);
 assert.match(css,/\.reading-choice button\[aria-current\] \.reading-choice-icon/);
 assert.match(css,/@media\(max-width:380px\)/);
});

test('reading dialog uses a compact accessible x close control',()=>{
 const app=read('app.js'),css=read('card-text-v1.3.css');
 // The reading dialog became the card book in v0.6.56; its × keeps an explicit accessible name.
 assert.match(app,/class="reading-close" type="button" aria-label="Buch schließen">×<\/button>/);
 assert.doesNotMatch(app,/aria-label="[^"]*schließen">Schließen<\/button>/);
 assert.match(css,/\.reading-dialog \.reading-close\{width:46px;height:46px/);
 assert.match(css,/\.reading-dialog\[open\]\{display:flex;\}/);
 assert.match(css,/\.reading-dialog:not\(\[open\]\)\{display:none;\}/);
});

test('all reading sections render as consistent pages of one book',()=>{
 const app=read('app.js'),css=read('card-text-v1.3.css');
 assert.match(app,/reading-dialog book-dialog reading-kind-\$\{kind\}/);
 assert.doesNotMatch(app,/kind==='question'\?'question-dialog'/);
 assert.match(css,/All voluntary texts are pages of the same book/);
 assert.match(css,/@keyframes reading-page-turn/);
 assert.match(css,/font-family:Georgia,"Times New Roman",serif/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\).*reading-shell\{animation:none;/s);
});

test('book navigation uses six compact icon-only bookmarks above the page',()=>{
 const app=read('app.js'),css=read('card-text-v1.3.css');
 assert.match(app,/<span class="reading-choice-icon" aria-hidden="true">\$\{dockIcons\[key\]\}<\/span><span class="reading-choice-label">\$\{escape\(textLabels\[key\]\)\}<\/span><\/button>/);
 assert.match(app,/reading-close[^]*<nav class="reading-choice"[^]*<div class="reading-shell"/);
 assert.match(css,/Compact icon-only bookmarks sit above the paper page/);
 assert.match(css,/grid-template-columns:repeat\(6,44px\)/);
 assert.match(css,/\.reading-choice-label\{position:absolute!important/);
});

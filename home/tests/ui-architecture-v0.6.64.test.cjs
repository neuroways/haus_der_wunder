const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const html=read('index.html'),styles=read('design-system-v0.6.64.css');
function registry(){
 const listeners={};const cards=Array.from({length:24},(_,i)=>({id:'O'+String(i+1).padStart(2,'0'),image:'test.png'}));
 const events=[],ctx={CARDS:cards,document:{addEventListener(name,cb){listeners[name]=cb}},
  location:{hash:'#teezimmer'},crypto:{getRandomValues(values){values[0]=5}},
  EMFDAtelier:{rememberReturn(url){events.push(['return',url])}},EMFDCardDraw:{begin(id,url){events.push(['begin',id,url]);return true}},
  dispatchEvent(){events.push(['hashchange'])},HashChangeEvent:function(){}};
 ctx.globalThis=ctx;vm.runInNewContext(read('feature-registry.js'),ctx);
 return {ctx,events,listeners};
}
test('one shared feature registry connects all eight rooms to reusable modules',()=>{
 const {ctx}=registry();assert.equal(Object.keys(ctx.EMFDFeatures.roomFeatures).length,8);
 const unique=new Set(Object.values(ctx.EMFDFeatures.roomFeatures).flat());
 for(const id of unique)assert.ok(ctx.EMFDFeatures.features[id]);
 assert.ok(ctx.EMFDFeatures.list('P02').some(x=>x.id==='stories'));
 assert.ok(ctx.EMFDFeatures.list('P06').some(x=>x.id==='stories'));
});
test('Teezimmer continues to have exactly two shared actions and no duplicated draw handler',()=>{
 const tea=read('teezimmer.js');assert.match(tea,/data-house-feature="cards"/);assert.match(tea,/data-house-feature="daily"/);
 assert.doesNotMatch(tea,/\[data-daily-card\]'\)\?\.addEventListener/);
 const {ctx,events}=registry();assert.equal(ctx.EMFDFeatures.activate('daily','P08'),true);
 assert.ok(events.some(x=>x.join('|')==='begin|O06|#teezimmer'));
});
test('shared card navigation remembers the source room',()=>{
 const {ctx,events}=registry();assert.equal(ctx.EMFDFeatures.activate('cards','P03'),true);
 assert.equal(ctx.location.hash,'karten');
 assert.equal(ctx.EMFDFeatures.getOrigin().route,'#ort/P03');
 assert.ok(events.some(x=>x.join('|')==='return|#ort/P03'));
});
test('one shared reader is exposed for card details and stories, five sizes are kept',()=>{
 const app=read('app.js'),reading=read('book-reading.js');
 assert.match(app,/window\.EMFDReader=Object\.freeze/);
 assert.match(app,/window\.EMFDCardBook=Object\.freeze/);
 assert.match(reading,/sizes=\[16,18,20,23,26\]/);
 assert.match(reading,/set:setSize,mount/);
 assert.match(html,/reading-preferences\.js\?v=0\.6\.64/);
});
test('design system loaded last and uses a single action typography scale',()=>{
 assert.ok(html.indexOf('design-system-v0.6.64.css')>html.indexOf('desktop-layout.css'));
 assert.match(styles,/--emfd-text-action:1rem/);
 assert.match(styles,/--emfd-touch:48px/);
 assert.match(styles,/var\(--book-font-size\)!important/);
 assert.equal((html.match(/reading-preferences\.js/g)||[]).length,1);
});
test('start elements are a six-identity same-motif image group, never other cards',()=>{
 const cat=JSON.parse(read('media-catalog.json'));
 for(let i=1;i<=6;i++){
  const id='A0'+i,group=cat.groups.find(x=>x.id==='start02-'+id);
  assert.ok(group);assert.equal(group.paths.length,4);
  assert.ok(group.paths.every(x=>x.includes('EMFD-START-02-'+id+'-')&&!/O\d\d/.test(x)));
 }
 const core=require(path.join(root,'media-core.js'));
 const groups=core.groups({assets:[{path:'/media/start/EMFD-START-02-A04-herzsiegel.webp'},{path:'/media/cards/O12.png',cardId:'O12'}]});
 assert.equal(groups.length,2);
 assert.ok(groups.some(x=>x.id==='start02-A04'));
});
test('image recovery is actually linked to START-02 and can retry after uploading',()=>{
 const start=read('start-gate.js');assert.match(start,/root\.EMFDMedia\?\.resolve/);
 assert.match(start,/function retryMissing/);assert.match(start,/data-start02-retry/);
 assert.match(start,/preload\(\[ASSETS\.A01,ASSETS\.A02,ASSETS\.A03,ASSETS\.A04,ASSETS\.A05,ASSETS\.A06\]\)/);
 assert.match(read('image-service-worker.js'),/emfd-images-recovery-v8/);
});
test('PWA installation metadata retains domain root and correct app name',()=>{
 const manifest=JSON.parse(read('manifest.webmanifest'));
 const packageVersion=JSON.parse(read('package.json')).version;
 assert.equal(manifest.name,'Haus der kleinen Wunder');assert.equal(manifest.version,packageVersion);
 assert.equal(manifest.start_url,'/wunderhaus/home/');
 assert.match(html,/apple-mobile-web-app-title" content="Haus der kleinen Wunder"/);
});

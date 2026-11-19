const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const home=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(home,f),'utf8');
test('PERF01 compatibility facade never starts a whole-deck download or creates Blob URLs',async()=>{
 const context={};vm.runInNewContext(read('card-preload.js'),context);
 const result=await context.EMFDCardAssets.initialize([{image:'original.png'}]);
 assert.equal(result.downloaded,0);assert.equal(await context.EMFDCardAssets.hydrate({}),false);
});
test('PERF01 assigns explicit profiles for all cards before rendering',()=>{
 const context={CARDS:Array.from({length:24},(_,i)=>({id:'O'+String(i+1).padStart(2,'0')})),navigator:{},location:{protocol:'file:'}};
 vm.runInNewContext(read('image-profiles.js'),context);
 for(const c of context.CARDS){assert.match(c.image,/630x1080/);assert.match(c.imageOverview,/210x360/);assert.match(c.imageDetail,/896x1536/);}
 const html=read('index.html');assert.ok(html.indexOf('data.js')<html.indexOf('image-profiles.js'));assert.ok(html.indexOf('image-profiles.js')<html.indexOf('app.js'));
});
// EMFD-CACHE-01: Der begrenzte PERF-01-Bildcache (20 MB, Musik ignoriert) ist ersetzt.
// Wiederverwendung, Musikbehandlung und Speicherpolitik prüft tests/cache-01-offline.test.cjs.
test('PERF01 worker list contains no music',()=>{
 const list=vm.runInNewContext(read('offline-images.js')+';EMFDOfflineImages',{});
 assert.ok([...list.start,...list.house].every(u=>!/\.mp3$/.test(u)));
});

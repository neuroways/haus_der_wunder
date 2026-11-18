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
test('PERF01 worker reuses stored images, ignores music, and bounds storage',async()=>{
 const map=new Map(),handlers={},origin='https://example.test/moments/home/image-service-worker.js';let fetched=0;
 const key=r=>typeof r==='string'?r:r.url;
 const cache={async match(r){return map.get(key(r))?.clone()},async put(r,v){map.set(key(r),v.clone())},async keys(){return [...map.keys()].map(url=>({url}))},async delete(r){return map.delete(key(r))}};
 const context={URL,Headers,Response,console,caches:{async open(){return cache},async keys(){return ['emfd-card-media-old','unrelated']},async delete(name){assert.notEqual(name,'unrelated')}},fetch:async()=>{fetched++;return new Response(new Uint8Array(400*1024),{headers:{'Content-Type':'image/webp'}})},self:{location:{href:origin},clients:{async claim(){}},async skipWaiting(){},addEventListener(type,fn){handlers[type]=fn}}};
 vm.runInNewContext(read('image-service-worker.js'),context);
 const urls=vm.runInNewContext('[...allowed]',context);assert.ok(urls.every(u=>!u.endsWith('.mp3')));
 async function request(url){let promise,wait=[];handlers.fetch({request:{url,method:'GET'},respondWith(p){promise=p},waitUntil(p){wait.push(p)}});if(!promise)return null;const result=await promise;await Promise.all(wait);return result;}
 await request(urls[0]);const n=fetched;await request(urls[0]);assert.equal(fetched,n,'second request must hit image cache');
 for(const u of urls.slice(1,65))await request(u);
 let total=0;for(const r of map.values())total+=Number(r.headers.get('X-EMFD-Bytes'));assert.ok(total<=20*1024*1024);assert.ok(map.size<=80);
 assert.equal(await request('https://example.test/moments/media/audio/THEME.mp3'),null);
});

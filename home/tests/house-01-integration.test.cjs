const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const home=path.resolve(__dirname,'..');
const app=fs.readFileSync(path.join(home,'app.js'),'utf8');
const cards=JSON.parse(fs.readFileSync(path.join(home,'data.js'),'utf8').replace(/^window\.CARDS=/,'').replace(/;\s*$/,''));
function renderRoute(hash,atelier){
 // The library shelf is part of the markup that renderRoom just wrote, so a browser always finds it.
 const shelf={innerHTML:''};
 const main={innerHTML:'',focus(){},querySelector(sel){return sel==='#emfd-library-root'&&main.innerHTML.includes('id="emfd-library-root"')?shelf:null;},querySelectorAll(){return [];}};
 const dialog={addEventListener(){},setAttribute(){},showModal(){},close(){},focus(){},querySelector(){return null;},className:'',innerHTML:'',open:false};
 const ctl={onclick:null};
 const document={body:{classList:{toggle(){},add(){},remove(){},contains(){return false;}},appendChild(node){return node;}},head:{append(){}},title:'',querySelector(sel){return sel==='main'?main:sel==='.skip'||sel==='#quiet'?ctl:null;},querySelectorAll(){return [];},createElement(){return Object.assign({},dialog);},addEventListener(){}};
 const navModule=require('../shared/navigation.js');let navHash=hash;const nav=navModule.createNavigation({getHash:()=>navHash,setHash:value=>{navHash=value;}});
 const window={EMFDRegistry:require('../shared/registry.js'),EMFDNavigation:{...nav,backLinkMarkup:(fallback,className)=>navModule.backLinkHTML(nav,fallback,className)},EMFDAtelier:atelier,matchMedia(){return {matches:false,addEventListener(){}};},addEventListener(){},scrollTo(){}};
 const location={hash};
 vm.runInNewContext(app,{document,window,location,CARDS:cards,console,ResizeObserver:undefined},{filename:'app.js'});
 return {html:main.innerHTML,window};
}
test('HOUSE-01 Flur has room directory link and keeps existing accesses',()=>{
 const {html}=renderRoute('#flur');
 for(const target of ['#raeume','#atelier','#teezimmer','#musik'])assert.ok(html.includes(`href="${target}"`),target);
 assert.match(html,/hall-light-toggle/);
 assert.match(html,/data-start-gift-open/);
});
test('HOUSE-01 directory contains P01–P08, music and lightweight previews',()=>{
 const {html,window}=renderRoute('#raeume');
 for(let i=1;i<=8;i++)assert.match(html,new RegExp(`P${String(i).padStart(2,'0')}`));
 for(const link of ['#ort/P01','#ort/P02','#ort/P03','#atelier','#ort/P05','#ort/P06','#ort/P07','#teezimmer','#musik'])assert.ok(html.includes(`href="${link}"`),link);
 assert.equal((html.match(/class="room-tile(?: room-tile--music)?"/g)||[]).length,9);
 assert.equal((html.match(/-thumb\.webp/g)||[]).length,9);
 assert.equal(window.EMFDHouse.rooms.length,8);
 assert.deepEqual(Array.from(window.EMFDHouse.categories),['Ruhe','Kraft','Halt','Freude']);
 assert.equal(window.EMFDHouse.connections.length,0);
});
test('HOUSE-01 six basic rooms contain their original image, way back and accessible group entry',()=>{
 const names={P01:'Fensterzimmer',P02:'Bibliothek',P03:'Wintergarten',P05:'Innenhof',P06:'Galerie',P07:'Dachterrasse'};
 for(const [id,name] of Object.entries(names)){
  const {html}=renderRoute(`#ort/${id}`);
  assert.match(html,new RegExp(`id="room-title">${name}`),id);
  const hero=html.match(new RegExp(`src="(\\.\\.\\/media\\/(?:optimized\\/)?rooms\\/${id}-[^\"]+\\.webp)"`));
  assert.ok(hero,id);
  assert.ok(fs.existsSync(path.resolve(home,hero[1])),hero[1]);
  // NAV-01: exactly one context back link; direct call without origin falls back to all rooms.
  assert.equal((html.match(/data-emfd-back(?=[\s>])/g)||[]).length,1,id+' one back link');
  assert.ok(html.includes('href="#raeume"'),id+' back to all rooms');
  assert.doesNotMatch(html,/Zum Flur/,id);
  for(const group of ['Ruhe','Kraft','Halt','Freude'])assert.ok(html.includes(`data-house-category="${group}"`),id+' '+group);
  assert.doesNotMatch(html,/Baustelle|noch nicht fertig|Platzhaltergeschichte/);
 }
});
test('HOUSE-01 P04 and P08 use advanced renderers; no new P09',()=>{
 let called=0;
 renderRoute('#ort/P04',{renderAtelier(){called++;}});
 assert.equal(called,1);
 assert.doesNotMatch(app,/id:'P09'/);
});
test('HOUSE-01 thumbnail files exist and their original room media remain separate',()=>{
 const rooms=path.resolve(home,'../media/rooms');
 for(const file of ['P01-fensterzimmer','P02-bibliothek','P03-wintergarten','P04-atelier','P05-innenhof','P06-galerie','P07-dachterrasse','P08-teezimmer','musikzimmer-v1']){
  const thumb=fs.readFileSync(path.join(rooms,'thumbs',file+'-thumb.webp'));
  assert.equal(thumb.toString('ascii',0,4),'RIFF');
  assert.equal(thumb.toString('ascii',8,12),'WEBP');
  assert.ok(fs.existsSync(path.join(rooms,file+'.webp')),file);
  assert.ok(thumb.length<fs.statSync(path.join(rooms,file+'.webp')).size,file);
 }
});
test('HOUSE-01 category entry selects existing Atelier filter without second card registry',()=>{
 const store=new Map();
 const ctx={globalThis:null,sessionStorage:{getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value),removeItem:key=>store.delete(key)}};
 ctx.globalThis=ctx;
 vm.runInNewContext(fs.readFileSync(path.join(home,'atelier.js'),'utf8'),ctx);
 assert.equal(ctx.EMFDAtelier.selectGroup('Kraft'),true);
 assert.equal(store.get('emfd.atelier.group'),'Kraft');
 assert.equal(ctx.EMFDAtelier.selectGroup('gibts-nicht'),false);
});

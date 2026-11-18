const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const Session=require('../audio-session.js');
class Element{
 constructor(){this.value='';this.dataset={};this.attrs={};this.classList={toggle(){},add(){}};this.open=false;this.children=[];this.textContent='';this.hidden=false;}
 setAttribute(k,v){this.attrs[k]=v;}getAttribute(k){return this.attrs[k];}addEventListener(){}append(...items){this.children.push(...items);}before(){}focus(){}querySelector(){return null;}querySelectorAll(){return [];}showModal(){this.open=true;}close(){this.open=false;}replaceChildren(...x){this.children=x;}click(){this.onclick?.();}
}
class Audio extends EventTarget{constructor(){super();this.calls=0;this.paused=true;}load(){}removeAttribute(){}pause(){this.paused=true;}play(){this.paused=false;this.calls++;return Promise.resolve();}}
async function setup(mode='matching'){
 const nodes=new Map(),handlers={};const node=k=>{if(!nodes.has(k))nodes.set(k,new Element());return nodes.get(k);};
 const storage=new Map([['emfd.music.mode',mode]]);
 const tracks=[{assetId:'O01',cardId:'O01',path:'../media/audio/O01.mp3',family:'O01',variant:'A',title:'Sessel'},{assetId:'O02',cardId:'O02',path:'../media/audio/O02.mp3',family:'O02',variant:'A',title:'Vorhang'}];
 const context={EMFDAudioSession:Session,Audio,navigator:{userAgent:'Desktop',platform:'',maxTouchPoints:0},location:{hash:'#karte/O01'},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},document:{querySelector:node,querySelectorAll:()=>[],createElement:()=>new Element(),createTextNode:x=>x,body:new Element(),addEventListener(){}},window:{addEventListener:(k,fn)=>handlers[k]=fn},fetch:async url=>({ok:true,json:async()=>url.startsWith('music-manifest')?{tracks}:{cards:{O01:'O01',O02:'O02'}}})};
 vm.runInNewContext(fs.readFileSync(require.resolve('../music-player.js'),'utf8'),context);
 await new Promise(r=>setImmediate(r));return {player:context.window.EMFDMusic,node,context,handlers};
}
test('card sound can start from a fresh individual mode with no prior selection',async()=>{const {player}=await setup('individual');player.setEnabled(true);await Promise.resolve();assert.equal(player.session.track.cardId,'O01');assert.equal(player.session.state,'playing');});
test('manual Start clears a previous pause so the next revealed card can play',async()=>{const {player,node}=await setup();player.setEnabled(true);await Promise.resolve();node('#music-pause').click();node('#music-play').click();await Promise.resolve();player.revealCard('O02');await Promise.resolve();assert.equal(player.session.track.cardId,'O02');assert.equal(player.session.state,'playing');});
test('switching from a card to a normal room does not interrupt matching music',async()=>{const {player,context,handlers}=await setup();player.setEnabled(true);await Promise.resolve();const audio=player.session.audio;context.location.hash='#flur';handlers.hashchange();assert.equal(player.session.state,'playing');assert.equal(player.session.audio,audio);});
test('silence remains silent until the user explicitly enables card sound',async()=>{const {player,node}=await setup();node('#music-silence').click();assert.equal(player.globalSilence,true);player.revealCard('O01');assert.equal(player.session.state,'silent');player.setEnabled(true);await Promise.resolve();assert.equal(player.globalSilence,false);assert.equal(player.session.state,'playing');});

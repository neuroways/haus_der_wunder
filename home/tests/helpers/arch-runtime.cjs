const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const home=path.resolve(__dirname,'../..');
class Element{
 constructor(){this.value='';this.dataset={};this.attrs={};this.classList={toggle(){},add(){},remove(){}};this.open=false;this.children=[];this.textContent='';this.hidden=false;this.isConnected=true;this.events={};}
 setAttribute(k,v){this.attrs[k]=v;}getAttribute(k){return this.attrs[k];}addEventListener(k,fn){(this.events[k]??=[]).push(fn);}append(...items){this.children.push(...items);}before(){}focus(){}querySelector(){return null;}querySelectorAll(){return [];}showModal(){this.open=true;}close(){this.open=false;}replaceChildren(...x){this.children=x;}click(){this.onclick?.();for(const fn of this.events.click||[])fn({});}
}
async function runtime(options={}){
 const nodes=new Map(),handlers={},storage=new Map(),requests=[];let created=0;
 const node=k=>{if(!nodes.has(k))nodes.set(k,new Element());return nodes.get(k);};
 class Audio extends EventTarget{constructor(){super();created++;this.calls=0;this.paused=true;this.currentTime=0;}load(){}removeAttribute(){}pause(){this.paused=true;}play(){this.calls++;this.paused=false;return Promise.resolve();}}
 const context={EMFDAudioSession:require('../../audio-session.js'),Audio,console,Event,CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail;}},navigator:{userAgent:'Desktop',platform:'',maxTouchPoints:0},location:{hash:'#musik'},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},document:{querySelector:node,querySelectorAll:()=>[],createElement:()=>new Element(),createTextNode:x=>x,body:new Element(),addEventListener(){}},addEventListener:(k,fn)=>(handlers[k]??=[]).push(fn),dispatchEvent:event=>{for(const fn of handlers[event.type]||[])fn(event);},fetch:async(url,init)=>{requests.push([url,init?.method||'GET']);if(init?.method==='HEAD')return {ok:!options.missing,status:options.missing?404:200};return {ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join(home,url.split('?')[0]),'utf8'))};}};
 context.window=context;context.globalThis=context;
 const run=name=>vm.runInNewContext(fs.readFileSync(path.join(home,name),'utf8'),context,{filename:name});
 run('music-discovery.js');run('shared/content.js');run('shared/audio.js');
 const {createNavigation}=require('../../shared/navigation.js');context.EMFDNavigation=createNavigation({getHash:()=>context.location.hash,setHash:hash=>{context.location.hash=hash;}});
 run('music-player.js');await new Promise(resolve=>setImmediate(resolve));
 const navigate=hash=>{context.location.hash=hash;context.EMFDNavigation.observe(hash);context.dispatchEvent({type:'hashchange'});};
 return {context,player:context.EMFDMusic,port:context.EMFDAudio,node,requests,navigate,run,get audioCount(){return created;}};
}
module.exports={runtime,Element,home};

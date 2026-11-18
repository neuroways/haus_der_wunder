/* EMFD-ARCH-01, contract v1. Hash router adapter; never owns audio or room DOM. */
(function(root){
 'use strict';
 const cardId=id=>typeof id==='string'&&/^O(?:0[1-9]|1\d|2[0-4])$/.test(id);
 function route(value){
   if(typeof value!=='string')return null;
   const hash=value.startsWith('#')?value:'#'+value;
   return /^#(?:ankommen|flur|haus|raeume|karten|atelier|teezimmer|musik|musik\/playlist|musik\/geschichten|ort\/P0[1-8]|karte\/verdeckt)$/.test(hash)||
     (/^#atelier\/tisch\/O\d{2}$/.test(hash)&&cardId(hash.split('/')[2]))||
     (/^#karte\/O\d{2}(?:\/frage)?$/.test(hash)&&cardId(hash.split('/')[1]))||
     (/^#musik\/geschichten\/O\d{2}$/.test(hash)&&cardId(hash.split('/')[2]))?hash:null;
 }
 function station(value){
   const hash=route(value);if(!hash)return null;
   if(hash==='#musik')return 'gramophone';
   if(hash==='#musik/playlist')return 'records';
   if(hash.startsWith('#musik/geschichten'))return 'compositions';
   if(hash==='#ort/P02')return 'library';
   if(hash==='#ort/P04')return 'atelier';
   if(hash==='#ort/P08')return 'teezimmer';
   if(hash==='#flur'||hash==='#haus')return 'hall';
   if(hash==='#karten'||hash.startsWith('#karte/'))return 'cards';
   return hash.slice(1).split('/')[0]==='ort'?hash.slice(1):hash.slice(1).split('/')[0];
 }
 const musicStations=new Set(['gramophone','records','compositions']);
 function transition(from,to){
   const a=station(from),b=station(to);
   return a===b||(musicStations.has(a)&&musicStations.has(b))?'station':'door';
 }
 function createNavigation(env){
   let current=route(env.getHash())||'#ankommen',pending=null,sequence=0;
   let context=Object.freeze({version:1,id:0,from:null,to:current,origin:current,kind:'entry',door:false,returnTo:'#flur'});
   const trail=[],listeners=new Set(),positions=new Map();
   function capture(trigger){positions.set(current,env.capture?.(trigger)||{});}
   function observe(value){
     const target=route(value);if(!target)return null;
     if(target===current){pending=null;return context;}
     const from=current,request=pending?.to===target?pending:null;pending=null;
     const index=trail.map(frame=>frame.to).lastIndexOf(target);
     const returning=request?.kind==='return'||index>=0||trail.at(-1)?.from===target;
     const kind=returning?'return':request?.kind||transition(from,target);
     let origin=request?.origin||(transition(from,target)==='station'?context.origin:from);
     let returnTo=route(request?.returnTo)||from;
     if(index>=0){origin=trail[index].origin;returnTo=trail[index].returnTo;trail.splice(index+1);}
     else if(returning&&trail.length&&trail.at(-1).from===target)trail.pop();
     if(returning&&index<0)returnTo=trail.at(-1)?.returnTo||'#flur';
     context=Object.freeze({version:1,id:++sequence,from,to:target,origin,kind,door:transition(from,target)==='door',returnTo});
     if(!returning)trail.push(context);
     if(trail.length>64)trail.shift();
     current=target;
     for(const listener of [...listeners]){try{listener(context);}catch(error){env.report?.(error);}}
     env.emit?.(context);return context;
   }
   function go(value,options={}){
     const target=route(value);if(!target)return false;
     if(target===current&&route(env.getHash())===current)return true;
     capture(options.trigger);
     pending={to:target,kind:['door','station','return'].includes(options.kind)?options.kind:transition(current,target),origin:route(options.origin),returnTo:route(options.returnTo)};
     env.setHash(target);return true;
   }
   function returnRoute(fallback='#flur'){
     const candidate=route(context.returnTo);
     return context.kind!=='entry'&&candidate&&candidate!==current?candidate:route(fallback)||'#flur';
   }
   function back(fallback='#flur'){return go(returnRoute(fallback),{kind:'return'});}
   function ready(){if(context.kind==='return')env.restore?.(positions.get(current)||{},context);}
   return Object.freeze({version:1,route,station,transition,go,back,returnRoute,observe,ready,capture,getContext:()=>context,
     subscribe(listener){listeners.add(listener);return ()=>listeners.delete(listener);}});
 }
 if(typeof module!=='undefined')module.exports={createNavigation,route,station,transition,cardId};
 else{
   const api=createNavigation({getHash:()=>root.location.hash,setHash:hash=>{root.location.hash=hash;},
     capture(trigger){const el=trigger||document.activeElement,main=document.querySelector('main');return {focusId:el?.id,href:el?.getAttribute?.('href'),book:el?.dataset?.book,action:el?.dataset?.action,x:root.scrollX,y:root.scrollY,mainX:main?.scrollLeft||0,mainY:main?.scrollTop||0};},
     restore(position,context){root.requestAnimationFrame(()=>{if(api.getContext().id!==context.id)return;const el=document.getElementById(position.focusId)||[...document.querySelectorAll('a[href],[data-book]')].find(el=>position.book?el.dataset.book===position.book&&el.dataset.action===position.action:position.href&&el.getAttribute('href')===position.href)||document.querySelector('main');el?.focus({preventScroll:true});const main=document.querySelector('main');if(main){main.scrollLeft=position.mainX||0;main.scrollTop=position.mainY||0;}root.scrollTo(position.x||0,position.y||0);});},
     emit:context=>root.dispatchEvent(new CustomEvent('emfd:navigation',{detail:context})),report:error=>console.error(error)});
   root.EMFDNavigation=api;
   root.addEventListener('hashchange',()=>api.observe(root.location.hash));
   // Observe native links too. Existing feature handlers keep their gestures.
   document.addEventListener('click',event=>{
     if(event.defaultPrevented||event.button>0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
     const link=event.target.closest?.('a[href^="#"]');
     if(!link||link.hasAttribute('download')||link.target)return;
     const target=route(link.getAttribute('href'));if(!target)return;
     api.capture(link);
     // The next native hashchange is classified by observe; no synthetic click.
   },true);
 }
})(globalThis);

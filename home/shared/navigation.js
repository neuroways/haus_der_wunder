/* EMFD-ARCH-01, contract v1 + EMFD-NAV-01. Hash router adapter; never owns audio or room DOM.
 * NAV-01 adds: one context back link per view (target name + arrow), fallbacks per view,
 * and a mirror of the browser history so the app back uses history.back() when its
 * target is the previous entry, otherwise replaces the current entry (no extra push). */
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
 // Places of the house (spatial context). Cards, gallery, stories and dialogs are transient views.
 function place(value){
   const hash=route(value);if(!hash)return null;
   if(hash==='#flur'||hash==='#haus')return 'flur';
   if(hash==='#raeume')return 'raeume';
   if(hash==='#ankommen')return 'ankommen';
   if(hash==='#musik')return 'musik';
   if(hash==='#atelier'||hash==='#ort/P04'||hash.startsWith('#atelier/tisch/'))return 'P04';
   if(hash==='#teezimmer'||hash==='#ort/P08')return 'P08';
   const match=hash.match(/^#ort\/(P0[1-8])$/);return match?match[1]:null;
 }
 // Steps inside the same view (e.g. turning through the atelier gallery) share one back target.
 function viewKey(value){
   const hash=route(value);if(!hash)return null;
   if(hash==='#haus')return '#flur';
   if(hash==='#ort/P04'||hash.startsWith('#atelier'))return '#atelier';
   if(hash==='#ort/P08')return '#teezimmer';
   if(hash.startsWith('#musik/geschichten'))return '#musik/geschichten';
   if(hash==='#karte/verdeckt')return '#karte';
   if(hash.startsWith('#karte/'))return '#karte';
   return hash;
 }
 function sameView(a,b){
   const ka=viewKey(a),kb=viewKey(b);if(!ka||ka!==kb)return false;
   if(ka!=='#karte')return true;
   // Different cards are different views; the concealed draw becomes its revealed card.
   const id=value=>route(value)==='#karte/verdeckt'?'*':route(value).split('/')[1];
   const ia=id(a),ib=id(b);return ia==='*'||ib==='*'||ia===ib;
 }
 // Matrix EMFD-NAV-01: fallback when there is no valid origin.
 function fallbackFor(value){
   const hash=route(value);
   if(!hash)return '#flur';
   if(hash==='#raeume'||hash==='#karten'||hash==='#musik')return '#flur';
   if(/^#ort\/P0[1-8]$/.test(hash)||hash==='#atelier'||hash==='#teezimmer'||hash.startsWith('#atelier/tisch/'))return '#raeume';
   if(hash==='#musik/playlist'||hash.startsWith('#musik/geschichten'))return '#musik';
   if(hash.startsWith('#karte/'))return '#karten';
   return '#flur';
 }
 const ROOM_NAMES=Object.freeze({P01:['Fensterzimmer','zum'],P02:['Bibliothek','zur'],P03:['Wintergarten','zum'],P04:['Atelier','zum'],P05:['Innenhof','zum'],P06:['Galerie','zur'],P07:['Dachterrasse','zur'],P08:['Teezimmer','zum']});
 // [visible name, accessible "Zurück …" phrase]
 function describe(value,cards=root.CARDS){
   const hash=route(value);if(!hash)return ['Flur','Zurück zum Flur'];
   const room=place(hash);
   if(room&&ROOM_NAMES[room]){const [name,article]=ROOM_NAMES[room];return [name,`Zurück ${article} ${name}`];}
   if(hash==='#flur'||hash==='#haus')return ['Flur','Zurück zum Flur'];
   if(hash==='#raeume')return ['Alle Räume','Zurück zur Übersicht aller Räume'];
   if(hash==='#ankommen')return ['Anfang','Zurück zum Anfang'];
   if(hash==='#musik')return ['Musikzimmer','Zurück zum Musikzimmer'];
   if(hash==='#musik/playlist')return ['Plattensammlung','Zurück zur Plattensammlung'];
   if(hash.startsWith('#musik/geschichten'))return ['Kompositionsgeschichten','Zurück zu den Kompositionsgeschichten'];
   if(hash==='#karten')return ['Kartengalerie','Zurück zur Kartengalerie'];
   if(hash==='#karte/verdeckt')return ['Verdeckte Karte','Zurück zur verdeckten Karte'];
   if(hash.startsWith('#karte/')){const id=hash.split('/')[1],name=(cards||[]).find?.(card=>card.id===id)?.name;return name?[name,`Zurück zur Karte „${name}“`]:['Karte','Zurück zur Karte'];}
   return ['Flur','Zurück zum Flur'];
 }
 function createNavigation(env){
   let current=route(env.getHash())||'#ankommen',pending=null,sequence=0;
   const initialReturn=route(env.initialReturn?.(current));
   let context=Object.freeze({version:1,id:0,from:null,to:current,origin:current,kind:'entry',door:false,returnTo:initialReturn&&initialReturn!==current?initialReturn:'#flur'});
   let restoredReturn=Boolean(initialReturn&&initialReturn!==current);
   const trail=[],listeners=new Set(),positions=new Map();
   function capture(trigger){positions.set(current,env.capture?.(trigger)||{});}
   function observe(value){
     const target=route(value);if(!target)return null;
     if(target===current){pending=null;return context;}
     const from=current,request=pending?.to===target?pending:null;pending=null;restoredReturn=false;
     const index=trail.map(frame=>frame.to).lastIndexOf(target);
     const returning=request?.kind==='return'||index>=0||trail.at(-1)?.from===target;
     const kind=returning?'return':request?.kind||transition(from,target);
     let origin=request?.origin||(transition(from,target)==='station'?context.origin:from);
     let returnTo=route(request?.returnTo)||from;
     if(index>=0){origin=trail[index].origin;returnTo=trail[index].returnTo;trail.splice(index+1);}
     else if(returning&&trail.length&&trail.at(-1).from===target)trail.pop();
     if(returning&&index<0)returnTo=trail.at(-1)?.returnTo||fallbackFor(target);
     // NAV-01: stepping inside one view keeps the back target of the view.
     if(!returning&&sameView(from,target)){returnTo=context.returnTo;origin=context.origin;}
     context=Object.freeze({version:1,id:++sequence,from,to:target,origin,kind,door:transition(from,target)==='door',returnTo});
     if(!returning)trail.push(context);
     if(trail.length>64)trail.shift();
     current=target;
     for(const listener of [...listeners]){try{listener(context);}catch(error){env.report?.(error);}}
     env.emit?.(context);return context;
   }
   // A replaced URL (e.g. concealed card revealed) keeps its place and back target.
   function replace(value){
     const target=route(value);if(!target||target===current)return false;
     const frame=trail.at(-1);
     context=Object.freeze({...context,to:target});
     if(frame&&frame.to===current)trail[trail.length-1]=context;
     current=target;env.replaceHash?.(target);return true;
   }
   function go(value,options={}){
     const target=route(value);if(!target)return false;
     if(target===current&&route(env.getHash())===current)return true;
     capture(options.trigger);
     pending={to:target,kind:['door','station','return'].includes(options.kind)?options.kind:transition(current,target),origin:route(options.origin),returnTo:route(options.returnTo)};
     env.setHash(target);return true;
   }
   function returnRoute(fallback){
     const safeFallback=route(fallback)||fallbackFor(current);
     const candidate=route(context.returnTo);
     const valid=candidate&&candidate!==current&&!sameView(candidate,current)&&(context.kind!=='entry'||restoredReturn);
     return valid?candidate:safeFallback!==current?safeFallback:'#flur';
   }
   function back(fallback){
     const target=returnRoute(fallback);
     capture();
     if(env.historyBack){pending={to:target,kind:'return',origin:null,returnTo:null};env.historyBack(target);return true;}
     return go(target,{kind:'return'});
   }
   function backLink(fallback){const target=returnRoute(fallback),[name,label]=describe(target);return {target,name,label};}
   function ready(){if(context.kind==='return')env.restore?.(positions.get(current)||{},context);}
   return Object.freeze({version:1,route,station,transition,place,viewKey,sameView,fallbackFor,describe,go,back,backLink,replace,returnRoute,observe,ready,capture,getContext:()=>context,
     subscribe(listener){listeners.add(listener);return ()=>listeners.delete(listener);}});
 }
 /* Mirror of the browser history for this tab. Each entry gets its index in history.state,
  * so Back/Forward (popstate + hashchange) are recognised as traversal and never re-pushed. */
 function createHistoryMirror(io){
   let entries=[],index=0,replacing=false;
   const valid=state=>state&&Number.isInteger(state.emfdNav)&&state.emfdNav>=0;
   function save(){io.save?.({entries,index});}
   function mark(){io.setState({...(io.getState()||{}),emfdNav:index});}
   function init(currentRoute){
     const state=io.getState(),saved=io.load?.();
     if(valid(state)&&saved&&Array.isArray(saved.entries)&&saved.entries[state.emfdNav]===currentRoute){entries=saved.entries.slice();index=state.emfdNav;}
     else{entries=[currentRoute];index=0;}
     mark();save();
   }
   function track(currentRoute){
     const state=io.getState();
     if(replacing){replacing=false;entries[index]=currentRoute;}
     else if(valid(state)){index=state.emfdNav;entries[index]=currentRoute;}
     else{index=entries.length?index+1:0;entries.length=index;entries[index]=currentRoute;}
     mark();save();
   }
   function replaceCurrent(currentRoute){entries[index]=currentRoute;mark();save();}
   function stepsBackTo(target,current){
     let j=index-1;
     while(j>=0&&sameView(entries[j],current))j--;
     return j>=0&&entries[j]===target?index-j:0;
   }
   function back(target){
     const current=entries[index],steps=stepsBackTo(target,current);
     if(steps>0){io.go(-steps);return 'history';}
     replacing=true;io.replace(target);return 'replace';
   }
   return Object.freeze({init,track,back,replaceCurrent,get entries(){return entries.slice();},get index(){return index;}});
 }
 const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 /* The one context back link. Visible: arrow + target name. Accessible: "Zurück zum …". */
 function backLinkHTML(nav,fallback,className='back'){
   const {target,name,label}=nav.backLink(fallback);
   return `<a class="${esc(className)} emfd-back" href="${esc(target)}" data-emfd-back${fallback?` data-emfd-back-fallback="${esc(fallback)}"`:''} aria-label="${esc(label)}"><img class="emfd-back-icon" src="assets/music-icons/arrow-left.svg" alt="" aria-hidden="true" width="20" height="20"><span class="emfd-back-name">${esc(name)}</span></a>`;
 }
 if(typeof module!=='undefined')module.exports={createNavigation,createHistoryMirror,backLinkHTML,route,station,transition,place,viewKey,sameView,fallbackFor,describe,cardId};
 else{
   const MIRROR_KEY='emfd.nav.history.v1';
   const mirror=createHistoryMirror({
     getState:()=>root.history.state,
     setState:state=>{try{root.history.replaceState(state,'');}catch{}},
     go:delta=>root.history.go(delta),
     replace:hash=>root.location.replace(hash),
     load:()=>{try{return JSON.parse(root.sessionStorage.getItem(MIRROR_KEY)||'null');}catch{return null;}},
     save:value=>{try{root.sessionStorage.setItem(MIRROR_KEY,JSON.stringify(value));}catch{}}
   });
   const startRoute=route(root.location.hash)||'#ankommen';
   mirror.init(startRoute);
   const api=createNavigation({getHash:()=>root.location.hash,setHash:hash=>{root.location.hash=hash;},
     // After a reload the previous entry of this tab is a real origin, not a guess.
     initialReturn:()=>mirror.index>0?mirror.entries[mirror.index-1]:null,
     historyBack:target=>mirror.back(target),
     replaceHash:hash=>{try{root.history.replaceState(root.history.state,'',hash);}catch{}mirror.replaceCurrent(hash);},
     capture(trigger){const el=trigger||document.activeElement,main=document.querySelector('main');return {focusId:el?.id,href:el?.getAttribute?.('href'),book:el?.dataset?.book,action:el?.dataset?.action,x:root.scrollX,y:root.scrollY,mainX:main?.scrollLeft||0,mainY:main?.scrollTop||0};},
     restore(position,context){root.requestAnimationFrame(()=>{if(api.getContext().id!==context.id)return;const el=document.getElementById(position.focusId)||[...document.querySelectorAll('a[href],[data-book]')].find(el=>position.book?el.dataset.book===position.book&&el.dataset.action===position.action:position.href&&el.getAttribute('href')===position.href)||document.querySelector('main');el?.focus({preventScroll:true});const main=document.querySelector('main');if(main){main.scrollLeft=position.mainX||0;main.scrollTop=position.mainY||0;}root.scrollTo(position.x||0,position.y||0);});},
     emit:context=>root.dispatchEvent(new CustomEvent('emfd:navigation',{detail:context})),report:error=>console.error(error)});
   root.EMFDNavigation=Object.freeze({...api,backLinkMarkup:(fallback,className)=>backLinkHTML(api,fallback,className)});
   root.addEventListener('hashchange',()=>{const hash=route(root.location.hash);if(hash)mirror.track(hash);api.observe(root.location.hash);});
   // Observe native links too. Existing feature handlers keep their gestures.
   document.addEventListener('click',event=>{
     if(event.defaultPrevented||event.button>0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
     const link=event.target.closest?.('a[href^="#"]');
     if(!link||link.hasAttribute('download')||link.target)return;
     const target=route(link.getAttribute('href'));if(!target)return;
     api.capture(link);
     // The next native hashchange is classified by observe; no synthetic click.
   },true);
   // App back links: history.back() when the target is the previous entry, otherwise replace.
   document.addEventListener('click',event=>{
     if(event.defaultPrevented||event.button>0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
     const link=event.target.closest?.('[data-emfd-back]');if(!link)return;
     event.preventDefault();api.back(link.dataset.emfdBackFallback||undefined);
   });
 }
})(globalThis);

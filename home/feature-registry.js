/* EMFD-ARCH-01 · One feature implementation, multiple room entry points.
 * The registry describes availability and routes. It does not reimplement
 * cards, the player, books or the reader. All state remains in those modules.
 */
(function(root){
  'use strict';
  const features=Object.freeze({
    cards:Object.freeze({id:'cards',label:'Eine Karte aussuchen',icon:'cards',href:'#karten'}),
    daily:Object.freeze({id:'daily',label:'Tageskarte ziehen',icon:'cards',action:'draw'}),
    music:Object.freeze({id:'music',label:'Musik entdecken',icon:'music',href:'#musik'}),
    books:Object.freeze({id:'books',label:'Bücher entdecken',icon:'book',href:'#ort/P02'}),
    stories:Object.freeze({id:'stories',label:'Geschichten lesen',icon:'book',action:'story'})
  });
  // This is the only room-to-function assignment. Adding a room or moving a
  // feature requires an entry here, not a duplicate implementation.
  const roomFeatures=Object.freeze({
    P01:['cards','music'],P02:['stories','cards','music'],
    P03:['cards','music'],P04:['cards','daily','music'],
    P05:['cards','music'],P06:['stories','cards','music'],
    P07:['cards','music'],P08:['cards','daily']
  });
  const primaryNavigation=Object.freeze([
    {label:'Haus',iconName:'house',href:'#flur',tab:'haus'},
    {label:'Karten',iconName:'cards',href:'#karten',tab:'karten'},
    {label:'Musik',iconName:'music',href:'#musik',tab:'musik'}
  ]);
  let lastOrigin=null;
  const safeRoom=id=>Object.hasOwn(roomFeatures,String(id))?String(id):null;
  // EMFD-BOOK-01a: addresses of the rooms come from the room register.
  const registry=()=>root.EMFDRegistry||(typeof require==='function'?require('./shared/registry.js'):null);
  function roomRoute(id){return registry()?.room?.(id)?.route||`#ort/${id}`;}
  function roomFromHash(hash){
    const value='#'+String(hash||root.location.hash||'').replace(/^#/,'');
    const target=value.startsWith('#atelier/tisch/')?'#atelier':registry()?.redirect?.(value)||value;
    return safeRoom(registry()?.roomForRoute?.(target)?.id);
  }
  function list(roomId){return (roomFeatures[safeRoom(roomId)]||[]).map(id=>features[id]);}
  function remember(roomId){const id=safeRoom(roomId);if(id)lastOrigin={roomId:id,route:roomRoute(id)};}
  function getOrigin(){return lastOrigin?{...lastOrigin}:null;}
  function clearOrigin(){lastOrigin=null;}
  function randomCard(){
    const cards=(root.CARDS||[]).filter(c=>c.image);
    if(!cards.length)return null;
    if(root.crypto?.getRandomValues){const values=new Uint32Array(1),limit=Math.floor(4294967296/cards.length)*cards.length;do{root.crypto.getRandomValues(values);}while(values[0]>=limit);return cards[values[0]%cards.length];}
    return cards[Math.floor(Math.random()*cards.length)];
  }
  function activate(featureId,roomId,trigger){
    const feature=features[featureId];if(!feature)return false;
    const origin=safeRoom(roomId)||roomFromHash();if(origin)remember(origin);
    if(featureId==='daily'){
      const card=randomCard();if(!card)return false;
      root.EMFDAtelier?.rememberReturn?.(origin?roomRoute(origin):'#karten');
      root.EMFDCardDraw?.begin?.(card.id,origin?roomRoute(origin):'#karten');return true;
    }
    if(featureId==='stories'){
      root.EMFDReader?.open?.({type:'story',trigger});return true;
    }
    if(feature.href){
      if(featureId==='cards')root.EMFDAtelier?.rememberReturn?.(origin?roomRoute(origin):'#karten');
      if(root.location.hash===feature.href)root.dispatchEvent(new HashChangeEvent('hashchange'));
      else if(root.EMFDNavigation)root.EMFDNavigation.go(feature.href,{origin:origin?roomRoute(origin):undefined,trigger});
      else root.location.hash=feature.href.slice(1);
      return true;
    }
    return false;
  }
  function mountRoom(host,roomId){
    const id=safeRoom(roomId);if(!id||!host)return null;
    // Tea room has exactly two dedicated actions; Atelier has its own gallery.
    // Both actions still resolve to the shared registry through the delegation.
    if(id==='P08'||id==='P04')return null;
    host.querySelector('[data-house-feature-nav]')?.remove();
    const section=document.createElement('section');section.className='house-feature-section';
    section.setAttribute('aria-label','Funktionen in diesem Raum');section.dataset.houseFeatureNav=id;
    const title=document.createElement('h2');title.textContent='Was möchtest du hier entdecken?';section.append(title);
    const nav=document.createElement('nav');nav.className='house-feature-actions';nav.setAttribute('aria-label',`Funktionen im Raum ${id}`);
    for(const feature of list(id)){
      // A direct "Bücher entdecken" link in the library would point to itself.
        const button=document.createElement(feature.href?'a':'button');
      if(feature.href)button.href=feature.href;else button.type='button';
      button.dataset.houseFeature=feature.id;button.dataset.featureRoom=id;
      button.className='house-feature-action';button.textContent=feature.label;nav.append(button);
    }
    section.append(nav);
    const insertion=host.querySelector('.house-category-access');
    if(insertion)insertion.before(section);else host.append(section);
    return section;
  }
  // EMFD-NAV-01: every view has exactly one back link from EMFDNavigation; no second context link.
  function addContextBack(){}

  // Event delegation for links and buttons in any room, without per-room code.
  document.addEventListener('click',event=>{
    if(event.target.closest?.('.global-nav a'))clearOrigin();
    const target=event.target.closest?.('[data-house-feature]');if(!target)return;
    const featureId=target.dataset.houseFeature,roomId=target.dataset.featureRoom||roomFromHash();
    if(!features[featureId])return;
    event.preventDefault();activate(featureId,roomId,target);
  });
  root.EMFDFeatures=Object.freeze({features,roomFeatures,primaryNavigation,roomRoute,roomFromHash,list,mountRoom,addContextBack,activate,randomCard,getOrigin,clearOrigin});
})(globalThis);

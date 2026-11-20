// EMFD-BOOK-01a: rooms, names, routes and images come from the room register (shared/registry.js, data/registry.js).
const emfdFe07Style=document.createElement('link');emfdFe07Style.rel='stylesheet';emfdFe07Style.href='emfd-fe07.css';document.head.append(emfdFe07Style);
const immersiveStyle=document.createElement('link');immersiveStyle.rel='stylesheet';immersiveStyle.href='immersive-v0.6.32.css?v=0.6.50-housemusic01';document.head.append(immersiveStyle);
const dockIcons={
  impulse:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="m12 7 1.5 3.5L17 12l-3.5 1.5L12 17l-1.5-3.5L7 12l3.5-1.5Z"/></svg>',
  interpretation:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="10.8" cy="10.8" r="7.2"/><path d="m16 16 5 5M8 10h5M8 13h3"/></svg>',
  depth:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 9 9 0 0 1-3.2-.6L4 20l1.6-4A7.3 7.3 0 0 1 4 11.5 7.5 7.5 0 0 1 12 4a7.5 7.5 0 0 1 8 7.5Z"/><path d="M8.5 10h7M8.5 13h4.5"/></svg>',
  houseStory:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5.5c3-.8 6-.5 9 1.5 3-2 6-2.3 9-1.5v14c-3-.8-6-.5-9 1.5-3-2-6-2.3-9-1.5Z"/><path d="M12 7v14M6.5 13 9 11l2.5 2M7.5 12.3V16h3v-3.7"/></svg>',
  question:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 1 1 5.6 1.5c-.8 1.2-2.6 1.4-2.6 3.5M12 17v.1"/></svg>',
  anchor:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4M8.5 14.5A6 6 0 1 1 15.5 14.5c-1 .7-1.5 1.5-1.5 2.5h-4c0-1-.5-1.8-1.5-2.5Z"/><path d="M12 3v2M4.5 6.5 6 8M19.5 6.5 18 8"/></svg>'
};
const main=document.querySelector('main');let group='Alle',onlyImages=false,quiet=false;
const HALL_LIGHT_KEY='emfd.house.light.v1';
let hallLightOn=(()=>{try{return localStorage.getItem(HALL_LIGHT_KEY)!=='off';}catch{return true;}})();
const saveHallLight=()=>{try{localStorage.setItem(HALL_LIGHT_KEY,hallLightOn?'on':'off');}catch{}};
function setHallLight(value){hallLightOn=Boolean(value);saveHallLight();window.dispatchEvent(new CustomEvent('emfd:hall-light-change'));return hallLightOn;}
window.EMFDHallLight=Object.freeze({get value(){return hallLightOn;},set:setHallLight});
const hallLampMarkup=on=>`<img src="assets/tutorial/lantern-${on?'on':'off'}-v1.png" alt="" width="76" height="76">`; 
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const textLabels={impulse:'Impuls',depth:'Vertiefung',question:'Frage'};
// EMFD-NAV-01: the one context back link of a view (target from the shared navigation).
const backLink=(fallback,className='back')=>window.EMFDNavigation?.backLinkMarkup?.(fallback,className)||`<a class="${className}" href="${fallback}">Zurück</a>`;
const REGISTRY=window.EMFDRegistry;
const roomEntry=room=>({id:room.id,name:room.anzeigename,route:room.route,orientation:room.orientierung||'',alt:room.alt||'',
 image:REGISTRY.resolveMedia(room.bild).src||'',thumbnail:REGISTRY.resolveMedia(room.vorschau).src||''});
const ROOMS=(REGISTRY?.directory?.()||[]).map(roomEntry);
// EMFD-HOUSE-01: Alle Kategorien sind unabhängig von einer späteren Raum-Zuordnung erreichbar.
// Verbindungen und kuratierte Raum-Kategorien werden erst nach UX-Freigabe hinzugefügt.
const HOUSE_CATEGORIES=Object.freeze(['Ruhe','Kraft','Halt','Freude']);
const HOUSE_CONNECTIONS=Object.freeze([]); // Physical relations remain unapproved; room-to-feature links live in EMFDFeatures.
const MUSIC_ROOM={...roomEntry(REGISTRY?.room?.('M01')||{id:'M01',anzeigename:'Musikzimmer',route:'#musik'}),id:'Musik'};
window.EMFDHouse=Object.freeze({rooms:ROOMS.map(({id,name,image,thumbnail})=>({id,name,image,thumbnail,categories:[],connections:[],features:window.EMFDFeatures?.list(id).map(item=>item.id)||[]})),categories:[...HOUSE_CATEGORIES],connections:HOUSE_CONNECTIONS});
const readingDialog=document.querySelector('#reading-dialog')||document.body.appendChild(Object.assign(document.createElement('dialog'),{id:'reading-dialog'}));
let readingOpener=null;
let currentReading=null;
const readingKeys=['impulse','depth','question'];
function openCardText(button){
 const card=CARDS.find(c=>c.id===button.dataset.card),kind=button.dataset.reading;
 if(!card||!readingKeys.includes(kind))return;
 readingOpener=button;currentReading={cardId:card.id,kind};window.EMFDHandy?.pause();
 showReadingPage();
}
// Shared reader entry: same card/book modal regardless of the source room.
window.EMFDReader=Object.freeze({
 open({type='card',cardId,section='impulse',trigger}={}){
  if(type==='story')return window.EMFDOriginStory?.open({trigger});
  if(type!=='card'||!CARDS.some(card=>card.id===cardId)||!readingKeys.includes(section))return false;
  openCardText({dataset:{card:cardId,reading:section},get isConnected(){return !!trigger?.isConnected;},focus(options){trigger?.focus?.(options);}});
  return true;
 },
 getSize(){return window.EMFDReadingSize?.value??1;},
 setSize(step){return window.EMFDReadingSize?.set?.(step)??false;}
});
window.EMFDCardBook=Object.freeze({open({cardId,section='impulse',trigger}={}){
 return window.EMFDReader.open({type:'card',cardId,section,trigger});
}});
function showReadingPage(){
 if(!currentReading)return;
 const card=CARDS.find(c=>c.id===currentReading.cardId),kind=currentReading.kind,label=textLabels[kind];
 if(!card||!label)return;
 const nav=readingKeys.map(key=>`<button type="button" data-reading-switch="${key}" aria-current="${kind===key?'page':'false'}" aria-label="${escape(textLabels[key])}" title="${escape(textLabels[key])}"><span class="reading-choice-icon" aria-hidden="true">${dockIcons[key]}</span><span class="reading-choice-label">${escape(textLabels[key])}</span></button>`).join('');
 const text=card[kind]||'';
 readingDialog.className=`reading-dialog book-dialog reading-kind-${kind} emfd-book-v2`;
 readingDialog.innerHTML=`<button class="reading-close" type="button" aria-label="Buch schließen">×</button><nav class="reading-choice" aria-label="Seiten des Buches">${nav}</nav><div class="reading-shell"><div class="reading-title"><span class="eyebrow">${escape(card.group)} · ${escape(label)}</span><h2 id="reading-title">${escape(card.name)}</h2></div><div class="reading-page" data-book-page>${text?(kind==='question'?`<blockquote>${escape(text)}</blockquote>`:text.split('\n\n').map(p=>`<p>${escape(p)}</p>`).join('')):''}${kind==='question'?`<button type="button" class="thought-paper-entry-button" data-thought-card="${card.id}">Einen Gedanken mitnehmen</button>`:''}</div></div><div class="book-pager" aria-label="Im Buch blättern"><button type="button" data-book-previous ${kind==='impulse'?'disabled':''}>‹ Zurück</button><span aria-live="polite">Seite ${readingKeys.indexOf(kind)+1} von 3</span><button type="button" data-book-next ${kind==='question'?'disabled':''}>Weiter ›</button></div>`;
 readingDialog.setAttribute('aria-labelledby','reading-title');if(!readingDialog.open)readingDialog.showModal();
 readingDialog.querySelector('.reading-shell').scrollTop=0;
}
function navigateBook(direction){if(!currentReading)return;const index=readingKeys.indexOf(currentReading.kind),next=index+direction;if(next<0||next>=readingKeys.length)return;currentReading.kind=readingKeys[next];showReadingPage();}
let bookStart=null;
readingDialog.addEventListener('pointerdown',e=>{if(!e.target.closest('[data-book-page]')||e.target.closest('button,input,textarea,a'))return;bookStart={x:e.clientX,y:e.clientY,pointerId:e.pointerId};});
readingDialog.addEventListener('pointerup',e=>{if(!bookStart||bookStart.pointerId!==e.pointerId)return;const dx=e.clientX-bookStart.x,dy=e.clientY-bookStart.y;bookStart=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5)navigateBook(dx<0?1:-1);});
readingDialog.addEventListener('pointercancel',()=>bookStart=null);
readingDialog.addEventListener('keydown',e=>{if(e.target.closest('input,textarea'))return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();navigateBook(e.key==='ArrowRight'?1:-1);}});
document.addEventListener('click',e=>{
 const opener=e.target.closest?.('[data-reading]');if(opener){e.preventDefault();openCardText(opener);return;}
 if(e.target.closest?.('.reading-close')){readingDialog.close();return;}
 const switcher=e.target.closest?.('[data-reading-switch]');if(switcher&&currentReading){currentReading.kind=switcher.dataset.readingSwitch;showReadingPage();return;}
 if(e.target.closest?.('[data-book-previous]')){navigateBook(-1);return;}
 if(e.target.closest?.('[data-book-next]')){navigateBook(1);return;}
 const note=e.target.closest?.('[data-thought-card]');if(note){window.EMFDThoughtPaper?.open({mode:'card',cardId:note.dataset.thoughtCard},note);return;}
});
readingDialog.addEventListener('click',e=>{if(e.target===readingDialog){const r=readingDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)readingDialog.close();}});
readingDialog.addEventListener('close',()=>{currentReading=null;if(readingOpener?.isConnected)readingOpener.focus({preventScroll:true});});
window.addEventListener('hashchange',()=>{if(readingDialog.open)readingDialog.close();});
function picture(c,detail=false){return `<div class="picture" data-card="${c.id}">${c.image?`<span class="loading">Bild wird geladen …</span><img decoding="async" src="${detail?c.image:c.imageOverview||c.image}" alt="${detail?escape(c.alt):''}" ${detail?'fetchpriority="high"':'loading="lazy"'} width="${c.imageWidth||1024}" height="${c.imageHeight||1536}">`:`<div class="fallback"><strong>${escape(c.name)}</strong><span>Illustration noch nicht verfügbar</span></div>`}</div>`}
function bindImages(){main.querySelectorAll('img').forEach(img=>{const loaded=()=>img.parentElement?.querySelector('.loading')?.remove();const failed=()=>{const source=img.dataset.emfdOriginalSrc||img.getAttribute('src');if(!img.dataset.emfdRepairAttempted&&window.EMFDCardAssets&&source&&/\/media\/cards\//.test(source)){img.dataset.emfdRepairAttempted='true';window.EMFDCardAssets.repair(source).then(ok=>{if(ok){delete img.dataset.emfdCacheHydrated;window.EMFDCardAssets.hydrate(img);}else failed();});return;}if(img.dataset.emfdFailed)return;img.dataset.emfdFailed='true';const box=img.parentElement;if(!box)return;if(box.closest('.card-back')){box.classList.add('card-back-placeholder');img.remove();return;}const card=CARDS.find(c=>c.id===box.dataset.card);if(!card){img.replaceWith(Object.assign(document.createElement('p'),{textContent:'Das Bild ist gerade nicht verfügbar.'}));return;}box.innerHTML=`<div class="fallback" role="status"><strong>${escape(card.name)}</strong><span>Das Bild konnte nicht geladen werden.</span>${main.querySelector('.detail')&&!box.closest('.held-card')?'<button type="button">Erneut versuchen</button>':''}</div>`;if(box.closest('.held-card')&&box.dataset.card&&!main.querySelector('.retry-held')){const retry=document.createElement('button');retry.className='retry-held';retry.textContent='Bild erneut laden';box.closest('.held-stage').append(retry);retry.onclick=()=>{box.innerHTML=picture(card,true).replace(/^<div[^>]*>|<\/div>$/g,'');retry.remove();bindImages();};}if(box.querySelector('button'))box.querySelector('button').onclick=e=>{e.preventDefault();e.stopPropagation();box.innerHTML=picture(card,!!main.querySelector('.detail')).replace(/^<div[^>]*>|<\/div>$/g,'');bindImages();};};img.addEventListener('load',loaded,{once:true});img.addEventListener('error',failed,{once:true});if(img.complete){if(img.naturalWidth)loaded();else failed();}window.EMFDCardAssets?.hydrate(img).catch(()=>{});});}

const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
function motionState(){document.body.classList.toggle('motion-off',quiet||reduced.matches);}
reduced.addEventListener?.('change',motionState);
function cardDock(c){return `<nav class="card-dock" aria-label="Begleitung zur Karte"><button type="button" data-reading="impulse" data-card="${c.id}" aria-label="Kartenbuch öffnen" title="Kartenbuch öffnen"><span class="dock-icon" aria-hidden="true">${dockIcons.houseStory}</span><span class="dock-label">Buch</span></button></nav>`;}
function heldCard(c,{concealed=false}={}){if(!c.image)return picture(c,true);const back=window.EMFDImages?.cardBack?.['card-view']||{url:'../media/cards/EMFD_Kartenrueckseite_v1.2.jpeg',width:1024,height:1536};const front=concealed?'<span class="picture concealed-front"></span>':picture(c,true);return `<div class="held-stage"><button class="held-card${concealed?' flipped is-concealed':''}" data-concealed="${concealed}" style="aspect-ratio:${c.imageWidth||630}/${c.imageHeight||1080}" aria-label="${concealed?'Verdeckte Karte. Karte umdrehen':`${escape(c.name)} · Vorderseite. Einmal tippen zum Umdrehen`}"><span class="card-tilt"><span class="card-inner"><span class="card-face card-front" aria-hidden="${concealed}">${front}</span><span class="card-face card-back" aria-hidden="${!concealed}"><img src="${back.url}" alt="${concealed?'Verdeckte Karte':'Kartenrückseite'}" width="${back.width}" height="${back.height}"></span></span><span class="card-gloss-clip" aria-hidden="true"><span class="card-gloss"></span></span></span></button><button class="card-enlarge" type="button" data-card-enlarge aria-label="${concealed?'Verdeckte Karte groß ansehen':`${escape(c.name)} groß ansehen`}"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5"/></svg></button></div>`;}
function revealConcealedCard(card){
 const draw=window.EMFDCardDraw?.reveal?.();if(!draw||card.dataset.revealed==='true')return false;
 const c=CARDS.find(item=>item.id===draw.id);if(!c)return false;
 card.dataset.revealed='true';card.dataset.concealed='false';const front=card.querySelector('.card-front');if(front){front.innerHTML=picture(c,true);bindImages();}
 const copy=main.querySelector('.copy');if(copy)copy.innerHTML=`<div class="eyebrow">${c.group} · ${c.id}</div><h1>${escape(c.name)}</h1><p class="card-interaction-intro">Tippen zum Umdrehen · Bewegen zum Erkunden</p>`;
 const article=main.querySelector('.detail');if(article&&!main.querySelector('.card-dock'))article.insertAdjacentHTML('afterend',cardDock(c));
 card.setAttribute('aria-label',`${c.name} · Vorderseite. Einmal tippen zum Umdrehen. Groß ansehen öffnet die Nahansicht.`);
 main.querySelector('[data-card-enlarge]')?.setAttribute('aria-label',`${c.name} groß ansehen`);
 card.querySelector('.card-front')?.setAttribute('aria-hidden','false');card.querySelector('.card-back')?.setAttribute('aria-hidden','true');
 if(!window.EMFDNavigation?.replace?.(`#karte/${c.id}`))history.replaceState(history.state,'',`#karte/${c.id}`);document.title=`${c.name} · Ein Moment für dich`;updateGlobalNav(`karte/${c.id}`);
 window.EMFDReading?.bind();window.EMFDMusic?.bindDock?.();
 window.dispatchEvent(new CustomEvent('emfd:card-revealed',{detail:{cardId:c.id}}));
 return true;
}
function bindMotion(){motionState();const card=main.querySelector('.held-card');if(!card||card.dataset.motionBound==='true')return;card.dataset.motionBound='true';let down=null,moved=false,flipped=false,suppressClick=false;
const tilt=card.querySelector('.card-tilt'),gloss=card.querySelector('.card-gloss');card.dataset.ratio=String(parseFloat(card.style.aspectRatio.split('/')[0])/parseFloat(card.style.aspectRatio.split('/')[1]));
const enlarge=main.querySelector('[data-card-enlarge]');if(enlarge)enlarge.onclick=e=>{e.preventDefault();window.EMFDCardView?.open(card);};
const reset=()=>{tilt.style.transform='';gloss.style.transform='';card.classList.remove('holding');};
let singleTapTimer=null;
const cancelTap=()=>{if(singleTapTimer!==null){clearTimeout(singleTapTimer);singleTapTimer=null;}};
const openBook=()=>{if(card.dataset.concealed==='true')return;const id=(location.hash.match(/#karte\/(O\d{2})/)||[])[1];const button=main.querySelector(`[data-reading="impulse"][data-card="${id}"]`);if(button)window.EMFDCardBook?.open({cardId:id,section:'impulse',trigger:button});};
card.addEventListener('cancel-card-tap',cancelTap);
flipped=card.classList.contains('flipped');
const flip=()=>{const firstReveal=card.dataset.concealed==='true'&&flipped;if(firstReveal){flipped=false;card.classList.remove('flipped','is-concealed');revealConcealedCard(card);return;}flipped=!flipped;card.classList.toggle('flipped',flipped);card.querySelector('.card-front').setAttribute('aria-hidden',flipped);card.querySelector('.card-back').setAttribute('aria-hidden',!flipped);card.setAttribute('aria-label',`${main.querySelector('h1')?.textContent||'Karte'} · ${flipped?'Rückseite':'Vorderseite'}. Einmal tippen zum Umdrehen. Groß ansehen öffnet die Nahansicht.`);};
const move=e=>{if(quiet||reduced.matches)return;const r=card.getBoundingClientRect(),x=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y=Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));tilt.style.transform=`rotateX(${(0.5-y)*10}deg) rotateY(${(x-0.5)*10}deg) rotateZ(${(x-0.5)*1.5}deg) scale(${down?'1.015':'1'})`;gloss.style.transform=`translateX(${-55+x*70}%)`;};
card.addEventListener('pointerdown',e=>{if(e.button!==0)return;down={x:e.clientX,y:e.clientY};moved=false;suppressClick=false;if(!quiet&&!reduced.matches)card.classList.add('holding');card.setPointerCapture?.(e.pointerId);move(e);});
card.addEventListener('pointermove',e=>{if(down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)>8){moved=true;cancelTap();}if(e.pointerType==='mouse'||down)move(e);});
card.addEventListener('pointerup',e=>{const distance=down?Math.hypot(e.clientX-down.x,e.clientY-down.y):0;if(moved){cancelTap();suppressClick=true;if(distance>90&&window.EMFDCardView?.isOpen(card)){window.EMFDCardView.close();}}down=null;reset();});
card.addEventListener('pointercancel',()=>{down=null;cancelTap();suppressClick=true;reset();});card.addEventListener('pointerleave',()=>{if(!down)reset();});
card.onclick=e=>{
 if(suppressClick||moved){suppressClick=false;moved=false;return;}
 if(e.detail>=2){cancelTap();return;}
 // Delay pointer click briefly so a double-click never flips the card twice.
 if(e.detail===0){cancelTap();flip();return;}
 cancelTap();singleTapTimer=setTimeout(()=>{singleTapTimer=null;if(card.isConnected)flip();},280);
};
card.addEventListener('dblclick',e=>{e.preventDefault();cancelTap();openBook();});card.addEventListener('keydown',e=>{if(e.key==='z'||e.key==='Z'){e.preventDefault();window.EMFDCardView?.toggle(card);}});
window.addEventListener('hashchange',cancelTap,{once:true});window.EMFDHandy?.attach(card,tilt,gloss,()=>quiet,reduced);
}

function roomImage(room,decorative=false){return `<img class="room-photo" src="${decorative?(room.thumbnail||room.image):room.image}" alt="${decorative?'':escape(room.alt)}" ${decorative?'aria-hidden="true"':''} ${decorative?'loading="lazy"':'fetchpriority="high"'} width="${decorative?'480':'1086'}" height="${decorative?'320':'1448'}">`; }
function bindRoomImages(){main.querySelectorAll('img.room-photo').forEach(img=>{const fallback=()=>{if(img.dataset.failed)return;img.dataset.failed='true';img.replaceWith(Object.assign(document.createElement('div'),{className:'room-photo-fallback',textContent:'Dieses Raumbild ist gerade nicht verfügbar.'}));};img.addEventListener('error',fallback,{once:true});if(img.complete&&!img.naturalWidth)fallback();});}
function renderHall(){
 const img=hallLightOn?'../media/optimized/rooms/flur-v2-864-v1-e7d3476528.webp':'../media/optimized/rooms/flur-v2-dim-864-v1-5aba5b505b.webp';
 const alt='Blick durch den hohen Flur des Hauses: links das Atelier und ein Teetisch, rechts ein gemütlicher Musikbereich, in der Mitte führt ein Teppich zum großen Fenster. Vorne liegen ein aufgeschlagenes Buch und ein Brief.';
 main.innerHTML=`<section class="hall-scene" aria-labelledby="hall-title"><h1 id="hall-title" class="sr-only">Im Flur</h1><figure class="hall-stage"><img class="hall-art room-photo" src="${img}" alt="${alt}" width="864" height="1536" fetchpriority="high"><nav class="hall-utilities" aria-label="Hausfunktionen"><button type="button" data-hall-help>Hilfe</button><button type="button" data-hall-settings>Einstellungen</button><button type="button" class="hall-theme-toggle" data-theme-toggle aria-label="Hintergrundmusik starten" aria-pressed="false"><img src="../media/music03/cabinet-v2.png" alt="" width="52" height="62"></button></nav><figcaption class="hall-caption"><span class="eyebrow">Das Haus der kleinen Wunder</span><p>Sieh dich um. Jede Tür steht dir offen.</p></figcaption><nav class="hall-hotspots" aria-label="Orte und Wege im Flur"><a class="hall-hotspot hall-hotspot--atelier" href="#atelier"><strong>Atelier</strong><span>Kartenbilder ansehen</span></a><a class="hall-hotspot hall-hotspot--tea" href="#teezimmer"><strong>Teezimmer</strong><span>Eine Karte im Alltag</span></a><a class="hall-hotspot hall-hotspot--music" href="#musik"><strong>Musik auswählen</strong><span>Musik hören</span></a><a class="hall-hotspot hall-hotspot--rooms" href="#raeume">Alle Räume ansehen</a><button class="hall-hotspot hall-hotspot--gift" type="button" data-start-gift-open>Über dieses Geschenk</button></nav><button class="hall-light-toggle" type="button" aria-pressed="${hallLightOn}" aria-label="${hallLightOn?'Licht ausschalten':'Licht einschalten'}">${hallLampMarkup(hallLightOn)}</button></figure></section>`;
 bindRoomImages();main.querySelector('[data-hall-help]')?.addEventListener('click',()=>document.querySelector('#help-open')?.click());main.querySelector('[data-hall-settings]')?.addEventListener('click',()=>document.querySelector('#settings-open')?.click());const toggle=main.querySelector('.hall-light-toggle');if(toggle)toggle.addEventListener('click',e=>{setHallLight(!hallLightOn);const image=main.querySelector('.hall-art');if(image)image.src=hallLightOn?'../media/optimized/rooms/flur-v2-864-v1-e7d3476528.webp':'../media/optimized/rooms/flur-v2-dim-864-v1-5aba5b505b.webp';e.currentTarget.setAttribute('aria-pressed',String(hallLightOn));e.currentTarget.setAttribute('aria-label',hallLightOn?'Licht ausschalten':'Licht einschalten');e.currentTarget.innerHTML=hallLampMarkup(hallLightOn);});
}
function renderRoomDirectory(){
 const tiles=ROOMS.map(room=>`<a class="room-tile" href="${room.route}" aria-label="${room.id} ${escape(room.name)}"><span class="room-tile-image">${roomImage(room,true)}</span><span class="room-tile-label"><small>${room.id}</small><strong>${escape(room.name)}</strong></span></a>`).join('');
 const musicTile=`<a class="room-tile room-tile--music" href="${MUSIC_ROOM.route}" aria-label="${escape(MUSIC_ROOM.name)} betreten"><span class="room-tile-image"><img class="room-photo" src="${MUSIC_ROOM.thumbnail}" alt="" aria-hidden="true" loading="lazy" width="480" height="320"></span><span class="room-tile-label"><small>Musik</small><strong>${escape(MUSIC_ROOM.name)}</strong></span></a>`;
 main.innerHTML=`<section class="room-directory house-directory" aria-labelledby="rooms-title">${backLink('#flur')}<div class="eyebrow">Das Haus der kleinen Wunder</div><h1 id="rooms-title">Alle Räume</h1><p class="muted">Such dir einen Ort aus. Alle Zimmer sind erreichbar – auch die, in denen du vorerst einfach verweilen kannst.</p><div class="room-grid">${tiles}${musicTile}</div></section>`;
 bindRoomImages();
}
function renderRoomDetail(id){
 const room=ROOMS.find(item=>item.id===id);
 if(!room){location.hash='raeume';return;}
 // Keine vorgetäuschten Raumzuordnungen: vier allgemeine Kartenkategorien, ohne Pflichtroute.
 const categoryLinks=HOUSE_CATEGORIES.map(category=>`<a href="#karten" data-house-category="${category}" aria-label="Karten der Kategorie ${category} ansehen">${category}</a>`).join('');
 const isLibrary=id==='P02';
 const libraryLink=isLibrary?'<button type="button" class="emfd-library-jump" data-library-jump>Bücherregal entdecken</button>':'';
 const libraryShelf=isLibrary?'<section id="emfd-library-root" aria-label="Bücherregal der Bibliothek"></section>':'';
 main.innerHTML=`<section class="room-detail house-skeleton${isLibrary?' library-room':''}" aria-labelledby="room-title"><nav class="room-detail-top" aria-label="Rückweg">${backLink('#raeume')}</nav><figure class="house-hero room-hero">${roomImage(room)}<figcaption class="house-copy"><span class="eyebrow">${room.id} · Das Haus der kleinen Wunder</span><h1 id="room-title">${escape(room.name)}</h1><p>${escape(room.orientation)}</p>${libraryLink}</figcaption></figure>${libraryShelf}<section class="house-category-access" aria-labelledby="house-category-title"><h2 id="house-category-title">Kartenkategorien entdecken</h2><p>Vier Wege zu den Bildkarten, unabhängig davon, in welchem Zimmer du bist.</p><nav class="house-category-links" aria-label="Kartenkategorien">${categoryLinks}</nav></section></section>`;
 main.querySelectorAll('[data-house-category]').forEach(link=>link.addEventListener('click',()=>window.EMFDAtelier?.selectGroup?.(link.dataset.houseCategory)));
 if(isLibrary){
   const shelf=main.querySelector('#emfd-library-root');
   const api=window.EMFDLibrary?.mount(shelf);
   if(!api)shelf.innerHTML='<p class="emfd-library-fallback" role="status">Das Bücherregal konnte gerade nicht geladen werden. Bitte öffne die Bibliothek erneut.</p>';
   main.querySelector('[data-library-jump]')?.addEventListener('click',()=>shelf?.scrollIntoView({behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'}));
 }
  bindRoomImages();
  window.EMFDFeatures?.mountRoom(main,id);
}
function renderMusic(){if(window.EMFDMusicRoom){window.EMFDStations.render("gramophone",main);return;}main.innerHTML=`<section class="music-page" aria-labelledby="music-page-title">${backLink('#flur')}<div class="eyebrow">Ein eigener Zugang</div><h1 id="music-page-title">Musik</h1><p class="muted">Wähle Musik und starte sie bewusst. Beim Wechsel zwischen Haus und Karten beginnt nichts automatisch.</p><section class="music-page-panel app-theme-panel" aria-labelledby="app-theme-title"><span class="music-note-icon" aria-hidden="true">♫</span><h2 id="app-theme-title">App-Theme</h2><p>Das Haus der kleinen Wunder – Main Theme</p><p class="muted">Ein eigenständiges Theme für das Haus. Es gehört nicht zu einer Karte.</p><button type="button" id="select-app-theme">Theme im Player auswählen</button></section></section>`;const themeButton=main.querySelector('#select-app-theme');if(themeButton){if(window.EMFDUI)window.EMFDUI.mountThemeButton(main);else themeButton.onclick=()=>window.EMFDMusic?.selectTheme('T03');}}
function room(){const cards=CARDS.filter(c=>(group==='Alle'||c.group===group)&&(!onlyImages||c.image));main.innerHTML=`${backLink('#flur')}<div class="eyebrow">Ein Ort zum Betrachten</div><h1>Der Kartenraum</h1><p class="muted">Wähle eine Karte, die du ansehen möchtest. Du kannst einfach beim Bild bleiben.</p><div class="filters" aria-label="Kartengruppe">${['Alle','Ruhe','Kraft','Halt','Freude'].map(g=>`<button data-group="${g}" aria-pressed="${g===group}">${g}</button>`).join('')}</div><label class="availability"><input type="checkbox" ${onlyImages?'checked':''}>Nur Karten mit vorhandenem Bild zeigen</label><p class="caption" role="status">${cards.length} von 24 Karten · 24 vorläufige Bildillustrationen sind eingebunden.</p><div class="grid">${cards.map(c=>`<a class="tile" href="#karte/${c.id}">${picture(c)}<h2>${escape(c.name)}</h2><small>${c.group} · ${c.id}</small></a>`).join('')}</div>`;main.querySelectorAll('[data-group]').forEach(b=>b.onclick=()=>{group=b.dataset.group;room();main.querySelector(`[data-group="${group}"]`).focus()});main.querySelector('input').onchange=e=>{onlyImages=e.target.checked;room();main.querySelector('input').focus()};bindImages();}
function drawRandomCard(){const choices=CARDS.filter(c=>c.image);if(!choices.length)return;let index;if(window.crypto?.getRandomValues){const v=new Uint32Array(1),limit=Math.floor(4294967296/choices.length)*choices.length;do{window.crypto.getRandomValues(v);}while(v[0]>=limit);index=v[0]%choices.length;}else index=Math.floor(Math.random()*choices.length);window.EMFDCardDraw?.begin(choices[index].id,'#ankommen');}
let cardSizer=null;
function updateGlobalNav(route){
  const active=route.startsWith('karte/')||route==='karten'||route.startsWith('atelier/tisch/')?'karten':route.startsWith('musik')?'musik':'haus';
  (document.querySelectorAll?.('.global-nav [data-tab]')||[]).forEach(link=>{
    const selected=link.dataset.tab===active;
    if(selected)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
  });
}
function render(){
  // EMFD-BOOK-01a: new addresses (#raum/…, #geraet/…) show the view that implements them today; replaced without a history entry.
  const registryTarget=window.EMFDRegistry?.redirect?.(location.hash);
  if(registryTarget){if(window.EMFDNavigation?.replace?.(registryTarget)&&location.hash===registryTarget)render();else location.replace(registryTarget);return;}
  // EMFD-BOOK-01d: the entrance (#ankommen for first visits, #raum/EXT/…) is a scene view; returning visitors go to the hall.
  const sceneRoute=window.EMFDRegistry?.isSceneRoute?.(location.hash);
  if(!sceneRoute&&(location.hash||'#ankommen')==='#ankommen'&&window.EMFDEntrance?.isReturning()){if(window.EMFDNavigation?.replace?.('#flur')&&location.hash==='#flur')render();else location.replace('#flur');return;}
  if(!sceneRoute&&/^#(?:raum|geraet)\//.test(location.hash)){location.replace('#flur');return;}
  if(!sceneRoute&&location.hash!==''&&location.hash!=='#ankommen'){window.EMFDEntrance?.leave?.();window.EMFDHall?.leave?.();window.EMFDKitchen?.leave?.();}
  window.EMFDStations?.leaveAll();
  cardSizer?.disconnect();window.EMFDHandy?.stop();
  const settingsHost=document.querySelector('#motion-settings');
  if(settingsHost)settingsHost.textContent='Karten reagieren auf Berührung und verfügbare Handybewegungen.';
  const route=location.hash.slice(1)||'ankommen';
  const isCard=route.startsWith('karte/');
  const device=window.EMFDDevices?.forRoute?.('#'+route)||null; // EMFD-PLAYER-01 device station
  const isRoom=route==='flur'||route==='haus'||route==='raeume'||route==='atelier'||route==='teezimmer'||route.startsWith('atelier/tisch/')||route.startsWith('ort/');
  document.body.classList.toggle('detail-mode',isCard);
  document.body.classList.toggle('room-view',isRoom||route.startsWith('musik')||route==='karten');
  document.body.classList.toggle('hall-view',route==='flur'||route==='haus');
  document.body.classList.toggle('atelier-home-view',route==='atelier');
  document.body.classList.toggle('atelier-table-view',route.startsWith('atelier/tisch/'));
  document.body.classList.toggle('house-skeleton-view',!device&&route.startsWith('ort/')&&route!=='ort/P04'&&route!=='ort/P08');
  document.body.classList.toggle('immersive-room-view',!device&&(route==='atelier'||route==='teezimmer'||route==='musik'||route.startsWith('atelier/tisch/')||route.startsWith('ort/')));
  document.body.classList.toggle('device-view',Boolean(device));
  document.body.classList.toggle('catalog-view',route==='karten'||route==='raeume'||route==='musik/playlist'||route.startsWith('musik/geschichten'));
  if(sceneRoute||(route==='ankommen'&&window.EMFDEntrance)){
    // EMFD-BOOK-01d/01e: Bilderbuch-Szenen. Eingang (EXT) → entrance.js, Halle (H00, auch #flur/#haus) → hall.js.
    const r=window.EMFDRegistry?.resolveRoute?.('#'+route);
    if(r?.roomId==='H00'&&window.EMFDHall){window.EMFDEntrance?.leave?.();window.EMFDKitchen?.leave?.();window.EMFDHall.render(main,{sceneId:r.sceneId||'H00-C01'});document.title='Die Halle · Haus der kleinen Wunder';}
    else if(r?.roomId==='KUE'&&window.EMFDKitchen){window.EMFDEntrance?.leave?.();window.EMFDHall?.leave?.();window.EMFDKitchen.render(main,{sceneId:/\/C0\d$/.test(route)?r.sceneId:'KUE-C02'});document.title='Die Küche · Haus der kleinen Wunder';}
    else{window.EMFDHall?.leave?.();window.EMFDKitchen?.leave?.();window.EMFDEntrance.render(main,{sceneId:r?.sceneId||'EXT-C01',arrival:route==='ankommen'});document.title=`${route==='ankommen'?'Ankommen':'Eingang'} · Haus der kleinen Wunder`;}
    window.EMFDNavigation?.ready?.();return;}
  if(device)window.EMFDStations.render('device',main,{deviceId:device.id});
  else if(route==='karten'&&window.EMFDAtelier)window.EMFDAtelier.renderGrid(main);
  else if(route==='karten')room();
  else if(route==='atelier'||route==='ort/P04')window.EMFDAtelier?.renderAtelier(main);
  else if(route.startsWith('atelier/tisch/'))window.EMFDAtelier?.renderTable(main,route.split('/')[2]);
  else if(route==='teezimmer'||route==='ort/P08')window.EMFDTeezimmer?.render(main);
  else if(route==='flur'||route==='haus')renderHall();
  else if(route==='raeume')renderRoomDirectory();
  else if(route.startsWith('ort/'))renderRoomDetail(route.split('/')[1]);
  else if(route==='musik')renderMusic();
  else if(route==='musik/playlist')window.EMFDStations.render('records',main);
  else if(route==='musik/geschichten')window.EMFDStations.render('compositions',main);
  else if(route.startsWith('musik/geschichten/'))window.EMFDStations.render('compositions',main,{cardId:route.split('/')[2]});
  else if(isCard){
    const concealed=route==='karte/verdeckt';const draw=concealed?window.EMFDCardDraw?.current?.():null;
    if(concealed&&!draw){location.hash='karten';return;}
    const c=CARDS.find(c=>c.id===(concealed?draw.id:route.split('/')[1]));
    if(!c){window.EMFDCardDraw?.cancel?.();location.hash='karten';return;}
    const returnTarget=window.EMFDNavigation?.backLink?.('#karten').target||(concealed?draw.returnTarget:'#karten');
    const copy=concealed?'<div class="eyebrow">Deine gezogene Karte</div><h1>Eine Karte wartet auf dich</h1><p class="card-interaction-intro" role="status">Drehe die Karte bewusst um, wenn du bereit bist.</p>':`<div class="eyebrow">${c.group} · ${c.id}</div><h1>${escape(c.name)}</h1><p class="card-interaction-intro">Tippen zum Umdrehen · Bewegen zum Erkunden</p>`;
    main.innerHTML=`${backLink('#karten').replace('<a ',returnTarget==='#teezimmer'?'<a data-card-return-teezimmer="true" ':'<a ')}<article class="detail app-detail"><div class="copy">${copy}</div><div class="card-slot">${heldCard(c,{concealed})}</div></article>${concealed?'':cardDock(c)}`;
    bindImages();
    if(route.endsWith('/frage')&&!concealed){const openQuestion=()=>{const button=main.querySelector(`[data-reading="impulse"][data-card="${c.id}"]`);if(button){openCardText(button);currentReading.kind='question';showReadingPage();}};requestAnimationFrame(openQuestion);}
  }else{
    main.innerHTML=`<section class="home enchanted-home"><div class="intro-copy"><div class="eyebrow">Das Haus der kleinen Wunder</div><h1>Ein kleiner Moment<br>nur für dich.</h1><p class="motto">Du darfst ankommen, ohne dich verändern zu müssen.</p><div class="arrival-actions"><button class="primary" id="draw-card">Eine zufällige Karte ziehen</button><a class="browse-cards" href="#flur">Betrete dein Haus der Wunder</a><p class="caption">Zufallsauswahl aus allen 24 Karten.</p></div><div class="welcome-text"><p>Manchmal braucht es nicht viel.<br>Einen Augenblick zum Innehalten.<br>Einen Gedanken, der bleiben darf.<br>Oder eine kleine Entdeckung,<br>mit der du nicht gerechnet hast.</p><p>Hinter dieser Tür wartet ein besonderer Ort auf dich. Ein Haus voller kleiner Wunder, Geschichten und Möglichkeiten.</p><p>Du darfst dich umsehen, verweilen oder einfach nur da sein.<br><strong>Ganz in deinem Tempo.</strong></p></div></div><figure class="deck-entry"><img class="hero deck-cover" src="../media/optimized/rooms/startseite-haustuer-v1-864-v1-6f7c1c2055.webp" alt="Deckblatt: Ein Moment für dich – Das Haus der kleinen Wunder. Eine offene blaue Tür, eine leuchtende Laterne und blühende Ranken im goldenen Rahmen." width="1024" height="1536" fetchpriority="high"><figcaption>Ein Moment für dich · Das Haus der kleinen Wunder</figcaption></figure></section>`;
    bindImages();
  }
  // EMFD-HOUSE-MUSIC-01: a shared music selection for each room, no autoplay or duplicate player.
  const musicRoomId=route==='atelier'||route==='ort/P04'||route.startsWith('atelier/tisch/')?'P04':
    route==='teezimmer'||route==='ort/P08'?'P08':
    route.startsWith('ort/')?route.split('/')[1]:null;
  if(musicRoomId&&!device)window.EMFDRoomMusic?.mount(main,musicRoomId,{compact:musicRoomId==='P04'||musicRoomId==='P08'});
  window.EMFDFeatures?.addContextBack(main,route);
  const titles={'ankommen':'Ankommen','karten':'Der Kartenraum','flur':'Im Flur','haus':'Im Flur','raeume':'Alle Räume','musik':'Musikzimmer','musik/playlist':'Playlist','musik/geschichten':'Kompositionsgeschichten','atelier':'Im Atelier','teezimmer':'Im Teezimmer'};
  const roomTitle=!device&&route.startsWith('ort/')?ROOMS.find(item=>item.id===route.split('/')[1])?.name:'';
  const pageTitle=device?device.name:route.startsWith('musik/geschichten/')?'Kompositionsgeschichte':titles[route];
  document.title=(route==='karte/verdeckt'?'Verdeckte Karte':isCard?CARDS.find(c=>c.id===route.split('/')[1])?.name:roomTitle||pageTitle||'Ankommen')+' · Haus der kleinen Wunder';
  const draw=main.querySelector('#draw-card');if(draw)draw.onclick=drawRandomCard;
  window.EMFDUI?.enhance(main);const afterPaint=window.requestAnimationFrame||((callback)=>callback());afterPaint(()=>afterPaint(()=>{bindMotion();fitActiveCard();}));window.EMFDReading?.bind();updateGlobalNav(route);window.scrollTo(0,0);main.focus({preventScroll:true});if(!route.startsWith('musik'))window.EMFDNavigation?.ready();
}
document.querySelector('.skip').onclick=e=>{e.preventDefault();main.focus();};
document.addEventListener('click',e=>{const link=e.target.closest?.('a[href="#flur"]');if(!link||e.defaultPrevented||link.hasAttribute('data-emfd-back'))return;e.preventDefault();if(location.hash==='#flur')render();else location.hash='#flur';});
document.querySelector('#quiet').onclick=e=>{quiet=!quiet;document.body.classList.toggle('quiet',quiet);e.currentTarget.setAttribute('aria-pressed',quiet);e.currentTarget.textContent=quiet?'Ruhige Ansicht an':'Ruhige Ansicht';motionState();};
window.addEventListener('hashchange',render);render();
function fitActiveCard(){const slot=main.querySelector('.card-slot'),card=slot?.querySelector('.held-card');if(!slot||!card)return;const c=CARDS.find(c=>location.hash.endsWith('/'+c.id));const ratio=(c?.imageWidth||630)/(c?.imageHeight||1080);const fit=()=>{const width=Math.max(1,Math.min(slot.clientWidth-12,Math.max(1,slot.clientHeight-40)*ratio));card.style.width=width+'px';card.style.height=(width/ratio)+'px';};fit();cardSizer=new ResizeObserver(fit);cardSizer.observe(slot);}
const startGateScript=document.createElement('script');startGateScript.src='start-gate.js?v=0.6.80';document.head.append(startGateScript);

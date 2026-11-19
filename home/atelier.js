(function(root){
  const GROUPS=['Alle','Ruhe','Kraft','Halt','Freude'];
  const GROUP_KEY='emfd.atelier.group';
  const SCROLL_KEY='emfd.atelier.gridScroll';
  const CURRENT_KEY='emfd.atelier.current';
  const DIRECTION_KEY='emfd.atelier.direction';
  let group=null;
  try{group=sessionStorage.getItem(GROUP_KEY);}catch{}
  if(!GROUPS.includes(group))group=null;

  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char]);
  const paragraphs=value=>esc(value).split(/\n\s*\n/).map(text=>`<p>${text.replace(/\n/g,'<br>')}</p>`).join('');
  const cards=()=>root.CARDS||[];

  function rememberedCard(){
    let id='O01';
    try{id=sessionStorage.getItem(CURRENT_KEY)||id;}catch{}
    return cards().some(card=>card.id===id)?id:'O01';
  }
  function rememberCard(id){try{sessionStorage.setItem(CURRENT_KEY,id);}catch{}}
  function rememberReturn(target){try{sessionStorage.setItem('emfd.card.return',target);}catch{}}
  function rememberGridScroll(){try{sessionStorage.setItem(SCROLL_KEY,String(Math.max(0,root.scrollY||0)));}catch{}}
  function clearGridScroll(){try{sessionStorage.removeItem(SCROLL_KEY);}catch{}}
  function restoreGridScroll(){
    let scroll=0;
    try{scroll=Number(sessionStorage.getItem(SCROLL_KEY)||0);}catch{}
    if(scroll>0)requestAnimationFrame(()=>root.scrollTo({top:scroll,left:0,behavior:'auto'}));
  }
  function returnTarget(){try{return sessionStorage.getItem('emfd.card.return')||'#karten';}catch{return '#karten';}}
  function shell(content,className=''){return `<section class="atelier-view ${className}">${content}</section>`;}

  function image(card,{priority=false,decorative=false,neighbor=false}={}){
    /* Alle gelieferten O01–O24-PNGs wurden als 896 × 1536 px (7:12) geprüft. */
    const width=896,height=1536;
    return `<span class="atelier-art${neighbor?' atelier-art--neighbor':''}" data-card-id="${card.id}" style="--art-ratio:${width}/${height}"><img src="${esc(neighbor?card.imageOverview:card.image)}" alt="${decorative?'':esc(card.alt||card.name)}" ${priority?'fetchpriority="high"':'loading="lazy"'} width="${width}" height="${height}"><span class="atelier-card-fallback"><strong>${esc(card.name)}</strong><small>Bild nicht verfügbar</small></span></span>`;
  }

  function bindImages(host){
    host.querySelectorAll('.atelier-art img').forEach(img=>{
      const done=()=>img.parentElement?.classList.add('is-loaded');
      const failed=()=>{const source=img.dataset.emfdOriginalSrc||img.getAttribute('src');if(!img.dataset.emfdRepairAttempted&&root.EMFDCardAssets&&source){img.dataset.emfdRepairAttempted='true';root.EMFDCardAssets.repair(source).then(ok=>{if(ok){delete img.dataset.emfdCacheHydrated;root.EMFDCardAssets.hydrate(img);}else img.parentElement?.classList.add('is-missing');});return;}img.parentElement?.classList.add('is-missing');};
      img.addEventListener('load',done,{once:true});
      img.addEventListener('error',failed,{once:true});
      if(img.complete)(img.naturalWidth?done:failed)();
      root.EMFDCardAssets?.hydrate(img).catch(()=>{});
    });
  }
  function bindHelp(host){host.querySelectorAll('[data-atelier-help]').forEach(button=>button.addEventListener('click',()=>document.querySelector('#help-open')?.click()));}

  function dialogs(card){
    return `<dialog class="atelier-dialog atelier-text-dialog" data-atelier-text-dialog aria-labelledby="atelier-text-title">
      <div class="atelier-dialog-bar"><span>${esc(card.group)} · ${esc(card.id)}</span><button type="button" data-dialog-close aria-label="Begleittext schließen">×</button></div>
      <article><h2 id="atelier-text-title">${esc(card.name)}</h2>${paragraphs(card.impulse||'')}</article>
    </dialog>
    <dialog class="atelier-dialog atelier-zoom-dialog" data-atelier-zoom-dialog aria-label="${esc(card.name)} groß ansehen">
      <div class="atelier-dialog-bar"><span>${esc(card.name)}</span><button type="button" data-dialog-close aria-label="Bildansicht schließen">×</button></div>
      <div class="atelier-zoom-stage"><button class="atelier-hand-card" type="button" aria-label="Karte in der Hand"><span class="atelier-hand-tilt"><img src="${esc(card.imageDetail||card.image)}" alt="${esc(card.alt||card.name)}" width="896" height="1536"></span></button></div><div class="atelier-hand-controls"><p data-hand-status role="status">Bewege die Karte leicht mit dem Finger.</p></div>
    </dialog>`;
  }

  function renderAtelier(host){renderGallery(host,rememberedCard());}
  function renderTable(host,id){renderGallery(host,id);}

  function renderGallery(host,id){
    const registry=cards();
    let index=registry.findIndex(card=>card.id===id);
    if(index<0){index=0;id=registry[0]?.id;}
    if(!registry.length)return;
    const card=registry[index];
    const previous=registry[(index+registry.length-1)%registry.length];
    const next=registry[(index+1)%registry.length];
    rememberCard(card.id);
    let direction='';
    try{direction=sessionStorage.getItem(DIRECTION_KEY)||'';sessionStorage.removeItem(DIRECTION_KEY);}catch{}
    host.innerHTML=shell(`<img class="atelier-background" src="../media/optimized/rooms/P04-atelier-1086-v1-0a9f9576ef.webp" srcset="../media/optimized/rooms/P04-atelier-900-v1-f57b4df238.webp 900w, ../media/optimized/rooms/P04-atelier-1086-v1-0a9f9576ef.webp 1086w" sizes="100vw" alt="" aria-hidden="true" width="1086" height="1448" fetchpriority="high">
      <div class="atelier-gallery-shade" aria-hidden="true"></div>
      <div class="atelier-topbar">${(root.EMFDNavigation?.backLinkMarkup?.('#raeume')||'<a class="back" href="#raeume">Zurück</a>')}<div class="atelier-topbar-controls"><button class="atelier-music-toggle" type="button" data-music-toggle aria-label="Musik einschalten" aria-pressed="false"><span class="dock-icon" aria-hidden="true"></span></button><button type="button" data-atelier-help aria-label="Hilfe öffnen">?</button></div></div>
      <div class="atelier-gallery${direction?` is-entering is-entering-${direction}`:''}" data-gallery>
        <p class="atelier-position" aria-live="polite"><span>${esc(card.group)}</span><span>${String(index+1).padStart(2,'0')} / ${registry.length}</span></p>
        <div class="atelier-wall" aria-label="Kunstwerk ${index+1} von ${registry.length}">
          <figure class="atelier-neighbor atelier-neighbor--previous" aria-hidden="true">${image(previous,{decorative:true,neighbor:true})}</figure>
          <figure class="atelier-masterpiece"><button class="atelier-frame" type="button" data-atelier-zoom aria-label="${esc(card.name)}: einmal tippen zum Vergrößern, doppelt tippen zum Textlesen">${image(card,{priority:true})}</button><figcaption><strong>${esc(card.name)}</strong><span>${esc(card.group)} · ${esc(card.id)}</span></figcaption></figure>
          <figure class="atelier-neighbor atelier-neighbor--next" aria-hidden="true">${image(next,{decorative:true,neighbor:true})}</figure>
        </div>
      </div>
      <nav class="atelier-gallery-nav" aria-label="Zwischen Bildkarten blättern">
        <button type="button" data-gallery-move="previous" data-target="${previous.id}" aria-label="Zurück zu ${esc(previous.name)}"><span aria-hidden="true">←</span><span>Zurück</span></button>
        <button type="button" data-atelier-text><span aria-hidden="true">◇</span><span>Text lesen</span></button>
        <button type="button" data-gallery-move="next" data-target="${next.id}" aria-label="Weiter zu ${esc(next.name)}"><span>Weiter</span><span aria-hidden="true">→</span></button>
      </nav>${dialogs(card)}`,'atelier-gallery-view');
    bindHelp(host);bindImages(host);bindGallery(host,card,previous,next);
    host._atelierSizer?.disconnect();
    const frame=host.querySelector('.atelier-frame'),wall=host.querySelector('.atelier-wall'),caption=host.querySelector('.atelier-masterpiece figcaption');
    const fit=()=>{if(!frame?.isConnected)return;const height=Math.max(1,wall.clientHeight-caption.offsetHeight-38);const width=Math.max(1,Math.min(wall.clientWidth-94,450,height*7/12));frame.style.width=width+'px';frame.style.height=(width*12/7)+'px';};
    fit();host._atelierSizer=new ResizeObserver(fit);host._atelierSizer.observe(wall);

    const gallery=host.querySelector('[data-gallery]');
    if(gallery?.classList.contains('is-entering'))requestAnimationFrame(()=>requestAnimationFrame(()=>gallery.classList.remove('is-entering','is-entering-next','is-entering-previous')));
  }

  function bindGallery(host,card,previous,next){
    const gallery=host.querySelector('[data-gallery]');
    let moving=false;
    const reduced=root.matchMedia?.('(prefers-reduced-motion: reduce)').matches||document.body.classList.contains('quiet');
    let tapTimer=null;
    const cancelSingleTap=()=>{if(tapTimer!==null){root.clearTimeout(tapTimer);tapTimer=null;}};
    const move=(direction,target)=>{
      if(moving)return;
      cancelSingleTap();
      moving=true;
      const destination=`#atelier/tisch/${target}`;
      try{sessionStorage.setItem(DIRECTION_KEY,direction);}catch{}
      if(reduced){location.hash=destination;return;}
      gallery?.classList.add(`is-leaving-${direction}`);
      root.setTimeout(()=>{location.hash=destination;},360);
    };
    host.querySelectorAll('[data-gallery-move]').forEach(button=>button.addEventListener('click',()=>move(button.dataset.galleryMove,button.dataset.target)));
    const textDialog=host.querySelector('[data-atelier-text-dialog]');
    const zoomDialog=host.querySelector('[data-atelier-zoom-dialog]');
    const textButton=host.querySelector('[data-atelier-text]');
    const zoomButton=host.querySelector('[data-atelier-zoom]');
    const openDialog=(dialog,opener)=>{dialog._atelierOpener=opener;dialog.showModal();dialog.querySelector('[data-dialog-close]')?.focus();};
    const openText=()=>{cancelSingleTap();if(!textDialog.open&&!zoomDialog.open)openDialog(textDialog,textButton);};
    const openZoom=()=>{if(!zoomDialog.open&&!textDialog.open){openDialog(zoomDialog,zoomButton);root.EMFDAtelierHand?.attach(zoomDialog);}};
    textButton?.addEventListener('click',openText);
    // Einfachtippen öffnet weiterhin die Nahansicht; Doppeltippen bekommt Vorrang.
    zoomButton?.addEventListener('click',event=>{
      if(moving||Date.now()<suppressClickUntil){event.preventDefault();return;}
      if(event.detail>=2||tapTimer!==null){event.preventDefault();openText();return;}
      tapTimer=root.setTimeout(()=>{tapTimer=null;openZoom();},340);
    });
    zoomButton?.addEventListener('dblclick',event=>{event.preventDefault();openText();});
    // Horizontale Gesten nur auf der Galerie: vertikales Scrollen bleibt dem Browser.
    const wall=host.querySelector('.atelier-wall');
    let gesture=null,suppressClickUntil=0;
    wall?.addEventListener('pointerdown',event=>{
      if(event.pointerType!=='touch'&&event.pointerType!=='pen')return;
      if(event.isPrimary===false||textDialog.open||zoomDialog.open)return;
      gesture={id:event.pointerId,x:event.clientX,y:event.clientY};
    });
    wall?.addEventListener('pointerup',event=>{
      if(!gesture||gesture.id!==event.pointerId)return;
      const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
      gesture=null;
      if(Math.abs(dx)<55||Math.abs(dx)<Math.abs(dy)*1.3)return;
      suppressClickUntil=Date.now()+550;
      cancelSingleTap();
      event.preventDefault();
      if(dx<0)move('next',next.id);
      else move('previous',previous.id);
    });
    wall?.addEventListener('pointercancel',()=>{gesture=null;});
    wall?.addEventListener('click',event=>{
      if(Date.now()<suppressClickUntil){event.preventDefault();event.stopPropagation();}
    },true);
    host.querySelectorAll('.atelier-dialog').forEach(dialog=>{
      dialog.querySelector('[data-dialog-close]')?.addEventListener('click',()=>dialog.close());
      dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
      dialog.addEventListener('close',()=>dialog._atelierOpener?.isConnected&&dialog._atelierOpener.focus({preventScroll:true}));
    });
    host._atelierKeyHandler&&document.removeEventListener('keydown',host._atelierKeyHandler);
    host._atelierCleanup?.();
    host._atelierCleanup=cancelSingleTap;
    host._atelierKeyHandler=event=>{
      if(textDialog?.open||zoomDialog?.open)return;
      if(event.key==='ArrowLeft'){event.preventDefault();move('previous',previous.id);}
      if(event.key==='ArrowRight'){event.preventDefault();move('next',next.id);}
    };
    document.addEventListener('keydown',host._atelierKeyHandler);
    const preload=()=>[previous,next].forEach(item=>{const img=new Image();img.src=item.imageOverview||item.image;});
    const current=host.querySelector('.atelier-masterpiece img');
    if(current?.complete)preload();else current?.addEventListener('load',preload,{once:true});
  }

  function renderGrid(host){
    const topbar=`<div class="atelier-topbar">${(root.EMFDNavigation?.backLinkMarkup?.('#flur')||'<a class="back" href="#flur">Zurück</a>')}<div class="atelier-topbar-controls"><button class="atelier-music-toggle" type="button" data-music-toggle aria-label="Musik einschalten" aria-pressed="false"><span class="dock-icon" aria-hidden="true"></span></button><button type="button" data-atelier-help aria-label="Hilfe öffnen">?</button></div></div>`;
    const background='<img class="atelier-background atelier-background--soft" src="../media/optimized/rooms/P04-atelier-kartenauslage-v1-864-v1-dcb82f452e.webp" alt="" aria-hidden="true" width="864" height="1536" fetchpriority="high">';
    if(!group){
      host.innerHTML=shell(`${background}${topbar}<div class="atelier-invitation"><div class="atelier-invitation-card" aria-labelledby="atelier-invitation-title"><span class="eyebrow">Das Atelier der Bildkarten</span><h1 id="atelier-invitation-title">Wie möchtest du heute schauen?</h1><p>Entdecke alle Kunstwerke oder wähle eine der vier Gruppen. Du kannst deine Auswahl jederzeit ändern.</p><div class="atelier-choice" role="group" aria-label="Bildkarten auswählen"><button class="atelier-choice-primary" type="button" data-group="Alle">Alle entdecken</button><div class="atelier-choice-groups">${GROUPS.slice(1).map(name=>`<button type="button" data-group="${name}">${name}</button>`).join('')}</div></div></div></div>`,'atelier-overview atelier-overview--invitation');
    }else{
      const visible=cards().filter(card=>group==='Alle'||card.group===group);
      const groupLabel=group==='Alle'?'Alle entdecken':group;
      host.innerHTML=shell(`${background}${topbar}<div class="atelier-grid-content"><div class="atelier-gallery-intro"><span class="eyebrow">Das Atelier der Bildkarten</span><h1>${esc(groupLabel)}</h1><p>Wähle ein Kunstwerk. Den zugehörigen Text öffnest du erst in der Kartenansicht.</p></div><nav class="atelier-filters" aria-label="Kartengruppe wechseln">${GROUPS.map(name=>`<button type="button" data-group="${name}" aria-pressed="${name===group}"${name===group?' aria-current="true"':''}>${name==='Alle'?'Alle entdecken':name}</button>`).join('')}</nav><p class="atelier-result-count" role="status">${visible.length} ${visible.length===1?'Bildkarte':'Bildkarten'}</p><div class="atelier-grid">${visible.map(card=>`<a class="atelier-grid-card" href="#karte/${card.id}" data-grid-card="${card.id}">${image(card)}<span><strong>${esc(card.name)}</strong><small>${esc(card.group)} · ${card.id}</small></span></a>`).join('')}</div></div>`,'atelier-overview');
    }
    bindHelp(host);bindImages(host);
    host.querySelectorAll('[data-grid-card]').forEach(link=>link.addEventListener('click',()=>{rememberGridScroll();rememberReturn('#karten');}));
    host.querySelectorAll('[data-group]').forEach(button=>button.addEventListener('click',()=>{group=button.dataset.group;clearGridScroll();try{sessionStorage.setItem(GROUP_KEY,group);}catch{}renderGrid(host);root.scrollTo({top:0,left:0,behavior:'auto'});host.querySelector(`[data-group="${group}"]`)?.focus({preventScroll:true});}));
    if(group)restoreGridScroll();
  }

  function selectGroup(name){
    if(!GROUPS.includes(name))return false;
    group=name;
    clearGridScroll();
    try{sessionStorage.setItem(GROUP_KEY,group);}catch{}
    return true;
  }
  root.EMFDAtelier={renderAtelier,renderTable,renderGrid,returnTarget,rememberReturn,selectGroup};
})(globalThis);

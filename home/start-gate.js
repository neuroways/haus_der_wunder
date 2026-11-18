/* EMFD-START-02: Haustür, Geschenkbrief, Einführung und freiwillige Installationshilfe. */
(function(root){
  const main=document.querySelector('main');
  if(!main)return;

  const KEYS=Object.freeze({
    gift:'emfd.start02.gift-completed.v1',
    tutorial:'emfd.start02.tutorial-completed.v1',
    install:'emfd.start02.install-dismissed.v1',
    intro:'emfd.start03.intro-completed.v1'
  });
  const ASSETS=Object.freeze({
    door:'assets/rooms/startseite-haustuer-v1.webp',
    A01:'../media/start/EMFD-START-02-A01-tisch.webp',
    A02:'../media/start/EMFD-START-02-A02-umschlag-koerper.webp',
    A03:'../media/start/EMFD-START-02-A03-umschlag-lasche.webp',
    A04:'assets/gift/seal.webp',
    A05:'../media/start/EMFD-START-02-A05-briefpapier.webp',
    A06:'../media/start/EMFD-START-02-A06-geschenkkarte-vorderseite.webp'
  });
  const STATES=Object.freeze(['closed','opening','letter-visible','gift-card-visible','world-opening','sound-choice','completed']);
  const reduced=root.matchMedia?.('(prefers-reduced-motion: reduce)')||{matches:false};
  let phase='closed',pendingTutorial=false,pendingGiftStart=null,installPrompt=null,arrivalLetter=false;

  const read=key=>{try{return root.localStorage?.getItem(key)==='1';}catch{return false;}};
  const write=key=>{try{root.localStorage?.setItem(key,'1');}catch{}};
  const escape=value=>String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const firstVisit=()=>!read(KEYS.gift)||!read(KEYS.intro);

  root.addEventListener('online',()=>{if(document.body.classList.contains('start02-active'))retryMissing();});

  root.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;});

  // Selected URLs always represent the same physical asset (A01...A06).
  // The archive is used as a candidate list, never as evidence that an image loaded.
  const resolvedAssets=new Map();
  function assetURL(id){return resolvedAssets.get(id)||ASSETS[id];}
  function assignResolved(url,resolved){
    if(!resolved)return;
    const id=Object.keys(ASSETS).find(name=>ASSETS[name]===url);
    if(!id)return;
    resolvedAssets.set(id,resolved);
    main.querySelectorAll(`[data-start02-asset="${id}"]`).forEach(image=>{
      if(!image.complete||!image.naturalWidth)image.src=resolved;
    });
  }
  function loadDirect(url,timeout=7500){
    return new Promise(resolve=>{
      const image=new Image();let settled=false;
      const finish=ok=>{if(settled)return;settled=true;clearTimeout(timer);image.onload=image.onerror=null;resolve(ok);};
      const timer=root.setTimeout(()=>finish(false),timeout);
      image.onload=()=>finish(image.naturalWidth>0);image.onerror=()=>finish(false);image.src=url;
    });
  }
  async function loadOne(url,timeout=7500){
    const resolver=root.EMFDMedia?.resolve;
    if(resolver){
      // Catalog candidates are retried per motif; a permanent missing file is
      // not silently replaced by an unrelated card or background.
      const found=await resolver(url).catch(()=>null);
      if(found){assignResolved(url,found);return {url,resolved:found,ok:true};}
    }else if(await loadDirect(url,timeout)){
      assignResolved(url,url);return {url,resolved:url,ok:true};
    }
    return {url,ok:false};
  }
  async function preload(urls){
    let index=0;const results=[];
    await Promise.all(Array.from({length:Math.min(2,urls.length)},async()=>{
      while(index<urls.length)results.push(await loadOne(urls[index++]));
    }));
    return results;
  }
  function retryMissing(scope=main){
    root.EMFDMedia?.retry?.();
    scope.querySelectorAll('img[data-start02-asset]').forEach(image=>{
      if(image.complete&&image.naturalWidth)return;
      const id=image.dataset.start02Asset;
      image.hidden=false;
      const refresh=new URL(assetURL(id),document.baseURI);
      refresh.searchParams.set('emfd_retry',String(Date.now()));
      image.src=refresh.href;
    });
  }
  function bindMediaFailures(scope=main){
    scope.querySelectorAll('img[data-start02-asset]').forEach(image=>{
      const container=image.closest('[data-start02-media]');
      const status=container?.querySelector('[data-start02-missing]');
      const loaded=()=>{
        image.hidden=false;container?.classList.remove('is-missing');if(status)status.hidden=true;
        if(image.dataset.start02Asset==='A05')image.closest('.start02-letter-sheet')?.style.setProperty('--start02-paper',`url(${JSON.stringify(image.currentSrc||image.src)})`);
      };
      const failed=()=>{
        // The global capture-phase recovery attempts same-motif variants first.
        image.hidden=true;container?.classList.add('is-missing');if(status)status.hidden=false;
        if(image.dataset.start02Asset==='A05')image.closest('.start02-letter-sheet')?.style.removeProperty('--start02-paper');
        const retry=scope.querySelector('[data-start02-retry]');if(retry)retry.hidden=false;
      };
      image.addEventListener('load',loaded);
      image.addEventListener('error',failed);
      if(image.complete)(image.naturalWidth?loaded:failed)();
    });
    scope.querySelector('[data-start02-retry]')?.addEventListener('click',()=>retryMissing(scope));
  }
  function setMode(active){
    document.body.classList.toggle('start-gate-mode',active);
    document.body.classList.toggle('start02-active',active);
  }
  function setPhase(next){
    if(!STATES.includes(next))return;
    phase=next;
    const scene=main.querySelector('[data-start02-scene]');
    if(scene)scene.dataset.state=phase;
  }

  function renderDoor(){
    setMode(true);setPhase('closed');
    const needsGift=firstVisit();
    main.innerHTML=`<section class="start02 start02-door" aria-labelledby="start-gate-title" data-start02-scene data-state="closed">
      <figure class="start02-door-frame" data-start02-media>
        <img class="start02-door-art" data-start02-asset="door" src="${assetURL('door')}" alt="Eine geschlossene petrolblaue Haustür mit goldenem Sternornament, umrahmt von Ranken und Laternen." width="864" height="1536" fetchpriority="high">
        <p class="start02-media-status" data-start02-missing hidden role="status">Das Haustürbild ist gerade nicht verfügbar. Du kannst das Haus trotzdem betreten.</p>
        <figcaption class="start02-door-copy"><span>Ein Moment für dich</span><h1 id="start-gate-title">Das Haus der kleinen Wunder</h1><p>Dieses Haus habe ich für dich gestaltet. Komm herein und sieh dich um.</p></figcaption>
        <div class="start02-door-actions">
          <button type="button" class="primary" data-start02-enter ${needsGift?'disabled aria-busy="true"':''}>${needsGift?'Die Tür öffnet sich gleich.':'Die Tür öffnen'}</button>
        </div>
      </figure>
      <p class="start02-status" data-start02-status role="status">Du darfst ankommen, ohne dich verändern zu müssen.</p>
    </section>`;
    bindMediaFailures();
    const enter=main.querySelector('[data-start02-enter]');
    enter.addEventListener('click',()=>needsGift?openGift(false):enterWithPreference());
    if(needsGift){
      // Start loading in advance, but never block the doorway for slow or missing art.
      const releaseDoor=()=>{if(!enter.isConnected)return;enter.disabled=false;enter.removeAttribute('aria-busy');enter.textContent='Die Tür öffnen';};
      const softDeadline=root.setTimeout(releaseDoor,2500);
      preload([ASSETS.A01,ASSETS.A02,ASSETS.A03,ASSETS.A04,ASSETS.A05,ASSETS.A06]).then(results=>{
        root.clearTimeout(softDeadline);releaseDoor();
        const status=main.querySelector('[data-start02-status]');
        if(status&&results.some(result=>!result.ok))status.textContent='Einige Briefillustrationen sind noch nicht verfügbar. Der Geschenkbrief bleibt als Text zugänglich.';
      }).catch(releaseDoor);
    }
    root.EMFDUI?.enhance(main);root.dispatchEvent(new CustomEvent('emfd:start-gate-rendered'));
  }

  function giftMarkup(){
    const envelope=phase==='closed'||phase==='opening';
    const letter=phase==='letter-visible';
    const world=phase==='world-opening'||phase==='sound-choice';
    const card=phase==='gift-card-visible'||world;
    return `<section class="start02 start02-gift" aria-labelledby="start02-gift-title" data-start02-scene data-state="${phase}"><h1 id="start02-gift-title" class="sr-only">${letter?'Dein Geschenkbrief':card?'Deine kleine Welt':'Dein Geschenk'}</h1>
      <div class="start02-gift-toolbar"><button type="button" data-start02-door-back>Zur Haustür</button><button type="button" data-start02-skip ${world?'hidden':''}>Überspringen</button></div>
      <div class="start02-table" data-start02-media>
        <img class="start02-table-art" data-start02-asset="A01" src="${assetURL('A01')}" alt="Magischer Holztisch als Hintergrund der Geschenkbrief-Szene.">
        <p data-start02-missing hidden class="start02-media-status" role="status">Die Tischillustration A01 wurde noch nicht bereitgestellt.</p>
        ${envelope?`<div class="start02-envelope" aria-label="Grüner Umschlag mit goldenem Herzsiegel">
          <div data-start02-media><img data-start02-asset="A02" class="start02-envelope-body" src="${assetURL('A02')}" alt="Grüner Umschlagkörper mit goldenen diagonalen Linien."><span data-start02-missing hidden>Umschlagkörper A02 fehlt.</span></div>
          <div data-start02-media><img data-start02-asset="A03" class="start02-envelope-flap" src="${assetURL('A03')}" alt="Separate grüne Umschlaglasche mit goldenen diagonalen Linien."><span data-start02-missing hidden>Umschlaglasche A03 fehlt.</span></div>
          <div data-start02-media><img data-start02-asset="A04" class="start02-envelope-seal" src="${assetURL('A04')}" alt="Goldenes Herzsiegel."><span data-start02-missing hidden>Herzsiegel A04 fehlt.</span></div>
        </div>`:''}
        ${letter?`<article class="start02-letter" data-start02-media>
          <div class="start02-letter-sheet">
          <img data-start02-asset="A05" class="start02-letter-paper" src="${assetURL('A05')}" alt="Blankes, floral verziertes Briefpapier.">
          <div class="start02-letter-copy" tabindex="-1"><span>Ein Moment für dich</span><h2>Eine Tür für dich</h2><p>Mit diesem Haus öffne ich dir eine Tür zu etwas, das mir persönlich sehr viel bedeutet.</p><p>Aber was dahinter liegt, gehört ganz dir.</p><p>Ich öffne meine Tür. Doch du gehst in dein eigenes Haus.</p><p>Du darfst dort verweilen, entdecken, träumen und den Moment genießen. Ganz allein mit dir.</p><p>Du darfst ankommen, ohne dich verändern zu müssen.</p></div>
          <p data-start02-missing hidden class="start02-media-status">Das Briefpapier A05 fehlt; der bestätigte Brieftext bleibt lesbar.</p>
          </div>
        </article>`:''}
        ${card?`<figure class="start02-gift-card" data-start02-media aria-label="Deine Geschenkkarte">
          <button type="button" class="start02-card-portal" data-start02-card-portal aria-label="Geschenkkarte umdrehen" ${world?'disabled':''}>
            <img data-start02-asset="A06" src="${assetURL('A06')}" alt="Die Geschenkkarte: Das Haus der kleinen Wunder mit einer offenen, leuchtenden Tür.">
            <img class="gift-reverse" src="assets/recovery/rueckseite.jpeg" alt="Rückseite der Geschenkkarte"><span data-start02-missing hidden class="start02-media-status">Deine Karte wartet auf dich. Öffne hier deine kleine Welt.</span>
          </button>
          <figcaption>${world?'':'Berühre die Karte, um sie umzudrehen.'}</figcaption>
        </figure>`:''}
        ${world?`<div class="start02-world" aria-hidden="true"><img src="assets/recovery/flur-v2-864-v1-e7d3476528.webp" alt=""><span></span></div>`:''}
      </div>
      <div class="start02-gift-actions">
        <button type="button" data-start02-retry hidden>Illustrationen erneut laden</button>
        ${phase==='closed'?'<button type="button" class="primary" data-start02-open-envelope>Umschlag öffnen</button>':''}
        ${phase==='opening'?'<p role="status">Der Umschlag öffnet sich.</p>':''}
        ${letter?`<button type="button" class="primary" data-start02-show-card>${arrivalLetter?'Das Haus kennenlernen':'Zum Umschlag'}</button>`:''}
        ${world?'<button type="button" class="primary" data-gift-continue>Weiter</button>':''}
      </div>
    </section>`;
  }
  function renderGift(start='closed'){
    setMode(true);setPhase(start);main.innerHTML=giftMarkup();bindMediaFailures();
    main.querySelector('[data-start02-door-back]')?.addEventListener('click',renderDoor);
    main.querySelector('[data-start02-skip]')?.addEventListener('click',()=>phase==='letter-visible'?(arrivalLetter?startTutorial(true):enterHall()):showSoundChoice());
    main.querySelector('[data-gift-continue]')?.addEventListener('click',showSoundChoice);
    main.querySelector('[data-start02-open-envelope]')?.addEventListener('click',beginOpening);
    main.querySelector('[data-start02-show-card]')?.addEventListener('click',()=>arrivalLetter?startTutorial(true):renderGift('closed'));
    main.querySelector('[data-start02-card-portal]')?.addEventListener('click',beginWorld);
    root.EMFDUI?.enhance(main);
  }
  function beginOpening(){
    setPhase('opening');renderGift('opening');preload([ASSETS.A05,ASSETS.A06]);
    root.setTimeout(()=>{if(phase==='opening'&&location.hash==='#ankommen')showCard();},reduced.matches?40:950);
  }
  function showCard(){renderGift('gift-card-visible');main.querySelector('[data-start02-card-portal]')?.focus({preventScroll:true});}
  function beginWorld(){
    if(phase!=='gift-card-visible')return;
    renderGift('world-opening');
    main.querySelector('[data-gift-continue]')?.focus({preventScroll:true});
  }
  function showSoundChoice(){
    if(location.hash!=='#ankommen')return;
    if(phase!=='world-opening')renderGift('world-opening');
    setPhase('sound-choice');
    root.EMFDMusicEntry?.show(true,{onChoose:showArrivalLetter,onCancel:showCard});
  }
  function showArrivalLetter(){arrivalLetter=true;renderGift('letter-visible');root.scrollTo?.(0,0);main.querySelector('.start02-letter-copy')?.focus({preventScroll:true});}
  function enterWithPreference(){
    const current=root.EMFDMusicEntry?.preference();
    if(!current){showSoundChoice();return;}
    root.EMFDMusic?.setBackgroundPreference(current.value,{start:current.value==='on'});
    enterHall();
  }
  function completeGift(){setPhase('completed');write(KEYS.gift);pendingTutorial=false;enterHall();}
  function enterHall(){
    if(location.hash==='#flur'){setMode(false);if(pendingTutorial)root.setTimeout(()=>startTutorial(true),100);return;}
    location.hash='flur';
  }
  function openGift(replay=true){
    arrivalLetter=false;
    if(location.hash!=='#ankommen'){pendingGiftStart=replay?'letter-visible':'closed';location.hash='ankommen';}
    else renderGift(replay?'letter-visible':'closed');
  }

  function ensureDialogs(){
    if(!document.querySelector('#start02-tutorial-dialog'))document.body.insertAdjacentHTML('beforeend',`<dialog id="start02-tutorial-dialog" class="start02-dialog" aria-labelledby="start02-tutorial-title"><button type="button" class="start02-dialog-close" aria-label="Einführung schließen">×</button><div data-start02-tutorial-content></div><div class="start02-dialog-actions"><button type="button" data-start02-tutorial-skip>Überspringen</button><button type="button" class="primary" data-start02-tutorial-next>Weiter</button></div></dialog>`);
    if(!document.querySelector('#start02-install-dialog'))document.body.insertAdjacentHTML('beforeend',`<dialog id="start02-install-dialog" class="start02-dialog" aria-labelledby="start02-install-title"><button type="button" class="start02-dialog-close" aria-label="Installationshilfe schließen">×</button><h2 id="start02-install-title">Das Haus griffbereit</h2><div data-start02-install-copy></div><div class="start02-dialog-actions"><button type="button" data-start02-install-later>Später</button><button type="button" class="primary" data-start02-install-do>Installieren</button></div></dialog>`);
  }
  function startTutorial(firstRun=false){
    ensureDialogs();
    root.EMFDStartTour?.start({dialog:document.querySelector('#start02-tutorial-dialog'),onFinish:()=>{
      write(KEYS.tutorial);write(KEYS.intro);pendingTutorial=false;
      if(firstRun){arrivalLetter=false;completeGift();}else enterHall();
    }});
  }
  function showInstallHelp(automatic=false){
    if(automatic&&read(KEYS.install))return;
    ensureDialogs();const dialog=document.querySelector('#start02-install-dialog');const copy=dialog.querySelector('[data-start02-install-copy]');const install=dialog.querySelector('[data-start02-install-do]');
    const ios=/iphone|ipad|ipod/i.test(navigator.userAgent)&&!root.MSStream;
    if(installPrompt){copy.innerHTML='<p>Du kannst das Haus wie eine App auf deinem Gerät ablegen. Das ist freiwillig.</p>';install.hidden=false;install.textContent='Installieren';install.onclick=async()=>{installPrompt.prompt();await installPrompt.userChoice.catch(()=>null);installPrompt=null;write(KEYS.install);dialog.close();};}
    else if(ios){copy.innerHTML='<p>Tippe in Safari auf <strong>Teilen</strong> und danach auf <strong>Zum Home-Bildschirm</strong>.</p>';install.hidden=true;}
    else{copy.innerHTML='<p>Falls dein Browser die Installation unterstützt, findest du <strong>App installieren</strong> im Browsermenü. Du kannst das Haus auch ohne Installation vollständig nutzen.</p>';install.hidden=true;}
    const close=()=>{write(KEYS.install);dialog.close();};dialog.querySelector('[data-start02-install-later]').onclick=close;dialog.querySelector('.start02-dialog-close').onclick=close;dialog.oncancel=event=>{event.preventDefault();close();};
    if(!dialog.open)dialog.showModal();dialog.querySelector('[data-start02-install-later]').focus();
  }

  document.addEventListener('click',event=>{
    const gift=event.target.closest?.('[data-start-gift-open]');if(gift){event.preventDefault();openGift(true);return;}
    if(event.target.closest?.('[data-start02-tutorial-replay]')){event.preventDefault();document.querySelector('#help-dialog')?.close();startTutorial(false);}
    if(event.target.closest?.('[data-start02-install-help]')){event.preventDefault();document.querySelector('#help-dialog')?.close();showInstallHelp(false);}
  });
  function renderRoute(){
    const route=location.hash.slice(1)||'ankommen';
    if(route==='ankommen'&&pendingGiftStart){const start=pendingGiftStart;pendingGiftStart=null;renderGift(start);}
    else if(route==='ankommen')renderDoor();else setMode(false);
    if(route==='flur'&&pendingTutorial)root.setTimeout(()=>startTutorial(true),140);
  }
  root.addEventListener('hashchange',()=>root.setTimeout(renderRoute,0));
  root.EMFDStart02=Object.freeze({openGift,startTutorial,showInstallHelp,assets:ASSETS,states:STATES,state:()=>phase,storageKeys:KEYS});
  root.setTimeout(renderRoute,0);
})(globalThis);

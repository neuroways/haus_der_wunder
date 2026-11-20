/* EMFD-START-02 (seit BOOK-01d / TUT-02): Geschenkbrief, Geschenkkarte und freiwillige Installationshilfe.
 * Haustür, Musikfrage und Starttour sind durch die Eingangsszene (entrance.js) ersetzt; die Speicherschlüssel bleiben. */
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
    A06:'../media/start/EMFD-START-02-A06-geschenkkarte-vorderseite.webp',
    back:'assets/recovery/rueckseite.jpeg'
  });
  const STATES=Object.freeze(['closed','opening','letter-visible','gift-card-visible','world-opening','sound-choice','completed']);
  const reduced=root.matchMedia?.('(prefers-reduced-motion: reduce)')||{matches:false};
  let phase='closed',installPrompt=null,arrivalLetter=false,host=main;

  const read=key=>{try{return root.localStorage?.getItem(key)==='1';}catch{return false;}};
  const write=key=>{try{root.localStorage?.setItem(key,'1');}catch{}};
  const escape=value=>String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));

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
    host.querySelectorAll(`[data-start02-asset="${id}"]`).forEach(image=>{
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
  function retryMissing(scope=host){
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
  function bindMediaFailures(scope=host){
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
    const scene=host.querySelector('[data-start02-scene]');
    if(scene)scene.dataset.state=phase;
  }

  /* EMFD-BOOK-01d / TUT-02 v0.3: Der Geschenkbereich (Umschlag, Brief, Geschenkkarte mit QR-Rückkehrlink) öffnet sich
   * als Ebene über der aktuellen Ansicht – aus dem Brief-Hotspot der Eingangsszene, aus der Hilfe und aus alten
   * Verknüpfungen. Animationen, Medien und Originaltexte bleiben erhalten. Nach dem Schließen ist man wieder genau dort,
   * wo man war (Szene und Bildausschnitt bleiben unberührt). Die Musikfrage gehört jetzt zur Eingangsglocke. */
  let giftDialog=null,giftOpener=null;
  function ensureGiftDialog(){
    if(giftDialog?.isConnected)return giftDialog;
    giftDialog=document.createElement('dialog');giftDialog.id='start02-gift-dialog';giftDialog.className='start02-gift-dialog';
    giftDialog.setAttribute('aria-label','Dein Geschenk');
    giftDialog.addEventListener('cancel',event=>{event.preventDefault();closeGift();});
    document.body.append(giftDialog);return giftDialog;
  }
  function cardBackMarkup(){
    let qr='';try{qr=root.EMFDStartTour?.qrSVG?.()||'';}catch{qr='';}
    const url=root.EMFDStartTour?.giftURL||'https://flowisaurus.de/wunderhaus/home/#ankommen';
    return `<span class="gift-reverse start02-card-back"><img src="${assetURL('back')}" alt="" loading="lazy"><span class="start02-card-qr">${qr||`<span>${escape(url)}</span>`}</span><span class="sr-only">Rückseite der Geschenkkarte mit QR-Code. Er führt zurück zu diesem Haus: ${escape(url)}</span></span>`;
  }
  function giftMarkup(){
    const envelope=phase==='closed'||phase==='opening';
    const letter=phase==='letter-visible';
    const card=phase==='gift-card-visible';
    return `<section class="start02 start02-gift" aria-labelledby="start02-gift-title" data-start02-scene data-state="${phase}"><h1 id="start02-gift-title" class="sr-only">${letter?'Dein Geschenkbrief':card?'Deine Geschenkkarte':'Dein Geschenk'}</h1>
      <div class="start02-gift-toolbar">${letter?'':`<span></span>`}${card?'<button type="button" class="emfd-button emfd-button--secondary emfd-button--compact emfd-button--no-arrow emfd-button--iconless" data-start02-back-letter><span class="emfd-button__label">Zum Brief</span></button>':''}<button type="button" class="emfd-iconbutton" data-start02-close aria-label="Geschenk schließen" title="Geschenk schließen">${root.EMFDUIKit?root.EMFDUIKit.icon('close'):'×'}</button></div>
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
          <button type="button" class="start02-card-portal" data-start02-card-portal aria-pressed="false" aria-label="Geschenkkarte umdrehen – QR-Code ansehen">
            <img data-start02-asset="A06" src="${assetURL('A06')}" alt="Die Geschenkkarte: Das Haus der kleinen Wunder mit einer offenen, leuchtenden Tür.">
            ${cardBackMarkup()}<span data-start02-missing hidden class="start02-media-status">Deine Karte wartet auf dich. Öffne hier deine kleine Welt.</span>
          </button>
          <figcaption>Berühre die Karte, um sie umzudrehen. Ihr QR-Code führt dich wieder zu diesem Haus.</figcaption>
        </figure>`:''}
      </div>
      <div class="start02-gift-actions">
        <button type="button" data-start02-retry hidden class="emfd-textbutton">Illustrationen erneut laden</button>
        ${phase==='closed'?'<button type="button" class="emfd-button emfd-button--primary emfd-button--compact emfd-button--no-arrow emfd-button--iconless" data-start02-open-envelope><span class="emfd-button__label">Umschlag öffnen</span></button>':''}
        ${phase==='opening'?'<p role="status">Der Umschlag öffnet sich.</p>':''}
        ${letter?'<button type="button" class="emfd-button emfd-button--primary emfd-button--compact emfd-button--no-arrow emfd-button--iconless" data-start02-show-card><span class="emfd-button__label">Deine Geschenkkarte</span></button>':''}
        ${card?'<button type="button" class="emfd-button emfd-button--secondary emfd-button--compact emfd-button--no-arrow emfd-button--iconless" data-start02-done><span class="emfd-button__label">Schließen</span></button>':''}
      </div>
    </section>`;
  }
  function renderGift(start='closed'){
    const dialog=ensureGiftDialog();host=dialog;
    setPhase(start);dialog.innerHTML=giftMarkup();bindMediaFailures(dialog);
    dialog.querySelector('[data-start02-close]')?.addEventListener('click',closeGift);
    dialog.querySelector('[data-start02-done]')?.addEventListener('click',closeGift);
    dialog.querySelector('[data-start02-back-letter]')?.addEventListener('click',()=>renderGift('letter-visible'));
    dialog.querySelector('[data-start02-open-envelope]')?.addEventListener('click',beginOpening);
    // Der Umschlag selbst öffnet ebenfalls (Antippen/Klicken); der Knopf bleibt für Tastatur und Screenreader.
    if(phase==='closed'){const env=dialog.querySelector('.start02-envelope');if(env){env.classList.add('is-tappable');env.addEventListener('click',beginOpening);}}
    dialog.querySelector('[data-start02-show-card]')?.addEventListener('click',showCard);
    dialog.querySelector('[data-start02-card-portal]')?.addEventListener('click',flipCard);
    if(start==='letter-visible')write(KEYS.gift); // Brief gelesen; unabhängig vom Tutorialstatus.
    if(!dialog.open)dialog.showModal();
    (dialog.querySelector('.start02-letter-copy')||dialog.querySelector('[data-start02-card-portal]')||dialog.querySelector('[data-start02-open-envelope]')||dialog.querySelector('[data-start02-close]'))?.focus({preventScroll:true});
  }
  function beginOpening(){
    renderGift('opening');preload([ASSETS.A05,ASSETS.A06]);
    root.setTimeout(()=>{if(phase==='opening'&&giftDialog?.open)renderGift('letter-visible');},reduced.matches?40:950);
  }
  function showCard(){renderGift('gift-card-visible');}
  function flipCard(){
    const button=giftDialog?.querySelector('[data-start02-card-portal]');if(!button)return;
    const flipped=button.getAttribute('aria-pressed')!=='true';
    button.setAttribute('aria-pressed',String(flipped));button.classList.toggle('is-flipped',flipped);
    button.setAttribute('aria-label',flipped?'Geschenkkarte umdrehen – Vorderseite ansehen':'Geschenkkarte umdrehen – QR-Code ansehen');
  }
  function closeGift(){
    if(giftDialog?.open)giftDialog.close();
    host=main;setPhase('closed');
    if(giftOpener?.isConnected)giftOpener.focus({preventScroll:true});
    giftOpener=null;
    root.dispatchEvent(new CustomEvent('emfd:gift-closed'));
  }
  function enterHall(){if(location.hash!=='#flur')location.hash='flur';}
  /** Öffnet den Geschenkbereich über der aktuellen Ansicht. replay=true beginnt beim Brief, sonst beim Umschlag. */
  function openGift(replay=false){
    giftOpener=document.activeElement&&typeof document.activeElement.focus==='function'?document.activeElement:null;
    arrivalLetter=false;
    // Alle Geschenkbilder vorab anfragen, ohne den Brief aufzuhalten (fehlende Bilder: Hinweis + Text bleibt lesbar).
    preload([ASSETS.A01,ASSETS.A02,ASSETS.A03,ASSETS.A04,ASSETS.A05,ASSETS.A06]).catch(()=>{});
    renderGift(replay?'letter-visible':'closed');
  }

  function ensureDialogs(){
    if(!document.querySelector('#start02-tutorial-dialog'))document.body.insertAdjacentHTML('beforeend',`<dialog id="start02-tutorial-dialog" class="start02-dialog" aria-labelledby="start02-tutorial-title"><button type="button" class="start02-dialog-close" aria-label="Einführung schließen">×</button><div data-start02-tutorial-content></div><div class="start02-dialog-actions"><button type="button" data-start02-tutorial-skip>Überspringen</button><button type="button" class="primary" data-start02-tutorial-next>Weiter</button></div></dialog>`);
    if(!document.querySelector('#start02-install-dialog'))document.body.insertAdjacentHTML('beforeend',`<dialog id="start02-install-dialog" class="start02-dialog" aria-labelledby="start02-install-title"><button type="button" class="start02-dialog-close" aria-label="Installationshilfe schließen">×</button><h2 id="start02-install-title">Das Haus griffbereit</h2><div data-start02-install-copy></div><div class="start02-dialog-actions"><button type="button" data-start02-install-later>Später</button><button type="button" class="primary" data-start02-install-do>Installieren</button></div></dialog>`);
  }
  /** Einführung erneut starten: nur der Tutorialzustand wird zurückgesetzt (entrance.js), nichts anderes. */
  function startTutorial(){root.EMFDEntrance?.restartTutorial?.();}
  function showInstallHelp(automatic=false){
    if(automatic&&read(KEYS.install))return;
    ensureDialogs();const dialog=document.querySelector('#start02-install-dialog');const copy=dialog.querySelector('[data-start02-install-copy]');const install=dialog.querySelector('[data-start02-install-do]');
    const ios=/iphone|ipad|ipod/i.test(navigator.userAgent)&&!root.MSStream;
    if(installPrompt){copy.innerHTML='<p>Du kannst das Haus wie eine App auf deinem Gerät ablegen. Das ist freiwillig.</p>';install.hidden=false;install.textContent='Installieren';install.onclick=async()=>{installPrompt.prompt();await installPrompt.userChoice.catch(()=>null);installPrompt=null;write(KEYS.install);dialog.close();};}
    else if(ios){copy.innerHTML='<p>Tippe in Safari auf <strong>Teilen</strong> und danach auf <strong>Zum Home-Bildschirm</strong>.</p>';install.hidden=true;}
    else{copy.innerHTML='<p>Falls dein Browser die Installation unterstützt, findest du <strong>App installieren</strong> im Browsermenü. Du kannst das Haus auch ohne Installation vollständig nutzen.</p>';install.hidden=true;}
    const close=()=>{write(KEYS.install);dialog.close();root.dispatchEvent(new CustomEvent('emfd:install-dismissed'));};dialog.querySelector('[data-start02-install-later]').onclick=close;dialog.querySelector('.start02-dialog-close').onclick=close;dialog.oncancel=event=>{event.preventDefault();close();};
    if(!dialog.open)dialog.showModal();dialog.querySelector('[data-start02-install-later]').focus();
  }

  document.addEventListener('click',event=>{
    const gift=event.target.closest?.('[data-start-gift-open]');if(gift){event.preventDefault();document.querySelector('#help-dialog')?.close();openGift(false);return;}
    if(event.target.closest?.('[data-start02-tutorial-replay]')){event.preventDefault();document.querySelector('#help-dialog')?.close();startTutorial();}
    if(event.target.closest?.('[data-start02-install-help]')){event.preventDefault();document.querySelector('#help-dialog')?.close();showInstallHelp(false);}
  });
  function renderRoute(){
    // Der frühere Start (Haustür im Hochformat) ist durch die Eingangsszene ersetzt; hier bleibt nur der Modus zurückgesetzt.
    setMode(false);
  }
  root.addEventListener('hashchange',()=>{if(giftDialog?.open&&!location.hash.startsWith('#raum/'))closeGift();root.setTimeout(renderRoute,0);});
  root.EMFDStart02=Object.freeze({openGift,closeGift,startTutorial,showInstallHelp,enterHall,installAvailable:()=>Boolean(installPrompt),assets:ASSETS,states:STATES,state:()=>phase,storageKeys:KEYS,isOpen:()=>Boolean(giftDialog?.open)});
  root.setTimeout(renderRoute,0);
})(globalThis);

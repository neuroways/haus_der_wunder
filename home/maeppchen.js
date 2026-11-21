/* EMFD-MAEPPCHEN-01/-02 · Das Mäppchen der Begleiterkarte (generisch über die Karten-ID; Abnahme mit O21 und O08).
 *  - Begleitung: Nach dem Aufdecken bietet das Karten-Dock „Mitnehmen“. Genau eine aktive Begleitung, ohne Ablaufdatum.
 *    Ziehen bleibt frei: Wer eine andere Karte mitnimmt, wird gefragt, ob die bisherige zurückgelegt werden soll.
 *  - v0.2 (20.11.2026): eine Bühne mit Kopfzeile. Schmal ersetzt das gewählte Stück das Mäppchen (Detail beginnt unter der
 *    Kopfzeile, ein Scrollbereich, „Zurück zum Mäppchen“); Wide (Container ≥ 960 × 560) Mäppchen links, Stück rechts.
 *    Hörmoment als eigene Szene: Cover oben, Begleiterkarte darunter, Glühwürmchen v0.2 (Papier → kurzer Flug → Sitzpose
 *    an der unteren Kartenecke → Lied über den bestehenden Player → Cover). Musikzeile bei laufender Musik in anderen Szenen.
 *    Zurücklegen nur über die Bestätigung im Vordergrund; erst „Zurücklegen“ beendet Begleitung und Lied.
 *  - Exporte: Karte als PNG, Gedankenblatt und Geschichtenheft als PDF, Mäppchen-Sicherung (JSON, wieder importierbar).
 * Speicher: emfd.maeppchen.v1 {active:{cardId,instanceId,takenAt,draft,updatedAt}} – nur auf diesem Gerät.
 * Medien nur über Register-IDs maeppchen.<Nr> und gluehwuermchen.*; Kartenbild, Cover und Lied über die bestehenden Kataloge. */
(function(root){
  'use strict';
  const KEY='emfd.maeppchen.v1';
  const BACKUP_SCHEMA='emfd.maeppchen.backup/1';
  const CARD_ID=/^O(?:0[1-9]|1\d|2[0-4])$/;
  const storage=(()=>{try{return root.localStorage||null;}catch{return null;}})();
  const doc=()=>root.document;
  const kit=()=>root.EMFDUIKit,reg=()=>root.EMFDRegistry,audio=()=>root.EMFDAudio;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const reduced=()=>Boolean(root.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches)||Boolean(doc()?.body?.classList?.contains('motion-off'));
  const wait=ms=>new Promise(r=>root.setTimeout(r,reduced()?Math.min(ms,120):ms));

  /* ---------- Zustand (rein, testbar) ---------- */
  function normalize(value){
    const a=value&&typeof value==='object'?value.active:null;
    if(!a||!CARD_ID.test(a.cardId)||typeof a.instanceId!=='string'||!a.instanceId)return {version:1,active:null};
    return {version:1,active:{cardId:a.cardId,instanceId:a.instanceId,takenAt:String(a.takenAt||''),draft:typeof a.draft==='string'?a.draft:'',updatedAt:String(a.updatedAt||'')}};
  }
  const newInstance=cardId=>`${cardId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;
  /** Mitnehmen: neue Begleitung mit frischem Entwurf (auch bei derselben Karte). */
  function take(state,cardId,now=new Date()){
    if(!CARD_ID.test(cardId))throw Error('Ungültige Karte');
    return {version:1,active:{cardId,instanceId:newInstance(cardId),takenAt:now.toISOString(),draft:'',updatedAt:now.toISOString()}};
  }
  function giveBack(){return {version:1,active:null};}
  function withDraft(state,text,now=new Date()){if(!state.active)return state;return {version:1,active:{...state.active,draft:String(text),updatedAt:now.toISOString()}};}
  function backupOf(state,now=new Date()){
    if(!state.active)throw Error('Keine aktive Begleitung');
    const card=(root.CARDS||[]).find(c=>c.id===state.active.cardId);
    return {schema:BACKUP_SCHEMA,exportedAt:now.toISOString(),cardId:state.active.cardId,cardName:card?.name||'',instanceId:state.active.instanceId,takenAt:state.active.takenAt,draft:state.active.draft};
  }
  /** Sicherung prüfen und als Zustand übernehmen (Entwurf bleibt editierbar). */
  function fromBackup(data){
    if(!data||data.schema!==BACKUP_SCHEMA||!CARD_ID.test(data.cardId))throw Error('Das ist keine Mäppchen-Sicherung.');
    return normalize({active:{cardId:data.cardId,instanceId:String(data.instanceId||newInstance(data.cardId)),takenAt:data.takenAt,draft:String(data.draft||''),updatedAt:new Date().toISOString()}});
  }
  function load(){try{return normalize(JSON.parse(storage?.getItem(KEY)||'null'));}catch{return normalize(null);}}
  let state=load();
  function save(){try{if(state.active)storage?.setItem(KEY,JSON.stringify(state));else storage?.removeItem(KEY);}catch{}}
  function active(){return state.active?{...state.active}:null;}

  /* ---------- Inhalte über die Karten-ID ---------- */
  function cardOf(id){return (root.CARDS||[]).find(c=>c.id===id)||null;}
  function mediaSrc(nr){const m=reg()?.resolveMedia?.(`maeppchen.${nr}`);return m?.type==='file'?m.src:'';}
  function contentFor(id){
    const c=cardOf(id);if(!c)return null;
    const image=root.EMFDImages?.card?.(id,'card-view')||c.image||'';
    const cover=root.EMFDImages?.cover?.(id)||'';
    const coverFallback=root.EMFDImages?.card?.(id,'playlist-thumbnail')||image;
    return {id,name:c.name,group:c.group,impulse:c.impulse||'',question:c.question||'',story:c.houseStory||'',depth:c.depth||'',image,
      cover:cover||coverFallback,coverFromCatalog:Boolean(cover),alt:c.alt||c.name};
  }
  /** Fehlende Zuordnungen je Karte (für Rückmeldung und Prüfung): genaue ID und Pfad. */
  function missingFor(id){
    const out=[];const c=contentFor(id);if(!c)return [{id,pfad:'data.js CARDS'}];
    if(!c.image)out.push({id:`card.${id}.front`,pfad:'EMFDImages.card / data.js image'});
        if(!c.impulse)out.push({id:`${id}.impulse`,pfad:'data.js impulse'});
    if(!c.question)out.push({id:`${id}.question`,pfad:'data.js question'});
    if(!c.story)out.push({id:`${id}.houseStory`,pfad:'data.js houseStory'});
    const a=audio()?.availability?.(id);if(a==='missing'||a==='unavailable')out.push({id:`audio.${id}`,pfad:`media/audio/${id}-M01.mp3`});
    for(const nr of ASSET_IDS)if(!mediaSrc(nr))out.push({id:`maeppchen.${nr}`,pfad:'data/registry.js medien'});
    for(const fid of FF_IDS){const m=reg()?.resolveMedia?.(fid);if(m?.type!=='file')out.push({id:fid,pfad:'media/maeppchen/gluehwuermchen-v0.2/'});}
    const cv=root.EMFDDeviceStation?.coverFor?.({cardId:id,title:c.name});if(cv?.kind!=='cover')out.push({id:`cover.${id}`,pfad:cv?.kind==='other'?`Arbeitscover ${cv.src} (Player-Paket, Freigabe offen)`:'media/manifest.json Cover (Musikkatalog)'});
    return out;
  }
  const ASSET_IDS=Object.freeze(['00','01','01a','01b','02','03','03a','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22']);

  /* ---------- Glühwürmchen v0.2 (Register gluehwuermchen.*; Anker aus dem Assetregister des Pakets) ---------- */
  const FF=Object.freeze({paper:'gluehwuermchen.papierfalter',body:'gluehwuermchen.flugkoerper',left:'gluehwuermchen.fluegel-links',right:'gluehwuermchen.fluegel-rechts',perched:'gluehwuermchen.sitzpose'});
  const FF_IDS=Object.freeze(Object.values(FF));
  function ffMeta(key){const id=FF[key];const m=reg()?.media?.(id)||{};const r=reg()?.resolveMedia?.(id);return {id,src:r?.type==='file'?r.src:'',w:Number(m.breite)||1,h:Number(m.hoehe)||1,anker:m.anker||{}};}
  function ffImg(key,cls){const m=ffMeta(key);return m.src?`<img class="${cls}" src="${esc(m.src)}" alt="" draggable="false" data-ff="${key}">`:`<span class="${cls} mp-missing" data-missing="${m.id}" aria-hidden="true"></span>`;}
  /** Flugfigur: Körper vor den Flügeln; jeder Flügel mit seinem Drehpunkt auf dem Ansatzpunkt des Körpers (Prozent der Körperbox). */
  function flyerGeometry(){
    const b=ffMeta('body'),l=ffMeta('left'),r=ffMeta('right');
    const part=(wing,key,fbPivot,fbBody)=>{const pv=wing.anker.pivot||fbPivot,ba=b.anker[key]||fbBody;
      return {left:(ba[0]*b.w-pv[0]*wing.w)/b.w*100,top:(ba[1]*b.h-pv[1]*wing.h)/b.h*100,width:wing.w/b.w*100,height:wing.h/b.h*100,ox:pv[0]*100,oy:pv[1]*100};};
    return {ratio:b.w/b.h,left:part(l,'leftWing',[0.97,0.81],[0.33,0.60]),right:part(r,'rightWing',[0.03,0.81],[0.69,0.61])};
  }
  /** Sitzpose (EMFD-CARD-MUSIC-01): Aufsetzpunkt (cardEdge) auf der oberen Rahmenkante des Covers nahe der rechten Ecke. */
  function perchGeometry(cover){
    const p=ffMeta('perched');const edge=p.anker.cardEdge||[0.49,0.86],belly=p.anker.bellyLight||[0.52,0.75];
    const h=Math.max(58,Math.min(150,cover.h*0.2)),w=h*p.w/p.h;const px=cover.x+cover.w*0.82,py=cover.y+cover.h*0.012;
    return {x:px-edge[0]*w,y:py-edge[1]*h,w,h,glow:{x:px-edge[0]*w+belly[0]*w,y:py-edge[1]*h+belly[1]*h}};
  }
  /** Papierfalter auf der Hand: Handflächen-Anker des Falters auf den Landepunkt der Hand (maeppchen.15). */
  function paperGeometry(hand){
    const p=ffMeta('paper');const palm=p.anker.palm||[0.52,0.91];const lp=reg()?.media?.('maeppchen.15')?.anker?.landepunkt||[0.5,0.58];
    const w=Math.max(70,Math.min(150,hand.w*0.55)),h=w*p.h/p.w;
    return {x:hand.x+hand.w*lp[0]-palm[0]*w,y:hand.y+hand.h*lp[1]-palm[1]*h,w,h};
  }
  const pct=p=>`left:${p.left.toFixed(2)}%;top:${p.top.toFixed(2)}%;width:${p.width.toFixed(2)}%;height:${p.height.toFixed(2)}%;transform-origin:${p.ox.toFixed(1)}% ${p.oy.toFixed(1)}%`;
  function img(nr,cls,alt=''){const src=mediaSrc(nr);return src?`<img class="${cls}" src="${esc(src)}" alt="${esc(alt)}" draggable="false" data-mp-asset="${nr}">`:`<span class="${cls} mp-missing" data-mp-asset="${nr}" data-missing="maeppchen.${nr}" aria-hidden="true"></span>`;}
  /** Originalcover über die Karten-ID (EMFD-CARD-MUSIC-01): Musikkatalog (aktuell), sonst registriertes Originalcover
   *  (Register cover.<ID>), sonst wie im Musikzimmer (Arbeitscover, Kartenvorderseite). Keine feste Karten-ID im Code. */
  function coverOf(c){
    const cat=root.EMFDImages?.cover?.(c.id);if(cat)return {src:cat,kind:'cover'};
    const r=reg()?.resolveMedia?.(`cover.${c.id}`);if(r?.type==='file')return {src:r.src,kind:'cover'};
    const x=root.EMFDDeviceStation?.coverFor?.({cardId:c.id,title:c.name});return {src:x?.src||c.cover,kind:x?.kind||'card'};
  }

  /* ---------- Bühne ---------- */
  const WIDE={w:960,h:560};
  const LABELS=Object.freeze({card:'Motivkarte',impulse:'Impuls',question:'Frage',book:'Gedankenbuch',story:'Geschichten',store:'Sichern und Ablage',listen:'Hörmoment'});
  let dialog=null,opener=null,view=null,saveTimer=0,unsub=null,folder=null,confirmBox=null;
  // view: {scene:'folder'|'detail'|'listen', detail:null|'card'|'impulse'|'question'|'book'|'story'|'store', trigger, ff:'hand'|'flying'|'perched', covered, returning, opened}
  function markup(c){
    const cover=coverOf(c);const fl=flyerGeometry();
    return `<div class="mp-stage" data-mp-stage data-scene="folder">
      ${img('00','mp-bg mp-bg--table')}
      <div class="mp-bar" data-mp-bar>
        ${kit().button({label:'Schließen',variant:'secondary',iconName:'close',className:'emfd-button--compact',data:{'data-mp-close':''}})}
        ${kit().button({label:'Zurück zum Mäppchen',variant:'secondary',iconName:'chevron-left',className:'emfd-button--compact mp-bar__back',data:{'data-mp-back':''}})}
        <p class="mp-title"><span>Deine Begleitung</span> ${esc(c.name)}<small data-mp-subtitle></small></p>
        <span class="mp-bar__end">
          ${kit().button({label:'Sichern',variant:'secondary',iconName:'download',className:'emfd-button--compact',data:{'data-mp-show':'store'}})}
          ${kit().button({label:'In die Schachtel zurücklegen',variant:'secondary',iconName:'cards',className:'emfd-button--compact',data:{'data-mp-giveback-ask':''}})}
        </span>
      </div>
      <div class="mp-body" data-mp-body>
        <section class="mp-pane mp-pane--folder" data-mp-pane="folder" aria-label="Das Mäppchen">
          <div class="mp-folder is-closed" data-mp-folder>
            ${img('03a','mp-fold')}
            <div class="mp-half mp-half--left" data-mp-half="left">
              ${img('02','mp-inner')}
              <button type="button" class="mp-item mp-item--card" data-mp-open="card" aria-label="Motivkarte ${esc(c.name)}"><img src="${esc(c.image)}" alt="" draggable="false"></button>
              ${img('04','mp-pocket mp-pocket--card')}
              <button type="button" class="mp-item mp-item--impulse" data-mp-open="impulse" aria-label="Impuls">${img('09','mp-fill')}<span class="mp-label mp-label--impulse" aria-hidden="true">Impuls</span></button>
              ${img('05','mp-pocket mp-pocket--impulse')}
              <button type="button" class="mp-item mp-item--question" data-mp-open="question" aria-label="Frage">${img('10','mp-fill')}<span class="mp-label mp-label--question" aria-hidden="true">Frage</span></button>
              ${img('06','mp-pocket mp-pocket--question')}
            </div>
            <div class="mp-half mp-half--right" data-mp-half="right">
              <button type="button" class="mp-item mp-item--story" data-mp-open="story" aria-label="Geschichten">${img('12','mp-fill')}<img class="mp-story-thumb" src="${esc(c.image)}" alt="" draggable="false"><span class="mp-label mp-label--story" aria-hidden="true">Geschichten</span></button>
              <button type="button" class="mp-item mp-item--book" data-mp-open="book" aria-label="Gedankenbuch">${img('11','mp-fill')}<span class="mp-label mp-label--book" aria-hidden="true">Gedankenbuch</span></button>
              ${img('07','mp-band')}
              <button type="button" class="mp-item mp-item--falter" data-mp-listen aria-label="Papierfalter – Hörmoment öffnen">${ffImg('paper','mp-fal')}</button>
              ${img('08','mp-lasche')}
            </div>
            <div class="mp-flap" data-mp-flap aria-hidden="true">
              <div class="mp-flap__front"><div class="mp-mirror">${img('01','mp-fill')}${img('01a','mp-strap')}${img('01b','mp-loop')}</div></div>
              <div class="mp-flap__back">${img('03','mp-fill')}</div>
            </div>
            <button type="button" class="mp-open-hit" data-mp-unfold>Mäppchen öffnen</button>
          </div>
        </section>
        <section class="mp-pane mp-pane--detail" data-mp-pane="detail" hidden><div class="mp-scroll" data-mp-read tabindex="-1"></div></section>
        <section class="mp-pane mp-pane--listen" data-mp-pane="listen" aria-label="Hörmoment" hidden>
          ${img('22','mp-listen__sky')}
          <div class="mp-listen__layout" data-mp-listen-layout>
            <div class="mp-listen__box" data-mp-lbox>
              <div class="mp-listen__card" data-mp-lcard><img src="${esc(c.image)}" alt="${esc(c.alt)}" draggable="false"></div>
              <figure class="mp-listen__cover" data-mp-cover data-cover-kind="${cover.kind}"><img src="${esc(cover.src)}" alt="Cover: ${esc(c.name)}" draggable="false"></figure>
            </div>
            <div class="mp-listen__controls">
              ${kit().button({label:'Lied abspielen',variant:'primary',iconName:'play',data:{'data-mp-song':'play'}})}
              ${kit().button({label:'Pausieren',variant:'secondary',iconName:'pause',data:{'data-mp-song':'pause'}})}
              ${kit().button({label:'Weiterhören',variant:'primary',iconName:'play',data:{'data-mp-song':'resume'}})}
              <p class="mp-listen__state" data-mp-listen-state></p>
            </div>
            <button type="button" class="mp-return" data-mp-return>${img('01','mp-return__icon')}<span>Zurück ins Mäppchen</span></button>
          </div>
          ${img('15','mp-listen__hand')}
          <button type="button" class="mp-ff mp-ff--paper" data-mp-paper aria-label="Papierfalter berühren">${ffImg('paper','mp-ff__img')}<span class="mp-ff__shine" aria-hidden="true"></span></button>
          <span class="mp-ff__trail" data-mp-trail aria-hidden="true"></span>
          <span class="mp-ff mp-ff--fly" data-mp-fly aria-hidden="true">${ffImg('left','mp-ff__wing mp-ff__wing--l').replace('class=',`style="${pct(fl.left)}" class=`)}${ffImg('right','mp-ff__wing mp-ff__wing--r').replace('class=',`style="${pct(fl.right)}" class=`)}${ffImg('body','mp-ff__body')}</span>
          <span class="mp-ff__glow" data-mp-glow aria-hidden="true"></span>
          <span class="mp-ff mp-ff--perched" data-mp-perched aria-hidden="true">${ffImg('perched','mp-ff__img')}</span>
        </section>
      </div>
      <div class="mp-audiobar" data-mp-audiobar hidden><span class="mp-audiobar__title" data-mp-audiobar-title></span>
        ${kit().button({label:'Pausieren',variant:'secondary',iconName:'pause',className:'emfd-button--compact',data:{'data-mp-bar':'pause'}})}
        ${kit().button({label:'Weiterhören',variant:'secondary',iconName:'play',className:'emfd-button--compact',data:{'data-mp-bar':'resume'}})}</div>
      <p class="mp-status sr-only" role="status" aria-live="polite" data-mp-status></p>
      <p class="mp-hint" data-mp-hint></p>
    </div>`;
  }
  function ensureDialog(){
    if(dialog)return dialog;
    dialog=doc().createElement('dialog');dialog.id='emfd-maeppchen';dialog.className='emfd-maeppchen';dialog.setAttribute('aria-label','Dein Mäppchen');
    doc().body.append(dialog);
    dialog.addEventListener('cancel',event=>{event.preventDefault();if(confirmBox?.open)return;if(view?.scene==='listen')returnToFolder();else if(view&&view.scene!=='folder')backToFolder();else close();});
    dialog.addEventListener('click',onClick);
    dialog.addEventListener('input',onInput);
    dialog.addEventListener('change',onChange);
    dialog.addEventListener('focusin',onFocusIn);
    dialog.addEventListener('focusout',onFocusOut);
    return dialog;
  }
  const $=sel=>dialog?.querySelector(sel);
  function status(text){const s=$('[data-mp-status]');if(s)s.textContent=text;const h=$('[data-mp-hint]');if(h){h.textContent=text;h.classList.add('is-shown');root.clearTimeout(h._t);h._t=root.setTimeout(()=>h.classList.remove('is-shown'),3200);}}
  const isWide=()=>Boolean(dialog&&dialog.clientWidth>=WIDE.w&&dialog.clientHeight>=WIDE.h);

  /** Mäppchen öffnen (nur bei aktiver Begleitung). Schließen kehrt an dieselbe Stelle zurück. */
  async function open(source){
    if(!state.active)return false;
    const c=contentFor(state.active.cardId);if(!c)return false;
    ensureDialog();opener=source||doc().activeElement;
    view={scene:'folder',detail:null,trigger:null,ff:'hand',covered:false,returning:false,opened:false,cardId:c.id,instanceId:state.active.instanceId};
    dialog.innerHTML=markup(c);dialog.dataset.card=c.id;
    if(!dialog.open)dialog.showModal();
    folder=$('[data-mp-folder]');confirmBox=null;
    unsub?.();unsub=audio()?.subscribe?.(onAudio)||null;
    root.addEventListener('resize',onResize);root.visualViewport?.addEventListener?.('resize',onViewport);root.visualViewport?.addEventListener?.('scroll',onViewport);
    applyScene();layout();onAudio(audio()?.snapshot?.());
    $('[data-mp-unfold]')?.focus({preventScroll:true});
    await unfold();
    return true;
  }
  async function unfold(){
    if(!folder||view.opened)return;
    view.opened=true;
    folder.classList.add('is-strap-out');await wait(520);
    folder.classList.add('is-open');folder.classList.remove('is-closed');await wait(900);
    folder.classList.add('is-filled');await wait(650);
    $('[data-mp-unfold]')?.setAttribute('hidden','');
    if(view?.scene==='folder')$('[data-mp-open="card"]')?.focus({preventScroll:true});
  }
  function close(){
    if(!dialog?.open)return;
    flushDraft();
    // Ein offener Hörmoment wird beim Schließen zentral beendet (Lied aus, EMFD-CARD-MUSIC-01); sonst läuft Musik weiter.
    if(view?.scene==='listen')endListen();
    unsub?.();unsub=null;root.removeEventListener('resize',onResize);root.visualViewport?.removeEventListener?.('resize',onViewport);root.visualViewport?.removeEventListener?.('scroll',onViewport);
    confirmBox?.open&&confirmBox.close();
    dialog.close();dialog.innerHTML='';dialog.style.removeProperty('height');dialog.style.removeProperty('top');view=null;folder=null;confirmBox=null;
    const old=opener;opener=null;if(old?.isConnected)old.focus?.({preventScroll:true});
    root.dispatchEvent?.(new CustomEvent('emfd:maeppchen',{detail:{open:false}}));
  }

  /** Sichtbarkeit und Bedienbarkeit der Bereiche: schmal genau ein aktiver Bereich, Wide Mäppchen links + Auswahl rechts. */
  function applyScene(){
    if(!dialog||!view)return;
    const stage=$('[data-mp-stage]');const wide=isWide();
    stage.classList.toggle('is-wide',wide);stage.dataset.scene=view.scene;
    if(view.detail)stage.dataset.detail=view.detail;else delete stage.dataset.detail;
    for(const pane of dialog.querySelectorAll('[data-mp-pane]')){
      const name=pane.dataset.mpPane;const on=name===view.scene||(wide&&name==='folder');
      pane.hidden=!on;pane.inert=!on;
    }
    $('[data-mp-close]').hidden=(view.scene!=='folder'&&!wide)||view.scene==='listen';
    $('[data-mp-back]').hidden=view.scene==='folder'||view.scene==='listen';
    const sub=$('[data-mp-subtitle]');if(sub)sub.textContent=view.scene==='listen'?LABELS.listen:view.detail?LABELS[view.detail]:'';
    updateAudioBar(audio()?.snapshot?.());
  }
  function layout(){
    if(!dialog||!view)return;
    const stage=$('[data-mp-stage]');const wide=isWide();
    if(stage.classList.contains('is-wide')!==wide)applyScene();
    // Mäppchen so groß wie der Bereich erlaubt (Seitenverhältnis 799:540 aus den Einzelteilen).
    const pane=$('[data-mp-pane="folder"]');const W=pane.clientWidth,H=pane.clientHeight;
    if(W&&H){const fw=Math.max(240,Math.min(W*0.94,(H*0.92)*1.4796,wide?760:600));stage.style.setProperty('--fw',`${fw.toFixed(1)}px`);}
    // Hörmoment: Cover quadratisch und so groß wie möglich; darunter Steuerung und „Zurück ins Mäppchen“.
    const lp=$('[data-mp-pane="listen"]');
    if(lp&&!lp.hidden&&lp.clientWidth){
      // Querformat ohne Wide (z. B. iPhone quer): Steuerung und Knopf neben das Cover, damit es groß bleibt.
      const row=!wide&&lp.clientWidth>lp.clientHeight*1.25;stage.classList.toggle('is-listen-row',row);
      // Über dem Cover bleibt Platz für das ruhende Glühwürmchen (≈ 17 % der Coverseite ragen über die Kante).
      const H=lp.clientHeight,W=lp.clientWidth;
      const side=Math.max(140,row?Math.min((H-24)/1.17,W*0.58):Math.min(W-(wide?48:20),(H-(wide?190:178))/1.17,wide?680:820));
      stage.style.setProperty('--mp-cover',`${side.toFixed(1)}px`);stage.style.setProperty('--mp-over',`${(Math.max(58,Math.min(150,side*0.2))*0.86).toFixed(1)}px`);}
    placeFirefly();
  }

  /* ---------- Szenen: Mäppchen, Detail, Hörmoment ---------- */
  async function openDetail(kind,trigger,{focusStart=true}={}){
    if(!dialog||!state.active)return;
    const c=contentFor(state.active.cardId);const read=$('[data-mp-read]');
    // Das gewählte Stück löst sich aus seinem Fach und ersetzt (schmal) das Mäppchen.
    const item=trigger?.closest?.('[data-mp-open]');
    if(item&&!isWide()&&view.scene==='folder'&&!reduced()){item.classList.add('is-lifting');await wait(260);item.classList.remove('is-lifting');}
    if(!view)return;
    view.scene='detail';view.detail=kind;if(item)view.trigger=item.dataset.mpOpen;
    read.innerHTML=detailMarkup(kind,c);read.dataset.kind=kind;
    dialog.querySelectorAll('[data-mp-open]').forEach(b=>b.classList.toggle('is-out',b.dataset.mpOpen===kind));
    applyScene();read.scrollTop=0;
    // Fokus auf den Anfang des Inhalts, nie auf die Schreibfläche (die Tastatur erscheint erst beim Tippen auf die Seite).
    if(focusStart)(read.querySelector('[data-mp-start]')||read).focus?.({preventScroll:true});
    read.scrollTop=0;
  }
  function backToFolder(){
    if(!dialog||!view)return;flushDraft();endTyping();
    const was=view.scene==='listen'?'listen':view.trigger||view.detail;
    view.scene='folder';view.detail=null;
    const read=$('[data-mp-read]');read.innerHTML='';delete read.dataset.kind;
    dialog.querySelectorAll('[data-mp-open].is-out').forEach(b=>b.classList.remove('is-out'));
    applyScene();
    (was==='listen'?$('[data-mp-listen]'):$(`[data-mp-open="${was}"]`)||$('[data-mp-open="card"]'))?.focus?.({preventScroll:true});
  }
  async function openListen(){
    if(!dialog||!view)return;
    view.scene='listen';view.detail=null;view.trigger='listen';view.returning=false;view.covered=false;flightToken++;
    dialog.querySelectorAll('[data-mp-open].is-out').forEach(b=>b.classList.remove('is-out'));
    $('[data-mp-read]').innerHTML='';
    // Jede Wahl beginnt im Ausgangszustand: Karte, Hand mit Papierfalter, kein Cover, kein Leuchten.
    const pane=$('[data-mp-pane="listen"]');pane.classList.remove('is-covered','is-playing','is-dimmed','is-returning');
    $('[data-mp-return]').disabled=false;
    applyScene();layout();setFF('hand');pane.classList.add('is-hand-in');
    onAudio(audio()?.snapshot?.());
    ($('[data-mp-paper]')||$('[data-mp-return]'))?.focus?.({preventScroll:true});
  }

  function detailMarkup(kind,c){
    const startH=(t,cls='')=>`<h2 class="mp-d__title ${cls}" data-mp-start tabindex="-1">${esc(t)}</h2>`;
    switch(kind){
      case 'card':return `<figure class="mp-d mp-d--card">${startH(c.name,'sr-only')}<img src="${esc(c.image)}" alt="${esc(c.alt)}"><figcaption>${esc(c.name)}</figcaption></figure>
        <div class="mp-d__actions">${kit().button({label:'Karte als Bild sichern',variant:'secondary',iconName:'download',data:{'data-mp-export':'card'}})}</div>`;
      case 'impulse':return `<div class="mp-d mp-d--slip mp-slip--impulse">${img('09','mp-slip__paper')}<div class="mp-slip__text"><span class="mp-slip__kicker" data-mp-start tabindex="-1">Impuls</span><p class="mp-slip__big">${esc(c.impulse)}</p></div></div>`;
      case 'question':return `<div class="mp-d mp-d--slip mp-slip--question">${img('10','mp-slip__paper')}<div class="mp-slip__text"><span class="mp-slip__kicker" data-mp-start tabindex="-1">Frage</span><p class="mp-slip__big">${esc(c.question)}</p></div></div>
        <div class="mp-d__actions">${kit().button({label:'Gedankenbuch öffnen',variant:'primary',iconName:'idea',data:{'data-mp-open':'book'}})}</div>`;
      case 'book':return `<div class="mp-d mp-d--book">
          <details class="mp-qchip" data-mp-qchip open><summary data-mp-start tabindex="-1"><span class="mp-qchip__open">Frage</span><span class="mp-qchip__closed">Frage anzeigen</span></summary><p>${esc(c.question)}</p></details>
          <div class="mp-book">${img('13','mp-book__spread')}${img('14','mp-book__page')}
            <div class="mp-book__left"><p class="mp-book__q">${esc(c.question)}</p><p class="mp-book__meta">${esc(c.name)}</p></div>
            <label class="mp-book__right"><span class="sr-only">Deine Gedanken zur Frage</span><textarea data-mp-draft spellcheck="true" enterkeyhint="enter" placeholder="Tippe auf die Seite und schreib deine Gedanken …">${esc(state.active?.draft||'')}</textarea></label>
          </div>
          <p class="mp-d__note">Dein Entwurf bleibt nur auf diesem Gerät, bis du die Karte zurücklegst.</p>
          <div class="mp-d__actions">${kit().button({label:'Gedankenblatt als PDF',variant:'secondary',iconName:'download',data:{'data-mp-export':'thought'}})}</div></div>`;
      case 'story':return `<article class="mp-d mp-d--story"><div class="mp-storypage"><span class="mp-storypage__kicker">Geschichten</span>${startH(c.name)}${String(c.story||'').split(/\n+/).map(p=>`<p>${esc(p)}</p>`).join('')}</div>
          <div class="mp-d__actions">${kit().button({label:'Geschichte der Melodie',variant:'secondary',iconName:'book',data:{'data-mp-composition':''}})}${kit().button({label:'Geschichtenheft als PDF',variant:'secondary',iconName:'download',data:{'data-mp-export':'story'}})}</div></article>`;
      case 'store':return `<div class="mp-d mp-panel">${startH('Sichern und Ablage')}<p>Alles bleibt freiwillig. Die Dateien entstehen nur auf deinem Gerät.</p>
          <div class="mp-panel__list">
          ${kit().button({label:'Karte als Bild (PNG)',variant:'secondary',iconName:'download',data:{'data-mp-export':'card'}})}
          ${kit().button({label:'Gedankenblatt (PDF)',variant:'secondary',iconName:'download',data:{'data-mp-export':'thought'}})}
          ${kit().button({label:'Geschichtenheft (PDF)',variant:'secondary',iconName:'download',data:{'data-mp-export':'story'}})}
          ${kit().button({label:'Mäppchen sichern',variant:'secondary',iconName:'download',data:{'data-mp-export':'backup'}})}
          <label class="emfd-button emfd-button--secondary mp-import"><span class="emfd-button__label">Sicherung laden</span><input type="file" accept="application/json,.json" data-mp-import></label>
          ${folderSupported()?kit().button({label:folderHandle?'Ablageordner: verbunden':'Ablageordner verbinden',variant:'secondary',iconName:'house',data:{'data-mp-folder-connect':''}}):''}
          </div><p class="mp-panel__hint">${folderSupported()?'Mit verbundenem Ablageordner landen die Dateien direkt dort.':'Auf iPhone und iPad kommen die Dateien über „Teilen“ in „Dateien“ oder eine andere App; eine Sicherung lädst du über die Dateiauswahl.'}</p></div>`;
    }
    return '';
  }

  /* ---------- Schreiben: Tastatur erst auf Berührung, sichtbare Fläche folgt dem visualViewport ---------- */
  function onInput(event){
    if(!event.target.matches?.('[data-mp-draft]')||!state.active)return;
    state=withDraft(state,event.target.value);root.clearTimeout(saveTimer);saveTimer=root.setTimeout(save,250);
  }
  function flushDraft(){root.clearTimeout(saveTimer);const t=dialog?.querySelector('[data-mp-draft]');if(t&&state.active&&t.value!==state.active.draft)state=withDraft(state,t.value);save();}
  function onFocusIn(event){
    if(!event.target.matches?.('[data-mp-draft]'))return;
    $('[data-mp-stage]')?.classList.add('is-typing');const chip=$('[data-mp-qchip]');if(chip&&!isWide())chip.open=false;
    updateAudioBar(audio()?.snapshot?.());onViewport();
  }
  function onFocusOut(event){if(event.target.matches?.('[data-mp-draft]'))root.setTimeout(()=>{if(!dialog?.querySelector('[data-mp-draft]:focus'))endTyping();},60);}
  function endTyping(){const st=$('[data-mp-stage]');if(!st)return;st.classList.remove('is-typing');updateAudioBar(audio()?.snapshot?.());onViewport();}
  function onViewport(){
    if(!dialog?.open)return;const vv=root.visualViewport;const typing=$('[data-mp-stage]')?.classList.contains('is-typing');
    if(vv&&typing&&vv.height<root.innerHeight-40){dialog.style.top=`${vv.offsetTop}px`;dialog.style.height=`${vv.height}px`;}
    else{dialog.style.removeProperty('top');dialog.style.removeProperty('height');}
    const t=dialog.querySelector('[data-mp-draft]:focus');if(t)root.requestAnimationFrame?.(()=>t.scrollIntoView?.({block:'nearest'}));
  }

  /* ---------- Hörmoment: Papier → kurzer Flug → Landung → Lied ---------- */
  const mine=s=>Boolean(view&&s?.track&&(s.track.cardId===view.cardId||s.track.assetId===view.cardId||s.entryId===view.cardId||s.track.roomEntryId===view.cardId));
  function rectIn(el,box){const r=el.getBoundingClientRect(),s=box.getBoundingClientRect();return {x:r.left-s.left,y:r.top-s.top,w:r.width,h:r.height};}
  const place=(el,g)=>{if(!el||!g)return;el.style.left=`${g.x.toFixed(1)}px`;el.style.top=`${g.y.toFixed(1)}px`;el.style.width=`${g.w.toFixed(1)}px`;el.style.height=`${g.h.toFixed(1)}px`;};
  function ffBoxes(){
    const pane=$('[data-mp-pane="listen"]');if(!pane||pane.hidden)return null;
    const hand=$('.mp-listen__hand'),box=$('[data-mp-lbox]');
    const h={x:hand.offsetLeft,y:hand.offsetTop,w:hand.offsetWidth,h:hand.offsetHeight};
    const c=rectIn(box,pane);if(!c.w||!h.w)return null;
    const perch=perchGeometry(c);const paper=paperGeometry(h);
    const fh=perch.h*0.92,fw=fh*flyerGeometry().ratio;
    return {paper,perch,cover:c,fly:{x:perch.x+perch.w/2-fw/2,y:perch.y+perch.h*0.42-fh/2,w:fw,h:fh}};
  }
  function placeFirefly(){
    const g=ffBoxes();if(!g)return;
    place($('[data-mp-paper]'),g.paper);place($('[data-mp-perched]'),g.perch);place($('[data-mp-fly]'),g.fly);
    const glow=$('[data-mp-glow]');if(glow){const d=g.perch.w*1.1;place(glow,{x:g.perch.glow.x-d/2,y:g.perch.glow.y-d/2,w:d,h:d});}
    const trail=$('[data-mp-trail]');if(trail){const d=g.fly.w*0.45;place(trail,{x:g.fly.x+g.fly.w/2-d/2,y:g.fly.y+g.fly.h*0.7-d/2,w:d,h:d});}
  }
  function setFF(next){
    if(!view)return;view.ff=next;const pane=$('[data-mp-pane="listen"]');if(!pane)return;pane.dataset.ff=next;
    $('[data-mp-paper]').hidden=next!=='hand';$('[data-mp-paper]').tabIndex=next==='hand'?0:-1;placeFirefly();
  }
  /** Flug der einen Figur relativ zu ihrer Ruheposition (Flügel schlagen nur während des Flugs, endliche Schlagzahl). */
  function flyFrom(dx,dy,{back=false,D=1500}={}){
    const fly=$('[data-mp-fly]');const wings=[...fly.querySelectorAll('.mp-ff__wing')];const beats=Math.max(4,Math.round(D/170));
    wings.forEach((w,i)=>w.animate([{transform:`rotate(${i?14:-14}deg)`},{transform:`rotate(${i?-12:12}deg)`}],{duration:D/beats,iterations:beats,direction:'alternate',easing:'ease-in-out'}));
    const lift=Math.min(90,Math.abs(dy)*0.4+30);
    const frames=back
      ?[{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${dx*0.45}px,${dy*0.5-lift}px) scale(.9)`,opacity:1,offset:.5},{transform:`translate(${dx}px,${dy}px) scale(.45)`,opacity:0}]
      :[{transform:`translate(${dx}px,${dy}px) scale(.7)`,opacity:.2},{transform:`translate(${dx*0.55}px,${dy*0.5-lift}px) scale(.95)`,opacity:1,offset:.45},{transform:'translate(0,0) scale(1)',opacity:1}];
    if(back){const trail=$('[data-mp-trail]');trail?.animate(frames.map((f,i)=>({...f,opacity:i===0?0:i===1?.55:0})),{duration:D,delay:110,easing:'cubic-bezier(.4,.1,.6,1)'});}
    return fly.animate(frames,{duration:D,easing:back?'cubic-bezier(.4,.1,.6,1)':'cubic-bezier(.3,.6,.3,1)'}).finished.catch(()=>{});
  }
  /** Kartenbild → zugeordnetes Originalcover (sanfte Drehung; reduzierte Bewegung: Überblendung). */
  function showCover(on){if(!view)return;view.covered=on;$('[data-mp-pane="listen"]')?.classList.toggle('is-covered',on);onAudio(audio()?.snapshot?.());}
  let flightToken=0;
  async function onPaper(){
    if(!view||view.ff!=='hand'||view.returning)return;const token=++flightToken;const pane=$('[data-mp-pane="listen"]');
    const g=ffBoxes();
    $('[data-mp-paper]').classList.add('is-touched');status('Ein kleines Licht erwacht.');await wait(450);if(token!==flightToken||!view)return;
    if(reduced()||!g||typeof $('[data-mp-fly]').animate!=='function'){
      // Reduzierte Bewegung: ohne Flug direkt in den Zielzustand (Cover, ruhendes Glühwürmchen).
      showCover(true);setFF('perched');pane.classList.remove('is-hand-in');
    }else{
      setFF('flying');pane.classList.remove('is-hand-in');
      const landing=flyFrom((g.paper.x+g.paper.w/2)-(g.fly.x+g.fly.w/2),(g.paper.y+g.paper.h*0.45)-(g.fly.y+g.fly.h/2));
      // Während des Anflugs verwandelt sich die Karte in ihr Cover; bei der Landung steht der Coverrahmen.
      await wait(650);if(token!==flightToken||!view)return;showCover(true);
      await landing;if(token!==flightToken||!view)return;
      setFF('perched');
    }
    // Landung und Bildwechsel starten keine Musik: erst „Lied abspielen“.
    status('Das Glühwürmchen ruht auf dem Cover. Mit „Lied abspielen“ beginnt die Musik.');
    onAudio(audio()?.snapshot?.());
    $('[data-mp-song="play"]:not([hidden])')?.focus?.({preventScroll:true});
  }
  let songTimer=0;
  function startSong(){
    if(!view||view.returning)return;const id=view.cardId;
    const ok=audio()?.select?.(id,{play:true,explicit:true});
    root.clearTimeout(songTimer);view.failed=ok===false;
    songTimer=root.setTimeout(()=>{if(!view)return;const s=audio()?.snapshot?.();view.failed=!(mine(s)&&['playing','starting','paused'].includes(s.state));onAudio(s);},2500);
    onAudio(audio()?.snapshot?.());
  }
  function songCommand(kind){
    if(!view||view.returning)return;const s=audio()?.snapshot?.();
    if(kind==='pause'){if(mine(s))audio()?.command?.('pause');return;}
    if((kind==='resume'||kind==='play')&&mine(s)&&s.state==='paused'){audio()?.command?.('play');return;}
    startSong();
  }
  /** Zentraler Stopp des Kartenlieds (auch während Laden/Pause); idempotent. */
  function stopMine(){
    root.clearTimeout(songTimer);const s=audio()?.snapshot?.();
    if(mine(s)&&!['stopped','silent','ended'].includes(s.state))audio()?.command?.('stop');
  }
  /** Hörmoment ohne Animation beenden (Schließen, Zurücklegen, Browser-Zurück, Raumwechsel). */
  function endListen(){
    if(!view)return;flightToken++;stopMine();view.covered=false;view.returning=false;
    const pane=$('[data-mp-pane="listen"]');pane?.classList.remove('is-covered','is-playing','is-dimmed','is-returning','is-hand-in');setFF('hand');
  }
  /** „Zurück ins Mäppchen“: 1. Lied sofort aus, 2. dasselbe Glühwürmchen fliegt zum Mäppchen, 3. Cover wird wieder Karte
   *  und wird abgelegt, 4. Mäppchen erscheint. Doppelte Eingaben werden ignoriert. */
  async function returnToFolder(){
    if(!view||view.scene!=='listen'||view.returning)return false;
    view.returning=true;const token=++flightToken;
    stopMine();
    const pane=$('[data-mp-pane="listen"]');$('[data-mp-return]').disabled=true;pane.classList.add('is-returning');pane.classList.remove('is-playing','is-dimmed');
    status('Das Lied ist aus. Das Glühwürmchen fliegt zurück ins Mäppchen.');
    const g=ffBoxes();const fly=$('[data-mp-fly]');
    if(view.ff==='perched'&&g&&!reduced()&&typeof fly?.animate==='function'){
      // Ziel: Lasche im sichtbaren Mäppchen (Wide), sonst das Mäppchen-Symbol am Knopf.
      const target=(isWide()&&$('[data-mp-listen]'))||$('.mp-return__icon')||$('[data-mp-return]');
      const t=rectIn(target,pane);setFF('flying');
      const flight=flyFrom((t.x+t.w/2)-(g.fly.x+g.fly.w/2),(t.y+t.h/2)-(g.fly.y+g.fly.h/2),{back:true,D:1300});
      await wait(350);if(token!==flightToken||!view)return false;
      showCover(false);await flight;if(token!==flightToken||!view)return false;
    }else{showCover(false);}
    await wait(reduced()?60:380);if(token!==flightToken||!view)return false;
    pane.classList.remove('is-returning');setFF('hand');view.returning=false;
    backToFolder();status('Die Karte liegt wieder im Mäppchen.');
    return true;
  }
  /** Szenenauswahl und Wiedergabestatus unabhängig: der Player meldet, die Bühne zeigt. */
  function onAudio(s){
    if(!view||!dialog)return;
    const pane=$('[data-mp-pane="listen"]');const m=mine(s);const state=s?.state;
    const playing=m&&['playing','starting'].includes(state),paused=m&&state==='paused';
    if(playing)view.failed=false;
    if(pane){
      const ready=view.covered&&view.ff==='perched'&&!view.returning;
      pane.classList.toggle('is-playing',ready&&playing);
      pane.classList.toggle('is-dimmed',ready&&paused);
      const show=(k,on)=>{const b=pane.querySelector(`[data-mp-song="${k}"]`);if(b)b.hidden=!on;};
      show('pause',ready&&playing);show('resume',ready&&paused);show('play',ready&&!playing&&!paused);
      const st=pane.querySelector('[data-mp-listen-state]');
      // Eigene, neutrale Fehlermeldung; keine Platzhaltertexte des Players unter dem Cover.
      if(st)st.textContent=!ready?'':playing?`Es spielt: ${s.track?.title||cardOf(view.cardId)?.name||''}`.trim():paused?'Pausiert – Weiterhören setzt an derselben Stelle fort.':(view.failed||(m&&(state==='unavailable'||state==='error')))?'Das Lied ist gerade nicht erreichbar. Das Cover bleibt hier.':'';
    }
    updateAudioBar(s);
  }
  function updateAudioBar(s){
    const bar=$('[data-mp-audiobar]');if(!bar||!view)return;
    const active=s?.track&&['playing','starting','paused'].includes(s.state);
    const typing=$('[data-mp-stage]')?.classList.contains('is-typing');
    bar.hidden=!active||view.scene==='listen'||Boolean(typing&&!isWide());
    if(bar.hidden)return;
    bar.querySelector('[data-mp-audiobar-title]').textContent=s.track?.title||s.track?.cardId||'Musik';
    bar.querySelector('[data-mp-bar="pause"]').hidden=s.state==='paused';
    bar.querySelector('[data-mp-bar="resume"]').hidden=s.state!=='paused';
  }
  let resizeTimer=0;
  function onResize(){root.clearTimeout(resizeTimer);resizeTimer=root.setTimeout(()=>{layout();onViewport();},60);}

  /* ---------- Zurücklegen: Bestätigung im Vordergrund ---------- */
  function askGiveBack(){
    if(!dialog||!view||!state.active)return;
    if(view.scene==='listen')endListen();
    if(view.scene!=='folder')backToFolder();
    const c=contentFor(state.active.cardId);const has=Boolean(state.active.draft?.trim());
    confirmBox=confirmBox||Object.assign(doc().createElement('dialog'),{className:'emfd-panel mp-confirm'});
    if(!confirmBox.isConnected)dialog.append(confirmBox);
    confirmBox.setAttribute('aria-labelledby','mp-confirm-title');
    confirmBox.innerHTML=`<h2 id="mp-confirm-title">In die Schachtel zurücklegen?</h2>
      <p>${esc(c.name)} geht zurück in die Kartenschachtel. ${has?'Dein Gedankenbuch-Entwurf wird dabei gelöscht. Wenn du magst, sicherst du ihn vorher.':'Danach ist das Mäppchen leer, bis du wieder eine Karte mitnimmst.'} Ihr Lied endet dann.</p>
      ${has?`<div class="mp-panel__list">${kit().button({label:'Gedankenblatt (PDF)',variant:'secondary',iconName:'download',data:{'data-mp-export':'thought'}})}${kit().button({label:'Mäppchen sichern',variant:'secondary',iconName:'download',data:{'data-mp-export':'backup'}})}</div>`:''}
      <div class="mp-d__actions">${kit().button({label:'Zurücklegen',variant:'primary',iconName:'cards',data:{'data-mp-giveback':''}})}${kit().button({label:'Noch behalten',variant:'secondary',data:{'data-mp-keep':''}})}</div>`;
    confirmBox.oncancel=event=>{event.preventDefault();keep();};
    confirmBox.showModal();confirmBox.querySelector('[data-mp-keep]')?.focus();
  }
  function keep(){if(confirmBox?.open)confirmBox.close();$('[data-mp-giveback-ask]')?.focus?.({preventScroll:true});}
  function confirmGiveBack(){
    stopMine();flightToken++;
    if(confirmBox?.open)confirmBox.close();
    const id=giveBackNow();close();
    return id;
  }

  /* ---------- Exporte ---------- */
  const tools=()=>root.EMFDThoughtPaperTools||{};
  const slug=s=>String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-zA-Z0-9-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,50);
  const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');};
  function returnLink(id,suffix=''){const base=new URL(root.location.href);base.hash=`#karte/${id}${suffix}`;base.search='';return base.href;}
  const folderSupported=()=>typeof root.showDirectoryPicker==='function';
  let folderHandle=null;
  async function connectFolder(){
    if(!folderSupported())return false;
    try{folderHandle=await root.showDirectoryPicker({id:'emfd-maeppchen',mode:'readwrite'});status('Der Ablageordner ist verbunden.');return true;}
    catch(error){if(error?.name!=='AbortError')status('Der Ordner konnte nicht verbunden werden.');return false;}
  }
  async function deliver(blob,name){
    if(folderHandle){
      try{const fh=await folderHandle.getFileHandle(name,{create:true});const w=await fh.createWritable();await w.write(blob);await w.close();return 'folder';}
      catch{folderHandle=null;}
    }
    if(tools().offerFile)return tools().offerFile(blob,name);
    const u=URL.createObjectURL(blob);const a=doc().createElement('a');a.href=u;a.download=name;doc().body.append(a);a.click();a.remove();root.setTimeout(()=>URL.revokeObjectURL(u),60000);return 'downloaded';
  }
  function loadImage(src){return new Promise((resolve,reject)=>{const i=new Image();i.decoding='async';i.onload=()=>resolve(i);i.onerror=()=>reject(Error('Bild konnte nicht geladen werden'));i.src=src;});}
  function wrap(ctx,text,maxWidth){
    if(tools().lines)return tools().lines(ctx,text,maxWidth);
    const out=[];for(const para of String(text||'').split('\n')){let line='';for(const word of para.split(/\s+/)){const next=line?line+' '+word:word;if(ctx.measureText(next).width<=maxWidth)line=next;else{if(line)out.push(line);line=word;}}out.push(line);}return out;
  }
  /** Kartenbild als PNG: Motiv, Name und Impuls. */
  async function cardPNG(id){
    const c=contentFor(id);const W=1080,H=1700;const canvas=doc().createElement('canvas');canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d');
    ctx.fillStyle='#f5e8c9';ctx.fillRect(0,0,W,H);ctx.strokeStyle='#b7985c';ctx.lineWidth=3;ctx.strokeRect(36,36,W-72,H-72);
    try{const im=await loadImage(c.image);const iw=560,ih=iw*im.naturalHeight/im.naturalWidth;ctx.drawImage(im,(W-iw)/2,90,iw,ih);}catch{ctx.fillStyle='#213d4a';ctx.fillRect((W-560)/2,90,560,960);}
    ctx.fillStyle='#213d4a';ctx.textAlign='center';ctx.font='bold 54px Georgia';ctx.fillText(c.name,W/2,1150);
    ctx.fillStyle='#624b2e';ctx.font='24px Georgia';ctx.fillText(`${c.group} · ${c.id}`,W/2,1192);
    ctx.font='italic 32px Georgia';ctx.fillStyle='#2b3439';let y=1265;for(const line of wrap(ctx,c.impulse,W-220)){ctx.fillText(line,W/2,y);y+=46;}
    ctx.font='16px Georgia';ctx.fillStyle='#765c3e';ctx.fillText('Ein Moment für dich · Das Haus der kleinen Wunder',W/2,H-70);
    const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('PNG konnte nicht erzeugt werden')),'image/png'));
    return {blob,name:`${today()}_${c.id}_${slug(c.name)}_Karte.png`};
  }
  function textPages({kicker,title,sub,intro,body,footer}){
    const W=794,H=1123,L=78,R=78;const m=doc().createElement('canvas').getContext('2d');const items=[];
    const add=(kind,font,text)=>{m.font=font;for(const line of wrap(m,text,W-L-R))items.push({kind,font,text:line});};
    if(intro)add('intro','italic 18px Georgia',intro);
    items.push({kind:'gap',font:'18px Georgia',text:''});
    for(const para of String(body||'').split('\n')){if(!para.trim()){items.push({kind:'gap',font:'21px Georgia',text:''});continue;}add('body','21px Georgia',para);}
    const step={intro:28,body:33,gap:18};const pages=[[]];let y=200;
    for(const it of items){if(y>H-150&&pages[pages.length-1].length){pages.push([]);y=200;}pages[pages.length-1].push(it);y+=step[it.kind];}
    return pages.map((page,i)=>{const cv=doc().createElement('canvas');cv.width=W;cv.height=H;const ctx=cv.getContext('2d');
      ctx.fillStyle='#f5e8c9';ctx.fillRect(0,0,W,H);ctx.strokeStyle='#b7985c';ctx.lineWidth=2;ctx.strokeRect(30,30,W-60,H-60);
      ctx.fillStyle='#213d4a';ctx.font='15px Georgia';ctx.fillText(kicker,L,71);ctx.fillStyle='#624b2e';ctx.font='bold 28px Georgia';ctx.fillText(title,L,115);
      ctx.font='17px Georgia';ctx.fillText(sub,L,148);let pos=200;
      for(const it of page){if(it.kind!=='gap'){ctx.font=it.font;ctx.fillStyle=it.kind==='intro'?'#624b2e':'#2b3439';ctx.fillText(it.text,L,pos);}pos+=step[it.kind];}
      ctx.font='italic 14px Georgia';ctx.fillStyle='#765c3e';ctx.fillText(footer,L,H-70);ctx.fillText(`${i+1} / ${pages.length}`,W-R-30,H-70);return cv;});
  }
  function pdf(canvases,link){
    if(!tools().pdfFromCanvases)throw Error('PDF-Werkzeug fehlt');return tools().pdfFromCanvases(canvases,link);
  }
  function thoughtPDF(id){
    const c=contentFor(id);const d=today();
    const pages=textPages({kicker:'DAS HAUS DER KLEINEN WUNDER',title:'Mein Gedankenblatt',sub:`${c.name} · ${d.slice(8)}.${d.slice(5,7)}.${d.slice(0,4)}`,intro:c.question,body:state.active?.draft||'',footer:'Manche Gedanken dürfen mitkommen. Andere dürfen hierbleiben.'});
    return {blob:pdf(pages,returnLink(id,'/frage')),name:`${d}_${c.id}_${slug(c.name)}_Gedankenblatt.pdf`};
  }
  function storyPDF(id){
    const c=contentFor(id);const d=today();
    const pages=textPages({kicker:'DAS HAUS DER KLEINEN WUNDER',title:'Geschichtenheft',sub:c.name,intro:'',body:c.story,footer:'Eine Geschichte aus dem Haus der kleinen Wunder.'});
    return {blob:pdf(pages,returnLink(id)),name:`${d}_${c.id}_${slug(c.name)}_Geschichtenheft.pdf`};
  }
  function backupFile(){
    const data=backupOf(state);const d=today();
    return {blob:new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),name:`${d}_${data.cardId}_Maeppchen-Sicherung.json`};
  }
  async function exportKind(kind){
    if(!state.active)return;const id=state.active.cardId;flushDraft();
    status('Die Datei wird vorbereitet …');
    try{
      const file=kind==='card'?await cardPNG(id):kind==='thought'?thoughtPDF(id):kind==='story'?storyPDF(id):backupFile();
      const how=await deliver(file.blob,file.name);
      status(how==='folder'?`${file.name} liegt im Ablageordner.`:how==='cancelled'?'Teilen abgebrochen.':how==='shared'?'Die Datei wurde geteilt.':`${file.name} wurde gespeichert.`);
      return file;
    }catch(error){status(`Export nicht möglich: ${error.message}`);return null;}
  }
  async function importFile(file){
    try{
      const data=JSON.parse(await file.text());const next=fromBackup(data);
      if(state.active&&state.active.instanceId!==next.active.instanceId&&state.active.draft.trim()&&!root.confirm?.('Deine aktuelle Begleitung hat einen Entwurf. Durch die Sicherung ersetzen?'))return false;
      state=next;save();status(`Die Sicherung von ${cardOf(next.active.cardId)?.name||next.active.cardId} ist geladen.`);
      if(dialog?.open){const src=opener;await open(src);openDetail('book',null);}
      root.dispatchEvent?.(new CustomEvent('emfd:companion-change',{detail:{cardId:next.active.cardId}}));
      return true;
    }catch(error){status(error.message||'Die Sicherung konnte nicht gelesen werden.');return false;}
  }

  /* ---------- Begleitung annehmen und zurückgeben ---------- */
  function syncDocks(){
    doc()?.querySelectorAll?.('[data-maeppchen-take]').forEach(b=>{const id=b.dataset.maeppchenTake;const on=state.active?.cardId===id;b.dataset.state=on?'active':'free';
      const label=b.querySelector('.dock-label');if(label)label.textContent=on?'Mäppchen':'Mitnehmen';b.setAttribute('aria-label',on?'Mäppchen öffnen':'Diese Karte als Begleitung mitnehmen');});
  }
  function giveBackNow(){
    const id=state.active?.cardId;state=giveBack();save();syncDocks();
    root.dispatchEvent?.(new CustomEvent('emfd:companion-change',{detail:{cardId:null,returned:id}}));
    return id;
  }
  function takeNow(id){
    state=take(state,id);save();syncDocks();
    root.dispatchEvent?.(new CustomEvent('emfd:companion-change',{detail:{cardId:id}}));
  }
  /** „Mitnehmen“: ohne Begleitung sofort; bei anderer Begleitung erst fragen (Ziehen bleibt frei). */
  function requestTake(id,source){
    if(!CARD_ID.test(id))return false;
    if(state.active?.cardId===id){open(source);return true;}
    if(!state.active){takeNow(id);open(source);return true;}
    swapDialog(id,source);return 'asked';
  }
  function swapDialog(id,source){
    const prev=contentFor(state.active.cardId),next=contentFor(id);const has=Boolean(state.active.draft.trim());
    let d=doc().querySelector('#emfd-maeppchen-swap');if(!d){d=doc().createElement('dialog');d.id='emfd-maeppchen-swap';d.className='emfd-panel mp-swap';doc().body.append(d);}
    d.innerHTML=`<h2>${esc(prev.name)} begleitet dich gerade</h2><p>Möchtest du ${esc(prev.name)} in die Schachtel zurücklegen und ${esc(next.name)} mitnehmen?${has?' Dein Gedankenbuch-Entwurf wird dabei gelöscht; du kannst ihn vorher sichern.':''}</p>`+
      (has?`<div class="mp-panel__list">${kit().button({label:'Gedankenblatt (PDF)',variant:'secondary',iconName:'download',data:{'data-swap':'thought'}})}${kit().button({label:'Mäppchen sichern',variant:'secondary',iconName:'download',data:{'data-swap':'backup'}})}</div>`:'')+
      `<div class="mp-read__actions">${kit().button({label:`${next.name} mitnehmen`,variant:'primary',iconName:'cards',data:{'data-swap':'take'}})}${kit().button({label:`${prev.name} behalten`,variant:'secondary',data:{'data-swap':'keep'}})}</div><p class="mp-status" role="status" data-swap-status></p>`;
    d.onclick=async event=>{
      const b=event.target.closest?.('[data-swap]');if(!b)return;const a=b.dataset.swap;
      if(a==='keep'){d.close();source?.focus?.();return;}
      if(a==='take'){d.close();giveBackNow();takeNow(id);open(source);return;}
      const file=a==='thought'?thoughtPDF(state.active.cardId):backupFile();const how=await deliver(file.blob,file.name);
      d.querySelector('[data-swap-status]').textContent=how==='cancelled'?'Teilen abgebrochen.':`${file.name} gesichert.`;
    };
    d.addEventListener('cancel',()=>source?.focus?.(),{once:true});
    d.showModal();d.querySelector('[data-swap="take"]')?.focus();
  }

  /* ---------- Klicks ---------- */
  async function onClick(event){
    const t=event.target.closest?.('button,[data-mp-close],label,summary');if(!t||!dialog||!view)return;
    if(t.matches('[data-mp-close]')){close();return;}
    if(t.matches('[data-mp-unfold]')){unfold();return;}
    if(t.matches('[data-mp-back]')){backToFolder();return;}
    if(t.matches('[data-mp-open]')){if(!view.opened)await unfold();openDetail(t.dataset.mpOpen,t);return;}
    if(t.matches('[data-mp-show]')){openDetail(t.dataset.mpShow,t);return;}
    if(t.matches('[data-mp-listen]')){if(!view.opened)await unfold();openListen();return;}
    if(t.matches('[data-mp-paper]')){onPaper();return;}
    if(t.matches('[data-mp-song]')){songCommand(t.dataset.mpSong);return;}
    if(t.matches('[data-mp-return]')){returnToFolder();return;}
    if(t.matches('[data-mp-bar]')){const s=audio()?.snapshot?.();if(t.dataset.mpBar==='pause')audio()?.command?.('pause');else if(s?.state==='paused')audio()?.command?.('play');return;}
    if(t.matches('[data-mp-export]')){exportKind(t.dataset.mpExport);return;}
    if(t.matches('[data-mp-folder-connect]')){if(await connectFolder()&&view?.detail==='store')openDetail('store',null);return;}
    if(t.matches('[data-mp-composition]')){root.EMFDReaders?.openComposition?.(view.cardId);return;}
    if(t.matches('[data-mp-giveback-ask]')){askGiveBack();return;}
    if(t.matches('[data-mp-keep]')){keep();return;}
    if(t.matches('[data-mp-giveback]')){const id=confirmGiveBack();status(`${cardOf(id)?.name||id} liegt wieder in der Schachtel.`);return;}
  }
  function onChange(event){const input=event.target;if(input.matches?.('[data-mp-import]')&&input.files?.[0]){importFile(input.files[0]);input.value='';}}

  /* ---------- Einstiege ---------- */
  /** Knopf für das Karten-Dock (app.js cardDock). */
  function dockButton(id){
    if(!CARD_ID.test(id))return '';
    const on=state.active?.cardId===id;
    return `<button type="button" data-maeppchen-take="${id}" data-state="${on?'active':'free'}" aria-label="${on?'Mäppchen öffnen':'Diese Karte als Begleitung mitnehmen'}"><span class="dock-icon" aria-hidden="true">${kit()?.icon?.('star')||'★'}</span><span class="dock-label">${on?'Mäppchen':'Mitnehmen'}</span></button>`;
  }
  /** Feste Leiste und „Dein Moment“: Mäppchen öffnen oder freundlich erklären. */
  function openFromNavigation(source){
    if(state.active){open(source);return true;}
    return false;
  }
  const emptyText='Noch begleitet dich keine Karte. Zieh eine Karte oder sieh dir eine an und wähle „Mitnehmen“.';
  doc()?.addEventListener?.('click',event=>{
    const take=event.target.closest?.('[data-maeppchen-take]');
    if(take){event.preventDefault();requestTake(take.dataset.maeppchenTake,take);return;}
    const nav=event.target.closest?.('a[href="#begleiter"],[data-maeppchen-open]');
    if(nav){event.preventDefault();if(!openFromNavigation(nav)){root.EMFDMaeppchenEmpty?.(nav)||showEmpty(nav);}}
  },true);
  function showEmpty(source){
    let d=doc().querySelector('#emfd-maeppchen-empty');if(!d){d=doc().createElement('dialog');d.id='emfd-maeppchen-empty';d.className='emfd-panel mp-swap';doc().body.append(d);}
    d.innerHTML=`<h2>Dein Mäppchen</h2><p>${esc(emptyText)}</p><div class="mp-read__actions">${kit().button({label:'Karte ziehen',variant:'primary',iconName:'cards',data:{'data-empty':'draw'}})}${kit().button({label:'Schließen',variant:'secondary',data:{'data-empty':'close'}})}</div>`;
    d.onclick=event=>{const b=event.target.closest?.('[data-empty]');if(!b)return;d.close();if(b.dataset.empty==='draw'){const card=root.EMFDFeatures?.randomCard?.();const hash=root.location.hash||'#flur';if(card){root.EMFDAtelier?.rememberReturn?.(hash);root.EMFDCardDraw?.begin?.(card.id,hash);}}else source?.focus?.();};
    d.showModal();d.querySelector('[data-empty="draw"]')?.focus();
  }

  /** Feste Navigation in Ansichten ohne Szene (Räume, Karten, Musik): runder „Begleiter“-Knopf unten rechts.
   *  In Szenen übernimmt „Dein Moment“ → Begleiter. Sichtbar unabhängig davon, ob eine Karte mitgenommen ist. */
  function mountFab(){
    if(!doc()?.body||doc().querySelector('#maeppchen-open'))return;
    const b=doc().createElement('button');b.type='button';b.id='maeppchen-open';b.className='maeppchen-fab';b.dataset.maeppchenOpen='';
    b.setAttribute('aria-haspopup','dialog');
    b.innerHTML=`${kit()?.icon?.('star')||'★'}<span class="maeppchen-fab__label">Begleiter</span>`;
    doc().body.append(b);syncFab();
  }
  function syncFab(){const b=doc()?.querySelector?.('#maeppchen-open');if(!b)return;const c=state.active&&cardOf(state.active.cardId);
    b.setAttribute('aria-label',c?`Mäppchen öffnen – ${c.name} begleitet dich`:'Begleiter – noch keine Karte mitgenommen');b.title=c?`Mäppchen · ${c.name}`:'Begleiter';b.dataset.state=c?'active':'empty';}
  root.addEventListener?.('emfd:companion-change',syncFab);
  // Andere Navigation (Browser-Zurück, Raumwechsel) beendet einen offenen Hörmoment zentral, ohne hängendes Audio.
  root.addEventListener?.('hashchange',()=>{if(dialog?.open&&view?.scene==='listen'){endListen();backToFolder();}});
  if(doc()?.readyState==='loading')doc().addEventListener('DOMContentLoaded',mountFab,{once:true});else root.setTimeout?.(mountFab,0);
  const api=Object.freeze({version:2,key:KEY,BACKUP_SCHEMA,ASSET_IDS,FF_IDS,WIDE,normalize,take,giveBack,withDraft,backupOf,fromBackup,flyerGeometry,perchGeometry,paperGeometry,
    active,open,close,openDetail,backToFolder,openListen,returnToFolder,askGiveBack,coverOf,requestTake,giveBackNow,dockButton,openFromNavigation,emptyText,contentFor,missingFor,exportKind,importFile,
    cardPNG,thoughtPDF,storyPDF,backupFile,folderSupported,state:()=>JSON.parse(JSON.stringify(state)),view:()=>view?{...view}:null,isOpen:()=>Boolean(dialog?.open),
    reload(){state=load();syncDocks();syncFab();}});
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.EMFDMaeppchen=api;
})(globalThis);

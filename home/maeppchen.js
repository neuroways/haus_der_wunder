/* EMFD-MAEPPCHEN-01 · Das Mäppchen der Begleiterkarte (zuerst durchgängig mit O08 „Die Laterne“, generisch über die Karten-ID).
 *  - Begleitung: Nach dem Aufdecken bietet das Karten-Dock „Mitnehmen“. Genau eine aktive Begleitung, ohne Ablaufdatum.
 *    Ziehen bleibt frei (Entscheidung der Nutzerin 20.11.2026): Wer eine andere Karte mitnimmt, wird gefragt, ob die
 *    bisherige Begleitung zurückgelegt werden soll (mit freiwilligem Export, wenn Text vorhanden ist).
 *  - Erreichbar über „Dein Moment“ → Begleiter und die feste Leiste („Begleiter“). Das Mäppchen ist eine Ebene über der
 *    aktuellen Ansicht; Schließen kehrt an dieselbe Stelle zurück (keine Adressänderung).
 *  - Inhalt aus der aktiven Karten-ID: Karte, Impuls- und Fragekärtchen (Originaltexte), Gedankenbuch (Entwurf, lokal
 *    pro Begleitung), Geschichtenheft (Hausgeschichte der Karte), Papierfalter (Kartenlied über den bestehenden Player).
 *  - Exporte: Karte als PNG, Gedankenblatt und Geschichtenheft als PDF, Mäppchen-Sicherung (JSON, wieder importierbar),
 *    Ablageordner nur mit unterstütztem Ordnerzugriff; sonst Teilen/Download und Dateiauswahl.
 * Speicher: emfd.maeppchen.v1 {active:{cardId,instanceId,takenAt,draft,updatedAt}} – nur auf diesem Gerät.
 * Medien nur über Register-IDs maeppchen.<Nr>; Kartenbild, Cover und Lied über die bestehenden Kataloge. */
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
    if(!c.coverFromCatalog)out.push({id:`card.${id}.cover`,pfad:'media/manifest.json (Cover aus dem Katalog; ersatzweise Kartenvorderseite)'});
    if(!c.impulse)out.push({id:`${id}.impulse`,pfad:'data.js impulse'});
    if(!c.question)out.push({id:`${id}.question`,pfad:'data.js question'});
    if(!c.story)out.push({id:`${id}.houseStory`,pfad:'data.js houseStory'});
    const a=audio()?.availability?.(id);if(a==='missing'||a==='unavailable')out.push({id:`audio.${id}`,pfad:`media/audio/${id}-M01.mp3`});
    for(const nr of ASSET_IDS)if(!mediaSrc(nr))out.push({id:`maeppchen.${nr}`,pfad:'data/registry.js medien'});
    return out;
  }
  const ASSET_IDS=Object.freeze(['00','01','01a','01b','02','03','03a','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22']);

  /* ---------- Falter: Zusammensetzung aus den Ankern des Assetregisters ---------- */
  // Bezugsbreite B = Papierkörper (16). Alle Teile über ihren Flügelansatz ausgerichtet; Werte in % der Faltergröße.
  function falterGeometry(){
    const A=id=>reg()?.media?.(`maeppchen.${id}`)||{};
    const size=(id,fb)=>[Number(A(id).breite)||fb[0],Number(A(id).hoehe)||fb[1]];
    const anchor=(id,key,fb)=>A(id).anker?.[key]||fb;
    const [bw,bh]=size('16',[323,442]);const box={w:bw,h:bh};const base=anchor('16','fluegelansatz',[0.5,0.4]);
    const root0={x:base[0]*bw,y:base[1]*bh};
    const place=(id,key,fb,fbs)=>{const [w,h]=size(id,fbs);const a=anchor(id,key,fb);const scale=id==='19'||id==='16'?1:1;return {left:(root0.x-a[0]*w*scale)/box.w*100,top:(root0.y-a[1]*h*scale)/box.h*100,width:w*scale/box.w*100,height:h*scale/box.h*100,ox:a[0]*100,oy:a[1]*100};};
    return {ratio:bw/bh,paperBody:place('16','fluegelansatz',[0.5,0.4],[323,442]),paperLeft:place('17','fluegelansatz',[0.94,0.48],[439,204]),paperRight:place('18','fluegelansatz',[0.06,0.48],[447,205]),
      liveBody:place('19','fluegelansatz',[0.5,0.43],[300,441]),liveLeft:place('20','fluegelansatz',[0.94,0.5],[473,193]),liveRight:place('21','fluegelansatz',[0.06,0.5],[475,194]),
      glow:anchor('19','leuchtpunkt',[0.5,0.78])};
  }
  const pct=p=>`left:${p.left.toFixed(2)}%;top:${p.top.toFixed(2)}%;width:${p.width.toFixed(2)}%;height:${p.height.toFixed(2)}%;transform-origin:${p.ox}% ${p.oy}%`;
  function img(nr,cls,alt=''){const src=mediaSrc(nr);return src?`<img class="${cls}" src="${esc(src)}" alt="${esc(alt)}" draggable="false" data-mp-asset="${nr}">`:`<span class="${cls} mp-missing" data-mp-asset="${nr}" data-missing="maeppchen.${nr}" aria-hidden="true"></span>`;}

  /* ---------- Ansicht ---------- */
  let dialog=null,opener=null,view=null,saveTimer=0,unsub=null,folder=null;
  // view: {open:null|'card'|'impulse'|'question'|'book'|'story'|'store'|'giveback'|'swap', falter:'pocket'|'hand'|'lit'|'flying'|'landing', opened:false}
  function falterParts(g){
    return `<span class="mp-falter__glow" style="left:${(g.liveBody.left+g.glow[0]*g.liveBody.width).toFixed(2)}%;top:${(g.liveBody.top+g.glow[1]*g.liveBody.height).toFixed(2)}%"></span>`+
      [['17','pl',g.paperLeft],['18','pr',g.paperRight],['16','pb',g.paperBody],['20','ll',g.liveLeft],['21','lr',g.liveRight],['19','lb',g.liveBody]]
        .map(([nr,k,p])=>img(nr,`mp-f mp-f--${k}`).replace('class=',`style="${pct(p)}" class=`)).join('');
  }
  function markup(c){
    const g=falterGeometry();
    return `<div class="mp-stage" data-mp-stage data-falter="pocket">
      ${img('00','mp-bg mp-bg--table')}${img('22','mp-bg mp-bg--sky')}
      <div class="mp-bar">
        ${kit().iconButton({label:'Mäppchen schließen',iconName:'close',data:{'data-mp-close':''}})}
        <p class="mp-title"><span>Deine Begleitung</span> ${esc(c.name)}</p>
        <span class="mp-bar__end">
          ${kit().button({label:'Sichern',variant:'secondary',iconName:'download',className:'emfd-button--compact',data:{'data-mp-show':'store'}})}
          ${kit().button({label:'In die Schachtel zurücklegen',variant:'secondary',iconName:'cards',className:'emfd-button--compact',data:{'data-mp-show':'giveback'}})}
        </span>
      </div>
      <div class="mp-folder is-closed" data-mp-folder style="--mp-ratio:${(400+399)}/${540}">
        ${img('03a','mp-fold')}
        <div class="mp-half mp-half--left" data-mp-half="left">
          ${img('02','mp-inner')}
          <button type="button" class="mp-item mp-item--card" data-mp-open="card" aria-label="Karte ${esc(c.name)} herausnehmen"><img src="${esc(c.image)}" alt="" draggable="false"></button>
          ${img('04','mp-pocket mp-pocket--card')}
          <button type="button" class="mp-item mp-item--impulse" data-mp-open="impulse" aria-label="Impulskärtchen herausnehmen">${img('09','mp-fill')}</button>
          ${img('05','mp-pocket mp-pocket--impulse')}
          <button type="button" class="mp-item mp-item--question" data-mp-open="question" aria-label="Fragekärtchen herausnehmen">${img('10','mp-fill')}</button>
          ${img('06','mp-pocket mp-pocket--question')}
        </div>
        <div class="mp-half mp-half--right" data-mp-half="right">
          <button type="button" class="mp-item mp-item--story" data-mp-open="story" aria-label="Geschichtenheft öffnen">${img('12','mp-fill')}</button>
          <button type="button" class="mp-item mp-item--book" data-mp-open="book" aria-label="Gedankenbuch öffnen">${img('11','mp-fill')}</button>
          ${img('07','mp-band')}
          <button type="button" class="mp-item mp-item--falter" data-mp-falter data-mp-slot aria-label="Papierfalter aus der Lasche nehmen"><span class="mp-fal" style="aspect-ratio:${g.ratio.toFixed(4)}">${falterParts(g)}</span></button>
          ${img('08','mp-lasche')}
        </div>
        <div class="mp-flap" data-mp-flap aria-hidden="true">
          <div class="mp-flap__front"><div class="mp-mirror">${img('01','mp-fill')}${img('01a','mp-strap')}${img('01b','mp-loop')}</div></div>
          <div class="mp-flap__back">${img('03','mp-fill')}</div>
        </div>
        <button type="button" class="mp-open-hit" data-mp-unfold>Mäppchen öffnen</button>
      </div>
      <div class="mp-read" data-mp-read hidden></div>
      ${img('15','mp-hand')}
      <figure class="mp-cover" data-mp-cover aria-hidden="true"><img src="${esc(c.cover)}" alt="" draggable="false"><figcaption>${esc(c.name)}</figcaption></figure>
      <button type="button" class="mp-falter is-pocket" data-mp-falter data-mp-flyer aria-label="Papierfalter aus der Lasche nehmen" tabindex="-1">
        ${falterParts(g)}
      </button>
      <p class="mp-status sr-only" role="status" aria-live="polite" data-mp-status></p>
      <p class="mp-hint" data-mp-hint></p>
    </div>`;
  }
  function ensureDialog(){
    if(dialog)return dialog;
    dialog=doc().createElement('dialog');dialog.id='emfd-maeppchen';dialog.className='emfd-maeppchen';dialog.setAttribute('aria-label','Dein Mäppchen');
    doc().body.append(dialog);
    dialog.addEventListener('cancel',event=>{event.preventDefault();if(view?.open)closeRead();else close();});
    dialog.addEventListener('click',onClick);
    dialog.addEventListener('input',onInput);
    dialog.addEventListener('change',onChange);
    return dialog;
  }
  function status(text){const s=dialog?.querySelector('[data-mp-status]');if(s)s.textContent=text;const h=dialog?.querySelector('[data-mp-hint]');if(h){h.textContent=text;h.classList.add('is-shown');root.clearTimeout(h._t);h._t=root.setTimeout(()=>h.classList.remove('is-shown'),3200);}}

  /** Mäppchen öffnen (nur bei aktiver Begleitung). Schließen kehrt an dieselbe Stelle zurück. */
  async function open(source){
    if(!state.active)return false;
    const c=contentFor(state.active.cardId);if(!c)return false;
    ensureDialog();opener=source||doc().activeElement;
    view={open:null,falter:'pocket',opened:false,cardId:c.id,instanceId:state.active.instanceId};
    dialog.innerHTML=markup(c);dialog.dataset.card=c.id;
    if(!dialog.open)dialog.showModal();
    folder=dialog.querySelector('[data-mp-folder]');
    placeFalter();
    unsub?.();unsub=audio()?.subscribe?.(onAudio)||null;
    root.addEventListener('resize',onResize);
    // Erst den Riemen, dann die Klappe, dann gleiten die Inhalte aus ihren Fächern.
    dialog.querySelector('[data-mp-unfold]')?.focus({preventScroll:true});
    await unfold();
    return true;
  }
  async function unfold(){
    if(!folder||view.opened)return;
    view.opened=true;
    folder.classList.add('is-strap-out');await wait(520);
    folder.classList.add('is-open');folder.classList.remove('is-closed');await wait(900);
    folder.classList.add('is-filled');await wait(650);
    dialog?.querySelector('[data-mp-unfold]')?.setAttribute('hidden','');
    placeFalter();
    dialog?.querySelector('[data-mp-open="card"]')?.focus({preventScroll:true});
  }
  function close(){
    if(!dialog?.open)return;
    flushDraft();
    // Ein fliegender Falter landet nicht automatisch: die Musik läuft weiter (W1); beim nächsten Öffnen ruht er in der Lasche.
    unsub?.();unsub=null;root.removeEventListener('resize',onResize);
    dialog.close();dialog.innerHTML='';view=null;folder=null;
    const old=opener;opener=null;if(old?.isConnected)old.focus?.({preventScroll:true});
    root.dispatchEvent?.(new CustomEvent('emfd:maeppchen',{detail:{open:false}}));
  }

  /* ---------- Lesen und Schreiben ---------- */
  function readMarkup(kind,c){
    const back=kit().button({label:'Zurück ins Mäppchen',variant:'secondary',iconName:'chevron-left',className:'emfd-button--compact',data:{'data-mp-back':''}});
    switch(kind){
      case 'card':return `<div class="mp-read__card"><img src="${esc(c.image)}" alt="${esc(c.alt)}"><h2>${esc(c.name)}</h2><p class="mp-read__group">${esc(c.group)} · ${esc(c.id)}</p></div><div class="mp-read__actions">${back}</div>`;
      case 'impulse':return `<div class="mp-slip mp-slip--impulse">${img('09','mp-slip__paper')}<div class="mp-slip__text"><span>Impuls</span><p>${esc(c.impulse)}</p></div></div><div class="mp-read__actions">${back}</div>`;
      case 'question':return `<div class="mp-slip mp-slip--question">${img('10','mp-slip__paper')}<div class="mp-slip__text"><span>Frage</span><p>${esc(c.question)}</p></div></div><div class="mp-read__actions">${kit().button({label:'Ins Gedankenbuch schreiben',variant:'primary',iconName:'idea',className:'emfd-button--compact',data:{'data-mp-open':'book'}})}${back}</div>`;
      case 'book':return `<div class="mp-write">
          <div class="mp-slip mp-slip--question mp-slip--small">${img('10','mp-slip__paper')}<div class="mp-slip__text"><span>Frage</span><p>${esc(c.question)}</p></div></div>
          <div class="mp-book">${img('13','mp-book__spread')}${img('14','mp-book__page')}
            <div class="mp-book__left"><p class="mp-book__q">${esc(c.question)}</p><p class="mp-book__meta">${esc(c.name)}</p></div>
            <label class="mp-book__right"><span class="sr-only">Deine Gedanken zur Frage</span><textarea data-mp-draft spellcheck="true" placeholder="Hier ist Platz für deine Gedanken …">${esc(state.active?.draft||'')}</textarea></label>
          </div></div>
          <p class="mp-read__note">Dein Entwurf bleibt nur auf diesem Gerät, bis du die Karte zurücklegst.</p>
          <div class="mp-read__actions">${kit().button({label:'Gedankenblatt als PDF',variant:'secondary',iconName:'download',className:'emfd-button--compact',data:{'data-mp-export':'thought'}})}${back}</div>`;
      case 'story':return `<div class="mp-story">${img('14','mp-book__page')}<div class="mp-story__text" tabindex="0"><span>Geschichtenheft</span><h2>${esc(c.name)}</h2>${String(c.story||'').split(/\n+/).map(p=>`<p>${esc(p)}</p>`).join('')}</div></div>
          <div class="mp-read__actions">${kit().button({label:'Geschichte der Melodie',variant:'secondary',iconName:'book',className:'emfd-button--compact',data:{'data-mp-composition':''}})}${kit().button({label:'Geschichtenheft als PDF',variant:'secondary',iconName:'download',className:'emfd-button--compact',data:{'data-mp-export':'story'}})}${back}</div>`;
      case 'store':return `<div class="mp-panel"><h2>Sichern und Ablage</h2><p>Alles bleibt freiwillig. Die Dateien entstehen nur auf deinem Gerät.</p>
          <div class="mp-panel__list">
          ${kit().button({label:'Karte als Bild (PNG)',variant:'secondary',iconName:'download',data:{'data-mp-export':'card'}})}
          ${kit().button({label:'Gedankenblatt (PDF)',variant:'secondary',iconName:'download',data:{'data-mp-export':'thought'}})}
          ${kit().button({label:'Geschichtenheft (PDF)',variant:'secondary',iconName:'download',data:{'data-mp-export':'story'}})}
          ${kit().button({label:'Mäppchen sichern',variant:'secondary',iconName:'download',data:{'data-mp-export':'backup'}})}
          <label class="emfd-button emfd-button--secondary mp-import"><span class="emfd-button__label">Sicherung laden</span><input type="file" accept="application/json,.json" data-mp-import></label>
          ${folderSupported()?kit().button({label:folderHandle?'Ablageordner: verbunden':'Ablageordner verbinden',variant:'secondary',iconName:'house',data:{'data-mp-folder-connect':''}}):''}
          </div><p class="mp-panel__hint">${folderSupported()?'Mit verbundenem Ablageordner landen die Dateien direkt dort.':'Auf iPhone und iPad kommen die Dateien über „Teilen“ in „Dateien“ oder eine andere App; eine Sicherung lädst du über die Dateiauswahl.'}</p>
          <div class="mp-read__actions">${back}</div></div>`;
      case 'giveback':{const has=Boolean(state.active?.draft?.trim());return `<div class="mp-panel"><h2>In die Schachtel zurücklegen?</h2>
          <p>${esc(c.name)} geht zurück in die Kartenschachtel. ${has?'Dein Gedankenbuch-Entwurf wird dabei gelöscht. Wenn du magst, sicherst du ihn vorher.':'Danach ist das Mäppchen leer, bis du wieder eine Karte mitnimmst.'}</p>
          ${has?`<div class="mp-panel__list">${kit().button({label:'Gedankenblatt (PDF)',variant:'secondary',iconName:'download',data:{'data-mp-export':'thought'}})}${kit().button({label:'Mäppchen sichern',variant:'secondary',iconName:'download',data:{'data-mp-export':'backup'}})}</div>`:''}
          <div class="mp-read__actions">${kit().button({label:'Zurücklegen',variant:'primary',iconName:'cards',data:{'data-mp-giveback':''}})}${kit().button({label:'Noch behalten',variant:'secondary',data:{'data-mp-back':''}})}</div></div>`;}
    }
    return '';
  }
  function openRead(kind){
    if(!dialog||!state.active)return;
    const c=contentFor(state.active.cardId);const read=dialog.querySelector('[data-mp-read]');
    view.open=kind;read.innerHTML=readMarkup(kind,c);read.hidden=false;read.dataset.kind=kind;
    dialog.querySelector('[data-mp-stage]').dataset.reading=kind;
    dialog.querySelectorAll('[data-mp-open]').forEach(b=>b.classList.toggle('is-out',b.dataset.mpOpen===kind));
    const focus=read.querySelector('[data-mp-draft]')||read.querySelector('h2,[tabindex="0"]')||read.querySelector('button');
    focus?.focus?.({preventScroll:true});
    if(kind==='book'){const t=read.querySelector('[data-mp-draft]');if(t){t.selectionStart=t.selectionEnd=t.value.length;}}
    placeFalter();
  }
  function closeRead(){
    if(!dialog)return;flushDraft();const read=dialog.querySelector('[data-mp-read]');const was=view?.open;
    if(view)view.open=null;read.hidden=true;read.innerHTML='';delete dialog.querySelector('[data-mp-stage]').dataset.reading;
    dialog.querySelectorAll('[data-mp-open].is-out').forEach(b=>b.classList.remove('is-out'));
    (dialog.querySelector(`[data-mp-open="${was}"]`)||dialog.querySelector('[data-mp-close]'))?.focus?.({preventScroll:true});
    placeFalter();
  }
  function onInput(event){
    if(!event.target.matches?.('[data-mp-draft]')||!state.active)return;
    state=withDraft(state,event.target.value);root.clearTimeout(saveTimer);saveTimer=root.setTimeout(save,250);
  }
  function flushDraft(){root.clearTimeout(saveTimer);const t=dialog?.querySelector('[data-mp-draft]');if(t&&state.active&&t.value!==state.active.draft)state=withDraft(state,t.value);save();}

  /* ---------- Falter, Licht, Lied ---------- */
  function rectIn(el,stage){const r=el.getBoundingClientRect(),s=stage.getBoundingClientRect();return {x:r.left-s.left,y:r.top-s.top,w:r.width,h:r.height};}
  /** Position des Falters je Zustand und Layout aus den tatsächlichen Elementpositionen (Lasche, Hand, Cover). */
  function placeFalter(){
    const f=dialog?.querySelector('[data-mp-flyer]'),stage=dialog?.querySelector('[data-mp-stage]');if(!f||!stage||!view)return;
    const g=falterGeometry();let w,x,y;
    if(view.falter==='pocket'){
      const slot=dialog.querySelector('[data-mp-slot] .mp-fal')||dialog.querySelector('[data-mp-slot]');const r=rectIn(slot,stage);
      w=r.w;x=r.x+r.w/2;y=r.y+r.h/2;
    }else if(view.falter==='flying'){
      const cover=dialog.querySelector('[data-mp-cover]');const r=rectIn(cover,stage);
      w=Math.min(110,Math.max(70,r.w*0.42));x=r.x+r.w*0.5;y=r.y+r.h+w*1.05;
    }else{
      // Endlage der Hand (ohne Einfahr-Transformation), damit der Falter dort landet, wo die Hand ankommt.
      const hand=dialog.querySelector('.mp-hand');const r={x:hand.offsetLeft,y:hand.offsetTop,w:hand.offsetWidth,h:hand.offsetHeight};const lp=reg()?.media?.('maeppchen.15')?.anker?.landepunkt||[0.5,0.58];
      w=Math.min(120,Math.max(64,r.w*0.36));x=r.x+r.w*lp[0];y=r.y+r.h*lp[1]-w*0.3;
    }
    const h=w/g.ratio;
    f.style.width=`${w.toFixed(1)}px`;f.style.height=`${h.toFixed(1)}px`;
    f.style.transform=`translate(${(x-w/2).toFixed(1)}px,${(y-h/2).toFixed(1)}px)`;
  }
  function setFalter(next){
    const f=dialog?.querySelector('[data-mp-flyer]');if(!f||!view)return;
    view.falter=next;f.className=`mp-falter is-${next}`;f.tabIndex=next==='pocket'?-1:0;if(next==='hand'&&!lastPointer)root.setTimeout(()=>f.focus?.({preventScroll:true}),30);
    dialog.querySelector('[data-mp-stage]').dataset.falter=next;
    f.setAttribute('aria-label',{pocket:'Papierfalter aus der Lasche nehmen',hand:'Papierfalter zum Leuchten bringen',lit:'Der Falter verwandelt sich',flying:'Lied pausieren – der Falter landet',landing:'Der Falter landet'}[next]||'Papierfalter');
    placeFalter();
  }
  let flightToken=0;
  async function onFalter(){
    if(!view)return;const id=view.cardId;
    if(view.falter==='pocket'){setFalter('hand');status('Der Papierfalter liegt matt auf deiner Hand. Tippe ihn noch einmal an.');return;}
    if(view.falter==='hand'){
      const token=++flightToken;
      setFalter('lit');status('Ein Licht erwacht.');await wait(700);if(token!==flightToken||!view)return;
      dialog.querySelector('[data-mp-flyer]').classList.add('is-alive');await wait(650);if(token!==flightToken||!view)return;
      setFalter('flying');dialog.querySelector('[data-mp-flyer]').classList.add('is-alive');
      // Beim Abheben beginnt das Kartenlied über den bestehenden Player; danach erscheint das Cover.
      const ok=audio()?.select?.(id,{play:true,explicit:true});
      if(ok===false){status('Das Lied dieser Karte ist gerade nicht erreichbar. Der Falter fliegt trotzdem eine Runde.');}
      await wait(900);if(token!==flightToken||!view)return;
      dialog.querySelector('[data-mp-stage]').classList.add('is-covered');
      return;
    }
    if(view.falter==='flying'){audio()?.command?.('pause');await land();}
  }
  async function land(){
    if(!view||view.falter!=='flying')return;const token=++flightToken;
    dialog.querySelector('[data-mp-stage]').classList.remove('is-covered');
    setFalter('landing');dialog.querySelector('[data-mp-flyer]').classList.add('is-alive');await wait(900);if(token!==flightToken||!view)return;
    dialog.querySelector('[data-mp-flyer]').classList.remove('is-alive');await wait(500);if(token!==flightToken||!view)return;
    setFalter('pocket');status('Der Falter ist wieder Papier und ruht in der Lasche.');
  }
  function onAudio(s){
    if(!view||view.falter!=='flying')return;
    const mine=s?.track&&(s.track.cardId===view.cardId||s.track.assetId===view.cardId||s.entryId===view.cardId);
    if(s.state==='paused'||s.state==='stopped'||s.state==='silent'||(s.track&&!mine&&s.state==='playing'))land();
  }
  let resizeTimer=0;
  function onResize(){root.clearTimeout(resizeTimer);resizeTimer=root.setTimeout(placeFalter,60);}

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
      if(dialog?.open){const src=opener;await open(src);openRead('book');}
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
  let lastPointer=false;
  async function onClick(event){
    const t=event.target.closest?.('button,[data-mp-close],label');if(!t||!dialog)return;
    lastPointer=event.detail>0; // Maus/Touch: kein Fokussprung (kein Fokusring auf dem Falter); Tastatur: Fokus folgt dem Falter.
    if(t.matches('[data-mp-close]')){close();return;}
    if(t.matches('[data-mp-unfold]')){unfold();return;}
    if(t.matches('[data-mp-open]')){if(!view.opened)await unfold();openRead(t.dataset.mpOpen);return;}
    if(t.matches('[data-mp-show]')){openRead(t.dataset.mpShow);return;}
    if(t.matches('[data-mp-back]')){closeRead();return;}
    if(t.matches('[data-mp-falter]')){if(!view.opened)await unfold();onFalter();return;}
    if(t.matches('[data-mp-export]')){exportKind(t.dataset.mpExport);return;}
    if(t.matches('[data-mp-folder-connect]')){if(await connectFolder()&&view?.open==='store')openRead('store');return;}
    if(t.matches('[data-mp-composition]')){const id=view.cardId;root.EMFDReaders?.openComposition?.(id);return;}
    if(t.matches('[data-mp-giveback]')){
      if(view?.falter==='flying')await land();
      const id=giveBackNow();close();
      status(`${cardOf(id)?.name||id} liegt wieder in der Schachtel.`);
      return;
    }
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
  if(doc()?.readyState==='loading')doc().addEventListener('DOMContentLoaded',mountFab,{once:true});else root.setTimeout?.(mountFab,0);
  const api=Object.freeze({version:1,key:KEY,BACKUP_SCHEMA,ASSET_IDS,normalize,take,giveBack,withDraft,backupOf,fromBackup,falterGeometry,
    active,open,close,openRead,closeRead,requestTake,giveBackNow,dockButton,openFromNavigation,emptyText,contentFor,missingFor,exportKind,importFile,
    cardPNG,thoughtPDF,storyPDF,backupFile,folderSupported,state:()=>JSON.parse(JSON.stringify(state)),view:()=>view?{...view}:null,isOpen:()=>Boolean(dialog?.open),
    reload(){state=load();syncDocks();syncFab();}});
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.EMFDMaeppchen=api;
})(globalThis);

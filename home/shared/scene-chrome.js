/* EMFD-H00 v0.3 / BOOK-01h-Kern · Gemeinsame Bedienoberfläche aller Bilderbuch-Szenen (Eingang, Halle, weitere Räume).
 *  - Kopfzeile: Musik links (globale Steuerung, Zustand sichtbar), Raumlabel mittig, Hilfe rechts. Keine weitere Symbolreihe.
 *  - „Dein Moment“: kompakter Direktzugang unten mittig, standardmäßig geschlossen (ersetzt die frühere untere Navigation).
 *    Ziele: Karte ziehen, Musik hören, Geschichten, Begleiter, Gedankenblatt, Das Haus – alles vorhandene Module.
 *  - Globaler Musikbereich: Titel, Abspielen/Pause, Stopp, Stumm, Lautstärke, Musikbibliothek – über EMFDAudio (eine Engine).
 *  - Hilfe-Ergänzungen in der Szene: „Alles in dieser Ansicht“, „Interaktive Gegenstände anzeigen“, „Einstellungen“.
 *  - Paneele (Gerät, Gegenstand, Laterne) teilen sich einen Dialog mit Fokusrückgabe.
 * Öffnen/Schließen ändert weder Szene noch Audio; Menüzustände werden nicht gespeichert. */
(function(root){
  'use strict';
  const kit=()=>root.EMFDUIKit;
  const audio=()=>root.EMFDAudio;
  const esc=value=>kit()?.escape(value)??String(value);
  let current=null; // {scene, options}
  let muted=null;   // gemerkte Lautstärke beim Stummschalten (nur Sitzung; Präferenz bleibt unberührt)
  let unsubscribeBar=null;

  /* ---------- Paneel ---------- */
  let panel=null,panelUnsub=null,panelOpener=null;
  function ensurePanel(){
    if(panel?.isConnected)return panel;
    panel=document.createElement('dialog');panel.className='emfd-panel emfd-ui';panel.id='emfd-entrance-panel';
    panel.addEventListener('close',()=>{panelUnsub?.();panelUnsub=null;if(panelOpener?.isConnected)panelOpener.focus({preventScroll:true});panelOpener=null;});
    document.body.append(panel);return panel;
  }
  function openPanel(html,bindFn){
    const d=ensurePanel();panelOpener=document.activeElement&&typeof document.activeElement.focus==='function'?document.activeElement:null;
    panelUnsub?.();panelUnsub=null;
    d.innerHTML=`${kit().iconButton({label:'Schließen',iconName:'close',className:'emfd-panel__close',data:{'data-panel-close':''}})}${html}`;
    d.querySelectorAll('[data-panel-close]').forEach(b=>b.addEventListener('click',()=>d.close()));
    bindFn?.(d);if(!d.open)d.showModal();
    (d.querySelector('[data-panel-focus]')||d.querySelector('button:not([data-panel-close])'))?.focus({preventScroll:true});
    return d;
  }
  function closePanel(){if(panel?.open)panel.close();}
  function onPanelClose(fn){panelUnsub=fn;}

  /* ---------- Musik ---------- */
  function stateText(snapshot,id){
    if(!snapshot||!snapshot.track)return 'Still.';
    const mine=!id||snapshot.track.assetId===id||snapshot.track.cardId===id||snapshot.entryId===id;
    if(!mine)return snapshot.state==='playing'?`Gerade läuft: ${snapshot.track.title||'ein anderes Stück'}.`:'Still.';
    if(snapshot.state==='playing'||snapshot.state==='starting')return `Spielt: ${snapshot.track.title||''}`.trim();
    if(snapshot.state==='paused')return `Pausiert: ${snapshot.track.title||''}`.trim();
    if(snapshot.state==='unavailable')return snapshot.message||'Dieses Stück ist gerade nicht verfügbar.';
    return 'Still.';
  }
  const playing=snapshot=>Boolean(snapshot&&['playing','starting'].includes(snapshot.state));
  /** Hauptthema bewusst starten (das Thema ist kein Raumtitel, daher über den Player, nicht über select('T03')).
   *  Ändert nur die Wiedergabe, nicht die gespeicherte Musikentscheidung (EMFDMusicEntry). */
  function playTheme(){
    const snap=audio()?.snapshot?.();
    if(snap?.track?.kind==='app-theme'&&playing(snap))return true;
    return root.EMFDMusic?.setBackgroundPreference?.('on',{start:true,explicit:true})??false;
  }
  function musicControl(id,label){
    return `<div class="emfd-music-control" data-music-control="${esc(id)}">`+
      kit().iconButton({label:`${label} abspielen`,iconName:'play',data:{'data-music':'play'}})+
      kit().iconButton({label:`${label} pausieren`,iconName:'pause',data:{'data-music':'pause'}})+
      kit().iconButton({label:`${label} stoppen`,iconName:'stop',data:{'data-music':'stop'}})+
      `<p class="emfd-music-control__state" role="status" data-music-state>Still.</p></div>`;
  }
  function bindMusic(d,id){
    const sync=snapshot=>{const s=d.querySelector('[data-music-state]');if(s)s.textContent=stateText(snapshot||audio()?.snapshot?.(),id);};
    d.querySelector('[data-music="play"]')?.addEventListener('click',()=>{
      const snap=audio()?.snapshot?.();
      const mine=snap?.track&&(snap.track.assetId===id||snap.entryId===id);
      if(mine&&snap.state==='paused')audio()?.command?.('play');else audio()?.select?.(id,{play:true,explicit:true});
      root.setTimeout(()=>sync(),60);
    });
    d.querySelector('[data-music="pause"]')?.addEventListener('click',()=>{audio()?.command?.('pause');root.setTimeout(()=>sync(),60);});
    d.querySelector('[data-music="stop"]')?.addEventListener('click',()=>{audio()?.command?.('stop');root.setTimeout(()=>sync(),60);});
    onPanelClose(audio()?.subscribe?.(snapshot=>sync(snapshot))||null);sync();
  }
  /** Globaler Musikbereich: öffnet nur, spielt nichts beim Öffnen. Ohne bisherige Auswahl startet „Abspielen“ das Hauptthema. */
  function openMusic(){
    openPanel(`<h2>Musik</h2><p class="emfd-music-control__state" role="status" data-music-state>Still.</p>`+
      `<div class="emfd-music-control">`+
      kit().iconButton({label:'Abspielen',iconName:'play',data:{'data-global-music':'toggle','data-panel-focus':''}})+
      kit().iconButton({label:'Stoppen',iconName:'stop',data:{'data-global-music':'stop'}})+
      kit().iconButton({label:'Stumm',iconName:'music',data:{'data-global-music':'mute'},pressed:muted!==null})+
      `</div><label class="emfd-range">Lautstärke <input type="range" min="0" max="100" step="5" data-global-volume></label>`+
      `<div class="emfd-panel__actions">${kit().button({label:'Musikbibliothek',variant:'secondary',iconName:'music',data:{'data-global-music':'library'}})}</div>`,d=>{
        const toggle=d.querySelector('[data-global-music="toggle"]'),mute=d.querySelector('[data-global-music="mute"]'),range=d.querySelector('[data-global-volume]');
        const sync=snapshot=>{
          snapshot=snapshot||audio()?.snapshot?.();
          d.querySelector('[data-music-state]').textContent=stateText(snapshot,null);
          const on=playing(snapshot);
          toggle.setAttribute('aria-label',on?'Pausieren':'Abspielen');toggle.title=on?'Pausieren':'Abspielen';
          toggle.innerHTML=kit().icon(on?'pause':'play');
          mute.setAttribute('aria-pressed',String(muted!==null));mute.setAttribute('aria-label',muted!==null?'Ton wieder an':'Stumm');
          if(document.activeElement!==range)range.value=String(Math.round((snapshot?.volume??0.7)*100));
        };
        toggle.addEventListener('click',()=>{
          const snap=audio()?.snapshot?.();
          if(playing(snap))audio()?.command?.('pause');
          else if(snap?.state==='paused')audio()?.command?.('play');
          else if(snap?.track&&snap.entryId&&snap.entryId!=='theme')audio()?.select?.(snap.entryId,{play:true,explicit:true});
          else playTheme();
          root.setTimeout(()=>sync(),60);
        });
        d.querySelector('[data-global-music="stop"]').addEventListener('click',()=>{audio()?.command?.('stop');root.setTimeout(()=>sync(),60);});
        mute.addEventListener('click',()=>{
          const snap=audio()?.snapshot?.();
          if(muted===null){muted=snap?.volume??0.7;audio()?.command?.('volume',0);}else{audio()?.command?.('volume',muted||0.7);muted=null;}
          root.setTimeout(()=>sync(),60);
        });
        range.addEventListener('input',()=>{const v=Number(range.value)/100;audio()?.command?.('volume',v);if(v>0)muted=null;});
        d.querySelector('[data-global-music="library"]').addEventListener('click',()=>{d.close();go('#musik');});
        onPanelClose(audio()?.subscribe?.(snapshot=>sync(snapshot))||null);sync();
      });
  }
  function syncMusicButton(snapshot){
    const b=current?.scene?.el?.querySelector('[data-chrome-music]');if(!b)return;
    const on=playing(snapshot);
    b.setAttribute('aria-pressed',String(on));
    const label=on?`Musik – spielt: ${snapshot.track?.title||''}`.trim():'Musik – still';
    b.setAttribute('aria-label',label);b.title=label;
  }

  /* ---------- Gegenstand (Orakelobjekt): Karte ansehen, eigenes Musikstück, Geschichte ---------- */
  /** Gleiches Paneel in allen Räumen; kein Autoplay, Rückkehr in dieselbe Ansicht (Paneel über der Szene). */
  function openObject(id,{focus}={}){
    const reg=root.EMFDRegistry;
    const object=(reg?.objects?.()||[]).find(o=>o.id===id);
    const card=(root.CARDS||[]).find(c=>c.id===id);
    const name=card?.name||object?.titel||id;
    openPanel(`<h2>${esc(name)}</h2><p>${focus==='musik'?'Dieser Gegenstand hat sein eigenes Musikstück.':'Zu diesem Gegenstand gehört eine Karte mit einem Gedanken für dich.'}</p>`+
      `<div class="emfd-panel__actions">${musicControl(id,'Musikstück')}`+
      kit().button({label:'Karte ansehen',variant:focus==='karte'?'primary':'secondary',iconName:'cards',data:{'data-object':'card'}})+
      kit().button({label:'Geschichte lesen',variant:'secondary',iconName:'book',data:{'data-object':'story'}})+`</div>`,d=>{
        bindMusic(d,id);
        if(focus==='musik')d.querySelector('[data-music="play"]')?.setAttribute('data-panel-focus','');
        d.querySelector('[data-object="card"]').addEventListener('click',()=>{d.close();go(`#karte/${id}`);});
        d.querySelector('[data-object="story"]').addEventListener('click',()=>{d.close();root.EMFDReaders?.openComposition?.(id);});
      });
  }

  /* ---------- Dein Moment ---------- */
  const MOMENT=Object.freeze([
    {id:'card',label:'Karte ziehen',icon:'cards'},
    {id:'music',label:'Musik hören',icon:'music'},
    {id:'stories',label:'Geschichten',icon:'book'},
    {id:'companion',label:'Begleiter',icon:'star'},
    {id:'paper',label:'Gedankenblatt',icon:'idea'},
    {id:'house',label:'Das Haus',icon:'house'}
  ]);
  function go(route){
    if(root.EMFDNavigation?.go)root.EMFDNavigation.go(route,{origin:location.hash||'#flur'});
    else location.hash=route.slice(1);
  }
  function momentMarkup(quiet){
    return `<div class="emfd-moment${quiet?' emfd-moment--quiet':''}" data-chrome-moment-wrap>`+
      `<button type="button" class="emfd-moment__toggle" data-chrome-moment aria-expanded="false" aria-controls="emfd-moment-menu">Dein Moment <span aria-hidden="true">${kit().icon('chevron-right')}</span></button>`+
      `<div class="emfd-moment__menu" id="emfd-moment-menu" role="dialog" aria-label="Dein Moment" hidden>`+
      `<div class="emfd-moment__head"><h2>Dein Moment</h2>${kit().iconButton({label:'Dein Moment schließen',iconName:'close',quiet:true,data:{'data-moment-close':''}})}</div>`+
      `<ul class="emfd-moment__list">${MOMENT.map(m=>`<li><button type="button" class="emfd-moment__item" data-moment="${m.id}"${m.id==='companion'?' aria-describedby="emfd-moment-companion"':''}>${kit().icon(m.icon)}<span>${esc(m.label)}</span></button></li>`).join('')}</ul>`+
      `<p class="emfd-moment__note" id="emfd-moment-companion" hidden data-moment-note></p>`+
      `<p class="emfd-moment__help">${kit().textButton({label:'Hilfe',data:{'data-moment-help':''}})}</p></div></div>`;
  }
  function momentAction(id,trigger){
    const hash=location.hash||'#flur';
    switch(id){
      case 'card':{
        const card=root.EMFDFeatures?.randomCard?.();if(!card)return;
        root.EMFDAtelier?.rememberReturn?.(hash);root.EMFDCardDraw?.begin?.(card.id,hash);break;}
      case 'music':go('#musik');break;
      case 'stories':root.EMFDFeatures?.activate?.('stories',null,trigger);break;
      case 'paper':root.EMFDThoughtPaper?.open?.({mode:'free'},trigger);break;
      case 'house':go('#raeume');break;
      case 'companion':{
        // Begleiterkarte (BOOK-01g, W6) ist noch nicht umgesetzt: erklären statt eine Funktion vorzutäuschen.
        const note=current?.scene?.el?.querySelector('[data-moment-note]');
        if(note){note.hidden=false;note.textContent='Die Begleiterkarte wird gerade vorbereitet. Bis dahin kannst du über „Karte ziehen“ eine Karte für dich finden.';}
        return false;}
    }
    return true;
  }
  /** Wischgeste für „Dein Moment“ (rein): von unten nach oben öffnet (Start in der unteren Bildhälfte),
   *  nach unten schließt (nur wenn offen). Deutlich senkrecht, mindestens 56 px. Ergebnis: 'open' | 'close' | null. */
  function momentSwipe({dx=0,dy=0,startY=0,height=0,open=false}={}){
    if(Math.abs(dy)<56||Math.abs(dy)<Math.abs(dx)*1.5)return null;
    if(!open&&dy<0&&startY>=height*0.5)return 'open';
    if(open&&dy>0)return 'close';
    return null;
  }
  function bindMomentSwipe(el){
    if(!el||el.dataset.momentSwipe)return;el.dataset.momentSwipe='1';
    let start=null;
    el.addEventListener('touchstart',event=>{
      if(event.touches.length!==1||event.target.closest?.('.emfd-scene-bar,.emfd-actionlist,.emfd-moment__list,dialog')){start=null;return;}
      const p=event.touches[0];start={x:p.clientX,y:p.clientY-el.getBoundingClientRect().top,height:el.clientHeight};
    },{passive:true});
    el.addEventListener('touchend',event=>{
      if(!start||current?.scene?.el!==el)return;const p=event.changedTouches[0];
      const menu=el.querySelector('#emfd-moment-menu');
      const r=momentSwipe({dx:p.clientX-start.x,dy:p.clientY-(start.y+el.getBoundingClientRect().top),startY:start.y,height:start.height,open:Boolean(menu&&!menu.hidden)});
      start=null;
      if(r==='open')toggleMoment(true);else if(r==='close'){toggleMoment(false);el.querySelector('[data-chrome-moment]')?.focus({preventScroll:true});}
    },{passive:true});
    el.addEventListener('touchcancel',()=>{start=null;},{passive:true});
  }
  function toggleMoment(force){
    const el=current?.scene?.el;if(!el)return;
    const button=el.querySelector('[data-chrome-moment]'),menu=el.querySelector('#emfd-moment-menu');
    const open=typeof force==='boolean'?force:menu.hidden;
    menu.hidden=!open;button.setAttribute('aria-expanded',String(open));
    el.classList.toggle('moment-open',open);
    if(open)menu.querySelector('[data-moment]')?.focus();else{const note=menu.querySelector('[data-moment-note]');if(note)note.hidden=true;}
    root.dispatchEvent?.(new CustomEvent('emfd:moment',{detail:{open}}));
  }

  /* ---------- Hilfe-Ergänzungen ---------- */
  function ensureHelpExtras(){
    const actions=document.querySelector('#help-dialog .start02-help-actions');if(!actions)return;
    if(!actions.querySelector('[data-scene-help-list]')){
      actions.insertAdjacentHTML('afterbegin','<button type="button" data-scene-help-list hidden>Alles in dieser Ansicht</button><button type="button" data-scene-help-hotspots hidden aria-pressed="false">Interaktive Gegenstände anzeigen</button><button type="button" data-scene-help-settings hidden>Einstellungen</button>');
      actions.querySelector('[data-scene-help-list]').addEventListener('click',()=>{document.querySelector('#help-dialog')?.close();root.setTimeout(()=>current?.scene?.toggleList(true),0);}); // nach der Fokusrückgabe des Hilfedialogs
      actions.querySelector('[data-scene-help-hotspots]').addEventListener('click',event=>{const on=current?.scene?.showHotspots(!current.scene.el.classList.contains('show-hotspots'));event.currentTarget.setAttribute('aria-pressed',String(Boolean(on)));});
      actions.querySelector('[data-scene-help-settings]').addEventListener('click',()=>{document.querySelector('#help-dialog')?.close();document.querySelector('#settings-open')?.click();});
    }
    const inScene=Boolean(current?.scene?.el?.isConnected);
    for(const sel of ['[data-scene-help-list]','[data-scene-help-hotspots]','[data-scene-help-settings]'])actions.querySelector(sel).hidden=!inScene;
    const hs=actions.querySelector('[data-scene-help-hotspots]');hs.setAttribute('aria-pressed',String(Boolean(current?.scene?.el?.classList.contains('show-hotspots'))));
    // Raumspezifische Hilfeaktionen (z. B. Hinweise der Halle erneut zeigen)
    actions.querySelectorAll('[data-scene-help-extra]').forEach(b=>b.remove());
    // EMFD-LIGHT-01: Raumgruppe „alle Lichter“ (zentral für jeden Raum mit schaltbaren Lichtquellen, kein dauerhafter Schalter).
    const roomId=root.EMFDRegistry?.scene?.(current?.scene?.sceneId)?.raumId;const roomLights=inScene&&roomId?(root.EMFDLights?.roomLights?.(roomId)||[]):[];
    const lightExtras=roomLights.length?[{label:roomLights.some(id=>root.EMFDLights.get(id))?'Alle Lichter im Raum ausschalten':'Alle Lichter im Raum einschalten',run:()=>root.EMFDLights.toggleRoom(roomId)}]:[];
    for(const extra of [...lightExtras,...(current?.options?.helpActions||[])]){
      const b=document.createElement('button');b.type='button';b.dataset.sceneHelpExtra='';b.textContent=extra.label;
      b.addEventListener('click',()=>{document.querySelector('#help-dialog')?.close();extra.run();});actions.append(b);
    }
  }
  function openHelp(){ensureHelpExtras();document.querySelector('#help-open')?.click();}

  /* ---------- Einhängen ---------- */
  /** mount(scene,{label,quietMoment,endHTML,bindEnd,helpActions}) – füllt Kopfzeile und Direktzugang einer Szene. */
  function mount(scene,options={}){
    if(!scene?.el)return null;
    current={scene,options};
    const left=scene.leftHost(),label=scene.labelHost(),end=scene.barHost();
    if(left)left.innerHTML=kit().iconButton({label:'Musik – still',iconName:'music',data:{'data-chrome-music':'','aria-haspopup':'dialog'},pressed:false});
    if(label)label.textContent=options.label||'';
    if(end)end.innerHTML=(options.endHTML||'')+kit().iconButton({label:'Hilfe und Orientierung',iconName:'help',data:{'data-scene-help':'','aria-haspopup':'dialog'}});
    left?.querySelector('[data-chrome-music]')?.addEventListener('click',()=>openMusic());
    end?.querySelector('[data-scene-help]')?.addEventListener('click',()=>openHelp());
    options.bindEnd?.(end);
    scene.el.querySelector('[data-chrome-moment-wrap]')?.remove();
    scene.el.insertAdjacentHTML('beforeend',momentMarkup(options.quietMoment));
    const wrap=scene.el.querySelector('[data-chrome-moment-wrap]');
    wrap.querySelector('[data-chrome-moment]').addEventListener('click',()=>toggleMoment());
    wrap.querySelector('[data-moment-close]').addEventListener('click',()=>{toggleMoment(false);wrap.querySelector('[data-chrome-moment]').focus();});
    wrap.querySelector('[data-moment-help]').addEventListener('click',()=>{toggleMoment(false);openHelp();});
    wrap.querySelectorAll('[data-moment]').forEach(b=>b.addEventListener('click',()=>{if(momentAction(b.dataset.moment,b)!==false)toggleMoment(false);}));
    bindMomentSwipe(scene.el);
    wrap.addEventListener('keydown',event=>{if(event.key==='Escape'&&!wrap.querySelector('#emfd-moment-menu').hidden){event.stopPropagation();toggleMoment(false);wrap.querySelector('[data-chrome-moment]').focus();}});
    unsubscribeBar?.();unsubscribeBar=audio()?.subscribe?.(syncMusicButton)||null;
    ensureHelpExtras();
    return api;
  }
  function unmount(){unsubscribeBar?.();unsubscribeBar=null;current=null;closePanel();ensureHelpExtras();}
  const api=Object.freeze({version:1,playTheme,openObject,mount,unmount,openPanel,closePanel,onPanelClose,openMusic,musicControl,bindMusic,stateText,toggleMoment,momentSwipe,momentAction,openHelp,ensureHelpExtras,MOMENT,
    musicButton:()=>current?.scene?.el?.querySelector('[data-chrome-music]')||null,
    momentButton:()=>current?.scene?.el?.querySelector('[data-chrome-moment]')||null,
    helpButton:()=>current?.scene?.el?.querySelector('[data-scene-help]')||null,
    current:()=>current});
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.EMFDSceneChrome=api;
})(globalThis);

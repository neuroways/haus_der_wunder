/* EMFD-KUE-DEV-01 (BOOK-01e Raum/Licht, BOOK-01f Radio) · Die Küche als Szene KUE-C02 (Nord, Radio) / KUE-C01 (Süd, Tür T02).
 * Gleiche Bausteine wie die Halle: EMFDScene, EMFDSceneChrome (Kopfzeile, „Dein Moment“, Paneele), EMFDLights, EMFDRadio.
 *  - Eintritt aus der Halle: KUE-C02 Mitte (Blick zum Radio). Umdrehen → KUE-C01. Tür T02 → H00-C01 links (Küchenanschluss).
 *  - Keine automatische Begrüßung. Raumimpuls nur bewusst über die Hilfe; Radio-Hinweis einmalig beim ersten Öffnen.
 *  - Radio MP-KUE: Nahansicht öffnet ohne Ton; „Radio einschalten“ bzw. rechter Drehknopf schalten an/aus (Zufallsfolge
 *    O01–O24 über den gemeinsamen Player). Musik läuft beim Schließen, Umdrehen und Raumwechsel weiter.
 *  - O10 „Der Samen“, O24 „Die schräge Tasse“: gemeinsames Gegenstandspaneel (Karte, Musik, Geschichte), kein Autoplay.
 *  - Lichter einzeln schaltbar; gleiche Leuchte in beiden Ansichten = gleiche Licht-ID. Radioleuchten ist Gerätezustand.
 * Speicher: emfd.kitchen.v1 {radioHintSeen} – nur dieser Hinweis. */
(function(root){
  'use strict';
  const KEY='emfd.kitchen.v1',DEVICE='MP-KUE';
  const storage=(()=>{try{return root.localStorage||null;}catch{return null;}})();
  function load(){try{const v=JSON.parse(storage?.getItem(KEY)||'null');return {radioHintSeen:Boolean(v&&v.radioHintSeen)};}catch{return {radioHintSeen:false};}}
  let state=load();
  const save=()=>{try{storage?.setItem(KEY,JSON.stringify(state));}catch{}};
  const kit=()=>root.EMFDUIKit,reg=()=>root.EMFDRegistry,chrome=()=>root.EMFDSceneChrome;
  const esc=v=>kit()?.escape(v)??String(v);
  const info=()=>reg()?.kitchen?.()||{};
  const radio=()=>root.EMFDRadio?.get(DEVICE,{roomId:'KUE',ids:info().radio?.stuecke});
  let scene=null,currentHint=null,unsubRadio=null;
  const STATE_TEXT={off:'Das Radio ist aus.',starting:'Das Radio schaltet sich ein …',playing:'Das Radio spielt.',paused:'Das Radio ist pausiert.',error:''};
  function radioText(v){
    if(!v)return STATE_TEXT.off;
    if(v.state==='error')return v.message||'Das Radio lässt sich gerade nicht einschalten.';
    if(v.state==='playing'){const t=root.EMFDAudio?.snapshot?.()?.track?.title;return t?`Das Radio spielt: ${t}`:STATE_TEXT.playing;}
    return STATE_TEXT[v.state]||STATE_TEXT.off;
  }

  function render(main,{sceneId='KUE-C02'}={}){
    scene?.destroy?.();
    document.body.classList.add('scene-mode','kitchen-mode');
    const header=document.querySelector('header');
    document.documentElement.style.setProperty('--emfd-header-h',`${header?Math.round(header.getBoundingClientRect().height):0}px`);
    scene=root.EMFDScene?.mount(main,{sceneId,lights:root.EMFDLights,onAction:h=>act(h),onTurn:i=>onTurn(i),onSegment:()=>{}});
    if(!scene){main.innerHTML='<p>Die Küche ist gerade nicht verfügbar.</p><p><a href="#flur">Zur Halle</a></p>';return null;}
    mountChrome();
    unsubRadio?.();unsubRadio=radio()?.subscribe(v=>syncRadio(v))||null;
    return scene;
  }
  function mountChrome(){
    chrome()?.mount(scene,{label:info().anzeigename||'Die Küche',helpActions:[
      {label:'Ein Gedanke zur Küche',run:()=>showHint('impulse')},
      {label:'Radio-Hinweis erneut zeigen',run:()=>showHint('radio')}]});
    renderRadioBadge();
  }
  function leave(){if(!scene)return;unsubRadio?.();unsubRadio=null;scene.destroy?.();scene=null;currentHint=null;chrome()?.unmount?.();document.body.classList.remove('kitchen-mode');if(!document.querySelector('.emfd-scene-view'))document.body.classList.remove('scene-mode');}
  function onTurn(i){root.EMFDNavigation?.replace?.(`#raum/KUE/${i.to.split('-')[1]}`);mountChrome();syncRadio(radio()?.view());if(currentHint)showHint(currentHint);}

  /* ---------- Radio-Zustand in der Szene (Gerätezustand, kein Lichtschalter) ---------- */
  function renderRadioBadge(){
    const h=scene?.hotspot('KUE-C02-RADIO');const layer=scene?.el.querySelector('.emfd-scene-view__hotspots');
    scene?.el.querySelector('[data-radio-badge]')?.remove();
    if(!h||!layer)return;
    layer.insertAdjacentHTML('beforebegin',`<span class="emfd-device-badge" data-radio-badge data-placeholder="radio-leuchtebene" aria-hidden="true" hidden style="left:${(h.rect.x*100).toFixed(2)}%;top:${((h.rect.y+h.rect.h)*100+0.5).toFixed(2)}%;width:${(h.rect.w*100).toFixed(2)}%">Radio aus</span>`);
  }
  function syncRadio(v){
    const on=Boolean(v?.on),label={off:'aus',starting:'an',playing:'an',paused:'pausiert',error:'aus'}[v?.state||'off'];
    const badge=scene?.el.querySelector('[data-radio-badge]');
    // Nur sichtbar, solange das Radio an oder pausiert ist (Platzhalter für die Leuchtebene, kein Dauer-Hotspot).
    if(badge){badge.textContent=`Radio ${label}`;badge.hidden=!on;badge.classList.toggle('is-on',on&&v.state!=='paused');}
    const b=scene?.el.querySelector('[data-hotspot="KUE-C02-RADIO"]');
    if(b){b.setAttribute('aria-label',`Das Röhrenradio – ${label}`);b.querySelector('.emfd-hotspot__label').textContent=`Das Röhrenradio – ${label}`;}
    const panel=document.querySelector('#emfd-entrance-panel[open] [data-radio-panel]');
    if(panel){
      panel.querySelector('[data-radio-state]').textContent=radioText(v);
      const sw=panel.querySelector('[data-radio="toggle"]');
      const next=v?.state==='paused'?'Radio fortsetzen':on?'Radio ausschalten':'Radio einschalten';
      sw.querySelector('.emfd-button__label').textContent=next;sw.setAttribute('aria-pressed',String(on&&v.state!=='paused'));
      const knob=panel.querySelector('[data-radio="knob"]');knob?.setAttribute('aria-label',`Rechter Drehknopf: ${next}`);knob?.setAttribute('aria-pressed',String(on&&v.state!=='paused'));
      panel.querySelector('[data-radio-stage]')?.classList.toggle('is-on',on&&v.state!=='paused');
    }
  }

  /* ---------- Hinweise (freiwillig, schließbar) ---------- */
  function showHint(id){
    const host=scene?.hintHost();if(!host)return;currentHint=id;
    if(!id){host.innerHTML='';return;}
    const t=id==='impulse'?{title:'Die Küche',text:info().raumimpuls?.text}:{title:'Das Radio',text:info().radioHinweis?.text};
    host.innerHTML=kit().hint({id,title:t.title,text:t.text||'',placement:'top'});
    host.querySelector('[data-hint-close]')?.addEventListener('click',()=>showHint(null));
  }

  /* ---------- Aktionen ---------- */
  function act(h){
    const z=h.ziel||{};
    if((h.typ==='LIGHT'||h.typ==='LIGHT_SWITCH')&&(z.licht||z.lichter||z.gruppe||z.raum)){root.EMFDLights?.activate?.(h);return;}
    if(h.typ==='MUSIC_DEVICE'&&z.geraet===DEVICE){openRadio();return;}
    if(h.typ==='ORACLE_OBJECT'&&z.objekt){chrome()?.openObject(z.objekt,{focus:'karte'});return;}
    if(h.typ==='NAVIGATION'&&z.szene){
      const route=`#raum/${z.szene.replace('-','/')}`;
      const target=reg()?.redirect?.(route)||(reg()?.isSceneRoute?.(route)?route:null);
      if(!target)return;
      if(z.segment&&reg()?.isSceneRoute?.(target)){try{root.sessionStorage?.setItem('emfd.scene.view.v1',JSON.stringify({sceneId:z.szene,segment:z.segment}));}catch{}}
      location.hash=target.slice(1);
    }
  }
  /** Nahansicht des Radios: Bildausschnitt derselben Kommode aus KUE-C02 (bis Work die Radio-Nahumgebung liefert). Kein Ton beim Öffnen. */
  function openRadio(){
    const h=reg()?.scene('KUE-C02')?.hotspots.find(x=>x.id==='KUE-C02-RADIO');
    const media=reg()?.sceneMedia('KUE-C02');
    const r=h?.rect||{x:.45,y:.3,w:.15,h:.25};
    // Ausschnitt: Radio mit etwas Umgebung (Kommode), Seitenverhältnis 4:3.
    const cx=r.x+r.w/2,cy=r.y+r.h/2,w=Math.min(1,r.w*2.6),hh=Math.min(1,w*(media.width/media.height)*3/4);
    const left=Math.max(0,Math.min(1-w,cx-w/2)),top=Math.max(0,Math.min(1-hh,cy-hh/2.2));
    // Gleiche Bühne wie die Szene (Bild + Lichtstapel aus EMFDScene.lightLayers), vergrößert und verschoben: Lichtzustände und
    // Lichtebenen nutzen dasselbe Koordinatensystem wie das Raumbild (EMFD-LIGHT-01).
    const frame=media.type==='file'?`<div class="emfd-radio-stage__frame" data-radio-frame style="width:${(100/w).toFixed(3)}%;height:${(100/hh).toFixed(3)}%;left:${(-left/w*100).toFixed(3)}%;top:${(-top/hh*100).toFixed(3)}%"><img src="${esc(media.src)}" alt="" aria-hidden="true">${root.EMFDScene?.lightLayers?.('KUE-C02')||''}</div>`:'';
    // Rechter Drehknopf, relativ zum Ausschnitt (aus dem Radio-Hotspot abgeleitet; Ebene MP-KUE_KNOB_R folgt von Work).
    const kx=((r.x+r.w*0.74)-left)/w,ky=((r.y+r.h*0.62)-top)/hh;
    const first=!state.radioHintSeen;if(first){state.radioHintSeen=true;save();}
    chrome().openPanel(`<div data-radio-panel><h2>${esc(info().radio?.titel||'Das Röhrenradio')}</h2>`+
      (first?`<p class="emfd-panel__hint" data-radio-hint>${esc(info().radioHinweis?.text||'')} ${kit().textButton({label:'Hinweis schließen',data:{'data-radio-hint-close':''}})}</p>`:'')+
      `<div class="emfd-radio-stage" data-radio-stage>${frame}${media.type==='file'?'':`<span class="emfd-radio-stage__ph">Platzhalter · device.MP-KUE.nahansicht</span>`}`+
      `<button type="button" class="emfd-radio-knob emfd-hit" data-radio="knob" aria-pressed="false" style="left:${(kx*100).toFixed(1)}%;top:${(ky*100).toFixed(1)}%" aria-label="Rechter Drehknopf"></button>`+
      `<span class="emfd-radio-stage__note">Nahansicht: Ausschnitt aus KUE-C02 · Radioebenen folgen</span></div>`+
      `<div class="emfd-panel__actions">`+kit().button({label:'Radio einschalten',variant:'primary',data:{'data-radio':'toggle','data-panel-focus':''}})+
      `<p class="emfd-music-control__state" role="status" data-radio-state></p>`+kit().button({label:'Schließen',variant:'secondary',data:{'data-panel-close':''}})+`</div></div>`,d=>{
        const toggle=()=>{const knob=d.querySelector('[data-radio="knob"]');knob.classList.remove('is-turning');void knob.offsetWidth;knob.classList.add('is-turning');radio()?.toggle();};
        d.querySelector('[data-radio="toggle"]').addEventListener('click',toggle);
        d.querySelector('[data-radio="knob"]').addEventListener('click',toggle);
        d.querySelector('[data-radio-hint-close]')?.addEventListener('click',()=>d.querySelector('[data-radio-hint]')?.remove());
        syncRadio(radio()?.view());
        const unsub=root.EMFDLights?.subscribe?.((id,on)=>root.EMFDScene?.applyLight?.(d.querySelector('[data-radio-frame]'),id,on));if(unsub)chrome()?.onPanelClose?.(unsub);
      });
  }

  root.addEventListener?.('hashchange',()=>{const room=root.EMFDRegistry?.roomForRoute?.(location.hash);if(!room||room.id!=='KUE'){chrome()?.closePanel?.();leave();}});
  const api=Object.freeze({version:1,key:KEY,render,leave,openRadio,radio:()=>radio(),state:()=>({...state}),scene:()=>scene,currentHint:()=>currentHint});
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.EMFDKitchen=api;
})(globalThis);

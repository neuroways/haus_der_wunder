/* EMFD-H00 v0.3 (BOOK-01e) · Die Halle als Szene H00-C01 (Nord, Hof) / H00-C02 (Süd, Haustür).
 * Ersetzt die bisherige Flur-Seite; #flur und #haus bleiben Aliase. Kein lokales Musikgerät, kein Grammophon.
 *  - Erstes Eintreten: kleine, schließbare Begrüßung, danach je einmal Hinweise zu Musik und „Dein Moment“ (höchstens einer
 *    gleichzeitig; ein gezeigter Hinweis gilt als gesehen, auch wenn man sofort weitergeht).
 *  - Türen und Durchgänge führen in die Zielräume (Register-Ziel; bisherige Ansicht, bis der Raum als Szene integriert ist).
 *    Küche ohne Ansicht: Erklärung statt Sackgasse. Haustür: beim ersten Mal der bestätigte Abschiedstext, dann direkt hinaus.
 *  - O08 „Die Laterne“: Licht ein/aus und „Die Laterne entdecken“ (vorhandene Karte). Andere Lampen: direkt schaltbar.
 * Speicher: emfd.hall.v1 {hints:{welcome,music,moment}, farewellSeen, skipHints} – nur Hallenhinweise, nichts anderes.
 *  - skipHints (H00-Direkteintritt): Nach „Haus betreten“ bzw. der Tür ohne laufende Einführung erscheinen die drei automatischen
 *    Hallenhinweise nicht – auch nach Umdrehen, Raumwechsel, Rückkehr und Reload. Hilfe → „Hinweise der Halle erneut zeigen“
 *    öffnet sie trotzdem (eigener, ausdrücklicher Aufrufpfad). Ein Eintritt aus der Einführung hebt das Überspringen auf. */
(function(root){
  'use strict';
  const KEY='emfd.hall.v1';
  const ORDER=Object.freeze(['welcome','music','moment']);
  const storage=(()=>{try{return root.localStorage||null;}catch{return null;}})();
  function normalize(v){const h=v&&typeof v==='object'&&v.hints&&typeof v.hints==='object'?v.hints:{};return {hints:{welcome:Boolean(h.welcome),music:Boolean(h.music),moment:Boolean(h.moment)},farewellSeen:Boolean(v&&v.farewellSeen),skipHints:Boolean(v&&v.skipHints)};}
  function load(){try{return normalize(JSON.parse(storage?.getItem(KEY)||'null'));}catch{return normalize(null);}}
  let state=load();
  function save(){try{storage?.setItem(KEY,JSON.stringify(state));}catch{}}
  /** Nächster Hallenhinweis (rein): in fester Reihenfolge, jeder genau einmal. */
  function nextHint(hints){return ORDER.find(id=>!hints?.[id])||null;}

  const kit=()=>root.EMFDUIKit,reg=()=>root.EMFDRegistry,chrome=()=>root.EMFDSceneChrome;
  const esc=value=>kit()?.escape(value)??String(value);
  const texts=()=>Object.fromEntries((reg()?.hall?.()?.hinweise||[]).map(h=>[h.id,h]));
  let scene=null,currentHint=null,explicitHints=false;

  function render(main,{sceneId='H00-C01'}={}){
    scene?.destroy?.();
    document.body.classList.add('scene-mode','hall-mode');
    const header=document.querySelector('header');
    document.documentElement.style.setProperty('--emfd-header-h',`${header?Math.round(header.getBoundingClientRect().height):0}px`);
    scene=root.EMFDScene?.mount(main,{sceneId,lights:root.EMFDLights,onAction:hotspot=>act(hotspot),onTurn:info=>onTurn(info),onSegment:()=>{}});
    if(!scene){main.innerHTML='<p>Die Halle ist gerade nicht verfügbar.</p><p><a href="#raeume">Alle Räume</a></p>';return null;}
    mountChrome();
    currentHint=null;showNext();
    return scene;
  }
  function mountChrome(){
    chrome()?.mount(scene,{label:reg()?.hall?.()?.anzeigename||'Die Halle',
      helpActions:[{label:'Hinweise der Halle erneut zeigen',run:resetHints}]});
  }
  function leave(){if(!scene)return;scene.destroy?.();scene=null;currentHint=null;clearMarks();chrome()?.unmount?.();document.body.classList.remove('hall-mode');if(!document.querySelector('.emfd-scene-view'))document.body.classList.remove('scene-mode');}
  function onTurn(info){
    root.EMFDNavigation?.replace?.(`#raum/H00/${info.to.split('-')[1]}`);
    mountChrome();
    if(currentHint)showHint(currentHint,{keep:true});
  }

  /* ---------- Hinweise ---------- */
  function clearMarks(){chrome()?.musicButton()?.classList.remove('is-hinted');chrome()?.momentButton()?.classList.remove('is-hinted');}
  function showHint(id,{keep=false}={}){
    const host=scene?.hintHost();if(!host)return;
    clearMarks();currentHint=id;
    if(!id){host.innerHTML='';scene.mark([]);return;}
    const t=texts()[id]||{};
    let content;
    if(id==='welcome')content={title:t.titel||'Willkommen',text:t.text,actions:[{label:t.aktion||'Das Haus entdecken',variant:'primary',data:{'data-hall-action':'close'}}],placement:'bottom'};
    else if(id==='music')content={title:t.titel||'Musik',text:t.text,placement:'top'};
    else if(id==='moment')content={title:t.titel||'Dein Moment',text:t.text,placement:'bottom'};
    else if(id==='farewell')content={title:t.titel||'Nach draußen?',text:t.text,actions:[{label:'Nach draußen gehen',variant:'primary',data:{'data-hall-action':'outside'}},{label:'Noch ein wenig bleiben',variant:'secondary',data:{'data-hall-action':'stay'}}],placement:'top'};
    else if(id==='kitchen')content={title:'Die Küche',text:'Die Küche wird gerade eingerichtet. Bald kannst du sie von hier aus betreten.',placement:'top'};
    else return;
    if(!keep&&ORDER.includes(id)){state.hints[id]=true;save();}
    host.innerHTML=kit().hint({id,title:content.title,text:content.text,actions:content.actions||[],placement:content.placement});
    if(id==='music')chrome()?.musicButton()?.classList.add('is-hinted');
    if(id==='moment')chrome()?.momentButton()?.classList.add('is-hinted');
    host.querySelector('[data-hint-close]')?.addEventListener('click',()=>closeHint(id));
    host.querySelectorAll('[data-hall-action]').forEach(b=>b.addEventListener('click',()=>{
      const a=b.dataset.hallAction;
      if(a==='outside')goOutside();else if(a==='stay'){showHint(null);showNext();}else closeHint(id);
    }));
  }
  function closeHint(id){showHint(null);if(ORDER.includes(id)||id==='kitchen'||id==='farewell')showNext();}
  /** Automatischer Hinweisaufruf (Eintritt, nach dem Schließen eines Hinweises oder Dialogs). Zentral unterdrückt bei Direkteintritt,
   *  außer der Mensch hat die Hinweise ausdrücklich über die Hilfe angefordert. */
  function showNext(){
    if(state.skipHints&&!explicitHints)return;
    const id=nextHint(state.hints);if(id)showHint(id);else explicitHints=false;
  }
  /** Eintrittsmodus vom Eingang: 'direct' überspringt die Hallenhinweise dauerhaft, 'guided' (aus der Einführung) zeigt sie. */
  function setEntryMode(mode){state.skipHints=mode==='direct';save();}
  /** Hilfe: nur die Hallenhinweise (nicht Abschied, Tutorial, Geschenk, Licht, Musik) zurücksetzen und erneut zeigen. */
  function resetHints(){state.hints={welcome:false,music:false,moment:false};save();explicitHints=true;if(scene){showHint(null);showNext();}}

  /* ---------- Aktionen ---------- */
  function act(hotspot){
    const ziel=hotspot.ziel||{};
    if(hotspot.typ==='LIGHT'&&ziel.licht){const on=root.EMFDLights?.toggle(ziel.licht);scene?.setLight(ziel.licht,on!==false);return;}
    if(hotspot.typ==='ORACLE_OBJECT'&&ziel.objekt==='O08'){openLantern(ziel);return;}
    if(hotspot.typ==='NAVIGATION'&&ziel.szene){
      if(ziel.szene==='EXT-C02'){if(!state.farewellSeen){state.farewellSeen=true;save();showHint('farewell');}else goOutside();return;}
      const route=`#raum/${ziel.szene.replace('-','/')}`;
      const target=reg()?.redirect?.(route)||(reg()?.isSceneRoute?.(route)?route:null);
      if(!target){showHint('kitchen');return;}
      // Einstiegsausschnitt der Zielszene aus dem Register (z. B. Küche: KUE-C02 Mitte).
      if(ziel.segment&&reg()?.isSceneRoute?.(target)){try{root.sessionStorage?.setItem('emfd.scene.view.v1',JSON.stringify({sceneId:ziel.szene,segment:ziel.segment}));}catch{}}
      root.EMFDNavigation?.go?go(target):location.hash=target.slice(1);
    }
  }
  function go(route){root.EMFDNavigation.go(route,{origin:location.hash||'#flur'});}
  /** Hinaus in den Garten (EXT-C02, Mitte). Kein Beenden, kein Reset, keine Einführung; Musik läuft weiter. */
  function goOutside(){
    try{root.sessionStorage?.setItem('emfd.scene.view.v1',JSON.stringify({sceneId:'EXT-C02',segment:'M'}));}catch{}
    location.hash='raum/EXT/C02';
  }
  function openLantern(ziel){
    const o=reg()?.hall?.()?.o08||{titel:'Die Laterne'};
    const label=()=>root.EMFDLights?.get(ziel.licht)!==false?'Licht ausschalten':'Licht einschalten';
    chrome().openPanel(`<h2>${esc(o.titel||'Die Laterne')}</h2><div class="emfd-panel__actions">`+
      kit().button({label:label(),variant:'secondary',iconName:'light',data:{'data-lantern':'light','data-panel-focus':''}})+
      `<p class="emfd-music-control__state" role="status" data-lantern-state>${root.EMFDLights?.get(ziel.licht)!==false?'Die Laterne leuchtet.':'Die Laterne ist aus.'}</p>`+
      kit().button({label:'Die Laterne entdecken',variant:'primary',iconName:'cards',data:{'data-lantern':'discover'}})+`</div>`,d=>{
        d.querySelector('[data-lantern="light"]').addEventListener('click',event=>{
          const on=root.EMFDLights?.toggle(ziel.licht)!==false;scene?.setLight(ziel.licht,on);
          event.currentTarget.querySelector('.emfd-button__label').textContent=label();
          d.querySelector('[data-lantern-state]').textContent=on?'Die Laterne leuchtet.':'Die Laterne ist aus.';
        });
        d.querySelector('[data-lantern="discover"]').addEventListener('click',()=>{d.close();go('#karte/O08');});
      });
  }

  root.addEventListener?.('hashchange',()=>{if(!root.EMFDRegistry?.roomForRoute?.(location.hash)||root.EMFDRegistry.roomForRoute(location.hash).id!=='H00'){chrome()?.closePanel?.();leave();}});
  root.addEventListener?.('emfd:light-change',event=>scene?.setLight(event.detail.id,event.detail.on));
  const api=Object.freeze({version:1,key:KEY,render,leave,resetHints,setEntryMode,nextHint,normalize,state:()=>JSON.parse(JSON.stringify(state)),currentHint:()=>currentHint,scene:()=>scene});
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.EMFDHall=api;
})(globalThis);

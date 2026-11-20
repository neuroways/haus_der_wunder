/* EMFD-BOOK-01d / EMFD-UX-TUT-02 v0.2 + Bestandsergänzung v0.3 · Eingang (EXT-C01/C02) mit freiwilliger Einführung.
 *
 * Ersetzt Haustür, Musikfrage, Starttour und automatischen Installationshinweis des bisherigen Einstiegs.
 * Fachfunktionen bleiben in ihren Modulen: Brief/Geschenkkarte (EMFDStart02), Licht (EMFDLights), Musik (EMFDAudio,
 * EMFDMusic, EMFDMusicEntry), Karten (#karte/…), Geschichten (EMFDReaders), Hilfe (#help-dialog), Navigation (EMFDNavigation).
 *
 * Zustände (getrennt, nichts setzt etwas anderes zurück):
 *  - emfd.entrance.v1: {welcomeDismissed, entered, tutorial:{active, seen:[…], gardenVisited}}  (nur Einführung/Eingang)
 *  - Geschenk: emfd.start02.gift-completed.v1 (erst wenn der Brief wirklich geöffnet wurde)
 *  - Tutorial-Altwerte: emfd.start02.tutorial-completed.v1 / emfd.start03.intro-completed.v1 (gelesen, beim Beenden gesetzt)
 *  - Installation: emfd.start02.install-dismissed.v1 · Musik: emfd.music.entryPreference · Licht: emfd.lights.v1 / emfd.house.light.v1
 * Die Einführung startet nie von selbst – auch nicht bei gelöschtem Speicher. Hinweise sind Empfehlungen, keine Sperren. */
(function(root){
  'use strict';
  const KEY='emfd.entrance.v1';
  const LEGACY=Object.freeze({gift:'emfd.start02.gift-completed.v1',tutorial:'emfd.start02.tutorial-completed.v1',intro:'emfd.start03.intro-completed.v1',install:'emfd.start02.install-dismissed.v1'});
  const HOTSPOT=Object.freeze({light:'EXT-C01-WANDLATERNE',letter:'EXT-C01-BRIEF',music:'EXT-C01-GLOCKE',enter:'EXT-C01-TUER',bridge:'EXT-C02-BRUECKE',gate:'EXT-C02-GARTENTOR'});
  const VISIBLE=0.35;

  /* ---------- Zustand (rein, testbar) ---------- */
  function emptyState(){return {welcomeDismissed:false,entered:false,tutorial:{active:false,seen:[],gardenVisited:false}};}
  function normalize(value){
    const base=emptyState();if(!value||typeof value!=='object')return base;
    const t=value.tutorial&&typeof value.tutorial==='object'?value.tutorial:{};
    return {welcomeDismissed:Boolean(value.welcomeDismissed),entered:Boolean(value.entered),
      tutorial:{active:Boolean(t.active),seen:Array.isArray(t.seen)?t.seen.filter(id=>typeof id==='string').slice(0,40):[],gardenVisited:Boolean(t.gardenVisited)}};
  }
  /** Folgebesuch: bereits eingetreten, oder der frühere Einstieg wurde abgeschlossen (rückwärtskompatibel). */
  function isReturning(state,legacy){return Boolean(state.entered||legacy.tutorial||(legacy.gift&&legacy.intro));}
  /** Nächster Hinweis der Einführung (Empfehlung, kein Gate). ctx: {sceneId, segment, wide, visible(id)→0..1} */
  function nextHint(tutorial,ctx){
    if(!tutorial?.active)return null;
    const seen=new Set(tutorial.seen),open=id=>!seen.has(id);
    const shows=id=>ctx.wide||(ctx.visible?.(HOTSPOT[id])||0)>=VISIBLE;
    if(ctx.sceneId==='EXT-C02'){
      for(const id of ['garden','principle'])if(open(id))return id;
      const objects=['bridge','gate'].filter(open);
      const visibleObject=objects.find(shows);
      if(visibleObject)return visibleObject;
      if(objects.length)return null; // erst zeigen, wenn eines sichtbar ist; keine automatische Bildfahrt
      for(const id of ['more','help','return'])if(open(id))return id;
      return null;
    }
    if(ctx.sceneId==='EXT-C01'){
      if(!tutorial.gardenVisited){
        if(open('look'))return 'look';
        if(open('turn')&&(ctx.wide||ctx.segment==='L'||ctx.segment==='R'))return 'turn';
        return null;
      }
      const objects=['light','letter','music'].filter(open);
      const visibleObject=objects.find(shows);
      if(visibleObject)return visibleObject;
      if(!objects.length&&open('enter'))return 'enter';
      return null;
    }
    return null;
  }

  /* ---------- Speicher (defensiv) ---------- */
  const storage=(()=>{try{return root.localStorage||null;}catch{return null;}})();
  const flag=key=>{try{return storage?.getItem(key)==='1';}catch{return false;}};
  const setFlag=key=>{try{storage?.setItem(key,'1');}catch{}};
  function load(){try{return normalize(JSON.parse(storage?.getItem(KEY)||'null'));}catch{return emptyState();}}
  let state=load();
  function save(){try{storage?.setItem(KEY,JSON.stringify(state));}catch{}}
  const legacy=()=>({gift:flag(LEGACY.gift),tutorial:flag(LEGACY.tutorial),intro:flag(LEGACY.intro)});
  const returning=()=>isReturning(state,legacy());

  /* ---------- Laufzeit ---------- */
  const kit=()=>root.EMFDUIKit,reg=()=>root.EMFDRegistry;
  const texts=()=>Object.fromEntries((reg()?.tutorial?.()?.hinweise||[]).map(h=>[h.id,h]));
  let scene=null,currentHint=null,resumeOffered=false,installHintShown=false,host=null;
  const esc=value=>kit()?.escape(value)??String(value);

  function render(main,{sceneId='EXT-C01',arrival=false}={}){
    host=main;scene?.destroy?.();clearHelpMark();
    document.body.classList.add('scene-mode','entrance-mode');
    const header=document.querySelector('header');
    document.documentElement.style.setProperty('--emfd-header-h',`${header?Math.round(header.getBoundingClientRect().height):0}px`);
    scene=root.EMFDScene?.mount(main,{sceneId,segment:arrival?'M':undefined,lights:root.EMFDLights,
      onAction:(hotspot,ctx)=>act(hotspot,ctx),onSegment:segment=>{if(segment!=='M'&&scene?.sceneId==='EXT-C01')markSeen('look');refreshHint();},onTurn:info=>onTurn(info)});
    if(!scene){main.innerHTML='<p class="emfd-scene-error">Der Eingang ist gerade nicht verfügbar.</p><p><a href="#flur">Ins Haus</a></p>';return null;}
    renderBar();
    if(state.tutorial.active&&!resumeOffered&&arrival){resumeOffered=true;showHint('resume');}
    else if(!state.tutorial.active&&!state.welcomeDismissed&&!returning()&&sceneId==='EXT-C01')showHint('welcome');
    else refreshHint();
    return scene;
  }
  function leave(){if(!scene)return;scene.destroy?.();scene=null;currentHint=null;clearHelpMark();root.EMFDSceneChrome?.unmount?.();document.body.classList.remove('entrance-mode');if(!document.querySelector('.emfd-scene-view'))document.body.classList.remove('scene-mode');}
  const LABELS=Object.freeze({'EXT-C01':'Der Eingang','EXT-C02':'Der Garten'});
  /** Gemeinsame Kopfzeile (Musik · Raumlabel · Hilfe) und „Dein Moment“; während der Einführung zurückgenommen. */
  function renderBar(){
    if(!scene)return;
    root.EMFDSceneChrome?.mount(scene,{label:LABELS[scene.sceneId]||'',quietMoment:state.tutorial.active,
      endHTML:state.tutorial.active?`<button type="button" class="emfd-chip" data-tutorial-end>Einführung beenden</button>`:'',
      bindEnd:end=>end?.querySelector('[data-tutorial-end]')?.addEventListener('click',()=>endTutorial())});
  }
  /* ---------- Hinweise ---------- */
  function hintContent(id){
    const t=texts()[id]||{};
    switch(id){
      case 'welcome':return {title:t.titel||'Ankommen',text:t.text,actions:[{label:'Haus betreten',variant:'primary',data:{'data-hint-action':'enter'}},{label:'Bedienung kennenlernen',variant:'secondary',data:{'data-hint-action':'start'}}],close:'Willkommen schließen'};
      case 'resume':return {title:'Einführung fortsetzen?',text:'Du warst mitten in der Einführung. Du kannst weitermachen oder sie beenden.',actions:[{label:'Fortsetzen',variant:'primary',data:{'data-hint-action':'resume'}},{label:'Einführung beenden',variant:'secondary',data:{'data-hint-action':'end'}}]};
      case 'turn':return {...base(t),actions:[{label:'Umdrehen',variant:'primary',data:{'data-hint-action':'turn'}}]};
      case 'bridge':return {...base(t),actions:[{label:'Musik entdecken',variant:'primary',data:{'data-hint-action':'bridge'}}]};
      case 'gate':return {...base(t),actions:[{label:'Karte ansehen',variant:'primary',data:{'data-hint-action':'gate'}}]};
      case 'help':{
        const actions=[{label:'Hilfe öffnen',variant:'secondary',data:{'data-hint-action':'help'}}];
        if(!flag(LEGACY.install)&&!installHintShown)actions.push({text:true,label:'Das Haus griffbereit',data:{'data-hint-action':'install'}});
        return {...base(t),actions};
      }
      case 'return':return {...base(t),actions:[{label:'Zum Haus umdrehen',variant:'primary',data:{'data-hint-action':'turn'}}]};
      case 'light':return {...base(t),actions:[{label:'Laterne berühren',variant:'primary',data:{'data-hint-action':'light'}}]};
      case 'letter':return {...base(t),actions:[{label:'Brief öffnen',variant:'primary',data:{'data-hint-action':'letter'}}]};
      case 'music':return {...base(t),actions:[{label:'Glocke berühren',variant:'primary',data:{'data-hint-action':'music'}}]};
      case 'enter':return {...base(t),actions:[{label:'Haus betreten',variant:'primary',data:{'data-hint-action':'enter'}}]};
      default:return base(t);
    }
  }
  function base(t){return {title:t.titel||'',text:t.text||'',actions:[]};}
  const TARGETS={principle:[HOTSPOT.bridge,HOTSPOT.gate],bridge:[HOTSPOT.bridge],gate:[HOTSPOT.gate],light:[HOTSPOT.light],letter:[HOTSPOT.letter],music:[HOTSPOT.music],enter:[HOTSPOT.enter]};
  /** Hinweis oben, wenn das Ziel im unteren Bildteil liegt (der Hinweis verdeckt das Ziel nie). */
  // Ziele für die Platzierung; markiert (dezente Kontur) werden nur Ziele aktiver Einführungshinweise, nie die Tür beim Ankommen.
  const PLACE={...TARGETS,welcome:[HOTSPOT.enter],resume:[HOTSPOT.enter]};
  function placementFor(id){
    const targets=(PLACE[id]||[]).map(h=>scene?.hotspot(h)).filter(Boolean);
    if(!targets.length)return 'bottom';
    const low=Math.max(...targets.map(h=>h.rect.y+h.rect.h));
    // Breit: neben das Ziel ausweichen, wenn es mittig unten liegt (Tür); schmal: oben, wenn das Ziel unten liegt.
    if(scene?.wide&&low>0.62){const center=Math.min(...targets.map(h=>h.rect.x))+0;return center<0.5?'bottom-end':'bottom-start';}
    return low>0.62&&Math.min(...targets.map(h=>h.rect.y))>0.45?'top':'bottom';
  }
  function showHint(id){
    const hostEl=scene?.hintHost();if(!hostEl)return;
    currentHint=id;
    if(!id){hostEl.innerHTML='';scene.mark([]);clearHelpMark();return;}
    const c=hintContent(id);
    hostEl.innerHTML=kit().hint({id,title:c.title,text:c.text,actions:c.actions,placement:placementFor(id),closeLabel:c.close||'Hinweis schließen'});
    scene.mark(TARGETS[id]||[]);
    if(id==='help')markHelp();else clearHelpMark();
    hostEl.querySelector('[data-hint-close]')?.addEventListener('click',()=>closeHint(id));
    hostEl.querySelectorAll('[data-hint-action]').forEach(b=>b.addEventListener('click',()=>hintAction(id,b.dataset.hintAction)));
  }
  function refreshHint(){
    if(!scene)return;
    if(currentHint==='welcome'||currentHint==='resume')return;
    const next=nextHint(state.tutorial,{sceneId:scene.sceneId,segment:scene.segment,wide:scene.wide,visible:id=>scene.visibility(id)});
    if(next!==currentHint)showHint(next);
  }
  function markSeen(...ids){
    if(!state.tutorial.active)return;
    let changed=false;for(const id of ids)if(!state.tutorial.seen.includes(id)){state.tutorial.seen.push(id);changed=true;}
    if(changed)save();
  }
  function closeHint(id){
    if(id==='welcome'){state.welcomeDismissed=true;save();showHint(null);return;}
    if(id==='resume'){currentHint=null;refreshHint();return;}
    markSeen(id);currentHint=null;refreshHint();
  }
  function hintAction(id,action){
    if(id!=='welcome'&&id!=='resume')markSeen(id);
    switch(action){
      case 'start':startTutorial();break;
      case 'resume':currentHint=null;refreshHint();break;
      case 'end':endTutorial();break;
      case 'enter':enterHouse(undefined,{mode:entryMode('hint',id)});break;
      case 'turn':currentHint=null;scene.turn(scene.wide?'right':scene.segment==='L'?'left':scene.segment==='R'?'right':'right');break;
      case 'bridge':openObject('O15',{focus:'music'});break;
      case 'gate':openCard('O09');break;
      case 'help':openHelp();break;
      case 'install':installHintShown=true;root.EMFDStart02?.showInstallHelp?.(false);break;
      case 'light':toggleLight('LIGHT-EXT-WANDLATERNE');break;
      case 'letter':openLetter();break;
      case 'music':openBell();break;
    }
    if(['help','install','light'].includes(action)){currentHint=null;refreshHint();}
  }
  function markHelp(){document.querySelector('[data-scene-help]')?.classList.add('is-hinted');}
  function clearHelpMark(){document.querySelectorAll('[data-scene-help].is-hinted').forEach(el=>el.classList.remove('is-hinted'));}

  /* ---------- Einführung ---------- */
  function startTutorial(){
    state.welcomeDismissed=true;state.tutorial={active:true,seen:['welcome'],gardenVisited:false};save();
    resumeOffered=true;currentHint=null;renderBar();
    if(scene?.sceneId!=='EXT-C01'||!scene){goEntrance();return;}
    scene.setSegment('M');refreshHint();
  }
  /** Aus der Hilfe: setzt ausschließlich den Tutorialzustand zurück und führt (angekündigt) zum Eingang. */
  function restartTutorial(){
    state.tutorial={active:true,seen:['welcome'],gardenVisited:false};state.welcomeDismissed=true;save();resumeOffered=true;
    if(location.hash==='#raum/EXT/C01'&&scene){scene.setSegment('M');renderBar();currentHint=null;refreshHint();}
    else goEntrance();
  }
  function endTutorial(){
    state.tutorial.active=false;save();setFlag(LEGACY.tutorial);setFlag(LEGACY.intro);
    currentHint=null;showHint(null);renderBar();
  }
  function goEntrance(){
    try{root.sessionStorage?.setItem('emfd.scene.view.v1',JSON.stringify({sceneId:'EXT-C01',segment:'M'}));}catch{}
    if(location.hash==='#raum/EXT/C01'&&host)render(host,{sceneId:'EXT-C01'});else location.hash='raum/EXT/C01';
  }
  function onTurn(info){
    if(info.to==='EXT-C02'&&state.tutorial.active){state.tutorial.gardenVisited=true;markSeen('look','turn');}
    if(info.to==='EXT-C01'&&state.tutorial.active)markSeen('return');
    root.EMFDNavigation?.replace?.(`#raum/EXT/${info.to.split('-')[1]}`)||null;
    currentHint=null;renderBar();refreshHint();
  }

  /* ---------- Aktionen an Gegenständen (vorhandene Module) ---------- */
  function act(hotspot){
    const ziel=hotspot.ziel||{};
    if((hotspot.typ==='LIGHT'||hotspot.typ==='LIGHT_SWITCH')&&(ziel.licht||ziel.lichter||ziel.gruppe||ziel.raum)){root.EMFDLights?.activate?.(hotspot);if(hotspot.id===HOTSPOT.light)markSeen('light');}
    else if(hotspot.typ==='LETTER'){markSeen('letter');openLetter();}
    else if(hotspot.typ==='MUSIC_DEVICE'){markSeen('music');openBell();}
    else if(hotspot.typ==='NAVIGATION'){const mode=entryMode('door');markSeen('enter');enterHouse(ziel,{mode});}
    else if(hotspot.typ==='ORACLE_OBJECT'&&ziel.objekt){markSeen(ziel.objekt==='O15'?'bridge':ziel.objekt==='O09'?'gate':'');openObject(ziel.objekt,{focus:ziel.angebot});}
    if(currentHint&&currentHint!=='welcome'&&currentHint!=='resume'){currentHint=null;refreshHint();}
  }
  // Licht über die zentrale LightEngine; die Szene folgt dem Zustand selbst (EMFD-LIGHT-01).
  function toggleLight(id){root.EMFDLights?.toggle(id);}
  function openLetter(){root.EMFDStart02?.openGift?.(false);}
  function openHelp(){if(root.EMFDSceneChrome)root.EMFDSceneChrome.openHelp();else document.querySelector('#help-open')?.click();}
  function openCard(id){location.hash=`karte/${id}`;}
  /** Haustür: führt ins Haus. Ziel aus der Szenenkonfiguration (H00-C01); bis die Halle integriert ist, der Flur. */
  /** Eintrittsmodus (rein, vor jeder Zustandsänderung bestimmt): „Haus betreten“ aus der Willkommenskarte oder die Tür
   *  außerhalb einer laufenden Einführung = 'direct' (Halle ohne automatische Hinweise); innerhalb der Einführung = 'guided'.
   *  Weder Musikpräferenz noch alte Tutorial-Flags entscheiden darüber. */
  function entryModeFor(source,{tutorialActive=false,hintId=null}={}){
    if(source==='hint')return hintId==='welcome'||!tutorialActive?'direct':'guided';
    return tutorialActive?'guided':'direct';
  }
  function entryMode(source,hintId=null){return entryModeFor(source,{tutorialActive:state.tutorial.active,hintId});}
  function enterHouse(ziel={szene:'H00-C01'},{mode=null}={}){
    // Eintrittsmodus vor dem Routenwechsel an die Halle geben (dort gespeichert: emfd.hall.v1 skipHints).
    if(mode)root.EMFDHall?.setEntryMode?.(mode);
    state.entered=true;state.welcomeDismissed=true;
    if(state.tutorial.active){state.tutorial.active=false;setFlag(LEGACY.tutorial);setFlag(LEGACY.intro);}
    save();
    // Eine gemerkte Musikentscheidung wird übernommen, startet aber nichts (kein Autoplay beim Betreten).
    const pref=root.EMFDMusicEntry?.preference?.();
    if(pref?.remembered)root.EMFDMusic?.setBackgroundPreference?.(pref.value,{start:false});
    const sceneRoute=ziel.szene?`#raum/${ziel.szene.replace('-','/')}`:'#flur';
    const target=reg()?.redirect?.(sceneRoute)||(reg()?.isSceneRoute?.(sceneRoute)?sceneRoute:'#flur');
    // Eintritt in die Halle: Blick nach vorn (Mitte); Musik und Licht bleiben unverändert.
    if(reg()?.isSceneRoute?.(target)){try{root.sessionStorage?.setItem('emfd.scene.view.v1',JSON.stringify({sceneId:ziel.szene,segment:'M'}));}catch{}}
    location.hash=target.slice(1);
  }

  /* ---------- Paneele: Glocke (Ortsmusik) und Gegenstand (Karte · Musik · Geschichte) – gemeinsamer Dialog aus scene-chrome.js ---------- */
  const chrome=()=>root.EMFDSceneChrome;
  const audio=()=>root.EMFDAudio;
  const openPanel=(html,bind)=>chrome().openPanel(html,bind);
  const musicControl=(id,label)=>chrome().musicControl(id,label);
  const bindMusic=(d,id)=>chrome().bindMusic(d,id);
  const stateText=(snapshot,id)=>chrome().stateText(snapshot,id);
  /** Glocke MP-EXT: Klangwelt des Ortes und die bisherige Musikentscheidung (EMFDMusicEntry), ohne Autoplay. */
  function openBell(){
    const bell=reg()?.bell?.()||{text:'Dieses Haus hat seine eigene Musik. Du kannst es mit Musik oder in Stille entdecken.'};
    const pref=root.EMFDMusicEntry?.preference?.();
    const prefText=pref?`Deine Auswahl: ${pref.value==='on'?'mit Musik':'in Stille'}${pref.remembered?' (gemerkt)':' (nur für diesen Besuch)'}.`:'Noch keine Auswahl.';
    openPanel(`<h2>Die Eingangsglocke</h2><p>${esc(bell.text)}</p>`+
      `<div class="emfd-panel__actions">`+
      kit().button({label:'Hauptthema abspielen',variant:'secondary',iconName:'play',data:{'data-bell':'theme','data-panel-focus':''}})+
      `<p class="emfd-music-control__state" role="status" data-music-state>Still.</p>`+
      kit().button({label:'Mit Musik entdecken',variant:'primary',iconName:'music',data:{'data-bell':'on'}})+
      kit().button({label:'In Stille entdecken',variant:'secondary',data:{'data-bell':'off'}})+
      `<label class="emfd-check"><input type="checkbox" data-bell-remember ${pref?.remembered?'checked':''}> Meine Auswahl merken</label>`+
      `<p class="emfd-panel__status" role="status" data-bell-status>${esc(prefText)}</p>`+
      kit().button({label:'Schließen',variant:'secondary',data:{'data-panel-close':''}})+
      `</div>`,d=>{
        const sync=snapshot=>{const s=d.querySelector('[data-music-state]');if(s)s.textContent=stateText(snapshot||audio()?.snapshot?.(),null);};
        d.querySelector('[data-bell="theme"]').addEventListener('click',()=>{chrome().playTheme();root.setTimeout(()=>sync(),60);});
        const choose=value=>{
          const remember=d.querySelector('[data-bell-remember]').checked;
          root.EMFDMusicEntry?.apply?.(value,{remember});
          d.querySelector('[data-bell-status]').textContent=`Deine Auswahl: ${value==='on'?'mit Musik':'in Stille'}${remember?' (gemerkt)':' (nur für diesen Besuch)'}.`;
          root.setTimeout(()=>sync(),60);
        };
        d.querySelector('[data-bell="on"]').addEventListener('click',()=>choose('on'));
        d.querySelector('[data-bell="off"]').addEventListener('click',()=>choose('off'));
        chrome().onPanelClose(audio()?.subscribe?.(snapshot=>sync(snapshot))||null);sync();
      });
  }
  /** Gegenstand (Orakelobjekt): gemeinsames Paneel aus scene-chrome.js (Karte · Musik · Geschichte). */
  function openObject(id,options){chrome().openObject(id,options);}

  root.addEventListener?.('hashchange',()=>{chrome()?.closePanel?.();if(!/^#(?:raum\/EXT|ankommen)/.test(location.hash))leave();});
  const api=Object.freeze({version:1,key:KEY,render,leave,startTutorial,restartTutorial,endTutorial,enterHouse,entryModeFor,openBell,openObject,
    isReturning:()=>returning(),state:()=>JSON.parse(JSON.stringify(state)),currentHint:()=>currentHint,scene:()=>scene,
    nextHint,normalize,isReturningFor:isReturning,HOTSPOT});
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.EMFDEntrance=api;
})(globalThis);

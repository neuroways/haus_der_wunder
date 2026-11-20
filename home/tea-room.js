/* EMFD-P08-VIS-01 · Das Teezimmer als Szene P08-C01 (Nord, Wintergarten) / P08-C02 (Süd, Sitzbank und Kachelofen).
 * Gleiche Bausteine wie Halle und Küche: EMFDScene (Ausschnitte, Umdrehen, Lichtebenen), EMFDSceneChrome (Kopfzeile, „Dein Moment“,
 * Paneele), EMFDLights (LightEngine), gemeinsamer Player (EMFDAudio).
 *  - Einstieg: direkt C01 Mitte, aus der Halle C01 links (Register-Ziel der Hallentür). Türen T03 → Halle nach Herkunft
 *    (C01 → H00-C01 rechts, C02 → H00-C02 links); Wintergarten (O01/NAV-06) vorläufig über die bisherige Ansicht.
 *  - Licht: Aus-Basis + additive Ein-Ebenen je Lampe und Ofen (Register lichtSzenen/lichter); Kartenstapel als Auflage.
 *  - Kartentisch → Nahansicht D01 mit registriertem Stapel: Beim Öffnen wird nichts gezogen und keine Musik gestartet;
 *    „Eine Karte ziehen“ nutzt die vorhandene Ziehung (verdeckt → Umdrehen), „Eine Karte aussuchen“ die Kartengalerie.
 *  - Spieluhr MP-P08 → Nahansicht (statische Walzenansicht) mit der Geräte-Playlist über den gemeinsamen Player, nur auf Tippen.
 * Die bisherige Teezimmerseite (#teezimmer) bleibt als eigene Ansicht erhalten. */
(function(root){
  'use strict';
  const DEVICE='MP-P08';
  const kit=()=>root.EMFDUIKit,reg=()=>root.EMFDRegistry,chrome=()=>root.EMFDSceneChrome,audio=()=>root.EMFDAudio;
  const esc=v=>kit()?.escape(v)??String(v);
  const info=()=>reg()?.teaRoom?.()||{};
  let scene=null;

  function render(main,{sceneId='P08-C01'}={}){
    scene?.destroy?.();
    document.body.classList.add('scene-mode','tearoom-mode');
    scene=root.EMFDScene?.mount(main,{sceneId,lights:root.EMFDLights,onAction:h=>act(h),onTurn:i=>onTurn(i),onSegment:()=>{}});
    if(!scene){main.innerHTML='<p>Das Teezimmer ist gerade nicht verfügbar.</p><p><a href="#teezimmer">Bisherige Teezimmer-Ansicht</a></p>';return null;}
    mountChrome();
    return scene;
  }
  function mountChrome(){chrome()?.mount(scene,{label:info().anzeigename||'Das Teezimmer'});}
  function leave(){if(!scene)return;scene.destroy?.();scene=null;chrome()?.unmount?.();document.body.classList.remove('tearoom-mode');if(!document.querySelector('.emfd-scene-view'))document.body.classList.remove('scene-mode');}
  function onTurn(i){root.EMFDNavigation?.replace?.(`#raum/P08/${i.to.split('-')[1]}`);mountChrome();}

  /* ---------- Aktionen ---------- */
  function act(h){
    const z=h.ziel||{};
    if((h.typ==='LIGHT'||h.typ==='LIGHT_SWITCH')&&(z.licht||z.lichter||z.gruppe||z.raum)){root.EMFDLights?.activate?.(h);return;}
    if(h.typ==='ORACLE_OBJECT'&&z.objekt){chrome()?.openObject(z.objekt,{focus:'karte'});return;}
    if(h.typ==='CARD_TABLE'){openCardTable();return;}
    if(h.typ==='MUSIC_DEVICE'&&z.geraet===DEVICE){openMusicBox();return;}
    if(h.typ==='NAVIGATION'&&z.szene){
      const route=`#raum/${z.szene.replace('-','/')}`;
      const target=reg()?.redirect?.(route)||(reg()?.isSceneRoute?.(route)?route:null);
      if(!target)return;
      if(z.segment&&reg()?.isSceneRoute?.(target)){try{root.sessionStorage?.setItem('emfd.scene.view.v1',JSON.stringify({sceneId:z.szene,segment:z.segment}));}catch{}}
      location.hash=target.slice(1);
    }
  }
  /** Bild aus dem Register oder gekennzeichneter Platzhalter (Datei noch nicht auf dem Server: Platzhalter statt leerem Bild). */
  function picture(id,cls){
    const m=reg()?.resolveMedia?.(id);
    if(!m||m.type!=='file')return reg()?.placeholderMarkup?.(m||{id,width:16,height:9},{label:'',className:`emfd-placeholder ${cls}`})||'';
    return `<img class="${cls}" src="${esc(m.src)}" alt="" aria-hidden="true" data-media-id="${esc(m.id)}" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'${cls} emfd-closeup__missing',textContent:'Bild folgt · ${esc(m.id)}'}))">`;
  }

  /** Kartentisch D01: eigene Nahansicht mit registriertem Stapel. Öffnen zieht nichts und startet keine Musik. */
  function openCardTable(){
    const t=info().kartentisch||{};const view=scene?.sceneId?.split('-')[1]||'C01';
    chrome().openPanel(`<div data-tearoom="table"><h2>Der Kartentisch</h2>`+
      `<div class="emfd-closeup emfd-closeup--wide">${picture(t.medium,'emfd-closeup__base')}${picture(t.auflage,'emfd-closeup__layer')}</div>`+
      `<p class="emfd-panel__hint-text">Hier liegt der Kartenstapel. Du entscheidest, ob du eine Karte ziehst.</p>`+
      `<div class="emfd-panel__actions">`+kit().button({label:'Eine Karte ziehen',variant:'primary',iconName:'cards',data:{'data-tearoom-card':'draw','data-panel-focus':''}})+
      kit().button({label:'Eine Karte aussuchen',variant:'secondary',iconName:'cards',data:{'data-tearoom-card':'choose'}})+
      kit().button({label:'Schließen',variant:'secondary',data:{'data-panel-close':''}})+`</div></div>`,d=>{
        d.querySelector('[data-tearoom-card="draw"]').addEventListener('click',()=>{
          d.close();const card=root.EMFDFeatures?.randomCard?.();if(!card)return;const back=`#raum/P08/${view}`;
          root.EMFDAtelier?.rememberReturn?.(back);root.EMFDCardDraw?.begin?.(card.id,back);
        });
        d.querySelector('[data-tearoom-card="choose"]').addEventListener('click',()=>{d.close();root.EMFDAtelier?.rememberReturn?.(`#raum/P08/${view}`);location.hash='karten';});
      });
  }

  /* ---------- Spieluhr MP-P08: Geräte-Playlist über den gemeinsamen Player ---------- */
  const tracks=()=>reg()?.device?.(DEVICE)?.stuecke||['O24','O04','O06'];
  const mine=s=>s?.context?.deviceId===DEVICE;
  function stateText(s){
    if(!mine(s)||!s?.track)return 'Die Spieluhr ruht.';
    if(s.state==='playing')return `Die Spieluhr spielt: ${s.track.title||''}`.trim();
    if(s.state==='paused')return 'Die Spieluhr ist angehalten.';
    if(s.state==='unavailable'||s.state==='error')return 'Die Spieluhr lässt sich gerade nicht abspielen.';
    return 'Die Spieluhr ruht.';
  }
  function openMusicBox(){
    const sp=info().spieluhr||{};
    chrome().openPanel(`<div data-tearoom="musicbox"><h2>${esc(sp.titel||'Die Teespieluhr')}</h2>`+
      `<div class="emfd-closeup emfd-closeup--portrait">${picture(sp.medium,'emfd-closeup__base')}</div>`+
      `<div class="emfd-panel__actions">`+kit().button({label:'Spieluhr spielen',variant:'primary',iconName:'play',data:{'data-musicbox':'play','data-panel-focus':''}})+
      kit().button({label:'Anhalten',variant:'secondary',iconName:'pause',data:{'data-musicbox':'pause'}})+
      kit().button({label:'Beenden',variant:'secondary',iconName:'stop',data:{'data-musicbox':'stop'}})+
      `<p class="emfd-music-control__state" role="status" data-musicbox-state></p>`+kit().button({label:'Schließen',variant:'secondary',data:{'data-panel-close':''}})+`</div></div>`,d=>{
        const sync=s=>{const el=d.querySelector('[data-musicbox-state]');if(el)el.textContent=stateText(s||audio()?.snapshot?.());};
        d.querySelector('[data-musicbox="play"]').addEventListener('click',()=>{
          const s=audio()?.snapshot?.();
          if(mine(s)&&s.state==='paused'){audio()?.command?.('play');return;}
          const ids=tracks();audio()?.playlist?.(ids,{explicit:true,startId:ids[0],context:{source:'device',deviceId:DEVICE,roomId:'P08'}});
        });
        d.querySelector('[data-musicbox="pause"]').addEventListener('click',()=>{if(mine(audio()?.snapshot?.()))audio()?.command?.('pause');});
        d.querySelector('[data-musicbox="stop"]').addEventListener('click',()=>{if(mine(audio()?.snapshot?.()))audio()?.command?.('stop');});
        chrome()?.onPanelClose?.(audio()?.subscribe?.(sync)||null);sync();
      });
  }

  root.addEventListener?.('hashchange',()=>{const room=root.EMFDRegistry?.roomForRoute?.(location.hash);if(!room||room.id!=='P08'||!root.EMFDRegistry?.isSceneRoute?.(location.hash)){if(scene)chrome()?.closePanel?.();leave();}});
  const api=Object.freeze({version:1,DEVICE,render,leave,openCardTable,openMusicBox,scene:()=>scene,stateText});
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.EMFDTeaRoom=api;
})(globalThis);

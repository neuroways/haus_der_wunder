/* EMFD-P03-DEV-01 · Der Wintergarten als Szene P03-C01 (vom Teezimmer in den Wintergarten) / P03-C02 (Blick zum Teezimmer).
 * Gleiche Bausteine wie Halle, Küche und Teezimmer: EMFDScene (Ausschnitte, Umdrehen, Wide, Lichtstimmung), EMFDSceneChrome
 * (Kopfzeile, „Dein Moment“, Hilfe, Gegenstandspaneel), gemeinsame Gerätestation und gemeinsamer Player. Nichts davon ist hier dupliziert.
 *  - Einstieg: direkt und aus dem Teezimmer C01 Mitte; aus dem Innenhof vorläufig C01 links (Register).
 *  - O05 / O13 → gemeinsames Gegenstandspaneel → vorhandene Karte (Begleiter/Mäppchen, Gedankenblatt über die Karte).
 *  - Klangschale MP-P03 → vorhandene Gerätestation (Cover, Wiedergabe, Pause, Titelwechsel). Öffnen startet nichts.
 *  - Hoföffnung → Innenhof (bisherige Seite), Durchgang → Teezimmer C02 Mitte. */
(function(root){
  'use strict';
  const DEVICE='MP-P03';
  const reg=()=>root.EMFDRegistry,chrome=()=>root.EMFDSceneChrome;
  const info=()=>reg()?.winterGarden?.()||{};
  let scene=null;

  function render(main,{sceneId='P03-C01'}={}){
    scene?.destroy?.();
    document.body.classList.add('scene-mode','wintergarden-mode');
    scene=root.EMFDScene?.mount(main,{sceneId,lights:root.EMFDLights,onAction:h=>act(h),onTurn:i=>onTurn(i),onSegment:()=>{}});
    if(!scene){main.innerHTML='<p>Der Wintergarten ist gerade nicht verfügbar.</p><p><a href="#raeume">Zu den Räumen</a></p>';return null;}
    mountChrome();
    return scene;
  }
  function mountChrome(){chrome()?.mount(scene,{label:info().anzeigename||'Der Wintergarten'});}
  function leave(){if(!scene)return;scene.destroy?.();scene=null;chrome()?.unmount?.();document.body.classList.remove('wintergarden-mode');if(!document.querySelector('.emfd-scene-view'))document.body.classList.remove('scene-mode');}
  function onTurn(i){root.EMFDNavigation?.replace?.(`#raum/P03/${i.to.split('-')[1]}`);mountChrome();}

  /** Ziel eines Szenenwegs: Szenenadresse (mit Einstiegsausschnitt) oder die bisherige Seite des Raums (Umleitung). */
  function routeFor(z){
    const route=`#raum/${z.szene.replace('-','/')}`;
    return reg()?.redirect?.(route)||(reg()?.isSceneRoute?.(route)?route:null);
  }
  function remember(z,target){
    if(z.segment&&reg()?.isSceneRoute?.(target)){try{root.sessionStorage?.setItem('emfd.scene.view.v1',JSON.stringify({sceneId:z.szene,segment:z.segment}));}catch{}}
  }
  function act(h){
    const z=h.ziel||{};
    if((h.typ==='LIGHT'||h.typ==='LIGHT_SWITCH')&&(z.licht||z.lichter||z.gruppe||z.raum)){root.EMFDLights?.activate?.(h);return;}
    if(h.typ==='ORACLE_OBJECT'&&z.objekt){chrome()?.openObject(z.objekt,{focus:'karte'});return;}
    if(h.typ==='MUSIC_DEVICE'&&z.geraet===DEVICE){openSingingBowl();return;}
    if(h.typ==='NAVIGATION'&&z.szene){const target=routeFor(z);if(!target)return;remember(z,target);location.hash=target.slice(1);}
  }
  /** Klangschale: die vorhandene Gerätestation (gleicher Ort, kein Raumwechsel). Öffnen startet keine Musik. */
  function openSingingBowl(){
    const device=root.EMFDDevices?.get?.(DEVICE);const route=device?.route||reg()?.device?.(DEVICE)?.route;
    if(!route)return;
    if(root.EMFDNavigation?.go)root.EMFDNavigation.go(route,{kind:'device'});else location.hash=route.slice(1);
  }

  root.addEventListener?.('hashchange',()=>{const room=reg()?.roomForRoute?.(location.hash);if(!room||room.id!=='P03'||!reg()?.isSceneRoute?.(location.hash)){if(scene)chrome()?.closePanel?.();leave();}});
  const api=Object.freeze({version:1,DEVICE,render,leave,act,routeFor,openSingingBowl,scene:()=>scene});
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.EMFDWinterGarden=api;
})(globalThis);

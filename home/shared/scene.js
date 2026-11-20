/* EMFD-BOOK-01b (Kern, mit BOOK-01d eingeführt) · Szenenkomponente des begehbaren Bilderbuchs.
 * Zeigt eine Szene aus dem Register (EMFDRegistry): Bildmaster per Medien-ID oder gezeichneter Platzhalter,
 * Hotspots in normalisierten Koordinaten (wandern mit dem Bild), Umschauen und Umdrehen.
 *  - Breite Fenster (ab 900 px): ganze 16:9-Illustration, dunkle Ränder statt Beschnitt, Umdrehen an beiden Seiten.
 *  - Schmale Fenster: drei überlappende Ausschnitte (L/M/R), frei wischbar mit sanftem Einrasten, Pfeile und
 *    Positionspunkte (nur Bildorientierung). Am linken/rechten Rand erscheint „Umdrehen“; es dreht nie von selbst.
 *    Wer am Bildende (Ausschnitt L/R) bewusst weiterwischt, dreht sich um; im Breitbild jede waagerechte Wischgeste.
 *  - Umdrehen: L→R, R→L, M→M in die Gegenansicht, weiche Bewegung in Blickrichtung plus Überblendung;
 *    bei reduzierter Bewegung nur eine kurze Überblendung.
 *  - Aktionsliste: alle Dinge der Ansicht als echte Buttons (Tastatur, Screenreader, ohne Wischgeste).
 * Die Szene löst nichts selbst aus: Hotspots melden sich über onAction; Fachfunktionen bleiben in ihren Modulen.
 * Licht (EMFD-LIGHT-01, verbindlich): Jede Szene zeichnet ihre Lichtquellen ausschließlich über lightLayers() aus dem zentralen
 * Lichtregister und folgt der LightEngine (EMFDLights). Räume implementieren kein eigenes Licht. */
(function(root){
  'use strict';
  const SEGMENTS=['L','M','R'];
  const OPPOSITE={L:'R',R:'L',M:'M'};
  const WIDE_MIN=900;
  const kit=()=>root.EMFDUIKit;
  const registry=()=>root.EMFDRegistry;
  const reduced=()=>Boolean(root.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
  const STORE='emfd.scene.view.v1';
  function remember(sceneId,segment){try{root.sessionStorage?.setItem(STORE,JSON.stringify({sceneId,segment}));}catch{}}
  function remembered(sceneId){try{const v=JSON.parse(root.sessionStorage?.getItem(STORE)||'null');return v&&v.sceneId===sceneId&&SEGMENTS.includes(v.segment)?v.segment:null;}catch{return null;}}

  /** Ausschnitt nach einer Drehung (Vorschlag TUT-02: L→R, R→L, M→M). */
  function turnTarget(segment){return OPPOSITE[segment]||'M';}
  /** Ausschnitt aus der Scrollposition: frei wischbar, die Punkte zeigen den nächstliegenden Anker. */
  // mid = Scrollposition des Ausschnitts M (EMFD-P03-DEV-01: auf den Schwerpunkt zentriert, Register ausschnitte.M); ohne Angabe die Bildmitte.
  // L und R bleiben an den Bildrändern, damit Umdrehen am Rand gleich funktioniert.
  const clampMid=(mid,max)=>mid==null||!Number.isFinite(mid)?max/2:Math.max(0,Math.min(max,mid));
  function segmentFor(scrollLeft,max,mid){if(!(max>0))return 'M';const m=clampMid(mid,max);return scrollLeft<m/2?'L':scrollLeft>(m+max)/2?'R':'M';}
  function scrollFor(segment,max,mid){return segment==='L'?0:segment==='R'?max:clampMid(mid,max);}
  /** Weiterwischen am Bildende dreht um (rein): Die Geste muss im Randausschnitt beginnen (L bzw. R – dort, wo auch
   *  „Umdrehen“ erscheint) und deutlich waagerecht in Richtung Rand gehen. Im Breitbild ist jede waagerechte
   *  Wischgeste ein Weiterwischen. dx>0 = Finger nach rechts = weiter nach links schauen. Ergebnis: 'left'|'right'|null. */
  const SWIPE_MIN=56;
  function edgeSwipe({dx=0,dy=0,segment='M',wide=false}={}){
    if(Math.abs(dx)<SWIPE_MIN||Math.abs(dx)<Math.abs(dy)*1.5)return null;
    if(dx>0&&(wide||segment==='L'))return 'left';
    if(dx<0&&(wide||segment==='R'))return 'right';
    return null;
  }

  /* ---------- EMFD-LIGHT-01: Lichtebenen (gleiche Bühne, gleiche Koordinaten und gleicher Zuschnitt wie das Raumbild) ----------
   * Reihenfolge: Base (Raum ohne schaltbares Kunstlicht, ersetzt dann den Master) · Auflagen (statisch, z. B. Kartenstapel) · Ambient (natürliches Licht, nie geschaltet) ·
   * je Lichtquelle Source · Spill · Glow · Reflection oder eine vollständige additive Ein-Ebene „licht“ (Vollbild-Ebenen, sichtbar wenn an) · An/Aus-Bildpaar (Übergang) ·
   * programmatische Platzhalter (nur ohne finale Medien; gekennzeichnet, keine Freigabe). */
  const LAYERS=Object.freeze(['source','spill','glow','reflection','licht']);
  const pctBox=(r,grow=1,growY=grow)=>{const cx=r.x+r.w/2,cy=r.y+r.h/2,w=r.w*grow,h=r.h*growY;return `left:${((cx-w/2)*100).toFixed(3)}%;top:${((cy-h/2)*100).toFixed(3)}%;width:${(w*100).toFixed(3)}%;height:${(h*100).toFixed(3)}%`;};
  function lightPlan(sceneId){
    const reg=registry();const lightsDef=reg?.lightsForScene?.(sceneId)||[];const sceneDef=reg?.lightScene?.(sceneId)||{};
    const file=id=>{const m=id&&reg.resolveMedia(id);return m&&m.type==='file'?m:null;};
    const mood=reg?.lightMood?.(sceneId)||null;
    return {lights:lightsDef,base:file(sceneDef.basis),mood:mood?.medium?file(mood.medium):null,ambient:file(sceneDef.ambient),overlays:(sceneDef.auflagen||[]).map(file).filter(Boolean),pair:sceneDef.paar&&file(sceneDef.paar.aus)?{aus:file(sceneDef.paar.aus),lichter:sceneDef.paar.lichter||lightsDef.map(l=>l.id)}:null,file};
  }
  /** Markup des Lichtstapels einer Szene (auch für Nahansichten, die einen Ausschnitt derselben Bühne zeigen). */
  function lightLayers(sceneId,engine=root.EMFDLights){
    const ui=kit();const plan=lightPlan(sceneId);const on=id=>engine?.get?.(id)!==false;
    const ms=id=>`--light-ms:${engine?.duration?.(id)??400}ms`;
    const img=(m,cls,extra='')=>`<img class="emfd-light-layer ${cls}" src="${ui.escape(m.src)}" alt="" aria-hidden="true" draggable="false" data-media-id="${ui.escape(m.id)}" ${extra}>`;
    let out='';
    // Statische, registrierte Auflagen (z. B. Kartenstapel) liegen direkt auf der Basis, unter dem Licht.
    for(const o of plan.overlays)out+=img(o,'emfd-light-layer--auflage','data-layer="auflage"');
    if(plan.ambient)out+=img(plan.ambient,'emfd-light-layer--ambient','data-layer="ambient"');
    let anyPlaceholder=false;
    for(const l of plan.lights){
      const v=l.ansichten[sceneId];const off=on(l.id)?'':' is-off';
      const media=LAYERS.map(k=>[k,plan.file(v.ebenen?.[k])]).filter(([,m])=>m);
      if(media.length){for(const [k,m] of media)out+=img(m,`emfd-light-layer--${k}${off}`,`data-light="${ui.escape(l.id)}" data-layer="${k}" style="${ms(l.id)}"`);continue;}
      if(plan.base||plan.pair?.lichter.includes(l.id))continue;
      anyPlaceholder=true;const r=v.rect;
      // Platzhalter: Quelle erlischt (dunkler Kern über Leuchtmittel/Flamme), Lichtschein verschwindet (weiter Hof).
      out+=`<span class="emfd-light-ph emfd-light-ph--spill${off}" data-light="${ui.escape(l.id)}" data-layer="spill" data-placeholder="lichtmaske" aria-hidden="true" style="${pctBox(r,4.2,2.6)};${ms(l.id)}"></span>`+
        `<span class="emfd-light-ph emfd-light-ph--source${off}" data-light="${ui.escape(l.id)}" data-layer="source" data-placeholder="lichtmaske" aria-hidden="true" style="${pctBox(r,1.25,1.05)};${ms(l.id)}"></span>`;
    }
    if(plan.pair){const allOff=plan.pair.lichter.every(id=>!on(id));out+=img(plan.pair.aus,`emfd-light-layer--pair${allOff?' is-off':''}`,`data-light-pair="${ui.escape(plan.pair.lichter.join(' '))}" data-layer="pair" style="${ms(plan.pair.lichter[0])}"`);}
    // Raum wird mit jeder ausgeschalteten Quelle dunkler (Platzhalter, nur ohne Base/Paar); natürliches Licht bleibt über ambient.
    if(anyPlaceholder){const ids=plan.lights.map(l=>l.id);const frac=ids.length?ids.filter(id=>!on(id)).length/ids.length:0;
      out+=`<span class="emfd-light-dim" data-light-dim="${ui.escape(ids.join(' '))}" data-placeholder="raumdunkel" aria-hidden="true" style="opacity:${(0.28*frac).toFixed(3)}"></span>`;}
    return out;
  }
  /** Zustandswechsel auf einen gerenderten Lichtstapel anwenden (Szene und Nahansicht). */
  function applyLight(container,id,on,engine=root.EMFDLights){
    if(!container)return;
    container.querySelectorAll(`[data-light="${CSS.escape(id)}"]`).forEach(o=>{o.style.setProperty('--light-ms',`${engine?.duration?.(id)??400}ms`);o.classList.toggle('is-off',!on);});
    container.querySelectorAll('[data-light-pair]').forEach(o=>{const ids=o.dataset.lightPair.split(' ');if(ids.includes(id))o.classList.toggle('is-off',ids.every(x=>engine?.get?.(x)===false));});
    container.querySelectorAll('[data-light-dim]').forEach(o=>{const ids=o.dataset.lightDim.split(' ').filter(Boolean);const frac=ids.length?ids.filter(x=>engine?.get?.(x)===false).length/ids.length:0;o.style.opacity=(0.28*frac).toFixed(3);});
  }

  /** Schwerpunkt (0–1) des Ausschnitts M aus dem Register (ausschnitte.M = {x,w}); null = Bildmitte. */
  function midFocus(scene){const a=scene?.ausschnitte?.M;return a&&Number.isFinite(a.x)&&a.w>0?a.x+a.w/2:null;}
  function stageMarkup(scene,{lights}){
    const reg=registry(),ui=kit();
    const plan=lightPlan(scene.id);
    // Basis: Aus-Bild der Lichtszene, sonst das Medium der aktiven Lichtstimmung (vorbereitet, EMFD-P03-DEV-01), sonst das Szenenmedium.
    const baseFile=plan.base||plan.mood;
    const media=baseFile?Object.freeze({...reg.sceneMedia(scene.id),...baseFile,type:'file'}):reg.sceneMedia(scene.id);
    const room=reg.room(scene.raumId);
    const alt=`${room?.anzeigename||scene.raumId}: ${scene.beschreibung}`;
    const art=media.type==='file'
      ?`<img class="emfd-scene-view__image" src="${ui.escape(media.src)}" alt="" width="${media.width}" height="${media.height}" data-media-id="${ui.escape(media.id)}" decoding="async" fetchpriority="high">`
      :reg.placeholderMarkup(media,{label:'',className:'emfd-placeholder emfd-scene-view__image'}).replace('role="img"','aria-hidden="true"');
    const ratio=`${media.width}/${media.height}`;
    const hotspots=(scene.hotspots||[]).map(h=>{
      const light=h.typ==='LIGHT'&&h.ziel?.licht;
      return ui.hotspot({id:h.id,label:light?`${h.label} – ${lights?.get(light)!==false?'an':'aus'}`:h.label,rect:h.rect,pressed:light?lights?.get(light)!==false:undefined,data:{'data-hotspot-type':h.typ}});
    }).join('');
    const lightLayer=lightLayers(scene.id,lights);
    return {html:`<div class="emfd-scene-view__stage" style="aspect-ratio:${ratio}" data-media-status="${media.type}">${art}<div class="emfd-scene-view__lights">${lightLayer}</div>`+
      `<span class="emfd-scene-view__anchor" data-anchor="L"></span><span class="emfd-scene-view__anchor" data-anchor="M"${midFocus(scene)!=null?` style="inset-inline-start:${(midFocus(scene)*100).toFixed(2)}%"`:''}></span><span class="emfd-scene-view__anchor" data-anchor="R"></span>`+
      `<div class="emfd-scene-view__hotspots">${hotspots}</div>${media.type==='file'?'':`<p class="emfd-scene-view__placeholder-note">Platzhalter · ${ui.escape(media.id)}</p>`}</div>`,alt,media};
  }

  function mount(host,options={}){
    const reg=registry(),ui=kit();
    if(!host||!reg||!ui)return null;
    let scene=reg.scene(options.sceneId);
    if(!scene)return null;
    const lights=options.lights||root.EMFDLights||null;
    let segment=SEGMENTS.includes(options.segment)?options.segment:remembered(scene.id)||'M';
    let listOpen=false,turning=false,destroyed=false;
    const el=document.createElement('section');
    el.className='emfd-scene-view';
    el.dataset.scene=scene.id;
    host.replaceChildren(el);

    function title(){const room=reg.room(scene.raumId);return `${room?.anzeigename||scene.raumId} – ${scene.beschreibung}`;}
    function render(){
      const stage=stageMarkup(scene,{lights});
      const opposite=scene.gegenansicht?reg.scene(scene.gegenansicht):null;
      const turnLabel=opposite?`Umdrehen: ${opposite.beschreibung}`:'';
      el.dataset.scene=scene.id;
      el.innerHTML=`<h1 class="sr-only" data-scene-title>${ui.escape(title())}</h1>`+
        `<div class="emfd-scene-view__viewport" data-scene-viewport tabindex="0" role="group" aria-roledescription="Bild" aria-label="${ui.escape(stage.alt)}. Wische oder nutze die Pfeile, um dich umzusehen.">${stage.html}</div>`+
        // Kopfzeile (H00 v0.3): Musik links, Raumlabel mittig, Hilfe rechts – gefüllt von shared/scene-chrome.js.
        `<div class="emfd-scene-bar" data-scene-bar><span class="emfd-scene-bar__start" data-scene-bar-left></span><p class="emfd-scene-label" data-scene-label></p><span class="emfd-scene-bar__end" data-scene-bar-extra></span></div>`+
        `${ui.iconButton({label:'Nach links schauen',iconName:'chevron-left',className:'emfd-pan emfd-pan--left',data:{'data-scene-pan':'-1'}})}`+
        `${ui.iconButton({label:'Nach rechts schauen',iconName:'chevron-right',className:'emfd-pan emfd-pan--right',data:{'data-scene-pan':'1'}})}`+
        (opposite?ui.turnButton({side:'left',label:turnLabel})+ui.turnButton({side:'right',label:turnLabel}):'')+
        ui.dots({current:SEGMENTS.indexOf(segment)})+
        `<ul class="emfd-actionlist" id="emfd-scene-actions" data-scene-actions hidden aria-label="Alles in dieser Ansicht"></ul>`+
        `<div class="emfd-scene-view__hint" data-scene-hint></div>`;
      fillActionList();
      bind();
      layout();
      const image=el.querySelector('img.emfd-scene-view__image');
      if(image&&!image.complete)image.addEventListener('load',()=>layout(),{once:true});
      image?.addEventListener('error',()=>{const fig=reg.placeholderMarkup(reg.resolveMedia(scene.platzhalter||'scene.'+scene.id),{label:'',className:'emfd-placeholder emfd-scene-view__image'}).replace('role="img"','aria-hidden="true"');image.outerHTML=fig;},{once:true});
    }
    function fillActionList(){
      const list=el.querySelector('[data-scene-actions]');
      const items=(scene.hotspots||[]).map(h=>`<li><button type="button" data-scene-list-action="${ui.escape(h.id)}">${ui.escape(h.label)}</button></li>`);
      const opposite=scene.gegenansicht&&reg.scene(scene.gegenansicht);
      if(opposite)items.push(`<li><button type="button" data-scene-list-turn>Umdrehen: ${ui.escape(opposite.beschreibung)}</button></li>`);
      list.innerHTML=items.join('');
    }
    const viewport=()=>el.querySelector('[data-scene-viewport]');
    const maxScroll=()=>{const v=viewport();return v?Math.max(0,v.scrollWidth-v.clientWidth):0;};
    const midScroll=()=>{const f=midFocus(scene),v=viewport();return f==null||!v?null:f*v.scrollWidth-v.clientWidth/2;};
    // Breit = ganze Szene sichtbar: ab WIDE_MIN oder wenn das Bild in voller Höhe ohnehin in die Breite passt.
    // Aus der Bildgeometrie berechnet (nicht aus der Scrollbreite: im Ganzbild-Zustand gibt es nie etwas zu scrollen,
    // sonst bliebe die Szene nach dem Verkleinern des Fensters im Ganzbild hängen).
    function isWide(){
      if(el.clientWidth>=WIDE_MIN)return true;
      const v=viewport(),stage=el.querySelector('.emfd-scene-view__stage');const ratio=stageRatio(stage);
      if(!v||!ratio)return maxScroll()<8;
      return v.clientHeight*ratio<=v.clientWidth+8;
    }
    function stageRatio(stage){const m=/([\d.]+)\s*\/\s*([\d.]+)/.exec(stage?.style?.aspectRatio||'');return m?Number(m[1])/Number(m[2]):0;}
    function layout(){
      if(destroyed)return;
      const wide=isWide();
      el.classList.toggle('is-wide',wide);el.classList.toggle('is-panning',!wide);
      if(!wide){const v=viewport();if(v){v.style.scrollSnapType='none';v.scrollLeft=scrollFor(segment,maxScroll(),midScroll());root.requestAnimationFrame?.(()=>{if(v.isConnected)v.style.scrollSnapType='';});}}
      update();
    }
    function update(){
      const wide=el.classList.contains('is-wide');
      el.dataset.segment=wide?'M':segment;
      el.querySelectorAll('.emfd-dots [data-scene-segment]').forEach((dot,i)=>{if(SEGMENTS[i]===segment)dot.setAttribute('aria-current','true');else dot.removeAttribute('aria-current');});
      const left=el.querySelector('.emfd-turn--left'),right=el.querySelector('.emfd-turn--right');
      if(left)left.hidden=!wide&&segment!=='L';
      if(right)right.hidden=!wide&&segment!=='R';
      const panL=el.querySelector('[data-scene-pan="-1"]'),panR=el.querySelector('[data-scene-pan="1"]');
      if(panL)panL.hidden=wide||segment==='L';
      if(panR)panR.hidden=wide||segment==='R';
      const dots=el.querySelector('.emfd-dots');if(dots)dots.hidden=wide;
    }
    function setSegment(next,{smooth=true}={}){
      if(!SEGMENTS.includes(next))return;
      const v=viewport();const prev=segment;segment=next;remember(scene.id,segment);
      if(v&&!el.classList.contains('is-wide'))v.scrollTo?.({left:scrollFor(segment,maxScroll(),midScroll()),behavior:smooth&&!reduced()?'smooth':'auto'});
      update();if(prev!==segment)options.onSegment?.(segment,api);
    }
    function onScroll(){
      if(el.classList.contains('is-wide'))return;
      const next=segmentFor(viewport().scrollLeft,maxScroll(),midScroll());
      if(next!==segment){segment=next;remember(scene.id,segment);update();options.onSegment?.(segment,api);}
    }
    function turn(side){
      const opposite=scene.gegenansicht&&reg.scene(scene.gegenansicht);
      if(!opposite||turning)return false;
      const wide=el.classList.contains('is-wide');
      const from=wide?'M':side==='left'?'L':side==='right'?'R':segment;
      const next=turnTarget(from);
      const direction=side==='left'||from==='L'?'left':side==='right'||from==='R'?'right':'none';
      const previous=scene.id;
      turning=true;
      const finish=()=>{
        scene=opposite;segment=next;remember(scene.id,segment);render();
        el.classList.add('is-turned-in',`from-${direction}`);
        root.setTimeout(()=>{el.classList.remove('is-turned-in','from-left','from-right','from-none');turning=false;},reduced()?120:420);
        options.onTurn?.({from:previous,to:scene.id,side,segment},api);
      };
      if(reduced()){finish();return true;}
      el.classList.add('is-turning',`to-${direction}`);
      root.setTimeout(()=>{el.classList.remove('is-turning','to-left','to-right','to-none');finish();},260);
      return true;
    }
    function hotspot(id){return (scene.hotspots||[]).find(h=>h.id===id)||null;}
    function activate(id,source){const h=hotspot(id);if(h)options.onAction?.(h,{source,api});}
    function bind(){
      el.querySelectorAll('[data-hotspot]').forEach(b=>b.addEventListener('click',()=>activate(b.dataset.hotspot,'hotspot')));
      el.querySelectorAll('[data-scene-list-action]').forEach(b=>b.addEventListener('click',()=>{toggleList(false);activate(b.dataset.sceneListAction,'list');}));
      el.querySelector('[data-scene-list-turn]')?.addEventListener('click',()=>{toggleList(false);turn(segment==='L'?'left':segment==='R'?'right':'center');});
      el.querySelectorAll('[data-scene-turn]').forEach(b=>b.addEventListener('click',()=>turn(b.dataset.sceneTurn)));
      el.querySelectorAll('[data-scene-pan]').forEach(b=>b.addEventListener('click',()=>{const i=SEGMENTS.indexOf(segment)+Number(b.dataset.scenePan);setSegment(SEGMENTS[Math.max(0,Math.min(2,i))]);}));
      el.querySelectorAll('[data-scene-segment]').forEach(b=>b.addEventListener('click',()=>setSegment(SEGMENTS[Number(b.dataset.sceneSegment)])));
      const v=viewport();let t=null;
      v?.addEventListener('scroll',()=>{root.clearTimeout(t);t=root.setTimeout(onScroll,80);},{passive:true});
      // Weiterwischen am Bildende → Umdrehen (nur Touch; Maus/Tastatur nutzen „Umdrehen“).
      let start=null;
      v?.addEventListener('touchstart',event=>{if(event.touches.length!==1){start=null;return;}const p=event.touches[0];const wide=el.classList.contains('is-wide');start={x:p.clientX,y:p.clientY,wide,segment:wide?'M':segmentFor(v.scrollLeft,maxScroll(),midScroll())};},{passive:true});
      v?.addEventListener('touchend',event=>{if(!start)return;const p=event.changedTouches[0];const side=edgeSwipe({dx:p.clientX-start.x,dy:p.clientY-start.y,segment:start.segment,wide:start.wide});start=null;if(side)turn(side);},{passive:true});
      v?.addEventListener('touchcancel',()=>{start=null;},{passive:true});
      el.addEventListener('keydown',event=>{if(event.key==='Escape'&&listOpen){toggleList(false);listOpener?.focus?.();}});
    }
    let listOpener=null;
    /** Aktionsliste „Alles in dieser Ansicht“ (aufgerufen aus der Hilfe; Escape schließt, Fokus zurück). */
    function toggleList(force){
      listOpen=typeof force==='boolean'?force:!listOpen;
      const list=el.querySelector('[data-scene-actions]');
      if(listOpen)listOpener=document.activeElement;
      if(list)list.hidden=!listOpen;
      if(listOpen)list?.querySelector('button')?.focus();
    }
    /** „Interaktive Gegenstände anzeigen“: alle Hotspots dezent umranden (bis zum erneuten Umschalten). */
    function showHotspots(on){el.classList.toggle('show-hotspots',Boolean(on));return el.classList.contains('show-hotspots');}
    function setLight(id,on){
      applyLight(el,id,on,lights);
      (scene.hotspots||[]).filter(h=>h.ziel?.licht===id).forEach(h=>{const b=el.querySelector(`[data-hotspot="${CSS.escape(h.id)}"]`);if(b){b.setAttribute('aria-pressed',String(on));b.setAttribute('aria-label',`${h.label} – ${on?'an':'aus'}`);b.querySelector('.emfd-hotspot__label').textContent=`${h.label} – ${on?'an':'aus'}`;}});
    }
    /** Sichtbarkeit eines Hotspots im aktuellen Ausschnitt (0–1 Anteil der Breite). */
    function visibility(id){
      const h=hotspot(id);if(!h)return 0;
      if(el.classList.contains('is-wide'))return 1;
      const v=viewport(),stage=el.querySelector('.emfd-scene-view__stage');if(!v||!stage)return 0;
      const w=stage.clientWidth,left=h.rect.x*w,right=(h.rect.x+h.rect.w)*w,vl=v.scrollLeft,vr=vl+v.clientWidth;
      return Math.max(0,Math.min(right,vr)-Math.max(left,vl))/Math.max(1,right-left);
    }
    function mark(ids=[]){el.querySelectorAll('[data-hotspot]').forEach(b=>b.classList.toggle('is-hinted',ids.includes(b.dataset.hotspot)));}
    const resize=()=>layout();
    root.addEventListener('resize',resize);
    // EMFD-LIGHT-01: Die Szene folgt der LightEngine (Umdrehen, Ausschnitt, Wide ändern den Zustand nicht).
    const unsubscribeLights=lights?.subscribe?.((id,on)=>{if(!destroyed)setLight(id,on);})||null;
    const api={el,get sceneId(){return scene.id;},get scene(){return scene;},get segment(){return segment;},get wide(){return el.classList.contains('is-wide');},
      setSegment,turn,hotspot,visibility,mark,setLight,layout,toggleList,showHotspots,listOpen:()=>listOpen,
      hintHost:()=>el.querySelector('[data-scene-hint]'),barHost:()=>el.querySelector('[data-scene-bar-extra]'),
      leftHost:()=>el.querySelector('[data-scene-bar-left]'),labelHost:()=>el.querySelector('[data-scene-label]'),
      destroy(){destroyed=true;root.removeEventListener('resize',resize);unsubscribeLights?.();}};
    render();
    remember(scene.id,segment);
    return api;
  }
  const exported=Object.freeze({version:1,mount,turnTarget,segmentFor,scrollFor,midFocus,edgeSwipe,lightLayers,applyLight,lightPlan,LAYERS,SEGMENTS,WIDE_MIN});
  if(typeof module!=='undefined'&&module.exports)module.exports=exported;
  root.EMFDScene=exported;
})(globalThis);

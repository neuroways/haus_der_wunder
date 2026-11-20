/* EMFD-KUE-DEV-01 / BOOK-01f · Radio-Modus für Musikgeräte (zuerst MP-KUE, Röhrenradio der Küche).
 * Nutzt ausschließlich den gemeinsamen Player (EMFDAudio): kein eigener Audio-Pfad, eine Quelle.
 *  - Einschalten (bewusst): zufällige Folge („Shuffle-Bag“) aus den vorhandenen Kompositionen O01–O24, ohne Wiederholung
 *    vor vollständigem Durchlauf; an der Zyklusgrenze nie sofort derselbe Titel. Kein Hauptthema. Fehlende Dateien entfallen.
 *  - Natürliches Titelende → nächster Titel (Player-Warteschlange); Ende der Folge → neue Folge, solange das Radio an ist.
 *  - Ausschalten oder globaler Stopp → Radio aus, kein Rückfall auf das Hauptthema.
 *  - Andere bewusst gestartete Quelle (Wiedergabekontext ≠ Gerät) → Radio aus.
 *  - Globale Pause → Radio bleibt an (pausiert); „Radio einschalten“ setzt dann fort.
 *  - Raumwechsel, Umdrehen, Schließen der Nahansicht ändern nichts (W1). Nach Neuladen ist das Radio aus (nichts gespeichert).
 * Zustand: off | starting | playing | paused | error. */
(function(root){
  'use strict';
  const IDS=Object.freeze(Array.from({length:24},(_,i)=>`O${String(i+1).padStart(2,'0')}`));
  /** Shuffle-Bag (rein): alle Titel genau einmal, erster Titel ≠ avoid (sofern mehr als einer). rand liefert [0,1). */
  function shuffleBag(ids,{rand=Math.random,avoid=null}={}){
    const bag=[...new Set(ids)];
    for(let i=bag.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}
    if(avoid&&bag.length>1&&bag[0]===avoid){const k=1+Math.floor(rand()*(bag.length-1));[bag[0],bag[k]]=[bag[k],bag[0]];}
    return bag;
  }
  function create({audio,deviceId,roomId,ids=IDS,rand=Math.random}){
    let state='off',message='',bag=[],last=null,listeners=new Set();
    const set=(next,msg='')=>{if(state===next&&message===msg)return;state=next;message=msg;for(const fn of [...listeners]){try{fn(view());}catch{}}};
    const view=()=>Object.freeze({deviceId,state,on:state==='playing'||state==='starting'||state==='paused',message,queue:Object.freeze([...bag])});
    const mine=snap=>Boolean(snap?.context&&snap.context.deviceId===deviceId);
    function available(){
      const a=audio();if(!a)return [];
      return ids.filter(id=>a.availability?.(id)!=='missing');
    }
    function startBag(){
      const a=audio();const pool=available();
      if(!a||!pool.length){set('error','Das Radio findet gerade keine Musik. Bitte versuche es später noch einmal.');return false;}
      bag=shuffleBag(pool,{rand,avoid:last});
      set('starting');
      const ok=a.playlist(bag,{explicit:true,startId:bag[0],context:{source:'device',deviceId,roomId,mode:'radio'}});
      if(!ok){bag=[];set('error','Das Radio lässt sich gerade nicht einschalten.');return false;}
      return true;
    }
    function on(){
      const snap=audio()?.snapshot?.();
      if(state==='paused'&&mine(snap)){audio().command('play');return true;}
      if(state==='playing'||state==='starting')return true;
      return startBag();
    }
    function off(){
      const snap=audio()?.snapshot?.();
      const wasMine=mine(snap);
      bag=[];set('off');
      if(wasMine)audio()?.command?.('stop');
      return true;
    }
    function toggle(){return state==='off'||state==='error'?on():off();}
    /** Folgt dem gemeinsamen Player: einzige Quelle der Wahrheit für den Gerätezustand. */
    function observe(snap){
      if(state==='off')return;
      if(!mine(snap)){
        if(state==='starting'&&!snap?.context)return; // Kontext wird gerade gesetzt
        bag=[];set('off');return; // andere Quelle bewusst gestartet
      }
      const id=snap.track?.cardId||snap.track?.assetId||snap.entryId;if(id)last=id;
      switch(snap.state){
        case 'playing':set('playing');break;
        case 'starting':case 'preparing':case 'ready':if(state!=='paused')set('starting');break;
        case 'paused':set('paused');break;
        case 'stopped':case 'silent':if(state!=='starting'){bag=[];set('off');}break; // Aus oder globaler Stopp
        case 'ended':
          // Ende der Folge (Player beendet die Warteschlange): neue Folge, solange das Radio an ist.
          // Nach der Player-Verarbeitung des Titelendes starten (sonst schließt der Player die alte Warteschlange danach).
          if(bag.length&&id===bag[bag.length-1]){const done=id;(root.setTimeout||setTimeout)(()=>{if(state!=='off'&&last===done)startBag();},0);}
          break;
        case 'unavailable':case 'error':bag=[];set('error',snap.message||'Dieses Stück lässt sich gerade nicht abspielen.');break;
      }
    }
    return Object.freeze({deviceId,on,off,toggle,observe,view,subscribe(fn){listeners.add(fn);fn(view());return ()=>listeners.delete(fn);}});
  }
  const radios=new Map();
  function get(deviceId,options={}){
    if(!radios.has(deviceId)){
      const r=create({audio:()=>root.EMFDAudio,deviceId,roomId:options.roomId||null,ids:options.ids||IDS});
      radios.set(deviceId,r);
      const attach=()=>root.EMFDAudio?.subscribe?.(snap=>r.observe(snap));
      if(root.EMFDAudio)attach();else root.addEventListener?.('emfd:music-ready',attach,{once:true});
    }
    return radios.get(deviceId);
  }
  const api=Object.freeze({version:1,IDS,shuffleBag,create,get});
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.EMFDRadio=api;
})(globalThis);

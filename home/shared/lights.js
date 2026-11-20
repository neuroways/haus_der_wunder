/* EMFD-LIGHT-01 · LightEngine: zentrale, hausweite Lichtsteuerung (verbindlich für alle Räume; keine eigenen Lichtlösungen pro Raum).
 * - Lichtquellen kommen aus dem zentralen Lichtregister (EMFDRegistry.lights(): stabile Licht-ID, Art, Standardzustand,
 *   Übergangsdauer, Gruppen, Ansichten mit Ebenen-Medien). Gleiche physische Quelle = gleiche ID in allen Ansichten und Räumen.
 * - Zustand gehört zur Lichtquelle, nicht zur Kamera: Umdrehen, Smartphone-Ausschnitt, Wide-Wechsel ändern nichts.
 *   Speicher: localStorage emfd.lights.v1 {<Licht-ID>: true|false}; fehlt ein Wert, gilt der Standard aus dem Register
 *   (Hallenlichter übernehmen ohne eigenen Wert den bisherigen Flurlicht-Zustand emfd.house.light.v1, nur gelesen).
 * - Bedienung: activate(hotspot) für direktes Antippen (ziel.licht), physische Schalter und Gruppen (ziel.lichter / ziel.gruppe /
 *   ziel.raum), setRoom/toggleRoom für „alle Lichter eines Raumes“. Natürliches Licht und Geräteanzeigen gehören nicht hierher.
 * - Darstellung übernimmt die Szenenkomponente (shared/scene.js) über subscribe(); Dauer je Quelle über duration(id). */
(function(root){
  'use strict';
  const KEY='emfd.lights.v1';
  const LEGACY_HALL='emfd.house.light.v1';
  /** Arten und Standarddauer der Übergänge (ms); pro Lichtquelle im Register überschreibbar. */
  const ART=Object.freeze({deckenlampe:400,wandlampe:400,tischlampe:400,stehlampe:400,unterbau:400,lichterkette:400,laterne:600,kerze:600,aussen:600,magisch:600,kamin:1000});
  const valid=id=>typeof id==='string'&&/^LIGHT-[A-Z0-9-]+$/.test(id);
  function load(storage){try{const v=JSON.parse(storage?.getItem(KEY)||'{}');return v&&typeof v==='object'&&!Array.isArray(v)?v:{};}catch{return {};}}

  function create(storage,{registry=()=>root.EMFDRegistry,reducedMotion=()=>Boolean(root.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches)||Boolean(root.document?.body?.classList?.contains?.('motion-off'))}={}){
    let state=load(storage);const listeners=new Set();
    let hallLegacy=null;try{hallLegacy=storage?.getItem(LEGACY_HALL);}catch{}
    const definition=id=>registry()?.light?.(id)||null;
    const all=()=>registry()?.lights?.()||[];
    function standard(id){
      const d=definition(id);
      if(id.startsWith('LIGHT-H00-')&&hallLegacy==='off')return false;
      return d?d.standard!==false:true;
    }
    function get(id){if(!valid(id))return true;return typeof state[id]==='boolean'?state[id]:standard(id);}
    function persist(){try{storage?.setItem(KEY,JSON.stringify(state));}catch{}}
    function emit(id,on){
      for(const fn of [...listeners]){try{fn(id,on);}catch{}}
      root.dispatchEvent?.(new CustomEvent('emfd:light-change',{detail:{id,on}}));
    }
    function setMany(ids,on){
      const changed=[];
      for(const id of ids){if(!valid(id))continue;const value=Boolean(on);if(get(id)!==value||typeof state[id]!=='boolean'){state={...state,[id]:value};changed.push(id);}}
      if(changed.length){persist();for(const id of changed)emit(id,Boolean(on));}
      return Boolean(on);
    }
    function set(id,on){if(!valid(id))return false;setMany([id],on);return Boolean(on);}
    const toggle=id=>set(id,!get(id));
    /** Alle Lichter eines Raumes (Gruppe „Raum“). */
    const roomLights=roomId=>all().filter(l=>l.raumId===roomId).map(l=>l.id);
    const groupLights=group=>all().filter(l=>(l.gruppen||[]).includes(group)).map(l=>l.id);
    const sceneLights=sceneId=>all().filter(l=>l.ansichten&&l.ansichten[sceneId]).map(l=>l.id);
    /** Gruppe umschalten: ist mindestens eine Quelle an, gehen alle aus; sonst gehen alle an. */
    function toggleMany(ids){const any=ids.some(get);return setMany(ids,!any);}
    const setRoom=(roomId,on)=>setMany(roomLights(roomId),on);
    const toggleRoom=roomId=>toggleMany(roomLights(roomId));
    /** Zentrale Bedienung aus einer Szene: Antippen einer Quelle, physischer Schalter oder Gruppenschalter. */
    function activate(hotspot){
      const z=hotspot?.ziel||{};
      if(Array.isArray(z.lichter)&&z.lichter.length)return toggleMany(z.lichter.filter(valid));
      if(z.gruppe)return toggleMany(groupLights(z.gruppe));
      if(z.raum&&hotspot?.typ==='LIGHT_SWITCH')return toggleRoom(z.raum);
      if(z.licht)return toggle(z.licht);
      return null;
    }
    /** Übergangsdauer in ms (reduzierte Bewegung: 0). */
    function duration(id){if(reducedMotion())return 0;const d=definition(id);return Number(d?.dauer)||ART[d?.art]||400;}
    return Object.freeze({version:2,key:KEY,ART,get,set,setMany,toggle,toggleMany,setRoom,toggleRoom,activate,roomLights,groupLights,sceneLights,definition,duration,standard,
      subscribe(fn){listeners.add(fn);return ()=>listeners.delete(fn);}});
  }
  let storage=null;try{storage=root.localStorage||null;}catch{}
  const api=create(storage);
  if(typeof module!=='undefined'&&module.exports)module.exports={create,KEY,ART};
  else{root.EMFDLights=api;root.EMFDLightEngine=api;}
})(globalThis);

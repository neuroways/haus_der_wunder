/* EMFD-BOOK-01d · Lichtzustände der Gegenstände (Laternen, Lampen) je physischer Licht-ID.
 * Gleiche Licht-ID in mehreren Ansichten = derselbe Zustand. Speicher: localStorage emfd.lights.v1 (nur Ein/Aus je ID).
 * Das Flurlicht bleibt beim bestehenden EMFDHallLight (emfd.house.light.v1); beide Zustände werden getrennt geführt.
 * Standard ist „an“ (die Szenen zeigen erleuchtete Laternen). Lichter der Halle (LIGHT-H00-…) übernehmen ohne eigenen Wert den
 * bisherigen Flurlicht-Zustand emfd.house.light.v1 (nur gelesen, nie überschrieben). Fehlender/gesperrter Speicher: nur Sitzung. */
(function(root){
  'use strict';
  const KEY='emfd.lights.v1';
  function load(storage){try{const v=JSON.parse(storage?.getItem(KEY)||'{}');return v&&typeof v==='object'&&!Array.isArray(v)?v:{};}catch{return {};}}
  function create(storage){
    let state=load(storage);const listeners=new Set();
    let hallLegacy=null;try{hallLegacy=storage?.getItem('emfd.house.light.v1');}catch{}
    const valid=id=>typeof id==='string'&&/^LIGHT-[A-Z0-9-]+$/.test(id);
    function get(id){
      if(!valid(id))return true;
      if(typeof state[id]==='boolean')return state[id];
      if(id.startsWith('LIGHT-H00-')&&hallLegacy==='off')return false;
      return true;
    }
    function set(id,on){
      if(!valid(id))return false;
      state={...state,[id]:Boolean(on)};
      try{storage?.setItem(KEY,JSON.stringify(state));}catch{}
      for(const fn of [...listeners]){try{fn(id,Boolean(on));}catch{}}
      root.dispatchEvent?.(new CustomEvent('emfd:light-change',{detail:{id,on:Boolean(on)}}));
      return Boolean(on);
    }
    return Object.freeze({version:1,key:KEY,get,set,toggle:id=>set(id,!get(id)),subscribe(fn){listeners.add(fn);return ()=>listeners.delete(fn);}});
  }
  let storage=null;try{storage=root.localStorage||null;}catch{}
  const api=create(storage);
  if(typeof module!=='undefined'&&module.exports)module.exports={create,KEY};
  else root.EMFDLights=api;
})(globalThis);

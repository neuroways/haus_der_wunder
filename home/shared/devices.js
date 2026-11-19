/* EMFD-PLAYER-01 · Geräteregister: die einzige Liste der Musikgeräte im Haus.
 * Seit EMFD-BOOK-01a aus den gemeinsamen Registern (shared/registry.js: music-devices.json + App-Felder in
 * data/registry-app.json). Ein neues Gerät = ein neuer Registereintrag. Kein Gerätecode pro Raum.
 * Anzeigename, technische ID und Objektbeschreibung sind getrennt (Entscheidung W4).
 * to/article/at: Präposition und Artikel für Ansagen (zur/die/an der bzw. zum/das/am).
 * tracks: Karten-IDs in der bestätigten Reihenfolge (26 Zuordnungen, O15/O16 bewusst doppelt). */
(function(root){
 'use strict';
 const registry=typeof module!=='undefined'&&typeof require==='function'?require('./registry.js'):root.EMFDRegistry;
 // Nur Geräte, die in der App eine Adresse haben; die übrigen folgen mit ihren Räumen (BOOK-01d–f).
 const DEVICES=Object.freeze((registry?.devices?.()||[]).filter(device=>device.route).sort((a,b)=>a.raumId.localeCompare(b.raumId)).map(device=>{
   const room=registry.room(device.raumId);
   return Object.freeze({id:device.id,roomId:device.raumId,manifestId:device.raumId,route:device.route,roomRoute:room?.route||'#raeume',
     name:device.anzeigename,objectName:device.name,to:device.zu,article:device.artikel,at:device.an,mode:device.modus||'playlist',
     mediaId:device.bild,image:registry.resolveMedia(device.bild).src||null,tracks:Object.freeze([...device.stuecke]),
     ...(device.beschreibung?{description:device.beschreibung}:{})});
 }));
 // Weitere Adressen derselben Station (z. B. #ort/P04/geraet für das Atelier). Die neue Adresse #geraet/<ID> leitet der Registerdienst um.
 const ALIASES=Object.freeze(Object.fromEntries((registry?.devices?.()||[]).filter(device=>device.route)
   .flatMap(device=>device.aliase.map(alias=>[alias,device.id]))));
 function get(id){return DEVICES.find(device=>device.id===id)||null;}
 function forRoom(roomId){return DEVICES.find(device=>device.roomId===roomId)||null;}
 function forRoute(value){
   if(typeof value!=='string')return null;
   const hash=value.startsWith('#')?value:'#'+value;
   return DEVICES.find(device=>device.route===hash)||get(ALIASES[hash])||null;
 }
 function isRoute(value){return Boolean(forRoute(value));}
 const api=Object.freeze({version:1,list:()=>DEVICES,get,forRoom,forRoute,isRoute,aliases:ALIASES});
 if(typeof module!=='undefined')module.exports=api;else root.EMFDDevices=api;
})(globalThis);

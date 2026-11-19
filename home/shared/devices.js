/* EMFD-PLAYER-01 · Geräteregister: die einzige Liste der Musikgeräte im Haus.
 * Ein neues Gerät = ein neuer Eintrag hier (später BOOK-01a: aus JSON geladen). Kein Gerätecode pro Raum.
 * Anzeigename, technische ID und Objektbeschreibung sind getrennt (Entscheidung W4).
 * to/article/at: Präposition und Artikel für Ansagen (zur/die/an der bzw. zum/das/am).
 * tracks: Karten-IDs in der bestätigten Reihenfolge (26 Zuordnungen, O15/O16 bewusst doppelt). */
(function(root){
 'use strict';
 const DEVICES=Object.freeze([
   {id:'MP-P01',roomId:'P01',manifestId:'P01',route:'#ort/P01/geraet',roomRoute:'#ort/P01',name:'Fensterdose',to:'zur',article:'die',at:'an der',mode:'playlist',image:'../media/raumgeraete/P01.webp',tracks:['O01','O02','O22']},
   {id:'MP-P02',roomId:'P02',manifestId:'P02',route:'#ort/P02/geraet',roomRoute:'#ort/P02',name:'Musikschatulle',to:'zur',article:'die',at:'an der',mode:'playlist',image:'../media/raumgeraete/P02.webp',tracks:['O03','O18','O16']},
   {id:'MP-P03',roomId:'P03',manifestId:'P03',route:'#ort/P03/geraet',roomRoute:'#ort/P03',name:'Klangschale',to:'zur',article:'die',at:'an der',mode:'playlist',image:'../media/raumgeraete/P03.webp',tracks:['O21','O13','O10','O05']},
   {id:'MP-P04',roomId:'P04',manifestId:'P04',route:'#atelier/geraet',roomRoute:'#atelier',name:'Atelier-Spieluhr',to:'zur',article:'die',at:'an der',mode:'playlist',image:'../media/raumgeraete/P04.webp',tracks:['O07','O11','O12']},
   {id:'MP-P05',roomId:'P05',manifestId:'P05',route:'#ort/P05/geraet',roomRoute:'#ort/P05',name:'Windspiel',to:'zum',article:'das',at:'am',mode:'playlist',image:'../media/raumgeraete/P05.webp',tracks:['O09','O14','O15']},
   {id:'MP-P06',roomId:'P06',manifestId:'P06',route:'#ort/P06/geraet',roomRoute:'#ort/P06',name:'Klangkästchen',to:'zum',article:'das',at:'am',mode:'playlist',image:'../media/raumgeraete/P06.webp',tracks:['O08','O15','O16','O19']},
   {id:'MP-P07',roomId:'P07',manifestId:'P07',route:'#ort/P07/geraet',roomRoute:'#ort/P07',name:'Windharfe',to:'zur',article:'die',at:'an der',mode:'playlist',image:'../media/raumgeraete/P07.webp',tracks:['O20','O17','O23']},
   {id:'MP-P08',roomId:'P08',manifestId:'P08',route:'#teezimmer/geraet',roomRoute:'#teezimmer',name:'Teespieluhr',to:'zur',article:'die',at:'an der',mode:'playlist',image:'../media/raumgeraete/P08.webp',tracks:['O24','O04','O06'],
    description:'Porzellan-Spieluhr mit blauem floralem Dekor und goldener Mechanik'}
 ].map(device=>Object.freeze({...device,tracks:Object.freeze([...device.tracks])})));
 // Older and alternative addresses of the same station (e.g. #ort/P04/geraet for the atelier).
 const ALIASES=Object.freeze({'#ort/P04/geraet':'MP-P04','#ort/P08/geraet':'MP-P08'});
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

/* EMFD-BOOK-01a · Registerdienst: Räume, Szenen, Musikgeräte, Objekte und Medien aus den gemeinsamen Registern.
 * Daten: data/registry.js (EMFD_REGISTRY, erzeugt mit tools/build-registry.mjs). Fehlt die Datei oder ist sie
 * ungültig, gilt der eingebaute Notfallbestand (vom selben Werkzeug erzeugt), damit die bisherigen Adressen laufen.
 * Szenen und Ansichten kennen nur Medien-IDs; resolveMedia() liefert die Datei oder einen gezeichneten Platzhalter.
 * Adressen: #raum/<RAUM>[/<ANSICHT>] und #geraet/<GERÄT>; bisherige Adressen (#flur, #ort/P05 …) bleiben gültig. */
(function(root){
 'use strict';
 /* FALLBACK:BEGIN (erzeugt, nicht von Hand ändern) */
 const FALLBACK={"version":1,"quelle":{"repository":"neuroways/haus-der-wunder","commit":"d023595","stand":"2026-11-19","notfall":true},"raeume":[{"id":"H00","name":"Halle","anzeigename":"Flur","zu":"zum","ebene":"EG","status":"DRAFT","szenen":["H00-C01","H00-C02"],"orakelobjekte":["O08"],"musikgeraet":null,"route":"#flur","aliase":["#haus"],"verzeichnis":false,"orientierung":null,"alt":null,"bild":null,"vorschau":null},{"id":"P05","name":"Innenhof","anzeigename":"Innenhof","zu":"zum","ebene":"EG","status":"DRAFT","szenen":["P05-C01","P05-C02"],"orakelobjekte":["O14","O21"],"musikgeraet":"MP-P05","route":"#ort/P05","aliase":[],"verzeichnis":true,"orientierung":"Ein geschützter Außenraum unter offenem Himmel.","alt":"Ein gepflasterter Innenhof liegt zwischen beleuchteten Hausfassaden. In der Mitte steht ein Gartentor; daneben sind eine Bank, Pflanzen und ein steinerner Brunnen zu sehen.","bild":"app.room.P05","vorschau":"app.room.P05.thumb"},{"id":"P08","name":"Teezimmer","anzeigename":"Teezimmer","zu":"zum","ebene":"EG","status":"DRAFT","szenen":["P08-C01","P08-C02"],"orakelobjekte":["O04"],"musikgeraet":"MP-P08","route":"#teezimmer","aliase":["#ort/P08"],"verzeichnis":true,"orientierung":"Ein wohnlicher Platz für eine kleine Pause oder Begegnung.","alt":"Ein warmes Teezimmer mit rundem Holztisch, Teekanne, Tassen, Kartenstapel, blauen Sesseln und einem großen Bogenfenster zum nächtlichen Schloss.","bild":"app.room.P08","vorschau":"app.room.P08.thumb"},{"id":"P03","name":"Wintergarten","anzeigename":"Wintergarten","zu":"zum","ebene":"EG","status":"PLACEHOLDER","szenen":["P03-C01","P03-C02"],"orakelobjekte":["O05","O13"],"musikgeraet":"MP-P03","route":"#ort/P03","aliase":[],"verzeichnis":true,"orientierung":"Ein heller, bepflanzter Übergang zwischen Innen und Außen.","alt":"Hohe Glasflächen und ein Glasdach umgeben zahlreiche Pflanzen. Ein heller Steinweg führt durch den Raum; links steht ein Arbeitstisch.","bild":"app.room.P03","vorschau":"app.room.P03.thumb"},{"id":"M01","name":"Musikzimmer","anzeigename":"Musikzimmer","zu":"zum","ebene":"EG","status":"PLACEHOLDER","szenen":["M01-C01","M01-C02"],"orakelobjekte":[],"musikgeraet":"MP-M01","route":"#musik","aliase":[],"verzeichnis":false,"orientierung":null,"alt":null,"bild":"app.room.M01","vorschau":"app.room.M01.thumb"},{"id":"P04","name":"Atelier","anzeigename":"Atelier","zu":"zum","ebene":"EG","status":"PLACEHOLDER","szenen":["P04-C01","P04-C02"],"orakelobjekte":["O07","O11","O16"],"musikgeraet":"MP-P04","route":"#atelier","aliase":["#ort/P04"],"verzeichnis":true,"orientierung":"Ein benutzbarer Werkraum für gestalterische Versuche.","alt":"Eine große hölzerne Werkbank füllt den Vordergrund. Dahinter stehen Schubladenschränke und Werkzeuge; eine Arbeitsleuchte wirft warmes Licht auf die Tischfläche.","bild":"app.room.P04","vorschau":"app.room.P04.thumb"},{"id":"P06","name":"Galerie","anzeigename":"Galerie","zu":"zur","ebene":"OG","status":"PLACEHOLDER","szenen":["P06-C01","P06-C02"],"orakelobjekte":[],"musikgeraet":"MP-P06","route":"#ort/P06","aliase":[],"verzeichnis":true,"orientierung":"Ein erhöhter Durchgang mit mehreren Blicken in das Haus.","alt":"Ein erhöhter Holzsteg mit Metallbrüstung führt an mehreren Bögen entlang. Durch die Brüstung sind beleuchtete Räume auf tieferen Ebenen sichtbar.","bild":"app.room.P06","vorschau":"app.room.P06.thumb"},{"id":"P07","name":"Dachterrasse","anzeigename":"Dachterrasse","zu":"zur","ebene":"OG","status":"PLACEHOLDER","szenen":["P07-C01","P07-C02"],"orakelobjekte":["O20","O23"],"musikgeraet":"MP-P07","route":"#ort/P07","aliase":[],"verzeichnis":true,"orientierung":"Ein kleiner Außenraum mit weitem Horizont.","alt":"Auf einer Dachterrasse stehen Sitzgelegenheiten, ein Tisch und Pflanzgefäße. Eine steinerne Brüstung rahmt den Blick auf eine beleuchtete Landschaft unter dem Abendhimmel.","bild":"app.room.P07","vorschau":"app.room.P07.thumb"},{"id":"P02","name":"Bibliothek","anzeigename":"Bibliothek","zu":"zur","ebene":"OG","status":"PLACEHOLDER","szenen":["P02-C01","P02-C02"],"orakelobjekte":["O03"],"musikgeraet":"MP-P02","route":"#ort/P02","aliase":[],"verzeichnis":true,"orientierung":"Ein Raum zum Lesen, Nachdenken und Entdecken.","alt":"Hohe Bücherregale umgeben ein Lesepult und einen grünen Sessel. Eine Leiter lehnt an den Regalen; mehrere Lampen beleuchten den Raum.","bild":"app.room.P02","vorschau":"app.room.P02.thumb"},{"id":"P01","name":"Fensterzimmer","anzeigename":"Fensterzimmer","zu":"zum","ebene":"OG","status":"PLACEHOLDER","szenen":["P01-C01","P01-C02"],"orakelobjekte":["O01","O02","O22"],"musikgeraet":"MP-P01","route":"#ort/P01","aliase":[],"verzeichnis":true,"orientierung":"Ein geschützter Platz zum Beobachten.","alt":"Ein gepolsterter Sessel steht neben einer tiefen Fensternische mit Vorhängen. Links sind Regale und eine Katze auf dem Teppich zu sehen; draußen liegt eine nächtliche Landschaft.","bild":"app.room.P01","vorschau":"app.room.P01.thumb"}],"szenen":[],"geraete":[{"id":"MP-P05","raumId":"P05","name":"Hofwindspiel","anzeigename":"Windspiel","beschreibung":null,"zu":"zum","artikel":"das","an":"am","route":"#ort/P05/geraet","aliase":[],"modus":"playlist","bild":"app.device.MP-P05","stuecke":["O09","O14","O15"],"status":"DRAFT"},{"id":"MP-P08","raumId":"P08","name":"Porzellanspieluhr","anzeigename":"Teespieluhr","beschreibung":"Porzellan-Spieluhr mit blauem floralem Dekor und goldener Mechanik","zu":"zur","artikel":"die","an":"an der","route":"#teezimmer/geraet","aliase":["#ort/P08/geraet"],"modus":"playlist","bild":"app.device.MP-P08","stuecke":["O24","O04","O06"],"status":"PLACEHOLDER"},{"id":"MP-P03","raumId":"P03","name":"Klangschale","anzeigename":"Klangschale","beschreibung":null,"zu":"zur","artikel":"die","an":"an der","route":"#ort/P03/geraet","aliase":[],"modus":"playlist","bild":"app.device.MP-P03","stuecke":["O21","O13","O10","O05"],"status":"PLACEHOLDER"},{"id":"MP-P04","raumId":"P04","name":"Karussell-Spieluhr","anzeigename":"Atelier-Spieluhr","beschreibung":null,"zu":"zur","artikel":"die","an":"an der","route":"#atelier/geraet","aliase":["#ort/P04/geraet"],"modus":"playlist","bild":"app.device.MP-P04","stuecke":["O07","O11","O12"],"status":"PLACEHOLDER"},{"id":"MP-P06","raumId":"P06","name":"Klangkästchen","anzeigename":"Klangkästchen","beschreibung":null,"zu":"zum","artikel":"das","an":"am","route":"#ort/P06/geraet","aliase":[],"modus":"playlist","bild":"app.device.MP-P06","stuecke":["O08","O15","O16","O19"],"status":"PLACEHOLDER"},{"id":"MP-P07","raumId":"P07","name":"Windharfe","anzeigename":"Windharfe","beschreibung":null,"zu":"zur","artikel":"die","an":"an der","route":"#ort/P07/geraet","aliase":[],"modus":"playlist","bild":"app.device.MP-P07","stuecke":["O20","O17","O23"],"status":"PLACEHOLDER"},{"id":"MP-P02","raumId":"P02","name":"Baum-Musikschatulle","anzeigename":"Musikschatulle","beschreibung":null,"zu":"zur","artikel":"die","an":"an der","route":"#ort/P02/geraet","aliase":[],"modus":"playlist","bild":"app.device.MP-P02","stuecke":["O03","O18","O16"],"status":"PLACEHOLDER"},{"id":"MP-P01","raumId":"P01","name":"Fensterdose","anzeigename":"Fensterdose","beschreibung":null,"zu":"zur","artikel":"die","an":"an der","route":"#ort/P01/geraet","aliase":[],"modus":"playlist","bild":"app.device.MP-P01","stuecke":["O01","O02","O22"],"status":"PLACEHOLDER"}],"objekte":[],"medien":{"app.room.P05":{"art":"raum-legacy","breite":1086,"hoehe":1448,"produktion":"DRAFT","datei":"../media/optimized/rooms/P05-innenhof-1086-v1-e2185806f0.webp","verfuegbarkeit":"vorhanden","integration":"original","register":"file.60cb5245f41a"},"app.room.P05.thumb":{"art":"app-bild","breite":480,"hoehe":320,"produktion":"DRAFT","datei":"../media/rooms/thumbs/P05-innenhof-thumb.webp","verfuegbarkeit":"vorhanden","integration":"original"},"app.room.P08":{"art":"raum-legacy","breite":1086,"hoehe":1448,"produktion":"DRAFT","datei":"../media/optimized/rooms/P08-teezimmer-1086-v1-f2647243bf.webp","verfuegbarkeit":"vorhanden","integration":"original","register":"file.3a53ae112f43"},"app.room.P08.thumb":{"art":"app-bild","breite":480,"hoehe":320,"produktion":"DRAFT","datei":"../media/rooms/thumbs/P08-teezimmer-thumb.webp","verfuegbarkeit":"vorhanden","integration":"original"},"app.room.P03":{"art":"raum-legacy","breite":1086,"hoehe":1448,"produktion":"DRAFT","datei":"../media/optimized/rooms/P03-wintergarten-1086-v1-2c0a049ef6.webp","verfuegbarkeit":"vorhanden","integration":"original","register":"file.f2dfac043ba1"},"app.room.P03.thumb":{"art":"app-bild","breite":480,"hoehe":320,"produktion":"DRAFT","datei":"../media/rooms/thumbs/P03-wintergarten-thumb.webp","verfuegbarkeit":"vorhanden","integration":"original"},"app.room.M01":{"art":"raum-legacy","breite":865,"hoehe":1536,"produktion":"DRAFT","datei":"../media/optimized/rooms/musikzimmer-v1-865-v1-518f76f8bb.webp","verfuegbarkeit":"vorhanden","integration":"original","register":"file.43a681e375e6"},"app.room.M01.thumb":{"art":"app-bild","breite":480,"hoehe":320,"produktion":"DRAFT","datei":"../media/rooms/thumbs/musikzimmer-v1-thumb.webp","verfuegbarkeit":"vorhanden","integration":"original"},"app.room.P04":{"art":"raum-legacy","breite":1086,"hoehe":1448,"produktion":"DRAFT","datei":"../media/optimized/rooms/P04-atelier-1086-v1-0a9f9576ef.webp","verfuegbarkeit":"vorhanden","integration":"original","register":"file.9b6f11cc77d0"},"app.room.P04.thumb":{"art":"app-bild","breite":480,"hoehe":320,"produktion":"DRAFT","datei":"../media/rooms/thumbs/P04-atelier-thumb.webp","verfuegbarkeit":"vorhanden","integration":"original"},"app.room.P06":{"art":"raum-legacy","breite":1086,"hoehe":1448,"produktion":"DRAFT","datei":"../media/optimized/rooms/P06-galerie-1086-v1-5179cca5cf.webp","verfuegbarkeit":"vorhanden","integration":"original","register":"file.b67df3b659cd"},"app.room.P06.thumb":{"art":"app-bild","breite":480,"hoehe":320,"produktion":"DRAFT","datei":"../media/rooms/thumbs/P06-galerie-thumb.webp","verfuegbarkeit":"vorhanden","integration":"original"},"app.room.P07":{"art":"raum-legacy","breite":1086,"hoehe":1448,"produktion":"DRAFT","datei":"../media/optimized/rooms/P07-dachterrasse-1086-v1-2f32fc0cfa.webp","verfuegbarkeit":"vorhanden","integration":"original","register":"file.046c17f3a041"},"app.room.P07.thumb":{"art":"app-bild","breite":480,"hoehe":320,"produktion":"DRAFT","datei":"../media/rooms/thumbs/P07-dachterrasse-thumb.webp","verfuegbarkeit":"vorhanden","integration":"original"},"app.room.P02":{"art":"raum-legacy","breite":1086,"hoehe":1448,"produktion":"DRAFT","datei":"../media/optimized/rooms/P02-bibliothek-1086-v1-c6cfb3d7be.webp","verfuegbarkeit":"vorhanden","integration":"original","register":"file.52c6dd35f829"},"app.room.P02.thumb":{"art":"app-bild","breite":480,"hoehe":320,"produktion":"DRAFT","datei":"../media/rooms/thumbs/P02-bibliothek-thumb.webp","verfuegbarkeit":"vorhanden","integration":"original"},"app.room.P01":{"art":"raum-legacy","breite":1086,"hoehe":1448,"produktion":"DRAFT","datei":"../media/optimized/rooms/P01-fensterzimmer-1086-v1-6e8da968c9.webp","verfuegbarkeit":"vorhanden","integration":"original","register":"file.4970b222a6db"},"app.room.P01.thumb":{"art":"app-bild","breite":480,"hoehe":320,"produktion":"DRAFT","datei":"../media/rooms/thumbs/P01-fensterzimmer-thumb.webp","verfuegbarkeit":"vorhanden","integration":"original"},"app.device.MP-P05":{"art":"app-bild","breite":504,"hoehe":223,"produktion":"DRAFT","datei":"../media/raumgeraete/P05.webp","verfuegbarkeit":"vorhanden","integration":"original"},"app.device.MP-P08":{"art":"app-bild","breite":504,"hoehe":248,"produktion":"DRAFT","datei":"../media/raumgeraete/P08.webp","verfuegbarkeit":"vorhanden","integration":"original"},"app.device.MP-P03":{"art":"app-bild","breite":504,"hoehe":227,"produktion":"DRAFT","datei":"../media/raumgeraete/P03.webp","verfuegbarkeit":"vorhanden","integration":"original"},"app.device.MP-P04":{"art":"app-bild","breite":504,"hoehe":223,"produktion":"DRAFT","datei":"../media/raumgeraete/P04.webp","verfuegbarkeit":"vorhanden","integration":"original"},"app.device.MP-P06":{"art":"app-bild","breite":504,"hoehe":223,"produktion":"DRAFT","datei":"../media/raumgeraete/P06.webp","verfuegbarkeit":"vorhanden","integration":"original"},"app.device.MP-P07":{"art":"app-bild","breite":504,"hoehe":248,"produktion":"DRAFT","datei":"../media/raumgeraete/P07.webp","verfuegbarkeit":"vorhanden","integration":"original"},"app.device.MP-P02":{"art":"app-bild","breite":504,"hoehe":227,"produktion":"DRAFT","datei":"../media/raumgeraete/P02.webp","verfuegbarkeit":"vorhanden","integration":"original"},"app.device.MP-P01":{"art":"app-bild","breite":504,"hoehe":227,"produktion":"DRAFT","datei":"../media/raumgeraete/P01.webp","verfuegbarkeit":"vorhanden","integration":"original"}}};
 /* FALLBACK:END */
 const list=value=>Array.isArray(value)?value:[];
 const text=value=>typeof value==='string'?value:'';
 const hashOf=value=>typeof value!=='string'?'':value.startsWith('#')?value:'#'+value;
 const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const ROOM_ID=/^[A-Z][A-Z0-9]{2}$/,SCENE_VIEW=/^[CD]\d{2}$/,DEVICE_ID=/^MP-[A-Z0-9]{3}$/,CARD_ID=/^O(?:0[1-9]|1\d|2[0-4])$/;
 function valid(data){return Boolean(data&&typeof data==='object'&&Array.isArray(data.raeume)&&Array.isArray(data.geraete)&&data.medien&&typeof data.medien==='object');}
 // Ungültige Einträge werden übersprungen statt die App anzuhalten.
 function normalize(data){
   const warnings=[];
   const rooms=list(data.raeume).filter(room=>{const ok=room&&ROOM_ID.test(room.id)&&text(room.name);if(!ok)warnings.push('Raum ungültig: '+JSON.stringify(room?.id));return ok;});
   const roomIds=new Set(rooms.map(room=>room.id));
   const scenes=list(data.szenen).filter(scene=>{const ok=scene&&roomIds.has(scene.raumId)&&SCENE_VIEW.test(scene.ansicht);if(!ok)warnings.push('Szene ungültig: '+JSON.stringify(scene?.id));return ok;});
   const devices=list(data.geraete).filter(device=>{const ok=device&&DEVICE_ID.test(device.id)&&roomIds.has(device.raumId);if(!ok)warnings.push('Gerät ungültig: '+JSON.stringify(device?.id));return ok;})
     .map(device=>({...device,stuecke:list(device.stuecke).filter(id=>CARD_ID.test(id))}));
   return {quelle:data.quelle||{},rooms,scenes,devices,objects:list(data.objekte),media:data.medien||{},warnings};
 }
 function create(data){
   const source=valid(data)?'register':valid(FALLBACK)?'notfall':'leer';
   const reg=normalize(source==='register'?data:source==='notfall'?FALLBACK:{raeume:[],geraete:[],medien:{}});
   const freeze=item=>Object.freeze({...item,aliase:Object.freeze([...list(item.aliase)]),...(item.stuecke?{stuecke:Object.freeze([...item.stuecke])}:{}),...(item.szenen?{szenen:Object.freeze([...item.szenen])}:{})});
   const rooms=Object.freeze(reg.rooms.map(freeze)),devices=Object.freeze(reg.devices.map(freeze)),scenes=Object.freeze(reg.scenes.map(scene=>Object.freeze({...scene})));
   const room=id=>rooms.find(item=>item.id===id)||null;
   const device=id=>devices.find(item=>item.id===id)||null;
   const scene=id=>scenes.find(item=>item.id===id)||null;
   const scenesOf=roomId=>scenes.filter(item=>item.raumId===roomId);
   const deviceForRoom=roomId=>devices.find(item=>item.raumId===roomId&&item.route)||null;
   const routeOwner=(items,value)=>{const hash=hashOf(value);return items.find(item=>item.route===hash||item.aliase.includes(hash))||null;};
   const roomForRoute=value=>routeOwner(rooms,value);
   const deviceForRoute=value=>routeOwner(devices,value);
   // Medien-ID → Datei oder Platzhalter (mit ID und Seitenverhältnis). Austausch = Registereintrag, kein Code.
   function resolveMedia(id){
     const entry=id&&reg.media[id]||null;
     const width=Number(entry?.breite)||1920,height=Number(entry?.hoehe)||1080;
     if(entry?.datei)return Object.freeze({type:'file',id,src:entry.datei,width,height,status:entry.produktion||null});
     return Object.freeze({type:'placeholder',id:id||'unbekannt',width,height,ratio:ratio(width,height),status:entry?.produktion||'PLACEHOLDER'});
   }
   function sceneMedia(sceneId){
     const item=scene(sceneId);if(!item)return resolveMedia(null);
     const current=item.medium&&resolveMedia(item.medium);
     if(current?.type==='file')return current;
     return item.medium?current:resolveMedia(item.platzhalter);
   }
   function placeholderMarkup(id,{label='',className='emfd-placeholder'}={}){
     const media=typeof id==='object'&&id?id:resolveMedia(id);
     const w=media.width,h=media.height,name=label||`Platzhalter ${media.id}`;
     return `<figure class="${esc(className)}" data-media-id="${esc(media.id)}" data-media-status="placeholder" role="img" aria-label="${esc(name)}" style="aspect-ratio:${w}/${h}">`+
       `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">`+
       `<rect x="0" y="0" width="${w}" height="${h}" fill="#2b2433"/><rect x="${w*0.02}" y="${h*0.02}" width="${w*0.96}" height="${h*0.96}" fill="none" stroke="#c9a96a" stroke-width="${Math.max(2,w/400)}" stroke-dasharray="${w/60} ${w/90}"/>`+
       `<text x="50%" y="46%" text-anchor="middle" fill="#f3e6c8" font-family="sans-serif" font-size="${Math.round(w/24)}">${esc(media.id)}</text>`+
       `<text x="50%" y="58%" text-anchor="middle" fill="#c9a96a" font-family="sans-serif" font-size="${Math.round(w/40)}">${w} × ${h} · ${esc(media.ratio||ratio(w,h))}</text></svg></figure>`;
   }
   function mediaMarkup(id,{alt='',className=''}={}){
     const media=resolveMedia(id);
     if(media.type==='file')return `<img${className?` class="${esc(className)}"`:''} src="${esc(media.src)}" alt="${esc(alt)}" width="${media.width}" height="${media.height}" data-media-id="${esc(media.id)}">`;
     return placeholderMarkup(media,{label:alt,className:className?`emfd-placeholder ${className}`:'emfd-placeholder'});
   }
   // Neue Adressen. target = Adresse der Ansicht, die sie heute zeigt (bis zur Szenenkomponente BOOK-01b/c).
   function resolveRoute(value){
     const hash=hashOf(value);
     let match=hash.match(/^#raum\/([A-Z][A-Z0-9]{2})(?:\/([CD]\d{2}))?$/);
     if(match){
       const item=room(match[1]);if(!item)return null;
       const views=scenesOf(item.id);
       const view=match[2]?views.find(entry=>entry.ansicht===match[2]):views[0]||null;
       if(match[2]&&!view&&(views.length||match[2]!=='C01'))return null; // Notfallbestand kennt keine Szenen: nur C01
       const canonical=`#raum/${item.id}/${view?view.ansicht:'C01'}`;
       return Object.freeze({kind:'room',roomId:item.id,sceneId:view?.id||null,canonical,target:item.route||null});
     }
     match=hash.match(/^#geraet\/(MP-[A-Z0-9]{3})$/);
     if(match){const item=device(match[1]);return item?Object.freeze({kind:'device',deviceId:item.id,roomId:item.raumId,canonical:hash,target:item.route||null}):null;}
     const owner=roomForRoute(hash);
     if(owner){const first=scenesOf(owner.id)[0];return Object.freeze({kind:'room',roomId:owner.id,sceneId:first?.id||null,canonical:`#raum/${owner.id}/${first?first.ansicht:'C01'}`,target:owner.route});}
     const gear=deviceForRoute(hash);
     if(gear)return Object.freeze({kind:'device',deviceId:gear.id,roomId:gear.raumId,canonical:`#geraet/${gear.id}`,target:gear.route});
     return null;
   }
   // Neue Adresse mit bisheriger Ansicht → diese Adresse (ersetzen ohne Verlaufseintrag). Sonst null.
   function redirect(value){
     const hash=hashOf(value);
     if(!/^#(?:raum|geraet)\//.test(hash))return null;
     const resolved=resolveRoute(hash);
     return resolved?.target||null;
   }
   const isRoute=value=>Boolean(redirect(value)||roomForRoute(value)||deviceForRoute(value));
   return Object.freeze({version:1,source,quelle:Object.freeze({...reg.quelle}),warnings:Object.freeze([...reg.warnings]),
     rooms:()=>rooms,room,directory:()=>rooms.filter(item=>item.verzeichnis).sort((a,b)=>a.id.localeCompare(b.id)),
     scenes:roomId=>roomId?scenesOf(roomId):scenes,scene,
     devices:()=>devices,device,deviceForRoom,deviceForRoute,roomForRoute,
     objects:()=>reg.objects,media:id=>reg.media[id]||null,resolveMedia,sceneMedia,placeholderMarkup,mediaMarkup,
     resolveRoute,redirect,isRoute});
 }
 function ratio(w,h){const gcd=(a,b)=>b?gcd(b,a%b):a;const g=gcd(Math.round(w),Math.round(h))||1;const a=w/g,b=h/g;
   if(a<=32&&b<=32)return `${a}:${b}`;const r=w/h;for(const [x,y] of [[16,9],[4,3],[3,4],[9,16],[3,2],[2,3],[1,1]])if(Math.abs(r-x/y)<0.02)return `${x}:${y}`;return r.toFixed(2)+':1';}
 let data=root.EMFD_REGISTRY;
 if(!data&&typeof module!=='undefined'&&typeof require==='function'){try{data=require('../data/registry.js');}catch{}}
 const api=create(data);
 if(api.warnings.length&&root.console)root.console.warn('EMFD-Register:',api.warnings.join('; '));
 const exported=Object.freeze({...api,create,FALLBACK});
 if(typeof module!=='undefined')module.exports=exported;
 root.EMFDRegistry=exported;
})(globalThis);

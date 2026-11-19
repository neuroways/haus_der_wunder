#!/usr/bin/env node
// EMFD-BOOK-01a · Erzeugt home/data/registry.js aus den gemeinsamen Registern
// (neuroways/haus-der-wunder, manifests/) und den App-Feldern in home/data/registry-app.json.
// Schreibt zusätzlich den Notfallbestand in home/shared/registry.js (zwischen den Markierungen).
//
//   node tools/build-registry.mjs [--manifests <Pfad zu manifests/>] [--check]
//
// --check: nichts schreiben, nur prüfen, ob die Dateien aktuell sind (Exit-Code 1 sonst).
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2);
const opt=name=>{const i=args.indexOf(name);return i>=0?args[i+1]:null;};
const manifests=path.resolve(opt('--manifests')||path.join(repo,'..','haus-der-wunder','manifests'));
const check=args.includes('--check');
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const fail=message=>{console.error('build-registry: '+message);process.exit(1);};

if(!fs.existsSync(path.join(manifests,'rooms.json')))fail(`Register nicht gefunden: ${manifests}`);
const rooms=read(path.join(manifests,'rooms.json'));
const scenes=read(path.join(manifests,'scenes.json'));
const devices=read(path.join(manifests,'music-devices.json'));
const objects=read(path.join(manifests,'objects.json'));
const media=read(path.join(manifests,'media.json'));
const app=read(path.join(repo,'home','data','registry-app.json'));
let commit=null;
try{commit=execFileSync('git',['-C',manifests,'rev-parse','--short','HEAD'],{encoding:'utf8'}).trim();}catch{}

const mediaById=new Map(media.medien.map(entry=>[entry.id,entry]));
const roomIds=new Set(rooms.raeume.map(room=>room.id));
const deviceIds=new Set(devices.geraete.map(device=>device.id));
const objectIds=new Set(objects.objekte.map(object=>object.id));
const errors=[];
for(const id of Object.keys(app.raeume))if(!roomIds.has(id))errors.push(`App-Raum ${id} fehlt in rooms.json`);
for(const [id,device] of Object.entries(app.geraete)){
  if(!deviceIds.has(id))errors.push(`App-Gerät ${id} fehlt in music-devices.json`);
  for(const track of device.stuecke||[])if(!objectIds.has(track))errors.push(`Stück ${track} von ${id} fehlt in objects.json`);
}
for(const [id,entry] of Object.entries(app.medien))if(entry.register&&!mediaById.has(entry.register))errors.push(`Medium ${id}: Registereintrag ${entry.register} fehlt in media.json`);
const mediaRefs=[...Object.values(app.raeume).flatMap(room=>[room.bild,room.vorschau]),...Object.values(app.geraete).map(device=>device.bild)].filter(Boolean);
for(const id of mediaRefs)if(!app.medien[id])errors.push(`Medien-ID ${id} ist in registry-app.json nicht beschrieben`);
const routes=new Map();
const claim=(route,owner)=>{if(routes.has(route))errors.push(`Adresse ${route} doppelt (${routes.get(route)} und ${owner})`);routes.set(route,owner);};
for(const [id,room] of Object.entries(app.raeume))for(const route of [room.route,...(room.aliase||[])].filter(Boolean))claim(route,id);
for(const [id,device] of Object.entries(app.geraete))for(const route of [device.route,...(device.aliase||[])].filter(Boolean))claim(route,id);
if(errors.length)fail('\n  '+errors.join('\n  '));

// Medien: nur, was die App braucht (Szenen, App-Bilder). Status nach D-13/W7 getrennt.
const out={};
function addRegisterMedium(id){
  if(!id||out[id])return;
  const entry=mediaById.get(id);if(!entry)return;
  const delivered=Object.values(app.medien).find(item=>item.register===id&&item.datei);
  out[id]={art:entry.kind,breite:entry.width,hoehe:entry.height,produktion:entry.status,
    datei:null,verfuegbarkeit:'fehlt',integration:'platzhalter'};
  if(delivered)Object.assign(out[id],{datei:delivered.datei,verfuegbarkeit:'vorhanden',integration:'original'});
}
for(const [id,entry] of Object.entries(app.medien)){
  const reg=entry.register?mediaById.get(entry.register):null;
  out[id]={art:reg?.kind||'app-bild',breite:entry.breite,hoehe:entry.hoehe,produktion:reg?.status||'DRAFT',
    datei:entry.datei||null,verfuegbarkeit:entry.datei?'vorhanden':'fehlt',integration:entry.datei?'original':'platzhalter',
    ...(entry.register?{register:entry.register}:{})};
}
const sceneList=scenes.szenen.filter(scene=>scene.ansicht!=='C00').map(scene=>{
  addRegisterMedium(scene.medium?.aktuell);addRegisterMedium(scene.medium?.platzhalter);
  return {id:scene.id,raumId:scene.raumId,ansicht:scene.ansicht,beschreibung:scene.beschreibung,
    gegenansicht:scene.gegenansicht||null,status:scene.status,format:scene.format||'16:9',
    medium:scene.medium?.aktuell||null,platzhalter:scene.medium?.platzhalter||null};
});
const roomList=rooms.raeume.map(room=>{
  const extra=app.raeume[room.id]||{};
  return {id:room.id,name:room.name,anzeigename:extra.anzeigename||room.name,zu:extra.zu||null,ebene:room.ebene,status:room.status,
    szenen:room.szenen,orakelobjekte:room.orakelobjekte||[],musikgeraet:room.musikgeraet||null,
    route:extra.route||null,aliase:extra.aliase||[],verzeichnis:Boolean(extra.verzeichnis),
    orientierung:extra.orientierung||null,alt:extra.alt||null,bild:extra.bild||null,vorschau:extra.vorschau||null};
});
const deviceList=devices.geraete.map(device=>{
  const extra=app.geraete[device.id]||{};
  return {id:device.id,raumId:device.raumId,name:device.name,anzeigename:device.anzeigename||extra.anzeigename||device.name,
    beschreibung:extra.beschreibung||null,zu:extra.zu||null,artikel:extra.artikel||null,an:extra.an||null,
    route:extra.route||null,aliase:extra.aliase||[],modus:extra.modus||null,bild:extra.bild||null,
    stuecke:extra.stuecke||[],status:device.status};
});
const objectList=objects.objekte.map(object=>({id:object.id,titel:object.titel,raumId:object.raumId||null}));
const data={version:1,quelle:{repository:'neuroways/haus-der-wunder',commit,stand:rooms.stand||null},
  raeume:roomList,szenen:sceneList,geraete:deviceList,objekte:objectList,medien:out};

// Notfallbestand: nur, was die bisherigen Ansichten brauchen (Räume mit Adresse, Geräte mit Adresse, deren Bilder).
const fbRooms=roomList.filter(room=>room.route);
const fbDevices=deviceList.filter(device=>device.route);
const fbMedia={};
for(const id of [...fbRooms.flatMap(room=>[room.bild,room.vorschau]),...fbDevices.map(device=>device.bild)].filter(Boolean))fbMedia[id]=out[id];
const fallback={version:1,quelle:{...data.quelle,notfall:true},raeume:fbRooms,szenen:[],geraete:fbDevices,objekte:[],medien:fbMedia};

const header='/* Erzeugt von tools/build-registry.mjs (EMFD-BOOK-01a) – nicht von Hand ändern.\n * Quelle: gemeinsame Register neuroways/haus-der-wunder manifests/ + home/data/registry-app.json. */\n';
const dataFile=path.join(repo,'home','data','registry.js');
const dataText=header+'(function(root){\'use strict\';\n const data='+JSON.stringify(data)+';\n if(typeof module!==\'undefined\')module.exports=data;root.EMFD_REGISTRY=data;\n})(globalThis);\n';
const serviceFile=path.join(repo,'home','shared','registry.js');
const service=fs.readFileSync(serviceFile,'utf8');
const marker=/(\/\* FALLBACK:BEGIN[^\n]*\n)[\s\S]*?(\n\s*\/\* FALLBACK:END \*\/)/;
if(!marker.test(service))fail('Markierungen FALLBACK:BEGIN/END in home/shared/registry.js fehlen');
const serviceText=service.replace(marker,(_,a,b)=>a+' const FALLBACK='+JSON.stringify(fallback)+';'+b);
const current=file=>fs.existsSync(file)?fs.readFileSync(file,'utf8'):'';
// Der Commit-Stand der Quelle allein macht eine Datei nicht veraltet.
const strip=text=>text.replace(/"commit":(null|"[^"]*")/g,'"commit":0');
if(check){
  const stale=[[dataFile,dataText],[serviceFile,serviceText]].filter(([file,text])=>strip(current(file))!==strip(text)).map(([file])=>path.relative(repo,file));
  if(stale.length)fail('veraltet: '+stale.join(', ')+' → node tools/build-registry.mjs');
  console.log('build-registry: aktuell');
}else{
  fs.writeFileSync(dataFile,dataText);fs.writeFileSync(serviceFile,serviceText);
  console.log(`build-registry: ${roomList.length} Räume, ${sceneList.length} Szenen, ${deviceList.length} Geräte, ${Object.keys(out).length} Medien (Quelle ${commit||'ohne Git'})`);
}

// EMFD-PLAYER-01 · Geräteregister, Stationsadressen, Wiedergabekontext und Gerätestation (Verhalten).
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const home=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(home,file),'utf8');
const devices=require('../shared/devices.js');
const nav=require('../shared/navigation.js');
const station=require('../device-station.js');
const {createAudioPort}=require('../shared/audio.js');
const approved=JSON.parse(read('room-music-map.json'));
const catalog=JSON.parse(read('playlist-catalog.json'));

test('P04: Register entspricht der bestätigten Zuordnung (26 Einträge, O15/O16 doppelt, Reihenfolge unverändert)',()=>{
  const list=devices.list();
  assert.equal(list.length,8);
  for(const device of list)assert.deepEqual([...device.tracks],approved.rooms[device.roomId].cardIds,device.id);
  const all=list.flatMap(device=>device.tracks);
  assert.equal(all.length,26);assert.equal(new Set(all).size,24);
  assert.deepEqual(all.filter((id,i)=>all.indexOf(id)!==i).sort(),['O15','O16']);
  assert.deepEqual(list.map(d=>d.name),['Fensterdose','Musikschatulle','Klangschale','Atelier-Spieluhr','Windspiel','Klangkästchen','Windharfe','Teespieluhr']);
  for(const device of list)assert.ok(fs.existsSync(path.resolve(home,device.image)),device.image);
  assert.equal(devices.get('MP-P08').description,'Porzellan-Spieluhr mit blauem floralem Dekor und goldener Mechanik');
});

test('P01/P02: Stationsadressen sind gültig, gehören zum Raum und führen ohne Herkunft zum Raum zurück',()=>{
  const expected={'#ort/P01/geraet':['P01','#ort/P01'],'#ort/P02/geraet':['P02','#ort/P02'],'#ort/P03/geraet':['P03','#ort/P03'],'#atelier/geraet':['P04','#atelier'],
    '#ort/P05/geraet':['P05','#ort/P05'],'#ort/P06/geraet':['P06','#ort/P06'],'#ort/P07/geraet':['P07','#ort/P07'],'#teezimmer/geraet':['P08','#teezimmer']};
  for(const [route,[room,back]] of Object.entries(expected)){
    assert.equal(nav.route(route),route);assert.equal(nav.place(route),room);assert.equal(nav.fallbackFor(route),back);
    assert.equal(nav.transition(back,route),'station',route+' is a station of its room, not a door');
  }
  assert.equal(nav.route('#ort/P09/geraet'),null);assert.equal(nav.route('#ort/P01/geraetX'),null);
  assert.deepEqual(nav.describe('#teezimmer/geraet'),['Teespieluhr','Zurück zur Teespieluhr']);
  assert.deepEqual(nav.describe('#ort/P05/geraet'),['Windspiel','Zurück zum Windspiel']);
  const app=nav.createNavigation({getHash:()=> '#ort/P03/geraet',setHash(){}});
  assert.equal(app.backLink().target,'#ort/P03','direct link and reload fall back to the room');
});

test('P03: Raum → Gerät → Rückweg folgt NAV-01',()=>{
  let hash='#flur';const n=nav.createNavigation({getHash:()=>hash,setHash:value=>{hash=value;}});
  const go=to=>{n.go(to);n.observe(hash);};
  go('#ort/P02');go('#ort/P02/geraet');
  assert.equal(n.backLink().target,'#ort/P02');
  go('#karte/O03');assert.equal(n.backLink().target,'#ort/P02/geraet');
});

test('P19: Ein Gerät gilt nur als aktiv, wenn seine eigene Wiedergabe läuft (Wiedergabekontext)',()=>{
  const p01=devices.get('MP-P01'),p02=devices.get('MP-P02');
  const playing={state:'playing',entryId:'O01',repeat:'once',context:{source:'device',deviceId:'MP-P01',roomId:'P01'}};
  assert.equal(station.view(playing,p01).active,true);assert.equal(station.view(playing,p01).text,'Spielt');
  assert.equal(station.view(playing,p02).active,false,'other device stays still');
  assert.match(station.view(playing,p02).text,/^Still/);
  assert.equal(station.view(playing,devices.get('MP-P05')).text,'Still – wähle ein Stück oder starte das Windspiel.');
  assert.equal(station.view(playing,p02).text,'Still – wähle ein Stück oder starte die Musikschatulle.');
  const card={state:'playing',entryId:'O03',context:null};
  assert.equal(station.view(card,p02).active,false,'card music is not shown as device activity');
  assert.equal(station.view({...playing,state:'paused'},p01).text,'Pausiert');
  assert.equal(station.view({...playing,state:'preparing'},p01).text,'Lädt …');
  assert.equal(station.view({...playing,state:'error',message:'Die Musik konnte nicht geladen werden.'},p01).text,'Die Musik konnte nicht geladen werden.');
});

test('P04/P16: Stückliste je Gerät aus dem Katalog in Registerreihenfolge',()=>{
  const items=catalog.items.map(item=>({...item}));
  for(const device of devices.list()){
    const entries=station.entriesFor(device,items);
    assert.deepEqual([...new Set(entries.map(e=>e.cardId))],[...device.tracks],device.id);
  }
});

test('P16: Eigenes Cover hat Vorrang vor der Kartenvorderseite; sonst Vorderseite; sonst sauberer Fallback',()=>{
  const saved=globalThis.EMFDImages;
  try{
    globalThis.EMFDImages={cover:id=>id==='O04'?'../media/covers/O04.webp':'',card:id=>`../media/cards/${id}.png`};
    assert.deepEqual(station.coverFor({cardId:'O04',title:'x'}),{src:'../media/covers/O04.webp',kind:'cover'});
    assert.deepEqual(station.coverFor({cardId:'O05',title:'x'}),{src:'../media/cards/O05.png',kind:'card'});
    globalThis.EMFDImages={cover:()=>'',card:()=>''};
    assert.equal(station.coverFor({cardId:'O05',title:'x'}),null);
  }finally{globalThis.EMFDImages=saved;}
});

test('Wiedergabekontext: Port gibt den Kontext weiter und meldet ihn im Zustand',()=>{
  const port=createAudioPort();let received=null;
  const owner={session:{state:'playing',track:{assetId:'O01',cardId:'O01',title:'t'}},roomTrackId:'O01',ready:true,roomQueue:['O01'],
    playContext:{source:'device',deviceId:'MP-P01',roomId:'P01'},startRoomPlaylist:(ids,options)=>{received={ids,options};return true;}};
  port.attach(owner);
  assert.deepEqual(port.snapshot().context,{source:'device',deviceId:'MP-P01',roomId:'P01'});
  port.playlist(['O01','O02'],{explicit:true,startId:'O02',context:{source:'device',deviceId:'MP-P01'}});
  assert.deepEqual(received,{ids:['O01','O02'],options:{explicit:true,startId:'O02',context:{source:'device',deviceId:'MP-P01'}}});
});

test('W1/PLA-D01/D14: Öffnen startet nichts; Navigation pausiert nichts; nur bewusster Start bindet',()=>{
  const ui=read('device-station.js'),player=read('music-player.js'),room=read('room-music.js');
  const renderBody=ui.slice(ui.indexOf('function render('),ui.indexOf('function bindCoverFallback'));
  assert.doesNotMatch(renderBody,/playlist\(|command\(|\.play\(|start\(/,'rendering the station never starts audio');
  assert.match(ui,/root\.EMFDAudio\.playlist\(ids,\{explicit:true,startId,context:\{source:'device',deviceId:device\.id,roomId:device\.roomId\}\}\)/);
  assert.match(player,/pendingContext=context\?Object\.freeze\(\{\.\.\.context,queueKey:roomQueue\.join\(','\)\}\):null/);
  assert.match(player,/else if\(!\(roomSelecting&&playContext&&roomQueue\.length&&playContext\.queueKey===roomQueue\.join\(','\)\)\)playContext=null;/);
  assert.doesNotMatch(player,/addEventListener\('emfd:navigation'/,'no pause on room change (W1)');
  assert.match(room,/href="\$\{esc\(device\.route\)\}" data-room-device-link/);
  assert.match(room,/\$\{esc\(device\.name\)\} ansehen/);
});

test('PLA-D04/P12: Geschichte öffnet den Buchleser als Dialog, ohne Ortswechsel',()=>{
  const ui=read('device-station.js');
  assert.match(ui,/root\.EMFDReaders\?\.openComposition\?\.\(story\.dataset\.deviceStory,story\)/);
  assert.doesNotMatch(ui,/#musik\/geschichten|location\.hash|EMFDNavigation\.go/);
});

test('PLA-D13/P17: Steuerung mit Gerätenamen beschriftet, Zustand als Text',()=>{
  const ui=read('device-station.js');
  assert.match(ui,/aria-label="\$\{esc\(device\.name\)\} – Wiedergabe steuern"/);
  assert.doesNotMatch(ui,/Schallplattenspieler/);
  assert.match(ui,/data-device-state role="status" aria-live="polite"/);
});

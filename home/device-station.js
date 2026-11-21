/* EMFD-PLAYER-01 · Gemeinsame Gerätestation für alle Musikgeräte (Station "device").
 * Öffnen startet nie Musik. Erst „Abspielen“ bindet die Wiedergabe an dieses Gerät (Wiedergabekontext).
 * Die Steuerung nutzt den einen zentralen Player (EMFDAudio/EMFDMusic); keine zweite Audioinstanz. */
(function(root){
 'use strict';
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const icon=name=>`<img class="music04-icon" src="assets/music-icons/${name}.svg" alt="" aria-hidden="true" width="26" height="26">`;
 const entryId=item=>root.EMFDMusicDiscovery?.id(item)||item.entryId||item.cardId||'theme';
 const STATE_TEXT={silent:'Still',stopped:'Gestoppt',preparing:'Lädt …',ready:'Bereit',starting:'Lädt …',playing:'Spielt',paused:'Pausiert',ended:'Beendet',error:'Nicht verfügbar',unavailable:'Nicht verfügbar'};
 const REPEAT_LABEL={once:'Einmal abspielen',playlist:'Alle Stücke wiederholen',track:'Dieses Stück wiederholen'};
 const REPEAT_NEXT={once:'playlist',playlist:'track',track:'once'};
 const active=new Map();

 // Pure helpers (exported for tests).
 function entriesFor(device,items){return device.tracks.flatMap(cardId=>items.filter(item=>item.cardId===cardId));}
 function isActive(snapshot,device){return Boolean(snapshot?.context&&snapshot.context.source==='device'&&snapshot.context.deviceId===device.id);}
 function view(snapshot,device){
   if(!isActive(snapshot,device))return {active:false,state:'silent',text:`Still – wähle ein Stück oder starte ${device.article} ${device.name}.`};
   const state=snapshot.state||'silent';
   const text=state==='error'||state==='unavailable'?(snapshot.message||'Dieses Stück ist gerade nicht verfügbar.'):STATE_TEXT[state]||snapshot.message||'';
   return {active:true,state,text,entryId:snapshot.entryId,repeat:snapshot.repeat||'once'};
 }
 function coverFor(item){
   const explicit=item.cardId&&root.EMFDImages?.cover?.(item.cardId);
   if(explicit)return {src:explicit,kind:'cover'};
   // EMFD-CARD-MUSIC-01: registriertes Originalcover (cover.<ID>), wenn der Katalog keines liefert – gleiches Cover wie im Mäppchen.
   const registered=item.cardId&&root.EMFDRegistry?.resolveMedia?.(`cover.${item.cardId}`);
   if(registered?.type==='file')return {src:registered.src,kind:'cover'};
   const front=item.cardId&&root.EMFDImages?.card?.(item.cardId,'card-view');
   if(front)return {src:front,kind:'card'};
   const fallback=item.music?.coverPath||item.media?.imagePath||'';
   return fallback?{src:fallback,kind:'other'}:null;
 }
 function coverMarkup(item,className){
   const cover=coverFor(item);
   const placeholder=`<span class="${className} device-cover-placeholder" role="img" aria-label="Kein Bild verfügbar: ${esc(item.title)}">${esc(item.title)}</span>`;
   if(!cover)return placeholder;
   return `<img class="${className} device-cover--${cover.kind}" src="${esc(cover.src)}" alt="Cover: ${esc(item.title)}" decoding="async" data-device-cover-fallback="${esc(item.title)}">`;
 }

 function render(host,{deviceId}={}){
   const device=root.EMFDDevices?.get(deviceId);
   if(!device){host.innerHTML='<section class="device-station"><p role="alert">Dieses Gerät gibt es im Haus nicht.</p></section>';return null;}
   const back=root.EMFDNavigation?.backLinkMarkup?.(device.roomRoute)||`<a class="back" href="${esc(device.roomRoute)}">Zurück</a>`;
   host.innerHTML=`<section class="device-station" data-device-station="${esc(device.id)}" aria-labelledby="device-title">
     <div class="device-station-topbar">${back}<button type="button" class="device-volume" data-device-volume aria-haspopup="dialog">Lautstärke</button></div>
     <div class="device-station-body">
       <figure class="device-station-object"><img class="device-station-image" src="${esc(device.image)}" alt="${esc(device.description||device.name)}" decoding="async"><figcaption class="sr-only">${esc(device.name)}</figcaption></figure>
       <div class="device-station-panel">
         <span class="eyebrow">Musikgerät</span><h1 id="device-title">${esc(device.name)}</h1>
         <div class="device-now" data-device-now><p role="status">Die Musik dieses Geräts wird vorbereitet …</p></div>
         <div class="device-transport" role="group" aria-label="${esc(device.name)} – Wiedergabe steuern">
           <button type="button" data-device-cmd="previous" aria-label="Vorheriges Stück ${esc(device.at)} ${esc(device.name)}" title="Vorheriges Stück">${icon('skip-back')}</button>
           <button type="button" class="device-main" data-device-cmd="toggle" aria-label="${esc(device.name)} abspielen" title="Abspielen">${icon('play')}</button>
           <button type="button" data-device-cmd="stop" aria-label="${esc(device.name)} stoppen" title="Stopp">${icon('square')}</button>
           <button type="button" data-device-cmd="next" aria-label="Nächstes Stück ${esc(device.at)} ${esc(device.name)}" title="Nächstes Stück">${icon('skip-forward')}</button>
           <button type="button" data-device-cmd="repeat" aria-label="${REPEAT_LABEL.once}" title="${REPEAT_LABEL.once}">${icon('repeat')}</button>
         </div>
         <p class="device-state" data-device-state role="status" aria-live="polite"></p>
         <h2 class="device-list-title">Stücke ${esc(device.at)} ${esc(device.name)}</h2>
         <ol class="device-tracks" data-device-tracks></ol>
       </div>
     </div></section>`;
   host.querySelector('[data-device-volume]')?.addEventListener('click',()=>document.querySelector('#music-open')?.click());
   host.querySelectorAll('[data-device-cover-fallback]').forEach(bindCoverFallback);
   const record={device,items:[],unsubscribe:null,disposed:false};active.set(host,record);
   const now=host.querySelector('[data-device-now]');
   const content=root.EMFDContent?.music?.();
   if(!content){now.innerHTML='<p role="status">Die Musik ist gerade nicht verfügbar.</p>';return null;}
   return content.then(catalog=>{
     if(record.disposed||!host.isConnected)return null;
     record.items=entriesFor(device,catalog.items);
     root.EMFDMusic?.registerRoomEntries?.(catalog.items);
     renderTracks(host,record);bindTransport(host,record);
     const update=snapshot=>{if(!record.disposed&&host.isConnected)sync(host,record,snapshot);};
     record.unsubscribe=root.EMFDAudio?.subscribe(update)||null;
     if(!root.EMFDMusic?.ready)root.addEventListener('emfd:music-availability',()=>update(root.EMFDAudio?.snapshot()),{once:true});
     return record;
   }).catch(()=>{if(host.isConnected)now.innerHTML='<p role="status">Die Musik ist gerade nicht verfügbar. Das Haus bleibt still.</p>';});
 }
 function bindCoverFallback(img){
   img.addEventListener('error',()=>{const span=document.createElement('span');span.className=img.className+' device-cover-placeholder';span.setAttribute('role','img');span.setAttribute('aria-label','Kein Bild verfügbar: '+img.dataset.deviceCoverFallback);span.textContent=img.dataset.deviceCoverFallback;img.replaceWith(span);},{once:true});
 }
 function renderTracks(host,record){
   const list=host.querySelector('[data-device-tracks]'),{device}=record;
   list.innerHTML=record.items.map(item=>{
     const id=entryId(item),hasStory=Boolean(item.cardId);
     return `<li class="device-track" data-device-track="${esc(id)}">${coverMarkup(item,'device-track-cover')}
       <div class="device-track-copy"><strong>${esc(item.title)}</strong><span>${esc(item.versionLabel||item.category||'Main Theme')}</span></div>
       <div class="device-track-actions"><button type="button" data-device-play="${esc(id)}" aria-label="${esc(item.title)} ${esc(device.at)} ${esc(device.name)} abspielen">Abspielen</button>${hasStory?`<button type="button" data-device-story="${esc(item.cardId)}" aria-label="Geschichte zu ${esc(item.title)} lesen">Geschichte lesen</button>`:''}</div></li>`;
   }).join('');
   list.querySelectorAll('[data-device-cover-fallback]').forEach(bindCoverFallback);
   list.addEventListener('click',event=>{
     const play=event.target.closest?.('[data-device-play]');if(play){start(device.id,{startId:play.dataset.devicePlay});return;}
     const story=event.target.closest?.('[data-device-story]');if(story)root.EMFDReaders?.openComposition?.(story.dataset.deviceStory,story);
   });
 }
 function bindTransport(host,record){
   host.querySelector('.device-transport').addEventListener('click',event=>{
     const button=event.target.closest?.('[data-device-cmd]');if(!button||button.disabled)return;
     const snapshot=root.EMFDAudio?.snapshot(),state=view(snapshot,record.device),audio=root.EMFDAudio,cmd=button.dataset.deviceCmd;
     if(cmd==='toggle'){
       if(!state.active){start(record.device.id);return;}
       audio?.command(state.state==='playing'||state.state==='starting'?'pause':'play');return;
     }
     if(!state.active)return;
     if(cmd==='repeat'){audio?.command('repeat',REPEAT_NEXT[state.repeat]||'once');return;}
     audio?.command(cmd);
   });
 }
 function sync(host,record,snapshot){
   const {device,items}=record,state=view(snapshot,device);
   const current=items.find(item=>entryId(item)===state.entryId)||items[0];
   const now=host.querySelector('[data-device-now]');
   if(current&&now.dataset.entry!==entryId(current)){
     now.dataset.entry=entryId(current);
     now.innerHTML=`${coverMarkup(current,'device-now-cover')}<div class="device-now-copy"><span class="device-now-label">${state.active?'Jetzt':'Erstes Stück'}</span><strong data-device-title>${esc(current.title)}</strong><span>${esc(current.versionLabel||current.category||'Main Theme')}</span>${current.cardId?`<button type="button" class="device-now-story" data-device-story-now="${esc(current.cardId)}">Geschichte lesen</button>`:''}</div>`;
     now.querySelectorAll('[data-device-cover-fallback]').forEach(bindCoverFallback);
     now.querySelector('[data-device-story-now]')?.addEventListener('click',event=>root.EMFDReaders?.openComposition?.(event.currentTarget.dataset.deviceStoryNow,event.currentTarget));
   }
   const label=now.querySelector('.device-now-label');if(label)label.textContent=state.active?'Jetzt':'Erstes Stück';
   host.querySelector('[data-device-state]').textContent=state.text;
   host.dataset.deviceViewState=state.state;host.dataset.deviceActive=String(state.active);
   const main=host.querySelector('[data-device-cmd="toggle"]'),playing=state.active&&(state.state==='playing'||state.state==='starting');
   main.setAttribute('aria-label',playing?`${device.name} pausieren`:state.active&&state.state==='paused'?`${device.name} fortsetzen`:`${device.name} abspielen`);
   main.title=playing?'Pause':'Abspielen';main.innerHTML=icon(playing?'pause':'play');
   main.disabled=!root.EMFDMusic?.ready||!items.length;
   for(const cmd of ['previous','stop','next','repeat'])host.querySelector(`[data-device-cmd="${cmd}"]`).disabled=!state.active;
   const repeat=host.querySelector('[data-device-cmd="repeat"]'),mode=state.active?state.repeat:'once';
   repeat.setAttribute('aria-label',REPEAT_LABEL[mode]||REPEAT_LABEL.once);repeat.title=REPEAT_LABEL[mode]||REPEAT_LABEL.once;repeat.setAttribute('aria-pressed',String(state.active&&mode!=='once'));
   repeat.innerHTML=icon(mode==='track'?'repeat-1':'repeat');
   host.querySelectorAll('[data-device-play]').forEach(button=>{
     button.disabled=!root.EMFDMusic?.ready;
     const isCurrent=state.active&&button.dataset.devicePlay===state.entryId;
     button.closest('.device-track')?.classList.toggle('is-current',isCurrent);
     if(isCurrent)button.closest('.device-track')?.setAttribute('aria-current','true');else button.closest('.device-track')?.removeAttribute('aria-current');
   });
 }
 // Deliberate start of a device playlist (from the station or from the room's song list).
 async function start(deviceId,{startId=null}={}){
   const device=root.EMFDDevices?.get(deviceId);if(!device||!root.EMFDAudio)return false;
   const catalog=await root.EMFDContent.music();
   root.EMFDMusic?.registerRoomEntries?.(catalog.items);
   const ids=entriesFor(device,catalog.items).map(entryId);
   return root.EMFDAudio.playlist(ids,{explicit:true,startId,context:{source:'device',deviceId:device.id,roomId:device.roomId}});
 }
 function leave(host){const record=active.get(host);if(!record)return;record.disposed=true;record.unsubscribe?.();active.delete(host);}
 const api=Object.freeze({version:1,render,leave,start,entriesFor,isActive,view,coverFor});
 if(typeof module!=='undefined')module.exports=api;
 else{root.EMFDDeviceStation=api;root.EMFDStations?.register('device',{render,leave});}
})(globalThis);

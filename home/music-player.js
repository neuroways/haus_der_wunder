(function(){
 const dialog=document.querySelector('#music-dialog'),opener=document.querySelector('#music-open'),family=document.querySelector('#music-family'),variant=document.querySelector('#music-variant'),status=document.querySelector('#music-status'),title=document.querySelector('#music-title-current'),start=document.querySelector('#music-play'),pause=document.querySelector('#music-pause'),stop=document.querySelector('#music-stop'),volume=document.querySelector('#music-volume');
 const modeInputs=()=>[...document.querySelectorAll('input[name="music-mode"]')];let tracks=[],cardMap={},currentCard=(location.hash.match(/^#karte\/(O\d{2})$/)||[])[1]||null,enabled=false,quiet=false;
 const modeKey='emfd.music.mode';
 const entryKey='emfd.music.startOnEntry';const volumeKey='emfd.music.volume';const silenceKey='emfd.music.globalSilence';
 const stored=(key,fallback)=>{try{return localStorage.getItem(key)??fallback;}catch{return fallback;}};
 const store=(key,value)=>{try{localStorage.setItem(key,String(value));}catch{}};
 let startOnEntry=stored(entryKey,'false')==='true';let globalSilence=stored(silenceKey,'false')==='true';let pendingBackgroundStart=false;let pendingCardSelection=null;let pendingRevealCard=null;let userPaused=false;
 let roomHost=null,roomSelectionId='theme',roomTracksReady=false;
 const roomAvailability=new Map();
 let roomExplicitQueue=false;
 let roomEntries=[],roomQueue=[],roomQueueFinished=false,roomMode='track',recordPlaced=false;
 let playContext=null,pendingContext=null,roomSelecting=false;
 function registerRoomEntries(entries){roomEntries=entries;for(const entry of entries){if(entry.variantId&&!entry.audioAssetId)roomAvailability.set(entry.entryId,'missing');}if(tracks.length&&entries.some(entry=>entry.audioAssetId&&tracks.some(track=>track.assetId===entry.audioAssetId)&&!roomAvailability.has(entry.audioAssetId)))refreshRoomAvailability();updateRoom();}
 const missingRecordMessage='Leider ist die Platte verloren gegangen, sie wird gerade im Haus gesucht.';
 function roomTrack(id){const entry=roomEntries.find(item=>item.entryId===id);if(entry?.variantId)return tracks.find(track=>track.assetId===entry.audioAssetId)||null;return id==='theme'?tracks.find(t=>t.assetId==='T03'&&t.kind==='app-theme'):tracks.find(t=>t.cardId===id);}
 function availabilityFor(id){const entry=roomEntries.find(item=>item.entryId===id);if(entry?.variantId&&!entry.audioAssetId)return 'missing';const track=roomTrack(id);if(entry?.variantId&&roomTracksReady&&!track)return 'missing';return roomAvailability.get(track?.assetId||id)||(roomTracksReady?'unknown':'checking');}
 async function refreshRoomAvailability(){
   const referenced=new Set(roomEntries.map(entry=>entry.audioAssetId).filter(Boolean));
   const primary=tracks.filter(track=>track.cardId||(track.assetId==='T03'&&track.kind==='app-theme')||referenced.has(track.assetId));
   if(!primary.length)return;
   await Promise.all(primary.map(async track=>{
     const id=track.assetId;
     try{const response=await fetch(track.path,{method:'HEAD',cache:'no-store'});roomAvailability.set(id,response.status===404||response.status===410?'missing':response.ok?'available':'unknown');}
     catch{roomAvailability.set(id,'unknown');}
   }));
   roomTracksReady=true;
   window.EMFDAudio?.publish();
   if(location.hash.startsWith('#musik')&&session.state==='unavailable'&&availabilityFor(roomId())==='available')selectRoomTrack(roomId());else updateRoom();
   window.dispatchEvent?.(new CustomEvent('emfd:music-availability'));
 }
 function roomId(){return session.track?.roomEntryId||session.track?.cardId||(session.track?.kind==='app-theme'?'theme':roomSelectionId);}
 function updateRoom(){
   if(!roomHost?.isConnected)return;
   window.EMFDMusicDevice?.sync?.(roomHost,window.EMFDAudio?.snapshot()||session,roomId(),roomTracksReady,recordPlaced);
   const button=roomHost.querySelector('[data-room-music-start]'),label=roomHost.querySelector('.music-room-status'),checkbox=roomHost.querySelector('[data-room-music-autostart]');
   if(!button||!label)return;
   if(checkbox)checkbox.checked=startOnEntry;
   const state=session.state;
   const repeat=roomHost.querySelector('[data-room-repeat]');
   if(repeat){const repeatLabel=roomMode==='track'?'Einzelnes Lied wiederholen':roomMode==='playlist'?'Playlist wiederholen':'Einmalig abspielen';repeat.setAttribute('aria-label',repeatLabel);repeat.setAttribute('aria-pressed',String(roomMode!=='once'));repeat.title=repeatLabel;repeat.dataset.mode=roomMode;const img=repeat.querySelector('img');if(img)img.src='assets/music-icons/'+(roomMode==='track'?'repeat-1':'repeat')+'.svg';}

   const actionLabel=state==='playing'?'Pause':state==='paused'?'Fortsetzen':state==='starting'?'Lädt …':'Start';
   const actionIcon=button.querySelector('[data-transport-icon]');
   if(actionIcon){actionIcon.src='assets/music-icons/'+(state==='playing'?'pause':'play')+'.svg';button.setAttribute('aria-label',actionLabel);button.title=actionLabel;}else button.textContent=actionLabel;
   button.disabled=quiet||!roomTracksReady||state==='starting'||availabilityFor(roomId())==='missing';
   if(quiet)label.textContent='Ruhemodus ist eingeschaltet.';
   else if(globalSilence)label.textContent='Stille ist gewählt.';
   else if(availabilityFor(roomId())==='missing')label.textContent=missingRecordMessage;
   else if(session.volume===0)label.textContent='Lautstärke 0 % – Ton ist ausgeschaltet.';
   else if(state==='playing')label.textContent=roomQueue.length?'Playlist · '+(roomQueue.indexOf(roomId())+1)+' von '+roomQueue.length:'Musik läuft';
   else if(state==='paused')label.textContent='Musik pausiert';
   else if(state==='error')label.textContent='Musik konnte nicht geladen werden. Bitte erneut versuchen.';
   else if(state==='ended')label.textContent=roomQueueFinished?'Playlist beendet.':'Musikstück beendet.';
   else if(state==='stopped')label.textContent='Gestoppt – Start spielt das Stück von vorn.';
   else label.textContent=roomTracksReady?'Bereit zum Abspielen.':'Musikauswahl wird vorbereitet …';
 }
 function setRoomMode(value){
   if(!['track','once','playlist'].includes(value)||value==='playlist'&&!roomQueue.length)return false;
   roomMode=value;
   if(session.track)session.track={...session.track,loop:value==='track'};
   if(session.audio)session.audio.loop=value==='track';
   window.EMFDAudio?.publish();updateRoom();return true;
 }
 function cycleRoomMode(){const modes=roomQueue.length?['once','playlist','track']:['track','once'];setRoomMode(modes[(modes.indexOf(roomMode)+1)%modes.length]);}
 function selectRoomTrack(id,options={}){roomSelecting=true;try{return selectRoomTrackNow(id,options);}finally{roomSelecting=false;}}
 function selectRoomTrackNow(id,{play=false,explicit=false,keepQueue=false}={}){
   if(!roomTracksReady)return false;
   const entry=roomEntries.find(item=>item.entryId===id),track=roomTrack(id);
   if(!track&&!entry?.variantId)return false;
   if(!keepQueue){roomExplicitQueue=false;roomQueue=[];roomQueueFinished=false;if(roomMode==='playlist')roomMode='track';}
   if(id!==roomId())recordPlaced=false;
   roomSelectionId=id;mode=setModeValue('individual');
   if(entry?.variantId&&!track){recordPlaced=false;session.select(null);session.state='unavailable';session.message=missingRecordMessage;enabled=false;session.emit();updateDock();return true;}
   family.value=track.family;variant.value=track.variant;variant.disabled=true;
   if(availabilityFor(id)==='missing'){
     recordPlaced=false;session.stop();session.track={...track,roomEntryId:id,loop:false};session.state='unavailable';session.message=missingRecordMessage;enabled=false;session.emit();updateDock();return true;
   }
   if(session.track?.assetId!==track.assetId||!session.track||session.state==='unavailable')session.select({...track,roomEntryId:id,loop:roomMode==='track'});
   session.track={...session.track,roomEntryId:id,loop:roomMode==='track'};if(session.audio)session.audio.loop=roomMode==='track';
   if(play){if(quiet)return true;if((globalSilence||entryMusicOff())&&!explicit&&!roomExplicitQueue){updateRoom();return true;}if(explicit){globalSilence=false;store(silenceKey,false);}userPaused=false;enabled=true;recordPlaced=true;session.play();}
   updateDock();updateRoom();return true;
 }
 function startRoomPlaylist(ids,{explicit=false,startId=null,context=null}={}){
   if(!roomTracksReady||!ids.length)return false;
   roomExplicitQueue=explicit;
   roomQueue=[...new Set(ids)].filter(id=>availabilityFor(id)!=='missing'&&roomTrack(id));roomQueueFinished=false;roomMode='once';
   // EMFD-PLAYER-01: a deliberate start binds the playback to its source (e.g. a room device).
   pendingContext=context?Object.freeze({...context,queueKey:roomQueue.join(',')}):null;
   const result=!roomQueue.length?(selectRoomTrack(ids[0],{keepQueue:true}),true):selectRoomTrack(roomQueue.includes(startId)?startId:roomQueue[0],{play:true,explicit,keepQueue:true});
   if(pendingContext){playContext=pendingContext;pendingContext=null;window.EMFDAudio?.publish();}
   return result;
 }
 function advanceRoomQueue(){
   if(roomMode==='track'||!roomQueue.length||!enabled||userPaused||globalSilence||quiet)return;
   const index=roomQueue.indexOf(roomId());if(index<0)return;
   let next=index+1;
   if(next>=roomQueue.length){if(roomMode==='playlist')next=0;else{roomQueueFinished=true;enabled=false;userPaused=true;window.EMFDAudio?.publish();updateRoom();return;}}
   selectRoomTrack(roomQueue[next],{play:true,keepQueue:true});
 }
 function stepRoomTrack(delta){
   const order=roomQueue.length?roomQueue:roomEntries.length?roomEntries.map(item=>item.entryId||item.cardId||'theme'):['theme',...tracks.filter(t=>t.cardId).map(t=>t.cardId).sort()];
   const index=Math.max(0,order.indexOf(roomId())),next=order[(index+delta+order.length)%order.length];roomQueueFinished=false;
   return selectRoomTrack(next,{play:['playing','starting'].includes(session.state)&&!globalSilence,keepQueue:true});
 }
 async function startRoomMusic(explicit=false){
   if(quiet||(!explicit&&globalSilence)){updateRoom();return;}
   const id=roomQueueFinished&&roomQueue.length?roomQueue[0]:roomId();roomQueueFinished=false;
   return selectRoomTrack(id,{play:true,explicit,keepQueue:true});
 }
 function unbindRoom(host){if(roomHost===host)roomHost=null;}
 function bindRoom(host){
   roomHost=host;
   if(session.state==='playing')recordPlaced=true;
   if(session.track){session.track={...session.track,loop:roomMode==='track'};if(session.audio)session.audio.loop=roomMode==='track';}
   const button=host.querySelector('[data-room-music-start]');if(!button)return;
   button.addEventListener('click',()=>{if(session.state==='playing'){userPaused=true;session.pause();}else startRoomMusic(true);});
   host.querySelector('[data-room-stop]')?.addEventListener('click',()=>{userPaused=true;enabled=false;session.stop();updateDock();});
   host.querySelectorAll('[data-room-step]').forEach(button=>button.addEventListener('click',()=>stepRoomTrack(Number(button.dataset.roomStep))));
   host.querySelector('[data-room-repeat]')?.addEventListener('click',cycleRoomMode);
   updateRoom();
 }
 function syncThemeButtons(){document.querySelectorAll('[data-theme-toggle]').forEach(button=>{const playing=session.track?.kind==='app-theme'&&['playing','starting'].includes(session.state);button.setAttribute('aria-pressed',String(playing));button.setAttribute('aria-label',playing?'Hintergrundmusik stoppen':'Hintergrundmusik starten');button.title=playing?'Hintergrundmusik stoppen':'Hintergrundmusik starten';});}
 function toggleTheme(){if(session.track?.kind==='app-theme'&&['playing','starting'].includes(session.state)){userPaused=true;enabled=false;session.stop();updateDock();return;}return setBackgroundPreference('on',{start:true,explicit:true});}
 document.addEventListener('click',event=>{if(event.target.closest?.('[data-theme-toggle]'))toggleTheme();});
 const getMode=()=>{try{return localStorage.getItem(modeKey)==='individual'?'individual':'matching';}catch{return 'matching';}};const setModeValue=v=>{const mode=v==='individual'?'individual':'matching';try{localStorage.setItem(modeKey,mode);}catch{}modeInputs().forEach(i=>i.checked=i.value===mode);return mode;};let mode=setModeValue(getMode());
 const volumeOn=()=>'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M16 8.5a5 5 0 0 1 0 7M19 5.5a9 9 0 0 1 0 13"/></svg>';const volumeOff=()=>'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="m16 9 5 6m0-6-5 6"/></svg>';
 const feedback=document.createElement('p');feedback.id='music-feedback';feedback.className='music-feedback';feedback.setAttribute('role','status');feedback.hidden=true;document.body.append(feedback);const feedbackOpen=document.createElement('button');feedbackOpen.type='button';feedbackOpen.textContent='Musikplayer öffnen';feedbackOpen.onclick=()=>opener.click();const feedbackClose=document.createElement('button');feedbackClose.type='button';feedbackClose.textContent='Hinweis schließen';let feedbackDismissed='';const feedbackKey=x=>`${x?.track?.assetId||''}|${x?.state||''}|${x?.message||''}`;feedbackClose.onclick=()=>{feedback.hidden=true;feedbackDismissed=feedbackKey(session);};
 const session=new EMFDAudioSession(()=>new Audio(),s=>{if(['stopped','silent','unavailable'].includes(s.state))recordPlaced=false;if(s.state==='playing')recordPlaced=true;title.textContent=s.track?s.track.kind==='app-theme'?s.track.title:s.track.cardId?`${s.track.cardId} · ${s.track.title} · ${s.track.group}`:`${s.track.familyTitle} · Variante ${s.track.variant}`:'Stille';status.textContent=s.message;syncThemeButtons();window.EMFDAudio?.publish();window.dispatchEvent?.(new CustomEvent('emfd:music-state'));start.disabled=quiet||!s.track||s.pending||s.state==='playing';start.textContent=s.state==='paused'?'Fortsetzen':'Start';pause.disabled=!s.track||(!s.pending&&s.state!=='playing');stop.disabled=!s.track;opener.setAttribute('aria-label',s.state==='playing'?'Musik öffnen – Musik läuft':'Musik öffnen');opener.classList.toggle('is-playing',s.state==='playing');updateDock();updateRoom();// BOOK-01d/H00: In Szenen zeigt das auslösende Paneel den Zustand selbst; ein geschlossener Hinweis bleibt für dasselbe Stück geschlossen.
feedback.hidden=!['error','unavailable'].includes(s.state)||location.hash.startsWith('#musik')||Boolean(document.querySelector('#start02-tutorial-dialog')?.open)||Boolean(document.body?.classList?.contains?.('scene-mode'))||feedbackDismissed===feedbackKey(s);if(['error','unavailable'].includes(s.state)){feedback.replaceChildren(document.createTextNode(s.message+' '),feedbackOpen,feedbackClose);}if(s.state==='ended')advanceRoomQueue();});
 const ios=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);if(ios){volume.disabled=true;document.querySelector('#music-volume-help').textContent='Auf iPhone und iPad regelst du die Lautstärke mit den Gerätetasten oder im Kontrollzentrum.';}
 function updateDock(){document.querySelectorAll('[data-music-toggle]').forEach(button=>{const icon=button.querySelector('.dock-icon')||button;const audible=enabled&&['playing','starting'].includes(session.state);icon.innerHTML=audible?volumeOn():volumeOff();button.setAttribute('aria-label',audible?'Musik ausschalten':'Musik einschalten');button.setAttribute('aria-pressed',String(audible));button.title=audible?'Musik ausschalten':'Musik einschalten';button.classList.toggle('is-playing',enabled&&session.state==='playing');});}
 function ensureModeControls(){if(document.querySelector('#music-mode-settings'))return;const host=document.createElement('fieldset');host.id='music-mode-settings';host.className='music-mode-settings';host.innerHTML='<legend>Musikmodus</legend><label><input type="radio" name="music-mode" value="matching"> Passende Musik</label><small>Das zur Karte zugeordnete Stück wird verwendet.</small><label><input type="radio" name="music-mode" value="individual"> Individuelle Musik</label><small>Deine Auswahl bleibt beim Kartenwechsel erhalten.</small>';document.querySelector('#music-title-current').before(host);const inputs=[...host.querySelectorAll('input')];inputs.forEach(input=>input.checked=input.value===mode);inputs.forEach(input=>input.addEventListener('change',()=>{mode=setModeValue(input.value);status.textContent=mode==='matching'?'Passende Musik ist gewählt.':'Individuelle Musik bleibt beim Kartenwechsel erhalten.';if(mode==='matching'&&enabled)playForCard(currentCard);else if(mode==='individual'&&session.track)session.stop();}));}
 function ensureDock(){ensureModeControls();const dock=document.querySelector('.card-dock');if(dock&&!dock.querySelector('[data-music-toggle]')){const button=document.createElement('button');button.type='button';button.dataset.musicToggle='true';button.innerHTML='<span class="dock-icon"></span><span class="dock-label">Ton</span>';button.setAttribute('aria-label','Musik einschalten');button.setAttribute('aria-pressed','false');button.title='Musik einschalten';dock.append(button);button.onclick=()=>setEnabled(!(enabled&&['playing','starting'].includes(session.state)),'direct');}updateDock();}
 function chosen(){return tracks.find(t=>t.family===family.value&&t.variant===variant.value)||null;}function choose(){roomQueue=[];roomQueueFinished=false;session.select(chosen());variant.disabled=family.value==='silence'||!!session.track?.cardId||session.track?.kind==='app-theme';if(family.value==='silence'){enabled=false;updateDock();window.EMFDAudio?.publish();}}
 function matchingTrack(cardId){const assetId=cardMap[cardId];return assetId?tracks.find(t=>t.assetId===assetId)||null:null;}
 const concealedRoute=()=>location.hash==='#karte/verdeckt';
 const entryMusicOff=()=>window.EMFDMusicEntry?.preference?.()?.value==='off';
 async function playForCard(cardId){if(!cardId||concealedRoute()||!enabled||quiet||mode!=='matching')return;const track=matchingTrack(cardId);if(!track){session.stop();status.textContent='Für diese Karte ist noch keine passende Musik redaktionell zugeordnet.';return;}family.value=track.family;variant.value=track.variant;variant.disabled=!!track.cardId;if(session.track!==track)session.select(track);await session.play();}
 function stopForTeeReturn(){pendingBackgroundStart=false;pendingRevealCard=null;enabled=false;session.stop();status.textContent='Beim Zurückkehren ins Teezimmer wurde die Musik gestoppt.';updateDock();}
 function concealCard(){pendingBackgroundStart=false;pendingRevealCard=null;currentCard=null;enabled=false;session.stop();status.textContent='Die verdeckte Karte bleibt still.';updateDock();}
 function prepareRevealTrack(cardId){const track=matchingTrack(cardId)||tracks.find(item=>item.cardId===cardId)||null;if(!track)return null;family.value=track.family;variant.value=track.variant;variant.disabled=true;session.select(track);return track;}
 function revealCard(cardId){
   currentCard=cardId||null;
   if(!cardId||quiet||globalSilence||entryMusicOff()||userPaused||session.volume===0){enabled=false;updateDock();status.textContent=quiet?'Ruhemodus: Die Karte bleibt still.':globalSilence||entryMusicOff()?'Deine Entscheidung für Stille bleibt wirksam.':userPaused?'Musik wurde zuvor bewusst gestoppt oder pausiert.':'Lautstärke 0 % – die Karte bleibt still.';return false;}
   if(mode==='individual'&&session.track){enabled=true;session.play();return true;}const track=prepareRevealTrack(cardId);if(!track){pendingRevealCard=cardId;enabled=false;status.textContent='Die Kartenmusik wird noch vorbereitet. Du kannst sie anschließend im Player manuell starten.';updateDock();return false;}
   pendingRevealCard=null;enabled=true;userPaused=false;updateDock();session.play();return true;
 }
 function cardChanged(cardId){currentCard=cardId||null;if(mode==='matching'&&session.track?.kind!=='app-theme')playForCard(currentCard);}function setEnabled(value,source='direct'){if(quiet){enabled=false;updateDock();return;}enabled=Boolean(value);if(!enabled){userPaused=true;session.stop();status.textContent='Musik aus. Die Karte bleibt still.';updateDock();return;}userPaused=false;globalSilence=false;store(silenceKey,false);if(!session.track&&currentCard)mode=setModeValue('matching');updateDock();if(mode==='matching')playForCard(currentCard);else if(source==='direct'&&session.track)session.play();}
 function setQuiet(value){quiet=Boolean(value);start.disabled=quiet||!session.track||session.pending||session.state==='playing';if(quiet){enabled=false;session.stop();status.textContent='Ruhemodus: Musik ist vollständig ausgeschaltet.';updateDock();}}function bindDock(){syncThemeButtons();ensureDock();document.querySelectorAll('[data-music-toggle]').forEach(button=>{if(button.dataset.musicBound)return;button.dataset.musicBound='true';button.onclick=()=>setEnabled(!(enabled&&['playing','starting'].includes(session.state)),'direct');});updateDock();}
 family.onchange=()=>{if(family.value!=='silence'){globalSilence=false;store(silenceKey,false);}choose();};variant.onchange=choose;start.onclick=()=>{if(quiet){status.textContent='Ruhemodus: Musik bleibt ausgeschaltet.';return;}globalSilence=false;store(silenceKey,false);userPaused=false;enabled=true;session.play();updateDock();};pause.onclick=()=>{userPaused=true;session.pause();};stop.onclick=()=>{userPaused=true;session.stop();enabled=false;updateDock();};volume.oninput=()=>{session.setVolume(volume.value);store(volumeKey,session.volume);};document.querySelector('#music-silence').onclick=()=>{globalSilence=true;store(silenceKey,true);family.value='silence';choose();status.textContent='Globale Stille ist gewählt.';};
 modeInputs().forEach(input=>input.addEventListener('change',()=>{mode=setModeValue(input.value);status.textContent=mode==='matching'?'Passende Musik ist gewählt.':'Individuelle Musik bleibt beim Kartenwechsel erhalten.';if(mode==='matching'&&enabled)playForCard(currentCard);else if(mode==='individual'&&session.track)session.stop();}));opener.onclick=()=>{location.hash='musik';};document.querySelector('#music-close').onclick=()=>dialog.close();dialog.addEventListener('close',()=>opener.focus({preventScroll:true}));
 document.addEventListener('click',event=>{if(event.target.closest?.('[data-card-return-teezimmer]'))stopForTeeReturn();});let lastRoute=location.hash;
 document.querySelector('#quiet')?.addEventListener('click',()=>setQuiet(document.querySelector('#quiet').getAttribute('aria-pressed')==='true'));window.addEventListener('hashchange',()=>{const returningToTea=location.hash==='#teezimmer'&&/^#karte\//.test(lastRoute);lastRoute=location.hash;if(location.hash==='#karten'){pendingBackgroundStart=false;pendingRevealCard=null;}/* Door transitions never start music. */if(returningToTea)stopForTeeReturn();if(dialog.open)dialog.close();if(concealedRoute()){concealCard();bindDock();return;}const match=location.hash.match(/^#karte\/(O\d{2})$/);currentCard=match?match[1]:null;bindDock();});window.addEventListener('emfd:card-concealed',concealCard);window.addEventListener('emfd:card-revealed',event=>revealCard(event.detail?.cardId));window.addEventListener('online',()=>refreshRoomAvailability());window.addEventListener('focus',()=>{if(location.hash.startsWith('#musik'))refreshRoomAvailability();});window.addEventListener('pagehide',()=>{enabled=false;session.stop();});window.addEventListener('pageshow',e=>{if(e.persisted){enabled=false;session.stop();}});function selectCardTrack(cardId){
  roomQueue=[];roomQueueFinished=false;
  if(!/^O\d{2}$/.test(cardId))return false;
  // Only the user can start music. This action selects a composition and opens
  // the existing player; it never starts audio or bypasses global silence.
  location.hash='musik';
  const track=tracks.find(t=>t.cardId===cardId);
  if(!track){pendingCardSelection=cardId;status.textContent='Die Musikauswahl wird vorbereitet. Wenn die Audiodatei fehlt, bleibt es still.';return true;}
  pendingCardSelection=null;
  mode=setModeValue('individual');
  if(session.track!==track||session.state==='playing'){
    family.value=track.family;
    variant.value=track.variant;
    choose();
  }
  enabled=false;updateDock();
  start.focus({preventScroll:true});
  return true;
 }
 function themeTrack(assetId='T03'){return tracks.find(t=>t.assetId===assetId&&t.kind==='app-theme')||null;}function selectTheme(assetId='T03'){roomQueue=[];roomQueueFinished=false;const track=themeTrack(assetId);location.hash='musik';if(!track){status.textContent='Das App-Theme ist noch nicht verfügbar. Prüfe, ob THEME.mp3 bereitgestellt und das Musikmanifest aktualisiert wurde.';return false;}mode=setModeValue('individual');family.value=track.family;variant.value=track.variant;choose();start.focus({preventScroll:true});return true;}async function setBackgroundPreference(value,{start:shouldStart=false,explicit=false}={}){
   if(value!=='on'){pendingBackgroundStart=false;enabled=false;userPaused=true;session.stop();status.textContent='Hintergrundmusik ist ausgeschaltet.';updateDock();return true;}
   if(explicit){globalSilence=false;store(silenceKey,false);userPaused=false;}
   if(quiet||globalSilence){enabled=false;status.textContent=quiet?'Ruhemodus: Musik bleibt ausgeschaltet.':'Globale Stille bleibt wirksam.';updateDock();return false;}
   const track=themeTrack();
   if(!track){pendingBackgroundStart=Boolean(shouldStart);status.textContent='Hintergrundmusik wird vorbereitet.';return false;}
   if(roomAvailability.get(track.assetId)==='missing'){
     pendingBackgroundStart=false;enabled=false;session.stop();session.track={...track,loop:true};session.state='unavailable';session.message=missingRecordMessage;session.emit();updateDock();return false;
   }
   mode=setModeValue('individual');family.value=track.family;variant.value=track.variant;
   if(session.track?.assetId!==track.assetId||session.state==='unavailable')choose();
   if(session.track){session.track={...session.track,loop:true};if(session.audio)session.audio.loop=true;}
   enabled=true;updateDock();
   if(shouldStart)await session.play();
   return !shouldStart||session.state==='playing';
 }
 function pausePlayback(){userPaused=true;session.pause();return true;}
 function stopPlayback(){userPaused=true;enabled=false;session.stop();updateDock();return true;}
 function setPlaybackVolume(value){session.setVolume(value);volume.value=String(session.volume);store(volumeKey,session.volume);}
 function chooseSilence(){globalSilence=true;store(silenceKey,true);family.value='silence';choose();return true;}
 // EMFD-PLAYER-01: playback context = which source deliberately started the current track.
 // Display/binding only: it never starts, pauses or stops audio (W1: music continues across rooms).
 {const baseSelect=session.select.bind(session);session.select=track=>{
   if(pendingContext){playContext=pendingContext;pendingContext=null;}
   else if(!(roomSelecting&&playContext&&roomQueue.length&&playContext.queueKey===roomQueue.join(',')))playContext=null;
   return baseSelect(track);
 };}
 window.EMFDMusic={get playContext(){return playContext;},startPlayback:()=>startRoomMusic(true),pausePlayback,stopPlayback,setPlaybackVolume,chooseSilence,toggleTheme,unbindRoom,startRoomPlaylist,setRoomMode,get recordPlaced(){return recordPlaced;},get roomMode(){return roomMode;},get roomQueue(){return [...roomQueue];},registerRoomEntries,refreshRoomAvailability,availability:availabilityFor,missingRecordMessage,selectRoomTrack,stepRoomTrack,get roomTrackId(){return roomId();},get ready(){return roomTracksReady;},cardChanged,setEnabled,setQuiet,bindDock,bindRoom,selectTheme,selectCardTrack,setBackgroundPreference,concealCard,revealCard,stopForTeeReturn,get mode(){return mode;},get enabled(){return enabled;},get globalSilence(){return globalSilence;},get session(){return session;}};const initialVolume=Number(stored(volumeKey,'0.7'));if(Number.isFinite(initialVolume)){session.setVolume(initialVolume);volume.value=String(session.volume);}
 window.EMFDAudio?.attach(window.EMFDMusic);
 session.emit();bindDock();window.dispatchEvent?.(new CustomEvent('emfd:music-ready'));
 (window.EMFDContent?window.EMFDContent.musicManifest():fetch('music-manifest.json?v=0.6.69-audio').then(r=>{if(!r.ok)throw Error('manifest');return r.json();})).then(m=>{tracks=m.tracks;refreshRoomAvailability();updateRoom();for(const [id,label] of [['S01-E','Harfe und Handpan'],['S01-F-H','Harfe'],['S01-F-P','Handpan'],['S01-D','Percussion'],['W01','Winterstille']]){const o=document.createElement('option');o.value=id;o.textContent=label;family.append(o);}const appThemes=document.createElement('optgroup');appThemes.label='App-Theme';tracks.filter(t=>t.kind==='app-theme').forEach(t=>{const o=document.createElement('option');o.value=t.family;o.textContent=t.title;appThemes.append(o);});if(appThemes.children.length)family.append(appThemes);const cardSongs=document.createElement('optgroup');cardSongs.label='Kartenmusik';tracks.filter(t=>t.cardId).forEach(t=>{const o=document.createElement('option');o.value=t.family;o.textContent=`${t.cardId} · ${t.title}`;cardSongs.append(o);});family.append(cardSongs);family.disabled=false;return window.EMFDContent?window.EMFDContent.cardMusicMap().then(data=>({ok:true,json:async()=>data})):fetch('card-music-map.json');}).then(r=>{if(!r.ok)throw Error('map');return r.json();}).then(m=>{cardMap=m.cards||{};if(concealedRoute())concealCard();else if(enabled&&mode==='matching')playForCard(currentCard);if(pendingBackgroundStart&&!concealedRoute()){pendingBackgroundStart=false;setBackgroundPreference('on',{start:true});}if(pendingCardSelection)selectCardTrack(pendingCardSelection);if(pendingRevealCard){const id=pendingRevealCard;pendingRevealCard=null;const track=currentCard===id&&!concealedRoute()?prepareRevealTrack(id):null;if(track)status.textContent='Kartenmusik ist bereit. Tippe im Player auf Start.';}}).catch(()=>{status.textContent='Die Musikauswahl oder Kartenzuordnung konnte nicht geladen werden. Stille bleibt verfügbar.';});
})();

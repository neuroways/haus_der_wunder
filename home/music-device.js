/* Shared visual device; playback remains owned by EMFDMusic. */
(function(root){
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const catalogs=new WeakMap();
 const icon=name=>'<img class="music04-icon" data-transport-icon src="assets/music-icons/'+esc(name)+'.svg" alt="" aria-hidden="true" width="26" height="26">';
 const displayTitle=item=>item.cardId?item.title:item.title.replace(/\s*[–—-]\s*Main Theme$/,'');
 const id=item=>item.entryId||item.cardId||'theme';
 const source=item=>item.music?.coverPath||item.media.imagePath;
 function cover(item){return '<div class="music03-cover"><img src="'+esc(source(item))+'" alt="Cover: '+esc(item.title)+'" decoding="async" draggable="false"></div>';}
 function device(item){return '<div class="music03-device" role="group" aria-label="Schallplattenspieler">'+
 '<img class="music03-cabinet" src="../media/music03/cabinet-v2.png" alt="" width="1160" height="1360">'+cover(item)+
 '<div class="music03-platter"><div class="music03-record-presence"><img class="music03-vinyl" src="../media/music03/vinyl-v1.png" alt=""></div></div>'+
 '<div class="music03-tonearm-mount"><img class="music03-tonearm" src="../media/music03/tonearm-v1.png" alt=""></div>'+
 '<div class="music03-plaque"><span data-device-title>'+esc(displayTitle(item))+'</span><em data-device-category>'+esc(item.versionLabel||item.category||'Main Theme')+'</em></div>'+
 '<div class="music03-front"><div class="music03-transport" role="group" aria-label="Wiedergabe steuern">'+
 '<button type="button" data-room-step="-1" aria-label="Vorheriges Lied" title="Vorheriges Lied">'+icon('skip-back')+'</button>'+
 '<button type="button" class="music-room-start" data-room-music-start aria-label="Start" title="Start">'+icon('play')+'</button>'+
 '<button type="button" data-room-stop aria-label="Stopp" title="Stopp">'+icon('square')+'</button>'+
 '<button type="button" data-room-step="1" aria-label="Nächstes Lied" title="Nächstes Lied">'+icon('skip-forward')+'</button><button type="button" data-room-repeat aria-label="Einzelnes Lied wiederholen" title="Einzelnes Lied wiederholen">'+icon('repeat-1')+'</button></div><p class="music-room-status" role="status" aria-live="polite">Bereit zum Abspielen.</p></div></div>';}
 function bind(host,data){catalogs.set(host,data.playerItems||data.items);}
 function sync(host,session,currentId,ready,recordPlaced=false){
   const device=host.querySelector('.music03-device');if(!device)return;
   const items=catalogs.get(host)||[];
   const item=items.find(item=>id(item)===currentId)||items[0];if(!item)return;
   const img=device.querySelector('.music03-cover img');if(device.dataset.track!==id(item)){img.src=source(item);img.alt='Cover: '+item.title;device.querySelector('[data-device-title]').textContent=displayTitle(item);device.querySelector('[data-device-category]').textContent=item.versionLabel||item.category||'Main Theme';device.dataset.track=id(item);}
   device.dataset.recordRequested=String(recordPlaced);
   if(!recordPlaced)device.classList.remove('has-record');
   else if(!device.classList.contains('has-record')&&!device._arrivalScheduled){device._arrivalScheduled=true;requestAnimationFrame(()=>requestAnimationFrame(()=>{device._arrivalScheduled=false;if(device.isConnected&&device.dataset.recordRequested==='true')device.classList.add('has-record');}));}
   device.dataset.state=session.state;device.classList.toggle('is-playing',session.state==='playing');device.classList.toggle('is-paused',session.state==='paused');
   device.setAttribute('aria-label',(device.dataset.deviceName||'Schallplattenspieler')+': '+item.title+(item.versionLabel?' – '+item.versionLabel:'')+(recordPlaced?' · Platte aufgelegt':' · Plattenteller leer'));
   device.querySelectorAll('[data-room-step]').forEach(button=>button.disabled=!ready);
   device.querySelector('[data-room-stop]').disabled=!session.track||['stopped','silent','unavailable'].includes(session.state);
 }
 root.EMFDMusicDevice=Object.freeze({device,cover,bind,sync,icon});
})(globalThis);

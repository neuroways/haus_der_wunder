/* EMFD-HOUSE-MUSIC-01 + EMFD-PLAYER-01 · Musik eines Zimmers; no automatic playback.
 * Das Gerät des Raums ist ein Link „<Gerät> ansehen“ zur gemeinsamen Gerätestation (öffnen startet nichts).
 * „Abspielen“ in der Stückliste startet bewusst die Playlist des Geräts (Wiedergabekontext = Gerät).
 * Die Zuordnung kommt aus dem Geräteregister (shared/devices.js), nicht mehr aus room-music-map.json. */
(function(root){
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  // Compatibility: the former map shape, derived from the device register.
  function loadMap(){
    const rooms=Object.fromEntries((root.EMFDDevices?.list()||[]).map(device=>[device.roomId,{cardIds:[...device.tracks],deviceName:device.name,deviceImage:device.image,deviceId:device.id,route:device.route}]));
    return Promise.resolve({rooms});
  }
  function items(device){
    const known=root.CARDS||[];
    return device.tracks.map(id=>{
      const card=known.find(item=>item.id===id);
      if(!card)return `<li class="room-song room-song--missing"><span>${esc(id)} · Komposition derzeit nicht verfügbar</span></li>`;
      return `<li class="room-song" data-room-song="${esc(id)}">
        <img src="${esc(card.imageOverview||card.image||root.EMFDImages?.card(id,'card-overview'))}" alt="" loading="lazy" width="60" height="102">
        <div class="room-song-body"><span class="room-song-category">${esc(card.group)} · ${esc(id)}</span><strong>${esc(card.name)}</strong>
          <div class="room-song-actions"><button type="button" data-room-song-select="${esc(id)}" aria-label="${esc(card.name)} ${esc(device.at)} ${esc(device.name)} abspielen">Musik abspielen</button>
          <button type="button" data-room-song-story="${esc(id)}" aria-label="Kompositionsgeschichte zu ${esc(card.name)} lesen">Geschichte lesen</button></div>
        </div>
      </li>`;
    }).join('');
  }
  function setContent(slot,device){
    slot.innerHTML=`<div class="room-music-heading"><span class="eyebrow">Eine kleine Klangauswahl</span>
      <h2 id="room-music-heading-${esc(device.roomId)}">Musik dieses Zimmers</h2>
      <p>Diese Stücke gehören zu diesem Ort. Du entscheidest selbst, ob du etwas hören möchtest.</p></div>
      <a class="room-device-launch" href="${esc(device.route)}" data-room-device-link="${esc(device.id)}"><img src="${esc(device.image)}" alt=""><span>${esc(device.name)} ansehen</span></a>
      <ul class="room-song-list">${items(device)}</ul>
      <p class="room-music-status" data-room-music-status role="status" aria-live="polite"></p>`;
    const buttons=Array.from(slot.querySelectorAll('[data-room-song-select]'));
    const status=slot.querySelector('[data-room-music-status]');
    const enable=()=>buttons.forEach(button=>button.disabled=!root.EMFDMusic?.ready);
    buttons.forEach(button=>button.disabled=true);
    if(!root.EMFDMusic?.ready)root.addEventListener('emfd:music-availability',enable,{once:true});
    enable();
    slot.addEventListener('click',event=>{
      const play=event.target.closest?.('[data-room-song-select]');
      if(play){
        Promise.resolve(root.EMFDDeviceStation?.start(device.id,{startId:play.dataset.roomSongSelect})).then(started=>{
          if(slot.isConnected)status.innerHTML=started?`Spielt ${esc(device.at)} ${esc(device.name)}. <a href="${esc(device.route)}">${esc(device.name)} ansehen</a>`:'Die Musik ist gerade nicht verfügbar.';
        });
        return;
      }
      const story=event.target.closest?.('[data-room-song-story]');
      if(story)root.EMFDReaders?.openComposition?.(story.dataset.roomSongStory,story);
    });
  }
  function mount(host,roomId,{compact=false}={}){
    const device=root.EMFDDevices?.forRoom(roomId);
    if(!device||!host)return;
    if(compact){
      // Atelier and tea room: the device is reached from the top bar (the tea room keeps its two actions).
      const bar=roomId==='P04'?host.querySelector('.atelier-topbar-controls'):host.querySelector('.teezimmer-topbar');
      if(!bar||bar.querySelector('[data-room-music-open]'))return;
      const link=document.createElement('a');link.className='room-music-open';link.dataset.roomMusicOpen=roomId;link.href=device.route;
      link.setAttribute('aria-label',`${device.name} ansehen`);link.title=device.name;
      link.textContent=roomId==='P04'?'♫':device.name;
      if(roomId==='P04')bar.prepend(link);else bar.append(link);
      return;
    }
    const container=host.querySelector('.house-skeleton');
    if(!container||container.querySelector('[data-room-music-panel]'))return;
    const section=document.createElement('section');
    section.className='room-music-panel';section.dataset.roomMusicPanel=roomId;
    section.setAttribute('aria-label','Musik dieses Zimmers');
    container.append(section);
    setContent(section,device);
  }
  root.EMFDRoomMusic={loadMap,mount};
})(globalThis);

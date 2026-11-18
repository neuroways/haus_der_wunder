/* EMFD-HOUSE-MUSIC-01 · user-approved room song collections; no automatic playback. */
(function(root){
  const MAP_URL='room-music-map.json?v=0.6.66';
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  let mapPromise=null,dialog=null,opener=null,dialogRequest=0;
  function loadMap(){
    if(!mapPromise)mapPromise=fetch(MAP_URL).then(response=>{
      if(!response.ok)throw Error('Room music mapping could not be loaded');
      return response.json();
    }).catch(error=>{mapPromise=null;throw error;});
    return mapPromise;
  }
  function items(roomId,map){
    const ids=map.rooms?.[roomId]?.cardIds||[];
    const known=root.CARDS||[];
    return ids.map(id=>{
      const card=known.find(item=>item.id===id);
      if(!card)return `<li class="room-song room-song--missing"><span>${esc(id)} · Komposition derzeit nicht verfügbar</span></li>`;
      return `<li class="room-song" data-room-song="${esc(id)}">
        <img src="${esc(card.imageOverview||card.image||window.EMFDImages.card(id,'card-overview'))}" alt="" loading="lazy" width="60" height="102">
        <div class="room-song-body"><span class="room-song-category">${esc(card.group)} · ${esc(id)}</span><strong>${esc(card.name)}</strong>
          <div class="room-song-actions"><button type="button" data-room-song-select="${esc(id)}" aria-label="${esc(card.name)} abspielen">Musik abspielen</button>
          <a href="#musik/geschichten/${esc(id)}" aria-label="Kompositionsgeschichte zu ${esc(card.name)} lesen">Geschichte lesen</a></div>
        </div>
      </li>`;
    }).join('');
  }
  function setContent(slot,roomId,map){
    slot.innerHTML=`<div class="room-music-heading"><span class="eyebrow">Eine kleine Klangauswahl</span>
      <h2 id="room-music-heading-${esc(roomId)}">Musik dieses Zimmers</h2>
      <p>Diese Stücke gehören zu diesem Ort. Du entscheidest selbst, ob du etwas hören möchtest.</p></div>
      <button type="button" class="room-device-launch" data-room-song-select="${esc(map.rooms[roomId].cardIds[0])}" aria-label="${esc(map.rooms[roomId].deviceName)} abspielen"><img src="${esc(map.rooms[roomId].deviceImage)}" alt=""><span>${esc(map.rooms[roomId].deviceName)} abspielen</span></button><ul class="room-song-list">${items(roomId,map)}</ul>
      <div data-room-device-host></div>`;
    const buttons=Array.from(slot.querySelectorAll('[data-room-song-select]'));
    buttons.forEach(button=>button.disabled=true);
    slot.querySelectorAll('.room-song a').forEach(link=>link.addEventListener('click',()=>{if(dialog?.open)dialog.close();}));
    root.EMFDContent.music().then(catalog=>{
      if(!slot.isConnected)return;
      const player=root.EMFDMusic;
      const cards=map.rooms[roomId].cardIds;
      const entries=cards.flatMap(card=>catalog.items.filter(item=>item.cardId===card));
      player.registerRoomEntries(catalog.items);
      const key=root.EMFDMusicDiscovery.id;
      const host=slot.querySelector('[data-room-device-host]');
      const play=card=>{
        const first=entries.find(item=>item.cardId===card&&player.availability(key(item))!=='missing');
        const item=first||entries.find(item=>item.cardId===card);
        if(!item)return;
        host.innerHTML=root.EMFDMusicDevice.device(item);
        const art=map.rooms[roomId].deviceImage;
        if(art){
          host.classList.add('room-device-art');
          const image=host.querySelector('.music03-cabinet');
          image.src=art;image.alt=map.rooms[roomId].deviceName;
          host.querySelector('.music03-device').dataset.deviceName=map.rooms[roomId].deviceName;
        }
        slot.querySelector('.room-device-launch').hidden=true;
        root.EMFDMusicDevice.bind(host,{items:entries});
        player.bindRoom(host);
        const ids=entries.map(key);
        if(first)player.startRoomPlaylist(ids,{explicit:true,startId:key(first)});
        else player.selectRoomTrack(key(item));
        host.scrollIntoView({block:'nearest'});
      };
      const enable=()=>buttons.forEach(button=>button.disabled=!player.ready);
      if(!player.ready)root.addEventListener('emfd:music-availability',enable,{once:true});
      enable();
      buttons.forEach(button=>button.addEventListener('click',()=>play(button.dataset.roomSongSelect)));
    }).catch(()=>{slot.querySelector('[data-room-device-host]').textContent='Die Musik ist gerade nicht verfügbar.';});
  }
  function ensureDialog(){
    if(dialog)return dialog;
    dialog=document.createElement('dialog');dialog.className='room-music-dialog';
    dialog.setAttribute('aria-label','Musik dieses Zimmers');
    document.body.append(dialog);
    dialog.addEventListener('click',event=>{
      if(event.target.closest?.('[data-room-music-close]'))dialog.close();
    });
    dialog.addEventListener('close',()=>{if(opener?.isConnected)opener.focus({preventScroll:true});opener=null;});
    return dialog;
  }
  async function showDialog(roomId,button){
    opener=button;
    const requestId=++dialogRequest;
    const modal=ensureDialog();
    modal.innerHTML='<div class="room-music-modal-head"><h2>Musik dieses Zimmers</h2><button type="button" data-room-music-close aria-label="Raummusik schließen">Schließen</button></div><p role="status">Die Musikauswahl wird geladen …</p>';
    if(!modal.open)modal.showModal();
    modal.querySelector('[data-room-music-close]')?.focus();
    try{
      const map=await loadMap();
      if(!modal.open||requestId!==dialogRequest)return;
      modal.innerHTML='<div class="room-music-modal-head"><span class="eyebrow">Das Haus der kleinen Wunder</span><button type="button" data-room-music-close aria-label="Raummusik schließen">Schließen</button></div><section class="room-music-panel room-music-panel--modal"></section>';
      setContent(modal.querySelector('.room-music-panel'),roomId,map);
      modal.querySelector('[data-room-music-close]')?.focus();
    }catch{
      if(modal.open&&requestId===dialogRequest)modal.querySelector('[role="status"]').textContent='Die Zuordnung konnte nicht geladen werden. Die übrigen Räume bleiben benutzbar.';
    }
  }
  function mount(host,roomId,{compact=false}={}){
    if(!/^P0[1-8]$/.test(roomId)||!host)return;
    if(compact){
      const bar=roomId==='P04'?host.querySelector('.atelier-topbar-controls'):host.querySelector('.teezimmer-topbar');
      if(!bar||bar.querySelector('[data-room-music-open]'))return;
      const button=document.createElement('button');button.type='button';button.className='room-music-open';button.dataset.roomMusicOpen=roomId;
      button.setAttribute('aria-label','Musik dieses Zimmers öffnen');button.title='Musik dieses Zimmers';
      button.textContent=roomId==='P04'?'♫':'Musik hier';
      button.addEventListener('click',()=>showDialog(roomId,button));
      if(roomId==='P04')bar.prepend(button);else bar.append(button);
      return;
    }
    const container=host.querySelector('.house-skeleton');
    if(!container||container.querySelector('[data-room-music-panel]'))return;
    const section=document.createElement('section');
    section.className='room-music-panel';section.dataset.roomMusicPanel=roomId;
    section.setAttribute('aria-label','Musik dieses Zimmers');
    section.innerHTML='<p role="status">Die Musik dieses Zimmers wird geladen …</p>';
    container.append(section);
    loadMap().then(map=>{
      if(section.isConnected&&section.dataset.roomMusicPanel===roomId)setContent(section,roomId,map);
    }).catch(()=>{
      if(section.isConnected)section.innerHTML='<p role="status">Die Musikauswahl ist gerade nicht verfügbar.</p>';
    });
  }
  root.EMFDRoomMusic={loadMap,mount};
})(globalThis);

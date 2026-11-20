/* EMFD-FE-08: first-entry music decision, stored only when requested. */
(function(){
  const LOCAL_KEY='emfd.music.entryPreference';
  const SESSION_KEY='emfd.music.entryPreference.session';
  const values=new Set(['on','off']);
  const get=(storage,key)=>{try{return storage.getItem(key);}catch{return null;}};
  const set=(storage,key,value)=>{try{storage.setItem(key,value);}catch{}};
  const remove=(storage,key)=>{try{storage.removeItem(key);}catch{}};
  const preference=()=>{const local=get(localStorage,LOCAL_KEY);if(values.has(local))return {value:local,remembered:true};const session=get(sessionStorage,SESSION_KEY);return values.has(session)?{value:session,remembered:false}:null;};
  const save=(value,remember)=>{if(!values.has(value))return;if(remember){set(localStorage,LOCAL_KEY,value);remove(sessionStorage,SESSION_KEY);}else{remove(localStorage,LOCAL_KEY);set(sessionStorage,SESSION_KEY,value);}};
  const forget=()=>{remove(localStorage,LOCAL_KEY);remove(sessionStorage,SESSION_KEY);};

  const dialog=document.createElement('dialog');
  dialog.id='music-entry-dialog';dialog.className='music-entry-dialog';dialog.setAttribute('aria-labelledby','music-entry-title');
  dialog.innerHTML=`<form method="dialog"><button type="button" class="music-entry-back" aria-label="Zurück zur Karte" data-entry-back>←</button><span class="eyebrow">Deine kleine Welt</span><h2 id="music-entry-title">Wie möchtest du sie genießen?</h2><p>In Stille oder von Musik begleitet – du entscheidest.</p><div class="music-entry-choices"><button type="button" data-entry-choice="off"><strong>In Stille</strong><small>Ohne Hintergrundmusik</small></button><button type="button" data-entry-choice="on"><strong>Mit Musik</strong><small>Hintergrundmusik starten</small></button></div><p class="music-entry-status" data-entry-status role="status" hidden></p><label class="music-entry-remember"><input type="checkbox" name="remember"> Entscheidung merken</label></form>`;
  document.body.append(dialog);
  let flow=null,previousFocus=null;
  function syncAvailability(){
    const player=window.EMFDMusic,availability=player?.availability?.('theme'),status=dialog.querySelector('[data-entry-status]');
    dialog.querySelector('[data-entry-choice="on"]').disabled=!player||availability==='checking';
    status.hidden=availability!=='missing'&&availability!=='checking'&&Boolean(player);
    status.textContent=availability==='missing'?player.missingRecordMessage:availability==='checking'||!player?'Die Musik wird noch vorbereitet. Du kannst schon in Stille eintreten.':'';
  }
  function show(force=false,options={}){
    const current=preference();
    if(!force&&current)return false;
    flow=options;previousFocus=document.activeElement;
    dialog.querySelector('[name="remember"]').checked=current?.remembered||false;
    syncAvailability();
    if(!dialog.open)dialog.showModal();
    dialog.querySelector('[data-entry-choice="off"]').focus();
    return true;
  }
  function cancel(){
    const pending=flow;flow=null;dialog.close();
    if(pending?.onCancel)pending.onCancel();else if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});
  }
  /** Musikentscheidung anwenden (Musikfrage, Eingangsglocke): speichert nur auf Wunsch und startet nur bei „mit Musik“
   *  innerhalb der auslösenden Geste. Präferenz und Wiedergabezustand bleiben getrennt. */
  function apply(value,{remember=false}={}){
    if(!values.has(value))return false;
    save(value,Boolean(remember));
    window.EMFDMusic?.setBackgroundPreference(value,{start:value==='on',explicit:true});
    return true;
  }
  function choose(value){
    if(!values.has(value))return;
    const pending=flow;flow=null;
    // Keep play() in this explicit button gesture, including on iOS.
    apply(value,{remember:dialog.querySelector('[name="remember"]').checked});
    dialog.returnValue=value;dialog.close();
    pending?.onChoose?.(value);
  }
  dialog.querySelectorAll('[data-entry-choice]').forEach(button=>button.addEventListener('click',()=>choose(button.dataset.entryChoice)));
  dialog.querySelector('[data-entry-back]').addEventListener('click',cancel);
  dialog.querySelector('form').addEventListener('submit',event=>event.preventDefault());
  dialog.addEventListener('cancel',event=>{event.preventDefault();cancel();});
  dialog.addEventListener('close',()=>{flow=null;});
  window.addEventListener('emfd:music-availability',syncAvailability);
  window.addEventListener('emfd:music-ready',syncAvailability);
  window.addEventListener('hashchange',()=>{if(dialog.open){flow=null;dialog.close();}});

  function mountSettings(){
    const settings=document.querySelector('#settings-dialog');if(!settings||settings.querySelector('#background-music-settings'))return;
    const section=document.createElement('section');section.id='background-music-settings';section.className='background-music-settings';
    section.innerHTML=`<h3>Hintergrundmusik beim Eintritt</h3><fieldset><legend class="sr-only">Musikentscheidung ändern</legend><label><input type="radio" name="settings-entry-music" value="on"> Mit Hintergrundmusik</label><label><input type="radio" name="settings-entry-music" value="off"> Ohne Hintergrundmusik</label></fieldset><label class="settings-music-remember"><input type="checkbox" data-settings-remember> Entscheidung merken</label><div><button type="button" data-settings-save>Übernehmen</button><button type="button" data-settings-reset>Entscheidung zurücksetzen</button></div><p class="caption" data-settings-status></p>`;
    settings.querySelector('#motion-settings')?.after(section);
    const sync=()=>{const current=preference()||{value:'on',remembered:false};section.querySelector(`[value="${current.value}"]`).checked=true;section.querySelector('[data-settings-remember]').checked=current.remembered;};
    section.querySelector('[data-settings-save]').addEventListener('click',()=>{const value=section.querySelector('input[name="settings-entry-music"]:checked')?.value||'on',remember=section.querySelector('[data-settings-remember]').checked;save(value,remember);window.EMFDMusic?.setBackgroundPreference(value,{start:false});section.querySelector('[data-settings-status]').textContent=value==='on'?'Hintergrundmusik ist gewählt und bleibt bis zum bewussten Start still.':'Das Haus bleibt still.';});
    section.querySelector('[data-settings-reset]').addEventListener('click',()=>{forget();window.EMFDMusic?.setBackgroundPreference('off',{start:false});sync();section.querySelector('[data-settings-status]').textContent='Entscheidung gelöscht. Beim nächsten Besuch wirst du wieder gefragt.';});
    document.querySelector('#settings-open')?.addEventListener('click',sync);sync();
  }

  mountSettings();
  window.EMFDMusicEntry={preference,save,forget,show,apply};
})();

(function(root){
  const GROUPS=['Alle','Ruhe','Kraft','Halt','Freude'];
  let renderRequest=0;
  let unbindAvailability=()=>{};
  let storyShelf=null;
  const discoveryState={category:'Alle',style:'',instrument:'',browseId:'theme'};

  const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[char]);

  async function loadCatalog(){
    const data=await root.EMFDContent.music();
    root.EMFDMusic?.registerRoomEntries(data.items);
    return data;
  }
  const loadStories=()=>root.EMFDContent.compositions();

  function leave(host){
    ++renderRequest;unbindAvailability();unbindAvailability=()=>{};
    storyShelf?.destroy();storyShelf=null;
    root.EMFDMusic?.unbindRoom(host);
  }

  // EMFD-NAV-01: back links come from EMFDNavigation.backLinkMarkup; clicks are handled centrally.
  function bindReturn(){}


  function fallbackImage(event){
    const image=event.currentTarget;
    const placeholder=document.createElement('span');
    placeholder.className='music-cover-fallback';
    placeholder.textContent='Bild wird nachgeliefert';
    image.replaceWith(placeholder);
  }

  function bindImages(host){
    host.querySelectorAll('.music-cover,.story-cover').forEach(image=>{
      image.addEventListener('error',fallbackImage,{once:true});
      if(image.complete&&!image.naturalWidth)fallbackImage({currentTarget:image});
    });
  }

  function status(item){
    if(item.playable&&item.publicationStatus==='approved')return 'Freigegeben';
    return 'Noch nicht zur Wiedergabe freigegeben';
  }

  function renderRoom(host,data){
    const theme=data.playerItems.find(item=>root.EMFDMusicDiscovery.id(item)===root.EMFDMusic?.roomTrackId)||data.items[0];
    root.EMFDMusicDevice.bind(host,data);
    host.innerHTML=`<section class="music-room music-room--scene music03-room" aria-labelledby="music-room-title">
      <img class="music03-background" src="assets/recovery/musikzimmer-v1-865-v1-518f76f8bb.webp" alt="" aria-hidden="true">
      <div class="music-room-topbar">${(root.EMFDNavigation?.backLinkMarkup?.('#flur')||'<a class="back" href="#flur">Zurück</a>')}<button type="button" data-music-help aria-label="Hilfe im Musikzimmer" title="Hilfe">?</button></div>
      <h1 id="music-room-title">Musikzimmer</h1>
      <figure class="music03-stage">
        ${root.EMFDMusicDevice.device(theme)}
        <figcaption>
          <p class="music03-invitation">Ein Moment zum Lauschen.</p>
          <div class="music-room-actions">
            <a class="music04-room-icon" href="#musik/playlist" aria-label="Coverauswahl öffnen" title="Coverauswahl öffnen">${root.EMFDMusicDevice.icon('layout-grid')}</a>
            <a class="music04-room-icon" href="#musik/geschichten" aria-label="Kompositionsgeschichten lesen" title="Kompositionsgeschichten lesen">${root.EMFDMusicDevice.icon('book-open')}</a>
          </div>
        </figcaption>
      </figure>
    </section>`;
    const image=host.querySelector('.music03-background');
    image.addEventListener('error',()=>{image.hidden=true;host.querySelector('.music03-room').classList.add('music-room-no-image');},{once:true});
    const request=renderRequest;const bind=()=>{if(request!==renderRequest||!host.querySelector('.music03-device'))return;root.EMFDMusic.registerRoomEntries(data.items);root.EMFDMusic.bindRoom(host);};
    if(root.EMFDMusic)bind();else root.addEventListener('emfd:music-ready',bind,{once:true});
  }

  function renderPlaylist(host,data){
    const helper=root.EMFDMusicDiscovery,state=discoveryState;
    const options=key=>[...new Set(data.items.flatMap(item=>item.music[key]))].sort((a,b)=>a.localeCompare(b,'de')).map(value=>'<option value="'+escape(value)+'">'+escape(value)+'</option>').join('');
    host.innerHTML=`<section class="music04-selection" aria-labelledby="playlist-title">
      <img class="music04-backdrop" src="assets/recovery/musikzimmer-v1-865-v1-518f76f8bb.webp" alt="">
      <div class="music04-content"><div class="music04-selection-topbar">${(root.EMFDNavigation?.backLinkMarkup?.('#musik')||'<a class="back" href="#musik">Zurück</a>')}<button type="button" data-music-help aria-label="Hilfe zur Plattensammlung" title="Hilfe">?</button></div>
      <h1 id="playlist-title">Deine Plattensammlung</h1><p class="music04-intro">Wische durch die Cover und lege eine Platte auf.</p>
      <div class="music-filters" role="group" aria-label="Kategorie">${[...GROUPS,'Main Theme'].map(group=>'<button type="button" data-music-group="'+group+'" aria-pressed="'+(state.category===group)+'">'+group+'</button>').join('')}</div>
      <div class="music04-filter-fields"><label>Musikstil<select data-filter-style aria-label="Musikstil"><option value="">Alle Musikstile</option>${options('styles')}</select></label><label>Instrument<select data-filter-instrument aria-label="Instrument"><option value="">Alle Instrumente</option>${options('instruments')}</select></label><button type="button" data-filter-reset>Filter zurücksetzen</button></div>
<div class="music04-playlist-action"><button type="button" data-filter-playlist aria-label="Playlist nach aktueller Filterauswahl starten" title="Playlist nach aktueller Filterauswahl starten">${root.EMFDMusicDevice.icon('list-start')}</button><p class="music04-count" role="status" aria-live="polite" data-playlist-count></p></div>
      <div class="music04-gallery" data-cover-gallery tabindex="0" aria-label="Durch Plattencover blättern"></div>
      <p class="music04-empty" role="status" hidden>Für diese Kombination gibt es kein Stück. Setze einen Filter zurück.</p>
      </div></section>`;
    const style=host.querySelector('[data-filter-style]'),instrument=host.querySelector('[data-filter-instrument]'),gallery=host.querySelector('[data-cover-gallery]');
    style.value=state.style;instrument.value=state.instrument;
    let filtered=[],suppressClickUntil=0,gesture=null;
    const image=item=>'<img src="'+escape(item.music.coverPath)+'" alt="Cover: '+escape(item.title)+'" draggable="false" decoding="async">';
    function play(item,event){
      if(Date.now()<suppressClickUntil){event?.preventDefault();return;}
      state.browseId=helper.id(item);
      if(root.EMFDAudio.select(helper.id(item),{play:true,explicit:false})){root.EMFDNavigation.go('#musik',{kind:'station'});}
      else host.querySelector('[data-playlist-count]').textContent='Die Musik wird vorbereitet. Bitte tippe gleich noch einmal auf das Cover.';
    }
    function draw(){
      filtered=helper.filter(data.items,state);
      host.querySelectorAll('[data-music-group]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.musicGroup===state.category)));
      const count=filtered.length,index=Math.max(0,filtered.findIndex(item=>helper.id(item)===state.browseId)),item=filtered[index];
      gallery.dataset.count=String(count);
      host.querySelector('[data-playlist-count]').textContent=count+' '+(count===1?'Platte':'Platten');
      host.querySelector('[data-filter-playlist]').disabled=!count||!root.EMFDMusic?.ready;
      host.querySelector('.music04-empty').hidden=!!count;gallery.hidden=!count;
      if(!item){gallery.replaceChildren();return;}
      state.browseId=helper.id(item);
      const previous=filtered[helper.step(index,-1,count)],next=filtered[helper.step(index,1,count)];
      gallery.innerHTML=`<p class="atelier-position"><span>${escape(item.category||'Main Theme')}</span><span>${index+1} von ${count}</span></p>
        <div class="atelier-wall music04-wall">
          <figure class="atelier-neighbor atelier-neighbor--previous" aria-hidden="true">${image(previous)}</figure>
          <figure class="atelier-masterpiece"><button class="atelier-frame music04-cover" type="button" data-cover-play aria-label="${escape(item.title+(item.versionLabel?' – '+item.versionLabel:''))} abspielen">${image(item)}</button><figcaption><strong>${escape(item.title)}</strong>${item.versionLabel?'<span class="music04-version">'+escape(item.versionLabel)+'</span>':''}<span>${escape(item.category||'Main Theme')}</span></figcaption></figure>
          <figure class="atelier-neighbor atelier-neighbor--next" aria-hidden="true">${image(next)}</figure>
        </div>
        <nav class="atelier-gallery-nav music04-nav" aria-label="Zwischen Covern blättern"><button type="button" data-cover-move="-1" aria-label="Vorheriges Cover" title="Vorheriges Cover">${root.EMFDMusicDevice.icon('skip-back')}</button><button type="button" data-cover-start aria-label="Platte auflegen" title="Platte auflegen">${root.EMFDMusicDevice.icon('disc-3')}</button><button type="button" data-cover-move="1" aria-label="Nächstes Cover" title="Nächstes Cover">${root.EMFDMusicDevice.icon('skip-forward')}</button></nav>
        <div class="music04-description" aria-label="Musikalische Idee">${root.EMFDMusic?.availability(helper.id(item))==='missing'?'<p class="music04-missing" role="status">'+escape(root.EMFDMusic.missingRecordMessage)+'</p>':''}<p>${escape(item.music.description)}</p><dl><div><dt>Musikstil</dt><dd>${escape(item.music.styles.join(' · ')||'Noch nicht beschrieben')}</dd></div><div><dt>Instrumente &amp; Klänge</dt><dd>${escape(item.music.instruments.join(' · ')||'Noch nicht beschrieben')}</dd></div></dl>${item.cardId?'<a class="music04-story-link" href="#musik/geschichten/'+escape(item.cardId)+'">Kompositionsgeschichte lesen</a>':''}</div>`;
      gallery.querySelector('[data-cover-play]').addEventListener('click',event=>play(item,event));
      gallery.querySelector('[data-cover-start]').addEventListener('click',event=>play(item,event));
      gallery.querySelectorAll('[data-cover-move]').forEach(button=>{button.disabled=count<2;button.addEventListener('click',()=>move(Number(button.dataset.coverMove)));});

    }
    function move(delta){if(filtered.length<2)return;const index=Math.max(0,filtered.findIndex(item=>helper.id(item)===state.browseId));state.browseId=helper.id(filtered[helper.step(index,delta,filtered.length)]);draw();gallery.focus({preventScroll:true});}
    gallery.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();move(event.key==='ArrowRight'?1:-1);}});
    gallery.addEventListener('pointerdown',event=>{if(event.isPrimary===false||event.button>0||!event.target.closest('.music04-wall'))return;gesture={id:event.pointerId,x:event.clientX,y:event.clientY};});
    gallery.addEventListener('pointerup',event=>{if(!gesture||gesture.id!==event.pointerId)return;const delta=helper.swipe(event.clientX-gesture.x,event.clientY-gesture.y);gesture=null;if(delta){suppressClickUntil=Date.now()+450;move(delta);}});
    gallery.addEventListener('pointercancel',()=>{gesture=null;});
    host.querySelectorAll('[data-music-group]').forEach(button=>button.addEventListener('click',()=>{state.category=button.dataset.musicGroup;draw();}));
    style.addEventListener('change',()=>{state.style=style.value;draw();});instrument.addEventListener('change',()=>{state.instrument=instrument.value;draw();});
    host.querySelector('[data-filter-reset]').addEventListener('click',()=>{state.category='Alle';state.style='';state.instrument='';style.value='';instrument.value='';draw();});
    host.querySelector('[data-filter-playlist]').addEventListener('click',()=>{if(root.EMFDAudio.playlist(filtered.map(helper.id)))root.EMFDNavigation.go('#musik',{kind:'station'});});
    const availabilityChanged=()=>{if(gallery.isConnected)draw();};
    root.addEventListener('emfd:music-availability',availabilityChanged);
    unbindAvailability=()=>root.removeEventListener('emfd:music-availability',availabilityChanged);
    draw();
  }

  function storyImage(story,media,priority='lazy'){
    const illustration=media.illustrations.find(item=>item.illustrationId===story.illustrationId);
    const src=illustration?.webPath||illustration?.fallbackPath||root.EMFDImages.card(story.cardImageId,'card-view');
    const alt=illustration?.webPath?illustration.alt:`Originalkarte ${story.cardId} „${story.title}“ als vorläufige Illustration.`;
    return `<img class="story-cover" src="${escape(src)}" alt="${escape(alt)}" loading="${priority}">`;
  }

  async function renderStories(host,{catalog:stories,media},request,selectedId){
    host.innerHTML=`<section class="music04-story-selection"><div class="music04-story-topbar">${(root.EMFDNavigation?.backLinkMarkup?.('#musik')||'<a class="back" href="#musik">Zurück</a>')}<button type="button" data-music-help aria-label="Hilfe zu den Kompositionsgeschichten" title="Hilfe">?</button></div><div class="music04-story-shelf" data-composition-shelf></div></section>`;
    const shelf=await root.EMFDMusicBooks.mount(host.querySelector('[data-composition-shelf]'),stories,media,selectedId);
    if(request!==renderRequest){shelf?.destroy();return null;}storyShelf=shelf;return shelf;
  }
  async function renderStory(host,data,cardId,request){
    if(!data.catalog.stories.some(story=>story.cardId===cardId)){root.EMFDNavigation.go('#musik/geschichten',{kind:'station'});return;}
    const shelf=await renderStories(host,data,request,cardId);if(request!==renderRequest)return;shelf?.open(cardId);
  }

  async function render(host,view='room'){
    leave(host);
    const request=++renderRequest;
    host.innerHTML='<section class="music-room"><p role="status">Musikzimmer wird vorbereitet …</p></section>';
    try{
      if(view==='stories'||view.startsWith('stories/')){
        const stories=await loadStories();
        if(request!==renderRequest)return;
        if(view==='stories')await renderStories(host,stories,request);
        else await renderStory(host,stories,view.split('/')[1],request);
      }else{
        const data=await loadCatalog();
        if(request!==renderRequest)return;
        if(view==='playlist')renderPlaylist(host,data);
        else renderRoom(host,data);
      }
      if(request!==renderRequest)return;
      bindReturn(host);
      root.EMFDUI?.enhance(host);
      host.focus({preventScroll:true});
      root.EMFDNavigation.ready();
    }catch{
      if(request!==renderRequest)return;
      host.innerHTML='<section class="music-room">'+(root.EMFDNavigation?.backLinkMarkup?.('#flur')||'<a class="back" href="#flur">Zurück</a>')+'<h1>Musikzimmer</h1><p role="alert">Die Playlist-Daten konnten nicht geladen werden. Die Anwendung bleibt still.</p></section>';
    }
  }

  for(const [id,view] of [['gramophone','room'],['records','playlist'],['compositions','stories']])root.EMFDStations.register(id,{render:(host,options)=>render(host,options.cardId?'stories/'+options.cardId:view),leave});
  root.EMFDMusicRoom={render,leave,loadCatalog,loadStories};
})(globalThis);

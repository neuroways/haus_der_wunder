/* START03: Try the existing light, shared record player and gift card before arrival. */
(function(root){
 const giftURL='https://flowisaurus.de/wunderhaus/home/#ankommen';
 const steps=[
  ['Laterne','Berühre die Laterne: Licht an, Licht aus. So findest du die Stimmung, die dir gerade guttut.','Weiter'],
  ['Grammophon','Probiere Start und Stopp aus. Hier hörst du das Theme des Hauses – über denselben Player wie im Musikzimmer.','Zu den Türen'],
  ['Türen','Berühre die Tür. Dahinter wartet deine erste Karte.','Zur Karte'],
  ['Deine Geschenkkarte','Die Karte vom Anfang hat zwei Seiten. Du kannst sie jederzeit umdrehen. Ihr QR-Code führt dich wieder zu diesem Haus.','Zur Hilfe'],
  ['Das Fragezeichen','Wenn du etwas wissen möchtest, berühre das Fragezeichen. Probiere es hier aus.','Das Haus griffbereit'],
  ['Das Haus griffbereit','Du kannst das Haus wie eine App auf deinem Gerät ablegen und später mit einem Tippen wiederkommen.','Im Flur ankommen']
 ];
 const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const reduced=()=>root.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
 let dialog=null,index=0,onFinish=null,gramHost=null,generation=0,timers=[],flipped=false,cardTouched=false;
 const later=(fn,ms)=>{const timer=root.setTimeout(fn,ms);timers.push(timer);};
 function unmount(){generation++;timers.forEach(timer=>root.clearTimeout(timer));timers=[];if(gramHost)root.EMFDMusic?.unbindRoom?.(gramHost);gramHost=null;}
 function qrSVG(){
  const qr=new root.EMFDQRCode(0,root.EMFDQRErrorCorrectLevel.M);qr.addData(giftURL);qr.make();
  const n=qr.getModuleCount(),quiet=4,size=n+quiet*2;let path='';
  for(let row=0;row<n;row++)for(let col=0;col<n;col++)if(qr.isDark(row,col))path+=`M${col+quiet} ${row+quiet}h1v1h-1z`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" role="img" aria-label="QR-Code zum Haus der kleinen Wunder" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="#fff"/><path d="${path}" fill="#102b3c"/></svg>`;
 }
 function finish(){const done=onFinish;onFinish=null;unmount();dialog?.close();done?.();}
 function lightMarkup(){const on=root.EMFDHallLight?.value!==false;return `<div class="start03-stage start03-light-stage" data-tour-light="${on}"><img class="start03-hall-preview" src="assets/recovery/flur-v2-${on?'864-v1-e7d3476528':'dim-864-v1-5aba5b505b'}.webp" alt="${on?'Der Flur ist beleuchtet.':'Der Flur liegt im gedämpften Licht.'}"><button class="start03-lantern" type="button" data-tour-lantern aria-label="${on?'Laterne ausschalten':'Laterne einschalten'}" aria-pressed="${on}"><img src="assets/tutorial/lantern-off-v1.png" alt="" width="1254" height="1254"><img class="start03-lantern-lit" src="assets/tutorial/lantern-on-v1.png" alt="" width="1254" height="1254"></button><p data-tour-light-status role="status">${on?'Das Licht ist an.':'Das Licht ist aus.'}</p></div>`;}
 function cardMarkup(){let qr;try{qr=qrSVG();}catch{qr='<span>Zum Haus der kleinen Wunder<br>'+esc(giftURL)+'</span>';}
  return `<div class="start03-stage start03-card-stage"><button type="button" class="start03-card-turn" data-tour-card aria-label="Geschenkkarte umdrehen – QR-Code ansehen" aria-pressed="false"><span class="start03-card-inner"><span class="start03-card-face start03-card-front"><img src="../media/start/EMFD-START-02-A06-geschenkkarte-vorderseite.webp" alt="Vorderseite deiner Geschenkkarte mit der Tür ins Haus."></span><span class="start03-card-face start03-card-back" aria-hidden="true"><img src="assets/recovery/rueckseite.jpeg" alt="Goldene Ranken, Sterne und Musik auf petrolblauem Grund."><span class="start03-qr-panel">${qr}<small>flowisaurus.de</small></span></span></span></button><p class="start03-card-caption" data-tour-card-status role="status">Die Vorderseite deiner Geschenkkarte.</p></div>`;
 }
 function stage(){
  if(index===0)return lightMarkup();
  if(index===1)return '<div class="start03-stage start03-gram-stage" data-tour-gram><p role="status">Das Grammophon wird vorbereitet …</p></div>';
  if(index===2)return '<div class="start03-stage start03-door-stage"><img class="start03-door-room" src="assets/recovery/flur-v2-864-v1-e7d3476528.webp" alt=""><button type="button" data-tour-door class="start03-door" aria-label="Tür öffnen und zur Geschenkkarte gehen"><img src="assets/rooms/startseite-haustuer-v1.webp" alt="Eine geschlossene Tür im Haus der kleinen Wunder."></button><p role="status" data-tour-door-status>Berühre die Tür.</p></div>';
  if(index===3)return cardMarkup();
  if(index===4)return '<div class="start03-stage start03-help-stage"><button type="button" class="start03-question" data-tour-help aria-label="Hilfe ausprobieren" aria-expanded="false" aria-controls="start03-help-example">?</button><section id="start03-help-example" hidden><h3>Hilfe im Haus</h3><p>Das Fragezeichen öffnet die Hilfe zur Bedienung. Dort kannst du auch diese Einführung erneut starten und die Installationshilfe öffnen.</p></section></div>';
  const standalone=root.matchMedia?.('(display-mode: standalone)')?.matches||root.navigator?.standalone;
  return '<div class="start03-stage start03-install-stage"><img src="assets/icons/icon-192.png" alt="App-Symbol des Hauses der kleinen Wunder" width="112" height="112"><p>'+(standalone?'Dein Haus ist bereits als App geöffnet.':'Die Installationshilfe zeigt dir die passenden Schritte für deinen Browser. Du kannst das Haus auch direkt im Browser genießen.')+'</p><button type="button" data-tour-install>Installationshilfe öffnen</button></div>';
 }
 function updateLight(){
  if(!dialog?.open||index!==0)return;const on=root.EMFDHallLight?.value!==false,stage=dialog.querySelector('[data-tour-light]'),button=dialog.querySelector('[data-tour-lantern]'),image=dialog.querySelector('.start03-hall-preview');
  stage.dataset.tourLight=String(on);button.setAttribute('aria-pressed',String(on));button.setAttribute('aria-label',on?'Laterne ausschalten':'Laterne einschalten');image.src='assets/recovery/flur-v2-'+(on?'864-v1-e7d3476528':'dim-864-v1-5aba5b505b')+'.webp';image.alt=on?'Der Flur ist beleuchtet.':'Der Flur liegt im gedämpften Licht.';dialog.querySelector('[data-tour-light-status]').textContent=on?'Das Licht ist an.':'Das Licht ist aus.';
 }
 function turnCard(){
  if(index!==3||!dialog?.open)return;flipped=!flipped;const button=dialog.querySelector('[data-tour-card]');button.classList.toggle('is-flipped',flipped);button.setAttribute('aria-pressed',String(flipped));button.setAttribute('aria-label',flipped?'Geschenkkarte umdrehen – Vorderseite ansehen':'Geschenkkarte umdrehen – QR-Code ansehen');button.querySelector('.start03-card-front').setAttribute('aria-hidden',String(flipped));button.querySelector('.start03-card-back').setAttribute('aria-hidden',String(!flipped));dialog.querySelector('[data-tour-card-status]').textContent=flipped?'Die Rückseite: Der QR-Code führt dich zurück zum Haus.':'Die Vorderseite deiner Geschenkkarte.';
 }
 async function mountGram(token){
  try{
   const data=await root.EMFDMusicRoom.loadCatalog();if(token!==generation||index!==1||!dialog?.open)return;
   const theme=data.primaryItems.find(item=>!item.cardId),host=dialog.querySelector('[data-tour-gram]');
   host.innerHTML=root.EMFDMusicDevice.device(theme);host.querySelectorAll('[data-room-step],[data-room-repeat]').forEach(button=>button.remove());
   root.EMFDMusicDevice.bind(host,{items:[theme]});root.EMFDMusic.selectRoomTrack('theme');root.EMFDMusic.bindRoom(host);gramHost=host;
  }catch{if(token===generation&&dialog?.open){dialog.querySelector('[data-tour-gram]').innerHTML='<p role="status">Das Grammophon ist gerade nicht verfügbar. Du kannst es später im Musikzimmer ausprobieren.</p>';}}
 }
 function next(){if(index===2){openDoor();return;}if(index===steps.length-1){finish();return;}index++;render();}
 function openDoor(){
  const button=dialog.querySelector('[data-tour-door]');if(!button||button.disabled)return;button.disabled=true;button.classList.add('is-opening');dialog.querySelector('[data-tour-door-status]').textContent='Die Tür öffnet sich …';const token=generation;
  later(()=>{if(token===generation&&dialog?.open&&index===2){index=3;render();}},reduced()?40:850);
 }
 function render(){
  unmount();flipped=false;cardTouched=false;const [title,copy,nextLabel]=steps[index];
  dialog.innerHTML=`<header class="start03-tour-header"><button type="button" data-tour-back aria-label="Vorheriger Schritt" ${index===0?'disabled':''}><img src="assets/music-icons/arrow-left.svg" alt="" width="24" height="24"></button><span class="start02-step">${index+1} von ${steps.length}</span><button type="button" data-tour-finish aria-label="Einführung beenden und zum Flur" title="Zum Flur"><img src="assets/music-icons/door-open.svg" alt="" width="24" height="24"></button></header><div class="start03-tour-copy"><h2 id="start02-tutorial-title" tabindex="-1">${esc(title)}</h2><p>${esc(copy)}</p></div>${stage()}<div class="start03-tour-actions"><button type="button" class="primary" data-start02-tutorial-next>${esc(nextLabel)}</button></div>`;
  dialog.querySelector('[data-tour-back]').onclick=()=>{if(index>0){index--;render();}};dialog.querySelector('[data-tour-finish]').onclick=finish;dialog.querySelector('[data-start02-tutorial-next]').onclick=next;
  dialog.querySelector('[data-tour-lantern]')?.addEventListener('click',()=>root.EMFDHallLight?.set(root.EMFDHallLight.value===false));
  dialog.querySelector('[data-tour-door]')?.addEventListener('click',openDoor);
  dialog.querySelector('[data-tour-card]')?.addEventListener('click',()=>{cardTouched=true;turnCard();});
  dialog.querySelector('[data-tour-help]')?.addEventListener('click',event=>{const button=event.currentTarget,panel=dialog.querySelector('#start03-help-example');panel.hidden=!panel.hidden;button.setAttribute('aria-expanded',String(!panel.hidden));});
  dialog.querySelector('[data-tour-install]')?.addEventListener('click',()=>root.EMFDStart02?.showInstallHelp(false));
  dialog.scrollTop=0;dialog.querySelector('#start02-tutorial-title').focus({preventScroll:true});
  if(index===1)mountGram(generation);
  if(index===3){const token=generation;later(()=>{if(token===generation&&dialog?.open&&!cardTouched)turnCard();},reduced()?40:1200);}
 }
 function start(options){unmount();dialog=options.dialog;index=0;onFinish=options.onFinish;dialog.classList.add('start03-tour');render();dialog.oncancel=event=>{event.preventDefault();finish();};dialog.onclose=()=>unmount();if(!dialog.open)dialog.showModal();dialog.querySelector('#start02-tutorial-title').focus({preventScroll:true});}
 root.addEventListener('emfd:hall-light-change',updateLight);
 root.addEventListener('hashchange',()=>{if(dialog?.open){onFinish=null;unmount();dialog.close();}});
 root.EMFDStartTour=Object.freeze({start,giftURL,qrSVG,steps:steps.map(([title])=>title)});
})(globalThis);

/* Shared presentation only: existing links, routes and handlers are preserved. */
(function(){
 const markup=name=>'<img class="music04-icon" src="assets/music-icons/'+name+'.svg" alt="" aria-hidden="true" width="26" height="26">';
 function apply(){
   document.querySelectorAll('a.back[href="#flur"],a.back[href="#haus"],a.back[href="#musik"]').forEach(link=>{
     const room=link.getAttribute('href')==='#musik',name=room?'disc-3':'door-open',label=room?'Zurück zum Musikplayer':'Zurück zum Flur';
     if(link.hasAttribute('data-station-back')||link.dataset.contextIcon===name)return;
     link.dataset.contextIcon=name;link.classList.add('emfd-context-back');link.setAttribute('aria-label',label);link.title=label;link.innerHTML=markup(name);
   });
   document.querySelectorAll('#help-open,[data-music-help],[data-hall-help],[data-teezimmer-help],[data-atelier-help],button.help-open').forEach(button=>{
     if(button.dataset.contextHelp==='true')return;
     button.dataset.contextHelp='true';button.classList.add('emfd-context-help');if(!button.getAttribute('aria-label'))button.setAttribute('aria-label','Hilfe öffnen');button.title='Hilfe';button.setAttribute('aria-haspopup','dialog');button.textContent='?';
   });
 }
 let scheduled=false;const observer=new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;apply();});});
 observer.observe(document.body,{childList:true,subtree:true});apply();
})();

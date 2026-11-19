/* Shared presentation only: existing links, routes and handlers are preserved. */
(function(){

 function apply(){
   // EMFD-NAV-01: context back links keep arrow + target name (EMFDNavigation); doors are reserved for spatial transitions.

   document.querySelectorAll('#help-open,[data-music-help],[data-hall-help],[data-teezimmer-help],[data-atelier-help],button.help-open').forEach(button=>{
     if(button.dataset.contextHelp==='true')return;
     button.dataset.contextHelp='true';button.classList.add('emfd-context-help');if(!button.getAttribute('aria-label'))button.setAttribute('aria-label','Hilfe öffnen');button.title='Hilfe';button.setAttribute('aria-haspopup','dialog');button.textContent='?';
   });
 }
 let scheduled=false;const observer=new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;apply();});});
 observer.observe(document.body,{childList:true,subtree:true});apply();
})();

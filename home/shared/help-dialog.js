/* EMFD-ARCH-01: extends the existing help UI; fallback remains its original handler.
 * BOOK-01d: the general actions (Einführung, Geschenk, „Das Haus griffbereit“) stay visible in every help context. */
(function(){
 const opener=document.querySelector('#help-open'),dialog=document.querySelector('#help-dialog');if(!opener||!dialog)return;
 const originalOpen=opener.onclick,registry=window.EMFDHelp;
 const content=document.createElement('section');content.id='music04-help-content';content.hidden=true;dialog.append(content);
 let restore=[],headingBefore='',contextBefore='';
 opener.onclick=()=>{
   const entry=registry.resolve({route:location.hash,navigation:window.EMFDNavigation?.getContext()});
   if(!entry){originalOpen?.call(opener);return;}
   originalOpen?.call(opener);
   headingBefore=dialog.querySelector('#help-title').textContent;contextBefore=dialog.dataset.context;
   dialog.dataset.context=entry.id;dialog.querySelector('#help-title').textContent=entry.title;
   restore=[...dialog.children].filter(child=>!child.classList.contains('music-heading')&&!child.classList.contains('start02-help-actions')&&child!==content).map(child=>[child,child.hidden]);for(const [child] of restore)child.hidden=true;
   content.replaceChildren();for(const [title,text] of entry.sections){const h=document.createElement('h3'),p=document.createElement('p');h.textContent=title;p.textContent=text;content.append(h,p);}content.hidden=false;
 };
 dialog.addEventListener('close',()=>{content.hidden=true;for(const [child,hidden] of restore)child.hidden=hidden;if(restore.length){dialog.querySelector('#help-title').textContent=headingBefore;dialog.dataset.context=contextBefore;}restore=[];});
})();

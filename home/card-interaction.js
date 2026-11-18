(function(){
 const dialog=document.querySelector('#card-closeup'),area=dialog.querySelector('.closeup-stage'),closeButton=dialog.querySelector('.closeup-close');
 let active=null,home=null,oldSize=null,closing=false;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const calm=()=>reduced.matches||document.body.classList.contains('quiet');
 function fit(){
  if(!active)return;
  const viewport=window.visualViewport;
  const viewportWidth=viewport?.width||window.innerWidth;
  const viewportHeight=viewport?.height||window.innerHeight;
  dialog.style.setProperty('--closeup-viewport-height',viewportHeight+'px');
  const sourceImage=active.querySelector('.card-front img');
  const naturalRatio=sourceImage?.naturalWidth&&sourceImage?.naturalHeight?sourceImage.naturalWidth/sourceImage.naturalHeight:0;
  const ratio=naturalRatio||Number(active.dataset.ratio)||2/3;
  const availableWidth=Math.max(1,Math.min(area.clientWidth,viewportWidth)-64);
  const availableHeight=Math.max(1,Math.min(area.clientHeight,viewportHeight)-64);
  const width=Math.max(1,Math.min(availableWidth,availableHeight*ratio));
  active.style.width=width+'px';
  active.style.height=width/ratio+'px';
 }
 function travel(from,to,duration){if(calm()||!active?.animate)return Promise.resolve();return active.animate([{transform:`translate(${from.left-to.left}px,${from.top-to.top}px) scale(${from.width/to.width},${from.height/to.height})`,transformOrigin:'top left'},{transform:'none',transformOrigin:'top left'}],{duration,easing:'cubic-bezier(.2,.75,.25,1)'}).finished.catch(()=>{});}
 async function open(card){if(active||closing)return;const from=card.getBoundingClientRect();active=card;home=card.parentElement;oldSize=[card.style.width,card.style.height];cardSizer?.disconnect();document.body.classList.add('card-closeup-open');dialog.showModal();area.append(card);const front=card.querySelector(".card-front img"),back=card.querySelector(".card-back img");const id=card.querySelector("[data-card]")?.dataset.card;if(front&&id)front.src=window.EMFDImages.card(id,"card-detail-large");if(back)back.src=window.EMFDImages.back("card-detail-large");fit();card.focus({preventScroll:true});await travel(from,card.getBoundingClientRect(),340);}
 async function close(animate=true){if(!active||closing)return;closing=true;const card=active;card.dispatchEvent(new Event('cancel-card-tap'));const from=card.getBoundingClientRect();if(animate&&!calm()&&card.animate){const to=home.getBoundingClientRect();await card.animate([{transform:'none'},{transform:`translate(${to.left+(to.width-oldSize[0].replace('px',''))/2-from.left}px,${to.top-from.top}px) scale(${parseFloat(oldSize[0])/from.width})`,opacity:.85}],{duration:220,easing:'cubic-bezier(.3,0,.3,1)',fill:'none'}).finished.catch(()=>{});}const front=card.querySelector(".card-front img"),back=card.querySelector(".card-back img");const id=card.querySelector("[data-card]")?.dataset.card;if(front&&id)front.src=window.EMFDImages.card(id,"card-view");if(back)back.src=window.EMFDImages.back("card-view");home.prepend(card);card.style.width=oldSize[0];card.style.height=oldSize[1];active=null;dialog.close();document.body.classList.remove('card-closeup-open');closing=false;fitActiveCard();if(card.isConnected)card.focus({preventScroll:true});}
 closeButton.onclick=()=>close();dialog.addEventListener('cancel',e=>{e.preventDefault();close();});window.addEventListener('resize',fit);window.visualViewport?.addEventListener('resize',fit);window.addEventListener('hashchange',()=>close(false));
 window.EMFDCardView={open,toggle(card){if(active===card)close();else open(card);},isOpen(card){return active===card;},close};
 const help=document.querySelector('#help-dialog'),helpOpen=document.querySelector('#help-open');let helpReturn=helpOpen;helpOpen.onclick=()=>{const tea=location.hash==='#teezimmer'||location.hash==='#ort/P08';help.dataset.context=tea?'tea':'card';help.querySelector('#help-title').textContent=tea?'Im Teezimmer':'Deine Karte betrachten';const teaHelp=help.querySelector('#teezimmer-help-content');if(teaHelp)teaHelp.hidden=!tea;helpReturn=document.activeElement instanceof HTMLElement&&document.activeElement!==document.body?document.activeElement:helpOpen;document.querySelector('#help-zoom').disabled=!document.querySelector('main .held-card');if(!help.open)help.showModal();help.querySelector('button').focus();};help.querySelector('button').onclick=()=>help.close();document.querySelector('#help-zoom').onclick=()=>{const card=document.querySelector('main .held-card');if(card){help.close();open(card);}};help.addEventListener('close',()=>{if(helpReturn?.isConnected)helpReturn.focus({preventScroll:true});});window.addEventListener('hashchange',()=>{if(help.open)help.close();});
})();

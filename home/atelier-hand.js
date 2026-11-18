(function(root){
 let cleanup=()=>{};
 root.EMFDAtelierHand={attach(dialog){cleanup();const card=dialog.querySelector('.atelier-hand-card'),tilt=card.querySelector('.atelier-hand-tilt'),stage=card.parentElement,status=dialog.querySelector('[data-hand-status]');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let active=false,base=null,down=false,timer;
 const calm=()=>reduced.matches||document.body.classList.contains('quiet');
 const reset=()=>{tilt.style.transform='';};
 const fit=()=>{dialog.style.setProperty('--hand-vh',(visualViewport?.height||innerHeight)+'px');const w=Math.max(1,Math.min(stage.clientWidth-64,(stage.clientHeight-64)*7/12));card.style.width=w+'px';card.style.height=w*12/7+'px';};
 const apply=(x,y)=>{if(!calm())tilt.style.transform=`rotateX(${-y*5}deg) rotateY(${x*5}deg)`;};
 const receive=e=>{if(!active||down||calm()||!Number.isFinite(e.beta)||!Number.isFinite(e.gamma))return;clearTimeout(timer);if(!base)base={beta:e.beta,gamma:e.gamma};const p=root.EMFDHandy.offsets(e.beta,e.gamma,base,screen.orientation?.angle??root.orientation??0);apply(p.x,p.y);status.textContent='Neige dein Handy leicht.';};
 const stop=()=>{active=false;base=null;clearTimeout(timer);root.removeEventListener('deviceorientation',receive);reset();};
 const detachMotion=root.EMFDCardMotion.attach(card,apply,()=>calm()||!dialog.open);
 card.onpointerdown=e=>{down=true;card.setPointerCapture(e.pointerId);};card.onpointermove=e=>{if(!down)return;const r=card.getBoundingClientRect();apply(Math.max(-1,Math.min(1,(e.clientX-r.left)/r.width*2-1)),Math.max(-1,Math.min(1,(e.clientY-r.top)/r.height*2-1)));};card.onpointerup=card.onpointercancel=()=>{down=false;reset();};
 const visibility=()=>{if(document.hidden)stop();};const orientation=()=>{base=null;fit();};
 root.addEventListener('resize',fit);root.visualViewport?.addEventListener('resize',fit);root.addEventListener('orientationchange',orientation);document.addEventListener('visibilitychange',visibility);reduced.addEventListener('change',stop);dialog.addEventListener('close',()=>cleanup(),{once:true});fit();requestAnimationFrame(fit);
 cleanup=()=>{detachMotion();stop();root.removeEventListener('resize',fit);root.visualViewport?.removeEventListener('resize',fit);root.removeEventListener('orientationchange',orientation);document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',stop);};
 }};root.addEventListener('hashchange',()=>cleanup());
})(window);

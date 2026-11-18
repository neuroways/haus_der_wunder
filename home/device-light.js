/* Optionales lokales Sensorlicht. Keine Speicherung oder Übertragung. */
(function(root){
  function offsets(beta,gamma,base,angle=0){
    const wrap=n=>((n+180)%360+360)%360-180;
    const dx=wrap(gamma-base.gamma),dy=wrap(beta-base.beta),a=angle*Math.PI/180;
    return {x:Math.max(-1,Math.min(1,(dx*Math.cos(a)+dy*Math.sin(a))/22)),y:Math.max(-1,Math.min(1,(dy*Math.cos(a)-dx*Math.sin(a))/22))};
  }
  if(typeof module!=='undefined'&&module.exports)module.exports={offsets};
  if(!root.document)return;
  let cleanup=()=>{};
  root.EMFDHandy={offsets,stop(){cleanup();cleanup=()=>{};},pause(){},attach(card,tilt,gloss,isQuiet,reduced){
   this.stop();const stage=root.document.querySelector('#motion-settings');if(stage)stage.textContent='Karten reagieren auf Berührung und verfügbare Handybewegungen.';
   cleanup=root.EMFDCardMotion.attach(card,(x,y)=>{if(card.classList.contains('holding'))return;tilt.style.transform=`rotateX(${-y*4}deg) rotateY(${x*4}deg)`;gloss.style.transform=`translateX(${-20+x*28}%)`;},()=>isQuiet()||reduced.matches||Boolean(root.document.querySelector('dialog[open]:not(#card-closeup)')));
  }};
})(typeof window!=='undefined'?window:globalThis);

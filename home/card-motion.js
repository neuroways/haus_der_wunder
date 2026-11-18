/* Automatic, local card motion. Never requests a new sensor permission. */
(function(root){
 const mobile=()=>Boolean(root.navigator?.userAgentData?.mobile||((root.navigator?.maxTouchPoints||0)>0&&root.matchMedia?.('(pointer: coarse)').matches));
 const shown=new Set();
 function hint(){const kind=mobile()?'mobile':'desktop',key='emfd.card.motionHint.v1.'+kind;if(shown.has(key))return;try{if(localStorage.getItem(key)==='1')return;localStorage.setItem(key,'1');}catch{}shown.add(key);const note=document.createElement('p');note.className='card-motion-hint';note.setAttribute('role','status');note.textContent=kind==='mobile'?'Fass die Karte an und bewege sie leicht. Du kannst auch dein Handy neigen.':'Fass die Karte mit der Maus an und bewege sie leicht.';document.body.append(note);setTimeout(()=>{note.classList.add('is-leaving');setTimeout(()=>note.remove(),350);},5200);}
 async function available(){
  if(!mobile()||!root.isSecureContext||!root.DeviceOrientationEvent)return false;
  if(typeof root.DeviceOrientationEvent.requestPermission!=='function')return true;
  // iOS cannot read sensors without a user gesture. Never show a separate enable button.
  try{const permissions=root.navigator?.permissions;if(!permissions)return false;const result=await Promise.all(['accelerometer','gyroscope'].map(name=>permissions.query({name})));return result.every(item=>item.state==='granted');}catch{return false;}
 }

 function attach(card,apply,calm=()=>false){
  let alive=true,base=null,down=false,active=false,permissionRequested=false;
  hint();
  const reset=()=>{base=null;};
  const receive=e=>{if(!alive||down||calm()||document.hidden||!Number.isFinite(e.beta)||!Number.isFinite(e.gamma))return;if(!base)base={beta:e.beta,gamma:e.gamma};const p=root.EMFDHandy.offsets(e.beta,e.gamma,base,root.screen?.orientation?.angle??root.orientation??0);apply(p.x,p.y);};
  const enable=()=>{if(!alive||active)return;active=true;root.addEventListener('deviceorientation',receive,{passive:true});};
  const start=async()=>{if(await available())enable();};
  // On Safari the sensor permission must be requested during an existing user
  // gesture. Tapping the card is the gesture; there is no separate mode/button.
  const requestOnTouch=()=>{
   if(!mobile()||!root.isSecureContext||!root.DeviceOrientationEvent||active||permissionRequested)return;
   if(typeof root.DeviceOrientationEvent.requestPermission!=='function'){enable();return;}
   permissionRequested=true;
   try{const result=root.DeviceOrientationEvent.requestPermission();Promise.resolve(result).then(value=>{if(value==='granted')enable();}).catch(()=>{});}catch{}
  };
  const visibility=()=>{reset();if(!document.hidden)start();};
  const pointerDown=e=>{down=true;if(e.pointerType==='touch')requestOnTouch();};
  const pointerUp=()=>{down=false;reset();};
  card.addEventListener('pointerdown',pointerDown);
  card.addEventListener('pointerup',pointerUp);
  card.addEventListener('pointercancel',pointerUp);
  document.addEventListener('visibilitychange',visibility);
  root.addEventListener('orientationchange',reset);
  start();
  return ()=>{alive=false;root.removeEventListener('deviceorientation',receive);root.removeEventListener('orientationchange',reset);document.removeEventListener('visibilitychange',visibility);card.removeEventListener('pointerdown',pointerDown);card.removeEventListener('pointerup',pointerUp);card.removeEventListener('pointercancel',pointerUp);};
 }
 root.EMFDCardMotion={attach,mobile,available};
})(typeof window!=='undefined'?window:globalThis);

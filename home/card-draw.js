/* EMFD-CARD-BACK-01: neutral, session-scoped concealed random-card handoff. */
(function(root){
 const KEY='emfd.cardDraw.concealed';
 const validId=id=>/^O(?:0[1-9]|1\d|2[0-4])$/.test(id||'');
 const read=()=>{try{const value=JSON.parse(sessionStorage.getItem(KEY)||'null');return value&&validId(value.id)&&value.state==='concealed'?value:null;}catch{return null;}};
 const write=value=>{try{sessionStorage.setItem(KEY,JSON.stringify(value));}catch{}};
 const clear=()=>{try{sessionStorage.removeItem(KEY);}catch{}};
 function begin(id,returnTarget='#karten'){
   if(!validId(id))return false;
   write({id,state:'concealed',returnTarget:String(returnTarget||'#karten')});
   root.EMFDMusic?.concealCard?.();
   root.dispatchEvent?.(new CustomEvent('emfd:card-concealed'));
   location.hash='karte/verdeckt';
   return true;
 }
 function current(){return read();}
 function reveal(){const value=read();if(!value)return null;clear();return {...value,state:'revealed'};}
 function cancel(){const value=read();clear();return value;}
 root.EMFDCardDraw=Object.freeze({begin,current,reveal,cancel});
})(globalThis);

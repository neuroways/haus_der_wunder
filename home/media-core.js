/* Logical identities come from the archive manifest, never from a guessed card number. */
(function(root){
 function path(value){if(typeof value!=='string'||!/^(?:\.\.\/media\/|\/media\/|assets\/)[A-Za-z0-9_./%-]+\.(?:webp|png|jpeg|jpg)$/.test(value)||value.includes('/../'))return null;return value.startsWith('/media/')?'..'+value:value;}
 function groups(manifest){
  // Two supported archive layouts: the newer items[] metadata and the existing
  // media/manifest.json assets[]. Do not merge unlike room scenes by room ID.
  const map=new Map();
  function add(id,paths){
   const accepted=paths.map(path).filter(Boolean);
   if(!id||!accepted.length)return;
   const group=map.get(id)||{id,paths:[]};
   group.paths=[...new Set([...group.paths,...accepted])];map.set(id,group);
  }
  for(const item of manifest?.items||[]){
   add(item.id,[...(item.optimizedVariants||[]).map(v=>v.path),item.appCurrentPath,item.sourcePath,...(item.duplicatePaths||[])]);
  }
  for(const asset of manifest?.assets||[]){
   const src=String(asset.path||'');
   const card=asset.cardId&&/^O(?:0[1-9]|1\d|2[0-4])$/.test(asset.cardId)?asset.cardId:null;
   const start=src.match(/EMFD-START-02-(A0[1-6])-[A-Za-z0-9_-]+\.(?:webp|png|jpeg|jpg)$/i);
   if(card)add('card-'+card,[src]);
   else if(start)add('start02-'+start[1].toUpperCase(),[src]);
  }
  return [...map.values()];
 }
 function index(groups){const result=new Map();for(const group of groups)for(const p of group.paths)result.set(p,group);return result;}
 function candidates(request,lookup){const group=lookup.get(request);if(!group)return [request];const thumbnail=/\/playlist\//.test(request);const rank=p=>p.startsWith('assets/recovery/')?-1:/\/playlist\//.test(p)?9:/\/cards\/O\d+\.png$/.test(p)?0:/896x1536|1086-v/.test(p)?1:/630x1080|900-v/.test(p)?2:/210x360|480-v/.test(p)?3:1;return [request,...group.paths.filter(p=>p!==request&&(thumbnail||!/\/playlist\//.test(p))).sort((a,b)=>rank(a)-rank(b))];}
 const api={path,groups,index,candidates};if(typeof module!=='undefined')module.exports=api;else root.EMFDMediaCore=api;
})(globalThis);

/* EMFD-FIX01: prewarm the compact card overview images, not full-size originals.
 * Every candidate is kept within its logical media identity by EMFDMedia.
 * A failed URL never causes the whole house to become inaccessible.
 */
(function(root){
  const pending=new Map();
  let warmup=null,lastResult={downloaded:0,failed:[],total:0};
  function load(url){
    if(!url)return Promise.resolve(false);
    if(pending.has(url))return pending.get(url);
    const task=new Promise(resolve=>{
      if(typeof Image==='undefined'){resolve(false);return;}
      const image=new Image();let finished=false;
      const end=ok=>{if(finished)return;finished=true;clearTimeout(timer);image.onload=image.onerror=null;resolve(ok);};
      const timer=setTimeout(()=>end(false),12000);
      image.onload=()=>end(image.naturalWidth>0);
      image.onerror=()=>end(false);
      image.src=url;
    });
    pending.set(url,task);return task;
  }
  const candidate=async url=>{
    if(root.EMFDMedia){return Boolean(await root.EMFDMedia.resolve(url));}
    return load(url);
  };
  function initialize(){
    if(warmup)return warmup;
    const saveData=Boolean(root.navigator?.connection?.saveData);
    const urls=[root.EMFDImages?.back?.('card-overview')];
    if(!saveData)urls.push(...(root.CARDS||[]).map(card=>card.imageOverview||card.image).filter(Boolean));
    const unique=[...new Set(urls.filter(Boolean))];
    warmup=(async()=>{
      let cursor=0,downloaded=0;const failed=[];
      await Promise.all(Array.from({length:Math.min(3,unique.length)},async()=>{
        while(cursor<unique.length){
          const url=unique[cursor++];let ok=false;
          try{ok=await candidate(url);}catch{}
          if(ok)downloaded++;else failed.push(url);
        }
      }));
      lastResult={downloaded,failed,total:unique.length};
      return {...lastResult,failed:[...failed]};
    })();
    return warmup;
  }
  root.EMFDCardAssets=Object.freeze({
    get ready(){return initialize();},
    initialize,
    get status(){return {...lastResult,failed:[...lastResult.failed]};},
    hydrate(image){return root.EMFDMedia?.hydrate(image)||Promise.resolve(false);},
    repair(url){pending.delete(url);return root.EMFDMedia?root.EMFDMedia.resolve(url).then(Boolean):load(url);},
    retry(){pending.clear();warmup=null;root.EMFDMedia?.retry?.();return initialize();}
  });
  // Start background warming after the initial document has rendered; allow
  // first content and door art to take network priority.
  const schedule=()=>root.setTimeout(()=>initialize().catch(()=>{}),900);
  const doc=root.document;
  if(!doc)return;
  if(doc.readyState==='complete')schedule();else root.addEventListener?.('load',schedule,{once:true});
})(globalThis);

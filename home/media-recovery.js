/* Same-image recovery from the media archive. No full-gallery preloading. */
(function(root){
 const core=root.EMFDMediaCore;if(!core||!root.document)return;
 const base=document.baseURI,requests=new Map(),reports=new Map(),bypass=new WeakSet(),attempted=new WeakMap();
 let catalog=root.EMFDMediaCatalog||{groups:[],checked:{}},lookup=core.index(catalog.groups);
 const key=value=>{try{const u=new URL(value,base),b=new URL('../media/',base);if(u.origin!==b.origin)return null;if(u.pathname.startsWith(b.pathname))return '../media/'+u.pathname.slice(b.pathname.length);const a=new URL('assets/',base);return u.pathname.startsWith(a.pathname)?'assets/'+u.pathname.slice(a.pathname.length):null;}catch{return null;}};
 const update=data=>{const map=new Map(catalog.groups.map(g=>[g.id,g]));for(const g of data.groups||[])map.set(g.id,{...g,paths:[...new Set([...(map.get(g.id)?.paths||[]),...g.paths])]});catalog={...catalog,...data,groups:[...map.values()],checked:{...catalog.checked,...data.checked}};lookup=core.index(catalog.groups);};
 const fetchJSON=async url=>{const c=new AbortController(),timer=setTimeout(()=>c.abort(),6000);try{const r=await fetch(url,{cache:'no-cache',signal:c.signal});if(!r.ok)throw Error('catalog');return await r.json();}finally{clearTimeout(timer);}};
 const ready=Promise.resolve();
 // Refresh logical identities only; the archive's existence is not a load guarantee.
 ready.then(()=>fetchJSON('../media/manifest.json').then(m=>update({groups:core.groups(m)})).catch(()=>{}));
 function load(url){return new Promise(resolve=>{const image=new Image();let done=false;const end=ok=>{if(done)return;done=true;clearTimeout(timer);image.onload=image.onerror=null;resolve(ok);};const timer=setTimeout(()=>end(false),7000);image.onload=()=>end(image.naturalWidth>0);image.onerror=()=>end(false);image.src=url;});}
 async function resolve(source,skipFirst=false){
  await ready;const original=key(source);if(!original)return null;
  const cacheKey=original+'|'+skipFirst;if(requests.has(cacheKey))return requests.get(cacheKey);
  const task=(async()=>{let choices=core.candidates(original,lookup);if(skipFirst)choices=choices.filter(p=>p!==original);choices=choices.filter(Boolean).sort((a,b)=>(catalog.checked[a]===404?1:0)-(catalog.checked[b]===404?1:0));
   for(const candidate of choices){if(await load(new URL(candidate,base).href)){reports.set(original,{requested:original,resolved:candidate,state:'loaded'});return candidate;}}
   // One network retry, bypassing a transient HTTP error or stale intermediary.
   const retry=new URL(original,base);retry.searchParams.set('emfd_retry','1');if(await load(retry.href)){reports.set(original,{requested:original,resolved:original,state:'loaded-after-retry'});return retry.href;}
   reports.set(original,{requested:original,resolved:null,state:'unavailable'});return null;
  })();requests.set(cacheKey,task);const result=await task;if(!result)requests.delete(cacheKey);return result;
 }
 async function recover(image,event){
  const source=image.getAttribute('src'),original=key(source);if(!original||!lookup.has(original)||bypass.has(image))return;
  event?.stopImmediatePropagation();if(attempted.get(image)===source)return;attempted.set(image,source);
  const target=await resolve(source,true);if(!image.isConnected)return;
  if(target){image.dataset.emfdOriginalSrc=original;image.src=new URL(target,base).href;image.hidden=false;return;}
  bypass.add(image);image.dispatchEvent(new Event('error'));bypass.delete(image);
 }
 document.addEventListener('error',event=>{if(event.target?.tagName==='IMG')recover(event.target,event);},true);
 document.addEventListener('load',event=>{const image=event.target;if(image?.tagName!=='IMG')return;const k=key(image.dataset.emfdOriginalSrc||image.getAttribute('src'));if(k)reports.set(k,{requested:k,resolved:key(image.currentSrc||image.src),state:'loaded'});},true);
 root.addEventListener('online',()=>{requests.clear();document.querySelectorAll('img').forEach(image=>{if(image.complete&&!image.naturalWidth){attempted.delete(image);recover(image);}});});
 root.EMFDMedia=Object.freeze({ready,resolve,key,report:()=>[...reports.values()],async hydrate(image){if(!image)return false;if(!image.complete||image.naturalWidth)return Boolean(image.naturalWidth);const source=image.dataset.emfdOriginalSrc||image.getAttribute('src');const target=await resolve(source);if(!target||!image.isConnected)return false;image.src=new URL(target,base).href;image.hidden=false;return true;},retry(){requests.clear();}});
})(globalThis);

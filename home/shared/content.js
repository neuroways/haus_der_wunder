/* EMFD-ARCH-01: single in-memory data access. Source JSON remains authoritative. */
(function(root){
 'use strict';
 const cardIds=Object.freeze(Array.from({length:24},(_,index)=>'O'+String(index+1).padStart(2,'0')));
 const valid=id=>cardIds.includes(id);
 function freeze(value){if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
 function createContent({fetch,expand}){
   const requests=new Map();
   function json(path){
     if(!requests.has(path))requests.set(path,Promise.resolve().then(()=>fetch(path)).then(response=>{if(!response.ok)throw Error('EMFD content unavailable: '+path);return response.json();}).then(freeze).catch(error=>{requests.delete(path);throw error;}));
     return requests.get(path);
   }
   let catalogPromise=null,storiesPromise=null;
   function music(){
     if(!catalogPromise)catalogPromise=Promise.all([json('playlist-catalog.json?v=0.6.69'),json('music-discovery.json?v=music04')]).then(([catalog,metadata])=>{
       const primaryItems=catalog.items.map(item=>({...item,music:metadata.items.find(info=>info.id===(item.cardId||'theme'))||{styles:[],instruments:[],description:'',coverPath:item.media.imagePath}}));
       const items=expand(primaryItems,metadata.variantItems||[]);
       return freeze({...catalog,primaryItems,items,playerItems:items});
     }).catch(error=>{catalogPromise=null;throw error;});
     return catalogPromise;
   }
   function compositions(){
     if(!storiesPromise)storiesPromise=Promise.all([json('composition-stories.json'),json('composition-story-media.json?v=0.6.51'),json('music-discovery.json?v=music04')]).then(([catalog,media,metadata])=>{
       if(catalog.stories.length!==24||new Set(catalog.stories.map(s=>s.cardId)).size!==24||catalog.stories.some(s=>!valid(s.cardId)))throw Error('Invalid composition identities');
       return freeze({catalog,media:{...media,coverPaths:Object.fromEntries(metadata.items.filter(item=>valid(item.id)).map(item=>[item.id,item.coverPath]))}});
     }).catch(error=>{storiesPromise=null;throw error;});
     return storiesPromise;
   }
   async function cardForEntry(id){if(valid(id))return id;const data=await music();return data.items.find(item=>(item.entryId||item.cardId||'theme')===id)?.cardId||null;}
   async function story(id){const cardId=await cardForEntry(id);if(!cardId)return null;const data=await compositions();return data.catalog.stories.find(item=>item.cardId===cardId)||null;}
   async function musicForCard(id){if(!valid(id))return null;const [map,manifest]=await Promise.all([json('card-music-map.json'),json('music-manifest.json?v=0.6.69-audio')]);const assetId=map.cards?.[id];return manifest.tracks.find(track=>track.assetId===assetId)||null;}
   async function musicSources(){const [manifest,map]=await Promise.all([json('music-manifest.json?v=0.6.69-audio'),json('card-music-map.json')]);return {tracks:manifest.tracks,cards:map.cards||{}};}
   return Object.freeze({version:1,cardIds,isCardId:valid,music,compositions,story,cardForEntry,musicForCard,musicSources,musicManifest:()=>json('music-manifest.json?v=0.6.69-audio'),cardMusicMap:()=>json('card-music-map.json'),storyRoute:id=>valid(id)?'#musik/geschichten/'+id:null});
 }
 if(typeof module!=='undefined')module.exports={createContent,cardIds};else root.EMFDContent=createContent({fetch:(...args)=>root.fetch(...args),expand:(...args)=>root.EMFDMusicDiscovery.expand(...args)});
})(globalThis);

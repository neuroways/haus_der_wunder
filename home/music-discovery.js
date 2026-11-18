/* Pure helpers shared by the gallery and its tests. */
(function(root){
 const id=item=>item.entryId||item.cardId||'theme';
 function expand(items,variants=[]){return items.flatMap(item=>item.variants?.length>1?[{...item,versionLabel:'Aufnahme der Sammlung'},...item.variants.map(variant=>{const info=variants.find(x=>x.id===variant.id)||{styles:[],instruments:[],description:variant.label};return {...item,entryId:variant.id,variantId:variant.id,versionLabel:variant.label,audioAssetId:variant.audioAssetId,music:{...item.music,...info,coverPath:item.music.coverPath}};})]:[item]);}
 function filter(items,{category='Alle',style='',instrument=''}={}){return items.filter(item=>(category==='Alle'||(category==='Main Theme'?id(item)==='theme':item.category===category))&&(!style||(item.music?.styles||[]).includes(style))&&(!instrument||(item.music?.instruments||[]).includes(instrument)));}
 function step(index,delta,length){return length?(Math.max(0,index)+delta+length)%length:0;}
 function swipe(dx,dy){return Math.abs(dx)>=48&&Math.abs(dx)>Math.abs(dy)*1.4?(dx<0?1:-1):0;}
 const api={id,filter,step,swipe,expand};if(typeof module!=='undefined')module.exports=api;else root.EMFDMusicDiscovery=api;
})(globalThis);

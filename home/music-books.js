/* Adapter: original composition prose -> the existing library and book reader. */
(function(root){
 function createBook(story,cover){
   const paragraphs=story.body.split(/\n\n+/).filter(Boolean),pages=[];let page=[],length=0;
   for(const paragraph of paragraphs){if(page.length&&(length+paragraph.length>1100||page.length>=4)){pages.push(page);page=[];length=0;}page.push(paragraph);length+=paragraph.length;}if(page.length)pages.push(page);
   return {id:'composition-'+story.cardId,label:story.category,title:story.title,image:{src:cover,alt:'Originalkarte zu '+story.title},sections:pages.map((paragraphs,index)=>({title:index?story.title+' · '+(index+1):story.title,paragraphs}))};
 }
 function openStory(story,cover,trigger){root.EMFDOriginStory?.open({trigger,title:story.title,theme:'music',collectionLabel:'Kompositionsgeschichten ',pageNavigation:true,books:[createBook(story,cover)]});}
 async function mount(host,stories,media,selectedId){
   const {mountLibrary}=await import('./library/library.js');if(!host.isConnected)return null;
   const cover=story=>media.coverPaths?.[story.cardId]||root.EMFDImages.card(story.cardId,'card-view');
   const books=stories.stories.map(story=>({id:story.cardId,title:story.title,subtitle:story.subtitle,description:story.subtitle,category:story.category,status:'bestand',statusText:'Kompositionsgeschichte',theme:'music',symbol:'',cover:cover(story),iconSrc:'assets/music-icons/book-open.svg',chapters:createBook(story,cover(story)).sections.map(section=>({title:section.title,description:story.subtitle,stage:'existing'}))}));
   const api=mountLibrary(host,{books,embedded:true,openOnSelect:true,selectedId,heading:'Kompositions­geschichten',eyebrow:'Geschichten aus Klang',intro:'Nimm ein Buch aus dem Regal und entdecke die Geschichte hinter der Musik.',hideEditorialNote:true,hideFooter:true,roomImage:'assets/recovery/musikzimmer-v1-865-v1-518f76f8bb.webp',onOpenBook(book,trigger){const story=stories.stories.find(item=>item.cardId===book.id);openStory(story,cover(story),trigger);return true;}});
   return {destroy:()=>api.destroy(),open(id){api.openBook(id,host.querySelector('[data-action="select"][data-book="'+id+'"]'));}};
 }
 const api={createBook,openStory,mount};if(typeof module!=='undefined')module.exports=api;else root.EMFDMusicBooks=api;
})(globalThis);

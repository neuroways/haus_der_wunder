/* EMFD-ARCH-01: reader commands, never queries a station's DOM. */
(function(root){
 'use strict';
 const books=Object.freeze({
   weltenweberin:Object.freeze({bookIds:['idee','character_worldweaver'],title:'Das Buch der Weltenweberin',theme:'weaver'}),
   klangwelten:Object.freeze({bookIds:['musik'],title:'Wie ich Welten aus Klang erschaffe',theme:'music'})
 });
 function openBook(id,trigger){const book=books[id];if(!book||!root.EMFDOriginStory?.open)return false;root.EMFDOriginStory.open({...book,bookIds:[...book.bookIds],trigger});return true;}
 let request=0;
 async function openComposition(id,trigger){
   const token=++request,routeId=root.EMFDNavigation?.getContext().id;
   const active=()=>token===request&&routeId===root.EMFDNavigation?.getContext().id&&trigger?.isConnected!==false;
   const story=await root.EMFDContent.story(id);if(!story||!root.EMFDMusicBooks||!root.EMFDOriginStory?.open)return false;
   // Ignore a late response after navigation or the originating view's removal.
   if(!active())return false;
   const data=await root.EMFDContent.compositions();if(!active())return false;
   root.EMFDMusicBooks.openStory(story,data.media.coverPaths[story.cardId],trigger);return true;
 }
 const api=Object.freeze({version:1,openBook,openComposition});
 if(typeof module!=='undefined')module.exports={books};else root.EMFDReaders=api;
})(globalThis);

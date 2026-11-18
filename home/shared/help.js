/* EMFD-ARCH-01: contextual content registry; the existing help dialog renders it. */
(function(root){
 'use strict';
 function createHelpRegistry(){
   const entries=new Map();
   return Object.freeze({version:1,
     register(id,{matches,title,sections,priority=0}){
       if(entries.has(id))throw Error('Duplicate help context: '+id);
       if(typeof matches!=='function'||typeof title!=='string'||!Array.isArray(sections))throw TypeError('Invalid help context');
       const entry=Object.freeze({id,matches,title,priority,sections:Object.freeze(sections.map(pair=>Object.freeze([...pair])))});
       entries.set(id,entry);return ()=>{if(entries.get(id)===entry)entries.delete(id);};
     },
     resolve(context){return [...entries.values()].sort((a,b)=>b.priority-a.priority).find(entry=>entry.matches(context))||null;},
     list:()=>Object.freeze([...entries.keys()])});
 }
 if(typeof module!=='undefined')module.exports={createHelpRegistry};else root.EMFDHelp=createHelpRegistry();
})(globalThis);

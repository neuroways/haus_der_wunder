/* EMFD-ARCH-01: station lifecycle. Providers own only the host handed to them. */
(function(root){
 'use strict';
 function createStations(){
   const providers=new Map(),active=new Map();
   function leave(host){const record=active.get(host);if(!record)return;active.delete(host);record.provider.leave(host);}
   function leaveAll(){for(const host of [...active.keys()])leave(host);}
   return Object.freeze({version:1,
     register(id,provider){if(providers.has(id))throw Error('Duplicate station: '+id);if(typeof provider.render!=='function'||typeof provider.leave!=='function')throw TypeError('Invalid station provider');providers.set(id,Object.freeze({...provider}));},
     render(id,host,options={}){const provider=providers.get(id);if(!provider)throw Error('Unknown station: '+id);leave(host);const record={provider};active.set(host,record);try{const result=provider.render(host,options);if(result?.then)return result.catch(error=>{if(active.get(host)===record)leave(host);throw error;});return result;}catch(error){if(active.get(host)===record)leave(host);throw error;}},
     leave,leaveAll,list:()=>Object.freeze([...providers.keys()])});
 }
 if(typeof module!=='undefined')module.exports={createStations};else root.EMFDStations=createStations();
})(globalThis);

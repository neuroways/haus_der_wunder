/* EMFD-ARCH-01: read-only state and commands; the legacy controller is sole owner. */
(function(root){
 'use strict';
 function createAudioPort(){
   let owner=null;const listeners=new Set();
   function snapshot(){
     const s=owner?.session,t=s?.track;
     return Object.freeze({version:1,ready:Boolean(owner?.ready),state:s?.state||'silent',pending:Boolean(s?.pending),
       track:t?Object.freeze({assetId:t.assetId||null,cardId:t.cardId||null,entryId:owner.roomTrackId,title:t.title,path:t.path}):null,
       entryId:owner?.roomTrackId||'theme',volume:s?.volume??0.7,enabled:Boolean(owner?.enabled),globalSilence:Boolean(owner?.globalSilence),
       repeat:owner?.roomMode||'track',queue:Object.freeze([...(owner?.roomQueue||[])]),recordPlaced:Boolean(owner?.recordPlaced),message:s?.message||'Stille',
       // EMFD-PLAYER-01: who started the current track ({source,deviceId,roomId} or null).
       context:owner?.playContext||null});
   }
   function publish(){const value=snapshot();for(const listener of [...listeners]){try{listener(value);}catch(error){root.console?.error(error);}}return value;}
   function command(name,value){
     if(!owner)return false;
     switch(name){
       case 'play':return owner.startPlayback();
       case 'pause':return owner.pausePlayback();
       case 'stop':return owner.stopPlayback();
       case 'next':return owner.stepRoomTrack(1);
       case 'previous':return owner.stepRoomTrack(-1);
       case 'repeat':return owner.setRoomMode(value);
       case 'volume':if(!Number.isFinite(value)||value<0||value>1)return false;owner.setPlaybackVolume(value);return true;
       case 'silence':return owner.chooseSilence();
       default:return false;
     }
   }
   return Object.freeze({version:1,snapshot,publish,command,
     attach(controller){if(owner&&owner!==controller)throw Error('EMFD audio owner already attached');owner=controller;publish();},
     select:(id,options)=>owner?.selectRoomTrack(id,options)||false,
     playlist:(ids,options)=>owner?.startRoomPlaylist(ids,options)||false,
     availability:id=>owner?.availability(id)||'checking',
     subscribe(listener){listeners.add(listener);listener(snapshot());return ()=>listeners.delete(listener);}});
 }
 if(typeof module!=='undefined')module.exports={createAudioPort};else root.EMFDAudio=createAudioPort();
})(globalThis);

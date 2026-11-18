/* P0-U01.3: one user-controlled audio session, independent of card rendering. */
(function(root){
class AudioSession {
 constructor(createAudio,onChange=()=>{}){this.createAudio=createAudio;this.onChange=onChange;this.audio=null;this.media=null;this.listeners=[];this.track=null;this.state='silent';this.message='Stille';this.epoch=0;this.volume=0.7;this.pending=false;}
 emit(){this.onChange(this);}
 retire(){this.epoch++;this.pending=false;const old=this.audio;this.audio=null;for(const [type,fn] of this.listeners)old?.removeEventListener(type,fn);this.listeners=[];if(old){old.pause();old.removeAttribute('src');old.load();}}
 select(track){this.retire();this.track=track;if(!track){this.state='silent';this.message='Stille';this.emit();return;}this.prepare();}
 prepare(){const a=this.media||(this.media=this.createAudio()),token=this.epoch;const listen=(type,fn)=>{a.addEventListener(type,fn);this.listeners.push([type,fn]);};this.audio=a;a.preload='metadata';a.loop=Boolean(this.track?.loop);a.autoplay=false;a.volume=this.volume;a.src=this.track.path;this.state='preparing';this.message='Musik wird vorbereitet. Sie startet erst mit Start.';
 const active=()=>this.audio===a&&this.epoch===token;
 listen('loadedmetadata',()=>{if(active()&&this.state==='preparing'){this.state='ready';this.message='Bereit – mit Start abspielen.';this.emit();}});
 listen('playing',()=>{if(active()&&(this.pending||this.state==='playing')){this.state='playing';this.message='Musik läuft.';this.emit();}});
 listen('waiting',()=>{if(active()&&(this.pending||this.state==='playing')){this.message='Musik lädt nach …';this.emit();}});
 listen('ended',()=>{if(!active())return;if(a.loop){a.currentTime=0;this.pending=true;this.state='starting';this.message='Die Hintergrundmusik wird wiederholt …';this.emit();Promise.resolve(a.play()).then(()=>{if(!active())return;this.pending=false;this.state='playing';this.message='Hintergrundmusik läuft in Dauerschleife.';this.emit();}).catch(()=>{if(!active())return;this.pending=false;this.state='error';this.message='Die Hintergrundmusik konnte nicht erneut gestartet werden. Tippe auf Start.';this.emit();});return;}this.pending=false;this.state='ended';this.message='Musikstück beendet. Kein automatischer Neustart.';this.emit();});
 listen('error',()=>{if(active()){this.pending=false;this.state='error';this.message='Die Musik konnte nicht geladen werden. Prüfe die Verbindung und die Audiodatei: '+this.track.path+'';this.emit();}});
 a.load();this.emit();}
 async play(){if(!this.track||this.pending||this.state==='playing')return;if(!this.audio||this.state==='error'){this.retire();this.prepare();}const a=this.audio,token=this.epoch;this.pending=true;this.state='starting';this.message='Wiedergabe wird gestartet …';this.emit();
 try{await a.play();if(this.audio!==a||token!==this.epoch){return;}this.pending=false;this.state='playing';this.message='Musik läuft.';this.emit();}
 catch(e){if(this.audio!==a||token!==this.epoch)return;this.pending=false;a.pause();this.state='error';this.message=e.name==='NotAllowedError'?'Der Browser hat den Start verhindert. Tippe erneut auf Start.':'Die Musik konnte nicht abgespielt werden. Prüfe die Verbindung oder wähle ein anderes Stück.';this.emit();}}
 pause(){if(!this.audio)return;if(this.pending){this.stop();return;}this.audio.pause();this.state='paused';this.message='Pausiert – mit Fortsetzen weiterspielen.';this.emit();}
 stop(){this.retire();this.state=this.track?'stopped':'silent';this.message=this.track?'Gestoppt – mit Start von vorne abspielen.':'Stille';this.emit();}
 setVolume(value){this.volume=Math.min(1,Math.max(0,Number(value)));if(this.audio)this.audio.volume=this.volume;this.emit();}
}
if(typeof module!=='undefined')module.exports=AudioSession;else root.EMFDAudioSession=AudioSession;
})(globalThis);

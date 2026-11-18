(function(root){
class CardTap {
 constructor(single,double,delay=320,schedule=setTimeout,unschedule=clearTimeout){this.single=single;this.double=double;this.delay=delay;this.schedule=schedule;this.unschedule=unschedule;this.timer=null;}
 cancel(){if(this.timer!==null)this.unschedule(this.timer);this.timer=null;}
 tap(keyboard=false){if(keyboard){this.cancel();this.single();return;}if(this.timer!==null){this.cancel();this.double();return;}this.timer=this.schedule(()=>{this.timer=null;this.single();},this.delay);}
}
if(typeof module!=='undefined')module.exports=CardTap;else root.EMFDCardTap=CardTap;
})(globalThis);

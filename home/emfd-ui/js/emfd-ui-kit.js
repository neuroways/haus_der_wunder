/* EMFD UI v0.4 · Klassischer Einstieg der gemeinsamen Bedienbibliothek (BOOK-01d / EMFD-UX-TUT-02).
 * Liefert Icons und Markup der einheitlichen Bedienelemente für Skripte ohne ES-Module (Szenen, Eingang).
 * emfd-ui.js (ES-Modul) nutzt dieselben Icons. Referenz aller Komponenten: emfd-ui/referenz.html.
 * Keine Ereignisse, kein Zustand: nur Markup mit echten Buttons, Beschriftungen und ARIA-Zuständen. */
(function(root){
  'use strict';
  const ICONS=Object.freeze({
    house:'<path d="M3 11 12 3l9 8v10h-7v-7h-4v7H3z"/>',
    cards:'<rect x="5" y="4" width="13" height="17" rx="1.5"/><path d="M9 2h10a2 2 0 0 1 2 2v13M11.5 9l1 2.5L15 12l-2.5 1-.5 2-1-2-2-.5 2-.8z"/>',
    music:'<path d="M9 18V5l12-2v13M9 9l12-2"/><ellipse cx="6" cy="18" rx="3" ry="2"/><ellipse cx="18" cy="16" rx="3" ry="2"/>',
    help:'<circle cx="12" cy="12" r="10"/><path d="M9 9a3 3 0 1 1 5 2c-2 1-2 2-2 4m0 3v.5"/>',
    close:'<path d="M6 6l12 12M18 6 6 18"/>',
    'chevron-left':'<path d="m15 4-8 8 8 8"/>',
    'chevron-right':'<path d="m9 4 8 8-8 8"/>',
    'arrow-left':'<path d="M20 12H5m6-6-6 6 6 6"/>',
    turn:'<path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3"/><path d="M18 2v5h-5M6 22v-5h5"/>',
    list:'<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/>',
    light:'<path d="M9 18h6m-5 3h4M9 16c0-2-4-4-4-8a7 7 0 0 1 14 0c0 4-4 6-4 8z"/>',
    bell:'<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    letter:'<rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="m3 7 9 6 9-6"/>',
    door:'<path d="M5 21V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v17M3 21h18"/><circle cx="15" cy="12" r="1"/>',
    play:'<path d="M7 4v16l13-8z"/>',
    pause:'<path d="M8 4v16M16 4v16"/>',
    stop:'<rect x="6" y="6" width="12" height="12" rx="1"/>',
    star:'<path d="m12 2 2.1 7.9L22 12l-7.9 2.1L12 22l-2.1-7.9L2 12l7.9-2.1z"/>',
    book:'<path d="M12 6C9 4 5 4 2 5v15c3-1 7-1 10 1 3-2 7-2 10-1V5c-3-1-7-1-10 1zm0 0v15"/>',
    compass:'<circle cx="12" cy="12" r="10"/><path d="m15 9-2 6-4 1 2-6z"/>',
    idea:'<path d="M9 18h6m-5 3h4M9 16c0-2-4-4-4-8a7 7 0 0 1 14 0c0 4-4 6-4 8z"/>',
    download:'<path d="M12 3v12m-5-5 5 5 5-5M5 21h14"/>',
    plant:'<path d="M12 21V11M12 16C5 16 3 12 4 8c6 0 8 3 8 8zm0-5c0-6 3-8 8-8 1 5-2 8-8 8z"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M10 2h4l1 3 2 1 3-1 2 4-2 2v2l2 2-2 4-3-1-2 1-1 3h-4l-1-3-2-1-3 1-2-4 2-2v-2L2 9l2-4 3 1 2-1z"/>'
  });
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const attrs=map=>Object.entries(map||{}).filter(([,v])=>v!==undefined&&v!==null&&v!==false).map(([k,v])=>v===true?` ${k}`:` ${k}="${esc(v)}"`).join('');
  function icon(name){
    if(!Object.hasOwn(ICONS,name))throw Error('Unknown EMFD icon: '+name);
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;
  }
  /** Textbutton. variant: primary | secondary; size: compact (Hinweise, Paneele) oder regulär. */
  function button({label,variant='secondary',iconName,compact=true,data,type='button',disabled=false,className=''}){
    const cls=`emfd-button emfd-button--${variant}${compact?' emfd-button--compact':''} emfd-button--no-arrow${iconName?'':' emfd-button--iconless'}${className?' '+className:''}`;
    return `<button${attrs({type,class:cls,disabled,...data})}>${iconName?icon(iconName).replace('<svg','<svg class="emfd-button__icon"'):''}<span class="emfd-button__label">${esc(label)}</span></button>`;
  }
  /** Iconbutton (48×48) mit Pflicht-Beschriftung; pressed=true/false macht ihn zum Schalter. */
  function iconButton({label,iconName,data,pressed,quiet=false,className=''}){
    if(!label)throw TypeError('Iconbutton braucht eine Beschriftung');
    return `<button${attrs({type:'button',class:`emfd-iconbutton${quiet?' emfd-iconbutton--quiet':''}${className?' '+className:''}`,'aria-label':label,title:label,'aria-pressed':pressed===undefined?undefined:String(pressed),...data})}>${icon(iconName)}</button>`;
  }
  function textButton({label,data}){return `<button${attrs({type:'button',class:'emfd-textbutton',...data})}>${esc(label)}</button>`;}
  /** Bild-Hotspot: rect normalisiert (0–1) relativ zum Bildmaster. */
  function hotspot({id,label,rect,pressed,data}){
    const style=`left:${(rect.x*100).toFixed(3)}%;top:${(rect.y*100).toFixed(3)}%;width:${(rect.w*100).toFixed(3)}%;height:${(rect.h*100).toFixed(3)}%`;
    return `<button${attrs({type:'button',class:'emfd-hotspot','data-hotspot':id,'aria-label':label,'aria-pressed':pressed===undefined?undefined:String(pressed),style,...data})}><span class="emfd-hotspot__label">${esc(label)}</span></button>`;
  }
  /** Kontextbezogener Hinweis (höchstens einer gleichzeitig). actions: [{label,variant,data}] */
  function hint({id,title,text,actions=[],placement='bottom',closeLabel='Hinweis schließen'}){
    return `<section class="emfd-hint emfd-hint--${placement}" role="region" aria-live="polite" aria-labelledby="emfd-hint-title" data-hint="${esc(id)}" tabindex="-1">`+
      `<button type="button" class="emfd-hint__close" data-hint-close aria-label="${esc(closeLabel)}">${icon('close')}</button>`+
      `<h2 class="emfd-hint__title" id="emfd-hint-title">${esc(title)}</h2><p class="emfd-hint__text">${esc(text)}</p>`+
      (actions.length?`<div class="emfd-hint__actions">${actions.map(a=>a.text?textButton(a):button({...a,compact:true})).join('')}</div>`:'')+`</section>`;
  }
  function turnButton({side,label}){
    return `<button type="button" class="emfd-turn emfd-turn--${side}" data-scene-turn="${side}" aria-label="${esc(label)}">${icon('turn')}<span>Umdrehen</span></button>`;
  }
  function dots({count=3,current=1,labels=['Links','Mitte','Rechts']}){
    return `<div class="emfd-dots" role="group" aria-label="Bildausschnitt">${Array.from({length:count},(_,i)=>`<button type="button" data-scene-segment="${i}" aria-label="${esc(labels[i]||String(i+1))}"${i===current?' aria-current="true"':''}></button>`).join('')}</div>`;
  }
  const api=Object.freeze({version:'0.4',icons:ICONS,icon,button,iconButton,textButton,hotspot,hint,turnButton,dots,escape:esc});
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.EMFDUIKit=api;
})(typeof globalThis!=='undefined'?globalThis:this);

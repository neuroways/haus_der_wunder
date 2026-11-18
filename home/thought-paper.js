/* EMFD-NOTE-01 · private, in-memory thought paper. No remote calls or storage. */
(function(root){
'use strict';
let dialog=null, state=null, opener=null, pending=false;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nowDate=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');};
const dateDisplay=s=>/^\d{4}-\d{2}-\d{2}$/.test(s)?`${s.slice(8)}.${s.slice(5,7)}.${s.slice(0,4)}`:s;
const slug=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,65);
function context(config){
 if(config.mode==='card'){
  const c=(root.CARDS||[]).find(c=>c.id===config.cardId);
  if(!c||!/^O(?:0[1-9]|1\d|2[0-4])$/.test(c.id))throw Error('Ungültige Karte');
  return {mode:'card',id:c.id,name:c.name,group:c.group,question:c.question||'',image:c.imageDetail||c.image||'',returnHash:`#karte/${c.id}`,date:nowDate(),title:'',text:''};
 }
 if(config.mode==='free')return {mode:'free',id:null,name:'Das Teezimmer',group:'',question:'',image:'',returnHash:'#teezimmer',date:nowDate(),title:'',text:''};
 throw Error('Unbekannter Gedankenblatt-Modus');
}
function url(){const base=new URL(location.href);if(base.protocol!=='https:')throw Error('Ein öffentliches HTTPS-Ziel ist für den QR-Code erforderlich.');base.hash=state.returnHash+(state.mode==='card'?'/frage':'');base.search='';return base.href;}
function qrMatrix(link){const QR=root.EMFDQRCode;if(!QR)throw Error('QR-Code-Modul fehlt');const qr=new QR(0,root.EMFDQRErrorCorrectLevel.M);qr.addData(link);qr.make();return qr;}
function drawQr(ctx,link,x,y,size){const qr=qrMatrix(link),n=qr.getModuleCount(),quiet=4,cell=size/(n+2*quiet);ctx.fillStyle='#ffffff';ctx.fillRect(x,y,size,size);ctx.fillStyle='#172d38';for(let row=0;row<n;row++)for(let col=0;col<n;col++)if(qr.isDark(row,col))ctx.fillRect(x+(col+quiet)*cell,y+(row+quiet)*cell,Math.ceil(cell+.3),Math.ceil(cell+.3));}
function lines(ctx,text,maxWidth){const result=[];for(const para of String(text||'').split('\n')){if(!para.trim()){result.push('');continue;}let line='';for(const word of para.split(/\s+/)){const next=line?line+' '+word:word;if(ctx.measureText(next).width<=maxWidth){line=next;continue;}if(line)result.push(line);line='';for(const chr of word){if(ctx.measureText(line+chr).width>maxWidth&&line){result.push(line);line='';}line+=chr;} }result.push(line);}return result;}
function documentPages(link){
 const W=794,H=1123,L=78,R=78,TOP=88;
 const qrY=H-275, contentBottom=qrY-45;
 const measure=document.createElement('canvas').getContext('2d');
 // The layout model is used by both pagination and drawing. A continuation page
 // must never start at a different Y position than the one used for its capacity.
 const styles={
  heading:{font:'bold 23px Georgia',step:32,color:'#213d4a'},
  question:{font:'italic 17px Georgia',step:26,color:'#624b2e'},
  body:{font:'21px Georgia',step:33,color:'#2b3439'},
  blank:{font:'21px Georgia',step:21,color:'#2b3439'},
  gap:{font:'21px Georgia',step:23,color:'#2b3439'}
 };
 const items=[];
 const appendLines=(kind,value)=>{
  measure.font=styles[kind].font;
  for(const line of lines(measure,value,W-L-R))items.push({kind,text:line});
 };
 appendLines('heading',state.mode==='card'?state.name:(state.title||'Das Teezimmer'));
 if(state.question)appendLines('question',state.question);
 items.push({kind:'gap',text:''});
 measure.font=styles.body.font;
 for(const line of lines(measure,state.text||'',W-L-R))items.push({kind:line?'body':'blank',text:line});
 const pages=[[]];
 const startY=index=>TOP+100+(index>0?45:0);
 let y=startY(0);
 for(const item of items){
  // A baseline must stay safely above the QR divider and the bottom footer.
  // Empty layout gaps are not allowed to occupy a whole page by themselves.
  if(y>contentBottom&&pages[pages.length-1].length){
   pages.push([]);y=startY(pages.length-1);
  }
  if(item.kind==='gap'&&pages[pages.length-1].length===0)continue;
  pages[pages.length-1].push(item);
  y+=styles[item.kind].step;
 }
 return pages.map((page,i)=>{
  const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#f5e8c9';ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='#b7985c';ctx.lineWidth=2;ctx.strokeRect(30,30,W-60,H-60);
  ctx.fillStyle='#213d4a';ctx.font='15px Georgia';ctx.fillText('DAS HAUS DER KLEINEN WUNDER',L,TOP-17);
  ctx.fillStyle='#624b2e';ctx.font='bold 28px Georgia';ctx.fillText('Ein Gedanke zum Mitnehmen',L,TOP+27);
  ctx.font='17px Georgia';ctx.fillText(dateDisplay(state.date),L,TOP+60);
  let pos=startY(i);
  if(i>0){ctx.font='italic 15px Georgia';ctx.fillText('Fortsetzung',L,TOP+100);}
  for(const item of page){
   const style=styles[item.kind];
   if(item.kind!=='blank'&&item.kind!=='gap'){
    ctx.font=style.font;ctx.fillStyle=style.color;ctx.fillText(item.text,L,pos);
   }
   pos+=style.step;
  }
  ctx.strokeStyle='#d0b67a';ctx.beginPath();ctx.moveTo(L,qrY-22);ctx.lineTo(W-R,qrY-22);ctx.stroke();
  drawQr(ctx,link,L,qrY,132);
  ctx.font='bold 17px Georgia';ctx.fillStyle='#213d4a';ctx.fillText('Zurück zu diesem Moment',L+151,qrY+22);
  ctx.font='12px sans-serif';ctx.fillStyle='#3d515b';
  const linkLines=lines(ctx,link,W-L-R-155);
  linkLines.slice(0,5).forEach((line,j)=>ctx.fillText(line,L+151,qrY+48+j*16));
  ctx.font='italic 14px Georgia';ctx.fillStyle='#765c3e';ctx.fillText('Manche Gedanken dürfen mitkommen. Andere dürfen hierbleiben.',L,H-77);
  ctx.fillText(`${i+1} / ${pages.length}`,W-R-30,H-77);
  return canvas;
 });
}

function toBytes(dataUrl){const str=atob(dataUrl.split(',')[1]);return Uint8Array.from(str,c=>c.charCodeAt(0));}
function pdfFromCanvases(canvases,link){
 const parts=[];let length=0;const offsets=[0];const add=bytes=>{if(typeof bytes==='string')bytes=new TextEncoder().encode(bytes);parts.push(bytes);length+=bytes.length;};
 const objs=[];function obj(body){objs.push(body);return objs.length;}
 const catalog=obj(''),pages=obj('');const pageRefs=[];
 for(const canvas of canvases){const jpg=toBytes(canvas.toDataURL('image/jpeg',.9));const img=obj({prefix:`<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>`,bytes:jpg});
  const stream=new TextEncoder().encode('q 595 0 0 842 0 0 cm /Im0 Do Q');const content=obj({prefix:`<< /Length ${stream.length} >>`,bytes:stream});
  const safe=link.replace(/[\\()]/g,m=>'\\'+m);const annotation=obj(`<< /Type /Annot /Subtype /Link /Rect [166 75 565 210] /Border [0 0 0] /A << /S /URI /URI (${safe}) >> >>`);
  pageRefs.push(obj(`<< /Type /Page /Parent ${pages} 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im0 ${img} 0 R >> >> /Contents ${content} 0 R /Annots [${annotation} 0 R] >>`));
 }
 objs[catalog-1]=`<< /Type /Catalog /Pages ${pages} 0 R >>`;objs[pages-1]=`<< /Type /Pages /Kids [${pageRefs.map(x=>x+' 0 R').join(' ')}] /Count ${pageRefs.length} >>`;
 add('%PDF-1.4\n');objs.forEach((o,i)=>{offsets.push(length);add(`${i+1} 0 obj\n`);if(typeof o==='string')add(o+'\n');else{add(o.prefix+'\nstream\n');add(o.bytes);add('\nendstream\n');}add('endobj\n');});const xref=length;add(`xref\n0 ${objs.length+1}\n0000000000 65535 f \n`);offsets.slice(1).forEach(n=>add(String(n).padStart(10,'0')+' 00000 n \n'));add(`trailer\n<< /Size ${objs.length+1} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF`);
 return new Blob(parts,{type:'application/pdf'});
}
function save(blob,name){const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),60000);}
async function offerFile(blob,name){
 // Native share sheet allows Photos, Files and other user-selected destinations.
 // Browsers without file sharing retain the ordinary local download.
 if(typeof File!=='undefined' && navigator.share && navigator.canShare){
  const file=new File([blob],name,{type:blob.type});
  if(navigator.canShare({files:[file]})){
   try{await navigator.share({files:[file]});return 'shared';}
   catch(error){if(error?.name==='AbortError')return 'cancelled';save(blob,name);return 'downloaded';}
  }
 }
 save(blob,name);return 'downloaded';
}
const filename=ext=>`${state.date}_${state.mode==='card'?state.id+'_'+slug(state.name):'Teezimmer_Gedankenblatt'}.${ext}`;
async function exportSheet(type){if(pending)return;pending=true;const status=dialog.querySelector('[data-note-status]');status.textContent='Dein Blatt wird vorbereitet …';try{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(state.date)||Number.isNaN(new Date(state.date+'T12:00:00').getTime()))throw Error('Bitte ein gültiges Datum auswählen');
 const link=url(),pages=documentPages(link);let outcome='downloaded';if(type==='pdf')outcome=await offerFile(pdfFromCanvases(pages,link),filename('pdf'));
 else{const total=pages.length*1123;if(total<=16000){const combined=document.createElement('canvas');combined.width=794;combined.height=total;const context=combined.getContext('2d');pages.forEach((p,i)=>context.drawImage(p,0,i*1123));const blob=await new Promise((resolve,reject)=>combined.toBlob(b=>b?resolve(b):reject(Error('PNG konnte nicht erzeugt werden')),'image/png'));outcome=await offerFile(blob,filename('png'));combined.width=0;combined.height=0;
 }else{for(let i=0;i<pages.length;i++){const blob=await new Promise((resolve,reject)=>pages[i].toBlob(b=>b?resolve(b):reject(Error('PNG konnte nicht erzeugt werden')),'image/png'));outcome=await offerFile(blob,filename('png').replace('.png',`-Teil-${i+1}-von-${pages.length}.png`));}status.textContent='Der lange Text wurde vollständig in mehreren PNG-Seiten ausgegeben.';}}
 if(!status.textContent.includes('mehreren'))status.textContent=outcome==='cancelled'?'Teilen abgebrochen. Dein Blatt bleibt geöffnet.':outcome==='shared'?'Das Teilen-Menü wurde abgeschlossen. Dein Blatt bleibt geöffnet.':'Download angestoßen. Du kannst den Speicherort in den Browser-Downloads wählen. Dein Blatt bleibt geöffnet.';
 }catch(error){status.textContent=`Export nicht möglich: ${error.message}. Deine Eingabe bleibt hier erhalten.`;}finally{pending=false;}}
function clear(){if(!state)return;state.text='';state.title='';state=null;}
function discard(){if(!dialog)return;dialog.removeEventListener('cancel',onCancel);dialog.close();dialog.querySelectorAll('textarea,input').forEach(x=>x.value='');clear();const old=opener;opener=null;if(old?.isConnected)old.focus({preventScroll:true});}
function onCancel(e){e.preventDefault();requestClose();}
function requestClose(){if(!state)return;if(!state.text.trim()&&!state.title.trim()){discard();return;}dialog.querySelector('[data-note-confirm]').hidden=false;dialog.querySelector('[data-note-confirm] button').focus();}
function open(config,source){if(state)return;state=context(config);opener=source||document.activeElement;if(!dialog){dialog=document.createElement('dialog');dialog.id='thought-paper-dialog';dialog.className='thought-paper-dialog';document.body.append(dialog);dialog.addEventListener('cancel',onCancel);dialog.addEventListener('click',event=>{
  if(event.target.closest('[data-note-close]'))requestClose();
  if(event.target.closest('[data-note-discard]'))discard();
  if(event.target.closest('[data-note-continue]'))dialog.querySelector('[data-note-confirm]').hidden=true;
  if(event.target.closest('[data-note-export]'))exportSheet(event.target.closest('[data-note-export]').dataset.noteExport);
 });dialog.addEventListener('input',event=>{if(!state)return;const el=event.target;if(el.matches('[data-note-text]'))state.text=el.value;if(el.matches('[data-note-title]'))state.title=el.value;if(el.matches('[data-note-date]'))state.date=el.value;});
 }
 dialog.addEventListener('cancel',onCancel);
 dialog.innerHTML=`<div class="thought-paper-head"><span>Ein Moment für dich · Das Haus der kleinen Wunder</span><button type="button" data-note-close aria-label="Gedankenblatt schließen">×</button></div><div class="thought-paper-sheet"><p class="thought-paper-eyebrow">Ein Gedanke zum Mitnehmen</p><h2 id="thought-paper-heading">${state.mode==='card'?esc(state.name):'Ein leeres Blatt'}</h2><p class="thought-paper-origin">${state.mode==='card'?esc(state.group+' · '+state.id):'Das Teezimmer'}</p>${state.mode==='card'&&state.image?`<figure class="thought-paper-inspiration"><img src="${esc(state.image)}" alt="Orakelkarte ${esc(state.name)}" loading="eager" decoding="async" onerror="this.closest('figure').hidden=true"><figcaption>Deine Karte als Inspiration</figcaption></figure>`:''}${state.question?`<blockquote>${esc(state.question)}</blockquote>`:''}${state.mode==='free'?'<label for="thought-paper-title">Eigener Titel (freiwillig)</label><input id="thought-paper-title" data-note-title type="text" autocomplete="off" placeholder="Ein Gedanke …">':''}<label for="thought-paper-date">Datum</label><input id="thought-paper-date" type="date" data-note-date value="${state.date}"><div class="thought-paper-privacy" role="note"><strong>Deine Gedanken bleiben bei dir.</strong><span>Dein Text wird weder online gespeichert noch an das Haus übertragen. Nimm ihn als Bild oder PDF mit – oder lass das Blatt liegen.</span></div><label for="thought-paper-entry">Dein Gedanke (freiwillig)</label><textarea id="thought-paper-entry" data-note-text rows="8" spellcheck="true" placeholder="Hier ist Platz für deinen Gedanken."></textarea><p class="thought-paper-privacy-detail">Schließt du das Blatt ohne Export, wird dein Text verworfen. Auch das Schließen des Browsers kann ihn verlieren.</p></div><div class="thought-paper-actions"><button type="button" data-note-export="png">Als Bild mitnehmen</button><button type="button" data-note-export="pdf">Als PDF mitnehmen</button><button type="button" data-note-close>Zurück</button></div><p class="thought-paper-status" role="status" data-note-status></p><div class="thought-paper-confirm" data-note-confirm hidden role="group" aria-label="Gedankenblatt schließen"><p>Möchtest du deinen Gedanken mitnehmen?</p><div><button type="button" data-note-continue>Weiterschreiben</button><button type="button" data-note-export="png">Als Bild mitnehmen</button><button type="button" data-note-export="pdf">Als PDF mitnehmen</button><button type="button" data-note-discard>Blatt liegen lassen</button></div></div>`;
 dialog.setAttribute('aria-labelledby','thought-paper-heading');dialog.showModal();dialog.querySelector('[data-note-close]').focus({preventScroll:true});
}
root.EMFDThoughtPaper=Object.freeze({open,context,dateDisplay});
})(globalThis);

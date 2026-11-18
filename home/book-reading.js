/* One saved, five-step reading size across books and text pages. */
(function(root){
 const sizes=[16,18,20,23,26],labels=['Klein','Normal','Groß','Sehr groß','Extra groß'],key='emfd.reading.size.v1';let selected=1;
 try{const saved=Number(localStorage.getItem(key));if(Number.isInteger(saved)&&saved>=0&&saved<5&&localStorage.getItem(key)!==null)selected=saved;}catch{}
 const apply=()=>{document.documentElement.style.setProperty('--book-font-size',sizes[selected]/16+'rem');document.querySelectorAll('[data-book-size]').forEach(s=>s.value=String(selected));};
 function controls(host){if(host.querySelector('.book-reading-controls'))return;const label=document.createElement('label');label.className='book-reading-controls';label.append(document.createTextNode('Schriftgröße '));const select=document.createElement('select');select.dataset.bookSize='';select.setAttribute('aria-label','Schriftgröße im Buch');labels.forEach((name,i)=>{const option=document.createElement('option');option.value=String(i);option.textContent=name;select.append(option);});select.value=String(selected);select.onchange=()=>setSize(Number(select.value));label.append(select);host.prepend(label);}
 function mount(){for(const selector of ['#reading-dialog','#origin-dialog .origin-book-main','.emfd-lib-view','.start02-letter','.story-reader','.thought-paper-dialog'])document.querySelectorAll(selector).forEach(controls);}
 function setSize(value){const step=Number(value);if(!Number.isInteger(step)||step<0||step>=sizes.length)return false;selected=step;try{localStorage.setItem(key,String(selected));}catch{}apply();return true;}
 apply();const observer=new MutationObserver(mount);observer.observe(document.body,{childList:true,subtree:true});mount();
 root.EMFDReadingSize=Object.freeze({sizes:[...sizes],get value(){return selected;},set:setSize,mount});
})(globalThis);

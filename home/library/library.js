/**
 * EMFD-BIB-FE-01 – progressive enhancement for P02.
 * Does not alter origin-story.js, card reader, global audio or the P02 room itself.
 * The production integration must provide openBook for readable books.
 */
import { libraryBooks } from './catalog.js?v=library02a';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stageLabel = stage => ({existing:'Bereits vorhanden',source:'Quelltext vorhanden',draft:'Textentwurf',outline:'Geplantes Kapitel'})[stage] || 'In Vorbereitung';
let backCoverNumber = 0;

/**
 * @param {HTMLElement} root
 * @param {{mode?:'integration'|'demo',bookBack?:boolean,roomImage?:string,books?:Array,onOpenBook?:(book:Object)=>void,onOpenCards?:(book:Object)=>void,onClose?:()=>void}} options
 * @returns {{destroy:()=>void,openBook:(id:string)=>void,showShelf:()=>void}}
 */
export function mountLibrary(root, options = {}) {
  if (!(root instanceof HTMLElement)) throw new TypeError('mountLibrary(root): root must be an HTML element');
  const books = options.books ?? libraryBooks;
  const mode = options.mode === 'demo' ? 'demo' : 'integration';
  const bookBack = options.bookBack === true;
  let selected = options.selectedId ?? (bookBack ? null : books[0]?.id);
  let backDialog = null, shelfTrigger = null, shelfScroll = [];
  const backId = `emfd-lib-back-${++backCoverNumber}`;
  let activeBook = null;
  let chapterIndex = 0;
  let openNotice = '';
  let startX = 0, startY = 0;
  const hadFocus = document.activeElement;
  const oldHtml = root.innerHTML;
  const defaultRoomImage = options.roomImage ?? '../media/rooms/P02-bibliothek.webp';
  const cssImage = `url("${String(defaultRoomImage).replace(/["\\\n\r]/g,'')}")`;
  root.classList.add('emfd-library');
  if(bookBack)root.classList.add('emfd-lib-book-pick');
  if(options.embedded)root.classList.add('emfd-lib-embedded');
  root.style.setProperty('--lib-room-image', cssImage);

  const get = id => books.find(book=>book.id===id);
  const getIndex = () => Math.min(chapterIndex, Math.max(0,activeBook?.chapters?.length-1 ?? 0));
  const bookCard = book => `<button type="button" class="emfd-lib-item emfd-lib-theme-${esc(book.theme)}" data-action="select" data-book="${esc(book.id)}" aria-label="${esc(book.title)} auswählen" aria-pressed="${book.id===selected}" ${bookBack?`aria-haspopup="dialog" aria-controls="${backId}"`:''}>
      <span class="emfd-lib-cover"><span class="emfd-lib-cover-symbol" aria-hidden="true">${book.cover?'<img class="emfd-lib-cover-image" src="'+esc(book.cover)+'" alt="" loading="lazy">':esc(book.symbol)}</span><span class="emfd-lib-cover-title">${esc(book.title)}</span></span>
      <span class="emfd-lib-item-name">${esc(book.title)}</span>
    </button>`;
  const renderShelf = () => {
    root.dataset.reading = 'false';
    const book = get(selected) ?? books[0];
    if (!book) {root.innerHTML = '<p>Keine Bücher angelegt.</p>';return;}
    root.innerHTML = `<div class="emfd-lib-room"><div class="emfd-lib-shell">
      <header class="emfd-lib-heading"><div class="emfd-lib-eyebrow">${esc(options.eyebrow??'Das Haus der kleinen Wunder · P02')}</div><h2 tabindex="-1" id="emfd-lib-title">${esc(options.heading??'Bücher entdecken')}</h2><p>${esc(options.intro??'Manche Geschichten erzählen von diesem Haus. Andere davon, wie es entstanden ist. Du entscheidest, was du lesen möchtest.')}</p></header>
      <div class="emfd-lib-layout">
        <section class="emfd-lib-case" aria-labelledby="emfd-lib-shelf-title"><h3 id="emfd-lib-shelf-title">Die Bücher im Regal</h3><div class="emfd-lib-books">${books.map(bookCard).join('')}</div><div class="emfd-lib-spine" aria-hidden="true"></div></section>
        ${bookBack?'':`<section class="emfd-lib-detail emfd-lib-theme-${esc(book.theme)}" aria-label="Ausgewähltes Buch"><div class="emfd-lib-detail-head"><div class="emfd-lib-detail-seal" aria-hidden="true">${book.iconSrc?'<img src="'+esc(book.iconSrc)+'" width="24" height="24" alt="">':esc(book.symbol)}</div><div><div class="emfd-lib-detail-kicker">${esc(book.category)}</div><span class="emfd-lib-status">${esc(book.statusText)}</span></div></div>
          <h3>${esc(book.title)}</h3><div class="emfd-lib-detail-sub">${esc(book.subtitle)}</div><p class="emfd-lib-detail-desc">${esc(book.description)}</p>
          <div class="emfd-lib-actions"><button class="emfd-lib-btn" type="button" data-action="open" data-book="${esc(book.id)}">${book.id==='karten'?'Zu den Karten':book.status==='bestand'?'Buch lesen':'Inhaltsübersicht ansehen'} <span aria-hidden="true">↗</span></button>
            ${typeof options.onClose==='function'?'<button class="emfd-lib-btn emfd-lib-btn--subtle" type="button" data-action="close">Zurück zum Haus</button>':''}
          </div>
          ${book.id==='klangwelten'?'<a class="emfd-lib-music-link" href="#musik/geschichten">Die 24 Kompositionsgeschichten entdecken</a>':''}${options.hideEditorialNote?'':'<p class="emfd-lib-desc-note">'+book.chapters.length+' Kapitel / Themen · Neue Texte erscheinen erst nach redaktioneller Freigabe.</p>'}
          ${openNotice?`<p role="status" class="emfd-lib-desc-note">${esc(openNotice)}</p>`:''}
        </section>`}
      </div>
      ${options.hideFooter?'':'<p class="emfd-lib-help">Bücher auswählen, ohne eine Reihenfolge einzuhalten. Alle Inhalte sind freiwillig. Der Raum bleibt unabhängig von der Lektüre zugänglich.</p>'}
    </div></div>`;
  };
  const renderPreview = () => {
    root.dataset.reading = 'true';
    const idx = getIndex();
    const chapter = activeBook?.chapters?.[idx];
    if (!chapter) { showShelf(); return; }
    root.innerHTML = `<div class="emfd-lib-room"><div class="emfd-lib-shell">
      <header class="emfd-lib-heading"><div class="emfd-lib-eyebrow">Bibliothek · Buchvorschau</div><h2>${esc(activeBook.title)}</h2></header>
      <div class="emfd-lib-view emfd-lib-theme-${esc(activeBook.theme)}">
        <div class="emfd-lib-reader-top"><button class="emfd-lib-btn emfd-lib-btn--subtle" type="button" data-action="shelf">← Zur Bibliothek</button><small>${esc(activeBook.subtitle)}</small></div>
        <div class="emfd-lib-read-layout">
          <nav class="emfd-lib-toc" aria-label="Kapitelübersicht"><h3>Inhalt</h3>${activeBook.chapters.map((ch,i)=>`<button type="button" data-action="chapter" data-index="${i}" aria-current="${i===idx?'page':'false'}">${esc(ch.title)}</button>`).join('')}</nav>
          <article class="emfd-lib-pages" data-theme="${esc(activeBook.theme)}" aria-live="polite" aria-atomic="true"><div class="emfd-lib-page-label">${esc(activeBook.category)} · Kapitel ${idx+1}</div>
            <h2 tabindex="-1" id="emfd-lib-chapter-title">${esc(chapter.title)}</h2>
            <p>${esc(chapter.description)}</p>
            <div class="emfd-lib-page-status"><strong>${esc(stageLabel(chapter.stage))}.</strong> ${chapter.stage==='existing'||chapter.stage==='source'?'Zu diesem Thema gibt es bereits Quellen. Ein eigenständiges Buchkapitel ist noch nicht freigegeben.':'Dieses Kapitel ist redaktionell noch nicht freigegeben. Die Ansicht zeigt deshalb nur das Konzept.'}</div>
            <div class="emfd-lib-reader-nav"><button class="emfd-lib-btn" data-action="prev" type="button" ${idx<=0?'disabled':''}>← Zurück</button><span>${idx+1} / ${activeBook.chapters.length}</span><button class="emfd-lib-btn" data-action="next" type="button" ${idx>=activeBook.chapters.length-1?'disabled':''}>Weiter →</button></div>
          </article>
        </div>
      </div><p class="emfd-lib-notice">Inhaltsübersicht – diese Buchkapitel werden noch redaktionell ausgearbeitet.</p>
    </div></div>`;
  };
  function syncSelection(){root.querySelectorAll('[data-action="select"]').forEach(item=>item.setAttribute('aria-pressed',String(item.dataset.book===selected)));}
  function restoreShelfScroll(){for(const [element,top,left] of shelfScroll){element.scrollTop=top;element.scrollLeft=left;}}
  function returnBook(focus=true){
    backDialog?.close();selected=null;syncSelection();
    if(focus&&shelfTrigger?.isConnected)shelfTrigger.focus({preventScroll:true});
    restoreShelfScroll();
  }
  function showBackCover(id,trigger){
    const book=get(id);if(!book)return;shelfScroll=[];for(let element=root;element;element=element.parentElement)shelfScroll.push([element,element.scrollTop,element.scrollLeft]);
    selected=id;shelfTrigger=trigger;syncSelection();
    if(!backDialog?.isConnected){
      backDialog=document.createElement('dialog');backDialog.id=backId;backDialog.className='emfd-lib-back-dialog';backDialog.setAttribute('aria-labelledby',backId+'-title');
      backDialog.addEventListener('cancel',event=>{event.preventDefault();returnBook();});
      backDialog.addEventListener('click',event=>{if(event.target!==backDialog)return;const rect=backDialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)returnBook();});
      root.append(backDialog);
    }
    backDialog.innerHTML=`<article class="emfd-lib-back-book emfd-lib-theme-${esc(book.theme)}"><div class="emfd-lib-back-copy" tabindex="0" role="region" aria-label="Buchbeschreibung"><div class="emfd-lib-back-symbol" aria-hidden="true">${esc(book.symbol)}</div><div class="emfd-lib-detail-kicker">${esc(book.category)}</div><h2 id="${backId}-title" tabindex="-1">${esc(book.title)}</h2><p class="emfd-lib-detail-sub">${esc(book.subtitle)}</p><p class="emfd-lib-detail-desc">${esc(book.description)}</p><span class="emfd-lib-status">${esc(book.statusText)}</span></div><div class="emfd-lib-back-actions"><button class="emfd-lib-btn" type="button" data-action="open" data-book="${esc(book.id)}">${book.id==='karten'?'Zu den Karten':book.status==='bestand'?'Buch lesen':'Inhaltsübersicht ansehen'}</button><button class="emfd-lib-btn emfd-lib-btn--subtle" type="button" data-action="return-book">Zurück ins Regal</button></div></article>`;
    if(!backDialog.open)backDialog.showModal();
    backDialog.querySelector('.emfd-lib-back-copy').scrollTop=0;
    backDialog.querySelector('h2').focus({preventScroll:true});
    restoreShelfScroll();
  }
  function showShelf() {const focusId=selected;activeBook=null;openNotice='';if(bookBack)selected=null;renderShelf();(bookBack?root.querySelector(`[data-book="${CSS.escape(focusId??books[0]?.id??'')}"][data-action="select"]`):root.querySelector('#emfd-lib-title'))?.focus({preventScroll:true});}
  function showChapter(index) {chapterIndex = Math.max(0,Math.min(index,activeBook.chapters.length-1));renderPreview();root.querySelector('#emfd-lib-chapter-title')?.focus({preventScroll:true});}
  function openBook(id,trigger) {
    const book = get(id);
    if (!book) return;
    selected=id;openNotice='';
    if (book.id === 'karten' && typeof options.onOpenCards === 'function') {backDialog?.close();options.onOpenCards(book);return;}
    if (typeof options.onOpenBook === 'function' && options.onOpenBook(book,trigger)!==false) return;
    if (mode === 'demo' || mode === 'integration') {backDialog?.close();activeBook=book;chapterIndex=0;renderPreview();root.querySelector('#emfd-lib-chapter-title')?.focus({preventScroll:true});if(bookBack)root.scrollIntoView({block:'start',behavior:'instant'});return;}
    openNotice='Diese Kapitel stehen noch nicht als fertiger Text zur Verfügung.';
    renderShelf();
  }
  const onClick = e => {
    const btn = e.target.closest('button[data-action]'); if(!btn||!root.contains(btn))return;
    const action=btn.dataset.action;
    if (action==='select') {selected=btn.dataset.book;if(bookBack){showBackCover(selected,btn);return;}if(options.openOnSelect){root.querySelectorAll('[data-action="select"]').forEach(item=>item.setAttribute('aria-pressed',String(item.dataset.book===selected)));openBook(selected,btn);return;}renderShelf();root.querySelector(`[data-book="${CSS.escape(selected)}"][data-action="select"]`)?.focus({preventScroll:true});}
    else if(action==='return-book')returnBook();
    else if(action==='open')openBook(btn.dataset.book,btn);
    else if(action==='shelf')showShelf();
    else if(action==='chapter'&&activeBook)showChapter(Number(btn.dataset.index));
    else if(action==='prev'&&activeBook)showChapter(getIndex()-1);
    else if(action==='next'&&activeBook)showChapter(getIndex()+1);
    else if(action==='close')options.onClose?.();
  };
  const onKeyDown = e => {
    if(!activeBook||mode!=='demo')return;
    if(e.key==='Escape'){e.preventDefault();showShelf();}
    if((e.key==='ArrowLeft'||e.key==='ArrowRight')&&!e.target.closest('button')){
      e.preventDefault();showChapter(getIndex()+(e.key==='ArrowRight'?1:-1));
    }
  };
  const onTouchStart=e=>{if(!activeBook)return;const t=e.changedTouches[0];startX=t.clientX;startY=t.clientY;};
  const onTouchEnd=e=>{if(!activeBook)return;const t=e.changedTouches[0];const dx=t.clientX-startX,dy=t.clientY-startY;if(Math.abs(dx)>80 && Math.abs(dx)>Math.abs(dy)*1.5){showChapter(getIndex()+(dx<0?1:-1));}};
  root.addEventListener('click',onClick);
  root.addEventListener('keydown',onKeyDown);
  root.addEventListener('touchstart',onTouchStart,{passive:true});
  root.addEventListener('touchend',onTouchEnd,{passive:true});
  renderShelf();
  return {showShelf,openBook,destroy(){backDialog?.close();root.removeEventListener('click',onClick);root.removeEventListener('keydown',onKeyDown);root.removeEventListener('touchstart',onTouchStart);root.removeEventListener('touchend',onTouchEnd);root.innerHTML=oldHtml;root.classList.remove('emfd-library','emfd-lib-embedded','emfd-lib-book-pick');root.removeAttribute('data-reading');root.style.removeProperty('--lib-room-image');if(hadFocus instanceof HTMLElement&&document.contains(hadFocus))hadFocus.focus({preventScroll:true});}};
}

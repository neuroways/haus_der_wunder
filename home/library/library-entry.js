/** EMFD-BIB-FE-01: adapter to the existing P02 room, storybook and cards. */
import { mountLibrary } from './library.js?v=library02a';
 window.EMFDHelp.register('library',{priority:20,matches:({route})=>route==='#ort/P02',title:'In der Bibliothek',sections:[
   ['Ein Buch aus dem Regal nehmen','Wähle ein Buchcover aus. Du siehst die Rückseite mit der vorhandenen Beschreibung.'],
   ['Lesen oder zurückstellen','Mit Buch lesen öffnest du den gemeinsamen Buchleser. Zurück ins Regal stellt das Buch wieder an seinen Platz. Bei noch entstehenden Büchern kannst du die Inhaltsübersicht ansehen.'],
   ['Im Buch blättern','Verwende die Seitenpfeile oder das Inhaltsverzeichnis. Die Schriftgröße kannst du im Leser anpassen. Beim Schließen kehrst du zum ausgewählten Buch zurück.']
 ]});
const mounts=new WeakMap();
let currentRoot=null,currentApi=null;
function mount(root){
  if(!root||mounts.has(root))return mounts.get(root)||null;
  currentApi?.destroy();if(currentRoot)mounts.delete(currentRoot);
  const api=mountLibrary(root,{
    embedded:true,
    bookBack:true,
    hideFooter:true,
    hideEditorialNote:true,
    mode:'integration',
    onOpenBook(book,trigger){
      if(window.EMFDReaders.openBook(book.id,trigger))return true;
      // Noch nicht veröffentlichte Bücher zeigen das Kapitelkonzept statt erfundener Texte.
      return false;
    },
    onOpenCards(){window.EMFDNavigation.go('#karten',{origin:'#ort/P02'});},
  });
  mounts.set(root,api);
  currentRoot=root;currentApi=api;
  return api;
}
function release(){currentApi?.destroy();if(currentRoot)mounts.delete(currentRoot);currentRoot=null;currentApi=null;}
window.EMFDStations.register('library',{render:mount,leave:release});
window.EMFDLibrary={mount(root){if(!root)return null;return mounts.get(root)||window.EMFDStations.render('library',root);}};
window.addEventListener('hashchange',()=>{if(currentRoot&&!currentRoot.isConnected){currentApi?.destroy();mounts.delete(currentRoot);currentRoot=null;currentApi=null;}});
// Bei direktem P02-Einstieg kann das App-Routing früher als das ES-Modul laufen.
const initialRoot=document.querySelector('#emfd-library-root');if(initialRoot)window.EMFDLibrary.mount(initialRoot);

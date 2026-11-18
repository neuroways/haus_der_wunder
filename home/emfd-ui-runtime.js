import {button, icon, roomCard, bottomNav} from './emfd-ui/js/emfd-ui.js';

const navigation=window.EMFDFeatures?.primaryNavigation||[
  {label:'Haus',iconName:'house',href:'#flur',tab:'haus'},
  {label:'Karten',iconName:'cards',href:'#karten',tab:'karten'},
  {label:'Musik',iconName:'music',href:'#musik',tab:'musik'}
];

function activeLabel(){
  const route=location.hash.slice(1);
  return route.startsWith('karte/')||route==='karten'||route.startsWith('atelier/tisch/')?'Karten':route.startsWith('musik')?'Musik':'Haus';
}

function mountNavigation(){
  const old=document.querySelector('.global-nav');
  if(!old||old.dataset.emfdMounted==='true')return;
  const nav=bottomNav({items:navigation.map(({label,iconName,href})=>({label,iconName,href})),active:activeLabel()});
  nav.classList.add('global-nav','emfd-ui');
  [...nav.querySelectorAll('a')].forEach((link,index)=>{link.dataset.tab=navigation[index].tab;});
  nav.dataset.emfdMounted='true';
  old.replaceWith(nav);
}

function updateNavigation(){
  document.querySelectorAll('.global-nav [data-tab]').forEach(link=>{
    if(link.dataset.tab===activeLabel().toLowerCase())link.setAttribute('aria-current','page');
    else link.removeAttribute('aria-current');
  });
}

function decorateControls(root=document){
  const selectors=['.primary','.house-actions > a','.house-actions > button','.hall-hotspot','.hall-light-toggle','.room-home-link','.music-page-panel button','.start-door-action','.origin-start-link'];
  root.querySelectorAll?.(selectors.join(',')).forEach(el=>{
    if(el.classList.contains('emfd-button'))return;
    const primary=el.classList.contains('primary')||el.classList.contains('start-door-action');
    const compact=el.classList.contains('hall-hotspot')||el.classList.contains('hall-light-toggle')||el.classList.contains('origin-start-link');
    el.classList.add('emfd-button',primary?'emfd-button--primary':'emfd-button--secondary','emfd-button--iconless','emfd-button--no-arrow');
    el.classList.add(compact?'emfd-button--frame-simple':'emfd-button--ornate');
    if(el.matches('.house-actions > a,.house-actions > button,.music-page-panel button'))el.classList.add('emfd-button--full');
  });
}

function markScenes(root=document){
  root.querySelectorAll?.('.hall-stage,.start-scene,.room-hero,.room-tile-image').forEach(el=>el.classList.add('emfd-scene__frame'));
  root.querySelectorAll?.('.hall-art,.start-scene-art,.room-photo').forEach(img=>img.classList.add('emfd-scene__image'));
  root.querySelectorAll?.('.hall-hotspots').forEach(el=>el.classList.add('emfd-scene__hotspots'));
}

function mountThemeButton(root=document){
  const existing=root.querySelector?.('#select-app-theme');
  if(!existing||existing.dataset.emfdMounted==='true')return;
  const themeButton=button({label:'Theme im Player auswählen',iconName:'music',variant:'primary',frame:'ornate',full:true,arrow:false,
    onClick:()=>window.EMFDMusic?.selectTheme('T03')});
  themeButton.id='select-app-theme';
  themeButton.dataset.emfdMounted='true';
  existing.replaceWith(themeButton);
}

function mountRoomCards(root=document){
  root.querySelectorAll?.('.room-grid .room-tile:not(.emfd-room-card)').forEach(old=>{
    const id=old.querySelector('.room-tile-label small')?.textContent||'';
    const name=old.querySelector('.room-tile-label strong')?.textContent||'';
    const image=old.querySelector('img')?.getAttribute('src')||'';
    const card=roomCard({id,name,image,href:old.getAttribute('href')||'#'});
    card.classList.add('room-tile');
    card.setAttribute('aria-label',`${id} ${name}`);
    const img=card.querySelector('img');
    img?.addEventListener('error',()=>{
      if(!img.isConnected)return;
      img.replaceWith(Object.assign(document.createElement('span'),{className:'room-photo-fallback',textContent:'Dieses Raumbild ist gerade nicht verfügbar.'}));
    },{once:true});
    old.replaceWith(card);
  });
}

function enhance(root=document){
  (root===document?document.querySelector('main'):root)?.classList?.add('emfd-ui');
  mountNavigation();
  mountRoomCards(root);
  decorateControls(root);
  markScenes(root);
  mountThemeButton(root);
  updateNavigation();
}

window.EMFDUI={button,icon,roomCard,bottomNav,enhance,mountThemeButton};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>enhance(),{once:true});
else enhance();
window.addEventListener('hashchange',()=>{mountNavigation();updateNavigation();enhance(document.querySelector('main')||document);});

(function(root){
  function randomCard(){
    if(root.EMFDFeatures?.randomCard)return root.EMFDFeatures.randomCard();
    const cards=root.CARDS||[];
    if(!cards.length)return null;
    if(root.crypto?.getRandomValues){
      const values=new Uint32Array(1),limit=Math.floor(4294967296/cards.length)*cards.length;
      do{root.crypto.getRandomValues(values);}while(values[0]>=limit);
      return cards[values[0]%cards.length];
    }
    return cards[Math.floor(Math.random()*cards.length)];
  }
  function rememberReturn(){root.EMFDAtelier?.rememberReturn?.('#teezimmer');}
  function render(host){
    host.innerHTML=`<section class="teezimmer-view" aria-labelledby="teezimmer-title">
      <picture class="teezimmer-picture"><img class="teezimmer-background" src="../media/rooms/teezimmer_p08_background.webp" alt="Ein warm beleuchtetes Teezimmer mit rundem Holztisch, Teekanne, Tassen, Kartenstapel, blauen Sesseln und einem großen Bogenfenster zum nächtlichen Schloss." width="1024" height="1536" fetchpriority="high"></picture>
      <div class="teezimmer-content" role="region" aria-label="Teezimmer-Inhalte" tabindex="0">
      <div class="teezimmer-topbar">${(root.EMFDNavigation?.backLinkMarkup?.('#raeume')||'<a class="back" href="#raeume">Zurück</a>')}<button type="button" data-teezimmer-help aria-label="Hilfe zum Teezimmer" title="Hilfe">?</button></div>
      <div class="teezimmer-heading"><span class="eyebrow">P08 · Das Haus der kleinen Wunder</span><h1 id="teezimmer-title">Im Teezimmer</h1><p>Ein ruhiger Platz für eine Karte im Alltag.</p></div>
      <nav class="teezimmer-actions" aria-label="Auswahl im Teezimmer">
        <a href="#karten" data-house-feature="cards" data-feature-room="P08" data-card-overview>Eine Karte aussuchen</a>
        <button type="button" class="primary" data-house-feature="daily" data-feature-room="P08" data-daily-card>Tageskarte ziehen</button>
      </nav>
      <p class="teezimmer-note">Die zufällige Auswahl entsteht erst, wenn du sie antippst.</p>
      <p class="teezimmer-status" data-teezimmer-status role="status" hidden></p>
      </div>
    </section>`;
    host.querySelector('[data-teezimmer-help]')?.addEventListener('click',()=>document.querySelector('#help-open')?.click());
    const image=host.querySelector('.teezimmer-background');
    const failed=()=>{
      // The long-standing P08 room image is reused if the newer named background was not deployed.
      if(!image.dataset.fallbackAttempted){
        image.dataset.fallbackAttempted='true';
        image.src='../media/rooms/P08-teezimmer.webp';
        return;
      }
      image.closest('.teezimmer-picture')?.classList.add('is-missing');
      image.alt='Das Bild des Teezimmers ist gerade nicht verfügbar.';
    };
    image?.addEventListener('error',failed);
    if(image?.complete&&!image.naturalWidth)failed();
  }
  root.EMFDTeezimmer={render,randomCard};
})(globalThis);

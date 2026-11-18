/* EMFD-MEDIA-CORE-01 · Rückwärtskompatible Brücke für die bestehende PWA (v0.6.56)
 *
 * Einbindung in home/index.html direkt NACH image-profiles.js und VOR app.js:
 *   <script defer src="../media/media-loader.js"></script>   (relativ: /wunderhaus/media/ – gilt unter beiden Domains)
 *   <script defer src="media-bridge.js"></script>
 *
 * Wirkung
 *  - Ändert keine bestehende Datei der App und keine Route.
 *  - Ersetzt Kartenbilder nur, wenn das zentrale Manifest für die Karte eine AKTUELLE, nutzbare
 *    Vorderseite führt (state 'current'). Sonst bleibt alles exakt wie bisher (PERF-01-Profile).
 *  - Erster Start nach Veröffentlichung: Manifest wird im Hintergrund geladen; die Karten-Objekte
 *    werden sofort aktualisiert (gilt ab der nächsten Ansicht) und das Ereignis
 *    'emfd-media-updated' wird ausgelöst. Ab dem zweiten Start greift der lokale Stand synchron.
 *  - Kein Autoplay, kein Audio-Precache, keine Service-Worker-Änderung.
 *  - Notbremse: localStorage 'emfd-media-bridge' = 'off' schaltet die Brücke ab (oder ?emfd-media-bridge=off).
 */
(function (root) {
  'use strict';
  var OFF_KEY = 'emfd-media-bridge';
  try {
    if (/[?&]emfd-media-bridge=off\b/.test(root.location.search) || root.localStorage.getItem(OFF_KEY) === 'off') return;
  } catch (_) { /* Speicher gesperrt: Brücke läuft normal */ }
  // data.js deklariert CARDS ggf. mit const (globale lexikalische Bindung, nicht globalThis.CARDS)
  var CARD_LIST = typeof CARDS !== 'undefined' ? CARDS : root.CARDS; // eslint-disable-line no-undef
  if (!root.EMFDMedia || !root.EMFDImages || !CARD_LIST) {
    if (root.console) console.warn('EMFD media-bridge: Voraussetzungen fehlen (media-loader.js, image-profiles.js, data.js) – keine Änderung.');
    return;
  }

  var loader = root.EMFDMedia.create({ channel: 'private' });
  var legacy = root.EMFDImages;
  var PURPOSE_TO_VARIANT = { 'card-overview': 'overview', 'card-view': 'view', 'card-detail-large': 'large', 'playlist-thumbnail': 'thumb' };
  var applied = {};

  function currentFront(id, variant) {
    if (!loader.manifest) return null;
    var c = loader.getCard(id, { front: variant });
    return c && c.front.state === 'current' && c.front.usable ? c.front : null;
  }

  function currentCover(id) {
    if (!loader.manifest) return null;
    var c = id === 'T03' ? loader.getPlaylist().items[0] : loader.getCard(id, { cover: 'thumb' });
    return c && c.cover && c.cover.state === 'current' && c.cover.usable ? c.cover : null;
  }

  function applyToCards() {
    var changed = [];
    for (var i = 0; i < CARD_LIST.length; i++) {
      var card = CARD_LIST[i];
      var view = currentFront(card.id, 'view');
      if (!view) continue;
      var overview = currentFront(card.id, 'overview');
      var large = currentFront(card.id, 'large');
      card.image = view.url;
      if (overview) card.imageOverview = overview.url;
      if (large) card.imageDetail = large.url;
      if (view.width) { card.imageWidth = view.width; card.imageHeight = view.height; }
      if (applied[card.id] !== view.url) changed.push(card.id);
      applied[card.id] = view.url;
    }
    return changed;
  }

  // EMFDImages ist eingefroren: Objekt ersetzen, alte Daten und Methoden bleiben als Rückfall erhalten.
  root.EMFDImages = Object.freeze({
    cards: legacy.cards,
    cardBack: legacy.cardBack,
    card: function (id, purpose) {
      purpose = purpose || 'card-view';
      if (purpose === 'playlist-thumbnail') { var cov = currentCover(id); if (cov) return cov.url; return legacy.card(id, purpose); }
      var v = PURPOSE_TO_VARIANT[purpose];
      var f = v ? currentFront(id, v) : null;
      return f ? f.url : legacy.card(id, purpose);
    },
    back: function (purpose) { return legacy.back(purpose); },
    /** Neu: eigenständiges CD-Cover (O01–O24, T03) oder '' – Aufrufer nutzen sonst ihren bisherigen Pfad. */
    cover: function (id) { var c = currentCover(id); return c ? c.url : ''; },
    media: loader,
    legacy: legacy,
  });

  function notify(changed, source) {
    try { root.dispatchEvent(new CustomEvent('emfd-media-updated', { detail: { changed: changed, source: source, revision: loader.status.revision } })); } catch (_) {}
  }

  if (loader.useCached()) { var c0 = applyToCards(); if (c0.length) notify(c0, 'cache'); }
  loader.on('update', function () { var c = applyToCards(); if (c.length) notify(c, 'update'); });
  loader.init({ waitForNetwork: false }).then(function () {
    var c = applyToCards();
    if (c.length) notify(c, 'network');
  }).catch(function (e) {
    if (root.console) console.info('EMFD media-bridge: zentrales Manifest nicht verfügbar – bisherige Kartenbilder bleiben aktiv.', e && e.message);
  });
})(globalThis);

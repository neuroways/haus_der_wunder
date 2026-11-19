/* EMFD-CACHE-01 · Seitenseite des Offline-Caches.
 *
 *  - bittet den Browser um dauerhaften Speicher (navigator.storage.persist), damit iOS/Android den Cache
 *    nicht bei Speicherknappheit leeren;
 *  - stößt direkt nach dem Start das Vorab-Laden aller Hausbilder an (Stufe 2) und meldet dabei die
 *    aktuellen Kartenvorderseiten aus dem zentralen Manifest (media-bridge.js) mit;
 *  - zeigt bewusst KEINE Fortschrittsanzeige (feste Regel: keine Fortschrittsanzeigen). Der Stand ist nur
 *    für Prüfung/Diagnose abrufbar: EMFDOffline.status() bzw. Ereignis 'emfd-offline-progress'.
 * Musik wird hier nicht angefasst: sie wird erst beim ersten Abspielen gespeichert (Service Worker).
 */
(function (root) {
  'use strict';
  var nav = root.navigator;
  var supported = Boolean(nav && 'serviceWorker' in nav && root.location && /^https?:$/.test(root.location.protocol));
  var state = { supported: supported, persisted: null, progress: null };

  function imageUrls() {
    var urls = [];
    var push = function (u) { if (typeof u === 'string' && u) urls.push(new URL(u, root.location.href).href); };
    var images = root.EMFDImages;
    if (images && images.cards) {
      Object.keys(images.cards).forEach(function (id) {
        var profile = images.cards[id] || {};
        Object.keys(profile).forEach(function (purpose) { push(profile[purpose] && profile[purpose].url); });
      });
    }
    if (images && images.cardBack) Object.keys(images.cardBack).forEach(function (k) { push(images.cardBack[k].url); });
    // Kartenobjekte tragen nach media-bridge.js die AKTUELLEN Vorderseiten (neue -r2-Dateien).
    var cards = typeof CARDS !== 'undefined' ? CARDS : root.CARDS; // eslint-disable-line no-undef
    (cards || []).forEach(function (card) { push(card.image); push(card.imageOverview); push(card.imageDetail); });
    return Array.from(new Set(urls));
  }

  function post(message) {
    if (!supported) return Promise.resolve(false);
    return nav.serviceWorker.ready.then(function (reg) {
      var worker = reg.active || nav.serviceWorker.controller;
      if (!worker) return false;
      worker.postMessage(message);
      return true;
    }).catch(function () { return false; });
  }

  function warm() { return post({ type: 'emfd-cache-warm', urls: imageUrls() }); }

  function status() {
    if (!supported) return Promise.resolve({ supported: false });
    return nav.serviceWorker.ready.then(function (reg) {
      return new Promise(function (resolve) {
        var channel = new MessageChannel();
        var timer = setTimeout(function () { resolve({ supported: true, timeout: true }); }, 5000);
        channel.port1.onmessage = function (event) {
          clearTimeout(timer);
          resolve(Object.assign({ supported: true, persisted: state.persisted, progress: state.progress }, event.data));
        };
        (reg.active || nav.serviceWorker.controller).postMessage({ type: 'emfd-cache-status' }, [channel.port2]);
      });
    });
  }

  function persist() {
    try {
      if (nav.storage && nav.storage.persist) {
        return nav.storage.persisted().then(function (already) { return already || nav.storage.persist(); })
          .then(function (value) { state.persisted = Boolean(value); return state.persisted; })
          .catch(function () { state.persisted = false; return false; });
      }
    } catch (_) {}
    return Promise.resolve(false);
  }

  root.EMFDOffline = Object.freeze({ supported: supported, state: state, warm: warm, status: status, imageUrls: imageUrls });
  if (!supported) return;

  nav.serviceWorker.addEventListener('message', function (event) {
    var data = event.data || {};
    if (data.type !== 'emfd-cache-progress') return;
    state.progress = data;
    try { root.dispatchEvent(new CustomEvent('emfd-offline-progress', { detail: data })); } catch (_) {}
  });

  function start() {
    persist();
    var idle = root.requestIdleCallback || function (fn) { return setTimeout(fn, 1200); };
    idle(function () { warm(); }, { timeout: 4000 });
  }
  if (root.document && root.document.readyState === 'complete') start();
  else root.addEventListener('load', start, { once: true });
  // Neue Manifest-Revision: neu gemeldete Vorderseiten nachladen (bereits gespeicherte werden übersprungen).
  root.addEventListener('emfd-media-updated', function () { warm(); });
})(globalThis);

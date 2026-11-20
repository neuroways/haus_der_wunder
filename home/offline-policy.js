/* EMFD-CACHE-01 · Offline- und Cache-Regeln (reine Funktionen, ohne Browser-Abhängigkeit).
 *
 * Wird vom Service Worker (importScripts) und von den Node-Tests (require) genutzt.
 * Entscheidet nur, WAS wie behandelt wird – nicht, wann geladen wird.
 *
 *  Klasse     | Strategie                                   | Cache
 *  -----------+---------------------------------------------+---------------------------
 *  document   | Netz zuerst (Zeitlimit), sonst Cache        | emfd-shell-<VERSION>
 *  shell      | Cache sofort, im Hintergrund aktualisieren  | emfd-shell-<VERSION>
 *  manifest   | Netz zuerst, sonst letzte gute Fassung      | emfd-shell-<VERSION>
 *  image      | Cache zuerst; Hash-Namen nie neu laden      | emfd-media-images-v1 (versionsübergreifend)
 *  audio      | Cache zuerst ab dem ersten Abspielen,       | emfd-media-audio-v1  (versionsübergreifend)
 *             | Teilanfragen (Range/206) aus dem Cache      |
 */
(function (root) {
  'use strict';

  var VERSION = 'cache01-v8';
  var CACHES = Object.freeze({
    shell: 'emfd-shell-' + VERSION,
    images: 'emfd-media-images-v1',
    audio: 'emfd-media-audio-v1'
  });
  // Frühere Bild-Caches (PERF-01 bis v0.6.70). Inhalte werden beim Aktivieren übernommen, nicht neu geladen.
  var LEGACY_CACHE = /^(?:emfd-images-|emfd-card-media-)/;
  var IMAGE_EXT = /\.(?:webp|png|jpe?g|gif|avif|svg)$/i;
  var AUDIO_EXT = /\.(?:mp3|m4a|aac|ogg|oga|wav)$/i;
  // Versionierte Dateinamen mit Inhalts-Hash, z. B. O01-630x1080-v1-47041d64df.webp,
  // O01-front-r2-21eca783.png. Solche Dateien ändern sich nie – nie erneut laden.
  var HASHED = /[-_.](?:[0-9a-f]{8}|[0-9a-f]{10}|[0-9a-f]{12}|[0-9a-f]{16}|[0-9a-f]{64})\.[a-z0-9]+$/i;

  function parse(url, base) {
    try { return new URL(url, base); } catch (_) { return null; }
  }

  /** Ordnet eine Anfrage einer Klasse zu. scopeHref = Adresse des Service-Worker-Skripts. */
  function classify(url, scopeHref) {
    var u = parse(url, scopeHref), scope = parse('./', scopeHref), media = parse('../media/', scopeHref);
    if (!u || !scope || !media || u.origin !== scope.origin) return null;
    var p = u.pathname;
    if (p.indexOf(media.pathname) === 0) {
      if (p === media.pathname + 'manifest.json') return 'manifest';
      if (AUDIO_EXT.test(p)) return 'audio';
      if (IMAGE_EXT.test(p)) return 'image';
      if (/\/media-loader\.m?js$/.test(p)) return 'shell';
      return null;
    }
    if (p.indexOf(scope.pathname) !== 0) return null;
    if (/\/(?:tests|qa|architecture|scripts)\//.test(p.slice(scope.pathname.length - 1))) return null;
    if (/(?:service-worker|sw)\.js$/.test(p)) return null;
    if (AUDIO_EXT.test(p)) return 'audio';
    if (IMAGE_EXT.test(p)) return 'image';
    if (p === scope.pathname || /\.html?$/.test(p)) return 'document';
    if (/\.(?:js|mjs|css|json|webmanifest|woff2?|ttf|otf|txt|md)$/.test(p)) return 'shell';
    return null;
  }

  function isImmutable(url) {
    var u = parse(url, 'https://x.invalid/');
    return Boolean(u && HASHED.test(u.pathname));
  }

  /** Cache-Schlüssel: Medien ohne Wiederholungs-/Cache-Parameter; App-Dateien mit ?v= (Versionsstempel). */
  function cacheKey(url, kind) {
    var u = parse(url, 'https://x.invalid/');
    if (!u) return url;
    u.hash = '';
    u.searchParams.delete('emfd_retry');
    if (kind === 'image' || kind === 'audio') u.search = '';
    return u.href;
  }

  /** Range-Kopf „bytes=a-b“ → {start,end} (inklusive) oder null, wenn nicht erfüllbar. */
  function parseRange(header, size) {
    var m = /^bytes=(\d*)-(\d*)$/.exec(String(header || '').trim());
    if (!m || !(size > 0) || (m[1] === '' && m[2] === '')) return null;
    var start, end;
    if (m[1] === '') { // Suffix: die letzten N Bytes
      var n = Number(m[2]);
      if (!(n > 0)) return null;
      start = Math.max(0, size - n); end = size - 1;
    } else {
      start = Number(m[1]);
      end = m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1);
    }
    if (!(start >= 0) || start > end || start >= size) return null;
    return { start: start, end: end };
  }

  /** Nur Medien desselben Ursprungs unter ../media/ oder assets/ dürfen vorab geladen werden. */
  function acceptWarmUrl(url, scopeHref) {
    var kind = classify(url, scopeHref);
    return kind === 'image' ? cacheKey(parse(url, scopeHref).href, 'image') : null;
  }

  /** Bilder aus dem Raum- und Szenenregister (data/registry.js, BOOK-01a) für die Offline-Liste.
   *  Aufgenommen wird nur, was als Original eingebunden und ausgeliefert ist (integration 'original',
   *  verfuegbarkeit 'vorhanden', Datei gesetzt) – nie Platzhalter. Stufe 'start': Medien des Eingangs
   *  (Räume der Ebene AUSSEN), Stufe 'house': alle übrigen. Neue Szenenbilder kommen so ohne Handpflege dazu. */
  function registerImages(registry) {
    var out = { start: [], house: [] };
    if (!registry || typeof registry !== 'object' || !registry.medien) return out;
    var outside = {};
    (registry.raeume || []).forEach(function (room) { if (room && room.ebene === 'AUSSEN') outside[room.id] = true; });
    var stageOf = {};
    var mark = function (mediaId, roomId) { if (mediaId && outside[roomId]) stageOf[mediaId] = 'start'; };
    (registry.raeume || []).forEach(function (room) { if (room) { mark(room.bild, room.id); mark(room.vorschau, room.id); } });
    (registry.szenen || []).forEach(function (scene) { if (scene) { mark(scene.medium, scene.raumId); mark(scene.platzhalter, scene.raumId); } });
    (registry.geraete || []).forEach(function (device) { if (device) mark(device.bild, device.raumId); });
    Object.keys(registry.medien).sort().forEach(function (id) {
      var m = registry.medien[id];
      if (!m || typeof m.datei !== 'string' || !m.datei || m.integration !== 'original' || m.verfuegbarkeit !== 'vorhanden') return;
      if (!IMAGE_EXT.test(m.datei.split('?')[0])) return;
      out[stageOf[id] || 'house'].push(m.datei);
    });
    return out;
  }

  var api = Object.freeze({ VERSION: VERSION, CACHES: CACHES, LEGACY_CACHE: LEGACY_CACHE,
    classify: classify, isImmutable: isImmutable, cacheKey: cacheKey, parseRange: parseRange, acceptWarmUrl: acceptWarmUrl,
    registerImages: registerImages });
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.EMFDOfflinePolicy = api;
})(typeof self !== 'undefined' ? self : globalThis);

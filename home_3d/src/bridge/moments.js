// EMFD · Brücke zur Moments-PWA · v0.5.1
// Protokoll kompatibel zu pwa-referenz/P08-Musikplayer-v0.5:
//   3D (iframe) -> PWA: {type:'EMFD_P08_OPEN_MUSIC', objectId:'musicbox', source:'emfd-3d'}
//   PWA -> 3D:          {type:'EMFD_P08_MUSIC_UNAVAILABLE'}
// Die PWA öffnet ihren vorhandenen #music-dialog (music-open.click()). Kein Audio im 3D-Modul,
// kein automatischer Start: Abspielen entscheidet die Nutzerin im Player der App.
// Nachrichten nur an/aus dem eigenen Ursprung.

export function isEmbedded(win = globalThis.window) { return !!win && win.parent && win.parent !== win; }

export function requestMusic({ win = globalThis.window } = {}) {
  if (!isEmbedded(win)) return false;
  try {
    win.parent.postMessage({ type: 'EMFD_P08_OPEN_MUSIC', objectId: 'musicbox', source: 'emfd-3d', version: '0.5.1' }, win.location.origin);
    return true;
  } catch { return false; }
}

export function notifyObject(id, { win = globalThis.window } = {}) {
  if (!isEmbedded(win)) return false;
  try {
    win.parent.postMessage({ type: 'emfd-3d:object', version: '0.5.1', id }, win.location.origin);
    return true;
  } catch { return false; }
}

export function onParentMessage(handler, { win = globalThis.window } = {}) {
  if (!win) return;
  win.addEventListener('message', e => {
    if (e.origin !== win.location.origin || e.source !== win.parent) return;
    handler(e.data || {});
  });
}

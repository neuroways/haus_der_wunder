// EMFD · Steuerungsarten Basic / Pro · v0.5.1
//
// Basic (Voreinstellung, alle Geräte): intuitiv entdecken
//   Tippen/Klicken = hingehen bzw. Objekt benutzen · Wischen/Ziehen = waagerecht umsehen
//   Horizont bleibt gerade · Kontextknöpfe (Kartentisch, Spieluhr) · keine Tastenbelegung nötig
// Pro (für Erfahrene):
//   Tastatur: W/S bzw. ↑/↓ vor/zurück · A/D seitwärts · ←/→ bzw. Q/E drehen · Umschalt = schneller
//             Leertaste/Eingabe/F = Objekt in Bildmitte benutzen · Klick ins Bild = Maus fangen
//             (Umsehen frei inkl. Neigung) · Esc = Maus frei
//   Touch:    linker Daumen-Stick = gehen (stufenlos) · rechte Bildhälfte ziehen = frei umsehen
//   Tippen auf Boden/Objekte funktioniert weiterhin.

export const MODES = ['basic', 'pro'];
export const STORAGE_KEY = 'emfd3d.steuerung';

// Reine Abbildung gedrückter Tasten -> Eingabe (in Node getestet)
export function keysToInput(keys, mode) {
  if (mode !== 'pro') return { f: 0, s: 0, turn: 0, run: false };
  const k = c => keys.has(c);
  const f = (k('KeyW') || k('ArrowUp') ? 1 : 0) - (k('KeyS') || k('ArrowDown') ? 1 : 0);
  const s = (k('KeyD') ? 1 : 0) - (k('KeyA') ? 1 : 0);
  const turn = (k('ArrowLeft') || k('KeyQ') ? 1 : 0) - (k('ArrowRight') || k('KeyE') ? 1 : 0);
  return { f, s, turn, run: k('ShiftLeft') || k('ShiftRight') };
}

// Basic: eine Geste = eine Achse. Nach 10 px entscheidet die überwiegende Richtung;
// senkrecht nur, wenn deutlich steiler als 55° – schräges Wischen dreht, kippt aber nicht.
export function gestureAxis(dx, dy, threshold = 10) {
  if (Math.hypot(dx, dy) < threshold) return null;
  return Math.abs(dy) > 1.4 * Math.abs(dx) ? 'v' : 'h';
}

export const INTERACT_KEYS = new Set(['Space', 'Enter', 'KeyF']);

// Stick-Auslenkung (px) -> Eingabe -1..1 mit Totzone 12 % und weicher Kennlinie
export function stickToInput(dx, dy, radius) {
  let x = dx / radius, y = -dy / radius;
  const m = Math.hypot(x, y);
  if (m < 0.12) return { f: 0, s: 0 };
  const clamped = Math.min(1, m), eased = ((clamped - 0.12) / 0.88) ** 1.35;
  return { f: y / m * eased, s: x / m * eased };
}

export function loadMode(storage = globalThis.localStorage) {
  try { const v = storage && storage.getItem(STORAGE_KEY); return MODES.includes(v) ? v : null; } catch { return null; }
}
export function saveMode(mode, storage = globalThis.localStorage) {
  try { storage && storage.setItem(STORAGE_KEY, mode); } catch { /* privater Modus o. Ä. */ }
}

export function hintText(mode, { touch }) {
  if (mode === 'pro') return touch ? 'Stick: gehen · rechts ziehen: umsehen · Tippen: benutzen'
    : 'WASD/Pfeile: gehen · Q/E: drehen · Klick: Maus fangen · Umschalt: schneller · Leertaste: benutzen';
  return touch ? 'Tippen: gehen/anschauen · Wischen: umsehen' : 'Klicken: gehen/anschauen · Ziehen: umsehen';
}

// Virtueller Stick (nur Pro + Touch). Liefert laufend {f, s}.
export function createStick(el) {
  const knob = el.querySelector('.knob');
  const state = { f: 0, s: 0, id: null };
  let cx = 0, cy = 0, R = 50;
  const reset = () => { state.f = state.s = 0; state.id = null; knob.style.transform = 'translate(-50%,-50%)'; el.classList.remove('active'); };
  el.addEventListener('pointerdown', e => {
    e.preventDefault(); e.stopPropagation();
    const b = el.getBoundingClientRect(); cx = b.left + b.width / 2; cy = b.top + b.height / 2; R = b.width / 2;
    state.id = e.pointerId; el.setPointerCapture(e.pointerId); el.classList.add('active'); move(e);
  });
  const move = e => {
    if (e.pointerId !== state.id) return;
    let dx = e.clientX - cx, dy = e.clientY - cy; const m = Math.hypot(dx, dy);
    if (m > R) { dx *= R / m; dy *= R / m; }
    knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    Object.assign(state, stickToInput(dx, dy, R));
  };
  el.addEventListener('pointermove', move);
  for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) el.addEventListener(ev, e => { if (e.pointerId === state.id) reset(); });
  return state;
}

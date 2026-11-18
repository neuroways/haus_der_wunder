// EMFD · Startlader · v0.5.0
// Ohne eigene Imports, damit er auch dann läuft, wenn Three.js fehlt.
// Jeder Fehler (fehlendes vendor/, GLB, JSON, WebGL) wird sichtbar gemeldet statt endlos zu laden.
const box = document.getElementById('loading');
const msg = document.getElementById('loading-text');
const setProgress = t => { msg.textContent = t; };

function fail(err) {
  const text = String(err && (err.message || err)) || 'Unbekannter Fehler';
  let hint = 'Bitte Seite neu laden.';
  if (/three|vendor|module specifier|Failed to fetch dynamically imported module|Importing a module script failed/i.test(text))
    hint = 'Three.js fehlt: Ordner vendor/three/ (build/, examples/jsm/) muss neben index.html liegen.';
  else if (/\.glb/i.test(text)) hint = 'Das Hausmodell konnte nicht geladen werden (Haus-v0.4.4.glb).';
  else if (/WebGL|context/i.test(text)) hint = 'Dieses Gerät oder dieser Browser stellt kein WebGL bereit.';
  else if (location.protocol === 'file:') hint = 'Bitte über einen Webserver öffnen, nicht per Doppelklick.';
  box.classList.add('error');
  box.innerHTML = '';
  const h = document.createElement('p'); h.className = 'err-title'; h.textContent = '3D-Ansicht konnte nicht gestartet werden.';
  const p = document.createElement('p'); p.textContent = hint;
  const s = document.createElement('small'); s.textContent = text;
  const b = document.createElement('button'); b.textContent = 'Erneut versuchen'; b.onclick = () => location.reload();
  box.append(h, p, s, b);
  box.dataset.state = 'error';
  console.error('[EMFD 3D] Startfehler:', err);
}

const watchdog = setTimeout(() => fail(new Error('Zeitüberschreitung beim Laden (60 s).')), 60000);
window.addEventListener('unhandledrejection', e => { if (box.dataset.state !== 'ready') { clearTimeout(watchdog); fail(e.reason); } });

try {
  const app = await import('./app.js');
  await app.start({ setProgress, fail });
  clearTimeout(watchdog);
  box.dataset.state = 'ready';
  box.classList.add('hidden');
} catch (err) {
  clearTimeout(watchdog);
  fail(err);
}

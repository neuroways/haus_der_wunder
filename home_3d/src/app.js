// EMFD · 3D-Modul · v0.5.0 · Hauptprogramm
// Schichten: Darstellung (GLB-Architektur, Objekt-Assets, Teezimmer-Studien) | Kollision (navigation-eg/og.json)
//            | Interaktion (unsichtbare Registerboxen). Keine Musik, kein Audio.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { WorldNav } from './nav/world-nav.js';
import { Walker, WALK } from './nav/walker.js';
import { fovFor } from './nav/camera.js';
import { prepareArchitecture } from './world/architecture.js';
import { buildTeezimmerStudies } from './world/teezimmer-studien.js';
import { buildPickProxies, pickFromHits, TEEZIMMER_LABELS } from './world/interaction.js';
import { createMinimap } from './ui/minimap.js';
import { keysToInput, gestureAxis, INTERACT_KEYS, loadMode, saveMode, hintText, createStick } from './ui/controls.js';
import { notifyObject, requestMusic, onParentMessage } from './bridge/moments.js';

export const VERSION = '0.5.2';
const $ = id => document.getElementById(id);

export async function start({ setProgress, fail }) {
  setProgress('Lade Navigations- und Registerdaten …');
  const [eg, og, stairs, register, matReg, assetReg, interactions] = await Promise.all([
    fetchJSON('./data/navigation-eg.json'), fetchJSON('./data/navigation-og.json'), fetchJSON('./data/treppen.json'),
    fetchJSON('./data/einrichtung.json'), fetchJSON('./data/materialien.json'), fetchJSON('./data/assets.json'),
    fetchJSON('./data/interaktionen.json'),
  ]);
  const world = new WorldNav({ eg, og, stairs });
  let level = 'EG';
  const nav = () => world.grid(level);

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  document.body.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#819aa7');
  scene.fog = new THREE.Fog('#819aa7', 25, 75);
  scene.add(new THREE.HemisphereLight(0xc3e2ff, 0x6e4d39, 2.2));
  const sun = new THREE.DirectionalLight(0xffdeb1, 2.9); sun.position.set(5, 16, 3); scene.add(sun);

  const camera = new THREE.PerspectiveCamera(fovFor(innerWidth / innerHeight), innerWidth / innerHeight, 0.055, 160);
  camera.rotation.order = 'YXZ';

  // Darstellung: Teezimmer-Studien (ohne Kollision/Klick)
  const studies = buildTeezimmerStudies(THREE, renderer);
  scene.add(studies.group);
  // Stellflächen: Möbel ohne fertiges Modell werden als feine Bodenmarkierung gezeigt (keine Quader,
  // keine Kollisionskörper) – damit unsichtbare Sperren in noch leeren Räumen erklärbar bleiben.
  const decals = new THREE.Group(); decals.name = 'EMFD_Stellflaechen';
  const decalMat = new THREE.LineBasicMaterial({ color: 0xd9b778, transparent: true, opacity: 0.55, depthWrite: false });
  for (const [lv, data] of [['EG', eg], ['OG', og]]) for (const f of data.footprints) {
    if (TEEZIMMER_LABELS[f.id]) continue;
    const [x0, x1, y0, y1] = f.rect, zz = data.z + 0.012;
    const pts = [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]].map(([px, py]) => new THREE.Vector3(px, zz, -py));
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), decalMat);
    line.name = 'STELLFLAECHE_' + f.id; line.raycast = () => {}; decals.add(line);
  }
  scene.add(decals);

  // Interaktion: unsichtbare Registerboxen
  const picks = buildPickProxies(THREE, register, TEEZIMMER_LABELS);
  scene.add(picks.group);

  setProgress('Lade Hausmodell v0.4.4 …');
  const gltf = await new Promise((res, rej) => new GLTFLoader().load('./assets/arch/Haus-v0.4.4.glb', res,
    e => e.total && setProgress(`Lade Hausmodell v0.4.4 … ${Math.round(e.loaded / e.total * 100)} %`), rej));
  const model = gltf.scene;
  setProgress('Lade Materialien …');
  const textures = await loadTextures(THREE, renderer, matReg, ['MAT-PUTZ', 'MAT-01-WALNUSS']);
  const arch = prepareArchitecture(THREE, model, { registry: matReg, textures });
  scene.add(model);

  // Wiederverwendbare Objekt-Assets: ersetzen die jeweiligen Formstudien-Teile vollständig
  setProgress('Lade Objekt-Assets …');
  const assetLoader = new GLTFLoader();
  const assets = {};
  for (const a of assetReg.assets) {
    try {
      const [g, meta] = await Promise.all([assetLoader.loadAsync('./' + a.datei), fetchJSON('./' + a.meta)]);
      const obj = g.scene; obj.name = 'ASSET_' + a.id;
      obj.position.set(meta.placement.x, meta.placement.z, -meta.placement.y);
      obj.rotation.y = (meta.placement.rotation_deg || 0) * Math.PI / 180;
      obj.traverse(o => { if (o.isMesh) { o.raycast = () => {}; if (o.material.map) { o.material.map.colorSpace = THREE.SRGBColorSpace; o.material.map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); } } });
      studies.group.add(obj);
      const removed = studies.removeTagged(a.ersetzt);
      assets[a.id] = { removedStudyMeshes: removed };
    } catch (err) {
      console.warn('[EMFD 3D] Asset nicht geladen, Formstudie bleibt sichtbar:', a.id, err);
      assets[a.id] = { error: String(err.message || err) };
    }
  }
  console.info('[EMFD 3D v' + VERSION + '] Architektur', arch.stats);

  // ---- Zustand
  let current = null;
  // Steuerungsart: Basic (entdecken) / Pro (WASD, Pfeile, Maus, Stick) – gespeichert je Gerät
  let mode = loadMode() || 'basic', freeLook = mode === 'pro';
  const touch = matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
  const stick = createStick($('stick'));
  const keys = new Set();
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const walker = new Walker(nav(), { reduceMotion });

  // Ziel-Marker (eindeutig UI, kein Hausobjekt)
  const marker = new THREE.Mesh(new THREE.RingGeometry(0.22, 0.3, 40),
    new THREE.MeshBasicMaterial({ color: 0xffd48b, side: THREE.DoubleSide, transparent: true, opacity: 0.9, depthWrite: false }));
  marker.rotation.x = -Math.PI / 2; marker.visible = false; marker.raycast = () => {}; scene.add(marker);

  const roomSel = $('room');
  for (const p of world.places()) roomSel.add(new Option(p.level === 'OG' ? `${p.id} · OG` : p.id, p.id));

  const minimap = createMinimap($('mapcanvas'), () => nav(), r => spawn(r));
  const stairBtn = $('stair'), actionBar = $('actions'), levelBtn = $('level-view');
  levelBtn.onclick = () => walker.levelView();

  function setLevel(l) { level = l; walker.setGrid(nav()); }

  function spawn(room) {
    const s = world.spawnOf(room); if (!s) return;
    setLevel(s.level);
    walker.teleport(s.x, s.y, room === 'Teezimmer' ? 2.18 : world.bestViewYaw(s.level, s.x, s.y));
    marker.visible = false; setRoom(room); renderActions();
  }
  function setRoom(r) {
    if (!r || r === current) return;
    current = r; roomSel.value = r; renderActions();
    const t = $('room-toast'); t.textContent = level === 'OG' ? `${r} · Obergeschoss` : r;
    t.classList.add('show'); clearTimeout(setRoom.t); setRoom.t = setTimeout(() => t.classList.remove('show'), 1800);
  }

  function hint(text, ms = 2200) { const el = $('route-indicator'); el.textContent = text; el.classList.add('show'); clearTimeout(hint.t); hint.t = setTimeout(() => el.classList.remove('show'), ms); }
  function info(text) { const el = $('object-info'); el.textContent = text; el.hidden = false; clearTimeout(info.t); info.t = setTimeout(() => el.hidden = true, 3200); }

  // ---- Ziele im Teezimmer: hingehen, Platz nehmen, Spieluhr
  const targets = interactions.ziele;
  const targetOfObject = {};
  for (const [key, t] of Object.entries(targets)) for (const id of t.objekte) targetOfObject[id] = key;
  let activeTarget = null; // Ziel, an dem man gerade sitzt/steht

  function goTo(key) {
    const t = targets[key]; if (!t) return;
    if (current !== 'Teezimmer' || level !== 'EG') spawn('Teezimmer');
    activeTarget = null; renderActions();
    const arrive = () => {
      if (t.sitz) { walker.sit(t.sitz); activeTarget = key; walker.onArrive = () => renderActions(); }
      else { walker.pose = { yaw: t.blick.yaw, pitch: t.blick.pitch }; walker.onArrive = () => { activeTarget = key; renderActions(); }; }
      marker.visible = false; renderActions();
    };
    const [ax, ay] = t.annaehern;
    if (Math.hypot(walker.x - ax, walker.y - ay) < 0.15 && !walker.seated) { arrive(); return; }
    if (!walker.walkTo(ax, ay, { onArrive: arrive })) { hint('Kein freier Weg dorthin'); return; }
    marker.position.set(ax, world.z[level] + 0.045, -ay); marker.visible = true;
  }

  // Gegenstand anschauen: nah -> nur Blick dorthin; weiter als 2,6 m -> auf ~1,5 m herangehen, dann hinsehen
  function lookAtObject(obj) {
    const [ox, oy, oz] = obj.center, d = Math.hypot(ox - walker.x, oy - walker.y), z0 = world.z[level];
    if (d <= 2.6) { walker.lookAt(ox, oy, oz, { levelZ: z0 }); return; }
    const k = 1.5 / d, g = nav(), stand = g.nearestFree(ox + (walker.x - ox) * k, oy + (walker.y - oy) * k, 1.2);
    if (!stand || !walker.walkTo(stand[0], stand[1], { onArrive: () => { walker.lookAt(ox, oy, oz, { levelZ: z0 }); renderActions(); } })) {
      walker.lookAt(ox, oy, oz, { levelZ: z0 }); return;
    }
    marker.position.set(stand[0], z0 + 0.045, -stand[1]); marker.visible = true; activeTarget = null; renderActions();
  }

  function openMusic() {
    if (requestMusic()) hint('Musikplayer der App wird geöffnet …');
    else {
      const el = $('music-hint'); el.hidden = false;
    }
  }
  onParentMessage(m => { if (m.type === 'EMFD_P08_MUSIC_UNAVAILABLE') hint('Musikplayer konnte nicht geöffnet werden. Öffne Musik über die Hauptnavigation.', 4500); });
  $('music-hint-close').onclick = () => { $('music-hint').hidden = true; };

  // Kontextleiste: im Teezimmer feste Ziele; am Ziel passende Aktion
  function renderActions() {
    actionBar.innerHTML = '';
    const add = (label, fn, primary = false) => { const b = document.createElement('button'); b.textContent = label; b.onclick = fn; if (primary) b.className = 'primary'; actionBar.append(b); };
    if (walker.seated) {
      if (activeTarget === 'kartentisch') add('Spieluhr', () => goTo('spieluhr'));
      add('Aufstehen', () => { walker.standUp(); activeTarget = null; walker.onArrive = () => renderActions(); renderActions(); }, true);
    } else if (activeTarget === 'spieluhr') {
      add('♪ Musik öffnen', openMusic, true);
      add('Kartentisch', () => goTo('kartentisch'));
    } else if (current === 'Teezimmer' && level === 'EG') {
      add('Kartentisch', () => goTo('kartentisch'), true);
      add('Spieluhr', () => goTo('spieluhr'));
    }
    if (!walker.seated) add('⟳ Umsehen', () => { activeTarget = null; marker.visible = false; walker.startSweep(); renderActions(); });
    actionBar.hidden = !actionBar.children.length;
  }

  // ---- Eingabe: horizontal wischen (mit sanftem Auslaufen), tippen zum Gehen
  const canvas = renderer.domElement; canvas.style.touchAction = 'none';
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(), ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit = new THREE.Vector3();
  let drag = null, spin = 0;
  const SENS = 0.0042; // rad/px: halbe Bildschirmbreite (195 px) ≈ 47°, entspricht etwa dem Bildwinkel
  canvas.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (mode === 'pro' && e.pointerType === 'mouse') {
      if (document.pointerLockElement !== canvas) { canvas.requestPointerLock?.(); return; }
      interactCenter(); return;
    }
    spin = 0; walker.sweep = null; drag = { x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, t: performance.now(), lt: performance.now(), v: 0, moved: false }; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => {
    if (!drag) return;
    const now = performance.now(), dx = e.clientX - drag.lx, dy = e.clientY - drag.ly;
    if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 9) {
      drag.moved = true; drag.axis = freeLook ? 'both' : gestureAxis(e.clientX - drag.x, e.clientY - drag.y, 9);
    }
    if (drag.moved) {
      // "Raum greifen" wie bei Street View: Finger nach rechts -> Raum folgt (Blick nach links),
      // Finger nach unten -> Blick nach oben. Gilt für Touch und Ziehen mit der Maus.
      if (drag.axis === 'v') walker.userTurn(0, dy * SENS * 0.8, false);        // Basic: nur neigen
      else if (drag.axis === 'h') walker.userTurn(dx * SENS, 0, false);         // Basic: nur drehen
      else walker.userTurn(dx * SENS, dy * SENS, freeLook);                     // Pro (Touch/Ziehen): frei
      const dtm = Math.max(1, now - drag.lt); drag.v = 0.7 * drag.v + 0.3 * (dx * SENS / dtm * 1000);
    }
    drag.lx = e.clientX; drag.ly = e.clientY; drag.lt = now;
  });
  canvas.addEventListener('pointerup', e => {
    if (!drag) return; const d = drag; drag = null;
    if (!d.moved && performance.now() - d.t < 650) { tap(e); return; }
    if (d.axis !== 'v' && !reduceMotion && performance.now() - d.lt < 80) spin = Math.max(-3, Math.min(3, d.v)); // Auslaufen nur bei Schwung
  });
  canvas.addEventListener('pointercancel', () => drag = null);

  function tap(e) {
    ptr.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight * 2 - 1));
    ray.setFromCamera(ptr, camera);
    if (studies.group.visible) {
      const obj = pickFromHits(ray.intersectObjects(picks.proxies, false), 7);
      if (obj) {
        notifyObject(obj.id);
        const key = targetOfObject[obj.id];
        if (key === 'spieluhr' && activeTarget === 'spieluhr') { openMusic(); return; }
        if (key) { info(targets[key].label); goTo(key); return; }
        info(obj.label); lookAtObject(obj); return;
      }
    }
    if (walker.seated) { walker.standUp(); activeTarget = null; walker.onArrive = () => renderActions(); renderActions(); return; }
    ground.constant = -world.z[level];
    if (!ray.ray.intersectPlane(ground, hit)) return;
    const gx = hit.x, gy = -hit.z, g = nav();
    if (Math.hypot(gx - walker.x, gy - walker.y) > 25 || (!g.roomAt(gx, gy) && !g.nearestFree(gx, gy))) { hint('Außerhalb der begehbaren Bereiche'); return; }
    activeTarget = null;
    if (!walker.walkTo(gx, gy, { onArrive: () => { marker.visible = false; renderActions(); } })) { hint('Kein freier Weg dorthin'); return; }
    const end = walker.goal; marker.position.set(end[0], world.z[level] + 0.045, -end[1]); marker.visible = true;
    renderActions();
  }

  addEventListener('keydown', e => {
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'SELECT') return;           // Raumauswahl behält ihre Pfeiltasten
    if (mode !== 'pro') return;
    if (tag === 'BUTTON' && (e.code === 'Space' || e.code === 'Enter')) return; // fokussierten Knopf normal auslösen
    if (INTERACT_KEYS.has(e.code)) { e.preventDefault(); if (!e.repeat) interactCenter(); return; }
    keys.add(e.code); if (e.code.startsWith('Arrow')) e.preventDefault();
  });
  addEventListener('keyup', e => keys.delete(e.code));
  addEventListener('blur', () => keys.clear());

  // Objekt in der Bildmitte benutzen (Pro: Leertaste/Eingabe/F oder Klick bei gefangener Maus)
  function interactCenter() { tap({ clientX: innerWidth / 2, clientY: innerHeight / 2 }); }

  function setMode(m) {
    mode = m; freeLook = m === 'pro'; saveMode(m); keys.clear();
    document.body.dataset.mode = m;
    for (const b of document.querySelectorAll('#mode-toggle button')) b.setAttribute('aria-pressed', String(b.dataset.mode === m));
    $('stick').hidden = !(m === 'pro' && touch);
    $('orient').textContent = hintText(m, { touch });
    if (m === 'basic' && document.pointerLockElement) document.exitPointerLock();
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  }
  for (const b of document.querySelectorAll('#mode-toggle button')) b.onclick = () => setMode(b.dataset.mode);
  for (const b of document.querySelectorAll('#mode-choice [data-mode]')) b.onclick = () => { setMode(b.dataset.mode); $('mode-choice').hidden = true; };
  if (!loadMode()) $('mode-choice').hidden = false;
  setMode(mode);
  document.addEventListener('mousemove', e => { if (document.pointerLockElement === canvas) walker.userTurn(-e.movementX * 0.0022, -e.movementY * 0.0022, freeLook); });

  // ---- Treppenwechsel (geführt; Stufenbegehung folgt)
  stairBtn.onclick = () => {
    const t = world.transfer(stairBtn.dataset.stair, level); if (!t) return;
    const go = () => { setLevel(t.level); walker.teleport(t.x, t.y); marker.visible = false; };
    if (reduceMotion) go();
    else { const f = $('fade'); f.classList.add('on'); setTimeout(() => { go(); f.classList.remove('on'); }, 260); }
  };

  // ---- Bedienelemente
  roomSel.onchange = () => roomSel.value && spawn(roomSel.value);
  $('reset').onclick = () => spawn(current || 'Teezimmer');
  $('walls').onclick = () => { studies.group.visible = !studies.group.visible; toggleBtn($('walls'), studies.group.visible, 'Ausstattung'); };
  $('matcheck').onclick = () => {
    const on = !studies.materialTests[0].visible; studies.materialTests.forEach(m => m.visible = on);
    for (const [id, tex] of Object.entries(textures)) { const m = arch.materials[id]; if (m) { m.map = on ? tex : null; m.needsUpdate = true; } }
    toggleBtn($('matcheck'), on, 'Materialien');
  };
  $('decals').onclick = () => { decals.visible = !decals.visible; toggleBtn($('decals'), decals.visible, 'Stellflächen'); };
  $('hulls').onclick = () => { const on = !arch.placeholders[0]?.visible; arch.placeholders.forEach(m => m.visible = on); toggleBtn($('hulls'), on, 'Planungshüllen'); };
  $('bob').onclick = () => { walker.reduceMotion = !walker.reduceMotion; toggleBtn($('bob'), !walker.reduceMotion, 'Schrittbewegung'); };
  toggleBtn($('bob'), !reduceMotion, 'Schrittbewegung');
  $('options').onclick = () => { const open = $('top').classList.toggle('advanced'); $('options').setAttribute('aria-expanded', String(open)); $('options').textContent = open ? 'Optionen schließen' : 'Optionen'; };
  const mm = $('minimap'), mmTitle = mm.querySelector('h2');
  mmTitle.onclick = () => { const closed = mm.classList.toggle('collapsed'); mmTitle.textContent = closed ? 'Raumkarte anzeigen' : 'Raumkarte schließen'; if (!closed) minimap.size(); };
  mmTitle.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); mmTitle.click(); } };
  function toggleBtn(b, on, label) { b.textContent = `${label}: ${on ? 'an' : 'aus'}`; b.setAttribute('aria-pressed', String(on)); b.classList.toggle('active', on); }

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight; camera.fov = fovFor(camera.aspect); camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  // ---- Schleife
  const clock = new THREE.Clock();
  let mapTimer = 0, wasWalking = false;
  function frame() {
    // Echtzeit auch auf langsamen Geräten: lange Bildzeiten (bis 0,25 s) in Teilschritte ≤ 0,05 s zerlegen
    const total = Math.min(clock.getDelta(), 0.25), steps = Math.max(1, Math.ceil(total / 0.05)), dt = total / steps;
    if (spin) { walker.userTurn(spin * total, 0, false); spin *= Math.exp(-total * 5); if (Math.abs(spin) < 0.03) spin = 0; }
    const inp = keysToInput(keys, mode);
    const f = Math.max(-1, Math.min(1, inp.f + stick.f)), s = Math.max(-1, Math.min(1, inp.s + stick.s));
    if (inp.turn) walker.userTurn(inp.turn * WALK.keyTurnRate * dt);
    if (f || s) { marker.visible = false; if (activeTarget) { activeTarget = null; renderActions(); } }
    walker.manual(f, s, inp.run);
    for (let i = 0; i < steps; i++) {
      if (i && inp.turn) walker.userTurn(inp.turn * WALK.keyTurnRate * dt);
      walker.update(dt, { freeLook });
    }
    if (walker.blocked) { walker.blocked = false; marker.visible = false; hint('Weg blockiert – näheren Punkt wählen'); }
    const walking = !!walker.path;
    if (wasWalking && !walking && !walker.pose) marker.visible = false;
    wasWalking = walking;

    const r = world.placeAt(level, walker.x, walker.y); if (r) setRoom(r);
    levelBtn.hidden = !(Math.abs(walker.pitch) > 0.12 && !walker.seated && !walker.pose && !walker.path);
    const st = world.stairNear(level, walker.x, walker.y);
    if (st && !walking && !walker.seated) { stairBtn.hidden = false; stairBtn.textContent = `Treppe ${st.id} ${st.direction}`; stairBtn.dataset.stair = st.id; }
    else stairBtn.hidden = true;
    const c = walker.camera();
    camera.position.set(c.x, world.z[level] + c.eye, -c.y);
    camera.rotation.y = c.yaw; camera.rotation.x = c.pitch;
    if ((mapTimer += total) > 0.1) { mapTimer = 0; minimap.update([walker.x, walker.y], walker.yaw, current); $('status').textContent = `${current || '–'} · ${level} · x ${walker.x.toFixed(2)} · y ${walker.y.toFixed(2)} · v${VERSION}`; }
    renderer.render(scene, camera);
  }

  spawn('Teezimmer');
  renderer.setAnimationLoop(frame);
  // Für Browser-Tests (lesend): Zustand und Werkzeuge
  window.__emfd3d = { version: VERSION, world, level: () => level, arch: arch.stats, assets, walker,
    placeholdersVisible: () => arch.placeholders.filter(m => m.visible).length,
    setPose: (l, px, py, pyaw) => { setLevel(l); walker.teleport(px, py, pyaw); },
    drawCalls: () => renderer.info.render.calls, goTo, activeTarget: () => activeTarget,
    setMode, mode: () => mode, keysDown: () => [...keys],
    actions: () => [...actionBar.querySelectorAll('button')].map(b => b.textContent),
    screenOf: (px, py, pz = 0) => { const v = new THREE.Vector3(px, world.z[level] + pz, -py).project(camera); return [(v.x + 1) / 2 * innerWidth, (1 - v.y) / 2 * innerHeight, v.z < 1]; },
    state: () => ({ level, x: walker.x, y: walker.y, yaw: walker.yaw, pitch: walker.pitch, eye: walker.eye, speed: walker.speed, seated: !!walker.seated, room: current, fov: camera.fov, pathLength: walker.path ? walker.path.length : 0 }),
    spawn, tapAt: (cx, cy) => tap({ clientX: cx, clientY: cy }) };
  return window.__emfd3d;
}

async function loadTextures(THREE, renderer, reg, ids) {
  const loader = new THREE.TextureLoader(), out = {};
  await Promise.all(ids.map(id => new Promise(res => loader.load('./' + reg.materialien[id].datei, t => {
    t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    out[id] = t; res();
  }, undefined, () => { console.warn('[EMFD 3D] Textur fehlt', id); res(); }))));
  return out;
}

async function fetchJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
  return r.json();
}

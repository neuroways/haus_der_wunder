// EMFD · Architektur aus Haus-v0.4.4.glb · v0.5.0
// Trennung: Architektur wird gerendert; ITEM-Platzhalter werden NIE gerendert (CLAUDE.md:
// "Alte Platzhalter nicht parallel zu neuen Meshes rendern"). Kollision kommt ausschließlich
// aus data/navigation-eg.json, nicht aus sichtbaren Meshes.

import { applyWorldUVs } from './uv.js';

// GLTFLoader ersetzt Leerzeichen in Namen durch '_' (PropertyBinding.sanitizeNodeName) und hängt
// bei Dubletten '_1' an. Der Originalname steht in userData.name. Diese Abweichung ließ in v0.4.x
// Platzhalter sichtbar (Regel /^ITEM / griff nie) – deshalb immer den Originalnamen verwenden.
export function originalName(o) { return (o.userData && o.userData.name) || (o.parent && o.parent.userData && o.parent.userData.name) || o.name; }

// Reine Funktion (ohne Three.js) – in tests/ gegen alle 897 GLB-Namen (Original UND Three.js-Form) geprüft.
export function classifyMesh(name, materialName) {
  if (/^ITEM[ _]/.test(name)) return 'placeholder';
  const m = (materialName || '').toLowerCase();
  if (['wall', 'floor', 'green', 'glass', 'stairs', 'terrace', 'upper'].includes(m)) return 'architecture';
  if (m === 'furniture') return 'placeholder';
  return 'unknown';
}

// Tonwerte aus P2 v0.4.3 übernommen; je Materialname EINE gemeinsame Instanz
// (v0.4.x klonte je Mesh -> ~900 Materialinstanzen).
const TONES = {
  wall: { color: '#d8d4cb', roughness: 0.95 },
  floor: { color: '#72513c', roughness: 0.92 },
  green: { color: '#8b9b79', roughness: 0.95 },
  glass: { color: '#8ac9cf', roughness: 0.2, transparent: true, opacity: 0.29, depthWrite: false },
  stairs: { color: '#9d815a', roughness: 0.8 },
  terrace: { color: '#9c9690', roughness: 0.9 },
  upper: { color: '#a7a6a4', roughness: 0.9 },
};

// Welche Registermaterialien auf welche GLB-Flächen gehören (rein, testbar).
export function surfaceMaterialFor(name, materialName, registry) {
  const m = (materialName || '').toLowerCase();
  for (const [id, def] of Object.entries(registry.materialien)) {
    const f = def.flaechen || {};
    if (f.namen && f.namen.includes(name)) return id;
  }
  for (const [id, def] of Object.entries(registry.materialien)) {
    const f = def.flaechen || {};
    if (f.material && f.material === m) return id;
  }
  return null;
}

export function prepareArchitecture(THREE, root, { showPlaceholders = false, registry = null, textures = {} } = {}) {
  const shared = {};
  const stats = { architecture: 0, placeholder: 0, unknown: 0 };
  const placeholders = [];
  root.traverse(o => {
    if (!o.isMesh) return;
    const name = originalName(o);
    const kind = classifyMesh(name, o.material && o.material.name);
    stats[kind]++;
    if (kind === 'placeholder') {
      placeholders.push(o);
      o.visible = showPlaceholders;
      o.raycast = () => {};
      return;
    }
    const surf = registry ? surfaceMaterialFor(name, o.material.name, registry) : null;
    if (surf && textures[surf]) {
      applyWorldUVs(THREE, o, registry.materialien[surf].tile_m);
      if (!shared[surf]) {
        const d = registry.materialien[surf];
        shared[surf] = new THREE.MeshStandardMaterial({ name: surf, map: textures[surf], color: d.farbe || '#ffffff', roughness: d.rauheit ?? 0.9 });
      }
      o.material = shared[surf];
      o.matrixAutoUpdate = false; o.updateMatrix(); o.raycast = () => {};
      stats.textured = (stats.textured || 0) + 1;
      return;
    }
    const key = (o.material.name || 'unknown').toLowerCase();
    if (!shared[key]) {
      const t = TONES[key] || { color: '#999999', roughness: 0.9 };
      shared[key] = new THREE.MeshStandardMaterial({ ...t, name: key, side: key === 'glass' ? THREE.DoubleSide : THREE.FrontSide });
    }
    o.material = shared[key];
    o.matrixAutoUpdate = false; o.updateMatrix();
    o.raycast = () => {}; // Architektur ist weder Klick- noch Kollisionsfläche
  });
  return { stats, placeholders, materials: shared };
}

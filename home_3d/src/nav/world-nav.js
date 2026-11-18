// EMFD · Ebenen- und Treppennavigation · v0.5.0 (rein, testbar)
// Zwei Ebenen (EG ±0,00 / OG +3,20) mit je einem NavGrid; Treppen S1–S3 verbinden sie.
// v0.5.0: Treppenwechsel als geführter Übergang (Antritt <-> Austritt). Begehung der Stufen
// mit Höhenverlauf folgt in v0.5.1 auf Basis derselben Daten (data/treppen.json).
import { NavGrid } from './grid.js';

export const PLACE_ORDER = ['Halle', 'Teezimmer', 'Küche', 'Hof', 'Wintergarten', 'Musik', 'Atelier',
  'Glasgalerie', 'Terrasse', 'Bibliothek', 'Fensterzimmer', 'Schlafzimmer', 'Bad'];

export class WorldNav {
  constructor({ eg, og, stairs }) {
    this.levels = { EG: new NavGrid(eg), OG: new NavGrid(og) };
    this.z = { EG: eg.z, OG: og.z };
    this.stairs = stairs.treppen;
  }

  places() {
    const out = [];
    for (const [level, g] of Object.entries(this.levels))
      for (const id of Object.keys(g.spawns)) out.push({ id, level });
    out.sort((a, b) => PLACE_ORDER.indexOf(a.id) - PLACE_ORDER.indexOf(b.id));
    return out;
  }

  spawnOf(place) {
    for (const [level, g] of Object.entries(this.levels))
      if (g.spawns[place]) return { level, x: g.spawns[place][0], y: g.spawns[place][1] };
    return null;
  }

  grid(level) { return this.levels[level]; }

  // Treppe in Reichweite (Antritt auf EG bzw. Austritt auf OG)
  stairNear(level, x, y, reach = 1.2) {
    for (const s of this.stairs) {
      const end = level === 'EG' ? s.unten : s.oben;
      if (!end.punkt) continue;
      const d = Math.hypot(end.punkt[0] - x, end.punkt[1] - y);
      if (d <= reach) return { id: s.id, direction: level === 'EG' ? 'hinauf' : 'hinab', target: level === 'EG' ? s.oben : s.unten, distance: d };
    }
    return null;
  }

  transfer(stairId, fromLevel) {
    const s = this.stairs.find(t => t.id === stairId);
    if (!s) return null;
    const end = fromLevel === 'EG' ? s.oben : s.unten;
    return { level: end.ebene, x: end.punkt[0], y: end.punkt[1] };
  }

  // Startblick: Richtung mit der weitesten freien Sichtlinie im Raster (72 Richtungen, 5°).
  // Ersetzt v0.5.0-Entwurf "entfernteste Raumecke", der in mehreren Räumen dicht vor Wände blickte.
  // Bodenfreiheit statt Begehbarkeit: Möbel blockieren den Blick nicht, Wände/Glaskanten schon.
  bestViewYaw(level, x, y, { maxDist = 12, step = 0.1 } = {}) {
    const g = this.levels[level];
    let best = 0, bestScore = -1;
    const dist = new Float32Array(72);
    for (let i = 0; i < 72; i++) {
      const yaw = i * Math.PI / 36, dx = -Math.sin(yaw), dy = Math.cos(yaw);
      let d = 0;
      while (d < maxDist && g.isOpen(x + dx * d, y + dy * d)) d += step;
      dist[i] = d;
    }
    // Glättung über ±15° (Bildwinkel): bevorzugt breite offene Blickfelder statt schmaler Durchblicke
    for (let i = 0; i < 72; i++) {
      let s = 0; for (let k = -3; k <= 3; k++) s += dist[(i + k + 72) % 72];
      if (s > bestScore) { bestScore = s; best = i; }
    }
    return best * Math.PI / 36;
  }

  // Ort an einer Position; Treppenpodeste im OG gehören zu keinem Raumrechteck -> Ort der Treppe
  placeAt(level, x, y) {
    const r = this.levels[level].roomAt(x, y);
    if (r) return r;
    const st = this.stairNear(level, x, y, 1.6);
    return st ? (level === 'OG' ? this.stairs.find(s => s.id === st.id).oben.ort : null) : null;
  }
}

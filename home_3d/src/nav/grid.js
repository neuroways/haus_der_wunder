// EMFD · Navigationsraster EG · v0.5.0
// Reines JavaScript ohne Three.js, damit Kollision und Wegsuche in Node testbar sind.
// Koordinaten: Plan-Meter, x Osten, y Norden (Three.js: world.x = x, world.z = -y).

export class NavGrid {
  constructor(data) {
    this.data = data;
    this.cell = data.cell;
    this.nx = data.nx;
    this.ny = data.ny;
    this.walk = new Uint8Array(this.nx * this.ny);
    data.rows.forEach((runs, y) => {
      let x = 0, v = 0;
      for (const n of runs) {
        if (v) this.walk.fill(1, y * this.nx + x, y * this.nx + x + n);
        x += n; v ^= 1;
      }
    });
    this.rooms = data.rooms;
    this.spawns = data.spawns;
  }

  idx(ix, iy) { return iy * this.nx + ix; }
  toCell(x, y) { return [Math.floor(x / this.cell), Math.floor(y / this.cell)]; }
  center(ix, iy) { return [(ix + 0.5) * this.cell, (iy + 0.5) * this.cell]; }

  freeCell(ix, iy) {
    return ix >= 0 && iy >= 0 && ix < this.nx && iy < this.ny && this.walk[this.idx(ix, iy)] === 1;
  }

  isFree(x, y) { const [ix, iy] = this.toCell(x, y); return this.freeCell(ix, iy); }

  // Sichtfreiheit: innerhalb eines Raumes/einer Schwelle und nicht in Wand/Glas (Möbel ignoriert)
  isOpen(x, y) {
    if (this.roomAt(x, y)) {
      for (const o of this.data.obstacles) {
        if (o.rect) { const [x0, x1, y0, y1] = o.rect; if (x >= x0 && x <= x1 && y >= y0 && y <= y1) return false; }
      }
      return true;
    }
    for (const t of this.data.thresholds) { const [x0, x1, y0, y1] = t.rect; if (x >= x0 && x <= x1 && y >= y0 && y <= y1) return true; }
    return false;
  }

  roomAt(x, y) {
    for (const r of this.rooms) {
      const [x0, x1, y0, y1] = r.rect;
      if (x >= x0 && x <= x1 && y >= y0 && y <= y1) return r.id;
    }
    return null;
  }

  // Gerade Strecke frei? Abtastung im halben Zellabstand.
  segmentFree(ax, ay, bx, by) {
    const len = Math.hypot(bx - ax, by - ay);
    const steps = Math.max(1, Math.ceil(len / (this.cell * 0.5)));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      if (!this.isFree(ax + (bx - ax) * t, ay + (by - ay) * t)) return false;
    }
    return true;
  }

  // Bewegungsschritt mit Gleiten an Hindernissen: erst voll, dann je Achse.
  step(x, y, dx, dy) {
    if (this.segmentFree(x, y, x + dx, y + dy)) return [x + dx, y + dy];
    if (dx && this.segmentFree(x, y, x + dx, y)) return [x + dx, y];
    if (dy && this.segmentFree(x, y, x, y + dy)) return [x, y + dy];
    return [x, y];
  }

  // Nächste freie Zelle zu einem Zielpunkt (z. B. Tipp auf Möbelrand), Suche im Umkreis.
  nearestFree(x, y, maxDist = 0.8) {
    if (this.isFree(x, y)) return [x, y];
    const [cx, cy] = this.toCell(x, y);
    const k = Math.ceil(maxDist / this.cell);
    let best = null, bd = Infinity;
    for (let dy = -k; dy <= k; dy++) for (let dx = -k; dx <= k; dx++) {
      if (!this.freeCell(cx + dx, cy + dy)) continue;
      const d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = this.center(cx + dx, cy + dy); }
    }
    return best && Math.sqrt(bd) * this.cell <= maxDist ? best : null;
  }

  // A* auf 8er-Nachbarschaft (keine Ecken schneiden) + Glättung durch Sichtlinien.
  findPath(ax, ay, bx, by) {
    const start = this.nearestFree(ax, ay, 0.3), goal = this.nearestFree(bx, by);
    if (!start || !goal) return null;
    const [sx, sy] = this.toCell(...start), [gx, gy] = this.toCell(...goal);
    const N = this.nx * this.ny, s = this.idx(sx, sy), g = this.idx(gx, gy);
    const gScore = new Float32Array(N).fill(Infinity), came = new Int32Array(N).fill(-1), closed = new Uint8Array(N);
    const heap = new MinHeap();
    const h = (ix, iy) => { const dx = Math.abs(ix - gx), dy = Math.abs(iy - gy); return (dx + dy) + (Math.SQRT2 - 2) * Math.min(dx, dy); };
    gScore[s] = 0; heap.push(s, h(sx, sy));
    const dirs = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2]];
    let found = false;
    while (heap.size) {
      const cur = heap.pop();
      if (cur === g) { found = true; break; }
      if (closed[cur]) continue;
      closed[cur] = 1;
      const cx = cur % this.nx, cy = (cur / this.nx) | 0;
      for (const [dx, dy, c] of dirs) {
        const nx = cx + dx, ny = cy + dy;
        if (!this.freeCell(nx, ny)) continue;
        if (dx && dy && (!this.freeCell(cx + dx, cy) || !this.freeCell(cx, cy + dy))) continue;
        const n = this.idx(nx, ny), t = gScore[cur] + c;
        if (t < gScore[n]) { gScore[n] = t; came[n] = cur; heap.push(n, t + h(nx, ny)); }
      }
    }
    if (!found) return null;
    const cells = [];
    for (let c = g; c !== -1; c = came[c]) cells.push(this.center(c % this.nx, (c / this.nx) | 0));
    cells.reverse();
    cells[0] = start; cells[cells.length - 1] = goal;
    return this.smooth(cells);
  }

  smooth(pts) {
    if (pts.length < 3) return pts;
    const out = [pts[0]];
    let i = 0;
    while (i < pts.length - 1) {
      let j = pts.length - 1;
      while (j > i + 1 && !this.segmentFree(...pts[i], ...pts[j])) j--;
      out.push(pts[j]); i = j;
    }
    return out;
  }

  // Für Tests und Raumkarte: von welchen Räumen aus ist ein Raum erreichbar?
  reachableRooms(fromRoom) {
    const [x, y] = this.spawns[fromRoom];
    return Object.keys(this.spawns).filter(r => r === fromRoom || this.findPath(x, y, ...this.spawns[r]));
  }
}

class MinHeap {
  constructor() { this.k = []; this.p = []; }
  get size() { return this.k.length; }
  push(key, pri) {
    const k = this.k, p = this.p; let i = k.length; k.push(key); p.push(pri);
    while (i > 0) { const j = (i - 1) >> 1; if (p[j] <= pri) break; k[i] = k[j]; p[i] = p[j]; i = j; }
    k[i] = key; p[i] = pri;
  }
  pop() {
    const k = this.k, p = this.p, top = k[0], lk = k.pop(), lp = p.pop();
    if (k.length) {
      let i = 0; const n = k.length;
      for (;;) {
        let c = 2 * i + 1; if (c >= n) break;
        if (c + 1 < n && p[c + 1] < p[c]) c++;
        if (p[c] >= lp) break;
        k[i] = k[c]; p[i] = p[c]; i = c;
      }
      k[i] = lk; p[i] = lp;
    }
    return top;
  }
}

// EMFD · Geh-Controller · v0.5.1 (rein, ohne Three.js, in Node testbar)
//
// Ziel: Gehen statt Schweben.
//  - Anfahren/Abbremsen statt konstanter Geschwindigkeit (Gehtempo 1,25 m/s, Anlauf ~0,45 s).
//  - Beim Tippen-zum-Gehen dreht sich der Blick weich in die Gehrichtung (wie beim echten Gehen)
//    und am Ziel zum Objekt; Wischen übersteuert jederzeit.
//  - Dezente Schrittbewegung: Kopfhöhe ±1,8 cm, Seitenpendel ±0,8 cm, Schrittfrequenz an Tempo
//    gekoppelt; aus bei "Bewegung reduzieren".
//  - Zielposen: Platz nehmen (Augenhöhe 1,15 m) bzw. vor einem Objekt stehen und hinsehen.

export const WALK = {
  speed: 1.25,          // m/s Gehtempo (Mensch in Innenräumen ~1,0–1,4)
  accel: 2.8,           // m/s²
  decel: 3.2,           // m/s²
  turnRate: 2.6,        // rad/s maximale Auto-Drehung beim Gehen
  eyeStand: 1.60,
  eyeSit: 1.15,
  bobHeight: 0.018,     // m
  bobSway: 0.008,       // m
  stepLength: 0.68,     // m je Schritt
  runFactor: 1.6,       // Pro: Umschalt = zügiges Gehen (2,0 m/s)
  keyTurnRate: 1.9,     // Pro: rad/s Drehen mit ←/→ bzw. Q/E
  pitchBasic: 0.61,     // Basic: Blickneigung max. ±35° (Orientierung bleibt erhalten)
  pitchPro: 0.85,       // Pro: ±49°
  sweepSeconds: 9,      // "Umsehen": eine ruhige Drehung um 360°
};

const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
const approach = (cur, target, maxDelta) => cur + Math.max(-maxDelta, Math.min(maxDelta, target - cur));
const turnToward = (cur, target, maxDelta) => cur + Math.max(-maxDelta, Math.min(maxDelta, wrap(target - cur)));
export const yawTo = (fx, fy, tx, ty) => Math.atan2(-(tx - fx), ty - fy);

export class Walker {
  constructor(grid, { x = 0, y = 0, yaw = 0, reduceMotion = false } = {}) {
    this.grid = grid;
    this.x = x; this.y = y; this.yaw = yaw; this.pitch = 0;
    this.eye = WALK.eyeStand; this.speed = 0; this.phase = 0;
    this.path = null; this.goal = null; this.pose = null; this.seated = null;
    this.reduceMotion = reduceMotion; this.userTurning = 0; this.onArrive = null;
    this.bob = { y: 0, x: 0 };
  }

  setGrid(grid) { this.grid = grid; }

  teleport(x, y, yaw) { this.holdPitch = false; this.x = x; this.y = y; if (yaw !== undefined) this.yaw = yaw; this.stop(); this.seated = null; this.eye = WALK.eyeStand; this.pitch = 0; }

  stop() { this.sweep = null; this.path = null; this.goal = null; this.pose = null; this.onArrive = null; }

  // Gehen zu Punkt; optional Zielpose (Blickrichtung/Höhe/Neigung) und Rückruf bei Ankunft
  walkTo(tx, ty, { pose = null, onArrive = null } = {}) {
    if (this.seated) {
      // Erst aufstehen (Sitzplatz liegt in der Möbelhülle), dann vom Standpunkt aus gehen
      const [sx, sy] = this.seated.stand || this.seated.from;
      if (!this.grid.findPath(sx, sy, tx, ty)) return false;
      this.standUp();
      this.onArrive = () => this.walkTo(tx, ty, { pose, onArrive });
      this.goal = [tx, ty];
      return true;
    }
    const p = this.grid.findPath(this.x, this.y, tx, ty);
    if (!p) return false;
    this.holdPitch = false;
    this.path = p.slice(1); this.goal = p[p.length - 1]; this.pose = pose; this.onArrive = onArrive;
    return true;
  }

  // Sitzen: Position darf in der Möbelhülle liegen (Stuhl); Aufstehen setzt auf freien Punkt zurück
  sit(seat) { this.seated = { ...seat, from: [this.x, this.y] }; this.pose = { x: seat.x, y: seat.y, eye: WALK.eyeSit, yaw: seat.yaw, pitch: seat.pitch }; this.path = null; }

  standUp() {
    if (!this.seated) return;
    const [fx, fy] = this.seated.stand || this.seated.from;
    this.seated = null; this.holdPitch = false; this.pose = { x: fx, y: fy, eye: WALK.eyeStand, yaw: this.yaw, pitch: 0 };
  }

  // Manuelle Bewegung (Pfeiltasten/Tastatur): f/s in -1..1
  manual(f, s, run = false) { this._run = run; if (f || s) { this.holdPitch = false; if (this.seated) this.standUp(); this.path = null; this.goal = null; this.onArrive = null; } this._manual = [f, s]; }

  // Wischen: Drehung durch Nutzerin hat Vorrang vor Auto-Drehung für 1,2 s
  // Basic: Neigung begrenzt (±35°) und gehalten, bis man losgeht – dann richtet sich der Horizont auf.
  userTurn(dYaw, dPitch = 0, freeLook = false) {
    this.yaw = wrap(this.yaw + dYaw);
    if (dPitch) {
      const lim = freeLook ? WALK.pitchPro : WALK.pitchBasic;
      this.pitch = Math.max(-lim, Math.min(lim, this.pitch + dPitch));
      if (!freeLook) this.holdPitch = true;
    }
    this.userTurning = 1.2; this.sweep = null;
  }

  // Blick weich auf einen Punkt richten (Gegenstand anschauen). Neigung auf Basic-Grenze begrenzt.
  lookAt(px, py, pz, { levelZ = 0 } = {}) {
    const d = Math.max(0.2, Math.hypot(px - this.x, py - this.y));
    const pitch = Math.max(-WALK.pitchBasic, Math.min(WALK.pitchBasic, -Math.atan2(levelZ + this.eye - pz, d)));
    this.sweep = null; this.userTurning = 0;
    this.pose = { yaw: yawTo(this.x, this.y, px, py), pitch };
    return this.pose;
  }

  levelView() { this.sweep = null; this.userTurning = 0; this.pose = { pitch: 0 }; }

  // "Umsehen": einmal ruhig rundum (Start und Ende weich). Bewegung reduziert: 8 Schritte à 45°.
  startSweep() {
    if (this.seated) return;
    this.stop(); this.holdPitch = false; this.userTurning = 0;
    this.sweep = { t: 0, start: this.yaw, steps: 0 };
  }

  update(dt, { freeLook = false } = {}) {
    dt = Math.min(dt, 0.05);
    this.userTurning = Math.max(0, this.userTurning - dt);
    let moving = false;
    if (this.sweep) {
      const S = this.sweep, T = WALK.sweepSeconds; S.t += dt;
      if (this.reduceMotion) {
        const n = Math.min(8, Math.floor(S.t / 1.4));
        if (n > S.steps) { S.steps = n; this.yaw = wrap(S.start + n * Math.PI / 4); }
        if (n >= 8) this.sweep = null;
      } else {
        const u = Math.min(1, S.t / T), e = u * u * (3 - 2 * u); // weich anfahren und auslaufen
        this.yaw = wrap(S.start + e * 2 * Math.PI);
        if (u >= 1) this.sweep = null;
      }
    }
    const [f, s] = this._manual || [0, 0];

    if (this.pose && !this.path) {
      // Übergang in Zielpose (Hinsetzen/Aufstehen/Hinsehen): weich, ~0,8 s
      const k = 1 - Math.exp(-dt * 4.2), P = this.pose;
      if (P.x !== undefined) { this.x += (P.x - this.x) * k; this.y += (P.y - this.y) * k; }
      if (P.eye !== undefined) this.eye += (P.eye - this.eye) * k;
      if (P.yaw !== undefined && !this.userTurning) this.yaw = wrap(this.yaw + wrap(P.yaw - this.yaw) * k);
      if (P.pitch !== undefined) this.pitch += (P.pitch - this.pitch) * k;
      this.speed = approach(this.speed, 0, WALK.decel * dt);
      const done = (P.x === undefined || Math.hypot(P.x - this.x, P.y - this.y) < 0.01) &&
        (P.eye === undefined || Math.abs(P.eye - this.eye) < 0.005) &&
        (P.yaw === undefined || Math.abs(wrap(P.yaw - this.yaw)) < 0.01 || this.userTurning) &&
        (P.pitch === undefined || Math.abs(P.pitch - this.pitch) < 0.01);
      if (done) { if (P.x !== undefined) { this.x = P.x; this.y = P.y; } this.pose = null; this.holdPitch = P.pitch !== undefined; const cb = this.onArrive; this.onArrive = null; cb && cb(this); }
    } else if (f || s) {
      // Tastatur/Pfeiltasten: Richtung relativ zum Blick
      // Stick liefert stufenlose Werte; Tasten 0/1. Betrag ≤ 1 bestimmt das Tempo.
      const mag = Math.min(1, Math.hypot(f, s));
      let dx = -Math.sin(this.yaw) * f + Math.cos(this.yaw) * s, dy = Math.cos(this.yaw) * f + Math.sin(this.yaw) * s;
      const l = Math.hypot(dx, dy); dx /= l; dy /= l;
      const target = WALK.speed * mag * (this._run ? WALK.runFactor : 1);
      this.speed = this.speed < target ? approach(this.speed, target, WALK.accel * dt) : approach(this.speed, target, WALK.decel * dt);
      [this.x, this.y] = this.grid.step(this.x, this.y, dx * this.speed * dt, dy * this.speed * dt);
      moving = true; this._lastDir = [dx, dy];
    } else if (this.path && this.path.length) {
      const [tx, ty] = this.path[0], d = Math.hypot(tx - this.x, ty - this.y);
      const remaining = d + this.path.slice(1).reduce((a, p, i, arr) => a + Math.hypot(p[0] - (i ? arr[i - 1][0] : tx), p[1] - (i ? arr[i - 1][1] : ty)), 0);
      // Abbremsen so, dass am Ziel v≈0: v = sqrt(2·a·s)
      const vMax = Math.min(WALK.speed, Math.sqrt(2 * WALK.decel * Math.max(remaining - 0.02, 0)) + 0.08);
      this.speed = this.speed < vMax ? approach(this.speed, vMax, WALK.accel * dt) : approach(this.speed, vMax, WALK.decel * 1.5 * dt);
      if (d < 0.04 || (this.path.length > 1 && d < 0.18)) {
        this.path.shift();
        if (!this.path.length) {
          this.path = null; this.speed = 0;
          if (!this.pose) { const cb = this.onArrive; this.onArrive = null; cb && cb(this); }
        }
      } else {
        const step = Math.min(d, this.speed * dt), dx = (tx - this.x) / d, dy = (ty - this.y) / d;
        const [nx, ny] = this.grid.step(this.x, this.y, dx * step, dy * step);
        if (nx === this.x && ny === this.y) { this.stop(); this.blocked = true; }
        else { this.x = nx; this.y = ny; moving = true; this._lastDir = [dx, dy]; }
        // Blick weich in Gehrichtung – wie beim echten Gehen – solange nicht gewischt wird
        if (!this.userTurning) this.yaw = turnToward(this.yaw, yawTo(0, 0, dx, dy), WALK.turnRate * dt * Math.min(1, this.speed / 0.6));
      }
      if (!freeLook && !this.pose) this.pitch = approach(this.pitch, 0, dt * 1.5);
    } else {
      this.speed = approach(this.speed, 0, WALK.decel * dt);
      if (this.speed > 0 && this._lastDir) {
        const [nx, ny] = this.grid.step(this.x, this.y, this._lastDir[0] * this.speed * dt, this._lastDir[1] * this.speed * dt);
        this.x = nx; this.y = ny; moving = this.speed > 0.05;
      }
      if (!freeLook && !this.seated && !this.pose && !this.holdPitch) this.pitch = approach(this.pitch, 0, dt * 1.2);
    }

    // Schrittbewegung: Phase läuft mit zurückgelegtem Weg, Amplitude mit Tempo; klingt im Stand aus
    const amp = this.reduceMotion ? 0 : Math.min(1, this.speed / WALK.speed);
    this.phase += (this.speed * dt) / WALK.stepLength * Math.PI; // eine Halbwelle je Schritt
    const targetY = -Math.abs(Math.sin(this.phase)) * WALK.bobHeight * amp + WALK.bobHeight * amp * 0.5;
    const targetX = Math.sin(this.phase) * WALK.bobSway * amp;
    const k = 1 - Math.exp(-dt * 12);
    this.bob.y += (targetY - this.bob.y) * k; this.bob.x += (targetX - this.bob.x) * k;
    return moving;
  }

  // Kameraposition im Plan (inkl. Schrittbewegung quer zur Blickrichtung)
  camera() {
    return { x: this.x + Math.cos(this.yaw) * this.bob.x, y: this.y + Math.sin(this.yaw) * this.bob.x, eye: this.eye + this.bob.y, yaw: this.yaw, pitch: this.pitch };
  }
}

// EMFD · Kamera-Hilfsfunktionen · v0.5.0 (rein, testbar)

export const EYE_HEIGHT = 1.60;

// Horizontaler Bildwinkel als Zielgröße. v0.4.x nutzte fix 73° vertikal:
// im iPhone-Hochformat (390×844) ergab das nur ~37° horizontal ("enge Perspektive").
// Ziel: ~70° horizontal, vertikal begrenzt auf 55–85° gegen Verzerrung.
export function fovFor(aspect, { targetHFov = 70, minV = 55, maxV = 85 } = {}) {
  const h = targetHFov * Math.PI / 180;
  const v = 2 * Math.atan(Math.tan(h / 2) / aspect) * 180 / Math.PI;
  return Math.min(maxV, Math.max(minV, v));
}

export function horizontalFov(vFovDeg, aspect) {
  return 2 * Math.atan(Math.tan(vFovDeg * Math.PI / 360) * aspect) * 180 / Math.PI;
}

// Plan <-> Three.js
export const toWorld = (x, y, z = 0) => [x, z, -y];
export const toPlan = (wx, wz) => [wx, -wz];

// EMFD · Maßstäbliche Raumkarte der aktuellen Ebene · v0.5.0
// Zeichnet Räume und Stellflächen aus navigation-eg/og.json (keine Schemaskizze mehr).

export function createMinimap(canvas, getGrid, onRoom) {
  const ctx = canvas.getContext('2d');
  const W = 16.0, D = 16.2, pad = 4;
  let pos = null, heading = 0, active = null;

  function size() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth || 160;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(w * (D / W) * dpr);
    canvas.style.height = (w * D / W) + 'px';
    draw();
  }
  const sx = x => pad + x / W * (canvas.width - 2 * pad);
  const sy = y => canvas.height - pad - y / D * (canvas.height - 2 * pad);

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#16303e'; ctx.fillRect(sx(0), sy(D), sx(W) - sx(0), sy(0) - sy(D));
    ctx.font = `${Math.round(canvas.width / 17)}px system-ui`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const nav = getGrid();
    for (const r of nav.rooms) {
      const [x0, x1, y0, y1] = r.rect;
      ctx.fillStyle = r.id === active ? '#a37c43c0' : '#28636b99';
      ctx.fillRect(sx(x0), sy(y1), sx(x1) - sx(x0), sy(y0) - sy(y1));
      ctx.fillStyle = '#fff3dd'; ctx.fillText(r.id, sx((x0 + x1) / 2), sy((y0 + y1) / 2));
    }
    ctx.fillStyle = '#c9a46c66';
    for (const f of nav.data.footprints) { const [x0, x1, y0, y1] = f.rect; ctx.fillRect(sx(x0), sy(y1), sx(x1) - sx(x0), sy(y0) - sy(y1)); }
    if (pos) {
      const [x, y] = pos, r = canvas.width / 40;
      ctx.save(); ctx.translate(sx(x), sy(y)); ctx.rotate(-heading);
      ctx.fillStyle = '#dcaa57'; ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(1, r / 3);
      ctx.beginPath(); ctx.moveTo(0, -r * 1.8); ctx.lineTo(r, r); ctx.lineTo(-r, r); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();
    }
  }

  canvas.addEventListener('click', e => {
    const b = canvas.getBoundingClientRect();
    const px = (e.clientX - b.left) / b.width * canvas.width, py = (e.clientY - b.top) / b.height * canvas.height;
    const x = (px - pad) / (canvas.width - 2 * pad) * W, y = (canvas.height - pad - py) / (canvas.height - 2 * pad) * D;
    const room = getGrid().roomAt(x, y);
    if (room) onRoom(room);
  });
  window.addEventListener('resize', size);
  size();
  // heading: Blickrichtung im Plan, 0 = Norden, positiv = gegen Uhrzeigersinn (wie yaw)
  return { update(p, h, room) { pos = p; heading = h; active = room; draw(); }, size };
}

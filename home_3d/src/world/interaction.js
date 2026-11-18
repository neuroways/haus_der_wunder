// EMFD · Klickflächen · v0.5.0
// Unsichtbare Boxen aus dem Einrichtungsregister (Position/Hülle unverändert).
// Nur Objekte, die sichtbar dargestellt werden, erhalten eine Klickfläche.

export const TEEZIMMER_LABELS = {
  T01: 'Kartentisch', T02: 'Sitzbank', T03: 'Stuhl am Kartentisch', T04: 'Geschirrschrank',
  T06: 'Spieluhrtisch', T07: 'Lesesessel', O04: 'O04 · Kissen (Testform)',
  O24: 'O24 · Schräge Tasse (Testform)', P08: 'P08 · Tee-Spieluhr (Testform)', CARDS: 'Begleiterkarten · Studiendesign',
};

export function buildPickProxies(THREE, register, labels) {
  const group = new THREE.Group(); group.name = 'EMFD_Klickflaechen';
  const mat = new THREE.MeshBasicMaterial({ visible: false });
  const proxies = [];
  for (const it of register.items) {
    if (!labels[it.id]) continue;
    const m = new THREE.Mesh(new THREE.BoxGeometry(it.w, it.h, it.d), mat);
    // Register: (x,y,z) = südwestliche untere Ecke; Three: x, z oben -> y, Plan-y -> -z
    m.position.set(it.x + it.w / 2, it.z + it.h / 2, -(it.y + it.d / 2));
    m.userData = { id: it.id, label: labels[it.id], volume: it.w * it.d * it.h, room: it.room,
      center: [it.x + it.w / 2, it.y + it.d / 2, it.z + it.h * 0.6] }; // Blickpunkt leicht über Mitte
    m.name = 'PICK_' + it.id;
    group.add(m); proxies.push(m);
  }
  return { group, proxies };
}

// Kleinstes getroffenes Objekt gewinnt (Tasse vor Tisch), Reichweite begrenzt.
export function pickFromHits(hits, maxDistance = 4) {
  const near = hits.filter(h => h.distance <= maxDistance && h.object.userData && h.object.userData.id);
  if (!near.length) return null;
  near.sort((a, b) => a.object.userData.volume - b.object.userData.volume);
  return near[0].object.userData;
}

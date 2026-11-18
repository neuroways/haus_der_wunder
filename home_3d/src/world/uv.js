// EMFD · Maßstabsgerechte UV-Erzeugung · v0.5.0 (rein, testbar)
// Das GLB v0.4.4 enthält für Wände/Böden keine UVs. Statt Ersatzplatten wird jede Fläche
// nach ihrer Normalen projiziert (Box-/Würfelprojektion in Weltmetern):
//   1 UV-Einheit = `tile` Meter. Eine Textur mit realer Kachelgröße 1,00 m erhält tile = 1.0.
// Dadurch stimmen Maßstab und Anschlüsse über benachbarte Wandteile hinweg (gleiche Weltkoordinaten).

export function boxProjectUVs(positions, normals, tile = 1.0) {
  const n = positions.length / 3, uv = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) {
    const px = positions[3 * i], py = positions[3 * i + 1], pz = positions[3 * i + 2];
    const ax = Math.abs(normals[3 * i]), ay = Math.abs(normals[3 * i + 1]), az = Math.abs(normals[3 * i + 2]);
    let u, v;
    if (ay >= ax && ay >= az) { u = px; v = -pz; }        // Boden/Decke: Plan x/y
    else if (ax >= az) { u = -pz; v = py; }               // Wand mit Normalen in x: Plan-y / Höhe
    else { u = px; v = py; }                              // Wand mit Normalen in z: Plan-x / Höhe
    uv[2 * i] = u / tile; uv[2 * i + 1] = v / tile;
  }
  return uv;
}

// Anwenden auf eine Three.js-BufferGeometry in Weltkoordinaten (Matrix des Meshes berücksichtigt).
export function applyWorldUVs(THREE, mesh, tile) {
  const g = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
  if (!g.attributes.normal) g.computeVertexNormals();
  mesh.updateWorldMatrix(true, false);
  const pos = g.attributes.position.clone().applyMatrix4(mesh.matrixWorld);
  const nrm = g.attributes.normal.clone().applyNormalMatrix(new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld));
  g.setAttribute('uv', new THREE.BufferAttribute(boxProjectUVs(pos.array, nrm.array, tile), 2));
  mesh.geometry = g;
}

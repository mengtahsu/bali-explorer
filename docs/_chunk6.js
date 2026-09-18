roup.add(inst);
}
addForest(G.low, 10000, -12000, 180, 14000, 1.2);
addForest(G.near, 2000, 4000, 120, 10000, 1);
addForest(G.ground, -8000, 8000, 200, 9000, 0.85);
addForest(G.ultra, -12000, 18000, 160, 6000, 0.7);

function addBeach(group, cx, cz, rx, rz) {
  const b = new THREE.Mesh(
    new THREE.CircleGeometry(1, 20),
    new THREE.MeshStandardMaterial({ color: 0xe8d5a3 })
  );
  b.scale.set(rx, 1, rz);
  b.rotation.x = -Math.PI / 2;
  b.position.set(cx, 3.5, cz);
  group.add(b);
}
addBeach(G.near, -15000, 24000, 3500, 900);
addBeach(G.ultra, -22000, 34000, 2200, 700);

function addBuildings(group, cx, cz, count, spread, color, maxH) {
  const geo = new THREE.BoxGeometry(1, 1, 1);
  geo.translate(0, 0.5, 0);
  const inst = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 0.85 }), count);
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(), P = new THREE.Vector3();
  let n = 0;
  for (let i = 0; i < count * 5 && n < count; i++) {
    const x = cx + (hash2(i * 3.1, cx + 1) - 0.5) * spread;
    const z = cz + (hash2(i * 7.7, cz + 2) - 0.5) * spread;
    if (baliMask(x, z) < 0.4) continue;
    const y = terrainHeight(x, z);
    if (y < 4) continue;
    P.set(x, y, z);
    Q.setFromEuler(new THREE.Euler(0, hash2(i, y) * Math.PI, 0));
    S.set(8 + hash2(z, i) * 18, 6 + hash2(i, x) * maxH, 8 + hash2(i, z) * 16);
    M.compose(P, Q, S);
    inst.setMatrixAt(n++, M);
  }
  inst.count = n;
  inst.instanceMatrix.needsUpdate = true;
  group.add(inst);
  return n;
}
let bN = 0;
bN += addBuildings(G.near, -14000, 20000, 350, 5000, 0xe8e0d0, 28);
bN += addBuildings(G.near, 22000, 18000, 160, 4000, 0xc8d0d8, 18);
bN += addBuildings(G.ground, -12000, 18000, 800, 4500, 0xd4c4a8, 32);
bN += addBuildings(G.ground, -10000, 22000, 600, 3500, 0xe8e0d0, 36);
bN += addBuildings(G.ground, 20000, 16000, 300, 3500, 0xb0b8c0, 22);
bN += addBuildings(G.ground, 2000, 
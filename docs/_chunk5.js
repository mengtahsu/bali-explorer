= Math.hypot(dx, dz);
  const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
  const road = new THREE.Mesh(
    new THREE.BoxGeometry(w, 0.8, len),
    new THREE.MeshStandardMaterial({ color: 0x3a3a38, roughness: 0.95 })
  );
  road.position.set(mx, terrainHeight(mx, mz) + 1.2, mz);
  road.rotation.y = Math.atan2(dx, dz);
  group.add(road);
}
addRoad(G.mid, -14000, 20000, 22000, 18000, 18);
addRoad(G.mid, 22000, 18000, -5000, -10000, 14);
addRoad(G.mid, -14000, 20000, -20000, 32000, 12);
addRoad(G.near, -14000, 20000, -8000, 16000, 8);

function addTerraces(group, cx, cz, n) {
  for (let i = 1; i <= n; i++) {
    const r = 180 + i * 140;
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(r - 40, r, 36),
      new THREE.MeshStandardMaterial({
        color: i % 2 ? 0x5a9a3a : 0x6aad48, side: THREE.DoubleSide, roughness: 1,
      })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(cx, terrainHeight(cx, cz) + 2 + i * 8, cz);
    group.add(ring);
  }
}
addTerraces(G.low, -3000, -7000, 6);
addTerraces(G.near, -6000, -5000, 3);

function addForest(group, cx, cz, count, spread, sc0 = 1) {
  const geo = new THREE.ConeGeometry(4.5 * sc0, 18 * sc0, 5);
  const mat = new THREE.MeshStandardMaterial({ color: 0x1e5c32, roughness: 0.9 });
  const inst = new THREE.InstancedMesh(geo, mat, count);
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(), P = new THREE.Vector3();
  let n = 0;
  for (let i = 0; i < count * 4 && n < count; i++) {
    const x = cx + (hash2(i, cx) - 0.5) * spread;
    const z = cz + (hash2(i + 9, cz) - 0.5) * spread;
    if (baliMask(x, z) < 0.35) continue;
    const y = terrainHeight(x, z);
    if (y < 25) continue;
    P.set(x, y + 9 * sc0, z);
    Q.setFromEuler(new THREE.Euler(0, hash2(i, z) * 6.28, 0));
    const sc = 0.7 + hash2(z, i) * 0.9;
    S.set(sc, sc, sc);
    M.compose(P, Q, S);
    inst.setMatrixAt(n++, M);
  }
  inst.count = n;
  g
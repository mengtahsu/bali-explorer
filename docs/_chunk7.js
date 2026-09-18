2000, 400, 8000, 0xc4a882, 16);
bN += addBuildings(G.ground, -20000, 30000, 250, 3000, 0xf0e8d8, 20);
bN += addBuildings(G.ultra, -13000, 19000, 1000, 3500, 0xd8d0c4, 40);
bN += addBuildings(G.ultra, -11000, 21000, 700, 2800, 0xc8b8a0, 38);
bN += addBuildings(G.ultra, 21000, 17000, 350, 2500, 0xa8b0b8, 24);
bN += addBuildings(G.ultra, 3000, 3000, 500, 6000, 0xb8956a, 14);
console.info('[Bali] buildings', bN);

{
  const ty = terrainHeight(22000, 18000);
  const terminal = new THREE.Mesh(
    new THREE.BoxGeometry(220, 28, 90),
    new THREE.MeshStandardMaterial({ color: 0xdde4ea })
  );
  terminal.position.set(22000, ty + 14, 18000);
  G.ground.add(terminal);
  G.ultra.add(terminal.clone());
  const runway = new THREE.Mesh(
    new THREE.BoxGeometry(45, 1.2, 3600),
    new THREE.MeshStandardMaterial({ color: 0x333330 })
  );
  runway.position.set(24500, ty + 1, 16000);
  runway.rotation.y = 0.35;
  G.near.add(runway);
  G.ground.add(runway.clone());
}
{
  const vy = terrainHeight(-5000, -10000);
  const villa = new THREE.Mesh(
    new THREE.BoxGeometry(55, 14, 70),
    new THREE.MeshStandardMaterial({ color: 0xf5efe0 })
  );
  villa.position.set(-5000, vy + 7, -10000);
  G.ground.add(villa);
}

function addPalms(group, cx, cz, count, spread) {
  const tGeo = new THREE.CylinderGeometry(0.35, 0.55, 10, 5);
  const lGeo = new THREE.ConeGeometry(3.5, 6, 6);
  const trunks = new THREE.InstancedMesh(tGeo, new THREE.MeshStandardMaterial({ color: 0x6b4423 }), count);
  const leaves = new THREE.InstancedMesh(lGeo, new THREE.MeshStandardMaterial({ color: 0x1a7a3a }), count);
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(), P = new THREE.Vector3();
  let n = 0;
  for (let i = 0; i < count * 4 && n < count; i++) {
    const x = cx + (hash2(i, cx + 3) - 0.5) * spread;
    const z = cz + (hash2(i, cz + 5) - 0.5) * spread;
    if (baliMask(x, z) < 0.3) continue;
    const y = terrainH
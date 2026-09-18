   f *= 2.03;
  }
  return v;
}
function baliMask(x, z) {
  const nx = x / 48000;
  const nz = z / 52000;
  const px = nx * 0.92 + nz * 0.08;
  const pz = -nx * 0.12 + nz;
  const tip = Math.max(0, pz);
  const width = 0.72 + 0.38 * Math.max(0, -pz) - 0.45 * tip * tip;
  const left = px < 0 ? 1.18 : 1.0;
  const r = Math.sqrt((px / (width * left)) ** 2 + (pz / 1.05) ** 2);
  return 1 - THREE.MathUtils.smoothstep(0.78, 1.08, r);
}
function terrainHeight(x, z) {
  const m = baliMask(x, z);
  if (m <= 0.001) return 0;
  let h = fbm(x * 0.000035, z * 0.000035, 4) * 2200;
  h += fbm(x * 0.00009 + 20, z * 0.00009, 3) * 700;
  h += fbm(x * 0.00022, z * 0.00022 + 5, 2) * 180;
  h += Math.exp(-((x + 20000) ** 2) / 8e7 - ((z - 32000) ** 2) / 6e7) * 280;
  h += Math.exp(-((x + 4000) ** 2) / 1.2e8 - ((z + 8000) ** 2) / 1e8) * 420;
  const apt = Math.exp(-((x - 22000) ** 2) / 5e7 - ((z - 18000) ** 2) / 4e7);
  h = h * (1 - apt * 0.85) + apt * 12;
  h *= m;
  if (m > 0.15) h = Math.max(h, 2 + (m - 0.15) * 25);
  return h;
}

const ocean = new THREE.Mesh(
  new THREE.CircleGeometry(300000, 96),
  new THREE.MeshStandardMaterial({ color: 0x0d4a6a, roughness: 0.22, metalness: 0.18 })
);
ocean.rotation.x = -Math.PI / 2;
ocean.position.y = -1;
scene.add(ocean);

const shallow = new THREE.Mesh(
  new THREE.RingGeometry(52000, 95000, 80),
  new THREE.MeshStandardMaterial({
    color: 0x2a9aad, roughness: 0.45, transparent: true, opacity: 0.48, side: THREE.DoubleSide,
  })
);
shallow.rotation.x = -Math.PI / 2;
shallow.position.y = -0.4;
scene.add(shallow);

const foam = new THREE.Mesh(
  new THREE.RingGeometry(48000, 56000, 64),
  new THREE.MeshBasicMaterial({ color: 0xe8f4f8, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
);
foam.rotation.x = -Math.PI / 2;
foam.position.y = 0.3;
foam.visible = false;
scene.add(foam);

const G = {
  extreme: new THREE.Group(),
  high: new THREE.Group(),
  midHigh: new THREE.Group(),
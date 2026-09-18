
  mid: new THREE.Group(),
  low: new THREE.Group(),
  near: new THREE.Group(),
  ground: new THREE.Group(),
  ultra: new THREE.Group(),
};
Object.values(G).forEach((g) => scene.add(g));

const BANDS = [
  { min: 2000, name: '極高空', cls: 'l0' },
  { min: 1200, name: '高空', cls: 'l1' },
  { min: 700, name: '中高', cls: 'l2' },
  { min: 400, name: '中空', cls: 'l3' },
  { min: 200, name: '低空', cls: 'l4' },
  { min: 80, name: '近地', cls: 'l5' },
  { min: 30, name: '貼地', cls: 'l6' },
  { min: 0, name: '超低', cls: 'l7' },
];

function paint(x, z, y, m, color, detail) {
  if (m < 0.08) color.setRGB(0.08, 0.32, 0.42);
  else if (y < 8) color.setRGB(0.86, 0.78, 0.55);
  else if (y < 80) {
    const t = (y - 8) / 72;
    color.setRGB(0.28 + t * 0.08, 0.52 + t * 0.1, 0.2);
  } else if (y < 400) color.setRGB(0.14, 0.38, 0.18);
  else if (y < 1200) {
    const t = (y - 400) / 800;
    color.setRGB(0.32 + t * 0.2, 0.36 + t * 0.12, 0.28);
  } else {
    const t = Math.min(1, (y - 1200) / 1200);
    color.setRGB(0.55 + t * 0.35, 0.55 + t * 0.35, 0.52 + t * 0.4);
  }
  if (detail >= 3 && y > 40 && y < 350 && m > 0.4) {
    const stripe = Math.sin(y * 0.08 + x * 0.00015) * 0.5 + 0.5;
    color.offsetHSL(0.03, 0.05, (stripe - 0.5) * 0.1);
  }
  if (detail >= 5 && y > 10 && y < 60 && m > 0.35 && hash2(Math.floor(x / 400), Math.floor(z / 400)) > 0.72) {
    color.setRGB(0.45, 0.46, 0.44);
  }
}

function buildHM(res, octaves, detail) {
  const geo = new THREE.PlaneGeometry(ISLAND, ISLAND, res, res);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const m = baliMask(x, z);
    let y = 0;
    if (m > 0.001) {
      let h = fbm(x * 0.000035, z * 0.000035, Math.min(octaves, 4)) * 2200;
      if (octaves >= 3) h += fbm(x * 0.00009 + 20, z * 0.
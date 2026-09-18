
let HM_W = __B.HM_W0, HM_H = __B.HM_H0;
let heights = null;
function decodeHeightmap() {
  const u8 = Uint8Array.from(atob(__B.HM_U8_B64), (c) => c.charCodeAt(0));
  HM_W = __B.HM_W0;
  HM_H = __B.HM_H0;
  heights = new Float32Array(HM_W * HM_H);
  const scale = __B.HM_SCALE || 12;
  for (let i = 0; i < HM_W * HM_H; i++) heights[i] = u8[i] * scale;
}
decodeHeightmap();
function sampleHeight(x, z) {
  if (!heights) return 0;
  const u = (x + WORLD_W / 2) / WORLD_W;
  const v = (z + WORLD_D / 2) / WORLD_D;
  if (u < 0 || u > 1 || v < 0 || v > 1) return 0;
  const fx = u * (HM_W - 1);
  const fy = v * (HM_H - 1);
  const x0 = Math.floor(fx), y0 = Math.floor(fy);
  const x1 = Math.min(HM_W - 1, x0 + 1), y1 = Math.min(HM_H - 1, y0 + 1);
  const tx = fx - x0, ty = fy - y0;
  const h00 = heights[y0 * HM_W + x0];
  const h10 = heights[y0 * HM_W + x1];
  const h01 = heights[y1 * HM_W + x0];
  const h11 = heights[y1 * HM_W + x1];
  return Math.max(0, h00 * (1 - tx) * (1 - ty) + h10 * tx * (1 - ty) + h01 * (1 - tx) * ty + h11 * tx * ty);
}
function terrainHeight(x, z) {
  return sampleHeight(x, z);
}
const ocean = new __B.THREE.Mesh(
  new __B.THREE.CircleGeometry(400000, 64),
  new __B.THREE.MeshStandardMaterial({ color: 0x0a3d5c, roughness: 0.28, metalness: 0.2 })
);
ocean.rotation.x = -Math.PI / 2;
ocean.position.y = -0.5;
scene.add(ocean);
const terrainGroup = new __B.THREE.Group();
scene.add(terrainGroup);
function buildTerrainGeo(segX, segZ) {
  const geo = new __B.THREE.PlaneGeometry(WORLD_W, WORLD_D, segX, segZ);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    let y = sampleHeight(x, z);
    if (y < 0.5) y = 0;
    pos.setY(i, y);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}
function makeVertexColorFallback() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 160;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(256, 160);
  for (let j = 0; j < 160; j++) {
    for (let i = 0; i < 256; i++) {
      const si = Math.min(HM_W - 1, Math.floor((i / 255) * (HM_W - 1)));
      const sj = Math.min(HM_H - 1, Math.floor((j / 159) * (HM_H - 1)));
      const e = heights[sj * HM_W + si];
      let r, g, b;
      if (e <= 0.5) {
        r = 12; g = 58; b = 95;
      } else if (e < 40) {
        r = 50; g = 130; b = 75;
      } else if (e < 200) {
        r = 40; g = 115; b = 48;
      } else if (e < 800) {
        r = 70; g = 100; b = 42;
      } else if (e < 1800) {
        r = 110; g = 95; b = 55;
      } else {
        const t = Math.min(1, (e - 1800) / 1400);
        r = (130 + 90 * t) | 0;
        g = (115 + 110 * t) | 0;
        b = (95 + 130 * t) | 0;
      }
      const o = (j * 256 + i) * 4;
      img.data[o] = r; img.data[o + 1] = g; img.data[o + 2] = b; img.data[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new __B.THREE.CanvasTexture(c);
  tex.colorSpace = __B.THREE.SRGBColorSpace;
  return tex;
}
function buildTerrains(satTex) {
  while (terrainGroup.children.length) {
    const m = terrainGroup.children[0];
    terrainGroup.remove(m);
    m.geometry?.dispose();
  }
  const mat = new __B.THREE.MeshStandardMaterial({
    map: satTex,
    roughness: 0.95,
    metalness: 0.02,
  });
  terrainGroup.add(new __B.THREE.Mesh(buildTerrainGeo(128, 80), mat));
}
const cloudGroup = new __B.THREE.Group();
scene.add(cloudGroup);
{
  const cmat = new __B.THREE.MeshBasicMaterial({ color: 0xf2f6fa, transparent: true, opacity: 0.45, depthWrite: false });
  for (let i = 0; i < 20; i++) {
    const c = new __B.THREE.Mesh(new __B.THREE.SphereGeometry(900 + (i % 7) * 200, 8, 6), cmat);
    const ang = i * 2.4;
    c.position.set(Math.sin(ang) * 50000, 3200 + (i % 5) * 400, Math.cos(ang) * 40000);
    c.scale.set(2.2, 0.4, 1.4);
    cloudGroup.add(c);
  }
}
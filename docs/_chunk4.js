00009, 3) * 700;
      if (octaves >= 4) h += fbm(x * 0.00022, z * 0.00022 + 5, 2) * 180;
      if (octaves >= 5) h += fbm(x * 0.0005, z * 0.0005, 2) * 40;
      h += Math.exp(-((x + 20000) ** 2) / 8e7 - ((z - 32000) ** 2) / 6e7) * 280;
      h += Math.exp(-((x + 4000) ** 2) / 1.2e8 - ((z + 8000) ** 2) / 1e8) * 420;
      const apt = Math.exp(-((x - 22000) ** 2) / 5e7 - ((z - 18000) ** 2) / 4e7);
      h = h * (1 - apt * 0.85) + apt * 12;
      y = Math.max(0, h * m);
      if (m > 0.15) y = Math.max(y, 2 + (m - 0.15) * 25);
    }
    pos.setY(i, y);
    paint(x, z, y, m, c, detail);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

const tMat = () => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, metalness: 0.02 });

G.extreme.add(new THREE.Mesh(buildHM(32, 2, 1), tMat()));
{
  const haze = new THREE.MeshBasicMaterial({ color: 0x6a8a78, transparent: true, opacity: 0.28, depthWrite: false });
  for (let i = 0; i < 12; i++) {
    const hx = (hash2(i, 1) - 0.5) * 90000;
    const hz = (hash2(i, 2) - 0.5) * 100000;
    if (baliMask(hx, hz) < 0.25) continue;
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(2500 + hash2(i, 3) * 4000, 1800 + hash2(i, 4) * 2500, 5),
      haze
    );
    cone.position.set(hx, terrainHeight(hx, hz) * 0.4 + 800, hz);
    G.extreme.add(cone);
  }
}
G.high.add(new THREE.Mesh(buildHM(64, 3, 2), tMat()));
G.midHigh.add(new THREE.Mesh(buildHM(96, 4, 3), tMat()));
G.mid.add(new THREE.Mesh(buildHM(128, 5, 4), tMat()));
G.low.add(new THREE.Mesh(buildHM(160, 5, 5), tMat()));
const lowProxy = new THREE.Mesh(buildHM(96, 5, 5), tMat());
G.near.add(lowProxy);
G.ground.add(lowProxy.clone());
G.ultra.add(lowProxy.clone());

function addRoad(group, x0, z0, x1, z1, w = 12) {
  const dx = x1 - x0, dz = z1 - z0, len 
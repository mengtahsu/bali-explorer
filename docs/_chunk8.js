eight(x, z);
    if (y < 3 || y > 120) continue;
    const sc = 0.8 + hash2(z, i) * 0.6;
    Q.setFromEuler(new THREE.Euler(0, hash2(i, x) * 6.28, 0));
    S.set(sc, sc, sc);
    P.set(x, y + 5, z);
    M.compose(P, Q, S);
    trunks.setMatrixAt(n, M);
    P.y = y + 11 * sc;
    M.compose(P, Q, S);
    leaves.setMatrixAt(n, M);
    n++;
  }
  trunks.count = n;
  leaves.count = n;
  group.add(trunks, leaves);
}
addPalms(G.ground, -14000, 22000, 400, 5000);
addPalms(G.ultra, -15000, 24000, 500, 4000);

const cloudGroup = new THREE.Group();
scene.add(cloudGroup);
{
  const cmat = new THREE.MeshBasicMaterial({ color: 0xf2f6fa, transparent: true, opacity: 0.55, depthWrite: false });
  for (let i = 0; i < 40; i++) {
    const c = new THREE.Mesh(new THREE.SphereGeometry(800 + hash2(i, 8) * 1600, 8, 6), cmat);
    c.position.set((hash2(i, 1) - 0.5) * 140000, 2800 + hash2(i, 2) * 2200, (hash2(i, 3) - 0.5) * 140000);
    c.scale.set(1.8, 0.45, 1.2);
    cloudGroup.add(c);
  }
}

const markerGroup = new THREE.Group();
scene.add(markerGroup);
const markerMeshes = {};
LANDMARKS.forEach((lm) => {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(4, 6, 180, 8),
    new THREE.MeshStandardMaterial({ color: lm.color, emissive: lm.color, emissiveIntensity: 0.35 })
  );
  pole.position.y = 90;
  g.add(pole);
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(22, 12, 12),
    new THREE.MeshStandardMaterial({ color: lm.color, emissive: lm.color, emissiveIntensity: 0.55 })
  );
  ball.position.y = 200;
  g.add(ball);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(40, 3, 8, 28),
    new THREE.MeshBasicMaterial({ color: lm.color })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 4;
  g.add(ring);
  g.position.set(lm.x, terrainHeight(lm.x, lm.z), lm.z);
  markerGroup.add(g);
  markerMeshes[lm.id] = { group: g, ball, lm };
});

/* Airbus A330 — China Airlines–
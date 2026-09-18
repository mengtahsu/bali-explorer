
const markerGroup = new __B.THREE.Group();
scene.add(markerGroup);
const markerMeshes = {};
function placeMarkers() {
  while (markerGroup.children.length) markerGroup.remove(markerGroup.children[0]);
  LANDMARKS.forEach((lm) => {
    const g = new __B.THREE.Group();
    const pole = new __B.THREE.Mesh(
      new __B.THREE.CylinderGeometry(3, 5, 160, 8),
      new __B.THREE.MeshStandardMaterial({ color: lm.color, emissive: lm.color, emissiveIntensity: 0.3 })
    );
    pole.position.y = 80;
    g.add(pole);
    const ball = new __B.THREE.Mesh(
      new __B.THREE.SphereGeometry(18, 12, 12),
      new __B.THREE.MeshStandardMaterial({ color: lm.color, emissive: lm.color, emissiveIntensity: 0.5 })
    );
    ball.position.y = 175;
    g.add(ball);
    g.position.set(lm.x, terrainHeight(lm.x, lm.z), lm.z);
    markerGroup.add(g);
    markerMeshes[lm.id] = { group: g, ball, lm };
  });
}
const plane = new __B.THREE.Group();
scene.add(plane);
function buildA330() {
  const white = new __B.THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.35, metalness: 0.35 });
  const red = new __B.THREE.MeshStandardMaterial({ color: 0xc8102e, roughness: 0.4, metalness: 0.25 });
  const dark = new __B.THREE.MeshStandardMaterial({ color: 0x1a1e24, roughness: 0.5, metalness: 0.4 });
  const eng = new __B.THREE.MeshStandardMaterial({ color: 0xc8ccd0, roughness: 0.3, metalness: 0.55 });
  const glass = new __B.THREE.MeshStandardMaterial({
    color: 0x3a90c0, roughness: 0.12, metalness: 0.7, transparent: true, opacity: 0.75,
  });
  const fuseLen = 52, fuseR = 3.05;
  const fuselage = new __B.THREE.Mesh(new __B.THREE.CapsuleGeometry(fuseR, fuseLen, 6, 16), white);
  fuselage.rotation.z = Math.PI / 2;
  plane.add(fuselage);
  const nose = new __B.THREE.Mesh(new __B.THREE.ConeGeometry(fuseR * 0.95, 8, 14), white);
  nose.rotation.z = -Math.PI / 2;
  nose.position.x = fuseLen / 2 + 3.2;
  plane.add(nose);
  const cockpit = new __B.THREE.Mesh(new __B.THREE.SphereGeometry(2.4, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2), glass);
  cockpit.position.set(fuseLen / 2 - 2, 2.2, 0);
  plane.add(cockpit);
  const stripe = new __B.THREE.Mesh(new __B.THREE.BoxGeometry(fuseLen * 0.85, 0.6, fuseR * 2.05), red);
  stripe.position.set(0, 0.2, 0);
  plane.add(stripe);
  const wing = new __B.THREE.Mesh(new __B.THREE.BoxGeometry(9, 0.55, A330_SPAN), white);
  wing.position.set(-2, -1.2, 0);
  plane.add(wing);
  const tipL = new __B.THREE.Mesh(new __B.THREE.BoxGeometry(2, 0.4, 3), red);
  tipL.position.set(-2, -1.1, A330_SPAN / 2 - 1);
  plane.add(tipL);
  const tipR = tipL.clone();
  tipR.position.z = -(A330_SPAN / 2 - 1);
  plane.add(tipR);
  function makeEngine(z) {
    const g = new __B.THREE.Group();
    const cowling = new __B.THREE.Mesh(new __B.THREE.CylinderGeometry(1.85, 1.7, 5.5, 12), eng);
    cowling.rotation.z = Math.PI / 2;
    g.add(cowling);
    const intake = new __B.THREE.Mesh(new __B.THREE.TorusGeometry(1.7, 0.25, 8, 16), dark);
    intake.rotation.y = Math.PI / 2;
    intake.position.x = 2.6;
    g.add(intake);
    const pylon = new __B.THREE.Mesh(new __B.THREE.BoxGeometry(1.2, 2.2, 0.5), white);
    pylon.position.set(0, 1.4, 0);
    g.add(pylon);
    g.position.set(-1, -3.6, z);
    plane.add(g);
  }
  makeEngine(12);
  makeEngine(-12);
  const hstab = new __B.THREE.Mesh(new __B.THREE.BoxGeometry(5, 0.35, 22), white);
  hstab.position.set(-fuseLen / 2 + 2, 1.5, 0);
  plane.add(hstab);
  const fin = new __B.THREE.Mesh(new __B.THREE.BoxGeometry(8, 14, 0.6), white);
  fin.position.set(-fuseLen / 2 + 1, 8, 0);
  plane.add(fin);
  const finRed = new __B.THREE.Mesh(new __B.THREE.BoxGeometry(6, 10, 0.65), red);
  finRed.position.set(-fuseLen / 2 + 0.5, 9, 0);
  plane.add(finRed);
}
buildA330();
ish */
const plane = new THREE.Group();
scene.add(plane);
function buildA330() {
  const white = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.35, metalness: 0.35 });
  const red = new THREE.MeshStandardMaterial({ color: 0xc8102e, roughness: 0.4, metalness: 0.25 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x1a1e24, roughness: 0.5, metalness: 0.4 });
  const eng = new THREE.MeshStandardMaterial({ color: 0xc8ccd0, roughness: 0.3, metalness: 0.55 });
  const glass = new THREE.MeshStandardMaterial({
    color: 0x3a90c0, roughness: 0.12, metalness: 0.7, transparent: true, opacity: 0.75,
  });
  const fuseLen = 52, fuseR = 3.05;
  const fuselage = new THREE.Mesh(new THREE.CapsuleGeometry(fuseR, fuseLen, 6, 16), white);
  fuselage.rotation.z = Math.PI / 2;
  plane.add(fuselage);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(fuseR * 0.95, 8, 14), white);
  nose.rotation.z = -Math.PI / 2;
  nose.position.x = fuseLen / 2 + 3.2;
  plane.add(nose);
  const cockpit = new THREE.Mesh(new THREE.SphereGeometry(2.4, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2), glass);
  cockpit.position.set(fuseLen / 2 - 2, 2.2, 0);
  plane.add(cockpit);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(fuseLen * 0.85, 0.6, fuseR * 2.05), red);
  stripe.position.set(0, 0.2, 0);
  plane.add(stripe);
  const wing = new THREE.Mesh(new THREE.BoxGeometry(9, 0.55, A330_SPAN), white);
  wing.position.set(-2, -1.2, 0);
  plane.add(wing);
  const tipL = new THREE.Mesh(new THREE.BoxGeometry(2, 0.4, 3), red);
  tipL.position.set(-2, -1.1, A330_SPAN / 2 - 1);
  plane.add(tipL);
  const tipR = tipL.clone();
  tipR.position.z = -(A330_SPAN / 2 - 1);
  plane.add(tipR);
  function makeEngine(z) {
    const g = new THREE.Group();
    const cowling = new THREE.Mesh(new THREE.CylinderGeometry(1.85, 1.7, 5.5, 12), eng);
    cowling.rotation.z = Math.PI / 2;
    g.add(cowling);
    const intake = new THREE.Mesh(new THREE.T
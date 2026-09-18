orusGeometry(1.7, 0.25, 8, 16), dark);
    intake.rotation.y = Math.PI / 2;
    intake.position.x = 2.6;
    g.add(intake);
    const pylon = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 0.5), white);
    pylon.position.set(0, 1.4, 0);
    g.add(pylon);
    g.position.set(-1, -3.6, z);
    plane.add(g);
  }
  makeEngine(12);
  makeEngine(-12);
  const hstab = new THREE.Mesh(new THREE.BoxGeometry(5, 0.35, 22), white);
  hstab.position.set(-fuseLen / 2 + 2, 1.5, 0);
  plane.add(hstab);
  const fin = new THREE.Mesh(new THREE.BoxGeometry(8, 14, 0.6), white);
  fin.position.set(-fuseLen / 2 + 1, 8, 0);
  plane.add(fin);
  const finRed = new THREE.Mesh(new THREE.BoxGeometry(6, 10, 0.65), red);
  finRed.position.set(-fuseLen / 2 + 0.5, 9, 0);
  plane.add(finRed);
  const belly = new THREE.Mesh(new THREE.CapsuleGeometry(2.2, 18, 4, 10), white);
  belly.rotation.z = Math.PI / 2;
  belly.position.set(-4, -2.4, 0);
  plane.add(belly);
}
buildA330();

const flight = {
  pos: new THREE.Vector3(5000, 8500, 95000),
  pitch: 0.02,
  yaw: Math.PI,
  roll: 0,
  speed: 210,
};
plane.position.copy(flight.pos);

const _euler = new THREE.Euler();
const _fwd = new THREE.Vector3();
const _up = new THREE.Vector3();
const _cam = new THREE.Vector3();
const _look = new THREE.Vector3();

function orientPlane() {
  _euler.set(flight.pitch, flight.yaw, -flight.roll, 'YXZ');
  plane.quaternion.setFromEuler(_euler);
}
function updateCamera(dt) {
  orientPlane();
  _fwd.set(1, 0, 0).applyQuaternion(plane.quaternion);
  _up.set(0, 1, 0).applyQuaternion(plane.quaternion);
  const dist = CAM_BACK + flight.speed * 0.4;
  _cam.copy(_fwd).multiplyScalar(-dist).addScaledVector(_up, CAM_UP);
  camera.position.lerp(flight.pos.clone().add(_cam), 1 - Math.exp(-2.0 * dt));
  _look.copy(flight.pos).addScaledVector(_fwd, 120).addScaledVector(_up, 10);
  camera.lookAt(_look);
}

window.addEventListener('keydown', (e) => {
  keys.add(e.code);
  if (['Sp
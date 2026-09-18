
const spawn = lonLatToXZ(115.2, -9.15);
const flight = {
  pos: new __B.THREE.Vector3(spawn.x, 8500, spawn.z),
  pitch: 0.02,
  yaw: Math.PI / 2,
  roll: 0,
  speed: 210,
};
plane.position.copy(flight.pos);
const _q = new __B.THREE.Quaternion();
const _euler = new __B.THREE.Euler();
const _fwd = new __B.THREE.Vector3();
const _up = new __B.THREE.Vector3();
const _cam = new __B.THREE.Vector3();
const _look = new __B.THREE.Vector3();
const _vel = new __B.THREE.Vector3();
function orientPlane() {
  _euler.set(flight.pitch, flight.yaw, -flight.roll, 'YXZ');
  _q.setFromEuler(_euler);
  plane.quaternion.copy(_q);
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
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
});
window.addEventListener('keyup', (e) => keys.delete(e.code));
let joyOn = false, joyPid = null;
function joyFrom(ev) {
  const r = joyBase.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  let dx = ev.clientX - cx, dy = ev.clientY - cy;
  const max = r.width * 0.42, len = Math.hypot(dx, dy) || 1, sc = len > max ? max / len : 1;
  joy.x = (dx * sc) / max;
  joy.y = (dy * sc) / max;
  joyKnob.style.transform = `translate(${dx * sc}px,${dy * sc}px)`;
}
function joyEnd() {
  joy.x = 0; joy.y = 0;
  joyKnob.style.transform = 'translate(0,0)';
  joyOn = false; joyPid = null;
}
joyBase.addEventListener('pointerdown', (e) => {
  joyOn = true; joyPid = e.pointerId;
  joyBase.setPointerCapture(e.pointerId);
  joyFrom(e); e.preventDefault();
});
joyBase.addEventListener('pointermove', (e) => { if (joyOn && e.pointerId === joyPid) joyFrom(e); });
joyBase.addEventListener('pointerup', joyEnd);
joyBase.addEventListener('pointercancel', joyEnd);
let thrOn = false, thrPid = null;
function thrFrom(ev) {
  const r = throttleTrack.getBoundingClientRect();
  throttle = __B.THREE.MathUtils.clamp(1 - (ev.clientY - r.top) / r.height, 0, 1);
  throttleKnob.style.bottom = `${throttle * 100}%`;
  throttleKnob.style.transform = 'translateY(50%)';
}
throttleKnob.style.bottom = '72%';
throttleKnob.style.transform = 'translateY(50%)';
throttleTrack.addEventListener('pointerdown', (e) => {
  thrOn = true; thrPid = e.pointerId;
  throttleTrack.setPointerCapture(e.pointerId);
  thrFrom(e); e.preventDefault();
});
throttleTrack.addEventListener('pointermove', (e) => { if (thrOn && e.pointerId === thrPid) thrFrom(e); });
throttleTrack.addEventListener('pointerup', () => { thrOn = false; });
throttleTrack.addEventListener('pointercancel', () => { thrOn = false; });
const raycaster = new __B.THREE.Raycaster();
const pointer = new __B.THREE.Vector2();
canvas.addEventListener('pointerdown', (e) => {
  if (!playing || e.target !== canvas) return;
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(markerGroup.children, true);
  if (!hits.length) return;
  let obj = hits[0].object;
  while (obj && !Object.values(markerMeshes).some((m) => m.group === obj)) obj = obj.parent;
  for (const [id, m] of Object.entries(markerMeshes)) {
    if (m.group === obj) {
      flyTarget = id;
      objectiveEl.textContent = `目標：飛往 ${m.lm.name}`;
      showToast(`導航 → ${m.lm.name}`);
      updateChecklist();
      break;
    }
  }
});
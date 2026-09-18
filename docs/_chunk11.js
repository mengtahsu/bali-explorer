ace', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
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
  throttle = THREE.MathUtils.clamp(1 - (ev.clientY - r.top) / r.height, 0, 1);
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

const raycaster = new THREE.Raycaster();
c
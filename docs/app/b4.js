
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.hidden = false;
  toastTimer = 2.5;
}
function updateChecklist() {
  checklistEl.querySelectorAll('li').forEach((li) => {
    const id = li.dataset.id;
    li.classList.toggle('done', visited.has(id));
    li.classList.toggle('active', flyTarget === id);
    const lm = LANDMARKS.find((l) => l.id === id);
    li.textContent = `${visited.has(id) ? '✓' : '○'} ${lm.name}`;
  });
}
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
function updateLayers(alt) {
  let band = BANDS[BANDS.length - 1];
  for (const b of BANDS) {
    if (alt >= b.min) { band = b; break; }
  }
  cloudGroup.visible = alt > 500;
  if (alt >= 2000) { scene.fog.density = 0.000005; scene.background.set(0x4a8ab8); }
  else if (alt >= 700) { scene.fog.density = 0.000009; scene.background.set(0x6aaad0); }
  else if (alt >= 200) { scene.fog.density = 0.000016; scene.background.set(0x7eb8d8); }
  else { scene.fog.density = 0.000024; scene.background.set(0x87c0e0); }
  layerEl.textContent = band.name;
  layerEl.className = 'layer-badge ' + band.cls;
}
function collide(dt) {
  const gnd = terrainHeight(flight.pos.x, flight.pos.z);
  const minY = gnd + 25;
  if (flight.pos.y < minY) {
    flight.pos.y = __B.THREE.MathUtils.lerp(flight.pos.y, minY, 1 - Math.exp(-6 * dt));
    if (flight.pitch < 0) flight.pitch *= 0.4;
    flight.speed *= 0.99;
  }
  if (flight.pos.y > 14000) flight.pos.y = 14000;
}
function checkLM() {
  for (const lm of LANDMARKS) {
    if (visited.has(lm.id)) continue;
    const dist = Math.hypot(flight.pos.x - lm.x, flight.pos.z - lm.z);
    const dy = flight.pos.y - terrainHeight(lm.x, lm.z);
    if (dist < 2800 && dy < 1600) {
      visited.add(lm.id);
      showToast(`抵達 ${lm.name}！`);
      updateChecklist();
      if (flyTarget === lm.id) {
        flyTarget = null;
        objectiveEl.textContent = '目標：點地標或自由巡航';
      }
      if (visited.size === LANDMARKS.length) {
        setTimeout(() => {
          if (playing) { playing = false; setPanel(winPanel, true); }
        }, 900);
      }
    }
  }
  for (const [id, m] of Object.entries(markerMeshes)) {
    m.ball.scale.setScalar(1 + (flyTarget === id ? Math.sin(performance.now() * 0.006) * 0.25 : 0));
  }
}
function updateFlight(dt) {
  if (keys.has('Space')) throttle = Math.min(1, throttle + dt * 0.35);
  if (keys.has('ShiftLeft') || keys.has('ShiftRight')) throttle = Math.max(0, throttle - dt * 0.4);
  let pitchInput = 0;
  let bankInput = 0;
  if (keys.has('KeyW') || keys.has('ArrowUp')) pitchInput += 1;
  if (keys.has('KeyS') || keys.has('ArrowDown')) pitchInput -= 1;
  pitchInput += -joy.y * 1.2;
  if (keys.has('KeyA') || keys.has('ArrowLeft') || keys.has('KeyQ')) bankInput -= 1;
  if (keys.has('KeyD') || keys.has('ArrowRight') || keys.has('KeyE')) bankInput += 1;
  bankInput += joy.x * 1.2;
  flight.pitch += pitchInput * 0.32 * dt;
  flight.roll += bankInput * 0.55 * dt;
  if (Math.abs(bankInput) < 0.05) flight.roll *= Math.exp(-1.2 * dt);
  flight.pitch = __B.THREE.MathUtils.clamp(flight.pitch, -0.45, 0.4);
  flight.roll = __B.THREE.MathUtils.clamp(flight.roll, -1.05, 1.05);
  const tgt = VMIN + throttle * (CRUISE - VMIN);
  flight.speed += (tgt - flight.speed) * (1 - Math.exp(-0.9 * dt));
  flight.speed = Math.max(70, Math.min(290, flight.speed));
  const vSafe = Math.max(flight.speed, 60);
  const turnRate = (G_ACCEL * Math.tan(flight.roll)) / vSafe;
  flight.yaw -= turnRate * dt;
  orientPlane();
  const horiz = Math.cos(flight.pitch);
  const vert = Math.sin(flight.pitch);
  _vel.set(Math.cos(flight.yaw) * horiz, vert, -Math.sin(flight.yaw) * horiz);
  flight.pos.addScaledVector(_vel, flight.speed * dt);
  plane.position.copy(flight.pos);
  collide(dt);
  checkLM();
}
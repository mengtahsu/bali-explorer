  if (keys.has('KeyW') || keys.has('ArrowUp')) pI -= 1;
  if (keys.has('KeyS') || keys.has('ArrowDown')) pI += 1;
  if (keys.has('KeyQ')) rI -= 1;
  if (keys.has('KeyE')) rI += 1;
  if (keys.has('KeyA') || keys.has('ArrowLeft')) yI += 1;
  if (keys.has('KeyD') || keys.has('ArrowRight')) yI -= 1;
  pI += joy.y * 1.2;
  rI += joy.x * 1.2;
  yI += joy.x * 0.4;
  flight.pitch += pI * 0.35 * dt;
  flight.roll += rI * 0.55 * dt;
  flight.yaw += yI * 0.28 * dt;
  if (Math.abs(rI) < 0.05) flight.roll *= Math.exp(-0.8 * dt);
  flight.pitch = THREE.MathUtils.clamp(flight.pitch, -0.45, 0.4);
  flight.roll = THREE.MathUtils.clamp(flight.roll, -0.7, 0.7);
  const tgt = VMIN + throttle * (CRUISE - VMIN) - flight.pitch * 40;
  flight.speed += (tgt - flight.speed) * (1 - Math.exp(-0.8 * dt));
  flight.speed = Math.max(70, Math.min(280, flight.speed));
  flight.yaw -= Math.sin(flight.roll) * 0.28 * dt * (flight.speed / 200);
  orientPlane();
  _fwd.set(1, 0, 0).applyQuaternion(plane.quaternion);
  const lift = throttle * 1.05 - 0.2;
  flight.pos.addScaledVector(_fwd, flight.speed * dt);
  flight.pos.y += (_fwd.y * flight.speed * 0.15 + lift * 8 - 12 * (1 - throttle)) * dt;
  plane.position.copy(flight.pos);
  collide(dt);
  checkLM();
}

function updateHUD() {
  const alt = Math.max(0, flight.pos.y);
  altEl.textContent = String(Math.round(alt));
  spdEl.textContent = String(Math.round(flight.speed * 3.6));
  let hdg = ((-flight.yaw * 180) / Math.PI + 90) % 360;
  if (hdg < 0) hdg += 360;
  hdgEl.textContent = String(Math.round(hdg));
  thrEl.textContent = String(Math.round(throttle * 100));
  updateLayers(alt);
  if (flyTarget) {
    const lm = LANDMARKS.find((l) => l.id === flyTarget);
    if (lm) {
      const d = Math.hypot(flight.pos.x - lm.x, flight.pos.z - lm.z);
      objectiveEl.textContent = `目標：${lm.name}（${Math.round(d / 100) / 10} km）`;
    }
  }
}

function resize() {
  const w = innerWidth, h = innerHeight;

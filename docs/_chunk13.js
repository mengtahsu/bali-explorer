0;
  G.ground.visible = alt >= 30 && alt < 120;
  G.ultra.visible = alt < 50;
  foam.visible = alt < 40;
  cloudGroup.visible = alt > 600;

  if (alt >= 2000) { scene.fog.density = 0.000006; scene.background.set(0x4a8ab8); }
  else if (alt >= 700) { scene.fog.density = 0.00001; scene.background.set(0x6aaad0); }
  else if (alt >= 200) { scene.fog.density = 0.000018; scene.background.set(0x7eb8d8); }
  else { scene.fog.density = 0.000028; scene.background.set(0x87c0e0); }

  layerEl.textContent = band.name;
  layerEl.className = 'layer-badge ' + band.cls;
}

function collide(dt) {
  const gnd = terrainHeight(flight.pos.x, flight.pos.z);
  const minY = gnd + 25;
  if (flight.pos.y < minY) {
    flight.pos.y = THREE.MathUtils.lerp(flight.pos.y, minY, 1 - Math.exp(-6 * dt));
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
    if (dist < 2500 && dy < 1500) {
      visited.add(lm.id);
      showToast(`抵達 ${lm.name}！`);
      updateChecklist();
      if (flyTarget === lm.id) {
        flyTarget = null;
        objectiveEl.textContent = '目標：點地標或自由巡航';
      }
      if (visited.size === LANDMARKS.length) {
        setTimeout(() => {
          if (playing) { playing = false; winPanel.hidden = false; }
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
  let pI = 0, rI = 0, yI = 0;

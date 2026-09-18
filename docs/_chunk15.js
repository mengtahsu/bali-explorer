  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
}
addEventListener('resize', resize);
resize();

let last = performance.now(), waterT = 0;
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  waterT += dt;
  ocean.position.y = -1 + Math.sin(waterT * 0.4) * 0.35;
  shallow.material.opacity = 0.42 + Math.sin(waterT * 0.6) * 0.06;
  if (toastTimer > 0) {
    toastTimer -= dt;
    if (toastTimer <= 0) toastEl.hidden = true;
  }
  if (playing) {
    updateFlight(dt);
    updateCamera(dt);
    updateHUD();
  } else if (!overlay.hidden) {
    const t = now * 0.00008;
    camera.position.set(Math.sin(t) * 90000, 12000, Math.cos(t) * 90000);
    camera.lookAt(0, 200, 0);
    updateLayers(12000);
    G.near.visible = false;
    G.ground.visible = false;
    G.ultra.visible = false;
  }
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

function resetFlight() {
  flight.pos.set(5000, 8500, 95000);
  flight.pitch = 0.02;
  flight.yaw = Math.PI;
  flight.roll = 0;
  flight.speed = 210;
  throttle = 0.72;
  throttleKnob.style.bottom = '72%';
  visited = new Set();
  flyTarget = 'dps';
  objectiveEl.textContent = '目標：飛往 DPS 機場';
  updateChecklist();
  winPanel.hidden = true;
  plane.position.copy(flight.pos);
  orientPlane();
  updateCamera(1);
  updateHUD();
}
function startGame() {
  overlay.hidden = true;
  winPanel.hidden = true;
  playing = true;
  resetFlight();
  showToast('起飛！華航 A330 往北飛向峇里島');
}
startBtn.addEventListener('click', startGame);
againBtn.addEventListener('click', () => {
  winPanel.hidden = true;
  playing = true;
  resetFlight();
  showToast('再次起飛');
});
updateLayers(8500);
updateChecklist();
objectiveEl.textContent = '目標：開始後飛往地標';
console.info('[Bali Flight] A330 · 1m · island ~110km · 8 layers');


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
  ocean.position.y = -0.5 + Math.sin(waterT * 0.4) * 0.25;
  if (toastTimer > 0) {
    toastTimer -= dt;
    if (toastTimer <= 0) toastEl.hidden = true;
  }
  if (playing) {
    updateFlight(dt);
    updateCamera(dt);
    updateHUD();
  } else if (!overlay.hidden) {
    const t = now * 0.00006;
    camera.position.set(Math.sin(t) * WORLD_W * 0.55, 14000, Math.cos(t) * WORLD_D * 0.65);
    camera.lookAt(0, 400, 0);
    updateLayers(12000);
  }
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
function resetFlight() {
  const s = lonLatToXZ(115.2, -9.15);
  flight.pos.set(s.x, 8500, s.z);
  flight.pitch = 0.02;
  flight.yaw = Math.PI / 2;
  flight.roll = 0;
  flight.speed = 210;
  throttle = 0.72;
  throttleKnob.style.bottom = '72%';
  visited = new Set();
  flyTarget = 'dps';
  objectiveEl.textContent = '目標：飛往 DPS 機場';
  updateChecklist();
  plane.position.copy(flight.pos);
  orientPlane();
  updateCamera(1);
  updateHUD();
}
function startGame() {
  setPanel(overlay, false);
  setPanel(winPanel, false);
  playing = true;
  resetFlight();
  showToast('起飛！往北飛向峇里島');
}
function playAgain() {
  setPanel(winPanel, false);
  setPanel(overlay, false);
  playing = true;
  resetFlight();
  showToast('再次起飛');
}
startBtn.addEventListener('click', startGame);
againBtn.addEventListener('click', playAgain);
startBtn.addEventListener('touchend', (e) => { e.preventDefault(); startGame(); }, { passive: false });
againBtn.addEventListener('touchend', (e) => { e.preventDefault(); playAgain(); }, { passive: false });
(function boot() {
  const fallback = makeVertexColorFallback();
  buildTerrains(fallback);
  placeMarkers();
  updateChecklist();
  startBtn.disabled = false;
  startBtn.textContent = '開始飛行';
  startBtn.style.opacity = '1';
  try {
    if (__B.SAT_JPG_B64) {
      const bin = Uint8Array.from(atob(__B.SAT_JPG_B64), (c) => c.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bin], { type: 'image/jpeg' }));
      const loader = new __B.THREE.TextureLoader();
      loader.load(url, (tex) => {
        tex.colorSpace = __B.THREE.SRGBColorSpace;
        tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        buildTerrains(tex);
        placeMarkers();
        URL.revokeObjectURL(url);
      }, undefined, () => URL.revokeObjectURL(url));
    }
  } catch (e) {
    console.warn('[Bali PWA] sat embed skip', e);
  }
})();

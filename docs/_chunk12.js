onst pointer = new THREE.Vector2();
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

function updateLayers(alt) {
  let band = BANDS[BANDS.length - 1];
  for (const b of BANDS) {
    if (alt >= b.min) { band = b; break; }
  }
  G.extreme.visible = alt >= 2000;
  G.high.visible = alt >= 1200 && alt < 2200;
  G.midHigh.visible = alt >= 700 && alt < 1300;
  G.mid.visible = alt >= 400 && alt < 800;
  G.low.visible = alt < 500;
  if (alt >= 2000) G.low.visible = false;
  else if (alt >= 1200) { G.high.visible = true; G.low.visible = false; }
  else if (alt >= 700) { G.midHigh.visible = true; G.low.visible = false; }
  else if (alt >= 400) { G.mid.visible = true; G.low.visible = false; }
  else G.low.visible = true;

  G.near.visible = alt >= 80 && alt < 28
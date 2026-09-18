import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

const canvas = document.getElementById('c');
const overlay = document.getElementById('overlay');
const winPanel = document.getElementById('win');
const startBtn = document.getElementById('startBtn');
const againBtn = document.getElementById('againBtn');
const countEl = document.getElementById('count');
const totalEl = document.getElementById('total');
const checklistEl = document.getElementById('checklist');
const toastEl = document.getElementById('toast');
const joyBase = document.getElementById('joyBase');
const joyKnob = document.getElementById('joyKnob');
const actionBtn = document.getElementById('actionBtn');

const LANDMARKS = [
  { id: 'dps', name: 'DPS 機場', color: 0xf4d35e, x: 22, z: 18 },
  { id: 'seminyak', name: 'Seminyak · W Bali', color: 0x4ecdc4, x: -8, z: 20 },
  { id: 'hoshinoya', name: 'Hoshinoya · 內陸', color: 0x95e06c, x: -2, z: -6 },
  { id: 'uluwatu', name: 'Uluwatu 懸崖', color: 0xff6b6b, x: -18, z: 28 },
];

totalEl.textContent = String(LANDMARKS.length);
checklistEl.innerHTML = LANDMARKS.map(
  (l) => `<li data-id="${l.id}">○ ${l.name}</li>`
).join('');

const keys = new Set();
const mouse = { x: 0, y: 0, down: false };
const joy = { x: 0, y: 0 };
let playing = false;
let yaw = Math.PI * 0.85;
let collected = new Set();
let nearest = null;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 55, 140);

const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 300);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

const hemi = new THREE.HemisphereLight(0xfff1c1, 0x3a6b4f, 1.1);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffe6b0, 1.35);
sun.position.set(40, 60, 20);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = -50;
sun.shadow.camera.right = 50;
sun.shadow.camera.top = 50;
sun.shadow.camera.bottom = -50;
scene.add(sun);

// Ocean
const ocean = new THREE.Mesh(
  new THREE.CircleGeometry(120, 64),
  new THREE.MeshStandardMaterial({ color: 0x1f6f8b, roughness: 0.35, metalness: 0.1 })
);
ocean.rotation.x = -Math.PI / 2;
ocean.position.y = -0.2;
scene.add(ocean);

// Stylized Bali island (elongated pear-ish)
function makeIslandShape() {
  const s = new THREE.Shape();
  s.moveTo(0, -32);
  s.bezierCurveTo(18, -30, 34, -12, 32, 8);
  s.bezierCurveTo(30, 24, 18, 34, 4, 36);
  s.bezierCurveTo(-10, 36, -22, 28, -28, 14);
  s.bezierCurveTo(-34, 0, -30, -16, -18, -28);
  s.bezierCurveTo(-8, -34, -4, -34, 0, -32);
  return s;
}

const islandGeo = new THREE.ExtrudeGeometry(makeIslandShape(), {
  depth: 2.2,
  bevelEnabled: true,
  bevelThickness: 0.4,
  bevelSize: 0.5,
  bevelSegments: 2,
  curveSegments: 32,
});
islandGeo.rotateX(-Math.PI / 2);
islandGeo.computeVertexNormals();
const island = new THREE.Mesh(
  islandGeo,
  new THREE.MeshStandardMaterial({ color: 0x3d8b5f, roughness: 0.92, metalness: 0.05 })
);
island.receiveShadow = true;
island.castShadow = true;
island.position.y = 0.1;
scene.add(island);

// Hills / rice terrace vibes
function addHill(x, z, r, h, color) {
  const m = new THREE.Mesh(
    new THREE.ConeGeometry(r, h, 8),
    new THREE.MeshStandardMaterial({ color, flatShading: true })
  );
  m.position.set(x, h * 0.45, z);
  m.castShadow = true;
  scene.add(m);
}
addHill(-4, -10, 5, 4.5, 0x2f6b45);
addHill(6, -4, 4, 3.2, 0x458f5c);
addHill(-14, 8, 3.5, 2.8, 0x3a7a50);
addHill(12, 6, 3, 2.4, 0x4a9a62);

// Beach rim strips (Seminyak / south)
const beach = new THREE.Mesh(
  new THREE.BoxGeometry(28, 0.15, 6),
  new THREE.MeshStandardMaterial({ color: 0xe8d5a3 })
);
beach.position.set(-6, 1.15, 24);
beach.receiveShadow = true;
scene.add(beach);

// Simple roads
function road(x1, z1, x2, z2) {
  const dx = x2 - x1;
  const dz = z2 - z1;
  const len = Math.hypot(dx, dz);
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.08, len),
    new THREE.MeshStandardMaterial({ color: 0x5a5a5a })
  );
  mesh.position.set((x1 + x2) / 2, 1.2, (z1 + z2) / 2);
  mesh.rotation.y = Math.atan2(dx, dz);
  mesh.receiveShadow = true;
  scene.add(mesh);
}
road(22, 18, -8, 20);
road(-8, 20, -2, -6);
road(-8, 20, -18, 28);
road(22, 18, -2, -6);

const markerGroup = new THREE.Group();
scene.add(markerGroup);
const markerMeshes = [];

for (const lm of LANDMARKS) {
  const pillar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.55, 2.2, 10),
    new THREE.MeshStandardMaterial({ color: lm.color, emissive: lm.color, emissiveIntensity: 0.25 })
  );
  pillar.position.set(lm.x, 2.3, lm.z);
  pillar.castShadow = true;
  pillar.userData = { id: lm.id };
  markerGroup.add(pillar);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.6, 0.08, 8, 32),
    new THREE.MeshBasicMaterial({ color: lm.color })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.set(lm.x, 1.25, lm.z);
  markerGroup.add(ring);

  const label = makeLabel(lm.name);
  label.position.set(lm.x, 4.2, lm.z);
  markerGroup.add(label);
  markerMeshes.push({ lm, pillar, ring, label });
}

function makeLabel(text) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  roundRect(ctx, 16, 24, 480, 80, 18);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 64);
  const tex = new THREE.CanvasTexture(c);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
  const spr = new THREE.Sprite(mat);
  spr.scale.set(8, 2, 1);
  return spr;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Player scooter-ish
const player = new THREE.Group();
const body = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.35, 0.7, 4, 8),
  new THREE.MeshStandardMaterial({ color: 0xff8c42 })
);
body.position.y = 1.1;
body.castShadow = true;
player.add(body);
const board = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 0.15, 1.1),
  new THREE.MeshStandardMaterial({ color: 0x222222 })
);
board.position.y = 0.55;
player.add(board);
player.position.set(20, 1.2, 16);
scene.add(player);

// Palm-ish trees near Seminyak
function palm(x, z) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.18, 2.8, 6),
    new THREE.MeshStandardMaterial({ color: 0x8b5a2b })
  );
  trunk.position.set(x, 2.5, z);
  trunk.castShadow = true;
  scene.add(trunk);
  const frond = new THREE.Mesh(
    new THREE.ConeGeometry(1.4, 1.2, 7),
    new THREE.MeshStandardMaterial({ color: 0x2ecc71, flatShading: true })
  );
  frond.position.set(x, 4.1, z);
  scene.add(frond);
}
for (const [x, z] of [
  [-12, 22],
  [-6, 22],
  [-10, 18],
  [-16, 26],
  [18, 16],
]) {
  palm(x, z);
}

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}
window.addEventListener('resize', resize);
resize();

window.addEventListener('keydown', (e) => {
  keys.add(e.code);
  if (playing && (e.code === 'KeyE' || e.code === 'Space')) {
    e.preventDefault();
    tryCollect();
  }
});
window.addEventListener('keyup', (e) => keys.delete(e.code));

canvas.addEventListener('pointerdown', (e) => {
  if (!playing) return;
  mouse.down = true;
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointerup', () => {
  mouse.down = false;
});
canvas.addEventListener('pointermove', (e) => {
  if (!playing || !mouse.down) return;
  const dx = e.clientX - mouse.x;
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  yaw -= dx * 0.005;
});

// Virtual joystick
function setupJoy() {
  const onMove = (clientX, clientY) => {
    const rect = joyBase.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = (clientX - cx) / (rect.width / 2);
    let dy = (clientY - cy) / (rect.height / 2);
    const mag = Math.hypot(dx, dy) || 1;
    if (mag > 1) {
      dx /= mag;
      dy /= mag;
    }
    joy.x = dx;
    joy.y = dy;
    joyKnob.style.transform = `translate(${dx * 28}px, ${dy * 28}px)`;
  };
  const end = () => {
    joy.x = 0;
    joy.y = 0;
    joyKnob.style.transform = '';
  };
  joyBase.addEventListener('pointerdown', (e) => {
    joyBase.setPointerCapture(e.pointerId);
    onMove(e.clientX, e.clientY);
  });
  joyBase.addEventListener('pointermove', (e) => {
    if (e.buttons || e.pressure > 0) onMove(e.clientX, e.clientY);
  });
  joyBase.addEventListener('pointerup', end);
  joyBase.addEventListener('pointercancel', end);
  actionBtn.addEventListener('click', () => {
    if (playing) tryCollect();
  });
}
setupJoy();

function showToast(msg) {
  toastEl.hidden = false; toastEl.style.display = '';
  toastEl.textContent = msg;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    toastEl.hidden = true; toastEl.style.display = 'none';
  }, 1800);
}

function tryCollect() {
  if (!nearest || collected.has(nearest.id)) {
    if (nearest && collected.has(nearest.id)) showToast('這裡已經蓋過章了');
    else showToast('再靠近地標一點');
    return;
  }
  collected.add(nearest.id);
  countEl.textContent = String(collected.size);
  const li = checklistEl.querySelector(`[data-id="${nearest.id}"]`);
  if (li) {
    li.classList.add('done');
    li.textContent = `✓ ${nearest.name}`;
  }
  const m = markerMeshes.find((x) => x.lm.id === nearest.id);
  if (m) {
    m.pillar.material.emissiveIntensity = 0.8;
    m.ring.scale.setScalar(1.35);
  }
  showToast(`蓋章：${nearest.name}`);
  if (collected.size >= LANDMARKS.length) {
    setTimeout(() => {
      playing = false;
      setPanel(winPanel, true);
    }, 600);
  }
}

function resetGame() {
  setPanel(winPanel, false);
  collected.clear();
  countEl.textContent = '0';
  checklistEl.innerHTML = LANDMARKS.map(
    (l) => `<li data-id="${l.id}">○ ${l.name}</li>`
  ).join('');
  for (const m of markerMeshes) {
    m.pillar.material.emissiveIntensity = 0.25;
    m.ring.scale.setScalar(1);
  }
  player.position.set(20, 1.2, 16);
  yaw = Math.PI * 0.85;
  setPanel(winPanel, false);
}

setPanel(winPanel, false);
setPanel(overlay, true);

function startGame() {
  setPanel(overlay, false);
  setPanel(winPanel, false);
  playing = true;
  showToast('出發！往黃色 DPS 機場去');
}
function playAgain() {
  resetGame();
  setPanel(winPanel, false);
  setPanel(overlay, false);
  playing = true;
  showToast('再走一趟峇里島');
}
startBtn.addEventListener('click', startGame);
againBtn.addEventListener('click', playAgain);
startBtn.addEventListener('touchend', (e) => { e.preventDefault(); startGame(); }, { passive: false });
againBtn.addEventListener('touchend', (e) => { e.preventDefault(); playAgain(); }, { passive: false });


function setPanel(el, visible) {
  if (!el) return;
  el.hidden = !visible;
  el.style.display = visible ? 'grid' : 'none';
}

const clock = new THREE.Clock();
const speed = 12;

function updatePlayer(dt) {
  let mx = 0;
  let mz = 0;
  if (keys.has('KeyW') || keys.has('ArrowUp')) mz -= 1;
  if (keys.has('KeyS') || keys.has('ArrowDown')) mz += 1;
  if (keys.has('KeyA') || keys.has('ArrowLeft')) mx -= 1;
  if (keys.has('KeyD') || keys.has('ArrowRight')) mx += 1;
  mx += joy.x;
  mz += joy.y;
  const len = Math.hypot(mx, mz);
  if (len > 0) {
    mx /= len;
    mz /= len;
    const forward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
    const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
    const move = forward.multiplyScalar(-mz).add(right.multiplyScalar(mx));
    player.position.addScaledVector(move, speed * dt);
    player.rotation.y = Math.atan2(move.x, move.z);
  }
  // Soft bounds around island
  player.position.x = THREE.MathUtils.clamp(player.position.x, -40, 40);
  player.position.z = THREE.MathUtils.clamp(player.position.z, -40, 40);
  player.position.y = 1.2;

  // Camera follow
  const camOffset = new THREE.Vector3(
    Math.sin(yaw) * 10,
    7.5,
    Math.cos(yaw) * 10
  );
  const target = player.position.clone().add(new THREE.Vector3(0, 1.2, 0));
  const desired = target.clone().add(camOffset);
  camera.position.lerp(desired, 1 - Math.pow(0.001, dt));
  camera.lookAt(target);

  // Nearest landmark
  nearest = null;
  let best = 4.2;
  for (const lm of LANDMARKS) {
    const d = Math.hypot(player.position.x - lm.x, player.position.z - lm.z);
    if (d < best) {
      best = d;
      nearest = lm;
    }
  }
  for (const m of markerMeshes) {
    const active = nearest && nearest.id === m.lm.id && !collected.has(m.lm.id);
    m.ring.material.opacity = active ? 1 : 0.55;
    m.ring.material.transparent = true;
    m.ring.rotation.z += dt * (active ? 1.5 : 0.3);
  }
}

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  if (playing) updatePlayer(dt);
  else {
    camera.position.set(28, 22, 42);
    camera.lookAt(0, 0, 4);
  }
  // gentle ocean shimmer via color pulse
  ocean.material.color.offsetHSL(0, 0, Math.sin(clock.elapsedTime * 0.4) * 0.0005);
  renderer.render(scene, camera);
}
animate();

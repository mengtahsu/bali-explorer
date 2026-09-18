const __B = globalThis.__B;
const canvas = document.getElementById('c');
const overlay = document.getElementById('overlay');
const winPanel = document.getElementById('win');
const startBtn = document.getElementById('startBtn');
const againBtn = document.getElementById('againBtn');
const altEl = document.getElementById('alt');
const spdEl = document.getElementById('spd');
const hdgEl = document.getElementById('hdg');
const thrEl = document.getElementById('thr');
const layerEl = document.getElementById('layer');
const objectiveEl = document.getElementById('objective');
const checklistEl = document.getElementById('checklist');
const toastEl = document.getElementById('toast');
const joyBase = document.getElementById('joyBase');
const joyKnob = document.getElementById('joyKnob');
const throttleTrack = document.getElementById('throttleTrack');
const throttleKnob = document.getElementById('throttleKnob');
function setPanel(el, v) {
  if (!el) return;
  el.hidden = !v;
  el.style.display = v ? 'grid' : 'none';
}
setPanel(winPanel, false);
setPanel(overlay, true);
const LON_MIN = 114.42, LON_MAX = 115.72;
const LAT_MIN = -8.85, LAT_MAX = -8.06;
const CENTER_LON = (LON_MIN + LON_MAX) / 2;
const CENTER_LAT = (LAT_MIN + LAT_MAX) / 2;
const M_PER_DEG_LON = 111320 * Math.cos((CENTER_LAT * Math.PI) / 180);
const M_PER_DEG_LAT = 110540;
const WORLD_W = (LON_MAX - LON_MIN) * M_PER_DEG_LON;
const WORLD_D = (LAT_MAX - LAT_MIN) * M_PER_DEG_LAT;
function lonLatToXZ(lon, lat) {
  return {
    x: (lon - CENTER_LON) * M_PER_DEG_LON,
    z: (CENTER_LAT - lat) * M_PER_DEG_LAT,
  };
}
const A330_SPAN = 60.3;
const CRUISE = 240;
const VMIN = 90;
const CAM_BACK = 380;
const CAM_UP = 70;
const G_ACCEL = 9.81;
const LANDMARKS = [
  { id: 'dps', name: 'DPS 機場', color: 0xf4d35e, lon: 115.167172, lat: -8.748169 },
  { id: 'seminyak', name: 'Seminyak', color: 0x4ecdc4, lon: 115.157, lat: -8.6908 },
  { id: 'hoshinoya', name: 'Hoshinoya 內陸', color: 0x95e06c, lon: 115.2624, lat: -8.5069 },
  { id: 'uluwatu', name: 'Uluwatu', color: 0xff6b6b, lon: 115.0849, lat: -8.8291 },
];
LANDMARKS.forEach((lm) => {
  const p = lonLatToXZ(lm.lon, lm.lat);
  lm.x = p.x;
  lm.z = p.z;
});
checklistEl.innerHTML = LANDMARKS.map((l) => `<li data-id="${l.id}">○ ${l.name}</li>`).join('');
const keys = new Set();
const joy = { x: 0, y: 0 };
let throttle = 0.72;
let playing = false;
let visited = new Set();
let flyTarget = null;
let toastTimer = 0;
const scene = new __B.THREE.Scene();
scene.background = new __B.THREE.Color(0x6aaad0);
scene.fog = new __B.THREE.FogExp2(0x9ec8e0, 0.000012);
const camera = new __B.THREE.PerspectiveCamera(55, 1, 5, 500000);
const renderer = new __B.THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.outputColorSpace = __B.THREE.SRGBColorSpace;
scene.add(new __B.THREE.HemisphereLight(0xfff2dc, 0x1a3a4a, 0.85));
const sun = new __B.THREE.DirectionalLight(0xffe8c0, 1.15);
sun.position.set(80000, 120000, 40000);
scene.add(sun);
scene.add(new __B.THREE.AmbientLight(0x708090, 0.35));
{
  const mat = new __B.THREE.ShaderMaterial({
    side: __B.THREE.BackSide,
    depthWrite: false,
    uniforms: {
      top: { value: new __B.THREE.Color(0x1a5a9a) },
      mid: { value: new __B.THREE.Color(0x87b8d8) },
      bot: { value: new __B.THREE.Color(0xc8e0f0) },
    },
    vertexShader: `varying vec3 v; void main(){ v=normalize((modelMatrix*vec4(position,1.0)).xyz); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `uniform vec3 top,mid,bot; varying vec3 v; void main(){ float h=clamp(v.y*0.5+0.5,0.0,1.0); vec3 c=mix(bot,mid,smoothstep(0.0,0.45,h)); c=mix(c,top,smoothstep(0.45,1.0,h)); gl_FragColor=vec4(c,1.0); }`,
  });
  scene.add(new __B.THREE.Mesh(new __B.THREE.SphereGeometry(420000, 24, 12), mat));
}
/**
 * 峇里島飛行模擬 · Bali Flight Simulator
 * Airbus A330-300 · 1 unit = 1 meter · ~110 km island
 * China Airlines–style livery · 8 altitude layers
 */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

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
winPanel.hidden = true;

/* Scale: 1 unit = 1 m */
const ISLAND = 110000;
const A330_SPAN = 60.3;
const CRUISE = 240;
const VMIN = 90;
const CAM_BACK = 380;
const CAM_UP = 70;

const LANDMARKS = [
  { id: 'dps', name: 'DPS 機場', color: 0xf4d35e, x: 22000, z: 18000 },
  { id: 'seminyak', name: 'Seminyak', color: 0x4ecdc4, x: -14000, z: 20000 },
  { id: 'hoshinoya', name: 'Hoshinoya 內陸', color: 0x95e06c, x: -5000, z: -10000 },
  { id: 'uluwatu', name: 'Uluwatu', color: 0xff6b6b, x: -20000, z: 32000 },
];
checklistEl.innerHTML = LANDMARKS.map((l) => `<li data-id="${l.id}">○ ${l.name}</li>`).join('');

const keys = new Set();
const joy = { x: 0, y: 0 };
let throttle = 0.72;
let playing = false;
let visited = new Set();
let flyTarget = null;
let toastTimer = 0;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x6aaad0);
scene.fog = new THREE.FogExp2(0x9ec8e0, 0.000012);

const camera = new THREE.PerspectiveCamera(55, 1, 5, 450000);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.outputColorSpace = THREE.SRGBColorSpace;

scene.add(new THREE.HemisphereLight(0xfff2dc, 0x1a4a3a, 0.95));
const sun = new THREE.DirectionalLight(0xffe8c0, 1.35);
sun.position.set(80000, 120000, 40000);
scene.add(sun);
scene.add(new THREE.AmbientLight(0x6080a0, 0.3));

{
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      top: { value: new THREE.Color(0x1a5a9a) },
      mid: { value: new THREE.Color(0x87b8d8) },
      bot: { value: new THREE.Color(0xc8e0f0) },
    },
    vertexShader: `varying vec3 v; void main(){ v=normalize((modelMatrix*vec4(position,1.0)).xyz); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `uniform vec3 top,mid,bot; varying vec3 v; void main(){ float h=clamp(v.y*0.5+0.5,0.0,1.0); vec3 c=mix(bot,mid,smoothstep(0.0,0.45,h)); c=mix(c,top,smoothstep(0.45,1.0,h)); gl_FragColor=vec4(c,1.0); }`,
  });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(380000, 32, 16), mat));
}

function hash2(x, z) {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function smoothNoise(x, z) {
  const ix = Math.floor(x), iz = Math.floor(z);
  const fx = x - ix, fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx), uz = fz * fz * (3 - 2 * fz);
  return (
    hash2(ix, iz) * (1 - ux) * (1 - uz) +
    hash2(ix + 1, iz) * ux * (1 - uz) +
    hash2(ix, iz + 1) * (1 - ux) * uz +
    hash2(ix + 1, iz + 1) * ux * uz
  );
}
function fbm(x, z, oct = 5) {
  let v = 0, a = 0.5, f = 1;
  for (let i = 0; i < oct; i++) {
    v += a * smoothNoise(x * f, z * f);
    a *= 0.5;

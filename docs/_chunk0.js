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
scene.backgrou
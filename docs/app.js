import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
import { HM_U8_B64, HM_W as HM_W0, HM_H as HM_H0, HM_SCALE } from './app/hm128.js';
import { SAT_JPG_B64 } from './app/sat.js';
globalThis.__B = { THREE, HM_U8_B64, HM_W0, HM_H0, HM_SCALE, SAT_JPG_B64 };
const [ta, tb] = await Promise.all([
  fetch(new URL('./app/body_a.js', import.meta.url)).then((r) => r.text()),
  fetch(new URL('./app/body_b.js', import.meta.url)).then((r) => r.text()),
]);
const url = URL.createObjectURL(new Blob([ta + tb], { type: 'text/javascript' }));
await import(url);
URL.revokeObjectURL(url);

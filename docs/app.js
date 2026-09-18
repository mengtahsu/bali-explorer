import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
import { HM_U8_B64, HM_W as HM_W0, HM_H as HM_H0, HM_SCALE } from './app/hm128.js';
import { SAT_JPG_B64 } from './app/sat.js';
globalThis.__B = { THREE, HM_U8_B64, HM_W0, HM_H0, HM_SCALE, SAT_JPG_B64 };
const urls = ['./app/body_0.js','./app/body_1.js','./app/body_2.js'];
const parts = await Promise.all(urls.map((u) => fetch(new URL(u, import.meta.url)).then((r) => r.text())));
const blobUrl = URL.createObjectURL(new Blob([parts.join('')], { type: 'text/javascript' }));
await import(blobUrl);
URL.revokeObjectURL(blobUrl);

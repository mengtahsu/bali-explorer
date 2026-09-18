// 128×80 Int16 LE + 8-byte header (w,h uint32 LE)
import { P0 } from './hm_p0.js';
import { P1 } from './hm_p1.js';
import { P2 } from './hm_p2.js';
import { P3 } from './hm_p3.js';
export const HM_W = 128, HM_H = 80;
export const HM_B64 = P0 + P1 + P2 + P3;

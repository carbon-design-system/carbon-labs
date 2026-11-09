/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ZoomReset32 from '@carbon/icons/es/zoom--reset/32.js';
import { hoverIcon, carbonArt } from '../../engine';
import { mapPath, type Pt } from '../../geometry';
import { LINE } from '../../paint';
import { magnifierAt } from '../../magnifier';

/**
 * Zoom reset, as Search: on hover the lens (the reset loop) stays in place
 * and grows 1px in diameter while it turns 45° anticlockwise
 * (Zoom reset's turn), and the handle turns 15° clockwise about the
 * lens centre (staying on the lens). 160ms entrance ease.
 *
 * Constant line weight: the loop is its 2px centreline, fitted to Carbon —
 * the arrow an L (miter corner, butt ends) and the ring an arc of r=10 from
 * the arrow's inside corner round to its left end at y=16. The hover
 * rotates and scales the loop's points; the stroke never scales. Rest
 * matches Carbon within 0.5%.
 */

const C: Pt = [14, 14];
const R = 10;

/** A point on the ring at `deg` (0 = east, clockwise on screen). */
const onRing = (deg: number): Pt => [
  C[0] + R * Math.cos((deg * Math.PI) / 180),
  C[1] + R * Math.sin((deg * Math.PI) / 180),
];
// The ring starts inside the arrow's corner and runs clockwise over the
// top to its left end, where it crosses y=16.
const RING_START = onRing(208.5);
const RING_END = onRing(180 - (Math.asin((16 - C[1]) / R) * 180) / Math.PI);
const LOOP = `M5 2V9H12M${RING_START[0]} ${RING_START[1]}A${R} ${R} 0 1 1 ${RING_END[0]} ${RING_END[1]}`;
const HANDLE: [number, number] = [
  (21.4478 - C[0]) * Math.SQRT2,
  (29.293 - C[0]) * Math.SQRT2,
];

export const ZoomResetSpec = /* @__PURE__ */ hoverIcon('ZoomReset', {
  geo: ({ h }) => {
    const m = magnifierAt({ c: C, r: R, w: 2, handle: HANDLE }, h);
    const a = (-45 * h * Math.PI) / 180;
    const [cos, sin] = [Math.cos(a) * m.scale, Math.sin(a) * m.scale];
    const loop = mapPath(
      LOOP,
      ([x, y]) => [
        m.c[0] + (x - C[0]) * cos - (y - C[1]) * sin,
        m.c[1] + (x - C[0]) * sin + (y - C[1]) * cos,
      ],
      m.scale
    );
    return {
      loop: { d: loop, ...LINE, strokeLinejoin: 'miter' },
      handle: { d: `M${m.a[0]} ${m.a[1]}L${m.b[0]} ${m.b[1]}`, ...LINE },
    };
  },
  static: /* @__PURE__ */ carbonArt(ZoomReset32),
});

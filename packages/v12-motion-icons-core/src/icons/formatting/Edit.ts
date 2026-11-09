/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Edit32 from '@carbon/icons/es/edit/32.js';
import { carbonArt, HOVER, hoverIcon, type Shapes } from '../../engine';

/**
 * Carbon `edit` (no reference animation).
 *
 * Hover: the pencil slides 2px right,
 * and the underline grows 2px at each end about its own centre, where it
 * rests (2–30 to 0–32), so it spreads evenly either side. It stretches only
 * along its length, so its 2px height holds.
 * Carbon's paths are used verbatim; rest is Carbon's drawing.
 *
 * Timing: the standard hover (160ms entrance in, the 120ms leave).
 */
const WRITE = 2;
const WIDEN = 4; // total, split evenly between the two ends

const UNDERLINE = { x: 2, y: 26, width: 28, height: 2 };
export const PENCIL =
  'M25.4,9c0.8-0.8,0.8-2,0-2.8c0,0,0,0,0,0l-3.6-3.6c-0.8-0.8-2-0.8-2.8,0c0,0,0,0,0,0l-15,15V24h6.4L25.4,9z M20.4,4L24,7.6l-3,3L17.4,7L20.4,4z M6,22v-3.6l10-10l3.6,3.6l-10,10H6z';

const r4 = (n: number) => Math.round(n * 1e4) / 1e4 || 0;

/** The underline's ends [left, right] at hover h: it widens evenly about its resting centre. */
export function underlineEnds(h: number): [number, number] {
  const grow = (WIDEN * h) / 2;
  return [r4(UNDERLINE.x - grow), r4(UNDERLINE.x + UNDERLINE.width + grow)];
}
/** How far the pencil has slid right at hover h. */
export const pencilSlide = (h: number) => r4(WRITE * h);

/** The underline and pencil at hover progress h. */
function editShapes({ h }: { h: number }): Shapes {
  const [x0, x1] = underlineEnds(h);
  return {
    underline: { tag: 'rect', ...UNDERLINE, x: x0, width: r4(x1 - x0) },
    pencil: { d: PENCIL, transform: `translate(${pencilSlide(h)} 0)` },
  };
}

export const EditSpec = /* @__PURE__ */ hoverIcon('Edit', {
  geo: editShapes,
  hover: HOVER,
  static: /* @__PURE__ */ carbonArt(Edit32),
});

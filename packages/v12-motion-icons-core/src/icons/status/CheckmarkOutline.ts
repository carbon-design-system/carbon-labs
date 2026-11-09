/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import CheckmarkOutline32 from '@carbon/icons/es/checkmark--outline/32.js';
import { carbonArt, HOVER, hoverIcon, type Shapes } from '../../engine';
import { polyPath, ringPath, scalePts, type Pt } from '../../geometry';
import { MITER } from '../../paint';

/**
 * Timing: moderate01, entrance
 *   "circle"  ellipse 26 → 28 (r 13 → 14), stroke 2.
 *   "dash"    layer scale 100 → 120% about anchor (16.004, 16.148).
 *
 * Hover: the ring grows r 13 → 14 and the check grows 20% about
 * (16.004, 16.148). The reference's layer scale would thicken the check's line too;
 * the line weight stays at 2px, so both are geometry, not a CSS
 * scale. No redraw: drawing the check on is too expressive for a hover.
 *
 * The ring is a filled annulus in Carbon's own form (`ringPath`), so it
 * rasterises exactly like Carbon's.
 *
 * The check is Carbon's filled polygon re-expressed as its centreline:
 * a 2px stroke with a miter join and butt caps.
 *
 * Timing: the entrance ease both ways (160ms in, 120ms out).
 */
const GROW = 1.2;
const CENTRE: Pt = [16, 16];
const CHECK_PIVOT: Pt = [16.004, 16.148];
const CHECK: Pt[] = [
  [9.7065, 15.7065],
  [14, 20],
  [22.2925, 11.7075],
];

/** The check's centreline at hover progress h. */
export const outlineCheck = (h: number): Pt[] =>
  scalePts(CHECK, CHECK_PIVOT, 1 + (GROW - 1) * h);

/** The ring and check at hover progress h. */
function checkmarkOutlineShapes({ h }: { h: number }): Shapes {
  return {
    ring: { d: ringPath(CENTRE, 13 + h, 2) },
    check: { d: polyPath(outlineCheck(h)), ...MITER },
  };
}

export const CheckmarkOutlineSpec = /* @__PURE__ */ hoverIcon(
  'CheckmarkOutline',
  {
    geo: checkmarkOutlineShapes,
    hover: HOVER,
    static: /* @__PURE__ */ carbonArt(CheckmarkOutline32),
  }
);

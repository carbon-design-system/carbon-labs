/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import TrashCan32 from '@carbon/icons/es/trash-can/32.js';
import { defineAction, hoverIcon, carbonArt } from '../../engine';
import { rectPath } from '../../geometry';
import { phase } from '../../actionGeo';
import { ENTRANCE, EXIT } from '../../ease';

/**
 * Timing: moderate01, entrance
 * (36×36 comp; coordinates below are in the centred 32×32 frame).
 *
 *   "lid"  anchor [9,2] at p [9,-9] under a null at [18,18] → pivot (25, 7),
 *          on the rim above the right wall. r 0 → 10° (clockwise). No translate.
 *   "can"  static.
 *
 * Hover: the lid (rim bar + handle) tips 10° clockwise about (25, 7), so its
 * left end lifts clear of the can and its right end dips over the wall. The
 * rim bar also extends 1px at each end (2px longer), at its
 * 2px weight.
 *
 * Carbon draws rim and body as one shape. Split, the body becomes an open
 * can: its two walls rise to square tops under the rim, which is what the
 * lifted lid reveals. The walls start 1px up inside the rim (y=7, rim is
 * 6–8) so no seam shows at rest.
 */
const TIP = 10; // clockwise on screen
const RIM_GROW = 1; // per end

const BODY = 'M6,7V28a2,2,0,0,0,2,2H24a2,2,0,0,0,2-2V7H24V28H8V7Z';
/** The can with its walls' tops `s` px lower (its bottom holds): the same 2px walls, shorter. */
const body = (s: number) =>
  s
    ? `M6 ${f3(7 + s)}V28A2 2 0 0 0 8 30H24A2 2 0 0 0 26 28V${f3(7 + s)}H24V28H8V${f3(7 + s)}Z`
    : BODY;
const f3 = (n: number) => +n.toFixed(3);
/** A slat's y in a can `s` px shorter: the can's inside (7 → 30) scaled toward its bottom. */
const slatY = (y: number, s: number) => f3(30 - ((30 - y) * (23 - s)) / 23);
const HINGE = { x: 25, y: 7 };

/** The can (its walls `s` px shorter), its lid tipped `deg` about the hinge and lifted `lift` px (the rim grown `g` px a side, as the hover's). */
function trashShapes(deg: number, lift: number, g: number, s = 0) {
  const up = +lift.toFixed(3);
  const lid = {
    transform: `${up ? `translate(0 ${-up}) ` : ''}rotate(${+deg.toFixed(3)} ${HINGE.x} ${HINGE.y})`,
  };
  return {
    body: { d: body(s) },
    slat0: { d: rectPath(12, slatY(12, s), 14, slatY(24, s)) },
    slat1: { d: rectPath(18, slatY(12, s), 20, slatY(24, s)) },
    rim: { d: rectPath(4 - g, 6, 28 + g, 8), ...lid },
    handle: { d: rectPath(12, 2, 20, 4), ...lid },
  };
}

/**
 * The action: as the can's walls come down SHRINK px (its bottom holds, the
 * slats scaling with it), the lid's hinge rides the can's top-right corner
 * down with them and the lid swings open ACT_TIP° about it. Then it drops
 * shut as the can grows back; no bounce. ACT_TIP is the most the 36×36 box
 * allows: open, the rim's free (top-left) corner reaches y −1.87 (30.4° would
 * touch −2) and the handle −1.33.
 */
const ACT_TIP = 30;
const SHRINK = 2.5;
export const TrashCanSpec = /* @__PURE__ */ hoverIcon('TrashCan', {
  geo: ({ h }) => trashShapes(TIP * h, 0, RIM_GROW * h),
  static: /* @__PURE__ */ carbonArt(TrashCan32),
  action: /* @__PURE__ */ defineAction({
    description:
      'Deleted: the can dips and its lid swings open, then the lid drops shut as the can returns to rest, without a bounce.',
    duration: 0.3,
    geo: ({ h, a }) => {
      // The lid's opening (and the can's shrink), 0 → 1 → 0. The hover's tip gives way to the action's, never adding past it.
      const k =
        a < 0.5 ? ENTRANCE(phase(a, 0, 0.5)) : 1 - EXIT(phase(a, 0.5, 1));
      // The hinge rides the can's top down: the lid moves down with it (a negative lift).
      return trashShapes(
        ACT_TIP * k + TIP * h * (1 - k),
        -SHRINK * k,
        RIM_GROW * h,
        SHRINK * k
      );
    },
  }),
});

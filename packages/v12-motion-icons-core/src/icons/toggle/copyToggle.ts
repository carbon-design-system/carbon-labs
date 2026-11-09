/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Checkmark20 from '@carbon/icons/es/checkmark/20.js';
import Checkmark24 from '@carbon/icons/es/checkmark/24.js';
import Checkmark32 from '@carbon/icons/es/checkmark/32.js';
import Copy32 from '@carbon/icons/es/copy/32.js';
import { carbonArt, toggleIcon, type Shapes } from '../../engine';
import { framePath } from '../../geometry';
import { lerp } from '../../paint';
import { motionTokens } from '../../tokens';
import { cut } from '../controls/playback';
import { CHECK_CENTRE, checkShape } from '../status/states';

/**
 * Copy ⇄ Checkmark, for a copy button's copied state.
 *
 * Toggle: Link ⇄ Unlink's match cut. Copy → checkmark: the back page slides
 * onto the front page while the front page shrinks toward the check's
 * centre, on the exit ease. The back page's corner and arms land on the
 * front page's top and left walls 60% of the way, so its walls read doubled
 * for a frame or two only, and the two shrink on as one square to the cut
 * (6/15). The check appears there at half its size and grows to Carbon's
 * on the entrance ease. Checkmark → copy
 * plays the same backwards: the check shrinks, cuts to the square, and the
 * pages split apart to rest. Both pages are rebuilt at 2px every frame and
 * the check's centreline scales at its own weight: nothing is scaled ink.
 *
 * Timing: 220ms in (moderate-02, the pages travel 8px), 160ms back
 * (moderate-01, one token faster).
 *
 * Hover: each end hovers as its own icon on the standard hover (`h`): Copy's
 * pages draw together, Checkmark grows 10%. The cut is the same whatever the
 * hover.
 *
 * With motion off (and under reduced motion) each state draws Carbon's Copy
 * or Checkmark at once.
 */

/** The square at the cut: 12px, on the check's visual centre. */
const SQUARE = 12;
/** The check's size at the cut, as a share of Carbon's: about the square's width. */
const CHECK_SMALL = 0.5;
/**
 * How far into the close the back page has landed on the front page's walls:
 * from there they shrink as one square, so the walls read doubled for a
 * frame or two only.
 */
const BACK_LANDS = 0.6;
const [SX, SY] = [CHECK_CENTRE[0] - SQUARE / 2, CHECK_CENTRE[1] - SQUARE / 2];

/** Copy's back page: a corner at (x, y) with arms `l` long, 2px, its outer corner rounded (Carbon's). */
function backPage(x: number, y: number, l: number): string {
  const n = (v: number) => +v.toFixed(3);
  const [x2, y2, xl, yl] = [n(x + 2), n(y + 2), n(x + l), n(y + l)];
  return `M${n(x)} ${y2}A2 2 0 0 1 ${x2} ${n(y)}L${xl} ${n(y)}L${xl} ${y2}L${x2} ${y2}L${x2} ${yl}L${n(x)} ${yl}Z`;
}

/** Copy ⇄ Checkmark geometry. `p` is the toggle (0 copy, 1 checkmark); `h` the hover. */
export function copyCheckShapes(
  { h, p }: { h: number; p: number },
  size?: number
): Shapes {
  const c = cut(p);
  if (c.second) {
    const k = lerp(1 + 0.1 * h, CHECK_SMALL, c.small);
    return { back: { d: '' }, front: { d: '' }, check: checkShape(k, size) };
  }
  // Copy at rest or hovered (fmtTools' Copy: the back corner 1px in, its arms 6px longer, the front 1px out),
  // closing onto the square.
  const s = c.small;
  const [x0, y0] = [lerp(8 - h, SX, s), lerp(8 - h, SY, s)];
  const [x1, y1] = [lerp(30 - h, SX + SQUARE, s), lerp(30 - h, SY + SQUARE, s)];
  // The back page closes onto the front page's corner and top and left walls, then rides with them.
  const b = Math.min(1, s / BACK_LANDS);
  const [bx, by] = [lerp(2 + h, x0, b), lerp(2 + h, y0, b)];
  const l = lerp(16 + 6 * h, x1 - x0, b);
  return {
    back: { d: backPage(bx, by, l) },
    front: { d: framePath(x0, y0, x1, y1) },
    check: { d: '' },
  };
}

const IN = {
  duration: motionTokens.duration.moderate02 / 1000,
  ease: [0, 0, 1, 1] as [number, number, number, number],
};
const OUT = {
  duration: motionTokens.duration.moderate01 / 1000,
  ease: [0, 0, 1, 1] as [number, number, number, number],
};

/** Copy ⇄ Checkmark: Copy (`copy`, the start) and Checkmark (`checkmark`, toggled). */
export const CopyToggleSpec = /* @__PURE__ */ toggleIcon<'copy' | 'checkmark'>(
  'CopyToggle',
  {
    states: ['copy', 'checkmark'],
    statics: [
      /* @__PURE__ */ carbonArt(Copy32),
      /* @__PURE__ */ carbonArt(Checkmark20, Checkmark24, Checkmark32),
    ],
    geo: (fr, size) => copyCheckShapes(fr, size),
    // Linear progress: the match cut applies its own two eases. 220ms in, 160ms back.
    change: (on, _f, tween) => tween('p', on ? 1 : 0, on ? IN : OUT),
  }
);

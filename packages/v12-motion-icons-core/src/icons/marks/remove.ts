/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import MusicRemove32 from '@carbon/icons/es/music--remove/32.js';
import SortRemove32 from '@carbon/icons/es/sort--remove/32.js';
import TaskRemove32 from '@carbon/icons/es/task--remove/32.js';
import {
  loopD,
  makeStatusMarkIcon,
  type MarkType,
  type StatusMarkSpec,
} from '../../utils/statusMark';
import type { Pt } from '../../geometry';
import { f } from '../../paint';
import { carbonArt, withStatic } from '../../engine';
import { MUSIC_ADD } from './add';

/**
 * The remove family: Carbon's `<base>--remove` badges, the add family's
 * sibling, on the status-mark system (utils/statusMark.ts). Carbon has one
 * drawing of each for every size.
 *
 * The mark is Carbon's small close (an x of 2px arms, 10 across). It takes
 * the plus's motion turned 45°, as Filter remove's x already does: each of
 * its four arm ends reaches 2px further along its arm (the set-wide reach
 * for plus, minus and close arms), the arm width holding. The base holds;
 * its open ends draw back to keep their resting space to it.
 *
 *  - Task remove: the x in the bottom-right corner, as Task add's plus.
 *  - Music remove: the x at the top right, Music add's notes and cut.
 *  - Sort remove: the x beside the sort's bars, which hold (4px clear).
 *
 * Filter remove shipped before this system with this motion, and is left as it is.
 */

/** Where an x sits: its centre, how far each arm reaches from it (to the middle of its end), and its own reach. */
export interface CrossPlace {
  c: Pt;
  arm: number;
  reach?: number;
  /** How far its centre moves at full hover, where the base needs the room (row--delete's). */
  drift?: Pt;
}
/** The x's reach: 2px along each arm. */
export const CROSS_REACH = 2;
/** Carbon's 10px x: each arm end's corners 5 and 3.586 out from the centre, so the arm reaches 5√2 − 1 to its end's middle. */
export const CROSS_ARM = 5 * Math.SQRT2 - 1;
const S = Math.SQRT1_2;
/** The x's 12 corners in Carbon's order (from the right of the centre, clockwise round each arm), arms reaching l. */
function crossPts([cx, cy]: Pt, l: number): Pt[] {
  const k = Math.SQRT2; // the arms' crossing corners sit √2 out along the axes
  const end = (ux: number, uy: number): Pt[] => {
    // The end's two corners: along the arm by l, either side by 1 (its half-width).
    const [ex, ey] = [cx + ux * l, cy + uy * l];
    return [
      [ex - uy, ey + ux],
      [ex + uy, ey - ux],
    ];
  };
  return [
    [cx + k, cy],
    ...end(S, -S),
    [cx, cy - k],
    ...end(-S, -S),
    [cx - k, cy],
    ...end(-S, S),
    [cx, cy + k],
    ...end(S, S),
  ];
}
const armOf = (p: CrossPlace, h: number) =>
  p.arm + (p.reach ?? CROSS_REACH) * h;
const crossCentre = (p: CrossPlace, h: number): Pt =>
  p.drift ? [p.c[0] + p.drift[0] * h, p.c[1] + p.drift[1] * h] : p.c;
/** Its ink: the two arms as rectangles (the x is not convex). */
function crossInk([cx, cy]: Pt, l: number): Pt[][] {
  const arm = (ux: number, uy: number): Pt[] => [
    [cx + ux * l - uy, cy + uy * l + ux],
    [cx + ux * l + uy, cy + uy * l - ux],
    [cx - ux * l + uy, cy - uy * l - ux],
    [cx - ux * l - uy, cy - uy * l + ux],
  ];
  return [arm(S, -S), arm(S, S)];
}

/** The remove mark (Carbon's small close): each arm end reaches 2px along its arm. */
export const CROSS: MarkType<CrossPlace> = {
  d: (p, h) => loopD(crossPts(crossCentre(p, h), armOf(p, h))),
  ink: (p, h) => crossInk(crossCentre(p, h), armOf(p, h)),
};

const UP: Pt = [0, -1];
const LEFT: Pt = [-1, 0];

export const TASK_REMOVE: StatusMarkSpec<CrossPlace> = {
  base: {
    d: 'M25 5H22V4A2.0058 2.0058 0 0 0 20 2H12A2.0058 2.0058 0 0 0 10 4V5H7A2.0058 2.0058 0 0 0 5 7V28A2.0058 2.0058 0 0 0 7 30H16V28H7V7H10V10H22V7H25V17H27V7A2.0058 2.0058 0 0 0 25 5ZM20 8H12V4H20Z',
    ends: [
      {
        at: [
          [25, 17],
          [27, 17],
        ],
        back: UP,
      },
      {
        at: [
          [16, 30],
          [16, 28],
        ],
        back: LEFT,
      },
    ],
  },
  mark: CROSS,
  place: { c: [25, 25], arm: CROSS_ARM },
};
export const TaskRemoveSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('TaskRemove', TASK_REMOVE),
  /* @__PURE__ */ carbonArt(TaskRemove32)
);

/**
 * Music remove's notes, as in musical notation: the beam
 * turns about the middle of its cut end (17, 7), so its left end rises 2px
 * (12.5°, rigid, its butt end staying square across it), and the left note,
 * stem and head as one, rides up with it: the stem stays upright and keeps its
 * length to the beam (lifted as far as the beam rises over the stem's middle,
 * x 9). Each head grows 0.5px in radius (1px across), its ring 2px, its side on
 * its stem held (the centre steps 0.5px left). The x keeps its motion.
 */
export const BEAM_RISE = 2;
export const HEAD_GROW = 0.5;
const PIVOT: Pt = [17, 7];
const P = ([x, y]: Pt) => `${f(x)} ${f(y)}`;
/** A note: its stem's left edge x0 (the stem 2px wide) from y `top` down to its head (centre left of the stem, its right side on the stem's right edge at y `y0`). */
function note(x0: number, g: number, y0 = 26): { top: string; head: string } {
  const R = 4 + g;
  const cx = x0 + 2 - R;
  const yj = y0 - Math.sqrt(R * R - (x0 - cx) ** 2);
  const r = 2 + g;
  return {
    top: `V${f(yj)}A${f(R)} ${f(R)} 0 0 0 ${P([cx, y0 - R])}A${f(R)} ${f(R)} 0 1 0 ${P([x0 + 2, y0])}`,
    head: `M${P([cx, y0 + r])}A${f(r)} ${f(r)} 0 1 1 ${P([cx + r, y0])}A${f(r)} ${f(r)} 0 0 1 ${P([cx, y0 + r])}Z`,
  };
}
/** The notes at hover h. */
function musicAt(h: number): string {
  const g = HEAD_GROW * h;
  const a = Math.atan2(BEAM_RISE * h, PIVOT[0] - 8);
  const [cos, sin] = [Math.cos(a), Math.sin(a)];
  // Clockwise on screen about the pivot: the left end rises.
  const turn = ([x, y]: Pt): Pt => [
    PIVOT[0] + (x - PIVOT[0]) * cos - (y - PIVOT[1]) * sin,
    PIVOT[1] + (x - PIVOT[0]) * sin + (y - PIVOT[1]) * cos,
  ];
  const lift = (PIVOT[0] - 9) * Math.tan(a);
  const [right, left] = [note(24, g), note(8, g, 26 - lift)];
  return (
    `M24 15${right.top}V15Z${right.head}` +
    `M${P(turn([17, 6]))}L${P(turn([10, 6]))}A2 2 0 0 0 ${P(turn([8, 8]))}${left.top}L${P(turn([10, 8]))}L${P(turn([17, 8]))}Z${left.head}`
  );
}
export const MUSIC_REMOVE: StatusMarkSpec<CrossPlace> = {
  base: { d: MUSIC_ADD.base.d, at: musicAt },
  mark: CROSS,
  place: { c: [25, 7], arm: CROSS_ARM },
};
export const MusicRemoveSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('MusicRemove', MUSIC_REMOVE),
  /* @__PURE__ */ carbonArt(MusicRemove32)
);

// Sort's three bars, left of the x.
export const SORT_REMOVE: StatusMarkSpec<CrossPlace> = {
  base: { d: 'M10 18H16V20H10Z' + 'M2 6H16V8H2Z' + 'M6 12H16V14H6Z' },
  mark: CROSS,
  place: { c: [25, 23], arm: CROSS_ARM },
};
export const SortRemoveSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('SortRemove', SORT_REMOVE),
  /* @__PURE__ */ carbonArt(SortRemove32)
);

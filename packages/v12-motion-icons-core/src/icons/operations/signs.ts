/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Add32 from '@carbon/icons/es/add/32.js';
import AddLarge32 from '@carbon/icons/es/add--large/32.js';
import Subtract32 from '@carbon/icons/es/subtract/32.js';
import SubtractLarge32 from '@carbon/icons/es/subtract--large/32.js';
import AddAlt32 from '@carbon/icons/es/add--alt/32.js';
import SubtractAlt32 from '@carbon/icons/es/subtract--alt/32.js';
import AddFilled32 from '@carbon/icons/es/add--filled/32.js';
import Close32 from '@carbon/icons/es/close/32.js';
import CloseOutline32 from '@carbon/icons/es/close--outline/32.js';
import CloseFilled16 from '@carbon/icons/es/close--filled/16.js';
import CloseFilled32 from '@carbon/icons/es/close--filled/32.js';
import { defineAction, hoverIcon, carbonArt } from '../../engine';
import { ringPath, type Pt } from '../../geometry';
import { OUT_BACK, outAndBack } from '../../actionGeo';
import { EVENODD, f } from '../../paint';

/**
 * The plus, minus and close family on the frame engine: Add, Add large,
 * Add alt, Add filled, Subtract, Subtract large, Subtract alt, Close,
 * Close outline, Close filled.
 *
 * Hover: each arm reaches 2px further at each end (its width
 * never changes), and a ring or disc grows 2px in radius. 160ms entrance
 * ease. The filled icons cut their sign out of
 * the disc as geometry (evenodd), not a mask. Rest matches Carbon.
 */

const C: Pt = [16, 16];
export const polyD = (pts: readonly Pt[]) =>
  `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}Z`;

/** A plus about the centre: arms reaching `l` from it, `w` half-width, turned `deg`. */
export function plus(l: number, w: number, deg = 0): Pt[] {
  const pts: Pt[] = [
    [-w, -l],
    [w, -l],
    [w, -w],
    [l, -w],
    [l, w],
    [w, w],
    [w, l],
    [-w, l],
    [-w, w],
    [-l, w],
    [-l, -w],
    [-w, -w],
  ];
  const [c, s] = [
    Math.cos((deg * Math.PI) / 180),
    Math.sin((deg * Math.PI) / 180),
  ];
  return pts.map(
    ([x, y]) => [C[0] + x * c - y * s, C[1] + x * s + y * c] as Pt
  );
}
const minus = (l: number): Pt[] => [
  [C[0] - l, 15],
  [C[0] + l, 15],
  [C[0] + l, 17],
  [C[0] - l, 17],
];
/** A disc of radius r (two arcs), for knocking a sign out of under evenodd. */
const disc = (r: number) =>
  `M${f(C[0] - r)} ${f(C[1])}A${f(r)} ${f(r)} 0 1 1 ${f(C[0] + r)} ${f(C[1])}A${f(r)} ${f(r)} 0 1 1 ${f(C[0] - r)} ${f(C[1])}Z`;

// Carbon's arms: Add / Subtract reach 8 (large: 11), 1px half-width. Close's
// arms reach 10.31 along the diagonal; the circled closes' reach 8.77 and
// are 2.26px wide (Carbon draws them a touch heavier than 2px).
export const CLOSE = { l: Math.SQRT2 * 7.2929, w: 1 };
const CLOSE_CIRCLED = { l: Math.SQRT2 * 6.2, w: (1.6 * Math.SQRT2) / 2 };

/**
 * Add's action (70ms out, 110ms back): every arm reaches out to the
 * box's edge (8 → 18 from the centre, its end on the edge) and draws back,
 * rebuilt at its 2px width every frame.
 */
/**
 * Each arm reaches 4px further (8 → 12 from the
 * centre, its end at 4 or 28), half way from rest to the 32 frame.
 */
const ADD_REACH = 4;
export const AddSpec = /* @__PURE__ */ hoverIcon('Add', {
  geo: ({ h }) => ({ sign: { d: polyD(plus(8 + 2 * h, 1)) } }),
  static: /* @__PURE__ */ carbonArt(Add32),
  action: /* @__PURE__ */ defineAction({
    description:
      'Added: the plus reaches out, each arm a little longer, then draws back to rest.',
    duration: OUT_BACK,
    geo: ({ h, a }) => {
      const k = a <= 0 || a >= 1 ? 0 : outAndBack(a);
      return {
        sign: { d: polyD(plus(8 + Math.max(2 * h, ADD_REACH * k), 1)) },
      };
    },
  }),
});
export const AddLargeSpec = /* @__PURE__ */ hoverIcon('AddLarge', {
  geo: ({ h }) => ({ sign: { d: polyD(plus(11 + 2 * h, 1)) } }),
  static: /* @__PURE__ */ carbonArt(AddLarge32),
});
export const SubtractSpec = /* @__PURE__ */ hoverIcon('Subtract', {
  geo: ({ h }) => ({ sign: { d: polyD(minus(8 + 2 * h)) } }),
  static: /* @__PURE__ */ carbonArt(Subtract32),
});
export const SubtractLargeSpec = /* @__PURE__ */ hoverIcon('SubtractLarge', {
  geo: ({ h }) => ({ sign: { d: polyD(minus(11 + 2 * h)) } }),
  static: /* @__PURE__ */ carbonArt(SubtractLarge32),
});
export const AddAltSpec = /* @__PURE__ */ hoverIcon('AddAlt', {
  geo: ({ h }) => ({
    ring: { d: ringPath(C, 13 + 2 * h, 2) },
    sign: { d: polyD(plus(8 + 2 * h, 1)) },
  }),
  static: /* @__PURE__ */ carbonArt(AddAlt32),
});
export const SubtractAltSpec = /* @__PURE__ */ hoverIcon('SubtractAlt', {
  geo: ({ h }) => ({
    ring: { d: ringPath(C, 13 + 2 * h, 2) },
    sign: { d: polyD(minus(8 + 2 * h)) },
  }),
  static: /* @__PURE__ */ carbonArt(SubtractAlt32),
});
export const AddFilledSpec = /* @__PURE__ */ hoverIcon('AddFilled', {
  geo: ({ h }) => ({
    disc: { d: disc(14 + 2 * h) + polyD(plus(8 + 2 * h, 1)), ...EVENODD },
  }),
  static: /* @__PURE__ */ carbonArt(AddFilled32),
});
export const CloseSpec = /* @__PURE__ */ hoverIcon('Close', {
  geo: ({ h }) => ({ sign: { d: polyD(plus(CLOSE.l + 2 * h, CLOSE.w, 45)) } }),
  static: /* @__PURE__ */ carbonArt(Close32),
});
export const CloseOutlineSpec = /* @__PURE__ */ hoverIcon('CloseOutline', {
  geo: ({ h }) => ({
    ring: { d: ringPath(C, 13 + 2 * h, 2) },
    sign: { d: polyD(plus(CLOSE_CIRCLED.l + 2 * h, CLOSE_CIRCLED.w, 45)) },
  }),
  static: /* @__PURE__ */ carbonArt(CloseOutline32),
});
export const CloseFilledSpec = /* @__PURE__ */ hoverIcon('CloseFilled', {
  geo: ({ h }) => ({
    disc: {
      d:
        disc(14 + 2 * h) +
        polyD(plus(CLOSE_CIRCLED.l + 2 * h, CLOSE_CIRCLED.w, 45)),
      ...EVENODD,
    },
  }),
  static: /* @__PURE__ */ carbonArt(CloseFilled16, CloseFilled32),
});

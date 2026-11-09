/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import AlarmSubtract32 from '@carbon/icons/es/alarm--subtract/32.js';
import DocumentSubtract32 from '@carbon/icons/es/document--subtract/32.js';
import PillsSubtract32 from '@carbon/icons/es/pills--subtract/32.js';
import {
  loopD,
  makeStatusMarkIcon,
  plusReach,
  type MarkType,
  type PlusPlace,
  type StatusMarkSpec,
} from '../../utils/statusMark';
import type { Pt } from '../../geometry';
import { carbonArt, withStatic } from '../../engine';
import { PILLS_ADD } from './add';
import { CLOCK, clockAt, documentFold } from './bases';

/**
 * The subtract family: Carbon's `<base>--subtract` badges, the add family's
 * sibling, on the status-mark system (utils/statusMark.ts). Carbon has one
 * drawing of each for every size.
 *
 * The mark is Carbon's minus: the add family's plus without its upright, so
 * it takes the plus's motion exactly: each end reaches 2px (Subtract's
 * hover; the set-wide reach for plus, minus and close arms), its 2px height
 * holding; placed by the same table (its centre, half-length and reach).
 *
 *  - Document subtract: the minus in the bottom-right corner; the page's
 *    open ends draw back to keep their resting space to it.
 *  - Alarm subtract: the minus inside the clock face. The clock grows with
 *    it: its ring grows
 *    1px in radius about its centre (the 2px wall held; the set's 2px for a
 *    container), the bells riding out 1px with it so their space to the
 *    ring holds, and the minus reaches the set's 2px, 2px inside the ring.
 *  - Pills subtract: the small minus inside the round pill, Pills add's:
 *    the pill's ring grows 1.1px in radius (the capsule's hollow giving
 *    way), so the minus reaches the set's 2px, 2px inside the ring.
 */

/** The minus at hover h: its ends reach out by the reach, its 2px height holds. */
const minusPts = ([cx, cy]: Pt, l: number): Pt[] => [
  [cx - l, cy - 1],
  [cx + l, cy - 1],
  [cx + l, cy + 1],
  [cx - l, cy + 1],
];
const armOf = (p: PlusPlace, h: number) =>
  p.arm + (p.reach ?? plusReach(p.arm)) * h;

/** The subtract mark (Carbon's minus): Subtract's hover, each end reaching out. */
export const MINUS: MarkType<PlusPlace> = {
  d: (p, h) => loopD(minusPts(p.c, armOf(p, h))),
  ink: (p, h) => [minusPts(p.c, armOf(p, h))],
};

const UP: Pt = [0, -1];
const LEFT: Pt = [-1, 0];

// Document's page as the badge draws it: its right wall stops at y 20, its bottom at x 16.
export const DOCUMENT_SUBTRACT: StatusMarkSpec<PlusPlace> = {
  base: {
    d: 'M16 28H8V4H16V10A2.0058 2.0058 0 0 0 18 12H24V20H26V10A0.9092 0.9092 0 0 0 25.7 9.3L18.7 2.3A0.9087 0.9087 0 0 0 18 2H8A2.0058 2.0058 0 0 0 6 4V28A2.0058 2.0058 0 0 0 8 30H16ZM18 4.4L23.6 10H18Z',
    ends: [
      {
        at: [
          [24, 20],
          [26, 20],
        ],
        back: UP,
      },
      {
        at: [
          [16, 28],
          [16, 30],
        ],
        back: LEFT,
      },
    ],
    // The fold folds down 2px (Document's corner, the page holding).
    calm: documentFold,
  },
  baseMotion: 'calm',
  mark: MINUS,
  place: { c: [25, 25], arm: 5 },
};
export const DocumentSubtractSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('DocumentSubtract', DOCUMENT_SUBTRACT),
  /* @__PURE__ */ carbonArt(DocumentSubtract32)
);

export const ALARM_SUBTRACT: StatusMarkSpec<PlusPlace> = {
  base: { d: CLOCK, at: clockAt },
  mark: MINUS,
  // 4px inside the ring at rest; the ring grows 1px, so the minus takes the set's 2px with its corners 2px inside it.
  place: { c: [16, 17], arm: 5, reach: 2 },
};
export const AlarmSubtractSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('AlarmSubtract', ALARM_SUBTRACT),
  /* @__PURE__ */ carbonArt(AlarmSubtract32)
);

// Pills add's pills, the round pill's ring growing to give the minus room.
export const PILLS_SUBTRACT: StatusMarkSpec<PlusPlace> = {
  base: PILLS_ADD.base,
  mark: MINUS,
  place: { c: [22, 22], arm: 3, reach: 2 },
};
export const PillsSubtractSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('PillsSubtract', PILLS_SUBTRACT),
  /* @__PURE__ */ carbonArt(PillsSubtract32)
);

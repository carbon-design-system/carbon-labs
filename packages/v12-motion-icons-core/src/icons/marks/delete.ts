/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ColumnDelete32 from '@carbon/icons/es/column--delete/32.js';
import RowDelete32 from '@carbon/icons/es/row--delete/32.js';
import {
  makeStatusMarkIcon,
  type StatusMarkSpec,
} from '../../utils/statusMark';
import type { Pt } from '../../geometry';
import { carbonArt, withStatic } from '../../engine';
import { OFF_SHRINK } from '../../off';
import { CROSS, CROSS_ARM, type CrossPlace } from './remove';
import { weightGrow, type Centreline } from './bases';

/**
 * The delete badges: Carbon's `column--delete` and `row--delete`, on the
 * status-mark system (utils/statusMark.ts).
 *
 * Carbon's delete mark here is its small close (the x of 2px arms, 10
 * across), not a trash can. It grows evenly about its own centre, which
 * holds, as the close's x does (each arm end reaching along its arm, the arm
 * width holding), but only 0.4px (DELETE_REACH; the set's close reaches 2px),
 * so it cuts less out of the base icon.
 *
 * The base reads as removal with the Off icons' motion: it scales to 90% (OFF_SHRINK) about its own centre (14, 18)
 * at constant 2px weight, on the default hover timing, as every Off icon's
 * base does. That takes the wall beside the x (Column delete) and the floor
 * under it (Row delete) 0.3px away, and the x's lower arm, 2px beside that
 * wall at rest, may come no nearer than that: its end comes 0.4/√2 = 0.28px
 * nearer, so the 2px holds and nothing is cut. (Any more and the wall's
 * end has to drop below the arm's end: 0.43px of reach already costs 3.8px
 * of cut, and the set's 2px cost 6.7px.) The open end beside the x is still
 * measured along 12px of its wall (`stub`), with a 2px floor (`gap: 2`).
 */

/** How far each of the x's arm ends reaches at full hover: the most that keeps 2px to the wall beside it without a cut (0.42). */
export const DELETE_REACH = 0.4;

/** The point the bases scale about: their own centre (the middle of x 2–26, y 6–30). */
export const DELETE_CENTRE: Pt = [14, 18];

/** Column delete's columns as centrelines: the left one closed, the right one open at its top left and right. */
export const COLUMN_CL: Centreline = {
  lines: [
    [
      [3, 7],
      [11, 7],
      [11, 29],
      [3, 29],
      [3, 7],
    ],
    [
      [17, 6],
      [17, 29],
      [25, 29],
      [25, 14],
    ],
  ],
  corners: [
    [3, 7],
    [11, 7],
    [11, 29],
    [3, 29],
    [17, 29],
    [25, 29],
  ],
  snap: 1.6,
};
/** Row delete's rows as centrelines: the lower one closed, the upper one open at its top right and floor's end. */
export const ROW_CL: Centreline = {
  lines: [
    [
      [3, 21],
      [25, 21],
      [25, 29],
      [3, 29],
      [3, 21],
    ],
    [
      [18, 7],
      [3, 7],
      [3, 15],
      [26, 15],
    ],
  ],
  corners: [
    [3, 21],
    [25, 21],
    [25, 29],
    [3, 29],
    [3, 7],
    [3, 15],
  ],
  snap: 1.6,
};
/** The Off icons' hover on a base: 90% about `c` at constant weight. */
export const offScale = (cl: Centreline, c: Pt) => (q: Pt, h: number) =>
  weightGrow(cl, c, 1 - OFF_SHRINK * h)(q);

type Spec = StatusMarkSpec<CrossPlace>;
const DOWN: Pt = [0, 1];
const LEFT: Pt = [-1, 0];
/** Carbon's x in the top right corner (its centre holds), reaching DELETE_REACH. */
const X: CrossPlace = { c: [25, 7], arm: CROSS_ARM, reach: DELETE_REACH };

export const COLUMN_DELETE: Spec = {
  base: {
    d:
      'M10 30H4A2.0021 2.0021 0 0 1 2 28V8A2.0021 2.0021 0 0 1 4 6H10A2.0021 2.0021 0 0 1 12 8V28A2.0021 2.0021 0 0 1 10 30ZM4 8V28H10V8Z' +
      'M24 14V28H18V6H16V28A2.0023 2.0023 0 0 0 18 30H24A2.0023 2.0023 0 0 0 26 28V14Z',
    ends: [
      {
        at: [
          [18, 6],
          [16, 6],
        ],
        back: DOWN,
        stub: 12,
      },
      {
        at: [
          [24, 14],
          [26, 14],
        ],
        back: DOWN,
      },
    ],
    calm: /* @__PURE__ */ offScale(COLUMN_CL, DELETE_CENTRE),
  },
  baseMotion: 'calm',
  mark: CROSS,
  gap: 2,
  place: X,
};
export const ColumnDeleteSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('ColumnDelete', COLUMN_DELETE),
  /* @__PURE__ */ carbonArt(ColumnDelete32)
);

export const ROW_DELETE: Spec = {
  base: {
    d:
      'M24 30H4A2.0021 2.0021 0 0 1 2 28V22A2.0021 2.0021 0 0 1 4 20H24A2.0021 2.0021 0 0 1 26 22V28A2.0021 2.0021 0 0 1 24 30ZM4 22H3.9985L4 28H24V22Z' +
      'M4 14V8H18V6H4A2.0023 2.0023 0 0 0 2 8V14A2.0023 2.0023 0 0 0 4 16H26V14Z',
    ends: [
      {
        at: [
          [18, 8],
          [18, 6],
        ],
        back: LEFT,
      },
      {
        at: [
          [26, 16],
          [26, 14],
        ],
        back: LEFT,
        stub: 12,
      },
    ],
    calm: /* @__PURE__ */ offScale(ROW_CL, DELETE_CENTRE),
  },
  baseMotion: 'calm',
  mark: CROSS,
  gap: 2,
  place: X,
};
export const RowDeleteSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('RowDelete', ROW_DELETE),
  /* @__PURE__ */ carbonArt(RowDelete32)
);

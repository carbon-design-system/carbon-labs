/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import CategoryNew32 from '@carbon/icons/es/category--new/32.js';
import EmailNew32 from '@carbon/icons/es/email--new/32.js';
import GroupObjectsNew32 from '@carbon/icons/es/group-objects--new/32.js';
import NotificationNew32 from '@carbon/icons/es/notification--new/32.js';
import ResultNew32 from '@carbon/icons/es/result--new/32.js';
import {
  loopD,
  makeStatusMarkIcon,
  PLUS,
  type MarkType,
  type PlusPlace,
  type StatusMarkSpec,
} from '../../utils/statusMark';
import { circlePts, pathPoints, type Pt } from '../../geometry';
import { knockout } from '../../status';
import { inkSides, weightScaleLoops } from '../assorted/peopleMoney';
import { f } from '../../paint';
import { carbonArt, withStatic } from '../../engine';

/**
 * The new family: Carbon's `<base>--new` badges on the status-mark system
 * (utils/statusMark.ts), as the add family. Carbon has one drawing of each
 * for every size.
 *
 * Carbon draws "new" two ways, and each keeps its own mark's motion:
 *
 *  - The dot (Email new, Notification new, Result new): Carbon's
 *    notification--new pip, a disc of radius 4. Its hover: the dot grows 1px
 *    in radius about its centre (the set's 2px for a container, as a node
 *    grows in place). The base's open ends draw back to keep their resting
 *    space to it.
 *  - A plus (Category new, Group objects new): Add's hover, as the add
 *    family's plus (each arm end reaches out, the arm width holds).
 *    Group objects new's plus sits 4px inside its frame and reaches the
 *    set's 2px; the frame and its four corner squares grow with it, as Category new's board: the
 *    frame 1px out on every side and each square 1px larger about its
 *    corner, every wall held at 2px. Category new's plus sits 2px inside its board, with no room
 *    to reach: the board grows 1px on every side (its 2px walls held, the
 *    stem below it 1px shorter), as Pills add's ring grows to give its plus
 *    room, and the plus reaches 1px, keeping 2px clear.
 *
 * Notification new and Email new are also what the status layer draws for
 * `<Notification status="notification" />` (the pip; Email's at the top
 * right). These are Carbon's own two icons by name, at Carbon's corners,
 * for drop-in use; a live "something new" belongs on the status prop.
 */

/** Where a dot sits: its centre and radius (Carbon's: 4). */
export interface DotPlace {
  c: Pt;
  r: number;
}
/** How far the dot grows in radius at full hover. */
export const DOT_GROW = 1;
const disc = ([cx, cy]: Pt, r: number) =>
  `M${f(cx - r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 0 ${f(cx + r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 0 ${f(cx - r)} ${f(cy)}Z`;

/** The new mark (the dot): it grows 1px in radius about its centre. */
export const DOT: MarkType<DotPlace> = {
  d: (p, h) => disc(p.c, p.r + DOT_GROW * h),
  // Just outside the circle, so a space measured to it is never short.
  ink: (p, h) => [
    circlePts(p.c, (p.r + DOT_GROW * h) / Math.cos(Math.PI / 72), 72),
  ],
};

const UP: Pt = [0, -1];
const LEFT: Pt = [-1, 0];

// Email's envelope as the badge draws it: the bottom and the right wall cut for the dot.
export const EMAIL_NEW: StatusMarkSpec<DotPlace> = {
  base: {
    d: 'M19 24H4L3.9966 8.9062L15.4307 16.8223A1.0008 1.0008 0 0 0 16.5693 16.8223L28 8.9087L28 18H30V8A2.0027 2.0027 0 0 0 28 6H4A2.0023 2.0023 0 0 0 2 8V24A2.0027 2.0027 0 0 0 4 26H19ZM25.7986 8L16 14.7837L6.2014 8Z',
    ends: [
      {
        at: [
          [19, 24],
          [19, 26],
        ],
        back: LEFT,
      },
      {
        at: [
          [28, 18],
          [30, 18],
        ],
        back: UP,
      },
    ],
  },
  // The envelope holds (Email's 2px growth reads wrong here); only the dot grows, the open ends drawing back.
  mark: DOT,
  place: { c: [26, 24], r: 4 },
};
export const EmailNewSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('EmailNew', EMAIL_NEW),
  /* @__PURE__ */ carbonArt(EmailNew32)
);

// The bell as the badge draws it: its right side stops below the dot, and the
// dome's right shoulder (the ring about (16, 13)) stops left of it.
//
// Notification's hover: the bell grows 7% about (16, 16) at
// constant weight (NotificationSpec's). The whole bell (the badge's left half
// mirrored) grows under a window that cuts it where Carbon does (x 20 and
// y 14, the corner the dot sits in), growing with the dot so the space holds.
const WHOLE_BELL =
  'M15 1H17V3.0508A10.0136 10.0136 0 0 1 26 13V16.5859L28.707 19.293A1 1 0 0 1 29 20V23A1 1 0 0 1 28 24H21V25A5 5 0 0 1 11 25V24H4A1 1 0 0 1 3 23V20A1 1 0 0 1 3.293 19.293L6 16.5859V13A10.0136 10.0136 0 0 1 15 3.0508Z' +
  'M5 22H27V20.4141L24.293 17.707A1 1 0 0 1 24 17V13A8 8 0 0 0 8 13V17A1 1 0 0 1 7.707 17.707L5 20.4141Z' +
  'M19 25A3 3 0 0 1 13 25V24H19Z';
const BELL_LOOPS = /* @__PURE__ */ WHOLE_BELL.split(/(?=M)/).map((sub) =>
  pathPoints(sub, 0.1)
);
const BELL_SIDES = /* @__PURE__ */ inkSides(BELL_LOOPS);
/** How much Notification's bell grows on hover. */
export const BELL_GROW = 0.07;
/** The bell at hover h: grown at constant weight, minus the window round the dot. */
function bellAt(h: number): string {
  const loops = weightScaleLoops(
    BELL_LOOPS,
    BELL_SIDES,
    [16, 16],
    1 + BELL_GROW * h
  );
  const e = DOT_GROW * h;
  const window: Pt[] = [
    [20 - e, -10],
    [40, -10],
    [40, 14 + e],
    [20 - e, 14 + e],
  ];
  const cut = knockout(
    { bell: { d: loops.map(loopD).join(''), fillRule: 'evenodd' } },
    window
  ).bell;
  return String(cut?.d ?? '');
}
export const NOTIFICATION_NEW: StatusMarkSpec<DotPlace> = {
  base: {
    d: 'M26 16.5859V14H24V17A1 1 0 0 0 24.293 17.707L27 20.4141V22H5V20.4141L7.707 17.707A1 1 0 0 0 8 17V13A7.9854 7.9854 0 0 1 20 6.0825V3.8467A9.896 9.896 0 0 0 17 3.0508V1H15V3.0508A10.0136 10.0136 0 0 0 6 13V16.5859L3.293 19.293A1 1 0 0 0 3 20V23A1 1 0 0 0 4 24H11V25A5 5 0 0 0 21 25V24H28A1 1 0 0 0 29 23V20A1 1 0 0 0 28.707 19.293ZM19 25A3 3 0 0 1 13 25V24H19Z',
    evenodd: true,
    at: bellAt,
  },
  mark: DOT,
  place: { c: [26, 8], r: 4 },
};
export const NotificationNewSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('NotificationNew', NOTIFICATION_NEW),
  /* @__PURE__ */ carbonArt(NotificationNew32)
);

// Result's clipboard as the badge draws it; its rows hold (the dot stays over 2px from the last one).
export const RESULT_NEW: StatusMarkSpec<DotPlace> = {
  base: {
    d: 'M7 28V7H10V10H22V7H25V18H27V7A2 2 0 0 0 25 5H22V4A2 2 0 0 0 20 2H12A2 2 0 0 0 10 4V5H7A2 2 0 0 0 5 7V28A2 2 0 0 0 7 30H18V28ZM12 4H20V8H12Z',
    ends: [
      {
        at: [
          [25, 18],
          [27, 18],
        ],
        back: UP,
      },
      {
        at: [
          [18, 30],
          [18, 28],
        ],
        back: LEFT,
      },
    ],
    parts: {
      rows:
        'M10 13H12V15H10Z' +
        'M10 18H12V20H10Z' +
        'M10 23H12V25H10Z' +
        'M14 13H22V15H14Z' +
        'M14 18H22V20H14Z' +
        'M14 23H18V25H14Z',
    },
  },
  mark: DOT,
  place: { c: [26, 26], r: 4 },
};
export const ResultNewSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('ResultNew', RESULT_NEW),
  /* @__PURE__ */ carbonArt(ResultNew32)
);

// ── The plus ─────────────────────────────────────────────────────────────────

// Group objects' frame and corner squares; the plus 4px inside the frame.
/** How far Group objects new's frame grows on every side at full hover (its corner squares grow by the same). */
export const FRAME_GROW = 1;
/**
 * Group objects new at hover h, drawn as Carbon draws it: the frame's walls
 * (centred on A and B, 2px) 1px further out, each corner square centred on
 * its corner, 6px across growing to 7 with its 2px wall (its hole 2px to 3).
 */
function groupObjectsAt(h: number): string {
  const g = FRAME_GROW * h;
  const [A, B, s, q] = [5 - g, 27 + g, 3 + g / 2, 1 + g / 2];
  const n = (v: number) => `${f(v)}`;
  const outer = `M${n(B + s)} ${n(A + s)}V${n(A - s)}H${n(B - s)}V${n(A - 1)}H${n(A + s)}V${n(A - s)}H${n(A - s)}V${n(A + s)}H${n(A - 1)}V${n(B - s)}H${n(A - s)}V${n(B + s)}H${n(A + s)}V${n(B + 1)}H${n(B - s)}V${n(B + s)}H${n(B + s)}V${n(B - s)}H${n(B + 1)}V${n(A + s)}Z`;
  const holes =
    `M${n(B - q)} ${n(A - q)}H${n(B + q)}V${n(A + q)}H${n(B - q)}Z` +
    `M${n(A - q)} ${n(A - q)}H${n(A + q)}V${n(A + q)}H${n(A - q)}Z` +
    `M${n(A + q)} ${n(B + q)}H${n(A - q)}V${n(B - q)}H${n(A + q)}Z` +
    `M${n(B + q)} ${n(B + q)}H${n(B - q)}V${n(B - q)}H${n(B + q)}Z`;
  const inner = `M${n(B - 1)} ${n(B - s)}H${n(B - s)}V${n(B - 1)}H${n(A + s)}V${n(B - s)}H${n(A + 1)}V${n(A + s)}H${n(A + s)}V${n(A + 1)}H${n(B - s)}V${n(A + s)}H${n(B - 1)}Z`;
  return outer + holes + inner;
}
export const GROUP_OBJECTS_NEW: StatusMarkSpec<PlusPlace> = {
  base: {
    d: 'M30 8V2H24V4H8V2H2V8H4V24H2V30H8V28H24V30H30V24H28V8ZM26 4H28V6H26ZM4 4H6V6H4ZM6 28H4V26H6ZM28 28H26V26H28ZM26 24H24V26H8V24H6V8H8V6H24V8H26Z',
    at: groupObjectsAt,
  },
  mark: PLUS,
  place: { c: [16, 16], arm: 6 },
};
export const GroupObjectsNewSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('GroupObjectsNew', GROUP_OBJECTS_NEW),
  /* @__PURE__ */ carbonArt(GroupObjectsNew32)
);

/** How far Category new's board grows on every side at full hover (and so how far its plus reaches). */
export const BOARD_GROW = 1;
/** How far Category new's outer legs part at full hover (Category's children: 2px each way). */
export const LEG_PART = 2;
/** Category new at hover h: the board grown g a side (corners r2 outside, square inside), its stem shortened to match; the stand holds. */
function categoryAt(h: number): string {
  const g = BOARD_GROW * h;
  // Category's hover parts its children 2px each way: the stand's outer legs move out, its bar lengthening.
  const p = LEG_PART * h;
  const [l, r, t, b] = [7 - g, 25 + g, 2 - g, 20 + g];
  const F = (x: number, y: number) => `${f(x)} ${f(y)}`;
  return (
    `M${f(28 + p)} 24H17V${f(b)}H${f(r - 2)}A2 2 0 0 0 ${F(r, b - 2)}V${f(t + 2)}A2 2 0 0 0 ${F(r - 2, t)}H${f(l + 2)}A2 2 0 0 0 ${F(l, t + 2)}V${f(b - 2)}A2 2 0 0 0 ${F(l + 2, b)}H15V24H${f(4 - p)}A2 2 0 0 0 ${F(2 - p, 26)}V30H${f(4 - p)}V26H15V30H17V26H${f(28 + p)}V30H${f(30 + p)}V26A2 2 0 0 0 ${F(28 + p, 24)}Z` +
    `M${F(l + 2, t + 2)}H${f(r - 2)}V${f(b - 2)}H${f(l + 2)}Z`
  );
}
export const CATEGORY_NEW: StatusMarkSpec<PlusPlace> = {
  base: {
    d: 'M28 24H17V20H23A2.0027 2.0027 0 0 0 25 18V4A2.0023 2.0023 0 0 0 23 2H9A2.002 2.002 0 0 0 7 4V18A2.0023 2.0023 0 0 0 9 20H15V24H4A2 2 0 0 0 2 26V30H4V26H15V30H17V26H28V30H30V26A2 2 0 0 0 28 24ZM9 4H23L23.002 18H9Z',
    at: categoryAt,
  },
  mark: PLUS,
  // 2px inside the board: it reaches as far as the board grows.
  place: { c: [16, 11], arm: 5, reach: BOARD_GROW },
};
export const CategoryNewSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('CategoryNew', CATEGORY_NEW),
  /* @__PURE__ */ carbonArt(CategoryNew32)
);

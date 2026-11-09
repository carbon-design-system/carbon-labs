/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import AssetView32 from '@carbon/icons/es/asset--view/32.js';
import DataView32 from '@carbon/icons/es/data--view/32.js';
import DocumentView32 from '@carbon/icons/es/document--view/32.js';
import MobileView32 from '@carbon/icons/es/mobile--view/32.js';
import SettingsView32 from '@carbon/icons/es/settings--view/32.js';
import TaskView32 from '@carbon/icons/es/task--view/32.js';
import {
  makeStatusMarkIcon,
  type MarkType,
  type StatusMarkSpec,
} from '../../utils/statusMark';
import { pathPoints, type Pt } from '../../geometry';
import { f } from '../../paint';
import { carbonArt, withStatic } from '../../engine';
import {
  assetArc,
  assetCalm,
  dataCalm,
  dataDots,
  documentFold,
  mobileCalm,
} from './bases';
import { GEAR_TIMING, settingsViewBase } from './gear';

/**
 * The view family: Carbon's `<base>--view` badges, on the status-mark system
 * (utils/statusMark.ts), as the add family. Carbon has one drawing of each
 * for every size, so one geometry serves 16–32px.
 *
 * The mark is Carbon's small eye: an almond 16 wide and 12 tall, filled
 * round a 4px-radius window, with a 2px-radius pupil in it. Its hover is
 * View's (the eye opens and the iris grows): the almond opens 1px at the
 * top and the bottom, View's own opening (its tips hold, its arcs round out a
 * little so the wall stays 2px all round). The
 * window grows 1px in radius with it, so the wall above and below it holds
 * at 2px, and the pupil grows 0.5px (the space round it opens from 2px to
 * 2.5px, so the iris doesn't swell).
 *
 * The base holds; its open ends draw back along their walls (round their
 * ring, for the asset's and the gear hub's arcs) by just enough that the
 * space between each end and the eye holds at its resting width.
 *
 * Study view (watson-health) has no eye: it isn't a view badge, so it isn't here.
 */

/** Where an eye sits: its centre (Carbon's: the window's centre). */
export interface EyePlace {
  c: Pt;
}
/** How far the almond opens at the top and the bottom at full hover. */
export const EYE_OPEN = 1;
/** How far the window grows in radius at full hover (with the opening, so the 2px wall holds). */
export const EYE_GROW = 1;
/** How far the pupil grows in radius at full hover. */
export const PUPIL_GROW = 0.5;
// Carbon's almond: tips 8 out from the centre, bevelled 0.2231 back to the arcs,
// which rise 5.4785 to the top (6 above the centre) with radius 8.64.
const [TIP, BEVEL_X, BEVEL_Y, RISE, R] = [8, 7.7769, 0.5215, 5.4785, 8.64];
/** How much rounder the arcs get at full hover, so the wall round the growing window is 2px all the way round, not only at the top. */
const ROUND = 0.74;
const P = (x: number, y: number) => `${f(x)} ${f(y)}`;

/** The almond (anticlockwise on screen, as Carbon draws it) at hover h. */
function almond([cx, cy]: Pt, h: number): string {
  const o = EYE_OPEN * h;
  // The arcs round out as the eye opens (radius 8.64 → 7.9), keeping the
  // wall round the window at least Carbon's 1.99 everywhere and 2px at full hover.
  const r = f(R - ROUND * h);
  const A = `A${r} ${r} 0 0 0 `;
  return (
    `M${P(cx + BEVEL_X, cy - BEVEL_Y)}${A}${P(cx, cy - BEVEL_Y - RISE - o)}${A}${P(cx - BEVEL_X, cy - BEVEL_Y)}L${P(cx - TIP, cy)}` +
    `L${P(cx - BEVEL_X, cy + BEVEL_Y)}${A}${P(cx, cy + BEVEL_Y + RISE + o)}${A}${P(cx + BEVEL_X, cy + BEVEL_Y)}L${P(cx + TIP, cy)}Z`
  );
}
/** A circle wound clockwise on screen (Carbon's window, a hole in the almond). */
const hole = ([cx, cy]: Pt, r: number) =>
  `M${P(cx, cy + r)}A${f(r)} ${f(r)} 0 1 1 ${P(cx + r, cy)}A${f(r)} ${f(r)} 0 0 1 ${P(cx, cy + r)}Z`;
/** A disc. */
const disc = ([cx, cy]: Pt, r: number) =>
  `M${P(cx - r, cy)}A${f(r)} ${f(r)} 0 1 0 ${P(cx + r, cy)}A${f(r)} ${f(r)} 0 1 0 ${P(cx - r, cy)}Z`;

/** The view mark: View's hover at the mark's scale (the eye opens, the window and the pupil grow). */
export const EYE: MarkType<EyePlace> = {
  d: (p, h) => almond(p.c, h) + hole(p.c, 4 + EYE_GROW * h),
  ink: (p, h) => [pathPoints(almond(p.c, h), 0.25)],
  parts: (p, h) => ({ pupil: { d: disc(p.c, 2 + PUPIL_GROW * h) } }),
};

type Spec = StatusMarkSpec<EyePlace>;
const UP: Pt = [0, -1];
const LEFT: Pt = [-1, 0];
/** The asset's spoke runs up and right, away from the eye. */
const SPOKE: Pt = [
  0.46 / Math.hypot(0.46, 0.888),
  -0.888 / Math.hypot(0.46, 0.888),
];

// The asset: its small ring and its body, both rings about (12, 20).
export const ASSET_VIEW: Spec = {
  base: {
    // Asset's hover: every radius grows 1px.
    calm: assetCalm,
    calmArc: assetArc,
    d:
      'M12 24A4 4 0 1 1 14.981 17.333L13.491 18.667A2 2 0 1 0 12 22Z' +
      'M26 2A3.86 3.86 0 0 0 24.15 2.48L7.76 10.96A9.99 9.99 0 0 0 12 30V28A8 8 0 1 1 17.63 14.32L19.03 12.92A10.0059 10.0059 0 0 0 13.64 10.15L22.02 5.81C22.02 5.87 22 5.93 22 6A3.9989 3.9989 0 0 0 26 10C26.06 10 26.12 9.98 26.19 9.98L23.07 16H25.31L29.56 7.79A3.9727 3.9727 0 0 0 26 2Z' +
      'M26 8A2 2 0 1 1 28 6A2.0058 2.0058 0 0 1 26 8Z',
    ends: [
      {
        at: [
          [12, 24],
          [12, 22],
        ],
        back: { c: [12, 20], turn: 1 },
      },
      {
        at: [
          [14.981, 17.333],
          [13.491, 18.667],
        ],
        back: { c: [12, 20], turn: -1 },
      },
      {
        at: [
          [12, 30],
          [12, 28],
        ],
        back: { c: [12, 20], turn: 1 },
      },
      {
        at: [
          [23.07, 16],
          [25.31, 16],
        ],
        back: SPOKE,
      },
    ],
  },
  baseMotion: 'calm',
  mark: EYE,
  place: { c: [22, 24] },
};
export const AssetViewSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('AssetView', ASSET_VIEW),
  /* @__PURE__ */ carbonArt(AssetView32)
);

// Data base as the badge draws it: the rows' right ends cut for the eye. The dots hold.
export const DATA_VIEW: Spec = {
  base: {
    // Data base's hover: the case widens 1px a side, the dots grow.
    calm: /* @__PURE__ */ dataCalm(13),
    partsAt: (h) => ({ dots: dataDots(8, h) }),
    d: 'M5 21H12V19H5V13H21V16H23V5A2 2 0 0 0 21 3H5A2 2 0 0 0 3 5V27A2 2 0 0 0 5 29H12V27H5ZM5 5H21V11H5Z',
    ends: [
      {
        at: [
          [21, 16],
          [23, 16],
        ],
        back: UP,
      },
      {
        at: [
          [12, 21],
          [12, 19],
        ],
        back: LEFT,
      },
      {
        at: [
          [12, 29],
          [12, 27],
        ],
        back: LEFT,
      },
    ],
    parts: {
      dots:
        'M7 8A1 1 0 1 0 9 8A1 1 0 1 0 7 8Z' +
        'M7 16A1 1 0 1 0 9 16A1 1 0 1 0 7 16Z' +
        'M7 24A1 1 0 1 0 9 24A1 1 0 1 0 7 24Z',
    },
  },
  baseMotion: 'calm',
  mark: EYE,
  place: { c: [22, 24] },
};
export const DataViewSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('DataView', DATA_VIEW),
  /* @__PURE__ */ carbonArt(DataView32)
);

export const DOCUMENT_VIEW: Spec = {
  base: {
    // The fold folds down 2px (Document's corner, the page holding).
    calm: documentFold,
    d: 'M12 28H8V4H16V10A2.0058 2.0058 0 0 0 18 12H24V16H26V10A0.9092 0.9092 0 0 0 25.7 9.3L18.7 2.3A0.9087 0.9087 0 0 0 18 2H8A2.0058 2.0058 0 0 0 6 4V28A2.0058 2.0058 0 0 0 8 30H12ZM18 4.4L23.6 10H18Z',
    ends: [
      {
        at: [
          [24, 16],
          [26, 16],
        ],
        back: UP,
      },
      {
        at: [
          [12, 28],
          [12, 30],
        ],
        back: LEFT,
      },
    ],
  },
  baseMotion: 'calm',
  mark: EYE,
  place: { c: [22, 24] },
};
export const DocumentViewSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('DocumentView', DOCUMENT_VIEW),
  /* @__PURE__ */ carbonArt(DocumentView32)
);

export const MOBILE_VIEW: Spec = {
  base: {
    // Mobile's hover: the case grows 1px a side.
    calm: /* @__PURE__ */ mobileCalm(8, 28),
    d: 'M14 28H9V8H23V15H25V4C25 2.897 24.1025 2 23 2H9C7.897 2 7 2.897 7 4V28C7 29.1025 7.897 30 9 30H14V28ZM9 4H23V6H9V4Z',
    ends: [
      {
        at: [
          [23, 15],
          [25, 15],
        ],
        back: UP,
      },
      {
        at: [
          [14, 28],
          [14, 30],
        ],
        back: LEFT,
      },
    ],
  },
  baseMotion: 'calm',
  mark: EYE,
  place: { c: [23, 24] },
};
export const MobileViewSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('MobileView', MOBILE_VIEW),
  /* @__PURE__ */ carbonArt(MobileView32)
);

// Settings' gear as the badge draws it: cut at the bottom and at its lower
// right tooth; the hub (in the same drawing, so its ends can draw back) cut
// open towards the eye.
const SETTINGS_VIEW_PLACE: EyePlace = { c: [23, 24] };
const SETTINGS_VIEW_REST = /* @__PURE__ */ EYE.ink(SETTINGS_VIEW_PLACE, 0);
export const SETTINGS_VIEW: Spec = {
  base: {
    d:
      'M29.3047 11.0439L26.9441 6.9561A1.9977 1.9977 0 0 0 24.5713 6.0615L22.1372 6.8848A11.0419 11.0419 0 0 0 20.8252 6.1265L20.3215 3.6079A2 2 0 0 0 18.36 2H13.64A2 2 0 0 0 11.6789 3.6079L11.1752 6.1265A10.9666 10.9666 0 0 0 9.8481 6.88L7.4287 6.0615A1.9977 1.9977 0 0 0 5.0559 6.9561L2.6953 11.0439A2.0006 2.0006 0 0 0 3.1072 13.5464L5.0381 15.2432C5.021 15.4946 5 15.7446 5 16C5 16.2578 5.01 16.5127 5.0278 16.7656L3.1072 18.4536A2.0006 2.0006 0 0 0 2.6953 20.9561L5.0559 25.0439A1.9977 1.9977 0 0 0 7.4287 25.9385L9.8628 25.1152A10.9736 10.9736 0 0 0 11.1748 25.8735L11.6785 28.3921A2 2 0 0 0 13.64 30H15V28H13.64L12.93 24.4492A9.0953 9.0953 0 0 1 10.2352 22.8779L6.7884 24.0439L4.4284 19.9561L7.1528 17.561A8.9263 8.9263 0 0 1 7.1458 14.4331L4.4275 12.0439L6.7886 7.9561L10.2153 9.1152A9.0305 9.0305 0 0 1 12.9294 7.5508L13.64 4H18.36L19.07 7.5508A9.0978 9.0978 0 0 1 21.7648 9.1221L25.2116 7.9561L27.5716 12.0439L24.7738 14.4961L26.0923 16L28.8923 13.5464A2.0006 2.0006 0 0 0 29.3047 11.0439Z' +
      'M12.3989 20.8A6 6 0 1 1 22 16H20A4 4 0 1 0 13.6 19.2Z',
    // Settings' hover: the gear turns 30° under a window that grows with the eye; the hub's ends keep their space.
    at: (h) =>
      settingsViewBase(
        h,
        EYE.ink(SETTINGS_VIEW_PLACE, h),
        SETTINGS_VIEW_REST,
        EYE_OPEN * h
      ),
  },
  mark: EYE,
  place: SETTINGS_VIEW_PLACE,
  timing: GEAR_TIMING,
};
export const SettingsViewSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('SettingsView', SETTINGS_VIEW),
  /* @__PURE__ */ carbonArt(SettingsView32)
);

export const TASK_VIEW: Spec = {
  base: {
    d: 'M12 28H7V7H10V10H22V7H25V16H27V7A2 2 0 0 0 25 5H22V4A2 2 0 0 0 20 2H12A2 2 0 0 0 10 4V5H7A2 2 0 0 0 5 7V28A2 2 0 0 0 7 30H12ZM12 4H20V8H12Z',
    ends: [
      {
        at: [
          [25, 16],
          [27, 16],
        ],
        back: UP,
      },
      {
        at: [
          [12, 28],
          [12, 30],
        ],
        back: LEFT,
      },
    ],
  },
  mark: EYE,
  place: { c: [22, 24] },
};
export const TaskViewSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('TaskView', TASK_VIEW),
  /* @__PURE__ */ carbonArt(TaskView32)
);

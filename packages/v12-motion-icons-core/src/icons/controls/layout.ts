/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import FitToHeight32 from '@carbon/icons/es/fit-to-height/32.js';
import FitToWidth32 from '@carbon/icons/es/fit-to-width/32.js';
import SettingsAdjust32 from '@carbon/icons/es/settings--adjust/32.js';
import Continue32 from '@carbon/icons/es/continue/32.js';
import ContinueFilled32 from '@carbon/icons/es/continue--filled/32.js';
import ShrinkScreen32 from '@carbon/icons/es/shrink-screen/32.js';
import ShrinkScreenFilled32 from '@carbon/icons/es/shrink-screen--filled/32.js';
import {
  carbonArt,
  fillThenClear,
  hoverIcon,
  toggleIcon,
  type Shapes,
} from '../../engine';
import {
  centroid,
  discFillPath,
  framePath,
  polyPath,
  rectPath,
  ringPath,
  roundedRectPath,
  type Pt,
} from '../../geometry';

const CContinue = /* @__PURE__ */ carbonArt(Continue32);
const CContinueFilled = /* @__PURE__ */ carbonArt(ContinueFilled32);
const CShrinkScreen = /* @__PURE__ */ carbonArt(ShrinkScreen32);
const CShrinkScreenFilled = /* @__PURE__ */ carbonArt(ShrinkScreenFilled32);

/**
 * Layout controls (no reference animations). Each is geometry of hover progress `h` (and toggle numbers), drawn
 * so line weights stay exact at every step. See `utils/frameIcon`.
 */

const translate = (pts: Pt[], dx: number, dy: number): Pt[] =>
  pts.map(([x, y]) => [x + dx, y + dy] as const);

// ── Shrink screen ────────────────────────────────────────────────────────────
//
// Hover: the small window shrinks toward its outer (bottom-right) corner by
// 1.2 × 0.8px at constant wall; the big window's two cut ends extend with it
// so the 2px gap between the windows holds. The arrowhead (the corner
// bracket) moves 2px toward the small window (the set-wide reach for an
// arrow on a glyph) while the arrow's tail stays put, so the
// shaft lengthens.
// Toggle (outline ↔ filled): the house disc fill (§7.7) inside the small
// window, in from its centre and out through a hole from the same centre.

const NUDGE = 2 / Math.SQRT2;
const WINDOW = { x0: 15, y0: 18, x1: 30, y1: 28 };
const SHRINK = { x: 1.2, y: 0.8 };
const GAP = 2;

/** The big window: an open frame whose bottom and right edges stop at the cut `bx`, `ry`. */
const screen = (bx: number, ry: number) =>
  `M${bx},22H4A2,2,0,0,1,2,20V7A2,2,0,0,1,4,5H26A2,2,0,0,1,28,7V${ry}H26V7H4V20H${bx}Z`;

function shrinkShapes(
  h: number,
  fillP: number,
  fillE: number,
  filled: boolean
): Shapes {
  const w = {
    ...WINDOW,
    x0: WINDOW.x0 + SHRINK.x * h,
    y0: WINDOW.y0 + SHRINK.y * h,
  };
  const n = NUDGE * h;
  const shapes: Shapes = {
    screen: { d: screen(round(w.x0 - GAP), round(w.y0 - GAP)) },
    shaft: {
      d: polyPath([
        [7, 10],
        [12.5 + n, 15.5 + n],
      ]),
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
    },
    bracket: {
      d: polyPath(
        translate(
          [
            [13, 10],
            [13, 16],
            [7, 16],
          ],
          n,
          n
        )
      ),
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinejoin: 'miter',
    },
  };
  if (filled) {
    shapes.window = { d: roundedRectPath(w.x0, w.y0, w.x1, w.y1) };
    return shapes;
  }
  shapes.window = { d: framePath(w.x0, w.y0, w.x1, w.y1) };
  // Interior, 1px into the wall.
  const box: Pt[] = [
    [w.x0 + 1, w.y0 + 1],
    [w.x1 - 1, w.y0 + 1],
    [w.x1 - 1, w.y1 - 1],
    [w.x0 + 1, w.y1 - 1],
  ];
  shapes.fill = {
    d: discFillPath(box, [(w.x0 + w.x1) / 2, (w.y0 + w.y1) / 2], fillP, fillE),
    fillRule: 'evenodd',
  };
  return shapes;
}

const round = (n: number) => Math.round(n * 1e4) / 1e4;

export const ShrinkScreenSpec = /* @__PURE__ */ hoverIcon('ShrinkScreen', {
  geo: ({ h }) => shrinkShapes(h, 0, 0, false),
  static: /* @__PURE__ */ carbonArt(ShrinkScreen32),
});
export const ShrinkScreenFilledSpec = /* @__PURE__ */ hoverIcon(
  'ShrinkScreenFilled',
  {
    geo: ({ h }) => shrinkShapes(h, 0, 0, true),
    static: /* @__PURE__ */ carbonArt(ShrinkScreenFilled32),
  }
);

export const ShrinkScreenToggleSpec = /* @__PURE__ */ toggleIcon<
  'outline' | 'filled'
>('ShrinkScreenToggle', {
  states: ['outline', 'filled'],
  statics: [CShrinkScreen, CShrinkScreenFilled],
  geo: ({ h, p, e }) => shrinkShapes(h, p, e, false),
  change: fillThenClear,
});

// ── Fit to height / width ────────────────────────────────────────────────────
//
// Hover: the frame opens 2px at both ends of the arrow's axis (the 2px
// container rule), and both arrowheads push 2px out toward it (a
// pair: the 2px reach) with the shaft stretching between them,
// so the 1px gap between each tip and the frame holds.

const HEAD: Pt[] = [
  [11, 10],
  [16, 5],
  [21, 10],
  [19.59, 11.41],
  [17, 8.83],
  [15, 8.83],
  [12.41, 11.41],
];
const PUSH = 2;
const OPEN = 2;

function fitShapes(h: number, vertical: boolean): Shapes {
  const swap = (pts: Pt[]): Pt[] =>
    vertical ? pts : pts.map(([x, y]) => [y, x] as const);
  const top = translate(HEAD, 0, -PUSH * h);
  const bottom = top.map(([x, y]) => [x, 32 - y] as const);
  const [s0, s1] = [7.83 - PUSH * h, 24.17 + PUSH * h]; // shaft runs 1px into each head
  const shaft = vertical ? rectPath(15, s0, 17, s1) : rectPath(s0, 15, s1, 17);
  const o = OPEN * h;
  const frame = vertical
    ? framePath(2, 2 - o, 30, 30 + o)
    : framePath(2 - o, 2, 30 + o, 30);
  return {
    frame: { d: frame },
    shaft: { d: shaft },
    head1: { d: polyPath(swap(top), true) },
    head2: { d: polyPath(swap(bottom), true) },
  };
}

export const FitToHeightSpec = /* @__PURE__ */ hoverIcon('FitToHeight', {
  geo: ({ h }) => fitShapes(h, true),
  static: /* @__PURE__ */ carbonArt(FitToHeight32),
});
export const FitToWidthSpec = /* @__PURE__ */ hoverIcon('FitToWidth', {
  geo: ({ h }) => fitShapes(h, false),
  static: /* @__PURE__ */ carbonArt(FitToWidth32),
});

// ── Continue ─────────────────────────────────────────────────────────────────
//
// Hover: the bar and triangle nudge 2px right together.
// Toggle (outline ↔ filled): the house disc fill (§7.7) inside the
// triangle, in from its centroid and out through a hole from the same point.
// The outline is Carbon's, re-expressed as a 2px centreline stroke with
// round joins (outer corners r=1, inner corners sharp).

const BAR = /* @__PURE__ */ rectPath(4, 4, 6, 28);
const TRI: Pt[] = [
  [10, 5],
  [10, 27],
  [29, 16],
];
const TRI_CENTRE = /* @__PURE__ */ centroid(TRI);

function continueShapes(h: number, fillP: number, fillE: number): Shapes {
  const tri = translate(TRI, 2 * h, 0);
  const c = translate([TRI_CENTRE], 2 * h, 0)[0];
  return {
    bar: { d: BAR, transform: `translate(${2 * h} 0)` },
    fill: { d: discFillPath(tri, c, fillP, fillE), fillRule: 'evenodd' },
    tri: {
      d: polyPath(tri, true),
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinejoin: 'round',
    },
  };
}

export const ContinueSpec = /* @__PURE__ */ hoverIcon('Continue', {
  geo: ({ h }) => continueShapes(h, 0, 0),
  static: /* @__PURE__ */ carbonArt(Continue32),
});
export const ContinueFilledSpec = /* @__PURE__ */ hoverIcon('ContinueFilled', {
  geo: ({ h }) => continueShapes(h, 1, 0),
  static: /* @__PURE__ */ carbonArt(ContinueFilled32),
});
export const ContinueToggleSpec = /* @__PURE__ */ toggleIcon<
  'outline' | 'filled'
>('ContinueToggle', {
  states: ['outline', 'filled'],
  statics: [CContinue, CContinueFilled],
  geo: ({ h, p, e }) => continueShapes(h, p, e),
  change: fillThenClear,
});

// ── Settings adjust ──────────────────────────────────────────────────────────
//
// Hover: the top knob slides 2px right and the bottom knob 2px left; each
// track's two halves follow the knob, so the gaps stay the knob's width.
// Knobs are rings (r 4 ± 1); track ends run 1px into the ring so no seam shows.

const KNOBS = [
  { c: [21, 9] as Pt, dx: 2 },
  { c: [11, 23] as Pt, dx: -2 },
];
const TRACK_GAP = 4.9 - 1; // ring outer edge meets the track 4.9 from centre; overlap 1

function adjustShapes(h: number): Shapes {
  const shapes: Shapes = {};
  KNOBS.forEach(({ c, dx }, i) => {
    const x = c[0] + dx * h;
    const [y0, y1] = [c[1] - 1, c[1] + 1];
    shapes[`left${i}`] = { d: rectPath(2, y0, x - TRACK_GAP, y1) };
    shapes[`right${i}`] = { d: rectPath(x + TRACK_GAP, y0, 30, y1) };
    shapes[`knob${i}`] = { d: ringPath([x, c[1]], 4, 2) };
  });
  return shapes;
}

export const SettingsAdjustSpec = /* @__PURE__ */ hoverIcon('SettingsAdjust', {
  geo: ({ h }) => adjustShapes(h),
  static: /* @__PURE__ */ carbonArt(SettingsAdjust32),
});

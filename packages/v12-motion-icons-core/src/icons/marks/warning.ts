/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import BatteryWarning32 from '@carbon/icons/es/battery--warning/32.js';
import EventWarning32 from '@carbon/icons/es/event--warning/32.js';
import MissingDataWarning32 from '@carbon/icons/es/missing-data--warning/32.js';
import FloodWarning32 from '@carbon/icons/es/flood--warning/32.js';
import ContentNavigatorSyncWarning32 from '@carbon/icons/es/content-navigator-sync--warning/32.js';
import {
  makeStatusMarkIcon,
  type MarkType,
  type StatusMarkSpec,
} from '../../utils/statusMark';
import { circlePts, mapPath, type Pt } from '../../geometry';
import { f } from '../../paint';
import { carbonArt, withStatic } from '../../engine';
import { glyphScale } from '../status/alerts';
import { documentFoldAt, weightGrow, type Centreline } from './bases';

/**
 * The warning badges: Carbon's `<base>--warning` icons whose warning is a
 * badge on a base (battery, event, missing data, flood, content navigator
 * sync), on the status-mark system (utils/statusMark.ts).
 *
 * One warning motion for all of them, the warning states' own (WarningAlt,
 * Warning alt filled, and the status layer's warning, which is Carbon's
 * corner triangle): the triangle grows 14% about its centroid at constant
 * weight, so an outline triangle's walls keep their 2px and a filled one's
 * corners their rounding, and the "!" knocked out of a filled triangle grows
 * with it (GLYPH_GROW: its positions scale about its own centre, the bar
 * lengthening at its width and the dot moving at its size). Carbon draws the
 * badge both ways (the outline triangle on battery and event, the filled one
 * with its "!" on missing data, flood and content navigator sync), and each
 * rests on Carbon's own drawing. The base plays its own hover where it has
 * one, else holds; Carbon's cut moves with it and its open ends draw back to
 * keep their resting space to the triangle.
 *
 *  - Battery warning: the battery holds (no Battery hover); the top wall's
 *    end draws right and the left wall's end down.
 *  - Event warning: Carbon's base is the warning triangle itself (with its
 *    "!"); it holds; only the triangle grows. Its right side's end draws back up the side and the
 *    floor's end left; the badge moves 0.45px right, the "!"'s dot 2.2px
 *    from it.
 *  - Missing data warning: the page folds its corner 2px (the documents'
 *    hover, the page holding). Carbon leaves the right wall 2px below the
 *    fold, which the fold takes, so that end can't draw back: the triangle's
 *    point holds and it grows down and out from there (it moves 1.2px down).
 *  - Flood warning: the house holds (no Flood hover); the roof's end draws
 *    back down the roof and the right wall's end down.
 *  - Content navigator sync warning: the sync arrows hold (no hover); their
 *    two arc ends draw back round the ring.
 */

/** Where a warning sits: Carbon's drawing of it, its corners, and how they round. */
export interface WarnPlace {
  /** Carbon's triangle as drawn (absolute commands): the outline, or the filled triangle with its "!" knocked out. */
  d: string;
  /** Its corners: the centreline's (an outline) or the rounded corners' centres (filled). Carbon's points near a corner move with it. */
  tri: readonly [Pt, Pt, Pt];
  /** The corners' rounding about them: the outline's 1px half-wall, the filled triangle's 0.72. */
  round: number;
  /** The "!" knocked out of a filled triangle: its bar (x0, x1, y0, y1) and its dot (cx, cy, r). */
  bang?: {
    bar: readonly [number, number, number, number];
    dot: readonly [number, number, number];
  };
  /** How far it moves at full hover, where the base needs the room. */
  drift?: Pt;
}

/** The warning's growth (WarningAlt's): 14% about the triangle's centroid. */
export const WARN_GROW = 0.14;
const centroidOf = (t: readonly Pt[]): Pt => [
  (t[0][0] + t[1][0] + t[2][0]) / 3,
  (t[0][1] + t[1][1] + t[2][1]) / 3,
];
const tri = (p: WarnPlace): Centreline => ({
  lines: [],
  corners: p.tri,
  snap: 3,
});

/** Where each of Carbon's points goes at hover h. */
function warnMap(p: WarnPlace, h: number): (q: Pt) => Pt {
  const C = centroidOf(p.tri);
  const grow = weightGrow(tri(p), C, 1 + WARN_GROW * h);
  const [dx, dy] = p.drift ? [p.drift[0] * h, p.drift[1] * h] : [0, 0];
  const b = p.bang;
  if (!b) {
    return (q) => {
      const [x, y] = grow(q);
      return [x + dx, y + dy];
    };
  }
  const [x0, x1, y0, y1] = b.bar;
  const [cx, cy, r] = b.dot;
  // The "!": its positions scale about its visual centre (bar top to dot bottom); the bar keeps its width, the dot its size.
  const k = glyphScale(h);
  const gc = (y0 + cy + r) / 2;
  const sy = (y: number) => gc + (y - gc) * k;
  const inBox = ([x, y]: Pt, l: number, t: number, rr: number, bb: number) =>
    x > l - 1e-3 && x < rr + 1e-3 && y > t - 1e-3 && y < bb + 1e-3;
  return (q) => {
    if (inBox(q, x0, y0, x1, y1)) {
      return [q[0] + dx, sy(q[1]) + dy];
    }
    if (inBox(q, cx - r, cy - r, cx + r, cy + r)) {
      return [q[0] + dx, q[1] + sy(cy) - cy + dy];
    }
    const [x, y] = grow(q);
    return [x + dx, y + dy];
  };
}

/** A convex hull (monotone chain). */
function hullOf(pts: readonly Pt[]): Pt[] {
  const s = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: Pt, a: Pt, b: Pt) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list: Pt[]) => {
    const out: Pt[] = [];
    for (const p of list) {
      while (
        out.length >= 2 &&
        cross(out[out.length - 2], out[out.length - 1], p) <= 1e-9
      ) {
        out.pop();
      }
      out.push(p);
    }
    out.pop();
    return out;
  };
  return [...half(s), ...half([...s].reverse())];
}

/** The warning mark: Carbon's triangle growing 14% about its centroid at constant weight, its "!" with it. */
export const WARN: MarkType<WarnPlace> = {
  d: (p, h) => (h <= 0 ? p.d : mapPath(p.d, warnMap(p, h))),
  // The triangle's outside: its corners' rounding about each grown corner, just outside the circle.
  ink: (p, h) => {
    const C = centroidOf(p.tri);
    const s = 1 + WARN_GROW * h;
    const [dx, dy] = p.drift ? [p.drift[0] * h, p.drift[1] * h] : [0, 0];
    const k = 1 / Math.cos(Math.PI / 36);
    return [
      hullOf(
        p.tri.flatMap(([x, y]) =>
          circlePts(
            [C[0] + (x - C[0]) * s + dx, C[1] + (y - C[1]) * s + dy],
            p.round * k,
            36
          )
        )
      ),
    ];
  },
};

type Spec = StatusMarkSpec<WarnPlace>;
const UP: Pt = [0, -1];
const DOWN: Pt = [0, 1];
const LEFT: Pt = [-1, 0];
const RIGHT: Pt = [1, 0];

/** Carbon's battery, cut at its top wall (ending at x `end`) and its left wall for a badge at the top left. */
export const batteryBadge = (end: number) =>
  `M27 11H26V10C26 8.9 25.1 8 24 8H${end}V10H24V13H27V19H24V22H6V17H4V22C4 23.1 4.9 24 6 24H24C25.1 24 26 23.1 26 22V21H27C28.1 21 29 20.1 29 19V13C29 11.9 28.1 11 27 11Z`;
/** Its open ends: the top wall's (at x `end`), drawing right, and the left wall's, drawing down. */
export const batteryEnds = (end: number) => [
  {
    at: [
      [end, 8],
      [end, 10],
    ] as Pt[],
    back: RIGHT,
  },
  {
    at: [
      [6, 17],
      [4, 17],
    ] as Pt[],
    back: DOWN,
  },
];

export const BATTERY_WARNING: Spec = {
  base: {
    d: /* @__PURE__ */ batteryBadge(14),
    ends: /* @__PURE__ */ batteryEnds(14),
  },
  mark: WARN,
  place: {
    d:
      'M14 14C14 13.87 13.97 13.73 13.92 13.61L8.89 3.55C8.72 3.21 8.37 3 8 3C7.62 3 7.27 3.21 7.11 3.55L2.11 13.55C1.86 14.04 2.06 14.65 2.56 14.89C2.7 14.96 2.85 15 3.01 15H13.01C13.56 15 14.01 14.55 14.01 14H14Z' +
      'M4.62 13L8 6.24L11.38 13H4.62Z',
    tri: [
      [8, 4],
      [3, 14],
      [13, 14],
    ],
    round: 1,
  },
};
export const BatteryWarningSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('BatteryWarning', BATTERY_WARNING),
  /* @__PURE__ */ carbonArt(BatteryWarning32)
);

// Event warning: the base is WarningAlt's triangle (its centreline (16, 4), (3, 29), (29, 29)) with its "!",
// cut for the corner triangle. It holds; only the triangle grows.
const BIG_TRI: Pt[] = [
  [16, 4],
  [3, 29],
  [29, 29],
];
/** The side's direction from its foot up to the apex (the side's open end draws back along it). */
const UP_SIDE: Pt = /* @__PURE__ */ (() => {
  const [dx, dy] = [
    BIG_TRI[0][0] - BIG_TRI[2][0],
    BIG_TRI[0][1] - BIG_TRI[2][1],
  ];
  const l = Math.hypot(dx, dy);
  return [dx / l, dy / l];
})();
export const EVENT_WARNING: Spec = {
  base: {
    d: 'M15 30H3C2.6506 30 2.3264 29.8176 2.1453 29.5189C1.9639 29.2203 1.9517 28.8486 2.1128 28.5387L15.1128 3.5387C15.2849 3.2076 15.6425 3 16 3C16.3575 3 16.7151 3.2076 16.8872 3.5387L22.8872 15.0772L21.1128 15.9998L16 6.1676L4.6472 28H15V30Z',
    ends: [
      {
        at: [
          [15, 30],
          [15, 28],
        ],
        back: LEFT,
      },
      {
        at: [
          [22.8872, 15.0772],
          [21.1128, 15.9998],
        ],
        back: UP_SIDE,
      },
    ],
    parts: {
      bang:
        'M15 12H17V21H15Z' +
        'M16 23C15.1716 23 14.5 23.6716 14.5 24.5S15.1716 26 16 26S17.5 25.3284 17.5 24.5S16.8284 23 16 23Z',
    },
  },
  mark: WARN,
  place: {
    d:
      'M27.3803 28H20.6178L24 21.2358L27.3803 28Z' +
      'M24 18C23.6085 18 23.2695 18.2251 23.1053 18.5527L18.1053 28.5527C18.0379 28.6875 18 28.8393 18 29C18 29.5522 18.4477 30 19 30H29C29.5523 30 30 29.5522 30 29C30 28.8618 29.972 28.7305 29.9214 28.6108L24.8945 18.5527C24.7304 18.2251 24.3914 18 23.9999 18Z',
    tri: [
      [24, 19],
      [19, 29],
      [29, 29],
    ],
    round: 1,
    // The "!"'s dot sits 2.2px from the badge, which grows towards it: the badge moves 0.45px right, holding 2px.
    drift: [0.45, 0],
  },
};
export const EventWarningSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('EventWarning', EVENT_WARNING),
  /* @__PURE__ */ carbonArt(EventWarning32)
);

/** Carbon's filled warning (missing-data--warning's): rounded 0.72 about its corners, its "!" knocked out. */
const FILLED_WARN = (dx: number, dy: number) => {
  const P = (x: number, y: number) => `${f(x + dx)} ${f(y + dy)}`;
  return {
    d:
      `M${P(30.91, 28.94)}L${P(24.63, 17.37)}C${P(24.44, 17.02)} ${P(24, 16.9)} ${P(23.65, 17.09)}C${P(23.54, 17.16)} ${P(23.44, 17.25)} ${P(23.37, 17.37)}` +
      `L${P(17.09, 28.94)}C${P(16.9, 29.28)} ${P(17.03, 29.72)} ${P(17.38, 29.91)}C${P(17.48, 29.97)} ${P(17.6, 30)} ${P(17.72, 30)}` +
      `H${f(30.2801 + dx)}C${P(30.6801, 30)} ${P(31.0001, 29.68)} ${P(31.0001, 29.28)}C${P(31.0001, 29.16)} ${P(30.9701, 29.04)} ${P(30.9101, 28.94)}Z` +
      `M${P(23.25, 21)}H${f(24.75 + dx)}V${f(25 + dy)}H${f(23.25 + dx)}V${f(21 + dy)}Z` +
      `M${P(24, 28)}C${P(23.45, 28)} ${P(23, 27.55)} ${P(23, 27)}S${P(23.45, 26)} ${P(24, 26)}S${P(25, 26.45)} ${P(25, 27)}S${P(24.55, 28)} ${P(24, 28)}Z`,
    tri: [
      [24 + dx, 17.718 + dy],
      [17.724 + dx, 29.28 + dy],
      [30.276 + dx, 29.28 + dy],
    ] as const,
    round: 0.72,
    bang: {
      bar: [23.25 + dx, 24.75 + dx, 21 + dy, 25 + dy] as const,
      dot: [24 + dx, 27 + dy, 1] as const,
    },
  };
};

/** The rise of a warning's point as it grows (its centroid's height above the point, 14%): the drift that holds the point. */
const holdPoint = (t: readonly Pt[]): Pt => [
  0,
  WARN_GROW * (centroidOf(t)[1] - t[0][1]),
];
/** The drop of a warning's floor as it grows: the drift that holds the floor. */
const holdFloor = (t: readonly Pt[]): Pt => [
  0,
  -WARN_GROW * (t[1][1] - centroidOf(t)[1]),
];
const MISSING_DATA = /* @__PURE__ */ FILLED_WARN(0, 0);
export const MISSING_DATA_WARNING: Spec = {
  base: {
    d:
      'M15 30H7C5.897 30 5 29.1025 5 28V4C5 2.897 5.897 2 7 2H17C17.2656 2 17.5195 2.1055 17.707 2.293L24.707 9.293C24.8945 9.4805 25 9.7349 25 10V14H23V12H17C15.897 12 15 11.103 15 10V4H7V28H15V30Z' +
      'M17 4.4141V10H22.5859L17 4.4141Z',
    ends: [
      {
        at: [
          [25, 14],
          [23, 14],
        ],
        back: UP,
      },
      {
        at: [
          [15, 28],
          [15, 30],
        ],
        back: LEFT,
      },
    ],
    parts: { lines: 'M15 23H10V21H15V23Z' + 'M20 18H10V16H20V18Z' },
    // The documents' hover: the corner folds 2px, the page holding (this page sits 1px left of Document's).
    calm: documentFoldAt(-1),
  },
  baseMotion: 'calm',
  mark: WARN,
  // The fold takes the 2px of right wall Carbon leaves above the triangle, so its end can't draw back: the point holds.
  place: {
    ...MISSING_DATA,
    drift: /* @__PURE__ */ holdPoint(MISSING_DATA.tri),
  },
};
export const MissingDataWarningSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('MissingDataWarning', MISSING_DATA_WARNING),
  /* @__PURE__ */ carbonArt(MissingDataWarning32)
);

/** The roof's direction down to its left (its open end, right of the apex, draws back along it). */
const DOWN_ROOF: Pt = /* @__PURE__ */ (() => {
  const [dx, dy] = [16 - 18.5327, 4.2715 - 6.2471];
  const l = Math.hypot(dx, dy);
  return [dx / l, dy / l];
})();
export const FLOOD_WARNING: Spec = {
  base: {
    d: 'M28 21V18H26V21H25A3.4376 3.4376 0 0 1 21.9487 18.6836A1 1 0 0 0 20.0532 18.6787A3.44 3.44 0 0 1 17 21A3.4376 3.4376 0 0 1 13.9487 18.6836A1.007 1.007 0 0 0 13 18A0.9894 0.9894 0 0 0 12.0532 18.6787A3.44 3.44 0 0 1 9 21A3.3663 3.3663 0 0 1 6 18.8145V12.0615L16 4.2715L18.5327 6.2471L19.5009 4.4653L16.6123 2.2139A1.0094 1.0094 0 0 0 15.3696 2.2139L1 13.4194L2.2427 14.9912L4 13.6211V18.8086A3.6892 3.6892 0 0 1 2 20.8125V22.896A4.9958 4.9958 0 0 0 5 21.0127A5.0192 5.0192 0 0 0 13 21.0127A5.0192 5.0192 0 0 0 21 21.0127A4.9316 4.9316 0 0 0 25 23H30V21Z',
    ends: [
      {
        at: [
          [18.5327, 6.2471],
          [19.5009, 4.4653],
        ],
        back: DOWN_ROOF,
      },
      {
        at: [
          [28, 18],
          [26, 18],
        ],
        back: DOWN,
      },
    ],
    parts: {
      water:
        'M29 28A2.8828 2.8828 0 0 1 28 27.8184V27.8125A3.7662 3.7662 0 0 1 25.9468 25.6787A0.971 0.971 0 0 0 25 25A1.007 1.007 0 0 0 24.0513 25.6836A3.4376 3.4376 0 0 1 21 28A3.44 3.44 0 0 1 17.9468 25.6787A0.9894 0.9894 0 0 0 17 25A1.007 1.007 0 0 0 16.0513 25.6836A3.4376 3.4376 0 0 1 13 28A3.44 3.44 0 0 1 9.9468 25.6787A1 1 0 0 0 8.0513 25.6836A3.4376 3.4376 0 0 1 5 28H2V30H5A4.9316 4.9316 0 0 0 9 28.0127A5.0192 5.0192 0 0 0 17 28.0127A5.0192 5.0192 0 0 0 25 28.0127A5.1433 5.1433 0 0 0 27.1379 29.6327A4.8374 4.8374 0 0 0 29 30H30V28Z',
    },
  },
  mark: WARN,
  place: {
    d:
      'M29.9115 14.9355L23.6284 3.3706A0.7181 0.7181 0 0 0 22.3716 3.3706L16.0885 14.9355A0.72 0.72 0 0 0 16.72 16H29.28A0.72 0.72 0 0 0 29.9115 14.9355Z' +
      'M22.25 7H23.75V11H22.25Z' +
      'M23 14A1 1 0 1 1 24 13A1 1 0 0 1 23 14Z',
    tri: [
      [23, 3.718],
      [16.72, 15.28],
      [29.28, 15.28],
    ],
    round: 0.72,
    bang: { bar: [22.25, 23.75, 7, 11], dot: [23, 13, 1] },
    // Its floor sits 2px above the water's crest, which holds: the floor holds and it grows up and out.
    drift: /* @__PURE__ */ holdFloor([
      [23, 3.718],
      [16.72, 15.28],
      [29.28, 15.28],
    ]),
  },
};
export const FloodWarningSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('FloodWarning', FLOOD_WARNING),
  /* @__PURE__ */ carbonArt(FloodWarning32)
);

/** Content navigator sync, cut for a badge at the bottom right: the document, the dot and the two arrow arcs (about (16, 16)). */
export const SYNC_BADGE =
  'M17 11H13C12.45 11 12 11.45 12 12V20C12 20.55 12.45 21 13 21H19C19.55 21 20 20.55 20 20V14L17 11ZM18 19H14V13H16V15H18V19Z' +
  'M3 11C3.5523 11 4 11.4477 4 12C4 12.5523 3.5523 13 3 13C2.4477 13 2 12.5523 2 12C2 11.4477 2.4477 11 3 11Z' +
  'M16 30C14.1519 30 12.3491 29.6416 10.6421 28.9346C8.9356 28.2276 7.4077 27.2061 6.1006 25.8994C4.7944 24.5937 3.7735 23.0654 3.0659 21.3574C2.3584 19.6504 2 17.8476 2 16H4C4 17.583 4.3076 19.1289 4.9136 20.5918C5.52 22.0557 6.395 23.3652 7.5147 24.4854C8.6353 25.6055 9.9449 26.4805 11.4078 27.087C12.8707 27.6925 14.4161 28.0001 16 28V30Z' +
  'M30 16H28C28 13.62 27.3 11.31 25.98 9.33C24.66 7.35 22.79 5.8201 20.59 4.91C18.39 4 15.99 3.76 13.6599 4.23C11.5699 4.65 9.65 5.6 8.0599 7H12V9H5V2H7V5.28C8.79 3.77 10.94 2.73 13.27 2.27C15.99 1.73 18.79 2 21.36 3.07C23.92 4.13 26.1 5.91 27.64 8.22C29.18 10.53 30 13.22 30 16Z';
/** Its two arc ends beside the badge: the lower arc's (drawing back clockwise, up its left) and the upper arc's (anticlockwise, up its right). */
export const SYNC_ENDS = [
  {
    at: [
      [16, 30],
      [16, 28],
    ] as Pt[],
    back: { c: [16, 16] as Pt, turn: 1 as const },
  },
  {
    at: [
      [30, 16],
      [28, 16],
    ] as Pt[],
    back: { c: [16, 16] as Pt, turn: -1 as const },
  },
];
export const CONTENT_NAVIGATOR_SYNC_WARNING: Spec = {
  base: { d: SYNC_BADGE, ends: SYNC_ENDS },
  mark: WARN,
  place: /* @__PURE__ */ FILLED_WARN(1, 2),
};
export const ContentNavigatorSyncWarningSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon(
    'ContentNavigatorSyncWarning',
    CONTENT_NAVIGATOR_SYNC_WARNING
  ),
  /* @__PURE__ */ carbonArt(ContentNavigatorSyncWarning32)
);

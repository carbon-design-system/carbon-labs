/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ImageCopy32 from '@carbon/icons/es/image--copy/32.js';
import ListBoxes32 from '@carbon/icons/es/list--boxes/32.js';
import ListBulleted16 from '@carbon/icons/es/list--bulleted/16.js';
import ListBulleted32 from '@carbon/icons/es/list--bulleted/32.js';
import ListChecked32 from '@carbon/icons/es/list--checked/32.js';
import ListNumbered32 from '@carbon/icons/es/list--numbered/32.js';
import Label32 from '@carbon/icons/es/label/32.js';
import Draw32 from '@carbon/icons/es/draw/32.js';
import ReflectHorizontal32 from '@carbon/icons/es/reflect--horizontal/32.js';
import ReflectVertical32 from '@carbon/icons/es/reflect--vertical/32.js';
import DiamondOutline32 from '@carbon/icons/es/diamond--outline/32.js';
import DiamondSolid32 from '@carbon/icons/es/diamond--solid/32.js';
import HexagonOutline32 from '@carbon/icons/es/hexagon--outline/32.js';
import HexagonSolid32 from '@carbon/icons/es/hexagon--solid/32.js';
import Image32 from '@carbon/icons/es/image/32.js';
import NoImage32 from '@carbon/icons/es/no-image/32.js';
import PentagonOutline32 from '@carbon/icons/es/pentagon--outline/32.js';
import PentagonSolid32 from '@carbon/icons/es/pentagon--solid/32.js';
import Percentage32 from '@carbon/icons/es/percentage/32.js';
import PercentageFilled32 from '@carbon/icons/es/percentage--filled/32.js';
import TriangleOutline32 from '@carbon/icons/es/triangle--outline/32.js';
import TriangleSolid32 from '@carbon/icons/es/triangle--solid/32.js';
import {
  carbonArt,
  hoverIcon,
  toggleIcon,
  type CarbonArt,
  type Shapes,
  type ToggleFrame,
} from '../../engine';
import {
  centroid,
  circlePts,
  discFillPath,
  filletPath,
  framePath,
  insetPoly,
  polyPath,
  rectPath,
  ringPath,
  scalePts,
  type Pt,
} from '../../geometry';
import {
  C,
  EVENODD,
  LINE,
  closedFillet,
  diamond,
  f,
  toggle,
} from '../status/alerts';
import { MITER, ROUND } from '../../paint';
import {
  filletSegs,
  offBase,
  OFF_SHRINK,
  slashPath,
  SLASH_REACH,
  type OffStroke,
  type Slash,
} from '../../off';
import {
  kickAmount,
  slashChange,
  slashShapes,
  type SlashToggleSpec,
} from '../../utils/slashToggle';

const CDiamondOutline = /* @__PURE__ */ carbonArt(DiamondOutline32);
const CDiamondSolid = /* @__PURE__ */ carbonArt(DiamondSolid32);
const CHexagonOutline = /* @__PURE__ */ carbonArt(HexagonOutline32);
const CHexagonSolid = /* @__PURE__ */ carbonArt(HexagonSolid32);
const CImage = /* @__PURE__ */ carbonArt(Image32);
const CNoImage = /* @__PURE__ */ carbonArt(NoImage32);
const CPentagonOutline = /* @__PURE__ */ carbonArt(PentagonOutline32);
const CPentagonSolid = /* @__PURE__ */ carbonArt(PentagonSolid32);
const CPercentage = /* @__PURE__ */ carbonArt(Percentage32);
const CPercentageFilled = /* @__PURE__ */ carbonArt(PercentageFilled32);
const CTriangleOutline = /* @__PURE__ */ carbonArt(TriangleOutline32);
const CTriangleSolid = /* @__PURE__ */ carbonArt(TriangleSolid32);

/**
 * Formatting icons (no reference animations).
 *
 * Shapes follow the status containers: on hover the outline grows 1px out
 * along every edge at constant line weight (a quarter or sixth turn would
 * land on itself, so none of them rotate). Their toggles are outline ↔
 * solid with the house disc fill.
 *
 * Everything else is Carbon's drawing, re-expressed as 2px centrelines
 * where a part moves, verbatim where it holds. Rest states match Carbon
 * within 0.5% unless noted.
 */

const move = (pts: readonly Pt[], dx: number, dy: number): Pt[] =>
  pts.map(([x, y]) => [x + dx, y + dy] as Pt);

// ── Shapes ───────────────────────────────────────────────────────────────────

/** A polygon's 2px centreline (round joins give Carbon's outer r=1 corners), grown `h` px out, filled `p`/`e`. */
function polygonShapes(
  centreline: readonly Pt[],
  { h, p, e }: ToggleFrame
): Shapes {
  const pts = h ? insetPoly(centreline, -h) : [...centreline];
  // The fill grows from the shape's centroid (for the triangle that's well
  // below the icon centre).
  return {
    edge: { d: polyPath(pts, true), ...ROUND },
    fill: { d: discFillPath(pts, centroid(centreline), p, e), ...EVENODD },
  };
}
const HEXAGON: Pt[] = [
  [9, 4],
  [23, 4],
  [30, 16],
  [23, 28],
  [9, 28],
  [2, 16],
];
const PENTAGON: Pt[] = [
  [16, 3],
  [29, 12.544],
  [24.0302, 28],
  [7.9698, 28],
  [3, 12.544],
];
const TRIANGLE: Pt[] = [
  [16, 4.0355],
  [29.0033, 28],
  [2.9967, 28],
];

/* @__NO_SIDE_EFFECTS__ */
const shapeIcons = (
  name: string,
  centreline: Pt[] | null,
  statics: readonly [CarbonArt, CarbonArt]
) => {
  const geo = (fr: ToggleFrame) =>
    centreline ? polygonShapes(centreline, fr) : diamondShapes(fr);
  return [
    hoverIcon(`${name}Outline`, {
      geo: ({ h }) => geo({ h, p: 0, e: 0 }),
      static: statics[0],
    }),
    hoverIcon(`${name}Solid`, {
      geo: ({ h }) => geo({ h, p: 1, e: 0 }),
      static: statics[1],
    }),
    toggle(`${name}Toggle`, statics, geo),
  ] as const;
};
// Diamond: corners filleted (outer r=2), as WarningDiamond.
function diamondShapes({ h, p, e }: ToggleFrame): Shapes {
  const d = diamond(13.45 + Math.SQRT2 * h);
  return {
    edge: { d: closedFillet(d, 1), ...LINE },
    fill: { d: discFillPath(d, C, p, e), ...EVENODD },
  };
}
export const [HexagonOutlineSpec, HexagonSolidSpec, HexagonToggleSpec] =
  shapeIcons('Hexagon', HEXAGON, [CHexagonOutline, CHexagonSolid]);
export const [PentagonOutlineSpec, PentagonSolidSpec, PentagonToggleSpec] =
  shapeIcons('Pentagon', PENTAGON, [CPentagonOutline, CPentagonSolid]);
export const [TriangleOutlineSpec, TriangleSolidSpec, TriangleToggleSpec] =
  shapeIcons('Triangle', TRIANGLE, [CTriangleOutline, CTriangleSolid]);
export const [DiamondOutlineSpec, DiamondSolidSpec, DiamondToggleSpec] =
  shapeIcons('Diamond', null, [CDiamondOutline, CDiamondSolid]);

// ── Images ───────────────────────────────────────────────────────────────────

/**
 * Hills (Carbon's 2px line, filleted r=1 at each bend) inside a frame whose
 * sides' centrelines are at x = left and right. The bends move by
 * (dx, dy); the ends slide along their 45° slopes to stay on the frame.
 */
function hills(
  bends: readonly Pt[],
  left: number,
  right: number,
  dx: number,
  dy: number
): string {
  const b = bends.map(([x, y]): Pt => [x + dx, y + dy]);
  const [first, last] = [b[0], b[b.length - 1]];
  return filletPath(
    [
      [left, first[1] + (first[0] - left)],
      ...b,
      [right, last[1] + (right - last[0])],
    ],
    1
  );
}
const IMAGE_HILLS: Pt[] = [
  [11, 13.586],
  [18, 20.586],
  [21, 17.586],
];

// Image: the frame grows 1px all round, the hills drop 2px straight down,
// and the sun grows 1px in place.
export const ImageSpec = /* @__PURE__ */ hoverIcon('Image', {
  geo: ({ h }) => ({
    frame: { d: framePath(4 - h, 4 - h, 28 + h, 28 + h) },
    hills: { d: hills(IMAGE_HILLS, 5 - h, 27 + h, 0, 2 * h), ...MITER },
    sun: { d: ringPath([19, 11], 2 + h, 2) },
  }),
  static: /* @__PURE__ */ carbonArt(Image32),
});

// Image copy: the pages move as Copy's do. The back page's corner moves
// 1px down and right and its arms extend, stopping 4px short of the front
// page's far edge (as Copy's do); the front image moves 1px up and left.
// Inside it the hills drop 2px and the sun grows 1px in place.
const COPY_HILLS: Pt[] = [
  [13, 16.589],
  [20, 23.586],
  [23, 20.589],
];
export const ImageCopySpec = /* @__PURE__ */ hoverIcon('ImageCopy', {
  geo: ({ h }) => {
    const [o, arm] = [h, 22 + 2 * h];
    const back = `M${f(4 + o)} ${f(arm + o)}H${f(2 + o)}V${f(4 + o)}A2 2 0 0 1 ${f(4 + o)} ${f(2 + o)}H${f(arm + o)}V${f(4 + o)}H${f(4 + o)}Z`;
    return {
      back: { d: back },
      front: { d: framePath(7 - h, 7 - h, 30 - h, 30 - h) },
      hills: {
        d: hills(move(COPY_HILLS, -h, -h), 8 - h, 29 - h, 0, 2 * h),
        ...MITER,
      },
      sun: { d: ringPath([21 - h, 14 - h], 2 + h, 2) },
    };
  },
  static: /* @__PURE__ */ carbonArt(ImageCopy32),
});

// No image, on the set-wide Off rule: the frame and the hills shrink to 90%
// about the centre at constant 2px weight, under the slash and Carbon's 2px
// gap above it (a fixed strip), while the slash extends 1px at each end.
// The hills sit 1px higher than Image's, as Carbon draws them here.
const NO_IMAGE_SLASH: Slash = {
  a: [2.7071, 29.2929],
  b: [29.2929, 2.7071],
  gapSide: -1,
  gap: 2,
};
// Carbon cuts the top and left walls square, at x = 22 and y = 22.
const NO_IMAGE_SQUARE = (32 - 27) / Math.SQRT2;
const NO_IMAGE_HILLS: Pt[] = [
  [5, 18.586],
  [11, 12.586],
  [19, 20.586],
  [22, 17.586],
  [27, 22.586],
];
const NO_IMAGE_STROKES = [
  {
    path: /* @__PURE__ */ filletSegs(
      [
        [5, 5],
        [27, 5],
        [27, 27],
        [5, 27],
      ],
      1,
      true
    ),
    square: NO_IMAGE_SQUARE,
  },
  /* @__PURE__ */ filletSegs(NO_IMAGE_HILLS, 1),
];
export const NoImageSpec = /* @__PURE__ */ hoverIcon('NoImage', {
  geo: ({ h }) => {
    const base = offBase(
      NO_IMAGE_STROKES,
      NO_IMAGE_SLASH,
      1 - OFF_SHRINK * h,
      [16, 16]
    );
    return {
      fill: { d: base.fill },
      rings: { d: base.rings, ...EVENODD },
      slash: { d: slashPath(NO_IMAGE_SLASH, SLASH_REACH * h) },
    };
  },
  static: /* @__PURE__ */ carbonArt(NoImage32),
});

/**
 * Image ⇄ No image, the slash toggle (utils/slashToggle) with two extras:
 *
 * - Image's hills sit 1px lower than No image's, and their right-hand bends
 *   1px further left, so the hills move that 1px with the toggle (`p`).
 *   The frame is the same in both.
 * - Image's sun has no counterpart under the slash: on → off it closes up
 *   and shrinks away about its centre (2px ring weight while it's a ring,
 *   then a shrinking dot), gone by the time the slash's head reaches it
 *   (half way); off → on it grows back the same way.
 *
 * On hover is Image's (the frame grows 1px, the hills drop 2px, the sun
 * grows 1px); off hover is the set-wide Off rule, as NoImage. The off end is
 * NoImage's geometry exactly; the on end is Carbon's Image. On → off the
 * picture kicks 2px left, toward the gap.
 */
const IMAGE_HILL_PTS: Pt[] = [[5, 19.586], ...IMAGE_HILLS, [27, 23.586]];
const SUN_GONE_AT = 0.5;
/** A disc (or ring, with `inner`) about c, as one evenodd path. */
const roundD = ([cx, cy]: Pt, r: number) =>
  r > 1e-3
    ? `M${f(cx - r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 0 ${f(cx + r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 0 ${f(cx - r)} ${f(cy)}Z`
    : '';

function imageOffShapes(fr: ToggleFrame): Shapes {
  const { h, p, e } = fr;
  // The hills between Image's (m 0) and No image's (m 1), on hover dropped
  // 2px with their ends on the grown frame's walls (as Image's hover).
  const imageBase = (hOn: number): { strokes: OffStroke[] } => {
    const pts = IMAGE_HILL_PTS.map(
      ([x, y], i) =>
        [
          x + (NO_IMAGE_HILLS[i][0] - x) * p,
          y + (NO_IMAGE_HILLS[i][1] - y) * p + 2 * hOn,
        ] as Pt
    );
    const n = pts.length - 1;
    const [l, r] = [5 - hOn, 27 + hOn];
    pts[0] = [l, pts[1][1] + (pts[1][0] - l)];
    pts[n] = [r, pts[n - 1][1] + (r - pts[n - 1][0])];
    return {
      strokes: [
        {
          path: filletSegs(
            [
              [5 - hOn, 5 - hOn],
              [27 + hOn, 5 - hOn],
              [27 + hOn, 27 + hOn],
              [5 - hOn, 27 + hOn],
            ],
            1,
            true
          ),
          square: NO_IMAGE_SQUARE,
        },
        filletSegs(pts, 1),
      ],
    };
  };
  const spec: SlashToggleSpec = { ...IMAGE_OFF, base: imageBase };
  const shapes = slashShapes(spec, fr);
  // The sun: centreline r 2 (+1 on hover), riding the kick; shrinks away with p.
  const q = Math.min(1, p / SUN_GONE_AT);
  const outer = (3 + h * (1 - p)) * (1 - q);
  const k = kickAmount(e);
  const c: Pt = [19 + IMAGE_OFF.kick[0] * k, 11 + IMAGE_OFF.kick[1] * k];
  shapes.sun = { d: roundD(c, outer) + roundD(c, outer - 2), ...EVENODD };
  return shapes;
}
const IMAGE_OFF: SlashToggleSpec = {
  statics: [CImage, CNoImage],
  slash: NO_IMAGE_SLASH,
  kick: [-2, 0],
  centre: [16, 16],
  base: () => ({ strokes: NO_IMAGE_STROKES }),
};
/** Image ⇄ No image. `toggled` shows No image. */
export const ImageOffToggleSpec = /* @__PURE__ */ toggleIcon<'on' | 'off'>(
  'ImageOffToggle',
  {
    states: ['on', 'off'],
    statics: IMAGE_OFF.statics,
    geo: imageOffShapes,
    change: slashChange,
  }
);

// ── Lists ────────────────────────────────────────────────────────────────────

/** The two text lines, extended `x` px to the right. */
const lines = (x: number) =>
  rectPath(16, 8, 30 + x, 10) + rectPath(16, 22, 30 + x, 24);

// Boxes: each box grows 1px all round in place, and the lines extend 1px.
export const ListBoxesSpec = /* @__PURE__ */ hoverIcon('ListBoxes', {
  geo: ({ h }) => ({
    boxes: {
      d:
        framePath(2 - h, 4 - h, 12 + h, 14 + h) +
        framePath(2 - h, 18 - h, 12 + h, 28 + h),
    },
    lines: { d: lines(h) },
  }),
  static: /* @__PURE__ */ carbonArt(ListBoxes32),
});

// Bulleted: the bullets grow to 1.2× and the lines extend 1px, together.
export const ListBulletedSpec = /* @__PURE__ */ hoverIcon('ListBulleted', {
  geo: ({ h }) => ({
    // Carbon draws the bullets as <circle>s, which rasterise differently
    // from arc paths at small sizes, so these are circles too.
    b0: { tag: 'circle', cx: 7, cy: 9, r: f(3 + 0.6 * h) },
    b1: { tag: 'circle', cx: 7, cy: 23, r: f(3 + 0.6 * h) },
    lines: { d: lines(h) },
  }),
  static: /* @__PURE__ */ carbonArt(ListBulleted16, ListBulleted32),
});

// Checked: both checks grow 10% about their own centres, and the lines
// extend 1px, together.
const LIST_CHECK: Pt[] = [
  [2.7, 22.7],
  [6, 26],
  [13.3, 18.7],
];
export const ListCheckedSpec = /* @__PURE__ */ hoverIcon('ListChecked', {
  geo: ({ h }) => ({
    top: {
      d: polyPath(scalePts(move(LIST_CHECK, 0, -14), [8, 8.7], 1 + 0.1 * h)),
      ...MITER,
      strokeWidth: 1.98,
    },
    bottom: {
      d: polyPath(scalePts(LIST_CHECK, [8, 22.7], 1 + 0.1 * h)),
      ...MITER,
      strokeWidth: 1.98,
    },
    lines: { d: lines(h) },
  }),
  static: /* @__PURE__ */ carbonArt(ListChecked32),
});

// Numbered: the lines extend 1px, and the numbers grow 10% about their
// own centres with them, at constant 2px line weight (positions scale,
// the weight doesn't).
const ONE = {
  stem: [
    [7, 4],
    [7, 13],
  ] as Pt[],
  base: [
    [4, 13],
    [10, 13],
  ] as Pt[],
  flag: [
    [4, 6],
    [7, 6],
  ] as Pt[],
  c: [7, 9] as Pt,
};
const TWO: Pt[] = [
  [4, 19],
  [9, 19],
  [9, 23],
  [5, 23],
  [5, 27],
  [10, 27],
];
/**
 * The "2" as a filled outline in Carbon's own form (it rasterises closer to
 * Carbon at 16px than a stroke does): its 2px band around the scaled
 * centreline, outer corners r=2 at the bends, a square corner into the base.
 */
function twoOutline([a, b, , d, e, g]: Pt[]): string {
  const [xa, xb, xd, xf, yb, yd, ye] = [
    a[0],
    b[0],
    d[0],
    g[0],
    b[1],
    d[1],
    e[1],
  ].map(f);
  return (
    `M${xf} ${ye + 1}H${xd - 1}V${yd + 1}A2 2 0 0 1 ${xd + 1} ${yd - 1}H${xb - 1}V${yb + 1}H${xa}V${yb - 1}H${xb - 1}` +
    `A2 2 0 0 1 ${xb + 1} ${yb + 1}V${yd - 1}A2 2 0 0 1 ${xb - 1} ${yd + 1}H${xd + 1}V${ye - 1}H${xf}Z`
  );
}
export const ListNumberedSpec = /* @__PURE__ */ hoverIcon('ListNumbered', {
  geo: ({ h }) => {
    const s = 1 + 0.1 * h;
    const one = (pts: Pt[]) => polyPath(scalePts(pts, ONE.c, s));
    const two = scalePts(TWO, [7, 23], s);
    return {
      one: { d: one(ONE.stem) + one(ONE.base) + one(ONE.flag), ...LINE },
      two: { d: twoOutline(two) },
      lines: { d: lines(h) },
    };
  },
  static: /* @__PURE__ */ carbonArt(ListNumbered32),
});

// ── Label, draw, percentage ──────────────────────────────────────────────────

// Label: the frame grows 1px all round (a container, as the status icons);
// the "Aa" holds.
const LETTERS =
  'M23,13H18v2h5v2H19a2,2,0,0,0-2,2v2a2,2,0,0,0,2,2h6V15A2.0023,2.0023,0,0,0,23,13Zm0,8H19V19h4Z' +
  'M13,9H9a2.002,2.002,0,0,0-2,2V23H9V18h4v5h2V11A2.002,2.002,0,0,0,13,9ZM9,16V11h4v5Z';
export const LabelSpec = /* @__PURE__ */ hoverIcon('Label', {
  geo: ({ h }) => ({
    frame: { d: framePath(2 - h, 4 - h, 30 + h, 28 + h) },
    letters: { d: LETTERS },
  }),
  static: /* @__PURE__ */ carbonArt(Label32),
});

// Draw: the squiggle's strokes each lengthen 1.5px along their diagonal
// (the turns move out 0.75px), and its two ends extend 2px further, each
// along its own stroke. Constant line weight. Its
// centreline is fitted in rotated coordinates: a runs along the strokes
// (up and right), b across them. Carbon's own turns aren't quite uniform,
// so this one rests 0.6–0.9% from Carbon depending on size.
const DRAW = {
  sa: -5.866,
  b: [13.92, 18.79, 23.63, 28.47, 33.31],
  turns: [5.755, -6.278, 3.627, -3.82],
  ea: 2.482,
};
export const DrawSpec = /* @__PURE__ */ hoverIcon('Draw', {
  geo: ({ h }) => {
    const s = 0.75 * h; // half the 1.5px stretch, at each turn
    const end = s + 2 * h;
    const k = Math.SQRT1_2;
    const P = (a: number, b: number) => `${f((a + b) * k)} ${f((b - a) * k)}`;
    const [b1, b2, b3, b4, b5] = DRAW.b;
    const [c2, c3, c1, c4] = DRAW.turns;
    const r = (x: number, y: number) => f((y - x) / 2);
    const d =
      `M${P(DRAW.sa - end, b1)}L${P(c2 + s, b1)}A${r(b1, b2)} ${r(b1, b2)} 0 0 1 ${P(c2 + s, b2)}` +
      `L${P(c3 - s, b2)}A${r(b2, b3)} ${r(b2, b3)} 0 0 0 ${P(c3 - s, b3)}` +
      `L${P(c1 + s, b3)}A${r(b3, b4)} ${r(b3, b4)} 0 0 1 ${P(c1 + s, b4)}` +
      `L${P(c4 - s, b4)}A${r(b4, b5)} ${r(b4, b5)} 0 0 0 ${P(c4 - s, b5)}L${P(DRAW.ea + end, b5)}`;
    return { squiggle: { d, ...LINE } };
  },
  static: /* @__PURE__ */ carbonArt(Draw32),
});

// Percentage: the slash extends 1px at each end and each circle grows 1px
// in place. Toggle: both fill with the house disc fill.
const SLASH = (() => {
  const k = Math.SQRT1_2;
  const p = (s: number, t: number): Pt => [16 + k * (s + t), 16 + k * (t - s)];
  return (half: number) =>
    polyPath([p(-half, -1), p(half, -1), p(half, 1), p(-half, 1)], true);
})();
function percentageShapes({ h, p, e }: ToggleFrame): Shapes {
  const [a, b]: [Pt, Pt] = [
    [9, 9],
    [23, 23],
  ];
  const r = 4 + h;
  return {
    slash: { d: SLASH(15.9705 + h) },
    rings: { d: ringPath(a, r, 2) + ringPath(b, r, 2) },
    fill: {
      d:
        discFillPath(circlePts(a, r - 0.5), a, p, e) +
        discFillPath(circlePts(b, r - 0.5), b, p, e),
      ...EVENODD,
    },
  };
}
export const PercentageSpec = /* @__PURE__ */ hoverIcon('Percentage', {
  geo: ({ h }) => percentageShapes({ h, p: 0, e: 0 }),
  static: /* @__PURE__ */ carbonArt(Percentage32),
});
export const PercentageFilledSpec = /* @__PURE__ */ hoverIcon(
  'PercentageFilled',
  {
    geo: ({ h }) => percentageShapes({ h, p: 1, e: 0 }),
    static: /* @__PURE__ */ carbonArt(PercentageFilled32),
  }
);
export const PercentageToggleSpec = /* @__PURE__ */ toggle(
  'PercentageToggle',
  [CPercentage, CPercentageFilled],
  (fr) => percentageShapes(fr)
);

// ── Reflect ──────────────────────────────────────────────────────────────────

// The axis grows 4px (2px at each end) and each triangle grows 1px along
// both of its dimensions: 1px further from the axis (its tip by the axis
// holds) and 1px longer along it (0.5px at each end).
const REFLECT: Pt[] = [
  [3, 23],
  [12, 16],
  [3, 9],
]; // the outlined (left) triangle's centreline
function reflectShapes(h: number, vertical: boolean): Shapes {
  const flip = (pts: Pt[], side: 1 | -1) =>
    pts.map(([x, y]): Pt => {
      const tip = x === 12;
      const u = 16 + side * (tip ? x - 16 : x - h - 16);
      const v = tip ? y : y + Math.sign(y - 16) * 0.5 * h;
      return vertical ? [v, u] : [u, v];
    });
  return {
    axis: {
      d: vertical
        ? rectPath(2 - 2 * h, 15, 30 + 2 * h, 17)
        : rectPath(15, 2 - 2 * h, 17, 30 + 2 * h),
    },
    outline: { d: polyPath(flip(REFLECT, 1), true), ...ROUND },
    solid: {
      d: polyPath(flip(REFLECT, -1), true),
      ...ROUND,
      fill: 'currentColor',
    },
  };
}
export const ReflectHorizontalSpec = /* @__PURE__ */ hoverIcon(
  'ReflectHorizontal',
  {
    geo: ({ h }) => reflectShapes(h, false),
    static: /* @__PURE__ */ carbonArt(ReflectHorizontal32),
  }
);
// Carbon's vertical icon is the horizontal one turned so the outline sits on top.
export const ReflectVerticalSpec = /* @__PURE__ */ hoverIcon(
  'ReflectVertical',
  {
    geo: ({ h }) => reflectShapes(h, true),
    static: /* @__PURE__ */ carbonArt(ReflectVertical32),
  }
);

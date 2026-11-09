/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ShieldAlert32 from '@carbon/icons/es/shield--alert/32.js';
import Important32 from '@carbon/icons/es/important/32.js';
import Async32 from '@carbon/icons/es/async/32.js';
import Information16 from '@carbon/icons/es/information/16.js';
import Information32 from '@carbon/icons/es/information/32.js';
import InformationDisabled32 from '@carbon/icons/es/information--disabled/32.js';
import InformationFilled32 from '@carbon/icons/es/information--filled/32.js';
import InformationSquare32 from '@carbon/icons/es/information--square/32.js';
import InformationSquareFilled32 from '@carbon/icons/es/information--square--filled/32.js';
import Warning16 from '@carbon/icons/es/warning/16.js';
import Warning32 from '@carbon/icons/es/warning/32.js';
import WarningAlt16 from '@carbon/icons/es/warning--alt/16.js';
import WarningAlt32 from '@carbon/icons/es/warning--alt/32.js';
import WarningAltFilled32 from '@carbon/icons/es/warning--alt--filled/32.js';
import WarningDiamond32 from '@carbon/icons/es/warning--diamond/32.js';
import WarningDiamondFill32 from '@carbon/icons/es/warning--diamond-fill/32.js';
import WarningFilled16 from '@carbon/icons/es/warning--filled/16.js';
import WarningFilled20 from '@carbon/icons/es/warning--filled/20.js';
import WarningFilled24 from '@carbon/icons/es/warning--filled/24.js';
import WarningFilled32 from '@carbon/icons/es/warning--filled/32.js';
import WarningHex32 from '@carbon/icons/es/warning--hex/32.js';
import WarningHexFilled32 from '@carbon/icons/es/warning--hex--filled/32.js';
import WarningSquare32 from '@carbon/icons/es/warning-square/32.js';
import WarningSquareFilled32 from '@carbon/icons/es/warning-square--filled/32.js';
import {
  carbonArt,
  fillThenClear,
  hoverIcon,
  toggleIcon,
  type CarbonIcon,
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
  kickAmount,
  slashChange,
  slashShapes,
  type SlashToggleSpec,
} from '../../utils/slashToggle';

/**
 * Status alerts (no reference animations). They follow WarningAlt: on hover the container grows at
 * constant line weight (rings and discs 1px, polygons 1px out along every
 * edge, the triangle 14% about its centroid), and the "!" or "i" grows with
 * it: its positions scale by GLYPH_GROW about the
 * glyph's visual centre while bars keep their width and dots their size.
 *
 * Toggles are outline ↔ filled with the house disc fill (§7.7): a disc
 * grows from the container's centre, then a hole from the same centre
 * empties it. The glyph shares the fill's even-odd path, so wherever the
 * fill covers it, it becomes a knockout. The filled icons' knockout glyphs
 * are a touch wider than the outline glyphs, so the glyph eases between the
 * two as the fill comes in.
 *
 * Rest states match Carbon within 0.5%; dots are arc paths (a `<circle>`
 * rasterises differently from Carbon's). Warning and Information use
 * Carbon's 16/20/24px drawings where they exist, expressed in 32px units.
 */

// Re-exported for the status and formatting batches, which import them from here.
import { EVENODD, f, lerp, LINE } from '../../paint';
import {
  arcSeg,
  filletSegs,
  OFF_SHRINK,
  type OffStroke,
  type Slash,
} from '../../off';

const CInformation = /* @__PURE__ */ carbonArt(Information16, Information32);
const CInformationDisabled = /* @__PURE__ */ carbonArt(InformationDisabled32);
const CInformationFilled = /* @__PURE__ */ carbonArt(InformationFilled32);
const CInformationSquare = /* @__PURE__ */ carbonArt(InformationSquare32);
const CInformationSquareFilled = /* @__PURE__ */ carbonArt(
  InformationSquareFilled32
);
const CWarning = /* @__PURE__ */ carbonArt(Warning16, Warning32);
const CWarningAlt = /* @__PURE__ */ carbonArt(WarningAlt16, WarningAlt32);
const CWarningAltFilled = /* @__PURE__ */ carbonArt(WarningAltFilled32);
const CWarningDiamond = /* @__PURE__ */ carbonArt(WarningDiamond32);
const CWarningDiamondFill = /* @__PURE__ */ carbonArt(WarningDiamondFill32);
const CWarningFilled = /* @__PURE__ */ carbonArt(
  WarningFilled16,
  WarningFilled20,
  WarningFilled24,
  WarningFilled32
);
const CWarningHex = /* @__PURE__ */ carbonArt(WarningHex32);
const CWarningHexFilled = /* @__PURE__ */ carbonArt(WarningHexFilled32);
const CWarningSquare = /* @__PURE__ */ carbonArt(WarningSquare32);
const CWarningSquareFilled = /* @__PURE__ */ carbonArt(WarningSquareFilled32);

export { EVENODD, f, lerp, LINE };
export const C: Pt = [16, 16];

export const dot = ([cx, cy]: Pt, r: number) =>
  `M${f(cx - r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 0 ${f(cx + r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 0 ${f(cx - r)} ${f(cy)}Z`;

/** "!": a bar from x0 to x1, y0 to y1, and a dot of radius r at (16, cy). */
export type Bang = readonly [
  x0: number,
  x1: number,
  y0: number,
  y1: number,
  cy: number,
  r: number,
];
const lerpBang = (a: Bang, b: Bang, t: number) =>
  a.map((v, i) => lerp(v, b[i], t)) as unknown as Bang;
const bang = ([x0, x1, y0, y1, cy, r]: Bang) =>
  rectPath(x0, y0, x1, y1) + dot([16, cy], r);

/**
 * The set-wide glyph growth on hover: every glyph inside
 * a status container ("!", "i", "?", the dash) scales its positions by
 * 1 + GLYPH_GROW about its visual centre, at constant weight: bars lengthen
 * (their width holds) and dots move outward (their size holds).
 */
export const GLYPH_GROW = 0.12;
export const glyphScale = (h: number) => 1 + GLYPH_GROW * h;
/** A "!" scaled by k about its visual centre (the middle of bar top to dot bottom). */
export const scaleBang = ([x0, x1, y0, y1, cy, r]: Bang, k: number): Bang => {
  const c = (y0 + cy + r) / 2;
  const s = (y: number) => c + (y - c) * k;
  return [x0, x1, s(y0), s(y1), s(cy), r];
};
/** The "!" at hover progress h. */
export const bangAt = (b: Bang, h: number) => bang(scaleBang(b, glyphScale(h)));

/** "i": the serifed stem (10 points) and its dot. */
type Eye = { stem: readonly Pt[]; dot: Pt; r: number };
const lerpEye = (a: Eye, b: Eye, t: number): Eye => ({
  stem: a.stem.map(
    (p, i) => [lerp(p[0], b.stem[i][0], t), lerp(p[1], b.stem[i][1], t)] as Pt
  ),
  dot: [lerp(a.dot[0], b.dot[0], t), lerp(a.dot[1], b.dot[1], t)],
  r: lerp(a.r, b.r, t),
});
const eye = (e: Eye) => polyPath(e.stem, true) + dot(e.dot, e.r);
/**
 * An "i" scaled by k about its visual centre (dot top to foot bottom) at
 * constant weight: the serif and foot centrelines move and their ends spread,
 * the stem's edges hold, and the dot keeps its size.
 */
function scaleEye(e: Eye, k: number): Eye {
  const s = e.stem;
  const c = (e.dot[1] - e.r + s[7][1]) / 2;
  const serif = (s[1][1] + s[3][1]) / 2;
  const foot = (s[0][1] + s[7][1]) / 2;
  const shift = (y: number, mid: number) => y + (c + (mid - c) * k) - mid;
  // Points 0, 1, 4, 5 are the stem's edges; 1–4 sit on the serif, the rest on the foot.
  return {
    stem: s.map(
      ([x, y], i): Pt => [
        [0, 1, 4, 5].includes(i) ? x : 16 + (x - 16) * k,
        shift(y, i >= 1 && i <= 4 ? serif : foot),
      ]
    ),
    dot: [e.dot[0], c + (e.dot[1] - c) * k],
    r: e.r,
  };
}
const eyeAt = (e: Eye, h: number) => eye(scaleEye(e, glyphScale(h)));
const EYE: Eye = {
  stem: [
    [17, 22],
    [17, 14],
    [13, 14],
    [13, 16],
    [15, 16],
    [15, 22],
    [12, 22],
    [12, 24],
    [20, 24],
    [20, 22],
  ],
  dot: [16, 9.5],
  r: 1.5,
};
const EYE_FILLED: Eye = {
  stem: [
    [17.125, 21.875],
    [17.125, 13.875],
    [13, 13.875],
    [13, 16.125],
    [14.875, 16.125],
    [14.875, 21.875],
    [12, 21.875],
    [12, 24.125],
    [20, 24.125],
    [20, 21.875],
  ],
  dot: [16, 9.5],
  r: 1.5,
};
const EYE_16: Eye = {
  stem: [
    [17, 22],
    [17, 13],
    [13, 13],
    [13, 15],
    [15, 15],
    [15, 22],
    [12, 22],
    [12, 24],
    [20, 24],
    [20, 22],
  ],
  dot: [16, 8.5],
  r: 1.5,
};

/** The fill (p in, e out) inside a convex shape, sharing an even-odd path with the glyph. */
export const fillWith = (
  shape: readonly Pt[],
  centre: Pt,
  p: number,
  e: number,
  glyph: string
) => ({ d: discFillPath(shape, centre, p, e) + glyph, ...EVENODD });

export type Fill = 'outline' | 'filled';
/* @__NO_SIDE_EFFECTS__ */
export const toggle = (
  name: string,
  statics: readonly [CarbonIcon, CarbonIcon],
  geo: (f: ToggleFrame, size?: number) => Shapes
) =>
  toggleIcon<Fill>(name, {
    states: ['outline', 'filled'],
    statics,
    geo,
    change: fillThenClear,
  });

// ── Circles: Warning, Information ────────────────────────────────────────────

// Per size, in 32px units: the ring's outer radius and weight, and each
// state's glyph. Carbon draws Warning at 16px (both), and WarningFilled at
// 20 and 24px too; elsewhere the 32px drawing scales.
export type CircleArt = { R: [number, number]; w: number; glyph: [Bang, Bang] };
export const WARNING_ART: Record<number, CircleArt> = {
  32: {
    R: [14, 14],
    w: 2,
    glyph: [
      [15, 17, 8, 19, 23.5, 1.5],
      [14.9, 17.1, 8, 19, 23.5, 1.5],
    ],
  },
  16: {
    R: [14, 14],
    w: 2,
    glyph: [
      [15, 17, 8, 18, 22, 1.6],
      [15, 17, 8, 18, 22.8, 1.6],
    ],
  },
  20: {
    R: [14, 14.4],
    w: 2,
    glyph: [
      [15, 17, 8, 19, 23.5, 1.5],
      [14.72, 17.12, 8, 19.2, 24, 1.6],
    ],
  },
  24: {
    R: [14, 14.667],
    w: 2,
    glyph: [
      [15, 17, 8, 19, 23.5, 1.5],
      [14.8, 17.2, 8, 18.667, 24, 1.6],
    ],
  },
};

/** A ring (outline) that the house fill fills, the glyph knocked out of the fill. */
export function circleShapes(
  R: number,
  w: number,
  glyph: string,
  h: number,
  p: number,
  e: number
): Shapes {
  const r = R + h; // hover: the ring (or disc) grows 1px
  return {
    ring: { d: ringPath(C, r - w / 2, w) },
    fill: fillWith(circlePts(C, r - w + 0.5), C, p, e, glyph),
  };
}
function warningShapes({ h, p, e }: ToggleFrame, size = 32): Shapes {
  const a = WARNING_ART[size] ?? WARNING_ART[32];
  return circleShapes(
    lerp(a.R[0], a.R[1], p),
    a.w,
    bangAt(lerpBang(a.glyph[0], a.glyph[1], p), h),
    h,
    p,
    e
  );
}
function informationShapes({ h, p, e }: ToggleFrame, size = 32): Shapes {
  const out = size === 16 ? EYE_16 : EYE;
  return circleShapes(14, 2, eyeAt(lerpEye(out, EYE_FILLED, p), h), h, p, e);
}

export const WarningSpec = /* @__PURE__ */ hoverIcon('Warning', {
  geo: ({ h }, size) => warningShapes({ h, p: 0, e: 0 }, size),
  static: /* @__PURE__ */ carbonArt(Warning16, Warning32),
});
export const WarningFilledSpec = /* @__PURE__ */ hoverIcon('WarningFilled', {
  geo: ({ h }, size) => warningShapes({ h, p: 1, e: 0 }, size),
  static: /* @__PURE__ */ carbonArt(
    WarningFilled16,
    WarningFilled20,
    WarningFilled24,
    WarningFilled32
  ),
});
export const WarningToggleSpec = /* @__PURE__ */ toggle(
  'WarningToggle',
  [CWarning, CWarningFilled],
  warningShapes
);
export const InformationSpec = /* @__PURE__ */ hoverIcon('Information', {
  geo: ({ h }, size) => informationShapes({ h, p: 0, e: 0 }, size),
  static: /* @__PURE__ */ carbonArt(Information16, Information32),
});
export const InformationFilledSpec = /* @__PURE__ */ hoverIcon(
  'InformationFilled',
  {
    geo: ({ h }) => informationShapes({ h, p: 1, e: 0 }),
    static: /* @__PURE__ */ carbonArt(InformationFilled32),
  }
);
export const InformationToggleSpec = /* @__PURE__ */ toggle(
  'InformationToggle',
  [CInformation, CInformationFilled],
  informationShapes
);

// ── Triangle: WarningAlt filled ──────────────────────────────────────────────

// WarningAlt's triangle (2px centreline, round joins), grown
// 14% about its centroid on hover; the "!" grows with it (GLYPH_GROW).
const TRI: Pt[] = [
  [16, 4],
  [3, 29],
  [29, 29],
];
const TRI_BANG: [Bang, Bang] = [
  [15, 17, 12, 21, 24.5, 1.5],
  [14.875, 17.125, 12, 21, 24.5, 1.5],
];
// Carbon draws the outline at 16px separately (as WarningAlt.tsx's ART[16]):
// a slightly smaller triangle with a ~1px line and a shorter "!". Its lines
// aren't uniform (0.92px on the left, 1px along the bottom) and its corners
// are its own curves, so a stroked centreline missed it; at 16px the
// triangle is Carbon's own outline less its inner triangle, kept as corners
// that move rigidly with the centreline (below). TRI_16 is the best-fit
// centreline, in 32px units, that those moves follow. WarningAltFilled has
// no 16px drawing, so the toggle eases from this to the 32px art as it
// fills (each corner's curves to round joins, the inner triangle to the
// 2px line's).
const TRI_16: Pt[] = [
  [15.9562, 3.1424],
  [3.0334, 27],
  [28.8792, 27],
];
const TRI_BANG_16: Bang = [15, 17, 12, 19, 23.2, 1.6];

type Cubic = readonly [Pt, Pt, Pt];
/** One outer corner: where it leaves the previous edge, then its curves to the next edge. */
type Corner = { start: Pt; curves: readonly Cubic[] };
// Carbon's 16/warning--alt.svg in its own 16-unit grid, corners in TRI
// order (apex, bottom left, bottom right), each two cubics.
const WA16_OUTER: Corner[] = [
  {
    start: [7.6, 1.3],
    curves: [
      [
        [7.7, 1],
        [8, 0.9],
        [8.2, 1.1],
      ],
      [
        [8.3, 1.1],
        [8.4, 1.2],
        [8.4, 1.3],
      ],
    ],
  },
  {
    start: [1.5, 14],
    curves: [
      [
        [1.3, 14],
        [1.2, 13.9],
        [1.1, 13.8],
      ],
      [
        [1, 13.6],
        [1, 13.5],
        [1.1, 13.3],
      ],
    ],
  },
  {
    start: [14.9, 13.3],
    curves: [
      [
        [15, 13.5],
        [15, 13.6],
        [14.9, 13.8],
      ],
      [
        [14.9, 13.9],
        [14.7, 14],
        [14.5, 14],
      ],
    ],
  },
];
const WA16_INNER: Pt[] = [
  [8, 2.5],
  [2.3, 13],
  [13.6, 13],
];

/** A round join of radius r at V, from the incoming edge's normal to the outgoing one's, as two cubics. */
function arcCorner(V: Pt, from: Pt, to: Pt, r: number): Corner {
  const a0 = Math.atan2(from[1], from[0]);
  let turn = Math.atan2(to[1], to[0]) - a0;
  while (turn <= 0) {
    turn += 2 * Math.PI;
  } // clockwise on screen
  const k = (4 / 3) * Math.tan(turn / 8) * r;
  const at = (a: number): Pt => [
    V[0] + r * Math.cos(a),
    V[1] + r * Math.sin(a),
  ];
  const quarter = (a: number, b: number): Cubic => {
    const [p, q] = [at(a), at(b)];
    return [
      [p[0] - k * Math.sin(a), p[1] + k * Math.cos(a)],
      [q[0] + k * Math.sin(b), q[1] - k * Math.cos(b)],
      q,
    ];
  };
  return {
    start: at(a0),
    curves: [quarter(a0, a0 + turn / 2), quarter(a0 + turn / 2, a0 + turn)],
  };
}
// The 32px art as the same corners: TRI's 2px line with round joins.
const TRI_OUTER: Corner[] = /* @__PURE__ */ (() => {
  const order = [1, 0, 2]; // clockwise on screen: bottom left, apex, bottom right
  const normal = (a: Pt, b: Pt): Pt => {
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    return [(b[1] - a[1]) / l, -(b[0] - a[0]) / l];
  };
  return TRI.map((V, k) => {
    const i = order.indexOf(k);
    const prev = TRI[order[(i + 2) % 3]];
    const next = TRI[order[(i + 1) % 3]];
    return arcCorner(V, normal(prev, V), normal(V, next), 1);
  });
})();
const TRI_INNER = /* @__PURE__ */ insetPoly(TRI, 1);

const lerpPt = (a: Pt, b: Pt, t: number): Pt => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
];
const pt = ([x, y]: Pt) => `${f(x)} ${f(y)}`;

/**
 * Carbon's 16px warning--alt triangle as one even-odd path, `u` units per
 * Carbon 16px unit (1 in its own 16px grid, 2 in the 32px grid), grown by s
 * about the centreline's centroid at constant line weight: each corner (its
 * outer curves and its inner vertex) moves rigidly with its centreline
 * vertex. p eases it to the 32px art (u = 2 only).
 */
export function warningAlt16Ring(u: number, s: number, p = 0): string {
  const base = TRI_16.map((v, k) => lerpPt(v, TRI[k], p));
  const c = centroid(base);
  // q in 32px units; Carbon's 16px points are doubled into that grid first.
  const move = (k: number, q: Pt): Pt => [
    (q[0] + (s - 1) * (base[k][0] - c[0])) * (u / 2),
    (q[1] + (s - 1) * (base[k][1] - c[1])) * (u / 2),
  ];
  const corner = (k: number) => {
    const a = WA16_OUTER[k];
    const b = TRI_OUTER[k];
    const P = (q16: Pt, q32: Pt) =>
      pt(move(k, lerpPt([q16[0] * 2, q16[1] * 2], q32, p)));
    return `${P(a.start, b.start)}${a.curves.map((cv, j) => `C${cv.map((q, m) => P(q, b.curves[j][m])).join(' ')}`).join('')}`;
  };
  const inner = WA16_INNER.map((q, k) =>
    pt(move(k, lerpPt([q[0] * 2, q[1] * 2], TRI_INNER[k], p)))
  );
  return `M${corner(1)}L${corner(0)}L${corner(2)}ZM${inner.join('L')}Z`;
}

function warningAltShapes({ h, p, e }: ToggleFrame, size = 32): Shapes {
  const small = size === 16;
  const base = small
    ? TRI_16.map(
        ([x, y], i) => [lerp(x, TRI[i][0], p), lerp(y, TRI[i][1], p)] as Pt
      )
    : TRI;
  const grow = lerp(1, 1.14, h);
  const tri = scalePts(base, centroid(base), grow);
  return {
    tri: small
      ? { d: warningAlt16Ring(2, grow, p), ...EVENODD }
      : { d: polyPath(tri, true), ...LINE, strokeLinejoin: 'round' },
    fill: fillWith(
      tri,
      centroid(base),
      p,
      e,
      bangAt(lerpBang(small ? TRI_BANG_16 : TRI_BANG[0], TRI_BANG[1], p), h)
    ),
  };
}
export const WarningAltFilledSpec = /* @__PURE__ */ hoverIcon(
  'WarningAltFilled',
  {
    geo: ({ h }) => warningAltShapes({ h, p: 1, e: 0 }),
    static: /* @__PURE__ */ carbonArt(WarningAltFilled32),
  }
);
export const WarningAltToggleSpec = /* @__PURE__ */ toggle(
  'WarningAltToggle',
  [CWarningAlt, CWarningAltFilled],
  warningAltShapes
);

// ── Diamond, hexagon, square ─────────────────────────────────────────────────

/** A closed polygon with every corner filleted (r=1: outer r=2, inner sharp). */
export function closedFillet(pts: readonly Pt[], r: number): string {
  const n = pts.length;
  const m: Pt = [
    (pts[n - 1][0] + pts[0][0]) / 2,
    (pts[n - 1][1] + pts[0][1]) / 2,
  ];
  return `${filletPath([m, ...pts, m], r)}Z`;
}

// Diamond: the filled icon's diamond is 0.1px smaller than the outline's.
export const diamond = (a: number): Pt[] => [
  [16, 16 - a],
  [16 + a, 16],
  [16, 16 + a],
  [16 - a, 16],
];
const DIAMOND_BANG: Bang = [15, 17, 9, 18, 21.5, 1.5];
function diamondShapes({ h, p, e }: ToggleFrame): Shapes {
  const d = diamond(lerp(13.472, 13.372, p) + Math.SQRT2 * h); // edges move 1px out
  return {
    edge: { d: closedFillet(d, 1), ...LINE },
    fill: fillWith(d, C, p, e, bangAt(DIAMOND_BANG, h)),
  };
}
export const WarningDiamondSpec = /* @__PURE__ */ hoverIcon('WarningDiamond', {
  geo: ({ h }) => diamondShapes({ h, p: 0, e: 0 }),
  static: /* @__PURE__ */ carbonArt(WarningDiamond32),
});
export const WarningDiamondFillSpec = /* @__PURE__ */ hoverIcon(
  'WarningDiamondFill',
  {
    geo: ({ h }) => diamondShapes({ h, p: 1, e: 0 }),
    static: /* @__PURE__ */ carbonArt(WarningDiamondFill32),
  }
);
export const WarningDiamondToggleSpec = /* @__PURE__ */ toggle(
  'WarningDiamondToggle',
  [CWarningDiamond, CWarningDiamondFill],
  (fr) => diamondShapes(fr)
);

// Hexagon: Carbon's inside edge moved out 1px is the centreline (round
// joins give the outer r=1 corners).
const HEX_INSIDE: Pt[] = [
  [9.5742, 5],
  [22.4258, 5],
  [28.8423, 16],
  [22.4258, 27],
  [9.5742, 27],
  [3.1577, 16],
];
const HEX_BANG: [Bang, Bang] = [
  [15, 17, 8, 18, 22.5, 1.5],
  [14.875, 17.125, 8, 19, 23.5, 1.5],
];
function hexShapes({ h, p, e }: ToggleFrame): Shapes {
  const hex = insetPoly(HEX_INSIDE, -1 - h);
  return {
    edge: { d: polyPath(hex, true), ...LINE, strokeLinejoin: 'round' },
    fill: fillWith(
      hex,
      C,
      p,
      e,
      bangAt(lerpBang(HEX_BANG[0], HEX_BANG[1], p), h)
    ),
  };
}
export const WarningHexSpec = /* @__PURE__ */ hoverIcon('WarningHex', {
  geo: ({ h }) => hexShapes({ h, p: 0, e: 0 }),
  static: /* @__PURE__ */ carbonArt(WarningHex32),
});
export const WarningHexFilledSpec = /* @__PURE__ */ hoverIcon(
  'WarningHexFilled',
  {
    geo: ({ h }) => hexShapes({ h, p: 1, e: 0 }),
    static: /* @__PURE__ */ carbonArt(WarningHexFilled32),
  }
);
export const WarningHexToggleSpec = /* @__PURE__ */ toggle(
  'WarningHexToggle',
  [CWarningHex, CWarningHexFilled],
  (fr) => hexShapes(fr)
);

// Square: Carbon's frame (outer r=2, inside square), 1px bigger all round
// on hover.
const SQUARE_BANG: [Bang, Bang] = [
  [15, 17, 9, 18, 21.5, 1.5],
  [14.875, 17.125, 8, 18, 22.5, 1.5],
];
function squareShapes(h: number, p: number, e: number, glyph: string): Shapes {
  const [a, b] = [4 - h, 28 + h];
  return {
    frame: { d: framePath(a, a, b, b) },
    fill: fillWith(
      [
        [a + 1, a + 1],
        [b - 1, a + 1],
        [b - 1, b - 1],
        [a + 1, b - 1],
      ],
      C,
      p,
      e,
      glyph
    ),
  };
}
const warningSquareShapes = ({ h, p, e }: ToggleFrame) =>
  squareShapes(h, p, e, bangAt(lerpBang(SQUARE_BANG[0], SQUARE_BANG[1], p), h));
const informationSquareShapes = ({ h, p, e }: ToggleFrame) =>
  squareShapes(h, p, e, eyeAt(lerpEye(EYE, EYE_FILLED, p), h));
export const WarningSquareSpec = /* @__PURE__ */ hoverIcon('WarningSquare', {
  geo: ({ h }) => warningSquareShapes({ h, p: 0, e: 0 }),
  static: /* @__PURE__ */ carbonArt(WarningSquare32),
});
export const WarningSquareFilledSpec = /* @__PURE__ */ hoverIcon(
  'WarningSquareFilled',
  {
    geo: ({ h }) => warningSquareShapes({ h, p: 1, e: 0 }),
    static: /* @__PURE__ */ carbonArt(WarningSquareFilled32),
  }
);
export const WarningSquareToggleSpec = /* @__PURE__ */ toggle(
  'WarningSquareToggle',
  [CWarningSquare, CWarningSquareFilled],
  (fr) => warningSquareShapes(fr)
);
export const InformationSquareSpec = /* @__PURE__ */ hoverIcon(
  'InformationSquare',
  {
    geo: ({ h }) => informationSquareShapes({ h, p: 0, e: 0 }),
    static: /* @__PURE__ */ carbonArt(InformationSquare32),
  }
);
export const InformationSquareFilledSpec = /* @__PURE__ */ hoverIcon(
  'InformationSquareFilled',
  {
    geo: ({ h }) => informationSquareShapes({ h, p: 1, e: 0 }),
    static: /* @__PURE__ */ carbonArt(InformationSquareFilled32),
  }
);
export const InformationSquareToggleSpec = /* @__PURE__ */ toggle(
  'InformationSquareToggle',
  [CInformationSquare, CInformationSquareFilled],
  (fr) => informationSquareShapes(fr)
);

// ── Shield, important, information off, async ────────────────────────────────

// Shield: a 2px centreline fitted to Carbon (top corners outer r=2, a round
// tip), scaled about the icon centre on hover so it's 2px wider. The
// corner radii and line weight hold; the "!" grows with it (GLYPH_GROW).
function shieldPath(s: number): string {
  const x = (v: number) => f(16 + (v - 16) * s);
  const y = (v: number) => f(16 + (v - 16) * s);
  const [L, R, T] = [x(5), x(27), y(3)];
  return (
    `M16 ${T}H${f(+R - 1)}A1 1 0 0 1 ${R} ${f(+T + 1)}V${y(17)}C${R} ${y(20.8)} ${x(24.95)} ${y(24.1)} ${x(21.786)} ${y(25.824)}` +
    `L16 ${y(29)}L${x(10.214)} ${y(25.824)}C${x(7.05)} ${y(24.1)} ${L} ${y(20.8)} ${L} ${y(17)}V${f(+T + 1)}A1 1 0 0 1 ${f(+L + 1)} ${T}Z`
  );
}
export const ShieldAlertSpec = /* @__PURE__ */ hoverIcon('ShieldAlert', {
  geo: ({ h }) => ({
    shield: {
      d: shieldPath(lerp(1, 24 / 22, h)),
      ...LINE,
      strokeLinejoin: 'round',
    },
    bang: { d: bangAt([15, 17, 7, 18, 22.5, 1.5], h) },
  }),
  static: /* @__PURE__ */ carbonArt(ShieldAlert32),
});

// Important: a bare "!", so the glyph itself grows 2px taller about its
// visual centre (y 8–24 → 7–25), as a scale that keeps the stroke width,
// the dot's size and the 2px gap: the bar lengthens and the dot moves down.
export const ImportantSpec = /* @__PURE__ */ hoverIcon('Important', {
  geo: ({ h }) => {
    const [top, bottom] = [8 - h, 24 + h];
    return { bang: { d: bang([15, 17, top, bottom - 5, bottom - 1.5, 1.5]) } };
  },
  static: /* @__PURE__ */ carbonArt(Important32),
});

// Information off, on the set-wide Off rule: the ring and the "i" shrink to
// 90% about the centre at constant 2px weight, under the slash and Carbon's
// 2px gap above it (a fixed strip), while the slash extends 1px at each end.
//
// InformationOffToggle (Information ⇄ Information off) runs the standard
// slash toggle (utils/slashToggle): the slash draws in from the top right,
// the gap opens behind its head, and the ring and "i" kick 2px left and back
// (View's and Microphone's slash and kick). Information off's "i" has no
// serif and a foot 1px shorter on the left, so as the slash draws in the
// serif retracts into the stem (where the gap covers it) and the foot's left
// end moves in 1px. On hover in the on state it is Information's hover (the
// ring grows 1px, the "i" by GLYPH_GROW); off, the Off rule above.
const INFO_SLASH: Slash = {
  a: [29.2929, 2.7071],
  b: [2.7071, 29.2929],
  gapSide: 1,
  gap: 2,
};
const INFO_OFF: SlashToggleSpec = {
  statics: [CInformation, CInformationDisabled],
  slash: INFO_SLASH,
  kick: [-2, 0],
  centre: C,
  base: () => ({ strokes: [] }),
};
/**
 * The ring and the "i" as 2px centrelines at on-hover progress hOn, with p
 * (0 on, 1 off) easing the "i" to Information off's. Carbon's 16px
 * Information sets the serif and dot 1px higher.
 */
function infoStrokes(
  hOn: number,
  p: number,
  size?: number
): { strokes: OffStroke[]; dotY: number } {
  const small = size === 16;
  const serifY = lerp(small ? 14 : 15, 15, p);
  const dotY = lerp(small ? 8.5 : 9.5, 9.5, p);
  // The glyph's visual centre (dot top to foot bottom) and scale.
  const c = (dotY - 1.5 + 24) / 2;
  const k = glyphScale(hOn);
  const X = (x: number) => 16 + (x - 16) * k;
  const Y = (y: number) => c + (y - c) * k;
  const r = 13 + hOn;
  const strokes: OffStroke[] = [
    [arcSeg(C, r, 0, 180), arcSeg(C, r, 180, 360)],
    filletSegs(
      [
        [X(lerp(12, 13, p)), Y(23)],
        [X(20), Y(23)],
      ],
      0
    ),
    filletSegs(
      [
        [16, Y(23)],
        [16, Y(serifY) - 1],
      ],
      0
    ),
  ];
  // The serif runs into the stem's centre (an overlap, not a butt seam).
  const serifEnd = lerp(X(13), 16, p);
  if (16 - serifEnd > 1e-3) {
    strokes.push(
      filletSegs(
        [
          [serifEnd, Y(serifY)],
          [16, Y(serifY)],
        ],
        0
      )
    );
  }
  return { strokes, dotY: Y(dotY) };
}
function infoOffShapes(fr: ToggleFrame, size?: number): Shapes {
  const { h, p, e } = fr;
  const hOn = h * (1 - p);
  const { dotY } = infoStrokes(hOn, p, size);
  const s = slashShapes(
    {
      ...INFO_OFF,
      base: (on) => ({ strokes: infoStrokes(on, p, size).strokes }),
    },
    fr
  );
  // The dot keeps its size: it moves with the shrink and the kick.
  const k = 1 - OFF_SHRINK * h * p;
  const tx = INFO_OFF.kick[0] * kickAmount(e);
  return {
    fill: s.fill,
    rings: s.rings,
    dot: { d: dot([16 + tx, 16 + (dotY - 16) * k], 1.5) },
    slash: s.slash,
  };
}
export const InformationDisabledSpec = /* @__PURE__ */ hoverIcon(
  'InformationDisabled',
  {
    geo: ({ h }) => infoOffShapes({ h, p: 1, e: 0 }),
    static: /* @__PURE__ */ carbonArt(InformationDisabled32),
  }
);
export const InformationOffToggleSpec = /* @__PURE__ */ toggleIcon<
  'on' | 'off'
>('InformationOffToggle', {
  states: ['on', 'off'],
  statics: INFO_OFF.statics,
  geo: infoOffShapes,
  change: slashChange,
});

// Async: the two arrows sweep 45° anticlockwise, the way they point (half
// of 90°); the "!" holds.
const ASYNC_ARROWS =
  'm23.2156,4h2.7844v-2h-7v6h2v-2.9038c4.2354,1.9346,7,6.1523,7,10.9038,0,6.6167-5.3833,12-12,12v2c7.7197,0,14-6.2803,14-14,0-5.0088-2.6318-9.5122-6.7844-12Z' +
  'M16,4v-2C8.2803,2,2,8.2803,2,16c0,4.9766,2.6074,9.4937,6.7842,12h-2.7842v2h7v-6h-2v2.9033c-4.2634-1.9556-7-6.186-7-10.9033,0-6.6167,5.3833-12,12-12Z';
export const AsyncSpec = /* @__PURE__ */ hoverIcon('Async', {
  geo: ({ h }) => ({
    arrows: { d: ASYNC_ARROWS, transform: `rotate(${f(-45 * h)} 16 16)` },
    bang: { d: bang([15, 17, 9, 18, 21.5, 1.5]) },
  }),
  static: /* @__PURE__ */ carbonArt(Async32),
});

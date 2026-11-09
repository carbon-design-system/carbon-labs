/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Checkmark20 from '@carbon/icons/es/checkmark/20.js';
import Checkmark24 from '@carbon/icons/es/checkmark/24.js';
import Checkmark32 from '@carbon/icons/es/checkmark/32.js';
import CheckmarkDouble32 from '@carbon/icons/es/checkmark--double/32.js';
import CheckmarkFilled16 from '@carbon/icons/es/checkmark--filled/16.js';
import CheckmarkFilled20 from '@carbon/icons/es/checkmark--filled/20.js';
import CheckmarkFilled24 from '@carbon/icons/es/checkmark--filled/24.js';
import CheckmarkFilled32 from '@carbon/icons/es/checkmark--filled/32.js';
import Error32 from '@carbon/icons/es/error/32.js';
import InProgress32 from '@carbon/icons/es/in-progress/32.js';
import Decline32 from '@carbon/icons/es/decline/32.js';
import ErrorFilled16 from '@carbon/icons/es/error--filled/16.js';
import ErrorFilled20 from '@carbon/icons/es/error--filled/20.js';
import ErrorFilled24 from '@carbon/icons/es/error--filled/24.js';
import ErrorFilled32 from '@carbon/icons/es/error--filled/32.js';
import ErrorOutline16 from '@carbon/icons/es/error--outline/16.js';
import ErrorOutline32 from '@carbon/icons/es/error--outline/32.js';
import Help16 from '@carbon/icons/es/help/16.js';
import Help32 from '@carbon/icons/es/help/32.js';
import HelpFilled32 from '@carbon/icons/es/help--filled/32.js';
import Misuse16 from '@carbon/icons/es/misuse/16.js';
import Misuse20 from '@carbon/icons/es/misuse/20.js';
import Misuse24 from '@carbon/icons/es/misuse/24.js';
import Misuse32 from '@carbon/icons/es/misuse/32.js';
import MisuseOutline16 from '@carbon/icons/es/misuse--outline/16.js';
import MisuseOutline32 from '@carbon/icons/es/misuse--outline/32.js';
import Pending32 from '@carbon/icons/es/pending/32.js';
import PendingFilled32 from '@carbon/icons/es/pending--filled/32.js';
import Undefined32 from '@carbon/icons/es/undefined/32.js';
import UndefinedFilled32 from '@carbon/icons/es/undefined--filled/32.js';
import Unknown32 from '@carbon/icons/es/unknown/32.js';
import UnknownFilled32 from '@carbon/icons/es/unknown--filled/32.js';
import {
  carbonArt,
  hoverIcon,
  type Shapes,
  type ToggleFrame,
} from '../../engine';
import {
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
  circleShapes,
  closedFillet,
  diamond,
  dot,
  f,
  fillWith,
  glyphScale,
  lerp,
  toggle,
} from './alerts';

const CErrorFilled = /* @__PURE__ */ carbonArt(
  ErrorFilled16,
  ErrorFilled20,
  ErrorFilled24,
  ErrorFilled32
);
const CErrorOutline = /* @__PURE__ */ carbonArt(ErrorOutline16, ErrorOutline32);
const CHelp = /* @__PURE__ */ carbonArt(Help16, Help32);
const CHelpFilled = /* @__PURE__ */ carbonArt(HelpFilled32);
const CMisuse = /* @__PURE__ */ carbonArt(
  Misuse16,
  Misuse20,
  Misuse24,
  Misuse32
);
const CMisuseOutline = /* @__PURE__ */ carbonArt(
  MisuseOutline16,
  MisuseOutline32
);
const CPending = /* @__PURE__ */ carbonArt(Pending32);
const CPendingFilled = /* @__PURE__ */ carbonArt(PendingFilled32);
const CUndefined = /* @__PURE__ */ carbonArt(Undefined32);
const CUndefinedFilled = /* @__PURE__ */ carbonArt(UndefinedFilled32);
const CUnknown = /* @__PURE__ */ carbonArt(Unknown32);
const CUnknownFilled = /* @__PURE__ */ carbonArt(UnknownFilled32);

/**
 * Status states (no reference animations). As the status alerts (alerts.ts): on hover the container grows at constant line weight
 * (rings and discs 1px, diamonds 1px out along every edge). The "?" and
 * the dash grow with it by GLYPH_GROW at constant weight (alerts.ts), and
 * the misuse × arms reach 2px further at each end. Exceptions follow set patterns: checks grow
 * about their centre (CheckmarkOutline), slashes extend with their ring
 * (the "off" icons), Decline is a trend line (ChartLine's pattern), the
 * in-progress wedge sweeps on, and the pending dots spread.
 *
 * Toggles are outline ↔ filled with the house disc fill, the glyph sharing
 * the fill's even-odd path so it becomes a knockout as the fill passes.
 *
 * Carbon's 16/20/24px drawings are used where they exist, in 32px units.
 */

type Art<T> = { R: [number, number]; glyph: [T, T] };
const pick = <T>(art: Record<number, T>, size = 32): T => art[size] ?? art[32];

// ── Checks ───────────────────────────────────────────────────────────────────

/** The outline of a three-point polyline stroked `w` wide: miter join, butt caps. */
function strokePoly([a, b, c]: readonly Pt[], w: number): Pt[] {
  const normal = (p: Pt, q: Pt): Pt => {
    const l = Math.hypot(q[0] - p[0], q[1] - p[1]);
    return [(-(q[1] - p[1]) * w) / 2 / l, ((q[0] - p[0]) * w) / 2 / l];
  };
  const [n1, n2] = [normal(a, b), normal(b, c)];
  const side = (s: 1 | -1): Pt[] => {
    const [p1, p2]: Pt[] = [
      [a[0] + s * n1[0], a[1] + s * n1[1]],
      [b[0] + s * n1[0], b[1] + s * n1[1]],
    ];
    const [p3, p4]: Pt[] = [
      [b[0] + s * n2[0], b[1] + s * n2[1]],
      [c[0] + s * n2[0], c[1] + s * n2[1]],
    ];
    const den =
      (p1[0] - p2[0]) * (p3[1] - p4[1]) - (p1[1] - p2[1]) * (p3[0] - p4[0]);
    const t =
      ((p1[0] - p3[0]) * (p3[1] - p4[1]) - (p1[1] - p3[1]) * (p3[0] - p4[0])) /
      den;
    return [p1, [p1[0] + t * (p2[0] - p1[0]), p1[1] + t * (p2[1] - p1[1])], p4];
  };
  return [...side(1), ...side(-1).reverse()];
}

// Checkmark: the 2px centreline of Carbon's check (its own 20 and 24px
// drawings too), grown 10% about its visual centre.
const CHECK_ART: Record<number, { pts: Pt[]; w: number }> = {
  32: {
    pts: [
      [4.707, 14.293],
      [13, 22.586],
      [27.293, 8.293],
    ],
    w: 2,
  },
  20: {
    pts: [
      [5.04, 14.8],
      [12.8, 22.56],
      [25.68, 9.68],
    ],
    w: 2.036,
  },
  24: {
    pts: [
      [5.533, 14.8],
      [13.333, 22.6],
      [26.733, 9.133],
    ],
    w: 1.98,
  },
};
export const CHECK_CENTRE: Pt = [16, 15.8];
/** Carbon's check at `size`, its centreline scaled `k` about its visual centre: line weight holds. */
export function checkShape(k: number, size?: number): Shapes[string] {
  const a = pick(CHECK_ART, size);
  return {
    d: polyPath(scalePts(a.pts, CHECK_CENTRE, k)),
    ...LINE,
    strokeWidth: a.w,
    strokeLinejoin: 'miter',
  };
}
export const CheckmarkSpec = /* @__PURE__ */ hoverIcon('Checkmark', {
  geo: ({ h }, size) => ({ check: checkShape(1 + 0.1 * h, size) }),
  static: /* @__PURE__ */ carbonArt(Checkmark20, Checkmark24, Checkmark32),
});

// Double checkmark: each check grows 5% about its own centre (constant
// line weight), the upper check moves 1px straight up and the lower check
// 1px straight down (half of 2px). The lower check's short stub slides along its own
// line so its tip keeps the resting gap to the upper check's long arm: its
// angle and the negative space both hold.
const DOUBLE: Pt[][] = [
  [
    [15.171, 17.172],
    [18, 20],
    [28.606, 9.394],
  ],
  [
    [4.343, 13.343],
    [10, 19],
    [20.606, 8.394],
  ],
];
const DOUBLE_CENTRES: Pt[] = [
  [21.889, 14.697],
  [12.475, 13.697],
];
/** Signed distance from p to the line through a and b. */
const lineDist = (p: Pt, [a, b]: Pt[]) => {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  return ((p[0] - a[0]) * dy - (p[1] - a[1]) * dx) / Math.hypot(dx, dy);
};
const DOUBLE_GAP = lineDist(DOUBLE[0][0], [DOUBLE[1][1], DOUBLE[1][2]]);
export const CheckmarkDoubleSpec = /* @__PURE__ */ hoverIcon(
  'CheckmarkDouble',
  {
    geo: ({ h }) => {
      const [lower, upper] = DOUBLE.map((pts, i) =>
        scalePts(pts, DOUBLE_CENTRES[i], 1 + 0.05 * h).map(
          ([x, y]): Pt => [x, y + (i ? -1 : 1) * h]
        )
      );
      // Slide the stub tip along the stub until it's back at the resting gap.
      const [tip, vertex] = lower;
      const arm = [upper[1], upper[2]];
      const l = Math.hypot(vertex[0] - tip[0], vertex[1] - tip[1]);
      const u: Pt = [(vertex[0] - tip[0]) / l, (vertex[1] - tip[1]) / l];
      const t =
        (DOUBLE_GAP - lineDist(tip, arm)) /
        (lineDist([tip[0] + u[0], tip[1] + u[1]], arm) - lineDist(tip, arm));
      const stub: Pt = [tip[0] + u[0] * t, tip[1] + u[1] * t];
      return {
        a: {
          d: polyPath([stub, lower[1], lower[2]]),
          ...LINE,
          strokeLinejoin: 'miter',
        },
        b: { d: polyPath(upper), ...LINE, strokeLinejoin: 'miter' },
      };
    },
    static: /* @__PURE__ */ carbonArt(CheckmarkDouble32),
  }
);

// Filled checkmark, as CheckmarkToggle's filled state: the disc grows
// 1px and the knocked-out check grows 20% about the set pivot.
const CHECK_PIVOT: Pt = [16.004, 16.148];
export const FILLED_CHECK: Record<
  number,
  { r: number; check: Pt[]; w: number }
> = {
  16: {
    r: 14,
    check: [
      [9.5, 15.8],
      [14, 20.3],
      [22.9, 11.6],
    ],
    w: 2.408,
  },
  20: {
    r: 14.4,
    check: [
      [9.6, 15.68],
      [13.92, 20],
      [22.4, 11.52],
    ],
    w: 2.263,
  },
  24: {
    r: 14.6667,
    check: [
      [9.5333, 15.7333],
      [13.9333, 20.1333],
      [22.6, 11.6667],
    ],
    w: 2.36,
  },
  32: {
    r: 14,
    check: [
      [9.7953, 15.7954],
      [14, 20],
      [22.2079, 11.793],
    ],
    w: 2.25,
  },
};
export const CheckmarkFilledSpec = /* @__PURE__ */ hoverIcon(
  'CheckmarkFilled',
  {
    geo: ({ h }, size) => {
      const a = pick(FILLED_CHECK, size);
      return {
        disc: {
          d:
            dot(C, a.r + h) +
            polyPath(
              strokePoly(scalePts(a.check, CHECK_PIVOT, 1 + 0.2 * h), a.w),
              true
            ),
          ...EVENODD,
        },
      };
    },
    static: /* @__PURE__ */ carbonArt(
      CheckmarkFilled16,
      CheckmarkFilled20,
      CheckmarkFilled24,
      CheckmarkFilled32
    ),
  }
);

// ── Circles: error, misuse, help, pending, in progress ───────────────────────

/** A band `w` wide along the top-left → bottom-right diagonal, `half` long each way from the centre. */
function slash(half: number, w: number): string {
  const k = Math.SQRT1_2;
  const p = (s: number, t: number): Pt => [16 + k * (s + t), 16 + k * (s - t)];
  return polyPath(
    [p(-half, -w / 2), p(half, -w / 2), p(half, w / 2), p(-half, w / 2)],
    true
  );
}

// Error: a ring with a slash right across it. The ring grows 1px and the
// slash extends with it. Carbon's inside edge sits 0.04px off-centre.
export const ErrorSpec = /* @__PURE__ */ hoverIcon('Error', {
  geo: ({ h }) => ({
    ring: { d: dot(C, 14 + h) + dot([15.96, 16.04], 11.97 + h), ...EVENODD },
    slash: { d: slash(13 + h, 2) },
  }),
  static: /* @__PURE__ */ carbonArt(Error32),
});

// Error outline / filled: a shorter slash inside the ring; it extends 1px
// at each end as the ring (or disc) grows. [half length, width] per state.
// Carbon's outline ring here is a touch heavier than its other rings (2.05px;
// 2.1px in the 16px drawing).
const ERROR_ART: Record<number, Art<[number, number]> & { w: number }> = {
  32: {
    R: [14.045, 14],
    w: 2.05,
    glyph: [
      [8.8, 2.2],
      [8.8, 2.2],
    ],
  },
  16: {
    R: [14.05, 14],
    w: 2.1,
    glyph: [
      [8.8, 2.3],
      [8.768, 2.263],
    ],
  },
  20: {
    R: [14.045, 14.4],
    w: 2.05,
    glyph: [
      [8.8, 2.2],
      [9.051, 2.263],
    ],
  },
  24: {
    R: [14.045, 14.667],
    w: 2.05,
    glyph: [
      [8.8, 2.2],
      [9.24, 2.263],
    ],
  },
};
function errorShapes({ h, p, e }: ToggleFrame, size?: number): Shapes {
  const a = pick(ERROR_ART, size);
  const [g0, g1] = a.glyph;
  return circleShapes(
    lerp(a.R[0], a.R[1], p),
    a.w,
    slash(lerp(g0[0], g1[0], p) + h, lerp(g0[1], g1[1], p)),
    h,
    p,
    e
  );
}
export const ErrorOutlineSpec = /* @__PURE__ */ hoverIcon('ErrorOutline', {
  geo: ({ h }, size) => errorShapes({ h, p: 0, e: 0 }, size),
  static: /* @__PURE__ */ carbonArt(ErrorOutline16, ErrorOutline32),
});
export const ErrorFilledSpec = /* @__PURE__ */ hoverIcon('ErrorFilled', {
  geo: ({ h }, size) => errorShapes({ h, p: 1, e: 0 }, size),
  static: /* @__PURE__ */ carbonArt(
    ErrorFilled16,
    ErrorFilled20,
    ErrorFilled24,
    ErrorFilled32
  ),
});
export const ErrorToggleSpec = /* @__PURE__ */ toggle(
  'ErrorToggle',
  [CErrorOutline, CErrorFilled],
  errorShapes
);

// Misuse: a × in a ring or disc. The container grows 1px and each arm
// reaches 2px further at each end, its width constant (the set-wide rule
// for plus, minus and close arms, as Close). [arm reach, half width] per
// state, along the axes: √2 there is 2px along the diagonal.
const cross = (a: number, t: number): string => {
  const q: Pt[] = [
    [a - t, a],
    [0, t],
    [-(a - t), a],
    [-a, a - t],
    [-t, 0],
    [-a, -(a - t)],
    [-(a - t), -a],
    [0, -t],
    [a - t, -a],
    [a, -(a - t)],
    [t, 0],
    [a, a - t],
  ];
  return polyPath(
    q.map(([x, y]): Pt => [16 + x, 16 + y]),
    true
  );
};
const MISUSE_ART: Record<number, Art<[number, number]>> = {
  32: {
    R: [14, 14],
    glyph: [
      [7, 1.6],
      [7, 1.6],
    ],
  },
  16: {
    R: [14, 14],
    glyph: [
      [7, 1.6],
      [7, 1.6],
    ],
  },
  20: {
    R: [14, 14.4],
    glyph: [
      [7, 1.6],
      [7.2, 1.6],
    ],
  },
  24: {
    R: [14, 14.667],
    glyph: [
      [7, 1.6],
      [7.333, 1.733],
    ],
  },
};
function misuseShapes({ h, p, e }: ToggleFrame, size?: number): Shapes {
  const a = pick(MISUSE_ART, size);
  const [g0, g1] = a.glyph;
  return circleShapes(
    lerp(a.R[0], a.R[1], p),
    2,
    cross(lerp(g0[0], g1[0], p) + Math.SQRT2 * h, lerp(g0[1], g1[1], p)),
    h,
    p,
    e
  );
}
export const MisuseOutlineSpec = /* @__PURE__ */ hoverIcon('MisuseOutline', {
  geo: ({ h }, size) => misuseShapes({ h, p: 0, e: 0 }, size),
  static: /* @__PURE__ */ carbonArt(MisuseOutline16, MisuseOutline32),
});
export const MisuseSpec = /* @__PURE__ */ hoverIcon('Misuse', {
  geo: ({ h }, size) => misuseShapes({ h, p: 1, e: 0 }, size),
  static: /* @__PURE__ */ carbonArt(Misuse16, Misuse20, Misuse24, Misuse32),
});
export const MisuseToggleSpec = /* @__PURE__ */ toggle(
  'MisuseToggle',
  [CMisuseOutline, CMisuse],
  misuseShapes
);

// Help: the "?" holds while the ring or disc grows 1px. The filled icon's
// knockout "?" is drawn a touch heavier, so the glyph switches to it once
// the fill is complete (a 0.1px change).
const HELP =
  'M17,8H15.5A4.49,4.49,0,0,0,11,12.5V13h2v-.5A2.5,2.5,0,0,1,15.5,10H17a2.5,2.5,0,0,1,0,5H15v4.5h2V17a4.5,4.5,0,0,0,0-9Z' +
  /* @__PURE__ */ dot([16, 23.5], 1.5);
const HELP_16 =
  'M17,8H15.6C13,8,11,10,11,12.4c0,0,0,0,0,0v0.4h2V12.4C13,11.2,14.2,10,15.6,10h1.6c1.4,0,2.4,1.2,2.4,2.4S18.4,15,17,15h-2v4.4h2V17c2.4,0,4.4-2,4.4-4.4S19.4,8,17,8z' +
  /* @__PURE__ */ dot([16, 23.6], 1.6);
const HELP_FILLED =
  'M17.1421,17.246v2.5014h-2.25V15h2.125a2.3763,2.3763,0,0,0,0-4.7526h-1.5a2.3777,2.3777,0,0,0-2.375,2.375V13.26h-2.25v-.6377A4.6279,4.6279,0,0,1,15.5171,8h1.5a4.6238,4.6238,0,0,1,.125,9.246Z' +
  /* @__PURE__ */ dot([16, 23.5], 1.5);
const helpShapes = ({ h, p, e }: ToggleFrame, size?: number) =>
  circleShapes(
    14,
    2,
    p >= 1 ? HELP_FILLED : size === 16 ? HELP_16 : HELP,
    h,
    p,
    e
  );
export const HelpSpec = /* @__PURE__ */ hoverIcon('Help', {
  geo: ({ h }, size) => helpShapes({ h, p: 0, e: 0 }, size),
  static: /* @__PURE__ */ carbonArt(Help16, Help32),
});
export const HelpFilledSpec = /* @__PURE__ */ hoverIcon('HelpFilled', {
  geo: ({ h }) => helpShapes({ h, p: 1, e: 0 }),
  static: /* @__PURE__ */ carbonArt(HelpFilled32),
});
export const HelpToggleSpec = /* @__PURE__ */ toggle(
  'HelpToggle',
  [CHelp, CHelpFilled],
  helpShapes
);

// Pending: the ring or disc grows 1px and the outer two dots move 1px
// outward; the middle dot holds. The filled icon spaces its dots 1px wider.
function pendingShapes({ h, p, e }: ToggleFrame): Shapes {
  const gap = lerp(7, 8, p) + h;
  const dots = [-1, 0, 1].map((k) => dot([16 + k * gap, 16], 2)).join('');
  return circleShapes(14, 2, dots, h, p, e);
}
export const PendingSpec = /* @__PURE__ */ hoverIcon('Pending', {
  geo: ({ h }) => pendingShapes({ h, p: 0, e: 0 }),
  static: /* @__PURE__ */ carbonArt(Pending32),
});
export const PendingFilledSpec = /* @__PURE__ */ hoverIcon('PendingFilled', {
  geo: ({ h }) => pendingShapes({ h, p: 1, e: 0 }),
  static: /* @__PURE__ */ carbonArt(PendingFilled32),
});
export const PendingToggleSpec = /* @__PURE__ */ toggle(
  'PendingToggle',
  [CPending, CPendingFilled],
  (fr) => pendingShapes(fr)
);

// In progress: the ring grows 1px and the wedge sweeps 60° further round.
export function pie(
  r: number,
  from: number,
  to: number,
  [cx, cy]: Pt = C
): string {
  const p = (deg: number) =>
    `${f(cx + r * Math.cos((deg * Math.PI) / 180))} ${f(cy + r * Math.sin((deg * Math.PI) / 180))}`;
  return `M${f(cx)} ${f(cy)}L${p(from)}A${f(r)} ${f(r)} 0 ${to - from > 180 ? 1 : 0} 1 ${p(to)}Z`;
}
export const InProgressSpec = /* @__PURE__ */ hoverIcon('InProgress', {
  geo: ({ h }) => ({
    ring: { d: ringPath(C, 13 + h, 2) },
    wedge: { d: pie(12.5 + h, -90, 45 + 60 * h) },
  }),
  static: /* @__PURE__ */ carbonArt(InProgress32),
});

// ── Diamonds: undefined, unknown ─────────────────────────────────────────────

// As WarningDiamond: the diamond grows 1px out along every edge, and the
// dash or "?" grows by GLYPH_GROW about its visual centre at constant weight.
// The dash keeps its 4px height and lengthens; the "?" is its centreline
// (stem, two arcs of radius 3, tail) scaled, outlined at its own width, and
// its dot moves down at constant size.
const dash = (h: number) => {
  const half = 5 * glyphScale(h);
  return rectPath(16 - half, 14, 16 + half, 18);
};
/** A "?": its line width, the hook's centre height, the stem's foot and the tail's end. */
type Q = { w: number; cy: number; foot: number; tail: number };
const UNKNOWN: Q = { w: 2, cy: 13, foot: 19, tail: 13.5 };
const UNKNOWN_FILLED: Q = { w: 2.25, cy: 13.125, foot: 19.125, tail: 13.625 };
function question({ w, cy, foot, tail }: Q, h: number): string {
  const k = glyphScale(h);
  // Visual centre: the middle of the glyph's box (x 11–21, y 9–24).
  const Y = (y: number) => 16.5 + (y - 16.5) * k;
  const [rx, lx, ry, rho, hw] = [16 + k, 16 - k, Y(cy), 3 * k, w / 2];
  const [ri, ro] = [rho - hw, rho + hw];
  const A = (r: number, sweep: 0 | 1, x: number, y: number) =>
    `A${f(r)} ${f(r)} 0 0 ${sweep} ${f(x)} ${f(y)}`;
  return (
    `M${f(16 + hw)} ${f(Y(foot))}H${f(16 - hw)}V${f(ry + ri)}H${f(rx)}` +
    A(ri, 0, rx + ri, ry) +
    A(ri, 0, rx, ry - ri) +
    `H${f(lx)}` +
    A(ri, 0, lx - ri, ry) +
    `V${f(Y(tail))}H${f(lx - ro)}V${f(ry)}` +
    A(ro, 1, lx, ry - ro) +
    `H${f(rx)}` +
    A(ro, 1, rx + ro, ry) +
    A(ro, 1, rx, ry + ro) +
    `H${f(16 + hw)}Z` +
    dot([16, Y(22.5)], 1.5)
  );
}
function diamondShapes({ h, p, e }: ToggleFrame, glyph: string): Shapes {
  const d = diamond(13.45 + Math.SQRT2 * h);
  return {
    edge: { d: closedFillet(d, 1), ...LINE },
    fill: fillWith(d, C, p, e, glyph),
  };
}
const unknownShapes = (fr: ToggleFrame) =>
  diamondShapes(fr, question(fr.p >= 1 ? UNKNOWN_FILLED : UNKNOWN, fr.h));
export const UndefinedSpec = /* @__PURE__ */ hoverIcon('Undefined', {
  geo: ({ h }) => diamondShapes({ h, p: 0, e: 0 }, dash(h)),
  static: /* @__PURE__ */ carbonArt(Undefined32),
});
export const UndefinedFilledSpec = /* @__PURE__ */ hoverIcon(
  'UndefinedFilled',
  {
    geo: ({ h }) => diamondShapes({ h, p: 1, e: 0 }, dash(h)),
    static: /* @__PURE__ */ carbonArt(UndefinedFilled32),
  }
);
export const UndefinedToggleSpec = /* @__PURE__ */ toggle(
  'UndefinedToggle',
  [CUndefined, CUndefinedFilled],
  (fr) => diamondShapes(fr, dash(fr.h))
);
export const UnknownSpec = /* @__PURE__ */ hoverIcon('Unknown', {
  geo: ({ h }) => unknownShapes({ h, p: 0, e: 0 }),
  static: /* @__PURE__ */ carbonArt(Unknown32),
});
export const UnknownFilledSpec = /* @__PURE__ */ hoverIcon('UnknownFilled', {
  geo: ({ h }) => unknownShapes({ h, p: 1, e: 0 }),
  static: /* @__PURE__ */ carbonArt(UnknownFilled32),
});
export const UnknownToggleSpec = /* @__PURE__ */ toggle(
  'UnknownToggle',
  [CUnknown, CUnknownFilled],
  unknownShapes
);

// ── Decline ──────────────────────────────────────────────────────────────────

// A falling trend line with an arrowhead, so it moves as ChartLine and
// Analytics do: the two middle points slide 2px along the first segment's
// angle, and the end, with the head, extends 4px along the last segment's.
const DECLINE: Pt[] = [
  [3, 7],
  [13, 17],
  [18, 12],
  [29, 23],
];
const DECLINE_HEAD: Pt[] = [
  [29, 14],
  [29, 23],
  [20, 23],
];
export const DeclineSpec = /* @__PURE__ */ hoverIcon('Decline', {
  geo: ({ h }) => {
    const k = Math.SQRT1_2;
    const v: Pt = [2 * h * k, 2 * h * k]; // both the first and last segments run down-right at 45°
    const end: Pt = [4 * h * k, 4 * h * k];
    const mv = (p: Pt, d: Pt): Pt => [p[0] + d[0], p[1] + d[1]];
    return {
      line: {
        d: polyPath([
          DECLINE[0],
          mv(DECLINE[1], v),
          mv(DECLINE[2], v),
          mv(DECLINE[3], end),
        ]),
        ...LINE,
        strokeLinejoin: 'round',
      },
      head: {
        d: polyPath(DECLINE_HEAD.map((p) => mv(p, end))),
        ...LINE,
        strokeLinejoin: 'miter',
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(Decline32),
});

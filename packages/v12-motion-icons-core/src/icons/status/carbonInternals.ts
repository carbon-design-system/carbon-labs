/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Undo32 from '@carbon/icons/es/undo/32.js';
import Calendar32 from '@carbon/icons/es/calendar/32.js';
import CircleDash32 from '@carbon/icons/es/circle-dash/32.js';
import Incomplete32 from '@carbon/icons/es/incomplete/32.js';
import Checkbox32 from '@carbon/icons/es/checkbox/32.js';
import CheckboxChecked32 from '@carbon/icons/es/checkbox--checked/32.js';
import CheckboxCheckedFilled32 from '@carbon/icons/es/checkbox--checked--filled/32.js';
import CheckboxIndeterminate32 from '@carbon/icons/es/checkbox--indeterminate/32.js';
import CheckboxIndeterminateFilled32 from '@carbon/icons/es/checkbox--indeterminate--filled/32.js';
import AiLabel32 from '@carbon/icons/es/ai-label/32.js';
import {
  defineAction,
  hoverIcon,
  type Shapes,
  type ToggleFrame,
  carbonArt,
} from '../../engine';
import { OUT_BACK, outAndBack } from '../../actionGeo';
import {
  circlePts,
  clipConvex,
  discFillPath,
  mapPath,
  polyPath,
  rectPath,
  roundedRectPath,
  scalePts,
  type Pt,
} from '../../geometry';
import { EVENODD, MITER, f, lerp } from '../../paint';
import { ENTRANCE, EXIT } from '../../ease';
import { strokePoly } from '../toggle/checkToggles';

/**
 * Icons Carbon's own React components draw (Checkbox, DatePicker,
 * ProgressIndicator, InlineLoading, AILabel, …) that the set didn't cover.
 * No reference sources: each motion follows the house rules or reuses a shipped
 * icon's. Carbon draws all of these at 32px only, so one drawing serves every
 * size. Every wall is rebuilt at its own weight as the geometry moves: nothing
 * is scaled or masked.
 *
 *  - Undo: Redo mirrored. The head reaches 4px left along its straight shaft
 *    (a standalone arrow), the shaft lengthening behind it.
 *  - Calendar: the page grows 2px on every side (the container rule). The
 *    header (its divider and the binding rings) rides up with the top edge,
 *    so the rings still stand 2px proud of the page and 2px into the header;
 *    the rings also step 1px apart, keeping their place along the wider top.
 *  - Circle dash: the dashed ring grows 2px in radius and the dashes turn
 *    40.4° clockwise (Incomplete's angle); each keeps its 18° length.
 *  - Incomplete: the half disc grows 2px in radius (its flat edge holds on
 *    the centre line); its dashes ride out 2px and turn one pitch (40.4°)
 *    clockwise as if a full ring ran on behind the disc, cut where they
 *    meet its flat edge, ending on four whole, even dashes.
 *  - Checkbox family: the box grows 2px on every side. The check grows 20%
 *    about its centre, as CheckmarkFilled's (the same check: Carbon's
 *    checkbox check is checkmark--filled's knockout); the indeterminate bar
 *    reaches 2px further at each end, as Subtract's (the set's minus rule).
 *  - AI label: the box grows 1px on every side (it's the full 32px frame, so
 *    it overflows by 1px; IconSvg allows it) and the letters hold.
 *
 * Standard hover timing throughout (160ms entrance in, 120ms exit out).
 */

const C: Pt = [16, 16];

/** How far containers grow on hover (set-wide rule). */
const GROW = 2;

// ── Undo ─────────────────────────────────────────────────────────────────────

// Carbon's undo, absolute: Redo's path mirrored about x = 16. The head's
// points (left of x = 19, above y = 17) move; the rest hold.
const UNDO =
  'M20 10H7.8149L11.4023 6.4141L10 5L4 11L10 17L11.4023 15.5854L7.8179 12H20A6 6 0 0 1 20 24H12V26H20A8 8 0 0 0 20 10Z';
const UNDO_REACH = 4;
/**
 * The action's sweep: the
 * head runs out until its tip (x 4) is on the box's edge (−2), and the tail end draws in as far, so the line slides along itself.
 */
export const UNDO_SWEEP = 6;
/** The arrow with its head `head` px left and its tail end (the bottom bar's, at x 12) `tail` px along toward the arc. */
const undoArrow = (head: number, tail: number) =>
  mapPath(UNDO, ([x, y]) =>
    x < 19 && y <= 17
      ? [x - head, y]
      : x === 12 && y >= 24
        ? [x + tail, y]
        : [x, y]
  );
export const UndoSpec = /* @__PURE__ */ hoverIcon('Undo', {
  geo: ({ h }) => ({
    arrow: {
      d: mapPath(UNDO, ([x, y]) =>
        x < 19 && y <= 17 ? [x - UNDO_REACH * h, y] : [x, y]
      ),
    },
  }),
  static: /* @__PURE__ */ carbonArt(Undo32),
  action: /* @__PURE__ */ defineAction({
    description:
      'Undone: the arrow sweeps back along its own path, then sweeps forward and lands.',
    duration: OUT_BACK,
    geo: ({ h, a }) => {
      const s = a <= 0 || a >= 1 ? 0 : UNDO_SWEEP * outAndBack(a);
      return {
        arrow: {
          d: s
            ? undoArrow(Math.max(UNDO_REACH * h, s), s)
            : undoArrow(UNDO_REACH * h, 0),
        },
      };
    },
  }),
});

// ── Calendar ─────────────────────────────────────────────────────────────────

// Carbon's calendar: the page 4–28 (outer corners r 2, a 2px wall), the
// header's inside y 6–10, the divider y 10–12, the body's inside below, and
// two 2px rings at x 10–12 and 20–22 from y 2 to 8.
export const CalendarSpec = /* @__PURE__ */ hoverIcon('Calendar', {
  geo: ({ h }) => {
    const g = GROW * h;
    const [lo, hi] = [4 - g, 28 + g];
    const [x0, x1] = [lo + 2, hi - 2];
    const ring = (x: number) => rectPath(x, lo - 2, x + 2, lo + 4);
    return {
      page: {
        d:
          roundedRectPath(lo, lo, hi, hi, 2) +
          rectPath(x0, lo + 2, x1, lo + 6) +
          rectPath(x0, lo + 8, x1, hi - 2),
        ...EVENODD,
      },
      rings: { d: ring(10 - h) + ring(20 + h) },
    };
  },
  static: /* @__PURE__ */ carbonArt(Calendar32),
});

// ── Circle dash, Incomplete ──────────────────────────────────────────────────

/**
 * A dash: Carbon's four corners (outer start, outer end, inner end, inner
 * start). Its ends are radial cuts on the band r 12–14 (to within Carbon's
 * ±0.08px drawing). On hover every corner moves `g` straight out from the
 * centre and turns `rot`° clockwise about it, so the dash keeps its angular
 * length and its 2px width. With `clip`, the dash is cut to that range of
 * angles (radial cuts at the bounds): geometry, not a mask.
 */
export type Dash = readonly [Pt, Pt, Pt, Pt];
type Polar = { r: number; a: number };
const DEG = Math.PI / 180;
function dash(
  corners: Dash,
  g: number,
  rot = 0,
  clip?: readonly [number, number]
): string {
  const pol = corners.map(
    ([x, y]): Polar => ({
      r: Math.hypot(x - C[0], y - C[1]) + g,
      a: Math.atan2(y - C[1], x - C[0]) / DEG + rot,
    })
  );
  // Every angle within half a turn of the first (no jump across ±180°).
  const a0 = pol[0].a;
  let [o0, o1, i1, i0] = pol.map((q) => ({
    r: q.r,
    a: a0 + ((((q.a - a0 + 180) % 360) + 360) % 360) - 180,
  }));
  // Run each dash clockwise (increasing angle), keeping each end's outer and inner corners paired.
  if (o1.a < o0.a) {
    [o0, o1, i1, i0] = [o1, o0, i0, i1];
  }
  if (clip) {
    const [lo, hi] = clip;
    if (o1.a <= lo || o0.a >= hi || i1.a <= lo || i0.a >= hi) {
      return '';
    }
    const at = (q: Polar, a: number): Polar => ({ r: q.r, a });
    if (o0.a < lo || i0.a < lo) {
      [o0, i0] = [at(o0, lo), at(i0, lo)];
    }
    if (o1.a > hi || i1.a > hi) {
      [o1, i1] = [at(o1, hi), at(i1, hi)];
    }
  }
  const P = ({ r, a }: Polar) =>
    `${f(C[0] + r * Math.cos(a * DEG))} ${f(C[1] + r * Math.sin(a * DEG))}`;
  const R = (u: Polar, v: Polar) => f((u.r + v.r) / 2);
  return `M${P(o0)}A${R(o0, o1)} ${R(o0, o1)} 0 0 1 ${P(o1)}L${P(i1)}A${R(i1, i0)} ${R(i1, i0)} 0 0 0 ${P(i0)}Z`;
}

/**
 * How far the dashes turn on hover, clockwise: one of Incomplete's dash
 * pitches, so four dashes show evenly (CircleDash uses the same angle, as
 * its related icon). Turning a whole pitch moves
 * every dash on by exactly one slot: the dash behind the disc comes out
 * whole into the top slot as the bottom one goes whole behind the disc, so
 * the hovered state is four whole, evenly spaced dashes with no stub at
 * either cut. Carbon's dashes repeat every 39.76°, but its gaps at the flat
 * edge are 0.6° wider than the others, so the hidden dash needs at least
 * 40.34° to sit wholly behind the disc at rest; 40.4° keeps a small margin.
 * The hovered gaps then run 19.6–20.5° (Carbon's own run 19.7–20.4°).
 */
export const DASH_TURN = 40.4;

// Carbon's ten dashes: 18° each, 36° apart, starting on the axes. Hover:
// the ring grows 2px in radius and the dashes turn DASH_TURN (40.4°)
// clockwise, Incomplete's angle.
export const CIRCLE_DASHES: Dash[] = [
  [
    [7.7, 4.7],
    [4.7, 7.8],
    [6.3, 9],
    [8.9, 6.3],
  ],
  [
    [2.7, 11.7],
    [2, 16],
    [4, 16],
    [4.6, 12.3],
  ],
  [
    [2.7, 20.4],
    [4.7, 24.3],
    [6.3, 23.1],
    [4.6, 19.8],
  ],
  [
    [7.8, 27.3],
    [11.7, 29.3],
    [12.3, 27.4],
    [9, 25.7],
  ],
  [
    [11.7, 2.7],
    [16, 2],
    [16, 4],
    [12.3, 4.6],
  ],
  [
    [24.2, 27.3],
    [27.3, 24.2],
    [25.7, 23],
    [23, 25.7],
  ],
  [
    [29.3, 20.3],
    [30, 16],
    [28, 16],
    [27.4, 19.7],
  ],
  [
    [29.2, 11.6],
    [27.2, 7.7],
    [25.6, 8.9],
    [27.3, 12.2],
  ],
  [
    [24.1, 4.6],
    [20.2, 2.6],
    [19.6, 4.5],
    [22.9, 6.2],
  ],
  [
    [20.3, 29.3],
    [16, 30],
    [16, 28],
    [19.7, 27.4],
  ],
];
export const CircleDashSpec = /* @__PURE__ */ hoverIcon('CircleDash', {
  geo: ({ h }) => ({
    dashes: {
      d: CIRCLE_DASHES.map((c) => dash(c, GROW * h, DASH_TURN * h)).join(''),
    },
  }),
  static: /* @__PURE__ */ carbonArt(CircleDash32),
});

// Incomplete: the left half disc (r 14) and Carbon's four dashes on the
// right half, on the same band (20° on, 20° off). Hover: the half disc
// grows 2px in radius with its flat edge held, and the dashes ride out 2px
// and turn one pitch clockwise (DASH_TURN) as if a full ring of dashes ran
// on behind the disc: each is cut at the flat edge (±90°) as it passes it,
// and the one behind the disc (Carbon's first dash turned back a pitch)
// comes out at the top.
export const INCOMPLETE_DASHES: Dash[] = [
  [
    [25.0493, 5.3278],
    [20.8672, 2.887],
    [20.1836, 4.7646],
    [23.7642, 6.8593],
  ],
  [
    [29.7777, 13.5872],
    [28.14, 9.0457],
    [26.4087, 10],
    [27.81, 14],
  ],
  [
    [20.8672, 29.113],
    [25.0493, 26.6722],
    [23.7642, 25.1407],
    [20.1836, 27.2354],
  ],
  [
    [28.14, 23],
    [29.7777, 18.4128],
    [27.81, 18.0659],
    [26.4087, 22],
  ],
];
const turnPt = ([x, y]: Pt, deg: number): Pt => {
  const [c, s] = [Math.cos(deg * DEG), Math.sin(deg * DEG)];
  return [
    C[0] + (x - C[0]) * c - (y - C[1]) * s,
    C[1] + (x - C[0]) * s + (y - C[1]) * c,
  ];
};
export const BEHIND = INCOMPLETE_DASHES[0].map((q) =>
  turnPt(q, -DASH_TURN)
) as unknown as Dash;
const DASHED_SIDE = [-90, 90] as const;
export const IncompleteSpec = /* @__PURE__ */ hoverIcon('Incomplete', {
  geo: ({ h }) => {
    const r = 14 + GROW * h;
    return {
      half: {
        d: `M16 ${f(16 + r)}V${f(16 - r)}A${f(r)} ${f(r)} 0 0 0 16 ${f(16 + r)}Z`,
      },
      dashes: {
        d: [BEHIND, ...INCOMPLETE_DASHES]
          .map((c) => dash(c, GROW * h, DASH_TURN * h, DASHED_SIDE))
          .join(''),
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(Incomplete32),
});

// ── Checkbox family ──────────────────────────────────────────────────────────

/** The box's outer edge at hover h: 4–28 at rest, 2px further out on every side when hovered. */
const boxEdge = (h: number) => [4 - GROW * h, 28 + GROW * h] as const;
/** Carbon's box: outer corners r 2, a square inside, 2px wall. */
const frame = (h: number) => {
  const [lo, hi] = boxEdge(h);
  return (
    roundedRectPath(lo, lo, hi, hi, 2) +
    rectPath(lo + 2, lo + 2, hi - 2, hi - 2)
  );
};
/** The box's inside, for the fill. */
const inside = (h: number): Pt[] => {
  const [lo, hi] = boxEdge(h);
  return [
    [lo + 2, lo + 2],
    [hi - 2, lo + 2],
    [hi - 2, hi - 2],
    [lo + 2, hi - 2],
  ];
};

// The check: checkmark--filled's 32px knockout (Carbon's checkbox draws the
// same check), its centreline 2.25 wide, grown 20% about the set pivot
// on hover (CheckmarkFilled's hover).
export const CHECK: Pt[] = [
  [9.7953, 15.7954],
  [14, 20],
  [22.2079, 11.793],
];
export const CHECK_W = 2.25;
const CHECK_PIVOT: Pt = [16.004, 16.148];
const CHECK_GROW = 0.2;
export const checkPts = (h: number) =>
  scalePts(CHECK, CHECK_PIVOT, 1 + CHECK_GROW * h);

/** `poly` inside the disc of radius r about the centre (empty at r ≤ 0). */
function inDisc(poly: readonly Pt[], r: number): string {
  if (r <= 1e-4) {
    return '';
  }
  const part = clipConvex(poly, circlePts(C, r, 128));
  return part.length > 2 ? polyPath(part, true) : '';
}

/**
 * The box with the house disc fill (p in, e out) and the check knocked out
 * of the fill as it passes, all one even-odd path (so the fill meets the
 * wall with no seam). p = e = 0 is checkbox; p = 1 is checkbox--checked--filled.
 */
export function checkboxFilledShapes({ h, p, e }: ToggleFrame): Shapes {
  const box = inside(h);
  const reach = Math.hypot(box[0][0] - C[0], box[0][1] - C[1]) + 0.5; // as discFillPath's
  const knock = strokePoly(checkPts(h), CHECK_W);
  return {
    box: {
      d:
        frame(h) +
        discFillPath(box, C, p, e) +
        inDisc(knock, reach * p) +
        inDisc(knock, reach * e),
      ...EVENODD,
    },
  };
}

/**
 * The outline box with the check drawn from `e` to `p` along its length
 * (pathLength 1), as CheckmarkOutlineToggle draws its check. p = 1, e = 0 is
 * checkbox--checked.
 */
export function checkboxOutlineShapes({ h, p, e }: ToggleFrame): Shapes {
  return {
    box: { d: frame(h), ...EVENODD },
    check: {
      d: polyPath(checkPts(h)),
      ...MITER,
      strokeWidth: CHECK_W,
      pathLength: 1,
      strokeDasharray: `${Math.max(p - e, 0)} 2`,
      strokeDashoffset: -e || 0,
    },
  };
}

export const CheckboxSpec = /* @__PURE__ */ hoverIcon('Checkbox', {
  geo: ({ h }) => checkboxFilledShapes({ h, p: 0, e: 0 }),
  static: /* @__PURE__ */ carbonArt(Checkbox32),
});
export const CheckboxCheckedSpec = /* @__PURE__ */ hoverIcon(
  'CheckboxChecked',
  {
    geo: ({ h }) => checkboxOutlineShapes({ h, p: 1, e: 0 }),
    static: /* @__PURE__ */ carbonArt(CheckboxChecked32),
  }
);
export const CheckboxCheckedFilledSpec = /* @__PURE__ */ hoverIcon(
  'CheckboxCheckedFilled',
  {
    geo: ({ h }) => checkboxFilledShapes({ h, p: 1, e: 0 }),
    static: /* @__PURE__ */ carbonArt(CheckboxCheckedFilled32),
  }
);

// Indeterminate: Carbon's bar is x 10–22, y 14–18; on hover each end reaches
// 2px further and its 4px height holds.
const bar = (h: number) => rectPath(10 - GROW * h, 14, 22 + GROW * h, 18);
export const CheckboxIndeterminateSpec = /* @__PURE__ */ hoverIcon(
  'CheckboxIndeterminate',
  {
    geo: ({ h }) => ({ box: { d: frame(h), ...EVENODD }, bar: { d: bar(h) } }),
    static: /* @__PURE__ */ carbonArt(CheckboxIndeterminate32),
  }
);
export const CheckboxIndeterminateFilledSpec = /* @__PURE__ */ hoverIcon(
  'CheckboxIndeterminateFilled',
  {
    geo: ({ h }) => {
      const [lo, hi] = boxEdge(h);
      return {
        box: { d: roundedRectPath(lo, lo, hi, hi, 2) + bar(h), ...EVENODD },
      };
    },
    static: /* @__PURE__ */ carbonArt(CheckboxIndeterminateFilled32),
  }
);

// ── Checkbox states: unchecked, indeterminate, checked ──────────────────────

/**
 * The three checkbox states as one geometry, for the state toggles
 * (checkboxToggles.ts). Frame: `h` hover; `p` and `e` the glyph's way in and
 * out (filled: the fill disc and its hole; outline: the drawn end and wiped
 * start, as the two-state toggles); `k` the match cut between the bar
 * (k = 0) and the check (k = 1), as Play ⇄ Pause: the outgoing glyph shrinks
 * on the exit ease until the cut at 6/15, then the incoming glyph appears at
 * that small size and grows to full on the entrance ease. The bar loses 4px
 * at each end (12px → 4px long, its 4px height held); the check shrinks to
 * the same 4px width about its pivot, at constant weight.
 *
 * At k = 1 this is the two-state toggles' geometry exactly; the bar is
 * CheckboxIndeterminate's (it reaches 2px further at each end on hover).
 */
export type CheckboxState = 'unchecked' | 'indeterminate' | 'checked';
export type CheckboxFrame = { h: number; p: number; e: number; k: number };
export const CHECKBOX_REST: Record<CheckboxState, Omit<CheckboxFrame, 'h'>> = {
  unchecked: { p: 0, e: 0, k: 1 },
  indeterminate: { p: 1, e: 0, k: 0 },
  checked: { p: 1, e: 0, k: 1 },
};

export const CUT_AT = 6 / 15;
const CUT_SHRINK = 4;
const BAR_HALF = 6;
// The check's width (9.80 → 22.21) shrunk to the bar's shrunk length.
const CHECK_SMALL = (2 * (BAR_HALF - CUT_SHRINK)) / (CHECK[2][0] - CHECK[0][0]);

/** At cut progress k: which glyph shows, and how far it's shrunk (1 = fully small). */
export function glyphCut(k: number): { check: boolean; small: number } {
  if (k <= 0) {
    return { check: false, small: 0 };
  }
  if (k >= 1) {
    return { check: true, small: 0 };
  }
  if (k <= CUT_AT) {
    return { check: false, small: EXIT(k / CUT_AT) };
  }
  return { check: true, small: 1 - ENTRANCE((k - CUT_AT) / (1 - CUT_AT)) };
}
export const checkAt = (h: number, small: number) =>
  scalePts(
    CHECK,
    CHECK_PIVOT,
    (1 + CHECK_GROW * h) * lerp(1, CHECK_SMALL, small)
  );
/** The bar's half length at hover h, shrunk by `small`, drawn to `vis`. */
export const barHalf = (h: number, small: number, vis = 1) =>
  (BAR_HALF + GROW * h - CUT_SHRINK * small) * vis;
const barPts = (half: number): Pt[] => [
  [16 - half, 14],
  [16 + half, 14],
  [16 + half, 18],
  [16 - half, 18],
];

/** Filled: the box with the disc fill, the bar or check knocked out of it as it passes. */
export function checkboxStateFilled({ h, p, e, k }: CheckboxFrame): Shapes {
  const box = inside(h);
  const reach = Math.hypot(box[0][0] - C[0], box[0][1] - C[1]) + 0.5; // as discFillPath's
  const g = glyphCut(k);
  const knock = g.check
    ? strokePoly(checkAt(h, g.small), CHECK_W)
    : barPts(barHalf(h, g.small));
  return {
    box: {
      d:
        frame(h) +
        discFillPath(box, C, p, e) +
        inDisc(knock, reach * p) +
        inDisc(knock, reach * e),
      ...EVENODD,
    },
  };
}

/**
 * Outline: the outline box with the check (drawn from `e` to `p` along its
 * length) or the bar (grown out from its centre to p − e of its length).
 */
export function checkboxStateOutline({ h, p, e, k }: CheckboxFrame): Shapes {
  const g = glyphCut(k);
  const vis = Math.max(p - e, 0);
  const half = barHalf(h, g.small, vis);
  return {
    box: { d: frame(h), ...EVENODD },
    check: {
      d: polyPath(checkAt(h, g.check ? g.small : 0)),
      ...MITER,
      strokeWidth: CHECK_W,
      pathLength: 1,
      strokeDasharray: `${g.check ? vis : 0} 2`,
      strokeDashoffset: -e || 0,
    },
    bar: {
      d: !g.check && half > 1e-4 ? rectPath(16 - half, 14, 16 + half, 18) : '',
    },
  };
}

// ── AI label ─────────────────────────────────────────────────────────────────

// Carbon's box is the whole 32px frame (square corners, 2px wall), so it
// grows 1px on every side (2px reads as too much; it overflows the frame
// by 1px, which IconSvg allows). The letters hold.
const AI_GROW = 1;
const AI_I = 'M19,21v-2h1v-7h-1v-2h4v2h-1v7h1v2h-4Z';
const AI_A =
  'M15.5005,21h2l-3.5005-11h-3l-3.4966,11h1.9988l.6018-2h4.7781l.6184,2ZM10.7058,17l1.6284-5.4111.2559-.0024,1.6736,5.4136h-3.5579Z';
export const AiLabelSpec = /* @__PURE__ */ hoverIcon('AiLabel', {
  geo: ({ h }) => {
    const [lo, hi] = [-AI_GROW * h, 32 + AI_GROW * h];
    return {
      box: {
        d: rectPath(lo, lo, hi, hi) + rectPath(lo + 2, lo + 2, hi - 2, hi - 2),
        ...EVENODD,
      },
      a: { d: AI_A },
      i: { d: AI_I },
    };
  },
  static: /* @__PURE__ */ carbonArt(AiLabel32),
});

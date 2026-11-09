/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Moon32 from '@carbon/icons/es/moon/32.js';
import Event32 from '@carbon/icons/es/event/32.js';
import EventSchedule32 from '@carbon/icons/es/event--schedule/32.js';
import Erase32 from '@carbon/icons/es/erase/32.js';
import Contrast32 from '@carbon/icons/es/contrast/32.js';
import ChevronSortDown16 from '@carbon/icons/es/chevron--sort--down/16.js';
import ChevronSortDown32 from '@carbon/icons/es/chevron--sort--down/32.js';
import NotAvailable32 from '@carbon/icons/es/not-available/32.js';
import CircleFilled32 from '@carbon/icons/es/circle--filled/32.js';
import CircleOutline32 from '@carbon/icons/es/circle--outline/32.js';
import DirectionLoopRight32 from '@carbon/icons/es/direction--loop-right/32.js';
import DirectionLoopRightFilled32 from '@carbon/icons/es/direction--loop-right--filled/32.js';
import Crossroads32 from '@carbon/icons/es/crossroads/32.js';
import CircleSolid32 from '@carbon/icons/es/circle--solid/32.js';
import DirectionStraightRight32 from '@carbon/icons/es/direction--straight--right/32.js';
import DirectionStraightRightFilled32 from '@carbon/icons/es/direction--straight--right--filled/32.js';
import NextFilled32 from '@carbon/icons/es/next--filled/32.js';
import NextOutline32 from '@carbon/icons/es/next--outline/32.js';
import {
  carbonArt,
  fillThenClear,
  hoverIcon,
  toggleIcon,
  type CarbonIcon,
  type Shapes,
  withStatic,
} from '../../engine';
import {
  circlePts,
  clipConvex,
  mapPath,
  pathPoints,
  polyPath,
  rectPath,
  ringPath,
  roundedRectPath,
  type Pt,
} from '../../geometry';
import { strokeOutline } from '../../off';
import { EVENODD, f, lerp } from '../../paint';
import { weightScale } from '../toggle/stateFillToggles';
import {
  MOON_HOVER_DEG,
  MOON_HOVER_SCALE,
  MOON_PIVOT,
} from '../toggle/stateToggles';

const CCircleFilled = /* @__PURE__ */ carbonArt(CircleFilled32);
const CCircleOutline = /* @__PURE__ */ carbonArt(CircleOutline32);
const CDirectionLoopRight = /* @__PURE__ */ carbonArt(DirectionLoopRight32);
const CDirectionLoopRightFilled = /* @__PURE__ */ carbonArt(
  DirectionLoopRightFilled32
);
const CDirectionStraightRight = /* @__PURE__ */ carbonArt(
  DirectionStraightRight32
);
const CDirectionStraightRightFilled = /* @__PURE__ */ carbonArt(
  DirectionStraightRightFilled32
);
const CNextFilled = /* @__PURE__ */ carbonArt(NextFilled32);
const CNextOutline = /* @__PURE__ */ carbonArt(NextOutline32);

/**
 * States, controls and time, on the frame engine. Every shape is Carbon's
 * own drawing at rest (Carbon draws all of these at 32px only, except
 * Chevron sort down, whose 16px drawing is the 32px one halved, so one
 * drawing serves every size). On hover the parts move as geometry at
 * constant line weight: points move, walls keep their 2px, nothing is
 * transform-scaled, no masks. Standard hover timing (160ms entrance ease
 * in, 120ms exit ease out), one motion per part.
 *
 * Hovers
 *  - Circle outline: the ring grows 1px in radius (r 12–14 → 13–15; a ring
 *    filling the frame grows 1px, as Time's and the playback rings).
 *  - Circle filled: the ring and the centre disc both grow 1px in radius
 *    (disc r 10 → 11), so the 2px gap between them holds.
 *  - Next outline / filled: the playback family's circle (the ring, or the
 *    disc, grows 1px in radius) and the arrow reaches 2px right, the head
 *    moving and the shaft lengthening behind it (an arrow inside a glyph
 *    reaches 2px); its tail holds.
 *  - Moon: Carbon's moon is its Asleep drawing, so it takes Asleep's
 *    hover: the moon turns 10° and grows 8.3% about (17, 16) at
 *    a constant wall (Carbon's own outline, every edge moved back into its
 *    wall by the growth, so the result is Asleep's hovered moon).
 *  - Event: the calendar holds and the star grows 24% about its centroid
 *    (its tips reach 2px, as the full Star's do); the calendar's open
 *    corner draws back as the star grows (the right wall's end 1.99px up,
 *    the bottom wall's end 1.28px left), so the space between them holds
 *    (Bookmark add's rule for a mark beside a box).
 *  - Event schedule: the calendar holds and the clock takes Time's hover:
 *    its ring grows 1px in radius, the minute hand turns 90° clockwise (15
 *    minutes) and the hour hand 7.5°. The open corner draws back 1.11px
 *    (right wall) and 1.06px (bottom wall) so the space to the ring holds.
 *  - Erase: in one eased move the eraser is pushed 2px down and
 *    1px left into a fixed crop line and slides 6px right along the line:
 *    net (+5, +2). Its rightmost ink (its right corner) goes x 27.97 →
 *    32.97, inside the 36×36 box. Its flat bottom stays at y 24, 3px above
 *    the line as at rest, so the push cuts more of it off (the lower hole is
 *    cut at y 22 with it, so the wall above the crop stays 2px). The cut's
 *    ends move right: its left (bottom-left) point 3.03px (x 7.13 → 10.16),
 *    its right end 7px (16.72 → 23.72). The line is erased under it: its
 *    left end follows the bottom-left point (x 7 → 10.03), its right end
 *    holds at 30, so it shortens 23 → 19.97.
 *  - Contrast: the disc grows 1px in radius (it fills the frame) at a
 *    constant 2px rim, and the split turns 45° clockwise about the centre.
 *  - Chevron sort down: the chevron slides 2px down (Chevron sort's and
 *    Caret sort down's motion).
 *  - Not available: each dash reaches 2px further out at its outer end;
 *    the inner ends hold, so the 4px gap between them holds.
 *  - Direction straight right: a standalone arrow, so it reaches 4px as
 *    Arrow right does: the head moves 4px right, the shaft lengthening
 *    behind it; the tail holds.
 *  - Direction loop right: the same 4px reach at the head (its
 *    tip to x 34, the 36px frame's edge), and the loop tightens with it as
 *    Loop's ring does: its centreline radius 6 → 5 at a constant 2px wall,
 *    its right side (into the connector) and its foot on the shaft's line
 *    held, so it draws in toward that corner (its left edge 2px right, its
 *    top 2px down); the connector above the shaft shortens 3 → 2px. The
 *    incoming road holds.
 *  - Direction straight / loop right filled: the box grows 1px (it fills
 *    the frame) and the arrow knocked out of it reaches right as far as
 *    keeps the 2px of box past its tip: 2px (straight; its tip 3px from
 *    the box at rest) and 1px (loop; 2px at rest). The filled loop tightens
 *    in the same proportion as the outline's (a sixth of its radius: 4 →
 *    3.33), its connector 1 → 0.33px.
 *  - Crossroads: each signboard reaches 2px the way it points (the upper
 *    one right, the lower one left; Direction straight right's reach inside
 *    a glyph): its point and end move, its top and bottom walls lengthen
 *    from the post, which still closes the sign. And the post's top and both signs rise 2px, the
 *    reach on top of that, while the post's foot holds at y 30, so the post
 *    lengthens 2px upward.
 *  - Circle solid (a "Running" status dot at 16px): Circle filled's
 *    disc: it grows 1px in radius (r 14 → 15; a disc filling the frame
 *    grows 1px).
 *
 * Rest parity: the circle's ring is drawn in Carbon's own cubic form
 * (circle--outline's; as arcs it misses parity at 20px).
 *
 * Toggles (outline ⇄ filled, the house fill via `fillThenClear`: one disc
 * from one centre, 160ms in on the entrance ease; emptying, a hole from the
 * same centre, 120ms on the exit ease). Each end is its hover icon's own
 * geometry (`shapes(h, 0, 0)` and `shapes(h, 1, 0)`), so the ends equal the
 * hover icons at every h by construction.
 *  - Circle: the centre disc grows from the centre to r 10; the ring holds.
 *  - Next: as Play outline's: the disc grows from the centre to the ring's
 *    centreline and the arrow turns into the knockout as the fill passes it.
 *  - Direction straight / loop right: the filled form is a box with the
 *    glyph knocked out, where the outline is the bare glyph. A disc grows
 *    from the box's centre, clipped to the box, and the glyph turns into the
 *    knockout as the disc passes it. Carbon's filled glyph is smaller than
 *    the outline one, so the glyph settles onto it as the fill comes in (and
 *    back as the hole opens) at constant weight: straight, the tail draws in
 *    2px and the head 1px; loop, the loop's centreline radius 6 → 4 (its
 *    centre 2px right, its right side fixed), the shaft and head 2px up and
 *    the head 2px left, the road 2px up.
 */

const C: Pt = [16, 16];

/** A full circle as four quarter arcs ('' when it has no size): a quarter's chord is well clear of the diameter, so rounding can't shift its centre. */
function circleD([cx, cy]: Pt, r: number): string {
  if (r <= 1e-4) {
    return '';
  }
  const R = `A${f(r)} ${f(r)} 0 0 1`;
  return `M${f(cx - r)} ${f(cy)}${R} ${f(cx)} ${f(cy - r)}${R} ${f(cx + r)} ${f(cy)}${R} ${f(cx)} ${f(cy + r)}${R} ${f(cx - r)} ${f(cy)}Z`;
}

type FillShapes = (h: number, p: number, e: number) => Shapes;

/** The outline ⇄ filled toggle and its two ends as hover icons. */
/* @__NO_SIDE_EFFECTS__ */
function fillSet(
  outline: string,
  filled: string,
  toggle: string,
  statics: readonly [CarbonIcon, CarbonIcon],
  shapes: FillShapes
) {
  return {
    outline: hoverIcon(outline, { geo: ({ h }) => shapes(h, 0, 0) }),
    filled: hoverIcon(filled, { geo: ({ h }) => shapes(h, 1, 0) }),
    toggle: toggleIcon<'outline' | 'filled'>(toggle, {
      states: ['outline', 'filled'],
      statics,
      geo: ({ h, p, e }) => shapes(h, p, e),
      change: fillThenClear,
    }),
  };
}

// ── Circle outline / filled ──────────────────────────────────────────────────
//
// Carbon's ring is r 12–14 (centreline 13); circle--filled adds a disc of
// r 10 inside it, 2px clear of the ring. Hover: both grow 1px in radius.
// Toggle: the disc grows from the centre (radius 10 · p); emptying, a hole
// grows from the centre (as Radio button's dot).

export const CIRCLE_GROW = 1;
export const CIRCLE_DOT = 10;
/** circle--outline's handle length: 7.732 / 14, a circle's four-cubic form. */
const HANDLE = 7.732 / 14;
/** A circle as four cubics from its top, anticlockwise on screen (`cw`: from its bottom, clockwise), as circle--outline draws its ring. */
function cubicCircle([cx, cy]: Pt, r: number, cw = false): string {
  const k = r * HANDLE;
  const s = cw ? -1 : 1;
  const P = (x: number, y: number) => `${f(x)} ${f(y)}`;
  const [t, l, b, rr] = [cy - s * r, cx - r, cy + s * r, cx + r];
  return (
    `M${P(cx, t)}C${P(cx - k, t)} ${P(l, cy - s * k)} ${P(l, cy)}C${P(l, cy + s * k)} ${P(cx - k, b)} ${P(cx, b)}` +
    `C${P(cx + k, b)} ${P(rr, cy + s * k)} ${P(rr, cy)}C${P(rr, cy - s * k)} ${P(cx + k, t)} ${P(cx, t)}Z`
  );
}

export function circleShapes(h: number, p: number, e: number): Shapes {
  const g = CIRCLE_GROW * h;
  const dot = CIRCLE_DOT + g;
  return {
    ring: { d: cubicCircle(C, 14 + g) + cubicCircle(C, 12 + g, true) },
    dot: { d: circleD(C, dot * p) + circleD(C, dot * e), ...EVENODD },
  };
}

const circle = /* @__PURE__ */ fillSet(
  'CircleOutline',
  'CircleFilled',
  'CircleToggle',
  [CCircleOutline, CCircleFilled],
  circleShapes
);
export const CircleOutlineSpec = /* @__PURE__ */ withStatic(
  circle.outline,
  /* @__PURE__ */ carbonArt(CircleOutline32)
);
export const CircleFilledSpec = /* @__PURE__ */ withStatic(
  circle.filled,
  /* @__PURE__ */ carbonArt(CircleFilled32)
);
export const CircleToggleSpec = circle.toggle;
export const CircleSolidSpec = /* @__PURE__ */ hoverIcon('CircleSolid', {
  geo: ({ h }) => ({ disc: { d: circleD(C, 14 + CIRCLE_GROW * h) } }),
  static: /* @__PURE__ */ carbonArt(CircleSolid32),
});

// ── Next outline / filled ────────────────────────────────────────────────────
//
// Carbon's next--outline: the ring (r 12–14) and an arrow (shaft x 8–20.15,
// y 15–17; head to (24, 16)). next--filled is a disc of r 14 with the arrow
// knocked out. As the playback family's circled glyphs (circleFill in
// playbackFillToggles): the ring's centreline grows 1px; the fill is a disc
// to that centreline, sharing one even-odd path with the arrow, so the
// arrow is ink outside the disc and a knockout inside it.

const NEXT_ARROW: Pt[] = [
  [16, 8],
  [14.57, 9.393],
  [20.15, 15],
  [8, 15],
  [8, 17],
  [20.15, 17],
  [14.57, 22.573],
  [16, 24],
  [24, 16],
];
export const NEXT_REACH = 2;
/** The arrow at hover h: every point but the tail's moves right. */
export const nextArrow = (h: number): Pt[] =>
  NEXT_ARROW.map(([x, y]) => [x > 8 ? x + NEXT_REACH * h : x, y] as Pt);

export function nextShapes(h: number, p: number, e: number): Shapes {
  const r = 13 + h;
  return {
    ring: { d: ringPath(C, r, 2) },
    glyph: {
      d: circleD(C, r * p) + circleD(C, r * e) + polyPath(nextArrow(h), true),
      ...EVENODD,
    },
  };
}

const next = /* @__PURE__ */ fillSet(
  'NextOutline',
  'NextFilled',
  'NextToggle',
  [CNextOutline, CNextFilled],
  nextShapes
);
export const NextOutlineSpec = /* @__PURE__ */ withStatic(
  next.outline,
  /* @__PURE__ */ carbonArt(NextOutline32)
);
export const NextFilledSpec = /* @__PURE__ */ withStatic(
  next.filled,
  /* @__PURE__ */ carbonArt(NextFilled32)
);
export const NextToggleSpec = next.toggle;

// ── Moon ─────────────────────────────────────────────────────────────────────
//
// Carbon's moon is its asleep drawing (same path, 32px only). Asleep draws
// it as a fitted 2px centreline; here it's Carbon's own outline (made
// absolute; its two tiny cubics, 0.4px long, as lines), so rest is Carbon's
// exactly at every size. Hover: Asleep's, about the same pivot: the outline
// grows 8.3% at constant weight (`weightScale`: every point scales, then
// every edge moves back into its wall by the growth), then turns 10°.

const MOON =
  'M13.5025 5.4136A15.0755 15.0755 0 0 0 25.096 23.6082A11.1134 11.1134 0 0 1 17.1211 26.9975L16.7033 26.9975A11.0944 11.0944 0 0 1 13.5025 5.4136Z' +
  'M14.98 3A1.0024 1.0024 0 0 0 14.8054 3.0156A13.0959 13.0959 0 0 0 16.63 28.9973L17.1209 28.9973A13.0724 13.0724 0 0 0 27.8229 23.4417' +
  'A1.0094 1.0094 0 0 0 27.0396 21.8773A13.08 13.08 0 0 1 15.8892 4.38A1.0149 1.0149 0 0 0 14.98 3Z';

export function moonPath(h: number): string {
  if (h <= 0) {
    return MOON;
  }
  const grown = weightScale(MOON, MOON_PIVOT, 1 + (MOON_HOVER_SCALE - 1) * h);
  const a = (MOON_HOVER_DEG * h * Math.PI) / 180;
  const [cos, sin, [cx, cy]] = [Math.cos(a), Math.sin(a), MOON_PIVOT];
  return mapPath(grown, ([x, y]) => [
    cx + (x - cx) * cos - (y - cy) * sin,
    cy + (x - cx) * sin + (y - cy) * cos,
  ]);
}

export const MoonSpec = /* @__PURE__ */ hoverIcon('Moon', {
  geo: ({ h }) => ({ moon: { d: moonPath(h), ...EVENODD } }),
  static: /* @__PURE__ */ carbonArt(Moon32),
});

// ── Event, Event schedule ────────────────────────────────────────────────────
//
// Carbon's calendar page for these is open at the bottom right for the mark:
// the right wall (x 26–28) ends at y 12, the bottom wall (y 26–28) at x 10.
// The binding rings (x 10–12, 20–22) run y 2–8, as Calendar's. The ends
// draw back along their walls (`dr` up, `db` left) by just enough that the
// space to the mark holds.

function eventPage(dr: number, db: number): string {
  return (
    `M28 6A2 2 0 0 0 26 4L22 4L22 2L20 2L20 4L12 4L12 2L10 2L10 4L6 4A2 2 0 0 0 4 6L4 26A2 2 0 0 0 6 28L${f(10 - db)} 28L${f(10 - db)} 26` +
    `L6 26L6 6L10 6L10 8L12 8L12 6L20 6L20 8L22 8L22 6L26 6L26 ${f(12 - dr)}L28 ${f(12 - dr)}Z`
  );
}

/** The distance from p to the segment ab. */
function segDist(p: Pt, a: Pt, b: Pt): number {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const t = Math.max(
    0,
    Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy))
  );
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}
/** The narrowest space between two non-overlapping polygons. */
function polyGap(a: readonly Pt[], b: readonly Pt[]): number {
  let m = Infinity;
  const edges = (q: readonly Pt[]) =>
    q.map((p, i) => [p, q[(i + 1) % q.length]] as const);
  for (const [p, q] of edges(b)) {
    for (const v of a) {
      m = Math.min(m, segDist(v, p, q));
    }
  }
  for (const [p, q] of edges(a)) {
    for (const v of b) {
      m = Math.min(m, segDist(v, p, q));
    }
  }
  return m;
}
/** The open ends' stubs (the right wall's from y 6 down, the bottom wall's from x 6 right) drawn back by d. */
const rightEnd = (d: number): Pt[] => [
  [26, 6],
  [28, 6],
  [28, 12 - d],
  [26, 12 - d],
];
const bottomEnd = (d: number): Pt[] => [
  [6, 26],
  [10 - d, 26],
  [10 - d, 28],
  [6, 28],
];
/** The least draw-back (0–4) that keeps `gapAt(d)` at `want` (bisection; the gap grows with d). */
function drawBack(gapAt: (d: number) => number, want: number): number {
  if (gapAt(0) >= want - 1e-9) {
    return 0;
  }
  let [lo, hi] = [0, 4];
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (gapAt(mid) >= want) {
      hi = mid;
    } else {
      lo = mid;
    }
  }
  return hi;
}

// Event: Carbon's star (solid), grown about its area centroid.
const EVENT_STAR: Pt[] = [
  [21, 15],
  [23.549, 19.938],
  [29, 20.729],
  [25, 24.573],
  [26, 30],
  [21, 27.438],
  [16, 30],
  [17, 24.573],
  [13, 20.729],
  [18.6, 19.938],
];
/** The star's area centroid. */
export const EVENT_STAR_C: Pt = /* @__PURE__ */ (() => {
  let [a, cx, cy] = [0, 0, 0];
  EVENT_STAR.forEach(([x0, y0], i) => {
    const [x1, y1] = EVENT_STAR[(i + 1) % EVENT_STAR.length];
    const k = x0 * y1 - x1 * y0;
    [a, cx, cy] = [a + k, cx + (x0 + x1) * k, cy + (y0 + y1) * k];
  });
  return [cx / (3 * a), cy / (3 * a)];
})();
/** The star grows 24%: its tips (8.30–8.41 from the centroid) reach 2px. */
export const EVENT_STAR_GROW = 0.24;
export const eventStar = (h: number): Pt[] =>
  EVENT_STAR.map(
    ([x, y]) =>
      [
        EVENT_STAR_C[0] + (x - EVENT_STAR_C[0]) * (1 + EVENT_STAR_GROW * h),
        EVENT_STAR_C[1] + (y - EVENT_STAR_C[1]) * (1 + EVENT_STAR_GROW * h),
      ] as Pt
  );
const STAR_GAP = {
  right: /* @__PURE__ */ polyGap(EVENT_STAR, /* @__PURE__ */ rightEnd(0)),
  bottom: /* @__PURE__ */ polyGap(EVENT_STAR, /* @__PURE__ */ bottomEnd(0)),
};

/** How far Event's open ends draw back at hover h: [right wall up, bottom wall left]. */
export function eventDrawBack(h: number): [number, number] {
  if (h <= 0) {
    return [0, 0];
  }
  const star = eventStar(h);
  return [
    drawBack((d) => polyGap(star, rightEnd(d)), STAR_GAP.right),
    drawBack((d) => polyGap(star, bottomEnd(d)), STAR_GAP.bottom),
  ];
}

export const EventSpec = /* @__PURE__ */ hoverIcon('Event', {
  geo: ({ h }) => {
    const [dr, db] = eventDrawBack(h);
    return {
      page: { d: eventPage(dr, db) },
      star: { d: polyPath(eventStar(h), true) },
    };
  },
  static: /* @__PURE__ */ carbonArt(Event32),
});

// Event schedule: the clock is Time's at a smaller size: a 2px ring of r
// 6–8 about (21, 22) and the hands as one 2px stroke mitred at the centre
// (the minute hand 4 long, straight up; the hour hand 3.245 long, at 135°).
// Hover (Time's): the ring grows 1px in radius, the minute hand turns 90°
// clockwise and the hour hand 7.5°.
export const CLOCK_C: Pt = [21, 22];
const CLOCK_R = 7;
const MINUTE = 4;
const HOUR = 2.295 * Math.SQRT2;
export const MINUTE_TURN = 90;
export const HOUR_TURN = 7.5;

/** The clock's ring centreline radius and hands (one mitred 2px outline) at hover h. */
export function clockArt(h: number) {
  const r = CLOCK_R + h;
  const [tm, th] = [
    (MINUTE_TURN * h * Math.PI) / 180,
    ((135 + HOUR_TURN * h) * Math.PI) / 180,
  ];
  const minuteTip: Pt = [
    CLOCK_C[0] + MINUTE * Math.sin(tm),
    CLOCK_C[1] - MINUTE * Math.cos(tm),
  ];
  const hourTip: Pt = [
    CLOCK_C[0] + HOUR * Math.sin(th),
    CLOCK_C[1] - HOUR * Math.cos(th),
  ];
  const hands = strokeOutline(
    [
      { k: 'L', a: minuteTip, b: CLOCK_C },
      { k: 'L', a: CLOCK_C, b: hourTip },
    ],
    2
  ).open!;
  return { r, hands };
}

/** The space from a polygon to the clock's ring (outer radius R). */
const ringGap = (q: readonly Pt[], R: number) => {
  const inside = (() => {
    let odd = false;
    q.forEach(([x0, y0], i) => {
      const [x1, y1] = q[(i + 1) % q.length];
      if (
        y0 <= CLOCK_C[1] !== y1 <= CLOCK_C[1] &&
        CLOCK_C[0] < x0 + ((CLOCK_C[1] - y0) * (x1 - x0)) / (y1 - y0)
      ) {
        odd = !odd;
      }
    });
    return odd;
  })();
  const near = inside
    ? 0
    : Math.min(...q.map((p, i) => segDist(CLOCK_C, p, q[(i + 1) % q.length])));
  return near - R;
};
const RING_GAP = {
  right: /* @__PURE__ */ ringGap(/* @__PURE__ */ rightEnd(0), CLOCK_R + 1),
  bottom: /* @__PURE__ */ ringGap(/* @__PURE__ */ bottomEnd(0), CLOCK_R + 1),
};

/** How far Event schedule's open ends draw back at hover h: [right wall up, bottom wall left]. */
export function scheduleDrawBack(h: number): [number, number] {
  if (h <= 0) {
    return [0, 0];
  }
  const R = CLOCK_R + 1 + h;
  return [
    drawBack((d) => ringGap(rightEnd(d), R), RING_GAP.right),
    drawBack((d) => ringGap(bottomEnd(d), R), RING_GAP.bottom),
  ];
}

export const EventScheduleSpec = /* @__PURE__ */ hoverIcon('EventSchedule', {
  geo: ({ h }) => {
    const [dr, db] = scheduleDrawBack(h);
    const { r, hands } = clockArt(h);
    return {
      page: { d: eventPage(dr, db) },
      ring: { d: ringPath(CLOCK_C, r, 2) },
      hands: { d: polyPath(hands, true) },
    };
  },
  static: /* @__PURE__ */ carbonArt(EventSchedule32),
});

// ── Erase ────────────────────────────────────────────────────────────────────
//
// Carbon's eraser (made absolute) and the line under it (x 7–30, y 27–29).
// Hover (exactly 6px): the eraser moves by (6 − 1, 2) = (+5, +2), a push 1px left and
// 2px down into the fixed crop line y 24 plus a 6px slide right (its
// rightmost ink to x 32.97), as one motion; its
// lower hole is cut by y 22, keeping the 2px wall above the crop. The line's
// left end follows the eraser's bottom-left point (0.13 left of it, as at
// rest); its right end holds.

export const ERASE_PUSH: Pt = [1, 2]; // left, down
/** The eraser's rightmost ink at rest: its right corner, an r 2 arc about (27.38 − √(4 − 1.415²), 11.925). */
export const ERASER_RIGHT = 27.38 - Math.sqrt(4 - (2.83 / 2) ** 2) + 2;
/** The slide right (exactly 6px; with the push's 1px left the corner ends at x 32.97). */
export const ERASE_SLIDE = 6;
const ERASE_CROP = 24;
const ERASE_HOLE_CROP = 22;
/** Where the edge from a to b, moved by (dx, dy), meets the line y = Y. */
const atY = (a: Pt, b: Pt, dx: number, dy: number, Y: number) => {
  const [ax, ay, bx, by] = [a[0] + dx, a[1] + dy, b[0] + dx, b[1] + dy];
  return ax + ((bx - ax) * (Y - ay)) / (by - ay);
};
/** How far the eraser has moved at hover h: the push (1px left, 2px down) plus the slide right. */
export const eraserMove = (h: number): Pt => [
  (ERASE_SLIDE - ERASE_PUSH[0]) * h,
  ERASE_PUSH[1] * h,
];
/** The eraser moved by (dx, dy): its bottom-left point on the crop line. */
export const eraserBottomLeft = ([dx, dy]: Pt) =>
  atY([2.62, 19.42], [7.13, 24], dx, dy, ERASE_CROP);

export function eraserPath([dx, dy]: Pt): string {
  const P = (x: number, y: number) => `${f(x + dx)} ${f(y + dy)}`;
  const bl = eraserBottomLeft([dx, dy]);
  const br = atY([27.38, 13.34], [16.72, 24], dx, dy, ERASE_CROP);
  const holeL = atY([4, 18], [8, 22], dx, dy, ERASE_HOLE_CROP);
  const holeR = atY([18.24, 19.61], [15.89, 22], dx, dy, ERASE_HOLE_CROP);
  return (
    `M${P(27.38, 10.51)}L${P(19.45, 2.59)}A2 2 0 0 0 ${P(16.62, 2.59)}L${P(2.62, 16.59)}A2 2 0 0 0 ${P(2.62, 19.42)}` +
    `L${f(bl)} ${ERASE_CROP}L${f(br)} ${ERASE_CROP}L${P(27.38, 13.34)}A2 2 0 0 0 ${P(27.38, 10.51)}Z` +
    `M${f(holeR)} ${ERASE_HOLE_CROP}L${f(holeL)} ${ERASE_HOLE_CROP}L${P(4, 18)}L${P(10.31, 11.69)}L${P(18.24, 19.61)}Z` +
    `M${P(19.65, 18.24)}L${P(11.73, 10.31)}L${P(18, 4)}L${P(26, 11.93)}Z`
  );
}

export const EraseSpec = /* @__PURE__ */ hoverIcon('Erase', {
  geo: ({ h }) => {
    const m = eraserMove(h);
    return {
      eraser: { d: eraserPath(m), ...EVENODD },
      line: { d: rectPath(eraserBottomLeft(m) - 0.13, 27, 30, 29) },
    };
  },
  static: /* @__PURE__ */ carbonArt(Erase32),
});

// ── Contrast ─────────────────────────────────────────────────────────────────
//
// Carbon's contrast: a disc of r 14 with its left half's inside (a half
// disc of r 12) knocked out: a 2px rim, light on the left, solid on the
// right. Hover: the disc grows 1px in radius with the knockout (the rim
// holds 2px), and the split turns 45° clockwise about the centre.

export const CONTRAST_TURN = 45;

export const ContrastSpec = /* @__PURE__ */ hoverIcon('Contrast', {
  geo: ({ h }) => {
    const [R, r] = [14 + h, 12 + h];
    const a = (CONTRAST_TURN * h * Math.PI) / 180;
    // The half disc's ends on the split, and its arc's middle (two quarter arcs, so rounding can't move the arc).
    const [top, mid, bottom] = [0, 90, 180].map(
      (t): Pt => [
        C[0] + r * Math.sin(a - (t * Math.PI) / 180),
        C[1] - r * Math.cos(a - (t * Math.PI) / 180),
      ]
    );
    const A = (p: Pt) => `A${f(r)} ${f(r)} 0 0 0 ${f(p[0])} ${f(p[1])}`;
    return {
      disc: {
        d: `${circleD(C, R)}M${f(top[0])} ${f(top[1])}${A(mid)}${A(bottom)}Z`,
        ...EVENODD,
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(Contrast32),
});

// ── Chevron sort down ────────────────────────────────────────────────────────
//
// As Chevron sort's lower chevron (and Caret sort down): it slides 2px down.

const CHEV_SORT_DOWN: Pt[] = [
  [16, 28],
  [9, 21],
  [10.4, 19.6],
  [16, 25.2],
  [21.6, 19.6],
  [23, 21],
];
export const SORT_REACH = 2;
export const ChevronSortDownSpec = /* @__PURE__ */ hoverIcon(
  'ChevronSortDown',
  {
    geo: ({ h }) => ({
      down: {
        d: polyPath(
          CHEV_SORT_DOWN.map(([x, y]) => [x, y + SORT_REACH * h] as Pt),
          true
        ),
      },
    }),
    static: /* @__PURE__ */ carbonArt(ChevronSortDown16, ChevronSortDown32),
  }
);

// ── Not available ────────────────────────────────────────────────────────────
//
// Two dashes (x 4–14 and 18–28, y 15–17). Hover: each reaches 2px further
// out at its outer end; the 4px gap between them holds.

export const DASH_REACH = 2;
export const NotAvailableSpec = /* @__PURE__ */ hoverIcon('NotAvailable', {
  geo: ({ h }) => ({
    left: { d: rectPath(4 - DASH_REACH * h, 15, 14, 17) },
    right: { d: rectPath(18, 15, 28 + DASH_REACH * h, 17) },
  }),
  static: /* @__PURE__ */ carbonArt(NotAvailable32),
});

// ── Direction straight / loop right, and filled ──────────────────────────────
//
// The filled forms are a box (2–30, r 2; growing 1px on hover) with the
// glyph knocked out. One even-odd path holds the fill (the disc, clipped to
// the box), its emptying hole and the glyph, so the glyph is ink outside the
// fill and a knockout inside it. `k` is how far the glyph has settled onto
// the filled drawing (in with the fill, back out with the hole).

export const BOX_GROW = 1;
/** Arrow reach on hover: outline (a standalone arrow) and filled (inside the box). */
export const DIR_REACH = {
  outline: 4,
  straightFilled: 2,
  loopFilled: 1,
} as const;

/** The box at hover h inside the disc of radius `r` about the centre, as a closed path ('' when there is none). */
function boxPart(h: number, r: number): string {
  if (r <= 1e-4) {
    return '';
  }
  const [lo, hi] = [2 - BOX_GROW * h, 30 + BOX_GROW * h];
  // The farthest point of the box: on a corner's r 2 arc, along the diagonal.
  const far = (hi - 2 - 16) * Math.SQRT2 + 2;
  if (r >= far) {
    return roundedRectPath(lo, lo, hi, hi, 2);
  }
  const part = clipConvex(
    pathPoints(roundedRectPath(lo, lo, hi, hi, 2), 0.25),
    circlePts(C, r, 128)
  );
  return part.length > 2 ? polyPath(part, true) : '';
}

/** The box's fill (disc p, hole e) at hover h, from the box's centre out to its farthest corner. */
function boxFill(h: number, p: number, e: number): string {
  const reach = (12 + BOX_GROW * h) * Math.SQRT2 + 2.5;
  return boxPart(h, reach * p) + boxPart(h, reach * e);
}

/** How far the glyph has settled onto the filled drawing. */
const settle = (p: number, e: number) => p * (1 - e);

// Straight: Carbon's outline arrow (tail x 4, tip x 28) and the filled one
// (tail x 6, tip x 27): the tail's points move 2k right, the head's 1k left.
const STRAIGHT: Pt[] = [
  [28, 16],
  [21, 9],
  [19.586, 10.414],
  [24.172, 15],
  [4, 15],
  [4, 17],
  [24.172, 17],
  [19.586, 21.586],
  [21, 23],
];
export function straightArrow(h: number, k: number): Pt[] {
  const reach = lerp(DIR_REACH.outline, DIR_REACH.straightFilled, k) * h;
  return STRAIGHT.map(
    ([x, y]) => [x === 4 ? 4 + 2 * k : x - k + reach, y] as Pt
  );
}

export function straightShapes(h: number, p: number, e: number): Shapes {
  return {
    arrow: {
      d: boxFill(h, p, e) + polyPath(straightArrow(h, settle(p, e)), true),
      ...EVENODD,
    },
  };
}

// Loop: Carbon's outline glyph is a loop (centre (9, 11), r 5–7) that runs
// into the shaft (y 16–18) and the head (tip (30, 17)), plus the incoming
// road (x 14–16, y 20–28) passing under the shaft. The filled glyph is the
// same with the loop's radii 2 smaller (3–5) about (11, 11), so its right
// side stays at x 14–16, and the shaft, head and road 2px higher, the head
// also 2px left. Both are drawn from these numbers, settled by k.
//
// Hover (as Loop's ring
// tightens r 8 → 7 as its arrow moves): the loop's centreline radius drops
// a sixth (6 → 5 outline, 4 → 3.33 filled) at a constant 2px wall, with its
// right side (x 15) and the shaft's centreline (its foot) held, so its
// centre moves in toward that corner by the same amount on each axis.
export const LOOP_TIGHTEN = 1 / 6;
export function loopGlyph(
  h: number,
  k: number
): { loop: string; road: string } {
  const rc = (6 - 2 * k) * (1 - LOOP_TIGHTEN * h); // the loop's centreline radius
  const sc = 17 - 2 * k; // the shaft's centreline
  const [cx, cy] = [15 - rc, sc - rc];
  const [ro, ri] = [rc + 1, rc - 1];
  const [top, bot] = [sc - 1, sc + 1]; // the shaft's top and bottom edges
  const dx = -2 * k + lerp(DIR_REACH.outline, DIR_REACH.loopFilled, k) * h;
  const dy = -2 * k;
  const H = ([x, y]: Pt) => `L${f(x + dx)} ${f(y + dy)}`;
  const loop =
    `M${f(cx)} ${f(cy - ro)}A${f(ro)} ${f(ro)} 0 0 1 16 ${f(cy)}L16 ${f(top - 2)}L14 ${f(top - 2)}L14 ${f(cy)}` +
    `A${f(ri)} ${f(ri)} 0 1 0 ${f(cx)} ${f(top)}L${f(26.1719 + dx)} ${f(top)}` +
    H([21.5859, 11.4141]) +
    H([23, 10]) +
    H([30, 17]) +
    H([23, 24]) +
    H([21.5859, 22.5859]) +
    `L${f(26.1719 + dx)} ${f(bot)}L${f(cx)} ${f(bot)}A${f(ro)} ${f(ro)} 0 0 1 ${f(cx - ro)} ${f(cy)}A${f(ro)} ${f(ro)} 0 0 1 ${f(cx)} ${f(cy - ro)}Z`;
  return { loop, road: rectPath(14, 20 + dy, 16, 28 + dy) };
}

export function loopShapes(h: number, p: number, e: number): Shapes {
  const { loop, road } = loopGlyph(h, settle(p, e));
  return { glyph: { d: boxFill(h, p, e) + loop + road, ...EVENODD } };
}

const straight = /* @__PURE__ */ fillSet(
  'DirectionStraightRight',
  'DirectionStraightRightFilled',
  'DirectionStraightRightToggle',
  [CDirectionStraightRight, CDirectionStraightRightFilled],
  straightShapes
);
export const DirectionStraightRightSpec = /* @__PURE__ */ withStatic(
  straight.outline,
  /* @__PURE__ */ carbonArt(DirectionStraightRight32)
);
export const DirectionStraightRightFilledSpec = /* @__PURE__ */ withStatic(
  straight.filled,
  /* @__PURE__ */ carbonArt(DirectionStraightRightFilled32)
);
export const DirectionStraightRightToggleSpec = straight.toggle;

const loop = /* @__PURE__ */ fillSet(
  'DirectionLoopRight',
  'DirectionLoopRightFilled',
  'DirectionLoopRightToggle',
  [CDirectionLoopRight, CDirectionLoopRightFilled],
  loopShapes
);
export const DirectionLoopRightSpec = /* @__PURE__ */ withStatic(
  loop.outline,
  /* @__PURE__ */ carbonArt(DirectionLoopRight32)
);
export const DirectionLoopRightFilledSpec = /* @__PURE__ */ withStatic(
  loop.filled,
  /* @__PURE__ */ carbonArt(DirectionLoopRightFilled32)
);
export const DirectionLoopRightToggleSpec = loop.toggle;

// ── Crossroads ───────────────────────────────────────────────────────────────

/** How far each signboard reaches the way it points on hover, and how far the signs and the post's top rise (its foot holds). */
export const CROSSROADS_REACH = 2;
export const CROSSROADS_LIFT = 2;
/** Carbon's crossroads with the upper sign reaching `r` px right, the lower one `l` px left, and everything but the post's foot (y 30) `up` px higher. */
export function crossroadsPath(r: number, l: number, up: number): string {
  // Carbon's numbers have four decimals; rounding them to f's three would move its edges.
  const [R, L, Y] = [
    (x: number) => +(x + r).toFixed(4),
    (x: number) => +(x - l).toFixed(4),
    (y: number) => +(y - up).toFixed(4),
  ];
  return (
    `M${R(26.5859)} ${Y(6.5859)}A1.9862 1.9862 0 0 0 ${R(25.1719)} ${Y(6)}H17V${Y(2)}H15V${Y(12)}H${L(6.8281)}A1.9862 1.9862 0 0 0 ${L(5.4141)} ${Y(12.5859)}` +
    `L${L(2)} ${Y(16)}L${L(5.4141)} ${Y(19.4141)}A1.9862 1.9862 0 0 0 ${L(6.8281)} ${Y(20)}H15V30H17V${Y(14)}H${R(25.1719)}A1.9862 1.9862 0 0 0 ${R(26.5859)} ${Y(13.4141)}L${R(30)} ${Y(10)}Z` +
    `M${L(6.8281)} ${Y(18)}L${L(4.8281)} ${Y(16)}L${L(6.8281)} ${Y(14)}H15V${Y(18)}Z` +
    `M${R(25.1719)} ${Y(12)}H17V${Y(8)}H${R(25.1719)}L${R(27.1719)} ${Y(10)}Z`
  );
}
export const CrossroadsSpec = /* @__PURE__ */ hoverIcon('Crossroads', {
  geo: ({ h }) => ({
    signs: {
      d: crossroadsPath(
        CROSSROADS_REACH * h,
        CROSSROADS_REACH * h,
        CROSSROADS_LIFT * h
      ),
    },
  }),
  static: /* @__PURE__ */ carbonArt(Crossroads32),
});

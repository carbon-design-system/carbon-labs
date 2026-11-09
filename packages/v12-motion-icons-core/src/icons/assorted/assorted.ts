/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ViewNext32 from '@carbon/icons/es/view-next/32.js';
import PopIn32 from '@carbon/icons/es/pop-in/32.js';
import GlobalFilters32 from '@carbon/icons/es/global-filters/32.js';
import FunnelSequence32 from '@carbon/icons/es/funnel--sequence/32.js';
import Fork32 from '@carbon/icons/es/fork/32.js';
import Delete32 from '@carbon/icons/es/delete/32.js';
import Gift32 from '@carbon/icons/es/gift/32.js';
import PricingTraditional32 from '@carbon/icons/es/pricing--traditional/32.js';
import Currency32 from '@carbon/icons/es/currency/32.js';
import Purchase32 from '@carbon/icons/es/purchase/32.js';
import PiggyBankSlot32 from '@carbon/icons/es/piggy-bank--slot/32.js';
import Arrange32 from '@carbon/icons/es/arrange/32.js';
import Cognitive32 from '@carbon/icons/es/cognitive/32.js';
import Dashboard32 from '@carbon/icons/es/dashboard/32.js';
import DashboardReference32 from '@carbon/icons/es/dashboard--reference/32.js';
import ChevronDownOutline32 from '@carbon/icons/es/chevron--down--outline/32.js';
import ChevronUpOutline32 from '@carbon/icons/es/chevron--up--outline/32.js';
import {
  carbonArt,
  defineAction,
  hoverIcon,
  toggleIcon,
  TOGGLE_IN,
  type Shapes,
} from '../../engine';
import {
  filletPath,
  mapPath,
  polyPath,
  rectPath,
  ringPath,
  roundedRectPath,
  scalePts,
  type Pt,
} from '../../geometry';
import { ENTRANCE, foldProgress, together } from '../../ease';
import { EVENODD, f, lerp, LINE, MITER } from '../../paint';
import { motionTokens, toEasing } from '../../tokens';
import { referenceArrow, referenceFrame } from '../data/chartAxis';

const CChevronDownOutline = /* @__PURE__ */ carbonArt(ChevronDownOutline32);
const CChevronUpOutline = /* @__PURE__ */ carbonArt(ChevronUpOutline32);

/**
 * Operations, commerce, navigation and senses (no reference animations). Parts move rigidly (slides and turns) or, where they
 * change shape, are 2px centrelines fitted to Carbon, so line weight never
 * changes. Carbon's single paths are split where one part moves against
 * another.
 */

const P = ([x, y]: Pt) => `${f(x)} ${f(y)}`;

// ── Operations ───────────────────────────────────────────────────────────────

// View next: as Recently viewed, mirrored. The arrowed ring and the minute
// hand turn 45° clockwise together (so the space between them holds); the
// hour hand stays. The hands are one 2px centreline, mitred at the pivot.
const VIEW_NEXT_RING =
  'M16,2A13.9158,13.9158,0,0,1,26,6.2343V2h2v8H20V8h4.9217A11.9818,11.9818,0,1,0,28,16h2A14,14,0,1,1,16,2Z';
export const ViewNextSpec = /* @__PURE__ */ hoverIcon('ViewNext', {
  geo: ({ h }) => {
    const a = (Math.PI / 4) * h;
    const minute: Pt = [16 + 9 * Math.sin(a), 16 - 9 * Math.cos(a)];
    return {
      ring: { d: VIEW_NEXT_RING, transform: `rotate(${f(45 * h)} 16 16)` },
      hands: { d: `M${P(minute)}L16 16L21.293 21.293`, ...MITER },
    };
  },
  static: /* @__PURE__ */ carbonArt(ViewNext32),
});

// Pop in: the arrow travels 2px in (down and left; the set-wide reach for an
// arrow on a glyph) without changing
// size, and the frame's open corner closes with it, so the space between
// the arrow and the frame's edges holds.
const POP_ARROW =
  'M28,14v-2l-6.586-.0266L30,3.3875l-1.4142-1.4142-8.5861,8.586.0003-6.5593h-2v10l9.9999-.0269v.0269Z';
export const PopInSpec = /* @__PURE__ */ hoverIcon('PopIn', {
  geo: ({ h }) => {
    const k = 2 * h * Math.SQRT1_2;
    const frame = `M${f(14 - k)} 4H6A2 2 0 0 0 4 6V26A2 2 0 0 0 6 28H26A2 2 0 0 0 28 26V${f(17.9733 + k)}H26V26H6V6H${f(14 - k)}Z`;
    return {
      frame: { d: frame },
      arrow: { d: POP_ARROW, transform: `translate(${f(-k)} ${f(k)})` },
    };
  },
  static: /* @__PURE__ */ carbonArt(PopIn32),
});

// Global filters: the knobs slide 3px (top left, middle right, bottom
// left), together (no stagger); each track's two halves follow its knob.
const FILTER_ROWS: Array<[y: number, knob: number, dir: 1 | -1]> = [
  [8, 9, -1],
  [16, 23, 1],
  [24, 14, -1],
];
const filterTiming = /* @__PURE__ */ together();
export const GlobalFiltersSpec = /* @__PURE__ */ hoverIcon('GlobalFilters', {
  hover: filterTiming.hover,
  geo: ({ h }) => {
    const s: Shapes = {};
    FILTER_ROWS.forEach(([y, x0, dir], i) => {
      const x = x0 + 3 * dir * filterTiming.at(h, i);
      s[`k${i}`] = { d: ringPath([x, y], 3, 2) };
      // Each half ends inside the knob's ring (its band is 2–4px from the centre).
      s[`t${i}`] = {
        d: rectPath(2, y - 1, x - 3, y + 1) + rectPath(x + 3, y - 1, 30, y + 1),
      };
    });
    return s;
  },
  static: /* @__PURE__ */ carbonArt(GlobalFilters32),
});

// Funnel sequence: the back funnel moves 1px up and the front funnel 1px
// down, the back funnel's leg stretching so the space between them holds, and Filter's wave sweeps through the front funnel. The wave is a
// 2px line cut to the funnel's wall centrelines (no clip path): its ends
// stay inside the walls.
const FUNNEL_FRONT =
  'M29,8H9c-1.1,0-2,.9-2,2v3.6c0,.5.2,1,.6,1.4l7.4,7.4v5.6c0,1.1.9,2,2,2h4c1.1,0,2-.9,2-2v-5.6l7.4-7.4c.4-.4.6-.9.6-1.4v-3.6c0-1.1-.9-2-2-2ZM29,13.6l-8,8v6.4h-4v-6.4l-8-8v-3.6h20v3.6Z';
/** The back funnel; its right leg reaches `leg` px down to the front funnel. */
const funnelBack = (leg: number) =>
  `M4,7.6l1,1v2.8l-2.4-2.4c-.4-.4-.6-.9-.6-1.4v-3.6c0-1.1.9-2,2-2h20c1.1,0,2,.9,2,2v${f(leg)}h-2v-${f(leg)}H4v3.6h0Z`;
// The front funnel's inside, as two convex pieces (bowl and stem), on the wall centrelines.
const FUNNEL_BOWL: Pt[] = [
  [8, 9],
  [30, 9],
  [30, 14],
  [22, 22],
  [16, 22],
  [8, 14],
];
const FUNNEL_STEM: Pt[] = [
  [16, 21.9],
  [22, 21.9],
  [22, 29],
  [16, 29],
];
/** Filter.tsx's wave (a 6-point sine), at rest position, moved to this funnel. */
const WAVE: Pt[][] = [
  [
    [-17, 25.375],
    [-17, 25.375],
    [-15, 23.375],
    [-12.5, 23.375],
  ],
  [
    [-12.5, 23.375],
    [-8, 23.375],
    [-8, 27.375],
    [-3.5, 27.375],
  ],
  [
    [-3.5, 27.375],
    [1, 27.375],
    [1, 24.547],
    [5.5, 24.547],
  ],
  [
    [5.5, 24.547],
    [10, 24.547],
    [10, 26.516],
    [14.5, 26.516],
  ],
  [
    [14.5, 26.516],
    [17, 26.516],
    [19, 25.375],
    [19, 25.375],
  ],
];
function inside(p: Pt, poly: readonly Pt[]): boolean {
  let s = 0;
  for (let i = 0; i < poly.length; i++) {
    const [a, b] = [poly[i], poly[(i + 1) % poly.length]];
    const c = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
    if (c !== 0) {
      if (s && Math.sign(c) !== s) {
        return false;
      }
      s = Math.sign(c);
    }
  }
  return true;
}
/** The wave, shifted by (dx, dy), as 2px-line runs inside the funnel. */
function waveInFunnel(dx: number, dy: number, down: number): string {
  const pts: Pt[] = [];
  for (const [a, b, c, e] of WAVE) {
    for (let i = 0; i <= 24; i++) {
      const t = i / 24,
        u = 1 - t;
      const k = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
      pts.push([
        k[0] * a[0] + k[1] * b[0] + k[2] * c[0] + k[3] * e[0] + dx,
        k[0] * a[1] + k[1] * b[1] + k[2] * c[1] + k[3] * e[1] + dy,
      ]);
    }
  }
  const polys = [FUNNEL_BOWL, FUNNEL_STEM].map((poly) =>
    poly.map(([x, y]): Pt => [x, y + down])
  );
  const isIn = (q: Pt) => polys.some((poly) => inside(q, poly));
  let d = '';
  let on = false;
  pts.forEach((q, i) => {
    const ok = isIn(q);
    if (ok) {
      d += `${on ? 'L' : 'M'}${P(q)}`;
    }
    on = ok;
    void i;
  });
  return d;
}
export const FunnelSequenceSpec = /* @__PURE__ */ hoverIcon('FunnelSequence', {
  hover: {
    duration: 0.29,
    ease: /* @__PURE__ */ toEasing(motionTokens.easing.standard),
  },
  geo: ({ h }) => ({
    // Its right leg stretches 2px so it still meets the front funnel's rim.
    back: { d: funnelBack(2 + 2 * h), transform: `translate(0 ${f(-h)})` },
    front: { d: FUNNEL_FRONT, ...EVENODD, transform: `translate(0 ${f(h)})` },
    // As Filter: the wave travels (24, −13.375) from below-left; this funnel sits 3px right and 4px lower than Filter's.
    wave: {
      d: h > 0 ? waveInFunnel(3 + 24 * h, 4 - 13.375 * h + h, h) : '',
      ...LINE,
    },
  }),
  static: /* @__PURE__ */ carbonArt(FunnelSequence32),
});

// Fork: the two top nodes spread 1px apart and every node grows 1px; the
// arms follow (2px centrelines, bends filleted as Carbon's are).
export const ForkSpec = /* @__PURE__ */ hoverIcon('Fork', {
  geo: ({ h }) => {
    const [l, r, ring] = [8 - h, 24 + h, 3 + h];
    return {
      nodes: {
        d:
          ringPath([l, 6], ring, 2) +
          ringPath([r, 6], ring, 2) +
          ringPath([16, 26], ring, 2),
      },
      arms: {
        d:
          filletPath(
            [
              [l, 9.5],
              [l, 16],
              [r, 16],
              [r, 9.5],
            ],
            1
          ) + 'M16 16V22.5',
        ...LINE,
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(Fork32),
});

// Delete: the key and its × grow 10% about the icon centre at constant 2px
// line weight (both are their centrelines, fitted exactly to Carbon).
export const DeleteSpec = /* @__PURE__ */ hoverIcon('Delete', {
  geo: ({ h }) => {
    const k = 1 + 0.1 * h;
    const S = ([x, y]: Pt): Pt => [16 + (x - 16) * k, 16 + (y - 16) * k];
    const x = 7.485 * Math.SQRT1_2;
    const cross = [
      [
        [19 - x, 16 - x],
        [19 + x, 16 + x],
      ],
      [
        [19 - x, 16 + x],
        [19 + x, 16 - x],
      ],
    ] as Pt[][];
    return {
      key: {
        d: polyPath(
          (
            [
              [3, 16],
              [12, 7],
              [29, 7],
              [29, 25],
              [12, 25],
            ] as Pt[]
          ).map(S),
          true
        ),
        ...LINE,
        strokeLinejoin: 'round',
      },
      cross: {
        d: cross.map(([a, b]) => `M${P(S(a))}L${P(S(b))}`).join(''),
        ...LINE,
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(Delete32),
});

// ── Commerce ─────────────────────────────────────────────────────────────────

// Gift: as Trash can, the lid and bow tip 20° about a pivot above the
// box's right wall, so the lid's left end lifts clear (20° is about the most
// that keeps the bows inside the 36×36 hover box: their tops reach y ≈ −1.8).
// The lid widens 1px each side at constant 2px walls (the bows hold their
// size: growing them doesn't read); the box keeps its own 2px top edge (hidden under the
// lid at rest).
const GIFT_BOX =
  'M6 16V28A2 2 0 0 0 8 30H24A2 2 0 0 0 26 28V16ZM8 18H15V28H8ZM17 18H24V28H17Z';
// Each bow is a 2px band: Carbon's outer arc (centre GIFT_BOW, radius 4.4873;
// the right one mirrored, radius 4.4867) round a 2.5px hole at (12.5, 7.5).
const GIFT_BOW: Pt = [12.48699, 7.49838];
function giftLid(g: number, w: number): string {
  // The bows grow by g about their bottom inner corners (the hole keeps
  // sitting on the lid and against the knot), so their centres move (−g, −g).
  const [cx, cy, r] = [GIFT_BOW[0] - g, GIFT_BOW[1] - g, 4.4873 + g];
  const foot = cx - Math.sqrt(r * r - (10 - cy) ** 2); // the outer arc meets the lid top
  const knot = cy - Math.sqrt(r * r - (16 - cx) ** 2); // the two arcs meet at x = 16
  const big = (a: number) => (a > Math.PI ? 1 : 0);
  // The arc's sweep, foot to knot (clockwise on screen).
  const span =
    (Math.atan2(knot - cy, 16 - cx) -
      Math.atan2(10 - cy, foot - cx) +
      4 * Math.PI) %
    (2 * Math.PI);
  const [L, R] = [4 - w, 28 + w];
  const hr = 2.5 + g; // hole radius
  return (
    `M${f(L + 2)} 10H${f(foot)}A${f(r)} ${f(r)} 0 ${big(span)} 1 16 ${f(knot)}A${f(r - 0.0006)} ${f(r - 0.0006)} 0 ${big(span)} 1 ${f(32 - foot)} 10H${f(R - 2)}` +
    `A2 2 0 0 1 ${f(R)} 12V16A2 2 0 0 1 ${f(R - 2)} 18H${f(L + 2)}A2 2 0 0 1 ${f(L)} 16V12A2 2 0 0 1 ${f(L + 2)} 10Z` +
    `M17 ${f(7.5 - g)}A${f(hr)} ${f(hr)} 0 1 1 ${f(19.5 + g)} 10H17Z` +
    `M${f(12.5 - g)} ${f(5 - 2 * g)}A${f(hr)} ${f(hr)} 0 0 1 15 ${f(7.5 - g)}V10H${f(12.5 - g)}A${f(hr)} ${f(hr)} 0 0 1 ${f(12.5 - g)} ${f(5 - 2 * g)}Z` +
    `M${f(6 - w)} 12H15V16H${f(6 - w)}ZM17 16V12H${f(26 + w)}V16Z`
  );
}
export const GiftSpec = /* @__PURE__ */ hoverIcon('Gift', {
  geo: ({ h }) => ({
    box: { d: GIFT_BOX, ...EVENODD },
    lid: {
      d: giftLid(0, h),
      ...EVENODD,
      transform: `rotate(${f(20 * h)} 25 17)`,
    },
  }),
  static: /* @__PURE__ */ carbonArt(Gift32),
});

// Pricing and currency: the $ grows: pricing's S ends reach 1px further
// along their curves and currency's S ends 1px
// and the upright 1px further at each end; currency's ring grows 2px in diameter. The $ is its 2px
// centreline (the S averaged from Carbon's two edges; the currency $ is
// square-cornered), so it keeps its weight.
/** p moved `d` px along the direction from `from` to p. */
const reach = (p: Pt, from: Pt, d: number): Pt => {
  const l = Math.hypot(p[0] - from[0], p[1] - from[1]);
  return [p[0] + ((p[0] - from[0]) / l) * d, p[1] + ((p[1] - from[1]) / l) * d];
};
const PRICING_S: Pt[][] = [
  // cubic segments [start, c1, c2, end], joined by straight runs behind the upright
  [
    [22, 10],
    [20.68, 8.354],
    [19, 7.397],
    [17, 7.106],
  ],
  [
    [15, 7.025],
    [12.207, 7.215],
    [10, 8.686],
    [10, 11.242],
  ],
  [
    [10, 11.242],
    [10, 14.62],
    [12.28, 15.36],
    [15, 15.788],
  ],
  [
    [17, 16.08],
    [19.71, 16.505],
    [22, 17.2],
    [22, 20.515],
  ],
  [
    [22, 20.515],
    [22, 23.34],
    [19.77, 24.716],
    [17, 24.954],
  ],
  [
    [15, 24.964],
    [12.118, 24.79],
    [10.487, 23.84],
    [9, 22],
  ],
];
export const PricingTraditionalSpec = /* @__PURE__ */ hoverIcon(
  'PricingTraditional',
  {
    geo: ({ h }) => {
      const segs = PRICING_S;
      // The ends reach 1px further along their tangents (each end's first control point).
      const start = reach(segs[0][0], segs[0][1], h);
      const last = segs[segs.length - 1];
      const end = reach(last[3], last[2], h);
      const d =
        `M${P(start)}L${P(segs[0][0])}` +
        segs
          .map(
            ([a, b, c, e], i) =>
              `${i ? `L${P(a)}` : ''}C${P(b)} ${P(c)} ${P(e)}`
          )
          .join('') +
        `L${P(end)}`;
      return {
        s: { d, ...LINE },
        upright: { d: rectPath(15, 3 - h, 17, 29 + h) },
      };
    },
    static: /* @__PURE__ */ carbonArt(PricingTraditional32),
  }
);
const CURRENCY_S: Pt[] = [
  [21, 11],
  [12, 11],
  [12, 16],
  [20, 16],
  [20, 21],
  [11, 21],
];
export const CurrencySpec = /* @__PURE__ */ hoverIcon('Currency', {
  geo: ({ h }) => {
    const pts = [...CURRENCY_S];
    pts[0] = [pts[0][0] + h, pts[0][1]];
    pts[5] = [pts[5][0] - h, pts[5][1]];
    return {
      ring: { d: ringPath([16, 16], 13 + h, 2) },
      s: { d: filletPath(pts, 1), ...LINE },
      upright: {
        d: rectPath(15, 7 - h, 17, 11.5) + rectPath(15, 20.5, 17, 25 + h),
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(Currency32),
});

// Purchase: the card lifts 1px and grows 1px all
// round, its walls, stripe and line keeping their weight and their
// distances from the card's edges; the short line extends 2px.
export const PurchaseSpec = /* @__PURE__ */ hoverIcon('Purchase', {
  geo: ({ h }) => {
    const t = `translate(0 ${f(-h)})`;
    const [L, T, R, B] = [2 - h, 6 - h, 30 + h, 26 + h];
    const frame =
      `M${f(L + 2)} ${f(T)}H${f(R - 2)}A2 2 0 0 1 ${f(R)} ${f(T + 2)}V${f(B - 2)}A2 2 0 0 1 ${f(R - 2)} ${f(B)}H${f(L + 2)}A2 2 0 0 1 ${f(L)} ${f(B - 2)}V${f(T + 2)}A2 2 0 0 1 ${f(L + 2)} ${f(T)}Z` +
      rectPath(L + 2, T + 2, R - 2, B - 2);
    return {
      card: { d: frame, ...EVENODD, transform: t },
      stripe: { d: rectPath(L + 2, T + 5, R - 2, T + 7), transform: t },
      line: { d: rectPath(L + 4, B - 6, L + 14 + 2 * h, B - 4), transform: t },
    };
  },
  static: /* @__PURE__ */ carbonArt(Purchase32),
});

/** An annulus (radii ro, ri) cut off below the line y = cut. */
function ringAbove([cx, cy]: Pt, ro: number, ri: number, cut: number): string {
  const disc = (r: number) => {
    if (r <= 0 || cy - r >= cut) {
      return '';
    }
    if (cy + r <= cut) {
      return `M${f(cx - r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 0 ${f(cx + r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 0 ${f(cx - r)} ${f(cy)}Z`;
    }
    const dx = Math.sqrt(r * r - (cut - cy) ** 2);
    return `M${f(cx - dx)} ${f(cut)}A${f(r)} ${f(r)} 0 ${cut > cy ? 1 : 0} 1 ${f(cx + dx)} ${f(cut)}Z`;
  };
  return disc(ro) + disc(ri);
}

// Piggy bank slot. The pig is its 2px centrelines, fitted to Carbon: the body
// (one outline from the front leg's foot round to the back leg's), the belly
// between the legs, the tail, and the slot (a 2px bar).
//
// Hover: the body rocks back 10° anticlockwise about the
// belly's middle (16.5, 24), as if sliding on its bottom curve, its snout
// rising; the legs stay put (their feet hold and they stay upright, each
// leg's top riding up or down with the body where it meets it). The whole pig
// also grows 1/12 about its feet's middle (16.5, 27), at constant weight
// (its centrelines scale, the strokes don't), so its sides move about 1px out.
//
// Action: a coin appears above the pig, drops into
// the slot and disappears behind it; as it lands the body and belly (not the
// legs) bob 1px and the tail curls to face down, then back. 450ms, linear
// (each phase eases itself); one pass, no loop.
const PIG_BODY = [
  22.9, 25.05, 22.3, 25.9, 20.35, 26.1, 11.95, 25.65, 10.85, 9.3, 10.26, 6.27,
  10.7, 6.01, 15.4, 8.02, 22.99,
];
/** The hover's tilt (degrees, anticlockwise on screen), its pivot (the belly's middle), and the pig's growth about its feet's middle. */
export const PIG_TILT = 10;
export const PIG_PIVOT: Pt = [16.5, 24];
export const PIG_GROW = 1 / 12;
export const PIG_FEET: Pt = [16.5, 27];
/** The action's pass, in ms. */
export const PIG_ACTION_MS = 450;
type Map = (p: Pt) => Pt;
/**
 * The pig's maps at hover h with the action's bob: `body` takes a body
 * point, `top` a leg's top (it keeps its x, so the leg stays upright),
 * `foot` a foot; `s` is the growth (arc radii scale by it).
 */
function pigMaps(
  h: number,
  bob: number
): { body: Map; top: Map; foot: Map; s: number } {
  const a = (-PIG_TILT * h * Math.PI) / 180;
  const [c, sn] = [Math.cos(a), Math.sin(a)];
  const s = 1 + PIG_GROW * h;
  const turn = ([x, y]: Pt): Pt => {
    const [dx, dy] = [x - PIG_PIVOT[0], y + bob - PIG_PIVOT[1]];
    return [PIG_PIVOT[0] + dx * c - dy * sn, PIG_PIVOT[1] + dx * sn + dy * c];
  };
  const foot: Map = ([x, y]) => [
    PIG_FEET[0] + (x - PIG_FEET[0]) * s,
    PIG_FEET[1] + (y - PIG_FEET[1]) * s,
  ];
  return {
    body: (p) => foot(turn(p)),
    top: (p) => foot([p[0], turn(p)[1]]),
    foot,
    s,
  };
}
function pigBody({ body, top, foot, s }: ReturnType<typeof pigMaps>): string {
  const [
    jy,
    j1x,
    j1y,
    j2x,
    j2y,
    f1x,
    f1y,
    f2x,
    f2y,
    fy,
    b1x,
    b2x,
    b2y,
    bx,
    by,
    r,
    ly,
  ] = PIG_BODY;
  const [B, T, F] = [
    (x: number, y: number) => P(body([x, y])),
    (x: number, y: number) => P(top([x, y])),
    (x: number, y: number) => P(foot([x, y])),
  ];
  // One outline, feet first: the feet hold while the body's points move, so the legs stretch.
  return (
    `M${T(19, 24.5)}L${F(19, 27)}L${F(23, 27)}L${T(23, jy)}C${B(j1x, j1y)} ${B(j2x, j2y)} ${B(26, 19)}L${B(29, 19)}L${B(29, 14)}L${B(26, 14)}` +
    `C${B(f1x, f1y)} ${B(f2x, f2y)} ${B(24, fy)}L${B(24, 5)}L${B(20, 8)}L${B(15, 8)}C${B(b1x, 8)} ${B(b2x, b2y)} ${B(bx, by)}` +
    `A${f(r * s)} ${f(r * s)} 0 0 0 ${T(10, ly)}L${F(10, 27)}L${F(14, 27)}L${T(14, 24.5)}`
  );
}
/**
 * The tail: from the body at (6.5, 16) left to (5, 16), then an arc of
 * length π (radius 2 when fully curled) turning `turn` radians (+ curls up,
 * − curls down), then 2px straight on; its points through `body`.
 */
function tail(turn: number, body: Map): string {
  const pts: Pt[] = [
    [6.5, 16],
    [5, 16],
  ];
  let [x, y] = [5, 16];
  const step = Math.PI / 12;
  for (let i = 1; i <= 12; i++) {
    const heading = Math.PI - turn * ((i - 0.5) / 12); // radians, y up; π is left
    x += Math.cos(heading) * step;
    y -= Math.sin(heading) * step;
    pts.push([x, y]);
  }
  const end = Math.PI - turn;
  pts.push([x + Math.cos(end) * 2, y - Math.sin(end) * 2]);
  return polyPath(pts.map(body));
}
/** A 2px bar along a–b (its centreline). */
function bar(a: Pt, b: Pt): string {
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const [nx, ny] = [-(b[1] - a[1]) / l, (b[0] - a[0]) / l];
  return polyPath(
    [
      [a[0] - nx, a[1] - ny],
      [b[0] - nx, b[1] - ny],
      [b[0] + nx, b[1] + ny],
      [a[0] + nx, a[1] + ny],
    ],
    true
  );
}
/** The pig at hover h, with the action's bob (px), tail curl (0 up, 1 down) and coin (its centre's y and growth; none at 0). */
function pigShapes(h: number, bob = 0, curl = 0, coinY = 0, coin = 0): Shapes {
  const maps = pigMaps(h, bob);
  const { body, top, s } = maps;
  return {
    belly: {
      d: `M${P(top([14, 25]))}L${P(top([14, 24]))}L${P(top([19, 24]))}L${P(top([19, 25]))}`,
      ...MITER,
    },
    body: { d: pigBody(maps), ...LINE, strokeLinejoin: 'round' },
    tail: {
      d: tail(lerp(Math.PI / 2, -Math.PI / 2, curl), body),
      ...LINE,
      strokeLinejoin: 'round',
    },
    slot: { d: bar(body([13, 12]), body([20, 12])) },
    // The coin is as wide as the slot (7px: outer radius 3.5), a 2px ring, cut at the slot's top as it goes in.
    coin: {
      d: coin
        ? mapPath(
            ringAbove([16.5, coinY - bob], 3.5 * coin, 3.5 * coin - 2, 11),
            body,
            s
          )
        : '',
      ...EVENODD,
    },
  };
}
const ease01 = (t: number, a: number, b: number) =>
  ENTRANCE(Math.min(1, Math.max(0, (t - a) / (b - a))));
export const PiggyBankSlotSpec = /* @__PURE__ */ hoverIcon('PiggyBankSlot', {
  geo: ({ h }) => pigShapes(h),
  static: /* @__PURE__ */ carbonArt(PiggyBankSlot32),
  action: /* @__PURE__ */ defineAction({
    description:
      "Saved: a coin drops into the slot, and the pig bobs as it lands while its tail curls down and back. It doesn't loop: `loop` and `until` play one pass.",
    duration: PIG_ACTION_MS / 1000,
    loops: false,
    geo: ({ h, a }) => {
      if (a <= 0 || a >= 1) {
        return pigShapes(h);
      }
      const t = a * PIG_ACTION_MS;
      const coin = ease01(t, 0, 108); // the coin appears
      const y = lerp(6, 15, ease01(t, 54, 270)); // then drops past the slot (9px)
      const bob = Math.sin(Math.PI * Math.min(1, Math.max(0, (t - 137) / 126))); // as it goes in, the body dips 1px and comes back
      const curl = ease01(t, 198, 360) - ease01(t, 360, PIG_ACTION_MS); // the tail curls down, and back
      return pigShapes(h, bob, curl, y, coin);
    },
  }),
});

// ── Navigation ───────────────────────────────────────────────────────────────

// Arrange: the bars trade lengths so the stack flips (the short bar ends up
// at the bottom), staying centred, all together (no stagger).
const BAR_Y = [3, 11, 19, 27];
const BAR_W = [10, 16, 22, 28];
const arrangeTiming = /* @__PURE__ */ together();
export const ArrangeSpec = /* @__PURE__ */ hoverIcon('Arrange', {
  hover: arrangeTiming.hover,
  geo: ({ h }) => ({
    bars: {
      d: BAR_Y.map((y, i) => {
        const w = lerp(BAR_W[i], BAR_W[3 - i], arrangeTiming.at(h, i));
        return rectPath(16 - w / 2, y, 16 + w / 2, y + 2);
      }).join(''),
    },
  }),
  static: /* @__PURE__ */ carbonArt(Arrange32),
});

// Chevron up / down outline: the ring grows 2px in radius (as Add alt's) and
// the chevron grows 15% about its own centre (midway between its apex and
// ends) at constant 2px weight: its centreline points scale, the stroke
// doesn't. The toggle flips it like the Chevron toggles: it folds flat by
// 6/15 of the way (exit ease), then opens the other way (entrance ease).
const CHEVRON_UP = { ends: 18.707, apex: 11.414 };
const CHEVRON_DOWN = { ends: 13.293, apex: 20.586 };
function chevronShapes(p: number, h: number): Shapes {
  const q = foldProgress(p);
  const [ends, apex] = [
    lerp(CHEVRON_UP.ends, CHEVRON_DOWN.ends, q),
    lerp(CHEVRON_UP.apex, CHEVRON_DOWN.apex, q),
  ];
  const c: Pt = [16, (ends + apex) / 2];
  return {
    ring: { d: ringPath([16, 16], 13 + 2 * h, 2) },
    chevron: {
      d: polyPath(
        scalePts(
          [
            [8.707, ends],
            [16, apex],
            [23.293, ends],
          ],
          c,
          1 + 0.15 * h
        )
      ),
      ...MITER,
    },
  };
}
export const ChevronUpOutlineSpec = /* @__PURE__ */ hoverIcon(
  'ChevronUpOutline',
  {
    geo: ({ h }) => chevronShapes(0, h),
    static: /* @__PURE__ */ carbonArt(ChevronUpOutline32),
  }
);
export const ChevronDownOutlineSpec = /* @__PURE__ */ hoverIcon(
  'ChevronDownOutline',
  {
    geo: ({ h }) => chevronShapes(1, h),
    static: /* @__PURE__ */ carbonArt(ChevronDownOutline32),
  }
);
export const ChevronUpOutlineToggleSpec = /* @__PURE__ */ toggleIcon<
  'up' | 'down'
>('ChevronUpOutlineToggle', {
  states: ['up', 'down'],
  statics: [CChevronUpOutline, CChevronDownOutline],
  geo: ({ h, p }) => chevronShapes(p, h),
  // Linear: the geometry applies the fold's two-part easing itself.
  change: (turningOn, _fr, tween) =>
    tween('p', turningOn ? 1 : 0, {
      duration: TOGGLE_IN.duration,
      ease: [0, 0, 1, 1],
    }),
});

// ── Senses ───────────────────────────────────────────────────────────────────

// Cognitive: the brain grows 10% about its centre and its fold lines reach
// 1.5px further along their curves, all at constant line weight; the stem
// and the small hook at lower right hold, the stem's top following the
// brain. The brain is its centrelines,
// fitted to Carbon (drawn 2.04px, as Carbon's is a touch heavier).
function cognitive(h: number): Shapes {
  const k = 1 + 0.1 * h;
  const c: Pt = [16, 13];
  const S = ([x, y]: Pt): Pt => [c[0] + (x - c[0]) * k, c[1] + (y - c[1]) * k];
  const R = (r: number) => f(r * k);
  const e = 1.5 * h; // fold ends reach
  const p = (x: number, y: number) => P(S([x, y]));
  const d =
    `M${p(20, 20)}L${p(23, 20)}A${R(6)} ${R(6)} 0 0 0 ${p(29, 14)}L${p(29, 13)}A${R(10)} ${R(10)} 0 0 0 ${p(19, 3)}L${p(11, 3)}A${R(8)} ${R(8)} 0 0 0 ${p(3, 11)}L${p(3, 14)}A${R(4)} ${R(4)} 0 0 0 ${p(7, 18)}L${p(9, 18)}` +
    `M${p(14 + e, 14)}L${p(13, 14)}A${R(4)} ${R(4)} 0 0 0 ${p(13, 22)}` +
    `M${p(3, 11)}L${p(6, 11)}A${R(2)} ${R(2)} 0 0 0 ${p(8, 9)}L${p(8, 8 - e)}` +
    `M${p(18, 3)}L${p(18, 6)}A${R(2)} ${R(2)} 0 0 1 ${p(16, 8)}L${p(14 - e, 8)}` +
    `M${p(28.54, 10)}L${p(26, 10)}A${R(2)} ${R(2)} 0 0 0 ${p(24, 12)}L${p(24, 13 + e)}` +
    // The small hook, lower right, holds (its top reaches up into the grown outline).
    `M22 25L23 25A4 4 0 0 0 27 21L27 ${f(18.5 + 0.8 * h)}`;
  const stemTop = S([13, 22]);
  return {
    brain: { d, ...LINE, strokeWidth: 2.04 },
    stem: {
      d: filletPath(
        [stemTop, [stemTop[0] + 1.96, stemTop[1]], [19.245, 29.5]],
        1
      ),
      ...LINE,
      strokeWidth: 2.04,
    },
  };
}
export const CognitiveSpec = /* @__PURE__ */ hoverIcon('Cognitive', {
  geo: ({ h }) => cognitive(h),
  static: /* @__PURE__ */ carbonArt(Cognitive32),
});

// ── Controls ─────────────────────────────────────────────────────────────────

// Dashboard: the frame grows 1px out on every side, as Data table's does
// (walls hold 2px), and the rule across it rises 2px, the divider above it
// shortening to match. Below, the gauge and the bars rise 1px: the gauge's
// arc turns 45° clockwise and closes 30° of its gap (270° → 300°), and
// the two bars trade heights, the tall one dropping as the short one climbs
// past it. Every part is a 2px centreline or wall.
const GAUGE_R = 4;
const gaugePt = (c: Pt, deg: number) =>
  `${f(c[0] + GAUGE_R * Math.cos((deg * Math.PI) / 180))} ${f(c[1] + GAUGE_R * Math.sin((deg * Math.PI) / 180))}`;
export const DashboardSpec = /* @__PURE__ */ hoverIcon('Dashboard', {
  geo: ({ h }) => {
    const rule = 11 - 2 * h; // the rule's top edge
    const c: Pt = [11, 21 - h];
    const [a0, a1] = [270 + 15 * h, 540 + 45 * h]; // the arc, clockwise
    const bar = (x: number, top: number) => rectPath(x, top - h, x + 2, 26 - h);
    return {
      frame: {
        d:
          roundedRectPath(2 - h, 2 - h, 30 + h, 30 + h) +
          rectPath(4 - h, 4 - h, 12, rule) +
          rectPath(14, 4 - h, 28 + h, rule) +
          rectPath(4 - h, rule + 2, 28 + h, 28 + h),
        ...EVENODD,
      },
      gauge: {
        d: `M${gaugePt(c, a0)}A${GAUGE_R} ${GAUGE_R} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${gaugePt(c, a1)}`,
        ...LINE,
      },
      bars: { d: bar(20, lerp(16, 21, h)) + bar(24, lerp(21, 16, h)) },
    };
  },
  static: /* @__PURE__ */ carbonArt(Dashboard32),
});

// Dashboard reference: Dashboard's hover on Carbon's --reference drawing.
// The frame grows 1px out on every side and the rule rises 2px; the walls
// Carbon cuts for the badge keep their open ends where they are (the left
// wall at y 16, the bottom wall at x 16), so their 4px to the badge holds.
// The three bars (where Dashboard has a gauge and two) rise 1px, and the two
// Dashboard has trade heights; the third holds its height. The reference
// arrow's head alone (so the gap from arrowhead to chart matches chart to
// right edge)
// reaches 1px up and 1px right, its tail held (Analytics reference's arrow):
// at full hover it is 3px from the bars, as the bars are from the frame's
// right wall. The cut wall ends stay at least 3.58px from it.
export const DASHBOARD_ARROW_REACH = 1;
export const DashboardReferenceSpec = /* @__PURE__ */ hoverIcon(
  'DashboardReference',
  {
    geo: ({ h }) => {
      const rule = 11 - 2 * h; // the rule's top edge
      const [x0, y0, x1, y1] = [2 - h, 2 - h, 30 + h, 30 + h]; // the frame's outer edge
      const bar = (x: number, top: number) =>
        rectPath(x, top - h, x + 2, 26 - h);
      return {
        frame: {
          d:
            referenceFrame(x0, y0, x1, y1, rule + 2) +
            rectPath(x0 + 2, y0 + 2, 12, rule) +
            rectPath(14, y0 + 2, x1 - 2, rule),
          ...EVENODD,
        },
        bars: {
          d: bar(16, 18) + bar(20, lerp(16, 21, h)) + bar(24, lerp(21, 16, h)),
        },
        badge: { d: referenceArrow(DASHBOARD_ARROW_REACH * h) },
      };
    },
    static: /* @__PURE__ */ carbonArt(DashboardReference32),
  }
);

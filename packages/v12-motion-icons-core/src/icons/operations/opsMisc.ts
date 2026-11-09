/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Bookmark32 from '@carbon/icons/es/bookmark/32.js';
import BookmarkFilled32 from '@carbon/icons/es/bookmark--filled/32.js';
import BookmarkAdd32 from '@carbon/icons/es/bookmark--add/32.js';
import Flag32 from '@carbon/icons/es/flag/32.js';
import FlagFilled32 from '@carbon/icons/es/flag--filled/32.js';
import Pin32 from '@carbon/icons/es/pin/32.js';
import PinFilled32 from '@carbon/icons/es/pin--filled/32.js';
import Send32 from '@carbon/icons/es/send/32.js';
import SendFilled32 from '@carbon/icons/es/send--filled/32.js';
import SendAlt32 from '@carbon/icons/es/send--alt/32.js';
import SendAltFilled32 from '@carbon/icons/es/send--alt--filled/32.js';
import Recommend32 from '@carbon/icons/es/recommend/32.js';
import Translate32 from '@carbon/icons/es/translate/32.js';
import Code32 from '@carbon/icons/es/code/32.js';
import Clean32 from '@carbon/icons/es/clean/32.js';
import AddComment32 from '@carbon/icons/es/add-comment/32.js';
import { defineAction, hoverIcon, carbonArt } from '../../engine';
import { mapPath, pathPoints, rectPath, type Pt } from '../../geometry';
import { f } from '../../paint';
import { cutToBox, movePathBy, phase } from '../../actionGeo';
import { ENTRANCE, EXIT, STANDARD } from '../../ease';

/**
 * Bookmark, Flag, Pin, Send, Recommend, Translate, Code, Clean and Add
 * comment on the frame engine: the same motion as their reference animations, on the
 * shared hover (160ms entrance in, 120ms exit out), at constant line
 * weight, no masks. Every shape is Carbon's own outline at rest (its exact
 * numbers); on hover the parts that move are moved as geometry.
 *
 *  - Bookmark / Bookmark filled / Bookmark add: the notched tail drops 3px,
 *    the sides lengthening to it. Bookmark add's plus arms reach 2px at
 *    each end (set-wide rule).
 *  - Flag / Flag filled: the flag's notched end reaches 3px further right.
 *  - Pin / Pin filled: the head slides 3.26px down-left along the needle,
 *    which shortens; the needle's tip holds.
 *  - Send / Send filled, Send alt / Send alt filled: the plane moves 2px
 *    forward as one piece (no tail fold).
 *  - Recommend: the ring grows 2px in radius (set-wide container rule), the ribbon's top following it, and the ribbon's tails drop 3px.
 *  - Translate: the A rises (+2, −4) and the character drops (−2, +5).
 *  - Code: the chevrons step 2px apart, the slash grows 3px at each end.
 *  - Clean: Clean's sweep: the broom head bends as it drags left, its
 *    bristles on the ground, the handle leaning in; the three dashes slide
 *    4px left together.
 *  - Add comment: the bubble grows 2px on each side (set-wide container
 *    rule), its tail's tip holding; the plus arms reach 2px at each end.
 */

const P = ([x, y]: Pt) => `${f(x)} ${f(y)}`;
const polyD = (pts: readonly Pt[]) => `M${pts.map(P).join('L')}Z`;
const lerpPt = (a: Pt, b: Pt, t: number): Pt => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
];

/** Carbon's points that `pick` selects, moved by (dx, dy). */
const moveSome = (
  d: string,
  pick: (p: Pt) => boolean,
  dx: number,
  dy: number
) => mapPath(d, (p) => (pick(p) ? [p[0] + dx, p[1] + dy] : p));

/** A plus about c, its arms reaching l from it, 1px half-width (Carbon's point order). */
const plus = ([cx, cy]: Pt, l: number) =>
  polyD([
    [cx + 1, cy - 1],
    [cx + 1, cy - l],
    [cx - 1, cy - l],
    [cx - 1, cy - 1],
    [cx - l, cy - 1],
    [cx - l, cy + 1],
    [cx - 1, cy + 1],
    [cx - 1, cy + l],
    [cx + 1, cy + l],
    [cx + 1, cy + 1],
    [cx + l, cy + 1],
    [cx + l, cy - 1],
  ]);

// ── Bookmark ─────────────────────────────────────────────────────────────────

// Bookmark, Bookmark filled, Bookmark add: the notched tail
// (every point below y = 20) drops 3px; the straight sides lengthen.
const TAIL_DROP = 3;
const tail = (d: string) => (h: number) =>
  moveSome(d, ([, y]) => y > 20, 0, TAIL_DROP * h);

const BOOKMARK = tail(
  'M24 4L24 26.75L16.9 23.16L16 22.71L15.1 23.16L8 26.75L8 4L24 4M24 2L8 2A2 2 0 0 0 6 4L6 30L16 25L26 30L26 4A2 2 0 0 0 24 2Z'
);
export const BookmarkSpec = /* @__PURE__ */ hoverIcon('Bookmark', {
  geo: ({ h }) => ({ body: { d: BOOKMARK(h) } }),
  static: /* @__PURE__ */ carbonArt(Bookmark32),
});

const BOOKMARK_FILLED = tail(
  'M24 2L8 2A2 2 0 0 0 6 4L6 30L16 24.9462L26 30L26 4A2 2 0 0 0 24 2Z'
);
export const BookmarkFilledSpec = /* @__PURE__ */ hoverIcon('BookmarkFilled', {
  geo: ({ h }) => ({ body: { d: BOOKMARK_FILLED(h) } }),
  static: /* @__PURE__ */ carbonArt(BookmarkFilled32),
});

// The plus's arms reach 2px at each end and the bookmark's open corner (its
// top edge's end, its right side's top) draws back with them, so the space
// between the plus and the bookmark holds.
const bookmarkAdd = (g: number) =>
  `M24 ${f(16 + g)}L24 26.7515L16.9038 23.1621L16 22.7051L15.0991 23.1611L8 26.748L8 4L${f(18 - g)} 4L${f(18 - g)} 2L8 2A2 2 0 0 0 6 4L6 30L16 24.9463L26 30L26 ${f(16 + g)}Z`;
export const BookmarkAddSpec = /* @__PURE__ */ hoverIcon('BookmarkAdd', {
  geo: ({ h }) => ({
    body: { d: tail(bookmarkAdd(2 * h))(h) },
    plus: { d: plus([25, 7], 5 + 2 * h) },
  }),
  static: /* @__PURE__ */ carbonArt(BookmarkAdd32),
});

// ── Flag ─────────────────────────────────────────────────────────────────────

// Flag / Flag filled: the notched end (every point right of the
// pole) reaches 3px right; the top and bottom edges lengthen.
const FLAG_REACH = 3;
const flag = (d: string) => (h: number) =>
  moveSome(d, ([x]) => x > 15, FLAG_REACH * h, 0);
const FLAG = flag(
  'M6 30L4 30L4 2L28 2L22.2 11L28 20L6 20ZM6 18L24.33 18L19.8 11L24.33 4L6 4Z'
);
const FLAG_FILLED = flag('M6 30L4 30L4 2L28 2L22.2 11L28 20L6 20Z');
export const FlagSpec = /* @__PURE__ */ hoverIcon('Flag', {
  geo: ({ h }) => ({ flag: { d: FLAG(h) } }),
  static: /* @__PURE__ */ carbonArt(Flag32),
});
export const FlagFilledSpec = /* @__PURE__ */ hoverIcon('FlagFilled', {
  geo: ({ h }) => ({ flag: { d: FLAG_FILLED(h) } }),
  static: /* @__PURE__ */ carbonArt(FlagFilled32),
});

// ── Pin ──────────────────────────────────────────────────────────────────────

// Pin / Pin filled: the head (every point but the needle's tip)
// slides 3.258px down-left, along the needle, which shortens.
const PIN_SLIDE = 3.258;
const pin = (d: string) => (h: number) =>
  moveSome(d, ([x, y]) => !(x < 4 && y > 28), -PIN_SLIDE * h, PIN_SLIDE * h);
const PIN = pin(
  'M28.59 13.31L30 11.9L20 2L18.69 3.42L19.87 4.6L8.38 14.32L6.66 12.61L5.25 14L10.91 19.68L2 28.58L3.41 30L12.32 21.09L18 26.75L19.39 25.33L17.68 23.62L27.4 12.13ZM16.26 22.2L9.8 15.74L21.29 6L26 10.71Z'
);
const PIN_FILLED = pin(
  'M28.5858 13.3137L30 11.9L20 2L18.6858 3.415L19.8716 4.6007L8.38 14.3225L6.6641 12.6067L5.25 14L10.9072 19.6773L2 28.5831L3.41 30L12.3211 21.0913L18 26.7482L19.3929 25.3342L17.6765 23.618L27.4005 12.1285Z'
);
export const PinSpec = /* @__PURE__ */ hoverIcon('Pin', {
  geo: ({ h }) => ({ pin: { d: PIN(h) } }),
  static: /* @__PURE__ */ carbonArt(Pin32),
});
export const PinFilledSpec = /* @__PURE__ */ hoverIcon('PinFilled', {
  geo: ({ h }) => ({ pin: { d: PIN_FILLED(h) } }),
  static: /* @__PURE__ */ carbonArt(PinFilled32),
});

// ── Send ─────────────────────────────────────────────────────────────────────

/**
 * A paper plane as Carbon draws it: 2px walls on the centreline polygon
 * tail A → tip R → tail B → notch N, round outer corners (r 1) at A, R
 * and B, sharp at N, and a 2px nib from N to E. On hover the centreline
 * points move; the outline is rebuilt from them (each wall offset 1px
 * either side), so the walls hold 2px whatever their angle.
 *
 * Each of Carbon's points takes the move of the rebuilt point it sits on:
 * a point on a round corner keeps its place along the arc, any other
 * point follows the nearest rebuilt corner or crossing. Rest is Carbon's
 * own numbers exactly.
 */
type Dart = { A: Pt; R: Pt; B: Pt; N: Pt; E: Pt };
type Line = { p: Pt; u: Pt };
const unitV = (a: Pt, b: Pt): Pt => {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const l = Math.hypot(dx, dy);
  return [dx / l, dy / l];
};
const meet = (a: Line, b: Line): Pt => {
  const den = a.u[0] * b.u[1] - a.u[1] * b.u[0];
  const t = ((b.p[0] - a.p[0]) * b.u[1] - (b.p[1] - a.p[1]) * b.u[0]) / den;
  return [a.p[0] + a.u[0] * t, a.p[1] + a.u[1] * t];
};
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

function dartGeo({ A, R, B, N, E }: Dart) {
  const poly = [A, R, B, N];
  const area = poly.reduce(
    (s, p, i) => s + p[0] * poly[(i + 1) % 4][1] - poly[(i + 1) % 4][0] * p[1],
    0
  );
  const edge = (a: Pt, b: Pt) => {
    const u = unitV(a, b);
    const n: Pt = area > 0 ? [u[1], -u[0]] : [-u[1], u[0]]; // outward
    const off = (d: number): Line => ({
      p: [a[0] + n[0] * d, a[1] + n[1] * d],
      u,
    });
    return { n, out: off(1), in: off(-1) };
  };
  const [AR, RB, BN, NA] = [edge(A, R), edge(R, B), edge(B, N), edge(N, A)];
  const w = unitV(N, E);
  const nib = [1, -1].map(
    (s): Line => ({ p: [N[0] - w[1] * s, N[1] + w[0] * s], u: w })
  );
  const tips = [
    {
      V: A,
      a0: Math.atan2(NA.n[1], NA.n[0]),
      a1: Math.atan2(AR.n[1], AR.n[0]),
    },
    {
      V: R,
      a0: Math.atan2(AR.n[1], AR.n[0]),
      a1: Math.atan2(RB.n[1], RB.n[0]),
    },
    {
      V: B,
      a0: Math.atan2(RB.n[1], RB.n[0]),
      a1: Math.atan2(BN.n[1], BN.n[0]),
    },
  ];
  const corners: Pt[] = [
    meet(NA.in, AR.in),
    meet(AR.in, RB.in),
    meet(RB.in, BN.in),
    meet(BN.out, NA.out),
    ...nib.flatMap((l) => [
      meet(l, BN.in),
      meet(l, NA.in),
      meet(l, BN.out),
      meet(l, NA.out),
    ]),
    [E[0] - w[1], E[1] + w[0]],
    [E[0] + w[1], E[1] - w[0]],
  ];
  return { tips, corners };
}

/** Carbon's plane outline `d` (centreline `rest`), redrawn on any centreline. */
function dartAt(d: string, rest: Dart) {
  const g0 = dartGeo(rest);
  return (cur: Dart) => {
    const g = dartGeo(cur);
    return mapPath(d, (p) => {
      const ti = g0.tips.findIndex(
        ({ V }) => Math.abs(Math.hypot(p[0] - V[0], p[1] - V[1]) - 1) < 0.08
      );
      if (ti >= 0) {
        // On a round corner: keep its place along the arc.
        const [t0, t] = [g0.tips[ti], g.tips[ti]];
        const frac =
          wrap(Math.atan2(p[1] - t0.V[1], p[0] - t0.V[0]) - t0.a0) /
          wrap(t0.a1 - t0.a0);
        const th0 = t0.a0 + frac * wrap(t0.a1 - t0.a0);
        const th = t.a0 + frac * wrap(t.a1 - t.a0);
        return [
          p[0] + t.V[0] + Math.cos(th) - t0.V[0] - Math.cos(th0),
          p[1] + t.V[1] + Math.sin(th) - t0.V[1] - Math.sin(th0),
        ];
      }
      let [best, bd] = [0, Infinity];
      g0.corners.forEach((c, i) => {
        const dd = Math.hypot(p[0] - c[0], p[1] - c[1]);
        if (dd < bd) {
          [best, bd] = [i, dd];
        }
      });
      return [
        p[0] + g.corners[best][0] - g0.corners[best][0],
        p[1] + g.corners[best][1] - g0.corners[best][1],
      ];
    });
  };
}

/** Carbon's plane outline `d`, its centreline moving from `rest` to `hover`. */
function dart(d: string, rest: Dart, hover: Dart) {
  const draw = dartAt(d, rest);
  return (h: number) => draw(lerpDart(rest, hover, h));
}
const lerpDart = (a: Dart, b: Dart, t: number): Dart => ({
  A: lerpPt(a.A, b.A, t),
  R: lerpPt(a.R, b.R, t),
  B: lerpPt(a.B, b.B, t),
  N: lerpPt(a.N, b.N, t),
  E: lerpPt(a.E, b.E, t),
});
/** `base` plus `w` of the move from `rest` to `to` (the action's fold over the hover's position). */
const addDart = (base: Dart, rest: Dart, to: Dart, w: number): Dart => {
  const k = (n: keyof Dart): Pt => [
    base[n][0] + (to[n][0] - rest[n][0]) * w,
    base[n][1] + (to[n][1] - rest[n][1]) * w,
  ];
  return { A: k('A'), R: k('R'), B: k('B'), N: k('N'), E: k('E') };
};

// Send / Send filled: the plane moves 2px forward as one piece (Send's tail fold is left out: it doesn't read at icon scale).
const SEND_REST: Dart = {
  A: [5, 5],
  R: [27, 16],
  B: [5, 27],
  N: [8, 16],
  E: [18, 16],
};
const SEND_HOVER: Dart = {
  A: [7, 5],
  R: [29, 16],
  B: [7, 27],
  N: [10, 16],
  E: [20, 16],
};
/** The action's fold: the wings fold up toward the spine (the tail corners 5.5px in, the notch 1.5px back), as a paper plane tightens. */
const SEND_FOLD: Dart = {
  A: [6.5, 10.5],
  R: [27, 16],
  B: [6.5, 21.5],
  N: [9.5, 16],
  E: [18, 16],
};
const SEND_D =
  'M27.45 15.11L5.45 4.11A1 1 0 0 0 4.37 4.23A1 1 0 0 0 4.04 5.23L7 16L4 26.74A1 1 0 0 0 5 28A1 1 0 0 0 5.45 27.89L27.45 16.89A1 1 0 0 0 27.45 15.11ZM6.55 25.11L8.76 17L18 17L18 15L8.76 15L6.55 6.89L24.76 16Z';
const SEND = dart(SEND_D, SEND_REST, SEND_HOVER);
const SEND_AT = dartAt(SEND_D, SEND_REST);
const SEND_FILLED = dart(
  'M27.45 15.11L5.45 4.11A1 1 0 0 0 4.37 4.23A1 1 0 0 0 4.04 5.23L6.69 15L18 15L18 17L6.69 17L4 26.74A1 1 0 0 0 5 28A1 1 0 0 0 5.45 27.89L27.45 16.89A1 1 0 0 0 27.45 15.11Z',
  SEND_REST,
  SEND_HOVER
);
/**
 * Send's action (240ms): the wings fold up as it launches (the first 48ms),
 * it flies out to the right folded (96ms, productive exit), and the next
 * plane glides in from the left, still folded, unfolding as it lands (144ms,
 * productive entrance).
 */
const SEND_OUT = 0.4;
export const SendSpec = /* @__PURE__ */ hoverIcon('Send', {
  geo: ({ h }) => ({ plane: { d: SEND(h) } }),
  static: /* @__PURE__ */ carbonArt(Send32),
  action: /* @__PURE__ */ defineAction({
    description:
      'Sent: the paper plane folds its wings and flies off to the right, and the next plane glides in from the left, unfolding as it lands. Looped (while sending), the planes keep coming. With a hand-off (`then`), the status mark enters as the new plane lands.',
    duration: 0.24,
    geo: ({ h, a }) => {
      if (a >= 1) {
        return { plane: { d: SEND(h) } };
      }
      const dx =
        a < SEND_OUT
          ? 32 * EXIT(phase(a, 0, SEND_OUT))
          : -32 * (1 - ENTRANCE(phase(a, SEND_OUT, 1)));
      const fold =
        a < SEND_OUT
          ? STANDARD(phase(a, 0, 0.2))
          : 1 - ENTRANCE(phase(a, 0.55, 1));
      const cur = addDart(
        lerpDart(SEND_REST, SEND_HOVER, h),
        SEND_REST,
        SEND_FOLD,
        fold
      );
      return { plane: { d: cutToBox(movePathBy(SEND_AT(cur), dx, 0)) } };
    },
  }),
});
export const SendFilledSpec = /* @__PURE__ */ hoverIcon('SendFilled', {
  geo: ({ h }) => ({ plane: { d: SEND_FILLED(h) } }),
  static: /* @__PURE__ */ carbonArt(SendFilled32),
});

// Send alt / Send alt filled: the plane moves 2px up-right as one piece
// (no tail fold).
const ALT_REST: Dart = {
  A: [5.014, 12.995],
  R: [27, 5],
  B: [19, 27],
  N: [15, 17],
  E: [20.295, 11.705],
};
const ALT_HOVER: Dart = {
  A: [7.014, 10.995],
  R: [29, 3],
  B: [21, 25],
  N: [17, 15],
  E: [22.295, 9.705],
};
const SEND_ALT_D =
  'M27.71 4.29A1 1 0 0 0 26.66 4.06L4.66 12.06A1 1 0 0 0 4.66 13.93L14.26 17.77L18.1 27.37A1 1 0 0 0 19 28L19 28A1 1 0 0 0 19.92 27.34L27.92 5.34A1 1 0 0 0 27.71 4.29ZM19 24.2L16.21 17.2L21 12.41L19.59 11L14.76 15.83L7.8 13L25.33 6.67Z';
const SEND_ALT_FILLED_D =
  'M27.71 4.29A1 1 0 0 0 26.66 4.06L4.66 12.06A1 1 0 0 0 4.66 13.93L13.25 17.36L19.59 11L21 12.41L14.63 18.78L18.07 27.37A1 1 0 0 0 19 28L19 28A1 1 0 0 0 19.92 27.34L27.92 5.34A1 1 0 0 0 27.71 4.29Z';
const SEND_ALT = dart(SEND_ALT_D, ALT_REST, ALT_HOVER);
const SEND_ALT_FILLED = dart(SEND_ALT_FILLED_D, ALT_REST, ALT_HOVER);
export const SendAltSpec = /* @__PURE__ */ hoverIcon('SendAlt', {
  geo: ({ h }) => ({ plane: { d: SEND_ALT(h) } }),
  static: /* @__PURE__ */ carbonArt(SendAlt32),
});
export const SendAltFilledSpec = /* @__PURE__ */ hoverIcon('SendAltFilled', {
  geo: ({ h }) => ({ plane: { d: SEND_ALT_FILLED(h) } }),
  static: /* @__PURE__ */ carbonArt(SendAltFilled32),
});

// ── Recommend ────────────────────────────────────────────────────────────────

// Recommend: the ring (centre 16,11; 2px wall on r 8) grows 2px in
// radius; the ribbon's legs stay where they are, their tops meeting the
// ring where it now crosses them, and the ribbon's tails drop 3px.
const RING_C: Pt = [16, 11];
const RING_GROW = 2;
const RIBBON_DROP = 3;
export const RecommendSpec = /* @__PURE__ */ hoverIcon('Recommend', {
  geo: ({ h }) => {
    const g = RING_GROW * h;
    const d = RIBBON_DROP * h;
    const R = 9 + g; // outer edge
    // Where the outer edge crosses the legs' outer (x = 10, 22) and inner (x = 12, 20) sides, from Carbon's.
    const yo = 17.69 + Math.sqrt(R * R - 36) - Math.sqrt(45);
    const yi = 19.05 + Math.sqrt(R * R - 16) - Math.sqrt(65);
    const k = (7 + g) / 7;
    const inner = ([x, y]: Pt) =>
      P([RING_C[0] + (x - RING_C[0]) * k, RING_C[1] + (y - RING_C[1]) * k]);
    const r = f(R);
    const ri = f(7 + g);
    return {
      medal: {
        d:
          `M16 ${f(2 - g)}A${r} ${r} 0 0 0 10 ${f(yo)}L10 ${f(30 + d)}L16 ${f(26 + d)}L22 ${f(30 + d)}L22 ${f(yo)}A${r} ${r} 0 0 0 16 ${f(2 - g)}Z` +
          `M20 ${f(26.26 + d)}L17.11 ${f(24.34 + d)}L16 ${f(23.6 + d)}L14.89 ${f(24.34 + d)}L12 ${f(26.26 + d)}L12 ${f(yi)}A${f(8.88 + g)} ${f(8.88 + g)} 0 0 0 20 ${f(yi)}Z` +
          `M${inner([20.89, 16])}A${ri} ${ri} 0 1 1 ${inner([23, 11])}A${ri} ${ri} 0 0 1 ${inner([20.89, 16])}Z`,
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(Recommend32),
});

// ── Translate ────────────────────────────────────────────────────────────────

// Translate: two rigid moves — the A (+2, −4), the character (−2, +5).
const TRANSLATE_A =
  'M27.85,29H30L24,14H21.65l-6,15H17.8l1.6-4h6.85ZM20.2,23l2.62-6.56L25.45,23Z';
const TRANSLATE_CHAR =
  'M18,7V5H11V2H9V5H2V7H12.74a14.71,14.71,0,0,1-3.19,6.18A13.5,13.5,0,0,1,7.26,9H5.16a16.47,16.47,0,0,0,3,5.58A16.84,16.84,0,0,1,3,18l.75,1.86A18.47,18.47,0,0,0,9.53,16a16.92,16.92,0,0,0,5.76,3.84L16,18a14.48,14.48,0,0,1-5.12-3.37A17.64,17.64,0,0,0,14.8,7Z';
export const TranslateSpec = /* @__PURE__ */ hoverIcon('Translate', {
  geo: ({ h }) => ({
    a: { d: TRANSLATE_A, transform: `translate(${f(2 * h)} ${f(-4 * h)})` },
    char: {
      d: TRANSLATE_CHAR,
      transform: `translate(${f(-2 * h)} ${f(5 * h)})`,
    },
  }),
  static: /* @__PURE__ */ carbonArt(Translate32),
});

// ── Code ─────────────────────────────────────────────────────────────────────

// Code: the chevrons step 2px apart (a pair); the slash (Carbon's 2px
// bar turned −75°) grows 3px at each end along its length.
const CODE_LEFT = 'M1 16 8 9 9.41 10.41 3.83 16 9.41 21.59 8 23 1 16z';
const CODE_RIGHT = 'M31 16 24 23 22.59 21.59 28.17 16 22.59 10.41 24 9 31 16z';
export const CodeSpec = /* @__PURE__ */ hoverIcon('Code', {
  geo: ({ h }) => ({
    right: { d: CODE_RIGHT, transform: `translate(${f(2 * h)} 0)` },
    left: { d: CODE_LEFT, transform: `translate(${f(-2 * h)} 0)` },
    slash: {
      d: rectPath(5.91 - 3 * h, 15, 26.08 + 3 * h, 17),
      transform: 'rotate(-75 15.996 16)',
    },
  }),
  static: /* @__PURE__ */ carbonArt(Code32),
});

// ── Clean ────────────────────────────────────────────────────────────────────

// Clean: the broom sweeps left and warps: the head bends as it
// drags, its bristles staying on the ground (y 29), and the handle leans in
// to it. Carbon's own outline is carried by the motion Clean gives its
// broom: each point of the outline moves as the nearby parts of the reference broom
// do (a smooth, inverse-distance blend of their moves), so rest is exactly
// Carbon and the walls warp with the head rather than being redrawn. The
// dashes slide 4px left together (Carbon's 2px bars; no stagger).
const BROOM =
  'M17.0029 20A4.8952 4.8952 0 0 0 14.5985 15.8271L22 3L20.2691 2L12.6933 15.126A5.6988 5.6988 0 0 0 7.45 16.6289C3.7064 20.24 3.9963 28.6821 4.01 29.04A1 1 0 0 0 5.01 30L20.0012 30A1 1 0 0 0 20.6012 28.2C17.0615 25.5439 17.0029 20.0537 17.0029 20Z' +
  'M11.93 16.9971A3.11 3.11 0 0 1 15.0041 20C15.0041 20.0381 15.006 20.208 15.0209 20.4688L9.1215 17.8452A3.8 3.8 0 0 1 11.93 16.9971Z' +
  'M15.4494 28A5.2 5.2 0 0 1 14 25L12 25A6.4993 6.4993 0 0 0 12.9684 28L10.7451 28A16.6166 16.6166 0 0 1 10 24L8 24A17.3424 17.3424 0 0 0 8.6652 28L6 28C6.031 26.1636 6.29 22.1079 7.8027 19.4473L15.3357 22.7973A13.0253 13.0253 0 0 0 17.5968 28Z';
const BROOM_LOOPS: Pt[][] = /* @__PURE__ */ (() =>
  BROOM.split('M')
    .filter(Boolean)
    .map((sub) => pathPoints(`M${sub}`, 0.4)))();
// Clean's broom (centrelines), at rest and at full hover: same commands.
const AE_BROOM: [string, string][] = [
  [
    'M19.966,28.963 C16.004,26.043 16,20 16,20 C16,20 16.047,17.294 13.301,16.243 C13.301,16.243 10.524,15.141 8.157,17.336 C6.346,19.147 5.516,22.115 5.175,24.848 C4.964,26.537 4.971,28.981 4.971,28.981 L19.954,29',
    'M16.216,28.956 C10.719,25.087 11.026,22.645 11.026,22.645 C11.026,22.645 12.463,19.347 10.217,17.449 C10.217,17.449 7.188,16 4.562,17.346 C1.936,18.692 0.994,21.252 1,24 C0.996,27 2,28.988 2,28.988 L16.204,29',
  ],
  ['M7.498,18.194 L16.232,22.116', 'M3.471,18.013 L11.056,23.015'],
  ['M21.133,2.496 L13.117,16.398', 'M21.959,7.011 L9.671,17.333'],
  ['M9,24 C9,25.914 10,29 10,29', 'M5,24 C5,27.406 6.498,29 6.498,29'],
  ['M13,25 C13,26.953 15,29 15,29', 'M8.492,25 C8.492,28 11,29 11,29'],
];
/** An absolute M/L/C path sampled at a fixed count per segment (so two morph keys line up). */
function sampleFixed(d: string, n = 12): Pt[] {
  const t = d.match(/[MLC]|-?\d*\.?\d+/g)!;
  const out: Pt[] = [];
  let [k, cmd] = [0, ''];
  let cur: Pt = [0, 0];
  const num = () => Number(t[k++]);
  while (k < t.length) {
    if (/[MLC]/.test(t[k])) {
      cmd = t[k++];
    }
    if (cmd === 'C') {
      const [a, b, e]: Pt[] = [
        [num(), num()],
        [num(), num()],
        [num(), num()],
      ];
      for (let i = 1; i <= n; i++) {
        const [s1, u] = [i / n, 1 - i / n];
        out.push([
          u * u * u * cur[0] +
            3 * u * u * s1 * a[0] +
            3 * u * s1 * s1 * b[0] +
            s1 * s1 * s1 * e[0],
          u * u * u * cur[1] +
            3 * u * u * s1 * a[1] +
            3 * u * s1 * s1 * b[1] +
            s1 * s1 * s1 * e[1],
        ]);
      }
      cur = e;
    } else {
      const e: Pt = [num(), num()];
      if (cmd === 'L') {
        for (let i = 1; i <= n; i++) {
          out.push([
            cur[0] + ((e[0] - cur[0]) * i) / n,
            cur[1] + ((e[1] - cur[1]) * i) / n,
          ]);
        }
      } else {
        out.push(e);
      }
      cur = e;
    }
  }
  return out;
}
const FIELD = /* @__PURE__ */ AE_BROOM.flatMap(([rest, hover]) => {
  const [a, b] = [sampleFixed(rest), sampleFixed(hover)];
  return a.map((p, i) => ({ p, v: [b[i][0] - p[0], b[i][1] - p[1]] as Pt }));
});
/** How Clean moves the broom at q (full hover). */
function broomMove([x, y]: Pt): Pt {
  let [sx, sy, sw] = [0, 0, 0];
  for (const { p, v } of FIELD) {
    const w = 1 / ((x - p[0]) ** 2 + (y - p[1]) ** 2 + 0.25) ** 2;
    [sx, sy, sw] = [sx + v[0] * w, sy + v[1] * w, sw + w];
  }
  return [sx / sw, sy / sw];
}
const BROOM_MOVES: Pt[][] = /* @__PURE__ */ BROOM_LOOPS.map((loop) =>
  loop.map(broomMove)
);
const DASHES: [number, number, number][] = [
  [20, 26, 18],
  [22, 28, 22],
  [24, 30, 26],
]; // x0, x1, y0
export const CleanSpec = /* @__PURE__ */ hoverIcon('Clean', {
  geo: ({ h }) => {
    const k = h;
    const broom =
      k < 1e-4
        ? BROOM
        : BROOM_LOOPS.map(
            (loop, i) =>
              `M${loop.map(([x, y], j) => `${f(x + BROOM_MOVES[i][j][0] * k)} ${f(y + BROOM_MOVES[i][j][1] * k)}`).join('L')}Z`
          ).join('');
    const shapes: Record<string, { d: string }> = { broom: { d: broom } };
    DASHES.forEach(([x0, x1, y0], i) => {
      const m = -4 * h;
      shapes[`dash${i}`] = { d: rectPath(x0 + m, y0, x1 + m, y0 + 2) };
    });
    return shapes;
  },
  static: /* @__PURE__ */ carbonArt(Clean32),
});

// ── Add comment ──────────────────────────────────────────────────────────────

// Add comment: the bubble (outer r4, inner r2 corners) grows 2px on
// each side; the tail's tip holds, its sides meeting the lower wall further
// down. The plus arms reach 2px at each end.
const TAIL_RUN = 4 / 7; // the tail's dx per dy
export const AddCommentSpec = /* @__PURE__ */ hoverIcon('AddComment', {
  geo: ({ h }) => {
    const g = 2 * h;
    const [l0, l1, t0, t1] = [2 - g, 30 + g, 4 - g, 24 + g]; // outer edges
    const X = (x: number) => f(x);
    return {
      bubble: {
        d:
          `M17.74 30L16 29L${X(20 - g * TAIL_RUN)} ${X(t1 - 2)}L${X(l1 - 4)} ${X(t1 - 2)}A2 2 0 0 0 ${X(l1 - 2)} ${X(t1 - 4)}L${X(l1 - 2)} ${X(t0 + 4)}` +
          `A2 2 0 0 0 ${X(l1 - 4)} ${X(t0 + 2)}L${X(l0 + 4)} ${X(t0 + 2)}A2 2 0 0 0 ${X(l0 + 2)} ${X(t0 + 4)}L${X(l0 + 2)} ${X(t1 - 4)}` +
          `A2 2 0 0 0 ${X(l0 + 4)} ${X(t1 - 2)}L15 ${X(t1 - 2)}L15 ${X(t1)}L${X(l0 + 4)} ${X(t1)}A4 4 0 0 1 ${X(l0)} ${X(t1 - 4)}` +
          `L${X(l0)} ${X(t0 + 4)}A4 4 0 0 1 ${X(l0 + 4)} ${X(t0)}L${X(l1 - 4)} ${X(t0)}A4 4 0 0 1 ${X(l1)} ${X(t0 + 4)}` +
          `L${X(l1)} ${X(t1 - 4)}A4 4 0 0 1 ${X(l1 - 4)} ${X(t1)}L${X(21.16 - g * TAIL_RUN)} ${X(t1)}Z`,
      },
      plus: { d: plus([16, 14], 5 + 2 * h) },
    };
  },
  static: /* @__PURE__ */ carbonArt(AddComment32),
});

/** The Send planes' outlines at hover `h`, and their centrelines at rest and hover (for the Send toggles). */
export {
  SEND as sendPlane,
  SEND_ALT as sendAltPlane,
  SEND_REST,
  SEND_HOVER,
  ALT_REST,
  ALT_HOVER,
};
/** Carbon's Send alt outlines and the plane rebuild (for the Send alt ⇄ Not sent toggles). */
export { dart, SEND_ALT_D, SEND_ALT_FILLED_D, type Dart };

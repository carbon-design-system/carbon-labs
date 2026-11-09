/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import DocumentPdf32 from '@carbon/icons/es/document--pdf/32.js';
import Power16 from '@carbon/icons/es/power/16.js';
import Power32 from '@carbon/icons/es/power/32.js';
import Attachment32 from '@carbon/icons/es/attachment/32.js';
import Map32 from '@carbon/icons/es/map/32.js';
import ShoppingCart32 from '@carbon/icons/es/shopping--cart/32.js';
import Calculator32 from '@carbon/icons/es/calculator/32.js';
import Laptop32 from '@carbon/icons/es/laptop/32.js';
import Notebook32 from '@carbon/icons/es/notebook/32.js';
import { hoverIcon, carbonArt } from '../../engine';
import { mapPath, rectPath, type Pt } from '../../geometry';
import { EVENODD, f } from '../../paint';

/**
 * Common objects, part B, on the frame engine: Document PDF, Notebook,
 * Power, Attachment, Map, Shopping cart, Calculator and Laptop. Every shape
 * is Carbon's own outline at rest (Power uses Carbon's 16px drawing at 16px;
 * the rest have only a 32px drawing). On hover the parts move as geometry,
 * at constant line weight: points move, walls keep their 2px, nothing is
 * transform-scaled, and there are no masks. Standard hover timing (160ms
 * entrance ease in, 120ms exit ease out), one motion per part, no staggers.
 * (Not PDF and App: a word's motion doesn't feel useful.)
 *
 *  - Document PDF: the page and the letters hold; only the folded corner
 *    comes 2px in (its fold lines step 2px left and down, its diagonal 1.41px
 *    in), at constant 2px walls. The right wall's 2px stub under the fold
 *    closes up, so the fold's bottom edge runs flush into the wall's end,
 *    2px above the letters.
 *  - Power: the ring grows 1px in radius about its centre (r 11–13 →
 *    12–14; a ring filling the frame grows 1px), and its ends turn in
 *    (30° → 27.3° from straight up) so the space to the line holds at 4.5px.
 *    The line grows 3px up (y 2 → −1) and 1px down (y 16 → 17, the ring's
 *    centre).
 *  - Attachment: the clip scales 12.4% about the icon's centre at constant
 *    weight, so each end loop reaches 2px further out along the diagonal
 *    (the loops' centreline radii 5.5 → 6.18, the wires 0.68px further
 *    apart). The inner loop also slides 4px up-left along the diagonal, its
 *    wires lengthening behind it; the outer wire's free end, on the same
 *    line, draws back 3.48px so its space to the loop holds at 2.6px.
 *  - Map: Carbon's map is a pin over an open box (no folds), so it takes
 *    Location's pin motion. The head lifts 2px and grows 1px in diameter
 *    (outer r 8.03 → 8.53, inner 6.03 → 6.53), the dot lifts with it and
 *    grows 1px in diameter (r 2 → 2.5); the point stays, so the sides
 *    lengthen along their tangents at a constant 2px wall. The box holds.
 *  - Shopping cart: the handle, upright and basket scale open 9% about the
 *    upright's centreline where it meets the base, at constant 2px walls:
 *    the handle 1.8px up (its end 0.72px left), the basket's top 1.35px up,
 *    its bottom 0.54px up, its slanted right side 1.47px out. The upright
 *    runs through the pivot, so it holds and stays joined to the base; the
 *    base bar and the wheels hold.
 *  - Calculator: the case grows 2px on each side (24×28 → 28×32, as
 *    Document's page); with it the display slides 1px up and the keys 1px
 *    down.
 *  - Laptop: the screen lifts. It grows 1px on each side as Screen's display
 *    does, and rises 1px, so its top rises 2px and its bottom holds 2px
 *    above the base; the base grows 1px at each end.
 *  - Notebook: the cover fills the frame's width, so it grows 1px on each
 *    side (as Screen's display); the spine holds, so each page widens 1px,
 *    and the right page's lines reach 1px with it, so their margin to the
 *    cover's edge holds at 2px.
 */

const P = ([x, y]: Pt) => `${f(x)} ${f(y)}`;
const circleD = ([cx, cy]: Pt, r: number) =>
  `M${f(cx - r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 0 ${f(cx + r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 0 ${f(cx - r)} ${f(cy)}Z`;

// ── Document PDF ─────────────────────────────────────────────────────────────

// Carbon's page (absolute): the outline, its inside (open at the lower right,
// where the letters run out past it) and the fold's triangle. The page holds;
// the fold comes k in, as Document's does against its page: the points on its
// vertical fold line (and the top edge's end at the diagonal) move k left,
// those on its horizontal fold line (and the right edge's corner) k down, so
// its diagonal stays parallel and every wall keeps its 2px. The right wall's
// end (y 14) holds, 2px above the letters.
const DOC_PDF_PAGE =
  'M22 14V10A0.9092 0.9092 0 0 0 21.7 9.3L14.7 2.3A0.9087 0.9087 0 0 0 14 2H4A2.0059 2.0059 0 0 0 2 4V28A2 2 0 0 0 4 30H20V28H4V4H12V10A2.0059 2.0059 0 0 0 14 12H20V14Z' +
  'M14 10V4.4L19.6 10Z';
const DOC_PDF_LETTERS =
  'M30 18L30 16L24 16L24 26L26 26L26 22L29 22L29 20L26 20L26 18L30 18Z' +
  'M19 26H15V16H19A3.0033 3.0033 0 0 1 22 19V23A3.0033 3.0033 0 0 1 19 26ZM17 24H19A1.0011 1.0011 0 0 0 20 23V19A1.0011 1.0011 0 0 0 19 18H17Z' +
  'M11 16H6V26H8V23H11A2.0027 2.0027 0 0 0 13 21V18A2.0023 2.0023 0 0 0 11 16ZM8 21V18H11L11.001 21Z';
/** How far the fold comes in. */
const PAGE_FOLD = 2;
const pdfFoldLeft = (x: number, y: number) => x > 8 && x < 15.5 && y < 13;
const pdfFoldDown = (x: number, y: number) => x > 11 && y > 8 && y < 13;
export const DocumentPdfSpec = /* @__PURE__ */ hoverIcon('DocumentPdf', {
  geo: ({ h }) => {
    const k = PAGE_FOLD * h;
    return {
      page: {
        d: mapPath(DOC_PDF_PAGE, ([x, y]) => [
          x - (pdfFoldLeft(x, y) ? k : 0),
          y + (pdfFoldDown(x, y) ? k : 0),
        ]),
      },
      letters: { d: DOC_PDF_LETTERS },
    };
  },
  static: /* @__PURE__ */ carbonArt(DocumentPdf32),
});

// ── Power ────────────────────────────────────────────────────────────────────

/**
 * The arc: a ring open at the top, its outer edge a circle about `co` (radius
 * `ro`), its inner edge one about `ci` (`ri`), and its ends cut straight
 * across between them, drawn as Carbon draws it (outer right end, inner
 * right end, the long way round to the inner left end). `ends` are the four
 * ends' angles from straight up, clockwise: outer right, inner right, inner
 * left, outer left.
 */
type Ring = {
  co: Pt;
  ro: number;
  ci: Pt;
  ri: number;
  ends: readonly [number, number, number, number];
};
function powerArc({ co, ro, ci, ri, ends: [oR, iR, iL, oL] }: Ring): string {
  const at = ([cx, cy]: Pt, r: number, a: number): Pt => [
    cx + r * Math.sin(a),
    cy - r * Math.cos(a),
  ];
  return (
    `M${P(at(co, ro, oR))}L${P(at(ci, ri, iR))}A${f(ri)} ${f(ri)} 0 1 1 ${P(at(ci, ri, iL))}` +
    `L${P(at(co, ro, oL))}A${f(ro)} ${f(ro)} 0 1 0 ${P(at(co, ro, oR))}Z`
  );
}
/**
 * The ring grown g in radius about its centres, each end turned so its inner
 * corner keeps its distance from the line (the outer corner turns with it).
 */
function grownRing(
  { co, ro, ci, ri, ends: [oR, iR, iL, oL] }: Ring,
  g: number
): Ring {
  const turn = (a: number) => Math.asin((ri * Math.sin(a)) / (ri + g)) - a;
  const [tR, tL] = [turn(iR), turn(iL)];
  return {
    co,
    ro: ro + g,
    ci,
    ri: ri + g,
    ends: [oR + tR, iR + tR, iL + tL, oL + tL],
  };
}
const deg = (d: number) => (d * Math.PI) / 180;
/**
 * Carbon's ring at 32px (r 11–13 about (16, 17), cut 30° either side of
 * up), and its 16px drawing's, in the 32 grid: its cubic circles fitted (the
 * outer one sits 0.19 right of the inner one) and its ends where Carbon's are.
 */
const POWER_32: Ring = {
  co: [16, 17],
  ro: 13,
  ci: [16, 17],
  ri: 11,
  ends: [deg(30), deg(30), deg(-30), deg(-30)],
};
const POWER_16: Ring = {
  co: [16.095, 17.116],
  ro: 13.02,
  ci: [15.904, 17.106],
  ri: 10.959,
  ends: [deg(29.13), deg(30.04), deg(-30.07), deg(-29.86)],
};
/** How far the ring grows in radius. */
const POWER_GROW = 1;
/** How far the line grows up (its top, y 2 → −1) and down (its foot, y 16 → 17, the ring's centre). */
const [LINE_UP, LINE_DOWN] = [3, 1];
export const PowerSpec = /* @__PURE__ */ hoverIcon('Power', {
  geo: ({ h }, size) => {
    const g = POWER_GROW * h;
    return {
      arc: { d: powerArc(grownRing(size === 16 ? POWER_16 : POWER_32, g)) },
      line: { d: rectPath(15, 2 - LINE_UP * h, 17, 16 + LINE_DOWN * h) },
    };
  },
  static: /* @__PURE__ */ carbonArt(Power16, Power32),
});

// ── Attachment ───────────────────────────────────────────────────────────────

// Carbon's clip (absolute, S as C): one 2px wire along the diagonal, three
// loops joined by straight wires. In the clip's own axes (u along the
// diagonal, v across it) the loops are circles on the wire's centreline:
// the top-left loop (centre (8.5, 8.5), r 5.5), the bottom-right loop
// ((23.5, 23.5), r 5.5) and the inner loop ((14.6, 17.42), r 3.5); the
// outer wire's free end sits at v 5.5, the inner wire's tail at v −1.49.
//
// Scaling at constant weight: a loop's centre scales about the icon's
// centre, and each of its points moves out from it by the centreline's
// growth, (S − 1)·r, inner and outer edge alike (control points in
// proportion, so the arcs stay round); a wire's end scales its centreline
// point and keeps its offset from it. Every straight wire joins two of these,
// so it just lengthens. The inner loop then slides 4px up-left along the
// diagonal (its wires lengthen behind it). The outer wire's free end lies on
// the inner loop's line, so it gives way: it draws back along the diagonal
// just enough to keep its rest space (2.6px) to the loop.
const CLIP =
  'M28.1 18.9L13.1 3.9C10.6 1.3 6.5 1.3 3.9 3.8C1.3 6.3 1.3 10.5 3.9 13C3.9 13 4 13.1 4 13.1L6.8 16L8.2 14.6L5.3 11.7' +
  'C3.6 10 3.6 7.1 5.3 5.4C7 3.7 9.9 3.6 11.6 5.3C11.6 5.3 11.6 5.3 11.7 5.4L26.6 20.3C28.4 22 28.4 24.9 26.7 26.6' +
  'C25 28.4 22.1 28.4 20.4 26.7C20.4 26.7 20.4 26.7 20.3 26.6L12.9 19.2C11.9 18.2 12 16.6 12.9 15.7C13.9 14.8 15.4 14.8 16.4 15.7' +
  'L20.5 19.8L21.9 18.4C21.9 18.4 17.7 14.2 17.7 14.2C15.9 12.5 13.1 12.6 11.4 14.4C9.8 16.1 9.8 18.8 11.4 20.6L18.9 28.1' +
  'C21.4 30.7 25.5 30.7 28.1 28.2C30.7 25.7 30.7 21.5 28.1 18.9C28.1 19 28.1 18.9 28.1 18.9L28.1 18.9Z';
const CLIP_O: Pt = [16, 16];
const R2 = Math.SQRT1_2;
/** The clip's axes: u along the diagonal (down-right), v across it (down-left). */
const toUV = ([x, y]: Pt): Pt => [(x + y) * R2, (y - x) * R2];
const fromUV = ([u, v]: Pt): Pt => [(u - v) * R2, (u + v) * R2];
type ClipLoop = { c: Pt; r: number };
const CLIP_TL: ClipLoop = { c: [8.5, 8.5], r: 5.5 };
const CLIP_BR: ClipLoop = { c: [23.5, 23.5], r: 5.5 };
const CLIP_IN: ClipLoop = { c: [14.6, 17.42], r: 3.5 };
/** The wire ends' centrelines (v): the outer wire's free end, the inner wire's tail. */
const [FREE_V, TAIL_V] = [5.5, -1.49];
/** The free end's centreline position along the diagonal (u). */
const FREE_U = 22.8 * R2;
/** The scale that takes each end loop's tip 2px further out (its centreline tip sits 16.11 from the centre). */
export const CLIP_SCALE =
  1 + 2 / (toUV(CLIP_O)[0] - (toUV(CLIP_TL.c)[0] - CLIP_TL.r));
/** The point p of a loop, moved with the loop (its centre to c2, its radius grown by S). */
function onLoop(p: Pt, { c, r }: ClipLoop, c2: Pt, S: number): Pt {
  const [dx, dy] = [p[0] - c[0], p[1] - c[1]];
  const edge = Math.hypot(dx, dy) > r ? r + 1 : r - 1;
  const k = (edge + (S - 1) * r) / edge;
  return [c2[0] + dx * k, c2[1] + dy * k];
}
/** How far the inner loop slides up-left along the diagonal. */
const INNER_SLIDE = 4;
/**
 * Where the free end's centreline ends along the diagonal (u) at scale S with
 * the inner loop slid `slide`: scaled with the clip, or drawn back so its
 * space to the loop stays as at rest, whichever is further back.
 */
function freeEndU(S: number, slide: number): number {
  const [ou] = toUV(CLIP_O);
  const [cu, cv] = toUV(CLIP_IN.c);
  // The free end's inner corner (v: its edge facing the loop), and the loop's centre and outer radius.
  const at = (s: number, sl: number) => ({
    fu: ou + s * (FREE_U - ou),
    lu: ou + s * (cu - ou) - sl,
    dv: s * cv - (s * FREE_V - 1),
    R: s * CLIP_IN.r + 1,
  });
  const rest = at(1, 0);
  const space = Math.hypot(rest.lu - rest.fu, rest.dv) - rest.R;
  const now = at(S, slide);
  return Math.min(
    now.fu,
    now.lu - Math.sqrt((space + now.R) ** 2 - now.dv ** 2)
  );
}
export const AttachmentSpec = /* @__PURE__ */ hoverIcon('Attachment', {
  geo: ({ h }) => {
    const S = 1 + (CLIP_SCALE - 1) * h;
    const scaled = ([x, y]: Pt): Pt => [
      CLIP_O[0] + S * (x - CLIP_O[0]),
      CLIP_O[1] + S * (y - CLIP_O[1]),
    ];
    const slide = INNER_SLIDE * h;
    const inner = scaled(CLIP_IN.c);
    const centres = {
      tl: scaled(CLIP_TL.c),
      br: scaled(CLIP_BR.c),
      in: [inner[0] - slide * R2, inner[1] - slide * R2] as Pt,
    };
    const freeU = freeEndU(S, slide);
    const wireEnd = (p: Pt, vc: number): Pt => {
      const [u, v] = toUV(p);
      const [cu, cv] = toUV(scaled(fromUV([u, vc])));
      // The free end draws back (both its corners alike, so it stays square).
      return fromUV([vc === FREE_V ? freeU : cu, cv + (v - vc)]);
    };
    const move = (p: Pt): Pt => {
      const sum = p[0] + p[1];
      if (sum < 20) {
        return onLoop(p, CLIP_TL, centres.tl, S);
      }
      if (sum > 46.5) {
        return onLoop(p, CLIP_BR, centres.br, S);
      }
      if (sum > 24 && sum < 33) {
        return onLoop(p, CLIP_IN, centres.in, S);
      }
      return wireEnd(p, sum < 24 ? FREE_V : TAIL_V);
    };
    return { clip: { d: mapPath(CLIP, move) } };
  },
  static: /* @__PURE__ */ carbonArt(Attachment32),
});

// ── Map ──────────────────────────────────────────────────────────────────────

// The pin, rebuilt as Location's is: a teardrop, the head's circle (outer
// r 8.03 about (16, 10.06), fitted to Carbon's slightly uneven arcs) with
// straight sides tangent to it from the point (16, 24); the inside is the
// same 2px in (r 6.03, its point re-solved so the sides' wall is 2px). The
// dot is Carbon's r 2 disc.
// Hover, as Location: the head and dot lift 2px and grow 1px in diameter.
const MAP_TIP: Pt = [16, 24];
const MAP_HEAD: Pt = [16, 10.06];
const MAP_R = 8.03;
const MAP_DOT: Pt = [16, 9];
const PIN_LIFT = 2;
const PIN_GROW = 0.5;
const MAP_BOX =
  'M28 12H26V14H28V28H4V14H6V12H4A2 2 0 0 0 2 14V28A2 2 0 0 0 4 30H28A2 2 0 0 0 30 28V14A2 2 0 0 0 28 12Z';

/** A teardrop: a circle (centre c, radius r) and the sides tangent to it from `tip`. */
function teardropD(c: Pt, r: number, tip: Pt): string {
  const dist = Math.hypot(tip[0] - c[0], tip[1] - c[1]);
  const b = Math.acos(r / dist);
  const [L, R]: Pt[] = [
    [c[0] - r * Math.sin(b), c[1] + r * Math.cos(b)],
    [c[0] + r * Math.sin(b), c[1] + r * Math.cos(b)],
  ];
  return `M${P(tip)}L${P(L)}A${f(r)} ${f(r)} 0 1 1 ${P(R)}Z`;
}
export const MapSpec = /* @__PURE__ */ hoverIcon('Map', {
  geo: ({ h }) => {
    const head: Pt = [MAP_HEAD[0], MAP_HEAD[1] - PIN_LIFT * h];
    const r = MAP_R + PIN_GROW * h;
    const dist = MAP_TIP[1] - head[1];
    const innerTip: Pt = [MAP_TIP[0], MAP_TIP[1] - (2 * dist) / r];
    return {
      pin: {
        d: teardropD(head, r, MAP_TIP) + teardropD(head, r - 2, innerTip),
        ...EVENODD,
      },
      dot: {
        d: circleD([MAP_DOT[0], MAP_DOT[1] - PIN_LIFT * h], 2 + PIN_GROW * h),
      },
      box: { d: MAP_BOX },
    };
  },
  static: /* @__PURE__ */ carbonArt(Map32),
});

// ── Shopping cart ────────────────────────────────────────────────────────────

// Carbon's cart (absolute): the handle, the upright, the basket off the
// upright, and the base bar. Hover: everything from the handle to the basket
// scales open by CART_SCALE about the upright's centreline where it meets the
// base (A), at constant weight: each wall's centreline scales about A and its
// two edges keep their 1px offsets from it; corners are where the moved edges
// meet (a rounded corner moves with its corner). The upright runs through A,
// so its own edges hold and it stays joined to the base; the base bar and
// the wheels hold.
const CART =
  'M28 7H5.82L5 2.8A1 1 0 0 0 4 2H0V4H3.18L7 23.2A1 1 0 0 0 8 24H26V22H8.82L8 18H26A1 1 0 0 0 27 17.22L29 8.22A1 1 0 0 0 28 7Z' +
  'M25.2 16H7.62L6.22 9H26.75Z';
/** An edge: the line n·p = c (n a unit normal), `o` its offset from its wall's centreline along n; `fixed` edges hold. */
type Edge = { n: Pt; c: number; o: number; fixed?: boolean };
/** The edge through a and b, of the wall whose centreline passes through q (none: it holds). */
const edgeThrough = (a: Pt, b: Pt, q?: Pt): Edge => {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const l = Math.hypot(dx, dy);
  const n: Pt = [dy / l, -dx / l];
  const c = n[0] * a[0] + n[1] * a[1];
  return { n, c, o: q ? c - (n[0] * q[0] + n[1] * q[1]) : 0, fixed: !q };
};
const CART_A: Pt = [7.99, 23];
const CART_SCALE = 1.09;
/** Points on each wall's centreline: the handle, the basket's top, right side and bottom. */
const [HANDLE, TOP, RIGHT, BOTTOM]: Pt[] = [
  [2, 3],
  [16, 8],
  [25.97, 17.22],
  [16, 17],
];
const E = {
  handleTop: edgeThrough([4, 2], [0, 2], HANDLE),
  handleBottom: edgeThrough([0, 4], [4, 4], HANDLE),
  handleEnd: { n: [1, 0] as Pt, c: 0, o: 0 },
  uprightL: edgeThrough([3.18, 4], [7, 23.2]),
  uprightR: edgeThrough([5, 2.8], [8.82, 22]),
  topOut: edgeThrough([28, 7], [5.82, 7], TOP),
  topIn: edgeThrough([6.22, 9], [26.75, 9], TOP),
  rightOut: edgeThrough([27, 17.22], [29, 8.22], RIGHT),
  rightIn: edgeThrough([26.75, 9], [25.2, 16], RIGHT),
  bottomOut: edgeThrough([8, 18], [26, 18], BOTTOM),
  bottomIn: edgeThrough([25.2, 16], [7.62, 16], BOTTOM),
};
type EdgeName = keyof typeof E;
/** The edge scaled open by S about A: its centreline scales, its offset holds. */
const scaleEdge = ({ n, c, o, fixed }: Edge, S: number): Edge => {
  if (fixed) {
    return { n, c, o };
  }
  const na = n[0] * CART_A[0] + n[1] * CART_A[1];
  return { n, c: na + S * (c - o - na) + o, o };
};
const meet = (e: Edge, f: Edge): Pt => {
  const det = e.n[0] * f.n[1] - e.n[1] * f.n[0];
  return [
    (e.c * f.n[1] - f.c * e.n[1]) / det,
    (e.n[0] * f.c - f.n[0] * e.c) / det,
  ];
};
/** Each of Carbon's points, by the corner (pair of edges) it belongs to; the base's own points are left out (they hold). */
const CART_CORNERS: [Pt[], EdgeName, EdgeName][] = [
  [
    [
      [28, 7],
      [29, 8.22],
    ],
    'topOut',
    'rightOut',
  ],
  [[[5.82, 7]], 'topOut', 'uprightR'],
  [
    [
      [5, 2.8],
      [4, 2],
    ],
    'uprightR',
    'handleTop',
  ],
  [[[0, 2]], 'handleTop', 'handleEnd'],
  [[[0, 4]], 'handleBottom', 'handleEnd'],
  [[[3.18, 4]], 'handleBottom', 'uprightL'],
  [[[8, 18]], 'bottomOut', 'uprightR'],
  [
    [
      [26, 18],
      [27, 17.22],
    ],
    'bottomOut',
    'rightOut',
  ],
  [[[25.2, 16]], 'bottomIn', 'rightIn'],
  [[[7.62, 16]], 'bottomIn', 'uprightR'],
  [[[6.22, 9]], 'topIn', 'uprightR'],
  [[[26.75, 9]], 'topIn', 'rightIn'],
];
export const ShoppingCartSpec = /* @__PURE__ */ hoverIcon('ShoppingCart', {
  geo: ({ h }) => {
    const S = 1 + (CART_SCALE - 1) * h;
    const shift: Record<string, Pt> = {};
    for (const [pts, a, b] of CART_CORNERS) {
      const [p0, p1] = [
        meet(E[a], E[b]),
        meet(scaleEdge(E[a], S), scaleEdge(E[b], S)),
      ];
      for (const p of pts) {
        shift[`${p[0]} ${p[1]}`] = [p1[0] - p0[0], p1[1] - p0[1]];
      }
    }
    const move = ([x, y]: Pt): Pt => {
      const [dx, dy] = shift[`${x} ${y}`] ?? [0, 0];
      return [x + dx, y + dy];
    };
    return {
      cart: { d: mapPath(CART, move) },
      wheels: { d: circleD([10, 28], 2) + circleD([24, 28], 2) },
    };
  },
  static: /* @__PURE__ */ carbonArt(ShoppingCart32),
});

// ── Calculator ───────────────────────────────────────────────────────────────

// The case (absolute): its inside first, as Carbon draws it. Growing it moves
// every point g out from the middle, so the walls keep their 2px; the display
// slides up and the keys down with it.
const CALC_CASE =
  'M26 4V28H6V4H26ZM26 2H6A2 2 0 0 0 4 4V28A2 2 0 0 0 6 30H26A2 2 0 0 0 28 28V4A2 2 0 0 0 26 2Z';
const CASE_GROW = 2;
const KEY_SLIDE = 1;
export const CalculatorSpec = /* @__PURE__ */ hoverIcon('Calculator', {
  geo: ({ h }) => {
    const [g, n] = [CASE_GROW * h, KEY_SLIDE * h];
    return {
      case: {
        d: mapPath(CALC_CASE, ([x, y]) => [
          x + (x > 16 ? g : -g),
          y + (y > 16 ? g : -g),
        ]),
      },
      display: { d: rectPath(9, 7 - n, 23, 10 - n) },
      keys: {
        d: [9, 15, 21]
          .flatMap((x) =>
            [13, 18, 23].map((y) => rectPath(x, y + n, x + 2, y + 2 + n))
          )
          .join(''),
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(Calculator32),
});

// ── Laptop ───────────────────────────────────────────────────────────────────

// Carbon nudges the screen 0.005 down (its translate), baked in here.
const LAPTOP_SCREEN =
  'M26 24.005H6A2.0023 2.0023 0 0 1 4 22.005V8.005A2.002 2.002 0 0 1 6 6.005H26A2.0023 2.0023 0 0 1 28 8.005V22.005A2.0027 2.0027 0 0 1 26 24.005Z' +
  'M6 8.005V22.005H26V8.005Z';
const SCREEN_GROW = 1;
const SCREEN_LIFT = 1;
const BASE_GROW = 1;
export const LaptopSpec = /* @__PURE__ */ hoverIcon('Laptop', {
  geo: ({ h }) => {
    const [g, lift, b] = [SCREEN_GROW * h, SCREEN_LIFT * h, BASE_GROW * h];
    return {
      screen: {
        d: mapPath(LAPTOP_SCREEN, ([x, y]) => [
          x + (x > 16 ? g : -g),
          y - lift + (y > 15 ? g : -g),
        ]),
      },
      base: { d: rectPath(2 - b, 26.005, 30 + b, 28.005) },
    };
  },
  static: /* @__PURE__ */ carbonArt(Laptop32),
});

// ── Notebook ─────────────────────────────────────────────────────────────────

// The cover (absolute) with its two pages' insides; the spine is the wall
// between them (x 15–17). Growing it moves the outer walls g out and holds
// the spine.
const NOTEBOOK =
  'M28 5H4A2.002 2.002 0 0 0 2 7V25A2.0023 2.0023 0 0 0 4 27H28A2.0027 2.0027 0 0 0 30 25V7A2.0023 2.0023 0 0 0 28 5Z' +
  'M4 7H15V25H4Z' +
  'M17 25V7H28L28.002 25Z';
const COVER_GROW = 1;
export const NotebookSpec = /* @__PURE__ */ hoverIcon('Notebook', {
  geo: ({ h }) => {
    const g = COVER_GROW * h;
    return {
      cover: {
        d: mapPath(NOTEBOOK, ([x, y]) => [
          x + (x < 15 ? -g : x > 17 ? g : 0),
          y + (y < 16 ? -g : g),
        ]),
      },
      lines: {
        d: [10, 15, 20].map((y) => rectPath(19, y, 26 + g, y + 2)).join(''),
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(Notebook32),
});

/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import CenterCircle32 from '@carbon/icons/es/center--circle/32.js';
import Chat32 from '@carbon/icons/es/chat/32.js';
import ChatLaunch32 from '@carbon/icons/es/chat--launch/32.js';
import CollapseAll32 from '@carbon/icons/es/collapse-all/32.js';
import Explore32 from '@carbon/icons/es/explore/32.js';
import Filter32 from '@carbon/icons/es/filter/32.js';
import FilterEdit32 from '@carbon/icons/es/filter--edit/32.js';
import FilterRemove32 from '@carbon/icons/es/filter--remove/32.js';
import FilterReset32 from '@carbon/icons/es/filter--reset/32.js';
import Idea32 from '@carbon/icons/es/idea/32.js';
import ImageSearch32 from '@carbon/icons/es/image--search/32.js';
import Layers32 from '@carbon/icons/es/layers/32.js';
import LayersExternal32 from '@carbon/icons/es/layers--external/32.js';
import RequestQuote32 from '@carbon/icons/es/request-quote/32.js';
import Scan32 from '@carbon/icons/es/scan/32.js';
import { HOVER, hoverIcon, carbonArt } from '../../engine';
import { motionTokens } from '../../tokens';
import {
  clipConvex,
  mapPath,
  movePath,
  rectPath,
  ringPath,
  type Pt,
} from '../../geometry';
import { ENTRANCE, EXIT, together } from '../../ease';
import { f } from '../../paint';

/**
 * Center circle, Chat, Chat launch, Collapse all, Explore, Filter, Filter
 * edit, Filter remove, Filter reset, Idea, Image search, Layers, Layers
 * external, Request quote and Scan on the frame engine: the motion their legacy components
 * had (from their reference animations), on the shared hover (160ms entrance in, 120ms
 * exit out, unless noted), at constant line weight, with no masks or clip
 * paths. Rest is Carbon's own drawing; moving parts are rigid moves of
 * Carbon's outlines, or Carbon's outlines with some points moved.
 *
 *  - Center circle: the ring shrinks 2px in radius and the four ticks step
 *    1px in.
 *  - Chat: the bubble grows 2px on each side, its tail's tip holding (the
 *    set-wide container rule, as Add comment); the text scrolls up: the top
 *    line rises 6.6px and fades out (70ms), the second line rises 6px (20ms
 *    later), and a third line appears below and rises into the middle row,
 *    widening (40ms later). 190ms in all.
 *  - Chat launch: the bubble grows 1px on each side (its open ends and its
 *    tail's tip holding) and the arrow reaches 2px up-right.
 *  - Collapse all: the top tab slides (−5, +5) onto the middle one and the
 *    body slides (+5, −5) up over it, each rectangle growing 1px a side.
 *  - Explore: the ring grows 1px in radius (150ms); the needle swings to
 *    −61° (150ms) and settles back to −45° (100ms). Leaving, both go
 *    straight back.
 *  - Filter: a wave slides in from the lower left (+24, −13.375; 220ms, moderate-02),
 *    cut to the funnel's inside.
 *  - Filter edit: the pencil slides 2px left.
 *  - Filter remove: the X's arms reach 2px at each end.
 *  - Filter reset: the arrow's arc lengthens from 70% to 79% of the circle
 *    and the arrowhead turns 30° with it.
 *  - Idea: the bulb rises 1px, its legs lengthening; the filament draws up
 *    6px; the side rays shoot out (70ms + 40ms) and the four diagonal rays
 *    draw out from 80ms (120ms); all the rays rise 1px. 200ms in all.
 *  - Image search: the sun and the hills pan 2px left, the hills' left
 *    slope sliding under the frame; the magnifier turns 15° about the end
 *    of its handle and steps 1px right.
 *  - Layers: the bottom layer rises 2px and the top layer drops 2px, and
 *    the whole icon grows 1px a side about its middle (14/13, at constant
 *    weight).
 *  - Layers external: Layers' hover; the arrow grows with the icon and its
 *    head reaches 2px up (the tail held), the top layer's upper cut end
 *    drawing back 2px along its wall to keep the space to it.
 *  - Request quote: the pencil slides 2px left and the document's top edge
 *    draws back 2px with it; the lower-right edge holds.
 *  - Scan: the bracket steps 3px right and the bars 3px left, together
 *    (no stagger).
 */

const LINEAR = [0, 0, 1, 1] as [number, number, number, number];
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
/** The entrance ease on the slice [start, start + dur] of a linear timeline (ms). */
const slice = (ms: number, start: number, dur: number) =>
  ENTRANCE(clamp01((ms - start) / dur));
const P = ([x, y]: Pt) => `${f(x)} ${f(y)}`;
/** Polygon path data, wound clockwise on screen (so pieces union under nonzero). */
const polyD = (pts: readonly Pt[]) => {
  if (pts.length < 3) {
    return '';
  }
  const area = pts.reduce(
    (a, p, i) =>
      a +
      p[0] * pts[(i + 1) % pts.length][1] -
      pts[(i + 1) % pts.length][0] * p[1],
    0
  );
  return `M${(area >= 0 ? pts : [...pts].reverse()).map(P).join('L')}Z`;
};
/** A 2px bar along a → b, butt ends; nothing when it has no length. */
const bar = (a: Pt, b: Pt) => {
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
  if (l < 1e-3) {
    return '';
  }
  const [nx, ny] = [-(b[1] - a[1]) / l, (b[0] - a[0]) / l];
  return polyD([
    [a[0] + nx, a[1] + ny],
    [b[0] + nx, b[1] + ny],
    [b[0] - nx, b[1] - ny],
    [a[0] - nx, a[1] - ny],
  ]);
};
const lerpPt = (a: Pt, b: Pt, t: number): Pt => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
];
const move = (dx: number, dy: number) => `translate(${f(dx)} ${f(dy)})`;

// ── Center circle ────────────────────────────────────────────────────────────

// Center circle: the ring (centreline r 11) shrinks to
// r 9 and each tick (Carbon's 2×8 bars) steps 1px toward the centre.
export const CenterCircleSpec = /* @__PURE__ */ hoverIcon('CenterCircle', {
  geo: ({ h }) => ({
    ring: { d: ringPath([16, 16], 11 - 2 * h, 2) },
    top: { d: rectPath(15, 2 + h, 17, 10 + h) },
    right: { d: rectPath(22 - h, 15, 30 - h, 17) },
    bottom: { d: rectPath(15, 22 - h, 17, 30 - h) },
    left: { d: rectPath(2 + h, 15, 10 + h, 17) },
  }),
  static: /* @__PURE__ */ carbonArt(CenterCircle32),
});

// ── Chat ─────────────────────────────────────────────────────────────────────

/**
 * Carbon's speech bubble (outer r4, inner r2 corners), grown g on each side;
 * the tail's tip holds, its sides meeting the lower wall further down.
 */
const TAIL_RUN = 4 / 7; // the tail's dx per dy
function bubble(g: number) {
  const [l0, l1, t0, t1] = [2 - g, 30 + g, 4 - g, 24 + g]; // outer edges
  const X = f;
  return (
    `M17.74 30L16 29L${X(20 - g * TAIL_RUN)} ${X(t1 - 2)}L${X(l1 - 4)} ${X(t1 - 2)}A2 2 0 0 0 ${X(l1 - 2)} ${X(t1 - 4)}L${X(l1 - 2)} ${X(t0 + 4)}` +
    `A2 2 0 0 0 ${X(l1 - 4)} ${X(t0 + 2)}L${X(l0 + 4)} ${X(t0 + 2)}A2 2 0 0 0 ${X(l0 + 2)} ${X(t0 + 4)}L${X(l0 + 2)} ${X(t1 - 4)}` +
    `A2 2 0 0 0 ${X(l0 + 4)} ${X(t1 - 2)}L15 ${X(t1 - 2)}L15 ${X(t1)}L${X(l0 + 4)} ${X(t1)}A4 4 0 0 1 ${X(l0)} ${X(t1 - 4)}` +
    `L${X(l0)} ${X(t0 + 4)}A4 4 0 0 1 ${X(l0 + 4)} ${X(t0)}L${X(l1 - 4)} ${X(t0)}A4 4 0 0 1 ${X(l1)} ${X(t0 + 4)}` +
    `L${X(l1)} ${X(t1 - 4)}A4 4 0 0 1 ${X(l1 - 4)} ${X(t1)}L${X(21.16 - g * TAIL_RUN)} ${X(t1)}Z`
  );
}

// Chat (100fps): the engine runs 190ms linear and each part eases its
// own slice. Line 1 rises 6.586 and fades over 0–70ms; line 2 rises 6 over
// 20–170ms; line 3 shows at 30–40ms, then rises 20.469 → 16 and widens
// 8 → 11.845 over 40–190ms. The bubble grows over 0–150ms.
const CHAT_MS = 190;
/** Chat's hover timing (also Chat ⇄ Chat off's on-state hover, in editingToggles). */
export const CHAT_HOVER = { duration: CHAT_MS / 1000, ease: LINEAR };
/**
 * Chat's hover at progress h, as numbers: the bubble's growth `g` and the
 * three text lines (each x0, y0, x1, y1 and opacity; line 3 is hidden while
 * `shown` is 0). Chat ⇄ Chat off (editingToggles) draws from the same numbers.
 */
export function chatHover(h: number) {
  const ms = h * CHAT_MS;
  const k1 = slice(ms, 0, 70);
  const k2 = slice(ms, 20, 150);
  const shown = clamp01((ms - 30) / 10);
  const k3 = slice(ms, 40, 150);
  const y3 = 20.469 + (16 - 20.469) * k3;
  return {
    g: 2 * slice(ms, 0, 150),
    line1: {
      x0: 8,
      y0: 10 - 6.586 * k1,
      x1: 24,
      y1: 12 - 6.586 * k1,
      opacity: 1 - k1,
      hidden: k1 >= 1,
    },
    line2: {
      x0: 8,
      y0: 16 - 6 * k2,
      x1: 18,
      y1: 18 - 6 * k2,
      opacity: 1,
      hidden: false,
    },
    line3: {
      x0: 8,
      y0: y3,
      x1: 8 + 8 + 3.845 * k3,
      y1: y3 + 2,
      opacity: shown,
      hidden: !(shown > 0),
    },
  };
}
export const ChatSpec = /* @__PURE__ */ hoverIcon('Chat', {
  hover: CHAT_HOVER,
  geo: ({ h }) => {
    const { g, line1: l1, line2: l2, line3: l3 } = chatHover(h);
    return {
      bubble: { d: bubble(g) },
      line1: {
        d: l1.hidden ? '' : rectPath(l1.x0, l1.y0, l1.x1, l1.y1),
        opacity: f(l1.opacity),
      },
      line2: { d: rectPath(l2.x0, l2.y0, l2.x1, l2.y1) },
      line3: {
        d: l3.hidden ? '' : rectPath(l3.x0, l3.y0, l3.x1, l3.y1),
        opacity: f(l3.opacity),
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(Chat32),
});

// ── Chat launch ──────────────────────────────────────────────────────────────

// Chat launch: the bubble's walls each step 1px out (the
// top wall's end at x 18, the right wall's top at y 16 and the tail's tip
// hold; the tail's sides meet the lower wall further down), and the arrow's
// head reaches 2px up-right, its shaft lengthening from the tail.
const LAUNCH_ARROW: Pt[] = [
  [22, 4],
  [22, 6],
  [26.586, 6],
  [20, 12.586],
  [21.414, 14],
  [28, 7.414],
  [28, 12],
  [30, 12],
  [30, 4],
];
const LAUNCH_TAIL = (p: Pt) => p[0] < 22 && p[1] > 12; // the shaft's tail end holds
export const ChatLaunchSpec = /* @__PURE__ */ hoverIcon('ChatLaunch', {
  geo: ({ h }) => {
    const g = h;
    const X = f;
    return {
      arrow: {
        d: `M${LAUNCH_ARROW.map((p) => P(LAUNCH_TAIL(p) ? p : [p[0] + 2 * h, p[1] - 2 * h])).join('L')}Z`,
      },
      right: {
        d:
          `M${X(28 + g)} 16L${X(28 + g)} ${X(20 + g)}A2 2 0 0 1 ${X(26 + g)} ${X(22 + g)}L${X(20 - g * TAIL_RUN)} ${X(22 + g)}L16 29L17.7358 30` +
          `L${X(21.1646 - (g * 3.4288) / 6)} ${X(24 + g)}L${X(26 + g)} ${X(24 + g)}A4 4 0 0 0 ${X(30 + g)} ${X(20 + g)}L${X(30 + g)} 16Z`,
      },
      left: {
        d:
          `M${X(4 - g)} ${X(20 + g)}L${X(4 - g)} ${X(8 - g)}A2 2 0 0 1 ${X(6 - g)} ${X(6 - g)}L18 ${X(6 - g)}L18 ${X(4 - g)}L${X(6 - g)} ${X(4 - g)}` +
          `A4 4 0 0 0 ${X(2 - g)} ${X(8 - g)}L${X(2 - g)} ${X(20 + g)}A4 4 0 0 0 ${X(6 - g)} ${X(24 + g)}L15 ${X(24 + g)}L15 ${X(22 + g)}` +
          `L${X(6 - g)} ${X(22 + g)}A2 2 0 0 1 ${X(4 - g)} ${X(20 + g)}Z`,
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(ChatLaunch32),
});

// ── Collapse all ─────────────────────────────────────────────────────────────

// Collapse all: the top tab slides (−5, +5) onto the middle tab, and
// the body (Carbon's rounded box and its hole, one path, no mask) slides
// (+5, −5) up over the middle tab, which stays put. As they collapse, each
// rectangle grows 1px on every side at constant 2px walls: the
// box 2px larger, the tabs' corners out and their arms 1px longer.
/** A tab: the top-right corner of a rectangle, outer right R, top T, its arms ending at x L and y B. */
const tab = (R: number, T: number, L: number, B: number) =>
  `M${f(R)} ${f(B)}H${f(R - 2)}V${f(T + 2)}H${f(L)}V${f(T)}H${f(R - 2)}A2 2 0 0 1 ${f(R)} ${f(T + 2)}Z`;
/** The box: outer L, T, R, B with r2 corners, square inside 2px in. */
const box = (L: number, T: number, R: number, B: number) =>
  `M${f(R - 2)} ${f(B)}H${f(L + 2)}A2 2 0 0 1 ${f(L)} ${f(B - 2)}V${f(T + 2)}A2 2 0 0 1 ${f(L + 2)} ${f(T)}H${f(R - 2)}A2 2 0 0 1 ${f(R)} ${f(T + 2)}V${f(B - 2)}A2 2 0 0 1 ${f(R - 2)} ${f(B)}Z` +
  `M${f(L + 2)} ${f(T + 2)}V${f(B - 2)}H${f(R - 2)}V${f(T + 2)}Z`;
export const CollapseAllSpec = /* @__PURE__ */ hoverIcon('CollapseAll', {
  geo: ({ h }) => {
    const g = h;
    return {
      top: {
        d: tab(30 + g, 5 - g, 13 - g, 15 + g),
        transform: move(-5 * h, 5 * h),
      },
      mid: { d: tab(25 + g, 10 - g, 8 - g, 20 + g) },
      body: {
        d: box(2 - g, 15 - g, 20 + g, 27 + g),
        transform: move(5 * h, -5 * h),
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(CollapseAll32),
});

// ── Explore ──────────────────────────────────────────────────────────────────

// Explore (with its bounce): the engine runs 250ms linear. The ring
// (centreline r 13) grows to r 14 over 0–150ms; the needle turns about the
// centre to −61° over 0–150ms, then settles to −45° over 150–250ms, each
// step on the entrance ease. Leaving plays it back (110/150 as fast).
const EXPLORE_MS = 250;
const NEEDLE =
  'M22.707,9.2931a.9992.9992,0,0,0-1.0234-.2417l-9,3a1.001,1.001,0,0,0-.6323.6323l-3,9a1,1,0,0,0,1.2651,1.2651l9-3a1.0013,1.0013,0,0,0,.6323-.6324l3-9A1,1,0,0,0,22.707,9.2931ZM11.5811,20.419l2.2094-6.6284L18.21,18.21Z';
export const ExploreSpec = /* @__PURE__ */ hoverIcon('Explore', {
  hover: { duration: EXPLORE_MS / 1000, ease: LINEAR },
  geo: ({ h, entering = 1 }) => {
    const ms = h * EXPLORE_MS;
    // Leaving, the needle and ring go straight back on the exit ease (the
    // bounce is only on the way in).
    const back = 1 - EXIT(1 - h);
    const swing = entering ? slice(ms, 0, 150) : back;
    const settle = slice(ms, 150, 100);
    const deg = entering ? -61 * swing + 16 * settle : -45 * back;
    return {
      ring: { d: ringPath([16, 16], 13 + swing, 2) },
      needle: { d: NEEDLE, transform: `rotate(${f(deg)} 16 16)` },
    };
  },
  static: /* @__PURE__ */ carbonArt(Explore32),
});

// ── Filter family ────────────────────────────────────────────────────────────

const FUNNEL =
  'M18,28H14a2,2,0,0,1-2-2V18.41L4.59,11A2,2,0,0,1,4,9.59V6A2,2,0,0,1,6,4H26a2,2,0,0,1,2,2V9.59A2,2,0,0,1,27.41,11L20,18.41V26A2,2,0,0,1,18,28ZM6,6V9.59l8,8V26h4V17.59l8-8V6Z';

/**
 * Filter's wave: a 2px line with round caps (the legacy stroke), its
 * centreline a 5-piece cubic; it slides (+24, −13.375). Where the legacy
 * component clipped it to the funnel's inside (1px into the walls), the
 * wave's outline is cut to that region here: its two convex parts, the
 * cone and the stem, overlapping by 1px so no seam shows.
 */
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
const cubicAt = ([a, b, c, d]: Pt[], t: number): Pt => {
  const u = 1 - t;
  return [
    u * u * u * a[0] +
      3 * u * u * t * b[0] +
      3 * u * t * t * c[0] +
      t * t * t * d[0],
    u * u * u * a[1] +
      3 * u * u * t * b[1] +
      3 * u * t * t * c[1] +
      t * t * t * d[1],
  ];
};
const WAVE_PTS: Pt[] = [
  WAVE[0][0],
  .../* @__PURE__ */ WAVE.flatMap((seg) =>
    Array.from({ length: 16 }, (_, i) => cubicAt(seg, (i + 1) / 16))
  ),
];
/** A centreline's 2px outline with round caps (normals from neighbouring samples). */
function roundStroke(pts: readonly Pt[]): Pt[] {
  const n = pts.length;
  const tan = (i: number): Pt => {
    const [a, b] = [pts[Math.max(0, i - 1)], pts[Math.min(n - 1, i + 1)]];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    return [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
  };
  const side = (s: number) =>
    pts.map((p, i) => {
      const t = tan(i);
      return [p[0] - t[1] * s, p[1] + t[0] * s] as Pt;
    });
  const cap = (p: Pt, t: Pt, s: number) =>
    Array.from({ length: 11 }, (_, k) => {
      const a = (Math.PI * (k + 1)) / 12;
      // From the +s side, round the tip (along s·t), to the −s side.
      return [
        p[0] + Math.cos(a) * -t[1] * s + Math.sin(a) * t[0] * s,
        p[1] + Math.cos(a) * t[0] * s + Math.sin(a) * t[1] * s,
      ] as Pt;
    });
  return [
    ...side(1),
    ...cap(pts[n - 1], tan(n - 1), 1),
    ...side(-1).reverse(),
    ...cap(pts[0], tan(0), -1),
  ];
}
const FILTER_CONE: Pt[] = [
  [5, 5],
  [27, 5],
  [27, 10],
  [19, 18],
  [13, 18],
  [5, 10],
];
const FILTER_STEM: Pt[] = [
  [13, 17],
  [19, 17],
  [19, 27],
  [13, 27],
];
/** Filter's hover timing: longer than the standard hover so the wave can travel: moderate-02. */
export const FILTER_HOVER = {
  duration: motionTokens.duration.moderate02 / 1000,
  ease: HOVER.ease,
};
export const FilterSpec = /* @__PURE__ */ hoverIcon('Filter', {
  hover: FILTER_HOVER,
  geo: ({ h }) => {
    let wave = '';
    if (h > 1e-4) {
      const outline = roundStroke(
        WAVE_PTS.map(([x, y]) => [x + 24 * h, y - 13.375 * h] as Pt)
      );
      wave = [FILTER_CONE, FILTER_STEM]
        .map((region) => polyD(clipConvex(outline, region)))
        .join('');
    }
    return { funnel: { d: FUNNEL }, wave: { d: wave } };
  },
  static: /* @__PURE__ */ carbonArt(Filter32),
});

// Filter edit: the pencil slides 2px left; the funnel holds.
const FUNNEL_OPEN =
  'M26,6H4V9.17l7.41,7.42.59.58V26h4V24h2v2a2,2,0,0,1-2,2H12a2,2,0,0,1-2-2V18L2.59,10.59A2,2,0,0,1,2,9.17V6A2,2,0,0,1,4,4H26Z';
const FILTER_PENCIL =
  'M29.71,11.29l-3-3a1,1,0,0,0-1.42,0L16,17.59V22h4.41l9.3-9.29A1,1,0,0,0,29.71,11.29ZM19.59,20H18V18.41l5-5L24.59,15ZM26,13.59,24.41,12,26,10.41,27.59,12Z';
export const FilterEditSpec = /* @__PURE__ */ hoverIcon('FilterEdit', {
  geo: ({ h }) => ({
    funnel: { d: FUNNEL_OPEN },
    pencil: { d: FILTER_PENCIL, transform: move(-2 * h, 0) },
  }),
  static: /* @__PURE__ */ carbonArt(FilterEdit32),
});

// Filter remove: each of the X's four arm ends reaches 2px further
// along its arm (Carbon's points; the arm width holds).
const FUNNEL_REMOVE =
  'M4,4A2,2,0,0,0,2,6V9.1709a2,2,0,0,0,.5859,1.4145L10,18v8a2,2,0,0,0,2,2h4a2,2,0,0,0,2-2V24H16v2H12V17.1709l-.5859-.5855L4,9.1709V6H24V8h2V6a2,2,0,0,0-2-2Z';
const X_PTS: Pt[] = [
  [30, 11.414],
  [28.586, 10],
  [24, 14.586],
  [19.414, 10],
  [18, 11.414],
  [22.586, 16],
  [18, 20.585],
  [19.415, 22],
  [24, 17.414],
  [28.587, 22],
  [30, 20.587],
  [25.414, 16],
];
export const FilterRemoveSpec = /* @__PURE__ */ hoverIcon('FilterRemove', {
  geo: ({ h }) => {
    const r = (2 * h) / Math.SQRT2;
    const x = X_PTS.map(
      ([px, py]): Pt =>
        Math.hypot(px - 24, py - 16) > 3
          ? [px + Math.sign(px - 24) * r, py + Math.sign(py - 16) * r]
          : [px, py]
    );
    return {
      funnel: { d: FUNNEL_REMOVE },
      x: { d: `M${x.map(P).join('L')}Z` },
    };
  },
  static: /* @__PURE__ */ carbonArt(FilterRemove32),
});

// Filter reset: the arc (2px about (22.5, 16.5), centreline r 6.5)
// runs anticlockwise from Carbon's foot at the bottom; its end lengthens
// from 70% to 79% of the circle as the arrowhead (Carbon's L) turns −30°
// about the arc's centre. The arc's end stays tucked inside the L.
const FUNNEL_RESET =
  'M26,6H4V9.171l7.4142,7.4143L12,17.171V26h4V24h2v2a2,2,0,0,1-2,2H12a2,2,0,0,1-2-2V18L2.5858,10.5853A2,2,0,0,1,2,9.171V6A2,2,0,0,1,4,4H26Z';
const RESET_HEAD = 'M22,16L14,16L14,8L16,8L16,14L22,14Z';
const RESET_C: Pt = [22.5, 16.5];
export const FilterResetSpec = /* @__PURE__ */ hoverIcon('FilterReset', {
  geo: ({ h }) => {
    const a = ((90 - 360 * (0.7 + 0.09 * h)) * Math.PI) / 180;
    const at = (r: number): Pt => [
      RESET_C[0] + r * Math.cos(a),
      RESET_C[1] + r * Math.sin(a),
    ];
    return {
      funnel: { d: FUNNEL_RESET },
      arc: {
        d: `M22 24L22.5 24A7.5 7.5 0 1 0 ${P(at(7.5))}L${P(at(5.5))}A5.5 5.5 0 1 1 22.5 22L22 22Z`,
      },
      head: { d: RESET_HEAD, transform: `rotate(${f(-30 * h)} 22.5 16.5)` },
    };
  },
  static: /* @__PURE__ */ carbonArt(FilterReset32),
});

// ── Idea ─────────────────────────────────────────────────────────────────────

/**
 * Carbon's bulb, the glass risen g: every point moves up except the legs'
 * feet (y 22), which hold, so each leg gains a straight piece g long.
 */
function bulb(g: number) {
  const Y = (y: number) => f(y - g);
  return (
    `M16 ${Y(2)}A10 10 0 0 0 6 ${Y(12)}A9.19 9.19 0 0 0 9.46 ${Y(19.62)}C10.46 ${Y(20.55)} 11 ${Y(21.08)} 11 ${Y(22)}L11 22L13 22L13 ${Y(22)}` +
    `C13 ${Y(20.16)} 11.89 ${Y(19.13)} 10.81 ${Y(18.14)}A7.2 7.2 0 0 1 8 ${Y(12)}A8 8 0 0 1 24 ${Y(12)}A7.2 7.2 0 0 1 21.18 ${Y(18.14)}` +
    `C20.11 ${Y(19.14)} 19 ${Y(20.14)} 19 ${Y(22)}L19 22L21 22L21 ${Y(22)}C21 ${Y(21.08)} 21.53 ${Y(20.55)} 22.54 ${Y(19.61)}` +
    `A9.18 9.18 0 0 0 26 ${Y(12)}A10 10 0 0 0 16 ${Y(2)}Z`
  );
}
// Idea (100fps), in the 32 frame: the engine runs 200ms linear.
//  - 0–110ms: the bulb rises 1px, the filament (x 16, foot at y 22) draws
//    up to y 16, and the rays all rise 1px.
//  - The side rays: from a point on the bulb's wall (x 25 / 7) to 27–30 /
//    5–2 by 70ms, then 28–32 / 4–0 by 110ms.
//  - The diagonal rays: from their inner points out to their tips, 80–200ms.
const IDEA_MS = 200;
const SIDE_RAYS: [Pt, Pt, Pt, Pt, Pt][] = [
  // start, middle (a, b), end (a, b)
  [
    [25, 12],
    [27, 12],
    [30, 12],
    [28, 12],
    [32, 12],
  ],
  [
    [7, 12],
    [5, 12],
    [2, 12],
    [4, 12],
    [0, 12],
  ],
];
const DIAGONAL_RAYS: [Pt, Pt][] = [
  [
    [6.17, 5.118],
    [2, 2.198],
  ],
  [
    [25.83, 18.883],
    [30, 21.803],
  ],
  [
    [25.83, 5.117],
    [30, 2.197],
  ],
  [
    [6.17, 18.882],
    [2, 21.802],
  ],
];
export const IdeaSpec = /* @__PURE__ */ hoverIcon('Idea', {
  hover: { duration: IDEA_MS / 1000, ease: LINEAR },
  geo: ({ h }) => {
    const ms = h * IDEA_MS;
    const rise = slice(ms, 0, 110);
    const up = (p: Pt): Pt => [p[0], p[1] - rise];
    const s: Record<string, Record<string, string | number>> = {
      bulb: { d: bulb(rise) },
      socket: { d: rectPath(11, 24, 21, 26) },
      base: { d: rectPath(13, 28, 19, 30) },
      filament: { d: bar([16, 22], [16, 22 - 6 * rise]) },
    };
    const [m0, m1] = [slice(ms, 0, 70), slice(ms, 70, 40)];
    SIDE_RAYS.forEach(([start, ma, mb, ea, eb], i) => {
      const [a, b] =
        ms < 70
          ? [lerpPt(start, ma, m0), lerpPt(start, mb, m0)]
          : [lerpPt(ma, ea, m1), lerpPt(mb, eb, m1)];
      s[`side${i}`] = { d: bar(up(a), up(b)) };
    });
    const k = slice(ms, 80, 120);
    DIAGONAL_RAYS.forEach(([a, b], i) => {
      s[`ray${i}`] = { d: bar(up(a), up(lerpPt(a, b, k))) };
    });
    return s;
  },
  static: /* @__PURE__ */ carbonArt(Idea32),
});

// ── Image search ─────────────────────────────────────────────────────────────

// Image search: the sun (a 2px ring, r 2) and the hills pan 2px left;
// the hills' left slope ends square inside the frame's left wall, its end
// sliding along the slope so it stays hidden there. The magnifier (Carbon's
// outline) turns −15° about (16, 28) and steps 1px right.
const IMAGE_FRAME =
  'M4 4L24 4L24 10L26 10L26 4A2 2 0 0 0 24 2L4 2A2 2 0 0 0 2 4L2 24A2 2 0 0 0 4 26L12 26L12 24L4 24Z';
const MAGNIFIER =
  'M24,14a5.99,5.99,0,0,0-4.885,9.4712L14,28.5859,15.4141,30l5.1147-5.1147A5.9971,5.9971,0,1,0,24,14Zm0,10a4,4,0,1,1,4-4A4.0045,4.0045,0,0,1,24,24Z';
function hills(dx: number, h: number) {
  // The slope's upper edge runs down-left from the peak's arc end (7.5859, 11.5825).
  const ux = 2 + 0.562 * h;
  const uy = 11.5825 + (7.5859 + dx - ux);
  const X = (x: number) => f(x + dx);
  return `M${X(16)} 17.168L${X(10.4141)} 11.5825A2 2 0 0 0 ${X(7.5859)} 11.5825L${f(ux)} ${f(uy)}L${f(ux + 1.4142)} ${f(uy + 1.4142)}L${X(9)} 13L${X(14.5859)} 18.5859Z`;
}
export const ImageSearchSpec = /* @__PURE__ */ hoverIcon('ImageSearch', {
  geo: ({ h }) => ({
    frame: { d: IMAGE_FRAME },
    sun: { d: ringPath([17 - 2 * h, 9], 2, 2) },
    hills: { d: hills(-2 * h, h) },
    magnifier: {
      d: MAGNIFIER,
      transform: `translate(${f(h)} 0) rotate(${f(-15 * h)} 16 28)`,
    },
  }),
  static: /* @__PURE__ */ carbonArt(ImageSearch32),
});

// ── Layers ───────────────────────────────────────────────────────────────────

// Layers: the bottom layer rises 2px and the top layer drops 2px
// (together); the middle layer holds. The whole icon grows 14/13 about (16, 16) at
// constant weight, so the side tips (their centrelines 13 out) move 1px out a
// side. It is done as geometry: Carbon's outlines in absolute form, each point
// riding with the nearest corner of its layer's centreline (the top diamond's
// four, each chevron's apex and arm ends), and only the corners scale. Every
// wall keeps its 2px and every rounded corner its r 1.

/** The whole icon's growth on hover: the side tips (13 from the middle) move 1px. */
export const LAYERS_GROW = 1 / 13;
const LAYER_BOTTOM =
  'M16 30A.9967 .9967 0 0 1 15.5259 29.88L2.5259 22.88L3.4741 21.12L16 27.8643L28.5259 21.12L29.4741 22.8807L16.4741 29.8807A.9967 .9967 0 0 1 16 30Z';
const LAYER_MID = /* @__PURE__ */ movePath(LAYER_BOTTOM, 0, -6);
const LAYER_TOP =
  'M16 18A.9967 .9967 0 0 1 15.5259 17.88L2.5259 10.88A1 1 0 0 1 2.5259 9.1193L15.5259 2.1193A.9982 .9982 0 0 1 16.4741 2.1193' +
  'L29.4741 9.1193A1 1 0 0 1 29.4741 10.88L16.4741 17.88A.9967 .9967 0 0 1 16 18ZM5.1094 10L16 15.8643L26.8906 10L16 4.1358Z';
/** A chevron's centreline corners (its arm ends and its apex, at y). */
const chevronAt = (y: number): Pt[] => [
  [3, y - 7],
  [16, y],
  [29, y - 7],
];
/** The top diamond's centreline corners. */
const DIAMOND: Pt[] = [
  [16, 3],
  [29, 10],
  [16, 17],
  [3, 10],
];
const nearest = (corners: readonly Pt[], p: Pt) =>
  corners.reduce((a, c) =>
    Math.hypot(c[0] - p[0], c[1] - p[1]) < Math.hypot(a[0] - p[0], a[1] - p[1])
      ? c
      : a
  );
/**
 * `d` with each point moved by `shift` (the same for all the points of one
 * corner), then scaled `s` about (16, 16) at constant weight: the point rides
 * with its nearest centreline corner, and only the corner scales.
 */
function grown(
  d: string,
  corners: readonly Pt[],
  s: number,
  shift: (p: Pt) => Pt = () => [0, 0]
) {
  return mapPath(d, (p) => {
    const [c, [dx, dy]] = [nearest(corners, p), shift(p)];
    return [
      p[0] + dx + (s - 1) * (c[0] + dx - 16),
      p[1] + dy + (s - 1) * (c[1] + dy - 16),
    ];
  });
}
/** The chevrons at hover h, grown s: the bottom one rises 2px, the middle one holds. */
const chevrons = (h: number, s: number) => ({
  bottom: { d: grown(LAYER_BOTTOM, chevronAt(29), s, () => [0, -2 * h]) },
  mid: { d: grown(LAYER_MID, chevronAt(23), s) },
});
export const LayersSpec = /* @__PURE__ */ hoverIcon('Layers', {
  geo: ({ h }) => {
    const s = 1 + LAYERS_GROW * h;
    return {
      ...chevrons(h, s),
      top: { d: grown(LAYER_TOP, DIAMOND, s, () => [0, 2 * h]) },
    };
  },
  static: /* @__PURE__ */ carbonArt(Layers32),
});

// ── Layers external ──────────────────────────────────────────────────────────

// Layers' hover on Carbon's layers--external, whose top layer is the
// diamond's right half (cut at x 16) with an up arrow at the top left. The
// layers move and grow as Layers'. The arrow grows with them (its corners
// scale too) and its head reaches 2px up, the tail held, as Export's and
// Cloud upload's arrows do. The head comes towards the top layer's upper
// wall, so that wall's cut end draws back 2px along the wall as it reaches
// (as Analytics reference's axis ends do): the space between them never
// falls below 2.35px (3.44px at rest; without the draw-back it would close
// to 1.1px).

/** How far the arrow's head reaches up, and the top layer's upper cut end draws back along its wall. */
export const LAYERS_EXTERNAL_REACH = 2;
const HALF_TOP =
  'M29.4741 9.1196L16 1.8643L16 4.1358L26.8906 10L16 15.8643L16 18.1358L29.4741 10.8804' +
  'C29.7981 10.7061 30 10.3682 30 10S29.7981 9.2939 29.4741 9.1196Z';
const UP_ARROW =
  'M4.4141 9.4141L8 5.8281L8 14L10 14L10 5.8281L13.5859 9.4141L15 8L9 2L3 8Z';
/** The arrow's centreline corners: its head's tip, its arms' ends and its tail. */
const ARROW_CORNERS: Pt[] = [
  [9, 2 + Math.SQRT2],
  [3.7071, 8.7071],
  [14.2929, 8.7071],
  [9, 14],
];
/** The upper wall's direction, down and right from its cut end (Carbon's 13:7 slope). */
const WALL: Pt = [0.880471, 0.4741];
export const LayersExternalSpec = /* @__PURE__ */ hoverIcon('LayersExternal', {
  geo: ({ h }) => {
    const [s, m] = [1 + LAYERS_GROW * h, LAYERS_EXTERNAL_REACH * h];
    // The top layer drops 2px; its upper cut end (at x 16, above y 5) also slides back along its wall.
    const top = (p: Pt): Pt =>
      p[0] === 16 && p[1] < 5 ? [WALL[0] * m, 2 * h + WALL[1] * m] : [0, 2 * h];
    return {
      ...chevrons(h, s),
      top: { d: grown(HALF_TOP, DIAMOND, s, top) },
      arrow: {
        d: grown(UP_ARROW, ARROW_CORNERS, s, (p) => [0, p[1] === 14 ? 0 : -m]),
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(LayersExternal32),
});

// ── Request quote ────────────────────────────────────────────────────────────

// Request quote: the pencil slides 2px left and the
// document's top edge ends 2px shorter with it; the lower-right edge holds.
const QUOTE_PENCIL =
  'M29.54,5.76l-3.3-3.3a1.6,1.6,0,0,0-2.24,0l-14,14V22h5.53l14-14a1.6,1.6,0,0,0,0-2.24ZM14.7,20H12V17.3l9.44-9.45,2.71,2.71ZM25.56,9.15,22.85,6.44l2.27-2.27,2.71,2.71Z';
export const RequestQuoteSpec = /* @__PURE__ */ hoverIcon('RequestQuote', {
  geo: ({ h }) => {
    const x = f(16 - 2 * h);
    return {
      doc: {
        d: `M22 22L22 28L6 28L6 4L${x} 4L${x} 2L6 2A2 2 0 0 0 4 4L4 28A2 2 0 0 0 6 30L22 30A2 2 0 0 0 24 28L24 22Z`,
      },
      pencil: { d: QUOTE_PENCIL, transform: move(-2 * h, 0) },
    };
  },
  static: /* @__PURE__ */ carbonArt(RequestQuote32),
});

// ── Scan ─────────────────────────────────────────────────────────────────────

// Scan: the bracket steps 3px right with the bars stepping 3px left
// (the comp has the middle and right bars 30ms and 60ms later; no stagger
// here: it doesn't read at small sizes).
const SCAN_FRAME = 'M21,29H5a2,2,0,0,1-2-2V5A2,2,0,0,1,5,3H21V5H5V27H21Z';
const scan = /* @__PURE__ */ together();
export const ScanSpec = /* @__PURE__ */ hoverIcon('Scan', {
  hover: scan.hover,
  geo: ({ h }) => {
    const [a, b, c] = [0, 1, 2].map((i) => 3 * scan.at(h, i));
    return {
      frame: { d: SCAN_FRAME, transform: move(a, 0) },
      bar0: { d: rectPath(15 - a, 9, 17 - a, 23) },
      bar1: { d: rectPath(21 - b, 9, 23 - b, 23) },
      bar2: { d: rectPath(27 - c, 9, 29 - c, 23) },
    };
  },
  static: /* @__PURE__ */ carbonArt(Scan32),
});

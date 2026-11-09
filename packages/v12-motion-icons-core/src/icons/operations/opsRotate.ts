/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Redo32 from '@carbon/icons/es/redo/32.js';
import Reset32 from '@carbon/icons/es/reset/32.js';
import Restart16 from '@carbon/icons/es/restart/16.js';
import Restart32 from '@carbon/icons/es/restart/32.js';
import ResetAlt32 from '@carbon/icons/es/reset--alt/32.js';
import Repeat32 from '@carbon/icons/es/repeat/32.js';
import Loop32 from '@carbon/icons/es/loop/32.js';
import Renew32 from '@carbon/icons/es/renew/32.js';
import RecentlyViewed32 from '@carbon/icons/es/recently-viewed/32.js';
import Rotate32 from '@carbon/icons/es/rotate/32.js';
import ReplyAll32 from '@carbon/icons/es/reply--all/32.js';
import { defineAction, hoverIcon, carbonArt, withStatic } from '../../engine';
import { mapPath, type Pt } from '../../geometry';
import { LINE, f } from '../../paint';
import { motionTokens, toEasing } from '../../tokens';
import { OUT_BACK, outAndBack } from '../../actionGeo';

/**
 * Turning and looping operations on the frame engine: the same parts move
 * as in their reference animations, with the shared hover (160ms entrance in, 120ms exit
 * out), cleanup on unmount, and Carbon's own outlines at rest. Every shape
 * is geometry: heads move rigidly and the straight shafts behind them
 * lengthen, rigid parts rotate about the icon's centre, and nothing is
 * scaled, so the line weight never changes.
 *
 *  - Redo, Reset, Restart: the head reaches 4px along its straight shaft
 *    (a standalone arrow).
 *  - Reset alt: the head reaches 2px (an arrow on a glyph, the box).
 *  - Repeat: both heads reach 2px outward (a set of two).
 *  - Loop: the ring tightens r 8 → 7 with its foot on the
 *    line, and the head reaches 3px.
 *  - Renew: the two arrows turn 45° anticlockwise as one.
 *  - Recently viewed: the arrowed ring and the minute hand turn 45°
 *    anticlockwise; the hour hand holds.
 *  - Rotate: the dashes turn 55° anticlockwise, the arrow's
 *    corner 45° and the arc's tail 30° (so the arc lengthens), and a dash
 *    that reaches the arc's tail stops there (the reference's matte, as geometry).
 *  - Reply all: the arrow moves like Reply — its head reaches 3px left and
 *    the tail stretches out to it smoothly; the back chevron reaches 2px.
 */

const C: Pt = [16, 16];
const rad = (deg: number) => (deg * Math.PI) / 180;
/** `p` turned `deg` about `c` (negative = anticlockwise on screen). */
const turn = (p: Pt, deg: number, c: Pt = C): Pt => {
  const [cos, sin] = [Math.cos(rad(deg)), Math.sin(rad(deg))];
  const [dx, dy] = [p[0] - c[0], p[1] - c[1]];
  return [c[0] + dx * cos - dy * sin, c[1] + dx * sin + dy * cos];
};
const turnPath = (d: string, deg: number) => mapPath(d, (p) => turn(p, deg));
const P = (p: Pt) => `${f(p[0])} ${f(p[1])}`;

// ── Straight-shaft arrows: the head's points move, the rest hold ────────────

/** Carbon's path (absolute) with the points `isHead` picks moved by (dx, dy)·h. */
const reach = (
  name: string,
  paths: Record<string, { d: string; isHead: (p: Pt) => boolean; dir: Pt }>,
  dist: number
) =>
  hoverIcon(name, {
    geo: ({ h }) => {
      const out: Record<string, { d: string }> = {};
      for (const k in paths) {
        const { d, isHead, dir } = paths[k];
        const m = dist * h;
        out[k] = {
          d: mapPath(d, (p) =>
            isHead(p) ? [p[0] + dir[0] * m, p[1] + dir[1] * m] : p
          ),
        };
      }
      return out;
    },
  });

const REDO =
  'M12 10H24.1851L20.5977 6.4141L22 5L28 11L22 17L20.5977 15.5854L24.1821 12H12A6 6 0 0 0 12 24H20V26H12A8 8 0 0 1 12 10Z';
const redoHead = ([x, y]: Pt) => x > 13 && y <= 17;
/**
 * The action's sweep: the
 * head runs out until its tip (x 28) is on the box's edge (34), and the tail end draws in as far (Undo's, mirrored).
 */
const REDO_SWEEP = 6;
/** Redo with its head `head` px right and its tail end (the bottom bar's, at x 20) `tail` px along toward the arc. */
const redoArrow = (head: number, tail: number) =>
  mapPath(REDO, (p) =>
    redoHead(p)
      ? [p[0] + head, p[1]]
      : p[0] === 20 && p[1] >= 24
        ? [p[0] - tail, p[1]]
        : p
  );
export const RedoSpec = /* @__PURE__ */ hoverIcon('Redo', {
  geo: ({ h }) => ({ arrow: { d: redoArrow(4 * h, 0) } }),
  static: /* @__PURE__ */ carbonArt(Redo32),
  action: /* @__PURE__ */ defineAction({
    description:
      'Redone: the arrow sweeps forward along its own path, then sweeps back and lands.',
    duration: OUT_BACK,
    geo: ({ h, a }) => {
      const s = a <= 0 || a >= 1 ? 0 : REDO_SWEEP * outAndBack(a);
      return {
        arrow: {
          d: s ? redoArrow(Math.max(4 * h, s), s) : redoArrow(4 * h, 0),
        },
      };
    },
  }),
});

export const ResetSpec = /* @__PURE__ */ withStatic(
  reach(
    'Reset',
    {
      arrow: {
        d: 'M18 28A12 12 0 1 0 6 16V22.2L2.4 18.6L1 20L7 26L13 20L11.6 18.6L8 22.2V16H8A10 10 0 1 1 18 26Z',
        isHead: ([x, y]) => x < 14 && y > 17,
        dir: [0, 1],
      },
    },
    4
  ),
  /* @__PURE__ */ carbonArt(Reset32)
);

const RESTART =
  'M26 18A10 10 0 1 1 16 8H22.1821L18.5977 11.5854L20 13L26 7L20 1L18.5977 2.414L22.1851 6H16A12 12 0 1 0 28 18Z';
const restartHead = ([x, y]: Pt) => x > 17 && y < 14;
/**
 * Restart's action:
 * the head runs right until its tip (26, 7) is on the box's edge (34), the top of the ring lengthening behind it as the
 * hover's does, and the ring's tail end (3 o'clock) draws back round the ring as far (on its 11px centreline), so the line
 * slides along itself.
 */
const RESTART_PUSH = 8;
/** Restart with its head `head` px right and its tail end drawn `tail` px back round the ring. */
function restartArrow(head: number, tail: number): string {
  const reachD = (p: Pt): Pt => (restartHead(p) ? [p[0] + head, p[1]] : p);
  if (!tail) {
    return mapPath(RESTART, reachD);
  }
  const t = tail / 11;
  const at = (r: number) =>
    `${f(16 + r * Math.cos(t))} ${f(18 + r * Math.sin(t))}`;
  const x = (v: number) => f(v + head);
  return `M${at(10)}A10 10 0 1 1 16 8H${x(22.1821)}L${x(18.5977)} 11.5854L${x(20)} 13L${x(26)} 7L${x(20)} 1L${x(18.5977)} 2.414L${x(22.1851)} 6H16A12 12 0 1 0 ${at(12)}Z`;
}
export const RestartSpec = /* @__PURE__ */ hoverIcon('Restart', {
  geo: ({ h }) => ({
    arrow: {
      d: mapPath(RESTART, (p) => (restartHead(p) ? [p[0] + 4 * h, p[1]] : p)),
    },
  }),
  static: /* @__PURE__ */ carbonArt(Restart16, Restart32),
  action: /* @__PURE__ */ defineAction({
    description:
      "Restarted: the arrow is pushed forward around the ring, then goes back and lands. It doesn't loop: `loop` and `until` play one pass.",
    // No loop option: `loop` plays one pass.
    loops: false,
    duration: OUT_BACK,
    geo: ({ h, a }) => {
      const s = a <= 0 || a >= 1 ? 0 : RESTART_PUSH * outAndBack(a);
      return { arrow: { d: restartArrow(Math.max(4 * h, s), s) } };
    },
  }),
});

export const ResetAltSpec = /* @__PURE__ */ withStatic(
  reach(
    'ResetAlt',
    {
      arrow: {
        d: 'M27 8H6.83L10.41 4.41L9 3L3 9L9 15L10.41 13.59L6.83 10H27V26H7V19H5V26A2 2 0 0 0 7 28H27A2 2 0 0 0 29 26V10A2 2 0 0 0 27 8Z',
        isHead: ([x, y]) => x < 11 && y < 16,
        dir: [-1, 0],
      },
    },
    2
  ),
  /* @__PURE__ */ carbonArt(ResetAlt32)
);

export const RepeatSpec = /* @__PURE__ */ withStatic(
  reach(
    'Repeat',
    {
      top: {
        d: 'M6 6H26.1719L22.5859 2.4141L24 1L30 7L24 13L22.5859 11.5859L26.1719 8H6V15H4V8A2.0024 2.0024 0 0 1 6 6Z',
        isHead: ([x]) => x > 20,
        dir: [1, 0],
      },
      bottom: {
        d: 'M9.4141 20.4141L5.8281 24H26V17H28V24A2.0024 2.0024 0 0 1 26 26H5.8281L9.414 29.5859L8 31L2 25L8 19Z',
        isHead: ([x]) => x < 12,
        dir: [-1, 0],
      },
    },
    2
  ),
  /* @__PURE__ */ carbonArt(Repeat32)
);

// ── Loop ────────────────────────────────────────────────────────────────────

// The ring's centreline: foot at (13, 23) on the line, open end at Carbon's
// cut (146.24°). On hover r 8 → 7 with the foot held; the stroke stays 2px.
const LOOP_END = Math.atan2(5, -7.48);
export const LoopSpec = /* @__PURE__ */ hoverIcon('Loop', {
  geo: ({ h }) => {
    const r = 8 - h;
    const c: Pt = [13, 23 - r];
    const end: Pt = [
      c[0] + r * Math.cos(LOOP_END),
      c[1] + r * Math.sin(LOOP_END),
    ];
    const x = (v: number) => f(v + 3 * h);
    return {
      line: { d: 'M2 23H13', ...LINE },
      ring: { d: `M13 23A${f(r)} ${f(r)} 0 1 0 ${P(end)}`, ...LINE },
      arrow: {
        d: `M21 22L21 24L${x(26)} 24L${x(23.59)} 26.59L${x(25)} 28L${x(30)} 23L${x(25)} 18L${x(23.59)} 19.41L${x(26)} 22Z`,
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(Loop32),
});

// ── Rigid turns ─────────────────────────────────────────────────────────────

const RENEW_A =
  'M12 10H6.78A11 11 0 0 1 27 16H29A13 13 0 0 0 6 7.68V4H4V12H12Z';
const RENEW_B =
  'M20 22H25.22A11 11 0 0 1 5 16H3A13 13 0 0 0 26 24.32V28H28V20H20Z';
const renewShapes = (deg: number) => ({
  a: { d: turnPath(RENEW_A, deg) },
  b: { d: turnPath(RENEW_B, deg) },
});
export const RenewSpec = /* @__PURE__ */ hoverIcon('Renew', {
  geo: ({ h }) => renewShapes(-45 * h),
  static: /* @__PURE__ */ carbonArt(Renew32),
  action: /* @__PURE__ */ defineAction({
    description:
      'Renewed: the two arrows make half a turn counterclockwise and land on the same drawing. Looped, they turn steadily while something syncs; when the loop stops, they ease to the next rest, and the hand-off (`then`) begins as they settle.',
    duration: motionTokens.duration.moderate02 / 1000,
    ease: /* @__PURE__ */ toEasing(motionTokens.easing.standard),
    // Looped, half a turn every slow-02.
    cycle: motionTokens.duration.slow02 / 1000,
    // A period is half a turn: each arrow lands where the other was, the same drawing (the icon is symmetric under a
    // half turn), so the turn runs on the fraction of a and every whole a is the rest drawing exactly. Past a quarter
    // turn the two keys trade arrows (an invisible swap: the same drawing), so each key always draws the arrow
    // nearest its own place: the status layer's cut, fixed per part, follows the right arrow as the turn lands.
    geo: ({ h, a }) => {
      const frac = a - Math.floor(a);
      const s = renewShapes(-45 * h - 180 * frac);
      return frac < 0.5 ? s : { a: s.b, b: s.a };
    },
  }),
});

// Carbon's hands are one outline; split into the minute hand (pivoting at
// the centre) and the hour hand, whose union at rest is that outline.
const RV_RING =
  'M16 2A13.94 13.94 0 0 0 6 6.23V2H4V10H12V8H7.08A12 12 0 1 1 4 16H2A14 14 0 1 0 16 2Z';
const RV_MINUTE = 'M15 7H17V16.414H15Z';
const RV_HOUR = 'M15 16.41L20.59 22L22 20.59L16.41 15Z';
export const RecentlyViewedSpec = /* @__PURE__ */ hoverIcon('RecentlyViewed', {
  geo: ({ h }) => ({
    ring: { d: turnPath(RV_RING, -45 * h) },
    minute: { d: turnPath(RV_MINUTE, -45 * h) },
    hour: { d: RV_HOUR },
  }),
  static: /* @__PURE__ */ carbonArt(RecentlyViewed32),
});

// ── Rotate ────────────────────────────────────────────────────

// Carbon's dashes (band r 11–13, 20° each, 20° apart), all but the one at
// the arc's tail.
const ROTATE_DASHES = [
  'M17.91 26.82L18.26 28.82A12.9 12.9 0 0 0 22.5 27.28L21.5 25.55A10.88 10.88 0 0 1 17.91 26.82Z',
  'M24.42 23.07L26 24.35A13 13 0 0 0 28.24 20.44L26.37 19.76A11 11 0 0 1 24.42 23.07Z',
  'M9.5 27.25A12.9 12.9 0 0 0 13.74 28.79L14.09 26.79A10.88 10.88 0 0 1 10.5 25.49Z',
  'M5.67 19.76L3.8 20.44A13 13 0 0 0 6 24.35L6.32 24.09L7.54 23.09A11 11 0 0 1 5.63 19.78Z',
];
// The dash below the tail (0° → −20°). Its leading end turns with the rest
// until it meets the arc's tail, then holds there: the reference's matte that hides
// dashes under the arc, as geometry.
const TAIL_DASH = {
  trail: [
    [29, 16],
    [27, 16],
  ] as Pt[],
  lead: [
    [28.2, 11.56],
    [26.33, 12.24],
  ] as Pt[],
};
// The arc: Carbon's band (r 13 / 11) from its tail cut round to the arrow's
// corner. The tail turns 30°, the corner (and the arc's joins to it) 45°.
const ARC_TAIL: [Pt, Pt] = [
  [26, 7.65],
  [24.42, 8.93],
];
const ARC_JOIN: [Pt, Pt] = [
  [6, 7.65],
  [6.81, 10],
];
const CORNER: Pt[] = [
  [6, 4],
  [4, 4],
  [4, 12],
  [12, 12],
  [12, 10],
];
// Tail angle (outer) − dash lead angle at rest: how far the lead can turn ahead.
const LEAD_ROOM =
  (Math.atan2(16 - 11.56, 28.2 - 16) - Math.atan2(16 - 7.65, 26 - 16)) *
  (-180 / Math.PI);

export const RotateSpec = /* @__PURE__ */ hoverIcon('Rotate', {
  geo: ({ h }) => {
    const [dash, tail, head] = [-55 * h, -30 * h, -45 * h];
    const lead = -Math.min(55 * h, LEAD_ROOM + 30 * h);
    const t = TAIL_DASH;
    const [to, ti] = ARC_TAIL.map((p) => turn(p, tail));
    const [jo, ji] = ARC_JOIN.map((p) => turn(p, head));
    return {
      dashes: { d: ROTATE_DASHES.map((d) => turnPath(d, dash)).join('') },
      tailDash: {
        d: `M${P(turn(t.trail[0], dash))}A12.85 12.85 0 0 0 ${P(turn(t.lead[0], lead))}L${P(turn(t.lead[1], lead))}A11.18 11.18 0 0 1 ${P(turn(t.trail[1], dash))}Z`,
      },
      arrow: {
        d: `M${P(to)}A13 13 0 0 0 ${P(jo)}${CORNER.map((p) => `L${P(turn(p, head))}`).join('')}L${P(ji)}A11 11 0 0 1 ${P(ti)}Z`,
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(Rotate32),
});

// ── Reply all ───────────────────────────────────────────────────────────────

// Carbon's arrow, absolute, with the tail's arcs as cubics so every point
// and handle can take its own share of the move.
const RA_ARROW =
  'M19 29A.9989 .9989 0 0 1 18.232 28.64L8.232 16.64A1 1 0 0 1 8.232 15.36L18.232 3.36A1 1 0 0 1 20 4V11.0325' +
  'C27.0074 11.4954 31 16.8925 31 26.0002C31 26.4306 30.7246 26.8128 30.3162 26.9489C29.9079 27.085 29.4583 26.9445 29.2 26.6002' +
  'C26.3782 22.8379 23.8088 21.2539 20 21.0286V28A1 1 0 0 1 19 29Z' +
  'M10.3016 16L18 25.238V20A1 1 0 0 1 19 19C22.7213 18.8563 26.3185 20.3516 28.8414 23.0909' +
  'C28.0864 16.5553 24.6587 13 19 13A1 1 0 0 1 18 12V6.7618Z';
const RA_CHEVRON =
  'M11.4639 28.9182L1.2318 16.64A1 1 0 0 1 1.2318 15.36L11.4638 3.0792L13 4.36L3.3016 16L13 27.638Z';
/** How much of the head's move a point at x takes: all of it at the head (x ≤ 20), easing to none at the tail's tip (x = 31). */
const raShare = (x: number) =>
  x <= 20 ? 1 : x >= 31 ? 0 : 0.5 * (1 + Math.cos((Math.PI * (x - 20)) / 11));

export const ReplyAllSpec = /* @__PURE__ */ hoverIcon('ReplyAll', {
  geo: ({ h }) => ({
    arrow: { d: mapPath(RA_ARROW, ([x, y]) => [x - 3 * h * raShare(x), y]) },
    chevron: { d: mapPath(RA_CHEVRON, ([x, y]) => [x - 2 * h, y]) },
  }),
  static: /* @__PURE__ */ carbonArt(ReplyAll32),
});

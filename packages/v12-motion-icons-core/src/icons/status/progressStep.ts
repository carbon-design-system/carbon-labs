/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import CheckmarkOutline32 from '@carbon/icons/es/checkmark--outline/32.js';
import CircleDash32 from '@carbon/icons/es/circle-dash/32.js';
import Incomplete32 from '@carbon/icons/es/incomplete/32.js';
import Warning16 from '@carbon/icons/es/warning/16.js';
import Warning32 from '@carbon/icons/es/warning/32.js';
import {
  carbonArt,
  easeFn,
  stateIcon,
  TOGGLE_IN,
  TOGGLE_OUT,
  type Frame,
  type Playback,
  type Shapes,
  type StateTweenFn,
  type TweenTiming,
} from '../../engine';
import { ENTRANCE, EXIT, STANDARD } from '../../ease';
import {
  polyPath,
  rectPath,
  ringPath,
  scalePts,
  type Pt,
} from '../../geometry';
import { EVENODD, f, lerp, LINE } from '../../paint';
import { motionTokens } from '../../tokens';
import { CUT_SHRINK, cut } from '../controls/playback';
import {
  CHECK_OUTLINE,
  CHECK_PIVOT,
  DRAW_IN,
  DRAW_OUT,
} from '../toggle/checkToggles';
import { bangAt, dot, scaleBang, WARNING_ART, type Bang } from './alerts';
import {
  CIRCLE_DASHES,
  DASH_TURN,
  INCOMPLETE_DASHES,
  type Dash,
} from './carbonInternals';

/**
 * A progress step's state, for Carbon's ProgressIndicator: one icon that
 * follows `value` through Carbon's four step icons.
 *
 *   incomplete  CircleDash          current   Incomplete
 *   complete    CheckmarkOutline    invalid   Warning (the circle with "!")
 *
 * Each state at rest is Carbon's icon exactly, at 16, 20, 24 and 32. The
 * icon is an indicator: it changes only when `value` does (its own clicks
 * never step it), it has no accessible name of its own (the step names it),
 * and it has no hover (the step is the control). Colour is the host's
 * (`currentColor`): Carbon draws the invalid step in `$support-error`.
 *
 * The steps forward run in three phases:
 *
 *  1. Incomplete → current (the spin, moderate-01 160ms, standard ease):
 *     the dashed ring turns 180° clockwise while its dashes retime from
 *     CircleDash's (18° on, 18° off) to Incomplete's (20° on, 20° off),
 *     landing on Incomplete's dashes; with it the left half disc wipes in
 *     clockwise from the bottom, its edge turning with the ring. Dashes that
 *     come round to the bottom slip behind the disc's flat edge.
 *  2. Current → the full disc (the close, fast-02 120ms, exit ease):
 *     the right half wipes in clockwise from the top, over the dashes, while
 *     the whole circle shrinks 2px in radius (14 → 12, the set's 2px
 *     container rule).
 *  3. The full disc → the ring (the open, moderate-01 160ms, entrance ease):
 *     the circle grows back to 14 while the hollow opens from the centre out
 *     to Carbon's ring (r 12). Fast-00 (40ms) in, with the hollow starting
 *     to open, the check (complete) or the "!" (invalid) draws on, on the
 *     standard draw timing (moderate-01, strong ease-out), finishing just
 *     after the grow:
 *     the check from its short arm, the "!" down its bar, then its dot from
 *     the top.
 *
 * Going back a step plays the same phases backwards at the same speed, each
 * ease mirrored (both ends are real states, as Play ⇄ Pause; neither is an
 * "off"): the glyph undraws and the hollow closes after it starts, the right
 * half unwipes to the top as the circle grows, the left half unwipes to the
 * bottom as the ring turns back.
 *
 * Skipping straight between incomplete and complete or invalid keeps the
 * ring's own move: every dash grows from both ends until the gaps are gone
 * (fast-02, entrance) as the glyph draws on (moderate-01, the standard
 * draw); to open it, the gaps open from their middles (fast-01, exit) as the
 * glyph leaves (fast-02). Check ⇄ "!"
 * (complete ⇄ invalid) is Play ⇄ Pause's match cut while the ring holds: the
 * outgoing glyph shrinks (4px off each end of its longest extent) until the
 * cut at 6/15, then the incoming one appears at its own shrunk size and
 * grows to full; 160ms (moderate-01).
 *
 * Every dash keeps its 2px weight throughout. Disabled: Carbon's disabled
 * step draws CircleDash, so the host keeps `value="incomplete"`; nothing
 * moves while the value holds. Under reduced motion a change goes to the new
 * state at once; with motion off each state draws Carbon's art.
 */

export type ProgressStepState =
  | 'incomplete'
  | 'current'
  | 'complete'
  | 'invalid';
const STATES: readonly ProgressStepState[] = [
  'incomplete',
  'current',
  'complete',
  'invalid',
];

/**
 * The frame: `t` the spin and the left half (phase 1), `q` the right half
 * and the shrink (phase 2), `o` the grow and the hollow (phase 3); `j` how
 * far the gaps have closed (skipping between incomplete and complete or
 * invalid); `c`, `w` the check's drawn end and wiped start; `b` how far the
 * "!" has drawn; `k` the check ⇄ "!" cut (0 check, 1 "!").
 */
export type ProgressStepFrame = {
  t: number;
  q: number;
  o: number;
  j: number;
  c: number;
  w: number;
  b: number;
  k: number;
};
export const PROGRESS_STEP_REST: Record<ProgressStepState, ProgressStepFrame> =
  {
    incomplete: { t: 0, q: 0, o: 0, j: 0, c: 0, w: 0, b: 0, k: 0 },
    current: { t: 1, q: 0, o: 0, j: 0, c: 0, w: 0, b: 0, k: 0 },
    complete: { t: 1, q: 1, o: 1, j: 0, c: 1, w: 0, b: 0, k: 0 },
    invalid: { t: 1, q: 1, o: 1, j: 0, c: 0, w: 0, b: 1, k: 1 },
  };

const EPS = 1e-6;
const C: Pt = [16, 16];
const DEG = Math.PI / 180;
/** How far the circle shrinks in radius before it opens (the set's 2px container rule). */
const SHRINK = 2;

// ── The ring ─────────────────────────────────────────────────────────────────

type Pol = { r: number; a: number };
/** A dash as polar corners, outer start, outer end, inner end, inner start (angles in degrees, increasing clockwise). */
type PDash = readonly [Pol, Pol, Pol, Pol];

/** Carbon's corners as polar ones, run clockwise (as carbonInternals' `dash`). */
function polar(corners: Dash): PDash {
  const pol = corners.map(
    ([x, y]): Pol => ({
      r: Math.hypot(x - C[0], y - C[1]),
      a: Math.atan2(y - C[1], x - C[0]) / DEG,
    })
  );
  const a0 = pol[0].a;
  let [o0, o1, i1, i0] = pol.map((q) => ({
    r: q.r,
    a: a0 + ((((q.a - a0 + 180) % 360) + 360) % 360) - 180,
  }));
  if (o1.a < o0.a) {
    [o0, o1, i1, i0] = [o1, o0, i0, i1];
  }
  return [o0, o1, i1, i0];
}
const turned = (d: Dash, deg: number): Dash =>
  d.map(([x, y]) => {
    const [cs, sn] = [Math.cos(deg * DEG), Math.sin(deg * DEG)];
    return [
      C[0] + (x - C[0]) * cs - (y - C[1]) * sn,
      C[1] + (x - C[0]) * sn + (y - C[1]) * cs,
    ] as Pt;
  }) as unknown as Dash;
const spun = (d: PDash, deg: number) =>
  d.map((q) => ({ r: q.r, a: q.a + deg })) as unknown as PDash;

/**
 * CircleDash's ten dashes in clockwise order, from the one that starts at
 * 72° (just right of the bottom), each paired with where it lands about
 * half a turn on. Four land on Incomplete's four dashes; the other six land
 * behind the half disc at Incomplete's pitch, the first and the last on the
 * same place just left of the top (the ten close up into nine there, under
 * the disc).
 */
const RING: readonly { from: PDash; to: PDash }[] = /* @__PURE__ */ (() => {
  const dashes = CIRCLE_DASHES.map(polar);
  const at = (deg: number) =>
    dashes.find((d) => Math.abs(((d[0].a - deg + 540) % 360) - 180) < 5)!;
  const [tr, ru, br, rl] = INCOMPLETE_DASHES; // top right, right (upper), bottom right, right (lower)
  const behind = turned(tr, -DASH_TURN);
  const target = [
    behind,
    tr,
    ru,
    rl,
    br,
    ...[1, 2, 3, 4].map((n) => turned(br, DASH_TURN * n)),
    behind,
  ];
  let prev = -Infinity;
  return target.map((to, m) => {
    let from = at(72 + 36 * m);
    // Unwrap so every dash starts after the one before it and lands about half a turn on.
    while (from[0].a < prev) {
      from = spun(from, 360);
    }
    prev = from[0].a;
    let end = polar(to);
    while (end[0].a - from[0].a < 90) {
      end = spun(end, 360);
    }
    while (end[0].a - from[0].a >= 450) {
      end = spun(end, -360);
    }
    return { from, to: end };
  });
})();

const P = ({ r, a }: Pol) =>
  `${f(C[0] + r * Math.cos(a * DEG))} ${f(C[1] + r * Math.sin(a * DEG))}`;
/** A stretch of the band from one dash's start corners to another's end corners (one dash: its own outline). */
function band(o0: Pol, o1: Pol, i1: Pol, i0: Pol): string {
  const large = o1.a - o0.a > 180 ? 1 : 0;
  const [ro, ri] = [f((o0.r + o1.r) / 2), f((i0.r + i1.r) / 2)];
  return `M${P(o0)}A${ro} ${ro} 0 ${large} 1 ${P(o1)}L${P(i1)}A${ri} ${ri} 0 ${large} 0 ${P(i0)}Z`;
}
/** Whether the angles a0…a1 lie within the `span` degrees clockwise from `from` (half a degree's slack). */
function within(a0: number, a1: number, from: number, span: number): boolean {
  if (span <= EPS) {
    return false;
  }
  let x = (((a0 - from) % 360) + 360) % 360;
  if (x > 359.5) {
    x -= 360;
  }
  return x >= -0.5 && x + (a1 - a0) <= span + 0.5;
}

/**
 * The ring at spin `t` (CircleDash's dashes at 0, Incomplete's half a turn
 * on at 1), shrunk `q` of the way, with every gap closed `j` of the way.
 * Dashes that meet are drawn as one stretch of the band (no seam), and a
 * ring with every gap closed is Carbon's ring. A stretch wholly under the
 * disc (its left half wiped `t` of the way from the bottom, its right `q`
 * of the way from the top) is left out: a second edge on the disc's would
 * darken it.
 */
export function ringD(t: number, q: number, j: number): string {
  const shrink = SHRINK * q;
  const ds = RING.map(
    ({ from, to }) =>
      from.map((p, i) => ({
        r: lerp(p.r, to[i].r, t) - shrink,
        a: lerp(p.a, to[i].a, t),
      })) as unknown as PDash
  );
  const n = ds.length;
  // Each gap (after dash i): its outer and inner widths and how far it has closed.
  const gaps = ds.map((d, i) => {
    const next = ds[(i + 1) % n];
    const turn = i === n - 1 ? 360 : 0;
    const go = next[0].a + turn - d[1].a;
    const gi = next[3].a + turn - d[2].a;
    // Overlapping dashes have no gap to close: they meet.
    const closed = go <= EPS || gi <= EPS || j >= 1 - EPS;
    return {
      o: (Math.max(go, 0) * j) / 2,
      i: (Math.max(gi, 0) * j) / 2,
      closed,
    };
  });
  if (gaps.every((g) => g.closed)) {
    return ringPath(C, 13 - shrink, 2);
  }
  // Walk from the first open gap: each run of dashes joined by closed gaps is one stretch.
  const start = (gaps.findIndex((g) => !g.closed) + 1) % n;
  let d = '';
  for (let m = 0; m < n; ) {
    const first = (start + m) % n;
    let last = first;
    let span = 0;
    while (gaps[last].closed && span < n - 1) {
      last = (last + 1) % n;
      span++;
    }
    m += span + 1;
    const before = gaps[(first + n - 1) % n];
    const after = gaps[last];
    const wrap = last < first ? 360 : 0;
    const o0 = { r: ds[first][0].r, a: ds[first][0].a - before.o };
    const i0 = { r: ds[first][3].r, a: ds[first][3].a - before.i };
    const o1 = { r: ds[last][1].r, a: ds[last][1].a + wrap + after.o };
    const i1 = { r: ds[last][2].r, a: ds[last][2].a + wrap + after.i };
    const [a0, a1] = [Math.min(o0.a, i0.a), Math.max(o1.a, i1.a)];
    if (within(a0, a1, 90, 180 * t) || within(a0, a1, 270, 180 * q)) {
      continue;
    }
    d += band(o0, o1, i1, i0);
  }
  return d;
}

// ── The disc ─────────────────────────────────────────────────────────────────

const HALF_D = 'M16 30V2A14 14 0 0 0 16 30Z'; // Carbon's half disc
const sector = (r: number, from: number, span: number) =>
  `M16 16L${P({ r, a: from })}A${f(r)} ${f(r)} 0 ${span > 180 ? 1 : 0} 1 ${P({ r, a: from + span })}Z`;
const circle = (r: number) =>
  `M${f(16 - r)} 16A${f(r)} ${f(r)} 0 1 0 ${f(16 + r)} 16A${f(r)} ${f(r)} 0 1 0 ${f(16 - r)} 16Z`;

/**
 * The disc: its left half wiped `t` of the way clockwise from the bottom,
 * its right `q` of the way from the top, its radius shrunk `q` of the way
 * and grown back `o`, and its hollow opened `o` of the way out to Carbon's
 * ring. Fully open, it is the ring (drawn as the ring).
 */
function discD(t: number, q: number, o: number): string {
  if (o >= 1 - EPS) {
    return '';
  }
  if (t >= 1 - EPS && q <= EPS && o <= EPS) {
    return HALF_D;
  }
  const r = 14 - SHRINK * q + SHRINK * o;
  if (t >= 1 - EPS && q >= 1 - EPS) {
    return circle(r) + (o > EPS ? circle(12 * o) : '');
  }
  return (
    (t > EPS ? sector(r, 90, 180 * t) : '') +
    (q > EPS ? sector(r, 270, 180 * q) : '')
  );
}

// ── The glyphs ───────────────────────────────────────────────────────────────

/** A glyph's size at the cut: 4px (CUT_SHRINK) off each end of its longest extent, as Play ⇄ Pause's bars. */
const atCut = (extent: number) => (extent - 2 * CUT_SHRINK) / extent;
export const CHECK_SMALL = /* @__PURE__ */ atCut(
  CHECK_OUTLINE[2][0] - CHECK_OUTLINE[0][0]
);
const bangArt = (size?: number): Bang =>
  (WARNING_ART[size ?? 32] ?? WARNING_ART[32]).glyph[0];
/** The "!"'s size at the cut, per size (Carbon draws a shorter one at 16px). */
export const bangSmall = (size?: number) => {
  const [, , y0, , cy, r] = bangArt(size);
  return atCut(cy + r - y0);
};

/** The dot of radius `r` at (16, cy), drawn from its top down to `y`. */
function dotTo(cy: number, r: number, y: number): string {
  if (y >= cy + r - EPS) {
    return dot([16, cy], r);
  }
  if (y <= cy - r + EPS) {
    return '';
  }
  const dy = y - cy;
  const w = Math.sqrt(r * r - dy * dy);
  return `M${f(16 - w)} ${f(y)}A${f(r)} ${f(r)} 0 ${dy > 0 ? 1 : 0} 1 ${f(16 + w)} ${f(y)}Z`;
}
/** The "!" drawn `b` of the way: down its bar from the top, then its dot from the top. */
function bangDrawn(g: Bang, b: number): string {
  if (b >= 1 - EPS) {
    return bangAt(g, 0);
  }
  const [x0, x1, y0, y1, cy, r] = g;
  const y = lerp(y0, cy + r, b);
  return rectPath(x0, y0, x1, Math.min(y, y1)) + dotTo(cy, r, y);
}

/** The geometry for a frame. No hover: `h` is unused. */
export function progressStepShapes(
  fr: Partial<ProgressStepFrame>,
  size?: number
): Shapes {
  const { t = 0, q = 0, o = 0, j = 0, c = 0, w = 0, b = 0, k = 0 } = fr;
  const swap = cut(k);
  const drawn = Math.max(c - w, 0);
  const check =
    drawn > EPS && !swap.second
      ? polyPath(
          scalePts(CHECK_OUTLINE, CHECK_PIVOT, lerp(1, CHECK_SMALL, swap.small))
        )
      : '';
  const bang =
    b > EPS && swap.second
      ? bangDrawn(
          scaleBang(bangArt(size), lerp(1, bangSmall(size), swap.small)),
          b
        )
      : '';
  return {
    ring: { d: o >= 1 - EPS ? ringPath(C, 13, 2) : ringD(t, q, j) },
    fill: { d: discD(t, q, o), ...EVENODD },
    // The visible stretch of the check, from `w` to `c` along it (pathLength 1).
    check: {
      d: check,
      ...LINE,
      strokeLinejoin: 'miter',
      pathLength: 1,
      strokeDasharray: `${f(drawn)} 2`,
      strokeDashoffset: -w || 0,
    },
    bang: { d: bang },
  };
}

// ── Changes ──────────────────────────────────────────────────────────────────

const OUT: TweenTiming = TOGGLE_OUT;
/** The ring skipping a step: closing up and opening, each one token quicker than a toggle (the glyphs keep their own). */
const RING_IN: TweenTiming = {
  duration: motionTokens.duration.fast02 / 1000,
  ease: ENTRANCE,
};
const RING_OUT: TweenTiming = {
  duration: motionTokens.duration.fast01 / 1000,
  ease: EXIT,
};
/** The match cut: linear progress, the cut applying its own two eases (Play ⇄ Pause). */
const CUT: TweenTiming = { duration: TOGGLE_IN.duration, ease: 'linear' };
const { moderate01, fast02, fast00 } = motionTokens.duration;
/** The three phases forward, by key: the spin (t), the close (q) and the open (o). */
const PHASES = {
  t: { duration: moderate01 / 1000, ease: STANDARD },
  q: { duration: fast02 / 1000, ease: EXIT },
  o: { duration: moderate01 / 1000, ease: ENTRANCE },
} as const;
/** The glyph starts to draw this long into the open (the hollow starting to open), and may finish after it. */
const DRAW_AT = fast00 / 1000;
/** The open's whole span, the glyph's draw included (played backwards, the glyph undraws first). */
const OPEN_SPAN = Math.max(PHASES.o.duration, DRAW_AT + DRAW_IN.duration);

/** `tw` played backwards: the same curve, from its end. */
function backwards(tw: TweenTiming): TweenTiming {
  const e = easeFn(tw.ease as Parameters<typeof easeFn>[0]);
  return { duration: tw.duration, ease: (x: number) => 1 - e(1 - x) };
}
/** `tw`, starting `delay` seconds from now (held at its start until then). */
function after(delay: number, tw: TweenTiming): TweenTiming {
  if (delay <= 0) {
    return tw;
  }
  const total = delay + tw.duration;
  const e = easeFn(tw.ease as Parameters<typeof easeFn>[0]);
  const r = delay / total;
  return {
    duration: total,
    ease: (x: number) => (x <= r ? 0 : e((x - r) / (1 - r))),
  };
}

function change(
  _prev: ProgressStepState,
  next: ProgressStepState,
  fr: Frame,
  tween: StateTweenFn,
  repaint: () => void
): Playback[] {
  const T = PROGRESS_STEP_REST[next];
  const runs: Playback[] = [];
  // When every part has landed, the numbers settle on the state's rest (the same drawing).
  let left = 0;
  const settle = () => {
    if (--left > 0) {
      return;
    }
    Object.assign(fr, T);
    repaint();
  };
  const run = (key: keyof ProgressStepFrame, to: number, tw: TweenTiming) => {
    left++;
    runs.push(tween(key, to, tw, settle));
  };

  // The ring. Skipping between incomplete and complete or invalid, the dashes close up or open (a closed ring
  // is the same drawing either way); otherwise the phases run in turn, backwards first.
  const closed = fr.o >= 1 - EPS || fr.j >= 1 - EPS;
  const glyphState = next === 'complete' || next === 'invalid';
  const atStart = fr.t <= EPS && fr.q <= EPS && fr.o <= EPS;
  if (next === 'incomplete' && closed) {
    Object.assign(fr, { t: 0, q: 0, o: 0, j: 1 });
  }
  const skip =
    (next === 'incomplete' && fr.j > EPS && atStart) || (glyphState && atStart);
  let opensAt = -1; // when the hollow starts to open (the glyph draws in after it starts)
  let closes = false; // whether the hollow closes (the glyph undraws with it)
  if (skip) {
    const to = glyphState ? 1 : 0;
    if (Math.abs(fr.j - to) > EPS) {
      run('j', to, to ? RING_IN : RING_OUT);
    }
  } else {
    if (fr.j > EPS) {
      run('j', 0, RING_OUT);
    }
    let at = 0;
    for (const key of ['o', 'q', 't'] as const) {
      if (fr[key] <= T[key] + EPS) {
        continue;
      }
      const span = key === 'o' ? OPEN_SPAN : PHASES[key].duration;
      if (key === 'o') {
        closes = true;
      }
      run(
        key,
        T[key],
        after(at + span - PHASES[key].duration, backwards(PHASES[key]))
      );
      at += span;
    }
    for (const key of ['t', 'q', 'o'] as const) {
      if (fr[key] >= T[key] - EPS) {
        continue;
      }
      if (key === 'o') {
        opensAt = at;
      }
      run(key, T[key], after(at, PHASES[key]));
      at += PHASES[key].duration;
    }
  }

  // The glyphs.
  const swap = cut(fr.k);
  const checkOn = fr.c - fr.w > EPS && !swap.second;
  const bangOn = fr.b > EPS && swap.second;
  const want =
    next === 'complete' ? 'check' : next === 'invalid' ? 'bang' : 'none';
  const drawAt = opensAt >= 0 ? opensAt + DRAW_AT : 0;

  // Check ⇄ "!": the match cut.
  const cutTo = (checkOn && want === 'bang') || (bangOn && want === 'check');
  if (cutTo) {
    if (want === 'bang') {
      fr.b = 1;
    } else {
      [fr.c, fr.w] = [1, 0];
    }
    run('k', want === 'bang' ? 1 : 0, CUT);
  } else {
    // Out: as the hollow closes, the glyph undraws (its draw backwards); otherwise the check wipes from its
    // start and the "!" undraws, one token faster.
    if (checkOn && want !== 'check') {
      if (closes) {
        run('c', fr.w, backwards(DRAW_IN));
      } else {
        run('w', fr.c, DRAW_OUT);
      }
    }
    if (bangOn && want !== 'bang') {
      run('b', 0, closes ? backwards(DRAW_IN) : OUT);
    }
  }
  // In: the wanted glyph, drawing on as the hollow opens (or with the ring, skipping).
  if (want === 'check' && !cutTo) {
    if (checkOn) {
      if (fr.w > EPS) {
        run('w', 0, DRAW_IN);
      } else if (fr.c < 1 - EPS) {
        run('c', 1, after(drawAt, DRAW_IN));
      }
      if (fr.k > EPS) {
        run('k', 0, CUT);
      }
    } else {
      [fr.c, fr.w, fr.k] = [0, 0, 0];
      run('c', 1, after(drawAt, DRAW_IN));
    }
  } else if (want === 'bang' && !cutTo) {
    if (!bangOn) {
      [fr.b, fr.k] = [0, 1];
    }
    if (fr.b < 1 - EPS) {
      run('b', 1, after(bangOn ? 0 : drawAt, DRAW_IN));
    }
    if (fr.k < 1 - EPS) {
      run('k', 1, CUT);
    }
  }
  if (!runs.length) {
    Object.assign(fr, T);
    repaint();
  }
  return runs;
}

const CCircleDash = /* @__PURE__ */ carbonArt(CircleDash32);
const CIncomplete = /* @__PURE__ */ carbonArt(Incomplete32);
const CCheckmarkOutline = /* @__PURE__ */ carbonArt(CheckmarkOutline32);
const CWarning = /* @__PURE__ */ carbonArt(Warning16, Warning32);

/**
 * A progress step's state: `incomplete` (CircleDash), `current`
 * (Incomplete), `complete` (CheckmarkOutline) or `invalid` (Warning), set by
 * `value`. An indicator: it has no accessible name of its own and its clicks
 * don't change it.
 */
export const ProgressStepSpec = /* @__PURE__ */ stateIcon<ProgressStepState>(
  'ProgressStep',
  {
    states: STATES,
    statics: {
      incomplete: CCircleDash,
      current: CIncomplete,
      complete: CCheckmarkOutline,
      invalid: CWarning,
    },
    rest: (s) => ({ ...PROGRESS_STEP_REST[s] }),
    geo: (fr, size) =>
      progressStepShapes(fr as Partial<ProgressStepFrame>, size),
    change,
    indicator: true,
  }
);

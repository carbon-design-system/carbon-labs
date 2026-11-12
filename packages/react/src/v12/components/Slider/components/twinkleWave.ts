/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  bezierEase,
  easedStaggerAt,
  motionTokens,
  type CubicBezier,
} from '@carbon-labs/v12-motion';

/* ============================================================================
 * The AI dots' presence and shimmer, on top of the dot field (carbon-motion).
 * ============================================================================
 *
 *   presence  the special step's dots come and go; the field holds the state
 *             at once and this draws the change:
 *             - in: from the knob toward the track's start, each dot growing
 *               and fading in on the entrance curve over `IN_DOT`, its start
 *               along an `IN_SWEEP` from the knob to the track's start,
 *               softly dithered, with no overshoot
 *             - out: from the track's start to the knob, each dot shrinking
 *               and fading on the exit curve over `OUT_DOT`, its start along
 *               an `OUT_SWEEP` on the entrance curve, so the front sets off
 *               at once and slows through the full dots near the knob; the
 *               field then lets go
 *             A change mid-way starts each dot from where it is. The track's
 *             start is its left; right to left, its right (`start`).
 *   shimmer   while they are there, every dot swells and brightens, then
 *             shrinks and dims, on top of the field's own twinkle: three slow
 *             sines of its own (`PERIODS`, each ±15% by dot), phases hashed
 *             from its place, so neighbours are unrelated and no front can be
 *             followed
 *   reduced   the dots come and go at once and hold still
 *
 * How, without editing carbon-motion: the field starts each frame with
 * `clearRect` and draws each dot with `arc` after setting `globalAlpha`, so a
 * wrapper on the canvas context reads the clock once a frame in `clearRect`
 * and scales each dot's radius and alpha in `arc`. The field's loop draws the
 * frames: its twinkle while the dots are there and on screen, and `wake` for
 * a presence change.
 * ========================================================================== */

/* ── shimmer ── */

/** Each component's period, ms (× the time scale), and its weight (their squares sum to 1). */
const PERIODS = [2400, 3700, 5300] as const;
const WEIGHTS = [0.8, 0.5, 0.33] as const;
/** Each dot's periods vary by this much either way. */
const PERIOD_SPREAD = 0.15;
/** Each dot's depth: its swing is this share of the full one, at the least (up to 1), from its place on the lattice. */
const MIN_DEPTH = 0.5;
/** On the crest, at full depth, a dot is this much larger and brighter (its opacity capped at full, so a dot the dissolve has faded far out stays in proportion). */
const GROW = 0.35;
const BRIGHTEN = 0.6;
/** In the trough, at full depth, a dot is this much smaller and fainter. */
const SHRINK = 0.45;
const FADE = 0.55;
/** No dot is drawn larger than the field's own twinkle (× its rest radius), so a sparkle on a crest doesn't touch its neighbors. */
const MAX_SCALE = 1.7;
/** The dot's rest radius, as a share of the lattice pitch (the field's). */
const REST_SHARE = 0.225;
/** The shimmer starts once the dots are in and eases in over RISE_MS. */
const DELAY_MS = 600;
const RISE_MS = 1200;

/* ── presence ── */

export const IN_EASE: CubicBezier = motionTokens.easing['entrance-productive'];
export const OUT_EASE: CubicBezier = motionTokens.easing['exit-productive'];
/** Each dot's own time to come in, and the sweep from the knob to the track's start, ms (× the time scale). */
export const IN_DOT = motionTokens.duration['slow-01'];
export const IN_SWEEP = motionTokens.duration['slow-01'];
/** Each dot's own time to go, and the sweep from the track's start to the knob. */
export const OUT_DOT = motionTokens.duration['moderate-03'];
export const OUT_SWEEP = motionTokens.duration['slow-01'];
/** A dot's start is dithered by up to this share of the sweep, either way, so the front is soft. */
export const DITHER = 0.08;

const hash = (a: number, b: number) => {
  const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
  return v - Math.floor(v);
};

/** A dot's shimmer at `t` ms (time-scaled), −1 trough to +1 crest, before its depth: three sines
 *  of its own periods and phases, so no front crosses the texture. */
export function shimmerAt(col: number, row: number, t: number): number {
  let s = 0;
  for (let k = 0; k < PERIODS.length; k++) {
    const spread =
      PERIOD_SPREAD * (2 * hash(col + 31.7 * k, row - 17.3 * k) - 1);
    const phase = hash(row + 7.1 * k, col + 53.9 * k);
    s +=
      WEIGHTS[k]! *
      Math.sin(2 * Math.PI * (t / (PERIODS[k]! * (1 + spread)) + phase));
  }
  return Math.max(-1, Math.min(1, s));
}

/** One presence change: in (`on`) or out, from `t0`, over the track from its start to `x` (the knob's center). */
export interface PresencePhase {
  on: boolean;
  t0: number;
  x: number;
  ts: number;
  /** The track's start, px from its left: 0, or right to left its width (the fill is then the knob's right). */
  start?: number;
  /** The change before it, while this one is under way: each dot starts from where that one had it. */
  prev: PresencePhase | null;
}

/** A sweep's start, ms, at `p` (0–1) of the way along it, as a table (the curve's inverse costs 40 steps). */
const sweepTable = (total: number, ease: CubicBezier) =>
  Array.from({ length: 65 }, (_, i) => easedStaggerAt(i / 64, total, ease));
const IN_TABLE = sweepTable(IN_SWEEP, IN_EASE);
// Out, the front sets off at once too: through the faint dots far from the knob quickly, slowing
// through the full ones near it (on the exit curve it stood still for its first 350ms).
const OUT_TABLE = sweepTable(OUT_SWEEP, IN_EASE);
const lookup = (table: number[], p: number) => {
  const f = Math.min(1, Math.max(0, p)) * 64;
  const i = Math.min(63, Math.floor(f));
  return table[i]! + (table[i + 1]! - table[i]!) * (f - i);
};
const inEase = bezierEase(IN_EASE);
const outEase = bezierEase(OUT_EASE);

/** A change's length, ms, from its start to the last dot settled. */
export const phaseLength = (p: Pick<PresencePhase, 'on' | 'ts'>) =>
  (p.on
    ? IN_SWEEP * (1 + DITHER) + IN_DOT
    : OUT_SWEEP * (1 + DITHER) + OUT_DOT) * p.ts;

/** When the dot at `bx` (lattice spot `col`, `row`) starts its change, ms after the change starts. */
export function presenceDelay(
  p: PresencePhase,
  bx: number,
  col: number,
  row: number
): number {
  const edge = p.start ?? 0;
  const span = Math.max(1, Math.abs(p.x - edge));
  // Which way the knob is from the track's start: rightward, or right to left leftward.
  const way = edge <= p.x ? 1 : -1;
  // In: from the knob toward the track's start (those under or past it first). Out: from the start to the knob.
  const along = (way * (p.on ? p.x - bx : bx - edge)) / span;
  const start = lookup(p.on ? IN_TABLE : OUT_TABLE, along);
  const sweep = p.on ? IN_SWEEP : OUT_SWEEP;
  return (
    Math.max(0, start + (hash(col, row + 101) - 0.5) * 2 * DITHER * sweep) *
    p.ts
  );
}

/** A dot's presence at `t`: 0 (gone) to 1 (there). */
export function presenceAt(
  p: PresencePhase,
  bx: number,
  col: number,
  row: number,
  t: number
): number {
  const from = p.prev ? presenceAt(p.prev, bx, col, row, p.t0) : p.on ? 0 : 1;
  const to = p.on ? 1 : 0;
  if (from === to) {
    return to;
  }
  const dur = (p.on ? IN_DOT : OUT_DOT) * p.ts;
  const e = (t - p.t0 - presenceDelay(p, bx, col, row)) / dur;
  if (e <= 0) {
    return from;
  }
  if (e >= 1) {
    return to;
  }
  return from + (to - from) * (p.on ? inEase(e) : outEase(e));
}

export interface TwinkleWaveOptions {
  /** Since when the dots are there (`performance.now()` ms); null while the shimmer is off. */
  source: () => { since: number } | null;
  timeScale: () => number;
  /** Whether the track runs right to left: its start is then the canvas's right edge. */
  rtl?: () => boolean;
}

export interface TwinkleWave {
  /** The dots come in (`on`) or go, over the track from its start to `x` (the knob's center, px), from now;
   *  `instant`: at once. Returns the change's length, ms. */
  present(on: boolean, x: number, instant?: boolean): number;
  /** Puts the canvas's context back. */
  undo(): void;
}

/** Wraps the canvas's 2D context so the dot field's dots come and go, and shimmer, as above. */
export function attachTwinkleWave(
  canvas: HTMLCanvasElement,
  o: TwinkleWaveOptions
): TwinkleWave {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { present: () => 0, undo: () => {} };
  }
  const arc = ctx.arc;
  const clearRect = ctx.clearRect;

  // Read once a frame (in `clearRect`).
  let gain = 0;
  let clock = 0;
  let now = 0;
  // The lattice (as the field lays it out), so each dot keeps its own shimmer as it moves.
  let pitch = 4;
  let gridX = 0;
  // The change under way; null once the dots are simply there.
  let phase: PresencePhase | null = null;

  // The canvas's size, read when it changes (not every frame).
  const measure = () => {
    const w = canvas.offsetWidth;
    pitch = canvas.offsetHeight <= 16 ? 3 : 4;
    gridX = (w - Math.floor(w / pitch) * pitch) / 2;
  };
  measure();
  const sized =
    typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
  sized?.observe(canvas);

  ctx.clearRect = (...args) => {
    now = performance.now();
    const ts = o.timeScale();
    if (!sized) {
      measure();
    }
    // A finished change lets go of the ones before it; a finished entrance is simply there.
    for (let p = phase; p; p = p.prev) {
      if (now - p.t0 >= phaseLength(p)) {
        p.prev = null;
        if (p === phase && p.on) {
          phase = null;
        }
        break;
      }
    }
    const s = o.source();
    gain = 0;
    if (s) {
      const elapsed = now - s.since - DELAY_MS * ts;
      if (elapsed > 0) {
        const r = Math.min(1, elapsed / (RISE_MS * ts));
        gain = r * r * (3 - 2 * r);
        clock = (now - s.since) / ts;
      }
    }
    clearRect.apply(ctx, args);
  };

  ctx.arc = (x, y, r, ...rest) => {
    if (gain > 0 || phase) {
      const col = Math.round((x - gridX) / pitch);
      const row = Math.round(y / pitch);
      const a = ctx.globalAlpha;
      let alpha = a;
      if (gain > 0) {
        const swing =
          gain *
          shimmerAt(col, row, clock) *
          (MIN_DEPTH + (1 - MIN_DEPTH) * hash(row, col));
        if (swing > 0) {
          r = Math.min(
            r * (1 + GROW * swing),
            Math.max(r, pitch * REST_SHARE * MAX_SCALE)
          );
          alpha = Math.min(1, a * (1 + BRIGHTEN * swing));
        } else {
          r *= 1 + SHRINK * swing;
          alpha = a * (1 + FADE * swing);
        }
      }
      if (phase) {
        const v = presenceAt(phase, x, col, row, now);
        r *= v;
        alpha *= v;
      }
      ctx.globalAlpha = alpha;
    }
    arc.call(ctx, x, y, Math.max(0, r), ...rest);
  };

  return {
    present(on, x, instant = false) {
      if (instant) {
        phase = null;
        return 0;
      }
      phase = {
        on,
        t0: performance.now(),
        x,
        ts: o.timeScale(),
        start: o.rtl?.() ? canvas.offsetWidth : 0,
        prev: phase,
      };
      // At most a few changes back (a quick back-and-forth); older ones have long settled.
      let depth = 0;
      for (let p: PresencePhase | null = phase; p; p = p.prev) {
        if (++depth >= 4) {
          p.prev = null;
        }
      }
      return phaseLength(phase);
    },
    undo() {
      sized?.disconnect();
      ctx.arc = arc;
      ctx.clearRect = clearRect;
    },
  };
}

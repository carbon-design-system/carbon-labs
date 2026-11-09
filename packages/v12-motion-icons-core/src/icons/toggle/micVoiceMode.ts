/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Microphone32 from '@carbon/icons/es/microphone/32.js';
import VoiceMode32 from '@carbon/icons/es/voice-mode/32.js';
import {
  carbonArt,
  defineLoop,
  toggleIcon,
  type Shapes,
  type ToggleFrameIn,
} from '../../engine';
import type { Seg } from '../../cut';
import { cubicBezier, ENTRANCE, EXIT, STANDARD } from '../../ease';
import { rectPath, roundedRectPath } from '../../geometry';
import { arcSeg, cutBase } from '../../off';
import { EVENODD, lerp } from '../../paint';
import { motionTokens } from '../../tokens';
import { MIC_ART } from './micOffArt';

// ── Microphone ⇄ voice mode: dictation listening ────────────────────────────
//
// The Chat shell's prompt bar dictates: a click turns Carbon's microphone
// into voice-mode's five bars, which loop while it listens. The change
// follows the reference (32 × 32,
// 100fps: a frame is 10ms), frame for frame, on Carbon's own drawings. The
// times below are the reference's (its 24 frames, 240ms); the change plays
// them over moderate-02 (220ms), so each is 11/12 as long.
//
// Off → listening, moderate-02 (the reference's frames 0–24), p linear:
//  - The base (0–80ms, the exit easing): both ends trim in to a 2px stub at
//    the middle, which is gone at 90ms.
//  - The holder (0–110ms, the exit easing): trims from both top ends down and
//    round to its bottom, where the stem joins.
//  - The pill (0–80ms, the reference's own curve, cubic-bezier(0.4, 0.14,
//    0.833, 0.833)): its top drops 10px onto its bottom, shortening the
//    capsule to a 2px ring of radius 4 (centreline) about (16, 17); then
//    (80–110ms, linear) the ring shrinks to radius 1, a solid dot, its centre
//    sinking to (16, 18). Gone at 120ms.
//  - The stem (80–110ms, linear): shortens from its foot up to its top while
//    what is left of the stand rises 3px, so the holder's ends and the stem
//    vanish together at (16, 22) at 110ms.
//  - The bars (from 120ms): each appears as a 2px square and grows to
//    voice-mode's height over 80ms (the standard easing), the centre one on
//    the icon's centre; the inner pair 20ms later from 2px either side of the
//    centre, the outer pair 40ms later from 4px either side, each sliding out
//    to its place as it grows (the entrance easing): centre 120–200ms, inner
//    140–220ms, outer 160–240ms. The reference's bars end shorter (20, 12 and
//    6 tall against voice-mode's 26, 20 and 10); here they grow to
//    voice-mode's, so listening rests on Carbon's art. The side pairs come
//    out bowed outward, as sound waves round the centre, and flatten as they
//    land: sagitta 3px (inner) and 4px (outer) to start,
//    flattening linearly to straight as each lands (capped at an arc of ±80°
//    while a bar is short: peaks of about 2.25px and 2.5px at 32px). The reference holds
//    still after its frame 24: it has no loop.
//  - Once the bars land the loop's weight eases in over 400ms (slow-01): each bar's
//    ends dip 4px (2px at 16px) toward its middle and back, a ripple out from
//    the centre bar (each step out a sixth of a cycle behind), 1200ms a
//    cycle: calmer than speech, as unhurried as a slow breath.
// Listening → off plays the same backwards in 160ms (moderate-01, one token
// faster): the bars close and gather to the centre, the dot swells to the
// ring and the capsule grows back up as the stand draws back out from (16,
// 22). The loop's weight goes in 120ms (fast-02). Off hovers as Microphone (the stand
// and pill leave from the hover's pose); listening holds still on hover.
//
// A future live level (0–1) would drive each bar's dip: quiet bars low, loud
// ones at voice-mode's height.

const CMicrophone = /* @__PURE__ */ carbonArt(Microphone32);
const CVoiceMode = /* @__PURE__ */ carbonArt(VoiceMode32);
/**
 * The eases: Carbon's productive exit, standard and entrance (EXIT, STANDARD, ENTRANCE; icons use the
 * productive eases, though the reference's handles are within 0.04 of the expressive ones), and the
 * pill's own, the reference's.
 */
const PILL_EASE = /* @__PURE__ */ cubicBezier(0.4, 0.14, 0.833, 0.833);

/** The change: moderate-02 in (the reference's 24 frames), moderate-01 back. */
const IN = motionTokens.duration.moderate02 / 1000;
const OUT = motionTokens.duration.moderate01 / 1000;
/** The loop's weight eases in over 400ms (slow-01) once the bars have landed. */
const LOOP_RAMP = motionTokens.duration.slow01 / 1000;
/** The reference's 24 frames (10ms each at 100fps), spread over the change's moderate-02. */
const FRAMES = 24;
/** Frame 12: the pill is gone and the bars begin. */
const CUT = 12 / FRAMES;

const clamp01 = (u: number) => Math.min(1, Math.max(0, u));
/** How far frame f is from a to b (0–1). */
const span = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));

// ── The microphone ───────────────────────────────────────────────────────────

const lenOf = (path: readonly Seg[]) =>
  path.reduce(
    (n, s) =>
      n +
      (s.k === 'L'
        ? Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1])
        : s.r * Math.abs(s.t1 - s.t0)),
    0
  );

/** `path` with its first `d` units trimmed away. */
function trimmed(path: readonly Seg[], d: number): Seg[] {
  const out: Seg[] = [];
  for (const s of path) {
    const len = lenOf([s]);
    if (d >= len - 1e-9) {
      d -= len;
      continue;
    }
    const u = Math.max(0, d) / len;
    d = 0;
    out.push(
      s.k === 'L'
        ? {
            k: 'L',
            a: [lerp(s.a[0], s.b[0], u), lerp(s.a[1], s.b[1], u)],
            b: s.b,
          }
        : { ...s, t0: lerp(s.t0, s.t1, u) }
    );
  }
  return out;
}

/**
 * The stand at hover h (as micOffArt draws it: it lifts 2px, its base widens
 * 1px a side) at frame f: the holder trimmed from both top ends toward its
 * bottom, the base trimmed in from both ends, the stem shortening from its
 * foot, and from frame 8 all of it rising 3px.
 */
function standD(h: number, f: number): string {
  const rise = 3 * span(f, 8, 11);
  const [top, y] = [14 - 2 * h - rise, 17 - 2 * h - rise];
  const halves: Seg[][] = [
    [{ k: 'L', a: [8, top], b: [8, y] }, arcSeg([16, y], 8, 180, 90)],
    [{ k: 'L', a: [24, top], b: [24, y] }, arcSeg([16, y], 8, 0, 90)],
  ];
  const holder = EXIT(span(f, 0, 11)) * lenOf(halves[0]);
  const paths = halves.map((p) => trimmed(p, holder));
  const stem = (4 + 2 * h) * (1 - span(f, 8, 11));
  if (stem > 1e-6) {
    paths.push([{ k: 'L', a: [16, y + 8], b: [16, y + 8 + stem] }]);
  }
  if (f < 9) {
    const end = lerp(5 + h, 1, EXIT(span(f, 0, 8)));
    paths.push([
      { k: 'L', a: [16 - end, 29 - rise], b: [16 + end, 29 - rise] },
    ]);
  }
  return cutBase(
    paths.filter((p) => p.length),
    MIC_ART.slash,
    0
  ).fill;
}

/** The pill: a 2px stadium about (16, cy), its centreline w either side and v above and below (round ends), as one even-odd path. */
function pillD(w: number, v: number, cy: number): string {
  const r = Math.min(w, v);
  const outer = roundedRectPath(
    16 - w - 1,
    cy - v - 1,
    16 + w + 1,
    cy + v + 1,
    r + 1
  );
  return r > 1
    ? outer +
        roundedRectPath(16 - w + 1, cy - v + 1, 16 + w - 1, cy + v - 1, r - 1)
    : outer;
}

/**
 * The pill at hover h (Microphone's: its top rises 1px, its bottom 2px) at
 * frame f: its top drops onto its bottom (to a ring of radius 4), then the
 * ring shrinks to a dot of radius 1, its centre sinking 1px. Carbon's capsule
 * at f 0, h 0.
 */
function pillAt(h: number, f: number): string {
  const bottom = 21 - 2 * h;
  if (f <= 8) {
    const v = lerp(9 - h / 2, 4, PILL_EASE(span(f, 0, 8)));
    return pillD(4, v, bottom - v);
  }
  const u = span(f, 8, 11);
  const r = lerp(4, 1, u);
  return pillD(r, r, bottom - 4 + u);
}

// ── The bars ─────────────────────────────────────────────────────────────────

/** voice-mode's bars: centre x and half-height, all centred on y 16. */
const VOICE: readonly (readonly [number, number])[] = [
  [4, 5],
  [10, 10],
  [16, 13],
  [22, 10],
  [28, 5],
];
/** At the loop's quietest a bar's ends dip this far toward its middle (2px at 16px). */
const DIP = 4;
/** The ripple: each bar out from the centre lags it by this share of the cycle. */
const RIPPLE = 1 / 6;
/** 1200ms a cycle. */
const CYCLE = 1.2;

/**
 * How far each pair bows as it comes out, as curves that flatten to their
 * final position: the sagitta its centreline starts from, by steps
 * out from the centre (the centre bar grows straight). It flattens linearly
 * over the bar's 80ms, straight as it lands, and never curls past an arc of
 * ±80° (the sagitta at most tan 40° of the bar's half-height), so a bar just
 * out of its square bows with it: the inner pair peaks near 2.25px, the outer
 * near 2.5px (at 32px; half that at 16).
 */
const BOW = [0, 3, 4];
const MAX_BOW = Math.tan((40 * Math.PI) / 180);

const f3 = (n: number) => +n.toFixed(3);

/**
 * A bar 2px wide about centre x cx, its centreline v either side of y 16,
 * bowed outward (away from the centre, on side `out`, ±1) by sagitta s: its
 * middle at cx, its ends drawn back toward the centre by s, an arc of
 * constant 2px with radial ends. At s 0 it is the straight bar.
 */
function barD(cx: number, v: number, out: number, s: number): string {
  if (s < 1e-4 || v < 1e-4) {
    return rectPath(cx - 1, 16 - v, cx + 1, 16 + v);
  }
  const bow = 2 * Math.atan(s / v);
  const R = v / Math.sin(bow);
  const c = cx - out * R;
  const at = (r: number, a: number) =>
    `${f3(c + out * r * Math.cos(a))} ${f3(16 + r * Math.sin(a))}`;
  const [ro, ri] = [R + 1, R - 1];
  const sweep = out > 0 ? 1 : 0;
  return `M${at(ro, -bow)}A${f3(ro)} ${f3(ro)} 0 0 ${sweep} ${at(ro, bow)}L${at(ri, bow)}A${f3(ri)} ${f3(ri)} 0 0 ${1 - sweep} ${at(ri, -bow)}Z`;
}

/**
 * The bars at frame f, loop time l and weight w (voice-mode at f 24, w 0):
 * from frame 12 + 2k (k steps out from the centre) each grows from a 2px
 * square over 8 frames, sliding out from 2k px beside the centre to its place
 * as its bow flattens.
 */
function bars(f: number, l: number, w: number): string {
  return VOICE.map(([x, half], i) => {
    const k = Math.abs(i - 2);
    const from = 12 + 2 * k;
    if (f < from) {
      return '';
    }
    const u = span(f, from, from + 8);
    const out = Math.sign(i - 2);
    const cx = lerp(16 + out * 2 * k, x, ENTRANCE(u));
    const v =
      lerp(1, half, STANDARD(u)) -
      (w * DIP * (1 - Math.cos(2 * Math.PI * (l - RIPPLE * k)))) / 2;
    return barD(cx, v, out, Math.min(BOW[k] * (1 - u), v * MAX_BOW));
  }).join('');
}

/** Microphone ⇄ voice mode at hover h, change p (linear), loop time l and weight w. */
function shapes({ h, p, l = 0, w = 0 }: ToggleFrameIn): Shapes {
  const f = p * FRAMES;
  if (p >= CUT) {
    return {
      stand: { d: '' },
      pill: { d: '', ...EVENODD },
      bars: { d: bars(f, l, w) },
    };
  }
  return {
    stand: { d: f < 11 ? standD(h, f) : '' },
    pill: { d: pillAt(h, f), ...EVENODD },
    bars: { d: '' },
  };
}

const LINEAR = [0, 0, 1, 1] as const;

/**
 * Microphone ⇄ voice mode: Carbon's microphone (`off`) and voice mode
 * (`listening`, toggled). The microphone shrinks to a dot, then the
 * voice-mode bars grow out from the center and ripple while it listens.
 */
export const MicrophoneVoiceModeToggleSpec = /* @__PURE__ */ toggleIcon<
  'off' | 'listening'
>('MicrophoneVoiceModeToggle', {
  states: ['off', 'listening'],
  statics: [CMicrophone, CVoiceMode],
  geo: shapes,
  change: (on, _f, tween) =>
    tween('p', on ? 1 : 0, { duration: on ? IN : OUT, ease: LINEAR }),
  loop: /* @__PURE__ */ defineLoop({
    cycle: CYCLE,
    delay: IN,
    ramp: LOOP_RAMP,
  }),
});

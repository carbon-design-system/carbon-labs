/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  defineLoop,
  geoStill,
  toggleIcon,
  type Shapes,
  type ToggleFrameIn,
} from '../../engine';
import { ENTRANCE } from '../../ease';
import { roundedRectPath } from '../../geometry';
import { EVENODD, lerp } from '../../paint';
import { motionTokens } from '../../tokens';
import { CMicrophone, micOut } from './micVoiceMode';

// ── Microphone ⇄ listening: dictation that answers the voice ────────────────
//
// A click turns the microphone into three outlined pills that rise and fall
// with the voice. The pills grow as the Processing mark's dots swell into
// rings: a solid dot opens into a 2px outline, and here it also stretches
// up and down into a pill. Out, then in: the microphone leaves completely
// before the pills arrive.
//
// Off → listening, fast-02 then moderate-02 (p linear, the first third the
// microphone's):
//  - The microphone leaves as Microphone ⇄ voice mode's does (micOut): the
//    stand trims away and the capsule drops to a dot of radius 2, gone at
//    the cut.
//  - Three dots on y 16 at x 8, 16 and 24. The center one starts at the
//    microphone's last dot (radius 2); the pair beside it grows in from
//    nothing one frame (16ms) later.
//  - Each dot then opens into a 2px outline and stretches to its pill
//    (entrance ease): 6 wide, the center one 12 tall and the pair 8.
// Listening → off plays the same backwards on fast-01 and moderate-01, one
// token faster.
//
// While listening, once the pills land, the loop's weight eases in over
// slow-01. With a live level (the binding's `level`, 0 to 1, read each
// frame, rising on fast-01 and falling on moderate-01) each pill grows with
// it, the center one to 24 tall and the pair to 16, the pair a little behind
// the center, swaying a little as they go. In silence, and with no level,
// they hold still at rest.
//
// Off hovers as Microphone; listening holds still on hover. Under reduced
// motion the change lands at once and the pills hold still at rest.

/** The microphone's share of the change: it leaves on fast-02, the pills arrive on moderate-02. */
const MIC = motionTokens.duration.fast02;
const PILLS = motionTokens.duration.moderate02;
const CUT = MIC / (MIC + PILLS);
/** The change, in and out (one token faster each part). */
const IN = (MIC + PILLS) / 1000;
const OUT =
  (motionTokens.duration.fast01 + motionTokens.duration.moderate01) / 1000;
/** The microphone's frames (micOut: gone at 12). */
const MIC_FRAMES = 12;

/** The pills' centers, center first: [x, step out from the center]. */
const PILL_X: readonly (readonly [number, number])[] = [
  [16, 0],
  [8, 1],
  [24, 1],
];
/** Half the pill's outline width, at its centerline (6 wide outside). */
const HALF_W = 2;
/** The dot each pill starts from: radius 2 (the microphone's last dot). */
const DOT = 2;
/** Each pill's half height at its centerline, by step out: at rest, and at full level. */
const REST = [5, 3];
const LOUD = [11, 7];
/** The pair beside the center sets off one frame (16ms) after it, as a share of the pills' part. */
const STAGGER = 16 / PILLS;
/** The share of a pill's part spent growing in as a dot. */
const DOT_SHARE = 0.3;
/** The pair answers the level a little behind the center: this share of a cycle. */
const RIPPLE = 1 / 6;
/** Each pill sways this much around the level. */
const SWAY = 0.15;
/** The loop's cycle, and the weight's ease in once the pills land. */
const CYCLE = 1.2;
const LOOP_RAMP = motionTokens.duration.slow01 / 1000;

const clamp01 = (u: number) => Math.min(1, Math.max(0, u));

/** A pill about (x, 16): its outline's outer half width `ow` and half height `oh`, 2px thick (solid while `ow` ≤ 2). */
function pillD(x: number, ow: number, oh: number): string {
  if (ow <= 1e-3) {
    return '';
  }
  const outer = roundedRectPath(x - ow, 16 - oh, x + ow, 16 + oh, ow);
  const iw = ow - 2;
  return iw > 1e-3
    ? outer + roundedRectPath(x - iw, 16 - oh + 2, x + iw, 16 + oh - 2, iw)
    : outer;
}

/** How far step `k`'s pill reaches toward its loud height: none with no level. */
function reach(k: number, l: number, v: number | undefined): number {
  if (v === undefined) {
    return 0;
  }
  const wave = (1 - Math.cos(2 * Math.PI * (l - RIPPLE * k))) / 2;
  const behind = k ? 0.85 : 1;
  return clamp01(v * behind * (1 + SWAY * (2 * wave - 1)));
}

/** The pills at q (0 to 1 through their part), loop time l, weight w and level v. */
function pills(q: number, l: number, w: number, v: number | undefined): string {
  return PILL_X.map(([x, k]) => {
    const u = clamp01((q - STAGGER * k) / (1 - STAGGER));
    if (u < DOT_SHARE) {
      const r = lerp(k ? 0 : DOT, DOT, ENTRANCE(u / DOT_SHARE));
      return pillD(x, r, r);
    }
    const e = ENTRANCE((u - DOT_SHARE) / (1 - DOT_SHARE));
    const half = lerp(REST[k], LOUD[k], w * reach(k, l, v));
    return pillD(x, lerp(DOT, HALF_W + 1, e), lerp(DOT, half + 1, e));
  }).join('');
}

/** Microphone ⇄ listening at hover h, change p (linear), loop time l, weight w and level v. */
function shapes({ h, p, l = 0, w = 0, v }: ToggleFrameIn): Shapes {
  if (p >= CUT) {
    return {
      stand: { d: '' },
      pill: { d: '', ...EVENODD },
      pills: { d: pills((p - CUT) / (1 - CUT), l, w, v), ...EVENODD },
    };
  }
  const mic = micOut(h, (p / CUT) * MIC_FRAMES);
  return {
    stand: { d: mic.stand },
    pill: { d: mic.pill, ...EVENODD },
    pills: { d: '', ...EVENODD },
  };
}

const LINEAR = [0, 0, 1, 1] as const;

/**
 * Microphone ⇄ listening: Carbon's microphone (`off`) and three outlined
 * pills (`listening`, toggled). The microphone shrinks to a dot, then three
 * dots open into pills that rise and fall with the voice (`level`).
 */
export const MicrophoneListeningToggleSpec = /* @__PURE__ */ toggleIcon<
  'off' | 'listening'
>('MicrophoneListeningToggle', {
  states: ['off', 'listening'],
  statics: [
    CMicrophone,
    /* @__PURE__ */ geoStill('Listening', () => shapes({ h: 0, p: 1, e: 0 })),
  ],
  geo: shapes,
  change: (on, _f, tween) =>
    tween('p', on ? 1 : 0, { duration: on ? IN : OUT, ease: LINEAR }),
  loop: /* @__PURE__ */ defineLoop({
    cycle: CYCLE,
    delay: IN,
    ramp: LOOP_RAMP,
    level: true,
  }),
});

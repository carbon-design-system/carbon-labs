/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Asleep16 from '@carbon/icons/es/asleep/16.js';
import Asleep32 from '@carbon/icons/es/asleep/32.js';
import AsleepFilled32 from '@carbon/icons/es/asleep--filled/32.js';
import Sun32 from '@carbon/icons/es/sun/32.js';
import {
  carbonArt,
  toggleIcon,
  variantToggle,
  type Shapes,
  type ToggleFrame,
  type TweenFn,
  type ToggleIconProps,
} from '../../engine';
import { ringPath, type Pt } from '../../geometry';
import { ENTRANCE, EXIT } from '../../ease';
import {
  MOON_HOVER_DEG,
  MOON_HOVER_SCALE,
  moonArt,
  moonPath,
} from './stateToggles';

const CAsleep = /* @__PURE__ */ carbonArt(Asleep16, Asleep32);
const CAsleepFilled = /* @__PURE__ */ carbonArt(AsleepFilled32);
const CSun = /* @__PURE__ */ carbonArt(Sun32);

/**
 * Asleep ⇄ Awake (moon ⇄ sun) on the frame engine (see utils/frameIcon).
 * Timing from the reference animation.
 *
 * Toggle (250ms both ways: both are valid states): the outgoing glyph
 * exits for 100ms on the exit ease (the moon turns 15° and shrinks to
 * 84.6%; the sun's disc shrinks to 85% and its rays retract to stubs), then
 * the incoming one enters for 150ms on the entrance ease (the moon untwists
 * from −15° and grows back; the sun's disc grows back over 150ms, its
 * cardinal rays shoot out over 130ms and the diagonals 20ms later).
 *
 * Hover (its reference animation): the moon rotates 10° and scales
 * 108.3% about (17,16); the sun's ring grows r 5 → 6, its cardinal rays
 * move out 1px and reach 2px further, its diagonals move out 1px. Hover
 * and toggle compose (rotations add, scales multiply). Every part is
 * geometry at constant line weight. `filled` draws a solid moon and disc.
 *
 * Frame: `p` is the state shown at rest (0 asleep, 1 awake); `e` runs the
 * 250ms timeline (0 at rest).
 */

const EXIT_MS = 100;
const ENTER_MS = 150;
const TOTAL_MS = EXIT_MS + ENTER_MS;
const RAY_MS = 130;
const DIAGONAL_DELAY_MS = 20;
const MOON_SMALL = 0.84631;
const SUN_SMALL = 0.85;

type Pose = {
  awake: boolean;
  moonDeg: number;
  moonScale: number;
  sun: number;
  rayC: number;
  rayD: number;
};

/** What's shown at frame f: which glyph, and its toggle pose. */
function pose({ p, e }: ToggleFrame): Pose {
  const rest: Pose = {
    awake: p >= 0.5,
    moonDeg: 0,
    moonScale: 1,
    sun: 1,
    rayC: 1,
    rayD: 1,
  };
  if (e <= 0) {
    return rest;
  }
  const t = e * TOTAL_MS;
  if (t < EXIT_MS) {
    // The outgoing glyph (the other state) exits.
    const q = EXIT(t / EXIT_MS);
    return rest.awake
      ? {
          ...rest,
          awake: false,
          moonDeg: 15 * q,
          moonScale: 1 - (1 - MOON_SMALL) * q,
        }
      : {
          ...rest,
          awake: true,
          sun: 1 - (1 - SUN_SMALL) * q,
          rayC: 1 - q,
          rayD: 1 - q,
        };
  }
  const t2 = t - EXIT_MS;
  const q = ENTRANCE(Math.min(1, t2 / ENTER_MS));
  return rest.awake
    ? {
        ...rest,
        sun: SUN_SMALL + (1 - SUN_SMALL) * q,
        rayC: ENTRANCE(Math.min(1, t2 / RAY_MS)),
        rayD: ENTRANCE(
          Math.min(1, Math.max(0, (t2 - DIAGONAL_DELAY_MS) / RAY_MS))
        ),
      }
    : {
        ...rest,
        moonDeg: -15 * (1 - q),
        moonScale: MOON_SMALL + (1 - MOON_SMALL) * q,
      };
}

const n = (v: number) => +v.toFixed(3);
/** A 2px ray along direction u (unit) from radius r0 to r1 about (16,16). */
const ray = ([ux, uy]: Pt, r0: number, r1: number) =>
  `M${n(16 + ux * r0)} ${n(16 + uy * r0)}L${n(16 + ux * r1)} ${n(16 + uy * r1)}`;
const disc = (r: number) =>
  `M${n(16 - r)} 16A${n(r)} ${n(r)} 0 1 0 ${n(16 + r)} 16A${n(r)} ${n(r)} 0 1 0 ${n(16 - r)} 16Z`;
const D = Math.SQRT1_2;
const CARDINAL: Pt[] = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
];
const DIAGONAL: Pt[] = [
  [D, -D],
  [D, D],
  [-D, D],
  [-D, -D],
];
const LINE = { fill: 'none', stroke: 'currentColor', strokeWidth: 2 } as const;

function asleepAwakeShapes(
  f: ToggleFrame,
  size: number | undefined,
  filled: boolean
): Shapes {
  const { h } = f;
  const o = pose(f);
  const shapes: Shapes = {};
  // Moon: hover and toggle compose about (17,16).
  const moon = o.awake
    ? ''
    : moonPath(
        MOON_HOVER_DEG * h + o.moonDeg,
        (1 + (MOON_HOVER_SCALE - 1) * h) * o.moonScale,
        size,
        filled ? 1 : 0
      );
  if (filled) {
    shapes.moonFill = { d: moon };
  }
  shapes.moon = {
    d: moon,
    ...LINE,
    strokeWidth: moonArt(size, filled ? 1 : 0).weight,
    strokeLinejoin: 'round',
  };
  // Sun: r = 5 × toggle × (1 + 0.2h); rays from (7 + 2T) + hT out to (8 + 6T) + 2hT (cardinal) or + hT (diagonal).
  const r = 5 * o.sun * (1 + 0.2 * h);
  if (filled) {
    shapes.sunFill = { d: o.awake ? disc(r) : '' };
  }
  shapes.ring = { d: o.awake ? ringPath([16, 16], r, 2) : '' };
  const rays = (dirs: Pt[], T: number, reach: number) =>
    o.awake
      ? dirs
          .map((u) => ray(u, 7 + 2 * T + h * T, 8 + 6 * T + reach * h * T))
          .join('')
      : '';
  shapes.cardinal = { d: rays(CARDINAL, o.rayC, 2), ...LINE };
  shapes.diagonal = { d: rays(DIAGONAL, o.rayD, 1), ...LINE };
  return shapes;
}

function asleepAwakeChange(
  toAwake: boolean,
  fr: ToggleFrame,
  tween: TweenFn,
  repaint: () => void
) {
  fr.p = toAwake ? 1 : 0;
  // Just past 0 (e = 0 is rest), so the outgoing glyph shows from the first frame.
  fr.e = 1e-6;
  return tween(
    'e',
    1,
    { duration: TOTAL_MS / 1000, ease: [0, 0, 1, 1] as never },
    () => {
      fr.e = 0;
      repaint();
    }
  );
}

const spec = (filled: boolean) => ({
  states: ['asleep', 'awake'] as const,
  statics: filled
    ? ([CAsleepFilled, CSun] as const)
    : ([CAsleep, CSun] as const),
  geo: (f: ToggleFrame, size?: number) => asleepAwakeShapes(f, size, filled),
  change: asleepAwakeChange,
});

export const AsleepAwakeOutlineToggleSpec = /* @__PURE__ */ toggleIcon<
  'asleep' | 'awake'
>('AsleepAwakeToggle', spec(false));
export const AsleepAwakeFilledToggleSpec = /* @__PURE__ */ toggleIcon<
  'asleep' | 'awake'
>('AsleepAwakeToggle(filled)', spec(true));

/**
 * Asleep ⇄ Awake (sun); `filled` draws a solid moon and sun disc. Named for
 * both ends: AsleepToggle is Asleep's own outline ⇄ filled toggle.
 */
export const AsleepAwakeToggleSpec = /* @__PURE__ */ variantToggle(
  'AsleepAwakeToggle',
  (p: ToggleIconProps<'asleep' | 'awake'>) =>
    p.filled ? AsleepAwakeFilledToggleSpec : AsleepAwakeOutlineToggleSpec
);

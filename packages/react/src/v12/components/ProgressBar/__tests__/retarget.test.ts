/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import { easingCss } from '@carbon-labs/v12-motion';
import {
  continueFrom,
  curveAtSpeed,
  curveSlope,
  easeFrom,
  retargetFrom,
  tweenSpeed,
  type Curve,
} from '../components/retarget';

/** A running tween at eased progress `e`, as far as retargetFrom reads one. */
const tween = (e: number | null, playState: AnimationPlayState = 'running') =>
  ({
    playState,
    effect: { getComputedTiming: () => ({ progress: e }) },
  }) as unknown as Animation;

describe('the burst throttle', () => {
  it('retargets inside the window, keeping where the value is now', () => {
    // From 0.2 to 0.4, half way (eased) at 0.3; the new end is 0.5.
    const from = retargetFrom(tween(0.5), 0, 60, 120, 0.3, 0.5)!;
    expect(from).toBeCloseTo(0.1, 6);
    // At the same progress, the retargeted tween is where the old value stood: no jump.
    expect(from + (0.5 - from) * 0.5).toBeCloseTo(0.3, 6);
  });

  it('starts a new tween past the window, when nearly done, or when none runs', () => {
    expect(retargetFrom(tween(0.5), 0, 120, 120, 0.3, 0.5)).toBeNull();
    expect(retargetFrom(tween(0.97), 0, 60, 120, 0.39, 0.5)).toBeNull();
    expect(
      retargetFrom(tween(0.5, 'finished'), 0, 60, 120, 0.3, 0.5)
    ).toBeNull();
    expect(retargetFrom(null, 0, 60, 120, 0.3, 0.5)).toBeNull();
  });

  it('a tween that has not started yet is at its start', () => {
    expect(retargetFrom(tween(null), 0, 16, 120, 0.2, 0.6)).toBeCloseTo(0.2, 6);
  });
});

describe('a new tween at the speed the value is moving', () => {
  it('at rest, it is standard-productive', () => {
    expect(easeFrom(0)).toBe(easingCss('standard-productive'));
    expect(continueFrom(null, 0.3, 100, 120, 0.5)).toBe(
      easingCss('standard-productive')
    );
    // A reading too old to tell the speed.
    expect(continueFrom({ value: 0.2, at: 0 }, 0.3, 100, 120, 0.5)).toBe(
      easingCss('standard-productive')
    );
  });

  it('moving, its start handle gives the curve the value’s speed', () => {
    // 0.01 per ms, over 0.4 in 120ms: an initial slope of 3.
    const curve = continueFrom({ value: 0.14, at: 84 }, 0.3, 100, 120, 0.7);
    const [x1, y1] = curve.match(/[\d.]+/g)!.map(Number);
    expect(y1 / x1).toBeCloseTo(3, 3);
  });
});

describe('a retarget from the fill’s place and speed', () => {
  const STANDARD: Curve = [0.4, 0, 0.2, 1];
  /** A running tween at time progress `p` of `duration` ms. */
  const at = (p: number, duration: number) =>
    ({
      playState: 'running',
      effect: {
        getComputedTiming: () => ({ duration, localTime: p * duration }),
      },
    }) as unknown as Animation;

  it('reads the running tween’s speed off its curve', () => {
    // Linear: the distance over the duration.
    expect(
      tweenSpeed({
        anim: at(0.5, 100),
        from: 0.2,
        to: 0.4,
        curve: [0, 0, 1, 1],
      })
    ).toBeCloseTo(0.002, 6);
    // standard-productive leaves from rest and lands at rest.
    expect(
      tweenSpeed({ anim: at(0, 100), from: 0.2, to: 0.4, curve: STANDARD })
    ).toBeCloseTo(0, 6);
    expect(curveSlope(STANDARD, 1)).toBeCloseTo(0, 3);
  });

  it('the new tween leaves at that speed, late in the old one too', () => {
    // 90% through a 150ms tween from 0.1 to 0.22, the new value 0.35.
    const old = { anim: at(0.9, 150), from: 0.1, to: 0.22, curve: STANDARD };
    const v = tweenSpeed(old);
    expect(v).toBeGreaterThan(0);
    const now = 0.215;
    const curve = curveAtSpeed(v, now, 0.35, 150);
    // Its speed as it leaves: the old tween's.
    expect(((0.35 - now) * curveSlope(curve, 0)) / 150).toBeCloseTo(v, 6);
    // And never faster than a few times the average on the way (no jump ahead).
    let fastest = 0;
    for (let p = 0; p <= 1; p += 0.01) {
      fastest = Math.max(fastest, curveSlope(curve, p));
    }
    expect(fastest).toBeLessThan(3);
  });
});

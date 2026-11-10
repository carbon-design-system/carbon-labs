/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  axialPlan,
  snapClocks,
  snapProfileOn,
  withAxial,
} from '@carbon-labs/v12-motion';
import { snapFades, snapSliverTimes } from '@carbon-labs/v12-motion';
import {
  TEARSHEET_MOTION,
  tearsheetContentClock,
  tearsheetExitProfile,
  tearsheetProfileOn,
  tearsheetSnapProfile,
} from '../components/Tearsheet';

/** No DOM here: a stand-in element class, so the snap measures a box. */
const g = globalThis as { HTMLElement?: unknown };
const hadElement = 'HTMLElement' in g;
class Box {
  constructor(
    public offsetWidth: number,
    public offsetHeight: number
  ) {}
}
beforeAll(() => {
  if (!hadElement) g.HTMLElement = Box;
});
afterAll(() => {
  if (!hadElement) delete g.HTMLElement;
});
/** A sheet of `w` × `h` px, measured as the snap measures it. */
const sheet = (w: number, h: number) => new Box(w, h) as unknown as HTMLElement;

describe('tearsheetSnapProfile', () => {
  it('takes the sliver guard (joined to the bottom edge), a 60% width / 0% height start, and the collapse on y', () => {
    const profile = tearsheetSnapProfile();
    expect(profile.sliver).toBe(true);
    expect(profile.fadeIn).toBeUndefined();
    expect(profile.exitFade).toBeUndefined();
    // No timed fade: its opacity follows its height under 4px (no box here to measure).
    expect(snapFades(profile)).toEqual({ in: null, out: null, sliver: null });
    const t = snapSliverTimes(profile, { w: 1200, h: 800 }, { x: 600, y: 800 });
    expect(t.in!.keys[0]!.opacity).toBe(0);
    expect(t.in!.keys.at(-1)!.opacity).toBe(1);
    expect(t.out!.keys[0]!.opacity).toBe(1);
    expect(t.out!.keys.at(-1)!.opacity).toBe(0);
    expect(profile.fromX).toBe(TEARSHEET_MOTION.fromX);
    expect(profile.fromY).toBe(TEARSHEET_MOTION.fromY);
    // No content axis of its own: on Axial its content moves along the long axis.
    expect(profile.contentAxis).toBeUndefined();
    expect(profile.exitMode).toBe('collapse');
    expect(profile.collapseAxis).toBe('y');
  });

  it('on Axial from its bottom edge, the height takes the whole total and the content moves along it', () => {
    const profile = tearsheetSnapProfile();
    const w = 1200;
    const h = 800;
    const s = {
      w,
      h,
      origin: { x: w / 2, y: h },
      fromX: TEARSHEET_MOTION.fromX,
      fromY: TEARSHEET_MOTION.fromY,
    };
    const plan = axialPlan(s);
    expect(plan.in.y).toBeGreaterThan(plan.in.x);
    expect(withAxial(profile, s).contentAxis).toBe('y');
  });
});

describe('tearsheetProfileOn', () => {
  it('a step shorter in and two shorter out than the travel steps, each axis by the same share', () => {
    // 1440 × 900 page: the wide sheet 1312 × 852, the narrow 640 × 852 (852px of travel: moderate-03).
    for (const w of [1312, 640]) {
      const el = sheet(w, 852);
      const origin = { x: w / 2, y: 852 };
      const axial = snapProfileOn(tearsheetSnapProfile(), el, origin);
      const p = tearsheetProfileOn(tearsheetSnapProfile(), el, origin);
      expect(axial.in).toBe('moderate-03');
      expect(axial.out).toBe('moderate-02');
      expect(p.in).toBe('moderate-02');
      expect(p.out).toBe('fast-02');
      expect(snapClocks(p, 'in').ms).toBe(220);
      expect(snapClocks(p, 'out').ms).toBe(120);
      // The width still leads, done at the same share.
      expect(Number(p.inX) / Number(p.inY)).toBeCloseTo(
        Number(axial.inX) / Number(axial.inY),
        6
      );
      // Played as it is: the snap doesn't time it again.
      expect(snapProfileOn(p, el, origin)).toBe(p);
    }
    // A taller page (over 900px of travel: slow-01): 300ms in, 160ms out.
    const tall = tearsheetProfileOn(tearsheetSnapProfile(), sheet(1312, 952), {
      x: 656,
      y: 952,
    });
    expect([snapClocks(tall, 'in').ms, snapClocks(tall, 'out').ms]).toEqual([
      300, 160,
    ]);
  });

  it('with no element, the profile as it is', () => {
    const p = tearsheetSnapProfile();
    expect(tearsheetProfileOn(p, null)).toBe(p);
  });
});

describe('tearsheetContentClock', () => {
  it('sets contentIn just after the sheet’s entrance clock', () => {
    const base = tearsheetSnapProfile();
    const withClock = tearsheetContentClock(base, null, { x: 400, y: 600 });
    // Base SNAP.surface entrance clock is moderate-01 (160ms) -> 220ms (moderate-02: the step and 60ms agree).
    expect(withClock.contentIn).toBe(220);
  });
});

describe('tearsheetExitProfile', () => {
  it('holds the content still on the way out and changes nothing else', () => {
    const p = tearsheetSnapProfile();
    const out = tearsheetExitProfile(p);
    expect(out.contentOffset).toBe(0);
    expect({ ...out, contentOffset: p.contentOffset }).toEqual(p);
  });
});

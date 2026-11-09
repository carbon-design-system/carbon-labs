/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { afterEach, describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Link as CLink } from '@carbon/icons-react';
import { motionTokens } from '@carbon-labs/motion-icons-core/tokens';
import {
  FrameController,
  fromHover,
  HOVER,
  HOVER_OUT,
} from '@carbon-labs/motion-icons-core/engine';
import {
  manualScheduler,
  setScheduler,
} from '@carbon-labs/motion-icons-core/engine/animate';
import { LinkSpec } from '@carbon-labs/motion-icons-core/icons/formatting/Link';
import type { Pt } from '@carbon-labs/motion-icons-core/geometry';
import { MotionIconProvider } from '../../context/MotionIconProvider';
import type { Shapes } from '../../utils/frameIcon';
import {
  CENTRE,
  LINK_GROW,
  LINK_REACH,
  LINKS,
  Link,
  linkPath,
  linkPathAt,
  SIDE,
  type Loop,
} from '../../icons/formatting/Link';
import { LinkToggle } from '../../icons/toggle/editingToggles';
import {
  cover,
  coverCarbon,
  delta,
  flatten,
  grid,
  inside,
  runs,
} from './markRaster';

/**
 * Link's hover: the icon scales a little as the links spread apart. The loops pull apart 1px
 * per axis each, and the whole link grows about its visual centre, each
 * loop's far end reaching 1px further out, at constant 2px weight. Rest is
 * Carbon's Link at every size, the gaps round each crossing hold, and the
 * timing is the standard hover.
 */

afterEach(() => setScheduler(null));

const SIZES = [16, 20, 24, 32] as const;
const STEPS = Array.from({ length: 21 }, (_, i) => i / 20);
const R = 5;
const pts = (d: unknown): Pt[] => flatten(String(d)).flatMap((p) => p.pts);

/** The loop's geometry at hover progress h: its centreline grown about CENTRE, then pulled apart h px per axis. */
function placed(l: Loop, h: number) {
  const k = 1 + LINK_GROW * h;
  const g = (p: Pt): Pt => [
    CENTRE[0] + (p[0] - CENTRE[0]) * k + l.sign * h,
    CENTRE[1] + (p[1] - CENTRE[1]) * k - l.sign * h,
  ];
  const u: Pt = [(l.c2[0] - l.c1[0]) / SIDE, (l.c2[1] - l.c1[1]) / SIDE];
  return { k, c1: g(l.c1), c2: g(l.c2), u, n: [u[1], -u[0]] as Pt, r: R * k };
}

/** The empty spans along the loop's cut side (offset `off` from its centreline), between ink of either loop. */
function gaps(i: number, h: number, off = 0): number[] {
  const polys = [0, 1].map((j) => flatten(linkPath(LINKS[j], h)));
  const { c1, u, n, r, k } = placed(LINKS[i], h);
  const out: number[] = [];
  let [empty, run, seenInk] = [false, 0, false];
  const step = 0.002;
  for (let s = -3; s <= SIDE * k + 3; s += step) {
    const p: Pt = [
      c1[0] + u[0] * s + n[0] * (r + off),
      c1[1] + u[1] * s + n[1] * (r + off),
    ];
    const ink = inside(polys[0], p) || inside(polys[1], p);
    if (ink) {
      if (empty && seenInk) out.push(run * step);
      [empty, run, seenInk] = [false, 0, true];
    } else {
      if (!empty) [empty, run] = [true, 0];
      run++;
    }
  }
  return out;
}

/** Every frame a controller paints through a hover in (held 50ms) and back out, on the engine's clock. */
async function playHover(size: number) {
  const clock = manualScheduler(1);
  setScheduler(clock);
  const frames: { t: number; shapes: Shapes }[] = [];
  const ctl = new FrameController(
    fromHover(LinkSpec),
    (shapes) => frames.push({ t: clock.time(), shapes }),
    size
  );
  const run = async (ms: number) => {
    for (let t = 0; t < ms; t++) {
      clock.advance(1);
      await Promise.resolve();
    }
  };
  const [inMs, outMs] = [
    motionTokens.duration.moderate01,
    motionTokens.duration.fast02,
  ];
  void ctl.enter();
  await run(inMs - 1);
  const before = ctl.frame.h;
  await run(1);
  const inAt = ctl.frame.h;
  await run(50);
  void ctl.leave();
  await run(outMs - 1);
  const outBefore = ctl.frame.h;
  await run(1);
  return { frames, before, inAt, outBefore, outAt: ctl.frame.h };
}

describe('Link', () => {
  it("rests on Carbon's drawing at 16, 20, 24 and 32 (within 0.5%, as the parity story measures)", () => {
    for (const size of SIZES) {
      grid(size);
      expect(
        delta(cover(Link.geo({ h: 0 }, size)), coverCarbon(CLink, size)),
        `@${size}`
      ).toBeLessThan(0.005);
    }
  });

  it("draws Carbon's own art with motion off", () => {
    for (const size of SIZES) {
      const ours = render(
        <MotionIconProvider animated={false}>
          <Link size={size} />
        </MotionIconProvider>
      ).container.innerHTML;
      expect(ours, `@${size}`).toBe(
        render(<CLink size={size} />).container.innerHTML
      );
    }
  });

  it('plays on the standard hover: moderate-01 in on the entrance ease, fast-02 out', async () => {
    expect(LinkSpec.hover).toEqual(HOVER);
    expect([HOVER.duration, HOVER_OUT.duration]).toEqual([
      motionTokens.duration.moderate01 / 1000,
      motionTokens.duration.fast02 / 1000,
    ]);
    const { before, inAt, outBefore, outAt } = await playHover(32);
    expect(before).toBeLessThan(1);
    expect(inAt).toBe(1);
    expect(outBefore).toBeGreaterThan(0);
    expect(outAt).toBe(0);
  });

  it('keeps every painted frame inside the 36×36 box at 16 and 32 (the drawing is the same at every size), with no NaN and no transforms', async () => {
    for (const size of [16, 32]) {
      const { frames } = await playHover(size);
      expect(frames.length).toBeGreaterThan(100);
      for (const { t, shapes } of frames) {
        for (const s of Object.values(shapes)) {
          expect(String(s.d)).not.toMatch(/NaN|Infinity|undefined/);
          expect(s.transform).toBeUndefined();
          for (const [x, y] of pts(s.d))
            expect(
              x >= -2 && y >= -2 && x <= 34 && y <= 34,
              `t=${t} @${size}: ${x}, ${y}`
            ).toBe(true);
        }
      }
    }
  });

  it('grows about its visual centre, each far end reaching 1px further than the spread alone', () => {
    expect(LINK_REACH).toBe(1);
    // About 6.6%: 1px on the 15.25px from the centre to each far end's centreline.
    expect(LINK_GROW).toBeCloseTo(0.0656, 4);
    const axis = ([x, y]: Pt) => (x - CENTRE[0] - (y - CENTRE[1])) / Math.SQRT2;
    for (const h of STEPS) {
      const g = Link.geo({ h });
      const all = [...pts(g.a.d), ...pts(g.b.d)];
      const [xs, ys] = [all.map(([x]) => x), all.map(([, y]) => y)];
      // The bounds stay centred on CENTRE (the spread is symmetric, the growth about it).
      expect((Math.min(...xs) + Math.max(...xs)) / 2, `h=${h}`).toBeCloseTo(
        CENTRE[0],
        2
      );
      expect((Math.min(...ys) + Math.max(...ys)) / 2, `h=${h}`).toBeCloseTo(
        CENTRE[1],
        2
      );
      // Each far end, along the axis: Carbon's 14.5/√2 + 6, the spread √2 h further, and LINK_REACH h more.
      const reach = 14.5 / Math.SQRT2 + 6 + Math.SQRT2 * h + LINK_REACH * h;
      expect(Math.max(...pts(g.a.d).map(axis)), `A h=${h}`).toBeCloseTo(
        reach,
        2
      );
      expect(-Math.min(...pts(g.b.d).map(axis)), `B h=${h}`).toBeCloseTo(
        reach,
        2
      );
    }
  });

  it('keeps the line 2px through the hover (constant weight): across each side and each bend', () => {
    for (const h of STEPS) {
      const g = Link.geo({ h });
      LINKS.forEach((l, i) => {
        const { c1, c2, u, n, r } = placed(l, h);
        const shape = i ? g.b : g.a;
        // The far side's middle (never cut), and the middle of each bend (its tip along the axis).
        const probes: [Pt, Pt][] = [];
        const mid: Pt = [
          (c1[0] + c2[0]) / 2 - n[0] * r,
          (c1[1] + c2[1]) / 2 - n[1] * r,
        ];
        probes.push([
          [mid[0] - n[0] * 2, mid[1] - n[1] * 2],
          [mid[0] + n[0] * 2, mid[1] + n[1] * 2],
        ]);
        for (const [c, d] of [
          [c2, 1],
          [c1, -1],
        ] as const) {
          const tip: Pt = [c[0] + u[0] * d * r, c[1] + u[1] * d * r];
          probes.push([
            [tip[0] - u[0] * d * 2, tip[1] - u[1] * d * 2],
            [tip[0] + u[0] * d * 2, tip[1] + u[1] * d * 2],
          ]);
        }
        for (const [a, b] of probes) {
          const got = runs(shape, a, b);
          expect(got.length, `${i ? 'B' : 'A'} h=${h}`).toBe(1);
          expect(got[0], `${i ? 'B' : 'A'} h=${h}`).toBeCloseTo(2, 1);
        }
      });
    }
  });

  it('holds the gaps round each crossing through the hover (they ride the crossing as the link grows)', () => {
    for (const i of [0, 1]) {
      for (const off of [-0.9, 0, 0.9]) {
        const rest = gaps(i, 0, off);
        expect(rest.length, `${i ? 'B' : 'A'} off ${off}`).toBe(2);
        for (const h of [0.25, 0.5, 0.75, 1]) {
          const got = gaps(i, h, off);
          expect(got.length, `${i ? 'B' : 'A'} h=${h} off ${off}`).toBe(2);
          got.forEach((g, j) =>
            expect(
              Math.abs(g - rest[j]),
              `${i ? 'B' : 'A'} h=${h} off ${off}: ${g} vs ${rest[j]}`
            ).toBeLessThan(0.1)
          );
        }
      }
    }
  });
});

describe('LinkToggle', () => {
  it("hovers through Link's growth, which gives way as the links squeeze, so the cut is reached at rest size", () => {
    for (const h of [0, 0.5, 1]) {
      const linked = LinkToggle.geo({ h, p: 0, e: 0 });
      expect([linked.lower.d, linked.upper.d]).toEqual([
        linkPath(LINKS[1], h),
        linkPath(LINKS[0], h),
      ]);
      const cut = LinkToggle.geo({ h, p: 6 / 15, e: 0 });
      expect([cut.lower.d, cut.upper.d]).toEqual([
        linkPathAt(LINKS[1], h - 3.25, h - 2.75),
        linkPathAt(LINKS[0], h - 3.25, h - 2.75),
      ]);
    }
  });
});

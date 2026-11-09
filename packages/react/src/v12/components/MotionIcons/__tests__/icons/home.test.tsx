/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { Home as CHome } from '@carbon/icons-react';
import Home16 from '@carbon/icons/es/home/16.js';
import Home20 from '@carbon/icons/es/home/20.js';
import Home24 from '@carbon/icons/es/home/24.js';
import Home32 from '@carbon/icons/es/home/32.js';
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
import { HomeSpec } from '@carbon-labs/motion-icons-core/icons/navigation/navZoom';
import type { Pt } from '@carbon-labs/motion-icons-core/geometry';
import { MotionIconProvider } from '../../context/MotionIconProvider';
import type { Shapes } from '../../utils/frameIcon';
import {
  Home,
  HOME_DOOR,
  HOME_RISE,
  HOME_WALL,
} from '../../icons/navigation/navZoom';
import { cover, coverCarbon, delta, flatten, grid, inside } from './markRaster';

/**
 * Home's hover: the house grows 4px wider and 4px taller on its base (each
 * wall 2px out, the roof 4px up), and the doorway grows with it, from 4 × 8
 * to 6 × 12, its bottom on the base. Checked: rest is Carbon's drawing at
 * every size, Carbon's art with motion off, every wall, post, lintel and the
 * roof 2px through the hover, the doorway growing, the base planted, the
 * peak 1px past each side of the 32 frame and 2px above it (whole pixels at 16), the standard hover timing, and no hover under
 * reduced motion.
 */

const SIZES = [16, 20, 24, 32] as const;
const STEPS = Array.from({ length: 21 }, (_, i) => i / 20);
const CARBON = { 16: Home16, 20: Home20, 24: Home24, 32: Home32 } as const;
const carbonD = (size: keyof typeof CARBON) =>
  String(CARBON[size].content?.[0]?.attrs?.d);
const geo = (h: number, size?: number) => Home.geo({ h }, size) as Shapes;

/** Where a segment from a to b is inked: [from, to] along x (or y, for a vertical segment), sampled every 0.002. */
function spans(d: unknown, a: Pt, b: Pt): [number, number][] {
  const polys = flatten(String(d));
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const n = Math.ceil(len / 0.002);
  const axis = a[0] === b[0] ? 1 : 0;
  const out: [number, number][] = [];
  let start: number | null = null;
  for (let k = 0; k <= n; k++) {
    const t = k / n;
    const p: Pt = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    const on = k < n && inside(polys, p);
    if (on && start === null) start = p[axis];
    if (!on && start !== null) {
      out.push([start, p[axis]]);
      start = null;
    }
  }
  return out;
}
const near = (got: [number, number][], want: [number, number][], tol = 0.01) =>
  got.length === want.length &&
  got.every(
    ([a, b], i) =>
      Math.abs(a - want[i][0]) < tol && Math.abs(b - want[i][1]) < tol
  );
const bounds = (d: unknown) => {
  const p = flatten(String(d)).flatMap((q) => q.pts);
  return {
    x0: Math.min(...p.map(([x]) => x)),
    y0: Math.min(...p.map(([, y]) => y)),
    x1: Math.max(...p.map(([x]) => x)),
    y1: Math.max(...p.map(([, y]) => y)),
  };
};

afterEach(() => {
  setScheduler(null);
  cleanup();
});
beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
});

describe('Home', () => {
  it("rests exactly on Carbon's drawing at 16, 20, 24 and 32", () => {
    for (const size of SIZES) {
      const ours = flatten(String(geo(0, size).house.d));
      const carbon = flatten(carbonD(size));
      expect(ours.length, `@${size}`).toBe(carbon.length);
      ours.forEach((poly, i) => {
        expect(poly.pts.length, `@${size} subpath ${i}`).toBe(
          carbon[i].pts.length
        );
        poly.pts.forEach(([x, y], j) => {
          expect(x, `@${size} ${i}:${j}`).toBeCloseTo(carbon[i].pts[j][0], 4);
          expect(y, `@${size} ${i}:${j}`).toBeCloseTo(carbon[i].pts[j][1], 4);
        });
      });
      grid(size);
      expect(
        delta(cover(geo(0, size)), coverCarbon(CHome, size)),
        `@${size}`
      ).toBe(0);
    }
  });

  it("draws Carbon's own art with motion off", () => {
    for (const size of SIZES) {
      const ours = render(
        <MotionIconProvider animated={false}>
          <Home size={size} />
        </MotionIconProvider>
      ).container.innerHTML;
      expect(ours, `@${size}`).toBe(
        render(<CHome size={size} />).container.innerHTML
      );
    }
  });

  it('keeps every line 2px through the hover: walls, base, roof, doorposts and lintel', () => {
    expect([HOME_WALL, HOME_DOOR, HOME_RISE]).toEqual([2, 1, 4]);
    for (const h of STEPS) {
      const { d } = geo(h).house;
      const [w, dw, r] = [HOME_WALL * h, HOME_DOOR * h, HOME_RISE * h];
      expect(
        near(spans(d, [-1, 20], [9, 20]), [[4 - w, 6 - w]]),
        `left wall h=${h}`
      ).toBe(true);
      expect(
        near(spans(d, [23, 20], [33, 20]), [[26 + w, 28 + w]]),
        `right wall h=${h}`
      ).toBe(true);
      expect(near(spans(d, [8, 20], [8, 31]), [[26, 28]]), `base h=${h}`).toBe(
        true
      );
      expect(
        near(spans(d, [9, 22], [23, 22]), [
          [12 - dw, 14 - dw],
          [18 + dw, 20 + dw],
        ]),
        `doorposts h=${h}`
      ).toBe(true);
      expect(
        near(spans(d, [16, 9], [16, 31]), [
          [16 - r, 18 - r],
          [26, 28],
        ]),
        `lintel and base h=${h}`
      ).toBe(true);
      // The roof, across its slope on each side (along its normal through a point on its inner edge, risen with it).
      for (const [x, nx] of [
        [10, -1],
        [22, 1],
      ] as const) {
        const inner: Pt = [x, 4.2715 + 0.78 * Math.abs(16 - x) - r];
        const n: Pt = [0.615 * nx, -0.789];
        const s = spans(
          d,
          [inner[0] - n[0], inner[1] - n[1]],
          [inner[0] + 3 * n[0], inner[1] + 3 * n[1]]
        );
        expect(s.length, `roof x=${x} h=${h}`).toBe(1);
        // spans() reports a slanted probe by x: its length along the probe is Δx over the normal's x.
        expect(
          Math.abs(s[0][1] - s[0][0]) / Math.abs(n[0]),
          `roof x=${x} h=${h}`
        ).toBeCloseTo(2, 2);
      }
    }
  });

  it('grows the doorway with the house: 4 × 8 to 6 × 12, its bottom on the base', () => {
    const doorway = (h: number) => {
      const { d } = geo(h).house;
      const posts = spans(d, [9, 22], [23, 22]);
      const up = spans(d, [16, 9], [16, 31]);
      return {
        x0: posts[0][1],
        x1: posts[1][0],
        top: up[0][1],
        bottom: up[1][0],
      };
    };
    const [rest, peak] = [doorway(0), doorway(1)];
    expect(rest.x1 - rest.x0).toBeCloseTo(4, 2);
    expect(rest.bottom - rest.top).toBeCloseTo(8, 2);
    expect(peak.x1 - peak.x0).toBeCloseTo(6, 2);
    expect(peak.bottom - peak.top).toBeCloseTo(12, 2);
    for (const h of STEPS)
      expect(doorway(h).bottom, `h=${h}`).toBeCloseTo(26, 2);
    // Its gap to each wall widens from 6px to 7px, as its posts step out half as far as the walls.
    for (const h of STEPS) {
      const { d } = geo(h).house;
      const s = spans(d, [-1, 22], [33, 22]);
      expect(s[1][0] - s[0][1], `h=${h}`).toBeCloseTo(6 + h, 2);
      expect(s[3][0] - s[2][1], `h=${h}`).toBeCloseTo(6 + h, 2);
    }
  });

  it('keeps the base planted and grows 2px a side and 4px up: at peak 1px past each side of the 32 frame, 2px above it', () => {
    for (const h of STEPS) {
      const b = bounds(geo(h).house.d);
      expect(b.y1, `h=${h}`).toBeCloseTo(28, 3);
      expect(b.x0, `h=${h}`).toBeCloseTo(1 - 2 * h, 3);
      expect(b.x1, `h=${h}`).toBeCloseTo(31 + 2 * h, 2);
      expect(b.y0, `h=${h}`).toBeCloseTo(2 - 4 * h, 2);
    }
    const peak = bounds(geo(1).house.d);
    expect(
      [peak.x0, peak.y0, peak.x1].map((v) => Math.round(v * 1000) / 1000)
    ).toEqual([-1, -2, 33]);
  });

  it('plays on the standard hover: moderate-01 in, fast-02 out, by token', async () => {
    expect(HomeSpec.hover).toBeUndefined();
    expect(HomeSpec.leave).toBeUndefined();
    expect([HOVER.duration, HOVER_OUT.duration]).toEqual([
      motionTokens.duration.moderate01 / 1000,
      motionTokens.duration.fast02 / 1000,
    ]);
    const clock = manualScheduler(1);
    setScheduler(clock);
    const ctl = new FrameController(fromHover(HomeSpec), () => {}, 32);
    const run = async (ms: number) => {
      for (let t = 0; t < ms; t++) {
        clock.advance(1);
        await Promise.resolve();
      }
    };
    void ctl.enter();
    await run(motionTokens.duration.moderate01 - 1);
    expect(ctl.frame.h).toBeLessThan(1);
    await run(1);
    expect(ctl.frame.h).toBe(1);
    await run(50);
    void ctl.leave();
    await run(motionTokens.duration.fast02 - 1);
    expect(ctl.frame.h).toBeGreaterThan(0);
    await run(1);
    expect(ctl.frame.h).toBe(0);
  });

  it('stays at rest under reduced motion, hovered or not', async () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('reduce'),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
    for (const size of SIZES) {
      const { container, unmount } = render(
        <Home size={size} aria-label="Home" />
      );
      const painted = () =>
        container.querySelector('path[data-k="house"]')?.getAttribute('d');
      expect(painted(), `@${size}`).toBe(String(geo(0, size).house.d));
      const svg = container.querySelector('svg')!;
      fireEvent.mouseEnter(svg);
      fireEvent.pointerEnter(svg);
      await act(() => new Promise((r) => setTimeout(r, 250)));
      expect(painted(), `hovered @${size}`).toBe(String(geo(0, size).house.d));
      unmount();
    }
  });
});

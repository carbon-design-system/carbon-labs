/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { afterEach, describe, it, expect } from 'vitest';
import { motionTokens } from '@carbon-labs/motion-icons-core/tokens';
import { render } from '@testing-library/react';
import {
  Layers as CLayers,
  LayersExternal as CLayersExternal,
} from '@carbon/icons-react';
import {
  FrameController,
  fromHover,
  HOVER,
  HOVER_OUT,
  type HoverIconSpec,
} from '@carbon-labs/motion-icons-core/engine';
import {
  manualScheduler,
  setScheduler,
} from '@carbon-labs/motion-icons-core/engine/animate';
import {
  LayersExternalSpec,
  LayersSpec,
} from '@carbon-labs/motion-icons-core/icons/operations/opsLast';
import type { Pt } from '@carbon-labs/motion-icons-core/geometry';
import { MotionIconProvider } from '../../context/MotionIconProvider';
import type { CarbonIcon, FrameHoverIcon, Shapes } from '../../utils/frameIcon';
import {
  Layers,
  LayersExternal,
  LAYERS_EXTERNAL_REACH,
  LAYERS_GROW,
} from '../../icons/operations/opsLast';
import { cover, coverCarbon, delta, flatten, grid, runs } from './markRaster';

/**
 * Layers: the bottom layer rises 2px and the top one drops 2px, and
 * the whole icon grows 14/13 about (16, 16) at constant weight, its side tips
 * 1px out. Layers external: Layers' hover, the arrow
 * growing with the icon and its head reaching 2px up, the top layer's upper
 * cut end drawing back 2px along its wall to keep its space to the arrow.
 *
 * Both: rest on Carbon's drawing at 16, 20, 24 and 32, Carbon's art with
 * motion off, the standard hover timing, every painted frame inside the
 * 36×36 box with no transforms, and every wall 2px through the hover.
 */

afterEach(() => setScheduler(null));

const SIZES = [16, 20, 24, 32] as const;
const STEPS = Array.from({ length: 21 }, (_, i) => i / 20);
const pts = (d: unknown): Pt[] => flatten(String(d)).flatMap((p) => p.pts);
const S = 1 + LAYERS_GROW;
/** A rest point riding its centreline corner c, moved (dx, dy) and grown s about (16, 16). */
const ride = ([x, y]: Pt, c: Pt, s: number, [dx, dy]: Pt = [0, 0]): Pt => [
  x + dx + (s - 1) * (c[0] + dx - 16),
  y + dy + (s - 1) * (c[1] + dy - 16),
];
const has = (d: unknown, p: Pt, tol = 2e-3) =>
  pts(d).some(
    (q) => Math.abs(q[0] - p[0]) < tol && Math.abs(q[1] - p[1]) < tol
  );

interface Case {
  name: string;
  icon: FrameHoverIcon;
  spec: HoverIconSpec;
  carbon: CarbonIcon;
}
const CASES: Case[] = [
  { name: 'Layers', icon: Layers, spec: LayersSpec, carbon: CLayers },
  {
    name: 'LayersExternal',
    icon: LayersExternal,
    spec: LayersExternalSpec,
    carbon: CLayersExternal,
  },
];

/** Every frame a controller paints through a hover in (held 50ms) and back out, on the engine's clock. */
async function playHover(spec: HoverIconSpec, size: number) {
  const clock = manualScheduler(1);
  setScheduler(clock);
  const frames: { t: number; shapes: Shapes }[] = [];
  const ctl = new FrameController(
    fromHover(spec),
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

/** The ink's bounds over shapes (all filled outlines). */
function bounds(shapes: Shapes) {
  const p = Object.values(shapes).flatMap((s) => pts(s.d));
  const [xs, ys] = [p.map(([x]) => x), p.map(([, y]) => y)];
  return {
    x0: Math.min(...xs),
    y0: Math.min(...ys),
    x1: Math.max(...xs),
    y1: Math.max(...ys),
  };
}

/** The 2px wall across each centreline edge's middle (a probe along its normal finds one 2px run). */
function wallsHold(d: unknown, edges: readonly [Pt, Pt][], label: string) {
  for (const [a, b] of edges) {
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const [nx, ny] = [-(b[1] - a[1]) / l, (b[0] - a[0]) / l];
    const m: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const r = runs(
      { d: String(d) },
      [m[0] - 2 * nx, m[1] - 2 * ny],
      [m[0] + 2 * nx, m[1] + 2 * ny]
    );
    expect(r.length, `${label} ${a}→${b}`).toBe(1);
    expect(r[0], `${label} ${a}→${b}`).toBeCloseTo(2, 1);
  }
}
const grow = (c: Pt, h: number, dy = 0): Pt => [
  16 + (c[0] - 16) * (1 + LAYERS_GROW * h),
  16 + (c[1] + dy - 16) * (1 + LAYERS_GROW * h),
];
const chevron = (y: number, h: number, dy = 0): [Pt, Pt][] => {
  const [l, a, r] = [
    grow([3, y - 7], h, dy),
    grow([16, y], h, dy),
    grow([29, y - 7], h, dy),
  ];
  return [
    [l, a],
    [a, r],
  ];
};

describe.each(CASES)('$name', ({ icon, spec, carbon }) => {
  it("rests on Carbon's drawing at 16, 20, 24 and 32 (within 0.5%, as the parity story measures)", () => {
    for (const size of SIZES) {
      grid(size);
      expect(
        delta(cover(icon.geo({ h: 0 }, size)), coverCarbon(carbon, size)),
        `@${size}`
      ).toBeLessThan(0.005);
    }
  });

  it("draws Carbon's own art with motion off", () => {
    const Icon = icon;
    const Carbon = carbon;
    for (const size of SIZES) {
      const ours = render(
        <MotionIconProvider animated={false}>
          <Icon size={size} />
        </MotionIconProvider>
      ).container.innerHTML;
      expect(ours, `@${size}`).toBe(
        render(<Carbon size={size} />).container.innerHTML
      );
    }
  });

  it('plays on the standard hover: moderate-01 in, fast-02 out', async () => {
    expect(spec.hover).toBeUndefined();
    expect(spec.leave).toBeUndefined();
    expect([HOVER.duration, HOVER_OUT.duration]).toEqual([
      motionTokens.duration.moderate01 / 1000,
      motionTokens.duration.fast02 / 1000,
    ]);
    const { before, inAt, outBefore, outAt } = await playHover(spec, 32);
    expect(before).toBeLessThan(1);
    expect(inAt).toBe(1);
    expect(outBefore).toBeGreaterThan(0);
    expect(outAt).toBe(0);
  });

  it('keeps every painted frame inside the 36×36 box at every size, with the same keys, no NaN and no transforms', async () => {
    for (const size of SIZES) {
      const { frames } = await playHover(spec, size);
      expect(frames.length).toBeGreaterThan(100);
      const keys = Object.keys(icon.geo({ h: 0 }, size));
      for (const { t, shapes } of frames) {
        expect(Object.keys(shapes)).toEqual(keys);
        for (const s of Object.values(shapes)) {
          expect(String(s.d)).not.toMatch(/NaN|Infinity|undefined/);
          expect(s.transform).toBeUndefined();
        }
        const b = bounds(shapes);
        expect(
          b.x0 >= -2 && b.y0 >= -2 && b.x1 <= 34 && b.y1 <= 34,
          `t=${t} @${size}: ${JSON.stringify(b)}`
        ).toBe(true);
      }
    }
  });

  it('keeps every wall 2px through the hover (constant weight)', () => {
    for (const h of STEPS) {
      const g = icon.geo({ h });
      wallsHold(g.bottom.d, chevron(29, h, -2 * h), `bottom h=${h}`);
      wallsHold(g.mid.d, chevron(23, h), `mid h=${h}`);
      const [t, r, b, l] = (
        [
          [16, 3],
          [29, 10],
          [16, 17],
          [3, 10],
        ] as Pt[]
      ).map((c) => grow(c, h, 2 * h));
      // Layers external's top layer is the diamond's right half.
      wallsHold(
        g.top.d,
        g.arrow
          ? [
              [t, r],
              [r, b],
            ]
          : [
              [t, r],
              [r, b],
              [b, l],
              [l, t],
            ],
        `top h=${h}`
      );
    }
  });
});

describe('Layers', () => {
  it('grows 14/13 about (16, 16), the side tips 1px out a side', () => {
    expect(LAYERS_GROW).toBeCloseTo(1 / 13, 12);
    const [rest, peak] = [
      bounds(Layers.geo({ h: 0 })),
      bounds(Layers.geo({ h: 1 })),
    ];
    expect(rest.x0).toBeCloseTo(2, 2);
    expect(rest.x1).toBeCloseTo(30, 2);
    expect([rest.y0, rest.y1].map((v) => +v.toFixed(2))).toEqual([2, 30]);
    // Peak: x 1 to 31; the top drops 2 and the bottom rises 2, then both move 11/13 out with the growth.
    expect(peak.x0).toBeCloseTo(1, 2);
    expect(peak.x1).toBeCloseTo(31, 2);
    expect(peak.y0).toBeCloseTo(2 + 2 - 11 / 13, 2);
    expect(peak.y1).toBeCloseTo(30 - 2 + 11 / 13, 2);
  });

  it('still moves its layers: the bottom rises 2px, the top drops 2px, the middle holds (before the growth)', () => {
    const g = Layers.geo({ h: 1 });
    // The bottom chevron's apex, the middle one's and the top diamond's inner bottom corner.
    expect(has(g.bottom.d, ride([16, 30], [16, 29], S, [0, -2]))).toBe(true);
    expect(has(g.bottom.d, [16, 30 - 2 + 11 / 13])).toBe(true);
    expect(has(g.mid.d, ride([16, 24], [16, 23], S))).toBe(true);
    expect(has(g.mid.d, [16, 24 + 7 / 13])).toBe(true);
    expect(has(g.top.d, ride([16, 15.8643], [16, 17], S, [0, 2]))).toBe(true);
    // Its tips: the top diamond's left one rides its corner (3, 10 + 2), 1px further out.
    expect(has(g.top.d, ride([2.5259, 10.88], [3, 10], S, [0, 2]))).toBe(true);
  });
});

describe('LayersExternal', () => {
  /** The arrow's outline and the top layer's, as polygons. */
  const polys = (h: number) => {
    const g = LayersExternal.geo({ h });
    return [pts(g.arrow.d), pts(g.top.d)] as const;
  };
  const segDist = (p: Pt, a: Pt, b: Pt) => {
    const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
    const t = Math.max(
      0,
      Math.min(
        1,
        ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1)
      )
    );
    return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
  };
  const gap = (A: Pt[], B: Pt[]) => {
    let m = Infinity;
    for (const [P, Q] of [
      [A, B],
      [B, A],
    ])
      for (const p of P)
        Q.forEach(
          (a, i) => (m = Math.min(m, segDist(p, a, Q[(i + 1) % Q.length])))
        );
    return m;
  };

  it("reaches the arrow's head 2px up, the tail held (it rides the icon's growth only), the arrow growing with the layers", () => {
    expect(LAYERS_EXTERNAL_REACH).toBe(2);
    const { arrow } = LayersExternal.geo({ h: 1 });
    // The head's tip (9, 2) rides its corner (9, 2 + √2), moved 2px up; the tail's corners (8, 14) and (10, 14) ride (9, 14) unmoved.
    const tip = ride([9, 2], [9, 2 + Math.SQRT2], S, [0, -2]);
    expect(has(arrow.d, tip)).toBe(true);
    expect(tip[1]).toBeCloseTo(-14.5858 / 13, 3);
    expect(has(arrow.d, ride([8, 14], [9, 14], S))).toBe(true);
    expect(has(arrow.d, ride([10, 14], [9, 14], S))).toBe(true);
    // The shaft stays 2px wide and the head's arms keep their 2px.
    wallsHold(
      arrow.d,
      [[grow([9, 14], 1), grow([9, 2 + Math.SQRT2], 1, -2)]],
      'shaft'
    );
    wallsHold(
      arrow.d,
      [
        [grow([3.7071, 8.7071], 1, -2), grow([9, 2 + Math.SQRT2], 1, -2)],
        [grow([9, 2 + Math.SQRT2], 1, -2), grow([14.2929, 8.7071], 1, -2)],
      ],
      'head'
    );
  });

  it("draws the top layer's upper cut end back 2px along its wall; the lower cut end holds at x 16", () => {
    const { top } = LayersExternal.geo({ h: 1 });
    const w: Pt = [13 / Math.hypot(13, 7), 7 / Math.hypot(13, 7)];
    const move: Pt = [2 * w[0], 2 + 2 * w[1]];
    expect(has(top.d, ride([16, 1.8643], [16, 3], S, move), 1e-3)).toBe(true);
    expect(has(top.d, ride([16, 4.1358], [16, 3], S, move), 1e-3)).toBe(true);
    expect(has(top.d, ride([16, 15.8643], [16, 17], S, [0, 2]))).toBe(true);
    expect(has(top.d, ride([16, 18.1358], [16, 17], S, [0, 2]))).toBe(true);
    expect(
      Math.min(
        ...pts(top.d)
          .filter(([, y]) => y < 10)
          .map(([x]) => x)
      )
    ).toBeGreaterThan(17.8);
  });

  it('keeps the arrow at least 2.35px from the top layer at every step (3.44px at rest)', () => {
    expect(gap(...polys(0))).toBeCloseTo(3.44, 2);
    for (const h of Array.from({ length: 101 }, (_, i) => i / 100))
      expect(gap(...polys(h)), `h=${h}`).toBeGreaterThan(2.35);
  });

  it("peaks inside x 1.53 to 31 and y −1.12 to 28.85 (the chevrons' arm ends and the right tip 1px out a side)", () => {
    const b = bounds(LayersExternal.geo({ h: 1 }));
    expect(b.x0).toBeCloseTo(2.5259 - 1, 3);
    expect(b.x1).toBeCloseTo(31, 2);
    expect(b.y0).toBeCloseTo(-14.5858 / 13, 3);
    expect(b.y1).toBeCloseTo(30 - 2 + 11 / 13, 2);
  });
});

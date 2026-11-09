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
  Analytics as CAnalytics,
  AnalyticsCustom as CAnalyticsCustom,
  AnalyticsReference as CAnalyticsReference,
  ChartCustom as CChartCustom,
  DashboardReference as CDashboardReference,
  Data_1 as CData_1,
  DataRefineryReference as CDataRefineryReference,
  DataTableReference as CDataTableReference,
  DiagramReference as CDiagramReference,
  SkipBackOutlineSolid as CSkipBackOutlineSolid,
  SkipBackSolidFilled as CSkipBackSolidFilled,
  SkipForwardOutlineSolid as CSkipForwardOutlineSolid,
  SkipForwardSolidFilled as CSkipForwardSolidFilled,
} from '@carbon/icons-react';
import {
  FrameController,
  fromHover,
  HOVER,
  HOVER_OUT,
  leaveOf,
  type HoverIconSpec,
} from '@carbon-labs/motion-icons-core/engine';
import {
  manualScheduler,
  setScheduler,
} from '@carbon-labs/motion-icons-core/engine/animate';
import {
  AnalyticsCustomSpec,
  AnalyticsReferenceSpec,
} from '@carbon-labs/motion-icons-core/icons/data/lines';
import { ChartCustomSpec } from '@carbon-labs/motion-icons-core/icons/data/charts';
import { DashboardReferenceSpec } from '@carbon-labs/motion-icons-core/icons/assorted/assorted';
import {
  Data_1Spec,
  Data_2Spec,
} from '@carbon-labs/motion-icons-core/icons/assorted/systems';
import {
  DataRefineryReferenceSpec,
  DataTableReferenceSpec,
  DataTableSpec,
  DiagramReferenceSpec,
} from '@carbon-labs/motion-icons-core/icons/data/data-b';
import {
  SkipBackOutlineSolidSpec,
  SkipForwardOutlineSolidSpec,
} from '@carbon-labs/motion-icons-core/icons/controls/playback';
import {
  SkipBackSolidFilledSpec,
  SkipForwardSolidFilledSpec,
} from '@carbon-labs/motion-icons-core/icons/toggle/playbackFillToggles';
import {
  CUSTOM_PENCIL_REACH,
  REFERENCE_ARROW,
} from '@carbon-labs/motion-icons-core/icons/data/chartAxis';
import type { Pt } from '@carbon-labs/motion-icons-core/geometry';
import { gapBetween } from '@carbon-labs/motion-icons-core/utils/statusMark';
import { MotionIconProvider } from '../../context/MotionIconProvider';
import type { CarbonIcon, FrameHoverIcon, Shapes } from '../../utils/frameIcon';
import {
  Analytics,
  AnalyticsCustom,
  AnalyticsReference,
  REFERENCE_REACH,
} from '../../icons/data/lines';
import { ChartCustom } from '../../icons/data/charts';
import {
  DashboardReference,
  DASHBOARD_ARROW_REACH,
} from '../../icons/assorted/assorted';
import {
  Data_1,
  DATA1_GAP,
  DATA1_RING_MIN,
  DATA1_TRAVEL,
} from '../../icons/assorted/systems';
import {
  DataRefineryReference,
  DataTableReference,
  DiagramReference,
} from '../../icons/data/data-b';
import {
  SkipBackOutline,
  SkipBackOutlineSolid,
  SkipForwardOutline,
  SkipForwardOutlineSolid,
} from '../../icons/controls/playback';
import {
  SkipBackOutlineFilled,
  SkipBackSolidFilled,
  SkipForwardOutlineFilled,
  SkipForwardSolidFilled,
} from '../../icons/toggle/playbackFillToggles';
import {
  coverCarbon,
  delta,
  fillInto,
  flatten,
  grid,
  runs,
  type Poly,
} from './markRaster';

/**
 * Analytics custom and
 * reference, Chart custom, Dashboard reference, Data 1, Data refinery
 * reference, Data table reference, Diagram reference, and the skip family's
 * remaining fills (outline--solid, solid--filled). Each rests on Carbon's
 * drawing at 16, 20, 24 and 32 (Carbon draws each once) and draws Carbon's
 * art with motion off; at the peak each part is where its base's hover puts
 * it, the badges hold (the custom pencil pushes, as the edit marks' does);
 * every painted frame stays inside the 36×36 box.
 */

afterEach(() => setScheduler(null));

const SIZES = [16, 20, 24, 32] as const;
const H = Array.from({ length: 21 }, (_, i) => i / 20);
const pts = (d: unknown): Pt[] => flatten(String(d)).flatMap((p) => p.pts);
const near = (a: Pt, b: Pt, tol = 2e-3) =>
  Math.abs(a[0] - b[0]) < tol && Math.abs(a[1] - b[1]) < tol;
const P = 2 * Math.SQRT1_2; // the pencil's 2px push, on each axis

// ── Coverage with strokes (markRaster's grid; a 2px stroke as rectangles and joins) ──

const [LO, SUB] = [-2, 8];
/** The distance from p to the segment ab, or Infinity past its ends (a butt end). */
function segDist(p: Pt, a: Pt, b: Pt, ext = 0): number {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const l = Math.hypot(dx, dy);
  const t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l;
  if (t < -ext || t > l + ext) return Infinity;
  return Math.abs((p[0] - a[0]) * dy - (p[1] - a[1]) * dx) / l;
}
/** Shapes sampled as the browser paints them: fills, and 2px strokes with butt ends and round or miter (right-angle) joins. */
function coverAll(shapes: Shapes, size: number): Uint8Array {
  grid(size);
  const [step, n] = [8 / size / SUB, (36 * size * SUB) / 8];
  const ink = new Uint8Array(n * n);
  for (const a of Object.values(shapes)) {
    const polys = flatten(String(a.d ?? ''));
    if (a.fill !== 'none') fillInto(ink, polys, a.fillRule === 'evenodd');
    if (!a.stroke) continue;
    const w = Number(a.strokeWidth) / 2;
    const round = a.strokeLinejoin === 'round';
    for (const { pts: q, closed } of polys as Poly[]) {
      const segs = q
        .map((p, i) => [p, q[(i + 1) % q.length], i] as const)
        .slice(0, closed ? q.length : q.length - 1);
      const xs = q.map((p) => p[0]);
      const ys = q.map((p) => p[1]);
      const [x0, x1, y0, y1] = [
        Math.min(...xs) - w,
        Math.max(...xs) + w,
        Math.min(...ys) - w,
        Math.max(...ys) + w,
      ];
      for (
        let j = Math.max(0, Math.floor((y0 - LO) / step));
        j < Math.min(n, Math.ceil((y1 - LO) / step));
        j++
      ) {
        for (
          let k = Math.max(0, Math.floor((x0 - LO) / step));
          k < Math.min(n, Math.ceil((x1 - LO) / step));
          k++
        ) {
          const p: Pt = [LO + (k + 0.5) * step, LO + (j + 0.5) * step];
          const hit =
            segs.some(([u, v, i]) => {
              // A miter join on a right angle: each segment runs on by w at a joined end.
              const joined = closed || (i > 0 && i < q.length - 1);
              return segDist(p, u, v, !round && joined ? w : 0) <= w;
            }) ||
            (round &&
              q.some(
                (v, i) =>
                  (closed || (i > 0 && i < q.length - 1)) &&
                  Math.hypot(p[0] - v[0], p[1] - v[1]) <= w
              ));
          if (hit) ink[j * n + k] = 1;
        }
      }
    }
  }
  return ink;
}

interface Case {
  name: string;
  icon: FrameHoverIcon;
  spec: HoverIconSpec;
  carbon: CarbonIcon;
  /** The hover's timing: the standard (undefined), or the base's own. */
  hover?: HoverIconSpec['hover'];
}
const CASES: Case[] = [
  {
    name: 'AnalyticsCustom',
    icon: AnalyticsCustom,
    spec: AnalyticsCustomSpec,
    carbon: CAnalyticsCustom,
  },
  {
    name: 'AnalyticsReference',
    icon: AnalyticsReference,
    spec: AnalyticsReferenceSpec,
    carbon: CAnalyticsReference,
  },
  {
    name: 'ChartCustom',
    icon: ChartCustom,
    spec: ChartCustomSpec,
    carbon: CChartCustom,
  },
  {
    name: 'DashboardReference',
    icon: DashboardReference,
    spec: DashboardReferenceSpec,
    carbon: CDashboardReference,
  },
  {
    name: 'Data_1',
    icon: Data_1,
    spec: Data_1Spec,
    carbon: CData_1,
    hover: Data_2Spec.hover,
  },
  {
    name: 'DataRefineryReference',
    icon: DataRefineryReference,
    spec: DataRefineryReferenceSpec,
    carbon: CDataRefineryReference,
  },
  {
    name: 'DataTableReference',
    icon: DataTableReference,
    spec: DataTableReferenceSpec,
    carbon: CDataTableReference,
    hover: DataTableSpec.hover,
  },
  {
    name: 'DiagramReference',
    icon: DiagramReference,
    spec: DiagramReferenceSpec,
    carbon: CDiagramReference,
  },
  {
    name: 'SkipBackOutlineSolid',
    icon: SkipBackOutlineSolid,
    spec: SkipBackOutlineSolidSpec,
    carbon: CSkipBackOutlineSolid,
  },
  {
    name: 'SkipForwardOutlineSolid',
    icon: SkipForwardOutlineSolid,
    spec: SkipForwardOutlineSolidSpec,
    carbon: CSkipForwardOutlineSolid,
  },
  {
    name: 'SkipBackSolidFilled',
    icon: SkipBackSolidFilled,
    spec: SkipBackSolidFilledSpec,
    carbon: CSkipBackSolidFilled,
  },
  {
    name: 'SkipForwardSolidFilled',
    icon: SkipForwardSolidFilled,
    spec: SkipForwardSolidFilledSpec,
    carbon: CSkipForwardSolidFilled,
  },
];

/** Every frame a controller paints through a hover in and back out, on the engine's clock. */
async function playHover(
  spec: HoverIconSpec,
  size: number,
  inMs: number,
  outMs: number
) {
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

/** The ink's bounds over shapes, a stroke's half width included. */
function bounds(shapes: Shapes) {
  const all = Object.values(shapes).flatMap((s) => {
    const w = s.stroke ? Number(s.strokeWidth) / 2 : 0;
    return pts(s.d).flatMap(
      ([x, y]) =>
        [
          [x - w, y - w],
          [x + w, y + w],
        ] as Pt[]
    );
  });
  return {
    x0: Math.min(...all.map((p) => p[0])),
    y0: Math.min(...all.map((p) => p[1])),
    x1: Math.max(...all.map((p) => p[0])),
    y1: Math.max(...all.map((p) => p[1])),
  };
}

describe.each(CASES)('$name', ({ icon, spec, carbon, hover }) => {
  it("rests on Carbon's drawing at 16, 20, 24 and 32 (no ink pixel differs; Analytics' fitted line as close as Analytics')", () => {
    for (const size of SIZES) {
      const ours = coverAll(icon.geo({ h: 0 }, size), size);
      grid(size);
      const d = delta(ours, coverCarbon(carbon, size));
      if (!icon.geo({ h: 0 }).line) expect(d, `@${size}`).toBe(0);
      else {
        // The trend line is Analytics' 2px centreline, fitted to Carbon's outline: this sampler finds the
        // approved Analytics about 1% off Carbon at rest, and the variants within 0.1% of that.
        const base = coverAll(Analytics.geo({ h: 0 }, size), size);
        grid(size);
        expect(d, `@${size}`).toBeLessThan(
          delta(base, coverCarbon(CAnalytics, size)) + 1e-3
        );
      }
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

  it("plays on its base's timing (the standard: moderate-01 in, fast-02 out)", async () => {
    expect(spec.hover).toBe(hover);
    expect(spec.leave).toBeUndefined();
    const inMs = Math.round((hover ?? HOVER).duration * 1000);
    const outMs = Math.ceil(
      (hover ? leaveOf(hover) : HOVER_OUT).duration * 1000
    );
    if (!hover)
      expect([HOVER.duration, HOVER_OUT.duration]).toEqual([
        motionTokens.duration.moderate01 / 1000,
        motionTokens.duration.fast02 / 1000,
      ]);
    const { before, inAt, outBefore, outAt } = await playHover(
      spec,
      32,
      inMs,
      outMs
    );
    expect(before).toBeLessThan(1);
    expect(inAt).toBe(1);
    expect(outBefore).toBeGreaterThan(0);
    expect(outAt).toBe(0);
  });

  it('keeps every painted frame inside the 36×36 box at every size, with the same keys and no NaN', async () => {
    const inMs = Math.round((hover ?? HOVER).duration * 1000);
    const outMs = Math.ceil(
      (hover ? leaveOf(hover) : HOVER_OUT).duration * 1000
    );
    for (const size of SIZES) {
      const { frames } = await playHover(spec, size, inMs, outMs);
      expect(frames.length).toBeGreaterThan(200);
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

  it('holds the reference arrow still (but on Analytics reference and Dashboard reference)', () => {
    const rest = icon.geo({ h: 0 });
    if (
      !rest.badge ||
      icon === AnalyticsReference ||
      icon === DashboardReference
    )
      return;
    for (const h of H) expect(icon.geo({ h }).badge.d).toBe(REFERENCE_ARROW);
  });
});

describe('Analytics custom and reference: Analytics’ hover on the variant’s line', () => {
  it('moves the trend line and its head as Analytics’ do (5px higher), its start held', () => {
    for (const I of [AnalyticsCustom, AnalyticsReference]) {
      const [rest, full] = [I.geo({ h: 0 }), I.geo({ h: 1 })];
      const base = Analytics.geo({ h: 1 });
      const up = (q: Pt[]) => q.map(([x, y]) => [x, y - 5] as Pt);
      // Peak, trough and end: Analytics' at full hover, 5px up; the head the same.
      up(pts(base.line.d))
        .slice(1)
        .forEach((p, i) =>
          expect(near(pts(full.line.d)[i + 1], p), `line ${i + 1}`).toBe(true)
        );
      up(pts(base.head.d)).forEach((p, i) =>
        expect(near(pts(full.head.d)[i], p), `head ${i}`).toBe(true)
      );
      // The custom's start holds; the reference's draws back 2px up and right, along the line.
      const back = I === AnalyticsReference ? 2 : 0;
      expect(
        near(pts(full.line.d)[0], [
          pts(rest.line.d)[0][0] + back,
          pts(rest.line.d)[0][1] - back,
        ])
      ).toBe(true);
    }
  });

  it('reaches the reference arrow’s head 2px up and 2px right (Chat launch’s arrow), its tail held; the ends it nears keep their 4px', () => {
    expect(REFERENCE_REACH).toBe(2);
    const [rest, full] = [
      pts(AnalyticsReference.geo({ h: 0 }).badge.d),
      pts(AnalyticsReference.geo({ h: 1 }).badge.d),
    ];
    rest.forEach(([x, y], i) =>
      expect(
        near(full[i], i === 3 || i === 4 ? [x, y] : [x + 2, y - 2]),
        `arrow ${i}`
      ).toBe(true)
    );
    for (const h of H) {
      const g = AnalyticsReference.geo({ h });
      const arrow = pts(g.badge.d);
      // The axis's ends: corner to corner, 4px at every frame.
      expect(
        gapBetween(
          [arrow],
          flatten(String(g.axis.d)).map((q) => q.pts)
        ),
        `axis h=${h}`
      ).toBeCloseTo(4, 3);
      // The line's start: its butt end's low corner 4px above the head's top edge.
      const low =
        Math.max(
          ...pts(g.line.d)
            .slice(0, 1)
            .map((p) => p[1])
        ) +
        1 / Math.SQRT2;
      expect(
        Math.min(...arrow.map((p) => p[1])) - low,
        `line h=${h}`
      ).toBeCloseTo(4, 2);
    }
  });

  it('pushes the custom pencil 2px towards its tip, the axis’s open end drawing back as far', () => {
    expect(CUSTOM_PENCIL_REACH).toBe(2);
    const [rest, full] = [
      AnalyticsCustom.geo({ h: 0 }),
      AnalyticsCustom.geo({ h: 1 }),
    ];
    pts(rest.pencil.d).forEach(([x, y], i) =>
      expect(near(pts(full.pencil.d)[i], [x - P, y + P]), `pencil ${i}`).toBe(
        true
      )
    );
    // The bottom wall ends at x 12 at rest, 12 − √2 at full hover: its 4px to the pencil's left side holds.
    const wall = (g: Shapes) => runs(g.axis, [5, 29], [20, 29]);
    expect(wall(rest)).toEqual([expect.closeTo(7, 2)]);
    expect(wall(full)).toEqual([expect.closeTo(7 - P, 2)]);
  });
});

describe('Chart custom: Report data’s update on a page of three bars', () => {
  it('drops the left bar 4px, raises the middle 5 and drops the right 2; the page’s right wall holds', () => {
    const top = (h: number, k: string) =>
      Math.min(...pts(ChartCustom.geo({ h })[k].d).map((p) => p[1]));
    expect([top(0, 'b0'), top(0, 'b1'), top(0, 'b2')]).toEqual([8, 12, 14]);
    expect([top(1, 'b0'), top(1, 'b1'), top(1, 'b2')]).toEqual([12, 7, 16]);
    for (const h of H)
      expect(runs(ChartCustom.geo({ h }).page, [20, 10], [28, 10])).toEqual([
        expect.closeTo(2, 2),
      ]);
    expect(runs(ChartCustom.geo({ h: 0 }).page, [8, 29], [20, 29])).toEqual([
      expect.closeTo(4, 2),
    ]);
    expect(runs(ChartCustom.geo({ h: 1 }).page, [8, 29], [20, 29])).toEqual([
      expect.closeTo(4 - P, 2),
    ]);
  });
});

describe('Dashboard reference: Dashboard’s hover, the cut ends held', () => {
  it('grows the frame 1px out, its 2px walls ending where Carbon cuts them (y 16, x 16); the rule rises 2px', () => {
    const full = DashboardReference.geo({ h: 1 });
    const b = bounds({ frame: full.frame });
    expect([b.x0, b.y0, b.x1, b.y1]).toEqual([1, 1, 31, 31]);
    expect(runs(full.frame, [0, 14], [8, 14])).toEqual([expect.closeTo(2, 2)]);
    expect(runs(full.frame, [2, 17], [2, 25])).toEqual([]); // the left wall stops at y 16
    expect(runs(full.frame, [14, 30], [20, 30])).toEqual([
      expect.closeTo(4, 2),
    ]); // the bottom wall starts at x 16
    expect(runs(full.frame, [8, 4], [8, 20])).toEqual([expect.closeTo(2, 2)]); // the rule, y 9–11
    expect(pts(full.frame.d).some((p) => near(p, [12, 9]))).toBe(true); // the rule's top edge, 2px up
    expect(pts(full.frame.d).some((p) => near(p, [3, 11]))).toBe(true); // its bottom edge, 2px up
  });

  it('reaches the arrowhead 1px up and 1px right, its tail held: at full hover 3px from the bars, as the bars are from the right wall', () => {
    expect(DASHBOARD_ARROW_REACH).toBe(1);
    const [rest, full] = [
      pts(DashboardReference.geo({ h: 0 }).badge.d),
      pts(DashboardReference.geo({ h: 1 }).badge.d),
    ];
    rest.forEach(([x, y], i) =>
      expect(
        near(full[i], i === 3 || i === 4 ? [x, y] : [x + 1, y - 1]),
        `arrow ${i}`
      ).toBe(true)
    );
    let [bars, walls] = [Infinity, Infinity];
    for (const h of H) {
      const g = DashboardReference.geo({ h });
      const arrow = [pts(g.badge.d)];
      bars = Math.min(
        bars,
        gapBetween(
          arrow,
          flatten(String(g.bars.d)).map((q) => q.pts)
        )
      );
      walls = Math.min(
        walls,
        gapBetween(
          arrow,
          flatten(String(g.frame.d)).map((q) => q.pts)
        )
      );
    }
    const peak = DashboardReference.geo({ h: 1 });
    const toBars = gapBetween(
      [pts(peak.badge.d)],
      flatten(String(peak.bars.d)).map((q) => q.pts)
    );
    // The bars' right edge to the right wall's inside (its outer edge less its 2px), along y 24.
    expect(runs(peak.frame, [26, 24], [34, 24])).toEqual([
      expect.closeTo(2, 2),
    ]);
    const barsToWall =
      bounds({ frame: peak.frame }).x1 -
      2 -
      Math.max(...pts(peak.bars.d).map((p) => p[0]));
    expect(toBars).toBeCloseTo(3, 3);
    expect(barsToWall).toBeCloseTo(3, 2);
    expect(bars).toBeCloseTo(3, 3); // the nearest it comes, at full hover
    expect(walls).toBeGreaterThan(3.57); // the cut ends, mid-hover (3.58)
  });

  it('raises the bars 1px; the two Dashboard has trade heights', () => {
    const spans = (h: number) =>
      [17, 21, 25].map(
        (x) => runs(DashboardReference.geo({ h }).bars, [x, 10], [x, 30])[0]
      );
    expect(spans(0).map((v) => +v.toFixed(2))).toEqual([8, 10, 5]);
    expect(spans(1).map((v) => +v.toFixed(2))).toEqual([8, 5, 10]);
  });
});

describe('Data 1: Data 2’s scroll as a rearrangement, held at full hover', () => {
  it('ends with the top and bottom rings on the right, their lines behind them, and the middle ring round at the far left, its line on the right', () => {
    expect([DATA1_GAP, DATA1_RING_MIN]).toEqual([4, 2]);
    expect(DATA1_TRAVEL).toEqual([17, 12, 17]);
    const full = Data_1.geo({ h: 1 });
    const ring = (r: number) => {
      const q = flatten(String(full[`ring${r}`].d));
      expect(q.length).toBe(2); // one ring: its outer and inner circle
      const xs = q[0].pts.map((p) => p[0]);
      return [
        +((Math.max(...xs) + Math.min(...xs)) / 2).toFixed(2),
        +((Math.max(...xs) - Math.min(...xs)) / 2).toFixed(2),
      ];
    };
    const line = (r: number, y: number) =>
      runs(full[`line${r}`], [0, y], [32, y]).map((v) => +v.toFixed(2));
    // Top and bottom: line x 3–16, a 4px gap, the ring x 20–28 (centre 24).
    expect([ring(0), ring(2)]).toEqual([
      [24, 4],
      [24, 4],
    ]);
    expect([line(0, 7), line(2, 25)]).toEqual([[13], [13]]);
    expect(Math.min(...pts(full.line0.d).map((p) => p[0]))).toBe(3);
    expect(Math.max(...pts(full.line0.d).map((p) => p[0]))).toBe(16);
    // Middle: the ring x 4–12 (centre 8), a 4px gap, the line x 16–29.
    expect(ring(1)).toEqual([8, 4]);
    expect(line(1, 16)).toEqual([13]);
    expect(Math.min(...pts(full.line1.d).map((p) => p[0]))).toBe(16);
  });

  it('cuts the lines at the clip’s ends; the rings shrink into them at a 2px wall, blinking off below 2px', () => {
    const CLIPS: Array<[lo: number, hi: number]> = [
      [3, 28],
      [4, 29],
      [3, 28],
    ];
    const radii = new Set<number>();
    let off = 0;
    for (let i = 0; i <= 400; i++) {
      const g = Data_1.geo({ h: i / 400 });
      CLIPS.forEach(([lo, hi], r) => {
        for (const [x] of [...pts(g[`line${r}`].d), ...pts(g[`ring${r}`].d)])
          expect(x >= lo - 0.01 && x <= hi + 0.01, `x ${x}`).toBe(true); // rounding
        const rings = flatten(String(g[`ring${r}`].d));
        if (!rings.length) off++;
        // Each ring: an outer and an inner circle 2px apart (the wall), the outer 2 to 4.
        for (let k = 0; k < rings.length; k += 2) {
          const span = (q: Pt[]) =>
            Math.max(...q.map((p) => p[0])) - Math.min(...q.map((p) => p[0]));
          const [o, n] = [
            span(rings[k].pts) / 2,
            rings[k + 1] ? span(rings[k + 1].pts) / 2 : 0,
          ];
          expect(o).toBeGreaterThanOrEqual(2 - 1e-3);
          expect(o).toBeLessThanOrEqual(4 + 1e-3);
          expect(o - n).toBeCloseTo(2, 2);
          radii.add(+o.toFixed(1));
        }
      });
    }
    expect(off).toBeGreaterThan(0); // a ring blinks off between its exit and its entrance
    expect(Math.min(...radii)).toBeLessThan(2.2); // and shrinks to 2 first
  });

  it('keeps the top and bottom rings whole as they cross; only the middle ring blinks off (at the right) and comes back at the far left', () => {
    let [middleOff, outerOff] = [false, false];
    for (let i = 0; i <= 400; i++) {
      const g = Data_1.geo({ h: i / 400 });
      if (!g.ring1.d) middleOff = true;
      if (!g.ring0.d || !g.ring2.d) outerOff = true;
    }
    expect([middleOff, outerOff]).toEqual([true, false]);
  });
});

describe('Data refinery reference: Data refinery’s hover, the badge in the circle’s place', () => {
  it('slides the square 3px left as it grows 1px, closes the risers 2px each, and holds the lower run’s open end at x 16', () => {
    const full = DataRefineryReference.geo({ h: 1 });
    const b = bounds({ square: full.square });
    expect([b.x0, b.y0, b.x1, b.y1]).toEqual([17, 1, 29, 13]);
    for (const h of H)
      expect(
        Math.min(
          ...pts(DataRefineryReference.geo({ h }).pipe.d)
            .filter(([, y]) => y > 23)
            .map((p) => p[0])
        )
      ).toBe(16);
    expect(
      runs(full.pipe, [0, 12], [32, 12]).map((v) => +v.toFixed(2))
    ).toEqual([2]); // the left riser, at x 8–10
    expect(
      runs(full.pipe, [0, 20], [32, 20]).map((v) => +v.toFixed(2))
    ).toEqual([2]); // the right riser, at x 22–24
  });
});

describe('Data table reference: Data table’s hover, the cut ends held', () => {
  it('grows the table 1px out (walls 2px, ending at y 16 and x 16) and refreshes the cells: the top row steps, the short rows trade', () => {
    const full = DataTableReference.geo({ h: 1 });
    const b = bounds({ frame: full.frame });
    expect([b.x0, b.y0, b.x1, b.y1]).toEqual([2, 2, 30, 30]);
    expect(runs(full.frame, [0, 13], [8, 13])).toEqual([expect.closeTo(2, 2)]);
    expect(runs(full.frame, [3, 17], [3, 25])).toEqual([]);
    expect(runs(full.frame, [14, 29], [20, 29])).toEqual([
      expect.closeTo(4, 2),
    ]);
    const cells = (h: number) =>
      Object.entries(DataTableReference.geo({ h }))
        .filter(([k, s]) => /^c\d/.test(k) && s.d)
        .map(([, s]) => pts(s.d))
        .map(
          (q) =>
            `${Math.min(...q.map((p) => p[0]))},${Math.min(...q.map((p) => p[1]))}`
        )
        .sort();
    expect(cells(0)).toEqual(['16,18', '20,14', '20,22', '8,14']);
    expect(cells(1)).toEqual(['14,14', '16,22', '20,18', '8,14']);
  });
});

describe('Diagram reference: Diagram’s hover, the pie cut for the badge', () => {
  it('opens the pie’s gap 45° and grows it 1px; the cut ends stay on their radii (6 and 9 o’clock), 3px from the badge', () => {
    const pie = (h: number) => pts(DiagramReference.geo({ h }).pie.d);
    for (const h of H) {
      const q = pie(h);
      // The cut ends: on x 15 (6 o'clock) from y 26 + h to 28 + h, and on y 17 (9 o'clock) from x 4 − h to 6 − h.
      expect(
        q.some((p) => near(p, [15, 28 + h])) &&
          q.some((p) => near(p, [15, 26 + h])),
        `6 o'clock h=${h}`
      ).toBe(true);
      expect(
        q.some((p) => near(p, [4 - h, 17])) &&
          q.some((p) => near(p, [6 - h, 17])),
        `9 o'clock h=${h}`
      ).toBe(true);
    }
    // The pie's 3 o'clock wall swings to 4:30: at full hover its outer face runs along 45° through the centre's corner.
    expect(
      runs(DiagramReference.geo({ h: 1 }).pie, [20, 17.5], [27, 17.5])
    ).toEqual([]);
  });
});

describe('Skip outline--solid and solid--filled: their siblings’ hovers', () => {
  it('outline--solid: skip--*--outline’s hover (the ring grows 1px, the bar stretches 2px each end) with the triangle solid', () => {
    for (const [solid, outline] of [
      [SkipBackOutlineSolid, SkipBackOutline],
      [SkipForwardOutlineSolid, SkipForwardOutline],
    ] as const) {
      for (const h of H) {
        const [a, b] = [solid.geo({ h }), outline.geo({ h })];
        expect(a.ring).toEqual(b.ring);
        expect(a.bar).toEqual(b.bar);
        expect(a.tri.d).toBe(b.tri.d);
        expect(a.tri.fill).not.toBe('none');
      }
    }
  });

  it('solid--filled: skip--*--outline--filled’s disc and hover, without the triangle’s middle', () => {
    for (const [solid, filled] of [
      [SkipBackSolidFilled, SkipBackOutlineFilled],
      [SkipForwardSolidFilled, SkipForwardOutlineFilled],
    ] as const) {
      for (const h of H) {
        expect(solid.geo({ h })).toEqual({ disc: filled.geo({ h }).disc });
      }
    }
  });
});

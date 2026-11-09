/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, it, expect } from 'vitest';
import { motionTokens } from '@carbon-labs/motion-icons-core/tokens';
import { render } from '@testing-library/react';
import {
  DocumentAdd as CDocumentAdd,
  DocumentBlank as CDocumentBlank,
  Notification as CNotification,
  NotificationNew as CNotificationNew,
} from '@carbon/icons-react';
import * as Package from '../../index';
import { Save } from '../../icons/formatting/editing';
import { Document } from '../../icons/operations/transfer';
import { NotificationToggle } from '../../icons/toggle/NotificationToggle';
import type { CarbonIcon, Shapes } from '../../utils/frameIcon';
import type { Pt } from '@carbon-labs/motion-icons-core/geometry';
import {
  applyPlan,
  defaultMax,
  frameZone,
  inkOf,
  knockout,
  measureGap,
  knockoutSkips,
  pipShapes,
  pillText,
  pillWidth,
  plan,
  regionNums,
  regionOf,
  restFrame,
  squareCut,
  statusGeo,
  CLEAN,
  MIN_STUB,
  StatusPip,
  statusZone,
  type Placement,
  type Region,
  type Status,
} from '../../utils/statusLayer';

/**
 * Status-layer spike (utils/statusLayer.ts): the generic knockout cuts any
 * frame icon exactly (no ink inside the region, the base unchanged outside
 * it) and matches Carbon's own badge icons at rest; a status change keeps
 * its shape keys and paints no NaN at every frame; the timings are the
 * tokens'; the still drawing (reduced motion) shows pending as dots; and
 * the count pip's figures never scale.
 */

// ── A small coverage sampler (as files.test.tsx), via the spike's own ink reader ─

const PER = 6;
const N = 36 * PER;
const LO = -2;
function raster(shapes: Shapes): Uint8Array {
  const ink = new Uint8Array(N * N);
  for (const attrs of Object.values(shapes)) {
    if (Number(attrs.opacity ?? 1) === 0) continue;
    const r = inkOf(attrs);
    if (typeof r === 'string') continue;
    for (let j = 0; j < N; j++) {
      const y = LO + (j + 0.5) / PER;
      const xs: [number, number][] = [];
      for (const pts of r.rings) {
        pts.forEach((a, k) => {
          const b = pts[(k + 1) % pts.length];
          if (a[1] <= y !== b[1] <= y)
            xs.push([
              a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1]),
              b[1] > a[1] ? 1 : -1,
            ]);
        });
      }
      xs.sort((p, q) => p[0] - q[0]);
      let [w, c, m] = [0, 0, 0];
      for (let k = 0; k < N; k++) {
        const x = LO + (k + 0.5) / PER;
        while (m < xs.length && xs[m][0] < x)
          [w, c, m] = [w + xs[m][1], c + 1, m + 1];
        if (r.evenodd ? c % 2 : w) ink[j * N + k] = 1;
      }
    }
  }
  return ink;
}
/** Coverage of the 32px pixel (px, py), 0–1. */
const cov = (ink: Uint8Array, px: number, py: number) => {
  let c = 0;
  for (let j = (py + 2) * PER; j < (py + 3) * PER; j++)
    for (let k = (px + 2) * PER; k < (px + 3) * PER; k++) c += ink[j * N + k];
  return c / (PER * PER);
};
/** How far p sits inside a convex region (negative: outside). */
function insideBy(region: Region, [x, y]: Pt): number {
  const ar = region.reduce(
    (s, p, i) =>
      s +
      p[0] * region[(i + 1) % region.length][1] -
      region[(i + 1) % region.length][0] * p[1],
    0
  );
  let m = Infinity;
  region.forEach((a, i) => {
    const b = region[(i + 1) % region.length];
    const s =
      ((b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0])) /
      Math.hypot(b[0] - a[0], b[1] - a[1]);
    m = Math.min(m, ar > 0 ? s : -s);
  });
  return m;
}
/** Pixels inked inside the region, and pixels changed outside it (each by more than a quarter). */
function audit(base: Shapes, cut: Shapes, region: Region) {
  const [A, B] = [raster(base), raster(cut)];
  let [inked, changed] = [0, 0];
  for (let py = -2; py < 34; py++) {
    for (let px = -2; px < 34; px++) {
      const s = insideBy(region, [px + 0.5, py + 0.5]);
      if (Math.abs(s) < 0.75) continue;
      if (s > 0 && cov(B, px, py) > 0.25) inked++;
      if (s < 0 && Math.abs(cov(A, px, py) - cov(B, px, py)) > 0.25) changed++;
    }
  }
  return { inked, changed };
}

/** A Carbon icon's painted elements as shapes (paths and circles; fill="none" skipped). */
function carbonShapes(Icon: CarbonIcon): Shapes {
  const { container, unmount } = render(<Icon size={32} />);
  const shapes: Shapes = {};
  container.querySelectorAll('path, circle').forEach((el, i) => {
    if (el.getAttribute('fill') === 'none') return;
    let d = el.getAttribute('d') ?? '';
    if (el.tagName.toLowerCase() === 'circle') {
      const [cx, cy, r] = ['cx', 'cy', 'r'].map((a) =>
        Number(el.getAttribute(a))
      );
      d = `M${cx - r} ${cy}A${r} ${r} 0 1 0 ${cx + r} ${cy}A${r} ${r} 0 1 0 ${cx - r} ${cy}Z`;
    }
    shapes[`c${i}`] = { d };
  });
  unmount();
  return shapes;
}
/** The Parity story's Δ at 32px: ink pixels whose coverage differs by more than a quarter. */
function delta(a: Shapes, b: Shapes): number {
  const [A, B] = [raster(a), raster(b)];
  let [diff, ink] = [0, 0];
  for (let py = 0; py < 32; py++) {
    for (let px = 0; px < 32; px++) {
      const [ca, cb] = [cov(A, px, py), cov(B, px, py)];
      if (ca || cb) ink++;
      if (Math.abs(ca - cb) > 0.25) diff++;
    }
  }
  return diff / ink;
}

const BR: Placement = {};
const TR: Placement = { corner: 'tr', inset: [2, 4] };
type Geo = (f: Record<string, number>, size?: number) => Shapes;
const frameIcons = (
  Object.entries(Package) as [string, { geo?: unknown }][]
).filter(([, v]) => typeof v.geo === 'function') as [string, { geo: Geo }][];

describe('generic knockout', () => {
  // Every 10th shipped frame icon (the scratch sweep runs all 766), cut by both regions.
  const sample = frameIcons.filter((_, i) => i % 10 === 0);
  const regions: [string, Region][] = [
    ['box', regionOf(regionNums(BR, 'success'), BR)!],
    [
      'offset',
      regionOf(regionNums({ mode: 'offset' }, 'error'), { mode: 'offset' })!,
    ],
  ];
  it.each(regions)('cuts shipped icons exactly (%s)', (_, region) => {
    expect(sample.length).toBeGreaterThan(60);
    for (const [name, Icon] of sample) {
      const base = Icon.geo(
        name.endsWith('Toggle') ? { h: 0.5, p: 0, e: 0 } : { h: 0.5 },
        32
      );
      const cut = knockout(base, region);
      if (knockoutSkips.length) continue; // filled-and-stroked shapes (11 icons) aren't cut
      expect(audit(base, cut, region), name).toEqual({ inked: 0, changed: 0 });
    }
  });

  it("matches Carbon's badge icons at rest", () => {
    // notification--new: Carbon's bell cut at x 20 / y 14 round its 8px pip.
    const bell = {
      ...knockout(
        carbonShapes(CNotification),
        regionOf(regionNums(TR, 'notification'), TR)
      ),
      pip: { d: 'M22 8A4 4 0 1 0 30 8A4 4 0 1 0 22 8Z' },
    };
    expect(delta(bell, carbonShapes(CNotificationNew))).toBeLessThan(0.005);
    // document--add: document--blank cut at x 16 / y 16 round the 12px slot, with Carbon's plus.
    const doc = {
      ...knockout(
        carbonShapes(CDocumentBlank),
        regionOf(regionNums(BR, 'success'), BR)
      ),
      plus: {
        d: 'M30 24 26 24 26 20 24 20 24 24 20 24 20 26 24 26 24 30 26 30 26 26 30 26 30 24z',
      },
    };
    expect(delta(doc, carbonShapes(CDocumentAdd))).toBeLessThan(0.005);
  });

  it('costs well under a frame', () => {
    const geo = statusGeo(Save.geo as never, BR);
    const f = { ...restFrame(BR, 'success'), h: 0.5 };
    geo(f, 32);
    const t0 = performance.now();
    for (let i = 0; i < 100; i++) geo(f, 32);
    // Measured ~0.05ms on an M-series Mac; the gate is loose for CI load.
    expect((performance.now() - t0) / 100).toBeLessThan(2);
  });
});

describe('status transitions', () => {
  const bases: [string, { geo: Geo }, Placement][] = [
    ['Save', Save as never, BR],
    ['Notification', NotificationToggle as never, TR],
    ['Document', Document as never, BR],
  ];
  const pairs: [Status, Status][] = [
    ['none', 'success'],
    ['success', 'none'],
    ['none', 'notification'],
    ['notification', 'none'],
    ['none', 'pending'],
    ['pending', 'none'],
    ['success', 'warning'],
    ['warning', 'error'],
    ['success', 'notification'],
    ['notification', 'pending'],
  ];

  it.each(bases)(
    '%s keeps its shape keys and paints no NaN through every change',
    (_, base, p) => {
      const geo = statusGeo(base.geo as never, p);
      const keys = Object.keys(geo(restFrame(p, 'none'), 32)).sort();
      for (const [a, b] of pairs) {
        const f0 = restFrame(p, a);
        const { channels, total } = plan(p, f0, b);
        for (let t = 0; t <= total; t += 10) {
          const f = { ...f0 };
          applyPlan(f, channels, t);
          const shapes = geo(f, 32);
          expect(Object.keys(shapes).sort(), `${a}→${b} @${t}`).toEqual(keys);
          expect(
            /NaN|Infinity|undefined/.test(JSON.stringify(shapes)),
            `${a}→${b} @${t}`
          ).toBe(false);
        }
      }
    }
  );

  it("runs on the motion tokens (the loading family's: moderate-01 in, fast-02 out)", () => {
    const total = (a: Status, b: Status) => plan(BR, restFrame(BR, a), b).total;
    const [IN, OUT] = [
      motionTokens.duration.moderate01,
      motionTokens.duration.fast02,
    ];
    expect(total('none', 'success')).toBeCloseTo(OUT * 0.7 + IN); // the cut, then the check's draw-in
    expect(total('success', 'none')).toBeCloseTo(OUT / 2 + OUT); // the wipe, then the cut closes from halfway
    expect(total('none', 'notification')).toBe(IN); // the pip and the cut together
    expect(total('notification', 'none')).toBe(OUT);
    expect(total('success', 'warning')).toBe(OUT + IN); // match cut: out, then in
  });

  it('ends each change at the status at rest', () => {
    const geo = statusGeo(Save.geo as never, BR);
    for (const [a, b] of [
      ['none', 'success'],
      ['success', 'warning'],
      ['warning', 'none'],
      ['success', 'notification'],
    ] as [Status, Status][]) {
      const f = restFrame(BR, a);
      const { channels, total, done } = plan(BR, f, b);
      applyPlan(f, channels, total);
      Object.assign(f, done);
      expect(
        delta(geo(f, 32), geo(restFrame(BR, b), 32)),
        `${a}→${b}`
      ).toBeLessThan(0.005);
    }
  });
});

describe('square cuts, 4px from each mark', () => {
  // A 4px gap, and Carbon's square wall ends: each wall ends
  // across itself where it first comes within 4px of the mark.
  const bases: [string, { geo: Geo }, Placement][] = [
    ['Save', Save as never, BR],
    ['Document', Document as never, BR],
    ['Notification', NotificationToggle as never, TR],
  ];
  const statuses: Status[] = [
    'success',
    'notification',
    'pending',
    'warning',
    'error',
  ];
  it.each(bases)(
    '%s: every wall end square at rest, its nearest point 4px from the mark',
    (_, base, p) => {
      // (No hover while a status shows: the icon holds still, so the cut is only ever at rest.)
      for (const s of statuses) {
        const g = measureGap(base.geo({ h: 0, p: 0, e: 0 }, 32), p, s);
        expect(g.ends, `${s}: the mark meets the base`).toBeGreaterThan(0);
        expect(g.fallbacks, `${s}: no hugging fallbacks`).toBe(0);
        for (const near of g.perEnd)
          expect(near, `${s}: each end`).toBeGreaterThan(3.95);
        // Some end sits right at the gap, unless the clean-cut rule took a short stub back to its wall.
        if (
          !squareCut(base.geo({ h: 0, p: 0, e: 0 }, 32), statusZone(p, s))
            .report.clean.length
        )
          expect(g.min, `${s}: min`).toBeLessThan(4.05);
        expect(
          g.max,
          `${s}: max (a square end's far corner, or a stub taken back to its wall)`
        ).toBeLessThan(7 + MIN_STUB);
      }
    }
  );
  it.each(bases)(
    '%s: square throughout every change (no hugging fallback at any frame)',
    (_, base, p) => {
      const pairs: [Status, Status][] = [
        ['none', 'success'],
        ['success', 'none'],
        ['none', 'notification'],
        ['notification', 'none'],
        ['none', 'pending'],
        ['success', 'warning'],
        ['warning', 'error'],
        ['success', 'notification'],
      ];
      for (const [a, b] of pairs) {
        const f0 = restFrame(p, a);
        const { channels, total } = plan(p, f0, b);
        for (let t = 0; t <= total; t += 10) {
          const f = { ...f0 };
          applyPlan(f, channels, t);
          const { report } = squareCut(
            base.geo({ h: 0, p: 0, e: 0 }, 32),
            frameZone(p, f)
          );
          expect(
            report.fallbacks,
            `${a}→${b} @${t}: ${report.reasons.join('; ')}`
          ).toBe(0);
        }
      }
    }
  );
});

describe('StatusPip', () => {
  it('caps at 99+ and sizes the pill to its figures', () => {
    // "9+" means nine or more: the cap is its own stopping point.
    expect(pillText(7)).toBe('7');
    expect(pillText(98)).toBe('98');
    expect(pillText(99)).toBe('99+');
    expect(pillText(120)).toBe('99+');
    expect(pillText(8, 9)).toBe('8');
    expect(pillText(9, 9)).toBe('9+');
    expect(pillText(12, 9)).toBe('9+');
    expect([
      defaultMax(16),
      defaultMax(20),
      defaultMax(24),
      defaultMax(32),
    ]).toEqual([9, 9, 99, 99]);
    expect(
      pipShapes('3', '3', 1, 1, 1, 'var(--cds-support-error, #da1e28)').pip.fill
    ).toBe('var(--cds-support-error, #da1e28)');
    expect([pillWidth('7'), pillWidth('42'), pillWidth('99+')]).toEqual([
      20, 24, 32,
    ]);
  });
  it('rolls figures without scaling them: each frame, a figure is Carbon’s, moved and cut', () => {
    for (const t of [0, 0.3, 0.6, 1]) {
      const d = String(pipShapes('9', '10', t, 1, 1).pip.d);
      expect(/NaN/.test(d)).toBe(false);
    }
    // At rest the figure is the numeral's own outline, only moved.
    const rest = String(pipShapes('7', '7', 1, 1, 1).pip.d);
    expect(rest).toContain('M16.44 21L14.44 21L17 13');
  });
  it('rolls into the cap, holds above it, and rolls back below it', () => {
    const pip = (n: number, max?: 9 | 99) => (
      <StatusPip count={n} max={max} animated />
    );
    const d = (c: HTMLElement) =>
      c.querySelector('[data-k="pip"]')!.getAttribute('d');
    const { container, rerender } = render(pip(150));
    const atCap = d(container);
    rerender(pip(200)); // 150 → 200: both "99+", nothing moves
    expect(d(container)).toBe(atCap);
    expect(d(container)).toBe(String(pipShapes('99+', '99+', 1, 1, 1).pip.d));
    // 8 → 9 at max 9 rolls into "9+"; 12 → 7 rolls back to a digit (the target text is what it lands on).
    const { container: c2, rerender: r2 } = render(pip(8, 9));
    expect(d(c2)).toBe(String(pipShapes('8', '8', 1, 1, 1).pip.d));
    r2(pip(9, 9));
    expect(d(c2)).not.toBe(String(pipShapes('9+', '9+', 1, 1, 1).pip.d)); // mid-roll on the first frame, not a jump
    const still = render(<StatusPip count={9} max={9} animated={false} />);
    expect(d(still.container)).toBe(
      String(pipShapes('9+', '9+', 1, 1, 1).pip.d)
    );
  });
  it('renders', () => {
    const { container } = render(<StatusPip count={3} animated={false} />);
    expect(
      container.querySelector('[data-k="pip"]')!.getAttribute('d')
    ).toMatch(/^M/);
  });
});

describe('the clean-cut rule', () => {
  // Synthetic shapes against a disc zone, so each case is exactly one rule.
  const disc = (cx: number, cy: number, r: number) =>
    Array.from(
      { length: 96 },
      (_, i) =>
        [
          cx + r * Math.cos((i * Math.PI) / 48),
          cy + r * Math.sin((i * Math.PI) / 48),
        ] as Pt
    );
  const rect = (x0: number, y0: number, x1: number, y1: number) =>
    `M${x0} ${y0}H${x1}V${y1}H${x0}Z`;
  const inkInZone = (shapes: Shapes, zone: Region) => {
    const ink = raster(shapes);
    let n = 0;
    for (let j = 0; j < N; j++)
      for (let i = 0; i < N; i++)
        if (
          ink[j * N + i] &&
          insideBy(zone, [LO + (i + 0.5) / PER, LO + (j + 0.5) / PER]) > 0.1
        )
          n++;
    return n;
  };
  it('nick: a part the zone reaches less than 1 into stays whole (and 3 or more from the mark); deeper, it is cut', () => {
    const wall = { w: { d: rect(10, 0, 12, 32) } };
    for (const [into, kept] of [
      [0.6, true],
      [1.4, false],
    ] as const) {
      const zone = disc(12 - into + 8, 16, 8); // its left edge `into` inside the wall's right side
      const { shapes, report } = squareCut(wall, zone);
      expect(
        report.clean.some((e) => e.rule === 'nick'),
        `${into}`
      ).toBe(kept);
      expect(inkInZone(shapes, zone) > 0, `${into}`).toBe(kept);
    }
  });
  it('stub: a bar the cut leaves under MIN_STUB from the wall it hangs on goes back to that wall', () => {
    // A T (one outline): a wall x 4–6, a bar from it at y 15–17; the zone cuts the bar 2.5 from the wall.
    const t = { t: { d: 'M4 0H6V15H30V17H6V32H4Z' } };
    const zone = disc(8.5 + 10, 16, 10);
    const { shapes, report } = squareCut(t, zone);
    expect(report.clean.map((e) => e.rule)).toContain('stub');
    // Nothing of the bar is left to the right of the wall.
    const ink = raster(shapes);
    let bar = 0;
    for (let j = 0; j < N; j++)
      for (let i = 0; i < N; i++) {
        const [x, y] = [LO + (i + 0.5) / PER, LO + (j + 0.5) / PER];
        if (ink[j * N + i] && x > 6.2 && y > 15.2 && y < 16.8) bar++;
      }
    expect(bar).toBe(0);
  });
  it('fragment: a piece the cut leaves on its own, smaller than a stub, goes', () => {
    const bits = { b: { d: rect(2, 2, 30, 4) + rect(16, 14, 19, 16) } };
    const zone = disc(24, 15, 6.2); // takes most of the small bar, leaving under 3 long of it
    const { shapes, report } = squareCut(bits, zone);
    expect(
      report.clean.some((e) => e.rule === 'fragment' || e.rule === 'stub')
    ).toBe(true);
    const ink = raster(shapes);
    let left = 0;
    for (let j = 0; j < N; j++)
      for (let i = 0; i < N; i++) {
        const y = LO + (j + 0.5) / PER;
        if (ink[j * N + i] && y > 13.5 && y < 16.5) left++;
      }
    expect(left).toBe(0);
  });
  it('off, the square cut alone (CLEAN.on false) cuts the nick', () => {
    const wall = { w: { d: rect(10, 0, 12, 32) } };
    const zone = disc(12 - 0.6 + 8, 16, 8);
    CLEAN.on = false;
    try {
      expect(inkInZone(squareCut(wall, zone).shapes, zone)).toBe(0);
    } finally {
      CLEAN.on = true;
    }
  });
});

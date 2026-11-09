/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { afterEach, describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
  Apple as CApple,
  ChartVennDiagram as CChartVennDiagram,
  PiggyBankSlot as CPiggyBankSlot,
  SettingsView as CSettingsView,
  Sprout as CSprout,
  Tree as CTree,
  VolumeUp as CVolumeUp,
  VolumeUpFilled as CVolumeUpFilled,
} from '@carbon/icons-react';
import {
  actionPlayerOf,
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
  AppleSpec,
  VolumeDownFilledSpec,
  VolumeDownSpec,
  VolumeLevelToggleSpec,
  VolumeUpFilledSpec,
  VolumeUpSpec,
} from '@carbon-labs/motion-icons-core/icons/assorted/devicesPlaces';
import { ChartVennDiagramSpec } from '@carbon-labs/motion-icons-core/icons/data/charts';
import { PiggyBankSlotSpec } from '@carbon-labs/motion-icons-core/icons/assorted/assorted';
import { SettingsViewSpec } from '@carbon-labs/motion-icons-core/icons/marks/view';
import { SproutSpec } from '@carbon-labs/motion-icons-core/icons/assorted/docs2';
import { TreeSpec } from '@carbon-labs/motion-icons-core/icons/assorted/tech';
import { OUTGOING_GONE } from '@carbon-labs/motion-icons-core/icons/assorted/peopleMoney';
import { cubicBezier } from '@carbon-labs/motion-icons-core/ease';
import { motionTokens, toEasing } from '@carbon-labs/motion-icons-core/tokens';
import type { Pt } from '@carbon-labs/motion-icons-core/geometry';
import { MotionIconProvider } from '../../context/MotionIconProvider';
import type { CarbonIcon, FrameHoverIcon, Shapes } from '../../utils/frameIcon';
import {
  Apple,
  APPLE_GROW,
  LEAF_GROW,
  PULSE_MS,
  VolumeMute,
  VolumeUp,
  VolumeUpFilled,
  volumeRest,
  volumeWaveParts,
  wavePlace,
  waveShrink,
} from '../../icons/assorted/devicesPlaces';
import {
  ChartVennDiagram,
  VENN_APART,
  VENN_TRAVEL,
} from '../../icons/data/charts';
import {
  PIG_ACTION_MS,
  PIG_FEET,
  PIG_GROW,
  PIG_PIVOT,
  PIG_TILT,
  PiggyBankSlot,
} from '../../icons/assorted/assorted';
import { SettingsView } from '../../icons/marks/view';
import { Sprout } from '../../icons/assorted/docs2';
import { Tree } from '../../icons/assorted/tech';
import { cover, coverCarbon, delta, flatten, grid, inside } from './markRaster';

/**
 * Revised hovers on existing icons: Apple (the apple scales
 * more), Chart venn diagram (the circles swap sides), Piggy bank slot (the
 * coin drop is the action; the hover rocks the body back 10° and grows
 * the pig), Settings view (the cut left of the eye holds its width), Sprout
 * (the big leaf grows more, the rise is 1px, the ground runs 1px further
 * each way), Tree (the roots reach 2px each way), Volume up and Volume up
 * filled, and every volume action (the leaving wave shrinks as
 * Connection signal's does; nothing fades).
 *
 * Every icon: rest on Carbon's drawing at 16, 20, 24 and 32 (the pig, drawn
 * as 2px centrelines, on its approved resting fit), Carbon's art with motion
 * off, its hover timing, and every frame a controller paints inside the
 * 36×36 box; then each one's peak (or end) geometry. The sprout's and the
 * tree's own suites (docs2, tech) also measure their walls.
 */

afterEach(() => setScheduler(null));

const SIZES = [16, 20, 24, 32] as const;
const STEPS = Array.from({ length: 21 }, (_, i) => i / 20);
const pts = (d: unknown): Pt[] => flatten(String(d)).flatMap((p) => p.pts);
const close = (a: Pt, b: Pt, tol = 2e-3) =>
  Math.abs(a[0] - b[0]) < tol && Math.abs(a[1] - b[1]) < tol;

interface Case {
  name: string;
  icon: FrameHoverIcon;
  spec: HoverIconSpec;
  carbon: CarbonIcon;
  /** Drawn as 2px centrelines (the raster here fills outlines), so its rest is checked against its approved fit below. */
  stroked?: boolean;
  /** Its own hover timing, in ms (in, out); else the standard (STANDARD). */
  timing?: [number, number];
}
/** The standard hover, in ms: moderate-01 in, fast-02 out. */
const STANDARD: [number, number] = [
  motionTokens.duration.moderate01,
  motionTokens.duration.fast02,
];
const CASES: Case[] = [
  { name: 'Apple', icon: Apple, spec: AppleSpec, carbon: CApple },
  {
    name: 'ChartVennDiagram',
    icon: ChartVennDiagram,
    spec: ChartVennDiagramSpec,
    carbon: CChartVennDiagram,
  },
  {
    name: 'PiggyBankSlot',
    icon: PiggyBankSlot,
    spec: PiggyBankSlotSpec,
    carbon: CPiggyBankSlot,
    stroked: true,
  },
  // Settings' gear turns on Settings' own moderate-02 curve (both ways).
  {
    name: 'SettingsView',
    icon: SettingsView,
    spec: SettingsViewSpec,
    carbon: CSettingsView,
    timing: [
      motionTokens.duration.moderate02,
      motionTokens.duration.moderate02,
    ],
  },
  { name: 'Sprout', icon: Sprout, spec: SproutSpec, carbon: CSprout },
  { name: 'Tree', icon: Tree, spec: TreeSpec, carbon: CTree },
  { name: 'VolumeUp', icon: VolumeUp, spec: VolumeUpSpec, carbon: CVolumeUp },
  {
    name: 'VolumeUpFilled',
    icon: VolumeUpFilled,
    spec: VolumeUpFilledSpec,
    carbon: CVolumeUpFilled,
  },
];

const clockAt = () => {
  const clock = manualScheduler(1);
  setScheduler(clock);
  return clock;
};

/** Every frame a controller paints through a hover in (held 50ms) and back out, on the engine's clock. */
async function playHover(
  spec: HoverIconSpec,
  size: number,
  [inMs, outMs]: [number, number]
) {
  const clock = clockAt();
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

/** The ink's bounds over shapes (a stroke by half its width). */
function bounds(shapes: Shapes) {
  let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity];
  for (const s of Object.values(shapes)) {
    const pad =
      s.stroke && s.stroke !== 'none' ? Number(s.strokeWidth ?? 1) / 2 : 0;
    for (const [x, y] of pts(s.d))
      [x0, y0, x1, y1] = [
        Math.min(x0, x - pad),
        Math.min(y0, y - pad),
        Math.max(x1, x + pad),
        Math.max(y1, y + pad),
      ];
  }
  return { x0, y0, x1, y1 };
}
const inBox = (shapes: Shapes) => {
  const b = bounds(shapes);
  return (
    b.x0 >= -2 - 1e-6 &&
    b.y0 >= -2 - 1e-6 &&
    b.x1 <= 34 + 1e-6 &&
    b.y1 <= 34 + 1e-6
  );
};

describe.each(CASES)(
  '$name',
  ({ icon, spec, carbon, stroked, timing = STANDARD }) => {
    it.runIf(!stroked)(
      "rests on Carbon's drawing at 16, 20, 24 and 32 (within 0.5%, as the parity story measures)",
      () => {
        for (const size of SIZES) {
          grid(size);
          expect(
            delta(cover(icon.geo({ h: 0 }, size)), coverCarbon(carbon, size)),
            `@${size}`
          ).toBeLessThan(0.005);
        }
      }
    );

    it("draws Carbon's own art with motion off", () => {
      const Icon = icon;
      for (const size of SIZES) {
        const ours = render(
          <MotionIconProvider animated={false}>
            <Icon size={size} />
          </MotionIconProvider>
        ).container.innerHTML;
        const Carbon = carbon;
        expect(ours, `@${size}`).toBe(
          render(<Carbon size={size} />).container.innerHTML
        );
      }
    });

    it(`plays on its hover timing: ${timing[0]}ms in, ${timing[1]}ms out`, async () => {
      if (timing === STANDARD) {
        expect(spec.hover).toBeUndefined();
        expect(spec.leave).toBeUndefined();
        expect([HOVER.duration, HOVER_OUT.duration]).toEqual(
          STANDARD.map((ms) => ms / 1000)
        );
      }
      const { before, inAt, outBefore, outAt } = await playHover(
        spec,
        32,
        timing
      );
      expect(before).toBeLessThan(1);
      expect(inAt).toBe(1);
      expect(outBefore).toBeGreaterThan(0);
      expect(outAt).toBe(0);
    });

    it('keeps every painted frame inside the 36×36 box at every size, with the same keys, no NaN and no transforms', async () => {
      for (const size of SIZES) {
        const { frames } = await playHover(spec, size, timing);
        expect(frames.length).toBeGreaterThan(100);
        const keys = Object.keys(icon.geo({ h: 0 }, size));
        for (const { t, shapes } of frames) {
          expect(Object.keys(shapes)).toEqual(keys);
          for (const s of Object.values(shapes)) {
            expect(String(s.d)).not.toMatch(/NaN|Infinity|undefined/);
            expect(s.transform).toBeUndefined();
          }
          expect(
            inBox(shapes),
            `t=${t} @${size}: ${JSON.stringify(bounds(shapes))}`
          ).toBe(true);
        }
      }
    });
  }
);

// ── Apple ────────────────────────────────────────────────────────────────────

describe('Apple', () => {
  // The whole apple scales a little more: 12/11, 1px a side.
  it('scales the apple 12.5/11 about (16, 18) at constant weight (its sides 1.5px out); the leaf still grows 5/3, its tip 2px further', () => {
    expect(APPLE_GROW).toBeCloseTo(1.5 / 11, 9);
    expect(LEAF_GROW).toBeCloseTo(2 / 3, 9);
    const extent = (h: number) => {
      const p = pts(Apple.geo({ h }).apple.d);
      return [Math.min(...p.map(([x]) => x)), Math.max(...p.map(([x]) => x))];
    };
    const [[l0, r0], [l1, r1]] = [extent(0), extent(1)];
    expect(l0 - l1).toBeCloseTo(1.5, 1);
    expect(r1 - r0).toBeCloseTo(1.5, 1);
    // The window inside stays 2px from the outside: the side walls hold 2px (a probe across the left wall at y 18).
    const ink = (h: number, x: number) =>
      inside(flatten(String(Apple.geo({ h }).apple.d)), [x, 18], true);
    for (const h of [0, 0.5, 1]) {
      const l = 4 - 1.5 * h;
      const w =
        Array.from({ length: 400 }, (_, i) => l - 0.5 + i * 0.01).filter((x) =>
          ink(h, x)
        ).length * 0.01;
      expect(w, `left wall h=${h}`).toBeCloseTo(2, 1);
    }
    // The leaf's tip (Carbon's (20, 4)): its base rides with the apple, then it grows 5/3 about it.
    const s = 1 + APPLE_GROW;
    const base: Pt = [17 + (17 - 16) * (s - 1), 7 + (7 - 18) * (s - 1)];
    const tip: Pt = [
      base[0] + 3 * (1 + LEAF_GROW),
      base[1] - 3 * (1 + LEAF_GROW),
    ];
    expect(
      pts(Apple.geo({ h: 1 }).leaf.d).some((p) => close(p, tip, 0.02)),
      `tip at ${tip}`
    ).toBe(true);
  });
});

// ── Chart venn diagram ───────────────────────────────────────────────────────

describe('ChartVennDiagram', () => {
  // The circles move until they swap sides, with a slide small enough that they stay distinct at 16px.
  it('slides the rings through each other until they swap sides, ending 6 apart (they rest 8 apart), each at r 9 and its 2px wall', () => {
    expect([VENN_APART, VENN_TRAVEL]).toEqual([6, 7]);
    const centreOf = (d: unknown): Pt => {
      const p = pts(d);
      const xs = p.map(([x]) => x);
      const ys = p.map(([, y]) => y);
      return [
        (Math.min(...xs) + Math.max(...xs)) / 2,
        (Math.min(...ys) + Math.max(...ys)) / 2,
      ];
    };
    for (const h of STEPS) {
      const s = ChartVennDiagram.geo({ h });
      const [a, b] = [centreOf(s.a.d), centreOf(s.b.d)];
      expect(a[0], `a h=${h}`).toBeCloseTo(12 + 7 * h, 3);
      expect(b[0], `b h=${h}`).toBeCloseTo(20 - 7 * h, 3);
      // Each ring: every point r 10 or r 8 about its centre.
      for (const [k, c] of [
        ['a', a],
        ['b', b],
      ] as const) {
        for (const p of pts(s[k].d))
          expect(
            Math.min(
              Math.abs(Math.hypot(p[0] - c[0], p[1] - c[1]) - 10),
              Math.abs(Math.hypot(p[0] - c[0], p[1] - c[1]) - 8)
            ),
            `${k} h=${h}`
          ).toBeLessThan(1e-2);
      }
    }
    const end = ChartVennDiagram.geo({ h: 1 });
    const apart = centreOf(end.a.d)[0] - centreOf(end.b.d)[0];
    expect(apart).toBeCloseTo(6, 3);
    // Two circles at 16px: along the middle row the walls (2px) stand 6 apart, 4px clear, 2 device pixels at 16px.
    grid(16);
    const row = Array.from(
      { length: 36 * 20 },
      (_, i) => -2 + (i + 0.5) / 20
    ).map(
      (x) =>
        inside(flatten(String(end.a.d)), [x, 16], true) ||
        inside(flatten(String(end.b.d)), [x, 16], true)
    );
    const gaps: number[] = [];
    let run = 0;
    row.forEach((ink, i) => {
      if (!ink) run++;
      else {
        if (run && i - run > 0) gaps.push(run / 20);
        run = 0;
      }
    });
    expect(gaps.length, 'three clear gaps between four walls').toBe(3);
    for (const g of gaps) expect(g).toBeGreaterThanOrEqual(4 - 0.06);
  });
});

// ── Piggy bank slot ──────────────────────────────────────────────────────────

// Its approved resting fit (Carbon's piggy-bank--slot as 2px centrelines).
const PIG_REST = {
  belly: 'M14 25V24H19V25',
  body: 'M19 24.5V27H23V22.9C25.05 22.3 25.9 20.35 26 19H29V14H26C26.1 11.95 25.65 10.85 24 9.3V5L20 8H15C10.26 8 6.27 10.7 6.01 15.4A8.02 8.02 0 0 0 10 22.99V27H14V24.5',
  slot: 'M13 11H20V13H13Z',
};

describe('PiggyBankSlot', () => {
  const rot =
    (deg: number, c: Pt) =>
    ([x, y]: Pt): Pt => {
      const [co, si] = [
        Math.cos((deg * Math.PI) / 180),
        Math.sin((deg * Math.PI) / 180),
      ];
      return [
        c[0] + (x - c[0]) * co - (y - c[1]) * si,
        c[1] + (x - c[0]) * si + (y - c[1]) * co,
      ];
    };
  const grow =
    (s: number) =>
    ([x, y]: Pt): Pt => [
      PIG_FEET[0] + (x - PIG_FEET[0]) * s,
      PIG_FEET[1] + (y - PIG_FEET[1]) * s,
    ];

  it('rests on its approved fit: the same outline, belly and slot as before, the tail curled up from (6.5, 16)', () => {
    const rest = PiggyBankSlot.geo({ h: 0 });
    for (const k of ['belly', 'body', 'slot'] as const) {
      const [a, b] = [pts(rest[k].d), pts(PIG_REST[k])];
      expect(a.length, k).toBe(b.length);
      a.forEach((p, i) =>
        expect(close(p, b[i], 1e-3), `${k} ${i}: ${p} vs ${b[i]}`).toBe(true)
      );
    }
    const tail = pts(rest.tail.d);
    expect(close(tail[0], [6.5, 16]) && close(tail[1], [5, 16])).toBe(true);
    // An arc of r 2 turning a quarter (up), then 2px on: its end near (3, 12).
    expect(close(tail.at(-1)!, [3, 12], 0.05), `${tail.at(-1)}`).toBe(true);
  });

  // The hover: the pig's body rotates 10° CCW without moving the legs (as if sliding on its body's bottom curve), and the whole pig scales up a little.
  it('hover: the body rocks back 10° anticlockwise about the belly’s middle and the pig grows 1/12 about its feet; the feet hold their line and the legs stay upright', () => {
    expect([PIG_TILT, PIG_GROW]).toEqual([10, 1 / 12]);
    expect(PIG_PIVOT).toEqual([16.5, 24]);
    expect(PIG_FEET).toEqual([16.5, 27]);
    for (const h of [0.5, 1]) {
      const s = 1 + PIG_GROW * h;
      const body = (p: Pt) => grow(s)(rot(-PIG_TILT * h, PIG_PIVOT)(p));
      const shapes = PiggyBankSlot.geo({ h });
      const p = pts(shapes.body.d);
      // The snout's corners and the ear's tip ride with the body.
      for (const q of [
        [29, 19],
        [29, 14],
        [24, 5],
        [20, 8],
      ] as Pt[])
        expect(
          p.some((r) => close(r, body(q))),
          `${q} h=${h}`
        ).toBe(true);
      // The snout's top corner rises (anticlockwise on screen).
      expect(body([29, 14])[1]).toBeLessThan(14 - 1.5 * h);
      // The feet: on the ground line (y 27), spread with the growth.
      for (const q of [
        [19, 27],
        [23, 27],
        [10, 27],
        [14, 27],
      ] as Pt[])
        expect(
          p.some((r) => close(r, grow(s)(q))),
          `foot ${q} h=${h}`
        ).toBe(true);
      // The legs upright: each leg's top straight above its foot.
      const [t0, t1] = [p[0], p.at(-1)!];
      expect(t0[0]).toBeCloseTo(grow(s)([19, 27])[0], 3);
      expect(t1[0]).toBeCloseTo(grow(s)([14, 27])[0], 3);
      // The slot: a 2px bar riding with the body (its centreline ends mapped), its weight held.
      const slot = pts(shapes.slot.d);
      const [a, b] = [body([13, 12]), body([20, 12])];
      const mid: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const n: Pt = [
        -(b[1] - a[1]) / Math.hypot(b[0] - a[0], b[1] - a[1]),
        (b[0] - a[0]) / Math.hypot(b[0] - a[0], b[1] - a[1]),
      ];
      const across = slot.map(
        ([x, y]) => (x - mid[0]) * n[0] + (y - mid[1]) * n[1]
      );
      expect(
        Math.max(...across) - Math.min(...across),
        `slot h=${h}`
      ).toBeCloseTo(2, 2);
      // Strokes keep their 2px; nothing transforms.
      for (const k of ['belly', 'body', 'tail'] as const)
        expect(shapes[k].strokeWidth, k).toBe(2);
      expect(shapes.coin.d).toBe('');
    }
  });

  // The coin drop is the action.
  it(`action: the coin drop, ${PIG_ACTION_MS}ms, one pass (no loop), resting at both ends, inside the box at every frame and size`, () => {
    const act = PiggyBankSlotSpec.action!;
    expect(act.duration).toBeCloseTo(0.45, 9);
    expect(act.loops).toBe(false);
    expect(act.description.length).toBeGreaterThan(40);
    for (const size of SIZES) {
      for (const h of [0, 1]) {
        expect(act.geo({ h, a: 0 }, size)).toEqual(
          PiggyBankSlotSpec.geo({ h }, size)
        );
        expect(act.geo({ h, a: 1 }, size)).toEqual(
          PiggyBankSlotSpec.geo({ h }, size)
        );
      }
      const keys = Object.keys(PiggyBankSlotSpec.geo({ h: 0 }, size));
      let coinShown = 0;
      let lowest = 0;
      for (let i = 1; i < 90; i++) {
        const f = act.geo({ h: 0, a: i / 90 }, size);
        expect(Object.keys(f)).toEqual(keys);
        expect(inBox(f), `a=${i / 90} @${size}`).toBe(true);
        if (f.coin.d) coinShown++;
        lowest = Math.max(lowest, Math.max(...pts(f.slot.d).map(([, y]) => y)));
      }
      expect(coinShown, 'the coin shows for a stretch').toBeGreaterThan(20);
      // The bob: the slot (with the body) dips 1px.
      expect(lowest).toBeCloseTo(14, 1);
    }
  });

  it('plays one pass on trigger and lands on rest; the promise resolves true', async () => {
    const clock = clockAt();
    const painted: Shapes[] = [];
    const c = new FrameController(
      fromHover(PiggyBankSlotSpec),
      (s) => painted.push(s),
      32
    );
    const t = actionPlayerOf(c)!;
    let done: boolean | undefined;
    void t.trigger().then((d) => (done = d));
    for (let ms = 0; ms < PIG_ACTION_MS + 80; ms++) {
      clock.advance(1);
      for (let i = 0; i < 4; i++) await Promise.resolve();
    }
    expect(done).toBe(true);
    expect(t.acting).toBe(false);
    expect(painted.at(-1)).toEqual(PiggyBankSlotSpec.geo({ h: 0 }, 32));
    expect(painted.some((s) => s.coin.d)).toBe(true);
    painted.forEach((s, i) => expect(inBox(s), `frame ${i}`).toBe(true));
    // Looping is off: loop plays one pass too.
    void t.trigger({ loop: true });
    for (let ms = 0; ms < PIG_ACTION_MS + 80; ms++) {
      clock.advance(1);
      for (let i = 0; i < 4; i++) await Promise.resolve();
    }
    expect(t.acting).toBe(false);
    c.destroy();
  });
});

// ── Settings view ────────────────────────────────────────────────────────────

describe('SettingsView', () => {
  /**
   * The cut left of the eye: the narrowest space from the eye's ink to the
   * gear's painted ink left of the eye's middle (x < 16, below y 17), sampled
   * every 1/20px.
   */
  const leftCut = (h: number) => {
    const p = SettingsViewSpec.parts(h);
    const eye = p.ink[0];
    const base = flatten(p.base);
    let m = Infinity;
    for (let x = 8.025; x < 16; x += 0.05) {
      for (let y = 17.025; y < 31; y += 0.05) {
        if (!inside(base, [x, y])) continue;
        eye.forEach((a, k) => {
          const b = eye[(k + 1) % eye.length];
          const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
          const t = Math.max(
            0,
            Math.min(
              1,
              ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy || 1)
            )
          );
          m = Math.min(m, Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy));
        });
      }
    }
    return m;
  };
  // The knockout left of the eye holds its width (growing with the eye's opening, it would reach 3.26px at full hover).
  it('holds the cut left of the eye at its resting width (2px) frame by frame', () => {
    const rest = leftCut(0);
    expect(rest).toBeCloseTo(2, 1);
    for (let i = 1; i <= 40; i++) {
      const w = leftCut(i / 40);
      expect(w, `h=${i / 40}`).toBeLessThan(2.12);
      expect(w, `h=${i / 40}`).toBeGreaterThan(1.94);
    }
  }, 60_000);
});

// ── Volume up (and filled) ───────────────────────────────────────────────────

describe('Volume actions (Volume up, Volume down, and filled)', () => {
  const ease = cubicBezier(...toEasing(motionTokens.easing.standard));
  /** The leaving wave's half-angle about its centre (the waves span 82.88°, half 41.44°). */
  const halfAngle = (d: string, c: Pt) => {
    const a = pts(d).map(([x, y]) => Math.atan2(y - c[1], x - c[0]));
    return (Math.max(...a) - Math.min(...a)) / 2;
  };
  // The volume icons' actions shrink the leaving pulse as Connection signal does, with no fade.
  it.each([
    [
      'Volume up: the outer wave on past the second place',
      { a: 2, b: 1, x: 0 },
      2,
    ],
    ['Volume down: its wave on past the first place', { a: 1, b: 0, x: 2 }, 1],
  ] as const)(
    "%s shrinks toward its middle as Connection signal's outer waves do (to a quarter by 0.7 of the travel, then off), never fading",
    (_, level, from) => {
      expect(waveShrink(0)).toBe(1);
      expect(waveShrink(OUTGOING_GONE - 1e-6)).toBeCloseTo(0.25, 4);
      expect(waveShrink(OUTGOING_GONE)).toBe(0);
      const centre = (q: number): Pt => {
        const { c } = wavePlace(from + q);
        return [c[0] + level.x, c[1]];
      };
      const full = halfAngle(
        volumeWaveParts({ ...level, t: 0.001 }).waveA.d,
        centre(ease(0.001))
      );
      expect((full * 180) / Math.PI).toBeCloseTo(41.44, 0);
      let gone = false;
      for (let ms = 5; ms < PULSE_MS; ms += 5) {
        const t = ms / PULSE_MS;
        const wave = volumeWaveParts({ ...level, t }).waveA;
        expect(Object.keys(wave), `${ms}ms`).toEqual(['d']);
        const q = ease(t);
        if (q >= OUTGOING_GONE) {
          expect(wave.d, `${ms}ms`).toBe('');
          gone = true;
          continue;
        }
        const c = centre(q);
        expect(halfAngle(wave.d, c) / full, `${ms}ms`).toBeCloseTo(
          waveShrink(q),
          2
        );
        // Its 2px band: every point 1px either side of its centreline radius.
        const rs = pts(wave.d).map(([x, y]) => Math.hypot(x - c[0], y - c[1]));
        expect(Math.max(...rs) - Math.min(...rs), `${ms}ms`).toBeCloseTo(2, 2);
      }
      expect(gone).toBe(true);
    }
  );

  it.each([
    ['VolumeUp', VolumeUpSpec],
    ['VolumeUpFilled', VolumeUpFilledSpec],
    ['VolumeDown', VolumeDownSpec],
    ['VolumeDownFilled', VolumeDownFilledSpec],
  ] as const)(
    '%s: 240ms, rests at both ends, inside the box every frame, nothing faded',
    (_, spec) => {
      const act = spec.action!;
      expect(act.duration).toBeCloseTo(PULSE_MS / 1000, 9);
      expect(act.description).toMatch(/shrinks to nothing/);
      expect(act.description).not.toMatch(/fad/);
      for (const size of SIZES) {
        expect(act.geo({ h: 0, a: 0 }, size)).toEqual(spec.geo({ h: 0 }, size));
        expect(act.geo({ h: 0, a: 1 }, size)).toEqual(spec.geo({ h: 0 }, size));
        expect(act.geo({ h: 1, a: 1 }, size)).toEqual(spec.geo({ h: 1 }, size));
        for (let i = 1; i < 48; i++) {
          const f = act.geo({ h: 0, a: i / 48 }, size);
          expect(inBox(f), `a=${i / 48} @${size}`).toBe(true);
          for (const s of Object.values(f))
            expect(s.opacity, `a=${i / 48}`).toBeUndefined();
        }
      }
    }
  );

  it('the level toggle and Volume mute paint no opacity at any level or step (nothing fades)', () => {
    for (const s of ['mute', 'quiet', 'loud'] as const) {
      for (const h of [0, 0.5, 1])
        for (const v of Object.values(
          VolumeLevelToggleSpec.pick({}).geo({ h, ...volumeRest(s) })
        ))
          expect(v.opacity).toBeUndefined();
    }
    for (const v of Object.values(VolumeMute.geo({ h: 1 })))
      expect(v.opacity).toBeUndefined();
  });
});

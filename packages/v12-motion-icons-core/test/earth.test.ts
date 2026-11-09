/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Earth's action (icons/toggle/stateFillToggles.ts, "Earth's hover and
 * action"): the globe turns once, on Earth and Earth filled; its land is
 * a flat world map wrapped round the sphere (icons/toggle/earthGlobe.ts).
 *
 *  - Rest: both ends of the turn draw the hover geometry exactly, at rest
 *    and mid-hover, at every size; a full turn's last frames come round onto
 *    the rest drawing, and its first leave it, with no jump (on a raster).
 *  - The 36×36 box at every sampled frame, and on the controller's clock
 *    started mid-hover.
 *  - Constant weight: the outline's walls, measured on a raster, hold at the
 *    rest drawing's 2px through the turn; the filled drawing is the outline's
 *    exact ink (rim and coasts) with the land filled in.
 *  - 16px: no piece of land ink (apart from the rim) smaller than 1px² at
 *    16px (4 units²), the size of Carbon's own islands, at any sampled frame.
 *  - No snapping: land only slides in and out from under the rim. Sampled
 *    every 0.25° of the turn, the land's ink area never steps by more than
 *    2.5 units² (a piece popping in or out).
 *  - The pass: 1000ms, no loop (`loop` plays one pass), and
 *    back to rest; hover blocked while it plays and held at rest after it.
 *  - The map: it wraps round seamlessly at ±180° (the far side at rest is
 *    open Pacific, and a turn on draws the same globe); its straight runs sit
 *    on the pixel grid at rest and at the hover's peak.
 */
import { afterEach, describe, expect, it } from 'vitest';
import {
  actionPlayerOf,
  easeFn,
  FrameController,
  fromHover,
  manualScheduler,
  setScheduler,
  type HoverIconSpec,
  type Shapes,
} from '../src/engine';
import { pathPoints } from '../src/geometry';
import {
  EARTH_MAP,
  MAP_TURN,
  toDisc,
  toStrip,
} from '../src/icons/toggle/earthGlobe';
import {
  EARTH_FACE,
  EARTH_HOVER_TURN,
  EARTH_RIM,
  EARTH_TURN,
  EarthFilledSpec,
  EarthSpec,
  earthTurnArt,
} from '../src/icons/toggle/stateFillToggles';
import { outsideBox, weight } from './actionInk';

afterEach(() => setScheduler(null));
const SIZES = [16, 20, 24, 32];
const FRAME = 1000 / 60;
const SPECS: [string, HoverIconSpec, 0 | 1][] = [
  ['Earth', EarthSpec, 0],
  ['Earth filled', EarthFilledSpec, 1],
];
/** Every 60Hz frame of a pass, eased as the player eases it: [ms, a]. */
function passFrames(spec: HoverIconSpec): [number, number][] {
  const act = spec.action!;
  const ease = easeFn(act.ease ?? 'linear');
  const ms = act.duration * 1000;
  return Array.from({ length: Math.ceil(ms / FRAME) + 1 }, (_, i) => [
    i * FRAME,
    ease(Math.min(1, (i * FRAME) / ms)),
  ]);
}

/** A drawing's ink on a grid of `step` (nonzero), as cells. */
function raster(d: string, step = 0.125) {
  const polys = d
    .split(/(?=M)/)
    .filter((s) => s.trim())
    .map((s) => pathPoints(s, 0.1));
  const N = Math.round(36 / step);
  const ink = new Uint8Array(N * N);
  for (let j = 0; j < N; j++) {
    const y = -2 + (j + 0.5) * step;
    const xs: [number, number][] = [];
    for (const p of polys) {
      for (let i = 0; i < p.length; i++) {
        const [a, b] = [p[i], p[(i + 1) % p.length]];
        if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) {
          xs.push([
            a[0] + ((y - a[1]) / (b[1] - a[1])) * (b[0] - a[0]),
            b[1] > a[1] ? 1 : -1,
          ]);
        }
      }
    }
    xs.sort((p, q) => p[0] - q[0]);
    let wind = 0;
    for (let i = 0; i < xs.length - 1; i++) {
      wind += xs[i][1];
      if (!wind) {
        continue;
      }
      for (
        let c = Math.max(0, Math.ceil((xs[i][0] + 2) / step - 0.5));
        c <= Math.min(N - 1, Math.floor((xs[i + 1][0] + 2) / step - 0.5));
        c++
      ) {
        ink[j * N + c] = 1;
      }
    }
  }
  return {
    ink,
    N,
    step,
    at: (c: number, j: number): [number, number] => [
      -2 + (c + 0.5) * step,
      -2 + (j + 0.5) * step,
    ],
  };
}
const d = (s: Shapes) => String(s.earth.d);
/** Units² of ink in one drawing and not the other. */
function xor(a: string, b: string): number {
  const [ra, rb] = [raster(a), raster(b)];
  let n = 0;
  for (let i = 0; i < ra.ink.length; i++) {
    if (ra.ink[i] !== rb.ink[i]) {
      n++;
    }
  }
  return n * ra.step * ra.step;
}
/** A drawing's ink area over the disc's rows (nonzero), by scanlines 0.05 apart, in units². */
function inkArea(drawing: string, step = 0.05): number {
  const polys = drawing
    .split(/(?=M)/)
    .filter((s) => s.trim())
    .map((s) => pathPoints(s, 0.1));
  let n = 0;
  for (let y = 3 + step / 2; y < 29; y += step) {
    const xs: [number, number][] = [];
    for (const p of polys) {
      for (let i = 0; i < p.length; i++) {
        const [a, b] = [p[i], p[(i + 1) % p.length]];
        if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) {
          xs.push([
            a[0] + ((y - a[1]) / (b[1] - a[1])) * (b[0] - a[0]),
            b[1] > a[1] ? 1 : -1,
          ]);
        }
      }
    }
    xs.sort((p, q) => p[0] - q[0]);
    let wind = 0;
    for (let i = 0; i < xs.length - 1; i++) {
      wind += xs[i][1];
      if (wind) {
        n += xs[i + 1][0] - xs[i][0];
      }
    }
  }
  return n * step;
}
/** The pieces of ink not joined to the rim (islands, and land cut off from the rim), their areas in units². */
function islands(drawing: string): number[] {
  const { ink, N, step } = raster(drawing);
  const seen = new Uint8Array(N * N);
  const fill = (i: number) => {
    let n = 0;
    const stack = [i];
    seen[i] = 1;
    while (stack.length) {
      const k = stack.pop()!;
      n++;
      for (const m of [
        k - 1,
        k + 1,
        k - N,
        k + N,
        k - N - 1,
        k - N + 1,
        k + N - 1,
        k + N + 1,
      ]) {
        if (
          m < 0 ||
          m >= ink.length ||
          !ink[m] ||
          seen[m] ||
          Math.abs((m % N) - (k % N)) > 1
        ) {
          continue;
        }
        seen[m] = 1;
        stack.push(m);
      }
    }
    return n * step * step;
  };
  // The rim (and all joined to it): from its leftmost cell on the middle row.
  const mid = Math.floor(N / 2) * N;
  fill(mid + ink.subarray(mid, mid + N).indexOf(1));
  const out: number[] = [];
  for (let i = 0; i < ink.length; i++) {
    if (!ink[i] || seen[i]) {
      continue;
    }
    const a = fill(i);
    out.push(a);
    if (a < 3.9) {
      (islands as { at?: string }).at =
        `${(-2 + ((i % N) + 0.5) * step).toFixed(2)},${(-2 + (Math.floor(i / N) + 0.5) * step).toFixed(2)}`;
    }
  }
  return out;
}

describe.each(SPECS)('%s', (name, spec, p) => {
  const act = spec.action!;
  const frames = passFrames(spec);

  it('has its action: a description, the pass (1000ms), no loop, no cycle', () => {
    expect(act.description.length).toBeGreaterThan(40);
    expect(act.duration).toBe(EARTH_TURN);
    expect(act.loops).toBe(false);
    expect(act.cycle).toBeUndefined();
  });

  it('rests at both ends on the hover geometry, exactly, at rest and mid-hover, with its keys throughout', () => {
    for (const size of SIZES) {
      for (const h of [0, 0.5, 1]) {
        const rest = spec.geo({ h }, size);
        expect(act.geo({ h, a: 0 }, size), `a=0 h=${h} @${size}`).toEqual(rest);
        expect(act.geo({ h, a: 1 }, size), `a=1 h=${h} @${size}`).toEqual(rest);
      }
    }
    for (const [, a] of frames) {
      expect(Object.keys(act.geo({ h: 0, a }))).toEqual(['earth']);
    }
  });

  it('leaves the rest and comes back to it with no jump: the turn a hair from either end is the rest drawing (on a raster), at rest and mid-hover', () => {
    for (const h of [0, 0.5, 1]) {
      const rest = d(spec.geo({ h }));
      // The rest is the turn at 0: a hair from it, the same ink but for a raster cell or two of edge.
      expect(
        xor(rest, d(act.geo({ h, a: 1e-7 }))),
        `start h=${h}`
      ).toBeLessThan(0.5);
      expect(
        xor(rest, d(act.geo({ h, a: 1 - 1e-7 }))),
        `end h=${h}`
      ).toBeLessThan(0.5);
    }
  });

  it('keeps every frame inside the 36×36 box: a pass from rest, and one started mid-hover on the controller’s clock', async () => {
    for (const [, a] of frames) {
      expect(outsideBox(act.geo({ h: 0, a })), `a=${a}`).toBeUndefined();
    }
    const clock = manualScheduler();
    setScheduler(clock);
    const painted: Shapes[] = [];
    const c = new FrameController(fromHover(spec), (s) => painted.push(s), 32);
    void c.hoverTo(1);
    for (let t = 0; t < 300; t += FRAME) {
      clock.advance(FRAME);
    }
    void actionPlayerOf(c)!.trigger();
    for (let t = 0; t < act.duration * 1000 + 100; t += FRAME) {
      clock.advance(FRAME);
      await Promise.resolve();
    }
    c.destroy();
    expect(painted.length).toBeGreaterThan(40);
    painted.forEach((f, i) =>
      expect(outsideBox(f), `controller frame ${i}`).toBeUndefined()
    );
  });

  it('keeps constant weight: the walls hold at 2px through the turn; filled is the outline’s ink, filled in', () => {
    const outline = p
      ? SPECS.find(([n]) => n === name.replace('Earth filled', 'Earth'))![1]
          .action!
      : act;
    const rest = weight({ d: d(outline.geo({ h: 0, a: 1e-4 })) }).median;
    expect(rest).toBeCloseTo(1, 1);
    for (const [ms, a] of frames.filter((_, i) => i % 4 === 2)) {
      const line = d(outline.geo({ h: 0, a }));
      const w = weight({ d: line });
      expect(
        Math.abs(w.median - rest),
        `${name} walls ${w.median.toFixed(3)} (rest ${rest.toFixed(3)}) at ${ms.toFixed(0)}ms`
      ).toBeLessThan(0.06);
      if (p) {
        expect(
          d(act.geo({ h: 0, a })).startsWith(line),
          `filled at ${ms.toFixed(0)}ms`
        ).toBe(true);
      }
    }
  });

  it('at 16px no piece of land on its own is smaller than 1px² (4 units², Carbon’s 2px islands), at any frame', () => {
    for (const [ms, a] of frames) {
      const pieces = islands(d(act.geo({ h: 0, a }, 16)));
      // 3.9: a 2px island on a 0.125 raster.
      expect(
        pieces.filter((x) => x < 3.9),
        `${name} at ${ms.toFixed(0)}ms: ${pieces.map((x) => x.toFixed(2)).join(' ')} at ${(islands as { at?: string }).at}`
      ).toEqual([]);
    }
  });

  it('plays one pass and rests; `loop` plays one pass too', async () => {
    for (const loop of [false, true]) {
      const clock = manualScheduler();
      setScheduler(clock);
      const painted: Shapes[] = [];
      const c = new FrameController(
        fromHover(spec),
        (s) => painted.push(s),
        32
      );
      const t = actionPlayerOf(c)!;
      let done: boolean | undefined;
      void t.trigger({ loop }).then((x) => (done = x));
      for (let ms = 0; ms < act.duration * 1000 - 40; ms += FRAME) {
        clock.advance(FRAME);
        await Promise.resolve();
      }
      expect(t.acting, 'still turning just before the end').toBe(true);
      for (let ms = 0; ms < 120; ms += FRAME) {
        clock.advance(FRAME);
        for (let i = 0; i < 4; i++) {
          await Promise.resolve();
        }
      }
      expect(done).toBe(true);
      expect(t.acting).toBe(false);
      expect(painted.at(-1)).toEqual(spec.geo({ h: 0 }, 32));
      expect(
        new Set(painted.map((s) => JSON.stringify(s))).size
      ).toBeGreaterThan(30);
      c.destroy();
      setScheduler(null);
    }
  });

  it('blocks the hover while it turns, and holds at rest after it until the pointer leaves and comes back', async () => {
    const clock = manualScheduler();
    setScheduler(clock);
    const step = async (n = 1) => {
      for (let i = 0; i < n; i++) {
        clock.advance(FRAME);
        for (let k = 0; k < 6; k++) {
          await Promise.resolve();
        }
      }
    };
    const [pa, pb]: Shapes[][] = [[], []];
    const a = new FrameController(fromHover(spec), (s) => pa.push(s), 32);
    const b = new FrameController(fromHover(spec), (s) => pb.push(s), 32);
    const [ta, tb] = [actionPlayerOf(a)!, actionPlayerOf(b)!];
    void ta.trigger();
    void tb.trigger();
    for (let f = 0; ta.acting; f++) {
      if (f === 3) {
        void a.hoverTo(1);
      }
      if (f === 9) {
        void a.hoverTo(0);
      }
      await step();
      if (ta.acting) {
        expect(JSON.stringify(a.shapes()), `frame ${f}`).toBe(
          JSON.stringify(b.shapes())
        );
      }
    }
    // Held from the trigger: at rest after it, until it leaves and comes back.
    void a.hoverTo(1);
    await step(20);
    expect(a.frame.h).toBe(1);
    void ta.trigger();
    while (ta.acting) {
      await step();
    }
    await step(30);
    expect(a.frame.h, 'held at rest: no replay').toBe(0);
    void a.hoverTo(0);
    await step(5);
    void a.hoverTo(1);
    await step(20);
    expect(a.frame.h, 'left and came back: it hovers').toBe(1);
    a.destroy();
    b.destroy();
  });
});

describe('the turn', () => {
  it('a full turn draws the rest at 0 and 2π, on a raster, and the far face half way', () => {
    const rest = d(EarthSpec.geo({ h: 0 }));
    expect(earthTurnArt(0, 0).R).toBe(EARTH_RIM);
    // The globe drawn at 0 and at 2π is the rest drawing (a hair either side: a raster cell or two of edge).
    const at = (theta: number) =>
      d(EarthSpec.action!.geo({ h: 0, a: theta / (2 * Math.PI) }));
    expect(xor(rest, at(1e-6))).toBeLessThan(0.5);
    expect(xor(rest, at(2 * Math.PI - 1e-6))).toBeLessThan(0.5);
    // Half way the far face shows: a different drawing.
    expect(xor(rest, at(Math.PI))).toBeGreaterThan(100);
  });

  it('no snapping: every 0.25° of the turn the land’s ink area changes by under 2.5 units² (it slides in and out under the rim)', () => {
    for (const spec of [EarthSpec, EarthFilledSpec]) {
      let prev = inkArea(d(spec.geo({ h: 0 })));
      for (let deg = 0.25; deg <= 360; deg += 0.25) {
        const now = inkArea(d(spec.action!.geo({ h: 0, a: deg / 360 })));
        expect(Math.abs(now - prev), `${spec.name} at ${deg}°`).toBeLessThan(
          2.5
        );
        prev = now;
      }
    }
  });

  it('the hover turns the globe EARTH_HOVER_TURN (the face’s centre 4px, as the old pan) and grows the rim 0.5px, smoothly from rest', () => {
    expect(14 * Math.sin(EARTH_HOVER_TURN)).toBeCloseTo(4, 9);
    expect((EARTH_HOVER_TURN * 180) / Math.PI).toBeCloseTo(16.6, 1);
    for (const spec of [EarthSpec, EarthFilledSpec]) {
      // Hovered, it is the turn's own drawing at that angle (the action starting from the hover draws the same).
      expect(spec.geo({ h: 1 })).toEqual(spec.action!.geo({ h: 1, a: 0 }));
      expect(earthTurnArt(EARTH_HOVER_TURN, 1).R).toBe(EARTH_RIM + 0.5);
      // From rest, a hair of hover is the rest drawing, and every 1% of hover after it steps the land's ink by under
      // 2.5 units² (the hover out is the same drawings in reverse).
      expect(xor(d(spec.geo({ h: 0 })), d(spec.geo({ h: 1e-7 })))).toBeLessThan(
        0.5
      );
      let prev = inkArea(d(spec.geo({ h: 0.01 })));
      for (let h = 0.02; h <= 1 + 1e-9; h += 0.01) {
        const now = inkArea(d(spec.geo({ h })));
        expect(
          Math.abs(now - prev),
          `${spec.name} hover ${h.toFixed(2)}`
        ).toBeLessThan(2.5);
        prev = now;
      }
    }
  });
});

describe('the map', () => {
  const xs = EARTH_MAP.flat().map(([x]) => x);
  const [west, east] = [Math.min(...xs), Math.max(...xs)];
  /** The globe turned by θ at rest, as one path. */
  const art = (theta: number) => {
    const { stroke, inside } = earthTurnArt(theta, 0);
    return [...stroke, ...inside]
      .map((q) => `M${q.map(([x, y]) => `${x} ${y}`).join('L')}Z`)
      .join('');
  };

  it('wraps round seamlessly at ±180°: a turn is 2π·14 map px, the map spans less, its edges meet in open Pacific, and a turn on draws the same globe', () => {
    expect(MAP_TURN).toBeCloseTo(2 * Math.PI * 14, 12);
    // His drawing spans 73 map px of the 88: the rest is Pacific, from Australia's east to the Americas' west a turn on.
    expect(east - west).toBeGreaterThan(70);
    expect(west + MAP_TURN - east).toBeGreaterThan(15);
    // The seam, where his map's two edges meet (±180° from its centre), is the middle of that sea.
    const seam = (east + west + MAP_TURN) / 2;
    const facing = (EARTH_FACE.centre - (seam - MAP_TURN)) / 14;
    // A map point and the same point a turn on are one place on the globe: one strip point, drawn a turn apart.
    for (const [x, y] of EARTH_MAP.flat()) {
      const [a, b] = [
        toStrip([x, y], EARTH_FACE),
        toStrip([x + MAP_TURN, y], EARTH_FACE),
      ];
      expect(b[0] - a[0]).toBeCloseTo(2 * Math.PI, 12);
      expect(b[1]).toBe(a[1]);
      expect(toDisc([b[0] - 2 * Math.PI, b[1]])[0]).toBeCloseTo(
        toDisc(a)[0],
        9
      );
    }
    // Turned a whole turn either way, the globe draws the same: at rest, and with the seam facing the viewer (at
    // 119° of the turn) and either side of it (the turn's 0.25° steps across it are in "no snapping" above).
    for (const theta of [
      0,
      1,
      facing - 0.2,
      facing - 0.05,
      facing,
      facing + 0.05,
      facing + 0.2,
      Math.PI,
      5,
    ]) {
      const deg = ((theta * 180) / Math.PI).toFixed(1);
      expect(
        xor(art(theta), art(theta + 2 * Math.PI)),
        `${deg}° + a turn`
      ).toBeLessThan(0.05);
      expect(
        xor(art(theta), art(theta - 2 * Math.PI)),
        `${deg}° − a turn`
      ).toBeLessThan(0.05);
    }
  });

  it('sits on the pixel grid at rest and at the hover’s peak: its east–west runs on whole rows, Florida and Africa’s and South America’s west coasts on whole columns', () => {
    const rowOf = (y: number) => toStrip([0, y], EARTH_FACE)[1];
    // Labrador to Hudson Bay, Iberia: 9; the Mediterranean 7 and 13; the Caribbean coast, Australia's north: 19
    // (odd rows: whole pixels at 32px and 16px); the Gulf of Mexico: 14 (whole pixels at 32px). Rows never change as
    // the globe turns, so they hold at the hover's peak and all through the turn.
    const runs: [number, number][] = [
      [12.0696, 9],
      [12.0696, 9],
      [9.6249, 7],
      [16.3766, 13],
      [22.4234, 19],
      [17.3931, 14],
    ];
    for (const [y, row] of runs) {
      expect(rowOf(y)).toBeCloseTo(row, 3);
    }
    // Florida (map x 49.6732, rows 14–16.7) on column 13 at rest and 17 at the hover's peak; Africa's west coast (57.8344,
    // rows 14.6–19.8) on 21 at rest; South America's west coast (44.8994, rows 19–22) on 9.
    const col = (x: number, y: number, turn = 0) =>
      toDisc([toStrip([x, y], EARTH_FACE)[0] + turn, rowOf(y)])[0];
    expect(Math.abs(col(49.6732, 18.75) - 13)).toBeLessThan(0.1);
    expect(Math.abs(col(49.6732, 18.75, EARTH_HOVER_TURN) - 17)).toBeLessThan(
      0.1
    );
    expect(Math.abs(col(57.8344, 20.65) - 21)).toBeLessThan(0.1);
    expect(Math.abs(col(44.8994, 24.04) - 9)).toBeLessThan(0.1);
  });
});

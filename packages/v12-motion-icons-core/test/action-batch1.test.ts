/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Actions, batch 1 (branch icons/actions-batch1): Download, Upload, Save,
 * Share, Add, Launch, Undo, Redo, Restart, Printer, Email, Rocket.
 *
 * Geometry, at every size and through every frame of a pass (and, for the
 * periodic ones, across periods):
 *  - rest at both ends: a = 0 and a = 1 draw the hover geometry at rest (so
 *    Carbon's drawing, which the hover suites prove), and started mid-hover
 *    it draws the hover and lands on it;
 *  - the same shape keys as the hover geometry (bindings paint by key);
 *  - the 36×36 box: no ink outside −2…34 (strokes by half their width,
 *    transforms applied), from rest and from mid-hover on the controller's
 *    clock;
 *  - constant weight: every part's walls are measured on a raster (the
 *    median of the ridge of its distance map: half the wall's width) and
 *    hold at the rest drawing's, as does its thickest point (a join), unless
 *    a cut at the box or at a part's own edge has left only a sliver of it;
 *  - a periodic action (a loop at a steady speed) draws the same at a and
 *    a + 1.
 * The controller: one pass and rest; loop / stop, as passes or as a cycle.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  FrameController,
  actionPlayerOf,
  fromHover,
  manualScheduler,
  setScheduler,
  type ActionSpec,
  type HoverIconSpec,
  type Shapes,
} from '../src/engine';
import { covers, outsideBox, weight, type Weight } from './actionInk';
import { pathPoints } from '../src/geometry';
import { OUT_BACK, OUT_SPLIT } from '../src/actionGeo';
import { motionTokens } from '../src/tokens';
import {
  DownloadSpec,
  ShareSpec,
  UploadSpec,
} from '../src/icons/operations/transfer';
import { SaveSpec } from '../src/icons/formatting/editing';
import { AddSpec } from '../src/icons/operations/signs';
import { LaunchSpec } from '../src/icons/operations/Launch';
import { UndoSpec } from '../src/icons/status/carbonInternals';
import { RedoSpec, RestartSpec } from '../src/icons/operations/opsRotate';
import {
  EmailSpec,
  PrinterSpec,
  RocketSpec,
} from '../src/icons/assorted/objectsA';

/** The batch: [name, its plain spec]. */
export const BATCH1: [string, HoverIconSpec][] = [
  ['Download', DownloadSpec],
  ['Upload', UploadSpec],
  ['Save', SaveSpec],
  ['Share', ShareSpec],
  ['Add', AddSpec],
  ['Launch', LaunchSpec],
  ['Undo', UndoSpec],
  ['Redo', RedoSpec],
  ['Restart', RestartSpec],
  ['Printer', PrinterSpec],
  ['Email', EmailSpec],
  ['Rocket', RocketSpec],
];
const SIZES = [16, 20, 24, 32];
const A = Array.from({ length: 121 }, (_, i) => i / 120);

it('the weight measure: a 2px wall reads 1, a 1.8px one 0.9 (a 10% scale shows)', () => {
  expect(weight({ d: 'M0 0H12V2H0Z' }).median).toBeCloseTo(1, 1);
  expect(weight({ d: 'M0 0H12V1.8H0Z' }).median).toBeCloseTo(0.9, 1);
  const ring = (r: number, w: number) =>
    weight({
      d: `M${16 - r} 16A${r} ${r} 0 1 1 ${16 + r} 16A${r} ${r} 0 1 1 ${16 - r} 16ZM${16 - r + w} 16A${r - w} ${r - w} 0 1 1 ${16 + r - w} 16A${r - w} ${r - w} 0 1 1 ${16 - r + w} 16Z`,
      fillRule: 'evenodd',
    });
  expect(Math.abs(ring(10, 2).median - 1)).toBeLessThan(0.03);
  expect(ring(10, 2).median - ring(9, 1.8).median).toBeGreaterThan(0.06);
});

describe.each(BATCH1)('%s action', (name, spec) => {
  const act = spec.action as ActionSpec;
  it('has an action with a description and a short pass (at least moderate-02 or the out-and-back, fast-01 out and moderate-01 back; at most 320ms, Rocket 390ms)', () => {
    expect(act).toBeTruthy();
    expect(act.description.length).toBeGreaterThan(40);
    expect(act.duration).toBeGreaterThanOrEqual(
      Math.min(OUT_BACK, motionTokens.duration.moderate02 / 1000) - 1e-9
    );
    expect(act.duration).toBeLessThanOrEqual(
      ({ Rocket: 0.39 } as Record<string, number>)[name] ?? 0.32 + 1e-9
    );
  });

  it('rests at both ends, with the hover geometry’s keys throughout', () => {
    for (const size of SIZES) {
      const rest = spec.geo({ h: 0 }, size);
      expect(act.geo({ h: 0, a: 0 }, size), `a=0 @${size}`).toEqual(rest);
      expect(act.geo({ h: 0, a: 1 }, size), `a=1 @${size}`).toEqual(rest);
      for (const a of A) {
        expect(
          Object.keys(act.geo({ h: 0, a }, size)),
          `keys a=${a} @${size}`
        ).toEqual(Object.keys(rest));
      }
      expect(act.geo({ h: 1, a: 0 }, size)).toEqual(spec.geo({ h: 1 }, size));
      expect(act.geo({ h: 1, a: 1 }, size)).toEqual(spec.geo({ h: 1 }, size));
    }
  });

  it('keeps every frame inside the 36×36 box: a pass from rest, and one started mid-hover on the controller’s clock', async () => {
    for (const size of SIZES) {
      for (const a of A) {
        expect(
          outsideBox(act.geo({ h: 0, a }, size)),
          `a=${a} @${size}`
        ).toBeUndefined();
      }
      const clock = manualScheduler();
      setScheduler(clock);
      const frames: Shapes[] = [];
      const c = new FrameController(
        fromHover(spec),
        (s) => frames.push(s),
        size
      );
      void c.hoverTo(1);
      for (let t = 0; t < 300; t += 1000 / 60) {
        clock.advance(1000 / 60);
      }
      void actionPlayerOf(c)!.trigger();
      for (let t = 0; t < act.duration * 1000 + 100; t += 1000 / 60) {
        clock.advance(1000 / 60);
        await Promise.resolve();
      }
      setScheduler(null);
      c.destroy();
      expect(frames.length).toBeGreaterThan(10);
      frames.forEach((f, i) =>
        expect(outsideBox(f), `controller frame ${i} @${size}`).toBeUndefined()
      );
    }
  });

  it('keeps constant weight: each part’s walls hold at the rest drawing’s (measured on a raster), but where a cut leaves a sliver', () => {
    for (const size of [16, 32]) {
      const rest = act.geo({ h: 0, a: 0 }, size);
      /**
       * A part's walls where they show as its own: not within 1.5px of the box's edge (where a part flying out is
       * cut, its walls ending at the edge), nor under another part's ink (where it runs into a wall of the union).
       */
      const measure = (frame: Shapes, k: string) =>
        weight(
          frame[k],
          (p) =>
            p[0] < -0.5 ||
            p[0] > 32.5 ||
            p[1] < -0.5 ||
            p[1] > 32.5 ||
            Object.keys(frame).some((o) => o !== k && covers(frame[o], p))
        );
      const w0: Record<string, Weight> = {};
      // The reference: the action a hair in (the rest drawing, but drawn as the action draws it: Launch fills its strokes).
      const ref = act.geo({ h: 0, a: 1e-4 }, size);
      for (const k in rest) {
        w0[k] = measure(ref, k);
      }
      // The thickest join may be what the hover draws (Rocket's roll, played again in its action).
      const hoverMax: Record<string, number> = {};
      for (const k in rest) {
        hoverMax[k] = Math.max(
          ...[0.2, 0.4, 0.6, 0.8, 1]
            .map((hh) => measure(spec.geo({ h: hh }, size), k).max)
            .filter(Number.isFinite),
          -Infinity
        );
      }
      for (const a of A.filter((_, i) => i % 3 === 0)) {
        const frame = act.geo({ h: 0, a }, size);
        for (const [k, attrs] of Object.entries(frame)) {
          expect(attrs.strokeWidth, `${k} stroke`).toBe(rest[k].strokeWidth);
          if (attrs.transform) {
            expect(String(attrs.transform)).toMatch(
              /^(translate\([^)]*\) ?)?(rotate\([^)]*\))?$/
            );
          }
          if (attrs.d === rest[k].d && attrs.transform === rest[k].transform) {
            continue;
          }
          const w = measure(frame, k);
          // Mostly cut away (flying out, or taken in): what's left can be a sliver at the edge.
          if (
            (Number.isFinite(w0[k].area) && w.area < 0.5 * w0[k].area) ||
            Number.isNaN(w.median)
          ) {
            continue;
          } // (NaN: none of it shows as its own)
          // A part none of which shows as its own at rest (Rocket's walls, under its body until the roll draws them out): 2px.
          const ref = Number.isNaN(w0[k].median) ? 1 : w0[k].median;
          expect(
            Math.abs(w.median - ref),
            `${name} ${k} walls ${w.median.toFixed(3)} (rest ${ref.toFixed(3)}) a=${a.toFixed(3)} @${size}`
          ).toBeLessThan(0.06);
          // The thickest point (a join); a stroked rest drawing's is its band's (NaN: not measured).
          // (Share's links had 0.12 while they ran on the standard expressive curve, where a join measured up to 0.11 over
          // its rest around a = 0.35; on the productive standard they stay under 0.08 again, as every other part does.)
          const slack = 0.08;
          if (Number.isFinite(w0[k].max)) {
            expect(
              w.max,
              `${name} ${k} thickest ${w.max.toFixed(3)} (rest ${w0[k].max.toFixed(3)}) a=${a.toFixed(3)} @${size}`
            ).toBeLessThan(Math.max(w0[k].max, hoverMax[k]) + slack);
          }
        }
      }
    }
  });

  it('Download, Upload, Printer and Restart do not loop; the rest do', () => {
    expect(act.loops === false).toBe(
      ['Download', 'Upload', 'Printer', 'Restart'].includes(name)
    );
  });

  if (act?.cycle) {
    it('is periodic: a loop draws the same at a and a + 1, and every whole a is the rest drawing', () => {
      for (const a of [0.1, 0.37, 0.5, 0.92]) {
        expect(act.geo({ h: 0, a: a + 1 }, 32)).toEqual(
          act.geo({ h: 0, a }, 32)
        );
      }
      for (const a of [2, 3]) {
        expect(act.geo({ h: 0, a }, 32)).toEqual(spec.geo({ h: 0 }, 32));
      }
    });
  }
});

describe('the controller', () => {
  let clock: ReturnType<typeof manualScheduler>;
  beforeEach(() => {
    clock = manualScheduler();
    setScheduler(clock);
  });
  afterEach(() => setScheduler(null));
  const run = async (ms: number) => {
    for (let t = 0; t < ms; t += 1000 / 60) {
      clock.advance(1000 / 60);
      for (let i = 0; i < 4; i++) {
        await Promise.resolve();
      }
    }
  };
  const make = (spec: HoverIconSpec) => {
    const painted: Shapes[] = [];
    const c = new FrameController(fromHover(spec), (s) => painted.push(s), 32);
    return { c, t: actionPlayerOf(c)!, painted };
  };

  it.each(BATCH1)(
    '%s: one pass, then rest; the promise resolves true',
    async (_, spec) => {
      const { t, painted } = make(spec);
      let done: boolean | undefined;
      void t.trigger().then((d) => (done = d));
      await run(spec.action!.duration * 1000 + 80);
      expect(done).toBe(true);
      expect(t.acting).toBe(false);
      expect(painted.at(-1)).toEqual(spec.geo({ h: 0 }, 32));
      expect(
        new Set(painted.map((s) => JSON.stringify(s))).size
      ).toBeGreaterThan(8);
    }
  );

  it.each(BATCH1)(
    '%s: loops until stop() and lands at rest; one that does not loop (loops: false) plays one pass',
    async (_, spec) => {
      const { c, t } = make(spec);
      let done = false;
      void t.trigger({ loop: true }).then(() => (done = true));
      if (spec.action!.loops === false) {
        await run(spec.action!.duration * 1000 + 80);
        expect(done).toBe(true);
        expect(t.acting).toBe(false);
        expect(c.frame.a).toBe(0);
        return;
      }
      await run(1500);
      expect(t.acting).toBe(true);
      t.stop();
      await run(2200);
      expect(done).toBe(true);
      expect(t.acting).toBe(false);
      expect(c.frame.a).toBe(0);
    }
  );
});

describe('reach, travel and the slot', () => {
  const extent = (d: unknown) => {
    const pts = pathPoints(String(d), 0.1);
    return {
      x0: Math.min(...pts.map((p) => p[0])),
      x1: Math.max(...pts.map((p) => p[0])),
      y0: Math.min(...pts.map((p) => p[1])),
      y1: Math.max(...pts.map((p) => p[1])),
    };
  };
  const peak = (spec: HoverIconSpec) =>
    spec.action!.geo({ h: 0, a: OUT_SPLIT });

  it('the out-and-back actions (fast-01 out, moderate-01 back) reach the edge of the 36×36 box at their peak, and not past it; Add half way to the 32 frame', () => {
    expect(OUT_BACK).toBeCloseTo(
      (motionTokens.duration.fast01 + motionTokens.duration.moderate01) / 1000,
      6
    );
    const add = extent(peak(AddSpec).sign.d);
    for (const [v, want] of [
      [add.x0, 4],
      [add.x1, 28],
      [add.y0, 4],
      [add.y1, 28],
    ]) {
      expect(v).toBeCloseTo(want, 3);
    }
    // Launch's head: its stroke's outer corner (1px out from its line) on the box's corner.
    const head = extent(peak(LaunchSpec).head.d);
    expect(head.x1 + 1).toBeCloseTo(34, 3);
    expect(head.y0 - 1).toBeCloseTo(-2, 3);
    expect(extent(peak(UndoSpec).arrow.d).x0).toBeCloseTo(-2, 3);
    expect(extent(peak(RedoSpec).arrow.d).x1).toBeCloseTo(34, 3);
    expect(extent(peak(RestartSpec).arrow.d).x1).toBeCloseTo(34, 3);
  });

  it('Share: the nodes travel on one circle into the next place, and the links never poke into a ring', () => {
    const act = ShareSpec.action!;
    const centres = (s: Shapes) =>
      (['source', 'top', 'bottom'] as const).map((k) => {
        const e = extent(String(s[k].d).split(/(?=M)/)[0]);
        return [(e.x0 + e.x1) / 2, (e.y0 + e.y1) / 2] as const;
      });
    for (const a of A.slice(1, -1)) {
      const f = act.geo({ h: 0, a });
      const cs = centres(f);
      // All three on the circumcircle about (17.53, 16).
      for (const [x, y] of cs) {
        expect(Math.hypot(x - 17.53125, y - 16)).toBeCloseTo(10.53125, 1);
      }
      for (const p of String(f.links.d)
        .split(/(?=M)/)
        .filter((x) => x.trim())
        .flatMap((x) => pathPoints(x, 0.1))) {
        for (const [x, y] of cs) {
          expect(Math.hypot(p[0] - x, p[1] - y), `a=${a}`).toBeGreaterThan(
            3 - 1e-3
          );
        }
      }
    }
  });

  it('Printer keeps the slot (a 2px line where the sheet’s top edge rests) while the pages move', () => {
    for (const a of [0.1, 0.5, 0.9]) {
      expect(String(PrinterSpec.action!.geo({ h: 0, a }).printer.d)).toContain(
        'M7 15'
      );
    }
  });
});

describe('order and timing', () => {
  it('Share: the top node moves first, then the bottom, then the source, 35ms apart; the links change over to the end', () => {
    const act = ShareSpec.action!;
    const centre = (s: Shapes, k: string): [number, number] => {
      const pts = pathPoints(String(s[k].d).split(/(?=M)/)[0], 0.1);
      const xs = pts.map((p) => p[0]);
      const ys = pts.map((p) => p[1]);
      return [
        (Math.min(...xs) + Math.max(...xs)) / 2,
        (Math.min(...ys) + Math.max(...ys)) / 2,
      ];
    };
    // 20ms in: only the top node has moved.
    const f = act.geo({ h: 0, a: 20 / 320 });
    expect(centre(f, 'source')).toEqual([
      expect.closeTo(7, 2),
      expect.closeTo(16, 2),
    ]);
    expect(centre(f, 'bottom')).toEqual([
      expect.closeTo(23, 2),
      expect.closeTo(25, 2),
    ]);
    expect(
      Math.hypot(centre(f, 'top')[0] - 23, centre(f, 'top')[1] - 7)
    ).toBeGreaterThan(0.05);
    // 290ms in: every node has landed (keys traded), and the links are still moving.
    const late = act.geo({ h: 0, a: 290 / 320 });
    const rest = ShareSpec.geo({ h: 0 });
    for (const k of ['source', 'top', 'bottom']) {
      expect(centre(late, k)).toEqual(
        centre(rest, k).map((v) => expect.closeTo(v, 2))
      );
    }
    // The links' ink, on a raster: it starts and ends as the rest drawing's (the dash's moving end inside a ring), and still
    // differs from it at 260ms, as the last node lands (290ms): the trim runs on with the nodes to the end.
    const area = (a: number) =>
      weight({ d: String(act.geo({ h: 0, a }).links.d) }).area;
    const restArea = weight({ d: String(rest.links.d) }).area;
    expect(area(1e-4)).toBeCloseTo(restArea, 1);
    expect(area(1 - 1e-4)).toBeCloseTo(restArea, 1);
    expect(Math.abs(area(160 / 320) - restArea)).toBeGreaterThan(0.2);
  });

  it('Rocket is 390ms: 150ms out, 240ms in', () =>
    expect(RocketSpec.action!.duration).toBeCloseTo(0.39, 9));
});

describe('the links', () => {
  it('Share’s links: the open side draws closed in the first half and the new gap opens in the second, landing on Carbon’s links', () => {
    const act = ShareSpec.action!;
    expect(act.duration).toBeCloseTo(0.32, 9);
    const rest = ShareSpec.geo({ h: 0 });
    const area = (a: number) =>
      weight({ d: String(act.geo({ h: 0, a }).links.d) }).area;
    const restArea = weight({ d: String(rest.links.d) }).area;
    // Rest at both ends (the dash's moving ends inside the rings).
    expect(area(1e-4)).toBeCloseTo(restArea, 1);
    expect(area(1 - 1e-4)).toBeCloseTo(restArea, 1);
    // Mid-lap the dash crosses the sides the links don't sit on at rest: ink right of the bottom-right node's left edge, between
    // the two right-hand nodes (the third side, x ≈ 23, y 12 to 20), shows at some point.
    const third = (a: number) => {
      const pts = String(act.geo({ h: 0, a }).links.d)
        .split(/(?=M)/)
        .filter((x) => x.trim())
        .flatMap((x) => pathPoints(x, 0.25));
      return pts.some(([x, y]) => x > 20 && y > 12 && y < 20);
    };
    expect(
      Array.from({ length: 50 }, (_, i) => (i + 0.5) / 50).some(third)
    ).toBe(true);
    expect(third(1e-4)).toBe(false);
  });
});

/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Actions (engine/action.ts): the five pilot icons' geometry and the
 * controller's timeline.
 *
 * Geometry, at every size and through every frame of a pass (and, for
 * Renew, a loop's turns):
 *  - rest at both ends: a = 0 and a = 1 draw the hover geometry at rest;
 *  - the same shape keys as the hover geometry (bindings paint by key);
 *  - the 36×36 box: no ink outside −2…34 (strokes by half their width,
 *    transforms applied);
 *  - constant weight: every part moves rigidly (its points keep their
 *    distances) unless the box cuts it; transforms only translate and
 *    rotate; stroke widths hold.
 * Controller: one pass, the hover giving way and resuming, a re-trigger
 * restarting, loop / stop (a cycle easing in and out at a steady speed), and
 * destroy cutting it; playAction's hand-off, `until` and `failed`.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  FrameController,
  actionPlayerOf,
  fromHover,
  manualScheduler,
  playAction,
  setScheduler,
  type ActionSpec,
  type ActionTail,
  type HoverIconSpec,
  type Shapes,
} from '../src/engine';
import { pathPoints, type Pt } from '../src/geometry';
import { motionTokens } from '../src/tokens';
import { CopySpec } from '../src/icons/formatting/fmtTools';
import { SendSpec } from '../src/icons/operations/opsMisc';
import { TrashCanSpec } from '../src/icons/formatting/TrashCan';
import { NotificationSpec } from '../src/icons/toggle/toggleViews';
import { RenewSpec } from '../src/icons/operations/opsRotate';

const PILOT: [string, HoverIconSpec][] = [
  ['Copy', CopySpec],
  ['Send', SendSpec],
  ['TrashCan', TrashCanSpec],
  ['Notification', NotificationSpec],
  ['Renew', RenewSpec],
];
const SIZES = [16, 20, 24, 32];
const A = Array.from({ length: 201 }, (_, i) => i / 200);

/** A transform attribute (translate / rotate only) applied to a point. */
function applyTransform(tf: string | undefined, p: Pt): Pt {
  if (!tf) {
    return p;
  }
  const ops = [...tf.matchAll(/(translate|rotate)\(([^)]*)\)/g)].map(
    (m) =>
      [
        m[1],
        m[2]
          .trim()
          .split(/[\s,]+/)
          .map(Number),
      ] as const
  );
  let q = p;
  for (const [op, v] of ops.reverse()) {
    if (op === 'translate') {
      q = [q[0] + v[0], q[1] + (v[1] ?? 0)];
    } else {
      const [deg, cx = 0, cy = 0] = v;
      const r = (deg * Math.PI) / 180;
      const [x, y] = [q[0] - cx, q[1] - cy];
      q = [
        cx + x * Math.cos(r) - y * Math.sin(r),
        cy + x * Math.sin(r) + y * Math.cos(r),
      ];
    }
  }
  return q;
}
const subpaths = (d: string) => d.split(/(?=M)/).filter((s) => s.trim());
/** A shape's ink points (path sampled; transform applied), and its stroke half-width. */
function ink(attrs: Shapes[string]): { pts: Pt[][]; pad: number } {
  const d = String(attrs.d ?? '');
  const pad =
    attrs.stroke && attrs.stroke !== 'none'
      ? Number(attrs.strokeWidth ?? 1) / 2
      : 0;
  return {
    pts: subpaths(d).map((s) =>
      pathPoints(s, 0.25).map((p) =>
        applyTransform(attrs.transform as string | undefined, p)
      )
    ),
    pad,
  };
}
const dists = (pts: Pt[]) =>
  pts.flatMap((p, i) =>
    pts.slice(i + 1).map((q) => Math.hypot(p[0] - q[0], p[1] - q[1]))
  );
/** The distance from p to a closed polyline. */
function toPoly(p: Pt, poly: Pt[]): number {
  let best = Infinity;
  for (let i = 0; i < poly.length; i++) {
    const [a, b] = [poly[i], poly[(i + 1) % poly.length]];
    const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
    const L = dx * dx + dy * dy;
    const u = L
      ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L))
      : 0;
    best = Math.min(
      best,
      Math.hypot(p[0] - a[0] - u * dx, p[1] - a[1] - u * dy)
    );
  }
  return best;
}
/**
 * A reshaped part's wall: an outline with a hole (a frame, the plane) is as
 * thick as the closest its hole comes to its outline; Copy's back page (its
 * corner, one outline) as its arms' bands.
 */
function wall(name: string, key: string, d: string): number {
  const subs = d
    .split(/(?=M)/)
    .filter((s) => s.trim())
    .map((s) => pathPoints(s, 0.1));
  if (subs.length >= 2) {
    return Math.min(
      ...subs
        .slice(1)
        .flat()
        .map((p) => toPoly(p, subs[0]))
    );
  }
  if (name === 'Copy' && key === 'back') {
    const [a, b] = d.match(/-?\d*\.?\d+/g)!.map(Number);
    return b - a;
  }
  return band(subs[0]);
}
/**
 * A band's width (one outline: a wall, a slat): the closest two of its
 * points come that are more than 3px apart along the outline.
 */
function band(outline: Pt[]): number {
  // Points every 0.25px along the outline (straight edges come as their ends only).
  const poly: Pt[] = [];
  outline.forEach((p, i) => {
    const q = outline[(i + 1) % outline.length];
    const n = Math.max(
      1,
      Math.ceil(Math.hypot(q[0] - p[0], q[1] - p[1]) / 0.25)
    );
    for (let s = 0; s < n; s++) {
      poly.push([
        p[0] + ((q[0] - p[0]) * s) / n,
        p[1] + ((q[1] - p[1]) * s) / n,
      ]);
    }
  });
  const arc = [0];
  for (let i = 1; i < poly.length; i++) {
    arc.push(
      arc[i - 1] +
        Math.hypot(poly[i][0] - poly[i - 1][0], poly[i][1] - poly[i - 1][1])
    );
  }
  const total =
    arc.at(-1)! +
    Math.hypot(poly[0][0] - poly.at(-1)![0], poly[0][1] - poly.at(-1)![1]);
  let best = Infinity;
  for (let i = 0; i < poly.length; i++) {
    for (let j = i + 1; j < poly.length; j++) {
      const along = Math.min(arc[j] - arc[i], total - (arc[j] - arc[i]));
      if (along > 3) {
        best = Math.min(
          best,
          Math.hypot(poly[i][0] - poly[j][0], poly[i][1] - poly[j][1])
        );
      }
    }
  }
  return best;
}

describe.each(PILOT)('%s action geometry', (name, spec) => {
  const act = spec.action as ActionSpec;
  it('has an action with a description and a short pass (moderate-02 to 300ms; Notification’s ring 420ms)', () => {
    expect(act).toBeTruthy();
    expect(act.description.length).toBeGreaterThan(40);
    expect(act.duration).toBeGreaterThanOrEqual(
      motionTokens.duration.moderate02 / 1000
    );
    expect(act.duration).toBeLessThanOrEqual(
      name === 'Notification' ? 0.42 : 0.3
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
      // Hovered when it starts: the action draws on the hover, and lands on it.
      expect(act.geo({ h: 1, a: 0 }, size)).toEqual(spec.geo({ h: 1 }, size));
    }
  });

  it('keeps every frame inside the 36×36 box (−2 to 34): a pass from rest, and one started mid-hover', async () => {
    const check = (frame: Shapes, rest: Shapes, what: string) => {
      for (const [k, attrs] of Object.entries(frame)) {
        // A part the action doesn't move is the rest drawing's (the hover suites bound those).
        if (attrs.d === rest[k].d && attrs.transform === rest[k].transform) {
          continue;
        }
        const { pts, pad } = ink(attrs);
        for (const [x, y] of pts.flat()) {
          expect(
            x - pad >= -2 - 1e-6 &&
              x + pad <= 34 + 1e-6 &&
              y - pad >= -2 - 1e-6 &&
              y + pad <= 34 + 1e-6,
            `${name} ${k} (${x.toFixed(3)}, ${y.toFixed(3)}) ${what}`
          ).toBe(true);
        }
      }
    };
    for (const size of SIZES) {
      const rest = spec.geo({ h: 0 }, size);
      for (const a of A) {
        check(act.geo({ h: 0, a }, size), rest, `a=${a} @${size}`);
      }
      // Mid-hover: the hover eases out (fast-02) as the action starts; every painted frame, on the controller's clock.
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
      frames.forEach((f, i) =>
        check(f, spec.geo({ h: 1 }, size), `controller frame ${i} @${size}`)
      );
    }
  });

  it('keeps constant weight: parts move rigidly or are redrawn at 2px walls (unless the box cuts them), transforms only move and turn, strokes hold', () => {
    for (const size of SIZES) {
      const rest = act.geo({ h: 0, a: 0 }, size);
      for (const a of A) {
        const frame = act.geo({ h: 0, a }, size);
        for (const [k, attrs] of Object.entries(frame)) {
          const r = rest[k];
          expect(attrs.strokeWidth, `${k} stroke`).toBe(r.strokeWidth);
          if (attrs.transform) {
            expect(String(attrs.transform)).toMatch(
              /^(translate\([^)]*\) )?rotate\([^)]*\)$/
            );
          }
          if (attrs.d === r.d) {
            continue;
          }
          // Cut by the box (or gone): its outlines end at the edge; the walls left are the same walls.
          const commands = (d: unknown) =>
            String(d ?? '').replace(/[^A-Za-z]/g, '');
          if (commands(attrs.d) !== commands(r.d)) {
            continue;
          }
          const [p, q] = [ink(attrs).pts, ink(r).pts];
          const rigid = p.every((s, i) => {
            const [da, db] = [dists(s), dists(q[i])];
            return Math.max(...da.map((v, j) => Math.abs(v - db[j]))) < 0.02;
          });
          if (rigid) {
            continue;
          }
          // Reshaped (Copy's pages shrinking, Send's wings folding): its walls are 2px, as at rest.
          const [w, w0] = [
            wall(name, k, String(attrs.d)),
            wall(name, k, String(r.d)),
          ];
          expect(
            Math.abs(w - w0),
            `${name} ${k} wall ${w.toFixed(3)} (rest ${w0.toFixed(3)}) a=${a} @${size}`
          ).toBeLessThan(0.05);
        }
      }
    }
  });
});

it('Renew turns half a turn a period (it lands on the same drawing), and looping draws the same at a and a + 1', () => {
  const act = RenewSpec.action!;
  // Half a turn every slow-02, 520ms.
  expect(act.cycle).toBe(motionTokens.duration.slow02 / 1000);
  for (const a of [0.1, 0.37, 0.5, 0.92]) {
    expect(act.geo({ h: 0, a: a + 1 })).toEqual(act.geo({ h: 0, a }));
  }
  // Just short of a half turn, each key draws the arrow that lands in its own place: the rest drawing, key for key.
  const near = act.geo({ h: 0, a: 1 - 1e-9 });
  const rest = RenewSpec.geo({ h: 0 });
  const pts = (d: unknown) => pathPoints(String(d), 0.5);
  for (const [k, other] of [
    ['a', 'a'],
    ['b', 'b'],
  ] as const) {
    const [p, q] = [pts(near[k].d), pts(rest[other].d)];
    expect(p.length).toBe(q.length);
    p.forEach((pt, i) =>
      expect(Math.hypot(pt[0] - q[i][0], pt[1] - q[i][1])).toBeLessThan(0.01)
    );
  }
});

it('Send cuts the leaving plane at the box edge, and draws nothing once it is out; its wings are folded as it flies', () => {
  const plane = (a: number) =>
    String(SendSpec.action!.geo({ h: 0, a }).plane.d);
  expect(plane(0.4)).toBe('');
  expect(plane(0.3)).not.toBe('');
  expect(plane(0.3)).not.toMatch(/A/); // flattened where cut
  // Folded: the wings span less than at rest (the tail corners in toward the spine).
  const span = (d: string) => {
    const ys = pathPoints(d.split(/(?=M)/)[0], 0.5).map((q) => q[1]);
    return Math.max(...ys) - Math.min(...ys);
  };
  expect(span(plane(0.2))).toBeLessThan(
    span(String(SendSpec.geo({ h: 0 }).plane.d)) - 4
  );
});

it('Copy follows its reference animation: the back page’s corner onto the front page’s corner at 70ms, the front page 16px at 110ms, home by 240ms', () => {
  const g = (ms: number) => CopySpec.action!.geo({ h: 0, a: ms / 240 });
  const nums = (d: unknown) =>
    String(d)
      .match(/-?\d*\.?\d+/g)!
      .map(Number);
  // The back page (its corner path: M x x+2 A… ): at 70ms its corner is at (8, 8), its arms 17 long.
  const [x, , , , , , , , , r] = nums(g(70).back.d);
  expect(x).toBeCloseTo(8, 3);
  expect(r - x).toBeCloseTo(17, 3);
  // The front page at 110ms: its top-left holds at (8, 8), its far sides at 24.
  const fp = pathPoints(String(g(110).front.d).split(/(?=M)/)[0], 0.25);
  expect(Math.min(...fp.map((q) => q[0]))).toBeCloseTo(8, 3);
  expect(Math.max(...fp.map((q) => q[0]))).toBeCloseTo(24, 3);
  // Home: the back page by 200ms, the front page by 240ms (Carbon's drawing).
  expect(g(200).back).toEqual(CopySpec.geo({ h: 0 }).back);
  expect(g(240)).toEqual(CopySpec.geo({ h: 0 }));
});

// ── The controller ────────────────────────────────────────────────────────────

describe('FrameController actions', () => {
  let clock: ReturnType<typeof manualScheduler>;
  beforeEach(() => {
    clock = manualScheduler();
    setScheduler(clock);
  });
  afterEach(() => setScheduler(null));
  const flush = async () => {
    for (let i = 0; i < 4; i++) {
      await Promise.resolve();
    }
  };
  const run = async (ms: number) => {
    for (let t = 0; t < ms; t += 1000 / 60) {
      clock.advance(1000 / 60);
      await flush();
    }
  };
  const make = (spec: HoverIconSpec) => {
    const painted: Shapes[] = [];
    const c = new FrameController(fromHover(spec), (s) => painted.push(s), 32);
    // The binding's way in: the controller's action player (none without an action).
    return { c, t: actionPlayerOf(c)!, painted };
  };

  it('plays one pass and rests; the promise resolves true', async () => {
    const { t, painted } = make(TrashCanSpec);
    let done: boolean | undefined;
    void t.trigger().then((d) => (done = d));
    expect(t.acting).toBe(true);
    await run(200);
    expect(done).toBeUndefined();
    await run(300);
    expect(done).toBe(true);
    expect(t.acting).toBe(false);
    expect(painted.at(-1)).toEqual(TrashCanSpec.geo({ h: 0 }, 32));
    expect(new Set(painted.map((s) => JSON.stringify(s))).size).toBeGreaterThan(
      10
    );
  });

  it('takes over from hover (it eases out), notes hovers meanwhile, and resumes after', async () => {
    const { c, t } = make(CopySpec);
    void c.hoverTo(1);
    await run(200);
    expect(c.frame.h).toBe(1);
    void t.trigger();
    await run(150);
    expect(c.frame.h).toBe(0);
    void c.hoverTo(0);
    void c.hoverTo(1); // the pointer comes back mid-action: noted
    expect(c.frame.h).toBe(0);
    await run(500);
    expect(t.acting).toBe(false);
    await run(200);
    expect(c.frame.h).toBe(1);
  });

  it('a re-trigger mid-play restarts it; the first resolves false', async () => {
    const { c, t } = make(SendSpec);
    const first = t.trigger();
    await run(200);
    const second = t.trigger();
    expect(c.frame.a).toBe(0);
    expect(await first).toBe(false);
    await run(520);
    expect(await second).toBe(true);
  });

  it('loops whole passes until stop(), then finishes the pass in flight', async () => {
    const { t } = make(SendSpec);
    let done = false;
    void t.trigger({ loop: true }).then(() => (done = true));
    await run(1600);
    expect(t.acting).toBe(true);
    t.stop();
    expect(t.acting).toBe(true);
    await run(520);
    expect(done).toBe(true);
    expect(t.acting).toBe(false);
  });

  it('a cycle (Renew) eases in over half a period, turns steadily, and when stopped eases out from where it is to the next rest', async () => {
    const { c, t } = make(RenewSpec);
    void t.trigger({ loop: true });
    const at: number[] = [];
    for (let i = 0; i < 200; i++) {
      await run(1000 / 60);
      at.push(c.frame.a ?? 0);
    }
    const v = at.slice(1).map((x, i) => x - at[i]);
    const PERIOD = RenewSpec.action!.cycle! * 1000;
    const steady = 1000 / 60 / PERIOD;
    expect(v[3]).toBeLessThan(steady * 0.5); // accelerating at first
    // Half a turn every period, slow-02 (averaged: the test clock's 16.67ms steps quantize single frames). On the engine's
    // frames each chained period starts on the frame after the last one ends, so a period end loses part of a frame: at
    // 520ms (31.2 frames) about 0.8 of one, and this 54-frame window holds two: it measures 3.0% slow, on the old 3% bound
    // (at 540ms, 32.4 frames, a period end lost about 0.6 of one). So within 4% (was 3%). In a browser the steady stretch turns on the compositor (turn.ts), which keeps time.
    const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
    expect(Math.abs(mean(v.slice(120, 174)) - steady)).toBeLessThan(
      steady * 0.04
    );
    const from = c.frame.a ?? 0;
    t.stop();
    const after: number[] = [];
    let ms = 0;
    while (t.acting && ms < 3000) {
      await run(1000 / 60);
      ms += 1000 / 60;
      if (t.acting) {
        after.push(c.frame.a ?? 0);
      }
    }
    expect(t.acting).toBe(false);
    // It eases out at once (its first step at the steady speed), lands on the next rest at least 0.15 ahead, within 1.25s.
    expect(Math.abs(after[0] - from - steady)).toBeLessThan(steady * 0.2);
    expect(Math.max(...after)).toBeLessThanOrEqual(
      Math.ceil(from + 0.15) + 1e-9
    );
    expect(ms).toBeLessThan(2 * (Math.ceil(from + 0.15) - from) * PERIOD + 50);
    expect(c.frame.a).toBe(0);
  });

  it('settles: the last half of its last stretch starts the hand-off, with the rest of the motion (the tail)', async () => {
    const { c, t } = make(CopySpec);
    let tail: ActionTail | undefined;
    let at = 0;
    let ended = false;
    void t
      .trigger({ onSettle: (x) => ((tail = x), (at = c.frame.a ?? 0)) })
      .then(() => (ended = true));
    await run(100);
    expect(tail).toBeUndefined(); // the settle is at 120ms of its 240
    await run(50);
    expect(tail).toBeDefined();
    expect(ended).toBe(false);
    expect(tail!.ms).toBeGreaterThan(80);
    expect(tail!.ms).toBeLessThan(240 / 2 + 1);
    expect(tail!.at(0)).toBeCloseTo(at, 2);
    expect(tail!.at(1)).toBe(1);
    expect(tail!.geo({ h: 0, a: tail!.at(1) })).toEqual(CopySpec.geo({ h: 0 }));
  });

  it('a stopped cycle settles as it runs out (the hand-off begins well before it lands)', async () => {
    const { t } = make(RenewSpec);
    let settledAt = -1;
    let ms = 0;
    void t.trigger({ loop: true, onSettle: () => (settledAt = ms) });
    await run(1500);
    t.stop();
    while (t.acting && ms < 3000) {
      await run(1000 / 60);
      ms += 1000 / 60;
    }
    expect(settledAt).toBeGreaterThan(0);
    expect(settledAt).toBeLessThan(ms - 50);
  });

  it('destroy() cuts it (false)', async () => {
    const { c, t } = make(RenewSpec);
    const p = t.trigger();
    await run(100);
    c.destroy();
    expect(await p).toBe(false);
  });

  it('an icon with no action has no player, and draws nothing new', async () => {
    const { c, t, painted } = make({
      kind: 'hover',
      name: 'X',
      geo: () => ({ x: { d: 'M0 0H1V1Z' } }),
    });
    expect(t).toBeUndefined();
    expect(c.player).toBeUndefined();
    expect(painted.length).toBe(0);
  });
});

describe('playAction (the hand-off)', () => {
  const host = () => {
    const shown: (string | undefined)[] = [];
    let resolveRun!: (d: boolean) => void;
    let stops = 0;
    const target = {
      acting: true,
      trigger: () => new Promise<boolean>((r) => (resolveRun = r)),
      stop: () => {
        stops++;
        resolveRun(true);
      },
    };
    return {
      shown,
      target,
      stops: () => stops,
      finish: (d = true) => resolveRun(d),
      setStatus: (s: string | undefined) => shown.push(s),
    };
  };

  it('shows `then` when the action ends, and clears it after `for`', async () => {
    const h = host();
    const p = playAction(
      { target: h.target, setStatus: h.setStatus },
      { then: { status: 'success', for: 30 } }
    );
    h.finish();
    await p;
    expect(h.shown).toEqual(['success']);
    await new Promise((r) => setTimeout(r, 50));
    expect(h.shown).toEqual(['success', undefined]);
  });

  it('`until`: loops until it settles, stops, then `then` (or `failed` if it rejects)', async () => {
    for (const ok of [true, false]) {
      const h = host();
      let settle!: () => void;
      const until = new Promise<void>(
        (res, rej) => (settle = ok ? res : () => rej(new Error('x')))
      );
      const p = playAction(
        { target: h.target, setStatus: h.setStatus },
        { until, then: { status: 'success' }, failed: { status: 'error' } }
      );
      await Promise.resolve();
      expect(h.shown).toEqual([]);
      settle();
      await p;
      expect(h.stops()).toBe(1);
      expect(h.shown).toEqual([ok ? 'success' : 'error']);
    }
  });

  it('hands off at the settle (with the tail), before the action ends', async () => {
    const shown: [string | undefined, ActionTail | undefined][] = [];
    let settle!: (tail: ActionTail) => void;
    let finish!: (d: boolean) => void;
    const target = {
      acting: true,
      trigger: (o?: { onSettle?: (tail: ActionTail) => void }) => {
        settle = o!.onSettle!;
        return new Promise<boolean>((r) => (finish = r));
      },
      stop: () => undefined,
      idle: () => Promise.resolve(),
    };
    const p = playAction(
      { target, setStatus: (s, tail) => shown.push([s, tail]) },
      { then: { status: 'success' } }
    );
    const tail = {
      geo: () => ({}),
      ms: 100,
      at: (u: number) => u,
      id: 1,
      start: 0,
    };
    settle(tail);
    expect(shown).toEqual([['success', tail]]);
    finish(false); // the status layer took the drawing over (the plain icon's action cut)
    await p;
    expect(shown).toHaveLength(1);
  });

  it('with no motion (reduced motion, still): the status applies directly', async () => {
    const shown: (string | undefined)[] = [];
    await playAction(
      { setStatus: (s) => shown.push(s) },
      { then: { status: 'success' } }
    );
    expect(shown).toEqual(['success']);
  });

  it('cut by a later trigger: no hand-off', async () => {
    const h = host();
    let current = true;
    const p = playAction(
      { target: h.target, setStatus: h.setStatus },
      { then: { status: 'success' } },
      () => current
    );
    current = false;
    h.finish(false);
    await p;
    expect(h.shown).toEqual([]);
  });
});

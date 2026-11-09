/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Bee (icons/assorted/brand.ts): rest on Carbon's art, the hover's growth and
 * opening, and the action (its reference animation, at 1.25×).
 *
 *  - Rest: Carbon's own paths, point for point, at both ends of the action.
 *  - Hover: the bee grows 1/16 about (16, 16) at constant weight (body and
 *    eye walls 1.75), the wings ride out 0.5px and open 12° about their
 *    hinges, rigidly (Carbon's own wing outline).
 *  - Action: 920ms; the reference's tracks at its own keys; every frame
 *    inside the 36×36 box, from rest and from mid-hover on the controller's
 *    clock; walls 1.75 every frame (body ring, stripes), wings rigid, eyes
 *    still; the widest beat reaches the box's side; the wings keep 1.4px
 *    clear of the body; it starts and ends slowly, and does not loop.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import Bee32 from '@carbon/icons/es/bee/32.js';
import {
  FrameController,
  actionPlayerOf,
  fromHover,
  manualScheduler,
  setScheduler,
  type Shapes,
} from '../src/engine';
import { pathPoints, type Pt } from '../src/geometry';
import {
  BEE_ACTION_MS,
  BEE_GAP,
  BEE_GROW,
  BEE_HOVER_OPEN,
  BeeSpec,
  beeActionPose,
  beeMotion,
  beeOpenMax,
} from '../src/icons/assorted/brand';

const SIZES = [16, 20, 24, 32];
const A = Array.from({ length: 277 }, (_, i) => i / 276); // every 60Hz frame of the pass, and then some
const act = BeeSpec.action!;
const rest = BeeSpec.geo({ h: 0 });

/** Carbon's relative path as absolute points (M m L l H h V v A a Z z), consecutive repeats dropped. */
function carbonPoints(d: string): Pt[] {
  const tok = d.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)/g)!;
  const out: Pt[] = [];
  let [i, cmd, cur, start] = [0, '', [0, 0] as Pt, [0, 0] as Pt];
  const num = () => +tok[i++];
  const push = (p: Pt) => {
    const l = out.at(-1);
    if (!l || Math.abs(l[0] - p[0]) > 1e-9 || Math.abs(l[1] - p[1]) > 1e-9) {
      out.push(p);
    }
    cur = p;
  };
  while (i < tok.length) {
    if (/[a-zA-Z]/.test(tok[i])) {
      cmd = tok[i++];
    }
    const rel = cmd === cmd.toLowerCase();
    const at = (x: number, y: number): Pt =>
      rel ? [cur[0] + x, cur[1] + y] : [x, y];
    switch (cmd.toUpperCase()) {
      case 'M':
        push((start = at(num(), num())));
        cmd = rel ? 'l' : 'L';
        break;
      case 'L':
        push(at(num(), num()));
        break;
      case 'H':
        push([rel ? cur[0] + num() : num(), cur[1]]);
        break;
      case 'V':
        push([cur[0], rel ? cur[1] + num() : num()]);
        break;
      case 'A':
        i += 5;
        push(at(num(), num()));
        break;
      case 'Z':
        push(start);
        break;
      default:
        throw new Error(cmd);
    }
  }
  return out;
}

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
const subpaths = (d: unknown) =>
  String(d ?? '')
    .split(/(?=M)/)
    .filter((s) => s.trim());
const ink = (attrs: Shapes[string], step = 0.25): Pt[][] =>
  subpaths(attrs.d).map((s) =>
    pathPoints(s, step).map((p) =>
      applyTransform(attrs.transform as string | undefined, p)
    )
  );
function segDist(p: Pt, a: Pt, b: Pt): number {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const l = dx * dx + dy * dy;
  const u = l
    ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l))
    : 0;
  return Math.hypot(p[0] - a[0] - u * dx, p[1] - a[1] - u * dy);
}
const toPoly = (p: Pt, poly: Pt[]) =>
  Math.min(...poly.map((a, i) => segDist(p, a, poly[(i + 1) % poly.length])));
const polyGap = (A: Pt[], B: Pt[]) => Math.min(...A.map((p) => toPoly(p, B)));
/** A ring's wall (outline, hole): every point of the hole is this far from the outline, and back. */
const wall = (d: unknown): [number, number] => {
  const [o, i] = subpaths(d).map((s) => pathPoints(s, 0.1));
  const ds = [...i.map((p) => toPoly(p, o)), ...o.map((p) => toPoly(p, i))];
  return [Math.min(...ds), Math.max(...ds)];
};
function inBox(frame: Shapes, what: string) {
  for (const [k, attrs] of Object.entries(frame)) {
    for (const [x, y] of ink(attrs).flat()) {
      expect(
        x >= -2 - 1e-6 && x <= 34 + 1e-6 && y >= -2 - 1e-6 && y <= 34 + 1e-6,
        `${k} (${x.toFixed(3)}, ${y.toFixed(3)}) ${what}`
      ).toBe(true);
    }
  }
}

describe('Bee at rest', () => {
  it("draws Carbon's own paths, point for point", () => {
    const art = (Bee32.content ?? []).map((n) => String(n.attrs.d));
    const ours = [
      rest.body.d,
      rest.wingRight.d,
      rest.wingLeft.d,
      rest.eyeLeft.d,
      rest.eyeRight.d,
    ].map(String);
    expect(art.length).toBe(5);
    art.forEach((d, i) =>
      expect(carbonPoints(ours[i]), `path ${i}`).toEqual(
        carbonPoints(d).map(([x, y]) => [+x.toFixed(6), +y.toFixed(6)])
      )
    );
    expect(rest.stripes.d).toBe('');
    expect(rest.wingRight.transform).toBe('translate(0 0) rotate(0 24 16)');
    expect(BeeSpec.static).toEqual({ kind: 'carbon', drawings: [Bee32] });
  });
});

describe('Bee hover', () => {
  it('grows 1/16 about (16, 16) at 1.75 weight; the wings ride out 0.5px and open 12° about (24, 16) / (8, 16)', () => {
    const peak = BeeSpec.geo({ h: 1 });
    expect(BEE_GROW).toBe(1 / 16);
    expect(BEE_HOVER_OPEN).toBe(12);
    expect(peak.wingRight).toEqual({
      d: rest.wingRight.d,
      transform: 'translate(0.5 0) rotate(-12 24 16)',
    });
    expect(peak.wingLeft).toEqual({
      d: rest.wingLeft.d,
      transform: 'translate(-0.5 0) rotate(12 8 16)',
    });
    // The body: its outline grows from the top cap's centre (top 10 → 9.68, bottom 30 → 30.82, sides ±6 → ±6.32), walls 1.75.
    const [outline] = ink(peak.body, 0.1);
    const xs = outline.map((p) => p[0]),
      ys = outline.map((p) => p[1]);
    expect(Math.min(...ys)).toBeCloseTo(16 - 5.125 * 1.0625 - 0.875, 2);
    expect(Math.max(...ys)).toBeCloseTo(
      16 + 8 * 1.0625 + 5.125 * 1.0625 + 0.875,
      2
    );
    expect(Math.max(...xs) - 16).toBeCloseTo(5.125 * 1.0625 + 0.875, 2);
    for (const h of [0.3, 1]) {
      const [lo, hi] = wall(BeeSpec.geo({ h }).body.d);
      expect(lo).toBeGreaterThan(1.74);
      expect(hi).toBeLessThan(1.76 + 0.01);
    }
    // The eyes: rings about their scaled centres, 1.75 walls.
    // Left eye: centre (16 − 4.5 × 1.0625, 16 − 10.5 × 1.0625) = (11.219, 4.844), outer radius 2.625 × 1.0625 + 0.875 = 3.664.
    expect(peak.eyeLeft.d).toMatch(
      /^M11\.2188 1\.1797A3\.6641 3\.6641 0 1 0 14\.8828 4\.8438/
    );
    expect(wall(peak.eyeRight.d)[0]).toBeCloseTo(1.75, 2);
    // The stripes: 1.75 bands at y 16 + 1.0625 and 16 + 7 × 1.0625.
    const [s1, s2] = subpaths(peak.stripes.d).map((s) => pathPoints(s, 1));
    expect(Math.min(...s1.map((p) => p[1]))).toBeCloseTo(17.0625 - 0.875, 3);
    expect(Math.max(...s2.map((p) => p[1]))).toBeCloseTo(
      16 + 7.4375 + 0.875,
      3
    );
  });

  it('keeps the same keys and stays inside the 36×36 box at every h', () => {
    for (let i = 0; i <= 20; i++) {
      const f = BeeSpec.geo({ h: i / 20 });
      expect(Object.keys(f)).toEqual(Object.keys(rest));
      inBox(f, `h=${i / 20}`);
    }
  });
});

describe('Bee action', () => {
  it('is 920ms, linear, with no cycle, and does not loop', () => {
    expect(act.duration).toBe(0.92);
    expect(act.loops).toBe(false);
    expect(BEE_ACTION_MS).toBe(920);
    expect(act.ease).toBeUndefined();
    expect(act.cycle).toBeUndefined();
    expect(act.description.length).toBeGreaterThan(40);
  });

  it('rests at both ends (on the hover it starts from), with the hover keys throughout', () => {
    for (const size of SIZES) {
      expect(act.geo({ h: 0, a: 0 }, size)).toEqual(rest);
      expect(act.geo({ h: 0, a: 1 }, size)).toEqual(rest);
      expect(act.geo({ h: 1, a: 0 }, size)).toEqual(
        BeeSpec.geo({ h: 1 }, size)
      );
      expect(act.geo({ h: 1, a: 1 }, size)).toEqual(
        BeeSpec.geo({ h: 1 }, size)
      );
    }
    for (const a of A) {
      expect(Object.keys(act.geo({ h: 0, a }))).toEqual(Object.keys(rest));
    }
  });

  it("follows the reference's keys (frame 60 + 69a): the beats, the sway, the bend and the stripes", () => {
    const at = (frame: number) => beeMotion((frame - 60) / 69);
    expect(at(73).beat).toBeCloseTo(1, 6);
    expect(at(86).beat).toBeCloseTo(28 / 31, 6);
    expect(at(117).beat).toBeCloseTo(22 / 31, 6);
    for (const f of [81, 90, 98, 108]) {
      expect(at(f).beat).toBeCloseTo(0, 6);
    }
    expect(at(75.488).sway).toBeCloseTo(-12.858, 2);
    expect(at(86.906).sway).toBeCloseTo(12.713, 2);
    expect(at(80).bend).toBeCloseTo(-17.376, 3);
    expect(at(92).bend).toBeCloseTo(14.74, 3);
    expect(at(77).stripe1).toBeCloseTo(-7.639, 3);
    expect(at(100).stripe2).toBeCloseTo(-16.594, 3);
  });

  it('opens the widest beat as far as the box allows (the lobe at x 34), the rest in proportion', () => {
    expect(beeOpenMax(0)).toBeCloseTo(22.08, 1);
    const peak = act.geo({ h: 0, a: 13 / 69 });
    const xs = ink(peak.wingRight, 0.05)
      .flat()
      .map((p) => p[0]);
    expect(Math.max(...xs)).toBeCloseTo(34, 2);
    expect(beeActionPose(0, 26 / 69).openRight).toBeCloseTo(
      beeOpenMax(0) * (28 / 31),
      3
    );
  });

  it('keeps every frame inside the 36×36 box: a pass from rest, and one started mid-hover on the controller’s clock', async () => {
    for (const a of A) {
      inBox(act.geo({ h: 0, a }), `a=${a}`);
    }
    for (const h of [0.25, 0.5, 0.75, 1]) {
      for (let i = 0; i <= 40; i++) {
        inBox(act.geo({ h, a: i / 40 }), `h=${h} a=${i / 40}`);
      }
    }
    const clock = manualScheduler();
    setScheduler(clock);
    const frames: Shapes[] = [];
    const c = new FrameController(
      fromHover(BeeSpec),
      (s) => frames.push(s),
      32
    );
    void c.hoverTo(1);
    for (let t = 0; t < 300; t += 1000 / 60) {
      clock.advance(1000 / 60);
    }
    void actionPlayerOf(c)!.trigger();
    for (let t = 0; t < BEE_ACTION_MS + 100; t += 1000 / 60) {
      clock.advance(1000 / 60);
      await Promise.resolve();
    }
    setScheduler(null);
    // The pass's frames (the hover held at rest after it: no frames easing back in).
    expect(frames.length).toBeGreaterThan(45);
    frames.forEach((f, i) => inBox(f, `controller frame ${i}`));
  });

  it('keeps 1.75 walls every frame (body ring and stripes), moves the wings rigidly and holds the eyes', () => {
    for (let i = 1; i < 69; i += 2) {
      const a = i / 69;
      const f = act.geo({ h: 0, a });
      // While only the wings move, the body is Carbon's own path (rest, tested above).
      if (f.body.d === rest.body.d) {
        continue;
      }
      const [lo, hi] = wall(f.body.d);
      expect(lo, `body wall a=${a}`).toBeGreaterThan(1.74);
      expect(hi, `body wall a=${a}`).toBeLessThan(1.77);
      // Each stripe: a band 1.75 across (its two long edges 1.75 apart), its ends on the body's centreline (inside the wall).
      for (const s of subpaths(f.stripes.d)) {
        const pts = pathPoints(s, 0.5);
        const xs = pts.map((p) => p[0]);
        expect(
          Math.max(...xs) - Math.min(...xs),
          `stripe span a=${a}`
        ).toBeGreaterThan(9);
      }
      expect(f.wingRight.d).toBe(rest.wingRight.d);
      expect(f.wingLeft.d).toBe(rest.wingLeft.d);
      expect(String(f.wingRight.transform)).toMatch(
        /^translate\(0 0\) rotate\(-?[\d.]+ 24 16\)$/
      );
      expect(f.eyeLeft).toEqual(rest.eyeLeft);
      expect(f.eyeRight).toEqual(rest.eyeRight);
    }
  });

  it('keeps the wings 1.4px clear of the body (a shut wing gives way to the swinging abdomen)', () => {
    let least = Infinity;
    for (let i = 0; i <= 138; i++) {
      const f = act.geo({ h: 0, a: i / 138 });
      const body = ink(f.body, 0.1)[0];
      for (const w of [f.wingRight, f.wingLeft]) {
        least = Math.min(least, polyGap(ink(w, 0.1)[0], body));
      }
    }
    expect(least).toBeGreaterThan(BEE_GAP - 0.03);
    // The reference's own abdomen comes within 0.1px of a shut wing at frame 90: here the left wing is opened.
    expect(beeActionPose(0, 30 / 69).openLeft).toBeGreaterThan(1);
  });

  it('starts and ends slowly: every part comes to rest, and starts from rest', () => {
    const pose = (a: number) => beeActionPose(0, a);
    const d = (p: ReturnType<typeof pose>, q: ReturnType<typeof pose>) =>
      Math.max(
        ...(
          [
            'openLeft',
            'openRight',
            'sway',
            'bend',
            'stripe1',
            'stripe2',
          ] as const
        ).map((k) => Math.abs(p[k] - q[k]))
      );
    const frame = 1 / 55.2; // one 60Hz frame of the pass
    // Within a third of a degree of rest a frame from either end (a wing's lobe moves under 0.05px a frame there).
    expect(d(pose(1 - frame), pose(1))).toBeLessThan(0.35);
    expect(d(pose(frame), pose(0))).toBeLessThan(0.35);
  });
});

describe('Bee on the controller', () => {
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

  it('plays one 920ms pass and rests; asked to loop, it still plays one pass (loops: false)', async () => {
    const painted: Shapes[] = [];
    const c = new FrameController(
      fromHover(BeeSpec),
      (s) => painted.push(s),
      32
    );
    const t = actionPlayerOf(c)!;
    let done: boolean | undefined;
    void t.trigger().then((x) => (done = x));
    await run(880);
    expect(done).toBeUndefined();
    await run(100);
    expect(done).toBe(true);
    expect(painted.at(-1)).toEqual(rest);

    let ended = false;
    void t.trigger({ loop: true }).then(() => (ended = true));
    await run(1000);
    expect(ended).toBe(true);
    expect(t.acting).toBe(false);
    expect(c.frame.a).toBe(0);
  });
});

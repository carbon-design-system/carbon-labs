/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * MicrophoneListeningToggle on the engine: the microphone leaves before the
 * pills arrive, the pills land on their still pose, follow a live level
 * (rising faster than they fall, still in silence), run nothing with no level,
 * and hold still under reduced motion.
 */
import { afterEach, describe, expect, it } from 'vitest';
import {
  FrameController,
  fromToggle,
  manualScheduler,
  setScheduler,
  type Shapes,
} from '../src/engine';
import { followLevel } from '../src/engine/loop';
import { MicrophoneListeningToggleSpec as SPEC } from '../src/icons/toggle/micListening';

const FRAME = 1000 / 60;
const CYCLE = SPEC.loop!.cycle * 1000;
const CHANGE = SPEC.loop!.delay! * 1000;
const RAMP = SPEC.loop!.ramp! * 1000;

afterEach(() => setScheduler(null));

function mount(initial: 'off' | 'listening' = 'off') {
  const clock = manualScheduler();
  setScheduler(clock);
  const painted: string[] = [];
  const ctl = new FrameController(
    fromToggle(SPEC),
    (s: Shapes) => painted.push(JSON.stringify(s)),
    32,
    initial
  );
  const frames = async (ms: number) => {
    const out: Shapes[] = [];
    for (let t = 0; t < ms - 1e-6; t += FRAME) {
      clock.advance(FRAME);
      await Promise.resolve();
      out.push(ctl.shapes());
    }
    return out;
  };
  return {
    ctl,
    clock,
    painted,
    frames,
    rest: (p: number) => JSON.stringify(SPEC.geo({ h: 0, p, e: 0 })),
  };
}

const d = (s: Shapes, k: string) =>
  String((s as Record<string, { d?: string }>)[k]?.d ?? '');
/** The pills' height: the span of the y their path's moves and arcs end on (the outer edge). */
function height(s: Shapes): number {
  const path = d(s, 'pills');
  const ys = [
    ...path.matchAll(/M-?[\d.]+ (-?[\d.]+)/g),
    ...path.matchAll(/A[\d.]+ [\d.]+ 0 0 [01] -?[\d.]+ (-?[\d.]+)/g),
  ].map((m) => Number(m[1]));
  return ys.length ? Math.max(...ys) - Math.min(...ys) : 0;
}

describe('followLevel', () => {
  it('rises faster than it falls, and stays in 0 to 1', () => {
    const up = followLevel(0, 1, 0.05);
    const down = 1 - followLevel(1, 0, 0.05);
    expect(up).toBeGreaterThan(down);
    expect(followLevel(0, 5, 10)).toBeCloseTo(1, 6);
    expect(followLevel(0.5, Number.NaN, 10)).toBeCloseTo(0, 6);
    expect(followLevel(0.4, 0.4, 0.1)).toBe(0.4);
  });
});

describe('MicrophoneListeningToggle', () => {
  it('out, then in: no frame shows the microphone and the pills together', async () => {
    const { ctl, frames } = mount();
    ctl.setMoving(true);
    ctl.setState('listening');
    const seen = await frames(CHANGE);
    expect(seen.some((s) => d(s, 'stand') || d(s, 'pill'))).toBe(true);
    expect(seen.some((s) => d(s, 'pills'))).toBe(true);
    for (const s of seen) {
      expect(!!(d(s, 'stand') || d(s, 'pill')) && !!d(s, 'pills')).toBe(false);
    }
    ctl.destroy();
  });

  it('lands on its still pose at the end of the change: three outlined pills', async () => {
    const { ctl, clock, rest } = mount();
    ctl.setMoving(true);
    ctl.setState('listening');
    clock.advance(CHANGE);
    await Promise.resolve();
    expect(JSON.stringify(ctl.shapes())).toBe(rest(1));
    // Each pill an outline: an outer and an inner edge.
    expect(d(ctl.shapes(), 'pills').match(/M/g)).toHaveLength(6);
    ctl.destroy();
  });

  it('in silence the pills hold still at rest', async () => {
    const { ctl, frames, rest } = mount();
    ctl.setLevel(0);
    ctl.setMoving(true);
    ctl.setState('listening');
    const seen = await frames(CHANGE + RAMP + CYCLE);
    expect(JSON.stringify(seen.at(-1))).toBe(rest(1));
    ctl.destroy();
  });

  it('a level grows the pills, read each frame from a function', async () => {
    const { ctl, frames, rest } = mount();
    let level = 1;
    ctl.setLevel(() => level);
    ctl.setMoving(true);
    ctl.setState('listening');
    const loud = (await frames(CHANGE + RAMP + 100)).at(-1)!;
    const still = JSON.parse(rest(1)) as Shapes;
    expect(height(loud)).toBeGreaterThan(height(still) + 8);
    expect(height(loud)).toBeLessThanOrEqual(26 + 1e-6);
    level = 0;
    const quiet = (await frames(600)).at(-1)!;
    // Falling on moderate-01 as its time constant: within a twentieth of the range in 600ms.
    expect(height(quiet) - height(still)).toBeLessThan(0.6);
    expect(height(quiet)).toBeGreaterThanOrEqual(height(still));
    ctl.destroy();
  });

  it('with no level the pills hold still at rest, and nothing runs', async () => {
    const { ctl, painted, frames, rest } = mount();
    ctl.setMoving(true);
    ctl.setState('listening');
    await frames(CHANGE);
    expect(JSON.stringify(ctl.shapes())).toBe(rest(1));
    const n = painted.length;
    await frames(CYCLE);
    expect(painted.length).toBe(n);
    ctl.destroy();
  });

  it('a level that comes later starts the loop; one that goes eases back to rest', async () => {
    const { ctl, painted, frames, rest } = mount();
    ctl.setMoving(true);
    ctl.setState('listening');
    await frames(CHANGE);
    ctl.setLevel(1);
    const loud = (await frames(RAMP + 200)).at(-1)!;
    expect(height(loud)).toBeGreaterThan(20);
    ctl.setLevel(undefined);
    const seen = await frames(300);
    // Down over a few frames, not at once.
    expect(height(seen[0])).toBeGreaterThan(height(seen.at(-1)!));
    expect(height(seen[0])).toBeGreaterThan(12.5);
    expect(JSON.stringify(seen.at(-1))).toBe(rest(1));
    const n = painted.length;
    await frames(CYCLE);
    expect(painted.length).toBe(n);
    ctl.destroy();
  });

  it('reduced motion: listening is the still pose, whatever the level, and nothing runs', async () => {
    const { ctl, painted, frames, rest } = mount();
    ctl.setLevel(1);
    ctl.setState('listening', false);
    expect(JSON.stringify(ctl.shapes())).toBe(rest(1));
    const n = painted.length;
    await frames(CYCLE);
    expect(painted.length).toBe(n);
  });

  it("turning off: the pills leave and the microphone rests on Carbon's; then nothing runs", async () => {
    const { ctl, painted, frames, rest } = mount();
    ctl.setLevel(0.6);
    ctl.setMoving(true);
    ctl.setState('listening');
    await frames(CHANGE + CYCLE);
    ctl.setState('off');
    const back = await frames(400);
    expect(JSON.stringify(back.at(-1))).toBe(rest(0));
    // The pills leave before the microphone comes back.
    const first = back.findIndex((s) => d(s, 'stand') || d(s, 'pill'));
    expect(back.slice(first).every((s) => !d(s, 'pills'))).toBe(true);
    const n = painted.length;
    await frames(CYCLE);
    expect(painted.length).toBe(n);
  });
});

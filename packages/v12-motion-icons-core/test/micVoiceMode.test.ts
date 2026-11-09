/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * MicrophoneVoiceModeToggle's loop on the engine (loop.ts): seamless (the
 * drawing a cycle later is the same drawing), still under reduced motion,
 * held off screen, eased in only after the change, and gone when the toggle
 * turns off.
 */
import { afterEach, describe, expect, it } from 'vitest';
import {
  FrameController,
  fromToggle,
  manualScheduler,
  setScheduler,
  type Shapes,
} from '../src/engine';
import { MicrophoneVoiceModeToggleSpec as SPEC } from '../src/icons/toggle/micVoiceMode';

const FRAME = 1000 / 60;
const CYCLE = SPEC.loop!.cycle * 1000;
const CHANGE = SPEC.loop!.delay! * 1000;

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
  // A frame, then a microtask turn (a tween's completion runs there, as in a browser).
  const frames = async (ms: number) => {
    const out: string[] = [];
    for (let t = 0; t < ms - 1e-6; t += FRAME) {
      clock.advance(FRAME);
      await Promise.resolve();
      out.push(JSON.stringify(ctl.shapes()));
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

describe('MicrophoneVoiceModeToggle', () => {
  it('loops seamlessly while listening: every frame equals the frame a cycle later, and the loop moves', async () => {
    const { ctl, frames } = mount();
    ctl.setMoving(true);
    ctl.setState('listening');
    await frames(CHANGE + CYCLE); // the change, then the loop's weight easing in (half a cycle)
    const a = await frames(CYCLE);
    const b = await frames(CYCLE);
    expect(b).toEqual(a);
    expect(new Set(a).size, 'distinct drawings in a cycle').toBeGreaterThan(20);
    ctl.destroy();
  });

  it("lands on voice-mode exactly at the end of the change, before the loop's weight eases in", async () => {
    const { ctl, clock, frames, rest } = mount();
    ctl.setMoving(true);
    ctl.setState('listening');
    // Frames up to the change's last, which lands on its end exactly.
    clock.advance(CHANGE);
    await Promise.resolve();
    expect(JSON.stringify(ctl.shapes())).toBe(rest(1));
    expect((await frames(300)).at(-1)).not.toBe(rest(1));
    ctl.destroy();
  });

  it('mounted listening, it starts on its still pose and eases the loop in', async () => {
    const { ctl, frames, rest } = mount('listening');
    expect(JSON.stringify(ctl.shapes())).toBe(rest(1));
    ctl.setMoving(true);
    expect((await frames(300)).at(-1)).not.toBe(rest(1));
    ctl.destroy();
  });

  it('reduced motion: listening is the still pose; turning reduced motion on mid-loop goes straight to it', async () => {
    const { ctl, painted, frames, rest } = mount();
    // The binding leaves it not moving under reduced motion, and changes state without animating.
    ctl.setState('listening', false);
    expect(JSON.stringify(ctl.shapes())).toBe(rest(1));
    const n = painted.length;
    await frames(CYCLE);
    expect(painted.length, 'no frames').toBe(n);
    ctl.setMoving(true);
    await frames(CYCLE * 1.25);
    expect(JSON.stringify(ctl.shapes())).not.toBe(rest(1));
    ctl.setMoving(false);
    expect(JSON.stringify(ctl.shapes())).toBe(rest(1));
    const m = painted.length;
    await frames(CYCLE);
    expect(painted.length, 'no frames after').toBe(m);
  });

  it('off screen it holds where it is, and carries on from there', async () => {
    const { ctl, painted, frames } = mount();
    ctl.setMoving(true);
    ctl.setState('listening');
    await frames(CHANGE + CYCLE);
    ctl.setVisible(false);
    const held = JSON.stringify(ctl.shapes());
    const n = painted.length;
    await frames(2 * CYCLE);
    expect(painted.length, 'no frames off screen').toBe(n);
    expect(JSON.stringify(ctl.shapes())).toBe(held);
    ctl.setVisible(true);
    expect((await frames(FRAME * 1.5))[0]).not.toBe(held);
    ctl.destroy();
  });

  it("turning off: the loop eases out, the microphone rests on Carbon's; then nothing runs", async () => {
    const { ctl, painted, frames, rest } = mount();
    ctl.setMoving(true);
    ctl.setState('listening');
    await frames(CHANGE + CYCLE * 1.3);
    ctl.setState('off');
    await frames(300);
    expect(JSON.stringify(ctl.shapes())).toBe(rest(0));
    const n = painted.length;
    await frames(CYCLE);
    expect(painted.length).toBe(n);
  });
});

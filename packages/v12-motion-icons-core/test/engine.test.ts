/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The core engine's contracts: the tween agrees with motion frame for frame
 * (the premise of the refactor's parity), completes, stops and repeats as
 * motion does; hover ignores touch.
 */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

let motion: typeof import('motion');
let core: typeof import('../src/engine/index');
beforeAll(async () => {
  vi.useFakeTimers({
    toFake: [
      'requestAnimationFrame',
      'cancelAnimationFrame',
      'performance',
      'setTimeout',
      'clearTimeout',
      'Date',
    ],
  });
  motion = await import('motion');
  core = await import('../src/engine/index');
});
afterAll(() => vi.useRealTimers());

const frame = async () => {
  vi.advanceTimersByTime(1000 / 60);
  await Promise.resolve();
};

describe('tween', () => {
  it('matches motion frame by frame, completion included (cubic-bezier, linear, the house curves)', async () => {
    for (const ease of [
      [0, 0, 0.38, 0.9],
      [0.2, 0, 1, 0.9],
      [0.8, 0, 0.2, 1],
      [0, 0, 1, 1],
      'linear',
    ] as const) {
      for (const duration of [0.11, 0.15, 0.24, 0.69]) {
        const [a, b]: string[][] = [[], []];
        motion.animate(0, 1, {
          duration,
          ease: ease as never,
          onUpdate: (v) => a.push(String(v)),
          onComplete: () => a.push('done'),
        });
        core.animate(0, 1, {
          duration,
          ease: ease as never,
          onUpdate: (v) => b.push(String(v)),
          onComplete: () => b.push('done'),
        });
        for (let i = 0; i < 50; i++) {
          await frame();
        }
        expect(a.length, 'motion ran').toBeGreaterThan(6);
        expect(b, `${ease} ${duration}s`).toEqual(a);
      }
    }
  });

  it('stop() between frames (as from an event) leaves the value where the frames had it, and never completes; repeat loops', async () => {
    const [a, b]: string[][] = [[], []];
    const m = motion.animate(1, 0, {
      duration: 0.11,
      ease: [0.2, 0, 1, 0.9],
      onUpdate: (v) => a.push(String(v)),
      onComplete: () => a.push('done'),
    });
    const c = core.animate(1, 0, {
      duration: 0.11,
      ease: [0.2, 0, 1, 0.9],
      onUpdate: (v) => b.push(String(v)),
      onComplete: () => b.push('done'),
    });
    for (let i = 0; i < 3; i++) {
      await frame();
    }
    m.stop();
    c.stop();
    for (let i = 0; i < 10; i++) {
      await frame();
    }
    expect(b).toEqual(a);
    expect(b).not.toContain('done');
    const laps: number[] = [];
    const spin = core.animate(0, 1, {
      duration: 0.1,
      ease: 'linear',
      repeat: Infinity,
      onUpdate: (v) => laps.push(v),
    });
    for (let i = 0; i < 22; i++) {
      await frame();
    }
    spin.stop();
    expect(Math.max(...laps)).toBeLessThan(1);
    expect(
      laps.filter((v, i) => i > 0 && v < laps[i - 1]).length
    ).toBeGreaterThanOrEqual(2);
  });
});

describe('hover binding', () => {
  // jsdom has no PointerEvent: a minimal one, so bindHover takes the pointer path.
  class PointerEventShim extends MouseEvent {
    pointerType: string;
    constructor(
      type: string,
      init: MouseEventInit & { pointerType?: string } = {}
    ) {
      super(type, init);
      this.pointerType = init.pointerType ?? 'mouse';
    }
  }

  it('plays for a mouse or a pen, never for a touch or the mouse events after a tap', () => {
    vi.stubGlobal('PointerEvent', PointerEventShim);
    const el = document.createElement('span');
    document.body.append(el);
    const seen: string[] = [];
    const off = core.bindHover(el, {
      enter: () => seen.push('enter'),
      leave: () => seen.push('leave'),
    });
    const fire = (type: string, pointerType?: string) =>
      el.dispatchEvent(
        pointerType === undefined
          ? new MouseEvent(type)
          : new PointerEventShim(type, { pointerType })
      );
    // A tap: pointer events say touch; the compat mouse events follow.
    fire('pointerdown', 'touch');
    fire('pointerenter', 'touch');
    fire('mouseenter');
    fire('mouseover');
    fire('pointerleave', 'touch');
    fire('mouseleave');
    expect(seen).toEqual([]);
    // A mouse.
    fire('pointerenter', 'mouse');
    fire('pointerleave', 'mouse');
    // A pen.
    fire('pointerenter', 'pen');
    fire('pointerleave', 'pen');
    expect(seen).toEqual(['enter', 'leave', 'enter', 'leave']);
    off();
    fire('pointerenter', 'mouse');
    expect(seen).toHaveLength(4);
    vi.unstubAllGlobals();
    el.remove();
  });

  it('binds to a marked frame across a shadow root', () => {
    const button = document.createElement('div');
    button.setAttribute('data-motion-icon-frame', '');
    const host = document.createElement('div');
    button.append(host);
    document.body.append(button);
    const root = host.attachShadow({ mode: 'open' });
    const icon = document.createElement('span');
    root.append(icon);
    expect(core.frameOf(icon)).toBe(button);
    const seen: string[] = [];
    const off = core.bindHover(icon, {
      enter: () => seen.push('enter'),
      leave: () => seen.push('leave'),
    });
    button.dispatchEvent(new MouseEvent('mouseenter'));
    expect(seen).toEqual(['enter']);
    off();
    button.remove();
  });
});

describe('one frame loop for everything', () => {
  it('tweens, per-frame work and next-frame callbacks share one frame request; a next-frame callback runs once, the next frame', async () => {
    const { manualScheduler, setScheduler, animate, nextFrame } = core;
    const { onFrame } = await import('../src/engine/animate');
    const clock = manualScheduler();
    setScheduler(clock);
    try {
      const log: string[] = [];
      const tween = animate(0, 1, { duration: 0.2, onUpdate: () => undefined });
      const stop = onFrame(() => log.push('every'));
      const cancels = Array.from({ length: 50 }, (_, i) =>
        nextFrame(() => log.push(`once ${i}`))
      );
      cancels[49]();
      // One request for the page, however many asked.
      expect(clock.pending()).toBe(1);
      nextFrame(() => nextFrame(() => log.push('asked during a frame')));
      clock.advance(1000 / 60);
      expect(log.filter((l) => l.startsWith('once'))).toHaveLength(49);
      expect(log).not.toContain('asked during a frame');
      expect(clock.pending()).toBe(1);
      clock.advance(1000 / 60);
      expect(log).toContain('asked during a frame');
      expect(log.filter((l) => l.startsWith('once'))).toHaveLength(49);
      tween.stop();
      stop();
      // Nothing left: no frame requested.
      expect(clock.pending()).toBe(0);
      const c = nextFrame(() => undefined);
      c();
      expect(clock.pending()).toBe(0);
    } finally {
      setScheduler(null);
    }
  });
});

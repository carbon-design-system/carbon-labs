/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The engine's lifecycle checks:
 *  - StatusEngine.destroy() is reversible: mounted again (React's
 *    StrictMode, <Activity>), the change it was making plays on, and pending
 *    turns;
 *  - FrameController never takes a state its spec doesn't have;
 *  - playAction hands its clearing timer to the host (`track`).
 *  - C (S3, phase 2): forced colors.
 *  - F (N1, phase 2): off screen, a pending spinner and a looping action
 *    hold where they are, and carry on from there.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  actionPlayerOf,
  animate,
  FrameController,
  fromHover,
  fromToggle,
  manualScheduler,
  playAction,
  resolveStatus,
  setScheduler,
  StatusEngine,
  geoAt,
  statusTiming,
  type Shapes,
} from '../src/engine';
import { BookmarkToggleSpec } from '../src/icons/toggle/opsFillToggles';
import { SettingsSpec } from '../src/icons/statusIcons';
import { RenewSpec as RenewPlainSpec } from '../src/icons/operations/opsRotate';
import { FORCED_COLORS_CSS } from '../src/forcedColors';

afterEach(() => {
  setScheduler(null);
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function engine(mark: 'success' | 'pending', painted: { s?: Shapes }) {
  const { placement } = resolveStatus(SettingsSpec, { status: mark }, 32);
  const t = statusTiming(SettingsSpec);
  return new StatusEngine({
    geo: geoAt(SettingsSpec, placement),
    placement,
    mark: 'none',
    text: '',
    count: 0,
    size: 32,
    start: 'enter',
    enter: t.enter,
    leave: t.leave,
    painter: (s) => (painted.s = s),
    onRest: () => undefined,
  });
}

describe('StatusEngine mount, destroy, mount', () => {
  for (const mark of ['success', 'pending'] as const) {
    it(`${mark}: lands as it does without the destroy`, () => {
      const clock = manualScheduler();
      setScheduler(clock);
      const [a, b] = [{} as { s?: Shapes }, {} as { s?: Shapes }];
      const once = engine(mark, a);
      once.mount(false);
      once.update(mark, '', 0);
      const twice = engine(mark, b);
      twice.mount(false);
      twice.update(mark, '', 0);
      twice.destroy();
      twice.mount(false);
      twice.update(mark, '', 0);
      clock.advance(1000);
      expect(JSON.stringify(b.s)).toBe(JSON.stringify(a.s));
      if (mark === 'pending') {
        const before = JSON.stringify(b.s);
        clock.advance(200);
        expect(JSON.stringify(b.s), 'still turning').not.toBe(before);
      }
      once.destroy();
      twice.destroy();
    });
  }
});

describe('FrameController', () => {
  it('never takes a state its spec does not have', () => {
    const spec = fromToggle(BookmarkToggleSpec as never) as never;
    const shapes = (c: FrameController) => JSON.stringify(c.shapes());
    const off = new FrameController(spec, () => undefined, 32, 'off');
    const typo = new FrameController<string>(spec, () => undefined, 32, 'typo');
    expect([typo.state, shapes(typo)]).toEqual(['off', shapes(off)]);
    typo.setState('typo', false);
    expect([typo.state, shapes(typo)]).toEqual(['off', shapes(off)]);
  });
});

describe('the hand-off timer', () => {
  it("goes to the host's track(), which can clear it", async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const set = vi.fn();
    const cancels: (() => void)[] = [];
    await playAction(
      { setStatus: set, track: (c) => cancels.push(c) },
      { then: { status: 'success', for: 1000 } }
    );
    expect(set).toHaveBeenCalledWith('success', undefined);
    expect([cancels.length, vi.getTimerCount()]).toEqual([1, 1]);
    cancels[0]();
    expect(vi.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(2000);
    expect(set).toHaveBeenCalledTimes(1);
  });
});

describe('off screen, a spinner and a loop hold where they are', () => {
  it('a paused tween takes no frames and carries on from where it was', async () => {
    // Pause and resume come from separate tasks (an IntersectionObserver callback each): the engine's clock reads once per task.
    const task = () => new Promise<void>((r) => setTimeout(r, 0));
    const clock = manualScheduler();
    setScheduler(clock);
    const seen: number[] = [];
    const p = animate(0, 1, {
      duration: 1,
      ease: 'linear',
      onUpdate: (v) => seen.push(v),
    });
    clock.advance(300);
    const at = seen.at(-1)!;
    await task();
    p.pause!();
    const n = seen.length;
    clock.advance(5000);
    expect(seen.length, 'no frames while paused').toBe(n);
    await task();
    p.resume!();
    clock.advance(1000 / 60);
    expect(seen.at(-1)! - at).toBeLessThan(0.03);
    expect(seen.at(-1)!).toBeGreaterThan(at);
    p.stop();
  });

  it('StatusEngine: hidden, pending holds; shown, it turns on from there (as one that was never hidden)', async () => {
    const task = () => new Promise<void>((r) => setTimeout(r, 0));
    const clock = manualScheduler();
    setScheduler(clock);
    const [b, r] = [{} as { s?: Shapes }, {} as { s?: Shapes }];
    const hidden = engine('pending', b);
    hidden.mount(false);
    hidden.update('pending', '', 0);
    // 300ms turning, hidden for 2.1s (not a whole number of turns), shown for 400ms: 700ms of turning in all.
    clock.advance(300);
    await task();
    hidden.setVisible(false);
    const held = JSON.stringify(b.s);
    clock.advance(1800);
    expect(JSON.stringify(b.s), 'held').toBe(held);
    // The reference starts 300ms before b is shown, so both have turned 700ms at the end.
    await task();
    const reference = engine('pending', r);
    reference.mount(false);
    reference.update('pending', '', 0);
    clock.advance(300);
    expect(JSON.stringify(b.s), 'still held').toBe(held);
    await task();
    hidden.setVisible(true);
    clock.advance(400);
    expect(JSON.stringify(b.s)).toBe(JSON.stringify(r.s));
    hidden.destroy();
    reference.destroy();
  });

  it('FrameController: hidden, a looping action holds; shown, it carries on', () => {
    const clock = manualScheduler();
    setScheduler(clock);
    let painted = '';
    const c = new FrameController(
      fromHover(RenewPlainSpec as never),
      (s) => (painted = JSON.stringify(s))
    );
    const player = actionPlayerOf(c as never)!;
    void player.trigger({ loop: true });
    clock.advance(300);
    c.setVisible(false);
    const held = painted;
    clock.advance(2000);
    expect(painted).toBe(held);
    c.setVisible(true);
    clock.advance(100);
    expect(painted).not.toBe(held);
    c.destroy();
  });
});

describe('tones', () => {
  it('forced colors: toned paints follow the user palette (CSS on [stroke^="var("], [fill^="var("])', () => {
    expect(FORCED_COLORS_CSS).toContain('@media (forced-colors: active)');
    expect(FORCED_COLORS_CSS).toMatch(
      /\[stroke\^="var\("\] \{ stroke: currentColor; \}/
    );
    expect(FORCED_COLORS_CSS).toMatch(
      /\[fill\^="var\("\] \{ fill: currentColor; \}/
    );
  });
});

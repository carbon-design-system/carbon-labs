/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import {
  createLoadingGate,
  LOADING_GATE,
  type GateClock,
  type LoadingView,
} from '../components/gate';

/** A clock that only moves when told to. */
function fakeClock() {
  let t = 0;
  let next = 1;
  const timers = new Map<number, { at: number; fn: () => void }>();
  const clock: GateClock = {
    now: () => t,
    set: (fn, ms) => {
      const id = next++;
      timers.set(id, { at: t + ms, fn });
      return id;
    },
    clear: (h) => void timers.delete(h as number),
  };
  const advance = (ms: number) => {
    const end = t + ms;
    for (;;) {
      const due = [...timers.entries()]
        .filter(([, v]) => v.at <= end)
        .sort((a, b) => a[1].at - b[1].at)[0];
      if (!due) {
        break;
      }
      timers.delete(due[0]);
      t = due[1].at;
      due[1].fn();
    }
    t = end;
  };
  return { clock, advance, pending: () => timers.size };
}

/** A gate on a fake clock that logs each view with the time it came. */
function gate(showAfterMs: number, minVisibleMs: number) {
  const c = fakeClock();
  const log: [number, LoadingView, unknown][] = [];
  const g = createLoadingGate({
    showAfterMs,
    minVisibleMs,
    clock: c.clock,
    onChange: (v, r) => log.push([c.clock.now(), v, r]),
  });
  return { g, log, ...c };
}

describe('createLoadingGate', () => {
  it('recommends moderate-03 before the loader and half a loading period after', () => {
    expect(LOADING_GATE.showAfterMs).toBe(300);
    expect(LOADING_GATE.minVisibleMs).toBe(500);
  });

  it('shows nothing for work that ends inside the gate, and goes straight to the result', () => {
    const { g, log, advance } = gate(300, 500);
    g.start();
    advance(200);
    expect(g.view).toBe('nothing');
    g.finish('saved');
    expect(log).toEqual([[200, 'result', 'saved']]);
    advance(1000);
    expect(log).toHaveLength(1);
  });

  it('shows the loader once the gate has passed', () => {
    const { g, log, advance } = gate(300, 500);
    g.start();
    advance(299);
    expect(g.view).toBe('nothing');
    advance(1);
    expect(g.view).toBe('loader');
    expect(log).toEqual([[300, 'loader', undefined]]);
  });

  it('holds the loader for minVisible when the work ends soon after it shows', () => {
    const { g, log, advance } = gate(300, 500);
    g.start();
    advance(700); // the loader showed at 300
    g.finish('done');
    expect(g.view).toBe('loader');
    advance(99);
    expect(g.view).toBe('loader');
    advance(1);
    expect(log).toEqual([
      [300, 'loader', undefined],
      [800, 'result', 'done'],
    ]);
  });

  it('lets the result through at once when the loader has shown long enough', () => {
    const { g, log, advance } = gate(300, 500);
    g.start();
    advance(4000);
    g.finish();
    expect(log.map(([t, v]) => [t, v])).toEqual([
      [300, 'loader'],
      [4000, 'result'],
    ]);
  });

  it('never shows the loader for less than minVisible, whenever the work ends', () => {
    for (const ends of [301, 350, 500, 799, 800, 801, 1200]) {
      const { g, log, advance } = gate(300, 500);
      g.start();
      advance(ends);
      g.finish();
      advance(2000);
      const shown = log.find(([, v]) => v === 'loader')![0];
      const gone = log.find(([, v]) => v === 'result')![0];
      expect(gone - shown, `work ending at ${ends}ms`).toBeGreaterThanOrEqual(
        500
      );
    }
  });

  it('defaults to v11: the loader at once, gone when the work ends', () => {
    const { g, log, advance } = gate(0, 0);
    g.start();
    expect(g.view).toBe('loader');
    advance(50);
    g.finish();
    expect(log).toEqual([
      [0, 'loader', undefined],
      [50, 'result', undefined],
    ]);
  });

  it('with no delay, still holds the loader for minVisible', () => {
    const { g, advance } = gate(0, 500);
    g.start();
    advance(100);
    g.finish();
    expect(g.view).toBe('loader');
    advance(400);
    expect(g.view).toBe('result');
  });

  it('cancels to nothing at once, from the gate or the hold, and clears its timers', () => {
    const a = gate(300, 500);
    a.g.start();
    a.advance(100);
    a.g.cancel();
    expect(a.g.view).toBe('nothing');
    expect(a.pending()).toBe(0);
    a.advance(1000);
    expect(a.log).toEqual([]);

    const b = gate(300, 500);
    b.g.start();
    b.advance(400);
    b.g.finish();
    b.g.cancel();
    expect(b.g.view).toBe('nothing');
    expect(b.pending()).toBe(0);
  });

  it('ignores a start while work runs, and a finish when none does', () => {
    const { g, log, advance } = gate(300, 500);
    g.finish();
    expect(log).toEqual([]);
    g.start();
    advance(200);
    g.start(); // does not restart the gate
    advance(100);
    expect(g.view).toBe('loader');
  });

  it('starts again after a result, through the gate', () => {
    const { g, log, advance } = gate(300, 500);
    g.start();
    advance(100);
    g.finish();
    g.start();
    expect(g.view).toBe('nothing');
    advance(300);
    expect(g.view).toBe('loader');
    expect(log.map(([t, v]) => [t, v])).toEqual([
      [100, 'result'],
      [100, 'nothing'],
      [400, 'loader'],
    ]);
  });

  it('takes new timings from the next start', () => {
    const { g, advance } = gate(300, 500);
    g.set({ showAfterMs: 0, minVisibleMs: 0 });
    g.start();
    expect(g.view).toBe('loader');
    advance(10);
    g.finish();
    expect(g.view).toBe('result');
  });
});

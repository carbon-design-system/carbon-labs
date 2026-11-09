/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { attachLoopVisibility } from '../components/loopVisibility';

/**
 * The hold, on fakes: an Animation with the Web Animations API's play states
 * (a start time set on a paused animation runs it), an element that lists
 * them, and an IntersectionObserver the test drives.
 */
class FakeAnimation {
  playState: 'running' | 'paused' | 'idle' | 'finished' = 'running';
  private start: number | null;
  private hold: number | null = null;
  ready = Promise.resolve(this);
  constructor(
    start: number,
    private readonly iterations = Infinity,
    private readonly clock = { now: 0 }
  ) {
    this.start = start;
  }
  effect = { getTiming: () => ({ iterations: this.iterations }) };
  get startTime() {
    return this.start;
  }
  set startTime(v: number | null) {
    this.start = v;
    if (v !== null) {
      this.hold = null;
      this.playState = 'running';
    }
  }
  get currentTime() {
    return (
      this.hold ?? (this.start === null ? null : this.clock.now - this.start)
    );
  }
  pause() {
    this.hold = this.currentTime;
    this.start = null;
    this.playState = 'paused';
  }
  play() {
    if (this.hold !== null) {
      this.start = this.clock.now - this.hold;
    }
    this.hold = null;
    this.playState = 'running';
  }
}

let seen: (el: Element, on: boolean) => void;

beforeEach(() => {
  const targets = new Set<Element>();
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(
        cb: (r: { target: Element; isIntersecting: boolean }[]) => void
      ) {
        seen = (el, on) =>
          targets.has(el) && cb([{ target: el, isIntersecting: on }]);
      }
      observe(el: Element) {
        targets.add(el);
      }
      unobserve(el: Element) {
        targets.delete(el);
      }
      disconnect() {
        targets.clear();
      }
    }
  );
  vi.stubGlobal('MutationObserver', undefined);
  vi.stubGlobal('document', {
    visibilityState: 'visible',
    addEventListener() {},
    removeEventListener() {},
  });
});

afterEach(() => vi.unstubAllGlobals());

const elementWith = (anims: FakeAnimation[]) =>
  ({ getAnimations: () => anims }) as unknown as Element;

describe('attachLoopVisibility', () => {
  it('holds a loop off screen and puts it back on its own start time', async () => {
    const clock = { now: 1000 };
    const loop = new FakeAnimation(250, Infinity, clock);
    const once = new FakeAnimation(900, 1, clock);
    const el = elementWith([loop, once]);
    const v = attachLoopVisibility(el);
    seen(el, false);
    expect(loop.playState).toBe('paused');
    // An entrance finishes as it would.
    expect(once.playState).toBe('running');
    await loop.ready;
    clock.now = 5000;
    seen(el, true);
    expect(loop.playState).toBe('running');
    expect(loop.startTime).toBe(250);
    v.detach();
  });

  it('a held loop the component re-times (its start time set) is held again on refresh', async () => {
    const loop = new FakeAnimation(0);
    const el = elementWith([loop]);
    const v = attachLoopVisibility(el);
    seen(el, false);
    await loop.ready;
    expect(loop.playState).toBe('paused');
    // ShimmerText's placeStarting, Processing's pulse re-time: a new start un-pauses it.
    loop.startTime = 700;
    expect(loop.playState).toBe('running');
    v.refresh();
    expect(v.hidden()).toBe(true);
    expect(loop.playState).toBe('paused');
    // And it comes back on the new start.
    seen(el, true);
    expect(loop.startTime).toBe(700);
    v.detach();
  });

  it('a loop the component stopped while held stays stopped', async () => {
    const loop = new FakeAnimation(0);
    const el = elementWith([loop]);
    const v = attachLoopVisibility(el);
    seen(el, false);
    await loop.ready;
    v.release([loop as unknown as Animation]);
    seen(el, true);
    expect(loop.playState).toBe('paused');
    v.detach();
  });

  it('tells the component when the element comes back', () => {
    const el = elementWith([]);
    const v = attachLoopVisibility(el);
    const back = vi.fn();
    v.onShow(back);
    seen(el, true);
    expect(back).not.toHaveBeenCalled();
    seen(el, false);
    seen(el, true);
    expect(back).toHaveBeenCalledTimes(1);
    v.detach();
  });

  it('a loop an inner watcher stopped stays stopped when an outer one lets go', async () => {
    const loop = new FakeAnimation(0);
    const outer = elementWith([loop]);
    const inner = elementWith([loop]);
    const o = attachLoopVisibility(outer);
    const i = attachLoopVisibility(inner);
    // The outer is hidden alone: it holds the inner's loop.
    seen(outer, false);
    await loop.ready;
    expect(loop.playState).toBe('paused');
    // The inner's component stops it (a Spinner's stop while hidden).
    i.release([loop as unknown as Animation]);
    seen(outer, true);
    expect(loop.playState).toBe('paused');
    i.detach();
    o.detach();
  });

  it('one observer serves every held root, and lets each go when it is shown', async () => {
    const made: { targets: Set<unknown>; cb: () => void }[] = [];
    vi.stubGlobal(
      'MutationObserver',
      class {
        targets = new Set<unknown>();
        constructor(public cb: () => void) {
          made.push(this);
        }
        observe(el: unknown) {
          this.targets.add(el);
        }
        disconnect() {
          this.targets.clear();
        }
        takeRecords() {
          return [];
        }
      }
    );
    const els = Array.from({ length: 20 }, () =>
      elementWith([new FakeAnimation(0)])
    );
    const vs = els.map((el) => attachLoopVisibility(el));
    els.forEach((el) => seen(el, false));
    expect(made.length).toBe(1);
    expect(made[0].targets.size).toBe(20);
    // Shown again: the observer keeps only the roots still held.
    els.slice(0, 15).forEach((el) => seen(el, true));
    await Promise.resolve();
    expect(made[0].targets.size).toBe(5);
    vs.forEach((v) => v.detach());
    await Promise.resolve();
    expect(made.every((m) => m.targets.size === 0)).toBe(true);
  });
});

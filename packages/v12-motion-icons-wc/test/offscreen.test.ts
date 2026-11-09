/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Off screen, loops and pending spinners hold where
 * they are, through one IntersectionObserver per document (not one per
 * icon), and carry on when they come back. jsdom has no IntersectionObserver:
 * a fake one here reports what the test says is on screen.
 */
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  manualScheduler,
  setScheduler,
  type Scheduler,
} from '@carbon-labs/motion-icons-core/engine';

class FakeIO {
  static all: FakeIO[] = [];
  observed = new Set<Element>();
  constructor(
    private cb: (
      entries: { target: Element; isIntersecting: boolean }[]
    ) => void
  ) {
    FakeIO.all.push(this);
  }
  observe(el: Element) {
    this.observed.add(el);
  }
  unobserve(el: Element) {
    this.observed.delete(el);
  }
  disconnect() {
    this.observed.clear();
  }
  show(els: Element[], on: boolean) {
    this.cb(els.map((target) => ({ target, isIntersecting: on })));
  }
}

type IconEl = HTMLElement & { updateComplete: Promise<unknown> };

beforeAll(async () => {
  vi.stubGlobal('IntersectionObserver', FakeIO);
  await import('../src/define-all');
});

const made: Element[] = [];
afterEach(() => {
  made.splice(0).forEach((e) => e.remove());
  setScheduler(null);
});

function countingClock() {
  const c = manualScheduler();
  const s = {
    ticks: 0,
    now: c.now,
    cancel: c.cancel,
    request: (cb: (t: number) => void) =>
      c.request((t) => {
        s.ticks++;
        cb(t);
      }),
    advance: c.advance,
  };
  setScheduler(s as Scheduler);
  return s;
}

const flush = async () => {
  for (let i = 0; i < 4; i++) {
    await new Promise<void>((r) => setTimeout(r, 0));
  }
};
const drawing = (el: Element) => el.shadowRoot!.querySelector('svg')!.innerHTML;

describe('off screen', () => {
  it('one observer for every icon; hidden, spinners and loops take no frames and hold; shown, they carry on', async () => {
    const clock = countingClock();
    const root = document.createElement('div');
    root.innerHTML =
      '<clabs-motion-icon-settings status="pending"></clabs-motion-icon-settings><clabs-motion-icon-copy status="pending"></clabs-motion-icon-copy><clabs-motion-icon-renew loop></clabs-motion-icon-renew><clabs-motion-icon-trash-can loop></clabs-motion-icon-trash-can>';
    document.body.append(root);
    made.push(root);
    const icons = [...root.children] as IconEl[];
    await Promise.all(icons.map((i) => i.updateComplete));
    expect(FakeIO.all).toHaveLength(1);
    const io = FakeIO.all[0];
    expect(icons.every((i) => io.observed.has(i))).toBe(true);
    clock.advance(200);
    await flush();
    io.show(icons, false);
    await flush();
    const held = icons.map(drawing);
    const before = clock.ticks;
    for (let i = 0; i < 60; i++) {
      clock.advance(1000 / 60);
      await Promise.resolve();
    }
    expect(
      clock.ticks - before,
      'no frames while every icon is off screen'
    ).toBe(0);
    expect(icons.map(drawing)).toEqual(held);
    io.show(icons, true);
    await flush();
    const seen = icons.map(() => new Set<string>());
    for (let i = 0; i < 20; i++) {
      clock.advance(1000 / 60);
      await Promise.resolve();
      icons.forEach((el, k) => seen[k].add(drawing(el)));
    }
    expect(seen.map((s) => s.size > 3)).toEqual(icons.map(() => true));
    // Disconnected, it is no longer observed.
    root.remove();
    expect(icons.some((i) => io.observed.has(i))).toBe(false);
  });

  it('an icon built while off screen (a pending status set later) starts held', async () => {
    const clock = countingClock();
    const root = document.createElement('div');
    root.innerHTML =
      '<clabs-motion-icon-settings></clabs-motion-icon-settings>';
    document.body.append(root);
    made.push(root);
    const el = root.firstElementChild as IconEl;
    await el.updateComplete;
    FakeIO.all[0].show([el], false);
    el.setAttribute('status', 'pending');
    await el.updateComplete;
    await flush();
    // The mark enters (a one-shot), then nothing more.
    for (let i = 0; i < 60; i++) {
      clock.advance(1000 / 60);
      await Promise.resolve();
    }
    const before = clock.ticks;
    clock.advance(1000);
    await flush();
    expect(clock.ticks - before).toBe(0);
  });
});

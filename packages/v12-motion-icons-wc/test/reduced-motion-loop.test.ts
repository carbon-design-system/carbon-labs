/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * A `loop` still set when reduced motion turns back
 * off starts again (the pending spinner already resumed). Its own file: the
 * core reads the media query once, so the stub (one the test can flip) is in
 * place before anything loads.
 */
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  manualScheduler,
  setScheduler,
} from '@carbon-labs/motion-icons-core/engine';

type IconEl = HTMLElement & {
  updateComplete: Promise<unknown>;
  loop: boolean;
  animated?: boolean;
};

const query = { matches: false, listeners: new Set<() => void>() };
const setReduced = (on: boolean) => {
  query.matches = on;
  query.listeners.forEach((l) => l());
};

beforeAll(async () => {
  vi.stubGlobal('matchMedia', (q: string) => ({
    get matches() {
      return q.includes('reduce') && query.matches;
    },
    media: q,
    addEventListener: (_: string, l: () => void) => query.listeners.add(l),
    removeEventListener: (_: string, l: () => void) =>
      query.listeners.delete(l),
  }));
  await import('../src/define-all');
});

const made: Element[] = [];
afterEach(() => {
  made.splice(0).forEach((e) => e.remove());
  setScheduler(null);
  setReduced(false);
});

async function frames(
  clock: ReturnType<typeof manualScheduler>,
  el: Element,
  ms: number
): Promise<Set<string>> {
  const seen = new Set<string>();
  for (let t = 0; t < ms; t += 1000 / 60) {
    clock.advance(1000 / 60);
    for (let i = 0; i < 4; i++) {
      await Promise.resolve();
    }
    seen.add(el.shadowRoot!.querySelector('svg')!.innerHTML);
  }
  return seen;
}

describe('a loop through reduced motion', () => {
  for (const tag of [
    'clabs-motion-icon-renew',
    'clabs-motion-icon-trash-can',
  ]) {
    it(`${tag}: still under reduced motion, looping again when it turns back off`, async () => {
      const clock = manualScheduler();
      setScheduler(clock);
      const el = document.createElement(tag) as IconEl;
      el.setAttribute('loop', '');
      document.body.append(el);
      made.push(el);
      await el.updateComplete;
      expect((await frames(clock, el, 400)).size, 'looping').toBeGreaterThan(3);
      setReduced(true);
      await el.updateComplete;
      await frames(clock, el, 100);
      expect((await frames(clock, el, 400)).size, 'still').toBe(1);
      setReduced(false);
      await el.updateComplete;
      expect(
        (await frames(clock, el, 600)).size,
        'looping again'
      ).toBeGreaterThan(3);
      // `animated` off and on again: the same.
      el.setAttribute('animated', 'false');
      await el.updateComplete;
      el.setAttribute('animated', '');
      await el.updateComplete;
      expect(
        (await frames(clock, el, 600)).size,
        'looping after animated off and on'
      ).toBeGreaterThan(3);
    });
  }
});

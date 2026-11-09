/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The reduced-motion preference changing while the page is open (the React
 * package's reducedMotion.test.tsx has the same for its icons): turned on
 * mid-hover, the element settles at rest at once and then draws nothing new
 * for play(), hover or keyboard focus; turned off again, it hovers again.
 * Its own file: the core reads the media query once, on first use, so the
 * stub goes in before anything loads.
 */
import { afterAll, beforeAll, expect, it, vi } from 'vitest';
import {
  manualScheduler,
  setScheduler,
} from '@carbon-labs/motion-icons-core/engine';

type IconEl = HTMLElement & {
  play(): void;
  updateComplete: Promise<unknown>;
  isAnimated: boolean;
};

let reduce = false;
const listeners = new Set<() => void>();
const setReduce = (on: boolean) => {
  reduce = on;
  listeners.forEach((l) => l());
};
const clock = manualScheduler();

beforeAll(async () => {
  vi.stubGlobal('matchMedia', (q: string) => ({
    get matches() {
      return q.includes('reduce') && reduce;
    },
    media: q,
    addEventListener: (_: string, cb: () => void) => listeners.add(cb),
    removeEventListener: (_: string, cb: () => void) => listeners.delete(cb),
  }));
  setScheduler(clock);
  await import('../src/define-all');
});
afterAll(() => {
  setScheduler(null);
  vi.unstubAllGlobals();
});

async function frames(n: number, each: () => void = () => undefined) {
  for (let i = 0; i < n; i++) {
    clock.advance(1000 / 60);
    await Promise.resolve();
    each();
  }
}

it('turned on mid-hover: back at rest at once, then play(), hover and focus draw nothing; turned off: it hovers again', async () => {
  const root = document.createElement('div');
  root.innerHTML =
    '<button data-motion-icon-frame><clabs-motion-icon-settings size="32"></clabs-motion-icon-settings></button>';
  document.body.append(root);
  const icon = root.querySelector('clabs-motion-icon-settings') as IconEl;
  await icon.updateComplete;
  const frame = root.querySelector('button')!;
  const ink = () => icon.shadowRoot!.querySelector('g[data-mc-ink]')!.innerHTML;
  const rest = ink();
  expect(icon.isAnimated).toBe(true);

  // Hovering, part way in.
  frame.dispatchEvent(new MouseEvent('mouseenter'));
  await frames(6);
  expect(ink(), 'the hover is under way').not.toBe(rest);

  // The OS setting turns on: at rest, not easing back.
  setReduce(true);
  expect(icon.isAnimated).toBe(false);
  await frames(1);
  expect(ink(), 'at rest the frame after the change').toBe(rest);

  // Nothing moves it while it lasts: the pointer still over the frame, a play(), keyboard focus.
  frame.dispatchEvent(new MouseEvent('mouseleave'));
  frame.dispatchEvent(new MouseEvent('mouseenter'));
  icon.play();
  frame.focus();
  await frames(40, () => expect(ink()).toBe(rest));
  frame.blur();
  frame.dispatchEvent(new MouseEvent('mouseleave'));
  await frames(2);

  // Off again: a hover plays.
  setReduce(false);
  expect(icon.isAnimated).toBe(true);
  frame.dispatchEvent(new MouseEvent('mouseenter'));
  let moved = 0;
  await frames(20, () => ink() !== rest && moved++);
  expect(moved, 'hovers again once the setting is off').toBeGreaterThan(5);
  root.remove();
});

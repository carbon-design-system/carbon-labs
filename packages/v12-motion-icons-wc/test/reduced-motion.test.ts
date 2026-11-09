/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Under reduced motion (prefers-reduced-motion: reduce, no `animated`),
 * `el.play()` is a no-op, and so are hover and keyboard focus. Its own file:
 * the core reads the media query once, on first use, so it is stubbed
 * before anything loads.
 */
import { beforeAll, expect, it, vi } from 'vitest';
import {
  manualScheduler,
  setScheduler,
} from '@carbon-labs/motion-icons-core/engine';

type IconEl = HTMLElement & {
  play(): void;
  updateComplete: Promise<unknown>;
  isAnimated: boolean;
};

beforeAll(async () => {
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: q.includes('reduce'),
    media: q,
    addEventListener() {},
    removeEventListener() {},
  }));
  await import('../src/define-all');
});

it('play(), hover and keyboard focus draw nothing new under reduced motion', async () => {
  const clock = manualScheduler();
  setScheduler(clock);
  const root = document.createElement('div');
  root.innerHTML =
    '<button data-motion-icon-frame><clabs-motion-icon-settings size="32"></clabs-motion-icon-settings></button>';
  document.body.append(root);
  const icon = root.querySelector('clabs-motion-icon-settings') as IconEl;
  await icon.updateComplete;
  expect(icon.isAnimated).toBe(false);
  const g = icon.shadowRoot!.querySelector('g[data-mc-ink]')!;
  const rest = g.innerHTML;
  const frame = root.querySelector('button')!;
  icon.play();
  frame.dispatchEvent(new MouseEvent('mouseenter'));
  frame.focus();
  for (let i = 0; i < 40; i++) {
    clock.advance(1000 / 60);
    await Promise.resolve();
    expect(g.innerHTML).toBe(rest);
  }
  root.remove();
  setScheduler(null);
});

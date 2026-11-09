/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * `size` changed on a mounted icon, from unset (32) too, draws as an icon
 * mounted at that size (the web components' edge, checked here too: React
 * re-renders, a status icon remounts its drawing at rest, and StatusPip's
 * count takes the size's default cap, "99+" at 32 and "9+" at 16).
 */
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  BookmarkToggle,
  Notification,
  Save,
  Settings,
  StatusPip,
} from '../index';

afterEach(() => cleanup());
const ink = (c: HTMLElement) => c.querySelector('[data-mc-ink]')!.innerHTML;

describe('size set after mount', () => {
  for (const [what, el] of [
    [
      'a count (a number at 32, the pip below)',
      (size?: 16) => <Notification animated count={3} size={size} />,
    ],
    [
      'a status icon',
      (size?: 16) => <Save animated status="success" size={size} />,
    ],
    ['a hover icon', (size?: 16) => <Settings animated size={size} />],
    ['a toggle', (size?: 16) => <BookmarkToggle animated size={size} />],
    ['the pip', (size?: 16) => <StatusPip animated count={120} size={size} />],
  ] as const) {
    it(`${what}: from unset to 16 draws as one mounted at 16, and back as one at 32`, () => {
      const at16 = ink(render(el(16)).container);
      const at32 = ink(render(el()).container);
      const { container, rerender } = render(el());
      rerender(el(16));
      expect(container.querySelector('svg')!.getAttribute('width')).toBe('16');
      expect(ink(container)).toBe(at16);
      rerender(el());
      expect(ink(container)).toBe(at32);
    });
  }
});

/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { act, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ActionGroup } from '../components/ActionGroup';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('ActionGroup’s shared tooltip', () => {
  // `offsetLeft` runs from the group's left in either direction: the tip is
  // placed with `left`, never the inline start (the right, right to left).
  it.each(['ltr', 'rtl'] as const)(
    '%s: sits over the button from the left',
    (dir) => {
      vi.useFakeTimers();
      vi.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(
        function (this: HTMLElement) {
          return this.getAttribute('aria-label') === 'Voice' ? 40 : 0;
        }
      );
      vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(32);
      const { container } = render(
        <div dir={dir}>
          <ActionGroup label="Actions">
            <button type="button" aria-label="Attach" />
            <button type="button" aria-label="Voice" />
          </ActionGroup>
        </div>
      );
      fireEvent.pointerOver(container.querySelector('[aria-label="Voice"]')!);
      act(() => {
        vi.advanceTimersByTime(200);
      });
      const tip = container.querySelector<HTMLElement>(
        '.cds--chat-input__tip'
      )!;
      expect(tip.style.left).toBe('40px');
      expect(tip.style.insetInlineStart).toBe('');
      expect(tip.style.inlineSize).toBe('32px');
    }
  );
});

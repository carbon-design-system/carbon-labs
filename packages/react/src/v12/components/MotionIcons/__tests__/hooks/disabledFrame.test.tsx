/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * No hover inside a disabled button: when the icon's
 * frame is a disabled button (`disabled`, `aria-disabled="true"`, or
 * Carbon's `disabled` on cds-button / cds-icon-button), pointer hover,
 * keyboard focus and play() don't animate. Enabled again, it hovers.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import {
  manualScheduler,
  setScheduler,
} from '@carbon-labs/motion-icons-core/engine/animate';
import { playHover } from '../../hooks/usePlayHover';
import { Settings } from '../../icons/controls/Settings';

let clock: ReturnType<typeof manualScheduler>;
afterEach(() => setScheduler(null));

async function frames(ms: number, each: () => void) {
  for (let t = 0; t < ms; t += 1000 / 60) {
    clock.advance(1000 / 60);
    await act(async () => {
      await Promise.resolve();
    });
    each();
  }
}

describe('a disabled button frame', () => {
  it.each([
    ['disabled', { disabled: true }],
    ['aria-disabled="true"', { 'aria-disabled': true }],
  ] as const)(
    '%s: pointer, keyboard focus and play() leave the icon at rest; enabled, it hovers',
    async (_, props) => {
      clock = manualScheduler();
      setScheduler(clock);
      const { rerender } = render(
        <button
          type="button"
          data-motion-icon-frame=""
          data-testid="frame"
          {...props}>
          <Settings size={20} /> Settings
        </button>
      );
      const frame = screen.getByTestId('frame');
      const drawing = () => frame.querySelector('svg')!.innerHTML;
      const rest = drawing();
      const seen = new Set<string>();
      fireEvent.mouseEnter(frame);
      act(() => frame.focus());
      expect(playHover(frame)).toBe(1);
      await frames(500, () => seen.add(drawing()));
      expect([...seen]).toEqual([rest]);
      fireEvent.mouseLeave(frame);
      act(() => frame.blur());
      rerender(
        <button type="button" data-motion-icon-frame="" data-testid="frame">
          <Settings size={20} /> Settings
        </button>
      );
      fireEvent.mouseEnter(frame);
      const after = new Set<string>();
      await frames(400, () => after.add(drawing()));
      expect(after.size, 'hovers once enabled').toBeGreaterThan(3);
    }
  );
});

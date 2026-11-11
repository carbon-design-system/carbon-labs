/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */
// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { Slider } from '../components/Slider';

// jsdom has no layout: the slider's observers watch nothing.
beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
});
afterEach(cleanup);

/** A slider at 50 in a page running `dir`; returns its knob and its onChange. */
function slider(dir: 'ltr' | 'rtl') {
  const onChange = vi.fn();
  render(
    <div dir={dir}>
      <Slider
        id="volume"
        labelText="Volume"
        min={0}
        max={100}
        value={50}
        hideTextInput
        onChange={onChange}
      />
    </div>
  );
  return { knob: screen.getByRole('slider'), onChange };
}

const last = (fn: ReturnType<typeof vi.fn>) => fn.mock.lastCall?.[0]?.value;

describe('Slider keys by direction', () => {
  it('raises the value with the right arrow, left to right', () => {
    const { knob, onChange } = slider('ltr');
    fireEvent.keyDown(knob, { key: 'ArrowRight' });
    expect(last(onChange)).toBe(51);
    fireEvent.keyDown(knob, { key: 'ArrowLeft' });
    expect(last(onChange)).toBe(50);
  });

  it('raises the value with the left arrow, right to left, as a range input does', () => {
    const { knob, onChange } = slider('rtl');
    fireEvent.keyDown(knob, { key: 'ArrowLeft' });
    expect(last(onChange)).toBe(51);
    fireEvent.keyDown(knob, { key: 'ArrowRight' });
    expect(last(onChange)).toBe(50);
  });

  it('keeps the vertical arrows in both directions', () => {
    const { knob, onChange } = slider('rtl');
    fireEvent.keyDown(knob, { key: 'ArrowUp' });
    expect(last(onChange)).toBe(51);
  });
});

/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */
// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
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

describe('Slider names', () => {
  it('names the two knobs of a range by their bounds, in a group the label names', () => {
    render(
      <Slider
        id="price"
        labelText="Price"
        min={0}
        max={100}
        value={20}
        unstable_valueUpper={80}
        hideTextInput
      />
    );
    const [lower, upper] = screen.getAllByRole('slider');
    expect(lower.getAttribute('aria-label')).toBe('Lower bound');
    expect(upper.getAttribute('aria-label')).toBe('Upper bound');
    const group = screen.getByRole('group');
    expect(group.getAttribute('aria-labelledby')).toBe('price-label');
    expect(group.contains(lower) && group.contains(upper)).toBe(true);
  });

  it("names the two knobs with the caller's labels", () => {
    render(
      <Slider
        id="price"
        labelText="Price"
        min={0}
        max={100}
        value={20}
        unstable_valueUpper={80}
        ariaLabelInput="Lowest price"
        unstable_ariaLabelInputUpper="Highest price"
        hideTextInput
      />
    );
    const [lower, upper] = screen.getAllByRole('slider');
    expect(lower.getAttribute('aria-label')).toBe('Lowest price');
    expect(upper.getAttribute('aria-label')).toBe('Highest price');
  });

  it("names one knob with no label by the caller's label", () => {
    render(
      <Slider
        id="volume"
        min={0}
        max={100}
        value={50}
        ariaLabelInput="Volume"
        hideTextInput
      />
    );
    const knob = screen.getByRole('slider');
    expect(knob.getAttribute('aria-label')).toBe('Volume');
    expect(knob.hasAttribute('aria-labelledby')).toBe(false);
    expect(screen.queryByRole('group')).toBeNull();
  });

  it('names one knob by its label', () => {
    render(
      <Slider
        id="volume"
        labelText="Volume"
        min={0}
        max={100}
        value={50}
        ariaLabelInput="Ignored"
        hideTextInput
      />
    );
    const knob = screen.getByRole('slider');
    expect(knob.getAttribute('aria-labelledby')).toBe('volume-label');
    expect(knob.hasAttribute('aria-label')).toBe(false);
  });

  it('reads the two values of a read-only range', () => {
    render(
      <Slider
        id="price"
        labelText="Price"
        min={0}
        max={100}
        value={20}
        unstable_valueUpper={80}
        readOnly
      />
    );
    const range = screen.getByRole('img');
    expect(range.hasAttribute('aria-labelledby')).toBe(false);
    expect(range.getAttribute('aria-label')).toBe('Price: 20–80');
  });

  it('names a read-only value by its label', () => {
    render(
      <Slider
        id="volume"
        labelText="Volume"
        min={0}
        max={100}
        value={50}
        readOnly
      />
    );
    expect(screen.getByRole('meter').getAttribute('aria-labelledby')).toBe(
      'volume-label'
    );
  });
});

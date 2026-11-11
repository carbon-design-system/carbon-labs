/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MultiFieldInput } from '../components/MultiFieldInput';

/** A three-part field in a page running `dir`; returns its inputs. */
function field(dir: 'ltr' | 'rtl') {
  render(
    <div dir={dir}>
      <MultiFieldInput
        id="date"
        labelText="Date"
        segments={[
          { label: 'Day', value: '12' },
          { label: 'Month', value: '05' },
          { label: 'Year', value: '2026' },
        ]}
      />
    </div>
  );
  return ['Day', 'Month', 'Year'].map(
    (name) => screen.getByLabelText(name) as HTMLInputElement
  );
}

/** Puts the caret at `at` in `input` and presses `key`. */
function press(input: HTMLInputElement, at: number, key: string) {
  input.focus();
  input.setSelectionRange(at, at);
  fireEvent.keyDown(input, { key });
}

describe('MultiFieldInput keys by direction', () => {
  it('goes on with the right arrow at a value’s end, left to right', () => {
    const [day, month] = field('ltr');
    press(day, 2, 'ArrowRight');
    expect(document.activeElement).toBe(month);
    press(month, 0, 'ArrowLeft');
    expect(document.activeElement).toBe(day);
  });

  it('goes on with the left arrow at a value’s end, right to left', () => {
    const [day, month] = field('rtl');
    press(day, 2, 'ArrowRight');
    expect(document.activeElement).toBe(day);
    press(day, 2, 'ArrowLeft');
    expect(document.activeElement).toBe(month);
    press(month, 0, 'ArrowRight');
    expect(document.activeElement).toBe(day);
  });
});

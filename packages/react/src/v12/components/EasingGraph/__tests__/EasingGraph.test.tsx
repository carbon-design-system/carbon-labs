/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { EasingGraph } from '../components/EasingGraph';
import type { CubicBezier } from '@carbon-labs/v12-motion';

/** An editable graph in a page running `dir`; returns its first handle and onChange. */
function graph(dir: 'ltr' | 'rtl') {
  const onChange = jest.fn();
  const value: CubicBezier = [0.2, 0, 0.38, 0.9];
  render(
    <div dir={dir}>
      <EasingGraph label="Standard" value={value} onChange={onChange} />
    </div>
  );
  const [handle] = screen.getAllByRole('slider');
  return { handle: handle!, onChange };
}

/** The first handle's x in the last change. */
const x1 = (fn: jest.Mock) => fn.mock.lastCall?.[0]?.[0];

describe('EasingGraph keys by direction', () => {
  it('moves a handle on with the right arrow, left to right', () => {
    const { handle, onChange } = graph('ltr');
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    expect(x1(onChange)).toBeCloseTo(0.21);
    fireEvent.keyDown(handle, { key: 'ArrowLeft' });
    expect(x1(onChange)).toBeCloseTo(0.19);
  });

  it('moves a handle on with the left arrow, right to left', () => {
    const { handle, onChange } = graph('rtl');
    fireEvent.keyDown(handle, { key: 'ArrowLeft' });
    expect(x1(onChange)).toBeCloseTo(0.21);
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    expect(x1(onChange)).toBeCloseTo(0.19);
  });
});

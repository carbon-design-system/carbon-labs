/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */
// @vitest-environment jsdom

import { useRef } from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  rovingIndex,
  useRovingTabStop,
  type RovingOrientation,
} from '../components/roving';

afterEach(cleanup);

describe('rovingIndex', () => {
  const four = { count: 4 };

  it('moves along the axis and wraps by default', () => {
    const o = { ...four, orientation: 'horizontal' as const };
    expect(rovingIndex('ArrowRight', 0, o)).toBe(1);
    expect(rovingIndex('ArrowLeft', 0, o)).toBe(3);
    expect(rovingIndex('ArrowDown', 0, o)).toBeNull();
  });

  it('stops at the ends without wrap', () => {
    const o = { ...four, orientation: 'vertical' as const, wrap: false };
    expect(rovingIndex('ArrowDown', 3, o)).toBe(3);
    expect(rovingIndex('ArrowUp', 0, o)).toBe(0);
  });

  it('skips disabled items, Home and End included', () => {
    const o = {
      ...four,
      orientation: 'horizontal' as const,
      isDisabled: (i: number) => i === 0 || i === 2,
    };
    expect(rovingIndex('ArrowRight', 1, o)).toBe(3);
    expect(rovingIndex('Home', 3, o)).toBe(1);
    expect(rovingIndex('End', 1, o)).toBe(3);
  });

  it('reads the horizontal arrows by direction', () => {
    const o = {
      ...four,
      orientation: 'horizontal' as const,
      dir: 'rtl' as const,
    };
    expect(rovingIndex('ArrowLeft', 1, o)).toBe(2);
    expect(rovingIndex('ArrowRight', 1, o)).toBe(0);
  });

  it('takes both axes with `both`', () => {
    const o = { ...four, orientation: 'both' as const };
    expect(rovingIndex('ArrowDown', 1, o)).toBe(2);
    expect(rovingIndex('ArrowRight', 1, o)).toBe(2);
  });

  it('has nothing to move to in an empty group', () => {
    expect(
      rovingIndex('ArrowRight', 0, { count: 0, orientation: 'horizontal' })
    ).toBeNull();
  });
});

describe('useRovingTabStop', () => {
  function Group({
    dir,
    orientation,
    disabled = [],
  }: {
    dir?: 'ltr' | 'rtl';
    orientation?: RovingOrientation;
    disabled?: number[];
  }) {
    const ref = useRef<HTMLDivElement>(null);
    useRovingTabStop(ref, { items: 'button', orientation });
    return (
      <div ref={ref} dir={dir}>
        {['A', 'B', 'C'].map((label, i) => (
          <button key={label} type="button" disabled={disabled.includes(i)}>
            {label}
          </button>
        ))}
      </div>
    );
  }

  const tabStops = (root: HTMLElement) =>
    [...root.querySelectorAll('button')].map((b) => b.tabIndex);

  it('makes the first enabled item the one tab stop', () => {
    const { container } = render(<Group disabled={[0]} />);
    expect(tabStops(container)).toEqual([-1, 0, -1]);
  });

  it('moves focus and the tab stop with the arrows, and stops at the ends', () => {
    const { container, getByText } = render(<Group />);
    getByText('A').focus();
    fireEvent.keyDown(getByText('A'), { key: 'ArrowRight' });
    expect(document.activeElement).toBe(getByText('B'));
    expect(tabStops(container)).toEqual([-1, 0, -1]);
    fireEvent.keyDown(getByText('B'), { key: 'End' });
    expect(document.activeElement).toBe(getByText('C'));
    fireEvent.keyDown(getByText('C'), { key: 'ArrowRight' });
    expect(document.activeElement).toBe(getByText('C'));
  });

  it('moves the other way right to left', () => {
    const { getByText } = render(<Group dir="rtl" />);
    getByText('A').focus();
    fireEvent.keyDown(getByText('A'), { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(getByText('B'));
  });

  it('leaves the keys of the other axis alone', () => {
    const { getByText } = render(<Group orientation="vertical" />);
    getByText('A').focus();
    fireEvent.keyDown(getByText('A'), { key: 'ArrowRight' });
    expect(document.activeElement).toBe(getByText('A'));
    fireEvent.keyDown(getByText('A'), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(getByText('B'));
  });
});

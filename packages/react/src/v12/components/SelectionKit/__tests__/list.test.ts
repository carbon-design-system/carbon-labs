/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import { inlineKey } from '@carbon-labs/react-util';
import {
  selectionItemProps,
  selectionStep,
  selectionTabStop,
} from '../components/list';

const none = () => false;

describe('the list roles', () => {
  it('a tablist has tabs, selected by aria-selected, joined to a panel', () => {
    expect(
      selectionItemProps('tablist', 2, {
        selected: true,
        tabStop: true,
        id: 't-2',
        controls: 'p-2',
      })
    ).toEqual({
      role: 'tab',
      id: 't-2',
      'aria-controls': 'p-2',
      'aria-selected': true,
      tabIndex: 0,
      'data-index': 2,
    });
  });

  it('a radiogroup has radios, checked by aria-checked', () => {
    const p = selectionItemProps('radiogroup', 0, {
      selected: false,
      tabStop: false,
    });
    expect(p.role).toBe('radio');
    expect(p['aria-checked']).toBe(false);
    expect(p).not.toHaveProperty('aria-selected');
    expect(p.tabIndex).toBe(-1);
  });

  it('a listbox has options, selected by aria-selected', () => {
    const p = selectionItemProps('listbox', 1, {
      selected: true,
      tabStop: false,
    });
    expect(p.role).toBe('option');
    expect(p['aria-selected']).toBe(true);
  });
});

describe('the tab stop', () => {
  it('is the selected item', () => {
    expect(selectionTabStop(2, 4, none)).toBe(2);
  });

  it('with none selected, or a disabled one, is the first enabled item', () => {
    const off = (i: number) => i === 0;
    expect(selectionTabStop(-1, 3, off)).toBe(1);
    expect(selectionTabStop(0, 3, off)).toBe(1);
    expect(selectionTabStop(5, 3, none)).toBe(0);
    expect(selectionTabStop(-1, 2, () => true)).toBe(-1);
  });
});

describe('the keys', () => {
  const row = {
    orientation: 'horizontal' as const,
    count: 4,
    isDisabled: none,
  };

  it('reads ArrowLeft and ArrowRight in reading order', () => {
    expect(inlineKey('ArrowLeft', false)).toBe('ArrowLeft');
    expect(inlineKey('ArrowLeft', true)).toBe('ArrowRight');
    expect(inlineKey('ArrowRight', true)).toBe('ArrowLeft');
    expect(inlineKey('ArrowDown', true)).toBe('ArrowDown');
  });

  it('a horizontal list: ArrowRight is next, ArrowLeft previous, and they wrap', () => {
    expect(selectionStep('ArrowRight', 0, row)).toBe(1);
    expect(selectionStep('ArrowLeft', 0, row)).toBe(3);
  });

  it('right to left: ArrowLeft is next, ArrowRight previous', () => {
    expect(selectionStep('ArrowLeft', 0, { ...row, rtl: true })).toBe(1);
    expect(selectionStep('ArrowRight', 1, { ...row, rtl: true })).toBe(0);
  });

  it('a vertical list keeps its keys right to left, and ignores the inline arrows', () => {
    const col = { ...row, orientation: 'vertical' as const, rtl: true };
    expect(selectionStep('ArrowDown', 0, col)).toBe(1);
    expect(selectionStep('ArrowUp', 1, col)).toBe(0);
    expect(selectionStep('ArrowLeft', 1, col)).toBeNull();
  });

  it('skips disabled items, stops at the ends without wrap, and has Home and End', () => {
    const o = { ...row, isDisabled: (i: number) => i === 1, wrap: false };
    expect(selectionStep('ArrowRight', 0, o)).toBe(2);
    expect(selectionStep('ArrowRight', 3, o)).toBe(3);
    expect(selectionStep('Home', 3, o)).toBe(0);
    expect(selectionStep('End', 0, o)).toBe(3);
    expect(selectionStep('Enter', 0, o)).toBeNull();
  });
});

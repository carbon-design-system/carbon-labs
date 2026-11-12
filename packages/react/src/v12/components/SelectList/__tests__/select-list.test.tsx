/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { setReducedMotion } from '../../../vitest.dom';
import { SelectItem, SelectItemGroup, SelectList } from '../index';

setReducedMotion(true);

const list = (props: Partial<React.ComponentProps<typeof SelectList>> = {}) => (
  <SelectList label="Fruit" {...props}>
    <SelectItem value="apple">Apple</SelectItem>
    <SelectItem value="apricot">Apricot</SelectItem>
    <SelectItem value="banana" disabled>
      Banana
    </SelectItem>
    <SelectItem value="cherry">Cherry</SelectItem>
  </SelectList>
);

const opt = (name: string) => screen.getByRole('option', { name });

describe('SelectList roles', () => {
  it('is a vertical listbox named by its label, of options', () => {
    render(list({ defaultValue: 'apple' }));
    const box = screen.getByRole('listbox', { name: 'Fruit' });
    expect(box).toHaveAttribute('aria-orientation', 'vertical');
    expect(screen.getAllByRole('option')).toHaveLength(4);
  });

  it('marks the selected option, and a disabled one as such', () => {
    render(list({ defaultValue: 'apricot' }));
    expect(opt('Apricot')).toHaveAttribute('aria-selected', 'true');
    expect(opt('Apple')).toHaveAttribute('aria-selected', 'false');
    expect(opt('Banana')).toHaveAttribute('aria-disabled', 'true');
  });

  it('takes the name from `aria-label` when it is given', () => {
    render(list({ label: undefined, 'aria-label': 'Pick fruit' }));
    expect(screen.getByRole('listbox', { name: 'Pick fruit' })).toBeTruthy();
  });

  it('gathers options in a labeled group', () => {
    render(
      <SelectList label="Food">
        <SelectItemGroup label="Fruit">
          <SelectItem value="apple">Apple</SelectItem>
        </SelectItemGroup>
        <SelectItemGroup label="Veg">
          <SelectItem value="leek">Leek</SelectItem>
        </SelectItemGroup>
      </SelectList>
    );
    expect(screen.getByRole('group', { name: 'Fruit' })).toBeTruthy();
    expect(screen.getByRole('group', { name: 'Veg' })).toBeTruthy();
  });
});

describe('SelectList roving tab stop', () => {
  it('the selected option is the tab stop; with none selected, the first enabled', () => {
    const { unmount } = render(list({ defaultValue: 'cherry' }));
    expect(opt('Cherry')).toHaveAttribute('tabindex', '0');
    expect(opt('Apple')).toHaveAttribute('tabindex', '-1');
    unmount();
    render(list());
    expect(opt('Apple')).toHaveAttribute('tabindex', '0');
  });
});

describe('SelectList automatic activation', () => {
  it('arrows move focus and select, skipping a disabled row, with no wrap by default', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(list({ defaultValue: 'apple', onChange }));
    opt('Apple').focus();
    await user.keyboard('{ArrowDown}');
    expect(opt('Apricot')).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(opt('Cherry')).toHaveFocus();
    expect(opt('Cherry')).toHaveAttribute('aria-selected', 'true');
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: 'cherry', index: 3, key: 'ArrowDown' })
    );
    await user.keyboard('{ArrowDown}');
    expect(opt('Cherry')).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(opt('Apricot')).toHaveFocus();
  });

  it('wraps past the ends with `wrap`', async () => {
    const user = userEvent.setup();
    render(list({ defaultValue: 'cherry', wrap: true }));
    opt('Cherry').focus();
    await user.keyboard('{ArrowDown}');
    expect(opt('Apple')).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(opt('Cherry')).toHaveFocus();
  });

  it('Home and End reach the first and last enabled option', async () => {
    const user = userEvent.setup();
    render(list({ defaultValue: 'apricot' }));
    opt('Apricot').focus();
    await user.keyboard('{End}');
    expect(opt('Cherry')).toHaveFocus();
    await user.keyboard('{Home}');
    expect(opt('Apple')).toHaveFocus();
  });

  it('typeahead goes to the next option that starts with what is typed, and selects it', async () => {
    const user = userEvent.setup();
    render(list({ defaultValue: 'apple' }));
    opt('Apple').focus();
    await user.keyboard('c');
    expect(opt('Cherry')).toHaveFocus();
    expect(opt('Cherry')).toHaveAttribute('aria-selected', 'true');
  });

  it('typing "a" again cycles through the matches', async () => {
    const user = userEvent.setup();
    render(list({ defaultValue: 'apple' }));
    opt('Apple').focus();
    await user.keyboard('a');
    expect(opt('Apricot')).toHaveFocus();
  });

  it('a click selects, and not a disabled option', () => {
    const onChange = vi.fn();
    render(list({ onChange }));
    fireEvent.click(opt('Banana'));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(opt('Cherry'));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ value: 'cherry' })
    );
  });
});

describe('SelectList manual activation', () => {
  it('arrows and typeahead move focus only; Enter selects', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(list({ defaultValue: 'apple', activation: 'manual', onChange }));
    opt('Apple').focus();
    await user.keyboard('{ArrowDown}');
    expect(opt('Apricot')).toHaveFocus();
    await user.keyboard('c');
    expect(opt('Cherry')).toHaveFocus();
    expect(onChange).not.toHaveBeenCalled();
    expect(opt('Apple')).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{Enter}');
    expect(opt('Cherry')).toHaveAttribute('aria-selected', 'true');
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});

describe('SelectList controlled', () => {
  it('follows `value`, and `null` clears the selection', () => {
    const { rerender } = render(list({ value: 'apple' }));
    rerender(list({ value: 'cherry' }));
    expect(opt('Cherry')).toHaveAttribute('aria-selected', 'true');
    rerender(list({ value: null }));
    expect(screen.queryAllByRole('option', { selected: true })).toHaveLength(0);
  });
});

describe('SelectList right to left', () => {
  // It is a vertical list: right to left changes nothing about its keys.
  it('keeps ArrowDown as next and ArrowUp as previous', async () => {
    const user = userEvent.setup();
    render(
      <div dir="rtl">
        {list({ defaultValue: 'apple', activation: 'manual' })}
      </div>
    );
    opt('Apple').focus();
    await user.keyboard('{ArrowDown}');
    expect(opt('Apricot')).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(opt('Apple')).toHaveFocus();
  });

  it('leaves ArrowLeft and ArrowRight alone', async () => {
    const user = userEvent.setup();
    render(
      <div dir="rtl">
        {list({ defaultValue: 'apple', activation: 'manual' })}
      </div>
    );
    opt('Apple').focus();
    await user.keyboard('{ArrowLeft}');
    expect(opt('Apple')).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(opt('Apple')).toHaveFocus();
  });
});

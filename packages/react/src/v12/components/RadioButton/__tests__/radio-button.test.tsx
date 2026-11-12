/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { setReducedMotion } from '../../../vitest.dom';
import { RadioButton, RadioButtonGroup } from '../index';

setReducedMotion(true);

const group = (
  props: Partial<React.ComponentProps<typeof RadioButtonGroup>>
) => (
  <RadioButtonGroup name="size" legendText="Size" {...props}>
    <RadioButton labelText="Small" value="s" />
    <RadioButton labelText="Medium" value="m" />
    <RadioButton labelText="Large" value="l" />
  </RadioButtonGroup>
);

describe('RadioButtonGroup', () => {
  it('is a radiogroup-like fieldset named by its legend, its radios sharing a name', () => {
    render(group({}));
    expect(screen.getByRole('group', { name: 'Size' })).toBeTruthy();
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
    radios.forEach((r) => expect(r).toHaveAttribute('name', 'size'));
  });

  it('selects the `defaultSelected` one', () => {
    render(group({ defaultSelected: 'm' }));
    expect(screen.getByRole('radio', { name: 'Medium' })).toBeChecked();
  });

  it('selects on a click, deselecting the rest, and says which: value, name, event', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(group({ defaultSelected: 's', onChange }));
    await user.click(screen.getByRole('radio', { name: 'Large' }));
    expect(screen.getByRole('radio', { name: 'Large' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Small' })).not.toBeChecked();
    expect(onChange).toHaveBeenCalledWith('l', 'size', expect.anything());
  });

  it('moves the choice with the arrow keys, wrapping, as native radios do', async () => {
    const user = userEvent.setup();
    render(group({ defaultSelected: 's' }));
    screen.getByRole('radio', { name: 'Small' }).focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('radio', { name: 'Medium' })).toBeChecked();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Large' })).toBeChecked();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('radio', { name: 'Small' })).toBeChecked();
    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('radio', { name: 'Large' })).toBeChecked();
  });

  it('is controlled by `valueSelected`: a click asks, the prop decides', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [v, setV] = useState<string | number | undefined>('s');
      return (
        <>
          {group({ valueSelected: v })}
          <button onClick={() => setV('l')}>Set large</button>
        </>
      );
    }
    render(<Controlled />);
    await user.click(screen.getByRole('radio', { name: 'Medium' }));
    expect(screen.getByRole('radio', { name: 'Small' })).toBeChecked();
    await user.click(screen.getByText('Set large'));
    expect(screen.getByRole('radio', { name: 'Large' })).toBeChecked();
  });

  it('a disabled group takes no choice', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(group({ disabled: true, onChange }));
    await user.click(screen.getByRole('radio', { name: 'Medium' }));
    expect(onChange).not.toHaveBeenCalled();
    screen.getAllByRole('radio').forEach((r) => expect(r).toBeDisabled());
  });

  it('a read-only group keeps its choice, says so, and is not changed by a click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(group({ readOnly: true, defaultSelected: 's', onChange }));
    await user.click(screen.getByRole('radio', { name: 'Medium' }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('radio', { name: 'Small' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Small' })).toHaveAttribute(
      'aria-readonly',
      'true'
    );
  });

  it('shows an invalid message and marks its radios', () => {
    render(group({ invalid: true, invalidText: 'Pick one' }));
    expect(screen.getByText('Pick one')).toBeTruthy();
    expect(screen.getByRole('group')).toHaveAttribute('aria-describedby');
  });
});

describe('RadioButton', () => {
  it('stands alone: a radio named by its label, with its own checked state', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RadioButton labelText="Only" value="x" onChange={onChange} />);
    const r = screen.getByRole('radio', { name: 'Only' });
    await user.click(r);
    expect(onChange).toHaveBeenCalledWith('x', undefined, expect.anything());
  });

  it('puts its own message on an invalid radio', () => {
    render(
      <RadioButton labelText="Only" value="x" invalid invalidText="Nope" />
    );
    const r = screen.getByRole('radio', { name: 'Only' });
    expect(r).toHaveAttribute('aria-invalid', 'true');
    expect(r).toHaveAccessibleDescription('Nope');
  });
});

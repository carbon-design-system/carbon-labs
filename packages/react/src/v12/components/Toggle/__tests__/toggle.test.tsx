/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { setReducedMotion } from '../../../vitest.dom';
import { Toggle } from '../index';

setReducedMotion(true);

const sw = () => screen.getByRole('switch');

describe('Toggle', () => {
  it('is a switch, named by its label, off to begin with', () => {
    render(<Toggle id="t" labelText="Wi-Fi" />);
    expect(screen.getByRole('switch', { name: 'Wi-Fi' })).toHaveAttribute(
      'aria-checked',
      'false'
    );
  });

  it('shows the state text, "Off" and "On" unless told otherwise', () => {
    const { container } = render(<Toggle id="t" labelText="Wi-Fi" />);
    const state = () => container.querySelector('.cds-toggle__state');
    expect(state()).toHaveTextContent('Off');
    fireEvent.click(sw());
    expect(state()).toHaveTextContent('On');
  });

  it('takes `labelA` and `labelB` for the state text', () => {
    const { container } = render(
      <Toggle id="t" labelText="Wi-Fi" labelA="Away" labelB="Home" />
    );
    expect(container.querySelector('.cds-toggle__state')).toHaveTextContent(
      'Away'
    );
  });

  it('flips on a click and calls `onToggle` with the new state and its id', () => {
    const onToggle = vi.fn();
    render(<Toggle id="wifi" labelText="Wi-Fi" onToggle={onToggle} />);
    fireEvent.click(sw());
    expect(sw()).toHaveAttribute('aria-checked', 'true');
    expect(onToggle).toHaveBeenCalledWith(true, 'wifi', expect.anything());
    fireEvent.click(sw());
    expect(onToggle).toHaveBeenLastCalledWith(false, 'wifi', expect.anything());
  });

  it('flips on Space and on Enter', async () => {
    const user = userEvent.setup();
    render(<Toggle id="t" labelText="Wi-Fi" />);
    sw().focus();
    await user.keyboard(' ');
    expect(sw()).toHaveAttribute('aria-checked', 'true');
    await user.keyboard('{Enter}');
    expect(sw()).toHaveAttribute('aria-checked', 'false');
  });

  it('starts on with `defaultToggled`', () => {
    render(<Toggle id="t" labelText="Wi-Fi" defaultToggled />);
    expect(sw()).toHaveAttribute('aria-checked', 'true');
  });

  it('is controlled by `toggled`: it asks, and the prop decides', () => {
    function Controlled() {
      const [on, setOn] = useState(false);
      return (
        <>
          <Toggle id="t" labelText="Wi-Fi" toggled={on} onToggle={() => {}} />
          <button onClick={() => setOn(true)}>Turn on</button>
        </>
      );
    }
    render(<Controlled />);
    fireEvent.click(sw());
    expect(sw()).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(screen.getByText('Turn on'));
    expect(sw()).toHaveAttribute('aria-checked', 'true');
  });

  it('does nothing when disabled', () => {
    const onToggle = vi.fn();
    render(<Toggle id="t" labelText="Wi-Fi" disabled onToggle={onToggle} />);
    expect(sw()).toBeDisabled();
    fireEvent.click(sw());
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('stays focusable with a `disabledReason`, announced as disabled, and does not flip', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <Toggle
        id="t"
        labelText="Wi-Fi"
        disabled
        disabledReason="Airplane mode is on"
        onToggle={onToggle}
      />
    );
    expect(sw()).not.toBeDisabled();
    expect(sw()).toHaveAttribute('aria-disabled', 'true');
    sw().focus();
    await user.keyboard(' ');
    fireEvent.click(sw());
    expect(onToggle).not.toHaveBeenCalled();
    expect(sw()).toHaveAttribute('aria-checked', 'false');
  });

  it('read-only: focusable, says so, does not flip', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<Toggle id="t" labelText="Wi-Fi" readOnly onToggle={onToggle} />);
    expect(sw()).toHaveAttribute('aria-readonly', 'true');
    sw().focus();
    await user.keyboard(' ');
    fireEvent.click(sw());
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('calls `onClick` with the click', () => {
    const onClick = vi.fn();
    render(<Toggle id="t" labelText="Wi-Fi" onClick={onClick} />);
    fireEvent.click(sw());
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Add } from '@carbon/icons-react';
import { MegaButton } from '../components/MegaButton';
import { toAriaKeyShortcuts } from '../internal/ariaKeyShortcuts';

describe('MegaButton', () => {
  it('is a native button named by its label, and never submits by default', () => {
    render(<MegaButton>Save</MegaButton>);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('takes the cds prefix, its kind, its size and Carbon’s layout size class', () => {
    render(
      <MegaButton kind="tertiary" size="md" className="custom">
        Save
      </MegaButton>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass(
      'cds--mega-button',
      'cds--mega-button--tertiary',
      'cds--mega-button--md',
      'cds--layout--size-md',
      'custom'
    );
  });

  it('defaults to primary at lg, as Carbon’s Button does', () => {
    render(<MegaButton>Save</MegaButton>);
    expect(screen.getByRole('button')).toHaveClass(
      'cds--mega-button--primary',
      'cds--mega-button--lg'
    );
  });

  it('puts the one icon before or after the label, and hides it from assistive technology', () => {
    const { rerender } = render(
      <MegaButton renderIcon={Add} iconPosition="leading">
        Add
      </MegaButton>
    );
    let children = Array.from(screen.getByRole('button').children);
    expect(children[0].tagName.toLowerCase()).toBe('svg');
    expect(children[0]).toHaveAttribute('aria-hidden', 'true');
    expect(children[1]).toHaveClass('cds--mega-button__label');

    rerender(
      <MegaButton renderIcon={Add} iconPosition="trailing">
        Add
      </MegaButton>
    );
    children = Array.from(screen.getByRole('button').children);
    expect(children[0]).toHaveClass('cds--mega-button__label');
    expect(children[1].tagName.toLowerCase()).toBe('svg');
  });

  it('shows the key command last, hidden from the name, and announces it through aria-keyshortcuts', () => {
    render(
      <MegaButton renderIcon={Add} keyCommand={['mod', 's']}>
        Save
      </MegaButton>
    );
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveAttribute('aria-keyshortcuts', 'Meta+S Control+S');
    const last = button.lastElementChild as HTMLElement;
    expect(last).toHaveClass('cds--mega-button__key-command');
    expect(last).toHaveAttribute('aria-hidden', 'true');
  });

  it('leads with the icon whenever there is a key command, even if trailing was asked for', () => {
    render(
      <MegaButton
        renderIcon={Add}
        iconPosition="trailing"
        keyCommand={['mod', 's']}>
        Save
      </MegaButton>
    );
    const button = screen.getByRole('button');
    const children = Array.from(button.children);
    expect(children[0].tagName.toLowerCase()).toBe('svg');
    expect(children[1]).toHaveClass('cds--mega-button__label');
    expect(children[2]).toHaveClass('cds--mega-button__key-command');
    expect(button).toHaveClass('cds--mega-button--icon-leading');
  });

  it('has no aria-keyshortcuts without a key command', () => {
    render(<MegaButton>Save</MegaButton>);
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-keyshortcuts');
  });

  it('states selection with aria-pressed, only when it is a toggle', () => {
    const { rerender } = render(<MegaButton>Bold</MegaButton>);
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-pressed');
    rerender(<MegaButton isSelected>Bold</MegaButton>);
    expect(screen.getByRole('button', { pressed: true })).toBeInTheDocument();
    rerender(<MegaButton isSelected={false}>Bold</MegaButton>);
    expect(screen.getByRole('button', { pressed: false })).toBeInTheDocument();
  });

  it('activates from the keyboard and not when disabled', async () => {
    const onClick = jest.fn();
    const { rerender } = render(
      <MegaButton onClick={onClick}>Save</MegaButton>
    );
    const user = userEvent.setup();
    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);

    rerender(
      <MegaButton onClick={onClick} disabled>
        Save
      </MegaButton>
    );
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('starts the press where the pointer went down, and still calls onPointerDown', () => {
    // jsdom has no PointerEvent, so fireEvent would drop clientX and clientY.
    // A PointerEvent is a MouseEvent with more fields; this is enough of one.
    if (!('PointerEvent' in window)) {
      Object.defineProperty(window, 'PointerEvent', {
        configurable: true,
        value: class PointerEvent extends MouseEvent {},
      });
    }
    const onPointerDown = jest.fn();
    render(<MegaButton onPointerDown={onPointerDown}>Save</MegaButton>);
    const button = screen.getByRole('button');
    button.getBoundingClientRect = () =>
      ({ left: 10, top: 20, width: 100, height: 48 }) as DOMRect;
    fireEvent.pointerDown(button, { clientX: 40, clientY: 44 });
    expect(button.style.getPropertyValue('--cds--mega-button-press-x')).toBe(
      '30px'
    );
    expect(button.style.getPropertyValue('--cds--mega-button-press-y')).toBe(
      '24px'
    );
    expect(onPointerDown).toHaveBeenCalledTimes(1);
  });

  it('icon-only: the label names the button through its tooltip, with the key command', () => {
    render(
      <MegaButton hasIconOnly renderIcon={Add} keyCommand={['mod', 'c']}>
        Copy
      </MegaButton>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('cds--mega-button--icon-only');
    expect(button).toHaveAccessibleName(/^Copy/);
    expect(button.querySelector('.cds--mega-button__label')).toBeNull();
  });

  it('warns when an icon-only button is larger than Carbon’s icon-only sizes', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <MegaButton hasIconOnly renderIcon={Add} size="xl">
        Add
      </MegaButton>
    );
    expect(
      error.mock.calls.some((call) => String(call).includes('takes xs to lg'))
    ).toBe(true);
    error.mockRestore();
  });

  it('forwards a ref to the button', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<MegaButton ref={ref}>Save</MegaButton>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});

describe('toAriaKeyShortcuts', () => {
  it('lists both platforms when mod or remove differ', () => {
    expect(toAriaKeyShortcuts(['mod', 'shift', 'k'])).toBe(
      'Meta+Shift+K Control+Shift+K'
    );
    expect(toAriaKeyShortcuts(['remove'])).toBe('Backspace Delete');
  });

  it('writes one chord when it is the same everywhere', () => {
    expect(toAriaKeyShortcuts(['ctrl', 'alt', 'up'])).toBe(
      'Control+Alt+ArrowUp'
    );
    expect(toAriaKeyShortcuts(['F5'])).toBe('F5');
  });
});

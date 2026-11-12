/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// @vitest-environment jsdom
/** @jsxRuntime automatic */

import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '../../../vitest.setup';
import { setReducedMotion } from '../../../vitest.dom';
import { Popover, PopoverContent } from '../index';

setReducedMotion(true);

const root = () => document.documentElement;
const down = (el: Element) =>
  fireEvent(el, new PointerEvent('pointerdown', { bubbles: true }));

describe('Popover (v11 form)', () => {
  const v11 = (props: Partial<React.ComponentProps<typeof Popover>> = {}) => (
    <>
      <button>Outside</button>
      <Popover open onRequestClose={props.onRequestClose} {...props}>
        <button>Trigger</button>
        <PopoverContent>
          <button>Inside</button>
        </PopoverContent>
      </Popover>
    </>
  );

  it('draws its content in place, after the trigger, so Tab goes into it', () => {
    render(v11());
    const stops = screen.getAllByRole('button').map((b) => b.textContent);
    expect(stops.indexOf('Inside')).toBe(stops.indexOf('Trigger') + 1);
  });

  it('keeps its content hidden while closed', () => {
    render(v11({ open: false }));
    expect(screen.queryByRole('button', { name: 'Inside' })).toBeNull();
    expect(
      screen.getByText('Inside', { selector: 'button' })
    ).not.toBeVisible();
  });

  it('asks to close on a click outside, not on one inside or on the trigger', () => {
    const onRequestClose = vi.fn();
    render(v11({ onRequestClose }));
    fireEvent.click(screen.getByText('Inside'));
    fireEvent.click(screen.getByText('Trigger'));
    expect(onRequestClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('Outside'));
    expect(onRequestClose).toHaveBeenCalledTimes(1);
  });

  it('asks to close when focus leaves it', () => {
    const onRequestClose = vi.fn();
    render(v11({ onRequestClose }));
    screen.getByText('Inside').focus();
    screen.getByText('Outside').focus();
    expect(onRequestClose).toHaveBeenCalledTimes(1);
  });

  it('does not ask while focus moves within it', () => {
    const onRequestClose = vi.fn();
    render(v11({ onRequestClose }));
    screen.getByText('Trigger').focus();
    screen.getByText('Inside').focus();
    expect(onRequestClose).not.toHaveBeenCalled();
  });

  it('asks to close on Escape inside its content, and focus goes to the trigger', () => {
    const onRequestClose = vi.fn();
    render(v11({ onRequestClose }));
    const inside = screen.getByText('Inside');
    inside.focus();
    fireEvent.keyDown(inside, { key: 'Escape' });
    expect(onRequestClose).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Trigger')).toHaveFocus();
  });

  it('ignores Escape pressed elsewhere', () => {
    const onRequestClose = vi.fn();
    render(v11({ onRequestClose }));
    fireEvent.keyDown(screen.getByText('Outside'), { key: 'Escape' });
    expect(onRequestClose).not.toHaveBeenCalled();
  });

  it('does not lock the page: it is not a modal', () => {
    render(v11());
    expect(root().style.overflow).toBe('');
  });

  it('takes the `open` prop alone as its state (v11: controlled)', () => {
    const { rerender } = render(v11({ open: false }));
    expect(screen.queryByRole('button', { name: 'Inside' })).toBeNull();
    rerender(v11({ open: true }));
    expect(screen.getByRole('button', { name: 'Inside' })).toBeTruthy();
  });
});

describe('Popover (anchored form)', () => {
  function Anchored({
    onRequestClose,
    onEscapeOnPage,
  }: {
    onRequestClose?: () => void;
    onEscapeOnPage?: () => void;
  }) {
    const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
    const [open, setOpen] = useState(true);
    return (
      <div onKeyDown={(e) => e.key === 'Escape' && onEscapeOnPage?.()}>
        <button ref={setAnchor}>Anchor</button>
        <button>Elsewhere</button>
        <Popover
          open={open}
          anchor={anchor}
          label="Filters"
          onRequestClose={() => {
            onRequestClose?.();
            setOpen(false);
          }}>
          <button>Apply</button>
        </Popover>
      </div>
    );
  }

  it('is a dialog named by its label, portalled', async () => {
    render(<Anchored />);
    const dialog = await screen.findByRole('dialog', { name: 'Filters' });
    expect(dialog.closest('[class*="cds-"]')).toBeTruthy();
  });

  it('takes focus on open: the first control inside', async () => {
    render(<Anchored />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Apply' })).toHaveFocus()
    );
  });

  it('closes on a press outside, but not on the trigger, which toggles', async () => {
    const onRequestClose = vi.fn();
    render(<Anchored onRequestClose={onRequestClose} />);
    await screen.findByRole('dialog');
    down(screen.getByText('Anchor'));
    down(screen.getByText('Apply'));
    expect(onRequestClose).not.toHaveBeenCalled();
    down(screen.getByText('Elsewhere'));
    expect(onRequestClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape, returns focus to its trigger, and keeps the key from the layers below', async () => {
    const onRequestClose = vi.fn();
    const onEscapeOnPage = vi.fn();
    render(
      <Anchored
        onRequestClose={onRequestClose}
        onEscapeOnPage={onEscapeOnPage}
      />
    );
    await screen.findByRole('dialog');
    const apply = screen.getByText('Apply');
    apply.focus();
    fireEvent.keyDown(apply, { key: 'Escape' });
    expect(onRequestClose).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Anchor')).toHaveFocus();
    expect(onEscapeOnPage).not.toHaveBeenCalled();
  });

  it('closes when focus goes somewhere else on the page', async () => {
    const onRequestClose = vi.fn();
    render(<Anchored onRequestClose={onRequestClose} />);
    await screen.findByRole('dialog');
    const apply = screen.getByText('Apply');
    apply.focus();
    screen.getByText('Elsewhere').focus();
    expect(onRequestClose).toHaveBeenCalledTimes(1);
  });

  it('does not close while focus goes back to its trigger', async () => {
    const onRequestClose = vi.fn();
    render(<Anchored onRequestClose={onRequestClose} />);
    await screen.findByRole('dialog');
    screen.getByText('Apply').focus();
    screen.getByText('Anchor').focus();
    expect(onRequestClose).not.toHaveBeenCalled();
  });

  it('does not lock the page: it is not a modal', async () => {
    render(<Anchored />);
    await screen.findByRole('dialog');
    expect(root().style.overflow).toBe('');
  });
});

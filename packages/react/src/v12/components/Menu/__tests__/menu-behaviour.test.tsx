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
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '../../../vitest.setup';
import { setReducedMotion } from '../../../vitest.dom';
import {
  Menu,
  MenuItem,
  MenuItemDivider,
  MenuItemGroup,
  MenuItemRadioGroup,
  MenuItemSelectable,
} from '../index';

setReducedMotion(true);

const item = (name: string | RegExp) => screen.getByRole('menuitem', { name });
/** The label of the row that has focus (a row draws it twice, the second face hidden). */
const focused = () =>
  document.activeElement?.querySelector('.sel__text')?.textContent ?? '';

/** An open menu opened from a trigger, which holds focus when it starts. */
function Harness({
  onClose,
  children,
  ...props
}: Partial<React.ComponentProps<typeof Menu>> & { onClose?: () => void }) {
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  return (
    <>
      <button ref={setAnchor} onClick={() => setOpen(true)}>
        Trigger
      </button>
      <button>Elsewhere</button>
      <Menu
        label="Actions"
        {...props}
        open={open}
        anchor={anchor}
        onClose={() => {
          onClose?.();
          setOpen(false);
        }}>
        {children}
      </Menu>
    </>
  );
}

const basic = (
  <>
    <MenuItem label="Open" />
    <MenuItem label="Rename" disabled />
    <MenuItem label="Copy link" />
    <MenuItem label="Delete" kind="danger" />
  </>
);

async function open() {
  const trigger = screen.getByText('Trigger');
  trigger.focus();
  fireEvent.click(trigger);
  await screen.findByRole('menu');
}

describe('Menu roles', () => {
  it('is a menu named by its label, of menuitems', async () => {
    render(<Harness>{basic}</Harness>);
    await open();
    expect(screen.getByRole('menu', { name: 'Actions' })).toBeTruthy();
    expect(screen.getAllByRole('menuitem')).toHaveLength(4);
  });

  it('marks a disabled row aria-disabled', async () => {
    render(<Harness>{basic}</Harness>);
    await open();
    expect(item('Rename')).toHaveAttribute('aria-disabled', 'true');
  });

  it('has checkbox and radio rows, a labelled group and a separator', async () => {
    render(
      <Harness>
        <MenuItemSelectable label="Show grid" defaultSelected />
        <MenuItemDivider />
        <MenuItemGroup label="View">
          <MenuItem label="Zoom in" />
        </MenuItemGroup>
        <MenuItemRadioGroup
          label="Sort"
          items={['Name', 'Date']}
          defaultSelectedItem="Name"
        />
      </Harness>
    );
    await open();
    expect(
      screen.getByRole('menuitemcheckbox', { name: 'Show grid' })
    ).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('separator')).toBeTruthy();
    expect(screen.getByRole('group', { name: 'View' })).toBeTruthy();
    expect(screen.getByRole('menuitemradio', { name: 'Name' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    expect(screen.getByRole('menuitemradio', { name: 'Date' })).toHaveAttribute(
      'aria-checked',
      'false'
    );
  });

  it('a submenu row says so: aria-haspopup, and aria-expanded', async () => {
    render(
      <Harness>
        <MenuItem label="Share">
          <MenuItem label="Email" />
        </MenuItem>
      </Harness>
    );
    await open();
    expect(item('Share')).toHaveAttribute('aria-haspopup', 'menu');
    expect(item('Share')).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('Menu keyboard', () => {
  it('focuses the first enabled row on open', async () => {
    render(<Harness>{basic}</Harness>);
    await open();
    await waitFor(() => expect(focused()).toBe('Open'));
  });

  it('starts on the last row with `initialFocus="last"`', async () => {
    render(<Harness initialFocus="last">{basic}</Harness>);
    await open();
    await waitFor(() => expect(focused()).toBe('Delete'));
  });

  it('ArrowDown and ArrowUp move, skipping a disabled row, and wrap', async () => {
    const user = userEvent.setup();
    render(<Harness>{basic}</Harness>);
    await open();
    await waitFor(() => expect(focused()).toBe('Open'));
    await user.keyboard('{ArrowDown}');
    expect(focused()).toBe('Copy link');
    await user.keyboard('{ArrowDown}');
    expect(focused()).toBe('Delete');
    await user.keyboard('{ArrowDown}');
    expect(focused()).toBe('Open');
    await user.keyboard('{ArrowUp}');
    expect(focused()).toBe('Delete');
  });

  it('Home and End reach the first and last enabled row', async () => {
    const user = userEvent.setup();
    render(<Harness>{basic}</Harness>);
    await open();
    await waitFor(() => expect(focused()).toBe('Open'));
    await user.keyboard('{End}');
    expect(focused()).toBe('Delete');
    await user.keyboard('{Home}');
    expect(focused()).toBe('Open');
  });

  it('a disabled row with a reason is in the arrow keys’ path', async () => {
    const user = userEvent.setup();
    render(
      <Harness>
        <MenuItem label="Open" />
        <MenuItem label="Rename" disabled disabledReason="Read only" />
        <MenuItem label="Copy" />
      </Harness>
    );
    await open();
    await waitFor(() => expect(focused()).toBe('Open'));
    await user.keyboard('{ArrowDown}');
    expect(focused()).toBe('Rename');
  });

  it('Enter and Space run the row, then ask to close', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const onClose = vi.fn();
    render(
      <Harness onClose={onClose}>
        <MenuItem label="Open" onClick={onOpen} />
      </Harness>
    );
    await open();
    await waitFor(() => expect(focused()).toBe('Open'));
    await user.keyboard('{Enter}');
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not run a disabled row', async () => {
    const onClick = vi.fn();
    render(
      <Harness>
        <MenuItem label="Open" />
        <MenuItem label="Rename" disabled onClick={onClick} />
      </Harness>
    );
    await open();
    fireEvent.click(item('Rename'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('typeahead goes to the next row that starts with what is typed', async () => {
    const user = userEvent.setup();
    render(<Harness>{basic}</Harness>);
    await open();
    await waitFor(() => expect(focused()).toBe('Open'));
    await user.keyboard('d');
    expect(focused()).toBe('Delete');
  });

  it('typeahead keeps what is typed within half a second, and matches the prefix', async () => {
    const user = userEvent.setup();
    render(<Harness>{basic}</Harness>);
    await open();
    await waitFor(() => expect(focused()).toBe('Open'));
    await user.keyboard('co');
    expect(focused()).toBe('Copy link');
    // "d" joins the buffer ("cod"), which matches nothing: focus stays.
    await user.keyboard('d');
    expect(focused()).toBe('Copy link');
  });

  it('typeahead skips a disabled row', async () => {
    const user = userEvent.setup();
    render(<Harness>{basic}</Harness>);
    await open();
    await waitFor(() => expect(focused()).toBe('Open'));
    await user.keyboard('r');
    expect(focused()).toBe('Open');
  });

  it('a checkbox row flips and tells `onChange`', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Harness>
        <MenuItemSelectable label="Show grid" onChange={onChange} />
      </Harness>
    );
    await open();
    await waitFor(() => expect(focused()).toBe('Show grid'));
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('a radio row chooses, telling `onChange` the item', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Harness>
        <MenuItemRadioGroup
          label="Sort"
          items={['Name', 'Date']}
          defaultSelectedItem="Name"
          onChange={onChange}
        />
      </Harness>
    );
    await open();
    await waitFor(() => expect(focused()).toBe('Name'));
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenCalledWith('Date');
  });

  it('a radio group’s `shortcuts` choose a row by key, over typeahead', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Harness>
        <MenuItemRadioGroup
          label="Sort"
          items={['Name', 'Date']}
          shortcuts
          onChange={onChange}
        />
      </Harness>
    );
    await open();
    await user.keyboard('2');
    expect(onChange).toHaveBeenCalledWith('Date');
  });
});

describe('Menu closing', () => {
  it('Escape asks to close, and focus goes back to the trigger', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Harness onClose={onClose}>{basic}</Harness>);
    await open();
    await waitFor(() => expect(focused()).toBe('Open'));
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Trigger')).toHaveFocus();
  });

  it('Tab asks to close too, the focus back on the trigger', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Harness onClose={onClose}>{basic}</Harness>);
    await open();
    await waitFor(() => expect(focused()).toBe('Open'));
    await user.keyboard('{Tab}');
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Trigger')).toHaveFocus();
  });

  it('a press outside asks to close; one on the trigger does not (it toggles)', async () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose}>{basic}</Harness>);
    await open();
    fireEvent(
      screen.getByText('Trigger'),
      new PointerEvent('pointerdown', { bubbles: true })
    );
    expect(onClose).not.toHaveBeenCalled();
    fireEvent(
      screen.getByText('Elsewhere'),
      new PointerEvent('pointerdown', { bubbles: true })
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('a press inside does not ask to close', async () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose}>{basic}</Harness>);
    await open();
    fireEvent(
      screen.getByRole('menu'),
      new PointerEvent('pointerdown', { bubbles: true })
    );
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe('Menu submenus', () => {
  const nested = (
    <>
      <MenuItem label="Open" />
      <MenuItem label="Share">
        <MenuItem label="Email" />
        <MenuItem label="Link" />
      </MenuItem>
    </>
  );

  it('ArrowRight opens the submenu on its first row', async () => {
    const user = userEvent.setup();
    render(<Harness>{nested}</Harness>);
    await open();
    await waitFor(() => expect(focused()).toBe('Open'));
    await user.keyboard('{ArrowDown}{ArrowRight}');
    await waitFor(() => expect(focused()).toBe('Email'));
    expect(screen.getAllByRole('menu')).toHaveLength(2);
    expect(item('Share')).toHaveAttribute('aria-expanded', 'true');
  });

  it('ArrowLeft goes back to the parent row, and Escape in it does not close the menu', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Harness onClose={onClose}>{nested}</Harness>);
    await open();
    await waitFor(() => expect(focused()).toBe('Open'));
    await user.keyboard('{ArrowDown}{ArrowRight}');
    await waitFor(() => expect(focused()).toBe('Email'));
    await user.keyboard('{ArrowLeft}');
    await waitFor(() => expect(focused()).toBe('Share'));
    await user.keyboard('{ArrowRight}');
    await waitFor(() => expect(focused()).toBe('Email'));
    await user.keyboard('{Escape}');
    await waitFor(() => expect(focused()).toBe('Share'));
    expect(onClose).not.toHaveBeenCalled();
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Enter on a submenu row opens it rather than running anything', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Harness onClose={onClose}>{nested}</Harness>);
    await open();
    await waitFor(() => expect(focused()).toBe('Open'));
    await user.keyboard('{ArrowDown}{Enter}');
    await waitFor(() => expect(focused()).toBe('Email'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('a submenu row runs the menu’s close once a leaf is chosen', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onEmail = vi.fn();
    render(
      <Harness onClose={onClose}>
        <MenuItem label="Share">
          <MenuItem label="Email" onClick={onEmail} />
        </MenuItem>
      </Harness>
    );
    await open();
    await waitFor(() => expect(focused()).toBe('Share'));
    await user.keyboard('{ArrowRight}');
    await waitFor(() => expect(focused()).toBe('Email'));
    await user.keyboard('{Enter}');
    expect(onEmail).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('Menu right to left', () => {
  // The arrows mirror: a submenu opens to the left, so ArrowLeft opens it.
  it('ArrowLeft opens the submenu, the side it opens to', async () => {
    const user = userEvent.setup();
    document.documentElement.dir = 'rtl';
    try {
      render(
        <Harness>
          <MenuItem label="Share">
            <MenuItem label="Email" />
          </MenuItem>
        </Harness>
      );
      await open();
      await waitFor(() => expect(focused()).toBe('Share'));
      await user.keyboard('{ArrowLeft}');
      await waitFor(() => expect(focused()).toBe('Email'), { timeout: 300 });
    } finally {
      document.documentElement.dir = '';
    }
  });

  it('ArrowDown and ArrowUp are the same', async () => {
    const user = userEvent.setup();
    document.documentElement.dir = 'rtl';
    try {
      render(<Harness>{basic}</Harness>);
      await open();
      await waitFor(() => expect(focused()).toBe('Open'));
      await user.keyboard('{ArrowDown}');
      expect(focused()).toBe('Copy link');
      await user.keyboard('{ArrowUp}');
      expect(focused()).toBe('Open');
    } finally {
      document.documentElement.dir = '';
    }
  });
});

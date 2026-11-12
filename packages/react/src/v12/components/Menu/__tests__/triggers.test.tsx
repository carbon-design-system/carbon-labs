/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComboButton, MenuButton, MenuItem, OverflowMenu } from '../index';
import type { MenuTriggerProps, OverflowMenuProps } from '../index';
import { stubAnimate } from './animate';

stubAnimate();

/* The menu triggers' keyboard: MenuButton, OverflowMenu and ComboButton's
 * chevron open their Menu the same way, and the Menu hands focus back. */

type Trigger = {
  name: string;
  /** The trigger's accessible name. */
  label: string;
  render: (p: Partial<MenuTriggerProps>) => React.ReactElement;
};

const items = (
  <>
    <MenuItem label="Duplicate" />
    <MenuItem label="Move" />
    <MenuItem label="Archive" />
  </>
);

const TRIGGERS: Trigger[] = [
  {
    name: 'MenuButton',
    label: 'Actions',
    render: (p) => (
      <MenuButton label="Actions" {...p}>
        {items}
      </MenuButton>
    ),
  },
  {
    name: 'OverflowMenu',
    label: 'Row options',
    render: (p) => (
      <OverflowMenu label="Row options" {...(p as Partial<OverflowMenuProps>)}>
        {items}
      </OverflowMenu>
    ),
  },
  {
    name: "ComboButton's chevron",
    label: 'Additional actions',
    render: (p) => (
      <ComboButton label="Save" {...p}>
        {items}
      </ComboButton>
    ),
  },
];

describe.each(TRIGGERS)('$name', (t) => {
  const setup = (p: Partial<MenuTriggerProps> = {}) => {
    const user = userEvent.setup();
    render(t.render(p));
    const trigger = screen.getByRole('button', { name: t.label });
    return { user, trigger };
  };

  it('is a closed menu button', () => {
    const { trigger } = setup();
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).not.toHaveAttribute('aria-controls');
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it.each([
    ['↓', '{ArrowDown}', 'Duplicate'],
    ['Enter', '{Enter}', 'Duplicate'],
    ['Space', ' ', 'Duplicate'],
    ['↑', '{ArrowUp}', 'Archive'],
  ])('opens on %s with focus on its row %s', async (_name, key, row) => {
    const { user, trigger } = setup();
    trigger.focus();
    await user.keyboard(key);
    const menu = screen.getByRole('menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls', menu.id);
    expect(screen.getByRole('menuitem', { name: row })).toHaveFocus();
  });

  it('moves with the arrows, wrapping at the ends', async () => {
    const { user, trigger } = setup();
    trigger.focus();
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Move' })).toHaveFocus();
    await user.keyboard('{ArrowUp}{ArrowUp}');
    expect(screen.getByRole('menuitem', { name: 'Archive' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus();
  });

  it('closes on Escape and gives focus back to the trigger', async () => {
    const onClose = vi.fn();
    const { user, trigger } = setup({ onClose });
    trigger.focus();
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('runs a row on Enter, then closes and gives focus back', async () => {
    const { user, trigger } = setup();
    trigger.focus();
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it('calls onOpen when the menu opens', async () => {
    const onOpen = vi.fn();
    const { user, trigger } = setup({ onOpen });
    await user.click(trigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('does not open while disabled', async () => {
    const { user, trigger } = setup({ disabled: true });
    expect(trigger).toBeDisabled();
    await user.click(trigger);
    expect(screen.queryByRole('menu')).toBeNull();
  });
});

/** Hover, then move: a tooltip waits for the pointer to move (the still gate). */
async function hover(user: ReturnType<typeof userEvent.setup>, el: Element) {
  await user.hover(el);
  await user.pointer({ target: el, coords: { clientX: 8, clientY: 8 } });
}

describe.each(TRIGGERS.slice(1))('$name tooltip', (t) => {
  it('is named by its label in a tooltip (aria-labelledby)', () => {
    render(t.render({}));
    const trigger = screen.getByRole('button', { name: t.label });
    expect(trigger).not.toHaveAttribute('aria-label');
    const tip = document.getElementById(
      trigger.getAttribute('aria-labelledby') ?? ''
    );
    expect(tip).toHaveAttribute('role', 'tooltip');
    expect(tip).toHaveTextContent(t.label);
    expect(tip).not.toBeVisible();
  });

  it('shows on hover and closes when the menu opens', async () => {
    const user = userEvent.setup();
    render(t.render({}));
    const trigger = screen.getByRole('button', { name: t.label });
    const tip = document.getElementById(
      trigger.getAttribute('aria-labelledby') ?? ''
    );
    await hover(user, trigger);
    await waitFor(() => expect(tip).toBeVisible());
    await user.click(trigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await waitFor(() => expect(tip).not.toBeVisible());
  });

  it('takes tooltipAlignment', async () => {
    const user = userEvent.setup();
    render(
      t.render({ tooltipAlignment: 'bottom' } as Partial<MenuTriggerProps>)
    );
    const trigger = screen.getByRole('button', { name: t.label });
    const tip = document.getElementById(
      trigger.getAttribute('aria-labelledby') ?? ''
    );
    await hover(user, trigger);
    await waitFor(() => expect(tip).toHaveAttribute('data-align', 'bottom'));
  });
});

describe('MenuButton', () => {
  it('is named by its visible label, with no tooltip', () => {
    render(
      <MenuButton label="Actions">
        <MenuItem label="Duplicate" />
      </MenuButton>
    );
    const trigger = screen.getByRole('button', { name: 'Actions' });
    expect(trigger).not.toHaveAttribute('aria-labelledby');
    expect(screen.queryByRole('tooltip', { hidden: true })).toBeNull();
  });
});

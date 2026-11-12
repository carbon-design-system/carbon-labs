/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComboButton, MenuItem } from '../index';
import type { ComboButtonProps } from '../index';
import { stubAnimate } from './animate';

stubAnimate();

const renderCombo = (p: Partial<ComboButtonProps> = {}) => {
  const user = userEvent.setup();
  const onDraft = vi.fn();
  const view = render(
    <ComboButton label="Save" {...p}>
      <MenuItem label="Save as draft" onClick={onDraft} />
      <MenuItem label="Save and close" />
    </ComboButton>
  );
  return {
    ...view,
    user,
    onDraft,
    group: screen.getByRole('group'),
    action: screen.getByRole('button', { name: 'Save' }),
    chevron: screen.getByRole('button', { name: 'Additional actions' }),
  };
};

describe('ComboButton', () => {
  it('is a group of the action and the chevron', () => {
    const { group, action, chevron } = renderCombo({ className: 'custom' });
    expect(group).toHaveClass('cds-combo-button', 'custom');
    expect(group).toContainElement(action);
    expect(group).toContainElement(chevron);
    expect(action).toHaveTextContent('Save');
    expect(chevron).toHaveAttribute('aria-haspopup', 'menu');
  });

  it('forwards its ref to the group and spreads the rest onto it', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <ComboButton ref={ref} label="Save" data-testid="combo">
        <MenuItem label="Save as draft" />
      </ComboButton>
    );
    expect(ref.current).toBe(screen.getByTestId('combo'));
    expect(ref.current).toHaveAttribute('role', 'group');
  });

  it('runs the action on a click without opening the menu', async () => {
    const onClick = vi.fn();
    const { user, action } = renderCombo({ onClick });
    await user.click(action);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('opens a menu of the related actions from the chevron, named as it', async () => {
    const { user, chevron, onDraft } = renderCombo();
    await user.click(chevron);
    const menu = screen.getByRole('menu', { name: 'Additional actions' });
    expect(chevron).toHaveAttribute('aria-expanded', 'true');
    expect(chevron).toHaveAttribute('aria-controls', menu.id);
    await user.click(screen.getByRole('menuitem', { name: 'Save as draft' }));
    expect(onDraft).toHaveBeenCalledTimes(1);
    expect(chevron).toHaveAttribute('aria-expanded', 'false');
  });

  it('gives focus back to the chevron when the menu closes', async () => {
    const { user, chevron } = renderCombo();
    chevron.focus();
    await user.keyboard('{ArrowDown}');
    expect(
      screen.getByRole('menuitem', { name: 'Save as draft' })
    ).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(chevron).toHaveFocus();
  });

  it('disables both cells with disabled', async () => {
    const onClick = vi.fn();
    const { user, action, chevron } = renderCombo({ disabled: true, onClick });
    expect(action).toBeDisabled();
    expect(chevron).toBeDisabled();
    await user.click(action);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('while busy, keeps the action focusable but inert and disables the chevron', async () => {
    const onClick = vi.fn();
    const { user, action, chevron } = renderCombo({ busy: true, onClick });
    expect(action).not.toBeDisabled();
    expect(action).toHaveAttribute('aria-busy', 'true');
    expect(action).toHaveAttribute('aria-disabled', 'true');
    expect(chevron).toBeDisabled();
    await user.click(action);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('closes its menu when it turns busy', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <ComboButton label="Save">
        <MenuItem label="Save as draft" />
      </ComboButton>
    );
    await user.click(
      screen.getByRole('button', { name: 'Additional actions' })
    );
    expect(screen.getByRole('menu')).toBeInTheDocument();
    rerender(
      <ComboButton label="Save" busy>
        <MenuItem label="Save as draft" />
      </ComboButton>
    );
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  });

  it("takes v11's size, lg by default", () => {
    const { group, unmount } = renderCombo();
    expect(group).toHaveClass('cds-btn-shell--lg');
    unmount();
    expect(renderCombo({ size: 'sm' }).group).toHaveClass('cds-btn-shell--sm');
  });

  it("names the chevron, its tooltip and its menu through v11's translateWithId", async () => {
    const user = userEvent.setup();
    const translateWithId = vi.fn(() => 'More save options');
    render(
      <ComboButton label="Save" translateWithId={translateWithId}>
        <MenuItem label="Save as draft" />
      </ComboButton>
    );
    const chevron = screen.getByRole('button', { name: 'More save options' });
    expect(translateWithId).toHaveBeenCalledWith(
      'carbon.combo-button.additional-actions'
    );
    expect(chevron).toHaveAccessibleName('More save options');
    await user.click(chevron);
    expect(
      screen.getByRole('menu', { name: 'More save options' })
    ).toBeInTheDocument();
  });
});

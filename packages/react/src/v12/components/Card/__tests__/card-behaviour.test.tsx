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
import { Card, ExpressiveCard, ProductiveCard } from '../index';

setReducedMotion(true);

describe('Card', () => {
  it('is static without `onClick`: no role, no tab stop', () => {
    const { container } = render(<Card title="Report" />);
    const card = container.querySelector('.cds-kit-card')!;
    expect(card).toHaveClass('cds-kit-card--static');
    expect(card).not.toHaveAttribute('role');
    expect(card).not.toHaveAttribute('tabindex');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('has one action with `onClick`: one tab stop, named by its title, described by its description', () => {
    const { container } = render(
      <Card title="Report" description="Q3" onClick={() => {}} />
    );
    const card = container.querySelector('.cds-kit-card')!;
    expect(card).toHaveClass('cds-kit-card--clickable');
    // The card itself is no control: its action is the one button in it.
    expect(card).not.toHaveAttribute('role');
    expect(card).not.toHaveAttribute('tabindex');
    const action = screen.getByRole('button');
    expect(action).toHaveAccessibleName('Report');
    expect(action).toHaveAccessibleDescription('Q3');
    expect(card.contains(action)).toBe(true);
    expect(action.tabIndex).toBe(0);
  });

  it('keeps its own buttons beside the action, never inside it', () => {
    const { container } = render(
      <Card title="Report" onClick={() => {}} primaryButtonText="Open" />
    );
    const card = container.querySelector('.cds-kit-card')!;
    const action = screen.getByRole('button', { name: 'Report' });
    expect(action.children).toHaveLength(0);
    expect(card.querySelector('[role="button"]')).toBeNull();
    expect(card.querySelector('button')).toBe(action);
    expect(screen.getByRole('button', { name: 'Open' })).not.toBe(action);
  });

  it('shows its label, title, description and body', () => {
    render(
      <Card label="Label" title="Title" description="Description">
        Body text
      </Card>
    );
    expect(screen.getByRole('heading', { name: 'Title' })).toBeTruthy();
    expect(screen.getByText('Label')).toBeTruthy();
    expect(screen.getByText('Description')).toBeTruthy();
    expect(screen.getByText('Body text')).toBeTruthy();
  });

  it('calls `onClick` on a click', () => {
    const onClick = vi.fn();
    render(<Card title="Report" onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: 'Report' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('activates on Enter and Space, when its action has focus', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Card title="Report" onClick={onClick} />);
    screen.getByRole('button', { name: 'Report' }).focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('passes other keys to `onKeyDown`, and does not activate on them', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onKeyDown = vi.fn();
    render(<Card title="Report" onClick={onClick} onKeyDown={onKeyDown} />);
    screen.getByRole('button', { name: 'Report' }).focus();
    await user.keyboard('a');
    expect(onClick).not.toHaveBeenCalled();
    expect(onKeyDown).toHaveBeenCalled();
  });

  it('a button inside a clickable card is its own: pressing it does not click the card', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onPrimary = vi.fn();
    render(
      <Card
        title="Report"
        onClick={onClick}
        primaryButtonText="Open"
        onPrimaryButtonClick={onPrimary}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(onPrimary).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('Enter on an inner button does not activate the card', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Card title="Report" onClick={onClick} primaryButtonText="Open" />);
    screen.getByRole('button', { name: 'Open' }).focus();
    await user.keyboard('{Enter}');
    expect(onClick).not.toHaveBeenCalled();
  });

  it('a productive card with clickZone "two" clicks on its header and body, not its footer', () => {
    const onClick = vi.fn();
    render(
      <ProductiveCard
        title="Report"
        clickZone="two"
        onClick={onClick}
        primaryButtonText="Open"
        secondaryButtonText="Later">
        Body
      </ProductiveCard>
    );
    fireEvent.click(screen.getByText('Body'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('a productive card with clickZone "three" clicks on its header alone', () => {
    const onClick = vi.fn();
    render(
      <ProductiveCard title="Report" clickZone="three" onClick={onClick}>
        Body
      </ProductiveCard>
    );
    fireEvent.click(screen.getByText('Body'));
    expect(onClick).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('heading', { name: 'Report' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('action icons and overflow actions are buttons of their own', async () => {
    const user = userEvent.setup();
    const onIcon = vi.fn();
    const onCard = vi.fn();
    render(
      <Card
        title="Report"
        onClick={onCard}
        actionIcons={[
          {
            id: 'share',
            icon: () => <svg />,
            iconDescription: 'Share',
            onClick: onIcon,
          },
        ]}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Share' }));
    expect(onIcon).toHaveBeenCalledTimes(1);
    expect(onCard).not.toHaveBeenCalled();
  });

  it('is expressive by default, and has a productive and an expressive form', () => {
    const { container } = render(
      <>
        <Card title="A" />
        <ProductiveCard title="B" />
        <ExpressiveCard title="C" />
      </>
    );
    const cards = container.querySelectorAll('.cds-kit-card');
    expect(cards[0]).toHaveClass('cds-kit-card--expressive');
    expect(cards[1]).toHaveClass('cds-kit-card--productive');
    expect(cards[2]).toHaveClass('cds-kit-card--expressive');
  });

  it('puts media first, with its position as a class', () => {
    const { container } = render(
      <Card title="A" media={<img alt="Cover" />} mediaPosition="start" />
    );
    expect(container.querySelector('.cds-kit-card')).toHaveClass(
      'cds-kit-card--media-start'
    );
    expect(screen.getByAltText('Cover')).toBeTruthy();
  });
});

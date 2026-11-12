/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import type { ComponentProps, HTMLAttributes } from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { setReducedMotion } from '../../../vitest.dom';
import { Toggletip, ToggletipButton, ToggletipContent } from '../index';

setReducedMotion(true);

const TEXT = 'Storage is billed by the hour.';

/** A toggletip between two outside buttons; `button` goes on its trigger. */
function tip(
  button: Partial<ComponentProps<typeof ToggletipButton>> = {},
  root: Partial<ComponentProps<typeof Toggletip>> = {}
) {
  return (
    <>
      <button type="button">Before</button>
      <Toggletip {...root}>
        <ToggletipButton {...button} />
        <ToggletipContent>
          <p>{TEXT}</p>
          <a href="/pricing">Pricing</a>
        </ToggletipContent>
      </Toggletip>
      <button type="button">After</button>
    </>
  );
}

/** A trigger that is not a `<button>`. */
function Chip(props: HTMLAttributes<HTMLDivElement>) {
  return <div role="button" tabIndex={0} data-chip="" {...props} />;
}

const trigger = (name = 'Show information') =>
  screen.getByRole('button', { name });
const link = () => screen.queryByRole('link', { name: 'Pricing' });
const content = () => screen.getByText(TEXT).closest('[id]');

describe('Toggletip: the default trigger', () => {
  it('is a button named "Show information", or by `label`', () => {
    const { rerender } = render(tip());
    expect(trigger()).toHaveProperty('tagName', 'BUTTON');
    rerender(tip({ label: 'About storage' }));
    expect(trigger('About storage')).toHaveProperty('tagName', 'BUTTON');
    expect(screen.queryByRole('button', { name: 'Show information' })).toBe(
      null
    );
  });

  it('is collapsed, controls the content, and keeps the content out of reach', () => {
    render(tip());
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    expect(trigger()).toHaveAttribute('aria-controls', content()?.id);
    expect(content()?.id).toBeTruthy();
    expect(trigger()).not.toHaveAttribute('aria-describedby');
    expect(link()).toBeNull();
  });

  it('expands on a click and is described by the content, then collapses on the next', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(tip({ onClick }));
    await user.click(trigger());
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    expect(trigger()).toHaveAttribute('aria-describedby', content()?.id);
    expect(trigger()).toHaveAccessibleDescription(
      expect.stringContaining(TEXT)
    );
    expect(link()).toBeInTheDocument();

    await user.click(trigger());
    expect(onClick).toHaveBeenCalledTimes(2);
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(link()).toBeNull());
  });

  it('starts open with `defaultOpen`', () => {
    render(tip({}, { defaultOpen: true }));
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    expect(link()).toBeInTheDocument();
  });
});

describe('Toggletip: a custom trigger (`as`)', () => {
  it('takes the default button’s state, its link to the content and its name', async () => {
    const user = userEvent.setup();
    render(tip({ as: Chip, label: 'About storage' }));
    const chip = trigger('About storage');
    expect(chip).toHaveAttribute('data-chip');
    expect(chip).toHaveAttribute('aria-expanded', 'false');
    expect(chip).toHaveAttribute('aria-controls', content()?.id);
    expect(chip).not.toHaveAttribute('aria-describedby');

    await user.click(chip);
    expect(chip).toHaveAttribute('aria-expanded', 'true');
    expect(chip).toHaveAttribute('aria-describedby', content()?.id);
    expect(link()).toBeInTheDocument();
  });

  it('toggles and still runs the caller’s `onClick`', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(tip({ as: Chip, 'aria-label': 'Storage', onClick }));
    const chip = trigger('Storage');
    await user.click(chip);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(link()).toBeInTheDocument();
    await user.click(chip);
    expect(onClick).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(link()).toBeNull());
  });
});

describe('Toggletip: closing', () => {
  it('closes on Escape on the trigger and keeps focus there', async () => {
    const user = userEvent.setup();
    render(tip());
    await user.click(trigger());
    expect(trigger()).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    expect(trigger()).toHaveFocus();
  });

  it('closes on Escape inside the content and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(tip());
    await user.click(trigger());
    await user.tab();
    expect(link()).toHaveFocus();
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{Escape}');
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    expect(trigger()).toHaveFocus();
  });

  it('leaves Escape alone while closed', async () => {
    const onEscape = vi.fn();
    const user = userEvent.setup();
    render(
      <div
        role="presentation"
        onKeyDown={(e) => e.key === 'Escape' && onEscape()}>
        {tip()}
      </div>
    );
    act(() => trigger().focus());
    await user.keyboard('{Escape}');
    expect(onEscape).toHaveBeenCalledTimes(1);

    await user.click(trigger());
    await user.keyboard('{Escape}');
    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it('closes on a click outside, not on one inside', async () => {
    const user = userEvent.setup();
    render(tip());
    await user.click(trigger());
    fireEvent.click(screen.getByText(TEXT));
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(document.body);
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes when focus leaves it', async () => {
    const user = userEvent.setup();
    render(tip());
    await user.click(trigger());
    await user.tab();
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    await user.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes when the window loses focus', async () => {
    const user = userEvent.setup();
    render(tip());
    await user.click(trigger());
    fireEvent.blur(window);
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
  });
});

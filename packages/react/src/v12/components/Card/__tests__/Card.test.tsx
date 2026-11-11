/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Card, ProductiveCard } from '../index';

// jsdom has no layout, no Web Animations and no fonts: stand-ins that finish.
beforeAll(() => {
  const done = {
    finished: Promise.resolve(),
    ready: Promise.resolve(),
    cancel() {},
    finish() {},
    play() {},
    pause() {},
    reverse() {},
    commitStyles() {},
    addEventListener() {},
    removeEventListener() {},
  };
  Element.prototype.getAnimations = () => [];
  Element.prototype.animate = () => done as unknown as Animation;
  Object.defineProperty(document, 'fonts', {
    configurable: true,
    value: { ready: Promise.resolve(), load: () => Promise.resolve([]) },
  });
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
});

const overflow = [{ id: 'del', itemText: 'Delete', isDelete: true }];

describe('Card', () => {
  it('puts a clickable card’s action on one button, beside its other buttons', () => {
    const onClick = jest.fn();
    const { container } = render(
      <ProductiveCard
        title="Usage"
        description="Last 30 days"
        onClick={onClick}
        primaryButtonText="Open"
        overflowActions={overflow}
      />
    );
    const card = container.firstElementChild as HTMLElement;
    // No role="button" round the card's other buttons.
    expect(card).not.toHaveAttribute('role');
    expect(card).not.toHaveAttribute('tabindex');
    expect(card.querySelector('[role="button"]')).toBeNull();
    const action = screen.getByRole('button', { name: 'Usage' });
    expect(action).toHaveAccessibleDescription('Last 30 days');
    // The action holds no other control, and is the card's first tab stop.
    expect(action.children).toHaveLength(0);
    expect(card.querySelector('button')).toBe(action);
    expect(screen.getByRole('button', { name: 'Open' })).not.toBe(action);
  });

  it('runs the card’s click from its action, and once', () => {
    const onClick = jest.fn();
    render(<Card title="Usage" onClick={onClick} />);
    const action = screen.getByRole('button', { name: 'Usage' });
    act(() => action.focus());
    fireEvent.click(action);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('still takes a press anywhere in the card, and not on its own buttons', () => {
    const onClick = jest.fn();
    const onPrimary = jest.fn();
    render(
      <Card
        title="Usage"
        onClick={onClick}
        primaryButtonText="Open"
        onPrimaryButtonClick={onPrimary}
      />
    );
    fireEvent.click(screen.getByText('Usage'));
    expect(onClick).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(onPrimary).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('names the action by the card’s own label when it has one', () => {
    render(<Card aria-label="Open usage" title="Usage" onClick={() => {}} />);
    expect(screen.getByRole('button', { name: 'Open usage' })).toBeTruthy();
  });

  it('has no action when it is not clickable', () => {
    const { container } = render(
      <Card title="Usage" aria-label="Usage card" />
    );
    expect(screen.queryByRole('button')).toBeNull();
    expect(container.firstElementChild).toHaveAttribute(
      'aria-label',
      'Usage card'
    );
  });
});

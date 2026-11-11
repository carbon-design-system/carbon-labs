/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */
// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { Popover, PopoverContent, type PopoverProps } from '../index';

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
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
});
afterEach(cleanup);

/** A v11-form popover, open, with `props`; returns its container. */
const v11 = (props: Partial<PopoverProps> & Record<string, unknown>) =>
  render(
    <Popover open {...(props as PopoverProps)}>
      <button type="button">Info</button>
      <PopoverContent>Details</PopoverContent>
    </Popover>
  ).container.firstElementChild!;

describe('Popover without its aliases', () => {
  it('takes the inverse look from `variant` only', () => {
    expect(v11({ variant: 'inverse' }).className).toContain(
      'cds-popover-container--high-contrast'
    );
    cleanup();
    // v11's `highContrast` is no longer read.
    expect(v11({ highContrast: true }).className).not.toContain(
      'cds-popover-container--high-contrast'
    );
  });

  it('asks to close the anchored form through onRequestClose only', async () => {
    const onRequestClose = vi.fn();
    const onClose = vi.fn();
    const anchor = document.createElement('button');
    document.body.append(anchor);
    render(
      <Popover
        {...({ onClose } as Record<string, unknown>)}
        open
        anchor={anchor}
        label="Settings"
        onRequestClose={onRequestClose}>
        <button type="button">Reset</button>
      </Popover>
    );
    await act(async () => {});
    fireEvent.keyDown(screen.getByText('Reset'), { key: 'Escape' });
    expect(onRequestClose).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
    anchor.remove();
  });
});

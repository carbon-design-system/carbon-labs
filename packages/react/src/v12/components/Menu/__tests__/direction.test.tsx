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
import { Menu, MenuItem } from '../index';

// jsdom has no layout, no Web Animations, no fonts and no CSS namespace:
// stand-ins.
beforeAll(() => {
  const done = {
    finished: Promise.resolve(),
    ready: Promise.resolve(),
    cancel() {},
    finish() {},
    play() {},
    pause() {},
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
  vi.stubGlobal('CSS', {
    escape: (s: string) => s.replace(/[^\w-]/g, (c) => `\\${c}`),
    supports: () => false,
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

/** An inline menu with a submenu, in a page running `dir`; returns the submenu's row. */
function menu(dir: 'ltr' | 'rtl') {
  render(
    <div dir={dir}>
      <Menu label="File" open inline>
        <MenuItem label="Share">
          <MenuItem label="Email" />
          <MenuItem label="Link" />
        </MenuItem>
        <MenuItem label="Rename" />
      </Menu>
    </div>
  );
  const row = screen.getByRole('menuitem', { name: /Share/ });
  act(() => row.focus());
  return row;
}

describe('Menu keys by direction', () => {
  it('opens a submenu with the right arrow, left to right', () => {
    const row = menu('ltr');
    fireEvent.keyDown(row, { key: 'ArrowLeft' });
    expect(row.getAttribute('aria-expanded')).not.toBe('true');
    fireEvent.keyDown(row, { key: 'ArrowRight' });
    expect(row.getAttribute('aria-expanded')).toBe('true');
  });

  it('opens a submenu with the left arrow, right to left', () => {
    const row = menu('rtl');
    fireEvent.keyDown(row, { key: 'ArrowRight' });
    expect(row.getAttribute('aria-expanded')).not.toBe('true');
    fireEvent.keyDown(row, { key: 'ArrowLeft' });
    expect(row.getAttribute('aria-expanded')).toBe('true');
  });
});

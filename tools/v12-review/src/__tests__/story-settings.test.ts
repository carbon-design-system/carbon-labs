/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { act, createElement, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The panel's surface isn't what this tests: open, it is its contents.
vi.mock('@carbon-labs/react-popover', () => ({
  Popover: ({ open, children }: { open: boolean; children: ReactNode }) =>
    open ? children : null,
}));

const { StorySettings } = await import('../ComponentPage');

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: Root;

/** A story's settings with one change made: Reset clears it. */
function Changed() {
  const [changed, setChanged] = useState(true);
  return createElement(StorySettings, {
    title: 'Default',
    controls: [],
    args: {},
    changed,
    onReset: () => setChanged(false),
    onChange: () => {},
  });
}

/** The first button in the document whose text is `name`. */
function button(name: string) {
  return [...document.querySelectorAll<HTMLElement>('button')].find(
    (b) => b.textContent?.trim() === name
  );
}

beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

describe('StorySettings', () => {
  it('keeps focus in the panel when Reset goes', async () => {
    await act(async () => {
      root.render(createElement(Changed));
    });
    await act(async () => {
      document
        .querySelector<HTMLElement>('button[aria-haspopup="dialog"]')
        ?.click();
    });
    const reset = button('Reset');
    expect(reset).toBeDefined();
    reset!.focus();
    await act(async () => {
      reset!.click();
    });
    // Reset is gone; focus is on the panel's Close, not dropped to the page.
    expect(button('Reset')).toBeUndefined();
    expect(document.activeElement).toBe(
      document.querySelector('.v12r-settings__close')
    );
  });
});

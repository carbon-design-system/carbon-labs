/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setReducedMotion } from '../../../vitest.dom';
import { Header } from '../index';

setReducedMotion(true);

const ACTION = 48;
const NAME = 200;

/** The bar's width; the name sits at its inline start, the actions at its end. */
let BAR = 800;
let RTL = false;

const rect = (left: number, width: number) =>
  ({
    left,
    right: left + width,
    width,
    top: 0,
    bottom: 48,
    height: 48,
    x: left,
    y: 0,
    toJSON: () => ({}),
  }) as DOMRect;

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
    function (this: HTMLElement) {
      if (this.classList.contains('cds-app-header__home')) {
        return rect(RTL ? BAR - NAME : 0, NAME);
      }
      if (this.classList.contains('cds-app-header__action')) {
        return rect(0, ACTION);
      }
      if (this.classList.contains('cds-app-header')) {
        return rect(0, BAR);
      }
      return rect(0, 0);
    }
  );
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(
    function (this: HTMLElement) {
      return this.classList.contains('cds-app-header') ? BAR : 0;
    }
  );
});

afterEach(() => vi.restoreAllMocks());

/** How many actions went to the overlay, in a page of the given direction. */
function overflowIn(dir: 'ltr' | 'rtl', bar: number): number {
  BAR = bar;
  RTL = dir === 'rtl';
  const target = document.createElement('div');
  const { container } = render(
    <div dir={dir}>
      <Header
        aria-label="Product"
        name="Carbon"
        actionsOverflow
        actionsOverflowTarget={target}
        actions={
          <>
            <button type="button">One</button>
            <button type="button">Two</button>
            <button type="button">Three</button>
          </>
        }
      />
    </div>
  );
  const header = container.querySelector('.cds-app-header')!;
  return Number(header.getAttribute('data-actions-overflow') ?? 0);
}

describe('Header actions overflow by direction', () => {
  it.each(['ltr', 'rtl'] as const)(
    '%s: every action fits with room past the name',
    (dir) => {
      expect(overflowIn(dir, 800)).toBe(0);
    }
  );

  it.each(['ltr', 'rtl'] as const)(
    '%s: the room past the name holds two of three',
    (dir) => {
      // 300 less the name's 200 holds two 48px actions.
      expect(overflowIn(dir, 300)).toBe(1);
    }
  );
});

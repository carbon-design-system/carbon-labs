/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { setReducedMotion } from '../../../vitest.dom';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '../index';

setReducedMotion(true);

const WIDTH = 200;
const MAX = 400;

/** A list that overflows by MAX px, in a page of the given direction. */
function overflowing(dir: 'ltr' | 'rtl') {
  const { container } = render(
    <div dir={dir}>
      <Tabs>
        <TabList aria-label="Sections">
          <Tab>One</Tab>
          <Tab>Two</Tab>
          <Tab>Three</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>Panel one</TabPanel>
          <TabPanel>Panel two</TabPanel>
          <TabPanel>Panel three</TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
  const wrap = container.querySelector<HTMLElement>('.tabs')!;
  const sc = container.querySelector<HTMLElement>('.tabs__scroller')!;
  let left = 0;
  Object.defineProperties(sc, {
    clientWidth: { get: () => WIDTH },
    scrollWidth: { get: () => WIDTH + MAX },
    scrollLeft: { get: () => left },
  });
  const scrollBy = vi.fn();
  sc.scrollBy = scrollBy as unknown as typeof sc.scrollBy;
  const scrollTo = (x: number) => {
    left = x;
    fireEvent.scroll(sc);
  };
  const marks = () => ({
    start: wrap.hasAttribute('data-overflow-start'),
    end: wrap.hasAttribute('data-overflow-end'),
  });
  const press = (which: 'prev' | 'next') => {
    scrollBy.mockClear();
    fireEvent.click(wrap.querySelector(`.tabs__scroll--${which}`)!);
    return (scrollBy.mock.calls[0][0] as ScrollToOptions).left!;
  };
  return { scrollTo, marks, press };
}

describe('Tabs overflow marks', () => {
  it('left to right: scrollLeft runs from 0 up to the most', () => {
    const { scrollTo, marks } = overflowing('ltr');
    scrollTo(0);
    expect(marks()).toEqual({ start: false, end: true });
    scrollTo(MAX / 2);
    expect(marks()).toEqual({ start: true, end: true });
    scrollTo(MAX);
    expect(marks()).toEqual({ start: true, end: false });
  });

  it('right to left: scrollLeft runs from 0 down to minus the most', () => {
    const { scrollTo, marks } = overflowing('rtl');
    scrollTo(0);
    expect(marks()).toEqual({ start: false, end: true });
    scrollTo(-MAX / 2);
    expect(marks()).toEqual({ start: true, end: true });
    scrollTo(-MAX);
    expect(marks()).toEqual({ start: true, end: false });
  });
});

describe('Tabs scroll buttons', () => {
  it('left to right: previous scrolls left, next right', () => {
    const { press } = overflowing('ltr');
    expect(press('prev')).toBeLessThan(0);
    expect(press('next')).toBeGreaterThan(0);
  });

  it('right to left: previous scrolls right, toward the start, next left', () => {
    const { press } = overflowing('rtl');
    expect(press('prev')).toBeGreaterThan(0);
    expect(press('next')).toBeLessThan(0);
  });
});

describe('Tabs scroll buttons’ props', () => {
  // As v11's: `left` goes on the previous button, at the inline start, and
  // `right` on the next, in either direction.
  it.each(['ltr', 'rtl'] as const)(
    '%s: left on previous, right on next',
    (dir) => {
      const { container } = render(
        <div dir={dir}>
          <Tabs>
            <TabList
              aria-label="Sections"
              leftOverflowButtonProps={{ className: 'is-left' }}
              rightOverflowButtonProps={{ className: 'is-right' }}>
              <Tab>One</Tab>
              <Tab>Two</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>Panel one</TabPanel>
              <TabPanel>Panel two</TabPanel>
            </TabPanels>
          </Tabs>
        </div>
      );
      const prev = container.querySelector('.tabs__scroll--prev')!;
      const next = container.querySelector('.tabs__scroll--next')!;
      expect(prev.classList.contains('is-left')).toBe(true);
      expect(next.classList.contains('is-right')).toBe(true);
      // Named for the side it is on, as v11's are.
      expect(prev.getAttribute('aria-label')).toBe(
        dir === 'rtl' ? 'Scroll right' : 'Scroll left'
      );
    }
  );
});

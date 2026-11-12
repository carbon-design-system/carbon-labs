/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// @vitest-environment jsdom

import React from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { CHART_DESIGN, CHART_SIZES, ChartCard, chartKindColor } from '../index';
import { metricText, spokenMetric } from '../components/ChartCard';
import type { ChartKind } from '../components/types';

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

afterEach(() => cleanup());

const COMPACT = {
  value: { notation: 'compact', maximumFractionDigits: 1 },
  locale: 'en-US',
} as const;

/**
 * A card with a metric, a delta and a plot.
 *
 * @param props What to change.
 * @returns The rendered card.
 */
function renderCard(props: Partial<React.ComponentProps<typeof ChartCard>>) {
  return render(
    <ChartCard
      title="Requests"
      metric={{ value: 12400, unit: 'requests' }}
      delta={{ value: 8, unit: '%', direction: 'up', kind: 'success' }}
      format={COMPACT}
      headline="Traffic is up this week"
      description="Requests per hour, across every region."
      status={{ kind: 'success', label: 'Live', stamp: '9:40 AM' }}
      {...props}>
      <svg data-testid="plot" />
    </ChartCard>
  );
}

describe('ChartCard', () => {
  it.each(CHART_SIZES)('renders at %s with that size’s geometry', (size) => {
    renderCard({ size });
    const card = screen.getByRole('group', { name: 'Requests' });
    expect(card.classList.contains(`cds-chart-card--${size}`)).toBe(true);
    expect(card.style.getPropertyValue('--cds-chart-width')).toBe(
      `${CHART_DESIGN.layout[size].width}px`
    );
    expect(card.style.getPropertyValue('--cds-chart-plot-height')).toBe(
      `${CHART_DESIGN.layout[size].plotHeight}px`
    );
    expect(card.classList.contains('cds-chart-card--bleed')).toBe(
      CHART_DESIGN.layout[size].plotBleed
    );
    // The plot sits in its slot, left to right in either direction.
    const plot = screen.getByTestId('plot').parentElement!;
    expect(plot.classList.contains('cds-chart-card__plot')).toBe(true);
    expect(plot.getAttribute('dir')).toBe('ltr');
    // The delta at the row's end, or after the unit.
    const row = card.querySelector('.cds-chart-card__metric')!;
    expect(row.classList.contains('cds-chart-card__metric--end')).toBe(
      CHART_DESIGN.layout[size].deltaAlign === 'end'
    );
  });

  it('is a group named by its title', () => {
    renderCard({});
    const card = screen.getByRole('group', { name: 'Requests' });
    expect(within(card).getByText('Traffic is up this week')).toBeTruthy();
  });

  it('reads the metric and delta as one line of text', () => {
    renderCard({});
    const card = screen.getByRole('group', { name: 'Requests' });
    const spoken = card.querySelector('.cds-chart-card__spoken')!;
    expect(spoken.textContent).toBe('12.4K requests, up 8%');
    // The drawn number, unit and delta are hidden from assistive technology.
    for (const el of card.querySelectorAll(
      '.cds-chart-card__value, .cds-chart-card__fraction, .cds-chart-card__unit, .cds-chart-card__delta'
    )) {
      expect(el.getAttribute('aria-hidden')).toBe('true');
    }
  });

  it('keeps the number and its fraction in order in right to left', () => {
    document.documentElement.dir = 'rtl';
    try {
      renderCard({});
      const card = screen.getByRole('group', { name: 'Requests' });
      const number = card.querySelector('.cds-chart-card__number')!;
      expect(number.getAttribute('dir')).toBe('ltr');
      // The whole part first, then the fraction, inside the one run.
      expect(
        [...number.children].map((el) => el.className.split('__')[1])
      ).toEqual(['value', 'fraction']);
      // The unit stays outside it, so it follows the page.
      expect(number.querySelector('.cds-chart-card__unit')).toBeNull();
    } finally {
      document.documentElement.removeAttribute('dir');
    }
  });

  it('names its overflow menu', () => {
    renderCard({
      overflowActions: [{ id: 'export', itemText: 'Export data' }],
      overflowAriaLabel: 'Requests options',
    });
    expect(
      screen.getByRole('button', { name: 'Requests options' })
    ).toBeTruthy();
  });

  it('names its overflow menu "Options" by default', () => {
    renderCard({ overflowActions: [{ id: 'export', itemText: 'Export' }] });
    expect(screen.getByRole('button', { name: 'Options' })).toBeTruthy();
  });

  it.each<[ChartKind | undefined, ChartKind]>([
    ['success', 'success'],
    ['danger', 'danger'],
    ['warning', 'warning'],
    ['default', 'default'],
    [undefined, 'default'],
  ])('colors a %s delta by its kind', (kind, expected) => {
    renderCard({ delta: { value: 3, direction: 'down', unit: '%', kind } });
    const delta = document.querySelector<HTMLElement>(
      '.cds-chart-card__delta'
    )!;
    expect(delta.dataset.kind).toBe(expected);
    // Warning's color is too light for text: the ink, and its mark.
    const ink = expected === 'warning' ? 'default' : expected;
    expect(delta.style.color).toBe(chartKindColor(ink));
    expect(delta.querySelector('.cds-chart-card__delta-mark') !== null).toBe(
      expected === 'warning'
    );
  });

  it('puts its actions in the foot, the first the primary', () => {
    renderCard({
      actions: [{ label: 'View report' }, { label: 'Compare' }],
    });
    const primary = screen.getByRole('button', { name: 'View report' });
    const secondary = screen.getByRole('button', { name: 'Compare' });
    expect(primary.className).toContain('primary');
    expect(secondary.className).toContain('secondary');
  });

  it('shows a skeleton while loading', () => {
    renderCard({ state: 'loading' });
    const card = screen.getByRole('group', { name: 'Requests' });
    expect(card.getAttribute('aria-busy')).toBe('true');
    expect(screen.queryByTestId('plot')).toBeNull();
    expect(card.querySelector('.cds-chart-card__spoken')).toBeNull();
  });

  it.each([
    ['empty', 'No data to show'],
    ['error', 'The data couldn’t be loaded'],
  ] as const)('shows its %s message in the plot’s place', (state, text) => {
    renderCard({ state });
    const card = screen.getByRole('group', { name: 'Requests' });
    expect(within(card).getByText(text)).toBeTruthy();
    expect(screen.queryByTestId('plot')).toBeNull();
    expect(card.querySelector('.cds-chart-card__metric')).toBeNull();
  });

  it('draws a theme of its own in a theme zone', () => {
    renderCard({ theme: 'inverse' });
    const card = screen.getByRole('group', { name: 'Requests' });
    expect(card.closest('[data-theme-zone="inverse"]')).not.toBeNull();
  });

  it('takes the page’s theme by default', () => {
    renderCard({});
    const card = screen.getByRole('group', { name: 'Requests' });
    expect(card.closest('[data-theme-zone]')).toBeNull();
  });
});

describe('the metric’s text', () => {
  it('splits at the decimal point', () => {
    expect(metricText({ value: 82.4 }, { locale: 'en-US' })).toEqual({
      whole: '82',
      fraction: '.4',
      text: '82.4',
    });
    expect(metricText({ value: 12400 }, COMPACT)).toEqual({
      whole: '12',
      fraction: '.4K',
      text: '12.4K',
    });
  });

  it('fixes its decimals when the metric sets them', () => {
    expect(
      metricText({ value: 3, decimals: 1 }, { locale: 'en-US' }).text
    ).toBe('3.0');
  });

  it('keeps a whole number whole', () => {
    expect(metricText({ value: 1200 }, { locale: 'en-US' })).toEqual({
      whole: '1,200',
      fraction: '',
      text: '1,200',
    });
  });

  it('follows the locale’s decimal sign', () => {
    expect(metricText({ value: 82.4 }, { locale: 'de-DE' }).fraction).toBe(
      ',4'
    );
  });

  it('leaves a format function’s text whole', () => {
    expect(
      metricText({ value: 0.5 }, { value: (n) => `${n * 100} pts` })
    ).toEqual({ whole: '50 pts', fraction: '', text: '50 pts' });
  });

  it('reads a delta alone, and a metric alone', () => {
    expect(
      spokenMetric(null, { value: -2, direction: 'down', unit: 'pts' })
    ).toBe('down 2 pts');
    expect(spokenMetric({ text: '82.4' }, undefined)).toBe('82.4');
  });
});

/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import {
  CHART_COLOR_ROLE_NAMES,
  chartColorVar,
  formatChartX,
  formatDelta,
  formatMetric,
  paletteSlots,
  paletteStepAway,
  paletteThemeOf,
  paletteTierFor,
  roleColor,
  skinFieldOf,
  smoothFor,
  swatchSvg,
  type ChartSkin,
} from '../index';

describe('the color lookup', () => {
  it('maps each role to one skin field', () => {
    const fields = CHART_COLOR_ROLE_NAMES.map(skinFieldOf);
    expect(new Set(fields).size).toBe(fields.length);
  });

  it('writes a role as the theme’s property, and reads it from a skin', () => {
    expect(chartColorVar('support-error')).toBe('var(--cds-support-error)');
    const skin = Object.fromEntries(
      CHART_COLOR_ROLE_NAMES.map((r) => [skinFieldOf(r), r])
    ) as ChartSkin;
    expect(roleColor(skin, 'interactive')).toBe('interactive');
  });
});

describe('the palette', () => {
  it('deals the first pass, then the second', () => {
    const slots = paletteSlots('light', 7);
    expect(slots.map((s) => s.token)).toEqual([
      'blue-60',
      'teal-50',
      'purple-70',
      'magenta-60',
      'cyan-50',
      'blue-80',
      'teal-70',
    ]);
  });

  it('leaves magenta out of a chart that shows status', () => {
    const slots = paletteSlots('dark', 8, { showsStatus: true });
    expect(slots.some((s) => s.hue === 'magenta')).toBe(false);
    expect(slots).toHaveLength(8);
  });

  it('steps away from the card, within the range', () => {
    const [blue] = paletteSlots('light', 1);
    expect(paletteStepAway(blue, 'light')?.token).toBe('blue-70');
    expect(
      paletteStepAway({ ...blue, step: 20, token: 'blue-20' }, 'dark')
    ).toBeNull();
  });

  it('asks small marks for 4.5:1', () => {
    expect(paletteTierFor(2)).toBe('4.5:1');
    expect(paletteTierFor(8)).toBe('3:1');
    expect(paletteThemeOf('v12-dark')).toBe('dark');
    expect(paletteThemeOf('v12-light')).toBe('light');
  });
});

describe('formats', () => {
  it('writes the metric at its decimals, in the locale', () => {
    expect(
      formatMetric({ value: 1234.5, decimals: 1 }, { locale: 'en-US' })
    ).toBe('1,234.5');
    expect(
      formatMetric({ value: 1234.5, decimals: 1 }, { locale: 'de-DE' })
    ).toBe('1.234,5');
    expect(formatMetric({ value: 7 }, { value: (v) => `${v} of 10` })).toBe(
      '7 of 10'
    );
  });

  it('writes the delta unsigned, with its unit', () => {
    expect(
      formatDelta({ value: -4.25, unit: '%', direction: 'down' }, 'en-US')
    ).toBe('4.3%');
    expect(
      formatDelta({ value: 3, unit: 'pts', direction: 'up' }, 'en-US')
    ).toBe('3 pts');
  });

  it('writes the x axis as a time, or by the format’s function', () => {
    const t = Date.UTC(2030, 0, 7, 9, 50);
    expect(
      formatChartX(t, {
        locale: 'en-US',
        x: { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' },
      })
    ).toBe('9:50 AM');
    expect(formatChartX(2, { x: (i) => ['A', 'B', 'C'][i] })).toBe('C');
  });
});

describe('the line constants', () => {
  it('smooths only a curved line', () => {
    expect(smoothFor('straight')).toBe(0);
    expect(smoothFor('curved')).toBeGreaterThan(0);
  });
});

describe('swatchSvg', () => {
  it('draws each key in the same 14 by 8 box', () => {
    for (const kind of [
      'solid',
      'dashed',
      'band',
      'bar',
      'dots',
      'pill',
      'none',
      'solidBand',
    ] as const) {
      const svg = swatchSvg(kind, '#000');
      expect(svg).toMatch(/^<svg width="14" height="8" aria-hidden="true"/);
      expect(svg.endsWith('</svg>')).toBe(true);
    }
  });

  it('draws a texture sample in whole marks on its pitch', () => {
    const svg = swatchSvg('dots', '#000', { mark: 2, pitch: 3 });
    expect(svg.match(/<circle/g)).toHaveLength(9);
  });
});

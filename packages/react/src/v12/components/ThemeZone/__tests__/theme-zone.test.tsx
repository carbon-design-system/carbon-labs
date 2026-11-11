/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  ThemeZone,
  inverseTheme,
  resolveZone,
  themeOf,
  themeZoneAt,
  writeZone,
} from '../index';

const root = document.documentElement;

afterEach(() => {
  root.removeAttribute('data-carbon-theme');
});

/** The zone element a ThemeZone drew. */
const zoneOf = (container: HTMLElement, name: string) =>
  container.querySelector<HTMLElement>(`[data-testid="${name}"]`)!;

describe('the theme pairs', () => {
  it('inverts within a pair: white and g100, v12 light and v12 dark', () => {
    expect(inverseTheme('white')).toBe('g100');
    expect(inverseTheme('g100')).toBe('white');
    expect(inverseTheme('v12-light')).toBe('v12-dark');
    expect(inverseTheme('v12-dark')).toBe('v12-light');
    expect(inverseTheme(null)).toBe('g100');
  });

  it('draws a kit theme in the pair round it', () => {
    expect(themeOf('dark', 'white')).toBe('g100');
    expect(themeOf('dark', null)).toBe('g100');
    expect(themeOf('dark', 'v12-light')).toBe('v12-dark');
    expect(themeOf('light', 'v12-dark')).toBe('v12-light');
  });

  it('reads the v12 zone classes and the page attribute', () => {
    const page = document.createElement('div');
    page.setAttribute('data-carbon-theme', 'v12-light');
    const zone = document.createElement('div');
    const inner = document.createElement('span');
    zone.append(inner);
    page.append(zone);
    expect(themeZoneAt(inner)).toBe('v12-light');
    expect(writeZone(zone, 'v12-dark')).toBe(true);
    expect(zone.className).toBe('cds--v12-dark');
    expect(zone.dataset.cdsTheme).toBe('dark');
    expect(themeZoneAt(inner)).toBe('v12-dark');
    expect(resolveZone('inverse', inner)).toBe('v12-light');
    // Back to v11: the v12 class goes.
    writeZone(zone, 'g100');
    expect(zone.className).toBe('cds--g100');
    writeZone(zone, null);
    expect(zone.className).toBe('');
    expect(zone.dataset.cdsTheme).toBeUndefined();
  });
});

describe('ThemeZone', () => {
  it('on a v12 light page: dark is v12 dark, and inverse inside it is v12 light', () => {
    root.setAttribute('data-carbon-theme', 'v12-light');
    const { container } = render(
      <>
        <ThemeZone theme="inverse" data-testid="inverse" />
        <ThemeZone theme="dark" data-testid="dark">
          <ThemeZone theme="inverse" data-testid="inside" />
        </ThemeZone>
      </>
    );
    const inverse = zoneOf(container, 'inverse');
    const dark = zoneOf(container, 'dark');
    const inside = zoneOf(container, 'inside');
    expect(inverse.classList.contains('cds--v12-dark')).toBe(true);
    expect(dark.classList.contains('cds--v12-dark')).toBe(true);
    expect(inside.classList.contains('cds--v12-light')).toBe(true);
    for (const el of [inverse, dark, inside]) {
      // The v12 class only, on Carbon's first layer.
      expect(el.className).not.toMatch(/cds--(white|g100)\b/);
      expect(el.classList.contains('cds--layer-one')).toBe(true);
    }
    expect(inside.dataset.cdsTheme).toBe('light');
  });

  it('on a v12 dark page: inverse is v12 light', () => {
    root.setAttribute('data-carbon-theme', 'v12-dark');
    const { container } = render(
      <ThemeZone theme="inverse" data-testid="inverse" />
    );
    const inverse = zoneOf(container, 'inverse');
    expect(inverse.className).toContain('cds--v12-light');
    expect(inverse.dataset.cdsTheme).toBe('light');
  });

  it('keeps the v11 zones for a page outside v12: white and g100', () => {
    const { container } = render(
      <>
        <ThemeZone theme="light" data-testid="light" />
        <ThemeZone theme="dark" data-testid="dark">
          <ThemeZone theme="inverse" data-testid="inside" />
        </ThemeZone>
      </>
    );
    expect(zoneOf(container, 'light').className).toContain('cds--white');
    expect(zoneOf(container, 'dark').className).toContain('cds--g100');
    expect(zoneOf(container, 'inside').className).toContain('cds--white');
    expect(container.innerHTML).not.toContain('cds--v12-');
  });

  it('follows the page when it changes pair', async () => {
    root.setAttribute('data-carbon-theme', 'g100');
    const { container } = render(
      <ThemeZone theme="inverse" data-testid="inverse" />
    );
    const inverse = () => zoneOf(container, 'inverse');
    expect(inverse().className).toContain('cds--white');
    root.setAttribute('data-carbon-theme', 'v12-dark');
    await new Promise((r) => setTimeout(r, 50));
    expect(inverse().className).toContain('cds--v12-light');
  });

  it('draws no zone for page', () => {
    root.setAttribute('data-carbon-theme', 'v12-dark');
    const { container } = render(<ThemeZone theme="page" data-testid="p" />);
    const page = zoneOf(container, 'p');
    expect(page.className).toBe('');
    expect(page.dataset.themeZone).toBe('page');
  });
});

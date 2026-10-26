/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useLayoutEffect, useState, type RefObject } from 'react';

export type CarbonTheme = 'white' | 'g10' | 'g90' | 'g100';

/**
 * The perceived lightness of a CSS colour, 0 to 1, for the forms Carbon's
 * themes emit: `oklch()` (v12) and `#rrggbb` (v11). Anything else is unknown.
 *
 * @param {string} color A computed custom-property value.
 * @returns {number | undefined} Lightness, or undefined when it cannot tell.
 */
export function lightnessOf(color: string): number | undefined {
  const oklch = /^oklch\(\s*([\d.]+)(%?)/i.exec(color.trim());
  if (oklch) {
    const value = parseFloat(oklch[1]);
    return oklch[2] ? value / 100 : value;
  }
  const hex = /^#([0-9a-f]{6})$/i.exec(color.trim());
  if (hex) {
    const [r, g, b] = [0, 2, 4].map(
      (i) => parseInt(hex[1].slice(i, i + 2), 16) / 255
    );
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  return undefined;
}

/**
 * The theme the input's menus render in: the opposite of the surface the
 * input sits on (the human's decision 10, menus are inverse). It reads
 * Carbon's own `--cds-background` where the input is, when a menu opens, so it
 * follows a `<Theme>`, a theme class or any other way the page is themed.
 *
 * @param {RefObject<HTMLElement | null>} ref The input's root.
 * @param {CarbonTheme} [override] A theme to use instead.
 * @param {boolean} measure Whether to read the surface now (a menu is open).
 * @returns {CarbonTheme} The menus' theme.
 */
export function useInverseTheme(
  ref: RefObject<HTMLElement | null>,
  override: CarbonTheme | undefined,
  measure: boolean
): CarbonTheme {
  const [theme, setTheme] = useState<CarbonTheme>(override ?? 'g100');

  useLayoutEffect(() => {
    if (override) {
      setTheme(override);
      return;
    }
    if (!measure || !ref.current) {
      return;
    }
    const background = getComputedStyle(ref.current).getPropertyValue(
      '--cds-background'
    );
    const lightness = lightnessOf(background);
    // An unreadable surface is assumed light, the common case.
    setTheme(lightness !== undefined && lightness < 0.5 ? 'white' : 'g100');
  }, [override, measure, ref]);

  return theme;
}

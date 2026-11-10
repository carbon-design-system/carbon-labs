/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useLayoutEffect, useState, type RefObject } from 'react';
import { useTheme } from '@carbon/react';
import { onThemeChange } from '@carbon-labs/react-util';
import {
  CARBON_THEME,
  KIT_THEME,
  inverseTheme,
  themeZoneAt,
  type CarbonThemeName,
  type ZoneTheme,
} from './zone';

/** The Carbon theme an area draws in: the given one; null for `page`; for `inverse`, the opposite
 * of the zone round `ref`'s element, read before the first paint and on every theme change round it. */
export function useThemeZone(
  theme: ZoneTheme,
  ref: RefObject<HTMLElement | null>
): CarbonThemeName | null {
  const context = useTheme().theme as string | undefined;
  const guess = inverseTheme(
    context === 'white' || context === 'g100' ? context : null
  );
  const [read, setRead] = useState<CarbonThemeName | null>(null);
  const inverse = theme === 'inverse';
  useLayoutEffect(() => {
    const el = ref.current;
    if (!inverse || !el) {
      return;
    }
    const measure = () => setRead(inverseTheme(themeZoneAt(el.parentElement)));
    measure();
    // A theme changed round it (the page's, a lab stage's): read it again.
    let raf = 0;
    const off = onThemeChange(el, () => {
      if (raf) {
        return;
      }
      raf = requestAnimationFrame(() => {
        raf = 0;
        measure();
      });
    });
    return () => {
      off();
      cancelAnimationFrame(raf);
    };
  }, [inverse, ref]);
  if (theme === 'page') {
    return null;
  }
  if (inverse) {
    return read ?? guess;
  }
  return CARBON_THEME[theme];
}

/** A zone's attributes, for the element that carries Carbon's `<Theme>`: the theme asked for and the kit's theme it resolves to. */
export function zoneAttrs(theme: ZoneTheme, zone: CarbonThemeName | null) {
  return {
    'data-theme-zone': theme,
    'data-cds-theme': zone ? KIT_THEME[zone] : undefined,
  };
}

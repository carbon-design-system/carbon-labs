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
  KIT_THEME,
  inverseTheme,
  themeOf,
  themeZoneAt,
  type CarbonThemeName,
  type ZoneTheme,
} from './zone';

/** The theme round an area before it can be read: Carbon's context (white or g100), in the pair the page is in. */
function guessRound(context: string | undefined): CarbonThemeName | null {
  const page =
    typeof document === 'undefined'
      ? null
      : themeZoneAt(document.documentElement);
  const named =
    context === 'white' || context === 'g100' ? KIT_THEME[context] : null;
  return named ? themeOf(named, page) : page;
}

/** The Carbon theme an area draws in: null for `page`; for `light` and `dark`, that theme in the pair round `ref`'s
 * element (v12's on a v12 page, else white and g100); for `inverse`, the opposite of the zone round it. Read before
 * the first paint and on every theme change round it. */
export function useThemeZone(
  theme: ZoneTheme,
  ref: RefObject<HTMLElement | null>
): CarbonThemeName | null {
  const context = useTheme().theme as string | undefined;
  const [read, setRead] = useState<CarbonThemeName | null | undefined>();
  const zoned = theme !== 'page';
  useLayoutEffect(() => {
    const el = ref.current;
    if (!zoned || !el) {
      return;
    }
    const measure = () => setRead(themeZoneAt(el.parentElement));
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
  }, [zoned, ref]);
  if (!zoned) {
    return null;
  }
  const round = read === undefined ? guessRound(context) : read;
  return theme === 'inverse' ? inverseTheme(round) : themeOf(theme, round);
}

/** A zone's attributes, for the element that carries Carbon's `<Theme>`: the theme asked for and the kit's theme it resolves to. */
export function zoneAttrs(theme: ZoneTheme, zone: CarbonThemeName | null) {
  return {
    'data-theme-zone': theme,
    'data-cds-theme': zone ? KIT_THEME[zone] : undefined,
  };
}

/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  createElement,
  forwardRef,
  useImperativeHandle,
  useRef,
  type ElementType,
  type HTMLAttributes,
  type Ref,
} from 'react';
import { Theme } from '@carbon/react';
import { useThemeZone, zoneAttrs } from './useThemeZone';
import { BASE_THEME, type CarbonThemeName, type ZoneTheme } from './zone';

export interface ThemeZoneProps extends HTMLAttributes<HTMLElement> {
  /** `light`, `dark`, `page` (the page's own: no zone) or `inverse` (the opposite of the theme round it). */
  theme: ZoneTheme;
  /** The element. Default `div`. */
  as?: ElementType;
}

/** The zone's element under Carbon's `<Theme>`, which passes no ref on: the ref comes as `elementRef`. Carbon's
 * `<Theme>` knows only its own themes, so a v12 zone is drawn by the theme it is built on (its context, its layer)
 * and its class is swapped for the v12 one. */
function ZoneElement({
  element: As,
  elementRef,
  zone,
  className,
  ...rest
}: HTMLAttributes<HTMLElement> & {
  element: ElementType;
  elementRef: Ref<HTMLElement>;
  zone: CarbonThemeName;
}) {
  const base = `cds--${BASE_THEME[zone]}`;
  const own = `cds--${zone}`;
  const classes =
    base === own
      ? className
      : (className ?? '')
          .split(' ')
          .filter((c) => c && c !== base)
          .concat(own)
          .join(' ');
  return createElement(As, { ...rest, className: classes, ref: elementRef });
}

/** An area in a theme of its own, through Carbon's `<Theme>` (its class, its tokens, its context): white and g100, or
 * v12 light and v12 dark on a page in a v12 theme. */
export const ThemeZone = forwardRef<HTMLElement, ThemeZoneProps>(
  function ThemeZone({ theme, as = 'div', children, ...rest }, forwarded) {
    const ref = useRef<HTMLElement | null>(null);
    useImperativeHandle(forwarded, () => ref.current!, []);
    const zone = useThemeZone(theme, ref);
    if (!zone) {
      const As = as;
      return (
        <As ref={ref} {...rest} {...zoneAttrs(theme, zone)}>
          {children}
        </As>
      );
    }
    return (
      <Theme
        as={ZoneElement}
        element={as}
        elementRef={ref}
        zone={zone}
        theme={BASE_THEME[zone]}
        {...rest}
        {...zoneAttrs(theme, zone)}>
        {children}
      </Theme>
    );
  }
);

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
import type { ZoneTheme } from './zone';

export interface ThemeZoneProps extends HTMLAttributes<HTMLElement> {
  /** `light`, `dark`, `page` (the page's own: no zone) or `inverse` (the opposite of the theme round it). */
  theme: ZoneTheme;
  /** The element. Default `div`. */
  as?: ElementType;
}

/** The zone's element under Carbon's `<Theme>`, which passes no ref on: the ref comes as `elementRef`. */
function ZoneElement({
  element: As,
  elementRef,
  ...rest
}: HTMLAttributes<HTMLElement> & {
  element: ElementType;
  elementRef: Ref<HTMLElement>;
}) {
  return createElement(As, { ...rest, ref: elementRef });
}

/** An area in a theme of its own, through Carbon's `<Theme>` (its class, its tokens, its context). */
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
        theme={zone}
        {...rest}
        {...zoneAttrs(theme, zone)}>
        {children}
      </Theme>
    );
  }
);

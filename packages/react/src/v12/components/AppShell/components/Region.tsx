/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  type AriaRole,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { Scroller } from '@carbon-labs/react-scroller';
import { KitDefaults, type KitFrame } from '@carbon-labs/react-kit-defaults';
import { ThemeZone, type ZoneTheme } from '@carbon-labs/react-theme-zone';
import './app-shell.scss';

/* ============================================================================
 * Region — one area of a screen
 * ============================================================================
 *
 *   surface   page: the page's background, nothing of its own; quiet: the
 *             standard surface (`--cds-surface`) and its hairline
 *             (`--cds-surface-rule`), the side nav's panel; raised: a surface
 *             over the page, the popover's fill and edge
 *   frame     the surface also sets the default `frame` of the selection
 *             and navigation components inside (KitDefaults' `frame`,
 *             `REGION_FRAME`): inset on the page, ghost on quiet and raised,
 *             which already frame them. Their own `frame` wins; TabList's
 *             line and the floating menus don't change
 *   corners  the kit's words, `square` or `rounded`; `rounded` is the
 *             region's own radius, the ladder's step for where its surface
 *             is: 16 over the page
 *             (raised), 8 in the page (page, quiet). Given none, the
 *             surface's: square on the page (attached to an edge), rounded
 *             on quiet and raised. Its children can round concentrically from
 *             `--cds-region-inner-radius` (outer − padding). A rounded region
 *             also rounds the containers inside (KitDefaults'
 *             `containerCorners`: DataTable, Accordion, ContainedList,
 *             StructuredList), a square one squares them; their own
 *             `corners` wins
 *   outline   the surface's hairline: on for quiet and raised, none on the
 *             page (`REGION_OUTLINE`); `outline={false}` is the fill alone
 *             (AppShell's inset workspace)
 *   theme     the page's own (default), `light`, `dark`, or `inverse`, the
 *             opposite of the theme round it (theme.ts), as the Header's
 *             `theme`: Carbon's `Theme` on the region's element, so its
 *             surface and everything in it resolve in that theme
 *   padding   from density: compact 16, default 24, spacious 32, or none
 *   scroll    page: it grows with its content and the page scrolls; self:
 *             the kit's Scroller inside it (give it a height from its
 *             layout); none: it clips
 * ========================================================================== */

export type RegionSurface = 'page' | 'quiet' | 'raised';
export type RegionCorners = 'square' | 'rounded';
export type RegionPadding = 'none' | 'compact' | 'default' | 'spacious';
export type RegionScroll = 'page' | 'self' | 'none';
/** A region's theme: `light`, `dark`, `page` (its own) or `inverse` (the opposite of the theme round it). */
export type RegionTheme = ZoneTheme;

/** Each density's padding, px. */
export const REGION_PADDING: Record<RegionPadding, number> = {
  none: 0,
  compact: 16,
  default: 24,
  spacious: 32,
};
/** Each surface's corners when none are given: square on the page, rounded on a surface of its own. */
export const REGION_CORNERS: Record<RegionSurface, RegionCorners> = {
  page: 'square',
  quiet: 'rounded',
  raised: 'rounded',
};
/** Each surface's radius when rounded, px: the ladder's step, 8 in the page (`corners.$in`), 16 over it (`corners.$over`). */
export const REGION_RADIUS: Record<RegionSurface, number> = {
  page: 8,
  quiet: 8,
  raised: 16,
};
/** Each surface's default frame for the selection and navigation components inside: on the page they stand on their own (inset); a framed region already frames them (ghost). */
export const REGION_FRAME: Record<RegionSurface, KitFrame> = {
  page: 'inset',
  quiet: 'ghost',
  raised: 'ghost',
};
/** Each surface's hairline when none is given: the quiet surface's rule and the raised one's edge; the page has none. */
export const REGION_OUTLINE: Record<RegionSurface, boolean> = {
  page: false,
  quiet: true,
  raised: true,
};

export interface RegionProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'children'
> {
  /** The element. Default `div`. */
  as?: ElementType;
  // @carbon-explore region-surface — A `Region` names the colour an area stands on (`surface`: page, quiet or raised, with its `outline`), and that sets the default frame of what is inside. TBD
  /** Default `page`. */
  surface?: RegionSurface;
  // @carbon-explore corners-prop — Corner mode is one `corners` prop (full, rounded or square) that a provider can set for a subtree, where `rounded` is the component's own radius. TBD
  /** `square` or `rounded` (the surface's step: 16 raised, else 8). Default the surface's: page square, quiet and raised rounded. */
  corners?: RegionCorners;
  /** The surface's hairline. Default the surface's (`REGION_OUTLINE`): on for quiet and raised. */
  outline?: boolean;
  /** Its theme: `light`, `dark`, `page` (the page's own) or `inverse` (the opposite of the theme round it). Default `page`. */
  theme?: RegionTheme;
  /** Default `none`. */
  padding?: RegionPadding;
  /** Default `page`. */
  scroll?: RegionScroll;
  role?: AriaRole;
  'aria-label'?: string;
  children?: ReactNode;
  /** Slow motion for its Scroller (`scroll="self"`). Default 1. */
  timeScale?: number;
}

export function Region({
  as: As = 'div',
  surface = 'page',
  corners = REGION_CORNERS[surface],
  outline = REGION_OUTLINE[surface],
  theme = 'page',
  padding = 'none',
  scroll = 'page',
  className,
  style,
  children,
  timeScale,
  ...rest
}: RegionProps) {
  const radius = corners === 'square' ? 0 : REGION_RADIUS[surface];
  const pad = REGION_PADDING[padding];
  const vars = {
    '--cds-region-radius': `${radius}px`,
    '--cds-region-pad': `${pad}px`,
    '--cds-region-inner-radius': `${Math.max(0, radius - pad)}px`,
    ...style,
  } as CSSProperties;
  const classes = [
    'cds-region',
    `cds-region--${surface}`,
    `cds-region--scroll-${scroll}`,
    !outline && 'cds-region--no-outline',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  // What's inside takes the region's defaults, from one provider: the frame
  // (inset on the page, ghost in a framed region) and the containers' corners
  // (rounded in a rounded region).
  const framed = (
    <KitDefaults
      frame={REGION_FRAME[surface]}
      containerCorners={radius > 0 ? 'rounded' : 'square'}>
      {children}
    </KitDefaults>
  );
  const content =
    scroll === 'self' ? (
      <Scroller
        className="cds-region__scroller"
        viewportClassName="cds-region__viewport"
        timeScale={timeScale}>
        {framed}
      </Scroller>
    ) : (
      framed
    );
  // A theme of its own: a ThemeZone as the region's element (page: none).
  if (theme !== 'page')
    return (
      <ThemeZone
        as={As}
        {...rest}
        theme={theme}
        className={classes}
        style={vars}>
        {content}
      </ThemeZone>
    );
  return (
    <As {...rest} className={classes} style={vars}>
      {content}
    </As>
  );
}

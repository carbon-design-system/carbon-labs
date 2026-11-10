/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  resolveSelectionStyle as resolveKitStyle,
  type ResolvedSelectionStyle as KitResolvedStyle,
  type SelectionMotion,
  type SelectionStyleProps as KitStyleProps,
} from '@carbon-labs/v12-motion';
import type { LightnessSteps } from '@carbon-labs/v12-motion';
import type { Frame } from '@carbon-labs/react-props';
import { ghostSteps } from './ghost';

/* ============================================================================
 * The `hero` variant: the selection in the brand blue,
 * for the one emphasized control on a page; every other selection stays
 * neutral (inverse, tonal, outlined).
 *
 * carbon-motion's resolver knows the three neutral variants. Until it takes
 * `hero` itself, the kit wraps it: a hero root is
 * the inverse root (its press, glow and ring behave the same) plus
 * `sel--hero`, which repaints the selector (selection-kit.scss). These
 * exports shadow carbon-motion's in `../selection-kit`.
 * ========================================================================== */

export type SelectionVariant = 'tonal' | 'inverse' | 'outlined' | 'hero';

export interface SelectionStyleProps extends Omit<KitStyleProps, 'variant'> {
  /**
   * `inverse` (default) the inverse selector; `tonal` a selected-layer
   * selector; `outlined` a hairline selector; `hero` the brand blue, for the
   * one emphasized control on a page.
   */
  variant?: SelectionVariant;
  /**
   * The quiet surface's hairline round the track (`--cds-surface-rule`, the
   * side nav's), as `outline` puts a hairline on Menu, Popover and the
   * tooltips. Off by default: a track is the fill alone.
   * Only on an inset track: no effect on `frame="ghost"` (no track) or
   * `frame="line"` (the rule is its own edge), nor on the outlined selector's
   * own edge.
   */
  outline?: boolean;
}

export interface ResolvedSelectionStyle extends Omit<KitResolvedStyle, 'kind'> {
  /** The variant (carbon-motion calls it `kind`; the kit keeps `kind` for roles). */
  variant: SelectionVariant;
  /** `frame="ghost"`: no track (`sel--ghost`). */
  ghost: boolean;
  /** The rollover's matched-lightness steps (`useItemRollover`'s `steps`): ghost's, or undefined for the rollover's own. */
  steps?: () => LightnessSteps;
}

/**
 * The kit's class list for a root, from its style props (`hero` included)
 * and its `frame`. Ghost (`sel--ghost`) hovers by matched lightness off what
 * is behind it, since it has no track to step from toward the selection; an
 * `interaction` given explicitly still wins. The other frames draw no class
 * here: each component draws its own (the track is the default).
 */
export function resolveSelectionStyle(
  p: SelectionStyleProps & {
    orientation?: 'horizontal' | 'vertical';
    highlight?: boolean;
    frame?: Frame;
  },
  m: Pick<SelectionMotion, 'drag' | 'pressColor'>
): ResolvedSelectionStyle {
  const { frame, outline, ...rest } = p;
  const ghost = frame === 'ghost';
  // The hairline is an inset track's: a ghost has no track, line tabs draw their rule.
  const outlined = outline && !ghost && frame !== 'line';
  const q = ghost
    ? { ...rest, interaction: rest.interaction ?? 'lightness' }
    : rest;
  const hero = q.variant === 'hero';
  const { kind, ...r } = resolveKitStyle(
    (hero ? { ...q, variant: 'inverse' } : q) as KitStyleProps,
    m
  );
  return {
    ...r,
    variant: hero ? 'hero' : (kind as SelectionVariant),
    ghost,
    steps: ghost ? ghostSteps : undefined,
    classes: [
      ...r.classes,
      hero && 'sel--hero',
      ghost && 'sel--ghost',
      outlined && 'sel--outline',
    ],
  };
}

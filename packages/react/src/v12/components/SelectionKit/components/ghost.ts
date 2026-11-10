/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LIGHTNESS_STEPS, type LightnessSteps } from '@carbon-labs/v12-motion';

/* ============================================================================
 * Ghost: a selection or navigation component with no surface of its own
 * (v11's ghost; the `frame` prop).
 *
 *   inset     its own track, its rows inset: the default where it stands
 *             alone on the page
 *   ghost     no surface: only the selector, the hover and the focus show,
 *             for a component inside something that already frames it (a
 *             card, a side panel, an open side-nav group)
 *   floating  raised over the page: menus, listboxes
 *
 * `frame` is the structure, `variant` the selector's colours: a ghost list
 * keeps its inverse selector, only the track goes. The look is `.sel--ghost`
 * (selection-kit.scss); the hover is solved here.
 * ========================================================================== */

/**
 * Ghost's hover steps by matched lightness off whatever is behind it, both
 * softened (the side nav's ghost): with no track, the rows sit on the page
 * or a card, where the rollover's steps read strong. Light half, dark three
 * quarters, so both read as one step, as Carbon's layer-01 off its page.
 */
export const GHOST_DARK_STEP = 0.75;
export const GHOST_LIGHT_STEP = 0.5;

/** The rollover's steps for a ghost list (stable: pass it as `useItemRollover`'s `steps`). */
export function ghostSteps(): LightnessSteps {
  return {
    ...LIGHTNESS_STEPS,
    hoverLight: LIGHTNESS_STEPS.hoverLight * GHOST_LIGHT_STEP,
    hoverDark: LIGHTNESS_STEPS.hoverDark * GHOST_DARK_STEP,
  };
}

/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LIGHTNESS_STEPS, type LightnessSteps } from '@carbon-labs/v12-motion';

/**
 * The quiet card hover: half the house's matched-lightness steps, hover 4.5 L* on the light and dark
 * themes alike, press twice that. Read when a rollover attaches, so a token draft reaches it. The
 * tiles' default, and the neutral button shell's. */
export const quietSteps = (): LightnessSteps => ({
  ...LIGHTNESS_STEPS,
  hoverLight: LIGHTNESS_STEPS.hoverLight / 2,
  hoverDark: LIGHTNESS_STEPS.hoverDark / 2,
});

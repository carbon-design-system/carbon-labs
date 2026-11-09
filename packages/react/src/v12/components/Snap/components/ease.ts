/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { CSSProperties } from 'react';
import { SNAP_PROPOSED_EASE, snapEaseCss } from '@carbon-labs/v12-motion';

/** The snap's pull-back exit curve, as CSS. carbon-motion has no CSS token for it yet. */
export const EXIT_PULLBACK = snapEaseCss(SNAP_PROPOSED_EASE['exit-pullback']);

/** The custom property the kit's SCSS reads the pull-back from (`--cds-exit-pullback`). */
export const exitPullbackStyle = {
  ['--cds-exit-pullback' as string]: EXIT_PULLBACK,
} as CSSProperties;

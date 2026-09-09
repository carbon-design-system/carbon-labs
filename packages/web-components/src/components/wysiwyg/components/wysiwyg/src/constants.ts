/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { breakpoints } from '@carbon/layout';
import { settings } from '@carbon-labs/utilities';
const { stablePrefix: clabsPrefix } = settings;

export const TOOLTIP_ENTER_DELAY_MS = 400;
export const TOOLTIP_LEAVE_DELAY_MS = 100;

export const BASE_CLASS = `${clabsPrefix}-wysiwyg`;

/** Carbon `md` — below this, dense toolbar groups collapse into popovers. */
export const COMPACT_TOOLBAR_MAX_WIDTH = parseFloat(breakpoints.md.width) * 16;

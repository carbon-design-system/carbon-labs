/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { motionTokens } from '@carbon-labs/v12-motion';

/** A label-only tooltip (an icon button's name) leaves after `fast-02`. */
export const TOOLTIP_LEAVE_LABEL_MS = motionTokens.duration['fast-02'];

/** A tooltip with text worth reading waits `moderate-03`, so the pointer can cross onto it. */
export const TOOLTIP_LEAVE_TEXT_MS = motionTokens.duration['moderate-03'];

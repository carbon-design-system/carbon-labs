/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { variantToggle, type ToggleIconProps } from '../../engine';
import {
  FlashOffFilledToggleSpec,
  FlashOffOutlineToggleSpec,
} from './flashOffArt';

/** Flash ⇄ Flash off. `filled` picks Carbon's filled drawings. */
export const FlashOffToggleSpec = /* @__PURE__ */ variantToggle(
  'FlashOffToggle',
  (p: ToggleIconProps<'on' | 'off'>) =>
    p.filled ? FlashOffFilledToggleSpec : FlashOffOutlineToggleSpec
);

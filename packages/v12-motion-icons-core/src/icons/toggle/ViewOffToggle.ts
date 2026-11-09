/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { variantToggle, type ToggleIconProps } from '../../engine';
import {
  ViewOffFilledToggleSpec,
  ViewOffOutlineToggleSpec,
} from './viewOffArt';

/** View ⇄ View off. `filled` picks Carbon's filled drawings. */
export const ViewOffToggleSpec = /* @__PURE__ */ variantToggle(
  'ViewOffToggle',
  (p: ToggleIconProps<'on' | 'off'>) =>
    p.filled ? ViewOffFilledToggleSpec : ViewOffOutlineToggleSpec
);

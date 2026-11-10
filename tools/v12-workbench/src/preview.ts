/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The preview side of the add-on: the toolbar's globals and the decorator
// that applies them.

// The motion tokens every v12 stylesheet reads (`var(--cds-motion-*)`), from
// the seam, on every v12 story.
import '@carbon-labs/v12-motion/tokens.css';
import { withWorkbench } from './decorator';
import { quietCancelledAnimationWaits } from './animation-wait';

if (typeof window !== 'undefined') {
  quietCancelledAnimationWaits();
}

export { globalTypes, initialGlobals } from './globals';
export const decorators = [withWorkbench];

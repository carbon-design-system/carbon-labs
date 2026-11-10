/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { contentAfterMs } from '@carbon-labs/v12-motion';

/**
 * A snap entrance's content clock, ms: one duration step or 60ms longer than
 * `longest`, the entrance's longest axis clock, whichever is sooner
 * (carbon-motion's `contentAfterMs`, the snap's own content clock). A 160ms
 * width: 220ms; a 400ms width: 460ms. Past the longest token, `longest`
 * itself. The content starts on the entrance's first frame, no wait.
 *
 * For a component that times a snap entrance's content itself: the side
 * panel's arrival (on the main thread), the tearsheet's content layer, the
 * contextual bar's row, the unsaved-changes bar.
 */
export function snapEntranceContentMs(longest: number): number {
  return contentAfterMs(longest);
}

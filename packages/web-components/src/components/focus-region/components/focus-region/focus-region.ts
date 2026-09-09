/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { settings } from '@carbon-labs/utilities';
import FocusRegionTemplate from './src/focus-region.template.js';

const { stablePrefix: clabsPrefix } = settings;
const tagName = `${clabsPrefix}-focus-region`;

/**
 * Focus region web component.
 * Wraps a page section to participate in F6/Shift+F6 keyboard navigation.
 */
class CLABSFocusRegion extends FocusRegionTemplate {}

if (!customElements.get(tagName)) {
  customElements.define(tagName, CLABSFocusRegion);
}

export default CLABSFocusRegion;

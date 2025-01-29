/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import CDSSwitcherDivider from '@carbon/web-components/es/components/ui-shell/switcher-divider.js';
// @ts-ignore
import styles from './switcher-divider.scss?inline';

/**
 * Component extending the @carbon/web-components' switcher-divider
 */
class switcherDivider extends CDSSwitcherDivider {
  static styles = styles;
}

export default switcherDivider;

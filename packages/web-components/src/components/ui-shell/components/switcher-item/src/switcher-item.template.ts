/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import CDSSwitcherItem from '@carbon/web-components/es/components/ui-shell/switcher-item.js';
// @ts-ignore
import styles from './switcher-item.scss?inline';

/**
 * Component extending the @carbon/web-components' switcher-item
 */
class switcherItem extends CDSSwitcherItem {
  static styles = styles;
}

export default switcherItem;

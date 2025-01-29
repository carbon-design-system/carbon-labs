/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import CDSSideNavItems from '@carbon/web-components/es/components/ui-shell/side-nav-items.js';
// @ts-ignore
import styles from './side-nav-items.scss?inline';

/**
 * Component extending the @carbon/web-components' side-nav-items
 */
class sideNavItems extends CDSSideNavItems {
  static styles = styles;
}

export default sideNavItems;

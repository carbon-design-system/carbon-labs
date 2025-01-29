/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import CDSSideNavMenuItem from '@carbon/web-components/es/components/ui-shell/side-nav-menu-item.js';
// @ts-ignore
import styles from './side-nav-menu-item.scss?inline';

/**
 * Component extending the @carbon/web-components' side-nav-menu-item
 */
class sideNavMenuItem extends CDSSideNavMenuItem {
  static styles = styles;
}

export default sideNavMenuItem;

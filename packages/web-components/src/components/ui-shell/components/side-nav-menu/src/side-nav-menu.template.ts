/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import CDSSideNavMenu from '@carbon/web-components/es/components/ui-shell/side-nav-menu.js';
// @ts-ignore
import styles from './side-nav-menu.scss?inline';

/**
 * Component extending the @carbon/web-components' side-nav-menu
 */
class sideNavMenu extends CDSSideNavMenu {
  static styles = styles;
}

export default sideNavMenu;

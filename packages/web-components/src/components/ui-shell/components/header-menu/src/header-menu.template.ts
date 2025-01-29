/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import CDSHeaderMenu from '@carbon/web-components/es/components/ui-shell/header-menu.js';
// @ts-ignore
import styles from './header-menu.scss?inline';

/**
 * Component extending the @carbon/web-components' header-menu
 */
class headerMenu extends CDSHeaderMenu {
  static styles = styles;
}

export default headerMenu;

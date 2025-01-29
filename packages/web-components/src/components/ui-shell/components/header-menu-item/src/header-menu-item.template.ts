/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import CDSHeaderMenuItem from '@carbon/web-components/es/components/ui-shell/header-menu-item.js';
// @ts-ignore
import styles from './header-menu-item.scss?inline';

/**
 * Component extending the @carbon/web-components' header-menu-item
 */
class headerMenuItem extends CDSHeaderMenuItem {
  static styles = styles;
}

export default headerMenuItem;

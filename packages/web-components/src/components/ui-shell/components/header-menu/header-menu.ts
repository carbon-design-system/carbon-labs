/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { customElement } from 'lit/decorators.js';
import { settings } from '@carbon-labs/utilities/es/settings/index.js';
import headerMenu from './src/header-menu.template.js';

const { stablePrefix: clabsPrefix } = settings;

/**
 * Component extending the @carbon/web-components' header-menu
 */
@customElement(`${clabsPrefix}-header-menu`)
class CLABSHeaderMenu extends headerMenu {
  /**
   * A selector that will return the menu items.
   */
  static get selectorItem() {
    return `${clabsPrefix}-header-menu-item`;
  }
}

export default CLABSHeaderMenu;

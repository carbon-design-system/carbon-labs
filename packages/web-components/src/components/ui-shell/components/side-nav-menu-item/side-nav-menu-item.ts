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
import sideNavMenuItem from './src/side-nav-menu-item.template.js';

const { stablePrefix: clabsPrefix } = settings;

/**
 * Component extending the @carbon/web-components' side-nav-menu-item
 */
@customElement(`${clabsPrefix}-side-nav-menu-item`)
class CLABSSideNavMenuItem extends sideNavMenuItem {
  /**
   * A selector that will return the parent menu.
   */
  static get selectorMenu() {
    return `${clabsPrefix}-side-nav-menu`;
  }
}

export default CLABSSideNavMenuItem;

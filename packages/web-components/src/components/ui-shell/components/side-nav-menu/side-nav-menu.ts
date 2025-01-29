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
import sideNavMenu from './src/side-nav-menu.template.js';

const { stablePrefix: clabsPrefix } = settings;

/**
 * Component extending the @carbon/web-components' side-nav-menu
 */
@customElement(`${clabsPrefix}-side-nav-menu`)
class CLABSSideNavMenu extends sideNavMenu {
  /**
   * A selector that will return the menu items.
   */
  static get selectorItem() {
    return `${clabsPrefix}-side-nav-menu-item`;
  }

  /**
   * The name of the custom event fired before this side nav menu is being toggled upon a user gesture.
   * Cancellation of this event stops the user-initiated action of toggling this side nav menu.
   */
  static get eventBeforeToggle() {
    return `${clabsPrefix}-side-nav-menu-beingtoggled`;
  }

  /**
   * The name of the custom event fired after this side nav menu is toggled upon a user gesture.
   */
  static get eventToggle() {
    return `${clabsPrefix}-side-nav-menu-toggled`;
  }
}

export default CLABSSideNavMenu;

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
import sideNav from './src/side-nav.template.js';

const { stablePrefix: clabsPrefix } = settings;

/**
 * Component extending the @carbon/web-components' side-nav
 */
@customElement(`${clabsPrefix}-side-nav`)
class CLABSSideNav extends sideNav {
  /**
   * A selector that will return the toggle buttons.
   */
  static get selectorButtonToggle() {
    return `${clabsPrefix}-header-menu-button`;
  }

  /**
   * A selector that will return the header name + global action elements.
   */
  static get selectorHeaderItems() {
    return `${clabsPrefix}-header-name, ${clabsPrefix}-header-global-action`;
  }

  /**
   * A selector that will return side nav focusable items.
   */
  static get selectorNavItems() {
    return `${clabsPrefix}-side-nav-menu, ${clabsPrefix}-side-nav-menu-item, ${clabsPrefix}-side-nav-link`;
  }

  /**
   * A selector that will return side nav menus.
   */
  static get selectorMenu() {
    return `${clabsPrefix}-side-nav-menu`;
  }

  /**
   * The name of the custom event fired after the header menu button in the document is toggled upon a user gesture.
   */
  static get eventButtonToggle() {
    return `${clabsPrefix}-header-menu-button-toggled`;
  }
}

export default CLABSSideNav;

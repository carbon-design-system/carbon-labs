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
import headerMenuButton from './src/header-menu-button.template.js';

const { stablePrefix: clabsPrefix } = settings;

/**
 * Component extending the @carbon/web-components' header-menu-button
 */
@customElement(`${clabsPrefix}-header-menu-button`)
class CLABSHeaderMenuButton extends headerMenuButton {
  /**
   * The name of the custom event fired after this header menu button is toggled upon a user gesture.
   */
  static get eventToggle() {
    return `${clabsPrefix}-header-menu-button-toggled`;
  }
}

export default CLABSHeaderMenuButton;

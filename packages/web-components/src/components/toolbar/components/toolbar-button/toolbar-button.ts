/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { customElement } from 'lit/decorators.js';
import { settings } from '@carbon-labs/utilities/es/settings/index.js';
import toolbarButton from './src/toolbar-button.template.js';

const { stablePrefix: clabsPrefix } = settings;

/**
 * Component extending the @carbon/web-components' button
 */
@customElement(`${clabsPrefix}-toolbar-button`)
class CLABSToolbarButton extends toolbarButton {
  /**
   * Constructor
   */
  constructor() {
    super();
  }

  /**
   * Connected callback
   */
  connectedCallback() {
    super.connectedCallback();

    // modifying default properties of the extended component
    this.setAttribute('kind', this.getAttribute('kind') || 'ghost');
    this.setAttribute(
      'enter-delay-ms',
      this.getAttribute('enter-delay-ms') || '100'
    );
    this.setAttribute(
      'leave-delay-ms',
      this.getAttribute('leave-delay-ms') || '100'
    );
    this.setAttribute('kind', this.getAttribute('kind') || 'ghost');
  }
}

export default CLABSToolbarButton;

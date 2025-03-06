/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import CDSIconButton from '@carbon/web-components/es/components/icon-button/icon-button';
// @ts-ignore
import styles from './toolbar-button.scss?inline';

/**
 * Extended toolbar button with predefined properties
 */
class ToolbarButton extends CDSIconButton {
  static styles = styles;
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

customElements.define('toolbar-button', ToolbarButton);
export default ToolbarButton;
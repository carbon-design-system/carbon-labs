/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// @ts-ignore
import styles from './style-picker-icon.scss?inline';
import { LitElement } from 'lit';

/**
 * Icon picker element.
 */
class StylePickerIcon extends LitElement {
  static styles = styles;

  /**
   * Return the slot index from the custom attribute set in the parent module
   */
  get moduleIndex() {
    return this.getAttribute('data-slot-index');
  }
}

export default StylePickerIcon;

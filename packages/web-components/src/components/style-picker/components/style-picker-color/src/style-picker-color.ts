/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { property } from 'lit/decorators.js';
// @ts-ignore
import styles from './style-picker-color.scss?inline';
import { LitElement } from 'lit';

/**
 * Color picker option element extending LitElement.
 */
class StylePickerColor extends LitElement {
  static styles = styles;

  @property({ type: String, reflect: true, attribute: 'color' })
  color?: string;

  @property({ type: String, reflect: true, attribute: 'label' })
  label?: string;

  /**
   * Return the slot index from the custom attribute set in the parent module
   */
  get moduleIndex() {
    return this.getAttribute('data-slot-index');
  }
}

export default StylePickerColor;

/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

// @ts-ignore
import styles from './tagElement.scss?inline';
/**
 * Input component using search typeahead api
 */
export default class tagElement extends LitElement {
  static styles = styles;

  /**
   * Text inside the tag
   */
  @property({ type: String, attribute: 'text', reflect: true })
  text;

  /**
   * Left border color
   */
  @property({ type: String, attribute: 'color' })
  color;

  /**
   * Tooltip position
   */
  @property({ type: String, attribute: 'tooltipPosition' })
  tooltipPosition;

  /**
   * Tooltip text
   */
  @property({ type: String, attribute: 'tooltipText' })
  tooltipText;

  /**
   * updated - check changed properties
   * @param {object} changedProperties - LIT object denoting changed attributes
   */
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('color')) {
      this.style.setProperty('--border-color', this.color);
    }
  }

  /**
   * _handleClick - fire event when tag is clicked
   */
  _handleClick() {
    console.log('tag clicked');
    // Tag click event logic here
  }
}

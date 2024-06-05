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
import styles from './tag.scss?inline';
/**
 * Input component using search typeahead api
 */
export class Tag extends LitElement {
  static styles = styles;

  /**
   * Text inside the tag
   */
  @property({ attribute: 'text', type: String })
  text;

  /**
   * Left border color
   */
  @property({ attribute: 'color', type: String })
  color;

  /**
   * Tooltip position
   */
  @property({ attribute: 'tooltip-position', type: String })
  tooltipPosition;

  /**
   * Tooltip text
   */
  @property({ attribute: 'tooltip-text', type: String })
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
   * fire event when tag is clicked
   */
  handleClick() {
    this.dispatchEvent(
      new CustomEvent('tag-click', { detail: { message: 'Tag clicked' } })
    );
  }
}

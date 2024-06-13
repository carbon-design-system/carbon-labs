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
      if (this.color === 'red') {
        this.style.setProperty('--border-color', '#fa4d56');
      } else if (this.color === 'magenta') {
        this.style.setProperty('--border-color', '#ee5396');
      } else if (this.color === 'purple') {
        this.style.setProperty('--border-color', '#a56eff');
      } else if (this.color === 'blue') {
        this.style.setProperty('--border-color', '#4589ff');
      } else if (this.color === 'cyan') {
        this.style.setProperty('--border-color', '#1192e8');
      } else if (this.color === 'teal') {
        this.style.setProperty('--border-color', '#009d9a');
      } else if (this.color === 'green') {
        this.style.setProperty('--border-color', '#24a148');
      } else if (this.color === 'gray') {
        this.style.setProperty('--border-color', '#8d8d8d');
      } else if (this.color === 'cool-gray') {
        this.style.setProperty('--border-color', '#878d96');
      } else if (this.color === 'warm-gray') {
        this.style.setProperty('--border-color', '#8f8b8b');
      } else {
        this.style.setProperty('--border-color', '#24a148');
      }
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

/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @ts-ignore
import styles from './toolbar.scss?inline';
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';

/**
 * A custom element representing a group within a toolbar.
 *
 * @element toolbar-group
 * @slot - Default slot for adding child elements to the toolbar group.
 */
class ToolbarGroup extends LitElement {
  @property({ type: String }) className = '';
  static styles = styles;

  /**
   * Renders the toolbar group component.
   * @returns {TemplateResult}
   */
  render() {
    return html` <slot></slot> `;
  }
}
export default ToolbarGroup;

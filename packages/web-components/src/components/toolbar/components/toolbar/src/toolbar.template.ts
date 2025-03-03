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
import { property, query, state } from 'lit/decorators.js';

/**
 * The `Toolbar` class is a custom web component that extends `LitElement`.
 * It provides a toolbar with focus management and keyboard navigation support.
 *
 * @property {boolean} vertical - Determines if the toolbar is vertical or horizontal.
 * @returns {TemplateResult} The rendered template for the toolbar.
 */
class Toolbar extends LitElement {
  @property({ type: Boolean }) vertical = false;
  @property({ type: String }) className = '';
  // @ts-ignore
  @state() private focusIndex = -1;
  // @ts-ignore
  @query('slot') private slotElement!: HTMLSlotElement;

  static styles = styles;

  /**
   * Renders the toolbar component.
   * @returns {TemplateResult}
   */
  render() {
    return html`
      <slot
        class="toolbar ${this.className}"
        role="toolbar"
        ?vertical="${this.vertical}"></slot>
    `;
  }
}

export default Toolbar;

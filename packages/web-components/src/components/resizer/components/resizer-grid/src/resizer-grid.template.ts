/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement, html } from 'lit';
// @ts-ignore
import styles from './resizer-grid.scss?inline';

/**
 * Resizer grid component for managing resizable panels
 */
class ResizerGridTemplate extends LitElement {
  static styles = styles;

  /**
   * Render the component
   * @returns {TemplateResult} The template result
   */
  render() {
    return html`
      <slot name="left"></slot>
      <slot name="top"></slot>
      <slot name="handle-horizontal"></slot>
      <slot name="handle-vertical"></slot>
      <slot name="right"></slot>
      <slot name="bottom"></slot>
    `;
  }
}

export default ResizerGridTemplate;

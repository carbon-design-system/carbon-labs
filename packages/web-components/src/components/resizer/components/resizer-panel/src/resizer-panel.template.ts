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
import styles from './resizer-panel.scss?inline';

/**
 * Resizer panel component for resizable content areas
 */
class ResizerPanelTemplate extends LitElement {
  static styles = styles;

  /**
   * Render the component
   * @returns {TemplateResult} The template result
   */
  render() {
    return html` <slot></slot> `;
  }
}

export default ResizerPanelTemplate;

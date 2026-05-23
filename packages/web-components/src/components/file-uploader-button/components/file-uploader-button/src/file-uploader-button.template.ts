/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
// @ts-ignore
import styles from './file-uploader-button.scss?inline';

/**
 * Simple file uploader button component
 */
class FileUploaderButton extends LitElement {
  static styles = styles;

  /**
   * Allow multiple file selection
   */
  @property({ type: Boolean })
  multiple = false;

  /**
   * Render the component
   * @returns {TemplateResult} The template result
   */
  render() {
    return html`
      <div class="file-wrapper">
        <input
          type="file"
          ?multiple=${this.multiple}
          aria-label="Upload file" />
        <span class="file-button">Upload file</span>
      </div>
    `;
  }
}

export default FileUploaderButton;

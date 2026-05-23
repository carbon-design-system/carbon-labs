/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement, html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
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
   * Comma-separated accepted file types
   */
  @property({ type: String })
  accept = '';

  /**
   * Capture source hint for mobile devices
   */
  @property({ type: String })
  capture = '';

  /**
   * Disabled state
   */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /**
   * Associate the input with a form
   */
  @property({ type: String })
  form = '';

  /**
   * Autofocus the input on page load
   */
  @property({ type: Boolean })
  autofocus = false;

  /**
   * Input name for form submission
   */
  @property({ type: String })
  name = '';

  /**
   * Required state
   */
  @property({ type: Boolean })
  required = false;

  /**
   * Enable directory selection in supporting browsers
   */
  @property({ type: Boolean, attribute: 'webkitdirectory' })
  webkitdirectory = false;

  /**
   * Accessible label override for the input
   */
  @property({ type: String, attribute: 'aria-label' })
  ariaLabel = '';

  /**
   * Button kind/variant
   */
  @property({ type: String, reflect: true })
  kind = 'primary';

  /**
   * Button text label
   */
  @property({ type: String, attribute: 'button-text' })
  buttonText = 'Upload file';

  /**
   * Render the component
   * @returns {TemplateResult} The template result
   */
  render() {
    return html`
      <div class="file-wrapper">
        <input
          type="file"
          accept=${ifDefined(this.accept || undefined)}
          capture=${ifDefined(this.capture || undefined)}
          ?disabled=${this.disabled}
          form=${ifDefined(this.form || undefined)}
          ?autofocus=${this.autofocus}
          name=${ifDefined(this.name || undefined)}
          ?required=${this.required}
          ?multiple=${this.multiple}
          ?webkitdirectory=${this.webkitdirectory}
          aria-label=${this.ariaLabel || this.buttonText} />
        <span class="file-button">${this.buttonText}</span>
      </div>
    `;
  }
}

export default FileUploaderButton;

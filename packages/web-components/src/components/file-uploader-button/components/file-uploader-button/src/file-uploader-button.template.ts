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
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
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
   * Render as a drop container instead of a button
   */
  @property({ type: Boolean, attribute: 'drop-container', reflect: true })
  dropContainer = false;

  /**
   * Internal state tracking drag-over status
   */
  @state()
  private _isDragOver = false;

  /**
   * Handle dragenter event
   * @param {DragEvent} e - The drag event
   */
  private _handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    if (!this.disabled) {
      this._isDragOver = true;
    }
  };

  /**
   * Handle dragover event - required to allow drop
   * @param {DragEvent} e - The drag event
   */
  private _handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  /**
   * Handle dragleave event
   * @param {DragEvent} e - The drag event
   */
  private _handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    // Only remove drag-over state if leaving the wrapper itself
    const target = e.currentTarget as HTMLElement;
    const relatedTarget = e.relatedTarget as Node;
    if (!target.contains(relatedTarget)) {
      this._isDragOver = false;
    }
  };

  /**
   * Handle drop event
   * @param {DragEvent} e - The drag event
   */
  private _handleDrop = (e: DragEvent) => {
    e.preventDefault();
    this._isDragOver = false;

    if (!this.disabled && e.dataTransfer?.files) {
      const input = this.shadowRoot?.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (input) {
        // Create a new DataTransfer to set files on the input
        const dataTransfer = new DataTransfer();
        Array.from(e.dataTransfer.files).forEach((file) => {
          dataTransfer.items.add(file);
        });
        input.files = dataTransfer.files;

        // Dispatch change event
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  };

  /**
   * Handle file input change event
   * @param {Event} e - The change event
   */
  private _handleChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const files = input.files;

    // Dispatch custom change event with file details
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: {
          files: files ? Array.from(files) : [],
        },
        bubbles: true,
        composed: true,
      })
    );
  };

  /**
   * Render the component
   * @returns {TemplateResult} The template result
   */
  render() {
    const containerClass = this.dropContainer
      ? 'file-drop-area'
      : 'file-button';

    const wrapperClasses = {
      'file-wrapper': true,
      'drag-over': this._isDragOver,
    };

    return html`
      <div
        class=${classMap(wrapperClasses)}
        @dragenter=${this._handleDragEnter}
        @dragover=${this._handleDragOver}
        @dragleave=${this._handleDragLeave}
        @drop=${this._handleDrop}>
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
          aria-label=${this.ariaLabel || this.buttonText}
          @change=${this._handleChange} />
        <span class="${containerClass}">${this.buttonText}</span>
      </div>
    `;
  }
}

export default FileUploaderButton;

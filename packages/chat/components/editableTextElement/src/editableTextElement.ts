/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';

// @ts-ignore
import styles from './editableTextElement.scss?inline';
/**
 * Input component using search typeahead api
 */
export default class editableTextElement extends LitElement {
  static styles = styles;

  /**
   * Array of subelements parsed from API reply
   */
  @property({ type: String, attribute: 'content', reflect: true })
  content;

  /**
   * Edited text content of text area
   */
  @state()
  _editedMessage;

  /** updated - internal LIT function to detect updates to the DOM tree, used to auto update the specification attribute
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  updated(changedProperties) {
    super.updated(changedProperties);
  }

  /** detect when component is rendered to process text object
   */
  firstUpdated() {
    if (this.content !== null) {
      this._initiateTextAreaHeight();
    }
  }

  /** record edited changes on message
   * @param {event} event - lit input event
   **/
  _setEditedMessage(event) {
    this._editedMessage = event.target.value;
    const messageEditedEvent = new CustomEvent('message-edited', {
      detail: { value: this._editedMessage },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(messageEditedEvent);
    this.updateTextAreaHeight(event);
  }

  /**
   * Set a new height based on the size of the text area
   */
  _initiateTextAreaHeight() {
    const textArea: any = this.shadowRoot?.querySelector(
      '.c4ai--chat-editable-text-area'
    );

    if (textArea instanceof HTMLElement) {
      textArea.focus();
      setTimeout(() => {
        textArea.style.height = 'auto';
        textArea.style.height = textArea.scrollHeight + 'px';
        this.requestUpdate();
      }, 1);
    }
  }

  /**
   * Set a new height based on the size of the text area
   * @param {Object} event -- event object
   */
  updateTextAreaHeight(event) {
    const textArea = event.target;
    if (textArea instanceof HTMLElement) {
      setTimeout(() => {
        textArea.style.height = 'auto';
        textArea.style.height = textArea.scrollHeight + 'px';
        this.requestUpdate();
      }, 1);
    }
  }
}

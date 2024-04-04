/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement } from 'lit';
import { state } from 'lit/decorators.js';
// @ts-ignore
import styles from './footer.scss?inline';
/**
 * Input component using search typeahead api
 */
export default class footer extends LitElement {
  static styles = styles;

  /**
   * string variable edited by textInput, auto-updates at every keystroke and is sent to the api url on 'enter' or 'send' button click
   */
  @state()
  _messageText = '';

  /**
   * current string returned by the input dom object
   **/
  private _inputText = '';

  /** handle user inputs inside the input field, trigger a search upon an 'enter' key down event
   * @param {event} event - lit event sent by the the text input object within the chat
   **/
  _handleInput(event) {
    const { value } = event.target;
    this._inputText = value;
    if (event.key == 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (value.length > 0) {
        this._sendInputToParent();
      }
    } else {
      this.updateTextAreaHeight(event);
    }
  }

  /**
   * Set the message text value on input
   * @param {Object} event - event object
   */
  _setMessageText(event) {
    this._messageText = event.target.value;
  }

  /**
   * Set a new height based on the size of the text area
   * @param {Object} event -- event object
   */
  updateTextAreaHeight(event) {
    const textArea = event.target;
    if (textArea instanceof HTMLElement) {
      textArea.style.height = 'auto';
      textArea.style.height = textArea.scrollHeight + 'px';
    }
  }

  /**
   * reset height of the text area
   */
  resetTextAreaHeight() {
    const textArea = this.shadowRoot?.querySelector('.c4ai--chat-search-query');
    if (textArea instanceof HTMLElement) {
      textArea.style.height = 'auto';
      textArea.style.height = '40px';
    }
  }

  /**
   * Send input text event to parent Chat Element
   **/
  _sendInputToParent() {
    const value = this._inputText;

    if (value.length > 0) {
      this._messageText = '';

      const inputEvent = new CustomEvent('user-input', {
        detail: { textInputValue: value },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(inputEvent);
      this.requestUpdate();

      this.resetTextAreaHeight();
    }
  }
}

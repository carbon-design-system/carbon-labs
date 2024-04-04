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
import styles from './messages.scss?inline';
/**
 * Input component using search typeahead api
 */
export default class messages extends LitElement {
  static styles = styles;

  /**
   * conversation object to display messages straight from the 'message' attribute, overrides any api_url system
   */
  @property({ type: Object, attribute: 'messages', reflect: true })
  messages;

  /**
   * computed message object
   */
  @state()
  _computedMessages = [];

  /**
   * user-assigned boolean denoting when an api query has begun and returned to 'false' when it is received or an error occured, used to display an empty loading message
   */
  @property({ type: Boolean, attribute: 'loading', reflect: true })
  loading;

  /**
   * boolean denoting when an api query has begun and returned to 'false' when it is received or an error occured, used to display an empty loading message
   */
  @state()
  _queryInProgress = false;

  /**
   * string denoting the user name, used for internal logic in the server to differentiate bot responses and user reseponses. default: 'user' but should be the user's real name based on IBM ID or any other data available
   */
  @property({ type: String, attribute: 'user-name' })
  userName;

  /**
   * string denoting the bot name, default: 'bot' but can be changed to 'Watson' or 'client assistant' or any other name
   */
  @property({ type: String, attribute: 'agent-name' })
  agentName;

  /** detect when component is rendered to process visualization specification object
   */
  firstUpdated() {
    this._computedMessages = this.hasAttribute('messages') ? this.messages : [];
    this._queryInProgress = this.hasAttribute('loading') ? this.loading : false;
  }

  /** updated - internal LIT function to detect updates to the DOM tree, used to auto update the specification attribute
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  async updated(changedProperties) {
    super.updated(changedProperties);
    console.log(changedProperties);
    if (changedProperties.has('_computedMessages')) {
      await this.updateComplete;
      this._updateScroll();
      this.requestUpdate();
    }

    if (changedProperties.has('messages')) {
      this.computeMessages();
      this.requestUpdate();
    }

    if (changedProperties.has('loading')) {
      this._queryInProgress = this.loading;
      this.requestUpdate();
    }
  }

  /**
   * handle updating of inner messages object when parent updates
   */
  computeMessages() {
    this._computedMessages = this.messages;
  }

  /** transfer message events to chat parent
   */
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('message-updated', this._handleUpdate);
    this.addEventListener('regenerate', this._handleRegenerate);
  }

  /** disconnect when not needed
   */
  disconnectedCallback() {
    this.removeEventListener('message-updated', this._handleUpdate);
    this.removeEventListener('regenerate', this._handleRegenerate);
    super.disconnectedCallback();
  }

  /** handle regeneration signal from message subcomponent, resend query and edit the message list
   * @param {event} event - custom regeneration event from message subcomponent
   */
  _handleRegenerate(event) {
    event.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('user-regeneration-request', {
        detail: event.detail,
        bubbles: true,
        composed: true,
      })
    );
  }

  /** handle update signal from message subcomponent, only triggered when only text is supplied in parent conversation object
   * @param {event} event - custom update event from message subcomponent
   */
  _handleUpdate(event) {
    event.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('user-update-request', {
        detail: event.detail,
        bubbles: true,
        composed: true,
      })
    );
  }

  /** auto-scroll chat-messages div when a new message has appeared
   **/
  _updateScroll() {
    const scrollDiv = this.shadowRoot?.querySelector('.c4ai--chat-messages');
    setTimeout(() => {
      scrollDiv?.scrollTo({
        top: scrollDiv?.scrollHeight,
        behavior: 'smooth',
      });
    }, 300);
  }
}

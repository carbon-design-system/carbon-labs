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
  @property({ type: Object, attribute: 'messages' })
  messages;

  /**
   * computed message object
   */
  @state()
  _computedMessages: any[] = [];

  /**
   * user-assigned boolean denoting when an api query has begun and returned to 'false' when it is received or an error occured, used to display an empty loading message
   */
  @property({ type: Boolean, attribute: 'loading', reflect: true })
  loading;

  /**
   * user-assigned boolean denoting when text content is streamed in token by token
   */
  @property({ type: Boolean, attribute: 'stream-responses', reflect: true })
  _streamResponses;

  /**
   * number value in milliseconds to throttle streaming response
   */
  @property({ type: Number, attribute: 'stream-delay' })
  _streamDelay;

  /**
   * docked - boolean denoted if parent chat is docked to tell children to minimize
   */
  @property({ type: Boolean, attribute: 'docking-enabled' })
  _dockingEnabled;

  /**
   * userInterruptedStreaming - boolean denoted the parent chat received an event from it's footer that streaming was canceled
   */
  @property({ type: Boolean, attribute: 'user-interrupted-streaming' })
  userInterruptedStreaming;

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

  /** boolean denoting if feedback popup show appear for feedback buttons
   */
  @property({ type: Boolean, attribute: 'enable-feedback-form' })
  enableFeedbackForm;

  /** boolean denoting if feedback popup show appear for text selections
   */
  @property({ type: Boolean, attribute: 'enable-text-feedback-form' })
  enableTextFeedbackForm;

  /** JSON dictionary of items describing feedback values
   */
  @property({ type: Object, attribute: 'feedbackFormDefinitions' })
  feedbackFormDefinitions;

  /**
   * string denoting parent theme
   */
  @state()
  _parentTheme;

  /**
   * check if scrolled to bottom
   */
  @state()
  _autoScroll = false;

  /**
   * limit autoscroll when new message arrives
   */
  @state()
  _limitScroll = true;

  /**
   * target scrollable to div to avoid fetching DOM
   */
  private scrollDiv;

  /**
   * timeout function to scroll
   */
  private scrollTimeout;

  /**
   * previous scrollheight
   */
  @state()
  _previousScrollHeight;

  /**
   * check if initial render
   */
  @state()
  _firstRender = true;

  /**
   * custom labels injected from parent
   */
  @property({ type: Object, attribute: 'customLabels' })
  customLabels;

  /**
   * detect when component is rendered to process rawtext
   */
  firstUpdated() {
    this.scrollDiv = this.shadowRoot?.querySelector(
      '.clabs--chat-messages-container'
    );
  }

  /**
   * _handlescroll - wheele event to trigger/cancel auto-scroll
   */
  _handleScroll() {
    const atBottom =
      this.scrollDiv.scrollTop + this.scrollDiv.clientHeight >=
      this.scrollDiv.scrollHeight - 50;
    this._limitScroll = false;
    if (atBottom) {
      this._autoScroll = true;
    } else {
      this._autoScroll = false;
    }
  }

  /** shouldUpdate - internal LIT function to predetect updates
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  shouldUpdate(changedProperties) {
    if (changedProperties.has('messages')) {
      const newHeight = this.scrollDiv?.scrollHeight;
      const lastMessage = this.messages[this.messages.length - 1];
      if (lastMessage) {
        if (lastMessage.userSubmitted) {
          this._previousScrollHeight = newHeight - 36;
        } else {
          this._previousScrollHeight = newHeight - 36;
        }
      }
    }
    return true;
  }

  /** updated - internal LIT function to detect updates to the DOM tree, used to auto update the specification attribute
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  async updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has('messages')) {
      /*if (this._computedMessages.length !== this.messages.length) {
        console.log('diff');
      }*/
      this._computedMessages = [...this.messages];
    }

    if (changedProperties.has('_computedMessages')) {
      this._scrollMessage();
    }

    if (changedProperties.has('loading')) {
      this._queryInProgress = this.loading;
      this._autoScroll = true;
      this._updateScroll();
    }
    if (changedProperties.has('_streamResponses')) {
      this._queryInProgress = this.loading;
    }
  }

  /**
   * handleSlotChange - handle edits to slots when an element is placed in it
   * @param {event} event - tag click event sent by tagList element
   */
  _handleSlotchange(event) {
    event.preventDefault();
    const messageSlotUpdateEvent = new CustomEvent('on-messages-slot-update', {
      detail: { action: 'Messages slot had updated' },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(messageSlotUpdateEvent);
    if (this._autoScroll) {
      this._updateScroll();
    }
  }

  /**
   * handleInternalChange - handle event when children update
   */
  _handleInternalChange() {
    if (this._autoScroll) {
      this._updateScroll();
    }
  }

  /**
   * handle updating of inner messages object when parent updates
   */
  computeMessages() {
    this._computedMessages = [...this.messages];
  }

  /**
   * _scrollMessage - move message down post render
   */
  _scrollMessage() {
    //const newHeight = this.scrollDiv?.scrollHeight;
    //this._previousScrollHeight = newHeight;
    this._autoScroll = true;
    this._limitScroll = true;
    this._updateScroll();
  }

  /** auto-scroll chat-messages div when a new message has appeared
   **/
  _updateScroll() {
    if (this.scrollDiv instanceof HTMLElement) {
      if (!this.scrollTimeout) {
        this.scrollTimeout = setTimeout(() => {
          if (this._autoScroll) {
            let scrollTarget = this.scrollDiv?.scrollHeight;
            if (this._limitScroll) {
              scrollTarget = this._previousScrollHeight;
            }
            this.scrollDiv?.scrollTo({
              top: scrollTarget,
              behavior: 'smooth',
            });
          }
          clearTimeout(this.scrollTimeout);
          this.scrollTimeout = null;
        }, 200);
      }
    }
  }
}

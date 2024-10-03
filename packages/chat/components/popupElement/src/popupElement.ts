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
import styles from './popupElement.scss?inline';
/**
 * Input component using search typeahead api
 */
export default class popupElement extends LitElement {
  static styles = styles;
  /**
   * Array of subelements parsed from API reply
   */
  @property({ type: Object, attribute: 'popup-elements', reflect: true })
  popupElements;

  /**
   * horizontal position defined by parent
   */
  @property({ type: Object, attribute: 'inline-position' })
  inlinePosition;

  /**
   * vertical position defined by parent relative to message parent
   */
  @property({ type: Object, attribute: 'block-position' })
  blockPosition;

  /**
   * top level title for section
   */
  @property({ type: Boolean, attribute: 'is-slotted' })
  isSlotted;

  /**
   * top level title for section
   */
  @property({ type: String, attribute: 'popup-title' })
  popupTitle;

  /**
   * array definition of tags to select
   */
  @property({ type: Object, attribute: 'tag-list' })
  tagList;

  /**
   * legal disclaimer text
   */
  @property({ type: String, attribute: 'disclaimer' })
  disclaimer;

  /**
   * question asked of user to give feedback
   */
  @property({ type: String, attribute: 'prompt-title' })
  promptTitle;

  /**
   * placeholder in text area
   */
  @property({ type: String, attribute: 'text-area-placeholder' })
  textAreaPlaceholder;

  /**
   * boolean determining to auto-open or not
   */
  @property({ type: Boolean, attribute: 'is-open' })
  isOpen;

  /**
   * optional orientation value to show caret
   */
  @property({ type: String, attribute: 'orientation', reflect: true })
  orientation = 'top';

  /**
   * target div to attach to
   */
  @property({ type: Object, attribute: 'targetElement' })
  targetElement;

  /**
   * predefined JSON values of all above by dev/user
   */
  @property({ type: Object, attribute: 'feedbackFormValues' })
  feedbackFormValues;

  /**
   * internal saved text values for feedback
   */
  @state()
  _textInput;

  /**
   * internal tag seelction list
   */
  @state()
  _tagSelections;

  /**
   * response type i.e positive nbegative custom etc
   */
  @property({ type: String, attribute: 'type' })
  type;

  /**
   * index of message element in message list
   */
  @property({ type: String, attribute: 'parent-message-id' })
  parentMessageId;

  /**
   * Event listener to check if parent visibility changed
   */
  //private intersectionObserver;

  /**
   * Event listener to check if parent visibility changed
   */
  //private resizeObserver;

  /** detect when component is rendered to process rawtext
   */
  firstUpdated() {
    this.style.setProperty(
      '--chat-popup-element-inline-position',
      this.inlinePosition
    );
    this.style.setProperty(
      '--chat-popup-element-block-position',
      this.blockPosition
    );
    if (this.feedbackFormValues) {
      this._setValues(this.feedbackFormValues);
    }
    if (this.type === 'thumbs-up') {
      this.style.setProperty('--chat-popup-caret-offset', '-2px');
    }
    if (this.type === 'thumbs-down') {
      this.style.setProperty('--chat-popup-caret-offset', '34px');
    }

    if (this.isSlotted) {
      this.style.setProperty('--chat-popup-slotted-mode', 'fixed');
    }

    const container = this.shadowRoot?.querySelector(
      '.clabs--chat-popup-container'
    );
    if (container instanceof HTMLElement) {
      container.focus();
    }

    //this.addEventListener('on-messages-scrolled', this._handleScrollChange)

    /*this.resizeObserver = new ResizeObserver(()=>{
      this.setPosition();
    })
    this.resizeObserver.observe(this.targetElement);*/

    /*this.intersectionObserver = new IntersectionObserver((entries)=>{
      entries.forEach((entry) =>{
        if(!entry.isIntersecting){
          //this.refitPosition();
          console.log("inter")
        }
      })
    })
    this.intersectionObserver.observe(this);*/
  }

  /**
   * setPosition -  place popup according to client positioning of target element
   */
  setPosition() {
    if (this.targetElement instanceof HTMLElement) {
      const targetBounds = this.targetElement.getBoundingClientRect();
      const popupBounds = this.getBoundingClientRect();
      const parentBounds = this.parentElement?.getBoundingClientRect();

      if (targetBounds && popupBounds && parentBounds) {
        let offsetLeft = targetBounds.left - parentBounds.left;
        let offsetTop = targetBounds.bottom - parentBounds.top;

        if (targetBounds.left + popupBounds.width > parentBounds.width) {
          offsetLeft = parentBounds.width - popupBounds.width - 10;
        }

        if (offsetTop + popupBounds.height > parentBounds.height) {
          offsetTop = targetBounds.top - parentBounds.top - popupBounds.height;
        }

        this.inlinePosition = offsetLeft;

        this.blockPosition = offsetTop;
      }
    }
  }

  /**
   * refitPosition - animate/move popup according to client events and target element
   */
  refitPosition() {
    if (this.parentElement instanceof HTMLElement) {
      const popupBounds = this.getBoundingClientRect();
      const parentBounds = this.parentElement?.getBoundingClientRect();

      const offsetLeft = parentBounds.width - popupBounds.width - 10;
      const offsetTop = parentBounds.height - parentBounds.height - 10;
      if (popupBounds.right > parentBounds.right) {
        this.inlinePosition = offsetLeft;
      } else if (popupBounds.left < parentBounds.left) {
        this.inlinePosition = 10;
      }

      if (popupBounds.bottom > parentBounds.bottom) {
        this.blockPosition = offsetTop;
      } else if (popupBounds.top < parentBounds.top) {
        this.blockPosition = 10;
      }
    }
  }

  /** _handleTextInput - handle text change in submission
   * @param {event} event -  textarea change event
   */
  _handleTextInput(event) {
    const { value } = event.target;
    this._textInput = value;
  }

  /**
   * updated - check changed properties
   * @param {object} changedProperties - LIT object denoting changed attributes
   */
  updated(changedProperties) {
    if (changedProperties.has('inlinePosition')) {
      this.style.setProperty(
        '--chat-popup-element-inline-position',
        this.inlinePosition + 'px'
      );
    }
    if (changedProperties.has('blockPosition')) {
      this.style.setProperty(
        '--chat-popup-element-block-position',
        this.blockPosition + 'px'
      );
    }
    if (changedProperties.has('isOpen')) {
      this.style.setProperty(
        '--chat-popup-element-visibility',
        this.isOpen ? 'visible' : 'hidden'
      );
    }
    if (changedProperties.has('feedbackFormValues')) {
      this._setValues(this.feedbackFormValues);
    }

    if (changedProperties.has('orientation')) {
      console.log(this.orientation);
    }
    if (this.type === 'thumbs-up') {
      this.style.setProperty('--chat-popup-caret-offset', '-2px');
    }
    if (this.type === 'thumbs-down') {
      this.style.setProperty('--chat-popup-caret-offset', '34px');
    }
    /*if (this.isOpen) {
      const container = this.shadowRoot?.querySelector(
        '.clabs--chat-popup-container'
      );
      if (container instanceof HTMLElement) {
        container.focus();
      }
    }*/
  }

  /**
   * _setValues -  if preset Object is added, update all display values
   * @param {object} values - defined values
   */
  _setValues(values) {
    this.popupTitle = values.title;
    this.textAreaPlaceholder = values.responsePlaceholder;
    this.promptTitle = values.prompt;
    this.tagList = values.tags;
    this.disclaimer = values.disclaimer;
    this.requestUpdate();
  }

  /**
   * _handleSubmit - submit event when submit button click
   * @param {event} event - button click event
   */
  _handleSubmit(event) {
    const feedbackDetails = {
      type: this.type ? this.type : 'unknown',
      formValues: this.feedbackFormValues,
      userComment: this._textInput ? this._textInput : 'no feedback given',
      parentMessageId: this.parentMessageId ? this.parentMessageId : 'unknown',
      tagSelections: this._tagSelections,
    };
    const complexFeedbackSubmission = new CustomEvent(
      'on-user-complex-feedback-request',
      {
        detail: feedbackDetails,
        bubbles: true,
        composed: true,
      }
    );
    this.dispatchEvent(complexFeedbackSubmission);
    this._handleClose(event);
  }

  /**
   * handleTagSelection - handle when tag list subelement sends seelction signal
   * @param {event} event -  tag click event
   */
  handleTagSelection(event) {
    const selections = event.detail.selectionList;
    this._tagSelections = selections;
  }

  /**
   * closing event when close button is selected
   * @param {event} event - clsing button event
   */
  _handleClose(event) {
    event.preventDefault();
    this.style.setProperty('--chat-popup-element-visibility', 'hidden');
    const closePopupEvent = new CustomEvent('on-feedback-popup-closed', {
      detail: { action: 'Closed Feedback Popup' },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(closePopupEvent);
    this.requestUpdate();
  }
}

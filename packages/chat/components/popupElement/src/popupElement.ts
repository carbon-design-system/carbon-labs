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
   * target div to attach to
   */
  @state()
  targetObject;

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

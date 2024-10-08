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
import styles from './feedbackElement.scss?inline';
/**
 * Input component using search typeahead api
 */
export default class feedbackElement extends LitElement {
  static styles = styles;
  /**
   * Array of subelements parsed from API reply
   */
  @property({ type: Object, attribute: 'popup-elements', reflect: true })
  popupElements;

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
   * top description
   */
  @property({ type: String, attribute: 'description' })
  description;

  /** title of list, requires show-list
   */
  @property({ type: String, attribute: 'list-title' })
  listTitle;

  /** whether to show list
   */
  @property({ type: Boolean, attribute: 'show-list' })
  showList;

  /** whether to show text area
   */
  @property({ type: Boolean, attribute: 'show-text-area' })
  showTextArea = true;

  /**
   * array of list items with title and text content
   */
  @property({ type: Object, attribute: 'listItems' })
  listItems;

  /**
   * model object with title and url
   */
  @property({ type: Object, attribute: 'model' })
  model;

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
   * index of message element in message list
   */
  @property({ type: String, attribute: 'parent-message-id' })
  parentMessageId;

  /**
   * Event listener to check if parent visibility changed
   */
  //private intersectionObserver;

  @state()
  usePopup = true;

  @state()
  isSelected = false;

  /** detect when component is rendered to process rawtext
   */
  firstUpdated() {
    if (this.feedbackFormValues) {
      this._setValues(this.feedbackFormValues);
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
    this.disclaimer = values.disclaimer;
    this.requestUpdate();
  }

  /**
   * _handleSubmit - submit event when submit button click
   * @param {event} event - button click event
   */
  _handleSubmit(event) {
    const feedbackDetails = {
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
    //this.isSelected = false;
  }
}

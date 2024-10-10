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
  popupTitle = 'placeholder title';

  /**
   * array definition of tags to select
   */
  @property({ type: Object, attribute: 'tag-list' })
  tagList;

  /**
   * legal disclaimer text
   */
  @property({ type: String, attribute: 'disclaimer' })
  disclaimer = 'placeholder disclaimer';

  /**
   * question asked of user to give feedback
   */
  @property({ type: String, attribute: 'prompt-title' })
  promptTitle = 'placeholder prompt';

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
   * radio button array
   */
  @property({ type: Object, attribute: 'radioButtons' })
  radioButtons;

  /**
   * radio title
   */
  @property({ type: String, attribute: 'radio-title' })
  radioTitle;

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
  @property({ type: Boolean, attribute: 'disable-text-area' })
  disableTextArea;

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
  _textInput = '';

  /**
   * internal tag seelction list
   */
  @state()
  _tagSelections = {};

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
   * compact mode
   */
  @property({ type: Boolean, attribute: 'compact-mode' })
  compactMode;

  /**
   * check if submission is valid
   */
  @state()
  invalidEntry = true;

  /**
   * custom label presets
   */
  @property({ type: Object, attribute: 'customLabels' })
  customLabels;

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
      const offset = this.compactMode ? -8 : -2;

      this.style.setProperty('--chat-popup-caret-offset', offset + 'px');
    }
    if (this.type === 'thumbs-down') {
      const offset = this.compactMode ? 46 : 34;
      this.style.setProperty('--chat-popup-caret-offset', offset + 'px');
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
    this._setPosition();

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
    const selectionLength = Object.keys(this._tagSelections).length;
    if (this._textInput || selectionLength > 0) {
      this.invalidEntry = false;
    } else {
      this.invalidEntry = true;
    }
  }

  /**
   * updated - check changed properties
   * @param {object} changedProperties - LIT object denoting changed attributes
   */
  async updated(changedProperties) {
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
      await this.updateComplete;
      this._setPosition();
    }

    if (this.type === 'thumbs-up') {
      const offset = this.compactMode ? 12 : -2;

      this.style.setProperty('--chat-popup-caret-offset', offset + 'px');
    }
    if (this.type === 'thumbs-down') {
      const offset = this.compactMode ? 48 : 34;
      this.style.setProperty('--chat-popup-caret-offset', offset + 'px');
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
    this.description = values.description;
    this.listTitle = values.listTitle;
    this.listItems = values.listItems;
    this.disableTextArea = values.disableTextArea;
    this.radioButtons = values.radioButtons;
    this.radioTitle = values.radioTitle;
    this.model = values.model;
    this.requestUpdate();
  }
  /**
   * _setPosition - place div next to target
   */
  _setPosition() {
    this.style.setProperty('--chat-popup-element-visibility', 'hidden');
    setTimeout(() => {
      this.style.setProperty('--chat-popup-element-visibility', 'visible');
      const offsetTop = this.feedbackFormValues?.parentValues?.offsetTop;
      const feedbackHeight = this.scrollHeight;

      let horizontalPosition = 54;
      let verticalPosition = 60;
      let orientation = 'top';

      if (offsetTop < feedbackHeight) {
        verticalPosition = -feedbackHeight;
        orientation = 'bottom';
      }

      if (this.compactMode) {
        horizontalPosition = 0;
      }

      this.inlinePosition = horizontalPosition;
      this.blockPosition = verticalPosition;
      this.orientation = orientation;
    }, 100);
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

    const selectionLength = Object.keys(this._tagSelections).length;
    if (this._textInput || selectionLength > 0) {
      this.invalidEntry = false;
    } else {
      this.invalidEntry = true;
    }
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
    if (
      this.targetElement instanceof HTMLElement ||
      this.targetElement instanceof SVGElement
    ) {
      this.targetElement.focus();
    }
    this.dispatchEvent(closePopupEvent);
    this.requestUpdate();
  }

  /**
   * _renderLabel - render default or custom label
   * @param {string} key - dictionary key for label
   */
  _renderLabel = (key) => {
    let customValue;
    const labels = this.customLabels || {};
    if (labels) {
      switch (key) {
        case 'feedback-submit-button':
          customValue = labels[key] || 'Submit';
          break;
        case 'feedback-submit-button-unavailable':
          customValue = labels[key] || 'Submit';
          break;
        case 'feedback-close':
          customValue = labels[key] || 'Close';
          break;
      }
    }
    return customValue || key;
  };
}

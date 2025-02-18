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
import styles from './tagListElement.scss?inline';
/**
 * Input component using search typeahead api
 */
export default class tagListElement extends LitElement {
  static styles = styles;
  /**
   * Array of subelements parsed from API reply
   */
  @state()
  _tagList: any[] = [];

  /**
   * Error state value
   */
  @state()
  _invalid = false;

  /**
   * Error state value
   */
  @state()
  _errorMessage = '';

  /**
   * Array of subelements parsed from API reply
   */
  @property({ type: String, attribute: 'content', reflect: true })
  content;

  /**
   * ActionIcon - dictate which icon to use for action
   */
  @property({ type: String, attribute: 'action-icon' })
  actionIcon;

  /**
   * Type - dictate what action to attach
   */
  @property({ type: String, attribute: 'action-type' })
  actionType;

  /**
   * isAction - use quick action buttons
   */
  @property({ type: String, attribute: 'is-action' })
  isAction = true;

  /**
   * MonoLabel - singulat label for all buttons
   */
  @property({ type: String, attribute: 'mono-label' })
  monoLabel;

  /**
   * isInLine - place buttons using flex
   */
  @property({ type: Boolean, attribute: 'is-inline' })
  isInLine = true;

  /**
   * multi - allow multi-selections
   */
  @property({ type: Boolean, attribute: 'multi-select' })
  multiSelect;

  /**
   * full-width - fill whole width of parent
   */
  @property({ type: Boolean, attribute: 'tag-mode' })
  tagMode = false;

  /**
   * selectionIndex - array of active tags when selected
   */
  @state()
  selectionIndex = {};

  /**
   * selectedValues - array of selected values in list
   */
  @state()
  selectedValues = {};

  /** detect when component is rendered to process visualization specification object
   */
  firstUpdated() {
    if (this.content !== undefined) {
      this._prepareTagList();
      this.requestUpdate();
    } else {
      this._invalid = true;
      this._errorMessage = 'TagList: Content is empty string.';
      this.requestUpdate();
    }
  }

  /** updated - internal LIT function to detect updates to the DOM tree, used to auto update the specification attribute
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('content')) {
      this._prepareTagList();
    }
  }

  /**
   * _handleTagClick - send event to parent when tag is selected
   * @param {object} event - tag click event
   */
  _handleTagClick(event) {
    event.preventDefault();
    const source = event.target.getAttribute('data-content');
    const index = event.target.getAttribute('data-index');

    if (!this.selectionIndex[index]) {
      this.selectionIndex[index] = true;
      this.selectedValues[index] = source;
    } else {
      delete this.selectionIndex[index];
      delete this.selectedValues[index];
    }
    const tagSelectedEvent = new CustomEvent('on-tag-selected', {
      detail: {
        tagContent: source,
        tagLabel: source,
        tagIndexInList: index,
        selectionList: this.selectedValues,
        actionType: this.actionType,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(tagSelectedEvent);
    this.requestUpdate();
  }

  /**
   * _prepareTagList - check if content string is a proper array of values
   */
  _prepareTagList() {
    try {
      const tagList = JSON.parse(this.content);
      if (!Array.isArray(tagList)) {
        this._invalid = true;
        this._errorMessage = 'TagList: Parsed content is not an array.';
      }
      const stringCheck = tagList.every((item) => typeof item === 'string');
      if (!stringCheck) {
        this._invalid = true;
        this._errorMessage =
          'TagList: Content array contains a non-string element.';
      }

      this._tagList = tagList;
    } catch (error) {
      //attempt to fix array:
      const items = this.content.replace(/"/g, '').replace('[', '').split(',');
      this._tagList = items;
    }
  }
}

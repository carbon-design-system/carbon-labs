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

  /** updated - internal LIT function to detect updates to the DOM tree, used to auto update the specification attribute
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  updated(changedProperties) {
    super.updated(changedProperties);
  }

  /** detect when component is rendered to process visualization specification object
   */
  firstUpdated() {
    console.log(this.content);
    if (this.content !== undefined) {
      this._prepareTagList();
      this.requestUpdate();
    } else {
      this._invalid = true;
      this._errorMessage = 'TagList: Content is empty string.';
      this.requestUpdate();
    }
  }

  /**
   * _handleTagClick - send event to parent when tag is selected
   * @param {object} event - tag click event
   */
  _handleTagClick(event) {
    event.preventDefault();
    const value = event.explicitOriginalTarget.innerText;
    const tagSelectedEvent = new CustomEvent('on-tag-selected', {
      detail: { tagContent: value },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(tagSelectedEvent);
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
      console.log(
        'TagList: failed to parse content string into an array of tags',
        error
      );
    }
  }
}

/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
var __decorate = this && this.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
// @ts-ignore
// @ts-ignore
import styles from "./tagListElement.css.js";
/**
 * Input component using search typeahead api
 */ /**
     * Input component using search typeahead api
     */
class tagListElement extends LitElement {
  constructor() {
    super(...arguments);
    /**
     * Array of subelements parsed from API reply
     */
    this._tagList = [];
    /**
     * Error state value
     */
    this._invalid = false;
    /**
     * Error state value
     */
    this._errorMessage = '';
    /**
     * isAction - use quick action buttons
     */
    this.isAction = true;
    /**
     * isInLine - place buttons using flex
     */
    this.isInLine = true;
    /**
     * selectionIndex - array of active tags when selected
     */
    this.selectionIndex = {};
    /**
     * selectedValues - array of selected values in list
     */
    this.selectedValues = {};
  }
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
        selectionList: this.selectedValues
      },
      bubbles: true,
      composed: true
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
      const stringCheck = tagList.every(item => typeof item === 'string');
      if (!stringCheck) {
        this._invalid = true;
        this._errorMessage = 'TagList: Content array contains a non-string element.';
      }
      this._tagList = tagList;
    } catch (error) {
      //attempt to fix array:
      const items = this.content.replace(/"/g, '').replace('[', '').split(',');
      this._tagList = items;
    }
  }
}
tagListElement.styles = styles;
export default tagListElement;
__decorate([state()], tagListElement.prototype, "_tagList", void 0);
__decorate([state()], tagListElement.prototype, "_invalid", void 0);
__decorate([state()], tagListElement.prototype, "_errorMessage", void 0);
__decorate([property({
  type: String,
  attribute: 'content',
  reflect: true
})], tagListElement.prototype, "content", void 0);
__decorate([property({
  type: String,
  attribute: 'action-icon'
})], tagListElement.prototype, "actionIcon", void 0);
__decorate([property({
  type: String,
  attribute: 'is-action'
})], tagListElement.prototype, "isAction", void 0);
__decorate([property({
  type: String,
  attribute: 'mono-label'
})], tagListElement.prototype, "monoLabel", void 0);
__decorate([property({
  type: String,
  attribute: 'is-inline'
})], tagListElement.prototype, "isInLine", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'multi-select'
})], tagListElement.prototype, "multiSelect", void 0);
__decorate([state()], tagListElement.prototype, "selectionIndex", void 0);
__decorate([state()], tagListElement.prototype, "selectedValues", void 0);
//# sourceMappingURL=tagListElement.js.map

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
import styles from "./linkListElement.css.js";
/**
 * Input component using search typeahead api
 */ /**
     * Input component using search typeahead api
     */
class linkListElement extends LitElement {
  constructor() {
    super(...arguments);
    /**
     * internal expanded value to show all links
     */
    this.expanded = false;
    /**
     * max items before cutoff
     */
    this.maxItems = 3;
    /**
     * hide arrows buttons (temp)
     */
    this.hideArrows = true;
    /** enableReditection -  whether open black new page
     */
    this.disableRedirection = false;
    /**
     * full list of link strings
     */
    this._linkList = [];
    /**
     * compact list of strings taken from full list
     */
    this.trimmedList = [];
    /**
     * _renderLabel - render default or custom label
     * @param {string} key - target
     */
    this._renderLabel = key => {
      let customValue;
      const labels = this.customLabels || {};
      if (labels) {
        switch (key) {
          case 'link-list-view-all-button':
            customValue = labels[key] || 'View all';
            break;
          case 'link-list-collapse-button':
            customValue = labels[key] || 'Collapse list';
            break;
          case 'link-list-reference-title':
            customValue = labels[key] || 'References';
            break;
        }
      }
      return customValue || key;
    };
  }
  /** detect when component is rendered to process visualization specification object
   */
  firstUpdated() {
    if (this.content !== undefined) {
      this._formatList();
      this.requestUpdate();
    }
  }
  /** updated - internal LIT function to detect updates to the DOM tree, used to auto update the specification attribute
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('content')) {
      //this._linkList = this.content.split(',');
      this._formatList();
    }
  }
  /** expandList - when list view all item is clicked, open up full list
   */
  expandList() {
    this.expanded = true;
  }
  /** collapseList - when list collapse item is clicked, return to trimmed list
   */
  collapseList() {
    this.expanded = false;
  }
  /** _getVideoTitle - helper function to display a URL's name without
   * @param {string} url - url text that needs to be trimmed for title display in the card object
   */
  _getSiteTitle(url) {
    try {
      const siteName = url.split('/').slice(-1);
      const siteTitle = siteName[0].split('.')[0];
      return siteTitle.replace(/_/g, ' ');
    } catch (error) {
      return url;
    }
  }
  /**
   * _handleLinkFeedback - when link element is click, send even to message element
   * @param {event} event - link click event
   */
  _handleLinkFeedback(event) {
    const targetElement = event === null || event === void 0 ? void 0 : event.target;
    if (targetElement instanceof HTMLElement) {
      if (targetElement.hasAttribute('data-index')) {
        const targetIndex = targetElement.getAttribute('data-index');
        if (targetIndex !== null && targetIndex >= 0 && targetIndex < this._linkList.length) {
          const targetLink = this._linkList[targetIndex];
          const linkClickedEvent = new CustomEvent('on-link-list-item-selected', {
            detail: {
              action: 'LinkList.ts: link list item was clicked',
              selectedURL: targetLink.url,
              selectedTitle: targetLink.title,
              originalEvent: event
            },
            bubbles: true,
            composed: true
          });
          this.dispatchEvent(linkClickedEvent);
        }
      }
    }
  }
  /** format list text into html list object
   * @param {string} inputText - text to be rendered in subelement
   */
  _formatList() {
    if (this.content.indexOf('[') > -1) {
      const linkArray = this.content.split(',');
      const markdownLinkRegex = new RegExp('\\[(.*?)\\]\\((.*?)\\)');
      this._linkList = linkArray.map(link => {
        const match = link.match(markdownLinkRegex);
        if (match) {
          return {
            title: match[1],
            url: match[2]
          };
        }
        return null;
      });
      this.trimmedList = this._linkList.slice(0, 4);
    } else {
      const splitList = this.content.split(',');
      this._linkList = splitList.map(link => ({
        title: this._getSiteTitle(link),
        url: link
      }));
      this.trimmedList = this._linkList.slice(0, 4);
    }
  }
}
linkListElement.styles = styles;
export default linkListElement;
__decorate([property({
  type: String,
  attribute: 'content'
})], linkListElement.prototype, "content", void 0);
__decorate([state()], linkListElement.prototype, "expanded", void 0);
__decorate([state()], linkListElement.prototype, "maxItems", void 0);
__decorate([state()], linkListElement.prototype, "hideArrows", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'disable-redirection'
})], linkListElement.prototype, "disableRedirection", void 0);
__decorate([state()], linkListElement.prototype, "_linkList", void 0);
__decorate([state()], linkListElement.prototype, "trimmedList", void 0);
__decorate([property({
  type: Object,
  attribute: 'customLabels'
})], linkListElement.prototype, "customLabels", void 0);
//# sourceMappingURL=linkListElement.js.map

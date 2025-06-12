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
import styles from './linkListElement.scss?inline';
/**
 * Input component using search typeahead api
 */
export default class linkListElement extends LitElement {
  static styles = styles;

  /**
   * Array of subelements parsed from API reply
   */
  @property({ type: String, attribute: 'content' })
  content;

  /**
   * Array of subelements parsed from API reply
   */
  @property({ type: Object, attribute: 'linkItems' })
  linkItems;

  /**
   * internal expanded value to show all links
   */
  @state()
  expanded = false;

  /**
   * max items before cutoff
   */
  @state()
  maxItems = 3;

  /**
   * hide arrows buttons (temp)
   */
  @state()
  hideArrows = true;

  /** enableReditection -  whether open black new page
   */
  @property({ type: Boolean, attribute: 'disable-redirection' })
  disableRedirection = false;

  /**
   * full list of link strings
   */
  @state()
  _linkList: { url: string; title: string }[] = [];

  /**
   * compact list of strings taken from full list
   */
  @state()
  trimmedList: { url: string; title: string }[] = [];

  /**
   * custom label presets
   */
  @property({ type: Object, attribute: 'customLabels' })
  customLabels;

  /** detect when component is rendered to process visualization specification object
   */
  firstUpdated() {
    if (this.linkItems !== undefined) {
      this._formatList('object');
    } else if (this.content !== undefined) {
      this._formatList('string');
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
      this._formatList('string');
    }
    if (changedProperties.has('linkItems')) {
      this._formatList('object');
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
    const targetElement = event?.target;
    if (targetElement instanceof HTMLElement) {
      if (targetElement.hasAttribute('data-index')) {
        const targetIndex: any = targetElement.getAttribute('data-index');
        if (
          targetIndex !== null &&
          targetIndex >= 0 &&
          targetIndex < this._linkList.length
        ) {
          const targetLink = this._linkList[targetIndex];
          const linkClickedEvent = new CustomEvent(
            'on-link-list-item-selected',
            {
              detail: {
                action: 'LinkList.ts: link list item was clicked',
                selectedURL: targetLink.url,
                selectedTitle: targetLink.title,
                originalEvent: event,
              },
              bubbles: true,
              composed: true,
            }
          );
          this.dispatchEvent(linkClickedEvent);
        }
      }
    }
  }

  /** format list text into html list object
   * @param {string} type - text type to be rendered in subelement
   */
  _formatList(type) {
    if (type === 'string') {
      if (this.content.indexOf('[') > -1) {
        const markdownLinkRegex = new RegExp(
          '\\[([^\\]]+)\\]\\(([^\\)]+)\\)',
          'g'
        );
        const linkMatches = this.content.matchAll(markdownLinkRegex);
        console.log(linkMatches);
        this._linkList = [...linkMatches].map((match) => ({
          title: match[1].trim(),
          url: match[2].trim(),
        }));
        this.trimmedList = this._linkList.slice(0, 4);
      } else {
        const splitList = this.content.split(',');
        this._linkList = splitList.map((link) => ({
          title: this._getSiteTitle(link),
          url: link,
        }));
        this.trimmedList = this._linkList.slice(0, 4);
      }
    } else if (type === 'object') {
      console.error('CLABS linkList: input content is not a string');
    }
  }

  /** format list text into html list object
   * @param {string} type - text type to be rendered in subelement
   */
  _formatListOld(type) {
    if (type === 'string') {
      if (this.content.indexOf('[') > -1) {
        const linkArray = this.content.split(',');
        const markdownLinkRegex = new RegExp('\\[(.*?)\\]\\((.*?)\\)');
        this._linkList = linkArray.map((link) => {
          const match = link.match(markdownLinkRegex);
          if (match) {
            return { title: match[1], url: match[2] };
          }
          return null;
        });
        this.trimmedList = this._linkList.slice(0, 4);
      } else {
        const splitList = this.content.split(',');
        this._linkList = splitList.map((link) => ({
          title: this._getSiteTitle(link),
          url: link,
        }));
        this.trimmedList = this._linkList.slice(0, 4);
      }
    } else if (type === 'object') {
      console.error('CLABS linkList: input content is not a string');
    }
  }

  /**
   * _renderLabel - render default or custom label
   * @param {string} key - target
   */
  _renderLabel = (key) => {
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

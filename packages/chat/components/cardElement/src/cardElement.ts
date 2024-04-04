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
import styles from './cardElement.scss?inline';
/**
 * Input component using search typeahead api
 */
export default class cardElement extends LitElement {
  static styles = styles;
  /**
   * Array of subelements parsed from API reply
   */
  @property({ type: Object, attribute: 'card-elements', reflect: true })
  cardElements;

  /**
   * url content from parent
   */
  @property({ type: String, attribute: 'content', reflect: true })
  content;

  /**
   * card type to differentiate between url and videos
   */
  @property({ type: String, attribute: 'type', reflect: true })
  type;

  /**
   * link preview object to be invoked when url object is rendered
   */
  @state()
  _linkPreviewData: any = null;

  /** detect when component is rendered to process rawtext
   */
  firstUpdated() {
    if (this.cardElements == null) {
      this._getSitePreviewData(this.content);
    } else {
      this._linkPreviewData = this.cardElements;
      this.requestUpdate();
    }

    /*if (changedProperties.has('_messageElements')) {
      const messageUpdateEvent = new CustomEvent('message-updated', {
        detail: { index: this.index, messageElements: this._messageElements },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(messageUpdateEvent);
    }*/
  }

  /** _formatURL - helper function to display a URL's name without
   * @param {string} url - url text that needs to be trimmed for display in the card object
   */
  _getShortenedURL(url) {
    try {
      const host = new URL(url).host;
      return host;
    } catch (error) {
      return 'Site url';
    }
  }

  /** _formatURL - helper function to display a URL's name without
   * @param {string} url - url text that needs to be trimmed for display in the card object
   */
  _getSiteName(url) {
    try {
      const domain = new URL(url).hostname.replace(/^www\./, '').split('.')[0];
      const formattedName = domain.charAt(0).toUpperCase() + domain.slice(1);
      return formattedName;
    } catch (error) {
      return 'Site name';
    }
  }

  /** get url preview with title, desciption and og:image to preview site card object
   * @param {string} url -  desired URL for preview
   */
  async _getSitePreviewData(url) {
    try {
      let preview = await this._previewData(url);
      console.log(preview);
      if (!preview) {
        preview = {
          title: this._getSiteName(url),
          shortenedUrl: this._getShortenedURL(url),
        };
      }

      if (!preview.title) {
        preview.title = this._getSiteName(url);
      }
      preview.shortenedUrl = this._getShortenedURL(url);
      this._linkPreviewData = preview;
      this.requestUpdate();
    } catch (error) {
      console.log('card error');
      const backUpName = this._getSiteName(url);
      this._linkPreviewData = {
        title: backUpName,
        'img-url': null,
        description: null,
        link: url,
      };
      console.log(this._linkPreviewData);
      this.requestUpdate();
    }
  }

  /** conditional url fetchn function
   * @param {string} url - url to fetch
   */
  async _previewData(url) {
    const API_URL = 'http://localhost:5001/get_preview';

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url }),
    };

    try {
      return await fetch(API_URL, requestOptions)
        .then((response) => response.json())
        .then((response) => {
          return response;
        });
    } catch (error: any) {
      return {
        reply: 'Error reaching: ' + API_URL + ' Details: ' + error.message,
        failed: true,
      };
    }
  }
}

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
import styles from "./cardElement.css.js";
/**
 * Input component using search typeahead api
 */ /**
     * Input component using search typeahead api
     */
class cardElement extends LitElement {
  constructor() {
    super(...arguments);
    /**
     * file types with icons available
     */
    this.fileTypes = ['csv', 'mp3', 'mp4', 'png', 'pdf', 'ppt', 'svg', 'xls', 'zip', 'wmv', 'txt', 'tsv', 'mov', 'jpg', 'gif'];
    /**
     * link preview object to be invoked when url object is rendered
     */
    this._cardData = null;
    this._isAudioPlaying = false;
  }
  /** detect when component is rendered to process rawtext
   */
  firstUpdated() {
    this._getTheme();
    this._buildCard();
  }
  /**
   * updated - check changed properties
   * @param {object} changedProperties - LIT object denoting changed attributes
   */
  updated(changedProperties) {
    if (changedProperties.has('content')) {
      this._buildCard();
    }
  }
  /**
   * _translateHexToRGB - convert bg color to rgb string to create a rgba fade
   * @param {string} hexString - CSS hex color
   */
  _translateHexToRGB(hexString) {
    const rawHex = hexString.replace(/^#/, '');
    const red = parseInt(rawHex.substring(0, 2), 16);
    const green = parseInt(rawHex.substring(2, 4), 16);
    const blue = parseInt(rawHex.substring(4, 6), 16);
    return [red, green, blue].join(',');
  }
  /**
   * _getTheme - find current theme by checking parent background color
   */
  _getTheme() {
    if (this.parentElement instanceof HTMLElement) {
      const parentStyle = getComputedStyle(this.parentElement);
      const backgroundColor = parentStyle.getPropertyValue('--cds-background');
      /*const darkMode =
        backgroundColor.startsWith('#') &&
        parseInt(backgroundColor.replace('#', ''), 16) < 0xffffff / 2;*/
      const rgbColor = this._translateHexToRGB(backgroundColor);
      this.style.setProperty('--chat-card-theme-bottom', ' rgba(' + rgbColor + ', 0)');
      this.style.setProperty('--chat-card-theme-top', ' rgba(' + rgbColor + ', 1)');
    }
  }
  /**
   * _buildCard - generates data to display in card if not specified
   */
  _buildCard() {
    if (this.cardElements == null) {
      if (this.type === 'file') {
        this._getFileData(this.content);
      } else if (this.type === 'audio') {
        this._getAudioData(this.content);
      } else {
        if (!this.loading) {
          this._getSitePreviewData(this.content);
        }
      }
    } else {
      this._cardData = this.cardElements;
      if (this.fileType == null && this.type !== 'url') {
        this.fileType = this._getFileType(this.cardElements.link);
      }
      this.requestUpdate();
    }
  }
  //URL FUNCTIONS
  /** _formatURL - helper function to display a URL's name without
   * @param {string} url - url text that needs to be trimmed for display in the card object
   */
  _getShortenedURL(url) {
    try {
      const host = new URL(url).host;
      return host;
    } catch (error) {
      return '';
    }
  }
  /** _formatURL - helper function to display a URL's name without
   * @param {string} url - url text that needs to be trimmed for display in the card object
   */
  _getSiteName(url) {
    try {
      const urlObject = new URL(url);
      const domain = urlObject.hostname.replace(/^www\./, '').split('.').slice(-2, -1)[0];
      const formattedName = domain.charAt(0).toUpperCase() + domain.slice(1);
      const path = urlObject.pathname;
      const pieces = path.split('/');
      const longestTitle = pieces.sort((a, b) => b.length - a.length).pop();
      const candidateTitle = longestTitle ? longestTitle.replace(new RegExp('[-_]+', 'g'), ' ') : '';
      if (candidateTitle !== '') {
        return formattedName + ': ' + candidateTitle.charAt(0).toUpperCase() + candidateTitle.slice(1);
      } else {
        return formattedName;
      }
    } catch (error) {
      return '';
    }
  }
  //VIDEO FUNCTIONS
  /** _getVideoFileName - helper function to display a URL's name without
   * @param {string} url - url text that needs to be trimmed for description display in the card object
   */
  _getVideoFileName(url) {
    try {
      const videoFileName = url.split('/').slice(-1);
      return videoFileName[0];
    } catch (error) {
      return '';
    }
  }
  /** _getVideoTitle - helper function to display a URL's name without
   * @param {string} url - url text that needs to be trimmed for title display in the card object
   */
  _getVideoTitle(url) {
    try {
      const videoFileName = url.split('/').slice(-1);
      const videoTitle = videoFileName[0].split('.')[0];
      return videoTitle.replace(/_/g, ' ');
    } catch (error) {
      return '';
    }
  }
  //FILE FUNCTIONS
  /** _getFileType - if no type type given find it
   * @param {string} fileName -file name to be analyzed
   */
  _getFileType(fileName) {
    const pieces = fileName.split('.');
    let foundType = pieces[pieces.length - 1];
    if (this.fileTypes.indexOf(foundType) < 0) {
      foundType = 'unknown';
    }
    return foundType;
  }
  /** extract inforamtion for url to auto-generate title, url preview and link
   * @param {string} url -  desired URL for preview
   */
  _getFileData(url) {
    const preview = {};
    preview.title = url.split('/').slice(-1);
    preview.shortenedUrl = this._getShortenedURL(url);
    preview.link = url;
    this.fileType = this._getFileType(url);
    preview.description = this.fileType + ' file from: ' + url;
    this._cardData = preview;
    this.requestUpdate();
  }
  /** extract inforamtion for audio file to auto-generate title, url preview and link
   * @param {string} url -  desired URL for preview
   */
  _getAudioData(url) {
    const preview = {};
    preview.title = this._getVideoTitle(url);
    preview.shortenedUrl = this._getShortenedURL(url);
    preview.link = url;
    this.fileType = this._getFileType(url);
    preview.description = this.fileType !== 'unknown' ? this.fileType.toUpperCase() : '' + ' file from: ' + url;
    this._cardData = preview;
    this._updateAudioDuration();
    this._updateAudioProgress();
    this.requestUpdate();
  }
  //AUDIO FUNCTIONS
  /**
   * _toggleAudio - triggered when play/pause in audio controls is selected
   */
  _toggleAudio() {
    var _a;
    const audioElement = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('audio');
    if (audioElement instanceof HTMLElement) {
      if (audioElement.paused) {
        audioElement.play();
        this._isAudioPlaying = true;
      } else {
        audioElement.pause();
        this._isAudioPlaying = false;
      }
    }
  }
  /**
   * _updateAudioDuration - sets _audioDuration value when audio element is loaded
   */
  _updateAudioDuration() {
    var _a;
    const audioElement = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('audio');
    if (audioElement instanceof HTMLElement) {
      this._audioDuration = audioElement.duration;
    }
    this._updateAudioProgress();
  }
  /**
   * _updateAudioProgress - sets progress in time throught the audio file
   */
  _updateAudioProgress() {
    var _a;
    const audioElement = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('audio');
    if (audioElement instanceof HTMLElement) {
      this._audioProgress = audioElement.currentTime;
    }
  }
  /**
   * converts time values from HTML element into displayable strings such as 01:34
   * @param {number} time - time value in seconds
   **/
  _formatAudioTime(time) {
    if (!time) {
      return '00:00';
    }
    const minutes = Math.floor(time / 60);
    let minutesString = minutes.toString();
    if (minutes < 10) {
      minutesString = '0' + minutesString;
    }
    const seconds = Math.floor(time % 60);
    let secondsString = seconds.toString();
    if (seconds < 10) {
      secondsString = '0' + secondsString;
    }
    return minutesString + ':' + secondsString;
  }
  /** get url preview with title, desciption and og:image to preview site card object
   * @param {string} url -  desired URL for preview
   */
  async _getSitePreviewData(url) {
    try {
      let preview = {};
      if (this.apiUrl) {
        preview = await this._previewData(url);
      }
      if (!preview || !preview.title && !preview.imageUrl && !preview.description) {
        if (this.type === 'video') {
          preview.title = this._getVideoTitle(url);
          //preview.description = this._getVideoFileName(url);
        } else {
          preview.title = this._getSiteName(url);
          preview.description = url;
        }
      }
      if (!preview.title) {
        preview.title = this._getSiteName(url);
      }
      if (!preview.link) {
        preview.link = url;
      }
      preview.shortenedUrl = this._getShortenedURL(url);
      this._cardData = preview;
      this.requestUpdate();
    } catch (error) {
      const backUpName = this._getSiteName(url);
      this._cardData = {
        title: backUpName,
        imageUrl: null,
        description: url,
        link: url
      };
      this.requestUpdate();
    }
  }
  /** conditional url fetchn function
   * @param {string} url - url to fetch
   */
  async _previewData(url) {
    const API_URL = this.apiUrl;
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: url
      })
    };
    try {
      return await fetch(API_URL, requestOptions).then(response => response.json()).then(response => {
        return response;
      });
    } catch (error) {
      return {
        reply: 'Error reaching: ' + API_URL + ' Details: ' + error.message,
        failed: true
      };
    }
  }
}
cardElement.styles = styles;
export default cardElement;
__decorate([property({
  type: Object,
  attribute: 'card-elements',
  reflect: true
})], cardElement.prototype, "cardElements", void 0);
__decorate([state()], cardElement.prototype, "fileTypes", void 0);
__decorate([property({
  type: String,
  attribute: 'content',
  reflect: true
})], cardElement.prototype, "content", void 0);
__decorate([property({
  type: String,
  attribute: 'api-url',
  reflect: true
})], cardElement.prototype, "apiUrl", void 0);
__decorate([property({
  type: String,
  attribute: 'type',
  reflect: true
})], cardElement.prototype, "type", void 0);
__decorate([property({
  type: String,
  attribute: 'file-type',
  reflect: true
})], cardElement.prototype, "fileType", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'loading',
  reflect: true
})], cardElement.prototype, "loading", void 0);
__decorate([state()], cardElement.prototype, "_cardData", void 0);
__decorate([state()], cardElement.prototype, "_isAudioPlaying", void 0);
__decorate([state()], cardElement.prototype, "_audioProgress", void 0);
__decorate([state()], cardElement.prototype, "_audioDuration", void 0);
__decorate([state()], cardElement.prototype, "_audioRatio", void 0);
//# sourceMappingURL=cardElement.js.map

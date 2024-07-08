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
import styles from './carouselElement.scss?inline';
/**
 * Input component using search typeahead api
 */
export default class carouselElement extends LitElement {
  static styles = styles;

  /**
   * resizeObserver - resize watcher of parent
   **/
  private resizeObserver;

  /**
   * Text array of elements urls
   */
  @property({ type: String, attribute: 'content', reflect: true })
  content;

  /**
   * Text array of elements urls
   */
  @property({ type: Object, attribute: 'elements', reflect: true })
  elements;

  /**
   * Predefined width for carousel container
   */
  @property({ type: String, attribute: 'content-width', reflect: true })
  contentWidth = 248;

  /**
   * Predefined height for carousel container
   */
  @property({ type: String, attribute: 'content-height', reflect: true })
  contentHeight = 248;

  /**
   * Parsed array of urls
   */
  @state()
  _carouselContent;

  /**
   * Items per slide calculated given parent width
   */
  @state()
  _itemsPerSlide = 1;

  /**
   * Parsed array of urls
   */
  @state()
  _slideCounter = 0;

  /**
   * gap size in px between slides
   */
  @state()
  _slideGapSize = 16;

  /**
   * maximum slide counter calculated based on items per slide and item count
   */
  @state()
  _maxSlideCounter = 0;

  /**
   * Cut and parsed number to display in html
   */
  @state()
  _renderedSlideCounter = 0;

  /** detect when component is rendered to process carousel object
   */
  firstUpdated() {
    if (this.hasAttribute('elements')) {
      this._checkElements();
      this._updateCarousel();
    } else if (this.hasAttribute('content')) {
      this._buildCarousel();
      //this._updateCarousel();
    }

    if (this.hasAttribute('_carouselContent')) {
      this._updateCarousel();
    }

    this.resizeObserver = new ResizeObserver(async () => {
      this._updateCarousel();
      this.requestUpdate();
    });

    const slidesContainer = this.shadowRoot?.querySelector(
      '.clabs--chat-carousel-container'
    );
    this.resizeObserver.observe(slidesContainer);
  }

  /** updated - internal LIT function to detect updates to the DOM tree, used to auto update the specification attribute
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('content')) {
      this._buildCarousel();
      //this.requestUpdate();
    }
    if (changedProperties.has('elements')) {
      this._checkElements();
      //this.requestUpdate();
    }
    if (changedProperties.has('contentWidth')) {
      this._buildCarousel();
    }
    if (changedProperties.has('_carouselContent')) {
      this._updateCarousel();
    }
  }

  /**
   * _updateCarousel - regenerate carousel cell sizes based on parent height/width
   */
  _updateCarousel() {
    if (this._carouselContent) {
      if (this.parentElement instanceof HTMLElement) {
        const parentWidth = this.clientWidth;
        this._itemsPerSlide = Math.max(
          Math.floor(parentWidth / (this.contentWidth + this._slideGapSize)),
          1
        );
        this.style.setProperty(
          '--chat-carousel-slides-width',
          this._itemsPerSlide * (this.contentWidth + this._slideGapSize) + 'px'
        );
      } else {
        this.style.setProperty(
          '--chat-carousel-slides-width',
          this.contentWidth + 'px'
        );
      }

      this._maxSlideCounter = Math.ceil(
        this._carouselContent.length / this._itemsPerSlide
      );

      let currentSlide =
        Math.floor(this._slideCounter / this._itemsPerSlide) *
        this._itemsPerSlide;
      currentSlide = Math.min(
        currentSlide,
        this._carouselContent.length - this._itemsPerSlide
      );

      this._renderedSlideCounter =
        Math.ceil(currentSlide / this._itemsPerSlide) + 1;
    }
  }

  /**
   * _checkElements - analyze each type of object in array to properly render the right Card subelement
   */
  _checkElements() {
    this._carouselContent = this.elements.map((item) => ({
      content: item.content,
      type: item.type ? item.type : this._checkURLType(item.content),
    }));
  }

  /** _checkURLType - check what category of URL is provided
   * @param {string} urlObject - url text block to be checked
   */
  _checkURLType(urlObject) {
    const imageRegex = new RegExp(
      '\\.(png|jpg|jpeg|gif|svg|bmp|webp|ico|tiff|tif)$',
      'i'
    );
    const videoRegex = new RegExp(
      '\\.(mp4|avi|flv|mkv|mov|webm|m4v|ogv)$',
      'i'
    );
    const fileRegex = new RegExp(
      '\\.(pdf|doc|docx|csv|xls|xlsx|ppt|pptx|txt|rtf|xml|odt|zip|rar|tar|gz)$',
      'i'
    );
    const audioRegex = new RegExp('\\.(mp3|flac|wav|mpa|wma|midi|ogg)$', 'i');

    if (imageRegex.test(urlObject)) {
      return 'img';
    }
    if (videoRegex.test(urlObject)) {
      return 'video';
    }
    if (audioRegex.test(urlObject)) {
      return 'audio';
    }
    if (fileRegex.test(urlObject)) {
      return 'file';
    }
    return 'url';
  }

  /**
   * _buildCarousel - map and identify URL types from content array or attempt to generates one from
   */
  _buildCarousel() {
    try {
      const contentArray = JSON.parse(this.content);
      this._carouselContent = contentArray.map((url) => ({
        content: url,
        type: this._checkURLType(url),
      }));
    } catch (error) {
      if (this.content.endsWith(',')) {
        const fixedArray = this.content.slice(0, -1) + ']';
        try {
          const incompleteArray = JSON.parse(fixedArray);
          if (!this._carouselContent) {
            this._carouselContent = [];
          }
          if (incompleteArray.length > this._carouselContent.length) {
            const url = incompleteArray[incompleteArray.length - 1];
            this._carouselContent = [
              ...this._carouselContent,
              { content: url, type: this._checkURLType(url) },
            ];
          }
        } catch (error) {
          console.log(
            'Carousel: failed to parse:' + (this.content.slice(0, -1) + ']')
          );
        }
      }
    }
  }

  /**
   * trigger next slide shift
   */
  _handleNextSlide() {
    if (
      this._slideCounter + this._itemsPerSlide <
      this._carouselContent.length
    ) {
      this._slideCounter += this._itemsPerSlide;
    }

    this._maxSlideCounter = Math.ceil(
      this._carouselContent.length / this._itemsPerSlide
    );
    this._renderedSlideCounter =
      Math.floor(this._slideCounter / this._itemsPerSlide) + 1;
    this._scrollSlideContainer();
  }

  /**
   * trigger previous slide shift
   */
  _handlePreviousSlide() {
    if (this._slideCounter - this._itemsPerSlide >= 0) {
      this._slideCounter -= this._itemsPerSlide;
    }
    this._maxSlideCounter = Math.ceil(
      this._carouselContent.length / this._itemsPerSlide
    );
    this._renderedSlideCounter =
      Math.floor(this._slideCounter / this._itemsPerSlide) + 1;
    this._scrollSlideContainer();
  }

  /**
   * _scrollSlideContainer - force sidescroll of container to view next slide
   */
  _scrollSlideContainer() {
    const slidesDiv = this.shadowRoot?.querySelector(
      '.clabs--chat-carousel-slides'
    );
    //const scrollPosition = Math.round((this._slideCounter/this._carouselContent.length) * slidesDiv?.scrollWidth + 8)
    const scrollPosition =
      this._slideCounter *
      (this.contentWidth + this._slideGapSize) *
      this._itemsPerSlide;
    setTimeout(function () {
      slidesDiv?.scrollTo({
        left: scrollPosition,
        behavior: 'smooth',
      });
    }, 100);
  }
}

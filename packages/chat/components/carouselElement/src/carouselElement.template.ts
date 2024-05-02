/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import { settings } from '@carbon-labs/utilities/es/settings/index.js';
const { stablePrefix: clabsPrefix } = settings;

import ChevronRight16 from '@carbon/web-components/es/icons/chevron--right/16.js';
import ChevronLeft16 from '@carbon/web-components/es/icons/chevron--left/16.js';
import '@carbon/web-components/es/components/button/index.js';
import '../../tableElement/tableElement.js';
import '../../cardElement/cardElement.js';
import '../../textElement/textElement.js';
import '../../imageElement/imageElement.js';

/**
 * Lit template for code
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function carouselElementTemplate(customElementClass) {
  const {
    _carouselContent: carouselContent,
    _slideCounter: slideCounter,
    _maxSlideCounter: maxSlideCounter,
    _handlePreviousSlide: handlePreviousSlide,
    _handleNextSlide: handleNextSlide,
    _renderedSlideCounter: renderedSlideCounter,
  } = customElementClass;

  return html`<div class="${clabsPrefix}--chat-carousel-container">
    ${carouselContent
      ? html` <div class="${clabsPrefix}--chat-carousel-length">
            ${carouselContent.length - 1}
            ${carouselContent.length === 1 ? 'item' : 'items'}
          </div>
          <div class="${clabsPrefix}--chat-carousel-slides">
            ${carouselContent.map((item) =>
              item.type == 'img'
                ? html` <div class="${clabsPrefix}--chat-carousel-slide">
                    <clabs-chat-image content="${item.content}">
                    </clabs-chat-image>
                  </div>`
                : html`
                  <div class="${clabsPrefix}--chat-carousel-slide">
                    <clabs-chat-card content="${item.content}"" type="${item.type}">
                    </clabs-chat-card>
                  </div>
                `
            )}
          </div>
          <div class="${clabsPrefix}--chat-carousel-controls">
            <div class="${clabsPrefix}--chat-carousel-control-item">
              <cds-button
                kind="ghost"
                size="sm"
                @click="${handlePreviousSlide}"
                ?disabled="${slideCounter === 0}">
                ${ChevronLeft16({ slot: 'icon' })}
              </cds-button>
            </div>
            <div class="${clabsPrefix}--chat-carousel-control-item">
              ${renderedSlideCounter + ' / ' + maxSlideCounter}
            </div>
            <div class="${clabsPrefix}--chat-carousel-control-item">
              <cds-button
                kind="ghost"
                size="sm"
                @click="${handleNextSlide}"
                ?disabled="${slideCounter === carouselContent.length - 1}">
                ${ChevronRight16({ slot: 'icon' })}
              </cds-button>
            </div>
          </div>`
      : html``}
  </div>`;
}

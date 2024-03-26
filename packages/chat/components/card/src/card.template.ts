/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import { settings } from '@carbon-labs/utilities/es/settings/index.js';
const { stablePrefix: clabsPrefix } = settings;
import ArrowRight16 from '@carbon/web-components/es/icons/arrow--right/16.js';

/**
 * Lit template for card
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function cardTemplate(customElementClass) {
  const {
    _linkPreviewData: linkPreview,
    type: type,
    content: content,
  } = customElementClass;
  return html`<div class="${clabsPrefix}--chat-card">
    ${linkPreview !== null
      ? html` ${type === 'url' && linkPreview.image_url !== null
            ? html` <div class="${clabsPrefix}--chat-card-image-container">
                <img
                  class="${clabsPrefix}--chat-card-image"
                  src="${linkPreview.image_url}" />
              </div>`
            : type === 'video'
            ? html` <div class="${clabsPrefix}--chat-card-image-container">
                <video controls>
                  <source src="${content}" type="video/webm" />
                </video>
              </div>`
            : html``}

          <div class="${clabsPrefix}--chat-card-detail-container">
            <div class="${clabsPrefix}--chat-card-detail-title">
              ${linkPreview.title}
            </div>
            <div class="${clabsPrefix}--chat-card-detail-description">
              ${linkPreview.description}
            </div>
            <div class="${clabsPrefix}--chat-card-detail-link-container">
              <a
                class="${clabsPrefix}--chat-card-detail-link"
                href="${linkPreview.link}"
                target="_blank"
                >${linkPreview.shortenedUrl}</a
              >

              <div class="${clabsPrefix}--chat-card-detail-link-icon">
                <a href="${linkPreview.link}" target="_blank"
                  >${ArrowRight16()}</a
                >
              </div>
            </div>
          </div>`
      : html`<div class="${clabsPrefix}--chat-card-loader">
          Loading Media Card...
        </div>`}
  </div>`;
}

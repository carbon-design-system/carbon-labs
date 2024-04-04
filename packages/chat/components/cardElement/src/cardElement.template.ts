/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import { settings } from '@carbon/ai-utilities/es/settings/index.js';
const { stablePrefix: c4aiPrefix } = settings;
import ArrowRight16 from '@carbon/web-components/es/icons/arrow--right/16.js';

/**
 * Lit template for card
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function cardElementTemplate(customElementClass) {
  const {
    _linkPreviewData: linkPreviewData,
    type: type,
    content: content,
  } = customElementClass;
  return html`<div class="${c4aiPrefix}--chat-card">
    ${linkPreviewData !== null
      ? html` ${type === 'url' && linkPreviewData.image_url !== null
            ? html` <div class="${c4aiPrefix}--chat-card-image-container">
                <img
                  class="${c4aiPrefix}--chat-card-image"
                  src="${linkPreviewData.image_url}" />
              </div>`
            : type === 'video'
            ? html` <div class="${c4aiPrefix}--chat-card-image-container">
                <video controls>
                  <source src="${content}" type="video/webm" />
                </video>
              </div>`
            : html``}

          <div class="${c4aiPrefix}--chat-card-detail-container">
            <div class="${c4aiPrefix}--chat-card-detail-title">
              ${linkPreviewData.title}
            </div>
            ${linkPreviewData.description
              ? html`<div class="${c4aiPrefix}--chat-card-detail-description">
                  ${linkPreviewData.description}
                </div> `
              : html``}
            <div class="${c4aiPrefix}--chat-card-detail-link-container">
              <a
                class="${c4aiPrefix}--chat-card-detail-link"
                href="${linkPreviewData.link}"
                target="_blank"
                >${linkPreviewData.shortenedUrl}</a
              >

              <div class="${c4aiPrefix}--chat-card-detail-link-icon">
                <a href="${linkPreviewData.link}" target="_blank"
                  >${ArrowRight16()}</a
                >
              </div>
            </div>
          </div>`
      : html`<div class="${c4aiPrefix}--chat-card-loader">
          Loading Media Card...
        </div>`}
  </div>`;
}

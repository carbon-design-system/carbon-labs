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
import AI16 from '@carbon/web-components/es/icons/AI/16';
import User20 from '@carbon/web-components/es/icons/user/20';
import Renew20 from '@carbon/web-components/es/icons/renew/20';
import Edit16 from '@carbon/web-components/es/icons/edit/16';
import ThumbsUp20 from '@carbon/web-components/es/icons/thumbs-up/20';
import ThumbsDown20 from '@carbon/web-components/es/icons/thumbs-down/20';
import ArrowRight16 from '@carbon/web-components/es/icons/arrow--right/16';

/**
 * Lit template for message
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function messageTemplate(customElementClass) {
  const {
    _messageElements: messageElements,
    origin: origin,
    timeStamp: timeStamp,
    index: index,
    _handleEdit: handleEdit,
    _handleFeedback: handleFeedback,
    _getSiteName: getSiteName,
    _getShortenedURL: getShortenedURL,
  } = customElementClass;

  return html`<div
    class="${c4aiPrefix}--chat-message ${c4aiPrefix}--chat-message-${origin}-message">
    <div class="${c4aiPrefix}--chat-message-container">
      <div class="${c4aiPrefix}--chat-message-icon">
        <div class="${c4aiPrefix}--chat-message-${origin}-icon">
          ${origin == 'user' ? User20() : AI16()}
        </div>
      </div>
      <div class="${c4aiPrefix}--chat-message-content">
        <div class="${c4aiPrefix}--chat-message-timestamp">
          ${origin == 'user' ? 'User' : 'AI'} ${timeStamp}
        </div>
        <div class="${c4aiPrefix}--chat-message-response">
          ${messageElements.map(
            (message) => html`
              ${message.type === 'url'
                ? html`<div
                    class="${c4aiPrefix}--chat-message-piece ${c4aiPrefix}--chat-message-subsection-${message.type}">
                    <div class="${c4aiPrefix}--chat-message-url-card">
                      <div class="${c4aiPrefix}--chat-message-url-card-title">
                        ${getSiteName(message.content)}
                      </div>
                      <div
                        class="${c4aiPrefix}--chat-message-url-card-link-container">
                        <a href="${message.content}" target="_blank"
                          >${getShortenedURL(message.content)}</a
                        >
                        <div class="${c4aiPrefix}--chat-message-url-card-icon">
                          <a href="${message.content}" target="_blank"
                            >${ArrowRight16()}</a
                          >
                        </div>
                      </div>
                    </div>
                  </div>`
                : message.type === 'img'
                ? html`<div
                    class="${c4aiPrefix}--chat-message-piece ${c4aiPrefix}--chat-message-subsection-${message.type}">
                    <div class="${c4aiPrefix}--chat-message-img-card">
                      <img src="${message.content}" />
                    </div>
                  </div>`
                : html`<div
                    class="${c4aiPrefix}--chat-message-piece ${c4aiPrefix}--chat-message-subsection-${message.type}">
                    ${message.content}
                  </div>`}
            `
          )}
        </div>
        <div class="${c4aiPrefix}--chat-message-dropdown">
          ${origin === 'user'
            ? html` <div
                class="${c4aiPrefix}--chat-message-small-button"
                @click="${(e) => {
                  handleEdit(e, index);
                }}">
                ${Edit16()}
              </div>`
            : html`
                <div
                  class="${c4aiPrefix}--chat-message-small-button"
                  @click="${(e) => {
                    handleFeedback(e, index, 'like', timeStamp);
                  }}">
                  ${ThumbsUp20()}
                </div>
                <div
                  class="${c4aiPrefix}--chat-message-small-button"
                  @click="${(e) => {
                    handleFeedback(e, index, 'dislike', timeStamp);
                  }}">
                  ${ThumbsDown20()}
                </div>
                <div
                  class="${c4aiPrefix}--chat-message-small-button"
                  @click="${(e) => {
                    handleEdit(e, index);
                  }}">
                  ${Renew20()}
                </div>
              `}
        </div>
      </div>
    </div>
  </div>`;
}

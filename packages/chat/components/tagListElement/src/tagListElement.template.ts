/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import { settings } from '@carbon/ai-utilities/es/settings/index.js';
const { stablePrefix: c4aiPrefix } = settings;
import '@carbon/web-components/es/components/tag/index.js';

/**
 * Lit template for code
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function tagListElementTemplate(customElementClass) {
  const {
    _tagList: tagList,
    _invalid: invalid,
    _errorMessage: errorMessage,
    _handleTagClick: handleTagClick,
  } = customElementClass;

  return html`<div class="${c4aiPrefix}--chat-tag-list">
    ${invalid === true
      ? html` <div class="${c4aiPrefix}--chat-tag-list-error">
          ${errorMessage}
        </div>`
      : html` <div class="${c4aiPrefix}--chat-tag-list-container">
          ${tagList.map(
            (value) =>
              html` <div class="${c4aiPrefix}--chat-tag-list-container-cell">
                <cds-tag
                  interactive
                  size="md"
                  class="${c4aiPrefix}--chat-tag-list-custom-tag"
                  @click="${handleTagClick}">
                  ${value}
                </cds-tag>
              </div>`
          )}
          
          </div>
        </div>`}
  </div>`;
}

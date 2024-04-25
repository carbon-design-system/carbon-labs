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
import '@carbon/web-components/es/components/tag/index.js';
import '@carbon/web-components/es/components/chat-button/index.js';
import Add16 from '@carbon/web-components/es/icons/add/16.js';

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

  return html`<div class="${clabsPrefix}--chat-tag-list">
    ${invalid === true
      ? html` <div class="${clabsPrefix}--chat-tag-list-error">
          ${errorMessage}
        </div>`
      : html` <div class="${clabsPrefix}--chat-tag-list-container">
          ${tagList.map(
            (value) =>
              html` <div class="${clabsPrefix}--chat-tag-list-container-cell">
                <cds-chat-button
                  kind="ghost"
                  size="sm"
                  is-quick-action
                  @click="${handleTagClick}">
                  ${Add16({ slot: 'icon' })}
                  ${value}
                </cds-tag>
              </div>`
          )}
          
          </div>
        </div>`}
  </div>`;
}

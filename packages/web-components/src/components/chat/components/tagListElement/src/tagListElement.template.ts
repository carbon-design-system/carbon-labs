/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import { settings } from '@carbon-labs/utilities';
const { stablePrefix: clabsPrefix } = settings;
import '@carbon/web-components/es/components/tag/index.js';
import '@carbon/web-components/es/components/chat-button/index.js';
import Add16 from '@carbon/icons/es/add/16.js';
import Upload16 from '@carbon/icons/es/upload/16.js';
import SendAlt16 from '@carbon/icons/es/send--alt/16.js';
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';

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
    actionIcon,
    monoLabel,
    isInLine,
    useTags,
    selectionIndex,
  } = customElementClass;

  return html`<div class="${clabsPrefix}--chat-tag-list">
    ${invalid
      ? html`<div class="${clabsPrefix}--chat-tag-list-error">
          ${errorMessage}
        </div>`
      : html`<div
          class="${clabsPrefix}--chat-tag-list-container${isInLine
            ? '-inline'
            : ''}"
          role="group">
          ${tagList.map(
            (value, index) =>
              html` <div
                class="${clabsPrefix}--chat-tag-list-container-cell${isInLine
                  ? '-inline'
                  : ''}">
                ${useTags
                  ? html`
                      <cds-tag color="cool-grey" interactive>
                        ${monoLabel ? monoLabel : value}
                      </cds-tag>
                    `
                  : html`
                      <cds-chat-button
                        class="${clabsPrefix}--chat-tag-list-button"
                        kind="primary"
                        size="sm"
                        type="button"
                        is-quick-action
                        role="option"
                        aria-selected="${selectionIndex[index] ? true : false}"
                        aria-label="${value +
                        ' ' +
                        (selectionIndex[index] ? 'selected' : 'unselected')}"
                        ?is-selected="${selectionIndex[index]}"
                        data-content="${value}"
                        data-index="${index}"
                        @click="${handleTagClick}">
                        ${monoLabel ? monoLabel : value}
                        ${actionIcon === 'add'
                          ? iconLoader(Add16, { slot: 'icon' })
                          : actionIcon === 'upload'
                          ? iconLoader(Upload16, { slot: 'icon' })
                          : actionIcon === 'send'
                          ? iconLoader(SendAlt16, { slot: 'icon' })
                          : ''}
                      </cds-chat-button>
                    `}
              </div>`
          )}
        </div>`}
  </div>`;
}

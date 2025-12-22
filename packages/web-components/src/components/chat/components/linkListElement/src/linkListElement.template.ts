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
import ArrowRight16 from '@carbon/icons/es/arrow--right/16.js';
import '@carbon/web-components/es/components/button/index.js';
import '@carbon/web-components/es/components/link/index.js';

import ChevronDown16 from '@carbon/icons/es/chevron--down/16.js';
import ChevronUp16 from '@carbon/icons/es/chevron--up/16.js';
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';

/**
 * Lit template for code
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function linkListElementTemplate(customElementClass) {
  const {
    _linkList: linkList,
    expanded,
    expandList,
    collapseList,
    disableRedirection,
    maxItems,
    hideArrows,
    _handleLinkFeedback: handleLinkFeedback,
    _renderLabel: renderLabel,
  } = customElementClass;

  return html`
    <div class="${clabsPrefix}--chat-link-list-header">
      ${renderLabel('link-list-reference-title')} (${linkList.length})
    </div>
    <div class="${clabsPrefix}--chat-link-list-container">
      ${linkList.map((linkObject, index) =>
        index < maxItems || expanded
          ? html` <div class="${clabsPrefix}--chat-link-list-item">
              <div
                class="${clabsPrefix}--chat-link-list-item-text"
                @click="${handleLinkFeedback}">
                ${!disableRedirection
                  ? html`
                      <cds-link
                        data-index="${index}"
                        id="${clabsPrefix}--chat-link-list-item-text-${index}"
                        target="_blank"
                        class="${clabsPrefix}--chat-link-list-item-text-sublink"
                        href="${linkObject.url}"
                        >${linkObject.title}
                        ${iconLoader(ArrowRight16, { slot: 'icon' })}</cds-link
                      >
                    `
                  : html`<cds-link data-index="${index}"
                      >${linkObject.title}
                      ${iconLoader(ArrowRight16, { slot: 'icon' })}</cds-link
                    >`}
              </div>
              ${hideArrows
                ? ''
                : html`
                    <div @click="${handleLinkFeedback}">
                      ${!disableRedirection
                        ? html`
                            <cds-link
                              data-index="${index}"
                              target="_blank"
                              class="${clabsPrefix}--chat-link-list-item-text-sublink"
                              tabindex="-1"
                              href="${linkObject.url}"
                              >${iconLoader(ArrowRight16, {
                                slot: 'icon',
                              })}</cds-link
                            >
                          `
                        : html`<cds-link data-index="${index}" tabindex="-1"
                            >${iconLoader(ArrowRight16, {
                              slot: 'icon',
                            })}</cds-link
                          >`}
                    </div>
                  `}
            </div>`
          : html``
      )}
      ${linkList.length > maxItems
        ? html`<div class="${clabsPrefix}--chat-link-list-item-control">
            <div class="${clabsPrefix}--chat-link-list-item-text">
              <cds-button
                kind="ghost"
                class="${clabsPrefix}--chat-link-list-item-button"
                tooltip-text="${expanded ? 'Collapse' : 'View all'}"
                tooltip-position="right"
                tooltip-alignment="end"
                size="sm"
                @click="${expanded ? collapseList : expandList}">
                ${expanded
                  ? renderLabel('link-list-collapse-button')
                  : renderLabel('link-list-view-all-button')}
                ${expanded
                  ? iconLoader(ChevronUp16, { slot: 'icon' })
                  : iconLoader(ChevronDown16, { slot: 'icon' })}</cds-button
              >
            </div>
          </div>`
        : html``}
    </div>
  `;
}

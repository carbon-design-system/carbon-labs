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
import Popup16 from '@carbon/web-components/es/icons/popup/16.js';
import Menu24 from '@carbon/web-components/es/icons/menu/16.js';
import Subtract16 from '@carbon/web-components/es/icons/subtract/16.js';
import Maximize16 from '@carbon/web-components/es/icons/maximize/16.js';
import Minimize16 from '@carbon/web-components/es/icons/minimize/16.js';
import Close16 from '@carbon/web-components/es/icons/close/16.js';

import '@carbon/web-components/es/components/slug/index.js';
import '@carbon/web-components/es/components/button/index.js';

/**
 * Lit template for card
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function headerTemplate(customElementClass) {
  const {
    title,
    _handlePopup: handlePopup,
    _handleSubtract: handleSubtract,
    _handleMaximize: handleMaximize,
    _handleMinimize: handleMinimize,
    _handleMenuToggle: handleMenuToggle,
    _handleClosed: handleClosed,
    enableFullscreen,
    enableDocking,
    disableHeaderButtons,
    disableMenu,
    disableFullscreen,
    disableClose,
    disableMinimize,
  } = customElementClass;
  return html` <div class="${clabsPrefix}--chat-header-container">
    <div class="${clabsPrefix}--chat-header-content">
      <div class="${clabsPrefix}--chat-header-elements">
        <div class="${clabsPrefix}--chat-header-elements-left">
          ${!disableMenu && !disableHeaderButtons
            ? html` <div class="${clabsPrefix}--chat-header-elements-icon">
                <cds-button
                  kind="ghost"
                  ?disabled="${true}"
                  size="sm"
                  @click="${handleMenuToggle}">
                  ${Menu24({ slot: 'icon' })}
                </cds-button>
              </div>`
            : html``}
          ${title
            ? html` <span class="${clabsPrefix}--chat-header-title">
                ${title}
              </span>`
            : null}
        </div>

        <div class="${clabsPrefix}--chat-header-elements-right">
          <div
            class="${clabsPrefix}--chat-header-elements-icon"
            style="pointer-events:none;">
            <cds-slug
              size="xs"
              alignment="bottom-right"
              slot="slug"
              kind="hollow"
              has-actions="">
            </cds-slug>
          </div>

          ${!disableHeaderButtons
            ? html`
                ${!disableFullscreen
                  ? html`
                      ${!enableFullscreen
                        ? html`
                            <div
                              class="${clabsPrefix}--chat-header-elements-icon">
                              <cds-button
                                kind="ghost"
                                size="sm"
                                @click="${handleMaximize}">
                                ${Maximize16({ slot: 'icon' })}
                              </cds-button>
                            </div>
                          `
                        : html`
                            <div
                              class="${clabsPrefix}--chat-header-elements-icon">
                              <cds-button
                                kind="ghost"
                                size="sm"
                                @click="${handleMinimize}">
                                ${Minimize16({ slot: 'icon' })}
                              </cds-button>
                            </div>
                          `}
                    `
                  : html``}
                ${!disableMinimize
                  ? html`
                      ${!enableDocking
                        ? html`
                            <div
                              class="${clabsPrefix}--chat-header-elements-icon">
                              <cds-button
                                kind="ghost"
                                size="sm"
                                @click="${handlePopup}">
                                ${Subtract16({ slot: 'icon' })}
                              </cds-button>
                            </div>
                          `
                        : html`
                            <div
                              class="${clabsPrefix}--chat-header-elements-icon">
                              <cds-button
                                kind="ghost"
                                size="sm"
                                @click="${handleSubtract}">
                                ${Popup16({ slot: 'icon' })}
                              </cds-button>
                            </div>
                          `}
                    `
                  : html``}
                ${!disableClose
                  ? html`
                      <div class="${clabsPrefix}--chat-header-elements-icon">
                        <cds-button
                          kind="ghost"
                          size="sm"
                          @click="${handleClosed}">
                          ${Close16({ slot: 'icon' })}
                        </cds-button>
                      </div>
                    `
                  : html``}
              `
            : html``}
        </div>
      </div>
    </div>
  </div>`;
}

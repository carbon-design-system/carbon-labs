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
import '@carbon/web-components/es/components/overflow-menu/index.js';

import '@carbon/web-components/es/components/slug/index.js';
import '@carbon/web-components/es/components/icon-button/index.js';
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
    menuItems: menuItems,
    enableFullscreen,
    enableDocking,
    disableHeaderButtons,
    disableMenu,
    disableFullscreen,
    disableClose,
    disableMinimize,
    dockingEnabled,
    _handleMenuItemSelected: handleMenuItemSelected,
    hideMenu,
    _handleHeaderMouseDown: handleHeaderMouseDown,
    _handleHeaderMouseUp: handleHeaderMouseUp,
    _handleHeaderMouseMove: handleHeaderMouseMove,
    menuOpened,
  } = customElementClass;
  return html` <div class="${clabsPrefix}--chat-header-container">
    <div
      class="${clabsPrefix}--chat-header-content"
      @mouseup="${handleHeaderMouseUp}"
      @mousemove="${handleHeaderMouseMove}">
      <div class="${clabsPrefix}--chat-header-elements">
        ${menuOpened
          ? html`
              <div class="${clabsPrefix}--chat-header-elements-menu-list">
                ${menuItems.map(
                  (menuItem, index) => html`
                    <div
                      class="${clabsPrefix}--chat-header-elements-menu-list-item">
                      <cds-button
                        kind="ghost"
                        size="${dockingEnabled ? 'sm' : 'md'}
                        aria-label="Select Menu Option"
                        role="button"
                        data-menuindex="${index}"
                        @mousedown="${handleMenuItemSelected}"
                        tooltip-position="right"
                        tooltip-alignment="end"
                        tooltip-text="${menuItem.tooltip || menuItem.title}">
                        ${menuItem.title}
                      </cds-button>
                    </div>
                  `
                )}
              </div>
            `
          : html``}

        <div
          role="banner"
          aria-label="Menu section"
          class="${clabsPrefix}--chat-header-elements-left ${dockingEnabled
            ? clabsPrefix + '--chat-header-elements-left-docked'
            : ''}"
          @mousedown="${handleHeaderMouseDown}">
          ${!disableMenu && !disableHeaderButtons
            ? html` <div class="${clabsPrefix}--chat-header-elements-icon">
                ${menuItems
                  ? html`
                      <cds-icon-button
                        kind="ghost"
                        size="sm"
                        align="right"
                        aria-label="Open Menu"
                        role="button"
                        @blur="${hideMenu}"
                        @click="${handleMenuToggle}">
                        ${!menuOpened
                          ? Menu24({ slot: 'icon' })
                          : Close16({ slot: 'icon' })}
                        <span slot="tooltip-content">
                          ${menuOpened ? 'Close Menu' : 'Open Menu'}
                        </span>
                      </cds-icon-button>
                    `
                  : html``}
              </div>`
            : html``}
          ${title
            ? html` <span class="${clabsPrefix}--chat-header-title">
                ${title}
              </span>`
            : ''}
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
                              <cds-icon-button
                                kind="ghost"
                                size="sm"
                                aria-label="Fullscreen Chat"
                                role="button"
                                align="bottom-right"
                                @click="${handleMaximize}">
                                ${Maximize16({ slot: 'icon' })}
                                <span slot="tooltip-content"
                                  >Fullscreen mode</span
                                >
                              </cds-icon-button>
                            </div>
                          `
                        : html`
                            <div
                              class="${clabsPrefix}--chat-header-elements-icon">
                              <cds-icon-button
                                kind="ghost"
                                size="sm"
                                aria-label="Minimize Chat"
                                role="button"
                                align="bottom-right"
                                @click="${handleMinimize}">
                                ${Minimize16({ slot: 'icon' })}
                                <span slot="tooltip-content"
                                  >Exit fullscreen</span
                                >
                              </cds-icon-button>
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
                              <cds-icon-button
                                kind="ghost"
                                align="bottom-right"
                                size="sm"
                                aria-label="Dock Chat"
                                role="button"
                                @click="${handlePopup}">
                                ${Subtract16({ slot: 'icon' })}
                                <span slot="tooltip-content">Pop out chat</span>
                              </cds-icon-button>
                            </div>
                          `
                        : html`
                            <div
                              class="${clabsPrefix}--chat-header-elements-icon">
                              <cds-icon-button
                                kind="ghost"
                                size="sm"
                                aria-label="Undock Chat"
                                role="button"
                                align="bottom-right"
                                @click="${handleSubtract}">
                                ${Popup16({ slot: 'icon' })}
                                <span slot="tooltip-content">Expand chat</span>
                              </cds-icon-button>
                            </div>
                          `}
                    `
                  : html``}
                ${!disableClose
                  ? html`
                      <div class="${clabsPrefix}--chat-header-elements-icon">
                        <cds-icon-button
                          kind="ghost"
                          size="sm"
                          aria-label="Close Chat"
                          role="button"
                          align="bottom-right"
                          @click="${handleClosed}">
                          ${Close16({ slot: 'icon' })}
                          <span slot="tooltip-content">Close</span>
                        </cds-icon-button>
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

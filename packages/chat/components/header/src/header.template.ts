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
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import Popup16 from '@carbon/web-components/es/icons/popup/16.js';
import Menu24 from '@carbon/web-components/es/icons/menu/16.js';
import Subtract16 from '@carbon/web-components/es/icons/subtract/16.js';
import Maximize16 from '@carbon/web-components/es/icons/maximize/16.js';
import Minimize16 from '@carbon/web-components/es/icons/minimize/16.js';
import Close16 from '@carbon/web-components/es/icons/close/16.js';
import Move16 from '@carbon/web-components/es/icons/move/16.js';
import '@carbon/web-components/es/components/overflow-menu/index.js';

import '../../popupElement/popupElement.js';

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
    useOverflowMenu,
    _handleMenuItemSelected: handleMenuItemSelected,
    hideMenu,
    _handleMenuKeyboardToggle: handleMenuKeyboardToggle,
    _handleHeaderMouseDown: handleHeaderMouseDown,
    _handleHeaderMouseUp: handleHeaderMouseUp,
    _handleHeaderMouseMove: handleHeaderMouseMove,
    menuOpened,
    headerSlugContent,
    _checkKeyboardEscape: checkKeyboardEscape,
    _handleDragAreaKeydown: handleDragAreaKeydown,
    _handleDragAreaKeyup: handleDragAreaKeyup,
    _checkKeyboardMenu: checkKeyboardMenu,
  } = customElementClass;
  return html` <div
    class="${clabsPrefix}--chat-header-container"
    role="banner"
    aria-label="Chat header controls">
    <div
      class="${clabsPrefix}--chat-header-content"
      @mouseup="${handleHeaderMouseUp}"
      @mousemove="${handleHeaderMouseMove}">
      <div class="${clabsPrefix}--chat-header-elements">
        ${!useOverflowMenu
          ? html` ${menuOpened
              ? html`
                  <div
                    class="${clabsPrefix}--chat-header-elements-menu-list"
                    id="${clabsPrefix}--chat-header-menu-list-unique-id">
                    ${menuItems.map(
                      (menuItem, index) => html`
                    <div
                      class="${clabsPrefix}--chat-header-elements-menu-list-item" >
                      <cds-button
                        kind="ghost"
                        size="${dockingEnabled ? 'sm' : 'md'}
                        aria-label="Menu Option ${index}"
                        data-menuindex="${index}"
                        class="${clabsPrefix}--chat-header-elements-menu-list-item-button"
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
              : html``}`
          : html``}

        <div
          class="${clabsPrefix}--chat-header-elements-left ${dockingEnabled
            ? clabsPrefix + '--chat-header-elements-left-docked'
            : ''}"
          id="${clabsPrefix}--chat-header-container-target"
          data-floating-menu-container>
          ${!disableMenu && !disableHeaderButtons
            ? html`
                ${menuItems
                  ? html`
                      ${useOverflowMenu
                        ? html`
                            <div
                              tabindex="0"
                              role="button"
                              aria-haspopup="${true}"
                              aria-expanded="${false}"
                              class="${clabsPrefix}--chat-header-overflow-menu-container">
                              <cds-overflow-menu
                                id="${clabsPrefix}--chat-header-overflow-menu-unique"
                                tooltip-alignment="right"
                                tooltip-position="bottom"
                                @keydown="${checkKeyboardEscape}"
                                type="button"
                                kind="primary"
                                close-on-activation>
                                ${Menu24({
                                  slot: 'icon',
                                })}

                                <span slot="tooltip-content">
                                  ${menuOpened ? 'Close Menu' : 'Open Menu'}
                                </span>

                                <cds-overflow-menu-body
                                  tabindex="-1"
                                  size="sm"
                                  role="menu"
                                  @keydown="${checkKeyboardMenu}"
                                  id="${clabsPrefix}--chat-header-overflow-body-unique">
                                  ${menuItems.map(
                                    (
                                      menuItem,
                                      index
                                    ) => html` <cds-overflow-menu-item
                                      size=${dockingEnabled ? 'sm' : 'md'}
                                      aria-label="Menu Option ${index}"
                                      data-menuindex="${index}"
                                      role="menuitem"
                                      class="${clabsPrefix}--chat-header-overflow-menu-item-${index}"
                                      @mousedown="${handleMenuItemSelected}">
                                      ${menuItem.title}
                                    </cds-overflow-menu-item>`
                                  )}
                                </cds-overflow-menu-body>
                              </cds-overflow-menu>
                            </div>
                          `
                        : html`
                      <cds-icon-button
                        kind="ghost"
                        size="sm"
                        align="right"
                        tabindex="0"
                        aria-expanded="${menuOpened}"
                        aria-controls="${clabsPrefix}--chat-header-menu-list-unique-id"
                        aria-label="${!menuOpened ? 'Open Menu' : 'Close Menu'}
                        @blur="${hideMenu}"
                        @keydown="${handleMenuKeyboardToggle}"
                        @click="${handleMenuToggle}">
                        ${
                          !menuOpened
                            ? Menu24({ slot: 'icon' })
                            : Close16({ slot: 'icon' })
                        }
                        <span slot="tooltip-content">
                          ${menuOpened ? 'Close Menu' : 'Open Menu'}
                        </span>
                      </cds-icon-button>`}
                    `
                  : html``}
              `
            : html``}
          ${title
            ? html` <span class="${clabsPrefix}--chat-header-title">
                ${title}
              </span>`
            : ''}
        </div>
        ${dockingEnabled
          ? html`
              <div
                role="button"
                @mousedown="${handleHeaderMouseDown}"
                @keydown="${handleDragAreaKeydown}"
                @keyup="${handleDragAreaKeyup}"
                aria-label="Move chat"
                tabindex="0"
                class="${clabsPrefix}--chat-header-drag-area">
                <div>${Move16()}</div>
              </div>
            `
          : ''}

        <div class="${clabsPrefix}--chat-header-elements-right">
          <div class="${clabsPrefix}--chat-header-elements-icon">
            <cds-slug
              size="xs"
              slot="slug"
              kind="hollow"
              autoalign
              slug-label="Show information">
              <div slot="body-text">
                ${headerSlugContent
                  ? unsafeHTML(headerSlugContent)
                  : 'Define your preferred tutorial/explanatory text within chat as an ai-slug-content attribute or as a composable slotted div element'}
              </div>
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
                                align="bottom-right"
                                @click="${handleMaximize}">
                                ${Maximize16({ slot: 'icon' })}
                                <span slot="tooltip-content">Fullscreen</span>
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
                                align="bottom-right"
                                @click="${handleMinimize}">
                                ${Minimize16({ slot: 'icon' })}
                                <span slot="tooltip-content"
                                  >Exit Fullscreen</span
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
                                @click="${handlePopup}">
                                ${Subtract16({ slot: 'icon' })}
                                <span slot="tooltip-content">Pop-out Chat</span>
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
                                align="bottom-right"
                                @click="${handleSubtract}">
                                ${Popup16({ slot: 'icon' })}
                                <span slot="tooltip-content">Expand Chat</span>
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

/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import { settings } from '@carbon-labs/utilities';
const { stablePrefix: clabsPrefix } = settings;
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import Popup16 from '@carbon/icons/es/popup/16.js';
import Menu24 from '@carbon/icons/es/menu/16.js';
import Subtract16 from '@carbon/icons/es/subtract/16.js';
import Maximize16 from '@carbon/icons/es/maximize/16.js';
import Minimize16 from '@carbon/icons/es/minimize/16.js';
import Close16 from '@carbon/icons/es/close/16.js';
import Move16 from '@carbon/icons/es/move/16.js';
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';
import '@carbon/web-components/es/components/overflow-menu/index.js';

import '../../popupElement/popupElement.js';

import '@carbon/web-components/es/components/slug/index.js';
import '@carbon/web-components/es/components/ai-label/index.js';
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
    _renderLabel: renderLabel,
    slugOpened,
    _handleMenuOpened,
    headerSlugObject,
    _handleSlugClick: handleSlugClick,
    _hideAISlug: hideAISlug,
    customLabels: customLabels,
    _useSlug: useSlug,
    _useAiLabel: useAiLabel,
    _isDragging: isDragging,
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
                            <cds-overflow-menu
                              id="${clabsPrefix}--chat-header-overflow-menu-unique"
                              tooltip-alignment="start"
                              tooltip-position="right"
                              @on-open="${_handleMenuOpened}"
                              align="right"
                              @keydown="${checkKeyboardEscape}"
                              close-on-activation="${true}">
                              ${iconLoader(Menu24, {
                                slot: 'icon',
                                id:
                                  clabsPrefix +
                                  '--chat-header-overflow-menu-icon',
                              })}

                              <span slot="tooltip-content">
                                ${menuOpened
                                  ? renderLabel('header-close-menu')
                                  : renderLabel('header-open-menu')}
                              </span>

                              <cds-overflow-menu-body
                                tabindex="0"
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
                            ? iconLoader(Menu24, { slot: 'icon' })
                            : iconLoader(Close16, { slot: 'icon' })
                        }
                        <span slot="tooltip-content">
                          ${
                            menuOpened
                              ? renderLabel('header-close-menu')
                              : renderLabel('header-open-menu')
                          }
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
              <cds-icon-button
                kind="ghost"
                size="sm"
                aria-label="Move Chat"
                align="bottom"
                class="${clabsPrefix}--chat-header-drag-button"
                @mousedown="${handleHeaderMouseDown}"
                @keydown="${handleDragAreaKeydown}"
                @keyup="${handleDragAreaKeyup}">
                ${iconLoader(Move16, { slot: 'icon' })}
                <span slot="tooltip-content"
                  >${!isDragging
                    ? renderLabel('header-move-start-button')
                    : renderLabel('header-move-end-button')}</span
                >
              </cds-icon-button>
            `
          : ''}

        <div class="${clabsPrefix}--chat-header-elements-right">
          <div class="${clabsPrefix}--chat-header-elements-icon">
            ${useSlug
              ? html`<cds-slug
                  size="sm"
                  slot="slug"
                  autoalign
                  alignment="bottom">
                  <div slot="body-text">
                    <div
                      class="${clabsPrefix}--chat-header-slug-compress"
                      tabindex="0"
                      role="textbox">
                      ${headerSlugContent
                        ? unsafeHTML(headerSlugContent)
                        : 'Define your preferred tutorial/explanatory text within chat as an ai-slug-content attribute or as a composable slotted div element'}
                    </div>
                  </div>
                </cds-slug> `
              : useAiLabel
              ? html`
                  <cds-ai-label kind="inline" ai-text-label="Text goes here">
                    <div slot="body-text">
                      Explanation of AI-generated content
                    </div>
                  </cds-ai-label>
                `
              : html` <cds-icon-button
                  size="sm"
                  kind="tertiary"
                  align="right"
                  role="button"
                  tabindex="0"
                  class="${clabsPrefix}--chat-header-ai-button"
                  aria-expanded="${slugOpened}"
                  aria-controls="${slugOpened
                    ? clabsPrefix + '--chat-popup-unique-slug'
                    : ''}"
                  label="${renderLabel(
                    slugOpened
                      ? 'message-undo-like-button'
                      : 'message-like-button'
                  )}"
                  @click="${handleSlugClick}">
                  <span slot="icon" class="cds--slug__text">AI</span>
                  <span slot="tooltip-content"
                    >${renderLabel(
                      slugOpened
                        ? 'message-undo-like-button'
                        : 'message-like-button'
                    )}</span
                  >
                </cds-icon-button>`}
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
                                ${iconLoader(Maximize16, { slot: 'icon' })}
                                <span slot="tooltip-content"
                                  >${renderLabel(
                                    'header-enable-fullscreen'
                                  )}</span
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
                                align="bottom-right"
                                @click="${handleMinimize}">
                                ${iconLoader(Minimize16, { slot: 'icon' })}
                                <span slot="tooltip-content"
                                  >${renderLabel(
                                    'header-disable-fullscreen'
                                  )}</span
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
                                aria-label="Dock chat"
                                @click="${handlePopup}">
                                ${iconLoader(Subtract16, { slot: 'icon' })}
                                <span slot="tooltip-content"
                                  >${renderLabel('header-popout-chat')}</span
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
                                aria-label="Undock Chat"
                                align="bottom-right"
                                @click="${handleSubtract}">
                                ${iconLoader(Popup16, { slot: 'icon' })}
                                <span slot="tooltip-content"
                                  >${renderLabel('header-expand-chat')}</span
                                >
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
                          aria-controls
                          label="Close Chat"
                          align="bottom-right"
                          @click="${handleClosed}">
                          ${iconLoader(Close16, { slot: 'icon' })}
                          <span
                            id="${clabsPrefix}--chat-header-close-label"
                            slot="tooltip-content"
                            >${renderLabel('header-close-chat')}</span
                          >
                        </cds-icon-button>
                      </div>
                    `
                  : html``}
              `
            : html``}
        </div>
      </div>
    </div>
    ${slugOpened
      ? html` <clabs-chat-popup
          @on-feedback-popup-closed="${hideAISlug}"
          ?is-open="${slugOpened}"
          orientation="top"
          block-position="50"
          inline-position="50"
          id="${clabsPrefix}--chat-popup-unique-slug"
          .feedbackFormValues="${headerSlugObject}"
          .customLabels="${customLabels}"
          ?compact-mode="${enableFullscreen}"
          type="slug">
        </clabs-chat-popup>`
      : ''}
  </div>`;
}

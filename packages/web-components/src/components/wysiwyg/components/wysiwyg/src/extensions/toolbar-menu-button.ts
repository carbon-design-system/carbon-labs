/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { createRef, ref } from 'lit/directives/ref.js';
import type { TemplateResult } from 'lit';
import type { Editor } from '@tiptap/core';
import ChevronDown from '@carbon/icons/es/chevron--down/16.js';
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';
import '@carbon/web-components/es/components/button/index.js';
import '@carbon/web-components/es/components/menu/index.js';
import { BASE_CLASS } from '../constants.js';
import type { ToolbarSize } from '../types.js';

export interface ToolbarMenuOption {
  value: string;
  label: string;
  style?: string;
}

export interface ToolbarMenuButtonOptions {
  label: string;
  groupLabel: string;
  toolbarSize: ToolbarSize;
  options: ToolbarMenuOption[];
  currentValue: string;
  editor: Editor | null;
  /** Grow to fill leftover toolbar space (typeface, typography) */
  grow?: boolean;
  style?: string;
  onSelect: (value: string) => void;
}

/**
 * Ghost menu trigger with a radio-group of selectable items.
 * @param {ToolbarMenuButtonOptions} options - Menu button options
 * @returns {TemplateResult} Toolbar group
 */
export const toolbarMenuButton = ({
  label,
  groupLabel,
  toolbarSize,
  options,
  currentValue,
  editor,
  grow = true,
  style,
  onSelect,
}: ToolbarMenuButtonOptions): TemplateResult => {
  const trigger = createRef<HTMLElement>();
  let menuEl: any;

  /**
   * Carbon `cds-menu` defaults to open; close it on first mount.
   * @param {Element | undefined} el - Menu element
   */
  const bindMenu = (el: Element | undefined) => {
    menuEl = el;
    if (el && !el.hasAttribute('data-clabs-closed')) {
      (el as any).open = false;
      el.setAttribute('data-clabs-closed', '');
    }
  };

  /**
   * Opens or closes the menu under the trigger.
   */
  const toggle = () => {
    const triggerEl = trigger.value;
    if (!menuEl || !triggerEl) {
      return;
    }
    if (menuEl.open) {
      menuEl.open = false;
      return;
    }
    const rect = triggerEl.getBoundingClientRect();
    menuEl.x = rect.left;
    menuEl.y = rect.bottom;
    menuEl.open = true;
  };

  return html`
    <div
      class="${BASE_CLASS}__toolbar-group ${BASE_CLASS}__toolbar-group--menu ${grow
        ? `${BASE_CLASS}__toolbar-group--flex`
        : `${BASE_CLASS}__toolbar-group--menu-fixed`}">
      <cds-button
        ${ref(trigger)}
        kind="ghost"
        .size=${toolbarSize as any}
        style=${ifDefined(style)}
        @click=${toggle}>
        ${label} ${iconLoader(ChevronDown, { slot: 'icon' })}
      </cds-button>
      <cds-menu ${ref(bindMenu)} .size=${toolbarSize as any}>
        <cds-menu-item-radio-group label=${groupLabel}>
          ${options.map(
            (option) => html`
              <cds-menu-item
                label=${option.label}
                style=${ifDefined(option.style)}
                .ariaChecked=${option.value === currentValue ? 'true' : 'false'}
                @click=${() => {
                  if (menuEl) {
                    menuEl.open = false;
                  }
                  onSelect(option.value);
                  (editor as any)?.component?.requestUpdate?.();
                }}>
              </cds-menu-item>
            `
          )}
        </cds-menu-item-radio-group>
      </cds-menu>
    </div>
  `;
};

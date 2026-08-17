/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import type { TemplateResult } from 'lit';
import type { Editor } from '@tiptap/core';
import { createRef, ref } from 'lit/directives/ref.js';
import { BASE_CLASS } from '../constants.js';
import type { ToolbarSize } from '../types.js';
import { iconButton } from './button-helper.js';
import '../roving-tabindex.js';
import '@carbon/web-components/es/components/popover/index.js';
import '@carbon/web-components/es/components/layer/index.js';

/**
 * Shared utility for handling popover behavior across extensions.
 * Provides consistent Escape key handling and focus management.
 */

/**
 * Sets up popover content with Escape key handling and focus management.
 * @param {Element | undefined} element - Popover content element
 * @param {string} [focusSelector] - Optional selector for element to focus when opened
 */
export const setupPopoverContent = (
  element: Element | undefined,
  focusSelector = 'cds-icon-button:not([disabled])'
) => {
  if (!element) {
    return;
  }

  const popover = element.closest('cds-popover') as any;
  if (!popover) {
    return;
  }

  /**
   * Handles Escape key to close popover
   * @param {Event} event - Keyboard event
   */
  const handleKeyDown = (event: Event) => {
    if ((event as KeyboardEvent).key !== 'Escape' || !popover.open) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    popover.open = false;
    (popover.querySelector('cds-icon-button') as HTMLElement)?.focus();
  };

  /**
   * Manages focus and keyboard listeners based on popover state
   * @param {boolean} isOpen - Whether popover is open
   */
  const handleOpenChange = (isOpen: boolean) => {
    element[`${isOpen ? 'add' : 'remove'}EventListener`](
      'keydown',
      handleKeyDown
    );
    isOpen &&
      requestAnimationFrame(() =>
        (element.querySelector(focusSelector) as HTMLElement)?.focus()
      );
  };

  new MutationObserver((mutations) => {
    mutations.some(
      (m) => m.type === 'attributes' && m.attributeName === 'open'
    ) && handleOpenChange(popover.open);
  }).observe(popover, { attributes: true, attributeFilter: ['open'] });

  popover.open && handleOpenChange(true);
};

/**
 * Toggles a popover's open state.
 * @param {any} popoverRef - Reference to the popover element
 */
export const togglePopover = (popoverRef: any) => {
  popoverRef?.value && (popoverRef.value.open = !popoverRef.value.open);
};

/**
 * Closes a popover.
 * @param {any} popoverRef - Reference to the popover element
 */
export const closePopover = (popoverRef: any) => {
  popoverRef?.value && (popoverRef.value.open = false);
};

/**
 * Options for a compact toolbar group popover.
 */
export interface ToolbarGroupPopoverOptions {
  icon?: any;
  iconContent?: TemplateResult;
  tooltip: string;
  toolbarSize: ToolbarSize;
  selected?: boolean;
  editor?: Editor | null;
  items: (onDone: () => void) => TemplateResult | TemplateResult[];
}

/**
 * Wraps toolbar buttons in a caret popover for the compact layout.
 * @param {ToolbarGroupPopoverOptions} options - Popover options
 * @returns {TemplateResult} Toolbar group
 */
export const toolbarGroupPopover = ({
  icon,
  iconContent,
  tooltip,
  toolbarSize,
  selected,
  editor,
  items,
}: ToolbarGroupPopoverOptions): TemplateResult => {
  const popover = createRef<any>();
  /**
   * Closes the popover and re-renders the toolbar.
   */
  const onDone = () => {
    closePopover(popover);
    (editor as any)?.component?.requestUpdate?.();
  };

  return html`
    <div class="${BASE_CLASS}__toolbar-group">
      <cds-layer>
        <cds-popover ${ref(popover)} tabtip align="bottom" autoalign>
          ${iconButton(icon, () => togglePopover(popover), toolbarSize, {
            selected,
            tooltip,
            caret: true,
            iconTabIndex: '-1',
            iconContent,
          })}
          <cds-popover-content
            slot="content"
            class="${BASE_CLASS}__toolbar-popover-content"
            ${ref(setupPopoverContent)}>
            <clabs-roving-tabindex>${items(onDone)}</clabs-roving-tabindex>
          </cds-popover-content>
        </cds-popover>
      </cds-layer>
    </div>
  `;
};

/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// TipTap core imports
import { Extension } from '@tiptap/core';
import type { Editor } from '@tiptap/core';

// Lit imports
import { html } from 'lit';
import type { TemplateResult } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import type { Ref } from 'lit/directives/ref.js';

// Carbon icons
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';
import TextAlignLeft from '@carbon/icons/es/text--align--left/16.js';
import TextAlignCenter from '@carbon/icons/es/text--align--center/16.js';
import TextAlignRight from '@carbon/icons/es/text--align--right/16.js';
import TextAlignJustify from '@carbon/icons/es/text--align--justify/16.js';

// Carbon components
import '@carbon/web-components/es/components/icon-button/index.js';
import '@carbon/web-components/es/components/popover/index.js';
import '@carbon/web-components/es/components/layer/index.js';

// Local imports
import { BASE_CLASS } from '../constants.js';
import {
  TOOLTIP_ENTER_DELAY_MS,
  TOOLTIP_LEAVE_DELAY_MS,
} from '../constants.js';
import type { ToolbarSize } from '../types.js';
import { popoverRovingTabIndex } from '../useRovingTabindex.js';

// TipTap extensions
import TextAlign from '@tiptap/extension-text-align';

// Styles
const styles = `
  .${BASE_CLASS}__alignment-popover-content[open]::part(content) {
    display: flex;
  }
`;

/**
 * Interface for the Alignment extension with toolbar rendering capability.
 * @extends {Extension<any>}
 */
export interface AlignmentExtension extends Extension<any> {
  /**
   * Renders the alignment toolbar controls.
   * @param {Editor | null} editor - The TipTap editor instance
   * @param {ToolbarSize} [toolbarSize='md'] - Size of the toolbar buttons
   * @returns {TemplateResult} Lit template for the alignment toolbar
   */
  toolbarRender: (
    editor: Editor | null,
    toolbarSize?: ToolbarSize
  ) => TemplateResult;
}

/**
 * Alignment extension for text alignment controls (left, center, right, justify).
 * Provides a toolbar with a popover containing alignment options.
 * @type {AlignmentExtension}
 */
export const Alignment = Extension.create({
  name: 'alignment',
  /**
   * Adds the TextAlign extension with configured alignment options.
   * @returns {Array} Array containing the configured TextAlign extension
   */
  addExtensions: () => [
    TextAlign.configure({
      types: ['heading', 'paragraph'],
      alignments: ['left', 'center', 'right', 'justify'],
      defaultAlignment: 'left',
    }),
  ],
}) as unknown as AlignmentExtension;

/**
 * Renders the alignment toolbar with popover controls.
 * @param {Editor | null} editor - The TipTap editor instance
 * @param {ToolbarSize} toolbarSize - Size of the toolbar buttons
 * @returns {TemplateResult} Lit template for the alignment toolbar
 */
Alignment.toolbarRender = (
  editor: Editor | null,
  toolbarSize: ToolbarSize = 'md'
) => {
  const alignmentPopoverRef: Ref<any> = createRef();

  /**
   * Sets the text alignment and closes the popover.
   * @param {string} alignment - The alignment value ('left', 'center', 'right', 'justify')
   */
  const setAlignment = (alignment: string) => {
    editor?.chain().focus().setTextAlign(alignment).run();
    if (alignmentPopoverRef.value) {
      alignmentPopoverRef.value.open = false;
    }
    const component = (editor as any)?.component;
    component.requestUpdate();
  };

  /**
   * Toggles the alignment popover open/closed state.
   */
  const toggleAlignmentPopover = () => {
    if (alignmentPopoverRef.value) {
      alignmentPopoverRef.value.open = !alignmentPopoverRef.value.open;
    }
  };

  /**
   * Handles popover content initialization with Escape key support.
   * @param {Element} element - Popover content element
   */
  const handlePopoverContentRef = (element: Element | undefined) => {
    if (!element) {
      return;
    }

    requestAnimationFrame(() => {
      const popoverContent = element as HTMLElement;
      const popover = popoverContent.closest('cds-popover') as any;
      if (!popover) {
        return;
      }

      let cleanup: (() => void) | null = null;

      /** @param {KeyboardEvent} event - Keyboard event */
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && popover.open) {
          event.preventDefault();
          event.stopPropagation();
          popover.open = false;
          const trigger = popover.querySelector(
            'cds-icon-button'
          ) as HTMLElement;
          trigger?.focus();
        }
      };

      /** @param {boolean} isOpen - Whether popover is open */
      const handleOpenChange = (isOpen: boolean) => {
        if (isOpen) {
          cleanup = popoverRovingTabIndex(popoverContent);
          popoverContent.addEventListener('keydown', handleKeyDown);
          requestAnimationFrame(() => {
            const firstFocusable = popoverContent.querySelector(
              'cds-icon-button:not([disabled])'
            ) as HTMLElement;
            firstFocusable?.focus();
          });
        } else if (cleanup) {
          cleanup();
          cleanup = null;
          popoverContent.removeEventListener('keydown', handleKeyDown);
        }
      };

      new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.type === 'attributes' &&
            mutation.attributeName === 'open'
          ) {
            handleOpenChange(popover.open);
          }
        });
      }).observe(popover, { attributes: true, attributeFilter: ['open'] });

      if (popover.open) {
        handleOpenChange(true);
      }
    });
  };

  /**
   * Determines the current alignment icon based on editor state.
   * @returns {any} The icon object for the current alignment
   */
  const getCurrentAlignmentIcon = () => {
    if (editor?.isActive({ textAlign: 'center' })) {
      return TextAlignCenter;
    }
    if (editor?.isActive({ textAlign: 'right' })) {
      return TextAlignRight;
    }
    if (editor?.isActive({ textAlign: 'justify' })) {
      return TextAlignJustify;
    }
    return TextAlignLeft;
  };

  const isAlignmentDisabled = !editor?.can().setTextAlign('left');

  return html`
    <style>
      ${styles}
    </style>
    <div class="${BASE_CLASS}__toolbar-group">
      <cds-layer>
        <cds-popover
          ${ref(alignmentPopoverRef)}
          tabtip
          align="bottom"
          autoalign>
          <cds-icon-button
            kind="ghost"
            autoalign
            caret
            align="top"
            .size=${toolbarSize as any}
            enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
            leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
            ?disabled=${isAlignmentDisabled}
            @click=${toggleAlignmentPopover}>
            ${iconLoader(getCurrentAlignmentIcon(), {
              slot: 'icon',
              tabIndex: '-1',
            })}
            <span slot="tooltip-content">Text Alignment</span>
          </cds-icon-button>
          <cds-popover-content
            slot="content"
            class="${BASE_CLASS}__alignment-popover-content"
            ${ref(handlePopoverContentRef)}>
            <cds-icon-button
              kind="ghost"
              autoalign
              align="top"
              .size=${toolbarSize as any}
              enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
              leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
              ?disabled=${!editor?.can().setTextAlign('left')}
              ?isselected=${editor?.isActive({ textAlign: 'left' })}
              @click=${() => setAlignment('left')}>
              ${iconLoader(TextAlignLeft, { slot: 'icon' })}
              <span slot="tooltip-content">Align Left</span>
            </cds-icon-button>
            <cds-icon-button
              kind="ghost"
              autoalign
              align="top"
              .size=${toolbarSize as any}
              enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
              leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
              ?disabled=${!editor?.can().setTextAlign('center')}
              ?isselected=${editor?.isActive({ textAlign: 'center' })}
              @click=${() => setAlignment('center')}>
              ${iconLoader(TextAlignCenter, { slot: 'icon' })}
              <span slot="tooltip-content">Align Center</span>
            </cds-icon-button>
            <cds-icon-button
              kind="ghost"
              autoalign
              align="top"
              .size=${toolbarSize as any}
              enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
              leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
              ?disabled=${!editor?.can().setTextAlign('right')}
              ?isselected=${editor?.isActive({ textAlign: 'right' })}
              @click=${() => setAlignment('right')}>
              ${iconLoader(TextAlignRight, { slot: 'icon' })}
              <span slot="tooltip-content">Align Right</span>
            </cds-icon-button>
            <cds-icon-button
              kind="ghost"
              autoalign
              align="top"
              .size=${toolbarSize as any}
              enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
              leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
              ?disabled=${!editor?.can().setTextAlign('justify')}
              ?isselected=${editor?.isActive({ textAlign: 'justify' })}
              @click=${() => setAlignment('justify')}>
              ${iconLoader(TextAlignJustify, { slot: 'icon' })}
              <span slot="tooltip-content">Justify</span>
            </cds-icon-button>
          </cds-popover-content>
        </cds-popover>
      </cds-layer>
    </div>
  `;
};

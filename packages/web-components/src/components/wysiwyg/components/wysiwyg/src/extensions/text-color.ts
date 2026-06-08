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
import TextColorIcon from '@carbon/icons/es/text--color/16.js';
import TextHighlight16 from '@carbon/icons/es/text--highlight/16.js';
import Subtract from '@carbon/icons/es/subtract/16.js';
import Add from '@carbon/icons/es/add/16.js';

// Carbon components
import '@carbon/web-components/es/components/button/index.js';
import '@carbon/web-components/es/components/icon-button/index.js';
import '@carbon/web-components/es/components/popover/index.js';
import '@carbon/web-components/es/components/layer/index.js';

// Local imports
import { BASE_CLASS } from '../constants.js';
import type { ToolbarSize } from '../types.js';
import {
  TOOLTIP_ENTER_DELAY_MS,
  TOOLTIP_LEAVE_DELAY_MS,
} from '../constants.js';
import { popoverRovingTabIndex } from '../useRovingTabindex.js';

// TipTap extensions
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';

/**
 * Predefined text color groups with Carbon Design System tokens.
 * @constant
 */
export const TEXT_COLOR_GROUPS = [
  {
    label: 'Text',
    items: [
      { label: 'Primary Text', token: 'text-primary' },
      { label: 'Secondary Text', token: 'text-secondary' },
      { label: 'Placeholder', token: 'text-placeholder' },
      { label: 'Link', token: 'link-primary' },
    ],
  },
  {
    label: 'Status',
    items: [
      { label: 'Info', token: 'support-info' },
      { label: 'Success', token: 'support-success' },
      { label: 'Error', token: 'support-error' },
      { label: 'Warning', token: 'support-warning' },
      { label: 'Caution', token: 'support-caution-major' },
    ],
  },
] as const;

// Styles
const styles = `
  .${BASE_CLASS}__text-color-boxes {
    display: flex;
    flex-wrap: wrap;
    max-inline-size: 5.2rem;
    gap: var(--cds-spacing-03);
    padding: var(--cds-spacing-03);
  }

  .${BASE_CLASS}__text-color[open]::part(content), .${BASE_CLASS}__highlight[open]::part(content) {
    display: flex;
  }
  
  .${BASE_CLASS}__text-color-box {
    inline-size: 1.4rem;
    block-size: 1.4rem;
    cursor: pointer;
  }
`;

/**
 * Interface for the TextColor extension with toolbar rendering capability.
 * @extends {Extension<any>}
 */
export interface TextColorExtension extends Extension<any> {
  /**
   * Renders the text color toolbar controls.
   * @param {Editor | null} editor - The TipTap editor instance
   * @param {ToolbarSize} [toolbarSize='md'] - Size of the toolbar buttons
   * @returns {TemplateResult} Lit template for the text color toolbar
   */
  toolbarRender: (
    editor: Editor | null,
    toolbarSize?: ToolbarSize
  ) => TemplateResult;
}

/**
 * TextColor extension for text color, highlighting, and text decorations.
 * Provides toolbar controls for text color, highlight, delete, and insert marks.
 * @type {TextColorExtension}
 */
export const TextColor = Extension.create({
  name: 'textColor',
  /**
   * Adds the text color and highlight extensions.
   * Note: TextStyle is provided by the Typeface extension to avoid duplication.
   * Note: Del and Ins marks are provided by the TextFormatting extension.
   * @returns {Array} Array of TipTap extensions
   */
  addExtensions: () => [
    Color,
    Highlight.configure({
      multicolor: false,
    }),
  ],
}) as unknown as TextColorExtension;

/**
 * Closes a popover if it's open.
 * @param {any} popoverRef - Popover reference
 */
const closePopover = (popoverRef: any) => {
  if (popoverRef.value) {
    popoverRef.value.open = false;
  }
};

/**
 * Toggles a popover's open state.
 * @param {any} popoverRef - Popover reference
 */
const togglePopover = (popoverRef: any) => {
  if (popoverRef.value) {
    popoverRef.value.open = !popoverRef.value.open;
  }
};

/**
 * Applies a color token to selected text and closes popover.
 * @param {Editor | null} editor - Editor instance
 * @param {string} token - Color token
 * @param {any} popoverRef - Popover reference
 */
const applyColor = (editor: Editor | null, token: string, popoverRef: any) => {
  if (!editor) {
    return;
  }
  editor.chain().focus().setColor(`var(--cds-${token})`).run();
  closePopover(popoverRef);
};

/**
 * Toggles a mark and closes popover.
 * @param {Editor | null} editor - Editor instance
 * @param {string} mark - Mark name or 'highlight'
 * @param {any} popoverRef - Popover reference
 */
const toggleMarkAndClose = (
  editor: Editor | null,
  mark: string,
  popoverRef: any
) => {
  if (!editor) {
    return;
  }
  const chain = editor.chain().focus();
  mark === 'highlight' ? chain.toggleHighlight() : chain.toggleMark(mark);
  chain.run();
  closePopover(popoverRef);
};

/**
 * Handles popover content initialization with roving tab index and Escape key.
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
        // Return focus to trigger button
        const trigger = popover.querySelector('cds-icon-button') as HTMLElement;
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
 * Renders the text color toolbar with color picker and text decoration controls.
 * @param {Editor | null} editor - The TipTap editor instance
 * @param {ToolbarSize} toolbarSize - Size of the toolbar buttons
 * @returns {TemplateResult} Lit template for the text color toolbar
 */
TextColor.toolbarRender = (
  editor: Editor | null,
  toolbarSize: ToolbarSize = 'md'
) => {
  const textColorPopoverRef: Ref<any> = createRef();
  const highlightPopoverRef: Ref<any> = createRef();

  // Get current color, default to text-primary
  const currentColor =
    editor?.getAttributes('textStyle')?.color || 'var(--cds-text-primary)';

  const isTextColorDisabled = !editor?.can().setColor('#000000');

  // Customize text color icon with current color on last path (only when not disabled)
  const customTextColorIcon = {
    ...TextColorIcon,
    content: TextColorIcon.content.map((item: any, index: number) =>
      index === TextColorIcon.content.length - 1 && !isTextColorDisabled
        ? { ...item, attrs: { ...item.attrs, fill: currentColor } }
        : item
    ),
  };

  return html`
    <style>
      ${styles}
    </style>
    <div class="${BASE_CLASS}__toolbar-group">
      <cds-layer>
        <cds-popover
          ${ref(textColorPopoverRef)}
          tabtip
          align="bottom-end"
          autoalign>
          <cds-icon-button
            kind="ghost"
            autoalign
            caret
            align="top"
            .size=${toolbarSize as any}
            enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
            leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
            ?disabled=${isTextColorDisabled}
            @click=${() => togglePopover(textColorPopoverRef)}>
            ${iconLoader(customTextColorIcon, { slot: 'icon', tabIndex: '-1' })}
            <span slot="tooltip-content">Text Color</span>
          </cds-icon-button>
          <cds-popover-content slot="content" class="${BASE_CLASS}__text-color">
            <div class="${BASE_CLASS}__text-color-boxes">
              ${TEXT_COLOR_GROUPS.reduce(
                (acc, group) => [...acc, ...group.items],
                [] as any[]
              ).map(
                (item) => html`
                  <div
                    class="${BASE_CLASS}__text-color-box"
                    style="background-color: var(--cds-${item.token})"
                    title="${item.label}"
                    @click=${() =>
                      applyColor(
                        editor,
                        item.token,
                        textColorPopoverRef
                      )}></div>
                `
              )}
            </div>
          </cds-popover-content>
        </cds-popover>
        <cds-popover
          ${ref(highlightPopoverRef)}
          tabtip
          align="bottom-end"
          autoalign>
          <cds-icon-button
            kind="ghost"
            autoalign
            caret
            align="top"
            .size=${toolbarSize as any}
            enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
            leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
            ?disabled=${!editor?.can().toggleHighlight()}
            @click=${() => togglePopover(highlightPopoverRef)}>
            ${iconLoader(TextHighlight16, { slot: 'icon' })}
            <span slot="tooltip-content">Highlight</span>
          </cds-icon-button>
          <cds-popover-content
            slot="content"
            ${ref(handlePopoverContentRef)}
            class="${BASE_CLASS}__highlight">
            <cds-icon-button
              kind="ghost"
              autoalign
              align="top"
              .size=${toolbarSize as any}
              enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
              leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
              ?disabled=${!editor?.can().toggleHighlight()}
              ?isselected=${editor?.isActive('highlight')}
              @click=${() =>
                toggleMarkAndClose(editor, 'highlight', highlightPopoverRef)}>
              ${iconLoader(TextHighlight16, { slot: 'icon' })}
              <span slot="tooltip-content">Mark</span>
            </cds-icon-button>
            <cds-icon-button
              kind="ghost"
              autoalign
              align="top"
              .size=${toolbarSize as any}
              enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
              leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
              ?disabled=${!editor?.can().toggleMark('deleteMark')}
              ?isselected=${editor?.isActive('deleteMark')}
              @click=${() =>
                toggleMarkAndClose(editor, 'deleteMark', highlightPopoverRef)}>
              ${iconLoader(Subtract, { slot: 'icon' })}
              <span slot="tooltip-content">Delete</span>
            </cds-icon-button>
            <cds-icon-button
              kind="ghost"
              autoalign
              align="top"
              .size=${toolbarSize as any}
              enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
              leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
              ?disabled=${!editor?.can().toggleMark('insertMark')}
              ?isselected=${editor?.isActive('insertMark')}
              @click=${() =>
                toggleMarkAndClose(editor, 'insertMark', highlightPopoverRef)}>
              ${iconLoader(Add, { slot: 'icon' })}
              <span slot="tooltip-content">Insert</span>
            </cds-icon-button>
          </cds-popover-content>
        </cds-popover>
      </cds-layer>
    </div>
  `;
};

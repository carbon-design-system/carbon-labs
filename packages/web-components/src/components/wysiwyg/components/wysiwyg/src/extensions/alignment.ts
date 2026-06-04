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
import { BASE_CLASS } from '../constants';
import {
  TOOLTIP_ENTER_DELAY_MS,
  TOOLTIP_LEAVE_DELAY_MS,
} from '../constants.js';

// TipTap extensions
import TextAlign from '@tiptap/extension-text-align';

/**
 * Interface for the Alignment extension with toolbar rendering capability.
 * @extends {Extension<any>}
 */
export interface AlignmentExtension extends Extension<any> {
  /**
   * Renders the alignment toolbar controls.
   * @param {Editor | null} editor - The TipTap editor instance
   * @param {string} [toolbarSize='md'] - Size of the toolbar buttons ('sm', 'md', 'lg')
   * @returns {TemplateResult} Lit template for the alignment toolbar
   */
  toolbarRender: (
    editor: Editor | null,
    toolbarSize?: string
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
 * @param {string} toolbarSize - Size of the toolbar buttons
 * @returns {TemplateResult} Lit template for the alignment toolbar
 */
Alignment.toolbarRender = (editor: Editor | null, toolbarSize = 'md') => {
  const alignmentPopoverRef: Ref<any> = createRef();

  /**
   * Sets the text alignment and closes the popover.
   * @param {string} alignment - The alignment value ('left', 'center', 'right', 'justify')
   * @returns {void}
   */
  const setAlignment = (alignment: string) => {
    editor?.chain().focus().setTextAlign(alignment).run();
    if (alignmentPopoverRef.value) {
      alignmentPopoverRef.value.open = false;
    }
  };

  /**
   * Toggles the alignment popover open/closed state.
   * @returns {void}
   */
  const toggleAlignmentPopover = () => {
    if (alignmentPopoverRef.value) {
      alignmentPopoverRef.value.open = !alignmentPopoverRef.value.open;
    }
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
            ${iconLoader(getCurrentAlignmentIcon(), { slot: 'icon' })}
            <span slot="tooltip-content">Text Alignment</span>
          </cds-icon-button>
          <cds-popover-content slot="content">
            <cds-icon-button
              kind="ghost"
              autoalign
              align="top"
              .size=${toolbarSize as any}
              enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
              leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
              ?disabled=${!editor?.can().setTextAlign('left')}
              ?selected=${editor?.isActive({ textAlign: 'left' })}
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
              ?selected=${editor?.isActive({ textAlign: 'center' })}
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
              ?selected=${editor?.isActive({ textAlign: 'right' })}
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
              ?selected=${editor?.isActive({ textAlign: 'justify' })}
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

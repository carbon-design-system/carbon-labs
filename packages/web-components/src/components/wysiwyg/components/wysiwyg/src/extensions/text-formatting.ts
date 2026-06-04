// TipTap core imports
import { Extension, Mark, mergeAttributes } from '@tiptap/core';
import type { Editor } from '@tiptap/core';

// Lit imports
import { html } from 'lit';
import type { TemplateResult } from 'lit';

// Carbon icons
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';
import TextBold from '@carbon/icons/es/text--bold/16.js';
import TextItalic from '@carbon/icons/es/text--italic/16.js';
import TextUnderline from '@carbon/icons/es/text--underline/16.js';
import TextStrikethrough from '@carbon/icons/es/text--strikethrough/16.js';
import Code from '@carbon/icons/es/code/16.js';

// Carbon components
import '@carbon/web-components/es/components/icon-button/index.js';

// Local imports
import { BASE_CLASS } from '../constants';
import {
  TOOLTIP_ENTER_DELAY_MS,
  TOOLTIP_LEAVE_DELAY_MS,
} from '../constants.js';

// TipTap extensions
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import CodeMark from '@tiptap/extension-code';

/**
 * Custom Delete mark extension for <del> tag.
 */
const Delete = Mark.create({
  name: 'delete',

  parseHTML() {
    return [{ tag: 'del' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['del', mergeAttributes(HTMLAttributes), 0];
  },
});

/**
 * Custom Insert mark extension for <ins> tag.
 */
const InsertMark = Mark.create({
  name: 'insertMark',

  parseHTML() {
    return [{ tag: 'ins' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['ins', mergeAttributes(HTMLAttributes), 0];
  },
});

/**
 * Custom Strike extension configured to use <s> tag only, not <del>.
 */
const StrikeCustom = Strike.extend({
  parseHTML() {
    return [
      { tag: 's' },
      { tag: 'strike' },
      {
        style: 'text-decoration',
        consuming: false,
        /**
         * Gets attributes from style string.
         * @param {string} style - CSS style string
         * @returns {Object | false} Attributes object or false
         */
        getAttrs: (style) =>
          (style as string).includes('line-through') ? {} : false,
      },
    ];
  },
});

/**
 * Interface for the TextFormatting extension with toolbar rendering capability.
 * @extends {Extension<any>}
 */
export interface TextFormattingExtension extends Extension<any> {
  /**
   * Renders the text formatting toolbar controls.
   * @param {Editor | null} editor - The TipTap editor instance
   * @param {string} [toolbarSize='md'] - Size of the toolbar buttons
   * @returns {TemplateResult} Lit template for the text formatting toolbar
   */
  toolbarRender: (
    editor: Editor | null,
    toolbarSize?: string
  ) => TemplateResult;
}

/**
 * TextFormatting extension for basic text formatting (bold, italic, underline, strikethrough, code).
 * Provides toolbar controls for common text formatting options.
 * @type {TextFormattingExtension}
 */
export const TextFormatting = Extension.create({
  name: 'textFormatting',
  /**
   * Adds the text formatting extensions (bold, italic, underline, strike, code).
   * @returns {Array} Array of TipTap extensions
   */
  addExtensions: () => [
    Bold,
    Italic,
    Underline,
    StrikeCustom,
    CodeMark,
    Delete,
    InsertMark,
  ],
}) as unknown as TextFormattingExtension;

/**
 * Renders the text formatting toolbar with formatting controls.
 * @param {Editor | null} editor - The TipTap editor instance
 * @param {string} toolbarSize - Size of the toolbar buttons
 * @returns {TemplateResult} Lit template for the text formatting toolbar
 */
TextFormatting.toolbarRender = (editor: Editor | null, toolbarSize = 'md') => {
  /**
   * Toggles bold formatting.
   * @returns {void}
   */
  const toggleBold = () => {
    editor?.chain().focus().toggleBold().run();
  };

  /**
   * Toggles italic formatting.
   * @returns {void}
   */
  const toggleItalic = () => {
    editor?.chain().focus().toggleItalic().run();
  };

  /**
   * Toggles underline formatting.
   * @returns {void}
   */
  const toggleUnderline = () => {
    editor?.chain().focus().toggleUnderline().run();
  };

  /**
   * Toggles strikethrough formatting.
   * @returns {void}
   */
  const toggleStrike = () => {
    editor?.chain().focus().toggleStrike().run();
  };

  /**
   * Toggles inline code formatting.
   * @returns {void}
   */
  const toggleCode = () => {
    editor?.chain().focus().toggleCode().run();
  };

  return html`
    <div class="${BASE_CLASS}__toolbar-group">
      <cds-icon-button
        kind="ghost"
        autoalign
        align="top"
        .size=${toolbarSize as any}
        enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
        leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
        ?disabled=${!editor?.can().toggleBold()}
        ?selected=${editor?.isActive('bold')}
        @click=${toggleBold}>
        ${iconLoader(TextBold, { slot: 'icon' })}
        <span slot="tooltip-content">Bold</span>
      </cds-icon-button>
      <cds-icon-button
        kind="ghost"
        autoalign
        align="top"
        .size=${toolbarSize as any}
        enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
        leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
        ?disabled=${!editor?.can().toggleItalic()}
        ?selected=${editor?.isActive('italic')}
        @click=${toggleItalic}>
        ${iconLoader(TextItalic, { slot: 'icon' })}
        <span slot="tooltip-content">Italic</span>
      </cds-icon-button>
      <cds-icon-button
        kind="ghost"
        autoalign
        align="top"
        .size=${toolbarSize as any}
        enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
        leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
        ?disabled=${!editor?.can().toggleUnderline()}
        ?selected=${editor?.isActive('underline')}
        @click=${toggleUnderline}>
        ${iconLoader(TextUnderline, { slot: 'icon' })}
        <span slot="tooltip-content">Underline</span>
      </cds-icon-button>
      <cds-icon-button
        kind="ghost"
        autoalign
        align="top"
        .size=${toolbarSize as any}
        enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
        leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
        ?disabled=${!editor?.can().toggleStrike()}
        ?selected=${editor?.isActive('strike')}
        @click=${toggleStrike}>
        ${iconLoader(TextStrikethrough, { slot: 'icon' })}
        <span slot="tooltip-content">Strikethrough</span>
      </cds-icon-button>
      <cds-icon-button
        kind="ghost"
        autoalign
        align="top"
        .size=${toolbarSize as any}
        enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
        leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
        ?disabled=${!editor?.can().toggleCode()}
        ?selected=${editor?.isActive('code')}
        @click=${toggleCode}>
        ${iconLoader(Code, { slot: 'icon' })}
        <span slot="tooltip-content">Code</span>
      </cds-icon-button>
    </div>
  `;
};

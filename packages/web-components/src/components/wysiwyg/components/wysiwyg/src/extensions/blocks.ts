// TipTap core imports
import { Extension } from '@tiptap/core';
import type { Editor } from '@tiptap/core';

// Lit imports
import { html } from 'lit';
import type { TemplateResult } from 'lit';

// Carbon icons
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';
import CodeBlock from '@carbon/icons/es/code-block/16.js';
import Quotes from '@carbon/icons/es/quotes/16.js';

// Carbon components
import '@carbon/web-components/es/components/icon-button/index.js';

// Local imports
import { BASE_CLASS } from '../constants';
import {
  TOOLTIP_ENTER_DELAY_MS,
  TOOLTIP_LEAVE_DELAY_MS,
} from '../constants.js';

// TipTap extensions
import TiptapCodeBlock from '@tiptap/extension-code-block';
import TiptapBlockquote from '@tiptap/extension-blockquote';
import { Node, mergeAttributes } from '@tiptap/core';
import { TextSelection } from '@tiptap/pm/state';

/**
 * Custom Cite node for blockquote citations.
 * Creates a <cite> element that can be used within blockquotes.
 */
const Cite = Node.create({
  name: 'cite',
  group: 'block',
  content: 'inline*',
  defining: true,

  parseHTML() {
    return [{ tag: 'cite' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['cite', mergeAttributes(HTMLAttributes), 0];
  },

  addKeyboardShortcuts() {
    return {
      /**
       * Handles Enter key to exit cite element.
       * @returns {boolean} True if the command was handled
       */
      Enter: () => {
        // Exit cite on Enter
        const { state, dispatch } = this.editor.view;
        const { $from } = state.selection;

        if ($from.parent.type.name === 'cite') {
          const tr = state.tr;
          const pos = $from.after();
          tr.insert(pos, state.schema.nodes.paragraph.create());
          const resolvedPos = tr.doc.resolve(pos + 1);
          tr.setSelection(TextSelection.near(resolvedPos));
          dispatch(tr);
          return true;
        }
        return false;
      },
    };
  },
});

/**
 * Custom Blockquote extension with cite support.
 * Extends the default TipTap blockquote to support nested cite elements.
 */
const Blockquote = TiptapBlockquote.extend({
  content: 'block+',

  parseHTML() {
    return [
      {
        tag: 'blockquote',
        preserveWhitespace: 'full',
      },
    ];
  },
});

/**
 * Interface for the Blocks extension with toolbar rendering capability.
 * @extends {Extension<any>}
 */
export interface BlocksExtension extends Extension<any> {
  /**
   * Renders the blocks toolbar controls.
   * @param {Editor | null} editor - The TipTap editor instance
   * @param {string} [toolbarSize='md'] - Size of the toolbar buttons
   * @returns {TemplateResult} Lit template for the blocks toolbar
   */
  toolbarRender: (
    editor: Editor | null,
    toolbarSize?: string
  ) => TemplateResult;
}

/**
 * Blocks extension for code blocks and blockquotes.
 * Provides toolbar controls for inserting code blocks and blockquotes.
 * @type {BlocksExtension}
 */
export const Blocks = Extension.create({
  name: 'blocks',
  /**
   * Adds the code block, blockquote, and cite extensions.
   * @returns {Array} Array of TipTap extensions
   */
  addExtensions: () => [TiptapCodeBlock, Blockquote, Cite],
}) as unknown as BlocksExtension;

/**
 * Renders the blocks toolbar with code block and blockquote controls.
 * @param {Editor | null} editor - The TipTap editor instance
 * @param {string} toolbarSize - Size of the toolbar buttons
 * @returns {TemplateResult} Lit template for the blocks toolbar
 */
Blocks.toolbarRender = (editor: Editor | null, toolbarSize = 'md') => {
  /**
   * Toggles code block formatting.
   * @returns {void}
   */
  const toggleCodeBlock = () => {
    editor?.chain().focus().toggleCodeBlock().run();
  };

  /**
   * Toggles blockquote formatting.
   * @returns {void}
   */
  const toggleBlockquote = () => {
    editor?.chain().focus().toggleBlockquote().run();
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
        ?disabled=${!editor?.can().toggleCodeBlock()}
        ?selected=${editor?.isActive('codeBlock')}
        @click=${toggleCodeBlock}>
        ${iconLoader(CodeBlock, { slot: 'icon' })}
        <span slot="tooltip-content">Code Block</span>
      </cds-icon-button>
      <cds-icon-button
        kind="ghost"
        autoalign
        align="top"
        .size=${toolbarSize as any}
        enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
        leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
        ?disabled=${!editor?.can().toggleBlockquote()}
        ?selected=${editor?.isActive('blockquote')}
        @click=${toggleBlockquote}>
        ${iconLoader(Quotes, { slot: 'icon' })}
        <span slot="tooltip-content">Blockquote</span>
      </cds-icon-button>
    </div>
  `;
};

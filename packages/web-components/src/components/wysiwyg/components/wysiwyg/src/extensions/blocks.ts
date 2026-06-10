/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Extension } from '@tiptap/core';
import type { Editor } from '@tiptap/core';
import { html } from 'lit';
import type { TemplateResult } from 'lit';
import CodeBlock from '@carbon/icons/es/code-block/16.js';
import Quotes from '@carbon/icons/es/quotes/16.js';
import '@carbon/web-components/es/components/icon-button/index.js';
import { BASE_CLASS } from '../constants.js';
import type { ToolbarSize } from '../types.js';
import { iconButton } from './button-helper.js';
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
       * Exits cite blocks on Enter by inserting a paragraph after the cite node.
       * @returns {boolean} Whether the shortcut was handled
       */
      Enter: () => {
        const { state, dispatch } = this.editor.view;
        const { $from } = state.selection;

        if ($from.parent.type.name !== 'cite') {
          return false;
        }

        const pos = $from.after();
        const tr = state.tr.insert(pos, state.schema.nodes.paragraph.create());
        tr.setSelection(TextSelection.near(tr.doc.resolve(pos + 1)));
        dispatch(tr);
        return true;
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
    return [{ tag: 'blockquote', preserveWhitespace: 'full' }];
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
   * @param {ToolbarSize} [toolbarSize='md'] - Size of the toolbar buttons
   * @returns {TemplateResult} Lit template for the blocks toolbar
   */
  toolbarRender: (
    editor: Editor | null,
    toolbarSize?: ToolbarSize
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
 * @param {ToolbarSize} toolbarSize - Size of the toolbar buttons
 * @returns {TemplateResult} Lit template for the blocks toolbar
 */
Blocks.toolbarRender = (
  editor: Editor | null,
  toolbarSize: ToolbarSize = 'md'
) => html`
  <div class="${BASE_CLASS}__toolbar-group">
    ${iconButton(
      CodeBlock,
      () => editor?.chain().focus().toggleCodeBlock().run(),
      toolbarSize,
      {
        disabled: !editor?.can().toggleCodeBlock(),
        selected: editor?.isActive('codeBlock'),
        tooltip: 'Code Block',
      }
    )}
    ${iconButton(
      Quotes,
      () => editor?.chain().focus().toggleBlockquote().run(),
      toolbarSize,
      {
        disabled: !editor?.can().toggleBlockquote(),
        selected: editor?.isActive('blockquote'),
        tooltip: 'Blockquote',
      }
    )}
  </div>
`;

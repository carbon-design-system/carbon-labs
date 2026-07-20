/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Extension } from '@tiptap/core';
import type { Editor } from '@tiptap/core';
import { html } from 'lit';
import Copy from '@carbon/icons/es/copy/16.js';
import Cut from '@carbon/icons/es/cut/16.js';
import Paste from '@carbon/icons/es/paste/16.js';
import '@carbon/web-components/es/components/icon-button/index.js';
import { BASE_CLASS } from '../constants.js';
import type { ExtensionWithToolbar, ToolbarSize } from '../types.js';
import { iconButton } from './button-helper.js';

export const Clipboard = Extension.create({
  name: 'clipboard',
}) as unknown as ExtensionWithToolbar;

/**
 * Returns the currently selected text in the editor.
 * @param {Editor | null} editor - The TipTap editor instance
 * @returns {string} Selected text, or empty string
 */
const selectedText = (editor: Editor | null): string => {
  if (!editor) {
    return '';
  }
  const { from, to } = editor.state.selection;
  return editor.state.doc.textBetween(from, to, ' ');
};

/**
 * Renders the clipboard toolbar with copy, cut, and paste controls.
 * @param {Editor | null} editor - The TipTap editor instance
 * @param {ToolbarSize} toolbarSize - Size of the toolbar buttons
 */
Clipboard.toolbarRender = (
  editor: Editor | null,
  toolbarSize: ToolbarSize = 'md'
) => html`
  <div class="${BASE_CLASS}__toolbar-group">
    ${iconButton(
      Copy,
      () => {
        const text = selectedText(editor);
        if (text) {
          navigator.clipboard.writeText(text);
        }
      },
      toolbarSize,
      { tooltip: 'Copy' }
    )}
    ${iconButton(
      Cut,
      async () => {
        const text = selectedText(editor);
        if (text) {
          await navigator.clipboard.writeText(text);
          editor?.chain().focus().deleteSelection().run();
        }
      },
      toolbarSize,
      { tooltip: 'Cut' }
    )}
    ${iconButton(
      Paste,
      async () => {
        const text = await navigator.clipboard.readText();
        editor?.chain().focus().insertContent(text).run();
      },
      toolbarSize,
      { tooltip: 'Paste' }
    )}
  </div>
`;

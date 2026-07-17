/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Extension } from '@tiptap/core';
import type { Editor } from '@tiptap/core';
import { html } from 'lit';
import Undo from '@carbon/icons/es/undo/16.js';
import Redo from '@carbon/icons/es/redo/16.js';
import '@carbon/web-components/es/components/icon-button/index.js';
import { BASE_CLASS } from '../constants.js';
import type { ExtensionWithToolbar, ToolbarSize } from '../types.js';
import { cmdButton } from './button-helper.js';
import { history, undo, redo } from '@tiptap/pm/history';

export const History = Extension.create({
  name: 'history',

  /** Registers the ProseMirror history plugin */
  addProseMirrorPlugins() {
    return [history()];
  },

  /** Adds undo and redo commands */
  addCommands() {
    return {
      /** Undo command */
      undo:
        () =>
        ({ state, dispatch }) =>
          undo(state, dispatch),
      /** Redo command */
      redo:
        () =>
        ({ state, dispatch }) =>
          redo(state, dispatch),
    } as any;
  },

  /** Registers keyboard shortcuts for undo and redo */
  addKeyboardShortcuts() {
    return {
      /** Undo */
      'Mod-z': () => (this.editor.commands as any).undo(),
      /** Redo */
      'Mod-y': () => (this.editor.commands as any).redo(),
      /** Redo (macOS) */
      'Shift-Mod-z': () => (this.editor.commands as any).redo(),
    };
  },
}) as unknown as ExtensionWithToolbar;

/**
 * Renders the history toolbar with undo and redo controls.
 * @param {Editor | null} editor - The TipTap editor instance
 * @param {ToolbarSize} toolbarSize - Size of the toolbar buttons
 */
History.toolbarRender = (
  editor: Editor | null,
  toolbarSize: ToolbarSize = 'md'
) => html`
  <div class="${BASE_CLASS}__toolbar-group">
    ${cmdButton(Undo, editor, 'undo', toolbarSize, { tooltip: 'Undo' })}
    ${cmdButton(Redo, editor, 'redo', toolbarSize, { tooltip: 'Redo' })}
  </div>
`;

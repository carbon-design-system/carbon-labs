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

// Carbon icons
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';
import Undo from '@carbon/icons/es/undo/16.js';
import Redo from '@carbon/icons/es/redo/16.js';

// Carbon components
import '@carbon/web-components/es/components/icon-button/index.js';

// Local imports
import { BASE_CLASS } from '../constants.js';
import type { ToolbarSize } from '../types.js';
import {
  TOOLTIP_ENTER_DELAY_MS,
  TOOLTIP_LEAVE_DELAY_MS,
} from '../constants.js';

// ProseMirror history plugin
import { history, undo, redo } from '@tiptap/pm/history';

/**
 * Interface for the History extension with toolbar rendering capability.
 * @extends {Extension<any>}
 */
export interface HistoryExtension extends Extension<any> {
  /**
   * Renders the history toolbar controls.
   * @param {Editor | null} editor - The TipTap editor instance
   * @param {ToolbarSize} [toolbarSize='md'] - Size of the toolbar buttons
   * @returns {TemplateResult} Lit template for the history toolbar
   */
  toolbarRender?: (
    editor: Editor | null,
    toolbarSize?: ToolbarSize
  ) => TemplateResult;
}

/**
 * History extension for undo/redo operations.
 * Provides toolbar controls for undo and redo actions.
 * @type {HistoryExtension}
 */
export const History = Extension.create({
  name: 'history',

  /**
   * Registers the ProseMirror history plugin.
   * @returns Array containing the history plugin.
   */
  addProseMirrorPlugins() {
    return [history()];
  },

  /**
   * Adds undo and redo commands to the editor.
   * @returns Command definitions for undo and redo.
   */
  addCommands() {
    return {
      /**
       * Reverts the most recent change.
       * @returns True if the operation was applied.
       */
      undo:
        () =>
        ({ state, dispatch }) => {
          return undo(state, dispatch);
        },
      /**
       * Reapplies the most recently undone change.
       * @returns True if the operation was applied.
       */
      redo:
        () =>
        ({ state, dispatch }) => {
          return redo(state, dispatch);
        },
    } as any;
  },

  /**
   * Registers keyboard shortcuts for undo and redo operations.
   * @returns Mapping of keyboard shortcuts to command handlers.
   */
  addKeyboardShortcuts() {
    return {
      /** Undo */
      'Mod-z': () => (this.editor.commands as any).undo(),
      /** Redo */
      'Mod-y': () => (this.editor.commands as any).redo(),
      /** Redo (macOS convention) */
      'Shift-Mod-z': () => (this.editor.commands as any).redo(),
    };
  },
}) as unknown as HistoryExtension;

/**
 * Renders the history toolbar with undo and redo controls.
 * @param {Editor | null} editor - The TipTap editor instance
 * @param {ToolbarSize} toolbarSize - Size of the toolbar buttons
 * @returns {TemplateResult} Lit template for the history toolbar
 */
History.toolbarRender = (
  editor: Editor | null,
  toolbarSize: ToolbarSize = 'md'
) => {
  /**
   * Executes undo command.
   * @returns {void}
   */
  const undo = () => {
    (editor as any)?.chain().focus().undo().run();
  };

  /**
   * Executes redo command.
   * @returns {void}
   */
  const redo = () => {
    (editor as any)?.chain().focus().redo().run();
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
        ?disabled=${!(editor as any)?.can().undo()}
        @click=${undo}>
        ${iconLoader(Undo, { slot: 'icon' })}
        <span slot="tooltip-content">Undo</span>
      </cds-icon-button>
      <cds-icon-button
        kind="ghost"
        autoalign
        align="top"
        .size=${toolbarSize as any}
        enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
        leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
        ?disabled=${!(editor as any)?.can().redo()}
        @click=${redo}>
        ${iconLoader(Redo, { slot: 'icon' })}
        <span slot="tooltip-content">Redo</span>
      </cds-icon-button>
    </div>
  `;
};

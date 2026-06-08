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
import Copy from '@carbon/icons/es/copy/16.js';
import Cut from '@carbon/icons/es/cut/16.js';
import Paste from '@carbon/icons/es/paste/16.js';

// Carbon components
import '@carbon/web-components/es/components/icon-button/index.js';

// Local imports
import { BASE_CLASS } from '../constants.js';
import type { ToolbarSize } from '../types.js';
import {
  TOOLTIP_ENTER_DELAY_MS,
  TOOLTIP_LEAVE_DELAY_MS,
} from '../constants.js';

/**
 * Interface for the Clipboard extension with toolbar rendering capability.
 * @extends {Extension<any>}
 */
export interface ClipboardExtension extends Extension<any> {
  /**
   * Renders the clipboard toolbar controls.
   * @param {Editor | null} editor - The TipTap editor instance
   * @param {ToolbarSize} [toolbarSize='md'] - Size of the toolbar buttons
   * @returns {TemplateResult} Lit template for the clipboard toolbar
   */
  toolbarRender: (
    editor: Editor | null,
    toolbarSize?: ToolbarSize
  ) => TemplateResult;
}

/**
 * Clipboard extension for copy, cut, and paste operations.
 * Provides toolbar controls for clipboard operations.
 * @type {ClipboardExtension}
 */
export const Clipboard = Extension.create({
  name: 'clipboard',

  /**
   * Adds clipboard commands (currently empty).
   * @returns {Object} Empty commands object
   */
  addCommands() {
    return {};
  },
}) as unknown as ClipboardExtension;

/**
 * Renders the clipboard toolbar with copy, cut, and paste controls.
 * @param {Editor | null} editor - The TipTap editor instance
 * @param {ToolbarSize} toolbarSize - Size of the toolbar buttons
 * @returns {TemplateResult} Lit template for the clipboard toolbar
 */
Clipboard.toolbarRender = (
  editor: Editor | null,
  toolbarSize: ToolbarSize = 'md'
) => {
  /**
   * Copies selected text to clipboard.
   * @returns {void}
   */
  const copyToClipboard = () => {
    if (editor) {
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to, ' ');
      navigator.clipboard.writeText(text);
    }
  };

  /**
   * Cuts selected text to clipboard and deletes it from editor.
   * @returns {Promise<void>}
   */
  const cutToClipboard = async () => {
    if (editor) {
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to, ' ');
      await navigator.clipboard.writeText(text);
      editor.chain().focus().deleteSelection().run();
    }
  };

  /**
   * Pastes text from clipboard into editor.
   * @returns {Promise<void>}
   */
  const pasteFromClipboard = async () => {
    if (editor) {
      const text = await navigator.clipboard.readText();
      editor.chain().focus().insertContent(text).run();
    }
  };

  return html`
    <div class="${BASE_CLASS}__toolbar-group">
      <cds-icon-button
        @click=${copyToClipboard}
        align="top"
        kind="ghost"
        autoalign
        .size=${toolbarSize as any}
        enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
        leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}">
        ${iconLoader(Copy, { slot: 'icon' })}
        <span slot="tooltip-content">Copy</span>
      </cds-icon-button>
      <cds-icon-button
        @click=${cutToClipboard}
        align="top"
        kind="ghost"
        autoalign
        .size=${toolbarSize as any}
        enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
        leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}">
        ${iconLoader(Cut, { slot: 'icon' })}
        <span slot="tooltip-content">Cut</span>
      </cds-icon-button>
      <cds-icon-button
        @click=${pasteFromClipboard}
        align="top"
        kind="ghost"
        autoalign
        .size=${toolbarSize as any}
        enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
        leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}">
        ${iconLoader(Paste, { slot: 'icon' })}
        <span slot="tooltip-content">Paste</span>
      </cds-icon-button>
    </div>
  `;
};

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
import { BASE_CLASS } from '../constants';
import {
  TOOLTIP_ENTER_DELAY_MS,
  TOOLTIP_LEAVE_DELAY_MS,
} from '../constants.js';

/**
 * Interface for the History extension with toolbar rendering capability.
 * @extends {Extension<any>}
 */
export interface HistoryExtension extends Extension<any> {
  /**
   * Renders the history toolbar controls.
   * @param {Editor | null} editor - The TipTap editor instance
   * @param {string} [toolbarSize='md'] - Size of the toolbar buttons
   * @returns {TemplateResult} Lit template for the history toolbar
   */
  toolbarRender?: (
    editor: Editor | null,
    toolbarSize?: string
  ) => TemplateResult;
}

/**
 * History extension for undo/redo operations.
 * Provides toolbar controls for undo and redo actions.
 * @type {HistoryExtension}
 */
export const History = Extension.create({
  name: 'history',
}) as unknown as HistoryExtension;

/**
 * Renders the history toolbar with undo and redo controls.
 * @param {Editor | null} editor - The TipTap editor instance
 * @param {string} toolbarSize - Size of the toolbar buttons
 * @returns {TemplateResult} Lit template for the history toolbar
 */
History.toolbarRender = (editor: Editor | null, toolbarSize = 'md') => {
  /**
   * Executes undo command.
   * @returns {void}
   */
  const undo = () => {
    editor?.chain().focus().undo().run();
  };

  /**
   * Executes redo command.
   * @returns {void}
   */
  const redo = () => {
    editor?.chain().focus().redo().run();
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
        ?disabled=${!editor?.can().undo()}
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
        ?disabled=${!editor?.can().redo()}
        @click=${redo}>
        ${iconLoader(Redo, { slot: 'icon' })}
        <span slot="tooltip-content">Redo</span>
      </cds-icon-button>
    </div>
  `;
};

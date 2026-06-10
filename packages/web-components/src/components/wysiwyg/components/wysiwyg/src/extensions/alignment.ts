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
import { createRef, ref } from 'lit/directives/ref.js';
import TextAlignLeft from '@carbon/icons/es/text--align--left/16.js';
import TextAlignCenter from '@carbon/icons/es/text--align--center/16.js';
import TextAlignRight from '@carbon/icons/es/text--align--right/16.js';
import TextAlignJustify from '@carbon/icons/es/text--align--justify/16.js';
import '@carbon/web-components/es/components/icon-button/index.js';
import '@carbon/web-components/es/components/popover/index.js';
import '@carbon/web-components/es/components/layer/index.js';
import { BASE_CLASS } from '../constants.js';
import type { ToolbarSize } from '../types.js';
import { iconButton } from './button-helper.js';
import {
  setupPopoverContent,
  togglePopover,
  closePopover,
} from './popover-utils.js';
import '../roving-tabindex.js';
import TextAlign from '@tiptap/extension-text-align';

const styles = `
  .${BASE_CLASS}__alignment-popover-content[open]::part(content) {
    display: flex;
  }
`;

/**
 * Interface for the Alignment extension with toolbar rendering capability.
 * @extends {Extension<any>}
 */
export interface AlignmentExtension extends Extension<any> {
  /**
   * Renders the alignment toolbar controls.
   * @param {Editor | null} editor - The TipTap editor instance
   * @param {ToolbarSize} [toolbarSize='md'] - Size of the toolbar buttons
   * @returns {TemplateResult} Lit template for the alignment toolbar
   */
  toolbarRender: (
    editor: Editor | null,
    toolbarSize?: ToolbarSize
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
 * @param {ToolbarSize} toolbarSize - Size of the toolbar buttons
 * @returns {TemplateResult} Lit template for the alignment toolbar
 */
Alignment.toolbarRender = (
  editor: Editor | null,
  toolbarSize: ToolbarSize = 'md'
) => {
  const popover = createRef<any>();
  /**
   * Set alignment and close popover
   * @param {string} alignment - Alignment value
   */
  const set = (alignment: string) => {
    editor?.chain().focus().setTextAlign(alignment).run();
    closePopover(popover);
    (editor as any)?.component?.requestUpdate?.();
  };

  const icon = editor?.isActive({ textAlign: 'center' })
    ? TextAlignCenter
    : editor?.isActive({ textAlign: 'right' })
      ? TextAlignRight
      : editor?.isActive({ textAlign: 'justify' })
        ? TextAlignJustify
        : TextAlignLeft;

  return html`
    <style>
      ${styles}
    </style>
    <div class="${BASE_CLASS}__toolbar-group">
      <cds-layer>
        <cds-popover ${ref(popover)} tabtip align="bottom" autoalign>
          ${iconButton(icon, () => togglePopover(popover), toolbarSize, {
            disabled: !editor?.can().setTextAlign('left'),
            tooltip: 'Text Alignment',
            caret: true,
            iconTabIndex: '-1',
          })}
          <cds-popover-content
            slot="content"
            class="${BASE_CLASS}__alignment-popover-content"
            ${ref(setupPopoverContent)}>
            <clabs-roving-tabindex>
              ${iconButton(TextAlignLeft, () => set('left'), toolbarSize, {
                disabled: !editor?.can().setTextAlign('left'),
                selected: editor?.isActive({ textAlign: 'left' }),
                tooltip: 'Align Left',
              })}
              ${iconButton(TextAlignCenter, () => set('center'), toolbarSize, {
                disabled: !editor?.can().setTextAlign('center'),
                selected: editor?.isActive({ textAlign: 'center' }),
                tooltip: 'Align Center',
              })}
              ${iconButton(TextAlignRight, () => set('right'), toolbarSize, {
                disabled: !editor?.can().setTextAlign('right'),
                selected: editor?.isActive({ textAlign: 'right' }),
                tooltip: 'Align Right',
              })}
              ${iconButton(
                TextAlignJustify,
                () => set('justify'),
                toolbarSize,
                {
                  disabled: !editor?.can().setTextAlign('justify'),
                  selected: editor?.isActive({ textAlign: 'justify' }),
                  tooltip: 'Justify',
                }
              )}
            </clabs-roving-tabindex>
          </cds-popover-content>
        </cds-popover>
      </cds-layer>
    </div>
  `;
};

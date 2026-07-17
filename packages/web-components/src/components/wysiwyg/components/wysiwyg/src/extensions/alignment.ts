/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Extension } from '@tiptap/core';
import type { Editor } from '@tiptap/core';
import { html } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import TextAlignLeft from '@carbon/icons/es/text--align--left/16.js';
import TextAlignCenter from '@carbon/icons/es/text--align--center/16.js';
import TextAlignRight from '@carbon/icons/es/text--align--right/16.js';
import TextAlignJustify from '@carbon/icons/es/text--align--justify/16.js';
import '@carbon/web-components/es/components/icon-button/index.js';
import '@carbon/web-components/es/components/popover/index.js';
import '@carbon/web-components/es/components/layer/index.js';
import { BASE_CLASS } from '../constants.js';
import type { ExtensionWithToolbar, ToolbarSize } from '../types.js';
import { cmdButton, iconButton } from './button-helper.js';
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

const ALIGNMENTS = [
  ['left', TextAlignLeft, 'Align Left'],
  ['center', TextAlignCenter, 'Align Center'],
  ['right', TextAlignRight, 'Align Right'],
  ['justify', TextAlignJustify, 'Justify'],
] as const;

/**
 * Alignment extension for text alignment controls (left, center, right, justify).
 * Provides a toolbar with a popover containing alignment options.
 */
export const Alignment = Extension.create({
  name: 'alignment',
  /** Adds the TextAlign extension with configured alignment options */
  addExtensions: () => [
    TextAlign.configure({
      types: ['heading', 'paragraph'],
      alignments: ALIGNMENTS.map(([alignment]) => alignment),
      defaultAlignment: 'left',
    }),
  ],
}) as unknown as ExtensionWithToolbar;

/**
 * Renders the alignment toolbar with popover controls.
 * @param {Editor | null} editor - The TipTap editor instance
 * @param {ToolbarSize} toolbarSize - Size of the toolbar buttons
 */
Alignment.toolbarRender = (
  editor: Editor | null,
  toolbarSize: ToolbarSize = 'md'
) => {
  const popover = createRef<any>();
  /** Close popover and re-render toolbar to reflect the new alignment */
  const onDone = () => {
    closePopover(popover);
    (editor as any)?.component?.requestUpdate?.();
  };

  const [, icon] =
    ALIGNMENTS.find(([alignment]) =>
      editor?.isActive({ textAlign: alignment })
    ) ?? ALIGNMENTS[0];

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
              ${ALIGNMENTS.map(([alignment, icon, tooltip]) =>
                cmdButton(icon, editor, 'setTextAlign', toolbarSize, {
                  args: [alignment],
                  active: { textAlign: alignment },
                  tooltip,
                  onDone,
                })
              )}
            </clabs-roving-tabindex>
          </cds-popover-content>
        </cds-popover>
      </cds-layer>
    </div>
  `;
};

/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Extension } from '@tiptap/core';
import type { Editor } from '@tiptap/core';
import { html } from 'lit';
import '@carbon/web-components/es/components/dropdown/index.js';
import { BASE_CLASS } from '../constants.js';
import type { ExtensionWithToolbar, ToolbarSize } from '../types.js';
import {
  FontSize as TiptapFontSize,
  TextStyle,
} from '@tiptap/extension-text-style';

const FONT_SIZES = [
  '12px',
  '14px',
  '16px',
  '18px',
  '20px',
  '24px',
  '28px',
  '32px',
];

const DEFAULT_FONT_SIZE = '16px';

const styles = `
  .${BASE_CLASS}__toolbar-group--font-size {
    min-inline-size: 6.5rem;
  }

  .${BASE_CLASS}__toolbar-group--font-size cds-dropdown {
    inline-size: 100%;
    --cds-border-strong: transparent;
    --cds-border-subtle: transparent;
  }
`;

export const FontSize = Extension.create({
  name: 'clabsFontSize',
  /** Adds TextStyle and TipTap FontSize */
  addExtensions: () => [
    TextStyle,
    TiptapFontSize.configure({ types: ['textStyle'] }),
  ],
}) as unknown as ExtensionWithToolbar;

/**
 * Renders the font size toolbar dropdown.
 * @param {Editor | null} editor - The TipTap editor instance
 * @param {ToolbarSize} toolbarSize - Size of the toolbar buttons
 */
FontSize.toolbarRender = (
  editor: Editor | null,
  toolbarSize: ToolbarSize = 'md'
) => {
  const currentSize =
    editor?.getAttributes('textStyle').fontSize ?? DEFAULT_FONT_SIZE;

  return html`
    <style>
      ${styles}
    </style>
    <div
      class="${BASE_CLASS}__toolbar-group ${BASE_CLASS}__toolbar-group--font-size">
      <cds-dropdown
        label="Font size"
        hide-label
        autoalign
        title-text="Select font size"
        .size=${toolbarSize as any}
        .value=${currentSize}
        @cds-dropdown-selected=${(e: CustomEvent) => {
          const fontSize = e.detail.item.value;
          editor?.chain().focus().setFontSize(fontSize).run();
        }}>
        ${FONT_SIZES.map(
          (size) => html`
            <cds-dropdown-item value=${size}>${size}</cds-dropdown-item>
          `
        )}
      </cds-dropdown>
    </div>
  `;
};

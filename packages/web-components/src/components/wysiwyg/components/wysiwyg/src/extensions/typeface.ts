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
import '@carbon/web-components/es/components/dropdown/index.js';
import { BASE_CLASS } from '../constants.js';
import type { ToolbarSize } from '../types.js';
import { FontFamily } from '@tiptap/extension-font-family';
import { TextStyle } from '@tiptap/extension-text-style';

const FONT_FAMILIES = [
  'IBM Plex Sans',
  'IBM Plex Serif',
  'IBM Plex Mono',
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Courier New',
];

const DEFAULT_FONT = FONT_FAMILIES[0];

const styles = `
  .${BASE_CLASS}__toolbar-group--typeface {
    flex: 1;
  }
  
  .${BASE_CLASS}__toolbar-group--typeface cds-dropdown {
    inline-size: 100%;
    --cds-border-strong: transparent;
  }
`;

export interface TypefaceExtension extends Extension<any> {
  toolbarRender: (
    editor: Editor | null,
    toolbarSize?: ToolbarSize
  ) => TemplateResult;
}

export const Typeface = Extension.create({
  name: 'typeface',
  /** Adds the font family extensions */
  addExtensions: () => [
    TextStyle,
    FontFamily.configure({ types: ['textStyle'] }),
  ],
}) as unknown as TypefaceExtension;

/**
 * Renders the typeface toolbar with font family dropdown.
 * @param {Editor | null} editor - The TipTap editor instance
 * @param {ToolbarSize} toolbarSize - Size of the toolbar buttons
 */
Typeface.toolbarRender = (
  editor: Editor | null,
  toolbarSize: ToolbarSize = 'md'
) => {
  const currentFont =
    editor?.getAttributes('textStyle').fontFamily?.replace(/['"]/g, '') ??
    DEFAULT_FONT;

  return html`
    <style>
      ${styles}
    </style>
    <div
      class="${BASE_CLASS}__toolbar-group ${BASE_CLASS}__toolbar-group--typeface">
      <cds-dropdown
        label="Font"
        hide-label
        title-text="Select font family"
        .size=${toolbarSize as any}
        .value=${currentFont}
        @cds-dropdown-selected=${(e: CustomEvent) => {
          const fontFamily = e.detail.item.value;
          editor?.chain().focus().setFontFamily(fontFamily).run();
          (e.currentTarget as HTMLElement).style.fontFamily = fontFamily;
        }}
        style="font-family: ${currentFont}">
        ${FONT_FAMILIES.map(
          (font) => html`
            <cds-dropdown-item value=${font} style="font-family: ${font}">
              ${font}
            </cds-dropdown-item>
          `
        )}
      </cds-dropdown>
    </div>
  `;
};

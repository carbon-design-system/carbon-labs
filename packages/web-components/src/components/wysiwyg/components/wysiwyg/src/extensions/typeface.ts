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

// Carbon components
import '@carbon/web-components/es/components/dropdown/index.js';

// Local imports
import { BASE_CLASS } from '../constants.js';
import type { ToolbarSize } from '../types.js';

// TipTap extensions
import { FontFamily } from '@tiptap/extension-font-family';
import { TextStyle } from '@tiptap/extension-text-style';

/**
 * Available font families for the typeface selector.
 * @constant
 */
const FONT_FAMILIES = [
  'IBM Plex Sans',
  'IBM Plex Serif',
  'IBM Plex Mono',
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Courier New',
];

/**
 * Default font family.
 * @constant
 */
const DEFAULT_FONT = FONT_FAMILIES[0];

// Styles
const styles = `
  .${BASE_CLASS}__toolbar-group--typeface {
    flex: 1;
  }
  
  .${BASE_CLASS}__toolbar-group--typeface cds-dropdown {
    inline-size: 100%;
    --cds-border-strong: transparent;
  }
`;

/**
 * Gets the current font family from the editor.
 * @param {Editor | null} editor - The TipTap editor instance
 * @returns {string} Current font family name
 */
const getCurrentFont = (editor: Editor | null) => {
  const fontFamily = editor?.getAttributes('textStyle').fontFamily;
  return fontFamily?.replace(/['"]/g, '') || DEFAULT_FONT;
};

/**
 * Handles font family change from dropdown.
 * @param {Editor | null} editor - The TipTap editor instance
 * @param {any} e - Change event
 * @returns {void}
 */
const handleFontChange = (editor: Editor | null, e: any) => {
  if (!editor) {
    return;
  }
  const fontFamily = e.detail.item.value;
  editor.chain().focus().setFontFamily(fontFamily).run();
  e.currentTarget.style.fontFamily = fontFamily;
};

/**
 * Interface for the Typeface extension with toolbar rendering capability.
 * @extends {Extension<any>}
 */
export interface TypefaceExtension extends Extension<any> {
  /**
   * Renders the typeface toolbar controls.
   * @param {Editor | null} editor - The TipTap editor instance
   * @param {ToolbarSize} [toolbarSize='md'] - Size of the toolbar buttons
   * @returns {TemplateResult} Lit template for the typeface toolbar
   */
  toolbarRender: (
    editor: Editor | null,
    toolbarSize?: ToolbarSize
  ) => TemplateResult;
}

/**
 * Typeface extension for font family selection.
 * Provides a dropdown for selecting font families.
 * @type {TypefaceExtension}
 */
export const Typeface = Extension.create({
  name: 'typeface',
  /**
   * Adds the font family extensions.
   * @returns {Array} Array of TipTap extensions
   */
  addExtensions: () => [
    TextStyle,
    FontFamily.configure({ types: ['textStyle'] }),
  ],
}) as unknown as TypefaceExtension;

/**
 * Renders the typeface toolbar with font family dropdown.
 * @param {Editor | null} editor - The TipTap editor instance
 * @param {ToolbarSize} toolbarSize - Size of the toolbar buttons
 * @returns {TemplateResult} Lit template for the typeface toolbar
 */
Typeface.toolbarRender = (
  editor: Editor | null,
  toolbarSize: ToolbarSize = 'md'
) => {
  const currentFont = getCurrentFont(editor);

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
        @cds-dropdown-selected=${(e: any) => handleFontChange(editor, e)}
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

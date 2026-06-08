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
import Heading from '@tiptap/extension-heading';
import HardBreak from '@tiptap/extension-hard-break';
import HorizontalRule from '@tiptap/extension-horizontal-rule';

/**
 * Available typography options (paragraph and heading levels).
 * @constant
 */
const TYPOGRAPHY_OPTIONS = [
  { value: 'p', label: 'Paragraph' },
  { value: 'h1', label: 'Heading 1' },
  { value: 'h2', label: 'Heading 2' },
  { value: 'h3', label: 'Heading 3' },
  { value: 'h4', label: 'Heading 4' },
  { value: 'h5', label: 'Heading 5' },
  { value: 'h6', label: 'Heading 6' },
];

// Styles
const styles = `
  .${BASE_CLASS}__toolbar-group--typography {
    flex: 1;
  }
  
  .${BASE_CLASS}__toolbar-group--typography cds-dropdown {
    inline-size: 100%;
    --cds-border-strong: transparent;
  }
`;

/**
 * Gets the current typography level from the editor.
 * @param {Editor | null} editor - The TipTap editor instance
 * @returns {string} Current level ('p' or 'h1'-'h6')
 */
const getCurrentLevel = (editor: Editor | null) => {
  if (editor?.isActive('heading', { level: 1 })) {
    return 'h1';
  }
  if (editor?.isActive('heading', { level: 2 })) {
    return 'h2';
  }
  if (editor?.isActive('heading', { level: 3 })) {
    return 'h3';
  }
  if (editor?.isActive('heading', { level: 4 })) {
    return 'h4';
  }
  if (editor?.isActive('heading', { level: 5 })) {
    return 'h5';
  }
  if (editor?.isActive('heading', { level: 6 })) {
    return 'h6';
  }
  return 'p';
};

/**
 * Handles typography level change from dropdown.
 * @param {Editor | null} editor - The TipTap editor instance
 * @param {any} e - Change event
 * @returns {void}
 */
const handleTypographyChange = (editor: Editor | null, e: any) => {
  if (!editor) {
    return;
  }
  const value = e.detail.item.value;

  if (value === 'p') {
    editor.chain().focus().setParagraph().run();
  } else {
    const level = parseInt(value.replace('h', ''));
    editor
      .chain()
      .focus()
      .setHeading({ level: level as any })
      .run();
  }
};

/**
 * Interface for the Typography extension with toolbar rendering capability.
 * @extends {Extension<any>}
 */
export interface TypographyExtension extends Extension<any> {
  /**
   * Renders the typography toolbar controls.
   * @param {Editor | null} editor - The TipTap editor instance
   * @param {ToolbarSize} [toolbarSize='md'] - Size of the toolbar buttons
   * @returns {TemplateResult} Lit template for the typography toolbar
   */
  toolbarRender: (
    editor: Editor | null,
    toolbarSize?: ToolbarSize
  ) => TemplateResult;
}

/**
 * Typography extension for paragraph and heading levels.
 * Provides a dropdown for selecting typography levels (paragraph, h1-h6).
 * @type {TypographyExtension}
 */
export const Typography = Extension.create({
  name: 'typography',
  /**
   * Adds heading and related typography extensions.
   * Note: Document, Paragraph, and Text extensions are internally included by the component. since they are mandatory.
   * @returns {Array} Array of TipTap extensions
   */
  addExtensions: () => [
    Heading.configure({
      levels: [1, 2, 3, 4, 5, 6],
    }),
    HardBreak,
    HorizontalRule,
  ],
}) as unknown as TypographyExtension;

/**
 * Renders the typography toolbar with level dropdown.
 * @param {Editor | null} editor - The TipTap editor instance
 * @param {ToolbarSize} toolbarSize - Size of the toolbar buttons
 * @returns {TemplateResult} Lit template for the typography toolbar
 */
Typography.toolbarRender = (
  editor: Editor | null,
  toolbarSize: ToolbarSize = 'md'
) => {
  const currentLevel = getCurrentLevel(editor);

  return html`
    <style>
      ${styles}
    </style>
    <div
      class="${BASE_CLASS}__toolbar-group ${BASE_CLASS}__toolbar-group--typography">
      <cds-dropdown
        label="Typography"
        hide-label
        title-text="Select typography level"
        .size=${toolbarSize as any}
        .value=${currentLevel}
        @cds-dropdown-selected=${(e: any) => handleTypographyChange(editor, e)}>
        ${TYPOGRAPHY_OPTIONS.map(
          (option) => html`
            <cds-dropdown-item value=${option.value}>
              ${option.label}
            </cds-dropdown-item>
          `
        )}
      </cds-dropdown>
    </div>
  `;
};

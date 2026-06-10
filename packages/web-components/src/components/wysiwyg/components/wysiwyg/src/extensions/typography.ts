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
import Heading from '@tiptap/extension-heading';
import HardBreak from '@tiptap/extension-hard-break';
import HorizontalRule from '@tiptap/extension-horizontal-rule';

const TYPOGRAPHY_OPTIONS = [
  { value: 'p', label: 'Paragraph' },
  { value: 'h1', label: 'Heading 1' },
  { value: 'h2', label: 'Heading 2' },
  { value: 'h3', label: 'Heading 3' },
  { value: 'h4', label: 'Heading 4' },
  { value: 'h5', label: 'Heading 5' },
  { value: 'h6', label: 'Heading 6' },
];

const styles = `
  .${BASE_CLASS}__toolbar-group--typography {
    flex: 1;
  }
  
  .${BASE_CLASS}__toolbar-group--typography cds-dropdown {
    inline-size: 100%;
    --cds-border-strong: transparent;
  }
`;

export interface TypographyExtension extends Extension<any> {
  toolbarRender: (
    editor: Editor | null,
    toolbarSize?: ToolbarSize
  ) => TemplateResult;
}

export const Typography = Extension.create({
  name: 'typography',
  /**
   * Adds heading and related typography extensions.
   * Note: Document, Paragraph, and Text extensions are internally included by the component.
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
 */
Typography.toolbarRender = (
  editor: Editor | null,
  toolbarSize: ToolbarSize = 'md'
) => {
  const currentLevel = [1, 2, 3, 4, 5, 6].find((level) =>
    editor?.isActive('heading', { level })
  );

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
        .value=${currentLevel ? `h${currentLevel}` : 'p'}
        @cds-dropdown-selected=${(e: CustomEvent) => {
          const value = e.detail.item.value;
          if (value === 'p') {
            editor?.chain().focus().setParagraph().run();
          } else {
            const level = parseInt(value.replace('h', ''), 10);
            editor
              ?.chain()
              .focus()
              .setHeading({ level: level as any })
              .run();
          }
        }}>
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

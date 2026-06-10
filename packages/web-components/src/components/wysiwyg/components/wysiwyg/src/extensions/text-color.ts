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
import TextColorIcon from '@carbon/icons/es/text--color/16.js';
import TextHighlight16 from '@carbon/icons/es/text--highlight/16.js';
import Subtract from '@carbon/icons/es/subtract/16.js';
import Add from '@carbon/icons/es/add/16.js';
import '@carbon/web-components/es/components/button/index.js';
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
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';

const colors = [
  'text-primary',
  'text-secondary',
  'text-placeholder',
  'link-primary',
  'support-info',
  'support-success',
  'support-error',
  'support-warning',
  'support-caution-major',
];

const styles = `
  .${BASE_CLASS}__text-color-boxes {
    display: flex;
    flex-wrap: wrap;
    max-inline-size: calc(var(--cds-spacing-07) * 3 + 2 * var(--cds-spacing-01));
    gap: var(--cds-spacing-01);
    padding: var(--cds-spacing-01);
  }

  .${BASE_CLASS}__text-color[open]::part(content), .${BASE_CLASS}__highlight[open]::part(content) {
    display: flex;
  }
  
  .${BASE_CLASS}__text-color-box {
    inline-size: var(--cds-spacing-07);
    block-size: var(--cds-spacing-07);
    cursor: pointer;
  }
`;

export interface TextColorExtension extends Extension<any> {
  toolbarRender: (
    editor: Editor | null,
    toolbarSize?: ToolbarSize
  ) => TemplateResult;
}

export const TextColor = Extension.create({
  name: 'textColor',
  /**
   * Adds the text color and highlight extensions.
   * Note: TextStyle is provided by the Typeface extension to avoid duplication.
   * Note: Del and Ins marks are provided by the TextFormatting extension.
   */
  addExtensions: () => [
    Color,
    Highlight.configure({
      multicolor: false,
    }),
  ],
}) as unknown as TextColorExtension;

/**
 * Renders the text color toolbar with color picker and text decoration controls.
 * @param {Editor | null} editor - The TipTap editor instance
 * @param {ToolbarSize} toolbarSize - Size of the toolbar buttons
 */
TextColor.toolbarRender = (
  editor: Editor | null,
  toolbarSize: ToolbarSize = 'md'
) => {
  const colorPopover = createRef<any>();
  const highlightPopover = createRef<any>();
  const color =
    editor?.getAttributes('textStyle')?.color || 'var(--cds-text-primary)';
  const disabled = !editor?.can().setColor('#000000');
  const icon = disabled
    ? TextColorIcon
    : {
        ...TextColorIcon,
        content: TextColorIcon.content.map((item: any, i: number) =>
          i === TextColorIcon.content.length - 1
            ? { ...item, attrs: { ...item.attrs, fill: color } }
            : item
        ),
      };

  return html`
    <style>
      ${styles}
    </style>
    <div class="${BASE_CLASS}__toolbar-group">
      <cds-layer>
        <cds-popover ${ref(colorPopover)} tabtip align="bottom-end" autoalign>
          ${iconButton(icon, () => togglePopover(colorPopover), toolbarSize, {
            disabled,
            tooltip: 'Text Color',
            caret: true,
            iconTabIndex: '-1',
          })}
          <cds-popover-content slot="content" class="${BASE_CLASS}__text-color">
            <div class="${BASE_CLASS}__text-color-boxes">
              ${colors.map(
                (color) => html`
                  <div
                    class="${BASE_CLASS}__text-color-box"
                    style="background-color: var(--cds-${color})"
                    title="${color}"
                    @click=${() => {
                      editor
                        ?.chain()
                        .focus()
                        .setColor(`var(--cds-${color})`)
                        .run();
                      closePopover(colorPopover);
                    }}></div>
                `
              )}
            </div>
          </cds-popover-content>
        </cds-popover>
        <cds-popover
          ${ref(highlightPopover)}
          tabtip
          align="bottom-end"
          autoalign>
          ${iconButton(
            TextHighlight16,
            () => togglePopover(highlightPopover),
            toolbarSize,
            {
              disabled: !editor?.can().toggleHighlight(),
              tooltip: 'Highlight',
              caret: true,
            }
          )}
          <cds-popover-content
            slot="content"
            ${ref(setupPopoverContent)}
            class="${BASE_CLASS}__highlight">
            <clabs-roving-tabindex>
              ${iconButton(
                TextHighlight16,
                () => {
                  editor?.chain().focus().toggleHighlight().run();
                  closePopover(highlightPopover);
                },
                toolbarSize,
                {
                  disabled: !editor?.can().toggleHighlight(),
                  selected: editor?.isActive('highlight'),
                  tooltip: 'Mark',
                }
              )}
              ${iconButton(
                Subtract,
                () => {
                  editor?.chain().focus().toggleMark('deleteMark').run();
                  closePopover(highlightPopover);
                },
                toolbarSize,
                {
                  disabled: !editor?.can().toggleMark('deleteMark'),
                  selected: editor?.isActive('deleteMark'),
                  tooltip: 'Delete',
                }
              )}
              ${iconButton(
                Add,
                () => {
                  editor?.chain().focus().toggleMark('insertMark').run();
                  closePopover(highlightPopover);
                },
                toolbarSize,
                {
                  disabled: !editor?.can().toggleMark('insertMark'),
                  selected: editor?.isActive('insertMark'),
                  tooltip: 'Insert',
                }
              )}
            </clabs-roving-tabindex>
          </cds-popover-content>
        </cds-popover>
      </cds-layer>
    </div>
  `;
};

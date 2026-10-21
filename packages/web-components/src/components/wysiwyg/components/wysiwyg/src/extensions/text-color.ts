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
import TextColorIcon from '@carbon/icons/es/text--color/16.js';
import TextHighlight16 from '@carbon/icons/es/text--highlight/16.js';
import Subtract from '@carbon/icons/es/subtract/16.js';
import Add from '@carbon/icons/es/add/16.js';
import CheckmarkFilled from '@carbon/icons/es/checkmark--filled/16.js';
import '@carbon/web-components/es/components/button/index.js';
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
  .${BASE_CLASS}__text-color[open]::part(content) {
    display: grid;
    gap: var(--cds-spacing-01);
    grid-template-columns: repeat(3, 1fr);
    padding: var(--cds-spacing-01);
  }

  .${BASE_CLASS}__highlight[open]::part(content) {
    display: flex;
  }

  .${BASE_CLASS}__text-color-swatch::part(button) {
    background-color: var(--${BASE_CLASS}-swatch);
  }

  .${BASE_CLASS}__text-color-swatch--selected::part(button) {
    border: 1px solid var(--cds-border-inverse);
    background-clip: padding-box;
    box-shadow: inset 0 0 0 1px var(--cds-background);
  }

  .${BASE_CLASS}__text-color-swatch svg {
    opacity: 0;
  }

  .${BASE_CLASS}__text-color-swatch--selected svg {
    opacity: 1;
    color: var(--cds-background);
    fill: currentColor;
  }

  .${BASE_CLASS}__text-color-swatch--selected svg [data-icon-path='inner-path'] {
    fill: var(--cds-border-inverse);
    opacity: 1;
  }
`;

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
}) as unknown as ExtensionWithToolbar;

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
  /** Closes the highlight popover */
  const closeHighlight = () => closePopover(highlightPopover);
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
          <cds-popover-content
            slot="content"
            class="${BASE_CLASS}__text-color"
            ${ref(setupPopoverContent)}>
            <clabs-roving-tabindex>
              ${colors.map((token) => {
                const value = `var(--cds-${token})`;
                return iconButton(
                  CheckmarkFilled,
                  () => {
                    editor?.chain().focus().setColor(value).run();
                    closePopover(colorPopover);
                  },
                  toolbarSize,
                  {
                    tooltip: token.replace(/-/g, ' '),
                    selected: color === value,
                    className: `${BASE_CLASS}__text-color-swatch${
                      color === value
                        ? ` ${BASE_CLASS}__text-color-swatch--selected`
                        : ''
                    }`,
                    style: `--${BASE_CLASS}-swatch: var(--cds-${token})`,
                  }
                );
              })}
            </clabs-roving-tabindex>
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
              ${cmdButton(
                TextHighlight16,
                editor,
                'toggleHighlight',
                toolbarSize,
                {
                  active: 'highlight',
                  tooltip: 'Mark',
                  onDone: closeHighlight,
                }
              )}
              ${cmdButton(Subtract, editor, 'toggleMark', toolbarSize, {
                args: ['deleteMark'],
                active: 'deleteMark',
                tooltip: 'Delete',
                onDone: closeHighlight,
              })}
              ${cmdButton(Add, editor, 'toggleMark', toolbarSize, {
                args: ['insertMark'],
                active: 'insertMark',
                tooltip: 'Insert',
                onDone: closeHighlight,
              })}
            </clabs-roving-tabindex>
          </cds-popover-content>
        </cds-popover>
      </cds-layer>
    </div>
  `;
};

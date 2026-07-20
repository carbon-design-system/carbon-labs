/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Extension, Mark, mergeAttributes } from '@tiptap/core';
import type { Editor } from '@tiptap/core';
import { html } from 'lit';
import TextBold from '@carbon/icons/es/text--bold/16.js';
import TextItalic from '@carbon/icons/es/text--italic/16.js';
import TextUnderline from '@carbon/icons/es/text--underline/16.js';
import TextStrikethrough from '@carbon/icons/es/text--strikethrough/16.js';
import Code from '@carbon/icons/es/code/16.js';
import '@carbon/web-components/es/components/icon-button/index.js';
import { BASE_CLASS } from '../constants.js';
import type { ExtensionWithToolbar, ToolbarSize } from '../types.js';
import { cmdButton } from './button-helper.js';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import CodeMark from '@tiptap/extension-code';

/** Custom Delete mark extension for <del> tag */
const Delete = Mark.create({
  name: 'deleteMark',

  parseHTML() {
    return [{ tag: 'del' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['del', mergeAttributes(HTMLAttributes), 0];
  },
});

/** Custom Insert mark extension for <ins> tag */
const InsertMark = Mark.create({
  name: 'insertMark',

  parseHTML() {
    return [{ tag: 'ins' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['ins', mergeAttributes(HTMLAttributes), 0];
  },
});

/** Custom Strike extension configured to use <s> tag only, not <del> */
const StrikeCustom = Strike.extend({
  parseHTML() {
    return [
      { tag: 's' },
      { tag: 'strike' },
      {
        style: 'text-decoration',
        consuming: false,
        /**
         * Gets attributes from style string
         * @param {string} style - CSS style string
         */
        getAttrs: (style) =>
          (style as string).includes('line-through') ? {} : false,
      },
    ];
  },
});

export const TextFormatting = Extension.create({
  name: 'textFormatting',
  /** Adds the text formatting extensions (bold, italic, underline, strike, code) */
  addExtensions: () => [
    Bold,
    Italic,
    Underline,
    StrikeCustom,
    CodeMark,
    Delete,
    InsertMark,
  ],
}) as unknown as ExtensionWithToolbar;

const BUTTONS = [
  [TextBold, 'toggleBold', 'bold', 'Bold'],
  [TextItalic, 'toggleItalic', 'italic', 'Italic'],
  [TextUnderline, 'toggleUnderline', 'underline', 'Underline'],
  [TextStrikethrough, 'toggleStrike', 'strike', 'Strikethrough'],
  [Code, 'toggleCode', 'code', 'Code'],
] as const;

/**
 * Renders the text formatting toolbar with formatting controls.
 * @param {Editor | null} editor - The TipTap editor instance
 * @param {ToolbarSize} toolbarSize - Size of the toolbar buttons
 */
TextFormatting.toolbarRender = (
  editor: Editor | null,
  toolbarSize: ToolbarSize = 'md'
) => html`
  <div class="${BASE_CLASS}__toolbar-group">
    ${BUTTONS.map(([icon, cmd, active, tooltip]) =>
      cmdButton(icon, editor, cmd, toolbarSize, { active, tooltip })
    )}
  </div>
`;

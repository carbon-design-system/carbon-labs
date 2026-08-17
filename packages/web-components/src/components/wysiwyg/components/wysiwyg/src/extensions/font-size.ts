/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Extension } from '@tiptap/core';
import type { Editor } from '@tiptap/core';
import type { ExtensionWithToolbar, ToolbarSize } from '../types.js';
import { toolbarMenuButton } from './toolbar-menu-button.js';
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

/**
 * Applies a font size to the current selection.
 * @param {Editor | null} editor - TipTap editor
 * @param {string} fontSize - Font size (e.g. `16px`)
 */
const applyFontSize = (editor: Editor | null, fontSize: string) => {
  editor?.chain().focus().setFontSize(fontSize).run();
};

export const FontSize = Extension.create({
  name: 'clabsFontSize',
  /** Adds TextStyle and TipTap FontSize */
  addExtensions: () => [
    TextStyle,
    TiptapFontSize.configure({ types: ['textStyle'] }),
  ],
}) as unknown as ExtensionWithToolbar;

/**
 * Renders the font size toolbar as a menu button.
 * @param {Editor | null} editor - The TipTap editor instance
 * @param {ToolbarSize} toolbarSize - Size of the toolbar buttons
 * @param {boolean} compact - Whether the toolbar is in the compact layout
 */
FontSize.toolbarRender = (
  editor: Editor | null,
  toolbarSize: ToolbarSize = 'md',
  compact = false
) => {
  const currentSize =
    editor?.getAttributes('textStyle').fontSize || DEFAULT_FONT_SIZE;

  return toolbarMenuButton({
    label: compact ? currentSize.replace(/px$/i, '') : currentSize,
    groupLabel: 'Font size',
    toolbarSize,
    currentValue: currentSize,
    editor,
    options: FONT_SIZES.map((size) => ({ value: size, label: size })),
    grow: false,
    onSelect: applyFontSize.bind(null, editor),
  });
};

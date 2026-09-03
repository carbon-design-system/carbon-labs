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

/**
 * Applies a font family to the current selection.
 * @param {Editor | null} editor - TipTap editor
 * @param {string} fontFamily - Font family name
 */
const applyFontFamily = (editor: Editor | null, fontFamily: string) => {
  editor?.chain().focus().setFontFamily(fontFamily).run();
};

export const Typeface = Extension.create({
  name: 'typeface',
  /** Adds the font family extensions */
  addExtensions: () => [
    TextStyle,
    FontFamily.configure({ types: ['textStyle'] }),
  ],
}) as unknown as ExtensionWithToolbar;

/**
 * Renders the typeface toolbar as a menu button.
 * @param {Editor | null} editor - The TipTap editor instance
 * @param {ToolbarSize} toolbarSize - Size of the toolbar buttons
 * @param {boolean} compact - Whether the toolbar is in the compact layout
 */
Typeface.toolbarRender = (
  editor: Editor | null,
  toolbarSize: ToolbarSize = 'md',
  compact = false
) => {
  const currentFont =
    editor?.getAttributes('textStyle').fontFamily?.replace(/['"]/g, '') ||
    DEFAULT_FONT;

  return toolbarMenuButton({
    label: compact ? 'Family' : currentFont,
    groupLabel: 'Font',
    toolbarSize,
    currentValue: currentFont,
    editor,
    style: compact ? undefined : `font-family: ${currentFont}`,
    options: FONT_FAMILIES.map((font) => ({
      value: font,
      label: font,
      style: `font-family: ${font}`,
    })),
    onSelect: applyFontFamily.bind(null, editor),
  });
};

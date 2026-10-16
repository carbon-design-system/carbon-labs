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

/**
 * Applies a paragraph or heading level to the current selection.
 * @param {Editor | null} editor - TipTap editor
 * @param {string} value - `p` or `h1`–`h6`
 */
const applyTypography = (editor: Editor | null, value: string) => {
  if (value === 'p') {
    editor?.chain().focus().setParagraph().run();
    return;
  }
  editor
    ?.chain()
    .focus()
    .setHeading({ level: parseInt(value.replace('h', ''), 10) as any })
    .run();
};

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
}) as unknown as ExtensionWithToolbar;

/**
 * Renders the typography toolbar as a menu button.
 * @param {Editor | null} editor - The TipTap editor instance
 * @param {ToolbarSize} toolbarSize - Size of the toolbar buttons
 * @param {boolean} compact - Whether the toolbar is in the compact layout
 */
Typography.toolbarRender = (
  editor: Editor | null,
  toolbarSize: ToolbarSize = 'md',
  compact = false
) => {
  const currentLevel = [1, 2, 3, 4, 5, 6].find((level) =>
    editor?.isActive('heading', { level })
  );
  const currentValue = currentLevel ? `h${currentLevel}` : 'p';
  const currentLabel =
    TYPOGRAPHY_OPTIONS.find((option) => option.value === currentValue)?.label ??
    'Paragraph';

  return toolbarMenuButton({
    label: compact ? currentValue.toUpperCase() : currentLabel,
    groupLabel: 'Typography',
    toolbarSize,
    options: TYPOGRAPHY_OPTIONS,
    currentValue,
    editor,
    onSelect: applyTypography.bind(null, editor),
  });
};

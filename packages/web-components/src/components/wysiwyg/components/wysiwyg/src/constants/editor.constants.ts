/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { HeadingLevel, TableOptions } from '../types/editor.types.js';

/**
 * Default editor configuration
 */
export const DEFAULT_EDITOR_CONFIG = {
  orientation: 'horizontal',
  editable: true,
  autofocus: false,
} as const;

/**
 * Supported heading levels
 */
export const HEADING_LEVELS: readonly HeadingLevel[] = [
  1, 2, 3, 4, 5, 6,
] as const;

/**
 * Default table configuration
 */
export const DEFAULT_TABLE_OPTIONS: TableOptions = {
  rows: 3,
  cols: 3,
  withHeaderRow: true,
} as const;

/**
 * Link configuration
 */
export const LINK_CONFIG = {
  openOnClick: false,
  HTMLAttributes: {
    target: '_blank',
    rel: 'noopener noreferrer',
  },
} as const;

/**
 * Image configuration
 */
export const IMAGE_CONFIG = {
  HTMLAttributes: {
    class: 'editor-image',
  },
} as const;

/**
 * Table configuration
 */
export const TABLE_CONFIG = {
  resizable: true,
} as const;

/**
 * Text align configuration
 */
export const TEXT_ALIGN_CONFIG = {
  types: ['heading', 'paragraph'],
};

/**
 * Keyboard navigation keys
 */
export const NAVIGATION_KEYS = {
  horizontal: ['ArrowRight', 'ArrowLeft'],
  vertical: ['ArrowDown', 'ArrowUp'],
  all: ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'],
} as const;

/**
 * Focusable element selectors
 */
export const FOCUSABLE_SELECTORS =
  'cds-icon-button, cds-dropdown, cds-overflow-menu' as const;

/**
 * Tooltip configuration
 */
export const TOOLTIP_CONFIG = {
  enterDelayMs: 100,
  leaveDelayMs: 100,
  align: 'top',
} as const;

/**
 * Modal labels
 */
export const MODAL_LABELS = {
  link: {
    title: 'Insert/Edit Link',
    urlLabel: 'URL',
    urlPlaceholder: 'https://example.com',
    insertButton: 'Insert Link',
    removeButton: 'Remove Link',
  },
  image: {
    title: 'Insert Image',
    urlLabel: 'Image URL',
    urlPlaceholder: 'https://example.com/image.jpg',
    insertButton: 'Insert Image',
    cancelButton: 'Cancel',
  },
} as const;

/**
 * Toolbar button labels
 */
export const TOOLBAR_LABELS = {
  undo: 'Undo',
  redo: 'Redo',
  bold: 'Bold',
  italic: 'Italic',
  underline: 'Underline',
  strikethrough: 'Strikethrough',
  code: 'Code',
  bulletList: 'Bullet List',
  numberedList: 'Numbered List',
  alignLeft: 'Align Left',
  alignCenter: 'Align Center',
  alignRight: 'Align Right',
  blockquote: 'Blockquote',
  codeBlock: 'Code Block',
  insertTable: 'Insert Table',
  insertLink: 'Insert Link',
  insertImage: 'Insert Image',
  tableOptions: 'Table Options',
} as const;

/**
 * Table menu items
 */
export const TABLE_MENU_ITEMS = {
  addColumnBefore: 'Add Column Before',
  addColumnAfter: 'Add Column After',
  deleteColumn: 'Delete Column',
  addRowBefore: 'Add Row Before',
  addRowAfter: 'Add Row After',
  deleteRow: 'Delete Row',
  toggleHeaderRow: 'Toggle Header Row',
  deleteTable: 'Delete Table',
} as const;

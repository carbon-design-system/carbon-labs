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
  inline: true,
  allowBase64: true,
  HTMLAttributes: {
    class: 'editor-image',
  },
  resize: {
    enabled: true,
    directions: [
      'top',
      'bottom',
      'left',
      'right',
      'top-left',
      'top-right',
      'bottom-left',
      'bottom-right',
    ] as any,
    minWidth: 50,
    minHeight: 50,
    alwaysPreserveAspectRatio: true,
  },
};

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
 * Focusable element selectors for toolbar navigation
 */
export const FOCUSABLE_SELECTORS =
  'cds-icon-button, cds-button, cds-dropdown, cds-overflow-menu, cds-search' as const;

/**
 * Tooltip configuration
 */
export const TOOLTIP_CONFIG = {
  enterDelayMs: 100,
  leaveDelayMs: 100,
  align: 'top',
} as const;

/**
 * Popover labels
 */
export const POPOVER_LABELS = {
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
    altLabel: 'Alt Text',
    altPlaceholder: 'Describe the image',
    titleLabel: 'Title',
    titlePlaceholder: 'Image title (optional)',
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
  cut: 'Cut',
  copy: 'Copy',
  paste: 'Paste',
  bold: 'Bold',
  italic: 'Italic',
  underline: 'Underline',
  strikethrough: 'Strikethrough',
  code: 'Code',
  bulletList: 'Bullet List',
  numberedList: 'Numbered List',
  taskList: 'Task List',
  alignLeft: 'Align Left',
  alignCenter: 'Align Center',
  alignRight: 'Align Right',
  alignJustify: 'Justify',
  indent: 'Indent More',
  outdent: 'Indent Less',
  textColor: 'Text Color',
  blockquote: 'Blockquote',
  codeBlock: 'Code Block',
  insertTable: 'Insert Table',
  insertLink: 'Insert Link',
  insertImage: 'Insert Image',
  attachment: 'Attach File',
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

/**
 * Font family options
 */
export const FONT_FAMILIES = [
  { label: 'IBM Plex Sans', value: 'IBM Plex Sans' },
  { label: 'IBM Plex Serif', value: 'IBM Plex Serif' },
  { label: 'IBM Plex Mono', value: 'IBM Plex Mono' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Helvetica', value: 'Helvetica' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Courier New', value: 'Courier New' },
] as const;

/**
 * Font size options (in pixels)
 */
export const FONT_SIZES = [
  { label: 'Small', value: '12px' },
  { label: 'Normal', value: '14px' },
  { label: 'Medium', value: '16px' },
  { label: 'Large', value: '18px' },
  { label: 'Extra Large', value: '24px' },
] as const;

/**
 * Text color options using Carbon theme tokens
 * These tokens automatically adapt to light/dark mode
 */
export const TEXT_COLOR_GROUPS = [
  {
    label: 'Text',
    items: [
      { label: 'Primary Text', token: 'text-primary' },
      { label: 'Secondary Text', token: 'text-secondary' },
      { label: 'Placeholder', token: 'text-placeholder' },
      { label: 'Link', token: 'link-primary' },
    ],
  },
  {
    label: 'Status',
    items: [
      { label: 'Info', token: 'support-info' },
      { label: 'Success', token: 'support-success' },
      { label: 'Error', token: 'support-error' },
      { label: 'Warning', token: 'support-warning' },
      { label: 'Caution', token: 'support-caution-major' },
    ],
  },
] as const;

/**
 * Heading dropdown options
 */
export const HEADING_OPTIONS = [
  { value: 'p', label: 'Paragraph' },
  { value: 'h1', label: 'Heading 1' },
  { value: 'h2', label: 'Heading 2' },
  { value: 'h3', label: 'Heading 3' },
  { value: 'h4', label: 'Heading 4' },
  { value: 'h5', label: 'Heading 5' },
  { value: 'h6', label: 'Heading 6' },
] as const;

/**
 * CSS class names used in the component
 */
export const CSS_CLASSES = {
  editorContainer: 'clabs--wysiwyg__editor-container',
  toolbar: 'clabs--wysiwyg__toolbar',
  toolbarGroup: 'clabs--wysiwyg__toolbar-group',
  editorContent: 'clabs--wysiwyg__editor-content',
  popoverContent: 'clabs--wysiwyg__popover-content',
  popoverActions: 'clabs--wysiwyg__popover-actions',
  attachments: 'clabs--wysiwyg__attachments',
  textColorButton: 'text-color-button',
  toolbarButton: 'clabs--wysiwyg__toolbar-button',
  popoverWrapper: 'clabs--wysiwyg__popover-wrapper',
  proseMirror: 'tiptap.ProseMirror',
} as const;

/**
 * File attachment configuration
 */
export const FILE_ATTACHMENT_CONFIG = {
  attachmentPrefix: 'Attached: ',
} as const;

/**
 * Button configuration for toolbar groups
 * Defines the structure and behavior of toolbar buttons in a data-driven way
 */
export interface ButtonConfig {
  id: string;
  icon: string;
  label: string;
  action: string;
  checkActive?: string;
}

/**
 * Text formatting button configurations
 */
export const TEXT_FORMATTING_BUTTONS: ButtonConfig[] = [
  {
    id: 'bold',
    icon: 'TextBold',
    label: 'Bold',
    action: 'toggleBold',
    checkActive: 'bold',
  },
  {
    id: 'italic',
    icon: 'TextItalic',
    label: 'Italic',
    action: 'toggleItalic',
    checkActive: 'italic',
  },
  {
    id: 'underline',
    icon: 'TextUnderline',
    label: 'Underline',
    action: 'toggleUnderline',
    checkActive: 'underline',
  },
  {
    id: 'strikethrough',
    icon: 'TextStrikethrough',
    label: 'Strikethrough',
    action: 'toggleStrike',
    checkActive: 'strike',
  },
  {
    id: 'code',
    icon: 'Code',
    label: 'Code',
    action: 'toggleCode',
    checkActive: 'code',
  },
] as const;

/**
 * Clipboard button configurations
 */
export const CLIPBOARD_BUTTONS: ButtonConfig[] = [
  { id: 'cut', icon: 'Cut', label: 'Cut', action: 'cut' },
  { id: 'copy', icon: 'Copy', label: 'Copy', action: 'copy' },
  { id: 'paste', icon: 'Paste', label: 'Paste', action: 'paste' },
] as const;

/**
 * List button configurations
 */
export const LIST_BUTTONS: ButtonConfig[] = [
  {
    id: 'bulletList',
    icon: 'ListBulleted',
    label: 'Bullet List',
    action: 'toggleBulletList',
    checkActive: 'bulletList',
  },
  {
    id: 'numberedList',
    icon: 'ListNumbered',
    label: 'Numbered List',
    action: 'toggleOrderedList',
    checkActive: 'orderedList',
  },
  {
    id: 'taskList',
    icon: 'ListChecked',
    label: 'Task List',
    action: 'toggleTaskList',
    checkActive: 'taskList',
  },
  {
    id: 'outdent',
    icon: 'IndentLess',
    label: 'Indent Less',
    action: 'outdent',
  },
  {
    id: 'indent',
    icon: 'IndentMore',
    label: 'Indent More',
    action: 'indent',
  },
] as const;

/**
 * Block button configurations
 */
export const BLOCK_BUTTONS: ButtonConfig[] = [
  {
    id: 'blockquote',
    icon: 'Quotes',
    label: 'Blockquote',
    action: 'toggleBlockquote',
    checkActive: 'blockquote',
  },
  {
    id: 'codeBlock',
    icon: 'CodeBlock',
    label: 'Code Block',
    action: 'toggleCodeBlock',
    checkActive: 'codeBlock',
  },
] as const;

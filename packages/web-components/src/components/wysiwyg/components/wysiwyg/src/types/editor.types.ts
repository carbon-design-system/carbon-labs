/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Editor } from '@tiptap/core';
import type { TemplateResult } from 'lit';

/**
 * Editor orientation for toolbar layout
 */
export type EditorOrientation = 'horizontal' | 'vertical';

/**
 * Heading levels supported by the editor
 */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Text alignment options
 */
export type TextAlignment = 'left' | 'center' | 'right' | 'justify';

/**
 * Editor content change event detail
 */
export interface EditorContentChangeDetail {
  content: string;
  editor: Editor;
}

/**
 * Link attributes for the editor
 */
export interface LinkAttributes {
  href: string;
  target?: string;
  rel?: string;
}

/**
 * Image attributes for the editor
 */
export interface ImageAttributes {
  src: string;
  alt?: string;
  title?: string;
}

/**
 * Table insertion options
 */
export interface TableOptions {
  rows: number;
  cols: number;
  withHeaderRow: boolean;
}

/**
 * Editor configuration options
 */
export interface EditorConfig {
  content?: string;
  orientation?: EditorOrientation;
  editable?: boolean;
  autofocus?: boolean;
}

/**
 * Popover state interface
 */
export interface PopoverState {
  showLinkPopover: boolean;
  showImagePopover: boolean;
  linkUrl: string;
  imageUrl: string;
  imageAlt: string;
  imageTitle: string;
}

/**
 * Built-in toolbar group names
 */
export type BuiltInToolbarGroupName =
  | 'clipboard'
  | 'fontFamily'
  | 'textFormatting'
  | 'headings'
  | 'colorPicker'
  | 'lists'
  | 'alignment'
  | 'blocks'
  | 'insert'
  | 'search'
  | 'tableOperations';

/**
 * Toolbar group configuration with optional item-level control
 */
export interface ToolbarGroup {
  name: BuiltInToolbarGroupName | string;
  enabled?: boolean;
  items?: Record<string, boolean>;
}

/**
 * Toolbar options as an array for controlling order and visibility of groups
 * Can include both built-in toolbar groups and custom toolbar groups
 */
export type ToolbarOptions = (ToolbarGroup | CustomToolbarGroup)[];

/**
 * Custom toolbar item configuration
 * Allows users to add custom buttons or controls to the toolbar
 */
export interface CustomToolbarItem {
  /** Unique identifier for the item */
  id: string;
  /** Render function that returns a Lit template */
  render: (editor: Editor | null) => TemplateResult;
  /** Optional tooltip text */
  tooltip?: string;
}

/**
 * Custom toolbar group configuration
 * Groups custom items together in the toolbar
 * Reference the group by its ID in toolbarOptions to control position
 */
export interface CustomToolbarGroup {
  /** Unique identifier for the group - use this in toolbarOptions array */
  id: string;
  /** Array of custom toolbar items */
  items: CustomToolbarItem[];
}

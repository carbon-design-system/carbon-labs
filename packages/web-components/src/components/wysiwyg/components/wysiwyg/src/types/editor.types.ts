/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Editor } from '@tiptap/core';

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
 * Modal state interface
 */
export interface ModalState {
  showLinkModal: boolean;
  showImageModal: boolean;
  linkUrl: string;
  imageUrl: string;
}

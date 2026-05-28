/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';

import type {
  EditorConfig,
  HeadingLevel,
  TextAlignment,
  LinkAttributes,
  ImageAttributes,
  TableOptions,
} from '../types/editor.types.js';
import {
  HEADING_LEVELS,
  LINK_CONFIG,
  IMAGE_CONFIG,
  TABLE_CONFIG,
  TEXT_ALIGN_CONFIG,
} from '../constants/editor.constants.js';

/**
 * Service class for managing TipTap editor operations
 */
export class EditorService {
  private editor: Editor | null = null;

  /**
   * Initialize the editor with configuration
   * @param {HTMLElement} element - The HTML element to attach the editor to
   * @param {EditorConfig} config - Editor configuration options
   * @param {Function} onUpdate - Callback function called when editor content updates
   * @param {Function} onSelectionUpdate - Callback function called when selection changes
   */
  public initialize(
    element: HTMLElement,
    config: EditorConfig,
    onUpdate: (editor: Editor) => void,
    onSelectionUpdate: () => void
  ): Editor {
    this.editor = new Editor({
      element,
      extensions: this.getExtensions(),
      content: config.content || '',
      editable: config.editable ?? true,
      autofocus: config.autofocus ?? false,
      /**
       * Handle editor update event
       * @param {Object} root0 - Update event object
       * @param {Editor} root0.editor - The editor instance
       */
      onUpdate: ({ editor }) => {
        onUpdate(editor);
      },
      /**
       * Handle selection update event
       */
      onSelectionUpdate: () => {
        onSelectionUpdate();
      },
    });

    return this.editor;
  }

  /**
   * Get configured extensions for the editor
   */
  private getExtensions() {
    return [
      StarterKit.configure({
        heading: {
          levels: [...HEADING_LEVELS],
        },
      }),
      Underline,
      TextStyle,
      Color,
      TextAlign.configure(TEXT_ALIGN_CONFIG),
      Link.configure(LINK_CONFIG),
      Image.configure(IMAGE_CONFIG),
      Table.configure(TABLE_CONFIG),
      TableRow,
      TableHeader,
      TableCell,
    ];
  }

  /**
   * Destroy the editor instance
   */
  public destroy(): void {
    this.editor?.destroy();
    this.editor = null;
  }

  /**
   * Get the current editor instance
   */
  public getEditor(): Editor | null {
    return this.editor;
  }

  /**
   * Check if editor can perform undo
   */
  public canUndo(): boolean {
    return this.editor?.can().undo() ?? false;
  }

  /**
   * Check if editor can perform redo
   */
  public canRedo(): boolean {
    return this.editor?.can().redo() ?? false;
  }

  /**
   * Check if a mark or node is active
   * @param {string} name - The name of the mark or node to check
   * @param {Record<string, any>} attrs - Optional attributes to match
   */
  public isActive(name: string, attrs?: Record<string, any>): boolean {
    return this.editor?.isActive(name, attrs) ?? false;
  }

  /**
   * Toggle bold formatting
   */
  public toggleBold(): void {
    this.editor?.chain().focus().toggleBold().run();
  }

  /**
   * Toggle italic formatting
   */
  public toggleItalic(): void {
    this.editor?.chain().focus().toggleItalic().run();
  }

  /**
   * Toggle underline formatting
   */
  public toggleUnderline(): void {
    this.editor?.chain().focus().toggleUnderline().run();
  }

  /**
   * Toggle strikethrough formatting
   */
  public toggleStrike(): void {
    this.editor?.chain().focus().toggleStrike().run();
  }

  /**
   * Toggle inline code formatting
   */
  public toggleCode(): void {
    this.editor?.chain().focus().toggleCode().run();
  }

  /**
   * Set heading level
   * @param {HeadingLevel} level - The heading level (1, 2, or 3)
   */
  public setHeading(level: HeadingLevel): void {
    this.editor?.chain().focus().toggleHeading({ level }).run();
  }

  /**
   * Set paragraph
   */
  public setParagraph(): void {
    this.editor?.chain().focus().setParagraph().run();
  }

  /**
   * Toggle bullet list
   */
  public toggleBulletList(): void {
    this.editor?.chain().focus().toggleBulletList().run();
  }

  /**
   * Toggle ordered list
   */
  public toggleOrderedList(): void {
    this.editor?.chain().focus().toggleOrderedList().run();
  }

  /**
   * Set text alignment
   * @param {TextAlignment} alignment - The text alignment (left, center, right, or justify)
   */
  public setTextAlign(alignment: TextAlignment): void {
    this.editor?.chain().focus().setTextAlign(alignment).run();
  }

  /**
   * Toggle blockquote
   */
  public toggleBlockquote(): void {
    this.editor?.chain().focus().toggleBlockquote().run();
  }

  /**
   * Toggle code block
   */
  public toggleCodeBlock(): void {
    this.editor?.chain().focus().toggleCodeBlock().run();
  }

  /**
   * Insert table
   * @param {TableOptions} options - Table configuration including rows, cols, and withHeaderRow
   */
  public insertTable(options: TableOptions): void {
    this.editor?.chain().focus().insertTable(options).run();
  }

  /**
   * Set link
   * @param {LinkAttributes} attrs - Link attributes including href, target, and rel
   */
  public setLink(attrs: LinkAttributes): void {
    this.editor?.chain().focus().extendMarkRange('link').setLink(attrs).run();
  }

  /**
   * Unset link
   */
  public unsetLink(): void {
    this.editor?.chain().focus().extendMarkRange('link').unsetLink().run();
  }

  /**
   * Get link attributes
   */
  public getLinkAttributes(): LinkAttributes {
    return this.editor?.getAttributes('link') as LinkAttributes;
  }

  /**
   * Insert image
   * @param {ImageAttributes} attrs - Image attributes including src, alt, and title
   */
  public insertImage(attrs: ImageAttributes): void {
    this.editor?.chain().focus().setImage(attrs).run();
  }

  /**
   * Add column before
   */
  public addColumnBefore(): void {
    this.editor?.chain().focus().addColumnBefore().run();
  }

  /**
   * Add column after
   */
  public addColumnAfter(): void {
    this.editor?.chain().focus().addColumnAfter().run();
  }

  /**
   * Delete column
   */
  public deleteColumn(): void {
    this.editor?.chain().focus().deleteColumn().run();
  }

  /**
   * Add row before
   */
  public addRowBefore(): void {
    this.editor?.chain().focus().addRowBefore().run();
  }

  /**
   * Add row after
   */
  public addRowAfter(): void {
    this.editor?.chain().focus().addRowAfter().run();
  }

  /**
   * Delete row
   */
  public deleteRow(): void {
    this.editor?.chain().focus().deleteRow().run();
  }

  /**
   * Toggle header row
   */
  public toggleHeaderRow(): void {
    this.editor?.chain().focus().toggleHeaderRow().run();
  }

  /**
   * Delete table
   */
  public deleteTable(): void {
    this.editor?.chain().focus().deleteTable().run();
  }

  /**
   * Undo last action
   */
  public undo(): void {
    this.editor?.chain().focus().undo().run();
  }

  /**
   * Redo last undone action
   */
  public redo(): void {
    this.editor?.chain().focus().redo().run();
  }

  /**
   * Get HTML content
   */
  public getHTML(): string {
    return this.editor?.getHTML() ?? '';
  }

  /**
   * Set content
   * @param {string} content - The HTML content to set in the editor
   */
  public setContent(content: string): void {
    this.editor?.commands.setContent(content);
  }
}

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
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { FontFamily } from '@tiptap/extension-font-family';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';

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
        // Configure link through StarterKit with custom options
        link: LINK_CONFIG,
      }),
      TextStyle,
      Color,
      FontFamily,
      TextAlign.configure(TEXT_ALIGN_CONFIG),
      Image.configure(IMAGE_CONFIG),
      Table.configure(TABLE_CONFIG),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
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
   * Execute a toggle command on the editor
   * @param {string} command - The command name to toggle
   */
  private executeToggleCommand(command: string): void {
    this.editor?.chain().focus()[command]().run();
  }

  /**
   * Execute a command with attributes on the editor
   * @param {string} command - The command name to execute
   * @param {any} attrs - The attributes to pass to the command
   */
  private executeCommandWithAttrs(command: string, attrs: any): void {
    this.editor?.chain().focus()[command](attrs).run();
  }

  /** Toggle bold formatting */
  public toggleBold(): void {
    this.executeToggleCommand('toggleBold');
  }

  /** Toggle italic formatting */
  public toggleItalic(): void {
    this.executeToggleCommand('toggleItalic');
  }

  /** Toggle underline formatting */
  public toggleUnderline(): void {
    this.executeToggleCommand('toggleUnderline');
  }

  /** Toggle strikethrough formatting */
  public toggleStrike(): void {
    this.executeToggleCommand('toggleStrike');
  }

  /** Toggle inline code formatting */
  public toggleCode(): void {
    this.executeToggleCommand('toggleCode');
  }

  /**
   * Set heading level
   * @param {HeadingLevel} level - The heading level (1-6)
   */
  public setHeading(level: HeadingLevel): void {
    this.executeCommandWithAttrs('toggleHeading', { level });
  }

  /** Set paragraph */
  public setParagraph(): void {
    this.executeToggleCommand('setParagraph');
  }

  /** Toggle bullet list */
  public toggleBulletList(): void {
    this.executeToggleCommand('toggleBulletList');
  }

  /** Toggle ordered list */
  public toggleOrderedList(): void {
    this.executeToggleCommand('toggleOrderedList');
  }

  /** Toggle task list */
  public toggleTaskList(): void {
    this.executeToggleCommand('toggleTaskList');
  }

  /**
   * Set text alignment
   * @param {TextAlignment} alignment - The text alignment
   */
  public setTextAlign(alignment: TextAlignment): void {
    this.executeCommandWithAttrs('setTextAlign', alignment);
  }

  /** Toggle blockquote */
  public toggleBlockquote(): void {
    this.executeToggleCommand('toggleBlockquote');
  }

  /** Toggle code block */
  public toggleCodeBlock(): void {
    this.executeToggleCommand('toggleCodeBlock');
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

  /** Add column before current column */
  public addColumnBefore(): void {
    this.executeToggleCommand('addColumnBefore');
  }

  /** Add column after current column */
  public addColumnAfter(): void {
    this.executeToggleCommand('addColumnAfter');
  }

  /** Delete current column */
  public deleteColumn(): void {
    this.executeToggleCommand('deleteColumn');
  }

  /** Add row before current row */
  public addRowBefore(): void {
    this.executeToggleCommand('addRowBefore');
  }

  /** Add row after current row */
  public addRowAfter(): void {
    this.executeToggleCommand('addRowAfter');
  }

  /** Delete current row */
  public deleteRow(): void {
    this.executeToggleCommand('deleteRow');
  }

  /** Toggle header row */
  public toggleHeaderRow(): void {
    this.executeToggleCommand('toggleHeaderRow');
  }

  /** Delete table */
  public deleteTable(): void {
    this.executeToggleCommand('deleteTable');
  }

  /** Undo last action */
  public undo(): void {
    this.executeToggleCommand('undo');
  }

  /** Redo last undone action */
  public redo(): void {
    this.executeToggleCommand('redo');
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

  /**
   * Cut selected text to clipboard
   */
  public cut(): void {
    if (this.editor) {
      const { from, to } = this.editor.state.selection;
      const text = this.editor.state.doc.textBetween(from, to, ' ');
      navigator.clipboard.writeText(text);
      this.editor.chain().focus().deleteSelection().run();
    }
  }

  /**
   * Copy selected text to clipboard
   */
  public copy(): void {
    if (this.editor) {
      const { from, to } = this.editor.state.selection;
      const text = this.editor.state.doc.textBetween(from, to, ' ');
      navigator.clipboard.writeText(text);
    }
  }

  /**
   * Paste text from clipboard
   */
  public async paste(): Promise<void> {
    if (this.editor) {
      try {
        const text = await navigator.clipboard.readText();
        this.editor.chain().focus().insertContent(text).run();
      } catch (err) {
        console.error('Failed to paste:', err);
      }
    }
  }

  /** Increase indent */
  public indent(): void {
    this.executeCommandWithAttrs('sinkListItem', 'listItem');
  }

  /** Decrease indent */
  public outdent(): void {
    this.executeCommandWithAttrs('liftListItem', 'listItem');
  }

  /**
   * Set text color
   * @param {string} color - The color value (hex, rgb, etc.)
   */
  public setColor(color: string): void {
    this.executeCommandWithAttrs('setColor', color);
  }

  /** Unset text color */
  public unsetColor(): void {
    this.executeToggleCommand('unsetColor');
  }

  /**
   * Set font family
   * @param {string} fontFamily - The font family name
   */
  public setFontFamily(fontFamily: string): void {
    this.executeCommandWithAttrs('setFontFamily', fontFamily);
  }

  /** Unset font family */
  public unsetFontFamily(): void {
    this.executeToggleCommand('unsetFontFamily');
  }
}

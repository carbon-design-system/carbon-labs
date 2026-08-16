/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Extension } from '@tiptap/core';
import type { Editor } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { html, render } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import Upload from '@carbon/icons/es/upload/16.js';
import '@carbon/web-components/es/components/file-uploader/index.js';
import { BASE_CLASS } from '../constants.js';
import type { ExtensionWithToolbar, ToolbarSize } from '../types.js';
import { iconButton } from './button-helper.js';

/**
 * An attached file stored beside the document HTML.
 */
export interface FileAttachment {
  id: string;
  file: File;
  name: string;
  size: number;
}

/**
 * FileUpload extension with toolbar, attachment strip, and accept filter.
 */
export interface FileUploadExtension extends ExtensionWithToolbar {
  /** Optional `accept` string for the file input (default: any type). */
  accept: string;
}

const styles = `
  .${BASE_CLASS}__file-input {
    position: absolute;
    overflow: hidden;
    block-size: 0;
    inline-size: 0;
    opacity: 0;
  }

  .${BASE_CLASS}__file-strip {
    display: flex;
    flex: none;
    border-block-start: 1px solid var(--cds-border-subtle);
    overflow-x: auto;
  }

  .${BASE_CLASS}__file-strip cds-file-uploader-item {
    margin: 0;
    border-inline-end: 1px solid var(--cds-border-subtle);
    min-inline-size: 14rem;
  }
`;

const strips = new WeakMap<Editor, HTMLDivElement>();
const toolbarSizes = new WeakMap<Editor, ToolbarSize>();

/**
 * Reads attachments from TipTap storage.
 * @param {Editor | null} editor - TipTap editor
 * @returns {FileAttachment[]} Current attachments
 */
const getAttachments = (editor: Editor | null): FileAttachment[] =>
  editor?.storage?.fileUpload?.attachments ?? [];

/**
 * Dispatches `files-change` from the host element.
 * @param {Editor | null} editor - TipTap editor
 */
const dispatchFilesChange = (editor: Editor | null) => {
  const host = (editor as any)?.component as EventTarget | undefined;
  if (!host) {
    return;
  }
  const attachments = getAttachments(editor);
  host.dispatchEvent(
    new CustomEvent('files-change', {
      detail: {
        files: attachments.map((item) => item.file),
        attachments: attachments.map(({ id, name, size }) => ({
          id,
          name,
          size,
        })),
      },
      bubbles: true,
      composed: true,
    })
  );
};

/**
 * Allows dropping files onto a target.
 * @param {DragEvent} event - Drag event
 */
const allowFileDrop = (event: DragEvent) => {
  if (event.dataTransfer?.types.includes('Files')) {
    event.preventDefault();
  }
};

/**
 * Renders or removes the attachment strip below the editor.
 * @param {Editor | null} editor - TipTap editor
 */
const syncStrip = (editor: Editor | null) => {
  const editorDom = editor?.view?.dom;
  const container = editorDom?.closest(`.${BASE_CLASS}__container`);
  if (!editor || !container) {
    return;
  }

  const attachments = getAttachments(editor);
  let strip = strips.get(editor);

  if (!attachments.length) {
    strip?.remove();
    strips.delete(editor);
    return;
  }

  if (!strip) {
    strip = document.createElement('div');
    strip.className = `${BASE_CLASS}__file-strip`;
    /**
     * Allow dropping files onto the strip.
     * @param {DragEvent} event - Dragover event
     */
    strip.addEventListener('dragover', (event) => {
      if (editor.isEditable) {
        allowFileDrop(event);
      }
    });
    /**
     * Attach dropped files.
     * @param {DragEvent} event - Drop event
     */
    strip.addEventListener('drop', (event) => {
      if (!editor.isEditable) {
        return;
      }
      event.preventDefault();
      if (event.dataTransfer?.files?.length) {
        addAttachments(editor, event.dataTransfer.files);
      }
    });
    container.appendChild(strip);
    strips.set(editor, strip);
  }

  const editable = editor.isEditable;
  const toolbarSize = toolbarSizes.get(editor) ?? 'md';

  render(
    html`
      <style>
        ${styles}
      </style>
      ${attachments.map(
        (item) => html`
          <cds-file-uploader-item
            data-attachment-id=${item.id}
            state=${editable ? 'edit' : 'complete'}
            .size=${toolbarSize as any}
            icon-description="Delete file"
            @cds-file-uploader-item-deleted=${() =>
              removeAttachment(editor, item.id)}>
            ${item.name}
          </cds-file-uploader-item>
        `
      )}
    `,
    strip
  );
};

/**
 * Appends files to storage and updates the strip.
 * @param {Editor | null} editor - TipTap editor
 * @param {FileList | File[]} fileList - Files to attach
 */
const addAttachments = (editor: Editor | null, fileList: FileList | File[]) => {
  if (!editor?.isEditable) {
    return;
  }
  const files = Array.from(fileList);
  if (!files.length) {
    return;
  }
  editor.storage.fileUpload.attachments = [
    ...getAttachments(editor),
    ...files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      size: file.size,
    })),
  ];
  dispatchFilesChange(editor);
  syncStrip(editor);
};

/**
 * Removes an attachment by id and updates the strip.
 * @param {Editor | null} editor - TipTap editor
 * @param {string} id - Attachment id
 */
const removeAttachment = (editor: Editor | null, id: string) => {
  if (!editor?.isEditable) {
    return;
  }
  editor.storage.fileUpload.attachments = getAttachments(editor).filter(
    (item) => item.id !== id
  );
  dispatchFilesChange(editor);
  syncStrip(editor);
};

export const FileUpload = Extension.create({
  name: 'fileUpload',
  /** Attachment list stored beside document HTML */
  addStorage: () => ({
    attachments: [] as FileAttachment[],
  }),
  /**
   * Intercepts file drops and keeps the attachment strip in sync.
   * @returns {Plugin[]} ProseMirror plugins
   */
  addProseMirrorPlugins() {
    const editor = this.editor;
    return [
      new Plugin({
        key: new PluginKey('fileUploadDrop'),
        /**
         * Plugin view that owns the attachment strip lifecycle.
         * @returns {{ update: Function, destroy: Function }} Plugin view
         */
        view: () => ({
          /**
           * Re-render the strip when the editor view updates (including readonly).
           */
          update: () => {
            syncStrip(editor);
          },
          /**
           * Remove the strip when the editor is destroyed.
           */
          destroy: () => {
            strips.get(editor)?.remove();
            strips.delete(editor);
          },
        }),
        props: {
          /**
           * Turns dropped files into attachments instead of inserting them.
           * @param {import('@tiptap/pm/view').EditorView} _view - Editor view
           * @param {DragEvent} event - Drop event
           * @returns {boolean} Whether the drop was handled
           */
          handleDrop: (_view, event) => {
            const files = event.dataTransfer?.files;
            if (!files?.length || !editor.isEditable) {
              return false;
            }
            event.preventDefault();
            addAttachments(editor, files);
            return true;
          },
          handleDOMEvents: {
            /**
             * Allows dropping files onto the editor surface.
             * @param {import('@tiptap/pm/view').EditorView} view - Editor view
             * @param {DragEvent} event - Dragover event
             * @returns {boolean} Always false so other handlers can run
             */
            dragover: (view, event) => {
              if (
                view.editable &&
                event.dataTransfer?.types.includes('Files')
              ) {
                event.preventDefault();
              }
              return false;
            },
          },
        },
      }),
    ];
  },
}) as unknown as FileUploadExtension;

FileUpload.accept = '';

/**
 * Renders the upload toolbar control.
 * @param {Editor | null} editor - The TipTap editor instance
 * @param {ToolbarSize} toolbarSize - Size of the toolbar buttons
 */
FileUpload.toolbarRender = (
  editor: Editor | null,
  toolbarSize: ToolbarSize = 'md'
) => {
  const fileInput = createRef<HTMLInputElement>();
  if (editor) {
    toolbarSizes.set(editor, toolbarSize);
    syncStrip(editor);
  }

  return html`
    <style>
      ${styles}
    </style>
    <div class="${BASE_CLASS}__toolbar-group">
      <input
        ${ref(fileInput)}
        class="${BASE_CLASS}__file-input"
        type="file"
        multiple
        accept=${FileUpload.accept || ''}
        @change=${(event: Event) => {
          const input = event.target as HTMLInputElement;
          if (input.files?.length) {
            addAttachments(editor, input.files);
          }
          input.value = '';
        }} />
      ${iconButton(Upload, () => fileInput.value?.click(), toolbarSize, {
        tooltip: 'Upload file',
      })}
    </div>
  `;
};

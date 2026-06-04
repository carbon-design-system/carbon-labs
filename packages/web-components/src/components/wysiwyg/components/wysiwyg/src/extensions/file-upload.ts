// TipTap core imports
import { Extension } from '@tiptap/core';
import type { Editor } from '@tiptap/core';

// Lit imports
import { html, render } from 'lit';
import type { TemplateResult } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';

// Carbon icons
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';
import Upload from '@carbon/icons/es/upload/16.js';

// Carbon components
import '@carbon/web-components/es/components/icon-button/index.js';
import '@carbon/web-components/es/components/file-uploader/index.js';

// Local imports
import { BASE_CLASS } from '../constants';
import {
  TOOLTIP_ENTER_DELAY_MS,
  TOOLTIP_LEAVE_DELAY_MS,
} from '../constants.js';

// Styles
const fileUploaderContainerStyles = `
  display: flex;
  overflow-x: auto;
  flex: none;
  border-block-start: 1px solid var(--cds-border-subtle);
`;

const fileItemStyles = `
  margin: 0;
  border-inline-end: 1px solid var(--cds-border-subtle);
  min-inline-size: 14rem;
`;

const fileInputStyles = `
  visibility: hidden;
  height: 0;
  width: 0;
`;

/**
 * Updates the editor's file list and dispatches content change event.
 * @param {Editor | null} editor - The TipTap editor instance
 * @param {File[]} currentFiles - Array of current files
 * @returns {void}
 */
const updateEditorFiles = (editor: Editor | null, currentFiles: File[]) => {
  if (editor) {
    (editor as any).files = currentFiles;
    (editor as any).component?.dispatchContentChange?.();
  }
};

/**
 * Updates the file input element with the current file list.
 * @param {any} fileInputRef - Reference to the file input element
 * @param {File[]} currentFiles - Array of current files
 * @returns {void}
 */
const updateFileInput = (fileInputRef: any, currentFiles: File[]) => {
  if (fileInputRef.value) {
    const dataTransfer = new DataTransfer();
    currentFiles.forEach((f) => dataTransfer.items.add(f));
    fileInputRef.value.files = dataTransfer.files;
  }
};

/**
 * Interface for the FileUpload extension with toolbar rendering capability.
 * @extends {Extension<any>}
 */
export interface FileUploadExtension extends Extension<any> {
  /**
   * Renders the file upload toolbar controls.
   * @param {Editor | null} editor - The TipTap editor instance
   * @param {string} [toolbarSize='md'] - Size of the toolbar buttons
   * @returns {TemplateResult} Lit template for the file upload toolbar
   */
  toolbarRender: (
    editor: Editor | null,
    toolbarSize?: string
  ) => TemplateResult;
}

/**
 * FileUpload extension for uploading and managing files.
 * Provides toolbar controls for file upload with preview.
 * @type {FileUploadExtension}
 */
export const FileUpload = Extension.create({
  name: 'fileUpload',
}) as unknown as FileUploadExtension;

/**
 * Renders the file upload toolbar with upload button and file list.
 * @param {Editor | null} editor - The TipTap editor instance
 * @param {string} toolbarSize - Size of the toolbar buttons
 * @returns {TemplateResult} Lit template for the file upload toolbar
 */
FileUpload.toolbarRender = (editor: Editor | null, toolbarSize = 'md') => {
  const fileInputRef = createRef<HTMLInputElement>();
  let fileUploaderContainer: HTMLDivElement | null = null;
  let currentFiles: File[] = [];

  /**
   * Handles file deletion from the upload list.
   * @param {File} file - The file to delete
   * @returns {void}
   */
  const handleFileDelete = (file: File) => {
    currentFiles = currentFiles.filter((f) => f !== file);
    updateFileInput(fileInputRef, currentFiles);
    updateEditorFiles(editor, currentFiles);
    renderFileItems();
  };

  /**
   * Renders the file items in the upload container.
   * @returns {void}
   */
  const renderFileItems = () => {
    const editorElement = editor?.view.dom;
    if (!editorElement?.parentElement) {
      return;
    }

    // Exit if no files - remove container if exists
    if (currentFiles.length === 0) {
      fileUploaderContainer?.remove();
      fileUploaderContainer = null;
      return;
    }

    // Create container only once
    if (!fileUploaderContainer) {
      // Find the main container (between outer and inner layer)
      const innerLayer = editorElement.parentElement.closest('cds-layer');
      const mainContainer = innerLayer?.parentElement;

      if (!mainContainer) {
        return;
      }

      fileUploaderContainer = document.createElement('div');
      fileUploaderContainer.className = `${BASE_CLASS}__file-uploader-container`;
      fileUploaderContainer.style.cssText = fileUploaderContainerStyles;

      // Insert after the inner layer
      mainContainer.appendChild(fileUploaderContainer);
    }

    // Render file items into existing container
    const fileItems = currentFiles.map(
      (file) => html`
        <cds-file-uploader-item
          data-filename=${file.name}
          state="edit"
          .size=${toolbarSize as any}
          @cds-file-uploader-item-deleted=${() => handleFileDelete(file)}
          style=${fileItemStyles}>
          ${file.name}
        </cds-file-uploader-item>
      `
    );

    render(html`${fileItems}`, fileUploaderContainer);
  };

  /**
   * Handles file upload from input element.
   * @param {Event} event - The change event from file input
   * @returns {void}
   */
  const handleFileUpload = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (files && files.length > 0) {
      currentFiles = [...currentFiles, ...Array.from(files)];
      updateEditorFiles(editor, currentFiles);
      renderFileItems();
    }
  };

  return html`
    <div class="${BASE_CLASS}__toolbar-group">
      <input
        ${ref(fileInputRef)}
        type="file"
        multiple
        style=${fileInputStyles}
        @change=${handleFileUpload} />
      <cds-icon-button
        kind="ghost"
        autoalign
        align="top"
        .size=${toolbarSize as any}
        enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
        leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
        @click=${() => fileInputRef.value?.click()}>
        ${iconLoader(Upload, { slot: 'icon' })}
        <span slot="tooltip-content">Upload File</span>
      </cds-icon-button>
    </div>
  `;
};

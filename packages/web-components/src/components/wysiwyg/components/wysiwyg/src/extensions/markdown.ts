// TipTap core imports
import { Extension } from '@tiptap/core';
import type { Editor } from '@tiptap/core';

// Lit imports
import { html } from 'lit';
import type { TemplateResult } from 'lit';

// Carbon icons
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';
import View from '@carbon/icons/es/view/16.js';
import Edit from '@carbon/icons/es/edit/16.js';

// Carbon components
import '@carbon/web-components/es/components/icon-button/index.js';

// Local imports
import { BASE_CLASS } from '../constants';
import {
  TOOLTIP_ENTER_DELAY_MS,
  TOOLTIP_LEAVE_DELAY_MS,
} from '../constants.js';

// TipTap extensions
import { Markdown as TiptapMarkdown } from '@tiptap/markdown';

// Styles
const markdownContainerStyles = `
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const markdownTextareaStyles = `
  flex: 1;
  padding: 12px;
  border: none;
  outline: none;
  resize: none;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
  background: transparent;
  color: var(--cds-text-primary);
`;

/**
 * Creates a markdown editor textarea for markdown editing.
 * @param {any} storage - Extension storage object
 * @param {Element} _container - Container element (unused)
 * @param {Element} editorDiv - Editor div element to hide
 * @returns {void}
 */
const createMarkdownEditor = (
  storage: any,
  _container: Element,
  editorDiv: Element
) => {
  const markdownContainer = document.createElement('div');
  markdownContainer.className = 'markdown-editor';
  markdownContainer.style.cssText = markdownContainerStyles;

  const textarea = document.createElement('textarea');
  textarea.className = 'markdown-textarea';
  textarea.value = storage.markdown.markdownContent;
  textarea.style.cssText = markdownTextareaStyles;

  textarea.addEventListener('input', () => {
    storage.markdown.markdownContent = textarea.value;
  });

  markdownContainer.appendChild(textarea);
  editorDiv.parentElement?.insertBefore(markdownContainer, editorDiv);
  (editorDiv as HTMLElement).style.display = 'none';
};

/**
 * Removes the markdown editor and restores the rich text editor.
 * @param {Editor} editor - The TipTap editor instance
 * @param {any} storage - Extension storage object
 * @param {Element} container - Container element
 * @returns {void}
 */
const removeMarkdownEditor = (
  editor: Editor,
  storage: any,
  container: Element
) => {
  const markdownEditor = container?.querySelector('.markdown-editor');
  const textarea = markdownEditor?.querySelector(
    '.markdown-textarea'
  ) as HTMLTextAreaElement;
  const editorDiv = container?.querySelector(`.${BASE_CLASS}__editor`);

  if (textarea) {
    const latestMarkdown = textarea.value;
    storage.markdown.markdownContent = latestMarkdown;
    try {
      (editor.commands as any).setContent(latestMarkdown, {
        contentType: 'markdown',
        emitUpdate: true,
      });
    } catch (error) {
      console.error('Error parsing markdown:', error);
      try {
        editor.commands.setContent(latestMarkdown);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    }
  }

  if (markdownEditor) {
    markdownEditor.remove();
  }

  if (editorDiv) {
    (editorDiv as HTMLElement).style.display = '';
  }
};

/**
 * Interface for the Markdown extension with toolbar rendering capability.
 * @extends {Extension<any>}
 */
export interface MarkdownExtension extends Extension<any> {
  /**
   * Renders the markdown mode toolbar controls.
   * @param {Editor | null} editor - The TipTap editor instance
   * @param {string} [toolbarSize='md'] - Size of the toolbar buttons
   * @returns {TemplateResult} Lit template for the markdown toolbar
   */
  toolbarRender: (
    editor: Editor | null,
    toolbarSize?: string
  ) => TemplateResult;
}

/**
 * Markdown extension for toggling between rich text and markdown editing.
 * Provides a toolbar button to switch between visual and markdown editing modes.
 * @type {MarkdownExtension}
 */
export const Markdown = Extension.create({
  name: 'markdown',
  addExtensions() {
    return [TiptapMarkdown];
  },
  addStorage() {
    return {
      isMarkdownMode: false,
      markdownContent: '',
    };
  },
  onCreate() {
    const editor = this.editor;
    const component = (editor as any).component;

    if (component) {
      component.dispatchContentChange = function () {
        if (this.editor) {
          this.content = this.editor.getHTML();

          // Get markdown content using the editor's getMarkdown method
          let markdown = '';
          try {
            markdown = (this.editor as any).getMarkdown();
          } catch (error) {
            console.error('Error getting markdown:', error);
          }

          this.dispatchEvent(
            new CustomEvent('content-change', {
              detail: {
                content: this.content,
                markdown: markdown,
              },
              bubbles: true,
              composed: true,
            })
          );
        }
      };
    }
  },
}) as unknown as MarkdownExtension;

/**
 * Renders the markdown mode toggle toolbar button.
 * @param {Editor | null} editor - The TipTap editor instance
 * @param {string} toolbarSize - Size of the toolbar buttons
 * @returns {TemplateResult} Lit template for the markdown toolbar
 */
Markdown.toolbarRender = (editor: Editor | null, toolbarSize = 'md') => {
  const storage = editor?.storage as any;
  const isMarkdownMode = storage?.markdown?.isMarkdownMode || false;

  /**
   * Toggles between markdown source and rich text editing modes.
   * @returns {void}
   */
  const toggleMarkdownMode = () => {
    if (!editor) {
      return;
    }

    const storage = editor.storage as any;
    const currentMode = storage.markdown.isMarkdownMode;
    storage.markdown.isMarkdownMode = !currentMode;

    const component = (editor as any).component;
    if (component) {
      if (!currentMode) {
        // Switching to markdown mode
        // Get current content as markdown
        try {
          storage.markdown.markdownContent = (editor as any).getMarkdown();
        } catch (error) {
          console.error('Error getting markdown:', error);
          storage.markdown.markdownContent = '';
        }

        // Add markdown textarea to the component
        const container = component.shadowRoot?.querySelector(
          `.${BASE_CLASS}__container`
        );
        if (container && !container.querySelector('.markdown-editor')) {
          const editorDiv = container.querySelector(`.${BASE_CLASS}__editor`);
          if (editorDiv) {
            createMarkdownEditor(storage, container, editorDiv);
          }
        }
      } else {
        // Switching back to editor mode
        const container = component.shadowRoot?.querySelector(
          `.${BASE_CLASS}__container`
        );
        if (container) {
          removeMarkdownEditor(editor, storage, container);
        }
      }

      component.requestUpdate();
    }
  };

  return html`
    <div class="${BASE_CLASS}__toolbar-group">
      <cds-icon-button
        kind="ghost"
        autoalign
        align="top"
        .size=${toolbarSize as any}
        enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
        leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
        ?isselected=${isMarkdownMode}
        @click=${toggleMarkdownMode}>
        ${iconLoader(isMarkdownMode ? Edit : View, { slot: 'icon' })}
        <span slot="tooltip-content"
          >${isMarkdownMode ? 'Rich Text Mode' : 'Markdown Mode'}</span
        >
      </cds-icon-button>
    </div>
  `;
};

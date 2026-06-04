// TipTap core imports
import { Extension } from '@tiptap/core';
import type { Editor } from '@tiptap/core';

// Lit imports
import { html } from 'lit';
import type { TemplateResult } from 'lit';

// Carbon icons
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';
import Code from '@carbon/icons/es/code/16.js';
import Edit from '@carbon/icons/es/edit/16.js';

// Carbon components
import '@carbon/web-components/es/components/icon-button/index.js';

// HTML formatter
import { html as beautifyHtml } from 'js-beautify';

// Local imports
import { BASE_CLASS } from '../constants';
import {
  TOOLTIP_ENTER_DELAY_MS,
  TOOLTIP_LEAVE_DELAY_MS,
} from '../constants.js';

// Styles
const htmlContainerStyles = `
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const htmlTextareaStyles = `
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
 * Creates an HTML editor textarea for raw HTML editing.
 * @param {any} storage - Extension storage object
 * @param {Element} _container - Container element (unused)
 * @param {Element} editorDiv - Editor div element to hide
 * @returns {void}
 */
const createHtmlEditor = (
  storage: any,
  _container: Element,
  editorDiv: Element
) => {
  const htmlContainer = document.createElement('div');
  htmlContainer.className = 'html-editor';
  htmlContainer.style.cssText = htmlContainerStyles;

  const textarea = document.createElement('textarea');
  textarea.className = 'html-textarea';
  // Format the HTML before displaying using js-beautify
  textarea.value = beautifyHtml(storage.html.htmlContent, {
    indent_size: 2,
    indent_char: ' ',
    max_preserve_newlines: 1,
    preserve_newlines: true,
    wrap_line_length: 0,
    wrap_attributes: 'auto',
    unformatted: [],
    content_unformatted: ['pre', 'textarea'],
    indent_inner_html: true,
    indent_scripts: 'normal',
    end_with_newline: false,
  });
  textarea.style.cssText = htmlTextareaStyles;

  textarea.addEventListener('input', () => {
    storage.html.htmlContent = textarea.value;
  });

  htmlContainer.appendChild(textarea);
  editorDiv.parentElement?.insertBefore(htmlContainer, editorDiv);
  (editorDiv as HTMLElement).style.display = 'none';
};

/**
 * Removes the HTML editor and restores the rich text editor.
 * @param {Editor} editor - The TipTap editor instance
 * @param {any} storage - Extension storage object
 * @param {Element} container - Container element
 * @returns {void}
 */
const removeHtmlEditor = (editor: Editor, storage: any, container: Element) => {
  const htmlEditor = container?.querySelector('.html-editor');
  const textarea = htmlEditor?.querySelector(
    '.html-textarea'
  ) as HTMLTextAreaElement;
  const editorDiv = container?.querySelector(`.${BASE_CLASS}__editor`);

  if (textarea) {
    const latestHtml = textarea.value;
    storage.html.htmlContent = latestHtml;
    try {
      editor.commands.setContent(latestHtml, {
        emitUpdate: true,
      });
    } catch (error) {
      console.error('Error parsing HTML:', error);
    }
  }

  if (htmlEditor) {
    htmlEditor.remove();
  }

  if (editorDiv) {
    (editorDiv as HTMLElement).style.display = '';
  }
};

/**
 * Interface for the Html extension with toolbar rendering capability.
 * @extends {Extension<any>}
 */
export interface HtmlExtension extends Extension<any> {
  /**
   * Renders the HTML mode toolbar controls.
   * @param {Editor | null} editor - The TipTap editor instance
   * @param {string} [toolbarSize='md'] - Size of the toolbar buttons
   * @returns {TemplateResult} Lit template for the HTML toolbar
   */
  toolbarRender: (
    editor: Editor | null,
    toolbarSize?: string
  ) => TemplateResult;
}

/**
 * Html extension for toggling between rich text and HTML source editing.
 * Provides a toolbar button to switch between visual and HTML editing modes.
 * @type {HtmlExtension}
 */
export const Html = Extension.create({
  name: 'html',
  addStorage() {
    return {
      isHtmlMode: false,
      htmlContent: '',
    };
  },
  onCreate() {
    const editor = this.editor;
    const component = (editor as any).component;

    if (component) {
      component.dispatchContentChange = function () {
        if (this.editor) {
          this.content = this.editor.getHTML();

          // Get HTML content
          const htmlContent = this.editor.getHTML();

          // Get markdown content if markdown extension is available
          let markdown = '';
          try {
            if (typeof (this.editor as any).getMarkdown === 'function') {
              markdown = (this.editor as any).getMarkdown();
            }
          } catch (error) {
            console.error('Error getting markdown:', error);
          }

          this.dispatchEvent(
            new CustomEvent('content-change', {
              detail: {
                content: this.content,
                html: htmlContent,
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
}) as unknown as HtmlExtension;

/**
 * Renders the HTML mode toggle toolbar button.
 * @param {Editor | null} editor - The TipTap editor instance
 * @param {string} toolbarSize - Size of the toolbar buttons
 * @returns {TemplateResult} Lit template for the HTML toolbar
 */
Html.toolbarRender = (editor: Editor | null, toolbarSize = 'md') => {
  const storage = editor?.storage as any;
  const isHtmlMode = storage?.html?.isHtmlMode || false;

  /**
   * Toggles between HTML source and rich text editing modes.
   * @returns {void}
   */
  const toggleHtmlMode = () => {
    if (!editor) {
      return;
    }

    const storage = editor.storage as any;
    const currentMode = storage.html.isHtmlMode;
    storage.html.isHtmlMode = !currentMode;

    const component = (editor as any).component;
    if (component) {
      if (!currentMode) {
        // Switching to HTML mode
        // Get current content as HTML
        storage.html.htmlContent = editor.getHTML();

        // Add HTML textarea to the component
        const container = component.shadowRoot?.querySelector(
          `.${BASE_CLASS}__container`
        );
        if (container && !container.querySelector('.html-editor')) {
          const editorDiv = container.querySelector(`.${BASE_CLASS}__editor`);
          if (editorDiv) {
            createHtmlEditor(storage, container, editorDiv);
          }
        }
      } else {
        // Switching back to editor mode
        const container = component.shadowRoot?.querySelector(
          `.${BASE_CLASS}__container`
        );
        if (container) {
          removeHtmlEditor(editor, storage, container);
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
        ?isselected=${isHtmlMode}
        @click=${toggleHtmlMode}>
        ${iconLoader(isHtmlMode ? Edit : Code, { slot: 'icon' })}
        <span slot="tooltip-content"
          >${isHtmlMode ? 'Rich Text Mode' : 'HTML Mode'}</span
        >
      </cds-icon-button>
    </div>
  `;
};

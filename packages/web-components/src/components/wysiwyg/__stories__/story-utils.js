/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Mark, Extension, Node, mergeAttributes } from '@tiptap/core';
import { DEFAULT_GROUP_ORDER } from '../components/wysiwyg/src/wysiwyg.template';

/**
 * Custom TipTap extension for highlighting text
 * Simple mark extension without boilerplate
 */
export const HighlightExtension = Mark.create({
  name: 'highlight',
  parseHTML() {
    return [{ tag: 'mark' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['mark', HTMLAttributes, 0];
  },
  addCommands() {
    return {
      /**
       * Toggle highlight mark
       * @returns {Function} Command function
       */
      toggleHighlight:
        () =>
        ({ commands }) =>
          commands.toggleMark(this.name),
    };
  },
});

/**
 * Format HTML with proper indentation
 * @param {string} html - HTML string to format
 * @returns {string} Formatted HTML
 */
function formatHtml(html) {
  let formatted = '';
  let indent = 0;
  const tab = '  ';

  const tokens = html.split(/(<[^>]+>)/g).filter((token) => token.trim());

  tokens.forEach((token) => {
    if (token.match(/^<\/\w/)) {
      indent = Math.max(0, indent - 1);
      formatted += tab.repeat(indent) + token + '\n';
    } else if (token.match(/^<\w[^>]*[^/]>$/)) {
      formatted += tab.repeat(indent) + token + '\n';
      indent++;
    } else if (token.match(/^<\w[^>]*\/>$/)) {
      formatted += tab.repeat(indent) + token + '\n';
    } else if (token.trim()) {
      formatted += tab.repeat(indent) + token.trim() + '\n';
    }
  });

  return formatted.trim();
}

/**
 * HTML Source View Extension
 * Toggles between WYSIWYG and raw HTML editing
 */
export const HtmlSourceExtension = Extension.create({
  name: 'htmlSourceView',

  addOptions() {
    return {
      onToggle: null,
    };
  },

  addStorage() {
    return {
      isSourceMode: false,
      sourceContent: '',
      sourceElement: null,
    };
  },

  addCommands() {
    return {
      /**
       * Toggle between WYSIWYG and HTML source view
       * @returns {Function} Command function
       */
      toggleHtmlSource:
        () =>
        ({ editor }) => {
          const storage = this.storage;
          storage.isSourceMode = !storage.isSourceMode;

          if (storage.isSourceMode) {
            const currentHtml = editor.getHTML();
            storage.sourceContent = formatHtml(currentHtml);

            // Get the ProseMirror editor element and its container
            const proseMirrorElement = editor.view.dom;
            const editorContainer = proseMirrorElement.parentElement;

            if (!editorContainer) {
              return false;
            }

            // Hide the ProseMirror editor
            proseMirrorElement.style.display = 'none';

            // Create source container
            const sourceContainer = document.createElement('div');
            sourceContainer.className = 'html-source-container';
            sourceContainer.style.cssText = `
              position: relative;
              padding: 1rem;
            `;

            // Create editable pre element
            const pre = document.createElement('pre');
            pre.className = 'html-source-editor';
            pre.contentEditable = 'true';
            pre.spellcheck = false;
            pre.textContent = storage.sourceContent;
            pre.style.cssText = `
              font-family: 'IBM Plex Mono', 'Menlo', 'DejaVu Sans Mono', 'Bitstream Vera Sans Mono', Courier, monospace;
              font-size: 13px;
              line-height: 1.6;
              white-space: pre;
              overflow-x: auto;
              color: var(--cds-text-primary, #161616);
              background: transparent;
              border: none;
              outline: none;
              width: 100%;
              min-height: 400px;
              padding: 0;
              margin: 0;
              tab-size: 2;
            `;

            // Add label
            const label = document.createElement('div');
            label.textContent = 'HTML Source';
            label.style.cssText = `
              position: absolute;
              top: 0.5rem;
              right: 0.5rem;
              font-size: 0.75rem;
              font-weight: 600;
              color: var(--cds-text-secondary, #525252);
              text-transform: uppercase;
              letter-spacing: 0.05em;
              pointer-events: none;
              background: var(--cds-layer-01, #f4f4f4);
              padding: 0.25rem 0.5rem;
              border-radius: 2px;
            `;

            sourceContainer.appendChild(label);
            sourceContainer.appendChild(pre);

            // Insert the source container in the editor container
            editorContainer.appendChild(sourceContainer);

            storage.sourceElement = sourceContainer;

            // Update storage on input
            pre.addEventListener('input', () => {
              storage.sourceContent = pre.textContent || '';
            });

            // Focus the pre element
            setTimeout(() => pre.focus(), 0);
          } else {
            const proseMirrorElement = editor.view.dom;

            if (storage.sourceElement && storage.sourceElement.parentElement) {
              storage.sourceElement.parentElement.removeChild(
                storage.sourceElement
              );
              storage.sourceElement = null;
            }

            proseMirrorElement.style.display = '';

            // Update content if it was modified in source mode
            if (storage.sourceContent) {
              // Use setTimeout to ensure the editor is ready before updating
              setTimeout(() => {
                try {
                  editor.commands.setContent(storage.sourceContent);
                  editor.commands.focus();
                } catch (error) {
                  console.error('Error updating content from source:', error);
                }
              }, 0);
            } else {
              setTimeout(() => editor.commands.focus(), 0);
            }
          }

          if (this.options.onToggle) {
            this.options.onToggle(storage.isSourceMode);
          }

          return true;
        },

      /**
       * Check if in source mode
       * @returns {Function} Command function
       */
      isHtmlSourceMode: () => () => {
        return this.storage.isSourceMode;
      },
    };
  },
});

/**
 * Details extension for collapsible content
 */
export const DetailsExtension = Node.create({
  name: 'details',
  group: 'block',
  content: 'detailsSummary detailsContent',
  defining: true,
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      open: {
        default: null,
        /**
         * Parse HTML element for open attribute
         * @param {HTMLElement} element - The HTML element
         * @returns {boolean} Whether element has open attribute
         */
        parseHTML: (element) => element.hasAttribute('open'),
        /**
         * Render HTML attributes
         * @param {Object} attributes - Node attributes
         * @returns {Object} HTML attributes
         */
        renderHTML: (attributes) => {
          if (attributes.open) {
            return { open: '' };
          }
          return {};
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'details',
        /**
         * Get attributes from node
         * @param {HTMLElement} node - The HTML node
         * @returns {Object} Node attributes
         */
        getAttrs: (node) => ({
          open: node.hasAttribute('open'),
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['details', mergeAttributes(HTMLAttributes), 0];
  },

  addNodeView() {
    return ({ node, HTMLAttributes, getPos, editor }) => {
      const dom = document.createElement('details');
      Object.entries(mergeAttributes(HTMLAttributes)).forEach(
        ([key, value]) => {
          if (value !== null && value !== undefined) {
            dom.setAttribute(key, value);
          }
        }
      );

      if (node.attrs.open) {
        dom.setAttribute('open', '');
      }

      dom.addEventListener('click', (e) => {
        if (e.target.tagName === 'SUMMARY' || e.target.closest('summary')) {
          e.preventDefault();
          const newOpenState = !dom.hasAttribute('open');

          if (typeof getPos === 'function') {
            editor.commands.updateAttributes('details', {
              open: newOpenState,
            });
          }
        }
      });

      return {
        dom,
        contentDOM: dom,
        /**
         * Update node view
         * @param {Node} updatedNode - Updated node
         * @returns {boolean} Whether update was successful
         */
        update: (updatedNode) => {
          if (updatedNode.type !== node.type) {
            return false;
          }
          if (updatedNode.attrs.open) {
            dom.setAttribute('open', '');
          } else {
            dom.removeAttribute('open');
          }
          return true;
        },
      };
    };
  },

  addCommands() {
    return {
      /**
       * Insert a details block
       * @returns {Function} Command function
       */
      setDetails:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            content: [
              {
                type: 'detailsSummary',
                content: [{ type: 'text', text: 'Click to expand' }],
              },
              {
                type: 'detailsContent',
                content: [
                  {
                    type: 'paragraph',
                    content: [
                      { type: 'text', text: 'Add your content here...' },
                    ],
                  },
                ],
              },
            ],
          });
        },
    };
  },
});

/**
 * DetailsSummary extension for the summary part
 */
export const DetailsSummaryExtension = Node.create({
  name: 'detailsSummary',
  content: 'inline*',
  defining: true,

  parseHTML() {
    return [{ tag: 'summary' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['summary', mergeAttributes(HTMLAttributes), 0];
  },
});

/**
 * DetailsContent extension for the content part
 */
export const DetailsContentExtension = Node.create({
  name: 'detailsContent',
  content: 'block+',
  defining: true,

  parseHTML() {
    return [{ tag: 'div[data-type="details-content"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'details-content' }),
      0,
    ];
  },
});

/**
 * Generate toolbar options in the correct order based on DEFAULT_GROUP_ORDER
 */
export const generateToolbarOptions = () => {
  const toolbarConfig = {
    clipboard: {
      name: 'clipboard',
      enabled: true,
      items: {
        cut: true,
        copy: true,
        paste: true,
      },
    },
    fontFamily: { name: 'fontFamily', enabled: true },
    textFormatting: {
      name: 'textFormatting',
      enabled: true,
      items: {
        bold: true,
        italic: true,
        underline: true,
        strikethrough: true,
        code: true,
      },
    },
    blocks: {
      name: 'blocks',
      enabled: true,
      items: {
        blockquote: true,
        codeBlock: true,
      },
    },
    headings: { name: 'headings', enabled: true },
    colorPicker: { name: 'colorPicker', enabled: true },
    lists: {
      name: 'lists',
      enabled: true,
      items: {
        bulletList: true,
        numberedList: true,
        taskList: true,
        outdent: true,
        indent: true,
      },
    },
    alignment: {
      name: 'alignment',
      enabled: true,
      items: {
        left: true,
        center: true,
        right: true,
        justify: true,
      },
    },
    insert: {
      name: 'insert',
      enabled: true,
      items: {
        table: true,
        link: true,
        image: true,
        attachment: true,
      },
    },
    search: { name: 'search', enabled: true },
    tableOperations: { name: 'tableOperations', enabled: true },
  };

  // Return toolbar options in the order defined by DEFAULT_GROUP_ORDER
  return DEFAULT_GROUP_ORDER.map((groupName) => toolbarConfig[groupName]);
};

/**
 * Demo content showcasing all editor features
 */
export const demoContent = `
  <h1>WYSIWYG Editor Demo</h1>
  <p>This demo showcases the Carbon Design System text toolbar pattern features.</p>
  
  <h2>Text Formatting</h2>
  <p>
    Inline formatting: <strong>bold</strong>, <em>italic</em>, <u>underline</u>,
    <s>strikethrough</s>, and <code>code</code>.
  </p>
  
  <h2>Theme Colors</h2>
  <p><span style="color: var(--cds-text-primary);">Primary</span> |
  <span style="color: var(--cds-text-secondary);">Secondary</span> |
  <span style="color: var(--cds-link-primary);">Link</span> |
  <span style="color: var(--cds-support-success);">Success</span> |
  <span style="color: var(--cds-support-error);">Error</span> |
  <span style="color: var(--cds-support-warning);">Warning</span></p>
  
  <h2>Headings</h2>
  <h3>Heading 3</h3>
  <h4>Heading 4</h4>
  <h5>Heading 5</h5>
  <h6>Heading 6</h6>
  
  <h2>Lists</h2>
  <ul>
    <li>Bulleted item with <strong>bold</strong></li>
    <li>Nested list:
      <ul>
        <li>Nested item</li>
      </ul>
    </li>
  </ul>
  
  <ol>
    <li>Numbered item</li>
    <li>Another item</li>
  </ol>
  
  <p><em>Use the toolbar to add task list items below:</em></p>
  <ul data-type="taskList"></ul>
  
  <h2>Alignment</h2>
  <p style="text-align: left;">Left aligned (default)</p>
  <p style="text-align: center;">Center aligned</p>
  <p style="text-align: right;">Right aligned</p>
  <p style="text-align: justify;">Justified text spreads content to align with both margins, creating uniform edges commonly used in formal documents.</p>
  
  <h2>Links & Media</h2>
  <p>Visit <a href="https://carbondesignsystem.com" target="_blank" rel="noopener noreferrer">Carbon Design System</a> for more information.</p>
  
  <p>
    <img src="https://placehold.co/640x240/72ffbc/000000/png?text=Demo+Image" alt="Demo image" />
  </p>
  
  <h2>Blockquote</h2>
  <blockquote>
    The Carbon text toolbar pattern provides comprehensive tools for rich text editing.
  </blockquote>
  
  <h2>Code</h2>
  <p>Use <code>clabs-wysiwyg</code> to add rich text editing to your app.</p>
  
  <pre><code>const editor = document.querySelector('clabs-wysiwyg')</code></pre>
  
  <h2>Table</h2>
  <table>
    <thead>
      <tr>
        <th>Feature</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Text Formatting</td>
        <td>✓ Supported</td>
      </tr>
      <tr>
        <td>Lists</td>
        <td>✓ Supported</td>
      </tr>
      <tr>
        <td>Tables</td>
        <td>✓ Supported</td>
      </tr>
    </tbody>
  </table>
`;

/**
 * Checks if editor content is empty (only whitespace or empty tags)
 * @param {string} content HTML content string
 * @returns {boolean} True if content is empty
 */
export const isContentEmpty = (content) => {
  if (!content) {
    return true;
  }
  // Remove HTML tags and check if remaining text is empty
  const textContent = content.replace(/<[^>]*>/g, '').trim();
  return textContent.length === 0;
};

/**
 * Updates button visibility based on editor content
 * @param {HTMLElement} form The form element containing the buttons
 * @param {boolean} isEmpty Whether the editor content is empty
 */
export const updateButtonVisibility = (form, isEmpty) => {
  const setButton = form?.querySelector('[data-action="set-content"]');
  const sendButton = form?.querySelector('[data-action="send"]');
  const discardButton = form?.querySelector('[data-action="discard"]');

  if (setButton) {
    setButton.style.display = isEmpty ? 'inline-block' : 'none';
  }
  if (sendButton) {
    sendButton.style.display = isEmpty ? 'none' : 'inline-block';
  }
  if (discardButton) {
    discardButton.style.display = isEmpty ? 'none' : 'inline-block';
  }
};

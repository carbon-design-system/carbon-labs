/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Mark } from '@tiptap/core';
import { DEFAULT_GROUP_ORDER } from '../components/wysiwyg/src/wysiwyg.template';

/**
 * Custom TipTap extension for highlighting text with custom styles
 * Demonstrates how to create an extension with user-defined styles
 */
export const HighlightExtension = Object.assign(
  Mark.create({
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
         */
        toggleHighlight:
          () =>
          ({ commands }) =>
            commands.toggleMark(this.name),
      };
    },
  }),
  {
    // Use a more specific selector to override Carbon element styles. uncomment below to see.
    // styles: `
    //   .clabs--wysiwyg__editor-content .ProseMirror mark {
    //     background-color: var(--cds-tag-background-green);
    //     color: var(--cds-tag-color-green);
    //     border-block-end: 1px dashed;
    //     padding: 0;
    //   }
    // `,
  }
);

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

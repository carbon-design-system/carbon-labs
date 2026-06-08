/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Import all extensions
import { TextFormatting } from '../components/wysiwyg/src/extensions/text-formatting.js';
import { Typography } from '../components/wysiwyg/src/extensions/typography.js';
import { Lists } from '../components/wysiwyg/src/extensions/lists.js';
import { Tables } from '../components/wysiwyg/src/extensions/tables.js';
import { Alignment } from '../components/wysiwyg/src/extensions/alignment.js';
import { TextColor } from '../components/wysiwyg/src/extensions/text-color.js';
import { Search } from '../components/wysiwyg/src/extensions/search.js';
import { History } from '../components/wysiwyg/src/extensions/history.js';
import { Blocks } from '../components/wysiwyg/src/extensions/blocks.js';
import { Insert } from '../components/wysiwyg/src/extensions/insert.js';
import { Typeface } from '../components/wysiwyg/src/extensions/typeface.js';
import { Clipboard } from '../components/wysiwyg/src/extensions/clipboard.js';

/**
 * All available extensions for the WYSIWYG editor.
 * @type {Array<import('../components/wysiwyg/wysiwyg').ExtensionWithToolbar>}
 */
export const allExtensions = /** @type {any} */ ([
  History,
  Clipboard,
  Typeface,
  TextFormatting,
  TextColor,
  Insert,
  Blocks,
  Typography,
  Lists,
  Alignment,
  Tables,
  Search,
]);

/**
 * Simulate AI processing for demo purposes
 * @param {string} text - Selected text
 * @returns {Promise<string>} Processed text
 */
export const processWithAI = async (text) => {
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Convert "title: item1, item2" to list
  const listPattern = /^(.+?):\s*(.+)$/;
  const match = text.match(listPattern);
  if (match) {
    const [, title, items] = match;
    const itemList = items
      .split(/,\s*/)
      .map((item) => `<li>${item.trim()}</li>`)
      .join('');
    return `<p><strong>${title.trim()}:</strong></p><ul>${itemList}</ul>`;
  }

  // Convert comma-separated text to list
  if (text.includes(',')) {
    const items = text
      .split(/,\s*/)
      .map((item) => `<li>${item.trim()}</li>`)
      .join('');
    return `<ul>${items}</ul>`;
  }

  // Simple text enhancements
  return text
    .replace(/quick brown fox/gi, 'agile, swift fox')
    .replace(/lazy dog/gi, 'relaxed canine');
};

/**
 * Context menu styles for table operations
 */
export const contextMenuStyles = `
  .context-menu {
    position: fixed;
    background: var(--cds-layer);
    border: 1px solid var(--cds-border-subtle);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    padding: 4px 0;
    max-width: 160px;
    z-index: 9999;
    display: none;
  }
  .context-menu.open {
    display: block;
  }
  .context-menu button {
    width: 100%;
    padding: 8px 16px;
    border: none;
    background: transparent;
    color: var(--cds-text-primary);
    text-align: left;
    cursor: pointer;
  }
  .context-menu button:hover:not(:disabled) {
    background: var(--cds-layer-hover);
  }
  .context-menu button:active {
    outline: 2px solid var(--cds-focus);
    outline-offset: -2px;
  }
  .context-menu button:disabled {
    color: var(--cds-text-disabled);
  }
  .context-menu button[data-delete]:hover:not(:disabled) {
    background: var(--cds-button-danger-primary, #da1e28);
    color: var(--cds-text-on-color, #ffffff);
  }
  .context-menu button[data-delete]:active:not(:disabled) {
    background: var(--cds-button-danger-active, #750e13);
    color: var(--cds-text-on-color, #ffffff);
  }
  .context-menu hr {
    margin: 4px 0;
    border: none;
    border-top: 1px solid var(--cds-border-subtle);
  }
`;

/**
 * Create context menu manager for table operations
 * @param {object} editor - Editor instance
 * @param {HTMLElement} menu - Menu element
 * @returns {object} Menu manager with showMenu and runAction methods
 */
export const createContextMenuManager = (editor, menu) => {
  /**
   * Show context menu at position
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  const showMenu = (x, y) => {
    if (!menu || !editor) {
      return;
    }

    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.classList.add('open');

    const merge = menu.querySelector('[data-action="merge"]');
    const split = menu.querySelector('[data-action="split"]');
    const divider = menu.querySelector('[data-divider]');

    const canMerge = editor.can().mergeCells();
    const canSplit = editor.can().splitCell();

    merge.style.display = canMerge ? '' : 'none';
    split.style.display = canSplit ? '' : 'none';
    divider.style.display = canMerge || canSplit ? '' : 'none';
  };

  /**
   * Run table action
   * @param {Event} e - Event
   * @param {string} action - Action name
   */
  const runAction = (e, action) => {
    e.stopPropagation();
    menu?.classList.remove('open');
    setTimeout(() => editor?.chain().focus()[action]().run(), 0);
  };

  return { showMenu, runAction };
};

/**
 * Custom toolbar demo content
 */
export const customToolbarContent = `
  <h2>Custom Toolbar Rendering</h2>
  <p>Any toolbar item can be intercepted to render custom elements and functionality that matter to your products.</p>
  <p>This example demonstrates overriding the <code>toolbarRender</code> method for the tables extension. The default table button is replaced with a custom implementation that adds a right-click context menu for table operations.</p>
  <h3>Try It Out</h3>
  <p>Right-click on any table cell while the text cursor is inside the table below to see the custom context menu in action:</p>
  <table>
    <tbody>
      <tr>
        <th><p>Header 1</p></th>
        <th><p>Header 2</p></th>
        <th><p>Header 3</p></th>
      </tr>
      <tr>
        <td><p>Cell 1</p></td>
        <td><p>Cell 2</p></td>
        <td><p>Cell 3</p></td>
      </tr>
      <tr>
        <td><p>Cell 4</p></td>
        <td><p>Cell 5</p></td>
        <td><p>Cell 6</p></td>
      </tr>
    </tbody>
  </table>
  <h3>Customization Possibilities</h3>
  <ul>
    <li><strong>Custom color pickers and icons:</strong> Don't like the limited set of colors? Extend it with a <code>style picker</code> that matches your requirement. Add carbon icon libraries or pictogram sets specific to your domain.</li>
    <li><strong>Inline context menus:</strong> Want to open context menus inline instead of in the toolbar? DIY with custom event handlers.</li>
    <li><strong>AI-powered selection refactoring:</strong> Hook selection actions to your own backend, process selected text, and asynchronously update the selection with the result.</li>
    <li><strong>Product-specific tools:</strong> Integrate specialized formatting tools, templates, or workflows unique to your application.</li>
    <li><strong>Endless possibilities:</strong> Customizations are bounded only by imagination. See also: <a target="_blank" rel="noopener noreferrer" href="https://tiptap.dev/docs/examples">Examples</a></li>
  </ul>
`;

/**
 * Demo content showcasing all editor features
 */
export const demoContent = `
  <h1>WYSIWYG Editor - Complete Feature Showcase</h1>
  <p>Welcome to the comprehensive demonstration of all editor capabilities. This document showcases every extension and feature available in the Carbon Design System WYSIWYG editor.</p>
  
  <h2>Typography & Headings</h2>
  <p>The editor supports six heading levels and paragraph text with multiple font families.</p>
  <h1>Heading 1 - Main Title</h1>
  <h2>Heading 2 - Section Title</h2>
  <h3>Heading 3 - Subsection</h3>
  <h4>Heading 4 - Minor Heading</h4>
  <h5>Heading 5 - Small Heading</h5>
  <h6>Heading 6 - Smallest Heading</h6>
  <p>Regular paragraph text with default styling.</p>
  
  <h2>Text Formatting</h2>
  <p>Apply various inline text styles to emphasize content:</p>
  <p><strong>Bold text</strong> for strong emphasis</p>
  <p><em>Italic text</em> for subtle emphasis</p>
  <p><u>Underlined text</u> for highlighting</p>
  <p><s>Strikethrough text</s> for deleted content</p>
  <p><code>Inline code</code> for technical terms</p>
  <p>You can also <strong><em><u>combine multiple formats</u></em></strong> together!</p>
  <p><em>All emojis are fully supported and render correctly in the editor.</em> 🙂</p>
  
  <h2>Text Colors & Highlights</h2>
  <p>Use Carbon Design System color tokens for consistent theming:</p>
  <p><span style="color: var(--cds-text-primary);">Primary text color</span> - Default text</p>
  <p><span style="color: var(--cds-text-secondary);">Secondary text color</span> - Subtle text</p>
  <p><span style="color: var(--cds-text-placeholder);">Placeholder color</span> - Form hints</p>
  <p><span style="color: var(--cds-link-primary);">Link color</span> - Hyperlinks</p>
  
  <h3>Status Colors</h3>
  <p><span style="color: var(--cds-support-info);">Info</span> - Informational messages</p>
  <p><span style="color: var(--cds-support-success);">Success</span> - Positive outcomes</p>
  <p><span style="color: var(--cds-support-error);">Error</span> - Critical issues</p>
  <p><span style="color: var(--cds-support-warning);">Warning</span> - Caution needed</p>
  <p><span style="color: var(--cds-support-caution-major);">Caution</span> - Important alerts</p>
  
  <h3>Text Highlights</h3>
  <p>Use <mark>highlight</mark> to mark important text passages.</p>
  <p>Track changes with <del>deleted text</del> and <ins>inserted text</ins>.</p>
  
  <h2>Font Families</h2>
  <p><span style="font-family: 'IBM Plex Sans';">IBM Plex Sans</span> - Modern sans-serif (default)</p>
  <p><span style="font-family: 'IBM Plex Serif';">IBM Plex Serif</span> - Classic serif font</p>
  <p><span style="font-family: 'IBM Plex Mono';">IBM Plex Mono</span> - Monospace for code</p>
  <p><span style="font-family: 'Arial';">Arial</span> - Standard sans-serif</p>
  <p><span style="font-family: 'Helvetica';">Helvetica</span> - Clean sans-serif</p>
  <p><span style="font-family: 'Times New Roman';">Times New Roman</span> - Traditional serif</p>
  <p><span style="font-family: 'Courier New';">Courier New</span> - Classic monospace</p>
  
  <h2>Text Alignment</h2>
  <p style="text-align: left;">Left aligned text - Standard alignment for most content. This is the default alignment used throughout documents.</p>
  <p style="text-align: center;">Center aligned text - Perfect for titles, headings, and featured content that needs emphasis.</p>
  <p style="text-align: right;">Right aligned text - Useful for signatures, dates, and special formatting requirements.</p>
  <p style="text-align: justify;">Justified text creates clean edges on both sides by adjusting spacing between words. This alignment is commonly used in newspapers, magazines, and formal documents to create a polished, professional appearance with uniform margins.</p>
  
  <h2>Lists</h2>
  
  <h3>Bulleted Lists</h3>
  <ul>
    <li>First bullet point</li>
    <li>Second bullet point with <strong>bold text</strong></li>
    <li>Third point with <em>italic emphasis</em></li>
    <li>Nested lists:
      <ul>
        <li>Nested item one</li>
        <li>Nested item two with <code>code</code></li>
        <li>Deeper nesting:
          <ul>
            <li>Third level item</li>
            <li>Another third level</li>
          </ul>
        </li>
      </ul>
    </li>
    <li>Back to first level</li>
  </ul>
  
  <h3>Numbered Lists</h3>
  <ol>
    <li>First numbered item</li>
    <li>Second numbered item with <strong>bold text</strong></li>
    <li>Third numbered item with <em>italic emphasis</em></li>
    <li>
      Nested lists:
      <ol>
        <li>Nested item one</li>
        <li>Nested item two with <code>code</code></li>
        <li>
          Deeper nesting:
          <ol>
            <li>Third level item</li>
            <li>Another third level</li>
          </ol>
        </li>
      </ol>
    </li>
    <li>Back to first level</li>
  </ol>
  
  <h3>Task Lists</h3>
  <ul data-type="taskList">
  </ul>
  
  <h2>Links & Images</h2>
  <p>Create hyperlinks to external resources: <a href="https://carbondesignsystem.com" target="_blank" rel="noopener noreferrer">Carbon Design System</a></p>
  
  <h3>Images</h3>
  <p>Insert and resize images directly in the editor:</p>
  <img src="https://placehold.co/300x300/a7f0ba/000/png?text=Square+Image" alt="Square image" />
  <img src="https://placehold.co/600x200/fddc69/000/png?text=Feature+Banner" alt="Feature banner" />
  
  <h2>Blockquotes</h2>
  <blockquote>Without aesthetic, design is either the humdrum repetition of familiar clichés or a wild scramble for novelty. Without aesthetic, the computer is but a mindless speed machine, producing effects without substance, form without relevant content, or content without meaningful form.</blockquote>
  <cite>
    Paul Rand
  </cite>
  
  <h2>Code Blocks</h2>
  <p>Display inline code with <code>const variable = "value"</code> or use code blocks for larger snippets:</p>
  
  <pre><code>// JavaScript example
function greet(name) {
  return \`Hello, \${name}!\`;
}

const message = greet("World");
console.log(message);</code></pre>
  
  <h2 id="tables">Tables</h2>
  <p>Create and edit tables with full formatting support:</p>
  
  <h3>Feature Comparison Table</h3>
  <table>
    <thead>
      <tr>
        <th scope="col">Feature</th>
        <th scope="col">Status</th>
        <th scope="col">Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Text Formatting</td>
        <td>Available</td>
        <td>Bold, italic, underline, strikethrough, code</td>
      </tr>
      <tr>
        <td>Typography</td>
        <td>Available</td>
        <td>6 heading levels, multiple fonts</td>
      </tr>
      <tr>
        <td>Lists</td>
        <td>Available</td>
        <td>Bulleted, numbered, and task lists</td>
      </tr>
      <tr>
        <td>Tables</td>
        <td>Available</td>
        <td>Full table editing with merge/split</td>
      </tr>
      <tr>
        <td>Media</td>
        <td>Available</td>
        <td>Images and links</td>
      </tr>
      <tr>
        <td>Alignment</td>
        <td>Available</td>
        <td>Left, center, right, justify</td>
      </tr>
    </tbody>
  </table>
  
  <h3>Data Table Example</h3>
  <table>
    <thead>
      <tr>
        <th scope="col">Product</th>
        <th scope="col">Price</th>
        <th scope="col">Quantity</th>
        <th scope="col">Total</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Widget A</td>
        <td>$10.00</td>
        <td>5</td>
        <td>$50.00</td>
      </tr>
      <tr>
        <td>Widget B</td>
        <td>$15.00</td>
        <td>3</td>
        <td>$45.00</td>
      </tr>
      <tr>
        <td>Widget C</td>
        <td>$20.00</td>
        <td>2</td>
        <td>$40.00</td>
      </tr>
      <tr>
        <td colspan="3" style="text-align: right;"><strong>Grand Total:</strong></td>
        <td><strong>$135.00</strong></td>
      </tr>
    </tbody>
  </table>
  
  <h2>Search Functionality</h2>
  <p>Use the search bar in the toolbar to find and highlight text throughout your document. The search feature provides real-time highlighting and match counting.</p>
  
  <h2>History & Clipboard</h2>
  <p>Full undo/redo support with keyboard shortcuts (Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z). Copy, cut, and paste operations work seamlessly with formatted content.</p>
  
  <h2>Advanced Features</h2>
  
  <h3>Table Operations</h3>
  <ul>
    <li>Add/delete rows and columns</li>
    <li>Merge and split cells</li>
    <li>Resize columns by dragging</li>
    <li>Full formatting within cells</li>
  </ul>
  
  <h3>Image Handling</h3>
  <ul>
    <li>Insert images from URLs</li>
    <li>Resize images by dragging handles</li>
    <li>Maintain aspect ratio</li>
    <li>Inline image placement</li>
  </ul>
  
  <h3>List Management</h3>
  <ul>
    <li>Increase/decrease indentation</li>
    <li>Convert between list types</li>
    <li>Nested lists up to multiple levels</li>
    <li>Interactive task list checkboxes</li>
  </ul>
  
  <h2>Try It Yourself!</h2>
  <p>This editor is fully interactive. Try these actions:</p>
  <ol>
    <li>Select text and apply formatting using the toolbar</li>
    <li>Create new lists and tables</li>
    <li>Insert links and images</li>
    <li>Change text alignment and colors</li>
    <li>Switch between different font families</li>
    <li>Use the search feature to find content</li>
    <li>Experiment with undo/redo operations</li>
  </ol>
  
  <blockquote><strong>Pro Tip:</strong> Use keyboard shortcuts for faster editing! Ctrl/Cmd+B for bold, Ctrl/Cmd+I for italic, Ctrl/Cmd+Z for undo, and more.</blockquote>
  
  <p style="text-align: center;"><em>Happy editing!</em></p>
`;

/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '../components/wysiwyg/wysiwyg';
import { html } from 'lit';
import { ref } from 'lit/directives/ref.js';
import { Mark } from '@tiptap/core';
import Time16 from '@carbon/icons/es/time/16.js';
import Edit16 from '@carbon/icons/es/edit/16.js';
import ChartBar16 from '@carbon/icons/es/chart--bar/16.js';
import TextClearFormat16 from '@carbon/icons/es/text--clear-format/16.js';
import TextHighlight16 from '@carbon/icons/es/text--highlight/16.js';
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';

// Create a custom TipTap extension for highlighting
const HighlightExtension = Mark.create({
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
});

/**
 * Render clear formatting button
 * @param {Editor | null} editor - Editor instance
 * @returns {TemplateResult} Button template
 */
const renderClearFormattingButton = (editor) => html`
  <cds-icon-button
    size="md"
    autoalign
    kind="ghost"
    enter-delay-ms="100"
    leave-delay-ms="100"
    align="top"
    @click=${() => {
      editor?.chain().focus().clearNodes().unsetAllMarks().run();
    }}>
    ${iconLoader(TextClearFormat16, { slot: 'icon' })}
    <span slot="tooltip-content">Clear Formatting</span>
  </cds-icon-button>
`;

/**
 * Render timestamp button
 * @param {Editor | null} editor - Editor instance
 * @returns {TemplateResult} Button template
 */
const renderTimestampButton = (editor) => html`
  <cds-icon-button
    size="md"
    autoalign
    kind="ghost"
    enter-delay-ms="100"
    leave-delay-ms="100"
    align="top"
    @click=${() => {
      const timestamp = new Date().toLocaleString();
      editor
        ?.chain()
        .focus()
        .insertContent(`<p><em>Timestamp: ${timestamp}</em></p>`)
        .run();
    }}>
    ${iconLoader(Time16, { slot: 'icon' })}
    <span slot="tooltip-content">Insert Timestamp</span>
  </cds-icon-button>
`;

/**
 * Render signature button
 * @param {Editor | null} editor - Editor instance
 * @returns {TemplateResult} Button template
 */
const renderSignatureButton = (editor) => html`
  <cds-icon-button
    size="md"
    autoalign
    kind="ghost"
    enter-delay-ms="100"
    leave-delay-ms="100"
    align="top"
    @click=${() => {
      const signature = `<hr><p><strong>Best regards,</strong><br>Your Name</p>`;
      editor?.chain().focus().insertContent(signature).run();
    }}>
    ${iconLoader(Edit16, { slot: 'icon' })}
    <span slot="tooltip-content">Insert Signature</span>
  </cds-icon-button>
`;

/**
 * Render statistics button
 * @param {Editor | null} editor - Editor instance
 * @returns {TemplateResult} Button template
 */
const renderStatisticsButton = (editor) => html`
  <cds-icon-button
    size="md"
    autoalign
    kind="ghost"
    enter-delay-ms="100"
    leave-delay-ms="100"
    align="top"
    @click=${() => {
      if (!editor) {
        console.warn('Editor instance not available');
        return;
      }
      const content = editor.getHTML();
      const stats = {
        characters: content.replace(/<[^>]*>/g, '').length,
        words: content
          .replace(/<[^>]*>/g, '')
          .trim()
          .split(/\s+/)
          .filter(Boolean).length,
        paragraphs: (content.match(/<p>/g) || []).length,
      };
      alert(
        `Editor Statistics:\n\nCharacters: ${stats.characters}\nWords: ${stats.words}\nParagraphs: ${stats.paragraphs}`
      );
    }}>
    ${iconLoader(ChartBar16, { slot: 'icon' })}
    <span slot="tooltip-content">Show Statistics</span>
  </cds-icon-button>
`;

export default {
  title: 'Components/Wysiwyg',
  component: 'clabs-wysiwyg',
  parameters: {
    docs: {
      story: {
        name: 'Custom Extensions',
      },
    },
  },
};

/**
 * Render highlight button (uses custom TipTap extension)
 * @param {Editor | null} editor - Editor instance
 * @returns {TemplateResult} Button template
 */
const renderHighlightButton = (editor) => html`
  <cds-icon-button
    size="md"
    autoalign
    kind="ghost"
    enter-delay-ms="100"
    leave-delay-ms="100"
    align="top"
    @click=${() => {
      editor?.chain().focus().toggleHighlight().run();
    }}>
    ${iconLoader(TextHighlight16, { slot: 'icon' })}
    <span slot="tooltip-content">Toggle Highlight</span>
  </cds-icon-button>
`;

/**
 * Story demonstrating both custom toolbar buttons AND custom TipTap extensions
 */
export const CustomExtensions = {
  args: {
    content: `
      <h3>Custom Extensions</h3>
      <p>This story demonstrates both types of extensibility:</p>
      
      <h4>1. Custom Toolbar Buttons</h4>
      <p>Add custom buttons to the toolbar via the <code>toolbarOptions</code> property. Each custom group can contain multiple button items with custom render functions:</p>
      <ul>
        <li><strong>Clear Formatting:</strong> Removes all formatting from selected text</li>
        <li><strong>Insert Timestamp:</strong> Adds current date/time to the document</li>
        <li><strong>Insert Signature:</strong> Adds a signature block</li>
        <li><strong>Show Statistics:</strong> Displays word/character count</li>
        <li><strong>Toggle Highlight:</strong> Uses custom TipTap extension (see below)</li>
      </ul>
      
      <h4>2. Custom TipTap Extensions</h4>
      <p>Add TipTap extensions via the <code>.extensions</code> property. This example includes a <strong>Highlight</strong> extension that renders <mark>highlighted text</mark> using Carbon element styles for marked-text.</p>
      
      <h4>Complete Usage Example:</h4>
      <pre><code>import { Mark } from '@tiptap/core';

// 1. Create custom TipTap extension
const Highlight = Mark.create({
  name: 'highlight',
  parseHTML() { return [{ tag: 'mark' }]; },
  renderHTML() { return ['mark', {}, 0]; },
  addCommands() {
    return {
      toggleHighlight: () => ({ commands }) =>
        commands.toggleMark(this.name)
    };
  },
});

// 2. Define custom toolbar buttons
const toolbarOptions = [
  { name: 'clipboard' },
  {
    id: 'custom-actions',
    items: [{
      id: 'highlight',
      render: (editor) => html\`
        <cds-icon-button
          @click=\${() => editor?.chain().focus().toggleHighlight().run()}>
          ...
        </cds-icon-button>
      \`
    }]
  },
  ...
];

// 3. Use both together
<clabs-wysiwyg
  .extensions=\${[Highlight]}
  .toolbarOptions=\${toolbarOptions}>
</clabs-wysiwyg></code></pre>
      
      <p>Try the custom buttons in the toolbar above! The Highlight button uses the custom TipTap extension.</p>
      <p>Learn more about TipTap extensions: <a href="https://tiptap.dev/docs/editor/extensions/overview" target="_blank" rel="noopener noreferrer">TipTap Extensions Overview</a></p>
    `,
    extensions: [HighlightExtension],
  },

  /**
   * Renders the template for Storybook
   * @param {object} args Storybook arguments
   * @returns {TemplateResult<1>}
   */
  render: (args) => {
    // Define toolbar options with custom groups
    const toolbarOptions = [
      { name: 'clipboard', enabled: true },
      // Custom group after clipboard
      {
        id: 'custom-actions',
        items: [
          {
            id: 'clear-formatting',
            render: renderClearFormattingButton,
          },
        ],
      },
      { name: 'fontFamily', enabled: true },
      { name: 'textFormatting', enabled: true },
      { name: 'headings', enabled: true },
      { name: 'colorPicker', enabled: true },
      { name: 'lists', enabled: true },
      { name: 'alignment', enabled: true },
      { name: 'blocks', enabled: true },
      // Custom group before insert
      {
        id: 'custom-inserts',
        items: [
          {
            id: 'insert-timestamp',
            render: renderTimestampButton,
          },
          {
            id: 'insert-signature',
            render: renderSignatureButton,
          },
        ],
      },
      { name: 'insert', enabled: true },
      { name: 'search', enabled: true },
      { name: 'tableOperations', enabled: true },
      // Custom group at the end
      {
        id: 'custom-utilities',
        items: [
          {
            id: 'highlight',
            render: renderHighlightButton,
          },
          {
            id: 'show-stats',
            render: renderStatisticsButton,
          },
        ],
      },
    ];

    return html`<clabs-wysiwyg
      ${ref((el) => {
        if (el) {
          el.updateComplete.then(() => {
            console.log('Editor instance:', el.editorInstance);
            console.log('Custom extensions:', args.extensions);
          });
        }
      })}
      aria-label="WYSIWYG editor with custom extensions"
      .content=${args.content}
      .extensions=${args.extensions}
      .toolbarOptions=${toolbarOptions}></clabs-wysiwyg>`;
  },
};

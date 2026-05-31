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

// Add styles property to the extension
HighlightExtension.styles = `
  .ProseMirror mark {
    background-color: #fddc69;
    padding-inline: 0.125rem;
  }
`;

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
 * Story demonstrating custom toolbar buttons and TipTap extensions with styles
 */
export const CustomExtensions = {
  args: {
    content: `
      <h3>Custom Extensions Demo</h3>
      <p>This story demonstrates custom extensibility:</p>
      
      <h4>Custom Toolbar Buttons</h4>
      <ul>
        <li><strong>Clear Formatting:</strong> Removes all formatting from selected text</li>
        <li><strong>Insert Timestamp:</strong> Adds current date/time to the document</li>
        <li><strong>Insert Signature:</strong> Adds a signature block</li>
        <li><strong>Show Statistics:</strong> Displays word/character count</li>
        <li><strong>Toggle Highlight:</strong> Uses custom TipTap extension with custom styles</li>
      </ul>
      
      <h4>Try It Out</h4>
      <p>Select some text and click the <strong>Highlight</strong> button (yellow marker icon) in the toolbar to see the custom extension with <mark style="background-color: #ffd700; padding: 2px 4px; border-radius: 2px;">custom styling</mark> in action!</p>
      
      <p>See the <strong>Docs</strong> tab for complete usage examples and how to add your own custom extensions with Carbon element styles.</p>
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

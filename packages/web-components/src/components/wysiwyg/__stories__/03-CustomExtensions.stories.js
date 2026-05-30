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
import Time16 from '@carbon/icons/es/time/16.js';
import Edit16 from '@carbon/icons/es/edit/16.js';
import ChartBar16 from '@carbon/icons/es/chart--bar/16.js';
import TextClearFormat16 from '@carbon/icons/es/text--clear-format/16.js';
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';

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
 * Story demonstrating custom extension points
 */
export const CustomExtensions = {
  args: {
    content: `
      <h3>Custom Extension Points</h3>
      <p>This story demonstrates the extension API. Custom toolbar groups can be defined in <code>toolbarOptions</code>:</p>
      <ul>
        <li><strong>'custom-actions':</strong> Clear Formatting button (after clipboard)</li>
        <li><strong>'custom-inserts':</strong> Timestamp and Signature buttons (before insert)</li>
        <li><strong>'custom-utilities':</strong> Statistics button (at the end)</li>
      </ul>
      <p>Simply add custom group objects to <code>toolbarOptions</code> array to control their position:</p>
      <pre><code>toolbarOptions: [
  { name: 'clipboard' },
  {
    id: 'custom-actions',
    items: [{ id: 'clear-formatting', render: (editor) => ... }]
  },
  { name: 'textFormatting' },
  ...
]</code></pre>
      <p>The editor instance is passed to each custom item's render function, allowing direct access to TipTap methods.</p>
      <p>Custom buttons participate in roving tab navigation and match internal button styling.</p>
      <p>Try using the custom buttons in the toolbar above!</p>
    `,
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
            console.log('Editor instance:', el.editor);
          });
        }
      })}
      aria-label="WYSIWYG editor with custom extensions"
      .content=${args.content}
      .toolbarOptions=${toolbarOptions}></clabs-wysiwyg>`;
  },
};

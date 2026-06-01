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
import Code16 from '@carbon/icons/es/code/16.js';
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';
import { HtmlSourceExtension } from './story-utils.js';

/**
 * Render HTML source toggle button
 * @param {Editor | null} editor - Editor instance
 * @returns {TemplateResult} Button template
 */
const renderHtmlSourceButton = (editor) => html`
  <cds-icon-button
    size="md"
    autoalign
    kind="ghost"
    enter-delay-ms="100"
    leave-delay-ms="100"
    align="top"
    @click=${() => {
      editor?.chain().focus().toggleHtmlSource().run();
    }}>
    ${iconLoader(Code16, { slot: 'icon' })}
    <span slot="tooltip-content">Toggle HTML Source</span>
  </cds-icon-button>
`;

export default {
  title: 'Components/Wysiwyg',
  component: 'clabs-wysiwyg',
  parameters: {
    docs: {
      story: {
        name: 'HTML Source View',
      },
    },
  },
};

/**
 * Story demonstrating HTML source view extension
 */
export const HtmlSourceView = {
  args: {
    content: `
      <h3>HTML Source View Demo</h3>
      <p>This story demonstrates the HTML Source View extension that allows toggling between WYSIWYG editing and raw HTML source code editing.</p>
      
      <h4>Features</h4>
      <ul>
        <li><strong>Toggle View:</strong> Click the code icon in the toolbar to switch between WYSIWYG and HTML source modes</li>
        <li><strong>Formatted HTML:</strong> Source code is automatically formatted with proper indentation</li>
        <li><strong>Live Editing:</strong> Edit the HTML directly and switch back to see the changes</li>
        <li><strong>Syntax Highlighting:</strong> Monospace font for better code readability</li>
      </ul>
      
      <h4>Try It Out</h4>
      <p>Click the <strong>code icon</strong> in the toolbar to view and edit the raw HTML. Make changes in source mode, then toggle back to see them rendered.</p>
      
      <blockquote>
        <p>The HTML source editor renders directly inside the WYSIWYG component with preserved formatting.</p>
      </blockquote>
    `,
    extensions: [HtmlSourceExtension],
  },

  /**
   * Renders the template for Storybook
   * @param {object} args Storybook arguments
   * @returns {TemplateResult<1>}
   */
  render: (args) => {
    const toolbarOptions = [
      { name: 'clipboard', enabled: true },
      { name: 'fontFamily', enabled: true },
      { name: 'textFormatting', enabled: true },
      { name: 'headings', enabled: true },
      { name: 'colorPicker', enabled: true },
      { name: 'lists', enabled: true },
      { name: 'alignment', enabled: true },
      { name: 'blocks', enabled: true },
      { name: 'insert', enabled: true },
      { name: 'search', enabled: true },
      { name: 'tableOperations', enabled: true },
      {
        id: 'html-source',
        items: [
          {
            id: 'toggle-html-source',
            render: renderHtmlSourceButton,
          },
        ],
      },
    ];

    return html`<clabs-wysiwyg
      ${ref((el) => {
        if (el) {
          el.updateComplete.then(() => {
            console.log('Editor with HTML Source extension ready');
          });
        }
      })}
      aria-label="WYSIWYG editor with HTML source view"
      .content=${args.content}
      .extensions=${args.extensions}
      .toolbarOptions=${toolbarOptions}></clabs-wysiwyg>`;
  },
};

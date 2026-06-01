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
import ChevronDown16 from '@carbon/icons/es/chevron--down/16.js';
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';
import {
  DetailsExtension,
  DetailsSummaryExtension,
  DetailsContentExtension,
} from './story-utils.js';

/**
 * Render details insert button
 * @param {Editor | null} editor - Editor instance
 * @returns {TemplateResult} Button template
 */
const renderDetailsButton = (editor) => html`
  <cds-icon-button
    size="md"
    autoalign
    kind="ghost"
    enter-delay-ms="100"
    leave-delay-ms="100"
    align="top"
    @click=${() => {
      editor?.chain().focus().setDetails().run();
    }}>
    ${iconLoader(ChevronDown16, { slot: 'icon' })}
    <span slot="tooltip-content">Insert Collapsible Section</span>
  </cds-icon-button>
`;

export default {
  title: 'Components/Wysiwyg',
  component: 'clabs-wysiwyg',
  parameters: {
    docs: {
      story: {
        name: 'Details Extension',
      },
    },
  },
};

/**
 * Story demonstrating details/summary collapsible content extension
 */
export const DetailsCollapsible = {
  args: {
    content: `
      <h3>Details Extension Demo</h3>
      <p>This story demonstrates the Details extension for creating collapsible content sections.</p>
      
      <h4>Features</h4>
      <ul>
        <li><strong>Insert Collapsible:</strong> Click the chevron icon in the toolbar to insert a new collapsible section</li>
        <li><strong>Interactive:</strong> Click the summary to expand/collapse the content</li>
        <li><strong>Editable:</strong> Edit both the summary and content directly in the editor</li>
        <li><strong>Native HTML:</strong> Uses standard HTML5 details/summary elements</li>
      </ul>
      
      <h4>Example</h4>
      <p>Here's a collapsible section created with the Details extension:</p>
      
      <details>
        <summary>Click to know a secret</summary>
          <p>Curiosity is the engine of human progress. It drives us to look beyond the horizon, ask difficult questions, and seek deeper truths about our existence. From a child discovering the texture of autumn leaves to scientists probing the dark cosmos, this relentless urge to know is what transforms mere survival into a meaningful life. When we remain curious, we embrace empathy, break down barriers, and spark innovations that shape our collective future. To live entirely without curiosity is to stay static. By nurturing our natural desire to learn, we expand our minds and continually reshape the incredible world we inhabit.</p>
      </details>

      <details open="">
        <summary>Default open</summary>
          <p>I am not a secret.</p>
      </details>
      
      <h4>Try It Out</h4>
      <p>Click the <strong>chevron icon</strong> in the toolbar to insert a new collapsible section, then customize the summary and content.</p>
    `,
    extensions: [
      DetailsExtension,
      DetailsSummaryExtension,
      DetailsContentExtension,
    ],
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
      {
        id: 'details-insert',
        items: [
          {
            id: 'insert-details',
            render: renderDetailsButton,
          },
        ],
      },
      { name: 'insert', enabled: true },
      { name: 'search', enabled: true },
      { name: 'tableOperations', enabled: true },
    ];

    return html`<clabs-wysiwyg
      ${ref((el) => {
        if (el) {
          el.updateComplete.then(() => {
            console.log('Editor with Details extension ready');
          });
        }
      })}
      aria-label="WYSIWYG editor with details/summary support"
      .content=${args.content}
      .extensions=${args.extensions}
      .toolbarOptions=${toolbarOptions}></clabs-wysiwyg>`;
  },
};

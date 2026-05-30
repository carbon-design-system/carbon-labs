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

export default {
  title: 'Components/Wysiwyg',
  component: 'clabs-wysiwyg',
  parameters: {
    docs: {
      story: {
        name: 'Toolbar Options',
      },
    },
  },
};

/**
 * Story demonstrating toolbar customization options
 */
export const ToolbarOptions = {
  args: {
    content:
      "<p>This editor demonstrates toolbar customization. Toolbar items render in the passed order. Specific toolbar groups or items within groups can be hidden as per your choice.</p><p><strong>Toolbar behavior:</strong></p><ul><li>Don't pass <code>.toolbarOptions</code> (undefined) → Renders all default toolbar groups</li><li>Pass <code>.toolbarOptions={[]}</code> (empty array) → Renders no toolbar at all</li><li>Pass <code>.toolbarOptions={[...]}</code> (with items) → Renders custom toolbar (this story)</li></ul>",
    toolbarOptions: [
      // Custom order: clipboard first
      {
        name: 'clipboard',
        enabled: true,
        items: {
          cut: false, // Hide cut button
          copy: true,
          paste: true,
        },
      },
      // Headings (all items shown by default)
      { name: 'headings', enabled: true },
      // Text formatting with selective items
      {
        name: 'textFormatting',
        enabled: true,
        items: {
          bold: true,
          italic: true,
          underline: false, // Hide underline
          strikethrough: false, // Hide strikethrough
          code: true,
        },
      },
      // Include color picker (all items shown by default)
      { name: 'colorPicker', enabled: true },
      // Lists with selective items

      {
        name: 'lists',
        enabled: true,
        items: {
          bulletList: true,
          numberedList: true,
          taskList: false, // Hide task list
        },
      },
      // Alignment with selective items
      {
        name: 'alignment',
        enabled: true,
        items: {
          left: true,
          center: true,
          right: false, // Hide right align
          justify: false, // Hide justify
        },
      },
      // Blocks with selective items
      {
        name: 'blocks',
        enabled: true,
        items: {
          blockquote: true,
          codeBlock: false, // Hide code block
        },
      },
      // Insert with selective items
      {
        name: 'insert',
        enabled: true,
        items: {
          table: true,
          link: true,
          image: false, // Hide image
          attachment: false, // Hide attachment
        },
      },
      // Table operations at the end
      { name: 'tableOperations', enabled: true },
    ],
  },

  /**
   * Renders the template for Storybook
   * @param {object} args Storybook arguments
   * @returns {TemplateResult<1>}
   */
  render: (args) => {
    return html`<clabs-wysiwyg
      aria-label="WYSIWYG editor with custom toolbar"
      .content=${args.content}
      .toolbarOptions=${args.toolbarOptions}></clabs-wysiwyg>`;
  },
};

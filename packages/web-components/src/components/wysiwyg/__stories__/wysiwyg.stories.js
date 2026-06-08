/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import '../components/wysiwyg/wysiwyg';
import { demoContent, allExtensions } from './story-helpers.js';
import '@carbon/web-components/es/components/button/index.js';

/**
 * WYSIWYG Editor component built with TipTap
 */
export default {
  title: 'Components/Wysiwyg',
  tags: ['squad', 'incubating'],
  component: 'clabs-wysiwyg',
  argTypes: {
    toolbarSize: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Toolbar button size',
    },
    content: {
      control: 'text',
      description: 'Initial content of the editor',
    },
  },
  args: {
    toolbarSize: 'md',
    content: demoContent,
  },
  decorators: [
    (story) => html`
      <style>
        #main-content {
          block-size: 100dvh;
        }
      </style>
      ${story()}
    `,
  ],
};

/**
 * Default story with all extensions enabled and comprehensive demo content
 */
export const Default = {
  /**
   * Render the WYSIWYG editor with all extensions
   * @param {object} args - Story arguments
   * @returns {TemplateResult} Template result
   */
  render: (args) => {
    return html`
      <clabs-wysiwyg
        .extensions=${allExtensions}
        .content=${args.content}
        @content-change=${(e) => {
          console.log('content-change', e);
        }}
        toolbar-size=${args.toolbarSize}>
      </clabs-wysiwyg>
    `;
  },
};

/**
 * Editor without toolbar - extensions are used but toolbar is hidden
 */
export const NoToolbar = {
  /**
   * Render the WYSIWYG editor without toolbar
   * @param {object} args - Story arguments
   * @returns {TemplateResult} Template result
   */
  render: (args) => {
    // Strip toolbarRender from extensions to hide toolbar
    const extensionsForEditor = allExtensions.map(
      ({ toolbarRender: _toolbarRender, ...extension }) => extension
    );

    return html`
      <clabs-wysiwyg
        .extensions=${extensionsForEditor}
        .content=${args.content}
        @content-change=${(e) => {
          console.log('content-change', e);
        }}
        toolbar-size=${args.toolbarSize}>
      </clabs-wysiwyg>
    `;
  },
};

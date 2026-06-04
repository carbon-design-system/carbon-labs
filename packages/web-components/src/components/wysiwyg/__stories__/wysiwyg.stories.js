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
  },
  args: {
    toolbarSize: 'md',
  },
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
    setTimeout(() => {
      const editor = document.querySelector('#default-wysiwyg');
      if (editor && !editor.dataset.listenerAttached) {
        editor.dataset.listenerAttached = 'true';

        editor.addEventListener('content-change', (event) => {
          const { content, markdown } = event.detail;
          console.log('Content:', content);
          console.log('Markdown:', markdown);
        });
      }
    }, 100);

    return html`
      <clabs-wysiwyg
        id="default-wysiwyg"
        .extensions=${allExtensions}
        .content=${demoContent}
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
        .content=${demoContent}
        toolbar-size=${args.toolbarSize}>
      </clabs-wysiwyg>
    `;
  },
};

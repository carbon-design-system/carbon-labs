/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '../components/file-uploader-button/file-uploader-button';
import { html } from 'lit';

/**
 * More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
 */
export default {
  title: 'Components/File Uploader Button',
  tags: ['squad', 'incubating'],
  component: 'clabs-file-uploader-button',
  argTypes: {
    multiple: {
      control: 'boolean',
      description: 'Allow multiple file selection',
      table: {
        category: 'Controls',
        defaultValue: { summary: 'false' },
      },
    },
  },
};

/**
 * Default story
 */
export const Default = {
  args: {
    multiple: false,
  },

  /**
   * Renders the template for Storybook
   * @param {object} args Storybook arguments
   * @returns {TemplateResult<1>}
   */
  render: (args) => {
    return html`
      <clabs-file-uploader-button ?multiple=${args.multiple}>
      </clabs-file-uploader-button>
    `;
  },
};

/**
 * Multiple file selection story
 */
export const Multiple = {
  args: {
    multiple: true,
  },

  /**
   * Renders the template for Storybook
   * @param {object} args Storybook arguments
   * @returns {TemplateResult<1>}
   */
  render: (args) => {
    return html`
      <clabs-file-uploader-button ?multiple=${args.multiple}>
      </clabs-file-uploader-button>
    `;
  },
};

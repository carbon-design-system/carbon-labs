/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '../fileUploadElement';
import { html } from 'lit';

// More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
export default {
  title: 'Components/Chat/File Upload',
  tags: ['autodocs'],
};

export const Default = {
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html` <clabs-chat-file-upload content="Test_file.pdf">
  </clabs-chat-file-upload>`,
};

export const Showcase = {
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html`
    <h4>Loading</h4>
    <br />
    <clabs-chat-file-upload content="Filename.pdf"> </clabs-chat-file-upload>
    <h4>Success</h4>
    <br />
    <clabs-chat-file-upload status="success" content="Filename.pdf">
    </clabs-chat-file-upload>
    <h4>Close</h4>
    <br />
    <clabs-chat-file-upload status="close" content="Filename.pdf">
    </clabs-chat-file-upload>
    <h4>Error</h4>
    <br />
    <clabs-chat-file-upload
      status="error"
      error-message="File exceeds size limit"
      content="Filename.pdf">
    </clabs-chat-file-upload>
  `,
};

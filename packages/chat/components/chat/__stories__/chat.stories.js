/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '../chat';
import { html } from 'lit';

// More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
export default {
  title: 'Components/Chat/Chat',
  tags: ['autodocs'],
};

export const Default = {
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html`
    <c4ai-chat
      model="llama-2"
      userprompt="You are Watson, you will answer all my questions."
      api-url="https://bam-api.res.ibm.com/v1/generate"
      feedback-url="https://localhost:5000/feeback"
      temperature="0.0"
      username="user"
      agentname="bot"
      theme="light"></c4ai-chat>
  `,
};

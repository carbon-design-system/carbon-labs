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
import '@carbon/web-components/es/components/button/index.js';

// More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
export default {
  title: 'Components/Chat/Chat',
  tags: ['autodocs'],
};

const defaultArgs = {
  sampleQuery: 'None',
  apiUrl: 'https://cloud.ibm.com...',
  apiKey: 'xxxxxx',
  model: 'llama-2',
  feedbackUrl: 'localhost:5001/feedback',
  userPrompt:
    'You are Watson, a helpful and polite assistant. You will answer all my questions to the best of your knowledge.',
};

const controls = {
  sampleQuery: {
    control: 'select',
    description: 'Premade demo queries:',
    options: [
      'None',
      'Python code with images',
      'Greetings',
      'List of flowers',
      'Chessboard in HTML/CSS',
    ],
  },
  apiUrl: {
    control: 'text',
    description: 'Specify custom API url:',
  },
  apiKey: {
    control: 'text',
    description: 'Specify API key:',
  },
  feedbackUrl: {
    control: 'text',
    description: 'Specify API url for feeback buttons:',
  },
  userPrompt: {
    control: 'text',
    description: 'Specify additional system prompt for model:',
  },
  model: {
    control: 'select',
    description: 'Select model:',
    options: ['llama-2'],
  },
};

export const Default = {
  /**
   * Renders the template for Default Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html`
    <c4ai-chat
      model="llama-2"
      user-prompt="You are Watson, you will answer all my questions."
      api-url="https://bam-api.res.ibm.com/v1/generate"
      feedback-url="https://localhost:5000/feeback"
      temperature="0.0"
      user-name="user"
      agent-name="bot"
      theme="light"
      sample-query="Greetings"></c4ai-chat>
  `,
};

export const Playground = {
  argTypes: controls,
  args: defaultArgs,
  /**
   * Renders the template for Playground Storybook
   * @param {Object} args - arguments to be sent into the playbook
   * @param {string} args.apiUrl - api url provided in playground
   * @param {string} args.apiKey - api key provided in playground
   * @param {string} args.feedbackUrl - feedback api url for buttons provided in playground
   * @param {string} args.userPrompt - user specific prompt provided in playground
   * @param {string} args.sampleQuery - preset to test and demo
   * @returns {TemplateResult<1>}
   */
  render: ({ apiUrl, apiKey, feedbackUrl, userPrompt, sampleQuery }) => html`
    <c4ai-chat
      model="llama-2"
      user-prompt="${userPrompt}"
      api-url="${apiUrl}"
      api-key="${apiKey}"
      sample-query="${sampleQuery}"
      feedback-url="${feedbackUrl}"
      temperature="0.0"
      user-name="user"
      agent-name="bot"
      theme="light"
      sample-query="${sampleQuery}"></c4ai-chat>
  `,
};

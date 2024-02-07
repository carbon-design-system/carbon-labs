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
  chosenHost: 'Local',
  userPrompt:
    'You are Watson, a helpful and polite assistant. You will answer all my questions to the best of your knowledge.',
  apiUrl: 'http://localhost:5001/generate',
  apiKey: '',
  projectId: '',
  model: 'llama-2',
  temperature: '',
  feedbackUrl: 'http://localhost:5001/feedback',
};

const controls = {
  sampleQuery: {
    control: { type: 'select' },
    description: 'Premade demo queries:',
    options: [
      'None',
      'Moon landing',
      'Python code with images',
      'Greetings',
      'List of flowers',
      'Chessboard in HTML/CSS',
    ],
  },
  chosenHost: {
    control: { type: 'select' },
    description: 'Select between Watsonx.ai, Local or the BAM Research service',
    options: ['Local', 'Watsonx.ai', 'BAM'],
  },
  userPrompt: {
    control: { type: 'text' },
    description: 'Specify additional system prompt for model',
  },
  apiUrl: {
    control: { type: 'text' },
    description: 'Specify custom API url',
  },
  apiKey: {
    control: { type: 'text' },
    description: 'Specify API key',
  },
  projectId: {
    control: { type: 'text' },
    description: 'Specify IBM Cloud project ID (Only for Watsonx.ai)',
  },
  model: {
    control: { type: 'select' },
    description: 'Select model',
    options: ['llama-2'],
  },
  temperature: {
    control: { type: 'text' },
    description: 'Specify Model temperature',
  },
  feedbackUrl: {
    control: { type: 'text' },
    description: 'Specify API url for feeback buttons',
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
      user-prompt="You are Watson, you will answer all my questions to the best fo your knowledge."
      chosen-host="local"
      api-url="http://localhost:5001/generate"
      api-key="xxx"
      feedback-url="http://localhost:5001/feeback"
      temperature="0.0"
      chosen-host="local"
      user-name="user"
      agent-name="bot"
      theme="light"
      sample-query="Greetings"></c4ai-chat>
  `,
};

export const Playground = {
  argTypes: controls,
  args: defaultArgs,
  parameters: {
    controls: {
      expanded: true,
    },
  },
  /**
   * Renders the template for Playground Storybook
   * @param {Object} args - arguments to be sent into the playbook
   * @param {string} args.apiUrl - api url provided in playground
   * @param {string} args.apiKey - api key provided in playground
   * @param {string} args.feedbackUrl - feedback api url for buttons provided in playground
   * @param {string} args.userPrompt - user specific prompt provided in playground
   * @param {string} args.sampleQuery - preset to test and demo
   * @param {string} args.temperature - model temperature
   * @param {string} args.chosenHost - internal flag for packaging query
   * @param {string} args.projectId - watsonX only, target instance ID
   * @returns {TemplateResult<1>}
   */
  render: ({
    apiUrl,
    apiKey,
    feedbackUrl,
    userPrompt,
    sampleQuery,
    temperature,
    chosenHost,
    projectId,
  }) => html`
    <c4ai-chat
      model="llama-2"
      user-prompt="${userPrompt}"
      api-url="${apiUrl}"
      api-key="${apiKey}"
      sample-query="${sampleQuery}"
      feedback-url="${feedbackUrl}"
      temperature="${temperature}"
      chosen-host="${chosenHost}"
      project-id="${projectId}"
      user-name="user"
      agent-name="bot"
      theme="light"
      sample-query="${sampleQuery}"></c4ai-chat>
  `,
};

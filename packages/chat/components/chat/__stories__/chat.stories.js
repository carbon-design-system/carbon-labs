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
  conversation: 'None',
  chosenHost: 'Local',
  userPrompt:
    'You are Watson, a helpful and polite assistant. You will answer all my questions to the best of your knowledge.',
  apiUrl: 'http://localhost:5001/generate',
  model: 'llama-2',
  temperature: '',
  feedbackUrl: 'http://localhost:5001/feedback',
};

const controls = {
  sampleQuery: {
    control: { type: 'select' },
    description: 'Premade raw text queries:',
    options: [
      'None',
      'Moon landing',
      'Top Websites',
      'Python code with images',
      'Greetings',
      'List of flowers',
      'Chessboard in HTML/CSS',
    ],
  },
  conversation: {
    control: { type: 'select' },
    description: 'Premade JSON object queries',
    options: ['None', 'Nature of art', 'Flowers', 'Hello', 'Visualization'],
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
      user-name="user"
      agent-name="bot"
      .conversation="${[
        {
          text: 'Greetings, how may I help you?',
          origin: 'bot',
          hasError: false,
          time: '4:56pm',
          index: 0,
          disableButtons: true,
          elements: [
            {
              content: 'Greetings, how may I help you?',
              type: 'text',
            },
          ],
        },
      ]}"
      @on-submit="${(event) => {
        console.log(event);
      }}"></c4ai-chat>
  `,
};

export const Playground = {
  argTypes: controls,
  args: defaultArgs,
  parameters: {
    controls: {
      expanded: true,
    },
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'storybook-default',
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
   * @param {Object} args.conversation - array of message object to render
   * @returns {TemplateResult<1>}
   */
  render: ({
    apiUrl,
    feedbackUrl,
    userPrompt,
    sampleQuery,
    temperature,
    chosenHost,
    conversation,
  }) => html`
    <div style="height:calc(100vh - 84px); overflow:hidden;">
      <c4ai-chat
        model="llama-2"
        user-prompt="${userPrompt}"
        api-url="${apiUrl}"
        sample-query="${sampleQuery}"
        feedback-url="${feedbackUrl}"
        temperature="${temperature}"
        chosen-host="${chosenHost}"
        conversation-example="${conversation}"
        user-name="user"
        agent-name="bot"
        theme="light">
      </c4ai-chat>
    </div>
  `,
};

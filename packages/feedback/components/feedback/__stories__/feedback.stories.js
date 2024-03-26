/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import '../feedback';
import Flag24 from '@carbon/web-components/es/icons/flag/24.js';
import { html } from 'lit';
/**
 * More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
 */

export default {
  title: 'Components/Feedback/Feedback',
  tags: ['autodocs'],
};

const defaultArgs = {
  /**
   *
   * @param {CustomEvent} event custom event fires when new message is generated
   */
  'on-feedback-delete': (event) => console.log(event),
  /**
   *
   * @param {CustomEvent} event custom event fires when feedback saved
   */
  'on-feedback-save': (event) => console.log(event),
  model: 'llama-2',
  'generation-id': '2289fec2-93a5-4274-b62b-c905bffcdc3c',
  input: 'What is Lorem Ipsum?',
  output:
    'The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.',
  'feedback-list': [
    {
      feedbackId: '386a4a10-49a4-47c0-9ef0-2eeb8280f97a',
      generationId: '2289fec2-93a5-4274-b62b-c905bffcdc3c',
      startIndex: 4,
      endIndex: 18,
      selectedText: 'standard chunk',
      suggestedText: 'standard chunk',
      feedbackType: ['SOCIAL_BIAS'],
      comment: 'standard part',
    },
    {
      feedbackId: 'd25da065-b9f4-4542-8b9d-9bfb4496e3d7',
      generationId: '2289fec2-93a5-4274-b62b-c905bffcdc3c',
      startIndex: 22,
      endIndex: 54,
      selectedText: 'Lorem Ipsum used since the 1500s',
      suggestedText: 'Lorem Ipsum used since the 1500s',
      feedbackType: ['HAP'],
      comment: 'testing',
    },
  ],
};

/* Default controls */
const defaultControls = {
  model: {
    control: { type: 'text' },
    description: 'AI model name',
  },
  input: {
    control: { type: 'text' },
    description: 'Input given to AI model',
  },
  output: {
    control: { type: 'text' },
    description: 'Output generated by AI model',
  },
  'generation-id': {
    control: { type: 'text' },
    description: 'ID for AI generated content',
  },
  'on-feedback-save': {
    control: { type: 'function' },
    description:
      'Event fires when a feedback saved or updated and gives the feedback object',
  },
  'on-feedback-delete': {
    control: { type: 'function' },
    description:
      'Event fires when a feedback gets deleted and gives the feedback id',
  },
  'feedback-list': {
    control: { type: 'array' },
    description: 'List of existing feedback to be visualised on generated text',
  },
};
/**
 * More on writing stories with args: https://storybook.js.org/docs/web-components/writing-stories/args
 *
 * @type {{args: {label: string}, render: (function(*): TemplateResult<1>)}}
 */
export const Default = {
  argTypes: defaultControls,
  args: {
    ...defaultArgs,
    'feedback-list': [
      {
        feedbackId: '386a4a10-49a4-47c0-9ef0-2eeb8280f97a',
        generationId: '2289fec2-93a5-4274-b62b-c905bffcdc3c',
        startIndex: 4,
        endIndex: 18,
        selectedText: 'standard chunk',
        suggestedText: 'standard chunk',
        feedbackType: ['SOCIAL_BIAS'],
        comment: 'standard part',
      },
      {
        feedbackId: 'd25da065-b9f4-4542-8b9d-9bfb4496e3d7',
        generationId: '2289fec2-93a5-4274-b62b-c905bffcdc3c',
        startIndex: 22,
        endIndex: 54,
        selectedText: 'Lorem Ipsum used since the 1500s',
        suggestedText: 'Lorem Ipsum used since the 1500s',
        feedbackType: ['HAP'],
        comment: 'testing',
      },
      {
        feedbackId: '8d68871b-7f00-40ca-9828-a36689fb04a4',
        generationId: '2289fec2-93a5-4274-b62b-c905bffcdc3c',
        startIndex: 223,
        endIndex: 245,
        selectedText: 'accompanied by English',
        suggestedText: 'accompanied by English',
        feedbackType: ['HAP', 'PII'],
        comment: '',
      },
      {
        feedbackId: '43d906de-9333-448b-97da-07819381b6a4',
        generationId: '2289fec2-93a5-4274-b62b-c905bffcdc3c',
        startIndex: 166,
        endIndex: 192,
        selectedText: 'Cicero are also reproduced',
        suggestedText: 'Cicero are also reproduced',
        feedbackType: ['HAP'],
        comment: '',
      },
    ],
  },

  parameters: {
    disable: true,
    docs: { inlineStories: false, iframeHeight: 1200 },
    controls: {
      expanded: true,
    },
  },

  /**
   * Renders the template for Storybook
   * @param {object} args Storybook arguments
   * @returns {TemplateResult<1>}
   */
  render: (args) =>
    html`
      <clabs-feedback
        @on-feedback-delete=${args['on-feedback-delete']}
        @on-feedback-save=${args['on-feedback-save']}
        model=${args.model}
        input=${args.input}
        output=${args.output}
        generation-id=${args['generation-id']}
        .feedbackList=${args['feedback-list']}
        icon=${args.icon}>
        ${Flag24({ slot: 'icon' })} ${args.output}
      </clabs-feedback>
    `,
};

export const Playground = {
  argTypes: defaultControls,
  args: {
    ...defaultArgs,
    /**
     *
     * @param {CustomEvent} event custom event fires when new message is generated
     */ 'on-feedback-delete': (event) => console.log(event.detail),
    /**
     *
     * @param {CustomEvent} event custom event fires when feedback saved
     */
    'on-feedback-save': (event) => console.log(event.detail),
  },
  parameters: {
    docs: { inlineStories: false, iframeHeight: 1200 },
    controls: {
      expanded: true,
    },
  },

  /**
   * Renders the template for Storybook
   * @param {object} args Storybook arguments
   * @returns {TemplateResult<1>}
   */
  render: (args) =>
    html`
      <clabs-feedback
        @on-feedback-delete=${args['on-feedback-delete']}
        @on-feedback-save=${args['on-feedback-save']}
        model=${args.model}
        input=${args.input}
        output=${args.output}
        generation-id=${args['generation-id']}
        .feedbackList=${args['feedback-list']}
        icon=${args.icon}>
        ${Flag24({ slot: 'icon' })} ${args.output}
      </clabs-feedback>
    `,
};

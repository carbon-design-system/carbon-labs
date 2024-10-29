/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '../popupElement';
import { html } from 'lit';

// More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
export default {
  title: 'Components/Chat/Popup',
  tags: ['autodocs'],
};

const slugContent = {
  title: 'AI explainability',
  prompt: 'IBM Cloud AI assistant',
  responsePlaceholder: 'Describe issues with this response',
  disableTextArea: true,
  description:
    'The AI assistant is designed as a retrieval-augmented generation (RAG) that is running against IBM© large language models',
  showList: true,
  listTitle: 'How it works',
  listItems: [
    {
      title: 'Globalize',
      text: 'You can ask your questions and get an answer in any of the 10 languages supported by IBM Cloud',
    },
    {
      title: 'Query',
      text: 'The IBM Cloud docs are searched to find topics with facts about your question',
    },
    {
      title: 'Generate',
      text: 'Answers are generated ground in the IBM Cloud Docs',
    },
    {
      title: 'Verify',
      text: 'With each question you ask, sorce citations from the IBM Cloud docs are provided to verify responses',
    },
  ],
  model: { name: 'granite.13.chat.v2', url: 'https://www.google.com' },
};

const defExample = {
  title: 'Example text',
  tags: [
    'A',
    'random long text to text label length to the ends of the component',
    'lorem ipsum dolor',
    'lorem ipsum dolor',
  ],
  prompt: 'What was unsatisfactory about this response?',
  responsePlaceholder: 'Describe issues with this response',
  dataCollectionTitle: 'I allow IBm to collect my feedback',
  enableDataCollectionCheck: true,
  disclaimer:
    'Lorem ipsum dolor sit amet, di os consectetur adipiscing elit, sed doeiusmod tempor incididunt ut fsil labore et dolore magna aliqua.',
};
const hateExample = {
  title: 'Hate speech violation',
  prompt: 'Help us do better',
  responsePlaceholder: 'Describe issues with this response',
  disableTextArea: true,
  description:
    'Select the severity of this violation and provide details if needed',
  radioTitle: 'Severity',
  radioButtons: [
    { value: 0, text: 'mild' },
    { value: 1, text: 'concerning' },
    { value: 2, text: 'elevated' },
    { value: 3, text: 'serious' },
    { value: 5, text: 'very serious' },
  ],
  model: { name: 'granite.13.chat.v2', url: 'https://www.google.com' },
  dataCollectionTitle: 'I allow IBm to collect my feedback',
  enableDataCollectionCheck: false,
};

const customStyle = 'width: 100%; height:500px;display:flex;';
export const Default = {
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html`
    <div style="display:flex;gap:16px;">
      <div style="${customStyle}">
        <h4>Default</h4>
        <clabs-chat-popup> </clabs-chat-popup>
      </div>
      <div style="${customStyle}">
        <h4>Custom</h4>
        <clabs-chat-popup
          prompt-title="Custom title"
          text-area-placeholder="Custom placeholder"
          popup-title="Custom title"
          orientation="top"
          .tagList="${'["choice A","choice B","choice B","choice B","choice B", "choice Cddfsk;llkdsklfd"]'}"
          disclaimer="Place your own legal disclaimer here">
        </clabs-chat-popup>
      </div>
      <div style="${customStyle}">
        <h4>Experimental - advanced</h4>
        <clabs-chat-popup .feedbackFormValues="${slugContent}">
        </clabs-chat-popup>
      </div>

      <div style="${customStyle}">
        <h4>Experimental - advanced</h4>
        <clabs-chat-popup .feedbackFormValues="${defExample}">
        </clabs-chat-popup>
      </div>

      <div style="${customStyle}">
        <h4>Hate speech example</h4>
        <clabs-chat-popup .feedbackFormValues="${hateExample}">
        </clabs-chat-popup>
      </div>
    </div>
  `,
};

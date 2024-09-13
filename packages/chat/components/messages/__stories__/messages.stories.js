/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '../messages';
import { html } from 'lit';

// More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
export default {
  title: 'Components/Chat/Messages',
  tags: ['autodocs'],
};

const messages = [
  {
    origin: 'user',
    userSubmitted: true,
    hasError: false,
    time: '8:51',
    index: 0,
    elements: [{ content: 'what is the nature of art?', type: 'text' }],
  },
  {
    origin: 'bot',
    hasError: false,
    time: '8:51',
    index: 1,
    elements: [
      {
        content:
          'the nature of art is a complex and multifaceted topic that has been debated by philosophers, critics, and scholars for centuries. at its core, art is the creation of aesthetic objects or experiences that are intended to elicit an emotional response from the viewer. this can take many forms, including painting, sculpture, photography, music, and literature.\n\nart can serve a variety of purposes, including the expression of the artists personal vision, the exploration of complex social or political issues, or the simple enjoyment of beauty. the nature of art is also influenced by cultural and historical context, and can evolve over time as new techniques and materials are developed.',
        type: 'text',
      },
    ],
  },
  {
    origin: 'user',
    hasError: false,
    userSubmitted: true,
    time: '8:52',
    index: 2,
    elements: [
      {
        content: 'how much do aesthetics play into it?',
        type: 'text',
      },
    ],
  },
  {
    origin: 'bot',
    hasError: false,
    time: '8:52',
    index: 3,
    elements: [
      {
        content:
          'aesthetics play a significant role in the creation and appreciation of art. the aesthetic qualities of a piece of art, such as its form, color, and composition, are often a key factor in determining its overall effectiveness and appeal. in addition, the aesthetic principles that underlie a work of art can influence its interpretation and meaning.',
        type: 'text',
      },
    ],
  },
  {
    origin: 'user',
    hasError: false,
    userSubmitted: true,
    time: '8:53',
    index: 4,
    elements: [
      {
        content:
          'Should aesthetics not matter if its a purely subjective interpretation?',
        type: 'text',
      },
    ],
  },
  {
    origin: 'bot',
    hasError: false,
    time: '8:53',
    index: 5,
    elements: [
      {
        content:
          'while aesthetic evaluations are subjective, they can still provide valuable insights into the ways in which art can be appreciated and understood. the aesthetic qualities of a piece of art can influence how it is experienced and interpreted, and can also reflect the cultural and historical context in which it was created.',
        type: 'text',
      },
    ],
  },
];
export const Default = {
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html` <clabs-chat-messages .messages="${messages}">
  </clabs-chat-messages>`,
};

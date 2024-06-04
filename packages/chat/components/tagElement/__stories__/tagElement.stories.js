/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '../tagElement';
import { html } from 'lit';

// More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
export default {
  title: 'Components/Chat/Tag',
  tags: ['autodocs'],
};

const defaultArgs = {
  content: 'My tag text',
  color: '#67ba6e',
};

const defaultControls = {
  content: {
    control: { type: 'text' },
    description: 'Text inside the tag',
  },
  color: {
    control: { type: 'color' },
    description: 'Left border color',
  },
};

export const Default = {
  argTypes: defaultControls,
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
   * Renders the template for Storybook
   * @param {string} args.content - content to generate from
   * @returns {TemplateResult<1>}
   */
  render: ({ content, color }) =>
    html` <clabs-chat-tag .color=${color}>${content}</clabs-chat-tag>`,
};

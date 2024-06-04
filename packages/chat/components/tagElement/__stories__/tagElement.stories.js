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
  text: 'Default tag text',
  color: '#67ba6e',
  tooltipPosition: 'bottom',
  tooltipText: 'Default tooltip text',
};

const defaultControls = {
  text: {
    control: { type: 'text' },
    description: 'Text inside the tag',
  },
  color: {
    control: { type: 'color' },
    description: 'Left border color',
  },
  tooltipPosition: {
    control: { type: 'radio' },
    options: ['top', 'left', 'right', 'bottom'],
    description: 'Tooltip position relative to the tag',
  },
  toolTipText: {
    control: { type: 'text' },
    description: 'Text inside the tooltip',
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
  render: ({ text, color, tooltipPosition, tooltipText }) =>
    html` <clabs-chat-tag
      .color=${color}
      .tooltipPosition=${tooltipPosition}
      .tooltipText="${tooltipText}"
      >${text}</clabs-chat-tag
    >`,
};

/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import '../components/tag/tag';
import { html } from 'lit';
import { action } from 'storybook/actions';

export default {
  title: 'Components/Research/Tag',
  component: 'clabs-tag',
};

const defaultArgs = {
  text: 'Default tag text',
  color: 'green',
  tooltipPosition: 'bottom',
  tooltipText: 'Default tooltip text',
  /**
   *
   * @param {CustomEvent} event custom event fires when new message is generated
   */
  onClick: action('tag-click'),
};

/* Default controls */
const defaultControls = {
  text: {
    control: { type: 'text' },
    description: 'Text inside the tag',
  },
  color: {
    control: { type: 'select' },
    options: [
      'red',
      'magenta',
      'purple',
      'blue',
      'cyan',
      'teal',
      'green',
      'gray',
      'cool-gray',
      'warm-gray',
    ],
    description: 'Left border color',
  },
  tooltipPosition: {
    control: { type: 'radio' },
    options: ['top', 'left', 'right', 'bottom'],
    description: 'Tooltip position relative to the tag',
  },
  tooltipText: {
    control: { type: 'text' },
    description: 'Text inside the tooltip',
  },
  'tooltip-position': {
    table: {
      disable: true,
    },
  },
  'tooltip-text': {
    table: {
      disable: true,
    },
  },
  onClick: {
    table: {
      disable: true,
    },
  },
};
/**
 * More on writing stories with args: https://storybook.js.org/docs/web-components/writing-stories/args
 *
 * @type {{args: {label: string}, render: (function(*): TemplateResult<1>)}}
 */
export const Default = {
  argTypes: defaultControls,
  args: defaultArgs,
  /**
   * Renders the template for Storybook
   * @param {string} text - text
   * @param {string} color - color
   * @param {string} tooltipPosition - tooltip position
   * @param {string} tooltipText - tooltip text
   * @param {function} onClick - onclick
   * @returns {TemplateResult<1>}
   */
  render: ({ text, color, tooltipPosition, tooltipText, onClick }) =>
    html` <clabs-tag
      color=${color}
      tooltip-position=${tooltipPosition}
      tooltip-text=${tooltipText}
      @tag-click=${onClick}
      >${text}</clabs-tag
    >`,
};

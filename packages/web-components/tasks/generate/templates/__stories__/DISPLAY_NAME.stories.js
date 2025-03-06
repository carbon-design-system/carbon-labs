/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '../components/DISPLAY_NAME/DISPLAY_NAME';
import { html } from 'lit';
import ArrowRight16 from '@carbon/web-components/es/icons/arrow--right/16';

/**
 * More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
 */
export default {
  title: 'Components/TITLE_NAME',
  component: 'clabs-DISPLAY_NAME',
};

/**
 * More on writing stories with args: https://storybook.js.org/docs/web-components/writing-stories/args
 *
 * @type {{args: {label: string}, render: (function(*): TemplateResult<1>)}}
 */
export const Default = {
  args: {
    label: 'TITLE_NAME',
  },

  /**
   * Renders the template for Storybook
   * @param {object} args Storybook arguments
   * @returns {TemplateResult<1>}
   */
  render: (args) =>
    html` <clabs-DISPLAY_NAME>
      ${args.label}${ArrowRight16({ slot: 'icon' })}
    </clabs-DISPLAY_NAME>`,
};

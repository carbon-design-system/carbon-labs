/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '../components/example-button/example-button';
import { html } from 'lit';
import ArrowRight16 from '@carbon/icons/es/arrow--right/16';
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';

/**
 * More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
 */
export default {
  title: 'Components/Example button',
  component: 'clabs-example-button',
};

/**
 * More on writing stories with args: https://storybook.js.org/docs/web-components/writing-stories/args
 *
 * @type {{args: {label: string}, render: (function(*): TemplateResult<1>)}}
 */
export const Default = {
  args: {
    label: 'Example button',
  },

  /**
   * Renders the template for Storybook
   * @param {object} args Storybook arguments
   * @returns {TemplateResult<1>}
   */
  render: (args) =>
    html` <clabs-example-button>
      ${args.label}${iconLoader(ArrowRight16, { slot: 'icon' })}
    </clabs-example-button>`,
};

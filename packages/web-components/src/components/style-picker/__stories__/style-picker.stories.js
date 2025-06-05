/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import '../components/style-picker/style-picker';
import ArrowRight16 from '@carbon/web-components/es/icons/arrow--right/16';
import { POPOVER_ALIGNMENT } from '@carbon/web-components/es/components/popover/defs';
import '@carbon/web-components/es/components/button/button.js';

/**
 * More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
 */
export default {
  title: 'Components/Style Picker',
  component: 'clabs-style-picker',
};

/**
 * More on writing stories with args: https://storybook.js.org/docs/web-components/writing-stories/args
 *
 * @type {{args: {label: string}, render: (function(*): TemplateResult<1>)}}
 */
export const Default = {
  args: {
    label: 'Style Picker',
  },

  /**
   * Renders the template for Storybook
   * @param {object} args Storybook arguments
   * @returns {TemplateResult<1>}
   */
  render: (args) =>
    html` <clabs-style-picker open>
      <cds-button slot="trigger">Trigger</cds-button>
    </clabs-style-picker>`,
};

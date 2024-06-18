/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import '../components/prompt-tuning/prompt-tuning';
import { html } from 'lit';

import '@carbon/web-components/es/components/button/index.js';

export default {
  title: 'Components/Prompt Tuning/Prompt Tuning',
  component: 'clabs-prompt-tuning',
};

const defaultArgs = {
  text: 'Default prompt-tuning text',
};

/* Default controls */
const defaultControls = {
  text: {
    control: { type: 'text' },
    description: 'Text inside the prompt-tuning',
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
   * @param {string} args.content - content to generate from
   * @returns {TemplateResult<1>}
   */
  render: ({ text }) =>
    html` <cds-button id="modal-open-button"> Tune prompts </cds-button>

      <clabs-prompt-tuning>${text}</clabs-prompt-tuning>

      <script type="text/javascript">
        const button = document.getElementById('modal-open-button');
        const component = document.getElementsByTagName(
          'clabs-prompt-tuning'
        )[0];
        button.addEventListener('click', () => {
          // const modal =
          //   component.shadowRoot.getElementById('modal-prompt-list');
          component.isListModalOpen = true;
        });
      </script>`,
};

/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import '../feedback';

import { html } from 'lit';
/**
 * More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
 */

export default {
  title: 'Components/Chat/Feedback',
  tags: ['autodocs'],
};

/**
 * More on writing stories with args: https://storybook.js.org/docs/web-components/writing-stories/args
 *
 * @type {{args: {label: string}, render: (function(*): TemplateResult<1>)}}
 */
export const Default = {
  args: {
    apiKey: '',
    userId: '',
    'ai-model': '',
    input: 'What is Lorem Ipsum?',
    output:
      'The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.',
  },

  parameters: {
    docs: { inlineStories: false, iframeHeight: 1200 },
  },

  /**
   * Renders the template for Storybook
   * @param {object} args Storybook arguments
   * @returns {TemplateResult<1>}
   */
  render: (args) => html`
    <h5>${args.input}</h5>
    <br />
    <c4ai-feedback
      api-key=${args.apiKey}
      user=${args.userId}
      ai-model=${args['ai-model']}
      input=${args.input}
      output=${args.output}>
      ${args.output}
    </c4ai-feedback>
  `,
};

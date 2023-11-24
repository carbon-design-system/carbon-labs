/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '../components/feedback-container/feedback-container';
import '../components/input-container/input-container';
import '../components/output-container/output-container';

import { html } from 'lit';

let hello = 'sajnsjankjnsa';
let isVisible = false;
setTimeout(() => {
  isVisible = true;
}, 3000);
/**
 * More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
 */
export default {
  title: 'Components/Feedback container/Feedback container',
  tags: ['autodocs'],
};

/**
 * More on writing stories with args: https://storybook.js.org/docs/web-components/writing-stories/args
 *
 * @type {{args: {label: string}, render: (function(*): TemplateResult<1>)}}
 */
export const Default = {
  args: {
    label: 'Feedback container',
  },

  /**
   * Renders the template for Storybook
   * @param {object} args Storybook arguments
   * @returns {TemplateResult<1>}
   */
  render: (args) =>
    html`
      <c4ai-feedback-container
        api-key="some-api-key"
        user="priyanshu.rai@ibm.com"
        model="">
        <c4ai-output-container>
          <p>Hello, How can i help you today</p>
        </c4ai-output-container>
        <c4ai-input-container>
          <p>Hello! how are you?</p>
        </c4ai-input-container>
        <c4ai-output-container>
          <p>I'm just a computer program, but thanks for asking!</p>
        </c4ai-output-container>
        <c4ai-input-container>
          <p>How's weather today outside?</p>
        </c4ai-input-container>
        <c4ai-output-container>
          <p>It's 15.0 degree celcius today</p>
        </c4ai-output-container>
      </c4ai-feedback-container>
    `,
};

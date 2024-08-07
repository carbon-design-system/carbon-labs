/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '../footer';
import { html } from 'lit';

// More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
export default {
  title: 'Components/Chat/Footer',
  tags: ['autodocs'],
};

export const Default = {
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html` <h4>Default Input</h4>
    <br />
    <clabs-chat-footer> </clabs-chat-footer>`,
};

export const Showcase = {
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html` <h4>Default Input</h4>
    <br />
    <br />
    <div style="position:relative; top:40px;">
      <clabs-chat-footer> </clabs-chat-footer>
    </div>
    <br />
    <br />
    <br />
    <h4>Custom PlaceHolder</h4>
    <br />
    <br />
    <div style="position:relative; top:40px;">
      <clabs-chat-footer
        input-placeholder="Place any custom text here with input-placeholder">
      </clabs-chat-footer>
    </div>
    <br />
    <br />
    <br />
    <h4>Character limit of 20</h4>
    <br />
    <div style="position:relative; top:40px;">
      <clabs-chat-footer character-limit="20"> </clabs-chat-footer>
    </div>
    <br />
    <br />
    <h4>With information message</h4>
    <br />
    <div style="position:relative; top:40px;">
      <clabs-chat-footer
        context-message="${'Click the AI icon above for more details sjd;jkls;f;kjsdjkfskjfdkjdfjkdjks;ffjsklklsfdkldskjfksjkfkljdsfkldkjlfskjdfkljsf;dlkjkfjsklsfdkj'}"
        context-message-type="${'info'}">
      </clabs-chat-footer>
    </div>
    <br />
    <br />
    <h4>With error message</h4>
    <br />
    <div style="position:relative; top:40px;">
      <clabs-chat-footer
        context-message="${'Server error: querying is unavailable'}"
        context-message-type="${'error'}">
      </clabs-chat-footer>
    </div>
    <br />
    <br />
    <h4>With warning message</h4>
    <br />
    <div style="position:relative; top:40px;">
      <clabs-chat-footer
        context-message="${'Your next request may take over a minute to process'}"
        context-message-type="${'warning'}">
      </clabs-chat-footer>
    </div>`,
};

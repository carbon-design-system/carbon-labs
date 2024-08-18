/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '../detailedErrorElement';
import { html } from 'lit';

// More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
export default {
  title: 'Components/Chat/DetailedError',
  tags: ['autodocs'],
};

export const Default = {
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => {
    const title = 'I can’t answer that.';
    const description =
      'watsonx currently has limitations with Reports and cannot answer your query. Try asking it to translate another SQL instead.';
    const action = {
      text: 'Next step',
      /**
       * Handles the `click` event on the action button
       */
      click: () => {
        console.debug('User clicked on the action button!');
      },
    };

    return html` <clabs-chat-detailed-error
      .title=${title}
      .description=${description}
      .action=${action}>
    </clabs-chat-detailed-error>`;
  },
};

export const WithoutAction = {
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => {
    const title = 'Something went wrong.';
    const description = 'An unexpected error occurred. Please try again later.';

    return html` <clabs-chat-detailed-error
      .title=${title}
      .description=${description}>
    </clabs-chat-detailed-error>`;
  },
};

export const WithoutDescription = {
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => {
    const title = 'Something went wrong.';

    const action = {
      text: 'Next step',
      /**
       * Handles the `click` event on the action button
       */
      click: () => {
        console.debug('User clicked on the action button!');
      },
    };

    return html` <clabs-chat-detailed-error .title=${title} .action=${action}>
    </clabs-chat-detailed-error>`;
  },
};

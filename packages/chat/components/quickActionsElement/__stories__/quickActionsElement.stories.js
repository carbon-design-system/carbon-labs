/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '../quickActionsElement';
import { html } from 'lit';

export default {
  title: 'Components/Chat/QuickActions',
  tags: ['autodocs'],
};

export const Default = {
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => {
    const options = [
      'Summarize risk event',
      'This is an example for a long long action with more than one line, depends on chat width',
      'Tell me about the findings',
    ];
    /**
     * Handles the `click` event on the action button
     * @param {string} option The option that was clicked
     */
    const action = (option) => {
      console.debug(`User clicked on the action button: ${option}`);
    };

    return html`<clabs-chat-quick-actions .options=${options} .action=${action}>
    </clabs-chat-quick-actions>`;
  },
};

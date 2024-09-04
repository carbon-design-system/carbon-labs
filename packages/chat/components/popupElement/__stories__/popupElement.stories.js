/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '../popupElement';
import { html } from 'lit';

// More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
export default {
  title: 'Components/Chat/popup',
  tags: ['autodocs'],
};

export const Default = {
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html`
    <h4>Default</h4>
    <clabs-chat-popup> </clabs-chat-popup>
    <h4>Custom</h4>
    <clabs-chat-popup
      prompt-title="Custom title"
      text-area-placeholder="Custom placeholder"
      popup-title="Custom title"
      .tag-list="${'["choice A","choice B", "choice C"]'}"
      disclaimer="Place your own disclaimer here">
    </clabs-chat-popup>
  `,
};

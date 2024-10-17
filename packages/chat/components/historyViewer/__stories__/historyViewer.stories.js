/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '../historyViewer';
import { html } from 'lit';
import examples from './example.json';
// More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
export default {
  title: 'Components/Chat/History Viewer',
  tags: ['autodocs'],
};

export const Default = {
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () =>
    html` <clabs-chat-history-viewer .historyTree=${examples}>
    </clabs-chat-history-viewer>`,
};

export const Showcase = {
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () =>
    html`<div style="display:flex;">
      <h4>Example 1</h4>
      <clabs-chat-history-viewer .historyTree=${examples}>
      </clabs-chat-history-viewer>
    </div>`,
};

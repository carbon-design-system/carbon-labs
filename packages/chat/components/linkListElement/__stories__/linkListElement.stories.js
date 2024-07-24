/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '../linkListElement';
import { html } from 'lit';

// More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
export default {
  title: 'Components/Chat/LinkList',
  tags: ['autodocs'],
};

export const Default = {
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html` <h4>Lists under 4 elements</h4>
    <clabs-chat-link-list
      @on-link-list-item-selected="${(e) => console.log(e)}"
      content="https://en.wikipedia.org/wiki/President_of_the_United_States,https://en.wikipedia.org/wiki/Union_(American_Civil_War),https://en.wikipedia.org/wiki/Illinois">
    </clabs-chat-link-list>
    <h4>Lists over 4 elements</h4>
    <clabs-chat-link-list
      @on-link-list-item-selected="${(e) => console.log(e)}"
      content="https://en.wikipedia.org/wiki/President_of_the_United_States,https://en.wikipedia.org/wiki/Union_(American_Civil_War),https://en.wikipedia.org/wiki/Illinois,https://en.wikipedia.org/wiki/Democratic_Party_(United_States),https://en.wikipedia.org/wiki/Social_Security_(United_States),https://en.wikipedia.org/wiki/21st_century,https://en.wikipedia.org/wiki/United_Nations,https://en.wikipedia.org/wiki/Sustainable_development,https://en.wikipedia.org/wiki/Climate_change">
    </clabs-chat-link-list>`,
};

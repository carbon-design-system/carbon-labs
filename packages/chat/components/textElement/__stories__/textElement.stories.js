/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '../textElement';
import { html } from 'lit';

// More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
export default {
  title: 'Components/Chat/Text',
  component: 'clabs-chat-text',
};

export const Default = {
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html` <clabs-chat-text content="Hello, how may I help you?">
  </clabs-chat-text>`,
};

export const Showcase = {
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html`
    <h4>Simple</h4>
    <br />
    <clabs-chat-text
      content="hello, I'm Watson.
 how how may I help you?">
    </clabs-chat-text>
    <br />
    <h4>Capitalized</h4>
    <br />
    <clabs-chat-text
      content="hello, I'm Watson.
 how how may I help you?"
      capitalize="${true}">
    </clabs-chat-text>
    <br />
    <h4>Highlighting</h4>
    <br />
    <clabs-chat-text
      enable-text-highlighting
      content="Abraham Lincoln was an American lawyer, politician, and statesman who served as the 16th [president of the United States](https://en.wikipedia.org/wiki/President_of_the_United_States) from 1861 until his [assassination](https://en.wikipedia.org/wiki/Assassination_of_Abraham_Lincoln) in 1865.
 Lincoln led the United States through the [American Civil War](https://en.wikipedia.org/wiki/American_Civil_War), defending the nation as a constitutional [union](https://en.wikipedia.org/wiki/Union_(American_Civil_War)), defeating the insurgent [Confederacy](https://en.wikipedia.org/wiki/Confederate_States_of_America), playing a major role in the [abolition of slavery](https://en.wikipedia.org/wiki/Abolitionism_in_the_United_States), expanding the power of the [federal government](https://en.wikipedia.org/wiki/Federal_government_of_the_United_States), and modernizing the [U.S. economy](https://en.wikipedia.org/wiki/Economy_of_the_United_States).
Lincoln was born into poverty in a [log cabin](https://en.wikipedia.org/wiki/Log_cabin) in [Kentucky](https://en.wikipedia.org/wiki/Kentucky) and was raised on the [frontier](https://en.wikipedia.org/wiki/American_frontier), mainly in [Indiana](https://en.wikipedia.org/wiki/Indiana).">
    </clabs-chat-text>
    <br />
    <h4>Highlighting with slotting</h4>
    <br />
    <clabs-chat-text
      enable-text-highlighting
      text-highlight-color="#ffff00"
      @on-text-annotation-click="${(e) => console.log(e)}"
      content="Abraham Lincoln was an American lawyer, politician, and statesman who served as the 16th [president of the United States](https://en.wikipedia.org/wiki/President_of_the_United_States) from 1861 until his [assassination](https://en.wikipedia.org/wiki/Assassination_of_Abraham_Lincoln) in 1865.
 Lincoln led the United States through the [American Civil War](https://en.wikipedia.org/wiki/American_Civil_War), defending the nation as a constitutional [union](https://en.wikipedia.org/wiki/Union_(American_Civil_War)), defeating the insurgent [Confederacy](https://en.wikipedia.org/wiki/Confederate_States_of_America), playing a major role in the [abolition of slavery](https://en.wikipedia.org/wiki/Abolitionism_in_the_United_States), expanding the power of the [federal government](https://en.wikipedia.org/wiki/Federal_government_of_the_United_States), and modernizing the [U.S. economy](https://en.wikipedia.org/wiki/Economy_of_the_United_States).
Lincoln was born into poverty in a [log cabin](https://en.wikipedia.org/wiki/Log_cabin) in [Kentucky](https://en.wikipedia.org/wiki/Kentucky) and was raised on the [frontier](https://en.wikipedia.org/wiki/American_frontier), mainly in [Indiana](https://en.wikipedia.org/wiki/Indiana).">
      <div slot="custom-highlight-component">
        <div style="padding:16px;color:#FF007F;font-size:28px;">
          Slotted div placed here
        </div>
      </div>
    </clabs-chat-text>
    <br />
    <br />
    <h4>Annotations</h4>
    <br />
    <clabs-chat-text
      content="Abraham Lincoln was an American lawyer, politician, and statesman who served as the 16th [president of the United States](https://en.wikipedia.org/wiki/President_of_the_United_States) from 1861 until his [assassination](https://en.wikipedia.org/wiki/Assassination_of_Abraham_Lincoln) in 1865.
 Lincoln led the United States through the [American Civil War](https://en.wikipedia.org/wiki/American_Civil_War), defending the nation as a constitutional [union](https://en.wikipedia.org/wiki/Union_(American_Civil_War)), defeating the insurgent [Confederacy](https://en.wikipedia.org/wiki/Confederate_States_of_America), playing a major role in the [abolition of slavery](https://en.wikipedia.org/wiki/Abolitionism_in_the_United_States), expanding the power of the [federal government](https://en.wikipedia.org/wiki/Federal_government_of_the_United_States), and modernizing the [U.S. economy](https://en.wikipedia.org/wiki/Economy_of_the_United_States).
Lincoln was born into poverty in a [log cabin](https://en.wikipedia.org/wiki/Log_cabin) in [Kentucky](https://en.wikipedia.org/wiki/Kentucky) and was raised on the [frontier](https://en.wikipedia.org/wiki/American_frontier), mainly in [Indiana](https://en.wikipedia.org/wiki/Indiana)."></clabs-chat-text>
    <br />
    <h4>Multi link annotations</h4>
    <br />
    <clabs-chat-text
      content="Here is a single annotation: [log cabin](https://en.wikipedia.org/wiki/Log_cabin)
Here is an [annotation with under 5 links](https://en.wikipedia.org/wiki/President_of_the_United_States,https://en.wikipedia.org/wiki/Union_(American_Civil_War),https://en.wikipedia.org/wiki/Illinois)
Here is an [annotation with over 5 links](https://en.wikipedia.org/wiki/President_of_the_United_States,https://en.wikipedia.org/wiki/Union_(American_Civil_War),https://en.wikipedia.org/wiki/Illinois,https://en.wikipedia.org/wiki/21st_century,https://en.wikipedia.org/wiki/United_Nations,https://en.wikipedia.org/wiki/Sustainable_development,https://en.wikipedia.org/wiki/Climate_change)">
    </clabs-chat-text>
  `,
};

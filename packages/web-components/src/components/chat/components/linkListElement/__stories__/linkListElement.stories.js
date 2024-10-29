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
  render: () => html`
    <h4>Lists under 4 elements</h4>
    <clabs-chat-link-list
      @on-link-list-item-selected="${(e) => console.log(e)}"
      content="https://en.wikipedia.org/wiki/President_of_the_United_States,https://en.wikipedia.org/wiki/Union_(American_Civil_War),https://en.wikipedia.org/wiki/Illinois">
    </clabs-chat-link-list>
    <h4>Lists over 4 elements</h4>
    <clabs-chat-link-list
      @on-link-list-item-selected="${(e) => console.log(e)}"
      content="https://en.wikipedia.org/wiki/President_of_the_United_States,https://en.wikipedia.org/wiki/Union_(American_Civil_War),https://en.wikipedia.org/wiki/Illinois,https://en.wikipedia.org/wiki/Democratic_Party_(United_States),https://en.wikipedia.org/wiki/Social_Security_(United_States),https://en.wikipedia.org/wiki/21st_century,https://en.wikipedia.org/wiki/United_Nations,https://en.wikipedia.org/wiki/Sustainable_development,https://en.wikipedia.org/wiki/Climate_change">
    </clabs-chat-link-list>
    <h4>Overflowing links</h4>
    <clabs-chat-link-list
      @on-link-list-item-selected="${(e) => console.log(e)}"
      content="https://www.google.com/search?q=very+long+link&rlz=1C5GCEM_enUS1122US1122&oq=very+long+link&gs_lcrp=EgZjaHJvbWUyCQgAEEUYORiABDIICAEQABgWGB4yCAgCEAAYFhgeMgoIAxAAGA8YFhgeMggIBBAAGBYYHjINCAUQABiGAxiABBiKBTIKCAYQABiABBiiBDIKCAcQABiABBiiBDIKCAgQABiABBiiBNIBCDI2NzdqMGo3qAIAsAIA&sourceid=chrome&ie=UTF-8(Long link google search),https://www.google.com/search?q=carbon+labs+ibm&sca_esv=5a54ede1e073dd21&sca_upv=1&rlz=1C5GCEM_enUS1122US1122&ei=9Ne9ZpDROL7Z5NoP5s_wiQo&ved=0ahUKEwiQm_TD5PaHAxW-LFkFHeYnPKEQ4dUDCA8&uact=5&oq=carbon+labs+ibm&gs_lp=Egxnd3Mtd2l6LXNlcnAiD2NhcmJvbiBsYWJzIGlibTIFECEYoAEyBRAhGKABMgUQIRigATIFECEYoAEyBRAhGKABMgUQIRifBTIFECEYnwUyBRAhGJ8FMgUQIRifBTIFECEYnwVIzwtQ6QJY3AlwAXgBkAEAmAFmoAH3AqoBAzMuMbgBA8gBAPgBAZgCBaACjQPCAgoQABiwAxjWBBhHwgITEC4YgAQYsAMYQxjHARiKBRivAcICDRAAGIAEGLADGEMYigXCAgsQABiABBiRAhiKBcICBRAAGIAEwgILEC4YgAQYxwEYrwHCAgYQABgWGB7CAgsQABiABBiGAxiKBcICCBAAGIAEGKIEmAMAiAYBkAYHkgcDNC4xoAeIHw&sclient=gws-wiz-serp(Carbon Labs Google search)">
    </clabs-chat-link-list>
  `,
};

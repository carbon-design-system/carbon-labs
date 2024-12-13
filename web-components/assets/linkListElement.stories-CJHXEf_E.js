import"./linkListElement-CAaggUPN.js";import{x as s}from"./lit-element-in3Y6axH.js";/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const o={title:"Components/Core/LinkList"},e={render:()=>s`
    <h4>Lists under 4 elements</h4>
    <clabs-chat-link-list
      @on-link-list-item-selected="${i=>console.log(i)}"
      content="https://en.wikipedia.org/wiki/President_of_the_United_States,https://en.wikipedia.org/wiki/Union_(American_Civil_War),https://en.wikipedia.org/wiki/Illinois">
    </clabs-chat-link-list>
    <h4>Lists over 4 elements</h4>
    <clabs-chat-link-list
      @on-link-list-item-selected="${i=>console.log(i)}"
      content="https://en.wikipedia.org/wiki/President_of_the_United_States,https://en.wikipedia.org/wiki/Union_(American_Civil_War),https://en.wikipedia.org/wiki/Illinois,https://en.wikipedia.org/wiki/Democratic_Party_(United_States),https://en.wikipedia.org/wiki/Social_Security_(United_States),https://en.wikipedia.org/wiki/21st_century,https://en.wikipedia.org/wiki/United_Nations,https://en.wikipedia.org/wiki/Sustainable_development,https://en.wikipedia.org/wiki/Climate_change">
    </clabs-chat-link-list>
    <h4>Overflowing links</h4>
    <clabs-chat-link-list
      @on-link-list-item-selected="${i=>console.log(i)}"
      content="https://www.google.com/search?q=very+long+link&rlz=1C5GCEM_enUS1122US1122&oq=very+long+link&gs_lcrp=EgZjaHJvbWUyCQgAEEUYORiABDIICAEQABgWGB4yCAgCEAAYFhgeMgoIAxAAGA8YFhgeMggIBBAAGBYYHjINCAUQABiGAxiABBiKBTIKCAYQABiABBiiBDIKCAcQABiABBiiBDIKCAgQABiABBiiBNIBCDI2NzdqMGo3qAIAsAIA&sourceid=chrome&ie=UTF-8(Long link google search),https://www.google.com/search?q=carbon+labs+ibm&sca_esv=5a54ede1e073dd21&sca_upv=1&rlz=1C5GCEM_enUS1122US1122&ei=9Ne9ZpDROL7Z5NoP5s_wiQo&ved=0ahUKEwiQm_TD5PaHAxW-LFkFHeYnPKEQ4dUDCA8&uact=5&oq=carbon+labs+ibm&gs_lp=Egxnd3Mtd2l6LXNlcnAiD2NhcmJvbiBsYWJzIGlibTIFECEYoAEyBRAhGKABMgUQIRigATIFECEYoAEyBRAhGKABMgUQIRifBTIFECEYnwUyBRAhGJ8FMgUQIRifBTIFECEYnwVIzwtQ6QJY3AlwAXgBkAEAmAFmoAH3AqoBAzMuMbgBA8gBAPgBAZgCBaACjQPCAgoQABiwAxjWBBhHwgITEC4YgAQYsAMYQxjHARiKBRivAcICDRAAGIAEGLADGEMYigXCAgsQABiABBiRAhiKBcICBRAAGIAEwgILEC4YgAQYxwEYrwHCAgYQABgWGB7CAgsQABiABBiGAxiKBcICCBAAGIAEGKIEmAMAiAYBkAYHkgcDNC4xoAeIHw&sclient=gws-wiz-serp(Carbon Labs Google search)">
    </clabs-chat-link-list>
  `};var t,n,A;e.parameters={...e.parameters,docs:{...(t=e.parameters)==null?void 0:t.docs,source:{originalSource:`{
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html\`
    <h4>Lists under 4 elements</h4>
    <clabs-chat-link-list
      @on-link-list-item-selected="\${e => console.log(e)}"
      content="https://en.wikipedia.org/wiki/President_of_the_United_States,https://en.wikipedia.org/wiki/Union_(American_Civil_War),https://en.wikipedia.org/wiki/Illinois">
    </clabs-chat-link-list>
    <h4>Lists over 4 elements</h4>
    <clabs-chat-link-list
      @on-link-list-item-selected="\${e => console.log(e)}"
      content="https://en.wikipedia.org/wiki/President_of_the_United_States,https://en.wikipedia.org/wiki/Union_(American_Civil_War),https://en.wikipedia.org/wiki/Illinois,https://en.wikipedia.org/wiki/Democratic_Party_(United_States),https://en.wikipedia.org/wiki/Social_Security_(United_States),https://en.wikipedia.org/wiki/21st_century,https://en.wikipedia.org/wiki/United_Nations,https://en.wikipedia.org/wiki/Sustainable_development,https://en.wikipedia.org/wiki/Climate_change">
    </clabs-chat-link-list>
    <h4>Overflowing links</h4>
    <clabs-chat-link-list
      @on-link-list-item-selected="\${e => console.log(e)}"
      content="https://www.google.com/search?q=very+long+link&rlz=1C5GCEM_enUS1122US1122&oq=very+long+link&gs_lcrp=EgZjaHJvbWUyCQgAEEUYORiABDIICAEQABgWGB4yCAgCEAAYFhgeMgoIAxAAGA8YFhgeMggIBBAAGBYYHjINCAUQABiGAxiABBiKBTIKCAYQABiABBiiBDIKCAcQABiABBiiBDIKCAgQABiABBiiBNIBCDI2NzdqMGo3qAIAsAIA&sourceid=chrome&ie=UTF-8(Long link google search),https://www.google.com/search?q=carbon+labs+ibm&sca_esv=5a54ede1e073dd21&sca_upv=1&rlz=1C5GCEM_enUS1122US1122&ei=9Ne9ZpDROL7Z5NoP5s_wiQo&ved=0ahUKEwiQm_TD5PaHAxW-LFkFHeYnPKEQ4dUDCA8&uact=5&oq=carbon+labs+ibm&gs_lp=Egxnd3Mtd2l6LXNlcnAiD2NhcmJvbiBsYWJzIGlibTIFECEYoAEyBRAhGKABMgUQIRigATIFECEYoAEyBRAhGKABMgUQIRifBTIFECEYnwUyBRAhGJ8FMgUQIRifBTIFECEYnwVIzwtQ6QJY3AlwAXgBkAEAmAFmoAH3AqoBAzMuMbgBA8gBAPgBAZgCBaACjQPCAgoQABiwAxjWBBhHwgITEC4YgAQYsAMYQxjHARiKBRivAcICDRAAGIAEGLADGEMYigXCAgsQABiABBiRAhiKBcICBRAAGIAEwgILEC4YgAQYxwEYrwHCAgYQABgWGB7CAgsQABiABBiGAxiKBcICCBAAGIAEGKIEmAMAiAYBkAYHkgcDNC4xoAeIHw&sclient=gws-wiz-serp(Carbon Labs Google search)">
    </clabs-chat-link-list>
  \`
}`,...(A=(n=e.parameters)==null?void 0:n.docs)==null?void 0:A.source}}};const l=["Default"],r=Object.freeze(Object.defineProperty({__proto__:null,Default:e,__namedExportsOrder:l,default:o},Symbol.toStringTag,{value:"Module"}));export{r as l};

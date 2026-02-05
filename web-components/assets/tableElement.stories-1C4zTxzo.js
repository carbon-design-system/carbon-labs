import"./tableElement-DPzlZ_gn.js";import{b as i}from"./iframe-BDjSmw2C.js";/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const h={title:"Components/AI Components/Table"},e={render:()=>i` <clabs-chat-table
      content="Name,Age,Occupation,Location,State
Jerry,35,Comedian,Upper east side,NY
George,35,Unemployed,Queens,NY
Elaine,32,Publisher,Midtown,NY
Kramer,36,Unknown,Upper east side,NY">
    </clabs-chat-table>`};function g(n,d){const r=()=>Math.random().toString(36).substring(7),p=()=>Math.random()<.5?(Math.random()*100).toFixed(2):r(),b=Array.from({length:n},r).join(","),u=Array.from({length:d},()=>Array.from({length:n},p).join(",")).join(`
`);return b+`
`+u}const f=g(10,50),t={render:()=>i` <clabs-chat-table content="${f}" max-height="400px">
    </clabs-chat-table>`};var a,o,s;e.parameters={...e.parameters,docs:{...(a=e.parameters)==null?void 0:a.docs,source:{originalSource:`{
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html\` <clabs-chat-table
      content="Name,Age,Occupation,Location,State
Jerry,35,Comedian,Upper east side,NY
George,35,Unemployed,Queens,NY
Elaine,32,Publisher,Midtown,NY
Kramer,36,Unknown,Upper east side,NY">
    </clabs-chat-table>\`
}`,...(s=(o=e.parameters)==null?void 0:o.docs)==null?void 0:s.source}}};var l,c,m;t.parameters={...t.parameters,docs:{...(l=t.parameters)==null?void 0:l.docs,source:{originalSource:`{
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html\` <clabs-chat-table content="\${randTable}" max-height="400px">
    </clabs-chat-table>\`
}`,...(m=(c=t.parameters)==null?void 0:c.docs)==null?void 0:m.source}}};const S=["Default","SizeTest"],T=Object.freeze(Object.defineProperty({__proto__:null,Default:e,SizeTest:t,__namedExportsOrder:S,default:h},Symbol.toStringTag,{value:"Module"}));export{T as e};

import{L as e,q as t}from"./iframe-B-_BHJcW.js";import"./tableElement-BQGvsVKa.js";var n=t({Default:()=>i,SizeTest:()=>s,__namedExportsOrder:()=>c,default:()=>r}),r={title:`Components/AI Components/Table`},i={render:()=>e` <clabs-chat-table
      content="Name,Age,Occupation,Location,State
Jerry,35,Comedian,Upper east side,NY
George,35,Unemployed,Queens,NY
Elaine,32,Publisher,Midtown,NY
Kramer,36,Unknown,Upper east side,NY">
    </clabs-chat-table>`};function a(e,t){let n=()=>Math.random().toString(36).substring(7),r=()=>Math.random()<.5?(Math.random()*100).toFixed(2):n(),i=Array.from({length:e},n).join(`,`),a=Array.from({length:t},()=>Array.from({length:e},r).join(`,`)).join(`
`);return i+`
`+a}var o=a(10,50),s={render:()=>e` <clabs-chat-table content="${o}" max-height="400px">
    </clabs-chat-table>`};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
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
}`,...i.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html\` <clabs-chat-table content="\${randTable}" max-height="400px">
    </clabs-chat-table>\`
}`,...s.parameters?.docs?.source}}};var c=[`Default`,`SizeTest`];export{i as Default,s as SizeTest,c as __namedExportsOrder,r as default,n as t};
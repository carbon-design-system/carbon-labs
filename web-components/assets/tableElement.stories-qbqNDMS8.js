import{R as e}from"./iframe-C5ungBK8.js";import"./tableElement-DbOMTuT0.js";var t={title:`Components/AI Components/Table`},n={render:()=>e` <clabs-chat-table
      content="Name,Age,Occupation,Location,State
Jerry,35,Comedian,Upper east side,NY
George,35,Unemployed,Queens,NY
Elaine,32,Publisher,Midtown,NY
Kramer,36,Unknown,Upper east side,NY">
    </clabs-chat-table>`};function r(e,t){let n=()=>Math.random().toString(36).substring(7),r=()=>Math.random()<.5?(Math.random()*100).toFixed(2):n(),i=Array.from({length:e},n).join(`,`),a=Array.from({length:t},()=>Array.from({length:e},r).join(`,`)).join(`
`);return i+`
`+a}var i=r(10,50),a={render:()=>e` <clabs-chat-table content="${i}" max-height="400px">
    </clabs-chat-table>`};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
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
}`,...n.parameters?.docs?.source}}},a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html\` <clabs-chat-table content="\${randTable}" max-height="400px">
    </clabs-chat-table>\`
}`,...a.parameters?.docs?.source}}};var o=[`Default`,`SizeTest`];export{n as Default,a as SizeTest,o as __namedExportsOrder,t as default};
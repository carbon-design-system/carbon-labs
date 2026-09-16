import{R as e}from"./iframe-CxKxFBSA.js";import{a as t,t as n}from"./decorate-Cddh5z1i.js";import{t as r}from"./settings-D85busz-.js";import{t as i}from"./CommonHeader-CBOx7SoU.js";import"./HybridIpaasHeader-Bf9WkAU5.js";import"./LogoutHeader-CUXJsMRM.js";import"./LogoutTile-DO_5hmG5.js";var a=class extends i{},{stablePrefix:o}=r,s=class extends a{};s=n([t(`${o}-global-header`)],s);var c={title:`Components/Global Header`,component:`clabs-global-header`,parameters:{docs:{description:{component:`More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction`}}}},l={args:{headerProps:{brand:{company:`IBM`,product:`Platform`},noAuthHeaderLinks:[{text:`Docs`,href:`/docs`,carbonIcon:`Document`,arialLabel:`Docs`},{href:`/login`,text:`Log in`,carbonIcon:`Login`,arialLabel:`Log in`}]}},render:t=>e` <clabs-global-header
      .headerProps="${t.headerProps}"></clabs-global-header>`};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    headerProps: headerPropsUnauthenticated
  },
  /**
   * Renders the template for Storybook
   * @param {object} args Storybook arguments
   * @returns {TemplateResult<1>}
   */
  render: args => html\` <clabs-global-header
      .headerProps="\${args.headerProps}"></clabs-global-header>\`
}`,...l.parameters?.docs?.source},description:{story:`More on writing stories with args: https://storybook.js.org/docs/web-components/writing-stories/args

@type {{args: {label: string}, render: (function(*): TemplateResult<1>)}}`,...l.parameters?.docs?.description}}};var u=[`Default`];export{l as Default,u as __namedExportsOrder,c as default};
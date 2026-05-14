import{n as e}from"./chunk-gsjJvkCQ.js";import{a as t}from"./lit-Cfdn9GWx.js";import{a as n,t as r}from"./decorate-DlKJ2G3r.js";import{t as i}from"./settings-BbwrJQg3.js";import{t as a}from"./CommonHeader-CFrsi6fQ.js";import"./HybridIpaasHeader-Z3i4qPvN.js";import"./LogoutHeader-Ch2uf83i.js";import"./LogoutTile-Cy1iSkAm.js";var o=class extends a{},{stablePrefix:s}=i,c=class extends o{};c=r([n(`${s}-global-header`)],c);var l=e({Default:()=>d,__namedExportsOrder:()=>f,default:()=>u}),u={title:`Components/Global Header`,component:`clabs-global-header`,parameters:{docs:{description:{component:`More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction`}}}},d={args:{headerProps:{brand:{company:`IBM`,product:`Platform`},noAuthHeaderLinks:[{text:`Docs`,href:`/docs`,carbonIcon:`Document`,arialLabel:`Docs`},{href:`/login`,text:`Log in`,carbonIcon:`Login`,arialLabel:`Log in`}]}},render:e=>t` <clabs-global-header
      .headerProps="${e.headerProps}"></clabs-global-header>`};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source},description:{story:`More on writing stories with args: https://storybook.js.org/docs/web-components/writing-stories/args

@type {{args: {label: string}, render: (function(*): TemplateResult<1>)}}`,...d.parameters?.docs?.description}}};var f=[`Default`];export{d as Default,f as __namedExportsOrder,u as default,l as t};
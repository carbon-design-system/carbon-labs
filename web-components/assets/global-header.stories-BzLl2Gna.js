import{L as e,q as t}from"./iframe-B-_BHJcW.js";import{a as n,t as r}from"./decorate-Ce1MsohV.js";import{t as i}from"./settings-DS_WyTy3.js";import{t as a}from"./CommonHeader-VizzT66D.js";import"./HybridIpaasHeader-czYHKE58.js";import"./LogoutHeader-CIWHU6ie.js";import"./LogoutTile-DRqap4dF.js";var o=class extends a{},{stablePrefix:s}=i,c=class extends o{};c=r([n(`${s}-global-header`)],c);var l=t({Default:()=>d,__namedExportsOrder:()=>f,default:()=>u}),u={title:`Components/Global Header`,component:`clabs-global-header`,parameters:{docs:{description:{component:`More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction`}}}},d={args:{headerProps:{brand:{company:`IBM`,product:`Platform`},noAuthHeaderLinks:[{text:`Docs`,href:`/docs`,carbonIcon:`Document`,arialLabel:`Docs`},{href:`/login`,text:`Log in`,carbonIcon:`Login`,arialLabel:`Log in`}]}},render:t=>e` <clabs-global-header
      .headerProps="${t.headerProps}"></clabs-global-header>`};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
import{t as u}from"./property-DrsSvhjn.js";import{x as f}from"./iframe-DMK0aa80.js";import{s as P}from"./settings-BQP9c3yA.js";import{C as y}from"./CommonHeader-Cajj746E.js";import{s as _}from"./HybridIpaasHeader-BSwgTmts.js";import"./LogoutHeader-B4G7Uxqg.js";import"./LogoutTile-CN35rWaj.js";/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const a=class a extends y{};a.styles=_;let s=a;var w=Object.getOwnPropertyDescriptor,x=(r,n,h,l)=>{for(var o=l>1?void 0:l?w(n,h):n,t=r.length-1,c;t>=0;t--)(c=r[t])&&(o=c(o)||o);return o};const{stablePrefix:D}=P;let i=class extends s{};i=x([u(`${D}-global-header`)],i);/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const L={title:"Components/Global Header",component:"clabs-global-header",parameters:{docs:{description:{component:"More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction"}}}},S={brand:{company:"IBM",product:"Platform"},noAuthHeaderLinks:[{text:"Docs",href:"/docs",carbonIcon:"Document",arialLabel:"Docs"},{href:"/login",text:"Log in",carbonIcon:"Login",arialLabel:"Log in"}]},e={args:{headerProps:S},render:r=>f` <clabs-global-header
      .headerProps="${r.headerProps}"></clabs-global-header>`};var p,d,m,b,g;e.parameters={...e.parameters,docs:{...(p=e.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
}`,...(m=(d=e.parameters)==null?void 0:d.docs)==null?void 0:m.source},description:{story:`More on writing stories with args: https://storybook.js.org/docs/web-components/writing-stories/args

@type {{args: {label: string}, render: (function(*): TemplateResult<1>)}}`,...(g=(b=e.parameters)==null?void 0:b.docs)==null?void 0:g.description}}};const j=["Default"],I=Object.freeze(Object.defineProperty({__proto__:null,Default:e,__namedExportsOrder:j,default:L},Symbol.toStringTag,{value:"Module"}));export{I as G};

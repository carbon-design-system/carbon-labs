import{t as g}from"./property-CDz1SCgH.js";import{x as h}from"./iframe-CIKSZ7a5.js";import{s as u}from"./settings-BQP9c3yA.js";import{C as f}from"./CommonHeader-D7f6gldX.js";import"./HybridIpaasHeader-EHsv1Oxv.js";import"./LogoutHeader-D-HKrLvK.js";import"./LogoutTile-VNCHvZIj.js";/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */class P extends f{}var _=Object.getOwnPropertyDescriptor,y=(r,a,m,s)=>{for(var o=s>1?void 0:s?_(a,m):a,t=r.length-1,n;t>=0;t--)(n=r[t])&&(o=n(o)||o);return o};const{stablePrefix:w}=u;let l=class extends P{};l=y([g(`${w}-global-header`)],l);/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const x={title:"Components/Global Header",component:"clabs-global-header",parameters:{docs:{description:{component:"More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction"}}}},D={brand:{company:"IBM",product:"Platform"},noAuthHeaderLinks:[{text:"Docs",href:"/docs",carbonIcon:"Document",arialLabel:"Docs"},{href:"/login",text:"Log in",carbonIcon:"Login",arialLabel:"Log in"}]},e={args:{headerProps:D},render:r=>h` <clabs-global-header
      .headerProps="${r.headerProps}"></clabs-global-header>`};var c,d,i,p,b;e.parameters={...e.parameters,docs:{...(c=e.parameters)==null?void 0:c.docs,source:{originalSource:`{
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
}`,...(i=(d=e.parameters)==null?void 0:d.docs)==null?void 0:i.source},description:{story:`More on writing stories with args: https://storybook.js.org/docs/web-components/writing-stories/args

@type {{args: {label: string}, render: (function(*): TemplateResult<1>)}}`,...(b=(p=e.parameters)==null?void 0:p.docs)==null?void 0:b.description}}};const H=["Default"],G=Object.freeze(Object.defineProperty({__proto__:null,Default:e,__namedExportsOrder:H,default:x},Symbol.toStringTag,{value:"Module"}));export{G};

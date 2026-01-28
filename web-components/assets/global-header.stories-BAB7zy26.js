import{t as k}from"./property-CzrLTE60.js";import{e as w,x as N}from"./iframe-ClXo_xvh.js";import{C as P}from"./CommonHeader-BbSgmZap.js";import{H as S}from"./HybridIpaasHeader-DJcpOw4U.js";import"./LogoutHeader-CWxtS0I4.js";import"./LogoutTile-CbIg2wHk.js";import{s as H}from"./settings-BQP9c3yA.js";/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */class O extends P{}/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const T=new Set(["children","localName","ref","style","className"]),g=new WeakMap,f=(e,l,c,p,o)=>{const b=o==null?void 0:o[l];b===void 0?(e[l]=c,c==null&&l in HTMLElement.prototype&&e.removeAttribute(l)):c!==p&&((s,i,d)=>{let n=g.get(s);n===void 0&&g.set(s,n=new Map);let a=n.get(i);d!==void 0?a===void 0?(n.set(i,a={handleEvent:d}),s.addEventListener(i,a)):a.handleEvent=d:a!==void 0&&(n.delete(i),s.removeEventListener(i,a))})(e,b,c)},M=({react:e,tagName:l,elementClass:c,events:p,displayName:o})=>{const b=new Set(Object.keys(p??{})),s=e.forwardRef((i,d)=>{const n=e.useRef(new Map),a=e.useRef(null),m={},h={};for(const[r,t]of Object.entries(i))T.has(r)?m[r==="className"?"class":r]=t:b.has(r)||r in c.prototype?h[r]=t:m[r]=t;return e.useLayoutEffect(()=>{if(a.current===null)return;const r=new Map;for(const t in h)f(a.current,t,i[t],n.current.get(t),p),n.current.delete(t),r.set(t,i[t]);for(const[t,A]of n.current)f(a.current,t,void 0,A,p);n.current=r}),e.useLayoutEffect(()=>{var r;(r=a.current)==null||r.removeAttribute("defer-hydration")},[]),m.suppressHydrationWarning=!0,e.createElement(l,{...m,ref:e.useCallback(r=>{a.current=r,typeof d=="function"?d(r):d!==null&&(d.current=r)},[d])})});return s.displayName=o??c.name,s};/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const x="clabs-hybrid-ipaas-header-ai-callback",I="clabs-hybrid-ipaas-header-notification-open-callback",j="clabs-hybrid-ipaas-logout-callback",B="clabs-hybrid-ipaas-search-callback",R="clabs-hybrid-ipaas-search-submit-callback";M({tagName:"clabs-global-header-hybrid-ipaas",elementClass:S,react:w,events:{onaiCallback:x,onNotificationOpenCallback:I,onLogoutCallback:j,onSearchCallback:B,onSearchSubmitCallback:R}});var D=Object.getOwnPropertyDescriptor,G=(e,l,c,p)=>{for(var o=p>1?void 0:p?D(l,c):l,b=e.length-1,s;b>=0;b--)(s=e[b])&&(o=s(o)||o);return o};const{stablePrefix:K}=H;let y=class extends O{};y=G([k(`${K}-global-header`)],y);/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const V={title:"Components/Global Header",component:"clabs-global-header",parameters:{docs:{description:{component:"More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction"}}}},$={brand:{company:"IBM",product:"Platform"},noAuthHeaderLinks:[{text:"Docs",href:"/docs",carbonIcon:"Document",arialLabel:"Docs"},{href:"/login",text:"Log in",carbonIcon:"Login",arialLabel:"Log in"}]},u={args:{headerProps:$},render:e=>N` <clabs-global-header
      .headerProps="${e.headerProps}"></clabs-global-header>`};var C,L,_,E,v;u.parameters={...u.parameters,docs:{...(C=u.parameters)==null?void 0:C.docs,source:{originalSource:`{
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
}`,...(_=(L=u.parameters)==null?void 0:L.docs)==null?void 0:_.source},description:{story:`More on writing stories with args: https://storybook.js.org/docs/web-components/writing-stories/args

@type {{args: {label: string}, render: (function(*): TemplateResult<1>)}}`,...(v=(E=u.parameters)==null?void 0:E.docs)==null?void 0:v.description}}};const U=["Default"],Y=Object.freeze(Object.defineProperty({__proto__:null,Default:u,__namedExportsOrder:U,default:V},Symbol.toStringTag,{value:"Module"}));export{Y as G};

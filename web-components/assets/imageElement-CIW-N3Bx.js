import{n as d,t as m}from"./property-C_111YFZ.js";import{i as b,s as h,x as u}from"./lit-element-in3Y6axH.js";import{s as p}from"./settings-BQP9c3yA.js";const v=b`:host(clabs-chat-image) .clabs--chat-image-container{display:flex;overflow:hidden}@keyframes fade-in{0%{opacity:0}to{opacity:1}}:host(clabs-chat-image) .clabs--chat-image-img{border-radius:8px;animation:fade-in .6s forwards;block-size:auto;max-inline-size:100%;object-fit:contain;opacity:0}`;var g=Object.defineProperty,x=(a,t,r,n)=>{for(var e=void 0,s=a.length-1,i;s>=0;s--)(i=a[s])&&(e=i(t,r,e)||e);return e&&g(t,r,e),e};const o=class o extends h{updated(t){super.updated(t)}firstUpdated(){}};o.styles=v;let c=o;x([d({type:String,attribute:"content",reflect:!0})],c.prototype,"content");/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const{stablePrefix:l}=p;function P(a){const{content:t}=a;return u`<div class="${l}--chat-image-container">
    <img class="${l}--chat-image-img" src="${t}" />
  </div>`}var y=Object.defineProperty,_=Object.getOwnPropertyDescriptor,$=(a,t,r,n)=>{for(var e=n>1?void 0:n?_(t,r):t,s=a.length-1,i;s>=0;s--)(i=a[s])&&(e=(n?i(t,r,e):i(e))||e);return n&&e&&y(t,r,e),e};const{stablePrefix:O}=p;let f=class extends c{render(){return P(this)}};f=$([m(`${O}-chat-image`)],f);

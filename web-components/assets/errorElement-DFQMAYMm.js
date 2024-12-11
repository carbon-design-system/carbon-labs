import{n as d,t as u}from"./property-C_111YFZ.js";import{i as b,s as v,x as h}from"./lit-element-in3Y6axH.js";import{s as x}from"./settings-BQP9c3yA.js";import{o as _}from"./unsafe-html-D-LwtoKn.js";const g=b`:host(clabs-chat-error) .clabs--chat-error-container{display:flex;padding:10px;border:1px solid var(--cds-support-error, #da1e28);border-radius:8px;background-color:var(--cds-background, #ffffff);color:var(--cds-support-error, #da1e28);line-height:22px;max-block-size:176px;overflow-y:auto}`;var P=Object.defineProperty,m=(o,t,e,s)=>{for(var r=void 0,a=o.length-1,i;a>=0;a--)(i=o[a])&&(r=i(t,e,r)||r);return r&&P(t,e,r),r};const c=class c extends v{updated(t){super.updated(t)}firstUpdated(){}_formatText(t,e){return e&&(t=t.split(new RegExp("(?<=[.!?]\\s)|(?<=\\n)","g")).map(p=>p.trimStart().charAt(0).toUpperCase()+p.trimStart().slice(1)).join("")),t.replace(/^\s*\n|\n\s*$/g,"").replace(/\t/g,"&nbsp;&nbsp;").replace(/\n/g,"<br>")}};c.styles=g;let n=c;m([d({type:String,attribute:"content",reflect:!0})],n.prototype,"content");m([d({type:Boolean,attribute:"capitalize"})],n.prototype,"capitalize");/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const{stablePrefix:l}=x;function y(o){const{content:t,_formatText:e,capitalize:s}=o;return h`<div class="${l}--chat-error">
    <div class="${l}--chat-error-container">
      ${_(e(t,s))}
    </div>
  </div>`}var T=Object.defineProperty,$=Object.getOwnPropertyDescriptor,z=(o,t,e,s)=>{for(var r=s>1?void 0:s?$(t,e):t,a=o.length-1,i;a>=0;a--)(i=o[a])&&(r=(s?i(t,e,r):i(r))||r);return s&&r&&T(t,e,r),r};const{stablePrefix:O}=x;let f=class extends n{render(){return y(this)}};f=z([u(`${O}-chat-error`)],f);

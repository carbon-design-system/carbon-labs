import{n as f,t as h}from"./property-C_111YFZ.js";import{i as m,s as u,x as _}from"./lit-element-in3Y6axH.js";import{s as p}from"./settings-BQP9c3yA.js";import{r as b}from"./state-B7rdIQBm.js";import{o as v}from"./unsafe-html-D-LwtoKn.js";const y=m`:host(clabs-chat-list){font-size:15px;inline-size:100%;line-height:20px}@keyframes fade-in{0%{opacity:0}to{opacity:1}}:host(clabs-chat-list) .clabs--chat-list ul{padding:0;margin:0;padding-inline-start:16px}:host(clabs-chat-list) .clabs--chat-list li{animation:fade-in .6s forwards;list-style-type:none;opacity:0;padding-block-start:4px}`;var x=Object.defineProperty,d=(i,t,s,a)=>{for(var e=void 0,r=i.length-1,n;r>=0;r--)(n=i[r])&&(e=n(t,s,e)||e);return e&&x(t,s,e),e};const l=class l extends u{constructor(){super(...arguments),this._renderedList=""}updated(t){super.updated(t),t.has("content")&&this._formatList()}firstUpdated(){this.content!==void 0?(this._formatList(),this.requestUpdate()):this._renderedList="listElement: error rendring list, content is empty"}_formatList(){const t=this.content.split(`
`);this._renderedList="<ul>"+t.map(s=>"<li>"+s+"</li>").join("")+"</ul>"}};l.styles=y;let o=l;d([f({type:String,attribute:"content",reflect:!0})],o.prototype,"content");d([b()],o.prototype,"_renderedList");/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const{stablePrefix:L}=p;function P(i){const{_renderedList:t}=i;return _`<div class="${L}--chat-list">
    ${v(t)}
  </div>`}var g=Object.defineProperty,$=Object.getOwnPropertyDescriptor,O=(i,t,s,a)=>{for(var e=a>1?void 0:a?$(t,s):t,r=i.length-1,n;r>=0;r--)(n=i[r])&&(e=(a?n(t,s,e):n(e))||e);return a&&e&&g(t,s,e),e};const{stablePrefix:j}=p;let c=class extends o{render(){return P(this)}};c=O([h(`${j}-chat-list`)],c);

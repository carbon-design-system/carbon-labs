import{n as p,t as b}from"./property-C_111YFZ.js";import{i as x,s as v,x as c}from"./lit-element-in3Y6axH.js";import{s as h}from"./settings-BQP9c3yA.js";import{s as g}from"./16-BxAYhY3r.js";import{s as m}from"./24-CTnKDOJN.js";import{b as y}from"./directive-Bp-AemGL.js";import{s as $}from"./spread-O99WNTpv.js";import"./loading-B6u45s9P.js";const w=x`:host(clabs-chat-file-upload) .clabs--chat-file-upload-container{display:flex;overflow:hidden;flex-direction:column;align-items:flex-start;border-radius:8px;background:var(--cds-layer-selected-01, #e0e0e0);background-blend-mode:multiply;font-family:IBM Plex Sans,sans-serif;font-size:14px;font-style:normal;font-weight:400;inline-size:177px;letter-spacing:.16px;line-height:18px}:host(clabs-chat-file-upload) .clabs--chat-file-upload--float-right{display:flex;justify-content:flex-end}:host(clabs-chat-file-upload) .clabs--chat-file-upload--float-left{display:flex;justify-content:flex-start}:host(clabs-chat-file-upload) .clabs--chat-file-upload-top-container{display:flex;box-sizing:border-box;flex-direction:row;padding:8px 16px;block-size:32px;gap:8px;inline-size:100%}:host(clabs-chat-file-upload) .clabs--chat-file-upload-bottom-container{display:flex;padding:8px 16px;border-block-start:2px solid var(--cds-border-subtle-01, #c6c6c6);color:var(--cds-support-error, #da1e28)}:host(clabs-chat-file-upload) .clabs--chat-file-upload-container-error{border:2px solid var(--cds-support-error, #da1e28)}:host(clabs-chat-file-upload) .clabs--chat-file-upload-container-file-status{block-size:16px;inline-size:16px;padding-block-start:2px}:host(clabs-chat-file-upload) .clabs--chat-file-upload-container-file-status-success svg{fill:var(--cds-link-primary, #0f62fe)}:host(clabs-chat-file-upload) .clabs--chat-file-upload-container-file-type svg{block-size:20px;inline-size:20px}:host(clabs-chat-file-upload) .clabs--chat-file-upload-container-file-name{overflow:hidden;flex:3;white-space:nowrap}:host(clabs-chat-file-upload) .clabs--chat-file-upload-container-loader{overflow:hidden;block-size:32px;inline-size:32px}`;var _=Object.defineProperty,d=(s,e,a,l)=>{for(var t=void 0,o=s.length-1,r;o>=0;o--)(r=s[o])&&(t=r(e,a,t)||t);return t&&_(e,a,t),t};const f=class f extends v{constructor(){super(...arguments),this._status="loading"}updated(e){super.updated(e),e.has("content")}firstUpdated(){this.content}};f.styles=w;let n=f;d([p({type:String,attribute:"content"})],n.prototype,"content");d([p({type:String,attribute:"error-message"})],n.prototype,"_errorMessage");d([p({type:String,attribute:"status"})],n.prototype,"_status");const z=({children:s,...e}={})=>y`<svg focusable="false" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" fill="currentColor" ...="${$(e)}" aria-hidden="true" width="16" height="16" viewBox="0 0 32 32">${s}<path d="M14 21.414L9 16.413 10.413 15 14 18.586 21.585 11 23 12.415 14 21.414z"></path><path d="M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2Zm0,26A12,12,0,1,1,28,16,12,12,0,0,1,16,28Z"></path></svg>`;/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const{stablePrefix:i}=h;function P(s){const{content:e,_status:a,_errorMessage:l}=s;return c` <div
    class="${i}--chat-file-upload-container ${a==="error"?i+"--chat-file-upload-container-error":""}">
    <div class="${i}--chat-file-upload-top-container">
      <div class="${i}--chat-file-upload-container-file-type">
        ${m()}
      </div>
      <div class="${i}--chat-file-upload-container-file-name">
        ${e}
      </div>
      <div
        class="${i}--chat-file-upload-container-file-status${a==="success"?"-success":""}">
        ${a==="loading"?c` <cds-loading type="small"></cds-loading> `:a==="success"?c` ${z()} `:c` ${g()}`}
      </div>
    </div>
    ${a==="error"?c`
          <div class="${i}--chat-file-upload-bottom-container">
            ${l||"Default error message"}
          </div>
        `:c``}
  </div>`}var M=Object.defineProperty,C=Object.getOwnPropertyDescriptor,j=(s,e,a,l)=>{for(var t=l>1?void 0:l?C(e,a):e,o=s.length-1,r;o>=0;o--)(r=s[o])&&(t=(l?r(e,a,t):r(t))||t);return l&&t&&M(e,a,t),t};const{stablePrefix:O}=h;let u=class extends n{render(){return P(this)}};u=j([b(`${O}-chat-file-upload`)],u);

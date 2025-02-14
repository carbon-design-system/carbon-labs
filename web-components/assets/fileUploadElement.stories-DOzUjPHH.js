import{n as f,t as S}from"./property-DRkoNOFH.js";import{i as M,r as C,b as w,x as o}from"./lit-element-CKvUdWNz.js";import{s as _}from"./settings-BQP9c3yA.js";import{s as F}from"./16-DIDCtVVX.js";import{s as z}from"./spread-Cnb5k-G6.js";import"./loading-CD7JLoL0.js";const P=M`:host(clabs-chat-file-upload) .clabs--chat-file-upload-container{display:flex;overflow:hidden;flex-direction:column;align-items:flex-start;border-radius:8px;background:var(--cds-layer-selected-01, #e0e0e0);background-blend-mode:multiply;font-family:IBM Plex Sans,sans-serif;font-size:14px;font-style:normal;font-weight:400;inline-size:177px;letter-spacing:.16px;line-height:18px}:host(clabs-chat-file-upload) .clabs--chat-file-upload--float-right{display:flex;justify-content:flex-end}:host(clabs-chat-file-upload) .clabs--chat-file-upload--float-left{display:flex;justify-content:flex-start}:host(clabs-chat-file-upload) .clabs--chat-file-upload-top-container{display:flex;box-sizing:border-box;flex-direction:row;padding:8px 16px;block-size:32px;gap:8px;inline-size:100%}:host(clabs-chat-file-upload) .clabs--chat-file-upload-bottom-container{display:flex;padding:8px 16px;border-block-start:2px solid var(--cds-border-subtle-01, #c6c6c6);color:var(--cds-support-error, #da1e28)}:host(clabs-chat-file-upload) .clabs--chat-file-upload-container-error{border:2px solid var(--cds-support-error, #da1e28)}:host(clabs-chat-file-upload) .clabs--chat-file-upload-container-file-status{block-size:16px;inline-size:16px;padding-block-start:2px}:host(clabs-chat-file-upload) .clabs--chat-file-upload-container-file-status-success svg{fill:var(--cds-link-primary, #0f62fe)}:host(clabs-chat-file-upload) .clabs--chat-file-upload-container-file-type svg{block-size:20px;inline-size:20px}:host(clabs-chat-file-upload) .clabs--chat-file-upload-container-file-name{overflow:hidden;flex:3;white-space:nowrap}:host(clabs-chat-file-upload) .clabs--chat-file-upload-container-loader{overflow:hidden;block-size:32px;inline-size:32px}`;var R=Object.defineProperty,u=(s,e,a,l)=>{for(var t=void 0,r=s.length-1,c;r>=0;r--)(c=s[r])&&(t=c(e,a,t)||t);return t&&R(e,a,t),t};const h=class h extends C{constructor(){super(...arguments),this._status="loading"}updated(e){super.updated(e),e.has("content")}firstUpdated(){this.content}};h.styles=P;let n=h;u([f({type:String,attribute:"content"})],n.prototype,"content");u([f({type:String,attribute:"error-message"})],n.prototype,"_errorMessage");u([f({type:String,attribute:"status"})],n.prototype,"_status");const A=({children:s,...e}={})=>w`<svg focusable="false" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" fill="currentColor" ...="${z(e)}" aria-hidden="true" width="24" height="24" viewBox="0 0 32 32">${s}<path d="M30 11L30 9 22 9 22 23 24 23 24 17 29 17 29 15 24 15 24 11 30 11zM8 9H2V23H4V18H8a2 2 0 002-2V11A2 2 0 008 9zm0 7H4V11H8zM16 23H12V9h4a4 4 0 014 4v6A4 4 0 0116 23zm-2-2h2a2 2 0 002-2V13a2 2 0 00-2-2H14z"></path></svg>`,O=({children:s,...e}={})=>w`<svg focusable="false" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" fill="currentColor" ...="${z(e)}" aria-hidden="true" width="16" height="16" viewBox="0 0 32 32">${s}<path d="M14 21.414L9 16.413 10.413 15 14 18.586 21.585 11 23 12.415 14 21.414z"></path><path d="M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2Zm0,26A12,12,0,1,1,28,16,12,12,0,0,1,16,28Z"></path></svg>`;/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const{stablePrefix:i}=_;function j(s){const{content:e,_status:a,_errorMessage:l}=s;return o` <div
    class="${i}--chat-file-upload-container ${a==="error"?i+"--chat-file-upload-container-error":""}">
    <div class="${i}--chat-file-upload-top-container">
      <div class="${i}--chat-file-upload-container-file-type">
        ${A()}
      </div>
      <div class="${i}--chat-file-upload-container-file-name">
        ${e}
      </div>
      <div
        class="${i}--chat-file-upload-container-file-status${a==="success"?"-success":""}">
        ${a==="loading"?o` <cds-loading type="small"></cds-loading> `:a==="success"?o` ${O()} `:o` ${F()}`}
      </div>
    </div>
    ${a==="error"?o`
          <div class="${i}--chat-file-upload-bottom-container">
            ${l||"Default error message"}
          </div>
        `:o``}
  </div>`}var H=Object.defineProperty,k=Object.getOwnPropertyDescriptor,T=(s,e,a,l)=>{for(var t=l>1?void 0:l?k(e,a):e,r=s.length-1,c;r>=0;r--)(c=s[r])&&(t=(l?c(e,a,t):c(t))||t);return l&&t&&H(e,a,t),t};const{stablePrefix:V}=_;let b=class extends n{render(){return j(this)}};b=T([S(`${V}-chat-file-upload`)],b);/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const D={title:"Components/AI Components/File Upload"},d={render:()=>o` <clabs-chat-file-upload content="Test_file.pdf">
  </clabs-chat-file-upload>`},p={render:()=>o`
    <h4>Loading</h4>
    <br />
    <clabs-chat-file-upload content="Filename.pdf"> </clabs-chat-file-upload>
    <h4>Success</h4>
    <br />
    <clabs-chat-file-upload status="success" content="Filename.pdf">
    </clabs-chat-file-upload>
    <h4>Close</h4>
    <br />
    <clabs-chat-file-upload status="close" content="Filename.pdf">
    </clabs-chat-file-upload>
    <h4>Error</h4>
    <br />
    <clabs-chat-file-upload
      status="error"
      error-message="File exceeds size limit"
      content="Filename.pdf">
    </clabs-chat-file-upload>
  `};var m,x,g;d.parameters={...d.parameters,docs:{...(m=d.parameters)==null?void 0:m.docs,source:{originalSource:`{
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html\` <clabs-chat-file-upload content="Test_file.pdf">
  </clabs-chat-file-upload>\`
}`,...(g=(x=d.parameters)==null?void 0:x.docs)==null?void 0:g.source}}};var v,y,$;p.parameters={...p.parameters,docs:{...(v=p.parameters)==null?void 0:v.docs,source:{originalSource:`{
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html\`
    <h4>Loading</h4>
    <br />
    <clabs-chat-file-upload content="Filename.pdf"> </clabs-chat-file-upload>
    <h4>Success</h4>
    <br />
    <clabs-chat-file-upload status="success" content="Filename.pdf">
    </clabs-chat-file-upload>
    <h4>Close</h4>
    <br />
    <clabs-chat-file-upload status="close" content="Filename.pdf">
    </clabs-chat-file-upload>
    <h4>Error</h4>
    <br />
    <clabs-chat-file-upload
      status="error"
      error-message="File exceeds size limit"
      content="Filename.pdf">
    </clabs-chat-file-upload>
  \`
}`,...($=(y=p.parameters)==null?void 0:y.docs)==null?void 0:$.source}}};const I=["Default","Showcase"],q=Object.freeze(Object.defineProperty({__proto__:null,Default:d,Showcase:p,__namedExportsOrder:I,default:D},Symbol.toStringTag,{value:"Module"}));export{q as e};

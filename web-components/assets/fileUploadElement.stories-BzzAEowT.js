import"./fileUploadElement-OnYOZJVo.js";import{x as r}from"./lit-element-in3Y6axH.js";/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const i={title:"Components/Experimental/File Upload"},e={render:()=>r` <clabs-chat-file-upload content="Test_file.pdf">
  </clabs-chat-file-upload>`},a={render:()=>r`
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
  `};var t,l,s;e.parameters={...e.parameters,docs:{...(t=e.parameters)==null?void 0:t.docs,source:{originalSource:`{
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html\` <clabs-chat-file-upload content="Test_file.pdf">
  </clabs-chat-file-upload>\`
}`,...(s=(l=e.parameters)==null?void 0:l.docs)==null?void 0:s.source}}};var n,o,c;a.parameters={...a.parameters,docs:{...(n=a.parameters)==null?void 0:n.docs,source:{originalSource:`{
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
}`,...(c=(o=a.parameters)==null?void 0:o.docs)==null?void 0:c.source}}};const d=["Default","Showcase"],h=Object.freeze(Object.defineProperty({__proto__:null,Default:e,Showcase:a,__namedExportsOrder:d,default:i},Symbol.toStringTag,{value:"Module"}));export{h as e};

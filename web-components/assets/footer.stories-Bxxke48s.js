import"./footer-D1WbLE0p.js";import{x as i}from"./lit-element-in3Y6axH.js";/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const c={title:"Components/Chat/Footer"},e={render:()=>i` <h4>Default Input</h4>
    <br />
    <clabs-chat-footer> </clabs-chat-footer>`},t={render:()=>i` <h4>Default Input</h4>
    <br />
    <br />
    <div style="position:relative; top:40px;">
      <clabs-chat-footer> </clabs-chat-footer>
    </div>
    <br />
    <br />
    <br />
    <h4>Custom PlaceHolder</h4>
    <br />
    <br />
    <div style="position:relative; top:40px;">
      <clabs-chat-footer
        input-placeholder="Place any custom text here with input-placeholder">
      </clabs-chat-footer>
    </div>
    <br />
    <br />
    <br />
    <h4>Character limit of 20</h4>
    <br />
    <div style="position:relative; top:40px;">
      <clabs-chat-footer character-limit="20"> </clabs-chat-footer>
    </div>
    <br />
    <br />
    <h4>With information message</h4>
    <br />
    <div style="position:relative; top:40px;">
      <clabs-chat-footer
        context-message="${"Click the AI icon above for more details sjd;jkls;f;kjsdjkfskjfdkjdfjkdjks;ffjsklklsfdkldskjfksjkfkljdsfkldkjlfskjdfkljsf;dlkjkfjsklsfdkj"}"
        context-message-type="${"info"}">
      </clabs-chat-footer>
    </div>
    <br />
    <br />
    <h4>With error message</h4>
    <br />
    <div style="position:relative; top:40px;">
      <clabs-chat-footer
        context-message="${"Server error: querying is unavailable"}"
        context-message-type="${"error"}">
      </clabs-chat-footer>
    </div>
    <br />
    <br />
    <h4>With warning message</h4>
    <br />
    <div style="position:relative; top:40px;">
      <clabs-chat-footer
        context-message="${"Your next request may take over a minute to process"}"
        context-message-type="${"warning"}">
      </clabs-chat-footer>
    </div>`};var r,o,s;e.parameters={...e.parameters,docs:{...(r=e.parameters)==null?void 0:r.docs,source:{originalSource:`{
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html\` <h4>Default Input</h4>
    <br />
    <clabs-chat-footer> </clabs-chat-footer>\`
}`,...(s=(o=e.parameters)==null?void 0:o.docs)==null?void 0:s.source}}};var a,n,l;t.parameters={...t.parameters,docs:{...(a=t.parameters)==null?void 0:a.docs,source:{originalSource:`{
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html\` <h4>Default Input</h4>
    <br />
    <br />
    <div style="position:relative; top:40px;">
      <clabs-chat-footer> </clabs-chat-footer>
    </div>
    <br />
    <br />
    <br />
    <h4>Custom PlaceHolder</h4>
    <br />
    <br />
    <div style="position:relative; top:40px;">
      <clabs-chat-footer
        input-placeholder="Place any custom text here with input-placeholder">
      </clabs-chat-footer>
    </div>
    <br />
    <br />
    <br />
    <h4>Character limit of 20</h4>
    <br />
    <div style="position:relative; top:40px;">
      <clabs-chat-footer character-limit="20"> </clabs-chat-footer>
    </div>
    <br />
    <br />
    <h4>With information message</h4>
    <br />
    <div style="position:relative; top:40px;">
      <clabs-chat-footer
        context-message="\${'Click the AI icon above for more details sjd;jkls;f;kjsdjkfskjfdkjdfjkdjks;ffjsklklsfdkldskjfksjkfkljdsfkldkjlfskjdfkljsf;dlkjkfjsklsfdkj'}"
        context-message-type="\${'info'}">
      </clabs-chat-footer>
    </div>
    <br />
    <br />
    <h4>With error message</h4>
    <br />
    <div style="position:relative; top:40px;">
      <clabs-chat-footer
        context-message="\${'Server error: querying is unavailable'}"
        context-message-type="\${'error'}">
      </clabs-chat-footer>
    </div>
    <br />
    <br />
    <h4>With warning message</h4>
    <br />
    <div style="position:relative; top:40px;">
      <clabs-chat-footer
        context-message="\${'Your next request may take over a minute to process'}"
        context-message-type="\${'warning'}">
      </clabs-chat-footer>
    </div>\`
}`,...(l=(n=t.parameters)==null?void 0:n.docs)==null?void 0:l.source}}};const h=["Default","Showcase"],p=Object.freeze(Object.defineProperty({__proto__:null,Default:e,Showcase:t,__namedExportsOrder:h,default:c},Symbol.toStringTag,{value:"Module"}));export{p as e};

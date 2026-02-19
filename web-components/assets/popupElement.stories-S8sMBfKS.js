import"./popupElement-BJWD_msS.js";import{b as s}from"./iframe-DJhAwP_w.js";/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const c={title:"Components/AI Components/Feedback"},i={title:"Example text",tags:["A","random long text to text label length to the ends of the component","lorem ipsum dolor","lorem ipsum dolor"],prompt:"What was unsatisfactory about this response?",responsePlaceholder:"Describe issues with this response",dataCollectionTitle:"I allow IBm to collect my feedback",enableDataCollectionCheck:!0,disclaimer:"Lorem ipsum dolor sit amet, di os consectetur adipiscing elit, sed doeiusmod tempor incididunt ut fsil labore et dolore magna aliqua."},p={title:"Hate speech violation",prompt:"Help us do better",responsePlaceholder:"Describe issues with this response",disableTextArea:!0,description:"Select the severity of this violation and provide details if needed",radioTitle:"Severity",radioButtons:[{value:0,text:"mild"},{value:1,text:"concerning"},{value:2,text:"elevated"},{value:3,text:"serious"},{value:5,text:"very serious"}],model:{name:"granite.13.chat.v2",url:"https://www.google.com"},dataCollectionTitle:"I allow IBM to collect my feedback",enableDataCollectionCheck:!1},e="position:relative;width: 50%; min-height:500px;",t={render:()=>s`
    <div style="display:flex;flex-direction:column;gap:16px;">
      <div style="${e}">
        <h4>Default</h4>
        <clabs-chat-popup> </clabs-chat-popup>
      </div>
      <div style="${e}">
        <h4>Custom</h4>
        <clabs-chat-popup
          prompt-title="Custom title"
          text-area-placeholder="Custom placeholder"
          popup-title="Custom title"
          orientation="top"
          .tagList="${'["choice A","choice B","choice B","choice B","choice B", "choice Cddfsk;llkdsklfd"]'}"
          disclaimer="Place your own legal disclaimer here">
        </clabs-chat-popup>
      </div>

      <div style="${e}">
        <h4>Experimental - advanced</h4>
        <clabs-chat-popup .feedbackFormValues="${i}">
        </clabs-chat-popup>
      </div>

      <div style="${e}">
        <h4>Default</h4>
        <clabs-chat-popup custom-policy-mode> </clabs-chat-popup>
      </div>

      <div style="${e}">
        <h4>Hate speech example</h4>
        <clabs-chat-popup .feedbackFormValues="${p}">
        </clabs-chat-popup>
      </div>
    </div>
  `};var o,l,a;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html\`
    <div style="display:flex;flex-direction:column;gap:16px;">
      <div style="\${customStyle}">
        <h4>Default</h4>
        <clabs-chat-popup> </clabs-chat-popup>
      </div>
      <div style="\${customStyle}">
        <h4>Custom</h4>
        <clabs-chat-popup
          prompt-title="Custom title"
          text-area-placeholder="Custom placeholder"
          popup-title="Custom title"
          orientation="top"
          .tagList="\${'["choice A","choice B","choice B","choice B","choice B", "choice Cddfsk;llkdsklfd"]'}"
          disclaimer="Place your own legal disclaimer here">
        </clabs-chat-popup>
      </div>

      <div style="\${customStyle}">
        <h4>Experimental - advanced</h4>
        <clabs-chat-popup .feedbackFormValues="\${defExample}">
        </clabs-chat-popup>
      </div>

      <div style="\${customStyle}">
        <h4>Default</h4>
        <clabs-chat-popup custom-policy-mode> </clabs-chat-popup>
      </div>

      <div style="\${customStyle}">
        <h4>Hate speech example</h4>
        <clabs-chat-popup .feedbackFormValues="\${hateExample}">
        </clabs-chat-popup>
      </div>
    </div>
  \`
}`,...(a=(l=t.parameters)==null?void 0:l.docs)==null?void 0:a.source}}};const n=["Default"],u=Object.freeze(Object.defineProperty({__proto__:null,Default:t,__namedExportsOrder:n,default:c},Symbol.toStringTag,{value:"Module"}));export{u as p};

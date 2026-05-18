import{J as e,R as t}from"./iframe-8iJoaOdx.js";import"./popupElement-CMmxOHp8.js";var n=e({Default:()=>s,__namedExportsOrder:()=>c,default:()=>r}),r={title:`Components/AI Components/Feedback`},i={title:`Example text`,tags:[`A`,`random long text to text label length to the ends of the component`,`lorem ipsum dolor`,`lorem ipsum dolor`],prompt:`What was unsatisfactory about this response?`,responsePlaceholder:`Describe issues with this response`,dataCollectionTitle:`I allow IBm to collect my feedback`,enableDataCollectionCheck:!0,disclaimer:`Lorem ipsum dolor sit amet, di os consectetur adipiscing elit, sed doeiusmod tempor incididunt ut fsil labore et dolore magna aliqua.`},a={title:`Hate speech violation`,prompt:`Help us do better`,responsePlaceholder:`Describe issues with this response`,disableTextArea:!0,description:`Select the severity of this violation and provide details if needed`,radioTitle:`Severity`,radioButtons:[{value:0,text:`mild`},{value:1,text:`concerning`},{value:2,text:`elevated`},{value:3,text:`serious`},{value:5,text:`very serious`}],model:{name:`granite.13.chat.v2`,url:`https://www.google.com`},dataCollectionTitle:`I allow IBM to collect my feedback`,enableDataCollectionCheck:!1},o=`position:relative;width: 50%; min-height:500px;`,s={render:()=>t`
    <div style="display:flex;flex-direction:column;gap:16px;">
      <div style="${o}">
        <h4>Default</h4>
        <clabs-chat-popup> </clabs-chat-popup>
      </div>
      <div style="${o}">
        <h4>Custom</h4>
        <clabs-chat-popup
          prompt-title="Custom title"
          text-area-placeholder="Custom placeholder"
          popup-title="Custom title"
          orientation="top"
          .tagList="${`["choice A","choice B","choice B","choice B","choice B", "choice Cddfsk;llkdsklfd"]`}"
          disclaimer="Place your own legal disclaimer here">
        </clabs-chat-popup>
      </div>

      <div style="${o}">
        <h4>Experimental - advanced</h4>
        <clabs-chat-popup .feedbackFormValues="${i}">
        </clabs-chat-popup>
      </div>

      <div style="${o}">
        <h4>Default</h4>
        <clabs-chat-popup custom-policy-mode> </clabs-chat-popup>
      </div>

      <div style="${o}">
        <h4>Hate speech example</h4>
        <clabs-chat-popup .feedbackFormValues="${a}">
        </clabs-chat-popup>
      </div>
    </div>
  `};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
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
}`,...s.parameters?.docs?.source}}};var c=[`Default`];export{s as Default,c as __namedExportsOrder,r as default,n as t};
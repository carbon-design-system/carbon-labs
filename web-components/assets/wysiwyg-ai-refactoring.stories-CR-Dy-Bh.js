import{R as e}from"./iframe-Dk3OmjiN.js";import"./icon-button-DaQzZYuv.js";import"./tooltip-CY-gdRfT.js";import{t}from"./icon-loader-BI33ALmp.js";import{t as n}from"./16-BMmoAzjX.js";import{n as r,t as i}from"./ref-CS_DfZo1.js";import{b as a,l as o,o as s,t as c}from"./story-helpers-CbwY3ErU.js";import"./search-BfgKSJoe.js";var l={elem:`svg`,attrs:{xmlns:`http://www.w3.org/2000/svg`,viewBox:`0 0 32 32`,fill:`currentColor`,width:16,height:16},content:[{elem:`path`,attrs:{"stroke-width":`0`,d:`m19,22v-2h1v-7h-1v-2h4v2h-1v7h1v2h-4Z`}},{elem:`path`,attrs:{"stroke-width":`0`,d:`m15.5005,22h2l-3.5005-11h-3l-3.4966,11h1.9988l.6018-2h4.7781l.6184,2Zm-4.7947-4l1.6284-5.4111.2559-.0024,1.6736,5.4136h-3.5579Z`}},{elem:`path`,attrs:{"stroke-width":`0`,d:`M32 4 28 4 28 0 26 0 26 4 22 4 22 6 26 6 26 10 28 10 28 6 32 6 32 4z`}},{elem:`path`,attrs:{"stroke-width":`0`,d:`M30 12H32V14H30z`}},{elem:`path`,attrs:{"stroke-width":`0`,d:`M18 0H20V2H18z`}},{elem:`path`,attrs:{"stroke-width":`0`,d:`M32 32 0 32 0 0 14 0 14 2 2 2 2 30 30 30 30 18 32 18 32 32z`}}],name:`ai-generate`,size:16},u=o.create({name:`markAI`,addOptions(){return{HTMLAttributes:{class:`ai-processing`}}},parseHTML(){return[{tag:`span.ai-processing`}]},renderHTML({HTMLAttributes:e}){return[`span`,a(this.options.HTMLAttributes,e),0]},addCommands(){return{setMarkAI:()=>({commands:e})=>e.setMark(this.name,void 0,{addToHistory:!1}),unsetMarkAI:()=>({commands:e})=>e.unsetMark(this.name,{addToHistory:!1})}}}),d={name:`ai-refactoring`,toolbarRender:(a,o=`md`)=>{if(!a||a.state.selection.empty)return e``;let c=i(),u=i(),d=async()=>{c.value&&(c.value.open=!1);let{from:e,to:t}=a.state.selection,n=a.state.doc.textBetween(e,t,` `);if(!n.trim())return;let r=a.state.tr;r.addMark(e,t,a.schema.marks.markAI.create()),r.setMeta(`addToHistory`,!1),r.setMeta(`preventUpdate`,!1),a.view.dispatch(r),a.commands.setTextSelection(t),a.commands.focus();let i=await s(n),o=a.state.tr;o.removeMark(e,t,a.schema.marks.markAI),o.setMeta(`addToHistory`,!1),a.view.dispatch(o),a.chain().focus().setTextSelection({from:e,to:t}).deleteSelection().insertContent(i).run();let l=a.state.selection.to;a.commands.setTextSelection(l),u.value&&(u.value.value=``)};return e`
      <style>
        .ai-prompt-popover {
          display: flex;
        }
        .ai-prompt-popover cds-text-input {
          --cds-border-strong: transparent;
          flex: 1;
        }
      </style>
      <div class="clabs-wysiwyg__toolbar-group">
        <cds-layer level="1">
          <cds-popover ${r(c)} tabtip align="bottom" autoalign>
            <cds-icon-button
              kind="ghost"
              caret
              autoalign
              .size=${o}
              @click=${()=>{if(c.value){let e=c.value.open;c.value.open=!e,!e&&u.value&&setTimeout(()=>{u.value?.focus()},0)}}}>
              ${t(l,{slot:`icon`,tabIndex:`-1`})}
              <span slot="tooltip-content">AI Generate</span>
            </cds-icon-button>
            <cds-popover-content slot="content">
              <div class="ai-prompt-popover">
                <cds-text-input
                  .size=${o}
                  hide-label
                  ${r(u)}
                  placeholder="Enter prompt"
                  @keydown=${e=>{e.key===`Enter`&&d()}}>
                </cds-text-input>
                <cds-icon-button
                  kind="primary"
                  .size=${o}
                  @click=${d}>
                  ${t(n,{slot:`icon`})}
                  <span slot="tooltip-content">Apply</span>
                </cds-icon-button>
              </div>
            </cds-popover-content>
          </cds-popover>
        </cds-layer>
      </div>
    `}},f={title:`Components/Wysiwyg/Customizations`,tags:[`squad`,`incubating`],component:`clabs-wysiwyg`,argTypes:{toolbarSize:{control:`select`,options:[`sm`,`md`,`lg`]}},args:{toolbarSize:`md`,content:`
      <h2>AI-Powered Editing</h2>
      <p>Select text and click the AI button to transform it.</p>
      <h3>Example: Plain Text to List</h3>
      <p>Benefits of cloud computing: scalability, cost efficiency, flexibility, automatic updates, disaster recovery, security, collaboration, competitive edge</p>
      <h3>Example: Text Enhancement</h3>
      <p>The quick brown fox jumps over the lazy dog.</p>
      <br>
      <hr>
      <p><strong>Note:</strong> This is a simulated story for demonstration purposes and does not require a prompt. In a real product implementation, the prompt, selected text, and the entire content can be sent to your backend AI service to generate a real AI response.</p>
      <p>This example demonstrates simplified custom extension. See also: <a target="_blank" rel="noopener noreferrer" href="https://tiptap.dev/docs/content-ai/getting-started/overview">Build AI-powered editors</a></p>
    `},decorators:[t=>e`
      <style>
        #main-content {
          block-size: 100dvh;
        }
      </style>
      ${t()}
    `]},p={render:t=>e`
      <clabs-wysiwyg
        .extensions=${[...c,u,d]}
        .content=${t.content}
        toolbar-size=${t.toolbarSize}
        @content-change=${e=>{console.log(`content-change`,e)}}></clabs-wysiwyg>
    `};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  /**
   * Render story
   * @param {object} args - Story args
   * @returns {TemplateResult} Template
   */
  render: args => {
    const extensions = [...allExtensions, MarkAI, AIRefactoring];
    return html\`
      <clabs-wysiwyg
        .extensions=\${extensions}
        .content=\${args.content}
        toolbar-size=\${args.toolbarSize}
        @content-change=\${e => {
      console.log('content-change', e);
    }}></clabs-wysiwyg>
    \`;
  }
}`,...p.parameters?.docs?.source}}};var m=[`AIPoweredEditing`];export{p as AIPoweredEditing,m as __namedExportsOrder,f as default};
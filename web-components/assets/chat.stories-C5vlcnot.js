import{n as s,t as Ve}from"./property-C_111YFZ.js";import{i as Ce,s as Ye,x as y}from"./lit-element-in3Y6axH.js";import{s as K}from"./settings-BQP9c3yA.js";import{r as w}from"./state-B7rdIQBm.js";import"./messages-CoUkSLTp.js";import"./header-Cxm-A-O_.js";import"./footer-BO4VrsD3.js";import"./icon-button-DHDoGIEG.js";import{_ as f,p as b,c as xe}from"./carbon-element-ZG_lSGav.js";import{e as Xe,i as Ke,t as Qe,T as Ze,r as Q,x as B}from"./directive-Bp-AemGL.js";import{s as et}from"./16-DE6QptpG.js";import{F as tt}from"./focus-CQ1fMjd6.js";import"./shared-enums-BmCXCbog.js";import"./codeElement-B5MofQda.js";import"./button-Cd4OINk7.js";import"./button-skeleton-hlz9ge6A.js";const Z={BASE_URL:"./",DEV:!1,MODE:"production",PROD:!0,SSR:!1,STORYBOOK:"true"};/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const ne=Z&&void 0,Y=Z&&void 0,nt=Z&&void 0;class X{static async sendMessageWatsonX(e,t,n,o,c,l,p,m){if(console.log("sending to WatsonX..."),console.log(o),console.log(n),console.log(l),console.log(m),console.log(p),!Y)return{failed:!0,reply:"Error: No Watsonx-ai API key specified, please append your key to your .env root file in order to access the Watson service"};const d=1e4,k="user",E="bot",_=`[INST] <<SYS>> You are Watson, you'll answer all my questions. <</SYS>> [/INST]
    `;let S="meta-llama/llama-2-70b-chat";t=="granite"&&(S="granite");const A={decoding_method:"greedy",max_new_tokens:d,min_new_tokens:0,stop_sequences:[k,E],repetition_penalty:1},M=nt;if(M==null)return{failed:!0,reply:"No Watsonx-ai project id specified, please add it to your .env file"};const N=c.map(h=>h.origin+":"+h.text).join(`
`),O={b64_encoded_inputs:!0,hapEnabled:!0,hapText:_,locale:"en",projectId:M,promptData:{imput:N,modelId:S,modelParameters:A}};console.log(O),console.log(Y);const z={method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+Y},body:JSON.stringify(O)};try{return await fetch(e,z).then(h=>h.json()).then(h=>h)}catch(h){return{reply:"Error reaching: "+e+" Details: "+h.message,failed:!0}}}static async sendMessageBAM(e,t,n,o,c,l,p,m){if(console.log("sending to BAM..."),console.log(o),console.log(l),console.log(m),console.log(p),!ne)return{failed:!0,reply:"Error: No API key specified, please append your key to your .env root file or Vite file in order to access the BAM service"};const d="user",k="bot",E="[INST] <<SYS>> You are Watson, you'll answer all my questions. <</SYS>> [/INST]",_=c.map(x=>x.origin+":"+x.text).join(`
`),S="meta-llama/"+t+"-70b-chat",A=E+`
`+_,z={model_id:S,inputs:[A],parameters:{decoding_method:"sample",stream:!1,temperature:n,top_k:50,top_p:1,max_new_tokens:1024,stop_sequences:[d,k]}},h={method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+ne},body:JSON.stringify(z)};try{return await fetch(e,h).then(x=>x.json()).then(x=>x)}catch(x){return{reply:"Error reaching: "+e+" Details: "+x.message,failed:!0}}}static async sendMessageLocal(e,t,n,o,c,l,p,m){console.log("querying "+e+" with model:"+t+" (temp: "+n+")");const d=1e3,k="user",E="bot";let _="[INST] <<SYS>> "+o+' If returning code of any kind you must use "```" delimiters<</SYS>> [/INST]';_="[INST] <<SYS>> "+o+" <</SYS>> [/INST]";let S=_+c.map(g=>g.type=="bot"?"[INST]"+g.text+"[/INST]":g.text).join(`
`);const A=c.map(g=>g.type+":"+g.text).join(`
`);S=_;const q={user_id:"xxxxxx",session:p,event:m,prompt:S,reminder:"",context:A,entry:l,temperature:n,max_tokens:d,top_p:0,frequency_penalty:1,presence_penalty:0,n:1,user_name:k,agent_name:E,max_tries:3};console.log(q);const L={method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(q)};try{return await fetch(e,L).then(g=>g.json()).then(g=>(console.log(g.reply),t=="llama-2"&&(g.reply=g.reply.split("undefined")[0]),g))}catch(g){return{reply:"Error reaching: "+e+" Details: "+g.message,failed:!0}}}}const ot=Ce`:host(clabs-chat){background:var(--cds-background, #ffffff)}:host(clabs-chat) .clabs--chat-container{position:relative;display:block;overflow:hidden;border:1px solid rgba(69,137,255,.2);border-radius:8px;background:var(--cds-background, #ffffff);block-size:100%;box-shadow:0 23px 40px -24px #00000047;font-family:IBM Plex Sans,sans-serif;mix-blend-mode:normal;transition:border-color .6s ease}:host(clabs-chat) .clabs--chat-aria-container{display:none;opacity:0;visibility:hidden}:host(clabs-chat) .clabs--chat-content-container{position:relative;display:flex;overflow:hidden;flex-direction:column;background:linear-gradient(to bottom,var(--cds-background, #ffffff) 80%,rgba(69,137,255,.2));background-blend-mode:multiply;block-size:100%;max-block-size:100%}:host(clabs-chat) .clabs--chat-fullscreen{position:fixed;z-index:9999;block-size:100%;inline-size:100%;inset-block-start:0;inset-inline-start:0}:host(clabs-chat) .clabs--chat-closed{display:none;visibility:hidden}:host(clabs-chat) .clabs--chat-launcher-container-cls-1{fill:none;stroke-width:0}:host(clabs-chat) .clabs--chat-launcher-container-cls-2{stroke-width:0}:host(clabs-chat) .clabs--chat-launcher-container{position:fixed;z-index:1000;overflow:hidden;border:none;block-size:48px;inline-size:48px;inset-block-end:16px;inset-inline-end:16px}:host(clabs-chat) .clabs--chat-launcher-button::part(button){border-radius:24px;block-size:48px;inline-size:48px;padding-block-start:12px}:host(clabs-chat) .clabs--chat-launcher-button svg{block-size:20px;fill:var(--cds-background, #ffffff);inline-size:20px}:host(clabs-chat) .clabs--chat-docked{position:fixed;z-index:1000;block-size:640px;inline-size:320px;inset-block-end:var(--chat-docked-bottom-position, 16px);inset-inline-end:var(--chat-docked-right-position, 16px);max-block-size:calc(100% - 32px)}:host(clabs-chat) .clabs--chat-docked-dragging{border:2px dashed var(--cds-focus, #0f62fe);cursor:-moz-grabbing;opacity:.7}`;var at=Object.defineProperty,r=(a,e,t,n)=>{for(var o=void 0,c=a.length-1,l;c>=0;c--)(l=a[c])&&(o=l(e,t,o)||o);return o&&at(e,t,o),o};const{stablePrefix:T}=K;var $;let i=($=class extends Ye{constructor(){super(...arguments),this._messages=[],this._eventNumber=0,this._session=""+Math.random(),this._interruptStreaming=!0,this._queryInProgress=!1,this.chosenHost="Local",this.enableFullscreen=!1,this.enableDocking=!1,this.horizontalDockDirection="right",this.verticalDockDirection="bottom",this.verticalDockPosition=16,this.horizontalDockPosition=16,this._isDragging=!1,this.requestCancelled=!1,this.complexFeedbackCount=0}firstUpdated(){window.addEventListener("resize",e=>{this._checkPositioning(e)})}updated(e){super.updated(e),e.has("loading")&&(this._queryInProgress=this.loading,this.loading||(this._interruptStreaming=!0)),e.has("conversation")&&(this.conversation?this._messages=[...this.conversation]:this._messages=[]),e.has("defaultViewingMode")&&(this.defaultViewingMode==="fullscreen"&&(this.enableDocking=!1,this.enableFullscreen=!0),this.defaultViewingMode==="minimized"&&(this.enableDocking=!0,this.enableFullscreen=!1)),e.has("sampleQuery")&&this.initializeExamplesText(),e.has("temperature")&&(this.originalTemperature=this.temperature)}_handleSlotChange(e){e.preventDefault();const t=new CustomEvent("on-chat-slot-update",{detail:{action:"Chat slot subcomponent had updated"},bubbles:!0,composed:!0});this.dispatchEvent(t)}_handleHeaderEscape(){var t,n;const e=(t=this.shadowRoot)==null?void 0:t.querySelector(T+"-chat-footer");if(e instanceof HTMLElement){const o=(n=e.shadowRoot)==null?void 0:n.querySelector("."+T+"--chat-search-query");o instanceof HTMLElement&&o.focus()}}_handleFooterEscape(){var t,n,o;const e=(t=this.shadowRoot)==null?void 0:t.querySelector(T+"-chat-header");if(e instanceof HTMLElement){const c=(n=e.shadowRoot)==null?void 0:n.querySelector("#"+T+"--chat-header-overflow-menu-unique");if(c instanceof HTMLElement){const l=(o=c.shadowRoot)==null?void 0:o.querySelector("#button");l instanceof HTMLElement&&l.focus()}}}_endStreaming(e){e.preventDefault();const t=new CustomEvent("on-chat-end-streaming",{detail:{action:"Streaming interrupted by user"},bubbles:!0,composed:!0});this._interruptStreaming=!0,this.dispatchEvent(t)}_handleHeaderDragStart(e){var n,o;const t=e.detail.offset;this.enableDocking&&(this._isDragging=!0,(n=this.parentElement)==null||n.addEventListener("mousemove",c=>{c.preventDefault(),this._dragChat(c,t)}),(o=this.parentElement)==null||o.addEventListener("mouseup",c=>{this._dragEnd(c)}))}_handleHeaderDragCancel(e){this.enableDocking&&this._dragEnd(e)}_handleHeaderKeyboardDragStart(e){const t=e.detail.offset;this.enableDocking&&this._dragChatKeyboard(t)}_dragChatKeyboard(e){var t;if(this._isDragging){const n=(t=this.shadowRoot)==null?void 0:t.querySelector("."+T+"--chat-container");if(n instanceof HTMLElement){const o=n.clientHeight,c=n.clientWidth,l={top:16,bottom:16,left:16,right:16};this.dockBoundaries&&(l.top=this.dockBoundaries.top||16,l.bottom=this.dockBoundaries.bottom||16,l.left=this.dockBoundaries.left||16,l.right=this.dockBoundaries.right||16);let p=this.horizontalDockPosition+e.x,m=this.verticalDockPosition+e.y;p=Math.min(Math.max(l.right,p),window.innerWidth-l.left-c),m=Math.min(Math.max(l.bottom,m),window.innerHeight-l.top-o),p&&m&&(this.verticalDockPosition=m,this.horizontalDockPosition=p,this.style.setProperty("--chat-docked-bottom-position",m+"px"),this.style.setProperty("--chat-docked-right-position",p+"px"))}}}_checkPositioning(e){if(this.enableDocking){if(window.innerHeight<this.verticalDockPosition+640){const t=Math.max(window.innerHeight-640-16,16);this.verticalDockPosition=t,this.style.setProperty("--chat-docked-bottom-position",t+"px")}if(window.innerWidth<this.horizontalDockPosition+320){const t=Math.max(window.innerWidth-320-16,16);this.horizontalDockPosition=t,this.style.setProperty("--chat-docked-right-position",t+"px")}}}_dragChat(e,t){var n;if(this._isDragging){this.disableOutsideControl;const o=(n=this.shadowRoot)==null?void 0:n.querySelector("."+T+"--chat-container");if(o instanceof HTMLElement){const c=o.clientHeight,l=o.clientWidth,p={top:16,bottom:16,left:16,right:16};this.dockBoundaries&&(p.top=this.dockBoundaries.top||16,p.bottom=this.dockBoundaries.bottom||16,p.left=this.dockBoundaries.left||16,p.right=this.dockBoundaries.right||16);let m=window.innerWidth-(e.clientX-t.x)-l,d=window.innerHeight-(e.clientY-t.y)-c;m=Math.min(Math.max(p.right,m),window.innerWidth-p.left-l),d=Math.min(Math.max(p.bottom,d),window.innerHeight-p.top-c),m&&d&&(this.verticalDockPosition=d,this.horizontalDockPosition=m,this.style.setProperty("--chat-docked-bottom-position",d+"px"),this.style.setProperty("--chat-docked-right-position",m+"px"))}}}_dragEnd(e){this._isDragging=!1,this.disableOutsideControl}initializeExamplesText(){if(this.sampleQuery===""){this._messages=[],this._messages.length=0;return}this._interruptStreaming=!this._streamResponses,this._messages.length=0;const e=this.sampleQuery.split("bot:"),t=e[0].replace("user:",""),n=e[1];this._messages=[{text:t,origin:this.userName,hasError:!1,time:this._getCurrentTime(),index:0}],n&&(this._messages=[...this._messages,{text:n,origin:this.agentName,hasError:!1,time:this._getCurrentTime(),index:1}]),this._queryInProgress=!1}async getResults(e){let t;return this.chosenHost=="Local"&&(t=await X.sendMessageLocal(this.apiURL,this.model,this.temperature,this.userPrompt,this._messages,e,this._session,this._eventNumber)),this.chosenHost=="BAM"&&(t=await X.sendMessageBAM(this.apiURL,this.model,this.temperature,this.userPrompt,this._messages,e,this._session,this._eventNumber)),this.chosenHost=="Watsonx.ai"&&(t=await X.sendMessageWatsonX("https://us-south.ml.cloud.ibm.com/ml/v1-beta/generation/text?version=2023-05-29",this.model,this.temperature,this.userPrompt,this._messages,e,this._session,this._eventNumber)),t}_handleUserRegenerationRequest(e){const t=e.detail.messageIndexInChat-1,n=this._messages[t].text;if(this.autoUpdate||this.apiURL){this.temperature&&(this.temperature+=.2),this._messages=this._messages.slice(0,t);const o=new CustomEvent("user-input",{detail:{textInputValue:n},bubbles:!0,composed:!0});this.sendInput(o)}else{e.preventDefault(),e.detail.previousUserMessage=n,e.detail.cutConversationIndex=t;const o=new CustomEvent("on-user-regeneration-request",{detail:e.detail,bubbles:!0,composed:!0});this.dispatchEvent(o)}}_handleUserUpdateRequest(e){const t=e.detail.messageIndexInChat,n=e.detail.newMessage;if(this.autoUpdate||this.apiURL){this._messages=this._messages.slice(0,t);const o=new CustomEvent("user-input",{detail:{textInputValue:n},bubbles:!0,composed:!0});this.temperature&&(this.temperature+=.2),this.sendInput(o)}else{e.preventDefault(),e.detail.cutConversationIndex=t;const o=new CustomEvent("on-user-message-update-request",{detail:e.detail,bubbles:!0,composed:!0});this.dispatchEvent(o)}}_cancelRequest(e){const t=this.lastUserMessage;this.enableRequestCancelling&&(this.requestCancelled=!0,this._queryInProgress=!1,this._messages=this._messages.slice(0,this._messages.length-1),this.setUserMessage=""+t)}sendInput(e){const t=e.detail.textInputValue;this._interruptStreaming=!this._streamResponses,this.lastUserMessage=t,this.enableRequestCancelling&&(this.requestCancelled=!1),this.temperature;const n={text:t,origin:this.userName,hasError:!1,time:this._getCurrentTime(),index:this._messages.length,userSubmitted:!0};if(this.autoUpdate)this._messages=[...this._messages,n],this._queryInProgress=!0,this.getResults(t).then(o=>{const c=Object.prototype.hasOwnProperty.call(o,"failed")&&o.failed===!0;if(this.requestCancelled)this.requestCancelled=!1;else{if(this.useWatsonAssistantProtocol){const l=this._translateWxA(o.reply);this._messages=[...this._messages,...l]}else this._messages=[...this._messages,{text:o.reply,origin:this.agentName,hasError:c,time:this._getCurrentTime(),index:this._messages.length}];this._queryInProgress=!1}this.temperature&&(this.temperature=this.originalTemperature)}).catch(()=>{this.requestCancelled?this.requestCancelled=!1:(this._messages=[...this._messages,{text:"Error reaching the model server, try again",origin:this.agentName,hasError:!0,time:this._getCurrentTime(),index:this._messages.length}],this._queryInProgress=!1),this.temperature&&(this.temperature=this.originalTemperature)});else{const o=new CustomEvent("on-submit",{detail:{message:n},bubbles:!0,composed:!0});this.dispatchEvent(o)}}_translateWxA(e){const t=[];for(const n of e.generic)switch(n.response_type){case"text":break;case"audio":t.push({type:"audio",cardElements:{link:n.source,description:n.description,title:n.title}});break;case"card":t.push({type:"audio",cardElements:{link:n.source,description:n.description,title:n.title}});break}return t}_handleFullscreenMode(e){var n;const t=(n=e.detail)==null?void 0:n.fullscreen;this.enableDocking=!1,!t&&this.defaultViewingMode==="minimized"&&(this.enableDocking=!0),this.enableFullscreen=t,this.disableOutsideControl}_handleDockingMode(e){var n;const t=(n=e.detail)==null?void 0:n.docking;this.enableFullscreen=!1,this.enableDocking=t,document.body.style.overflow=""}_handleChatClosed(){this.closed=!0,this.disableOutsideControl}_handleChatOpened(){this.closed=!1,this.disableOutsideControl,this.requestUpdate()}_handleComplexFeedback(e){this.complexFeedbackCount++}_getCurrentTime(){const e=new Date;let t=e.getHours();const n=e.getMinutes();{const o=n<10?"0"+n:n.toString();return t+":"+o}}},$.styles=ot,$);r([w()],i.prototype,"_messages");r([s({type:Boolean,attribute:"loading",reflect:!0})],i.prototype,"loading");r([s({type:Boolean,attribute:"closed"})],i.prototype,"closed");r([s({type:Boolean,attribute:"auto-update",reflect:!0})],i.prototype,"autoUpdate");r([s({type:Boolean,attribute:"enable-launcher"})],i.prototype,"enableLauncher");r([s({type:Boolean,attribute:"start-with-launcher"})],i.prototype,"startWithLauncher");r([s({type:Boolean,attribute:"disable-header-menu"})],i.prototype,"disableHeaderMenu");r([s({type:String,attribute:"input-field-placeholder"})],i.prototype,"inputFieldPlaceholder");r([s({type:Boolean,attribute:"stream-responses"})],i.prototype,"_streamResponses");r([s({type:Number,attribute:"stream-delay"})],i.prototype,"_streamDelay");r([w()],i.prototype,"_interruptStreaming");r([w()],i.prototype,"_queryInProgress");r([s({type:Object,attribute:"conversation"})],i.prototype,"conversation");r([s({type:Number,attribute:"max-character-count"})],i.prototype,"maxCharacterCount");r([s({type:String,attribute:"api-url"})],i.prototype,"apiURL");r([s({type:String,attribute:"conversation-example"})],i.prototype,"conversationExample");r([s({type:String,attribute:"feedback-url"})],i.prototype,"feedbackURL");r([s({type:String,attribute:"model"})],i.prototype,"model");r([s({type:Number,attribute:"temperature"})],i.prototype,"temperature");r([w()],i.prototype,"originalTemperature");r([s({type:String,attribute:"user-name"})],i.prototype,"userName");r([s({type:String,attribute:"agent-name"})],i.prototype,"agentName");r([s({type:String,attribute:"user-prompt"})],i.prototype,"userPrompt");r([s({type:String,attribute:"default-viewing-mode"})],i.prototype,"defaultViewingMode");r([s({type:Boolean,attribute:"disable-header-buttons"})],i.prototype,"disableHeaderButtons");r([s({type:Boolean,attribute:"enable-feedback-form"})],i.prototype,"enableFeedbackForm");r([s({type:Boolean,attribute:"enable-text-feedback-form"})],i.prototype,"enableTextFeedbackForm");r([s({type:Boolean,attribute:"disable-header-fullscreen"})],i.prototype,"disableHeaderFullscreen");r([s({type:Boolean,attribute:"disable-header-close"})],i.prototype,"disableHeaderClose");r([s({type:Boolean,attribute:"disable-header-minimize"})],i.prototype,"disableHeaderMinimize");r([s({type:Object,attribute:"headerMenuItems"})],i.prototype,"headerMenuItems");r([s({type:Object,attribute:"feedbackDefinitions"})],i.prototype,"feedbackDefinitions");r([s({type:Object,attribute:"dockBoundaries"})],i.prototype,"dockBoundaries");r([s({type:String,attribute:"sample-query"})],i.prototype,"sampleQuery");r([s({type:String,attribute:"prompt-notification-message"})],i.prototype,"promptNotificationMessage");r([s({type:String,attribute:"prompt-notification-type"})],i.prototype,"promptNotificationType");r([s({type:Boolean,attribute:"use-watson-assistant-protocol"})],i.prototype,"useWatsonAssistantProtocol");r([s({type:Boolean,attribute:"disable-outside-control"})],i.prototype,"disableOutsideControl");r([w()],i.prototype,"enableFullscreen");r([w()],i.prototype,"enableDocking");r([s({type:String,attribute:"horizontal-dock-position"})],i.prototype,"horizontalDockDirection");r([s({type:String,attribute:"vertical-dock-position"})],i.prototype,"verticalDockDirection");r([s({type:String,attribute:"ai-slug-content"})],i.prototype,"aiSlugContent");r([s({type:Object,attribute:"aiSlugObject"})],i.prototype,"aiSlugObject");r([s({type:Boolean,attribute:"enable-request-cancelling"})],i.prototype,"enableRequestCancelling");r([w()],i.prototype,"verticalDockPosition");r([w()],i.prototype,"horizontalDockPosition");r([w()],i.prototype,"_isDragging");r([s({type:Object,attribute:"customLabels"})],i.prototype,"customLabels");r([w()],i.prototype,"requestCancelled");r([w()],i.prototype,"lastUserMessage");r([w()],i.prototype,"setUserMessage");r([w()],i.prototype,"complexFeedbackCount");/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const{stablePrefix:C}=K;function st(a){const{_messages:e,_queryInProgress:t,_handleUserRegenerationRequest:n,_handleUserUpdateRequest:o,sendInput:c,userName:l,agentName:p,loading:m,closed:d,maxCharacterCount:k,disableHeaderMenu:E,disableHeaderButtons:_,disableHeaderClose:S,disableHeaderMinimize:A,disableHeaderFullscreen:M,headerMenuItems:N,feedbackDefinitions:O,enableFullscreen:z,enableDocking:h,_handleFullscreenMode:x,_handleChatClosed:I,_handleDockingMode:q,inputFieldPlaceholder:L,_streamResponses:g,_interruptStreaming:U,_endStreaming:ee,_streamDelay:ze,_handleHeaderDragStart:Ie,_handleHeaderDragCancel:Be,_handleHeaderKeyboardDragStart:Ne,promptNotificationType:Ue,promptNotificationMessage:qe,_isDragging:Te,enableFeedbackForm:$e,enableTextFeedbackForm:Le,aiSlugContent:je,aiSlugObject:Pe,enableRequestCancelling:De,_handleHeaderEscape:Fe,_handleFooterEscape:te,customLabels:W,setUserMessage:He,enableLauncher:V,_cancelRequest:Re,_handleChatOpened:Je,_handleComplexFeedback:Ge,complexFeedbackCount:We}=a;return y`<div
    aria-modal="true"
    role="dialog"
    aria-labelledby="${C}--chat-aria-title"
    aria-describedby="${C}--chat-aria-desc"
    class="${C}--chat-container ${d&&!V?C+"--chat-closed":d&&V?C+"--chat-launcher-container":""} ${h?C+"--chat-docked":""} ${Te?C+"--chat-docked-dragging":""}  ${z?C+"--chat-fullscreen":""}">
    ${V&&d?y`
          <cds-icon-button
            class="${C}--chat-launcher-button"
            size="md"
            @click="${Je}">
            <svg
              slot="icon"
              id="icon"
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 32 32">
              <path
                class="${C}--chat-launcher-container-cls-2"
                d="m15,19l-1.4141,1.4141,3.5859,3.5859H4v-13h-2v13c0,1.1046.8954,2,2,2h13.1719l-3.5859,3.5859,1.4141,1.4141,6-6-6-6Z" />
              <path class="cls-2" d="m24,18v-2h2V4h-2v-2h6v2h-2v12h2v2h-6Z" />
              <path
                class="cls-2"
                d="m21,18h2l-5.5-16-3,.0088-5.5,15.9912h2l1.3333-4h7.3335l1.3333,4Zm-8-6l3-9,3,9h-6Z" />
              <rect
                id="_Transparent_Rectangle_"
                data-name="&amp;lt;Transparent Rectangle&amp;gt;"
                class="${C}--chat-launcher-container-cls-1"
                width="32"
                height="32"
                transform="translate(32 32) rotate(180)" />
            </svg>
          </cds-icon-button>
        `:y`
          <div class="${C}--chat-content-container">
            <div class="${C}--chat-aria-container">
              <p id="${C}--chat-aria-title">AI Chat</p>
              <p id="${C}--chat-aria-desc">
                AI Chat interface window
              </p>
            </div>
            <slot name="header">
              <clabs-chat-header
                @on-chat-fullscreen-change="${x}"
                @on-chat-docking-change="${q}"
                @on-chat-closed="${I}"
                @on-header-drag-initiated="${Ie}"
                @on-header-drag-cancel="${Be}"
                @on-header-drag-keyboard-initiated="${Ne}"
                @on-header-escape="${Fe}"
                @on-footer-escape="${te}"
                header-slug-content="${je}"
                .headerSlugObject="${Pe}"
                .menuItems="${N}"
                .customLabels="${W}"
                ?docking-enabled="${h}"
                ?disable-header-menu="${E}"
                ?disable-header-close="${S}"
                ?disable-header-fullscreen="${M}"
                ?disable-header-minimize="${A}"
                ?disable-header-buttons="${_}">
              </clabs-chat-header>
            </slot>

            <slot name="messages">
              <clabs-chat-messages
                .messages="${e}"
                user-name="${l}"
                agent-name="${p}"
                ?docking-enabled="${h}"
                ?loading="${t}"
                ?stream-responses="${g}"
                stream-delay="${ze}"
                ?feedback-form-enabled="${$e}"
                .feedbackFormDefinitions="${O}"
                text-feedback-form-enabled="${Le}"
                ?user-interrupted-streaming="${U}"
                @on-user-complex-feedback-request="${Ge}"
                @on-message-regeneration="${n}"
                @on-user-message-update-request="${o}"
                .customLabels="${W}"
                @on-message-streaming-done="${ee}">
              </clabs-chat-messages>
            </slot>

            <slot name="footer">
              <clabs-chat-footer
                ?disable-input="${m}"
                @on-user-text-input="${c}"
                @on-user-stream-interrupt="${ee}"
                @on-user-request-interrupt="${Re}"
                @on-footer-escape="${te}"
                context-message="${qe}"
                context-message-type="${Ue}"
                .customLabels="${W}"
                ?fullscreen-mode="${z}"
                ?enable-cancellation="${De}"
                ?currently-streaming="${g&&!U}"
                input-placeholder="${L}"
                preset-entry="${He}"
                notification-count="${We}"
                ?query-processing="${t}"
                character-limit="${k}">
              </clabs-chat-footer>
            </slot>
          </div>
        `}
  </div>`}var it=Object.defineProperty,rt=Object.getOwnPropertyDescriptor,ct=(a,e,t,n)=>{for(var o=n>1?void 0:n?rt(e,t):e,c=a.length-1,l;c>=0;c--)(l=a[c])&&(o=(n?l(e,t,o):l(o))||o);return n&&o&&it(e,t,o),o};const{stablePrefix:lt}=K;let oe=class extends i{render(){return st(this)}};oe=ct([Ve(`${lt}-chat`)],oe);/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const we="important",dt=" !"+we,pt=Xe(class extends Ke{constructor(a){var e;if(super(a),a.type!==Qe.ATTRIBUTE||a.name!=="style"||((e=a.strings)==null?void 0:e.length)>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(a){return Object.keys(a).reduce((e,t)=>{const n=a[t];return n==null?e:e+`${t=t.includes("-")?t:t.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${n};`},"")}update(a,[e]){const{style:t}=a.element;if(this.ft===void 0)return this.ft=new Set(Object.keys(e)),this.render(e);for(const n of this.ft)e[n]==null&&(this.ft.delete(n),n.includes("-")?t.removeProperty(n):t[n]=null);for(const n in e){const o=e[n];if(o!=null){this.ft.add(n);const c=typeof o=="string"&&o.endsWith(dt);n.includes("-")||c?t.setProperty(n,c?o.slice(0,-11):o,c?we:""):t[n]=o}}return Ze}});/**
 * @license
 *
 * Copyright IBM Corp. 2020, 2022
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */var u;(function(a){a.SINGLE="single",a.INLINE="inline",a.MULTI="multi"})(u||(u={}));var ke=Ce(['@keyframes cds--hide-feedback{0%{opacity:1;visibility:inherit}to{opacity:0;visibility:hidden}}@keyframes cds--show-feedback{0%{opacity:0;visibility:hidden}to{opacity:1;visibility:inherit}}@keyframes cds--skeleton{0%{opacity:.3;transform:scaleX(0);transform-origin:left}20%{opacity:1;transform:scaleX(1);transform-origin:left}28%{transform:scaleX(1);transform-origin:right}51%{transform:scaleX(0);transform-origin:right}58%{transform:scaleX(0);transform-origin:right}82%{transform:scaleX(1);transform-origin:right}83%{transform:scaleX(1);transform-origin:left}96%{transform:scaleX(0);transform-origin:left}to{opacity:.3;transform:scaleX(0);transform-origin:left}}.cds--layout--size-xs{--cds-layout-size-height-context:var(--cds-layout-size-height-xs,1.5rem);--cds-layout-size-height:var(--cds-layout-size-height-context)}.cds--layout-constraint--size__default-xs{--cds-layout-size-height:var(--cds-layout-size-height-context,var(--cds-layout-size-height-xs,1.5rem))}.cds--layout-constraint--size__min-xs{--cds-layout-size-height-min:var(--cds-layout-size-height-xs,1.5rem)}.cds--layout-constraint--size__max-xs{--cds-layout-size-height-max:var(--cds-layout-size-height-xs,1.5rem)}.cds--layout--size-sm{--cds-layout-size-height-context:var(--cds-layout-size-height-sm,2rem);--cds-layout-size-height:var(--cds-layout-size-height-context)}.cds--layout-constraint--size__default-sm{--cds-layout-size-height:var(--cds-layout-size-height-context,var(--cds-layout-size-height-sm,2rem))}.cds--layout-constraint--size__min-sm{--cds-layout-size-height-min:var(--cds-layout-size-height-sm,2rem)}.cds--layout-constraint--size__max-sm{--cds-layout-size-height-max:var(--cds-layout-size-height-sm,2rem)}.cds--layout--size-md{--cds-layout-size-height-context:var(--cds-layout-size-height-md,2.5rem);--cds-layout-size-height:var(--cds-layout-size-height-context)}.cds--layout-constraint--size__default-md{--cds-layout-size-height:var(--cds-layout-size-height-context,var(--cds-layout-size-height-md,2.5rem))}.cds--layout-constraint--size__min-md{--cds-layout-size-height-min:var(--cds-layout-size-height-md,2.5rem)}.cds--layout-constraint--size__max-md{--cds-layout-size-height-max:var(--cds-layout-size-height-md,2.5rem)}.cds--layout--size-lg{--cds-layout-size-height-context:var(--cds-layout-size-height-lg,3rem);--cds-layout-size-height:var(--cds-layout-size-height-context)}.cds--layout-constraint--size__default-lg{--cds-layout-size-height:var(--cds-layout-size-height-context,var(--cds-layout-size-height-lg,3rem))}.cds--layout-constraint--size__min-lg{--cds-layout-size-height-min:var(--cds-layout-size-height-lg,3rem)}.cds--layout-constraint--size__max-lg{--cds-layout-size-height-max:var(--cds-layout-size-height-lg,3rem)}.cds--layout--size-xl{--cds-layout-size-height-context:var(--cds-layout-size-height-xl,4rem);--cds-layout-size-height:var(--cds-layout-size-height-context)}.cds--layout-constraint--size__default-xl{--cds-layout-size-height:var(--cds-layout-size-height-context,var(--cds-layout-size-height-xl,4rem))}.cds--layout-constraint--size__min-xl{--cds-layout-size-height-min:var(--cds-layout-size-height-xl,4rem)}.cds--layout-constraint--size__max-xl{--cds-layout-size-height-max:var(--cds-layout-size-height-xl,4rem)}.cds--layout--size-2xl{--cds-layout-size-height-context:var(--cds-layout-size-height-2xl,5rem);--cds-layout-size-height:var(--cds-layout-size-height-context)}.cds--layout-constraint--size__default-2xl{--cds-layout-size-height:var(--cds-layout-size-height-context,var(--cds-layout-size-height-2xl,5rem))}.cds--layout-constraint--size__min-2xl{--cds-layout-size-height-min:var(--cds-layout-size-height-2xl,5rem)}.cds--layout-constraint--size__max-2xl{--cds-layout-size-height-max:var(--cds-layout-size-height-2xl,5rem)}.cds--layout--density-condensed{--cds-layout-density-padding-inline-context:var(--cds-layout-density-padding-inline-condensed,0.5rem);--cds-layout-density-padding-inline:var(--cds-layout-density-padding-inline-context)}.cds--layout-constraint--density__default-condensed{--cds-layout-density-padding-inline:var(--cds-layout-density-padding-inline-context,var(--cds-layout-density-padding-inline-condensed,0.5rem))}.cds--layout-constraint--density__min-condensed{--cds-layout-density-padding-inline-min:var(--cds-layout-density-padding-inline-condensed,0.5rem)}.cds--layout-constraint--density__max-condensed{--cds-layout-density-padding-inline-max:var(--cds-layout-density-padding-inline-condensed,0.5rem)}.cds--layout--density-normal{--cds-layout-density-padding-inline-context:var(--cds-layout-density-padding-inline-normal,1rem);--cds-layout-density-padding-inline:var(--cds-layout-density-padding-inline-context)}.cds--layout-constraint--density__default-normal{--cds-layout-density-padding-inline:var(--cds-layout-density-padding-inline-context,var(--cds-layout-density-padding-inline-normal,1rem))}.cds--layout-constraint--density__min-normal{--cds-layout-density-padding-inline-min:var(--cds-layout-density-padding-inline-normal,1rem)}.cds--layout-constraint--density__max-normal{--cds-layout-density-padding-inline-max:var(--cds-layout-density-padding-inline-normal,1rem)}:root{--cds-layout-size-height-xs:1.5rem;--cds-layout-size-height-sm:2rem;--cds-layout-size-height-md:2.5rem;--cds-layout-size-height-lg:3rem;--cds-layout-size-height-xl:4rem;--cds-layout-size-height-2xl:5rem;--cds-layout-size-height-min:0px;--cds-layout-size-height-max:999999999px;--cds-layout-density-padding-inline-condensed:0.5rem;--cds-layout-density-padding-inline-normal:1rem;--cds-layout-density-padding-inline-min:0px;--cds-layout-density-padding-inline-max:999999999px}.cds--assistive-text,.cds--visually-hidden{block-size:1px;border:0;margin:-1px;overflow:hidden;padding:0;position:absolute;clip:rect(0,0,0,0);inline-size:1px;visibility:inherit;white-space:nowrap}.cds--layer-one,:root{--cds-layer:var(--cds-layer-01,#f4f4f4);--cds-layer-active:var(--cds-layer-active-01,#c6c6c6);--cds-layer-hover:var(--cds-layer-hover-01,#e8e8e8);--cds-layer-selected:var(--cds-layer-selected-01,#e0e0e0);--cds-layer-selected-hover:var(--cds-layer-selected-hover-01,#d1d1d1);--cds-layer-accent:var(--cds-layer-accent-01,#e0e0e0);--cds-layer-accent-hover:var(--cds-layer-accent-hover-01,#d1d1d1);--cds-layer-accent-active:var(--cds-layer-accent-active-01,#a8a8a8);--cds-field:var(--cds-field-01,#f4f4f4);--cds-field-hover:var(--cds-field-hover-01,#e8e8e8);--cds-border-subtle:var(--cds-border-subtle-00,#e0e0e0);--cds-border-subtle-selected:var(--cds-border-subtle-selected-01,#c6c6c6);--cds-border-strong:var(--cds-border-strong-01,#8d8d8d);--cds-border-tile:var(--cds-border-tile-01,#c6c6c6)}.cds--layer-two{--cds-layer:var(--cds-layer-02,#fff);--cds-layer-active:var(--cds-layer-active-02,#c6c6c6);--cds-layer-hover:var(--cds-layer-hover-02,#e8e8e8);--cds-layer-selected:var(--cds-layer-selected-02,#e0e0e0);--cds-layer-selected-hover:var(--cds-layer-selected-hover-02,#d1d1d1);--cds-layer-accent:var(--cds-layer-accent-02,#e0e0e0);--cds-layer-accent-hover:var(--cds-layer-accent-hover-02,#d1d1d1);--cds-layer-accent-active:var(--cds-layer-accent-active-02,#a8a8a8);--cds-field:var(--cds-field-02,#fff);--cds-field-hover:var(--cds-field-hover-02,#e8e8e8);--cds-border-subtle:var(--cds-border-subtle-01,#c6c6c6);--cds-border-subtle-selected:var(--cds-border-subtle-selected-02,#c6c6c6);--cds-border-strong:var(--cds-border-strong-02,#8d8d8d);--cds-border-tile:var(--cds-border-tile-02,#a8a8a8)}.cds--layer-three{--cds-layer:var(--cds-layer-03,#f4f4f4);--cds-layer-active:var(--cds-layer-active-03,#c6c6c6);--cds-layer-hover:var(--cds-layer-hover-03,#e8e8e8);--cds-layer-selected:var(--cds-layer-selected-03,#e0e0e0);--cds-layer-selected-hover:var(--cds-layer-selected-hover-03,#d1d1d1);--cds-layer-accent:var(--cds-layer-accent-03,#e0e0e0);--cds-layer-accent-hover:var(--cds-layer-accent-hover-03,#d1d1d1);--cds-layer-accent-active:var(--cds-layer-accent-active-03,#a8a8a8);--cds-field:var(--cds-field-03,#f4f4f4);--cds-field-hover:var(--cds-field-hover-03,#e8e8e8);--cds-border-subtle:var(--cds-border-subtle-02,#e0e0e0);--cds-border-subtle-selected:var(--cds-border-subtle-selected-03,#c6c6c6);--cds-border-strong:var(--cds-border-strong-03,#8d8d8d);--cds-border-tile:var(--cds-border-tile-03,#c6c6c6)}.cds--popover-container{display:inline-block}.cds--popover-container:not(.cds--popover--auto-align){position:relative}.cds--popover--high-contrast .cds--popover{--cds-popover-background-color:var(--cds-background-inverse,#393939);--cds-popover-text-color:var(--cds-text-inverse,#fff)}.cds--popover--drop-shadow .cds--popover>.cds--popover-content{filter:drop-shadow(0 2px 2px rgba(0,0,0,.2))}.cds--popover--caret{--cds-popover-offset:0.625rem}.cds--popover{filter:var(--cds-popover-drop-shadow,none);inset:0;pointer-events:none;position:absolute;z-index:6000}.cds--popover-content{--cds-layout-size-height-sm:2rem;--cds-layout-size-height-md:2.5rem;--cds-layout-size-height-lg:3rem;background-color:var(--cds-popover-background-color,var(--cds-layer));border:0;border-radius:var(--cds-popover-border-radius,2px);box-sizing:border-box;color:var(--cds-popover-text-color,var(--cds-text-primary,#161616));display:none;font-family:inherit;font-size:100%;inline-size:-moz-max-content;inline-size:max-content;margin:0;max-inline-size:23rem;padding:0;pointer-events:auto;position:absolute;vertical-align:baseline;z-index:6000}.cds--layout--size-sm .cds--popover-content{--cds-layout-size-height:var(--cds-layout-size-height-sm)}.cds--layout--size-md .cds--popover-content{--cds-layout-size-height:var(--cds-layout-size-height-md)}.cds--layout--size-lg .cds--popover-content{--cds-layout-size-height:var(--cds-layout-size-height-lg)}.cds--popover-content *,.cds--popover-content :after,.cds--popover-content :before{box-sizing:inherit}.cds--popover--open>.cds--popover>.cds--popover-content{display:block}.cds--popover-content:before{content:"";display:none;position:absolute}.cds--popover--open>.cds--popover>.cds--popover-content:before{display:block}.cds--popover--auto-align.cds--popover-caret,.cds--popover-caret{background-color:var(--cds-popover-background-color,var(--cds-layer));display:none;position:absolute;will-change:transform;z-index:6000}.cds--popover--auto-align.cds--popover--caret.cds--popover--open>.cds--popover>.cds--popover-content>.cds--popover-caret,.cds--popover--caret.cds--popover--open>.cds--popover>.cds--popover-caret{display:block}.cds--popover--tab-tip>.cds--popover>.cds--popover-caret{display:none}.cds--popover--bottom:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-content{inset-block-end:0;inset-inline-start:50%;transform:translate(-50%,calc(100% + var(--cds-popover-offset, 0rem)))}[dir=rtl] .cds--popover--bottom:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-content{transform:translate(50%,calc(100% + var(--cds-popover-offset, 0rem)))}.cds--popover--bottom-left:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-content,.cds--popover--bottom-start:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-content{inset-block-end:0;inset-inline-start:0;transform:translate(calc(var(--cds-popover-offset, 0rem)*-1),calc(100% + var(--cds-popover-offset, 0rem)))}[dir=rtl] .cds--popover--bottom-left:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-content,[dir=rtl] .cds--popover--bottom-start:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-content{inset-inline-end:0;inset-inline-start:auto}.cds--popover--bottom-end:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-content,.cds--popover--bottom-right:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-content{inset-block-end:0;inset-inline-end:0;transform:translate(var(--cds-popover-offset,0),calc(100% + var(--cds-popover-offset, 0rem)))}[dir=rtl] .cds--popover--bottom-end:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-content,[dir=rtl] .cds--popover--bottom-right:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-content{inset-inline-start:0}.cds--popover--bottom-end>.cds--popover>.cds--popover-content:before,.cds--popover--bottom-left>.cds--popover>.cds--popover-content:before,.cds--popover--bottom-right>.cds--popover>.cds--popover-content:before,.cds--popover--bottom-start>.cds--popover>.cds--popover-content:before,.cds--popover--bottom>.cds--popover>.cds--popover-content:before{block-size:var(--cds-popover-offset,0);inset-block-start:0;inset-inline:0;transform:translateY(-100%)}.cds--popover--bottom-end>.cds--popover>.cds--popover-caret,.cds--popover--bottom-left>.cds--popover>.cds--popover-caret,.cds--popover--bottom-right>.cds--popover>.cds--popover-caret,.cds--popover--bottom-start>.cds--popover>.cds--popover-caret,.cds--popover--bottom>.cds--popover>.cds--popover-caret{block-size:var(--cds-popover-caret-height,.375rem);clip-path:polygon(0 100%,50% 0,100% 100%);inline-size:var(--cds-popover-caret-width,.75rem);inset-block-end:0;inset-inline-start:50%;transform:translate(-50%,var(--cds-popover-offset,0))}[dir=rtl] .cds--popover--bottom-end>.cds--popover>.cds--popover-caret,[dir=rtl] .cds--popover--bottom-left>.cds--popover>.cds--popover-caret,[dir=rtl] .cds--popover--bottom-right>.cds--popover>.cds--popover-caret,[dir=rtl] .cds--popover--bottom-start>.cds--popover>.cds--popover-caret,[dir=rtl] .cds--popover--bottom>.cds--popover>.cds--popover-caret{transform:translate(50%,var(--cds-popover-offset,0))}.cds--popover--bottom-end.cds--popover--auto-align>.cds--popover>.cds--popover-content>.cds--popover-caret,.cds--popover--bottom-left.cds--popover--auto-align>.cds--popover>.cds--popover-content>.cds--popover-caret,.cds--popover--bottom-right.cds--popover--auto-align>.cds--popover>.cds--popover-content>.cds--popover-caret,.cds--popover--bottom-start.cds--popover--auto-align>.cds--popover>.cds--popover-content>.cds--popover-caret,.cds--popover--bottom.cds--popover--auto-align>.cds--popover>.cds--popover-content>.cds--popover-caret{block-size:var(--cds-popover-caret-height,.375rem);clip-path:polygon(0 100%,50% 0,100% 100%);inline-size:var(--cds-popover-caret-width,.75rem)}.cds--popover--top:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-content{inset-block-start:0;inset-inline-start:50%;transform:translate(-50%,calc(-100% - var(--cds-popover-offset, 0rem)))}[dir=rtl] .cds--popover--top:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-content{transform:translate(50%,calc(-100% - var(--cds-popover-offset, 0rem)))}.cds--popover--top-left:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-content,.cds--popover--top-start:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-content{inset-block-start:0;inset-inline-start:0;transform:translate(calc(var(--cds-popover-offset, 0rem)*-1),calc(-100% - var(--cds-popover-offset, 0rem)))}[dir=rtl] .cds--popover--top-left:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-content,[dir=rtl] .cds--popover--top-start:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-content{inset-inline-end:0;inset-inline-start:auto}.cds--popover--top-end:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-content,.cds--popover--top-right:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-content{inset-block-start:0;inset-inline-end:0;transform:translate(var(--cds-popover-offset,0),calc(-100% - var(--cds-popover-offset, 0rem)))}[dir=rtl] .cds--popover--top-end:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-content,[dir=rtl] .cds--popover--top-right:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-content{inset-inline-start:0}.cds--popover--top-end>.cds--popover>.cds--popover-content:before,.cds--popover--top-left>.cds--popover>.cds--popover-content:before,.cds--popover--top-right>.cds--popover>.cds--popover-content:before,.cds--popover--top-start>.cds--popover>.cds--popover-content:before,.cds--popover--top>.cds--popover>.cds--popover-content:before{block-size:var(--cds-popover-offset,0);inset-block-end:0;inset-inline:0;transform:translateY(100%)}.cds--popover--top-end>.cds--popover>.cds--popover-caret,.cds--popover--top-left>.cds--popover>.cds--popover-caret,.cds--popover--top-right>.cds--popover>.cds--popover-caret,.cds--popover--top-start>.cds--popover>.cds--popover-caret,.cds--popover--top>.cds--popover>.cds--popover-caret{block-size:var(--cds-popover-caret-height,.375rem);clip-path:polygon(0 0,50% 100%,100% 0);inline-size:var(--cds-popover-caret-width,.75rem);inset-block-start:0;inset-inline-start:50%;transform:translate(-50%,calc(var(--cds-popover-offset, 0rem)*-1))}[dir=rtl] .cds--popover--top-end:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-caret,[dir=rtl] .cds--popover--top-left:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-caret,[dir=rtl] .cds--popover--top-right:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-caret,[dir=rtl] .cds--popover--top-start:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-caret,[dir=rtl] .cds--popover--top:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-caret{transform:translate(50%,calc(var(--cds-popover-offset, 0rem)*-1))}.cds--popover--top-end.cds--popover--auto-align>.cds--popover>.cds--popover-content>.cds--popover-caret,.cds--popover--top-left.cds--popover--auto-align>.cds--popover>.cds--popover-content>.cds--popover-caret,.cds--popover--top-right.cds--popover--auto-align>.cds--popover>.cds--popover-content>.cds--popover-caret,.cds--popover--top-start.cds--popover--auto-align>.cds--popover>.cds--popover-content>.cds--popover-caret,.cds--popover--top.cds--popover--auto-align>.cds--popover>.cds--popover-content>.cds--popover-caret{block-size:var(--cds-popover-caret-height,.375rem);clip-path:polygon(0 0,50% 100%,100% 0);inline-size:var(--cds-popover-caret-width,.75rem)}.cds--popover--right:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-content{inset-block-start:50%;inset-inline-start:100%;transform:translate(var(--cds-popover-offset,0),-50%)}.cds--popover--right-start:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-content,.cds--popover--right-top:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-content{inset-block-start:50%;inset-inline-start:100%;transform:translate(var(--cds-popover-offset,0),calc(var(--cds-popover-offset, 0rem)*.5*-1 - 16px))}.cds--popover--right-bottom:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-content,.cds--popover--right-end:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-content{inset-block-end:50%;inset-inline-start:100%;transform:translate(var(--cds-popover-offset,0),calc(var(--cds-popover-offset, 0rem)*.5 + 16px))}[dir=rtl] .cds--popover--right-bottom:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-content,[dir=rtl] .cds--popover--right-end:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-content,[dir=rtl] .cds--popover--right-start:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-content,[dir=rtl] .cds--popover--right-top:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-content,[dir=rtl] .cds--popover--right:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-content{inset-inline-end:100%;inset-inline-start:auto}.cds--popover--right-bottom>.cds--popover>.cds--popover-content:before,.cds--popover--right-end>.cds--popover>.cds--popover-content:before,.cds--popover--right-start>.cds--popover>.cds--popover-content:before,.cds--popover--right-top>.cds--popover>.cds--popover-content:before,.cds--popover--right>.cds--popover>.cds--popover-content:before{inline-size:var(--cds-popover-offset,0);inset-block:0;inset-inline-start:0;transform:translateX(-100%)}.cds--popover--right-bottom:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-caret,.cds--popover--right-end:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-caret,.cds--popover--right-start:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-caret,.cds--popover--right-top:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-caret,.cds--popover--right:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-caret{block-size:var(--cds-popover-caret-width,.75rem);clip-path:polygon(0 50%,100% 0,100% 100%);inline-size:var(--cds-popover-caret-height,.375rem);inset-block-start:50%;inset-inline-start:100%;transform:translate(calc(var(--cds-popover-offset, 0rem) - 100%),-50%)}[dir=rtl] .cds--popover--right-bottom:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-caret,[dir=rtl] .cds--popover--right-end:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-caret,[dir=rtl] .cds--popover--right-start:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-caret,[dir=rtl] .cds--popover--right-top:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-caret,[dir=rtl] .cds--popover--right:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-caret{inset-inline-end:100%;inset-inline-start:auto}.cds--popover--right-bottom.cds--popover--auto-align>.cds--popover>.cds--popover-content>.cds--popover-caret,.cds--popover--right-end.cds--popover--auto-align>.cds--popover>.cds--popover-content>.cds--popover-caret,.cds--popover--right-start.cds--popover--auto-align>.cds--popover>.cds--popover-content>.cds--popover-caret,.cds--popover--right-top.cds--popover--auto-align>.cds--popover>.cds--popover-content>.cds--popover-caret,.cds--popover--right.cds--popover--auto-align>.cds--popover>.cds--popover-content>.cds--popover-caret{block-size:var(--cds-popover-caret-width,.75rem);clip-path:polygon(0 50%,100% 0,100% 100%);inline-size:var(--cds-popover-caret-height,.375rem)}.cds--popover--left:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-content{inset-block-start:50%;inset-inline-end:100%;transform:translate(calc(var(--cds-popover-offset, 0rem)*-1 + .1px),-50%)}.cds--popover--left-start:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-content,.cds--popover--left-top:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-content{inset-block-start:50%;inset-inline-end:100%;transform:translate(calc(var(--cds-popover-offset, 0rem)*-1),calc(var(--cds-popover-offset, 0rem)*-.5 - 16px))}.cds--popover--left-bottom:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-content,.cds--popover--left-end:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-content{inset-block-end:50%;inset-inline-end:100%;transform:translate(calc(var(--cds-popover-offset, 0rem)*-1),calc(var(--cds-popover-offset, 0rem)*.5 + 16px))}[dir=rtl] .cds--popover--left-bottom:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-content,[dir=rtl] .cds--popover--left-end:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-content,[dir=rtl] .cds--popover--left-start:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-content,[dir=rtl] .cds--popover--left-top:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-content,[dir=rtl] .cds--popover--left:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-content{inset-inline-end:auto;inset-inline-start:100%}.cds--popover--left-bottom>.cds--popover>.cds--popover-content:before,.cds--popover--left-end>.cds--popover>.cds--popover-content:before,.cds--popover--left-start>.cds--popover>.cds--popover-content:before,.cds--popover--left-top>.cds--popover>.cds--popover-content:before,.cds--popover--left>.cds--popover>.cds--popover-content:before{inline-size:var(--cds-popover-offset,0);inset-block:0;inset-inline-end:0;transform:translateX(100%)}.cds--popover--left-bottom:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-caret,.cds--popover--left-end:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-caret,.cds--popover--left-start:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-caret,.cds--popover--left-top:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-caret,.cds--popover--left:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-caret{block-size:var(--cds-popover-caret-width,.75rem);clip-path:polygon(0 0,100% 50%,0 100%);inline-size:var(--cds-popover-caret-height,.375rem);inset-block-start:50%;inset-inline-end:100%;transform:translate(calc(var(--cds-popover-offset, 0rem)*-1 + 100%),-50%)}[dir=rtl] .cds--popover--left-bottom:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-caret,[dir=rtl] .cds--popover--left-end:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-caret,[dir=rtl] .cds--popover--left-start:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-caret,[dir=rtl] .cds--popover--left-top:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-caret,[dir=rtl] .cds--popover--left:not(.cds--popover--auto-align)>.cds--popover>.cds--popover-caret{inset-inline-end:auto;inset-inline-start:100%}.cds--popover--left-bottom.cds--popover--auto-align>.cds--popover>.cds--popover-content>.cds--popover-caret,.cds--popover--left-end.cds--popover--auto-align>.cds--popover>.cds--popover-content>.cds--popover-caret,.cds--popover--left-start.cds--popover--auto-align>.cds--popover>.cds--popover-content>.cds--popover-caret,.cds--popover--left-top.cds--popover--auto-align>.cds--popover>.cds--popover-content>.cds--popover-caret,.cds--popover--left.cds--popover--auto-align>.cds--popover>.cds--popover-content>.cds--popover-caret{block-size:var(--cds-popover-caret-width,.75rem);clip-path:polygon(0 0,100% 50%,0 100%);inline-size:var(--cds-popover-caret-height,.375rem)}.cds--popover--tab-tip>.cds--popover>.cds--popover-content{border-radius:0}.cds--popover--tab-tip .cds--popover{will-change:filter}.cds--popover--tab-tip__button{align-items:center;-webkit-appearance:none;-moz-appearance:none;appearance:none;background:none;block-size:2rem;border:0;box-sizing:border-box;cursor:pointer;display:inline-block;display:inline-flex;font-family:inherit;font-size:100%;inline-size:100%;inline-size:2rem;justify-content:center;margin:0;padding:0;position:relative;text-align:start;vertical-align:baseline}.cds--popover--tab-tip__button *,.cds--popover--tab-tip__button :after,.cds--popover--tab-tip__button :before{box-sizing:inherit}.cds--popover--tab-tip__button::-moz-focus-inner{border:0}.cds--popover--tab-tip__button:focus{outline:2px solid var(--cds-focus,#0f62fe);outline-offset:-2px}@media screen and (prefers-contrast){.cds--popover--tab-tip__button:focus{outline-style:dotted}}.cds--popover--tab-tip__button:hover{background-color:var(--cds-layer-hover)}.cds--popover--tab-tip.cds--popover--open .cds--popover--tab-tip__button{background:var(--cds-layer);box-shadow:0 2px 2px rgba(0,0,0,.2)}.cds--popover--tab-tip.cds--popover--open .cds--popover--tab-tip__button:not(:focus):after{background:var(--cds-layer);block-size:2px;content:"";inline-size:100%;inset-block-end:0;position:absolute;z-index:6001}.cds--popover--tab-tip__button svg{fill:var(--cds-icon-primary,#161616)}.cds--tooltip{--cds-popover-offset:12px}.cds--tooltip-content{color:var(--cds-text-inverse,#fff);font-size:var(--cds-body-01-font-size,.875rem);font-weight:var(--cds-body-01-font-weight,400);letter-spacing:var(--cds-body-01-letter-spacing,.16px);line-height:var(--cds-body-01-line-height,1.42857);max-inline-size:18rem;padding:var(--cds-tooltip-padding-block,1rem) var(--cds-tooltip-padding-inline,1rem)}.cds--icon-tooltip{--cds-tooltip-padding-block:0.125rem;--cds-popover-caret-width:0.5rem;--cds-popover-caret-height:0.25rem;--cds-popover-offset:0.5rem}.cds--icon-tooltip .cds--tooltip-content{font-size:var(--cds-body-compact-01-font-size,.875rem);font-weight:var(--cds-body-compact-01-font-weight,400);letter-spacing:var(--cds-body-compact-01-letter-spacing,.16px);line-height:var(--cds-body-compact-01-line-height,1.28572)}.cds--definition-term{-webkit-appearance:none;-moz-appearance:none;appearance:none;background:none;border:0;border-block-end:1px dotted var(--cds-border-strong);border-radius:0;box-sizing:border-box;color:var(--cds-text-primary,#161616);cursor:pointer;display:inline-block;font-family:inherit;font-size:100%;inline-size:100%;margin:0;padding:0;text-align:start;vertical-align:baseline}.cds--definition-term *,.cds--definition-term :after,.cds--definition-term :before{box-sizing:inherit}.cds--definition-term::-moz-focus-inner{border:0}.cds--definition-term:focus{border-block-end-color:var(--cds-border-interactive,#0f62fe);outline:1px solid var(--cds-focus,#0f62fe)}@media screen and (prefers-contrast){.cds--definition-term:focus{outline-style:dotted}}.cds--definition-term:hover{border-block-end-color:var(--cds-border-interactive,#0f62fe)}.cds--definition-tooltip{font-size:var(--cds-body-01-font-size,.875rem);font-weight:var(--cds-body-01-font-weight,400);letter-spacing:var(--cds-body-01-letter-spacing,.16px);line-height:var(--cds-body-01-line-height,1.42857);max-inline-size:11rem;padding:.5rem 1rem}.cds--btn{--cds-layout-size-height-local:clamp(max(var(--cds-layout-size-height-min),var(--cds-layout-size-height-sm)),var(--cds-layout-size-height,var(--cds-layout-size-height-lg)),min(var(--cds-layout-size-height-max),var(--cds-layout-size-height-2xl)));--cds-layout-density-padding-inline-local:clamp(var(--cds-layout-density-padding-inline-min),var(--cds-layout-density-padding-inline,var(--cds-layout-density-padding-inline-normal)),var(--cds-layout-density-padding-inline-max));--temp-1lh:(var(--cds-body-compact-01-line-height,1.28572) * 1em);--temp-expressive-1lh:(var(--cds-body-compact-02-line-height,1.375) * 1em);--temp-padding-block-max:calc((var(--cds-layout-size-height-lg) - var(--temp-1lh))/2 - 0.0625rem);border:0;border-radius:0;box-sizing:border-box;cursor:pointer;display:inline-flex;flex-shrink:0;font-family:inherit;font-size:100%;font-size:var(--cds-body-compact-01-font-size,.875rem);font-weight:var(--cds-body-compact-01-font-weight,400);inline-size:-moz-max-content;inline-size:max-content;justify-content:space-between;letter-spacing:var(--cds-body-compact-01-letter-spacing,.16px);line-height:var(--cds-body-compact-01-line-height,1.28572);margin:0;max-inline-size:20rem;min-block-size:var(--cds-layout-size-height-local);outline:none;padding:0;padding-block:min((var(--cds-layout-size-height-local) - var(--temp-1lh))/2 - .0625rem,var(--temp-padding-block-max));padding-inline:calc(var(--cds-layout-density-padding-inline-local) - .0625rem) calc(var(--cds-layout-density-padding-inline-local)*3 + .9375rem);position:relative;text-align:start;text-decoration:none;transition:background 70ms cubic-bezier(0,0,.38,.9),box-shadow 70ms cubic-bezier(0,0,.38,.9),border-color 70ms cubic-bezier(0,0,.38,.9),outline 70ms cubic-bezier(0,0,.38,.9);vertical-align:baseline;vertical-align:top}.cds--btn *,.cds--btn :after,.cds--btn :before{box-sizing:inherit}.cds--btn.cds--btn--disabled,.cds--btn.cds--btn--disabled:focus,.cds--btn.cds--btn--disabled:hover,.cds--btn:disabled,.cds--btn:focus:disabled,.cds--btn:hover:disabled{background:var(--cds-button-disabled,#c6c6c6);border-color:var(--cds-button-disabled,#c6c6c6);box-shadow:none;color:var(--cds-text-on-color-disabled,#8d8d8d);cursor:not-allowed}.cds--btn .cds--btn__icon{block-size:1rem;flex-shrink:0;inline-size:1rem;inset-block-start:min((var(--cds-layout-size-height-local) - 1rem)/2 - .0625rem,var(--temp-padding-block-max));inset-inline-end:var(--cds-layout-density-padding-inline-local);margin-block-start:.0625rem;position:absolute}.cds--btn::-moz-focus-inner{border:0;padding:0}.cds--btn--primary{background-color:var(--cds-button-primary,#0f62fe);border:1px solid transparent;color:var(--cds-text-on-color,#fff)}.cds--btn--primary:hover{background-color:var(--cds-button-primary-hover,#0050e6)}.cds--btn--primary:focus{border-color:var(--cds-button-focus-color,var(--cds-focus,#0f62fe));box-shadow:inset 0 0 0 1px var(--cds-button-focus-color,var(--cds-focus,#0f62fe)),inset 0 0 0 2px var(--cds-background,#fff)}.cds--btn--primary:active{background-color:var(--cds-button-primary-active,#002d9c)}.cds--btn--primary .cds--btn__icon,.cds--btn--primary .cds--btn__icon path:not([data-icon-path]):not([fill=none]){fill:currentColor}.cds--btn--primary:hover,.cds--btn--secondary{color:var(--cds-text-on-color,#fff)}.cds--btn--secondary{background-color:var(--cds-button-secondary,#393939);border:1px solid transparent}.cds--btn--secondary:hover{background-color:var(--cds-button-secondary-hover,#474747)}.cds--btn--secondary:focus{border-color:var(--cds-button-focus-color,var(--cds-focus,#0f62fe));box-shadow:inset 0 0 0 1px var(--cds-button-focus-color,var(--cds-focus,#0f62fe)),inset 0 0 0 2px var(--cds-background,#fff)}.cds--btn--secondary:active{background-color:var(--cds-button-secondary-active,#6f6f6f)}.cds--btn--secondary .cds--btn__icon,.cds--btn--secondary .cds--btn__icon path:not([data-icon-path]):not([fill=none]){fill:currentColor}.cds--btn--secondary:focus,.cds--btn--secondary:hover{color:var(--cds-text-on-color,#fff)}.cds--btn--tertiary{background-color:transparent;border-color:var(--cds-button-tertiary,#0f62fe);border-style:solid;border-width:1px;color:var(--cds-button-tertiary,#0f62fe)}.cds--btn--tertiary:hover{background-color:var(--cds-button-tertiary-hover,#0050e6)}.cds--btn--tertiary:focus{border-color:var(--cds-button-focus-color,var(--cds-focus,#0f62fe));box-shadow:inset 0 0 0 1px var(--cds-button-focus-color,var(--cds-focus,#0f62fe)),inset 0 0 0 2px var(--cds-background,#fff)}.cds--btn--tertiary .cds--btn__icon,.cds--btn--tertiary .cds--btn__icon path:not([data-icon-path]):not([fill=none]){fill:currentColor}.cds--btn--tertiary:focus,.cds--btn--tertiary:hover{color:var(--cds-text-inverse,#fff)}.cds--btn--tertiary:focus{background-color:var(--cds-button-tertiary,#0f62fe)}.cds--btn--tertiary:active{background-color:var(--cds-button-tertiary-active,#002d9c);border-color:transparent;color:var(--cds-text-inverse,#fff)}.cds--btn--tertiary.cds--btn--disabled,.cds--btn--tertiary.cds--btn--disabled:focus,.cds--btn--tertiary.cds--btn--disabled:hover,.cds--btn--tertiary:disabled,.cds--btn--tertiary:focus:disabled,.cds--btn--tertiary:hover:disabled{background:transparent;color:var(--cds-text-on-color-disabled,#8d8d8d);outline:none}.cds--btn--ghost{background-color:transparent;border:1px solid transparent;color:var(--cds-link-primary,#0f62fe);padding-inline-end:calc(var(--cds-layout-density-padding-inline-local) - .0625rem)}.cds--btn--ghost:hover{background-color:var(--cds-background-hover,hsla(0,0%,55%,.12))}.cds--btn--ghost:focus{border-color:var(--cds-button-focus-color,var(--cds-focus,#0f62fe));box-shadow:inset 0 0 0 1px var(--cds-button-focus-color,var(--cds-focus,#0f62fe)),inset 0 0 0 2px var(--cds-background,#fff)}.cds--btn--ghost .cds--btn__icon,.cds--btn--ghost .cds--btn__icon path:not([data-icon-path]):not([fill=none]){fill:currentColor}.cds--btn--ghost .cds--btn__icon{align-self:center;margin-inline-start:.5rem;position:static}.cds--btn--ghost:active,.cds--btn--ghost:hover{color:var(--cds-link-primary-hover,#0043ce)}.cds--btn--ghost:active{background-color:var(--cds-background-active,hsla(0,0%,55%,.5))}.cds--btn--ghost.cds--btn--disabled,.cds--btn--ghost.cds--btn--disabled:focus,.cds--btn--ghost.cds--btn--disabled:hover,.cds--btn--ghost:disabled,.cds--btn--ghost:focus:disabled,.cds--btn--ghost:hover:disabled{background:transparent;border-color:transparent;color:var(--cds-text-on-color-disabled,#8d8d8d);outline:none}.cds--btn--ghost:not([disabled]) svg{fill:var(--cds-icon-primary,#161616)}.cds--btn--icon-only{block-size:var(--cds-layout-size-height-local);inline-size:var(--cds-layout-size-height-local);justify-content:center;padding:0;padding-block-start:min((var(--cds-layout-size-height-local) - 1rem)/2 - .0625rem,var(--temp-padding-block-max))}.cds--btn--icon-only>:first-child{min-inline-size:1rem}.cds--btn--icon-only .cds--btn__icon{position:static}.cds--btn--icon-only.cds--btn--danger--ghost .cds--btn__icon,.cds--btn--icon-only.cds--btn--ghost .cds--btn__icon{margin:0}.cds--btn--icon-only.cds--btn--danger--ghost{padding-inline-end:calc(var(--cds-layout-density-padding-inline-local) - 1rem)}.cds--btn--md:not(.cds--btn--icon-only) .cds--btn__icon,.cds--btn--sm:not(.cds--btn--icon-only) .cds--btn__icon{margin-block-start:0}.cds--btn--icon-only.cds--btn--selected{background:var(--cds-background-selected,hsla(0,0%,55%,.2))}.cds--btn path[data-icon-path=inner-path]{fill:none}.cds--btn--ghost.cds--btn--icon-only .cds--btn__icon,.cds--btn--ghost.cds--btn--icon-only .cds--btn__icon path:not([data-icon-path]):not([fill=none]){fill:var(--cds-icon-primary,#161616)}.cds--btn--ghost.cds--btn--icon-only[disabled] .cds--btn__icon,.cds--btn--ghost.cds--btn--icon-only[disabled] .cds--btn__icon path:not([data-icon-path]):not([fill=none]),.cds--btn.cds--btn--icon-only.cds--btn--ghost[disabled]:hover .cds--btn__icon{fill:var(--cds-icon-on-color-disabled,#8d8d8d)}.cds--btn--ghost.cds--btn--icon-only[disabled],.cds--icon-tooltip--disabled .cds--tooltip-trigger__wrapper{cursor:not-allowed}.cds--icon-tooltip--disabled .cds--btn--icon-only[disabled]{pointer-events:none}.cds--btn--danger{background-color:var(--cds-button-danger-primary,#da1e28);border:1px solid transparent;color:var(--cds-text-on-color,#fff)}.cds--btn--danger:hover{background-color:var(--cds-button-danger-hover,#b81921)}.cds--btn--danger:focus{border-color:var(--cds-button-focus-color,var(--cds-focus,#0f62fe));box-shadow:inset 0 0 0 1px var(--cds-button-focus-color,var(--cds-focus,#0f62fe)),inset 0 0 0 2px var(--cds-background,#fff)}.cds--btn--danger:active{background-color:var(--cds-button-danger-active,#750e13)}.cds--btn--danger .cds--btn__icon,.cds--btn--danger .cds--btn__icon path:not([data-icon-path]):not([fill=none]){fill:currentColor}.cds--btn--danger:hover{color:var(--cds-text-on-color,#fff)}.cds--btn--danger--tertiary{background-color:transparent;border-color:var(--cds-button-danger-secondary,#da1e28);border-style:solid;border-width:1px;color:var(--cds-button-danger-secondary,#da1e28)}.cds--btn--danger--tertiary:hover{background-color:var(--cds-button-danger-hover,#b81921)}.cds--btn--danger--tertiary:focus{border-color:var(--cds-button-focus-color,var(--cds-focus,#0f62fe));box-shadow:inset 0 0 0 1px var(--cds-button-focus-color,var(--cds-focus,#0f62fe)),inset 0 0 0 2px var(--cds-background,#fff)}.cds--btn--danger--tertiary .cds--btn__icon,.cds--btn--danger--tertiary .cds--btn__icon path:not([data-icon-path]):not([fill=none]){fill:currentColor}.cds--btn--danger--tertiary:hover{border-color:var(--cds-button-danger-hover,#b81921);color:var(--cds-text-on-color,#fff)}.cds--btn--danger--tertiary:focus{background-color:var(--cds-button-danger-primary,#da1e28);color:var(--cds-text-on-color,#fff)}.cds--btn--danger--tertiary:active{background-color:var(--cds-button-danger-active,#750e13);border-color:var(--cds-button-danger-active,#750e13);color:var(--cds-text-on-color,#fff)}.cds--btn--danger--tertiary.cds--btn--disabled,.cds--btn--danger--tertiary.cds--btn--disabled:focus,.cds--btn--danger--tertiary.cds--btn--disabled:hover,.cds--btn--danger--tertiary:disabled,.cds--btn--danger--tertiary:focus:disabled,.cds--btn--danger--tertiary:hover:disabled{background:transparent;color:var(--cds-text-on-color-disabled,#8d8d8d);outline:none}.cds--btn--danger--ghost{background-color:transparent;border:1px solid transparent;color:var(--cds-button-danger-secondary,#da1e28);padding-inline-end:calc(var(--cds-layout-density-padding-inline-local) - .0625rem)}.cds--btn--danger--ghost:hover{background-color:var(--cds-button-danger-hover,#b81921)}.cds--btn--danger--ghost:focus{border-color:var(--cds-button-focus-color,var(--cds-focus,#0f62fe));box-shadow:inset 0 0 0 1px var(--cds-button-focus-color,var(--cds-focus,#0f62fe)),inset 0 0 0 2px var(--cds-background,#fff)}.cds--btn--danger--ghost:active{background-color:var(--cds-button-danger-active,#750e13)}.cds--btn--danger--ghost .cds--btn__icon,.cds--btn--danger--ghost .cds--btn__icon path:not([data-icon-path]):not([fill=none]){fill:currentColor}.cds--btn--danger--ghost .cds--btn__icon{margin-inline-start:.5rem;position:static}.cds--btn--danger--ghost:active,.cds--btn--danger--ghost:hover{color:var(--cds-text-on-color,#fff)}.cds--btn--danger--ghost.cds--btn--disabled,.cds--btn--danger--ghost.cds--btn--disabled:focus,.cds--btn--danger--ghost.cds--btn--disabled:hover,.cds--btn--danger--ghost:disabled,.cds--btn--danger--ghost:focus:disabled,.cds--btn--danger--ghost:hover:disabled{background:transparent;border-color:transparent;color:var(--cds-text-disabled,hsla(0,0%,9%,.25));outline:none}.cds--btn--expressive{font-size:var(--cds-body-compact-02-font-size,1rem);font-weight:var(--cds-body-compact-02-font-weight,400);letter-spacing:var(--cds-body-compact-02-letter-spacing,0);line-height:var(--cds-body-compact-02-line-height,1.375);padding-block:min((var(--cds-layout-size-height-local) - var(--temp-expressive-1lh))/2 - .0625rem,var(--temp-padding-block-max))}.cds--btn--icon-only.cds--btn--expressive{padding:12px 13px}.cds--btn.cds--btn--expressive .cds--btn__icon{block-size:1.25rem;inline-size:1.25rem}.cds--btn-set .cds--btn.cds--btn--expressive{max-inline-size:20rem}.cds--btn.cds--skeleton{background:var(--cds-skeleton-background,#e8e8e8);border:none;box-shadow:none;inline-size:9.375rem;padding:0;pointer-events:none;position:relative}.cds--btn.cds--skeleton:active,.cds--btn.cds--skeleton:focus,.cds--btn.cds--skeleton:hover{border:none;cursor:default;outline:none}.cds--btn.cds--skeleton:before{animation:cds--skeleton 3s ease-in-out infinite;background:var(--cds-skeleton-element,#c6c6c6);block-size:100%;content:"";inline-size:100%;inset-inline-start:0;position:absolute;will-change:transform-origin,transform,opacity}@media (prefers-reduced-motion:reduce){.cds--btn.cds--skeleton:before{animation:none}}.cds--btn-set{display:flex}.cds--btn-set--stacked{flex-direction:column}.cds--btn-set .cds--btn{inline-size:100%;max-inline-size:12.25rem}.cds--btn-set .cds--btn:not(:focus){box-shadow:-.0625rem 0 0 0 var(--cds-button-separator,#e0e0e0)}.cds--btn-set .cds--btn:first-of-type:not(:focus),.cds--btn-set .cds--btn:focus+.cds--btn{box-shadow:inherit}.cds--btn-set--stacked .cds--btn:not(:focus){box-shadow:0 -.0625rem 0 0 var(--cds-button-separator,#e0e0e0)}.cds--btn-set--stacked .cds--btn:first-of-type:not(:focus){box-shadow:inherit}.cds--btn-set .cds--btn.cds--btn--disabled{box-shadow:-.0625rem 0 0 0 var(--cds-icon-on-color-disabled,#8d8d8d)}.cds--btn-set .cds--btn.cds--btn--disabled:first-of-type{box-shadow:none}.cds--btn-set--stacked .cds--btn.cds--btn--disabled{box-shadow:0 -.0625rem 0 0 var(--cds-layer-selected-disabled,#8d8d8d)}.cds--btn-set--stacked .cds--btn.cds--btn--disabled:first-of-type{box-shadow:none}.cds--btn-set .cds--btn.cds--btn--loading{background-color:transparent;border-color:transparent;box-shadow:none}@media (forced-colors:active),screen and (-ms-high-contrast:active){.cds--btn:focus{color:Highlight;outline:1px solid Highlight}.cds--btn--ghost.cds--btn--icon-only .cds--btn__icon,.cds--btn--ghost.cds--btn--icon-only .cds--btn__icon path:not([data-icon-path]):not([fill=none]){fill:ButtonText}}[dir=rtl] .cds--btn-set .cds--btn:not(:focus){box-shadow:.0625rem 0 0 0 var(--cds-button-separator,#e0e0e0)}.cds--copy-btn{position:relative}.cds--copy-btn:hover{background-color:var(--cds-layer-hover)}.cds--copy-btn:active{background-color:var(--cds-layer-active)}.cds--copy-btn:before{block-size:0;border-style:solid;content:"";display:none;inline-size:0;position:absolute;z-index:6000}.cds--copy-btn .cds--copy-btn__feedback{background-color:var(--cds-background-inverse,#393939);block-size:auto;border-radius:.125rem;box-shadow:0 2px 6px var(--cds-shadow,rgba(0,0,0,.3));box-sizing:content-box;color:var(--cds-text-inverse,#fff);display:none;font-size:var(--cds-body-compact-01-font-size,.875rem);font-weight:400;font-weight:var(--cds-body-compact-01-font-weight,400);inline-size:-moz-max-content;inline-size:max-content;letter-spacing:var(--cds-body-compact-01-letter-spacing,.16px);line-height:var(--cds-body-compact-01-line-height,1.28572);margin:auto;max-inline-size:13rem;min-inline-size:1.5rem;overflow:visible;padding:.1875rem 1rem;text-align:start;transform:translateX(-50%);z-index:6000;clip:auto}@media (-ms-high-contrast:active),(-ms-high-contrast:none){.cds--copy-btn .cds--copy-btn__feedback{inline-size:auto}}@supports (-ms-accelerator:true){.cds--copy-btn .cds--copy-btn__feedback{inline-size:auto}}@supports (-ms-ime-align:auto){.cds--copy-btn .cds--copy-btn__feedback{inline-size:auto}}@media screen and (-ms-high-contrast:active),screen and (prefers-contrast){.cds--copy-btn .cds--copy-btn__feedback{border:1px solid transparent}}.cds--copy-btn.cds--copy-btn--animating .cds--copy-btn__feedback,.cds--copy-btn.cds--copy-btn--animating:before{display:block}.cds--copy-btn.cds--copy-btn--animating:before{border:none}.cds--copy-btn.cds--copy-btn--animating.cds--copy-btn--fade-out .cds--copy-btn__feedback,.cds--copy-btn.cds--copy-btn--animating.cds--copy-btn--fade-out:before{animation:cds--hide-feedback .11s cubic-bezier(.2,0,.38,.9)}.cds--copy-btn.cds--copy-btn--animating.cds--copy-btn--fade-in .cds--copy-btn__feedback,.cds--copy-btn.cds--copy-btn--animating.cds--copy-btn--fade-in:before{animation:cds--show-feedback .11s cubic-bezier(.2,0,.38,.9)}.cds--copy-btn svg{fill:var(--cds-icon-primary,#161616)}.cds--copy{font-size:0}.cds--snippet html,:host(cds-code-snippet) html,:host(cds-code-snippet-skeleton) html{font-size:100%}.cds--snippet body,:host(cds-code-snippet) body,:host(cds-code-snippet-skeleton) body{font-family:IBM Plex Sans,system-ui,-apple-system,BlinkMacSystemFont,\\.SFNSText-Regular,sans-serif;font-weight:400;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}.cds--snippet code,:host(cds-code-snippet) code,:host(cds-code-snippet-skeleton) code{font-family:IBM Plex Mono,system-ui,-apple-system,BlinkMacSystemFont,\\.SFNSText-Regular,monospace}.cds--snippet strong,:host(cds-code-snippet) strong,:host(cds-code-snippet-skeleton) strong{font-weight:600}.cds--snippet--disabled,.cds--snippet--disabled .cds--btn.cds--snippet-btn--expand,:host(cds-code-snippet[disabled]),:host(cds-code-snippet[disabled]) .cds--btn.cds--snippet-btn--expand{background-color:var(--cds-layer);color:var(--cds-text-disabled,hsla(0,0%,9%,.25))}.cds--snippet--disabled .cds--copy-btn,.cds--snippet--disabled .cds--copy-btn:hover,.cds--snippet--disabled .cds--snippet-btn--expand:hover,:host(cds-code-snippet[disabled]) .cds--copy-btn,:host(cds-code-snippet[disabled]) .cds--snippet-btn--expand:hover{background-color:var(--cds-layer);color:var(--cds-text-disabled,hsla(0,0%,9%,.25));cursor:not-allowed}.cds--snippet--disabled .cds--snippet-btn--expand .cds--icon-chevron--down,.cds--snippet--disabled .cds--snippet__icon,:host(cds-code-snippet[disabled]) .cds--snippet-btn--expand .cds--icon-chevron--down,:host(cds-code-snippet[disabled]) .cds--snippet__icon{fill:var(--cds-icon-disabled,hsla(0,0%,9%,.25))}.cds--snippet code,:host(cds-code-snippet) code,:host(cds-code-snippet-skeleton) code{font-family:var(--cds-code-01-font-family,"IBM Plex Mono",system-ui,-apple-system,BlinkMacSystemFont,".SFNSText-Regular",monospace);font-size:var(--cds-code-01-font-size,.75rem);font-weight:var(--cds-code-01-font-weight,400);letter-spacing:var(--cds-code-01-letter-spacing,.32px);line-height:var(--cds-code-01-line-height,1.33333)}.cds--snippet--inline{background-color:var(--cds-layer);border:1px solid transparent;border-radius:4px;color:var(--cds-text-primary,#161616);cursor:pointer;display:inline;padding:0;position:relative}.cds--snippet--inline html{font-size:100%}.cds--snippet--inline body{font-family:IBM Plex Sans,system-ui,-apple-system,BlinkMacSystemFont,\\.SFNSText-Regular,sans-serif;font-weight:400;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}.cds--snippet--inline code{font-family:IBM Plex Mono,system-ui,-apple-system,BlinkMacSystemFont,\\.SFNSText-Regular,monospace}.cds--snippet--inline strong{font-weight:600}.cds--snippet--inline:hover{background-color:var(--cds-layer-hover)}.cds--snippet--inline:active{background-color:var(--cds-layer-active)}.cds--snippet--inline:focus{border:1px solid var(--cds-focus,#0f62fe);outline:none}.cds--snippet--inline:before{block-size:0;border:none;content:"";display:none;inline-size:0;position:absolute;z-index:6000}.cds--snippet--inline .cds--copy-btn__feedback{background-color:var(--cds-background-inverse,#393939);block-size:auto;border-radius:.125rem;box-shadow:0 2px 6px var(--cds-shadow,rgba(0,0,0,.3));box-sizing:content-box;color:var(--cds-text-inverse,#fff);display:none;font-size:var(--cds-body-compact-01-font-size,.875rem);font-weight:400;font-weight:var(--cds-body-compact-01-font-weight,400);inline-size:-moz-max-content;inline-size:max-content;letter-spacing:var(--cds-body-compact-01-letter-spacing,.16px);line-height:var(--cds-body-compact-01-line-height,1.28572);margin:auto;max-inline-size:13rem;min-inline-size:1.5rem;overflow:visible;padding:.1875rem 1rem;text-align:start;transform:translateX(-50%);z-index:6000;clip:auto}@media (-ms-high-contrast:active),(-ms-high-contrast:none){.cds--snippet--inline .cds--copy-btn__feedback{inline-size:auto}}@supports (-ms-accelerator:true){.cds--snippet--inline .cds--copy-btn__feedback{inline-size:auto}}@supports (-ms-ime-align:auto){.cds--snippet--inline .cds--copy-btn__feedback{inline-size:auto}}@media screen and (-ms-high-contrast:active),screen and (prefers-contrast){.cds--snippet--inline .cds--copy-btn__feedback{border:1px solid transparent}}.cds--snippet--inline.cds--copy-btn--animating .cds--copy-btn__feedback,.cds--snippet--inline.cds--copy-btn--animating:before{display:block}.cds--snippet--inline.cds--copy-btn--animating.cds--copy-btn--fade-out .cds--copy-btn__feedback,.cds--snippet--inline.cds--copy-btn--animating.cds--copy-btn--fade-out:before{animation:cds--hide-feedback .11s cubic-bezier(.2,0,.38,.9)}.cds--snippet--inline.cds--copy-btn--animating.cds--copy-btn--fade-in .cds--copy-btn__feedback,.cds--snippet--inline.cds--copy-btn--animating.cds--copy-btn--fade-in:before{animation:cds--show-feedback .11s cubic-bezier(.2,0,.38,.9)}.cds--snippet--inline code{padding:0 .5rem}.cds--snippet--inline.cds--snippet--no-copy{display:inline-block}.cds--snippet--inline.cds--snippet--no-copy:hover{background-color:var(--cds-layer);cursor:auto}.cds--snippet--light.cds--snippet--inline.cds--snippet--no-copy:hover{background-color:var(--cds-layer-hover);cursor:auto}.cds--snippet--single,:host(cds-code-snippet-skeleton[type=single]),:host(cds-code-snippet[type=single]){align-items:center;background-color:var(--cds-layer);block-size:2.5rem;display:flex;font-family:var(--cds-code-01-font-family,"IBM Plex Mono",system-ui,-apple-system,BlinkMacSystemFont,".SFNSText-Regular",monospace);font-size:var(--cds-code-01-font-size,.75rem);font-weight:var(--cds-code-01-font-weight,400);inline-size:100%;letter-spacing:var(--cds-code-01-letter-spacing,.32px);line-height:var(--cds-code-01-line-height,1.33333);max-inline-size:48rem;padding-inline-end:2.5rem;position:relative}.cds--snippet--single.cds--snippet--no-copy,:host(cds-code-snippet-skeleton[type=single]):host(cds-code-snippet[hide-copy-button]),:host(cds-code-snippet[type=single]):host(cds-code-snippet[hide-copy-button]){padding:0}.cds--snippet--single.cds--snippet--no-copy:after{inset-inline-end:1rem}.cds--snippet--single .cds--snippet-container,:host(cds-code-snippet-skeleton[type=single]) .cds--snippet-container,:host(cds-code-snippet[type=single]) .cds--snippet-container{align-items:center;block-size:100%;display:flex;overflow-x:auto;padding-inline-start:1rem;position:relative}.cds--snippet--single .cds--snippet-container:focus,:host(cds-code-snippet-skeleton[type=single]) .cds--snippet-container:focus,:host(cds-code-snippet[type=single]) .cds--snippet-container:focus{outline:2px solid var(--cds-focus,#0f62fe);outline-offset:-2px}@media screen and (prefers-contrast){.cds--snippet--single .cds--snippet-container:focus,:host(cds-code-snippet-skeleton[type=single]) .cds--snippet-container:focus,:host(cds-code-snippet[type=single]) .cds--snippet-container:focus{outline-style:dotted}}.cds--snippet--single pre,:host(cds-code-snippet-skeleton[type=single]) pre,:host(cds-code-snippet[type=single]) pre{font-family:var(--cds-code-01-font-family,"IBM Plex Mono",system-ui,-apple-system,BlinkMacSystemFont,".SFNSText-Regular",monospace);font-size:var(--cds-code-01-font-size,.75rem);font-weight:var(--cds-code-01-font-weight,400);letter-spacing:var(--cds-code-01-letter-spacing,.32px);line-height:var(--cds-code-01-line-height,1.33333);padding-inline-end:.5rem}.cds--snippet--inline code,.cds--snippet--single pre,:host(cds-code-snippet-skeleton[type=single]) pre,:host(cds-code-snippet[type=single]) pre{white-space:pre}.cds--snippet--multi,:host(cds-code-snippet-skeleton[type=multi]),:host(cds-code-snippet[type=multi]),:host(cds-code-snippet[type=multi]) .cds--snippet-container{background-color:var(--cds-layer);display:flex;font-family:var(--cds-code-01-font-family,"IBM Plex Mono",system-ui,-apple-system,BlinkMacSystemFont,".SFNSText-Regular",monospace);font-size:var(--cds-code-01-font-size,.75rem);font-weight:var(--cds-code-01-font-weight,400);inline-size:100%;letter-spacing:var(--cds-code-01-letter-spacing,.32px);line-height:var(--cds-code-01-line-height,1.33333);max-inline-size:48rem;padding:1rem;position:relative}.cds--snippet--multi .cds--snippet-container,:host(cds-code-snippet-skeleton[type=multi]) .cds--snippet-container,:host(cds-code-snippet[type=multi]) .cds--snippet-container{max-block-size:100%;min-block-size:100%;order:1;overflow-y:auto;position:relative;transition:max-height .15s cubic-bezier(.2,0,.38,.9)}.cds--snippet--multi .cds--snippet-container:focus,:host(cds-code-snippet-skeleton[type=multi]) .cds--snippet-container:focus,:host(cds-code-snippet[type=multi]) .cds--snippet-container:focus{outline:2px solid var(--cds-focus,#0f62fe);outline-offset:-2px;outline-offset:0}@media screen and (prefers-contrast){.cds--snippet--multi .cds--snippet-container:focus,:host(cds-code-snippet-skeleton[type=multi]) .cds--snippet-container:focus,:host(cds-code-snippet[type=multi]) .cds--snippet-container:focus{outline-style:dotted}}.cds--snippet--multi.cds--snippet--expand .cds--snippet-container,:host(cds-code-snippet[type=multi]) .cds--snippet--expand.cds--snippet-container .cds--snippet-container{padding-block-end:1rem;transition:max-height .15s cubic-bezier(.2,0,.38,.9)}.cds--snippet--multi.cds--snippet--wraptext pre,:host(cds-code-snippet[type=multi]) .cds--snippet--wraptext.cds--snippet-container pre{white-space:pre-wrap;word-wrap:break-word}.cds--snippet--multi .cds--snippet-container pre,:host(cds-code-snippet-skeleton[type=multi]) .cds--snippet-container pre,:host(cds-code-snippet[type=multi]) .cds--snippet-container pre{padding-inline-end:2.5rem}.cds--snippet--multi.cds--snippet--no-copy .cds--snippet-container pre,:host(cds-code-snippet-skeleton[type=multi]):host(cds-code-snippet[hide-copy-button]) .cds--snippet-container pre,:host(cds-code-snippet[type=multi]) .cds--snippet--no-copy.cds--snippet-container .cds--snippet-container pre,:host(cds-code-snippet[type=multi]):host(cds-code-snippet[hide-copy-button]) .cds--snippet-container pre{padding-inline-end:0}.cds--snippet--multi.cds--snippet--has-right-overflow:after,:host(cds-code-snippet[type=multi]) .cds--snippet--has-right-overflow.cds--snippet-container:after{background-image:linear-gradient(to right,transparent,var(--cds-layer));block-size:100%;content:"";inline-size:1rem;inset-block-start:0;inset-inline-end:1rem;position:absolute}:host(cds-code-snippet[type=multi]) [dir=rtl] .cds--snippet--has-right-overflow.cds--snippet-container:after,[dir=rtl] .cds--snippet--multi.cds--snippet--has-right-overflow:after{background-image:linear-gradient(to left,transparent,var(--cds-layer))}.cds--snippet--multi .cds--snippet-container pre code,:host(cds-code-snippet-skeleton[type=multi]) .cds--snippet-container pre code,:host(cds-code-snippet[type=multi]) .cds--snippet-container pre code{overflow:hidden}.cds--snippet__icon{block-size:1rem;fill:var(--cds-icon-primary,#161616);inline-size:1rem;transition:all 70ms cubic-bezier(.2,0,.38,.9)}.cds--btn>.cds--snippet__icon{margin-block-start:0}.cds--copy-btn{align-items:center;background-color:var(--cds-layer);border:none;cursor:pointer;display:flex;justify-content:center;outline:none;overflow:visible;padding:0}.cds--copy-btn html{font-size:100%}.cds--copy-btn body{font-family:IBM Plex Sans,system-ui,-apple-system,BlinkMacSystemFont,\\.SFNSText-Regular,sans-serif;font-weight:400;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}.cds--copy-btn code{font-family:IBM Plex Mono,system-ui,-apple-system,BlinkMacSystemFont,\\.SFNSText-Regular,monospace}.cds--copy-btn strong{font-weight:600}.cds--copy-btn:focus{outline:2px solid var(--cds-focus,#0f62fe);outline-color:var(--cds-focus,#0f62fe);outline-offset:-2px}@media screen and (prefers-contrast){.cds--copy-btn:focus{outline-style:dotted}}.cds--snippet .cds--popover-container,:host(cds-code-snippet) .cds--popover-container,:host(cds-code-snippet-skeleton) .cds--popover-container{font-family:IBM Plex Sans,system-ui,-apple-system,BlinkMacSystemFont,\\.SFNSText-Regular,sans-serif;inset-block-start:0;inset-inline-end:0;position:absolute}.cds--snippet--inline.cds--btn{block-size:1.25rem;inline-size:auto;max-inline-size:unset;min-block-size:1.25rem;padding-inline:0}.cds--snippet--inline.cds--btn.cds--btn--primary:hover{color:var(--cds-text-primary,#161616)}.cds--snippet.cds--snippet--multi .cds--popover-container,:host(cds-code-snippet):host(cds-code-snippet[type=multi]) .cds--popover-container,:host(cds-code-snippet-skeleton):host(cds-code-snippet-skeleton[type=multi]) .cds--popover-container{inset-block-start:.5rem;inset-inline-end:.5rem}.cds--snippet--multi .cds--copy-btn,:host(cds-code-snippet-skeleton[type=multi]) .cds--copy-btn,:host(cds-code-snippet[type=multi]) .cds--copy-btn{z-index:10}.cds--snippet-btn--expand{align-items:center;background-color:var(--cds-layer);block-size:2rem;border:0;color:var(--cds-text-primary,#161616);display:inline-flex;font-family:IBM Plex Sans,system-ui,-apple-system,BlinkMacSystemFont,\\.SFNSText-Regular,sans-serif;font-size:var(--cds-body-compact-01-font-size,.875rem);font-weight:var(--cds-body-compact-01-font-weight,400);inset-block-end:0;inset-inline-end:0;letter-spacing:var(--cds-body-compact-01-letter-spacing,.16px);line-height:var(--cds-body-compact-01-line-height,1.28572);padding:.5rem 1rem;position:absolute;z-index:10}.cds--snippet-btn--expand .cds--snippet-btn--text{inset-block-start:-.0625rem;position:relative}.cds--snippet-btn--expand--hide.cds--snippet-btn--expand{display:none}.cds--snippet-btn--expand .cds--icon-chevron--down{fill:var(--cds-icon-primary,#161616);margin-inline-start:.5rem;transform:rotate(0deg);transition:.15s cubic-bezier(.2,0,.38,.9)}.cds--snippet-btn--expand:hover{background:var(--cds-layer-hover);color:var(--cds-text-primary,#161616)}.cds--snippet-btn--expand:active{background-color:var(--cds-layer-active)}.cds--snippet-btn--expand:focus{border-color:transparent;outline:2px solid var(--cds-focus,#0f62fe);outline-offset:-2px}@media screen and (prefers-contrast){.cds--snippet-btn--expand:focus{outline-style:dotted}}.cds--snippet--expand .cds--snippet-btn--expand .cds--icon-chevron--down{transform:rotate(180deg);transition:transform .3s}.cds--snippet--light,.cds--snippet--light .cds--btn.cds--snippet-btn--expand,.cds--snippet--light .cds--copy-btn,.cds--snippet--light .cds--snippet-button{background-color:var(--cds-layer)}.cds--snippet--light .cds--btn.cds--snippet-btn--expand:hover,.cds--snippet--light .cds--copy-btn:hover,.cds--snippet--light .cds--snippet-button:hover,.cds--snippet--light.cds--snippet--inline:hover{background-color:var(--cds-layer-hover)}.cds--snippet--light .cds--btn.cds--snippet-btn--expand:active,.cds--snippet--light .cds--copy-btn:active,.cds--snippet--light .cds--snippet-button:active,.cds--snippet--light.cds--snippet--inline:active{background-color:var(--cds-layer-active)}.cds--snippet--light.cds--snippet--multi:after,.cds--snippet--light.cds--snippet--single:after,:host(cds-code-snippet[type=multi]) .cds--snippet--light.cds--snippet-container:after{background-image:linear-gradient(to right,rgba(var(--cds-layer),0),var(--cds-layer))}.cds--snippet.cds--skeleton .cds--snippet-container,:host(cds-code-snippet-skeleton) .cds--snippet-container{block-size:100%;inline-size:100%}.cds--snippet-button .cds--btn--copy__feedback{inset-block-start:3.175rem;inset-inline:50% auto}.cds--snippet-button .cds--btn--copy__feedback:before{inset-block-start:0}.cds--snippet-button .cds--btn--copy__feedback:after{inset-block-start:-.25rem}.cds--snippet--multi .cds--snippet-button .cds--btn--copy__feedback,:host(cds-code-snippet-skeleton[type=multi]) .cds--snippet-button .cds--btn--copy__feedback,:host(cds-code-snippet[type=multi]) .cds--snippet-button .cds--btn--copy__feedback{inset-block-start:2.675rem}.cds--snippet--inline .cds--btn--copy__feedback{inset-block-start:calc(100% - .25rem);inset-inline:50% auto}.cds--snippet__overflow-indicator--left,.cds--snippet__overflow-indicator--right{flex:1 0 auto;inline-size:1rem;z-index:1}.cds--snippet__overflow-indicator--left{background-image:linear-gradient(to left,transparent,var(--cds-layer));margin-inline-end:-1rem;order:0}.cds--snippet__overflow-indicator--right{margin-inline-start:-1rem;order:2}.cds--snippet__overflow-indicator--right,[dir=rtl] .cds--snippet__overflow-indicator--left{background-image:linear-gradient(to right,transparent,var(--cds-layer))}[dir=rtl] .cds--snippet__overflow-indicator--right{background-image:linear-gradient(to left,transparent,var(--cds-layer))}.cds--snippet--single .cds--snippet__overflow-indicator--left,.cds--snippet--single .cds--snippet__overflow-indicator--right,:host(cds-code-snippet-skeleton[type=single]) .cds--snippet__overflow-indicator--left,:host(cds-code-snippet-skeleton[type=single]) .cds--snippet__overflow-indicator--right,:host(cds-code-snippet[type=single]) .cds--snippet__overflow-indicator--left,:host(cds-code-snippet[type=single]) .cds--snippet__overflow-indicator--right{block-size:calc(100% - .25rem);inline-size:2rem;position:absolute}.cds--snippet--single .cds--snippet__overflow-indicator--right,:host(cds-code-snippet-skeleton[type=single]) .cds--snippet__overflow-indicator--right,:host(cds-code-snippet[type=single]) .cds--snippet__overflow-indicator--right{inset-inline-end:2.5rem}.cds--snippet--single.cds--snippet--no-copy .cds--snippet__overflow-indicator--right,:host(cds-code-snippet-skeleton[type=single]):host(cds-code-snippet[hide-copy-button]) .cds--snippet__overflow-indicator--right,:host(cds-code-snippet[type=single]):host(cds-code-snippet[hide-copy-button]) .cds--snippet__overflow-indicator--right{inset-inline-end:0}.cds--snippet--single .cds--snippet-container:focus~.cds--snippet__overflow-indicator--right,:host(cds-code-snippet-skeleton[type=single]) .cds--snippet-container:focus~.cds--snippet__overflow-indicator--right,:host(cds-code-snippet[type=single]) .cds--snippet-container:focus~.cds--snippet__overflow-indicator--right{inset-inline-end:2.625rem}.cds--snippet--single .cds--snippet-container:focus+.cds--snippet__overflow-indicator--left,:host(cds-code-snippet-skeleton[type=single]) .cds--snippet-container:focus+.cds--snippet__overflow-indicator--left,:host(cds-code-snippet[type=single]) .cds--snippet-container:focus+.cds--snippet__overflow-indicator--left{inset-inline-start:.125rem}.cds--snippet--light .cds--snippet__overflow-indicator--left{background-image:linear-gradient(to left,transparent,var(--cds-layer))}.cds--snippet--light .cds--snippet__overflow-indicator--right{background-image:linear-gradient(to right,transparent,var(--cds-layer))}@media not all and (min-resolution >= 0.001dpcm){@supports (-webkit-appearance:none) and (stroke-color:transparent){.cds--snippet__overflow-indicator--left{background-image:linear-gradient(to left,rgba(var(--cds-layer),0),var(--cds-layer))}.cds--snippet__overflow-indicator--right{background-image:linear-gradient(to right,rgba(var(--cds-layer),0),var(--cds-layer))}}}.cds--snippet--multi.cds--skeleton,:host(cds-code-snippet-skeleton[type=multi]),:host(cds-code-snippet[type=multi]) .cds--skeleton.cds--snippet-container,:host(cds-code-snippet[type=multi]):host(cds-code-snippet-skeleton){block-size:6.125rem}.cds--snippet--single.cds--skeleton,:host(cds-code-snippet-skeleton[type=single]),:host(cds-code-snippet[type=single]):host(cds-code-snippet-skeleton){block-size:3.5rem}.cds--snippet.cds--skeleton span,:host(cds-code-snippet-skeleton) span{background:var(--cds-skeleton-background,#e8e8e8);block-size:1rem;border:none;box-shadow:none;display:block;inline-size:100%;margin-block-start:.5rem;padding:0;pointer-events:none;position:relative}.cds--snippet.cds--skeleton span:active,.cds--snippet.cds--skeleton span:focus,.cds--snippet.cds--skeleton span:hover,:host(cds-code-snippet-skeleton) span:active,:host(cds-code-snippet-skeleton) span:focus,:host(cds-code-snippet-skeleton) span:hover{border:none;cursor:default;outline:none}.cds--snippet.cds--skeleton span:before,:host(cds-code-snippet-skeleton) span:before{animation:cds--skeleton 3s ease-in-out infinite;background:var(--cds-skeleton-element,#c6c6c6);block-size:100%;content:"";inline-size:100%;inset-inline-start:0;position:absolute;will-change:transform-origin,transform,opacity}@media (prefers-reduced-motion:reduce){.cds--snippet.cds--skeleton span:before,:host(cds-code-snippet-skeleton) span:before{animation:none}}.cds--snippet.cds--skeleton span:first-child,:host(cds-code-snippet-skeleton) span:first-child{margin:0}.cds--snippet.cds--skeleton span:nth-child(2),:host(cds-code-snippet-skeleton) span:nth-child(2){inline-size:85%}.cds--snippet.cds--skeleton span:nth-child(3),:host(cds-code-snippet-skeleton) span:nth-child(3){inline-size:95%}.cds--snippet--single.cds--skeleton .cds--snippet-container,:host(cds-code-snippet-skeleton[type=single]) .cds--snippet-container,:host(cds-code-snippet[type=single]):host(cds-code-snippet-skeleton) .cds--snippet-container{padding-block-end:0}@media (forced-colors:active),screen and (-ms-high-contrast:active){.cds--snippet__icon{fill:ButtonText}.cds--snippet--inline:focus{color:Highlight;outline:1px solid Highlight}}@media (forced-colors:active),screen and (-ms-high-contrast:active){.cds--snippet--multi,.cds--snippet--single,:host(cds-code-snippet-skeleton[type=multi]),:host(cds-code-snippet-skeleton[type=single]),:host(cds-code-snippet[type=multi]),:host(cds-code-snippet[type=multi]) .cds--snippet-container,:host(cds-code-snippet[type=single]){outline:1px solid transparent}}:host(cds-code-snippet[wrap-text]) pre{white-space:pre-wrap;word-wrap:break-word}:host(cds-code-snippet[type=single]) pre{white-space:nowrap}:host(cds-code-snippet[type=single]) cds-copy-button{font-family:IBM Plex Sans,system-ui,-apple-system,BlinkMacSystemFont,\\.SFNSText-Regular,sans-serif;inset-block-start:0;inset-inline-end:0;position:absolute;code-overflow:hidden}cds-copy code{font-family:var(--cds-code-01-font-family,"IBM Plex Mono",system-ui,-apple-system,BlinkMacSystemFont,".SFNSText-Regular",monospace);font-size:var(--cds-code-01-font-size,.75rem);font-weight:var(--cds-code-01-font-weight,400);letter-spacing:var(--cds-code-01-letter-spacing,.32px);line-height:var(--cds-code-01-line-height,1.33333);padding:0 .5rem}:host(cds-code-snippet[type=multi]) .cds--snippet-container{padding:0}:host(cds-code-snippet[type=multi]) pre{margin:0;overflow-x:auto;padding:0 2.5rem 1.5rem 0}:host(cds-code-snippet[type=multi]) pre:after{background-image:linear-gradient(to right,transparent,var(--cds-layer));block-size:100%;content:"";inline-size:1rem;inset-block-start:0;inset-inline-end:0;position:absolute}:host(cds-code-snippet[type=multi]) cds-button .cds--snippet__icon{margin-inline-start:.5rem}:host(cds-code-snippet[type=multi]) cds-button[disabled] .cds--snippet-btn--text{color:var(--cds-text-disabled,hsla(0,0%,9%,.25))}:host(cds-code-snippet[type=multi]) cds-copy-button{inset-block-start:.5rem;inset-inline-end:.5rem;position:absolute;z-index:10}:host(cds-code-snippet[type=multi][expanded-code]) .cds--snippet-container{padding-block-end:1rem;transition:max-height .15s cubic-bezier(.2,0,.38,.9)}:host(cds-code-snippet[type=multi][expanded-code]) cds-button .cds--snippet__icon{transform:rotate(180deg);transition:transform .3s}:host(cds-code-snippet-skeleton) span{background:var(--cds-skeleton-background,#e8e8e8);block-size:1rem;border:none;box-shadow:none;display:block;inline-size:100%;margin-block-start:.5rem;padding:0;pointer-events:none;position:relative}:host(cds-code-snippet-skeleton) span:active,:host(cds-code-snippet-skeleton) span:focus,:host(cds-code-snippet-skeleton) span:hover{border:none;cursor:default;outline:none}:host(cds-code-snippet-skeleton) span:before{animation:cds--skeleton 3s ease-in-out infinite;background:var(--cds-skeleton-element,#c6c6c6);block-size:100%;content:"";inline-size:100%;inset-inline-start:0;position:absolute;will-change:transform-origin,transform,opacity}@media (prefers-reduced-motion:reduce){:host(cds-code-snippet-skeleton) span:before{animation:none}}:host(cds-code-snippet-skeleton) span:first-child{margin:0}:host(cds-code-snippet-skeleton) span:nth-child(2){inline-size:85%}:host(cds-code-snippet-skeleton) span:nth-child(3){inline-size:95%}']);/**
 * @license
 *
 * Copyright IBM Corp. 2019, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const mt=(a,e)=>e?(a.observe(e),{release(){return a.unobserve(e),null}}):null;let v=class extends tt(Q){constructor(){super(...arguments),this._expandedCode=!1,this._hObserveResize=null,this._rowHeightInPixels=16,this._hasRightOverflow=!0,this._hasLeftOverflow=!1,this._shouldShowMoreLessBtn=!1,this._resizeObserver=new ResizeObserver(()=>{var e;const t=(e=this.shadowRoot)===null||e===void 0?void 0:e.querySelector(`.${b}--snippet-container`),n=t==null?void 0:t.querySelector("code"),{type:o,maxCollapsedNumberOfRows:c,maxExpandedNumberOfRows:l,minExpandedNumberOfRows:p,_rowHeightInPixels:m,_handleScroll:d}=this;if(n&&o===u.MULTI){const{height:k}=n.getBoundingClientRect();c>0&&(l<=0||l>c)&&k>c*m?this._shouldShowMoreLessBtn=!0:this._shouldShowMoreLessBtn=!1,this._expandedCode&&p>0&&k<=p*m&&(this._expandedCode=!1)}(n&&o===u.MULTI||t&&o===u.SINGLE)&&d(),this.requestUpdate()}),this.copyText="",this.disabled=!1,this.feedback="Copied!",this.feedbackTimeout=2e3,this.hideCopyButton=!1,this.maxCollapsedNumberOfRows=15,this.maxExpandedNumberOfRows=0,this.minCollapsedNumberOfRows=3,this.minExpandedNumberOfRows=16,this.showLessText="Show less",this.showMoreText="Show more",this.tooltipContent="Copy to clipboard",this.wrapText=!1,this.type=u.SINGLE}_handleCopyClick(){const{ownerDocument:e}=this,t=e.defaultView.getSelection();t.removeAllRanges();const n=e.createElement("code");n.className=`${b}--visually-hidden`;const o=e.createElement("pre"),c=Array.from(this.childNodes).filter(p=>p.nodeType===Node.TEXT_NODE);o.textContent=this.copyText||c[0].textContent,n.appendChild(o),e.body.appendChild(n);const l=e.createRange();l.selectNodeContents(n),t.addRange(l),e.execCommand("copy"),e.body.removeChild(n),t.removeAllRanges()}_getCodeRefDimensions(e){const{clientWidth:t,scrollLeft:n,scrollWidth:o}=e;return{horizontalOverflow:o>t,codeClientWidth:t,codeScrollWidth:o,codeScrollLeft:n}}_handleScroll(){var e;if(this){const t=(e=this===null||this===void 0?void 0:this.shadowRoot)===null||e===void 0?void 0:e.querySelector(`.${b}--snippet-container`),n=t==null?void 0:t.querySelector("pre");if(this.type===u.INLINE||this.type===u.SINGLE&&!t||this.type===u.MULTI&&!n)return;const{horizontalOverflow:o,codeClientWidth:c,codeScrollWidth:l,codeScrollLeft:p}=this.type===u.SINGLE?this._getCodeRefDimensions(t):this._getCodeRefDimensions(n);this._hasLeftOverflow=o&&!!p,this._hasRightOverflow=o&&p+c!==l,this.requestUpdate()}}_handleClickExpanded(){this._expandedCode=!this._expandedCode,this.requestUpdate()}connectedCallback(){super.connectedCallback(),this._hObserveResize&&(this._hObserveResize=this._hObserveResize.release()),this._hObserveResize=mt(this._resizeObserver,this)}disconnectedCallback(){this._hObserveResize&&(this._hObserveResize=this._hObserveResize.release())}updated(){this._expandedCode?this.setAttribute("expanded-code",""):this.removeAttribute("expanded-code")}render(){const{disabled:e,feedback:t,feedbackTimeout:n,hideCopyButton:o,maxExpandedNumberOfRows:c,minExpandedNumberOfRows:l,maxCollapsedNumberOfRows:p,minCollapsedNumberOfRows:m,type:d,wrapText:k,tooltipContent:E,showMoreText:_,showLessText:S,_expandedCode:A,_handleCopyClick:M,_handleScroll:N,_hasRightOverflow:O,_hasLeftOverflow:z,_rowHeightInPixels:h,_shouldShowMoreLessBtn:x}=this;let I=`${b}--snippet`;d&&(I+=` ${b}--snippet--${d}`),d!=="inline"&&e&&(I+=` ${b}--snippet--disabled`),o&&(I+=` ${b}--snippet--no-copy`),k&&(I+=` ${b}--snippet--wraptext`),d=="multi"&&O&&(I+=` ${b}--snippet--has-right-overflow`);const q=`${b}--snippet-btn--expand`,L=e?`${b}--snippet--disabled`:"",g=A?S:_;if(d===u.INLINE)return B`
        <cds-copy button-class-name="${I}" @click="${M}">
          <code slot="icon"><slot></slot></code>
          <span slot="tooltip-content">${E}</span>
        </cds-copy>
      `;const U={};return d==="multi"&&(A?(c>0&&(U["max-height"]=c*h+"px"),l>0&&(U["min-height"]=l*h+"px")):(p>0&&(U["max-height"]=p*h+"px"),m>0&&(U["min-height"]=m*h+"px"))),B`
      <div
        role="${d===u.SINGLE||d===u.MULTI?"textbox":null}"
        tabindex="${(d===u.SINGLE||d===u.MULTI)&&!e?0:null}"
        class="${b}--snippet-container"
        aria-label="${"code-snippet"}"
        aria-readonly="${d===u.SINGLE||d===u.MULTI?!0:null}"
        aria-multiline="${d===u.MULTI?!0:null}"
        @scroll="${d===u.SINGLE&&N||null}"
        style=${pt(U)}>
        <pre
          @scroll="${d===u.MULTI&&N||null}"><code><slot></slot></code></pre>
      </div>

      ${z?B`
            <div class="${b}--snippet__overflow-indicator--left"></div>
          `:""}
      ${O&&d!==u.MULTI?B`
            <div class="${b}--snippet__overflow-indicator--right"></div>
          `:""}
      ${o?"":B`
            <cds-copy-button
              ?disabled=${e}
              button-class-name=${L}
              feedback=${t}
              feedback-timeout=${n}
              @click="${M}">
              ${E}
            </cds-copy-button>
          `}
      ${x?B`
            <cds-button
              kind="ghost"
              size="sm"
              button-class-name=${q}
              ?disabled=${e}
              @click=${()=>this._handleClickExpanded()}>
              <span class="${b}--snippet-btn--text">
                ${g}
              </span>
              ${et({class:`${b}--icon-chevron--down ${b}--snippet__icon`,name:"cheveron--down",role:"img",slot:"icon"})}
            </cds-button>
          `:""}
    `}};v.shadowRootOptions=Object.assign(Object.assign({},Q.shadowRootOptions),{delegatesFocus:!0});v.styles=ke;f([s({attribute:"copy-text"})],v.prototype,"copyText",void 0);f([s({type:Boolean,reflect:!0})],v.prototype,"disabled",void 0);f([s()],v.prototype,"feedback",void 0);f([s({type:Number,attribute:"feedback-timeout"})],v.prototype,"feedbackTimeout",void 0);f([s({type:Boolean,reflect:!0,attribute:"hide-copy-button"})],v.prototype,"hideCopyButton",void 0);f([s()],v.prototype,"maxCollapsedNumberOfRows",void 0);f([s()],v.prototype,"maxExpandedNumberOfRows",void 0);f([s()],v.prototype,"minCollapsedNumberOfRows",void 0);f([s()],v.prototype,"minExpandedNumberOfRows",void 0);f([s({attribute:"show-less-text"})],v.prototype,"showLessText",void 0);f([s({attribute:"show-more-text"})],v.prototype,"showMoreText",void 0);f([s({attribute:"tooltip-content"})],v.prototype,"tooltipContent",void 0);f([s({type:Boolean,reflect:!0,attribute:"wrap-text"})],v.prototype,"wrapText",void 0);f([s({reflect:!0})],v.prototype,"type",void 0);v=f([xe(`${b}-code-snippet`)],v);/**
 * @license
 *
 * Copyright IBM Corp. 2019, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */let G=class extends Q{constructor(){super(...arguments),this.type=u.SINGLE}render(){return B`
      <div class="${b}--snippet-container">
        ${this.type!==u.MULTI?B` <span></span> `:B` <span></span><span></span><span></span> `}
      </div>
    `}};G.styles=ke;f([s({reflect:!0})],G.prototype,"type",void 0);G=f([xe(`${b}-code-snippet-skeleton`)],G);/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const ut={title:"Components/Chat",component:"clabs-chat"},ht=[["code",`\`\`\`from math import sqrt
#prime function to check given number prime or not:
def Prime(number,itr):
	#base condition
	if itr == 1:
		return True
	#if given number divided by itr or not
	if number % itr == 0:
		return False
	#Recursive function Call
	if Prime(number,itr-1) == False:
		return False
	return True
\`\`\``,"","Prime function in python"],["editable-code",`\`\`\`<!doctype html>
<html>
	<head>
		<title>This is the title of the webpage</title>
	<script src="myscripts.js"><\/script>
	</head>
	<body>
		<p>This is an example paragraph. Anything in the <strong>body</strong> tag will appear on the page, just like this <strong>p</strong> tag and its contents.</p>
	</body>
</html>\`\`\``,"","Webpage example"],["editable-code","```user@Macbook-Air server % npm run build\nuser@Macbook-Air server % npm run lint:styles --fix\nuser@Macbook-Air server % npm format:write\nuser@Macbook-Air server % python3 server.py\n```","","Multi-line command line"],["editable-code",`\`\`\`CREATE TABLE employees (
id INT PRIMARY KEY,
first_name VARCHAR(50),
last_name VARCHAR(50),
email VARCHAR(100),
department_id INT,
hire_date DATE
);
-- Creating a table named 'departments'
CREATE TABLE departments (
id INT PRIMARY KEY,
name VARCHAR(50)
);
-- Inserting data into the 'departments' table
INSERT INTO departments (id, name) VALUES
(1, 'Human Resources'),
(2, 'Marketing'),
(3, 'Sales'),
(4, 'IT');
-- Inserting data into the 'employees' table
INSERT INTO employees (id, first_name, last_name, email, department_id, hire_date) VALUES
(1, 'John', 'Doe', 'john.doe@example.com', 3, '2020-01-01'),
(2, 'Jane', 'Doe', 'jane.doe@example.com', 2, '2019-06-15'),
(3, 'Jim', 'Smith', 'jim.smith@example.com', 3, '2021-02-20');
\`\`\``,"","SQL example"]],R=[["text","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."],["carousel",'["https://bouqs.com/blog/wp-content/uploads/2019/05/20_summer-cosmos.jpg","https://bouqs.com/blog/wp-content/uploads/2019/05/summer-dahlia.jpg","https://bouqs.com/blog/wp-content/uploads/2023/06/zinnia-gbcbfedd94_1280.jpg","https://bouqs.com/blog/wp-content/uploads/2021/09/chrysanthemum-5668882_1280.jpg","https://bouqs.com/blog/wp-content/uploads/2021/09/celosia-7299458_1280.jpg","https://bouqs.com/blog/wp-content/uploads/2021/05/sunflower-fields.jpg","https://bouqs.com/blog/wp-content/uploads/2021/09/strawflower-362280_1280.jpg"]',"","Flower images from bouqs.com"],["text","<strong>Galileo di Vincenzo Bonaiuti de' Galilei</strong> (15 February 1564 – 8 January 1642), commonly referred to as <strong>Galileo Galilei</strong> (<i>ɡælɪˈleɪoʊ ɡælɪˈleɪ GAL-il-AY-oh GAL-il-AY</i>) or simply <strong>Galileo</strong>, was an Italian [astronomer](https://en.wikipedia.org/wiki/Astronomer), [physicist](https://en.wikipedia.org/wiki/Physicist) and [engineer](https://en.wikipedia.org/wiki/Engineer), sometimes described as a [polymath](https://en.wikipedia.org/wiki/Polymath). He was born in the city of [Pisa](https://en.wikipedia.org/wiki/Pisa), then part of the [Duchy of Florence](https://en.wikipedia.org/wiki/Duchy_of_Florence). Galileo has been called the father of [observational astronomy](https://en.wikipedia.org/wiki/Observational_astronomy), modern-era classical physics, the [scientific method](https://en.wikipedia.org/wiki/Scientific_method), and [modern science](https://en.wikipedia.org/wiki/Modern_science).","summarized-text","Galileo Galilei article on Wikipedia"],["code",`\`\`\`from math import sqrt
#prime function to check given number prime or not:
def Prime(number,itr):
	#base condition
	if itr == 1:
		return True
	#if given number divided by itr or not
	if number % itr == 0:
		return False
	#Recursive function Call
	if Prime(number,itr-1) == False:
		return False
	return True
\`\`\``,"","Prime function in python"],["editable-code",`\`\`\`<!doctype html>
<html>
	<head>
		<title>This is the title of the webpage</title>
	<script src="myscripts.js"><\/script>
	</head>
	<body>
		<p>This is an example paragraph. Anything in the <strong>body</strong> tag will appear on the page, just like this <strong>p</strong> tag and its contents.</p>
	</body>
</html>\`\`\``,"","Webpage example"],["link-list","[IBM Cloud Home](https://www.ibm.com/cloud),[Cloud Solutions](https://www.ibm.com/cloud/solutions),[Cloud products](https://www.ibm.com/cloud/products),[Cloud Docs](https://cloud.ibm.com/docs)","","List of links in IBM Cloud"],["formula","\\( S = -\\frac{1}{2}\\int d^2\\sigma \\sqrt{-h} h^{ab}\\partial_a X^\\mu \\partial_b X^\\mu \\\\ \\frac{1}{4 \\pi \\alpha'} \\int d^2\\sigma \\sqrt{-h} \\left( h^{ab} \\partial_a X^\\mu \\partial_b X_\\mu + \\alpha' R \\Phi(X) \\right  \\\\ [\\alpha_m^\\mu, \\alpha_n^\\nu] = m \\delta_{m+n,0} \\eta^{\\mu \\nu}  \\)","","String Theory Action"],["formula","\\(\\frac{1}{(\\sqrt{\\phi \\sqrt{5}}-\\phi) e^{\\frac25 \\pi}} = \\\\ 1+\\frac{e^{-2\\pi}} {1+\\frac{e^{-4\\pi}} {1+\\frac{e^{-6\\pi}} \\\\ {1+\\frac{e^{-8\\pi}} {1+\\ldots} } } }\\)","","An Identity of Ramanujan"],["table",`Name,Age,Occupation,Location,State
Jerry,35,Comedian,Upper east side,NY
George,35,Unemployed,Queens,NY
Elaine,32,Publisher,Midtown,NY
Kramer,36,Unknown,Upper east side,NY`,"","Seinfeld characters"],["text","[International Business Machines Corporation](https://en.wikipedia.org/wiki/IBM) (using the trademark IBM), nicknamed [Big Blue](https://en.wikipedia.org/wiki/Big_Blue), is an American [multinational](https://en.wikipedia.org/wiki/Multinational_corporation) [technology company](https://en.wikipedia.org/wiki/Technology_company) headquartered in [Armonk, New York](https://en.wikipedia.org/wiki/Armonk,_New_York) and present in over 175 countries. IBM is the largest industrial [research organization](https://en.wikipedia.org/wiki/Research_institute) in the world, with 19 research facilities across a dozen countries, having held the record for most annual [U.S.](https://en.wikipedia.org/wiki/United_States) [patents](https://en.wikipedia.org/wiki/Patent) generated by a business for 29 consecutive years from 1993 to 2021","highlight-text","IBM article from wikipedia.com"],["file-upload","Test_file.pdf"],["card","https://dhjhkxawhe8q4.cloudfront.net/yup-wp/wp-content/uploads/2022/11/04134700/31_426_WMAA_Early-Sunday-Morning.jpg","img","Edward Hopper, Early Sunday Morning, 1930. Oil on canvas"],["card","https://www.wikipedia.org/wiki/Apollo_11","url","Apollo 11 article on wikipedia.com"],["card","https://upload.wikimedia.org/wikipedia/commons/transcoded/d/da/Paris_lockdown_-_Vimeo.webm/Paris_lockdown_-_Vimeo.webm.1080p.vp9.webm","video","Paris lockdown video from Wikipedia Commons"],["card","https://github.com/vega/vega-datasets/blob/main/data/co2-concentration.csv","file","C02 concentration spreadsheet from Github"],["card","https://upload.wikimedia.org/wikipedia/commons/f/f5/Giovanni_Giuseppe_Cambini_-_Quintet_No._1_in_Bb_major%2C_movement_2.ogg","audio","Audio file from Wikipedia commons"],["error","SEGMENTATION ERROR: Failed to render the content provided. (example)"],["loading",""],["html-text",`<p style="font-family: 'Times New Roman',serif; text-align:center; font-size:28px; line-height:32px; color:DarkGoldenrod;"> This is using a p tag, styled with Times New Roman, centered text, sized at 28px and colored in DarkGoldenrod.</p>`],["list",`1. Google.com (United States)
2. YouTube.com (US)
3. Facebook.com (US)
4. Baidu.com (China)
5. Wikipedia.org (US)`,"","Top sites in the United States"],["tags",'["Simone de Beauvoir","René Descartes","Jean-Paul Sartre","Voltaire","Michel Foucault","Albert Camus"]',"","List of famous french philosophers"],["molecule","```CC(C)(O1)C[C@@H](O)[C@@]1(O2)[C@@H](C)[C@@H]3CC=C4[C@]3(C2)C(=O)C[C@H]5[C@H]4CC[C@@H](C6)[C@]5(C)Cc(n7)c6nc(C[C@@]89(C))c7C[C@@H]8CC[C@@H]%10[C@@H]9C[C@@H](O)[C@@]%11(C)C%10=C[C@H](O%12)[C@]%11(O)[C@H](C)[C@]%12(O%13)[C@H](O)C[C@@]%13(C)CO```","","Smiles representation of Cephalostatin-1 from PubChem"],["molecule","```C1=C(C=C(C(=C1I)OC2=CC(=C(C(=C2)I)O)I)I)C[C@@H](C(=O)O)N```","","Smiles representation of Thyroxine from PubChem"],["chart",'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"A scatterplot showing body mass and flipper lengths of penguins.","data":{"url":"https://vega.github.io/vega-lite/examples/data/penguins.json"},"mark":"point","encoding":{"x":{"field":"Flipper Length (mm)","type":"quantitative","scale":{"zero":false}},"y":{"field":"Body Mass (g)","type":"quantitative","scale":{"zero":false}},"color":{"field":"Species","type":"nominal"}}}',"","Scatter plot example from vega-lite"],["chart",'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","data":{"url":"https://vega.github.io/vega-lite/data/barley.json"},"mark":"bar","encoding":{"x":{"aggregate":"sum","field":"yield"},"y":{"field":"variety"},"color":{"field":"site"}}}',"","Scatter plot example from vega-lite"],["chart",'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","width":300,"height":200,"data":{"url":"https://vega.github.io/vega-lite/data/unemployment-across-industries.json"},"mark":"area","encoding":{"x":{"timeUnit":"yearmonth","field":"date","axis":{"domain":false,"format":"%Y","tickSize":0}},"y":{"aggregate":"sum","field":"count","axis":null,"stack":"center"},"color":{"field":"series","scale":{"scheme":"category20b"}}}}',"","Stream graph example from vega-lite"],["chart",'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"US Unemployment by county","data":{"url":"https://vega.github.io/editor/data/us-10m.json","format":{"type":"topojson","feature":"counties"}},"transform":[{"lookup":"id","from":{"data":{"url":"https://vega.github.io/editor/data/unemployment.tsv"},"key":"id","fields":["rate"]}}],"projection":{"type":"albersUsa"},"mark":"geoshape","encoding":{"color":{"field":"rate","type":"quantitative"}}}',"","Map example from vega-lite"]],_e=`
<p style="margin-top: 0.75rem;">AI Explained</p>
<p style="margin-top: 0.5rem; margin-bottom:0.75rem; font-size:1.5rem; font-weight:600;">IBM Cloud example text</p>
<p style="margin-top: 0.75rem;">
The AI assistant is designed as a retrieval-augmented generation (RAG) that is running against IBM© large language models
</p>
<hr>
<p style="margin-bottom:0px;">How it works</p>
<ul style="list-style: none;list-style-type: decimal; padding-left:1rem;margin-top:0px">
  <li style="list-style-type: decimal;"><strong>Globalize</strong>. You can ask your questions and get an answer in any of the 10 languages supported by IBM Cloud</li>
  <li style="list-style-type: decimal;"><strong>Query</strong>. The IBM Cloud docs are searched to find topics with facts about your question</li>
  <li style="list-style-type: decimal;"><strong>Generate</strong>. Answers are generated ground in the IBM Cloud Docs</li>
  <li style="list-style-type: decimal;"><strong>Verify</strong>. With each question you ask, source citations from the IBM Cloud docs are provided to verify responses</li>
</ul>
<hr>
 <p style="margin-bottom:0px;">AI model</p>
<a style="text-decoration:none;color:#4589ff;" target="_blank" href="https://www.google.com">granite.13.chat.v2</a>`,gt={title:"AI explainability",prompt:"IBM Cloud AI assistant",responsePlaceholder:"Describe issues with this response",showTextArea:!1,description:"The AI assistant is designed as a retrieval-augmented generation (RAG) that is running against IBM© large language models",showList:!0,listTitle:"How it works",listItems:[{tilte:"Globalize",text:"You can ask your questions and get an answer in any of the 10 languages supported by IBM Cloud"},{title:"Query",text:"The IBM Cloud docs are searched to find topics with facts about your question"},{title:"Generate",text:"Answers are generated ground in the IBM Cloud Docs"},{title:"Verify",text:"With each question you ask, sorce citations from the IBM Cloud docs are provided to verify responses"}],model:{name:"granite.13.chat.v2",url:"https://www.google.com"}},Se=[{title:"Clear history",action:"clear-chat-history"},{title:"Save history",action:"save-chat-history"},{title:"Report issue",action:"report-issue"}],Ee={"thumbs-down":{title:"Unsatisfactory Response",tags:["Inaccurate","Incomplete","Missing links","Privacy violations","Hate speech"],prompt:"What was unsatisfactory about this response?",responsePlaceholder:"Describe issues with this response",dataCollectionTitle:"I allow IBM to collect my feedback",enableDataCollectionCheck:!0,disclaimer:"Lorem ipsum dolor sit amet, di os consectetur adipiscing elit, sed doeiusmod tempor incididunt ut fsil labore et dolore magna aliqua."},"thumbs-up":{title:"Feedback",tags:["Accurate","Comprehensive","Consice","Easy to Understand"],prompt:"Why did you choose this rating?",responsePlaceholder:"Add a comment",dataCollectionTitle:"I allow IBM to collect my feedback",enableDataCollectionCheck:!0,disclaimer:"Lorem ipsum dolor sit amet, di os consectetur adipiscing elit, sed doeiusmod tempor incididunt ut fsil labore et dolore magna aliqua."}},Ae={"header-close-chat":"Close","header-enable-fullscreen":"Fullscreen","header-disable-fullscreen":"Exit fullscreen","header-popout-chat":"Pop out chat","header-expand-chat":"Expand chat","header-move-chat":"Move chat","header-move-chat-done":"Set chat","header-open-menu":"Open","header-close-menu":"Close","header-open-slug":"Open","header-close-slug":"Close","message-regenerate-button":"Regenerate","message-like-button":"Like","message-undo-like-button":"Remove like","message-dislike-button":"Dislike","message-undo-dislike-button":"Remove dislike","message-enable-editing":"Edit","message-undo-edit":"Undo edit","message-validate-edit":"Validate edit","feedback-submit-button":"Submit","feedback-submit-button-unavailable":"Submit unavailable","feedback-close":"Close","link-list-view-all-button":"View all","link-list-collapse-button":"Collapse list","link-list-reference-title":"References","code-copypaste-button":"Copy code","code-copypaste-success":"Copied!","prompt-start-listening":"Start listening","prompt-stop-listening":"Stop listening","prompt-microphone-unavailable":"Microphone unavailable","prompt-loading-state-placeholder":"Thinking...","prompt-entry-placeholder":"Type something...","prompt-send-button":"Send response","prompt-send-blocked-button":"Send unavailable","prompt-cancel-button":"Cancel request","complex-feedback-notification-title":"Feedback sent","complex-feedback-notification-subtitle":"Thank you, we value your input","complex-feedback-notification-close-label":"Close","message-loading-aria-label":"Message sent, please wait..."},bt={top:100,left:16,right:16,bottom:16},yt={chosenHost:"Local",userPrompt:"You are Watson, a helpful and polite assistant. You will answer all my questions to the best of your knowledge.",apiUrl:"http://localhost:5002/generate",model:"llama-2",temperature:"",feedbackUrl:"http://localhost:5001/feedback"},vt={userPrompt:{control:{type:"text"},description:"Specify additional system prompt for model"},apiUrl:{control:{type:"text"},description:"Specify custom API url"},model:{control:{type:"select"},description:"Select model",options:["llama-2"]},temperature:{control:{type:"text"},description:"Specify Model temperature"},feedbackUrl:{control:{type:"text"},description:"Specify API url for feeback buttons"}},j={argTypes:vt,args:yt,parameters:{controls:{expanded:!0},layout:"fullscreen"},render:({apiUrl:a,feedbackUrl:e,userPrompt:t,temperature:n})=>y`
    <div style="height:calc(100vh - 84px);">
      <clabs-chat
        .headerMenuItems="${Se}"
        @on-header-menu-item-selected="${o=>{console.log(o)}}"
        model="llama-2"
        auto-update
        .customLabels="${Ae}"
        ai-slug-content="${_e}"
        user-prompt="${t}"
        enable-feedback-form
        .feedbackDefinitions="${Ee}"
        .dockBoundaries="${bt}"
        api-url="${a}"
        enable-request-cancelling
        feedback-url="${e}"
        temperature="${n||.2}"
        user-name="Owen"
        agent-name="AI Bot">
      </clabs-chat>
    </div>
  `},ft={userName:"user",agentName:"bot",conversation:[{origin:"user",hasError:!1,time:"14:06",index:0,elements:[{content:"Showcase every type of Element available in this Chat component.",type:"text"}]},{text:"",origin:"bot",hasError:!1,time:"14:07",index:1,elements:[{content:`Here is an element of type "img" using the CardElement 
(Picture of a Dahlia from bougs.com):
`,type:"text"},{content:"https://bouqs.com/blog/wp-content/uploads/2019/05/summer-dahlia.jpg",type:"img"},{content:`Here is an element of type "url" using the CardElement 
(Apollo 11 Wikipedia Article):
`,type:"text"},{content:"https://www.wikipedia.org/wiki/Apollo_11",type:"url"},{content:`Here is an element of type "video" using the CardElement 
(Apollo moon landing from Wikimedia):
`,type:"text"},{content:"https://upload.wikimedia.org/wikipedia/commons/transcoded/d/da/Paris_lockdown_-_Vimeo.webm/Paris_lockdown_-_Vimeo.webm.1080p.vp9.webm",type:"video"},{content:`Here is an element of type "table" using the TableElement 
(Seinfeld characters):
`,type:"text"},{content:`Name,Age,Occupation,Location,State
Jerry,35,Comedian,Upper east side,NY
George,35,Unemployed,Queens,NY
Elaine,32,Publisher,Midtown,NY
Kramer,36,Unknown,Upper east side,NY`,type:"table"},{content:`Here is an element of type "code" using the CodeElement 
(Prime function in Python):
`,type:"text"},{content:`from math import sqrt
#prime function to check given number prime or not:
def Prime(number,itr):
	#base condition
	if itr == 1:
		return True
	#if given number divided by itr or not
	if number % itr == 0:
		return False
	#Recursive function Call
	if Prime(number,itr-1) == False:
		return False
	return True
`,type:"code"},{content:`Here is an element of type "error" using the ErrorElement
`,type:"text"},{content:"SEGMENTATION ERROR: Failed to render the content provided. (example)",type:"error"},{content:`Here is an element of type "loading" using the LoadingElement
`,type:"text"},{content:"",type:"loading"},{content:`Here is an element of type "tags" using the TagListElement 
(French philosophers):
`,type:"text"},{content:'["Simone de Beauvoir","René Descartes","Jean-Paul Sartre","Voltaire","Michel Foucault","Albert Camus"]',type:"tags"},{content:`Here is an element of type "list" using the ListElement 
(Top 5 websites):
`,type:"text"},{content:`1. Google.com (United States)
2. YouTube.com (US)
3. Facebook.com (US)
4. Baidu.com (China)
5. Wikipedia.org (US)`,type:"list"},{content:`Here is an element of type "chart" using the ChartElement 
(Gradiented price line of IBMs stock price):
`,type:"text"},{content:`{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"IBM stock price over time.","data":{"values":[{"symbol":"IBM","date":"Jan 1 2000","price":100.52},{"symbol":"IBM","date":"Feb 1 2000","price":92.11},{"symbol":"IBM","date":"Mar 1 2000","price":106.11},{"symbol":"IBM","date":"Apr 1 2000","price":99.95},{"symbol":"IBM","date":"May 1 2000","price":96.31},{"symbol":"IBM","date":"Jun 1 2000","price":98.33},{"symbol":"IBM","date":"Jul 1 2000","price":100.74},{"symbol":"IBM","date":"Aug 1 2000","price":118.62},{"symbol":"IBM","date":"Sep 1 2000","price":101.19},{"symbol":"IBM","date":"Oct 1 2000","price":88.5},{"symbol":"IBM","date":"Nov 1 2000","price":84.12},{"symbol":"IBM","date":"Dec 1 2000","price":76.47},{"symbol":"IBM","date":"Jan 1 2001","price":100.76},{"symbol":"IBM","date":"Feb 1 2001","price":89.98},{"symbol":"IBM","date":"Mar 1 2001","price":86.63},{"symbol":"IBM","date":"Apr 1 2001","price":103.7},{"symbol":"IBM","date":"May 1 2001","price":100.82},{"symbol":"IBM","date":"Jun 1 2001","price":102.35},{"symbol":"IBM","date":"Jul 1 2001","price":94.87},{"symbol":"IBM","date":"Aug 1 2001","price":90.25},{"symbol":"IBM","date":"Sep 1 2001","price":82.82},{"symbol":"IBM","date":"Oct 1 2001","price":97.58},{"symbol":"IBM","date":"Nov 1 2001","price":104.5},{"symbol":"IBM","date":"Dec 1 2001","price":109.36},{"symbol":"IBM","date":"Jan 1 2002","price":97.54},{"symbol":"IBM","date":"Feb 1 2002","price":88.82},{"symbol":"IBM","date":"Mar 1 2002","price":94.15},{"symbol":"IBM","date":"Apr 1 2002","price":75.82},{"symbol":"IBM","date":"May 1 2002","price":72.97},{"symbol":"IBM","date":"Jun 1 2002","price":65.31},{"symbol":"IBM","date":"Jul 1 2002","price":63.86},{"symbol":"IBM","date":"Aug 1 2002","price":68.52},{"symbol":"IBM","date":"Sep 1 2002","price":53.01},{"symbol":"IBM","date":"Oct 1 2002","price":71.76},{"symbol":"IBM","date":"Nov 1 2002","price":79.16},{"symbol":"IBM","date":"Dec 1 2002","price":70.58},{"symbol":"IBM","date":"Jan 1 2003","price":71.22},{"symbol":"IBM","date":"Feb 1 2003","price":71.13},{"symbol":"IBM","date":"Mar 1 2003","price":71.57},{"symbol":"IBM","date":"Apr 1 2003","price":77.47},{"symbol":"IBM","date":"May 1 2003","price":80.48},{"symbol":"IBM","date":"Jun 1 2003","price":75.42},{"symbol":"IBM","date":"Jul 1 2003","price":74.28},{"symbol":"IBM","date":"Aug 1 2003","price":75.12},{"symbol":"IBM","date":"Sep 1 2003","price":80.91},{"symbol":"IBM","date":"Oct 1 2003","price":81.96},{"symbol":"IBM","date":"Nov 1 2003","price":83.08},{"symbol":"IBM","date":"Dec 1 2003","price":85.05},{"symbol":"IBM","date":"Jan 1 2004","price":91.06},{"symbol":"IBM","date":"Feb 1 2004","price":88.7},{"symbol":"IBM","date":"Mar 1 2004","price":84.41},{"symbol":"IBM","date":"Apr 1 2004","price":81.04},{"symbol":"IBM","date":"May 1 2004","price":81.59},{"symbol":"IBM","date":"Jun 1 2004","price":81.19},{"symbol":"IBM","date":"Jul 1 2004","price":80.19},{"symbol":"IBM","date":"Aug 1 2004","price":78.17},{"symbol":"IBM","date":"Sep 1 2004","price":79.13},{"symbol":"IBM","date":"Oct 1 2004","price":82.84},{"symbol":"IBM","date":"Nov 1 2004","price":87.15},{"symbol":"IBM","date":"Dec 1 2004","price":91.16},{"symbol":"IBM","date":"Jan 1 2005","price":86.39},{"symbol":"IBM","date":"Feb 1 2005","price":85.78},{"symbol":"IBM","date":"Mar 1 2005","price":84.66},{"symbol":"IBM","date":"Apr 1 2005","price":70.77},{"symbol":"IBM","date":"May 1 2005","price":70.18},{"symbol":"IBM","date":"Jun 1 2005","price":68.93},{"symbol":"IBM","date":"Jul 1 2005","price":77.53},{"symbol":"IBM","date":"Aug 1 2005","price":75.07},{"symbol":"IBM","date":"Sep 1 2005","price":74.7},{"symbol":"IBM","date":"Oct 1 2005","price":76.25},{"symbol":"IBM","date":"Nov 1 2005","price":82.98},{"symbol":"IBM","date":"Dec 1 2005","price":76.73},{"symbol":"IBM","date":"Jan 1 2006","price":75.89},{"symbol":"IBM","date":"Feb 1 2006","price":75.09},{"symbol":"IBM","date":"Mar 1 2006","price":77.17},{"symbol":"IBM","date":"Apr 1 2006","price":77.05},{"symbol":"IBM","date":"May 1 2006","price":75.04},{"symbol":"IBM","date":"Jun 1 2006","price":72.15},{"symbol":"IBM","date":"Jul 1 2006","price":72.7},{"symbol":"IBM","date":"Aug 1 2006","price":76.35},{"symbol":"IBM","date":"Sep 1 2006","price":77.26},{"symbol":"IBM","date":"Oct 1 2006","price":87.06},{"symbol":"IBM","date":"Nov 1 2006","price":86.95},{"symbol":"IBM","date":"Dec 1 2006","price":91.9},{"symbol":"IBM","date":"Jan 1 2007","price":93.79},{"symbol":"IBM","date":"Feb 1 2007","price":88.18},{"symbol":"IBM","date":"Mar 1 2007","price":89.44},{"symbol":"IBM","date":"Apr 1 2007","price":96.98},{"symbol":"IBM","date":"May 1 2007","price":101.54},{"symbol":"IBM","date":"Jun 1 2007","price":100.25},{"symbol":"IBM","date":"Jul 1 2007","price":105.4},{"symbol":"IBM","date":"Aug 1 2007","price":111.54},{"symbol":"IBM","date":"Sep 1 2007","price":112.6},{"symbol":"IBM","date":"Oct 1 2007","price":111},{"symbol":"IBM","date":"Nov 1 2007","price":100.9},{"symbol":"IBM","date":"Dec 1 2007","price":103.7},{"symbol":"IBM","date":"Jan 1 2008","price":102.75},{"symbol":"IBM","date":"Feb 1 2008","price":109.64},{"symbol":"IBM","date":"Mar 1 2008","price":110.87},{"symbol":"IBM","date":"Apr 1 2008","price":116.23},{"symbol":"IBM","date":"May 1 2008","price":125.14},{"symbol":"IBM","date":"Jun 1 2008","price":114.6},{"symbol":"IBM","date":"Jul 1 2008","price":123.74},{"symbol":"IBM","date":"Aug 1 2008","price":118.16},{"symbol":"IBM","date":"Sep 1 2008","price":113.53},{"symbol":"IBM","date":"Oct 1 2008","price":90.24},{"symbol":"IBM","date":"Nov 1 2008","price":79.65},{"symbol":"IBM","date":"Dec 1 2008","price":82.15},{"symbol":"IBM","date":"Jan 1 2009","price":89.46},{"symbol":"IBM","date":"Feb 1 2009","price":90.32},{"symbol":"IBM","date":"Mar 1 2009","price":95.09},{"symbol":"IBM","date":"Apr 1 2009","price":101.29},{"symbol":"IBM","date":"May 1 2009","price":104.85},{"symbol":"IBM","date":"Jun 1 2009","price":103.01},{"symbol":"IBM","date":"Jul 1 2009","price":116.34},{"symbol":"IBM","date":"Aug 1 2009","price":117},{"symbol":"IBM","date":"Sep 1 2009","price":118.55},{"symbol":"IBM","date":"Oct 1 2009","price":119.54},{"symbol":"IBM","date":"Nov 1 2009","price":125.79},{"symbol":"IBM","date":"Dec 1 2009","price":130.32},{"symbol":"IBM","date":"Jan 1 2010","price":121.85},{"symbol":"IBM","date":"Feb 1 2010","price":127.16},{"symbol":"IBM","date":"Mar 1 2010","price":125.55}]},"transform":[{"filter":"datum.symbol==='IBM'"}],"mark":{"type":"area","line":{"color":"darkgreen"},"color":{"x1":1,"y1":1,"x2":1,"y2":0,"gradient":"linear","stops":[{"offset":0,"color":"white"},{"offset":1,"color":"darkgreen"}]}},"encoding":{"x":{"field":"date","type":"temporal"},"y":{"field":"price","type":"quantitative"}}}`,type:"chart"},{content:`Here is an element of type "chart" using the ChartElement 
(US unemployment):
`,type:"text"},{content:'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"US Unemployment by county","data":{"url":"https://vega.github.io/editor/data/us-10m.json","format":{"type":"topojson","feature":"counties"}},"transform":[{"lookup":"id","from":{"data":{"url":"https://vega.github.io/editor/data/unemployment.tsv"},"key":"id","fields":["rate"]}}],"projection":{"type":"albersUsa"},"mark":"geoshape","encoding":{"color":{"field":"rate","type":"quantitative"}}}',type:"chart"}]}]},Ct={userName:{control:{type:"text"},description:"Specify user name"},agentName:{control:{type:"text"},description:"Specify agent name"},conversation:{control:{type:"object"},description:"Specify message object"}},P={argTypes:Ct,args:ft,parameters:{controls:{expanded:!0},layout:"fullscreen",viewport:{defaultViewport:"storybook-default"}},render:({userName:a,agentName:e,conversation:t})=>y`
    <div style="height:calc(100vh - 84px); overflow:hidden;">
      <clabs-chat
        user-name="${a}"
        agent-name="${e}"
        conversation="${t}">
        <clabs-chat-messages slot="messages" user-name="user" agent-name="bot">
          <clabs-chat-message
            slot="message-items"
            origin="user"
            user-submitted
            time-stamp="9:02"
            index="0">
            <clabs-chat-text
              slot="message-item-content"
              content="Showcase every type of Element available in this Chat component.">
            </clabs-chat-text>
          </clabs-chat-message>

          <clabs-chat-message
            slot="message-items"
            origin="bot"
            time-stamp="9:04"
            index="1">
            <clabs-chat-text
              slot="message-item-content"
              content="This is a textElement, displays text following Carbon design guidelines."></clabs-chat-text>
            <clabs-chat-text
              slot="message-item-content"
              enable-html-rendering
              content="TextElement can also render simple HTML as such:
 <h2>This is using a h2 tag</h2>
"></clabs-chat-text>

            <clabs-chat-text
              slot="message-item-content"
              content="You can also specify a simple slotted div with any content: (Youtube embed example)
"></clabs-chat-text>
            <div slot="message-item-content">
              <iframe
                width="256"
                height="256"
                src="https://www.youtube.com/embed/oSCX78-8-q0?si=kCcIHjehhVn-4PSO"
                title="YouTube video player"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen></iframe>
            </div>

            <clabs-chat-text
              slot="message-item-content"
              content="You can also show files, tables, code, action buttons or lists:"></clabs-chat-text>
            <clabs-chat-card
              slot="message-item-content"
              type="file"
              content="https://arxiv.org/pdf/2312.05688.pdf"></clabs-chat-card>
            <clabs-chat-table
              slot="message-item-content"
              content="Name,Age,Occupation,Location,State
Jerry,35,Comedian,Upper east side,NY
George,35,Unemployed,Queens,NY
Elaine,32,Publisher,Midtown,NY
Kramer,36,Unknown,Upper east side,NY"></clabs-chat-table>

            <clabs-chat-code
              slot="message-item-content"
              content="from math import sqrt
#prime function to check given number prime or not:
def Prime(number,itr):
    #base condition
    if itr == 1:
        return True
    #if given number divided by itr or not
    if number % itr == 0:
        return False
    #Recursive function Call
    if Prime(number,itr-1) == False:
        return False
    return True
"></clabs-chat-code>

            <clabs-chat-tag-list
              slot="message-item-content"
              content='["Simone de Beauvoir","René Descartes","Jean-Paul Sartre","Voltaire","Michel Foucault","Albert Camus"]'></clabs-chat-tag-list>

            <clabs-chat-list
              slot="message-item-content"
              content="1. Google.com (United States)
2. YouTube.com (US)
3. Facebook.com (US)
4. Baidu.com (China)
5. Wikipedia.org (US)"></clabs-chat-list>
            <clabs-chat-text
              slot="message-item-content"
              content="And finally any chart you wish!"></clabs-chat-text>

            <clabs-chat-chart
              container-height="400px"
              slot="message-item-content"
              content='{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"US Unemployment by county","data":{"url":"https://vega.github.io/editor/data/us-10m.json","format":{"type":"topojson","feature":"counties"}},"transform":[{"lookup":"id","from":{"data":{"url":"https://vega.github.io/editor/data/unemployment.tsv"},"key":"id","fields":["rate"]}}],"projection":{"type":"albersUsa"},"mark":"geoshape","encoding":{"color":{"field":"rate","type":"quantitative"}}}'></clabs-chat-chart>
            <clabs-chat-chart
              container-height="600px"
              slot="message-item-content"
              content='{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Deaths by natural disasters","data":{"url":"https://vega.github.io/vega-lite/examples/data/disasters.csv"},"width":600,"height":400,"mark":{"type":"circle","opacity":0.8,"stroke":"black","strokeWidth":1},"encoding":{"x":{"field":"Year","type":"temporal","axis":{"grid":false}},"y":{"field":"Entity","type":"nominal","axis":{"title":""}},"size":{"field":"Deaths","type":"quantitative","title":"Annual Global Deaths","legend":{"clipHeight":30},"scale":{"rangeMax":5000}},"color":{"field":"Entity","type":"nominal","legend":null}}}'></clabs-chat-chart>
            <clabs-chat-chart
              container-height="200px"
              slot="message-item-content"
              content='{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Boxplot example with random data","data":{"values":[{"group":"Group A","value":34},{"group":"Group A","value":28},{"group":"Group A","value":55},{"group":"Group B","value":91},{"group":"Group B","value":81},{"group":"Group B","value":67},{"group":"Group C","value":45},{"group":"Group C","value":66},{"group":"Group C","value":73},{"group":"Group D","value":28},{"group":"Group D","value":35},{"group":"Group D","value":56},{"group":"Group E","value":12},{"group":"Group E","value":45},{"group":"Group E","value":99}]},"mark":"boxplot","encoding":{"y":{"field":"group","type":"nominal"},"x":{"field":"value","type":"quantitative"}}}'></clabs-chat-chart>
            <clabs-chat-chart
              container-height="350px"
              slot="message-item-content"
              content='{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","data":{"url":"https://vega.github.io/vega-lite/data/barley.json"},"mark":"bar","encoding":{"x":{"aggregate":"sum","field":"yield"},"y":{"field":"variety"},"color":{"field":"site"}}}'></clabs-chat-chart>
            <clabs-chat-chart
              container-height="250px"
              slot="message-item-content"
              content='{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Stock prices of 5 Tech Companies over Time.","data":{"url":"https://vega.github.io/vega-lite/examples/data/stocks.csv"},"mark":"line","encoding":{"x":{"field":"date","type":"temporal"},"y":{"field":"price","type":"quantitative"},"color":{"field":"symbol","type":"nominal"}}}'></clabs-chat-chart>
          </clabs-chat-message>
        </clabs-chat-messages>
      </clabs-chat>
    </div>
  `},Me={sampleQuery:"None",queryMode:"Examples",rawText:"Hello, how can I help you?"},J={None:"",ShowAll:"user:Show me examples for the following components in this chat: "+R.map(a=>a[0]).join(", ")+`
bot:`+R.reduce((a,e,t)=>(e[2]==="highlight-text"||e[0]==="error"||e[0]==="loading"||e[0]==="file-upload"||(a+="<b>"+(t+1)+".</b> Here is a <b>&lt;clabs-chat-"+e[0]+"&gt;</b> element"+(e[2]?" of type <i><b>"+e[2]+"</b></i>":"")+":<br/> "+(e[3]?'<span style="font-size:12px;font-style:italic;">'+e[3]+`</span>
`:`
`)+e[1]+`
`),a),""),RandAll:`user:Show me random examples for all components in this chat
bot:`+R.map(a=>({value:a,sort:Math.random()})).sort((a,e)=>a.sort-e.sort).map(({value:a})=>a).reduce((a,e,t)=>(e[2]==="highlight-text"||e[0]==="error"||e[0]==="loading"||e[0]==="file-upload"||(a+="<b>"+(t+1)+".</b> Here is a <b>&lt;clabs-chat-"+e[0]+"&gt;</b> element"+(e[2]?" of type <i><b>"+e[2]+"</b></i>":"")+":<br/> "+(e[3]?'<span style="font-size:12px;font-style:italic;">'+e[3]+`</span>
`:`
`)+e[1]+`
`),a),""),Code:`user:Show me a prime function in Python, a webpage tenplate, a multiline command line and a SQL query:
bot:`+ht.reduce((a,e,t)=>(a+="<b>"+(t+1)+".</b> Here is a <b>&lt;clabs-chat-"+e[0]+"&gt;</b> element"+(e[2]?" of type <i><b>"+e[2]+"</b></i>":"")+":<br/> "+(e[3]?'<span style="font-size:12px;font-style:italic;">'+e[3]+`</span>
`:`
`)+e[1]+`
`,a),""),Formulas:`user:Give me a dozen math formulas as latex strings:
bot:Cauchy-Schwarz Inequality
 \\(\\left( \\sum_{k=1}^n a_k b_k \\right)^{\\!\\!2} \\leq    \\left( \\sum_{k=1}^n a_k^2 \\right) \\left( \\sum_{k=1}^n b_k^2 \\right)\\)
 Maxwell's Equations
 \\(\\begin{align}    \\nabla \\times \\vec{\\mathbf{B}} -\\, \\frac1c\\, \\frac{\\partial\\vec{\\mathbf{E}}}{\\partial t} & = \\frac{4\\pi}{c}\\vec{\\mathbf{j}} \\    \\nabla \\cdot \\vec{\\mathbf{E}} & = 4 \\pi \\rho \\    \\nabla \\times \\vec{\\mathbf{E}}\\, +\\, \\frac1c\\, \\frac{\\partial\\vec{\\mathbf{B}}}{\\partial t} & = \\vec{\\mathbf{0}} \\    \\nabla \\cdot \\vec{\\mathbf{B}} & = 0    \\end{align}\\)
 Rogers-Ramanujan Identity
 \\(1 +  \\frac{q^2}{(1-q)}+\\frac{q^6}{(1-q)(1-q^2)}+\\cdots =    \\prod_{j=0}^{\\infty}\\frac{1}{(1-q^{5j+2})(1-q^{5j+3})},     \\quad\\quad \\text{for $|q| < 1$}.\\)
 Cross Product Formula
 \\(\\mathbf{V}_1 \\times \\mathbf{V}_2 =    \\begin{vmatrix}     \\mathbf{i} & \\mathbf{j} & \\mathbf{k} \\     \\frac{\\partial X}{\\partial u} & \\frac{\\partial Y}{\\partial u} & 0 \\     \\frac{\\partial X}{\\partial v} & \\frac{\\partial Y}{\\partial v} & 0 \\    \\end{vmatrix}\\)
 String Theory Action
 \\( S = -\\frac{1}{2}\\int d^2\\sigma \\sqrt{-h} h^{ab}\\partial_a X^\\mu \\partial_b X^\\mu \\\\ \\frac{1}{4 \\pi \\alpha'} \\int d^2\\sigma \\sqrt{-h} \\left( h^{ab} \\partial_a X^\\mu \\partial_b X_\\mu + \\alpha' R \\Phi(X) \\right  \\\\ [\\alpha_m^\\mu, \\alpha_n^\\nu] = m \\delta_{m+n,0} \\eta^{\\mu \\nu}  \\)
 Custom: Tex stress test
 \\(\\begin{align}    \\int_{0}^{\\infty} e^{-x^2} \\, dx & = \\frac{\\sqrt{\\pi}}{2} \\\\    \\sum_{n=1}^{\\infty} \\frac{1}{n^2} & = \\frac{\\pi^2}{6} \\\\    \\mathbf{A} \\mathbf{x} & = \\left[ \\begin{array}{ccc}        a_{11} & a_{12} & a_{13} \\\\        a_{21} & a_{22} & a_{23} \\\\        a_{31} & a_{32} & a_{33}    \\end{array} \\right]     \\left[ \\begin{array}{c}        x_1 \\\\        x_2 \\\\        x_3    \\end{array} \\right] \\\\    e^{i \\pi} + 1 & = 0 \\\\    \\lim_{x \\to 0} \\frac{\\sin x}{x} & = 1 \\\\    \\left( \\sum_{k=1}^n a_k b_k \\right)^2 & \\leq \\left( \\sum_{k=1}^n a_k^2 \\right) \\left( \\sum_{k=1}^n b_k^2 \\right) \\\\    \\begin{bmatrix}        1 & 2 & 3 \\\\        4 & 5 & 6 \\\\        7 & 8 & 9    \\end{bmatrix}    \\begin{bmatrix}        x \\\\        y \\\\        z    \\end{bmatrix} & =     \\begin{bmatrix}        1 \\cdot x + 2 \\cdot y + 3 \\cdot z \\\\        4 \\cdot x + 5 \\cdot y + 6 \\cdot z \\\\        7 \\cdot x + 8 \\cdot y + 9 \\cdot z    \\end{bmatrix} \\\\    \\frac{d}{dx} \\left( \\frac{1}{x} \\right) & = -\\frac{1}{x^2}\\end{align}\\)
How else can I help you today?`,"List of flowers":`user:Can you give me a list of flower images?

bot:Of course, here is a list of flowers:
Cosmos:
https://bouqs.com/blog/wp-content/uploads/2019/05/20_summer-cosmos.jpg
Dahlia:
https://bouqs.com/blog/wp-content/uploads/2019/05/summer-dahlia.jpg
Zinnia:
https://bouqs.com/blog/wp-content/uploads/2023/06/zinnia-gbcbfedd94_1280.jpg
Chrysanthemum:
https://bouqs.com/blog/wp-content/uploads/2021/09/chrysanthemum-5668882_1280.jpg
Celosia:
https://bouqs.com/blog/wp-content/uploads/2021/09/celosia-7299458_1280.jpg
Sun flower:
https://bouqs.com/blog/wp-content/uploads/2021/05/sunflower-fields.jpg
Snapdragon:
https://bouqs.com/blog/wp-content/uploads/2021/09/snapdragon-20809_1280.jpg
Strawflower:
https://bouqs.com/blog/wp-content/uploads/2021/09/strawflower-362280_1280.jpg
Source:
https://bouqs.com/blog/types-of-flowers-annual-perennial-biennial/`,"Chessboard in HTML/CSS":`user:How do I make a Chessboard in HTML/CSS ?

bot:You can make a chessboard in HTML/CSS by using a table element and applying CSS styling to it. Here is an example of how you can create a chessboard using these methods:
 
HTML:
\`\`\`html
<table>
	<tbody>
		<tr>
			<td class="black"></td>
			<td class="white"></td>
			<td class="black"></td>
			<td class="white"></td>
			<td class="black"></td>
			<td class="white"></td>
			<td class="black"></td>
		</tr>
		<tr>
			<td class="white"></td>
			<td class="black"></td>
			<td class="white"></td>
			<td class="black"></td>
			<td class="white"></td>
			<td class="black"></td>
			<td class="white"></td>
		</tr>
		<tr>
			<td class="black"></td>
			<td class="white"></td>
			<td class="black"></td>
			<td class="white"></td>
			<td class="black"></td>
			<td class="white"></td>
			<td class="black"></td>
		</tr>
		<tr>
			<td class="white"></td>
			<td class="black"></td>
			<td class="white"></td>
			<td class="black"></td>
			<td class="white"></td>
			<td class="black"></td>
			<td class="white"></td>
		</tr>
		<tr>
			<td class="black"></td>
			<td class="white"></td>
			<td class="black"></td>
			<td class="white"></td>
			<td class="black"></td>
			<td class="white"></td>
			<td class="black"></td>
		</tr>
		<tr>
			<td class="white"></td>
			<td class="black"></td>
			<td class="white"></td>
			<td class="black"></td>
			<td class="white"></td>
			<td class="black"></td>
			<td class="white"></td>
		</tr>
		<tr>
			<td class="black"></td>
			<td class="white"></td>
			<td class="black"></td>
			<td class="white"></td>
			<td class="black"></td>
			<td class="white"></td>
			<td class="black"></td>
		</tr>
	</tbody>
</table>
\`\`\`
CSS:
\`\`\`css
table {
	border-collapse: collapse;
}
 
td {
	width: 50px;
	height: 50px;
}
 
.black {
	background-color: #000;
}
 
.white {
	background-color: #fff;
}
\`\`\`
This will create a table with 8 rows and 8 columns, with each cell alternating between black and white. You can adjust the width and height of the cells as needed.
 
Note: The \`border-collapse: collapse;\` property is used to remove the spacing between the table cells.`,"Plain text":`user:Give me the abstract to the IBM Wikipedia article

bot:International Business Machines Corporation (using the trademark IBM), nicknamed Big Blue, is an American multinational technology company headquartered in Armonk, New York and present in over 175 countries. IBM is the largest industrial research organization in the world, with 19 research facilities across a dozen countries, having held the record for most annual U.S. patents generated by a business for 29 consecutive years from 1993 to 2021.
IBM was founded in 1911 as the Computing-Tabulating-Recording Company (CTR), a holding company of manufacturers of record-keeping and measuring systems. It was renamed International Business Machines in 1924 and soon became the leading manufacturer of punch-card tabulating systems. During the 1960s and 1970s, the IBM mainframe, exemplified by the System/360, was the world's dominant computing platform, with the company producing 80 percent of computers in the U.S. and 70 percent of computers worldwide.
IBM entered the microcomputer market in the 1980s with the IBM Personal Computer, which soon became known as PC, one of IBM's best selling products. Due to a lack of foresight by IBM, the PC was not well protected by intellectual property laws. As a consequence, IBM quickly began losing its market dominance to emerging competitors in the PC market, while at the same time the openness of the PC platform has ensured PC's longevity as the most popular microcomputer standard.
Beginning in the 1990s, the company began downsizing its operations and divesting from commodity production, most notably selling its personal computer division to the Lenovo Group in 2005. IBM has since concentrated on computer services, software, supercomputers, and scientific research. Since 2000, its supercomputers have consistently ranked among the most powerful in the world, and in 2001 it became the first company to generate more than 3,000 patents in one year, beating this record in 2008 with over 4,000 patents. As of 2022, the company held 150,000 patents.
As one of the world's oldest and largest technology companies, IBM has been responsible for several technological innovations, including the automated teller machine (ATM), dynamic random-access memory (DRAM), the floppy disk, the hard disk drive, the magnetic stripe card, the relational database, the SQL programming language, and the UPC barcode. The company has made inroads in advanced computer chips, quantum computing, artificial intelligence, and data infrastructure. IBM employees and alumni have won various recognitions for their scientific research and inventions, including six Nobel Prizes and six Turing Awards.
IBM is a publicly traded company and one of 30 companies in the Dow Jones Industrial Average. It is among the world's largest employers, with over 297,900 employees worldwide in 2022. Despite its relative decline within the technology sector, IBM remains the seventh largest technology company by revenue, and 67th largest overall company by revenue in the United States. It is also consistently ranked among the world's most recognizable, valuable, and admired brands.
 Source:
https://en.wikipedia.org/wiki/IBM`,"Annotated text":`user:Who is Abraham Lincoln? Add wikipedia links please.
bot:Abraham Lincoln was an American lawyer, politician, and statesman who served as the 16th [president of the United States](https://en.wikipedia.org/wiki/President_of_the_United_States) from 1861 until his [assassination](https://en.wikipedia.org/wiki/Assassination_of_Abraham_Lincoln) in 1865.
 Lincoln led the United States through the [American Civil War](https://en.wikipedia.org/wiki/American_Civil_War), defending the nation as a constitutional [union](https://en.wikipedia.org/wiki/Union_(American_Civil_War)), defeating the insurgent [Confederacy](https://en.wikipedia.org/wiki/Confederate_States_of_America), playing a major role in the [abolition of slavery](https://en.wikipedia.org/wiki/Abolitionism_in_the_United_States), expanding the power of the [federal government](https://en.wikipedia.org/wiki/Federal_government_of_the_United_States), and modernizing the [U.S. economy](https://en.wikipedia.org/wiki/Economy_of_the_United_States).
Lincoln was born into poverty in a [log cabin](https://en.wikipedia.org/wiki/Log_cabin) in [Kentucky](https://en.wikipedia.org/wiki/Kentucky) and was raised on the [frontier](https://en.wikipedia.org/wiki/American_frontier), mainly in [Indiana](https://en.wikipedia.org/wiki/Indiana).
 He was self-educated and became a lawyer, Whig Party leader, Illinois state legislator, and U.S. representative from Illinois. In 1849, he returned to his successful law practice in Springfield, Illinois.
`,"Moon landing":`user:I'd like to learn about the Apollo 11 moon landing, please provide me a short description, a video of the event and three images.

bot:Apollo 11 (July 16–24, 1969) was the American spaceflight that first landed humans on the Moon.
 Commander Neil Armstrong and Lunar Module Pilot Buzz Aldrin landed the Apollo Lunar Module Eagle on July 20, 1969, at 20:17 UTC, and Armstrong became the first person to step onto the Moon's surface six hours and 39 minutes later, on July 21 at 02:56 UTC.
 Aldrin joined him 19 minutes later, and they spent about two and a quarter hours together exploring the site they had named Tranquility Base upon landing.
 Armstrong and Aldrin collected 47.5 pounds (21.5 kg) of lunar material to bring back to Earth as pilot Michael Collins flew the Command Module Columbia in lunar orbit, and were on the Moon's surface for 21 hours, 36 minutes before lifting off to rejoin Columbia.
 Source:
 https://www.wikipedia.org/wiki/Apollo_11 
 Here is a video of the event:
https://upload.wikimedia.org/wikipedia/commons/transcoded/d/da/Paris_lockdown_-_Vimeo.webm/Paris_lockdown_-_Vimeo.webm.1080p.vp9.webm
 And here are three images from the article cited:
https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Aldrin_Apollo_11_original.jpg/520px-Aldrin_Apollo_11_original.jpg
https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Apollo_11_insignia.png/360px-Apollo_11_insignia.png
 https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Apollo_11_Crew.jpg/440px-Apollo_11_Crew.jpg
 What else can I help you with?`,"Python code with images":`user:Give me a function in python to find if a number is prime, then show me two Ulam spirals and annotate them.

bot:Certainly, here's how to check if a number is prime in Python:
\`\`\`from math import sqrt
#prime function to check given number prime or not:
def Prime(number,itr):
	#base condition
	if itr == 1:
		return True
	#if given number divided by itr or not
	if number % itr == 0:
		return False
	#Recursive function Call
	if Prime(number,itr-1) == False:
		return False
	return True
\`\`\`Source:
https://www.geeksforgeeks.org/python-program-to-check-whether-a-number-is-prime-or-not/
And here some sample images using Prime numbers to display Ulam Spirals taken from Wikipedia:
https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Ulam_spiral_10x.png/402px-Ulam_spiral_10x.png
Ulam spiral of size 201×201. Black dots represent prime numbers. Diagonal, vertical, and horizontal lines with a high density of prime numbers are clearly visible.
https://upload.wikimedia.org/wikipedia/commons/e/e0/Randomly_black_odd_numbers.png
For comparison, a spiral with random odd numbers colored black (at the same density of primes in a 200x200 spiral).

What else may I do for you?`,"Showcase 2":`user:Explain to me how your streaming capabilities work, then give me an example of every component you have available.
bot:<h4>Methodology:</h4>
 data is sent in token by token into the Chat. With each token, the stream is automatically parsed. Blocks are detected depending on a variety of LLM conventions to denote in order:
1. Text blocks with link/annotation markdowns
2. Text blocks containing html components
3. Code blocks delimited by a custom delimiter
4. JSON objects displayed as code
5. Unless they contain $schema then recategorized as charts
6. Array elements containing text or URLs
7. CSV table objects with predefined newline/seperator strings
8. List elements starting with - * or numbered lists (such as this)
9. Molecules defined by a SMILES string
10.URLs of any kind, classified as files/videos/urls/images post-hoc
<h4>Here is a simple piece using the Code component:</h4>
\`\`\`$ npm install --save carbon-components\`\`\`
<h4>Here is text using annotations:</h4>
Abraham Lincoln was an American lawyer, politician, and statesman who served as the 16th [president of the United States](https://en.wikipedia.org/wiki/President_of_the_United_States) from 1861 until his [assassination](https://en.wikipedia.org/wiki/Assassination_of_Abraham_Lincoln) in 1865.
 Lincoln led the United States through the [American Civil War](https://en.wikipedia.org/wiki/American_Civil_War), defending the nation as a constitutional [union](https://en.wikipedia.org/wiki/Union_(American_Civil_War)), defeating the insurgent [Confederacy](https://en.wikipedia.org/wiki/Confederate_States_of_America), playing a major role in the [abolition of slavery](https://en.wikipedia.org/wiki/Abolitionism_in_the_United_States), expanding the power of the [federal government](https://en.wikipedia.org/wiki/Federal_government_of_the_United_States), and modernizing the [U.S. economy](https://en.wikipedia.org/wiki/Economy_of_the_United_States).
Lincoln was born into poverty in a [log cabin](https://en.wikipedia.org/wiki/Log_cabin) in [Kentucky](https://en.wikipedia.org/wiki/Kentucky) and was raised on the [frontier](https://en.wikipedia.org/wiki/American_frontier), mainly in [Indiana](https://en.wikipedia.org/wiki/Indiana).
<b<Here is text multiple annotations:</h4>
Here are [all links available in this article](https://en.wikipedia.org/wiki/President_of_the_United_States,https://en.wikipedia.org/wiki/Assassination_of_Abraham_Lincoln,https://en.wikipedia.org/wiki/American_Civil_War,https://en.wikipedia.org/wiki/Confederate_States_of_America,https://en.wikipedia.org/wiki/Abolitionism_in_the_United_States,https://en.wikipedia.org/wiki/Federal_government_of_the_United_States,https://en.wikipedia.org/wiki/Log_cabin,https://en.wikipedia.org/wiki/Kentucky,https://en.wikipedia.org/wiki/American_frontier,https://en.wikipedia.org/wiki/Indiana)
<h4>Here is an element of type "img" using the Image element (Picture of a Dahlia from bougs.com):</h4>
https://bouqs.com/blog/wp-content/uploads/2019/05/summer-dahlia.jpg
<h4>Here are Card elements of type "url" and "video":</h4>
https://en.wikipedia.org/wiki/Fireworks
https://upload.wikimedia.org/wikipedia/commons/transcoded/d/da/Paris_lockdown_-_Vimeo.webm/Paris_lockdown_-_Vimeo.webm.1080p.vp9.webm
Image Carousel example:
["https://bouqs.com/blog/wp-content/uploads/2019/05/20_summer-cosmos.jpg","https://bouqs.com/blog/wp-content/uploads/2019/05/summer-dahlia.jpg","https://bouqs.com/blog/wp-content/uploads/2023/06/zinnia-gbcbfedd94_1280.jpg","https://bouqs.com/blog/wp-content/uploads/2021/09/chrysanthemum-5668882_1280.jpg","https://bouqs.com/blog/wp-content/uploads/2021/09/celosia-7299458_1280.jpg","https://bouqs.com/blog/wp-content/uploads/2021/05/sunflower-fields.jpg","https://bouqs.com/blog/wp-content/uploads/2021/09/snapdragon-20809_1280.jpg","https://bouqs.com/blog/wp-content/uploads/2021/09/strawflower-362280_1280.jpg"]
<h4>File Carousel example:</h4>
["https://vega.github.io/vega-lite/examples/data/disasters.csv","https://vega.github.io/editor/data/unemployment.tsv","https://vega.github.io/vega-lite/data/barley.json","https://vega.github.io/vega-lite/examples/data/ohlc.json","https://vega.github.io/vega-lite/examples/data/stocks.csv"]
<h4>Video Carousel example:</h4>
["https://upload.wikimedia.org/wikipedia/commons/transcoded/7/7d/Apollo_11._Television_clip_of_Buzz_descending_the_ladder_and_stepping_onto_the_moon%2C_1094228.ogv/Apollo_11._Television_clip_of_Buzz_descending_the_ladder_and_stepping_onto_the_moon%2C_1094228.ogv.360p.webm","https://upload.wikimedia.org/wikipedia/commons/transcoded/6/6c/Polar_orbit.ogv/Polar_orbit.ogv.360p.vp9.webm","https://upload.wikimedia.org/wikipedia/commons/transcoded/d/da/Paris_lockdown_-_Vimeo.webm/Paris_lockdown_-_Vimeo.webm.1080p.vp9.webm"]
<h4>Audio Carousel example:</h4>
["https://upload.wikimedia.org/wikipedia/commons/f/f5/Giovanni_Giuseppe_Cambini_-_Quintet_No._1_in_Bb_major%2C_movement_2.ogg","https://upload.wikimedia.org/wikipedia/commons/2/20/Franz_Liszt_-_Second_Hungarian_Rhapsody.ogg","https://upload.wikimedia.org/wikipedia/commons/b/b6/Johann_Sebastian_Bach_-_Klavierkonzert_d-moll_-_3._Allegro.ogg","https://upload.wikimedia.org/wikipedia/commons/2/25/Schuberts_8th_Symphony%2C_2nd_movement_Andante_con_moto_in_E_major.ogg","https://upload.wikimedia.org/wikipedia/commons/b/b4/Wolfgang_Amadeus_Mozart_-_Klarinettenkonzert_A-Dur_-_1._Allegro.ogg"]
<h4>URL example:</h4>
["https://www.wikipedia.org","https://www.ibm.com","https://www.google.com","https://www.reddit.com","https://www.github.com","https://www.arxiv.org","https://www.archive.org","https://www.instagram.com"]
Cephalostatin-1 in a SMILES format using the molecule component:
CC(C)(O1)C[C@@H](O)[C@@]1(O2)[C@@H](C)[C@@H]3CC=C4[C@]3(C2)C(=O)C[C@H]5[C@H]4CC[C@@H](C6)[C@]5(C)Cc(n7)c6nc(C[C@@]89(C))c7C[C@@H]8CC[C@@H]%10[C@@H]9C[C@@H](O)[C@@]%11(C)C%10=C[C@H](O%12)[C@]%11(O)[C@H](C)[C@]%12(O%13)[C@H](O)C[C@@]%13(C)CO
<h4>Code example:</h4>
\`\`\`\`/**
 * Copyright IBM Corp. 2016, 2023
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";
import { DataTable } from "..";
const {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableHeader,
	TableRow
} = DataTable;
import mdx from "../DataTable.mdx";
import "./datatable-story.scss";
export default {
	title: "Components/DataTable/Basic",
	component: DataTable,
	subcomponents: {
		TableContainer,
		Table,
		TableHead,
		TableRow,
		TableHeader,
		TableBody,
		TableCell
	},
	parameters: {
		docs: {
			page: mdx
		}
	}
};
export const Default = () => {
	const rows = [{
		id: "load-balancer-1",
		name: "Load Balancer 1",
		rule: "Round robin",
		Status: "Starting",
		other: "Test",
		example: "22"
	}, {
		id: "load-balancer-2",
		name: "Load Balancer 2",
		rule: "DNS delegation",
		status: "Active",
		other: "Test",
		example: "22"
	}, {
		id: "load-balancer-3",
		name: "Load Balancer 3",
		rule: "Round robin",
		status: "Disabled",
		other: "Test",
		example: "22"
	}, {
		id: "load-balancer-4",
		name: "Load Balancer 4",
		rule: "Round robin",
		status: "Disabled",
		other: "Test",
		example: "22"
	}, {
		id: "load-balancer-5",
		name: "Load Balancer 5",
		rule: "Round robin",
		status: "Disabled",
		other: "Test",
		example: "22"
	}, {
		id: "load-balancer-6",
		name: "Load Balancer 6",
		rule: "Round robin",
		status: "Disabled",
		other: "Test",
		example: "22"
	}, {
		id: "load-balancer-7",
		name: "Load Balancer 7",
		rule: "Round robin",
		status: "Disabled",
		other: "Test",
		example: "22"
	}];
	const headers = ["Name", "Rule", "Status", "Other", "Example"];
	return <Table size="lg" useZebraStyles={false} aria-label="sample table">
			<TableHead>
				<TableRow>
					{headers.map(header => <TableHeader id={header.key} key={header}>
							{header}
						</TableHeader>)}
				</TableRow>
			</TableHead>
			<TableBody>
				{rows.map(row => <TableRow key={row.id}>
						{Object.keys(row).filter(key => key !== "id").map(key => {
					return <TableCell key={key}>{row[key]}</TableCell>;
				})}
					</TableRow>)}
			</TableBody>
		</Table>;\`\`\`
<h4>Chart component with US map of unemployment:</h4>
{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"US Unemployment by county","data":{"url":"https://vega.github.io/editor/data/us-10m.json","format":{"type":"topojson","feature":"counties"}},"transform":[{"lookup":"id","from":{"data":{"url":"https://vega.github.io/editor/data/unemployment.tsv"},"key":"id","fields":["rate"]}}],"projection":{"type":"albersUsa"},"mark":"geoshape","encoding":{"color":{"field":"rate","type":"quantitative"}}}
Heatmap Chart:
{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","data":{"url":"https://vega.github.io/vega-lite/data/seattle-weather.csv"},"title":"Daily Max Temperatures (C) in Cleveland, OH","config":{"view":{"strokeWidth":0,"step":13},"axis":{"domain":false}},"mark":"rect","encoding":{"x":{"field":"date","timeUnit":"date","type":"ordinal","title":"Day","axis":{"labelAngle":0,"format":"%e"}},"y":{"field":"date","timeUnit":"month","type":"ordinal","title":"Month"},"color":{"field":"temp_max","aggregate":"max","type":"quantitative","legend":{"title":null}}}}
<h4>Bubble Plot chart:</h4>
{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Deaths by natural disasters","data":{"url":"https://vega.github.io/vega-lite/examples/data/disasters.csv"},"width":600,"height":400,"transform":[{"filter":"datum.Entity !== 'All natural disasters'"}],"mark":{"type":"circle","opacity":0.8,"stroke":"black","strokeWidth":1},"encoding":{"x":{"field":"Year","type":"temporal","axis":{"grid":false}},"y":{"field":"Entity","type":"nominal","axis":{"title":""}},"size":{"field":"Deaths","type":"quantitative","title":"Annual Global Deaths","legend":{"clipHeight":30},"scale":{"rangeMax":5000}},"color":{"field":"Entity","type":"nominal","legend":null}}}
<h4>Table example:</h4>
Name,Age,Occupation,Location,State
Jerry,35,Comedian,Upper east side,NY
George,35,Unemployed,Queens,NY
Elaine,32,Publisher,Midtown,NY
Kramer,36,Unknown,Upper east side,NY
What else would you like to see?`,Molecules:"user:Show me 5 molecules and their SMILES string representation:\nbot:Of course, here are the SMILES representations of each item you requested using the MolecularElement Component:\n<b>Bergenin</b>\n```OC[C@@H](O1)[C@@H](O)[C@H](O)[C@@H]2[C@@H]1c3c(O)c(OC)c(O)cc3C(=O)O2```\n<b>custom</b>\n```OC(C(=O)O[C@H]1C[N+]2(CCC0C3=CC=CC=C3)CCC1CC2)(C1=CC=CS1)C1=CC=CS1```\n<b>Cephalostatin-1</b>\n```CC(C)(O1)C[C@@H](O)[C@@]1(O2)[C@@H](C)[C@@H]3CC=C4[C@]3(C2)C(=O)C[C@H]5[C@H]4CC[C@@H](C6)[C@]5(C)Cc(n7)c6nc(C[C@@]89(C))c7C[C@@H]8CC[C@@H]%10[C@@H]9C[C@@H](O)[C@@]%11(C)C%10=C[C@H](O%12)[C@]%11(O)[C@H](C)[C@]%12(O%13)[C@H](O)C[C@@]%13(C)CO```\n<b>Acetate</b>\n```CC(=O)[O-]```\n<b>Benzene (C6H6)</b>\n```C1=CC=CC=C1```\n<b>5-amino-4-methylpentanamide</b>\n```CC(CCC(=O)N)CN```\n<b>Bromobenzene</b>\n```C1=CC=C(C=C1)Br```\n<b>Caffeine</b>\n```CN1C=NC2=C1C(=O)N(C(=O)N2C)C```\n<b>Thyroxine</b>\n```C1=C(C=C(C(=C1I)OC2=CC(=C(C(=C2)I)O)I)I)C[C@@H](C(=O)O)N```\n<b>Cholesterol</b>\n```CC(C)CCCC(C)C1CCC2C1(CCCC2=CC=C3CC4CC(CC(C4)O)C(O)C3(C)C)C```\n<b>Chlorine</b>\n```CCC1=C(C2=NC1=CC3=C(C4=C(C(C(=C4[N-]3)C5=NC(=CC6=NC(=C2)C(=C6C)C=C)C(C5CCC(=O)OCC=C(C)CCCC(C)CCCC(C)CCCC(C)C)C)C(=O)OC)[O-])C)C.[Mg+2]```\n<b>Paclitaxel (Taxol)</b>\n```CC1=C2C(C(=O)C3(C(CC4C(C3C(C(C2(C)C)(CC1OC(=O)C(C(C5=CC=CC=C5)NC(=O)C6=CC=CC=C6)O)O)OC(=O)C7=CC=CC=C7)(CO4)OC(=O)C)O)C)OC(=O)C```\n<b>ATP (Adenosine Triphosphate)</b>\n```C1=NC(=C2C(=N1)N(C=N2)C3C(C(C(O3)COP(=O)(O)OP(=O)(O)OP(=O)(O)O)O)O)N.C1=NC(=C2C(=N1)N(C=N2)C3C(C(C(O3)COP(=O)(O)OP(=O)(O)OP(=O)(O)O)O)O)N```\n<b>Cyclosporine</b>\n```CCC1C(=O)N(CC(=O)N(C(C(=O)NC(C(=O)N(C(C(=O)NC(C(=O)NC(C(=O)N(C(C(=O)N(C(C(=O)N(C(C(=O)N(C(C(=O)N1)C(C(C)CC=CC)O)C)C(C)C)C)CC(C)C)C)CC(C)C)C)C)C)CC(C)C)C)C(C)C)CC(C)C)C)C```\n<b>Vitamin B12</b>\n```CC1=CC2=C(C=C1C)N(C=N2)C3C(C(C(O3)CO)OP(=O)([O-])OC(C)CNC(=O)CCC4(C(C5C6(C(C(C(=C(C7=NC(=CC8=NC(=C(C4=N5)C)C(C8(C)C)CCC(=O)N)C(C7(C)CC(=O)N)CCC(=O)N)C)[N-]6)CCC(=O)N)(C)CC(=O)N)C)CC(=O)N)C)O.[C-]#N.[Co+3]```\n<b>Insulin</b>\n```CCC(C)C1C(=O)NC2CSSCC(C(=O)NC(CSSCC(C(=O)NCC(=O)NC(C(=O)NC(C(=O)NC(C(=O)NC(C(=O)NC(C(=O)NC(C(=O)NC(C(=O)NC(C(=O)NC(C(=O)NC(C(=O)NC(CSSCC(NC(=O)C(NC(=O)C(NC(=O)C(NC(=O)C(NC(=O)C(NC(=O)C(NC(=O)C(NC(=O)C(NC2=O)CO)CC(C)C)CC3=CC=C(C=C3)O)CCC(=O)N)CC(C)C)CCC(=O)O)CC(=O)N)CC4=CC=C(C=C4)O)C(=O)NC(CC(=O)N)C(=O)O)C(=O)NCC(=O)NC(CCC(=O)O)C(=O)NC(CCCNC(=N)N)C(=O)NCC(=O)NC(CC5=CC=CC=C5)C(=O)NC(CC6=CC=CC=C6)C(=O)NC(CC7=CC=C(C=C7)O)C(=O)NC(C(C)O)C(=O)N8CCCC8C(=O)NC(CCCCN)C(=O)NC(C(C)O)C(=O)O)C(C)C)CC(C)C)CC9=CC=C(C=C9)O)CC(C)C)C)CCC(=O)O)C(C)C)CC(C)C)CC2=CNC=N2)CO)NC(=O)C(CC(C)C)NC(=O)C(CC2=CNC=N2)NC(=O)C(CCC(=O)N)NC(=O)C(C(=O)N)NC(=O)C(C(C)C)NC(=O)C(CC2=CC=CC=C2)N)C(=O)NC(C(=O)NC(C(=O)N1)CO)C(C)O)NC(=O)C(CCC(=O)N)NC(=O)C(CCC(=O)O)NC(=O)C(C(C)C)NC(=O)C(C(C)CC)NC(=O)CN```\n",MoreCharts:`user:Show me charts!
bot:<h4>Box Plot</h4>
{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Boxplot example with random data","data":{"values":[{"group":"Group A","value":34},{"group":"Group A","value":28},{"group":"Group A","value":55},{"group":"Group B","value":91},{"group":"Group B","value":81},{"group":"Group B","value":67},{"group":"Group C","value":45},{"group":"Group C","value":66},{"group":"Group C","value":73},{"group":"Group D","value":28},{"group":"Group D","value":35},{"group":"Group D","value":56},{"group":"Group E","value":12},{"group":"Group E","value":45},{"group":"Group E","value":99}]},"mark":"boxplot","encoding":{"y":{"field":"group","type":"nominal"},"x":{"field":"value","type":"quantitative"}}}
<h4>Map</h4>
{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"US Unemployment by county","data":{"url":"https://vega.github.io/editor/data/us-10m.json","format":{"type":"topojson","feature":"counties"}},"transform":[{"lookup":"id","from":{"data":{"url":"https://vega.github.io/editor/data/unemployment.tsv"},"key":"id","fields":["rate"]}}],"projection":{"type":"albersUsa"},"mark":"geoshape","encoding":{"color":{"field":"rate","type":"quantitative"}}}
<h4>Horizontal Multi Bar Chart</h4>
{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","data":{"url":"https://vega.github.io/vega-lite/data/barley.json"},"mark":"bar","encoding":{"x":{"aggregate":"sum","field":"yield"},"y":{"field":"variety"},"color":{"field":"site"}}}
<h4>Heatmap</h4>
{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","data":{"url":"https://vega.github.io/vega-lite/data/seattle-weather.csv"},"title":"Daily Max Temperatures (C) in Cleveland, OH","config":{"view":{"strokeWidth":0,"step":13},"axis":{"domain":false}},"mark":"rect","encoding":{"x":{"field":"date","timeUnit":"date","type":"ordinal","title":"Day","axis":{"labelAngle":0,"format":"%e"}},"y":{"field":"date","timeUnit":"month","type":"ordinal","title":"Month"},"color":{"field":"temp_max","aggregate":"max","type":"quantitative","legend":{"title":null}}}}
<h4>Bubble Plot</h4>
{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Deaths by natural disasters","data":{"url":"https://vega.github.io/vega-lite/examples/data/disasters.csv"},"width":600,"height":400,"transform":[{"filter":"datum.Entity !== 'All natural disasters'"}],"mark":{"type":"circle","opacity":0.8,"stroke":"black","strokeWidth":1},"encoding":{"x":{"field":"Year","type":"temporal","axis":{"grid":false}},"y":{"field":"Entity","type":"nominal","axis":{"title":""}},"size":{"field":"Deaths","type":"quantitative","title":"Annual Global Deaths","legend":{"clipHeight":30},"scale":{"rangeMax":5000}},"color":{"field":"Entity","type":"nominal","legend":null}}}
<h4>Multi-series line chart</h4>
{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Stock prices of 5 Tech Companies over Time.","data":{"url":"https://vega.github.io/vega-lite/examples/data/stocks.csv"},"mark":"line","encoding":{"x":{"field":"date","type":"temporal"},"y":{"field":"price","type":"quantitative"},"color":{"field":"symbol","type":"nominal"}}}
<h4>Stream Graph</h4>
{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","width":300,"height":200,"data":{"url":"https://vega.github.io/vega-lite/data/unemployment-across-industries.json"},"mark":"area","encoding":{"x":{"timeUnit":"yearmonth","field":"date","axis":{"domain":false,"format":"%Y","tickSize":0}},"y":{"aggregate":"sum","field":"count","axis":null,"stack":"center"},"color":{"field":"series","scale":{"scheme":"category20b"}}}}
<h4>`,Charts:`user:Show me charts!
bot:<h4>Box Plot</h4>
{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Boxplot example with random data","data":{"values":[{"group":"Group A","value":34},{"group":"Group A","value":28},{"group":"Group A","value":55},{"group":"Group B","value":91},{"group":"Group B","value":81},{"group":"Group B","value":67},{"group":"Group C","value":45},{"group":"Group C","value":66},{"group":"Group C","value":73},{"group":"Group D","value":28},{"group":"Group D","value":35},{"group":"Group D","value":56},{"group":"Group E","value":12},{"group":"Group E","value":45},{"group":"Group E","value":99}]},"mark":"boxplot","encoding":{"y":{"field":"group","type":"nominal"},"x":{"field":"value","type":"quantitative"}}}
<h4>Map</h4>
{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"US Unemployment by county","data":{"url":"https://vega.github.io/editor/data/us-10m.json","format":{"type":"topojson","feature":"counties"}},"transform":[{"lookup":"id","from":{"data":{"url":"https://vega.github.io/editor/data/unemployment.tsv"},"key":"id","fields":["rate"]}}],"projection":{"type":"albersUsa"},"mark":"geoshape","encoding":{"color":{"field":"rate","type":"quantitative"}}}
<h4>Bar Chart</h4>
{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"A simple bar chart with embedded data","data":{"values":[{"x axis value":"A","y axis value":28000},{"x axis value":"B","y axis value":55000},{"x axis value":"C","y axis value":43000},{"x axis value":"D","y axis value":91000},{"x axis value":"E","y axis value":81000},{"x axis value":"F","y axis value":53000},{"x axis value":"G","y axis value":19000},{"x axis value":"H","y axis value":87000},{"x axis value":"I","y axis value":52000}]},"mark":"bar","encoding":{"x":{"field":"x axis value","type":"nominal","axis":{"labelAngle":0}},"y":{"field":"y axis value","type":"quantitative"}}}
<h4>Horizontal Multi Bar Chart</h4>
{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","data":{"url":"https://vega.github.io/vega-lite/data/barley.json"},"mark":"bar","encoding":{"x":{"aggregate":"sum","field":"yield"},"y":{"field":"variety"},"color":{"field":"site"}}}
<h4>Pie Chart</h4>
{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"Pie chart example","data":{"values":[{"category":"A","value":18},{"category":"B","value":10},{"category":"C","value":2}]},"mark":{"type":"arc","innerRadius":0},"encoding":{"theta":{"field":"value","type":"quantitative"},"color":{"field":"category","type":"nominal"}}}
<h4>Donut Chart</h4>
{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"A simple donut chart with embedded data.","data":{"values":[{"category":1,"value":4},{"category":2,"value":6},{"category":3,"value":10},{"category":4,"value":3},{"category":5,"value":7},{"category":6,"value":8}]},"mark":{"type":"arc","innerRadius":50},"encoding":{"theta":{"field":"value","type":"quantitative"},"color":{"field":"category","type":"nominal"}}}
<h4>Heatmap</h4>
{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","data":{"url":"https://vega.github.io/vega-lite/data/seattle-weather.csv"},"title":"Daily Max Temperatures (C) in Cleveland, OH","config":{"view":{"strokeWidth":0,"step":13},"axis":{"domain":false}},"mark":"rect","encoding":{"x":{"field":"date","timeUnit":"date","type":"ordinal","title":"Day","axis":{"labelAngle":0,"format":"%e"}},"y":{"field":"date","timeUnit":"month","type":"ordinal","title":"Month"},"color":{"field":"temp_max","aggregate":"max","type":"quantitative","legend":{"title":null}}}}
<h4>Scatter Plot</h4>
{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"A scatterplot showing body mass and flipper lengths of penguins.","data":{"url":"https://vega.github.io/vega-lite/examples/data/penguins.json"},"mark":"point","encoding":{"x":{"field":"Flipper Length (mm)","type":"quantitative","scale":{"zero":false}},"y":{"field":"Body Mass (g)","type":"quantitative","scale":{"zero":false}},"color":{"field":"Species","type":"nominal"}}}
<h4>Bubble Plot</h4>
{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Deaths by natural disasters","data":{"url":"https://vega.github.io/vega-lite/examples/data/disasters.csv"},"width":600,"height":400,"transform":[{"filter":"datum.Entity !== 'All natural disasters'"}],"mark":{"type":"circle","opacity":0.8,"stroke":"black","strokeWidth":1},"encoding":{"x":{"field":"Year","type":"temporal","axis":{"grid":false}},"y":{"field":"Entity","type":"nominal","axis":{"title":""}},"size":{"field":"Deaths","type":"quantitative","title":"Annual Global Deaths","legend":{"clipHeight":30},"scale":{"rangeMax":5000}},"color":{"field":"Entity","type":"nominal","legend":null}}}
<h4>Multi-series line chart</h4>
{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Stock prices of 5 Tech Companies over Time.","data":{"url":"https://vega.github.io/vega-lite/examples/data/stocks.csv"},"mark":"line","encoding":{"x":{"field":"date","type":"temporal"},"y":{"field":"price","type":"quantitative"},"color":{"field":"symbol","type":"nominal"}}}
<h4>Candle stick chart</h4>
{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","width":400,"description":"A candlestick chart","data":{"url":"https://vega.github.io/vega-lite/examples/data/ohlc.json"},"encoding":{"x":{"field":"date","type":"temporal","title":"Date in 2009","axis":{"format":"%m/%d","labelAngle":-45,"title":"Date in 2009"}},"y":{"type":"quantitative","scale":{"zero":false},"axis":{"title":"Price"}},"color":{"condition":{"test":"datum.open < datum.close","value":"#06982d"},"value":"#ae1325"}},"layer":[{"mark":"rule","encoding":{"y":{"field":"low"},"y2":{"field":"high"}}},{"mark":"bar","encoding":{"y":{"field":"open"},"y2":{"field":"close"}}}]}
<h4>Orthographic world map</h4>
{"$schema": "https://vega.github.io/schema/vega-lite/v5.json","width": 500,"height": 300,"params": [{"name": "projection","value": "orthographic"}],"data": {"url": "https://vega.github.io/vega-lite/examples/data/world-110m.json","format": {"type": "topojson", "feature": "countries"}},"projection": {"type": {"expr": "projection"}},"mark": {"type": "geoshape", "fill": "lightgray", "stroke": "gray"}}
<h4>Stream Graph</h4>
{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","width":300,"height":200,"data":{"url":"https://vega.github.io/vega-lite/data/unemployment-across-industries.json"},"mark":"area","encoding":{"x":{"timeUnit":"yearmonth","field":"date","axis":{"domain":false,"format":"%Y","tickSize":0}},"y":{"aggregate":"sum","field":"count","axis":null,"stack":"center"},"color":{"field":"series","scale":{"scheme":"category20b"}}}}
<h4>Multi histogram</h4>
{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","repeat":["Horsepower","Miles_per_Gallon","Acceleration","Displacement"],"columns":2,"spec":{"data":{"url":"https://vega.github.io/vega-lite/examples/data/cars.json"},"mark":"bar","encoding":{"x":{"field":{"repeat":"repeat"},"bin":true},"y":{"aggregate":"count"},"color":{"field":"Origin"}}}}
<h4>Interactive multi-scatter plot</h4>
{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","repeat":{"row":["Horsepower","Acceleration","Miles_per_Gallon"],"column":["Miles_per_Gallon","Acceleration","Horsepower"]},"spec":{"data":{"url":"https://vega.github.io/vega-lite/examples/data/cars.json"},"mark":"point","params":[{"name":"brush","select":{"type":"interval","resolve":"union","on":"[pointerdown[event.shiftKey], window:pointerup] > window:pointermove!","translate":"[pointerdown[event.shiftKey], window:pointerup] > window:pointermove!","zoom":"wheel![event.shiftKey]"}},{"name":"grid","select":{"type":"interval","resolve":"global","translate":"[pointerdown[!event.shiftKey], window:pointerup] > window:pointermove!","zoom":"wheel![!event.shiftKey]"},"bind":"scales"}],"encoding":{"x":{"field":{"repeat":"column"},"type":"quantitative"},"y":{"field":{"repeat":"row"},"type":"quantitative","axis":{"minExtent":30}},"color":{"condition":{"param":"brush","field":"Origin","type":"nominal"},"value":"grey"}}}}
`,"Table Test":`user:Give two 10x6 tables with random data
bot:Table 1:
a,b,c,d,e,f,g,h,i,j
1,2,3,4,5,6,7,8,9,10
11,12,13,14,15,16,17,18,19,20
21,22,23,24,25,26,27,28,29
30,31,32,33,34,35,36,37,38,39
40,41,42,43,44,45,46,47,48,49
50,51,52,53,54,55,56,57,58,59
Cars.csv:
Name,Miles_per_Gallon,Cylinders,Displacement,Horsepower,Weight_in_lbs,Acceleration,Year,Origin
chevrolet_chevelle_malibu,18,8,307,130,3504,12,1970-01-01,USA
buick_skylark_320,15,8,350,165,3693,11.5,1970-01-01,USA
plymouth satellite,18,8,318,150,3436,11,1970-01-01,USA
amc rebel sst,16,8,304,150,3433,12,1970-01-01,USA
ford torino,17,8,302,140,3449,10.5,1970-01-01,USA
ford galaxie 500,15,8,429,198,4341,10,1970-01-01,USA
chevrolet impala,14,8,454,220,4354,9,1970-01-01,USA
plymouth fury iii,14,8,440,215,4312,8.5,1970-01-01,USA
pontiac catalina,14,8,455,225,4425,10,1970-01-01,USA
amc ambassador dpl,15,8,390,190,3850,8.5,1970-01-01,USA
citroen ds-21 pallas,null,4,133,115,3090,17.5,1970-01-01,Europe
chevrolet chevelle concours (sw),null,8,350,165,4142,11.5,1970-01-01,USA
ford torino (sw),null,8,351,153,4034,11,1970-01-01,USA
plymouth satellite (sw),null,8,383,175,4166,10.5,1970-01-01,USA
amc rebel sst (sw),null,8,360,175,3850,11,1970-01-01,USA
dodge challenger se,15,8,383,170,3563,10,1970-01-01,USA
plymouth cuda 340,14,8,340,160,3609,8,1970-01-01,USA
ford mustang boss 302,null,8,302,140,3353,8,1970-01-01,USA
chevrolet monte carlo,15,8,400,150,3761,9.5,1970-01-01,USA
buick estate wagon (sw),14,8,455,225,3086,10,1970-01-01,USA
toyota corona mark ii,24,4,113,95,2372,15,1970-01-01,Japan
plymouth duster,22,6,198,95,2833,15.5,1970-01-01,USA
amc hornet,18,6,199,97,2774,15.5,1970-01-01,USA
ford maverick,21,6,200,85,2587,16,1970-01-01,USA
datsun pl510,27,4,97,88,2130,14.5,1970-01-01,Japan
volkswagen 1131 deluxe sedan,26,4,97,46,1835,20.5,1970-01-01,Europe
peugeot 504,25,4,110,87,2672,17.5,1970-01-01,Europe
audi 100 ls,24,4,107,90,2430,14.5,1970-01-01,Europe
saab 99e,25,4,104,95,2375,17.5,1970-01-01,Europe
bmw 2002,26,4,121,113,2234,12.5,1970-01-01,Europe
amc gremlin,21,6,199,90,2648,15,1970-01-01,USA
ford f250,10,8,360,215,4615,14,1970-01-01,USA
chevy c20,10,8,307,200,4376,15,1970-01-01,USA
dodge d200,11,8,318,210,4382,13.5,1970-01-01,USA
hi 1200d,9,8,304,193,4732,18.5,1970-01-01,USA
datsun pl510,27,4,97,88,2130,14.5,1971-01-01,Japan
chevrolet vega 2300,28,4,140,90,2264,15.5,1971-01-01,USA
toyota corona,25,4,113,95,2228,14,1971-01-01,Japan
ford pinto,25,4,98,null,2046,19,1971-01-01,USA
volkswagen super beetle 117,null,4,97,48,1978,20,1971-01-01,Europe
amc gremlin,19,6,232,100,2634,13,1971-01-01,USA
plymouth satellite custom,16,6,225,105,3439,15.5,1971-01-01,USA
chevrolet chevelle malibu,17,6,250,100,3329,15.5,1971-01-01,USA
ford torino 500,19,6,250,88,3302,15.5,1971-01-01,USA
amc matador,18,6,232,100,3288,15.5,1971-01-01,USA
chevrolet impala,14,8,350,165,4209,12,1971-01-01,USA
pontiac catalina brougham,14,8,400,175,4464,11.5,1971-01-01,USA
ford galaxie 500,14,8,351,153,4154,13.5,1971-01-01,USA
plymouth fury iii,14,8,318,150,4096,13,1971-01-01,USA
dodge monaco (sw),12,8,383,180,4955,11.5,1971-01-01,USA
ford country squire (sw),13,8,400,170,4746,12,1971-01-01,USA
pontiac safari (sw),13,8,400,175,5140,12,1971-01-01,USA
amc hornet sportabout (sw),18,6,258,110,2962,13.5,1971-01-01,USA
chevrolet vega (sw),22,4,140,72,2408,19,1971-01-01,USA
pontiac firebird,19,6,250,100,3282,15,1971-01-01,USA
ford mustang,18,6,250,88,3139,14.5,1971-01-01,USA
mercury capri 2000,23,4,122,86,2220,14,1971-01-01,USA
opel 1900,28,4,116,90,2123,14,1971-01-01,Europe
peugeot 304,30,4,79,70,2074,19.5,1971-01-01,Europe
fiat 124b,30,4,88,76,2065,14.5,1971-01-01,Europe
toyota corolla 1200,31,4,71,65,1773,19,1971-01-01,Japan
datsun 1200,35,4,72,69,1613,18,1971-01-01,Japan
volkswagen model 111,27,4,97,60,1834,19,1971-01-01,Europe
plymouth cricket,26,4,91,70,1955,20.5,1971-01-01,USA
toyota corona hardtop,24,4,113,95,2278,15.5,1972-01-01,Japan
dodge colt hardtop,25,4,97.5,80,2126,17,1972-01-01,USA
volkswagen type 3,23,4,97,54,2254,23.5,1972-01-01,Europe
chevrolet vega,20,4,140,90,2408,19.5,1972-01-01,USA
ford pinto runabout,21,4,122,86,2226,16.5,1972-01-01,USA
chevrolet impala,13,8,350,165,4274,12,1972-01-01,USA
pontiac catalina,14,8,400,175,4385,12,1972-01-01,USA
plymouth fury iii,15,8,318,150,4135,13.5,1972-01-01,USA
ford galaxie 500,14,8,351,153,4129,13,1972-01-01,USA
amc ambassador sst,17,8,304,150,3672,11.5,1972-01-01,USA
mercury marquis,11,8,429,208,4633,11,1972-01-01,USA
buick lesabre custom,13,8,350,155,4502,13.5,1972-01-01,USA
oldsmobile delta 88 royale,12,8,350,160,4456,13.5,1972-01-01,USA
chrysler newport royal,13,8,400,190,4422,12.5,1972-01-01,USA
mazda rx2 coupe,19,3,70,97,2330,13.5,1972-01-01,Japan
amc matador (sw),15,8,304,150,3892,12.5,1972-01-01,USA
chevrolet chevelle concours (sw),13,8,307,130,4098,14,1972-01-01,USA
ford gran torino (sw),13,8,302,140,4294,16,1972-01-01,USA
plymouth satellite custom (sw),14,8,318,150,4077,14,1972-01-01,USA
volvo 145e (sw),18,4,121,112,2933,14.5,1972-01-01,Europe
volkswagen 411 (sw),22,4,121,76,2511,18,1972-01-01,Europe
peugeot 504 (sw),21,4,120,87,2979,19.5,1972-01-01,Europe
renault 12 (sw),26,4,96,69,2189,18,1972-01-01,Europe
ford pinto (sw),22,4,122,86,2395,16,1972-01-01,USA
datsun 510 (sw),28,4,97,92,2288,17,1972-01-01,Japan
toyouta corona mark ii (sw),23,4,120,97,2506,14.5,1972-01-01,Japan
dodge colt (sw),28,4,98,80,2164,15,1972-01-01,USA
toyota corolla 1600 (sw),27,4,97,88,2100,16.5,1972-01-01,Japan
buick century 350,13,8,350,175,4100,13,1973-01-01,USA
amc matador,14,8,304,150,3672,11.5,1973-01-01,USA
chevrolet malibu,13,8,350,145,3988,13,1973-01-01,USA
ford gran torino,14,8,302,137,4042,14.5,1973-01-01,USA
dodge coronet custom,15,8,318,150,3777,12.5,1973-01-01,USA
mercury marquis brougham,12,8,429,198,4952,11.5,1973-01-01,USA
chevrolet caprice classic,13,8,400,150,4464,12,1973-01-01,USA
ford ltd,13,8,351,158,4363,13,1973-01-01,USA
plymouth fury gran sedan,14,8,318,150,4237,14.5,1973-01-01,USA
chrysler new yorker brougham,13,8,440,215,4735,11,1973-01-01,USA
buick electra 225 custom,12,8,455,225,4951,11,1973-01-01,USA
amc ambassador brougham,13,8,360,175,3821,11,1973-01-01,USA
plymouth valiant,18,6,225,105,3121,16.5,1973-01-01,USA
chevrolet nova custom,16,6,250,100,3278,18,1973-01-01,USA
amc hornet,18,6,232,100,2945,16,1973-01-01,USA
ford maverick,18,6,250,88,3021,16.5,1973-01-01,USA
plymouth duster,23,6,198,95,2904,16,1973-01-01,USA
volkswagen super beetle,26,4,97,46,1950,21,1973-01-01,Europe
chevrolet impala,11,8,400,150,4997,14,1973-01-01,USA
ford country,12,8,400,167,4906,12.5,1973-01-01,USA
plymouth custom suburb,13,8,360,170,4654,13,1973-01-01,USA
oldsmobile vista cruiser,12,8,350,180,4499,12.5,1973-01-01,USA
amc gremlin,18,6,232,100,2789,15,1973-01-01,USA
toyota carina,20,4,97,88,2279,19,1973-01-01,Japan
chevrolet vega,21,4,140,72,2401,19.5,1973-01-01,USA
datsun 610,22,4,108,94,2379,16.5,1973-01-01,Japan
maxda rx3,18,3,70,90,2124,13.5,1973-01-01,Japan
ford pinto,19,4,122,85,2310,18.5,1973-01-01,USA
mercury capri v6,21,6,155,107,2472,14,1973-01-01,USA
fiat 124 sport coupe,26,4,98,90,2265,15.5,1973-01-01,Europe
chevrolet monte carlo s,15,8,350,145,4082,13,1973-01-01,USA
pontiac grand prix,16,8,400,230,4278,9.5,1973-01-01,USA
fiat 128,29,4,68,49,1867,19.5,1973-01-01,Europe
opel manta,24,4,116,75,2158,15.5,1973-01-01,Europe
audi 100ls,20,4,114,91,2582,14,1973-01-01,Europe
volvo 144ea,19,4,121,112,2868,15.5,1973-01-01,Europe
dodge dart custom,15,8,318,150,3399,11,1973-01-01,USA
saab 99le,24,4,121,110,2660,14,1973-01-01,Europe
toyota mark ii,20,6,156,122,2807,13.5,1973-01-01,Japan
oldsmobile omega,11,8,350,180,3664,11,1973-01-01,USA
plymouth duster,20,6,198,95,3102,16.5,1974-01-01,USA
ford maverick,21,6,200,null,2875,17,1974-01-01,USA
amc hornet,19,6,232,100,2901,16,1974-01-01,USA
chevrolet nova,15,6,250,100,3336,17,1974-01-01,USA
datsun b210,31,4,79,67,1950,19,1974-01-01,Japan
ford pinto,26,4,122,80,2451,16.5,1974-01-01,USA
toyota corolla 1200,32,4,71,65,1836,21,1974-01-01,Japan
chevrolet vega,25,4,140,75,2542,17,1974-01-01,USA
chevrolet chevelle malibu classic,16,6,250,100,3781,17,1974-01-01,USA
amc matador,16,6,258,110,3632,18,1974-01-01,USA
plymouth satellite sebring,18,6,225,105,3613,16.5,1974-01-01,USA
ford gran torino,16,8,302,140,4141,14,1974-01-01,USA
buick century luxus (sw),13,8,350,150,4699,14.5,1974-01-01,USA
dodge coronet custom (sw),14,8,318,150,4457,13.5,1974-01-01,USA
ford gran torino (sw),14,8,302,140,4638,16,1974-01-01,USA
amc matador (sw),14,8,304,150,4257,15.5,1974-01-01,USA
audi fox,29,4,98,83,2219,16.5,1974-01-01,Europe
volkswagen dasher,26,4,79,67,1963,15.5,1974-01-01,Europe
opel manta,26,4,97,78,2300,14.5,1974-01-01,Europe
toyota corona,31,4,76,52,1649,16.5,1974-01-01,Japan
datsun 710,32,4,83,61,2003,19,1974-01-01,Japan
dodge colt,28,4,90,75,2125,14.5,1974-01-01,USA
fiat 128,24,4,90,75,2108,15.5,1974-01-01,Europe
fiat 124 tc,26,4,116,75,2246,14,1974-01-01,Europe
honda civic,24,4,120,97,2489,15,1974-01-01,Japan
subaru,26,4,108,93,2391,15.5,1974-01-01,Japan
fiat x1.9,31,4,79,67,2000,16,1974-01-01,Europe
plymouth valiant custom,19,6,225,95,3264,16,1975-01-01,USA
chevrolet nova,18,6,250,105,3459,16,1975-01-01,USA
mercury monarch,15,6,250,72,3432,21,1975-01-01,USA
ford maverick,15,6,250,72,3158,19.5,1975-01-01,USA
pontiac catalina,16,8,400,170,4668,11.5,1975-01-01,USA
chevrolet bel air,15,8,350,145,4440,14,1975-01-01,USA
plymouth grand fury,16,8,318,150,4498,14.5,1975-01-01,USA
ford ltd,14,8,351,148,4657,13.5,1975-01-01,USA
buick century,17,6,231,110,3907,21,1975-01-01,USA
chevroelt chevelle malibu,16,6,250,105,3897,18.5,1975-01-01,USA
amc matador,15,6,258,110,3730,19,1975-01-01,USA
plymouth fury,18,6,225,95,3785,19,1975-01-01,USA
buick skyhawk,21,6,231,110,3039,15,1975-01-01,USA
chevrolet monza 2+2,20,8,262,110,3221,13.5,1975-01-01,USA
ford mustang ii,13,8,302,129,3169,12,1975-01-01,USA
toyota corolla,29,4,97,75,2171,16,1975-01-01,Japan
ford pinto,23,4,140,83,2639,17,1975-01-01,USA
amc gremlin,20,6,232,100,2914,16,1975-01-01,USA
pontiac astro,23,4,140,78,2592,18.5,1975-01-01,USA
toyota corona,24,4,134,96,2702,13.5,1975-01-01,Japan
volkswagen dasher,25,4,90,71,2223,16.5,1975-01-01,Europe
datsun 710,24,4,119,97,2545,17,1975-01-01,Japan
ford pinto,18,6,171,97,2984,14.5,1975-01-01,USA
volkswagen rabbit,29,4,90,70,1937,14,1975-01-01,Europe
amc pacer,19,6,232,90,3211,17,1975-01-01,USA
audi 100ls,23,4,115,95,2694,15,1975-01-01,Europe
peugeot 504,23,4,120,88,2957,17,1975-01-01,Europe
volvo 244dl,22,4,121,98,2945,14.5,1975-01-01,Europe
saab 99le,25,4,121,115,2671,13.5,1975-01-01,Europe
honda civic cvcc,33,4,91,53,1795,17.5,1975-01-01,Japan
fiat 131,28,4,107,86,2464,15.5,1976-01-01,Europe
opel 1900,25,4,116,81,2220,16.9,1976-01-01,Europe
capri ii,25,4,140,92,2572,14.9,1976-01-01,USA
dodge colt,26,4,98,79,2255,17.7,1976-01-01,USA
renault 12tl,27,4,101,83,2202,15.3,1976-01-01,Europe
chevrolet chevelle malibu classic,17.5,8,305,140,4215,13,1976-01-01,USA
dodge coronet brougham,16,8,318,150,4190,13,1976-01-01,USA
amc matador,15.5,8,304,120,3962,13.9,1976-01-01,USA
ford gran torino,14.5,8,351,152,4215,12.8,1976-01-01,USA
plymouth valiant,22,6,225,100,3233,15.4,1976-01-01,USA
chevrolet nova,22,6,250,105,3353,14.5,1976-01-01,USA
ford maverick,24,6,200,81,3012,17.6,1976-01-01,USA
amc hornet,22.5,6,232,90,3085,17.6,1976-01-01,USA
chevrolet chevette,29,4,85,52,2035,22.2,1976-01-01,USA
chevrolet woody,24.5,4,98,60,2164,22.1,1976-01-01,USA
vw rabbit,29,4,90,70,1937,14.2,1976-01-01,Europe
honda civic,33,4,91,53,1795,17.4,1976-01-01,Japan
dodge aspen se,20,6,225,100,3651,17.7,1976-01-01,USA
ford granada ghia,18,6,250,78,3574,21,1976-01-01,USA
pontiac ventura sj,18.5,6,250,110,3645,16.2,1976-01-01,USA
amc pacer d/l,17.5,6,258,95,3193,17.8,1976-01-01,USA
volkswagen rabbit,29.5,4,97,71,1825,12.2,1976-01-01,Europe
datsun b-210,32,4,85,70,1990,17,1976-01-01,Japan
toyota corolla,28,4,97,75,2155,16.4,1976-01-01,Japan
ford pinto,26.5,4,140,72,2565,13.6,1976-01-01,USA
volvo 245,20,4,130,102,3150,15.7,1976-01-01,Europe
plymouth volare premier v8,13,8,318,150,3940,13.2,1976-01-01,USA
peugeot 504,19,4,120,88,3270,21.9,1976-01-01,Europe
toyota mark ii,19,6,156,108,2930,15.5,1976-01-01,Japan
mercedes-benz 280s,16.5,6,168,120,3820,16.7,1976-01-01,Europe
cadillac seville,16.5,8,350,180,4380,12.1,1976-01-01,USA
chevy c10,13,8,350,145,4055,12,1976-01-01,USA
ford f108,13,8,302,130,3870,15,1976-01-01,USA
dodge d100,13,8,318,150,3755,14,1976-01-01,USA
honda Accelerationord cvcc,31.5,4,98,68,2045,18.5,1977-01-01,Japan
buick opel isuzu deluxe,30,4,111,80,2155,14.8,1977-01-01,USA
renault 5 gtl,36,4,79,58,1825,18.6,1977-01-01,Europe
plymouth arrow gs,25.5,4,122,96,2300,15.5,1977-01-01,USA
datsun f-10 hatchback,33.5,4,85,70,1945,16.8,1977-01-01,Japan
chevrolet caprice classic,17.5,8,305,145,3880,12.5,1977-01-01,USA
oldsmobile cutlass supreme,17,8,260,110,4060,19,1977-01-01,USA
dodge monaco brougham,15.5,8,318,145,4140,13.7,1977-01-01,USA
mercury cougar brougham,15,8,302,130,4295,14.9,1977-01-01,USA
chevrolet concours,17.5,6,250,110,3520,16.4,1977-01-01,USA
buick skylark,20.5,6,231,105,3425,16.9,1977-01-01,USA
plymouth volare custom,19,6,225,100,3630,17.7,1977-01-01,USA
ford granada,18.5,6,250,98,3525,19,1977-01-01,USA
pontiac grand prix lj,16,8,400,180,4220,11.1,1977-01-01,USA
chevrolet monte carlo landau,15.5,8,350,170,4165,11.4,1977-01-01,USA
chrysler cordoba,15.5,8,400,190,4325,12.2,1977-01-01,USA
ford thunderbird,16,8,351,149,4335,14.5,1977-01-01,USA
volkswagen rabbit custom,29,4,97,78,1940,14.5,1977-01-01,Europe
pontiac sunbird coupe,24.5,4,151,88,2740,16,1977-01-01,USA
toyota corolla liftback,26,4,97,75,2265,18.2,1977-01-01,Japan
ford mustang ii 2+2,25.5,4,140,89,2755,15.8,1977-01-01,USA
chevrolet chevette,30.5,4,98,63,2051,17,1977-01-01,USA
dodge colt m/m,33.5,4,98,83,2075,15.9,1977-01-01,USA
subaru dl,30,4,97,67,1985,16.4,1977-01-01,Japan
volkswagen dasher,30.5,4,97,78,2190,14.1,1977-01-01,Europe
datsun 810,22,6,146,97,2815,14.5,1977-01-01,Japan
bmw 320i,21.5,4,121,110,2600,12.8,1977-01-01,Europe
mazda rx-4,21.5,3,80,110,2720,13.5,1977-01-01,Japan
volkswagen rabbit custom diesel,43.1,4,90,48,1985,21.5,1978-01-01,Europe
ford fiesta,36.1,4,98,66,1800,14.4,1978-01-01,USA
mazda glc deluxe,32.8,4,78,52,1985,19.4,1978-01-01,Japan
datsun b210 gx,39.4,4,85,70,2070,18.6,1978-01-01,Japan
honda civic cvcc,36.1,4,91,60,1800,16.4,1978-01-01,Japan
oldsmobile cutlass salon brougham,19.9,8,260,110,3365,15.5,1978-01-01,USA
dodge diplomat,19.4,8,318,140,3735,13.2,1978-01-01,USA
mercury monarch ghia,20.2,8,302,139,3570,12.8,1978-01-01,USA
pontiac phoenix lj,19.2,6,231,105,3535,19.2,1978-01-01,USA
chevrolet malibu,20.5,6,200,95,3155,18.2,1978-01-01,USA
ford fairmont (auto),20.2,6,200,85,2965,15.8,1978-01-01,USA
ford fairmont (man),25.1,4,140,88,2720,15.4,1978-01-01,USA
plymouth volare,20.5,6,225,100,3430,17.2,1978-01-01,USA
amc concord,19.4,6,232,90,3210,17.2,1978-01-01,USA
buick century special,20.6,6,231,105,3380,15.8,1978-01-01,USA
mercury zephyr,20.8,6,200,85,3070,16.7,1978-01-01,USA
dodge aspen,18.6,6,225,110,3620,18.7,1978-01-01,USA
amc concord d/l,18.1,6,258,120,3410,15.1,1978-01-01,USA
chevrolet monte carlo landau,19.2,8,305,145,3425,13.2,1978-01-01,USA
buick regal sport coupe (turbo),17.7,6,231,165,3445,13.4,1978-01-01,USA
ford futura,18.1,8,302,139,3205,11.2,1978-01-01,USA
dodge magnum xe,17.5,8,318,140,4080,13.7,1978-01-01,USA
chevrolet chevette,30,4,98,68,2155,16.5,1978-01-01,USA
toyota corona,27.5,4,134,95,2560,14.2,1978-01-01,Japan
datsun 510,27.2,4,119,97,2300,14.7,1978-01-01,Japan
dodge omni,30.9,4,105,75,2230,14.5,1978-01-01,USA
toyota celica gt liftback,21.1,4,134,95,2515,14.8,1978-01-01,Japan
plymouth sapporo,23.2,4,156,105,2745,16.7,1978-01-01,USA
oldsmobile starfire sx,23.8,4,151,85,2855,17.6,1978-01-01,USA
datsun 200-sx,23.9,4,119,97,2405,14.9,1978-01-01,Japan
audi 5000,20.3,5,131,103,2830,15.9,1978-01-01,Europe
volvo 264gl,17,6,163,125,3140,13.6,1978-01-01,Europe
saab 99gle,21.6,4,121,115,2795,15.7,1978-01-01,Europe
peugeot 604sl,16.2,6,163,133,3410,15.8,1978-01-01,Europe
volkswagen scirocco,31.5,4,89,71,1990,14.9,1978-01-01,Europe
honda Accelerationord lx,29.5,4,98,68,2135,16.6,1978-01-01,Japan
pontiac lemans v6,21.5,6,231,115,3245,15.4,1979-01-01,USA
mercury zephyr 6,19.8,6,200,85,2990,18.2,1979-01-01,USA
ford fairmont 4,22.3,4,140,88,2890,17.3,1979-01-01,USA
amc concord dl 6,20.2,6,232,90,3265,18.2,1979-01-01,USA
dodge aspen 6,20.6,6,225,110,3360,16.6,1979-01-01,USA
chevrolet caprice classic,17,8,305,130,3840,15.4,1979-01-01,USA
ford ltd landau,17.6,8,302,129,3725,13.4,1979-01-01,USA
mercury grand marquis,16.5,8,351,138,3955,13.2,1979-01-01,USA
dodge st. regis,18.2,8,318,135,3830,15.2,1979-01-01,USA
buick estate wagon (sw),16.9,8,350,155,4360,14.9,1979-01-01,USA
ford country squire (sw),15.5,8,351,142,4054,14.3,1979-01-01,USA
chevrolet malibu classic (sw),19.2,8,267,125,3605,15,1979-01-01,USA
chrysler lebaron town @ country (sw),18.5,8,360,150,3940,13,1979-01-01,USA
vw rabbit custom,31.9,4,89,71,1925,14,1979-01-01,Europe
maxda glc deluxe,34.1,4,86,65,1975,15.2,1979-01-01,Japan
dodge colt hatchback custom,35.7,4,98,80,1915,14.4,1979-01-01,USA
amc spirit dl,27.4,4,121,80,2670,15,1979-01-01,USA
mercedes benz 300d,25.4,5,183,77,3530,20.1,1979-01-01,Europe
cadillac eldorado,23,8,350,125,3900,17.4,1979-01-01,USA
peugeot 504,27.2,4,141,71,3190,24.8,1979-01-01,Europe
oldsmobile cutlass salon brougham,23.9,8,260,90,3420,22.2,1979-01-01,USA
plymouth horizon,34.2,4,105,70,2200,13.2,1979-01-01,USA
plymouth horizon tc3,34.5,4,105,70,2150,14.9,1979-01-01,USA
datsun 210,31.8,4,85,65,2020,19.2,1979-01-01,Japan
fiat strada custom,37.3,4,91,69,2130,14.7,1979-01-01,Europe
buick skylark limited,28.4,4,151,90,2670,16,1979-01-01,USA
chevrolet citation,28.8,6,173,115,2595,11.3,1979-01-01,USA
oldsmobile omega brougham,26.8,6,173,115,2700,12.9,1979-01-01,USA
pontiac phoenix,33.5,4,151,90,2556,13.2,1979-01-01,USA
vw rabbit,41.5,4,98,76,2144,14.7,1980-01-01,Europe
toyota corolla tercel,38.1,4,89,60,1968,18.8,1980-01-01,Japan
chevrolet chevette,32.1,4,98,70,2120,15.5,1980-01-01,USA
datsun 310,37.2,4,86,65,2019,16.4,1980-01-01,Japan
chevrolet citation,28,4,151,90,2678,16.5,1980-01-01,USA
ford fairmont,26.4,4,140,88,2870,18.1,1980-01-01,USA
amc concord,24.3,4,151,90,3003,20.1,1980-01-01,USA
dodge aspen,19.1,6,225,90,3381,18.7,1980-01-01,USA
audi 4000,34.3,4,97,78,2188,15.8,1980-01-01,Europe
toyota corona liftback,29.8,4,134,90,2711,15.5,1980-01-01,Japan
mazda 626,31.3,4,120,75,2542,17.5,1980-01-01,Japan
datsun 510 hatchback,37,4,119,92,2434,15,1980-01-01,Japan
toyota corolla,32.2,4,108,75,2265,15.2,1980-01-01,Japan
mazda glc,46.6,4,86,65,2110,17.9,1980-01-01,Japan
dodge colt,27.9,4,156,105,2800,14.4,1980-01-01,USA
datsun 210,40.8,4,85,65,2110,19.2,1980-01-01,Japan
vw rabbit c (diesel),44.3,4,90,48,2085,21.7,1980-01-01,Europe
vw dasher (diesel),43.4,4,90,48,2335,23.7,1980-01-01,Europe
audi 5000s (diesel),36.4,5,121,67,2950,19.9,1980-01-01,Europe
mercedes-benz 240d,30,4,146,67,3250,21.8,1980-01-01,Europe
honda civic 1500 gl,44.6,4,91,67,1850,13.8,1980-01-01,Japan
renault lecar deluxe,40.9,4,85,null,1835,17.3,1980-01-01,Europe
subaru dl,33.8,4,97,67,2145,18,1980-01-01,Japan
vokswagen rabbit,29.8,4,89,62,1845,15.3,1980-01-01,Europe
datsun 280-zx,32.7,6,168,132,2910,11.4,1980-01-01,Japan
mazda rx-7 gs,23.7,3,70,100,2420,12.5,1980-01-01,Japan
triumph tr7 coupe,35,4,122,88,2500,15.1,1980-01-01,Europe
ford mustang cobra,23.6,4,140,null,2905,14.3,1980-01-01,USA
honda Accelerationord,32.4,4,107,72,2290,17,1980-01-01,Japan
plymouth reliant,27.2,4,135,84,2490,15.7,1982-01-01,USA
buick skylark,26.6,4,151,84,2635,16.4,1982-01-01,USA
dodge aries wagon (sw),25.8,4,156,92,2620,14.4,1982-01-01,USA
chevrolet citation,23.5,6,173,110,2725,12.6,1982-01-01,USA
plymouth reliant,30,4,135,84,2385,12.9,1982-01-01,USA
toyota starlet,39.1,4,79,58,1755,16.9,1982-01-01,Japan
plymouth champ,39,4,86,64,1875,16.4,1982-01-01,USA
honda civic 1300,35.1,4,81,60,1760,16.1,1982-01-01,Japan
subaru,32.3,4,97,67,2065,17.8,1982-01-01,Japan
datsun 210,37,4,85,65,1975,19.4,1982-01-01,Japan
toyota tercel,37.7,4,89,62,2050,17.3,1982-01-01,Japan
mazda glc 4,34.1,4,91,68,1985,16,1982-01-01,Japan
plymouth horizon 4,34.7,4,105,63,2215,14.9,1982-01-01,USA
ford escort 4w,34.4,4,98,65,2045,16.2,1982-01-01,USA
ford escort 2h,29.9,4,98,65,2380,20.7,1982-01-01,USA
volkswagen jetta,33,4,105,74,2190,14.2,1982-01-01,Europe
renault 18i,34.5,4,100,null,2320,15.8,1982-01-01,Europe
honda prelude,33.7,4,107,75,2210,14.4,1982-01-01,Japan
toyota corolla,32.4,4,108,75,2350,16.8,1982-01-01,Japan
datsun 200sx,32.9,4,119,100,2615,14.8,1982-01-01,Japan
mazda 626,31.6,4,120,74,2635,18.3,1982-01-01,Japan
peugeot 505s turbo diesel,28.1,4,141,80,3230,20.4,1982-01-01,Europe
saab 900s,null,4,121,110,2800,15.4,1982-01-01,Europe
volvo diesel,30.7,6,145,76,3160,19.6,1982-01-01,Europe
toyota cressida,25.4,6,168,116,2900,12.6,1982-01-01,Japan
datsun 810 maxima,24.2,6,146,120,2930,13.8,1982-01-01,Japan
buick century,22.4,6,231,110,3415,15.8,1982-01-01,USA
oldsmobile cutlass ls,26.6,8,350,105,3725,19,1982-01-01,USA
ford granada gl,20.2,6,200,88,3060,17.1,1982-01-01,USA
chrysler lebaron salon,17.6,6,225,85,3465,16.6,1982-01-01,USA
chevrolet cavalier,28,4,112,88,2605,19.6,1982-01-01,USA
chevrolet cavalier wagon,27,4,112,88,2640,18.6,1982-01-01,USA
chevrolet cavalier 2-door,34,4,112,88,2395,18,1982-01-01,USA
pontiac j2000 se hatchback,31,4,112,85,2575,16.2,1982-01-01,USA
dodge aries se,29,4,135,84,2525,16,1982-01-01,USA
pontiac phoenix,27,4,151,90,2735,18,1982-01-01,USA
ford fairmont futura,24,4,140,92,2865,16.4,1982-01-01,USA
amc concord dl,23,4,151,null,3035,20.5,1982-01-01,USA
volkswagen rabbit l,36,4,105,74,1980,15.3,1982-01-01,Europe
mazda glc custom l,37,4,91,68,2025,18.2,1982-01-01,Japan
mazda glc custom,31,4,91,68,1970,17.6,1982-01-01,Japan
plymouth horizon miser,38,4,105,63,2125,14.7,1982-01-01,USA
mercury lynx l,36,4,98,70,2125,17.3,1982-01-01,USA
nissan stanza xe,36,4,120,88,2160,14.5,1982-01-01,Japan
honda Accelerationord,36,4,107,75,2205,14.5,1982-01-01,Japan
toyota corolla,34,4,108,70,2245,16.9,1982-01-01,Japan
honda civic,38,4,91,67,1965,15,1982-01-01,Japan
honda civic (auto),32,4,91,67,1965,15.7,1982-01-01,Japan
datsun 310 gx,38,4,91,67,1995,16.2,1982-01-01,Japan
buick century limited,25,6,181,110,2945,16.4,1982-01-01,USA
oldsmobile cutlass ciera (diesel),38,6,262,85,3015,17,1982-01-01,USA
chrysler lebaron medallion,26,4,156,92,2585,14.5,1982-01-01,USA
ford granada l,22,6,232,112,2835,14.7,1982-01-01,USA
toyota celica gt,32,4,144,96,2665,13.9,1982-01-01,Japan
dodge charger 2.2,36,4,135,84,2370,13,1982-01-01,USA
chevrolet camaro,27,4,151,90,2950,17.3,1982-01-01,USA
ford mustang gl,27,4,140,86,2790,15.6,1982-01-01,USA
vw pickup,44,4,97,52,2130,24.6,1982-01-01,Europe
dodge rampage,32,4,135,84,2295,11.6,1982-01-01,USA
ford ranger,28,4,120,79,2625,18.6,1982-01-01,USA
chevy s-10,31,4,119,82,2720,19.4,1982-01-01,USA
`,"Lists Test":`user:Show me lists of random countries in any format an LLM can return.
1.Canada
2.Zimbabwe
3.Qatar
4.New-zealand
- Kenya
- Morrocco
- Iceland
- Laos
- Fiji
`,"Carousel Test":`user:Show me some carousels:
bot:Here are some carousel elements:
["https://bouqs.com/blog/wp-content/uploads/2019/05/20_summer-cosmos.jpg","https://bouqs.com/blog/wp-content/uploads/2019/05/summer-dahlia.jpg","https://bouqs.com/blog/wp-content/uploads/2023/06/zinnia-gbcbfedd94_1280.jpg","https://bouqs.com/blog/wp-content/uploads/2021/09/chrysanthemum-5668882_1280.jpg","https://bouqs.com/blog/wp-content/uploads/2021/09/celosia-7299458_1280.jpg","https://bouqs.com/blog/wp-content/uploads/2021/05/sunflower-fields.jpg","https://bouqs.com/blog/wp-content/uploads/2021/09/snapdragon-20809_1280.jpg","https://bouqs.com/blog/wp-content/uploads/2021/09/strawflower-362280_1280.jpg"]
["https://vega.github.io/vega-lite/examples/data/disasters.csv","https://vega.github.io/editor/data/unemployment.tsv","https://vega.github.io/vega-lite/data/barley.json","https://vega.github.io/vega-lite/examples/data/ohlc.json","https://vega.github.io/vega-lite/examples/data/stocks.csv"]
["https://upload.wikimedia.org/wikipedia/commons/transcoded/7/7d/Apollo_11._Television_clip_of_Buzz_descending_the_ladder_and_stepping_onto_the_moon%2C_1094228.ogv/Apollo_11._Television_clip_of_Buzz_descending_the_ladder_and_stepping_onto_the_moon%2C_1094228.ogv.360p.webm","https://upload.wikimedia.org/wikipedia/commons/transcoded/6/6c/Polar_orbit.ogv/Polar_orbit.ogv.360p.vp9.webm","https://upload.wikimedia.org/wikipedia/commons/transcoded/d/da/Paris_lockdown_-_Vimeo.webm/Paris_lockdown_-_Vimeo.webm.1080p.vp9.webm"]
["https://upload.wikimedia.org/wikipedia/commons/f/f5/Giovanni_Giuseppe_Cambini_-_Quintet_No._1_in_Bb_major%2C_movement_2.ogg","https://upload.wikimedia.org/wikipedia/commons/2/20/Franz_Liszt_-_Second_Hungarian_Rhapsody.ogg","https://upload.wikimedia.org/wikipedia/commons/b/b6/Johann_Sebastian_Bach_-_Klavierkonzert_d-moll_-_3._Allegro.ogg","https://upload.wikimedia.org/wikipedia/commons/2/25/Schuberts_8th_Symphony%2C_2nd_movement_Andante_con_moto_in_E_major.ogg","https://upload.wikimedia.org/wikipedia/commons/b/b4/Wolfgang_Amadeus_Mozart_-_Klarinettenkonzert_A-Dur_-_1._Allegro.ogg"]
["https://bouqs.com/blog/wp-content/uploads/2019/05/20_summer-cosmos.jpg","https://vega.github.io/vega-lite/examples/data/disasters.csv","https://upload.wikimedia.org/wikipedia/commons/transcoded/7/7d/Apollo_11._Television_clip_of_Buzz_descending_the_ladder_and_stepping_onto_the_moon%2C_1094228.ogv/Apollo_11._Television_clip_of_Buzz_descending_the_ladder_and_stepping_onto_the_moon%2C_1094228.ogv.360p.webm","https://upload.wikimedia.org/wikipedia/commons/f/f5/Giovanni_Giuseppe_Cambini_-_Quintet_No._1_in_Bb_major%2C_movement_2.ogg"]
`},Oe={sampleQuery:{control:{type:"select"},description:"Premade rawText",options:Object.keys(J)},queryMode:{control:{type:"select"},description:"Select mode",options:["Examples","Custom"]},rawText:{control:{type:"text"},description:"Render with a raw LLM string"}},D={argTypes:Oe,args:Me,parameters:{controls:{expanded:!0},layout:"fullscreen",viewport:{defaultViewport:"storybook-default"}},render:({queryMode:a,sampleQuery:e,rawText:t})=>y`
    <div
      style="height:calc(100vh - 84px); overflow:hidden; display:inline-flex; width:100%;">
      <div style="height:calc(100vh - 84px); flex:2;">
        ${a=="Examples"?y` <clabs-chat
              sample-query="${J[e]}"
              user-name="user"
              agent-name="bot">
            </clabs-chat>`:y` <clabs-chat
              sample-query="${t}"
              user-name="user"
              agent-name="bot">
            </clabs-chat>`}
      </div>
      ${e!=="None"&&a=="Examples"?y`
            <div
              style="height:calc(100vh - 84px); width:400px; padding-left:20px;overflow-y:auto;">
              <h4>Raw LLM text</h4>
              <cds-code-snippet
                wrap-text
                minCollapsedNumberOfRows=${200}
                type="multi"
                >${J[e]}</cds-code-snippet
              >
            </div>
          `:y``}
    </div>
  `},F={argTypes:Oe,args:Me,parameters:{controls:{expanded:!0},layout:"fullscreen",viewport:{defaultViewport:"storybook-default"}},render:({queryMode:a,sampleQuery:e,rawText:t})=>y`
    <div
      style="height:calc(100vh - 44px); display:flex; max-width:100%; overflow:hidden; gap:20px;">
      <div style="flex:2;">
        ${a=="Examples"?y` <clabs-chat
              sample-query="${J[e]}"
              user-name="user"
              stream-responses
              default-viewing-mode="fullscreen"
              agent-name="bot">
            </clabs-chat>`:y` <clabs-chat
              sample-query="${t}"
              user-name="user"
              stream-responses
              default-viewing-mode="fullscreen"
              agent-name="bot">
            </clabs-chat>`}
      </div>
      ${e==="None"&&a=="Examples"?y`
            <div style="width:400px; overflow-y:auto;">
              <h4>Raw LLM text</h4>
              <cds-code-snippet
                wrap-text
                minCollapsedNumberOfRows=${200}
                type="multi"
                >${J[e]}</cds-code-snippet
              >
            </div>
          `:y``}
    </div>
  `},xt={testMode:"Examples",sampleConversation:"ShowAll",conversationJSON:[]},wt={testMode:{control:{type:"select"},description:"Select mode",options:["Examples","Custom"]},sampleConversation:{control:{type:"select"},description:"Premade conversation objects",options:["ShowAll","None","Chart creation","Molecules","Conversation tutorial","Nature of art","Flowers","Visualization","Cloud","Diagrams"]},conversationJSON:{control:{type:"object"},description:"JSON conversation"}},ae={ShowAll:[{origin:"user",hasError:!1,time:"16:51",index:0,elements:[{type:"text",content:"Show me examples for the following components in this chat: "+R.map(a=>a[0]).join(", ")}]},{origin:"bot",hasError:!1,time:"16:55",index:1,elements:R.reduce((a,e,t)=>(e[0]!=="diagram"&&(a.push({type:"html-text",content:"<b>"+(t+1)+".</b> Here is a <b>&lt;clabs-chat-"+e[0]+"&gt;</b> element"+(e[2]?" of type <i><b>"+e[2]+"</b></i>":"")+":"+(e[3]?'<br/><span style="font-size:12px;font-style:italic;">'+e[3]+"</span>":"")}),a.push({type:e[2]?e[2]:e[0],content:e[1]})),a),[])}],"Conversation tutorial":[{origin:"bot",hasError:!1,time:"16:51",index:0,elements:[{type:"text",content:`Welcome!
Here's how to make a JSON conversation object to display data in this Chat component.
Here is an example of a message object:`},{type:"code",content:`{
	//bot or user name specified in Chat parent component
	origin: "user",
	//list of sub-elements to display inside the message
	elements: [
		//render a plain text element
		{ type: "text", content: "Generate images like so:"},
		//then a code block
		{ type: "code", content: "func(){...}"},
		//then another text message
		{ type: "text", content: "Here is an example image:"},
		//then an image Card
		{ type: "img", content: "http://www.site.org/image.png"},
		//more text
		{ type: "text", content: "Source:"},
		//then a URL Card
		{ type: "url", content: "http://www.site.org/tutorial"},
	],
	//timeStamp of message (default: auto-generated)
	time: "10:08am",
	//remove interaction buttons (default: false)
	disableButtons: false,
	//remove interaction buttons (default: user/bot name)
	displayName: "Watsonx",
	//rank in message order (default: auto-generated)
	index: 0
}`},{type:"text",content:"Each item in elements will invoke and render a corresponding component. Here are all the sub-elements available to display:"},{type:"table",content:`Component,Type,Auto-detection
Text,text,Any normal text
Image,img,URLs ending in png/jpeg/bmp/...
Card (video),video,URLs ending in mp4/webm/mov/...
Card (file),file,URLs/paths ending in csv/pdf/xls/...
Card (url),url,URLs ending in com/org/net/...
Table,table,Csv-type text using commas and linebreaks
Code,code,Text between a predefined delimiter
Carousel,carousel,Array of image URLs
TagList,tags,Array of any non-image text
List,list,Text blocks with any markers like bullets/numbers
Text,html-text,valid closed HTML markers included
Text,annotated-text,markdowns with such as [link](http://..)
LinkList,link-list,multi-link markdowns
Chart,chart,JSON object beginning with {"$schema"...
Formula,formula,Code with Tex markdown markers
Error,error,Error text
Molecule,molecule,code block with \`\`\` and SMILES strings
Loading,loading,None (empty)
EditableText,editable-text,Any text`},{type:"text",content:"If unspecified, rawText can be used to auto-generate the sub-elements:"},{type:"code",content:`{
	//message originator
	origin: "bot",
	//raw text string to be parsed:
	rawText: "Generated image: http://www.host.com/image.png Source: http://www.site.org",
}`},{type:"text",content:"Which results in:"},{type:"code",content:`{
	origin: "bot",
	elements: [
		{ type: "text", content: "Generated image:"},
		{ type: "img", content: "http://www.host.com/image.png"},
		{ type: "text", content: "Source:"},
		{ type: "url", content: "http://www.site.org"},
}`},{type:"text",content:`If both are specified, elements will always supercede rawText
`}]}],Cloud:[{origin:"user",hasError:!1,time:"14:06",index:0,elements:[{content:"Showcase every type of Element available in this Chat component.",type:"text"}]},{text:"",origin:"bot",hasError:!1,time:"14:07",index:1,elements:[{content:"Here is your answer",type:"text"},{content:`\`\`\`<clabs-chat 
	user-name="Owen" 
	agent-name="Watson"
	conversation={conversationJSON}
	stream-responses={streamEnabled}
	loading={loading}
	default-viewing-mode="docked"
	on:on-user-message-update-request={handleUpdatedMessage}
	on:on-user-regeneration-request={handleRegeneration}
	on:on-user-text-input={handleNewMessage}
	on:on-message-element-selected={handleElementClicked}
	on:on-user-feedback-request={handleUserFeedback}
	on:on-message-element-tag-selected={handleTagClicked}>
</clabs-chat>\`\`\``,type:"code"},{content:"Here are the sources:",type:"text"},{content:"[IBM Cloud Home](https://www.ibm.com/cloud),[Cloud Solutions](https://www.ibm.com/cloud/solutions),[Cloud products](https://www.ibm.com/cloud/products),[Cloud Docs](https://cloud.ibm.com/docs)",type:"link-list"}]},{origin:"user",hasError:!1,time:"14:06",index:0,elements:[{content:"ok cool now more examples",type:"text"}]},{text:"",origin:"bot",hasError:!1,time:"14:07",index:1,elements:[{content:"Here is your answer",type:"text"},{content:`from math import sqrt
#prime function to check given number prime or not:
def Prime(number,itr):
	#base condition
	if itr == 1:
		return True
	#if given number divided by itr or not
	if number % itr == 0:
		return False
	#Recursive function Call
	if Prime(number,itr-1) == False:
		return False
	return True
`,type:"code"}]}],Molecules:[{origin:"user",hasError:!1,time:"3:51",index:0,elements:[{content:"Give me the SMILES string for bergenin, cephalostatin-1, acetate, benzene, 5-amino-4-methylpentanamide, bromobenzene, caffeine, thyroxine, cholesterol, chlorine, taxol, ATP, cyclosporine, vit B12, insulin",type:"text"}]},{origin:"bot",hasError:!1,time:"3:54",index:1,elements:[{content:"<b>Bergenin</b>",type:"html-text"},{content:"OC[C@@H](O1)[C@@H](O)[C@H](O)[C@@H]2[C@@H]1c3c(O)c(OC)c(O)cc3C(=O)O2",type:"molecule"},{content:"<b>Cephalostatin-1</b>",type:"html-text"},{content:"CC(C)(O1)C[C@@H](O)[C@@]1(O2)[C@@H](C)[C@@H]3CC=C4[C@]3(C2)C(=O)C[C@H]5[C@H]4CC[C@@H](C6)[C@]5(C)Cc(n7)c6nc(C[C@@]89(C))c7C[C@@H]8CC[C@@H]%10[C@@H]9C[C@@H](O)[C@@]%11(C)C%10=C[C@H](O%12)[C@]%11(O)[C@H](C)[C@]%12(O%13)[C@H](O)C[C@@]%13(C)CO",type:"molecule"},{content:"<b>Acetate</b>",type:"html-text"},{content:"CC(=O)[O-]",type:"molecule"},{content:"<b>Benzene (C6H6)</b>",type:"html-text"},{content:"C1=CC=CC=C1",type:"molecule"},{content:"<b>5-amino-4-methylpentanamide</b>",type:"html-text"},{content:"CC(CCC(=O)N)CN",type:"molecule"},{content:"<b>Bromobenzene</b>",type:"html-text"},{content:"C1=CC=C(C=C1)Br",type:"molecule"},{content:"<b>Caffeine</b>",type:"html-text"},{content:"CN1C=NC2=C1C(=O)N(C(=O)N2C)C",type:"molecule"},{content:"<b>Thyroxine</b>",type:"html-text"},{content:"C1=C(C=C(C(=C1I)OC2=CC(=C(C(=C2)I)O)I)I)C[C@@H](C(=O)O)N",type:"molecule"},{content:"<b>Cholesterol</b>",type:"html-text"},{content:"CC(C)CCCC(C)C1CCC2C1(CCCC2=CC=C3CC4CC(CC(C4)O)C(O)C3(C)C)C",type:"molecule"},{content:"<b>Chlorine</b>",type:"html-text"},{content:"CCC1=C(C2=NC1=CC3=C(C4=C(C(C(=C4[N-]3)C5=NC(=CC6=NC(=C2)C(=C6C)C=C)C(C5CCC(=O)OCC=C(C)CCCC(C)CCCC(C)CCCC(C)C)C)C(=O)OC)[O-])C)C.[Mg+2]",type:"molecule"},{content:"<b>Paclitaxel (Taxol)</b>",type:"html-text"},{content:"CC1=C2C(C(=O)C3(C(CC4C(C3C(C(C2(C)C)(CC1OC(=O)C(C(C5=CC=CC=C5)NC(=O)C6=CC=CC=C6)O)O)OC(=O)C7=CC=CC=C7)(CO4)OC(=O)C)O)C)OC(=O)C",type:"molecule"},{content:"<b>ATP (Adenosine Triphosphate)</b>",type:"html-text"},{content:"C1=NC(=C2C(=N1)N(C=N2)C3C(C(C(O3)COP(=O)(O)OP(=O)(O)OP(=O)(O)O)O)O)N.C1=NC(=C2C(=N1)N(C=N2)C3C(C(C(O3)COP(=O)(O)OP(=O)(O)OP(=O)(O)O)O)O)N",type:"molecule"},{content:"<b>Cyclosporine</b>",type:"html-text"},{content:"CCC1C(=O)N(CC(=O)N(C(C(=O)NC(C(=O)N(C(C(=O)NC(C(=O)NC(C(=O)N(C(C(=O)N(C(C(=O)N(C(C(=O)N(C(C(=O)N1)C(C(C)CC=CC)O)C)C(C)C)C)CC(C)C)C)CC(C)C)C)C)C)CC(C)C)C)C(C)C)CC(C)C)C)C",type:"molecule"},{content:"<b>Vitamin B12</b>",type:"html-text"},{content:"CC1=CC2=C(C=C1C)N(C=N2)C3C(C(C(O3)CO)OP(=O)([O-])OC(C)CNC(=O)CCC4(C(C5C6(C(C(C(=C(C7=NC(=CC8=NC(=C(C4=N5)C)C(C8(C)C)CCC(=O)N)C(C7(C)CC(=O)N)CCC(=O)N)C)[N-]6)CCC(=O)N)(C)CC(=O)N)C)CC(=O)N)C)O.[C-]#N.[Co+3]",type:"molecule"},{content:"<b>Insulin</b>",type:"html-text"},{content:"CCC(C)C1C(=O)NC2CSSCC(C(=O)NC(CSSCC(C(=O)NCC(=O)NC(C(=O)NC(C(=O)NC(C(=O)NC(C(=O)NC(C(=O)NC(C(=O)NC(C(=O)NC(C(=O)NC(C(=O)NC(C(=O)NC(CSSCC(NC(=O)C(NC(=O)C(NC(=O)C(NC(=O)C(NC(=O)C(NC(=O)C(NC(=O)C(NC(=O)C(NC2=O)CO)CC(C)C)CC3=CC=C(C=C3)O)CCC(=O)N)CC(C)C)CCC(=O)O)CC(=O)N)CC4=CC=C(C=C4)O)C(=O)NC(CC(=O)N)C(=O)O)C(=O)NCC(=O)NC(CCC(=O)O)C(=O)NC(CCCNC(=N)N)C(=O)NCC(=O)NC(CC5=CC=CC=C5)C(=O)NC(CC6=CC=CC=C6)C(=O)NC(CC7=CC=C(C=C7)O)C(=O)NC(C(C)O)C(=O)N8CCCC8C(=O)NC(CCCCN)C(=O)NC(C(C)O)C(=O)O)C(C)C)CC(C)C)CC9=CC=C(C=C9)O)CC(C)C)C)CCC(=O)O)C(C)C)CC(C)C)CC2=CNC=N2)CO)NC(=O)C(CC(C)C)NC(=O)C(CC2=CNC=N2)NC(=O)C(CCC(=O)N)NC(=O)C(C(=O)N)NC(=O)C(C(C)C)NC(=O)C(CC2=CC=CC=C2)N)C(=O)NC(C(=O)NC(C(=O)N1)CO)C(C)O)NC(=O)C(CCC(=O)N)NC(=O)C(CCC(=O)O)NC(=O)C(C(C)C)NC(=O)C(C(C)CC)NC(=O)CN",type:"molecule"}]}],"Chart creation":[{origin:"bot",time:"6:05pm",index:0,elements:[{content:"Hello, I am Watson, your data visualization assistant. Upload a .CSV or .XLS file to create any chart you wish!",type:"text"}],disableButtons:!0},{origin:"user",time:"6:25pm",index:1,elements:[{content:'File "disasters.csv" sent',type:"text"},{content:"disasters.csv",type:"file"}],disableButtons:!0},{origin:"bot",time:"6:25pm",index:2,elements:[{content:'File "disasters.csv" was successfully uploaded! Here is a preview:',type:"text"},{content:`Entity,Year,Deaths
All natural disasters,1900,1267360
All natural disasters,1901,200018
All natural disasters,1902,46037
All natural disasters,1903,6506
All natural disasters,1905,22758
All natural disasters,1906,42970
All natural disasters,1907,1325641
All natural disasters,1908,75033
All natural disasters,1909,1511524
All natural disasters,1910,148233
All natural disasters,1911,102408
All natural disasters,1912,52093
All natural disasters,1913,882
All natural disasters,1914,289
All natural disasters,1915,32167
All natural disasters,1916,300
All natural disasters,1917,2523507
All natural disasters,1918,461113
All natural disasters,1919,5500
All natural disasters,1920,3204224
All natural disasters,1921,1200000
All natural disasters,1922,101243
All natural disasters,1923,255701
All natural disasters,1924,303009
All natural disasters,1925,5832
All natural disasters,1926,427852
All natural disasters,1927,215160
All natural disasters,1928,3004895
All natural disasters,1929,8377
All natural disasters,1930,10572
All natural disasters,1931,3706227
All natural disasters,1932,73296
All natural disasters,1933,34296
All natural disasters,1934,21087
All natural disasters,1935,272817
All natural disasters,1936,5301
All natural disasters,1937,12025
All natural disasters,1938,2225
All natural disasters,1939,563178
All natural disasters,1940,23023
All natural disasters,1941,10195
All natural disasters,1942,1608235
All natural disasters,1943,1910322
All natural disasters,1944,15906
All natural disasters,1945,10376
All natural disasters,1946,35490
All natural disasters,1947,17647
All natural disasters,1948,120131
All natural disasters,1949,120370
All natural disasters,1950,6728
All natural disasters,1951,15042
All natural disasters,1952,8965
All natural disasters,1953,12956
All natural disasters,1954,41872
All natural disasters,1955,6026
All natural disasters,1956,7737
All natural disasters,1957,10603
All natural disasters,1958,3950
All natural disasters,1959,2013242
All natural disasters,1960,39188
All natural disasters,1961,17341
All natural disasters,1962,17370
All natural disasters,1963,37746
All natural disasters,1964,12892
All natural disasters,1965,1565517
All natural disasters,1966,17181
All natural disasters,1967,10103
All natural disasters,1968,21461
All natural disasters,1969,11687
All natural disasters,1970,387507
All natural disasters,1971,18086
All natural disasters,1972,20045
All natural disasters,1973,110555
All natural disasters,1974,87504
All natural disasters,1975,14858
All natural disasters,1976,280469
All natural disasters,1977,22406
All natural disasters,1978,38096
All natural disasters,1979,7341
All natural disasters,1980,23089
All natural disasters,1981,119697
All natural disasters,1982,13973
All natural disasters,1983,461561
All natural disasters,1984,16273
All natural disasters,1985,60232
All natural disasters,1986,10349
All natural disasters,1987,21533
All natural disasters,1988,57464
All natural disasters,1989,12611
All natural disasters,1990,53141
All natural disasters,1991,189707
All natural disasters,1992,18911
All natural disasters,1993,21821
All natural disasters,1994,15590
All natural disasters,1995,27166
All natural disasters,1996,31595
All natural disasters,1997,30124
All natural disasters,1998,62672
All natural disasters,1999,76886
All natural disasters,2000,16667
All natural disasters,2001,39493
All natural disasters,2002,21342
All natural disasters,2003,113558
All natural disasters,2004,244772
All natural disasters,2005,93566
All natural disasters,2006,29893
All natural disasters,2007,22422
All natural disasters,2008,242236
All natural disasters,2009,16037
All natural disasters,2010,329900
All natural disasters,2011,34143
All natural disasters,2012,11619
All natural disasters,2013,22225
All natural disasters,2014,20882
All natural disasters,2015,23893
All natural disasters,2016,10201
All natural disasters,2017,2087
Drought,1900,1261000
Drought,1910,85000
Drought,1920,524000
Drought,1921,1200000
Drought,1928,3000000
Drought,1940,20000
Drought,1942,1500000
Drought,1943,1900000
Drought,1946,30000
Drought,1964,50
Drought,1965,1502000
Drought,1966,8000
Drought,1967,600
Drought,1973,100000
Drought,1974,19000
Drought,1978,63
Drought,1979,18
Drought,1981,103000
Drought,1982,280
Drought,1983,450520
Drought,1984,230
Drought,1986,84
Drought,1987,1317
Drought,1988,1600
Drought,1989,237
Drought,1991,2000
Drought,1997,732
Drought,1998,20
Drought,1999,361
Drought,2000,80
Drought,2001,99
Drought,2002,588
Drought,2003,9
Drought,2004,80
Drought,2005,149
Drought,2006,134
Drought,2008,8
Drought,2010,20000
Drought,2015,35
Earthquake,1901,18
Earthquake,1902,6747
Earthquake,1903,6000
Earthquake,1905,22500
Earthquake,1906,31966
Earthquake,1907,25641
Earthquake,1908,75000
Earthquake,1909,5146
Earthquake,1910,1762
Earthquake,1912,923
Earthquake,1913,150
Earthquake,1914,149
Earthquake,1915,29986
Earthquake,1917,19450
Earthquake,1918,10379
Earthquake,1920,180000
Earthquake,1922,1100
Earthquake,1923,152362
Earthquake,1924,767
Earthquake,1925,5013
Earthquake,1926,12
Earthquake,1927,206142
Earthquake,1928,635
Earthquake,1929,3317
Earthquake,1930,5081
Earthquake,1931,1537
Earthquake,1932,70006
Earthquake,1933,16180
Earthquake,1934,15496
Earthquake,1935,66110
Earthquake,1936,26
Earthquake,1938,166
Earthquake,1939,63094
Earthquake,1940,1275
Earthquake,1941,189
Earthquake,1942,7235
Earthquake,1943,4332
Earthquake,1944,14984
Earthquake,1945,5961
Earthquake,1946,5153
Earthquake,1947,633
Earthquake,1948,115618
Earthquake,1949,6486
Earthquake,1950,1833
Earthquake,1951,1554
Earthquake,1952,2432
Earthquake,1953,2717
Earthquake,1954,3344
Earthquake,1955,959
Earthquake,1956,763
Earthquake,1957,6993
Earthquake,1958,227
Earthquake,1959,103
Earthquake,1960,19395
Earthquake,1961,60
Earthquake,1962,12209
Earthquake,1963,1700
Earthquake,1964,335
Earthquake,1965,683
Earthquake,1966,2752
Earthquake,1967,1013
Earthquake,1968,10858
Earthquake,1969,3353
Earthquake,1970,78599
Earthquake,1971,1107
Earthquake,1972,15170
Earthquake,1973,552
Earthquake,1974,24808
Earthquake,1975,12632
Earthquake,1976,276994
Earthquake,1977,3098
Earthquake,1978,25162
Earthquake,1979,2100
Earthquake,1980,7730
Earthquake,1981,4206
Earthquake,1982,2120
Earthquake,1983,2148
Earthquake,1984,57
Earthquake,1985,9853
Earthquake,1986,1181
Earthquake,1987,5160
Earthquake,1988,27049
Earthquake,1989,650
Earthquake,1990,42853
Earthquake,1991,2454
Earthquake,1992,4033
Earthquake,1993,10088
Earthquake,1994,1242
Earthquake,1995,7739
Earthquake,1996,576
Earthquake,1997,3159
Earthquake,1998,9573
Earthquake,1999,21869
Earthquake,2000,217
Earthquake,2001,21348
Earthquake,2002,1639
Earthquake,2003,29617
Earthquake,2004,227290
Earthquake,2005,76241
Earthquake,2006,6692
Earthquake,2007,780
Earthquake,2008,87918
Earthquake,2009,1893
Earthquake,2010,226733
Earthquake,2011,20946
Earthquake,2012,711
Earthquake,2013,1120
Earthquake,2014,774
Earthquake,2015,9550
Earthquake,2016,1311
Earthquake,2017,49
Epidemic,1900,30
Epidemic,1901,200000
Epidemic,1907,1300000
Epidemic,1909,1500040
Epidemic,1910,60000
Epidemic,1917,2500000
Epidemic,1918,449700
Epidemic,1920,2500000
Epidemic,1923,100000
Epidemic,1924,300000
Epidemic,1926,423000
Epidemic,1932,16
Epidemic,1935,2000
Epidemic,1940,1500
Epidemic,1947,10276
Epidemic,1953,481
Epidemic,1963,1000
Epidemic,1964,617
Epidemic,1965,816
Epidemic,1966,200
Epidemic,1967,3137
Epidemic,1968,177
Epidemic,1969,3520
Epidemic,1970,939
Epidemic,1971,2313
Epidemic,1972,35
Epidemic,1974,1500
Epidemic,1976,396
Epidemic,1977,1184
Epidemic,1978,3060
Epidemic,1979,486
Epidemic,1980,1685
Epidemic,1981,2497
Epidemic,1982,2912
Epidemic,1983,1219
Epidemic,1984,7016
Epidemic,1985,5854
Epidemic,1986,3046
Epidemic,1987,2592
Epidemic,1988,15216
Epidemic,1989,1870
Epidemic,1990,2207
Epidemic,1991,30682
Epidemic,1992,6675
Epidemic,1993,651
Epidemic,1994,2505
Epidemic,1995,4428
Epidemic,1996,16887
Epidemic,1997,10674
Epidemic,1998,12931
Epidemic,1999,6293
Epidemic,2000,6980
Epidemic,2001,8515
Epidemic,2002,8762
Epidemic,2003,3522
Epidemic,2004,3245
Epidemic,2005,3909
Epidemic,2006,6402
Epidemic,2007,5484
Epidemic,2008,6904
Epidemic,2009,4895
Epidemic,2010,12143
Epidemic,2011,3174
Epidemic,2012,1887
Epidemic,2013,529
Epidemic,2014,12911
Epidemic,2015,1032
Epidemic,2016,1520
Epidemic,2017,386
Extreme temperature,1936,1693
Extreme temperature,1951,69
Extreme temperature,1953,669
Extreme temperature,1955,107
Extreme temperature,1958,651
Extreme temperature,1961,400
Extreme temperature,1962,50
Extreme temperature,1963,162
Extreme temperature,1965,100
Extreme temperature,1966,262
Extreme temperature,1968,153
Extreme temperature,1971,400
Extreme temperature,1972,110
Extreme temperature,1973,283
Extreme temperature,1975,140
Extreme temperature,1978,150
Extreme temperature,1979,470
Extreme temperature,1980,1389
Extreme temperature,1981,300
Extreme temperature,1982,400
Extreme temperature,1983,205
Extreme temperature,1984,290
Extreme temperature,1985,456
Extreme temperature,1986,50
Extreme temperature,1987,1220
Extreme temperature,1988,644
Extreme temperature,1989,381
Extreme temperature,1990,979
Extreme temperature,1991,835
Extreme temperature,1992,388
Extreme temperature,1993,106
Extreme temperature,1994,341
Extreme temperature,1995,1730
Extreme temperature,1996,300
Extreme temperature,1997,604
Extreme temperature,1998,3269
Extreme temperature,1999,771
Extreme temperature,2000,941
Extreme temperature,2001,1787
Extreme temperature,2002,3369
Extreme temperature,2003,74698
Extreme temperature,2004,255
Extreme temperature,2005,1550
Extreme temperature,2006,4826
Extreme temperature,2007,1086
Extreme temperature,2008,1688
Extreme temperature,2009,1386
Extreme temperature,2010,57188
Extreme temperature,2011,435
Extreme temperature,2012,1834
Extreme temperature,2013,1821
Extreme temperature,2014,1168
Extreme temperature,2015,7425
Extreme temperature,2016,490
Extreme temperature,2017,130
Extreme weather,1900,6000
Extreme weather,1902,600
Extreme weather,1903,163
Extreme weather,1905,240
Extreme weather,1906,10298
Extreme weather,1909,713
Extreme weather,1910,30
Extreme weather,1911,1000
Extreme weather,1912,51170
Extreme weather,1913,732
Extreme weather,1915,2125
Extreme weather,1916,300
Extreme weather,1917,4057
Extreme weather,1918,34
Extreme weather,1919,500
Extreme weather,1920,224
Extreme weather,1922,100000
Extreme weather,1923,3139
Extreme weather,1924,2242
Extreme weather,1925,819
Extreme weather,1926,3568
Extreme weather,1927,5772
Extreme weather,1928,4224
Extreme weather,1930,4082
Extreme weather,1931,3200
Extreme weather,1932,3244
Extreme weather,1933,63
Extreme weather,1934,5091
Extreme weather,1935,62707
Extreme weather,1936,3309
Extreme weather,1937,11231
Extreme weather,1938,905
Extreme weather,1939,3
Extreme weather,1940,123
Extreme weather,1941,5006
Extreme weather,1942,101000
Extreme weather,1943,5000
Extreme weather,1944,726
Extreme weather,1945,4415
Extreme weather,1946,337
Extreme weather,1947,4738
Extreme weather,1948,2971
Extreme weather,1949,2804
Extreme weather,1950,873
Extreme weather,1951,2861
Extreme weather,1952,6277
Extreme weather,1953,1814
Extreme weather,1954,2969
Extreme weather,1955,3895
Extreme weather,1956,3114
Extreme weather,1957,1139
Extreme weather,1958,2620
Extreme weather,1959,9695
Extreme weather,1960,9164
Extreme weather,1961,12852
Extreme weather,1962,1860
Extreme weather,1963,29965
Extreme weather,1964,10655
Extreme weather,1965,59932
Extreme weather,1966,2327
Extreme weather,1967,2255
Extreme weather,1968,1669
Extreme weather,1969,3252
Extreme weather,1970,304495
Extreme weather,1971,10811
Extreme weather,1972,1427
Extreme weather,1973,4344
Extreme weather,1974,11861
Extreme weather,1975,1041
Extreme weather,1976,1763
Extreme weather,1977,15298
Extreme weather,1978,3676
Extreme weather,1979,2623
Extreme weather,1980,1379
Extreme weather,1981,3790
Extreme weather,1982,2782
Extreme weather,1983,3656
Extreme weather,1984,5468
Extreme weather,1985,17165
Extreme weather,1986,1939
Extreme weather,1987,2900
Extreme weather,1988,3335
Extreme weather,1989,4256
Extreme weather,1990,4604
Extreme weather,1991,146297
Extreme weather,1992,1342
Extreme weather,1993,2965
Extreme weather,1994,4239
Extreme weather,1995,3763
Extreme weather,1996,4581
Extreme weather,1997,6150
Extreme weather,1998,24935
Extreme weather,1999,12270
Extreme weather,2000,1354
Extreme weather,2001,1911
Extreme weather,2002,1382
Extreme weather,2003,1049
Extreme weather,2004,6547
Extreme weather,2005,5251
Extreme weather,2006,4329
Extreme weather,2007,6035
Extreme weather,2008,140985
Extreme weather,2009,3287
Extreme weather,2010,1564
Extreme weather,2011,3103
Extreme weather,2012,3105
Extreme weather,2013,8603
Extreme weather,2014,1424
Extreme weather,2015,1270
Extreme weather,2016,1760
Extreme weather,2017,394
Flood,1900,300
Flood,1903,250
Flood,1906,6
Flood,1909,72
Flood,1910,1379
Flood,1911,100000
Flood,1926,1000
Flood,1927,3246
Flood,1928,36
Flood,1931,3700000
Flood,1933,18053
Flood,1935,142000
Flood,1936,200
Flood,1937,248
Flood,1938,954
Flood,1939,500010
Flood,1940,125
Flood,1943,990
Flood,1947,2000
Flood,1948,917
Flood,1949,97000
Flood,1950,3808
Flood,1951,5666
Flood,1952,199
Flood,1953,7125
Flood,1954,34436
Flood,1955,584
Flood,1956,3613
Flood,1957,2471
Flood,1958,400
Flood,1959,2003396
Flood,1960,10577
Flood,1961,3863
Flood,1962,1180
Flood,1963,1031
Flood,1964,1123
Flood,1965,1401
Flood,1966,1923
Flood,1967,2446
Flood,1968,7306
Flood,1969,1544
Flood,1970,3246
Flood,1971,2404
Flood,1972,2548
Flood,1973,1835
Flood,1974,29431
Flood,1975,848
Flood,1976,960
Flood,1977,2568
Flood,1978,5897
Flood,1979,1038
Flood,1980,10466
Flood,1981,5283
Flood,1982,4648
Flood,1983,2082
Flood,1984,2930
Flood,1985,4376
Flood,1986,1782
Flood,1987,6766
Flood,1988,8504
Flood,1989,4716
Flood,1990,2251
Flood,1991,5852
Flood,1992,5315
Flood,1993,6150
Flood,1994,6771
Flood,1995,7956
Flood,1996,8047
Flood,1997,7685
Flood,1998,10653
Flood,1999,34807
Flood,2000,6025
Flood,2001,5014
Flood,2002,4236
Flood,2003,3910
Flood,2004,6982
Flood,2005,5754
Flood,2006,5843
Flood,2007,8607
Flood,2008,4007
Flood,2009,3627
Flood,2010,8356
Flood,2011,6163
Flood,2012,3544
Flood,2013,9836
Flood,2014,3532
Flood,2015,3495
Flood,2016,4720
Flood,2017,648
Landslide,1909,53
Landslide,1922,100
Landslide,1923,200
Landslide,1926,128
Landslide,1930,40
Landslide,1931,190
Landslide,1932,30
Landslide,1934,500
Landslide,1936,73
Landslide,1938,200
Landslide,1941,5000
Landslide,1948,525
Landslide,1949,12000
Landslide,1950,130
Landslide,1951,92
Landslide,1952,28
Landslide,1954,1086
Landslide,1955,478
Landslide,1956,236
Landslide,1958,52
Landslide,1959,48
Landslide,1960,52
Landslide,1961,166
Landslide,1962,71
Landslide,1963,2033
Landslide,1964,108
Landslide,1965,204
Landslide,1966,604
Landslide,1967,590
Landslide,1968,1196
Landslide,1969,18
Landslide,1970,186
Landslide,1971,1020
Landslide,1972,755
Landslide,1973,3541
Landslide,1974,904
Landslide,1975,195
Landslide,1976,315
Landslide,1977,40
Landslide,1978,86
Landslide,1979,338
Landslide,1980,300
Landslide,1981,421
Landslide,1982,640
Landslide,1983,1159
Landslide,1984,228
Landslide,1985,377
Landslide,1986,501
Landslide,1987,1204
Landslide,1988,952
Landslide,1989,445
Landslide,1990,98
Landslide,1991,728
Landslide,1992,712
Landslide,1993,1418
Landslide,1994,307
Landslide,1995,1521
Landslide,1996,1155
Landslide,1997,801
Landslide,1998,1141
Landslide,1999,445
Landslide,2000,1012
Landslide,2001,786
Landslide,2002,1100
Landslide,2003,706
Landslide,2004,313
Landslide,2005,664
Landslide,2006,1638
Landslide,2007,271
Landslide,2008,504
Landslide,2009,723
Landslide,2010,3427
Landslide,2011,309
Landslide,2012,501
Landslide,2013,235
Landslide,2014,943
Landslide,2015,1006
Landslide,2016,361
Landslide,2017,405
Mass movement (dry),1903,76
Mass movement (dry),1905,18
Mass movement (dry),1908,33
Mass movement (dry),1910,62
Mass movement (dry),1915,56
Mass movement (dry),1937,40
Mass movement (dry),1955,3
Mass movement (dry),1962,2000
Mass movement (dry),1963,150
Mass movement (dry),1965,26
Mass movement (dry),1970,42
Mass movement (dry),1971,31
Mass movement (dry),1980,50
Mass movement (dry),1982,59
Mass movement (dry),1983,466
Mass movement (dry),1985,300
Mass movement (dry),1987,183
Mass movement (dry),1988,157
Mass movement (dry),1989,55
Mass movement (dry),1990,116
Mass movement (dry),1991,86
Mass movement (dry),1992,323
Mass movement (dry),1993,341
Mass movement (dry),2000,11
Mass movement (dry),2002,60
Mass movement (dry),2004,44
Mass movement (dry),2006,11
Mass movement (dry),2008,120
Mass movement (dry),2009,36
Mass movement (dry),2012,16
Mass movement (dry),2013,46
Mass movement (dry),2015,13
Volcanic activity,1900,30
Volcanic activity,1902,38690
Volcanic activity,1903,17
Volcanic activity,1906,700
Volcanic activity,1909,5500
Volcanic activity,1911,1335
Volcanic activity,1914,140
Volcanic activity,1919,5000
Volcanic activity,1926,144
Volcanic activity,1929,5000
Volcanic activity,1930,1369
Volcanic activity,1931,1300
Volcanic activity,1937,506
Volcanic activity,1944,26
Volcanic activity,1948,100
Volcanic activity,1949,2000
Volcanic activity,1950,84
Volcanic activity,1951,4800
Volcanic activity,1952,29
Volcanic activity,1953,150
Volcanic activity,1954,37
Volcanic activity,1963,1705
Volcanic activity,1964,4
Volcanic activity,1965,355
Volcanic activity,1966,1088
Volcanic activity,1968,90
Volcanic activity,1975,2
Volcanic activity,1976,41
Volcanic activity,1977,215
Volcanic activity,1979,268
Volcanic activity,1980,90
Volcanic activity,1981,192
Volcanic activity,1982,130
Volcanic activity,1984,37
Volcanic activity,1985,21800
Volcanic activity,1986,1746
Volcanic activity,1988,7
Volcanic activity,1990,33
Volcanic activity,1991,683
Volcanic activity,1992,1
Volcanic activity,1993,99
Volcanic activity,1994,101
Volcanic activity,1996,4
Volcanic activity,1997,53
Volcanic activity,2002,200
Volcanic activity,2004,2
Volcanic activity,2005,3
Volcanic activity,2006,5
Volcanic activity,2007,11
Volcanic activity,2008,16
Volcanic activity,2010,323
Volcanic activity,2011,3
Volcanic activity,2014,102
Wildfire,1911,73
Wildfire,1918,1000
Wildfire,1922,43
Wildfire,1929,60
Wildfire,1939,71
Wildfire,1944,170
Wildfire,1949,80
Wildfire,1956,11
Wildfire,1966,25
Wildfire,1967,62
Wildfire,1968,12
Wildfire,1977,3
Wildfire,1978,2
Wildfire,1981,8
Wildfire,1982,2
Wildfire,1983,106
Wildfire,1984,17
Wildfire,1985,51
Wildfire,1986,20
Wildfire,1987,191
Wildfire,1989,1
Wildfire,1991,90
Wildfire,1992,122
Wildfire,1993,3
Wildfire,1994,84
Wildfire,1995,29
Wildfire,1996,45
Wildfire,1997,266
Wildfire,1998,150
Wildfire,1999,70
Wildfire,2000,47
Wildfire,2001,33
Wildfire,2002,6
Wildfire,2003,47
Wildfire,2004,14
Wildfire,2005,45
Wildfire,2006,13
Wildfire,2007,148
Wildfire,2008,86
Wildfire,2009,190
Wildfire,2010,166
Wildfire,2011,10
Wildfire,2012,21
Wildfire,2013,35
Wildfire,2014,16
Wildfire,2015,67
Wildfire,2016,39
Wildfire,2017,75`,type:"table"},{content:"What would you like to visualize?",type:"text"}],disableButtons:!0},{origin:"user",time:"6:25pm",index:3,elements:[{content:"Make a bubble blot of entity vs years, size bubbles by death count",type:"text"}]},{origin:"bot",time:"6:26pm",index:4,elements:[{content:"This is a bubble plot chart of Entitiy by Year sized by Deaths, What do you think?",type:"text"},{content:`{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","data":{"url":"https://vega.github.io/vega-lite/examples/data/disasters.csv"},"width":600,"height":400,"transform":[{"filter":"datum.Entity !== 'All natural disasters'"}],"mark":{"type":"circle","opacity":0.8,"stroke":"black","strokeWidth":1},"encoding":{"x":{"field":"Year","type":"temporal","axis":{"grid":false}},"y":{"field":"Entity","type":"nominal","axis":{"title":""}},"size":{"field":"Deaths","type":"quantitative","title":"Annual Global Deaths","legend":{"clipHeight":30},"scale":{"rangeMax":5000}},"color":{"field":"Entity","type":"nominal","legend":null}}}`,type:"chart"}]},{origin:"user",time:"6:33pm",index:5,elements:[{content:'add title "Deaths by natural disasters", make points smaller then add tooltips, hovering and brush selections',type:"text"}]},{origin:"bot",time:"6:33pm",index:6,elements:[{content:"I think I can do that.",type:"text"},{content:`{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"Deaths by natural disasters","data":{"url":"https://vega.github.io/vega-lite/examples/data/disasters.csv"},"width":600,"height":400,"transform":[{"filter":"datum.Entity !== 'All natural disasters'"}],"mark":{"type":"circle","opacity":0.8,"stroke":"black","strokeWidth":1},"encoding":{"x":{"field":"Year","type":"temporal","axis":{"grid":false}},"y":{"field":"Entity","type":"nominal","axis":{"title":""}},"size":{"field":"Deaths","type":"quantitative","title":"Annual Global Deaths","legend":{"clipHeight":-300},"scale":{"rangeMax":2000}},"color":{"field":"Entity","type":"nominal","legend":null}}}`,type:"chart"}]}],Visualization:[{origin:"user",hasError:!1,time:"10:32",index:0,elements:[{content:"Hello, show me a simple table based on Seinfeld Characters then display the following charts with small mockup datasets: a horizontal bar chart, a scatter plot, a pie chart, a boxplot, a map, a matrix and a line chart.",type:"text"}]},{text:"",origin:"bot",hasError:!1,time:"10:34",index:1,elements:[{content:`Here is your table:
`,type:"text"},{content:`Name,Age,Occupation,Location,State
Jerry,35,Comedian,Upper east side,NY
George,35,Unemployed,Queens,NY
Elaine,32,Publisher,Midtown,NY
Kramer,36,Unknown,Upper east side,NY`,type:"table"},{content:`Here is your horizontal layered bar chart:
`,type:"text"},{content:'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","data":{"url":"https://vega.github.io/vega-lite/data/seattle-weather.csv"},"title":"Daily Max Temperatures (C) in Cleveland, OH","config":{"view":{"strokeWidth":0,"step":13},"axis":{"domain":false}},"mark":"rect","encoding":{"x":{"field":"date","timeUnit":"date","type":"ordinal","title":"Day","axis":{"labelAngle":0,"format":"%e"}},"y":{"field":"date","timeUnit":"month","type":"ordinal","title":"Month"},"color":{"field":"temp_max","aggregate":"max","type":"quantitative","legend":{"title":null}}}}',type:"chart"},{content:"And here is your scatter plot:",type:"text"},{content:'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"Scatter plot example","data":{"values":[{"x":46,"y":15,"c":1},{"x":24,"y":16,"c":1},{"x":12,"y":77,"c":1},{"x":54,"y":45,"c":2},{"x":44,"y":12,"c":2},{"x":22,"y":66,"c":2},{"x":25,"y":34,"c":3},{"x":28,"y":31,"c":4},{"x":38,"y":68,"c":5}]},"mark":"point","encoding":{"x":{"field":"x","type":"quantitative"},"y":{"field":"y","type":"quantitative"},"color":{"field":"c","type":"nominal"}}}',type:"chart"},{content:"And here is your pie chart:",type:"text"},{content:'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"Pie chart example","data":{"values":[{"category":"A","value":18},{"category":"B","value":10},{"category":"C","value":2}]},"mark":{"type":"arc","innerRadius":0},"encoding":{"theta":{"field":"value","type":"quantitative"},"color":{"field":"category","type":"nominal"}}}',type:"chart"},{content:"And here is a Boxplot:",type:"text"},{content:'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Boxplot example with random data","data":{"values":[{"group":"Group A","value":34},{"group":"Group A","value":28},{"group":"Group A","value":55},{"group":"Group B","value":91},{"group":"Group B","value":81},{"group":"Group B","value":67},{"group":"Group C","value":45},{"group":"Group C","value":66},{"group":"Group C","value":73},{"group":"Group D","value":28},{"group":"Group D","value":35},{"group":"Group D","value":56},{"group":"Group E","value":12},{"group":"Group E","value":45},{"group":"Group E","value":99}]},"mark":"boxplot","encoding":{"y":{"field":"group","type":"nominal"},"x":{"field":"value","type":"quantitative"}}}',type:"chart"},{content:"And here is a Map:",type:"text"},{content:'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"US Unemployment by county","data":{"url":"https://vega.github.io/editor/data/us-10m.json","format":{"type":"topojson","feature":"counties"}},"transform":[{"lookup":"id","from":{"data":{"url":"https://vega.github.io/editor/data/unemployment.tsv"},"key":"id","fields":["rate"]}}],"projection":{"type":"albersUsa"},"mark":"geoshape","encoding":{"color":{"field":"rate","type":"quantitative"}}}',type:"chart"},{content:"And here is a matrix:",type:"text"},{content:'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","data":{"values":[{"x":0,"y":0,"value":0.5},{"x":1,"y":0,"value":0.2},{"x":2,"y":0,"value":0.1},{"x":3,"y":0,"value":0.8},{"x":0,"y":1,"value":0.7},{"x":1,"y":1,"value":0.8},{"x":2,"y":1,"value":0.3},{"x":3,"y":1,"value":0.4},{"x":0,"y":2,"value":0.1},{"x":1,"y":2,"value":0.2},{"x":2,"y":2,"value":0.9},{"x":3,"y":2,"value":0.9},{"x":0,"y":3,"value":0.5},{"x":1,"y":3,"value":0.2},{"x":2,"y":3,"value":0.5},{"x":3,"y":3,"value":0.6}]},"title":"Matrix example","mark":"rect","encoding":{"x":{"field":"x","type":"ordinal","title":"x"},"y":{"field":"y","type":"ordinal","title":"y"},"color":{"field":"value","type":"quantitative"}}}',type:"chart"},{content:"And here is an example of a gradiented price line:",type:"text"},{content:`{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"IBM stock price over time.","data":{"values":[{"symbol":"IBM","date":"Jan 1 2000","price":100.52},{"symbol":"IBM","date":"Feb 1 2000","price":92.11},{"symbol":"IBM","date":"Mar 1 2000","price":106.11},{"symbol":"IBM","date":"Apr 1 2000","price":99.95},{"symbol":"IBM","date":"May 1 2000","price":96.31},{"symbol":"IBM","date":"Jun 1 2000","price":98.33},{"symbol":"IBM","date":"Jul 1 2000","price":100.74},{"symbol":"IBM","date":"Aug 1 2000","price":118.62},{"symbol":"IBM","date":"Sep 1 2000","price":101.19},{"symbol":"IBM","date":"Oct 1 2000","price":88.5},{"symbol":"IBM","date":"Nov 1 2000","price":84.12},{"symbol":"IBM","date":"Dec 1 2000","price":76.47},{"symbol":"IBM","date":"Jan 1 2001","price":100.76},{"symbol":"IBM","date":"Feb 1 2001","price":89.98},{"symbol":"IBM","date":"Mar 1 2001","price":86.63},{"symbol":"IBM","date":"Apr 1 2001","price":103.7},{"symbol":"IBM","date":"May 1 2001","price":100.82},{"symbol":"IBM","date":"Jun 1 2001","price":102.35},{"symbol":"IBM","date":"Jul 1 2001","price":94.87},{"symbol":"IBM","date":"Aug 1 2001","price":90.25},{"symbol":"IBM","date":"Sep 1 2001","price":82.82},{"symbol":"IBM","date":"Oct 1 2001","price":97.58},{"symbol":"IBM","date":"Nov 1 2001","price":104.5},{"symbol":"IBM","date":"Dec 1 2001","price":109.36},{"symbol":"IBM","date":"Jan 1 2002","price":97.54},{"symbol":"IBM","date":"Feb 1 2002","price":88.82},{"symbol":"IBM","date":"Mar 1 2002","price":94.15},{"symbol":"IBM","date":"Apr 1 2002","price":75.82},{"symbol":"IBM","date":"May 1 2002","price":72.97},{"symbol":"IBM","date":"Jun 1 2002","price":65.31},{"symbol":"IBM","date":"Jul 1 2002","price":63.86},{"symbol":"IBM","date":"Aug 1 2002","price":68.52},{"symbol":"IBM","date":"Sep 1 2002","price":53.01},{"symbol":"IBM","date":"Oct 1 2002","price":71.76},{"symbol":"IBM","date":"Nov 1 2002","price":79.16},{"symbol":"IBM","date":"Dec 1 2002","price":70.58},{"symbol":"IBM","date":"Jan 1 2003","price":71.22},{"symbol":"IBM","date":"Feb 1 2003","price":71.13},{"symbol":"IBM","date":"Mar 1 2003","price":71.57},{"symbol":"IBM","date":"Apr 1 2003","price":77.47},{"symbol":"IBM","date":"May 1 2003","price":80.48},{"symbol":"IBM","date":"Jun 1 2003","price":75.42},{"symbol":"IBM","date":"Jul 1 2003","price":74.28},{"symbol":"IBM","date":"Aug 1 2003","price":75.12},{"symbol":"IBM","date":"Sep 1 2003","price":80.91},{"symbol":"IBM","date":"Oct 1 2003","price":81.96},{"symbol":"IBM","date":"Nov 1 2003","price":83.08},{"symbol":"IBM","date":"Dec 1 2003","price":85.05},{"symbol":"IBM","date":"Jan 1 2004","price":91.06},{"symbol":"IBM","date":"Feb 1 2004","price":88.7},{"symbol":"IBM","date":"Mar 1 2004","price":84.41},{"symbol":"IBM","date":"Apr 1 2004","price":81.04},{"symbol":"IBM","date":"May 1 2004","price":81.59},{"symbol":"IBM","date":"Jun 1 2004","price":81.19},{"symbol":"IBM","date":"Jul 1 2004","price":80.19},{"symbol":"IBM","date":"Aug 1 2004","price":78.17},{"symbol":"IBM","date":"Sep 1 2004","price":79.13},{"symbol":"IBM","date":"Oct 1 2004","price":82.84},{"symbol":"IBM","date":"Nov 1 2004","price":87.15},{"symbol":"IBM","date":"Dec 1 2004","price":91.16},{"symbol":"IBM","date":"Jan 1 2005","price":86.39},{"symbol":"IBM","date":"Feb 1 2005","price":85.78},{"symbol":"IBM","date":"Mar 1 2005","price":84.66},{"symbol":"IBM","date":"Apr 1 2005","price":70.77},{"symbol":"IBM","date":"May 1 2005","price":70.18},{"symbol":"IBM","date":"Jun 1 2005","price":68.93},{"symbol":"IBM","date":"Jul 1 2005","price":77.53},{"symbol":"IBM","date":"Aug 1 2005","price":75.07},{"symbol":"IBM","date":"Sep 1 2005","price":74.7},{"symbol":"IBM","date":"Oct 1 2005","price":76.25},{"symbol":"IBM","date":"Nov 1 2005","price":82.98},{"symbol":"IBM","date":"Dec 1 2005","price":76.73},{"symbol":"IBM","date":"Jan 1 2006","price":75.89},{"symbol":"IBM","date":"Feb 1 2006","price":75.09},{"symbol":"IBM","date":"Mar 1 2006","price":77.17},{"symbol":"IBM","date":"Apr 1 2006","price":77.05},{"symbol":"IBM","date":"May 1 2006","price":75.04},{"symbol":"IBM","date":"Jun 1 2006","price":72.15},{"symbol":"IBM","date":"Jul 1 2006","price":72.7},{"symbol":"IBM","date":"Aug 1 2006","price":76.35},{"symbol":"IBM","date":"Sep 1 2006","price":77.26},{"symbol":"IBM","date":"Oct 1 2006","price":87.06},{"symbol":"IBM","date":"Nov 1 2006","price":86.95},{"symbol":"IBM","date":"Dec 1 2006","price":91.9},{"symbol":"IBM","date":"Jan 1 2007","price":93.79},{"symbol":"IBM","date":"Feb 1 2007","price":88.18},{"symbol":"IBM","date":"Mar 1 2007","price":89.44},{"symbol":"IBM","date":"Apr 1 2007","price":96.98},{"symbol":"IBM","date":"May 1 2007","price":101.54},{"symbol":"IBM","date":"Jun 1 2007","price":100.25},{"symbol":"IBM","date":"Jul 1 2007","price":105.4},{"symbol":"IBM","date":"Aug 1 2007","price":111.54},{"symbol":"IBM","date":"Sep 1 2007","price":112.6},{"symbol":"IBM","date":"Oct 1 2007","price":111},{"symbol":"IBM","date":"Nov 1 2007","price":100.9},{"symbol":"IBM","date":"Dec 1 2007","price":103.7},{"symbol":"IBM","date":"Jan 1 2008","price":102.75},{"symbol":"IBM","date":"Feb 1 2008","price":109.64},{"symbol":"IBM","date":"Mar 1 2008","price":110.87},{"symbol":"IBM","date":"Apr 1 2008","price":116.23},{"symbol":"IBM","date":"May 1 2008","price":125.14},{"symbol":"IBM","date":"Jun 1 2008","price":114.6},{"symbol":"IBM","date":"Jul 1 2008","price":123.74},{"symbol":"IBM","date":"Aug 1 2008","price":118.16},{"symbol":"IBM","date":"Sep 1 2008","price":113.53},{"symbol":"IBM","date":"Oct 1 2008","price":90.24},{"symbol":"IBM","date":"Nov 1 2008","price":79.65},{"symbol":"IBM","date":"Dec 1 2008","price":82.15},{"symbol":"IBM","date":"Jan 1 2009","price":89.46},{"symbol":"IBM","date":"Feb 1 2009","price":90.32},{"symbol":"IBM","date":"Mar 1 2009","price":95.09},{"symbol":"IBM","date":"Apr 1 2009","price":101.29},{"symbol":"IBM","date":"May 1 2009","price":104.85},{"symbol":"IBM","date":"Jun 1 2009","price":103.01},{"symbol":"IBM","date":"Jul 1 2009","price":116.34},{"symbol":"IBM","date":"Aug 1 2009","price":117},{"symbol":"IBM","date":"Sep 1 2009","price":118.55},{"symbol":"IBM","date":"Oct 1 2009","price":119.54},{"symbol":"IBM","date":"Nov 1 2009","price":125.79},{"symbol":"IBM","date":"Dec 1 2009","price":130.32},{"symbol":"IBM","date":"Jan 1 2010","price":121.85},{"symbol":"IBM","date":"Feb 1 2010","price":127.16},{"symbol":"IBM","date":"Mar 1 2010","price":125.55}]},"transform":[{"filter":"datum.symbol==='IBM'"}],"mark":{"type":"area","line":{"color":"darkgreen"},"color":{"x1":1,"y1":1,"x2":1,"y2":0,"gradient":"linear","stops":[{"offset":0,"color":"white"},{"offset":1,"color":"darkgreen"}]}},"encoding":{"x":{"field":"date","type":"temporal"},"y":{"field":"price","type":"quantitative"}}}`,type:"chart"},{content:"What else can I help you with?",type:"text"}]}],"Nature of art":[{text:"what is the nature of art?",origin:"user",hasError:!1,time:"8:51",index:0},{text:`the nature of art is a complex and multifaceted topic that has been debated by philosophers, critics, and scholars for centuries. at its core, art is the creation of aesthetic objects or experiences that are intended to elicit an emotional response from the viewer. this can take many forms, including painting, sculpture, photography, music, and literature.

art can serve a variety of purposes, including the expression of the artists personal vision, the exploration of complex social or political issues, or the simple enjoyment of beauty. the nature of art is also influenced by cultural and historical context, and can evolve over time as new techniques and materials are developed.

`,origin:"bot",hasError:!1,time:"8:51",index:1},{text:"how much do aesthetics play into it?",origin:"user",hasError:!1,time:"8:52",index:2},{text:`aesthetics play a significant role in the creation and appreciation of art. the aesthetic qualities of a piece of art, such as its form, color, and composition, are often a key factor in determining its overall effectiveness and appeal. in addition, the aesthetic principles that underlie a work of art can influence its interpretation and meaning.


`,origin:"bot",hasError:!1,time:"8:52",index:3},{text:"Should aesthetics not matter if its a purely subjective interpretation?",origin:"user",hasError:!1,time:"8:53",index:4},{text:`while aesthetic evaluations are subjective, they can still provide valuable insights into the ways in which art can be appreciated and understood. the aesthetic qualities of a piece of art can influence how it is experienced and interpreted, and can also reflect the cultural and historical context in which it was created.



`,origin:"bot",hasError:!1,time:"8:53",index:5}],Hello:[{text:"Hello friend",origin:"user",hasError:!1,time:"16:51",index:0,elements:[{content:"Hello friend",type:"text"}]}],Flowers:[{text:"Can you give me a list of flower images?",origin:"user",hasError:!1,time:"16:56",index:0},{text:`Of course, here is a list of flowers:
Cosmos: https://bouqs.com/blog/wp-content/uploads/2019/05/20_summer-cosmos.jpg Dahlia: https://bouqs.com/blog/wp-content/uploads/2019/05/summer-dahlia.jpg Zinnia: https://bouqs.com/blog/wp-content/uploads/2023/06/zinnia-gbcbfedd94_1280.jpg Chrysanthemum: https://bouqs.com/blog/wp-content/uploads/2021/09/chrysanthemum-5668882_1280.jpg Celosia: https://bouqs.com/blog/wp-content/uploads/2021/09/celosia-7299458_1280.jpg Sun flower: https://bouqs.com/blog/wp-content/uploads/2021/05/sunflower-fields.jpg Snapdragon: https://bouqs.com/blog/wp-content/uploads/2021/09/snapdragon-20809_1280.jpg Strawflower: https://bouqs.com/blog/wp-content/uploads/2021/09/strawflower-362280_1280.jpg Source: https://bouqs.com/blog/types-of-flowers-annual-perennial-biennial/`,origin:"bot",hasError:!1,time:"16:57",index:1}],Diagrams:[{text:"Give me 3 server diagram examples for a VPC",origin:"user",time:"16:56",index:0},{text:"",origin:"bot",hasError:!1,time:"10:34",index:1,elements:[{content:`Here are a few example architectures available to you:

`,type:"text"},{content:"<b>1. VPC landing zone - Standard variation</b>",type:"text"},{content:"The Standard variation of the VPC landing zone deployable architecture uses two Virtual Private Clouds (VPC), a Management VPC, and a Workload VPC to manage the environment and the deployed workload. Each VPC is a multi-zoned, multi-subnet implementation that keeps your workloads secure. A transit gateway connects the VPCs to each other and Virtual Private Endpoints are used connect to IBM Cloud services.",type:"text"},{content:"https://github.com/terraform-ibm-modules/terraform-ibm-landing-zone/raw/main/reference-architectures/vpc.drawio.svg",type:"img"},{content:"https://cloud.ibm.com/catalog/architecture/deploy-arch-ibm-slz-vpc-9fc0fa64-27af-4fed-9dce-47b3640ba739-global",type:"link-list"},{content:"<b>2. Red Hat OpenShift Container Platform on VPC landing zone - QuickStart variation</b>",type:"text"},{content:`The QuickStart variation of the Red Hat OpenShift Container Platform on VPC landing zone deployable architecture creates a fully customizable Virtual Private Cloud (VPC) environment in a single region. The solution provides a single Red Hat OpenShift cluster in a secure VPC for your workloads. The QuickStart variation is designed to deploy quickly for demonstration and development.
`,type:"text"},{content:"https://github.com/terraform-ibm-modules/terraform-ibm-landing-zone/raw/main/reference-architectures/roks-quickstart.drawio.svg",type:"img"},{content:"https://cloud.ibm.com/catalog/architecture/deploy-arch-ibm-slz-ocp-95fccffc-ae3b-42df-b6d9-80be5914d852-global",type:"link-list"},{content:"<b>3. Red Hat OpenShift Container Platform on VPC landing zone</b>",type:"text"},{content:"https://github.com/terraform-ibm-modules/terraform-ibm-landing-zone/raw/main/reference-architectures/roks.drawio.svg",type:"img"},{content:"https://cloud.ibm.com/catalog/architecture/deploy-arch-ibm-slz-ocp-95fccffc-ae3b-42df-b6d9-80be5914d852-global",type:"link-list"},{content:"Select an option to start from and begin editing your server architecture.",type:"text"}]},{text:"Give me a VSi variant",origin:"user",time:"16:59",index:0},{text:"",origin:"bot",hasError:!1,time:"10:34",index:1,elements:[{content:`Here is a template suited to you needs:
`,type:"text"},{content:"<b>VSI on VPC landing zone - Standard variation</b>",type:"text"},{content:"The Standard variation of the VSI on VPC landing zone deployable architecture is based on the IBM Cloud for Financial Services reference architecture. The architecture creates a customizable and secure infrastructure, with virtual servers, to run your workloads with a Virtual Private Cloud (VPC) in multizone regions.",type:"text"},{content:"https://github.com/terraform-ibm-modules/terraform-ibm-landing-zone/raw/main/reference-architectures/vsi-vsi.drawio.svg",type:"img"},{content:"https://cloud.ibm.com/catalog/architecture/deploy-arch-ibm-slz-vsi-ef663980-4c71-4fac-af4f-4a510a9bcf68-global",type:"link-list"},{content:"Would you like to customize this configuration?",type:"text"}]}],Agents:[{text:"Find me a dataset about the weather in Ohio circa 2015",origin:"user",time:"16:56",index:0},{origin:"bot",displayName:"Agent: George",displayColor:"#a3fffc",time:"16:57",index:1,elements:[{content:"I found the relevent file for you:",type:"text"},{content:`temp_cst_var,hhf,llf,dr_date_mv2,zip
77987,4059,4904,66777,3345
234334,6743,4354,3453,2345
234334,6743,4354,3453,2345
234334,6743,4354,3453,2345`,type:"table"},{content:"http://www.file.com/weather.csv",type:"file"}]},{origin:"bot",displayName:"Agent: Micheal",displayColor:"#d0b2fe",time:"17:07",index:2,elements:[{content:"Hello, I can edit the column titles or offer you a better title for your file...",type:"text"},{content:'<span style="font-size:20px; font-style:bold;"> Update file title:</span>',type:"text"},{content:'["2015_ohio_temperatures.csv","2015_cleveland_heatwave.csv","daily_temperatures_suffolk_county_may_2015.csv"]',type:"tags"},{content:"I can also update your column names:",type:"text"},{content:'<span style="font-size:20px; font-style:bold;">Before:</span>',type:"text"},{content:"temp_cst_var,hhf,llf,dr_date_mv2,zip",type:"table"},{content:'<span style="font-size:20px; font-style:bold;">After:</span>',type:"text"},{content:"temperature,highs,lows,mm/dd/yyyy,zipcode",type:"table"},{content:'["Apply"]',type:"tags"}]},{origin:"bot",displayName:"Agent: Sophia",displayColor:"#ade0ff",time:"17:09",index:3,elements:[{content:"And I can visualize your data however you want!",type:"text"},{type:"chart",content:'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","data":{"url":"https://vega.github.io/vega-lite/data/seattle-weather.csv"},"title":"Daily Max Temperatures (C) in Cleveland, OH","config":{"view":{"strokeWidth":0,"step":13},"axis":{"domain":false}},"mark":"rect","encoding":{"x":{"field":"date","timeUnit":"date","type":"ordinal","title":"Day","axis":{"labelAngle":0,"format":"%e"}},"y":{"field":"date","timeUnit":"month","type":"ordinal","title":"Month"},"color":{"field":"temp_max","aggregate":"max","type":"quantitative","legend":{"title":null}}}}'}]}]},H={component:"clabs-chat",argTypes:wt,args:xt,parameters:{controls:{expanded:!0},layout:"fullscreen",viewport:{defaultViewport:"storybook-default"}},render:({testMode:a,sampleConversation:e,conversationJSON:t})=>y`
    <div
      style="height:calc(100vh - 84px); display:flex; max-width:100%; gap:20px;">
      <div style="flex:2;">
        <clabs-chat
          user-name="user"
          agent-name="bot"
          enable-feedback-form
          enable-launcher
          .feedbackDefinitions="${Ee}"
          .headerMenuItems="${Se}"
          .customLabels="${Ae}"
          ai-slug-content="${_e}"
          .aiSlugObject="${gt}"
          input-field-placeholder="${"What can I assist you with today?"}"
          .conversation="${a==="Examples"?ae[e]:t}"
          @on-user-message-update-request="${n=>{console.log(n)}}"
          @on-user-regeneration-request="${n=>{console.log(n)}}"
          @on-user-feedback-request="${n=>{console.log(n)}}"
          @on-user-text-input="${n=>{console.log(n)}}"
          @on-message-element-tag-selected="${n=>{console.log(n)}}"
          @on-header-menu-item-selected="${n=>{console.log(n)}}"
          @on-user-complex-feedback-request="${n=>{console.log(n)}}"
          @on-message-element-selected="${n=>{console.log(n)}}">
        </clabs-chat>
      </div>
      ${a==="Examples"&&e!=="None"&&e!=="ShowAll"?y` <div style="width:400px; overflow-y:auto;">
            <h4>JSON conversation object</h4>
            <cds-code-snippet
              wrap-text
              minCollapsedNumberOfRows=${200}
              type="multi"
              >${JSON.stringify(ae[e],null,2)}</cds-code-snippet
            >
          </div>`:y``}
    </div>
  `};var se,ie,re;j.parameters={...j.parameters,docs:{...(se=j.parameters)==null?void 0:se.docs,source:{originalSource:`{
  argTypes: apiControls,
  args: apiArgs,
  parameters: {
    controls: {
      expanded: true
    },
    layout: 'fullscreen'
  },
  /**
   * Renders the template for Playground Storybook
   * @param {Object} args - arguments to be sent into the playbook
   * @param {string} args.apiUrl - api url provided in playground
   * @param {string} args.feedbackUrl - feedback api url for buttons provided in playground
   * @param {string} args.userPrompt - user specific prompt provided in playground
   * @param {string} args.temperature - model temperature
   * @returns {TemplateResult<1>}
   */
  render: ({
    apiUrl,
    feedbackUrl,
    userPrompt,
    temperature
  }) => html\`
    <div style="height:calc(100vh - 84px);">
      <clabs-chat
        .headerMenuItems="\${headerMenuItems}"
        @on-header-menu-item-selected="\${e => {
    console.log(e);
  }}"
        model="llama-2"
        auto-update
        .customLabels="\${customLabels}"
        ai-slug-content="\${slugText}"
        user-prompt="\${userPrompt}"
        enable-feedback-form
        .feedbackDefinitions="\${feedbackFormOptions}"
        .dockBoundaries="\${dockBoundaries}"
        api-url="\${apiUrl}"
        enable-request-cancelling
        feedback-url="\${feedbackUrl}"
        temperature="\${temperature || 0.2}"
        user-name="Owen"
        agent-name="AI Bot">
      </clabs-chat>
    </div>
  \`
}`,...(re=(ie=j.parameters)==null?void 0:ie.docs)==null?void 0:re.source}}};var ce,le,de;P.parameters={...P.parameters,docs:{...(ce=P.parameters)==null?void 0:ce.docs,source:{originalSource:`{
  argTypes: slottingControls,
  args: slottingArgs,
  parameters: {
    controls: {
      expanded: true
    },
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'storybook-default'
    }
  },
  /**
   * Renders the template for Default Storybook
   * @param {Object} args - arguments to be sent into the playbook
   * @param {string} args.userName - set user name
   * @param {string} args.agentName - set chat bot name
   * @param {Object} args.conversation - array of message object to render
   * @returns {TemplateResult<1>}
   */
  render: ({
    userName,
    agentName,
    conversation
  }) => html\`
    <div style="height:calc(100vh - 84px); overflow:hidden;">
      <clabs-chat
        user-name="\${userName}"
        agent-name="\${agentName}"
        conversation="\${conversation}">
        <clabs-chat-messages slot="messages" user-name="user" agent-name="bot">
          <clabs-chat-message
            slot="message-items"
            origin="user"
            user-submitted
            time-stamp="9:02"
            index="0">
            <clabs-chat-text
              slot="message-item-content"
              content="Showcase every type of Element available in this Chat component.">
            </clabs-chat-text>
          </clabs-chat-message>

          <clabs-chat-message
            slot="message-items"
            origin="bot"
            time-stamp="9:04"
            index="1">
            <clabs-chat-text
              slot="message-item-content"
              content="This is a textElement, displays text following Carbon design guidelines."></clabs-chat-text>
            <clabs-chat-text
              slot="message-item-content"
              enable-html-rendering
              content="TextElement can also render simple HTML as such:
 <h2>This is using a h2 tag</h2>
"></clabs-chat-text>

            <clabs-chat-text
              slot="message-item-content"
              content="You can also specify a simple slotted div with any content: (Youtube embed example)
"></clabs-chat-text>
            <div slot="message-item-content">
              <iframe
                width="256"
                height="256"
                src="https://www.youtube.com/embed/oSCX78-8-q0?si=kCcIHjehhVn-4PSO"
                title="YouTube video player"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen></iframe>
            </div>

            <clabs-chat-text
              slot="message-item-content"
              content="You can also show files, tables, code, action buttons or lists:"></clabs-chat-text>
            <clabs-chat-card
              slot="message-item-content"
              type="file"
              content="https://arxiv.org/pdf/2312.05688.pdf"></clabs-chat-card>
            <clabs-chat-table
              slot="message-item-content"
              content="Name,Age,Occupation,Location,State
Jerry,35,Comedian,Upper east side,NY
George,35,Unemployed,Queens,NY
Elaine,32,Publisher,Midtown,NY
Kramer,36,Unknown,Upper east side,NY"></clabs-chat-table>

            <clabs-chat-code
              slot="message-item-content"
              content="from math import sqrt
#prime function to check given number prime or not:
def Prime(number,itr):
    #base condition
    if itr == 1:
        return True
    #if given number divided by itr or not
    if number % itr == 0:
        return False
    #Recursive function Call
    if Prime(number,itr-1) == False:
        return False
    return True
"></clabs-chat-code>

            <clabs-chat-tag-list
              slot="message-item-content"
              content='["Simone de Beauvoir","René Descartes","Jean-Paul Sartre","Voltaire","Michel Foucault","Albert Camus"]'></clabs-chat-tag-list>

            <clabs-chat-list
              slot="message-item-content"
              content="1. Google.com (United States)
2. YouTube.com (US)
3. Facebook.com (US)
4. Baidu.com (China)
5. Wikipedia.org (US)"></clabs-chat-list>
            <clabs-chat-text
              slot="message-item-content"
              content="And finally any chart you wish!"></clabs-chat-text>

            <clabs-chat-chart
              container-height="400px"
              slot="message-item-content"
              content='{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"US Unemployment by county","data":{"url":"https://vega.github.io/editor/data/us-10m.json","format":{"type":"topojson","feature":"counties"}},"transform":[{"lookup":"id","from":{"data":{"url":"https://vega.github.io/editor/data/unemployment.tsv"},"key":"id","fields":["rate"]}}],"projection":{"type":"albersUsa"},"mark":"geoshape","encoding":{"color":{"field":"rate","type":"quantitative"}}}'></clabs-chat-chart>
            <clabs-chat-chart
              container-height="600px"
              slot="message-item-content"
              content='{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Deaths by natural disasters","data":{"url":"https://vega.github.io/vega-lite/examples/data/disasters.csv"},"width":600,"height":400,"mark":{"type":"circle","opacity":0.8,"stroke":"black","strokeWidth":1},"encoding":{"x":{"field":"Year","type":"temporal","axis":{"grid":false}},"y":{"field":"Entity","type":"nominal","axis":{"title":""}},"size":{"field":"Deaths","type":"quantitative","title":"Annual Global Deaths","legend":{"clipHeight":30},"scale":{"rangeMax":5000}},"color":{"field":"Entity","type":"nominal","legend":null}}}'></clabs-chat-chart>
            <clabs-chat-chart
              container-height="200px"
              slot="message-item-content"
              content='{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Boxplot example with random data","data":{"values":[{"group":"Group A","value":34},{"group":"Group A","value":28},{"group":"Group A","value":55},{"group":"Group B","value":91},{"group":"Group B","value":81},{"group":"Group B","value":67},{"group":"Group C","value":45},{"group":"Group C","value":66},{"group":"Group C","value":73},{"group":"Group D","value":28},{"group":"Group D","value":35},{"group":"Group D","value":56},{"group":"Group E","value":12},{"group":"Group E","value":45},{"group":"Group E","value":99}]},"mark":"boxplot","encoding":{"y":{"field":"group","type":"nominal"},"x":{"field":"value","type":"quantitative"}}}'></clabs-chat-chart>
            <clabs-chat-chart
              container-height="350px"
              slot="message-item-content"
              content='{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","data":{"url":"https://vega.github.io/vega-lite/data/barley.json"},"mark":"bar","encoding":{"x":{"aggregate":"sum","field":"yield"},"y":{"field":"variety"},"color":{"field":"site"}}}'></clabs-chat-chart>
            <clabs-chat-chart
              container-height="250px"
              slot="message-item-content"
              content='{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Stock prices of 5 Tech Companies over Time.","data":{"url":"https://vega.github.io/vega-lite/examples/data/stocks.csv"},"mark":"line","encoding":{"x":{"field":"date","type":"temporal"},"y":{"field":"price","type":"quantitative"},"color":{"field":"symbol","type":"nominal"}}}'></clabs-chat-chart>
          </clabs-chat-message>
        </clabs-chat-messages>
      </clabs-chat>
    </div>
  \`
}`,...(de=(le=P.parameters)==null?void 0:le.docs)==null?void 0:de.source}}};var pe,me,ue;D.parameters={...D.parameters,docs:{...(pe=D.parameters)==null?void 0:pe.docs,source:{originalSource:`{
  argTypes: textPlaygroundControls,
  args: textPlaygroundArgs,
  parameters: {
    controls: {
      expanded: true
    },
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'storybook-default'
    }
  },
  /**
   * Renders the template for Playground Storybook
   * @param {Object} args - textPlayground preset arguments
   * @param {string} args.queryMode - set between premade examples and text input from user in story
   * @param {string} args.sampleQuery - preset name of example
   * @param {Object} args.rawText - raw text from user
   * @returns {TemplateResult<1>}
   */
  render: ({
    queryMode,
    sampleQuery,
    rawText
  }) => html\`
    <div
      style="height:calc(100vh - 84px); overflow:hidden; display:inline-flex; width:100%;">
      <div style="height:calc(100vh - 84px); flex:2;">
        \${queryMode == 'Examples' ? html\` <clabs-chat
              sample-query="\${rawTextExamples[sampleQuery]}"
              user-name="user"
              agent-name="bot">
            </clabs-chat>\` : html\` <clabs-chat
              sample-query="\${rawText}"
              user-name="user"
              agent-name="bot">
            </clabs-chat>\`}
      </div>
      \${sampleQuery !== 'None' && queryMode == 'Examples' ? html\`
            <div
              style="height:calc(100vh - 84px); width:400px; padding-left:20px;overflow-y:auto;">
              <h4>Raw LLM text</h4>
              <cds-code-snippet
                wrap-text
                minCollapsedNumberOfRows=\${200}
                type="multi"
                >\${rawTextExamples[sampleQuery]}</cds-code-snippet
              >
            </div>
          \` : html\`\`}
    </div>
  \`
}`,...(ue=(me=D.parameters)==null?void 0:me.docs)==null?void 0:ue.source}}};var he,ge,be;F.parameters={...F.parameters,docs:{...(he=F.parameters)==null?void 0:he.docs,source:{originalSource:`{
  argTypes: textPlaygroundControls,
  args: textPlaygroundArgs,
  parameters: {
    controls: {
      expanded: true
    },
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'storybook-default'
    }
  },
  /**
   * Renders the template for Playground Storybook
   * @param {Object} args - textPlayground preset arguments
   * @param {string} args.queryMode - set between premade examples and text input from user in story
   * @param {string} args.sampleQuery - preset name of example
   * @param {Object} args.rawText - raw text from user
   * @returns {TemplateResult<1>}
   */
  render: ({
    queryMode,
    sampleQuery,
    rawText
  }) => html\`
    <div
      style="height:calc(100vh - 44px); display:flex; max-width:100%; overflow:hidden; gap:20px;">
      <div style="flex:2;">
        \${queryMode == 'Examples' ? html\` <clabs-chat
              sample-query="\${rawTextExamples[sampleQuery]}"
              user-name="user"
              stream-responses
              default-viewing-mode="fullscreen"
              agent-name="bot">
            </clabs-chat>\` : html\` <clabs-chat
              sample-query="\${rawText}"
              user-name="user"
              stream-responses
              default-viewing-mode="fullscreen"
              agent-name="bot">
            </clabs-chat>\`}
      </div>
      \${sampleQuery === 'None' && queryMode == 'Examples' ? html\`
            <div style="width:400px; overflow-y:auto;">
              <h4>Raw LLM text</h4>
              <cds-code-snippet
                wrap-text
                minCollapsedNumberOfRows=\${200}
                type="multi"
                >\${rawTextExamples[sampleQuery]}</cds-code-snippet
              >
            </div>
          \` : html\`\`}
    </div>
  \`
}`,...(be=(ge=F.parameters)==null?void 0:ge.docs)==null?void 0:be.source}}};var ye,ve,fe;H.parameters={...H.parameters,docs:{...(ye=H.parameters)==null?void 0:ye.docs,source:{originalSource:`{
  component: 'clabs-chat',
  argTypes: objectPlaygroundControls,
  args: objectPlaygroundArgs,
  parameters: {
    controls: {
      expanded: true
    },
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'storybook-default'
    }
  },
  /**
   * Renders the template for Playground Storybook
   * @param {Object} args - arguments to be sent into the playbook
   * @param {string} args.testMode - switch between user input JSONs and premade examples
   * @param {Object} args.sampleConversation - array of message object to render
   * @param {Object} args.conversationJSON - user defined JSON conversation set in story
   * @returns {TemplateResult<1>}
   */
  render: ({
    testMode,
    sampleConversation,
    conversationJSON
  }) => html\`
    <div
      style="height:calc(100vh - 84px); display:flex; max-width:100%; gap:20px;">
      <div style="flex:2;">
        <clabs-chat
          user-name="user"
          agent-name="bot"
          enable-feedback-form
          enable-launcher
          .feedbackDefinitions="\${feedbackFormOptions}"
          .headerMenuItems="\${headerMenuItems}"
          .customLabels="\${customLabels}"
          ai-slug-content="\${slugText}"
          .aiSlugObject="\${slugContent}"
          input-field-placeholder="\${'What can I assist you with today?'}"
          .conversation="\${testMode === 'Examples' ? conversationExamples[sampleConversation] : conversationJSON}"
          @on-user-message-update-request="\${e => {
    console.log(e);
  }}"
          @on-user-regeneration-request="\${e => {
    console.log(e);
  }}"
          @on-user-feedback-request="\${e => {
    console.log(e);
  }}"
          @on-user-text-input="\${e => {
    console.log(e);
  }}"
          @on-message-element-tag-selected="\${e => {
    console.log(e);
  }}"
          @on-header-menu-item-selected="\${e => {
    console.log(e);
  }}"
          @on-user-complex-feedback-request="\${e => {
    console.log(e);
  }}"
          @on-message-element-selected="\${e => {
    console.log(e);
  }}">
        </clabs-chat>
      </div>
      \${testMode === 'Examples' && sampleConversation !== 'None' && sampleConversation !== 'ShowAll' ? html\` <div style="width:400px; overflow-y:auto;">
            <h4>JSON conversation object</h4>
            <cds-code-snippet
              wrap-text
              minCollapsedNumberOfRows=\${200}
              type="multi"
              >\${JSON.stringify(conversationExamples[sampleConversation], null, 2)}</cds-code-snippet
            >
          </div>\` : html\`\`}
    </div>
  \`
}`,...(fe=(ve=H.parameters)==null?void 0:ve.docs)==null?void 0:fe.source}}};const kt=["APIPlayground","Slotting","LLMTextPlayground","StreamTextPlayground","Playground"],Ft=Object.freeze(Object.defineProperty({__proto__:null,APIPlayground:j,LLMTextPlayground:D,Playground:H,Slotting:P,StreamTextPlayground:F,__namedExportsOrder:kt,default:ut},Symbol.toStringTag,{value:"Module"}));export{Ft as C};

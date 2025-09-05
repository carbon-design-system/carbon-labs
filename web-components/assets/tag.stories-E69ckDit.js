import{n as p,t as P}from"./property-D4t-O7Ok.js";import{i as $,c as k,x as m}from"./iframe-CaJcJN16.js";import"./definition-tooltip-BwdckSYN.js";/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const v={stablePrefix:"clabs",prefix:"cds"},_=$`:host(clabs-tag){display:flex;justify-content:center;padding:96px 48px;background-color:#222}:host(clabs-tag) .clabs--tag-container{position:relative;display:inline-block}:host(clabs-tag) .clabs--tag-button{display:inline-block;box-sizing:border-box;padding:16px;border-width:0;border-style:none;background-color:#525252;block-size:48px;border-image:none;border-inline-start:4px solid var(--border-color, #67ba6e);color:#fff;font-size:18px;line-height:inherit}:host(clabs-tag) .clabs--tag-button:focus,:host(clabs-tag) .clabs--tag-button:active{outline:2px solid #ffffff;outline-offset:-2px}:host(clabs-tag) .clabs--tag-button:hover{background-color:#393939}:host(clabs-tag) .clabs--tag-button:active{background-color:#262626}:host(clabs-tag) .clabs--tag-button:hover,:host(clabs-tag) .clabs--tag-button:focus{cursor:pointer}:host(clabs-tag) .tooltip{position:absolute;z-index:1;padding:1rem;border-radius:2px;background-color:#333;color:#fff;inset-block-start:100%;inset-inline-start:50%;margin-block-start:10px;opacity:0;text-align:center;transform:translate(-50%);visibility:hidden;white-space:nowrap}:host(clabs-tag) .tooltip:after{position:absolute;border-width:5px;border-style:solid;border-color:#333333 transparent transparent;content:"";inset-block-start:-10px;inset-inline-start:50%;transform:scaleY(-1)}:host(clabs-tag) .clabs--tag-container:hover .tooltip{opacity:1;visibility:visible}`;var T=Object.defineProperty,b=(s,o,e,r)=>{for(var t=void 0,i=s.length-1,a;i>=0;i--)(a=s[i])&&(t=a(o,e,t)||t);return t&&T(o,e,t),t};const d=class d extends k{updated(o){super.updated(o),o.has("color")&&(this.color==="red"?this.style.setProperty("--border-color","#fa4d56"):this.color==="magenta"?this.style.setProperty("--border-color","#ee5396"):this.color==="purple"?this.style.setProperty("--border-color","#a56eff"):this.color==="blue"?this.style.setProperty("--border-color","#4589ff"):this.color==="cyan"?this.style.setProperty("--border-color","#1192e8"):this.color==="teal"?this.style.setProperty("--border-color","#009d9a"):this.color==="green"?this.style.setProperty("--border-color","#24a148"):this.color==="gray"?this.style.setProperty("--border-color","#8d8d8d"):this.color==="cool-gray"?this.style.setProperty("--border-color","#878d96"):this.color==="warm-gray"?this.style.setProperty("--border-color","#8f8b8b"):this.style.setProperty("--border-color","#24a148"))}handleClick(){this.dispatchEvent(new CustomEvent("tag-click",{detail:{message:"Tag clicked"}}))}};d.styles=_;let l=d;b([p({attribute:"text",type:String})],l.prototype,"text");b([p({attribute:"color",type:String})],l.prototype,"color");b([p({attribute:"tooltip-position",type:String})],l.prototype,"tooltipPosition");b([p({attribute:"tooltip-text",type:String})],l.prototype,"tooltipText");/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const{stablePrefix:c}=v;function C(s){const{text:o,color:e,tooltipPosition:r,tooltipText:t,handleClick:i}=s;return m` <div class="${c}--tag">
    <div class="${c}--tag-container">
      <cds-tooltip align="${r}">
        <button
          class="${c}--tag-button ${c}--tag-tooltip-trigger"
          color="${e}"
          tooltip-position="${r}"
          @click="${i}">
          <slot>${o}</slot>
        </button>
        <cds-tooltip-content id="content"> ${t} </cds-tooltip-content>
      </cds-tooltip>
    </div>
  </div>`}var w=Object.defineProperty,O=Object.getOwnPropertyDescriptor,S=(s,o,e,r)=>{for(var t=r>1?void 0:r?O(o,e):o,i=s.length-1,a;i>=0;i--)(a=s[i])&&(t=(r?a(o,e,t):a(t))||t);return r&&t&&w(o,e,t),t};const{stablePrefix:j}=v;let g=class extends l{render(){return C(this)}};g=S([P(`${j}-tag`)],g);/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const{action:D}=__STORYBOOK_MODULE_ACTIONS__,z={title:"Components/Research/Tag",component:"clabs-tag"},R={text:"Default tag text",color:"green",tooltipPosition:"bottom",tooltipText:"Default tooltip text",onClick:D("tag-click")},A={text:{control:{type:"text"},description:"Text inside the tag"},color:{control:{type:"select"},options:["red","magenta","purple","blue","cyan","teal","green","gray","cool-gray","warm-gray"],description:"Left border color"},tooltipPosition:{control:{type:"radio"},options:["top","left","right","bottom"],description:"Tooltip position relative to the tag"},tooltipText:{control:{type:"text"},description:"Text inside the tooltip"},"tooltip-position":{table:{disable:!0}},"tooltip-text":{table:{disable:!0}},onClick:{table:{disable:!0}}},n={argTypes:A,args:R,render:({text:s,color:o,tooltipPosition:e,tooltipText:r,onClick:t})=>m` <clabs-tag
      color=${o}
      tooltip-position=${e}
      tooltip-text=${r}
      @tag-click=${t}
      >${s}</clabs-tag
    >`};var f,u,y,h,x;n.parameters={...n.parameters,docs:{...(f=n.parameters)==null?void 0:f.docs,source:{originalSource:`{
  argTypes: defaultControls,
  args: defaultArgs,
  /**
   * Renders the template for Storybook
   * @param {string} text - text
   * @param {string} color - color
   * @param {string} tooltipPosition - tooltip position
   * @param {string} tooltipText - tooltip text
   * @param {function} onClick - onclick
   * @returns {TemplateResult<1>}
   */
  render: ({
    text,
    color,
    tooltipPosition,
    tooltipText,
    onClick
  }) => html\` <clabs-tag
      color=\${color}
      tooltip-position=\${tooltipPosition}
      tooltip-text=\${tooltipText}
      @tag-click=\${onClick}
      >\${text}</clabs-tag
    >\`
}`,...(y=(u=n.parameters)==null?void 0:u.docs)==null?void 0:y.source},description:{story:`More on writing stories with args: https://storybook.js.org/docs/web-components/writing-stories/args

@type {{args: {label: string}, render: (function(*): TemplateResult<1>)}}`,...(x=(h=n.parameters)==null?void 0:h.docs)==null?void 0:x.description}}};const E=["Default"],Y=Object.freeze(Object.defineProperty({__proto__:null,Default:n,__namedExportsOrder:E,default:z},Symbol.toStringTag,{value:"Module"}));export{Y as T};

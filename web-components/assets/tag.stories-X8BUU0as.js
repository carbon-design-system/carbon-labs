import{n as p,t as k}from"./property-CzrLTE60.js";import{i as P,c as $,x as m}from"./iframe-ClXo_xvh.js";import"./definition-tooltip-DwxrBxdP.js";import{s as v}from"./settings-BQP9c3yA.js";const T=P`:host(clabs-tag){display:flex;justify-content:center;padding:96px 48px;background-color:#222}:host(clabs-tag) .clabs--tag-container{position:relative;display:inline-block}:host(clabs-tag) .clabs--tag-button{display:inline-block;box-sizing:border-box;padding:16px;border-width:0;border-style:none;background-color:#525252;block-size:48px;border-image:none;border-inline-start:4px solid var(--border-color, #67ba6e);color:#fff;font-size:18px;line-height:inherit}:host(clabs-tag) .clabs--tag-button:focus,:host(clabs-tag) .clabs--tag-button:active{outline:2px solid #ffffff;outline-offset:-2px}:host(clabs-tag) .clabs--tag-button:hover{background-color:#393939}:host(clabs-tag) .clabs--tag-button:active{background-color:#262626}:host(clabs-tag) .clabs--tag-button:hover,:host(clabs-tag) .clabs--tag-button:focus{cursor:pointer}:host(clabs-tag) .tooltip{position:absolute;z-index:1;padding:1rem;border-radius:2px;background-color:#333;color:#fff;inset-block-start:100%;inset-inline-start:50%;margin-block-start:10px;opacity:0;text-align:center;transform:translate(-50%);visibility:hidden;white-space:nowrap}:host(clabs-tag) .tooltip:after{position:absolute;border-width:5px;border-style:solid;border-color:#333333 transparent transparent;content:"";inset-block-start:-10px;inset-inline-start:50%;transform:scaleY(-1)}:host(clabs-tag) .clabs--tag-container:hover .tooltip{opacity:1;visibility:visible}`;var _=Object.defineProperty,b=(e,o,s,i)=>{for(var t=void 0,r=e.length-1,n;r>=0;r--)(n=e[r])&&(t=n(o,s,t)||t);return t&&_(o,s,t),t};const d=class d extends ${updated(o){super.updated(o),o.has("color")&&(this.color==="red"?this.style.setProperty("--border-color","#fa4d56"):this.color==="magenta"?this.style.setProperty("--border-color","#ee5396"):this.color==="purple"?this.style.setProperty("--border-color","#a56eff"):this.color==="blue"?this.style.setProperty("--border-color","#4589ff"):this.color==="cyan"?this.style.setProperty("--border-color","#1192e8"):this.color==="teal"?this.style.setProperty("--border-color","#009d9a"):this.color==="green"?this.style.setProperty("--border-color","#24a148"):this.color==="gray"?this.style.setProperty("--border-color","#8d8d8d"):this.color==="cool-gray"?this.style.setProperty("--border-color","#878d96"):this.color==="warm-gray"?this.style.setProperty("--border-color","#8f8b8b"):this.style.setProperty("--border-color","#24a148"))}handleClick(){this.dispatchEvent(new CustomEvent("tag-click",{detail:{message:"Tag clicked"}}))}};d.styles=T;let l=d;b([p({attribute:"text",type:String})],l.prototype,"text");b([p({attribute:"color",type:String})],l.prototype,"color");b([p({attribute:"tooltip-position",type:String})],l.prototype,"tooltipPosition");b([p({attribute:"tooltip-text",type:String})],l.prototype,"tooltipText");/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const{stablePrefix:c}=v;function C(e){const{text:o,color:s,tooltipPosition:i,tooltipText:t,handleClick:r}=e;return m` <div class="${c}--tag">
    <div class="${c}--tag-container">
      <cds-tooltip align="${i}">
        <button
          class="${c}--tag-button ${c}--tag-tooltip-trigger"
          color="${s}"
          tooltip-position="${i}"
          @click="${r}">
          <slot>${o}</slot>
        </button>
        <cds-tooltip-content id="content"> ${t} </cds-tooltip-content>
      </cds-tooltip>
    </div>
  </div>`}var w=Object.getOwnPropertyDescriptor,O=(e,o,s,i)=>{for(var t=i>1?void 0:i?w(o,s):o,r=e.length-1,n;r>=0;r--)(n=e[r])&&(t=n(t)||t);return t};const{stablePrefix:S}=v;let g=class extends l{render(){return C(this)}};g=O([k(`${S}-tag`)],g);/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const{action:D}=__STORYBOOK_MODULE_ACTIONS__,j={title:"Components/Research/Tag",component:"clabs-tag"},z={text:"Default tag text",color:"green",tooltipPosition:"bottom",tooltipText:"Default tooltip text",onClick:D("tag-click")},R={text:{control:{type:"text"},description:"Text inside the tag"},color:{control:{type:"select"},options:["red","magenta","purple","blue","cyan","teal","green","gray","cool-gray","warm-gray"],description:"Left border color"},tooltipPosition:{control:{type:"radio"},options:["top","left","right","bottom"],description:"Tooltip position relative to the tag"},tooltipText:{control:{type:"text"},description:"Text inside the tooltip"},"tooltip-position":{table:{disable:!0}},"tooltip-text":{table:{disable:!0}},onClick:{table:{disable:!0}}},a={argTypes:R,args:z,render:({text:e,color:o,tooltipPosition:s,tooltipText:i,onClick:t})=>m` <clabs-tag
      color=${o}
      tooltip-position=${s}
      tooltip-text=${i}
      @tag-click=${t}
      >${e}</clabs-tag
    >`};var f,u,y,h,x;a.parameters={...a.parameters,docs:{...(f=a.parameters)==null?void 0:f.docs,source:{originalSource:`{
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
}`,...(y=(u=a.parameters)==null?void 0:u.docs)==null?void 0:y.source},description:{story:`More on writing stories with args: https://storybook.js.org/docs/web-components/writing-stories/args

@type {{args: {label: string}, render: (function(*): TemplateResult<1>)}}`,...(x=(h=a.parameters)==null?void 0:h.docs)==null?void 0:x.description}}};const A=["Default"],Y=Object.freeze(Object.defineProperty({__proto__:null,Default:a,__namedExportsOrder:A,default:j},Symbol.toStringTag,{value:"Module"}));export{Y as T};

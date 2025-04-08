import{n as d,t as j}from"./property-DRkoNOFH.js";import{i as C,r as A,x as w}from"./lit-element-CKvUdWNz.js";import"./tooltip-content-BCxJYL9z.js";import{v as I}from"./v4-CQkTLCs1.js";/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const E={stablePrefix:"clabs",prefix:"cds"},z=C`:host(clabs-tag){display:flex;justify-content:center;padding:96px 48px;background-color:#222}:host(clabs-tag) .clabs--tag-container{position:relative;display:inline-block}:host(clabs-tag) .clabs--tag-button{display:inline-block;box-sizing:border-box;padding:16px;border-width:0;border-style:none;background-color:#525252;block-size:48px;border-image:none;border-inline-start:4px solid var(--border-color, #67ba6e);color:#fff;font-size:18px;line-height:inherit}:host(clabs-tag) .clabs--tag-button:focus,:host(clabs-tag) .clabs--tag-button:active{outline:2px solid #ffffff;outline-offset:-2px}:host(clabs-tag) .clabs--tag-button:hover{background-color:#393939}:host(clabs-tag) .clabs--tag-button:active{background-color:#262626}:host(clabs-tag) .clabs--tag-button:hover,:host(clabs-tag) .clabs--tag-button:focus{cursor:pointer}:host(clabs-tag) .tooltip{position:absolute;z-index:1;padding:1rem;border-radius:2px;background-color:#333;color:#fff;inset-block-start:100%;inset-inline-start:50%;margin-block-start:10px;opacity:0;text-align:center;transform:translate(-50%);visibility:hidden;white-space:nowrap}:host(clabs-tag) .tooltip:after{position:absolute;border-width:5px;border-style:solid;border-color:#333333 transparent transparent;content:"";inset-block-start:-10px;inset-inline-start:50%;transform:scaleY(-1)}:host(clabs-tag) .clabs--tag-container:hover .tooltip{opacity:1;visibility:visible}`;var B=Object.defineProperty,b=(o,t,e,i)=>{for(var r=void 0,s=o.length-1,n;s>=0;s--)(n=o[s])&&(r=n(t,e,r)||r);return r&&B(t,e,r),r};const g=class g extends A{updated(t){super.updated(t),t.has("color")&&(this.color==="red"?this.style.setProperty("--border-color","#fa4d56"):this.color==="magenta"?this.style.setProperty("--border-color","#ee5396"):this.color==="purple"?this.style.setProperty("--border-color","#a56eff"):this.color==="blue"?this.style.setProperty("--border-color","#4589ff"):this.color==="cyan"?this.style.setProperty("--border-color","#1192e8"):this.color==="teal"?this.style.setProperty("--border-color","#009d9a"):this.color==="green"?this.style.setProperty("--border-color","#24a148"):this.color==="gray"?this.style.setProperty("--border-color","#8d8d8d"):this.color==="cool-gray"?this.style.setProperty("--border-color","#878d96"):this.color==="warm-gray"?this.style.setProperty("--border-color","#8f8b8b"):this.style.setProperty("--border-color","#24a148"))}handleClick(){this.dispatchEvent(new CustomEvent("tag-click",{detail:{message:"Tag clicked"}}))}};g.styles=z;let l=g;b([d({attribute:"text",type:String})],l.prototype,"text");b([d({attribute:"color",type:String})],l.prototype,"color");b([d({attribute:"tooltip-position",type:String})],l.prototype,"tooltipPosition");b([d({attribute:"tooltip-text",type:String})],l.prototype,"tooltipText");/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const{stablePrefix:p}=E;function V(o){const{text:t,color:e,tooltipPosition:i,tooltipText:r,handleClick:s}=o;return w` <div class="${p}--tag">
    <div class="${p}--tag-container">
      <cds-tooltip align="${i}">
        <button
          class="${p}--tag-button ${p}--tag-tooltip-trigger"
          color="${e}"
          tooltip-position="${i}"
          @click="${s}">
          <slot>${t}</slot>
        </button>
        <cds-tooltip-content id="content"> ${r} </cds-tooltip-content>
      </cds-tooltip>
    </div>
  </div>`}var L=Object.defineProperty,M=Object.getOwnPropertyDescriptor,Y=(o,t,e,i)=>{for(var r=i>1?void 0:i?M(t,e):t,s=o.length-1,n;s>=0;s--)(n=o[s])&&(r=(i?n(t,e,r):n(r))||r);return i&&r&&L(t,e,r),r};const{stablePrefix:K}=E;let x=class extends l{render(){return V(this)}};x=Y([j(`${K}-tag`)],x);const{addons:W}=__STORYBOOK_MODULE_PREVIEW_API__,{ImplicitActionsDuringRendering:U}=__STORYBOOK_MODULE_CORE_EVENTS_PREVIEW_ERRORS__,{global:_}=__STORYBOOK_MODULE_GLOBAL__;var F="storybook/actions",N=`${F}/action-event`,G={depth:10,clearOnStoryChange:!0,limit:50},R=(o,t)=>{let e=Object.getPrototypeOf(o);return!e||t(e)?e:R(e,t)},q=o=>!!(typeof o=="object"&&o&&R(o,t=>/^Synthetic(?:Base)?Event$/.test(t.constructor.name))&&typeof o.persist=="function"),H=o=>{if(q(o)){let t=Object.create(o.constructor.prototype,Object.getOwnPropertyDescriptors(o));t.persist();let e=Object.getOwnPropertyDescriptor(t,"view"),i=e==null?void 0:e.value;return typeof i=="object"&&(i==null?void 0:i.constructor.name)==="Window"&&Object.defineProperty(t,"view",{...e,value:Object.create(i.constructor.prototype)}),t}return o},J=()=>typeof crypto=="object"&&typeof crypto.getRandomValues=="function"?I():Date.now().toString(36)+Math.random().toString(36).substring(2);function Q(o,t={}){let e={...G,...t},i=function(...r){var u,y;if(t.implicit){let h=(u="__STORYBOOK_PREVIEW__"in _?_.__STORYBOOK_PREVIEW__:void 0)==null?void 0:u.storyRenders.find(c=>c.phase==="playing"||c.phase==="rendering");if(h){let c=!((y=window==null?void 0:window.FEATURES)!=null&&y.disallowImplicitActionsInRenderV8),m=new U({phase:h.phase,name:o,deprecated:c});if(c)console.warn(m);else throw m}}let s=W.getChannel(),n=J(),S=5,f=r.map(H),k=r.length>1?f:f[0],D={id:n,count:0,data:{name:o,args:k},options:{...e,maxDepth:S+(e.depth||3),allowFunction:e.allowFunction||!1}};s.emit(N,D)};return i.isAction=!0,i.implicit=t.implicit,i}/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const X={title:"Components/Research/Tag",component:"clabs-tag"},Z={text:"Default tag text",color:"green",tooltipPosition:"bottom",tooltipText:"Default tooltip text",onClick:Q("tag-click")},tt={text:{control:{type:"text"},description:"Text inside the tag"},color:{control:{type:"select"},options:["red","magenta","purple","blue","cyan","teal","green","gray","cool-gray","warm-gray"],description:"Left border color"},tooltipPosition:{control:{type:"radio"},options:["top","left","right","bottom"],description:"Tooltip position relative to the tag"},tooltipText:{control:{type:"text"},description:"Text inside the tooltip"},"tooltip-position":{table:{disable:!0}},"tooltip-text":{table:{disable:!0}},onClick:{table:{disable:!0}}},a={argTypes:tt,args:Z,render:({text:o,color:t,tooltipPosition:e,tooltipText:i,onClick:r})=>w` <clabs-tag
      color=${t}
      tooltip-position=${e}
      tooltip-text=${i}
      @tag-click=${r}
      >${o}</clabs-tag
    >`};var O,v,P,T,$;a.parameters={...a.parameters,docs:{...(O=a.parameters)==null?void 0:O.docs,source:{originalSource:`{
  argTypes: defaultControls,
  args: defaultArgs,
  /**
   * Renders the template for Storybook
   * @param {string} args.content - content to generate from
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
}`,...(P=(v=a.parameters)==null?void 0:v.docs)==null?void 0:P.source},description:{story:`More on writing stories with args: https://storybook.js.org/docs/web-components/writing-stories/args

@type {{args: {label: string}, render: (function(*): TemplateResult<1>)}}`,...($=(T=a.parameters)==null?void 0:T.docs)==null?void 0:$.description}}};const ot=["Default"],nt=Object.freeze(Object.defineProperty({__proto__:null,Default:a,__namedExportsOrder:ot,default:X},Symbol.toStringTag,{value:"Module"}));export{nt as T};

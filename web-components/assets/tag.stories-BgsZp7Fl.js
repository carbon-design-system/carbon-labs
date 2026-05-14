import{n as e}from"./chunk-gsjJvkCQ.js";import{a as t,d as n,t as r}from"./lit-Cfdn9GWx.js";import{a as i,i as a,t as o}from"./decorate-DlKJ2G3r.js";import{t as s}from"./settings-BbwrJQg3.js";import{t as c}from"./decorateMetadata-HWoXzJmK.js";import"./definition-tooltip-B58DvNzn.js";var l=n`:host(clabs-tag){display:flex;justify-content:center;padding:96px 48px;background-color:#222}:host(clabs-tag) .clabs--tag-container{position:relative;display:inline-block}:host(clabs-tag) .clabs--tag-button{display:inline-block;box-sizing:border-box;padding:16px;border-width:0;border-style:none;background-color:#525252;block-size:48px;border-image:none;border-inline-start:4px solid var(--border-color, #67ba6e);color:#fff;font-size:18px;line-height:inherit}:host(clabs-tag) .clabs--tag-button:focus,:host(clabs-tag) .clabs--tag-button:active{outline:2px solid #ffffff;outline-offset:-2px}:host(clabs-tag) .clabs--tag-button:hover{background-color:#393939}:host(clabs-tag) .clabs--tag-button:active{background-color:#262626}:host(clabs-tag) .clabs--tag-button:hover,:host(clabs-tag) .clabs--tag-button:focus{cursor:pointer}:host(clabs-tag) .tooltip{position:absolute;z-index:1;padding:1rem;border-radius:2px;background-color:#333;color:#fff;inset-block-start:100%;inset-inline-start:50%;margin-block-start:10px;opacity:0;text-align:center;transform:translate(-50%);visibility:hidden;white-space:nowrap}:host(clabs-tag) .tooltip:after{position:absolute;border-width:5px;border-style:solid;border-color:#333333 transparent transparent;content:"";inset-block-start:-10px;inset-inline-start:50%;transform:scaleY(-1)}:host(clabs-tag) .clabs--tag-container:hover .tooltip{opacity:1;visibility:visible}`,u=class extends r{static{this.styles=l}updated(e){super.updated(e),e.has(`color`)&&(this.color===`red`?this.style.setProperty(`--border-color`,`#fa4d56`):this.color===`magenta`?this.style.setProperty(`--border-color`,`#ee5396`):this.color===`purple`?this.style.setProperty(`--border-color`,`#a56eff`):this.color===`blue`?this.style.setProperty(`--border-color`,`#4589ff`):this.color===`cyan`?this.style.setProperty(`--border-color`,`#1192e8`):this.color===`teal`?this.style.setProperty(`--border-color`,`#009d9a`):this.color===`green`?this.style.setProperty(`--border-color`,`#24a148`):this.color===`gray`?this.style.setProperty(`--border-color`,`#8d8d8d`):this.color===`cool-gray`?this.style.setProperty(`--border-color`,`#878d96`):this.color===`warm-gray`?this.style.setProperty(`--border-color`,`#8f8b8b`):this.style.setProperty(`--border-color`,`#24a148`))}handleClick(){this.dispatchEvent(new CustomEvent(`tag-click`,{detail:{message:`Tag clicked`}}))}};o([a({attribute:`text`,type:String}),c(`design:type`,Object)],u.prototype,`text`,void 0),o([a({attribute:`color`,type:String}),c(`design:type`,Object)],u.prototype,`color`,void 0),o([a({attribute:`tooltip-position`,type:String}),c(`design:type`,Object)],u.prototype,`tooltipPosition`,void 0),o([a({attribute:`tooltip-text`,type:String}),c(`design:type`,Object)],u.prototype,`tooltipText`,void 0);var{stablePrefix:d}=s;function f(e){let{text:n,color:r,tooltipPosition:i,tooltipText:a,handleClick:o}=e;return t` <div class="${d}--tag">
    <div class="${d}--tag-container">
      <cds-tooltip align="${i}">
        <button
          class="${d}--tag-button ${d}--tag-tooltip-trigger"
          color="${r}"
          tooltip-position="${i}"
          @click="${o}">
          <slot>${n}</slot>
        </button>
        <cds-tooltip-content id="content"> ${a} </cds-tooltip-content>
      </cds-tooltip>
    </div>
  </div>`}var{stablePrefix:p}=s,m=class extends u{render(){return f(this)}};m=o([i(`${p}-tag`)],m);var h=e({Default:()=>v,__namedExportsOrder:()=>y,default:()=>_}),{action:g}=__STORYBOOK_MODULE_ACTIONS__,_={title:`Components/Research/Tag`,component:`clabs-tag`},v={argTypes:{text:{control:{type:`text`},description:`Text inside the tag`},color:{control:{type:`select`},options:[`red`,`magenta`,`purple`,`blue`,`cyan`,`teal`,`green`,`gray`,`cool-gray`,`warm-gray`],description:`Left border color`},tooltipPosition:{control:{type:`radio`},options:[`top`,`left`,`right`,`bottom`],description:`Tooltip position relative to the tag`},tooltipText:{control:{type:`text`},description:`Text inside the tooltip`},"tooltip-position":{table:{disable:!0}},"tooltip-text":{table:{disable:!0}},onClick:{table:{disable:!0}}},args:{text:`Default tag text`,color:`green`,tooltipPosition:`bottom`,tooltipText:`Default tooltip text`,onClick:g(`tag-click`)},render:({text:e,color:n,tooltipPosition:r,tooltipText:i,onClick:a})=>t` <clabs-tag
      color=${n}
      tooltip-position=${r}
      tooltip-text=${i}
      @tag-click=${a}
      >${e}</clabs-tag
    >`};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source},description:{story:`More on writing stories with args: https://storybook.js.org/docs/web-components/writing-stories/args

@type {{args: {label: string}, render: (function(*): TemplateResult<1>)}}`,...v.parameters?.docs?.description}}};var y=[`Default`];export{v as Default,y as __namedExportsOrder,_ as default,h as t};
import{i as x,x as p,B as N}from"./lit-element-CKvUdWNz.js";import{P as m,B as t,s as g,c as M,a as b,b as u,i as $,p as B,r as _,f as d,d as G,e as H}from"./_story.defs-B8-PBVGf.js";/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const{stablePrefix:L,prefix:R}=H,D={title:"Components/Style Picker/Single",component:"clabs-style-picker",parameters:{docs:{description:{component:"More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction"}}}},y=x`
  .style-picker-story-container {
    margin-inline-start: 20rem;
  }

  .toolbar-layer {
    display: inline-block;
    background-color: var(--cds-layer);
    color: var(--cds-text-primary, #161616);
  }

  .inline-tile-holder {
    margin-top: 0.2rem;
  }

  .inline-tile {
    display: inline-block;
    border-inline-start: 0.25rem solid #0f62fe;
  }

  .inline-tile-header {
    display: flex;
    align-items: start;
    gap: 0.25rem;
  }

  .inline-pictogram-secondary-text {
    margin-top: 0.5rem;
  }
`,k=()=>{var n;(n=document.querySelector(`${L}-style-picker`))==null||n.toggleAttribute("open")},K=n=>{const e=n.detail.item,o=document.querySelector(`${R}-tile`);o.style.borderColor=`${e.color}`,n.target.setAttribute("selected-item",e.value)},U=n=>{const e=n.detail.item,o=document.getElementById("inline-tile-icon"),s=e.renderIcon(),r=document.createElement("div");N(s,r),o.innerHTML="",o.appendChild(r.firstElementChild),n.target.setAttribute("selected-item",e.value)},w=n=>{const e=n.detail.item;n.target.setAttribute("selected-item",e.value);const s=document.getElementById("inline-tile-pictogram"),r=_(e.pictogram),a=document.createElement("div");N(r,a),s.innerHTML="",s.appendChild(a.firstElementChild)},h={open:{control:"radio",description:"true if the modal is open"},heading:{control:"text",description:"style picker heading."},align:{control:"select",options:[...G],description:"Specify how the popover should align with the trigger element"}},l={args:{heading:"Choose color",open:!0,align:m.LEFT_TOP},argTypes:h,render:n=>p`
      <style>
        ${y}
      </style>
      <div class="style-picker-story-container">
        <cds-layer class="toolbar-layer">
          <clabs-style-picker
            align=${n.align}
            ?open=${n.open}
            heading=${n.heading}>
            <cds-icon-button
              slot="trigger"
              kind=${t.GHOST}
              @click=${k}>
              ${g({slot:"icon"})}
              <span slot="tooltip-content">Color palette</span>
            </cds-icon-button>
            <clabs-style-picker-modules slot="modules">
              <clabs-style-picker-color-module
                heading="Color"
                size="sm"
                .items=${M}
                selected-item="blue-60"
                @clabs-style-picker-module-option-change=${e=>K(e)}></clabs-style-picker-color-module>
            </clabs-style-picker-modules>
          </clabs-style-picker>
          <cds-icon-button kind=${t.GHOST}>
            ${b({slot:"icon"})}
            <span slot="tooltip-content">Edit</span>
          </cds-icon-button>
          <cds-icon-button kind=${t.GHOST}>
            ${u({slot:"icon"})}
            <span slot="tooltip-content">More</span>
          </cds-icon-button>
        </cds-layer>
        <div class="inline-tile-holder">
          <cds-tile class="inline-tile">
            <h6>Primary text</h6>
            <br />
            <small>Secondary text or description</small>
            <br /><br />
            <cds-link href="#">Link</cds-link>
          </cds-tile>
        </div>
      </div>
    `},i={args:{heading:"Choose icon",open:!0,align:m.LEFT_TOP},argTypes:h,render:n=>p`
      <style>
        ${y}
      </style>
      <div class="style-picker-story-container">
        <cds-layer class="toolbar-layer">
          <clabs-style-picker
            align=${n.align}
            ?open=${n.open}
            heading=${n.heading}>
            <cds-icon-button
              slot="trigger"
              kind=${t.GHOST}
              @click=${k}>
              ${g({slot:"icon"})}
              <span slot="tooltip-content">Icon list</span>
            </cds-icon-button>
            <clabs-style-picker-modules slot="modules">
              <clabs-style-picker-icon-module
                heading="Icon"
                size="sm"
                .items=${$}
                selected-item="apple"
                @clabs-style-picker-module-option-change=${e=>U(e)}></clabs-style-picker-icon-module>
            </clabs-style-picker-modules>
          </clabs-style-picker>
          <cds-icon-button kind=${t.GHOST}>
            ${b({slot:"icon"})}
            <span slot="tooltip-content">Edit</span>
          </cds-icon-button>
          <cds-icon-button kind=${t.GHOST}>
            ${u({slot:"icon"})}
            <span slot="tooltip-content">More</span>
          </cds-icon-button>
        </cds-layer>
        <div class="inline-tile-holder">
          <cds-tile class="inline-tile">
            <div class="inline-tile-header">
              <span id="inline-tile-icon">${$[0].renderIcon()}</span>
              <h6>Primary text</h6>
            </div>
            <br />
            <small>Secondary text or description</small>
            <br /><br />
            <cds-link href="#">Link</cds-link>
          </cds-tile>
        </div>
      </div>
    `},c={args:{heading:"Choose pictogram",open:!0,align:m.LEFT_TOP},argTypes:h,render:n=>p`
      <style>
        ${y}
      </style>
      <div class="style-picker-story-container">
        <cds-layer class="toolbar-layer">
          <clabs-style-picker
            align=${n.align}
            ?open=${n.open}
            heading=${n.heading}>
            <cds-icon-button
              slot="trigger"
              kind=${t.GHOST}
              @click=${k}>
              ${g({slot:"icon"})}
              <span slot="tooltip-content">Pictogram list</span>
            </cds-icon-button>
            <clabs-style-picker-modules slot="modules">
              <clabs-style-picker-pictogram-module
                heading=${"Pictogram"}
                size=${"lg"}
                .items=${B}
                selected-item=${"bangalore"}
                @clabs-style-picker-module-option-change=${e=>w(e)}></clabs-style-picker-pictogram-module>
            </clabs-style-picker-modules>
          </clabs-style-picker>
          <cds-icon-button kind=${t.GHOST}>
            ${b({slot:"icon"})}
            <span slot="tooltip-content">Edit</span>
          </cds-icon-button>
          <cds-icon-button kind=${t.GHOST}>
            ${u({slot:"icon"})}
            <span slot="tooltip-content">More</span>
          </cds-icon-button>
        </cds-layer>
        <div class="inline-tile-holder">
          <cds-tile class="inline-tile">
            <div id="inline-tile-pictogram">
              ${_({...d,attrs:{...d.attrs,"aria-label":d.name}})}
            </div>
            <br />
            <h6>Primary text</h6>
            <div class="inline-pictogram-secondary-text">
              Secondary text or description
            </div>
            <br />
            <cds-link href="#">Link</cds-link>
          </cds-tile>
        </div>
      </div>
    `};var T,v,O;l.parameters={...l.parameters,docs:{...(T=l.parameters)==null?void 0:T.docs,source:{originalSource:`{
  args: {
    heading: 'Choose color',
    open: true,
    align: POPOVER_ALIGNMENT.LEFT_TOP
  },
  argTypes,
  /**
   * Renders the template for Storybook
   * @param {object} args Storybook arguments
   * @returns {TemplateResult<1>}
   */
  render: args => html\`
      <style>
        \${styles}
      </style>
      <div class="style-picker-story-container">
        <cds-layer class="toolbar-layer">
          <clabs-style-picker
            align=\${args.align}
            ?open=\${args.open}
            heading=\${args.heading}>
            <cds-icon-button
              slot="trigger"
              kind=\${BUTTON_KIND.GHOST}
              @click=\${toggleButton}>
              \${ColorPalette16({
    slot: 'icon'
  })}
              <span slot="tooltip-content">Color palette</span>
            </cds-icon-button>
            <clabs-style-picker-modules slot="modules">
              <clabs-style-picker-color-module
                heading="Color"
                size="sm"
                .items=\${colors}
                selected-item="blue-60"
                @clabs-style-picker-module-option-change=\${ev => changeColor(ev)}></clabs-style-picker-color-module>
            </clabs-style-picker-modules>
          </clabs-style-picker>
          <cds-icon-button kind=\${BUTTON_KIND.GHOST}>
            \${TrashCan16({
    slot: 'icon'
  })}
            <span slot="tooltip-content">Edit</span>
          </cds-icon-button>
          <cds-icon-button kind=\${BUTTON_KIND.GHOST}>
            \${OverflowMenuVertical16({
    slot: 'icon'
  })}
            <span slot="tooltip-content">More</span>
          </cds-icon-button>
        </cds-layer>
        <div class="inline-tile-holder">
          <cds-tile class="inline-tile">
            <h6>Primary text</h6>
            <br />
            <small>Secondary text or description</small>
            <br /><br />
            <cds-link href="#">Link</cds-link>
          </cds-tile>
        </div>
      </div>
    \`
}`,...(O=(v=l.parameters)==null?void 0:v.docs)==null?void 0:O.source}}};var S,P,E;i.parameters={...i.parameters,docs:{...(S=i.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    heading: 'Choose icon',
    open: true,
    align: POPOVER_ALIGNMENT.LEFT_TOP
  },
  argTypes,
  /**
   * Renders the template for Storybook
   * @param {object} args Storybook arguments
   * @returns {TemplateResult<1>}
   */
  render: args => html\`
      <style>
        \${styles}
      </style>
      <div class="style-picker-story-container">
        <cds-layer class="toolbar-layer">
          <clabs-style-picker
            align=\${args.align}
            ?open=\${args.open}
            heading=\${args.heading}>
            <cds-icon-button
              slot="trigger"
              kind=\${BUTTON_KIND.GHOST}
              @click=\${toggleButton}>
              \${ColorPalette16({
    slot: 'icon'
  })}
              <span slot="tooltip-content">Icon list</span>
            </cds-icon-button>
            <clabs-style-picker-modules slot="modules">
              <clabs-style-picker-icon-module
                heading="Icon"
                size="sm"
                .items=\${icons}
                selected-item="apple"
                @clabs-style-picker-module-option-change=\${ev => changeIcon(ev)}></clabs-style-picker-icon-module>
            </clabs-style-picker-modules>
          </clabs-style-picker>
          <cds-icon-button kind=\${BUTTON_KIND.GHOST}>
            \${TrashCan16({
    slot: 'icon'
  })}
            <span slot="tooltip-content">Edit</span>
          </cds-icon-button>
          <cds-icon-button kind=\${BUTTON_KIND.GHOST}>
            \${OverflowMenuVertical16({
    slot: 'icon'
  })}
            <span slot="tooltip-content">More</span>
          </cds-icon-button>
        </cds-layer>
        <div class="inline-tile-holder">
          <cds-tile class="inline-tile">
            <div class="inline-tile-header">
              <span id="inline-tile-icon">\${icons[0].renderIcon()}</span>
              <h6>Primary text</h6>
            </div>
            <br />
            <small>Secondary text or description</small>
            <br /><br />
            <cds-link href="#">Link</cds-link>
          </cds-tile>
        </div>
      </div>
    \`
}`,...(E=(P=i.parameters)==null?void 0:P.docs)==null?void 0:E.source}}};var C,I,f;c.parameters={...c.parameters,docs:{...(C=c.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    heading: 'Choose pictogram',
    open: true,
    align: POPOVER_ALIGNMENT.LEFT_TOP
  },
  argTypes,
  /**
   * Renders the template for Storybook
   * @param {object} args Storybook arguments
   * @returns {TemplateResult<1>}
   */
  render: args => html\`
      <style>
        \${styles}
      </style>
      <div class="style-picker-story-container">
        <cds-layer class="toolbar-layer">
          <clabs-style-picker
            align=\${args.align}
            ?open=\${args.open}
            heading=\${args.heading}>
            <cds-icon-button
              slot="trigger"
              kind=\${BUTTON_KIND.GHOST}
              @click=\${toggleButton}>
              \${ColorPalette16({
    slot: 'icon'
  })}
              <span slot="tooltip-content">Pictogram list</span>
            </cds-icon-button>
            <clabs-style-picker-modules slot="modules">
              <clabs-style-picker-pictogram-module
                heading=\${'Pictogram'}
                size=\${'lg'}
                .items=\${pictograms}
                selected-item=\${'bangalore'}
                @clabs-style-picker-module-option-change=\${ev => changePictogram(ev)}></clabs-style-picker-pictogram-module>
            </clabs-style-picker-modules>
          </clabs-style-picker>
          <cds-icon-button kind=\${BUTTON_KIND.GHOST}>
            \${TrashCan16({
    slot: 'icon'
  })}
            <span slot="tooltip-content">Edit</span>
          </cds-icon-button>
          <cds-icon-button kind=\${BUTTON_KIND.GHOST}>
            \${OverflowMenuVertical16({
    slot: 'icon'
  })}
            <span slot="tooltip-content">More</span>
          </cds-icon-button>
        </cds-layer>
        <div class="inline-tile-holder">
          <cds-tile class="inline-tile">
            <div id="inline-tile-pictogram">
              \${renderCarbonPictogram({
    ...Bangalore,
    attrs: {
      ...Bangalore.attrs,
      'aria-label': Bangalore.name
    }
  })}
            </div>
            <br />
            <h6>Primary text</h6>
            <div class="inline-pictogram-secondary-text">
              Secondary text or description
            </div>
            <br />
            <cds-link href="#">Link</cds-link>
          </cds-tile>
        </div>
      </div>
    \`
}`,...(f=(I=c.parameters)==null?void 0:I.docs)==null?void 0:f.source}}};const A=["Color","Icon","Pictogram"],j=Object.freeze(Object.defineProperty({__proto__:null,Color:l,Icon:i,Pictogram:c,__namedExportsOrder:A,default:D},Symbol.toStringTag,{value:"Module"}));export{j as S};

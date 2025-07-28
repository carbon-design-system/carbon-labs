import{i as N,x as l,B as T}from"./lit-element-CKvUdWNz.js";import{S,B as o,s as C,c as f,i as d,a as P,b as I,p as b,r as m,d as L,e as G}from"./_story.defs-WnDV3mEB.js";/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const{stablePrefix:H,prefix:B}=G,M={title:"Components/Style Picker/Flat",component:"clabs-style-picker",parameters:{docs:{description:{component:"More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction"}}}},O=N`
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
    border-inline-start: 0.25rem solid #fddc69;
  }

  .inline-tile-header {
    display: flex;
    align-items: start;
    gap: 0.25rem;
  }

  .inline-pictogram-secondary-text {
    margin-top: 0.5rem;
  }
`,E=()=>{var n;(n=document.querySelector(`${H}-style-picker`))==null||n.toggleAttribute("open")},_=n=>{const e=n.detail.value,t=document.querySelector(`${B}-tile`);t.style.borderColor=`${e}`},w=n=>{const e=n.detail.value,t=d.find(r=>r.value===e).renderIcon(),a=document.getElementById("inline-tile-icon"),i=document.createElement("div");T(t,i),a.innerHTML="",a.appendChild(i.firstElementChild)},A=n=>{const e=n.detail.value,a=b.flatMap(p=>p.items).find(p=>p.value===e),i=document.getElementById("inline-tile-pictogram"),r=m(a.pictogram),g=document.createElement("div");T(r,g),i.innerHTML="",i.appendChild(g.firstElementChild)},x={open:{control:"radio",description:"true if the modal is open"},heading:{control:"text",description:"style picker heading."},align:{control:"select",options:[...L],description:"Specify how the popover should align with the trigger element"}},s={args:{heading:"Choose color and icon",open:!0,align:S.LEFT_TOP,kind:"flat"},argTypes:x,render:n=>l`
      <style>
        ${O}
      </style>
      <div class="style-picker-story-container">
        <cds-layer class="toolbar-layer">
          <clabs-style-picker
            align=${n.align}
            ?open=${n.open}
            heading=${n.heading}
            kind=${n.kind}>
            <cds-icon-button
              slot="trigger"
              kind=${o.GHOST}
              @click=${E}>
              ${C({slot:"icon"})}
              <span slot="tooltip-content">Color palette</span>
            </cds-icon-button>
            <clabs-style-picker-section heading="Colors">
              ${f[0].items.map(e=>l`
                  <clabs-style-picker-option
                    value=${e.color}
                    label=${e.label}
                    ?selected=${e.label==="Yellow 20"}
                    @clabs-style-picker-option-select=${t=>_(t)}>
                    <clabs-style-picker-color
                      color=${e.color}
                      label=${e.label}></clabs-style-picker-color>
                  </clabs-style-picker-option>
                `)}
            </clabs-style-picker-section>
            <clabs-style-picker-section heading="Icons">
              ${d.map(e=>l`
                    <clabs-style-picker-option
                      value=${e.value}
                      label=${e.label}
                      ?selected=${e.value==="apple"}
                      @clabs-style-picker-option-select=${t=>w(t)}>
                      <clabs-style-picker-icon>
                        ${e.renderIcon()}
                      </clabs-style-picker-icon>
                    </clabs-style-picker-option>
                  `)}
            </clabs-style-picker-section>
          </clabs-style-picker>
          <cds-icon-button kind=${o.GHOST}>
            ${P({slot:"icon"})}
            <span slot="tooltip-content">Edit</span>
          </cds-icon-button>
          <cds-icon-button kind=${o.GHOST}>
            ${I({slot:"icon"})}
            <span slot="tooltip-content">More</span>
          </cds-icon-button>
        </cds-layer>
        <div class="inline-tile-holder">
          <cds-tile class="inline-tile">
            <div class="inline-tile-header">
              <span id="inline-tile-icon">${d[0].renderIcon()}</span>
              <h6>Primary text</h6>
            </div>
            <br />
            <small>Secondary text or description</small>
            <br /><br />
            <cds-link href="#">Link</cds-link>
          </cds-tile>
        </div>
      </div>
    `},c={args:{heading:"Select color and pictogram",open:!0,align:S.LEFT_TOP,kind:"flat"},argTypes:x,render:n=>l`
      <style>
        ${O}
      </style>
      <div class="style-picker-story-container">
        <cds-layer class="toolbar-layer">
          <clabs-style-picker
            align=${n.align}
            ?open=${n.open}
            heading=${n.heading}
            kind=${n.kind}>
            <cds-icon-button
              slot="trigger"
              kind=${o.GHOST}
              @click=${E}>
              ${C({slot:"icon"})}
              <span slot="tooltip-content">Pictogram list</span>
            </cds-icon-button>
            <clabs-style-picker-section heading="Colors">
              ${f[0].items.map(e=>l`
                  <clabs-style-picker-option
                    value=${e.color}
                    label=${e.label}
                    ?selected=${e.label==="Yellow 20"}
                    @clabs-style-picker-option-select=${t=>_(t)}>
                    <clabs-style-picker-color
                      color=${e.color}
                      label=${e.label}></clabs-style-picker-color>
                  </clabs-style-picker-option>
                `)}
            </clabs-style-picker-section>
            <clabs-style-picker-section heading="Pictograms" size="lg">
              ${b[0].items.map(e=>l`
                  <clabs-style-picker-option
                    value=${e.value}
                    label=${e.label}
                    ?selected=${e.label==="Amsterdam"}
                    @clabs-style-picker-option-select=${t=>A(t)}>
                    ${m({...e.pictogram,attrs:{...e.pictogram.attrs,width:"3rem",height:"3rem","aria-label":e.label}})}
                  </clabs-style-picker-option>
                `)}
            </clabs-style-picker-section>
          </clabs-style-picker>
          <cds-icon-button kind=${o.GHOST}>
            ${P({slot:"icon"})}
            <span slot="tooltip-content">Edit</span>
          </cds-icon-button>
          <cds-icon-button kind=${o.GHOST}>
            ${I({slot:"icon"})}
            <span slot="tooltip-content">More</span>
          </cds-icon-button>
        </cds-layer>
        <div class="inline-tile-holder">
          <cds-tile class="inline-tile">
            <div id="inline-tile-pictogram">
              ${m(b[0].items[0].pictogram)}
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
    `};var y,k,$;s.parameters={...s.parameters,docs:{...(y=s.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    heading: 'Choose color and icon',
    open: true,
    align: STYLE_PICKER_ALIGNMENT.LEFT_TOP,
    kind: 'flat'
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
            heading=\${args.heading}
            kind=\${args.kind}>
            <cds-icon-button
              slot="trigger"
              kind=\${BUTTON_KIND.GHOST}
              @click=\${toggleButton}>
              \${ColorPalette16({
    slot: 'icon'
  })}
              <span slot="tooltip-content">Color palette</span>
            </cds-icon-button>
            <clabs-style-picker-section heading="Colors">
              \${colors[0].items.map(item => html\`
                  <clabs-style-picker-option
                    value=\${item.color}
                    label=\${item.label}
                    ?selected=\${item.label === 'Yellow 20'}
                    @clabs-style-picker-option-select=\${ev => changeColor(ev)}>
                    <clabs-style-picker-color
                      color=\${item.color}
                      label=\${item.label}></clabs-style-picker-color>
                  </clabs-style-picker-option>
                \`)}
            </clabs-style-picker-section>
            <clabs-style-picker-section heading="Icons">
              \${icons.map(item => html\`
                    <clabs-style-picker-option
                      value=\${item.value}
                      label=\${item.label}
                      ?selected=\${item.value === 'apple'}
                      @clabs-style-picker-option-select=\${ev => changeIcon(ev)}>
                      <clabs-style-picker-icon>
                        \${item.renderIcon()}
                      </clabs-style-picker-icon>
                    </clabs-style-picker-option>
                  \`)}
            </clabs-style-picker-section>
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
}`,...($=(k=s.parameters)==null?void 0:k.docs)==null?void 0:$.source}}};var u,h,v;c.parameters={...c.parameters,docs:{...(u=c.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    heading: 'Select color and pictogram',
    open: true,
    align: STYLE_PICKER_ALIGNMENT.LEFT_TOP,
    kind: 'flat'
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
            heading=\${args.heading}
            kind=\${args.kind}>
            <cds-icon-button
              slot="trigger"
              kind=\${BUTTON_KIND.GHOST}
              @click=\${toggleButton}>
              \${ColorPalette16({
    slot: 'icon'
  })}
              <span slot="tooltip-content">Pictogram list</span>
            </cds-icon-button>
            <clabs-style-picker-section heading="Colors">
              \${colors[0].items.map(item => html\`
                  <clabs-style-picker-option
                    value=\${item.color}
                    label=\${item.label}
                    ?selected=\${item.label === 'Yellow 20'}
                    @clabs-style-picker-option-select=\${ev => changeColor(ev)}>
                    <clabs-style-picker-color
                      color=\${item.color}
                      label=\${item.label}></clabs-style-picker-color>
                  </clabs-style-picker-option>
                \`)}
            </clabs-style-picker-section>
            <clabs-style-picker-section heading="Pictograms" size="lg">
              \${pictograms[0].items.map(item => html\`
                  <clabs-style-picker-option
                    value=\${item.value}
                    label=\${item.label}
                    ?selected=\${item.label === 'Amsterdam'}
                    @clabs-style-picker-option-select=\${ev => changePictogram(ev)}>
                    \${renderCarbonPictogram({
    ...item.pictogram,
    attrs: {
      ...item.pictogram.attrs,
      width: '3rem',
      height: '3rem',
      'aria-label': item.label
    }
  })}
                  </clabs-style-picker-option>
                \`)}
            </clabs-style-picker-section>
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
              \${renderCarbonPictogram(pictograms[0].items[0].pictogram)}
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
}`,...(v=(h=c.parameters)==null?void 0:h.docs)==null?void 0:v.source}}};const K=["ColorAndIcon","ColorAndPictogram"],U=Object.freeze(Object.defineProperty({__proto__:null,ColorAndIcon:s,ColorAndPictogram:c,__namedExportsOrder:K,default:M},Symbol.toStringTag,{value:"Module"}));export{U as S};

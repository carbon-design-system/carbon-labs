import{i as B,x as t,B as T}from"./lit-element-CKvUdWNz.js";import{S as I,B as o,s as S,i as r,c as C,a as P,b as f,p as b,r as y,d as L,e as G}from"./_story.defs-WnDV3mEB.js";/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const{stablePrefix:H,prefix:M}=G,K={title:"Components/Style Picker/Disclosed",component:"clabs-style-picker",parameters:{docs:{description:{component:"More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction"}}}},O=B`
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
`,E=()=>{var l;(l=document.querySelector(`${H}-style-picker`))==null||l.toggleAttribute("open")},_=l=>{const n=l.detail.value,e=document.querySelector(`${M}-tile`);e.style.borderColor=`${n}`},x=l=>{const n=l.detail.value,e=document.getElementById("inline-tile-icon"),s=r.find(p=>p.value===n).renderIcon(),i=document.createElement("div");T(s,i),e.innerHTML="",e.appendChild(i.firstElementChild)},R=l=>{const n=l.detail.value,s=b.flatMap(d=>d.items).find(d=>d.value===n),i=document.getElementById("inline-tile-pictogram"),p=y(s.pictogram),g=document.createElement("div");T(p,g),i.innerHTML="",i.appendChild(g.firstElementChild)},N={open:{control:"radio",description:"true if the modal is open"},heading:{control:"text",description:"style picker heading."},align:{control:"select",options:[...L],description:"Specify how the popover should align with the trigger element"}},c={args:{heading:"Choose color and icon",open:!0,align:I.LEFT_TOP,kind:"disclosed"},argTypes:N,render:l=>t`
      <style>
        ${O}
      </style>
      <div class="style-picker-story-container">
        <cds-layer class="toolbar-layer">
          <clabs-style-picker
            align=${l.align}
            ?open=${l.open}
            heading=${l.heading}
            kind=${l.kind}>
            <cds-icon-button
              slot="trigger"
              kind=${o.GHOST}
              @click=${E}>
              ${S({slot:"icon"})}
              <span slot="tooltip-content">Color palette</span>
            </cds-icon-button>
            <clabs-style-picker-sections>
              <clabs-style-picker-section heading="Icons">
                ${r.map(n=>t`
                      <clabs-style-picker-option
                        value=${n.value}
                        label=${n.label}
                        ?selected=${n.value==="apple"}
                        @clabs-style-picker-option-select=${e=>x(e)}>
                        <clabs-style-picker-icon>
                          ${n.renderIcon()}
                        </clabs-style-picker-icon>
                      </clabs-style-picker-option>
                    `)}
              </clabs-style-picker-section>
              <clabs-style-picker-section heading="Colors">
                ${C.map(n=>t`<clabs-style-picker-group heading=${n.label}>
                      ${n.items.map(e=>t`
                          <clabs-style-picker-option
                            value=${e.color}
                            label=${e.label}
                            ?selected=${e.label==="Blue 60"}
                            @clabs-style-picker-option-select=${s=>_(s)}>
                            <clabs-style-picker-color
                              color=${e.color}
                              label=${e.label}></clabs-style-picker-color>
                          </clabs-style-picker-option>
                        `)}
                    </clabs-style-picker-group> `)}
              </clabs-style-picker-section>
            </clabs-style-picker-sections>
          </clabs-style-picker>
          <cds-icon-button kind=${o.GHOST}>
            ${P({slot:"icon"})}
            <span slot="tooltip-content">Edit</span>
          </cds-icon-button>
          <cds-icon-button kind=${o.GHOST}>
            ${f({slot:"icon"})}
            <span slot="tooltip-content">More</span>
          </cds-icon-button>
        </cds-layer>
        <div class="inline-tile-holder">
          <cds-tile class="inline-tile">
            <div class="inline-tile-header">
              <span id="inline-tile-icon">${r[0].renderIcon()}</span>
              <h6>Primary text</h6>
            </div>
            <br />
            <small>Secondary text or description</small>
            <br /><br />
            <cds-link href="#">Link</cds-link>
          </cds-tile>
        </div>
      </div>
    `},a={args:{heading:"Select color and icons",open:!0,align:I.LEFT_TOP,kind:"disclosed"},argTypes:N,render:l=>t`
      <style>
        ${O}
      </style>
      <div class="style-picker-story-container">
        <cds-layer class="toolbar-layer">
          <clabs-style-picker
            align=${l.align}
            ?open=${l.open}
            heading=${l.heading}
            kind=${l.kind}>
            <cds-icon-button
              slot="trigger"
              kind=${o.GHOST}
              @click="${E}">
              ${S({slot:"icon"})}
              <span slot="tooltip-content">Pictogram list</span>
            </cds-icon-button>
            <clabs-style-picker-sections>
              <clabs-style-picker-section heading="Icons">
                ${r.map(n=>t`
                      <clabs-style-picker-option
                        value=${n.value}
                        label=${n.label}
                        ?selected=${n.value==="apple"}
                        @clabs-style-picker-option-select=${e=>x(e)}>
                        <clabs-style-picker-icon>
                          ${n.renderIcon()}
                        </clabs-style-picker-icon>
                      </clabs-style-picker-option>
                    `)}
              </clabs-style-picker-section>
              <clabs-style-picker-section heading="Colors">
                ${C.map(n=>t`<clabs-style-picker-group heading=${n.label}>
                      ${n.items.map(e=>t`
                          <clabs-style-picker-option
                            value=${e.color}
                            label=${e.label}
                            ?selected=${e.label==="Blue 60"}
                            @clabs-style-picker-option-select=${s=>_(s)}>
                            <clabs-style-picker-color
                              color=${e.color}
                              label=${e.label}></clabs-style-picker-color>
                          </clabs-style-picker-option>
                        `)}
                    </clabs-style-picker-group> `)}
              </clabs-style-picker-section>
              <clabs-style-picker-section heading="Pictograms" size="lg">
                ${b.map(n=>t`<clabs-style-picker-group heading=${n.label}>
                      ${n.items.map(e=>t`
                          <clabs-style-picker-option
                            value=${e.value}
                            label=${e.label}
                            ?selected=${e.label==="Amsterdam"}
                            @clabs-style-picker-option-select=${s=>R(s)}>
                            ${y({...e.pictogram,attrs:{...e.pictogram.attrs,width:"3rem",height:"3rem","aria-label":e.label}})}
                          </clabs-style-picker-option>
                        `)}
                    </clabs-style-picker-group> `)}
              </clabs-style-picker-section>
            </clabs-style-picker-sections>
          </clabs-style-picker>
          <cds-icon-button kind=${o.GHOST}>
            ${P({slot:"icon"})}
            <span slot="tooltip-content">Edit</span>
          </cds-icon-button>
          <cds-icon-button kind=${o.GHOST}>
            ${f({slot:"icon"})}
            <span slot="tooltip-content">More</span>
          </cds-icon-button>
        </cds-layer>
        <div class="inline-tile-holder">
          <cds-tile class="inline-tile">
            <div id="inline-tile-pictogram">
              ${y(b[0].items[0].pictogram)}
            </div>
            <br />
            <div class="inline-tile-header">
              <span id="inline-tile-icon">${r[0].renderIcon()}</span>
              <h6>Primary text</h6>
            </div>
            <div class="inline-pictogram-secondary-text">
              Secondary text or description
            </div>
            <br />
            <cds-link href="#">Link</cds-link>
          </cds-tile>
        </div>
      </div>
    `};var k,m,$;c.parameters={...c.parameters,docs:{...(k=c.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    heading: 'Choose color and icon',
    open: true,
    align: STYLE_PICKER_ALIGNMENT.LEFT_TOP,
    kind: 'disclosed'
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
            <clabs-style-picker-sections>
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
              <clabs-style-picker-section heading="Colors">
                \${colors.map(group => html\`<clabs-style-picker-group heading=\${group.label}>
                      \${group.items.map(item => html\`
                          <clabs-style-picker-option
                            value=\${item.color}
                            label=\${item.label}
                            ?selected=\${item.label === 'Blue 60'}
                            @clabs-style-picker-option-select=\${ev => changeColor(ev)}>
                            <clabs-style-picker-color
                              color=\${item.color}
                              label=\${item.label}></clabs-style-picker-color>
                          </clabs-style-picker-option>
                        \`)}
                    </clabs-style-picker-group> \`)}
              </clabs-style-picker-section>
            </clabs-style-picker-sections>
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
}`,...($=(m=c.parameters)==null?void 0:m.docs)==null?void 0:$.source}}};var u,h,v;a.parameters={...a.parameters,docs:{...(u=a.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    heading: 'Select color and icons',
    open: true,
    align: STYLE_PICKER_ALIGNMENT.LEFT_TOP,
    kind: 'disclosed'
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
              @click="\${toggleButton}">
              \${ColorPalette16({
    slot: 'icon'
  })}
              <span slot="tooltip-content">Pictogram list</span>
            </cds-icon-button>
            <clabs-style-picker-sections>
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
              <clabs-style-picker-section heading="Colors">
                \${colors.map(group => html\`<clabs-style-picker-group heading=\${group.label}>
                      \${group.items.map(item => html\`
                          <clabs-style-picker-option
                            value=\${item.color}
                            label=\${item.label}
                            ?selected=\${item.label === 'Blue 60'}
                            @clabs-style-picker-option-select=\${ev => changeColor(ev)}>
                            <clabs-style-picker-color
                              color=\${item.color}
                              label=\${item.label}></clabs-style-picker-color>
                          </clabs-style-picker-option>
                        \`)}
                    </clabs-style-picker-group> \`)}
              </clabs-style-picker-section>
              <clabs-style-picker-section heading="Pictograms" size="lg">
                \${pictograms.map(group => html\`<clabs-style-picker-group heading=\${group.label}>
                      \${group.items.map(item => html\`
                          <clabs-style-picker-option
                            value=\${item.value}
                            label=\${item.label}
                            ?selected=\${item.label === 'Amsterdam'}
                            @clabs-style-picker-option-select=\${ev => changePictogram(ev, true)}>
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
                    </clabs-style-picker-group> \`)}
              </clabs-style-picker-section>
            </clabs-style-picker-sections>
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
            <div class="inline-tile-header">
              <span id="inline-tile-icon">\${icons[0].renderIcon()}</span>
              <h6>Primary text</h6>
            </div>
            <div class="inline-pictogram-secondary-text">
              Secondary text or description
            </div>
            <br />
            <cds-link href="#">Link</cds-link>
          </cds-tile>
        </div>
      </div>
    \`
}`,...(v=(h=a.parameters)==null?void 0:h.docs)==null?void 0:v.source}}};const w=["ColorAndIcon","IconColorPictogram"],U=Object.freeze(Object.defineProperty({__proto__:null,ColorAndIcon:c,IconColorPictogram:a,__namedExportsOrder:w,default:K},Symbol.toStringTag,{value:"Module"}));export{U as S};

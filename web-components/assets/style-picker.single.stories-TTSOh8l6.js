import{i as H,x as l,B as x}from"./lit-element-CKvUdWNz.js";import{S as m,B as o,s as k,c as L,a as $,b as u,i as g,p as G,r as y,f as b,d as M,e as K}from"./_story.defs-WnDV3mEB.js";/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const{stablePrefix:R,prefix:w}=K,D={title:"Components/Style Picker/Single",component:"clabs-style-picker",parameters:{docs:{description:{component:"More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction"}}}},h=H`
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
`,T=()=>{var n;(n=document.querySelector(`${R}-style-picker`))==null||n.toggleAttribute("open")},U=n=>{const t=n.detail.value,e=document.querySelector(`${w}-tile`);e.style.borderColor=`${t}`},j=n=>{const t=n.detail.value,e=document.getElementById("inline-tile-icon"),s=g.find(p=>p.value===t).renderIcon(),i=document.createElement("div");x(s,i),e.innerHTML="",e.appendChild(i.firstElementChild)},F=n=>{const t=n.detail.value,s=G.flatMap(d=>d.items).find(d=>d.value===t),i=document.getElementById("inline-tile-pictogram"),p=y(s.pictogram),S=document.createElement("div");x(p,S),i.innerHTML="",i.appendChild(S.firstElementChild)},v={open:{control:"radio",description:"true if the modal is open"},heading:{control:"text",description:"style picker heading."},align:{control:"select",options:[...M],description:"Specify how the popover should align with the trigger element"}},c={args:{heading:"Choose color",open:!0,align:m.LEFT_TOP},argTypes:v,render:n=>l`
      <style>
        ${h}
      </style>
      <div class="style-picker-story-container">
        <cds-layer class="toolbar-layer">
          <clabs-style-picker
            align=${n.align}
            ?open=${n.open}
            heading=${n.heading}>
            <cds-icon-button
              slot="trigger"
              kind=${o.GHOST}
              @click=${T}>
              ${k({slot:"icon"})}
              <span slot="tooltip-content">Color palette</span>
            </cds-icon-button>
            <clabs-style-picker-section>
              ${L.map(t=>l`<clabs-style-picker-group heading=${t.label}>
                    ${t.items.map(e=>l`
                        <clabs-style-picker-option
                          value=${e.color}
                          label=${e.label}
                          ?selected=${e.label==="Blue 60"}
                          @clabs-style-picker-option-select=${s=>U(s)}>
                          <clabs-style-picker-color
                            color=${e.color}
                            label=${e.label}></clabs-style-picker-color>
                        </clabs-style-picker-option>
                      `)}
                  </clabs-style-picker-group> `)}
            </clabs-style-picker-section>
          </clabs-style-picker>
          <cds-icon-button kind=${o.GHOST}>
            ${$({slot:"icon"})}
            <span slot="tooltip-content">Edit</span>
          </cds-icon-button>
          <cds-icon-button kind=${o.GHOST}>
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
    `},a={args:{heading:"Choose icon",open:!0,align:m.LEFT_TOP},argTypes:v,render:n=>l`
      <style>
        ${h}
      </style>
      <div class="style-picker-story-container">
        <cds-layer class="toolbar-layer">
          <clabs-style-picker
            align=${n.align}
            ?open=${n.open}
            heading=${n.heading}>
            <cds-icon-button
              slot="trigger"
              kind=${o.GHOST}
              @click=${T}>
              ${k({slot:"icon"})}
              <span slot="tooltip-content">Icon list</span>
            </cds-icon-button>
            <clabs-style-picker-section>
              ${g.map(t=>l`
                    <clabs-style-picker-option
                      value=${t.value}
                      label=${t.label}
                      ?selected=${t.value==="apple"}
                      @clabs-style-picker-option-select=${e=>j(e)}>
                      <clabs-style-picker-icon>
                        ${t.renderIcon()}
                      </clabs-style-picker-icon>
                    </clabs-style-picker-option>
                  `)}
            </clabs-style-picker-section>
          </clabs-style-picker>
          <cds-icon-button kind=${o.GHOST}>
            ${$({slot:"icon"})}
            <span slot="tooltip-content">Edit</span>
          </cds-icon-button>
          <cds-icon-button kind=${o.GHOST}>
            ${u({slot:"icon"})}
            <span slot="tooltip-content">More</span>
          </cds-icon-button>
        </cds-layer>
        <div class="inline-tile-holder">
          <cds-tile class="inline-tile">
            <div class="inline-tile-header">
              <span id="inline-tile-icon">${g[0].renderIcon()}</span>
              <h6>Primary text</h6>
            </div>
            <br />
            <small>Secondary text or description</small>
            <br /><br />
            <cds-link href="#">Link</cds-link>
          </cds-tile>
        </div>
      </div>
    `},r={args:{heading:"Choose pictogram",open:!0,align:m.LEFT_TOP},argTypes:v,render:n=>l`
      <style>
        ${h}
      </style>
      <div class="style-picker-story-container">
        <cds-layer class="toolbar-layer">
          <clabs-style-picker
            align=${n.align}
            ?open=${n.open}
            heading=${n.heading}>
            <cds-icon-button
              slot="trigger"
              kind=${o.GHOST}
              @click=${T}>
              ${k({slot:"icon"})}
              <span slot="tooltip-content">Pictogram list</span>
            </cds-icon-button>
            <clabs-style-picker-section size="lg">
              ${G.map(t=>l`<clabs-style-picker-group heading=${t.label}>
                    ${t.items.map(e=>l`
                        <clabs-style-picker-option
                          value=${e.value}
                          label=${e.label}
                          ?selected=${e.label==="Bangalore"}
                          @clabs-style-picker-option-select=${s=>F(s)}>
                          ${y({...e.pictogram,attrs:{...e.pictogram.attrs,width:"3rem",height:"3rem","aria-label":e.label}})}
                        </clabs-style-picker-option>
                      `)}
                  </clabs-style-picker-group> `)}
            </clabs-style-picker-section>
          </clabs-style-picker>
          <cds-icon-button kind=${o.GHOST}>
            ${$({slot:"icon"})}
            <span slot="tooltip-content">Edit</span>
          </cds-icon-button>
          <cds-icon-button kind=${o.GHOST}>
            ${u({slot:"icon"})}
            <span slot="tooltip-content">More</span>
          </cds-icon-button>
        </cds-layer>
        <div class="inline-tile-holder">
          <cds-tile class="inline-tile">
            <div id="inline-tile-pictogram">
              ${y({...b,attrs:{...b.attrs,"aria-label":b.name}})}
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
    `};var O,P,C;c.parameters={...c.parameters,docs:{...(O=c.parameters)==null?void 0:O.docs,source:{originalSource:`{
  args: {
    heading: 'Choose color',
    open: true,
    align: STYLE_PICKER_ALIGNMENT.LEFT_TOP
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
            <clabs-style-picker-section>
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
}`,...(C=(P=c.parameters)==null?void 0:P.docs)==null?void 0:C.source}}};var I,f,E;a.parameters={...a.parameters,docs:{...(I=a.parameters)==null?void 0:I.docs,source:{originalSource:`{
  args: {
    heading: 'Choose icon',
    open: true,
    align: STYLE_PICKER_ALIGNMENT.LEFT_TOP
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
            <clabs-style-picker-section>
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
}`,...(E=(f=a.parameters)==null?void 0:f.docs)==null?void 0:E.source}}};var _,N,B;r.parameters={...r.parameters,docs:{...(_=r.parameters)==null?void 0:_.docs,source:{originalSource:`{
  args: {
    heading: 'Choose pictogram',
    open: true,
    align: STYLE_PICKER_ALIGNMENT.LEFT_TOP
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
            <clabs-style-picker-section size="lg">
              \${pictograms.map(group => html\`<clabs-style-picker-group heading=\${group.label}>
                    \${group.items.map(item => html\`
                        <clabs-style-picker-option
                          value=\${item.value}
                          label=\${item.label}
                          ?selected=\${item.label === 'Bangalore'}
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
                  </clabs-style-picker-group> \`)}
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
}`,...(B=(N=r.parameters)==null?void 0:N.docs)==null?void 0:B.source}}};const A=["Color","Icon","Pictogram"],V=Object.freeze(Object.defineProperty({__proto__:null,Color:c,Icon:a,Pictogram:r,__namedExportsOrder:A,default:D},Symbol.toStringTag,{value:"Module"}));export{V as S};

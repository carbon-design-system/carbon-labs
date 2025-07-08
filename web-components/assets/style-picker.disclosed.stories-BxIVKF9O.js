import{i as x,x as k,B as $}from"./lit-element-CKvUdWNz.js";import{P as h,B as t,s as v,i as r,c as T,a as O,b as S,p as d,r as P,d as M,e as N}from"./_story.defs-B8-PBVGf.js";/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const{stablePrefix:G,prefix:H}=N,B={title:"Components/Style Picker/Disclosed",component:"clabs-style-picker",parameters:{docs:{description:{component:"More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction"}}}},E=x`
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
`,I=()=>{var e;(e=document.querySelector(`${G}-style-picker`))==null||e.toggleAttribute("open")},C=e=>{const n=e.detail.item,o=document.querySelector(`${H}-tile`);o.style.borderColor=`${n.color}`,e.target.setAttribute("selected-item",n.value)},f=e=>{const n=e.detail.item,o=document.getElementById("inline-tile-icon"),i=n.renderIcon(),c=document.createElement("div");$(i,c),o.innerHTML="",o.appendChild(c.firstElementChild),e.target.setAttribute("selected-item",n.value)},L=e=>{const n=e.detail.item;e.target.setAttribute("selected-item",n.value);const i=document.getElementById("inline-tile-pictogram"),c=P(n.pictogram),a=document.createElement("div");$(c,a),i.innerHTML="",i.appendChild(a.firstElementChild)},_={open:{control:"radio",description:"true if the modal is open"},heading:{control:"text",description:"style picker heading."},align:{control:"select",options:[...M],description:"Specify how the popover should align with the trigger element"}},s={args:{heading:"Choose color and icon",open:!0,align:h.LEFT_TOP,kind:"disclosed"},argTypes:_,render:e=>k`
      <style>
        ${E}
      </style>
      <div class="style-picker-story-container">
        <cds-layer class="toolbar-layer">
          <clabs-style-picker
            align=${e.align}
            ?open=${e.open}
            heading=${e.heading}
            kind=${e.kind}>
            <cds-icon-button
              slot="trigger"
              kind=${t.GHOST}
              @click=${I}>
              ${v({slot:"icon"})}
              <span slot="tooltip-content">Color palette</span>
            </cds-icon-button>
            <clabs-style-picker-modules slot="modules">
              <clabs-style-picker-icon-module
                heading="Icon"
                size="sm"
                .items=${r}
                selected-item="apple"
                @clabs-style-picker-module-option-change=${n=>f(n)}></clabs-style-picker-icon-module>
              <clabs-style-picker-color-module
                heading="Color"
                size="sm"
                .items=${T}
                selected-item="blue-60"
                @clabs-style-picker-module-option-change=${n=>C(n)}></clabs-style-picker-color-module>
            </clabs-style-picker-modules>
          </clabs-style-picker>
          <cds-icon-button kind=${t.GHOST}>
            ${O({slot:"icon"})}
            <span slot="tooltip-content">Edit</span>
          </cds-icon-button>
          <cds-icon-button kind=${t.GHOST}>
            ${S({slot:"icon"})}
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
    `},l={args:{heading:"Select color and icon",open:!0,align:h.LEFT_TOP,kind:"disclosed"},argTypes:_,render:e=>k`
      <style>
        ${E}
      </style>
      <div class="style-picker-story-container">
        <cds-layer class="toolbar-layer">
          <clabs-style-picker
            align=${e.align}
            ?open=${e.open}
            heading=${e.heading}
            kind=${e.kind}>
            <cds-icon-button
              slot="trigger"
              kind=${t.GHOST}
              @click="${I}">
              ${v({slot:"icon"})}
              <span slot="tooltip-content">Pictogram list</span>
            </cds-icon-button>
            <clabs-style-picker-modules slot="modules">
              <clabs-style-picker-color-module
                heading=${"Color"}
                size=${"sm"}
                .items=${T}
                selected-item=${"blue-60"}
                @clabs-style-picker-module-option-change=${n=>C(n)}></clabs-style-picker-color-module>
              <clabs-style-picker-pictogram-module
                heading=${"Pictogram"}
                size=${"lg"}
                .items=${d}
                selected-item=${d[0].items[0].value}
                @clabs-style-picker-module-option-change=${n=>L(n)}></clabs-style-picker-pictogram-module>
              <clabs-style-picker-icon-module
                heading=${"Icon"}
                size=${"sm"}
                .items=${r}
                selected-item=${"apple"}
                @clabs-style-picker-module-option-change=${n=>f(n)}></clabs-style-picker-icon-module>
            </clabs-style-picker-modules>
          </clabs-style-picker>
          <cds-icon-button kind=${t.GHOST}>
            ${O({slot:"icon"})}
            <span slot="tooltip-content">Edit</span>
          </cds-icon-button>
          <cds-icon-button kind=${t.GHOST}>
            ${S({slot:"icon"})}
            <span slot="tooltip-content">More</span>
          </cds-icon-button>
        </cds-layer>
        <div class="inline-tile-holder">
          <cds-tile class="inline-tile">
            <div id="inline-tile-pictogram">
              ${P(d[0].items[0].pictogram)}
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
    `};var p,m,g;s.parameters={...s.parameters,docs:{...(p=s.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    heading: 'Choose color and icon',
    open: true,
    align: POPOVER_ALIGNMENT.LEFT_TOP,
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
            <clabs-style-picker-modules slot="modules">
              <clabs-style-picker-icon-module
                heading="Icon"
                size="sm"
                .items=\${icons}
                selected-item="apple"
                @clabs-style-picker-module-option-change=\${ev => changeIcon(ev)}></clabs-style-picker-icon-module>
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
}`,...(g=(m=s.parameters)==null?void 0:m.docs)==null?void 0:g.source}}};var u,b,y;l.parameters={...l.parameters,docs:{...(u=l.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    heading: 'Select color and icon',
    open: true,
    align: POPOVER_ALIGNMENT.LEFT_TOP,
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
            <clabs-style-picker-modules slot="modules">
              <clabs-style-picker-color-module
                heading=\${'Color'}
                size=\${'sm'}
                .items=\${colors}
                selected-item=\${'blue-60'}
                @clabs-style-picker-module-option-change=\${ev => changeColor(ev)}></clabs-style-picker-color-module>
              <clabs-style-picker-pictogram-module
                heading=\${'Pictogram'}
                size=\${'lg'}
                .items=\${pictograms}
                selected-item=\${pictograms[0].items[0].value}
                @clabs-style-picker-module-option-change=\${ev => changePictogram(ev)}></clabs-style-picker-pictogram-module>
              <clabs-style-picker-icon-module
                heading=\${'Icon'}
                size=\${'sm'}
                .items=\${icons}
                selected-item=\${'apple'}
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
}`,...(y=(b=l.parameters)==null?void 0:b.docs)==null?void 0:y.source}}};const z=["ColorAndIcon","ThreeModules"],D=Object.freeze(Object.defineProperty({__proto__:null,ColorAndIcon:s,ThreeModules:l,__namedExportsOrder:z,default:B},Symbol.toStringTag,{value:"Module"}));export{D as S};

import{i as G,x as o,B as x}from"./iframe-C-bNyBWa.js";import{S as g,c as H,s as u,i as y,p as E,r as m,B as b,a as M,b as D}from"./_story.defs-0oT1pF1X.js";import{s as $,a as h}from"./16-CXKMFhXI.js";import"./icon-button-BA3Zn-K9.js";import"./link-cIVgRg4O.js";import{B as l}from"./button-TqhTuwdT.js";/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const{stablePrefix:K,prefix:R}=D,w={title:"Components/Style Picker/Single",component:"clabs-style-picker",parameters:{docs:{description:{component:"More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction"}}}},k=G`
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
`,T=()=>{var e;(e=document.querySelector(`${K}-style-picker`))==null||e.toggleAttribute("open")},U=e=>{const n=e.detail.value,t=document.querySelector(`${R}-tile`);t.style.borderColor=`${n}`},j=e=>{const n=e.detail.value,t=document.getElementById("inline-tile-icon"),s=y.find(p=>p.value===n).renderIcon(),i=document.createElement("div");x(s,i),t.innerHTML="",t.appendChild(i.firstElementChild)},F=e=>{const n=e.detail.value,s=E.flatMap(d=>d.items).find(d=>d.value===n),i=document.getElementById("inline-tile-pictogram"),p=m(s.pictogram),v=document.createElement("div");x(p,v),i.innerHTML="",i.appendChild(v.firstElementChild)},S={open:{control:"radio",description:"true if the modal is open"},heading:{control:"text",description:"style picker heading."},align:{control:"select",options:[...M],description:"Specify how the popover should align with the trigger element"},kind:{description:"There are three different variants `'single' | 'flat' | 'disclosed'` ",control:"disabled"},enableSearch:{control:"boolean",description:"Enable search option"},searchCloseButtonLabel:{control:"text"},emptyStateTitle:{control:"text"},emptyStateSubtitle:{control:"text"},searchInputPlaceholder:{control:"text"}},a={args:{open:!0,heading:"Choose color",align:g.LEFT_TOP,enableSearch:!0,searchCloseButtonLabel:"Clear search input",emptyStateTitle:"No results found",emptyStateSubtitle:"Try a different search"},argTypes:S,render:e=>o`
      <style>
        ${k}
      </style>
      <div class="style-picker-story-container">
        <cds-layer class="toolbar-layer">
          <clabs-style-picker
            align=${e.align}
            ?open=${e.open}
            heading=${e.heading}
            ?enable-search=${e.enableSearch}
            search-close-button-label=${e.searchCloseButtonLabel}
            empty-state-title=${e.emptyStateTitle}
            empty-state-subtitle=${e.emptyStateSubtitle}>
            <cds-icon-button
              slot="trigger"
              kind=${l.GHOST}
              @click=${T}>
              ${$({slot:"icon"})}
              <span slot="tooltip-content">Color palette</span>
            </cds-icon-button>
            <clabs-style-picker-section>
              ${H.map(n=>o`<clabs-style-picker-group heading=${n.label}>
                    ${n.items.map(t=>o`
                        <clabs-style-picker-option
                          value=${t.color}
                          label=${t.label}
                          ?selected=${t.label==="Blue 60"}
                          @clabs-style-picker-option-select=${s=>U(s)}>
                          <clabs-style-picker-color
                            color=${t.color}
                            label=${t.label}></clabs-style-picker-color>
                        </clabs-style-picker-option>
                      `)}
                  </clabs-style-picker-group> `)}
            </clabs-style-picker-section>
          </clabs-style-picker>
          <cds-icon-button kind=${l.GHOST}>
            ${u({slot:"icon"})}
            <span slot="tooltip-content">Delete</span>
          </cds-icon-button>
          <cds-icon-button kind=${l.GHOST}>
            ${h({slot:"icon"})}
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
    `},c={args:{heading:"Choose icon",open:!0,align:g.LEFT_TOP},argTypes:S,render:e=>o`
      <style>
        ${k}
      </style>
      <div class="style-picker-story-container">
        <cds-layer class="toolbar-layer">
          <clabs-style-picker
            align=${e.align}
            ?open=${e.open}
            heading=${e.heading}>
            <cds-icon-button
              slot="trigger"
              kind=${l.GHOST}
              @click=${T}>
              ${$({slot:"icon"})}
              <span slot="tooltip-content">Icon list</span>
            </cds-icon-button>
            <clabs-style-picker-section>
              ${y.map(n=>o`
                    <clabs-style-picker-option
                      value=${n.value}
                      label=${n.label}
                      ?selected=${n.value==="apple"}
                      @clabs-style-picker-option-select=${t=>j(t)}>
                      <clabs-style-picker-icon>
                        ${n.renderIcon()}
                      </clabs-style-picker-icon>
                    </clabs-style-picker-option>
                  `)}
            </clabs-style-picker-section>
          </clabs-style-picker>
          <cds-icon-button kind=${l.GHOST}>
            ${u({slot:"icon"})}
            <span slot="tooltip-content">Delete</span>
          </cds-icon-button>
          <cds-icon-button kind=${l.GHOST}>
            ${h({slot:"icon"})}
            <span slot="tooltip-content">More</span>
          </cds-icon-button>
        </cds-layer>
        <div class="inline-tile-holder">
          <cds-tile class="inline-tile">
            <div class="inline-tile-header">
              <span id="inline-tile-icon">${y[0].renderIcon()}</span>
              <h6>Primary text</h6>
            </div>
            <br />
            <small>Secondary text or description</small>
            <br /><br />
            <cds-link href="#">Link</cds-link>
          </cds-tile>
        </div>
      </div>
    `},r={args:{heading:"Choose pictogram",open:!0,align:g.LEFT_TOP,enableSearch:!0,searchCloseButtonLabel:"Clear search input",emptyStateTitle:"No results found",emptyStateSubtitle:"Try a different search"},argTypes:S,render:e=>o`
      <style>
        ${k}
      </style>
      <div class="style-picker-story-container">
        <cds-layer class="toolbar-layer">
          <clabs-style-picker
            align=${e.align}
            ?open=${e.open}
            heading=${e.heading}
            ?enable-search=${e.enableSearch}
            search-close-button-label=${e.searchCloseButtonLabel}
            empty-state-title=${e.emptyStateTitle}
            empty-state-subtitle=${e.emptyStateSubtitle}>
            <cds-icon-button
              slot="trigger"
              kind=${l.GHOST}
              @click=${T}>
              ${$({slot:"icon"})}
              <span slot="tooltip-content">Pictogram list</span>
            </cds-icon-button>
            <clabs-style-picker-section size="lg">
              ${E.map(n=>o`<clabs-style-picker-group heading=${n.label}>
                    ${n.items.map(t=>o`
                        <clabs-style-picker-option
                          value=${t.value}
                          label=${t.label}
                          ?selected=${t.label==="Bangalore"}
                          @clabs-style-picker-option-select=${s=>F(s)}>
                          ${m({...t.pictogram,attrs:{...t.pictogram.attrs,width:"3rem",height:"3rem","aria-label":t.label}})}
                        </clabs-style-picker-option>
                      `)}
                  </clabs-style-picker-group> `)}
            </clabs-style-picker-section>
          </clabs-style-picker>
          <cds-icon-button kind=${l.GHOST}>
            ${u({slot:"icon"})}
            <span slot="tooltip-content">Delete</span>
          </cds-icon-button>
          <cds-icon-button kind=${l.GHOST}>
            ${h({slot:"icon"})}
            <span slot="tooltip-content">More</span>
          </cds-icon-button>
        </cds-layer>
        <div class="inline-tile-holder">
          <cds-tile class="inline-tile">
            <div id="inline-tile-pictogram">
              ${m({...b,attrs:{...b.attrs,"aria-label":b.name}})}
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
    `};var f,C,O;a.parameters={...a.parameters,docs:{...(f=a.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: 'Choose color',
    align: STYLE_PICKER_ALIGNMENT.LEFT_TOP,
    enableSearch: true,
    searchCloseButtonLabel: 'Clear search input',
    emptyStateTitle: 'No results found',
    emptyStateSubtitle: 'Try a different search'
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
            ?enable-search=\${args.enableSearch}
            search-close-button-label=\${args.searchCloseButtonLabel}
            empty-state-title=\${args.emptyStateTitle}
            empty-state-subtitle=\${args.emptyStateSubtitle}>
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
            <span slot="tooltip-content">Delete</span>
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
}`,...(O=(C=a.parameters)==null?void 0:C.docs)==null?void 0:O.source}}};var P,B,I;c.parameters={...c.parameters,docs:{...(P=c.parameters)==null?void 0:P.docs,source:{originalSource:`{
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
            <span slot="tooltip-content">Delete</span>
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
}`,...(I=(B=c.parameters)==null?void 0:B.docs)==null?void 0:I.source}}};var N,_,L;r.parameters={...r.parameters,docs:{...(N=r.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    heading: 'Choose pictogram',
    open: true,
    align: STYLE_PICKER_ALIGNMENT.LEFT_TOP,
    enableSearch: true,
    searchCloseButtonLabel: 'Clear search input',
    emptyStateTitle: 'No results found',
    emptyStateSubtitle: 'Try a different search'
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
            ?enable-search=\${args.enableSearch}
            search-close-button-label=\${args.searchCloseButtonLabel}
            empty-state-title=\${args.emptyStateTitle}
            empty-state-subtitle=\${args.emptyStateSubtitle}>
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
            <span slot="tooltip-content">Delete</span>
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
}`,...(L=(_=r.parameters)==null?void 0:_.docs)==null?void 0:L.source}}};const A=["Color","Icon","Pictogram"],W=Object.freeze(Object.defineProperty({__proto__:null,Color:a,Icon:c,Pictogram:r,__namedExportsOrder:A,default:w},Symbol.toStringTag,{value:"Module"}));export{W as S};

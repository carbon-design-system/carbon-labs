import{i as _,x as l,B as v}from"./iframe-C-bNyBWa.js";import{S as T,c as f,i as d,s as C,p as b,r as m,a as E,b as B}from"./_story.defs-0oT1pF1X.js";import{s as P,a as I}from"./16-CXKMFhXI.js";import"./icon-button-BA3Zn-K9.js";import"./link-cIVgRg4O.js";import{B as o}from"./button-TqhTuwdT.js";/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const{stablePrefix:G,prefix:H}=B,M={title:"Components/Style Picker/Flat",component:"clabs-style-picker",parameters:{docs:{description:{component:"More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction"}}}},O=_`
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
`,x=()=>{var t;(t=document.querySelector(`${G}-style-picker`))==null||t.toggleAttribute("open")},L=t=>{const e=t.detail.value,n=document.querySelector(`${H}-tile`);n.style.borderColor=`${e}`},w=t=>{const e=t.detail.value,n=d.find(r=>r.value===e).renderIcon(),a=document.getElementById("inline-tile-icon"),s=document.createElement("div");v(n,s),a.innerHTML="",a.appendChild(s.firstElementChild)},D=t=>{const e=t.detail.value,a=b.flatMap(p=>p.items).find(p=>p.value===e),s=document.getElementById("inline-tile-pictogram"),r=m(a.pictogram),y=document.createElement("div");v(r,y),s.innerHTML="",s.appendChild(y.firstElementChild)},N={open:{control:"radio",description:"true if the modal is open"},heading:{control:"text",description:"style picker heading."},align:{control:"select",options:[...E],description:"Specify how the popover should align with the trigger element"},kind:{description:"There are three different variants `'single' | 'flat' | 'disclosed'` ",control:"disabled"},enableSearch:{control:"boolean",description:"Enable search option"},searchCloseButtonLabel:{control:"text"},emptyStateTitle:{control:"text"},emptyStateSubtitle:{control:"text"},searchInputPlaceholder:{control:"text"}},i={args:{heading:"Choose color and icon",open:!0,align:T.LEFT_TOP,kind:"flat",enableSearch:!0,searchCloseButtonLabel:"Clear search input",emptyStateTitle:"No results found",emptyStateSubtitle:"Try a different search"},argTypes:N,render:t=>l`
      <style>
        ${O}
      </style>
      <div class="style-picker-story-container">
        <cds-layer class="toolbar-layer">
          <clabs-style-picker
            align=${t.align}
            ?open=${t.open}
            heading=${t.heading}
            kind=${t.kind}
            ?enable-search=${t.enableSearch}
            search-close-button-label=${t.searchCloseButtonLabel}
            empty-state-title=${t.emptyStateTitle}
            empty-state-subtitle=${t.emptyStateSubtitle}>
            <cds-icon-button
              slot="trigger"
              kind=${o.GHOST}
              @click=${x}>
              ${P({slot:"icon"})}
              <span slot="tooltip-content">Color palette</span>
            </cds-icon-button>
            <clabs-style-picker-section heading="Colors">
              ${f[0].items.map(e=>l`
                  <clabs-style-picker-option
                    value=${e.color}
                    label=${e.label}
                    ?selected=${e.label==="Yellow 20"}
                    @clabs-style-picker-option-select=${n=>L(n)}>
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
                      @clabs-style-picker-option-select=${n=>w(n)}>
                      <clabs-style-picker-icon>
                        ${e.renderIcon()}
                      </clabs-style-picker-icon>
                    </clabs-style-picker-option>
                  `)}
            </clabs-style-picker-section>
          </clabs-style-picker>
          <cds-icon-button kind=${o.GHOST}>
            ${C({slot:"icon"})}
            <span slot="tooltip-content">Delete</span>
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
    `},c={args:{heading:"Customize",open:!0,align:T.LEFT_TOP,kind:"flat",enableSearch:!0,searchCloseButtonLabel:"Clear search input",emptyStateTitle:"No results found",emptyStateSubtitle:"Try a different search"},argTypes:N,render:t=>l`
      <style>
        ${O}
      </style>
      <div class="style-picker-story-container">
        <cds-layer class="toolbar-layer">
          <clabs-style-picker
            align=${t.align}
            ?open=${t.open}
            heading=${t.heading}
            kind=${t.kind}
            ?enable-search=${t.enableSearch}
            search-close-button-label=${t.searchCloseButtonLabel}
            empty-state-title=${t.emptyStateTitle}
            empty-state-subtitle=${t.emptyStateSubtitle}>
            <cds-icon-button
              slot="trigger"
              kind=${o.GHOST}
              @click=${x}>
              ${P({slot:"icon"})}
              <span slot="tooltip-content">Pictogram list</span>
            </cds-icon-button>
            <clabs-style-picker-section heading="Colors">
              ${f[0].items.map(e=>l`
                  <clabs-style-picker-option
                    value=${e.color}
                    label=${e.label}
                    ?selected=${e.label==="Yellow 20"}
                    @clabs-style-picker-option-select=${n=>L(n)}>
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
                    @clabs-style-picker-option-select=${n=>D(n)}>
                    ${m({...e.pictogram,attrs:{...e.pictogram.attrs,width:"3rem",height:"3rem","aria-label":e.label}})}
                  </clabs-style-picker-option>
                `)}
            </clabs-style-picker-section>
          </clabs-style-picker>
          <cds-icon-button kind=${o.GHOST}>
            ${C({slot:"icon"})}
            <span slot="tooltip-content">Delete</span>
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
    `};var g,u,$;i.parameters={...i.parameters,docs:{...(g=i.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    heading: 'Choose color and icon',
    open: true,
    align: STYLE_PICKER_ALIGNMENT.LEFT_TOP,
    kind: 'flat',
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
            kind=\${args.kind}
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
}`,...($=(u=i.parameters)==null?void 0:u.docs)==null?void 0:$.source}}};var k,h,S;c.parameters={...c.parameters,docs:{...(k=c.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    heading: 'Customize',
    open: true,
    align: STYLE_PICKER_ALIGNMENT.LEFT_TOP,
    kind: 'flat',
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
            kind=\${args.kind}
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
}`,...(S=(h=c.parameters)==null?void 0:h.docs)==null?void 0:S.source}}};const A=["ColorAndIcon","ColorAndPictogram"],z=Object.freeze(Object.defineProperty({__proto__:null,ColorAndIcon:i,ColorAndPictogram:c,__namedExportsOrder:A,default:M},Symbol.toStringTag,{value:"Module"}));export{z as S};

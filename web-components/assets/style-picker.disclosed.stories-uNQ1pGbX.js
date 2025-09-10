import{i as _,x as l,B as S}from"./iframe-C-bNyBWa.js";import{S as T,i as r,c as C,s as f,p as b,r as y,a as E,b as G}from"./_story.defs-0oT1pF1X.js";import{s as I,a as P}from"./16-CXKMFhXI.js";import"./icon-button-BA3Zn-K9.js";import"./link-cIVgRg4O.js";import{B as o}from"./button-TqhTuwdT.js";/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const{stablePrefix:H,prefix:M}=G,D={title:"Components/Style Picker/Disclosed",component:"clabs-style-picker",parameters:{docs:{description:{component:"More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction"}}}},O=_`
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
`,B=()=>{var t;(t=document.querySelector(`${H}-style-picker`))==null||t.toggleAttribute("open")},x=t=>{const n=t.detail.value,e=document.querySelector(`${M}-tile`);e.style.borderColor=`${n}`},L=t=>{const n=t.detail.value,e=document.getElementById("inline-tile-icon"),s=r.find(p=>p.value===n).renderIcon(),i=document.createElement("div");S(s,i),e.innerHTML="",e.appendChild(i.firstElementChild)},K=t=>{const n=t.detail.value,s=b.flatMap(d=>d.items).find(d=>d.value===n),i=document.getElementById("inline-tile-pictogram"),p=y(s.pictogram),m=document.createElement("div");S(p,m),i.innerHTML="",i.appendChild(m.firstElementChild)},N={open:{control:"radio",description:"true if the modal is open"},heading:{control:"text",description:"style picker heading."},align:{control:"select",options:[...E],description:"Specify how the popover should align with the trigger element"},kind:{description:"There are three different variants `'single' | 'flat' | 'disclosed'` ",control:"disabled"},enableSearch:{control:"boolean",description:"Enable search option"},searchCloseButtonLabel:{control:"text"},emptyStateTitle:{control:"text"},emptyStateSubtitle:{control:"text"},searchInputPlaceholder:{control:"text"}},c={args:{heading:"Customize",open:!0,align:T.LEFT_TOP,kind:"disclosed",enableSearch:!0,searchCloseButtonLabel:"Clear search input",emptyStateTitle:"No results found",emptyStateSubtitle:"Try a different search"},argTypes:N,render:t=>l`
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
              @click=${B}>
              ${I({slot:"icon"})}
              <span slot="tooltip-content">Color palette</span>
            </cds-icon-button>
            <clabs-style-picker-sections>
              <clabs-style-picker-section heading="Icons">
                ${r.map(n=>l`
                      <clabs-style-picker-option
                        value=${n.value}
                        label=${n.label}
                        ?selected=${n.value==="apple"}
                        @clabs-style-picker-option-select=${e=>L(e)}>
                        <clabs-style-picker-icon>
                          ${n.renderIcon()}
                        </clabs-style-picker-icon>
                      </clabs-style-picker-option>
                    `)}
              </clabs-style-picker-section>
              <clabs-style-picker-section heading="Colors">
                ${C.map(n=>l`<clabs-style-picker-group heading=${n.label}>
                      ${n.items.map(e=>l`
                          <clabs-style-picker-option
                            value=${e.color}
                            label=${e.label}
                            ?selected=${e.label==="Blue 60"}
                            @clabs-style-picker-option-select=${s=>x(s)}>
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
            ${f({slot:"icon"})}
            <span slot="tooltip-content">Delete</span>
          </cds-icon-button>
          <cds-icon-button kind=${o.GHOST}>
            ${P({slot:"icon"})}
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
    `},a={args:{heading:"Customize",open:!0,align:T.LEFT_TOP,kind:"disclosed",enableSearch:!0,searchCloseButtonLabel:"Clear search input",emptyStateTitle:"No results found",emptyStateSubtitle:"Try a different search"},argTypes:N,render:t=>l`
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
              @click="${B}">
              ${I({slot:"icon"})}
              <span slot="tooltip-content">Pictogram list</span>
            </cds-icon-button>
            <clabs-style-picker-sections>
              <clabs-style-picker-section heading="Icons">
                ${r.map(n=>l`
                      <clabs-style-picker-option
                        value=${n.value}
                        label=${n.label}
                        ?selected=${n.value==="apple"}
                        @clabs-style-picker-option-select=${e=>L(e)}>
                        <clabs-style-picker-icon>
                          ${n.renderIcon()}
                        </clabs-style-picker-icon>
                      </clabs-style-picker-option>
                    `)}
              </clabs-style-picker-section>
              <clabs-style-picker-section heading="Colors">
                ${C.map(n=>l`<clabs-style-picker-group heading=${n.label}>
                      ${n.items.map(e=>l`
                          <clabs-style-picker-option
                            value=${e.color}
                            label=${e.label}
                            ?selected=${e.label==="Blue 60"}
                            @clabs-style-picker-option-select=${s=>x(s)}>
                            <clabs-style-picker-color
                              color=${e.color}
                              label=${e.label}></clabs-style-picker-color>
                          </clabs-style-picker-option>
                        `)}
                    </clabs-style-picker-group> `)}
              </clabs-style-picker-section>
              <clabs-style-picker-section heading="Pictograms" size="lg">
                ${b.map(n=>l`<clabs-style-picker-group heading=${n.label}>
                      ${n.items.map(e=>l`
                          <clabs-style-picker-option
                            value=${e.value}
                            label=${e.label}
                            ?selected=${e.label==="Amsterdam"}
                            @clabs-style-picker-option-select=${s=>K(s)}>
                            ${y({...e.pictogram,attrs:{...e.pictogram.attrs,width:"3rem",height:"3rem","aria-label":e.label}})}
                          </clabs-style-picker-option>
                        `)}
                    </clabs-style-picker-group> `)}
              </clabs-style-picker-section>
            </clabs-style-picker-sections>
          </clabs-style-picker>
          <cds-icon-button kind=${o.GHOST}>
            ${f({slot:"icon"})}
            <span slot="tooltip-content">Delete</span>
          </cds-icon-button>
          <cds-icon-button kind=${o.GHOST}>
            ${P({slot:"icon"})}
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
    `};var u,g,k;c.parameters={...c.parameters,docs:{...(u=c.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    heading: 'Customize',
    open: true,
    align: STYLE_PICKER_ALIGNMENT.LEFT_TOP,
    kind: 'disclosed',
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
}`,...(k=(g=c.parameters)==null?void 0:g.docs)==null?void 0:k.source}}};var $,h,v;a.parameters={...a.parameters,docs:{...($=a.parameters)==null?void 0:$.docs,source:{originalSource:`{
  args: {
    heading: 'Customize',
    open: true,
    align: STYLE_PICKER_ALIGNMENT.LEFT_TOP,
    kind: 'disclosed',
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
}`,...(v=(h=a.parameters)==null?void 0:h.docs)==null?void 0:v.source}}};const R=["ColorAndIcon","IconColorPictogram"],Y=Object.freeze(Object.defineProperty({__proto__:null,ColorAndIcon:c,IconColorPictogram:a,__namedExportsOrder:R,default:D},Symbol.toStringTag,{value:"Module"}));export{Y as S};

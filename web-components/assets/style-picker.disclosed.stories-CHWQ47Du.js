import{i as G,x as s,B as T}from"./iframe-CeIA4b2P.js";import{S as C,i as r,c as f,s as I,p as L,r as y,A as b,a as H,b as M}from"./_story.defs-CENZhetm.js";import{s as x,a as O}from"./16-xPs9FiH4.js";import"./icon-button-BIlkXl-F.js";import"./link-COLVNvoL.js";import{B as i}from"./button-lgHuZFI0.js";/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const{stablePrefix:D,prefix:K}=M,R={title:"Components/Style Picker/Disclosed",component:"clabs-style-picker",parameters:{docs:{description:{component:"More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction"}}}},P=G`
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
`,B=()=>{const e=document.querySelector(`${D}-style-picker`),n=document.querySelector("#trigger");e==null||e.toggleAttribute("open"),n.setAttribute("aria-expanded",!!(e!=null&&e.hasAttribute("open")))},N=()=>{document.querySelector("#trigger").setAttribute("aria-expanded","false")},_=e=>{const n=e.detail.value,t=document.querySelector(`${K}-tile`);t.style.borderColor=`${n}`},E=e=>{const n=e.detail.value,t=document.getElementById("inline-tile-icon"),l=r.find(p=>p.value===n).renderIcon(),o=document.createElement("div");T(l,o),t.innerHTML="",t.appendChild(o.firstElementChild)},w=e=>{var g;const n=e.detail.value,t=L.flatMap(d=>d.items),l=(g=t==null?void 0:t.find(d=>d.value===n))==null?void 0:g.pictogram,o=document.getElementById("inline-tile-pictogram"),p=y({...l,attrs:{...l.attrs,"aria-label":n}}),m=document.createElement("div");T(p,m),o.innerHTML="",o.appendChild(m.firstElementChild)},A={open:{control:"radio",description:"true if the modal is open"},heading:{control:"text",description:"style picker heading."},align:{control:"select",options:[...H],description:"Specify how the popover should align with the trigger element"},kind:{description:"There are three different variants `'single' | 'flat' | 'disclosed'` ",control:"disabled"},enableSearch:{control:"boolean",description:"Enable search option"},searchCloseButtonLabel:{control:"text"},emptyStateTitle:{control:"text"},emptyStateSubtitle:{control:"text"},searchInputPlaceholder:{control:"text"},searchLabel:{control:"text"}},c={args:{heading:"Customize",open:!0,align:C.LEFT_TOP,kind:"disclosed",enableSearch:!0,searchCloseButtonLabel:"Clear search input",emptyStateTitle:"No results found",emptyStateSubtitle:"Try a different search",searchLabel:"Search"},argTypes:A,render:e=>s`
      <style>
        ${P}
      </style>
      <div class="style-picker-story-container">
        <cds-layer class="toolbar-layer">
          <clabs-style-picker
            id="style-picker"
            align=${e.align}
            ?open=${e.open}
            heading=${e.heading}
            kind=${e.kind}
            ?enable-search=${e.enableSearch}
            search-close-button-label=${e.searchCloseButtonLabel}
            empty-state-title=${e.emptyStateTitle}
            empty-state-subtitle=${e.emptyStateSubtitle}
            search-label=${e.searchLabel}
            @clabs-style-picker-close=${N}>
            <cds-icon-button
              id="trigger"
              slot="trigger"
              kind=${i.GHOST}
              @click=${B}
              aria-expanded="${e.open}"
              aria-controls="style-picker">
              ${x({slot:"icon"})}
              <span slot="tooltip-content">Color palette</span>
            </cds-icon-button>
            <clabs-style-picker-sections>
              <clabs-style-picker-section heading="Icons">
                ${r.map(n=>s`
                      <clabs-style-picker-option
                        value=${n.value}
                        label=${n.label}
                        ?selected=${n.value==="apple"}
                        @clabs-style-picker-option-select=${t=>E(t)}>
                        <clabs-style-picker-icon>
                          ${n.renderIcon()}
                        </clabs-style-picker-icon>
                      </clabs-style-picker-option>
                    `)}
              </clabs-style-picker-section>
              <clabs-style-picker-section heading="Colors">
                ${f.map(n=>s`<clabs-style-picker-group heading=${n.label}>
                      ${n.items.map(t=>s`
                          <clabs-style-picker-option
                            value=${t.color}
                            label=${t.label}
                            ?selected=${t.label==="Blue 60"}
                            @clabs-style-picker-option-select=${l=>_(l)}>
                            <clabs-style-picker-color
                              color=${t.color}
                              label=${t.label}></clabs-style-picker-color>
                          </clabs-style-picker-option>
                        `)}
                    </clabs-style-picker-group> `)}
              </clabs-style-picker-section>
            </clabs-style-picker-sections>
          </clabs-style-picker>
          <cds-icon-button kind=${i.GHOST}>
            ${I({slot:"icon"})}
            <span slot="tooltip-content">Delete</span>
          </cds-icon-button>
          <cds-icon-button kind=${i.GHOST}>
            ${O({slot:"icon"})}
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
    `},a={args:{heading:"Customize",open:!0,align:C.LEFT_TOP,kind:"disclosed",enableSearch:!0,searchCloseButtonLabel:"Clear search input",emptyStateTitle:"No results found",emptyStateSubtitle:"Try a different search",searchLabel:"Search"},argTypes:A,render:e=>s`
      <style>
        ${P}
      </style>
      <div class="style-picker-story-container">
        <cds-layer class="toolbar-layer">
          <clabs-style-picker
            id="style-picker"
            align=${e.align}
            ?open=${e.open}
            heading=${e.heading}
            kind=${e.kind}
            ?enable-search=${e.enableSearch}
            search-close-button-label=${e.searchCloseButtonLabel}
            empty-state-title=${e.emptyStateTitle}
            empty-state-subtitle=${e.emptyStateSubtitle}
            search-label=${e.searchLabel}
            @clabs-style-picker-close=${N}>
            <cds-icon-button
              id="trigger"
              slot="trigger"
              kind=${i.GHOST}
              @click="${B}"
              aria-expanded="${e.open}"
              aria-controls="style-picker">
              ${x({slot:"icon"})}
              <span slot="tooltip-content">Pictogram list</span>
            </cds-icon-button>
            <clabs-style-picker-sections>
              <clabs-style-picker-section heading="Icons">
                ${r.map(n=>s`
                      <clabs-style-picker-option
                        value=${n.value}
                        label=${n.label}
                        ?selected=${n.value==="apple"}
                        @clabs-style-picker-option-select=${t=>E(t)}>
                        <clabs-style-picker-icon>
                          ${n.renderIcon()}
                        </clabs-style-picker-icon>
                      </clabs-style-picker-option>
                    `)}
              </clabs-style-picker-section>
              <clabs-style-picker-section heading="Colors">
                ${f.map(n=>s`<clabs-style-picker-group heading=${n.label}>
                      ${n.items.map(t=>s`
                          <clabs-style-picker-option
                            value=${t.color}
                            label=${t.label}
                            ?selected=${t.label==="Blue 60"}
                            @clabs-style-picker-option-select=${l=>_(l)}>
                            <clabs-style-picker-color
                              color=${t.color}
                              label=${t.label}></clabs-style-picker-color>
                          </clabs-style-picker-option>
                        `)}
                    </clabs-style-picker-group> `)}
              </clabs-style-picker-section>
              <clabs-style-picker-section heading="Pictograms" size="lg">
                ${L.map(n=>s`<clabs-style-picker-group heading=${n.label}>
                      ${n.items.map(t=>s`
                          <clabs-style-picker-option
                            value=${t.value}
                            label=${t.label}
                            ?selected=${t.label==="Amsterdam"}
                            @clabs-style-picker-option-select=${l=>w(l)}>
                            ${y({...t.pictogram,attrs:{...t.pictogram.attrs,width:"3rem",height:"3rem","aria-label":t.label}})}
                          </clabs-style-picker-option>
                        `)}
                    </clabs-style-picker-group> `)}
              </clabs-style-picker-section>
            </clabs-style-picker-sections>
          </clabs-style-picker>
          <cds-icon-button kind=${i.GHOST}>
            ${I({slot:"icon"})}
            <span slot="tooltip-content">Delete</span>
          </cds-icon-button>
          <cds-icon-button kind=${i.GHOST}>
            ${O({slot:"icon"})}
            <span slot="tooltip-content">More</span>
          </cds-icon-button>
        </cds-layer>
        <div class="inline-tile-holder">
          <cds-tile class="inline-tile">
            <div id="inline-tile-pictogram">
              ${y({...b,attrs:{...b.attrs,"aria-label":b.name}})}
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
    `};var u,k,$;c.parameters={...c.parameters,docs:{...(u=c.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    heading: 'Customize',
    open: true,
    align: STYLE_PICKER_ALIGNMENT.LEFT_TOP,
    kind: 'disclosed',
    enableSearch: true,
    searchCloseButtonLabel: 'Clear search input',
    emptyStateTitle: 'No results found',
    emptyStateSubtitle: 'Try a different search',
    searchLabel: 'Search'
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
            id="style-picker"
            align=\${args.align}
            ?open=\${args.open}
            heading=\${args.heading}
            kind=\${args.kind}
            ?enable-search=\${args.enableSearch}
            search-close-button-label=\${args.searchCloseButtonLabel}
            empty-state-title=\${args.emptyStateTitle}
            empty-state-subtitle=\${args.emptyStateSubtitle}
            search-label=\${args.searchLabel}
            @clabs-style-picker-close=\${closed}>
            <cds-icon-button
              id="trigger"
              slot="trigger"
              kind=\${BUTTON_KIND.GHOST}
              @click=\${toggleButton}
              aria-expanded="\${args.open}"
              aria-controls="style-picker">
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
}`,...($=(k=c.parameters)==null?void 0:k.docs)==null?void 0:$.source}}};var h,v,S;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    heading: 'Customize',
    open: true,
    align: STYLE_PICKER_ALIGNMENT.LEFT_TOP,
    kind: 'disclosed',
    enableSearch: true,
    searchCloseButtonLabel: 'Clear search input',
    emptyStateTitle: 'No results found',
    emptyStateSubtitle: 'Try a different search',
    searchLabel: 'Search'
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
            id="style-picker"
            align=\${args.align}
            ?open=\${args.open}
            heading=\${args.heading}
            kind=\${args.kind}
            ?enable-search=\${args.enableSearch}
            search-close-button-label=\${args.searchCloseButtonLabel}
            empty-state-title=\${args.emptyStateTitle}
            empty-state-subtitle=\${args.emptyStateSubtitle}
            search-label=\${args.searchLabel}
            @clabs-style-picker-close=\${closed}>
            <cds-icon-button
              id="trigger"
              slot="trigger"
              kind=\${BUTTON_KIND.GHOST}
              @click="\${toggleButton}"
              aria-expanded="\${args.open}"
              aria-controls="style-picker">
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
              \${renderCarbonPictogram({
    ...AmsterdamWindmill,
    attrs: {
      ...AmsterdamWindmill.attrs,
      'aria-label': AmsterdamWindmill.name
    }
  })}
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
}`,...(S=(v=a.parameters)==null?void 0:v.docs)==null?void 0:S.source}}};const z=["ColorAndIcon","IconColorPictogram"],V=Object.freeze(Object.defineProperty({__proto__:null,ColorAndIcon:c,IconColorPictogram:a,__namedExportsOrder:z,default:R},Symbol.toStringTag,{value:"Module"}));export{V as S};

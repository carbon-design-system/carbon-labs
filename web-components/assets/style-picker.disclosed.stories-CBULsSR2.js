import{b as s,i as H,D as C}from"./iframe-CklRD_a7.js";import{a as D,S as f,i as p,c as L,p as I,r as m,A as y,_ as x}from"./_story.defs-mAiKZPIa.js";import{_,a as O}from"./16-CY-Gc_tI.js";import{i}from"./icon-loader-BnOa4aZQ.js";import"./icon-button-wK-Ha-DP.js";import"./link-hOtgFSX0.js";import{B as o}from"./button-BFHOK1Jb.js";import{s as M}from"./settings-BQP9c3yA.js";/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const{stablePrefix:K,prefix:w}=M,z={title:"Components/Style Picker/Disclosed",component:"clabs-style-picker",parameters:{docs:{description:{component:"More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction"}}}},P=H`
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
`,B=()=>{const e=document.querySelector(`${K}-style-picker`),n=document.querySelector("#trigger");e==null||e.toggleAttribute("open"),n.setAttribute("aria-expanded",!!(e!=null&&e.hasAttribute("open")))},N=()=>{document.querySelector("#trigger").setAttribute("aria-expanded","false")},E=e=>{const n=e.detail.value,t=document.querySelector(`${w}-tile`);t.style.borderColor=`${n}`},A=e=>{const n=e.detail.value,t=document.getElementById("inline-tile-icon"),l=p.find(d=>d.value===n).renderIcon,a=document.createElement("div");C(l,a),t.innerHTML="",t.appendChild(a.firstElementChild)},R=e=>{var $;const n=e.detail.value,t=I.flatMap(b=>b.items),l=($=t==null?void 0:t.find(b=>b.value===n))==null?void 0:$.pictogram,a=document.getElementById("inline-tile-pictogram"),d=m({...l,attrs:{...l.attrs,"aria-label":n}}),g=document.createElement("div");C(d,g),a.innerHTML="",a.appendChild(g.firstElementChild)},G={open:{control:"radio",description:"true if the modal is open"},heading:{control:"text",description:"style picker heading."},align:{control:"select",options:[...D],description:"Specify how the popover should align with the trigger element"},kind:{description:"There are three different variants `'single' | 'flat' | 'disclosed'` ",control:"disabled"},enableSearch:{control:"boolean",description:"Enable search option"},searchCloseButtonLabel:{control:"text"},emptyStateTitle:{control:"text"},emptyStateSubtitle:{control:"text"},searchInputPlaceholder:{control:"text"},searchLabel:{control:"text"}},c={args:{heading:"Customize",open:!0,align:f.LEFT_TOP,kind:"disclosed",enableSearch:!0,searchCloseButtonLabel:"Clear search input",emptyStateTitle:"No results found",emptyStateSubtitle:"Try a different search",searchLabel:"Search"},argTypes:G,render:e=>s`
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
            ?loading=${e.isLoading}
            ?enable-search=${e.enableSearch}
            search-close-button-label=${e.searchCloseButtonLabel}
            empty-state-title=${e.emptyStateTitle}
            empty-state-subtitle=${e.emptyStateSubtitle}
            search-label=${e.searchLabel}
            @clabs-style-picker-close=${N}>
            <cds-icon-button
              id="trigger"
              slot="trigger"
              kind=${o.GHOST}
              @click=${B}
              aria-expanded="${e.open}"
              aria-controls="style-picker">
              ${i(_,{slot:"icon"})}
              <span slot="tooltip-content">Color palette</span>
            </cds-icon-button>
            <clabs-style-picker-sections>
              <clabs-style-picker-section heading="Icons">
                ${p.map(n=>s`
                      <clabs-style-picker-option
                        value=${n.value}
                        label=${n.label}
                        ?selected=${n.value==="apple"}
                        @clabs-style-picker-option-select=${t=>A(t)}>
                        <clabs-style-picker-icon>
                          ${n.renderIcon}
                        </clabs-style-picker-icon>
                      </clabs-style-picker-option>
                    `)}
              </clabs-style-picker-section>
              <clabs-style-picker-section heading="Colors">
                ${L.map(n=>s`<clabs-style-picker-group heading=${n.label}>
                      ${n.items.map(t=>s`
                          <clabs-style-picker-option
                            value=${t.color}
                            label=${t.label}
                            ?selected=${t.label==="Blue 60"}
                            @clabs-style-picker-option-select=${l=>E(l)}>
                            <clabs-style-picker-color
                              color=${t.color}
                              label=${t.label}></clabs-style-picker-color>
                          </clabs-style-picker-option>
                        `)}
                    </clabs-style-picker-group> `)}
              </clabs-style-picker-section>
            </clabs-style-picker-sections>
          </clabs-style-picker>
          <cds-icon-button kind=${o.GHOST}>
            ${i(x,{slot:"icon"})}
            <span slot="tooltip-content">Delete</span>
          </cds-icon-button>
          <cds-icon-button kind=${o.GHOST}>
            ${i(O,{slot:"icon"})}
            <span slot="tooltip-content">More</span>
          </cds-icon-button>
        </cds-layer>
        <div class="inline-tile-holder">
          <cds-tile class="inline-tile">
            <div class="inline-tile-header">
              <span id="inline-tile-icon">${p[0].renderIcon}</span>
              <h6>Primary text</h6>
            </div>
            <br />
            <small>Secondary text or description</small>
            <br /><br />
            <cds-link href="#">Link</cds-link>
          </cds-tile>
        </div>
      </div>
    `},r={args:{heading:"Customize",open:!0,align:f.LEFT_TOP,kind:"disclosed",enableSearch:!0,searchCloseButtonLabel:"Clear search input",emptyStateTitle:"No results found",emptyStateSubtitle:"Try a different search",searchLabel:"Search"},argTypes:G,render:e=>s`
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
            ?loading=${e.isLoading}
            ?enable-search=${e.enableSearch}
            search-close-button-label=${e.searchCloseButtonLabel}
            empty-state-title=${e.emptyStateTitle}
            empty-state-subtitle=${e.emptyStateSubtitle}
            search-label=${e.searchLabel}
            @clabs-style-picker-close=${N}>
            <cds-icon-button
              id="trigger"
              slot="trigger"
              kind=${o.GHOST}
              @click="${B}"
              aria-expanded="${e.open}"
              aria-controls="style-picker">
              ${i(_,{slot:"icon"})}
              <span slot="tooltip-content">Pictogram list</span>
            </cds-icon-button>
            <clabs-style-picker-sections>
              <clabs-style-picker-section heading="Icons">
                ${p.map(n=>s`
                      <clabs-style-picker-option
                        value=${n.value}
                        label=${n.label}
                        ?selected=${n.value==="apple"}
                        @clabs-style-picker-option-select=${t=>A(t)}>
                        <clabs-style-picker-icon>
                          ${n.renderIcon}
                        </clabs-style-picker-icon>
                      </clabs-style-picker-option>
                    `)}
              </clabs-style-picker-section>
              <clabs-style-picker-section heading="Colors">
                ${L.map(n=>s`<clabs-style-picker-group heading=${n.label}>
                      ${n.items.map(t=>s`
                          <clabs-style-picker-option
                            value=${t.color}
                            label=${t.label}
                            ?selected=${t.label==="Blue 60"}
                            @clabs-style-picker-option-select=${l=>E(l)}>
                            <clabs-style-picker-color
                              color=${t.color}
                              label=${t.label}></clabs-style-picker-color>
                          </clabs-style-picker-option>
                        `)}
                    </clabs-style-picker-group> `)}
              </clabs-style-picker-section>
              <clabs-style-picker-section heading="Pictograms" size="lg">
                ${I.map(n=>s`<clabs-style-picker-group heading=${n.label}>
                      ${n.items.map(t=>s`
                          <clabs-style-picker-option
                            value=${t.value}
                            label=${t.label}
                            ?selected=${t.label==="Amsterdam"}
                            @clabs-style-picker-option-select=${l=>R(l)}>
                            ${m({...t.pictogram,attrs:{...t.pictogram.attrs,width:"3rem",height:"3rem","aria-label":t.label}})}
                          </clabs-style-picker-option>
                        `)}
                    </clabs-style-picker-group> `)}
              </clabs-style-picker-section>
            </clabs-style-picker-sections>
          </clabs-style-picker>
          <cds-icon-button kind=${o.GHOST}>
            ${i(x,{slot:"icon"})}
            <span slot="tooltip-content">Delete</span>
          </cds-icon-button>
          <cds-icon-button kind=${o.GHOST}>
            ${i(O,{slot:"icon"})}
            <span slot="tooltip-content">More</span>
          </cds-icon-button>
        </cds-layer>
        <div class="inline-tile-holder">
          <cds-tile class="inline-tile">
            <div id="inline-tile-pictogram">
              ${m({...y,attrs:{...y.attrs,"aria-label":y.name}})}
            </div>
            <br />
            <div class="inline-tile-header">
              <span id="inline-tile-icon">${p[0].renderIcon}</span>
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
    `};var u,k,h;c.parameters={...c.parameters,docs:{...(u=c.parameters)==null?void 0:u.docs,source:{originalSource:`{
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
            ?loading=\${args.isLoading}
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
              \${iconLoader(ColorPalette16, {
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
                          \${item.renderIcon}
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
            \${iconLoader(TrashCan16, {
    slot: 'icon'
  })}
            <span slot="tooltip-content">Delete</span>
          </cds-icon-button>
          <cds-icon-button kind=\${BUTTON_KIND.GHOST}>
            \${iconLoader(OverflowMenuVertical16, {
    slot: 'icon'
  })}
            <span slot="tooltip-content">More</span>
          </cds-icon-button>
        </cds-layer>
        <div class="inline-tile-holder">
          <cds-tile class="inline-tile">
            <div class="inline-tile-header">
              <span id="inline-tile-icon">\${icons[0].renderIcon}</span>
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
}`,...(h=(k=c.parameters)==null?void 0:k.docs)==null?void 0:h.source}}};var S,v,T;r.parameters={...r.parameters,docs:{...(S=r.parameters)==null?void 0:S.docs,source:{originalSource:`{
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
            ?loading=\${args.isLoading}
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
              \${iconLoader(ColorPalette16, {
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
                          \${item.renderIcon}
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
            \${iconLoader(TrashCan16, {
    slot: 'icon'
  })}
            <span slot="tooltip-content">Delete</span>
          </cds-icon-button>
          <cds-icon-button kind=\${BUTTON_KIND.GHOST}>
            \${iconLoader(OverflowMenuVertical16, {
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
              <span id="inline-tile-icon">\${icons[0].renderIcon}</span>
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
}`,...(T=(v=r.parameters)==null?void 0:v.docs)==null?void 0:T.source}}};const U=["ColorAndIcon","IconColorPictogram"],X=Object.freeze(Object.defineProperty({__proto__:null,ColorAndIcon:c,IconColorPictogram:r,__namedExportsOrder:U,default:z},Symbol.toStringTag,{value:"Module"}));export{X as S};

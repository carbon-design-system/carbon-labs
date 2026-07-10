import{I as e,R as t,U as n,X as r}from"./iframe-BWZhqYCU.js";import{t as i}from"./settings-DS_WyTy3.js";import{r as a}from"./button-CFQYk3PK.js";import"./icon-button-BW-25QBs.js";import{t as o}from"./icon-loader-De29IsvC.js";import"./link-CpVp2JOH.js";import{c as s,i as c,l,n as u,o as d,r as f,s as p,t as m}from"./_story.defs-D2gzasbx.js";import{t as h}from"./16-7T37kqY_.js";import{t as g}from"./16-DzZ9FFq2.js";var _=r(s()),{stablePrefix:v,prefix:y}=i,b={title:`Components/Style Picker/Disclosed`,component:`clabs-style-picker`,parameters:{docs:{description:{component:`More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction`}}}},x=n`
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
`,S=()=>{let e=document.querySelector(`${v}-style-picker`),t=document.querySelector(`#trigger`);e?.toggleAttribute(`open`),t.setAttribute(`aria-expanded`,!!e?.hasAttribute(`open`))},C=()=>{document.querySelector(`#trigger`).setAttribute(`aria-expanded`,`false`)},w=e=>{let t=e.detail.value,n=document.querySelector(`${y}-tile`);n.style.borderColor=`${t}`},T=t=>{let n=t.detail.value,r=document.getElementById(`inline-tile-icon`),i=f.find(e=>e.value===n).renderIcon,a=document.createElement(`div`);e(i,a),r.innerHTML=``,r.appendChild(a.firstElementChild)},E=t=>{let n=t.detail.value,r=c.flatMap(e=>e.items)?.find(e=>e.value===n)?.pictogram,i=document.getElementById(`inline-tile-pictogram`),a=d({...r,attrs:{...r.attrs,"aria-label":n}}),o=document.createElement(`div`);e(a,o),i.innerHTML=``,i.appendChild(o.firstElementChild)},D={open:{control:`radio`,description:`true if the modal is open`},heading:{control:`text`,description:`style picker heading.`},align:{control:`select`,options:[...m],description:`Specify how the popover should align with the trigger element`},kind:{description:"There are three different variants `'single' | 'flat' | 'disclosed'` ",control:`disabled`},enableSearch:{control:`boolean`,description:`Enable search option`},searchCloseButtonLabel:{control:`text`},emptyStateTitle:{control:`text`},emptyStateSubtitle:{control:`text`},searchInputPlaceholder:{control:`text`},searchLabel:{control:`text`}},O={args:{heading:`Customize`,open:!0,align:p.LEFT_TOP,kind:`disclosed`,enableSearch:!0,searchCloseButtonLabel:`Clear search input`,emptyStateTitle:`No results found`,emptyStateSubtitle:`Try a different search`,searchLabel:`Search`},argTypes:D,render:e=>t`
    <style>
      ${x}
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
          @clabs-style-picker-close=${C}>
          <cds-icon-button
            id="trigger"
            slot="trigger"
            kind=${a.GHOST}
            @click=${S}
            aria-expanded="${e.open}"
            aria-controls="style-picker">
            ${o(h,{slot:`icon`})}
            <span slot="tooltip-content">Color palette</span>
          </cds-icon-button>
          <clabs-style-picker-sections>
            <clabs-style-picker-section heading="Icons">
              ${f.map(e=>t`
                  <clabs-style-picker-option
                    value=${e.value}
                    label=${e.label}
                    ?selected=${e.value===`apple`}
                    @clabs-style-picker-option-select=${e=>T(e)}>
                    <clabs-style-picker-icon>
                      ${e.renderIcon}
                    </clabs-style-picker-icon>
                  </clabs-style-picker-option>
                `)}
            </clabs-style-picker-section>
            <clabs-style-picker-section heading="Colors">
              ${u.map(e=>t`<clabs-style-picker-group heading=${e.label}>
                    ${e.items.map(e=>t`
                        <clabs-style-picker-option
                          value=${e.color}
                          label=${e.label}
                          ?selected=${e.label===`Blue 60`}
                          @clabs-style-picker-option-select=${e=>w(e)}>
                          <clabs-style-picker-color
                            color=${e.color}
                            label=${e.label}></clabs-style-picker-color>
                        </clabs-style-picker-option>
                      `)}
                  </clabs-style-picker-group> `)}
            </clabs-style-picker-section>
          </clabs-style-picker-sections>
        </clabs-style-picker>
        <cds-icon-button kind=${a.GHOST}>
          ${o(l,{slot:`icon`})}
          <span slot="tooltip-content">Delete</span>
        </cds-icon-button>
        <cds-icon-button kind=${a.GHOST}>
          ${o(g,{slot:`icon`})}
          <span slot="tooltip-content">More</span>
        </cds-icon-button>
      </cds-layer>
      <div class="inline-tile-holder">
        <cds-tile class="inline-tile">
          <div class="inline-tile-header">
            <span id="inline-tile-icon">${f[0].renderIcon}</span>
            <h6>Primary text</h6>
          </div>
          <br />
          <small>Secondary text or description</small>
          <br /><br />
          <cds-link href="#">Link</cds-link>
        </cds-tile>
      </div>
    </div>
  `},k={args:{heading:`Customize`,open:!0,align:p.LEFT_TOP,kind:`disclosed`,enableSearch:!0,searchCloseButtonLabel:`Clear search input`,emptyStateTitle:`No results found`,emptyStateSubtitle:`Try a different search`,searchLabel:`Search`},argTypes:D,render:e=>t`
    <style>
      ${x}
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
          @clabs-style-picker-close=${C}>
          <cds-icon-button
            id="trigger"
            slot="trigger"
            kind=${a.GHOST}
            @click="${S}"
            aria-expanded="${e.open}"
            aria-controls="style-picker">
            ${o(h,{slot:`icon`})}
            <span slot="tooltip-content">Pictogram list</span>
          </cds-icon-button>
          <clabs-style-picker-sections>
            <clabs-style-picker-section heading="Icons">
              ${f.map(e=>t`
                  <clabs-style-picker-option
                    value=${e.value}
                    label=${e.label}
                    ?selected=${e.value===`apple`}
                    @clabs-style-picker-option-select=${e=>T(e)}>
                    <clabs-style-picker-icon>
                      ${e.renderIcon}
                    </clabs-style-picker-icon>
                  </clabs-style-picker-option>
                `)}
            </clabs-style-picker-section>
            <clabs-style-picker-section heading="Colors">
              ${u.map(e=>t`<clabs-style-picker-group heading=${e.label}>
                    ${e.items.map(e=>t`
                        <clabs-style-picker-option
                          value=${e.color}
                          label=${e.label}
                          ?selected=${e.label===`Blue 60`}
                          @clabs-style-picker-option-select=${e=>w(e)}>
                          <clabs-style-picker-color
                            color=${e.color}
                            label=${e.label}></clabs-style-picker-color>
                        </clabs-style-picker-option>
                      `)}
                  </clabs-style-picker-group> `)}
            </clabs-style-picker-section>
            <clabs-style-picker-section heading="Pictograms" size="lg">
              ${c.map(e=>t`<clabs-style-picker-group heading=${e.label}>
                    ${e.items.map(e=>t`
                        <clabs-style-picker-option
                          value=${e.value}
                          label=${e.label}
                          ?selected=${e.label===`Amsterdam`}
                          @clabs-style-picker-option-select=${e=>E(e,!0)}>
                          ${d({...e.pictogram,attrs:{...e.pictogram.attrs,width:`3rem`,height:`3rem`,"aria-label":e.label}})}
                        </clabs-style-picker-option>
                      `)}
                  </clabs-style-picker-group> `)}
            </clabs-style-picker-section>
          </clabs-style-picker-sections>
        </clabs-style-picker>
        <cds-icon-button kind=${a.GHOST}>
          ${o(l,{slot:`icon`})}
          <span slot="tooltip-content">Delete</span>
        </cds-icon-button>
        <cds-icon-button kind=${a.GHOST}>
          ${o(g,{slot:`icon`})}
          <span slot="tooltip-content">More</span>
        </cds-icon-button>
      </cds-layer>
      <div class="inline-tile-holder">
        <cds-tile class="inline-tile">
          <div id="inline-tile-pictogram">
            ${d({..._.default,attrs:{..._.default.attrs,"aria-label":_.default.name}})}
          </div>
          <br />
          <div class="inline-tile-header">
            <span id="inline-tile-icon">${f[0].renderIcon}</span>
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
  `};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source}}};var A=[`ColorAndIcon`,`IconColorPictogram`];export{O as ColorAndIcon,k as IconColorPictogram,A as __namedExportsOrder,b as default};
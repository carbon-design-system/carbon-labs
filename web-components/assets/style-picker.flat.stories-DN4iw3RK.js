import{F as e,H as t,L as n,Y as r,q as i}from"./iframe-B-_BHJcW.js";import{t as a}from"./settings-DS_WyTy3.js";import{r as o}from"./button-9A_e-i_-.js";import"./icon-button-wQrPi-qI.js";import{t as s}from"./icon-loader-BVs6i33w.js";import"./link-DK6wXkAk.js";import{c,i as l,l as u,n as d,o as f,r as p,s as m,t as h,u as g}from"./_story.defs-CZFeLmhh.js";import{t as _}from"./16-CGD51oxr.js";var v=i({ColorAndIcon:()=>A,ColorAndPictogram:()=>j,__namedExportsOrder:()=>M,default:()=>S}),y=r(c()),{stablePrefix:b,prefix:x}=a,S={title:`Components/Style Picker/Flat`,component:`clabs-style-picker`,parameters:{docs:{description:{component:`More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction`}}}},C=t`
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
`,w=()=>{let e=document.querySelector(`${b}-style-picker`),t=document.querySelector(`#trigger`);e?.toggleAttribute(`open`),t.setAttribute(`aria-expanded`,!!e?.hasAttribute(`open`))},T=()=>{document.querySelector(`#trigger`).setAttribute(`aria-expanded`,`false`)},E=e=>{let t=e.detail.value,n=document.querySelector(`${x}-tile`);n.style.borderColor=`${t}`},D=t=>{let n=t.detail.value,r=p.find(e=>e.value===n).renderIcon,i=document.getElementById(`inline-tile-icon`),a=document.createElement(`div`);e(r,a),i.innerHTML=``,i.appendChild(a.firstElementChild)},O=t=>{let n=t.detail.value,r=l.flatMap(e=>e.items)?.find(e=>e.value===n)?.pictogram,i=document.getElementById(`inline-tile-pictogram`),a=f({...r,attrs:{...r.attrs,"aria-label":n}}),o=document.createElement(`div`);e(a,o),i.innerHTML=``,i.appendChild(o.firstElementChild)},k={open:{control:`radio`,description:`true if the modal is open`},heading:{control:`text`,description:`style picker heading.`},align:{control:`select`,options:[...h],description:`Specify how the popover should align with the trigger element`},kind:{description:"There are three different variants `'single' | 'flat' | 'disclosed'` ",control:`disabled`},enableSearch:{control:`boolean`,description:`Enable search option`},searchCloseButtonLabel:{control:`text`},emptyStateTitle:{control:`text`},emptyStateSubtitle:{control:`text`},searchInputPlaceholder:{control:`text`},searchLabel:{control:`text`}},A={args:{heading:`Choose color and icon`,open:!0,align:m.LEFT_TOP,kind:`flat`,enableSearch:!0,searchCloseButtonLabel:`Clear search input`,emptyStateTitle:`No results found`,emptyStateSubtitle:`Try a different search`,searchLabel:`Search`},argTypes:k,render:e=>n`
    <style>
      ${C}
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
          @clabs-style-picker-close=${T}>
          <cds-icon-button
            id="trigger"
            slot="trigger"
            kind=${o.GHOST}
            @click=${w}
            aria-expanded="${e.open}"
            aria-controls="style-picker">
            ${s(_,{slot:`icon`})}
            <span slot="tooltip-content">Color palette</span>
          </cds-icon-button>
          <clabs-style-picker-section heading="Colors">
            ${d[0].items.map(e=>n`
                <clabs-style-picker-option
                  value=${e.color}
                  label=${e.label}
                  ?selected=${e.label===`Yellow 20`}
                  @clabs-style-picker-option-select=${e=>E(e)}>
                  <clabs-style-picker-color
                    color=${e.color}
                    label=${e.label}></clabs-style-picker-color>
                </clabs-style-picker-option>
              `)}
          </clabs-style-picker-section>
          <clabs-style-picker-section heading="Icons">
            ${p.map(e=>n`
                <clabs-style-picker-option
                  value=${e.value}
                  label=${e.label}
                  ?selected=${e.value===`apple`}
                  @clabs-style-picker-option-select=${e=>D(e)}>
                  <clabs-style-picker-icon>
                    ${e.renderIcon}
                  </clabs-style-picker-icon>
                </clabs-style-picker-option>
              `)}
          </clabs-style-picker-section>
        </clabs-style-picker>
        <cds-icon-button kind=${o.GHOST}>
          ${s(u,{slot:`icon`})}
          <span slot="tooltip-content">Delete</span>
        </cds-icon-button>
        <cds-icon-button kind=${o.GHOST}>
          ${s(g,{slot:`icon`})}
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
  `},j={args:{heading:`Customize`,open:!0,align:m.LEFT_TOP,kind:`flat`,enableSearch:!0,searchCloseButtonLabel:`Clear search input`,emptyStateTitle:`No results found`,emptyStateSubtitle:`Try a different search`,searchLabel:`Search`},argTypes:k,render:e=>n`
    <style>
      ${C}
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
          @clabs-style-picker-close=${T}>
          <cds-icon-button
            id="trigger"
            slot="trigger"
            kind=${o.GHOST}
            @click=${w}
            aria-expanded="${e.open}"
            aria-controls="style-picker">
            ${s(_,{slot:`icon`})}
            <span slot="tooltip-content">Pictogram list</span>
          </cds-icon-button>
          <clabs-style-picker-section heading="Colors">
            ${d[0].items.map(e=>n`
                <clabs-style-picker-option
                  value=${e.color}
                  label=${e.label}
                  ?selected=${e.label===`Yellow 20`}
                  @clabs-style-picker-option-select=${e=>E(e)}>
                  <clabs-style-picker-color
                    color=${e.color}
                    label=${e.label}></clabs-style-picker-color>
                </clabs-style-picker-option>
              `)}
          </clabs-style-picker-section>
          <clabs-style-picker-section heading="Pictograms" size="lg">
            ${l[0].items.map(e=>n`
                <clabs-style-picker-option
                  value=${e.value}
                  label=${e.label}
                  ?selected=${e.label===`Amsterdam`}
                  @clabs-style-picker-option-select=${e=>O(e)}>
                  ${f({...e.pictogram,attrs:{...e.pictogram.attrs,width:`3rem`,height:`3rem`,"aria-label":e.label}})}
                </clabs-style-picker-option>
              `)}
          </clabs-style-picker-section>
        </clabs-style-picker>
        <cds-icon-button kind=${o.GHOST}>
          ${s(u,{slot:`icon`})}
          <span slot="tooltip-content">Delete</span>
        </cds-icon-button>
        <cds-icon-button kind=${o.GHOST}>
          ${s(g,{slot:`icon`})}
          <span slot="tooltip-content">More</span>
        </cds-icon-button>
      </cds-layer>
      <div class="inline-tile-holder">
        <cds-tile class="inline-tile">
          <div id="inline-tile-pictogram">
            ${f({...y.default,attrs:{...y.default.attrs,"aria-label":y.default.name}})}
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
  `};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    heading: 'Choose color and icon',
    open: true,
    align: STYLE_PICKER_ALIGNMENT.LEFT_TOP,
    kind: 'flat',
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
                    \${item.renderIcon}
                  </clabs-style-picker-icon>
                </clabs-style-picker-option>
              \`)}
          </clabs-style-picker-section>
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
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    heading: 'Customize',
    open: true,
    align: STYLE_PICKER_ALIGNMENT.LEFT_TOP,
    kind: 'flat',
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
}`,...j.parameters?.docs?.source}}};var M=[`ColorAndIcon`,`ColorAndPictogram`];export{A as ColorAndIcon,j as ColorAndPictogram,M as __namedExportsOrder,S as default,v as t};
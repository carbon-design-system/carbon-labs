import{b as l,i as G,D as f}from"./iframe-CWxIaTBF.js";import{a as H,S as C,i as m,c as L,p as x,r as y,A as b,_}from"./_story.defs-CfxAzhcF.js";import{_ as I,a as O}from"./16-CY-Gc_tI.js";import{i as o}from"./icon-loader-XW-1c_yr.js";import"./icon-button-CZHt8eun.js";import"./link-DQbdIi59.js";import{B as i}from"./button-CNf5SbJF.js";import{s as M}from"./settings-BQP9c3yA.js";/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const{stablePrefix:w,prefix:D}=M,K={title:"Components/Style Picker/Flat",component:"clabs-style-picker",parameters:{docs:{description:{component:"More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction"}}}},P=G`
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
`,N=()=>{const e=document.querySelector(`${w}-style-picker`),t=document.querySelector("#trigger");e==null||e.toggleAttribute("open"),t.setAttribute("aria-expanded",!!(e!=null&&e.hasAttribute("open")))},E=()=>{document.querySelector("#trigger").setAttribute("aria-expanded","false")},B=e=>{const t=e.detail.value,n=document.querySelector(`${D}-tile`);n.style.borderColor=`${t}`},R=e=>{const t=e.detail.value,n=m.find(p=>p.value===t).renderIcon,s=document.getElementById("inline-tile-icon"),a=document.createElement("div");f(n,a),s.innerHTML="",s.appendChild(a.firstElementChild)},U=e=>{var $;const t=e.detail.value,n=x.flatMap(d=>d.items),s=($=n==null?void 0:n.find(d=>d.value===t))==null?void 0:$.pictogram,a=document.getElementById("inline-tile-pictogram"),p=y({...s,attrs:{...s.attrs,"aria-label":t}}),g=document.createElement("div");f(p,g),a.innerHTML="",a.appendChild(g.firstElementChild)},A={open:{control:"radio",description:"true if the modal is open"},heading:{control:"text",description:"style picker heading."},align:{control:"select",options:[...H],description:"Specify how the popover should align with the trigger element"},kind:{description:"There are three different variants `'single' | 'flat' | 'disclosed'` ",control:"disabled"},enableSearch:{control:"boolean",description:"Enable search option"},searchCloseButtonLabel:{control:"text"},emptyStateTitle:{control:"text"},emptyStateSubtitle:{control:"text"},searchInputPlaceholder:{control:"text"},searchLabel:{control:"text"}},c={args:{heading:"Choose color and icon",open:!0,align:C.LEFT_TOP,kind:"flat",enableSearch:!0,searchCloseButtonLabel:"Clear search input",emptyStateTitle:"No results found",emptyStateSubtitle:"Try a different search",searchLabel:"Search"},argTypes:A,render:e=>l`
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
            @clabs-style-picker-close=${E}>
            <cds-icon-button
              id="trigger"
              slot="trigger"
              kind=${i.GHOST}
              @click=${N}
              aria-expanded="${e.open}"
              aria-controls="style-picker">
              ${o(I,{slot:"icon"})}
              <span slot="tooltip-content">Color palette</span>
            </cds-icon-button>
            <clabs-style-picker-section heading="Colors">
              ${L[0].items.map(t=>l`
                  <clabs-style-picker-option
                    value=${t.color}
                    label=${t.label}
                    ?selected=${t.label==="Yellow 20"}
                    @clabs-style-picker-option-select=${n=>B(n)}>
                    <clabs-style-picker-color
                      color=${t.color}
                      label=${t.label}></clabs-style-picker-color>
                  </clabs-style-picker-option>
                `)}
            </clabs-style-picker-section>
            <clabs-style-picker-section heading="Icons">
              ${m.map(t=>l`
                    <clabs-style-picker-option
                      value=${t.value}
                      label=${t.label}
                      ?selected=${t.value==="apple"}
                      @clabs-style-picker-option-select=${n=>R(n)}>
                      <clabs-style-picker-icon>
                        ${t.renderIcon}
                      </clabs-style-picker-icon>
                    </clabs-style-picker-option>
                  `)}
            </clabs-style-picker-section>
          </clabs-style-picker>
          <cds-icon-button kind=${i.GHOST}>
            ${o(_,{slot:"icon"})}
            <span slot="tooltip-content">Delete</span>
          </cds-icon-button>
          <cds-icon-button kind=${i.GHOST}>
            ${o(O,{slot:"icon"})}
            <span slot="tooltip-content">More</span>
          </cds-icon-button>
        </cds-layer>
        <div class="inline-tile-holder">
          <cds-tile class="inline-tile">
            <div class="inline-tile-header">
              <span id="inline-tile-icon">${m[0].renderIcon}</span>
              <h6>Primary text</h6>
            </div>
            <br />
            <small>Secondary text or description</small>
            <br /><br />
            <cds-link href="#">Link</cds-link>
          </cds-tile>
        </div>
      </div>
    `},r={args:{heading:"Customize",open:!0,align:C.LEFT_TOP,kind:"flat",enableSearch:!0,searchCloseButtonLabel:"Clear search input",emptyStateTitle:"No results found",emptyStateSubtitle:"Try a different search",searchLabel:"Search"},argTypes:A,render:e=>l`
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
            @clabs-style-picker-close=${E}>
            <cds-icon-button
              id="trigger"
              slot="trigger"
              kind=${i.GHOST}
              @click=${N}
              aria-expanded="${e.open}"
              aria-controls="style-picker">
              ${o(I,{slot:"icon"})}
              <span slot="tooltip-content">Pictogram list</span>
            </cds-icon-button>
            <clabs-style-picker-section heading="Colors">
              ${L[0].items.map(t=>l`
                  <clabs-style-picker-option
                    value=${t.color}
                    label=${t.label}
                    ?selected=${t.label==="Yellow 20"}
                    @clabs-style-picker-option-select=${n=>B(n)}>
                    <clabs-style-picker-color
                      color=${t.color}
                      label=${t.label}></clabs-style-picker-color>
                  </clabs-style-picker-option>
                `)}
            </clabs-style-picker-section>
            <clabs-style-picker-section heading="Pictograms" size="lg">
              ${x[0].items.map(t=>l`
                  <clabs-style-picker-option
                    value=${t.value}
                    label=${t.label}
                    ?selected=${t.label==="Amsterdam"}
                    @clabs-style-picker-option-select=${n=>U(n)}>
                    ${y({...t.pictogram,attrs:{...t.pictogram.attrs,width:"3rem",height:"3rem","aria-label":t.label}})}
                  </clabs-style-picker-option>
                `)}
            </clabs-style-picker-section>
          </clabs-style-picker>
          <cds-icon-button kind=${i.GHOST}>
            ${o(_,{slot:"icon"})}
            <span slot="tooltip-content">Delete</span>
          </cds-icon-button>
          <cds-icon-button kind=${i.GHOST}>
            ${o(O,{slot:"icon"})}
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
    `};var h,u,k;c.parameters={...c.parameters,docs:{...(h=c.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(k=(u=c.parameters)==null?void 0:u.docs)==null?void 0:k.source}}};var S,T,v;r.parameters={...r.parameters,docs:{...(S=r.parameters)==null?void 0:S.docs,source:{originalSource:`{
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
}`,...(v=(T=r.parameters)==null?void 0:T.docs)==null?void 0:v.source}}};const Y=["ColorAndIcon","ColorAndPictogram"],X=Object.freeze(Object.defineProperty({__proto__:null,ColorAndIcon:c,ColorAndPictogram:r,__namedExportsOrder:Y,default:K},Symbol.toStringTag,{value:"Module"}));export{X as S};

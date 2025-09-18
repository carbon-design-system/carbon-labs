import{x as a,i as D,B as H}from"./iframe-CggIXgoC.js";import{a as K,S as u,B as l,i as o,c as w,b as g,p as M,r as m,f as y,_ as h,d as $,e as k}from"./_story.defs-Bv1FwXjF.js";import{s as R}from"./settings-BQP9c3yA.js";/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const{stablePrefix:U,prefix:A}=R,j={title:"Components/Style Picker/Single",component:"clabs-style-picker",parameters:{docs:{description:{component:"More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction"}}}},S=D`
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
`,T=()=>{const e=document.querySelector(`${U}-style-picker`),n=document.querySelector("#trigger");e==null||e.toggleAttribute("open"),n.setAttribute("aria-expanded",!!(e!=null&&e.hasAttribute("open")))},v=()=>{document.querySelector("#trigger").setAttribute("aria-expanded","false")},F=e=>{const n=e.detail.value,t=document.querySelector(`${A}-tile`);t.style.borderColor=`${n}`},q=e=>{const n=e.detail.value,t=document.getElementById("inline-tile-icon"),s=g.find(d=>d.value===n).renderIcon,i=document.createElement("div");H(s,i),t.innerHTML="",t.appendChild(i.firstElementChild)},Y=e=>{var C;const n=e.detail.value,t=M.flatMap(b=>b.items),s=(C=t==null?void 0:t.find(b=>b.value===n))==null?void 0:C.pictogram,i=document.getElementById("inline-tile-pictogram"),d=m({...s,attrs:{...s.attrs,"aria-label":n}}),f=document.createElement("div");H(d,f),i.innerHTML="",i.appendChild(f.firstElementChild)},L={open:{control:"radio",description:"true if the modal is open"},heading:{control:"text",description:"style picker heading."},align:{control:"select",options:[...K],description:"Specify how the popover should align with the trigger element"},kind:{description:"There are three different variants `'single' | 'flat' | 'disclosed'` ",control:"disabled"},enableSearch:{control:"boolean",description:"Enable search option"},searchCloseButtonLabel:{control:"text"},emptyStateTitle:{control:"text"},emptyStateSubtitle:{control:"text"},searchInputPlaceholder:{control:"text"},searchLabel:{control:"text"}},r={args:{open:!0,heading:"Choose color",align:u.LEFT_TOP,enableSearch:!0,searchCloseButtonLabel:"Clear search input",emptyStateTitle:"No results found",emptyStateSubtitle:"Try a different search",searchLabel:"Search"},argTypes:L,render:e=>a`
      <style>
        ${S}
      </style>
      <div class="style-picker-story-container">
        <cds-layer class="toolbar-layer">
          <clabs-style-picker
            id="style-picker"
            align=${e.align}
            ?open=${e.open}
            heading=${e.heading}
            ?enable-search=${e.enableSearch}
            search-close-button-label=${e.searchCloseButtonLabel}
            empty-state-title=${e.emptyStateTitle}
            empty-state-subtitle=${e.emptyStateSubtitle}
            search-label=${e.searchLabel}
            @clabs-style-picker-close=${v}>
            <cds-icon-button
              id="trigger"
              slot="trigger"
              kind=${l.GHOST}
              @click=${T}
              aria-expanded="${e.open}"
              aria-controls="style-picker">
              ${o(h,{slot:"icon"})}
              <span slot="tooltip-content">Color palette</span>
            </cds-icon-button>
            <clabs-style-picker-section heading="Colors">
              ${w.map(n=>a`<clabs-style-picker-group heading=${n.label}>
                    ${n.items.map(t=>a`
                        <clabs-style-picker-option
                          value=${t.color}
                          label=${t.label}
                          ?selected=${t.label==="Blue 60"}
                          @clabs-style-picker-option-select=${s=>F(s)}>
                          <clabs-style-picker-color
                            color=${t.color}
                            label=${t.label}></clabs-style-picker-color>
                        </clabs-style-picker-option>
                      `)}
                  </clabs-style-picker-group> `)}
            </clabs-style-picker-section>
          </clabs-style-picker>
          <cds-icon-button kind=${l.GHOST}>
            ${o($,{slot:"icon"})}
            <span slot="tooltip-content">Delete</span>
          </cds-icon-button>
          <cds-icon-button kind=${l.GHOST}>
            ${o(k,{slot:"icon"})}
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
    `},c={args:{heading:"Choose icon",open:!0,align:u.LEFT_TOP},argTypes:L,render:e=>a`
      <style>
        ${S}
      </style>
      <div class="style-picker-story-container">
        <cds-layer class="toolbar-layer">
          <clabs-style-picker
            id="style-picker"
            align=${e.align}
            ?open=${e.open}
            heading=${e.heading}
            @clabs-style-picker-close=${v}>
            <cds-icon-button
              id="trigger"
              slot="trigger"
              kind=${l.GHOST}
              @click=${T}
              aria-expanded="${e.open}"
              aria-controls="style-picker">
              ${o(h,{slot:"icon"})}
              <span slot="tooltip-content">Icon list</span>
            </cds-icon-button>
            <clabs-style-picker-section heading="Icons">
              ${g.map(n=>a`
                    <clabs-style-picker-option
                      value=${n.value}
                      label=${n.label}
                      ?selected=${n.value==="apple"}
                      @clabs-style-picker-option-select=${t=>q(t)}>
                      <clabs-style-picker-icon>
                        ${n.renderIcon}
                      </clabs-style-picker-icon>
                    </clabs-style-picker-option>
                  `)}
            </clabs-style-picker-section>
          </clabs-style-picker>
          <cds-icon-button kind=${l.GHOST}>
            ${o($,{slot:"icon"})}
            <span slot="tooltip-content">Delete</span>
          </cds-icon-button>
          <cds-icon-button kind=${l.GHOST}>
            ${o(k,{slot:"icon"})}
            <span slot="tooltip-content">More</span>
          </cds-icon-button>
        </cds-layer>
        <div class="inline-tile-holder">
          <cds-tile class="inline-tile">
            <div class="inline-tile-header">
              <span id="inline-tile-icon">${g[0].renderIcon}</span>
              <h6>Primary text</h6>
            </div>
            <br />
            <small>Secondary text or description</small>
            <br /><br />
            <cds-link href="#">Link</cds-link>
          </cds-tile>
        </div>
      </div>
    `},p={args:{heading:"Choose pictogram",open:!0,align:u.LEFT_TOP,enableSearch:!0,searchCloseButtonLabel:"Clear search input",emptyStateTitle:"No results found",emptyStateSubtitle:"Try a different search",searchLabel:"Search"},argTypes:L,render:e=>a`
      <style>
        ${S}
      </style>
      <div class="style-picker-story-container">
        <cds-layer class="toolbar-layer">
          <clabs-style-picker
            id="style-picker"
            align=${e.align}
            ?open=${e.open}
            heading=${e.heading}
            ?enable-search=${e.enableSearch}
            search-close-button-label=${e.searchCloseButtonLabel}
            empty-state-title=${e.emptyStateTitle}
            empty-state-subtitle=${e.emptyStateSubtitle}
            search-label=${e.searchLabel}
            @clabs-style-picker-close=${v}>
            <cds-icon-button
              id="trigger"
              slot="trigger"
              kind=${l.GHOST}
              @click=${T}
              aria-expanded="${e.open}"
              aria-controls="style-picker">
              ${o(h,{slot:"icon"})}
              <span slot="tooltip-content">Pictogram list</span>
            </cds-icon-button>
            <clabs-style-picker-section size="lg" heading="Pictograms">
              ${M.map(n=>a`<clabs-style-picker-group heading=${n.label}>
                    ${n.items.map(t=>a`
                        <clabs-style-picker-option
                          value=${t.value}
                          label=${t.label}
                          ?selected=${t.label==="Bangalore"}
                          @clabs-style-picker-option-select=${s=>Y(s)}>
                          ${m({...t.pictogram,attrs:{...t.pictogram.attrs,width:"3rem",height:"3rem","aria-label":t.label}})}
                        </clabs-style-picker-option>
                      `)}
                  </clabs-style-picker-group> `)}
            </clabs-style-picker-section>
          </clabs-style-picker>
          <cds-icon-button kind=${l.GHOST}>
            ${o($,{slot:"icon"})}
            <span slot="tooltip-content">Delete</span>
          </cds-icon-button>
          <cds-icon-button kind=${l.GHOST}>
            ${o(k,{slot:"icon"})}
            <span slot="tooltip-content">More</span>
          </cds-icon-button>
        </cds-layer>
        <div class="inline-tile-holder">
          <cds-tile class="inline-tile">
            <div id="inline-tile-pictogram">
              ${m({...y,attrs:{...y.attrs,"aria-label":y.name}})}
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
    `};var O,x,_;r.parameters={...r.parameters,docs:{...(O=r.parameters)==null?void 0:O.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: 'Choose color',
    align: STYLE_PICKER_ALIGNMENT.LEFT_TOP,
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
            <h6>Primary text</h6>
            <br />
            <small>Secondary text or description</small>
            <br /><br />
            <cds-link href="#">Link</cds-link>
          </cds-tile>
        </div>
      </div>
    \`
}`,...(_=(x=r.parameters)==null?void 0:x.docs)==null?void 0:_.source}}};var B,I,P;c.parameters={...c.parameters,docs:{...(B=c.parameters)==null?void 0:B.docs,source:{originalSource:`{
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
            id="style-picker"
            align=\${args.align}
            ?open=\${args.open}
            heading=\${args.heading}
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
              <span slot="tooltip-content">Icon list</span>
            </cds-icon-button>
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
}`,...(P=(I=c.parameters)==null?void 0:I.docs)==null?void 0:P.source}}};var N,E,G;p.parameters={...p.parameters,docs:{...(N=p.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    heading: 'Choose pictogram',
    open: true,
    align: STYLE_PICKER_ALIGNMENT.LEFT_TOP,
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
            <clabs-style-picker-section size="lg" heading="Pictograms">
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
}`,...(G=(E=p.parameters)==null?void 0:E.docs)==null?void 0:G.source}}};const z=["Color","Icon","Pictogram"],W=Object.freeze(Object.defineProperty({__proto__:null,Color:r,Icon:c,Pictogram:p,__namedExportsOrder:z,default:j},Symbol.toStringTag,{value:"Module"}));export{W as S};

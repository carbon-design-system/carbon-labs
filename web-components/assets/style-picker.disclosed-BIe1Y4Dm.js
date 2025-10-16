import{j as e,M as o,a as i,A as r}from"./blocks-BhmByKPd.js";import{useMDXComponents as l}from"./index--7pISRLl.js";import{c,a}from"./storybook-cdn-BiPTSTB7.js";import{S as p}from"./style-picker.disclosed.stories-DJPoqpoR.js";import{p as m}from"./package-Cbv6Lrm5.js";import"./preload-helper-C1FmrZbK.js";import"./iframe-DYOT3NGs.js";import"./_story.defs-Big2TZdz.js";import"./class-map-BLYzV9ew.js";import"./directive-CJw_OlP2.js";import"./property-BnzuvLpk.js";import"./carbon-element-D4BpjLHq.js";import"./link-rUj7L-W0.js";import"./if-defined-5Jl50gpC.js";import"./query-BApjzB0v.js";import"./focus-ahYa8aft.js";import"./shared-enums-WsGAW9C4.js";import"./16-DmBlogaH.js";import"./icon-loader-D-aXymW-.js";import"./index-eRY6EVvf.js";import"./unsafe-html-CoS3np-O.js";import"./16-Cp4I51YB.js";import"./host-listener-C4Ji6v3a.js";import"./16-0nG14jWc.js";import"./text-input-BtROLQgt.js";import"./16-DeKHrdu0.js";import"./16-Jp-fYhKo.js";import"./collection-helpers-Cdc5z1rB.js";import"./settings-BQP9c3yA.js";import"./consume-B3TInGg-.js";import"./search-DP-wiHlT.js";import"./16-B4-6OwK9.js";import"./16-nJySvwbz.js";import"./operational-tag-C3B9PZPQ.js";import"./definition-tooltip-BXJVx8EO.js";import"./state-C3IUL8sz.js";import"./floating-ui.dom-CsHdpHNg.js";import"./v4-CtRu48qb.js";import"./16-CY-Gc_tI.js";import"./icon-button-CrmJgVve.js";import"./button-D9--YStz.js";import"./button-skeleton-B3DHf9O4.js";function s(t){const n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",img:"img",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...l(),...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(o,{of:p}),`
`,e.jsx(n.h1,{id:"style-picker",children:"Style Picker"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Initiative owner(s):"})," Carbon for IBM Products"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Status:"})," Draft"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Target library:"})," Carbon for IBM Products"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Target library maintainer(s) / PR Reviewer(s):"})," N/A"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Support channel:"})," ",e.jsx(n.code,{children:"#carbon-labs"})]}),`
`]}),`
`,e.jsxs(n.blockquote,{children:[`
`,e.jsxs(n.p,{children:[`💡 Check our
`,e.jsx(n.a,{href:"https://stackblitz.com/github/carbon-design-system/carbon-labs/tree/main/examples/web-components/style-picker",rel:"nofollow",children:"Stackblitz"}),`
example implementation.`]}),`
`]}),`
`,e.jsx(n.p,{children:e.jsx(n.a,{href:"https://stackblitz.com/github/carbon-design-system/carbon-labs/tree/main/examples/web-components/style-picker",rel:"nofollow",children:e.jsx(n.img,{src:"https://developer.stackblitz.com/img/open_in_stackblitz.svg",alt:"Edit carbon-labs"})})}),`
`,e.jsx(n.h2,{id:"overview",children:"Overview"}),`
`,e.jsx(n.p,{children:`The style picker allows users to customize icons, colors, or shapes in their UI,
based on their preferences or requirements.`}),`
`,e.jsx(n.h2,{id:"getting-started",children:"Getting started"}),`
`,e.jsx(n.p,{children:"Here's a quick example to get you started."}),`
`,e.jsx(n.h3,{id:"js-via-import",children:"JS (via import)"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-javascript",children:`import '@carbon-labs/wc-style-picker/es/index.js';
`})}),`
`,e.jsx(n.h3,{id:"styles",children:"Styles"}),`
`,e.jsxs(n.p,{children:["You'll also need to import the theming tokens from ",e.jsx(n.code,{children:"@carbon/styles"}),` either from
npm or from our CDN helpers. Checkout our Stackblitz example above to see how
that is implemented.`]}),`
`,e.jsx(i,{children:`${c({components:["style-picker"]},m)}`}),`
`,e.jsx(i,{children:`${a()}`}),`
`,e.jsx(n.h3,{id:"html",children:"HTML"}),`
`,e.jsx(n.h4,{id:"disclosed-variant-with-color-and-icon-options",children:"Disclosed variant with color and icon options"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-html",children:`<clabs-style-picker
  align="right"
  ?open=\${true}
  heading="Choose color and icon"
  kind="disclosed">
  <cds-icon-button
    slot="trigger"
    kind=\${BUTTON_KIND.GHOST}
    @click=\${toggleButton}>
    \${ColorPalette16({ slot: "icon" })}
    <span slot="tooltip-content">Color palette</span>
  </cds-icon-button>
  <clabs-style-picker-sections>
    <clabs-style-picker-section heading="Icons">
      \${icons.map(
        (item) =>
          html\`
            <clabs-style-picker-option
              value=\${item.value}
              label=\${item.label}
              ?selected=\${item.value === 'apple'}
              @clabs-style-picker-option-select=\${(ev) =>
                changeIcon(ev)}>
              <clabs-style-picker-icon>
                \${item.renderIcon()}
              </clabs-style-picker-icon>
            </clabs-style-picker-option>
          \`
      )}
    </clabs-style-picker-section>
    <clabs-style-picker-section heading="Colors">
      \${colors.map(
        (group) =>
          html\`<clabs-style-picker-group heading=\${group.label}>
            \${group.items.map(
              (item) => html\`
                <clabs-style-picker-option
                  value=\${item.color}
                  label=\${item.label}
                  ?selected=\${item.label === 'Blue 60'}
                  @clabs-style-picker-option-select=\${(ev) =>
                    changeColor(ev)}>
                  <clabs-style-picker-color
                    color=\${item.color}
                    label=\${item.label}></clabs-style-picker-color>
                </clabs-style-picker-option>
              \`
            )}
          </clabs-style-picker-group> \`
      )}
    </clabs-style-picker-section>
  </clabs-style-picker-sections>
</clabs-style-picker>
`})}),`
`,e.jsx(n.h4,{id:"disclosed-variant-with-color-and-pictogram-options",children:"Disclosed variant with color and pictogram options"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-html",children:`<clabs-style-picker
  align="right"
  ?open=\${false}
  heading="Choose color and pictogram"
  kind="disclosed"
  >
  <cds-icon-button
    slot="trigger"
    kind="ghost"
    @click=\${toggleButton}>
    \${ColorPalette16({ slot: 'icon' })}
    <span slot="tooltip-content">Pictogram list</span>
  </cds-icon-button>
  <clabs-style-picker-sections>
    <clabs-style-picker-section heading="Icons">
      \${icons.map(
        (item) =>
          html\`
            <clabs-style-picker-option
              value=\${item.value}
              label=\${item.label}
              ?selected=\${item.value === 'apple'}
              @clabs-style-picker-option-select=\${(ev) =>
                changeIcon(ev)}>
              <clabs-style-picker-icon>
                \${item.renderIcon()}
              </clabs-style-picker-icon>
            </clabs-style-picker-option>
          \`
      )}
    </clabs-style-picker-section>
    <clabs-style-picker-section heading="Colors">
      \${colors.map(
        (group) =>
          html\`<clabs-style-picker-group heading=\${group.label}>
            \${group.items.map(
              (item) => html\`
                <clabs-style-picker-option
                  value=\${item.color}
                  label=\${item.label}
                  ?selected=\${item.label === 'Blue 60'}
                  @clabs-style-picker-option-select=\${(ev) =>
                    changeColor(ev)}>
                  <clabs-style-picker-color
                    color=\${item.color}
                    label=\${item.label}></clabs-style-picker-color>
                </clabs-style-picker-option>
              \`
            )}
          </clabs-style-picker-group> \`
      )}
    </clabs-style-picker-section>
    <clabs-style-picker-section heading="Pictograms" size="lg">
      \${pictograms.map(
        (group) =>
          html\`<clabs-style-picker-group heading=\${group.label}>
            \${group.items.map(
              (item) => html\`
                <clabs-style-picker-option
                  value=\${item.value}
                  label=\${item.label}
                  ?selected=\${item.label === 'Amsterdam'}
                  @clabs-style-picker-option-select=\${(ev) =>
                    changePictogram(ev, true)}>
                  \${renderCarbonPictogram({
                    ...item.pictogram,
                    attrs: {
                      ...item.pictogram.attrs,
                      width: '3rem',
                      height: '3rem',
                      'aria-label': item.label,
                    },
                  })}
                </clabs-style-picker-option>
              \`
            )}
          </clabs-style-picker-group> \`
      )}
    </clabs-style-picker-section>
  </clabs-style-picker-sections>
</clabs-style-picker>
`})}),`
`,e.jsx(n.h3,{id:"clabs-style-picker-attributes-and-properties",children:"<clabs-style-picker> attributes and properties"}),`
`,e.jsx(r,{of:"clabs-style-picker"})]})}function ee(t={}){const{wrapper:n}={...l(),...t.components};return n?e.jsx(n,{...t,children:e.jsx(s,{...t})}):s(t)}export{ee as default};

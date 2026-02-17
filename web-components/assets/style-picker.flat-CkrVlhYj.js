import{j as e,M as r,a as i,A as s}from"./blocks-CnAavXNN.js";import{useMDXComponents as l}from"./index-DLBkLKgW.js";import{c,a}from"./storybook-cdn-BiPTSTB7.js";import{S as p}from"./style-picker.flat.stories-CYxAvYZW.js";import{p as m}from"./package-72vjxQli.js";import"./preload-helper-C1FmrZbK.js";import"./iframe-CklRD_a7.js";import"./_story.defs-mAiKZPIa.js";import"./class-map-DZhVDNJW.js";import"./directive-CJw_OlP2.js";import"./property-YYZQ7-GG.js";import"./carbon-element-DvT6Hso_.js";import"./link-hOtgFSX0.js";import"./if-defined-D0SyScEO.js";import"./query-BApjzB0v.js";import"./focus-CH_-ZGzI.js";import"./shared-enums-WsGAW9C4.js";import"./16-CIkCnGjK.js";import"./icon-loader-BnOa4aZQ.js";import"./index-CEKjj0vN.js";import"./unsafe-html-DgbLaX-s.js";import"./16-D0aIqdwb.js";import"./host-listener-C4Ji6v3a.js";import"./16-0nG14jWc.js";import"./text-input-5cLigjP5.js";import"./16-DeKHrdu0.js";import"./16-Cj2zF8KO.js";import"./collection-helpers-Cdc5z1rB.js";import"./settings-BQP9c3yA.js";import"./consume-B3TInGg-.js";import"./search-bYV2wOcM.js";import"./16-B4-6OwK9.js";import"./16-D5maUdCH.js";import"./operational-tag-CjN_ErwZ.js";import"./definition-tooltip-DhJDUBoN.js";import"./state-DgWAjJv5.js";import"./floating-ui.dom-DgLPPlcg.js";import"./16-DSflTaDq.js";import"./v4-CtRu48qb.js";import"./16-CY-Gc_tI.js";import"./icon-button-wK-Ha-DP.js";import"./button-BFHOK1Jb.js";import"./button-skeleton-VQRUfe8G.js";function o(n){const t={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",img:"img",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...l(),...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(r,{of:p}),`
`,e.jsx(t.h1,{id:"style-picker",children:"Style Picker"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Initiative owner(s):"})," Carbon for IBM Products"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Status:"})," Draft"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Target library:"})," Carbon for IBM Products"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Target library maintainer(s) / PR Reviewer(s):"})," N/A"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Support channel:"})," ",e.jsx(t.code,{children:"#carbon-labs"})]}),`
`]}),`
`,e.jsxs(t.blockquote,{children:[`
`,e.jsxs(t.p,{children:[`💡 Check our
`,e.jsx(t.a,{href:"https://stackblitz.com/github/carbon-design-system/carbon-labs/tree/main/examples/web-components/style-picker",rel:"nofollow",children:"Stackblitz"}),`
example implementation.`]}),`
`]}),`
`,e.jsx(t.p,{children:e.jsx(t.a,{href:"https://stackblitz.com/github/carbon-design-system/carbon-labs/tree/main/examples/web-components/style-picker",rel:"nofollow",children:e.jsx(t.img,{src:"https://developer.stackblitz.com/img/open_in_stackblitz.svg",alt:"Edit carbon-labs"})})}),`
`,e.jsx(t.h2,{id:"overview",children:"Overview"}),`
`,e.jsx(t.p,{children:`The style picker allows users to customize icons, colors, or shapes in their UI,
based on their preferences or requirements.`}),`
`,e.jsx(t.h2,{id:"getting-started",children:"Getting started"}),`
`,e.jsx(t.p,{children:"Here's a quick example to get you started."}),`
`,e.jsx(t.h3,{id:"js-via-import",children:"JS (via import)"}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-javascript",children:`import '@carbon-labs/wc-style-picker/es/index.js';
`})}),`
`,e.jsx(t.h3,{id:"styles",children:"Styles"}),`
`,e.jsxs(t.p,{children:["You'll also need to import the theming tokens from ",e.jsx(t.code,{children:"@carbon/styles"}),` either from
npm or from our CDN helpers. Checkout our Stackblitz example above to see how
that is implemented.`]}),`
`,e.jsx(i,{children:`${c({components:["style-picker"]},m)}`}),`
`,e.jsx(i,{children:`${a()}`}),`
`,e.jsx(t.h3,{id:"html",children:"HTML"}),`
`,e.jsx(t.h4,{id:"flat-variant-with-color-and-icon-options",children:"Flat variant with color and icon options"}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-html",children:`  <clabs-style-picker
    align="right"
    ?open=\${true}
    heading="Choose color and pictogram"
    kind="flat">
    <cds-icon-button
      slot="trigger"
      kind="ghost"
      @click=\${toggleButton}>
      \${ColorPalette16({ slot: 'icon' })}
      <span slot="tooltip-content">Pictogram list</span>
    </cds-icon-button>
    <clabs-style-picker-section heading="Colors">
      \${colors[0].items.map(
        (item) => html\`
          <clabs-style-picker-option
            value=\${item.color}
            label=\${item.label}
            ?selected=\${item.label === 'Yellow 30'}
            @clabs-style-picker-option-select=\${(ev) =>
              changeColor(ev)}>
            <clabs-style-picker-color
              color=\${item.color}
              label=\${item.label}></clabs-style-picker-color>
          </clabs-style-picker-option>
        \`
      )}
    </clabs-style-picker-section>
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
  </clabs-style-picker>
`})}),`
`,e.jsx(t.h4,{id:"flat-variant-with-color-and-pictogram-options",children:"Flat variant with color and pictogram options"}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-html",children:`  <clabs-style-picker
    .align="right"
    ?open=\${true}
    heading="Choose color and pictogram"
    kind="flat">
    <cds-icon-button
      slot="trigger"
      kind="ghost"
      @click=\${toggleButton}>
      \${ColorPalette16({ slot: 'icon' })}
      <span slot="tooltip-content">Pictogram list</span>
    </cds-icon-button>
    <clabs-style-picker-section heading="Colors">
      \${colors[0].items.map(
        (item) => html\`
          <clabs-style-picker-option
            value=\${item.color}
            label=\${item.label}
            ?selected=\${item.label === 'Yellow 30'}
            @clabs-style-picker-option-select=\${(ev) =>
              changeColor(ev)}>
            <clabs-style-picker-color
              color=\${item.color}
              label=\${item.label}></clabs-style-picker-color>
          </clabs-style-picker-option>
        \`
      )}
    </clabs-style-picker-section>
    <clabs-style-picker-section heading="Pictograms" size="lg">
      \${pictograms[0].items.map(
        (item) => html\`
          <clabs-style-picker-option
            value=\${item.value}
            label=\${item.label}
            ?selected=\${item.label === 'Amsterdam'}
            @clabs-style-picker-option-select=\${(ev) =>
              changePictogram(ev)}>
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
    </clabs-style-picker-section>
  </clabs-style-picker>
`})}),`
`,e.jsx(t.h3,{id:"clabs-style-picker-attributes-and-properties",children:"<clabs-style-picker> attributes and properties"}),`
`,e.jsx(s,{of:"clabs-style-picker"})]})}function te(n={}){const{wrapper:t}={...l(),...n.components};return t?e.jsx(t,{...n,children:e.jsx(o,{...n})}):o(n)}export{te as default};

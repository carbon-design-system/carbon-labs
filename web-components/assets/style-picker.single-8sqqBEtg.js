import{ae as e,af as l,ag as t,ah as r}from"./index-CTy2cGAA.js";import{useMDXComponents as i}from"./index-Ca40sVGY.js";import{c,a}from"./storybook-cdn-BiPTSTB7.js";import{S as p}from"./style-picker.single.stories-Cx9Aj1Ml.js";import{p as d}from"./package-Dd-0Pmtr.js";import"./iframe-CXEHr2-i.js";import"../sb-preview/runtime.js";import"./index-Bw5jCugi.js";import"./_commonjsHelpers-Cpj98o6Y.js";import"./index-D-8MO0q_.js";import"./index-BHYIh-Xd.js";import"./index-DrFu-skq.js";import"./lit-element-CKvUdWNz.js";import"./_story.defs-B8-PBVGf.js";import"./class-map-BqTUllwo.js";import"./directive-CF8sV3Lr.js";import"./property-DRkoNOFH.js";import"./state-BaIcuqWU.js";import"./if-defined-BxoUCaaX.js";import"./query-BApjzB0v.js";import"./floating-ui.dom-ONm3Myz8.js";function o(s){const n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",img:"img",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...i(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(l,{of:p}),`
`,e.jsx(n.h1,{id:"style-picker",children:"Style Picker"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Initiative owner(s):"})," Afsal K"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Status:"})," Draft"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Target library:"})," TBD"]}),`
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
`,e.jsx(n.p,{children:"The style picker allows users to customize icons, colors, or shapes in their UI, based on their preferences or requirements."}),`
`,e.jsx(n.h2,{id:"getting-started",children:"Getting started"}),`
`,e.jsx(n.p,{children:"Here's a quick example to get you started."}),`
`,e.jsx(n.h3,{id:"js-via-import",children:"JS (via import)"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-javascript",children:`import '@carbon-labs/wc-style-picker/es/index.js';
`})}),`
`,e.jsx(n.h3,{id:"styles",children:"Styles"}),`
`,e.jsxs(n.p,{children:["You'll also need to import the theming tokens from ",e.jsx(n.code,{children:"@carbon/styles"}),` either from
npm or from our CDN helpers. Checkout our Stackblitz example above to see how
that is implemented.`]}),`
`,e.jsx(t,{children:`${c({components:["style-picker"]},d)}`}),`
`,e.jsx(t,{children:`${a()}`}),`
`,e.jsx(n.h3,{id:"html",children:"HTML"}),`
`,e.jsx(n.h4,{id:"single-variant-with-color-module",children:"Single variant with color module"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-html",children:`<clabs-style-picker
  align="right"
  ?open=\${false}
  heading="Choose color">
  <cds-icon-button
    slot="trigger"
    kind="ghost"
    @click=\${toggleButton}>
    \${ColorPalette16({ slot: 'icon' })}
    <span slot="tooltip-content">Color palette</span>
  </cds-icon-button>
  <clabs-style-picker-modules slot="modules">
    <clabs-style-picker-color-module
      heading="Color"
      size="sm"
      .items=\${colors}
      selected-item="blue-60"
      @clabs-style-picker-module-option-change=\${(ev) =>
        changeColor(ev)}></clabs-style-picker-color-module>
  </clabs-style-picker-modules>
</clabs-style-picker>
`})}),`
`,e.jsx(n.h4,{id:"single-variant-with-icon-module",children:"Single variant with icon module"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-html",children:`<clabs-style-picker
  .align="right"
  ?open=\${false}
  heading="Choose icon">
  <cds-icon-button
    slot="trigger"
    kind="ghost"
    @click=\${toggleButton}>
    \${ColorPalette16({ slot: 'icon' })}
    <span slot="tooltip-content">Icon list</span>
  </cds-icon-button>
  <clabs-style-picker-modules slot="modules">
    <clabs-style-picker-icon-module
      heading="Icon"
      size="sm"
      .items=\${icons}
      selected-item="apple"
      @clabs-style-picker-module-option-change=\${(ev) =>
        changeIcon(ev)}></clabs-style-picker-icon-module>
  </clabs-style-picker-modules>
</clabs-style-picker>
`})}),`
`,e.jsx(n.h4,{id:"single-variant-with-pictogram-module",children:"Single variant with pictogram module"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-html",children:`<clabs-style-picker
  .align="right"
  ?open=\${false}
  heading="Choose pictogram">
  <cds-icon-button
    slot="trigger"
    kind="ghost"
    @click=\${toggleButton}>
    \${ColorPalette16({ slot: 'icon' })}
    <span slot="tooltip-content">Pictogram list</span>
  </cds-icon-button>
  <clabs-style-picker-modules slot="modules">
    <clabs-style-picker-pictogram-module
      heading="Pictogram"
      size="lg"
      .items=\${pictograms}
      selected-item="bangalore"
      @clabs-style-picker-module-option-change=\${(ev) =>
        changePictogram(ev)}></clabs-style-picker-pictogram-module>
  </clabs-style-picker-modules>
</clabs-style-picker>
`})}),`
`,e.jsx(n.h3,{id:"clabs-style-picker-attributes-and-properties",children:"<clabs-style-picker> attributes and properties"}),`
`,e.jsx(r,{of:"clabs-style-picker"})]})}function q(s={}){const{wrapper:n}={...i(),...s.components};return n?e.jsx(n,{...s,children:e.jsx(o,{...s})}):o(s)}export{q as default};

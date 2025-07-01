import{ae as e,af as l,ag as t,an as c}from"./index-CGA58GA-.js";import{useMDXComponents as i}from"./index-Ca40sVGY.js";import{c as r,a}from"./storybook-cdn-BiPTSTB7.js";import{S as p}from"./style-picker.single.stories-BHcycn79.js";import"./iframe-CatPOPZF.js";import"../sb-preview/runtime.js";import"./index-Bw5jCugi.js";import"./_commonjsHelpers-Cpj98o6Y.js";import"./index-D-8MO0q_.js";import"./index-BHYIh-Xd.js";import"./index-DrFu-skq.js";import"./lit-element-CKvUdWNz.js";import"./directive-CF8sV3Lr.js";import"./class-map-BqTUllwo.js";import"./property-DRkoNOFH.js";import"./query-BApjzB0v.js";import"./floating-ui.dom-ONm3Myz8.js";import"./state-BaIcuqWU.js";import"./if-defined-BxoUCaaX.js";const d="@carbon-labs/wc-style-picker",m="0.1.0",h={access:"public",provenance:!0},g="Carbon Labs - style-picker component",u="Apache-2.0",b={type:"git",url:"https://github.com/carbon-design-system/carbon-labs",directory:"packages/style-picker"},x={".":{default:"./src/index.js"},"./es/":"./es/"},k=["**/*.d.ts","**/*.js","**/*.js.map","custom-elements.json"],j="./src/index.d.ts",y="custom-elements.json",$={build:"gulp build --option style-picker","build:dist":"rm -rf dist && rollup --config ../../../tasks/build-dist.js","build:dist:canary":"rm -rf dist && rollup --config ../../../tasks/build-dist.js --configCanary"},f={"@babel/runtime":"^7.23.2","@carbon-labs/utilities":"0.14.0","@carbon/web-components":"^2.31.0","@lit/context":"^1.1.5"},v={name:d,version:m,publishConfig:h,description:g,license:u,repository:b,exports:x,files:k,types:j,customElements:y,scripts:$,dependencies:f};function o(n){const s={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",img:"img",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...i(),...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(l,{of:p}),`
`,e.jsx(s.h1,{id:"style-picker",children:"Style Picker"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Initiative owner(s):"})," Afsal K"]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Status:"})," Draft"]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Target library:"})," TBD"]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Target library maintainer(s) / PR Reviewer(s):"})," N/A"]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Support channel:"})," ",e.jsx(s.code,{children:"#carbon-labs"})]}),`
`]}),`
`,e.jsxs(s.blockquote,{children:[`
`,e.jsxs(s.p,{children:[`💡 Check our
`,e.jsx(s.a,{href:"https://stackblitz.com/github/carbon-design-system/carbon-labs/tree/main/examples/web-components/style-picker",rel:"nofollow",children:"Stackblitz"}),`
example implementation.`]}),`
`]}),`
`,e.jsx(s.p,{children:e.jsx(s.a,{href:"https://stackblitz.com/github/carbon-design-system/carbon-labs/tree/main/examples/web-components/style-picker",rel:"nofollow",children:e.jsx(s.img,{src:"https://developer.stackblitz.com/img/open_in_stackblitz.svg",alt:"Edit carbon-labs"})})}),`
`,e.jsx(s.h2,{id:"overview",children:"Overview"}),`
`,e.jsx(s.p,{children:"The style picker allows users to customize icons, colors, or shapes in their UI, based on their preferences or requirements."}),`
`,e.jsx(s.h2,{id:"getting-started",children:"Getting started"}),`
`,e.jsx(s.p,{children:"Here's a quick example to get you started."}),`
`,e.jsx(s.h3,{id:"js-via-import",children:"JS (via import)"}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-javascript",children:`import '@carbon-labs/wc-style-picker/es/index.js';
`})}),`
`,e.jsx(s.h3,{id:"styles",children:"Styles"}),`
`,e.jsxs(s.p,{children:["You'll also need to import the theming tokens from ",e.jsx(s.code,{children:"@carbon/styles"}),` either from
npm or from our CDN helpers. Checkout our Stackblitz example above to see how
that is implemented.`]}),`
`,e.jsx(t,{children:`${r({components:["style-picker"]},v)}`}),`
`,e.jsx(t,{children:`${a()}`}),`
`,e.jsx(s.h3,{id:"html",children:"HTML"}),`
`,e.jsx(s.h4,{id:"single-variant-with-color-module",children:"Single variant with color module"}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-html",children:`<clabs-style-picker
  .align=\${"right"}
  ?open=\${false}
  .title=\${"Choose color"}>
  <cds-icon-button
    slot="trigger"
    .kind=\${"ghost"}
    @click="\${toggleButton}">
    \${ColorPalette16({ slot: 'icon' })}
    <span slot="tooltip-content">Color palette</span>
  </cds-icon-button>
  <clabs-style-picker-modules slot="modules">
    <clabs-style-picker-color-module
      .title=\${'Color'}
      .size=\${'sm'}
      .items=\${colors}
      .selectedItem=\${'blue-60'}
      @clabs-style-picker-module-option-change=\${(ev) =>
        changeColor(ev)}></clabs-style-picker-color-module>
  </clabs-style-picker-modules>
</clabs-style-picker>
`})}),`
`,e.jsx(s.h4,{id:"single-variant-with-icon-module",children:"Single variant with icon module"}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-html",children:`<clabs-style-picker
  .align=\${"right"}
  ?open=\${false}
  .title=\${'Choose icon'}>
  <cds-icon-button
    slot="trigger"
    .kind=\${"ghost"}
    @click="\${toggleButton}">
    \${ColorPalette16({ slot: 'icon' })}
    <span slot="tooltip-content">Icon list</span>
  </cds-icon-button>
  <clabs-style-picker-modules slot="modules">
    <clabs-style-picker-icon-module
      .title=\${'Icon'}
      .size=\${'sm'}
      .items=\${icons}
      .selectedItem=\${'apple'}
      @clabs-style-picker-module-option-change=\${(ev) =>
        changeIcon(ev)}></clabs-style-picker-icon-module>
  </clabs-style-picker-modules>
</clabs-style-picker>
`})}),`
`,e.jsx(s.h4,{id:"single-variant-with-pictogram-module",children:"Single variant with pictogram module"}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-html",children:`<clabs-style-picker
  .align=\${"right"}
  ?open=\${false}
  .title=\${'Choose pictogram'}>
  <cds-icon-button
    slot="trigger"
    .kind=\${"ghost"}
    @click="\${toggleButton}">
    \${ColorPalette16({ slot: 'icon' })}
    <span slot="tooltip-content">Pictogram list</span>
  </cds-icon-button>
  <clabs-style-picker-modules slot="modules">
    <clabs-style-picker-pictogram-module
      .title=\${'Pictogram'}
      .size=\${'lg'}
      .items=\${pictograms}
      .selectedItem=\${'bangalore'}
      @clabs-style-picker-module-option-change=\${(ev) =>
        changePictogram(ev)}></clabs-style-picker-pictogram-module>
  </clabs-style-picker-modules>
</clabs-style-picker>
`})}),`
`,e.jsx(s.h3,{id:"clabs-style-picker-attributes-and-properties",children:"<clabs-style-picker> attributes and properties"}),`
`,e.jsx(c,{of:"clabs-style-picker"})]})}function H(n={}){const{wrapper:s}={...i(),...n.components};return s?e.jsx(s,{...n,children:e.jsx(o,{...n})}):o(n)}export{H as default};

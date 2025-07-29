import{ae as e,af as r,ag as o,ah as c}from"./index-DQM4goOw.js";import{useMDXComponents as i}from"./index-Ca40sVGY.js";import{c as a}from"./storybook-cdn-BiPTSTB7.js";import{E as l}from"./empty-state.stories-C63dR05D.js";import"./iframe-V65llZmq.js";import"../sb-preview/runtime.js";import"./index-Bw5jCugi.js";import"./_commonjsHelpers-Cpj98o6Y.js";import"./index-D-8MO0q_.js";import"./index-BHYIh-Xd.js";import"./index-DrFu-skq.js";import"./property-DRkoNOFH.js";import"./lit-element-CKvUdWNz.js";import"./state-BaIcuqWU.js";import"./class-map-BqTUllwo.js";import"./directive-CF8sV3Lr.js";import"./if-defined-BxoUCaaX.js";import"./query-BApjzB0v.js";import"./v4-CEA8o657.js";import"./stringify-DnirLPRY.js";const d="@carbon-labs/wc-empty-state",p="0.4.0",m={access:"public",provenance:!0},h="Carbon Labs - empty-state component",u="Apache-2.0",x={type:"git",url:"https://github.com/carbon-design-system/carbon-labs",directory:"packages/empty-state"},j="./src/index.js",b="./src/index.js",g={".":{default:"./src/index.js"},"./es/*":"./es/*","./lib/*":"./lib/*"},y=["es/","lib/"],f="./src/index.d.ts",w="custom-elements.json",k={build:"node ../../../tasks/build.js","build:dist":"rm -rf dist && rollup --config ../../../tasks/build-dist.js","build:dist:canary":"rm -rf dist && rollup --config ../../../tasks/build-dist.js --configCanary",clean:"rimraf es lib"},v={"@babel/runtime":"^7.23.2","@carbon-labs/utilities":"0.14.0","@carbon/web-components":"2.19.0",uuid:"^9.0.1"},E={name:d,version:p,publishConfig:m,description:h,license:u,repository:x,main:j,module:b,exports:g,files:y,types:f,customElements:w,scripts:k,dependencies:v};function n(s){const t={code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...i(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(r,{of:l}),`
`,e.jsx(t.h1,{id:"empty-state",children:"Empty State"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Initiative owner(s):"})," Sangeetha Babu"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Status:"})," Draft"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Target library:"})," TBD"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Target library maintainer(s) / PR Reviewer(s):"})," N/A"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Support channel:"})," ",e.jsx(t.code,{children:"#carbon-labs"})]}),`
`]}),`
`,e.jsx(t.h2,{id:"overview",children:"Overview"}),`
`,e.jsx(t.p,{children:"The EmptyState component follows the Carbon guidelines for empty states with some added specifications around illustration usage."}),`
`,e.jsx(t.h2,{id:"getting-started",children:"Getting started"}),`
`,e.jsx(t.p,{children:"Here's a quick example to get you started."}),`
`,e.jsx(t.h3,{id:"js-via-import",children:"JS (via import)"}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-javascript",children:`import '@carbon-labs/wc-empty-state/es/index.js';
`})}),`
`,e.jsx(o,{children:`${a({components:["empty-state"]},E)}`}),`
`,e.jsx(t.h3,{id:"html",children:"HTML"}),`
`,e.jsxs(t.p,{children:["The ",e.jsx(t.code,{children:"<clabs-empty-state>"})," component accepts slots for ",e.jsx(t.code,{children:"action"}),", ",e.jsx(t.code,{children:"link"})," and ",e.jsx(t.code,{children:"illustration"})," elements, and props for ",e.jsx(t.code,{children:"title"}),", ",e.jsx(t.code,{children:"subtitle"}),", ",e.jsx(t.code,{children:"size"}),", ",e.jsx(t.code,{children:"kind"}),", and ",e.jsx(t.code,{children:"illustrationTheme"}),"."]}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-html",children:`<clabs-empty-state
  title="Example EmptyState title"
  subtitle="Example subtitle"
  size="lg"
  kind="notFound"
  illustrationTheme="light">
    <cds-button kind="tertiary" size="sm" slot="action"
      >Create new</cds-button
    >
    <cds-link href="https://www.carbondesignsystem.com" slot="link">
      View documentation
    </cds-link>
</clabs-empty-state>
`})}),`
`,e.jsx(t.h3,{id:"clabs-empty-state-attributes-and-properties",children:"<clabs-empty-state> attributes and properties"}),`
`,e.jsx(c,{of:"clabs-empty-state"})]})}function P(s={}){const{wrapper:t}={...i(),...s.components};return t?e.jsx(t,{...s,children:e.jsx(n,{...s})}):n(s)}export{P as default};

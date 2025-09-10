import{j as e,M as r,a as o,A as c}from"./blocks-DIDIm-zK.js";import{useMDXComponents as i}from"./index-2EsacePg.js";import{c as l}from"./storybook-cdn-BiPTSTB7.js";import{E as a}from"./empty-state.stories-CWRN3vcm.js";import"./preload-helper-C1FmrZbK.js";import"./iframe-C-bNyBWa.js";import"./property-DJ55Xoa1.js";import"./v4-DgssEzeg.js";import"./state-b3yBmxiy.js";import"./carbon-element-DwewEaUU.js";import"./directive-CF8sV3Lr.js";import"./link-cIVgRg4O.js";import"./focus-Dsz1rwYA.js";import"./query-BApjzB0v.js";import"./button-TqhTuwdT.js";import"./host-listener-C4Ji6v3a.js";import"./button-skeleton-x9aLvjx9.js";import"./spread-DZA-8g02.js";const d="@carbon-labs/wc-empty-state",m="0.8.0",p={access:"public",provenance:!0},h="Carbon Labs - empty-state component",b="Apache-2.0",u={type:"git",url:"https://github.com/carbon-design-system/carbon-labs",directory:"packages/empty-state"},x="./src/index.js",j="./src/index.js",y={".":{default:"./src/index.js"},"./es/*":"./es/*","./lib/*":"./lib/*"},g=["es/","lib/","telemetry.yml"],f="./src/index.d.ts",w="custom-elements.json",k={build:"node ../../../tasks/build.js","build:dist":"rm -rf dist && rollup --config ../../../tasks/build-dist.js","build:dist:canary":"rm -rf dist && rollup --config ../../../tasks/build-dist.js --configCanary",clean:"rimraf es lib",postinstall:"ibmtelemetry --config=telemetry.yml","telemetry:config":"npx -y @ibm/telemetry-js-config-generator generate --id 0a1bd1db2-dbe9-49bc-9ba9-8a7debf5b76a --endpoint https://www-api.ibm.com/ibm-telemetry/v1/metrics --files ./components/**/*.(ts|tsx|js|jsx) --wc"},v={"@babel/runtime":"^7.23.2","@carbon-labs/utilities":"0.14.0","@carbon/web-components":"2.36.0","@ibm/telemetry-js":"^1.10.1",uuid:"^9.0.1"},C={name:d,version:m,publishConfig:p,description:h,license:b,repository:u,main:x,module:j,exports:y,files:g,types:f,customElements:w,scripts:k,dependencies:v};function n(s){const t={code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...i(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(r,{of:a}),`
`,e.jsx(t.h1,{id:"empty-state",children:"Empty State"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Initiative owner(s):"})," Carbon for IBM Products"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Status:"})," Draft"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Target library:"})," TBD"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Target library maintainer(s) / PR Reviewer(s):"})," N/A"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Support channel:"})," ",e.jsx(t.code,{children:"#carbon-labs"})]}),`
`]}),`
`,e.jsx(t.h2,{id:"overview",children:"Overview"}),`
`,e.jsx(t.p,{children:`The EmptyState component follows the Carbon guidelines for empty states with
some added specifications around illustration usage.`}),`
`,e.jsx(t.h2,{id:"getting-started",children:"Getting started"}),`
`,e.jsx(t.p,{children:"Here's a quick example to get you started."}),`
`,e.jsx(t.h3,{id:"js-via-import",children:"JS (via import)"}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-javascript",children:`import '@carbon-labs/wc-empty-state/es/index.js';
`})}),`
`,e.jsx(o,{children:`${l({components:["empty-state"]},C)}`}),`
`,e.jsx(t.h3,{id:"html",children:"HTML"}),`
`,e.jsxs(t.p,{children:["The ",e.jsx(t.code,{children:"<clabs-empty-state>"})," component accepts slots for ",e.jsx(t.code,{children:"action"}),", ",e.jsx(t.code,{children:"link"}),` and
`,e.jsx(t.code,{children:"illustration"})," elements, and props for ",e.jsx(t.code,{children:"title"}),", ",e.jsx(t.code,{children:"subtitle"}),", ",e.jsx(t.code,{children:"size"}),", ",e.jsx(t.code,{children:"kind"}),`, and
`,e.jsx(t.code,{children:"illustrationTheme"}),"."]}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-html",children:`<clabs-empty-state
  title="Example EmptyState title"
  subtitle="Example subtitle"
  size="lg"
  kind="notFound"
  illustrationTheme="light">
  <cds-button kind="tertiary" size="sm" slot="action">Create new</cds-button>
  <cds-link href="https://www.carbondesignsystem.com" slot="link">
    View documentation
  </cds-link>
</clabs-empty-state>
`})}),`
`,e.jsx(t.h3,{id:"clabs-empty-state-attributes-and-properties",children:"<clabs-empty-state> attributes and properties"}),`
`,e.jsx(c,{of:"clabs-empty-state"})]})}function q(s={}){const{wrapper:t}={...i(),...s.components};return t?e.jsx(t,{...s,children:e.jsx(n,{...s})}):n(s)}export{q as default};

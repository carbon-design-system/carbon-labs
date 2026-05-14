import{D as e}from"./components-CyogJj3v.js";import{n as t,o as n,s as r}from"./blocks-BP-IZAWd.js";import{n as i}from"./lib-0Neh4XdI.js";import{n as a}from"./storybook-cdn-NiLDO3l0.js";import{t as o}from"./empty-state.stories-CFjEEUoE.js";var s=e(),c={name:`@carbon-labs/wc-empty-state`,version:`0.21.0`,publishConfig:{access:`public`,provenance:!0},description:`Carbon Labs - empty-state component`,license:`Apache-2.0`,repository:{type:`git`,url:`https://github.com/carbon-design-system/carbon-labs`,directory:`packages/empty-state`},main:`./src/index.js`,module:`./src/index.js`,exports:{".":{default:`./src/index.js`},"./es/*":`./es/*`,"./lib/*":`./lib/*`},files:[`es/`,`lib/`,`telemetry.yml`],types:`./src/index.d.ts`,customElements:`custom-elements.json`,scripts:{build:`node ../../../tasks/build.js`,"build:dist":`rm -rf dist && rollup --config ../../../tasks/build-dist.js`,"build:dist:canary":`rm -rf dist && rollup --config ../../../tasks/build-dist.js --configCanary`,clean:`rimraf es lib`,postinstall:`ibmtelemetry --config=telemetry.yml`,"telemetry:config":`npx -y @ibm/telemetry-js-config-generator generate --id 0a1bd1db2-dbe9-49bc-9ba9-8a7debf5b76a --endpoint https://www-api.ibm.com/ibm-telemetry/v1/metrics --files ./components/**/*.(ts|tsx|js|jsx) --wc`},dependencies:{"@babel/runtime":`^7.23.2`,"@carbon-labs/utilities":`0.27.0`,"@carbon/web-components":`^2.41.0`,"@ibm/telemetry-js":`^1.10.2`,uuid:`^14.0.0`}};function l(e){let l={code:`code`,h1:`h1`,h2:`h2`,h3:`h3`,li:`li`,p:`p`,pre:`pre`,strong:`strong`,ul:`ul`,...i(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(r,{of:o}),`
`,(0,s.jsx)(l.h1,{id:`empty-state`,children:`Empty State`}),`
`,(0,s.jsxs)(l.ul,{children:[`
`,(0,s.jsxs)(l.li,{children:[(0,s.jsx)(l.strong,{children:`Initiative owner(s):`}),` Carbon for IBM Products`]}),`
`,(0,s.jsxs)(l.li,{children:[(0,s.jsx)(l.strong,{children:`Status:`}),` Draft`]}),`
`,(0,s.jsxs)(l.li,{children:[(0,s.jsx)(l.strong,{children:`Target library:`}),` TBD`]}),`
`,(0,s.jsxs)(l.li,{children:[(0,s.jsx)(l.strong,{children:`Target library maintainer(s) / PR Reviewer(s):`}),` N/A`]}),`
`,(0,s.jsxs)(l.li,{children:[(0,s.jsx)(l.strong,{children:`Support channel:`}),` `,(0,s.jsx)(l.code,{children:`#carbon-labs`})]}),`
`]}),`
`,(0,s.jsx)(l.h2,{id:`overview`,children:`Overview`}),`
`,(0,s.jsx)(l.p,{children:`The EmptyState component follows the Carbon guidelines for empty states with
some added specifications around illustration usage.`}),`
`,(0,s.jsx)(l.h2,{id:`getting-started`,children:`Getting started`}),`
`,(0,s.jsx)(l.p,{children:`Here's a quick example to get you started.`}),`
`,(0,s.jsx)(l.h3,{id:`js-via-import`,children:`JS (via import)`}),`
`,(0,s.jsx)(l.pre,{children:(0,s.jsx)(l.code,{className:`language-javascript`,children:`import '@carbon-labs/wc-empty-state/es/index.js';
`})}),`
`,(0,s.jsx)(n,{children:`${a({components:[`empty-state`]},c)}`}),`
`,(0,s.jsx)(l.h3,{id:`html`,children:`HTML`}),`
`,(0,s.jsxs)(l.p,{children:[`The `,(0,s.jsx)(l.code,{children:`<clabs-empty-state>`}),` component accepts slots for `,(0,s.jsx)(l.code,{children:`action`}),`, `,(0,s.jsx)(l.code,{children:`link`}),` and
`,(0,s.jsx)(l.code,{children:`illustration`}),` elements, and props for `,(0,s.jsx)(l.code,{children:`title`}),`, `,(0,s.jsx)(l.code,{children:`subtitle`}),`, `,(0,s.jsx)(l.code,{children:`size`}),`, `,(0,s.jsx)(l.code,{children:`kind`}),`, and
`,(0,s.jsx)(l.code,{children:`illustrationTheme`}),`.`]}),`
`,(0,s.jsx)(l.pre,{children:(0,s.jsx)(l.code,{className:`language-html`,children:`<clabs-empty-state
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
`,(0,s.jsx)(l.h3,{id:`clabs-empty-state-attributes-and-properties`,children:`<clabs-empty-state> attributes and properties`}),`
`,(0,s.jsx)(t,{of:`clabs-empty-state`})]})}function u(e={}){let{wrapper:t}={...i(),...e.components};return t?(0,s.jsx)(t,{...e,children:(0,s.jsx)(l,{...e})}):l(e)}export{u as default};
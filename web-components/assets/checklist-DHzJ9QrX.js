import{c as e,m as t,n,s as r}from"./blocks-C1y59p_e.js";import{n as i}from"./lib-DhBCMATc.js";import{n as a,t as o}from"./storybook-cdn-rxpev161.js";import s from"./checklist.stories-BXbak05n.js";var c=t(),l={name:`@carbon-labs/wc-checklist`,version:`0.1.0`,publishConfig:{access:`public`,provenance:!0},type:`module`,description:`Carbon Labs - Checklist web component`,labs:{status:`draft`,title:`WC Checklist`},license:`Apache-2.0`,repository:{type:`git`,url:`https://github.com/carbon-design-system/carbon-labs`,directory:`packages/web-components/src/components/checklist`},main:`./src/index.js`,module:`./src/index.js`,exports:{".":{default:`./src/index.js`},"./es/*":`./es/*`,"./lib/*":`./lib/*`},files:[`es/`,`lib/`,`telemetry.yml`],types:`./src/index.d.ts`,customElements:`custom-elements.json`,scripts:{build:`node ../../../tasks/build.js`,"build:dist":`rm -rf dist && rollup --config ../../../tasks/build-dist.js`,clean:`rimraf es lib`,postinstall:`ibmtelemetry --config=telemetry.yml`,"telemetry:config":`npx -y @ibm/telemetry-js-config-generator generate --id 5b40806f-86cd-48b4-b550-3f60defe53da --endpoint https://www-api.ibm.com/ibm-telemetry/v1/metrics --files ./components/**/*.(ts|tsx|js|jsx) --wc`},dependencies:{"@babel/runtime":`^7.23.2`,"@carbon-labs/utilities":`0.28.0`,"@carbon/web-components":`^2.41.0`,"@ibm/telemetry-js":`^1.10.2`}};function u(t){let u={a:`a`,blockquote:`blockquote`,code:`code`,h1:`h1`,h2:`h2`,h3:`h3`,img:`img`,li:`li`,p:`p`,pre:`pre`,strong:`strong`,ul:`ul`,...i(),...t.components};return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(e,{of:s}),`
`,(0,c.jsx)(u.h1,{id:`checklist`,children:`Checklist`}),`
`,(0,c.jsxs)(u.ul,{children:[`
`,(0,c.jsxs)(u.li,{children:[(0,c.jsx)(u.strong,{children:`Initiative owner(s):`}),` Carbon for IBM Products`]}),`
`,(0,c.jsxs)(u.li,{children:[(0,c.jsx)(u.strong,{children:`Status:`}),` Draft`]}),`
`,(0,c.jsxs)(u.li,{children:[(0,c.jsx)(u.strong,{children:`Target library:`}),` TBD`]}),`
`,(0,c.jsxs)(u.li,{children:[(0,c.jsx)(u.strong,{children:`Target library maintainer(s) / PR Reviewer(s):`}),` N/A`]}),`
`,(0,c.jsxs)(u.li,{children:[(0,c.jsx)(u.strong,{children:`Support channel:`}),` `,(0,c.jsx)(u.code,{children:`#carbon-labs`})]}),`
`]}),`
`,(0,c.jsxs)(u.blockquote,{children:[`
`,(0,c.jsxs)(u.p,{children:[`💡 Check our
`,(0,c.jsx)(u.a,{href:`https://stackblitz.com/github/carbon-design-system/carbon-labs/tree/main/examples/web-components/checklist`,rel:`nofollow`,children:`Stackblitz`}),`
example implementation.`]}),`
`]}),`
`,(0,c.jsx)(u.p,{children:(0,c.jsx)(u.a,{href:`https://stackblitz.com/github/carbon-design-system/carbon-labs/tree/main/examples/web-components/checklist`,rel:`nofollow`,children:(0,c.jsx)(u.img,{src:`https://developer.stackblitz.com/img/open_in_stackblitz.svg`,alt:`Edit carbon-labs`})})}),`
`,(0,c.jsx)(u.h2,{id:`overview`,children:`Overview`}),`
`,(0,c.jsx)(u.p,{children:`The Checklist tracks a user's progress much like Your Learning or WalkMe. Each
item in the list can be clickable, and each item has an icon that defines the
item's state as "not started", "in progress", "completed", "error", or
"disabled".`}),`
`,(0,c.jsx)(u.p,{children:`The component family is:`}),`
`,(0,c.jsxs)(u.ul,{children:[`
`,(0,c.jsxs)(u.li,{children:[(0,c.jsx)(u.code,{children:`<clabs-checklist>`}),` — the root container with header, body and footer`]}),`
`,(0,c.jsxs)(u.li,{children:[(0,c.jsx)(u.code,{children:`<clabs-checklist-group>`}),` — a labelled section inside the body`]}),`
`,(0,c.jsxs)(u.li,{children:[(0,c.jsx)(u.code,{children:`<clabs-checklist-item>`}),` — a single task row, optionally clickable`]}),`
`,(0,c.jsxs)(u.li,{children:[(0,c.jsx)(u.code,{children:`<clabs-checklist-icon>`}),` — the status icon (used internally by
`,(0,c.jsx)(u.code,{children:`clabs-checklist-item`}),`)`]}),`
`,(0,c.jsxs)(u.li,{children:[(0,c.jsx)(u.code,{children:`<clabs-checklist-chart>`}),` — the donut-chart progress indicator (used
internally by `,(0,c.jsx)(u.code,{children:`clabs-checklist`}),`)`]}),`
`]}),`
`,(0,c.jsx)(u.h2,{id:`getting-started`,children:`Getting started`}),`
`,(0,c.jsx)(u.h3,{id:`js-via-import`,children:`JS (via import)`}),`
`,(0,c.jsx)(u.pre,{children:(0,c.jsx)(u.code,{className:`language-javascript`,children:`import '@carbon-labs/wc-checklist/es/index.js';
`})}),`
`,(0,c.jsx)(r,{children:`${a({components:[`checklist`]},l)}`}),`
`,(0,c.jsx)(r,{children:`${o()}`}),`
`,(0,c.jsx)(u.h3,{id:`html`,children:`HTML`}),`
`,(0,c.jsx)(u.pre,{children:(0,c.jsx)(u.code,{className:`language-html`,children:`<clabs-checklist
  title="Get started checklist"
  chart-value="0.33"
  chart-label="33% complete"
  view-all-label="View all (10)"
  toggle-label="Toggle"
  toggle-aria-label="Checklist toggle"
  open>
  <clabs-checklist-group title="Section label">
    <clabs-checklist-item
      label="Task name"
      status="completed"></clabs-checklist-item>
    <clabs-checklist-item
      label="Task name"
      status="in progress"
      clickable></clabs-checklist-item>
    <clabs-checklist-item
      label="Task name"
      status="not started"></clabs-checklist-item>
  </clabs-checklist-group>
</clabs-checklist>
`})}),`
`,(0,c.jsxs)(u.h3,{id:`clabs-checklist-attributes-and-properties`,children:[(0,c.jsx)(u.code,{children:`<clabs-checklist>`}),` attributes and properties`]}),`
`,(0,c.jsx)(n,{of:`clabs-checklist`})]})}function d(e={}){let{wrapper:t}={...i(),...e.components};return t?(0,c.jsx)(t,{...e,children:(0,c.jsx)(u,{...e})}):u(e)}export{d as default};
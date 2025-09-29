import{j as t,M as r,a as o,A as c}from"./blocks-CBrB0kwG.js";import{useMDXComponents as i}from"./index-BWR8LS8K.js";import{c as l}from"./storybook-cdn-BiPTSTB7.js";import{E as a}from"./empty-state.stories-DO6HLI5F.js";import"./preload-helper-C1FmrZbK.js";import"./iframe-B_JlPG1Z.js";import"./property-DuMHIG9C.js";import"./settings-BQP9c3yA.js";import"./state-C6Kad6Cg.js";import"./class-map-6MQN3OgG.js";import"./directive-CJw_OlP2.js";import"./link-vmESYAcF.js";import"./if-defined-B3o1s8rI.js";import"./query-__j_ZMY6.js";import"./carbon-element-D4BpjLHq.js";import"./focus-ahYa8aft.js";import"./v4-CtRu48qb.js";import"./button-CfDbjhvI.js";import"./host-listener-C4Ji6v3a.js";import"./button-skeleton-D-dibi5l.js";import"./spread-Dy5-rfWO.js";const d="0.9.0",p={version:d};function s(n){const e={code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...i(),...n.components};return t.jsxs(t.Fragment,{children:[t.jsx(r,{of:a}),`
`,t.jsx(e.h1,{id:"empty-state",children:"Empty State"}),`
`,t.jsxs(e.ul,{children:[`
`,t.jsxs(e.li,{children:[t.jsx(e.strong,{children:"Initiative owner(s):"})," Carbon for IBM Products"]}),`
`,t.jsxs(e.li,{children:[t.jsx(e.strong,{children:"Status:"})," Draft"]}),`
`,t.jsxs(e.li,{children:[t.jsx(e.strong,{children:"Target library:"})," TBD"]}),`
`,t.jsxs(e.li,{children:[t.jsx(e.strong,{children:"Target library maintainer(s) / PR Reviewer(s):"})," N/A"]}),`
`,t.jsxs(e.li,{children:[t.jsx(e.strong,{children:"Support channel:"})," ",t.jsx(e.code,{children:"#carbon-labs"})]}),`
`]}),`
`,t.jsx(e.h2,{id:"overview",children:"Overview"}),`
`,t.jsx(e.p,{children:`The EmptyState component follows the Carbon guidelines for empty states with
some added specifications around illustration usage.`}),`
`,t.jsx(e.h2,{id:"getting-started",children:"Getting started"}),`
`,t.jsx(e.p,{children:"Here's a quick example to get you started."}),`
`,t.jsx(e.h3,{id:"js-via-import",children:"JS (via import)"}),`
`,t.jsx(e.pre,{children:t.jsx(e.code,{className:"language-javascript",children:`import '@carbon-labs/wc-empty-state/es/index.js';
`})}),`
`,t.jsx(o,{children:`${l({components:["empty-state"]},p)}`}),`
`,t.jsx(e.h3,{id:"html",children:"HTML"}),`
`,t.jsxs(e.p,{children:["The ",t.jsx(e.code,{children:"<clabs-empty-state>"})," component accepts slots for ",t.jsx(e.code,{children:"action"}),", ",t.jsx(e.code,{children:"link"}),` and
`,t.jsx(e.code,{children:"illustration"})," elements, and props for ",t.jsx(e.code,{children:"title"}),", ",t.jsx(e.code,{children:"subtitle"}),", ",t.jsx(e.code,{children:"size"}),", ",t.jsx(e.code,{children:"kind"}),`, and
`,t.jsx(e.code,{children:"illustrationTheme"}),"."]}),`
`,t.jsx(e.pre,{children:t.jsx(e.code,{className:"language-html",children:`<clabs-empty-state
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
`,t.jsx(e.h3,{id:"clabs-empty-state-attributes-and-properties",children:"<clabs-empty-state> attributes and properties"}),`
`,t.jsx(c,{of:"clabs-empty-state"})]})}function N(n={}){const{wrapper:e}={...i(),...n.components};return e?t.jsx(e,{...n,children:t.jsx(s,{...n})}):s(n)}export{N as default};

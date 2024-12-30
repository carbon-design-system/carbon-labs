import{ae as e,af as o,ag as i}from"./index-Bh_oI19v.js";import{useMDXComponents as s}from"./index-Ca40sVGY.js";import{c as d,a}from"./storybook-cdn-BiPTSTB7.js";import{C as l}from"./codeElement.stories-BlKm_4La.js";import{p as c}from"./package-CLji52Rd.js";import"./iframe-BuRaoO3J.js";import"../sb-preview/runtime.js";import"./index-Bw5jCugi.js";import"./_commonjsHelpers-Cpj98o6Y.js";import"./index-D-8MO0q_.js";import"./index-BHYIh-Xd.js";import"./index-DrFu-skq.js";import"./codeElement-3akBqHVC.js";import"./property-DRkoNOFH.js";import"./lit-element-CKvUdWNz.js";import"./settings-BQP9c3yA.js";import"./state-BaIcuqWU.js";import"./16-Db9IclIG.js";import"./directive-CF8sV3Lr.js";import"./carbon-element-Cjizy3rH.js";import"./tooltip-content-BR-4fu6R.js";import"./host-listener-BQQ0D0ZC.js";import"./query-BApjzB0v.js";import"./button-BQSJpxOj.js";import"./focus-Dn8ldJgF.js";import"./spread-Cnb5k-G6.js";import"./16-B03IhBLS.js";function r(t){const n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...s(),...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(o,{of:l}),`
`,e.jsx(n.h1,{id:"carbon-ai-chat-code",children:"Carbon AI Chat: Code"}),`
`,e.jsxs(n.blockquote,{children:[`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:'NOTE: Chat components that reached "preview candidate" status are in the process of graduating to a stable library! If you are starting out new or currently using the existing Carbon Labs version, we recommend going to #carbon-ai-chat to request access to the new library.'})}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:'The chat components in Carbon Labs that reached "preview candidate" status will continue to be supported here until they are fully migrated to the new location.'})}),`
`]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Initiative owner(s):"})," Owen Cornec"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Status:"})," Draft"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Target library:"})," ",e.jsx(n.code,{children:"Carbon AI Chat"})]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Target library maintainer(s) / PR Reviewer(s):"})," Ethan Winters, Damon Lundin"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Support channel:"})," ",e.jsx(n.code,{children:"#carbon-ai-chat"})]}),`
`]}),`
`,e.jsx(n.h2,{id:"table-of-contents",children:"Table of Contents"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.a,{href:"#overview",children:"Overview"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"#attributes-and-properties",children:"Attributes and Properties"})}),`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"#events",children:"Events"})}),`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"#troubleshooting",children:"Troubleshooting"})}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.a,{href:"#installation",children:"Installation"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"#js-via-import",children:"JS via import"})}),`
`]}),`
`]}),`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"#styles",children:"Styles"})}),`
`]}),`
`,e.jsx(n.h2,{id:"overview",children:"Overview"}),`
`,e.jsx("a",{id:"overview"}),`
`,e.jsxs(n.p,{children:["The Chat component is a collaboration between the ",e.jsx(n.strong,{children:`IBM Research Visual AI Lab
(VAIL)`})," and the ",e.jsx(n.strong,{children:"Carbon Design Team"}),` to provide an open-source, easily
expandable chat interface to interact with large language models. Our core
values are: open-source collaboration, universal support, ease of use and the
in-depth customization Carbon is known for.`]}),`
`,e.jsxs(n.p,{children:["The ",e.jsx(n.strong,{children:"Carbon Labs Code"})," component aims to expand upon the ",e.jsx(n.strong,{children:`Carbon
CodeSnippet`}),` component with more flexibility, dynamic line marks, colored text
and editing functions.`]}),`
`,e.jsx(n.h3,{id:"attributes-and-properties",children:"Attributes and Properties"}),`
`,e.jsx("a",{id:"attributes-and-properties"}),`
`,e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.strong,{children:"Attribute name"})}),e.jsx("td",{children:e.jsx(n.strong,{children:"Effect"})}),e.jsx("td",{children:e.jsx(n.strong,{children:"Use case"})})]})}),e.jsxs("tbody",{children:[e.jsxs("tr",{children:[e.jsx("td",{children:"editable"}),e.jsx("td",{children:"Make every line editable by users"}),e.jsx("td",{children:"When a user-input is needed to fix an object"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:"streaming"}),e.jsx("td",{children:"Rerenders component when content is streamed in"}),e.jsx("td",{children:"When streaming is enabled"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:"enable-coloring"}),e.jsx("td",{children:"When editable is invoked, remove edit button"}),e.jsx("td",{children:"Disable button to validate edit"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:"enable-language-display"}),e.jsx("td",{children:"Shows estimated language at top of component"}),e.jsx("td",{children:"When any type of code can be returned"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:"disable-auto-compacting"}),e.jsx("td",{children:"Stops line-ticks from being removed when space isn't sufficient"}),e.jsx("td",{children:"Hide ticks when compacted"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:"disable-edit-button"}),e.jsx("td",{children:"When editable is invoked, remove edit button"}),e.jsx("td",{children:"Disable button to validate edit"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:"disable-line-ticks"}),e.jsx("td",{children:"Remove line counts on the left side-bar of code"}),e.jsx("td",{children:"When showing code such as console commands"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:"disable-copy-button"}),e.jsx("td",{children:"Remove copy button from top-right corner"}),e.jsx("td",{children:"When displaying code not meant to be replicated"})]})]})]}),`
`,e.jsx(n.h3,{id:"troubleshooting",children:"Troubleshooting"}),`
`,e.jsx("a",{id:"troubleshooting"}),`
`,e.jsxs(n.p,{children:["Contact ",e.jsx(n.strong,{children:"Owen Cornec"})," on Slack or at ",e.jsx(n.strong,{children:"o.cornec@ibm.com"}),` for requests
regarding general information, installation, trouble-shooting and custom
features.`]}),`
`,e.jsx(n.h2,{id:"installation",children:"Installation"}),`
`,e.jsx("a",{id:"installation"}),`
`,e.jsx(n.p,{children:"Here's a quick example to get you started."}),`
`,e.jsx(n.h3,{id:"js-via-import",children:"JS via import"}),`
`,e.jsx("a",{id:"js-via-import"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-javascript",children:`import '@carbon-labs/ai-chat-code/es/index.js';
`})}),`
`,e.jsx(n.h3,{id:"styles",children:"Styles"}),`
`,e.jsxs(n.p,{children:["You'll also need to import the theming tokens from ",e.jsx(n.code,{children:"@carbon/styles"}),` either from
npm or from our CDN helpers. Checkout our Stackblitz example above to see how
that is implemented.`]}),`
`,e.jsx(i,{children:`${d({components:["chat"]},c)}`}),`
`,e.jsx(i,{children:`${a()}`})]})}function N(t={}){const{wrapper:n}={...s(),...t.components};return n?e.jsx(n,{...t,children:e.jsx(r,{...t})}):r(t)}export{N as default};

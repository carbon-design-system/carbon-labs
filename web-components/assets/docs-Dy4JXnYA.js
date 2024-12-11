import{ae as n,af as r,ag as i}from"./index-DsT4f3B2.js";import{useMDXComponents as o}from"./index-Ca40sVGY.js";import{c as l,a}from"./storybook-cdn-BiPTSTB7.js";import{l as c}from"./linkListElement.stories-1fV32wZ8.js";import{p as h}from"./package-sbwBIlx1.js";import"./iframe-GiDawbIz.js";import"../sb-preview/runtime.js";import"./index-Bw5jCugi.js";import"./_commonjsHelpers-Cpj98o6Y.js";import"./index-D-8MO0q_.js";import"./index-BHYIh-Xd.js";import"./index-DrFu-skq.js";import"./linkListElement-DPp1vxzO.js";import"./property-C_111YFZ.js";import"./lit-element-in3Y6axH.js";import"./settings-BQP9c3yA.js";import"./state-B7rdIQBm.js";import"./16-8RpxDDT2.js";import"./directive-Bp-AemGL.js";import"./spread-O99WNTpv.js";import"./button-BVh405nz.js";import"./carbon-element-ZG_lSGav.js";import"./focus-CQ1fMjd6.js";import"./host-listener-BQQ0D0ZC.js";import"./button-skeleton-CcPXcK4n.js";import"./link-CcXAq-Yo.js";import"./query-BApjzB0v.js";import"./16-DE6QptpG.js";import"./16-DmMcOTp3.js";function s(t){const e={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...o(),...t.components};return n.jsxs(n.Fragment,{children:[n.jsx(r,{of:c}),`
`,n.jsx(e.h1,{id:"carbon-ai-chat-link-list",children:"Carbon AI Chat: Link list"}),`
`,n.jsxs(e.blockquote,{children:[`
`,n.jsx(e.p,{children:n.jsx(e.strong,{children:'NOTE: Chat components that reached "preview candidate" status are in the process of graduating to a stable library! If you are starting out new or currently using the existing Carbon Labs version, we recommend going to #carbon-ai-chat to request access to the new library.'})}),`
`,n.jsx(e.p,{children:n.jsx(e.strong,{children:'The chat components in Carbon Labs that reached "preview candidate" status will continue to be supported here until they are fully migrated to the new location.'})}),`
`]}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Initiative owner(s):"})," Owen Cornec"]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Status:"})," Preview Candidate"]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Target library:"})," ",n.jsx(e.code,{children:"Carbon AI Chat"})]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Target library maintainer(s) / PR Reviewer(s):"})," Ethan Winters, Damon Lundin"]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Support channel:"})," ",n.jsx(e.code,{children:"#carbon-ai-chat"})]}),`
`]}),`
`,n.jsx(e.h2,{id:"table-of-contents",children:"Table of Contents"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:[n.jsx(e.a,{href:"#overview",children:"Overview"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:n.jsx(e.a,{href:"#simple-usage",children:"Simple usage"})}),`
`,n.jsx(e.li,{children:n.jsx(e.a,{href:"#troubleshooting",children:"Troubleshooting"})}),`
`]}),`
`]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.a,{href:"#installation",children:"Installation"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:n.jsx(e.a,{href:"#js-via-import",children:"JS via import"})}),`
`]}),`
`]}),`
`,n.jsx(e.li,{children:n.jsx(e.a,{href:"#styles",children:"Styles"})}),`
`]}),`
`,n.jsx(e.h2,{id:"overview",children:"Overview"}),`
`,n.jsx("a",{id:"overview"}),`
`,n.jsxs(e.p,{children:["The Chat component is a collaboration between the ",n.jsx(e.strong,{children:`IBM Research Visual AI Lab
(VAIL)`})," and the ",n.jsx(e.strong,{children:"Carbon Design Team"}),` to provide an open-source, easily
expandable chat interface to interact with large language models. Our core
values are: open-source collaboration, universal support, ease of use and the
in-depth customization Carbon is known for.`]}),`
`,n.jsx(e.h2,{id:"simple-usage",children:"Simple Usage"}),`
`,n.jsx("a",{id:"simple-usage"}),`
`,n.jsx(e.p,{children:`The linkList component receives LLM generated lists of urls and displays them,
it accepts two types of formats:`}),`
`,n.jsx(e.p,{children:n.jsx(e.strong,{children:"List of Markdown Links:"})}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-json",children:`{
  "content": "[IBM Cloud Home](https://www.ibm.com/cloud),[Cloud Solutions](https://www.ibm.com/cloud/solutions),[Cloud products](https://www.ibm.com/cloud/products),[Cloud Docs](https://cloud.ibm.com/docs)",
  "type": "link-list"
}
`})}),`
`,n.jsx(e.p,{children:"Note: markdown text must be seperated by commas"}),`
`,n.jsx(e.p,{children:n.jsx(e.strong,{children:"Plain comma seperated list of links:"})}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-json",children:`{
  "content": "https://www.ibm.com/cloud,https://www.ibm.com/cloud/solutions,https://www.ibm.com/cloud/products,https://cloud.ibm.com/docs",
  "type": "link-list"
}
`})}),`
`,n.jsx(e.p,{children:`Note: In this case, the link title will be auto-extracted from the URL, results
may vary`}),`
`,n.jsx(e.h3,{id:"troubleshooting",children:"Troubleshooting"}),`
`,n.jsx("a",{id:"troubleshooting"}),`
`,n.jsxs(e.p,{children:["Contact ",n.jsx(e.strong,{children:"Owen Cornec"})," on Slack or at ",n.jsx(e.strong,{children:"o.cornec@ibm.com"}),` for requests
regarding general information, installation, trouble-shooting and custom
features.`]}),`
`,n.jsx(e.h2,{id:"installation",children:"Installation"}),`
`,n.jsx(e.h2,{id:"installation-1",children:"Installation"}),`
`,n.jsx("a",{id:"installation"}),`
`,n.jsx(e.p,{children:"Here's a quick example to get you started."}),`
`,n.jsx(e.h3,{id:"js-via-import",children:"JS via import"}),`
`,n.jsx("a",{id:"js-via-import"}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-javascript",children:`import '@carbon-labs/ai-chat-link-list/es/index.js';
`})}),`
`,n.jsx(e.h3,{id:"styles",children:"Styles"}),`
`,n.jsxs(e.p,{children:["You'll also need to import the theming tokens from ",n.jsx(e.code,{children:"@carbon/styles"}),` either from
npm or from our CDN helpers. Checkout our Stackblitz example above to see how
that is implemented.`]}),`
`,n.jsx(i,{children:`${l({components:["chat"]},h)}`}),`
`,n.jsx(i,{children:`${a()}`})]})}function z(t={}){const{wrapper:e}={...o(),...t.components};return e?n.jsx(e,{...t,children:n.jsx(s,{...t})}):s(t)}export{z as default};

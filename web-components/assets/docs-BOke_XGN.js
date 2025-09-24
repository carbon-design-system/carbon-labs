import{j as e,M as o,a as r}from"./blocks-Dl8HQeeX.js";import{useMDXComponents as s}from"./index-C2-B9-EO.js";import{c as a,a as l}from"./storybook-cdn-BiPTSTB7.js";import{T as d}from"./textElement.stories-B2Mizl8D.js";import{p as h}from"./package-BjYCkfW7.js";import"./preload-helper-C1FmrZbK.js";import"./iframe-DlJF4vW_.js";import"./textElement-BEfWr3FD.js";import"./property-CRREONOV.js";import"./settings-D122vLMR.js";import"./state-B0_tIRD0.js";import"./unsafe-html-CZC4i8zi.js";import"./directive-CJw_OlP2.js";import"./16-ImW4fWDc.js";import"./spread-Bcc-_lrx.js";import"./operational-tag-Ce2mIVnG.js";import"./class-map-km3jP9Hl.js";import"./query-__j_ZMY6.js";import"./16-CwrGw-Q9.js";import"./carbon-element-D4BpjLHq.js";import"./focus-ahYa8aft.js";import"./host-listener-C4Ji6v3a.js";import"./definition-tooltip-Bii5yMAn.js";import"./floating-ui.dom-CsHdpHNg.js";import"./16-CDEbDecd.js";import"./button-2lrT6Dcl.js";import"./if-defined-lQInSd2J.js";import"./button-skeleton-BAsrCmee.js";import"./tableElement-D4XS4F-_.js";import"./collection-helpers-DBaUr-gq.js";import"./checkbox-skeleton-D8dv5gAZ.js";import"./text-input-DpWQLwlF.js";import"./shared-enums-BTfaHpqk.js";import"./16-CiFOwiit.js";function i(t){const n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...s(),...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(o,{of:d}),`
`,e.jsx(n.h1,{id:"carbon-ai-chat-text",children:"Carbon AI Chat: Text"}),`
`,e.jsxs(n.blockquote,{children:[`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:'NOTE: Chat components that reached "preview candidate" status are in the process of graduating to a stable library! If you are starting out new or currently using the existing Carbon Labs version, we recommend going to #carbon-ai-chat to request access to the new library.'})}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:'The chat components in Carbon Labs that reached "preview candidate" status will continue to be supported here until they are fully migrated to the new location.'})}),`
`]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Initiative owner(s):"})," Owen Cornec"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Status:"})," Preview Candidate"]}),`
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
`,e.jsxs(n.p,{children:["The ",e.jsx(n.strong,{children:"Carbon Labs Text"}),` component aims to provide a simple text element that
can accept plain text, annotated text with markdown and html.`]}),`
`,e.jsx(n.h3,{id:"attributes-and-properties",children:"Attributes and Properties"}),`
`,e.jsx("a",{id:"attributes-and-properties"}),`
`,e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.strong,{children:"Attribute name"})}),e.jsx("td",{children:e.jsx(n.strong,{children:"Type"})}),e.jsx("td",{children:e.jsx(n.strong,{children:"Effect"})}),e.jsx("td",{children:e.jsx(n.strong,{children:"Use case"})})]})}),e.jsxs("tbody",{children:[e.jsxs("tr",{children:[e.jsx("td",{children:"capitalize"}),e.jsx("td",{children:"boolean"}),e.jsx("td",{children:"Auto capitalize all text provided"}),e.jsx("td",{children:e.jsx(n.p,{children:"Make LLM responses more formal (should be avoided on user messages)"})})]}),e.jsxs("tr",{children:[e.jsx("td",{children:"align-right"}),e.jsx("td",{children:"boolean"}),e.jsx("td",{children:"Makes text element stick to right side"}),e.jsx("td",{children:"Used for user messages"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:"enable-annotations"}),e.jsx("td",{children:"boolean"}),e.jsx("td",{children:"Auto-parses markdown link text"}),e.jsx("td",{children:"When streaming or receiving raw LLM text"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:"enable-html-rendering"}),e.jsx("td",{children:"boolean"}),e.jsx("td",{children:"Parses and renders HTML strings"}),e.jsx("td",{children:"When the need arises to add simple styling"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:"enable-text-highlighting"}),e.jsx("td",{children:"boolean"}),e.jsx("td",{children:e.jsx(n.p,{children:`Removes the chevron/underline and highlights annotations with a default
color`})}),e.jsx("td",{children:"when used Text outside of a chat context"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:"text-highlight-color"}),e.jsx("td",{children:"string"}),e.jsx("td",{children:"Provide your own valid CSS Hex color for highlights"}),e.jsx("td",{children:"When the default color isn't appropriate"})]})]})]}),`
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
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-javascript",children:`import '@carbon-labs/ai-chat-text/es/index.js';
`})}),`
`,e.jsx(n.h3,{id:"styles",children:"Styles"}),`
`,e.jsxs(n.p,{children:["You'll also need to import the theming tokens from ",e.jsx(n.code,{children:"@carbon/styles"}),` either from
npm or from our CDN helpers. Checkout our Stackblitz example above to see how
that is implemented.`]}),`
`,e.jsx(r,{children:`${a({components:["chat"]},h)}`}),`
`,e.jsx(r,{children:`${l()}`})]})}function _(t={}){const{wrapper:n}={...s(),...t.components};return n?e.jsx(n,{...t,children:e.jsx(i,{...t})}):i(t)}export{_ as default};

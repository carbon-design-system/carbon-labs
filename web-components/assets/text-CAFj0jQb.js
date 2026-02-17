import{j as e,M as o,a as r}from"./blocks-CnAavXNN.js";import{useMDXComponents as s}from"./index-DLBkLKgW.js";import{c as l,a as d}from"./storybook-cdn-BiPTSTB7.js";import{T as a}from"./textElement.stories-mr7MyDUe.js";import{p as h}from"./package-DD3V0o2y.js";import"./preload-helper-C1FmrZbK.js";import"./iframe-CklRD_a7.js";import"./textElement-BL0Clo00.js";import"./property-YYZQ7-GG.js";import"./state-DgWAjJv5.js";import"./unsafe-html-DgbLaX-s.js";import"./directive-CJw_OlP2.js";import"./16-D0aIqdwb.js";import"./operational-tag-CjN_ErwZ.js";import"./class-map-DZhVDNJW.js";import"./query-BApjzB0v.js";import"./carbon-element-DvT6Hso_.js";import"./icon-loader-BnOa4aZQ.js";import"./index-CEKjj0vN.js";import"./16-D5maUdCH.js";import"./focus-CH_-ZGzI.js";import"./host-listener-C4Ji6v3a.js";import"./definition-tooltip-DhJDUBoN.js";import"./floating-ui.dom-DgLPPlcg.js";import"./16-BpKA4nzT.js";import"./button-BFHOK1Jb.js";import"./if-defined-D0SyScEO.js";import"./button-skeleton-VQRUfe8G.js";import"./settings-BQP9c3yA.js";import"./search-bYV2wOcM.js";import"./16-B4-6OwK9.js";import"./text-input-5cLigjP5.js";import"./16-DeKHrdu0.js";import"./16-Cj2zF8KO.js";import"./collection-helpers-Cdc5z1rB.js";import"./shared-enums-WsGAW9C4.js";import"./16-CQhU3uUy.js";import"./tableElement-pt0IDZok.js";import"./checkbox-skeleton-DKC3IV3G.js";import"./radio-button-skeleton-pDWkCJXo.js";function i(t){const n={a:"a",code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...s(),...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(o,{of:a}),`
`,e.jsx(n.h1,{id:"carbon-labs-text-handbook",children:"Carbon-Labs Text Handbook"}),`
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
`," ",`
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
`,e.jsx(r,{children:`${l({components:["chat"]},h)}`}),`
`,e.jsx(r,{children:`${d()}`})]})}function K(t={}){const{wrapper:n}={...s(),...t.components};return n?e.jsx(n,{...t,children:e.jsx(i,{...t})}):i(t)}export{K as default};

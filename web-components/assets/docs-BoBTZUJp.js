import{ae as e,af as d,ag as t}from"./index-Df8sVnb-.js";import{useMDXComponents as r}from"./index-Ca40sVGY.js";import{c as o,a as l}from"./storybook-cdn-BiPTSTB7.js";import{C as c}from"./codeElement.stories-cbH1qotN.js";import{p as a}from"./package-DEkCL3eS.js";import"./iframe-DLz4lDBv.js";import"../sb-preview/runtime.js";import"./index-Bw5jCugi.js";import"./_commonjsHelpers-Cpj98o6Y.js";import"./index-D-8MO0q_.js";import"./index-BHYIh-Xd.js";import"./index-DrFu-skq.js";import"./codeElement-YzfAKbJo.js";import"./property-DRkoNOFH.js";import"./lit-element-CKvUdWNz.js";import"./settings-BQP9c3yA.js";import"./state-BaIcuqWU.js";import"./16-DiV1dIgx.js";import"./directive-CF8sV3Lr.js";import"./carbon-element-Cjizy3rH.js";import"./tooltip-content-B8wyidF3.js";import"./host-listener-BQQ0D0ZC.js";import"./query-BApjzB0v.js";import"./button-BQSJpxOj.js";import"./focus-Dn8ldJgF.js";import"./spread-Cnb5k-G6.js";import"./16-B03IhBLS.js";function s(i){const n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...r(),...i.components};return e.jsxs(e.Fragment,{children:[e.jsx(d,{of:c}),`
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
`,e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.strong,{children:"Attribute name"})}),e.jsx("td",{children:e.jsx(n.strong,{children:"Effect"})}),e.jsx("td",{children:e.jsx(n.strong,{children:"Use case"})})]})}),e.jsxs("tbody",{children:[e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"editable"})}),e.jsx("td",{children:"Make every line editable by users"}),e.jsx("td",{children:"When a user-input is needed to fix an object"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"streaming"})}),e.jsx("td",{children:"Rerenders component when content is streamed in"}),e.jsx("td",{children:"When streaming is enabled"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"max-height"})}),e.jsx("td",{children:"Limits total height and scrolls if needed"}),e.jsx("td",{children:"When code is large or height is limited"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"display-line-count"})}),e.jsx("td",{children:"Shows line count at top of component"}),e.jsx("td",{children:"When code length is variable"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"tab-size"})}),e.jsx("td",{children:"Set tab spacing for new lines"}),e.jsx("td",{children:"When default spacing of 2 is insufficient"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"enable-language-display"})}),e.jsx("td",{children:"Show language at top of component"}),e.jsx("td",{children:"When generation offers multiple options"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"displayed-language"})}),e.jsx("td",{children:"Force top-level language name"}),e.jsx("td",{children:"When automatic detection isn't accurate"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"enable-estimated-language"})}),e.jsx("td",{children:"Show guessed language from coloring"}),e.jsx("td",{children:"When language is unknown"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"disable-coloring"})}),e.jsx("td",{children:"Disable auto-coloring on render"}),e.jsx("td",{children:"When unneeded"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"disable-coloring-char-threshold"})}),e.jsx("td",{children:"Max character count to auto disable coloring"}),e.jsx("td",{children:"To optimize performance with large code pieces"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"disable-coloring-line-threshold"})}),e.jsx("td",{children:"Max line count to auto disable coloring"}),e.jsx("td",{children:"To optimize performance with large code pieces"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"disable-auto-compacting"})}),e.jsx("td",{children:"Stops line-ticks from being removed when space isn't sufficient"}),e.jsx("td",{children:"Hide ticks when compacted"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"disable-edit-button"})}),e.jsx("td",{children:"When editable is invoked, remove edit button"}),e.jsx("td",{children:"Disable button to validate edit"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"disable-line-ticks"})}),e.jsx("td",{children:"Remove line counts on the left side-bar of code"}),e.jsx("td",{children:"When showing code such as console commands"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"disable-copy-button"})}),e.jsx("td",{children:"Remove copy button from top-right corner"}),e.jsx("td",{children:"When displaying code not meant to be replicated"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"customLabels"})}),e.jsx("td",{children:"Define all button labels"}),e.jsx("td",{children:"See below"})]})]})]}),`
`,e.jsx(n.h3,{id:"custom-labels-for-localization",children:"Custom Labels for localization"}),`
`,e.jsxs(n.p,{children:["Place ",e.jsx(n.code,{children:"customLabels"})," with the following object to edit all button tooltip values"]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-js",children:`{
  'code-copypaste-button': 'Copy code',
  'code-copypaste-success': 'Copied!',
  'code-estimated-warning': '(estimated)',
  'code-line-descriptor': 'lines',
  'code-editing-validation': 'Save edits',
  'code-editing-cancelled': 'Revert edits'
}
`})}),`
`,e.jsx(n.h3,{id:"clabs-chat-code-events",children:"<clabs-chat-code> events"}),`
`,e.jsx("a",{id:"events"}),`
`,e.jsxs("table",{children:[e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.strong,{children:"Event listener name"})}),e.jsx("td",{children:e.jsx(n.strong,{children:"Trigger condition"})})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"on-code-edit-change"})}),e.jsx("td",{children:"Each edit when in editing mode"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"on-code-edit-validation"})}),e.jsx("td",{children:"Editing finalized and locked"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"on-code-edit-cancellation"})}),e.jsx("td",{children:"Last set of edits was undone"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"on-coloring-auto-disabled"})}),e.jsx("td",{children:"Rendering threshold exceeded"})]})]}),`
`,e.jsx(n.h3,{id:"usage-example",children:"Usage example"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-html",children:`<clabs-code
  editable
  streaming
  max-height="246px"
  display-line-count
  tabs-size="6"
  enable-language-display
  displayed-language="python"
  disable-coloring-line-threshold="150"
  disable-copy-button
>
</clabs-code>
`})}),`
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
`,e.jsx(t,{children:`${o({components:["chat"]},a)}`}),`
`,e.jsx(t,{children:`${l()}`})]})}function N(i={}){const{wrapper:n}={...r(),...i.components};return n?e.jsx(n,{...i,children:e.jsx(s,{...i})}):s(i)}export{N as default};

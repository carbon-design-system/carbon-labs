import{j as e,M as s,a as i}from"./blocks-BkbRpgqA.js";import{useMDXComponents as o}from"./index-V_XuPlo0.js";import{c as a,a as l}from"./storybook-cdn-BiPTSTB7.js";import{p as c}from"./popupElement.stories-Dqiswo3O.js";import{p as h}from"./package-DD3V0o2y.js";import"./preload-helper-C1FmrZbK.js";import"./iframe-BDjSmw2C.js";import"./popupElement-DrpuOQ-Q.js";import"./property-DOs0YnRP.js";import"./state-B48vy36K.js";import"./unsafe-html-BUlGy8LV.js";import"./directive-CJw_OlP2.js";import"./16-D5maUdCH.js";import"./icon-loader-B5SpUp2K.js";import"./index-Dh_cxJQD.js";import"./button-gPJMjoEd.js";import"./class-map-B6ft01w8.js";import"./if-defined-C3WYs1Zr.js";import"./carbon-element-DvT6Hso_.js";import"./focus-CH_-ZGzI.js";import"./host-listener-C4Ji6v3a.js";import"./button-skeleton-DZGtsITj.js";import"./query-BApjzB0v.js";import"./16-DeKHrdu0.js";import"./text-input-DFBLsc4y.js";import"./16-Cj2zF8KO.js";import"./collection-helpers-Cdc5z1rB.js";import"./shared-enums-WsGAW9C4.js";import"./link--aW1tO4p.js";import"./icon-button-BWEDITLa.js";import"./definition-tooltip-B-lhbfPU.js";import"./floating-ui.dom-DgLPPlcg.js";import"./operational-tag-ChxLkHra.js";import"./dropdown-skeleton-BbAulPGo.js";import"./16-C2f9e6nj.js";import"./16-D0aIqdwb.js";import"./settings-BQP9c3yA.js";import"./radio-button-skeleton-DVx0jIGX.js";import"./checkbox-skeleton-CUE13Qi3.js";import"./16-hRAwM-Pz.js";function r(t){const n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...o(),...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(s,{of:c}),`
`,e.jsx(n.h1,{id:"carbon-ai-chat-popup",children:"Carbon AI Chat: Popup"}),`
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
`,e.jsxs(n.p,{children:["The ",e.jsx(n.strong,{children:"Carbon Labs popup"}),` component aims to render any JSON defintiion provided
by the parent to display an informative popup component which provides detailed
feedback about the target response/content.`]}),`
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
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-javascript",children:`import '@carbon-labs/ai-chat-popup/es/index.js';
`})}),`
`,e.jsx(n.h2,{id:"attributes-and-properties",children:"Attributes and Properties"}),`
`,e.jsx("a",{id:"attributes-and-properties"}),`
`,e.jsx(n.h3,{id:"setting-values-as-attributes",children:"Setting values as attributes"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-html",children:`<clabs-chat-popup
  prompt-title="Custom title"
  text-area-placeholder="Custom placeholder"
  popup-title="Custom title"
  tag-list="['choice A','choice B', 'choice C']"
  disclaimer="Place your own legal disclaimer here"></clabs-chat-popup>
`})}),`
`,e.jsx(n.h3,{id:"setting-values-with-a-json-definition",children:"Setting values with a JSON definition"}),`
`,e.jsxs(n.p,{children:["Place JSON defintion in Chat as ",e.jsx(n.code,{children:"feedbackDefinitions"}),` or Popup as
`,e.jsx(n.code,{children:"feedbackFormValues"}),":"]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-json",children:`{
  "thumbs-down": {
    "title": "Unsatisfactory Response",
    "tags": [
      "Inaccurate",
      "Incomplete",
      "Missing links",
      "Privacy violations",
      "Hate speech"
    ],
    "prompt": "What was unsatisfactory about this response?",
    "responsePlaceholder": "Describe issues with this response"
  },
  "thumbs-up": {
    "title": "Feedback",
    "tags": ["Accurate", "Comprehensive", "Consice", "Easy to Understand"],
    "prompt": "Why did you choose this rating?",
    "responsePlaceholder": "Add a comment"
  }
}
`})}),`
`,e.jsx(n.h3,{id:"styles",children:"Styles"}),`
`,e.jsxs(n.p,{children:["You'll also need to import the theming tokens from ",e.jsx(n.code,{children:"@carbon/styles"}),` either from
npm or from our CDN helpers. Checkout our Stackblitz example above to see how
that is implemented.`]}),`
`,e.jsx(i,{children:`${a({components:["chat"]},h)}`}),`
`,e.jsx(i,{children:`${l()}`})]})}function K(t={}){const{wrapper:n}={...o(),...t.components};return n?e.jsx(n,{...t,children:e.jsx(r,{...t})}):r(t)}export{K as default};

import{c as e,h as t,s as n}from"./blocks-BFsqx3Bw.js";import{n as r}from"./lib-04OI96ZY.js";import{n as i,t as a}from"./storybook-cdn-Dt1Yo-ue.js";import{t as o}from"./package-nJWwqaQ1.js";import{t as s}from"./popupElement.stories-U0j1rZjw.js";var c=t();function l(t){let l={a:`a`,blockquote:`blockquote`,code:`code`,h1:`h1`,h2:`h2`,h3:`h3`,li:`li`,p:`p`,pre:`pre`,strong:`strong`,ul:`ul`,...r(),...t.components};return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(e,{of:s}),`
`,(0,c.jsx)(l.h1,{id:`carbon-ai-chat-popup`,children:`Carbon AI Chat: Popup`}),`
`,(0,c.jsxs)(l.blockquote,{children:[`
`,(0,c.jsx)(l.p,{children:(0,c.jsx)(l.strong,{children:`NOTE: Chat components that reached "preview candidate" status are in the process of graduating to a stable library! If you are starting out new or currently using the existing Carbon Labs version, we recommend going to #carbon-ai-chat to request access to the new library.`})}),`
`,(0,c.jsx)(l.p,{children:(0,c.jsx)(l.strong,{children:`The chat components in Carbon Labs that reached "preview candidate" status will continue to be supported here until they are fully migrated to the new location.`})}),`
`]}),`
`,(0,c.jsxs)(l.ul,{children:[`
`,(0,c.jsxs)(l.li,{children:[(0,c.jsx)(l.strong,{children:`Initiative owner(s):`}),` Owen Cornec`]}),`
`,(0,c.jsxs)(l.li,{children:[(0,c.jsx)(l.strong,{children:`Status:`}),` Preview Candidate`]}),`
`,(0,c.jsxs)(l.li,{children:[(0,c.jsx)(l.strong,{children:`Target library:`}),` `,(0,c.jsx)(l.code,{children:`Carbon AI Chat`})]}),`
`,(0,c.jsxs)(l.li,{children:[(0,c.jsx)(l.strong,{children:`Target library maintainer(s) / PR Reviewer(s):`}),` Ethan Winters, Damon Lundin`]}),`
`,(0,c.jsxs)(l.li,{children:[(0,c.jsx)(l.strong,{children:`Support channel:`}),` `,(0,c.jsx)(l.code,{children:`#carbon-ai-chat`})]}),`
`]}),`
`,(0,c.jsx)(l.h2,{id:`table-of-contents`,children:`Table of Contents`}),`
`,(0,c.jsxs)(l.ul,{children:[`
`,(0,c.jsxs)(l.li,{children:[(0,c.jsx)(l.a,{href:`#overview`,children:`Overview`}),`
`,(0,c.jsxs)(l.ul,{children:[`
`,(0,c.jsx)(l.li,{children:(0,c.jsx)(l.a,{href:`#attributes-and-properties`,children:`Attributes and Properties`})}),`
`,(0,c.jsx)(l.li,{children:(0,c.jsx)(l.a,{href:`#events`,children:`Events`})}),`
`,(0,c.jsx)(l.li,{children:(0,c.jsx)(l.a,{href:`#troubleshooting`,children:`Troubleshooting`})}),`
`]}),`
`]}),`
`,(0,c.jsxs)(l.li,{children:[(0,c.jsx)(l.a,{href:`#installation`,children:`Installation`}),`
`,(0,c.jsxs)(l.ul,{children:[`
`,(0,c.jsx)(l.li,{children:(0,c.jsx)(l.a,{href:`#js-via-import`,children:`JS via import`})}),`
`]}),`
`]}),`
`,(0,c.jsx)(l.li,{children:(0,c.jsx)(l.a,{href:`#styles`,children:`Styles`})}),`
`]}),`
`,(0,c.jsx)(l.h2,{id:`overview`,children:`Overview`}),`
`,(0,c.jsx)(`a`,{id:`overview`}),`
`,(0,c.jsxs)(l.p,{children:[`The Chat component is a collaboration between the `,(0,c.jsx)(l.strong,{children:`IBM Research Visual AI Lab
(VAIL)`}),` and the `,(0,c.jsx)(l.strong,{children:`Carbon Design Team`}),` to provide an open-source, easily
expandable chat interface to interact with large language models. Our core
values are: open-source collaboration, universal support, ease of use and the
in-depth customization Carbon is known for.`]}),`
`,(0,c.jsxs)(l.p,{children:[`The `,(0,c.jsx)(l.strong,{children:`Carbon Labs popup`}),` component aims to render any JSON defintiion provided
by the parent to display an informative popup component which provides detailed
feedback about the target response/content.`]}),`
`,(0,c.jsx)(l.h3,{id:`troubleshooting`,children:`Troubleshooting`}),`
`,(0,c.jsx)(`a`,{id:`troubleshooting`}),`
`,(0,c.jsxs)(l.p,{children:[`Contact `,(0,c.jsx)(l.strong,{children:`Owen Cornec`}),` on Slack or at `,(0,c.jsx)(l.strong,{children:`o.cornec@ibm.com`}),` for requests
regarding general information, installation, trouble-shooting and custom
features.`]}),`
`,(0,c.jsx)(l.h2,{id:`installation`,children:`Installation`}),`
`,(0,c.jsx)(`a`,{id:`installation`}),`
`,(0,c.jsx)(l.p,{children:`Here's a quick example to get you started.`}),`
`,(0,c.jsx)(l.h3,{id:`js-via-import`,children:`JS via import`}),`
`,(0,c.jsx)(`a`,{id:`js-via-import`}),`
`,(0,c.jsx)(l.pre,{children:(0,c.jsx)(l.code,{className:`language-javascript`,children:`import '@carbon-labs/ai-chat-popup/es/index.js';
`})}),`
`,(0,c.jsx)(l.h2,{id:`attributes-and-properties`,children:`Attributes and Properties`}),`
`,(0,c.jsx)(`a`,{id:`attributes-and-properties`}),`
`,(0,c.jsx)(l.h3,{id:`setting-values-as-attributes`,children:`Setting values as attributes`}),`
`,(0,c.jsx)(l.pre,{children:(0,c.jsx)(l.code,{className:`language-html`,children:`<clabs-chat-popup
  prompt-title="Custom title"
  text-area-placeholder="Custom placeholder"
  popup-title="Custom title"
  tag-list="['choice A','choice B', 'choice C']"
  disclaimer="Place your own legal disclaimer here"></clabs-chat-popup>
`})}),`
`,(0,c.jsx)(l.h3,{id:`setting-values-with-a-json-definition`,children:`Setting values with a JSON definition`}),`
`,(0,c.jsxs)(l.p,{children:[`Place JSON defintion in Chat as `,(0,c.jsx)(l.code,{children:`feedbackDefinitions`}),` or Popup as
`,(0,c.jsx)(l.code,{children:`feedbackFormValues`}),`:`]}),`
`,(0,c.jsx)(l.pre,{children:(0,c.jsx)(l.code,{className:`language-json`,children:`{
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
`,(0,c.jsx)(l.h3,{id:`styles`,children:`Styles`}),`
`,(0,c.jsxs)(l.p,{children:[`You'll also need to import the theming tokens from `,(0,c.jsx)(l.code,{children:`@carbon/styles`}),` either from
npm or from our CDN helpers. Checkout our Stackblitz example above to see how
that is implemented.`]}),`
`,(0,c.jsx)(n,{children:`${i({components:[`chat`]},o)}`}),`
`,(0,c.jsx)(n,{children:`${a()}`})]})}function u(e={}){let{wrapper:t}={...r(),...e.components};return t?(0,c.jsx)(t,{...e,children:(0,c.jsx)(l,{...e})}):l(e)}export{u as default};
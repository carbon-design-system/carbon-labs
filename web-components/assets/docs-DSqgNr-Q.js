import{c as e,h as t,s as n}from"./blocks-DNSPUkUq.js";import{n as r}from"./lib-Ccaf7Yay.js";import{n as i,t as a}from"./storybook-cdn-Dt1Yo-ue.js";import{t as o}from"./package-Bg2n1ncX.js";import s from"./textElement.stories-Ec7FzPEL.js";var c=t();function l(t){let l={a:`a`,blockquote:`blockquote`,code:`code`,h1:`h1`,h2:`h2`,h3:`h3`,li:`li`,p:`p`,pre:`pre`,strong:`strong`,ul:`ul`,...r(),...t.components};return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(e,{of:s}),`
`,(0,c.jsx)(l.h1,{id:`carbon-ai-chat-text`,children:`Carbon AI Chat: Text`}),`
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
`,(0,c.jsxs)(l.p,{children:[`The `,(0,c.jsx)(l.strong,{children:`Carbon Labs Text`}),` component aims to provide a simple text element that
can accept plain text, annotated text with markdown and html.`]}),`
`,(0,c.jsx)(l.h3,{id:`attributes-and-properties`,children:`Attributes and Properties`}),`
`,(0,c.jsx)(`a`,{id:`attributes-and-properties`}),`
`,(0,c.jsxs)(`table`,{children:[(0,c.jsx)(`thead`,{children:(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(l.strong,{children:`Attribute name`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.strong,{children:`Type`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.strong,{children:`Effect`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.strong,{children:`Use case`})})]})}),(0,c.jsxs)(`tbody`,{children:[(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:`capitalize`}),(0,c.jsx)(`td`,{children:`boolean`}),(0,c.jsx)(`td`,{children:`Auto capitalize all text provided`}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.p,{children:`Make LLM responses more formal (should be avoided on user messages)`})})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:`align-right`}),(0,c.jsx)(`td`,{children:`boolean`}),(0,c.jsx)(`td`,{children:`Makes text element stick to right side`}),(0,c.jsx)(`td`,{children:`Used for user messages`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:`enable-annotations`}),(0,c.jsx)(`td`,{children:`boolean`}),(0,c.jsx)(`td`,{children:`Auto-parses markdown link text`}),(0,c.jsx)(`td`,{children:`When streaming or receiving raw LLM text`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:`enable-html-rendering`}),(0,c.jsx)(`td`,{children:`boolean`}),(0,c.jsx)(`td`,{children:`Parses and renders HTML strings`}),(0,c.jsx)(`td`,{children:`When the need arises to add simple styling`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:`enable-text-highlighting`}),(0,c.jsx)(`td`,{children:`boolean`}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.p,{children:`Removes the chevron/underline and highlights annotations with a default
color`})}),(0,c.jsx)(`td`,{children:`when used Text outside of a chat context`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:`text-highlight-color`}),(0,c.jsx)(`td`,{children:`string`}),(0,c.jsx)(`td`,{children:`Provide your own valid CSS Hex color for highlights`}),(0,c.jsx)(`td`,{children:`When the default color isn't appropriate`})]})]})]}),`
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
`,(0,c.jsx)(l.pre,{children:(0,c.jsx)(l.code,{className:`language-javascript`,children:`import '@carbon-labs/ai-chat-text/es/index.js';
`})}),`
`,(0,c.jsx)(l.h3,{id:`styles`,children:`Styles`}),`
`,(0,c.jsxs)(l.p,{children:[`You'll also need to import the theming tokens from `,(0,c.jsx)(l.code,{children:`@carbon/styles`}),` either from
npm or from our CDN helpers. Checkout our Stackblitz example above to see how
that is implemented.`]}),`
`,(0,c.jsx)(n,{children:`${i({components:[`chat`]},o)}`}),`
`,(0,c.jsx)(n,{children:`${a()}`})]})}function u(e={}){let{wrapper:t}={...r(),...e.components};return t?(0,c.jsx)(t,{...e,children:(0,c.jsx)(l,{...e})}):l(e)}export{u as default};
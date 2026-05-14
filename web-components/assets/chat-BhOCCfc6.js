import{D as e}from"./components-CyogJj3v.js";import{o as t,s as n}from"./blocks-BP-IZAWd.js";import{n as r}from"./lib-0Neh4XdI.js";import{n as i,t as a}from"./storybook-cdn-NiLDO3l0.js";import{t as o}from"./package-DzBoWW39.js";import{t as s}from"./chat.stories-9IA-olzX.js";var c=e();function l(e){let l={a:`a`,blockquote:`blockquote`,code:`code`,h1:`h1`,h2:`h2`,h3:`h3`,h4:`h4`,li:`li`,p:`p`,pre:`pre`,strong:`strong`,ul:`ul`,...r(),...e.components};return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(n,{of:s}),`
`,(0,c.jsx)(l.h1,{id:`carbon-ai-chat`,children:`Carbon AI Chat`}),`
`,(0,c.jsxs)(l.blockquote,{children:[`
`,(0,c.jsxs)(l.p,{children:[`⚠️ `,(0,c.jsx)(l.strong,{children:`Deprecated:`}),` This package is no longer under active development. Please
use the new
`,(0,c.jsx)(l.a,{href:`https://chat.carbondesignsystem.com/tag/latest/docs/index.html`,rel:`nofollow`,children:(0,c.jsx)(l.strong,{children:`Carbon AI Chat`})}),`
library.`]}),`
`,(0,c.jsx)(l.p,{children:`The existing Carbon Labs chat components will remain available in this
repository for reference, but all future updates and support are provided
through the new Carbon AI Chat library.`}),`
`]}),`
`,(0,c.jsxs)(l.ul,{children:[`
`,(0,c.jsxs)(l.li,{children:[(0,c.jsx)(l.strong,{children:`Initiative owner(s):`}),` Owen Cornec`]}),`
`,(0,c.jsxs)(l.li,{children:[(0,c.jsx)(l.strong,{children:`Status:`}),` 🛑 Deprecated`]}),`
`,(0,c.jsxs)(l.li,{children:[(0,c.jsx)(l.strong,{children:`Replacement library:`}),`
`,(0,c.jsx)(l.a,{href:`https://chat.carbondesignsystem.com/tag/latest/docs/index.html`,rel:`nofollow`,children:(0,c.jsx)(l.code,{children:`Carbon AI Chat`})})]}),`
`,(0,c.jsxs)(l.li,{children:[(0,c.jsx)(l.strong,{children:`Replacement library maintainer(s) / PR Reviewer(s):`}),` Ethan Winters, Damon
Lundin`]}),`
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
`,(0,c.jsxs)(l.li,{children:[(0,c.jsx)(l.a,{href:`#implementation`,children:`Implementation`}),`
`,(0,c.jsxs)(l.ul,{children:[`
`,(0,c.jsx)(l.li,{children:(0,c.jsx)(l.a,{href:`#preface`,children:`Preface`})}),`
`,(0,c.jsx)(l.li,{children:(0,c.jsx)(l.a,{href:`#react-implementation`,children:`USAGE IN REACT`})}),`
`,(0,c.jsx)(l.li,{children:(0,c.jsx)(l.a,{href:`#all-implementation`,children:`Usage in Vanilla, Svelte, Vue, Web-components`})}),`
`,(0,c.jsx)(l.li,{children:(0,c.jsx)(l.a,{href:`#render-with-any-api`,children:`Render with any API`})}),`
`,(0,c.jsx)(l.li,{children:(0,c.jsx)(l.a,{href:`#render-from-parent`,children:`Render from Parent`})}),`
`,(0,c.jsx)(l.li,{children:(0,c.jsx)(l.a,{href:`#full-customization-with-slotting`,children:`Full Customization with Slotting`})}),`
`]}),`
`]}),`
`,(0,c.jsx)(l.li,{children:(0,c.jsx)(l.a,{href:`#feedback-form`,children:`Feedback popup`})}),`
`,(0,c.jsx)(l.li,{children:(0,c.jsx)(l.a,{href:`#localization`,children:`Localization`})}),`
`,(0,c.jsx)(l.li,{children:(0,c.jsx)(l.a,{href:`#styles`,children:`Styles`})}),`
`]}),`
`,(0,c.jsx)(l.h2,{id:`overview`,children:`Overview`}),`
`,(0,c.jsx)(`a`,{id:`overview`}),`
`,(0,c.jsxs)(l.p,{children:[`The Chat component is a collaboration between the `,(0,c.jsx)(l.strong,{children:`IBM Research Visual AI Lab
(VAIL)`}),` and the `,(0,c.jsx)(l.strong,{children:`Carbon Design Team`}),` to provide an open-source, easily
expandable chat interface to interact with large language models. Our core
values are: `,(0,c.jsx)(l.strong,{children:`open-source collaboration`}),`, `,(0,c.jsx)(l.strong,{children:`universal support`}),`,
`,(0,c.jsx)(l.strong,{children:`compasability`}),` and the `,(0,c.jsx)(l.strong,{children:`in-depth customization`}),` Carbon is known for.`]}),`
`,(0,c.jsxs)(l.p,{children:[`It is part of `,(0,c.jsx)(l.strong,{children:`Carbon Labs`}),`, a test bed to let anyone experiment with novel
LLM-enabled components. We chose `,(0,c.jsx)(l.strong,{children:`LIT web-components`}),` as these are the bedrock
of the web and guarantee longevity, thus can be used instantly in `,(0,c.jsx)(l.strong,{children:`Vanilla`}),`,
`,(0,c.jsx)(l.strong,{children:`Svelte`}),` and `,(0,c.jsx)(l.strong,{children:`Vue`}),`. Meanwhile `,(0,c.jsx)(l.strong,{children:`React`}),` requires on simple step,
`,(0,c.jsx)(l.a,{href:`#react-implementation`,children:`see here`})]}),`
`,(0,c.jsxs)(l.p,{children:[`Our primary goal is to provide a space for novel and experimental
features/components to be used in and out of Chat interfaces. By fully adhering
to the latest design/safety/formatting guidelines, `,(0,c.jsx)(l.strong,{children:`Labs`}),` can accelerate and
streamline adoption across IBM to respond to the fast-moving field of AI and
Large Language Models.`]}),`
`,(0,c.jsx)(l.p,{children:`All children components (Text, Code, Charts, Carousel etc) can be imported
individually outside of the Chat context, fully resiable and composable.`}),`
`,(0,c.jsx)(l.h3,{id:`demos`,children:`Demos`}),`
`,(0,c.jsxs)(l.ul,{children:[`
`,(0,c.jsx)(l.li,{children:(0,c.jsx)(l.a,{href:`https://labs.carbondesignsystem.com/web-components/index.html?path=/story/components-chat--stream-text-playground`,rel:`nofollow`,children:`Streaming demo with all components`})}),`
`,(0,c.jsx)(l.li,{children:(0,c.jsx)(l.a,{href:`https://labs.carbondesignsystem.com/web-components/index.html?path=/story/components-chat--playground`,rel:`nofollow`,children:`Static demo with all components`})}),`
`,(0,c.jsx)(l.li,{children:(0,c.jsx)(l.a,{href:`https://labs.carbondesignsystem.com/web-components/index.html?path=/story/components-core-text--showcase`,rel:`nofollow`,children:`Text showcase`})}),`
`,(0,c.jsx)(l.li,{children:(0,c.jsx)(l.a,{href:`https://labs.carbondesignsystem.com/web-components/index.html?path=/story/components-experimental-chart--showcase`,rel:`nofollow`,children:`Charts showcase`})}),`
`,(0,c.jsx)(l.li,{children:(0,c.jsx)(l.a,{href:`https://labs.carbondesignsystem.com/web-components/index.html?path=/story/components-experimental-code--showcase`,rel:`nofollow`,children:`Code showcase`})}),`
`,(0,c.jsx)(l.li,{children:(0,c.jsx)(l.a,{href:`https://labs.carbondesignsystem.com/web-components/index.html?path=/story/components-core-carousel--showcase`,rel:`nofollow`,children:`Carousel showcase`})}),`
`]}),`
`,(0,c.jsx)(l.h3,{id:`attributes-and-properties`,children:`Attributes and Properties`}),`
`,(0,c.jsx)(`a`,{id:`attributes-and-properties`}),`
`,(0,c.jsxs)(`table`,{children:[(0,c.jsx)(`thead`,{children:(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(l.strong,{children:`Type`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.strong,{children:`Attribute name`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.strong,{children:`Usage`})})]})}),(0,c.jsxs)(`tbody`,{children:[(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:`Boolean`}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`loading`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.p,{children:`User-assigned boolean denoting when an api query has begun and returned
to 'false' when it is received or an error occured, used to display an
empty loading message`})})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:`Boolean`}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`closed`})}),(0,c.jsx)(`td`,{children:`Closed state to denote if chart is hidden`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:`Object`}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`conversation`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.p,{children:`conversation object to display messages straight from the 'message'
attribute, overrides any api_url system`})})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:`Boolean`}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`enable-launcher`})}),(0,c.jsx)(`td`,{children:`Show launcher to open chat when closing chat`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:`Boolean`}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`start-with-launcher`})}),(0,c.jsx)(`td`,{children:`Close chat by default and show launcher`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:`Boolean`}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`enable-feedback-form`})}),(0,c.jsx)(`td`,{children:`Show complex feedback popup when clicking a reaction button`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:`Boolean`}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`enable-text-feedback-form`})}),(0,c.jsx)(`td`,{children:`Show complex feedback form on individual highlighted text items`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:`Object`}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`feedbackDefinitions`})}),(0,c.jsx)(`td`,{children:(0,c.jsxs)(l.p,{children:[`Define what should be shown in feedback form, `,(0,c.jsx)(l.a,{href:`#feedback-form`,children:`see here`})]})})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:`String`}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`ai-slug-content`})}),(0,c.jsx)(`td`,{children:`HTML content to render in header AI slug`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:`Object`}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`aiSlugObject`})}),(0,c.jsx)(`td`,{children:(0,c.jsxs)(l.p,{children:[`JSON object to specify AI slug content, formatted `,(0,c.jsx)(l.a,{href:`#feedback-form`,children:`here`})]})})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:`Boolean`}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`enable-request-cancelling`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.p,{children:`When sending a query, show cancel button instead of send and interrupt
incoming response`})})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:`Object`}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`customLabels`})}),(0,c.jsx)(`td`,{children:(0,c.jsxs)(l.p,{children:[`Label list of all buttons/placeholders to localize UI, `,(0,c.jsx)(l.a,{href:`#localization`,children:`see
here`})]})})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:`Boolean`}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`stream-responses`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.p,{children:`User-assigned boolean denoting if the conversation object is
user-updated or automatically updated using the api system`})})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:`Number`}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`stream-delay`})}),(0,c.jsx)(`td`,{children:`Number value in milliseconds to throttle streaming response `})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:`String`}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`user-name`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.p,{children:`String denoting the user name, used for internal logic in the server to
differentiate bot responses and user reseponses. default: 'user' but
should be the user's real name based on IBM ID or any other data
available`})})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:`String`}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`agent-name`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.p,{children:`String denoting the bot name, default: 'external' but can be changed to
'Watson' or 'client assistant' or any other name`})})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:`String`}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`default-viewing-mode`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.p,{children:`String denoting default viewing mode, can be "container" (default),
"fullscreen" or "minimized"`})})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:`Boolean`}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`disable-header-buttons`})}),(0,c.jsx)(`td`,{children:`Disable all buttons except slug`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:`Boolean`}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`disable-header-fullscreen`})}),(0,c.jsx)(`td`,{children:`Remove header fullscreen button option`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:`Boolean`}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`disable-header-close`})}),(0,c.jsx)(`td`,{children:`Remove header closing button option`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:`Boolean`}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`disable-header-minimize`})}),(0,c.jsx)(`td`,{children:`Remove fullscreen button option`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:`Boolean`}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`disable-header-menu`})}),(0,c.jsx)(`td`,{children:`Disable header hamburger menu`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:`String`}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`prompt-notification-message`})}),(0,c.jsx)(`td`,{children:`String denoting message to append above prompt`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:`String`}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`prompt-notification-type`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.p,{children:`String denoting type of appended prompt message (error, info, warning)`})})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:`String`}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`input-field-placeholder`})}),(0,c.jsx)(`td`,{children:`Custom placeholder for input field in footer`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:`Number`}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`max-character-count`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.p,{children:`Max character counter specified by developer to prevent large queries`})})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:`String`}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`api-url`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.p,{children:`String url denoting where the message query will be sent, either BAM or
watsonx.ai or any other service`})})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:`String`}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`model`})}),(0,c.jsx)(`td`,{children:`String denoting which model to use in your backend`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:`Boolean`}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`auto-update`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.p,{children:`User-assigned boolean denoting if the conversation object is
user-updated or automatically updated using the api system`})})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:`String`}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`user-prompt`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.p,{children:`String denoting the unique behavior of the model designated by the user,
appended to the private system prompt`})})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:`Number`}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`temperature`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.p,{children:`Float varying from 0.0 to 1.0, denotes how 'creative' the model's
response will be. 0.0 (default) is the most safe and predictable while
1.0 is hightly creative but unpredictable (not advised for operations
returning code or JSON objects)`})})]})]})]}),`
`,(0,c.jsx)(l.h3,{id:`events`,children:`Events`}),`
`,(0,c.jsx)(`a`,{id:`events`}),`
`,(0,c.jsxs)(`table`,{children:[(0,c.jsx)(`thead`,{children:(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(l.strong,{children:`Event name`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.strong,{children:`Exclusive to chat mode`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.strong,{children:`Triggering logic`})})]})}),(0,c.jsxs)(`tbody`,{children:[(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:`on-chat-slot-update`}),(0,c.jsx)(`td`,{children:`Carbon slotting in use`}),(0,c.jsx)(`td`,{children:`Return child update status`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:`on-user-regeneration-request`}),(0,c.jsx)(`td`,{children:`API mode in use`}),(0,c.jsx)(`td`,{children:`Return when user requested regeneration on any bot message`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:`on-chat-close`}),(0,c.jsx)(`td`,{children:`All`}),(0,c.jsx)(`td`,{children:`Return when user clicked close in the header`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:`on-user-message-update-request`}),(0,c.jsx)(`td`,{children:`API mode in use`}),(0,c.jsx)(`td`,{children:`Return when user requested an edit on any user message`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:`on-submit`}),(0,c.jsx)(`td`,{children:`All`}),(0,c.jsx)(`td`,{children:`Return when user submits a query in the footer`})]})]})]}),`
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
`,(0,c.jsx)(l.pre,{children:(0,c.jsx)(l.code,{className:`language-javascript`,children:`import '@carbon-labs/ai-chat/es/index.js';
`})}),`
`,(0,c.jsx)(l.h2,{id:`implementation`,children:`Implementation`}),`
`,(0,c.jsx)(`a`,{id:`inplementation`}),`
`,(0,c.jsx)(l.h3,{id:`preface`,children:`Preface`}),`
`,(0,c.jsx)(`a`,{id:`preface`}),`
`,(0,c.jsx)(l.p,{children:`There are three ways to implement Chat: Add an API and directly auto-parse raw
LLM responses, ingest your own conversation object from a parent application or
specify every layer of the chat component and slot in custom components`}),`
`,(0,c.jsx)(l.h4,{id:`1-auto-rendering-with-an-api-specify-a-url-in-the-api-url-attribute-to-query-a-proxy-server`,children:`1: Auto-rendering with an API: specify a URL in the api-url attribute to query a proxy server`}),`
`,(0,c.jsxs)(l.ul,{children:[`
`,(0,c.jsxs)(l.li,{children:[`return a `,(0,c.jsx)(l.strong,{children:`reply string`}),` containing raw LLM text: auto-rendering will parse and display subcomponents`]}),`
`,(0,c.jsxs)(l.li,{children:[`return a `,(0,c.jsx)(l.strong,{children:`reply object`}),` with a message JSON: items will be rendered as-is (see format below)`]}),`
`,(0,c.jsxs)(l.li,{children:[`enable `,(0,c.jsx)(l.strong,{children:`stream-contents`}),` : token streaming will be interpreted and automatically parsed then rendered`]}),`
`]}),`
`,(0,c.jsxs)(l.h4,{id:`2-api-less-control-with-json-object-in-conversation-attribute`,children:[`2: API-less control with JSON object in `,(0,c.jsx)(l.strong,{children:`conversation`}),` attribute:`]}),`
`,(0,c.jsxs)(l.ul,{children:[`
`,(0,c.jsx)(l.li,{children:`All automatic behavior is disabled. You will be required to provide your own conversation object as well as handle all events such as users submitting/editing/regenerating messages, handling api responses outside the chat, enabling loading and handling feedback events`}),`
`,(0,c.jsxs)(l.li,{children:[`Create an array of messages with origin/timestamp/displayname, then in `,(0,c.jsx)(l.strong,{children:`elements`}),` add objects containing `,(0,c.jsx)(l.strong,{children:`type`}),` and `,(0,c.jsx)(l.strong,{children:`content`}),`: `,(0,c.jsx)(l.strong,{children:`content`}),` is a stringified object containing strings for plain text, URLs, arrays or a complex JSON objects. `,(0,c.jsx)(l.strong,{children:`type`}),` denotes the component to be rendered in the message list such as `,(0,c.jsx)(l.strong,{children:`text`}),`, `,(0,c.jsx)(l.strong,{children:`code`}),`, `,(0,c.jsx)(l.strong,{children:`chart`}),`, `,(0,c.jsx)(l.strong,{children:`image`}),`, `,(0,c.jsx)(l.strong,{children:`table`}),`, `,(0,c.jsx)(l.strong,{children:`carousel`}),` etc`]}),`
`]}),`
`,(0,c.jsx)(l.h4,{id:`3-slotting-fully-customize-the-chat-by-inserting-custom-divs-and-components`,children:`3: Slotting: fully customize the chat by inserting custom divs and components:`}),`
`,(0,c.jsxs)(l.ul,{children:[`
`,(0,c.jsx)(l.li,{children:`Place all components directly in the chat tag and import any component you wish to use with the appropriate slot name`}),`
`,(0,c.jsx)(l.li,{children:`additionally, place custom div or external iframes/components directly into the message response`}),`
`,(0,c.jsx)(l.li,{children:`like section 2, all events must be handled by the parent application`}),`
`]}),`
`,(0,c.jsx)(l.h3,{id:`usage-in-non-react-framworks`,children:`Usage in non-React framworks:`}),`
`,(0,c.jsx)(`a`,{id:`all-implementation`}),`
`,(0,c.jsx)(l.p,{children:`In Svelte, Vue, LIT and vanilla: simply use the tag to get going:`}),`
`,(0,c.jsx)(l.pre,{children:(0,c.jsx)(l.code,{className:`language-html`,children:`<clabs-chat
  <!-- string: user-name in LLM conversation -->
  user-name="user"
  <!-- string: agent name in LLM conversation -->
  agent-name="bot"
  <!-- (optional) string: api url to send user queries to -->
  api-url="localhost:5000/generate_response"
  <!-- (optional) boolean: whether to autoparse responses from LLM -->
  auto-update
  <!-- (optional) boolean: show loading state while model is thinking -->
  loading
  <!-- (optional) boolean: enable token streaming mode from specified api -->
  stream-content
  <!-- (optional) string: specify desired model -->
  model="llama-2"
  <!-- (optional) string: specify custom system prompt for LLM -->
  user-prompt="You are Watson, a helpful assistant"
  <!-- (optional) float: specify temperature for LLM responses -->
  temperature="0.15"
  >
</clabs-chat>
`})}),`
`,(0,c.jsx)(l.h3,{id:`usage-in-react`,children:`Usage in React:`}),`
`,(0,c.jsx)(`a`,{id:`react-implementation`}),`
`,(0,c.jsx)(l.h4,{id:`try-out-our-examples`,children:`Try out our examples:`}),`
`,(0,c.jsxs)(l.blockquote,{children:[`
`,(0,c.jsxs)(l.p,{children:[(0,c.jsx)(l.a,{href:`https://stackblitz.com/github/ocornec/carbon-labs-react-examples/tree/main/simple-chat`,rel:`nofollow`,children:`Github`}),`
Simple Chat example.`]}),`
`]}),`
`,(0,c.jsxs)(l.blockquote,{children:[`
`,(0,c.jsxs)(l.p,{children:[(0,c.jsx)(l.a,{href:`https://stackblitz.com/github/ocornec/carbon-labs-react-examples/tree/main/fully-composed-chat`,rel:`nofollow`,children:`Github`}),`
Fully Composed Chat example.`]}),`
`]}),`
`,(0,c.jsxs)(l.blockquote,{children:[`
`,(0,c.jsxs)(l.p,{children:[(0,c.jsx)(l.a,{href:`https://stackblitz.com/github/ocornec/carbon-labs-react-examples/tree/main/charts`,rel:`nofollow`,children:`Github`}),`
Singular component (charts only example).`]}),`
`]}),`
`,(0,c.jsx)(l.p,{children:`For React, one extra step is needed:`}),`
`,(0,c.jsx)(l.pre,{children:(0,c.jsx)(l.code,{className:`language-js`,children:`//ChatComponent.js
import { createComponent } from '@lit/react';
import React from 'react';
import CLABSChat from '@carbon-labs/ai-chat/es/components/chat/chat.js';

export const Chat = createComponent({
  tagName: 'clabs-chat',
  elementClass: CLABSChat,
  react: React,
  events: {},
});
`})}),`
`,(0,c.jsx)(l.p,{children:`Then import like any other React Component:`}),`
`,(0,c.jsx)(l.pre,{children:(0,c.jsx)(l.code,{className:`language-js`,children:`//App.js
import './App.css';
import {Chat} from './ChatComponent';
const conversationExample = [] //place your message structure here

function App() {
  return (
      <Chat conversation={conversationExample}>
  );
}
export default App;
`})}),`
`,(0,c.jsx)(l.h3,{id:`1-auto-rendering-with-an-api`,children:`1: Auto-rendering with an API`}),`
`,(0,c.jsx)(`a`,{id:`render-with-any-api`}),`
`,(0,c.jsx)(l.h4,{id:`basic-usage`,children:`Basic usage`}),`
`,(0,c.jsx)(l.pre,{children:(0,c.jsx)(l.code,{className:`language-html`,children:`<clabs-chat
  model="llama-2"
  user-prompt="You are Watson, a helpful assistant"
  api-url="localhost:5001/generate_response"
  temperature="0.15">
</clabs-chat>
`})}),`
`,(0,c.jsxs)(l.p,{children:[`All events/interactions are executed internally, any user query sent to the
`,(0,c.jsx)(l.code,{children:`api-url`}),` and packaged as such:`]}),`
`,(0,c.jsx)(l.pre,{children:(0,c.jsx)(l.code,{className:`language-json`,children:`{
  "user_id": "xxxxxx",
  "session": "af90-dfgs-ek2a-vld9-wej",
  "event": 0,
  "prompt": "You are Watson, a helpful and polite assistant. You will answer all my questions to the best of your knowledge.",
  "context": "user:hi\\nbot:hello how are you?",
  "entry": "I'm fine thank you",
  "temperature": 0.15,
  "max_tokens": 1000,
  "top_p": 0,
  "frequency_penalty": 1,
  "presence_penalty": 0,
  "n": 1,
  "user_name": "user",
  "agent_name": "bot",
  "max_tries": 3
}
`})}),`
`,(0,c.jsx)(l.h4,{id:`raw-text-response`,children:`Raw text response`}),`
`,(0,c.jsxs)(l.p,{children:[`If API returns raw LLM text in a `,(0,c.jsx)(l.code,{children:`reply`}),` of type `,(0,c.jsx)(l.code,{children:`string`}),`, auto-parsing will be
used to slice/classify text into subcompoments within a message.`]}),`
`,(0,c.jsx)(l.h4,{id:`object-response`,children:`Object response`}),`
`,(0,c.jsxs)(l.p,{children:[`If API returns a `,(0,c.jsx)(l.code,{children:`reply`}),` of type `,(0,c.jsx)(l.code,{children:`object/json`}),`, objects are rendered as-is in
order of appearance, each containing a subelement containing a`,(0,c.jsx)(l.code,{children:`type`}),` string
which render a `,(0,c.jsx)(l.code,{children:`content`}),` field:`]}),`
`,(0,c.jsx)(l.pre,{children:(0,c.jsx)(l.code,{className:`language-json`,children:`[
  { "type": "text", "content": "Hello World!" },
  { "type": "html-text", "content": "<h2>Title</h2>" },
  {
    "type": "annotated-text",
    "content": "The link your requested is [here](http://www.google.com)"
  },
  { "type": "url", "content": "http://www.ibm.com" },
  {
    "type": "code",
    "content": "python\\ndef Prime(number,itr):\\n\\t#base condition\\n\\tif ..."
  },
  { "type": "error", "content": "ERROR: API failed to respond, try again" },
  { "type": "image", "content": "http://www.gallery.come/image.png" },
  { "type": "video", "content": "http://www.wikimedia.org/example_video.mp4" },
  { "type": "image", "content": "http://www.gallery.come/image.png" },
  {
    "type": "audio",
    "content": "https://wikimedia....Second_Hungarian_Rhapsody.ogg"
  },
  { "type": "file", "content": "ftp:spreadsheet.csv" },
  {
    "type": "carousel",
    "content": "['http://www.google.com', 'http://www.facebook.com', 'http://www.wikipedia.org']"
  },
  {
    "type": "link-list",
    "content": "https://en.wikipedia.org/wiki/President_of_the_United_States,https://en..."
  },
  {
    "type": "table",
    "content": "header1,hedaer2,header3\\n300,500,600\\nNY,AK,MI"
  },
  { "type": "tags", "content": "['new chat','save chat','create chart']" },
  { "type": "chart", "content": "PLACE STRINGIFIED VEGA SCHEME HERE" },
  {
    "type": "formula",
    "content": "\\\\(1 +  \\\\frac{q^2}{(1-q)}+\\\\frac{q^6}{(1-q)(1-q^2)}+..."
  },
  {
    "type": "molecule",
    "content": "OC[C@@H](O1)[C@@H](O)[C@H](O)[C@@H]2[C@@H]..."
  }
]
`})}),`
`,(0,c.jsx)(l.h4,{id:`streaming-option-response-must-be-a-string-token-and-subcomponents-will-accept-incomplete-streamed-text`,children:`Streaming option: response must be a string token and subcomponents will accept incomplete streamed text:`}),`
`,(0,c.jsx)(l.pre,{children:(0,c.jsx)(l.code,{className:`language-html`,children:`<clabs-chat
  user-name="user"
  agent-name="bot"
  stream-responses
  api-url="localhost:5001/generate_response">
</clabs-chat>
`})}),`
`,(0,c.jsx)(l.h3,{id:`2-api-less-control-with-json-object`,children:`2: API-less control with JSON object`}),`
`,(0,c.jsx)(`a`,{id:`render-from-parent`}),`
`,(0,c.jsxs)(l.h4,{id:`specifiy-a-conversation-object-and-specify-the-loading-state-and-every-interaction-outside-the-chat-then-update-the-conversation-object-to-see-an-update`,children:[`Specifiy a `,(0,c.jsx)(l.strong,{children:`conversation`}),` object and specify the loading state and every interaction outside the chat, then update the `,(0,c.jsx)(l.strong,{children:`conversation`}),` object to see an update:`]}),`
`,(0,c.jsx)(l.pre,{children:(0,c.jsx)(l.code,{className:`language-html`,children:`<clabs-chat
  user-name="user"
  agent-name="bot"
  loading="{false}"
  .conversation="{conversationJSON}"
  @on-user-text-input="\${(e) => {
    //user sent a message request through the text input footer
  }}"
  @on-user-message-update-request="\${(e) => {
    //user edited a message in the chat
  }}"
  @on-user-regeneration-request="\${(e) => {
    //user clicked 'regenerate' in a bot response
  }}"
  @on-user-feedback-request="\${(e) => {
    //user clicked thumbs up or thumbs down on a bot response
  }}"
  @on-message-element-tag-selected="\${(e) => {
    //user clicked a tag action element in the chat
  }}"
  @on-message-element-selected="\${(e) => {
    //user clicked on a subelement in the chat
  }}">
</clabs-chat>
`})}),`
`,(0,c.jsx)(l.h4,{id:`conversation-format`,children:`Conversation format:`}),`
`,(0,c.jsx)(l.pre,{children:(0,c.jsx)(l.code,{className:`language-js`,children:`[
  {
    origin: 'bot',
    time: '4:51pm',
    disableButtons: true,
    displayName: "Watson",
    elements: [{ content: 'Hello friend', type: 'text' }] //message format
  },
  {
    origin: 'user',
    time: '4:56pm',
    displayName: "Owen",
    disableButtons: false,
    elements: [
      { content: 'Hello, how are you? I have a file to analyze:', type: 'text' },
      { content: 'ftp:spreadsheet.csv','file'}]  //message format
  },
  {
    origin: 'bot',
    time: '4:59pm',
    disableButtons: true,
    displayName: "Watson",
    elements: [
      { content: 'Here is your table:', type: 'text' },
      { content: 'age,name,state\\n39,george,NY\\n42,Mike,AK\\n25,Linda,IL', type: 'table' }
      ]
  }
]
`})}),`
`,(0,c.jsx)(l.h4,{id:`handling-thumbs-updown-feedback-events`,children:`Handling thumbs up/down feedback events`}),`
`,(0,c.jsxs)(l.p,{children:[`Use the `,(0,c.jsx)(l.code,{children:`on-user-feedback-request`}),` event which returns in`,(0,c.jsx)(l.code,{children:`event.detail`}),`:`]}),`
`,(0,c.jsx)(l.pre,{children:(0,c.jsx)(l.code,{className:`language-json`,children:`{
  "messageOrigin": "bot",
  "messageTime": "16:51",
  "displayName": "not-specified",
  "messageIndexInChat": 0,
  "action": "message: user gave feedback to response",
  "type": "positive",
  "rawTextMessage": "",
  "messageElements": [] //complete message structure here
}
`})}),`
`,(0,c.jsxs)(l.p,{children:[(0,c.jsx)(l.code,{children:`event.detail.type`}),` can be `,(0,c.jsx)(l.code,{children:`positive`}),` or `,(0,c.jsx)(l.code,{children:`negative`})]}),`
`,(0,c.jsx)(l.h4,{id:`handling-user-regeneration-requests`,children:`Handling user regeneration requests`}),`
`,(0,c.jsxs)(l.p,{children:[`Use the `,(0,c.jsx)(l.code,{children:`on-user-regeneration-request`}),` which returns
`,(0,c.jsx)(l.code,{children:`event.detail.cutConversationIndex`}),`. This is the index of the previous user's
message that generated the dissastisfactory model response. As such you need to:`]}),`
`,(0,c.jsx)(l.pre,{children:(0,c.jsx)(l.code,{className:`language-js`,children:`const deletionIndex = event.detail.cutConversationIndex;
const previousMessage = conversation[deletionIndex].text;
displayConversation = conversation.slice(0, deletionIndex + 1);
postMessage(previousMessage); //handle mimicking a real user request here to fetch the response from your chosen API
`})}),`
`,(0,c.jsx)(l.h3,{id:`full-customization-with-slotting`,children:`Full Customization with Slotting`}),`
`,(0,c.jsx)(`a`,{id:`full-customization-with-slotting`}),`
`,(0,c.jsx)(l.pre,{children:(0,c.jsx)(l.code,{className:`language-html`,children:` <clabs-chat user-name="user" agent-name="bot" conversation="{conversation}">
  <clabs-chat-messages slot="messages">

    <clabs-chat-message slot="message-items" origin="user" time-stamp="9:02pm" index="0">
      <clabs-chat-text slot="message-item-content" content="Showcase every type of Element available in this Chat component.">
      </clabs-chat-text>
    </clabs-chat-message>

    <clabs-chat-message slot="message-items" origin="bot" time-stamp="9:04pm" index="1">

      <!-- Display a text element -->
      <clabs-chat-text slot="message-item-content" content='This is a textElement, displays text following Carbon design guidelines.'></clabs-chat-text>

      <!-- Display a text element with HTML included -->
      <clabs-chat-text slot="message-item-content" content='TextElement can also render simple HTML as such:\\n <h2>This is using a h2 tag</h2>\\n'></clabs-chat-text>

      <!-- Custom slotted div with any content -->
      <div slot="message-item-content">
        <iframe width="256" height="256" src="https://www.youtube.com/embed/oSCX78-8-q0?si=kCcIHjehhVn-4PSO" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
      </div>

      <!-- File Card -->
      <clabs-chat-card slot="message-item-content" type="file" content='https://arxiv.org/pdf/2312.05688.pdf'></clabs-chat-card>

      <!-- Show a CSV table -->
      <clabs-chat-table slot="message-item-content" content='Name,Age,Occupation,Location,State\\nJerry,35,Comedian,Upper east side,NY\\nGeorge,35,Unemployed,Queens,NY\\nElaine,32,Publisher,Midtown,NY\\nKramer,36,Unknown,Upper east side,NY'></clabs-chat-table>

      <!-- Show code -->
      <clabs-chat-code slot="message-item-content" content='from math import sqrt\\n#prime function to check given number prime or not:\\ndef Prime(number,itr):\\n\\t#base condition\\n\\tif itr == 1:\\n\\t\\treturn True\\n\\t#if given number divided by itr or not\\n\\tif number % itr == 0:\\n\\t\\treturn False\\n\\t#Recursive function Call\\n\\tif Prime(number,itr-1) == False:\\n\\t\\treturn False\\n\\treturn True\\n'></clabs-chat-code>

      <!-- Action buttons -->
      <clabs-chat-tags slot="message-item-content" content='["Simone de Beauvoir","René Descartes","Jean-Paul Sartre","Voltaire","Michel Foucault","Albert Camus"]'></<clabs-chat-tags>

      <!-- Text lists -->
      <clabs-chat-list slot="message-item-content" content='1. Google.com (United States)\\n2. YouTube.com (US)\\n3. Facebook.com (US)\\n4. Baidu.com (China)\\n5. Wikipedia.org (US)'></clabs-chat-list>

      <!-- Charts -->
      <clabs-chat-chart container-height="200px" slot="message-item-content" content='{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Boxplot example with random data","data":{"values":[{"group":"Group A","value":34},{"group":"Group A","value":28},{"group":"Group A","value":55},{"group":"Group B","value":91},{"group":"Group B","value":81},{"group":"Group B","value":67}]},"mark":"boxplot","encoding":{"y":{"field":"group","type":"nominal"},"x":{"field":"value","type":"quantitative"}}}'></clabs-chat-chart>

    </clabs-chat-message>

  </clabs-chat-messages>

</clabs-chat>
`})}),`
`,(0,c.jsx)(l.h3,{id:`feedback-form-definition`,children:`Feedback form definition`}),`
`,(0,c.jsx)(`a`,{id:`feedback-form`}),`
`,(0,c.jsx)(l.p,{children:`Specify feedback form options like so:`}),`
`,(0,c.jsx)(l.h4,{id:`importing-into-chat`,children:`Importing into Chat`}),`
`,(0,c.jsx)(l.pre,{children:(0,c.jsx)(l.code,{className:`language-html`,children:`<clabs-chat
  enable-complex-feedback
  feedbackDefinitions="{feedbackDefinitionsJSON}" />
`})}),`
`,(0,c.jsx)(l.h3,{id:`json-object`,children:`JSON object`}),`
`,(0,c.jsx)(l.pre,{children:(0,c.jsx)(l.code,{className:`language-js`,children:`const feedbackFormOptions = {
  'thumbs-down': {
    title: 'Unsatisfactory Response',
    tags: [
      'Inaccurate',
      'Incomplete',
      'Missing links',
      'Privacy violations',
      'Hate speech',
    ],
    prompt: 'What was unsatisfactory about this response?',
    responsePlaceholder: 'Describe issues with this response',
    disclaimer:
      'Lorem ipsum dolor sit amet, di os consectetur adipiscing elit, sed doeiusmod tempor incididunt ut fsil labore et dolore magna aliqua.',
  },
  'thumbs-up': {
    title: 'Feedback',
    tags: ['Accurate', 'Comprehensive', 'Consice', 'Easy to Understand'],
    prompt: 'Why did you choose this rating?',
    responsePlaceholder: 'Add a comment',
    disclaimer:
      'Lorem ipsum dolor sit amet, di os consectetur adipiscing elit, sed doeiusmod tempor incididunt ut fsil labore et dolore magna aliqua.',
  },
};
`})}),`
`,(0,c.jsx)(l.h3,{id:`label-localization`,children:`Label localization`}),`
`,(0,c.jsx)(`a`,{id:`localization`}),`
`,(0,c.jsx)(l.p,{children:`Specify any and all label values like so:`}),`
`,(0,c.jsx)(l.h3,{id:`importing-into-chat-1`,children:`Importing into Chat`}),`
`,(0,c.jsx)(l.pre,{children:(0,c.jsx)(l.code,{className:`language-html`,children:`<clabs-chat customLabels="{customLabelsJSON}" />
`})}),`
`,(0,c.jsx)(l.h3,{id:`json-object-1`,children:`JSON object`}),`
`,(0,c.jsx)(l.pre,{children:(0,c.jsx)(l.code,{className:`language-js`,children:`const customLabelsJSON = {
  'header-close-chat': 'Close',
  'header-enable-fullscreen': 'Fullscreen',
  'header-disable-fullscreen': 'Exit fullscreen',
  'header-popout-chat': 'Pop out chat',
  'header-expand-chat': 'Expand chat',
  'header-move-chat': 'Move chat',
  'header-move-chat-done': 'Set chat',
  'header-open-menu': 'Open',
  'header-close-menu': 'Close',
  'header-open-slug': 'Open',
  'header-close-slug': 'Close',
  'message-regenerate-button': 'Regenerate',
  'message-like-button': 'Like',
  'message-undo-like-button': 'Remove like',
  'message-dislike-button': 'Dislike',
  'message-undo-dislike-button': 'Remove dislike',
  'message-enable-editing': 'Edit',
  'message-undo-edit': 'Undo edit',
  'message-validate-edit': 'Validate edit',
  'feedback-submit-button': 'Submit',
  'feedback-submit-button-unavailable': 'Submit unavailable',
  'feedback-close': 'Close',
  'link-list-view-all-button': 'View all',
  'link-list-collapse-button': 'Collapse list',
  'link-list-reference-title': 'References',
  'code-copypaste-button': 'Copy code',
  'code-copypaste-success': 'Copied!',
  'prompt-start-listening': 'Start listening',
  'prompt-stop-listening': 'Stop listening',
  'prompt-microphone-unavailable': 'Microphone unavailable',
  'prompt-loading-state-placeholder': 'Thinking...',
  'prompt-entry-placeholder': 'Type something...',
  'prompt-send-button': 'Send response',
  'prompt-send-blocked-button': 'Send unavailable',
  'prompt-cancel-button': 'Cancel request',
};
`})}),`
`,(0,c.jsx)(l.h3,{id:`styles`,children:`Styles`}),`
`,(0,c.jsxs)(l.p,{children:[`You'll also need to import the theming tokens from `,(0,c.jsx)(l.code,{children:`@carbon/styles`}),` either from
npm or from our CDN helpers. Checkout our Stackblitz example above to see how
that is implemented.`]}),`
`,(0,c.jsx)(t,{children:`${i({components:[`chat`]},o)}`}),`
`,(0,c.jsx)(t,{children:`${a()}`})]})}function u(e={}){let{wrapper:t}={...r(),...e.components};return t?(0,c.jsx)(t,{...e,children:(0,c.jsx)(l,{...e})}):l(e)}export{u as default};
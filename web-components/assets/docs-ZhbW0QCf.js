import{j as e,M as r,a as t}from"./blocks-CnAavXNN.js";import{useMDXComponents as s}from"./index-DLBkLKgW.js";import{c as l,a as c}from"./storybook-cdn-BiPTSTB7.js";import{C as o}from"./codeElement.stories-lqKHO3Qx.js";import{p as h}from"./package-DD3V0o2y.js";import"./preload-helper-C1FmrZbK.js";import"./iframe-CklRD_a7.js";import"./codeElement-BAR8enjB.js";import"./property-YYZQ7-GG.js";import"./state-DgWAjJv5.js";import"./unsafe-html-DgbLaX-s.js";import"./directive-CJw_OlP2.js";import"./button-BFHOK1Jb.js";import"./class-map-DZhVDNJW.js";import"./if-defined-D0SyScEO.js";import"./carbon-element-DvT6Hso_.js";import"./focus-CH_-ZGzI.js";import"./host-listener-C4Ji6v3a.js";import"./button-skeleton-VQRUfe8G.js";import"./icon-button-wK-Ha-DP.js";import"./definition-tooltip-DhJDUBoN.js";import"./query-BApjzB0v.js";import"./floating-ui.dom-DgLPPlcg.js";import"./16-C_7DXZKc.js";import"./icon-loader-BnOa4aZQ.js";import"./index-CEKjj0vN.js";import"./16-C2f9e6nj.js";import"./16-hRAwM-Pz.js";import"./16-D0aIqdwb.js";import"./16-CQhU3uUy.js";import"./settings-BQP9c3yA.js";function i(d){const n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...s(),...d.components};return e.jsxs(e.Fragment,{children:[e.jsx(r,{of:o}),`
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
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"C++ example with max height at 300px, custom language name, auto-detection for color rendering, auto-indenting, block-collapsing, editing and undo/save functions enabled"})}),`
`,e.jsx("clabs-chat-code",{"max-height":"300px","enable-edit-button":!0,"show-content-differences":!0,customLabels:{"code-copypaste-button":"Copier le code","code-copypaste-success":"Copié!","code-estimated-warning":"(estimé)","code-editing-validation":"Appliquer","code-editing-cancelled":"Annuler","code-line-descriptor":"lignes"},"display-line-count":!0,"enable-language-display":!0,"displayed-language":"Custom language name (C++ rendering)","enable-block-collapse":!0,content:`#include <iostream>
#include "llama.cpp/llama.h"

int main() {
	llama_model *model = llama_load_model_from_file("path/to/model.bin"); 

	if (model == nullptr) {
		std::cerr << "Failed to load model.";
		return 1;
	}

	std::string prompt = "Hello, how are you today?";
	llama_context *ctx = llama_new_context_with_model(model, 512); 

	std::cout << "Prompt: " << prompt << std::endl;
	std::cout << "Response: ";

	for (int i = 0; i < 100; ++i) {
		llama_token token = llama_sample_token(ctx, nullptr);
		std::cout << llama_token_to_str(model, token);
	}

	std::cout << std::endl;

	llama_free_context(ctx);
	llama_free_model(model);

	return 0;
}`}),`
`,e.jsx("clabs-chat-code",{"enable-language-display":!0,"displayed-language":"Malbolge",content:"(=<`$9]7<5YXz7wT.3,+O/o'K%$H'~D|#z@b=`{^Lx8%$Xmrkpohm-kNi;gsedcba`_^][ZYXWVUTSRQPONMLKJIHGFEDCBA@?>=<;:9876543s+O<oLm"}),`
`,e.jsx(n.h3,{id:"attributes-and-properties",children:"Attributes and Properties"}),`
`,e.jsx("a",{id:"attributes-and-properties"}),`
`,e.jsx(n.h4,{id:"general",children:"General"}),`
`,e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.strong,{children:"Attribute name"})}),e.jsx("td",{children:e.jsx(n.strong,{children:"Type"})}),e.jsx("td",{children:e.jsx(n.strong,{children:"Effect"})}),e.jsx("td",{children:e.jsx(n.strong,{children:"Use case"})})]})}),e.jsxs("tbody",{children:[e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"content"})}),e.jsx("td",{children:e.jsx(n.code,{children:"string"})}),e.jsx("td",{children:"Text content to render"}),e.jsx("td",{children:"Obligatory for the component to render"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"max-height"})}),e.jsx("td",{children:e.jsx(n.code,{children:"string"})}),e.jsx("td",{children:"Limits total height and scrolls if needed"}),e.jsx("td",{children:"When code is large or height is limited"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"display-line-count"})}),e.jsx("td",{children:e.jsx(n.code,{children:"boolean"})}),e.jsx("td",{children:"Shows line count at top of component"}),e.jsx("td",{children:"When code length is variable"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"tab-size"})}),e.jsx("td",{children:e.jsx(n.code,{children:"integer"})}),e.jsx("td",{children:"Set tab spacing for new lines"}),e.jsx("td",{children:"When default spacing of 2 is insufficient"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"disable-auto-compacting"})}),e.jsx("td",{children:e.jsx(n.code,{children:"boolean"})}),e.jsx("td",{children:"Stops line-ticks from being removed when space isn't sufficient"}),e.jsx("td",{children:"Hide ticks when compacted"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"disable-line-ticks"})}),e.jsx("td",{children:e.jsx(n.code,{children:"boolean"})}),e.jsx("td",{children:"Remove line counts on the left side-bar of code"}),e.jsx("td",{children:"When showing code such as console commands"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"disable-copy-button"})}),e.jsx("td",{children:e.jsx(n.code,{children:"boolean"})}),e.jsx("td",{children:"Remove copy button from top-right corner"}),e.jsx("td",{children:"When displaying code not meant to be replicated"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"customLabels"})}),e.jsx("td",{children:e.jsx(n.code,{children:"array object"})}),e.jsx("td",{children:"Define all button labels"}),e.jsx("td",{children:"See below"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"auto-indent"})}),e.jsx("td",{children:e.jsx(n.code,{children:"boolean"})}),e.jsx("td",{children:"Auto-detect and reformat content to add tab spacing"}),e.jsx("td",{children:"When content is missing tabs, uses two/four spaces or LLM response is unreliable"})]})]})]}),`
`,e.jsx(n.h4,{id:"coloring",children:"Coloring"}),`
`,e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.strong,{children:"Attribute name"})}),e.jsx("td",{children:e.jsx(n.strong,{children:"Type"})}),e.jsx("td",{children:e.jsx(n.strong,{children:"Effect"})}),e.jsx("td",{children:e.jsx(n.strong,{children:"Use case"})})]})}),e.jsxs("tbody",{children:[e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"disable-coloring"})}),e.jsx("td",{children:e.jsx(n.code,{children:"boolean"})}),e.jsx("td",{children:"Disable auto-coloring on render"}),e.jsx("td",{children:"When unneeded"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"disable-coloring-char-threshold"})}),e.jsx("td",{children:e.jsx(n.code,{children:"integer"})}),e.jsx("td",{children:"Max character count to auto disable coloring"}),e.jsx("td",{children:"To optimize performance with large code pieces"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"disable-coloring-line-threshold"})}),e.jsx("td",{children:e.jsx(n.code,{children:"integer"})}),e.jsx("td",{children:"Max line count to auto disable coloring"}),e.jsx("td",{children:"To optimize performance with large code pieces"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"render-language"})}),e.jsx("td",{children:e.jsx(n.code,{children:"string"})}),e.jsx("td",{children:"Set HLJS rendering language flag"}),e.jsx("td",{children:"To force HighlightJS to use specified language"})]})]})]}),`
`,e.jsx(n.h4,{id:"editing",children:"Editing"}),`
`,e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.strong,{children:"Attribute name"})}),e.jsx("td",{children:e.jsx(n.strong,{children:"Type"})}),e.jsx("td",{children:e.jsx(n.strong,{children:"Effect"})}),e.jsx("td",{children:e.jsx(n.strong,{children:"Use case"})})]})}),e.jsxs("tbody",{children:[e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"editable"})}),e.jsx("td",{children:e.jsx(n.code,{children:"boolean"})}),e.jsx("td",{children:"Make every line editable by users"}),e.jsx("td",{children:"When a user-input is needed to fix an object"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"disable-edit-button"})}),e.jsx("td",{children:e.jsx(n.code,{children:"boolean"})}),e.jsx("td",{children:"When editable is invoked, remove edit button"}),e.jsx("td",{children:"Disable button to validate edit"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"enable-edit-button"})}),e.jsx("td",{children:e.jsx(n.code,{children:"boolean"})}),e.jsx("td",{children:"Show editing button"}),e.jsx("td",{children:"To allow toggling of editing mode"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"disable-editing-options"})}),e.jsx("td",{children:e.jsx(n.code,{children:"boolean"})}),e.jsx("td",{children:"Hide confirm/undo buttons in editing mode"}),e.jsx("td",{})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"debug-editing-mode"})}),e.jsx("td",{children:e.jsx(n.code,{children:"boolean"})}),e.jsx("td",{children:"Show overlapping text in virtual text-area"}),e.jsx("td",{children:"To debug issues with editing mode resizing etc"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"customLabels"})}),e.jsx("td",{children:"Define all button labels"}),e.jsx("td",{children:"See below"})]})]})]}),`
`,e.jsx(n.h4,{id:"diff-checking",children:"Diff checking"}),`
`,e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.strong,{children:"Attribute name"})}),e.jsx("td",{children:e.jsx(n.strong,{children:"Type"})}),e.jsx("td",{children:e.jsx(n.strong,{children:"Effect"})}),e.jsx("td",{children:e.jsx(n.strong,{children:"Use case"})})]})}),e.jsxs("tbody",{children:[e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"new-content"})}),e.jsx("td",{children:e.jsx(n.code,{children:"string"})}),e.jsx("td",{children:"Updated text content to compare"}),e.jsx("td",{children:"Obligatory for the diff comparison mode"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"show-content-differences"})}),e.jsx("td",{children:e.jsx(n.code,{children:"boolean"})}),e.jsx("td",{children:"Enable diff comparison mode"}),e.jsx("td",{})]})]})]}),`
`,e.jsx(n.h4,{id:"block-collapsing",children:"Block collapsing"}),`
`,e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.strong,{children:"Attribute name"})}),e.jsx("td",{children:e.jsx(n.strong,{children:"Type"})}),e.jsx("td",{children:e.jsx(n.strong,{children:"Effect"})}),e.jsx("td",{children:e.jsx(n.strong,{children:"Use case"})})]})}),e.jsxs("tbody",{children:[e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"enable-block-collapse"})}),e.jsx("td",{children:e.jsx(n.code,{children:"boolean"})}),e.jsx("td",{children:"Show carets to collapse code blocks"}),e.jsx("td",{children:"When code is large and space/readibility is paramount"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"auto-indent"})}),e.jsx("td",{children:e.jsx(n.code,{children:"boolean"})}),e.jsx("td",{children:"Auto-detect and reformat content to add tab spacing"}),e.jsx("td",{children:"When content is missing tabs, uses two/four spaces or LLM response is unreliable"})]})]})]}),`
`,e.jsx(n.h4,{id:"language-management",children:"Language management"}),`
`,e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.strong,{children:"Attribute name"})}),e.jsx("td",{children:e.jsx(n.strong,{children:"Type"})}),e.jsx("td",{children:e.jsx(n.strong,{children:"Effect"})}),e.jsx("td",{children:e.jsx(n.strong,{children:"Use case"})})]})}),e.jsxs("tbody",{children:[e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"render-language"})}),e.jsx("td",{children:e.jsx(n.code,{children:"string"})}),e.jsx("td",{children:"Set HLJS rendering language flag"}),e.jsx("td",{children:"To force HighlightJS to use specified language"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"enable-language-display"})}),e.jsx("td",{children:e.jsx(n.code,{children:"boolean"})}),e.jsx("td",{children:"Show language at top of component"}),e.jsx("td",{children:"When generation offers multiple options"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"displayed-language"})}),e.jsx("td",{children:e.jsx(n.code,{children:"string"})}),e.jsx("td",{children:"Force top-level language name"}),e.jsx("td",{children:"When automatic detection isn't accurate"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(n.code,{children:"enable-estimated-language"})}),e.jsx("td",{children:e.jsx(n.code,{children:"boolean"})}),e.jsx("td",{children:"Show guessed language from coloring"}),e.jsx("td",{children:"When language is unknown"})]})]})]}),`
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
`,e.jsx(t,{children:`${l({components:["chat"]},h)}`}),`
`,e.jsx(t,{children:`${c()}`})]})}function N(d={}){const{wrapper:n}={...s(),...d.components};return n?e.jsx(n,{...d,children:e.jsx(i,{...d})}):i(d)}export{N as default};

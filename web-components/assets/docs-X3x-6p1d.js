import{m as e,o as t,s as n}from"./blocks-Cl51nNt5.js";import{n as r}from"./lib-BFRReuxJ.js";import{n as i,t as a}from"./storybook-cdn-BBLcRzqB.js";import{t as o}from"./package-GkU-yABV.js";import{t as s}from"./codeElement.stories-Dx3iX69w.js";var c=e();function l(e){let l={a:`a`,blockquote:`blockquote`,code:`code`,h1:`h1`,h2:`h2`,h3:`h3`,h4:`h4`,li:`li`,p:`p`,pre:`pre`,strong:`strong`,ul:`ul`,...r(),...e.components};return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(n,{of:s}),`
`,(0,c.jsx)(l.h1,{id:`carbon-ai-chat-code`,children:`Carbon AI Chat: Code`}),`
`,(0,c.jsxs)(l.blockquote,{children:[`
`,(0,c.jsx)(l.p,{children:(0,c.jsx)(l.strong,{children:`NOTE: Chat components that reached "preview candidate" status are in the process of graduating to a stable library! If you are starting out new or currently using the existing Carbon Labs version, we recommend going to #carbon-ai-chat to request access to the new library.`})}),`
`,(0,c.jsx)(l.p,{children:(0,c.jsx)(l.strong,{children:`The chat components in Carbon Labs that reached "preview candidate" status will continue to be supported here until they are fully migrated to the new location.`})}),`
`]}),`
`,(0,c.jsxs)(l.ul,{children:[`
`,(0,c.jsxs)(l.li,{children:[(0,c.jsx)(l.strong,{children:`Initiative owner(s):`}),` Owen Cornec`]}),`
`,(0,c.jsxs)(l.li,{children:[(0,c.jsx)(l.strong,{children:`Status:`}),` Draft`]}),`
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
`,(0,c.jsxs)(l.p,{children:[`The `,(0,c.jsx)(l.strong,{children:`Carbon Labs Code`}),` component aims to expand upon the `,(0,c.jsx)(l.strong,{children:`Carbon
CodeSnippet`}),` component with more flexibility, dynamic line marks, colored text
and editing functions.`]}),`
`,(0,c.jsx)(l.p,{children:(0,c.jsx)(l.strong,{children:`C++ example with max height at 300px, custom language name, auto-detection for color rendering, auto-indenting, block-collapsing, editing and undo/save functions enabled`})}),`
`,(0,c.jsx)(`clabs-chat-code`,{"max-height":`300px`,"enable-edit-button":!0,"show-content-differences":!0,customLabels:{"code-copypaste-button":`Copier le code`,"code-copypaste-success":`Copié!`,"code-estimated-warning":`(estimé)`,"code-editing-validation":`Appliquer`,"code-editing-cancelled":`Annuler`,"code-line-descriptor":`lignes`},"display-line-count":!0,"enable-language-display":!0,"displayed-language":`Custom language name (C++ rendering)`,"enable-block-collapse":!0,content:`#include <iostream>
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
`,(0,c.jsx)(`clabs-chat-code`,{"enable-language-display":!0,"displayed-language":`Malbolge`,content:"(=<`$9]7<5YXz7wT.3,+O/o'K%$H'~D|#z@b=`{^Lx8%$Xmrkpohm-kNi;gsedcba`_^][ZYXWVUTSRQPONMLKJIHGFEDCBA@?>=<;:9876543s+O<oLm"}),`
`,(0,c.jsx)(l.h3,{id:`attributes-and-properties`,children:`Attributes and Properties`}),`
`,(0,c.jsx)(`a`,{id:`attributes-and-properties`}),`
`,(0,c.jsx)(l.h4,{id:`general`,children:`General`}),`
`,(0,c.jsxs)(`table`,{children:[(0,c.jsx)(`thead`,{children:(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(l.strong,{children:`Attribute name`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.strong,{children:`Type`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.strong,{children:`Effect`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.strong,{children:`Use case`})})]})}),(0,c.jsxs)(`tbody`,{children:[(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`content`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`string`})}),(0,c.jsx)(`td`,{children:`Text content to render`}),(0,c.jsx)(`td`,{children:`Obligatory for the component to render`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`max-height`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`string`})}),(0,c.jsx)(`td`,{children:`Limits total height and scrolls if needed`}),(0,c.jsx)(`td`,{children:`When code is large or height is limited`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`display-line-count`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`boolean`})}),(0,c.jsx)(`td`,{children:`Shows line count at top of component`}),(0,c.jsx)(`td`,{children:`When code length is variable`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`tab-size`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`integer`})}),(0,c.jsx)(`td`,{children:`Set tab spacing for new lines`}),(0,c.jsx)(`td`,{children:`When default spacing of 2 is insufficient`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`disable-auto-compacting`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`boolean`})}),(0,c.jsx)(`td`,{children:`Stops line-ticks from being removed when space isn't sufficient`}),(0,c.jsx)(`td`,{children:`Hide ticks when compacted`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`disable-line-ticks`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`boolean`})}),(0,c.jsx)(`td`,{children:`Remove line counts on the left side-bar of code`}),(0,c.jsx)(`td`,{children:`When showing code such as console commands`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`disable-copy-button`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`boolean`})}),(0,c.jsx)(`td`,{children:`Remove copy button from top-right corner`}),(0,c.jsx)(`td`,{children:`When displaying code not meant to be replicated`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`customLabels`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`array object`})}),(0,c.jsx)(`td`,{children:`Define all button labels`}),(0,c.jsx)(`td`,{children:`See below`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`auto-indent`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`boolean`})}),(0,c.jsx)(`td`,{children:`Auto-detect and reformat content to add tab spacing`}),(0,c.jsx)(`td`,{children:`When content is missing tabs, uses two/four spaces or LLM response is unreliable`})]})]})]}),`
`,(0,c.jsx)(l.h4,{id:`coloring`,children:`Coloring`}),`
`,(0,c.jsxs)(`table`,{children:[(0,c.jsx)(`thead`,{children:(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(l.strong,{children:`Attribute name`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.strong,{children:`Type`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.strong,{children:`Effect`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.strong,{children:`Use case`})})]})}),(0,c.jsxs)(`tbody`,{children:[(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`disable-coloring`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`boolean`})}),(0,c.jsx)(`td`,{children:`Disable auto-coloring on render`}),(0,c.jsx)(`td`,{children:`When unneeded`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`disable-coloring-char-threshold`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`integer`})}),(0,c.jsx)(`td`,{children:`Max character count to auto disable coloring`}),(0,c.jsx)(`td`,{children:`To optimize performance with large code pieces`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`disable-coloring-line-threshold`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`integer`})}),(0,c.jsx)(`td`,{children:`Max line count to auto disable coloring`}),(0,c.jsx)(`td`,{children:`To optimize performance with large code pieces`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`render-language`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`string`})}),(0,c.jsx)(`td`,{children:`Set HLJS rendering language flag`}),(0,c.jsx)(`td`,{children:`To force HighlightJS to use specified language`})]})]})]}),`
`,(0,c.jsx)(l.h4,{id:`editing`,children:`Editing`}),`
`,(0,c.jsxs)(`table`,{children:[(0,c.jsx)(`thead`,{children:(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(l.strong,{children:`Attribute name`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.strong,{children:`Type`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.strong,{children:`Effect`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.strong,{children:`Use case`})})]})}),(0,c.jsxs)(`tbody`,{children:[(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`editable`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`boolean`})}),(0,c.jsx)(`td`,{children:`Make every line editable by users`}),(0,c.jsx)(`td`,{children:`When a user-input is needed to fix an object`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`disable-edit-button`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`boolean`})}),(0,c.jsx)(`td`,{children:`When editable is invoked, remove edit button`}),(0,c.jsx)(`td`,{children:`Disable button to validate edit`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`enable-edit-button`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`boolean`})}),(0,c.jsx)(`td`,{children:`Show editing button`}),(0,c.jsx)(`td`,{children:`To allow toggling of editing mode`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`disable-editing-options`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`boolean`})}),(0,c.jsx)(`td`,{children:`Hide confirm/undo buttons in editing mode`}),(0,c.jsx)(`td`,{})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`debug-editing-mode`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`boolean`})}),(0,c.jsx)(`td`,{children:`Show overlapping text in virtual text-area`}),(0,c.jsx)(`td`,{children:`To debug issues with editing mode resizing etc`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`customLabels`})}),(0,c.jsx)(`td`,{children:`Define all button labels`}),(0,c.jsx)(`td`,{children:`See below`})]})]})]}),`
`,(0,c.jsx)(l.h4,{id:`diff-checking`,children:`Diff checking`}),`
`,(0,c.jsxs)(`table`,{children:[(0,c.jsx)(`thead`,{children:(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(l.strong,{children:`Attribute name`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.strong,{children:`Type`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.strong,{children:`Effect`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.strong,{children:`Use case`})})]})}),(0,c.jsxs)(`tbody`,{children:[(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`new-content`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`string`})}),(0,c.jsx)(`td`,{children:`Updated text content to compare`}),(0,c.jsx)(`td`,{children:`Obligatory for the diff comparison mode`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`show-content-differences`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`boolean`})}),(0,c.jsx)(`td`,{children:`Enable diff comparison mode`}),(0,c.jsx)(`td`,{})]})]})]}),`
`,(0,c.jsx)(l.h4,{id:`block-collapsing`,children:`Block collapsing`}),`
`,(0,c.jsxs)(`table`,{children:[(0,c.jsx)(`thead`,{children:(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(l.strong,{children:`Attribute name`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.strong,{children:`Type`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.strong,{children:`Effect`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.strong,{children:`Use case`})})]})}),(0,c.jsxs)(`tbody`,{children:[(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`enable-block-collapse`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`boolean`})}),(0,c.jsx)(`td`,{children:`Show carets to collapse code blocks`}),(0,c.jsx)(`td`,{children:`When code is large and space/readibility is paramount`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`auto-indent`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`boolean`})}),(0,c.jsx)(`td`,{children:`Auto-detect and reformat content to add tab spacing`}),(0,c.jsx)(`td`,{children:`When content is missing tabs, uses two/four spaces or LLM response is unreliable`})]})]})]}),`
`,(0,c.jsx)(l.h4,{id:`language-management`,children:`Language management`}),`
`,(0,c.jsxs)(`table`,{children:[(0,c.jsx)(`thead`,{children:(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(l.strong,{children:`Attribute name`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.strong,{children:`Type`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.strong,{children:`Effect`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.strong,{children:`Use case`})})]})}),(0,c.jsxs)(`tbody`,{children:[(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`render-language`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`string`})}),(0,c.jsx)(`td`,{children:`Set HLJS rendering language flag`}),(0,c.jsx)(`td`,{children:`To force HighlightJS to use specified language`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`enable-language-display`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`boolean`})}),(0,c.jsx)(`td`,{children:`Show language at top of component`}),(0,c.jsx)(`td`,{children:`When generation offers multiple options`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`displayed-language`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`string`})}),(0,c.jsx)(`td`,{children:`Force top-level language name`}),(0,c.jsx)(`td`,{children:`When automatic detection isn't accurate`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`enable-estimated-language`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`boolean`})}),(0,c.jsx)(`td`,{children:`Show guessed language from coloring`}),(0,c.jsx)(`td`,{children:`When language is unknown`})]})]})]}),`
`,(0,c.jsx)(l.h3,{id:`custom-labels-for-localization`,children:`Custom Labels for localization`}),`
`,(0,c.jsxs)(l.p,{children:[`Place `,(0,c.jsx)(l.code,{children:`customLabels`}),` with the following object to edit all button tooltip values`]}),`
`,(0,c.jsx)(l.pre,{children:(0,c.jsx)(l.code,{className:`language-js`,children:`{
  'code-copypaste-button': 'Copy code',
  'code-copypaste-success': 'Copied!',
  'code-estimated-warning': '(estimated)',
  'code-line-descriptor': 'lines',
  'code-editing-validation': 'Save edits',
  'code-editing-cancelled': 'Revert edits'
}
`})}),`
`,(0,c.jsx)(l.h3,{id:`clabs-chat-code-events`,children:`<clabs-chat-code> events`}),`
`,(0,c.jsx)(`a`,{id:`events`}),`
`,(0,c.jsxs)(`table`,{children:[(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(l.strong,{children:`Event listener name`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(l.strong,{children:`Trigger condition`})})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`on-code-edit-change`})}),(0,c.jsx)(`td`,{children:`Each edit when in editing mode`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`on-code-edit-validation`})}),(0,c.jsx)(`td`,{children:`Editing finalized and locked`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`on-code-edit-cancellation`})}),(0,c.jsx)(`td`,{children:`Last set of edits was undone`})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(l.code,{children:`on-coloring-auto-disabled`})}),(0,c.jsx)(`td`,{children:`Rendering threshold exceeded`})]})]}),`
`,(0,c.jsx)(l.h3,{id:`usage-example`,children:`Usage example`}),`
`,(0,c.jsx)(l.pre,{children:(0,c.jsx)(l.code,{className:`language-html`,children:`<clabs-code
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
`,(0,c.jsx)(l.pre,{children:(0,c.jsx)(l.code,{className:`language-javascript`,children:`import '@carbon-labs/ai-chat-code/es/index.js';
`})}),`
`,(0,c.jsx)(l.h3,{id:`styles`,children:`Styles`}),`
`,(0,c.jsxs)(l.p,{children:[`You'll also need to import the theming tokens from `,(0,c.jsx)(l.code,{children:`@carbon/styles`}),` either from
npm or from our CDN helpers. Checkout our Stackblitz example above to see how
that is implemented.`]}),`
`,(0,c.jsx)(t,{children:`${i({components:[`chat`]},o)}`}),`
`,(0,c.jsx)(t,{children:`${a()}`})]})}function u(e={}){let{wrapper:t}={...r(),...e.components};return t?(0,c.jsx)(t,{...e,children:(0,c.jsx)(l,{...e})}):l(e)}export{u as default};
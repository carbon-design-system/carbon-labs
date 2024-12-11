import{ae as e,af as r,ag as n,am as a}from"./index-DsT4f3B2.js";import{useMDXComponents as o}from"./index-Ca40sVGY.js";import{c,a as l}from"./storybook-cdn-BiPTSTB7.js";import{T as d}from"./tag.stories-zDEnamfW.js";import"./iframe-GiDawbIz.js";import"../sb-preview/runtime.js";import"./index-Bw5jCugi.js";import"./_commonjsHelpers-Cpj98o6Y.js";import"./index-D-8MO0q_.js";import"./index-BHYIh-Xd.js";import"./index-DrFu-skq.js";import"./property-C_111YFZ.js";import"./lit-element-in3Y6axH.js";import"./tooltip-content-8yyMOtGI.js";import"./carbon-element-ZG_lSGav.js";import"./directive-Bp-AemGL.js";import"./host-listener-BQQ0D0ZC.js";import"./query-BApjzB0v.js";import"./v4-CEA8o657.js";import"./stringify-DnirLPRY.js";const p="@carbon-labs/ai-tag",m="0.4.0",h={access:"public",provenance:!0},g="module",b="Carbon for AI - tag component",x="Apache-2.0",u={type:"git",url:"https://github.com/carbon-design-system/carbon-labs",directory:"packages/tag"},j="./src/index.js",f="./src/index.js",y={".":{default:"./src/index.js"},"./es/":"./es/"},k=["es/**/*","custom-elements.json"],v="./src/index.d.ts",C="custom-elements.json",T={build:"gulp build --option tag","build:dist":"rm -rf dist && rollup --config ../../../tasks/build-dist.js","build:dist:canary":"rm -rf dist && rollup --config ../../../tasks/build-dist.js --configCanary"},w={"@babel/core":"^7.26.0","@babel/runtime":"^7.23.2","@carbon-labs/utilities":"0.8.0","@carbon/grid":"^11.21.0","@carbon/web-components":"2.18.0"},D={name:p,version:m,publishConfig:h,type:g,description:b,license:x,repository:u,main:j,module:f,exports:y,files:k,types:v,customElements:C,scripts:T,dependencies:w};function i(s){const t={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",img:"img",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...o(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(r,{of:d}),`
`,e.jsx(t.h1,{id:"tag",children:"Tag"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Initiative owner(s):"})," Lily Peng, Daniel Karl I. Weidele"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Status:"})," Draft"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Target library:"})," TBD"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Target library maintainer(s) / PR Reviewer(s):"})," N/A"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Support channel:"})," ",e.jsx(t.code,{children:"#carbon-labs"})]}),`
`]}),`
`,e.jsxs(t.blockquote,{children:[`
`,e.jsxs(t.p,{children:[`💡 Check our
`,e.jsx(t.a,{href:"https://stackblitz.com/github/carbon-design-system/carbon-labs/tree/main/packages/tag/examples/tag",rel:"nofollow",children:"Stackblitz"}),`
example implementation.`]}),`
`]}),`
`,e.jsx(t.p,{children:e.jsx(t.a,{href:"https://stackblitz.com/github/carbon-design-system/carbon-labs/tree/main/packages/tag/examples/tag",rel:"nofollow",children:e.jsx(t.img,{src:"https://developer.stackblitz.com/img/open_in_stackblitz.svg",alt:"Edit carbon-labs"})})}),`
`,e.jsx(t.h2,{id:"overview",children:"Overview"}),`
`,e.jsx(t.p,{children:"The tag component."}),`
`,e.jsx(t.h2,{id:"getting-started",children:"Getting started"}),`
`,e.jsx(t.p,{children:"Here's a quick example to get you started."}),`
`,e.jsx(t.h3,{id:"js-via-import",children:"JS (via import)"}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-javascript",children:`import '@carbon-labs/ai-tag/es/index.js';
`})}),`
`,e.jsx(t.h3,{id:"styles",children:"Styles"}),`
`,e.jsxs(t.p,{children:["You'll also need to import the theming tokens from ",e.jsx(t.code,{children:"@carbon/styles"}),` either from
npm or from our CDN helpers. Checkout our Stackblitz example above to see how
that is implemented.`]}),`
`,e.jsx(n,{children:`${c({components:["tag"]},D)}`}),`
`,e.jsx(n,{children:`${l()}`}),`
`,e.jsx(t.h3,{id:"html",children:"HTML"}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-html",children:`<clabs-tag color="green" tooltip-position="bottom" tooltip-text="Tooltip text">
  Tag text
</clabs-tag>
`})}),`
`,e.jsx(t.h3,{id:"clabs-tag-attributes-and-properties",children:"<clabs-tag> attributes and properties"}),`
`,e.jsx(a,{of:"clabs-tag"})]})}function O(s={}){const{wrapper:t}={...o(),...s.components};return t?e.jsx(t,{...s,children:e.jsx(i,{...s})}):i(s)}export{O as default};

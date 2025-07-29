import{ae as e,af as r,ag as n,ah as l}from"./index-B5iBhMDf.js";import{useMDXComponents as o}from"./index-Ca40sVGY.js";import{c,a}from"./storybook-cdn-BiPTSTB7.js";import{T as p}from"./tag.stories-CsOV1F0z.js";import"./iframe-DUVCyxlo.js";import"../sb-preview/runtime.js";import"./index-Bw5jCugi.js";import"./_commonjsHelpers-Cpj98o6Y.js";import"./index-D-8MO0q_.js";import"./index-BHYIh-Xd.js";import"./index-DrFu-skq.js";import"./property-DRkoNOFH.js";import"./lit-element-CKvUdWNz.js";import"./tooltip-content-Cg9lpHE9.js";import"./class-map-BqTUllwo.js";import"./directive-CF8sV3Lr.js";import"./carbon-element-CIUZhCzP.js";import"./host-listener-BQQ0D0ZC.js";import"./query-BApjzB0v.js";import"./floating-ui.dom-ONm3Myz8.js";import"./v4-CEA8o657.js";import"./stringify-DnirLPRY.js";const m="@carbon-labs/wc-ai-tag",d="0.9.0",h={access:"public",provenance:!0},b="module",g="Carbon for AI - tag component",x="Apache-2.0",j={type:"git",url:"https://github.com/carbon-design-system/carbon-labs",directory:"packages/tag"},u={".":{default:"./src/index.js"},"./es/*":"./es/*","./lib/*":"./lib/*"},f=["es/","lib/","telemetry.yml"],y="./src/index.d.ts",k="custom-elements.json",v={build:"node ../../../tasks/build.js","build:dist":"rm -rf dist && rollup --config ../../../tasks/build-dist.js","build:dist:canary":"rm -rf dist && rollup --config ../../../tasks/build-dist.js --configCanary",clean:"rimraf es lib",postinstall:"ibmtelemetry --config=telemetry.yml"},w={"@babel/core":"^7.26.0","@babel/runtime":"^7.23.2","@carbon-labs/utilities":"0.8.0","@carbon/grid":"^11.21.0","@carbon/web-components":"2.21.0","@ibm/telemetry-js":"^1.9.1"},C={name:m,version:d,publishConfig:h,type:b,description:g,license:x,repository:j,exports:u,files:f,types:y,customElements:k,scripts:v,dependencies:w};function i(s){const t={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",img:"img",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...o(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(r,{of:p}),`
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
`,e.jsx(t.a,{href:"https://stackblitz.com/github/carbon-design-system/carbon-labs/tree/main/examples/web-components/tag",rel:"nofollow",children:"Stackblitz"}),`
example implementation.`]}),`
`]}),`
`,e.jsx(t.p,{children:e.jsx(t.a,{href:"https://stackblitz.com/github/carbon-design-system/carbon-labs/tree/main/examples/web-components/tag",rel:"nofollow",children:e.jsx(t.img,{src:"https://developer.stackblitz.com/img/open_in_stackblitz.svg",alt:"Edit carbon-labs"})})}),`
`,e.jsx(t.h2,{id:"overview",children:"Overview"}),`
`,e.jsx(t.p,{children:"The tag component."}),`
`,e.jsx(t.h2,{id:"getting-started",children:"Getting started"}),`
`,e.jsx(t.p,{children:"Here's a quick example to get you started."}),`
`,e.jsx(t.h3,{id:"js-via-import",children:"JS (via import)"}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-javascript",children:`import '@carbon-labs/wc-ai-tag/es/index.js';
`})}),`
`,e.jsx(t.h3,{id:"styles",children:"Styles"}),`
`,e.jsxs(t.p,{children:["You'll also need to import the theming tokens from ",e.jsx(t.code,{children:"@carbon/styles"}),` either from
npm or from our CDN helpers. Checkout our Stackblitz example above to see how
that is implemented.`]}),`
`,e.jsx(n,{children:`${c({components:["tag"]},C)}`}),`
`,e.jsx(n,{children:`${a()}`}),`
`,e.jsx(t.h3,{id:"html",children:"HTML"}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-html",children:`<clabs-tag color="green" tooltip-position="bottom" tooltip-text="Tooltip text">
  Tag text
</clabs-tag>
`})}),`
`,e.jsx(t.h3,{id:"clabs-tag-attributes-and-properties",children:"<clabs-tag> attributes and properties"}),`
`,e.jsx(l,{of:"clabs-tag"})]})}function O(s={}){const{wrapper:t}={...o(),...s.components};return t?e.jsx(t,{...s,children:e.jsx(i,{...s})}):i(s)}export{O as default};

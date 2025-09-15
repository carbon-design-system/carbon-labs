import{j as e,M as r,a as n,A as c}from"./blocks-Cd_Hdw_C.js";import{useMDXComponents as o}from"./index-BvpT5TrI.js";import{c as l,a}from"./storybook-cdn-BiPTSTB7.js";import{T as d}from"./tag.stories-C6I2OD7j.js";import"./preload-helper-C1FmrZbK.js";import"./iframe-CkL8vSd2.js";import"./property-7pMVgUUo.js";import"./definition-tooltip-CMnTnzWR.js";import"./carbon-element-sj_x7K4z.js";import"./directive-CF8sV3Lr.js";import"./host-listener-C4Ji6v3a.js";import"./state-DSNEehBx.js";import"./query-__j_ZMY6.js";const m="@carbon-labs/wc-ai-tag",p="0.14.0",h={access:"public",provenance:!0},b="module",g="Carbon for AI - tag component",x="Apache-2.0",j={type:"git",url:"https://github.com/carbon-design-system/carbon-labs",directory:"packages/tag"},u={".":{default:"./src/index.js"},"./es/*":"./es/*","./lib/*":"./lib/*"},f=["es/","lib/","telemetry.yml"],y="./src/index.d.ts",k="custom-elements.json",w={build:"node ../../../tasks/build.js","build:dist":"rm -rf dist && rollup --config ../../../tasks/build-dist.js","build:dist:canary":"rm -rf dist && rollup --config ../../../tasks/build-dist.js --configCanary",clean:"rimraf es lib",postinstall:"ibmtelemetry --config=telemetry.yml","telemetry:config":"npx -y @ibm/telemetry-js-config-generator generate --id 99a48c00-fd34-4267-80a4-935d08af5880 --endpoint https://www-api.ibm.com/ibm-telemetry/v1/metrics --files ./components/**/*.(ts|tsx|js|jsx) --wc"},v={"@babel/core":"^7.26.0","@babel/runtime":"^7.23.2","@carbon-labs/utilities":"0.8.0","@carbon/grid":"^11.41.0","@carbon/web-components":"2.36.0","@ibm/telemetry-js":"^1.10.2"},C={name:m,version:p,publishConfig:h,type:b,description:g,license:x,repository:j,exports:u,files:f,types:y,customElements:k,scripts:w,dependencies:v};function i(s){const t={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",img:"img",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...o(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(r,{of:d}),`
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
`,e.jsx(n,{children:`${l({components:["tag"]},C)}`}),`
`,e.jsx(n,{children:`${a()}`}),`
`,e.jsx(t.h3,{id:"html",children:"HTML"}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-html",children:`<clabs-tag color="green" tooltip-position="bottom" tooltip-text="Tooltip text">
  Tag text
</clabs-tag>
`})}),`
`,e.jsx(t.h3,{id:"clabs-tag-attributes-and-properties",children:"<clabs-tag> attributes and properties"}),`
`,e.jsx(c,{of:"clabs-tag"})]})}function R(s={}){const{wrapper:t}={...o(),...s.components};return t?e.jsx(t,{...s,children:e.jsx(i,{...s})}):i(s)}export{R as default};

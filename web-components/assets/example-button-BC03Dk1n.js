import{j as e,M as r,a as t,A as l}from"./blocks-9aG7tPCW.js";import{useMDXComponents as i}from"./index-Zz7u6lOy.js";import{c,a}from"./storybook-cdn-BiPTSTB7.js";import{E as p}from"./example-button.stories-Bhbj-gtk.js";import"./preload-helper-C1FmrZbK.js";import"./iframe-CeIA4b2P.js";import"./property-C_r0IKHD.js";import"./settings-BQP9c3yA.js";import"./button-lgHuZFI0.js";import"./carbon-element-nApjLhIj.js";import"./directive-CF8sV3Lr.js";import"./focus-CTzSG2uX.js";import"./host-listener-C4Ji6v3a.js";import"./16-DB8SMkqr.js";import"./spread-B9aFVDd4.js";const m="@carbon-labs/wc-example-button",d="0.9.0",b={access:"public",provenance:!0},h="Carbon Labs - example-button component",x="Apache-2.0",u={type:"git",url:"https://github.com/carbon-design-system/carbon-labs",directory:"packages/example-button"},j={".":{default:"./src/index.js"},"./es/*":"./es/*","./lib/*":"./lib/*"},g=["es/","lib/"],f="./src/index.d.ts",k="custom-elements.json",y={build:"node ../../../tasks/build.js","build:dist":"rm -rf dist && rollup --config ../../../tasks/build-dist.js","build:dist:canary":"rm -rf dist && rollup --config ../../../tasks/build-dist.js --configCanary",clean:"rimraf es lib"},v={"@babel/runtime":"^7.23.2","@carbon-labs/utilities":"0.17.0","@carbon/web-components":"2.36.0"},w={name:m,version:d,publishConfig:b,description:h,license:x,repository:u,exports:j,files:g,types:f,customElements:k,scripts:y,dependencies:v};function o(s){const n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",img:"img",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...i(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(r,{of:p}),`
`,e.jsx(n.h1,{id:"example-button",children:"Example Button"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Initiative owner(s):"})," FILL THIS LINE"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Status:"})," Draft"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Target library:"})," TBD"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Target library maintainer(s) / PR Reviewer(s):"})," N/A"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Support channel:"})," ",e.jsx(n.code,{children:"#carbon-labs"})]}),`
`]}),`
`,e.jsxs(n.blockquote,{children:[`
`,e.jsxs(n.p,{children:[`💡 Check our
`,e.jsx(n.a,{href:"https://stackblitz.com/github/carbon-design-system/carbon-labs/tree/main/examples/web-components/example-button",rel:"nofollow",children:"Stackblitz"}),`
example implementation.`]}),`
`]}),`
`,e.jsx(n.p,{children:e.jsx(n.a,{href:"https://stackblitz.com/github/carbon-design-system/carbon-labs/tree/main/examples/web-components/example-button",rel:"nofollow",children:e.jsx(n.img,{src:"https://developer.stackblitz.com/img/open_in_stackblitz.svg",alt:"Edit carbon-labs"})})}),`
`,e.jsx(n.h2,{id:"overview",children:"Overview"}),`
`,e.jsx(n.p,{children:"An example button component."}),`
`,e.jsx(n.h2,{id:"getting-started",children:"Getting started"}),`
`,e.jsx(n.p,{children:"Here's a quick example to get you started."}),`
`,e.jsx(n.h3,{id:"js-via-import",children:"JS (via import)"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-javascript",children:`import '@carbon-labs/wc-example-button/es/index.js';
`})}),`
`,e.jsx(n.h3,{id:"styles",children:"Styles"}),`
`,e.jsxs(n.p,{children:["You'll also need to import the theming tokens from ",e.jsx(n.code,{children:"@carbon/styles"}),` either from
npm or from our CDN helpers. Checkout our Stackblitz example above to see how
that is implemented.`]}),`
`,e.jsx(t,{children:`${c({components:["tag"]},w)}`}),`
`,e.jsx(t,{children:`${a()}`}),`
`,e.jsx(n.h3,{id:"html",children:"HTML"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-html",children:`<clabs-example-button> Example button </clabs-example-button>
`})}),`
`,e.jsx(n.h3,{id:"clabs-example-button-attributes-and-properties",children:"<clabs-example-button> attributes and properties"}),`
`,e.jsx(l,{of:"clabs-example-button"})]})}function J(s={}){const{wrapper:n}={...i(),...s.components};return n?e.jsx(n,{...s,children:e.jsx(o,{...s})}):o(s)}export{J as default};

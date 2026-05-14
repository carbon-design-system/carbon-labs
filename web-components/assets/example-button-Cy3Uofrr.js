import{D as e}from"./components-BilvaGtK.js";import{n as t,o as n,s as r}from"./blocks-DzEAPIn2.js";import{n as i}from"./lib-FWEvyWN8.js";import{n as a,t as o}from"./storybook-cdn-NiLDO3l0.js";import{t as s}from"./example-button.stories-DDYaftL0.js";var c=e(),l={name:`@carbon-labs/wc-example-button`,version:`0.24.0`,publishConfig:{access:`public`,provenance:!0},description:`Carbon Labs - example-button component`,license:`Apache-2.0`,repository:{type:`git`,url:`https://github.com/carbon-design-system/carbon-labs`,directory:`packages/example-button`},exports:{".":{default:`./src/index.js`},"./es/*":`./es/*`,"./lib/*":`./lib/*`},files:[`es/`,`lib/`],types:`./src/index.d.ts`,customElements:`custom-elements.json`,scripts:{build:`node ../../../tasks/build.js`,"build:dist":`rm -rf dist && rollup --config ../../../tasks/build-dist.js`,"build:dist:canary":`rm -rf dist && rollup --config ../../../tasks/build-dist.js --configCanary`,clean:`rimraf es lib`},dependencies:{"@babel/runtime":`^7.23.2`,"@carbon-labs/utilities":`0.27.0`,"@carbon/web-components":`^2.41.0`}};function u(e){let u={a:`a`,blockquote:`blockquote`,code:`code`,h1:`h1`,h2:`h2`,h3:`h3`,img:`img`,li:`li`,p:`p`,pre:`pre`,strong:`strong`,ul:`ul`,...i(),...e.components};return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(r,{of:s}),`
`,(0,c.jsx)(u.h1,{id:`example-button`,children:`Example Button`}),`
`,(0,c.jsxs)(u.ul,{children:[`
`,(0,c.jsxs)(u.li,{children:[(0,c.jsx)(u.strong,{children:`Initiative owner(s):`}),` FILL THIS LINE`]}),`
`,(0,c.jsxs)(u.li,{children:[(0,c.jsx)(u.strong,{children:`Status:`}),` Draft`]}),`
`,(0,c.jsxs)(u.li,{children:[(0,c.jsx)(u.strong,{children:`Target library:`}),` TBD`]}),`
`,(0,c.jsxs)(u.li,{children:[(0,c.jsx)(u.strong,{children:`Target library maintainer(s) / PR Reviewer(s):`}),` N/A`]}),`
`,(0,c.jsxs)(u.li,{children:[(0,c.jsx)(u.strong,{children:`Support channel:`}),` `,(0,c.jsx)(u.code,{children:`#carbon-labs`})]}),`
`]}),`
`,(0,c.jsxs)(u.blockquote,{children:[`
`,(0,c.jsxs)(u.p,{children:[`💡 Check our
`,(0,c.jsx)(u.a,{href:`https://stackblitz.com/github/carbon-design-system/carbon-labs/tree/main/examples/web-components/example-button`,rel:`nofollow`,children:`Stackblitz`}),`
example implementation.`]}),`
`]}),`
`,(0,c.jsx)(u.p,{children:(0,c.jsx)(u.a,{href:`https://stackblitz.com/github/carbon-design-system/carbon-labs/tree/main/examples/web-components/example-button`,rel:`nofollow`,children:(0,c.jsx)(u.img,{src:`https://developer.stackblitz.com/img/open_in_stackblitz.svg`,alt:`Edit carbon-labs`})})}),`
`,(0,c.jsx)(u.h2,{id:`overview`,children:`Overview`}),`
`,(0,c.jsx)(u.p,{children:`An example button component.`}),`
`,(0,c.jsx)(u.h2,{id:`getting-started`,children:`Getting started`}),`
`,(0,c.jsx)(u.p,{children:`Here's a quick example to get you started.`}),`
`,(0,c.jsx)(u.h3,{id:`js-via-import`,children:`JS (via import)`}),`
`,(0,c.jsx)(u.pre,{children:(0,c.jsx)(u.code,{className:`language-javascript`,children:`import '@carbon-labs/wc-example-button/es/index.js';
`})}),`
`,(0,c.jsx)(u.h3,{id:`styles`,children:`Styles`}),`
`,(0,c.jsxs)(u.p,{children:[`You'll also need to import the theming tokens from `,(0,c.jsx)(u.code,{children:`@carbon/styles`}),` either from
npm or from our CDN helpers. Checkout our Stackblitz example above to see how
that is implemented.`]}),`
`,(0,c.jsx)(n,{children:`${a({components:[`tag`]},l)}`}),`
`,(0,c.jsx)(n,{children:`${o()}`}),`
`,(0,c.jsx)(u.h3,{id:`html`,children:`HTML`}),`
`,(0,c.jsx)(u.pre,{children:(0,c.jsx)(u.code,{className:`language-html`,children:`<clabs-example-button> Example button </clabs-example-button>
`})}),`
`,(0,c.jsx)(u.h3,{id:`clabs-example-button-attributes-and-properties`,children:`<clabs-example-button> attributes and properties`}),`
`,(0,c.jsx)(t,{of:`clabs-example-button`})]})}function d(e={}){let{wrapper:t}={...i(),...e.components};return t?(0,c.jsx)(t,{...e,children:(0,c.jsx)(u,{...e})}):u(e)}export{d as default};
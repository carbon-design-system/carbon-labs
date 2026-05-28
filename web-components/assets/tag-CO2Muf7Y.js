import{c as e,h as t,n,s as r}from"./blocks-BDcux037.js";import{n as i}from"./lib-C7M-_RVu.js";import{n as a,t as o}from"./storybook-cdn-Dt1Yo-ue.js";import s from"./tag.stories-CGEYjEQ_.js";var c=t(),l={name:`@carbon-labs/wc-ai-tag`,version:`0.26.0`,publishConfig:{access:`public`,provenance:!0},type:`module`,description:`Carbon for AI - tag component`,license:`Apache-2.0`,repository:{type:`git`,url:`https://github.com/carbon-design-system/carbon-labs`,directory:`packages/tag`},exports:{".":{default:`./src/index.js`},"./es/*":`./es/*`,"./lib/*":`./lib/*`},files:[`es/`,`lib/`,`telemetry.yml`],types:`./src/index.d.ts`,customElements:`custom-elements.json`,scripts:{build:`node ../../../tasks/build.js`,"build:dist":`rm -rf dist && rollup --config ../../../tasks/build-dist.js`,"build:dist:canary":`rm -rf dist && rollup --config ../../../tasks/build-dist.js --configCanary`,clean:`rimraf es lib`,postinstall:`ibmtelemetry --config=telemetry.yml`,"telemetry:config":`npx -y @ibm/telemetry-js-config-generator generate --id 99a48c00-fd34-4267-80a4-935d08af5880 --endpoint https://www-api.ibm.com/ibm-telemetry/v1/metrics --files ./components/**/*.(ts|tsx|js|jsx) --wc`},dependencies:{"@babel/core":`^7.26.0`,"@babel/runtime":`^7.23.2`,"@carbon-labs/utilities":`0.28.0`,"@carbon/grid":`^11.45.0`,"@carbon/web-components":`^2.41.0`,"@ibm/telemetry-js":`^1.10.2`}};function u(t){let u={a:`a`,blockquote:`blockquote`,code:`code`,h1:`h1`,h2:`h2`,h3:`h3`,img:`img`,li:`li`,p:`p`,pre:`pre`,strong:`strong`,ul:`ul`,...i(),...t.components};return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(e,{of:s}),`
`,(0,c.jsx)(u.h1,{id:`tag`,children:`Tag`}),`
`,(0,c.jsxs)(u.ul,{children:[`
`,(0,c.jsxs)(u.li,{children:[(0,c.jsx)(u.strong,{children:`Initiative owner(s):`}),` Lily Peng, Daniel Karl I. Weidele`]}),`
`,(0,c.jsxs)(u.li,{children:[(0,c.jsx)(u.strong,{children:`Status:`}),` Draft`]}),`
`,(0,c.jsxs)(u.li,{children:[(0,c.jsx)(u.strong,{children:`Target library:`}),` TBD`]}),`
`,(0,c.jsxs)(u.li,{children:[(0,c.jsx)(u.strong,{children:`Target library maintainer(s) / PR Reviewer(s):`}),` N/A`]}),`
`,(0,c.jsxs)(u.li,{children:[(0,c.jsx)(u.strong,{children:`Support channel:`}),` `,(0,c.jsx)(u.code,{children:`#carbon-labs`})]}),`
`]}),`
`,(0,c.jsxs)(u.blockquote,{children:[`
`,(0,c.jsxs)(u.p,{children:[`💡 Check our
`,(0,c.jsx)(u.a,{href:`https://stackblitz.com/github/carbon-design-system/carbon-labs/tree/main/examples/web-components/tag`,rel:`nofollow`,children:`Stackblitz`}),`
example implementation.`]}),`
`]}),`
`,(0,c.jsx)(u.p,{children:(0,c.jsx)(u.a,{href:`https://stackblitz.com/github/carbon-design-system/carbon-labs/tree/main/examples/web-components/tag`,rel:`nofollow`,children:(0,c.jsx)(u.img,{src:`https://developer.stackblitz.com/img/open_in_stackblitz.svg`,alt:`Edit carbon-labs`})})}),`
`,(0,c.jsx)(u.h2,{id:`overview`,children:`Overview`}),`
`,(0,c.jsx)(u.p,{children:`The tag component.`}),`
`,(0,c.jsx)(u.h2,{id:`getting-started`,children:`Getting started`}),`
`,(0,c.jsx)(u.p,{children:`Here's a quick example to get you started.`}),`
`,(0,c.jsx)(u.h3,{id:`js-via-import`,children:`JS (via import)`}),`
`,(0,c.jsx)(u.pre,{children:(0,c.jsx)(u.code,{className:`language-javascript`,children:`import '@carbon-labs/wc-ai-tag/es/index.js';
`})}),`
`,(0,c.jsx)(u.h3,{id:`styles`,children:`Styles`}),`
`,(0,c.jsxs)(u.p,{children:[`You'll also need to import the theming tokens from `,(0,c.jsx)(u.code,{children:`@carbon/styles`}),` either from
npm or from our CDN helpers. Checkout our Stackblitz example above to see how
that is implemented.`]}),`
`,(0,c.jsx)(r,{children:`${a({components:[`tag`]},l)}`}),`
`,(0,c.jsx)(r,{children:`${o()}`}),`
`,(0,c.jsx)(u.h3,{id:`html`,children:`HTML`}),`
`,(0,c.jsx)(u.pre,{children:(0,c.jsx)(u.code,{className:`language-html`,children:`<clabs-tag color="green" tooltip-position="bottom" tooltip-text="Tooltip text">
  Tag text
</clabs-tag>
`})}),`
`,(0,c.jsx)(u.h3,{id:`clabs-tag-attributes-and-properties`,children:`<clabs-tag> attributes and properties`}),`
`,(0,c.jsx)(n,{of:`clabs-tag`})]})}function d(e={}){let{wrapper:t}={...i(),...e.components};return t?(0,c.jsx)(t,{...e,children:(0,c.jsx)(u,{...e})}):u(e)}export{d as default};
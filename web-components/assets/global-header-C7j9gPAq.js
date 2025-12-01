import{j as e,M as o}from"./blocks-MDDuFbDx.js";import{useMDXComponents as s}from"./index-gcy1ll8l.js";import{G as t}from"./global-header.stories-CbaoL3vL.js";import"./preload-helper-C1FmrZbK.js";import"./iframe-CIKSZ7a5.js";import"./property-CDz1SCgH.js";import"./settings-BQP9c3yA.js";import"./CommonHeader-D7f6gldX.js";import"./state-Ci8vx4Lq.js";import"./class-map-DHYCQnKN.js";import"./directive-CJw_OlP2.js";import"./shared-enums-ChX5bphC.js";import"./if-defined-BF2l3oUO.js";import"./16-0wsGWJU-.js";import"./16-Dc1ce3EM.js";import"./16-Chi-4lpJ.js";import"./16-Cr2pWCY7.js";import"./index-C3nV9oXV.js";import"./query-BApjzB0v.js";import"./floating-ui.dom-Wp8I_6Nc.js";import"./constant-DbOwpvYQ.js";import"./async-directive-DYRhWwIV.js";import"./HybridIpaasHeader-EHsv1Oxv.js";import"./LogoutHeader-D-HKrLvK.js";import"./LogoutTile-VNCHvZIj.js";function a(n){const r={a:"a",code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...s(),...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(o,{of:t}),`
`,e.jsx(r.h1,{id:"global-header",children:"Global Header"}),`
`,e.jsxs(r.ul,{children:[`
`,e.jsxs(r.li,{children:[e.jsx(r.strong,{children:"Initiative owner(s):"})," Matt Chapman"]}),`
`,e.jsxs(r.li,{children:[e.jsx(r.strong,{children:"Status:"})," Draft"]}),`
`,e.jsxs(r.li,{children:[e.jsx(r.strong,{children:"Target library:"})," TBD"]}),`
`,e.jsxs(r.li,{children:[e.jsx(r.strong,{children:"Target library maintainer(s) / PR Reviewer(s):"})," Matt Chapman, Sarah Hewitt, Allan Hurworth, Rory Mullan"]}),`
`,e.jsxs(r.li,{children:[e.jsx(r.strong,{children:"Support channel:"})," ",e.jsx(r.code,{children:"#carbon-labs"})]}),`
`]}),`
`,e.jsx(r.h2,{id:"overview",children:"Overview"}),`
`,e.jsxs(r.p,{children:["This component is an implementation of the Carbon ",e.jsx(r.a,{href:"https://carbondesignsystem.com/patterns/global-header/",rel:"nofollow",children:"Global header"})," pattern."]}),`
`,e.jsxs(r.p,{children:["It uses the Carbon ",e.jsx(r.a,{href:"https://carbondesignsystem.com/components/UI-shell-header/usage/",rel:"nofollow",children:"UI Shell"})," component."]}),`
`,e.jsx(r.h2,{id:"getting-started",children:"Getting started"}),`
`,e.jsx(r.p,{children:"Here's a quick example to get you started."}),`
`,e.jsx(r.h3,{id:"js-via-import",children:"JS (via import)"}),`
`,e.jsx(r.pre,{children:e.jsx(r.code,{className:"language-javascript",children:`import '@carbon-labs/wc-global-header';
`})}),`
`,e.jsx(r.h3,{id:"html",children:"HTML"}),`
`,e.jsxs(r.p,{children:["For the base global header component ",e.jsx(r.code,{children:"clabs-global-header-apaas"})," you first define your header properties in an object, for example:"]}),`
`,e.jsx(r.pre,{children:e.jsx(r.code,{className:"language-js",children:`const headerProps = {
    brand: {
    company: 'IBM',
    product: 'Platform'
  },
  noAuthHeaderLinks: [
    {
      href: '/login',
      text: 'Log in',
      carbonIcon: 'Login',
      arialLabel: 'Log in'
    }
  ]
}
`})}),`
`,e.jsx(r.p,{children:"This is then passed to the custom element, like this if using the Lit framework:"}),`
`,e.jsx(r.pre,{children:e.jsx(r.code,{className:"language-html",children:'html`<clabs-global-header-apaas .headerProps="${headerProps}"></clabs-global-header-apaas>`\n'})}),`
`,e.jsx(r.p,{children:"Or like this from an Angular app:"}),`
`,e.jsx(r.pre,{children:e.jsx(r.code,{className:"language-html",children:`<clabs-global-header-apaas [headerProps]="headerProps"></clabs-global-header-apaas>
`})}),`
`,e.jsxs(r.p,{children:["There is also a higher level component called ",e.jsx(r.code,{children:"clabs-global-header-hybrid-ipaas"}),` which wraps the base component. It makes a
backend call to a route called `,e.jsx(r.code,{children:"/hybrid-ipaas/v1/header/options"})," and uses the response from that as the ",e.jsx(r.code,{children:"headerProps"}),` into the
base component. For example:`]}),`
`,e.jsx(r.pre,{children:e.jsx(r.code,{className:"language-html",children:`<clabs-global-header-hybrid-ipaas productName="My Product" productKey="productkey"></clabs-global-header-hybrid-ipaas>
`})}),`
`,e.jsxs(r.p,{children:["As above the wrapper component supports some properties like ",e.jsx(r.code,{children:"productName"}),` so that a basic form of the header can be rendered until the
backend options call returns.`]})]})}function S(n={}){const{wrapper:r}={...s(),...n.components};return r?e.jsx(r,{...n,children:e.jsx(a,{...n})}):a(n)}export{S as default};

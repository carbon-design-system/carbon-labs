import{c as e,h as t}from"./blocks-BDcux037.js";import{n}from"./lib-C7M-_RVu.js";import r from"./global-header.stories-BukS__7i.js";var i=t();function a(t){let a={a:`a`,code:`code`,h1:`h1`,h2:`h2`,h3:`h3`,li:`li`,p:`p`,pre:`pre`,strong:`strong`,ul:`ul`,...n(),...t.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(e,{of:r}),`
`,(0,i.jsx)(a.h1,{id:`global-header`,children:`Global Header`}),`
`,(0,i.jsxs)(a.ul,{children:[`
`,(0,i.jsxs)(a.li,{children:[(0,i.jsx)(a.strong,{children:`Initiative owner(s):`}),` Matt Chapman`]}),`
`,(0,i.jsxs)(a.li,{children:[(0,i.jsx)(a.strong,{children:`Status:`}),` Draft`]}),`
`,(0,i.jsxs)(a.li,{children:[(0,i.jsx)(a.strong,{children:`Target library:`}),` TBD`]}),`
`,(0,i.jsxs)(a.li,{children:[(0,i.jsx)(a.strong,{children:`Target library maintainer(s) / PR Reviewer(s):`}),` Matt Chapman, Sarah Hewitt, Allan Hurworth, Rory Mullan`]}),`
`,(0,i.jsxs)(a.li,{children:[(0,i.jsx)(a.strong,{children:`Support channel:`}),` `,(0,i.jsx)(a.code,{children:`#carbon-labs`})]}),`
`]}),`
`,(0,i.jsx)(a.h2,{id:`overview`,children:`Overview`}),`
`,(0,i.jsxs)(a.p,{children:[`This component is an implementation of the Carbon `,(0,i.jsx)(a.a,{href:`https://carbondesignsystem.com/patterns/global-header/`,rel:`nofollow`,children:`Global header`}),` pattern.`]}),`
`,(0,i.jsxs)(a.p,{children:[`It uses the Carbon `,(0,i.jsx)(a.a,{href:`https://carbondesignsystem.com/components/UI-shell-header/usage/`,rel:`nofollow`,children:`UI Shell`}),` component.`]}),`
`,(0,i.jsx)(a.h2,{id:`getting-started`,children:`Getting started`}),`
`,(0,i.jsx)(a.p,{children:`Here's a quick example to get you started.`}),`
`,(0,i.jsx)(a.h3,{id:`js-via-import`,children:`JS (via import)`}),`
`,(0,i.jsx)(a.pre,{children:(0,i.jsx)(a.code,{className:`language-javascript`,children:`import '@carbon-labs/wc-global-header';
`})}),`
`,(0,i.jsx)(a.h3,{id:`html`,children:`HTML`}),`
`,(0,i.jsxs)(a.p,{children:[`For the base global header component `,(0,i.jsx)(a.code,{children:`clabs-global-header-apaas`}),` you first define your header properties in an object, for example:`]}),`
`,(0,i.jsx)(a.pre,{children:(0,i.jsx)(a.code,{className:`language-js`,children:`const headerProps = {
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
`,(0,i.jsx)(a.p,{children:`This is then passed to the custom element, like this if using the Lit framework:`}),`
`,(0,i.jsx)(a.pre,{children:(0,i.jsx)(a.code,{className:`language-html`,children:'html`<clabs-global-header-apaas .headerProps="${headerProps}"></clabs-global-header-apaas>`\n'})}),`
`,(0,i.jsx)(a.p,{children:`Or like this from an Angular app:`}),`
`,(0,i.jsx)(a.pre,{children:(0,i.jsx)(a.code,{className:`language-html`,children:`<clabs-global-header-apaas [headerProps]="headerProps"></clabs-global-header-apaas>
`})}),`
`,(0,i.jsxs)(a.p,{children:[`There is also a higher level component called `,(0,i.jsx)(a.code,{children:`clabs-global-header-hybrid-ipaas`}),` which wraps the base component. It makes a
backend call to a route called `,(0,i.jsx)(a.code,{children:`/hybrid-ipaas/v1/header/options`}),` and uses the response from that as the `,(0,i.jsx)(a.code,{children:`headerProps`}),` into the
base component. For example:`]}),`
`,(0,i.jsx)(a.pre,{children:(0,i.jsx)(a.code,{className:`language-html`,children:`<clabs-global-header-hybrid-ipaas productName="My Product" productKey="productkey"></clabs-global-header-hybrid-ipaas>
`})}),`
`,(0,i.jsxs)(a.p,{children:[`As above the wrapper component supports some properties like `,(0,i.jsx)(a.code,{children:`productName`}),` so that a basic form of the header can be rendered until the
backend options call returns.`]})]})}function o(e={}){let{wrapper:t}={...n(),...e.components};return t?(0,i.jsx)(t,{...e,children:(0,i.jsx)(a,{...e})}):a(e)}export{o as default};
import{j as e,M as r,C as o}from"./blocks-D6aHBM5x.js";import{useMDXComponents as s}from"./index-B4W6Q4iv.js";import{F as a,a as c}from"./FirstTimeOrientation.stories-Dtia1a8-.js";import"./preload-helper-C1FmrZbK.js";import"./iframe-CaJcJN16.js";function i(n){const t={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",img:"img",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...s(),...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(r,{of:a}),`
`,e.jsx(t.h1,{id:"first-time-orientation-pattern",children:"First-time orientation pattern"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Initiative owner(s):"})," Carbon"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Target library maintainer(s) / PR Reviewer(s):"})," Carbon"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Support channel:"})," ",e.jsx(t.code,{children:"#carbon-labs"})]}),`
`]}),`
`,`
`,`
`,e.jsxs(t.blockquote,{children:[`
`,e.jsx(t.p,{children:"💡 Check this out in Stackblitz"}),`
`]}),`
`,e.jsx(t.p,{children:e.jsx(t.a,{href:"https://stackblitz.com/github/carbon-design-system/carbon-labs/tree/main/examples/web-components/first-time-orientation",rel:"nofollow",children:e.jsx(t.img,{src:"https://developer.stackblitz.com/img/open_in_stackblitz.svg",alt:"Open in Stackblitz"})})}),`
`,e.jsx(t.h2,{id:"overview",children:"Overview"}),`
`,e.jsxs(t.p,{children:["The first-time orientation pattern is built using  ",e.jsx(t.a,{href:"https://ibm-products-web-components.carbondesignsystem.com/?path=/docs/components-interstitialscreen--overview",rel:"nofollow",children:"InterstitialScreen component"})," component from ",e.jsx(t.code,{children:"@carbon/ibm-products-web-components"}),`
of the Carbon for IBM Product's library.`]}),`
`,e.jsxs(t.p,{children:[`First-time orientation happens from the moment a user gains access to the product, post login, and guides them to realizing the product’s primary value.
The pattern consist of a welcome interstitial and a personalization interstitial. Personalization interstitial uses SelectableTag from Carbon. You can find more details in our `,e.jsx(t.a,{href:"https://pages.github.ibm.com/carbon/ibm-products/patterns/onboarding-flows/orientation/usage/",rel:"nofollow",children:"website"}),"."]}),`
`,e.jsx(o,{of:c}),`
`,e.jsx(t.h2,{id:"getting-started",children:"Getting started"}),`
`,e.jsx(t.p,{children:"Here's a quick example to get you started."}),`
`,e.jsx(t.h3,{id:"html",children:"HTML"}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-html",children:`<c4p-interstitial-screen
  ?open=\${true}
  @c4p-interstitial-opened=\${(e) => {
    console.log('event initialize', e.detail);
  }}
  @c4p-interstitial-closed=\${this.handleClose}
>
  <style>
    c4p-interstitial-screen-body {
      block-size: 28rem;
      display: flex;
    }
  </style>

  <c4p-interstitial-screen-header
    header-title="Use case-specific title"
    header-subtitle="Use case-specific sub title"
  ></c4p-interstitial-screen-header>

  <c4p-interstitial-screen-body>
    <c4p-interstitial-screen-body-item stepTitle="Welcome" id="\${1}">
      <welcome-interstitial />
    </c4p-interstitial-screen-body-item>

    <c4p-interstitial-screen-body-item stepTitle="Tailor your experience" id="\${2}">
      <personalization-interstitial />
    </c4p-interstitial-screen-body-item>
  </c4p-interstitial-screen-body>

  <c4p-interstitial-screen-footer></c4p-interstitial-screen-footer>
</c4p-interstitial-screen>


`})})]})}function b(n={}){const{wrapper:t}={...s(),...n.components};return t?e.jsx(t,{...n,children:e.jsx(i,{...n})}):i(n)}export{b as default};

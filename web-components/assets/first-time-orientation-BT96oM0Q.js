import{c as e,h as t,r as n}from"./blocks-DP4lMxyk.js";import{n as r}from"./lib-DXzy2btU.js";import i,{FirstTimeOrientation as a}from"./first-time-orientation.stories-BHqPabIs.js";var o=t();function s(t){let s={a:`a`,blockquote:`blockquote`,code:`code`,h1:`h1`,h2:`h2`,h3:`h3`,img:`img`,li:`li`,p:`p`,pre:`pre`,strong:`strong`,ul:`ul`,...r(),...t.components};return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(e,{of:i}),`
`,(0,o.jsx)(s.h1,{id:`first-time-orientation-pattern`,children:`First-time orientation pattern`}),`
`,(0,o.jsxs)(s.ul,{children:[`
`,(0,o.jsxs)(s.li,{children:[(0,o.jsx)(s.strong,{children:`Initiative owner(s):`}),` Carbon`]}),`
`,(0,o.jsxs)(s.li,{children:[(0,o.jsx)(s.strong,{children:`Target library maintainer(s) / PR Reviewer(s):`}),` Carbon`]}),`
`,(0,o.jsxs)(s.li,{children:[(0,o.jsx)(s.strong,{children:`Support channel:`}),` `,(0,o.jsx)(s.code,{children:`#carbon-labs`})]}),`
`]}),`
`,`
`,`
`,(0,o.jsxs)(s.blockquote,{children:[`
`,(0,o.jsx)(s.p,{children:`💡 Check this out in Stackblitz`}),`
`]}),`
`,(0,o.jsx)(s.p,{children:(0,o.jsx)(s.a,{href:`https://stackblitz.com/github/carbon-design-system/carbon-labs/tree/main/examples/web-components/first-time-orientation`,rel:`nofollow`,children:(0,o.jsx)(s.img,{src:`https://developer.stackblitz.com/img/open_in_stackblitz.svg`,alt:`Open in Stackblitz`})})}),`
`,(0,o.jsx)(s.h2,{id:`overview`,children:`Overview`}),`
`,(0,o.jsxs)(s.p,{children:[`The first-time orientation pattern is built using  `,(0,o.jsx)(s.a,{href:`https://ibm-products-web-components.carbondesignsystem.com/?path=/docs/components-interstitialscreen--overview`,rel:`nofollow`,children:`InterstitialScreen component`}),` component from `,(0,o.jsx)(s.code,{children:`@carbon/ibm-products-web-components`}),`
of the Carbon for IBM Product's library.`]}),`
`,(0,o.jsxs)(s.p,{children:[`First-time orientation happens from the moment a user gains access to the product, post login, and guides them to realizing the product’s primary value.
The pattern consist of a welcome interstitial and a personalization interstitial. Personalization interstitial uses SelectableTag from Carbon. You can find more details in our `,(0,o.jsx)(s.a,{href:`https://pages.github.ibm.com/carbon/ibm-products/patterns/onboarding-flows/orientation/usage/`,rel:`nofollow`,children:`website`}),`.`]}),`
`,(0,o.jsx)(n,{of:a}),`
`,(0,o.jsx)(s.h2,{id:`getting-started`,children:`Getting started`}),`
`,(0,o.jsx)(s.p,{children:`Here's a quick example to get you started.`}),`
`,(0,o.jsx)(s.h3,{id:`html`,children:`HTML`}),`
`,(0,o.jsx)(s.pre,{children:(0,o.jsx)(s.code,{className:`language-html`,children:`<c4p-interstitial-screen
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


`})})]})}function c(e={}){let{wrapper:t}={...r(),...e.components};return t?(0,o.jsx)(t,{...e,children:(0,o.jsx)(s,{...e})}):s(e)}export{c as default};
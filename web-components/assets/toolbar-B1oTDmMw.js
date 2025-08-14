import{ae as n,af as a,ai as e}from"./index-C_lfvzuB.js";import{useMDXComponents as i}from"./index-Ca40sVGY.js";import{T as r,H as l,V as c}from"./toolbar.stories-BfiPJ-BQ.js";import"./iframe-Bm9zNywc.js";import"../sb-preview/runtime.js";import"./index-Bw5jCugi.js";import"./_commonjsHelpers-Cpj98o6Y.js";import"./index-D-8MO0q_.js";import"./index-BHYIh-Xd.js";import"./index-DrFu-skq.js";import"./lit-element-CKvUdWNz.js";import"./property-DRkoNOFH.js";import"./query-BApjzB0v.js";import"./class-map-BqTUllwo.js";import"./directive-CF8sV3Lr.js";import"./carbon-element-CIUZhCzP.js";import"./16-DdNnqdvJ.js";import"./tooltip-content-Cg9lpHE9.js";import"./host-listener-BQQ0D0ZC.js";import"./floating-ui.dom-ONm3Myz8.js";import"./button-CGwuyTGo.js";import"./if-defined-BxoUCaaX.js";import"./focus-luVSiChZ.js";import"./16-CS43kSdL.js";import"./spread-Cnb5k-G6.js";import"./dropdown-skeleton-BQjob6ha.js";import"./state-BaIcuqWU.js";import"./collection-helpers-ByYSmH3E.js";import"./shared-enums-BbJtsk5y.js";import"./overflow-menu-item-DgfnOpkD.js";import"./16-DVKUkZg8.js";function s(o){const t={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",img:"img",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...i(),...o.components};return n.jsxs(n.Fragment,{children:[n.jsx(a,{of:r}),`
`,n.jsx(t.h1,{id:"toolbar",children:"Toolbar"}),`
`,n.jsxs(t.ul,{children:[`
`,n.jsxs(t.li,{children:[n.jsx(t.strong,{children:"Initiative owner(s):"})," Carbon for IBM Products"]}),`
`,n.jsxs(t.li,{children:[n.jsx(t.strong,{children:"Status:"})," Draft"]}),`
`,n.jsxs(t.li,{children:[n.jsx(t.strong,{children:"Target library:"})," TBD"]}),`
`,n.jsxs(t.li,{children:[n.jsx(t.strong,{children:"Target library maintainer(s) / PR Reviewer(s):"})," N/A"]}),`
`,n.jsxs(t.li,{children:[n.jsx(t.strong,{children:"Support channel:"})," ",n.jsx(t.code,{children:"#carbon-labs"})]}),`
`]}),`
`,n.jsxs(t.blockquote,{children:[`
`,n.jsxs(t.p,{children:[`💡 Check our
`,n.jsx(t.a,{href:"https://stackblitz.com/github/carbon-design-system/carbon-labs/tree/main/examples/web-components/toolbar",rel:"nofollow",children:"Stackblitz"}),`
example implementation.`]}),`
`]}),`
`,n.jsx(t.p,{children:n.jsx(t.a,{href:"https://stackblitz.com/github/carbon-design-system/carbon-labs/tree/main/examples/web-components/toolbar",rel:"nofollow",children:n.jsx(t.img,{src:"https://developer.stackblitz.com/img/open_in_stackblitz.svg",alt:"Edit carbon-labs"})})}),`
`,n.jsx(t.h2,{id:"overview",children:"Overview"}),`
`,n.jsx(t.p,{children:"The toolbar pattern. made with carbon design system's web components."}),`
`,n.jsx(t.p,{children:n.jsx(t.a,{href:"https://carbondesignsystem.com/patterns/text-toolbar-pattern/",rel:"nofollow",children:"Pattern Guidance"})}),`
`,n.jsx(t.p,{children:"To build this pattern, we recommend including the following components:"}),`
`,n.jsxs(t.ul,{children:[`
`,n.jsx(t.li,{children:n.jsx(t.a,{href:"https://web-components.carbondesignsystem.com/?path=/docs/layout-stack",rel:"nofollow",children:"cds-stack"})}),`
`,n.jsx(t.li,{children:n.jsx(t.a,{href:"https://web-components.carbondesignsystem.com/?path=/docs/components-icon-button",rel:"nofollow",children:"cds-icon-button"})}),`
`,n.jsx(t.li,{children:n.jsx(t.a,{href:"https://web-components.carbondesignsystem.com/?path=/docs/components-dropdown",rel:"nofollow",children:"cds-dropdown"})}),`
`,n.jsx(t.li,{children:n.jsx(t.a,{href:"https://web-components.carbondesignsystem.com/?path=/docs/components-overflow-menu",rel:"nofollow",children:"cds-overflow-menu"})}),`
`]}),`
`,n.jsxs(t.p,{children:["These components are used within an ",n.jsx(t.code,{children:"clabs-toolbar"}),` wrapper component provided
as an example to handle state management and some pattern specific behaviors.`]}),`
`,n.jsx(t.h4,{id:"horizontal-example",children:"Horizontal Example"}),`
`,n.jsx(e,{of:l}),`
`,n.jsx(t.h4,{id:"vertical-example",children:"Vertical Example"}),`
`,n.jsx(e,{of:c}),`
`,n.jsx(t.h2,{id:"getting-started",children:"Getting started"}),`
`,n.jsx(t.p,{children:"Here's a quick example to get you started."}),`
`,n.jsx(t.h3,{id:"html",children:"HTML"}),`
`,n.jsx(t.pre,{children:n.jsx(t.code,{className:"language-html",children:`<cds-stack class="toolbar" orientation=\${this.orientation}>
  <cds-stack class="toolbar-group" orientation=\${this.orientation}>
    <cds-icon-button
    kind="ghost"
    enter-delay-ms="100"
      leave-delay-ms="100"
      align=\${this.orientation === 'vertical' ? 'right' : 'top'}>
      \${Draggable({ slot: 'icon' })}
      <span slot="tooltip-content">Drag</span>
    </cds-icon-button>
  </cds-stack class="toolbar-group">
  <cds-stack class="toolbar-group" orientation=\${this.orientation}>
    <cds-icon-button
    kind="ghost"
    enter-delay-ms="100"
      leave-delay-ms="100"
      align=\${this.orientation === 'vertical' ? 'right' : 'top'}>
      \${RulerAlt({ slot: 'icon' })}
      <span slot="tooltip-content">Ruler</span>
    </cds-icon-button>
    <cds-icon-button
    kind="ghost"
    enter-delay-ms="100"
      leave-delay-ms="100"
      align=\${this.orientation === 'vertical' ? 'right' : 'top'}>
      \${Pin({ slot: 'icon' })}
      <span slot="tooltip-content">Pin</span>
    </cds-icon-button>
    <cds-icon-button
    kind="ghost"
    enter-delay-ms="100"
      leave-delay-ms="100"
      caret
      align=\${this.orientation === 'vertical' ? 'right' : 'top'}>
      \${ColorPalette({ slot: 'icon' })}
      <span slot="tooltip-content">Color palette</span>
    </cds-icon-button>
    <cds-icon-button
    kind="ghost"
    enter-delay-ms="100"
      leave-delay-ms="100"
      align=\${this.orientation === 'vertical' ? 'right' : 'top'}>
      \${TextCreation({ slot: 'icon' })}
      <span slot="tooltip-content">Text creation</span>
    </cds-icon-button>
  </cds-stack class="toolbar-group">
  <cds-stack class="toolbar-group" orientation=\${this.orientation}>
    <cds-icon-button
    kind="ghost"
    enter-delay-ms="100"
      leave-delay-ms="100"
      align=\${this.orientation === 'vertical' ? 'right' : 'top'}>
      \${OpenPanelLeft({ slot: 'icon' })}
      <span slot="tooltip-content">Open panel left</span>
    </cds-icon-button>
    <cds-icon-button
    kind="ghost"
    enter-delay-ms="100"
      leave-delay-ms="100"
      align=\${this.orientation === 'vertical' ? 'right' : 'top'}>
      \${OpenPanelRight({ slot: 'icon' })}
      <span slot="tooltip-content">Open panel right</span>
    </cds-icon-button>
  </cds-stack class="toolbar-group">
  <cds-stack class="toolbar-group" orientation=\${this.orientation}>
    <cds-icon-button
    kind="ghost"
    enter-delay-ms="100"
      leave-delay-ms="100"
      align=\${this.orientation === 'vertical' ? 'right' : 'top'}>
      \${Move({ slot: 'icon' })}
      <span slot="tooltip-content">Move</span>
    </cds-icon-button>
    <cds-icon-button
    kind="ghost"
    enter-delay-ms="100"
      leave-delay-ms="100"
      align=\${this.orientation === 'vertical' ? 'right' : 'top'}>
      \${Rotate({ slot: 'icon' })}
      <span slot="tooltip-content">Rotate</span>
    </cds-icon-button>
  </cds-stack class="toolbar-group">
  <cds-stack class="toolbar-group" orientation=\${this.orientation}>
    <cds-icon-button
    kind="ghost"
    enter-delay-ms="100"
      leave-delay-ms="100"
      align=\${this.orientation === 'vertical' ? 'right' : 'top'}>
      \${ZoomIn({ slot: 'icon' })}
      <span slot="tooltip-content">Zoom in</span>
    </cds-icon-button>
    <cds-icon-button
    kind="ghost"
    enter-delay-ms="100"
      leave-delay-ms="100"
      align=\${this.orientation === 'vertical' ? 'right' : 'top'}>
      \${ZoomOut({ slot: 'icon' })}
      <span slot="tooltip-content">Zoom out</span>
    </cds-icon-button>
  </cds-stack class="toolbar-group">
</cds-stack class="toolbar">
`})})]})}function V(o={}){const{wrapper:t}={...i(),...o.components};return t?n.jsx(t,{...o,children:n.jsx(s,{...o})}):s(o)}export{V as default};

import{c as e,h as t,r as n}from"./blocks-BDkaN20S.js";import{n as r}from"./lib-BHIKqt5T.js";import i,{Horizontal as a,Vertical as o}from"./toolbar.stories-BYIUfT6N.js";var s=t();function c(t){let c={a:`a`,blockquote:`blockquote`,code:`code`,h1:`h1`,h2:`h2`,h3:`h3`,h4:`h4`,img:`img`,li:`li`,p:`p`,pre:`pre`,strong:`strong`,ul:`ul`,...r(),...t.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(e,{of:i}),`
`,(0,s.jsx)(c.h1,{id:`toolbar`,children:`Toolbar`}),`
`,(0,s.jsxs)(c.ul,{children:[`
`,(0,s.jsxs)(c.li,{children:[(0,s.jsx)(c.strong,{children:`Initiative owner(s):`}),` Carbon for IBM Products`]}),`
`,(0,s.jsxs)(c.li,{children:[(0,s.jsx)(c.strong,{children:`Status:`}),` Draft`]}),`
`,(0,s.jsxs)(c.li,{children:[(0,s.jsx)(c.strong,{children:`Target library:`}),` TBD`]}),`
`,(0,s.jsxs)(c.li,{children:[(0,s.jsx)(c.strong,{children:`Target library maintainer(s) / PR Reviewer(s):`}),` N/A`]}),`
`,(0,s.jsxs)(c.li,{children:[(0,s.jsx)(c.strong,{children:`Support channel:`}),` `,(0,s.jsx)(c.code,{children:`#carbon-labs`})]}),`
`]}),`
`,(0,s.jsxs)(c.blockquote,{children:[`
`,(0,s.jsxs)(c.p,{children:[`💡 Check our
`,(0,s.jsx)(c.a,{href:`https://stackblitz.com/github/carbon-design-system/carbon-labs/tree/main/examples/web-components/toolbar`,rel:`nofollow`,children:`Stackblitz`}),`
example implementation.`]}),`
`]}),`
`,(0,s.jsx)(c.p,{children:(0,s.jsx)(c.a,{href:`https://stackblitz.com/github/carbon-design-system/carbon-labs/tree/main/examples/web-components/toolbar`,rel:`nofollow`,children:(0,s.jsx)(c.img,{src:`https://developer.stackblitz.com/img/open_in_stackblitz.svg`,alt:`Edit carbon-labs`})})}),`
`,(0,s.jsx)(c.h2,{id:`overview`,children:`Overview`}),`
`,(0,s.jsx)(c.p,{children:`The toolbar pattern. made with carbon design system's web components.`}),`
`,(0,s.jsx)(c.p,{children:(0,s.jsx)(c.a,{href:`https://carbondesignsystem.com/patterns/text-toolbar-pattern/`,rel:`nofollow`,children:`Pattern Guidance`})}),`
`,(0,s.jsx)(c.p,{children:`To build this pattern, we recommend including the following components:`}),`
`,(0,s.jsxs)(c.ul,{children:[`
`,(0,s.jsx)(c.li,{children:(0,s.jsx)(c.a,{href:`https://web-components.carbondesignsystem.com/?path=/docs/layout-stack`,rel:`nofollow`,children:`cds-stack`})}),`
`,(0,s.jsx)(c.li,{children:(0,s.jsx)(c.a,{href:`https://web-components.carbondesignsystem.com/?path=/docs/components-icon-button`,rel:`nofollow`,children:`cds-icon-button`})}),`
`,(0,s.jsx)(c.li,{children:(0,s.jsx)(c.a,{href:`https://web-components.carbondesignsystem.com/?path=/docs/components-dropdown`,rel:`nofollow`,children:`cds-dropdown`})}),`
`,(0,s.jsx)(c.li,{children:(0,s.jsx)(c.a,{href:`https://web-components.carbondesignsystem.com/?path=/docs/components-overflow-menu`,rel:`nofollow`,children:`cds-overflow-menu`})}),`
`]}),`
`,(0,s.jsxs)(c.p,{children:[`These components are used within an `,(0,s.jsx)(c.code,{children:`clabs-toolbar`}),` wrapper component provided
as an example to handle state management and some pattern specific behaviors.`]}),`
`,(0,s.jsx)(c.h4,{id:`horizontal-example`,children:`Horizontal Example`}),`
`,(0,s.jsx)(n,{of:a}),`
`,(0,s.jsx)(c.h4,{id:`vertical-example`,children:`Vertical Example`}),`
`,(0,s.jsx)(n,{of:o}),`
`,(0,s.jsx)(c.h2,{id:`getting-started`,children:`Getting started`}),`
`,(0,s.jsx)(c.p,{children:`Here's a quick example to get you started.`}),`
`,(0,s.jsx)(c.h3,{id:`html`,children:`HTML`}),`
`,(0,s.jsx)(c.pre,{children:(0,s.jsx)(c.code,{className:`language-html`,children:`<cds-stack class="toolbar" orientation=\${this.orientation}>
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
`})})]})}function l(e={}){let{wrapper:t}={...r(),...e.components};return t?(0,s.jsx)(t,{...e,children:(0,s.jsx)(c,{...e})}):c(e)}export{l as default};
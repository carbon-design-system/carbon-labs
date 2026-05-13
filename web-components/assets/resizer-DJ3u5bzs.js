import{j as e,M as a,a as s}from"./blocks-CSmAUcm0.js";import{useMDXComponents as l}from"./index-DTFsAed9.js";import{c as t,a as d}from"./storybook-cdn-BiPTSTB7.js";import{R as c}from"./resizer.stories-Ckmt7YAz.js";import"./preload-helper-Dp1pzeXC.js";import"./iframe-CP1kGWRx.js";import"./property-ZFgVw4Vi.js";import"./state-B8pDF0S0.js";import"./icon-loader-Dd7yO-sy.js";import"./index-PM9-kfeW.js";import"./directive-CJw_OlP2.js";import"./unsafe-html-CRi61ThK.js";const o="0.3.0",h={version:o};function r(i){const n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",img:"img",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...l(),...i.components};return e.jsxs(e.Fragment,{children:[e.jsx(a,{of:c}),`
`,e.jsx(n.h1,{id:"resizer",children:"Resizer"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Initiative owner(s):"})," Nandan Devadula"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Status:"})," Draft"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Target library:"})," TBD"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Target library maintainer(s) / PR Reviewer(s):"})," N/A"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Support channel:"})," ",e.jsx(n.code,{children:"#carbon-labs"})]}),`
`]}),`
`,e.jsxs(n.blockquote,{children:[`
`,e.jsxs(n.p,{children:[`💡 Check our
`,e.jsx(n.a,{href:"https://stackblitz.com/github/carbon-design-system/carbon-labs/tree/main/examples/web-components/resizer",rel:"nofollow",children:"Stackblitz"}),`
example implementation.`]}),`
`]}),`
`,e.jsx(n.p,{children:e.jsx(n.a,{href:"https://stackblitz.com/github/carbon-design-system/carbon-labs/tree/main/examples/web-components/resizer",rel:"nofollow",children:e.jsx(n.img,{src:"https://developer.stackblitz.com/img/open_in_stackblitz.svg",alt:"Edit carbon-labs"})})}),`
`,e.jsx(n.h2,{id:"overview",children:"Overview"}),`
`,e.jsx(n.p,{children:`A set of web components for creating resizable panels with support for both
declarative (zero-setup) and programmatic (composable) usage modes. The Resizer
components enable you to create flexible, resizable layouts in your web
applications. They support both horizontal and vertical resizing, with optional
pivot handles for advanced corner resizing.`}),`
`,e.jsx(n.h2,{id:"components",children:"Components"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:e.jsx(n.code,{children:"clabs-resizer-grid"})})," - Container for resizable panels"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:e.jsx(n.code,{children:"clabs-resizer-panel"})})," - Individual resizable panel"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:e.jsx(n.code,{children:"clabs-resizer-handle"})})," - Handle for resizing between panels"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:e.jsx(n.code,{children:"clabs-resizer-handle-pivot"})})," - Corner pivot for advanced resizing"]}),`
`]}),`
`,e.jsx(n.h2,{id:"getting-started",children:"Getting started"}),`
`,e.jsx(n.p,{children:"Here's a quick example to get you started."}),`
`,e.jsx(n.h3,{id:"js-via-import",children:"JS (via import)"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-javascript",children:`import '@carbon-labs/wc-resizer/es/index.js';
`})}),`
`,e.jsx(n.h3,{id:"styles",children:"Styles"}),`
`,e.jsxs(n.p,{children:["You'll also need to import the theming tokens from ",e.jsx(n.code,{children:"@carbon/styles"}),` either from
npm or from our CDN helpers. Checkout our Stackblitz example above to see how
that is implemented.`]}),`
`,e.jsx(s,{children:`${t({components:["resizer"]},h)}`}),`
`,e.jsx(s,{children:`${d()}`}),`
`,e.jsx(n.h3,{id:"html",children:"HTML"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-html",children:`<clabs-resizer-grid>
  <clabs-resizer-panel>
    <div>Panel 1 content</div>
  </clabs-resizer-panel>
  <clabs-resizer-handle></clabs-resizer-handle>
  <clabs-resizer-panel>
    <div>Panel 2 content</div>
  </clabs-resizer-panel>
</clabs-resizer-grid>
`})}),`
`,e.jsx(n.h2,{id:"usage",children:"Usage"}),`
`,e.jsx(n.h3,{id:"declarative-mode-zero-setup",children:"Declarative Mode (Zero-Setup)"}),`
`,e.jsx(n.p,{children:`Enable direct usage of components without any JavaScript setup. Users can
compose layouts purely via HTML and have resizing work out-of-the-box.`}),`
`,e.jsx(n.h4,{id:"basic-horizontal-layout",children:"Basic Horizontal Layout"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-html",children:`<clabs-resizer-grid axis="x">
  <clabs-resizer-panel slot="left"> Left panel content </clabs-resizer-panel>

  <clabs-resizer-handle slot="handle-horizontal"></clabs-resizer-handle>

  <clabs-resizer-panel slot="right"> Right panel content </clabs-resizer-panel>
</clabs-resizer-grid>
`})}),`
`,e.jsx(n.h4,{id:"basic-vertical-layout",children:"Basic Vertical Layout"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-html",children:`<clabs-resizer-grid axis="y">
  <clabs-resizer-panel slot="top"> Top panel content </clabs-resizer-panel>

  <clabs-resizer-handle slot="handle-vertical"></clabs-resizer-handle>

  <clabs-resizer-panel slot="bottom">
    Bottom panel content
  </clabs-resizer-panel>
</clabs-resizer-grid>
`})}),`
`,e.jsx(n.h4,{id:"with-pivot-handle",children:"With Pivot Handle"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-html",children:`<clabs-resizer-grid axis="x">
  <clabs-resizer-panel slot="left">
    Left panel content
    <clabs-resizer-handle slot="handle-horizontal">
      <clabs-resizer-handle-pivot></clabs-resizer-handle-pivot>
    </clabs-resizer-handle>
  </clabs-resizer-panel>

  <clabs-resizer-panel slot="right"> Right panel content </clabs-resizer-panel>
</clabs-resizer-grid>
`})}),`
`,e.jsx(n.h3,{id:"programmatic-mode-event-driven",children:"Programmatic Mode (Event-Driven)"}),`
`,e.jsxs(n.p,{children:["The ",e.jsx(n.a,{href:"resizer-handle.ts",children:e.jsx(n.code,{children:"clabs-resizer-handle"})}),` and
`,e.jsx(n.a,{href:"resizer-handle-pivot.ts",children:e.jsx(n.code,{children:"clabs-resizer-handle-pivot"})}),` components can be used
as standalone components that emit drag events and delta values. Consumers
(e.g., frameworks like React) can handle resizing logic via JavaScript.`]}),`
`,e.jsx(n.p,{children:`The resizer handle can be used independently without a grid container by
listening to its events:`}),`
`,e.jsx(n.h4,{id:"events",children:"Events"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"resize-start"})," - Fired when dragging starts"]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"detail.axis"})," - The resize axis ('x' or 'y')"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"detail.startPosition"})," - Starting position ",e.jsx(n.code,{children:"{x, y}"})]}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"resize-drag"})," - Fired during dragging"]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"detail.axis"})," - The resize axis ('x' or 'y')"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"detail.delta"})," - Movement delta in pixels"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"detail.position"})," - Current position ",e.jsx(n.code,{children:"{x, y}"})]}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"resize-end"})," - Fired when dragging ends"]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"detail.axis"})," - The resize axis ('x' or 'y')"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"detail.delta"})," - Total movement delta in pixels"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"detail.position"})," - Final position ",e.jsx(n.code,{children:"{x, y}"})]}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"resize-reset"})," - Fired on double-tap/double-click"]}),`
`]}),`
`]}),`
`,e.jsx(n.h4,{id:"single-panel-example",children:"Single Panel Example"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-html",children:`<div class="container">
  <div class="panel" id="myPanel">Panel content</div>
  <clabs-resizer-handle></clabs-resizer-handle>
</div>

<script>
  const handle = document.querySelector('clabs-resizer-handle');
  const panel = document.getElementById('myPanel');
  let initialHeight = 0;

  handle.addEventListener('resize-start', (e) => {
    initialHeight = panel.offsetHeight;
  });

  handle.addEventListener('resize-drag', (e) => {
    const newHeight = initialHeight + e.detail.delta;
    panel.style.height = \`\${Math.max(48, newHeight)}px\`;
  });
<\/script>
`})}),`
`,e.jsx(n.h4,{id:"bounded-resize-example",children:"Bounded Resize Example"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-html",children:`<div class="container" style="height: 400px">
  <div class="panel" id="boundedPanel">Panel content</div>
  <clabs-resizer-handle></clabs-resizer-handle>
</div>

<script>
  const handle = document.querySelector('clabs-resizer-handle');
  const panel = document.getElementById('boundedPanel');
  const container = document.querySelector('.container');
  let initialHeight = 0;

  handle.addEventListener('resize-start', (e) => {
    initialHeight = panel.offsetHeight;
  });

  handle.addEventListener('resize-drag', (e) => {
    const containerHeight = container.offsetHeight;
    const newHeight = initialHeight + e.detail.delta;

    // Constrain between min and max
    const constrainedHeight = Math.max(
      48,
      Math.min(newHeight, containerHeight - 20)
    );

    panel.style.height = \`\${constrainedHeight}px\`;
  });
<\/script>
`})}),`
`,e.jsx(n.h2,{id:"accessibility",children:"Accessibility"}),`
`,e.jsx(n.h3,{id:"keyboard-navigation",children:"Keyboard Navigation"}),`
`,e.jsx(n.p,{children:"The resizer handle supports keyboard navigation:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Arrow Keys"}),": Move the resizer handle in 5px increments",`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"ArrowUp"}),"/",e.jsx(n.code,{children:"ArrowDown"})," for horizontal handles (y-axis)"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"ArrowLeft"}),"/",e.jsx(n.code,{children:"ArrowRight"})," for vertical handles (x-axis)"]}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Shift + Arrow Keys"}),": Move in 25px increments for faster resizing"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Home"}),": Collapse the start panel to minimum size (grid mode only)"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"End"}),": Expand the start panel to maximum size (grid mode only)"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Double-click/Double-tap"}),": Reset panels to default sizes"]}),`
`]}),`
`,e.jsx(n.h3,{id:"aria-attributes",children:"ARIA Attributes"}),`
`,e.jsx(n.h4,{id:"grid-based-usage-automatic",children:"Grid-Based Usage (Automatic)"}),`
`,e.jsxs(n.p,{children:["When using ",e.jsx(n.code,{children:"clabs-resizer-handle"})," within a ",e.jsx(n.code,{children:"clabs-resizer-grid"}),`, ARIA attributes
are automatically managed:`]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:'role="separator"'})," - Identifies the element as a separator"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"aria-orientation"}),' - Set to "vertical" or "horizontal" based on axis']}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"aria-valuenow"})," - Current split percentage (0-100)"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:'aria-valuemin="0"'})," - Minimum value"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:'aria-valuemax="100"'})," - Maximum value"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"aria-valuetext"}),' - Human-readable split ratio (e.g., "60% / 40%")']}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:'aria-live="assertive"'})," - Announces changes to screen readers"]}),`
`]}),`
`,e.jsx(n.h4,{id:"standalone-usage-manual",children:"Standalone Usage (Manual)"}),`
`,e.jsxs(n.p,{children:["When using ",e.jsx(n.code,{children:"clabs-resizer-handle"}),` without a grid (programmatic mode), you are
responsible for managing ARIA attributes to ensure accessibility:`]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-html",children:`<div class="container">
  <div class="panel" id="myPanel">Panel content</div>
  <clabs-resizer-handle
    aria-valuenow="50"
    aria-valuemin="0"
    aria-valuemax="100"
    aria-valuetext="Panel height: 200px"></clabs-resizer-handle>
</div>

<script>
  const handle = document.querySelector('clabs-resizer-handle');
  const panel = document.getElementById('myPanel');
  let initialHeight = 0;

  handle.addEventListener('resize-start', (e) => {
    initialHeight = panel.offsetHeight;
  });

  handle.addEventListener('resize-drag', (e) => {
    const newHeight = initialHeight + e.detail.delta;
    const constrainedHeight = Math.max(48, newHeight);
    panel.style.height = \`\${constrainedHeight}px\`;

    // Update ARIA attributes for accessibility
    const percentage = Math.round((constrainedHeight / 400) * 100);
    handle.setAttribute('aria-valuenow', percentage.toString());
    handle.setAttribute(
      'aria-valuetext',
      \`Panel height: \${constrainedHeight}px\`
    );
  });
<\/script>
`})}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Note"}),": The ",e.jsx(n.code,{children:'role="separator"'})," attribute requires ",e.jsx(n.code,{children:"aria-valuenow"}),` to be
present for proper accessibility compliance. When using standalone handles,
always update these attributes during resize operations.`]})]})}function H(i={}){const{wrapper:n}={...l(),...i.components};return n?e.jsx(n,{...i,children:e.jsx(r,{...i})}):r(i)}export{H as default};

import{c as e,h as t,s as n}from"./blocks-DNSPUkUq.js";import{n as r}from"./lib-Ccaf7Yay.js";import{n as i,t as a}from"./storybook-cdn-Dt1Yo-ue.js";import o from"./resizer.stories-CKgtBeJb.js";var s=t(),c={name:`@carbon-labs/wc-resizer`,version:`0.4.0`,publishConfig:{access:`public`,provenance:!0},description:`Carbon Labs - Resizer web components for creating resizable panels`,license:`Apache-2.0`,repository:{type:`git`,url:`https://github.com/carbon-design-system/carbon-labs`,directory:`packages/web-components/src/components/resizer`},exports:{".":{default:`./src/index.js`},"./es/*":`./es/*`,"./lib/*":`./lib/*`},files:[`es/`,`lib/`],types:`./src/index.d.ts`,customElements:`custom-elements.json`,scripts:{build:`node ../../../tasks/build.js`,"build:dist":`rm -rf dist && rollup --config ../../../tasks/build-dist.js`,"build:dist:canary":`rm -rf dist && rollup --config ../../../tasks/build-dist.js --configCanary`,clean:`rimraf es lib`},dependencies:{"@babel/runtime":`^7.23.2`,"@carbon-labs/utilities":`0.21.0`,lit:`^3.2.1`}};function l(t){let l={a:`a`,blockquote:`blockquote`,code:`code`,h1:`h1`,h2:`h2`,h3:`h3`,h4:`h4`,img:`img`,li:`li`,p:`p`,pre:`pre`,strong:`strong`,ul:`ul`,...r(),...t.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(e,{of:o}),`
`,(0,s.jsx)(l.h1,{id:`resizer`,children:`Resizer`}),`
`,(0,s.jsxs)(l.ul,{children:[`
`,(0,s.jsxs)(l.li,{children:[(0,s.jsx)(l.strong,{children:`Initiative owner(s):`}),` Nandan Devadula`]}),`
`,(0,s.jsxs)(l.li,{children:[(0,s.jsx)(l.strong,{children:`Status:`}),` Draft`]}),`
`,(0,s.jsxs)(l.li,{children:[(0,s.jsx)(l.strong,{children:`Target library:`}),` TBD`]}),`
`,(0,s.jsxs)(l.li,{children:[(0,s.jsx)(l.strong,{children:`Target library maintainer(s) / PR Reviewer(s):`}),` N/A`]}),`
`,(0,s.jsxs)(l.li,{children:[(0,s.jsx)(l.strong,{children:`Support channel:`}),` `,(0,s.jsx)(l.code,{children:`#carbon-labs`})]}),`
`]}),`
`,(0,s.jsxs)(l.blockquote,{children:[`
`,(0,s.jsxs)(l.p,{children:[`💡 Check our
`,(0,s.jsx)(l.a,{href:`https://stackblitz.com/github/carbon-design-system/carbon-labs/tree/main/examples/web-components/resizer`,rel:`nofollow`,children:`Stackblitz`}),`
example implementation.`]}),`
`]}),`
`,(0,s.jsx)(l.p,{children:(0,s.jsx)(l.a,{href:`https://stackblitz.com/github/carbon-design-system/carbon-labs/tree/main/examples/web-components/resizer`,rel:`nofollow`,children:(0,s.jsx)(l.img,{src:`https://developer.stackblitz.com/img/open_in_stackblitz.svg`,alt:`Edit carbon-labs`})})}),`
`,(0,s.jsx)(l.h2,{id:`overview`,children:`Overview`}),`
`,(0,s.jsx)(l.p,{children:`A set of web components for creating resizable panels with support for both
declarative (zero-setup) and programmatic (composable) usage modes. The Resizer
components enable you to create flexible, resizable layouts in your web
applications. They support both horizontal and vertical resizing, with optional
pivot handles for advanced corner resizing.`}),`
`,(0,s.jsx)(l.h2,{id:`components`,children:`Components`}),`
`,(0,s.jsxs)(l.ul,{children:[`
`,(0,s.jsxs)(l.li,{children:[(0,s.jsx)(l.strong,{children:(0,s.jsx)(l.code,{children:`clabs-resizer-grid`})}),` - Container for resizable panels`]}),`
`,(0,s.jsxs)(l.li,{children:[(0,s.jsx)(l.strong,{children:(0,s.jsx)(l.code,{children:`clabs-resizer-panel`})}),` - Individual resizable panel`]}),`
`,(0,s.jsxs)(l.li,{children:[(0,s.jsx)(l.strong,{children:(0,s.jsx)(l.code,{children:`clabs-resizer-handle`})}),` - Handle for resizing between panels`]}),`
`,(0,s.jsxs)(l.li,{children:[(0,s.jsx)(l.strong,{children:(0,s.jsx)(l.code,{children:`clabs-resizer-handle-pivot`})}),` - Corner pivot for advanced resizing`]}),`
`]}),`
`,(0,s.jsx)(l.h2,{id:`getting-started`,children:`Getting started`}),`
`,(0,s.jsx)(l.p,{children:`Here's a quick example to get you started.`}),`
`,(0,s.jsx)(l.h3,{id:`js-via-import`,children:`JS (via import)`}),`
`,(0,s.jsx)(l.pre,{children:(0,s.jsx)(l.code,{className:`language-javascript`,children:`import '@carbon-labs/wc-resizer/es/index.js';
`})}),`
`,(0,s.jsx)(l.h3,{id:`styles`,children:`Styles`}),`
`,(0,s.jsxs)(l.p,{children:[`You'll also need to import the theming tokens from `,(0,s.jsx)(l.code,{children:`@carbon/styles`}),` either from
npm or from our CDN helpers. Checkout our Stackblitz example above to see how
that is implemented.`]}),`
`,(0,s.jsx)(n,{children:`${i({components:[`resizer`]},c)}`}),`
`,(0,s.jsx)(n,{children:`${a()}`}),`
`,(0,s.jsx)(l.h3,{id:`html`,children:`HTML`}),`
`,(0,s.jsx)(l.pre,{children:(0,s.jsx)(l.code,{className:`language-html`,children:`<clabs-resizer-grid>
  <clabs-resizer-panel>
    <div>Panel 1 content</div>
  </clabs-resizer-panel>
  <clabs-resizer-handle></clabs-resizer-handle>
  <clabs-resizer-panel>
    <div>Panel 2 content</div>
  </clabs-resizer-panel>
</clabs-resizer-grid>
`})}),`
`,(0,s.jsx)(l.h2,{id:`usage`,children:`Usage`}),`
`,(0,s.jsx)(l.h3,{id:`declarative-mode-zero-setup`,children:`Declarative Mode (Zero-Setup)`}),`
`,(0,s.jsx)(l.p,{children:`Enable direct usage of components without any JavaScript setup. Users can
compose layouts purely via HTML and have resizing work out-of-the-box.`}),`
`,(0,s.jsx)(l.h4,{id:`basic-horizontal-layout`,children:`Basic Horizontal Layout`}),`
`,(0,s.jsx)(l.pre,{children:(0,s.jsx)(l.code,{className:`language-html`,children:`<clabs-resizer-grid axis="x">
  <clabs-resizer-panel slot="left"> Left panel content </clabs-resizer-panel>

  <clabs-resizer-handle slot="handle-horizontal"></clabs-resizer-handle>

  <clabs-resizer-panel slot="right"> Right panel content </clabs-resizer-panel>
</clabs-resizer-grid>
`})}),`
`,(0,s.jsx)(l.h4,{id:`basic-vertical-layout`,children:`Basic Vertical Layout`}),`
`,(0,s.jsx)(l.pre,{children:(0,s.jsx)(l.code,{className:`language-html`,children:`<clabs-resizer-grid axis="y">
  <clabs-resizer-panel slot="top"> Top panel content </clabs-resizer-panel>

  <clabs-resizer-handle slot="handle-vertical"></clabs-resizer-handle>

  <clabs-resizer-panel slot="bottom">
    Bottom panel content
  </clabs-resizer-panel>
</clabs-resizer-grid>
`})}),`
`,(0,s.jsx)(l.h4,{id:`with-pivot-handle`,children:`With Pivot Handle`}),`
`,(0,s.jsx)(l.pre,{children:(0,s.jsx)(l.code,{className:`language-html`,children:`<clabs-resizer-grid axis="x">
  <clabs-resizer-panel slot="left">
    Left panel content
    <clabs-resizer-handle slot="handle-horizontal">
      <clabs-resizer-handle-pivot></clabs-resizer-handle-pivot>
    </clabs-resizer-handle>
  </clabs-resizer-panel>

  <clabs-resizer-panel slot="right"> Right panel content </clabs-resizer-panel>
</clabs-resizer-grid>
`})}),`
`,(0,s.jsx)(l.h3,{id:`programmatic-mode-event-driven`,children:`Programmatic Mode (Event-Driven)`}),`
`,(0,s.jsxs)(l.p,{children:[`The `,(0,s.jsx)(l.a,{href:`resizer-handle.ts`,children:(0,s.jsx)(l.code,{children:`clabs-resizer-handle`})}),` and
`,(0,s.jsx)(l.a,{href:`resizer-handle-pivot.ts`,children:(0,s.jsx)(l.code,{children:`clabs-resizer-handle-pivot`})}),` components can be used
as standalone components that emit drag events and delta values. Consumers
(e.g., frameworks like React) can handle resizing logic via JavaScript.`]}),`
`,(0,s.jsx)(l.p,{children:`The resizer handle can be used independently without a grid container by
listening to its events:`}),`
`,(0,s.jsx)(l.h4,{id:`events`,children:`Events`}),`
`,(0,s.jsxs)(l.ul,{children:[`
`,(0,s.jsxs)(l.li,{children:[`
`,(0,s.jsxs)(l.p,{children:[(0,s.jsx)(l.code,{children:`resize-start`}),` - Fired when dragging starts`]}),`
`,(0,s.jsxs)(l.ul,{children:[`
`,(0,s.jsxs)(l.li,{children:[(0,s.jsx)(l.code,{children:`detail.axis`}),` - The resize axis ('x' or 'y')`]}),`
`,(0,s.jsxs)(l.li,{children:[(0,s.jsx)(l.code,{children:`detail.startPosition`}),` - Starting position `,(0,s.jsx)(l.code,{children:`{x, y}`})]}),`
`]}),`
`]}),`
`,(0,s.jsxs)(l.li,{children:[`
`,(0,s.jsxs)(l.p,{children:[(0,s.jsx)(l.code,{children:`resize-drag`}),` - Fired during dragging`]}),`
`,(0,s.jsxs)(l.ul,{children:[`
`,(0,s.jsxs)(l.li,{children:[(0,s.jsx)(l.code,{children:`detail.axis`}),` - The resize axis ('x' or 'y')`]}),`
`,(0,s.jsxs)(l.li,{children:[(0,s.jsx)(l.code,{children:`detail.delta`}),` - Movement delta in pixels`]}),`
`,(0,s.jsxs)(l.li,{children:[(0,s.jsx)(l.code,{children:`detail.position`}),` - Current position `,(0,s.jsx)(l.code,{children:`{x, y}`})]}),`
`]}),`
`]}),`
`,(0,s.jsxs)(l.li,{children:[`
`,(0,s.jsxs)(l.p,{children:[(0,s.jsx)(l.code,{children:`resize-end`}),` - Fired when dragging ends`]}),`
`,(0,s.jsxs)(l.ul,{children:[`
`,(0,s.jsxs)(l.li,{children:[(0,s.jsx)(l.code,{children:`detail.axis`}),` - The resize axis ('x' or 'y')`]}),`
`,(0,s.jsxs)(l.li,{children:[(0,s.jsx)(l.code,{children:`detail.delta`}),` - Total movement delta in pixels`]}),`
`,(0,s.jsxs)(l.li,{children:[(0,s.jsx)(l.code,{children:`detail.position`}),` - Final position `,(0,s.jsx)(l.code,{children:`{x, y}`})]}),`
`]}),`
`]}),`
`,(0,s.jsxs)(l.li,{children:[`
`,(0,s.jsxs)(l.p,{children:[(0,s.jsx)(l.code,{children:`resize-reset`}),` - Fired on double-tap/double-click`]}),`
`]}),`
`]}),`
`,(0,s.jsx)(l.h4,{id:`single-panel-example`,children:`Single Panel Example`}),`
`,(0,s.jsx)(l.pre,{children:(0,s.jsx)(l.code,{className:`language-html`,children:`<div class="container">
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
`,(0,s.jsx)(l.h4,{id:`bounded-resize-example`,children:`Bounded Resize Example`}),`
`,(0,s.jsx)(l.pre,{children:(0,s.jsx)(l.code,{className:`language-html`,children:`<div class="container" style="height: 400px">
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
`,(0,s.jsx)(l.h2,{id:`accessibility`,children:`Accessibility`}),`
`,(0,s.jsx)(l.h3,{id:`keyboard-navigation`,children:`Keyboard Navigation`}),`
`,(0,s.jsx)(l.p,{children:`The resizer handle supports keyboard navigation:`}),`
`,(0,s.jsxs)(l.ul,{children:[`
`,(0,s.jsxs)(l.li,{children:[(0,s.jsx)(l.strong,{children:`Arrow Keys`}),`: Move the resizer handle in 5px increments`,`
`,(0,s.jsxs)(l.ul,{children:[`
`,(0,s.jsxs)(l.li,{children:[(0,s.jsx)(l.code,{children:`ArrowUp`}),`/`,(0,s.jsx)(l.code,{children:`ArrowDown`}),` for horizontal handles (y-axis)`]}),`
`,(0,s.jsxs)(l.li,{children:[(0,s.jsx)(l.code,{children:`ArrowLeft`}),`/`,(0,s.jsx)(l.code,{children:`ArrowRight`}),` for vertical handles (x-axis)`]}),`
`]}),`
`]}),`
`,(0,s.jsxs)(l.li,{children:[(0,s.jsx)(l.strong,{children:`Shift + Arrow Keys`}),`: Move in 25px increments for faster resizing`]}),`
`,(0,s.jsxs)(l.li,{children:[(0,s.jsx)(l.strong,{children:`Home`}),`: Collapse the start panel to minimum size (grid mode only)`]}),`
`,(0,s.jsxs)(l.li,{children:[(0,s.jsx)(l.strong,{children:`End`}),`: Expand the start panel to maximum size (grid mode only)`]}),`
`,(0,s.jsxs)(l.li,{children:[(0,s.jsx)(l.strong,{children:`Double-click/Double-tap`}),`: Reset panels to default sizes`]}),`
`]}),`
`,(0,s.jsx)(l.h3,{id:`aria-attributes`,children:`ARIA Attributes`}),`
`,(0,s.jsx)(l.h4,{id:`grid-based-usage-automatic`,children:`Grid-Based Usage (Automatic)`}),`
`,(0,s.jsxs)(l.p,{children:[`When using `,(0,s.jsx)(l.code,{children:`clabs-resizer-handle`}),` within a `,(0,s.jsx)(l.code,{children:`clabs-resizer-grid`}),`, ARIA attributes
are automatically managed:`]}),`
`,(0,s.jsxs)(l.ul,{children:[`
`,(0,s.jsxs)(l.li,{children:[(0,s.jsx)(l.code,{children:`role="separator"`}),` - Identifies the element as a separator`]}),`
`,(0,s.jsxs)(l.li,{children:[(0,s.jsx)(l.code,{children:`aria-orientation`}),` - Set to "vertical" or "horizontal" based on axis`]}),`
`,(0,s.jsxs)(l.li,{children:[(0,s.jsx)(l.code,{children:`aria-valuenow`}),` - Current split percentage (0-100)`]}),`
`,(0,s.jsxs)(l.li,{children:[(0,s.jsx)(l.code,{children:`aria-valuemin="0"`}),` - Minimum value`]}),`
`,(0,s.jsxs)(l.li,{children:[(0,s.jsx)(l.code,{children:`aria-valuemax="100"`}),` - Maximum value`]}),`
`,(0,s.jsxs)(l.li,{children:[(0,s.jsx)(l.code,{children:`aria-valuetext`}),` - Human-readable split ratio (e.g., "60% / 40%")`]}),`
`,(0,s.jsxs)(l.li,{children:[(0,s.jsx)(l.code,{children:`aria-live="assertive"`}),` - Announces changes to screen readers`]}),`
`]}),`
`,(0,s.jsx)(l.h4,{id:`standalone-usage-manual`,children:`Standalone Usage (Manual)`}),`
`,(0,s.jsxs)(l.p,{children:[`When using `,(0,s.jsx)(l.code,{children:`clabs-resizer-handle`}),` without a grid (programmatic mode), you are
responsible for managing ARIA attributes to ensure accessibility:`]}),`
`,(0,s.jsx)(l.pre,{children:(0,s.jsx)(l.code,{className:`language-html`,children:`<div class="container">
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
`,(0,s.jsxs)(l.p,{children:[(0,s.jsx)(l.strong,{children:`Note`}),`: The `,(0,s.jsx)(l.code,{children:`role="separator"`}),` attribute requires `,(0,s.jsx)(l.code,{children:`aria-valuenow`}),` to be
present for proper accessibility compliance. When using standalone handles,
always update these attributes during resize operations.`]})]})}function u(e={}){let{wrapper:t}={...r(),...e.components};return t?(0,s.jsx)(t,{...e,children:(0,s.jsx)(l,{...e})}):l(e)}export{u as default};
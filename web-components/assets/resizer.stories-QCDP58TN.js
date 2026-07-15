import{P as e,R as t,U as n}from"./iframe-LXl0-Pt7.js";import{a as r,i,r as a,t as o}from"./decorate-C44P60SK.js";import{t as s}from"./decorateMetadata-MzQFwUCs.js";import{t as c}from"./icon-loader-Dc8Vz7q9.js";var l={elem:`svg`,attrs:{xmlns:`http://www.w3.org/2000/svg`,viewBox:`0 0 32 32`,fill:`currentColor`,width:16,height:16},content:[{elem:`path`,attrs:{d:`M4 20 15 20 15 26.17 12.41 23.59 11 25 16 30 21 25 19.59 23.59 17 26.17 17 20 28 20 28 18 4 18 4 20z`}},{elem:`path`,attrs:{d:`M11 7 12.41 8.41 15 5.83 15 12 4 12 4 14 28 14 28 12 17 12 17 5.83 19.59 8.41 21 7 16 2 11 7z`}}],name:`drag--vertical`,size:16},u={stablePrefix:`clabs`,prefix:`cds`},d=n`.handle-content{display:flex;block-size:100%;inline-size:100%}.icon-container{display:flex;flex-grow:1;align-items:center;justify-content:center;block-size:100%}:host{display:grid;background:var(--cds-border-subtle);cursor:ns-resize;min-block-size:max(1px,var(--resizer-thickness));min-inline-size:max(1px,var(--resizer-thickness));touch-action:none;-webkit-user-select:none;-ms-user-select:none;user-select:none}:host .icon-container{position:relative}:host .icon-container:before{position:absolute;background-color:var(--resizer-grab-color);block-size:calc(max(1px,var(--resizer-thickness)) + max(0px,var(--resizer-grab-thickness)));content:"";inline-size:100%;inset-inline-start:0}@media(prefers-reduced-motion:no-preference){:host(:hover),:host([data-synthetic-hover]){background-color:var(--cds-border-interactive);transition:background-color var(--cds-duration-moderate-01)}}:host(:focus){background-color:var(--cds-border-interactive);outline:none}:host(:active),:host([data-synthetic-active]){background-color:var(--cds-border-interactive)}:host(:focus:not(:focus-visible)){box-shadow:none;outline:none}:host([slot=handle-horizontal]),:host([orientation=horizontal]){cursor:ew-resize}:host([slot=handle-horizontal]) .icon-container,:host([orientation=horizontal]) .icon-container{position:relative}:host([slot=handle-horizontal]) .icon-container:before,:host([orientation=horizontal]) .icon-container:before{position:absolute;background-color:var(--resizer-grab-color);block-size:100%;content:"";inline-size:calc(max(1px,var(--resizer-thickness)) + max(0px,var(--resizer-grab-thickness)));inset-block-start:0;inset-inline-start:auto}:host([slot=handle-vertical]),:host([orientation=vertical]){cursor:ns-resize;min-inline-size:0}:host([slot=handle-vertical]) .icon-container,:host([orientation=vertical]) .icon-container{position:relative}:host([slot=handle-vertical]) .icon-container:before,:host([orientation=vertical]) .icon-container:before{position:absolute;background-color:var(--resizer-grab-color);block-size:calc(max(1px,var(--resizer-thickness)) + max(0px,var(--resizer-grab-thickness)));content:"";inline-size:100%;inset-inline-start:0}.sr-only{position:absolute;overflow:hidden;padding:0;border:0;margin:-1px;block-size:1px;clip:rect(0,0,0,0);inline-size:1px;white-space:nowrap}`,f={MAX_TIME_MS:300,MAX_DISTANCE_PX:24,VIBRATION_MS:8},p={DEFAULT_STEP_PX:5,LARGE_STEP_PX:25},m={ROLE_SEPARATOR:`separator`,LIVE_ASSERTIVE:`assertive`,VALUE_MIN:`0`,VALUE_MAX:`100`,VALUE_DEFAULT:`50`},h={GRID:`clabs-resizer-grid`,PANEL:`clabs-resizer-panel`,HANDLE:`clabs-resizer-handle`,PIVOT:`clabs-resizer-handle-pivot`},g={LEFT:`left`,RIGHT:`right`,TOP:`top`,BOTTOM:`bottom`,HANDLE_HORIZONTAL:`handle-horizontal`,HANDLE_VERTICAL:`handle-vertical`,PIVOT:`pivot`,ICON:`icon`},_={RESIZE_START:`resize-start`,RESIZE_DRAG:`resize-drag`,RESIZE_END:`resize-end`,RESIZE_RESET:`resize-reset`};function v(e,t){return t<=0?0:Math.max(0,Math.min(1,e/t))}function y(e){let t=Math.round(Math.max(0,Math.min(100,e)));return`${t}% / ${100-t}%`}function b(e,t){return e===`handle-vertical`?`y`:e===`handle-horizontal`||t&&t.includes(`ew`)?`x`:`y`}function x(e,t,n){let r=Math.abs(e.x-t.x),i=Math.abs(e.y-t.y);return r<n&&i<n}function S(e,t){try{return Array.from(e.querySelectorAll(t))}catch(e){return console.error(`Error querying selector "${t}":`,e),[]}}function C(e,t){try{return e.closest(t)}catch(e){return console.error(`Error finding closest "${t}":`,e),null}}function w(e){if(`vibrate`in navigator)try{navigator.vibrate(e)}catch{}}function T(e,t,n){return new CustomEvent(e,{bubbles:!0,composed:!0,detail:t,...n})}function E(e){return e===`x`?`vertical`:`horizontal`}var D=class extends e{constructor(...e){super(...e),this.axis=`y`,this._isDragging=!1,this._startSize=0,this._endSize=0,this._lastTapTime=0,this._lastTapPosition={x:0,y:0},this.resetSizes=e=>{e.preventDefault();try{if(this.dispatchEvent(T(_.RESIZE_RESET)),this._grid){this._grid.style.removeProperty(`--start-element-size`),this._grid.style.removeProperty(`--end-element-size`);let e=()=>{this._updateAriaAttributes(),this._grid?.removeEventListener(`transitionend`,e)};this._grid.addEventListener(`transitionend`,e,{once:!0})}}catch(e){console.error(`Error resetting sizes:`,e)}},this.startDrag=e=>{this._handlePointerDown(e)},this._handlePointerDown=e=>{if(!this._detectDoubleTap(e))try{e.preventDefault(),this._isDragging=!0,this.setSyntheticActiveState(!0);let t={x:e.clientX,y:e.clientY},n=this.axis===`x`?e.clientX:e.clientY;if(this.dispatchEvent(T(_.RESIZE_START,{axis:this.axis,startPosition:t})),this._grid&&this._startNode&&this._endNode){let e=this._startNode.getBoundingClientRect(),t=this._endNode.getBoundingClientRect();this._startSize=this.axis===`x`?e.width:e.height,this._endSize=this.axis===`x`?t.width:t.height}this._boundMove=this._createMoveHandler(n),this._boundStop=this._createStopHandler(n),window.addEventListener(`pointermove`,this._boundMove),window.addEventListener(`pointerup`,this._boundStop)}catch(e){console.error(`Error starting drag:`,e),this._isDragging=!1,this.setSyntheticActiveState(!1)}},this._handleKeyDown=e=>{if([`ArrowUp`,`ArrowDown`,`ArrowLeft`,`ArrowRight`,`Home`,`End`,`PageUp`,`PageDown`].includes(e.key)){e.preventDefault(),e.stopPropagation();try{let t=e.shiftKey?p.LARGE_STEP_PX:p.DEFAULT_STEP_PX,n=0,r=this.axis===`x`;if(e.key===`ArrowUp`&&!r)n=-t;else if(e.key===`ArrowDown`&&!r)n=t;else if(e.key===`ArrowLeft`&&r)n=-t;else if(e.key===`ArrowRight`&&r)n=t;else if(e.key===`Home`&&this._grid&&this._startNode){let e=this._startNode.getBoundingClientRect();n=r?-e.width:-e.height}else if(e.key===`End`&&this._grid&&this._endNode){let e=this._endNode.getBoundingClientRect();n=r?e.width:e.height}n!==0&&this._handleKeyboardResize(n)}catch(e){console.error(`Error handling keyboard navigation:`,e)}}}}static{this.styles=d}setSyntheticHoverState(e){this.toggleAttribute(`data-synthetic-hover`,e),this.requestUpdate()}setSyntheticActiveState(e){this.toggleAttribute(`data-synthetic-active`,e),this.requestUpdate()}_updateAriaAttributes(){if(!(!this._grid||!this._startNode||!this._endNode))try{let e=this._startNode.getBoundingClientRect(),t=this._endNode.getBoundingClientRect(),n=this.axis===`x`,r=n?e.width:e.height,i=r+(n?t.width:t.height);if(i>0){let e=Math.round(r/i*100);this.setAttribute(`aria-valuenow`,e.toString()),this.setAttribute(`aria-valuemin`,m.VALUE_MIN),this.setAttribute(`aria-valuemax`,m.VALUE_MAX),this.setAttribute(`aria-valuetext`,y(e))}}catch(e){console.error(`Error updating ARIA attributes:`,e)}}connectedCallback(){super.connectedCallback();try{this._initializeComponent(),this._setupEventListeners()}catch(e){console.error(`Error initializing resizer handle:`,e)}}firstUpdated(){this._grid&&this._startNode&&this._endNode&&requestAnimationFrame(()=>{this._updateAriaAttributes()})}disconnectedCallback(){this._cleanup(),super.disconnectedCallback()}_initializeComponent(){this._grid=C(this,h.GRID)||void 0;let e=this.getAttribute(`slot`),t=getComputedStyle(this).cursor;if(this.axis=b(e,t),this._grid){let e=S(this._grid,h.PANEL);this.axis===`x`?(this._startNode=e.find(e=>e.slot===g.LEFT),this._endNode=e.find(e=>e.slot===g.RIGHT)):(this._startNode=e.find(e=>e.slot===g.TOP),this._endNode=e.find(e=>e.slot===g.BOTTOM))}this._setupAccessibility()}_setupAccessibility(){this.setAttribute(`role`,m.ROLE_SEPARATOR),this.setAttribute(`tabindex`,`0`),this.setAttribute(`aria-orientation`,E(this.axis)),this.setAttribute(`aria-live`,m.LIVE_ASSERTIVE),this._grid&&this._startNode&&this._endNode&&(this.setAttribute(`aria-valuenow`,m.VALUE_DEFAULT),this.setAttribute(`aria-valuemin`,m.VALUE_MIN),this.setAttribute(`aria-valuemax`,m.VALUE_MAX),this.setAttribute(`aria-valuetext`,y(50)))}_setupEventListeners(){this._boundStartDrag=this._handlePointerDown.bind(this),this._boundHandleKeyDown=this._handleKeyDown.bind(this),this.addEventListener(`pointerdown`,this._boundStartDrag),this.addEventListener(`keydown`,this._boundHandleKeyDown)}_cleanup(){this._boundStartDrag&&=(this.removeEventListener(`pointerdown`,this._boundStartDrag),void 0),this._boundHandleKeyDown&&=(this.removeEventListener(`keydown`,this._boundHandleKeyDown),void 0),this._boundMove&&=(window.removeEventListener(`pointermove`,this._boundMove),void 0),this._boundStop&&=(window.removeEventListener(`pointerup`,this._boundStop),void 0),this.removeAttribute(`data-synthetic-hover`),this.removeAttribute(`data-synthetic-active`),this._isDragging=!1}get pivot(){return this._pivot}get _pivot(){let e=C(this,h.PANEL);if(!e)return;let t=e.getAttribute(`slot`);if(t===g.LEFT)return`end`;if(t===g.RIGHT)return`start`}_detectDoubleTap(e){let t=Date.now(),n=t-this._lastTapTime,r={x:e.clientX,y:e.clientY};return n<f.MAX_TIME_MS&&x(r,this._lastTapPosition,f.MAX_DISTANCE_PX)?(w(f.VIBRATION_MS),this.resetSizes(e),this._lastTapTime=0,!0):(this._lastTapTime=t,this._lastTapPosition=r,!1)}_createMoveHandler(e){return t=>{if(this._isDragging)try{let n=(this.axis===`x`?t.clientX:t.clientY)-e,r={x:t.clientX,y:t.clientY};this.dispatchEvent(T(_.RESIZE_DRAG,{axis:this.axis,delta:n,position:r})),this._grid&&this._startNode&&this._endNode&&this._updateGridSizes(n)}catch(e){console.error(`Error during drag:`,e)}}}_createStopHandler(e){return t=>{try{let n=(this.axis===`x`?t.clientX:t.clientY)-e,r={x:t.clientX,y:t.clientY};this.dispatchEvent(T(_.RESIZE_END,{axis:this.axis,delta:n,position:r})),this._boundMove&&=(window.removeEventListener(`pointermove`,this._boundMove),void 0),this._boundStop&&=(window.removeEventListener(`pointerup`,this._boundStop),void 0),this._grid&&this._grid.style.removeProperty(`transition`),this._isDragging=!1,this.setSyntheticActiveState(!1)}catch(e){console.error(`Error stopping drag:`,e),this._isDragging=!1,this.setSyntheticActiveState(!1)}}}_updateGridSizes(e){if(!this._grid)return;this._grid.style.transition=`none`;let t=this._startSize+e,n=this._endSize-e,r=t+n||1;this._grid.style.setProperty(`--start-element-size`,`${v(t,r)}fr`),this._grid.style.setProperty(`--end-element-size`,`${v(n,r)}fr`),this._updateAriaAttributes()}_handleKeyboardResize(e){let t={x:0,y:0};if(this.dispatchEvent(T(_.RESIZE_START,{axis:this.axis,startPosition:t})),this._grid&&this._startNode&&this._endNode){let t=this._startNode.getBoundingClientRect(),n=this._endNode.getBoundingClientRect(),r=this.axis===`x`;this._startSize=r?t.width:t.height,this._endSize=r?n.width:n.height;let i=this._startSize+e,a=this._endSize-e,o=i+a||1;this._grid.style.setProperty(`--start-element-size`,`${v(i,o)}fr`),this._grid.style.setProperty(`--end-element-size`,`${v(a,o)}fr`),this._updateAriaAttributes()}this.dispatchEvent(T(_.RESIZE_DRAG,{axis:this.axis,delta:e,position:t})),this.dispatchEvent(T(_.RESIZE_END,{axis:this.axis,delta:e,position:t}))}render(){return t`
      <div class="handle-content">
        <span class="sr-only">
          Use arrow keys to resize, hold Shift for larger steps. Double-click to
          reset.
        </span>
        <div>
          ${this._pivot===`start`?t`<slot name="${g.PIVOT}"></slot>`:``}
        </div>
        <div class="icon-container" part="icon-container">
          <slot name="${g.ICON}"></slot>
        </div>
        <div>
          ${this._pivot===`end`?t`<slot name="${g.PIVOT}"></slot>`:``}
        </div>
      </div>
    `}};o([i({type:String,reflect:!0}),s(`design:type`,Object)],D.prototype,`axis`,void 0),o([a(),s(`design:type`,Object)],D.prototype,`_isDragging`,void 0);var{stablePrefix:O}=u,k=class extends D{};k=o([r(`${O}-resizer-handle`)],k);var A=n`:host{position:absolute;display:block;background:currentColor;block-size:max(1px,var(--resizer-thickness));cursor:all-scroll;inline-size:max(1px,var(--resizer-thickness));-webkit-user-select:none;-ms-user-select:none;user-select:none}:host:before{position:absolute;z-index:1;background-color:var(--resizer-grab-color);block-size:calc(max(1px,var(--resizer-thickness)) + max(0px,var(--resizer-grab-thickness)));content:"";inline-size:calc(max(1px,var(--resizer-thickness)) + max(0px,var(--resizer-grab-thickness)));margin-block-start:calc(-.5*max(0px,var(--resizer-grab-thickness)));margin-inline-start:calc(-.5*max(0px,var(--resizer-grab-thickness)))}:host([position=start]){margin-inline-start:calc(-1*max(1px,var(--resizer-thickness)))}`,j=class extends e{constructor(...e){super(...e),this._cachedHandle=null,this.resetSizes=e=>{this.getHandle()?.resetSizes(e)},this.handlePointerDown=e=>{let t=this.getHandle();t&&(t.setSyntheticActiveState(!0),t.startDrag(e))},this.handlePointerEnter=()=>{this.getHandle()?.setSyntheticHoverState(!0)},this.handlePointerLeave=()=>{let e=this.getHandle();e&&(e.setSyntheticHoverState(!1),e.setSyntheticActiveState(!1))}}static{this.styles=A}getHandle(){if(this._cachedHandle)return this._cachedHandle;let e=this.parentElement;if(!e)return null;let t=e.closest(`clabs-resizer-grid`);if(!t)return null;let n=t.closest(`clabs-resizer-panel`);if(!n)return null;let r=n.closest(`clabs-resizer-grid`);if(!r)return null;let i=r.querySelector(`clabs-resizer-handle[slot="handle-horizontal"]`);return this._cachedHandle=i,i}connectedCallback(){super.connectedCallback(),this.setAttribute(`slot`,`pivot`),this.addEventListener(`pointerdown`,this.handlePointerDown),this.addEventListener(`pointerenter`,this.handlePointerEnter),this.addEventListener(`pointerleave`,this.handlePointerLeave),this.addEventListener(`dblclick`,this.resetSizes),this.setAttribute(`position`,this.parentElement.pivot)}disconnectedCallback(){let e=this._cachedHandle||this.getHandle();e?.setSyntheticHoverState(!1),e?.setSyntheticActiveState(!1),this._cachedHandle=null,super.disconnectedCallback()}render(){return t``}},{stablePrefix:M}=u,N=class extends j{};N=o([r(`${M}-resizer-handle-pivot`)],N);var P=n`:host{--start-element-size: 1fr;--end-element-size: 1fr;display:grid;overflow:hidden;block-size:100%;inline-size:100%;transition:grid-template-columns .18s cubic-bezier(.25,.9,.25,1),grid-template-rows .18s cubic-bezier(.25,.9,.25,1)}:host([axis=x]){grid-template-columns:var(--start-element-size) auto var(--end-element-size)}:host([axis=y]){grid-template-rows:var(--start-element-size) auto var(--end-element-size)}@media(prefers-reduced-motion:reduce){:host{transition:none}}`,F=class extends e{static{this.styles=P}render(){return t`
      <slot name="left"></slot>
      <slot name="top"></slot>
      <slot name="handle-horizontal"></slot>
      <slot name="handle-vertical"></slot>
      <slot name="right"></slot>
      <slot name="bottom"></slot>
    `}},{stablePrefix:I}=u,L=class extends F{};L=o([r(`${I}-resizer-grid`)],L);var R=n`:host{overflow:hidden}`,z=class extends e{static{this.styles=R}render(){return t` <slot></slot> `}},{stablePrefix:B}=u,V=class extends z{};V=o([r(`${B}-resizer-panel`)],V);var H={title:`Components/Resizer`,parameters:{layout:`fullscreen`},argTypes:{"--resizer-thickness":{control:{type:`range`,min:1,max:16,step:1},description:`Thickness of the resizer handle`,table:{defaultValue:{summary:`4px`}}},"--resizer-grab-thickness":{control:{type:`range`,min:0,max:32,step:1},description:`Additional grab area thickness`,table:{defaultValue:{summary:`8px`}}},"--resizer-grab-color":{control:{type:`boolean`},description:`Show grab area color (uses --cds-background-selected token)`,table:{defaultValue:{summary:`false`}}}},args:{"--resizer-thickness":4,"--resizer-grab-thickness":8,"--resizer-grab-color":!1}},U=e=>t`
  <style>
    .container {
      width: 600px;
      height: 400px;
      --resizer-thickness: ${e[`--resizer-thickness`]}px;
      --resizer-grab-thickness: ${e[`--resizer-grab-thickness`]}px;
      --resizer-grab-color: ${e[`--resizer-grab-color`]?`var(--cds-background-selected)`:`transparent`};
    }

    .nested-container {
      width: 800px;
      height: 600px;
      --resizer-thickness: ${e[`--resizer-thickness`]}px;
      --resizer-grab-thickness: ${e[`--resizer-grab-thickness`]}px;
      --resizer-grab-color: ${e[`--resizer-grab-color`]?`var(--cds-background-selected)`:`transparent`};
    }

    .panel-content {
      padding: var(--cds-spacing-05);
      background: var(--cds-layer);
      height: 100%;
      overflow: auto;
    }
  </style>
`,W=e=>{let n=0;return t`
    ${U(e)}
    <style>
      .single-panel {
        display: flex;
        flex-direction: column;
        width: 600px;
        overflow: hidden;
        --resizer-thickness: ${e[`--resizer-thickness`]}px;
        --resizer-grab-thickness: ${e[`--resizer-grab-thickness`]}px;
        --resizer-grab-color: ${e[`--resizer-grab-color`]?`var(--cds-background-selected)`:`transparent`};
      }

      .single-panel__panel {
        padding: var(--cds-spacing-05);
        background-color: var(--cds-layer);
        min-block-size: var(--cds-spacing-09);
        overflow: auto;
        height: 200px;
      }
    </style>
    <div class="single-panel">
      <div class="single-panel__panel">
        <h3>Single Panel (no boundaries)</h3>
        <p>
          This is a basic resizable panel that can be adjusted vertically using
          the resize handle below. The handle emits events that you can listen
          to for custom resize logic.
        </p>
      </div>
      <clabs-resizer-handle
        class="no-boundary-example-handle"
        @resize-start=${e=>{let t=e.target.previousElementSibling;t&&(n=t.offsetHeight,t.style.transition=`none`)}}
        @resize-drag=${e=>{let t=e.target.previousElementSibling;if(t&&e.detail.delta!==void 0){let r=n+e.detail.delta;t.style.height=`${Math.max(48,r)}px`}}}
        @resize-reset=${e=>{let t=e.target.previousElementSibling;t&&(t.style.transition=`height 180ms cubic-bezier(0.25, 0.9, 0.25, 1)`,t.style.height=`200px`)}}></clabs-resizer-handle>
    </div>
  `},G=e=>{let n=0;return t`
    ${U(e)}
    <style>
      .single-panel-bounded {
        width: 600px;
        height: 400px;
        overflow: hidden;
        --resizer-thickness: ${e[`--resizer-thickness`]}px;
        --resizer-grab-thickness: ${e[`--resizer-grab-thickness`]}px;
        --resizer-grab-color: ${e[`--resizer-grab-color`]?`var(--cds-background-selected)`:`transparent`};
      }

      .single-panel-bounded__container {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .single-panel-bounded__panel {
        padding: var(--cds-spacing-05);
        background-color: var(--cds-layer);
        min-block-size: var(--cds-spacing-09);
        overflow: auto;
        height: 200px;
      }
    </style>
    <div class="single-panel-bounded">
      <div class="single-panel-bounded__container">
        <div class="single-panel-bounded__panel">
          <h3>Single Panel (bounded)</h3>
          <p>
            This panel demonstrates how resizing can be constrained within fixed
            boundaries. The panel is contained within a 600x400 pixel container.
            The resize logic uses events to constrain the height.
          </p>
        </div>
        <clabs-resizer-handle
          @resize-start=${e=>{let t=e.target.previousElementSibling;t&&(n=t.offsetHeight,t.style.transition=`none`)}}
          @resize-drag=${e=>{let t=e.target.previousElementSibling,r=e.target.parentElement;if(t&&r&&e.detail.delta!==void 0){let i=r.offsetHeight,a=n+e.detail.delta,o=Math.max(48,Math.min(a,i-20));t.style.height=`${o}px`}}}
          @resize-reset=${e=>{let t=e.target.previousElementSibling;t&&(t.style.transition=`height 180ms cubic-bezier(0.25, 0.9, 0.25, 1)`,t.style.height=`200px`)}}></clabs-resizer-handle>
      </div>
    </div>
  `},K=e=>{let n=0;return t`
    ${U(e)}
    <style>
      .single-panel-overlay {
        position: relative;
        width: 600px;
        height: 400px;
        overflow: hidden;
        --resizer-thickness: ${e[`--resizer-thickness`]}px;
        --resizer-grab-thickness: ${e[`--resizer-grab-thickness`]}px;
        --resizer-grab-color: ${e[`--resizer-grab-color`]?`var(--cds-background-selected)`:`transparent`};
      }

      .single-panel-overlay__content {
        padding: var(--cds-spacing-05);
        height: 100%;
        overflow: auto;
      }

      .single-panel-overlay__panel {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        max-height: 400px;
        background-color: var(--cds-layer);
        z-index: 1;
        display: flex;
        flex-direction: column;
      }

      .single-panel-overlay__panel-content {
        padding: var(--cds-spacing-05);
        overflow: auto;
        height: 200px;
        min-block-size: var(--cds-spacing-09);
      }
    </style>
    <div class="single-panel-overlay">
      <div class="single-panel-overlay__content">
        <h3>Main Content</h3>
        <p>
          This is the main content area that remains fixed in the background.
        </p>
      </div>
      <div class="single-panel-overlay__panel">
        <clabs-resizer-handle
          @resize-start=${e=>{let t=e.target.nextElementSibling;t&&(n=t.offsetHeight,t.style.transition=`none`)}}
          @resize-drag=${e=>{let t=e.target.nextElementSibling,r=e.target.closest(`.single-panel-overlay`);if(t&&r&&e.detail.delta!==void 0){let i=r.offsetHeight,a=n-e.detail.delta,o=Math.max(48,Math.min(a,i-20));t.style.height=`${o}px`}}}
          @resize-reset=${e=>{let t=e.target.nextElementSibling;t&&(t.style.transition=`height 180ms cubic-bezier(0.25, 0.9, 0.25, 1)`,t.style.height=`200px`)}}></clabs-resizer-handle>
        <div class="single-panel-overlay__panel-content">
          <h3>Overlay Panel</h3>
          <p>
            This sliding panel overlays the main content and can be resized from
            the top edge using event-driven resize logic.
          </p>
        </div>
      </div>
    </div>
  `},q=e=>t`
  ${U(e)}
  <div class="container">
    <clabs-resizer-grid axis="y">
      <clabs-resizer-panel slot="top">
        <div class="panel-content">
          <h3>Top Panel</h3>
          <p>Drag the handle below to resize. Double-click to reset.</p>
        </div>
      </clabs-resizer-panel>

      <clabs-resizer-handle slot="handle-vertical"></clabs-resizer-handle>

      <clabs-resizer-panel slot="bottom">
        <div class="panel-content">
          <h3>Bottom Panel</h3>
          <p>This panel adjusts automatically.</p>
        </div>
      </clabs-resizer-panel>
    </clabs-resizer-grid>
  </div>
`,J=e=>t`
  ${U(e)}
  <div class="container">
    <clabs-resizer-grid axis="x">
      <clabs-resizer-panel slot="left">
        <div class="panel-content">
          <h3>Left Panel</h3>
          <p>Drag the handle to the right to resize. Double-click to reset.</p>
        </div>
      </clabs-resizer-panel>

      <clabs-resizer-handle slot="handle-horizontal"></clabs-resizer-handle>

      <clabs-resizer-panel slot="right">
        <div class="panel-content">
          <h3>Right Panel</h3>
          <p>This panel adjusts automatically.</p>
        </div>
      </clabs-resizer-panel>
    </clabs-resizer-grid>
  </div>
`,Y=e=>t`
  ${U(e)}
  <div class="nested-container">
    <clabs-resizer-grid axis="x">
      <clabs-resizer-panel slot="left">
        <div class="panel-content">
          <h3>Left Panel</h3>
          <p>This is a fixed left panel.</p>
        </div>
      </clabs-resizer-panel>

      <clabs-resizer-handle slot="handle-horizontal"></clabs-resizer-handle>

      <clabs-resizer-panel slot="right">
        <clabs-resizer-grid axis="y">
          <clabs-resizer-panel slot="top">
            <div class="panel-content">
              <h3>Top Right Panel</h3>
              <p>Nested vertical resizer.</p>
            </div>
          </clabs-resizer-panel>

          <clabs-resizer-handle slot="handle-vertical"></clabs-resizer-handle>

          <clabs-resizer-panel slot="bottom">
            <div class="panel-content">
              <h3>Bottom Right Panel</h3>
              <p>Resize both horizontally and vertically.</p>
            </div>
          </clabs-resizer-panel>
        </clabs-resizer-grid>
      </clabs-resizer-panel>
    </clabs-resizer-grid>
  </div>
`,X=e=>{let n=e.reverse||!1,r=t`
    <clabs-resizer-grid axis="y" class="inner-grid">
      <clabs-resizer-panel slot="top">
        <div class="panel-content">
          <h3>${n?`Top Left`:`Top Right`} Panel</h3>
          <p>
            ${n?`This is the reverse layout - the nested grid is on the left side. The pivot handle appears at the intersection.`:`Notice the pivot handle at the intersection - it allows you to resize both axes simultaneously.`}
          </p>
        </div>
      </clabs-resizer-panel>

      <clabs-resizer-handle slot="handle-vertical">
        <clabs-resizer-handle-pivot></clabs-resizer-handle-pivot>
      </clabs-resizer-handle>

      <clabs-resizer-panel slot="bottom">
        <div class="panel-content">
          <h3>${n?`Bottom Left`:`Bottom Right`} Panel</h3>
          <p>
            The pivot handle
            ${n?`allows simultaneous resizing of both the horizontal and vertical axes`:`appears at the corner where the two resizer handles meet`}.
          </p>
        </div>
      </clabs-resizer-panel>
    </clabs-resizer-grid>
  `,i=t`
    <div class="panel-content">
      <h3>${n?`Right`:`Left`} Panel</h3>
      <p>
        This is the ${n?`right`:`left`} panel. Resize using the
        vertical handle.
      </p>
    </div>
  `;return t`
    ${U(e)}
    <style>
      .pivot-container {
        width: 800px;
        height: 600px;
        --resizer-thickness: ${e[`--resizer-thickness`]}px;
        --resizer-grab-thickness: ${e[`--resizer-grab-thickness`]}px;
        --resizer-grab-color: ${e[`--resizer-grab-color`]?`var(--cds-background-selected)`:`transparent`};
      }

      .outer-grid {
        --start-element-size: ${n?`4fr`:`1fr`};
        --end-element-size: ${n?`1fr`:`4fr`};
      }

      .inner-grid {
        --start-element-size: 3fr;
        --end-element-size: 1fr;
      }
    </style>
    <div class="pivot-container">
      <clabs-resizer-grid axis="x" class="outer-grid">
        <clabs-resizer-panel slot="left">
          ${n?r:i}
        </clabs-resizer-panel>

        <clabs-resizer-handle slot="handle-horizontal"></clabs-resizer-handle>

        <clabs-resizer-panel slot="right">
          ${n?i:r}
        </clabs-resizer-panel>
      </clabs-resizer-grid>
    </div>
  `};X.argTypes={reverse:{control:{type:`boolean`},description:`Reverse the layout (nested grid on left instead of right)`,table:{defaultValue:{summary:`false`}}}},X.args={reverse:!1};var Z=e=>{let n=0,r=e=>{let t=e.target.previousElementSibling;t&&(n=t.offsetHeight,t.style.transition=`none`)},i=e=>{let t=e.target.previousElementSibling,r=e.target.parentElement;if(t&&r&&e.detail.delta!==void 0){let i=r.offsetHeight,a=n+e.detail.delta,o=Math.max(48,Math.min(a,i-20));t.style.height=`${o}px`}},a=e=>{let t=e.target.previousElementSibling;t&&(t.style.transition=`height 180ms cubic-bezier(0.25, 0.9, 0.25, 1)`,t.style.height=`150px`)};return t`
    ${U(e)}
    <style>
      .parent-container {
        display: flex;
        flex-wrap: wrap;
        gap: var(--cds-spacing-05);
      }

      .custom-handle-container {
        width: 400px;
        height: 300px;
        overflow: hidden;
        --resizer-thickness: ${e[`--resizer-thickness`]}px;
        --resizer-grab-thickness: ${e[`--resizer-grab-thickness`]}px;
        --resizer-grab-color: ${e[`--resizer-grab-color`]?`var(--cds-background-selected)`:`transparent`};
      }

      .custom-handle-flex {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .custom-panel {
        padding: var(--cds-spacing-05);
        background-color: var(--cds-layer);
        min-block-size: var(--cds-spacing-09);
        overflow: auto;
        height: 150px;
      }

      .custom-icon {
        position: absolute;
      }

      /************* Handler 5: Arrow Transition on Hover *************/
      .custom-drag-handler-5 {
        width: var(--cds-spacing-04);
        height: var(--resizer-thickness);
        margin: auto;
        background: var(--cds-border-inverse);
        position: relative;
        transition: all 0.3s ease;
      }

      .custom-drag-handler-5::before,
      .custom-drag-handler-5::after {
        content: '';
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        border-left: var(--cds-spacing-02) solid transparent;
        border-right: var(--cds-spacing-02) solid transparent;
        transition: all 150ms ease;
      }

      .custom-drag-handler-5::before {
        bottom: 100%;
      }

      .custom-drag-handler-5::after {
        top: 100%;
      }

      clabs-resizer-handle.custom-resizer-5:hover .custom-drag-handler-5,
      clabs-resizer-handle.custom-resizer-5:focus .custom-drag-handler-5 {
        width: var(--cds-spacing-01);
        background: var(--cds-layer-selected-inverse);
      }

      clabs-resizer-handle.custom-resizer-5:hover
        .custom-drag-handler-5::before,
      clabs-resizer-handle.custom-resizer-5:focus
        .custom-drag-handler-5::before {
        border-bottom: var(--cds-spacing-02) solid
          var(--cds-layer-selected-inverse);
      }

      clabs-resizer-handle.custom-resizer-5:hover .custom-drag-handler-5::after,
      clabs-resizer-handle.custom-resizer-5:focus
        .custom-drag-handler-5::after {
        border-top: var(--cds-spacing-02) solid
          var(--cds-layer-selected-inverse);
      }

      /************* Handler 7: Static Arrow *************/
      .custom-drag-handler-7 {
        width: var(--cds-spacing-01);
        height: var(--resizer-thickness);
        top: 0;
        margin: auto;
        position: relative;
      }

      .custom-drag-handler-7::before,
      .custom-drag-handler-7::after {
        content: '';
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        border-left: var(--cds-spacing-02) solid transparent;
        border-right: var(--cds-spacing-02) solid transparent;
      }

      .custom-drag-handler-7::before {
        bottom: 100%;
        border-bottom: var(--cds-spacing-02) solid
          var(--cds-layer-selected-inverse);
      }

      .custom-drag-handler-7::after {
        top: 100%;
        border-top: var(--cds-spacing-02) solid
          var(--cds-layer-selected-inverse);
      }
    </style>

    <div class="parent-container">
      <!-- Handler 1: Drag icon -->
      <div class="custom-handle-container">
        <div class="custom-handle-flex">
          <div class="custom-panel">
            <h4>Drag Icon</h4>
            <p>Custom handle with a drag icon in the icon slot</p>
          </div>
          <clabs-resizer-handle
            @resize-start=${r}
            @resize-drag=${i}
            @resize-reset=${a}>
            ${c(l,{slot:`icon`,class:`custom-icon`})}
          </clabs-resizer-handle>
        </div>
      </div>

      <!-- Handler 5: Arrow Transition on Hover -->
      <div class="custom-handle-container">
        <div class="custom-handle-flex">
          <div class="custom-panel">
            <h4>Arrow Transition</h4>
            <p>Custom drag handle transitioning into an arrow</p>
          </div>
          <clabs-resizer-handle
            class="custom-resizer-5"
            @resize-start=${r}
            @resize-drag=${i}
            @resize-reset=${a}>
            <div slot="icon" class="custom-drag-handler-5"></div>
          </clabs-resizer-handle>
        </div>
      </div>

      <!-- Handler 7: Static Arrow -->
      <div class="custom-handle-container">
        <div class="custom-handle-flex">
          <div class="custom-panel">
            <h4>Static Arrows</h4>
            <p>Custom drag handle with static arrows</p>
          </div>
          <clabs-resizer-handle
            class="custom-resizer-7"
            @resize-start=${r}
            @resize-drag=${i}
            @resize-reset=${a}>
            <div slot="icon" class="custom-drag-handler-7"></div>
          </clabs-resizer-handle>
        </div>
      </div>
    </div>
  `};W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`args => {
  let initialHeight = 0;

  /**
   * Handle resize start event
   * @param {CustomEvent} e - Resize event
   */
  const handleResizeStart = e => {
    const panel = e.target.previousElementSibling;
    if (panel) {
      initialHeight = panel.offsetHeight;
      panel.style.transition = 'none';
    }
  };

  /**
   * Handle resize event
   * @param {CustomEvent} e - Resize event
   */
  const handleResize = e => {
    const panel = e.target.previousElementSibling;
    if (panel && e.detail.delta !== undefined) {
      const newHeight = initialHeight + e.detail.delta;
      panel.style.height = \`\${Math.max(48, newHeight)}px\`;
    }
  };

  /**
   * Handle resize reset event (double-click)
   * @param {CustomEvent} e - Resize event
   */
  const handleReset = e => {
    const panel = e.target.previousElementSibling;
    if (panel) {
      panel.style.transition = 'height 180ms cubic-bezier(0.25, 0.9, 0.25, 1)';
      panel.style.height = '200px';
    }
  };
  return html\`
    \${getStyles(args)}
    <style>
      .single-panel {
        display: flex;
        flex-direction: column;
        width: 600px;
        overflow: hidden;
        --resizer-thickness: \${args['--resizer-thickness']}px;
        --resizer-grab-thickness: \${args['--resizer-grab-thickness']}px;
        --resizer-grab-color: \${args['--resizer-grab-color'] ? 'var(--cds-background-selected)' : 'transparent'};
      }

      .single-panel__panel {
        padding: var(--cds-spacing-05);
        background-color: var(--cds-layer);
        min-block-size: var(--cds-spacing-09);
        overflow: auto;
        height: 200px;
      }
    </style>
    <div class="single-panel">
      <div class="single-panel__panel">
        <h3>Single Panel (no boundaries)</h3>
        <p>
          This is a basic resizable panel that can be adjusted vertically using
          the resize handle below. The handle emits events that you can listen
          to for custom resize logic.
        </p>
      </div>
      <clabs-resizer-handle
        class="no-boundary-example-handle"
        @resize-start=\${handleResizeStart}
        @resize-drag=\${handleResize}
        @resize-reset=\${handleReset}></clabs-resizer-handle>
    </div>
  \`;
}`,...W.parameters?.docs?.source},description:{story:`Single panel no boundaries example
@param {object} args - Story arguments
@returns {TemplateResult} Story template`,...W.parameters?.docs?.description}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`args => {
  let initialHeight = 0;

  /**
   * Handle resize start event
   * @param {CustomEvent} e - Resize event
   */
  const handleResizeStart = e => {
    const panel = e.target.previousElementSibling;
    if (panel) {
      initialHeight = panel.offsetHeight;
      panel.style.transition = 'none';
    }
  };

  /**
   * Handle resize event with boundary constraints
   * @param {CustomEvent} e - Resize event
   */
  const handleResize = e => {
    const panel = e.target.previousElementSibling;
    const container = e.target.parentElement;
    if (panel && container && e.detail.delta !== undefined) {
      const containerHeight = container.offsetHeight;
      const newHeight = initialHeight + e.detail.delta;
      // Constrain between min height and container height
      const constrainedHeight = Math.max(48, Math.min(newHeight, containerHeight - 20));
      panel.style.height = \`\${constrainedHeight}px\`;
    }
  };

  /**
   * Handle resize reset event (double-click)
   * @param {CustomEvent} e - Resize event
   */
  const handleReset = e => {
    const panel = e.target.previousElementSibling;
    if (panel) {
      panel.style.transition = 'height 180ms cubic-bezier(0.25, 0.9, 0.25, 1)';
      panel.style.height = '200px';
    }
  };
  return html\`
    \${getStyles(args)}
    <style>
      .single-panel-bounded {
        width: 600px;
        height: 400px;
        overflow: hidden;
        --resizer-thickness: \${args['--resizer-thickness']}px;
        --resizer-grab-thickness: \${args['--resizer-grab-thickness']}px;
        --resizer-grab-color: \${args['--resizer-grab-color'] ? 'var(--cds-background-selected)' : 'transparent'};
      }

      .single-panel-bounded__container {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .single-panel-bounded__panel {
        padding: var(--cds-spacing-05);
        background-color: var(--cds-layer);
        min-block-size: var(--cds-spacing-09);
        overflow: auto;
        height: 200px;
      }
    </style>
    <div class="single-panel-bounded">
      <div class="single-panel-bounded__container">
        <div class="single-panel-bounded__panel">
          <h3>Single Panel (bounded)</h3>
          <p>
            This panel demonstrates how resizing can be constrained within fixed
            boundaries. The panel is contained within a 600x400 pixel container.
            The resize logic uses events to constrain the height.
          </p>
        </div>
        <clabs-resizer-handle
          @resize-start=\${handleResizeStart}
          @resize-drag=\${handleResize}
          @resize-reset=\${handleReset}></clabs-resizer-handle>
      </div>
    </div>
  \`;
}`,...G.parameters?.docs?.source},description:{story:`Single panel bounded example
@param {object} args - Story arguments
@returns {TemplateResult} Story template`,...G.parameters?.docs?.description}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`args => {
  let initialHeight = 0;

  /**
   * Handle resize start event
   * @param {CustomEvent} e - Resize event
   */
  const handleResizeStart = e => {
    const panelContent = e.target.nextElementSibling;
    if (panelContent) {
      initialHeight = panelContent.offsetHeight;
      panelContent.style.transition = 'none';
    }
  };

  /**
   * Handle resize event for overlay panel
   * @param {CustomEvent} e - Resize event
   */
  const handleResize = e => {
    const panelContent = e.target.nextElementSibling;
    const container = e.target.closest('.single-panel-overlay');
    if (panelContent && container && e.detail.delta !== undefined) {
      const containerHeight = container.offsetHeight;
      // Invert delta because we're resizing from top
      const newHeight = initialHeight - e.detail.delta;
      // Constrain between min height and container height
      const constrainedHeight = Math.max(48, Math.min(newHeight, containerHeight - 20));
      panelContent.style.height = \`\${constrainedHeight}px\`;
    }
  };

  /**
   * Handle resize reset event (double-click)
   * @param {CustomEvent} e - Resize event
   */
  const handleReset = e => {
    const panelContent = e.target.nextElementSibling;
    if (panelContent) {
      panelContent.style.transition = 'height 180ms cubic-bezier(0.25, 0.9, 0.25, 1)';
      panelContent.style.height = '200px';
    }
  };
  return html\`
    \${getStyles(args)}
    <style>
      .single-panel-overlay {
        position: relative;
        width: 600px;
        height: 400px;
        overflow: hidden;
        --resizer-thickness: \${args['--resizer-thickness']}px;
        --resizer-grab-thickness: \${args['--resizer-grab-thickness']}px;
        --resizer-grab-color: \${args['--resizer-grab-color'] ? 'var(--cds-background-selected)' : 'transparent'};
      }

      .single-panel-overlay__content {
        padding: var(--cds-spacing-05);
        height: 100%;
        overflow: auto;
      }

      .single-panel-overlay__panel {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        max-height: 400px;
        background-color: var(--cds-layer);
        z-index: 1;
        display: flex;
        flex-direction: column;
      }

      .single-panel-overlay__panel-content {
        padding: var(--cds-spacing-05);
        overflow: auto;
        height: 200px;
        min-block-size: var(--cds-spacing-09);
      }
    </style>
    <div class="single-panel-overlay">
      <div class="single-panel-overlay__content">
        <h3>Main Content</h3>
        <p>
          This is the main content area that remains fixed in the background.
        </p>
      </div>
      <div class="single-panel-overlay__panel">
        <clabs-resizer-handle
          @resize-start=\${handleResizeStart}
          @resize-drag=\${handleResize}
          @resize-reset=\${handleReset}></clabs-resizer-handle>
        <div class="single-panel-overlay__panel-content">
          <h3>Overlay Panel</h3>
          <p>
            This sliding panel overlays the main content and can be resized from
            the top edge using event-driven resize logic.
          </p>
        </div>
      </div>
    </div>
  \`;
}`,...K.parameters?.docs?.source},description:{story:`Single panel overlay example
@param {object} args - Story arguments
@returns {TemplateResult} Story template`,...K.parameters?.docs?.description}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`args => html\`
  \${getStyles(args)}
  <div class="container">
    <clabs-resizer-grid axis="y">
      <clabs-resizer-panel slot="top">
        <div class="panel-content">
          <h3>Top Panel</h3>
          <p>Drag the handle below to resize. Double-click to reset.</p>
        </div>
      </clabs-resizer-panel>

      <clabs-resizer-handle slot="handle-vertical"></clabs-resizer-handle>

      <clabs-resizer-panel slot="bottom">
        <div class="panel-content">
          <h3>Bottom Panel</h3>
          <p>This panel adjusts automatically.</p>
        </div>
      </clabs-resizer-panel>
    </clabs-resizer-grid>
  </div>
\``,...q.parameters?.docs?.source},description:{story:`Two panels horizontal example
@param {object} args - Story arguments
@returns {TemplateResult} Story template`,...q.parameters?.docs?.description}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`args => html\`
  \${getStyles(args)}
  <div class="container">
    <clabs-resizer-grid axis="x">
      <clabs-resizer-panel slot="left">
        <div class="panel-content">
          <h3>Left Panel</h3>
          <p>Drag the handle to the right to resize. Double-click to reset.</p>
        </div>
      </clabs-resizer-panel>

      <clabs-resizer-handle slot="handle-horizontal"></clabs-resizer-handle>

      <clabs-resizer-panel slot="right">
        <div class="panel-content">
          <h3>Right Panel</h3>
          <p>This panel adjusts automatically.</p>
        </div>
      </clabs-resizer-panel>
    </clabs-resizer-grid>
  </div>
\``,...J.parameters?.docs?.source},description:{story:`Two panels vertical example
@param {object} args - Story arguments
@returns {TemplateResult} Story template`,...J.parameters?.docs?.description}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`args => html\`
  \${getStyles(args)}
  <div class="nested-container">
    <clabs-resizer-grid axis="x">
      <clabs-resizer-panel slot="left">
        <div class="panel-content">
          <h3>Left Panel</h3>
          <p>This is a fixed left panel.</p>
        </div>
      </clabs-resizer-panel>

      <clabs-resizer-handle slot="handle-horizontal"></clabs-resizer-handle>

      <clabs-resizer-panel slot="right">
        <clabs-resizer-grid axis="y">
          <clabs-resizer-panel slot="top">
            <div class="panel-content">
              <h3>Top Right Panel</h3>
              <p>Nested vertical resizer.</p>
            </div>
          </clabs-resizer-panel>

          <clabs-resizer-handle slot="handle-vertical"></clabs-resizer-handle>

          <clabs-resizer-panel slot="bottom">
            <div class="panel-content">
              <h3>Bottom Right Panel</h3>
              <p>Resize both horizontally and vertically.</p>
            </div>
          </clabs-resizer-panel>
        </clabs-resizer-grid>
      </clabs-resizer-panel>
    </clabs-resizer-grid>
  </div>
\``,...Y.parameters?.docs?.source},description:{story:`Nested example
@param {object} args - Story arguments
@returns {TemplateResult} Story template`,...Y.parameters?.docs?.description}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`args => {
  const reverse = args.reverse || false;

  // Shared inner grid template
  const innerGrid = html\`
    <clabs-resizer-grid axis="y" class="inner-grid">
      <clabs-resizer-panel slot="top">
        <div class="panel-content">
          <h3>\${reverse ? 'Top Left' : 'Top Right'} Panel</h3>
          <p>
            \${reverse ? 'This is the reverse layout - the nested grid is on the left side. The pivot handle appears at the intersection.' : 'Notice the pivot handle at the intersection - it allows you to resize both axes simultaneously.'}
          </p>
        </div>
      </clabs-resizer-panel>

      <clabs-resizer-handle slot="handle-vertical">
        <clabs-resizer-handle-pivot></clabs-resizer-handle-pivot>
      </clabs-resizer-handle>

      <clabs-resizer-panel slot="bottom">
        <div class="panel-content">
          <h3>\${reverse ? 'Bottom Left' : 'Bottom Right'} Panel</h3>
          <p>
            The pivot handle
            \${reverse ? 'allows simultaneous resizing of both the horizontal and vertical axes' : 'appears at the corner where the two resizer handles meet'}.
          </p>
        </div>
      </clabs-resizer-panel>
    </clabs-resizer-grid>
  \`;
  const simplePanel = html\`
    <div class="panel-content">
      <h3>\${reverse ? 'Right' : 'Left'} Panel</h3>
      <p>
        This is the \${reverse ? 'right' : 'left'} panel. Resize using the
        vertical handle.
      </p>
    </div>
  \`;
  return html\`
    \${getStyles(args)}
    <style>
      .pivot-container {
        width: 800px;
        height: 600px;
        --resizer-thickness: \${args['--resizer-thickness']}px;
        --resizer-grab-thickness: \${args['--resizer-grab-thickness']}px;
        --resizer-grab-color: \${args['--resizer-grab-color'] ? 'var(--cds-background-selected)' : 'transparent'};
      }

      .outer-grid {
        --start-element-size: \${reverse ? '4fr' : '1fr'};
        --end-element-size: \${reverse ? '1fr' : '4fr'};
      }

      .inner-grid {
        --start-element-size: 3fr;
        --end-element-size: 1fr;
      }
    </style>
    <div class="pivot-container">
      <clabs-resizer-grid axis="x" class="outer-grid">
        <clabs-resizer-panel slot="left">
          \${reverse ? innerGrid : simplePanel}
        </clabs-resizer-panel>

        <clabs-resizer-handle slot="handle-horizontal"></clabs-resizer-handle>

        <clabs-resizer-panel slot="right">
          \${reverse ? simplePanel : innerGrid}
        </clabs-resizer-panel>
      </clabs-resizer-grid>
    </div>
  \`;
}`,...X.parameters?.docs?.source},description:{story:`With pivot handle - demonstrates the pivot handle at the intersection of nested grids
@param {object} args - Story arguments
@returns {TemplateResult} Story template`,...X.parameters?.docs?.description}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`args => {
  let initialHeight1 = 0;

  /**
   * Handle resize start for panel 1
   * @param {CustomEvent} e - Resize event
   */
  const handleResizeStart1 = e => {
    const panel = e.target.previousElementSibling;
    if (panel) {
      initialHeight1 = panel.offsetHeight;
      panel.style.transition = 'none';
    }
  };

  /**
   * Handle resize for panel 1
   * @param {CustomEvent} e - Resize event
   */
  const handleResize1 = e => {
    const panel = e.target.previousElementSibling;
    const container = e.target.parentElement;
    if (panel && container && e.detail.delta !== undefined) {
      const containerHeight = container.offsetHeight;
      const newHeight = initialHeight1 + e.detail.delta;
      const constrainedHeight = Math.max(48, Math.min(newHeight, containerHeight - 20));
      panel.style.height = \`\${constrainedHeight}px\`;
    }
  };

  /**
   * Handle resize reset for panel 1 (double-click)
   * @param {CustomEvent} e - Resize event
   */
  const handleReset1 = e => {
    const panel = e.target.previousElementSibling;
    if (panel) {
      panel.style.transition = 'height 180ms cubic-bezier(0.25, 0.9, 0.25, 1)';
      panel.style.height = '150px';
    }
  };
  return html\`
    \${getStyles(args)}
    <style>
      .parent-container {
        display: flex;
        flex-wrap: wrap;
        gap: var(--cds-spacing-05);
      }

      .custom-handle-container {
        width: 400px;
        height: 300px;
        overflow: hidden;
        --resizer-thickness: \${args['--resizer-thickness']}px;
        --resizer-grab-thickness: \${args['--resizer-grab-thickness']}px;
        --resizer-grab-color: \${args['--resizer-grab-color'] ? 'var(--cds-background-selected)' : 'transparent'};
      }

      .custom-handle-flex {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .custom-panel {
        padding: var(--cds-spacing-05);
        background-color: var(--cds-layer);
        min-block-size: var(--cds-spacing-09);
        overflow: auto;
        height: 150px;
      }

      .custom-icon {
        position: absolute;
      }

      /************* Handler 5: Arrow Transition on Hover *************/
      .custom-drag-handler-5 {
        width: var(--cds-spacing-04);
        height: var(--resizer-thickness);
        margin: auto;
        background: var(--cds-border-inverse);
        position: relative;
        transition: all 0.3s ease;
      }

      .custom-drag-handler-5::before,
      .custom-drag-handler-5::after {
        content: '';
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        border-left: var(--cds-spacing-02) solid transparent;
        border-right: var(--cds-spacing-02) solid transparent;
        transition: all 150ms ease;
      }

      .custom-drag-handler-5::before {
        bottom: 100%;
      }

      .custom-drag-handler-5::after {
        top: 100%;
      }

      clabs-resizer-handle.custom-resizer-5:hover .custom-drag-handler-5,
      clabs-resizer-handle.custom-resizer-5:focus .custom-drag-handler-5 {
        width: var(--cds-spacing-01);
        background: var(--cds-layer-selected-inverse);
      }

      clabs-resizer-handle.custom-resizer-5:hover
        .custom-drag-handler-5::before,
      clabs-resizer-handle.custom-resizer-5:focus
        .custom-drag-handler-5::before {
        border-bottom: var(--cds-spacing-02) solid
          var(--cds-layer-selected-inverse);
      }

      clabs-resizer-handle.custom-resizer-5:hover .custom-drag-handler-5::after,
      clabs-resizer-handle.custom-resizer-5:focus
        .custom-drag-handler-5::after {
        border-top: var(--cds-spacing-02) solid
          var(--cds-layer-selected-inverse);
      }

      /************* Handler 7: Static Arrow *************/
      .custom-drag-handler-7 {
        width: var(--cds-spacing-01);
        height: var(--resizer-thickness);
        top: 0;
        margin: auto;
        position: relative;
      }

      .custom-drag-handler-7::before,
      .custom-drag-handler-7::after {
        content: '';
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        border-left: var(--cds-spacing-02) solid transparent;
        border-right: var(--cds-spacing-02) solid transparent;
      }

      .custom-drag-handler-7::before {
        bottom: 100%;
        border-bottom: var(--cds-spacing-02) solid
          var(--cds-layer-selected-inverse);
      }

      .custom-drag-handler-7::after {
        top: 100%;
        border-top: var(--cds-spacing-02) solid
          var(--cds-layer-selected-inverse);
      }
    </style>

    <div class="parent-container">
      <!-- Handler 1: Drag icon -->
      <div class="custom-handle-container">
        <div class="custom-handle-flex">
          <div class="custom-panel">
            <h4>Drag Icon</h4>
            <p>Custom handle with a drag icon in the icon slot</p>
          </div>
          <clabs-resizer-handle
            @resize-start=\${handleResizeStart1}
            @resize-drag=\${handleResize1}
            @resize-reset=\${handleReset1}>
            \${iconLoader(DragVertical, {
    slot: 'icon',
    class: 'custom-icon'
  })}
          </clabs-resizer-handle>
        </div>
      </div>

      <!-- Handler 5: Arrow Transition on Hover -->
      <div class="custom-handle-container">
        <div class="custom-handle-flex">
          <div class="custom-panel">
            <h4>Arrow Transition</h4>
            <p>Custom drag handle transitioning into an arrow</p>
          </div>
          <clabs-resizer-handle
            class="custom-resizer-5"
            @resize-start=\${handleResizeStart1}
            @resize-drag=\${handleResize1}
            @resize-reset=\${handleReset1}>
            <div slot="icon" class="custom-drag-handler-5"></div>
          </clabs-resizer-handle>
        </div>
      </div>

      <!-- Handler 7: Static Arrow -->
      <div class="custom-handle-container">
        <div class="custom-handle-flex">
          <div class="custom-panel">
            <h4>Static Arrows</h4>
            <p>Custom drag handle with static arrows</p>
          </div>
          <clabs-resizer-handle
            class="custom-resizer-7"
            @resize-start=\${handleResizeStart1}
            @resize-drag=\${handleResize1}
            @resize-reset=\${handleReset1}>
            <div slot="icon" class="custom-drag-handler-7"></div>
          </clabs-resizer-handle>
        </div>
      </div>
    </div>
  \`;
}`,...Z.parameters?.docs?.source},description:{story:`With custom handles example - demonstrates using SVG icons in the icon slot
@param {object} args - Story arguments
@returns {TemplateResult} Story template`,...Z.parameters?.docs?.description}}};var Q=[`SinglePanelNoBoundaries`,`SinglePanelBounded`,`SinglePanelOverlay`,`TwoPanelsHorizontal`,`TwoPanelsVertical`,`Nested`,`WithPivotHandle`,`WithCustomHandles`];export{Y as Nested,G as SinglePanelBounded,W as SinglePanelNoBoundaries,K as SinglePanelOverlay,q as TwoPanelsHorizontal,J as TwoPanelsVertical,Z as WithCustomHandles,X as WithPivotHandle,Q as __namedExportsOrder,H as default};
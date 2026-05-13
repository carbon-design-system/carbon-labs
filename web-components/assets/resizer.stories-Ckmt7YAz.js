import{n as De,t as $}from"./property-ZFgVw4Vi.js";import{i as R,a as H,b as o}from"./iframe-CP1kGWRx.js";import{r as Le}from"./state-B8pDF0S0.js";import{i as Me}from"./icon-loader-Dd7yO-sy.js";var Ne={elem:"svg",attrs:{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 32 32",fill:"currentColor",width:16,height:16},content:[{elem:"path",attrs:{d:"M4 20 15 20 15 26.17 12.41 23.59 11 25 16 30 21 25 19.59 23.59 17 26.17 17 20 28 20 28 18 4 18 4 20z"}},{elem:"path",attrs:{d:"M11 7 12.41 8.41 15 5.83 15 12 4 12 4 14 28 14 28 12 17 12 17 5.83 19.59 8.41 21 7 16 2 11 7z"}}],name:"drag--vertical",size:16};/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const A={stablePrefix:"clabs"},Ie=R`/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */.handle-content{display:flex;block-size:100%;inline-size:100%}.icon-container{display:flex;flex-grow:1;align-items:center;justify-content:center;block-size:100%}:host{display:grid;background:var(--cds-border-subtle);cursor:ns-resize;min-block-size:max(1px,var(--resizer-thickness));min-inline-size:max(1px,var(--resizer-thickness));touch-action:none;-webkit-user-select:none;-ms-user-select:none;user-select:none}:host .icon-container{position:relative}:host .icon-container:before{position:absolute;background-color:var(--resizer-grab-color);block-size:calc(max(1px,var(--resizer-thickness)) + max(0px,var(--resizer-grab-thickness)));content:"";inline-size:100%;inset-inline-start:0}@media(prefers-reduced-motion:no-preference){:host(:hover),:host([data-synthetic-hover]){background-color:var(--cds-border-interactive);transition:background-color var(--cds-duration-moderate-01)}}:host(:focus){background-color:var(--cds-border-interactive);outline:none}:host(:active),:host([data-synthetic-active]){background-color:var(--cds-border-interactive)}:host(:focus:not(:focus-visible)){box-shadow:none;outline:none}:host([slot=handle-horizontal]),:host([orientation=horizontal]){cursor:ew-resize}:host([slot=handle-horizontal]) .icon-container,:host([orientation=horizontal]) .icon-container{position:relative}:host([slot=handle-horizontal]) .icon-container:before,:host([orientation=horizontal]) .icon-container:before{position:absolute;background-color:var(--resizer-grab-color);block-size:100%;content:"";inline-size:calc(max(1px,var(--resizer-thickness)) + max(0px,var(--resizer-grab-thickness)));inset-block-start:0;inset-inline-start:auto}:host([slot=handle-vertical]),:host([orientation=vertical]){cursor:ns-resize;min-inline-size:0}:host([slot=handle-vertical]) .icon-container,:host([orientation=vertical]) .icon-container{position:relative}:host([slot=handle-vertical]) .icon-container:before,:host([orientation=vertical]) .icon-container:before{position:absolute;background-color:var(--resizer-grab-color);block-size:calc(max(1px,var(--resizer-thickness)) + max(0px,var(--resizer-grab-thickness)));content:"";inline-size:100%;inset-inline-start:0}.sr-only{position:absolute;overflow:hidden;padding:0;border:0;margin:-1px;block-size:1px;clip:rect(0,0,0,0);inline-size:1px;white-space:nowrap}`;/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const T={MAX_TIME_MS:300,MAX_DISTANCE_PX:24,VIBRATION_MS:8},B={DEFAULT_STEP_PX:5,LARGE_STEP_PX:25},g={ROLE_SEPARATOR:"separator",LIVE_ASSERTIVE:"assertive",VALUE_MIN:"0",VALUE_MAX:"100",VALUE_DEFAULT:"50"},P={GRID:"clabs-resizer-grid",PANEL:"clabs-resizer-panel"},c={LEFT:"left",RIGHT:"right",TOP:"top",BOTTOM:"bottom",PIVOT:"pivot",ICON:"icon"},u={RESIZE_START:"resize-start",RESIZE_DRAG:"resize-drag",RESIZE_END:"resize-end",RESIZE_RESET:"resize-reset"};/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */function k(r,e){return e<=0?0:Math.max(0,Math.min(1,r/e))}function V(r){const e=Math.round(Math.max(0,Math.min(100,r))),t=100-e;return`${e}% / ${t}%`}function Oe(r,e){return r==="handle-vertical"?"y":r==="handle-horizontal"||e&&e.includes("ew")?"x":"y"}function Be(r,e,t){const a=Math.abs(r.x-e.x),n=Math.abs(r.y-e.y);return a<t&&n<t}function Ve(r,e){try{return Array.from(r.querySelectorAll(e))}catch(t){return console.error(`Error querying selector "${e}":`,t),[]}}function X(r,e){try{return r.closest(e)}catch(t){return console.error(`Error finding closest "${e}":`,t),null}}function Xe(r){if("vibrate"in navigator)try{navigator.vibrate(r)}catch{}}function v(r,e,t){return new CustomEvent(r,{bubbles:!0,composed:!0,detail:e,...t})}function je(r){return r==="x"?"vertical":"horizontal"}var Ue=Object.defineProperty,Ce=(r,e,t,a)=>{for(var n=void 0,s=r.length-1,i;s>=0;s--)(i=r[s])&&(n=i(e,t,n)||n);return n&&Ue(e,t,n),n};const M=class M extends H{constructor(){super(...arguments),this.axis="y",this._isDragging=!1,this._startSize=0,this._endSize=0,this._lastTapTime=0,this._lastTapPosition={x:0,y:0},this.resetSizes=e=>{e.preventDefault();try{if(this.dispatchEvent(v(u.RESIZE_RESET)),this._grid){this._grid.style.removeProperty("--start-element-size"),this._grid.style.removeProperty("--end-element-size");const t=()=>{var a;this._updateAriaAttributes(),(a=this._grid)==null||a.removeEventListener("transitionend",t)};this._grid.addEventListener("transitionend",t,{once:!0})}}catch(t){console.error("Error resetting sizes:",t)}},this.startDrag=e=>{this._handlePointerDown(e)},this._handlePointerDown=e=>{if(!this._detectDoubleTap(e))try{e.preventDefault(),this._isDragging=!0,this.setSyntheticActiveState(!0);const t={x:e.clientX,y:e.clientY},a=this.axis==="x"?e.clientX:e.clientY;if(this.dispatchEvent(v(u.RESIZE_START,{axis:this.axis,startPosition:t})),this._grid&&this._startNode&&this._endNode){const n=this._startNode.getBoundingClientRect(),s=this._endNode.getBoundingClientRect();this._startSize=this.axis==="x"?n.width:n.height,this._endSize=this.axis==="x"?s.width:s.height}this._boundMove=this._createMoveHandler(a),this._boundStop=this._createStopHandler(a),window.addEventListener("pointermove",this._boundMove),window.addEventListener("pointerup",this._boundStop)}catch(t){console.error("Error starting drag:",t),this._isDragging=!1,this.setSyntheticActiveState(!1)}},this._handleKeyDown=e=>{if([...["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Home","End"],"PageUp","PageDown"].includes(e.key)){e.preventDefault(),e.stopPropagation();try{const a=e.shiftKey?B.LARGE_STEP_PX:B.DEFAULT_STEP_PX;let n=0;const s=this.axis==="x";if(e.key==="ArrowUp"&&!s)n=-a;else if(e.key==="ArrowDown"&&!s)n=a;else if(e.key==="ArrowLeft"&&s)n=-a;else if(e.key==="ArrowRight"&&s)n=a;else if(e.key==="Home"&&this._grid&&this._startNode){const i=this._startNode.getBoundingClientRect();n=s?-i.width:-i.height}else if(e.key==="End"&&this._grid&&this._endNode){const i=this._endNode.getBoundingClientRect();n=s?i.width:i.height}n!==0&&this._handleKeyboardResize(n)}catch(a){console.error("Error handling keyboard navigation:",a)}}}}setSyntheticHoverState(e){this.toggleAttribute("data-synthetic-hover",e),this.requestUpdate()}setSyntheticActiveState(e){this.toggleAttribute("data-synthetic-active",e),this.requestUpdate()}_updateAriaAttributes(){if(!(!this._grid||!this._startNode||!this._endNode))try{const e=this._startNode.getBoundingClientRect(),t=this._endNode.getBoundingClientRect(),a=this.axis==="x",n=a?e.width:e.height,s=a?t.width:t.height,i=n+s;if(i>0){const l=Math.round(n/i*100);this.setAttribute("aria-valuenow",l.toString()),this.setAttribute("aria-valuemin",g.VALUE_MIN),this.setAttribute("aria-valuemax",g.VALUE_MAX),this.setAttribute("aria-valuetext",V(l))}}catch(e){console.error("Error updating ARIA attributes:",e)}}connectedCallback(){super.connectedCallback();try{this._initializeComponent(),this._setupEventListeners()}catch(e){console.error("Error initializing resizer handle:",e)}}firstUpdated(){this._grid&&this._startNode&&this._endNode&&requestAnimationFrame(()=>{this._updateAriaAttributes()})}disconnectedCallback(){this._cleanup(),super.disconnectedCallback()}_initializeComponent(){this._grid=X(this,P.GRID)||void 0;const e=this.getAttribute("slot"),t=getComputedStyle(this).cursor;if(this.axis=Oe(e,t),this._grid){const a=Ve(this._grid,P.PANEL);this.axis==="x"?(this._startNode=a.find(n=>n.slot===c.LEFT),this._endNode=a.find(n=>n.slot===c.RIGHT)):(this._startNode=a.find(n=>n.slot===c.TOP),this._endNode=a.find(n=>n.slot===c.BOTTOM))}this._setupAccessibility()}_setupAccessibility(){this.setAttribute("role",g.ROLE_SEPARATOR),this.setAttribute("tabindex","0"),this.setAttribute("aria-orientation",je(this.axis)),this.setAttribute("aria-live",g.LIVE_ASSERTIVE),this._grid&&this._startNode&&this._endNode&&(this.setAttribute("aria-valuenow",g.VALUE_DEFAULT),this.setAttribute("aria-valuemin",g.VALUE_MIN),this.setAttribute("aria-valuemax",g.VALUE_MAX),this.setAttribute("aria-valuetext",V(50)))}_setupEventListeners(){this._boundStartDrag=this._handlePointerDown.bind(this),this._boundHandleKeyDown=this._handleKeyDown.bind(this),this.addEventListener("pointerdown",this._boundStartDrag),this.addEventListener("keydown",this._boundHandleKeyDown)}_cleanup(){this._boundStartDrag&&(this.removeEventListener("pointerdown",this._boundStartDrag),this._boundStartDrag=void 0),this._boundHandleKeyDown&&(this.removeEventListener("keydown",this._boundHandleKeyDown),this._boundHandleKeyDown=void 0),this._boundMove&&(window.removeEventListener("pointermove",this._boundMove),this._boundMove=void 0),this._boundStop&&(window.removeEventListener("pointerup",this._boundStop),this._boundStop=void 0),this.removeAttribute("data-synthetic-hover"),this.removeAttribute("data-synthetic-active"),this._isDragging=!1}get pivot(){return this._pivot}get _pivot(){const e=X(this,P.PANEL);if(!e)return;const t=e.getAttribute("slot");if(t===c.LEFT)return"end";if(t===c.RIGHT)return"start"}_detectDoubleTap(e){const t=Date.now(),a=t-this._lastTapTime,n={x:e.clientX,y:e.clientY};return a<T.MAX_TIME_MS&&Be(n,this._lastTapPosition,T.MAX_DISTANCE_PX)?(Xe(T.VIBRATION_MS),this.resetSizes(e),this._lastTapTime=0,!0):(this._lastTapTime=t,this._lastTapPosition=n,!1)}_createMoveHandler(e){return t=>{if(this._isDragging)try{const n=(this.axis==="x"?t.clientX:t.clientY)-e,s={x:t.clientX,y:t.clientY};this.dispatchEvent(v(u.RESIZE_DRAG,{axis:this.axis,delta:n,position:s})),this._grid&&this._startNode&&this._endNode&&this._updateGridSizes(n)}catch(a){console.error("Error during drag:",a)}}}_createStopHandler(e){return t=>{try{const n=(this.axis==="x"?t.clientX:t.clientY)-e,s={x:t.clientX,y:t.clientY};this.dispatchEvent(v(u.RESIZE_END,{axis:this.axis,delta:n,position:s})),this._boundMove&&(window.removeEventListener("pointermove",this._boundMove),this._boundMove=void 0),this._boundStop&&(window.removeEventListener("pointerup",this._boundStop),this._boundStop=void 0),this._grid&&this._grid.style.removeProperty("transition"),this._isDragging=!1,this.setSyntheticActiveState(!1)}catch(a){console.error("Error stopping drag:",a),this._isDragging=!1,this.setSyntheticActiveState(!1)}}}_updateGridSizes(e){if(!this._grid)return;this._grid.style.transition="none";const t=this._startSize+e,a=this._endSize-e,n=t+a||1;this._grid.style.setProperty("--start-element-size",`${k(t,n)}fr`),this._grid.style.setProperty("--end-element-size",`${k(a,n)}fr`),this._updateAriaAttributes()}_handleKeyboardResize(e){const t={x:0,y:0};if(this.dispatchEvent(v(u.RESIZE_START,{axis:this.axis,startPosition:t})),this._grid&&this._startNode&&this._endNode){const a=this._startNode.getBoundingClientRect(),n=this._endNode.getBoundingClientRect(),s=this.axis==="x";this._startSize=s?a.width:a.height,this._endSize=s?n.width:n.height;const i=this._startSize+e,l=this._endSize-e,d=i+l||1;this._grid.style.setProperty("--start-element-size",`${k(i,d)}fr`),this._grid.style.setProperty("--end-element-size",`${k(l,d)}fr`),this._updateAriaAttributes()}this.dispatchEvent(v(u.RESIZE_DRAG,{axis:this.axis,delta:e,position:t})),this.dispatchEvent(v(u.RESIZE_END,{axis:this.axis,delta:e,position:t}))}render(){return o`
      <div class="handle-content">
        <span class="sr-only">
          Use arrow keys to resize, hold Shift for larger steps. Double-click to
          reset.
        </span>
        <div>
          ${this._pivot==="start"?o`<slot name="${c.PIVOT}"></slot>`:""}
        </div>
        <div class="icon-container" part="icon-container">
          <slot name="${c.ICON}"></slot>
        </div>
        <div>
          ${this._pivot==="end"?o`<slot name="${c.PIVOT}"></slot>`:""}
        </div>
      </div>
    `}};M.styles=Ie;let E=M;Ce([De({type:String,reflect:!0})],E.prototype,"axis");Ce([Le()],E.prototype,"_isDragging");var Ge=Object.getOwnPropertyDescriptor,Ke=(r,e,t,a)=>{for(var n=a>1?void 0:a?Ge(e,t):e,s=r.length-1,i;s>=0;s--)(i=r[s])&&(n=i(n)||n);return n};const{stablePrefix:Fe}=A;let j=class extends E{};j=Ke([$(`${Fe}-resizer-handle`)],j);const Ze=R`/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */:host{position:absolute;display:block;background:currentColor;block-size:max(1px,var(--resizer-thickness));cursor:all-scroll;inline-size:max(1px,var(--resizer-thickness));-webkit-user-select:none;-ms-user-select:none;user-select:none}:host:before{position:absolute;z-index:1;background-color:var(--resizer-grab-color);block-size:calc(max(1px,var(--resizer-thickness)) + max(0px,var(--resizer-grab-thickness)));content:"";inline-size:calc(max(1px,var(--resizer-thickness)) + max(0px,var(--resizer-grab-thickness)));margin-block-start:calc(-.5*max(0px,var(--resizer-grab-thickness)));margin-inline-start:calc(-.5*max(0px,var(--resizer-grab-thickness)))}:host([position=start]){margin-inline-start:calc(-1*max(1px,var(--resizer-thickness)))}`;/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const N=class N extends H{constructor(){super(...arguments),this._cachedHandle=null,this.resetSizes=e=>{var t;(t=this.getHandle())==null||t.resetSizes(e)},this.handlePointerDown=e=>{const t=this.getHandle();t&&(t.setSyntheticActiveState(!0),t.startDrag(e))},this.handlePointerEnter=()=>{var e;(e=this.getHandle())==null||e.setSyntheticHoverState(!0)},this.handlePointerLeave=()=>{const e=this.getHandle();e&&(e.setSyntheticHoverState(!1),e.setSyntheticActiveState(!1))}}getHandle(){if(this._cachedHandle)return this._cachedHandle;const e=this.parentElement;if(!e)return null;const t=e.closest("clabs-resizer-grid");if(!t)return null;const a=t.closest("clabs-resizer-panel");if(!a)return null;const n=a.closest("clabs-resizer-grid");if(!n)return null;const s=n.querySelector('clabs-resizer-handle[slot="handle-horizontal"]');return this._cachedHandle=s,s}connectedCallback(){super.connectedCallback(),this.setAttribute("slot","pivot"),this.addEventListener("pointerdown",this.handlePointerDown),this.addEventListener("pointerenter",this.handlePointerEnter),this.addEventListener("pointerleave",this.handlePointerLeave),this.addEventListener("dblclick",this.resetSizes),this.setAttribute("position",this.parentElement.pivot)}disconnectedCallback(){const e=this._cachedHandle||this.getHandle();e==null||e.setSyntheticHoverState(!1),e==null||e.setSyntheticActiveState(!1),this._cachedHandle=null,super.disconnectedCallback()}render(){return o``}};N.styles=Ze;let C=N;var Ye=Object.getOwnPropertyDescriptor,We=(r,e,t,a)=>{for(var n=a>1?void 0:a?Ye(e,t):e,s=r.length-1,i;s>=0;s--)(i=r[s])&&(n=i(n)||n);return n};const{stablePrefix:qe}=A;let U=class extends C{};U=We([$(`${qe}-resizer-handle-pivot`)],U);const Qe=R`/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */:host{--start-element-size: 1fr;--end-element-size: 1fr;display:grid;overflow:hidden;block-size:100%;inline-size:100%;transition:grid-template-columns .18s cubic-bezier(.25,.9,.25,1),grid-template-rows .18s cubic-bezier(.25,.9,.25,1)}:host([axis=x]){grid-template-columns:var(--start-element-size) auto var(--end-element-size)}:host([axis=y]){grid-template-rows:var(--start-element-size) auto var(--end-element-size)}@media(prefers-reduced-motion:reduce){:host{transition:none}}`;/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const I=class I extends H{render(){return o`
      <slot name="left"></slot>
      <slot name="top"></slot>
      <slot name="handle-horizontal"></slot>
      <slot name="handle-vertical"></slot>
      <slot name="right"></slot>
      <slot name="bottom"></slot>
    `}};I.styles=Qe;let D=I;var Je=Object.getOwnPropertyDescriptor,et=(r,e,t,a)=>{for(var n=a>1?void 0:a?Je(e,t):e,s=r.length-1,i;s>=0;s--)(i=r[s])&&(n=i(n)||n);return n};const{stablePrefix:tt}=A;let G=class extends D{};G=et([$(`${tt}-resizer-grid`)],G);const nt=R`/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */:host{overflow:hidden}`;/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const O=class O extends H{render(){return o` <slot></slot> `}};O.styles=nt;let L=O;var st=Object.getOwnPropertyDescriptor,rt=(r,e,t,a)=>{for(var n=a>1?void 0:a?st(e,t):e,s=r.length-1,i;s>=0;s--)(i=r[s])&&(n=i(n)||n);return n};const{stablePrefix:it}=A;let K=class extends L{};K=rt([$(`${it}-resizer-panel`)],K);/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const at={title:"Components/Resizer",parameters:{layout:"fullscreen"},argTypes:{"--resizer-thickness":{control:{type:"range",min:1,max:16,step:1},description:"Thickness of the resizer handle",table:{defaultValue:{summary:"4px"}}},"--resizer-grab-thickness":{control:{type:"range",min:0,max:32,step:1},description:"Additional grab area thickness",table:{defaultValue:{summary:"8px"}}},"--resizer-grab-color":{control:{type:"boolean"},description:"Show grab area color (uses --cds-background-selected token)",table:{defaultValue:{summary:"false"}}}},args:{"--resizer-thickness":4,"--resizer-grab-thickness":8,"--resizer-grab-color":!1}},p=r=>o`
  <style>
    .container {
      width: 600px;
      height: 400px;
      --resizer-thickness: ${r["--resizer-thickness"]}px;
      --resizer-grab-thickness: ${r["--resizer-grab-thickness"]}px;
      --resizer-grab-color: ${r["--resizer-grab-color"]?"var(--cds-background-selected)":"transparent"};
    }

    .nested-container {
      width: 800px;
      height: 600px;
      --resizer-thickness: ${r["--resizer-thickness"]}px;
      --resizer-grab-thickness: ${r["--resizer-grab-thickness"]}px;
      --resizer-grab-color: ${r["--resizer-grab-color"]?"var(--cds-background-selected)":"transparent"};
    }

    .panel-content {
      padding: var(--cds-spacing-05);
      background: var(--cds-layer);
      height: 100%;
      overflow: auto;
    }
  </style>
`,b=r=>{let e=0;const t=s=>{const i=s.target.previousElementSibling;i&&(e=i.offsetHeight,i.style.transition="none")},a=s=>{const i=s.target.previousElementSibling;if(i&&s.detail.delta!==void 0){const l=e+s.detail.delta;i.style.height=`${Math.max(48,l)}px`}},n=s=>{const i=s.target.previousElementSibling;i&&(i.style.transition="height 180ms cubic-bezier(0.25, 0.9, 0.25, 1)",i.style.height="200px")};return o`
    ${p(r)}
    <style>
      .single-panel {
        display: flex;
        flex-direction: column;
        width: 600px;
        overflow: hidden;
        --resizer-thickness: ${r["--resizer-thickness"]}px;
        --resizer-grab-thickness: ${r["--resizer-grab-thickness"]}px;
        --resizer-grab-color: ${r["--resizer-grab-color"]?"var(--cds-background-selected)":"transparent"};
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
        @resize-start=${t}
        @resize-drag=${a}
        @resize-reset=${n}></clabs-resizer-handle>
    </div>
  `},z=r=>{let e=0;const t=s=>{const i=s.target.previousElementSibling;i&&(e=i.offsetHeight,i.style.transition="none")},a=s=>{const i=s.target.previousElementSibling,l=s.target.parentElement;if(i&&l&&s.detail.delta!==void 0){const d=l.offsetHeight,S=e+s.detail.delta,w=Math.max(48,Math.min(S,d-20));i.style.height=`${w}px`}},n=s=>{const i=s.target.previousElementSibling;i&&(i.style.transition="height 180ms cubic-bezier(0.25, 0.9, 0.25, 1)",i.style.height="200px")};return o`
    ${p(r)}
    <style>
      .single-panel-bounded {
        width: 600px;
        height: 400px;
        overflow: hidden;
        --resizer-thickness: ${r["--resizer-thickness"]}px;
        --resizer-grab-thickness: ${r["--resizer-grab-thickness"]}px;
        --resizer-grab-color: ${r["--resizer-grab-color"]?"var(--cds-background-selected)":"transparent"};
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
          @resize-start=${t}
          @resize-drag=${a}
          @resize-reset=${n}></clabs-resizer-handle>
      </div>
    </div>
  `},m=r=>{let e=0;const t=s=>{const i=s.target.nextElementSibling;i&&(e=i.offsetHeight,i.style.transition="none")},a=s=>{const i=s.target.nextElementSibling,l=s.target.closest(".single-panel-overlay");if(i&&l&&s.detail.delta!==void 0){const d=l.offsetHeight,S=e-s.detail.delta,w=Math.max(48,Math.min(S,d-20));i.style.height=`${w}px`}},n=s=>{const i=s.target.nextElementSibling;i&&(i.style.transition="height 180ms cubic-bezier(0.25, 0.9, 0.25, 1)",i.style.height="200px")};return o`
    ${p(r)}
    <style>
      .single-panel-overlay {
        position: relative;
        width: 600px;
        height: 400px;
        overflow: hidden;
        --resizer-thickness: ${r["--resizer-thickness"]}px;
        --resizer-grab-thickness: ${r["--resizer-grab-thickness"]}px;
        --resizer-grab-color: ${r["--resizer-grab-color"]?"var(--cds-background-selected)":"transparent"};
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
          @resize-start=${t}
          @resize-drag=${a}
          @resize-reset=${n}></clabs-resizer-handle>
        <div class="single-panel-overlay__panel-content">
          <h3>Overlay Panel</h3>
          <p>
            This sliding panel overlays the main content and can be resized from
            the top edge using event-driven resize logic.
          </p>
        </div>
      </div>
    </div>
  `},f=r=>o`
  ${p(r)}
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
`,y=r=>o`
  ${p(r)}
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
`,x=r=>o`
  ${p(r)}
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
`,h=r=>{const e=r.reverse||!1,t=o`
    <clabs-resizer-grid axis="y" class="inner-grid">
      <clabs-resizer-panel slot="top">
        <div class="panel-content">
          <h3>${e?"Top Left":"Top Right"} Panel</h3>
          <p>
            ${e?"This is the reverse layout - the nested grid is on the left side. The pivot handle appears at the intersection.":"Notice the pivot handle at the intersection - it allows you to resize both axes simultaneously."}
          </p>
        </div>
      </clabs-resizer-panel>

      <clabs-resizer-handle slot="handle-vertical">
        <clabs-resizer-handle-pivot></clabs-resizer-handle-pivot>
      </clabs-resizer-handle>

      <clabs-resizer-panel slot="bottom">
        <div class="panel-content">
          <h3>${e?"Bottom Left":"Bottom Right"} Panel</h3>
          <p>
            The pivot handle
            ${e?"allows simultaneous resizing of both the horizontal and vertical axes":"appears at the corner where the two resizer handles meet"}.
          </p>
        </div>
      </clabs-resizer-panel>
    </clabs-resizer-grid>
  `,a=o`
    <div class="panel-content">
      <h3>${e?"Right":"Left"} Panel</h3>
      <p>
        This is the ${e?"right":"left"} panel. Resize using the
        vertical handle.
      </p>
    </div>
  `;return o`
    ${p(r)}
    <style>
      .pivot-container {
        width: 800px;
        height: 600px;
        --resizer-thickness: ${r["--resizer-thickness"]}px;
        --resizer-grab-thickness: ${r["--resizer-grab-thickness"]}px;
        --resizer-grab-color: ${r["--resizer-grab-color"]?"var(--cds-background-selected)":"transparent"};
      }

      .outer-grid {
        --start-element-size: ${e?"4fr":"1fr"};
        --end-element-size: ${e?"1fr":"4fr"};
      }

      .inner-grid {
        --start-element-size: 3fr;
        --end-element-size: 1fr;
      }
    </style>
    <div class="pivot-container">
      <clabs-resizer-grid axis="x" class="outer-grid">
        <clabs-resizer-panel slot="left">
          ${e?t:a}
        </clabs-resizer-panel>

        <clabs-resizer-handle slot="handle-horizontal"></clabs-resizer-handle>

        <clabs-resizer-panel slot="right">
          ${e?a:t}
        </clabs-resizer-panel>
      </clabs-resizer-grid>
    </div>
  `};h.argTypes={reverse:{control:{type:"boolean"},description:"Reverse the layout (nested grid on left instead of right)",table:{defaultValue:{summary:"false"}}}};h.args={reverse:!1};const _=r=>{let e=0;const t=s=>{const i=s.target.previousElementSibling;i&&(e=i.offsetHeight,i.style.transition="none")},a=s=>{const i=s.target.previousElementSibling,l=s.target.parentElement;if(i&&l&&s.detail.delta!==void 0){const d=l.offsetHeight,S=e+s.detail.delta,w=Math.max(48,Math.min(S,d-20));i.style.height=`${w}px`}},n=s=>{const i=s.target.previousElementSibling;i&&(i.style.transition="height 180ms cubic-bezier(0.25, 0.9, 0.25, 1)",i.style.height="150px")};return o`
    ${p(r)}
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
        --resizer-thickness: ${r["--resizer-thickness"]}px;
        --resizer-grab-thickness: ${r["--resizer-grab-thickness"]}px;
        --resizer-grab-color: ${r["--resizer-grab-color"]?"var(--cds-background-selected)":"transparent"};
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
            @resize-start=${t}
            @resize-drag=${a}
            @resize-reset=${n}>
            ${Me(Ne,{slot:"icon",class:"custom-icon"})}
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
            @resize-start=${t}
            @resize-drag=${a}
            @resize-reset=${n}>
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
            @resize-start=${t}
            @resize-drag=${a}
            @resize-reset=${n}>
            <div slot="icon" class="custom-drag-handler-7"></div>
          </clabs-resizer-handle>
        </div>
      </div>
    </div>
  `};var F,Z,Y,W,q;b.parameters={...b.parameters,docs:{...(F=b.parameters)==null?void 0:F.docs,source:{originalSource:`args => {
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
}`,...(Y=(Z=b.parameters)==null?void 0:Z.docs)==null?void 0:Y.source},description:{story:`Single panel no boundaries example
@param {object} args - Story arguments
@returns {TemplateResult} Story template`,...(q=(W=b.parameters)==null?void 0:W.docs)==null?void 0:q.description}}};var Q,J,ee,te,ne;z.parameters={...z.parameters,docs:{...(Q=z.parameters)==null?void 0:Q.docs,source:{originalSource:`args => {
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
}`,...(ee=(J=z.parameters)==null?void 0:J.docs)==null?void 0:ee.source},description:{story:`Single panel bounded example
@param {object} args - Story arguments
@returns {TemplateResult} Story template`,...(ne=(te=z.parameters)==null?void 0:te.docs)==null?void 0:ne.description}}};var se,re,ie,ae,oe;m.parameters={...m.parameters,docs:{...(se=m.parameters)==null?void 0:se.docs,source:{originalSource:`args => {
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
}`,...(ie=(re=m.parameters)==null?void 0:re.docs)==null?void 0:ie.source},description:{story:`Single panel overlay example
@param {object} args - Story arguments
@returns {TemplateResult} Story template`,...(oe=(ae=m.parameters)==null?void 0:ae.docs)==null?void 0:oe.description}}};var le,ce,de,he,pe;f.parameters={...f.parameters,docs:{...(le=f.parameters)==null?void 0:le.docs,source:{originalSource:`args => html\`
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
\``,...(de=(ce=f.parameters)==null?void 0:ce.docs)==null?void 0:de.source},description:{story:`Two panels horizontal example
@param {object} args - Story arguments
@returns {TemplateResult} Story template`,...(pe=(he=f.parameters)==null?void 0:he.docs)==null?void 0:pe.description}}};var ge,ue,ve,be,ze;y.parameters={...y.parameters,docs:{...(ge=y.parameters)==null?void 0:ge.docs,source:{originalSource:`args => html\`
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
\``,...(ve=(ue=y.parameters)==null?void 0:ue.docs)==null?void 0:ve.source},description:{story:`Two panels vertical example
@param {object} args - Story arguments
@returns {TemplateResult} Story template`,...(ze=(be=y.parameters)==null?void 0:be.docs)==null?void 0:ze.description}}};var me,fe,ye,xe,_e;x.parameters={...x.parameters,docs:{...(me=x.parameters)==null?void 0:me.docs,source:{originalSource:`args => html\`
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
\``,...(ye=(fe=x.parameters)==null?void 0:fe.docs)==null?void 0:ye.source},description:{story:`Nested example
@param {object} args - Story arguments
@returns {TemplateResult} Story template`,...(_e=(xe=x.parameters)==null?void 0:xe.docs)==null?void 0:_e.description}}};var Se,we,Ee,ke,$e;h.parameters={...h.parameters,docs:{...(Se=h.parameters)==null?void 0:Se.docs,source:{originalSource:`args => {
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
}`,...(Ee=(we=h.parameters)==null?void 0:we.docs)==null?void 0:Ee.source},description:{story:`With pivot handle - demonstrates the pivot handle at the intersection of nested grids
@param {object} args - Story arguments
@returns {TemplateResult} Story template`,...($e=(ke=h.parameters)==null?void 0:ke.docs)==null?void 0:$e.description}}};var Re,He,Ae,Te,Pe;_.parameters={..._.parameters,docs:{...(Re=_.parameters)==null?void 0:Re.docs,source:{originalSource:`args => {
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
}`,...(Ae=(He=_.parameters)==null?void 0:He.docs)==null?void 0:Ae.source},description:{story:`With custom handles example - demonstrates using SVG icons in the icon slot
@param {object} args - Story arguments
@returns {TemplateResult} Story template`,...(Pe=(Te=_.parameters)==null?void 0:Te.docs)==null?void 0:Pe.description}}};const ot=["SinglePanelNoBoundaries","SinglePanelBounded","SinglePanelOverlay","TwoPanelsHorizontal","TwoPanelsVertical","Nested","WithPivotHandle","WithCustomHandles"],pt=Object.freeze(Object.defineProperty({__proto__:null,Nested:x,SinglePanelBounded:z,SinglePanelNoBoundaries:b,SinglePanelOverlay:m,TwoPanelsHorizontal:f,TwoPanelsVertical:y,WithCustomHandles:_,WithPivotHandle:h,__namedExportsOrder:ot,default:at},Symbol.toStringTag,{value:"Module"}));export{pt as R};

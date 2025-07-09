import{_ as d,e as y}from"./class-map-BqTUllwo.js";import{x as i,i as b,r as m}from"./lit-element-CKvUdWNz.js";import{n as t}from"./property-DRkoNOFH.js";import{p as e,c as h}from"./carbon-element-CIUZhCzP.js";/**
 * @license
 *
 * Copyright IBM Corp. 2020, 2022, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */var a;(function(s){s.REGULAR="regular",s.SMALL="small"})(a||(a={}));/**
 * @license
 *
 * Copyright IBM Corp. 2019, 2022
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */var v=a;/**
 * @license
 *
 * Copyright IBM Corp. 2019, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */var u=({assistiveText:s,type:c})=>{const o=c===v.SMALL?"42":"44";return i`
    <svg class="${e}--loading__svg" viewBox="0 0 100 100">
      ${s?i` <title>${s}</title> `:void 0}
      <circle
        ?hidden="${c!==v.SMALL}"
        class="${e}--loading__background"
        cx="50%"
        cy="50%"
        r="${o}" />
      <circle
        class="${e}--loading__stroke"
        cx="50%"
        cy="50%"
        r="${o}" />
    </svg>
  `},p=b([".cds--layer-one,:root{--cds-layer:var(--cds-layer-01,#f4f4f4);--cds-layer-active:var(--cds-layer-active-01,#c6c6c6);--cds-layer-hover:var(--cds-layer-hover-01,#e8e8e8);--cds-layer-selected:var(--cds-layer-selected-01,#e0e0e0);--cds-layer-selected-hover:var(--cds-layer-selected-hover-01,#d1d1d1);--cds-layer-accent:var(--cds-layer-accent-01,#e0e0e0);--cds-layer-accent-hover:var(--cds-layer-accent-hover-01,#d1d1d1);--cds-layer-accent-active:var(--cds-layer-accent-active-01,#a8a8a8);--cds-field:var(--cds-field-01,#f4f4f4);--cds-field-hover:var(--cds-field-hover-01,#e8e8e8);--cds-border-subtle:var(--cds-border-subtle-00,#e0e0e0);--cds-border-subtle-selected:var(--cds-border-subtle-selected-01,#c6c6c6);--cds-border-strong:var(--cds-border-strong-01,#8d8d8d);--cds-border-tile:var(--cds-border-tile-01,#c6c6c6)}.cds--layer-two{--cds-layer:var(--cds-layer-02,#fff);--cds-layer-active:var(--cds-layer-active-02,#c6c6c6);--cds-layer-hover:var(--cds-layer-hover-02,#e8e8e8);--cds-layer-selected:var(--cds-layer-selected-02,#e0e0e0);--cds-layer-selected-hover:var(--cds-layer-selected-hover-02,#d1d1d1);--cds-layer-accent:var(--cds-layer-accent-02,#e0e0e0);--cds-layer-accent-hover:var(--cds-layer-accent-hover-02,#d1d1d1);--cds-layer-accent-active:var(--cds-layer-accent-active-02,#a8a8a8);--cds-field:var(--cds-field-02,#fff);--cds-field-hover:var(--cds-field-hover-02,#e8e8e8);--cds-border-subtle:var(--cds-border-subtle-01,#c6c6c6);--cds-border-subtle-selected:var(--cds-border-subtle-selected-02,#c6c6c6);--cds-border-strong:var(--cds-border-strong-02,#8d8d8d);--cds-border-tile:var(--cds-border-tile-02,#a8a8a8)}.cds--layer-three{--cds-layer:var(--cds-layer-03,#f4f4f4);--cds-layer-active:var(--cds-layer-active-03,#c6c6c6);--cds-layer-hover:var(--cds-layer-hover-03,#e8e8e8);--cds-layer-selected:var(--cds-layer-selected-03,#e0e0e0);--cds-layer-selected-hover:var(--cds-layer-selected-hover-03,#d1d1d1);--cds-layer-accent:var(--cds-layer-accent-03,#e0e0e0);--cds-layer-accent-hover:var(--cds-layer-accent-hover-03,#d1d1d1);--cds-layer-accent-active:var(--cds-layer-accent-active-03,#a8a8a8);--cds-field:var(--cds-field-03,#f4f4f4);--cds-field-hover:var(--cds-field-hover-03,#e8e8e8);--cds-border-subtle:var(--cds-border-subtle-02,#e0e0e0);--cds-border-subtle-selected:var(--cds-border-subtle-selected-03,#c6c6c6);--cds-border-strong:var(--cds-border-strong-03,#8d8d8d);--cds-border-tile:var(--cds-border-tile-03,#c6c6c6)}.cds--loading,:host(cds-loading){animation-duration:.69s;animation-fill-mode:forwards;animation-iteration-count:infinite;animation-name:cds--rotate;animation-timing-function:linear;block-size:5.5rem;border:0;box-sizing:border-box;font-family:inherit;font-size:100%;inline-size:5.5rem;margin:0;padding:0;vertical-align:baseline}.cds--loading *,.cds--loading :after,.cds--loading :before,:host(cds-loading) *,:host(cds-loading) :after,:host(cds-loading) :before{box-sizing:inherit}.cds--loading svg circle,:host(cds-loading) svg circle{animation-duration:10ms;animation-name:cds--init-stroke;animation-timing-function:cubic-bezier(.5,0,.1,1)}@media screen and (prefers-reduced-motion:reduce){.cds--loading svg circle,:host(cds-loading) svg circle{animation:none}}.cds--loading__svg{fill:transparent}.cds--loading__svg circle{stroke-dasharray:276.4608 276.4608;stroke-linecap:butt;stroke-width:10}.cds--loading__stroke{stroke:var(--cds-interactive,#0f62fe);stroke-dashoffset:52.527552}.cds--loading--small .cds--loading__stroke,:host(cds-loading[type=small]) .cds--loading__stroke{stroke-dashoffset:143.759616}.cds--loading--stop,:host(cds-loading[inactive]){animation:cds--rotate-end-p1 .7s cubic-bezier(0,0,.25,1) forwards,cds--rotate-end-p2 .7s cubic-bezier(0,0,.25,1) .7s forwards}.cds--loading--stop svg circle,:host(cds-loading[inactive]) svg circle{animation-delay:.7s;animation-duration:.7s;animation-fill-mode:forwards;animation-name:cds--stroke-end;animation-timing-function:cubic-bezier(0,0,.25,1)}@media screen and (prefers-reduced-motion:reduce){.cds--loading--stop svg circle,:host(cds-loading[inactive]) svg circle{animation:none}}.cds--loading--small,:host(cds-loading[type=small]){block-size:1rem;inline-size:1rem;line-height:1rem}.cds--loading--small circle,:host(cds-loading[type=small]) circle{stroke-width:16}.cds--loading--small .cds--loading__svg,:host(cds-loading[type=small]) .cds--loading__svg{stroke:var(--cds-interactive,#0f62fe)}.cds--loading__background{stroke:var(--cds-layer-accent);stroke-dashoffset:-22}@media not all and (resolution >= 0.001dpcm){@supports (-webkit-appearance:none) and (stroke-color:transparent){circle.cds--loading__background{stroke-dasharray:265;stroke-dashoffset:0}}}.cds--loading-overlay,:host(cds-loading[overlay]){align-items:center;background-color:var(--cds-overlay,hsla(0,0%,9%,.5));block-size:100%;display:flex;inline-size:100%;inset-block-start:0;inset-inline-start:0;justify-content:center;position:fixed;transition:background-color .7s cubic-bezier(.4,.14,.3,1);z-index:6000}.cds--loading-overlay--stop{display:none}@keyframes cds--rotate{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}@keyframes cds--rotate-end-p1{to{transform:rotate(1turn)}}@keyframes cds--rotate-end-p2{to{transform:rotate(-1turn)}}@keyframes cds--init-stroke{0%{stroke-dashoffset:276.4608}to{stroke-dashoffset:52.527552}}@keyframes cds--stroke-end{0%{stroke-dashoffset:52.527552}to{stroke-dashoffset:276.4608}}:host(cds-loading){display:block}:host(cds-loading[overlay]){animation:none}.cds--loading__background[hidden]{display:none}"]);/**
 * @license
 *
 * Copyright IBM Corp. 2019, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */let r=class extends m{constructor(){super(...arguments),this.assistiveText="Loading",this.type=a.REGULAR,this.overlay=!1,this.inactive=!1}render(){const{inactive:c,assistiveText:o,type:l,overlay:f}=this,g=y({[`${e}--loading`]:!0,[`${e}--loading--stop`]:c,[`${e}--loading--small`]:l===a.SMALL}),n=u({assistiveText:o,type:l});return f?i`<div class="${g}">${n}</div>`:n}};r.styles=p;d([t({attribute:"assistive-text"})],r.prototype,"assistiveText",void 0);d([t()],r.prototype,"type",void 0);d([t({type:Boolean,reflect:!0})],r.prototype,"overlay",void 0);d([t({type:Boolean,reflect:!0})],r.prototype,"inactive",void 0);r=d([h(`${e}-loading`)],r);export{a as L};

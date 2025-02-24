import{T as d}from"./lit-element-CKvUdWNz.js";import{e as c,i as u,t as $}from"./directive-CF8sV3Lr.js";function h(o,t,r,i){var s=arguments.length,n=s<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,r):i,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(o,t,r,i);else for(var l=o.length-1;l>=0;l--)(a=o[l])&&(n=(s<3?a(n):s>3?a(t,r,n):a(t,r))||n);return s>3&&n&&Object.defineProperty(t,r,n),n}/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const x=c(class extends u{constructor(o){var t;if(super(o),o.type!==$.ATTRIBUTE||o.name!=="class"||((t=o.strings)==null?void 0:t.length)>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(o){return" "+Object.keys(o).filter(t=>o[t]).join(" ")+" "}update(o,[t]){var i,s;if(this.st===void 0){this.st=new Set,o.strings!==void 0&&(this.nt=new Set(o.strings.join(" ").split(/\s/).filter(n=>n!=="")));for(const n in t)t[n]&&!((i=this.nt)!=null&&i.has(n))&&this.st.add(n);return this.render(t)}const r=o.element.classList;for(const n of this.st)n in t||(r.remove(n),this.st.delete(n));for(const n in t){const a=!!t[n];a===this.st.has(n)||(s=this.nt)!=null&&s.has(n)||(a?(r.add(n),this.st.add(n)):(r.remove(n),this.st.delete(n)))}return d}});/**
 * @license
 *
 * Copyright IBM Corp. 2019, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const e="cds",v=`
  a[href], area[href], input:not([disabled]):not([tabindex='-1']),
  button:not([disabled]):not([tabindex='-1']),select:not([disabled]):not([tabindex='-1']),
  textarea:not([disabled]):not([tabindex='-1']),
  iframe, object, embed, *[tabindex]:not([tabindex='-1']), *[contenteditable=true],
  ${e}-accordion-item,
  ${e}-button,
  ${e}-breadcrumb-link,
  ${e}-checkbox,
  ${e}-code-snippet,
  ${e}-combo-box,
  ${e}-content-switcher-item,
  ${e}-copy-button,
  ${e}-table-header-row,
  ${e}-table-row,
  ${e}-table-toolbar-search,
  ${e}-date-picker-input,
  ${e}-dropdown,
  ${e}-input,
  ${e}-link,
  ${e}-number-input,
  ${e}-modal,
  ${e}-modal-close-button,
  ${e}-multi-select,
  ${e}-inline-notification,
  ${e}-toast-notification,
  ${e}-overflow-menu,
  ${e}-overflow-menu-item,
  ${e}-page-sizes-select,
  ${e}-pages-select,
  ${e}-progress-step,
  ${e}-radio-button,
  ${e}-search,
  ${e}-slider,
  ${e}-slider-input,
  ${e}-structured-list,
  ${e}-tab,
  ${e}-filter-tag,
  ${e}-textarea,
  ${e}-text-input,
  ${e}-clickable-tile,
  ${e}-expandable-tile,
  ${e}-radio-tile,
  ${e}-selectable-tile,
  ${e}-toggle,
  ${e}-tooltip,
  ${e}-tooltip-definition,
  ${e}-tooltip-icon,
  ${e}-header-menu,
  ${e}-header-menu-button,
  ${e}-header-menu-item,
  ${e}-header-name,
  ${e}-header-nav-item,
  ${e}-side-nav-link,
  ${e}-side-nav-menu,
  ${e}-side-nav-menu-item
`;/**
 * @license
 *
 * Copyright IBM Corp. 2019, 2022
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const b=(o,t)=>{try{customElements.define(o,t)}catch{console.warn(`Attempting to re-define ${o}`)}return t},p=(o,t)=>{const{kind:r,elements:i}=t;return{kind:r,elements:i,finisher(s){try{customElements.define(o,s)}catch{console.warn(`Attempting to re-define ${o}`)}}}},w=o=>t=>typeof t=="function"?b(o,t):p(o,t);export{h as _,w as c,x as e,e as p,v as s};

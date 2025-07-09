/**
 * @license
 *
 * Copyright IBM Corp. 2019, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const e="cds",l=`
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
 */const $=(t,n)=>{try{customElements.define(t,n)}catch{console.warn(`Attempting to re-define ${t}`)}return n},r=(t,n)=>{const{kind:o,elements:i}=n;return{kind:o,elements:i,finisher(a){try{customElements.define(t,a)}catch{console.warn(`Attempting to re-define ${t}`)}}}},s=t=>n=>typeof n=="function"?$(t,n):r(t,n);export{s as c,e as p,l as s};

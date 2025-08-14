import{_ as n,e as $}from"./class-map-BqTUllwo.js";import{o as d}from"./if-defined-BxoUCaaX.js";import{i as g,r as f,x as p}from"./lit-element-CKvUdWNz.js";import{n as s}from"./property-DRkoNOFH.js";import{e as x}from"./query-BApjzB0v.js";/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const D={stablePrefix:"clabs",prefix:"cds"};/**
 * @license
 *
 * Copyright IBM Corp. 2019, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const e="cds",h=`
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
 */const y=r=>class extends r{focus(){if(this.shadowRoot.delegatesFocus)super.focus();else{const t=this.shadowRoot.querySelector(h)||this.querySelector(h);t?t.focus():super.focus()}}};var _=g([".cds--link{border:0;box-sizing:border-box;color:var(--cds-link-text-color,var(--cds-link-primary,#0f62fe));display:inline-flex;font-family:inherit;font-size:100%;font-size:var(--cds-body-compact-01-font-size,.875rem);font-weight:var(--cds-body-compact-01-font-weight,400);letter-spacing:var(--cds-body-compact-01-letter-spacing,.16px);line-height:var(--cds-body-compact-01-line-height,1.28572);margin:0;outline:none;padding:0;text-decoration:none;transition:color 70ms cubic-bezier(.2,0,.38,.9);vertical-align:baseline}.cds--link *,.cds--link :after,.cds--link :before{box-sizing:inherit}.cds--link:hover{color:var(--cds-link-hover-text-color,var(--cds-link-primary-hover,#0043ce));text-decoration:underline}.cds--link:active,.cds--link:active:visited,.cds--link:active:visited:hover{color:var(--cds-link-text-color,var(--cds-link-primary,#0f62fe));outline:1px solid var(--cds-focus,#0f62fe);outline-color:var(--cds-link-focus-text-color,var(--cds-focus,#0f62fe));text-decoration:underline}@media screen and (prefers-contrast){.cds--link:active,.cds--link:active:visited,.cds--link:active:visited:hover{outline-style:dotted}}.cds--link:focus{outline:1px solid var(--cds-focus,#0f62fe);outline-color:var(--cds-link-focus-text-color,var(--cds-focus,#0f62fe));text-decoration:underline}@media screen and (prefers-contrast){.cds--link:focus{outline-style:dotted}}.cds--link:visited{color:var(--cds-link-text-color,var(--cds-link-primary,#0f62fe))}.cds--link:visited:hover{color:var(--cds-link-hover-text-color,var(--cds-link-primary-hover,#0043ce))}.cds--link--disabled,.cds--link--disabled:hover{border:0;box-sizing:border-box;color:var(--cds-text-disabled,hsla(0,0%,9%,.25));cursor:not-allowed;font-family:inherit;font-size:100%;font-size:var(--cds-body-compact-01-font-size,.875rem);font-weight:var(--cds-body-compact-01-font-weight,400);font-weight:400;letter-spacing:var(--cds-body-compact-01-letter-spacing,.16px);line-height:var(--cds-body-compact-01-line-height,1.28572);margin:0;padding:0;text-decoration:none;vertical-align:baseline}.cds--link--disabled *,.cds--link--disabled :after,.cds--link--disabled :before,.cds--link--disabled:hover *,.cds--link--disabled:hover :after,.cds--link--disabled:hover :before{box-sizing:inherit}.cds--link.cds--link--visited:visited{color:var(--cds-link-visited-text-color,var(--cds-link-visited,#8a3ffc))}.cds--link.cds--link--visited:visited:hover{color:var(--cds-link-hover-text-color,var(--cds-link-primary-hover,#0043ce))}.cds--link.cds--link--inline{display:inline;text-decoration:underline}.cds--link--disabled.cds--link--inline{text-decoration:underline}.cds--link--sm,.cds--link--sm.cds--link--disabled:hover{font-size:var(--cds-helper-text-01-font-size,.75rem);letter-spacing:var(--cds-helper-text-01-letter-spacing,.32px);line-height:var(--cds-helper-text-01-line-height,1.33333)}.cds--link--lg,.cds--link--lg.cds--link--disabled:hover{font-size:var(--cds-body-compact-02-font-size,1rem);font-weight:var(--cds-body-compact-02-font-weight,400);letter-spacing:var(--cds-body-compact-02-letter-spacing,0);line-height:var(--cds-body-compact-02-line-height,1.375)}.cds--link__icon{align-self:center;display:inline-flex;margin-inline-start:.5rem}:host(cds-link){outline:none}:host(cds-link) .cds--link--disabled{color:var(--cds-text-disabled,hsla(0,0%,9%,.25))}:host(cds-link) .cds--link__icon[hidden]{display:none}"]);/**
 * @license
 *
 * Copyright IBM Corp. 2019, 2022
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const w=(r,t)=>{try{customElements.define(r,t)}catch{console.warn(`Attempting to re-define ${r}`)}return t},z=(r,t)=>{const{kind:o,elements:c}=t;return{kind:o,elements:c,finisher(l){try{customElements.define(r,l)}catch{console.warn(`Attempting to re-define ${r}`)}}}},C=r=>t=>typeof t=="function"?w(r,t):z(r,t);/**
 * @license
 *
 * Copyright IBM Corp. 2019, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const I={MEDIUM:"md",SMALL:"sm",LARGE:"lg"};let i=class extends y(f){constructor(){super(...arguments),this._hasIcon=!1,this.disabled=!1,this.inline=!1,this.size=I.MEDIUM,this.visited=!1}_handleSlotChange({target:t}){const{name:o}=t,c=t.assignedNodes().some(l=>l.nodeType!==Node.TEXT_NODE||l.textContent.trim());this[o==="icon"?"_hasIcon":""]=c,this.requestUpdate()}get _classes(){const{disabled:t,size:o,inline:c,visited:l,_hasIcon:a}=this;return $({[`${e}--link`]:!0,[`${e}--link--disabled`]:t,[`${e}--link--icon`]:a,[`${e}--link--inline`]:c,[`${e}--link--${o}`]:o,[`${e}--link--visited`]:l})}_handleClick(t){}_renderInner(){const{_hasIcon:t,_handleSlotChange:o}=this;return p`
      <slot @slotchange="${o}"></slot>
      <div ?hidden="${!t}" class="${e}--link__icon">
        <slot name="icon" @slotchange="${o}"></slot>
      </div>
    `}_renderDisabledLink(){const{_classes:t}=this;return p`
      <p id="link" part="link" class="${t}">${this._renderInner()}</p>
    `}_renderLink(){const{download:t,href:o,hreflang:c,linkRole:l,ping:a,rel:v,target:b,type:k,_classes:u,_handleClick:m}=this;return p`
      <a
        tabindex="0"
        id="link"
        role="${d(l)}"
        class="${u}"
        part="link"
        download="${d(t)}"
        href="${d(o)}"
        hreflang="${d(c)}"
        ping="${d(a)}"
        rel="${d(v)}"
        target="${d(b)}"
        type="${d(k)}"
        @click="${m}">
        ${this._renderInner()}
      </a>
    `}render(){const{disabled:t}=this;return t?this._renderDisabledLink():this._renderLink()}};i.shadowRootOptions=Object.assign(Object.assign({},f.shadowRootOptions),{delegatesFocus:!0});i.styles=_;n([x("#link")],i.prototype,"_linkNode",void 0);n([s({type:Boolean,reflect:!0})],i.prototype,"disabled",void 0);n([s({reflect:!0})],i.prototype,"download",void 0);n([s({reflect:!0})],i.prototype,"href",void 0);n([s({reflect:!0})],i.prototype,"hreflang",void 0);n([s({type:Boolean,reflect:!0})],i.prototype,"inline",void 0);n([s({attribute:"link-role"})],i.prototype,"linkRole",void 0);n([s({reflect:!0})],i.prototype,"ping",void 0);n([s({reflect:!0})],i.prototype,"rel",void 0);n([s({reflect:!0})],i.prototype,"size",void 0);n([s({reflect:!0})],i.prototype,"target",void 0);n([s({reflect:!0})],i.prototype,"type",void 0);n([s({type:Boolean,reflect:!0})],i.prototype,"visited",void 0);i=n([C(`${e}-link`)],i);export{y as F,C as c,e as p,D as s};

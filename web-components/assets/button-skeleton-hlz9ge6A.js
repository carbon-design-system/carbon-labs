import{_ as i,c as d,p as e,e as B}from"./carbon-element-ZG_lSGav.js";import"./lit-element-in3Y6axH.js";import{r as D,x as o}from"./directive-Bp-AemGL.js";import{b,B as m,C as _}from"./button-Cd4OINk7.js";import{o as t}from"./focus-CQ1fMjd6.js";/**
 * @license
 *
 * Copyright IBM Corp. 2020, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */let l=class extends D{render(){return o`<slot></slot>`}connectedCallback(){super.connectedCallback(),this.setAttribute("role","list")}};l.styles=b;l=i([d(`${e}-button-set-base`)],l);var y=l;/**
 * @license
 *
 * Copyright IBM Corp. 2020, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */let u=class extends y{_handleSlotChange(n){n.target.assignedNodes().filter(s=>s.matches!==void 0?s.matches(this.constructor.selectorItem):!1).forEach((s,r)=>{s.setAttribute("kind",r===0?m.SECONDARY:m.PRIMARY)});const a=new CustomEvent(`${e}-btn-set-update`,{bubbles:!0,cancelable:!0,composed:!0});this.dispatchEvent(a)}render(){return o` <slot @slotchange="${this._handleSlotChange}"></slot> `}static get selectorItem(){return`${e}-button`}};u.styles=b;u=i([d(`${e}-button-set`)],u);/**
 * @license
 *
 * Copyright IBM Corp. 2019, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */let c=class extends _{_handleClickLinkSkeleton(n){this.disabled&&(n.preventDefault(),n.stopPropagation())}render(){const{autofocus:n,disabled:h,download:a,href:s,hreflang:r,ping:C,rel:k,size:S,target:g,type:p}=this,f=B({[`${e}--btn`]:!0,[`${e}--skeleton`]:!0,[`${e}--btn--${S}`]:S});return s?o`
          <a
            id="button"
            role="button"
            class="${f}"
            download="${t(a)}"
            href="${t(s)}"
            hreflang="${t(r)}"
            ping="${t(C)}"
            rel="${t(k)}"
            target="${t(g)}"
            type="${t(p)}"
            @click="${this._handleClickLinkSkeleton}"></a>
        `:o`
          <button
            id="button"
            class="${f}"
            ?autofocus="${n}"
            ?disabled="${h}"
            type="${t(p)}"></button>
        `}};c.styles=b;c=i([d(`${e}-button-skeleton`)],c);

import{_ as d,e as B}from"./class-map-BqTUllwo.js";import{r as D,x as a,b as v}from"./lit-element-CKvUdWNz.js";import{b as h,B as S,C as w}from"./button-CGwuyTGo.js";import{c as b,p as s}from"./carbon-element-CIUZhCzP.js";import{o as e}from"./if-defined-BxoUCaaX.js";import{s as x}from"./spread-Cnb5k-G6.js";/**
 * @license
 *
 * Copyright IBM Corp. 2020, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */let r=class extends D{render(){return a`<slot></slot>`}connectedCallback(){super.connectedCallback(),this.setAttribute("role","list")}};r.styles=h;r=d([b(`${s}-button-set-base`)],r);var _=r;/**
 * @license
 *
 * Copyright IBM Corp. 2020, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */let c=class extends _{_handleSlotChange(t){t.target.assignedNodes().filter(o=>o.matches!==void 0?o.matches(this.constructor.selectorItem):!1).forEach((o,i)=>{o.setAttribute("kind",i===0?S.SECONDARY:S.PRIMARY)});const l=new CustomEvent(`${s}-btn-set-update`,{bubbles:!0,cancelable:!0,composed:!0});this.dispatchEvent(l)}render(){return a` <slot @slotchange="${this._handleSlotChange}"></slot> `}static get selectorItem(){return`${s}-button`}};c.styles=h;c=d([b(`${s}-button-set`)],c);/**
 * @license
 *
 * Copyright IBM Corp. 2019, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */let u=class extends w{_handleClickLinkSkeleton(t){this.disabled&&(t.preventDefault(),t.stopPropagation())}render(){const{autofocus:t,disabled:p,download:l,href:o,hreflang:i,ping:g,rel:C,size:$,target:k,type:f}=this,m=B({[`${s}--btn`]:!0,[`${s}--skeleton`]:!0,[`${s}--btn--${$}`]:$});return o?a`
          <a
            id="button"
            role="button"
            class="${m}"
            download="${e(l)}"
            href="${e(o)}"
            hreflang="${e(i)}"
            ping="${e(g)}"
            rel="${e(C)}"
            target="${e(k)}"
            type="${e(f)}"
            @click="${this._handleClickLinkSkeleton}"></a>
        `:a`
          <button
            id="button"
            class="${m}"
            ?autofocus="${t}"
            ?disabled="${p}"
            type="${e(f)}"></button>
        `}};u.styles=h;u=d([b(`${s}-button-skeleton`)],u);const z=({children:n,...t}={})=>v`<svg focusable="false" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" fill="currentColor" ...="${x(t)}" aria-hidden="true" width="16" height="16" viewBox="0 0 16 16">${n}<path d="M8 11L3 6 3.7 5.3 8 9.6 12.3 5.3 13 6z"></path></svg>`;export{z as s};

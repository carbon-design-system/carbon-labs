import{_ as b,c as g}from"./decorate-CpR45XrY.js";import{a as m,b as _}from"./button-s2fFCHRa.js";import{a as E,b as h}from"./iframe-CP1kGWRx.js";import{n as v}from"./property-ZFgVw4Vi.js";import{e as C}from"./class-map-CdUSNurG.js";import{o}from"./if-defined-7rKOgT0j.js";var i;let f=(i=class extends E{render(){return h`<slot></slot>`}connectedCallback(){super.connectedCallback(),this.setAttribute("role","list")}},i.styles=m,i);f=b([g("cds-button-set-base")],f);var w=f,c;let p=(c=class extends w{constructor(...t){super(...t),this.stacked=!1,this._hideSiblingMargin=()=>{var d;const a=(d=this.shadowRoot)==null?void 0:d.querySelector("slot");if(!a)return;const e=a.assignedElements().filter(n=>n.tagName.toLowerCase()==="cds-button"),s=e.findIndex(n=>n.matches(":focus-within"));e.forEach((n,u)=>{const r=s>=0&&(u===s||u===s+1);n.toggleAttribute("hide-margin",r)})}}_handleSlotChange(t){t.target.assignedNodes().filter(e=>e.matches!==void 0?e.matches(this.constructor.selectorItem):!1).forEach((e,s)=>{e.setAttribute("kind",s===0?"secondary":"primary")});const a=new CustomEvent("cds-btn-set-update",{bubbles:!0,cancelable:!0,composed:!0});this.dispatchEvent(a)}connectedCallback(){var t;(t=super.connectedCallback)==null||t.call(this),this.addEventListener("focusin",this._hideSiblingMargin),this.addEventListener("focusout",this._hideSiblingMargin)}render(){const{stacked:t}=this;return h`<slot
      class="${C({"cds--btn-set--stacked":t,"cds--btn-set":!0})}"
      part="button-set"
      @slotchange="${this._handleSlotChange}"></slot>`}static get selectorItem(){return"cds-button"}},c.styles=m,c);b([v({type:Boolean,reflect:!0})],p.prototype,"stacked",void 0);p=b([g("cds-button-set")],p);var l;let S=(l=class extends _{_handleClickLinkSkeleton(t){this.disabled&&(t.preventDefault(),t.stopPropagation())}render(){const{autofocus:t,disabled:a,download:e,href:s,hreflang:d,ping:n,rel:u,size:r,target:y,type:k}=this,$=C({"cds--btn":!0,"cds--skeleton":!0,[`cds--btn--${r}`]:r,[`cds--layout--size-${r}`]:r});return s?h`
          <a
            id="button"
            role="button"
            class="${$}"
            download="${o(e)}"
            href="${o(s)}"
            hreflang="${o(d)}"
            ping="${o(n)}"
            rel="${o(u)}"
            target="${o(y)}"
            type="${o(k)}"
            @click="${this._handleClickLinkSkeleton}"></a>
        `:h`
          <button
            id="button"
            class="${$}"
            ?autofocus="${t}"
            ?disabled="${a}"
            type="${o(k)}"></button>
        `}},l.styles=m,l);S=b([g("cds-button-skeleton")],S);

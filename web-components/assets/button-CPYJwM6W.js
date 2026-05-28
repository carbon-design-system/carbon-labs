import{P as e,R as t}from"./iframe-D55HlLpV.js";import{i as n}from"./decorate-B5s29MGQ.js";import{n as r,t as i}from"./decorate-CHe6eMGd.js";import{n as a,t as o}from"./button-DaYA1Rhz.js";import{t as s}from"./class-map-D9tnr94Y.js";import{t as c}from"./if-defined-eHP-dJeh.js";var l=class extends e{render(){return t`<slot></slot>`}connectedCallback(){super.connectedCallback(),this.setAttribute(`role`,`list`)}static{this.styles=a}};l=i([r(`cds-button-set-base`)],l);var u=l,d=class extends u{constructor(...e){super(...e),this.stacked=!1,this._hideSiblingMargin=()=>{let e=this.shadowRoot?.querySelector(`slot`);if(!e)return;let t=e.assignedElements().filter(e=>e.tagName.toLowerCase()===`cds-button`),n=t.findIndex(e=>e.matches(`:focus-within`));t.forEach((e,t)=>{let r=n>=0&&(t===n||t===n+1);e.toggleAttribute(`hide-margin`,r)})}}_handleSlotChange(e){e.target.assignedNodes().filter(e=>e.matches===void 0?!1:e.matches(this.constructor.selectorItem)).forEach((e,t)=>{e.setAttribute(`kind`,t===0?`secondary`:`primary`)});let t=new CustomEvent(`cds-btn-set-update`,{bubbles:!0,cancelable:!0,composed:!0});this.dispatchEvent(t)}connectedCallback(){super.connectedCallback?.(),this.addEventListener(`focusin`,this._hideSiblingMargin),this.addEventListener(`focusout`,this._hideSiblingMargin)}render(){let{stacked:e}=this;return t`<slot
      class="${s({"cds--btn-set--stacked":e,"cds--btn-set":!0})}"
      part="button-set"
      @slotchange="${this._handleSlotChange}"></slot>`}static get selectorItem(){return`cds-button`}static{this.styles=a}};i([n({type:Boolean,reflect:!0})],d.prototype,`stacked`,void 0),d=i([r(`cds-button-set`)],d);var f=class extends o{_handleClickLinkSkeleton(e){this.disabled&&(e.preventDefault(),e.stopPropagation())}render(){let{autofocus:e,disabled:n,download:r,href:i,hreflang:a,ping:o,rel:l,size:u,target:d,type:f}=this,p=s({"cds--btn":!0,"cds--skeleton":!0,[`cds--btn--${u}`]:u,[`cds--layout--size-${u}`]:u});return i?t`
          <a
            id="button"
            role="button"
            class="${p}"
            download="${c(r)}"
            href="${c(i)}"
            hreflang="${c(a)}"
            ping="${c(o)}"
            rel="${c(l)}"
            target="${c(d)}"
            type="${c(f)}"
            @click="${this._handleClickLinkSkeleton}"></a>
        `:t`
          <button
            id="button"
            class="${p}"
            ?autofocus="${e}"
            ?disabled="${n}"
            type="${c(f)}"></button>
        `}static{this.styles=a}};f=i([r(`cds-button-skeleton`)],f);
import{b as d,u as l}from"./iframe-ClXo_xvh.js";/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const f=t=>(r,e)=>{e!==void 0?e.addInitializer(()=>{customElements.define(t,r)}):customElements.define(t,r)};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const p={attribute:!0,type:String,converter:l,reflect:!1,hasChanged:d},u=(t=p,r,e)=>{const{kind:a,metadata:i}=e;let n=globalThis.litPropertyMetadata.get(i);if(n===void 0&&globalThis.litPropertyMetadata.set(i,n=new Map),a==="setter"&&((t=Object.create(t)).wrapped=!0),n.set(e.name,t),a==="accessor"){const{name:o}=e;return{set(s){const c=r.get.call(this);r.set.call(this,s),this.requestUpdate(o,c,t)},init(s){return s!==void 0&&this.C(o,void 0,t,s),s}}}if(a==="setter"){const{name:o}=e;return function(s){const c=this[o];r.call(this,s),this.requestUpdate(o,c,t)}}throw Error("Unsupported decorator location: "+a)};function m(t){return(r,e)=>typeof e=="object"?u(t,r,e):((a,i,n)=>{const o=i.hasOwnProperty(n);return i.constructor.createProperty(n,a),o?Object.getOwnPropertyDescriptor(i,n):void 0})(t,r,e)}export{m as n,f as t};

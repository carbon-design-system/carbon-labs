/**
 * @license
 *
 * Copyright IBM Corp. 2019, 2022
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const d=(s,e,n,t)=>{const o=n._hostListeners;if(!o)throw new Error("The method `@HostListener()` is defined on has to be of a class that has `HostListerMixin`.");o[t]||(o[t]={}),o[t][s]={options:e}},f=(s,e,n)=>{const{kind:t,key:o,placement:r}=n;if(!(t==="method"&&r==="prototype"||t==="field"&&r==="own"))throw new Error("`@HostListener()` must be defined on instance methods, but you may have defined it on static, field, etc.");return Object.assign(Object.assign({},n),{finisher(i){d(s,e,i,o)}})},b=(s,e)=>(n,t)=>typeof t<"u"?d(s,e,n.constructor,t):f(s,e,n);function w(s,...e){return s.addEventListener(...e),{release(){return s.removeEventListener(...e),null}}}/**
 * @license
 *
 * Copyright IBM Corp. 2019, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const L=/^((document|window|parentRoot|shadowRoot):)?([\w-]+)$/,E=s=>{class e extends s{constructor(){super(...arguments),this._handles=new Set}connectedCallback(){super.connectedCallback();const t=this.constructor._hostListeners;Object.keys(t).forEach(o=>{Object.keys(t[o]).forEach(r=>{var i;const c=L.exec(r);if(!c)throw new Error(`Could not parse the event name: ${o}`);const[,,h,a]=c,u={document:this.ownerDocument,window:this.ownerDocument.defaultView,parentRoot:this.getRootNode(),shadowRoot:this.shadowRoot}[h]||this,{options:l}=t[o][r];this._handles.add(w(u,(i=this.constructor[a])!==null&&i!==void 0?i:a,this[o],l))})})}disconnectedCallback(){this._handles.forEach(t=>{t.release(),this._handles.delete(t)}),super.disconnectedCallback()}}return e._hostListeners={},e};export{E as H,b as a,w as o};

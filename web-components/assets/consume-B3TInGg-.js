/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */let b=class extends Event{constructor(t,s,o,i){super("context-request",{bubbles:!0,composed:!0}),this.context=t,this.contextTarget=s,this.callback=o,this.subscribe=i??!1}};/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function v(r){return r}/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */let a=class{constructor(t,s,o,i){if(this.subscribe=!1,this.provided=!1,this.value=void 0,this.t=(c,e)=>{this.unsubscribe&&(this.unsubscribe!==e&&(this.provided=!1,this.unsubscribe()),this.subscribe||this.unsubscribe()),this.value=c,this.host.requestUpdate(),this.provided&&!this.subscribe||(this.provided=!0,this.callback&&this.callback(c,e)),this.unsubscribe=e},this.host=t,s.context!==void 0){const c=s;this.context=c.context,this.callback=c.callback,this.subscribe=c.subscribe??!1}else this.context=s,this.callback=o,this.subscribe=i??!1;this.host.addController(this)}hostConnected(){this.dispatchRequest()}hostDisconnected(){this.unsubscribe&&(this.unsubscribe(),this.unsubscribe=void 0)}dispatchRequest(){this.host.dispatchEvent(new b(this.context,this.host,this.t,this.subscribe))}};/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class d{get value(){return this.o}set value(t){this.setValue(t)}setValue(t,s=!1){const o=s||!Object.is(t,this.o);this.o=t,o&&this.updateObservers()}constructor(t){this.subscriptions=new Map,this.updateObservers=()=>{for(const[s,{disposer:o}]of this.subscriptions)s(this.o,o)},t!==void 0&&(this.value=t)}addCallback(t,s,o){if(!o)return void t(this.value);this.subscriptions.has(t)||this.subscriptions.set(t,{disposer:()=>{this.subscriptions.delete(t)},consumerHost:s});const{disposer:i}=this.subscriptions.get(t);t(this.value,i)}clearCallbacks(){this.subscriptions.clear()}}/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */let p=class extends Event{constructor(t,s){super("context-provider",{bubbles:!0,composed:!0}),this.context=t,this.contextTarget=s}};class l extends d{constructor(t,s,o){var i,c;super(s.context!==void 0?s.initialValue:o),this.onContextRequest=e=>{if(e.context!==this.context)return;const n=e.contextTarget??e.composedPath()[0];n!==this.host&&(e.stopPropagation(),this.addCallback(e.callback,n,e.subscribe))},this.onProviderRequest=e=>{if(e.context!==this.context||(e.contextTarget??e.composedPath()[0])===this.host)return;const n=new Set;for(const[h,{consumerHost:u}]of this.subscriptions)n.has(h)||(n.add(h),u.dispatchEvent(new b(this.context,u,h,!0)));e.stopPropagation()},this.host=t,s.context!==void 0?this.context=s.context:this.context=s,this.attachListeners(),(c=(i=this.host).addController)==null||c.call(i,this)}attachListeners(){this.host.addEventListener("context-request",this.onContextRequest),this.host.addEventListener("context-provider",this.onProviderRequest)}hostConnected(){this.host.dispatchEvent(new p(this.context,this.host))}}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function k({context:r}){return(t,s)=>{const o=new WeakMap;if(typeof s=="object")return{get(){return t.get.call(this)},set(i){return o.get(this).setValue(i),t.set.call(this,i)},init(i){return o.set(this,new l(this,{context:r,initialValue:i})),i}};{t.constructor.addInitializer(e=>{o.set(e,new l(e,{context:r}))});const i=Object.getOwnPropertyDescriptor(t,s);let c;if(i===void 0){const e=new WeakMap;c={get(){return e.get(this)},set(n){o.get(this).setValue(n),e.set(this,n)},configurable:!0,enumerable:!0}}else{const e=i.set;c={...i,set(n){o.get(this).setValue(n),e==null||e.call(this,n)}}}return void Object.defineProperty(t,s,c)}}}/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function w({context:r,subscribe:t}){return(s,o)=>{typeof o=="object"?o.addInitializer(function(){new a(this,{context:r,callback:i=>{s.set.call(this,i)},subscribe:t})}):s.constructor.addInitializer(i=>{new a(i,{context:r,callback:c=>{i[o]=c},subscribe:t})})}}export{w as c,k as e,v as n};

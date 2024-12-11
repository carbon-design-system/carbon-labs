import{e as d,i as n}from"./directive-Bp-AemGL.js";/**
 * @license
 *
 * Copyright IBM Corp. 2019, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const o=new WeakMap;class p extends n{update(t,[r]){const{element:i}=t,s=o.get(t);return s&&Object.keys(s).forEach(e=>{e in r||i.removeAttribute(e)}),Object.keys(r).forEach(e=>{const c=r[e];(!s||!Object.is(c,s[e]))&&typeof c<"u"&&i.setAttribute(e,c)}),o.set(t,r),this.render(r)}render(t){return t}}const a=d(p);export{a as s};

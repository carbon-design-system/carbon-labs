/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const r={stablePrefix:"clabs",prefix:"cds"};let u;const o=new Uint8Array(16);function i(){if(!u&&(u=typeof crypto<"u"&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto),!u))throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return u(o)}const d=[];for(let n=0;n<256;++n)d.push((n+256).toString(16).slice(1));function p(n,t=0){return d[n[t+0]]+d[n[t+1]]+d[n[t+2]]+d[n[t+3]]+"-"+d[n[t+4]]+d[n[t+5]]+"-"+d[n[t+6]]+d[n[t+7]]+"-"+d[n[t+8]]+d[n[t+9]]+"-"+d[n[t+10]]+d[n[t+11]]+d[n[t+12]]+d[n[t+13]]+d[n[t+14]]+d[n[t+15]]}const y=typeof crypto<"u"&&crypto.randomUUID&&crypto.randomUUID.bind(crypto),c={randomUUID:y};function g(n,t,m){if(c.randomUUID&&!t&&!n)return c.randomUUID();n=n||{};const e=n.random||(n.rng||i)();return e[6]=e[6]&15|64,e[8]=e[8]&63|128,p(e)}export{r as s,g as v};

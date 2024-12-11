import{t as h}from"./property-C_111YFZ.js";import{i as f,s as v,x as b}from"./lit-element-in3Y6axH.js";import{s as g}from"./settings-BQP9c3yA.js";import{r as p}from"./state-B7rdIQBm.js";const m=f`:host(clabs-chat-loading) .clabs--chat-loading-container{display:flex;justify-content:space-between;inline-size:40px}@keyframes loading-dots{0%,20%,to{block-size:0;inline-size:0}10%{block-size:6px;inline-size:6px}}:host(clabs-chat-loading) .clabs--chat-loading-dot-container{display:flex;align-items:center;justify-content:center;block-size:16px;inline-size:10px}:host(clabs-chat-loading) .clabs--chat-loading-dot{border:2px solid var(--cds-text-primary, #161616);border-radius:50%;animation:loading-dots 1s infinite;background:var(--cds-background, #ffffff);block-size:0;inline-size:0}:host(clabs-chat-loading) .clabs--chat-loading-dot-first{animation-delay:0ms}:host(clabs-chat-loading) .clabs--chat-loading-dot-second{animation-delay:.1s}:host(clabs-chat-loading) .clabs--chat-loading-dot-third{animation-delay:.2s}`;var x=Object.defineProperty,u=(s,i,n,d)=>{for(var a=void 0,o=s.length-1,e;o>=0;o--)(e=s[o])&&(a=e(i,n,a)||a);return a&&x(i,n,a),a};const c=class c extends v{updated(i){super.updated(i)}firstUpdated(){}};c.styles=m;let l=c;u([p()],l.prototype,"_loadingMessage");/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const{stablePrefix:t}=g;function $(s){const{_loadingMessage:i}=s;return b`
  </div>
    ${""}
    <div class="${t}--chat-loading-container">
      <div class="${t}--chat-loading-dot-container">
        <div
          class="${t}--chat-loading-dot ${t}--chat-loading-dot-first"></div>
      </div>
      <div class="${t}--chat-loading-dot-container">
        <div
          class="${t}--chat-loading-dot ${t}--chat-loading-dot-second"></div>
      </div>
      <div class="${t}--chat-loading-dot-container">
        <div
          class="${t}--chat-loading-dot ${t}--chat-loading-dot-third"></div>
      </div>
    </div>
  </div>`}var y=Object.defineProperty,_=Object.getOwnPropertyDescriptor,P=(s,i,n,d)=>{for(var a=d>1?void 0:d?_(i,n):i,o=s.length-1,e;o>=0;o--)(e=s[o])&&(a=(d?e(i,n,a):e(a))||a);return d&&a&&y(i,n,a),a};const{stablePrefix:z}=g;let r=class extends l{render(){return $(this)}};r=P([h(`${z}-chat-loading`)],r);

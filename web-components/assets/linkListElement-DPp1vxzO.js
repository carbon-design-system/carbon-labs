import{n as f,t as L}from"./property-C_111YFZ.js";import{i as _,s as w,x as a}from"./lit-element-in3Y6axH.js";import{s as $}from"./settings-BQP9c3yA.js";import{r as p}from"./state-B7rdIQBm.js";import{s as k}from"./16-8RpxDDT2.js";import"./button-BVh405nz.js";import"./button-skeleton-CcPXcK4n.js";import"./link-CcXAq-Yo.js";import{s as y}from"./16-DE6QptpG.js";import{s as C}from"./16-DmMcOTp3.js";const R=_`:host(clabs-chat-link-list){display:block;overflow:hidden;box-sizing:border-box;inline-size:100%}:host(clabs-chat-link-list) .clabs--chat-link-list-header{color:var(--cds-text-secondary, #525252);font-size:12px;font-weight:400;letter-spacing:.3px;line-height:16px;padding-block-end:8px;text-align:start}@keyframes fade-in{0%{opacity:0}to{opacity:1}}:host(clabs-chat-link-list) .clabs--chat-link-list-container{overflow:hidden;transition:height .8s ease}:host(clabs-chat-link-list) .clabs--chat-link-list-item{display:flex;overflow:hidden;flex-direction:row;align-items:center;animation:fade-in .6s forwards;border-block-start:1px solid var(--cds-border-subtle-00, #e0e0e0);gap:8px;opacity:0;padding-block:6px;padding-inline-end:6px}:host(clabs-chat-link-list) .clabs--chat-link-list-item-sublink{position:relative;display:flex;inline-size:100%}:host(clabs-chat-link-list) .clabs--chat-link-list-item-sublink svg{position:absolute;inset-block-start:2px;inset-inline-end:4px}:host(clabs-chat-link-list) .clabs--chat-link-list-item-control{display:flex;overflow:hidden;flex-direction:row;align-items:center;animation:fade-in .6s forwards;border-block-start:1px solid var(--cds-border-subtle-00, #e0e0e0);gap:8px;opacity:0}:host(clabs-chat-link-list) .clabs--chat-link-list-item-text-sublink{display:flex;align-items:center;inline-size:100%}:host(clabs-chat-link-list) .clabs--chat-link-list-item-button::part(button){padding-inline-start:2px}:host(clabs-chat-link-list) .clabs--chat-link-list-item-text-sublink::part(link){display:flex;justify-content:space-between;inline-size:100%}:host(clabs-chat-link-list) .clabs--chat-link-list-item-button{padding:0}:host(clabs-chat-link-list) .clabs--chat-link-list-item svg{cursor:pointer}:host(clabs-chat-link-list) .clabs--chat-link-list-item-text{overflow:hidden;flex:1}`;var P=Object.defineProperty,r=(d,t,i,s)=>{for(var e=void 0,l=d.length-1,c;l>=0;l--)(c=d[l])&&(e=c(t,i,e)||e);return e&&P(t,i,e),e};const u=class u extends w{constructor(){super(...arguments),this.expanded=!1,this.maxItems=3,this.hideArrows=!0,this.disableRedirection=!1,this._linkList=[],this.trimmedList=[],this._renderLabel=t=>{let i;const s=this.customLabels||{};if(s)switch(t){case"link-list-view-all-button":i=s[t]||"View all";break;case"link-list-collapse-button":i=s[t]||"Collapse list";break;case"link-list-reference-title":i=s[t]||"References";break}return i||t}}firstUpdated(){this.content!==void 0&&(this._formatList(),this.requestUpdate())}updated(t){super.updated(t),t.has("content")&&this._formatList()}expandList(){this.expanded=!0}collapseList(){this.expanded=!1}_getSiteTitle(t){try{return t.split("/").slice(-1)[0].split(".")[0].replace(/_/g," ")}catch{return t}}_handleLinkFeedback(t){const i=t==null?void 0:t.target;if(i instanceof HTMLElement&&i.hasAttribute("data-index")){const s=i.getAttribute("data-index");if(s!==null&&s>=0&&s<this._linkList.length){const e=this._linkList[s],l=new CustomEvent("on-link-list-item-selected",{detail:{action:"LinkList.ts: link list item was clicked",selectedURL:e.url,selectedTitle:e.title,originalEvent:t},bubbles:!0,composed:!0});this.dispatchEvent(l)}}}_formatList(){if(this.content.indexOf("[")>-1){const t=this.content.split(","),i=new RegExp("\\[(.*?)\\]\\((.*?)\\)");this._linkList=t.map(s=>{const e=s.match(i);return e?{title:e[1],url:e[2]}:null}),this.trimmedList=this._linkList.slice(0,4)}else{const t=this.content.split(",");this._linkList=t.map(i=>({title:this._getSiteTitle(i),url:i})),this.trimmedList=this._linkList.slice(0,4)}}};u.styles=R;let n=u;r([f({type:String,attribute:"content"})],n.prototype,"content");r([p()],n.prototype,"expanded");r([p()],n.prototype,"maxItems");r([p()],n.prototype,"hideArrows");r([f({type:Boolean,attribute:"disable-redirection"})],n.prototype,"disableRedirection");r([p()],n.prototype,"_linkList");r([p()],n.prototype,"trimmedList");r([f({type:Object,attribute:"customLabels"})],n.prototype,"customLabels");/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const{stablePrefix:o}=$;function z(d){const{_linkList:t,expanded:i,expandList:s,collapseList:e,disableRedirection:l,maxItems:c,hideArrows:v,_handleLinkFeedback:x,_renderLabel:m}=d;return a`
    <div class="${o}--chat-link-list-header">
      ${m("link-list-reference-title")} (${t.length})
    </div>
    <div class="${o}--chat-link-list-container">
      ${t.map((b,h)=>h<c||i?a` <div class="${o}--chat-link-list-item">
              <div
                class="${o}--chat-link-list-item-text"
                @click="${x}">
                ${l?a`<cds-link data-index="${h}"
                      >${b.title}
                      ${k({slot:"icon"})}</cds-link
                    >`:a`
                      <cds-link
                        data-index="${h}"
                        id="${o}--chat-link-list-item-text-${h}"
                        target="_blank"
                        class="${o}--chat-link-list-item-text-sublink"
                        href="${b.url}"
                        >${b.title}
                        ${k({slot:"icon"})}</cds-link
                      >
                    `}
              </div>
              ${v?"":a`
                    <div @click="${x}">
                      ${l?a`<cds-link data-index="${h}" tabindex="-1"
                            >${k({slot:"icon"})}</cds-link
                          >`:a`
                            <cds-link
                              data-index="${h}"
                              target="_blank"
                              class="${o}--chat-link-list-item-text-sublink"
                              tabindex="-1"
                              href="${b.url}"
                              >${k({slot:"icon"})}</cds-link
                            >
                          `}
                    </div>
                  `}
            </div>`:a``)}
      ${t.length>c?a`<div class="${o}--chat-link-list-item-control">
            <div class="${o}--chat-link-list-item-text">
              <cds-button
                kind="ghost"
                class="${o}--chat-link-list-item-button"
                tooltip-text="${i?"Collapse":"View all"}"
                tooltip-position="right"
                tooltip-alignment="end"
                size="sm"
                @click="${i?e:s}">
                ${m(i?"link-list-collapse-button":"link-list-view-all-button")}
                ${i?C({slot:"icon"}):y({slot:"icon"})}</cds-button
              >
            </div>
          </div>`:a``}
    </div>
  `}var A=Object.defineProperty,E=Object.getOwnPropertyDescriptor,I=(d,t,i,s)=>{for(var e=s>1?void 0:s?E(t,i):t,l=d.length-1,c;l>=0;l--)(c=d[l])&&(e=(s?c(t,i,e):c(e))||e);return s&&e&&A(t,i,e),e};const{stablePrefix:T}=$;let g=class extends n{render(){return z(this)}};g=I([L(`${T}-chat-link-list`)],g);

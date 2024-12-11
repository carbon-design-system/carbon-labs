import{n as d,t as L}from"./property-C_111YFZ.js";import{i as P,s as A,x as o}from"./lit-element-in3Y6axH.js";import{s as S}from"./settings-BQP9c3yA.js";import{r as b}from"./state-B7rdIQBm.js";import{s as O}from"./tableElement-DhZd1VrC.js";import{b as U}from"./directive-Bp-AemGL.js";import{s as B}from"./spread-O99WNTpv.js";import"./button-BVh405nz.js";import"./button-skeleton-CcPXcK4n.js";import"./cardElement-BZgQJdZj.js";import{o as N}from"./unsafe-html-D-LwtoKn.js";import{s as k}from"./16-DE6QptpG.js";import{s as I}from"./16-DmMcOTp3.js";import"./tag-tOMjyvSB.js";import"./imageElement-CIW-N3Bx.js";const j=P`:host(clabs-chat-carousel){display:flex;overflow:hidden;background:none;inline-size:100%}:host(clabs-chat-carousel) .clabs--chat-carousel-container{display:flex;flex-direction:column;gap:6px;inline-size:var(--chat-carousel-slides-width, 248px)}:host(clabs-chat-carousel) .clabs--chat-carousel-length{block-size:16px;color:var(--cds-text-secondary, #525252);font-size:12px;padding-block-end:8px;text-align:start}:host(clabs-chat-carousel) .clabs--chat-carousel-slides{display:flex;overflow:hidden;flex-direction:row;flex-grow:1;gap:16px;min-block-size:0}:host(clabs-chat-carousel) .clabs--chat-carousel-slide{display:flex;overflow:hidden;flex:0 0 auto;align-items:center;justify-content:center;border-radius:8px;inline-size:248px}:host(clabs-chat-carousel) .clabs--chat-carousel-img{block-size:100%;inline-size:100%;object-fit:cover;object-position:center}:host(clabs-chat-carousel) .clabs--chat-carousel-controls{display:flex;align-items:center;justify-content:flex-end;block-size:32px;gap:8px;inline-size:100%}:host(clabs-chat-carousel) .clabs--chat-carousel-control-item{block-size:32px;font-size:14px;line-height:30px}:host(clabs-chat-carousel) .clabs--chat-carousel-control-item svg{color:var(--cds-text-secondary, #525252);fill:var(--cds-text-secondary, #525252)}`;var W=Object.defineProperty,g=(p,t,s,n)=>{for(var e=void 0,i=p.length-1,a;i>=0;i--)(a=p[i])&&(e=a(t,s,e)||e);return e&&W(t,s,e),e};const z=class z extends A{constructor(){super(...arguments),this.selectedSlide=0,this.contentWidth=248,this.contentHeight=248,this._itemsPerSlide=1,this._slideCounter=0,this._slideGapSize=16,this._maxSlideCounter=0,this._renderedSlideCounter=0}firstUpdated(){this.hasAttribute("elements")?(this._checkElements(),this._updateCarousel()):this.hasAttribute("content")&&this._buildCarousel(),this.hasAttribute("_carouselContent")&&this._updateCarousel(),this.resizeObserver=new ResizeObserver(async()=>{this._updateCarousel()}),this.resizeObserver.observe(this)}updated(t){super.updated(t),t.has("content")&&this._buildCarousel(),t.has("elements")&&this._checkElements(),t.has("contentWidth")&&this._buildCarousel(),t.has("_carouselContent")&&this._updateCarousel(),t.has("selectedSlide")&&this._carouselContent&&this._handleSlideSelection()}_updateCarousel(){if(this._carouselContent){if(this.parentElement instanceof HTMLElement){const s=this.clientWidth;this._itemsPerSlide=Math.max(Math.floor(s/(this.contentWidth+this._slideGapSize)),1),this.maxSlides&&(this._itemsPerSlide=Math.min(this._itemsPerSlide,this.maxSlides)),this.style.setProperty("--chat-carousel-slides-width",this._itemsPerSlide*(this.contentWidth+this._slideGapSize)+"px")}else this.style.setProperty("--chat-carousel-slides-width",this.contentWidth+"px");this._maxSlideCounter=Math.ceil(this._carouselContent.length/this._itemsPerSlide)-1;let t=Math.floor(this._slideCounter/this._itemsPerSlide)*this._itemsPerSlide;t=Math.min(t,this._carouselContent.length-this._itemsPerSlide),this._renderedSlideCounter=Math.ceil(t/this._itemsPerSlide)+1}}_checkElements(){this._carouselContent=this.elements.map(t=>({content:t.content,type:t.type?t.type:this._checkURLType(t.content)}))}_checkURLType(t){const s=new RegExp("\\.(png|jpg|jpeg|gif|svg|bmp|webp|ico|tiff|tif)$","i"),n=new RegExp("\\.(mp4|avi|flv|mkv|mov|webm|m4v|ogv)$","i"),e=new RegExp("\\.(pdf|doc|docx|csv|xls|xlsx|ppt|pptx|txt|rtf|xml|odt|zip|rar|tar|gz)$","i"),i=new RegExp("\\.(mp3|flac|wav|mpa|wma|midi|ogg)$","i");return s.test(t)?"img":n.test(t)?"video":i.test(t)?"audio":e.test(t)?"file":"url"}_buildCarousel(){try{const t=JSON.parse(this.content);this._carouselContent=t.map(s=>({content:s,type:this._checkURLType(s)}))}catch{if(this.content.endsWith(",")){const s=this.content.slice(0,-1)+"]";try{const n=JSON.parse(s);if(this._carouselContent||(this._carouselContent=[]),n.length>this._carouselContent.length){const e=n[n.length-1];this._carouselContent=[{content:e,type:this._checkURLType(e)},...this._carouselContent]}}catch{console.log("Carousel: failed to parse:"+(this.content.slice(0,-1)+"]"))}}}}_handleNextSlide(){this._slideCounter+this._itemsPerSlide<this._carouselContent.length&&(this._slideCounter+=this._itemsPerSlide),this._maxSlideCounter=Math.ceil(this._carouselContent.length/this._itemsPerSlide)-1,this._renderedSlideCounter=Math.floor(this._slideCounter/this._itemsPerSlide)+1,this._scrollSlideContainer(),this._notifyIndexChange()}_handlePreviousSlide(){this._slideCounter-this._itemsPerSlide>=0&&(this._slideCounter-=this._itemsPerSlide),this._maxSlideCounter=Math.ceil(this._carouselContent.length/this._itemsPerSlide)-1,this._renderedSlideCounter=Math.floor(this._slideCounter/this._itemsPerSlide)+1,this._scrollSlideContainer(),this._notifyIndexChange()}_handleSlideSelection(){this.selectedSlide>=0&&this.selectedSlide<=this._carouselContent.length&&(this._slideCounter=this.selectedSlide),this._renderedSlideCounter=Math.floor(this._slideCounter/this._itemsPerSlide)+1,this._scrollSlideContainer()}_notifyIndexChange(){const t=new CustomEvent("on-carousel-index-change",{detail:{action:"CAROUSEL: user changed the current slide",currentIndex:this._slideCounter},bubbles:!0,composed:!0});this.dispatchEvent(t)}_scrollSlideContainer(){var n;const t=(n=this.shadowRoot)==null?void 0:n.querySelector(".clabs--chat-carousel-slides"),s=this._slideCounter*(this.contentWidth+this._slideGapSize)*this._itemsPerSlide;setTimeout(function(){t==null||t.scrollTo({left:s,behavior:"smooth"})},100)}};z.styles=j;let f=z;g([d({type:String,attribute:"content",reflect:!0})],f.prototype,"content");g([d({type:Object,attribute:"elements",reflect:!0})],f.prototype,"elements");g([d({type:Number,attribute:"max-slides"})],f.prototype,"maxSlides");g([d({type:Number,attribute:"selected-slide"})],f.prototype,"selectedSlide");g([d({type:String,attribute:"content-width",reflect:!0})],f.prototype,"contentWidth");g([d({type:String,attribute:"content-height",reflect:!0})],f.prototype,"contentHeight");g([b()],f.prototype,"_carouselContent");g([b()],f.prototype,"_itemsPerSlide");g([b()],f.prototype,"_slideCounter");g([b()],f.prototype,"_slideGapSize");g([b()],f.prototype,"_maxSlideCounter");g([b()],f.prototype,"_renderedSlideCounter");const D=({children:p,...t}={})=>U`<svg focusable="false" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" fill="currentColor" ...="${B(t)}" aria-hidden="true" width="16" height="16" viewBox="0 0 16 16">${p}<path d="M5 8L10 3 10.7 3.7 6.4 8 10.7 12.3 10 13z"></path></svg>`,F=P`:host(clabs-chat-text){overflow:hidden;font-family:IBM Plex Sans,sans-serif;font-size:14px;font-style:normal;font-weight:400;letter-spacing:.16px;line-height:20px;word-break:break-word}:host(clabs-chat-text) .clabs--chat-text--float-right{display:flex;justify-content:flex-end}:host(clabs-chat-text) .clabs--chat-text-content{flex-grow:1;max-inline-size:100%}:host(clabs-chat-text) .clabs--chat-text-content-chevron-container{display:inline-block}:host(clabs-chat-text) .clabs--chat-text-content-paragraph{margin:0}:host(clabs-chat-text) .clabs--chat-text-content-chevron{display:inline-block;box-sizing:border-box;padding:0;border:1px solid var(--cds-border-subtle-01, #c6c6c6);border-radius:8px;margin:0;background:var(--cds-layer-accent-01, #e0e0e0);block-size:16px;cursor:pointer;inline-size:18px;margin-inline:1px;transition:border-color .15s linear;vertical-align:middle}@keyframes fade-in{0%{opacity:0}to{opacity:1}}:host(clabs-chat-text) .clabs--chat-text-fade-in{animation:fade-in .6s forwards;opacity:0}:host(clabs-chat-text) .clabs--chat-text-content-chevron:hover{border:1px solid var(--cds-focus, #0f62fe);cursor:pointer}:host(clabs-chat-text) .clabs--chat-text-content-chevron--focused{border:1px solid var(--cds-focus, #0f62fe)}:host(clabs-chat-text) .clabs--chat-text-content-chevron svg{fill:var(--cds-text-secondary, #525252);pointer-events:none}:host(clabs-chat-text) .clabs--chat-text-content-annotation{cursor:pointer;text-decoration:underline;text-decoration-color:var(--cds-text-secondary, #525252);text-decoration-style:dotted;text-decoration-thickness:2px;text-underline-offset:3px;vertical-align:bottom}:host(clabs-chat-text) .clabs--chat-text-highlighted{background:var(--chat-text-element-highlight-color, var(--cds-link-inverse, #78a9ff));text-decoration:none}:host(clabs-chat-text) .clabs--chat-text-highlighted-active{background:var(--chat-text-element-highlight-color, var(--cds-link-inverse-hover, #a6c8ff))}:host(clabs-chat-text) .clabs--chat-text-content-annotation-element{overflow:hidden;inline-size:100%;max-block-size:var(--chat-text-content-annotation-element-height);max-inline-size:100%;padding-block:8px;transition:max-height .3s linear}:host(clabs-chat-text) .clabs--chat-text-content-summarization-element{overflow:hidden;inline-size:100%;max-block-size:var(--chat-text-content-annotation-element-height);max-inline-size:100%;padding-block:8px;transition:max-height .3s linear}:host(clabs-chat-text) .clabs--chat-text-content-summarization-element-hidden{display:none}:host(clabs-chat-text) .clabs--chat-text-content-link{cursor:pointer;text-decoration:underline;text-decoration-color:var(--cds-text-secondary, #525252);text-decoration-style:dotted;text-decoration-thickness:2px;text-underline-offset:3px;vertical-align:bottom}:host(clabs-chat-text) .clabs--chat-text-content-code{border:1px solid var(--cds-border-subtle-01, #c6c6c6);border-radius:4px;background:var(--cds-layer-01, #f4f4f4);color:var(--cds-text-primary, #161616);font-family:IBM Plex Mono,monospace;font-size:12px;letter-spacing:.64px;line-height:20px;vertical-align:bottom;word-break:keep-all}:host(clabs-chat-text) .clabs--chat-text--float-left{display:flex;justify-content:flex-start}`;var G=Object.defineProperty,r=(p,t,s,n)=>{for(var e=void 0,i=p.length-1,a;i>=0;i--)(a=p[i])&&(e=a(t,s,e)||e);return e&&G(t,s,e),e};const E=class E extends A{constructor(){super(...arguments),this.enableHtmlRendering=!1,this.disableNewLines=!1,this._textElements=[],this.textSubElements=[],this._showSummarization=!1,this._translationRegistry=[],this._animationList=[]}firstUpdated(){var t;((t=this.textSubElements)==null?void 0:t.length)>1?this._textElements=this.textSubElements:this.content&&this._formatText(),this.hasAttribute("enable-summarization")&&(this.disableChevrons=!0),this.hasAttribute("text-highlight-color")&&this.style.setProperty("--chat-text-element-highlight-color",this.textHighlightColor),this.style.setProperty("--chat-text-content-annotation-element-height","0px")}updated(t){super.updated(t),t.has("content")&&!(this.textSubElements.length>0)&&this._formatText()}_updateHighlightTarget(t){var n;const s=(n=t==null?void 0:t.detail)==null?void 0:n.currentIndex;if(s>=0){const e=this._translationRegistry.find(i=>i.annotationIndex===s+1);if(this._textElements.forEach(i=>{i.active=!1}),e||e===0){const i=e.subElementIndex;typeof i=="number"&&(this._textElements[i-1].active=!0)}this.requestUpdate()}}_toggleSummarization(){if(this._showSummarization=!this._showSummarization,!this._showSummarization)this._textElements.forEach(t=>{t.active=!1});else{this.selectedAnnotationIndex||(this.selectedAnnotationIndex=0);const t=this.selectedAnnotationIndex+1,s=this._translationRegistry.find(n=>n.annotationIndex===t);if(s){const n=s.subElementIndex;typeof n=="number"&&(this._textElements[n-1].active=!0,setTimeout(()=>{this.style.setProperty("--chat-text-content-annotation-element-height","400px")},20))}}}_handleAnnotationClick(t){var u,x;const s=(t==null?void 0:t.originalTarget)||(t==null?void 0:t.target)||(t==null?void 0:t.srcElement),n=(u=s==null?void 0:s.dataset)==null?void 0:u.source;this.style.setProperty("--chat-text-content-annotation-element-height","0px");const e=(x=s==null?void 0:s.dataset)==null?void 0:x.index,i={originalEvent:t,annotationContent:n,indexInElementsArray:e,elementsArray:this._textElements};if(e){this._textElements.forEach((_,$)=>{$!==parseInt(e)&&(_.active=!1)}),this._textElements[parseInt(e)].active=!this._textElements[parseInt(e)].active,this._textElements[parseInt(e)].active?(i.action="annotation popup closed",this._showSummarization=!0):(i.action="annotation popup opened",this._showSummarization=!1),i.isOpened=this._textElements[parseInt(e)].active,i.textContent=this._textElements[parseInt(e)].text,this._textElements[parseInt(e)].active?n?(this._annotationURLs=this._arrangeSources(n),setTimeout(()=>{this.style.setProperty("--chat-text-content-annotation-element-height","400px")},20),this._annotationIndex=parseInt(e)):(this._annotationURLs=null,this._annotationIndex=null):(this._annotationURLs=null,this._annotationIndex=null);const m=this._translationRegistry.find(_=>_.subElementIndex===parseInt(e)+1);typeof(m==null?void 0:m.annotationIndex)=="number"&&m&&(this.selectedAnnotationIndex=m.annotationIndex-1,this.requestUpdate())}const a=new CustomEvent("on-text-annotation-click",{detail:i,bubbles:!0,composed:!0});this.dispatchEvent(a)}_arrangeSources(t){return t.split(",")}_capitalizeText(t){return t.split(new RegExp("(?<=[.!?]\\s)|(?<=\\n)","g")).map(e=>e.trimStart().charAt(0).toUpperCase()+e.trimStart().slice(1)).join("")}_formatText(){const t=new RegExp("(\\[([^\\]]+)\\]\\(([^)]+)\\))|([^\\[]+)","g"),s=[],n=[];let e;const a=this.content.trim().split(`
`);for(const u of a){for(;(e=t.exec(u))!=null;)if(e[1])n.push({text:e[2],type:"annotation",content:e[3],active:!1}),s.push(e[3]),this._translationRegistry.push({annotationIndex:s.length,subElementIndex:n.length});else if(e[4]){const m=this._checkForHTML(e[4])?"html":"default",_=e[4];n.push({text:this.capitalize?this._capitalizeText(_):_,type:m,active:!1,content:""})}if(!this.disableNewLines&&!this.streaming){if(n.length>1&&n[n.length-1]){const x=n[n.length-1];if((x==null?void 0:x.type)==="new-line")continue}n.push({text:"",type:"new-line",active:!1,content:""})}}this._annotationList=s,this.streaming?this._animateFadeIn(n):(this._annotationList.length>0,this._textElements=n)}_animateFadeIn(t){const s=[];for(const n of t)if(n.type==="default"){const e=n.text.split(" ");for(const i of e)s.push({text:i+" ",type:"default",content:"",active:!1})}else s.push(n);this._textElements=s}_checkForHTML(t){return new RegExp("<[^>]+>","g").test(t)}_formatTextOld(){const t=[],s=new RegExp("\\[([^\\]]+)\\]\\(((?:[^)(]+|\\([^)]+\\))*)\\)","g"),n=this.content,e=this.disableNewLines?[n]:n.split(`
`);for(let i=0;i<e.length;i++){let a;const u=e[i];let x=0;for(;(a=s.exec(u))!==null;){if(a.index>x){const _=u.slice(x,a.index);t.push({text:this.capitalize?this._capitalizeText(_):_,type:"default",active:!1,content:""})}const m=new RegExp("^https?:\\/\\/\\S+$");t.push({text:a[1],type:m.test(a[2])?"link":"annotation",content:a[2],active:!1}),x=s.lastIndex}if(x<u.length){const m=u.slice(x);t.push({text:this.capitalize?this._capitalizeText(m):m,type:"default",content:"",active:!1})}}this._textElements=t}};E.styles=F;let l=E;r([d({type:String,attribute:"content",reflect:!0})],l.prototype,"content");r([d({type:Boolean,attribute:"align-right"})],l.prototype,"alignRight");r([d({type:Boolean,attribute:"capitalize"})],l.prototype,"capitalize");r([d({type:String,attribute:"text-highlight-color"})],l.prototype,"textHighlightColor");r([d({type:Boolean,attribute:"enable-annotations"})],l.prototype,"enableAnnotations");r([d({type:Boolean,attribute:"enable-summarization"})],l.prototype,"enableSummarization");r([d({type:Boolean,attribute:"enable-html-rendering"})],l.prototype,"enableHtmlRendering");r([d({type:Boolean,attribute:"enable-text-highlighting"})],l.prototype,"enableTextHighlighting");r([d({type:Boolean,attribute:"disable-new-lines"})],l.prototype,"disableNewLines");r([d({type:Boolean,attribute:"enable-complex-feedback"})],l.prototype,"enableComplexFeedback");r([d({type:Boolean,attribute:"disable-chevrons"})],l.prototype,"disableChevrons");r([b()],l.prototype,"_textElements");r([d({type:Array,attribute:"textSubElements"})],l.prototype,"textSubElements");r([b()],l.prototype,"_annotationURLs");r([b()],l.prototype,"_annotationList");r([b()],l.prototype,"_annotationIndex");r([b()],l.prototype,"_showSummarization");r([b()],l.prototype,"_translationRegistry");r([b()],l.prototype,"selectedAnnotationIndex");r([d({type:Boolean,attribute:"streaming"})],l.prototype,"streaming");r([b()],l.prototype,"_animationList");/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const{stablePrefix:c}=S;function J(p){const{_textElements:t,alignRight:s,enableHtmlRendering:n,enableSummarization:e,_updateHighlightTarget:i,_annotationURLs:a,_annotationIndex:u,_annotationList:x,_handleAnnotationClick:m,enableTextHighlighting:_,selectedAnnotationIndex:$,disableChevrons:M,_toggleSummarization:H,streaming:C,_showSummarization:w}=p;return o`<div
    class="${c}--chat-text"
    role="textbox"
    aria-readonly="true"
    tabindex="0"
    aria-label="text block">
    <div
      class="${c}--chat-text--float-${s?"right":"left"}">
      <div class="${c}--chat-text-content">
        ${t.map((h,v)=>o` ${h.type==="annotation"||h.type==="link"?o`
                  <span
                    class="${c}--chat-text-content-${h.type} ${C?c+"--chat-text-fade-in":""} ${_?c+"--chat-text-highlighted"+(h.active?"-active":""):""} "
                    data-index="${v}"
                    data-source="${h.content}"
                    @click="${m}">
                    ${h.text}
                  </span>
                  ${M?o``:o`
                        <span
                          class="${c}--chat-text-content-chevron-container"
                          role="button"
                          aria-label="Show link as card below">
                          <span
                            class="${c}--chat-text-content-chevron ${v===u?c+"--chat-text-content-chevron--focused":""}"
                            data-index="${v}"
                            data-source="${h.content}"
                            @click="${m}">
                            ${h.active?o` ${I({slot:"icon"})} `:o` ${k({slot:"icon"})} `}
                          </span>
                        </span>
                      `}
                  ${v===u&&!e?o`
                        <slot name="custom-highlight-component">
                          <div
                            class="${c}--chat-text-content-annotation-element">
                            ${a.length>1?o`
                                  <clabs-chat-carousel
                                    content=${JSON.stringify(a)}>
                                  </clabs-chat-carousel>
                                `:o`
                                  <clabs-chat-card
                                    type="url"
                                    content="${a[0]}">
                                  </clabs-chat-card>
                                `}
                          </div>
                        </slot>
                      `:o``}
                `:s?o` <span
                  class="${C?c+"--chat-text-fade-in":""}">
                  ${h.text}</span
                >`:n||h.type==="html"?o` <span
                  class="${c}--chat-text-content-${h.type}"
                  >${N(h.text)}</span
                >`:h.type==="new-line"?o`<br />`:h.type==="code"?o`
                  <span
                    class="${c}--chat-text-content-${h.type}"
                    >${h.text}</span
                  >
                `:h.type==="default"?o` <span
                  class="${C?c+"--chat-text-fade-in":""}"
                  >${h.text}</span
                >`:o`<p class="${c}--chat-text-content-paragraph">
                  ${h.text}
                </p>`}`)}
        ${e?o`
              <span class="${c}--chat-text-content-chevron-container">
                <span
                  class="${c}--chat-text-content-chevron ${w?c+"--chat-text-content-chevron--focused":""}"
                  @click="${H}"
                  role="button"
                  aria-label="show all links as a carousel below">
                  ${w?o` ${I({slot:"icon"})} `:o` ${k({slot:"icon"})} `}
                </span>
              </span>
              <div
                class="${c}--chat-text-content-summarization-element ${w?"":c+"--chat-text-content-summarization-element-hidden"}">
                <slot name="custom-highlight-component">
                  <clabs-chat-carousel
                    selected-slide="${$}"
                    max-slides="${1}"
                    @on-carousel-index-change=${i}
                    content=${JSON.stringify(x)}>
                  </clabs-chat-carousel>
                </slot>
              </div>
            `:o``}
      </div>
    </div>
  </div>`}var q=Object.defineProperty,Y=Object.getOwnPropertyDescriptor,K=(p,t,s,n)=>{for(var e=n>1?void 0:n?Y(t,s):t,i=p.length-1,a;i>=0;i--)(a=p[i])&&(e=(n?a(t,s,e):a(e))||e);return n&&e&&q(t,s,e),e};const{stablePrefix:Q}=S;let R=class extends l{render(){return J(this)}};R=K([L(`${Q}-chat-text`)],R);/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const{stablePrefix:y}=S;function V(p){const{_carouselContent:t,_slideCounter:s,_maxSlideCounter:n,_handlePreviousSlide:e,_handleNextSlide:i,_renderedSlideCounter:a}=p;return o`<div class="${y}--chat-carousel-container">
    ${t?o` <div class="${y}--chat-carousel-length">
            ${t.length}
            ${t.length===1?"item":"items"}
          </div>
          <div class="${y}--chat-carousel-slides">
            ${t.map(u=>u.type=="img"?o` <div class="${y}--chat-carousel-slide">
                    <clabs-chat-image content="${u.content}">
                    </clabs-chat-image>
                  </div>`:o`
                  <div class="${y}--chat-carousel-slide">
                    <clabs-chat-card content="${u.content}"" type="${u.type}">
                    </clabs-chat-card>
                  </div>
                `)}
          </div>
          <div class="${y}--chat-carousel-controls">
            ${n>1?o`
                  <div class="${y}--chat-carousel-control-item">
                    <cds-button
                      kind="ghost"
                      size="sm"
                      aria-label="Previous Slide"
                      role="button"
                      @click="${e}"
                      ?disabled="${s===0}">
                      ${D({slot:"icon"})}
                    </cds-button>
                  </div>
                  <div class="${y}--chat-carousel-control-item">
                    ${a+" / "+n}
                  </div>
                  <div class="${y}--chat-carousel-control-item">
                    <cds-button
                      kind="ghost"
                      aria-label="Next slide"
                      role="button"
                      size="sm"
                      @click="${i}"
                      ?disabled="${a===n}">
                      ${O({slot:"icon"})}
                    </cds-button>
                  </div>
                `:o``}
          </div>`:o``}
  </div>`}var X=Object.defineProperty,Z=Object.getOwnPropertyDescriptor,tt=(p,t,s,n)=>{for(var e=n>1?void 0:n?Z(t,s):t,i=p.length-1,a;i>=0;i--)(a=p[i])&&(e=(n?a(t,s,e):a(e))||e);return n&&e&&X(t,s,e),e};const{stablePrefix:et}=S;let T=class extends f{render(){return V(this)}};T=tt([L(`${et}-chat-carousel`)],T);

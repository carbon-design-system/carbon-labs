import{a as e,d as t,n,t as r}from"./lit-Cyvtm9u7.js";import{i,r as a,t as o}from"./decorate-C5-A1pC1.js";import{t as s}from"./settings-1qNJcTHq.js";import{t as c}from"./decorateMetadata-D0fK5b4i.js";import{n as l,t as u}from"./decorate-Bq25ejlT.js";import{t as d}from"./class-map-36Y2Puww.js";import"./icon-button-zIdz4s17.js";import{n as f,t as p}from"./icon-loader-mIZkTycN.js";import{t as m}from"./16-C8UASvz6.js";import"./link-Cwppgp_V.js";import{t as h}from"./16-X6ocDkcV.js";import{n as g,r as _,t as v}from"./16-DzcEHgwL.js";var y=t`:host(clabs-checklist){display:block}:host(clabs-checklist) .clabs--checklist__toggle{block-size:2rem;margin-block-start:-.5rem;margin-inline:auto -.5rem}:host(clabs-checklist) cds-icon-button::part(button):focus{box-shadow:none;outline:2px solid var(--cds-focus, #0f62fe)}:host(clabs-checklist-item){display:flex;margin-block-end:.5rem}:host(clabs-checklist-item:last-of-type){margin-block-end:0}:host(clabs-checklist-group){display:block;padding:1rem;border-block-start:1px solid var(--cds-border-subtle-01, #c6c6c6)}:host(clabs-checklist-group:first-of-type){border-block-start:none}.clabs--checklist__header{display:flex;padding:1rem;background-color:var(--cds-layer-01, #f4f4f4);border-block-end:1px solid var(--cds-border-subtle-01, #c6c6c6);gap:.5rem}.clabs--checklist__titles{display:flex;flex-direction:column;justify-content:center}.clabs--checklist__title{font-size:var(--cds-productive-heading-02-font-size, 1rem);font-weight:var(--cds-productive-heading-02-font-weight, 600);line-height:var(--cds-productive-heading-02-line-height, 1.375);letter-spacing:var(--cds-productive-heading-02-letter-spacing, 0);margin:0}.clabs--checklist__chart-label{font-size:var(--cds-label-01-font-size, .75rem);font-weight:var(--cds-label-01-font-weight, 400);line-height:var(--cds-label-01-line-height, 1.33333);letter-spacing:var(--cds-label-01-letter-spacing, .32px);margin:0;color:var(--cds-text-secondary, #525252)}.clabs--checklist__title+.clabs--checklist__chart-label{margin-block-start:.125rem}.clabs--checklist__chevron{color:var(--cds-text-primary, #161616);transform:rotate(0);transition:all .11s cubic-bezier(.2,0,.38,.9)}@media(prefers-reduced-motion:reduce){.clabs--checklist__chevron{transition:none}}.clabs--checklist__closed .clabs--checklist__chevron{transform:rotate(-180deg)}.clabs--checklist__content-outer{overflow:hidden}.clabs--checklist__content-inner{background-color:var(--cds-layer-01, #f4f4f4);block-size:100%;transform:translate(0);transition:all .11s cubic-bezier(.2,0,.38,.9)}@media(prefers-reduced-motion:reduce){.clabs--checklist__content-inner{transition:none}}.clabs--checklist__closed .clabs--checklist__content-inner{block-size:0;transform:translateY(-100%)}.clabs--checklist__chart{position:relative;align-self:center;border-radius:50%;background-image:conic-gradient(#a56eff var(--clabs-num-degrees, 0deg),#e0e0e0 var(--clabs-num-degrees, 0deg) 360deg);block-size:2.5rem;inline-size:2.5rem;min-inline-size:2.5rem}.clabs--checklist__chart:after{position:absolute;border-radius:50%;background-color:var(--cds-layer-01, #f4f4f4);block-size:2rem;content:"";inline-size:2rem;inset-block-start:.25rem;inset-inline-start:.25rem}.clabs--checklist__list-title{font-size:var(--cds-body-short-01-font-size, .875rem);font-weight:var(--cds-body-short-01-font-weight, 400);line-height:var(--cds-body-short-01-line-height, 1.28572);letter-spacing:var(--cds-body-short-01-letter-spacing, .16px);display:-webkit-box;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:2;text-overflow:ellipsis;margin:0 0 .5rem}.clabs--checklist__list{padding:0;list-style:none}.clabs--checklist__icon{margin:.0625rem .5rem 0 0;color:var(--cds-icon-primary, #161616)}.clabs--checklist__icon--checked,.clabs--checklist__icon--indeterminate{color:var(--cds-interactive, #0f62fe)}.clabs--checklist__icon--error{color:var(--cds-support-error, #da1e28)}.clabs--checklist__icon--disabled{color:var(--cds-icon-disabled, rgba(22, 22, 22, .25))}.clabs--checklist__label{font-size:var(--cds-body-short-01-font-size, .875rem);font-weight:var(--cds-body-short-01-font-weight, 400);line-height:var(--cds-body-short-01-line-height, 1.28572);letter-spacing:var(--cds-body-short-01-letter-spacing, .16px);display:-webkit-box;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:2;text-overflow:ellipsis}.clabs--checklist__label--disabled{color:var(--cds-text-disabled, rgba(22, 22, 22, .25))}.clabs--checklist__label--clickable{color:var(--cds-link-primary, #0f62fe);cursor:pointer}.clabs--checklist__label--clickable:hover{color:var(--cds-link-primary-hover, #0043ce);text-decoration:underline}.clabs--checklist__footer{padding:.5rem 1rem;border-block-start:1px solid var(--cds-border-subtle-01, #c6c6c6)}.clabs--checklist__footer:empty{display:none}`,{stablePrefix:b}=s,x=`${b}--checklist__chart`,S=(e,t,n)=>{if(!(isNaN(e)||isNaN(t)||isNaN(n)))return Math.min(Math.max(e,t),n)},C=class extends r{constructor(...e){super(...e),this.value=0}connectedCallback(){super.connectedCallback(),this.classList.add(`${x}`),this._updateChart(this.value)}updated(e){e.has(`value`)&&this._updateChart(this.value)}_updateChart(e){let t=S(e*360,0,360);this.style.setProperty(`--${b}-num-degrees`,`${t??0}deg`)}render(){return n}static{this.styles=y}};o([a({type:Number}),c(`design:type`,Object)],C.prototype,`value`,void 0),C=o([i(`${b}-checklist-chart`)],C);var w=class extends r{constructor(...e){super(...e),this.size=16,this.ariaLabel=null}render(){let{icon:t,size:n,class:r,ariaLabel:i}=this;return t?f(t)({class:r||``,"aria-label":i||``,"aria-hidden":i?`false`:`true`,width:n,height:n}):e`<slot></slot>`}};u([a({type:Object})],w.prototype,`icon`,void 0),u([a({type:Number})],w.prototype,`size`,void 0),u([a({type:String})],w.prototype,`class`,void 0),u([a({type:String,attribute:`aria-label`})],w.prototype,`ariaLabel`,void 0),w=u([l(`cds-icon`)],w);var T=function(e){return e.unchecked=`unchecked`,e.indeterminate=`indeterminate`,e.checked=`checked`,e.disabled=`disabled`,e.error=`error`,e}({}),E=function(e){return e.NotStarted=`not started`,e.InProgress=`in progress`,e.Completed=`completed`,e.Error=`error`,e.Disabled=`disabled`,e}({}),{stablePrefix:D}=s,O=`${D}--checklist__icon`,k=class extends r{constructor(...e){super(...e),this.kind=T.unchecked}render(){let t=this.kind===T.checked?h:this.kind===T.indeterminate?g:this.kind===T.error?v:_,n=d({[`${O}`]:!0,[`${O}--${this.kind}`]:!0});return e`
      <span class="${n}">
        <cds-icon .icon=${t} size="16" ariaLabel=${this.kind}></cds-icon>
      </span>
    `}static{this.styles=y}};o([a({type:String}),c(`design:type`,String)],k.prototype,`kind`,void 0),k=o([i(`${D}-checklist-icon`)],k);var{stablePrefix:A}=s,j=`${A}--checklist`,M=class extends r{constructor(...e){super(...e),this.open=!1,this.disableToggle=!1}_onViewAll(e){e.stopPropagation(),this.dispatchEvent(new CustomEvent(this.constructor.checklistViewAll,{bubbles:!0,cancelable:!0,composed:!0,detail:{triggeredBy:e.target}}))}_onViewAllKeyDown(e){(e.key===`Enter`||e.key===` `)&&this._onViewAll(e)}_onToggle(e){this.open=!this.open,e.stopPropagation(),this.dispatchEvent(new CustomEvent(this.constructor.checklistToggle,{bubbles:!0,cancelable:!0,composed:!0,detail:{triggeredBy:e.target}}))}render(){let{open:t,chartLabel:n,chartValue:r,title:i,disableToggle:a,toggleLabel:o,toggleLabelAlign:s,toggleAriaLabel:c,viewAllLabel:l}=this,u=d({[`${j}`]:!0,[`${j}__closed`]:!t});return e`
      <aside class=${u} aria-label="Checklist">
        <header class="${j}__header">
          <slot name="checklist-header">
            <slot name="header-chart">
              ${r===void 0?``:e`<clabs-checklist-chart
                    value=${r}></clabs-checklist-chart>`}
            </slot>
            <div class="${j}__titles">
              <slot name="header-title">
                ${i?e`<h2 class="${j}__title">${i}</h2>`:``}
              </slot>
              <slot name="header-chartLabel">
                ${n?e`<p class="${j}__chart-label">
                      ${n}
                    </p>`:``}
              </slot>
            </div>
          </slot>

          ${a?``:e`<cds-icon-button
                kind="ghost"
                size="sm"
                align=${s??`top`}
                aria-label=${c??``}
                class="${j}__toggle"
                @click=${this._onToggle}>
                ${p(m,{slot:`icon`,class:`${j}__chevron`})}
                <span slot="tooltip-content">${o}</span>
              </cds-icon-button>`}
        </header>

        <div class="${j}__content-outer">
          <div class="${j}__content-inner">
            <slot></slot>
            <div class="${j}__footer">
              <slot name="checklist-footer">
                ${l?e`<cds-link
                      role="link"
                      @click=${this._onViewAll}
                      @keydown=${this._onViewAllKeyDown}>
                      ${l}
                    </cds-link>`:``}
              </slot>
            </div>
          </div>
        </div>
      </aside>
    `}static get checklistViewAll(){return`${A}-checklist-view-all`}static get checklistToggle(){return`${A}-checklist-toggle`}static{this.styles=y}};o([a({type:Boolean,reflect:!0}),c(`design:type`,Object)],M.prototype,`open`,void 0),o([a({type:String}),c(`design:type`,Object)],M.prototype,`title`,void 0),o([a({type:String,attribute:`chart-label`}),c(`design:type`,Object)],M.prototype,`chartLabel`,void 0),o([a({type:Number,attribute:`chart-value`}),c(`design:type`,Object)],M.prototype,`chartValue`,void 0),o([a({type:Boolean,attribute:`disable-toggle`}),c(`design:type`,Object)],M.prototype,`disableToggle`,void 0),o([a({type:String,attribute:`toggle-label`}),c(`design:type`,Object)],M.prototype,`toggleLabel`,void 0),o([a({type:String,attribute:`toggle-label-align`}),c(`design:type`,Object)],M.prototype,`toggleLabelAlign`,void 0),o([a({type:String,attribute:`toggle-aria-label`}),c(`design:type`,Object)],M.prototype,`toggleAriaLabel`,void 0),o([a({type:String,attribute:`view-all-label`}),c(`design:type`,Object)],M.prototype,`viewAllLabel`,void 0),M=o([i(`${A}-checklist`)],M);var{stablePrefix:N}=s,P=class extends r{firstUpdated(){this.classList.add(`${N}--checklist__list-group`)}render(){let{title:t}=this;return e`
      ${t?e`<h3 title=${t} class="${N}--checklist__list-title">
            ${t}
          </h3>`:``}
      <ol class="${N}--checklist__list">
        <slot></slot>
      </ol>
    `}static{this.styles=y}};o([a(),c(`design:type`,Object)],P.prototype,`title`,void 0),P=o([i(`${N}-checklist-group`)],P);var{stablePrefix:F}=s,I=class extends r{constructor(...e){super(...e),this.clickable=!1}_handleClick(e){let t=e.target;e.stopPropagation(),this.dispatchEvent(new CustomEvent(this.constructor.checklistItemClicked,{bubbles:!0,cancelable:!0,composed:!0,detail:{triggeredBy:t}}))}_handleKeyDown(e){(e.key===`Enter`||e.key===` `)&&this._handleClick(e)}_mapStatusToKind(e){switch(e){case E.NotStarted:return T.unchecked;case E.InProgress:return T.indeterminate;case E.Completed:return T.checked;case E.Error:return T.error;case E.Disabled:return T.disabled;default:return T.error}}firstUpdated(){this.setAttribute(`role`,`listitem`),this.classList.add(`${F}--checklist__list-item`)}render(){let{clickable:t,label:n,status:r}=this,i=this._mapStatusToKind(r),a=d({[`${F}--checklist__label`]:!0,[`${F}--checklist__label--clickable`]:t,[`${F}--checklist__label--disabled`]:r===E.Disabled});return e`
      <slot name="icon">
        <clabs-checklist-icon kind="${i}"></clabs-checklist-icon>
      </slot>
      <slot name="content">
        <div
          class="${a}"
          title=${n??``}
          role=${t?`link`:``}
          @click=${t?this._handleClick:void 0}
          @keydown=${t?this._handleKeyDown:void 0}
          tabindex=${t?0:-1}>
          ${n}
        </div>
      </slot>
    `}static get checklistItemClicked(){return`${F}-checklist-item-clicked`}static{this.styles=y}};o([a(),c(`design:type`,Object)],I.prototype,`label`,void 0),o([a(),c(`design:type`,Object)],I.prototype,`status`,void 0),o([a({type:Boolean}),c(`design:type`,Object)],I.prototype,`clickable`,void 0),I=o([i(`${F}-checklist-item`)],I);var{action:L}=__STORYBOOK_MODULE_ACTIONS__,R={title:`Components/Checklist`,component:`clabs-checklist`,parameters:{layout:`padded`}},z={title:`Checklist header`,chartLabel:`15% complete`,chartValue:.15,groupTitle:`Section label`,toggleLabel:`Toggle`,toggleLabelAlign:`top`,toggleAriaLabel:`Checklist toggle`,viewAllLabel:`View all (10)`},B={title:{control:`text`,description:`Main heading of the checklist.`},chartLabel:{control:`text`,description:`Label next to the progress chart.`},chartValue:{control:{type:`number`,min:0,max:1,step:.01},description:`Progress value between 0 and 1.`},groupTitle:{control:`text`,description:`Section group heading.`},toggleLabel:{control:`text`,description:`Tooltip text for the toggle button.`},toggleAriaLabel:{control:`text`,description:`Accessible label for the toggle button.`},viewAllLabel:{control:`text`,description:`Label for the "View all" footer link.`}},V=t=>{let{title:n,chartLabel:r,chartValue:i,groupTitle:a,toggleLabel:o,toggleLabelAlign:s,toggleAriaLabel:c,viewAllLabel:l}=t;return e`
    <div style="max-inline-size: 20rem; min-inline-size: 20rem;">
      <clabs-checklist
        title=${n}
        chart-label=${r}
        chart-value=${i}
        toggle-label=${o}
        toggle-label-align=${s}
        toggle-aria-label=${c}
        open
        view-all-label=${l}
        @clabs-checklist-view-all=${L(`clabs-checklist-view-all`)}
        @clabs-checklist-toggle=${L(`clabs-checklist-toggle`)}>
        <clabs-checklist-group title=${a}>
          <clabs-checklist-item
            label="Task name"
            status="completed"></clabs-checklist-item>
          <clabs-checklist-item
            label="Task name"
            status="error"
            ?clickable=${!0}
            @clabs-checklist-item-clicked=${L(`clabs-checklist-item-clicked`)}></clabs-checklist-item>
          <clabs-checklist-item
            label="Task name"
            status="in progress"
            ?clickable=${!0}
            @clabs-checklist-item-clicked=${L(`clabs-checklist-item-clicked`)}></clabs-checklist-item>
          <clabs-checklist-item
            label="Task name"
            status="not started"
            ?clickable=${!0}
            @clabs-checklist-item-clicked=${L(`clabs-checklist-item-clicked`)}></clabs-checklist-item>
          <clabs-checklist-item
            label="Task name"
            status="disabled"></clabs-checklist-item>
        </clabs-checklist-group>
      </clabs-checklist>
    </div>
  `},H=t=>{let{toggleLabel:n,toggleLabelAlign:r,toggleAriaLabel:i,viewAllLabel:a}=t;return e`
    <div style="max-inline-size: 20rem; min-inline-size: 20rem;">
      <clabs-checklist
        title="All task states"
        toggle-label=${n}
        toggle-label-align=${r}
        toggle-aria-label=${i}
        view-all-label=${a}
        @clabs-checklist-view-all=${L(`clabs-checklist-view-all`)}
        open>
        <clabs-checklist-group title="Not started / In progress / Completed">
          <clabs-checklist-item
            label="Not started"
            status="not started"></clabs-checklist-item>
          <clabs-checklist-item
            label="In progress (clickable)"
            status="in progress"
            ?clickable=${!0}
            @clabs-checklist-item-clicked=${L(`clabs-checklist-item-clicked`)}></clabs-checklist-item>
          <clabs-checklist-item
            label="Completed"
            status="completed"></clabs-checklist-item>
        </clabs-checklist-group>
        <clabs-checklist-group title="Disabled / Error">
          <clabs-checklist-item
            label="Disabled"
            status="disabled"></clabs-checklist-item>
          <clabs-checklist-item
            label="Error (clickable)"
            status="error"
            ?clickable=${!0}
            @clabs-checklist-item-clicked=${L(`clabs-checklist-item-clicked`)}></clabs-checklist-item>
        </clabs-checklist-group>
      </clabs-checklist>
    </div>
  `},U={args:z,argTypes:B,render:V},W={args:z,argTypes:B,render:H};U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  args: sharedArgs,
  argTypes: sharedArgTypes,
  render: renderDefault
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  args: sharedArgs,
  argTypes: sharedArgTypes,
  render: renderTaskStates
}`,...W.parameters?.docs?.source}}};var G=[`Default`,`TaskStates`];export{U as Default,W as TaskStates,G as __namedExportsOrder,R as default};